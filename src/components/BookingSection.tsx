'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ScrollRevealTitle from '@/components/ScrollRevealTitle';
import { supabase, ChiNhanhRecord, DichVuRecord } from '@/lib/supabase';
import { branchesData } from '@/data/branchesData';
import { servicesData } from '@/data/servicesData';
import { getAssetUrl } from '@/lib/assets';
import {
  CalendarCheck,
  User,
  Phone,
  Heart,
  Building,
  Stethoscope,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Copy,
} from 'lucide-react';

interface BookingSectionProps {
  initialService?: string;
  isModal?: boolean;
  onSuccess?: () => void;
}

export default function BookingSection({
  initialService = '',
  isModal = false,
  onSuccess,
}: BookingSectionProps) {
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState<'dog' | 'cat' | 'other'>('dog');
  const [branch, setBranch] = useState('');
  const [service, setService] = useState(initialService || '');

  // Tự động điền dịch vụ khi người dùng bấm Đặt Lịch từ một gói dịch vụ cụ thể
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
  const [timeSlot, setTimeSlot] = useState('09:30');
  const [note, setNote] = useState('');

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
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Tải danh sách chi nhánh và dịch vụ từ Supabase (nếu có)
  useEffect(() => {
    async function loadOptions() {
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
      } catch (err) {
        console.warn('Lỗi tải dữ liệu chi nhánh/dịch vụ cho form đặt lịch:', err);
      }
    }
    loadOptions();
  }, []);

  const timeSlots = [
    '08:30', '09:30', '10:30', '11:30',
    '14:00', '15:00', '16:00', '17:30', '19:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!ownerName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên chủ nuôi');
      return;
    }
    if (!phone.trim() || phone.length < 9) {
      setErrorMsg('Vui lòng nhập số điện thoại hợp lệ (ít nhất 9 số)');
      return;
    }
    if (!petName.trim()) {
      setErrorMsg('Vui lòng nhập tên của bé thú cưng');
      return;
    }
    if (!branch) {
      setErrorMsg('Vui lòng chọn cơ sở khám cho bé');
      return;
    }
    if (!service) {
      setErrorMsg('Vui lòng chọn dịch vụ khám hoặc chăm sóc');
      return;
    }

    setIsSubmitting(true);

    try {
      const randomCode = 'PMM-' + Math.floor(100000 + Math.random() * 900000);
      
      // Tìm tên chi nhánh hiển thị
      let branchName = 'Cơ sở Pet M&M';
      if (dbBranches.length > 0) {
        const found = dbBranches.find((b) => b.id === branch);
        if (found) branchName = found.ten_ngan || found.ten_chi_nhanh;
      } else {
        const found = branchesData.find((b) => b.id === branch);
        if (found) branchName = found.shortName;
      }

      // Lưu trực tiếp vào bảng lich_hen của Supabase
      const { error } = await supabase.from('lich_hen').insert([
        {
          ma_lich_hen: randomCode,
          ho_ten_chu: ownerName.trim(),
          so_dien_thoai: phone.trim(),
          ten_thu_cung: petName.trim(),
          loai_thu_cung: petType,
          chi_nhanh_id: branch || null,
          ten_chi_nhanh: branchName,
          dich_vu: service,
          ngay_hen: date,
          gio_hen: timeSlot,
          ghi_chu: note.trim() || null,
          trang_thai: 'cho_xac_nhan',
        },
      ]);

      if (error) {
        console.error('Lỗi lưu lịch hẹn vào Supabase:', error);
      }

      setBookingResult({
        code: randomCode,
        ownerName: ownerName.trim(),
        petName: petName.trim(),
        branchName,
        service,
        dateTime: `${timeSlot}, ngày ${date}`,
      });

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Lỗi gửi lịch hẹn:', err);
      setErrorMsg('Có lỗi xảy ra khi gửi lịch hẹn. Vui lòng thử lại hoặc gọi Hotline.');
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
    setPetName('');
    setBranch('');
    setService('');
    setNote('');
  };

  return (
    <section id="booking" className={`relative ${isModal ? 'p-0' : 'py-20 sm:py-28 overflow-hidden text-slate-900 bg-[#F8FAF7] border-y border-slate-200/80'}`}>
      {!isModal && <div id="contact" className="absolute -top-20 pointer-events-none" />}
      {/* 1. CINEMATIC BACKGROUND */}
      {!isModal && (
        <div className="absolute inset-0 z-0">
          <Image
            src={getAssetUrl('/branches_bg.jpg')}
            alt="Không gian tiếp đón Pet M&M"
            fill
            quality={90}
            className="object-cover object-center scale-105 opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAF7]/95 via-[#F8FAF7]/80 to-[#F8FAF7]/95" />
        </div>
      )}

      <div className={`relative z-10 max-w-4xl mx-auto px-4 sm:px-6 ${isModal ? 'px-0' : ''}`}>
        {!isModal && (
          <ScrollRevealTitle className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-slate-900 mb-4">
              Đặt Lịch Hẹn <span className="italic font-light text-[#2D5A27]">Trực Tuyến</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-light">
              Đăng ký khám hoặc Spa cho bé trước để được khám đúng khung giờ, không cần chờ đợi bốc số.
            </p>
          </ScrollRevealTitle>
        )}

        {bookingResult ? (
          /* Boarding Pass Result Card */
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-emerald-200 shadow-2xl text-center animate-in fade-in duration-300 text-slate-900">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#2D5A27] border border-emerald-200 flex items-center justify-center mx-auto mb-4 shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-[#2D5A27] bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200">
              Phiếu Đặt Hẹn Đã Được Xác Nhận
            </span>

            <h3 className="font-editorial text-2xl sm:text-3xl font-normal text-slate-900 mt-4 mb-2">
              Hân hạnh đón tiếp ba mẹ & bé {bookingResult.petName}!
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-8 font-light">
              Bác sĩ chuyên khoa tại {bookingResult.branchName} sẽ liên hệ xác nhận trong vòng 10 phút.
            </p>

            {/* Boarding Pass Box */}
            <div className="max-w-lg mx-auto p-6 sm:p-7 rounded-3xl bg-[#F8FAF7] border border-slate-200 text-left mb-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                <div>
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Mã số tiếp nhận:</span>
                  <span className="text-xl font-bold text-[#2D5A27]">{bookingResult.code}</span>
                </div>
                <button
                  onClick={copyBookingCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span>{copied ? 'Đã chép!' : 'Sao chép'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block font-light">Chủ nuôi:</span>
                  <span className="font-bold text-slate-900 text-sm">{bookingResult.ownerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-light">Bé cưng:</span>
                  <span className="font-bold text-slate-900 text-sm">{bookingResult.petName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-light">Cơ sở:</span>
                  <span className="font-bold text-[#2D5A27] text-sm">{bookingResult.branchName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-light">Thời gian:</span>
                  <span className="font-bold text-slate-900 text-sm">{bookingResult.dateTime}</span>
                </div>
                <div className="col-span-2 pt-3 border-t border-slate-200">
                  <span className="text-slate-500 block font-light">Dịch vụ:</span>
                  <span className="font-bold text-[#2D5A27] text-sm">{bookingResult.service}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                onClick={resetForm}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#2D5A27] to-emerald-700 hover:from-emerald-800 hover:to-emerald-900 text-white transition shadow-lg"
              >
                Đặt Thêm Lịch Hẹn Khác
              </button>
              <a
                href="tel:0903599339"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition"
              >
                Hotline: 0903 599 339
              </a>
            </div>
          </div>
        ) : (
          /* Concierge Booking Form */
          <form
            onSubmit={handleSubmit}
            className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xl text-slate-900"
          >
            {errorMsg && (
              <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold mb-6">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-7">
              {/* Step 1 */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#2D5A27] flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-[#FFB800]" />
                  1. Thông tin liên hệ chủ nuôi
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Họ và tên của bạn <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      required
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 text-sm outline-none transition text-slate-900 font-light"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Số điện thoại <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 text-sm outline-none transition text-slate-900 font-light"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="pt-5 border-t border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#2D5A27] flex items-center gap-2 mb-4">
                  <Heart className="w-4 h-4 text-[#FFB800]" />
                  2. Thông tin thú cưng
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Tên của bé <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      required
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 text-sm outline-none transition text-slate-900 font-light"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Loài thú cưng
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { type: 'dog', label: 'Chó 🐶' },
                        { type: 'cat', label: 'Mèo 🐱' },
                        { type: 'other', label: 'Khác 🐰' },
                      ].map((item) => (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => setPetType(item.type as any)}
                          className={`py-3 rounded-2xl text-xs font-bold border transition-all duration-200 ${
                            petType === item.type
                              ? 'bg-[#2D5A27] text-white border-[#2D5A27] shadow-sm'
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="pt-5 border-t border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#2D5A27] flex items-center gap-2 mb-4">
                  <Building className="w-4 h-4 text-[#FFB800]" />
                  3. Cơ sở & Dịch vụ
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Chọn cơ sở <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      required
                      className={`w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] text-sm outline-none transition font-light ${
                        !branch ? 'text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      <option value="" className="text-slate-400">
                        -- Chọn cơ sở khám --
                      </option>
                      {dbBranches.length > 0
                        ? dbBranches.map((b) => (
                            <option key={b.id} value={b.id} className="bg-white text-slate-900">
                              {b.ten_ngan || b.ten_chi_nhanh} {b.khu_vuc ? `(${b.khu_vuc})` : ''}
                            </option>
                          ))
                        : branchesData.map((b) => (
                            <option key={b.id} value={b.id} className="bg-white text-slate-900">
                              {b.shortName} - {b.district}
                            </option>
                          ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Chọn dịch vụ <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      required
                      className={`w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] text-sm outline-none transition font-light ${
                        !service ? 'text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      <option value="" className="text-slate-400">
                        -- Chọn dịch vụ --
                      </option>
                      {dbServices.length > 0 ? (
                        <>
                          <optgroup label="Nhóm 1: Thú Y & Y Tế" className="bg-white text-slate-900">
                            {dbServices
                              .filter((s) => s.nhom_dich_vu === 'medical')
                              .map((s) => (
                                <option key={s.id} value={s.ten_dich_vu}>
                                  {s.ten_dich_vu} {s.gia_tham_khao ? `(${s.gia_tham_khao})` : ''}
                                </option>
                              ))}
                          </optgroup>
                          <optgroup label="Nhóm 2: Chăm Sóc & Lưu Trú" className="bg-white text-slate-900">
                            {dbServices
                              .filter((s) => s.nhom_dich_vu === 'care')
                              .map((s) => (
                                <option key={s.id} value={s.ten_dich_vu}>
                                  {s.ten_dich_vu} {s.gia_tham_khao ? `(${s.gia_tham_khao})` : ''}
                                </option>
                              ))}
                          </optgroup>
                        </>
                      ) : (
                        <>
                          <optgroup label="Nhóm 1: Thú Y & Y Tế" className="bg-white text-slate-900">
                            {servicesData
                              .filter((s) => s.category === 'medical')
                              .map((s) => (
                                <option key={s.id} value={s.title}>
                                  {s.title} ({s.priceHint})
                                </option>
                              ))}
                          </optgroup>
                          <optgroup label="Nhóm 2: Chăm Sóc & Lưu Trú" className="bg-white text-slate-900">
                            {servicesData
                              .filter((s) => s.category === 'care')
                              .map((s) => (
                                <option key={s.id} value={s.title}>
                                  {s.title} ({s.priceHint})
                                </option>
                              ))}
                          </optgroup>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="pt-5 border-t border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#2D5A27] flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-[#FFB800]" />
                  4. Ngày & Giờ Đến Khám
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Ngày hẹn
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] text-sm outline-none text-slate-900 font-light"
                    />
                  </div>

                  <div className="sm:col-span-7">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Khung giờ ưu tiên
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setTimeSlot(slot)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                            timeSlot === slot
                              ? 'bg-[#2D5A27] text-white border-[#2D5A27] shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="pt-5 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Ghi chú tình trạng:
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 focus:border-[#2D5A27] text-sm outline-none transition resize-none text-slate-900 font-light"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 py-4 px-8 rounded-2xl font-bold text-base bg-gradient-to-r from-[#2D5A27] to-emerald-700 hover:from-emerald-800 hover:to-emerald-900 text-white shadow-xl shadow-emerald-950/20 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50"
                >
                  <CalendarCheck className="w-5 h-5 text-white" />
                  <span>{isSubmitting ? 'Đang xác nhận lịch hẹn...' : 'Xác Nhận Đặt Lịch Hẹn'}</span>
                </button>

                <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1.5 font-light">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Bảo mật thông tin 100%
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
