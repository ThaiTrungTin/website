'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  Heart,
  Stethoscope,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  MapPin,
  Users,
} from 'lucide-react';
import ScrollRevealTitle from '@/components/ScrollRevealTitle';
import { useSystemConfig } from '@/context/SystemConfigContext';
import { supabase } from '@/lib/supabase';
import { getAssetUrl } from '@/lib/assets';

// Interface slide giới thiệu
interface AboutSlideItem {
  id?: string;
  image: string;
  title: string;
  tag: string;
}

// Danh sách các hình ảnh bệnh viện & đội ngũ y tế chuẩn thực tế dự phòng
const DEFAULT_ABOUT_SLIDES: AboutSlideItem[] = [
  {
    image: '/about_team_entrance.jpg',
    title: 'Đội Ngũ Bác Sĩ & Trụ Sở Bệnh Viện Pet M&M',
    tag: 'Đội ngũ chuyên môn',
  },
  {
    image: '/about_consultation.jpg',
    title: 'Phòng Khám Fear-Free & Siêu Âm Chẩn Đoán Hình Ảnh',
    tag: 'Cơ sở vật chất',
  },
  {
    image: '/about_surgery.jpg',
    title: 'Phòng Mổ Vô Trùng Áp Lực Dương Tiêu Chuẩn Quốc Tế',
    tag: 'Ngoại khoa chuyên sâu',
  },
];

