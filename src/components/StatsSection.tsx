'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Users, Stethoscope, Building2, Clock, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function StatsSection() {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const stats = [
    {
      value: '30.000+',
      label: t('stats_clients', 'Khách hàng hài lòng'),
      description: t('stats_clients_desc', 'Chó mèo được phục hồi sức khỏe & chăm sóc sắc đẹp trọn vẹn'),
      icon: Users,
      topBadge: t('reviews_verified', '99.8% Hài lòng'),
    },
    {
      value: '100%',
      label: t('stats_doctors', 'Bác sĩ chuyên khoa'),
      description: t('stats_doctors_desc', 'Tốt nghiệp ĐH Nông Lâm, chứng chỉ hành nghề & tu nghiệp quốc tế'),
      icon: Stethoscope,
      topBadge: t('services_featured_badge', 'Đầu ngành'),
    },
    {
      value: '3+',
      label: t('stats_branches', 'Cơ sở chuẩn 5 sao'),
      description: t('stats_branches_desc', 'Tọa lạc tại Quận 1, Quận 7 và Biệt thự sinh thái Thảo Điền'),
      icon: Building2,
      topBadge: 'TP.HCM',
    },
    {
      value: '24/7',
      label: t('stats_hotline', 'Hotline & Lưu trú'),
      description: t('stats_hotline_desc', 'Hotline 24/7, đội ngũ trực đêm 365 ngày sẵn sàng tiếp nhận'),
      icon: Clock,
      topBadge: t('hero_stat_emergency', 'Ngoại viện'),
    },
  ];


  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, clientWidth, scrollWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

    const cardWidth = clientWidth > 640 ? clientWidth * 0.5 : clientWidth;
    const index = Math.round(scrollLeft / (cardWidth + 16));
    setActiveIndex(Math.min(Math.max(index, 0), stats.length - 1));
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, []);

  const scrollToCard = (index: number) => {
    if (!scrollContainerRef.current) return;
    const { clientWidth } = scrollContainerRef.current;
    const cardWidth = clientWidth > 640 ? clientWidth * 0.5 : clientWidth;
    scrollContainerRef.current.scrollTo({
      left: index * (cardWidth + 16),
      behavior: 'smooth',
    });
    setActiveIndex(index);
  };

  const handlePrev = () => {
    if (!scrollContainerRef.current) return;
    const { clientWidth } = scrollContainerRef.current;
    const step = clientWidth > 640 ? clientWidth * 0.5 : clientWidth;
    scrollContainerRef.current.scrollBy({
      left: -(step + 16),
      behavior: 'smooth',
    });
  };

  const handleNext = () => {
    if (!scrollContainerRef.current) return;
    const { clientWidth } = scrollContainerRef.current;
    const step = clientWidth > 640 ? clientWidth * 0.5 : clientWidth;
    scrollContainerRef.current.scrollBy({
      left: step + 16,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-12 sm:py-20 bg-[#F8FAF7] text-slate-900 relative border-y border-slate-200/80 select-none overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#2D5A27] text-xs font-bold tracking-wider uppercase mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#2D5A27]" />
            DẤU ẤN CHẤT LƯỢNG Y KHOA
          </div>
          <h2 className="font-editorial text-2xl sm:text-4xl font-normal text-slate-900 tracking-tight">
            Những Con Số Khẳng Định Vị Thế Dẫn Đầu
          </h2>
        </div>

        {/* Slider Container: Ô nằm trọn trong khung hình, không viền đen tròn */}
        <div className="relative w-full overflow-hidden">
          {/* Mũi tên lướt sang Trái: Tinh gọn, chỉ mũi tên, ẩn khi ở đầu bên trái */}
          {canScrollLeft && (
            <button
              onClick={handlePrev}
              aria-label="Lướt sang trái"
              title="Lướt sang trái"
              className="absolute left-0 sm:left-1 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 text-slate-700 hover:text-[#2D5A27] hover:scale-125 active:scale-90 transition-all duration-200 cursor-pointer drop-shadow-sm"
            >
              <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.5]" />
            </button>
          )}

          {/* Cards Container: Ô nằm trọn vẹn trong khung hình */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 sm:pb-2 no-scrollbar scroll-smooth w-full"
          >
            {stats.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] shrink-0 snap-center relative group p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 hover:border-[#2D5A27]/60 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between shadow-md hover:shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-[#2D5A27] text-white flex items-center justify-center transition-transform group-hover:scale-110 duration-200 shadow-md">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-[#2D5A27] border border-emerald-200">
                        {item.topBadge}
                      </span>
                    </div>

                    <div className="text-3xl sm:text-4xl font-black font-editorial tracking-tight text-[#2D5A27] mb-2">
                      {item.value}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      {item.label}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed font-light">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mũi tên lướt sang Phải: Tinh gọn, chỉ mũi tên, ẩn khi đã lướt hết sang phải */}
          {canScrollRight && (
            <button
              onClick={handleNext}
              aria-label="Lướt sang phải"
              title="Lướt sang phải"
              className="absolute right-0 sm:right-1 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 text-slate-700 hover:text-[#2D5A27] hover:scale-125 active:scale-90 transition-all duration-200 cursor-pointer drop-shadow-sm"
            >
              <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Chấm chỉ báo trang lướt (Dots) */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {stats.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToCard(i)}
              aria-label={`Xem thông số ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === i ? 'w-6 bg-[#FFB800]' : 'w-1.5 bg-white/25 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
