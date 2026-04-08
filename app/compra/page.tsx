"use client";
import { useProductStore } from "../_zustand/store";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchNextApi } from "@/lib/nextApiOrigin";
import {
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaCreditCard,
  FaLock,
  FaTruck,
  FaStore,
  FaSearchLocation,
} from "react-icons/fa";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { ConfirmModal } from "@/components/ConfirmModal";

type DeliveryOption = "entrega" | "retirada";

const CheckoutPage = () => {
  const { settings: siteSettings } = useSiteSettings();
  const checkoutMode =
    siteSettings.checkoutMode === "delivery_only" ||
    siteSettings.checkoutMode === "pickup_only"
      ? siteSettings.checkoutMode
      : siteSettings.deliveryEnabled === false
        ? "pickup_only"
        : "delivery_and_pickup";
  const allowDelivery =
    checkoutMode === "delivery_and_pickup" || checkoutMode === "delivery_only";
  const allowPickup =
    checkoutMode === "delivery_and_pickup" || checkoutMode === "pickup_only";

  const pickupAddress = useMemo(() => {
    const firstPickup = siteSettings.pickupAddresses?.[0];
    if (firstPickup) {
      return {
        company: `${firstPickup.name} - Retirada`,
        adress: firstPickup.address,
        apartment: "Retirada no balcão",
        city: "",
        country: "Brasil",
        postalCode: "",
      };
    }
    const name = siteSettings.storeName?.trim() || "Loja";
    const addr = siteSettings.address?.trim();
    return {
      company: `${name} - Retirada`,
      adress: addr || "Configure o endereço em Admin → Configurações → Loja.",
      apartment: "Retirada no balcão",
      city: "",
      country: "Brasil",
      postalCode: "",
    };
  }, [
    siteSettings.storeName,
    siteSettings.address,
    siteSettings.pickupAddresses,
  ]);

  const [deliveryOption, setDeliveryOption] =
    useState<DeliveryOption>("entrega");
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    lastname: "",
    phone: "",
    email: "",
    adress: "",
    apartment: "",
    city: "",
    country: "",
    postalCode: "",
    referencePoint: "",
    orderNotice: "",
  });

  const [cepLoading, setCepLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateOrderModalOpen, setDuplicateOrderModalOpen] = useState(false);
  const [isConfirmingDuplicateOrder, setIsConfirmingDuplicateOrder] =
    useState(false);
  /** Reutilizado em retries do mesmo submit; limpo após sucesso ou novo corpo (duplicata confirmada). */
  const orderIdempotencyKeyRef = useRef<string | null>(null);
  const { products, total, clearCart } = useProductStore();
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (!allowDelivery) {
      setDeliveryOption("retirada");
      return;
    }
    if (!allowPickup) {
      setDeliveryOption("entrega");
    }
  }, [allowDelivery, allowPickup]);

  useEffect(() => {
    if (deliveryOption !== "entrega") return;
    const cepDigits = checkoutForm.postalCode.replace(/\D/g, "");
    if (cepDigits.length !== 8) return;

    const timer = setTimeout(() => {
      void fetchAddressByCep(checkoutForm.postalCode);
    }, 450);

    return () => clearTimeout(timer);
  }, [checkoutForm.postalCode, deliveryOption]);

  // Add validation functions that match server requirements
  const validateForm = () => {
    const errors: string[] = [];

    // Nome (obrigatório, mínimo 2 caracteres)
    if (!checkoutForm.name.trim() || checkoutForm.name.trim().length < 2) {
      errors.push("Nome deve ter pelo menos 2 caracteres");
    }

    // WhatsApp (obrigatório, mínimo 10 dígitos)
    const phoneDigits = checkoutForm.phone.replace(/[^0-9]/g, "");
    if (!checkoutForm.phone.trim() || phoneDigits.length < 10) {
      errors.push("WhatsApp deve ter pelo menos 10 dígitos");
    }

    // Email (obrigatório apenas se não logado)
    if (!session?.user?.email) {
      if (!checkoutForm.email.trim()) {
        errors.push("Email é obrigatório");
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutForm.email.trim())
      ) {
        errors.push("Email inválido");
      }
    }

    // Address validations only when delivery is selected
    if (deliveryOption === "entrega") {
      if (
        !checkoutForm.adress.trim() ||
        checkoutForm.adress.trim().length < 5
      ) {
        errors.push("Informe um CEP válido para preencher o endereço");
      }
      if (
        !checkoutForm.apartment.trim() ||
        checkoutForm.apartment.trim().length < 1
      ) {
        errors.push("Número da casa/apartamento é obrigatório");
      }
      if (!checkoutForm.city.trim() || checkoutForm.city.trim().length < 5) {
        errors.push("Cidade deve ter pelo menos 5 caracteres");
      }
      if (
        !checkoutForm.country.trim() ||
        checkoutForm.country.trim().length < 5
      ) {
        errors.push("País deve ter pelo menos 5 caracteres");
      }
      if (
        !checkoutForm.postalCode.trim() ||
        checkoutForm.postalCode.trim().length < 3
      ) {
        errors.push("CEP deve ter pelo menos 3 caracteres");
      }
    }

    return errors;
  };

  const fetchAddressByCep = async (rawCep: string) => {
    const cep = rawCep.replace(/\D/g, "");
    if (cep.length !== 8) {
      toast.error("CEP deve ter 8 dígitos");
      return;
    }

    setCepLoading(true);
    try {
      const res = await fetch(`/api/cep/${cep}`, {
        cache: "no-store",
      });
      const data = (await res.json()) as {
        error?: string;
        cep?: string;
        bairro?: string;
        cidade?: string;
        uf?: string;
        endereco?: string;
        complemento?: string;
      };
      if (!res.ok) {
        toast.error(data.error || "CEP não encontrado");
        return;
      }

      const street = (data.endereco || "").trim();
      const district = (data.bairro || "").trim();
      const city = (data.cidade || "").trim();
      const state = (data.uf || "").trim();
      const complement = (data.complemento || "").trim();
      const address = [street, district, complement]
        .filter(Boolean)
        .join(" - ");

      if (!address || !city) {
        toast.error("CEP sem dados completos de endereço");
        return;
      }

      setCheckoutForm((prev) => ({
        ...prev,
        postalCode: cep,
        adress: address,
        city: state ? `${city} - ${state}` : city,
        country: "Brasil",
      }));
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Não foi possível buscar o CEP");
    } finally {
      setCepLoading(false);
    }
  };

  const formatPostalCode = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };

  const buildOrderPayload = (confirmDuplicateOrder?: boolean) => {
    const fullName = checkoutForm.name.trim();
    const parts = fullName.split(/\s+/).filter(Boolean);
    const name = parts[0] || fullName;
    const lastname =
      parts.length > 1
        ? parts.slice(1).join(" ")
        : fullName.length >= 2
          ? fullName
          : "N/A";
    const orderEmail =
      session?.user?.email?.trim().toLowerCase() ||
      checkoutForm.email.trim().toLowerCase();

    const addressData =
      deliveryOption === "retirada"
        ? pickupAddress
        : {
            company: "Particular",
            adress: checkoutForm.adress.trim(),
            apartment: checkoutForm.apartment.trim(),
            postalCode: checkoutForm.postalCode.trim(),
            city: checkoutForm.city.trim(),
            country: checkoutForm.country.trim(),
          };

    const orderNotice =
      deliveryOption === "retirada"
        ? `[RETIRADA NA LOJA] ${checkoutForm.orderNotice.trim()}`.trim()
        : [
            checkoutForm.referencePoint.trim()
              ? `Ponto de referência: ${checkoutForm.referencePoint.trim()}`
              : "",
            checkoutForm.orderNotice.trim(),
          ]
            .filter(Boolean)
            .join(" | ");

    return {
      name,
      lastname,
      phone: checkoutForm.phone.trim(),
      email: orderEmail,
      deliveryOption,
      ...addressData,
      status: "pending" as const,
      total,
      orderNotice: orderNotice || "",
      items: products.map((p) => ({
        productId: p.id,
        quantity: p.amount,
        selectedColor: p.selectedColor ?? null,
        selectedSize: p.selectedSize ?? null,
      })),
      ...(confirmDuplicateOrder ? { confirmDuplicateOrder: true } : {}),
    };
  };

  /** @returns true se o pedido foi concluído; false se abriu o modal de duplicata */
  const submitOrderToApi = async (options?: {
    confirmDuplicate?: boolean;
  }): Promise<boolean> => {
    console.log("🚀 Starting order creation...");

    if (options?.confirmDuplicate) {
      orderIdempotencyKeyRef.current = null;
    }
    if (!orderIdempotencyKeyRef.current) {
      orderIdempotencyKeyRef.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    }
    const idempotencyKey = orderIdempotencyKeyRef.current;

    const orderData = buildOrderPayload(Boolean(options?.confirmDuplicate));
    console.log("📋 Order data being sent:", orderData);

    const response = await fetchNextApi("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(orderData),
    });

    console.log("📡 API Response received:");
    console.log("  Status:", response.status);
    console.log("  Status Text:", response.statusText);
    console.log("  Response OK:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 409 && !options?.confirmDuplicate) {
        try {
          const errJson = JSON.parse(errorText) as {
            error?: string;
            code?: string;
          };
          if (
            errJson.code === "DUPLICATE_ORDER" ||
            errJson.error === "Duplicate order detected"
          ) {
            setDuplicateOrderModalOpen(true);
            return false;
          }
        } catch {
          /* não é JSON */
        }
      }

      console.error("❌ Response not OK:", response.status, errorText);

      try {
        const errorData = JSON.parse(errorText) as {
          details?: Array<{ field: string; message: string }>;
          error?: string;
        };
        if (errorData.details && Array.isArray(errorData.details)) {
          errorData.details.forEach((detail) => {
            toast.error(`${detail.field}: ${detail.message}`);
          });
        } else {
          toast.error(errorData.error || "Falha na validação");
        }
      } catch {
        toast.error("Falha na validação");
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as { id?: string };
    const orderId = data.id;

    if (!orderId) {
      console.error("❌ Order ID is missing or falsy!");
      throw new Error("ID do pedido não recebido do servidor");
    }

    orderIdempotencyKeyRef.current = null;

    setCheckoutForm({
      name: "",
      lastname: "",
      phone: "",
      email: "",
      adress: "",
      apartment: "",
      city: "",
      country: "",
      postalCode: "",
      referencePoint: "",
      orderNotice: "",
    });
    clearCart();
    setDuplicateOrderModalOpen(false);

    toast.success(
      "Pedido criado com sucesso! Entraremos em contato para o pagamento.",
    );
    setTimeout(() => {
      router.push("/thank-you");
    }, 1000);
    return true;
  };

  const makePurchase = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => {
        toast.error(error);
      });
      return;
    }

    const requiredFields: (keyof typeof checkoutForm)[] = ["name", "phone"];

    if (!session?.user?.email) {
      requiredFields.push("email");
    }

    if (deliveryOption === "entrega") {
      requiredFields.push(
        "adress",
        "apartment",
        "city",
        "country",
        "postalCode",
      );
    }

    const missingFields = requiredFields.filter(
      (field) => !checkoutForm[field]?.trim(),
    );

    if (missingFields.length > 0) {
      toast.error("Por favor preencha todos os campos obrigatórios");
      return;
    }

    if (products.length === 0) {
      toast.error("Seu carrinho está vazio");
      return;
    }

    if (total <= 0) {
      toast.error("Total do pedido inválido");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitOrderToApi();
    } catch (error: unknown) {
      console.error("💥 Error in makePurchase:", error);
      toast.error("Falha ao criar o pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDuplicateOrderSubmit = async () => {
    setIsConfirmingDuplicateOrder(true);
    try {
      await submitOrderToApi({ confirmDuplicate: true });
    } catch (error: unknown) {
      console.error("💥 Error confirming duplicate order:", error);
      toast.error("Falha ao criar o pedido. Tente novamente.");
    } finally {
      setIsConfirmingDuplicateOrder(false);
    }
  };

  useEffect(() => {
    if (products.length === 0) {
      toast.error("Você não tem itens no carrinho");
      router.push("/carrinho");
    }
  }, []);

  // Format currency helper
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="bg-[#E3E1D6] min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-in-up">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Forms Column */}
          <div className="lg:col-span-7">
            <form className="space-y-8">
              {/* Contato: só Nome e WhatsApp */}
              <section
                aria-labelledby="contact-heading"
                className="bg-white px-8 py-8 border-2 border-black rounded-3xl "
              >
                <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-8">
                  <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
                    <FaUser size={16} />
                  </div>
                  <h2
                    id="contact-heading"
                    className="text-lg font-light tracking-widest text-gray-900 uppercase"
                  >
                    Informações de Contato
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="name-input"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nome *
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <FaUser className="text-gray-400 text-xs" />
                      </div>
                      <input
                        value={checkoutForm.name}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            name: e.target.value,
                          })
                        }
                        type="text"
                        id="name-input"
                        required
                        placeholder="Seu nome completo"
                        disabled={isSubmitting}
                        className="block w-full rounded-lg border border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="phone-input"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      WhatsApp *
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <FaPhone className="text-gray-400 text-xs" />
                      </div>
                      <input
                        value={checkoutForm.phone}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            phone: e.target.value,
                          })
                        }
                        type="tel"
                        id="phone-input"
                        required
                        placeholder="(00) 00000-0000"
                        disabled={isSubmitting}
                        className="block w-full rounded-lg border border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 transition-colors"
                      />
                    </div>
                  </div>

                  {!session?.user?.email && (
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="email-input"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email *{" "}
                        <span className="text-xs text-gray-500">
                          (para acompanhar seu pedido)
                        </span>
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <FaUser className="text-gray-400 text-xs" />
                        </div>
                        <input
                          value={checkoutForm.email}
                          onChange={(e) =>
                            setCheckoutForm({
                              ...checkoutForm,
                              email: e.target.value,
                            })
                          }
                          type="email"
                          id="email-input"
                          required
                          placeholder="seu@email.com"
                          disabled={isSubmitting}
                          className="block w-full rounded-lg border border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 transition-colors"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Delivery option */}
              {allowDelivery && allowPickup ? (
                <section
                  aria-labelledby="delivery-option-heading"
                  className="bg-white px-8 py-8 border-2 border-black rounded-3xl "
                >
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-8">
                    <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
                      <FaTruck size={16} />
                    </div>
                    <h2
                      id="delivery-option-heading"
                      className="text-lg font-light tracking-widest text-gray-900 uppercase"
                    >
                      Método de Entrega
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <button
                      type="button"
                      onClick={() => setDeliveryOption("entrega")}
                      disabled={isSubmitting}
                      className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300 ${
                        deliveryOption === "entrega"
                          ? "border-black bg-[#E3E1D6]"
                          : "border-gray-200 hover:border-gray-400 bg-white"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-full ${
                          deliveryOption === "entrega"
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <FaTruck size={20} />
                      </div>
                      <div className="text-left">
                        <p
                          className={`font-medium ${deliveryOption === "entrega" ? "text-gray-900" : "text-gray-600"}`}
                        >
                          Entrega
                        </p>
                        <p className="text-xs text-gray-500 mt-1 font-light">
                          Enviamos até você
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryOption("retirada")}
                      disabled={isSubmitting}
                      className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300 ${
                        deliveryOption === "retirada"
                          ? "border-black bg-[#E3E1D6]"
                          : "border-gray-200 hover:border-gray-400 bg-white"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-full ${
                          deliveryOption === "retirada"
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <FaStore size={20} />
                      </div>
                      <div className="text-left">
                        <p
                          className={`font-medium ${deliveryOption === "retirada" ? "text-gray-900" : "text-gray-600"}`}
                        >
                          Retirada
                        </p>
                        <p className="text-xs text-gray-500 mt-1 font-light">
                          Busque na loja
                        </p>
                      </div>
                    </button>
                  </div>
                </section>
              ) : allowDelivery ? (
                <section
                  aria-labelledby="delivery-only-heading"
                  className="bg-white px-8 py-8 border-2 border-black rounded-3xl "
                >
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-6">
                    <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
                      <FaTruck size={16} />
                    </div>
                    <h2
                      id="delivery-only-heading"
                      className="text-lg font-light tracking-widest text-gray-900 uppercase"
                    >
                      Somente entrega
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 font-light leading-relaxed">
                    Esta loja atende apenas com entrega no endereço informado no
                    checkout.
                  </p>
                </section>
              ) : (
                <section
                  aria-labelledby="pickup-only-heading"
                  className="bg-white px-8 py-8 border-2 border-black rounded-3xl "
                >
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-6">
                    <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
                      <FaStore size={16} />
                    </div>
                    <h2
                      id="pickup-only-heading"
                      className="text-lg font-light tracking-widest text-gray-900 uppercase"
                    >
                      Retirada na loja
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 font-light leading-relaxed">
                    Esta loja atende apenas com retirada no balcão. Confira o
                    endereço ou o ponto de coleta abaixo.
                  </p>
                </section>
              )}

              {/* Endereço: formulário (entrega) ou card de coleta (retirada) */}
              {deliveryOption === "entrega" ? (
                <section
                  aria-labelledby="shipping-heading"
                  className="bg-white px-8 py-8 border-2 border-black rounded-3xl "
                >
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-8">
                    <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
                      <FaMapMarkerAlt size={16} />
                    </div>
                    <h2
                      id="shipping-heading"
                      className="text-lg font-light tracking-widest text-gray-900 uppercase"
                    >
                      Endereço de Entrega
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="postal-code"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        CEP *
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <FaSearchLocation className="text-gray-400 text-sm" />
                        </div>
                        <input
                          type="text"
                          id="postal-code"
                          required
                          placeholder="00000-000"
                          disabled={isSubmitting}
                          maxLength={9}
                          className="block w-full rounded-xl border border-gray-300 bg-white pl-10 pr-28 focus:border-black focus:ring-2 focus:ring-black/10 sm:text-sm py-3 transition-colors"
                          value={checkoutForm.postalCode}
                          onChange={(e) =>
                            setCheckoutForm({
                              ...checkoutForm,
                              postalCode: formatPostalCode(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Endereço Completo *
                      </label>
                      <input
                        type="text"
                        id="address"
                        required
                        placeholder="Endereço"
                        disabled={isSubmitting}
                        className="block w-full rounded-xl border border-gray-200 bg-[#E3E1D6] text-gray-700 sm:text-sm py-3 px-3"
                        value={checkoutForm.adress}
                        readOnly
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="apartment"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Complemento / Apartamento *
                      </label>
                      <input
                        type="text"
                        id="apartment"
                        required
                        placeholder="Número da casa/apto"
                        disabled={isSubmitting}
                        className="block w-full rounded-xl border border-gray-300 bg-white focus:border-black focus:ring-2 focus:ring-black/10 sm:text-sm py-3 px-3 transition-colors"
                        value={checkoutForm.apartment}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            apartment: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Cidade *
                      </label>
                      <input
                        type="text"
                        id="city"
                        required
                        placeholder="Cidade"
                        disabled={isSubmitting}
                        className="block w-full rounded-xl border border-gray-200 bg-[#E3E1D6] text-gray-700 sm:text-sm py-3 px-3"
                        value={checkoutForm.city}
                        readOnly
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="region"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        País *
                      </label>
                      <input
                        type="text"
                        id="region"
                        required
                        placeholder="País"
                        disabled={isSubmitting}
                        className="block w-full rounded-xl border border-gray-200 bg-[#E3E1D6] text-gray-700 sm:text-sm py-3 px-3"
                        value={checkoutForm.country}
                        readOnly
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="reference-point"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Ponto de Referência (Opcional)
                      </label>
                      <input
                        type="text"
                        id="reference-point"
                        placeholder="Ex: Casa azul na esquina, portão lateral..."
                        disabled={isSubmitting}
                        className="block w-full rounded-xl border border-gray-300 bg-white focus:border-black focus:ring-2 focus:ring-black/10 sm:text-sm py-3 px-3 transition-colors"
                        value={checkoutForm.referencePoint}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            referencePoint: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="order-notice"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Observações do Pedido (Opcional)
                      </label>
                      <textarea
                        className="block w-full rounded-xl border border-gray-300 bg-white focus:border-black focus:ring-2 focus:ring-black/10 sm:text-sm py-3 px-3 transition-colors min-h-[100px]"
                        id="order-notice"
                        placeholder="Ex: Tocar o interfone, deixar na portaria..."
                        disabled={isSubmitting}
                        value={checkoutForm.orderNotice}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            orderNotice: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>
                  </div>
                </section>
              ) : (
                <section
                  aria-labelledby="pickup-heading"
                  className="bg-white px-8 py-8 border-2 border-black rounded-3xl "
                >
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-8">
                    <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
                      <FaStore size={16} />
                    </div>
                    <h2
                      id="pickup-heading"
                      className="text-lg font-light tracking-widest text-gray-900 uppercase"
                    >
                      Endereço de Coleta
                    </h2>
                  </div>
                  <div className="rounded-lg bg-[#E3E1D6] border-2 border-black p-5 space-y-2">
                    <p className="font-medium text-gray-900">
                      {pickupAddress.company}
                    </p>
                    <p className="text-gray-600 whitespace-pre-line">
                      {pickupAddress.adress}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {pickupAddress.apartment}
                    </p>
                  </div>
                  <div className="mt-6">
                    <label
                      htmlFor="order-notice-pickup"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Observações do Pedido (Opcional)
                    </label>
                    <textarea
                      className="block w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 transition-colors min-h-[80px]"
                      id="order-notice-pickup"
                      placeholder="Ex: Horário preferido para retirada..."
                      disabled={isSubmitting}
                      value={checkoutForm.orderNotice}
                      onChange={(e) =>
                        setCheckoutForm({
                          ...checkoutForm,
                          orderNotice: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>
                </section>
              )}

              {/* Payment Info */}
              <section className="bg-white px-8 py-8 border-2 border-black rounded-3xl ">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-8">
                  <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
                    <FaCreditCard size={16} />
                  </div>
                  <h2 className="text-lg font-light tracking-widest text-gray-900 uppercase">
                    Pagamento
                  </h2>
                </div>

                <div className="rounded-2xl bg-[#E3E1D6] p-6 border-2 border-black flex items-start gap-4">
                  <FaLock className="text-gray-400 mt-1 flex-shrink-0" />
                  <div className="text-sm text-gray-600 font-light">
                    <p className="font-medium text-gray-900 mb-1">
                      Pagamento Seguro
                    </p>
                    <p>
                      O pagamento será processado após a confirmação do pedido.
                      Entraremos em contato para finalizar os detalhes do
                      pagamento.
                    </p>
                  </div>
                </div>
              </section>
            </form>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-5 mt-10 lg:mt-0">
            <div className="lg:sticky lg:top-8">
              <div className="bg-white border-2 border-black rounded-3xl  overflow-hidden">
                <div className="p-8 bg-[#E3E1D6] border-b border-gray-100">
                  <h2 className="text-lg font-light tracking-widest text-gray-900 uppercase">
                    Resumo do Pedido
                  </h2>
                </div>

                <div className="p-8">
                  <ul role="list" className="divide-y divide-gray-100">
                    {products.map((product) => (
                      <li
                        key={product?.cartItemKey || product?.id}
                        className="flex py-4 first:pt-0"
                      >
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                          <Image
                            src={
                              product?.image
                                ? `/${product?.image}`
                                : "/product_placeholder.jpg"
                            }
                            alt={product?.title}
                            fill
                            className="object-cover object-center"
                          />
                        </div>

                        <div className="ml-4 flex flex-1 flex-col justify-center">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3 className="line-clamp-2 pr-4">
                                {product?.title}
                              </h3>
                              <p className="whitespace-nowrap">
                                {formatPrice(product?.price)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-1 items-end justify-between text-sm">
                            <div className="text-gray-500">
                              <p>Qtd: {product?.amount}</p>
                              {product?.selectedColor ? (
                                <p>Cor: {product.selectedColor}</p>
                              ) : null}
                              {product?.selectedSize ? (
                                <p>Tamanho: {product.selectedSize}</p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <dl className="space-y-4 border-t border-gray-100 pt-6 mt-6">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <dt>Subtotal</dt>
                      <dd>{formatPrice(total)}</dd>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <dt>
                        {deliveryOption === "entrega" ? "Entrega" : "Retirada"}
                      </dt>
                      <dd className="text-green-600 font-medium">
                        {deliveryOption === "retirada" ? "Na loja" : "Grátis"}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <dt>Taxas</dt>
                      <dd>{formatPrice(total / 5)}</dd>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                      <dt className="text-lg font-bold text-gray-900">Total</dt>
                      <dd className="text-xl font-bold text-blue-600">
                        {formatPrice(
                          total === 0 ? 0 : Math.round(total + total / 5 + 5),
                        )}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={makePurchase}
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center rounded-full border-2 border-black bg-black px-8 py-4 text-sm uppercase tracking-wider font-medium text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processando...
                        </>
                      ) : (
                        <>
                          <FaTruck className="mr-2" />
                          Finalizar Compra
                        </>
                      )}
                    </button>
                    <p className="mt-6 text-center text-xs text-gray-400 font-light">
                      Seus dados pessoais serão usados para processar seu pedido
                      e para outros propósitos descritos em nossa política de
                      privacidade.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={duplicateOrderModalOpen}
        onClose={() => {
          if (!isConfirmingDuplicateOrder) setDuplicateOrderModalOpen(false);
        }}
        onConfirm={() => void confirmDuplicateOrderSubmit()}
        title="Pedido semelhante recente"
        message="Detectamos um pedido com o mesmo e-mail e o mesmo total nos últimos minutos. Se quiser mesmo registrar outro pedido, confirme abaixo."
        confirmText="Sim, criar novo pedido"
        cancelText="Cancelar"
        isLoading={isConfirmingDuplicateOrder}
      />
    </div>
  );
};

export default CheckoutPage;
