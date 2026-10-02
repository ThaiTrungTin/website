'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  CalendarCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  PawPrint,
} from 'lucide-react';

import { Cute3DDogIcon, Cute3DCatIcon, Cute3DPawIcon } from './Cute3DPetIcons';

import InteractiveWaterShader from './InteractiveWaterShader';
import SloganAura3D from './SloganAura3D';
import PetLogo from './PetLogo';
import { supabase, HeroBannerItem } from '@/lib/supabase';
import { useSystemConfig } from '@/context/SystemConfigContext';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import NavDesktopMenu from './NavDesktopMenu';
import { getAssetUrl } from '@/lib/assets';

interface HeroSectionProps {
  onOpenBookingModal: (preselectedService?: string) => void;
}

// Ngôi sao 4 cánh kim cương lấp lánh (Sparkling Star SVG)
const SparkleStar = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="sparkleDiamondGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="45%" stopColor="#FFF4B8" />
        <stop offset="85%" stopColor="#FBBF24" />
        <stop offset="100%" stopColor="#F59E0B" />
      </radialGradient>
    </defs>
    <path
      d="M12 0 L14.7 9.3 L24 12 L14.7 14.7 L12 24 L9.3 14.7 L0 12 L9.3 9.3 Z"
      fill="url(#sparkleDiamondGrad)"
      style={{
        filter: 'drop-shadow(0 0 3px #ffffff) drop-shadow(0 0 7px rgba(251, 191, 36, 0.85))',
      }}
    />
  </svg>
);

// Hàm tính toạ độ thông minh trên điện thoại: tránh bị lệch mất mặt tiền / chủ thể
const getMobileObjectPosition = (pos?: string | null) => {
  if (!pos || pos === 'center') return '50% 15%';
  const match = pos.match(/(\d+)%\s+(\d+)%/);
  if (match) {
    const x = parseInt(match[1], 10);
    const y = parseInt(match[2], 10);
    // Trên màn hình dọc điện thoại, các toạ độ X bị lệch (< 35% hoặc > 65%)
    // sẽ tự động căn về 50% để giữ mặt tiền / trung tâm toà nhà luôn ở chính diện
    const mobileX = Math.abs(x - 50) > 15 ? 50 : x;
    return `${mobileX}% ${Math.min(y, 25)}%`;
  }
  return '50% 15%';
};

