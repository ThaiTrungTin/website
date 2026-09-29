'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowRight, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import ScrollRevealTitle from '@/components/ScrollRevealTitle';
import { supabase, BaiVietRecord } from '@/lib/supabase';
import { getAssetUrl } from '@/lib/assets';

const DEFAULT_ARTICLES: BaiVietRecord[] = [
  {
    id: '0dfd2b2e-7dc9-4958-9c06-41841911ea95',
    tieu_de: 'Lịch tiêm phòng chuẩn cho Chó & Mèo từ 2 tháng tuổi',
    mo_ta_ngan: 'Bảng theo dõi chi tiết các mũi tiêm phòng Parvo, Care, Giảm bạch cầu và Dại giúp bé cưng xây dựng hệ miễn dịch trọn đời.',
    chuyen_muc: 'Y Khoa Dự Phòng',
    hinh_anh: '/about_consultation.jpg',
    ngay_dang: '18/09/2026',
    thoi_gian_doc: '4 phút đọc',
  },
  {
    id: '8f9df8db-f9c8-44a6-bf65-391697e8b0f8',
    tieu_de: 'Dấu hiệu nhận biết sớm sốc nhiệt ở thú cưng mùa nắng nóng',
    mo_ta_ngan: 'Hướng dẫn cách sơ cứu hạ nhiệt tức thời tại nhà trước khi đưa đến bệnh viện thú y gần nhất để tránh nguy cơ tổn thương não.',
    chuyen_muc: 'Sơ Cứu Thú Cưng',
    hinh_anh: '/pet_corgi_park.jpg',
    ngay_dang: '15/09/2026',
    thoi_gian_doc: '5 phút đọc',
  },
  {
    id: 'c88f34c9-d46b-4273-ad69-728144b750db',
    tieu_de: 'Bí quyết chăm sóc lông da mềm mượt và trị ve rận triệt để',
    mo_ta_ngan: 'Chế độ bổ sung Omega-3, men vi sinh và chu kỳ tắm sục thảo dược giúp thú cưng không còn gãi ngứa và rụng lông.',
    chuyen_muc: 'Chăm Sóc & Spa',
    hinh_anh: '/pet_golden_spa.jpg',
    ngay_dang: '10/09/2026',
    thoi_gian_doc: '3 phút đọc',
  },
];

export default function KnowledgeSection() {
  const [articles, setArticles] = useState<BaiVietRecord[]>(DEFAULT_ARTICLES);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  /* ── Đồng bộ trạng thái nút < > ── */
  const syncNav = useCallback(() => {
    const el = scrollRef.current;
    if (!el || window.innerWidth >= 768) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 4);
    setCanRight(scrollLeft < scrollWidth - clientWidth - 4);
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

  useEffect(() => { setTimeout(syncNav, 150); }, [articles, syncNav]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.82;
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };

  /* ── Fetch bài viết từ Supabase ── */
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('bai_viet')
          .select('*')
          .eq('kich_hoat', true)
          .order('thu_tu', { ascending: true });
        if (error) { console.warn('Lỗi lấy bài viết:', error.message); return; }
        if (data && data.length > 0) setArticles(data);
      } catch (err) { console.warn('Không thể tải bài viết:', err); }
    };

    fetch();

    const channel = supabase
      .channel('bai_viet_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bai_viet' }, fetch)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <section id="knowledge" className="relative py-20 sm:py-28 text-slate-900 overflow-hidden bg-white">
      <div id="cam-nang" className="absolute -top-20 pointer-events-none" />

      {/* Nền điện ảnh */}
      <div className="absolute inset-0 z-0">
        <Image
          src={getAssetUrl('/services_bg.jpg')}
          alt="Cẩm nang chăm sóc thú cưng Pet M&M"
          fill quality={90}
          className="object-cover object-center scale-105 opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-white/95" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Tiêu đề */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
          <ScrollRevealTitle>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#2D5A27] text-xs font-bold tracking-wider uppercase mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>CẨM NANG BÁC SĨ PET M&M</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-slate-900 leading-tight">
              Kiến Thức & <br />
              <span className="italic font-light text-[#2D5A27]">Kinh Nghiệm Nuôi Thú Cưng</span>
            </h2>
          </ScrollRevealTitle>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mt-4 md:mt-0 font-light">
            Các bài viết được biên soạn trực tiếp bởi hội đồng y khoa Pet M&M nhằm hỗ trợ ba mẹ chăm sóc bé khoa học mỗi ngày.
          </p>
        </div>

        {/* Danh sách bài viết: mobile cuộn ngang, desktop grid 3 cột */}
        <div className="relative">

          {/* Nút ◁ — chỉ mobile, tự ẩn khi đang ở đầu */}
          {canLeft && (
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Xem trước"
              className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20
                         w-9 h-9 rounded-full bg-white border border-slate-200 shadow-lg
                         flex items-center justify-center text-[#2D5A27] active:scale-95 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Nút ▷ — chỉ mobile, tự ẩn khi hết nội dung */}
          {canRight && (
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Xem tiếp"
              className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20
                         w-9 h-9 rounded-full bg-white border border-slate-200 shadow-lg
                         flex items-center justify-center text-[#2D5A27] active:scale-95 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Container */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 scrollbar-none
                       md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {articles.map((item) => (
              <Link
                key={item.id}
                href={`/kien-thuc/${item.id}`}
                className="group rounded-3xl bg-[#F8FAF7] border border-slate-200
                           hover:border-[#2D5A27] shadow-md hover:shadow-2xl
                           transition-all duration-300 flex flex-col justify-between
                           hover:-translate-y-1.5 overflow-hidden cursor-pointer
                           shrink-0 snap-start
                           w-[82vw] sm:w-[60vw] md:w-auto"
              >
                {/* Ảnh bìa */}
                <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-slate-100">
                  <img
                    src={getAssetUrl(item.hinh_anh || '/about_consultation.jpg')}
                    alt={item.tieu_de}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  <div className="absolute top-3.5 left-3.5 z-10">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#2D5A27] shadow-sm border border-emerald-900/10">
                      {item.chuyen_muc || 'Y Khoa Dự Phòng'}
                    </span>
                  </div>

                  {item.thoi_gian_doc && (
                    <div className="absolute top-3.5 right-3.5 z-10">
                      <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white">
                        {item.thoi_gian_doc}
                      </span>
                    </div>
                  )}
                </div>

                {/* Thân thẻ */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-[#2D5A27] transition line-clamp-2">
                      {item.tieu_de}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3 font-light">
                      {item.mo_ta_ngan}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.ngay_dang}</span>
                    </span>
                    <span className="font-bold text-[#2D5A27] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Đọc tiếp</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
