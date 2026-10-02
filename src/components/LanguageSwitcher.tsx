'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { VietnamFlag, UKFlag } from './FlagIcons';

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark' | 'glass';
  className?: string;
  showIcon?: boolean;
  flagOnly?: boolean;
}

export default function LanguageSwitcher({
  variant = 'glass',
  className = '',
  flagOnly = false,
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const isEn = language === 'en';

  const handleToggle = () => {
    setLanguage(isEn ? 'vi' : 'en');
  };

  const isDark = variant === 'dark';
  const isLight = variant === 'light';

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={isEn ? 'Chuyển sang Tiếng Việt' : 'Switch to English'}
      aria-label={isEn ? 'Chuyển sang Tiếng Việt' : 'Switch to English'}
      className={`inline-flex items-center justify-center ${
        flagOnly ? 'p-2 rounded-full' : 'gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold'
      } transition-all duration-200 select-none cursor-pointer active:scale-95 group ${
        isDark
          ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-700 shadow-sm'
          : isLight
          ? 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-sm hover:border-[#2D5A27]/40'
          : 'bg-white/90 hover:bg-white backdrop-blur-md text-slate-800 border border-slate-200/90 shadow-sm hover:border-[#2D5A27]/40'
      } ${className}`}
    >
      {isEn ? (
        <>
          <UKFlag className={`${flagOnly ? 'w-5 h-3.5' : 'w-4 h-3'} rounded-[2px] shadow-xs group-hover:scale-105 transition-transform`} />
          {!flagOnly && <span className="font-extrabold tracking-wider text-slate-800">EN</span>}
        </>
      ) : (
        <>
          <VietnamFlag className={`${flagOnly ? 'w-5 h-3.5' : 'w-4 h-3'} rounded-[2px] shadow-xs group-hover:scale-105 transition-transform`} />
          {!flagOnly && <span className="font-extrabold tracking-wider text-[#2D5A27]">VI</span>}
        </>
      )}
    </button>
  );
}
