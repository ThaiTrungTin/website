'use client';

import React, { useState, useRef } from 'react';
import { Maximize2, Minimize2, RotateCcw } from 'lucide-react';

interface AdminResizableModalProps {
  children: React.ReactNode;
  className?: string;
  minWidth?: number;
  minHeight?: number;
}

export default function AdminResizableModal({
  children,
  className = '',
  minWidth = 420,
  minHeight = 360,
}: AdminResizableModalProps) {
  const [size, setSize] = useState<{ width: number | null; height: number | null }>({
    width: null,
    height: null,
  });
  const [isMaximized, setIsMaximized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeStateRef = useRef<{
    direction: 'e' | 'w' | 's' | 'se' | 'sw';
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  // Xử lý kéo dãn (Resize) theo các hướng: cánh trái, cánh phải, đáy, góc
  const handleMouseDown = (e: React.MouseEvent, direction: 'e' | 'w' | 's' | 'se' | 'sw') => {
    e.preventDefault();
    e.stopPropagation();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    resizeStateRef.current = {
      direction,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizeStateRef.current) return;
      const { direction, startX, startY, startWidth, startHeight } = resizeStateRef.current;
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      const maxWidth = window.innerWidth * 0.98;
      const maxHeight = window.innerHeight * 0.96;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction === 'e') {
        newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + dx * 2));
      } else if (direction === 'w') {
        newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth - dx * 2));
      } else if (direction === 's') {
        newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + dy * 2));
      } else if (direction === 'se') {
        newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + dx * 2));
        newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + dy * 2));
      } else if (direction === 'sw') {
        newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth - dx * 2));
        newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + dy * 2));
      }

      setSize({ width: Math.round(newWidth), height: Math.round(newHeight) });
    };

    const handleMouseUp = () => {
      resizeStateRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    document.body.style.userSelect = 'none';
    if (direction === 'e' || direction === 'w') document.body.style.cursor = 'ew-resize';
    else if (direction === 's') document.body.style.cursor = 'ns-resize';
    else if (direction === 'se') document.body.style.cursor = 'nwse-resize';
    else if (direction === 'sw') document.body.style.cursor = 'nesw-resize';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleResetSize = () => {
    setSize({ width: null, height: null });
    setIsMaximized(false);
  };

  const handleToggleMaximize = () => {
    setIsMaximized((prev) => !prev);
  };

  const style: React.CSSProperties = isMaximized
    ? { width: '98vw', height: '96vh', maxWidth: '98vw', maxHeight: '96vh' }
    : {
        width: size.width ? `${size.width}px` : undefined,
        height: size.height ? `${size.height}px` : undefined,
        maxWidth: '98vw',
        maxHeight: '96vh',
      };

  return (
    <div
      ref={containerRef}
      style={style}
      className={`relative ${className} select-text transition-[width,height] duration-75`}
    >
      {/* Nút Phóng to / Thu nhỏ & Khôi phục kích thước ban đầu */}
      <div className="absolute top-3.5 right-12 z-40 hidden sm:flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
        {size.width || size.height || isMaximized ? (
          <button
            type="button"
            onClick={handleResetSize}
            title="Khôi phục kích thước ban đầu"
            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={handleToggleMaximize}
          title={isMaximized ? 'Thu nhỏ kích thước' : 'Phóng to tối đa'}
          className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 transition cursor-pointer"
        >
          {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {children}

      {/* ─── RESIZE HANDLES (KÉO DÃN: ĐÁY, CÁNH TRÁI, CÁNH PHẢI, GÓC) ─── */}
      {/* Cánh phải (Right Edge) */}
      <div
        onMouseDown={(e) => handleMouseDown(e, 'e')}
        title="Kéo dãn chiều rộng (Cánh phải)"
        className="absolute top-0 right-0 w-2.5 h-full cursor-ew-resize hover:bg-[#2D5A27]/20 active:bg-[#2D5A27]/40 transition-colors z-30"
      />

      {/* Cánh trái (Left Edge) */}
      <div
        onMouseDown={(e) => handleMouseDown(e, 'w')}
        title="Kéo dãn chiều rộng (Cánh trái)"
        className="absolute top-0 left-0 w-2.5 h-full cursor-ew-resize hover:bg-[#2D5A27]/20 active:bg-[#2D5A27]/40 transition-colors z-30"
      />

      {/* Đáy (Bottom Edge) */}
      <div
        onMouseDown={(e) => handleMouseDown(e, 's')}
        title="Kéo dãn chiều cao (Đáy)"
        className="absolute bottom-0 left-4 right-4 h-2.5 cursor-ns-resize hover:bg-[#2D5A27]/20 active:bg-[#2D5A27]/40 transition-colors z-30"
      />

      {/* Góc dưới phải (Bottom-Right Corner) */}
      <div
        onMouseDown={(e) => handleMouseDown(e, 'se')}
        title="Kéo dãn 2 chiều (Góc dưới phải)"
        className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-40 flex items-end justify-end p-1 text-slate-400 hover:text-[#2D5A27] group select-none"
      >
        <svg
          viewBox="0 0 16 16"
          className="w-3.5 h-3.5 fill-current opacity-40 group-hover:opacity-100 transition-opacity"
        >
          <path d="M14 14H12V12H14V14ZM14 10H12V8H14V10ZM10 14H8V12H10V14ZM14 6H12V4H14V6ZM6 14H4V12H6V14ZM10 10H8V8H10V10Z" />
        </svg>
      </div>

      {/* Góc dưới trái (Bottom-Left Corner) */}
      <div
        onMouseDown={(e) => handleMouseDown(e, 'sw')}
        title="Kéo dãn 2 chiều (Góc dưới trái)"
        className="absolute bottom-0 left-0 w-6 h-6 cursor-nesw-resize z-40 flex items-end justify-start p-1 text-slate-400 hover:text-[#2D5A27] group select-none"
      >
        <svg
          viewBox="0 0 16 16"
          className="w-3.5 h-3.5 fill-current opacity-40 group-hover:opacity-100 transition-opacity -scale-x-100"
        >
          <path d="M14 14H12V12H14V14ZM14 10H12V8H14V10ZM10 14H8V12H10V14ZM14 6H12V4H14V6ZM6 14H4V12H6V14ZM10 10H8V8H10V10Z" />
        </svg>
      </div>
    </div>
  );
}
