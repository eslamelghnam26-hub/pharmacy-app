import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, IBM_Plex_Sans_Arabic } from "next/font/google";
import { parseSettings, SETTINGS_COOKIE } from "@/lib/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = parseSettings((await cookies()).get(SETTINGS_COOKIE)?.value);
  return {
    title:
      settings.lang === "ar"
        ? "فارماديسك — إدارة الصيدلية"
        : "PharmaDesk — Pharmacy Manager",
    description:
      settings.lang === "ar"
        ? "نظام إدارة صيدلية بسيط للأغراض التجريبية."
        : "A simple pharmacy management dashboard for demo purposes.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = parseSettings((await cookies()).get(SETTINGS_COOKIE)?.value);

  return (
    <html
      lang={settings.lang}
      dir={settings.lang === "ar" ? "rtl" : "ltr"}
      className={`${geistSans.variable} ${arabic.variable} antialiased ${
        settings.theme === "dark" ? "dark" : ""
      }`}
    >
      <body>{children}</body>
    </html>
  );
}