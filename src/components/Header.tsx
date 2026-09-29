'use client';

import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  PhoneCall,
  CalendarCheck,
  Clock,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Award,
  Stethoscope,
  Heart,
  BookOpen,
  HelpCircle,
  Sparkles,
  Star,
} from 'lucide-react';
import PetLogo from './PetLogo';
import { useSystemConfig } from '@/context/SystemConfigContext';

interface HeaderProps {
  onOpenBookingModal: (preselectedService?: string) => void;
}

export default function Header({ onOpenBookingModal }: HeaderProps) {
  const { config } = useSystemConfig();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const hotlineRaw = (config.hotline || '0903 599 339').replace(/\s+/g, '');
  const hotlineDisplay = config.hotline_hien_thi || config.hotline || '0903 599 339';
  const zaloUrl = config.link_zalo || 'https://zalo.me/0903599339';
  const messengerUrl = config.link_messenger || 'https://m.me/petmm';

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

  const navLinks = [
    { label: 'Về Pet M&M', href: '#about', icon: Heart },
    { label: 'Dịch vụ', href: '#services', icon: Stethoscope },
    { label: 'Hệ thống cơ sở', href: '#branches', icon: MapPin },
    { label: 'Cẩm nang', href: '#knowledge', icon: BookOpen },
    { label: 'FAQ', href: '#faq', icon: HelpCircle },
    { label: 'Đánh giá', href: '#reviews', icon: Star },
    { label: 'Liên hệ', href: '#contact', icon: PhoneCall },
  ];

  return (
    <>
      {/* Main Luxury Sticky Header (Luminous White & Emerald Glass) */}
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${
          isScrolled
            ? 'translate-y-0 opacity-100 py-3 text-slate-900'
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
          <a href="#" className="flex items-center">
            <PetLogo size="default" />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 shadow-inner">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-semibold px-3.5 py-1.5 rounded-full text-slate-700 hover:text-[#2D5A27] hover:bg-white transition-all duration-200 relative group"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#2D5A27] rounded-full transition-all duration-300 group-hover:w-3/4" />
              </a>
            ))}
          </nav>

          {/* Header Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Hotline Button */}
            <a
              href={`tel:${hotlineRaw}`}
              className="hidden xl:flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold text-[#2D5A27] bg-emerald-50 hover:bg-emerald-100 transition-all duration-300 border border-emerald-200/80 shadow-sm group"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <PhoneCall className="w-3.5 h-3.5 text-[#2D5A27] animate-phone-ring" />
              <span>Hotline: <strong className="text-slate-900 font-black tracking-wide">{hotlineDisplay}</strong></span>
            </a>

            {/* Booking CTA Button */}
            <button
              onClick={() => onOpenBookingModal()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#2D5A27] to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-md shadow-emerald-950/20 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-[#FFB800]" />
              <span>Đặt Lịch Thăm Khám</span>
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => onOpenBookingModal()}
              className="relative overflow-hidden sm:hidden flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black text-xs bg-gradient-to-r from-[#FFB800] to-amber-400 text-slate-950 shadow-md"
            >
              <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none animate-button-gleam" />
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Đặt Lịch</span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Mở menu di động"
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

            {/* Navigation Links with Icons */}
            <nav className="flex flex-col gap-1.5 mt-5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:text-[#2D5A27] hover:bg-slate-50 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#2D5A27] group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{link.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#2D5A27] group-hover:translate-x-0.5 transition" />
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Drawer Bottom Actions */}
          <div className="pt-6 border-t border-slate-200 flex flex-col gap-3">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenBookingModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#2D5A27] to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-xl shadow-emerald-950/20"
            >
              <CalendarCheck className="w-4 h-4 text-[#FFB800]" />
              <span>Đặt Lịch Khám Trực Tuyến</span>
            </button>

            <a
              href={`tel:${hotlineRaw}`}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-rose-50 text-rose-700 border border-rose-200 text-center"
            >
              <PhoneCall className="w-4 h-4 text-rose-600 animate-pulse inline" />
              <span>Hotline: {hotlineDisplay}</span>
            </a>

            {/* Quick Social Chat row */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <a
                href={zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 rounded-xl bg-[#0068FF]/10 border border-[#0068FF]/30 text-center text-xs font-bold text-blue-600 hover:bg-[#0068FF]/20 transition"
              >
                Chat Zalo Bác Sĩ
              </a>
              <a
                href={messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center text-xs font-bold text-purple-600 hover:bg-purple-500/20 transition"
              >
                Nhắn Messenger
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
