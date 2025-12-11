import config from "./config";

export const apiClient = {
  baseUrl: config.apiBaseUrl,

  async request(endpoint: string, options: RequestInit = {}) {
    // Normalizar a URL base removendo barra final se existir
    const baseUrl = this.baseUrl.replace(/\/+$/, "");
    // Garantir que o endpoint comece com barra
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    const url = `${baseUrl}${normalizedEndpoint}`;

    // Log para debug em produção (apenas no servidor)
    if (
      typeof window === "undefined" &&
      process.env.NODE_ENV === "production"
    ) {
      console.log(`[API Client] Making request to: ${url}`);
      console.log(`[API Client] Base URL: ${this.baseUrl}`);
    }

    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });

      // Log para debug em produção (apenas no servidor)
      if (
        typeof window === "undefined" &&
        process.env.NODE_ENV === "production"
      ) {
        console.log(
          `[API Client] Response status: ${response.status} ${response.statusText}`
        );
      }

      return response;
    } catch (error) {
      // Log detalhado do erro
      console.error("[API Client] Request failed:", {
        url,
        baseUrl: this.baseUrl,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  },

  // Convenience methods
  get: (endpoint: string, options?: RequestInit) =>
    apiClient.request(endpoint, { ...options, method: "GET" }),

  post: (endpoint: string, data?: any, options?: RequestInit) =>
    apiClient.request(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: (endpoint: string, data?: any, options?: RequestInit) =>
    apiClient.request(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (endpoint: string, options?: RequestInit) =>
    apiClient.request(endpoint, { ...options, method: "DELETE" }),
};

export default apiClient;
