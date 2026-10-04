'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { X, Bell, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { PopupAnnouncementConfig, DEFAULT_ANNOUNCEMENT } from '@/app/api/announcement/route';

// Regex bắt emoji hoặc biểu tượng ở đầu chuỗi (🧧, 🎁, 🔔, 📢, v.v.)
const EMOJI_PREFIX_REGEX = /^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\u2600-\u27BF])\s*/u;

export default function AnnouncementPopup() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [announcement, setAnnouncement] = useState<PopupAnnouncementConfig>(DEFAULT_ANNOUNCEMENT);
  const [isOpen, setIsOpen] = useState(false);
  const [isBadgeVisible, setIsBadgeVisible] = useState(false);

  // Kéo thả thanh nổi (Draggable state)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const elemStartRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  // Guard chống lỗi "chớp rồi tắt" trên điện thoại do synthetic click từ touch event
  const lastOpenTimeRef = useRef<number>(0);

  // 1. Tải cấu hình thông báo từ API (chỉ tải và hiển thị ở website chính '/')
  useEffect(() => {
    if (pathname !== '/') return;

    let isMounted = true;
    async function loadAnnouncement() {
      try {
        const res = await fetch('/api/announcement');
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          setAnnouncement(json.data);

          // Kiểm tra khoảng thời gian xuất hiện (nếu có cấu hình)
          const now = Date.now();
          if (json.data.startDate) {
            const start = new Date(json.data.startDate).getTime();
            if (!isNaN(start) && now < start) return;
          }
          if (json.data.endDate) {
            const end = new Date(json.data.endDate).getTime();
            if (!isNaN(end) && now > end) return;
          }

          if (json.data.isActive && json.data.imageUrl) {
            setIsBadgeVisible(true);

            const dismissedSession = sessionStorage.getItem('petmm_popup_dismissed');
            if (dismissedSession !== 'true') {
              const delayMs = (json.data.autoOpenDelaySeconds || 1.2) * 1000;
              const timer = setTimeout(() => {
                if (isMounted) {
                  lastOpenTimeRef.current = Date.now();
                  setIsOpen(true);
                }
              }, delayMs);
              return () => clearTimeout(timer);
            }
          }
        }
      } catch (err) {
        console.warn('Không thể tải thông báo popup:', err);
      }
    }

    loadAnnouncement();
    return () => { isMounted = false; };
  }, []);

  // Tự động đóng popup sau X giây (nếu có cấu hình)
  useEffect(() => {
    if (!isOpen || !announcement.autoCloseSeconds || announcement.autoCloseSeconds <= 0) return;
    const timer = setTimeout(() => {
      setIsOpen(false);
    }, announcement.autoCloseSeconds * 1000);
    return () => clearTimeout(timer);
  }, [isOpen, announcement.autoCloseSeconds]);

  // 2. Đóng popup poster
  const handleDismissPopup = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsOpen(false);
    try {
      sessionStorage.setItem('petmm_popup_dismissed', 'true');
    } catch {}
  }, []);

  // 3. Backdrop click — chặn synthetic click event trên mobile touch (450ms guard)
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (Date.now() - lastOpenTimeRef.current < 450) {
      return;
    }
    handleDismissPopup();
  }, [handleDismissPopup]);

  // 4. Mở popup từ thanh nổi (an toàn trên cả chuột và cảm ứng điện thoại)
  const handleTriggerOpen = useCallback(() => {
    lastOpenTimeRef.current = Date.now();
    setIsOpen(true);
  }, []);

  // 5. Xử lý Kéo thả (Drag) hoặc Nhấn (Click) trên thanh nổi
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const el = badgeRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    elemStartRef.current = { x: rect.left, y: rect.top };

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasMovedRef.current = true;
    }

    if (hasMovedRef.current) {
      const el = badgeRef.current;
      const width = el?.offsetWidth || 150;
      const height = el?.offsetHeight || 36;
      const maxX = Math.max(8, window.innerWidth - width - 8);
      const maxY = Math.max(8, window.innerHeight - height - 8);

      const newX = Math.min(Math.max(8, elemStartRef.current.x + dx), maxX);
      const newY = Math.min(Math.max(68, elemStartRef.current.y + dy), maxY);

      setPosition({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    // Nếu không di chuyển (chỉ tap/click) -> mở popup
    if (!hasMovedRef.current) {
      handleTriggerOpen();
    }
  };

  // Ẩn hoàn toàn trên trang quản trị Admin
  if (pathname?.startsWith('/admin')) return null;

  // Không hiển thị nếu chưa kích hoạt hoặc chưa có ảnh
  // Thông báo ưu đãi hoặc lịch nghỉ (poster) CHỈ xuất hiện ở website chính ('/')
  if (pathname !== '/') return null;

  if (!announcement.isActive || !announcement.imageUrl) return null;

  // Không hiển thị nếu ngoài khoảng thời gian xuất hiện đã cài đặt
  const nowTime = Date.now();
  if (announcement.startDate) {
    const start = new Date(announcement.startDate).getTime();
    if (!isNaN(start) && nowTime < start) return null;
  }
  if (announcement.endDate) {
    const end = new Date(announcement.endDate).getTime();
    if (!isNaN(end) && nowTime > end) return null;
  }

  const currentImage = (isEn && announcement.imageUrlEn?.trim())
    ? announcement.imageUrlEn.trim()
    : announcement.imageUrl.trim();

  const category = announcement.category || 'holiday';

  const defaultBadgeText = category === 'promotion'
    ? (isEn ? '🎁 Special Offers' : '🎁 Ưu Đãi')
    : (category === 'custom'
      ? (isEn ? 'Notice' : 'Thông Báo')
      : (isEn ? '🧧 Holiday Schedule' : '🧧 Lịch Nghỉ Lễ'));

  const rawBadgeText = isEn
    ? (announcement.badgeTextEn?.trim() || announcement.titleEn?.trim() || defaultBadgeText)
    : (announcement.badgeTextVi?.trim() || announcement.titleVi?.trim() || defaultBadgeText);

  // Phân tích: Nếu chữ trong cài đặt đã có icon/emoji (🧧, 🎁, v.v.) thì lấy làm icon và rung
  // Nếu không có icon thì lấy icon cái chuông (Bell) và rung
  const emojiMatch = rawBadgeText.match(EMOJI_PREFIX_REGEX);
  const leadingEmoji = emojiMatch ? emojiMatch[1] : null;
  const cleanBadgeText = emojiMatch ? rawBadgeText.replace(EMOJI_PREFIX_REGEX, '').trim() : rawBadgeText;

  // Màu gradient theo chủ đề
  const badgeGradient = category === 'promotion'
    ? 'from-purple-700 via-pink-600 to-amber-500 border-amber-300/40'
    : (category === 'custom'
      ? 'from-[#173014] via-[#2D5A27] to-amber-600 border-amber-300/40'
      : 'from-red-700 via-rose-600 to-amber-500 border-amber-300/40');

  return (
    <>
      {/* Hiệu ứng rung chuông / icon (shake & swing nhẹ nhàng, lôi cuốn) */}
      <style>{`
        @keyframes petmm-icon-shake {
          0%, 100% { transform: rotate(0deg) scale(1); }
          12% { transform: rotate(-14deg) scale(1.06); }
          24% { transform: rotate(14deg) scale(1.06); }
          36% { transform: rotate(-10deg); }
          48% { transform: rotate(10deg); }
          60% { transform: rotate(-4deg); }
          72% { transform: rotate(4deg); }
          84% { transform: rotate(0deg); }
        }
        .petmm-icon-shake {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          animation: petmm-icon-shake 1.8s ease-in-out infinite;
          transform-origin: 50% 10%;
        }
      `}</style>

      {/* ── 1. POPUP POSTER (LIGHTBOX MODAL) ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={cleanBadgeText}
          className="fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-300 select-none"
        >
          {/* Backdrop — bấm ra ngoài để đóng */}
          <div
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Poster Container */}
          <div className="relative z-10 w-full max-w-[420px] sm:max-w-[480px] md:max-w-[540px] my-auto animate-in zoom-in-95 duration-300">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-[0_20px_70px_-10px_rgba(0,0,0,0.95)] flex items-center justify-center bg-transparent">
              <img
                src={currentImage}
                alt={cleanBadgeText}
                className="w-full h-auto max-h-[85vh] object-contain rounded-2xl sm:rounded-3xl shadow-2xl pointer-events-auto"
                loading="eager"
              />

              {/* Nút ✕ nhỏ gọn trực tiếp trên ảnh (Góc trên bên phải) */}
              <button
                type="button"
                onClick={handleDismissPopup}
                aria-label={isEn ? 'Close' : 'Đóng'}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 active:scale-90 text-white flex items-center justify-center backdrop-blur-md border border-white/25 shadow-lg transition-all duration-200 cursor-pointer focus:outline-none"
              >
                <X className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. THANH NỔI NHỎ GỌN (1 ICON RUNG + CHỮ MẢNH MAI, DRAGGABLE) ── */}
      {isBadgeVisible && (
        <div
          ref={badgeRef}
          role="button"
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={(e) => {
            e.stopPropagation();
            if (!hasMovedRef.current) {
              handleTriggerOpen();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleTriggerOpen();
            }
          }}
          aria-label={cleanBadgeText}
          style={position ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
          className={`fixed z-[9990] touch-none select-none cursor-pointer focus:outline-none ${
            position ? '' : 'top-20 md:top-24 right-3 sm:right-5'
          }`}
          title={isEn ? 'Click to view notice' : 'Bấm để xem thông báo'}
        >
          {/* Pill capsule nhỏ gọn, thanh lịch */}
          <div
            className={`relative inline-flex items-center gap-1.5 pl-2.5 pr-2.5 py-1.5 rounded-full text-white shadow-md border bg-gradient-to-r ${badgeGradient} hover:brightness-110 active:scale-95 transition-all duration-200`}
          >
            {/* Hào quang ping nhẹ */}
            <span
              className="absolute -inset-0.5 rounded-full bg-amber-300/15 animate-ping pointer-events-none"
              style={{ animationDuration: '3.5s' }}
            />

            {/* Phía trước CHỈ CÓ 1 ICON DUY NHẤT và RUNG:
                Nếu trong cài đặt có icon (🧧, 🎁, v.v.) thì hiển thị icon đó và rung.
                Nếu trong cài đặt không có icon thì hiển thị icon cái chuông (Bell) và rung. */}
            <span className="relative shrink-0 petmm-icon-shake">
              {leadingEmoji ? (
                <span className="text-xs sm:text-[13px] leading-none select-none drop-shadow-xs">
                  {leadingEmoji}
                </span>
              ) : (
                <Bell className="w-3.5 h-3.5 text-amber-200 fill-amber-300/30" />
              )}
            </span>

            {/* Chữ hiển thị — mảnh mai, thanh thoát (không to nét thô cứng) */}
            <span className="relative text-[11px] sm:text-xs font-normal tracking-wide whitespace-nowrap text-white/95 leading-none">
              {cleanBadgeText}
            </span>

            {/* Mũi tên nhỏ */}
            <ChevronDown
              className={`relative w-3 h-3 text-amber-200/80 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      )}
    </>
  );
}
