'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Star,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { supabase, DanhGiaRecord } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import ScrollRevealTitle from './ScrollRevealTitle';
import { getAssetUrl } from '@/lib/assets';

// Danh sách đánh giá chuẩn dự phòng (hiển thị tức thì)
const DEFAULT_REVIEWS: DanhGiaRecord[] = [
  {
    id: '1',
    ten_khach_hang: 'Chị Minh Thư',
    so_dien_thoai: '0908 234 ***',
    so_sao: 5,
    noi_dung:
      'Bé Bông nhà mình bị viêm da cơ địa dai dẳng chữa nhiều nơi không dứt. Đến Pet M&M được bác sĩ soi da và lên phác đồ tắm thủy liệu thảo mộc ozone kết hợp dinh dưỡng. Sau 3 tuần lông bé mọc lại dày mượt, hết hẳn ngứa. Bác sĩ và các bạn điều dưỡng cực kỳ nhẹ nhàng, cưng bé như người nhà!',
    hinh_anh_thu_cung: '/pet_golden_spa.jpg',
    ngay_danh_gia: 'Hôm qua',
    da_xac_thuc: true,
    thu_tu: 1,
    kich_hoat: true,
  },
  {
    id: '2',
    ten_khach_hang: 'Anh Hoàng Nam',
    so_dien_thoai: '0912 678 ***',
    so_sao: 5,
    noi_dung:
      'Bé cún nghịch ngợm nuốt phải dị vật xương gà lúc 11h đêm. Cả nhà hoảng hốt gọi Hotline thì được tiếp nhận cấp cứu ngay lập tức. Phòng mổ áp lực dương vô trùng chuẩn bệnh viện quốc tế, bác sĩ gắp dị vật nội soi siêu êm, sáng hôm sau bé đã tỉnh táo đòi ăn. Cảm ơn đội ngũ bác sĩ Pet M&M rất nhiều!',
    hinh_anh_thu_cung: '/pet_corgi_park.jpg',
    ngay_danh_gia: '3 ngày trước',
    da_xac_thuc: true,
    thu_tu: 2,
    kich_hoat: true,
  },
  {
    id: '3',
    ten_khach_hang: 'Chị Thanh Vân',
    so_dien_thoai: '0938 112 ***',
    so_sao: 5,
    noi_dung:
      'Mỗi lần đi công tác xa mình đều gửi bé ở phòng Suite Hoàng Gia của Pet M&M. Khách sạn không hề có mùi hôi, điều hòa lọc khí ion âm 24/24 và có camera trực tiếp để xem bé ngủ. Ngày nào điều dưỡng cũng gửi video chải lông và nựng bé qua Zalo. Rất an tâm!',
    hinh_anh_thu_cung: '/pet_cat_resort.jpg',
    ngay_danh_gia: '5 ngày trước',
    da_xac_thuc: true,
    thu_tu: 3,
    kich_hoat: true,
  },
  {
    id: '4',
    ten_khach_hang: 'Cô Mai Lan',
    so_dien_thoai: '0979 554 ***',
    so_sao: 5,
    noi_dung:
      'Bé cún già rồi nên hay bị đau khớp gối đi lại khập khiễng. Được bác sĩ hướng dẫn bơi phục hồi chức năng và châm cứu laser, trộm vía giờ bé chạy nhảy hoạt bát trở lại. Không gian phòng khám rộng rãi, sạch bóng, bác sĩ rất kiên nhẫn và ân cần.',
    hinh_anh_thu_cung: '/pet_puppy_play.jpg',
    ngay_danh_gia: '1 tuần trước',
    da_xac_thuc: true,
    thu_tu: 4,
    kich_hoat: true,
  },
  {
    id: '5',
    ten_khach_hang: 'Anh Quốc Huy',
    so_dien_thoai: '0983 998 ***',
    so_sao: 5,
    noi_dung:
      'Dịch vụ tiêm phòng và xét nghiệm máu định kỳ tại Pet M&M cực kỳ bài bản. Có phòng khám riêng cho mèo cách ly khỏi tiếng sủa của chó nên bé mèo đi tiêm không hề bị stress hay run sợ. Giá cả niêm yết rõ ràng, minh bạch từng khoản.',
    hinh_anh_thu_cung: '/pet_kitten_eyes.jpg',
    ngay_danh_gia: '2 tuần trước',
    da_xac_thuc: true,
    thu_tu: 5,
    kich_hoat: true,
  },
  {
    id: '6',
    ten_khach_hang: 'Bạn Ngọc Ánh',
    so_dien_thoai: '0945 332 ***',
    so_sao: 5,
    noi_dung:
      'Trải nghiệm Grooming cắt tỉa tạo hình ở đây xứng đáng 10/10. Bé lông dày mà spa xong thơm tho, mềm như bông gòn. Nhân viên cắt móng và vệ sinh tai siêu kỹ, bé về nhà vui vẻ không hề quấy khóc.',
    hinh_anh_thu_cung: '/pet_golden_spa.jpg',
    ngay_danh_gia: '3 tuần trước',
    da_xac_thuc: true,
    thu_tu: 6,
    kich_hoat: true,
  },
];

