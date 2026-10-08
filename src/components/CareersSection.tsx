'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { supabase, TuyenDungRecord } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { useSystemConfig } from '@/context/SystemConfigContext';
import { sanitizeHtml } from '@/lib/sanitize';
import PetMMBrand from '@/components/PetMMBrand';
import ScrollRevealTitle from '@/components/ScrollRevealTitle';
import { getAssetUrl } from '@/lib/assets';

export default function CareersSection() {
  const { language, isEn } = useLanguage();
  const { config } = useSystemConfig();
  const [jobs, setJobs] = useState<TuyenDungRecord[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Lấy tiêu đề & mô tả cấu hình phong cách Rich Text Editor
  const rawTitleHtml = isEn
    ? (config.section_tuyen_dung_tieu_de_en || config.section_tuyen_dung_tieu_de)
    : config.section_tuyen_dung_tieu_de;
  const rawDescHtml = isEn
    ? (config.section_tuyen_dung_mo_ta_en || config.section_tuyen_dung_mo_ta)
    : config.section_tuyen_dung_mo_ta;
  const titleHtml = rawTitleHtml ? sanitizeHtml(rawTitleHtml) : '';
  const descHtml = rawDescHtml ? sanitizeHtml(rawDescHtml) : '';

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = Math.min(el.clientWidth * 0.85, 380);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 350);
  };

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tuyen_dung')
        .select('*')
        .eq('kich_hoat', true)
        .order('thu_tu', { ascending: true })
        .limit(12);

      if (!error && data) {
        setJobs(data as TuyenDungRecord[]);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách tuyển dụng trang chủ:', err);
      setJobs([]);
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchJobs();

    const channel = supabase
      .channel('tuyen_dung_changes_home')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tuyen_dung' },
        () => {
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchJobs]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    checkScroll();
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, jobs]);

  // Nếu chưa tải xong hoặc không có vị trí nào đang mở tuyển dụng (tất cả bị xóa hoặc ẩn)
  if (!hasLoaded || jobs.length === 0) {
    return null;
  }

  return (
    <section id="careers" className="relative py-20 sm:py-28 text-slate-900 overflow-hidden bg-white border-t border-slate-200/80">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,90,39,0.03),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header chuẩn typography font-editorial & hiệu ứng xuất hiện */}
        <ScrollRevealTitle className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          {titleHtml ? (
            <div
              className="rich-text-preview font-editorial text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-slate-900 leading-tight [&_p]:m-0 [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_h2]:font-editorial [&_h2]:text-3xl [&_h2]:sm:text-5xl [&_h2]:lg:text-6xl [&_h2]:font-normal [&_h2]:tracking-tight [&_h2]:leading-tight"
              dangerouslySetInnerHTML={{ __html: titleHtml }}
            />
          ) : (
            <h2 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-slate-900 leading-tight">
              {isEn ? 'Join The ' : 'Gia Nhập Đại Gia Đình '}
              <br className="hidden sm:inline" />
              <span className="italic font-light text-[#2D5A27]">
                <PetMMBrand />
              </span>
            </h2>
          )}

          {descHtml && (
            <div
              className="mt-4 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-light leading-relaxed rich-text-preview"
              dangerouslySetInnerHTML={{ __html: descHtml }}
            />
          )}
        </ScrollRevealTitle>

        {/* Danh sách thẻ vị trí tuyển dụng trượt ngang (Horizontal Slider) */}
        <div className="relative group/careers-slider">
          {/* Nút ◁ ở giữa bên trái (ẩn trên điện thoại, chỉ hiện trên laptop/desktop khi có thể cuộn) */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label={isEn ? "Previous jobs" : "Xem vị trí trước"}
              className="hidden sm:flex absolute -left-2 sm:-left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-20
                         w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl
                         items-center justify-center text-[#2D5A27] hover:bg-[#2D5A27] hover:text-white hover:border-[#2D5A27]
                         hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Nút ▷ ở giữa bên phải (ẩn trên điện thoại, chỉ hiện trên laptop/desktop khi có thể cuộn) */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label={isEn ? "Next jobs" : "Xem vị trí tiếp theo"}
              className="hidden sm:flex absolute -right-2 sm:-right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-20
                         w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl
                         items-center justify-center text-[#2D5A27] hover:bg-[#2D5A27] hover:text-white hover:border-[#2D5A27]
                         hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Container các thẻ việc làm xếp hàng ngang lướt chạm */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-5 sm:gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pb-5 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {jobs.map((job) => {
              const title = (isEn && job.tieu_de_en) ? job.tieu_de_en : job.tieu_de;
              const dept = (isEn && job.phong_ban_en) ? job.phong_ban_en : (job.phong_ban || 'Y Khoa & Điều Trị');
              const salary = (isEn && job.muc_luong_en) ? job.muc_luong_en : (job.muc_luong || 'Thỏa thuận');
              const location = (isEn && job.dia_diem_en) ? job.dia_diem_en : (job.dia_diem || 'TP. Thủ Đức, TP.HCM');
              const workType = (isEn && job.hinh_thuc_en) ? job.hinh_thuc_en : (job.hinh_thuc || 'Toàn thời gian');
              const exp = (isEn && job.kinh_nghiem_en) ? job.kinh_nghiem_en : (job.kinh_nghiem || 'Có kinh nghiệm');

              return (
                <div
                  key={job.id}
                  className="group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-600/40 transition-all duration-300 p-6 sm:p-7 overflow-hidden shrink-0 snap-start
                             w-[84vw] sm:w-[350px] md:w-[370px] lg:w-[380px]"
                >
                  {/* Accent top gradient stripe */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-600 via-[#2D5A27] to-amber-500 opacity-80 group-hover:h-2 transition-all" />

                  <div>
                    {/* Department & Work Type Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 uppercase tracking-wider">
                        {dept}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {workType}
                      </span>
                    </div>

                    {/* Job Title */}
                    <Link href={`/tuyen-dung/${job.id}`}>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#2D5A27] transition-colors leading-snug line-clamp-2">
                        {title}
                      </h3>
                    </Link>

                    {/* Salary Highlight Badge */}
                    <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-amber-900 font-bold text-xs sm:text-sm">
                      <DollarSign className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{salary}</span>
                    </div>

                    {/* Details metadata */}
                    <div className="mt-4 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {isEn ? 'Experience: ' : 'Kinh nghiệm: '}
                          <strong>{exp}</strong>
                        </span>
                      </div>
                      {job.han_nop && (
                        <div className="text-[11px] text-slate-400 italic">
                          {isEn ? 'Deadline: ' : 'Hạn nộp: '}
                          {job.han_nop}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link
                      href={`/tuyen-dung/${job.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition group-hover:translate-x-1 duration-200"
                    >
                      <span>{isEn ? 'View Details' : 'Xem Chi Tiết'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href={`/tuyen-dung/${job.id}#apply`}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs hover:shadow transition"
                    >
                      {isEn ? 'Apply Now' : 'Ứng Tuyển'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nút xem tất cả vị trí căn giữa thanh lịch (đã bỏ thanh tối theo yêu cầu ảnh 2) */}
        <div className="mt-12 sm:mt-14 text-center">
          <Link
            href="/tuyen-dung"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-[#2D5A27] hover:bg-[#1E3F1A] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>{isEn ? 'View All Career Openings' : 'Xem Tất Cả Vị Trí Tuyển Dụng'}</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </Link>
        </div>
      </div>
    </section>
  );
}
