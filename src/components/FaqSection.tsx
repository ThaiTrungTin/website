'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import ScrollRevealTitle from '@/components/ScrollRevealTitle';
import { supabase, CauHoiThuongGapRecord } from '@/lib/supabase';
import { useSystemConfig } from '@/context/SystemConfigContext';
import { faqData } from '@/data/faqData';
import {
  ChevronDown,
  ChevronUp,
  CalendarDays,
  PhoneCall,
  MessageSquareHeart,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';

const FALLBACK_FAQS: CauHoiThuongGapRecord[] = faqData.map((f, i) => ({
  id: f.id,
  cau_hoi: f.question,
  cau_tra_loi: f.answer,
  chuyen_muc: f.category || 'Chung',
  thu_tu: i + 1,
  kich_hoat: true,
}));

export default function FaqSection() {
  const { config } = useSystemConfig();
  const [faqs, setFaqs] = useState<CauHoiThuongGapRecord[]>(FALLBACK_FAQS);
  const [openId, setOpenId] = useState<string | null>(FALLBACK_FAQS[0]?.id || null);
  const [loading, setLoading] = useState(false);

  // Tải danh sách FAQ từ Supabase
  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cau_hoi_thuong_gap')
        .select('*')
        .eq('kich_hoat', true)
        .order('thu_tu', { ascending: true });

      if (error) {
        console.warn('Lỗi tải câu hỏi thường gặp từ Supabase, dùng mặc định:', error.message);
        return;
      }

      if (data && data.length > 0) {
        setFaqs(data as CauHoiThuongGapRecord[]);
        // Mở sẵn câu đầu tiên nếu chưa chọn câu nào
        if (!openId) {
          setOpenId(data[0].id);
        }
      }
    } catch (err) {
      console.warn('Không thể kết nối Supabase cho FAQ:', err);
    } finally {
      setLoading(false);
    }
  }, [openId]);

  useEffect(() => {
    fetchFaqs();

    // Lắng nghe thay đổi thời gian thực từ Admin
    const channel = supabase
      .channel('cau_hoi_thuong_gap_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cau_hoi_thuong_gap' },
        () => {
          fetchFaqs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFaqs]);

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const hotlineRaw = (config.hotline || '0903 599 339').replace(/\s+/g, '');
  const hotlineDisplay = config.hotline_hien_thi || config.hotline || '0903 599 339';
  const zaloUrl = config.link_zalo || 'https://zalo.me/0903599339';

  return (
    <section id="faq" className="relative py-20 sm:py-28 text-slate-900 overflow-hidden bg-[#F8FAF7] border-t border-slate-200/80">
      <div id="faqs" className="absolute -top-20 pointer-events-none" />
      {/* 1. CINEMATIC LUXURY BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/services_bg.jpg"
          alt="Không gian an yên tại Pet M&M"
          fill
          quality={90}
          className="object-cover object-center scale-105 opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAF7]/95 via-[#F8FAF7]/85 to-[#F8FAF7]/95" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header chuẩn typography font-editorial & màu xanh emerald của web Pet M&M */}
        <ScrollRevealTitle className="text-left mb-10 sm:mb-14">
          <h2 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-slate-900 mb-4">
            Câu Hỏi <span className="italic font-light text-[#2D5A27]">Thường Gặp</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed font-light">
            Pet M&amp;M tổng hợp những câu hỏi thường gặp để giúp chủ nuôi chuẩn bị tốt hơn trước khi đặt lịch và sử dụng các dịch vụ. Để được tư vấn và xác nhận lịch phù hợp, vui lòng liên hệ qua Zalo OA chính thức của Pet M&amp;M.
          </p>
        </ScrollRevealTitle>

        {/* BỐ CỤC 2 TRƯỜNG */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* TRƯỜNG 1 (BÊN TRÁI): DANH SÁCH CÂU HỎI THƯỜNG GẶP (ACCORDION) */}
          <div className="lg:col-span-7 space-y-3.5">
            {faqs.map((item) => {
              const isOpen = openId === item.id;
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden bg-white shadow-xs ${
                    isOpen
                      ? 'border-[#2D5A27] shadow-md ring-1 ring-[#2D5A27]/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(item.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 select-none cursor-pointer"
                  >
                    <div className="flex-1 pr-2">
                      <h3
                        className={`text-sm sm:text-base font-semibold leading-snug transition-colors ${
                          isOpen ? 'text-[#2D5A27] font-bold' : 'text-slate-800 hover:text-slate-950'
                        }`}
                      >
                        {item.cau_hoi}
                      </h3>
                    </div>

                    <div className="shrink-0 text-slate-400">
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-[#2D5A27]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3.5 animate-in fade-in duration-200 font-light whitespace-pre-line">
                      <p>{item.cau_tra_loi}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {faqs.length === 0 && !loading && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Chưa có câu hỏi nào.</p>
              </div>
            )}
          </div>

          {/* TRƯỜNG 2 (BÊN PHẢI): BẠN CẦN PET M&M HỖ TRỢ? */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xl overflow-hidden text-slate-900 sticky top-28">
              {/* Vệt sáng trang trí thương hiệu Emerald */}
              <div className="absolute -top-24 -right-24 w-52 h-52 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

              <h3 className="font-editorial text-2xl sm:text-3xl font-normal text-slate-900 mb-2">
                Bạn cần Pet M&amp;M <span className="italic font-light text-[#2D5A27]">hỗ trợ?</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-6 font-light">
                Chọn cách liên hệ phù hợp với nhu cầu của bạn.
              </p>

              {/* 3 Thẻ liên hệ trực tiếp */}
              <div className="space-y-3.5 relative z-10">
                {/* 1. Đặt lịch dịch vụ qua Zalo OA */}
                <a
                  href={zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 transition-all duration-300 cursor-pointer shadow-xs"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 text-[#2D5A27] shadow-sm group-hover:scale-105 transition-transform">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#2D5A27] transition-colors">
                        Đặt lịch dịch vụ qua Zalo OA
                      </h4>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed font-light">
                      Gửi thông tin thú cưng, dịch vụ cần sử dụng, cơ sở và thời gian mong muốn để Pet M&amp;M xác nhận lịch hẹn.
                    </p>
                  </div>
                </a>

                {/* 2. Gọi trực tiếp hotline cơ sở Pet M&M gần nhất */}
                <a
                  href={`tel:${hotlineRaw}`}
                  className="group flex items-start gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-rose-50/40 border border-slate-200 hover:border-rose-200 transition-all duration-300 cursor-pointer shadow-xs"
                >
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0 text-rose-700 shadow-sm group-hover:scale-105 transition-transform">
                    <PhoneCall className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-rose-700 transition-colors">
                        Gọi trực tiếp hotline cấp cứu 24/7
                      </h4>
                      <PhoneCall className="w-3.5 h-3.5 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed font-light">
                      Khi thú cưng khó thở, co giật, đau nhiều, chảy máu, nôn hoặc tiêu chảy nặng, nghi ngộ độc hay cần hỗ trợ khẩn cấp. Không chờ phản hồi qua tin nhắn.
                    </p>
                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold">
                      <span>Hotline: {hotlineDisplay}</span>
                    </div>
                  </div>
                </a>

                {/* 3. Trao đổi nhu cầu chăm sóc đặc thù */}
                <a
                  href={zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 transition-all duration-300 cursor-pointer shadow-xs"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0 text-[#2D5A27] shadow-sm group-hover:scale-105 transition-transform">
                    <MessageSquareHeart className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#2D5A27] transition-colors">
                        Trao đổi nhu cầu chăm sóc đặc thù
                      </h4>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed font-light">
                      Gửi hồ sơ và thông tin qua Zalo OA khi thú cưng có bệnh lý nền, chế độ ăn kiêng riêng hoặc cần lưu trú dài hạn.
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
