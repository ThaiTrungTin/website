'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Hook lắng nghe khi một tiêu đề đi vào hoặc ra khỏi khung nhìn (viewport)
 * Hỗ trợ hiệu ứng xuất hiện cả khi lướt xuống và khi lướt ngược lên
 */
export function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            // Khi tiêu đề cuộn hoàn toàn ra khỏi màn hình (lướt lên hoặc lướt xuống)
            // reset về false để khi cuộn tới lại thì kích hoạt lại hiệu ứng xuất hiện
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -20px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

interface ScrollRevealTitleProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
}

/**
 * Component bao bọc tiêu đề để tạo hiệu ứng xuất hiện sang trọng
 * Chỉ áp dụng cho tiêu đề, nội dung bên dưới giữ nguyên 100% tĩnh không bị ẩn hay chớp nháy
 */
export default function ScrollRevealTitle({
  children,
  className = '',
  delay = 0,
}: ScrollRevealTitleProps) {
  const { ref, isVisible } = useScrollReveal();

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: '850ms',
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform, opacity, filter',
      }}
      className={`transition-all ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 blur-0'
          : 'opacity-0 translate-y-8 scale-[0.97] blur-[5px]'
      } ${className}`}
    >
      {children}
    </div>
  );
}
