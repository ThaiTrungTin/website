'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import {
  Star,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ThumbsUp,
  Maximize2,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { supabase, DanhGiaRecord } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import ScrollRevealTitle from './ScrollRevealTitle';
import { getAssetUrl } from '@/lib/assets';

// Danh sách đánh giá chuẩn dự phòng
const DEFAULT_REVIEWS: DanhGiaRecord[] = [
  {
    id: '1',
    ten_khach_hang: 'Chị Minh Thư',
    ten_khach_hang_en: 'Ms. Minh Thu',
    so_dien_thoai: '0908234567',
    so_sao: 5,
    noi_dung:
      'Bé Bông nhà mình bị viêm da cơ địa dai dẳng chữa nhiều nơi không dứt. Đến PetM&M được bác sĩ soi da và lên phác đồ tắm thủy liệu thảo mộc ozone kết hợp dinh dưỡng. Sau 3 tuần lông bé mọc lại dày mượt, hết hẳn ngứa. Bác sĩ và các bạn điều dưỡng cực kỳ nhẹ nhàng, cưng bé như người nhà!',
    noi_dung_en:
      'My pet Bong suffered from persistent atopic dermatitis that couldn\'t be cured elsewhere. Coming to PetM&M, the veterinarian examined his skin and designed an ozone herbal hydrotherapy regimen combined with nutrition. After 3 weeks, his coat grew back thick and glossy, with no itching left. The doctors and nurses are extremely gentle, treating him like family!',
    dich_vu_su_dung: 'Spa Thủy Liệu & Trị Liệu Da Thảo Mộc',
    dich_vu_su_dung_en: 'Hydrotherapy & Herbal Skin Therapy',
    chi_nhanh: 'Chi nhánh Quận 7',
    hinh_anh_thu_cung: '/pet_golden_spa.jpg',
    ngay_danh_gia: '2026-10-01',
    ngay_danh_gia_en: '2026-10-01',
    da_xac_thuc: true,
    thu_tu: 1,
    kich_hoat: true,
  },
  {
    id: '2',
    ten_khach_hang: 'Anh Hoàng Nam',
    ten_khach_hang_en: 'Mr. Hoang Nam',
    so_dien_thoai: '0912678901',
    so_sao: 5,
    noi_dung:
      'Bé cún nghịch ngợm nuốt phải dị vật xương gà lúc 11h đêm. Cả nhà hoảng hốt gọi Hotline thì được tiếp nhận cấp cứu ngay lập tức. Phòng mổ áp lực dương vô trùng chuẩn bệnh viện quốc tế, bác sĩ gắp dị vật nội soi siêu êm, sáng hôm sau bé đã tỉnh táo đòi ăn. Cảm ơn đội ngũ bác sĩ PetM&M rất nhiều!',
    noi_dung_en:
      'My pup playfully swallowed a chicken bone at 11 PM. Our whole family panicked and called the Hotline, and we were received immediately. The positive pressure sterile operating room meets international hospital standards, and the doctor removed the foreign object via endoscopy very smoothly. By the next morning, he was awake and asking for food. Thank you so much, PetM&M team!',
    dich_vu_su_dung: 'Cấp Cứu Ngoại Khoa & Phẫu Thuật Nội Soi',
    dich_vu_su_dung_en: 'Surgical Emergency & Endoscopy',
    chi_nhanh: 'Chi nhánh Quận 1',
    hinh_anh_thu_cung: '/pet_corgi_park.jpg',
    ngay_danh_gia: '2026-09-29',
    ngay_danh_gia_en: '2026-09-29',
    da_xac_thuc: true,
    thu_tu: 2,
    kich_hoat: true,
  },
  {
    id: '3',
    ten_khach_hang: 'Chị Thanh Vân',
    ten_khach_hang_en: 'Ms. Thanh Van',
    so_dien_thoai: '0938112345',
    so_sao: 5,
    noi_dung:
      'Mỗi lần đi công tác xa mình đều gửi bé ở phòng Suite Hoàng Gia của PetM&M. Khách sạn không hề có mùi hôi, điều hòa lọc khí ion âm 24/24 và có camera trực tiếp để xem bé ngủ. Ngày nào điều dưỡng cũng gửi video chải lông và nựng bé qua Zalo. Rất an tâm!',
    noi_dung_en:
      'Whenever I go on long business trips, I board Miu Miu at PetM&M\'s Royal Suite. The hotel has absolutely no unpleasant odors, with 24/7 negative ion air purification and live cameras to check on her sleeping. Every day, the nurse sends videos of grooming and cuddling her via Zalo. Truly peace of mind!',
    dich_vu_su_dung: 'Resort & Khách Sạn Thú Cưng 5 Sao',
    dich_vu_su_dung_en: '5-Star Luxury Pet Resort & Hotel',
    chi_nhanh: 'Chi nhánh Quận 2',
    hinh_anh_thu_cung: '/pet_cat_resort.jpg',
    ngay_danh_gia: '2026-09-27',
    ngay_danh_gia_en: '2026-09-27',
    da_xac_thuc: true,
    thu_tu: 3,
    kich_hoat: true,
  },
  {
    id: '4',
    ten_khach_hang: 'Cô Mai Lan',
    ten_khach_hang_en: 'Mrs. Mai Lan',
    so_dien_thoai: '0979554321',
    so_sao: 4,
    noi_dung:
      'Bé cún già rồi nên hay bị đau khớp gối đi lại khập khiễng. Được bác sĩ hướng dẫn bơi phục hồi chức năng và châm cứu laser, trộm vía giờ bé chạy nhảy hoạt bát trở lại. Không gian phòng khám rộng rãi, sạch bóng, bác sĩ rất kiên nhẫn và ân cần.',
    noi_dung_en:
      'My dog is getting old, so he often had knee pain and limped. Guided by the veterinarian with aquatic rehabilitation and laser therapy, he is now active and playful again. The clinic space is spacious, spotless, and the doctors are very patient and caring.',
    dich_vu_su_dung: 'Vật Lý Trị Liệu & Phục Hồi Vận Động',
    dich_vu_su_dung_en: 'Physical Therapy & Rehabilitation',
    chi_nhanh: 'Chi nhánh Quận 7',
    hinh_anh_thu_cung: '/pet_puppy_play.jpg',
    ngay_danh_gia: '2026-09-25',
    ngay_danh_gia_en: '2026-09-25',
    da_xac_thuc: true,
    thu_tu: 4,
    kich_hoat: true,
  },
  {
    id: '5',
    ten_khach_hang: 'Anh Quốc Huy',
    ten_khach_hang_en: 'Mr. Quoc Huy',
    so_dien_thoai: '0983998765',
    so_sao: 5,
    noi_dung:
      'Dịch vụ tiêm phòng và xét nghiệm máu định kỳ tại PetM&M cực kỳ bài bản. Có phòng khám riêng cho mèo cách ly khỏi tiếng sủa của chó nên bé mèo đi tiêm không hề bị stress hay run sợ. Giá cả niêm yết rõ ràng, minh bạch từng khoản.',
    noi_dung_en:
      'The vaccination and routine blood testing service at PetM&M is extremely thorough. There is a dedicated feline room isolated from dog barking, so my cat experienced zero stress or trembling during her shots. Transparent, clearly listed pricing.',
    dich_vu_su_dung: 'Khám Tổng Quát & Tiêm Ngừa Vac-xin',
    dich_vu_su_dung_en: 'General Checkup & Vaccinations',
    chi_nhanh: 'Chi nhánh Quận 1',
    hinh_anh_thu_cung: '/pet_kitten_eyes.jpg',
    ngay_danh_gia: '2026-09-18',
    ngay_danh_gia_en: '2026-09-18',
    da_xac_thuc: true,
    thu_tu: 5,
    kich_hoat: true,
  },
  {
    id: '6',
    ten_khach_hang: 'Bạn Ngọc Ánh',
    ten_khach_hang_en: 'Ms. Ngoc Anh',
    so_dien_thoai: '0945332112',
    so_sao: 5,
    noi_dung:
      'Trải nghiệm Grooming cắt tỉa tạo hình ở đây xứng đáng 10/10. Bé lông dày mà spa xong thơm tho, mềm như bông gòn. Nhân viên cắt móng và vệ sinh tai siêu kỹ, bé về nhà vui vẻ không hề quấy khóc.',
    noi_dung_en:
      'The grooming and styling experience here deserves a 10/10. My dog has very thick fur, yet after the spa she was fragrant and soft as cotton. The staff trimmed her nails and cleaned her ears with great care; she came home happy and calm.',
    dich_vu_su_dung: 'Spa Cắt Tỉa Tạo Kiểu Grooming 5 Sao',
    dich_vu_su_dung_en: '5-Star Grooming & Styling Spa',
    chi_nhanh: 'Chi nhánh Quận 3',
    hinh_anh_thu_cung: null,
    ngay_danh_gia: '2026-09-11',
    ngay_danh_gia_en: '2026-09-11',
    da_xac_thuc: true,
    thu_tu: 6,
    kich_hoat: true,
  },
];

