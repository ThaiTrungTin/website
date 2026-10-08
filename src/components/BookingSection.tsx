'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { supabase, ChiNhanhRecord, DichVuRecord } from '@/lib/supabase';
import { branchesData } from '@/data/branchesData';
import { servicesData } from '@/data/servicesData';
import { useLanguage } from '@/context/LanguageContext';
import { useSystemConfig } from '@/context/SystemConfigContext';
import { sanitizeHtml } from '@/lib/sanitize';
import { getAssetUrl } from '@/lib/assets';
import {
  CalendarCheck,
  User,
  Phone,
  Mail,
  Building,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Copy,
  Sparkles,
  PhoneCall,
  MapPin,
  Heart,
  ChevronDown,
  Check,
  Stethoscope,
} from 'lucide-react';

interface BookingSectionProps {
  initialService?: string;
  isModal?: boolean;
  onSuccess?: () => void;
}

const DEFAULT_COVER_IMAGE = '/about_consultation.jpg';

// Helper lấy ngày hiện tại theo giờ Việt Nam (YYYY-MM-DD)
const getTodayDateVN = () => {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    return new Date().toISOString().split('T')[0];
  }
};

// Helper lấy số phút hiện tại trong ngày theo múi giờ Việt Nam
const getCurrentVNMinutes = () => {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date());
    const h = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const m = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    return h * 60 + m;
  } catch {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }
};

// Helper kiểm tra khung giờ đã qua hôm nay hay chưa (chỉ áp dụng khi chọn ngày là hôm nay)
const isSlotPassedToday = (slot: string, chosenDate: string) => {
  const todayVN = getTodayDateVN();
  if (chosenDate !== todayVN) return false;
  const startPart = slot.split('-')[0]?.trim(); // vd "08:00"
  if (!startPart) return false;
  const [hStr, mStr] = startPart.split(':');
  const slotStartMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);
  const currentMinutes = getCurrentVNMinutes();
  return currentMinutes >= slotStartMinutes;
};

const TIME_SLOTS = [
  '08:00 - 08:30',
  '08:30 - 09:00',
  '09:00 - 09:30',
  '09:30 - 10:00',
  '10:00 - 10:30',
  '10:30 - 11:00',
  '11:00 - 11:30',
  '13:30 - 14:00',
  '14:00 - 14:30',
  '14:30 - 15:00',
  '15:00 - 15:30',
  '15:30 - 16:00',
  '16:00 - 16:30',
  '16:30 - 17:00',
  '17:00 - 17:30',
  '17:30 - 18:00',
  '18:00 - 18:30',
  '18:30 - 19:00',
  '19:00 - 19:30',
  '19:30 - 20:00',
];

