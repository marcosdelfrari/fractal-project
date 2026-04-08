interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  rating: number;
  description: string;
  additionalInfo?: string;
  material?: string;
  mainImage: string;
  manufacturer: string;
  categoryId: string;
  category: { name: string }?;
  inStock: number;
  colors?: { name: string; class?: string }[];
  sizes?: string[];
  measureTable?: boolean;
}

interface SingleProductPageProps {
  params: {
    id: string;
    productSlug: string;
  };
}

type ProductInWishlist = {
  id: string;
  title: string;
  price: number;
  image: string;
  slug: string;
  stockAvailabillity: number;
};

interface OtherImages {
  imageID: number;
  productID: number;
  image: string;
}

interface Category {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  password: string | null;
  role: string;
}

interface Order {
  id: string;
  adress: string;
  apartment: string;
  company: string;
  dateTime: string;
  email: string;
  lastname: string;
  name: string;
  phone: string;
  postalCode: string;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "ready_for_pickup"
    | "delivered"
    | "cancelled";
  city: string;
  country: string;
  orderNotice: string?;
  total: number;
  /** entrega | retirada */
  deliveryOption?: "entrega" | "retirada";
}

interface SingleProductBtnProps {
  product: Product;
  quantityCount: number;
  selectedColor?: string;
  selectedSize?: string;
}

interface WishListItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
}

// Tipos do NextAuth movidos para types/next-auth.d.ts
