'use client';

import React from 'react';
import { PhoneCall } from 'lucide-react';
import { useSystemConfig } from '@/context/SystemConfigContext';

export default function FloatingContactWidgets() {
  const { config } = useSystemConfig();

  const hotlineRaw = (config.hotline || '').replace(/\s+/g, '');
  const hotlineDisplay = config.hotline_hien_thi || config.hotline || '';
  const zaloUrl = config.link_zalo?.trim() || '';
  const messengerUrl = config.link_messenger?.trim() || '';
  const facebookUrl = config.link_facebook?.trim() || '';
  const tiktokUrl = config.link_tiktok?.trim() || '';
  const email = config.email?.trim() || '';

  return (
    <div className="fixed right-3 sm:right-6 bottom-20 sm:bottom-8 z-50 flex flex-col items-end gap-2.5 sm:gap-3 select-none">
      {/* 1. Hotline 24/7 (Hiển thị icon nút gọi nổi trên cả điện thoại và máy tính) */}
      {hotlineRaw && (
        <a
          href={`tel:${hotlineRaw}`}
          aria-label="Gọi Hotline"
          className="group relative flex items-center"
        >
          <span className="hidden sm:block absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/20 text-white text-xs font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
            <span className="text-[#FFB800] font-black">Hotline:</span> {hotlineDisplay}
          </span>
          <div className="relative flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-xl shadow-rose-900/50 hover:scale-110 active:scale-95 transition-all duration-300">
            <span className="absolute -inset-1 rounded-full bg-rose-500/40 animate-ping" style={{ animationDuration: '2s' }} />
            <PhoneCall className="w-5 h-5 sm:w-6 sm:h-6 fill-white animate-bounce" />
          </div>
        </a>
      )}

      {/* 2. Zalo Chat (Ẩn nếu không có) */}
      {zaloUrl && zaloUrl !== '#' && (
        <a
          href={zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat Zalo Với Bác Sĩ"
          className="group relative flex items-center"
        >
          <span className="hidden sm:block absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/20 text-white text-xs font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
            Chat Zalo Bác Sĩ Tư Vấn
          </span>
          <div className="relative flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#0068FF] text-white shadow-xl shadow-blue-900/40 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/30">
            <span className="font-black text-xs sm:text-sm tracking-tighter">Zalo</span>
          </div>
        </a>
      )}

      {/* 3. Facebook Messenger (Ẩn nếu không có) */}
      {messengerUrl && messengerUrl !== '#' && (
        <a
          href={messengerUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Nhắn tin Facebook Messenger"
          className="group relative flex items-center"
        >
          <span className="hidden sm:block absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/20 text-white text-xs font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
            Nhắn Tin Facebook Messenger
          </span>
          <div className="relative flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-[#00B2FF] via-[#006AFF] to-[#9B00E8] text-white shadow-xl shadow-indigo-900/40 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/30">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-white" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.518 3.734 7.218V22l3.39-1.86c.917.254 1.884.39 2.876.39 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.066 12.455l-2.585-2.758-5.047 2.758 5.553-5.895 2.65 2.758 4.982-2.758-5.553 5.895z" />
            </svg>
          </div>
        </a>
      )}

      {/* 4. Fanpage Facebook (Ẩn nếu không có) */}
      {facebookUrl && facebookUrl !== '#' && (
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Fanpage Facebook"
          className="group relative flex items-center"
        >
          <span className="hidden sm:block absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/20 text-white text-xs font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
            Fanpage Facebook
          </span>
          <div className="relative flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#1877F2] text-white shadow-xl shadow-blue-900/40 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/30">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-white" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
        </a>
      )}

      {/* 5. Kênh TikTok (Ẩn nếu không có) */}
      {tiktokUrl && tiktokUrl !== '#' && (
        <a
          href={tiktokUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Kênh TikTok"
          className="group relative flex items-center"
        >
          <span className="hidden sm:block absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/20 text-white text-xs font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
            Kênh TikTok
          </span>
          <div className="relative flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-slate-950 text-white shadow-xl shadow-black/50 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-white" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
            </svg>
          </div>
        </a>
      )}

      {/* 6. Gmail Liên Hệ (Ẩn nếu không có) */}
      {email && email !== '#' && (
        <a
          href={`mailto:${email}`}
          aria-label={`Gửi Gmail tới ${email}`}
          className="group relative flex items-center"
        >
          <span className="hidden sm:block absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/20 text-white text-xs font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
            <span className="text-[#EA4335] font-black">Gmail:</span> {email}
          </span>
          <div className="relative flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white text-slate-800 shadow-xl shadow-slate-900/30 hover:scale-110 active:scale-95 transition-all duration-300 border border-slate-200">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M1.5 19.5h4.5V9.75L1.5 6.375z" />
              <path fill="#34A853" d="M18 19.5h4.5v-13.125L18 9.75z" />
              <path fill="#EA4335" d="M18 6.375V9.75L12 14.25 6 9.75V6.375l6-4.5z" />
              <path fill="#FBBC05" d="M1.5 6.375L6 9.75V6.375l-4.5-3.375C1.5 3 1.5 6.375 1.5 6.375z" />
              <path fill="#C5221F" d="M22.5 3l-4.5 3.375V9.75l4.5-3.375z" />
            </svg>
          </div>
        </a>
      )}
    </div>
  );
}
