'use client';

import React, { useState, useEffect } from 'react';
import { faqData, FaqItem } from '@/data/faqData';
import {
  ChevronDown,
  ChevronUp,
  CalendarDays,
  PhoneCall,
  MessageSquareHeart,
  ExternalLink,
} from 'lucide-react';
import { useSystemConfig } from '@/context/SystemConfigContext';
import { useLanguage } from '@/context/LanguageContext';
import { supabase, SupportPanelConfig, DEFAULT_SUPPORT_CONFIG } from '@/lib/supabase';
import PetMMBrand from './PetMMBrand';

/* ── FAQ accordion cho Sidebar các trang con ── */
export default function BranchFaqSidebar() {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [openId, setOpenId] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<FaqItem[]>(faqData.slice(0, 5));

  useEffect(() => {
    async function loadFaqs() {
      try {
        const { data, error } = await supabase
          .from('cau_hoi_thuong_gap')
          .select('*')
          .eq('kich_hoat', true)
          .order('thu_tu', { ascending: true })
          .limit(5);

        if (!error && data && data.length > 0) {
          const mapped: FaqItem[] = data.map((d: any) => ({
            id: d.id,
            category: d.chuyen_muc || 'Hỏi đáp',
            category_en: d.chuyen_muc_en || 'Q&A',
            question: d.cau_hoi,
            question_en: d.cau_hoi_en || d.cau_hoi,
            answer: d.cau_tra_loi,
            answer_en: d.cau_tra_loi_en || d.cau_tra_loi,
          }));
          setFaqs(mapped);
        }
      } catch (e) {
        console.warn('Lỗi tải FAQs sidebar, dùng mặc định:', e);
      }
    }
    loadFaqs();
  }, []);

  const toggle = (id: string) => setOpenId((p) => (p === id ? null : id));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {isEn ? 'Frequently Asked Questions' : 'Câu hỏi thường gặp'}
        </h3>
      </div>
      <div className="divide-y divide-slate-100">
        {faqs.map((item) => {
          const isOpen = openId === item.id;
          const displayQuestion = isEn ? (item.question_en || item.question) : item.question;
          const displayAnswer = isEn ? (item.answer_en || item.answer) : item.answer;

          return (
            <div key={item.id}>
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="w-full px-4 py-3 text-left flex items-start justify-between gap-3 hover:bg-slate-50/80 transition cursor-pointer"
              >
                <span className={`text-xs leading-snug font-medium ${isOpen ? 'text-[#2D5A27] font-bold' : 'text-slate-700'}`}>
                  {displayQuestion}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-[#2D5A27] shrink-0 mt-0.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                )}
              </button>
              {isOpen && (
                <div className="px-4 pb-3.5 pt-1 text-xs text-slate-600 leading-relaxed bg-emerald-50/40 border-t border-emerald-100 whitespace-pre-line font-light">
                  {displayAnswer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Panel hỗ trợ — đặt độc lập ở cuối sidebar các trang con ── */
export function SupportPanel() {
  const { config } = useSystemConfig();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [supportConfig, setSupportConfig] = useState<SupportPanelConfig>(DEFAULT_SUPPORT_CONFIG);

  useEffect(() => {
    // 1. Tải cấu hình từ Supabase
    async function fetchSupportConfig() {
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
        console.warn('Lỗi tải cấu hình support_panel:', err);
      }
    }

    fetchSupportConfig();

    // 2. Lắng nghe cập nhật trực tiếp từ Admin
    const handleUpdate = (e: any) => {
      if (e?.detail) {
        setSupportConfig((prev) => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener('petmm_support_config_updated', handleUpdate);

    return () => {
      window.removeEventListener('petmm_support_config_updated', handleUpdate);
    };
  }, []);

  const hotline = config?.hotline_hien_thi || config?.hotline || '0364 605 544';
  const hotlineRaw = (config?.hotline || hotline).replace(/\s+/g, '');
  const zaloLink = config?.link_zalo || 'https://zalo.me/0903599339';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {isEn ? (
            <>
              Need <PetMMBrand /> <span className="text-[#2D5A27]">support?</span>
            </>
          ) : (
            <>
              Bạn cần <PetMMBrand /> <span className="text-[#2D5A27]">hỗ trợ?</span>
            </>
          )}
        </h3>
      </div>
      <div className="p-3.5 space-y-2">
        {/* Zalo */}
        <a
          href={zaloLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-[#2D5A27] group-hover:scale-105 transition-transform">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 group-hover:text-[#2D5A27] transition-colors leading-snug">
              {isEn ? (supportConfig.card1_title_en || 'Book via Zalo') : (supportConfig.card1_title_vi || 'Đặt lịch qua Zalo')}
            </p>
            <p className="text-[11px] text-slate-500 font-light truncate">
              {isEn ? (supportConfig.card1_desc_en || 'Send info, confirm appointment') : (supportConfig.card1_desc_vi || 'Gửi thông tin, xác nhận lịch hẹn')}
            </p>
          </div>
          <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-[#2D5A27] shrink-0 transition" />
        </a>

        {/* Hotline Cấp Cứu 24/7 */}
        <a
          href={`tel:${hotlineRaw}`}
          className="group flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-600 group-hover:scale-105 transition-transform">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 group-hover:text-rose-700 transition-colors leading-snug">
              {isEn ? (supportConfig.card2_title_en || 'Call 24/7 Emergency Hotline') : (supportConfig.card2_title_vi || 'Gọi hotline khẩn cấp')}
            </p>
            <p className="text-xs font-bold text-rose-600">{hotline}</p>
          </div>
        </a>

        {/* Zalo tư vấn đặc thù */}
        <a
          href={zaloLink}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-[#2D5A27] group-hover:scale-105 transition-transform">
            <MessageSquareHeart className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 group-hover:text-[#2D5A27] transition-colors leading-snug">
              {isEn ? (supportConfig.card3_title_en || 'Special Care Consultation') : (supportConfig.card3_title_vi || 'Tư vấn chăm sóc đặc thù')}
            </p>
            <p className="text-[11px] text-slate-500 font-light truncate">
              {isEn ? (supportConfig.card3_desc_en || 'Chronic conditions, custom diet') : (supportConfig.card3_desc_vi || 'Bệnh lý nền, chế độ ăn riêng')}
            </p>
          </div>
          <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-[#2D5A27] shrink-0 transition" />
        </a>
      </div>
    </div>
  );
}
