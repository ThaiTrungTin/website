'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X, Sparkles, Megaphone, ExternalLink, Calendar, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { PopupAnnouncementConfig, DEFAULT_ANNOUNCEMENT } from '@/app/api/announcement/route';

export default function AnnouncementPopup() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [announcement, setAnnouncement] = useState<PopupAnnouncementConfig>(DEFAULT_ANNOUNCEMENT);
  const [isOpen, setIsOpen] = useState(false);
  const [isBadgeVisible, setIsBadgeVisible] = useState(false);
  const [isDismissedCompletely, setIsDismissedCompletely] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Tải cấu hình thông báo từ API
  useEffect(() => {
    let isMounted = true;
    async function loadAnnouncement() {
      try {
        const res = await fetch('/api/announcement');
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          setAnnouncement(json.data);

          // Nếu có cấu hình và đang Bật + Có ảnh poster
          if (json.data.isActive && json.data.imageUrl) {
            const dismissedSession = sessionStorage.getItem('petmm_popup_dismissed');
            const dismissedBadge = sessionStorage.getItem('petmm_badge_dismissed');

            if (dismissedBadge === 'true') {
              setIsDismissedCompletely(true);
              return;
            }

            if (dismissedSession === 'true') {
              // Khách đã từng đóng popup trong phiên này -> Chỉ hiện Huy hiệu nổi ở góc
              setIsBadgeVisible(true);
            } else {
              // Khách mới vào -> Hẹn giờ tự động bung popup đón khách
              const delayMs = (json.data.autoOpenDelaySeconds || 1.2) * 1000;
              const timer = setTimeout(() => {
                setIsOpen(true);
                setIsBadgeVisible(true);
              }, delayMs);
              return () => clearTimeout(timer);
            }
          }
        }
      } catch (err) {
        console.warn('Không thể tải thông báo popup:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAnnouncement();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Đóng popup lớn -> Thu nhỏ thành Huy hiệu nổi
  const handleDismissPopup = () => {
    setIsOpen(false);
    setIsBadgeVisible(true);
    try {
      sessionStorage.setItem('petmm_popup_dismissed', 'true');
    } catch {}
  };

  // 3. Đóng hoàn toàn huy hiệu nổi nếu khách không muốn thấy nút nhỏ
  const handleDismissBadgeCompletely = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBadgeVisible(false);
    setIsDismissedCompletely(true);
    try {
      sessionStorage.setItem('petmm_badge_dismissed', 'true');
    } catch {}
  };

  // 4. Mở lại popup từ Huy hiệu nổi
  const handleReopenPopup = () => {
    setIsOpen(true);
  };

  // 5. Xử lý khi bấm vào poster hoặc nút hành động
  const handleActionClick = () => {
    if (!announcement.linkUrl) {
      handleDismissPopup();
      return;
    }

    const targetUrl = announcement.linkUrl.trim();

    // Nếu là anchor link nội bộ trên trang (như #booking, #services...)
    if (targetUrl.startsWith('#')) {
      handleDismissPopup();
      setTimeout(() => {
        const el = document.querySelector(targetUrl);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 250);
      return;
    }

    // Nếu là link gọi điện thoại hoặc gửi email hoặc link ngoài
    if (targetUrl.startsWith('tel:') || targetUrl.startsWith('mailto:')) {
      window.location.href = targetUrl;
      handleDismissPopup();
      return;
    }

    // Link web ngoài
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    handleDismissPopup();
  };

  // Không hiển thị trên trang quản trị Admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Nếu không kích hoạt hoặc không có ảnh poster -> không render gì cả
  if (!announcement.isActive || !announcement.imageUrl || isDismissedCompletely) {
    return null;
  }

  const currentImage = (isEn && announcement.imageUrlEn?.trim())
    ? announcement.imageUrlEn.trim()
    : announcement.imageUrl.trim();

  const currentBadgeText = isEn
    ? (announcement.badgeTextEn?.trim() || announcement.badgeTextVi || '🧧 Special Notice')
    : (announcement.badgeTextVi?.trim() || '🧧 Thông Báo Quan Trọng');

  const currentTitle = isEn
    ? (announcement.titleEn?.trim() || announcement.titleVi || 'Notice & Offers')
    : (announcement.titleVi?.trim() || 'Thông Báo & Khuyến Mãi');

  const currentBtnText = isEn
    ? (announcement.btnTextEn?.trim() || 'Book Appointment Now')
    : (announcement.btnTextVi?.trim() || 'Đặt Lịch Khám Ngay');

  return (
    <>
      {/* ── 1. POPUP POSTER ĐÓN KHÁCH (LIGHTBOX MODAL) ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={currentTitle}
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-300"
        >
          {/* Backdrop tối mờ sang trọng */}
          <div
            onClick={handleDismissPopup}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity cursor-pointer"
          />

          {/* Khung nội dung Poster nổi bật */}
          <div className="relative z-10 w-full max-w-[420px] sm:max-w-[480px] md:max-w-[540px] my-auto animate-in zoom-in-95 duration-300">
            {/* Nút đóng (✕) lớn, chuẩn tay bấm */}
            <button
              type="button"
              onClick={handleDismissPopup}
              aria-label={isEn ? 'Close announcement' : 'Đóng thông báo'}
              className="absolute -top-3.5 -right-3.5 sm:-top-4 sm:-right-4 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-900/90 hover:bg-rose-600 text-white border-2 border-white/80 shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer focus:outline-none"
              title={isEn ? 'Close & minimize to corner' : 'Đóng & thu nhỏ vào góc màn hình'}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </button>

            {/* Thẻ chứa ảnh Poster */}
            <div className="overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-950 border-2 border-amber-400/40 shadow-[0_15px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(251,191,36,0.25)] flex flex-col group/card">
              {/* Header dải băng tiêu đề nhỏ */}
              <div className="px-4 py-2.5 bg-gradient-to-r from-amber-600 via-rose-700 to-red-700 text-white flex items-center justify-between gap-2 border-b border-white/15">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="flex h-2 w-2 rounded-full bg-amber-300 animate-ping" />
                  <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide truncate drop-shadow-sm">
                    {currentTitle}
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/25 text-amber-200 shrink-0 border border-white/20">
                  PetM&M 5★
                </span>
              </div>

              {/* Tấm ảnh Poster (Click vào sẽ kích hoạt hành động) */}
              <div
                onClick={handleActionClick}
                className="relative w-full max-h-[65vh] sm:max-h-[70vh] bg-slate-900 overflow-hidden cursor-pointer flex items-center justify-center"
              >
                <img
                  src={currentImage}
                  alt={currentTitle}
                  className="w-full h-auto max-h-[65vh] sm:max-h-[70vh] object-contain transition-transform duration-500 group-hover/card:scale-[1.015]"
                  loading="eager"
                />
              </div>

              {/* Footer nút hành động (CTA) */}
              <div className="p-3.5 sm:p-4 bg-slate-950/95 border-t border-white/10 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleActionClick}
                  className="w-full py-3 px-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-rose-950/50 hover:shadow-rose-900/80 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 text-amber-200 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>{currentBtnText}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5 px-1">
                  <span>{isEn ? 'Tap poster to view details' : 'Chạm vào ảnh để xem chi tiết'}</span>
                  <button
                    type="button"
                    onClick={handleDismissPopup}
                    className="text-slate-400 hover:text-white underline underline-offset-2 transition cursor-pointer"
                  >
                    {isEn ? 'Minimize to corner' : 'Đóng (Thu nhỏ vào góc)'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. HUY HIỆU NỔI THU NHỎ Ở GÓC MÀN HÌNH (FLOATING BADGE) ── */}
      {/* Vị trí: Desktop ở góc trái dưới (left-6 bottom-8) để đối xứng với Hotline/Zalo ở góc phải; Mobile ở góc phải dưới (right-3.5 bottom-6) để đối xứng với widget bên trái */}
      {isBadgeVisible && !isOpen && (
        <div
          role="button"
          tabIndex={0}
          onClick={handleReopenPopup}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleReopenPopup();
            }
          }}
          aria-label={currentBadgeText}
          className="fixed left-3.5 md:left-6 bottom-20 md:bottom-8 z-40 group cursor-pointer select-none animate-in fade-in slide-in-from-bottom-3 duration-300 focus:outline-none"
        >
          {/* Khung nút huy hiệu nổi dạng viên thuốc */}
          <div className="relative inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-600 via-rose-600 to-red-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-rose-950/40 border border-amber-300/60 hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-rose-900/60">
            {/* Vòng hào quang phát sáng nhẹ */}
            <span
              className="absolute -inset-1 rounded-full bg-rose-500/40 animate-ping pointer-events-none"
              style={{ animationDuration: '2.5s' }}
            />

            {/* Icon thông báo / Tết */}
            <span className="relative flex items-center justify-center text-sm sm:text-base animate-bounce">
              <Megaphone className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-200 fill-amber-300/20" />
            </span>

            {/* Nội dung nhãn (VD: 🧧 Lịch Trực Tết / 🎁 Ưu Đãi HOT) */}
            <span className="relative font-extrabold tracking-tight drop-shadow-sm whitespace-nowrap pr-1">
              {currentBadgeText}
            </span>

            {/* Nút đóng hoàn toàn huy hiệu nếu không muốn thấy */}
            <button
              type="button"
              onClick={handleDismissBadgeCompletely}
              className="relative p-0.5 rounded-full bg-black/25 hover:bg-black/60 text-white/80 hover:text-white transition ml-0.5 cursor-pointer"
              title={isEn ? 'Dismiss badge' : 'Ẩn huy hiệu này'}
              aria-label={isEn ? 'Dismiss badge' : 'Ẩn huy hiệu này'}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
