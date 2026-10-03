'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { X, Sparkles, Megaphone, Calendar, GripVertical, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { PopupAnnouncementConfig, DEFAULT_ANNOUNCEMENT } from '@/app/api/announcement/route';

export default function AnnouncementPopup() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [announcement, setAnnouncement] = useState<PopupAnnouncementConfig>(DEFAULT_ANNOUNCEMENT);
  const [isOpen, setIsOpen] = useState(false);
  const [isBadgeVisible, setIsBadgeVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Kéo thả thanh đóng mở (Draggable state)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const elemStartRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const badgeRef = useRef<HTMLDivElement>(null);

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

            // Kiểm tra xem khách đã từng xem/đóng trong phiên này chưa
            const dismissedSession = sessionStorage.getItem('petmm_popup_dismissed');
            if (dismissedSession !== 'true') {
              const delayMs = (json.data.autoOpenDelaySeconds || 1.2) * 1000;
              const timer = setTimeout(() => {
                setIsOpen(true);
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

  // 2. Đóng popup poster lớn
  const handleDismissPopup = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('petmm_popup_dismissed', 'true');
    } catch {}
  };

  // 3. Xử lý Kéo thả (Drag) hoặc Nhấn (Click) trên thanh nổi
  const handlePointerDown = (e: React.PointerEvent) => {
    // Chỉ xử lý nút chuột trái hoặc chạm ngón tay
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
      const width = el?.offsetWidth || 180;
      const height = el?.offsetHeight || 44;
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

    // Nếu không kéo (di chuyển < 5px) -> Tính là click để đóng/mở popup
    if (!hasMovedRef.current) {
      setIsOpen((prev) => !prev);
    }
  };

  // Ẩn hoàn toàn trên trang quản trị Admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Không hiển thị nếu chưa kích hoạt hoặc chưa có ảnh
  if (!announcement.isActive || !announcement.imageUrl) {
    return null;
  }

  const currentImage = (isEn && announcement.imageUrlEn?.trim())
    ? announcement.imageUrlEn.trim()
    : announcement.imageUrl.trim();

  const category = announcement.category || 'holiday';

  const defaultBadgeText = category === 'promotion'
    ? (isEn ? '🎁 Special Offers' : '🎁 Ưu Đãi Đặc Biệt')
    : (category === 'custom'
      ? (isEn ? '📢 Notice' : '📢 Thông Báo')
      : (isEn ? '🧧 Holiday Schedule' : '🧧 Lịch Nghỉ Lễ / Tết'));

  const currentBadgeText = isEn
    ? (announcement.badgeTextEn?.trim() || announcement.badgeTextVi || defaultBadgeText)
    : (announcement.badgeTextVi?.trim() || defaultBadgeText);

  const defaultTitle = category === 'promotion'
    ? (isEn ? 'Special Offers & Promotions' : 'Chương Trình Ưu Đãi Đặc Biệt')
    : (category === 'custom'
      ? (isEn ? 'Official Announcement' : 'Thông Báo Chính Thức')
      : (isEn ? 'Holiday Schedule & Duty Notice' : 'Thông Báo Lịch Nghỉ Lễ & Lịch Trực Tết'));

  const currentTitle = isEn
    ? (announcement.titleEn?.trim() || announcement.titleVi || defaultTitle)
    : (announcement.titleVi?.trim() || defaultTitle);

  // Giao diện màu sắc theo chủ đề
  const badgeThemeClasses = category === 'promotion'
    ? 'bg-gradient-to-r from-purple-700 via-pink-600 to-amber-500 shadow-purple-950/40 border-amber-300/60'
    : (category === 'custom'
      ? 'bg-gradient-to-r from-[#173014] via-[#2D5A27] to-amber-600 shadow-emerald-950/40 border-amber-300/60'
      : 'bg-gradient-to-r from-red-700 via-rose-600 to-amber-600 shadow-red-950/40 border-amber-300/60');

  return (
    <>
      {/* ── 1. POPUP POSTER THÔNG BÁO (LIGHTBOX MODAL) ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={currentTitle}
          className="fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-300"
        >
          {/* Backdrop tối mờ sang trọng */}
          <div
            onClick={handleDismissPopup}
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity cursor-pointer"
          />

          {/* Khung nội dung Poster */}
          <div className="relative z-10 w-full max-w-[420px] sm:max-w-[480px] md:max-w-[540px] my-auto animate-in zoom-in-95 duration-300">
            {/* Nút đóng (✕) lớn, chuẩn tay bấm */}
            <button
              type="button"
              onClick={handleDismissPopup}
              aria-label={isEn ? 'Close announcement' : 'Đóng thông báo'}
              className="absolute -top-3.5 -right-3.5 sm:-top-4 sm:-right-4 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-900/95 hover:bg-rose-600 text-white border-2 border-white/80 shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer focus:outline-none"
              title={isEn ? 'Close notice' : 'Đóng thông báo'}
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

              {/* Tấm ảnh Poster (ĐÃ BỎ NÚT ĐẶT LỊCH THEO YÊU CẦU CỦA USER) */}
              <div
                onClick={handleDismissPopup}
                className="relative w-full max-h-[72vh] sm:max-h-[78vh] bg-slate-900 overflow-hidden cursor-pointer flex items-center justify-center"
                title={isEn ? 'Click to close' : 'Bấm vào ảnh hoặc nền để đóng'}
              >
                <img
                  src={currentImage}
                  alt={currentTitle}
                  className="w-full h-auto max-h-[72vh] sm:max-h-[78vh] object-contain transition-transform duration-500 group-hover/card:scale-[1.01]"
                  loading="eager"
                />
              </div>

              {/* Footer thanh lịch, tối giản (không có nút Đặt lịch) */}
              <div className="py-2.5 px-4 bg-slate-950/95 border-t border-white/10 flex items-center justify-between text-slate-400 text-xs">
                <span className="text-[11px] text-slate-400">
                  {isEn ? 'Tap anywhere or ✕ to close' : 'Chạm vào ảnh hoặc nút ✕ để đóng'}
                </span>
                <button
                  type="button"
                  onClick={handleDismissPopup}
                  className="px-3.5 py-1 rounded-lg bg-white/10 hover:bg-rose-600/80 hover:text-white text-slate-200 font-semibold text-xs transition cursor-pointer"
                >
                  {isEn ? 'Close' : 'Đóng'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. THANH ĐÓNG/MỞ NỔI Ở GÓC TRÊN BÊN PHẢI (DRAGGABLE & KHÔNG TẮT ĐƯỢC) ── */}
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
              setIsOpen((prev) => !prev);
            }
          }}
          aria-label={currentBadgeText}
          style={position ? { left: `${position.x}px`, top: `${position.y}px` } : undefined}
          className={`fixed z-[9990] touch-none select-none cursor-grab active:cursor-grabbing transition-transform focus:outline-none ${
            position ? '' : 'top-20 md:top-24 right-3 sm:right-6'
          }`}
          title={isEn ? 'Drag to move, click to toggle notice' : 'Kéo để di chuyển, bấm để đóng/mở thông báo'}
        >
          {/* Khung thanh đóng mở ưu đãi nổi */}
          <div
            className={`relative inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-full text-white font-bold text-xs sm:text-sm shadow-2xl border hover:scale-105 active:scale-95 transition-all duration-200 ${badgeThemeClasses}`}
          >
            {/* Vòng hào quang phát sáng nhẹ */}
            <span
              className="absolute -inset-1 rounded-full bg-amber-400/25 animate-ping pointer-events-none"
              style={{ animationDuration: '3s' }}
            />

            {/* Tay nắm kéo (Grip Handle Indicator) */}
            <span className="relative flex items-center justify-center text-white/60 hover:text-white shrink-0">
              <GripVertical className="w-3.5 h-3.5" />
            </span>

            {/* Icon theo chủ đề */}
            <span className="relative flex items-center justify-center text-sm sm:text-base shrink-0 animate-bounce">
              {category === 'promotion' ? (
                <Sparkles className="w-4 h-4 text-amber-200" />
              ) : category === 'custom' ? (
                <Megaphone className="w-4 h-4 text-amber-200" />
              ) : (
                <Calendar className="w-4 h-4 text-amber-200" />
              )}
            </span>

            {/* Nội dung nhãn (Lịch Nghỉ Lễ / Ưu Đãi) */}
            <span className="relative font-extrabold tracking-tight drop-shadow-sm whitespace-nowrap pr-0.5">
              {currentBadgeText}
            </span>

            {/* Biểu tượng mũi tên mở/đóng */}
            <span className="relative text-amber-200 shrink-0">
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </span>
          </div>
        </div>
      )}
    </>
  );
}
