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
    ten_khach_hang_en: 'Ms. Minh Thu',
    so_dien_thoai: '0908 234 ***',
    so_sao: 5,
    noi_dung:
      'Bé Bông nhà mình bị viêm da cơ địa dai dẳng chữa nhiều nơi không dứt. Đến Pet M&M được bác sĩ soi da và lên phác đồ tắm thủy liệu thảo mộc ozone kết hợp dinh dưỡng. Sau 3 tuần lông bé mọc lại dày mượt, hết hẳn ngứa. Bác sĩ và các bạn điều dưỡng cực kỳ nhẹ nhàng, cưng bé như người nhà!',
    noi_dung_en:
      'My pet Bong suffered from persistent atopic dermatitis that couldn\'t be cured elsewhere. Coming to Pet M&M, the veterinarian examined his skin and designed an ozone herbal hydrotherapy regimen combined with nutrition. After 3 weeks, his coat grew back thick and glossy, with no itching left. The doctors and nurses are extremely gentle, treating him like family!',
    dich_vu_su_dung: 'Spa Thủy Liệu & Trị Liệu Da Thảo Mộc',
    dich_vu_su_dung_en: 'Hydrotherapy & Herbal Skin Therapy',
    hinh_anh_thu_cung: '/pet_golden_spa.jpg',
    ngay_danh_gia: 'Hôm qua',
    ngay_danh_gia_en: 'Yesterday',
    da_xac_thuc: true,
    thu_tu: 1,
    kich_hoat: true,
  },
  {
    id: '2',
    ten_khach_hang: 'Anh Hoàng Nam',
    ten_khach_hang_en: 'Mr. Hoang Nam',
    so_dien_thoai: '0912 678 ***',
    so_sao: 5,
    noi_dung:
      'Bé cún nghịch ngợm nuốt phải dị vật xương gà lúc 11h đêm. Cả nhà hoảng hốt gọi Hotline thì được tiếp nhận cấp cứu ngay lập tức. Phòng mổ áp lực dương vô trùng chuẩn bệnh viện quốc tế, bác sĩ gắp dị vật nội soi siêu êm, sáng hôm sau bé đã tỉnh táo đòi ăn. Cảm ơn đội ngũ bác sĩ Pet M&M rất nhiều!',
    noi_dung_en:
      'My pup playfully swallowed a chicken bone at 11 PM. Our whole family panicked and called the Hotline, and we were received immediately. The positive pressure sterile operating room meets international hospital standards, and the doctor removed the foreign object via endoscopy very smoothly. By the next morning, he was awake and asking for food. Thank you so much, Pet M&M team!',
    dich_vu_su_dung: 'Cấp Cứu Ngoại Khoa & Phẫu Thuật Nội Soi',
    dich_vu_su_dung_en: 'Surgical Emergency & Endoscopy',
    hinh_anh_thu_cung: '/pet_corgi_park.jpg',
    ngay_danh_gia: '3 ngày trước',
    ngay_danh_gia_en: '3 days ago',
    da_xac_thuc: true,
    thu_tu: 2,
    kich_hoat: true,
  },
  {
    id: '3',
    ten_khach_hang: 'Chị Thanh Vân',
    ten_khach_hang_en: 'Ms. Thanh Van',
    so_dien_thoai: '0938 112 ***',
    so_sao: 5,
    noi_dung:
      'Mỗi lần đi công tác xa mình đều gửi bé ở phòng Suite Hoàng Gia của Pet M&M. Khách sạn không hề có mùi hôi, điều hòa lọc khí ion âm 24/24 và có camera trực tiếp để xem bé ngủ. Ngày nào điều dưỡng cũng gửi video chải lông và nựng bé qua Zalo. Rất an tâm!',
    noi_dung_en:
      'Whenever I go on long business trips, I board Miu Miu at Pet M&M\'s Royal Suite. The hotel has absolutely no unpleasant odors, with 24/7 negative ion air purification and live cameras to check on her sleeping. Every day, the nurse sends videos of grooming and cuddling her via Zalo. Truly peace of mind!',
    dich_vu_su_dung: 'Resort & Khách Sạn Thú Cưng 5 Sao',
    dich_vu_su_dung_en: '5-Star Luxury Pet Resort & Hotel',
    hinh_anh_thu_cung: '/pet_cat_resort.jpg',
    ngay_danh_gia: '5 ngày trước',
    ngay_danh_gia_en: '5 days ago',
    da_xac_thuc: true,
    thu_tu: 3,
    kich_hoat: true,
  },
  {
    id: '4',
    ten_khach_hang: 'Cô Mai Lan',
    ten_khach_hang_en: 'Mrs. Mai Lan',
    so_dien_thoai: '0979 554 ***',
    so_sao: 5,
    noi_dung:
      'Bé cún già rồi nên hay bị đau khớp gối đi lại khập khiễng. Được bác sĩ hướng dẫn bơi phục hồi chức năng và châm cứu laser, trộm vía giờ bé chạy nhảy hoạt bát trở lại. Không gian phòng khám rộng rãi, sạch bóng, bác sĩ rất kiên nhẫn và ân cần.',
    noi_dung_en:
      'My dog is getting old, so he often had knee pain and limped. Guided by the veterinarian with aquatic rehabilitation and laser therapy, he is now active and playful again. The clinic space is spacious, spotless, and the doctors are very patient and caring.',
    dich_vu_su_dung: 'Vật Lý Trị Liệu & Phục Hồi Vận Động',
    dich_vu_su_dung_en: 'Physical Therapy & Rehabilitation',
    hinh_anh_thu_cung: '/pet_puppy_play.jpg',
    ngay_danh_gia: '1 tuần trước',
    ngay_danh_gia_en: '1 week ago',
    da_xac_thuc: true,
    thu_tu: 4,
    kich_hoat: true,
  },
  {
    id: '5',
    ten_khach_hang: 'Anh Quốc Huy',
    ten_khach_hang_en: 'Mr. Quoc Huy',
    so_dien_thoai: '0983 998 ***',
    so_sao: 5,
    noi_dung:
      'Dịch vụ tiêm phòng và xét nghiệm máu định kỳ tại Pet M&M cực kỳ bài bản. Có phòng khám riêng cho mèo cách ly khỏi tiếng sủa của chó nên bé mèo đi tiêm không hề bị stress hay run sợ. Giá cả niêm yết rõ ràng, minh bạch từng khoản.',
    noi_dung_en:
      'The vaccination and routine blood testing service at Pet M&M is extremely thorough. There is a dedicated feline room isolated from dog barking, so my cat experienced zero stress or trembling during her shots. Transparent, clearly listed pricing.',
    dich_vu_su_dung: 'Khám Tổng Quát & Tiêm Ngừa Vac-xin',
    dich_vu_su_dung_en: 'General Checkup & Vaccinations',
    hinh_anh_thu_cung: '/pet_kitten_eyes.jpg',
    ngay_danh_gia: '2 tuần trước',
    ngay_danh_gia_en: '2 weeks ago',
    da_xac_thuc: true,
    thu_tu: 5,
    kich_hoat: true,
  },
  {
    id: '6',
    ten_khach_hang: 'Bạn Ngọc Ánh',
    ten_khach_hang_en: 'Ms. Ngoc Anh',
    so_dien_thoai: '0945 332 ***',
    so_sao: 5,
    noi_dung:
      'Trải nghiệm Grooming cắt tỉa tạo hình ở đây xứng đáng 10/10. Bé lông dày mà spa xong thơm tho, mềm như bông gòn. Nhân viên cắt móng và vệ sinh tai siêu kỹ, bé về nhà vui vẻ không hề quấy khóc.',
    noi_dung_en:
      'The grooming and styling experience here deserves a 10/10. My dog has very thick fur, yet after the spa she was fragrant and soft as cotton. The staff trimmed her nails and cleaned her ears with great care; she came home happy and calm.',
    dich_vu_su_dung: 'Spa Cắt Tỉa Tạo Kiểu Grooming 5 Sao',
    dich_vu_su_dung_en: '5-Star Grooming & Styling Spa',
    hinh_anh_thu_cung: '/pet_golden_spa.jpg',
    ngay_danh_gia: '3 tuần trước',
    ngay_danh_gia_en: '3 weeks ago',
    da_xac_thuc: true,
    thu_tu: 6,
    kich_hoat: true,
  },
];

