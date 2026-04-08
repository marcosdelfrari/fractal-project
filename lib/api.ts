import config from "./config";

/** Browser: rewrite Next (`next.config.mjs`) envia cookie ao Express. Servidor: URL direta + repasse de Cookie. */
function resolveRequestUrl(endpoint: string, isServer: boolean): string {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  if (isServer) {
    const baseUrl = config.apiBaseUrl.replace(/\/+$/, "");
    return `${baseUrl}${normalizedEndpoint}`;
  }
  if (normalizedEndpoint.startsWith("/api/")) {
    return `/backend-api/${normalizedEndpoint.slice(5)}`;
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
      try {
        const { headers: getHeaders } = await import("next/headers");
        const h = await getHeaders();
        const cookie = h.get("cookie");
        if (cookie) {
          mergedHeaders.cookie = cookie;
        }
      } catch {
        /* fora do App Router / build */
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
