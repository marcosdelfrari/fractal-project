/**
 * Cookie de sessão NextAuth após migração para JWT assinado (JWS).
 * Nome distinto evita que o browser envie o token JWE antigo no cookie padrão.
 */
export function getSessionTokenCookieName(): string {
  const secure =
    process.env.NEXTAUTH_URL?.startsWith("https://") === true ||
    !!process.env.VERCEL;
  return secure
    ? "__Secure-next-auth.session-token.jws"
    : "next-auth.session-token.jws";
}
