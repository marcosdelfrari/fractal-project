"use client";

import React, { useState, useEffect } from "react";
import { FaUser, FaPhone, FaInstagram, FaSave, FaTimes } from "react-icons/fa";

interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  instagram?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserProfileFormProps {
  user: User;
  onSubmit: (data: ProfileFormData) => void;
  isLoading?: boolean;
  className?: string;
}

export interface ProfileFormData {
  name: string;
  phone: string;
  instagram: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  instagram?: string;
}

const UserProfileForm = ({
  user,
  onSubmit,
  isLoading = false,
  className = "",
}: UserProfileFormProps) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user.name || "",
    phone: user.phone || "",
    instagram: user.instagram || "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      instagram: user.instagram || "",
    });
    setErrors({});
  }, [user]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    } else {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(
        7,
        11,
      )}`;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.name.trim().length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres";
    }

    if (formData.phone.trim()) {
      const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = "Formato de telefone inválido";
      }
    }

    if (formData.instagram.trim()) {
      const ig = formData.instagram.trim();
      if (ig.length > 150) {
        newErrors.instagram = "No máximo 150 caracteres";
      } else if (/[<>]/.test(ig)) {
        newErrors.instagram = "Caracteres inválidos";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof ProfileFormData,
  ) => {
    let value = e.target.value;
    if (field === "phone") {
      value = formatPhone(value);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div
      className={`bg-white rounded-3xl border-2 border-black ${className} animate-fade-in-up`}
    >
      <div className="p-8 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#E3E1D6] rounded-full text-gray-900">
            <FaUser className="text-lg" />
          </div>
          <div>
            <h2 className="text-lg font-light tracking-widest text-gray-900 uppercase">
              Editar Perfil
            </h2>
            <p className="text-sm text-gray-500 font-light mt-1">
              Nome, telefone e Instagram
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="space-y-6">
          <h3 className="text-sm font-light tracking-widest text-gray-900 uppercase">
            Seus dados
          </h3>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nome completo *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange(e, "name")}
                className={`block w-full pl-10 pr-3 py-2 rounded-full border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? "border-red-300" : "border-black"
                }`}
                placeholder="Seu nome"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Telefone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange(e, "phone")}
                className={`block w-full pl-10 pr-3 py-2 rounded-full border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? "border-red-300" : "border-black"
                }`}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="instagram"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Instagram
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaInstagram className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="instagram"
                value={formData.instagram}
                onChange={(e) => handleInputChange(e, "instagram")}
                className={`block w-full pl-10 pr-3 py-2 rounded-full border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.instagram ? "border-red-300" : "border-black"
                }`}
                placeholder="@seuusuario ou link do perfil"
                maxLength={150}
                autoComplete="off"
              />
            </div>
            {errors.instagram && (
              <p className="mt-1 text-sm text-red-600">{errors.instagram}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              setFormData({
                name: user.name || "",
                phone: user.phone || "",
                instagram: user.instagram || "",
              });
              setErrors({});
            }}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            disabled={isLoading}
          >
            <FaTimes />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave />
            {isLoading ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfileForm;
