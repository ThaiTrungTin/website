'use client';

import React, { useState } from 'react';
import { Send, User, Phone, CheckCircle2 } from 'lucide-react';
import { useSystemConfig } from '@/context/SystemConfigContext';
import { useLanguage } from '@/context/LanguageContext';

export default function ConsultationSidebar({ branchName = 'Hệ Thống PetM&M' }: { branchName?: string }) {
  const { config } = useSystemConfig();
  const { isEn, t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const hotline = config?.hotline_hien_thi || config?.hotline || '0903 599 339';
  const zaloLink = config?.link_zalo || '#';

  const effectiveBranchName = isEn && branchName === 'Hội Đồng Y Khoa PetM&M'
    ? 'PetM&M Medical Board'
    : branchName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setLoading(true);

    // Gửi tin nhắn Zalo (format link Zalo pre-filled message)
    const msg = isEn
      ? encodeURIComponent(
          `Hello PetM&M! I am ${name.trim()}, phone number ${phone.trim()}. I would like to request consultation for ${effectiveBranchName}.`
        )
      : encodeURIComponent(
          `Xin chào PetM&M! Tôi là ${name.trim()}, số điện thoại ${phone.trim()}. Tôi muốn được tư vấn dịch vụ tại cơ sở ${effectiveBranchName}.`
        );
    const zaloUrl = `${zaloLink}?msg=${msg}`;

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      window.open(zaloUrl, '_blank');
    }, 800);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-200 shadow-lg p-6 text-center space-y-3">
        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#2D5A27]" />
        </div>
        <h3 className="font-bold text-slate-900 text-base">
          {t('consult_success_title', 'Đã gửi thành công!')}
        </h3>
        <p className="text-xs text-slate-500">
          {t('consult_success_desc', 'Tin nhắn Zalo đã được mở. Đội ngũ PetM&M sẽ liên hệ lại với bạn sớm nhất.')}
        </p>
        <a
          href={`tel:${hotline.replace(/\s+/g, '')}`}
          className="block mt-2 text-sm font-bold text-[#2D5A27] hover:underline"
        >
          📞 Hotline: {hotline}
        </a>
        <button
          onClick={() => { setSubmitted(false); setName(''); setPhone(''); }}
          className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer"
        >
          {t('consult_retry', 'Gửi lại')}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2D5A27] to-emerald-700 px-4 py-3.5 text-white">
        <h3 className="font-bold text-sm leading-snug">
          {t('consult_title_free_part1', 'Nhận tư vấn')}{' '}
          <span className="italic font-light opacity-90">{t('consult_title_free_part2', 'miễn phí')}</span>
        </h3>
        <p className="text-emerald-100 text-xs mt-0.5 font-light">
          {t('consult_desc', 'Điền thông tin để đội ngũ PetM&M liên hệ tư vấn cho bạn')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        {/* Họ và tên */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
            <User className="w-3 h-3 text-[#2D5A27]" />
            <span>{t('consult_fullname', 'Họ và tên')}</span>
            <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('consult_fullname_placeholder', 'Nhập họ và tên')}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#2D5A27] focus:bg-white transition"
          />
        </div>

        {/* Số điện thoại */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
            <Phone className="w-3 h-3 text-[#2D5A27]" />
            <span>{t('consult_phone', 'Số điện thoại')}</span>
            <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('consult_phone_placeholder', 'Nhập số điện thoại')}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:border-[#2D5A27] focus:bg-white transition"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] disabled:opacity-60 text-white font-bold text-xs transition shadow-xs cursor-pointer"
        >
          {loading ? (
            <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>{loading ? t('consult_sending', 'Đang gửi...') : t('consult_submit', 'Gửi yêu cầu tư vấn')}</span>
        </button>

        <p className="text-[11px] text-slate-500 text-center font-light">
          {t('consult_or_call', 'Hoặc gọi hotline:')}{' '}
          <a href={`tel:${hotline.replace(/\s+/g, '')}`} className="font-bold text-[#2D5A27] hover:underline">
            {hotline}
          </a>
        </p>
      </form>
    </div>
  );
}
