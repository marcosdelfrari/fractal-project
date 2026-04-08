"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api";
import AddressCard from "@/components/AddressCard";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  FaSpinner,
  FaPlus,
  FaMapMarkerAlt,
  FaSearchLocation,
} from "react-icons/fa";

interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AddressFormData {
  label: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export default function UserAddresses() {
  const { data: session } = useSession();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<AddressFormData>({
    label: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Brasil",
    isDefault: false,
  });

  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [modalMounted, setModalMounted] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeletingAddress, setIsDeletingAddress] = useState(false);

  useEffect(() => {
    setModalMounted(true);
  }, []);

  /** Resultado da API /api/cep — usado no debounce e antes de salvar (evita enviar sem rua/cidade). */
  const lookupCep = async (
    cep: string
  ): Promise<
    | { ok: true; street: string; district: string; city: string; state: string }
    | { ok: false; error: string }
  > => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      return { ok: false, error: "Informe um CEP com 8 dígitos." };
    }
    try {
      const res = await fetch(`/api/cep/${digits}`, { cache: "no-store" });
      const data = (await res.json()) as {
        error?: string;
        endereco?: string;
        bairro?: string;
        cidade?: string;
        uf?: string;
      };
      if (!res.ok) {
        return { ok: false, error: data.error || "CEP não encontrado." };
      }
      return {
        ok: true,
        street: data.endereco || "",
        district: data.bairro || "",
        city: data.cidade || "",
        state: data.uf || "",
      };
    } catch {
      return { ok: false, error: "Erro ao buscar CEP. Tente novamente." };
    }
  };

  // Busca endereço pelo CEP via API interna (/api/cep)
  const fetchAddressByCep = async (cep: string) => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setIsLoadingCep(true);
    setCepError(null);
    try {
      const result = await lookupCep(cep);
      if (!result.ok) {
        setCepError(result.error);
        setFormData((prev) => ({
          ...prev,
          street: "",
          district: "",
          city: "",
          state: "",
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        street: result.street,
        district: result.district,
        city: result.city,
        state: result.state,
      }));
    } finally {
      setIsLoadingCep(false);
    }
  };

  // Busca automática ao completar 8 dígitos (debounce igual ao checkout /compra)
  useEffect(() => {
    if (!showForm) return;
    const digits = formData.zipCode.replace(/\D/g, "");
    if (digits.length !== 8) return;

    const timer = setTimeout(() => {
      void fetchAddressByCep(formData.zipCode);
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.zipCode, showForm]);

  const formatZipCode = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  };

  // Fetch addresses
  const fetchAddresses = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get(
        `/api/addresses/user/${session.user.id}`
      );

      const contentType = response.headers.get("content-type");
      const isJson = contentType?.includes("application/json");

      if (!response.ok) {
        let message = "Falha ao carregar endereços";
        if (isJson) {
          try {
            const body = await response.json();
            message = body.error ?? body.message ?? message;
          } catch {
            // use default message
          }
        }
        throw new Error(message);
      }

      const data = isJson ? await response.json() : [];
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar endereços:", err);
      const message =
        err instanceof Error ? err.message : "Erro ao carregar endereços";
      const isNetworkError =
        message.includes("fetch") ||
        message.includes("Failed to fetch") ||
        message.includes("NetworkError");
      setError(
        isNetworkError
          ? "Não foi possível conectar ao servidor. Verifique se a API está rodando e se NEXT_PUBLIC_API_BASE_URL está correto."
          : message
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchAddresses();
    }
  }, [session?.user?.id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      const newValue = name === "zipCode" ? formatZipCode(value) : value;
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));
      if (name === "zipCode") setCepError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      let payload: AddressFormData = { ...formData };
      const cepDigits = payload.zipCode.replace(/\D/g, "");

      if (cepDigits.length !== 8) {
        setError("Informe um CEP válido com 8 dígitos.");
        return;
      }

      const addressIncomplete =
        !payload.street.trim() ||
        !payload.district.trim() ||
        !payload.city.trim() ||
        !payload.state.trim();

      if (addressIncomplete) {
        setIsLoadingCep(true);
        setCepError(null);
        const cepResult = await lookupCep(payload.zipCode);
        setIsLoadingCep(false);
        if (!cepResult.ok) {
          setCepError(cepResult.error);
          setError(cepResult.error);
          return;
        }
        payload = {
          ...payload,
          street: cepResult.street,
          district: cepResult.district,
          city: cepResult.city,
          state: cepResult.state,
        };
        setFormData(payload);
      }

      const labelTrim = payload.label.trim();
      if (labelTrim.length < 2) {
        setError("O rótulo deve ter pelo menos 2 caracteres.");
        return;
      }
      if (!payload.number.trim()) {
        setError("Informe o número do endereço.");
        return;
      }

      const url = editingAddress
        ? `/api/addresses/${editingAddress.id}`
        : `/api/addresses/user/${session.user.id}`;

      const method = editingAddress ? "PUT" : "POST";

      const response = await apiClient.request(url, {
        method,
        body: JSON.stringify({ ...payload, label: labelTrim }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          message?: string;
          error?: string;
          details?: string;
        };
        throw new Error(
          errorData.message ||
            errorData.error ||
            errorData.details ||
            "Falha ao salvar endereço"
        );
      }

      setSuccessMessage(
        editingAddress
          ? "Endereço atualizado com sucesso!"
          : "Endereço criado com sucesso!"
      );

      // Clear form and close modal
      setFormData({
        label: "",
        street: "",
        number: "",
        complement: "",
        district: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Brasil",
        isDefault: false,
      });
      setShowForm(false);
      setEditingAddress(null);

      // Refresh addresses
      await fetchAddresses();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Erro ao salvar endereço:", err);
      setError(err instanceof Error ? err.message : "Erro ao salvar endereço");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (addressId: string) => {
    const address = addresses.find((addr) => addr.id === addressId);
    if (!address) return;

    setCepError(null);
    setFormData({
      label: address.label,
      street: address.street,
      number: address.number,
      complement: address.complement || "",
      district: address.district,
      city: address.city,
      state: address.state,
      zipCode: formatZipCode(address.zipCode),
      country: address.country,
      isDefault: address.isDefault,
    });
    setEditingAddress(address);
    setShowForm(true);
  };

  const openDeleteConfirm = (addressId: string) => {
    setDeleteTargetId(addressId);
  };

  const confirmDeleteAddress = async () => {
    if (!deleteTargetId) return;
    const addressId = deleteTargetId;
    try {
      setIsDeletingAddress(true);
      setError(null);
      setSuccessMessage(null);

      const response = await apiClient.delete(`/api/addresses/${addressId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao excluir endereço");
      }

      setSuccessMessage("Endereço excluído com sucesso!");

      await fetchAddresses();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      setDeleteTargetId(null);
    } catch (err) {
      console.error("Erro ao excluir endereço:", err);
      setError(err instanceof Error ? err.message : "Erro ao excluir endereço");
    } finally {
      setIsDeletingAddress(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      setError(null);
      setSuccessMessage(null);

      const response = await apiClient.put(
        `/api/addresses/${addressId}/default`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Falha ao definir endereço padrão"
        );
      }

      setSuccessMessage("Endereço definido como padrão!");

      // Refresh addresses
      await fetchAddresses();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Erro ao definir endereço padrão:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao definir endereço padrão"
      );
    }
  };

  const handleCancel = () => {
    setFormData({
      label: "",
      street: "",
      number: "",
      complement: "",
      district: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Brasil",
      isDefault: false,
    });
    setShowForm(false);
    setEditingAddress(null);
    setError(null);
    setCepError(null);
  };

  // Show loading state
  if (isLoading && addresses.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <FaSpinner className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando endereços...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && addresses.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Erro ao carregar endereços
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-light text-gray-900 tracking-tight">
            Meus Endereços
          </h2>
          <p className="text-gray-500 font-light mt-1">
            Gerencie seus endereços de entrega e cobrança.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full text-sm uppercase tracking-wider font-medium hover:bg-zinc-800 transition-all duration-300 w-fit"
        >
          <FaPlus />
          Adicionar Endereço
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-8 rounded-2xl border-2 border-black bg-[#E3E1D6] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600">
              <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-8 rounded-2xl border-2 border-black bg-[#E3E1D6] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-red-600">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">{error}</p>
          </div>
        </div>
      )}

      {/* Address Form Modal — portal no body evita `fixed` preso ao pai com `transform` (animate-fade-in-up) */}
      {modalMounted &&
        showForm &&
        createPortal(
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50"
              aria-hidden
              onClick={handleCancel}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="address-modal-title"
              className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-black bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-[#E3E1D6] p-3 text-gray-900">
                      <FaMapMarkerAlt size={16} />
                    </div>
                    <h2
                      id="address-modal-title"
                      className="text-lg font-light uppercase tracking-widest text-gray-900"
                    >
                      {editingAddress ? "Editar Endereço" : "Adicionar Endereço"}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancel}
                    aria-label="Fechar"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-[#E3E1D6] hover:text-gray-700"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* CEP primeiro — preenchimento automático como no checkout */}
                  <div>
                    <label
                      htmlFor="user-address-zip"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      CEP *
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <FaSearchLocation className="text-sm text-gray-400" />
                      </span>
                      <input
                        id="user-address-zip"
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="00000-000"
                        maxLength={9}
                        autoComplete="postal-code"
                        className="block w-full rounded-lg border-2 border-black py-2.5 pl-10 pr-10 focus:border-black focus:ring-gray-400 sm:text-sm"
                        required
                      />
                      {isLoadingCep && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <FaSpinner className="h-4 w-4 animate-spin text-gray-500" />
                        </span>
                      )}
                    </div>
                    {cepError && (
                      <p className="mt-1 text-sm text-red-600">{cepError}</p>
                    )}
                    <p className="mt-1 text-xs font-light text-gray-500">
                      Digite o CEP para buscar rua, bairro, cidade e UF
                      automaticamente.
                    </p>
                  </div>

                  {/* Rótulo */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Rótulo *
                    </label>
                    <input
                      type="text"
                      name="label"
                      value={formData.label}
                      onChange={handleInputChange}
                      placeholder="Ex: Casa, Trabalho"
                      className="block w-full rounded-lg border-2 border-black py-2.5 focus:border-black focus:ring-gray-400 sm:text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {/* Street - somente leitura (preenchido pelo CEP) */}
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Rua/Avenida *
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      readOnly
                      placeholder="Preencha o CEP acima"
                      className="block w-full rounded-lg border border-gray-200 bg-[#E3E1D6] py-2.5 text-gray-700 cursor-not-allowed sm:text-sm"
                      required
                    />
                  </div>

                  {/* Number */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Número *
                    </label>
                    <input
                      type="text"
                      name="number"
                      value={formData.number}
                      onChange={handleInputChange}
                      placeholder="123"
                      className="block w-full rounded-lg border-2 border-black py-2.5 focus:border-black focus:ring-gray-400 sm:text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Complement */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Complemento
                  </label>
                  <input
                    type="text"
                    name="complement"
                    value={formData.complement}
                    onChange={handleInputChange}
                    placeholder="Apto, Sala, etc."
                    className="block w-full rounded-lg border-2 border-black py-2.5 focus:border-black focus:ring-gray-400 sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {/* District - somente leitura (preenchido pelo CEP) */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Bairro *
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      readOnly
                      placeholder="Preencha o CEP acima"
                      className="block w-full rounded-lg border border-gray-200 bg-[#E3E1D6] py-2.5 text-gray-700 cursor-not-allowed sm:text-sm"
                      required
                    />
                  </div>

                  {/* City - somente leitura (preenchido pelo CEP) */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      readOnly
                      placeholder="Preencha o CEP acima"
                      className="block w-full rounded-lg border border-gray-200 bg-[#E3E1D6] py-2.5 text-gray-700 cursor-not-allowed sm:text-sm"
                      required
                    />
                  </div>

                  {/* State - somente leitura (preenchido pelo CEP) */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Estado *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      readOnly
                      placeholder="Preencha o CEP acima"
                      className="block w-full rounded-lg border border-gray-200 bg-[#E3E1D6] py-2.5 text-gray-700 cursor-not-allowed sm:text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    País *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-2 border-black py-2.5 focus:border-black focus:ring-gray-400 sm:text-sm"
                    required
                  />
                </div>

                {/* Default Address */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
                  />
                  <label className="text-sm font-light text-gray-700">
                    Definir como endereço padrão
                  </label>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 border-t border-gray-100 pt-8">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-full border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-[#E3E1D6] transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full border-2 border-black bg-black px-8 py-3 text-sm font-medium uppercase tracking-wider text-white hover:bg-zinc-800 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Salvando..."
                      : editingAddress
                      ? "Atualizar"
                      : "Adicionar"}
                  </button>
                </div>
              </form>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="rounded-3xl border-2 border-black bg-white p-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#E3E1D6] text-gray-400">
            <FaMapMarkerAlt className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-light tracking-tight text-gray-900 mb-2">
            Nenhum endereço cadastrado
          </h3>
          <p className="mb-8 font-light text-gray-500">
            Adicione um endereço para facilitar suas compras e entregas.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-black px-8 py-3 text-sm font-medium uppercase tracking-wider text-white hover:bg-zinc-800 transition-all duration-300"
          >
            <FaPlus />
            Adicionar Primeiro Endereço
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEdit}
              onDelete={openDeleteConfirm}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {addresses.length > 0 && (
        <div className="mt-8 rounded-3xl border-2 border-black bg-white p-8">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-6">
            <div className="p-3 rounded-full bg-[#E3E1D6] text-gray-900">
              <FaMapMarkerAlt size={16} />
            </div>
            <h3 className="text-lg font-light tracking-widest text-gray-900 uppercase">
              Resumo dos Endereços
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-medium text-gray-900">
                {addresses.length}
              </p>
              <p className="text-sm font-light text-gray-500">Total de Endereços</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-medium text-gray-900">
                {addresses.filter((addr) => addr.isDefault).length}
              </p>
              <p className="text-sm font-light text-gray-500">Endereço Padrão</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-medium text-gray-900">
                {new Set(addresses.map((addr) => addr.city)).size}
              </p>
              <p className="text-sm font-light text-gray-500">Cidades Diferentes</p>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteTargetId !== null}
        onClose={() => !isDeletingAddress && setDeleteTargetId(null)}
        title="Excluir endereço?"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        isBusy={isDeletingAddress}
        onConfirm={confirmDeleteAddress}
      />
    </div>
  );
}
