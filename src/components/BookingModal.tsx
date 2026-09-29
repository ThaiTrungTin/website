'use client';

import React from 'react';
import { X } from 'lucide-react';
import BookingSection from './BookingSection';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 z-10 my-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Đóng cửa sổ đặt lịch"
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
            <span>⚡ Đặt Lịch Nhanh Pet M&M</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            Đặt Lịch Khám & Chăm Sóc Thú Cưng
          </h3>
        </div>

        {/* Form Body */}
        <BookingSection
          initialService={preselectedService}
          isModal={true}
          onSuccess={() => {}}
        />
      </div>
    </div>
  );
}
