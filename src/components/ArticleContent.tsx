'use client';

import React, { useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { sanitizeHtml } from '@/lib/sanitize';

interface Props {
  html: string;
  htmlEn?: string | null;
  className?: string;
}

/**
 * Render HTML từ Tiptap, sau khi mount tự động wrap tất cả <table>
 * trong container cuộn ngang + nút < > trên mobile.
 * Hỗ trợ chuyển đổi song ngữ mượt mà.
 */
export default function ArticleContent({ html, htmlEn, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const rawHtml = (language === 'en' && htmlEn?.trim()) ? htmlEn : html;
  const activeHtml = sanitizeHtml(rawHtml);

  useEffect(() => {
    if (!ref.current) return;
    const tables = ref.current.querySelectorAll('table');
    if (tables.length === 0) return;

    tables.forEach((table) => {
      // Bỏ qua nếu đã wrap rồi
      if (table.parentElement?.dataset.tableWrapper) return;

      /* ── Tạo cấu trúc wrapper ── */
      const outer = document.createElement('div');
      outer.dataset.tableWrapper = '1';
      outer.style.cssText = 'position:relative; margin:1.5rem 0;';

      const scroller = document.createElement('div');
      scroller.style.cssText =
        'overflow-x:auto; -webkit-overflow-scrolling:touch; scroll-behavior:smooth;' +
        'border:1px solid #e2e8f0; border-radius:0.75rem; box-shadow:0 1px 3px rgba(0,0,0,.06);';

      table.parentNode!.insertBefore(outer, table);
      scroller.appendChild(table);
      outer.appendChild(scroller);

      /* ── Tạo nút mũi tên (chỉ hiện khi có nội dung cuộn) ── */
      const mkBtn = (side: 'left' | 'right') => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerHTML =
          side === 'left'
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"/>
               </svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"/>
               </svg>`;
        btn.style.cssText = [
          'position:absolute',
          'top:50%',
          'transform:translateY(-50%)',
          side === 'left' ? 'left:-14px' : 'right:-14px',
          'z-index:10',
          'width:28px',
          'height:28px',
          'border-radius:50%',
          'background:#fff',
          'border:1px solid #cbd5e1',
          'box-shadow:0 2px 6px rgba(0,0,0,.12)',
          'display:flex',
          'align-items:center',
          'justify-content:center',
          'color:#475569',
          'cursor:pointer',
          'transition:opacity .2s,color .2s',
          'opacity:0',
          'pointer-events:none',
        ].join(';');
        outer.appendChild(btn);
        return btn;
      };

      const leftBtn = mkBtn('left');
      const rightBtn = mkBtn('right');

      /* ── Cập nhật trạng thái nút ── */
      const sync = () => {
        const { scrollLeft, scrollWidth, clientWidth } = scroller;
        const canScroll = scrollWidth > clientWidth + 2;

        const showLeft = canScroll && scrollLeft > 2;
        const showRight = canScroll && scrollLeft < scrollWidth - clientWidth - 2;

        leftBtn.style.opacity = showLeft ? '1' : '0';
        leftBtn.style.pointerEvents = showLeft ? 'auto' : 'none';
        rightBtn.style.opacity = showRight ? '1' : '0';
        rightBtn.style.pointerEvents = showRight ? 'auto' : 'none';
      };

      const STEP = 180;
      leftBtn.addEventListener('click', () => { scroller.scrollLeft -= STEP; });
      rightBtn.addEventListener('click', () => { scroller.scrollLeft += STEP; });
      scroller.addEventListener('scroll', sync, { passive: true });

      // Gọi sync sau khi layout xong
      requestAnimationFrame(() => setTimeout(sync, 50));
    });
  }, [activeHtml]);

  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: activeHtml }}
    />
  );
}
