import type { Metadata } from "next";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import "svgmap/style.min";
import SessionProvider from "@/utils/SessionProvider";
import Header from "@/components/Header";
import AppShell from "@/components/AppShell";
import Providers from "@/Providers";
import SessionTimeoutWrapper from "@/components/SessionTimeoutWrapper";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { getSiteSettings } from "@/lib/getSiteSettings";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const name = s.storeName || "Loja";
  return {
    title: {
      default: name,
      template: `%s | ${name}`,
    },
    description: `Compras online na ${name}.`,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="pt-BR" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Economica:ital,wght@0,400;0,700;1,400;1,700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Playball&family=Sour+Gummy:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <SessionProvider session={session}>
          <SiteSettingsProvider>
            <SessionTimeoutWrapper />
            <AppShell>
              <Header />
              <Providers>{children}</Providers>
            </AppShell>
          </SiteSettingsProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
