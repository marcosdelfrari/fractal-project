
import { Loader } from "@/components/Loader";
import { CartModule } from "@/components/modules/cart";
import { Suspense } from "react";

const CartPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-light tracking-tight text-gray-900 sm:text-4xl">
            Carrinho
          </h1>
          <p className="mt-1 text-sm font-light text-gray-500">
            Revise os itens antes de seguir para o checkout.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 sm:p-8">
          <Suspense fallback={<Loader />}>
            <CartModule />
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default CartPage;
