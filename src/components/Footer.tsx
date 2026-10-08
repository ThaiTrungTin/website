'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PhoneCall,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  Award,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import PetLogo from './PetLogo';
import PetMMBrand from './PetMMBrand';
import { useSystemConfig } from '@/context/SystemConfigContext';
import { useLanguage } from '@/context/LanguageContext';
import { getDirectionsUrl } from '@/lib/assets';
import { useNavDatabase } from '@/hooks/useNavDatabase';
import { supabase, ChiNhanhRecord } from '@/lib/supabase';

function getFacebookEmbedUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed === '#' || trimmed === '/') return '';

  let pageUrl = trimmed;
  // Chuẩn hóa link share hoặc link petmm về URL trang chính thức của PetM&M
  if (trimmed.includes('1CKNDcSEY1') || trimmed.toLowerCase().includes('petmm')) {
    pageUrl = 'https://www.facebook.com/petmmhospital';
  } else if (!pageUrl.startsWith('http://') && !pageUrl.startsWith('https://')) {
    pageUrl = `https://www.facebook.com/${pageUrl.replace(/^@/, '')}`;
  }

  return `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
    pageUrl
  )}&tabs=timeline&width=380&height=240&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`;
}

interface FooterProps {
  branch?: Partial<ChiNhanhRecord> | null;
}

