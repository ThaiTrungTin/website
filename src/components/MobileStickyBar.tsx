'use client';

import React from 'react';
import { PhoneCall, CalendarCheck } from 'lucide-react';
import { useSystemConfig } from '@/context/SystemConfigContext';
import { useLanguage } from '@/context/LanguageContext';

interface MobileStickyBarProps {
  onOpenBookingModal: () => void;
}

export default function MobileStickyBar({ onOpenBookingModal }: MobileStickyBarProps) {
  const { config } = useSystemConfig();
  const { t } = useLanguage();
  const hotlineRaw = (config.hotline || '0903 599 339').replace(/\s+/g, '');
  const hotlineDisplay = config.hotline_hien_thi || config.hotline || '0903 599 339';

  return (
    <aside
      aria-label="Thanh hành động nhanh di động"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-3 py-2.5 sm:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto">
        {/* Button 1: Gọi Cấp Cứu / Hotline */}
        <a
          href={`tel:${hotlineRaw}`}
          className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 active:scale-95 transition-all text-center leading-none"
        >
          <PhoneCall className="w-4 h-4 animate-pulse shrink-0" />
          <span>Hotline: {hotlineDisplay}</span>
        </a>

        {/* Button 2: Đặt Lịch Nhanh */}
        <button
          onClick={onOpenBookingModal}
          className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-black bg-gradient-to-r from-[#FFB800] to-[#E5A600] text-slate-950 shadow-md shadow-amber-500/25 active:scale-95 transition-all text-center leading-none"
        >
          <CalendarCheck className="w-4 h-4 text-slate-950 shrink-0" />
          <span>{t('btn_book_short', 'Đặt Lịch')}</span>
        </button>
      </div>
    </aside>
  );
}
