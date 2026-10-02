'use client';

import React from 'react';
import { PhoneCall, CalendarCheck } from 'lucide-react';
import { useSystemConfig } from '@/context/SystemConfigContext';
import { useLanguage } from '@/context/LanguageContext';

interface MobileStickyBarProps {
  onOpenBookingModal?: () => void;
}

export default function MobileStickyBar({ onOpenBookingModal }: MobileStickyBarProps) {
  // Đã ẩn theo yêu cầu người dùng
  return null;
}