export default function BookingSection({
  initialService = '',
  isModal = false,
  onSuccess,
}: BookingSectionProps) {
  const { language } = useLanguage();
  const { config } = useSystemConfig();
  const isEn = language === 'en';

  // Lấy tiêu đề & mô tả cấu hình phong cách Rich Text Editor
  const rawTitleHtml = isEn
    ? (config.section_dat_lich_tieu_de_en || config.section_dat_lich_tieu_de)
    : config.section_dat_lich_tieu_de;
  const rawDescHtml = isEn
    ? (config.section_dat_lich_mo_ta_en || config.section_dat_lich_mo_ta)
    : config.section_dat_lich_mo_ta;
  const titleHtml = rawTitleHtml ? sanitizeHtml(rawTitleHtml) : '';
  const descHtml = rawDescHtml ? sanitizeHtml(rawDescHtml) : '';

  const hotlineDisplay = config.hotline_hien_thi || config.hotline || '0903 599 339';
  const hotlineRaw = (config.hotline || config.hotline_hien_thi || '0903599339').replace(/\s+/g, '');

  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('dog');
  const [branch, setBranch] = useState('');
  const [service, setService] = useState(initialService || '');

  // Tự động gán dịch vụ nếu truyền từ ngoài vào
  useEffect(() => {
    if (initialService) {
      setService(initialService);
    }
  }, [initialService]);

  const [date, setDate] = useState(() => getTodayDateVN());
  const [timeSlot, setTimeSlot] = useState('');
  const [note, setNote] = useState('');

  const todayVN = getTodayDateVN();

  // Tự động bỏ chọn khung giờ nếu ngày được chọn là hôm nay và khung giờ đó đã qua
  useEffect(() => {
    if (timeSlot && date === todayVN && isSlotPassedToday(timeSlot, date)) {
      setTimeSlot('');
    }
  }, [date, timeSlot, todayVN]);

  // Dropdown states cho web (không dùng popup trình duyệt)
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const branchDropdownRef = useRef<HTMLDivElement>(null);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const timeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target as Node)) {
        setIsServiceDropdownOpen(false);
      }
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [coverImage, setCoverImage] = useState(DEFAULT_COVER_IMAGE);
  const [rightColConfig, setRightColConfig] = useState({
    titleVi: 'Chăm Sóc Y Khoa Tiêu Chuẩn 5 Sao',
    titleEn: 'Fear-Free & High-Standard Medical Care',
    descVi: 'Đội ngũ bác sĩ thú y chính quy, quy trình Fear-Free giảm căng thẳng tuyệt đối cho các bé cưng.',
    descEn: 'Experienced veterinarians dedicated to safeguarding your pet’s health with compassion and cutting-edge equipment.',
    commit1Vi: 'Khám đúng giờ theo lịch hẹn, không bốc số',
    commit1En: 'Zero waiting time with priority booking',
    commit2Vi: 'Gửi phiếu tiếp nhận tự động qua Gmail',
    commit2En: 'Automated email confirmation sent to Gmail',
  });
  const [dbBranches, setDbBranches] = useState<ChiNhanhRecord[]>([]);
  const [dbServices, setDbServices] = useState<DichVuRecord[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    code: string;
    ownerName: string;
    phone?: string;
    petName: string;
    branchName: string;
    service: string;
    dateTime: string;
    date?: string;
    timeSlot?: string;
    emailSent?: boolean;
    email?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [countdownSeconds, setCountdownSeconds] = useState<number>(0);

  // Hiệu ứng đếm ngược thời gian thực (15s -> 14s -> ... -> 0s)
  useEffect(() => {
    if (countdownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setErrorMsg('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdownSeconds]);

  const lastSubmitRef = React.useRef<number>(0);

  // Helper format ngày YYYY-MM-DD sang dd/mm/yyyy
  const formatToDMY = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  // Tải chi nhánh, dịch vụ và cấu hình Cột Phải / ảnh bìa từ database
  useEffect(() => {
    async function loadData() {
      try {
        const { data: bData } = await supabase
          .from('chi_nhanh')
          .select('*')
          .eq('kich_hoat', true)
          .order('thu_tu', { ascending: true });
        if (bData && bData.length > 0) {
          setDbBranches(bData);
        }

        const { data: sData } = await supabase
          .from('dich_vu')
          .select('*')
          .eq('kich_hoat', true)
          .order('thu_tu', { ascending: true });
        if (sData && sData.length > 0) {
          setDbServices(sData);
        }

        // Tải cấu hình form đặt lịch trong bảng cau_hinh
        const { data: cfgData } = await supabase
          .from('cau_hinh')
          .select('*')
          .eq('id', 'booking_config')
          .maybeSingle();

        if (cfgData) {
          if (cfgData.logo_favicon && cfgData.logo_favicon.trim()) {
            setCoverImage(cfgData.logo_favicon.trim());
          }
          setRightColConfig((prev) => ({
            titleVi: cfgData.slogan_cuoi_trang_tieu_de?.trim() || prev.titleVi,
            titleEn: cfgData.slogan_cuoi_trang_tieu_de_en?.trim() || prev.titleEn,
            descVi: cfgData.slogan_cuoi_trang_noi_dung?.trim() || prev.descVi,
            descEn: cfgData.slogan_cuoi_trang_noi_dung_en?.trim() || prev.descEn,
            commit1Vi: cfgData.gioi_thieu_cam_ket_phu?.trim() || prev.commit1Vi,
            commit1En: cfgData.gioi_thieu_cam_ket_phu_en?.trim() || prev.commit1En,
            commit2Vi: cfgData.gioi_thieu_trich_dan?.trim() || prev.commit2Vi,
            commit2En: cfgData.gioi_thieu_trich_dan_en?.trim() || prev.commit2En,
          }));
        }
      } catch (err) {
        console.warn('Lỗi tải dữ liệu cho form đặt lịch:', err);
      }
    }
    loadData();

    // Lắng nghe cập nhật ảnh bìa và cấu hình cột phải realtime từ Admin
    const handleCoverUpdate = (e: any) => {
      if (e?.detail) {
        if (e.detail.url) setCoverImage(e.detail.url);
        if (e.detail.titleVi) {
          setRightColConfig({
            titleVi: e.detail.titleVi,
            titleEn: e.detail.titleEn || e.detail.titleVi,
            descVi: e.detail.descVi,
            descEn: e.detail.descEn || e.detail.descVi,
            commit1Vi: e.detail.commit1Vi,
            commit1En: e.detail.commit1En || e.detail.commit1Vi,
            commit2Vi: e.detail.commit2Vi,
            commit2En: e.detail.commit2En || e.detail.commit2Vi,
          });
        }
      }
    };
    window.addEventListener('petmm_booking_cover_updated', handleCoverUpdate);

    const handleFocus = () => { loadData(); };
    window.addEventListener('focus', handleFocus);

    const bookingChannel = supabase
      .channel('realtime_booking_data')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chi_nhanh' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dich_vu' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cau_hinh' }, loadData)
      .subscribe();

    // Lắng nghe chọn nhanh dịch vụ từ ngoài vào
    const handleSelectService = (e: any) => {
      if (e?.detail?.service) {
        setService(e.detail.service);
      }
    };
    window.addEventListener('petmm_select_service', handleSelectService);

    return () => {
      window.removeEventListener('focus', handleFocus);
      supabase.removeChannel(bookingChannel);
      window.removeEventListener('petmm_booking_cover_updated', handleCoverUpdate);
      window.removeEventListener('petmm_select_service', handleSelectService);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (countdownSeconds > 0 || isSubmitting) return;
    setErrorMsg('');

    // Cooldown chống click đúp liên tục (1.5 giây)
    const now = Date.now();
    if (now - lastSubmitRef.current < 1500) {
      return;
    }

    if (!ownerName.trim()) {
      setErrorMsg(isEn ? 'Please enter your full name' : 'Vui lòng nhập họ và tên của bạn');
      return;
    }

    const cleanPhone = phone.replace(/\s+/g, '');
    const numOnly = cleanPhone.replace(/\D/g, '');
    if (numOnly.length < 8 || numOnly.length > 15) {
      setErrorMsg(isEn ? 'Please enter a valid phone number (8-15 digits)' : 'Vui lòng nhập số điện thoại hợp lệ (8 - 15 chữ số)');
      return;
    }

    lastSubmitRef.current = Date.now();
    setIsSubmitting(true);

    try {
      // Tìm tên chi nhánh hiển thị (lấy địa chỉ trong cài đặt chi nhánh)
      let branchName = '';
      if (branch && dbBranches.length > 0) {
        const found = dbBranches.find((b) => b.id === branch);
        if (found) {
          const address = (isEn && found.dia_chi_en) || found.dia_chi || '';
          const name = (isEn && (found.ten_chi_nhanh_en || found.ten_ngan_en)) || found.ten_chi_nhanh || found.ten_ngan || '';
          branchName = address ? (name ? `${name} - ${address}` : address) : name;
        }
      }

      // Sinh mã tiếp nhận phía client
      const clientBookingCode = 'PMM-' + Math.floor(100000 + Math.random() * 900000);
      const displayService = service.trim() || (isEn ? 'General Health Check & Consultation' : 'Khám tổng quát & Tư vấn trực tiếp');
      const formattedDateTime = timeSlot
        ? `${timeSlot}, ${isEn ? 'Date' : 'Ngày'} ${formatToDMY(date)}`
        : `${isEn ? 'Date' : 'Ngày'} ${formatToDMY(date)} (${isEn ? 'Flexible' : 'Linh hoạt'})`;
      const hasEmail = Boolean(email && email.trim().includes('@'));

      // CHUYỂN NGAY LẬP TỨC SANG MÀN HÌNH KẾT QUẢ (Optimistic UI - 0s chờ đợi)
      setBookingResult({
        code: clientBookingCode,
        ownerName: ownerName.trim(),
        phone: cleanPhone,
        petName: '',
        branchName: branchName || (isEn ? 'Flexible branch' : 'Linh hoạt cơ sở'),
        service: displayService,
        dateTime: formattedDateTime,
        date: formatToDMY(date),
        timeSlot: timeSlot || (isEn ? 'Flexible' : 'Linh hoạt'),
        emailSent: hasEmail,
        email: email.trim(),
      });
      if (onSuccess) onSuccess();

      // Gửi ngầm API lưu Supabase và gửi email tiếp nhận
      fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingCode: clientBookingCode,
          ownerName: ownerName.trim(),
          phone: cleanPhone,
          email: email.trim(),
          petName: '',
          petType: '',
          branch: branch || null,
          branchName: branchName || '',
          service: displayService,
          date,
          timeSlot,
          note: note.trim(),
          isEn,
        }),
      })
        .then(async (res) => {
          const data = await res.json().catch(() => null);
          if (!res.ok || !data?.success) {
            // NẾU BỊ CHẶN SPAM HOẶC LỖI: Thu hồi màn hình kết quả, quay về form và hiển thị cảnh báo
            setBookingResult(null);
            if (data && typeof data.cooldown === 'number' && data.cooldown > 0) {
              setCountdownSeconds(data.cooldown);
            }
            setErrorMsg(
              data?.message ||
              (isEn
                ? 'Request rejected. Please wait before trying again.'
                : 'Yêu cầu bị chặn do chống spam hoặc vượt giới hạn trong ngày!')
            );
          } else if (data && typeof data.cooldown === 'number' && data.cooldown > 0) {
            setCountdownSeconds(data.cooldown);
          }
        })
        .catch((err) => {
          console.warn('Lỗi gửi ngầm booking:', err);
        });
    } catch (err: any) {
      console.error('Lỗi gửi lịch hẹn:', err);
      setErrorMsg(isEn ? 'Network error. Please try again.' : 'Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyBookingCode = () => {
    if (!bookingResult) return;
    navigator.clipboard.writeText(bookingResult.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="booking"
      className={`relative ${
        isModal
          ? 'p-0'
          : 'py-16 sm:py-24 text-slate-900 bg-[#F4F7F4] border-y border-slate-200/80 overflow-hidden'
      }`}
    >
      {!isModal && <div id="contact" className="absolute -top-20 pointer-events-none" />}

      <div className={`relative z-10 max-w-6xl mx-auto ${isModal ? 'p-0' : 'px-4 sm:px-6'}`}>
        {!isModal && (
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            {titleHtml ? (
              <div
                className="rich-text-preview font-editorial text-3xl sm:text-5xl font-normal tracking-tight text-slate-900 mb-3 [&_p]:m-0 [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0 [&_h2]:font-editorial [&_h2]:text-3xl [&_h2]:sm:text-5xl [&_h2]:font-normal [&_h2]:tracking-tight"
                dangerouslySetInnerHTML={{ __html: titleHtml }}
              />
            ) : (
              <h2 className="font-editorial text-3xl sm:text-5xl font-normal tracking-tight text-slate-900 mb-3">
                {isEn ? 'Book Your ' : 'Đặt Lịch Hẹn '}
                <span className="italic font-light text-[#2D5A27]">
                  {isEn ? 'Online Appointment' : 'Trực Tuyến'}
                </span>
              </h2>
            )}
            {descHtml ? (
              <div
                className="text-sm text-slate-600 font-light rich-text-preview"
                dangerouslySetInnerHTML={{ __html: descHtml }}
              />
            ) : (
              <p className="text-sm text-slate-600 font-light">
                {isEn
                  ? 'Register in advance for priority consultation, Fear-Free space and zero waiting time.'
                  : 'Đăng ký trước để được tiếp đón theo khung giờ, không cần chờ đợi bốc số.'}
              </p>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* CASE 1: KẾT QUẢ TIẾP NHẬN ĐẶT HẸN & TƯ VẤN (TINH GỌN, TRANG NHÃ) */}
        {/* ======================================================== */}
        {bookingResult ? (
          <div className="p-6 sm:p-10 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-center animate-in fade-in duration-300 text-slate-900 max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#2D5A27] flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              {isEn ? 'Thank you for Booking & Consultation' : 'Cảm ơn bạn đã Đặt Hẹn & Tư Vấn'}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
              {isEn
                ? 'PetM&M Customer Care Department has received your information and will contact you as soon as possible. Thank you for your trust and choosing PetM&M.'
                : 'Bộ Phận CSKH của PetM&M đã tiếp nhận thông tin và sẽ liên hệ lại sớm nhất. Cảm ơn quý khách hàng đã tin tưởng lựa chọn.'}
            </p>

            {/* Bảng thông tin tóm tắt tinh gọn, không màu mè */}
            <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-left mb-5 text-xs sm:text-sm space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-500">{isEn ? 'Full Name:' : 'Họ Tên:'}</span>
                <span className="font-semibold text-slate-900">{bookingResult.ownerName}</span>
              </div>
              {bookingResult.phone && (
                <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">{isEn ? 'Phone:' : 'SDT:'}</span>
                  <span className="font-semibold text-slate-900">{bookingResult.phone}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-500">{isEn ? 'Date:' : 'Thời Gian:'}</span>
                <span className="font-semibold text-slate-900">{bookingResult.date || bookingResult.dateTime}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                <span className="text-slate-500">{isEn ? 'Time Slot:' : 'Khung Giờ:'}</span>
                <span className="font-semibold text-slate-900">{bookingResult.timeSlot || (isEn ? 'Flexible' : 'Linh hoạt')}</span>
              </div>
              {bookingResult.branchName && (
                <div className="flex justify-between items-center py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">{isEn ? 'Branch:' : 'Chi Nhánh:'}</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[260px] text-right">{bookingResult.branchName}</span>
                </div>
              )}
              {bookingResult.service && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">{isEn ? 'Service:' : 'Dịch Vụ:'}</span>
                  <span className="font-medium text-emerald-800">{bookingResult.service}</span>
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mb-3">
              {isEn ? 'For any inquiries, please contact Hotline:' : 'Mọi thắc mắc xin liên hệ Hotline:'}{' '}
              <strong className="text-slate-900 font-bold">{hotlineDisplay}</strong>
            </p>

            <div className="flex items-center justify-center pt-1">
              <a
                href={`tel:${hotlineRaw}`}
                className="px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-[#2D5A27] hover:bg-[#23471f] text-white transition shadow-sm inline-flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{`Hotline: ${hotlineDisplay}`}</span>
              </a>
            </div>

            {bookingResult.email && (
              <p className="text-[11px] text-slate-400 mt-4">
                {isEn
                  ? `Information has been sent to ${bookingResult.email}`
                  : `Thông tin tiếp nhận đã được gửi đến email ${bookingResult.email}`}
              </p>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* CASE 2: BỐ CỤC 2 CỘT (FORM BÊN TRÁI — ẢNH BÌA BÊN PHẢI) */
          /* ======================================================== */
          <div className="bg-white rounded-3xl sm:rounded-[32px] border border-slate-200/90 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            {/* CỘT TRÁI: FORM NHẬP LIỆU TINH GỌN */}
            <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
              <div>
                {/* Form Header trong Modal hoặc On-page */}
                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {isEn ? 'Appointment & Consultation' : 'Đặt Lịch & Tư Vấn'}
                  </h3>
                </div>

                {countdownSeconds > 0 ? (
                  <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs sm:text-sm font-semibold mb-5 shadow-xs transition-all">
                    <Clock className="w-4 h-4 shrink-0 text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
                    <span>
                      {isEn
                        ? `Please try again in ${countdownSeconds}s`
                        : `Vui lòng gửi lại sau ${countdownSeconds}s`}
                    </span>
                  </div>
                ) : errorMsg ? (
                  <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMsg}</span>
                  </div>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* HÀNG 1: Họ và tên của bạn * & Số điện thoại * */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isEn ? 'Full Name' : 'Họ và tên của bạn'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          placeholder=""
                          required
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 text-xs sm:text-sm outline-none transition text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isEn ? 'Phone Number' : 'Số điện thoại'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder=""
                          required
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 text-xs sm:text-sm outline-none transition text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* HÀNG 2: Gmail / Email & Dịch vụ khám (droplist web) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Ô nhập Gmail / Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isEn ? 'Gmail / Email' : 'Gmail / Email'}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder=""
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 text-xs sm:text-sm outline-none transition text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Droplist dịch vụ của Web gọn gàng */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isEn ? 'Select Service' : 'Dịch vụ khám'}
                      </label>
                      <div className="relative" ref={serviceDropdownRef}>
                        <button
                          type="button"
                          onClick={() => {
                            setIsServiceDropdownOpen(!isServiceDropdownOpen);
                            setIsBranchDropdownOpen(false);
                            setIsTimeDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between pl-3.5 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 text-xs sm:text-sm outline-none transition text-left text-slate-900 cursor-pointer"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className={service ? 'text-slate-900 font-medium truncate' : 'text-slate-400 truncate'}>
                              {service || (isEn ? '-- Select Service --' : '-- Chọn dịch vụ --')}
                            </span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isServiceDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                        </button>

                        {isServiceDropdownOpen && (
                          <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden max-h-60 overflow-y-auto text-xs sm:text-sm divide-y divide-slate-100">
                            <div
                              onClick={() => {
                                setService('');
                                setIsServiceDropdownOpen(false);
                              }}
                              className={`px-3.5 py-2.5 cursor-pointer hover:bg-emerald-50/70 transition flex items-center justify-between ${
                                !service ? 'bg-emerald-50/50 font-semibold text-[#2D5A27]' : 'text-slate-600'
                              }`}
                            >
                              <span>{isEn ? '-- Decide at clinic --' : '-- Tư vấn tại phòng khám --'}</span>
                              {!service && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                            </div>

                            {/* Danh mục: Thú Y & Y Tế */}
                            <div>
                              <div className="px-3.5 py-1.5 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                {isEn ? 'Veterinary & Medicine' : 'Thú Y & Y Tế'}
                              </div>
                              {(dbServices.length > 0
                                ? dbServices.filter((s) => s.nhom_dich_vu === 'medical')
                                : servicesData.filter((s) => s.category === 'medical')
                              ).map((s: any) => {
                                const title = (isEn && s.ten_dich_vu_en) || s.ten_dich_vu || s.title;
                                const isSelected = service === title;
                                return (
                                  <div
                                    key={s.id}
                                    onClick={() => {
                                      setService(title);
                                      setIsServiceDropdownOpen(false);
                                    }}
                                    className={`px-3.5 py-2 cursor-pointer hover:bg-emerald-50 transition flex items-center justify-between ${
                                      isSelected ? 'bg-emerald-50 font-semibold text-[#2D5A27]' : 'text-slate-700'
                                    }`}
                                  >
                                    <span className="truncate">{title}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Danh mục: Chăm Sóc & Spa */}
                            <div>
                              <div className="px-3.5 py-1.5 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                {isEn ? 'Pet Care & Spa' : 'Chăm Sóc & Spa'}
                              </div>
                              {(dbServices.length > 0
                                ? dbServices.filter((s) => s.nhom_dich_vu === 'care')
                                : servicesData.filter((s) => s.category === 'care')
                              ).map((s: any) => {
                                const title = (isEn && s.ten_dich_vu_en) || s.ten_dich_vu || s.title;
                                const isSelected = service === title;
                                return (
                                  <div
                                    key={s.id}
                                    onClick={() => {
                                      setService(title);
                                      setIsServiceDropdownOpen(false);
                                    }}
                                    className={`px-3.5 py-2 cursor-pointer hover:bg-emerald-50 transition flex items-center justify-between ${
                                      isSelected ? 'bg-emerald-50 font-semibold text-[#2D5A27]' : 'text-slate-700'
                                    }`}
                                  >
                                    <span className="truncate">{title}</span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* HÀNG 3: Ngày hẹn (không cho chọn ngày trước hôm nay) & Khung giờ hẹn (không cho chọn giờ đã qua hôm nay) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isEn ? 'Appointment Date' : 'Ngày hẹn'}
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="date"
                          value={date}
                          min={todayVN}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val && val < todayVN) {
                              setDate(todayVN);
                            } else {
                              setDate(val);
                            }
                          }}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 text-xs sm:text-sm outline-none transition text-slate-900 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Droplist Khung giờ của Web gọn gàng */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isEn ? 'Time Slot' : 'Khung giờ hẹn'}
                      </label>
                      <div className="relative" ref={timeDropdownRef}>
                        <button
                          type="button"
                          onClick={() => {
                            setIsTimeDropdownOpen(!isTimeDropdownOpen);
                            setIsBranchDropdownOpen(false);
                            setIsServiceDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between pl-3.5 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 text-xs sm:text-sm outline-none transition text-left text-slate-900 cursor-pointer"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className={timeSlot ? 'text-slate-900 font-medium truncate' : 'text-slate-400 truncate'}>
                              {timeSlot || (isEn ? '-- Select Time --' : '-- Chọn khung giờ --')}
                            </span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isTimeDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                        </button>

                        {isTimeDropdownOpen && (
                          <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden max-h-64 overflow-y-auto text-xs sm:text-sm divide-y divide-slate-100 p-2">
                            <div
                              onClick={() => {
                                setTimeSlot('');
                                setIsTimeDropdownOpen(false);
                              }}
                              className={`px-3 py-2 rounded-xl cursor-pointer hover:bg-emerald-50 transition flex items-center justify-between ${
                                !timeSlot ? 'bg-emerald-50/80 font-semibold text-[#2D5A27]' : 'text-slate-600'
                              }`}
                            >
                              <span>{isEn ? '-- Flexible --' : '-- Linh hoạt --'}</span>
                              {!timeSlot && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                            </div>

                            {/* Buổi Sáng */}
                            <div className="pt-2">
                              <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                {isEn ? 'Morning (08:00 - 11:30)' : 'Buổi Sáng (08:00 - 11:30)'}
                              </div>
                              <div className="grid grid-cols-2 gap-1 mt-1">
                                {TIME_SLOTS.slice(0, 7).map((slot) => {
                                  const isPassed = isSlotPassedToday(slot, date);
                                  const isSelected = timeSlot === slot;
                                  return (
                                    <button
                                      type="button"
                                      key={slot}
                                      disabled={isPassed}
                                      onClick={() => {
                                        if (!isPassed) {
                                          setTimeSlot(slot);
                                          setIsTimeDropdownOpen(false);
                                        }
                                      }}
                                      className={`py-1.5 px-2.5 rounded-lg text-left text-xs font-medium transition flex items-center justify-between ${
                                        isPassed
                                          ? 'bg-slate-100 text-slate-300 line-through cursor-not-allowed opacity-50'
                                          : isSelected
                                          ? 'bg-[#2D5A27] text-white shadow-xs cursor-pointer'
                                          : 'bg-slate-50 hover:bg-emerald-50 hover:text-[#2D5A27] text-slate-700 cursor-pointer'
                                      }`}
                                      title={isPassed ? 'Khung giờ này đã qua hôm nay' : slot}
                                    >
                                      <span>{slot}</span>
                                      {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                                      {isPassed && <span className="text-[10px] text-slate-400 no-underline font-normal">Đã qua</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Buổi Chiều */}
                            <div className="pt-2">
                              <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                {isEn ? 'Afternoon (13:30 - 17:00)' : 'Buổi Chiều (13:30 - 17:00)'}
                              </div>
                              <div className="grid grid-cols-2 gap-1 mt-1">
                                {TIME_SLOTS.slice(7, 14).map((slot) => {
                                  const isPassed = isSlotPassedToday(slot, date);
                                  const isSelected = timeSlot === slot;
                                  return (
                                    <button
                                      type="button"
                                      key={slot}
                                      disabled={isPassed}
                                      onClick={() => {
                                        if (!isPassed) {
                                          setTimeSlot(slot);
                                          setIsTimeDropdownOpen(false);
                                        }
                                      }}
                                      className={`py-1.5 px-2.5 rounded-lg text-left text-xs font-medium transition flex items-center justify-between ${
                                        isPassed
                                          ? 'bg-slate-100 text-slate-300 line-through cursor-not-allowed opacity-50'
                                          : isSelected
                                          ? 'bg-[#2D5A27] text-white shadow-xs cursor-pointer'
                                          : 'bg-slate-50 hover:bg-emerald-50 hover:text-[#2D5A27] text-slate-700 cursor-pointer'
                                      }`}
                                      title={isPassed ? 'Khung giờ này đã qua hôm nay' : slot}
                                    >
                                      <span>{slot}</span>
                                      {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                                      {isPassed && <span className="text-[10px] text-slate-400 no-underline font-normal">Đã qua</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Buổi Tối */}
                            <div className="pt-2">
                              <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                {isEn ? 'Evening (17:00 - 20:00)' : 'Buổi Tối (17:00 - 20:00)'}
                              </div>
                              <div className="grid grid-cols-2 gap-1 mt-1">
                                {TIME_SLOTS.slice(14).map((slot) => {
                                  const isPassed = isSlotPassedToday(slot, date);
                                  const isSelected = timeSlot === slot;
                                  return (
                                    <button
                                      type="button"
                                      key={slot}
                                      disabled={isPassed}
                                      onClick={() => {
                                        if (!isPassed) {
                                          setTimeSlot(slot);
                                          setIsTimeDropdownOpen(false);
                                        }
                                      }}
                                      className={`py-1.5 px-2.5 rounded-lg text-left text-xs font-medium transition flex items-center justify-between ${
                                        isPassed
                                          ? 'bg-slate-100 text-slate-300 line-through cursor-not-allowed opacity-50'
                                          : isSelected
                                          ? 'bg-[#2D5A27] text-white shadow-xs cursor-pointer'
                                          : 'bg-slate-50 hover:bg-emerald-50 hover:text-[#2D5A27] text-slate-700 cursor-pointer'
                                      }`}
                                      title={isPassed ? 'Khung giờ này đã qua hôm nay' : slot}
                                    >
                                      <span>{slot}</span>
                                      {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                                      {isPassed && <span className="text-[10px] text-slate-400 no-underline font-normal">Đã qua</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* HÀNG 4: Chi nhánh (droplist web, lấy địa chỉ trong cài đặt chi nhánh) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isEn ? 'Branch' : 'Chi nhánh'}
                    </label>
                    <div className="relative" ref={branchDropdownRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsBranchDropdownOpen(!isBranchDropdownOpen);
                          setIsServiceDropdownOpen(false);
                          setIsTimeDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between pl-3.5 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 text-xs sm:text-sm outline-none transition text-left text-slate-900 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className={branch ? 'text-slate-900 font-medium truncate' : 'text-slate-400 truncate'}>
                            {(() => {
                              const found = dbBranches.find((b) => b.id === branch);
                              if (!found) return isEn ? '-- Select Branch --' : '-- Chọn chi nhánh --';
                              const addr = (isEn && found.dia_chi_en) || found.dia_chi || '';
                              const name = (isEn && (found.ten_chi_nhanh_en || found.ten_ngan_en)) || found.ten_chi_nhanh || found.ten_ngan || '';
                              return addr || name || (isEn ? '-- Select Branch --' : '-- Chọn chi nhánh --');
                            })()}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                            isBranchDropdownOpen ? 'rotate-180 text-emerald-600' : ''
                          }`}
                        />
                      </button>

                      {isBranchDropdownOpen && (
                        <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden max-h-60 overflow-y-auto text-xs sm:text-sm divide-y divide-slate-100">
                          <div
                            onClick={() => {
                              setBranch('');
                              setIsBranchDropdownOpen(false);
                            }}
                            className={`px-3.5 py-2.5 cursor-pointer hover:bg-emerald-50/70 transition flex items-center justify-between ${
                              !branch ? 'bg-emerald-50/50 font-semibold text-[#2D5A27]' : 'text-slate-600'
                            }`}
                          >
                            <span>{isEn ? '-- Flexible branch --' : '-- Linh hoạt cơ sở khám --'}</span>
                            {!branch && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          </div>

                          {dbBranches.map((b) => {
                            const isSelected = branch === b.id;
                            const address = (isEn && b.dia_chi_en) || b.dia_chi;
                            const name = (isEn && (b.ten_chi_nhanh_en || b.ten_ngan_en)) || b.ten_chi_nhanh || b.ten_ngan;
                            return (
                              <div
                                key={b.id}
                                onClick={() => {
                                  setBranch(b.id);
                                  setIsBranchDropdownOpen(false);
                                }}
                                className={`px-3.5 py-2.5 cursor-pointer hover:bg-emerald-50 transition flex items-center justify-between gap-2 ${
                                  isSelected ? 'bg-emerald-50 font-semibold text-[#2D5A27]' : 'text-slate-700'
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold text-xs sm:text-sm truncate text-slate-800">
                                    {address || name}
                                  </div>
                                  {address && name && (
                                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                                      {name}
                                      {b.la_co_so_chinh && (isEn ? ' • Main Branch' : ' • Cơ sở chính')}
                                    </div>
                                  )}
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* HÀNG 5: Ghi chú / Triệu chứng */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isEn ? 'Notes / Symptoms' : 'Ghi chú / Triệu chứng'}
                    </label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder=""
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 text-xs sm:text-sm outline-none transition resize-none text-slate-900"
                    />
                  </div>

                  {/* NÚT XÁC NHẬN TINH GỌN */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || countdownSeconds > 0}
                      className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl font-bold text-sm text-white shadow-lg shadow-emerald-950/20 transition-all duration-200 cursor-pointer ${
                        countdownSeconds > 0
                          ? 'bg-amber-600/85 cursor-not-allowed opacity-90'
                          : 'bg-gradient-to-r from-[#2D5A27] via-emerald-700 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50'
                      }`}
                    >
                      {countdownSeconds > 0 ? (
                        <Clock className="w-4 h-4 text-amber-200 animate-spin" style={{ animationDuration: '4s' }} />
                      ) : (
                        <CalendarCheck className="w-4 h-4 text-[#FFB800]" />
                      )}
                      <span className="tracking-wide">
                        {isSubmitting
                          ? (isEn ? 'Processing...' : 'Đang xử lý...')
                          : countdownSeconds > 0
                          ? (isEn ? `Please try again in ${countdownSeconds}s` : `Vui lòng gửi lại sau ${countdownSeconds}s`)
                          : (isEn ? 'Confirm Appointment & Consultation' : 'Xác Nhận Đặt Lịch & Tư Vấn')}
                      </span>
                    </button>

                    <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 mt-3 font-light">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {isEn ? 'Confidential 100%' : 'Bảo mật thông tin'}
                      </span>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* CỘT PHẢI: ẢNH BÌA & THÔNG TIN CẤU HÌNH THIẾT KẾ TỪ ADMIN */}
            <div className="hidden lg:flex lg:col-span-5 relative min-h-[560px] bg-slate-100 overflow-hidden flex-col justify-between p-8 text-white">
              {/* Ảnh nền giữ hiệu ứng tự nhiên, sáng rõ ràng không bị tối đục */}
              <img
                src={coverImage || DEFAULT_COVER_IMAGE}
                alt="PetM&M Veterinary Clinic"
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 hover:scale-102"
              />
              {/* Chỉ phủ lớp chuyển bóng mờ nhẹ ở phần chân đáy để chữ hiển thị tương phản rõ nét */}
              <div className="absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-slate-950/95 via-slate-950/65 to-transparent pointer-events-none" />

              {/* Huy hiệu đỉnh */}
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/25 text-white text-xs font-bold shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-[#FFB800] animate-pulse" />
                  <span>PetM&M Medical Center</span>
                </div>
              </div>

              {/* Thông tin hỗ trợ và cam kết dưới đáy ảnh bìa */}
              <div className="relative z-10 space-y-4">
                <div>
                  <h4 className="font-editorial text-2xl font-normal text-white leading-tight">
                    {isEn ? rightColConfig.titleEn : rightColConfig.titleVi}
                  </h4>
                  <p className="text-xs text-slate-300 font-light mt-1.5 leading-relaxed">
                    {isEn ? rightColConfig.descEn : rightColConfig.descVi}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/15 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{isEn ? rightColConfig.commit1En : rightColConfig.commit1Vi}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{isEn ? rightColConfig.commit2En : rightColConfig.commit2Vi}</span>
                  </div>
                </div>

                <a
                  href={`tel:${hotlineRaw}`}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-300 font-light uppercase tracking-wider">
                        Hotline
                      </div>
                      <div className="text-sm font-bold text-white font-mono">{hotlineDisplay}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 group-hover:translate-x-1 transition">
                    {isEn ? 'Call Now →' : 'Gọi Ngay →'}
                  </span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
