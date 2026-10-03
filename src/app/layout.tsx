import type { Metadata, Viewport } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["vietnamese", "latin"],
  variable: "--font-serif",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2D5A27",
};

export const metadata: Metadata = {
  title: "PetM&M - Trang Chủ",
  description:
    "Hệ thống Bệnh viện Thú Y & Spa Chăm Sóc Thú Cưng PetM&M chuẩn y khoa quốc tế tại TP.HCM. Hotline 24/7, phẫu thuật ngoại khoa, tiêm phòng vaccine và khách sạn thú cưng 5 sao.",
  keywords: [
    "thú y",
    "bệnh viện thú y",
    "pet care",
    "spa thú cưng",
    "khách sạn thú cưng",
    "tiêm phòng chó mèo",
    "hotline thú y 24/7",
    "PetM&M",
    "pet taxi",
  ],
  authors: [{ name: "PetM&M Veterinary Clinic" }],
  openGraph: {
    title: "PetM&M — Thú Cưng Khỏe Mạnh, Gia Đình An Vui",
    description:
      "Hệ thống Bệnh viện Thú Y & Spa Chăm Sóc Thú Cưng toàn diện chuẩn quốc tế tại TP. Hồ Chí Minh.",
    url: "https://petmm.vn",
    siteName: "PetM&M Veterinary & Pet Care",
    locale: "vi_VN",
    type: "website",
  },
  icons: {
    icon: '/logo-favicon.png',
    shortcut: '/logo-favicon.png',
    apple: '/logo-favicon.png',
  },
};

import { SystemConfigProvider } from "@/context/SystemConfigContext";
import { LanguageProvider } from "@/context/LanguageContext";
import DynamicFavicon from "@/components/DynamicFavicon";
import AnnouncementPopup from "@/components/AnnouncementPopup";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`scroll-smooth ${playfair.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="antialiased min-h-screen bg-[#0B150A] text-slate-900" suppressHydrationWarning>
        <SystemConfigProvider>
          <LanguageProvider>
            <DynamicFavicon />
            {children}
            <AnnouncementPopup />
          </LanguageProvider>
        </SystemConfigProvider>
      </body>
    </html>
  );
}
