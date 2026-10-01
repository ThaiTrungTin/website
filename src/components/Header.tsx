'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  PhoneCall,
  CalendarCheck,
  Clock,
  MapPin,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Award,
  Stethoscope,
  Scissors,
  Heart,
  BookOpen,
  HelpCircle,
  Sparkles,
  Star,
} from 'lucide-react';
import PetLogo from './PetLogo';
import { useSystemConfig } from '@/context/SystemConfigContext';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import NavDesktopMenu from './NavDesktopMenu';
import { useNavDatabase } from '@/hooks/useNavDatabase';

interface HeaderProps {
  onOpenBookingModal?: (preselectedService?: string) => void;
  alwaysVisible?: boolean;
}

export default function Header({ onOpenBookingModal, alwaysVisible = false }: HeaderProps) {
  const { config } = useSystemConfig();
  const { t, isEn } = useLanguage();
  const { branches, serviceGroups, knowledgeGroups } = useNavDatabase();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const hotlineRaw = (config.hotline || '0903 599 339').replace(/\s+/g, '');
  const hotlineDisplay = config.hotline_hien_thi || config.hotline || '0903 599 339';
  const zaloUrl = config.link_zalo || 'https://zalo.me/0903599339';
  const messengerUrl = config.link_messenger || 'https://m.me/petmm';

  const handleBookingClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      const isHomePage = window.location.pathname === '/' || window.location.pathname === '';
      const bookingEl = document.getElementById('booking');
      if (isHomePage && bookingEl) {
        bookingEl.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', '#booking');
      } else {
        window.location.href = '/#booking';
      }
    }
  };

  useEffect(() => {
    let lastScrolled = false;
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      if (scrolled !== lastScrolled) {
        lastScrolled = scrolled;
        setIsScrolled(scrolled);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Main Luxury Sticky Header (Luminous White & Emerald Glass) */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          alwaysVisible || isScrolled
            ? 'translate-y-0 opacity-100 py-2.5 sm:py-3 text-slate-900 shadow-md'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Luminous Luxury White Glass Background with Animated Border */}
        <div className="absolute inset-0 bg-white/90 backdrop-blur-2xl border-b border-slate-200/90 shadow-lg pointer-events-none overflow-hidden">
          {/* Subtle Accent Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,90,39,0.06),transparent_70%)]" />

          {/* Animated Emerald Laser Beam running along the bottom border */}
          <div className="absolute bottom-0 inset-x-0 h-[2px] overflow-hidden">
            <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-[#2D5A27] to-transparent animate-navbar-beam blur-[0.5px]" />
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo Pet M&M */}
          <Link href="/" className="flex items-center">
            <PetLogo size="default" />
          </Link>

          {/* Desktop Navigation Links with Clean Real Database Dropdowns */}
          <div className="hidden lg:flex items-center bg-slate-100/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 shadow-inner">
            <NavDesktopMenu variant="header" />
          </div>

          {/* Header Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher variant="light" />

            {/* Hotline Button */}
            <a
              href={`tel:${hotlineRaw}`}
              suppressHydrationWarning
              className="hidden xl:flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold text-[#2D5A27] bg-emerald-50 hover:bg-emerald-100 transition-all duration-300 border border-emerald-200/80 shadow-sm group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <PhoneCall className="w-3.5 h-3.5 text-[#2D5A27] animate-phone-ring" />
              <strong suppressHydrationWarning className="text-slate-900 font-black tracking-wide">{hotlineDisplay}</strong>
            </a>

            {/* Booking CTA Button - Fixed width & concise label across languages */}
            <button
              onClick={handleBookingClick}
              className="flex items-center justify-center gap-2 w-[124px] py-2.5 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#2D5A27] to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-md shadow-emerald-950/20 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
            >
              <CalendarCheck className="w-4 h-4 text-[#FFB800] shrink-0" />
              <span className="whitespace-nowrap">{t('btn_book_short', 'Đặt Lịch')}</span>
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSwitcher variant="light" showIcon={false} />
            <button
              onClick={handleBookingClick}
              className="relative overflow-hidden sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs bg-gradient-to-r from-[#FFB800] to-amber-400 text-slate-950 shadow-md cursor-pointer"
            >
              <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none animate-button-gleam" />
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>{t('btn_book_short', 'Đặt Lịch')}</span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isEn ? 'Open navigation menu' : 'Mở menu di động'}
              className="p-2 rounded-xl text-slate-800 hover:text-[#2D5A27] hover:bg-slate-100 transition"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Luxury White Frosted Glass) */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        />

        {/* Drawer Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white/95 backdrop-blur-2xl border-l border-slate-200 text-slate-900 shadow-2xl flex flex-col justify-between p-6 transition-transform duration-300 transform ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div>
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-200">
              <PetLogo size="sm" />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links with Accordion Dropdowns using Real DB Data */}
            <nav className="flex flex-col gap-1.5 mt-5">
              {/* Về Pet M&M */}
              <a
                href="/#about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:text-[#2D5A27] hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#2D5A27]">
                    <Heart className="w-4 h-4" />
                  </div>
                  <span>{t('nav_about', 'Về Pet M&M')}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>

              {/* Dịch Vụ (2 Tầng) */}
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => setMobileExpanded(mobileExpanded === 'services' ? null : 'services')}
                  className="flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:text-[#2D5A27] hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#2D5A27]">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <span>{t('nav_services', 'Dịch Vụ')}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      mobileExpanded === 'services' ? 'rotate-180 text-[#2D5A27]' : ''
                    }`}
                  />
                </button>

                {mobileExpanded === 'services' && (
                  <div className="ml-5 pl-4 border-l-2 border-emerald-100 flex flex-col gap-2 my-1.5 animate-in slide-in-from-top-1 duration-200">
                    {serviceGroups.map((group) => (
                      <div key={group.id} className="flex flex-col">
                        <div className="text-xs font-bold text-[#00897b] py-1">{group.name}</div>
                        {group.children?.map((sub) => (
                          <a
                            key={sub.id}
                            href={sub.href}
                            onClick={(e) => {
                              setIsMobileMenuOpen(false);
                              if (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '')) {
                                e.preventDefault();
                                window.dispatchEvent(
                                  new CustomEvent('select-service', { detail: { id: sub.id } })
                                );
                                const el = document.getElementById('services');
                                if (el) {
                                  el.scrollIntoView({ behavior: 'smooth' });
                                }
                              }
                            }}
                            className="py-1.5 px-2 rounded-lg text-xs font-normal text-slate-600 hover:text-[#2D5A27] hover:bg-slate-50 transition"
                          >
                            • {sub.name}
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hệ Thống Cơ Sở */}
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => setMobileExpanded(mobileExpanded === 'branches' ? null : 'branches')}
                  className="flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:text-[#2D5A27] hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#2D5A27]">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span>{t('nav_branches', 'Hệ Thống Cơ Sở')}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      mobileExpanded === 'branches' ? 'rotate-180 text-[#2D5A27]' : ''
                    }`}
                  />
                </button>

                {mobileExpanded === 'branches' && (
                  <div className="ml-5 pl-4 border-l-2 border-emerald-100 flex flex-col gap-1 my-1.5 animate-in slide-in-from-top-1 duration-200">
                    {branches.map((b) => (
                      <Link
                        key={b.id}
                        href={b.href}
                        prefetch={true}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="py-1.5 px-2 rounded-lg text-xs font-normal text-slate-600 hover:text-[#2D5A27] hover:bg-slate-50 transition"
                      >
                        {b.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Cẩm Nang */}
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => setMobileExpanded(mobileExpanded === 'knowledge' ? null : 'knowledge')}
                  className="flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:text-[#2D5A27] hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#2D5A27]">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span>{t('nav_knowledge', 'Cẩm Nang')}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      mobileExpanded === 'knowledge' ? 'rotate-180 text-[#2D5A27]' : ''
                    }`}
                  />
                </button>

                {mobileExpanded === 'knowledge' && (
                  <div className="ml-5 pl-4 border-l-2 border-emerald-100 flex flex-col gap-2 my-1.5 animate-in slide-in-from-top-1 duration-200">
                    {knowledgeGroups.map((kg) => (
                      <div key={kg.category} className="flex flex-col">
                        <div className="text-xs font-bold text-[#00897b] py-1">{kg.category}</div>
                        {kg.articles.map((art) => (
                          <Link
                            key={art.id}
                            href={art.href}
                            prefetch={true}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="py-1.5 px-2 rounded-lg text-xs font-normal text-slate-600 hover:text-[#2D5A27] hover:bg-slate-50 transition"
                          >
                            • {art.title}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* FAQ */}
              <a
                href="/#faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:text-[#2D5A27] hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#2D5A27]">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span>{t('nav_faq', 'FAQ')}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>

              {/* Đánh Giá */}
              <a
                href="/#reviews"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:text-[#2D5A27] hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#2D5A27]">
                    <Star className="w-4 h-4" />
                  </div>
                  <span>{t('nav_reviews', 'Đánh Giá')}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>

              {/* Liên Hệ */}
              <a
                href="/#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:text-[#2D5A27] hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#2D5A27]">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <span>{t('nav_contact', 'Liên Hệ')}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            </nav>
          </div>

          {/* Drawer Bottom Actions */}
          <div className="pt-6 border-t border-slate-200 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-xs font-bold text-slate-500">{isEn ? 'Language:' : 'Ngôn ngữ:'}</span>
              <LanguageSwitcher variant="light" />
            </div>

            <button
              onClick={handleBookingClick}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#2D5A27] to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-xl shadow-emerald-950/20 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-[#FFB800]" />
              <span>{t('btn_book_short', 'Đặt Lịch')}</span>
            </button>

            <a
              href={`tel:${hotlineRaw}`}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-rose-50 text-rose-700 border border-rose-200 text-center"
            >
              <PhoneCall className="w-4 h-4 text-rose-600 animate-pulse inline" />
              <span>{hotlineDisplay}</span>
            </a>

            {/* Quick Social Chat row */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <a
                href={zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 rounded-xl bg-[#0068FF]/10 border border-[#0068FF]/30 text-center text-xs font-bold text-blue-600 hover:bg-[#0068FF]/20 transition"
              >
                {isEn ? 'Doctor Zalo' : 'Chat Zalo Bác Sĩ'}
              </a>
              <a
                href={messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center text-xs font-bold text-purple-600 hover:bg-purple-500/20 transition"
              >
                {isEn ? 'Messenger Chat' : 'Nhắn Messenger'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
