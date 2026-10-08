'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  CheckCircle2,
  Upload,
  Camera,
  X,
  MapPin,
  ThumbsUp,
} from 'lucide-react';
import { supabase, YeuCauDanhGiaRecord } from '@/lib/supabase';
import { useSystemConfig } from '@/context/SystemConfigContext';
import PetLogo from '@/components/PetLogo';

interface Props {
  initialRecord: YeuCauDanhGiaRecord;
  branchAddress?: string;
  branchCoverImage?: string;
}

const STAR_LABELS: Record<number, { text: string; emoji: string; color: string }> = {
  1: { text: 'Rất không hài lòng', emoji: '😞', color: 'text-red-500' },
  2: { text: 'Chưa hài lòng', emoji: '😕', color: 'text-orange-500' },
  3: { text: 'Bình thường', emoji: '😐', color: 'text-yellow-500' },
  4: { text: 'Hài lòng', emoji: '😊', color: 'text-blue-500' },
  5: { text: 'Rất hài lòng!', emoji: '😄', color: 'text-green-600' },
};

export default function DanhGiaDichVuClient({ initialRecord, branchAddress, branchCoverImage }: Props) {
  const { config } = useSystemConfig();
  const logoUrl = config?.logo_website || config?.logo_favicon || '/logo-favicon.png';
  const [branchImage, setBranchImage] = useState<string>(branchCoverImage || '');

  // Tải hình ảnh bìa của chi nhánh nếu chưa có hoặc khi cơ sở thay đổi
  useEffect(() => {
    if (branchCoverImage) {
      setBranchImage(branchCoverImage);
      return;
    }
    const targetBranch = initialRecord?.co_so;
    if (!targetBranch) return;

    supabase
      .from('chi_nhanh')
      .select('anh_dai_dien, anh_goc')
      .ilike('ten_chi_nhanh', `%${targetBranch}%`)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.anh_dai_dien || data?.anh_goc) {
          setBranchImage(data.anh_dai_dien || data.anh_goc || '');
        }
      });
  }, [branchCoverImage, initialRecord?.co_so]);

  const [record, setRecord] = useState<YeuCauDanhGiaRecord>(initialRecord);
  const isAlreadySubmitted = record.trang_thai === 'da_danh_gia';

  const [rating, setRating] = useState<number>(record.so_sao || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  // Lắng nghe Realtime cập nhật trạng thái phiếu đánh giá
  useEffect(() => {
    if (!record?.ma_danh_gia) return;

    const channel = supabase
      .channel(`review_rt_${record.ma_danh_gia}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'yeu_cau_danh_gia',
          filter: `ma_danh_gia=eq.${record.ma_danh_gia}`,
        },
        (payload) => {
          if (payload.new) {
            const updated = payload.new as YeuCauDanhGiaRecord;
            setRecord((prev) => ({ ...prev, ...updated }));
            if (updated.trang_thai === 'da_danh_gia') {
              setIsSuccess(true);
            }
          }
        }
      )
      .subscribe();

    const bcChannel = supabase
      .channel('taodanhgia_live_sync')
      .on('broadcast', { event: 'review_completed' }, (e: any) => {
        if (e.payload?.reviewCode === record.ma_danh_gia || e.payload?.id === record.id) {
          setIsSuccess(true);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(bcChannel);
    };
  }, [record?.ma_danh_gia, record?.id]);

  const getDisplayImageUrl = (url?: string | null): string => {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed?.img && typeof parsed.img === 'string') {
          return parsed.img.trim();
        }
      } catch {}
      return '';
    }
    return trimmed;
  };

  const [feedback, setFeedback] = useState<string>(record.noi_dung_danh_gia || '');
  const [hinhAnh, setHinhAnh] = useState<string>(
    getDisplayImageUrl(record.hinh_anh)
  );
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(isAlreadySubmitted);

  // Cập nhật tiêu đề tab trình duyệt theo trạng thái: Đánh giá dịch vụ -> Xin cảm ơn
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const targetTitle = isSuccess ? 'PetM&M - Xin cảm ơn' : 'PetM&M - Đánh giá dịch vụ';
    const apply = () => {
      if (document.title !== targetTitle) {
        document.title = targetTitle;
      }
    };
    apply();
    const timers = [
      setTimeout(apply, 100),
      setTimeout(apply, 500),
      setTimeout(apply, 1000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [isSuccess]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const activeStar = hoverRating || rating;

  const handleImageFile = async (file: File) => {
    if (!file) return;
    setIsUploadingImage(true);
    setErrorMessage('');

    // Xem trước ảnh ngay lập tức bằng Base64 để không bị chậm trễ
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setHinhAnh(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `danh_gia/review_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('hinh_anh')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from('hinh_anh').getPublicUrl(filePath);
        if (urlData?.publicUrl) {
          setHinhAnh(urlData.publicUrl);
        }
      }
    } catch (err) {
      console.warn('Storage upload fallback to base64 preview:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  // 1. Bấm cái gửi luôn và chạy ngầm, không để khách hàng đợi
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!rating || rating < 4) {
      setErrorMessage('Vui lòng chọn 4 hoặc 5 sao để gửi đánh giá.');
      return;
    }

    const currentImg = hinhAnh || getDisplayImageUrl(record.hinh_anh);

    // Chuyển sang màn hình thành công NGAY LẬP TỨC (Optimistic UI)
    const optimisticRecord: YeuCauDanhGiaRecord = {
      ...record,
      trang_thai: 'da_danh_gia',
      so_sao: rating,
      noi_dung_danh_gia: feedback,
      hinh_anh: currentImg || null,
    };
    setRecord(optimisticRecord);
    setIsSuccess(true);
    setIsSubmitting(false);

    // Cuộn mượt lên đầu
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Chạy ngầm gửi API trong background
    fetch(`/api/review-requests/${encodeURIComponent(record.ma_danh_gia)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        so_sao: rating,
        noi_dung_danh_gia: feedback,
        hinh_anh: currentImg || null,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const finalServerImg = getDisplayImageUrl(json.data.hinh_anh) || currentImg;
          setRecord({
            ...json.data,
            hinh_anh: finalServerImg,
          });
        }
      })
      .catch((err: any) => {
        console.error('[Background Submit Review Error]:', err);
      });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <main className="max-w-lg mx-auto px-4 py-6 sm:py-8">
        {/* Brand Logo Header */}
        <div className="text-center mb-6">
          <div className="inline-block">
            <PetLogo size="default" showSubline={false} />
          </div>
        </div>

        {isSuccess ? (
          /* THANK YOU SCREEN */
          <div className="text-center py-4 animate-fade-in bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5 shadow-sm">
              <CheckCircle2 className="w-9 h-9 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">
              Cảm ơn bạn đã đánh giá!
            </h1>
            <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
              PetM&M cảm ơn <strong className="text-slate-700">{record.ten_khach_hang}</strong> đã dành thời gian chia sẻ trải nghiệm. Ý kiến của bạn giúp chúng tôi phục vụ tốt hơn.
            </p>

            {/* Rating summary card */}
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

              {/* 2. Hiển thị ảnh đính kèm không bị vỡ/lỗi */}
              {(() => {
                const displayImg = getDisplayImageUrl(record.hinh_anh) || hinhAnh;
                if (!displayImg) return null;
                return (
                  <div className="rounded-xl overflow-hidden border border-slate-200 mt-3 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={displayImg}
                      alt="Ảnh đính kèm"
                      className="w-full max-h-56 object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).parentElement?.classList.add('hidden');
                      }}
                    />
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <ThumbsUp className="w-4 h-4 text-blue-500" />
              <span>Đánh giá của bạn đã được ghi nhận</span>
            </div>
          </div>
        ) : (
          /* REVIEW FORM */
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
            {/* Location header with Branch Cover Image */}
            <div className="flex items-start gap-3.5 mb-6 pb-5 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/90 p-0.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                {branchImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={branchImage}
                    alt={record.co_so || 'Chi nhánh PetM&M'}
                    className="w-full h-full object-cover rounded-xl"
                    onError={() => setBranchImage('')}
                  />
                ) : logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt="Logo PetM&M"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                    <MapPin className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-slate-900 text-base leading-tight">
                  {record.co_so || 'Bệnh Viện Thú Y PetM&M'}
                </h1>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {branchAddress || '19 Đ. Số 1, Phường Phước Long, TP. Thủ Đức, TP. Hồ Chí Minh'}
                </p>
                <p className="text-xs text-slate-400 mt-1.5">
                  Khách hàng: <strong className="text-slate-700 font-semibold">{record.ten_khach_hang}</strong>
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

                {/* Thông báo chân thành khi khách chọn 1, 2, 3 sao */}
                {activeStar > 0 && activeStar <= 3 && (
                  <div className="mt-3.5 p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-left shadow-xs transition-all animate-fade-in">
                    <div className="flex items-start gap-2.5">
                      <span className="text-xl shrink-0 leading-tight">💬</span>
                      <div className="space-y-1">
                        <p className="font-semibold text-amber-950 text-xs sm:text-sm leading-snug">
                          PetM&M thành thật xin lỗi vì trải nghiệm chưa trọn vẹn của bạn và bé cưng!
                        </p>
                        <p className="text-amber-800 text-xs sm:text-xs leading-relaxed">
                          Rất mong bạn chia sẻ cụ thể điều chưa hài lòng ở bên dưới để Ban Quản Lý hỗ trợ và khắc phục ngay nhé.
                        </p>
                      </div>
                    </div>
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
                  placeholder={
                    activeStar > 0 && activeStar <= 3
                      ? "Chia sẻ cụ thể điều bạn chưa hài lòng để Ban Quản Lý liên hệ hỗ trợ bạn..."
                      : "Dịch vụ tốt, bác sĩ tận tâm..."
                  }
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
                    <img
                      src={hinhAnh}
                      alt="Ảnh đánh giá"
                      className="w-full h-44 object-cover"
                      onError={() => setHinhAnh('')}
                    />
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

              {/* Submit - Chỉ cho phép gửi khi chọn 4 hoặc 5 sao */}
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage || !rating || rating < 4}
                className={`w-full py-3.5 rounded-full font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${
                  !rating || rating < 4
                    ? 'bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed pointer-events-none'
                    : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-[0.99]'
                }`}
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
    </div>
  );
}
