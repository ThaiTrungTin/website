'use client';

import React, { useState } from 'react';
import { faqData } from '@/data/faqData';
import {
  ChevronDown,
  ChevronUp,
  CalendarDays,
  PhoneCall,
  MessageSquareHeart,
  ExternalLink,
} from 'lucide-react';
import { useSystemConfig } from '@/context/SystemConfigContext';

/* ── FAQ accordion ── */
export default function BranchFaqSidebar() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => setOpenId((p) => (p === id ? null : id));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Câu hỏi thường gặp
        </h3>
      </div>
      <div className="divide-y divide-slate-100">
        {faqData.slice(0, 5).map((item) => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id}>
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="w-full px-4 py-3 text-left flex items-start justify-between gap-3 hover:bg-slate-50/80 transition cursor-pointer"
              >
                <span className={`text-xs leading-snug font-medium ${isOpen ? 'text-[#2D5A27] font-bold' : 'text-slate-700'}`}>
                  {item.question}
                </span>
                {isOpen
                  ? <ChevronUp className="w-3.5 h-3.5 text-[#2D5A27] shrink-0 mt-0.5" />
                  : <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                }
              </button>
              {isOpen && (
                <div className="px-4 pb-3.5 pt-1 text-xs text-slate-600 leading-relaxed bg-emerald-50/40 border-t border-emerald-100">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Panel hỗ trợ — đặt độc lập ở cuối sidebar ── */
export function SupportPanel() {
  const { config } = useSystemConfig();
  const hotline = config?.hotline_hien_thi || config?.hotline || '0903 599 339';
  const zaloLink = config?.link_zalo || 'https://zalo.me';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Bạn cần Pet M&amp;M <span className="text-[#2D5A27]">hỗ trợ?</span>
        </h3>
      </div>
      <div className="p-3.5 space-y-2">
        {/* Zalo OA */}
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
            <p className="text-xs font-bold text-slate-800 group-hover:text-[#2D5A27] transition-colors leading-snug">Đặt lịch qua Zalo OA</p>
            <p className="text-[11px] text-slate-500 font-light">Gửi thông tin, xác nhận lịch hẹn</p>
          </div>
          <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-[#2D5A27] shrink-0 transition" />
        </a>

        {/* Hotline */}
        <a
          href={`tel:${hotline.replace(/\s+/g, '')}`}
          className="group flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-600 group-hover:scale-105 transition-transform">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 group-hover:text-rose-700 transition-colors leading-snug">Gọi hotline khẩn cấp</p>
            <p className="text-xs font-bold text-rose-600">{hotline}</p>
          </div>
        </a>

        {/* Zalo OA tư vấn */}
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
            <p className="text-xs font-bold text-slate-800 group-hover:text-[#2D5A27] transition-colors leading-snug">Tư vấn chăm sóc đặc thù</p>
            <p className="text-[11px] text-slate-500 font-light">Bệnh lý nền, chế độ ăn riêng</p>
          </div>
          <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-[#2D5A27] shrink-0 transition" />
        </a>
      </div>
    </div>
  );
}
