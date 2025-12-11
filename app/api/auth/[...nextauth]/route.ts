import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

// NextAuth v4 with Next.js 15 App Router
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
