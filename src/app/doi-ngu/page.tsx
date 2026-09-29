'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Stethoscope,
  Award,
  Heart,
  CalendarCheck,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  User,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { supabase, DoiNguRecord, DoiNguPhanLoai } from '@/lib/supabase';
import ConsultationSidebar from '@/components/ConsultationSidebar';
import Footer from '@/components/Footer';
import FloatingContactWidgets from '@/components/FloatingContactWidgets';
import ScrollNavigationButtons from '@/components/ScrollNavigationButtons';
import { getAssetUrl } from '@/lib/assets';

// Component Avatar mặc định Facebook silhouette khi để trống ảnh
function DefaultFacebookAvatar() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#D6D0C7]">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#E5DFD7] flex items-center justify-center overflow-hidden shadow-inner">
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#B8B0A5]" fill="currentColor">
          <circle cx="50" cy="38" r="18" />
          <path d="M18 90c0-17.67 14.33-32 32-32s32 14.33 32 32v10H18V90z" />
        </svg>
      </div>
    </div>
  );
}

// Component hiển thị hạng mục bác sĩ với tính năng lướt ngang & số đếm trên điện thoại
function CategorySwipeSection({
  id,
  title,
  items,
  isTwoColumnDesktop = false,
}: {
  id: string;
  title: string;
  items: DoiNguRecord[];
  isTwoColumnDesktop?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(items.length > 1);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

    const children = scrollRef.current.children;
    if (children.length > 0) {
      const firstChild = children[0] as HTMLElement;
      const cardWidth = firstChild.offsetWidth + 16;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(Math.max(index, 0), items.length - 1));
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    handleScroll();
    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [items]);

  const scrollPrev = () => {
    if (!scrollRef.current) return;
    const children = scrollRef.current.children;
    const step = children.length > 0 ? (children[0] as HTMLElement).offsetWidth + 16 : 280;
    scrollRef.current.scrollBy({ left: -step, behavior: 'smooth' });
  };

  const scrollNext = () => {
    if (!scrollRef.current) return;
    const children = scrollRef.current.children;
    const step = children.length > 0 ? (children[0] as HTMLElement).offsetWidth + 16 : 280;
    scrollRef.current.scrollBy({ left: step, behavior: 'smooth' });
  };

  const scrollToItem = (idx: number) => {
    if (!scrollRef.current) return;
    const children = scrollRef.current.children;
    const step = children.length > 0 ? (children[0] as HTMLElement).offsetWidth + 16 : 280;
    scrollRef.current.scrollTo({ left: idx * step, behavior: 'smooth' });
    setActiveIndex(idx);
  };

  if (!items || items.length === 0) return null;

  return (
    <section id={id} className="scroll-mt-24 space-y-4 sm:space-y-5">
      {/* Tiêu đề hạng mục + Số đếm trên điện thoại */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#2D5A27] rounded-full shrink-0" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {title} ({items.length})
          </h2>
        </div>

        {/* Số đếm hiện tại trên điện thoại */}
        {items.length > 1 && (
          <span className="md:hidden text-[11px] font-bold text-[#2D5A27] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
            {activeIndex + 1} / {items.length}
          </span>
        )}
      </div>

      {/* Khung carousel: 2 nút mũi tên < > đặt trực tiếp đè trên ảnh ở mobile */}
      <div className="relative group/carousel">
        {/* Nút lùi ảnh < đè trên ảnh ở mobile */}
        {items.length > 1 && canScrollLeft && (
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Xem bác sĩ trước"
            className="md:hidden absolute left-1.5 top-24 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-lg border border-slate-200/90 flex items-center justify-center transition-all active:scale-90 cursor-pointer backdrop-blur-xs"
          >
            <ChevronLeft className="w-4 h-4 text-slate-800" />
          </button>
        )}

        {/* Nút tiếp theo > đè trên ảnh ở mobile */}
        {items.length > 1 && canScrollRight && (
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Xem tiếp bác sĩ sau"
            className="md:hidden absolute right-1.5 top-24 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-lg border border-slate-200/90 flex items-center justify-center transition-all active:scale-90 cursor-pointer backdrop-blur-xs"
          >
            <ChevronRight className="w-4 h-4 text-slate-800" />
          </button>
        )}

        {/* Danh sách thẻ: Trên mobile cuộn ngang (snap-x), trên PC dàn lưới */}
        <div
          ref={scrollRef}
          className={`flex overflow-x-auto gap-4 pb-3 scroll-smooth snap-x snap-mandatory scrollbar-none md:grid ${
            isTwoColumnDesktop ? 'md:grid-cols-2' : 'md:grid-cols-3'
          } md:gap-5 md:pb-0 md:overflow-visible`}
        >
        {items.map((doctor, idx) => (
          isTwoColumnDesktop ? (
            /* Style cho Chuyên gia tư vấn (2 cột rộng) */
            <div
              key={doctor.id}
              className="w-[280px] sm:w-[320px] shrink-0 snap-start md:w-auto md:shrink bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start group relative"
            >
              {/* Badge số đếm trên thẻ ở mobile */}
              <div className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#2D5A27] border border-emerald-100/80 md:hidden">
                {idx + 1}/{items.length}
              </div>

              {/* Ảnh đại diện bên trái */}
              <div className="relative w-full sm:w-28 sm:h-36 aspect-square sm:aspect-auto rounded-xl bg-[#E5DFDA] overflow-hidden shrink-0">
                {doctor.hinh_anh ? (
                  <Image
                    src={getAssetUrl(doctor.hinh_anh)}
                    alt={doctor.ho_ten}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 300px, 120px"
                  />
                ) : (
                  <DefaultFacebookAvatar />
                )}
              </div>

              {/* Thông tin bên phải */}
              <div className="flex-1 min-w-0">
                {doctor.chuc_danh && (
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[#2D5A27] mb-1">
                    {doctor.chuc_danh}
                  </span>
                )}
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {doctor.ho_ten}
                </h3>
                {doctor.hoc_vi_chuc_vu && (
                  <p className="text-xs text-slate-700 font-medium mt-0.5">
                    {doctor.hoc_vi_chuc_vu}
                  </p>
                )}
                {doctor.mo_ta && (
                  <p className="text-xs text-slate-600 leading-relaxed font-light mt-2.5">
                    {doctor.mo_ta}
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Style chuẩn đứng (3 cột) cho Lãnh đạo, Bác sĩ, Điều dưỡng */
            <div
              key={doctor.id}
              className="w-[260px] sm:w-[280px] shrink-0 snap-start md:w-auto md:shrink bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group relative"
            >
              {/* Badge số đếm trên thẻ ở mobile */}
              <div className="absolute top-2.5 right-2.5 z-10 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[#2D5A27] border border-emerald-100 shadow-xs md:hidden">
                {idx + 1}/{items.length}
              </div>

              {/* Ảnh đại diện / Facebook silhouette placeholder */}
              <div className="relative w-full aspect-[4/3] bg-[#E5DFDA] overflow-hidden">
                {doctor.hinh_anh ? (
                  <Image
                    src={getAssetUrl(doctor.hinh_anh)}
                    alt={doctor.ho_ten}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 280px, 33vw"
                  />
                ) : (
                  <DefaultFacebookAvatar />
                )}
              </div>

              {/* Nội dung thông tin thẻ */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between text-left">
                <div>
                  {doctor.chuc_danh && (
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[#2D5A27] mb-1">
                      {doctor.chuc_danh}
                    </span>
                  )}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {doctor.ho_ten}
                  </h3>
                  {doctor.hoc_vi_chuc_vu && (
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {doctor.hoc_vi_chuc_vu}
                    </p>
                  )}
                </div>

                {doctor.mo_ta && (
                  <p className="text-xs text-slate-600 leading-relaxed font-light mt-3 pt-3 border-t border-slate-100">
                    {doctor.mo_ta}
                  </p>
                )}
              </div>
            </div>
          )
        ))}
        </div>
      </div>

      {/* Chỉ báo Dots trên điện thoại */}
      {items.length > 1 && (
        <div className="md:hidden flex items-center justify-center gap-1.5 pt-1">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToItem(i)}
              aria-label={`Chuyển đến bác sĩ ${i + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeIndex === i ? 'w-5 bg-[#2D5A27]' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// Danh sách đội ngũ mẫu dự phòng chuẩn xác
const FALLBACK_TEAM: DoiNguRecord[] = [
  // 1. Lãnh đạo chuyên môn
  {
    id: '1',
    ho_ten: 'TS. BSTY. Vương Tuấn Phong',
    chuc_danh: 'NHÀ SÁNG LẬP · PET M&M',
    hoc_vi_chuc_vu: 'Tiến sĩ Thú y · Giám Đốc Điều Hành',
    phan_loai: 'lanh_dao',
    hinh_anh: '/about_team_entrance.jpg',
    mo_ta:
      'Phụ trách định hướng phát triển, vận hành hệ thống và kết nối nguồn lực chuyên môn. Tiến sĩ ĐH Hokkaido, học bổng MEXT Nhật Bản.',
    thu_tu: 1,
    kich_hoat: true,
  },
  {
    id: '2',
    ho_ten: 'PGS. BSTY. Bùi Khánh Linh',
    chuc_danh: 'NHÀ SÁNG LẬP · PET M&M',
    hoc_vi_chuc_vu: 'Phó Giáo Sư Thú Y · Viện Trưởng Nghiên Cứu',
    phan_loai: 'lanh_dao',
    hinh_anh: '/about_consultation.jpg',
    mo_ta:
      'Xây dựng nền tảng hợp tác quốc tế, tinh thần đào tạo và định hướng phát triển bền vững dựa trên tiến bộ khoa học công nghệ cho Pet M&M.',
    thu_tu: 2,
    kich_hoat: true,
  },
  {
    id: '3',
    ho_ten: 'BS. CKI Nguyễn Minh Tuấn',
    chuc_danh: 'GIÁM ĐỐC CHUYÊN MÔN',
    hoc_vi_chuc_vu: 'Bác Sĩ Chuyên Khoa I · Ngoại Khoa',
    phan_loai: 'lanh_dao',
    hinh_anh: '/about_surgery.jpg',
    mo_ta:
      'Hơn 15 năm kinh nghiệm điều hành và phẫu thuật vi phẫu. Đặt nền móng cho hệ thống chuyên môn y khoa thú y chuẩn mực theo tinh thần y đức.',
    thu_tu: 3,
    kich_hoat: true,
  },

  // 2. Chuyên gia tư vấn
  {
    id: '4',
    ho_ten: 'GS. Tetsuya Nakade',
    chuc_danh: 'CHUYÊN GIA TƯ VẤN CHẨN ĐOÁN HÌNH ẢNH',
    hoc_vi_chuc_vu: 'Giáo sư danh dự · ĐH Rakuno Gakuen, Nhật Bản',
    phan_loai: 'chuyen_gia',
    hinh_anh: '/about_consultation.jpg',
    mo_ta:
      'Định hướng chuyên môn trong việc sử dụng dữ liệu hình ảnh, thiết bị chẩn đoán và đánh giá ca bệnh theo hướng khoa học, chính xác hơn.',
    thu_tu: 1,
    kich_hoat: true,
  },
  {
    id: '5',
    ho_ten: 'PGS. BSTY. Sử Thanh Long',
    chuc_danh: 'CỐ VẤN CHUYÊN MÔN CAO CẤP',
    hoc_vi_chuc_vu: 'Giám đốc Bệnh viện Thú cưng Quốc Tế',
    phan_loai: 'chuyen_gia',
    hinh_anh: '/about_team_entrance.jpg',
    mo_ta:
      'Đặt nền móng cho hệ sinh thái y tế thú cưng trên nền tảng học thuật, đào tạo và chuyên môn thú y theo tinh thần khoa học, chuẩn mực.',
    thu_tu: 2,
    kich_hoat: true,
  },

  // 3. Bác sĩ thú y
  {
    id: '6',
    ho_ten: 'BS. Đỗ Trung Nguyên',
    chuc_danh: 'BÁC SĨ THÚ Y',
    hoc_vi_chuc_vu: 'Bác Sĩ Điều Trị Nội Khoa & Tiêu Hóa',
    phan_loai: 'bac_si',
    hinh_anh: '/about_consultation.jpg',
    mo_ta:
      'Tốt nghiệp chính quy ngành Thú Y, tận tâm và giàu kinh nghiệm trong chẩn đoán, điều trị bệnh nội khoa và hồi phục thể trạng.',
    thu_tu: 1,
    kich_hoat: true,
  },
  {
    id: '7',
    ho_ten: 'BSTY. Nguyễn Thị Thu Hiền',
    chuc_danh: 'BÁC SĨ THÚ Y',
    hoc_vi_chuc_vu: 'Bác Sĩ Chuyên Khoa Da Liễu & Dinh Dưỡng',
    phan_loai: 'bac_si',
    hinh_anh: '/about_team_entrance.jpg',
    mo_ta:
      'Chứng chỉ Fear-Free quốc tế, chuyên gia tư vấn dinh dưỡng và phác đồ điều trị da liễu dứt điểm cho thú cưng.',
    thu_tu: 2,
    kich_hoat: true,
  },
  {
    id: '8',
    ho_ten: 'BS. Kiều Quang Kiên',
    chuc_danh: 'BÁC SĨ THÚ Y',
    hoc_vi_chuc_vu: 'Bác Sĩ Ngoại Khoa & Phẫu Thuật',
    phan_loai: 'bac_si',
    hinh_anh: '/about_surgery.jpg',
    mo_ta:
      'Chuyên trách phẫu thuật mô mềm, chỉnh hình và gắp dị vật nội soi cấp cứu 24/7 với kỹ thuật xâm lấn tối thiểu.',
    thu_tu: 3,
    kich_hoat: true,
  },
  {
    id: '9',
    ho_ten: 'ThS. BS Trần Mai Anh',
    chuc_danh: 'BÁC SĨ THÚ Y',
    hoc_vi_chuc_vu: 'Thạc Sĩ Thú Y · Nhãn Khoa',
    phan_loai: 'bac_si',
    hinh_anh: '/about_consultation.jpg',
    mo_ta:
      'Chuyên gia nhãn khoa và siêu âm tim mạch Doppler. Từng tu nghiệp chuyên ngành thú y thú cảnh tại Bangkok, Thái Lan.',
    thu_tu: 4,
    kich_hoat: true,
  },

  // 4. Điều dưỡng & Chăm sóc
  {
    id: '10',
    ho_ten: 'ĐD. Bùi Văn Hướng',
    chuc_danh: 'ĐIỀU DƯỠNG TRƯỞNG',
    hoc_vi_chuc_vu: 'Trưởng Nhóm Chăm Sóc Hậu Phẫu & ICU',
    phan_loai: 'dieu_duong',
    hinh_anh: '/about_team_entrance.jpg',
    mo_ta:
      'Hơn 7 năm kinh nghiệm theo dõi sinh hiệu, chăm sóc đặc biệt sau phẫu thuật và luôn nhẹ nhàng, yêu thương các bé cưng.',
    thu_tu: 1,
    kich_hoat: true,
  },
  {
    id: '11',
    ho_ten: 'ĐD. Lê Thị Kim Yến',
    chuc_danh: 'KỸ THUẬT VIÊN SPA & THỦY LIỆU',
    hoc_vi_chuc_vu: 'Chuyên Viên Trị Liệu Thảo Mộc',
    phan_loai: 'dieu_duong',
    hinh_anh: '/pet_golden_spa.jpg',
    mo_ta:
      'Chuyên gia massage thư giãn cơ bắp, thủy liệu khoáng ấm ozone và cắt tỉa tạo kiểu Fear-Free không gây căng thẳng.',
    thu_tu: 2,
    kich_hoat: true,
  },
  {
    id: '12',
    ho_ten: 'ĐD. Trần Hoàng Nam',
    chuc_danh: 'ĐIỀU DƯỠNG VIÊN',
    hoc_vi_chuc_vu: 'Kỹ Thuật Viên Xét Nghiệm & Hỗ Trợ Khám',
    phan_loai: 'dieu_duong',
    hinh_anh: '/about_surgery.jpg',
    mo_ta:
      'Vận hành máy sinh hóa tự động, hỗ trợ bác sĩ lấy mẫu xét nghiệm chuẩn xác và chăm sóc thú cưng nằm viện nội trú.',
    thu_tu: 3,
    kich_hoat: true,
  },
];

export default function DoiNguYTePage() {
  const [team, setTeam] = useState<DoiNguRecord[]>(FALLBACK_TEAM);

  // Tải danh sách đội ngũ từ Supabase và lắng nghe realtime
  useEffect(() => {
    async function fetchTeam() {
      try {
        const { data, error } = await supabase
          .from('doi_ngu_y_te')
          .select('*')
          .eq('kich_hoat', true)
          .order('thu_tu', { ascending: true });

        if (!error && data && data.length > 0) {
          setTeam(data as DoiNguRecord[]);
        }
      } catch (err) {
        console.warn('Lỗi tải đội ngũ y tế từ Supabase, dùng dữ liệu mặc định:', err);
      }
    }

    fetchTeam();

    const channel = supabase
      .channel('doi_ngu_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'doi_ngu_y_te' },
        () => {
          fetchTeam();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Lọc theo 4 hạng mục theo đúng yêu cầu
  const lanhDaoList = team.filter((m) => m.phan_loai === 'lanh_dao');
  const chuyenGiaList = team.filter((m) => m.phan_loai === 'chuyen_gia');
  const bacSiList = team.filter((m) => m.phan_loai === 'bac_si');
  const dieuDuongList = team.filter((m) => m.phan_loai === 'dieu_duong');

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-slate-900 flex flex-col selection:bg-[#2D5A27] selection:text-white">
      {/* 1. HERO BANNER */}
      <div className="relative w-full h-64 sm:h-80 md:h-[400px] overflow-hidden bg-slate-900">
        <Image
          src={getAssetUrl('/about_team_entrance.jpg')}
          alt="Đội ngũ bác sĩ và chuyên gia Pet M&M"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 pb-8 sm:pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-300 border border-white/30 mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HỘI ĐỒNG Y KHOA CHUYÊN MÔN CAO</span>
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-editorial font-bold text-white drop-shadow-md leading-tight">
              Đội Ngũ Bác Sĩ &amp; Y Tế Pet M&amp;M
            </h1>
            <p className="text-white/85 text-xs sm:text-sm mt-2 max-w-2xl font-light leading-relaxed">
              Quy tụ hơn {team.length > 0 ? team.length : 12}+ chuyên gia, bác sĩ thú y và điều dưỡng tốt nghiệp chính quy, luôn bảo vệ sinh mệnh các bé cưng bằng trái tim và y đức cao nhất.
            </p>
          </div>
        </div>
      </div>

      {/* 2. BREADCRUMBS & THANH LỌC NHANH HẠNG MỤC */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <ol className="flex items-center gap-1.5 text-xs sm:text-sm flex-wrap">
            <li>
              <Link href="/" className="text-slate-500 hover:text-[#2D5A27] transition font-medium flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Trang chủ</span>
              </Link>
            </li>
            <li className="text-slate-300 select-none">›</li>
            <li>
              <Link href="/#about" className="text-slate-500 hover:text-[#2D5A27] transition font-medium">
                Về Pet M&amp;M
              </Link>
            </li>
            <li className="text-slate-300 select-none">›</li>
            <li>
              <span className="text-[#2D5A27] font-bold">Đội ngũ y tế</span>
            </li>
          </ol>

          {/* Quick jump anchor pills (Ẩn pill nếu hạng mục không có ai) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            {lanhDaoList.length > 0 && (
              <a
                href="#lanh-dao"
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-[#2D5A27] hover:text-white transition text-slate-700 whitespace-nowrap font-medium"
              >
                Lãnh đạo chuyên môn ({lanhDaoList.length})
              </a>
            )}
            {chuyenGiaList.length > 0 && (
              <a
                href="#chuyen-gia"
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-[#2D5A27] hover:text-white transition text-slate-700 whitespace-nowrap font-medium"
              >
                Chuyên gia tư vấn ({chuyenGiaList.length})
              </a>
            )}
            {bacSiList.length > 0 && (
              <a
                href="#bac-si"
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-[#2D5A27] hover:text-white transition text-slate-700 whitespace-nowrap font-medium"
              >
                Bác sĩ thú y ({bacSiList.length})
              </a>
            )}
            {dieuDuongList.length > 0 && (
              <a
                href="#dieu-duong"
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-[#2D5A27] hover:text-white transition text-slate-700 whitespace-nowrap font-medium"
              >
                Điều dưỡng &amp; Chăm sóc ({dieuDuongList.length})
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* 3. MAIN CONTENT: 4 HẠNG MỤC THEO ĐÚNG HÌNH ẢNH MẪU */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI (8 CỘT): DANH SÁCH 4 HẠNG MỤC */}
          <div className="lg:col-span-8 space-y-12">
            {/* HẠNG MỤC 1: ĐỘI NGŨ LÃNH ĐẠO CHUYÊN MÔN */}
            <CategorySwipeSection
              id="lanh-dao"
              title="Đội ngũ Lãnh đạo chuyên môn"
              items={lanhDaoList}
            />

            {/* HẠNG MỤC 2: ĐỘI NGŨ CHUYÊN GIA TƯ VẤN */}
            <CategorySwipeSection
              id="chuyen-gia"
              title="Đội ngũ Chuyên gia Tư vấn"
              items={chuyenGiaList}
              isTwoColumnDesktop
            />

            {/* HẠNG MỤC 3: ĐỘI NGŨ BÁC SĨ THÚ Y */}
            <CategorySwipeSection
              id="bac-si"
              title="Đội ngũ Bác sĩ Thú y"
              items={bacSiList}
            />

            {/* HẠNG MỤC 4: ĐỘI NGŨ ĐIỀU DƯỠNG & CHĂM SÓC */}
            <CategorySwipeSection
              id="dieu-duong"
              title="Đội ngũ Điều dưỡng & Chăm sóc"
              items={dieuDuongList}
            />
          </div>

          {/* CỘT PHẢI (4 CỘT): SIDEBAR TƯ VẤN & ĐẶT LỊCH HẸN BÁC SĨ */}
          <div className="lg:col-span-4 space-y-6">
            <ConsultationSidebar branchName="Hội Đồng Y Khoa Pet M&M" />
          </div>
        </div>
      </div>

      {/* 4. FOOTER & WIDGETS */}
      <Footer />
      <FloatingContactWidgets />
      <ScrollNavigationButtons />
    </div>
  );
}