export default function AboutSection() {
  const { config } = useSystemConfig();

  const huyHieu = config.gioi_thieu_huy_hieu || 'SỨ MỆNH & TRIẾT LÝ PET M&M';
  const tieuDe1 = config.gioi_thieu_tieu_de_1 || 'Nâng Tầm Chăm Sóc Y Khoa';
  const tieuDe2 = config.gioi_thieu_tieu_de_2 || 'Bằng Trái Tim & Y Đức';
  const moTa =
    config.gioi_thieu_mo_ta ||
    'Được thành lập với sứ mệnh kiến tạo chuẩn mực y tế thú cưng mới tại Việt Nam, Pet M&M không chỉ là một bệnh viện đa khoa hiện đại, mà còn là một “ngôi nhà thứ hai” nơi mỗi bé cưng được bảo vệ bằng tình thương và sự tận tụy cao nhất.';
  const trichDan =
    config.gioi_thieu_trich_dan ||
    '“Chúng tôi coi từng nhịp thở, từng ánh mắt của các bé là trách nhiệm và niềm tự hào lớn nhất trong sự nghiệp y khoa của mình.”';
  const bacSiTen = config.gioi_thieu_bac_si_ten || 'BS. CKI Nguyễn Minh Tuấn';
  const bacSiChucDanh =
    config.gioi_thieu_bac_si_chuc_danh || 'Giám Đốc Chuyên Môn Hệ Thống Bệnh Viện Pet M&M';
  const namThanhLap = config.thong_ke_nam_thanh_lap || '2018';
  const namThanhLapNhan = config.thong_ke_nam_thanh_lap_nhan || 'Năm thành lập';
  const khachHang = config.thong_ke_khach_hang || '30k+';
  const khachHangNhan = config.thong_ke_khach_hang_nhan || 'Khách hàng';

  // 1. Quản lý danh sách slide ảnh từ Supabase (bảng hinh_anh với chuyen_muc = 'gioi_thieu')
  const [slides, setSlides] = useState<AboutSlideItem[]>(DEFAULT_ABOUT_SLIDES);

  useEffect(() => {
    async function fetchSlides() {
      try {
        const { data, error } = await supabase
          .from('hinh_anh')
          .select('*')
          .eq('chuyen_muc', 'gioi_thieu')
          .eq('kich_hoat', true)
          .order('thu_tu', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: AboutSlideItem[] = data.map((d: any) => ({
            id: d.id,
            image: d.duong_dan_anh || '/about_team_entrance.jpg',
            title: d.tieu_de || 'Bệnh Viện Thú Y Pet M&M',
            tag: d.alt_text || 'Đội ngũ chuyên môn',
          }));
          setSlides(mapped);
        }
      } catch (err) {
        console.warn('Lỗi lấy slide giới thiệu:', err);
      }
    }
    fetchSlides();

    const channel = supabase
      .channel('about_slides_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hinh_anh' }, () => {
        fetchSlides();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 2. Tự động đếm số lượng cơ sở & số lượng đội ngũ y tế từ Supabase
  const [branchCount, setBranchCount] = useState<number>(2);
  const [teamCount, setTeamCount] = useState<number>(25);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [branchRes, teamRes] = await Promise.all([
          supabase.from('chi_nhanh').select('*', { count: 'exact', head: true }).eq('kich_hoat', true),
          supabase.from('doi_ngu_y_te').select('*', { count: 'exact', head: true }).eq('kich_hoat', true),
        ]);

        if (!branchRes.error && typeof branchRes.count === 'number' && branchRes.count > 0) {
          setBranchCount(branchRes.count);
        }
        if (!teamRes.error && typeof teamRes.count === 'number' && teamRes.count > 0) {
          setTeamCount(teamRes.count);
        }
      } catch (err) {
        console.warn('Lỗi lấy thống kê cơ sở/đội ngũ:', err);
      }
    }
    fetchCounts();
  }, []);

  // 3. Quản lý chuyển slide ảnh xem lần lượt với dấu < và >
  const [currentSlide, setCurrentSlide] = useState(0);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const pillars = [
    {
      title: 'Môi Trường Fear-Free Chuẩn Hoa Kỳ',
      desc: 'Phòng khám phân luồng Chó - Mèo tách biệt hoàn toàn, tinh dầu thảo mộc Pheromone xoa dịu tâm lý giúp thú cưng không còn sợ hãi.',
      icon: Heart,
    },
    {
      title: 'Hệ Thống Y Khoa Vô Trùng Áp Lực Dương',
      desc: 'Phòng mổ vô trùng tuyệt đối, máy gây mê bay hơi Isoflurane cao cấp hạn chế tối đa rủi ro cho thú cưng lớn tuổi.',
      icon: Stethoscope,
    },
    {
      title: 'Hội Đồng Bác Sĩ Chuyên Môn Sâu',
      desc: '100% bác sĩ tốt nghiệp chính quy, tu nghiệp định kỳ tại Nhật Bản & Châu Âu, điều trị theo y học chứng cứ hiện đại.',
      icon: Award,
    },
    {
      title: 'Hồ Sơ Bệnh Án Điện Tử Minh Bạch',
      desc: 'Toàn bộ phác đồ và viện phí đều được tư vấn rõ ràng trước khi can thiệp. Theo dõi lịch sử bệnh án trực tuyến tiện lợi.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="about" className="relative py-16 sm:py-24 text-slate-900 overflow-hidden bg-white border-b border-slate-200/80">
      {/* Nền mờ trang trí */}
      <div className="absolute inset-0 z-0">
        <Image
          src={getAssetUrl('/services_bg.jpg')}
          alt="Bác sĩ Pet M&M chăm sóc ân cần cho thú cưng"
          fill
          quality={90}
          className="object-cover object-center scale-105 opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/85 to-white/95" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* CỘT TRÁI (6 CỘT): TIÊU ĐỀ, MÔ TẢ & 4 TRỤ CỘT Y ĐỨC */}
          <div className="lg:col-span-6 space-y-6">
            <ScrollRevealTitle>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#2D5A27] text-xs font-bold tracking-wider uppercase mb-3 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
                <span>{huyHieu}</span>
              </div>

              <h2 className="font-editorial text-2xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-slate-900 mb-4 leading-tight">
                {tieuDe1} <br />
                <span className="italic font-light text-[#2D5A27]">{tieuDe2}</span>
              </h2>
            </ScrollRevealTitle>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
              {moTa}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {pillars.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/90 border border-slate-200 hover:border-[#2D5A27] transition-all duration-300 shadow-2xs hover:shadow-md"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#2D5A27] border border-emerald-200 flex items-center justify-center mb-2.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 mb-1 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-light">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CỘT PHẢI (6 CỘT): KHỐI ẢNH SLIDESHOW & BẢNG THỐNG KÊ (THÀNH LẬP, CƠ SỞ, KHÁCH HÀNG, ĐỘI NGŨ) */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 bg-white">
              {/* 1. KHU VỰC ẢNH VỚI DẤU < VÀ > ĐỂ XEM LẦN LƯỢT */}
              <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-slate-900 group">
                {slides.length > 0 && (
                  <Image
                    src={getAssetUrl(slides[currentSlide]?.image || '/about_team_entrance.jpg')}
                    alt={slides[currentSlide]?.title || 'Pet M&M'}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center transition-all duration-700 ease-out"
                    priority
                  />
                )}

                {/* Lớp phủ gradient nhẹ */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                {/* Huy hiệu thông tin ảnh */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-black/50 text-white backdrop-blur-md border border-white/20 shadow-xs">
                    {slides[currentSlide]?.tag || 'Đội ngũ chuyên môn'}
                  </span>
                </div>

                {/* Dòng tiêu đề chú thích ảnh */}
                <div className="absolute bottom-3 left-4 right-4 z-10 text-white">
                  <p className="text-xs sm:text-sm font-semibold drop-shadow-md truncate">
                    {slides[currentSlide]?.title || ''}
                  </p>
                </div>

                {/* NÚT LÙI ẢNH < */}
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Xem ảnh trước"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xs"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-800" />
                </button>

                {/* NÚT TIẾP THEO > */}
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Xem ảnh tiếp theo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xs"
                >
                  <ChevronRight className="w-5 h-5 text-slate-800" />
                </button>

                {/* Chỉ báo Dots chuyển ảnh */}
                <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2 py-1 rounded-full">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentSlide(i)}
                      aria-label={`Chuyển đến ảnh ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        currentSlide === i ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/60 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* 2. THANH BẢNG THỐNG KÊ (THÀNH LẬP - CƠ SỞ - KHÁCH HÀNG - ĐỘI NGŨ) */}
              {/* Phong cách khối đặc sang trọng tông xanh thương hiệu chuẩn y tế */}
              <div className="bg-[#2D5A27] text-white py-5 px-3 sm:px-6">
                <div className="grid grid-cols-4 items-center text-center divide-x divide-white/20">
                  {/* Cột 1: Năm thành lập */}
                  <div className="px-1 sm:px-2">
                    <div className="font-editorial text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-none">
                      {namThanhLap}
                    </div>
                    <div className="text-[10px] sm:text-xs text-white/80 font-light mt-1.5 leading-tight">
                      {namThanhLapNhan}
                    </div>
                  </div>

                  {/* Cột 2: Cơ sở (Tự động đếm - Click chuyển thẳng qua Cơ sở) */}
                  <div className="px-1 sm:px-2">
                    <a
                      href="#branches"
                      className="group inline-block cursor-pointer transition-transform hover:scale-105"
                      title="Xem danh sách toàn bộ cơ sở"
                    >
                      <div className="font-editorial text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-none group-hover:text-amber-300 transition-colors flex items-center justify-center gap-0.5">
                        <span>{String(branchCount).padStart(2, '0')}</span>
                        <ArrowUpRight className="w-3 h-3 text-amber-300/80 group-hover:text-amber-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                      <div className="text-[10px] sm:text-xs text-white/80 font-light mt-1.5 leading-tight group-hover:text-white group-hover:underline transition">
                        Cơ sở TP.HCM
                      </div>
                    </a>
                  </div>

                  {/* Cột 3: Khách hàng */}
                  <div className="px-1 sm:px-2">
                    <div className="font-editorial text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-none">
                      {khachHang}
                    </div>
                    <div className="text-[10px] sm:text-xs text-white/80 font-light mt-1.5 leading-tight">
                      {khachHangNhan}
                    </div>
                  </div>

                  {/* Cột 4: Đội ngũ y tế (Click chuyển view sang trang Đội ngũ y tế) */}
                  <div className="px-1 sm:px-2">
                    <Link
                      href="/doi-ngu"
                      className="group inline-block cursor-pointer transition-transform hover:scale-105"
                      title="Xem thông tin chi tiết đội ngũ y bác sĩ"
                    >
                      <div className="font-editorial text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-none group-hover:text-amber-300 transition-colors flex items-center justify-center gap-0.5">
                        <span>{teamCount}+</span>
                        <ArrowUpRight className="w-3 h-3 text-amber-300/80 group-hover:text-amber-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                      <div className="text-[10px] sm:text-xs text-white/80 font-light mt-1.5 leading-tight group-hover:text-white group-hover:underline transition">
                        Đội ngũ y tế
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Trích dẫn y đức nhỏ xinh ngay dưới thẻ */}
            <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs text-xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#2D5A27] flex items-center justify-center shrink-0 border border-emerald-200">
                <Heart className="w-4 h-4 text-[#2D5A27]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="italic text-slate-600 line-clamp-1 font-light leading-relaxed">
                  {trichDan}
                </p>
                <p className="text-[11px] font-bold text-[#2D5A27] mt-0.5">
                  {bacSiTen} • <span className="font-normal text-slate-500">{bacSiChucDanh}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
