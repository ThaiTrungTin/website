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
import Footer from '@/components/Footer';
import MobileStickyBar from '@/components/MobileStickyBar';
import BookingModal from '@/components/BookingModal';
import FloatingContactWidgets from '@/components/FloatingContactWidgets';
import ScrollNavigationButtons from '@/components/ScrollNavigationButtons';

export default function HomePage() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<string | undefined>(undefined);

  const handleOpenBookingModal = (serviceTitle?: string) => {
    setPreselectedService(serviceTitle);
    setIsBookingModalOpen(true);
  };

  const handleSelectServiceFromCard = (serviceTitle: string) => {
    // Open modal with this service pre-selected
    handleOpenBookingModal(serviceTitle);
  };

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-[#FFB800] selection:text-slate-900 overflow-x-clip w-full"
    >
      {/* 1. Header & Navigation */}
      <Header onOpenBookingModal={handleOpenBookingModal} />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Banner Section */}
        <HeroSection onOpenBookingModal={handleOpenBookingModal} />

        {/* 1. Về Pet M&M (Giới thiệu & Triết lý y đức lên đầu) */}
        <AboutSection />

        {/* 2. Dịch Vụ */}
        <ServicesSection onSelectService={handleSelectServiceFromCard} />

        {/* 3. Hệ Thống Cơ Sở */}
        <LocationsSection />

        {/* 4. Cẩm Nang Bác Sĩ */}
        <KnowledgeSection />

        {/* 5. FAQ (Câu Hỏi Thường Gặp) */}
        <FaqSection />

        {/* 6. Đánh Giá Khách Hàng */}
        <ReviewsSection />

        {/* 7. Liên Hệ / Đặt Lịch Hẹn Trực Tuyến */}
        <BookingSection initialService={preselectedService} />
      </main>

      {/* 8. Footer */}
      <Footer />

      {/* Mobile-First Bottom Sticky Action Bar */}
      <MobileStickyBar onOpenBookingModal={handleOpenBookingModal} />

      {/* Floating Action Contact Widgets (Zalo, Messenger, Hotline 24/7) */}
      <FloatingContactWidgets />

      {/* Floating Page Scroll Buttons (Scroll to Top & Scroll to Bottom on Mobile & Laptop) */}
      <ScrollNavigationButtons />

      {/* Booking Modal Popup */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setPreselectedService(undefined);
        }}
        preselectedService={preselectedService}
      />
    </div>
  );
}
