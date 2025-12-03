import { requireUser } from "@/utils/auth";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Proteção server-side: verifica autenticação e role (user ou admin)
  await requireUser();

  return <>{children}</>;
}
