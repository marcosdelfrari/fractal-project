import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth/next";
import "svgmap/style.min";
import SessionProvider from "@/utils/SessionProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/Providers";
import SessionTimeoutWrapper from "@/components/SessionTimeoutWrapper";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { getSiteSettings } from "@/lib/getSiteSettings";

const inter = Inter({ subsets: ["latin"] });

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
  const session = await getServerSession();
  return (
    <html lang="en" data-theme="light">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <SiteSettingsProvider>
            <SessionTimeoutWrapper />
            <Header />
            <Providers>{children}</Providers>
            <Footer />
          </SiteSettingsProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
