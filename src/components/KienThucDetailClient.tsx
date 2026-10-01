'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  User,
  ChevronRight,
  BookOpen,
  Sparkles,
  CalendarCheck,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { BaiVietRecord } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { getAssetUrl } from '@/lib/assets';
import ArticleContent from '@/components/ArticleContent';
import ConsultationSidebar from '@/components/ConsultationSidebar';
import BranchFaqSidebar, { SupportPanel } from '@/components/BranchFaqSidebar';
import Footer from '@/components/Footer';
import FloatingContactWidgets from '@/components/FloatingContactWidgets';
import ScrollNavigationButtons from '@/components/ScrollNavigationButtons';
import Header from '@/components/Header';

interface Props {
  article: BaiVietRecord;
  relatedArticles: BaiVietRecord[];
}

export default function KienThucDetailClient({ article, relatedArticles }: Props) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const handleOpenBookingModal = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/#booking';
    }
  };

  const title = (isEn && article.tieu_de_en) ? article.tieu_de_en : article.tieu_de;
  const category = (isEn && article.chuyen_muc_en)
    ? article.chuyen_muc_en
    : (article.chuyen_muc || (isEn ? 'Preventive Medicine' : 'Y Khoa Dự Phòng'));
  const summary = (isEn && article.mo_ta_ngan_en) ? article.mo_ta_ngan_en : article.mo_ta_ngan;
  const author = (isEn && article.tac_gia_en)
    ? article.tac_gia_en
    : (article.tac_gia || (isEn ? 'Pet M&M Veterinary Medical Board' : 'Hội Đồng Y Khoa Bệnh Viện Thú Y Pet M&M'));
  const readTime = (isEn && article.thoi_gian_doc_en) ? article.thoi_gian_doc_en : article.thoi_gian_doc;
  const heroImg = article.hinh_anh || '/about_consultation.jpg';

  // Cập nhật tab title theo tiêu đề bài viết và ngôn ngữ
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentTitle = (isEn && article.tieu_de_en) ? article.tieu_de_en : article.tieu_de;
    const targetTitle = `${currentTitle || (isEn ? 'Pet Care Article' : 'Cẩm Nang Kiến Thức')} | Pet M&M`;
    const apply = () => {
      if (document.title !== targetTitle) {
        document.title = targetTitle;
      }
    };
    apply();
    const timers = [setTimeout(apply, 100), setTimeout(apply, 400), setTimeout(apply, 1000)];
    return () => timers.forEach(clearTimeout);
  }, [isEn, article.tieu_de, article.tieu_de_en]);

  // Legacy Markdown renderer fallback nếu không phải HTML
  const isHtmlContent = (content?: string | null) => {
    if (!content) return false;
    return content.trimStart().startsWith('<');
  };

  const parseInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-slate-900 font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderFormattedContent = (content?: string | null) => {
    if (!content) return null;
    const sections = content.split('\n\n').filter(Boolean);

    return sections.map((sec, idx) => {
      const trimmed = sec.trim();
      if (trimmed.startsWith('### ')) {
        return (
          <h3
            key={idx}
            className="text-lg sm:text-xl font-bold text-[#2D5A27] mt-6 sm:mt-8 mb-3 flex items-center gap-2"
          >
            <span className="w-1.5 h-5 rounded-full bg-[#2D5A27] inline-block shrink-0" />
            <span>{trimmed.replace(/^###\s+/, '')}</span>
          </h3>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2
            key={idx}
            className="text-xl sm:text-2xl font-bold text-[#2D5A27] mt-8 sm:mt-10 mb-4 pb-2 border-b border-emerald-100"
          >
            {trimmed.replace(/^##\s+/, '')}
          </h2>
        );
      }
      if (trimmed.startsWith('> ')) {
        return (
          <div
            key={idx}
            className="my-5 p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border-l-4 border-[#2D5A27] text-slate-700 text-xs sm:text-sm leading-relaxed italic shadow-xs"
          >
            {parseInlineMarkdown(trimmed.replace(/^>\s+/, ''))}
          </div>
        );
      }
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
        const lines = trimmed.split('\n').filter(Boolean);
        return (
          <ul key={idx} className="my-3 space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed pl-1">
            {lines.map((line, lIdx) => {
              const cleanLine = line.replace(/^[\*\-]\s+/, '').replace(/^\d+\.\s+/, '');
              return (
                <li key={lIdx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />
                  <div>{parseInlineMarkdown(cleanLine)}</div>
                </li>
              );
            })}
          </ul>
        );
      }
      return (
        <p key={idx} className="text-xs sm:text-base text-slate-700 leading-relaxed mb-4 font-normal">
          {parseInlineMarkdown(trimmed)}
        </p>
      );
    });
  };

  const rawActiveContent = (isEn && article.noi_dung_en) ? article.noi_dung_en : article.noi_dung;

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-slate-900 pt-[60px] sm:pt-[68px]">
      {/* ── 0. LUXURY MAIN NAVBAR (Cố định trên cùng khi cuộn) ── */}
      <Header onOpenBookingModal={handleOpenBookingModal} alwaysVisible />

      {/* ── 1. HERO BANNER (Full-width với hình ảnh y khoa & overlay mượt mà) ── */}
      <div className="relative w-full h-64 sm:h-80 md:h-[420px] overflow-hidden bg-slate-900">
        <img
          src={getAssetUrl(heroImg)}
          alt={title}
          className="w-full h-full object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />

        <div className="absolute bottom-0 inset-x-0 pb-6 sm:pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full bg-emerald-600/90 text-white backdrop-blur-md shadow-sm">
                <Sparkles className="w-3 h-3 text-[#FFB800]" />
                {category}
              </span>
              {readTime && (
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium px-2.5 py-1 rounded-full bg-black/40 text-white/90 backdrop-blur-md">
                  <Clock className="w-3 h-3" />
                  {readTime}
                </span>
              )}
            </div>

            <h1 className="font-editorial text-2xl sm:text-4xl md:text-5xl font-semibold text-white drop-shadow-md leading-tight max-w-4xl">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/80 mt-4 pt-4 border-t border-white/20">
              {author && (
                <span className="flex items-center gap-1.5 font-medium">
                  <User className="w-4 h-4 text-[#FFB800]" />
                  <span>{author}</span>
                </span>
              )}
              {article.ngay_dang && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>{isEn ? 'Published:' : 'Ngày đăng:'} {article.ngay_dang}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. BREADCRUMBS NAVIGATION (Cố định thanh dưới Header khi cuộn) ── */}
      <div className="sticky top-[60px] sm:top-[68px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs text-slate-500">
          <nav className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap py-0.5">
            <Link href="/" className="hover:text-[#2D5A27] transition font-medium flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isEn ? 'Home' : 'Trang chủ'}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link href="/#knowledge" className="hover:text-[#2D5A27] transition font-medium">
              {isEn ? 'Veterinary Guide' : 'Cẩm nang kiến thức'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-md">
              {title}
            </span>
          </nav>

          <Link
            href="/#knowledge"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#2D5A27] hover:underline"
          >
            <span>{isEn ? 'All Articles' : 'Tất cả bài viết'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── 3. MAIN CONTENT & SIDEBAR ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
          {/* CỘT TRÁI (Nội dung bài viết chi tiết) */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Box tóm tắt mở đầu */}
            {summary && (
              <div className="p-5 sm:p-6 rounded-2xl bg-white border border-emerald-800/10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#2D5A27]" />
                <p className="text-xs sm:text-base text-slate-700 font-medium leading-relaxed italic">
                  &ldquo;{summary}&rdquo;
                </p>
              </div>
            )}

            {/* Ảnh minh họa bài viết lớn */}
            {article.hinh_anh && (
              <div className="relative w-full h-64 sm:h-96 rounded-2xl overflow-hidden shadow-md border border-slate-200">
                <img
                  src={getAssetUrl(article.hinh_anh)}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Nội dung chi tiết bài viết */}
            <article className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-9 shadow-xs">
              {isHtmlContent(rawActiveContent) ? (
                /* HTML từ Tiptap WYSIWYG (hỗ trợ chuyển đổi song ngữ mượt mà) */
                <ArticleContent
                  html={article.noi_dung || ''}
                  htmlEn={article.noi_dung_en}
                  className="prose prose-slate prose-base sm:prose-lg max-w-none
                    prose-headings:text-[#2D5A27] prose-headings:font-bold prose-headings:tracking-tight
                    prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-emerald-100/60 prose-h2:pb-2.5
                    prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                    prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
                    prose-ul:my-4 prose-ol:my-4 prose-li:my-1.5 prose-li:text-slate-700
                    prose-a:text-[#2D5A27] prose-a:font-semibold prose-a:underline hover:prose-a:text-emerald-700
                    prose-strong:text-slate-900 prose-strong:font-bold
                    prose-img:rounded-2xl prose-img:shadow-md prose-img:my-6
                    prose-blockquote:border-l-4 prose-blockquote:border-l-[#2D5A27] prose-blockquote:bg-emerald-50/50 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-xl prose-blockquote:text-slate-700 prose-blockquote:not-italic"
                />
              ) : (
                /* Fallback Markdown renderer */
                <div className="prose prose-slate max-w-none text-slate-800">
                  {renderFormattedContent(rawActiveContent)}
                </div>
              )}

              {/* Box tác giả & khuyến cáo y khoa */}
              <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-emerald-100 border border-emerald-300 text-[#2D5A27] flex items-center justify-center font-bold text-sm shrink-0">
                    <ShieldCheck className="w-6 h-6 text-[#2D5A27]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {author}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500">
                      {isEn ? 'Compiled & Medically Reviewed by Veterinary Board' : 'Biên soạn & Thẩm định chuyên môn y khoa thú y'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenBookingModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#2D5A27] to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <CalendarCheck className="w-3.5 h-3.5 text-[#FFB800]" />
                    <span>{isEn ? 'Book an Appointment' : 'Đặt Lịch Thăm Khám'}</span>
                  </button>
                </div>
              </div>
            </article>

            {/* Khuyến cáo y khoa */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>{isEn ? 'Medical Notice:' : 'Lưu ý:'}</strong>{' '}
                {isEn
                  ? 'The information provided here is for scientific care reference only. If your pet exhibits abnormal health symptoms, please bring them immediately to the nearest veterinary hospital for direct clinical examination and diagnosis.'
                  : 'Thông tin trên đây mang tính chất tham khảo kiến thức chăm sóc khoa học. Khi thú cưng có triệu chứng bệnh lý bất thường, ba mẹ nên đưa bé đến ngay cơ sở y tế thú y gần nhất để được bác sĩ thăm khám và chẩn đoán lâm sàng chính xác.'}
              </span>
            </div>
          </div>

          {/* CỘT PHẢI (Sidebar tư vấn, FAQ & bài viết liên quan) */}
          <div className="space-y-6">
            {/* Form đặt lịch nhanh & tư vấn bác sĩ */}
            <ConsultationSidebar
              branchName={isEn ? 'Pet M&M Medical Board' : 'Hội Đồng Y Khoa Pet M&M'}
            />

            {/* FAQ */}
            <BranchFaqSidebar />

            {/* Bài viết liên quan */}
            {relatedArticles.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#2D5A27]" />
                  <span>{isEn ? 'Related Insights' : 'Bài Viết Cùng Chuyên Mục'}</span>
                </h3>

                <div className="space-y-3.5">
                  {relatedArticles.map((item) => (
                    <Link
                      key={item.id}
                      href={`/kien-thuc/${item.id}`}
                      prefetch={true}
                      className="group flex gap-3 items-start p-2 rounded-xl hover:bg-slate-50 transition"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                        <img
                          src={getAssetUrl(item.hinh_anh || '/about_consultation.jpg')}
                          alt={(isEn && item.tieu_de_en) ? item.tieu_de_en : item.tieu_de}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-[#2D5A27] uppercase tracking-wider block mb-0.5">
                          {(isEn && item.chuyen_muc_en) ? item.chuyen_muc_en : item.chuyen_muc}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-800 group-hover:text-[#2D5A27] transition line-clamp-2 leading-snug">
                          {(isEn && item.tieu_de_en) ? item.tieu_de_en : item.tieu_de}
                        </h4>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          {item.ngay_dang}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Hỗ trợ — cuối sidebar */}
            <SupportPanel />
          </div>
        </div>
      </div>

      {/* ── 4. FOOTER, FLOATING WIDGETS & NAVIGATION ── */}
      <Footer />
      <FloatingContactWidgets />
      <ScrollNavigationButtons />
    </div>
  );
}
