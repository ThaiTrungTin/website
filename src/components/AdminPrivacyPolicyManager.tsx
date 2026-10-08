'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ShieldCheck,
  Save,
  RotateCcw,
  RefreshCw,
  Eye,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { DEFAULT_PRIVACY_POLICY, PrivacyPolicyConfig } from '@/types/privacyPolicy';

// Nạp động RichTextEditor (trình soạn thảo Word) tránh SSR
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-96 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 text-xs">
      <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#2D5A27]" />
      <span>Đang tải trình soạn thảo văn bản...</span>
    </div>
  ),
});

// Cờ Việt Nam & Anh chuẩn theo các view còn lại
function VietnamFlag({ className = 'w-4 h-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 30 20" fill="none">
      <rect width="30" height="20" fill="#DA251D" />
      <polygon
        points="15,4 17.5,11.5 11,7 19,7 12.5,11.5"
        fill="#FF0"
      />
    </svg>
  );
}

function UKFlag({ className = 'w-4 h-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 30" fill="none">
      <clipPath id="s">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath="url(#s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

interface Props {
  showNotification: (type: 'success' | 'info' | 'error', message: string) => void;
}

export default function AdminPrivacyPolicyManager({ showNotification }: Props) {
  const [policyData, setPolicyData] = useState<PrivacyPolicyConfig>(DEFAULT_PRIVACY_POLICY);
  const [langTab, setLangTab] = useState<'vi' | 'en'>('vi');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 1. Tải chính sách từ API
  const fetchPolicy = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/privacy-policy', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setPolicyData(json.data);
      }
    } catch (err: any) {
      console.error('Lỗi tải chính sách bảo mật:', err);
      showNotification('error', 'Không thể tải chính sách quyền riêng tư từ máy chủ');
    } finally {
      setIsLoading(false);
      setHasUnsavedChanges(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, []);

  // 2. Tự động dịch sang tiếng Anh bằng AI (Chuyển đổi ENG)
  const handleTranslateToEng = async () => {
    try {
      setIsTranslating(true);
      const textsToTranslate = {
        title: policyData.titleVi || DEFAULT_PRIVACY_POLICY.titleVi,
        content: policyData.contentVi || DEFAULT_PRIVACY_POLICY.contentVi,
      };

      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: textsToTranslate,
          context: 'veterinary clinic legal privacy policy and data protection terms',
        }),
      });

      if (!res.ok) throw new Error('Dịch vụ chuyển đổi AI phản hồi lỗi');
      const data = await res.json();

      setPolicyData((prev) => ({
        ...prev,
        titleEn: data.translations?.title || prev.titleEn || DEFAULT_PRIVACY_POLICY.titleEn,
        contentEn: data.translations?.content || prev.contentEn || DEFAULT_PRIVACY_POLICY.contentEn,
      }));

      setLangTab('en');
      setHasUnsavedChanges(true);
      showNotification('success', 'Đã chuyển đổi toàn bộ chính sách sang Tiếng Anh thành công!');
    } catch (err: any) {
      console.warn('Lỗi AI dịch, dùng mẫu tiếng Anh chuẩn:', err);
      setPolicyData((prev) => ({
        ...prev,
        titleEn: prev.titleEn || DEFAULT_PRIVACY_POLICY.titleEn,
        contentEn: prev.contentEn || DEFAULT_PRIVACY_POLICY.contentEn,
      }));
      setLangTab('en');
      setHasUnsavedChanges(true);
      showNotification('info', 'Đã tải nội dung Tiếng Anh chuẩn để chỉnh sửa.');
    } finally {
      setIsTranslating(false);
    }
  };

  // 3. Lưu chính sách
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      const updatedData: PrivacyPolicyConfig = {
        ...policyData,
        lastUpdated: (policyData.lastUpdated || '').trim() || new Date().toLocaleDateString('vi-VN'),
      };

      const res = await fetch('/api/privacy-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      const json = await res.json();
      if (json.success) {
        setPolicyData(json.data);
        setHasUnsavedChanges(false);
        showNotification('success', 'Đã lưu chính sách quyền riêng tư thành công!');
      } else {
        throw new Error(json.message || 'Lỗi không xác định');
      }
    } catch (err: any) {
      console.error('Lỗi lưu chính sách:', err);
      showNotification('error', `Lỗi lưu chính sách: ${err.message || 'Thao tác thất bại'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Khôi phục mẫu mặc định
  const handleResetToDefault = () => {
    const isConfirm = window.confirm(
      'Bạn có chắc chắn muốn khôi phục về Mẫu Chính Sách Chuẩn (Nghị định 13/2023/NĐ-CP & GDPR)?\nNội dung bạn chưa lưu sẽ bị ghi đè.'
    );
    if (!isConfirm) return;

    setPolicyData({
      ...DEFAULT_PRIVACY_POLICY,
      lastUpdated: policyData.lastUpdated || new Date().toLocaleDateString('vi-VN'),
    });
    setHasUnsavedChanges(true);
    showNotification('info', 'Đã tải lại mẫu chính sách chuẩn. Hãy bấm "Lưu Thay Đổi" để cập nhật lên web.');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-3 shadow-xs">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2D5A27] mx-auto" />
        <p className="text-sm font-semibold text-slate-700">Đang tải chính sách quyền riêng tư...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. Thanh Chuyển Đổi Ngôn Ngữ Chuẩn Hóa & Nút Chuyển Đổi ENG */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
        {/* Nút Tab Song Ngữ */}
        <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setLangTab('vi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              langTab === 'vi'
                ? 'bg-[#2D5A27] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <VietnamFlag className="w-4 h-3 rounded-[2px]" />
            <span>Bản Tiếng Việt</span>
          </button>

          <button
            type="button"
            onClick={() => setLangTab('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              langTab === 'en'
                ? 'bg-[#2D5A27] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UKFlag className="w-4 h-3 rounded-[2px]" />
            <span>Bản English</span>
          </button>
        </div>

        {/* Các nút tiện ích bên phải */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/chinh-sach-bao-mat"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 bg-white text-slate-700 text-xs font-semibold transition shadow-2xs"
            title="Mở tab mới xem giao diện thực tế khách xem"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-700" />
            <span>Xem Trên Web ↗</span>
          </Link>

          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 bg-white text-slate-700 text-xs font-semibold transition shadow-2xs cursor-pointer"
            title="Khôi phục nội dung văn bản chuẩn pháp luật"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Mẫu Chuẩn</span>
          </button>

          {/* Nút Chuyển đổi ENG bằng AI */}
          <button
            type="button"
            onClick={handleTranslateToEng}
            disabled={isTranslating}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs hover:shadow transition disabled:opacity-50 cursor-pointer"
            title="Tự động dịch sang tiếng Anh bằng AI"
          >
            {isTranslating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{isTranslating ? 'Đang chuyển đổi...' : 'Chuyển đổi ENG'}</span>
          </button>
        </div>
      </div>

      {/* 3. Khung Soạn Thảo Chính */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-5">
        {/* Hàng Tiêu Đề & Ngày Hiệu Lực Có Thể Tự Cài Đặt (Set Được) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Cột 1: Tiêu đề trang chính sách */}
          <div className="md:col-span-8 space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
              {langTab === 'vi' ? (
                <>
                  <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                  <span>Tiêu Đề Trang Chính Sách:</span>
                </>
              ) : (
                <>
                  <UKFlag className="w-4 h-3 rounded-[2px]" />
                  <span>Page Title (English):</span>
                </>
              )}
            </label>
            <input
              type="text"
              value={langTab === 'vi' ? policyData.titleVi : policyData.titleEn}
              onChange={(e) => {
                const val = e.target.value;
                setPolicyData((prev) => ({
                  ...prev,
                  ...(langTab === 'vi' ? { titleVi: val } : { titleEn: val }),
                }));
                setHasUnsavedChanges(true);
              }}
              placeholder={langTab === 'vi' ? 'Chính Sách Bảo Mật & Bảo Vệ Quyền Riêng Tư' : 'Privacy Policy & Data Protection'}
              className="w-full text-xs font-bold text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#2D5A27] bg-white shadow-2xs"
            />
          </div>

          {/* Cột 2: Ngày Hiệu Lực / Cập Nhật (Cài đặt được trực tiếp) */}
          <div className="md:col-span-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>Ngày Hiệu Lực / Cập Nhật:</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setPolicyData((prev) => ({
                    ...prev,
                    lastUpdated: new Date().toLocaleDateString('vi-VN'),
                  }));
                  setHasUnsavedChanges(true);
                }}
                className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
              >
                Lấy hôm nay
              </button>
            </div>
            <input
              type="text"
              value={policyData.lastUpdated || ''}
              onChange={(e) => {
                setPolicyData((prev) => ({ ...prev, lastUpdated: e.target.value }));
                setHasUnsavedChanges(true);
              }}
              placeholder="08/10/2026"
              className="w-full text-xs font-semibold font-mono text-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#2D5A27] bg-white shadow-2xs"
            />
          </div>
        </div>

        {/* Trình Soạn Thảo Word (RichTextEditor) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>Nội Dung Chi Tiết ({langTab === 'vi' ? 'Bản Tiếng Việt' : 'Bản English'}):</span>
          </label>
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <RichTextEditor
              value={langTab === 'vi' ? policyData.contentVi : policyData.contentEn}
              onChange={(html) => {
                setPolicyData((prev) => ({
                  ...prev,
                  ...(langTab === 'vi' ? { contentVi: html } : { contentEn: html }),
                }));
                setHasUnsavedChanges(true);
              }}
              minHeight={520}
            />
          </div>
        </div>

        {/* Nút Lưu Dưới Cùng (Đã gỡ bỏ toàn bộ các câu chú thích thừa) */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Đang lưu nội dung...' : 'Lưu Tất Cả Thay Đổi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
