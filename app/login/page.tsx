"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { isValidEmailAddressFormat } from "@/lib/utils";
import Link from "next/link";
import { CustomButton } from "@/components";

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    // Check if session expired
    const expired = searchParams.get("expired");
    if (expired === "true") {
      setError("Sua sessão expirou. Por favor, faça login novamente.");
      toast.error("Sua sessão expirou. Por favor, faça login novamente.");
    }

    // if user has already logged in redirect to callbackUrl or home page
    if (sessionStatus === "authenticated") {
      const callbackUrl = searchParams.get("callbackUrl") || "/";
      router.replace(callbackUrl);
    }
  }, [sessionStatus, router, searchParams]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const email = e.target.email.value;

    if (!isValidEmailAddressFormat(email)) {
      setError("Email inválido");
      toast.error("Email inválido");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Enviar PIN por email
      const response = await fetch("/api/auth/send-pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("PIN enviado para seu email!");
        // Redirecionar para página de verificação de PIN
        router.push(`/verify-pin?email=${encodeURIComponent(email)}`);
      } else {
        setError(data.error || "Erro ao enviar PIN");
        toast.error(data.error || "Erro ao enviar PIN");
      }
    } catch (error) {
      setError("Erro de conexão");
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  if (sessionStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <h1>Carregando...</h1>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-white">
      {/* Lado Esquerdo - Visual (Wise Quote) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-black text-white">
        {/* Background Abstrato */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-purple-700 to-blue-900 opacity-80 mix-blend-multiply"></div>
          <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-fuchsia-500/40 via-purple-900/40 to-transparent blur-3xl transform rotate-12"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[100%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/40 via-indigo-900/40 to-transparent blur-3xl transform -rotate-12"></div>
          {/* Ondas Decorativas */}
          <div className="absolute top-1/3 left-0 w-full h-64 bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-2xl transform -skew-y-12"></div>
        </div>

        {/* Conteúdo Sobreposto */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm font-medium tracking-widest uppercase text-gray-300">
              A Wise Quote
            </span>
            <div className="h-[1px] w-12 bg-gray-300"></div>
          </div>
        </div>

        <div className="relative z-10 mt-auto mb-12">
          <h1 className="text-6xl font-serif font-medium leading-tight mb-6">
            Get <br />
            Everything <br />
            You Want
          </h1>
          <p className="text-gray-300 text-lg max-w-md font-light leading-relaxed">
            You can get everything you want if you work hard, trust the process,
            and stick to the plan.
          </p>
        </div>
      </div>

      {/* Lado Direito - Formulário (Antigo / PIN) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 md:px-12 xl:px-24 bg-white relative">
        <div className="w-full max-w-[480px]">
          {/* Logo / Brand */}
          <div className="mb-10 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-8">
              <svg
                className="w-8 h-8 text-black"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" />
              </svg>
              <span className="text-xl font-bold text-black">Fractal</span>
            </div>

            <h2 className="text-3xl font-serif text-gray-900 mb-3 text-center lg:text-left">
              Bem-vindo
            </h2>
            <p className="text-gray-500 text-center lg:text-left">
              Digite seu email para receber um PIN de acesso
            </p>
          </div>

          {/* Form Container (Estilo Antigo Simplificado) */}
          <div className="bg-white">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-gray-900 mb-2"
                >
                  Email
                </label>
                <div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <CustomButton
                  buttonType="submit"
                  text={loading ? "Enviando PIN..." : "ENVIAR PIN"}
                  paddingX={3}
                  paddingY={1.5}
                  customWidth="full"
                  textSize="sm"
                  disabled={loading}
                />
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm font-medium leading-6">
                  <span className="bg-white px-6 text-gray-900">
                    Ou continue com
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  className="flex w-full items-center justify-center gap-3 rounded-md bg-white border border-gray-300 px-3 py-2.5 text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                  onClick={() => {
                    signIn("google");
                  }}
                >
                  <FcGoogle className="text-xl" />
                  <span className="text-sm font-semibold leading-6">
                    Google
                  </span>
                </button>
              </div>

              {error && (
                <p className="text-red-600 text-center text-[16px] my-4 bg-red-50 p-2 rounded">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
