/**
 * Base para chamadas do painel admin às configurações do site.
 *
 * Proteção em camadas (diferente do `/backend-api`, que só repassa ao Express):
 * 1. Rotas `/admin/*` no Next: `middleware.ts` exige JWT com `role === "admin"`.
 * 2. `app/api/admin/settings/[[...path]]/route.ts`: `getServerSession(authOptions)` e checagem explícita de `role === "admin"` antes de fazer `fetch` ao Express.
 * 3. O browser chama apenas `/api/admin/settings/...` (mesma origem, cookie de sessão).
 *
 * Leitura pública da vitrine: `GET /api/settings/public` (DTO estável; ETag / Cache-Control no Express).
 * Painel usa `GET /api/admin/settings/site` (payload completo; `requireAdmin` no Express).
 * Mutações em settings: `requireAdmin` no Express (JWT NextAuth repassado no cookie).
 */
export function getAdminSettingsApiBase(): string {
  return "/api/admin/settings";
}

/** Upload de imagem de seção da home (admin). */
export async function uploadSectionImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${getAdminSettingsApiBase()}/sections/upload`, {
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
