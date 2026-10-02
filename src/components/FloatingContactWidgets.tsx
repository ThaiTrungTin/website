'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PhoneCall, X } from 'lucide-react';
import { useSystemConfig } from '@/context/SystemConfigContext';
import { useLanguage } from '@/context/LanguageContext';

interface ContactChannel {
  id: string;
  nameVi: string;
  nameEn: string;
  url: string;
  bgColor: string;
  renderIcon: () => React.ReactNode;
}

export default function FloatingContactWidgets() {
  const { config } = useSystemConfig();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [isScrolling, setIsScrolling] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Quản lý kênh hiện tại và kênh đang lướt ra (để lướt trọn vẹn 100%)
  const [currentIdx, setCurrentIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [isSliding, setIsSliding] = useState(false);

  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  /* ── 1. Ẩn widget khi đang cuộn trang nhanh ── */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 650);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  /* ── 2. Click ra ngoài màn hình để thu gọn menu ── */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const hotlineRaw = (config.hotline || '').replace(/\s+/g, '');
  const hotlineDisplay = config.hotline_hien_thi || config.hotline || '';
  const zaloUrl = config.link_zalo?.trim() || '';
  const messengerUrl = config.link_messenger?.trim() || '';
  const facebookUrl = config.link_facebook?.trim() || '';
  const tiktokUrl = config.link_tiktok?.trim() || '';
  const email = config.email?.trim() || '';

  /* ── 3. Danh sách các kênh chat / hỗ trợ ── */
  const availableChannels: ContactChannel[] = useMemo(() => {
    const channels: ContactChannel[] = [];

    // Zalo
    if (zaloUrl && zaloUrl !== '#') {
      channels.push({
        id: 'zalo',
        nameVi: 'Chat Zalo Bác Sĩ Tư Vấn',
        nameEn: 'Chat with Vet on Zalo',
        url: zaloUrl,
        bgColor: 'bg-[#0068FF]',
        renderIcon: () => (
          <span className="font-black text-xs sm:text-sm tracking-tighter">Zalo</span>
        ),
      });
    }

    // Messenger
    if (messengerUrl && messengerUrl !== '#') {
      channels.push({
        id: 'messenger',
        nameVi: 'Nhắn Tin Facebook Messenger',
        nameEn: 'Message on Messenger',
        url: messengerUrl,
        bgColor: 'bg-gradient-to-tr from-[#00B2FF] via-[#006AFF] to-[#9B00E8]',
        renderIcon: () => (
          <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-white" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.518 3.734 7.218V22l3.39-1.86c.917.254 1.884.39 2.876.39 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.066 12.455l-2.585-2.758-5.047 2.758 5.553-5.895 2.65 2.758 4.982-2.758-5.553 5.895z" />
          </svg>
        ),
      });
    }

    // Fanpage Facebook
    if (facebookUrl && facebookUrl !== '#') {
      channels.push({
        id: 'facebook',
        nameVi: 'Fanpage Facebook Chính Thức',
        nameEn: 'Official Facebook Fanpage',
        url: facebookUrl,
        bgColor: 'bg-[#1877F2]',
        renderIcon: () => (
          <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-white" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        ),
      });
    }

    // TikTok
    if (tiktokUrl && tiktokUrl !== '#') {
      channels.push({
        id: 'tiktok',
        nameVi: 'Kênh TikTok PetM&M',
        nameEn: 'PetM&M TikTok Channel',
        url: tiktokUrl,
        bgColor: 'bg-slate-950',
        renderIcon: () => (
          <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-white" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
          </svg>
        ),
      });
    }

    // Gmail
    if (email && email !== '#') {
      channels.push({
        id: 'gmail',
        nameVi: `Gửi Email: ${email}`,
        nameEn: `Send Email to ${email}`,
        url: `mailto:${email}`,
        bgColor: 'bg-white border border-slate-200',
        renderIcon: () => (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M1.5 19.5h4.5V9.75L1.5 6.375z" />
            <path fill="#34A853" d="M18 19.5h4.5v-13.125L18 9.75z" />
            <path fill="#EA4335" d="M18 6.375V9.75L12 14.25 6 9.75V6.375l6-4.5z" />
            <path fill="#FBBC05" d="M1.5 6.375L6 9.75V6.375l-4.5-3.375C1.5 3 1.5 6.375 1.5 6.375z" />
            <path fill="#C5221F" d="M22.5 3l-4.5 3.375V9.75l4.5-3.375z" />
          </svg>
        ),
      });
    }

    return channels;
  }, [zaloUrl, messengerUrl, facebookUrl, tiktokUrl, email]);

  /* ── 4. Timer lướt ngang trọn vẹn mỗi 3.2 giây ── */
  useEffect(() => {
    if (isOpen || isHovered || availableChannels.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIdx((prev) => {
        setPrevIdx(prev);
        setIsSliding(true);
        return (prev + 1) % availableChannels.length;
      });
    }, 3200);

    return () => clearInterval(interval);
  }, [isOpen, isHovered, availableChannels.length]);

  // Tự động kết thúc hiệu ứng trượt sau 450ms và dọn dẹp kênh cũ
  useEffect(() => {
    if (!isSliding) return;
    const timer = setTimeout(() => {
      setIsSliding(false);
      setPrevIdx(null);
    }, 450);
    return () => clearTimeout(timer);
  }, [isSliding]);

  const currentChannel = availableChannels[currentIdx] || availableChannels[0];

  return (
    <div
      ref={widgetRef}
      className={`fixed left-3 md:left-auto md:right-6 bottom-6 sm:bottom-8 z-50 flex flex-col items-start md:items-end gap-2.5 sm:gap-3 select-none transition-all duration-500 ease-out ${
        isScrolling
          ? '-translate-x-32 md:translate-x-32 opacity-0 pointer-events-none'
          : 'translate-x-0 opacity-100 pointer-events-auto'
      }`}
    >
      {/* ── 1. NÚT HOTLINE CẤP CỨU 24/7 (ĐẶT ĐỘC LẬP TRÊN CÙNG - 1 CHẠM GỌI NGAY) ── */}
      {hotlineRaw && (
        <a
          href={`tel:${hotlineRaw}`}
          aria-label={isEn ? 'Call 24/7 Emergency Hotline' : 'Gọi Hotline Cấp Cứu 24/7'}
          className="group/item relative flex items-center"
        >
          <div className="relative flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-xl shadow-rose-900/50 hover:scale-110 active:scale-95 transition-all duration-300">
            <span
              className="absolute -inset-1 rounded-full bg-rose-500/40 animate-ping pointer-events-none"
              style={{ animationDuration: '2s' }}
            />
            <PhoneCall className="w-5 h-5 sm:w-6 sm:h-6 fill-white animate-bounce" />
          </div>
          <span className="hidden sm:block absolute left-full ml-3 md:left-auto md:ml-0 md:right-full md:mr-3 px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/20 text-white text-xs font-bold whitespace-nowrap shadow-xl opacity-0 -translate-x-1 md:translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-200 pointer-events-none">
            <span className="text-[#FFB800] font-black">Hotline 24/7:</span> {hotlineDisplay}
          </span>
        </a>
      )}

      {/* ── 2. DANH SÁCH CÁC KÊNH CHAT BUNG RA KHI MỞ (Zalo, Messenger, FB, Gmail) ── */}
      {isOpen && (
        <div className="flex flex-col items-start md:items-end gap-2.5 sm:gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {availableChannels.map((channel, idx) => (
            <a
              key={channel.id}
              href={channel.url}
              target={channel.id === 'gmail' ? undefined : '_blank'}
              rel={channel.id === 'gmail' ? undefined : 'noopener noreferrer'}
              aria-label={isEn ? channel.nameEn : channel.nameVi}
              className="group/item relative flex items-center transition-transform duration-200 hover:scale-105"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div
                className={`relative flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-full text-white shadow-xl shadow-slate-950/25 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/30 ${channel.bgColor}`}
              >
                {channel.renderIcon()}
              </div>
              {/* Tooltip khi rê chuột vào từng icon */}
              <span className="hidden sm:block absolute left-full ml-3 md:left-auto md:ml-0 md:right-full md:mr-3 px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/20 text-white text-xs font-bold whitespace-nowrap shadow-xl opacity-0 -translate-x-1 md:translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-200 pointer-events-none">
                {isEn ? channel.nameEn : channel.nameVi}
              </span>
            </a>
          ))}
        </div>
      )}

      {/* ── 3. NÚT FAB CHÍNH (LƯỚT NGANG TRỌN VẸN 100% TỪNG ICON) ── */}
      {availableChannels.length > 0 && (
        <div className="relative">
          {isOpen ? (
            /* Nút đóng (X) khi menu đang mở */
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={isEn ? 'Close contact menu' : 'Đóng menu liên hệ'}
              className="group/item relative flex items-center cursor-pointer focus:outline-none"
            >
              <div className="relative flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-slate-900 text-white shadow-2xl hover:scale-110 hover:bg-slate-800 active:scale-95 transition-all duration-300 border border-white/30">
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="hidden sm:block absolute left-full ml-3 md:left-auto md:ml-0 md:right-full md:mr-3 px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/20 text-white text-xs font-bold whitespace-nowrap shadow-xl opacity-0 -translate-x-1 md:translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-200 pointer-events-none">
                {isEn ? 'Collapse menu' : 'Thu gọn'}
              </span>
            </button>
          ) : (
            /* Nút tròn với hiệu ứng các icon LƯỚT NGANG TRỌN VẸN 100% */
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              aria-label={isEn ? 'Open contact channels' : 'Mở các kênh liên hệ'}
              className="group/item relative flex items-center cursor-pointer focus:outline-none"
            >
              {/* Tooltip khi rê chuột vào nút tròn đang lướt */}
              <span className="hidden sm:block absolute left-full ml-3 md:left-auto md:ml-0 md:right-full md:mr-3 px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/20 text-white text-xs font-bold whitespace-nowrap shadow-xl opacity-0 -translate-x-1 md:translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-200 pointer-events-none">
                <span className="text-[#FFB800] font-black">
                  {isEn ? 'Chat & Support:' : 'Chat & Hỗ Trợ:'}
                </span>{' '}
                {isEn ? currentChannel?.nameEn : currentChannel?.nameVi}
              </span>

              {/* Vỏ nút tròn chuẩn (bảo toàn bo tròn và bóng đổ) */}
              <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-transform duration-300 border border-white/40 bg-slate-900 flex items-center justify-center">
                
                {/* Lớp chứa nội dung trượt lướt ngang được clip tròn 100% */}
                <div
                  className="absolute inset-0 w-full h-full rounded-full overflow-hidden flex items-center justify-center"
                  style={{ clipPath: 'circle(50% at 50% 50%)', WebkitClipPath: 'circle(50% at 50% 50%)' }}
                >
                  {/* 1. Icon cũ: Lướt sang trái và ra khỏi nút (-100%) */}
                  {isSliding && prevIdx !== null && availableChannels[prevIdx] && (
                    <div
                      key={`prev-${availableChannels[prevIdx].id}-${prevIdx}`}
                      className={`absolute inset-0 w-full h-full rounded-full flex items-center justify-center text-white animate-fab-slide-out ${availableChannels[prevIdx].bgColor}`}
                    >
                      {availableChannels[prevIdx].renderIcon()}
                    </div>
                  )}

                  {/* 2. Icon mới: Lướt vào từ bên phải (100% -> 0%) và chiếm TRỌN VẸN 100% vòng tròn */}
                  {currentChannel && (
                    <div
                      key={`curr-${currentChannel.id}-${currentIdx}`}
                      className={`absolute inset-0 w-full h-full rounded-full flex items-center justify-center text-white ${
                        isSliding ? 'animate-fab-slide-in' : ''
                      } ${currentChannel.bgColor}`}
                    >
                      {currentChannel.renderIcon()}
                    </div>
                  )}
                </div>

                {/* Vòng hào quang phát sáng nhẹ */}
                <span
                  className="absolute -inset-1 rounded-full bg-blue-400/30 animate-ping opacity-60 pointer-events-none"
                  style={{ animationDuration: '2.5s' }}
                />

                {/* Badge đếm số kênh liên hệ */}
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm z-10 pointer-events-none">
                  {availableChannels.length}
                </span>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
