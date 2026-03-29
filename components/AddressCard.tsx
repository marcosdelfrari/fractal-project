// *********************
// Role of the component: Address card component for displaying address information
// Name of the component: AddressCard.tsx
// Version: 1.0
// Component call: <AddressCard address={address} onEdit={onEdit} onDelete={onDelete} onSetDefault={onSetDefault} />
// Input parameters: AddressCardProps interface
// Output: address card component
// *********************

import React from "react";
import {
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
  FaStar,
  FaRegStar,
  FaHome,
  FaBuilding,
  FaBriefcase,
  FaCalendarAlt,
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

interface AddressCardProps {
  address: Address;
  onEdit?: (addressId: string) => void;
  onDelete?: (addressId: string) => void;
  onSetDefault?: (addressId: string) => void;
  className?: string;
  showActions?: boolean;
}

const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  className = "",
  showActions = true,
}: AddressCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getLabelIcon = (label: string) => {
    const labelLower = label.toLowerCase();
    if (labelLower.includes("casa") || labelLower.includes("home")) {
      return <FaHome className="text-gray-700" />;
    } else if (labelLower.includes("trabalho") || labelLower.includes("work")) {
      return <FaBriefcase className="text-gray-700" />;
    } else if (
      labelLower.includes("apartamento") ||
      labelLower.includes("apt")
    ) {
      return <FaBuilding className="text-gray-700" />;
    } else {
      return <FaMapMarkerAlt className="text-gray-700" />;
    }
  };

  const formatZipCode = (zipCode: string) => {
    // Formatar CEP brasileiro: 12345-678
    if (zipCode.length === 8) {
      return `${zipCode.slice(0, 5)}-${zipCode.slice(5)}`;
    }
    return zipCode;
  };

  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:shadow-lg hover:border-gray-200 ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-700">
              {getLabelIcon(address.label)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{address.label}</h3>
                {address.isDefault && (
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    Padrão
                  </span>
                )}
              </div>
              <p className="text-sm font-light text-gray-500 mt-0.5">
                Criado em {formatDate(address.createdAt)}
              </p>
            </div>
          </div>
          {showActions && (
            <div className="flex items-center gap-2">
              {!address.isDefault && onSetDefault && (
                <button
                  onClick={() => onSetDefault(address.id)}
                  className="p-2 text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                  title="Definir como padrão"
                >
                  <FaRegStar />
                </button>
              )}
              {address.isDefault && (
                <div className="p-2 text-yellow-500" title="Endereço padrão">
                  <FaStar />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Address Details */}
      <div className="p-6">
        <div className="space-y-3">
          {/* Main Address */}
          <div className="flex items-start gap-3">
            <FaMapMarkerAlt className="text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900">
                {address.street}, {address.number}
                {address.complement && `, ${address.complement}`}
              </p>
              <p className="text-sm font-light text-gray-600 mt-1">
                {address.district} • {address.city} - {address.state}
              </p>
              <p className="text-sm font-light text-gray-500 mt-0.5">
                CEP: {formatZipCode(address.zipCode)} • {address.country}
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex items-center gap-4 text-xs font-light text-gray-500 pt-2">
            <div className="flex items-center gap-1">
              <FaCalendarAlt />
              <span>Atualizado em {formatDate(address.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (onEdit || onDelete) && (
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center justify-end gap-3">
            {onEdit && (
              <button
                onClick={() => onEdit(address.id)}
                className="flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300"
              >
                <FaEdit />
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(address.id)}
                className="flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2 text-sm font-medium text-gray-600 hover:border-red-200 hover:text-red-600 transition-all duration-300"
              >
                <FaTrash />
                Excluir
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de exemplo com dados mockados para demonstração
export const AddressCardExample = () => {
  const exampleAddresses: Address[] = [
    {
      id: "address-1",
      userId: "user-123",
      label: "Casa",
      street: "Rua das Flores",
      number: "123",
      complement: "Apto 45",
      district: "Centro",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234567",
      country: "Brasil",
      isDefault: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-15T10:30:00.000Z",
    },
    {
      id: "address-2",
      userId: "user-123",
      label: "Trabalho",
      street: "Avenida Paulista",
      number: "1000",
      complement: "Sala 501",
      district: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310100",
      country: "Brasil",
      isDefault: false,
      createdAt: "2024-01-10T00:00:00.000Z",
      updatedAt: "2024-01-10T00:00:00.000Z",
    },
  ];

  const handleEdit = (addressId: string) => {
    console.log("Editar endereço:", addressId);
  };

  const handleDelete = (addressId: string) => {
    console.log("Excluir endereço:", addressId);
  };

  const handleSetDefault = (addressId: string) => {
    console.log("Definir como padrão:", addressId);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {exampleAddresses.map((address) => (
        <AddressCard
          key={address.id}
          address={address}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSetDefault={handleSetDefault}
        />
      ))}
    </div>
  );
};

export default AddressCard;
