'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  ChevronRight,
  Search,
  Filter,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  Award,
  PhoneCall,
  Mail,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Users,
} from 'lucide-react';
import { TuyenDungRecord } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { useSystemConfig } from '@/context/SystemConfigContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingContactWidgets from '@/components/FloatingContactWidgets';
import ScrollNavigationButtons from '@/components/ScrollNavigationButtons';

interface Props {
  initialJobs: TuyenDungRecord[];
}

export default function TuyenDungListClient({ initialJobs }: Props) {
  const { language, isEn } = useLanguage();
  const { config } = useSystemConfig();
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const hotlineRaw = (config.hotline || '0903 599 339').replace(/\s+/g, '');
  const hotlineDisplay = config.hotline_hien_thi || config.hotline || '0903 599 339';
  const zaloUrl = config.link_zalo || 'https://zalo.me/0903599339';
  const emailContact = config.email || 'tuyendung@petmm.vn';

  // Trích xuất danh sách phòng ban động từ chính các vị trí đang tuyển dụng thực tế (loại bỏ trùng lặp)
  const departments = useMemo(() => {
    const list: { id: string; labelVi: string; labelEn: string }[] = [];
    const seen = new Set<string>();

    initialJobs.forEach((job) => {
      const deptVi = (job.phong_ban || '').trim();
      const deptEn = (job.phong_ban_en || '').trim() || deptVi;
      if (deptVi && !seen.has(deptVi.toLowerCase())) {
        seen.add(deptVi.toLowerCase());
        list.push({
          id: deptVi.toLowerCase(),
          labelVi: deptVi,
          labelEn: deptEn,
        });
      }
    });

    if (list.length > 0) {
      return [
        { id: 'all', labelVi: 'Tất cả vị trí', labelEn: 'All Positions' },
        ...list,
      ];
    }
    return [{ id: 'all', labelVi: 'Tất cả vị trí', labelEn: 'All Positions' }];
  }, [initialJobs]);

  // Nếu bộ lọc phòng ban đang chọn không còn trong danh sách vị trí đang tuyển thì đưa về 'all'
  useEffect(() => {
    if (selectedDept !== 'all' && !departments.some((d) => d.id === selectedDept)) {
      setSelectedDept('all');
    }
  }, [departments, selectedDept]);

  // Lọc danh sách công việc
  const filteredJobs = useMemo(() => {
    return initialJobs.filter((job) => {
      // Lọc phòng ban theo phòng ban thực tế
      if (selectedDept !== 'all') {
        const deptVi = (job.phong_ban || '').trim().toLowerCase();
        const deptEn = (job.phong_ban_en || '').trim().toLowerCase();
        const target = selectedDept.toLowerCase();
        if (deptVi !== target && deptEn !== target && !deptVi.includes(target)) {
          return false;
        }
      }

      // Lọc theo từ khóa tìm kiếm
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase();
        const titleVi = (job.tieu_de || '').toLowerCase();
        const titleEn = (job.tieu_de_en || '').toLowerCase();
        const descVi = (job.mo_ta || '').toLowerCase();
        const descEn = (job.mo_ta_en || '').toLowerCase();
        const reqVi = (job.yeu_cau || '').toLowerCase();
        const reqEn = (job.yeu_cau_en || '').toLowerCase();
        return (
          titleVi.includes(q) ||
          titleEn.includes(q) ||
          descVi.includes(q) ||
          descEn.includes(q) ||
          reqVi.includes(q) ||
          reqEn.includes(q)
        );
      }

      return true;
    });
  }, [initialJobs, selectedDept, searchKeyword]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF7] text-slate-900 selection:bg-[#FFB800] selection:text-slate-900">
      {/* 1. Header luôn hiển thị */}
      <Header alwaysVisible />

      <main className="flex-1 pt-[64px] sm:pt-[72px]">
        {/* 2. Search & Filter Bar - Chỉ hiển thị khi có việc đang tuyển */}
        {initialJobs.length > 0 && (
          <div className="sticky top-[64px] sm:top-[72px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Department Tabs - Chỉ hiển thị các phòng ban thực tế đang có tuyển dụng */}
                {departments.length > 1 ? (
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                    {departments.map((dept) => {
                      const isActive = selectedDept === dept.id;
                      return (
                        <button
                          key={dept.id}
                          onClick={() => setSelectedDept(dept.id)}
                          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                            isActive
                              ? 'bg-[#2D5A27] text-white shadow-sm'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                          }`}
                        >
                          {isEn ? dept.labelEn : dept.labelVi}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div />
                )}

                {/* Keyword Search Input */}
                <div className="relative w-full md:w-72 shrink-0">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    aria-label={isEn ? 'Search position, skills' : 'Tìm kiếm vị trí, kỹ năng'}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2D5A27] focus:bg-white transition"
                  />
                  {searchKeyword && (
                    <button
                      onClick={() => setSearchKeyword('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Jobs List Section */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {isEn ? 'Active Openings' : 'Các Vị Trí Đang Tuyển Dụng'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {initialJobs.length === 0
                    ? (isEn ? 'No positions available' : 'Chưa có vị trí tuyển dụng')
                    : isEn
                      ? `Showing ${filteredJobs.length} opening(s)`
                      : `Hiện có ${filteredJobs.length} vị trí đang tìm kiếm nhân tài`}
                </p>
              </div>

              {selectedDept !== 'all' && (
                <button
                  onClick={() => {
                    setSelectedDept('all');
                    setSearchKeyword('');
                  }}
                  className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold underline"
                >
                  {isEn ? 'Reset filters' : 'Xóa bộ lọc'}
                </button>
              )}
            </div>

            {initialJobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8 max-w-xl mx-auto shadow-xs">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700">
                  {isEn ? 'No job openings at this time' : 'Hiện tại chưa có vị trí tuyển dụng mới'}
                </h3>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700">
                  {isEn ? 'No openings found matching your criteria' : 'Không tìm thấy vị trí phù hợp với tiêu chí'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {isEn
                    ? 'Try different search keywords or view all positions. You can also submit an open application directly.'
                    : 'Hãy thử tìm kiếm với từ khóa khác hoặc bấm xem tất cả vị trí. Bạn cũng có thể gửi CV mở đến ban nhân sự.'}
                </p>
                <button
                  onClick={() => {
                    setSelectedDept('all');
                    setSearchKeyword('');
                  }}
                  className="mt-4 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow transition"
                >
                  {isEn ? 'View All Positions' : 'Xem Tất Cả Vị Trí'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
                {filteredJobs.map((job) => {
                  const title = (isEn && job.tieu_de_en) ? job.tieu_de_en : job.tieu_de;
                  const dept = (isEn && job.phong_ban_en) ? job.phong_ban_en : (job.phong_ban || 'Y Khoa & Điều Trị');
                  const salary = (isEn && job.muc_luong_en) ? job.muc_luong_en : (job.muc_luong || 'Thỏa thuận');
                  const location = (isEn && job.dia_diem_en) ? job.dia_diem_en : (job.dia_diem || 'TP. Thủ Đức, TP.HCM');
                  const workType = (isEn && job.hinh_thuc_en) ? job.hinh_thuc_en : (job.hinh_thuc || 'Toàn thời gian');
                  const exp = (isEn && job.kinh_nghiem_en) ? job.kinh_nghiem_en : (job.kinh_nghiem || 'Có kinh nghiệm');
                  const desc = (isEn && job.mo_ta_en) ? job.mo_ta_en : (job.mo_ta || '');
                  // Strip HTML tag for snippet preview
                  const cleanDesc = desc.replace(/<[^>]*>?/gm, '').slice(0, 140) + '...';

                  return (
                    <div
                      key={job.id}
                      className="group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-600/40 transition-all duration-300 p-6 sm:p-7 overflow-hidden"
                    >
                      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-600 via-[#2D5A27] to-amber-500 opacity-80 group-hover:h-2 transition-all" />

                      <div>
                        {/* Header metadata badges */}
                        <div className="flex items-center justify-between gap-2 mb-3.5">
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 uppercase tracking-wider">
                            {dept}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {workType}
                          </span>
                        </div>

                        {/* Title */}
                        <Link href={`/tuyen-dung/${job.id}`}>
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#2D5A27] transition-colors leading-snug line-clamp-2">
                            {title}
                          </h3>
                        </Link>

                        {/* Salary Badge */}
                        <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50/90 border border-amber-200/80 text-amber-900 font-bold text-xs sm:text-sm">
                          <DollarSign className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{salary}</span>
                        </div>

                        {/* Summary description preview */}
                        {desc && (
                          <p className="mt-3.5 text-xs text-slate-500 leading-relaxed line-clamp-3">
                            {cleanDesc}
                          </p>
                        )}

                        {/* Key Info Details */}
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
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
                            <div className="flex items-center gap-2 text-slate-500">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>
                                {isEn ? 'Deadline: ' : 'Hạn nộp: '}
                                <strong className="text-rose-600 font-medium">{job.han_nop}</strong>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Action buttons */}
                      <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                        <Link
                          href={`/tuyen-dung/${job.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition group-hover:translate-x-1 duration-200"
                        >
                          <span>{isEn ? 'View Job Details' : 'Xem Chi Tiết'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          href={`/tuyen-dung/${job.id}#apply`}
                          className="px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#1E3F1A] text-white text-xs font-semibold shadow-xs hover:shadow transition"
                        >
                          {isEn ? 'Apply Now' : 'Ứng Tuyển'}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer & Widgets */}
      <Footer />
      <FloatingContactWidgets />
      <ScrollNavigationButtons />
    </div>
  );
}
