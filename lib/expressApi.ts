/**
 * Base URL/path para a API Express.
 * No browser usa `/backend-api` (rewrite no Next.js → mesma origem, sem CORS).
 * No servidor usa URL absoluta (fetch server-to-server).
 */
export function getExpressApiBase(): string {
  if (typeof window !== "undefined") {
    return "/backend-api";
  }
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001").replace(
    /\/$/,
    "",
  );
  return `${base}/api`;
}

/** Envia imagem para `public/uploads/sections/` e retorna a URL pública (`/uploads/sections/...`). */
export async function uploadSectionImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${getExpressApiBase()}/settings/sections/upload`, {
    method: "POST",
    body: formData,
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string; url?: string };
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Erro ao enviar imagem",
    );
  }
  if (!data.url) {
    throw new Error("Resposta inválida do servidor");
  }
  return data.url;
}
