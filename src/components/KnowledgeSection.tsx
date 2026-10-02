'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowRight, Calendar, ChevronLeft, ChevronRight, ChevronDown, Filter, BookOpen } from 'lucide-react';
import ScrollRevealTitle from '@/components/ScrollRevealTitle';
import { supabase, BaiVietRecord } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { getAssetUrl } from '@/lib/assets';

const DEFAULT_ARTICLES: BaiVietRecord[] = [
  {
    id: '0dfd2b2e-7dc9-4958-9c06-41841911ea95',
    tieu_de: 'Lịch tiêm phòng chuẩn cho Chó & Mèo từ 2 tháng tuổi',
    tieu_de_en: 'Standard Vaccination Schedule for Dogs & Cats from 2 Months Old',
    mo_ta_ngan: 'Bảng theo dõi chi tiết các mũi tiêm phòng Parvo, Care, Giảm bạch cầu và Dại giúp bé cưng xây dựng hệ miễn dịch trọn đời.',
    mo_ta_ngan_en: 'Detailed tracking schedule for Parvo, Distemper, FPV, and Rabies vaccines helping your beloved pets build lifelong immunity.',
    chuyen_muc: 'Y Khoa Dự Phòng',
    chuyen_muc_en: 'Preventive Medicine',
    hinh_anh: '/about_consultation.jpg',
    ngay_dang: '18/09/2026',
    thoi_gian_doc: '4 phút đọc',
    thoi_gian_doc_en: '4 min read',
  },
  {
    id: '8f9df8db-f9c8-44a6-bf65-391697e8b0f8',
    tieu_de: 'Dấu hiệu nhận biết sớm sốc nhiệt ở thú cưng mùa nắng nóng',
    tieu_de_en: 'Early Warning Signs of Heatstroke in Pets During Hot Weather',
    mo_ta_ngan: 'Hướng dẫn cách sơ cứu hạ nhiệt tức thời tại nhà trước khi đưa đến bệnh viện thú y gần nhất để tránh nguy cơ tổn thương não.',
    mo_ta_ngan_en: 'Step-by-step emergency cooling instructions at home before heading to the nearest veterinary hospital to prevent brain injury.',
    chuyen_muc: 'Sơ Cứu Thú Cưng',
    chuyen_muc_en: 'Pet First Aid',
    hinh_anh: '/pet_corgi_park.jpg',
    ngay_dang: '15/09/2026',
    thoi_gian_doc: '5 phút đọc',
    thoi_gian_doc_en: '5 min read',
  },
  {
    id: 'c88f34c9-d46b-4273-ad69-728144b750db',
    tieu_de: 'Bí quyết chăm sóc lông da mềm mượt và trị ve rận triệt để',
    tieu_de_en: 'Secrets to Silky Skin & Coat and Complete Flea & Tick Treatment',
    mo_ta_ngan: 'Chế độ bổ sung Omega-3, men vi sinh và chu kỳ tắm sục thảo dược giúp thú cưng không còn gãi ngứa và rụng lông.',
    mo_ta_ngan_en: 'Omega-3 supplementation regimens, probiotics, and herbal jacuzzi bath cycles to eliminate itching and excessive shedding.',
    chuyen_muc: 'Chăm Sóc & Spa',
    chuyen_muc_en: 'Pet Care & Spa',
    hinh_anh: '/pet_golden_spa.jpg',
    ngay_dang: '10/09/2026',
    thoi_gian_doc: '3 phút đọc',
    thoi_gian_doc_en: '3 min read',
  },
];

