'use client';

import React, { useState, useRef } from 'react';
import { Upload, ClipboardPaste, RefreshCw, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AdminImageInputProps {
  value: string;
  onChange: (url: string) => void;
  folder: 'banners' | 'branches' | 'services' | 'general' | 'articles';
  label?: string;
  uploadButtonLabel?: string;
  pasteButtonLabel?: string;
  onNotification?: (type: 'success' | 'error', message: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function AdminImageInput({
  value,
  onChange,
  folder,
  label,
  uploadButtonLabel = 'Tải File',
  pasteButtonLabel = 'Dán Ảnh',
  onNotification,
  className = '',
  disabled = false,
}: AdminImageInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Xử lý upload Blob hoặc File lên Supabase Storage
  const uploadBlobOrFile = async (blob: Blob | File, filenameHint?: string) => {
    if (blob.size > 25 * 1024 * 1024) {
      onNotification?.('error', 'Dung lượng ảnh vượt quá 25MB!');
      return;
    }

    setIsUploading(true);
    try {
      let ext = 'jpg';
      if (blob.type) {
        const parts = blob.type.split('/');
        if (parts[1]) {
          ext = parts[1].replace('jpeg', 'jpg').replace('svg+xml', 'svg');
        }
      } else if (filenameHint && filenameHint.includes('.')) {
        ext = filenameHint.split('.').pop()?.toLowerCase() || 'jpg';
      }

      const cleanFileName = `${folder}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const filePath = `${folder}/${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('hinh_anh')
        .upload(filePath, blob, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('hinh_anh').getPublicUrl(filePath);

      onChange(publicUrlData.publicUrl);
      onNotification?.('success', 'Đã tải ảnh lên thành công!');
    } catch (err: any) {
      console.error('Upload image error:', err);
      onNotification?.('error', `Lỗi tải ảnh: ${err.message || 'Lỗi kết nối'}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 1. Dán trực tiếp từ phím Ctrl+V vào ô input
  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await uploadBlobOrFile(file, `pasted_${Date.now()}`);
          return;
        }
      }
    }
    // Nếu là paste URL dạng văn bản thuần, input onChange sẽ xử lý bình thường
  };

  // 2. Bấm nút "Dán Ảnh" (Đọc Clipboard API)
  const handlePasteButtonClick = async () => {
    if (disabled || isUploading) return;

    try {
      // Ưu tiên đọc ảnh từ clipboard
      if (typeof navigator !== 'undefined' && navigator.clipboard?.read) {
        try {
          const clipboardItems = await navigator.clipboard.read();
          for (const item of clipboardItems) {
            const imageType = item.types.find((t) => t.startsWith('image/'));
            if (imageType) {
              const blob = await item.getType(imageType);
              await uploadBlobOrFile(blob, `clipboard_${Date.now()}`);
              return;
            }
          }
        } catch (readErr) {
          console.warn('Clipboard image read permission issue:', readErr);
        }
      }

      // Đọc URL text từ clipboard nếu không có file ảnh
      if (typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
        try {
          const text = await navigator.clipboard.readText();
          const trimmed = text?.trim() || '';
          if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
            onChange(trimmed);
            onNotification?.('success', 'Đã dán liên kết ảnh từ bộ nhớ tạm!');
            return;
          }
        } catch {}
      }

      // Hướng dẫn nếu trình duyệt chặn quyền clipboard tự động
      textInputRef.current?.focus();
      onNotification?.(
        'error',
        'Hãy nhấp vào ô nhập và nhấn phím Ctrl+V để dán ảnh đã copy tức thì!'
      );
    } catch (err: any) {
      textInputRef.current?.focus();
      onNotification?.(
        'error',
        'Hãy nhấp vào ô nhập và nhấn phím Ctrl+V để dán ảnh!'
      );
    }
  };

  // 3. Chọn file từ máy
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onNotification?.('error', 'Chỉ chấp nhận tệp định dạng hình ảnh!');
      return;
    }

    await uploadBlobOrFile(file, file.name);
  };

  // 4. Kéo thả file ảnh
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await uploadBlobOrFile(file, file.name);
    } else {
      onNotification?.('error', 'Vui lòng chỉ thả tệp hình ảnh!');
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-[#2D5A27]" />
            <span>{label}</span>
          </span>
          <span className="text-[11px] text-[#2D5A27] font-normal">
            Hỗ trợ Ctrl+V dán ảnh trực tiếp
          </span>
        </label>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1 rounded-2xl border transition-all ${
          isDragOver
            ? 'border-dashed border-2 border-[#2D5A27] bg-emerald-50/60 shadow-inner'
            : 'border-transparent'
        }`}
      >
        {/* Ô nhập link ảnh / nhận sự kiện Paste Ctrl+V (TUYỆT ĐỐI KHÔNG DÙNG PLACEHOLDER) */}
        <div className="relative flex-1 flex items-center">
          <input
            ref={textInputRef}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            disabled={disabled || isUploading}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27]/20 transition disabled:bg-slate-100"
          />

          {value && !disabled && !isUploading && (
            <button
              type="button"
              onClick={() => onChange('')}
              title="Xóa đường dẫn ảnh"
              className="absolute right-2.5 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Input file ẩn */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          disabled={disabled || isUploading}
          className="hidden"
        />

        {/* Cụm 2 nút: CHÈN (Tải File) & DÁN (Dán Ảnh từ Clipboard) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Nút 1: Dán ảnh từ Clipboard (Ctrl+V) */}
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={handlePasteButtonClick}
            title="Dán ảnh từ bộ nhớ tạm (Clipboard / Ctrl+V)"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs transition cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
            ) : (
              <ClipboardPaste className="w-3.5 h-3.5 text-amber-700" />
            )}
            <span>{isUploading ? 'Đang tải...' : pasteButtonLabel}</span>
          </button>

          {/* Nút 2: Tải file từ máy tính */}
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => fileInputRef.current?.click()}
            title="Chọn tệp ảnh từ máy tính"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white font-bold text-xs transition cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            {isUploading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>{isUploading ? 'Đang tải...' : uploadButtonLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
