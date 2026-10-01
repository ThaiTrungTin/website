'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Clock, Navigation, BookOpen, ArrowRight } from 'lucide-react';
import { ChiNhanhRecord } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { getAssetUrl, getDirectionsUrl } from '@/lib/assets';
import ArticleContent from '@/components/ArticleContent';
import ConsultationSidebar from '@/components/ConsultationSidebar';
import BranchFaqSidebar, { SupportPanel } from '@/components/BranchFaqSidebar';
import Footer from '@/components/Footer';
import FloatingContactWidgets from '@/components/FloatingContactWidgets';
import ScrollNavigationButtons from '@/components/ScrollNavigationButtons';
import Header from '@/components/Header';
import BookingModal from '@/components/BookingModal';

interface Props {
  branch: ChiNhanhRecord;
  recentArticles: {
    id: string;
    tieu_de: string;
    tieu_de_en?: string | null;
    hinh_anh: string | null;
    chuyen_muc: string | null;
    chuyen_muc_en?: string | null;
    ngay_dang: string | null;
  }[];
}

export default function ChiNhanhDetailClient({ branch, recentArticles }: Props) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<string | undefined>(undefined);

  const handleOpenBookingModal = (serviceTitle?: string) => {
    setPreselectedService(serviceTitle);
    setIsBookingModalOpen(true);
  };

  const branchName = (isEn && branch.ten_chi_nhanh_en) ? branch.ten_chi_nhanh_en : branch.ten_chi_nhanh;
  const branchArea = (isEn && branch.khu_vuc_en) ? branch.khu_vuc_en : branch.khu_vuc;
  const branchAddress = (isEn && branch.dia_chi_en) ? branch.dia_chi_en : branch.dia_chi;
  const branchHours = (isEn && branch.gio_hoat_dong_en) ? branch.gio_hoat_dong_en : branch.gio_hoat_dong;

  const heroImg = branch.anh_dai_dien;
  const heroPos = branch.can_chinh_anh || '50% 50%';

  return (
    <div className="min-h-screen bg-[#f8faf7] pt-[60px] sm:pt-[68px]">
      {/* ── 0. LUXURY MAIN NAVBAR (Cố định trên cùng khi cuộn) ── */}
      <Header onOpenBookingModal={handleOpenBookingModal} alwaysVisible />

      {/* ── 1. HERO IMAGE (full-width) ── */}
      {heroImg ? (
        <div className="relative w-full h-56 sm:h-72 md:h-96 lg:h-[460px] overflow-hidden">
          <img
            src={getAssetUrl(heroImg)}
            alt={branchName}
            className="w-full h-full object-cover"
            style={{ objectPosition: heroPos }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {branchArea && (
                <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30 mb-3">
                  {branchArea}
                </span>
              )}
              <h1 className="text-2xl sm:text-4xl font-bold text-white drop-shadow-lg leading-snug">
                {branchName}
              </h1>
              {branchAddress && (
                <p className="flex items-center gap-1.5 text-white/80 text-sm mt-2">
                  <MapPin className="w-4 h-4 shrink-0" />
                  {branchAddress}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-[#2D5A27] to-emerald-700 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {branchArea && (
              <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white border border-white/30 mb-3">
                {branchArea}
              </span>
            )}
            <h1 className="text-2xl sm:text-4xl font-bold text-white leading-snug">{branchName}</h1>
            {branchAddress && (
              <p className="flex items-center gap-1.5 text-white/80 text-sm mt-2">
                <MapPin className="w-4 h-4 shrink-0" />
                {branchAddress}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── 2. THANH BREADCRUMB & THÔNG TIN NHANH KẾT HỢP (Cố định dưới Header khi cuộn) ── */}
      <div className="sticky top-[60px] sm:top-[68px] z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Layout (1 dòng ngang cân xứng hoàn hảo) */}
          <div className="hidden lg:flex items-center justify-between py-2.5 gap-4">
            {/* Cột trái: Breadcrumb */}
            <nav aria-label="Breadcrumb" className="min-w-0">
              <ol className="flex items-center gap-1.5 text-xs sm:text-sm">
                <li>
                  <Link href="/" className="text-slate-500 hover:text-[#2D5A27] transition font-medium">
                    {isEn ? 'Home' : 'Trang chủ'}
                  </Link>
                </li>
                <li className="text-slate-300 select-none">›</li>
                <li>
                  <Link href="/#branches" className="text-slate-500 hover:text-[#2D5A27] transition font-medium">
                    {isEn ? 'Clinic Network' : 'Hệ thống cơ sở'}
                  </Link>
                </li>
                {branchArea && (
                  <>
                    <li className="text-slate-300 select-none">›</li>
                    <li><span className="text-slate-500 font-medium">{branchArea}</span></li>
                  </>
                )}
                <li className="text-slate-300 select-none">›</li>
                <li>
                  <span className="text-[#2D5A27] font-bold truncate max-w-xs xl:max-w-md inline-block align-bottom">
                    {branchName}
                  </span>
                </li>
              </ol>
            </nav>

            {/* Cột phải: Thông tin hotline, giờ mở cửa & nút chỉ đường */}
            <div className="flex items-center gap-2.5 xl:gap-3 shrink-0">
              {branch.so_dien_thoai && (
                <a
                  href={`tel:${branch.so_dien_thoai}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200/80 text-xs font-bold text-slate-800 hover:text-[#2D5A27] transition shadow-2xs group"
                  title={isEn ? `Call: ${branch.so_dien_thoai}` : `Gọi điện: ${branch.so_dien_thoai}`}
                >
                  <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-2xs shrink-0">
                    <Phone className="w-3 h-3 text-[#2D5A27]" />
                  </span>
                  <span className="font-mono tracking-tight">{branch.so_dien_thoai}</span>
                </a>
              )}

              {branchHours && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-600 shadow-2xs">
                  <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-2xs shrink-0">
                    <Clock className="w-3 h-3 text-[#2D5A27]" />
                  </span>
                  <span className="whitespace-nowrap">{branchHours}</span>
                </div>
              )}

              {branch.link_ggmap_app && (
                <a
                  href={getDirectionsUrl(branch.link_ggmap_app, branchAddress, branchName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#2D5A27] to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-bold transition shadow-xs hover:shadow-md active:scale-95 shrink-0 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Directions' : 'Chỉ đường'}</span>
                </a>
              )}
            </div>
          </div>

          {/* Mobile & Tablet Layout (2 dòng gọn gàng, siêu tiện lợi) */}
          <div className="lg:hidden py-2 space-y-1.5">
            {/* Dòng 1: Breadcrumb cuộn ngang */}
            <div className="overflow-x-auto no-scrollbar">
              <ol className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                <li>
                  <Link href="/" className="text-slate-500 hover:text-[#2D5A27] transition font-medium">
                    {isEn ? 'Home' : 'Trang chủ'}
                  </Link>
                </li>
                <li className="text-slate-300 select-none">›</li>
                <li>
                  <Link href="/#branches" className="text-slate-500 hover:text-[#2D5A27] transition font-medium">
                    {isEn ? 'Clinic Network' : 'Hệ thống cơ sở'}
                  </Link>
                </li>
                {branchArea && (
                  <>
                    <li className="text-slate-300 select-none">›</li>
                    <li><span className="text-slate-500 font-medium">{branchArea}</span></li>
                  </>
                )}
                <li className="text-slate-300 select-none">›</li>
                <li><span className="text-[#2D5A27] font-bold">{branchName}</span></li>
              </ol>
            </div>

            {/* Dòng 2: Số điện thoại + Giờ + Nút Chỉ đường */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar min-w-0 flex-1">
                {branch.so_dien_thoai && (
                  <a
                    href={`tel:${branch.so_dien_thoai}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-slate-800 shrink-0"
                  >
                    <Phone className="w-3 h-3 text-[#2D5A27]" />
                    <span className="font-mono">{branch.so_dien_thoai}</span>
                  </a>
                )}
                {branchHours && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-600 shrink-0">
                    <Clock className="w-3 h-3 text-[#2D5A27]" />
                    <span className="truncate max-w-[150px]">{branchHours}</span>
                  </div>
                )}
              </div>

              {branch.link_ggmap_app && (
                <a
                  href={getDirectionsUrl(branch.link_ggmap_app, branchAddress, branchName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2D5A27] hover:bg-[#23481e] text-white text-[11px] font-bold transition shadow-2xs shrink-0 whitespace-nowrap"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Directions' : 'Chỉ đường'}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. MAIN CONTENT: Cân đối hoàn hảo giữa bài viết & sidebar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Article (chiếm 8/12 cột) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Rich-text article */}
            {(branch.bai_viet_chi_tiet && branch.bai_viet_chi_tiet.trim() !== '') || (branch.bai_viet_chi_tiet_en && branch.bai_viet_chi_tiet_en.trim() !== '') ? (
              <article className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 sm:p-8 md:p-10">
                <ArticleContent
                  html={branch.bai_viet_chi_tiet || ''}
                  htmlEn={branch.bai_viet_chi_tiet_en || branch.bai_viet_chi_tiet}
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
              </article>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
                <p className="text-sm">
                  {isEn
                    ? 'No detailed article available for this branch yet.'
                    : 'Chưa có bài viết chi tiết cho cơ sở này.'}
                </p>
                <p className="text-xs mt-1">
                  {isEn
                    ? 'Administrators can add content in the Admin portal.'
                    : 'Quản trị viên có thể thêm nội dung trong trang Admin.'}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: form + FAQ + cẩm nang + support */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 space-y-4 w-full">
              {/* Consultation form */}
              <ConsultationSidebar branchName={branchName} />

              {/* FAQ + Support panel */}
              <BranchFaqSidebar />

              {/* Bài Viết Cẩm Nang */}
              {recentArticles.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#2D5A27]" />
                    <span>{isEn ? 'Medical Handbook Articles' : 'Bài Viết Cẩm Nang'}</span>
                  </h3>
                  <div className="space-y-3.5">
                    {recentArticles.map((item) => {
                      const articleTitle = (isEn && item.tieu_de_en) ? item.tieu_de_en : item.tieu_de;
                      const articleCat = (isEn && item.chuyen_muc_en) ? item.chuyen_muc_en : item.chuyen_muc;
                      return (
                        <Link
                          key={item.id}
                          href={`/kien-thuc/${item.id}`}
                          prefetch={true}
                          className="group flex gap-3 items-start p-2 rounded-xl hover:bg-slate-50 transition"
                        >
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                            <img
                              src={getAssetUrl(item.hinh_anh || '/about_consultation.jpg')}
                              alt={articleTitle}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            {articleCat && (
                              <span className="text-[10px] font-bold text-[#2D5A27] uppercase tracking-wider block mb-0.5">
                                {articleCat}
                              </span>
                            )}
                            <h4 className="text-xs font-semibold text-slate-800 group-hover:text-[#2D5A27] transition line-clamp-2 leading-snug">
                              {articleTitle}
                            </h4>
                            {item.ngay_dang && (
                              <span className="text-[11px] text-slate-400 mt-1 block">{item.ngay_dang}</span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <Link
                    href="/#knowledge"
                    className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold text-[#2D5A27] hover:underline pt-3 border-t border-slate-100"
                  >
                    <span>{isEn ? 'View all articles' : 'Xem tất cả bài viết'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Hỗ trợ — cuối sidebar */}
              <SupportPanel />
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. FOOTER ĐÁY TRANG ── */}
      <Footer branch={branch} />

      {/* ── 5. WIDGET LIÊN HỆ & NÚT CUỘN ĐẦU TRANG / CUỐI TRANG ── */}
      <FloatingContactWidgets />
      <ScrollNavigationButtons />

      {/* ── 6. CỬA SỔ ĐẶT LỊCH HẸN KHÁM BỆNH (BOOKING MODAL) ── */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        preselectedService={preselectedService}
      />
    </div>
  );
}
