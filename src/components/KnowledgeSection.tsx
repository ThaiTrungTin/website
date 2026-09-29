'use client';

import React from 'react';
import Image from 'next/image';
import { BookOpen, Sparkles, ArrowRight, Calendar } from 'lucide-react';
import ScrollRevealTitle from '@/components/ScrollRevealTitle';

export default function KnowledgeSection() {
  const articles = [
    {
      id: 'tip-1',
      title: 'Lịch tiêm phòng chuẩn cho Chó & Mèo từ 2 tháng tuổi',
      desc: 'Bảng theo dõi chi tiết các mũi tiêm phòng Parvo, Care, Giảm bạch cầu và Dại giúp bé cưng xây dựng hệ miễn dịch trọn đời.',
      tag: 'Y Khoa Dự Phòng',
      date: '18/09/2026',
      readTime: '4 phút đọc',
    },
    {
      id: 'tip-2',
      title: 'Dấu hiệu nhận biết sớm sốc nhiệt ở thú cưng mùa nắng nóng',
      desc: 'Hướng dẫn cách sơ cứu hạ nhiệt tức thời tại nhà trước khi đưa đến bệnh viện thú y gần nhất để tránh nguy cơ tổn thương não.',
      tag: 'Sơ Cứu Thú Cưng',
      date: '15/09/2026',
      readTime: '5 phút đọc',
    },
    {
      id: 'tip-3',
      title: 'Bí quyết chăm sóc lông da mềm mượt và trị ve rận triệt để',
      desc: 'Chế độ bổ sung Omega-3, men vi sinh và chu kỳ tắm sục thảo dược giúp thú cưng không còn gãi ngứa và rụng lông.',
      tag: 'Chăm Sóc & Spa',
      date: '10/09/2026',
      readTime: '3 phút đọc',
    },
  ];

  return (
    <section id="knowledge" className="relative py-20 sm:py-28 text-slate-900 overflow-hidden bg-white">
      <div id="cam-nang" className="absolute -top-20 pointer-events-none" />
      {/* 1. CINEMATIC BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/services_bg.jpg"
          alt="Cẩm nang chăm sóc thú cưng Pet M&M"
          fill
          quality={90}
          className="object-cover object-center scale-105 opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-white/95" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
          <ScrollRevealTitle>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#2D5A27] text-xs font-bold tracking-wider uppercase mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>CẨM NANG BÁC SĨ PET M&M</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-slate-900 leading-tight">
              Kiến Thức & <br />
              <span className="italic font-light text-[#2D5A27]">
                Kinh Nghiệm Nuôi Thú Cưng
              </span>
            </h2>
          </ScrollRevealTitle>

          <p className="text-xs sm:text-sm text-slate-600 max-w-md mt-4 md:mt-0 font-light">
            Các bài viết được biên soạn trực tiếp bởi hội đồng y khoa Pet M&M nhằm hỗ trợ ba mẹ chăm sóc bé khoa học mỗi ngày.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((item) => (
            <article
              key={item.id}
              className="p-7 rounded-3xl bg-[#F8FAF7] border border-slate-200 hover:border-[#2D5A27] shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-[#2D5A27] border border-emerald-200">
                    {item.tag}
                  </span>
                  <span className="text-xs text-slate-500 font-light">{item.readTime}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug hover:text-[#2D5A27] transition">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-light">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {item.date}
                </span>
                <span className="font-bold text-[#2D5A27] flex items-center gap-1 hover:underline cursor-pointer">
                  Đọc tiếp <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
