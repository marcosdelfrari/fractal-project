"use client";
import { DashboardSidebar } from "@/components";
import apiClient from "@/lib/api";
import { convertCategoryNameToURLFriendly as convertSlugToURLFriendly } from "@/utils/categoryFormating";
import { sanitizeFormData } from "@/lib/form-sanitize";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AddNewProduct = () => {
  const [product, setProduct] = useState<{
    title: string;
    price: number;
    manufacturer: string;
    inStock: number;
    mainImage: string;
    description: string;
    slug: string;
    categoryId: string;
  }>({
    title: "",
    price: 0,
    manufacturer: "",
    inStock: 1,
    mainImage: "",
    description: "",
    slug: "",
    categoryId: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);

  const addProduct = async () => {
    if (
      product.title === "" ||
      product.manufacturer === "" ||
      product.description == "" ||
      product.slug === ""
    ) {
      toast.error("Please enter values in input fields");
      return;
    }

    // Sanitize form data before sending to API
    const sanitizedProduct = sanitizeFormData(product);

    const requestOptions: any = {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sanitizedProduct),
    };
    apiClient
      .post(`/api/products`, requestOptions)
      .then((response) => {
        if (response.status === 201) {
          return response.json();
        }
      })
      .then((data) => {
        toast.success("Product added successfully");
        setProduct({
          title: "",
          price: 0,
          manufacturer: "",
          inStock: 1,
          mainImage: "",
          description: "",
          slug: "",
          categoryId: "",
        });
      })
      .catch((error) => {
        toast.error("Error adding product");
      });
  };

  const uploadFile = async (file: any) => {
    const formData = new FormData();
    formData.append("uploadedFile", file);

    try {
      const response = await apiClient.post("/api/main-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
      } else {
        console.error("File upload unsuccessfull");
      }
    } catch (error) {
      console.error("Error happend while sending request:", error);
    }
  };

  const fetchCategories = async () => {
    apiClient
      .get(`/api/categories`)
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        setProduct({
          title: "",
          price: 0,
          manufacturer: "",
          inStock: 1,
          mainImage: "",
          description: "",
          slug: "",
          categoryId: data[0]?.id,
        });
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="bg-gray-50 flex min-h-screen max-w-screen-2xl mx-auto max-xl:flex-col">
      <DashboardSidebar />
      <div className="flex-1 p-8 max-md:p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add new product</h1>
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-y-6">
          <div>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Product name:</span>
              </div>
              <input
                type="text"
                className="input input-bordered w-full max-w-xs"
                value={product?.title}
                onChange={(e) =>
                  setProduct({ ...product, title: e.target.value })
                }
              />
            </label>
          </div>

          <div>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Product slug:</span>
              </div>
              <input
                type="text"
                className="input input-bordered w-full max-w-xs"
                value={convertSlugToURLFriendly(product?.slug)}
                onChange={(e) =>
                  setProduct({
                    ...product,
                    slug: convertSlugToURLFriendly(e.target.value),
                  })
                }
              />
            </label>
          </div>

          <div>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Category:</span>
              </div>
              <select
                className="select select-bordered"
                value={product?.categoryId}
                onChange={(e) =>
                  setProduct({ ...product, categoryId: e.target.value })
                }
              >
                {categories &&
                  categories.map((category: any) => (
                    <option key={category?.id} value={category?.id}>
                      {category?.name}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <div>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Product price:</span>
              </div>
              <input
                type="text"
                className="input input-bordered w-full max-w-xs"
                value={product?.price}
                onChange={(e) =>
                  setProduct({ ...product, price: Number(e.target.value) })
                }
              />
            </label>
          </div>
          <div>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Manufacturer:</span>
              </div>
              <input
                type="text"
                className="input input-bordered w-full max-w-xs"
                value={product?.manufacturer}
                onChange={(e) =>
                  setProduct({ ...product, manufacturer: e.target.value })
                }
              />
            </label>
          </div>
          <div>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Is product in stock?</span>
              </div>
              <select
                className="select select-bordered"
                value={product?.inStock}
                onChange={(e) =>
                  setProduct({ ...product, inStock: Number(e.target.value) })
                }
              >
                <option value={1}>Yes</option>
                <option value={0}>No</option>
              </select>
            </label>
          </div>
          <div>
            <input
              type="file"
              className="file-input file-input-bordered file-input-lg w-full max-w-sm"
              onChange={(e: any) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  uploadFile(selectedFile);
                  setProduct({ ...product, mainImage: selectedFile.name });
                }
              }}
            />
            {product?.mainImage && (
              <Image
                src={`/` + product?.mainImage}
                alt={product?.title}
                className="w-auto h-auto mt-4"
                width={100}
                height={100}
              />
            )}
          </div>
          <div>
            <label className="form-control">
              <div className="label">
                <span className="label-text">Product description:</span>
              </div>
              <textarea
                className="textarea textarea-bordered h-24"
                value={product?.description}
                onChange={(e) =>
                  setProduct({ ...product, description: e.target.value })
                }
              ></textarea>
            </label>
          </div>
          <div className="flex gap-x-2 pt-4">
            <button
              onClick={addProduct}
              type="button"
              className="uppercase bg-blue-600 px-10 py-3 text-lg rounded-lg border border-transparent font-bold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Add product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewProduct;
