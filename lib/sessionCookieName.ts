/**
 * Cookie de sessão NextAuth após migração para JWT assinado (JWS).
 *
 * Importante: o SessionStore do NextAuth usa `cookieName.startsWith(...)`.
 * Nomes como `...session-token.jws` ainda começam com o prefixo do cookie
 * antigo `...session-token`, e o valor JWE + JWS era concatenado → JWE inválido.
 * Por isso o nome é totalmente distinto do padrão.
 */
export function getSessionTokenCookieName(): string {
  const secure =
    process.env.NEXTAUTH_URL?.startsWith("https://") === true ||
    !!process.env.VERCEL;
  return secure ? "__Secure-next-auth.jws" : "next-auth.jws";
}
