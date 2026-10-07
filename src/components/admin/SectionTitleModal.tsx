'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Settings,
  X,
  RefreshCw,
  Sparkles,
  FileText,
  Edit3,
  Eye,
  Check,
} from 'lucide-react';
import AdminResizableModal from '@/components/AdminResizableModal';
import { VietnamFlag, UKFlag } from '@/components/FlagIcons';
import { sanitizeHtml } from '@/lib/sanitize';
import { supabase } from '@/lib/supabase';
import { useSystemConfig } from '@/context/SystemConfigContext';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });

export interface SectionTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalTitle: string;
  sectionLabel: string;
  titleFieldKey: string;
  descFieldKey: string;
  titleFieldKeyEn: string;
  descFieldKeyEn: string;
  initialTitleVi?: string;
  initialDescVi?: string;
  initialTitleEn?: string;
  initialDescEn?: string;
  defaultTitleVi: string;
  defaultDescVi?: string;
  defaultTitleEn: string;
  defaultDescEn?: string;
  badgeVi?: string;
  badgeEn?: string;
  previewAlign?: 'center' | 'left';
  showNotification?: (type: 'success' | 'error' | any, message: string) => void;
  onSaveSuccess?: (saved: {
    titleVi: string;
    descVi: string;
    titleEn: string;
    descEn: string;
  }) => void;
}