export default function KnowledgeSection() {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [articles, setArticles] = useState<BaiVietRecord[]>(DEFAULT_ARTICLES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  /* ── Đồng bộ trạng thái nút < > ở giữa ── */
  const syncNav = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 8);
    setCanRight(scrollLeft < scrollWidth - clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', syncNav, { passive: true });
    window.addEventListener('resize', syncNav);
    syncNav();
    return () => {
      el.removeEventListener('scroll', syncNav);
      window.removeEventListener('resize', syncNav);
    };
  }, [syncNav]);

  /* ── Cuộn ngang theo bước thẻ bài viết ── */
  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.min(el.clientWidth * 0.82, 420);
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };

  /* ── Fetch bài viết từ Supabase ── */
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('bai_viet')
          .select('*')
          .eq('kich_hoat', true)
          .order('thu_tu', { ascending: true });
        if (error) {
          console.warn('Lỗi lấy bài viết:', error.message);
          return;
        }
        if (data && data.length > 0) setArticles(data);
      } catch (err) {
        console.warn('Không thể tải bài viết:', err);
      }
    };

    fetchArticles();

    const channel = supabase
      .channel('bai_viet_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bai_viet' }, fetchArticles)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ── Danh sách chuyên mục duy nhất từ bài viết ── */
  const categories = useMemo(() => {
    const cats: { key: string; labelVi: string; labelEn: string }[] = [
      { key: 'all', labelVi: 'Tất cả chuyên mục', labelEn: 'All Categories' },
    ];
    const seen = new Set<string>();
    articles.forEach((a) => {
      const vi = a.chuyen_muc?.trim();
      if (vi && !seen.has(vi)) {
        seen.add(vi);
        cats.push({
          key: vi,
          labelVi: vi,
          labelEn: a.chuyen_muc_en?.trim() || vi,
        });
      }
    });
    return cats;
  }, [articles]);

  /* ── Lọc danh sách bài viết theo chuyên mục ── */
  const filteredArticles = useMemo(() => {
    if (selectedCategory === 'all') return articles;
    return articles.filter((a) => (a.chuyen_muc || '').trim() === selectedCategory);
  }, [articles, selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(syncNav, 150);
    return () => clearTimeout(timer);
  }, [filteredArticles, syncNav]);

  return (
    <section id="knowledge" className="relative py-20 sm:py-28 text-slate-900 overflow-hidden bg-white">
      <div id="cam-nang" className="absolute -top-20 pointer-events-none" />

      {/* Nền điện ảnh */}
      <div className="absolute inset-0 z-0">
        <Image
          src={getAssetUrl('/services_bg.jpg')}
          alt="Cẩm nang chăm sóc thú cưng PetM&M"
          fill
          quality={90}
          className="object-cover object-center scale-105 opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-white/95" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề mục Kiến thức */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10">
          <ScrollRevealTitle>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#2D5A27] text-xs font-bold tracking-wider uppercase mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>{isEn ? 'VETERINARY MEDICAL GUIDE' : 'CẨM NANG BÁC SĨ PETM&M'}</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-slate-900 leading-tight">
              {isEn ? 'Pet Health, Wellness &' : 'Kiến Thức &'} <br />
              <span className="italic font-light text-[#2D5A27]">
                {isEn ? 'Practical Care Insights' : 'Kinh Nghiệm Nuôi Thú Cưng'}
              </span>
            </h2>
          </ScrollRevealTitle>

          <p className="text-xs sm:text-sm text-slate-600 max-w-md font-light text-left md:text-right mt-4 md:mt-0">
            {isEn
              ? 'Expert articles curated by PetM&M veterinary specialists to empower pet parents with evidence-based care.'
              : 'Các bài viết được biên soạn trực tiếp bởi hội đồng y khoa PetM&M nhằm hỗ trợ ba mẹ chăm sóc bé khoa học mỗi ngày.'}
          </p>
        </div>

        {/* Thanh công cụ: Bộ lọc chuyên mục dạng Droplist đổ xuống */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <label htmlFor="article-category-filter" className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5 shrink-0 uppercase tracking-wider">
              <Filter className="w-4 h-4 text-[#2D5A27]" />
              <span>{isEn ? 'Category:' : 'Chuyên mục:'}</span>
            </label>

            {/* Droplist đổ xuống */}
            <div className="relative inline-block">
              <select
                id="article-category-filter"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  if (scrollRef.current) {
                    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                  }
                }}
                className="appearance-none bg-white hover:bg-emerald-50/40 border border-slate-300 hover:border-[#2D5A27] text-slate-800 text-xs sm:text-sm font-semibold rounded-2xl pl-4 pr-10 py-2 sm:py-2.5 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-[#2D5A27] transition-all cursor-pointer min-w-[220px]"
              >
                {categories.map((cat) => {
                  const count =
                    cat.key === 'all'
                      ? articles.length
                      : articles.filter((a) => (a.chuyen_muc || '').trim() === cat.key).length;
                  return (
                    <option key={cat.key} value={cat.key}>
                      {isEn ? cat.labelEn : cat.labelVi} ({count})
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-4 h-4 text-[#2D5A27] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            {isEn
              ? `Showing ${filteredArticles.length} of ${articles.length} articles`
              : `Hiển thị ${filteredArticles.length} / ${articles.length} bài viết`}
          </div>
        </div>

        {/* Danh sách bài viết: Lướt ngang với mũi tên <> ở giữa */}
        <div className="relative group/slider">
          {/* Nút ◁ ở giữa bên trái */}
          {canLeft && (
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Xem bài viết trước"
              className="absolute left-0 sm:-left-3 lg:-left-5 top-1/2 -translate-y-1/2 z-20
                         w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl
                         flex items-center justify-center text-[#2D5A27] hover:bg-[#2D5A27] hover:text-white hover:border-[#2D5A27]
                         active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Nút ▷ ở giữa bên phải */}
          {canRight && (
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Xem bài viết tiếp theo"
              className="absolute right-0 sm:-right-3 lg:-right-5 top-1/2 -translate-y-1/2 z-20
                         w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl
                         flex items-center justify-center text-[#2D5A27] hover:bg-[#2D5A27] hover:text-white hover:border-[#2D5A27]
                         active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Container bài viết dạng cuộn ngang */}
          <div
            ref={scrollRef}
            onScroll={syncNav}
            className="flex gap-5 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-5 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredArticles.map((item) => (
              <Link
                key={item.id}
                href={`/kien-thuc/${item.id}`}
                prefetch={true}
                className="group rounded-3xl bg-[#F8FAF7] border border-slate-200
                           hover:border-[#2D5A27] shadow-sm hover:shadow-xl
                           transition-all duration-300 flex flex-col justify-between
                           hover:-translate-y-1.5 overflow-hidden cursor-pointer
                           shrink-0 snap-start
                           w-[82vw] sm:w-[350px] md:w-[380px] lg:w-[400px]"
              >
                {/* Ảnh bìa */}
                <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-slate-100">
                  <img
                    src={getAssetUrl(item.hinh_anh || '/about_consultation.jpg')}
                    alt={(isEn && item.tieu_de_en) ? item.tieu_de_en : item.tieu_de}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  <div className="absolute top-3.5 left-3.5 z-10">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#2D5A27] shadow-sm border border-emerald-900/10">
                      {(isEn && item.chuyen_muc_en)
                        ? item.chuyen_muc_en
                        : (item.chuyen_muc || (isEn ? 'Preventive Medicine' : 'Y Khoa Dự Phòng'))}
                    </span>
                  </div>

                  {(item.thoi_gian_doc || (isEn && item.thoi_gian_doc_en)) && (
                    <div className="absolute top-3.5 right-3.5 z-10">
                      <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white">
                        {(isEn && item.thoi_gian_doc_en) ? item.thoi_gian_doc_en : item.thoi_gian_doc}
                      </span>
                    </div>
                  )}
                </div>

                {/* Thân thẻ */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-[#2D5A27] transition line-clamp-2">
                      {(isEn && item.tieu_de_en) ? item.tieu_de_en : item.tieu_de}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3 font-light">
                      {(isEn && item.mo_ta_ngan_en) ? item.mo_ta_ngan_en : item.mo_ta_ngan}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.ngay_dang}</span>
                    </span>
                    <span className="font-bold text-[#2D5A27] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>{isEn ? 'Read article' : 'Đọc tiếp'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Trạng thái khi không có bài viết trong chuyên mục */}
          {filteredArticles.length === 0 && (
            <div className="py-16 text-center bg-[#F8FAF7] rounded-3xl border border-dashed border-slate-300">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">
                {isEn ? 'No articles found in this category' : 'Chưa có bài viết nào trong chuyên mục này'}
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="mt-3 text-xs font-bold text-[#2D5A27] hover:underline cursor-pointer"
              >
                {isEn ? 'View all articles' : 'Xem tất cả bài viết'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
