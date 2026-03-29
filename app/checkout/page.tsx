"use client";
import { useProductStore } from "../_zustand/store";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import apiClient from "@/lib/api";
import {
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaBuilding,
  FaCreditCard,
  FaLock,
  FaTruck,
  FaStore,
} from "react-icons/fa";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

type DeliveryOption = "entrega" | "retirada";

const CheckoutPage = () => {
  const { settings: siteSettings } = useSiteSettings();
  const deliveryEnabled = siteSettings.deliveryEnabled !== false;

  const pickupAddress = useMemo(() => {
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
  }, [siteSettings.storeName, siteSettings.address]);

  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>("entrega");
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    lastname: "",
    phone: "",
    email: "",
    company: "",
    adress: "",
    apartment: "",
    city: "",
    country: "",
    postalCode: "",
    orderNotice: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { products, total, clearCart } = useProductStore();
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (!deliveryEnabled) {
      setDeliveryOption("retirada");
    }
  }, [deliveryEnabled]);

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

    // Address validations only when delivery is selected
    if (deliveryOption === "entrega") {
      if (
        !checkoutForm.company.trim() ||
        checkoutForm.company.trim().length < 5
      ) {
        errors.push("Empresa deve ter pelo menos 5 caracteres");
      }
      if (!checkoutForm.adress.trim() || checkoutForm.adress.trim().length < 5) {
        errors.push("Endereço deve ter pelo menos 5 caracteres");
      }
      if (
        !checkoutForm.apartment.trim() ||
        checkoutForm.apartment.trim().length < 1
      ) {
        errors.push("Complemento/Apartamento é obrigatório");
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

  const makePurchase = async () => {
    // Client-side validation first
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => {
        toast.error(error);
      });
      return;
    }

    // Contato: só nome e WhatsApp são obrigatórios
    const requiredFields: (keyof typeof checkoutForm)[] = ["name", "phone"];
    if (deliveryOption === "entrega") {
      requiredFields.push(
        "company",
        "adress",
        "apartment",
        "city",
        "country",
        "postalCode"
      );
    }

    const missingFields = requiredFields.filter(
      (field) => !checkoutForm[field]?.trim()
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
      console.log("🚀 Starting order creation...");

      // Contato: nome completo e WhatsApp; backend exige name, lastname, email, phone
      const fullName = checkoutForm.name.trim();
      const parts = fullName.split(/\s+/).filter(Boolean);
      const name = parts[0] || fullName;
      const lastname =
        parts.length > 1 ? parts.slice(1).join(" ") : (fullName.length >= 2 ? fullName : "N/A");
      const phoneDigits = checkoutForm.phone.replace(/\D/g, "");
      // Usar email do usuário logado para o pedido aparecer em "Meus Pedidos"; senão placeholder
      const orderEmail =
        session?.user?.email?.trim().toLowerCase() ||
        `contato+${phoneDigits}@loja.local`;

      const addressData =
        deliveryOption === "retirada"
          ? pickupAddress
          : {
              company: checkoutForm.company.trim(),
              adress: checkoutForm.adress.trim(),
              apartment: checkoutForm.apartment.trim(),
              postalCode: checkoutForm.postalCode.trim(),
              city: checkoutForm.city.trim(),
              country: checkoutForm.country.trim(),
            };

      const orderNotice =
        deliveryOption === "retirada"
          ? `[RETIRADA NA LOJA] ${checkoutForm.orderNotice.trim()}`.trim()
          : checkoutForm.orderNotice.trim();

      const orderData = {
        name,
        lastname,
        phone: checkoutForm.phone.trim(),
        email: orderEmail,
        ...addressData,
        status: "pending",
        total: total,
        orderNotice: orderNotice || "",
      };

      console.log("📋 Order data being sent:", orderData);

      // Send order data to server for validation and processing
      const response = await apiClient.post("/api/orders", orderData);

      console.log("📡 API Response received:");
      console.log("  Status:", response.status);
      console.log("  Status Text:", response.statusText);
      console.log("  Response OK:", response.ok);

      // Check if response is ok before parsing
      if (!response.ok) {
        console.error(
          "❌ Response not OK:",
          response.status,
          response.statusText
        );
        const errorText = await response.text();
        console.error("Error response body:", errorText);

        // Try to parse as JSON to get detailed error info
        try {
          const errorData = JSON.parse(errorText);
          console.error("Parsed error data:", errorData);

          // Show specific validation errors
          if (errorData.details && Array.isArray(errorData.details)) {
            errorData.details.forEach((detail: any) => {
              toast.error(`${detail.field}: ${detail.message}`);
            });
          } else {
            toast.error(errorData.error || "Falha na validação");
          }
        } catch (parseError) {
          console.error("Could not parse error as JSON:", parseError);
          toast.error("Falha na validação");
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Parsed response data:", data);

      const orderId: string = data.id;
      console.log("🆔 Extracted order ID:", orderId);

      if (!orderId) {
        console.error("❌ Order ID is missing or falsy!");
        console.error("Full response data:", JSON.stringify(data, null, 2));
        throw new Error("Order ID not received from server");
      }

      console.log(
        "✅ Order ID validation passed, proceeding with product addition..."
      );

      // Add products to order
      for (let i = 0; i < products.length; i++) {
        console.log(`🛍️ Adding product ${i + 1}/${products.length}:`, {
          orderId,
          productId: products[i].id,
          quantity: products[i].amount,
        });

        await addOrderProduct(orderId, products[i].id, products[i].amount);
        console.log(`✅ Product ${i + 1} added successfully`);
      }

      console.log(" All products added successfully!");

      // Clear form and cart
      setCheckoutForm({
        name: "",
        lastname: "",
        phone: "",
        email: "",
        company: "",
        adress: "",
        apartment: "",
        city: "",
        country: "",
        postalCode: "",
        orderNotice: "",
      });
      clearCart();

      toast.success(
        "Pedido criado com sucesso! Entraremos em contato para o pagamento."
      );
      setTimeout(() => {
        router.push("/thank-you");
      }, 1000);
    } catch (error: any) {
      console.error("💥 Error in makePurchase:", error);

      // Handle server validation errors
      if (error.response?.status === 400) {
        console.log(" Handling 400 error...");
        try {
          const errorData = await error.response.json();
          console.log("Error data:", errorData);
          if (errorData.details && Array.isArray(errorData.details)) {
            // Show specific validation errors
            errorData.details.forEach((detail: any) => {
              toast.error(`${detail.field}: ${detail.message}`);
            });
          } else {
            toast.error(errorData.error || "Falha na validação");
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          toast.error("Falha na validação");
        }
      } else if (error.response?.status === 409) {
        toast.error(
          "Pedido duplicado detectado. Aguarde antes de criar outro pedido."
        );
      } else {
        console.log("🔍 Handling generic error...");
        toast.error("Falha ao criar o pedido. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const addOrderProduct = async (
    orderId: string,
    productId: string,
    productQuantity: number
  ) => {
    try {
      console.log("️ Adding product to order:", {
        customerOrderId: orderId,
        productId,
        quantity: productQuantity,
      });

      const response = await apiClient.post("/api/order-product", {
        customerOrderId: orderId,
        productId: productId,
        quantity: productQuantity,
      });

      console.log("📡 Product order response:", response);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Product order failed:", response.status, errorText);
        throw new Error(`Product order failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Product order successful:", data);
    } catch (error) {
      console.error("💥 Error creating product order:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (products.length === 0) {
      toast.error("Você não tem itens no carrinho");
      router.push("/cart");
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
    <div className="bg-gray-50 min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-in-up">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Forms Column */}
          <div className="lg:col-span-7">
            <form className="space-y-8">
              {/* Contato: só Nome e WhatsApp */}
              <section
                aria-labelledby="contact-heading"
                className="bg-white px-8 py-8 shadow-md rounded-3xl border border-gray-100"
              >
                <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-8">
                  <div className="p-3 bg-gray-50 rounded-full text-gray-900">
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
                        className="block w-full rounded-lg border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 transition-colors"
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
                        className="block w-full rounded-lg border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Delivery option: só aparece quando a loja oferece entrega */}
              {deliveryEnabled ? (
                <section
                  aria-labelledby="delivery-option-heading"
                  className="bg-white px-8 py-8 shadow-md rounded-3xl border border-gray-100"
                >
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-8">
                    <div className="p-3 bg-gray-50 rounded-full text-gray-900">
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
                      className={`flex items-center gap-4 p-6 rounded-2xl border transition-all duration-300 ${
                        deliveryOption === "entrega"
                          ? "border-black bg-gray-50 shadow-md ring-1 ring-black/5"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-md bg-white"
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
                        <p className={`font-medium ${deliveryOption === "entrega" ? "text-gray-900" : "text-gray-600"}`}>Entrega</p>
                        <p className="text-xs text-gray-500 mt-1 font-light">
                          Enviamos até você
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryOption("retirada")}
                      disabled={isSubmitting}
                      className={`flex items-center gap-4 p-6 rounded-2xl border transition-all duration-300 ${
                        deliveryOption === "retirada"
                          ? "border-black bg-gray-50 shadow-md ring-1 ring-black/5"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-md bg-white"
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
                        <p className={`font-medium ${deliveryOption === "retirada" ? "text-gray-900" : "text-gray-600"}`}>Retirada</p>
                        <p className="text-xs text-gray-500 mt-1 font-light">
                          Busque na loja
                        </p>
                      </div>
                    </button>
                  </div>
                </section>
              ) : (
                <section
                  aria-labelledby="pickup-only-heading"
                  className="bg-white px-8 py-8 shadow-md rounded-3xl border border-gray-100"
                >
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-6">
                    <div className="p-3 bg-gray-50 rounded-full text-gray-900">
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
                    Esta loja atende apenas com retirada no balcão. Confira o endereço ou o ponto de coleta abaixo.
                  </p>
                </section>
              )}

              {/* Endereço: formulário (entrega) ou card de coleta (retirada) */}
              {deliveryOption === "entrega" ? (
                <section
                  aria-labelledby="shipping-heading"
                  className="bg-white px-8 py-8 shadow-md rounded-3xl border border-gray-100"
                >
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-8">
                    <div className="p-3 bg-gray-50 rounded-full text-gray-900">
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
                        htmlFor="company"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Empresa (Obrigatório)
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <FaBuilding className="text-gray-400 text-xs" />
                        </div>
                        <input
                          type="text"
                          id="company"
                          required
                          placeholder="Nome da empresa ou 'Particular'"
                          disabled={isSubmitting}
                          className="block w-full rounded-lg border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 transition-colors"
                          value={checkoutForm.company}
                          onChange={(e) =>
                            setCheckoutForm({
                              ...checkoutForm,
                              company: e.target.value,
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
                        placeholder="Rua, Número, Bairro"
                        disabled={isSubmitting}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 transition-colors"
                        value={checkoutForm.adress}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            adress: e.target.value,
                          })
                        }
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
                        placeholder="Apto 101, Bloco B (ou 'Casa')"
                        disabled={isSubmitting}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 transition-colors"
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
                        disabled={isSubmitting}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 transition-colors"
                        value={checkoutForm.city}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            city: e.target.value,
                          })
                        }
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
                        disabled={isSubmitting}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 transition-colors"
                        value={checkoutForm.country}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            country: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="postal-code"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        CEP *
                      </label>
                      <input
                        type="text"
                        id="postal-code"
                        required
                        placeholder="00000-000"
                        disabled={isSubmitting}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 transition-colors"
                        value={checkoutForm.postalCode}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            postalCode: e.target.value,
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
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 transition-colors min-h-[100px]"
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
                  className="bg-white px-8 py-8 shadow-md rounded-3xl border border-gray-100"
                >
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-8">
                    <div className="p-3 bg-gray-50 rounded-full text-gray-900">
                      <FaStore size={16} />
                    </div>
                    <h2
                      id="pickup-heading"
                      className="text-lg font-light tracking-widest text-gray-900 uppercase"
                    >
                      Endereço de Coleta
                    </h2>
                  </div>
                  <div className="rounded-lg bg-gray-50 border border-gray-200 p-5 space-y-2">
                    <p className="font-medium text-gray-900">
                      {pickupAddress.company}
                    </p>
                    <p className="text-gray-600 whitespace-pre-line">
                      {pickupAddress.adress}
                    </p>
                    <p className="text-gray-600 text-sm">{pickupAddress.apartment}</p>
                  </div>
                  <div className="mt-6">
                    <label
                      htmlFor="order-notice-pickup"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Observações do Pedido (Opcional)
                    </label>
                    <textarea
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 transition-colors min-h-[80px]"
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
              <section className="bg-white px-8 py-8 shadow-md rounded-3xl border border-gray-100">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-8">
                  <div className="p-3 bg-gray-50 rounded-full text-gray-900">
                    <FaCreditCard size={16} />
                  </div>
                  <h2 className="text-lg font-light tracking-widest text-gray-900 uppercase">
                    Pagamento
                  </h2>
                </div>

                <div className="rounded-2xl bg-gray-50 p-6 border border-gray-100 flex items-start gap-4">
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
              <div className="bg-white shadow-md rounded-3xl border border-gray-100 overflow-hidden">
                <div className="p-8 bg-gray-50 border-b border-gray-100">
                  <h2 className="text-lg font-light tracking-widest text-gray-900 uppercase">
                    Resumo do Pedido
                  </h2>
                </div>

                <div className="p-8">
                  <ul role="list" className="divide-y divide-gray-100">
                    {products.map((product) => (
                      <li key={product?.id} className="flex py-4 first:pt-0">
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
                            <p className="text-gray-500">
                              Qtd: {product?.amount}
                            </p>
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
                        {deliveryOption === "retirada"
                          ? "Na loja"
                          : "Grátis"}
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
                          total === 0 ? 0 : Math.round(total + total / 5 + 5)
                        )}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={makePurchase}
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center rounded-full border border-transparent bg-black px-8 py-4 text-sm uppercase tracking-wider font-medium text-white shadow-lg hover:bg-zinc-800 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
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
    </div>
  );
};

export default CheckoutPage;
