import LoginPageClient from "./LoginPageClient";

export default function LoginPage() {
  const googleAuthEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );

  return <LoginPageClient googleAuthEnabled={googleAuthEnabled} />;
}
