'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
} from 'lucide-react';
import { supabase, TuyenDungRecord } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import PetMMBrand from '@/components/PetMMBrand';
import ScrollRevealTitle from '@/components/ScrollRevealTitle';
import { getAssetUrl } from '@/lib/assets';

// Dữ liệu dự phòng nếu chưa có mạng hoặc đang tải
const FALLBACK_JOBS: TuyenDungRecord[] = [
  {
    id: 'bac-si-thu-y-dieu-tri',
    tieu_de: 'Bác Sĩ Thú Y Khám Lâm Sàng & Phẫu Thuật',
    tieu_de_en: 'Veterinary Clinical Care & Surgical Specialist',
    phong_ban: 'Y Khoa & Điều Trị',
    phong_ban_en: 'Medical & Clinical Care',
    dia_diem: 'Trụ sở TP. Thủ Đức, TP. Hồ Chí Minh',
    dia_diem_en: 'Thu Duc City Headquarters, Ho Chi Minh City',
    hinh_thuc: 'Toàn thời gian',
    hinh_thuc_en: 'Full-time',
    muc_luong: '20 – 35 Triệu / Tháng',
    muc_luong_en: '20 – 35 Million VND / Month',
    kinh_nghiem: 'Tối thiểu 2 năm kinh nghiệm',
    kinh_nghiem_en: 'Minimum 2 years experience',
    so_luong: 2,
    han_nop: '30/11/2026',
    mo_ta: 'Thăm khám, chẩn đoán, phẫu thuật và điều trị nội trú chuẩn Fear-Free.',
    mo_ta_en: 'Examination, diagnostics, surgery, and inpatient treatment under Fear-Free standards.',
    hinh_anh: '/about_consultation.jpg',
    thu_tu: 1,
    kich_hoat: true,
  },
  {
    id: 'ky-thuat-vien-spa-grooming',
    tieu_de: 'Kỹ Thuật Viên Spa Grooming & Cắt Tỉa Tạo Kiểu 5 Sao',
    tieu_de_en: '5-Star Pet Spa Stylist & Groomer',
    phong_ban: 'Chăm Sóc & Spa',
    phong_ban_en: 'Grooming & Pet Resort',
    dia_diem: 'Trụ sở TP. Thủ Đức, TP. Hồ Chí Minh',
    dia_diem_en: 'Thu Duc City Headquarters, Ho Chi Minh City',
    hinh_thuc: 'Toàn thời gian',
    hinh_thuc_en: 'Full-time',
    muc_luong: '12 – 22 Triệu / Tháng',
    muc_luong_en: '12 – 22 Million VND / Month',
    kinh_nghiem: 'Từ 1 năm kinh nghiệm',
    kinh_nghiem_en: '1+ years experience',
    so_luong: 3,
    han_nop: '30/11/2026',
    mo_ta: 'Tắm thảo mộc, bồn sục ozone, cắt tỉa thẩm mỹ chuẩn giống không gây stress.',
    mo_ta_en: 'Herbal hydrotherapy, ozone spa, aesthetic breed-standard styling without stress.',
    hinh_anh: '/about_grooming.jpg',
    thu_tu: 2,
    kich_hoat: true,
  },
  {
    id: 'dieu-duong-thu-y-noi-tru',
    tieu_de: 'Điều Dưỡng Thú Y & Chăm Sóc Hồi Sức Nội Trú',
    tieu_de_en: 'Veterinary Nurse & Inpatient ICU Care',
    phong_ban: 'Điều Dưỡng & Nội Trú',
    phong_ban_en: 'Veterinary Nursing & ICU',
    dia_diem: 'Trụ sở TP. Thủ Đức, TP. Hồ Chí Minh',
    dia_diem_en: 'Thu Duc City Headquarters, Ho Chi Minh City',
    hinh_thuc: 'Theo ca / Toàn thời gian',
    hinh_thuc_en: 'Shift-based / Full-time',
    muc_luong: '9 – 15 Triệu / Tháng',
    muc_luong_en: '9 – 15 Million VND / Month',
    kinh_nghiem: 'Ưu tiên có kinh nghiệm',
    kinh_nghiem_en: 'Experience preferred',
    so_luong: 2,
    han_nop: '30/11/2026',
    mo_ta: 'Theo dõi chỉ số sinh tồn, hỗ trợ bác sĩ trong ca mổ và chăm sóc nội trú 24/7.',
    mo_ta_en: 'Monitor vital signs, assist in surgeries, and deliver 24/7 ICU recovery care.',
    hinh_anh: '/about_hospital.jpg',
    thu_tu: 3,
    kich_hoat: true,
  },
];

