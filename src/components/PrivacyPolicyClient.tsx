'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PrivacyPolicyConfig } from '@/types/privacyPolicy';
import { useLanguage } from '@/context/LanguageContext';
import { sanitizeHtml } from '@/lib/sanitize';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingContactWidgets from '@/components/FloatingContactWidgets';
import ScrollNavigationButtons from '@/components/ScrollNavigationButtons';

interface Props {
  initialData: PrivacyPolicyConfig;
}

export default function PrivacyPolicyClient({ initialData }: Props) {
  const [data, setData] = useState<PrivacyPolicyConfig>(initialData);
  // Đồng bộ ngôn ngữ trực tiếp theo nút chuyển đổi ngôn ngữ của toàn trang web (Header/Footer)
  const { language } = useLanguage();
  const isEn = language === 'en';

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const { data: row } = await supabase
          .from('chinh_sach_bao_mat')
          .select('*')
          .eq('id', 'main')
          .maybeSingle();
        if (row) {
          setData({
            titleVi: row.tieu_de_vi || initialData.titleVi,
            titleEn: row.tieu_de_en || initialData.titleEn,
            contentVi: row.noi_dung_vi || initialData.contentVi,
            contentEn: row.noi_dung_en || initialData.contentEn,
            lastUpdated: row.ngay_cap_nhat || initialData.lastUpdated,
            isActive: row.kich_hoat !== false,
          });
        }
      } catch {}
    };

    const handleFocus = () => { fetchPolicy(); };
    window.addEventListener('focus', handleFocus);

    const channel = supabase
      .channel('realtime_chinh_sach_bao_mat_detail')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chinh_sach_bao_mat' }, fetchPolicy)
      .subscribe();

    return () => {
      window.removeEventListener('focus', handleFocus);
      supabase.removeChannel(channel);
    };
  }, [initialData]);

  const handleOpenBookingModal = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/#booking';
    }
  };

  const title = (isEn && data.titleEn) ? data.titleEn : data.titleVi;
  const rawContent = (isEn && data.contentEn) ? data.contentEn : data.contentVi;
  const cleanHtml = sanitizeHtml(rawContent);

  // Tự động cập nhật tiêu đề tab trình duyệt theo ngôn ngữ đang chọn
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const targetTitle = `${title || (isEn ? 'Privacy Policy' : 'Chính Sách Bảo Mật')} | PetM&M`;
    document.title = targetTitle;
  }, [isEn, title]);

  // Hàm hiển thị tiêu đề với chữ & chuẩn đẹp, thanh thoát, không màu mè uốn lượn
  const renderCleanTitle = (text: string) => {
    if (!text) return '';
    const parts = text.split(/(&)/g);
    return parts.map((part, index) => {
      if (part === '&') {
        return (
          <span key={index} className="font-sans font-medium text-slate-700 inline-block px-1 select-text">
            &amp;
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF7] text-slate-900 selection:bg-[#FFB800] selection:text-slate-900 pt-[60px] sm:pt-[68px]">
      {/* 1. Header luôn hiển thị */}
      <Header onOpenBookingModal={handleOpenBookingModal} alwaysVisible />

      {/* 2. Thanh chuyển Breadcrumbs trên đầu có dạng chuẩn giống các view con khác (Ảnh 4) */}
      <div className="sticky top-[60px] sm:top-[68px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs transition-all">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs text-slate-500">
          <nav className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap py-0.5">
            <Link
              href="/"
              className="hover:text-[#2D5A27] transition font-medium flex items-center gap-1 text-slate-600"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isEn ? 'Home' : 'Trang chủ'}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-800 font-semibold truncate max-w-[280px] sm:max-w-xl">
              {title}
            </span>
          </nav>
        </div>
      </div>

      {/* 3. Khung Nội Dung Văn Bản Chính */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        <article className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-10 lg:p-12">
          {/* Tiêu đề & Ngày hiệu lực */}
          <div className="mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-slate-100">
            <h1 className="font-sans text-xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-snug mb-3">
              {renderCleanTitle(title)}
            </h1>

            {data.lastUpdated && (
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>
                  {isEn ? 'Effective date: ' : 'Ngày hiệu lực / Cập nhật: '}
                  <strong className="text-slate-700 font-mono font-semibold">{data.lastUpdated}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Render nội dung HTML từ trình soạn thảo RichTextEditor */}
          <div
            className="rich-text-preview prose prose-slate prose-sm sm:prose-base max-w-none text-slate-700 leading-relaxed text-[13.5px] sm:text-base
              [&_h2]:text-[17px] [&_h2]:sm:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-6 [&_h2]:sm:mt-8 [&_h2]:mb-2.5 [&_h2]:sm:mb-3 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-slate-100
              [&_h3]:text-[15px] [&_h3]:sm:text-lg [&_h3]:font-bold [&_h3]:text-slate-800 [&_h3]:mt-5 [&_h3]:sm:mt-6 [&_h3]:mb-2
              [&_p]:text-[13.5px] [&_p]:sm:text-base [&_p]:text-slate-600 [&_p]:leading-relaxed [&_p]:mb-3.5 [&_p]:sm:mb-4
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:mb-3.5 [&_ul]:sm:mb-4 [&_ul]:text-slate-600
              [&_li]:text-[13.5px] [&_li]:sm:text-base [&_li]:text-slate-600 [&_li]:leading-relaxed
              [&_strong]:text-slate-900 [&_strong]:font-bold
              [&_a]:text-[#2D5A27] [&_a]:underline hover:[&_a]:text-emerald-800"
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
          />
        </article>
      </main>

      {/* 4. Footer & Widgets */}
      <Footer />
      <FloatingContactWidgets />
      <ScrollNavigationButtons />
    </div>
  );
}
