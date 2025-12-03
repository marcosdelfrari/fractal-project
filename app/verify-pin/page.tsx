"use client";
import { CustomButton, SectionTitle } from "@/components";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const VerifyPinPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else {
      router.push("/login");
    }

    // if user has already logged in redirect to home page
    if (sessionStatus === "authenticated") {
      router.replace("/");
    }
  }, [sessionStatus, router, searchParams]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!pin || pin.length !== 6) {
      setError("PIN deve ter 6 dígitos");
      toast.error("PIN deve ter 6 dígitos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await signIn("pin", {
        redirect: false,
        email,
        pin,
      });

      if (res?.error) {
        setError("PIN inválido ou expirado");
        toast.error("PIN inválido ou expirado");
      } else {
        setError("");
        toast.success("Login realizado com sucesso!");
        router.replace("/");
      }
    } catch (error) {
      setError("Erro de conexão");
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const handleResendPin = async () => {
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
        toast.success("Novo PIN enviado para seu email!");
      } else {
        setError(data.error || "Erro ao reenviar PIN");
        toast.error(data.error || "Erro ao reenviar PIN");
      }
    } catch (error) {
      setError("Erro de conexão");
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  if (sessionStatus === "loading") {
    return <h1>Carregando...</h1>;
  }

  return (
    <div className="bg-white">
      <SectionTitle title="Verificar PIN" path="Home | Login | Verificar PIN" />
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8 bg-white">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-2xl font-normal leading-9 tracking-tight text-gray-900">
            Digite o PIN enviado para seu email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enviamos um PIN de 6 dígitos para <strong>{email}</strong>
          </p>
        </div>

        <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="pin"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  PIN de 6 dígitos
                </label>
                <div className="mt-2">
                  <input
                    id="pin"
                    name="pin"
                    type="text"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 text-center text-2xl tracking-widest"
                    placeholder="123456"
                  />
                </div>
              </div>

              <div>
                <CustomButton
                  buttonType="submit"
                  text={loading ? "Verificando..." : "Entrar"}
                  paddingX={3}
                  paddingY={1.5}
                  customWidth="full"
                  textSize="sm"
                  disabled={loading}
                />
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não recebeu o PIN?{" "}
                <button
                  type="button"
                  onClick={handleResendPin}
                  disabled={loading}
                  className="font-semibold text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                >
                  Reenviar PIN
                </button>
              </p>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                ← Voltar para login
              </button>
            </div>

            {error && (
              <p className="text-red-600 text-center text-[16px] mt-4">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPinPage;
