import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return (session as any)?.user?.role === "admin";
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Admin access required");
  }
}

export async function isUser(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return (session as any)?.user?.role === "user";
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session?.user;
}

export async function requireUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Authentication required");
  }

  const userRole = (session as any)?.user?.role;
  if (userRole !== "user" && userRole !== "admin") {
    throw new Error("User access required");
  }
}

export async function requireAuthenticatedUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Authentication required");
  }

  return session.user;
}
