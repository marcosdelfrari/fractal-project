import Link from "next/link";
import { FaCheckCircle, FaShoppingBag, FaArrowRight } from "react-icons/fa";

export default function ThankYouPage() {
  return (
    <div className="bg-white min-h-[calc(100vh-160px)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-xl w-full text-center space-y-8 animate-fade-in-up">
        {/* Icon Container with minimal styling */}
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-50 animate-bounce-slow">
          <FaCheckCircle className="h-12 w-12 text-green-500" />
        </div>

        <div>
          <h1 className="text-4xl sm:text-5xl font-light text-gray-900 tracking-tight mb-4">
            Obrigado!
          </h1>
          <p className="text-xl text-gray-500 font-light">
            Seu pedido foi confirmado com sucesso.
          </p>
        </div>

        <div className="bg-[#E3E1D6] rounded-2xl p-8 border border-gray-100 shadow-sm">
          <p className="text-gray-600 mb-8 font-light leading-relaxed">
            Enviaremos uma confirmação para o seu e-mail e atualizações pelo
            WhatsApp. Você pode acompanhar o status do seu pedido na sua conta.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/usuario/pedidos"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-sm uppercase tracking-wider font-medium rounded-full text-white bg-black hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <FaShoppingBag className="mr-2" />
              Ver Meus Pedidos
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-sm uppercase tracking-wider font-medium rounded-full text-gray-700 bg-white hover:bg-[#E3E1D6] hover:border-gray-400 transition-all duration-300 group"
            >
              Continuar Comprando
              <FaArrowRight className="ml-2 text-xs group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
