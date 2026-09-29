'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ScrollRevealTitle from '@/components/ScrollRevealTitle';
import { branchesData, BranchItem } from '@/data/branchesData';
import { supabase, ChiNhanhRecord } from '@/lib/supabase';
import { getAssetUrl, getDirectionsUrl } from '@/lib/assets';
import {
  MapPin,
  PhoneCall,
  Clock,
  ExternalLink,
  Navigation,
  Car,
  UserCheck,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export default function LocationsSection() {
  const [branches, setBranches] = useState<BranchItem[]>(branchesData);
  const [selectedBranch, setSelectedBranch] = useState<BranchItem>(branchesData[0]);

  // 1. Tải danh sách chi nhánh thực tế từ Supabase
  const loadBranchesFromSupabase = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('chi_nhanh')
        .select('*')
        .eq('kich_hoat', true)
        .order('thu_tu', { ascending: true });

      if (error) {
        console.warn('Lỗi tải chi nhánh từ Supabase, dùng dữ liệu mặc định:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const formatted: BranchItem[] = data.map((b: ChiNhanhRecord) => {
          let parsedFeatures: string[] = [];
          const rawTienIch = b.tien_ich as any;
          if (Array.isArray(rawTienIch)) {
            parsedFeatures = rawTienIch.map((f: any) => String(f).trim()).filter(Boolean);
          } else if (typeof rawTienIch === 'string' && rawTienIch.trim()) {
            try {
              const parsed = JSON.parse(rawTienIch);
              if (Array.isArray(parsed)) {
                parsedFeatures = parsed.map((f: any) => String(f).trim()).filter(Boolean);
              }
            } catch {
              parsedFeatures = rawTienIch.split('\n').map((f: string) => f.trim()).filter(Boolean);
            }
          }

          return {
            id: b.id,
            name: b.ten_chi_nhanh?.trim() || '',
            shortName: b.ten_ngan?.trim() || b.ten_chi_nhanh?.trim() || '',
            tagline: b.khau_hieu?.trim() || '',
            district: b.khu_vuc?.trim() || '',
            address: b.dia_chi?.trim() || '',
            phone: b.so_dien_thoai?.trim() || '',
            emergencyPhone: b.so_dien_thoai?.trim() || '',
            openHours: b.gio_hoat_dong?.trim() || '',
            managerDoctor: b.bac_si_phu_trach?.trim() || '',
            doctorDegree: b.bang_cap_bac_si?.trim() || '',
            parkingInfo: b.thong_tin_do_xe?.trim() || '',
            mapEmbedUrl: b.link_ggmap_embed?.trim() || '',
            googleMapsAppUrl: b.link_ggmap_app?.trim() || '',
            features: parsedFeatures,
          };
        });

        setBranches(formatted);
        setSelectedBranch((prev) => {
          const match = formatted.find((item) => item.id === prev.id);
          return match || formatted[0];
        });
      }
    } catch (err) {
      console.warn('Lỗi kết nối chi nhánh Supabase:', err);
    }
  }, []);

  useEffect(() => {
    loadBranchesFromSupabase();

    const handleFocus = () => {
      loadBranchesFromSupabase();
    };
    window.addEventListener('focus', handleFocus);

    // Lắng nghe thay đổi thời gian thực
    const channel = supabase
      .channel('chi_nhanh_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chi_nhanh' },
        () => {
          loadBranchesFromSupabase();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('focus', handleFocus);
      supabase.removeChannel(channel);
    };
  }, [loadBranchesFromSupabase]);

  // Tính giờ hiện tại theo múi giờ Việt Nam (UTC+7)
  const now = new Date();
  const currentVNHour = (now.getUTCHours() + 7) % 24;
  const isOpenNow = currentVNHour >= 8 && currentVNHour < 20;

  return (
    <section id="branches" className="relative py-20 sm:py-28 text-slate-900 overflow-hidden bg-[#F8FAF7]">
      {/* 1. ARCHITECTURAL BACKGROUND WITH BRIGHT OVERLAY */}
      <div className="absolute inset-0 z-0">
        <Image
          src={getAssetUrl('/branches_bg.jpg')}
          alt="Kiến trúc resort bệnh viện thú y Pet M&M sang trọng lúc hoàng hôn"
          fill
          quality={90}
          className="object-cover object-center scale-105 opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAF7]/95 via-white/85 to-[#F8FAF7]/95 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header with Title-Only Entrance Animation */}
        <ScrollRevealTitle className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <h2 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-slate-900 leading-tight">
            Hệ Thống Cơ Sở &amp; <br />
            <span className="italic font-light text-[#2D5A27]">
              Bản Đồ Chỉ Đường Trực Quan
            </span>
          </h2>
        </ScrollRevealTitle>

        {/* KHUNG HIỂN THỊ 2 CỘT: CHI NHÁNH BÊN TRÁI & BẢN ĐỒ BÊN PHẢI (TRÊN LAPTOP) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* CỘT TRÁI: THÔNG TIN CHI NHÁNH */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            {/* Thanh chọn chi nhánh nếu có từ 2 chi nhánh trở lên */}
            {branches.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
                {branches.map((b, idx) => {
                  const isSelected = selectedBranch.id === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBranch(b)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-[#2D5A27] text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {b.shortName || b.name || `Cơ sở ${idx + 1}`}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Thẻ Chi Nhánh */}
            <div className="bg-white border-2 border-[#2D5A27] rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden flex flex-col justify-between flex-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2D5A27]/5 rounded-bl-full pointer-events-none" />

              <div className="space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    {selectedBranch.district && (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#2D5A27] text-white">
                        {selectedBranch.district}
                      </span>
                    )}
                  </div>

                  {selectedBranch.openHours && (
                    <div className="flex items-center gap-1.5 text-xs text-[#2D5A27] font-semibold">
                      <Clock className="w-3.5 h-3.5 text-[#2D5A27]" />
                      <span>{selectedBranch.openHours}</span>
                    </div>
                  )}
                </div>

                {/* Tên Chi Nhánh */}
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {selectedBranch.name}
                </h3>

                {/* Địa chỉ */}
                {selectedBranch.address && (
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <MapPin className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />
                    <span className="font-medium">{selectedBranch.address}</span>
                  </div>
                )}

                {/* Tiện ích nổi bật */}
                {selectedBranch.features && selectedBranch.features.length > 0 && (
                  <div className="pt-3.5 border-t border-slate-100">
                    <span className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                      Trang thiết bị &amp; Tiện ích chuẩn y khoa 5 sao:
                    </span>
                    <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-700">
                      {selectedBranch.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A27] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bác sĩ phụ trách */}
                {selectedBranch.managerDoctor && (
                  <div className="pt-3.5 border-t border-slate-100">
                    <span className="font-bold text-slate-900 flex items-center gap-2 mb-1 text-xs">
                      <UserCheck className="w-4 h-4 text-[#2D5A27]" />
                      Bác sĩ phụ trách cơ sở:
                    </span>
                    <p className="font-semibold text-[#2D5A27] text-xs">{selectedBranch.managerDoctor}</p>
                    {selectedBranch.doctorDegree && (
                      <p className="text-slate-600 text-[11px] leading-snug font-light mt-0.5">{selectedBranch.doctorDegree}</p>
                    )}
                  </div>
                )}

                {/* Thông tin đỗ xe */}
                {selectedBranch.parkingInfo && (
                  <div className="pt-3.5 border-t border-slate-100">
                    <span className="font-bold text-slate-900 flex items-center gap-2 mb-1 text-xs">
                      <Car className="w-4 h-4 text-[#2D5A27]" />
                      Thông tin bãi đỗ xe &amp; hỗ trợ:
                    </span>
                    <p className="text-slate-600 font-light text-xs">{selectedBranch.parkingInfo}</p>
                  </div>
                )}
              </div>

              {/* Hotlines & Chỉ đường */}
              {(selectedBranch.phone || selectedBranch.googleMapsAppUrl) && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs sm:text-sm mt-5">
                  {selectedBranch.phone && (
                    <a
                      href={`tel:${selectedBranch.phone.replace(/\s+/g, '')}`}
                      className="font-bold text-[#2D5A27] hover:underline flex items-center gap-1.5"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Hotline: {selectedBranch.phone}</span>
                    </a>
                  )}

                  {selectedBranch.googleMapsAppUrl && (
                    <a
                      href={selectedBranch.googleMapsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#2D5A27] font-bold text-xs transition"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Chỉ đường Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Nút Xem chi tiết */}
              {selectedBranch.id && (
                <div className="pt-4 mt-2">
                  <Link
                    href={`/chi-nhanh/${selectedBranch.id}`}
                    prefetch={true}
                    className="group w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#2D5A27] hover:bg-[#23481e] text-white font-bold text-sm transition shadow-md hover:shadow-lg"
                  >
                    <span>Xem chi tiết cơ sở</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: BẢN ĐỒ GOOGLE MAPS */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="w-full h-full min-h-[440px] sm:min-h-[520px] rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-white flex flex-col">
              {/* Map Header */}
              <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                      {selectedBranch.name}
                    </h4>
                  </div>
                  {selectedBranch.address && (
                    <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 font-light">
                      <MapPin className="w-3.5 h-3.5 text-[#2D5A27] shrink-0" />
                      <span>{selectedBranch.address}</span>
                    </p>
                  )}
                </div>

                {selectedBranch.googleMapsAppUrl && (
                  <a
                    href={getDirectionsUrl(selectedBranch.googleMapsAppUrl, selectedBranch.address, selectedBranch.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-[#2D5A27] to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-xs transition shrink-0 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 fill-white" />
                    <span>Mở App Chỉ Đường</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}
              </div>

              {/* Sub-bar: Real-time Operating Status & Direct Link */}
              {(selectedBranch.openHours || selectedBranch.googleMapsAppUrl) && (
                <div className="px-4 sm:px-5 py-2.5 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
                  {selectedBranch.openHours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#2D5A27]" />
                      <span className={isOpenNow ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                        {isOpenNow ? '🟢 Đang mở cửa (08:00 – 20:00)' : '🔴 Đang đóng cửa • Mở lúc 08:00'}
                      </span>
                    </div>
                  )}
                  {selectedBranch.googleMapsAppUrl && (
                    <a
                      href={selectedBranch.googleMapsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#2D5A27] hover:text-emerald-800 font-bold hover:underline ml-auto"
                    >
                      <span>Xem đánh giá trên Google</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Map Iframe */}
              <div className="relative w-full flex-1 min-h-[360px] bg-slate-100">
                {selectedBranch.mapEmbedUrl ? (
                  <iframe
                    key={selectedBranch.id}
                    title={`Google Maps - ${selectedBranch.name}`}
                    src={selectedBranch.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <MapPin className="w-10 h-10 mb-2 text-slate-300" />
                    <p className="text-xs">Chưa có liên kết bản đồ nhúng</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