function formatReviewTime(time: string | null | undefined, timeEn: string | null | undefined, isEn: boolean): string {
  if (isEn && timeEn) return timeEn;
  if (!time) return isEn ? 'Recently' : 'Gần đây';
  if (!isEn) return time;
  if (time === 'Hôm qua') return 'Yesterday';
  if (time === 'Hôm nay') return 'Today';
  if (time === 'Gần đây') return 'Recently';
  return time
    .replace(/(\d+)\s*ngày trước/gi, '$1 days ago')
    .replace(/(\d+)\s*tuần trước/gi, '$1 weeks ago')
    .replace(/(\d+)\s*tháng trước/gi, '$1 months ago')
    .replace(/1\s*days ago/gi, '1 day ago')
    .replace(/1\s*weeks ago/gi, '1 week ago')
    .replace(/1\s*months ago/gi, '1 month ago');
}

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
      aria-label={isEn ? 'Client Testimonials & Feedback' : 'Đánh giá từ khách hàng'}
      className="relative py-14 sm:py-20 overflow-hidden bg-[#FAFBF9] border-b border-slate-200/80"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header tinh gọn: Tiêu đề */}
        <div className="mb-8 sm:mb-10 text-center sm:text-left">
          <ScrollRevealTitle>
            <h2 className="font-editorial text-2xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-slate-900 leading-[1.2]">
              {isEn ? 'Client Testimonials & Feedback' : 'Đánh giá từ khách hàng'}
            </h2>
          </ScrollRevealTitle>
        </div>

        {/* Container Carousel có nút điều hướng ở giữa 2 bên */}
        <div className="relative group/carousel">
          {/* Nút lướt qua trái (nằm ở giữa bên trái slider) */}
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label={isEn ? 'Previous reviews' : 'Xem đánh giá trước'}
            className={`absolute -left-2 sm:-left-5 lg:-left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border transition-all cursor-pointer shadow-md backdrop-blur-xs ${
              canScrollLeft
                ? 'bg-white/95 border-slate-200 text-slate-800 hover:bg-[#2D5A27] hover:border-[#2D5A27] hover:text-white hover:scale-105 active:scale-95 shadow-lg'
                : 'bg-white/60 border-slate-200 text-slate-300 opacity-0 pointer-events-none'
            }`}
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Nút lướt qua phải (nằm ở giữa bên phải slider) */}
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label={isEn ? 'Next reviews' : 'Xem đánh giá tiếp theo'}
            className={`absolute -right-2 sm:-right-5 lg:-right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border transition-all cursor-pointer shadow-md backdrop-blur-xs ${
              canScrollRight
                ? 'bg-white/95 border-slate-200 text-slate-800 hover:bg-[#2D5A27] hover:border-[#2D5A27] hover:text-white hover:scale-105 active:scale-95 shadow-lg'
                : 'bg-white/60 border-slate-200 text-slate-300 opacity-0 pointer-events-none'
            }`}
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

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
                    &ldquo;{(isEn && rev.noi_dung_en) ? rev.noi_dung_en : rev.noi_dung}&rdquo;
                  </p>
                </div>

                {/* 3. Tên chủ, SĐT ẩn 4 số cuối & Avatar */}
                <div className="flex items-center gap-3 pt-3.5 border-t border-slate-100">
                  {/* Avatar thú cưng / khách hàng */}
                  <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 bg-slate-100 border border-slate-200 shadow-2xs">
                    <Image
                      src={getAssetUrl(rev.hinh_anh_thu_cung || '/pet_golden_spa.jpg')}
                      alt={(isEn && rev.ten_khach_hang_en) ? rev.ten_khach_hang_en : rev.ten_khach_hang}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {(isEn && rev.ten_khach_hang_en) ? rev.ten_khach_hang_en : rev.ten_khach_hang}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-light mt-0.5">
                      <span className="font-mono font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {rev.so_dien_thoai}
                      </span>
                      {(rev.ngay_danh_gia || rev.ngay_danh_gia_en) && (
                        <>
                          <span>•</span>
                          <span>{formatReviewTime(rev.ngay_danh_gia, rev.ngay_danh_gia_en, isEn)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
