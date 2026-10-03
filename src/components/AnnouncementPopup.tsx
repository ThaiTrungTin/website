'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { X, Sparkles, Calendar, Bell, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { PopupAnnouncementConfig, DEFAULT_ANNOUNCEMENT } from '@/app/api/announcement/route';

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
  // Guard: ngăn backdrop đóng popup ngay sau khi mở từ thanh nổi (mobile touch event chain)
  const justOpenedRef = useRef(false);

  // 1. Tải cấu hình thông báo từ API
  useEffect(() => {
    let isMounted = true;
    async function loadAnnouncement() {
      try {
        const res = await fetch('/api/announcement');
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          setAnnouncement(json.data);

          if (json.data.isActive && json.data.imageUrl) {
            setIsBadgeVisible(true);

            const dismissedSession = sessionStorage.getItem('petmm_popup_dismissed');
            if (dismissedSession !== 'true') {
              const delayMs = (json.data.autoOpenDelaySeconds || 1.2) * 1000;
              const timer = setTimeout(() => {
                if (isMounted) setIsOpen(true);
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

  // 2. Đóng popup poster
  const handleDismissPopup = useCallback(() => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('petmm_popup_dismissed', 'true');
    } catch {}
  }, []);

  // 3. Backdrop click — chỉ đóng nếu không phải ngay sau khi mở từ thanh nổi
  const handleBackdropClick = useCallback(() => {
    if (justOpenedRef.current) return;
    handleDismissPopup();
  }, [handleDismissPopup]);

  // 4. Xử lý Kéo thả (Drag) hoặc Nhấn (Click) trên thanh nổi
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
    e.preventDefault();
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
      const width = el?.offsetWidth || 160;
      const height = el?.offsetHeight || 38;
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

    // Nếu không kéo → tính là click, toggle popup
    if (!hasMovedRef.current) {
      // Guard 50ms để backdrop click không fire ngay sau (mobile)
      justOpenedRef.current = true;
      setTimeout(() => { justOpenedRef.current = false; }, 80);
      setIsOpen((prev) => !prev);
    }
  };

  // Ẩn hoàn toàn trên trang quản trị Admin
  if (pathname?.startsWith('/admin')) return null;

  // Không hiển thị nếu chưa kích hoạt hoặc chưa có ảnh
  if (!announcement.isActive || !announcement.imageUrl) return null;

  const currentImage = (isEn && announcement.imageUrlEn?.trim())
    ? announcement.imageUrlEn.trim()
    : announcement.imageUrl.trim();

  const category = announcement.category || 'holiday';

  const defaultBadgeText = category === 'promotion'
    ? (isEn ? '🎁 Special Offers' : '🎁 Ưu Đãi')
    : (category === 'custom'
      ? (isEn ? 'Notice' : 'Thông Báo')
      : (isEn ? '🧧 Holiday Schedule' : '🧧 Lịch Nghỉ Lễ'));

  const currentBadgeText = isEn
    ? (announcement.badgeTextEn?.trim() || announcement.titleEn?.trim() || defaultBadgeText)
    : (announcement.badgeTextVi?.trim() || announcement.titleVi?.trim() || defaultBadgeText);

  // Màu gradient theo chủ đề
  const badgeGradient = category === 'promotion'
    ? 'from-purple-700 via-pink-600 to-amber-500 border-amber-300/40'
    : (category === 'custom'
      ? 'from-[#173014] via-[#2D5A27] to-amber-600 border-amber-300/40'
      : 'from-red-700 via-rose-600 to-amber-500 border-amber-300/40');

  // Icon theo chủ đề — custom không có icon rõ → dùng Bell rung
  const BadgeIcon = category === 'promotion'
    ? Sparkles
    : (category === 'custom' ? Bell : Calendar);

  return (
    <>
      {/* Keyframe animation cho Bell (wiggle) */}
      <style>{`
        @keyframes petmm-wiggle {
          0%,100% { transform: rotate(-18deg); }
          20% { transform: rotate(18deg); }
          40% { transform: rotate(-12deg); }
          60% { transform: rotate(12deg); }
          80% { transform: rotate(-6deg); }
        }
        .petmm-bell { animation: petmm-wiggle 1.4s ease-in-out infinite; }
        .petmm-bounce { animation: bounce 1.8s ease-in-out infinite; }
      `}</style>

      {/* ── 1. POPUP POSTER (LIGHTBOX MODAL) ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={currentBadgeText}
          className="fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-300"
        >
          {/* Backdrop — bấm ra ngoài để đóng */}
          <div
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Poster */}
          <div className="relative z-10 w-full max-w-[420px] sm:max-w-[480px] md:max-w-[540px] my-auto animate-in zoom-in-95 duration-300">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-[0_20px_70px_-10px_rgba(0,0,0,0.95)] flex items-center justify-center bg-transparent">
              <img
                src={currentImage}
                alt={currentBadgeText}
                className="w-full h-auto max-h-[85vh] object-contain rounded-2xl sm:rounded-3xl shadow-2xl"
                loading="eager"
              />

              {/* Nút ✕ nhỏ gọn trực tiếp trên ảnh */}
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

      {/* ── 2. THANH NỔI NHỎ GỌN (DRAGGABLE, KHÔNG TẮT ĐƯỢC) ── */}
      {isBadgeVisible && (
        <div
          ref={badgeRef}
          role="button"
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              justOpenedRef.current = true;
              setTimeout(() => { justOpenedRef.current = false; }, 80);
              setIsOpen((prev) => !prev);
            }
          }}
          aria-label={currentBadgeText}
          style={position ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
          className={`fixed z-[9990] touch-none select-none cursor-pointer focus:outline-none ${
            position ? '' : 'top-20 md:top-24 right-3 sm:right-5'
          }`}
          title={isEn ? 'Click to view notice' : 'Bấm để xem thông báo'}
        >
          {/* Pill badge nhỏ gọn */}
          <div
            className={`relative inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full text-white shadow-md border bg-gradient-to-r ${badgeGradient} hover:brightness-110 active:scale-95 transition-all duration-200`}
          >
            {/* Hào quang ping nhẹ */}
            <span
              className="absolute -inset-0.5 rounded-full bg-amber-300/15 animate-ping pointer-events-none"
              style={{ animationDuration: '3.5s' }}
            />

            {/* Icon — bounce hoặc bell-wiggle */}
            <span className={`relative shrink-0 ${category === 'custom' ? 'petmm-bell' : 'petmm-bounce'}`}>
              <BadgeIcon className="w-3.5 h-3.5 text-amber-100" />
            </span>

            {/* Chữ — mảnh mai, 11px */}
            <span className="relative text-[11px] font-medium tracking-wide whitespace-nowrap text-white/90 leading-none">
              {currentBadgeText}
            </span>

            {/* Chevron mở/đóng */}
            <ChevronDown
              className={`relative w-3 h-3 text-amber-200/70 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      )}
    </>
  );
}
