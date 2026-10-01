'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function ScrollNavigationButtons() {
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // Ẩn mũi tên lên khi đang ở đầu trang (dưới 120px)
      setCanScrollUp(scrollY > 120);

      // Ẩn mũi tên xuống khi đã cuộn tới sát cuối trang (còn dưới 120px)
      setCanScrollDown(scrollY + windowHeight < docHeight - 120);

      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 650);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  if (!canScrollUp && !canScrollDown) return null;

  return (
    <aside
      aria-label="Điều hướng cuộn trang"
      className={`fixed right-[64px] sm:right-[92px] bottom-24 sm:bottom-12 z-40 flex flex-col items-center gap-1 select-none transition-all duration-500 ease-out ${
        isScrolling
          ? 'translate-x-32 opacity-0 pointer-events-none'
          : 'translate-x-0 opacity-100 pointer-events-auto'
      }`}
    >
      {/* 1. Mũi tên Đầu Trang (Chỉ hiện khi đã cuộn xuống, ẩn khi ở đầu trang) */}
      {canScrollUp && (
        <button
          onClick={scrollToTop}
          aria-label="Cuộn lên đầu trang"
          title="Lên đầu trang"
          className="group relative flex items-center justify-center p-1 sm:p-1.5 text-slate-800 hover:text-[#2D5A27] hover:scale-125 active:scale-90 transition-all duration-200 cursor-pointer drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] bg-transparent"
        >
          {/* Tooltip on Desktop hover (Bên trái nút) */}
          <span className="hidden sm:block absolute right-full mr-2 px-2.5 py-1 rounded-xl bg-slate-900/90 text-white text-[11px] font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
            Lên đầu trang
          </span>

          <ChevronUp className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.5]" />
        </button>
      )}

      {/* 2. Mũi tên Cuối Trang (Chỉ hiện khi chưa tới cuối, ẩn khi đã ở cuối trang) */}
      {canScrollDown && (
        <button
          onClick={scrollToBottom}
          aria-label="Cuộn xuống cuối trang"
          title="Xuống cuối trang"
          className="group relative flex items-center justify-center p-1 sm:p-1.5 text-slate-800 hover:text-[#2D5A27] hover:scale-125 active:scale-90 transition-all duration-200 cursor-pointer drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] bg-transparent"
        >
          {/* Tooltip on Desktop hover (Bên trái nút) */}
          <span className="hidden sm:block absolute right-full mr-2 px-2.5 py-1 rounded-xl bg-slate-900/90 text-white text-[11px] font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
            Xuống cuối trang
          </span>

          <ChevronDown className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.5]" />
        </button>
      )}
    </aside>
  );
}