export default function ReviewsSection() {
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const [reviews, setReviews] = useState<DanhGiaRecord[]>(DEFAULT_REVIEWS);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Tải danh sách đánh giá từ Supabase và lắng nghe realtime
  useEffect(() => {
    async function fetchReviews() {
      try {
        const { data, error } = await supabase
          .from('danh_gia')
          .select('*')
          .eq('kich_hoat', true)
          .order('thu_tu', { ascending: true });

        if (!error && data && data.length > 0) {
          setReviews(data);
        }
      } catch (err) {
        console.warn('Lỗi tải đánh giá từ Supabase, dùng dữ liệu mặc định:', err);
      }
    }

    fetchReviews();

    const channel = supabase
      .channel('danh_gia_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'danh_gia' },
        () => {
          fetchReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [reviews]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 360;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 350);
  };

  return (
    <section
      id="reviews"
      aria-label="Đánh giá từ khách hàng"
      className="relative py-14 sm:py-20 overflow-hidden bg-[#FAFBF9] border-b border-slate-200/80"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header tinh gọn: Tiêu đề bên trái, nút lướt trái/phải bên phải */}
        <div className="flex items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <ScrollRevealTitle>
              <h2 className="font-editorial text-2xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-slate-900 leading-[1.2]">
                {isEn ? 'Client Testimonials & Feedback' : 'Đánh giá từ khách hàng'}
              </h2>
            </ScrollRevealTitle>
          </div>

          {/* Nút lướt qua trái / phải */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Xem đánh giá trước"
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                canScrollLeft
                  ? 'bg-white border-slate-300 text-slate-800 hover:bg-[#2D5A27] hover:border-[#2D5A27] hover:text-white shadow-xs'
                  : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Xem đánh giá tiếp theo"
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                canScrollRight
                  ? 'bg-white border-slate-300 text-slate-800 hover:bg-[#2D5A27] hover:border-[#2D5A27] hover:text-white shadow-xs'
                  : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Danh sách thẻ đánh giá lướt ngang (Scrollable & Swipeable) */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="group relative bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between min-w-[290px] sm:min-w-[340px] max-w-[340px] sm:max-w-[360px] snap-start shrink-0"
            >
              <div>
                {/* 1. Số sao & Xác thực */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.so_sao || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#FFB800] text-[#FFB800]" />
                    ))}
                  </div>

                  {rev.da_xac_thuc && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{isEn ? 'Verified' : 'Đã xác thực'}</span>
                    </span>
                  )}
                </div>

                {/* 2. Nội dung nhận xét */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-light mb-5 line-clamp-5">
                  &ldquo;{rev.noi_dung}&rdquo;
                </p>
              </div>

              {/* 3. Tên chủ, SĐT ẩn 4 số cuối & Avatar */}
              <div className="flex items-center gap-3 pt-3.5 border-t border-slate-100">
                {/* Avatar thú cưng / khách hàng */}
                <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 bg-slate-100 border border-slate-200 shadow-2xs">
                  <Image
                    src={getAssetUrl(rev.hinh_anh_thu_cung || '/pet_golden_spa.jpg')}
                    alt={rev.ten_khach_hang}
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {rev.ten_khach_hang}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-light mt-0.5">
                    <span className="font-mono font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {rev.so_dien_thoai}
                    </span>
                    {rev.ngay_danh_gia && (
                      <>
                        <span>•</span>
                        <span>{rev.ngay_danh_gia}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
