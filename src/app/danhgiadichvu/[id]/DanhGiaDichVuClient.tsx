'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Star,
  CheckCircle2,
  ArrowRight,
  Upload,
  Camera,
  X,
  MapPin,
  ThumbsUp,
} from 'lucide-react';
import { supabase, YeuCauDanhGiaRecord } from '@/lib/supabase';
import PetLogo from '@/components/PetLogo';

interface Props {
  initialRecord: YeuCauDanhGiaRecord;
}

const STAR_LABELS: Record<number, { text: string; emoji: string; color: string }> = {
  1: { text: 'Rất không hài lòng', emoji: '😞', color: 'text-red-500' },
  2: { text: 'Chưa hài lòng', emoji: '😕', color: 'text-orange-500' },
  3: { text: 'Bình thường', emoji: '😐', color: 'text-yellow-500' },
  4: { text: 'Hài lòng', emoji: '😊', color: 'text-blue-500' },
  5: { text: 'Rất hài lòng!', emoji: '😄', color: 'text-green-600' },
};

export default function DanhGiaDichVuClient({ initialRecord }: Props) {
  const [record, setRecord] = useState<YeuCauDanhGiaRecord>(initialRecord);
  const isAlreadySubmitted = record.trang_thai === 'da_danh_gia';

  const [rating, setRating] = useState<number>(record.so_sao || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>(record.noi_dung_danh_gia || '');
  const [hinhAnh, setHinhAnh] = useState<string>(record.hinh_anh || '');
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(isAlreadySubmitted);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const activeStar = hoverRating || rating;

  const handleImageFile = async (file: File) => {
    if (!file) return;
    setIsUploadingImage(true);
    setErrorMessage('');
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `danh_gia/review_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('hinh_anh').upload(filePath, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('hinh_anh').getPublicUrl(filePath);
      setHinhAnh(urlData.publicUrl);
    } catch {
      // Fallback: base64
      const reader = new FileReader();
      reader.onload = (e) => { if (e.target?.result) setHinhAnh(e.target.result as string); };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!rating || rating < 1 || rating > 5) {
      setErrorMessage('Vui lòng chọn số sao đánh giá');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/review-requests/${encodeURIComponent(record.ma_danh_gia)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ so_sao: rating, noi_dung_danh_gia: feedback, hinh_anh: hinhAnh || null }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Có lỗi xảy ra khi gửi đánh giá');
      setRecord(json.data || { ...record, trang_thai: 'da_danh_gia', so_sao: rating, noi_dung_danh_gia: feedback, hinh_anh: hinhAnh });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể gửi đánh giá, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900">

      {/* Header — giống Google Maps style */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <PetLogo size="sm" showSubline={false} />
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 text-xs text-slate-600">
            <MapPin className="w-3 h-3 text-emerald-600" />
            <span className="font-medium">PetM&M Veterinary</span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 sm:py-8">
        {isSuccess ? (
          /* THANK YOU SCREEN */
          <div className="text-center py-4 animate-fade-in">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5 shadow-sm">
              <CheckCircle2 className="w-9 h-9 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">
              Cảm ơn bạn đã đánh giá!
            </h1>
            <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
              PetM&M cảm ơn <strong className="text-slate-700">{record.ten_khach_hang}</strong> đã dành thời gian chia sẻ trải nghiệm. Ý kiến của bạn giúp chúng tôi phục vụ tốt hơn.
            </p>

            {/* Rating summary card — Google style */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <span className="text-lg">{STAR_LABELS[record.so_sao || rating]?.emoji}</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{record.ten_khach_hang}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= (record.so_sao || rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                    ))}
                    <span className="text-xs text-slate-500 ml-1">{record.so_sao || rating}/5</span>
                  </div>
                </div>
              </div>

              {record.noi_dung_danh_gia && (
                <p className="text-sm text-slate-600 leading-relaxed mb-3 italic border-l-2 border-slate-200 pl-3">
                  "{record.noi_dung_danh_gia}"
                </p>
              )}

              {(record.hinh_anh || hinhAnh) && (
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={record.hinh_anh || hinhAnh} alt="Ảnh đính kèm" className="w-full h-36 object-cover" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 mb-6 text-sm text-slate-500">
              <ThumbsUp className="w-4 h-4 text-blue-500" />
              <span>Đánh giá của bạn đã được ghi nhận</span>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              <span>Trang chủ PetM&M</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* REVIEW FORM */
          <div>
            {/* Location header — Google Maps style */}
            <div className="flex items-start gap-3 mb-6 pb-5 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-base leading-tight">
                  {record.co_so || 'PetM&M Veterinary Clinic'}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">Bệnh Viện & Resort Thú Y 5 Sao</p>
                <p className="text-xs text-slate-400 mt-1">
                  Khách hàng: <strong className="text-slate-600">{record.ten_khach_hang}</strong>
                </p>
              </div>
            </div>

            <h2 className="text-base font-semibold text-slate-800 mb-1">Bạn cảm thấy thế nào?</h2>
            <p className="text-xs text-slate-500 mb-5">Hãy dành 30 giây đánh giá dịch vụ để giúp phòng khám cải thiện hơn</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Star rating — Google Maps style */}
              <div>
                <div className="flex items-center justify-center gap-1 py-3">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const filled = star <= activeStar;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-125 active:scale-95 cursor-pointer focus:outline-none"
                        aria-label={`${star} sao`}
                      >
                        <Star
                          className={`w-10 h-10 sm:w-12 sm:h-12 transition-all duration-150 ${
                            filled ? 'text-amber-400 fill-amber-400 drop-shadow-sm' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {activeStar > 0 && STAR_LABELS[activeStar] && (
                  <div className="text-center mt-1">
                    <span className="text-sm font-semibold text-slate-700">
                      {STAR_LABELS[activeStar].emoji} {STAR_LABELS[activeStar].text}
                    </span>
                  </div>
                )}
              </div>

              {/* Text feedback */}
              <div>
                <label htmlFor="feedback-text" className="block text-sm font-medium text-slate-700 mb-2">
                  Chia sẻ trải nghiệm của bạn
                </label>
                <textarea
                  id="feedback-text"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  placeholder="Dịch vụ tốt, bác sĩ tận tâm..."
                  className="w-full rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all resize-none shadow-sm"
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Thêm ảnh <span className="text-xs text-slate-400 font-normal">(tùy chọn)</span>
                </label>

                {hinhAnh ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={hinhAnh} alt="Ảnh đánh giá" className="w-full h-44 object-cover" />
                    <button
                      type="button"
                      onClick={() => setHinhAnh('')}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm text-slate-600 font-medium transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4 text-slate-400" />
                      Tải ảnh lên
                    </button>
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm text-slate-600 font-medium transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Camera className="w-4 h-4 text-slate-400" />
                      Chụp ảnh
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileInputChange} />
                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileInputChange} />
                  </div>
                )}

                {isUploadingImage && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-blue-500">
                    <div className="w-3.5 h-3.5 border-2 border-blue-300 border-t-blue-500 rounded-full animate-spin" />
                    <span>Đang tải ảnh...</span>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                  {errorMessage}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage || !rating}
                className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-semibold text-sm shadow-sm transition-all disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <span>Gửi đánh giá</span>
                )}
              </button>

              <p className="text-center text-xs text-slate-400">
                Đánh giá của bạn sẽ được hiển thị trên trang web PetM&M
              </p>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-10 border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} PetM&M — Bệnh Viện Thú Y 5 Sao
      </footer>
    </div>
  );
}
