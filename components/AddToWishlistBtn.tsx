"use client";

// *********************
// Role of the component: Button for adding and removing product to the wishlist on the single product page
// Name of the component: AddToWishlistBtn.tsx
// *********************

import { useWishlistStore } from "@/app/_zustand/wishlistStore";
import apiClient from "@/lib/api";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaHeartCrack } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa6";

interface AddToWishlistBtnProps {
  product: Product;
  slug: string;
}

async function resolveUserId(session: {
  user?: { id?: string | null };
}): Promise<string | null> {
  if (session?.user?.id) return session.user.id;
  const res = await apiClient.get("/api/users/me", { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.id ?? null;
}

const AddToWishlistBtn = ({ product, slug: _slug }: AddToWishlistBtnProps) => {
  const { data: session, status } = useSession();
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore();
  const [isProductInWishlist, setIsProductInWishlist] = useState<boolean>();

  const addToWishlistFun = async () => {
    if (!session?.user) {
      toast.error("Faça login para adicionar produtos à lista de desejos");
      return;
    }
    try {
      const userId = await resolveUserId(session);
      if (!userId) {
        toast.error("Não foi possível identificar o usuário");
        return;
      }

      const wishlistResponse = await apiClient.post("/api/wishlist", {
        productId: product?.id,
      });

      if (wishlistResponse.ok) {
        addToWishlist({
          id: product?.id,
          title: product?.title,
          price: product?.price,
          image: product?.mainImage,
          slug: product?.slug,
          stockAvailabillity: product?.inStock,
        });
        toast.success("Produto adicionado à lista de desejos");
      } else {
        const errorData = await wishlistResponse.json();
        toast.error(
          errorData.message ||
            "Não foi possível adicionar o produto à lista de desejos",
        );
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Não foi possível adicionar o produto à lista de desejos");
    }
  };

  const removeFromWishlistFun = async () => {
    if (!session?.user) return;
    try {
      const userId = await resolveUserId(session);
      if (!userId) {
        toast.error("Não foi possível identificar o usuário");
        return;
      }

      const deleteResponse = await apiClient.delete(
        `/api/wishlist/${userId}/${product?.id}`,
      );

      if (deleteResponse.ok) {
        removeFromWishlist(product?.id);
        toast.success("Produto removido da lista de desejos");
      } else {
        const errorData = await deleteResponse.json();
        toast.error(
          errorData.message ||
            "Não foi possível remover o produto da lista de desejos",
        );
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Não foi possível remover o produto da lista de desejos");
    }
  };

  const isInWishlist = async () => {
    if (!session?.user) return;
    try {
      const userId = await resolveUserId(session);
      if (!userId) {
        setIsProductInWishlist(false);
        return;
      }

      const wishlistResponse = await apiClient.get(
        `/api/wishlist/${userId}/${product?.id}`,
      );
      const wishlistData = await wishlistResponse.json();

      if (wishlistData[0]?.id) {
        setIsProductInWishlist(true);
      } else {
        setIsProductInWishlist(false);
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error);
      setIsProductInWishlist(false);
    }
  };

  useEffect(() => {
    isInWishlist();
  }, [session?.user?.id, wishlist]);

  return (
    <>
      {isProductInWishlist ? (
        <p
          className="flex items-center gap-x-2 cursor-pointer"
          onClick={removeFromWishlistFun}
        >
          <FaHeartCrack className="text-xl text-custom-black" />
        </p>
      ) : (
        <p
          className="flex items-center gap-x-2 cursor-pointer"
          onClick={addToWishlistFun}
        >
          <FaHeart className="text-xl text-custom-black" />
        </p>
      )}
    </>
  );
};

export default AddToWishlistBtn;
