import config from "./config";

/**
 * Browser: mesma origem em `/api/*` — Route Handlers (`app/api/[[...path]]`, `/api/orders`, …)
 * repassam Cookie ao Express via `proxyExpressRequest`. Não usar `/backend-api` + rewrite externo
 * (em produção o cookie de sessão pode não chegar ao Railway).
 * Servidor (RSC, etc.): URL direta do Express + repasse de Cookie dos headers da requisição.
 */
function resolveRequestUrl(endpoint: string, isServer: boolean): string {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  if (isServer) {
    const baseUrl = config.apiBaseUrl.replace(/\/+$/, "");
    return `${baseUrl}${normalizedEndpoint}`;
  }
  return normalizedEndpoint;
}

export const apiClient = {
  baseUrl: config.apiBaseUrl,

  async request(endpoint: string, options: RequestInit = {}) {
    const isServer = typeof window === "undefined";

    const url = resolveRequestUrl(endpoint, isServer);

    const mergedHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (isServer) {
      // No App Router (ex.: Vercel), `headers().get("cookie")` pode vir vazio em RSC
      // mesmo com sessão válida; `cookies().getAll()` repassa o token NextAuth ao Railway.
      let cookieHeader: string | undefined;
      try {
        const { cookies: getCookies } = await import("next/headers");
        const store = await getCookies();
        const all = store.getAll();
        if (all.length > 0) {
          cookieHeader = all.map((c) => `${c.name}=${c.value}`).join("; ");
        }
      } catch {
        /* fora do contexto de requisição */
      }
      if (!cookieHeader) {
        try {
          const { headers: getHeaders } = await import("next/headers");
          const h = await getHeaders();
          cookieHeader = h.get("cookie") ?? undefined;
        } catch {
          /* fora do App Router / build */
        }
      }
      if (cookieHeader) {
        mergedHeaders.cookie = cookieHeader;
      }
    }

    try {
      const response = await fetch(url, {
        ...(isServer ? { cache: "no-store" as RequestCache } : {}),
        ...options,
        headers: mergedHeaders,
        credentials: isServer ? undefined : "include",
      });

      if (
        typeof window === "undefined" &&
        process.env.NODE_ENV === "production"
      ) {
        console.log(
          `[API Client] Response status: ${response.status} ${response.statusText}`,
        );
      }

      return response;
    } catch (error) {
      console.error("[API Client] Request failed:", {
        url,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  },

  get: (endpoint: string, options?: RequestInit) =>
    apiClient.request(endpoint, { ...options, method: "GET" }),

  post: (endpoint: string, data?: unknown, options?: RequestInit) =>
    apiClient.request(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: (endpoint: string, data?: unknown, options?: RequestInit) =>
    apiClient.request(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (endpoint: string, options?: RequestInit) =>
    apiClient.request(endpoint, { ...options, method: "DELETE" }),
};

export default apiClient;
