'use client';

import React from 'react';

interface PetLogoProps {
  size?: 'default' | 'sm' | 'lg';
  showSubline?: boolean;
  className?: string;
}

export default function PetLogo({
  size = 'default',
  showSubline = false,
  className = '',
}: PetLogoProps) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className={`flex items-center gap-3 select-none group cursor-pointer ${className}`}>
      {/* 8K JEWEL EMBLEM CREST WITH ANIMATED GLOW */}
      <div className="relative flex items-center justify-center flex-shrink-0">
        {/* Breathing ambient golden aura */}
        <div className="absolute inset-0 rounded-2xl bg-[#FFB800]/25 blur-md animate-logo-aura" />

        {/* Rotating subtle gold compass ring */}
        <div className="absolute -inset-1 rounded-2xl border border-[#FFB800]/30 animate-crest-ring pointer-events-none" />

        {/* Core Jewel Medallion */}
        <div
          className={`relative rounded-2xl bg-gradient-to-br from-[#2D5A27] via-[#1E3F1B] to-[#0F230D] border border-[#FFB800]/70 flex items-center justify-center shadow-lg shadow-[#FFB800]/15 overflow-hidden transition-transform duration-300 group-hover:scale-105 ${
            isSm ? 'w-8 h-8' : isLg ? 'w-13 h-13' : 'w-11 h-11'
          }`}
        >
          {/* Subtle glossy sheen sweep overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-60 pointer-events-none" />

          {/* Intricate Gold Royal Cross & Pet Crest */}
          <svg
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${isSm ? 'w-5 h-5' : isLg ? 'w-8 h-8' : 'w-6.5 h-6.5'} drop-shadow-md`}
          >
            {/* Medical Cross Stem */}
            <rect x="15" y="6" width="6" height="24" rx="2.5" fill="url(#goldGrad)" />
            {/* Medical Cross Crossbar */}
            <rect x="6" y="15" width="24" height="6" rx="2.5" fill="url(#goldGrad)" />

            {/* Central Diamond Sparkle Jewel */}
            <path
              d="M18 10L20.2 15.8L26 18L20.2 20.2L18 26L15.8 20.2L10 18L15.8 15.8L18 10Z"
              fill="#FFFFFF"
              className="drop-shadow-sm"
            />

            {/* Gradients */}
            <defs>
              <linearGradient id="goldGrad" x1="6" y1="6" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFF176" />
                <stop offset="35%" stopColor="#FFB800" />
                <stop offset="70%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* 8K ANIMATED TYPOGRAPHY (CHỮ CHUYỂN ĐỘNG ÁNH KIM: PET MÀU VÀNG, M&M MÀU XANH) */}
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-1.5">
          {/* "Pet" in Gold (Màu Vàng Hoàng Gia) */}
          <span
            className={`font-editorial font-bold tracking-wider drop-shadow-xs animate-gold-shimmer ${
              isSm ? 'text-lg' : isLg ? 'text-3xl' : 'text-2xl'
            }`}
          >
            Pet
          </span>

          {/* "M&M" in Emerald Green (Màu Xanh Ngọc Lục Bảo) */}
          <span
            className={`font-editorial italic font-extrabold tracking-wide drop-shadow-xs animate-emerald-shimmer ${
              isSm ? 'text-lg' : isLg ? 'text-3xl' : 'text-2xl'
            }`}
          >
            M&M
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
              Resort & Hospital 5★
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