// Bảng màu avatar phong cách Google Maps
const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-indigo-600',
  'bg-rose-600',
  'bg-teal-600',
  'bg-violet-600',
];

function getAvatarInitial(name: string): string {
  const clean = (name || '').trim();
  if (!clean) return 'K';
  const parts = clean.split(/\s+/);
  const lastWord = parts[parts.length - 1];
  return (lastWord.charAt(0) || clean.charAt(0) || 'K').toUpperCase();
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Tự động ẩn 4 số cuối SĐT và để các số viết liền nhau không bị ngắt dòng
function formatMaskedPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  // Bỏ hết khoảng trắng, gạch nối, dấu hoa thị cũ
  const digitsOnly = phone.replace(/[\s\-_*]/g, '');
  if (digitsOnly.length >= 7) {
    return `${digitsOnly.slice(0, -4)}****`;
  }
  const clean = phone.replace(/\s+/g, '');
  if (clean.length > 4) {
    return `${clean.slice(0, -4)}****`;
  }
  return clean;
}

function formatReviewTime(time: string | null | undefined, timeEn: string | null | undefined, isEn: boolean): string {
  const raw = isEn && timeEn ? timeEn : time || timeEn;
  if (!raw) return isEn ? 'Recently' : 'Mới đây';

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${d}/${m}/${y}`;
  }

  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(raw)) {
    return raw;
  }

  return raw;
}

export default function ReviewsSection() {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [reviews, setReviews] = useState<DanhGiaRecord[]>(DEFAULT_REVIEWS);

  // 2 trường lọc riêng biệt: Lọc số sao & Lọc hình ảnh
  const [starFilter, setStarFilter] = useState<string>('all');
  const [imageFilter, setImageFilter] = useState<string>('all');

  // Mở rộng Xem thêm / Thu gọn cho từng review
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  // Lightbox xem ảnh to toàn màn hình
  const [lightboxData, setLightboxData] = useState<{
    url: string;
    author: string;
    content: string;
    stars: number;
  } | null>(null);

  // Lượt thích (Hữu ích kiểu Google Maps)
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [userLikedMap, setUserLikedMap] = useState<Record<string, boolean>>({});

  // Cuộn ngang
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
          .order('ngay_danh_gia', { ascending: false });

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

  // Tính số lượng thống kê cho 2 trường lọc
  const stats = useMemo(() => {
    const total = reviews.length;
    let sum = 0;
    let c5 = 0;
    let c4 = 0;
    let c3 = 0;
    let c2 = 0;
    let c1 = 0;
    let hasImg = 0;

    reviews.forEach((r) => {
      const s = Number(r.so_sao) || 5;
      sum += s;
      if (s === 5) c5++;
      else if (s === 4) c4++;
      else if (s === 3) c3++;
      else if (s === 2) c2++;
      else if (s === 1) c1++;

      if (r.hinh_anh_thu_cung && r.hinh_anh_thu_cung.trim() !== '') {
        hasImg++;
      }
    });

    const avg = total > 0 ? (sum / total).toFixed(1) : '5.0';
    const noImg = total - hasImg;

    return { total, avg, c5, c4, c3, c2, c1, hasImg, noImg };
  }, [reviews]);

  // Lọc đánh giá kết hợp 2 trường: Số sao & Hình ảnh
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const s = Number(r.so_sao) || 5;
      const hasImg = Boolean(r.hinh_anh_thu_cung && r.hinh_anh_thu_cung.trim() !== '');

      // 1. Lọc theo sao
      if (starFilter !== 'all' && s !== Number(starFilter)) {
        return false;
      }

      // 2. Lọc theo hình ảnh
      if (imageFilter === 'has_image' && !hasImg) {
        return false;
      }
      if (imageFilter === 'no_image' && hasImg) {
        return false;
      }

      return true;
    });
  }, [reviews, starFilter, imageFilter]);

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
  }, [filteredReviews]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 350);
  };

  const toggleExpand = (id: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleLike = (id: string) => {
    setUserLikedMap((prev) => {
      const isCurrentlyLiked = !!prev[id];
      setLikesMap((countPrev) => ({
        ...countPrev,
        [id]: (countPrev[id] || 0) + (isCurrentlyLiked ? -1 : 1),
      }));
      return {
        ...prev,
        [id]: !isCurrentlyLiked,
      };
    });
  };

  // Đóng lightbox với phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxData(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section
      id="reviews"
      aria-label={isEn ? 'Client Testimonials & Feedback' : 'Đánh giá từ khách hàng'}
      className="relative py-8 sm:py-12 overflow-hidden bg-[#FAFBF9] border-b border-slate-200/80"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header gom gọn trên 1 hàng duy nhất: Tiêu đề + Số sao TB + 2 Droplists */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
          <ScrollRevealTitle>
            <div className="flex items-center flex-wrap gap-x-2 sm:gap-x-3 gap-y-1">
              <h2 className="font-editorial text-lg sm:text-2xl font-normal tracking-tight text-slate-900 leading-none whitespace-nowrap">
                {isEn ? 'Client Testimonials' : 'Đánh giá từ khách hàng'}
              </h2>

              <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium whitespace-nowrap">
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 hidden xs:inline">{isEn ? 'Rating:' : 'Số sao TB:'}</span>
                <span className="font-bold text-amber-600">{stats.avg}</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${
                        s <= Math.round(Number(stats.avg))
                          ? 'fill-[#fbbc04] text-[#fbbc04]'
                          : 'fill-slate-200 text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-slate-400">({stats.total})</span>
              </div>
            </div>
          </ScrollRevealTitle>

          {/* 2 trường lọc: Lọc số sao & Lọc hình ảnh nhỏ gọn */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            {/* Trường 1: Lọc số sao (Có ngôi sao ★, không dùng chữ Sao) */}
            <div className="relative inline-flex items-center">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 absolute left-2.5 pointer-events-none" />
              <select
                id="review-star-filter"
                aria-label="Lọc theo số sao"
                value={starFilter}
                onChange={(e) => setStarFilter(e.target.value)}
                className="text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg pl-7 pr-7 py-1.5 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer appearance-none transition-all"
              >
                <option value="all">
                  {isEn ? 'All stars' : 'Tất cả số sao'} ({stats.total})
                </option>
                <option value="5">5 ★★★★★ ({stats.c5})</option>
                <option value="4">4 ★★★★ ({stats.c4})</option>
                <option value="3">3 ★★★ ({stats.c3})</option>
                <option value="2">2 ★★ ({stats.c2})</option>
                <option value="1">1 ★ ({stats.c1})</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
            </div>

            {/* Trường 2: Lọc hình ảnh */}
            <div className="relative inline-flex items-center">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
              <select
                id="review-image-filter"
                aria-label="Lọc theo hình ảnh"
                value={imageFilter}
                onChange={(e) => setImageFilter(e.target.value)}
                className="text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg pl-7 pr-7 py-1.5 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer appearance-none transition-all"
              >
                <option value="all">
                  {isEn ? 'All photos' : 'Tất cả hình ảnh'}
                </option>
                <option value="has_image">
                  {isEn ? 'With photos' : 'Có hình ảnh'} ({stats.hasImg})
                </option>
                <option value="no_image">
                  {isEn ? 'No photos' : 'Không có hình ảnh'} ({stats.noImg})
                </option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Khung Carousel Cuộn ngang với nút điều hướng */}
        <div className="relative group/carousel">
          {/* Nút lướt qua trái */}
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label={isEn ? 'Previous reviews' : 'Xem đánh giá trước'}
            className={`hidden sm:flex absolute -left-2 sm:-left-4 lg:-left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center border transition-all cursor-pointer shadow-md backdrop-blur-xs ${
              canScrollLeft
                ? 'bg-white/95 border-slate-200 text-slate-800 hover:bg-[#2D5A27] hover:border-[#2D5A27] hover:text-white hover:scale-105 active:scale-95 shadow-lg'
                : 'bg-white/60 border-slate-200 text-slate-300 opacity-0 pointer-events-none'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Nút lướt qua phải */}
          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label={isEn ? 'Next reviews' : 'Xem đánh giá tiếp theo'}
            className={`hidden sm:flex absolute -right-2 sm:-right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center border transition-all cursor-pointer shadow-md backdrop-blur-xs ${
              canScrollRight
                ? 'bg-white/95 border-slate-200 text-slate-800 hover:bg-[#2D5A27] hover:border-[#2D5A27] hover:text-white hover:scale-105 active:scale-95 shadow-lg'
                : 'bg-white/60 border-slate-200 text-slate-300 opacity-0 pointer-events-none'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Danh sách thẻ đánh giá CUỘN NGANG (Kích thước nhỏ gọn & thấp) */}
          {filteredReviews.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200/90 p-8 text-center text-slate-500">
              <p className="text-xs sm:text-sm">
                {isEn
                  ? 'No reviews match the selected filters.'
                  : 'Không có đánh giá nào phù hợp với bộ lọc này.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setStarFilter('all');
                  setImageFilter('all');
                }}
                className="mt-2 text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                {isEn ? 'Reset filters' : 'Đặt lại bộ lọc'}
              </button>
            </div>
          ) : (
            <div
              ref={scrollRef}
              onScroll={checkScroll}
              className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pb-3 -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {filteredReviews.map((rev) => {
                const clientName =
                  isEn && rev.ten_khach_hang_en ? rev.ten_khach_hang_en : rev.ten_khach_hang;
                const contentText =
                  isEn && rev.noi_dung_en ? rev.noi_dung_en : rev.noi_dung;
                const isLongText = (contentText || '').length > 85;
                const isExpanded = !!expandedMap[rev.id];
                const hasImage = Boolean(
                  rev.hinh_anh_thu_cung && rev.hinh_anh_thu_cung.trim() !== ''
                );
                const userLiked = !!userLikedMap[rev.id];
                const likeCount = likesMap[rev.id] || 0;

                return (
                  <div
                    key={rev.id}
                    className="group relative bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between min-w-[260px] sm:min-w-[285px] max-w-[285px] sm:max-w-[305px] snap-start shrink-0"
                  >
                    <div>
                      {/* 1. Header Google Maps nhỏ gọn: Avatar chữ cái + Tên + Badge xác thực */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${getAvatarColor(
                              clientName
                            )} flex items-center justify-center text-white font-bold text-xs shadow-2xs shrink-0 select-none`}
                          >
                            {getAvatarInitial(clientName)}
                          </div>

                          <div className="min-w-0">
                            <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 truncate leading-snug">
                              {clientName}
                            </h3>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-light leading-none">
                              {/* SĐT auto ẩn 4 số cuối và viết liền nhau */}
                              {rev.so_dien_thoai && (
                                <span className="font-mono whitespace-nowrap">
                                  {formatMaskedPhone(rev.so_dien_thoai)}
                                </span>
                              )}
                              {rev.chi_nhanh && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[100px]">
                                    {rev.chi_nhanh}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {rev.da_xac_thuc && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200/60 shrink-0">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                            <span>{isEn ? 'Verified' : 'Đã xác thực'}</span>
                          </span>
                        )}
                      </div>

                      {/* 2. Dòng sao vàng Google Maps & Ngày */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < (rev.so_sao || 5)
                                  ? 'fill-[#fbbc04] text-[#fbbc04]'
                                  : 'fill-slate-200 text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {formatReviewTime(rev.ngay_danh_gia, rev.ngay_danh_gia_en, isEn)}
                        </span>
                      </div>

                      {/* 3. Nội dung nhận xét: 2 DÒNG, CHỮ XEM THÊM NẰM NGAY CUỐI DÒNG 2 */}
                      <div className="text-[12px] text-slate-700 leading-relaxed font-light mb-2.5">
                        {isLongText && !isExpanded ? (
                          <p>
                            &ldquo;{contentText.slice(0, 75).trim()}...{' '}
                            <button
                              type="button"
                              onClick={() => toggleExpand(rev.id)}
                              className="text-[#1a73e8] hover:underline font-semibold text-[11px] inline cursor-pointer focus:outline-hidden whitespace-nowrap"
                            >
                              {isEn ? 'Xem thêm' : 'Xem thêm'}
                            </button>
                            &rdquo;
                          </p>
                        ) : (
                          <p>
                            &ldquo;{contentText}&rdquo;
                            {isLongText && isExpanded && (
                              <>
                                {' '}
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(rev.id)}
                                  className="text-[#1a73e8] hover:underline font-semibold text-[11px] inline cursor-pointer focus:outline-hidden whitespace-nowrap ml-1"
                                >
                                  {isEn ? 'Thu gọn' : 'Thu gọn'}
                                </button>
                              </>
                            )}
                          </p>
                        )}
                      </div>

                      {/* 4. Hình ảnh bự ra rõ nét nhưng thấp gọn (h-28 sm:h-32), bấm vào phóng to */}
                      {hasImage && rev.hinh_anh_thu_cung && (
                        <div className="mb-2.5">
                          <div
                            onClick={() =>
                              setLightboxData({
                                url: rev.hinh_anh_thu_cung || '',
                                author: clientName,
                                content: contentText || '',
                                stars: rev.so_sao || 5,
                              })
                            }
                            className="relative h-28 sm:h-32 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group/img cursor-pointer shadow-2xs hover:shadow-xs transition-all"
                          >
                            <Image
                              src={getAssetUrl(rev.hinh_anh_thu_cung)}
                              alt={`Hình ảnh đánh giá từ ${clientName}`}
                              fill
                              sizes="(max-width: 768px) 260px, 300px"
                              className="object-cover group-hover/img:scale-105 transition-transform duration-200"
                            />

                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/25 transition-colors flex items-center justify-center">
                              <span className="opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/70 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-xs">
                                <Maximize2 className="w-2.5 h-2.5" />
                                <span>{isEn ? 'View photo' : 'Xem ảnh to'}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 5. Footer Google Maps: Nút Hữu ích & Dịch vụ */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleLike(rev.id)}
                        className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border transition-all cursor-pointer ${
                          userLiked
                            ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <ThumbsUp
                          className={`w-2.5 h-2.5 ${
                            userLiked ? 'fill-blue-600 text-blue-600' : 'text-slate-500'
                          }`}
                        />
                        <span>{isEn ? 'Helpful' : 'Hữu ích'}</span>
                        {likeCount > 0 && <span>({likeCount})</span>}
                      </button>

                      {rev.dich_vu_su_dung && (
                        <span className="text-[9px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60 truncate max-w-[140px]">
                          {rev.dich_vu_su_dung}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal Phóng to toàn màn hình */}
      {lightboxData && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxData(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
        >
          <button
            type="button"
            aria-label="Đóng"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxData(null);
            }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-slate-900 rounded-xl overflow-hidden border border-white/10 shadow-2xl flex flex-col"
          >
            <div className="relative w-full h-[50vh] sm:h-[60vh] bg-black">
              <Image
                src={getAssetUrl(lightboxData.url)}
                alt={`Ảnh đánh giá từ ${lightboxData.author}`}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>

            <div className="p-3.5 bg-slate-900/95 text-white border-t border-white/10">
              <div className="flex items-center justify-between gap-3 mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full ${getAvatarColor(
                      lightboxData.author
                    )} flex items-center justify-center text-white font-bold text-xs select-none`}
                  >
                    {getAvatarInitial(lightboxData.author)}
                  </div>
                  <span className="font-semibold text-xs sm:text-sm">
                    {lightboxData.author}
                  </span>
                </div>

                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < lightboxData.stars
                          ? 'fill-[#fbbc04] text-[#fbbc04]'
                          : 'fill-slate-600 text-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {lightboxData.content && (
                <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  &ldquo;{lightboxData.content}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
