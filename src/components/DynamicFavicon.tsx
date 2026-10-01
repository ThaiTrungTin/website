'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSystemConfig } from '@/context/SystemConfigContext';
import { useLanguage } from '@/context/LanguageContext';

export default function DynamicFavicon() {
  const { config } = useSystemConfig();
  const { language } = useLanguage();
  const pathname = usePathname();

  // Dynamic Browser Tab Title reacting to language, admin config, and current page route
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isEn = language === 'en';

    // 1. Đối với trang chi tiết chi nhánh hoặc bài viết kiến thức:
    // Để component chi tiết tự quản lý tiêu đề theo tên chi nhánh / tiêu đề bài viết
    if (pathname?.startsWith('/chi-nhanh') || pathname?.startsWith('/kien-thuc')) {
      return;
    }

    const getTargetTitle = () => {
      // 2. View con Đội ngũ nhân sự / bác sĩ (/doi-ngu)
      if (pathname === '/doi-ngu' || pathname?.startsWith('/doi-ngu')) {
        return isEn
          ? 'Medical & Veterinary Team | Pet M&M'
          : 'Đội Ngũ Bác Sĩ & Y Tế | Pet M&M';
      }

      // 3. Trang Quản trị hệ thống (/admin)
      if (pathname === '/admin' || pathname?.startsWith('/admin')) {
        return isEn
          ? 'Admin Portal | Pet M&M'
          : 'Quản Trị Hệ Thống | Pet M&M';
      }

      // 4. Trang chủ (/) và các đường dẫn gốc
      let titleVi = config.tieu_de_trang;
      let titleEn = config.tieu_de_trang_en;

      if (!titleVi || !titleEn) {
        try {
          const cached = localStorage.getItem('petmm_system_config_cache');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.tieu_de_trang && !titleVi) titleVi = parsed.tieu_de_trang;
            if (parsed.tieu_de_trang_en && !titleEn) titleEn = parsed.tieu_de_trang_en;
          }
        } catch {}
      }

      return isEn
        ? (titleEn?.trim() || 'PetM&M - Homepage')
        : (titleVi?.trim() || 'PetM&M - Trang Chủ');
    };

    const applyTitle = () => {
      const pageTitle = getTargetTitle();
      if (pageTitle && document.title !== pageTitle) {
        document.title = pageTitle;
      }
    };

    applyTitle();

    // Dùng timer nhiều nhịp để ngăn chặn Next.js App Router hydration đè lại metadata cũ
    const timers = [
      setTimeout(applyTitle, 50),
      setTimeout(applyTitle, 150),
      setTimeout(applyTitle, 400),
      setTimeout(applyTitle, 1000),
      setTimeout(applyTitle, 2000),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [pathname, language, config.tieu_de_trang, config.tieu_de_trang_en]);

  useEffect(() => {
    const rawFavicon = config.logo_favicon?.trim();
    const faviconUrl = rawFavicon || '/logo-favicon.png';

    const lower = faviconUrl.toLowerCase();
    let mimeType = 'image/png';
    if (lower.includes('.svg')) mimeType = 'image/svg+xml';
    else if (lower.includes('.ico')) mimeType = 'image/x-icon';
    else if (lower.includes('.webp')) mimeType = 'image/webp';
    else if (lower.includes('.jpg') || lower.includes('.jpeg')) mimeType = 'image/jpeg';

    const sep = faviconUrl.includes('?') ? '&' : '?';
    const cacheBustUrl = `${faviconUrl}${sep}v=${Date.now()}`;

    // Cập nhật tất cả các thẻ icon hiện có mà KHÔNG gọi el.remove() (tránh xung đột DOM React 19)
    const existingIcons = document.querySelectorAll<HTMLLinkElement>(
      "link[rel='icon'], link[rel='shortcut icon'], link[rel*='icon'], link[rel='apple-touch-icon']"
    );

    if (existingIcons.length > 0) {
      existingIcons.forEach((link) => {
        link.href = cacheBustUrl;
        link.type = mimeType;
      });
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.type = mimeType;
      newLink.href = cacheBustUrl;
      document.head.appendChild(newLink);
    }
  }, [config.logo_favicon]);

  return null;
}