export default function SectionTitleModal({
  isOpen,
  onClose,
  modalTitle,
  sectionLabel,
  titleFieldKey,
  descFieldKey,
  titleFieldKeyEn,
  descFieldKeyEn,
  initialTitleVi,
  initialDescVi,
  initialTitleEn,
  initialDescEn,
  defaultTitleVi,
  defaultDescVi = '',
  defaultTitleEn,
  defaultDescEn = '',
  badgeVi,
  badgeEn,
  previewAlign = 'center',
  showNotification,
  onSaveSuccess,
}: SectionTitleModalProps) {
  const { refreshConfig } = useSystemConfig();

  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [titleVi, setTitleVi] = useState('');
  const [descVi, setDescVi] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descEn, setDescEn] = useState('');

  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Khởi tạo giá trị khi mở modal
  useEffect(() => {
    if (isOpen) {
      setTitleVi(initialTitleVi || defaultTitleVi);
      setDescVi(initialDescVi || defaultDescVi);
      setTitleEn(initialTitleEn || defaultTitleEn);
      setDescEn(initialDescEn || defaultDescEn);
      setLang('vi');
    }
  }, [
    isOpen,
    initialTitleVi,
    initialDescVi,
    initialTitleEn,
    initialDescEn,
    defaultTitleVi,
    defaultDescVi,
    defaultTitleEn,
    defaultDescEn,
  ]);

  if (!isOpen) return null;

  const notify = (type: 'success' | 'error' | 'warning' | 'info', msg: string) => {
    if (showNotification) {
      showNotification(type, msg);
    } else {
      alert(msg);
    }
  };

  // Dịch tự động tiêu đề & chú thích qua AI API
  const handleAutoTranslate = async () => {
    setIsTranslating(true);
    try {
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            [titleFieldKey]: titleVi || '',
            [descFieldKey]: descVi || '',
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.translations) {
        if (data.translations[titleFieldKey] !== undefined) {
          setTitleEn(data.translations[titleFieldKey]);
        }
        if (data.translations[descFieldKey] !== undefined) {
          setDescEn(data.translations[descFieldKey]);
        }
        setLang('en');
        notify('success', `Đã chuyển đổi tiêu đề & chú thích mục ${sectionLabel} sang Tiếng Anh thành công!`);
      } else {
        throw new Error(data.error || 'Dịch thất bại');
      }
    } catch (err: any) {
      notify('error', `Lỗi dịch: ${err.message}`);
    } finally {
      setIsTranslating(false);
    }
  };

  // Lưu cấu hình vào Supabase
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: Record<string, any> = {
        id: 'system',
        [titleFieldKey]: titleVi,
        [descFieldKey]: descVi,
        [titleFieldKeyEn]: titleEn,
        [descFieldKeyEn]: descEn,
        ngay_cap_nhat: new Date().toISOString(),
      };
      // Lưu qua API Admin an toàn (xác thực token admin & phân quyền chặt chẽ)
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok || !resData.success) {
        // Dự phòng: cập nhật trực tiếp qua Supabase client
        const { error: updateError } = await supabase
          .from('cau_hinh')
          .update(payload)
          .eq('id', 'system');
        if (updateError) {
          throw new Error(resData.message || updateError.message);
        }
      }

      await refreshConfig();

      if (onSaveSuccess) {
        onSaveSuccess({
          titleVi,
          descVi,
          titleEn,
          descEn,
        });
      }

      notify('success', `Đã lưu tiêu đề & chú thích mục ${sectionLabel} thành công!`);
      onClose();
    } catch (err: any) {
      console.error(`Lỗi lưu tiêu đề ${sectionLabel}:`, err);
      notify('error', `Lỗi lưu tiêu đề: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const isVi = lang === 'vi';
  const currentTitle = isVi ? titleVi : titleEn;
  const setCurrentTitle = isVi ? setTitleVi : setTitleEn;
  const currentDesc = isVi ? descVi : descEn;
  const setCurrentDesc = isVi ? setDescVi : setDescEn;
  const currentDefaultTitle = isVi ? defaultTitleVi : defaultTitleEn;
  const currentDefaultDesc = isVi ? defaultDescVi : defaultDescEn;
  const currentBadge = isVi ? badgeVi : badgeEn;
  const langLabel = isVi ? 'Tiếng Việt' : 'English';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <AdminResizableModal className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-50/80 via-white to-emerald-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-wide">
                {modalTitle}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Thanh Chuyển Ngôn Ngữ & Nút Dịch AI */}
          <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setLang('vi')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  lang === 'vi' ? 'bg-[#2D5A27] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                <span>Bản Tiếng Việt</span>
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  lang === 'en' ? 'bg-[#2D5A27] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UKFlag className="w-4 h-3 rounded-[2px]" />
                <span>Bản English</span>
              </button>
            </div>
            <button
              type="button"
              onClick={handleAutoTranslate}
              disabled={isTranslating}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
              title={`Dịch tự động tiêu đề & chú thích Tiếng Việt sang Tiếng Anh bằng AI`}
            >
              {isTranslating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{isTranslating ? 'Đang chuyển đổi...' : 'Chuyển đổi ENG'}</span>
            </button>
          </div>

          {/* Tiêu đề chính */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#2D5A27]" />
                <span>Tiêu Đề Mục {sectionLabel} ({langLabel}):</span>
              </label>
              <button
                type="button"
                onClick={() => setCurrentTitle(currentDefaultTitle)}
                className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
              >
                Khôi phục mẫu tiêu đề mặc định
              </button>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <RichTextEditor
                key={`section-title-${titleFieldKey}-${lang}`}
                value={currentTitle}
                onChange={(html) => setCurrentTitle(html)}
                minHeight={150}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              💡 Bạn có thể chọn bôi đen chữ để đổi màu sang màu xanh rêu thương hiệu <code>#2D5A27</code>, in nghiêng, in đậm hoặc chèn icon/xuống dòng.
            </p>
          </div>

          {/* Chú thích / Mô tả phụ */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-[#2D5A27]" />
                <span>Chú Thích / Mô Tả Phụ ({langLabel}):</span>
              </label>
              <button
                type="button"
                onClick={() => setCurrentDesc(currentDefaultDesc)}
                className="text-[11px] text-slate-500 hover:text-slate-700 font-medium underline cursor-pointer"
              >
                Dùng gợi ý chú thích mẫu
              </button>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <RichTextEditor
                key={`section-desc-${descFieldKey}-${lang}`}
                value={currentDesc}
                onChange={(html) => setCurrentDesc(html)}
                minHeight={120}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              💡 Để trống nếu không muốn hiển thị chú thích bên dưới tiêu đề mục {sectionLabel}.
            </p>
          </div>

          {/* Khung Xem Trước Giao Diện Thực Tế */}
          <div className="p-5 rounded-2xl bg-[#F8FAF7] border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>Xem trước thực tế ngoài Trang Chủ ({langLabel}):</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Hiển thị trực quan theo thời gian thực</span>
            </div>
            <div className={`max-w-2xl mx-auto py-4 ${previewAlign === 'center' ? 'text-center' : 'text-left space-y-3'}`}>
              {/* Huy hiệu (nếu có) */}
              {currentBadge && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#2D5A27] text-xs font-bold tracking-wider uppercase shadow-xs mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
                  <span>{currentBadge}</span>
                </div>
              )}

              {/* Tiêu đề */}
              <div
                className="font-editorial text-2xl sm:text-4xl text-slate-900 leading-tight [&_p]:m-0 [&_span]:inline [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentTitle || currentDefaultTitle) }}
              />

              {/* Chú thích / Mô tả */}
              {currentDesc && (
                <div
                  className={`mt-3 text-xs sm:text-sm text-slate-600 font-light leading-relaxed [&_p]:m-0 ${previewAlign === 'center' ? 'max-w-xl mx-auto' : ''}`}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentDesc) }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-md hover:shadow-lg transition disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Đang lưu...' : 'Lưu Tiêu Đề Mục'}</span>
          </button>
        </div>
      </AdminResizableModal>
    </div>
  );
}
