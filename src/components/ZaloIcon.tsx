'use client';

import React from 'react';

interface ZaloIconProps {
  className?: string;
  size?: number;
}

/**
 * Icon Zalo nhận diện thương hiệu chuẩn:
 * Nền xanh Zalo (#0068FF) bo góc mềm với chữ Zalo trắng typography đậm nét.
 */
export default function ZaloIcon({ className = 'w-4 h-4', size }: ZaloIconProps) {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <rect width="36" height="36" rx="8" fill="#0068FF" />
      <text
        x="18"
        y="23.5"
        fill="#FFFFFF"
        textAnchor="middle"
        fontSize="14.5"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        letterSpacing="-0.5px"
      >
        Zalo
      </text>
    </svg>
  );
}
