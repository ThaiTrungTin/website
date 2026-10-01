'use client';

import React from 'react';
import { X } from 'lucide-react';
import BookingSection from './BookingSection';
import { useLanguage } from '@/context/LanguageContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedService?: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  preselectedService,
}: BookingModalProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog with generous 2-column layout */}
      <div className="relative w-full max-w-5xl bg-white rounded-3xl sm:rounded-[32px] shadow-2xl z-10 my-auto max-h-[94vh] overflow-y-auto border border-slate-200/80 animate-in fade-in zoom-in-95 duration-200">
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          aria-label={isEn ? 'Close booking modal' : 'Đóng cửa sổ đặt lịch'}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition z-30 bg-white/80 backdrop-blur-sm shadow-xs cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 2-Column Booking Section Form & Dynamic Cover */}
        <BookingSection
          initialService={preselectedService}
          isModal={true}
          onSuccess={() => {}}
        />
      </div>
    </div>
  );
}
