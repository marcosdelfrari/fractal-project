import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// NextAuth v4 with Next.js 15 App Router
console.log("[NextAuth Route] Inicializando NextAuth com options personalizadas");
console.log("[NextAuth Route] encode customizado:", !!authOptions.jwt?.encode);
console.log("[NextAuth Route] decode customizado:", !!authOptions.jwt?.decode);

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
