"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api";
import AddressCard from "@/components/AddressCard";
import {
  FaSpinner,
  FaPlus,
  FaMapMarkerAlt,
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

  // Busca endereço pelo CEP (ViaCEP)
  const fetchAddressByCep = async (cep: string) => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setIsLoadingCep(true);
    setCepError(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();

      if (data.erro) {
        setCepError("CEP não encontrado.");
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
        street: data.logradouro || "",
        district: data.bairro || "",
        city: data.localidade || "",
        state: data.uf || "",
      }));
    } catch {
      setCepError("Erro ao buscar CEP. Tente novamente.");
      setFormData((prev) => ({
        ...prev,
        street: "",
        district: "",
        city: "",
        state: "",
      }));
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleZipCodeBlur = () => {
    const digits = formData.zipCode.replace(/\D/g, "");
    if (digits.length === 8) {
      fetchAddressByCep(formData.zipCode);
    } else {
      setCepError(null);
    }
  };

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

      const url = editingAddress
        ? `/api/addresses/${editingAddress.id}`
        : `/api/addresses/user/${session.user.id}`;

      const method = editingAddress ? "PUT" : "POST";

      const response = await apiClient.request(url, {
        method,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao salvar endereço");
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

  const handleDelete = async (addressId: string) => {
    if (!confirm("Tem certeza que deseja excluir este endereço?")) {
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);

      const response = await apiClient.delete(`/api/addresses/${addressId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao excluir endereço");
      }

      setSuccessMessage("Endereço excluído com sucesso!");

      // Refresh addresses
      await fetchAddresses();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Erro ao excluir endereço:", err);
      setError(err instanceof Error ? err.message : "Erro ao excluir endereço");
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
        <div className="mb-8 rounded-2xl border border-gray-100 bg-gray-50 p-5 shadow-sm">
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
        <div className="mb-8 rounded-2xl border border-gray-100 bg-gray-50 p-5 shadow-sm">
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

      {/* Address Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-50 rounded-full text-gray-900">
                    <FaMapMarkerAlt size={16} />
                  </div>
                  <h2 className="text-lg font-light tracking-widest text-gray-900 uppercase">
                    {editingAddress ? "Editar Endereço" : "Adicionar Endereço"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleCancel}
                  aria-label="Fechar"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Label */}
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
                      className="block w-full rounded-lg border border-gray-300 py-2.5 shadow-sm focus:border-gray-400 focus:ring-gray-400 sm:text-sm"
                      required
                    />
                  </div>

                  {/* Zip Code */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      CEP *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        onBlur={handleZipCodeBlur}
                        placeholder="00000-000"
                        maxLength={9}
                        className="block w-full rounded-lg border border-gray-300 py-2.5 shadow-sm focus:border-gray-400 focus:ring-gray-400 sm:text-sm"
                        required
                      />
                      {isLoadingCep && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                          Buscando...
                        </span>
                      )}
                    </div>
                    {cepError && (
                      <p className="mt-1 text-sm text-red-600">{cepError}</p>
                    )}
                    <p className="mt-1 text-xs font-light text-gray-500">
                      Rua, bairro e cidade serão preenchidos automaticamente.
                    </p>
                  </div>
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
                      className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 text-gray-700 cursor-not-allowed sm:text-sm"
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
                      className="block w-full rounded-lg border border-gray-300 py-2.5 shadow-sm focus:border-gray-400 focus:ring-gray-400 sm:text-sm"
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
                    className="block w-full rounded-lg border border-gray-300 py-2.5 shadow-sm focus:border-gray-400 focus:ring-gray-400 sm:text-sm"
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
                      className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 text-gray-700 cursor-not-allowed sm:text-sm"
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
                      className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 text-gray-700 cursor-not-allowed sm:text-sm"
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
                      className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 text-gray-700 cursor-not-allowed sm:text-sm"
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
                    className="block w-full rounded-lg border border-gray-300 py-2.5 shadow-sm focus:border-gray-400 focus:ring-gray-400 sm:text-sm"
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
                    className="rounded-full border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full border border-transparent bg-black px-8 py-3 text-sm font-medium uppercase tracking-wider text-white shadow-lg hover:bg-zinc-800 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
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
        </div>
      )}

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-md">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400">
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
            className="inline-flex items-center gap-2 rounded-full border border-transparent bg-black px-8 py-3 text-sm font-medium uppercase tracking-wider text-white shadow-lg hover:bg-zinc-800 transition-all duration-300"
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
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      {addresses.length > 0 && (
        <div className="mt-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-md">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-6">
            <div className="p-3 rounded-full bg-gray-50 text-gray-900">
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
    </div>
  );
}
