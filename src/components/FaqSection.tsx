'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import ScrollRevealTitle from '@/components/ScrollRevealTitle';
import { supabase, CauHoiThuongGapRecord, SupportPanelConfig, DEFAULT_SUPPORT_CONFIG } from '@/lib/supabase';
import { useSystemConfig } from '@/context/SystemConfigContext';
import { useLanguage } from '@/context/LanguageContext';
import { faqData } from '@/data/faqData';
import { getAssetUrl } from '@/lib/assets';
import {
  ChevronDown,
  ChevronUp,
  CalendarDays,
  PhoneCall,
  MessageSquareHeart,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { renderBrandText } from '@/components/PetMMBrand';

function sanitizeHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
}

const FALLBACK_FAQS: CauHoiThuongGapRecord[] = faqData.map((f, i) => ({
  id: f.id,
  cau_hoi: f.question,
  cau_hoi_en: f.question_en,
  cau_tra_loi: f.answer,
  cau_tra_loi_en: f.answer_en,
  chuyen_muc: f.category || 'Chung',
  chuyen_muc_en: f.category_en || 'General',
  thu_tu: i + 1,
  kich_hoat: true,
}));

export default function FaqSection() {
  const { config } = useSystemConfig();
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const [faqs, setFaqs] = useState<CauHoiThuongGapRecord[]>(FALLBACK_FAQS);
  const [openId, setOpenId] = useState<string | null>(FALLBACK_FAQS[0]?.id || null);
  const [loading, setLoading] = useState(false);
  const [supportConfig, setSupportConfig] = useState<SupportPanelConfig>(DEFAULT_SUPPORT_CONFIG);

  // Tải danh sách FAQ từ Supabase
  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cau_hoi_thuong_gap')
        .select('*')
        .eq('kich_hoat', true)
        .order('thu_tu', { ascending: true });

      if (!error && data && data.length > 0) {
        setFaqs(data as CauHoiThuongGapRecord[]);
      }
    } catch (err) {
      console.warn('Lỗi khi tải FAQ, dùng dữ liệu mặc định:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải cấu hình mục Hỗ Trợ từ Supabase
  const fetchSupportConfig = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('cau_hinh')
        .select('*')
        .eq('id', 'support_panel')
        .maybeSingle();

      if (!error && data?.slogan_cuoi_trang_noi_dung) {
        try {
          const parsed = JSON.parse(data.slogan_cuoi_trang_noi_dung);
          if (parsed && typeof parsed === 'object') {
            setSupportConfig((prev) => ({ ...prev, ...parsed }));
          }
        } catch {}
      }
    } catch (err) {
      console.warn('Lỗi tải supportConfig:', err);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
    fetchSupportConfig();

    const handleSupportUpdate = (e: any) => {
      if (e?.detail) setSupportConfig((prev) => ({ ...prev, ...e.detail }));
    };
    window.addEventListener('petmm_support_config_updated', handleSupportUpdate);
    return () => window.removeEventListener('petmm_support_config_updated', handleSupportUpdate);
  }, [fetchFaqs, fetchSupportConfig]);



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
          src={getAssetUrl('/services_bg.jpg')}
          alt="Không gian an yên tại PetM&M"
          fill
          quality={90}
          className="object-cover object-center scale-105 opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAF7]/95 via-[#F8FAF7]/85 to-[#F8FAF7]/95" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header chuẩn typography font-editorial & màu xanh emerald của web PetM&M */}
        {(() => {
          const rawFaqTitleHtml = (isEn ? config.section_faq_tieu_de_en : config.section_faq_tieu_de) || '';
          const rawFaqDescHtml = (isEn ? config.section_faq_mo_ta_en : config.section_faq_mo_ta) || '';
          const faqTitleHtml = sanitizeHtml(rawFaqTitleHtml);
          const faqDescHtml = sanitizeHtml(rawFaqDescHtml);

          return (
            <ScrollRevealTitle className="text-left mb-10 sm:mb-14">
              {faqTitleHtml ? (
                <div
                  className="rich-section-title font-editorial text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-slate-900 mb-4 [&>h1]:m-0 [&>h2]:m-0 [&>h3]:m-0 [&>p]:m-0"
                  dangerouslySetInnerHTML={{ __html: faqTitleHtml }}
                />
              ) : (
                <h2 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-slate-900 mb-4">
                  {isEn ? 'Frequently Asked ' : 'Câu Hỏi '}
                  <span className="italic font-light text-[#2D5A27]">
                    {isEn ? 'Questions' : 'Thường Gặp'}
                  </span>
                </h2>
              )}

              {faqDescHtml ? (
                <div
                  className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed font-light [&>p]:m-0"
                  dangerouslySetInnerHTML={{ __html: faqDescHtml }}
                />
              ) : (
                <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed font-light">
                  {isEn
                    ? 'Answers to the most common questions from pet parents regarding veterinary examinations, surgery, and luxury hotel boarding at PetM&M.'
                    : 'PetM&M tổng hợp những câu hỏi thường gặp để giúp chủ nuôi chuẩn bị tốt hơn trước khi đặt lịch và sử dụng các dịch vụ. Để được tư vấn và xác nhận lịch phù hợp, vui lòng liên hệ qua Zalo chính thức của PetM&M.'}
                </p>
              )}
            </ScrollRevealTitle>
          );
        })()}

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
                        {isEn ? (item.cau_hoi_en || item.cau_hoi) : item.cau_hoi}
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
                      <p>{isEn ? (item.cau_tra_loi_en || item.cau_tra_loi) : item.cau_tra_loi}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {faqs.length === 0 && !loading && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">{isEn ? 'No questions available.' : 'Chưa có câu hỏi nào.'}</p>
              </div>
            )}
          </div>

          {/* TRƯỜNG 2 (BÊN PHẢI): BẠN CẦN PETM&M HỖ TRỢ? */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xl overflow-hidden text-slate-900 sticky top-28">
              {/* Vệt sáng trang trí thương hiệu Emerald */}
              <div className="absolute -top-24 -right-24 w-52 h-52 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

              <h3 className="font-editorial text-2xl sm:text-3xl font-normal text-slate-900 mb-2">
                {isEn ? (
                  <>
                    {renderBrandText((supportConfig.tieu_de_en || 'Need PetM&M support?').replace(/support\?$/i, '').trim())}{' '}
                    <span className="italic font-light text-[#2D5A27]">
                      {/support\?$/i.test(supportConfig.tieu_de_en || '') ? 'support?' : ''}
                    </span>
                  </>
                ) : (
                  <>
                    {renderBrandText((supportConfig.tieu_de_vi || 'Bạn cần PetM&M hỗ trợ?').replace(/hỗ trợ\?$/i, '').trim())}{' '}
                    <span className="italic font-light text-[#2D5A27]">
                      {/hỗ trợ\?$/i.test(supportConfig.tieu_de_vi || '') ? 'hỗ trợ?' : ''}
                    </span>
                  </>
                )}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-6 font-light">
                {isEn ? (supportConfig.mo_ta_en || 'Choose the contact method that suits your needs.') : (supportConfig.mo_ta_vi || 'Chọn cách liên hệ phù hợp với nhu cầu của bạn.')}
              </p>

              {/* 3 Thẻ liên hệ trực tiếp */}
              <div className="space-y-3.5 relative z-10">
                {/* 1. Đặt lịch dịch vụ qua Zalo */}
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
                        {isEn ? (supportConfig.card1_title_en || 'Book via Zalo') : (supportConfig.card1_title_vi || 'Đặt lịch dịch vụ qua Zalo')}
                      </h4>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed font-light">
                      {isEn ? (supportConfig.card1_desc_en || 'Send your pet info, desired service, branch, and preferred time. PetM&M will confirm your appointment.') : (supportConfig.card1_desc_vi || 'Gửi thông tin thú cưng, dịch vụ cần sử dụng, cơ sở và thời gian mong muốn để PetM&M xác nhận lịch hẹn.')}
                    </p>
                  </div>
                </a>

                {/* 2. Gọi trực tiếp hotline cơ sở PetM&M gần nhất */}
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
                        {isEn ? (supportConfig.card2_title_en || 'Call 24/7 Emergency Hotline') : (supportConfig.card2_title_vi || 'Gọi trực tiếp hotline cấp cứu 24/7')}
                      </h4>
                      <PhoneCall className="w-3.5 h-3.5 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed font-light">
                      {isEn ? (supportConfig.card2_desc_en || 'When your pet has difficulty breathing, seizures, severe pain, bleeding, vomiting, diarrhea, suspected poisoning, or needs emergency assistance.') : (supportConfig.card2_desc_vi || 'Khi thú cưng khó thở, co giật, đau nhiều, chảy máu, nôn hoặc tiêu chảy nặng, nghi ngộ độc hay cần hỗ trợ khẩn cấp. Không chờ phản hồi qua tin nhắn.')}
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
                        {isEn ? (supportConfig.card3_title_en || 'Special Care Consultation') : (supportConfig.card3_title_vi || 'Trao đổi nhu cầu chăm sóc đặc thù')}
                      </h4>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed font-light">
                      {isEn ? (supportConfig.card3_desc_en || 'Send your pet\'s medical records via Zalo for chronic conditions, special diets, or long-term boarding needs.') : (supportConfig.card3_desc_vi || 'Gửi hồ sơ và thông tin qua Zalo khi thú cưng có bệnh lý nền, chế độ ăn kiêng riêng hoặc cần lưu trú dài hạn.')}
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