export default function CareersSection() {
  const { language, isEn } = useLanguage();
  const [jobs, setJobs] = useState<TuyenDungRecord[]>(FALLBACK_JOBS);
  const [loading, setLoading] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tuyen_dung')
        .select('*')
        .eq('kich_hoat', true)
        .order('thu_tu', { ascending: true })
        .limit(3);

      if (!error && data && data.length > 0) {
        setJobs(data as TuyenDungRecord[]);
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách tuyển dụng trang chủ:', err);
    } finally {
      setLoading(false);
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

  return (
    <section id="careers" className="relative py-20 sm:py-28 text-slate-900 overflow-hidden bg-white border-t border-slate-200/80">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,90,39,0.03),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header chuẩn typography font-editorial & hiệu ứng xuất hiện */}
        <ScrollRevealTitle className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#2D5A27] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Briefcase className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>{isEn ? 'CAREERS & OPPORTUNITIES' : 'CƠ HỘI NGHỀ NGHIỆP'}</span>
          </div>

          <h2 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-slate-900 mb-4 leading-tight">
            {isEn ? 'Join The ' : 'Gia Nhập Đại Gia Đình '}
            <br className="hidden sm:inline" />
            <span className="italic font-light text-[#2D5A27]">
              <PetMMBrand />
            </span>
          </h2>

          <p className="mt-3.5 text-sm sm:text-base text-slate-600 leading-relaxed font-light">
            {isEn
              ? 'Build a rewarding career in an internationally certified Fear-Free hospital environment with leading medical technology, high respect, and continuous career growth.'
              : 'Kiến tạo sự nghiệp vững chắc trong môi trường bệnh viện thú y chuẩn Fear-Free 5 sao quốc tế — nơi y đức, sự tận tâm và tình yêu động vật luôn được tôn vinh xứng tầm.'}
          </p>
        </ScrollRevealTitle>

        {/* 3 Core Working Values Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#F8FAF7] border border-emerald-950/10 hover:border-emerald-500/30 transition shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {isEn ? 'Fear-Free 5-Star Standard' : 'Chuẩn Lâm Sàng Fear-Free'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {isEn
                  ? 'A gentle, stress-free clinical environment for both pets and the veterinary team.'
                  : 'Không gian y tế an yên, hạn chế tối đa căng thẳng cho cả thú cưng và đội ngũ nhân sự.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#F8FAF7] border border-emerald-950/10 hover:border-emerald-500/30 transition shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {isEn ? 'Continuous Training' : 'Đào Tạo & Thăng Tiến'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {isEn
                  ? 'Sponsorship for advanced clinical seminars, surgery workshops, and international certificates.'
                  : 'Tài trợ 100% các khóa đào tạo nâng cao chuyên môn, hội thảo ngoại khoa và chứng chỉ quốc tế.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#F8FAF7] border border-emerald-950/10 hover:border-emerald-500/30 transition shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-blue-100/80 text-blue-800 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {isEn ? 'VIP Care Package' : 'Đãi Ngộ & Phúc Lợi VIP'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {isEn
                  ? 'Attractive compensation, performance surgery bonuses, and free care for staff pets.'
                  : 'Lương thưởng minh bạch, thưởng ca mổ, bảo hiểm sức khỏe và chăm sóc thú cưng riêng miễn phí.'}
              </p>
            </div>
          </div>
        </div>

        {/* Featured Job Openings Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
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
                className="group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-600/40 transition-all duration-300 p-6 sm:p-7 overflow-hidden"
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
