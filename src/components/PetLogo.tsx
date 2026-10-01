'use client';

import React from 'react';
import { useSystemConfig } from '@/context/SystemConfigContext';

interface PetLogoProps {
  size?: 'default' | 'sm' | 'lg';
  showSubline?: boolean;
  className?: string;
  customLogoUrl?: string;
}

export default function PetLogo({
  size = 'default',
  showSubline = false,
  className = '',
  customLogoUrl,
}: PetLogoProps) {
  const { config } = useSystemConfig();
  const isSm = size === 'sm';
  const isLg = size === 'lg';
  const logoUrl = (customLogoUrl || config?.logo_favicon)?.trim() || '/logo-favicon.svg';

  return (
    <div className={`flex items-center gap-3 select-none group cursor-pointer ${className}`}>
      {/* Dynamic Brand Logo Emblem without white background */}
      <div
        className={`relative flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105 ${
          isSm ? 'w-8 h-8' : isLg ? 'w-13 h-13' : 'w-11 h-11'
        }`}
      >
        <img
          src={logoUrl}
          alt="Pet M&M Logo"
          className="w-full h-full object-contain relative z-10"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo-favicon.png';
          }}
        />
      </div>

      {/* 8K ANIMATED TYPOGRAPHY (CHỮ CHUYỂN ĐỘNG ÁNH KIM: PET MÀU VÀNG, M&M MÀU XANH) */}
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline">
          {/* "Pet" in Gold (Màu Vàng Hoàng Gia) */}
          <span
            className={`font-editorial font-bold drop-shadow-xs animate-gold-shimmer ${
              isSm ? 'text-lg' : isLg ? 'text-3xl' : 'text-2xl'
            }`}
          >
            Pet
          </span>

          {/* "M&M" in Emerald Green (Màu Xanh Ngọc Lục Bảo) - Viết liền PetM&M, & chuẩn đơn giản không hoa hòe */}
          <span
            className={`font-editorial not-italic font-extrabold tracking-tight drop-shadow-xs animate-emerald-shimmer inline-flex items-baseline ${
              isSm ? 'text-lg' : isLg ? 'text-3xl' : 'text-2xl'
            }`}
          >
            <span>M</span>
            <span
              className="font-sans font-bold text-[0.65em] mx-[0.5px] select-none"
              style={{ verticalAlign: 'baseline' }}
            >
              &
            </span>
            <span>M</span>
          </span>
        </div>

        {/* Luxury Subline with Spaced Accents (Only if showSubline is true) */}
        {showSubline && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`font-sans tracking-[0.24em] font-bold uppercase text-[#2D5A27] drop-shadow-xs ${
                isSm ? 'text-[8px]' : 'text-[9px]'
              }`}
            >
              Resort & Hospital
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
