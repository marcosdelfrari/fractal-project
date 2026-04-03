import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ProductInCart = {
  cartItemKey: string;
  id: string;
  title: string;
  price: number;
  image: string;
  amount: number;
  selectedColor?: string;
  selectedSize?: string;
};

export type State = {
  products: ProductInCart[];
  allQuantity: number;
  total: number;
};

export type Actions = {
  addToCart: (newProduct: ProductInCart) => void;
  removeFromCart: (cartItemKey: string) => void;
  updateCartAmount: (cartItemKey: string, quantity: number) => void;
  calculateTotals: () => void;
  clearCart: () => void;
};

export const useProductStore = create<State & Actions>()(
  persist(
    (set) => ({
      products: [],
      allQuantity: 0,
      total: 0,
      addToCart: (newProduct) => {
        set((state) => {
          const normalizedProduct = {
            ...newProduct,
            cartItemKey:
              newProduct.cartItemKey ||
              `${newProduct.id}__${newProduct.selectedColor || ""}__${newProduct.selectedSize || ""}`,
          };
          const cartItem = state.products.find(
            (item) => item.cartItemKey === normalizedProduct.cartItemKey
          );
          if (!cartItem) {
            return { products: [...state.products, normalizedProduct] };
          } else {
            state.products.map((product) => {
              if (product.cartItemKey === cartItem.cartItemKey) {
                product.amount += normalizedProduct.amount;
              }
            });
          }
          return { products: [...state.products] };
        });
      },
      clearCart: () => {
        set((state: any) => {
          
          return {
            products: [],
            allQuantity: 0,
            total: 0,
          };
        });
      },
      removeFromCart: (cartItemKey) => {
        set((state) => {
          state.products = state.products.filter(
            (product: ProductInCart) => product.cartItemKey !== cartItemKey
          );
          return { products: state.products };
        });
      },

      calculateTotals: () => {
        set((state) => {
          let amount = 0;
          let total = 0;
          state.products.forEach((item) => {
            amount += item.amount;
            total += item.amount * item.price;
          });

          return {
            products: state.products,
            allQuantity: amount,
            total: total,
          };
        });
      },
      updateCartAmount: (cartItemKey, amount) => {
        set((state) => {
          const cartItem = state.products.find((item) => item.cartItemKey === cartItemKey);

          if (!cartItem) {
            return { products: [...state.products] };
          } else {
            state.products.map((product) => {
              if (product.cartItemKey === cartItem.cartItemKey) {
                product.amount = amount;
              }
            });
          }

          return { products: [...state.products] };
        });
      },
    }),
    {
      name: "products-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
