'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import LocationsSection from '@/components/LocationsSection';
import AboutSection from '@/components/AboutSection';
import ReviewsSection from '@/components/ReviewsSection';
import BookingSection from '@/components/BookingSection';
import KnowledgeSection from '@/components/KnowledgeSection';
import FaqSection from '@/components/FaqSection';
import CareersSection from '@/components/CareersSection';
import Footer from '@/components/Footer';
import FloatingContactWidgets from '@/components/FloatingContactWidgets';
import ScrollNavigationButtons from '@/components/ScrollNavigationButtons';

export default function HomePage() {
  const [preselectedService, setPreselectedService] = useState<string | undefined>(undefined);

  const handleScrollToBooking = (serviceTitle?: string) => {
    if (serviceTitle) {
      setPreselectedService(serviceTitle);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('petmm_select_service', { detail: { service: serviceTitle } }));
      }
    }
    if (typeof window !== 'undefined') {
      const bookingEl = document.getElementById('booking');
      if (bookingEl) {
        bookingEl.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', '#booking');
      }
    }
  };

  const handleSelectServiceFromCard = (serviceTitle: string) => {
    handleScrollToBooking(serviceTitle);
  };

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-[#FFB800] selection:text-slate-900 overflow-x-clip w-full"
    >
      {/* 1. Header & Navigation */}
      <Header onOpenBookingModal={handleScrollToBooking} />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Banner Section */}
        <HeroSection onOpenBookingModal={handleScrollToBooking} />

        {/* 1. Về PetM&M (Giới thiệu & Triết lý y đức lên đầu) */}
        <AboutSection />

        {/* 2. Dịch Vụ */}
        <ServicesSection onSelectService={handleSelectServiceFromCard} />

        {/* 3. Hệ Thống Cơ Sở */}
        <LocationsSection />

        {/* 4. Cẩm Nang Bác Sĩ */}
        <KnowledgeSection />

        {/* 5. FAQ (Câu Hỏi Thường Gặp) */}
        <FaqSection />

        {/* 6. Tuyển Dụng & Cơ Hội Nghề Nghiệp Chuẩn Fear-Free */}
        <CareersSection />

        {/* 7. Đánh Giá Khách Hàng */}
        <ReviewsSection />

        {/* 7. Liên Hệ / Đặt Lịch Hẹn Trực Tuyến */}
        <BookingSection initialService={preselectedService} />
      </main>

      {/* 8. Footer */}
      <Footer />

      {/* Floating Action Contact Widgets (Zalo, Messenger, Hotline 24/7) */}
      <FloatingContactWidgets />

      {/* Floating Page Scroll Buttons (Scroll to Top & Scroll to Bottom on Mobile & Laptop) */}
      <ScrollNavigationButtons />
    </div>
  );
}