// Danh sách banner hoạt động hiện tại (Đã loại bỏ ảnh 9 bị tắt, ảnh 1 là ảnh phòng khám chuẩn)
const HERO_SLIDES_DEFAULT: HeroBannerItem[] = [
  {
    id: 'aa8eaaf2-ff33-40e9-99ef-549988d98099',
    tieu_de: 'Ảnh nền PetM&M',
    duong_dan_anh: 'https://ntkpdadakcyugvivvsjw.supabase.co/storage/v1/object/public/hinh_anh/banners/hero_1790088496905_19pds.jpg',
    can_chinh: '50% 15%',
    ti_le_phong: 1.05,
    hieu_ung: 'ken_burns',
    thu_tu: 1,
    kich_hoat: true,
    thoi_gian_hien_thi: 7000,
  },
  {
    id: 'b8c421c6-78ff-4711-bf76-687ee4a5c3cf',
    tieu_de: 'Cún Golden ngâm bồn sục thảo mộc khoáng ấm',
    duong_dan_anh: '/pet_golden_spa.jpg',
    can_chinh: 'center',
    ti_le_phong: 1.05,
    hieu_ung: 'ken_burns',
    thu_tu: 2,
    kich_hoat: true,
    thoi_gian_hien_thi: 4000,
  },
  {
    id: 'a3667f5c-9557-4824-bf32-e6687403efa0',
    tieu_de: 'Mèo British Shorthair phòng Suite resort',
    duong_dan_anh: '/pet_cat_resort.jpg',
    can_chinh: 'center',
    ti_le_phong: 1.05,
    hieu_ung: 'ken_burns',
    thu_tu: 3,
    kich_hoat: true,
    thoi_gian_hien_thi: 4000,
  },
  {
    id: '0d090e8d-e0d7-4cbf-bf73-1b42ae9b7e57',
    tieu_de: 'Cún Corgi chạy nhảy trên thảm cỏ hoàng hôn',
    duong_dan_anh: '/pet_corgi_park.jpg',
    can_chinh: 'center',
    ti_le_phong: 1.05,
    hieu_ung: 'ken_burns',
    thu_tu: 4,
    kich_hoat: true,
    thoi_gian_hien_thi: 4000,
  },
  {
    id: 'de28453d-7055-4032-adc8-a936d0b46dd3',
    tieu_de: 'Bé cún Golden đùa giỡn trong nắng sớm resort',
    duong_dan_anh: '/pet_puppy_play.jpg',
    can_chinh: 'center',
    ti_le_phong: 1.05,
    hieu_ung: 'ken_burns',
    thu_tu: 5,
    kich_hoat: true,
    thoi_gian_hien_thi: 4000,
  },
  {
    id: '01a8a718-94ba-4db2-8219-bed5dc1422a8',
    tieu_de: 'Bé Miu mắt ngọc biếc thư thái trong phòng tĩnh dưỡng',
    duong_dan_anh: '/pet_kitten_eyes.jpg',
    can_chinh: 'center',
    ti_le_phong: 1.05,
    hieu_ung: 'ken_burns',
    thu_tu: 6,
    kich_hoat: true,
    thoi_gian_hien_thi: 4000,
  },
  {
    id: '31240b49-0960-4d29-8bb5-dc0fbb5e58ba',
    tieu_de: 'Bác sĩ thú y thăm khám ân cần cho thú cưng',
    duong_dan_anh: '/services_bg.jpg',
    can_chinh: 'center',
    ti_le_phong: 1.05,
    hieu_ung: 'ken_burns',
    thu_tu: 7,
    kich_hoat: true,
    thoi_gian_hien_thi: 4000,
  },
  {
    id: '759ab160-dfb9-4451-80b3-1587f950c5a8',
    tieu_de: 'Khuôn viên resort biệt thự hoàng hôn ven sông',
    duong_dan_anh: '/branches_bg.jpg',
    can_chinh: 'center',
    ti_le_phong: 1.05,
    hieu_ung: 'ken_burns',
    thu_tu: 8,
    kich_hoat: true,
    thoi_gian_hien_thi: 4000,
  },
  {
    id: '8c6bd110-2521-489b-b28d-8cb67bccc4e3',
    tieu_de: 'Ảnh nền PetM&M',
    duong_dan_anh: 'https://ntkpdadakcyugvivvsjw.supabase.co/storage/v1/object/public/hinh_anh/banners/hero_1790091603217_5217i.jpg',
    can_chinh: '50% 50%',
    ti_le_phong: 1.05,
    hieu_ung: 'ken_burns',
    thu_tu: 10,
    kich_hoat: true,
    thoi_gian_hien_thi: 4000,
  },
];

// Ambient Floating Herbal Petals for living atmosphere
const AMBIENT_PETALS = [
  { left: '15%', delay: '0s', dur: '14s', size: 10 },
  { left: '28%', delay: '4s', dur: '18s', size: 8 },
  { left: '42%', delay: '7s', dur: '15s', size: 12 },
  { left: '60%', delay: '2s', dur: '16s', size: 9 },
  { left: '78%', delay: '5s', dur: '17s', size: 11 },
  { left: '90%', delay: '1s', dur: '13s', size: 8 },
];