export default function Footer({ branch }: FooterProps) {
  const { config } = useSystemConfig();
  const { t, language } = useLanguage();
  const { services } = useNavDatabase();
  const isEn = language === 'en';

  const hotlineRaw = (config.hotline || '0903 599 339').replace(/\s+/g, '');
  const hotlineDisplay = config.hotline_hien_thi || config.hotline || '0903 599 339';
  const zaloUrl = config.link_zalo || 'https://zalo.me/0903599339';
  const facebookUrl = config.link_facebook?.trim() || '';
  const facebookEmbedUrl = getFacebookEmbedUrl(facebookUrl);
  const messengerUrl = config.link_messenger?.trim() || '';
  const tiktokUrl = config.link_tiktok?.trim() || '';
  const email = config.email?.trim() || '';

  // Nạp thông tin cơ sở chính được chọn trong Admin (chi_nhanh có la_co_so_chinh = true)
  const [mainBranch, setMainBranch] = useState<ChiNhanhRecord | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchMainBranch = async () => {
      try {
        const { data } = await supabase
          .from('chi_nhanh')
          .select('*')
          .eq('la_co_so_chinh', true)
          .eq('kich_hoat', true)
          .maybeSingle();

        if (isMounted && data) {
          setMainBranch(data);
        }
      } catch (e) {
        console.warn('Lỗi lấy cơ sở chính footer:', e);
      }
    };

    fetchMainBranch();

    // Lắng nghe thay đổi Realtime khi admin tick chọn cơ sở chính mới
    const channel = supabase
      .channel('footer_main_branch_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chi_nhanh' }, () => {
        fetchMainBranch();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const activeBranch = branch || mainBranch;

  const defaultBranchNameVi = 'Cơ Sở Chính';
  const defaultBranchNameEn = 'Main Facility';
  const defaultAddressVi = config.dia_chi_chinh || '19 Đ. Số 1, Phường Phước Long, TP. Thủ Đức, TP. Hồ Chí Minh';
  const defaultAddressEn = '19, Street 1, Phuoc Long Ward, Thu Duc City, Ho Chi Minh City';

  const formatAddressForLanguage = (addr: string, en: boolean) => {
    if (!en || !addr) return addr;
    return addr
      .replace(/19\s*Đ\.\s*Số\s*1/gi, '19, Street 1')
      .replace(/Đ\.\s*Số/gi, 'Street')
      .replace(/Đường\s*Số/gi, 'Street')
      .replace(/Phường\s*Phước\s*Long/gi, 'Phuoc Long Ward')
      .replace(/Phường/gi, 'Ward')
      .replace(/TP\.\s*Thủ\s*Đức/gi, 'Thu Duc City')
      .replace(/TP\.\s*Hồ\s*Chí\s*Minh/gi, 'Ho Chi Minh City')
      .replace(/Thành\s*phố\s*Hồ\s*Chí\s*Minh/gi, 'Ho Chi Minh City')
      .replace(/Quận/gi, 'District');
  };

  const formatBranchNameForLanguage = (name: string, en: boolean) => {
    if (!en || !name) return name;
    return name
      .replace(/Trụ\s*Sở\s*Chính\s*(TP\.\s*Thủ\s*Đức)?/gi, 'Main Facility')
      .replace(/Cơ\s*Sở\s*Chính\s*(TP\.\s*Thủ\s*Đức)?/gi, 'Main Facility')
      .replace(/Phòng\s*Khám\s*Thuộc\s*Bệnh\s*Viện\s*Thú\s*Cưng\s*PetM&M/gi, 'PetM&M Pet Hospital Clinic')
      .replace(/Cơ\s*sở\s*TP\.\s*Thủ\s*Đức/gi, 'Thu Duc City Branch')
      .replace(/Cơ\s*sở/gi, 'Branch');
  };

  // Định dạng tên cơ sở hiển thị: Cơ sở chính chỉ để "Cơ Sở Chính"
  const getBranchDisplayName = () => {
    if (branch && !branch.la_co_so_chinh) {
      // Đang xem chi nhánh cụ thể từ trang chi tiết (khác cơ sở chính)
      return isEn
        ? (branch.ten_chi_nhanh_en?.trim() ||
            (branch.ten_chi_nhanh
              ? formatBranchNameForLanguage(branch.ten_chi_nhanh, true)
              : defaultBranchNameEn))
        : (branch.ten_chi_nhanh?.trim() || defaultBranchNameVi);
    }

    // Cơ sở chính chỉ hiển thị duy nhất "Cơ Sở Chính"
    return isEn ? defaultBranchNameEn : defaultBranchNameVi;
  };

  const branchName = getBranchDisplayName();

  const branchAddress = isEn
    ? (activeBranch?.dia_chi_en?.trim() ||
        (activeBranch?.dia_chi
          ? formatAddressForLanguage(activeBranch.dia_chi, true)
          : defaultAddressEn))
    : (activeBranch?.dia_chi?.trim() || defaultAddressVi);

  const branchPhone = activeBranch?.so_dien_thoai || hotlineDisplay;
  const mapEmbedUrl =
    activeBranch?.link_ggmap_embed ||
    'https://maps.google.com/maps?q=Ph%C3%B2ng+kh%C3%A1m+Th%C3%BA+c%C6%B0ng+PetM%26M,+19+%C4%90.+S%E1%BB%91+1,+Ph%C6%B0%E1%BB%9Bc+Long,+H%E1%BB%93+Ch%C3%AD+Minh&t=&z=16&ie=UTF8&iwloc=&output=embed';
  const mapAppUrl =
    activeBranch?.link_ggmap_app ||
    'https://www.google.com/maps/place/Ph%C3%B2ng+kh%C3%A1m+Th%C3%BA+c%C6%B0ng+PetM%26M/@10.825,106.765,17z';

  return (
    <footer id="contact" className="relative text-white overflow-hidden bg-gradient-to-b from-[#163814] via-[#10290F] to-[#0A1A09] pt-14 pb-12 border-t border-emerald-900/60 select-none">
      {/* Subtle luxury ambient texture overlay */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-800/15 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Main 5-Column Grid: Brand | Về PetM&M | Dịch Vụ Thú Y | Bản Đồ Maps | Fanpage Facebook */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-5 2xl:gap-7 items-start">
          {/* CỘT 1: THƯƠNG HIỆU PETM&M (lg:col-span-4 xl:col-span-3) */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-3.5">
            <PetLogo size="default" />

            <h3 className="text-base sm:text-lg font-bold text-amber-300 font-editorial tracking-wide italic">
              {language === 'en'
                ? (config.slogan_cuoi_trang_tieu_de_en || '“Healthy Pets — Lifelong Peace of Mind”')
                : (config.slogan_cuoi_trang_tieu_de || '“Thú cưng khỏe mạnh — An yên trọn một đời”')}
            </h3>

            <p className="text-xs text-emerald-100/80 leading-relaxed font-light max-w-sm">
              {language === 'en'
                ? (config.slogan_cuoi_trang_noi_dung_en ||
                  'International standard Veterinary Hospital & Pet Resort in Ho Chi Minh City. Pioneering clinical Fear-Free standards for anxiety-free pet care.')
                : (config.slogan_cuoi_trang_noi_dung ||
                  'Hệ thống Bệnh viện Thú Y & Resort Nghỉ dưỡng Thú Cưng Tiêu chuẩn 5 Sao quốc tế tại TP. Hồ Chí Minh. Tiên phong áp dụng chuẩn lâm sàng Fear-Free không stress cho thú cưng.')}
            </p>

            {/* THÔNG TIN LIÊN HỆ & 3 ICON LIÊN HỆ */}
            <div className="pt-2 space-y-2.5">
              <div className="text-xs text-emerald-100/90 font-medium flex items-center gap-1.5">
                <span className="font-semibold text-emerald-200">{t('nav_contact', 'Liên hệ')}:</span>
                <a
                  href={`tel:${hotlineRaw}`}
                  className="font-bold text-amber-300 hover:text-white transition tracking-wide font-mono text-xs sm:text-sm"
                >
                  {hotlineDisplay}
                </a>
              </div>

              {/* Danh sách icon liên hệ tròn (Hotline, Zalo, Messenger, Fanpage, TikTok, Gmail - Ẩn khi không có thông tin) */}
              <div className="flex items-center gap-2.5 pt-0.5 flex-wrap">
                {/* 1. Hotline Đỏ Quick Call */}
                {hotlineRaw && (
                  <a
                    href={`tel:${hotlineRaw}`}
                    aria-label={`Gọi hotline ${hotlineDisplay}`}
                    title={`Gọi hotline: ${hotlineDisplay}`}
                    className="group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-lg shadow-rose-950/40 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer"
                  >
                    <span className="absolute -inset-1 rounded-full bg-rose-500/30 animate-ping pointer-events-none" style={{ animationDuration: '2.5s' }} />
                    <PhoneCall className="w-4 h-4 fill-white text-white group-hover:animate-bounce" />
                  </a>
                )}

                {/* 2. Zalo Chat Xanh */}
                {zaloUrl && zaloUrl !== '#' && (
                  <a
                    href={zaloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat Zalo với PetM&M"
                    title="Chat Zalo"
                    className="group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0068FF] text-white shadow-lg shadow-blue-950/40 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer"
                  >
                    <span className="font-black text-xs tracking-tighter">Zalo</span>
                  </a>
                )}

                {/* 3. Facebook Messenger Gradient */}
                {messengerUrl && messengerUrl !== '#' && (
                  <a
                    href={messengerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Nhắn tin Facebook Messenger"
                    title="Nhắn tin Facebook Messenger"
                    className="group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#00B2FF] via-[#006AFF] to-[#9B00E8] text-white shadow-lg shadow-indigo-950/40 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-white" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.518 3.734 7.218V22l3.39-1.86c.917.254 1.884.39 2.876.39 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.066 12.455l-2.585-2.758-5.047 2.758 5.553-5.895 2.65 2.758 4.982-2.758-5.553 5.895z" />
                    </svg>
                  </a>
                )}

                {/* 4. Fanpage Facebook */}
                {facebookUrl && facebookUrl !== '#' && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Fanpage Facebook PetM&M"
                    title="Fanpage Facebook"
                    className="group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1877F2] text-white shadow-lg shadow-blue-950/40 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-white" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}

                {/* 5. Kênh TikTok */}
                {tiktokUrl && tiktokUrl !== '#' && (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Kênh TikTok PetM&M"
                    title="Kênh TikTok"
                    className="group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950 text-white shadow-lg shadow-black/50 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-white" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  </a>
                )}

                {/* 6. Gmail Liên Hệ */}
                {email && email !== '#' && (
                  <a
                    href={`mailto:${email}`}
                    aria-label={`Gửi email tới ${email}`}
                    title={`Email: ${email}`}
                    className="group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-slate-800 shadow-lg shadow-slate-950/30 hover:scale-110 active:scale-95 transition-all duration-300 border border-slate-200 cursor-pointer"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M1.5 19.5h4.5V9.75L1.5 6.375z" />
                      <path fill="#34A853" d="M18 19.5h4.5v-13.125L18 9.75z" />
                      <path fill="#EA4335" d="M18 6.375V9.75L12 14.25 6 9.75V6.375l6-4.5z" />
                      <path fill="#FBBC05" d="M1.5 6.375L6 9.75V6.375l-4.5-3.375C1.5 3 1.5 6.375 1.5 6.375z" />
                      <path fill="#C5221F" d="M22.5 3l-4.5 3.375V9.75l4.5-3.375z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* CỘT 2: VỀ PETM&M (lg:col-span-2 xl:col-span-2) */}
          <div className="lg:col-span-2 xl:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/15 pb-2">
              {language === 'en' ? (
                <>About <PetMMBrand /></>
              ) : (
                <>Về <PetMMBrand /></>
              )}
            </h4>
            <ul className="space-y-2 text-xs text-emerald-100/80 font-light">
              <li>
                <Link href="/#about" className="hover:text-amber-300 transition block">
                  {language === 'en' ? <>About <PetMMBrand /></> : <>Giới thiệu <PetMMBrand /></>}
                </Link>
              </li>
              <li>
                <Link href="/#branches" className="hover:text-amber-300 transition block">
                  {t('nav_branches', 'Hệ Thống Cơ Sở')}
                </Link>
              </li>
              <li>
                <Link href="/doi-ngu" className="hover:text-amber-300 transition block">
                  {language === 'en' ? 'Medical Team' : 'Đội ngũ bác sĩ'}
                </Link>
              </li>
              <li>
                <Link href="/#knowledge" className="hover:text-amber-300 transition block">
                  {t('nav_knowledge', 'Cẩm Nang')}
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-amber-300 transition block">
                  {t('nav_faq', 'FAQ')}
                </Link>
              </li>
              <li>
                <Link href="/#reviews" className="hover:text-amber-300 transition block">
                  {t('nav_reviews', 'Đánh Giá')}
                </Link>
              </li>
              <li>
                <Link href="/tuyen-dung" className="hover:text-amber-300 transition block">
                  {language === 'en' ? 'Careers & Recruitment' : 'Tuyển dụng & Cơ hội nghề nghiệp'}
                </Link>
              </li>
              <li>
                <Link href="/#booking" className="hover:text-amber-300 transition block">
                  {language === 'en' ? 'Book Appointment' : 'Đặt lịch khám bệnh'}
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: DỊCH VỤ THÚ Y (lg:col-span-2 xl:col-span-2) */}
          <div className="lg:col-span-2 xl:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/15 pb-2">
              {language === 'en' ? 'Veterinary Services' : 'Dịch Vụ Thú Y'}
            </h4>
            <ul className="space-y-2 text-xs text-emerald-100/80 font-light">
              {services && services.length > 0 ? (
                services.map((service) => {
                  const sName =
                    language === 'en' && service.ten_dich_vu_en
                      ? service.ten_dich_vu_en
                      : service.ten_dich_vu;
                  return (
                    <li key={service.id}>
                      <a
                        href={`/#services?service=${service.id}`}
                        onClick={(e) => {
                          if (
                            typeof window !== 'undefined' &&
                            (window.location.pathname === '/' || window.location.pathname === '')
                          ) {
                            e.preventDefault();
                            window.dispatchEvent(
                              new CustomEvent('select-service', { detail: { id: service.id } })
                            );
                            const el = document.getElementById('services');
                            if (el) {
                              el.scrollIntoView({ behavior: 'smooth' });
                            }
                          }
                        }}
                        className="hover:text-amber-300 transition block truncate"
                        title={sName}
                      >
                        {sName}
                      </a>
                    </li>
                  );
                })
              ) : (
                <li>
                  <Link href="/#services" className="hover:text-amber-300 transition block">
                    {language === 'en' ? 'All Services' : 'Tất cả dịch vụ thú y'}
                  </Link>
                </li>
              )}
            </ul>
          </div>
          {/* CỘT 4: VỊ TRÍ & BẢN ĐỒ CHI NHÁNH (lg:col-span-2 xl:col-span-2) */}
          <div className="lg:col-span-2 xl:col-span-2 space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/15 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{language === 'en' ? 'Location & Map' : 'Vị Trí & Bản Đồ'}</span>
              </h4>
              <span className="text-[10px] text-amber-300 font-mono">Maps</span>
            </div>

            {/* Tên & địa chỉ cơ sở đang xem */}
            <div>
              <p className="text-xs font-bold text-white line-clamp-1">
                {branchName}
              </p>
              <p className="text-[11px] text-emerald-100/80 font-light line-clamp-2 mt-0.5">
                {branchAddress}
              </p>
            </div>

            {/* Khung iframe Google Maps thu nhỏ */}
            <div className="relative w-full h-[180px] rounded-xl overflow-hidden border border-white/20 shadow-md bg-black/40">
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>

            {/* Nút chỉ đường */}
            {mapAppUrl && (
              <a
                href={getDirectionsUrl(mapAppUrl, branchAddress, branchName)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-white/15 hover:bg-amber-400 hover:text-slate-900 text-white text-xs font-semibold transition border border-white/20 shadow-xs cursor-pointer truncate"
              >
                <Navigation className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{language === 'en' ? 'Google Maps Directions' : 'Mở Google Maps Chỉ Đường'}</span>
              </a>
            )}
          </div>

          {/* CỘT 5: FANPAGE FACEBOOK 5★ CAO CẤP (lg:col-span-2 xl:col-span-3) */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/15 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Fanpage Facebook</span>
              </h4>

              <a
                href={facebookUrl || 'https://www.facebook.com/petmmhospital'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-amber-300 hover:text-white hover:underline flex items-center gap-1"
              >
                <span>{language === 'en' ? 'Visit Page' : 'Xem trang'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Thẻ Fanpage 5★ Sắc Nét Y Hệt Ảnh Facebook Thật (Hỗ trợ lướt dòng thời gian bài viết) */}
            <div className="relative w-full h-[275px] rounded-xl overflow-hidden border border-white/20 shadow-md bg-white text-slate-800 flex flex-col">
              <div className="flex-1 overflow-y-auto fb-card-scrollbar overscroll-contain">
                {/* 1. Ảnh bìa cover HD thật của viện */}
                <div className="relative h-18 w-full overflow-hidden bg-emerald-950 shrink-0">
                  <img
                    src="/images/facebook/cover.webp"
                    alt="Bệnh viện thú cưng PetM&M Facebook Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* 2. Avatar & Tiêu đề thông tin */}
                <div className="px-3 pb-2.5 pt-0 relative">
                  <div className="flex items-end justify-between -mt-6 mb-1.5">
                    {/* Avatar tròn viền trắng */}
                    <div className="relative w-13 h-13 rounded-full overflow-hidden border-2 border-white shadow-md bg-white shrink-0">
                      <img
                        src="/images/facebook/avatar.png"
                        alt="PetM&M Avatar"
                        className="w-full h-full object-contain p-0.5"
                      />
                    </div>

                    {/* Nút tác vụ Nhắn tin + Theo dõi */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <a
                        href={messengerUrl || 'https://m.me/petmmhospital'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#1877F2] hover:bg-[#166fe5] text-white text-[11px] font-bold shadow-xs transition"
                        title="Nhắn tin Messenger"
                      >
                        <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24">
                          <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.518 3.734 7.218V22l3.39-1.86c.917.254 1.884.39 2.876.39 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.066 12.455l-2.585-2.758-5.047 2.758 5.553-5.895 2.65 2.758 4.982-2.758-5.553 5.895z" />
                        </svg>
                        <span>Nhắn tin</span>
                      </a>

                      <a
                        href={facebookUrl || 'https://www.facebook.com/petmmhospital'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold border border-slate-200 transition"
                        title="Theo dõi trang"
                      >
                        <span>+ Theo dõi</span>
                      </a>
                    </div>
                  </div>

                  {/* Tên & Người theo dõi */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-xs font-bold text-slate-900 leading-tight">
                        Bệnh viện thú cưng PetM&amp;M
                      </h5>
                      <span className="w-3.5 h-3.5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px] font-bold shrink-0" title="Trang chính thức">
                        ✓
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">
                      190 người theo dõi • 6 đang theo dõi
                    </p>
                    <p className="text-[10px] text-slate-600 line-clamp-1">
                      📍 PET M&amp;M HOSPITAL • 🐾 Touch • Trust • Love
                    </p>
                  </div>

                  {/* 3. Dòng Thời Gian Nhiều Bài Viết (Feed Timeline) */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-2.5">
                    {/* BÀI VIẾT 1: Tiêm phòng dại miễn phí */}
                    <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <img
                            src="/images/facebook/avatar.png"
                            alt="PetM&M Avatar"
                            className="w-4 h-4 rounded-full border border-slate-300 object-cover"
                          />
                          <span className="font-bold text-slate-800">PetM&amp;M Hospital</span>
                        </div>
                        <span>2 giờ trước • 🌐</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-900 leading-snug">
                        TIÊM PHÒNG DẠI MIỄN PHÍ CHO THÚ CƯNG 🐶🐱
                      </p>
                      <p className="text-[10px] text-slate-600 leading-relaxed">
                        Chung tay bảo vệ bé yêu và cộng đồng với chương trình tiêm phòng dại định kỳ 100% miễn phí!
                      </p>
                      <a
                        href={facebookUrl || 'https://www.facebook.com/petmmhospital'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block relative rounded-md overflow-hidden border border-slate-200 shadow-2xs group"
                      >
                        <img
                          src="/images/facebook/post_sample.png"
                          alt="Tiêm phòng dại miễn phí PetM&M"
                          className="w-full h-auto object-cover group-hover:scale-102 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                            Xem trên Facebook ↗
                          </span>
                        </div>
                      </a>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span>👍❤️ 142 lượt thích</span>
                        <span>28 bình luận • 15 chia sẻ</span>
                      </div>
                    </div>

                    {/* BÀI VIẾT 2: Phẫu thuật cấp cứu nội soi */}
                    <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <img
                            src="/images/facebook/avatar.png"
                            alt="PetM&M Avatar"
                            className="w-4 h-4 rounded-full border border-slate-300 object-cover"
                          />
                          <span className="font-bold text-slate-800">PetM&amp;M Hospital</span>
                        </div>
                        <span>Hôm qua lúc 15:30 • 🌐</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-900 leading-snug">
                        CẤP CỨU &amp; PHẪU THUẬT NỘI SOI 24/7 🩺🏥
                      </p>
                      <p className="text-[10px] text-slate-600 leading-relaxed">
                        Bé Mướp nuốt dị vật gây tắc ruột đã được các bác sĩ chuyên khoa nội soi can thiệp kịp thời. Bé đã hồi phục hoàn toàn và xuất viện khỏe mạnh!
                      </p>
                      <a
                        href={facebookUrl || 'https://www.facebook.com/petmmhospital'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block relative rounded-md overflow-hidden border border-slate-200 shadow-2xs group h-28"
                      >
                        <img
                          src="/about_surgery.jpg"
                          alt="Phẫu thuật cấp cứu PetM&M"
                          className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                            Xem trên Facebook ↗
                          </span>
                        </div>
                      </a>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span>👍❤️ 89 lượt thích</span>
                        <span>19 bình luận • 7 chia sẻ</span>
                      </div>
                    </div>

                    {/* BÀI VIẾT 3: Spa & Grooming 5 Sao */}
                    <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <img
                            src="/images/facebook/avatar.png"
                            alt="PetM&M Avatar"
                            className="w-4 h-4 rounded-full border border-slate-300 object-cover"
                          />
                          <span className="font-bold text-slate-800">PetM&amp;M Hospital</span>
                        </div>
                        <span>3 ngày trước • 🌐</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-900 leading-snug">
                        SPA &amp; GROOMING 5 SAO CHUẨN FEAR-FREE ✂️🛁
                      </p>
                      <p className="text-[10px] text-slate-600 leading-relaxed">
                        Quy trình chăm sóc lông móng nhẹ nhàng, không gây căng thẳng với dòng sữa tắm thảo mộc cao cấp.
                      </p>
                      <a
                        href={facebookUrl || 'https://www.facebook.com/petmmhospital'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block relative rounded-md overflow-hidden border border-slate-200 shadow-2xs group h-28"
                      >
                        <img
                          src="/pet_golden_spa.jpg"
                          alt="Spa & Grooming PetM&M"
                          className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                            Xem trên Facebook ↗
                          </span>
                        </div>
                      </a>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span>👍❤️ 115 lượt thích</span>
                        <span>34 bình luận • 12 chia sẻ</span>
                      </div>
                    </div>

                    {/* Nút Xem Tất Cả Bài Viết */}
                    <a
                      href={facebookUrl || 'https://www.facebook.com/petmmhospital'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-100 hover:bg-[#1877F2] hover:text-white text-slate-700 text-[11px] font-bold transition border border-slate-200 shadow-2xs"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span>Xem tất cả bài viết trên Fanpage ↗</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>


            {/* Chú thích & Nút theo dõi */}
            <div className="flex items-center justify-between text-[11px] text-emerald-100/70 pt-0.5">
              <span className="truncate">
                {language === 'en' ? 'Official Meta Fanpage' : 'Fanpage chính thức Bệnh Viện PetM&M'}
              </span>
              <a
                href={facebookUrl || 'https://www.facebook.com/petmmhospital'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-300 hover:text-white font-medium hover:underline shrink-0 ml-2"
              >
                {language === 'en' ? '+ Follow' : '+ Theo dõi'}
              </a>
            </div>
          </div>
        </div>

        {/* HÀNG ĐÁY BẢN QUYỀN & TIÊU CHUẨN (BOTTOM LEGAL ROW) */}
        <div className="pt-6 mt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-emerald-100/60 font-light">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} <PetMMBrand /> Veterinary &amp; Pet Care Clinic. {t('footer_copyright', 'Tất cả các quyền được bảo lưu.')}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/chinh-sach-bao-mat"
              className="text-emerald-100/80 hover:text-white transition underline-offset-2 hover:underline"
            >
              {language === 'en' ? 'Privacy Policy' : 'Chính Sách Bảo Mật'}
            </Link>
            <span className="text-white/20">•</span>

            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'en' ? 'WSAVA International Standards' : 'Tiêu chuẩn quốc tế WSAVA'}</span>
            </span>
            <span className="text-white/20">•</span>
            <span>
              {config.giay_phep
                ? language === 'en'
                  ? `License: ${config.giay_phep.replace(/^giấy phép:?\s*/i, '')}`
                  : config.giay_phep.toLowerCase().startsWith('giấy phép')
                    ? config.giay_phep
                    : `Giấy phép: ${config.giay_phep}`
                : language === 'en' ? 'License: 0316888999/SNN-TY' : 'Giấy phép: 0316888999/SNN-TY'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
