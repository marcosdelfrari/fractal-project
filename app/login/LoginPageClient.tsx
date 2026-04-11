"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { isValidEmailAddressFormat } from "@/lib/utils";

type Props = {
  /** Espelha `authOptions`: Google só é registrado com GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET */
  googleAuthEnabled: boolean;
};

export default function LoginPageClient({ googleAuthEnabled }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    const expired = searchParams.get("expired");
    if (expired === "true") {
      setError("Sua sessão expirou. Por favor, faça login novamente.");
      toast.error("Sua sessão expirou. Por favor, faça login novamente.");
    }

    if (sessionStatus === "authenticated") {
      const callbackUrl = searchParams.get("callbackUrl") || "/";
      router.replace(callbackUrl);
    }
  }, [sessionStatus, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (e.target as HTMLFormElement).email.value;

    if (!isValidEmailAddressFormat(email)) {
      setError("Email inválido");
      toast.error("Email inválido");
      return;
    }

    setLoading(true);
    setError("");

    try {
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
        router.push(`/verify-pin?email=${encodeURIComponent(email)}`);
      } else {
        setError(data.error || "Erro ao enviar PIN");
        toast.error(data.error || "Erro ao enviar PIN");
      }
    } catch {
      setError("Erro de conexão");
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  if (sessionStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#E3E1D6]">
        <h1>Carregando...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E3E1D6] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border-2 border-black px-8 py-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white">
              <span className="text-sm font-medium tracking-widest">FR</span>
            </div>
            <h1 className="text-2xl font-light text-gray-900 tracking-tight mb-2">
              Entrar na sua conta
            </h1>
            <p className="text-sm font-light text-gray-500">
              Digite seu email para receber um PIN de acesso.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-lg border border-gray-300 py-2.5 px-3 text-gray-900 shadow-sm focus:border-gray-400 focus:ring-gray-400 sm:text-sm"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center rounded-full border border-transparent bg-black px-6 py-3 text-sm font-medium uppercase tracking-wider text-white shadow-lg hover:bg-zinc-800 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Enviando PIN..." : "Enviar PIN"}
              </button>
            </div>
          </form>

          {googleAuthEnabled && (
            <div className="mt-8">
              <div className="relative">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs font-medium leading-6">
                  <span className="bg-white px-4 text-gray-500">
                    Ou continue com
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-[#E3E1D6] transition-all duration-300"
                  onClick={() => {
                    signIn("google");
                  }}
                >
                  <FcGoogle className="text-xl" />
                  <span>Entrar com Google</span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-6 rounded-2xl border border-gray-100 bg-[#E3E1D6] px-4 py-3 text-center text-sm font-medium text-gray-900">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