export default function HeroSection({ onOpenBookingModal }: HeroSectionProps) {
  const { config } = useSystemConfig();
  const { t, isEn } = useLanguage();

  // Khởi tạo slides ban đầu từ HERO_SLIDES_DEFAULT để SSR và Client khớp 100% (tránh lỗi Hydration Mismatch)
  const [slides, setSlides] = useState<HeroBannerItem[]>(HERO_SLIDES_DEFAULT);

  const [slideIndex, setSlideIndex] = useState<{ current: number; prev: number }>({
    current: 0,
    prev: -1,
  });

  const slidesRef = useRef<HeroBannerItem[]>(slides);
  slidesRef.current = slides;

  // Slogan re-trigger: mỗi lần Hero vào viewport hoặc đổi ngôn ngữ thì reset key → animation chạy lại
  const [sloganKey, setSloganKey] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSloganKey((k) => k + 1);
  }, [isEn]);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Mỗi lần Hero xuất hiện trong viewport (lướt lên hoặc vào lần đầu) → re-trigger
            setSloganKey((k) => k + 1);
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Swipe & Drag gesture refs
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const mouseStartXRef = useRef<number | null>(null);

  // Tải danh sách ảnh động từ Supabase và cập nhật cache
  const loadBannerFromSupabase = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('hinh_anh')
        .select('*')
        .eq('chuyen_muc', 'hero_banner')
        .order('thu_tu', { ascending: true });

      if (error) {
        console.warn('Lỗi tải banner Supabase, dùng dữ liệu sẵn có:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const formatted: HeroBannerItem[] = data
          .filter((item) => item.kich_hoat !== false)
          .map((item) => ({
            id: item.id,
            tieu_de: item.tieu_de,
            duong_dan_anh: item.duong_dan_anh,
            alt_text: item.alt_text,
            chuyen_muc: item.chuyen_muc,
            can_chinh: item.can_chinh || 'center',
            ti_le_phong: Number(item.ti_le_phong) || 1.05,
            hieu_ung: item.hieu_ung || 'ken_burns',
            thu_tu: item.thu_tu || 0,
            kich_hoat: item.kich_hoat ?? true,
            thoi_gian_hien_thi: item.thoi_gian_hien_thi || 4000,
          }));

        if (formatted.length > 0) {
          setSlides(formatted);
          slidesRef.current = formatted;
          try {
            localStorage.setItem('pet_hero_banners_cache', JSON.stringify(formatted));
          } catch {}
        }
      }
    } catch (err) {
      console.warn('Không thể kết nối Supabase, dùng dữ liệu sẵn có:', err);
    }
  }, []);

  // Tải ban đầu và tự động cập nhật khi quay lại tab web hoặc có ảnh mới từ Admin
  useEffect(() => {
    // Đọc cache từ localStorage ngay sau khi hydrate để cập nhật tức thì nếu có ảnh mới
    try {
      const cached = localStorage.getItem('pet_hero_banners_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSlides(parsed);
          slidesRef.current = parsed;
        }
      }
    } catch {}

    loadBannerFromSupabase();

    const handleFocus = () => {
      loadBannerFromSupabase();
    };
    window.addEventListener('focus', handleFocus);

    // Lắng nghe thay đổi thời gian thực từ Supabase
    const channel = supabase
      .channel('hero_banner_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hinh_anh' },
        () => {
          loadBannerFromSupabase();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('focus', handleFocus);
      supabase.removeChannel(channel);
    };
  }, [loadBannerFromSupabase]);

  // Tải trước tuần tự ảnh kế tiếp thay vì kéo dồn dập 8MB ảnh cùng lúc gây nghẽn mạng
  useEffect(() => {
    if (typeof window === 'undefined' || slides.length <= 1) return;
    const nextIdx = (slideIndex.current + 1) % slides.length;
    const nextSlideItem = slides[nextIdx];
    if (nextSlideItem?.duong_dan_anh) {
      const img = new window.Image();
      img.src = nextSlideItem.duong_dan_anh;
    }
  }, [slides, slideIndex.current]);

  // Chuyển slide tiếp theo (Nguyên tử, chuẩn React 19, không lặp, không race condition)
  const nextSlide = useCallback(() => {
    const total = slidesRef.current.length;
    if (total <= 1) return;
    setSlideIndex((s) => ({
      prev: s.current,
      current: (s.current + 1) % total,
    }));
  }, []);

  // Quay lại slide trước
  const prevSlide = useCallback(() => {
    const total = slidesRef.current.length;
    if (total <= 1) return;
    setSlideIndex((s) => ({
      prev: s.current,
      current: (s.current - 1 + total) % total,
    }));
  }, []);

  // Tự động chuyển slide: Reset bộ đếm mới toanh mỗi khi chuyển sang ảnh mới (đảm bảo đủ thời gian cài đặt 4s)
  useEffect(() => {
    if (slides.length <= 1) return;

    const currentSlide = slides[slideIndex.current];
    const duration = Math.max(2000, Number(currentSlide?.thoi_gian_hien_thi) || 4000);

    const timer = setTimeout(() => {
      nextSlide();
    }, duration);

    return () => clearTimeout(timer);
  }, [nextSlide, slides, slideIndex.current]);

  // Touch Swipe handlers (Lướt sang trái / phải trên màn hình siêu nhạy)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = (touchStartYRef.current || 0) - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > 20 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Mouse Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartXRef.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseStartXRef.current === null) return;
    const diffX = mouseStartXRef.current - e.clientX;
    if (Math.abs(diffX) > 30) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    mouseStartXRef.current = null;
  };

  return (
    <section
      ref={heroRef}
      id="hero"
      aria-label="Khu vực mở đầu PetM&M 5 sao"
      className="relative min-h-[50vh] sm:min-h-screen flex items-center justify-center pt-4 pb-14 sm:pt-28 sm:pb-16 text-slate-900 overflow-hidden select-none cursor-grab active:cursor-grabbing bg-white"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* 1. CINEMATIC FULL-SCREEN DUAL-LAYER BACKGROUND DISSOLVE VỚI CĂN CHỈNH TỪ DATABASE */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {slides.map((slide, index) => {
          const isCurrent = index === slideIndex.current;
          // prev = -1 khi lần đầu vào web → không hiện slide nào làm "prev" → không bị flash
          const isPrev = slideIndex.prev >= 0 && index === slideIndex.prev;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-[500ms] ease-in-out will-change-[opacity] ${
                isCurrent
                  ? 'opacity-100 z-10'
                  : isPrev
                  ? 'opacity-100 z-[5]'
                  : 'opacity-0 z-0 pointer-events-none'
              }`}
              style={{
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
              }}
            >
              <div
                className={`relative w-full h-full transform transition-transform duration-[6000ms] ease-out ${
                  isCurrent ? 'scale-105' : 'scale-100'
                }`}
                style={{
                  transform: isCurrent ? `scale(${slide.ti_le_phong || 1.05})` : 'scale(1)',
                }}
              >
                <Image
                  src={getAssetUrl(slide.duong_dan_anh)}
                  alt={slide.alt_text || slide.tieu_de || 'Ảnh nền PetM&M'}
                  fill
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  unoptimized={slide.duong_dan_anh.startsWith('http')}
                  quality={90}
                  sizes="100vw"
                  className="object-cover hero-slide-img"
                  style={
                    {
                      '--pos-desktop': slide.can_chinh || 'center',
                      '--pos-mobile': getMobileObjectPosition(slide.can_chinh),
                      objectPosition: slide.can_chinh || 'center',
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>
          );
        })}

        {/* Dynamic Warm Steam Rising Layer for Living Spa / Hot Spring Atmosphere */}
        <div className="absolute -bottom-10 inset-x-0 h-48 bg-gradient-to-t from-white/10 via-white/5 to-transparent pointer-events-none z-15 animate-warm-steam" />

        {/* Floating Herbal Petals drifting gently in the air */}
        <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
          {AMBIENT_PETALS.map((petal, i) => (
            <div
              key={i}
              className="absolute bottom-4 rounded-full bg-gradient-to-br from-rose-200/40 via-amber-200/40 to-transparent blur-[0.5px] animate-floating-petal"
              style={{
                left: petal.left,
                width: `${petal.size}px`,
                height: `${petal.size * 1.3}px`,
                animationDelay: petal.delay,
                animationDuration: petal.dur,
              }}
            />
          ))}
        </div>

        {/* Ambient Luminous Atmosphere (Không còn góc đen hay mờ góc cạnh) */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent z-15 pointer-events-none" />
      </div>

      {/* 2. THREE.JS INTERACTIVE FIREFLIES */}
      <InteractiveWaterShader />

      {/* 3. FLOATING TOP PILL NAV BAR (BẢN TÔNG SÁNG SANG TRỌNG) */}
      <div className="absolute top-2 sm:top-6 inset-x-0 z-30 flex items-center justify-between px-3.5 sm:px-12 max-w-7xl mx-auto pointer-events-auto w-full">
        {/* Brand Logo PetM&M */}
        <a href="#" className="flex items-center drop-shadow-sm scale-90 sm:scale-100 origin-left">
          <PetLogo size="default" />
        </a>

        {/* Floating Frosted Glass Center Pill Navigation with Real Database Dropdowns */}
        <div className="hidden lg:flex items-center px-6 py-1.5 rounded-full bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-xl text-xs font-semibold text-slate-800 relative">
          <div className="absolute bottom-0 inset-x-0 h-[2px] overflow-hidden rounded-full pointer-events-none">
            <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-[#2D5A27] to-transparent animate-navbar-beam blur-[0.5px]" />
          </div>
          <NavDesktopMenu variant="pill" />
        </div>

        {/* Right Language Switcher on Hero Top Bar */}
        <div className="flex items-center">
          <LanguageSwitcher variant="glass" />
        </div>
      </div>

      {/* 4. EDITORIAL LUXURY HEADLINE (NỀN TRONG SUỐT 100%, GỌN GÀNG ÔM SÁT TRÊN ĐIỆN THOẠI) */}
      <div className="relative z-30 max-w-7xl mx-auto px-3.5 sm:px-12 w-full pt-1 sm:pt-14 pointer-events-none">
        <div className="max-w-2xl text-left pointer-events-auto bg-transparent p-0 relative">
          {/* Three.js 3D Interactive Stardust & Particle Aura Layer */}
          <SloganAura3D className="w-[125%] h-[130%] -top-12 -left-6 sm:-top-16 sm:-left-12 pointer-events-none" />

          {/* Majestic Editorial Title: key reset → animation chạy lại mỗi lần Hero vào viewport */}
          {(() => {
            const rawTitle = isEn
              ? (config.slogan_dau_trang_tieu_de_en || 'Cherishing Every Breath, Embracing Life with Peace.')
              : (config.slogan_dau_trang_tieu_de || 'Nâng niu từng nhịp thở, an yên trọn một đời.');
            const parts = rawTitle.includes(',') ? rawTitle.split(',') : [rawTitle];
            const firstPart = parts[0].trim();
            const remainingPart = parts.slice(1).join(',').trim();

            const line1Words = firstPart.split(' ').filter(Boolean);
            const line2Words = remainingPart ? remainingPart.replace(/\.$/, '').trim().split(' ').filter(Boolean) : [];
            const baseDelay = 0.06;
            const line1Done = line1Words.length * baseDelay + 0.72;
            const shimmerStart = line1Done + line2Words.length * baseDelay + 0.8;

            return (
              <div className="relative inline-block mb-1 sm:mb-5">
                {/* Lớp hạt sao kim cương lấp lánh (Sparkling Twinkling Stars ✨) */}
                <div className="absolute -inset-4 pointer-events-none z-20 overflow-visible">
                  {/* Star 1: Trên chữ Nâng niu */}
                  <span className="absolute top-1 -left-1 sm:-top-2 sm:-left-3 animate-sparkle-star-1">
                    <SparkleStar className="w-4 h-4 sm:w-6 sm:h-6" />
                  </span>
                  {/* Star 2: Góc phải trên 'nhịp thở,' */}
                  <span className="absolute -top-1 right-2 sm:-top-2 sm:right-12 animate-sparkle-star-2">
                    <SparkleStar className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </span>
                  {/* Star 3: Giữa 2 dòng câu */}
                  <span className="absolute top-[48%] left-[28%] sm:left-[32%] animate-sparkle-star-3">
                    <SparkleStar className="w-3 h-3 sm:w-4 sm:h-4" />
                  </span>
                  {/* Star 4: Đuôi chữ 'trọn một đời.' */}
                  <span className="absolute -bottom-1 right-1 sm:-bottom-2 sm:right-6 animate-sparkle-star-4">
                    <SparkleStar className="w-4 h-4 sm:w-6 sm:h-6" />
                  </span>
                  {/* Star 5: Giữa cụm 'từng nhịp' */}
                  <span className="absolute top-[6%] left-[46%] animate-sparkle-star-5">
                    <SparkleStar className="w-3 h-3 sm:w-4.5 sm:h-4.5" />
                  </span>
                </div>

                {/* Vệt quét ánh sáng kim cương (Diamond Sheen Sweep) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 rounded-xl">
                  <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 animate-slogan-sheen" />
                </div>

                {/* Tiêu đề chính H1: Viền trắng sắc nét + Hào quang lấp lánh */}
                <h1
                  key={sloganKey}  // ← reset → toàn bộ animation chạy lại khi Hero vào viewport
                  suppressHydrationWarning
                  className="relative z-0 font-editorial text-[1.35rem] sm:text-5xl lg:text-[58px] font-semibold tracking-normal leading-[1.18] sm:leading-[1.1] animate-slogan-sparkle"
                  style={{ perspective: '800px' }}
                >
                  {/* DÒNG 1: Từng word rớt xuống → wave float liên tục + Viền trắng sắc nét */}
                  <span className="block">
                    {line1Words.map((word, i) => {
                      const entranceDelay = i * baseDelay;
                      const loopDelay = i * 0.15;
                      const isLast = i === line1Words.length - 1;
                      return (
                        <span
                          key={`w1-${i}`}
                          className="inline-block mr-[0.22em] last:mr-0 slogan-bordered-word text-slate-900"
                          style={{
                            animation: `letterDrop 0.72s cubic-bezier(0.22, 1, 0.36, 1) ${entranceDelay}s both,
                                        sloganWordWave 3.8s ease-in-out ${line1Done + loopDelay}s infinite`,
                            opacity: 0,
                          }}
                        >
                          {word}{isLast && remainingPart ? ',' : ''}
                        </span>
                      );
                    })}
                  </span>

                  {/* DÒNG 2 (italic xanh ngọc đậm): Từng word rớt xuống → wave float liên tục + Viền trắng sắc nét */}
                  {remainingPart && (
                    <span
                      className="block not-italic font-light normal-case tracking-normal"
                      style={{ fontSize: '0.82em' }}
                    >
                      {line2Words.map((word, i) => {
                        const entranceDelay = line1Done + i * baseDelay;
                        const isLastWord = i === line2Words.length - 1;
                        return (
                          <span
                            key={`w2-${i}`}
                            className="inline-block mr-[0.25em] last:mr-0 slogan-bordered-word text-[#194D18]"
                            style={{
                              fontStyle: 'italic',
                              opacity: 0,
                              animation: `letterDrop 0.72s cubic-bezier(0.22, 1, 0.36, 1) ${entranceDelay}s both,
                                          sloganWordWave 3.8s ease-in-out ${shimmerStart + i * 0.15}s infinite`,
                            }}
                          >
                            {word}{isLastWord ? '.' : ''}
                          </span>
                        );
                      })}
                    </span>
                  )}
                </h1>
              </div>
            );
          })()}

          {/* 2 CTA Buttons (Đưa lên ngay dưới Tiêu đề chính) */}
          <div className="flex flex-row items-center gap-2 sm:gap-4 max-w-sm sm:max-w-none animate-slogan-cta mb-2 sm:mb-4">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const bookingEl = document.getElementById('booking');
                  if (bookingEl) {
                    bookingEl.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState(null, '', '#booking');
                  } else {
                    window.location.href = '/#booking';
                  }
                }
              }}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-[11px] sm:text-sm bg-gradient-to-r from-[#2D5A27] to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-md shadow-emerald-950/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <CalendarCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFB800]" />
              <span>{t('btn_book_appointment', 'Đặt Lịch Thăm Khám')}</span>
            </button>

            <a
              href="#services"
              className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-7 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-[11px] sm:text-sm bg-white/95 hover:bg-white text-slate-800 border border-slate-300 shadow-sm hover:border-[#2D5A27] transition-all duration-200 cursor-pointer backdrop-blur-sm whitespace-nowrap"
            >
              <span>{t('btn_view_services', 'Xem Dịch Vụ')}</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-[#2D5A27]" />
            </a>
          </div>
        </div>
      </div>

      {/* 5. NÚT CHUYỂN SLIDE TRÁI / PHẢI NẰM Ở RÌA (TRÊN MOBILE NẰM TRÊN THANH SLIDE, TRÊN DESKTOP NẰM GIỮA) */}
      {/* Nút Trái (Ảnh trước) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        aria-label={isEn ? 'Previous slide' : 'Xem ảnh trước'}
        className="absolute left-3 sm:left-6 bottom-14 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-30 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-[#2D5A27] border border-slate-200/90 shadow-xl backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer group"
      >
        <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 transition-transform group-hover:-translate-x-0.5" />
      </button>

      {/* Nút Phải (Ảnh kế tiếp) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        aria-label={isEn ? 'Next slide' : 'Xem ảnh kế tiếp'}
        className="absolute right-3 sm:right-6 bottom-14 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-30 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-[#2D5A27] border border-slate-200/90 shadow-xl backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer group"
      >
        <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* 6. CHUYỂN VÙNG & THANH SLIDE CHẠY THÔNG ĐIỆP CHÂN BANNER (Yêu cầu: Chuyển câu slogan mô tả xuống vạch ngăn & chạy như slide) */}
      <div
        className="absolute bottom-0 inset-x-0 z-20 pointer-events-auto"
        onTouchStart={(e) => {
          e.stopPropagation();
          if (tickerRef.current) tickerRef.current.style.animationPlayState = 'paused';
        }}
        onTouchEnd={() => {
          if (tickerRef.current) tickerRef.current.style.animationPlayState = 'running';
        }}
        onTouchCancel={() => {
          if (tickerRef.current) tickerRef.current.style.animationPlayState = 'running';
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Lớp gradient mờ hoà trộn ảnh Hero êm dịu vào vạch trắng */}
        <div className="h-6 sm:h-10 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />

        {/* Thanh slide chạy thông điệp y khoa (Marquee Ticker Banner) */}
        <div className="relative w-full bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-2px_12px_rgba(0,0,0,0.03)] py-2 sm:py-2.5 overflow-hidden group">
          {/* Lớp bóng mờ 2 mép (Vignette Fade) tạo hiệu ứng chữ lướt vào/ra êm dịu */}
          <div className="pointer-events-none absolute left-0 inset-y-0 w-8 sm:w-20 bg-gradient-to-r from-white via-white/90 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 inset-y-0 w-8 sm:w-20 bg-gradient-to-l from-white via-white/90 to-transparent z-10" />

          {/* Dải chữ chạy liên tục vô tận (Infinite Marquee Ticker) với Icon Chó & Mèo 8K siêu sắc nét */}
          <div
            ref={tickerRef}
            className="flex w-max animate-marquee-slogan select-none"
            onMouseEnter={() => {
              if (tickerRef.current) tickerRef.current.style.animationPlayState = 'paused';
            }}
            onMouseLeave={() => {
              if (tickerRef.current) tickerRef.current.style.animationPlayState = 'running';
            }}
            onTouchStart={() => {
              if (tickerRef.current) tickerRef.current.style.animationPlayState = 'paused';
            }}
            onTouchEnd={() => {
              if (tickerRef.current) tickerRef.current.style.animationPlayState = 'running';
            }}
            onTouchCancel={() => {
              if (tickerRef.current) tickerRef.current.style.animationPlayState = 'running';
            }}
          >
            {(() => {
              const rawSlogan = isEn
                ? (config.slogan_dau_trang_noi_dung_en ||
                   'Standardized veterinary medicine combined with natural recovery therapies. Where pure love blends with state-of-the-art medical technology to restore physical vitality and soothe peace of mind.')
                : (config.slogan_dau_trang_noi_dung ||
                   'Không gian y khoa chuẩn mực hòa cùng liệu pháp phục hồi thiên nhiên. Nơi tình thương thuần khiết hòa quyện cùng công nghệ điều trị tiên tiến nhất thế giới, cho bé cưng hồi phục thể chất và an yên tâm trí.');
              const dotIndex = rawSlogan.indexOf('.');
              const part1 = dotIndex > -1 ? rawSlogan.slice(0, dotIndex + 1).trim() : rawSlogan;
              const part2 = dotIndex > -1 ? rawSlogan.slice(dotIndex + 1).trim() : '';

              return [1, 2].map((loopIdx) => (
                <div key={loopIdx} className="flex shrink-0 items-center gap-6 sm:gap-10 pr-6 sm:pr-10">
                  {/* Cụm 1: Icon Chó Hoạt Hình 3D Dễ Thương + Câu 1 */}
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <Cute3DDogIcon className="w-7 h-7 sm:w-8 sm:h-8 hover:scale-125 transition-transform duration-200" />
                    <span className="text-xs sm:text-sm text-slate-800 font-medium tracking-normal whitespace-nowrap">
                      {part1}
                    </span>
                  </div>

                  {/* Cụm 2: Icon Mèo Hoạt Hình 3D Dễ Thương + Câu 2 (nếu có) */}
                  {part2 ? (
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <Cute3DCatIcon className="w-7 h-7 sm:w-8 sm:h-8 hover:scale-125 transition-transform duration-200" />
                      <span className="text-xs sm:text-sm text-slate-800 font-medium tracking-normal whitespace-nowrap">
                        {part2}
                      </span>
                    </div>
                  ) : null}

                  {/* Dấu chân thú cưng 3D siêu dễ thương */}
                  <Cute3DPawIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5 hover:scale-125 transition-transform duration-200" />

                  <span className="text-amber-500/70 text-xs sm:text-sm font-light select-none">✦</span>

                  {/* Lặp lại để chuỗi chạy dày dặn không bị trống trên màn hình lớn */}
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <Cute3DDogIcon className="w-7 h-7 sm:w-8 sm:h-8 hover:scale-125 transition-transform duration-200" />
                    <span className="text-xs sm:text-sm text-slate-800 font-medium tracking-normal whitespace-nowrap">
                      {part1}
                    </span>
                  </div>

                  {part2 ? (
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <Cute3DCatIcon className="w-7 h-7 sm:w-8 sm:h-8 hover:scale-125 transition-transform duration-200" />
                      <span className="text-xs sm:text-sm text-slate-800 font-medium tracking-normal whitespace-nowrap">
                        {part2}
                      </span>
                    </div>
                  ) : null}

                  <Cute3DPawIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5 hover:scale-125 transition-transform duration-200" />

                  <span className="text-amber-500/70 text-xs sm:text-sm font-light select-none">✦</span>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </section>
  );
}
