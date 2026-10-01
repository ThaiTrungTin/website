'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase, ChiNhanhRecord, DichVuRecord } from '@/lib/supabase';
import { branchesData } from '@/data/branchesData';
import { servicesData } from '@/data/servicesData';
import { useLanguage } from '@/context/LanguageContext';
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
} from 'lucide-react';

interface BookingSectionProps {
  initialService?: string;
  isModal?: boolean;
  onSuccess?: () => void;
}

const DEFAULT_COVER_IMAGE = '/about_consultation.jpg';

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
  const isEn = language === 'en';

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

  const [date, setDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('09:00 - 09:30');
  const [note, setNote] = useState('');

  const [coverImage, setCoverImage] = useState(DEFAULT_COVER_IMAGE);
  const [dbBranches, setDbBranches] = useState<ChiNhanhRecord[]>([]);
  const [dbServices, setDbServices] = useState<DichVuRecord[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    code: string;
    ownerName: string;
    petName: string;
    branchName: string;
    service: string;
    dateTime: string;
    emailSent?: boolean;
    email?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Tải chi nhánh, dịch vụ và ảnh bìa từ database
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
          if (!branch) setBranch(bData[0].id);
        } else if (branchesData.length > 0 && !branch) {
          setBranch(branchesData[0].id);
        }

        const { data: sData } = await supabase
          .from('dich_vu')
          .select('*')
          .eq('kich_hoat', true)
          .order('thu_tu', { ascending: true });
        if (sData && sData.length > 0) {
          setDbServices(sData);
        }

        // Tải ảnh bìa lịch hẹn cấu hình trong bảng cau_hinh
        const { data: cfgData } = await supabase
          .from('cau_hinh')
          .select('logo_favicon')
          .eq('id', 'booking_config')
          .maybeSingle();
        if (cfgData?.logo_favicon && cfgData.logo_favicon.trim()) {
          setCoverImage(cfgData.logo_favicon.trim());
        }
      } catch (err) {
        console.warn('Lỗi tải dữ liệu cho form đặt lịch:', err);
      }
    }
    loadData();

    // Lắng nghe cập nhật ảnh bìa realtime từ Admin
    const handleCoverUpdate = (e: any) => {
      if (e?.detail?.url) setCoverImage(e.detail.url);
    };
    window.addEventListener('petmm_booking_cover_updated', handleCoverUpdate);
    return () => window.removeEventListener('petmm_booking_cover_updated', handleCoverUpdate);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!ownerName.trim()) {
      setErrorMsg(isEn ? 'Please enter your full name' : 'Vui lòng nhập họ và tên chủ nuôi');
      return;
    }
    if (!phone.trim() || phone.trim().length < 9) {
      setErrorMsg(isEn ? 'Please enter a valid phone number (at least 9 digits)' : 'Vui lòng nhập số điện thoại hợp lệ (ít nhất 9 số)');
      return;
    }
    if (!petName.trim()) {
      setErrorMsg(isEn ? "Please enter your pet's name" : 'Vui lòng nhập tên của bé thú cưng');
      return;
    }
    if (!branch) {
      setErrorMsg(isEn ? 'Please select a clinic branch' : 'Vui lòng chọn cơ sở khám cho bé');
      return;
    }

    setIsSubmitting(true);

    try {
      // Tìm tên chi nhánh hiển thị
      let branchName = isEn ? 'Pet M&M Veterinary Clinic' : 'Cơ sở Pet M&M';
      if (dbBranches.length > 0) {
        const found = dbBranches.find((b) => b.id === branch);
        if (found) {
          branchName = isEn && found.ten_ngan_en ? found.ten_ngan_en : (found.ten_ngan || found.ten_chi_nhanh);
        }
      } else {
        const found = branchesData.find((b) => b.id === branch);
        if (found) branchName = found.shortName;
      }

      // Gửi yêu cầu qua API endpoint `/api/booking`
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName: ownerName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          petName: petName.trim(),
          petType,
          branch,
          branchName,
          service: service.trim(),
          date,
          timeSlot,
          note: note.trim(),
          isEn,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Lỗi khi gửi lịch hẹn');
      }

      setBookingResult({
        code: data.booking.code,
        ownerName: data.booking.ownerName,
        petName: data.booking.petName,
        branchName: data.booking.branchName,
        service: data.booking.service,
        dateTime: data.booking.dateTime,
        emailSent: data.booking.emailSent,
        email: email.trim(),
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Lỗi gửi lịch hẹn:', err);
      setErrorMsg(
        isEn
          ? 'Failed to submit appointment. Please try again or call our Hotline.'
          : 'Có lỗi xảy ra khi gửi lịch hẹn. Vui lòng thử lại hoặc gọi Hotline 0364 605 544.'
      );
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

  const resetForm = () => {
    setBookingResult(null);
    setOwnerName('');
    setPhone('');
    setEmail('');
    setPetName('');
    setService('');
    setNote('');
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/90 text-[#2D5A27] text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>{isEn ? 'PRIORITY CLINIC BOOKING' : 'ĐẶT LỊCH KHÁM ƯU TIÊN'}</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl font-normal tracking-tight text-slate-900 mb-3">
              {isEn ? 'Book Your ' : 'Đặt Lịch Hẹn '}
              <span className="italic font-light text-[#2D5A27]">
                {isEn ? 'Online Appointment' : 'Trực Tuyến'}
              </span>
            </h2>
            <p className="text-sm text-slate-600 font-light">
              {isEn
                ? 'Register in advance for priority consultation, Fear-Free space and zero waiting time.'
                : 'Đăng ký trước để được tiếp đón theo khung giờ, không cần chờ đợi bốc số.'}
            </p>
          </div>
        )}

        {/* ======================================================== */}
        {/* CASE 1: KẾT QUẢ ĐẶT HẸN THÀNH CÔNG (BOARDING PASS TICKET) */}
        {/* ======================================================== */}
        {bookingResult ? (
          <div className="p-6 sm:p-10 rounded-3xl bg-white border border-emerald-200 shadow-2xl text-center animate-in fade-in duration-300 text-slate-900 max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#2D5A27] border border-emerald-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-widest text-[#2D5A27] bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200 inline-block">
              {isEn ? 'Appointment Confirmed' : 'Lịch Hẹn Tiếp Nhận Thành Công'}
            </span>

            <h3 className="font-editorial text-2xl sm:text-3xl font-normal text-slate-900 mt-4 mb-2">
              {isEn
                ? `Welcome, ${bookingResult.ownerName} & ${bookingResult.petName}!`
                : `Hân hạnh đón tiếp ba mẹ & bé ${bookingResult.petName}!`}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-6 font-light">
              {bookingResult.emailSent
                ? (isEn
                    ? `A confirmation email has been sent to ${bookingResult.email}. Our staff will also contact you within 10 minutes.`
                    : `Thư xác nhận đã được gửi đến email ${bookingResult.email}. Bác sĩ sẽ liên hệ hỗ trợ bạn trong vòng 10 phút.`)
                : (isEn
                    ? `A specialist at ${bookingResult.branchName} will contact you shortly to confirm.`
                    : `Bác sĩ chuyên khoa tại ${bookingResult.branchName} sẽ liên hệ xác nhận trong vòng 10 phút.`)}
            </p>

            {/* Boarding Pass Box */}
            <div className="max-w-lg mx-auto p-5 sm:p-6 rounded-2xl bg-[#F8FAF7] border border-slate-200 text-left mb-6 shadow-xs">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 mb-4">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    {isEn ? 'Booking Code:' : 'Mã số tiếp nhận:'}
                  </span>
                  <span className="text-xl font-bold text-[#2D5A27] font-mono">
                    {bookingResult.code}
                  </span>
                </div>
                <button
                  onClick={copyBookingCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition shadow-2xs cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span>{copied ? (isEn ? 'Copied!' : 'Đã chép!') : (isEn ? 'Copy' : 'Sao chép')}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3.5 text-xs">
                <div>
                  <span className="text-slate-500 block font-light">{isEn ? 'Pet Parent:' : 'Chủ nuôi:'}</span>
                  <span className="font-bold text-slate-900 text-sm">{bookingResult.ownerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-light">{isEn ? 'Pet:' : 'Bé cưng:'}</span>
                  <span className="font-bold text-slate-900 text-sm">{bookingResult.petName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-light">{isEn ? 'Branch:' : 'Cơ sở:'}</span>
                  <span className="font-bold text-[#2D5A27] text-sm">{bookingResult.branchName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-light">{isEn ? 'Schedule:' : 'Thời gian:'}</span>
                  <span className="font-bold text-slate-900 text-sm">{bookingResult.dateTime}</span>
                </div>
                <div className="col-span-2 pt-2.5 border-t border-slate-200">
                  <span className="text-slate-500 block font-light">{isEn ? 'Service:' : 'Dịch vụ:'}</span>
                  <span className="font-bold text-[#2D5A27] text-sm">{bookingResult.service}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={resetForm}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#2D5A27] to-emerald-700 hover:from-emerald-800 hover:to-emerald-900 text-white transition shadow-md cursor-pointer"
              >
                {isEn ? 'Book Another' : 'Đặt Thêm Lịch Hẹn'}
              </button>
              <a
                href="tel:0364605544"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition"
              >
                Hotline: 0364 605 544
              </a>
            </div>
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
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#2D5A27] text-[11px] font-bold border border-emerald-200/70 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
                    <span>{isEn ? 'Online Appointment' : 'Đặt Lịch Hẹn Trực Tuyến'}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {isEn ? 'Pet Healthcare & Spa Booking' : 'Đặt Lịch Khám & Chăm Sóc Thú Cưng'}
                  </h3>
                  <p className="text-xs text-slate-500 font-light mt-1">
                    {isEn
                      ? 'Fast registration in 1 minute. Free cancellation anytime.'
                      : 'Đăng ký nhanh trong 1 phút, nhận xác nhận qua Email & SMS.'}
                  </p>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* TIÊU ĐỀ SECTION: 1. THÔNG TIN LIÊN HỆ CHỦ NUÔI */}
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-[#2D5A27] flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A27]">
                      {isEn ? '1. Pet Parent Contact Information' : '1. Thông tin liên hệ chủ nuôi'}
                    </span>
                  </div>

                  {/* Họ tên & Số điện thoại (Grid 2 cột) */}
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
                          placeholder={isEn ? 'e.g. John Doe' : 'VD: Nguyễn Văn A'}
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
                          placeholder={isEn ? 'e.g. 0364 605 544' : 'VD: 0364 605 544'}
                          required
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 text-xs sm:text-sm outline-none transition text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Gmail / Email nhận xác nhận (Full Row) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isEn ? 'Gmail / Email (to receive confirmation)' : 'Gmail / Email (để gửi mail xác nhận)'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={isEn ? 'e.g. yourname@gmail.com' : 'VD: yourname@gmail.com'}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 text-xs sm:text-sm outline-none transition text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Tên bé & Loài thú cưng (Droplist thanh lịch) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isEn ? "Pet's Name" : 'Tên của bé'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Heart className="w-4 h-4 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={petName}
                          onChange={(e) => setPetName(e.target.value)}
                          placeholder={isEn ? 'e.g. Milo, Luna...' : 'VD: Lu, Miu, Bông...'}
                          required
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 text-xs sm:text-sm outline-none transition text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isEn ? 'Pet Species' : 'Loài thú cưng'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={petType}
                          onChange={(e) => setPetType(e.target.value)}
                          className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 text-xs sm:text-sm outline-none transition text-slate-900 cursor-pointer"
                        >
                          <option value="dog">{isEn ? 'Dog' : 'Chó'}</option>
                          <option value="cat">{isEn ? 'Cat' : 'Mèo'}</option>
                          <option value="other">
                            {isEn ? 'Other Species (Rabbit, Hamster...)' : 'Loài khác (Thỏ, Hamster, Chim...)'}
                          </option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Cơ sở & Chọn Dịch vụ (Dịch vụ KHÔNG BẮT BUỘC) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isEn ? 'Clinic Branch' : 'Cơ sở khám bệnh'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          required
                          className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 text-xs outline-none transition text-slate-900 cursor-pointer"
                        >
                          <option value="" disabled>
                            {isEn ? '-- Select Branch --' : '-- Chọn cơ sở tiếp đón --'}
                          </option>
                          {dbBranches.length > 0
                            ? dbBranches.map((b) => (
                                <option key={b.id} value={b.id}>
                                  {(isEn && b.ten_ngan_en) || b.ten_ngan || b.ten_chi_nhanh}
                                </option>
                              ))
                            : branchesData.map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.shortName} - {b.district}
                                </option>
                              ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isEn ? 'Select Service (Optional)' : 'Chọn dịch vụ (Không bắt buộc)'}
                      </label>
                      <div className="relative">
                        <select
                          value={service}
                          onChange={(e) => setService(e.target.value)}
                          className="w-full appearance-none pl-3.5 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 text-xs outline-none transition text-slate-900 cursor-pointer"
                        >
                          <option value="">
                            {isEn ? '-- Optional: Decide at clinic --' : '-- Tùy chọn: Tư vấn tại viện --'}
                          </option>
                          {dbServices.length > 0 ? (
                            <>
                              <optgroup label={isEn ? 'Veterinary & Medicine' : 'Thú Y & Y Tế'}>
                                {dbServices
                                  .filter((s) => s.nhom_dich_vu === 'medical')
                                  .map((s) => (
                                    <option key={s.id} value={(isEn && s.ten_dich_vu_en) || s.ten_dich_vu}>
                                      {(isEn && s.ten_dich_vu_en) || s.ten_dich_vu}
                                    </option>
                                  ))}
                              </optgroup>
                              <optgroup label={isEn ? 'Spa & Hotel' : 'Chăm Sóc & Spa'}>
                                {dbServices
                                  .filter((s) => s.nhom_dich_vu === 'care')
                                  .map((s) => (
                                    <option key={s.id} value={(isEn && s.ten_dich_vu_en) || s.ten_dich_vu}>
                                      {(isEn && s.ten_dich_vu_en) || s.ten_dich_vu}
                                    </option>
                                  ))}
                              </optgroup>
                            </>
                          ) : (
                            <>
                              <optgroup label={isEn ? 'Veterinary & Medicine' : 'Thú Y & Y Tế'}>
                                {servicesData
                                  .filter((s) => s.category === 'medical')
                                  .map((s) => (
                                    <option key={s.id} value={s.title}>
                                      {s.title}
                                    </option>
                                  ))}
                              </optgroup>
                              <optgroup label={isEn ? 'Spa & Hotel' : 'Chăm Sóc & Spa'}>
                                {servicesData
                                  .filter((s) => s.category === 'care')
                                  .map((s) => (
                                    <option key={s.id} value={s.title}>
                                      {s.title}
                                    </option>
                                  ))}
                              </optgroup>
                            </>
                          )}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Ngày hẹn & Khung giờ (DROPLIST) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isEn ? 'Appointment Date' : 'Ngày hẹn'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="date"
                          value={date}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setDate(e.target.value)}
                          required
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 text-xs sm:text-sm outline-none transition text-slate-900 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {isEn ? 'Time Slot (Droplist)' : 'Khung giờ hẹn (Droplist)'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={timeSlot}
                          onChange={(e) => setTimeSlot(e.target.value)}
                          required
                          className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 text-xs sm:text-sm outline-none transition text-slate-900 cursor-pointer"
                        >
                          <optgroup label={isEn ? 'Morning (08:00 - 11:30)' : 'Buổi Sáng (08:00 - 11:30)'}>
                            {TIME_SLOTS.slice(0, 7).map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label={isEn ? 'Afternoon (13:30 - 17:00)' : 'Buổi Chiều (13:30 - 17:00)'}>
                            {TIME_SLOTS.slice(7, 14).map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label={isEn ? 'Evening (17:00 - 20:00)' : 'Buổi Tối (17:00 - 20:00)'}>
                            {TIME_SLOTS.slice(14).map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Ghi chú */}
                  <div className="pt-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isEn ? 'Notes / Special Requests' : 'Ghi chú / Triệu chứng (nếu có)'}
                    </label>
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={
                        isEn
                          ? 'e.g. Vaccination booster, regular health check, itchy skin...'
                          : 'VD: Khám tổng quát, tiêm nhắc vắc-xin, bé có biểu hiện ngứa ngáy...'
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 text-xs sm:text-sm outline-none transition resize-none text-slate-900"
                    />
                  </div>

                  {/* NÚT XÁC NHẬN TINH GỌN */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#2D5A27] via-emerald-700 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white shadow-lg shadow-emerald-950/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                    >
                      <CalendarCheck className="w-4 h-4 text-[#FFB800]" />
                      <span className="tracking-wide">
                        {isSubmitting
                          ? (isEn ? 'Processing...' : 'Đang xử lý...')
                          : (isEn ? 'Confirm' : 'Xác Nhận')}
                      </span>
                    </button>

                    <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 mt-3 font-light">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {isEn ? 'Confidential 100%' : 'Bảo mật thông tin'}
                      </span>
                      <span>•</span>
                      <span>{isEn ? 'Instant SMS & Email alert' : 'Xác nhận qua SMS & Email'}</span>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* CỘT PHẢI: ẢNH BÌA ĐẶT LỊCH (LƯU VÀO DTB, ĐƯỢC CHÈN/THAY TỪ ADMIN) */}
            <div className="hidden lg:flex lg:col-span-5 relative min-h-[560px] bg-slate-900 overflow-hidden flex-col justify-between p-8 text-white">
              {/* Ảnh nền */}
              <img
                src={coverImage || DEFAULT_COVER_IMAGE}
                alt="Pet M&M Veterinary Clinic"
                className="absolute inset-0 w-full h-full object-cover object-center scale-105 transition-transform duration-700 hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-slate-900/30" />

              {/* Huy hiệu đỉnh */}
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-[#FFB800] animate-pulse" />
                  <span>Pet M&M Medical Center</span>
                </div>
              </div>

              {/* Thông tin hỗ trợ và cam kết dưới đáy ảnh bìa */}
              <div className="relative z-10 space-y-4">
                <div>
                  <h4 className="font-editorial text-2xl font-normal text-white leading-tight">
                    {isEn ? 'Fear-Free & High-Standard Medical Care' : 'Chăm Sóc Y Khoa Tiêu Chuẩn 5 Sao'}
                  </h4>
                  <p className="text-xs text-slate-300 font-light mt-1.5 leading-relaxed">
                    {isEn
                      ? 'Experienced veterinarians dedicated to safeguarding your pet’s health with compassion and cutting-edge equipment.'
                      : 'Đội ngũ bác sĩ thú y chính quy, quy trình Fear-Free giảm căng thẳng tuyệt đối cho các bé cưng.'}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/15 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{isEn ? 'Zero waiting time with priority booking' : 'Khám đúng giờ theo lịch hẹn, không bốc số'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{isEn ? 'Automated email & SMS confirmation' : 'Gửi phiếu tiếp nhận tự động qua Gmail'}</span>
                  </div>
                </div>

                <a
                  href="tel:0364605544"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-300 font-light uppercase tracking-wider">
                        {isEn ? 'Hotline 24/7 Support' : 'Hotline Tư Vấn 24/7'}
                      </div>
                      <div className="text-sm font-bold text-white font-mono">0364 605 544</div>
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
