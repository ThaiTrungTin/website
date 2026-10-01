import type { Metadata, Viewport } from "next";
import { Playfair_Display } from "next/font/google";
import Script from "next/script";
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
    "Hệ thống Bệnh viện Thú Y & Spa Chăm Sóc Thú Cưng Pet M&M chuẩn y khoa quốc tế tại TP.HCM. Hotline 24/7, phẫu thuật ngoại khoa, tiêm phòng vaccine và khách sạn thú cưng 5 sao.",
  keywords: [
    "thú y",
    "bệnh viện thú y",
    "pet care",
    "spa thú cưng",
    "khách sạn thú cưng",
    "tiêm phòng chó mèo",
    "hotline thú y 24/7",
    "Pet M&M",
    "pet taxi",
  ],
  authors: [{ name: "Pet M&M Veterinary Clinic" }],
  openGraph: {
    title: "Pet M&M — Thú Cưng Khỏe Mạnh, Gia Đình An Vui",
    description:
      "Hệ thống Bệnh viện Thú Y & Spa Chăm Sóc Thú Cưng toàn diện chuẩn quốc tế tại TP. Hồ Chí Minh.",
    url: "https://petmm.vn",
    siteName: "Pet M&M Veterinary & Pet Care",
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
      <head>
        <link rel="preconnect" href="https://ntkpdadakcyugvivvsjw.supabase.co" />
        <link rel="dns-prefetch" href="https://ntkpdadakcyugvivvsjw.supabase.co" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var lang = localStorage.getItem('petmm_language') || 'vi';
                  var cached = localStorage.getItem('petmm_system_config_cache');
                  if (cached) {
                    var cfg = JSON.parse(cached);
                    if (cfg) {
                      var isEn = lang === 'en';
                      var title = isEn
                        ? (cfg.tieu_de_trang_en || 'PetM&M - Homepage')
                        : (cfg.tieu_de_trang || 'PetM&M - Trang Chủ');
                      if (title) document.title = title;
                    }
                  }
                } catch (e) {}
                try {
                  var observer = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked') {
                        m.target.removeAttribute('bis_skin_checked');
                      }
                    }
                  });
                  observer.observe(document.documentElement, {
                    attributes: true,
                    subtree: true,
                    attributeFilter: ['bis_skin_checked']
                  });
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-[#0B150A] text-slate-900" suppressHydrationWarning>
        <SystemConfigProvider>
          <LanguageProvider>
            <DynamicFavicon />
            {children}
          </LanguageProvider>
        </SystemConfigProvider>
      </body>
    </html>
  );
}
