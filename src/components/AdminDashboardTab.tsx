'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowRight,
  Clock,
  Calendar,
  CalendarDays,
  BookOpen,
  UserCheck,
  Star,
  Users,
  Building2,
  FileText,
  Settings,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Briefcase,
  FileCheck,
  Download,
  ExternalLink,
  PhoneCall,
  Mail,
  XCircle,
  CalendarCheck,
  Check,
} from 'lucide-react';
import {
  LichHenRecord,
  DanhGiaRecord,
  DichVuRecord,
  ChiNhanhRecord,
  DoiNguRecord,
  BaiVietRecord,
  HoSoTuyenDungRecord,
  TuyenDungRecord,
} from '@/lib/supabase';

type AdminTab =
  | 'dashboard'
  | 'banners'
  | 'branches'
  | 'services'
  | 'appointments'
  | 'faqs'
  | 'reviews'
  | 'team'
  | 'articles'
  | 'config'
  | 'staff';

interface AdminDashboardTabProps {
  appointments: LichHenRecord[];
  reviews: DanhGiaRecord[];
  services: DichVuRecord[];
  branches: ChiNhanhRecord[];
  teamMembers: DoiNguRecord[];
  articles: BaiVietRecord[];
  applications?: HoSoTuyenDungRecord[];
  jobs?: TuyenDungRecord[];
  highlightedId?: string | null;
  onUpdateApplicantStatus?: (id: string, newStatus: string) => Promise<void>;
  onNavigateTab: (tab: AdminTab, itemId?: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function AdminDashboardTab({
  appointments,
  reviews,
  services,
  branches,
  teamMembers,
  articles,
  applications = [],
  jobs = [],
  highlightedId,
  onUpdateApplicantStatus,
  onNavigateTab,
}: AdminDashboardTabProps) {
  // Trạng thái mở rộng nhánh con của từng vị trí tuyển dụng
  const [expandedJobIds, setExpandedJobIds] = useState<Set<string>>(new Set());
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);

  // Mở/đóng nhánh con của vị trí
  const toggleJobExpand = (jobId: string) => {
    setExpandedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  // Tự động mở rộng nhánh vị trí tuyển dụng nếu có hồ sơ ứng viên được chọn/highlight
  useEffect(() => {
    if (!highlightedId || !applications.length) return;
    const targetApp = applications.find((a) => a.id === highlightedId);
    if (targetApp && targetApp.tuyen_dung_id) {
      setExpandedJobIds((prev) => {
        const next = new Set(prev);
        next.add(targetApp.tuyen_dung_id!);
        return next;
      });
    }
  }, [highlightedId, applications]);

  // ── Tính toán các chỉ số thực tế ──
  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const pending = appointments.filter((a) => a.trang_thai === 'cho_xac_nhan');
    const confirmed = appointments.filter((a) => a.trang_thai === 'da_xac_nhan');
    const completed = appointments.filter((a) => a.trang_thai === 'da_kham');
    const cancelled = appointments.filter((a) => a.trang_thai === 'da_huy');

    const todayAppointments = appointments.filter(
      (a) => a.ngay_hen === todayStr || (a.ngay_tao && a.ngay_tao.slice(0, 10) === todayStr)
    );

    // Tính điểm đánh giá trung bình
    const validReviews = reviews.filter((r) => typeof r.so_sao === 'number' && r.so_sao > 0);
    const avgScore =
      validReviews.length > 0
        ? validReviews.reduce((sum, r) => sum + r.so_sao, 0) / validReviews.length
        : 5.0;

    const fiveStars = reviews.filter((r) => r.so_sao === 5).length;
    const fourStars = reviews.filter((r) => r.so_sao === 4).length;
    const belowFourStars = reviews.filter((r) => r.so_sao < 4).length;

    // Phân bổ theo chi nhánh
    const branchCounts: Record<string, number> = {};
    appointments.forEach((a) => {
      const name = a.ten_chi_nhanh || 'Chưa phân loại';
      branchCounts[name] = (branchCounts[name] || 0) + 1;
    });

    // Phân bổ theo loài thú cưng
    let dogCount = 0;
    let catCount = 0;
    let otherCount = 0;
    appointments.forEach((a) => {
      const type = (a.loai_thu_cung || '').toLowerCase();
      if (type.includes('dog') || type.includes('chó') || type.includes('cho')) dogCount++;
      else if (type.includes('cat') || type.includes('mèo') || type.includes('meo')) catCount++;
      else otherCount++;
    });

    // Gom ứng viên theo từng vị trí đang tuyển
    const appsGroupedByJob: Record<string, HoSoTuyenDungRecord[]> = {};
    applications.forEach((app) => {
      const jId = app.tuyen_dung_id || 'other';
      if (!appsGroupedByJob[jId]) appsGroupedByJob[jId] = [];
      appsGroupedByJob[jId].push(app);
    });

    return {
      totalAppointments: appointments.length,
      pendingCount: pending.length,
      confirmedCount: confirmed.length,
      completedCount: completed.length,
      cancelledCount: cancelled.length,
      todayCount: todayAppointments.length,
      avgScore,
      totalReviews: reviews.length,
      fiveStars,
      fourStars,
      belowFourStars,
      branchCounts,
      dogCount,
      catCount,
      otherCount,
      totalApplications: applications.length,
      appsGroupedByJob,
    };
  }, [appointments, reviews, applications]);

  // 5 lịch hẹn mới nhất
  const recentAppointments = useMemo(() => {
    return appointments.slice(0, 5);
  }, [appointments]);

  // 4 đánh giá mới nhất
  const recentReviews = useMemo(() => {
    return reviews.slice(0, 4);
  }, [reviews]);

  const handleActionClick = async (appId: string, newStatus: string) => {
    if (!onUpdateApplicantStatus) return;
    setUpdatingAppId(appId);
    try {
      await onUpdateApplicantStatus(appId, newStatus);
    } finally {
      setUpdatingAppId(null);
    }
  };

  const renderStatusBadge = (status: LichHenRecord['trang_thai']) => {
    switch (status) {
      case 'cho_xac_nhan':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            Chờ tiếp nhận
          </span>
        );
      case 'da_xac_nhan':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            Đã tiếp nhận
          </span>
        );
      case 'da_kham':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-slate-200 text-slate-900 border border-slate-300">
            Đã hoàn thành
          </span>
        );
      case 'da_huy':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-slate-200 text-slate-800">
            {status}
          </span>
        );
    }
  };

  const renderAppStatusBadge = (status?: string | null) => {
    switch (status) {
      case 'da_lien_he':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            Đã liên hệ
          </span>
        );
      case 'hen_phong_van':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            Lịch hẹn PV
          </span>
        );
      case 'bo_qua':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-slate-200 text-slate-600 border border-slate-300 line-through">
            Đã bỏ qua
          </span>
        );
      case 'moi':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            Hồ sơ mới
          </span>
        );
    }
  };

  const formatDateTime = (dateStr?: string, timeStr?: string) => {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
    return timeStr ? `${timeStr} - ${formattedDate}` : formattedDate;
  };

  const formatAppDate = (isoStr?: string) => {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '—';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())} - ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
  };

  return (
    <div className="space-y-6 pb-28">
      {/* ── 1. THANH 4 THẺ CHỈ SỐ CỐ ĐỊNH ĐẦU TRANG KHI CUỘN (STICKY TOP) ── */}
      <div className="sticky top-[57px] z-20 bg-[#F8FAFC]/95 backdrop-blur-md py-2.5 -mx-4 px-4 sm:-mx-8 sm:px-8 border-b border-slate-300/80 shadow-xs transition">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Thẻ 1: Lịch hẹn chờ tiếp nhận */}
          <div
            onClick={() => onNavigateTab('appointments')}
            className="bg-white rounded-xl border border-slate-300 p-4 transition hover:border-slate-400 hover:shadow-md cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Chờ tiếp nhận</span>
              {stats.pendingCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" title="Có lịch hẹn mới chưa xử lý" />
              )}
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-950 tracking-tight">
                {stats.pendingCount}
              </span>
              <span className="text-xs font-semibold text-slate-600">/ {stats.totalAppointments} lịch</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-[#2D5A27] transition">
              <span>Xem lịch hẹn</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:translate-x-1 group-hover:text-[#2D5A27] transition" />
            </div>
          </div>

          {/* Thẻ 2: Lịch khám hôm nay */}
          <div
            onClick={() => onNavigateTab('appointments')}
            className="bg-white rounded-xl border border-slate-300 p-4 transition hover:border-slate-400 hover:shadow-md cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Hôm nay</span>
              <span className="text-xs font-bold text-slate-700 font-mono">
                {new Date().toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-950 tracking-tight">
                {stats.todayCount}
              </span>
              <span className="text-xs font-semibold text-slate-600">lịch trong ngày</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-[#2D5A27] transition">
              <span>Kiểm tra ca khám</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:translate-x-1 group-hover:text-[#2D5A27] transition" />
            </div>
          </div>

          {/* Thẻ 3: Đánh giá dịch vụ */}
          <div
            onClick={() => onNavigateTab('reviews')}
            className="bg-white rounded-xl border border-slate-300 p-4 transition hover:border-slate-400 hover:shadow-md cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Hài lòng</span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded">
                {stats.fiveStars} lượt 5★
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-950 tracking-tight">
                {stats.avgScore.toFixed(1)}
              </span>
              <span className="text-xs font-semibold text-slate-600">/ 5.0 ({stats.totalReviews} đánh giá)</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-[#2D5A27] transition">
              <span>Chi tiết phản hồi</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:translate-x-1 group-hover:text-[#2D5A27] transition" />
            </div>
          </div>

          {/* Thẻ 4: Hồ sơ tuyển dụng */}
          <div
            onClick={() => {
              const el = document.getElementById('recruitment-section');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="bg-white rounded-xl border border-slate-300 p-4 transition hover:border-slate-400 hover:shadow-md cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Ứng viên nộp CV</span>
              <span className="text-[11px] font-bold text-blue-800 bg-blue-100 border border-blue-300 px-1.5 py-0.2 rounded">
                {jobs.filter((j) => j.kich_hoat).length} vị trí mở
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-950 tracking-tight">
                {stats.totalApplications}
              </span>
              <span className="text-xs font-semibold text-slate-600">hồ sơ đã nộp</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-[#2D5A27] transition">
              <span>Xem danh sách CV</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:translate-x-1 group-hover:text-[#2D5A27] transition" />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. BẢNG DỮ LIỆU CHÍNH (LỊCH HẸN & PHÂN BỔ) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI (2/3): LỊCH HẸN GẦN ĐÂY */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-300 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-300 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Lịch hẹn đặt khám gần nhất
              </h2>
              <p className="text-xs font-medium text-slate-600 mt-0.5">
                Các yêu cầu từ website tự động cập nhật theo thời gian thực
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('appointments')}
              className="text-xs font-bold text-[#2D5A27] hover:text-[#1e3d1a] inline-flex items-center gap-1 transition cursor-pointer"
            >
              <span>Xem tất cả ({appointments.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {recentAppointments.length === 0 ? (
            <div className="p-8 text-center text-xs font-medium text-slate-500">
              Hiện chưa có dữ liệu lịch hẹn nào trong hệ thống.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Khách hàng</th>
                    <th className="py-3 px-3">Thú cưng</th>
                    <th className="py-3 px-3">Dịch vụ &amp; Cơ sở</th>
                    <th className="py-3 px-3">Thời gian hẹn</th>
                    <th className="py-3 px-4 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {recentAppointments.map((app) => {
                    const isHighlighted = highlightedId === app.id;
                    return (
                      <tr
                        key={app.id}
                        id={`appointment-row-${app.id}`}
                        onClick={() => onNavigateTab('appointments', app.id)}
                        className={`transition-all duration-500 cursor-pointer ${
                          isHighlighted
                            ? 'bg-emerald-100 ring-2 ring-emerald-500 shadow-md font-bold'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-950 text-[13px]">{app.ho_ten_chu}</div>
                          <div className="text-xs font-bold text-slate-700 font-mono mt-0.5">
                            {app.so_dien_thoai}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="text-slate-900 font-bold">
                            {app.ten_thu_cung || 'Chưa đặt tên'}
                          </div>
                          <div className="text-xs font-semibold text-slate-600 capitalize">
                            {app.loai_thu_cung === 'dog' ? 'Chó' : app.loai_thu_cung === 'cat' ? 'Mèo' : app.loai_thu_cung || 'Khác'}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="text-slate-950 font-bold line-clamp-1">{app.dich_vu}</div>
                          <div className="text-xs font-semibold text-slate-600 line-clamp-1">
                            {app.ten_chi_nhanh || 'Cơ sở chính'}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap text-slate-900 font-semibold text-xs font-mono">
                          {formatDateTime(app.ngay_hen, app.gio_hen)}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {renderStatusBadge(app.trang_thai)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CỘT PHẢI (1/3): PHÂN BỔ CƠ SỞ & ĐÁNH GIÁ */}
        <div className="space-y-6">
          {/* Phân bổ chi nhánh */}
          <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-950">
              Phân bổ cơ sở tiếp nhận
            </h2>
            <p className="text-xs font-medium text-slate-600 mt-0.5">
              Tỷ lệ lượt đặt lịch hẹn giữa các chi nhánh
            </p>

            <div className="mt-4 space-y-3.5">
              {branches.length === 0 ? (
                <div className="text-xs font-medium text-slate-500">Chưa có dữ liệu chi nhánh.</div>
              ) : (
                branches.map((b) => {
                  const count = stats.branchCounts[b.ten_chi_nhanh] || 0;
                  const percent =
                    stats.totalAppointments > 0
                      ? Math.round((count / stats.totalAppointments) * 100)
                      : 0;
                  return (
                    <div key={b.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 truncate pr-2">
                          {b.ten_chi_nhanh}
                        </span>
                        <span className="font-mono font-bold text-slate-800 shrink-0">
                          {count} lịch ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-800 rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(percent, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Loài thú cưng:</span>
              <span className="text-slate-950 font-bold">
                {stats.dogCount} Cún · {stats.catCount} Mèo · {stats.otherCount} Khác
              </span>
            </div>
          </div>

          {/* Đánh giá dịch vụ gần đây */}
          <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-950">
                Đánh giá gần đây
              </h2>
              <button
                type="button"
                onClick={() => onNavigateTab('reviews')}
                className="text-xs font-bold text-[#2D5A27] hover:underline cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>

            {recentReviews.length === 0 ? (
              <div className="text-xs font-medium text-slate-500 py-4 text-center">
                Chưa có đánh giá nào được gửi.
              </div>
            ) : (
              <div className="space-y-3">
                {recentReviews.map((rev) => {
                  const isHighlighted = highlightedId === rev.id;
                  return (
                    <div
                      key={rev.id}
                      id={`review-row-${rev.id}`}
                      onClick={() => onNavigateTab('reviews', rev.id)}
                      className={`p-3 rounded-lg border transition-all duration-500 cursor-pointer ${
                        isHighlighted
                          ? 'bg-emerald-100 ring-2 ring-emerald-500 border-emerald-400 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-950 truncate">
                          {rev.ten_khach_hang || 'Khách hàng'}
                        </span>
                        <span className="font-black text-amber-800 text-xs">
                          {rev.so_sao || 5} ★
                        </span>
                      </div>
                      {rev.noi_dung && (
                        <p className="text-xs font-medium text-slate-700 mt-1 line-clamp-2 leading-relaxed">
                          &ldquo;{rev.noi_dung}&rdquo;
                        </p>
                      )}
                      {rev.dich_vu_su_dung && (
                        <div className="mt-1.5 text-xs font-bold text-slate-600">
                          Dịch vụ: {rev.dich_vu_su_dung}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. KHỐI VỊ TRÍ TUYỂN DỤNG VÀ ĐỔ NHÁNH CON ỨNG VIÊN (ACCORDION TREE) ── */}
      <div id="recruitment-section" className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-300 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-bold text-slate-950">
                Vị trí tuyển dụng &amp; Ứng viên nộp CV
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                {applications.length} hồ sơ đã nộp
              </span>
            </div>
            <p className="text-xs font-medium text-slate-600 mt-0.5">
              Bấm vào từng vị trí để đổ nhánh danh sách ứng viên, xem CV và thực hiện thao tác xử lý
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('team')}
            className="text-xs font-bold text-[#2D5A27] hover:text-[#1e3d1a] inline-flex items-center gap-1 transition cursor-pointer"
          >
            <span>Quản lý tuyển dụng</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Danh sách các vị trí tuyển dụng với tính năng đổ nhánh con */}
        <div className="divide-y divide-slate-200">
          {jobs.length === 0 ? (
            <div className="p-8 text-center text-xs font-medium text-slate-500">
              Chưa có vị trí tuyển dụng nào được tạo.
            </div>
          ) : (
            jobs.map((job) => {
              const jobApps = stats.appsGroupedByJob[job.id] || [];
              const isExpanded = expandedJobIds.has(job.id);
              const hasHighlightedChild = jobApps.some((a) => a.id === highlightedId);

              return (
                <div key={job.id} className="transition">
                  {/* HÀNG TIÊU ĐỀ VỊ TRÍ (CLICK ĐỂ ĐỔ NHÁNH CON) */}
                  <div
                    onClick={() => toggleJobExpand(job.id)}
                    className={`px-5 py-4 flex items-center justify-between cursor-pointer transition select-none ${
                      isExpanded ? 'bg-slate-50 border-b border-slate-200' : 'hover:bg-slate-50/70'
                    } ${hasHighlightedChild ? 'bg-emerald-50/80 ring-1 ring-emerald-400' : ''}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {job.tieu_de}
                          </h3>
                          <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            Chỉ tiêu: {job.so_luong || 1} nhân sự
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                          {job.phong_ban || 'Phòng khám'} · {job.dia_diem || 'TP. Thủ Đức'} · Hạn nộp: {job.han_nop || 'Đang mở'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border transition ${
                          jobApps.length > 0
                            ? 'bg-blue-100 text-blue-900 border-blue-300'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {jobApps.length} hồ sơ nộp
                      </span>
                      <div className="p-1 rounded-md text-slate-400 hover:text-slate-700 transition">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-700" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* NHÁNH CON: DANH SÁCH ỨNG VIÊN CỦA VỊ TRÍ NÀY */}
                  {isExpanded && (
                    <div className="bg-slate-50/60 p-4 border-b border-slate-200 space-y-3">
                      {jobApps.length === 0 ? (
                        <div className="py-6 text-center text-xs font-medium text-slate-500 bg-white rounded-lg border border-dashed border-slate-200">
                          Chưa có ứng viên nào nộp hồ sơ cho vị trí này.
                        </div>
                      ) : (
                        jobApps.map((app) => {
                          const isHighlighted = highlightedId === app.id;
                          const isUpdating = updatingAppId === app.id;

                          return (
                            <div
                              key={app.id}
                              id={`applicant-row-${app.id}`}
                              className={`bg-white rounded-xl border p-4 transition-all duration-500 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                isHighlighted
                                  ? 'border-emerald-400 bg-emerald-50/70 ring-2 ring-emerald-500 shadow-md scale-[1.01]'
                                  : 'border-slate-300 hover:border-slate-400'
                              }`}
                            >
                              {/* Thông tin ứng viên */}
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-bold text-slate-950">
                                    {app.ho_ten}
                                  </span>
                                  {renderAppStatusBadge(app.trang_thai)}
                                  <span className="text-[11px] font-semibold text-slate-500 font-mono">
                                    {formatAppDate(app.ngay_tao)}
                                  </span>
                                </div>

                                <div className="flex items-center gap-4 text-xs font-medium text-slate-700 flex-wrap mt-1">
                                  <a
                                    href={`tel:${app.so_dien_thoai}`}
                                    className="font-mono font-bold text-emerald-800 hover:underline inline-flex items-center gap-1"
                                  >
                                    <PhoneCall className="w-3.5 h-3.5" />
                                    <span>{app.so_dien_thoai}</span>
                                  </a>
                                  <a
                                    href={`mailto:${app.email}`}
                                    className="text-blue-800 hover:underline inline-flex items-center gap-1 truncate"
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                    <span>{app.email}</span>
                                  </a>
                                </div>

                                {app.gioi_thieu && (
                                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 italic mt-1.5 leading-relaxed">
                                    &ldquo;{app.gioi_thieu}&rdquo;
                                  </p>
                                )}
                              </div>

                              {/* Nút xem CV & Các nút Action (Bỏ qua, Đã liên hệ, Lịch hẹn PV) */}
                              <div className="flex items-center gap-2 flex-wrap shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                                {/* Nút xem CV */}
                                {app.link_cv ? (
                                  <a
                                    href={app.link_cv}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs border border-blue-200 transition"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Xem CV</span>
                                  </a>
                                ) : (
                                  <span className="text-xs text-slate-400 italic px-2">Không CV</span>
                                )}

                                {/* Nút Action 1: Bỏ qua (XCircle) */}
                                <button
                                  type="button"
                                  disabled={isUpdating || app.trang_thai === 'bo_qua'}
                                  onClick={() => handleActionClick(app.id, 'bo_qua')}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                                    app.trang_thai === 'bo_qua'
                                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                      : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                  }`}
                                  title="Từ chối / Bỏ qua hồ sơ này"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Bỏ qua</span>
                                </button>

                                {/* Nút Action 2: Đã liên hệ (PhoneCall) */}
                                <button
                                  type="button"
                                  disabled={isUpdating || app.trang_thai === 'da_lien_he'}
                                  onClick={() => handleActionClick(app.id, 'da_lien_he')}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                                    app.trang_thai === 'da_lien_he'
                                      ? 'bg-blue-100 text-blue-900 border-blue-300 font-black cursor-not-allowed'
                                      : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200'
                                  }`}
                                  title="Xác nhận đã gọi điện thoại trao đổi với ứng viên"
                                >
                                  <PhoneCall className="w-3.5 h-3.5" />
                                  <span>Đã liên hệ</span>
                                </button>

                                {/* Nút Action 3: Đã có lịch hẹn PV (CalendarCheck) */}
                                <button
                                  type="button"
                                  disabled={isUpdating || app.trang_thai === 'hen_phong_van'}
                                  onClick={() => handleActionClick(app.id, 'hen_phong_van')}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border shadow-2xs ${
                                    app.trang_thai === 'hen_phong_van'
                                      ? 'bg-emerald-700 text-white border-emerald-800 cursor-not-allowed'
                                      : 'bg-[#2D5A27] hover:bg-[#234A1E] text-white border-[#2D5A27]'
                                  }`}
                                  title="Lên lịch hẹn phỏng vấn trực tiếp tại bệnh viện"
                                >
                                  <CalendarCheck className="w-3.5 h-3.5" />
                                  <span>Lịch hẹn PV</span>
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── 4. THANH LỐI TẮT CỐ ĐỊNH DƯỚI ĐÁY KHI CUỘN (STICKY BOTTOM) ── */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-300 p-4 shadow-xl shadow-slate-900/10">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Lối tắt tác vụ quản trị
          </h2>
          <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
            Truy cập nhanh các phân hệ nghiệp vụ
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Lối tắt 1: Quản lý lịch hẹn */}
          <button
            type="button"
            onClick={() => onNavigateTab('appointments')}
            className="p-3 rounded-xl border border-slate-300 bg-white text-left hover:border-slate-400 hover:bg-slate-50 transition cursor-pointer flex items-center gap-3 group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#2D5A27] border border-emerald-200 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-950 group-hover:text-[#2D5A27] truncate">
                Quản lý lịch hẹn
              </div>
              <div className="text-[11px] font-semibold text-slate-600 truncate mt-0.5">
                Xác nhận &amp; phân ca
              </div>
            </div>
          </button>

          {/* Lối tắt 2: Viết bài cẩm nang */}
          <button
            type="button"
            onClick={() => onNavigateTab('articles')}
            className="p-3 rounded-xl border border-slate-300 bg-white text-left hover:border-slate-400 hover:bg-slate-50 transition cursor-pointer flex items-center gap-3 group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 border border-blue-200 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-950 group-hover:text-blue-800 truncate">
                Viết bài cẩm nang
              </div>
              <div className="text-[11px] font-semibold text-slate-600 truncate mt-0.5">
                Kiến thức y khoa
              </div>
            </div>
          </button>

          {/* Lối tắt 3: Đội ngũ bác sĩ */}
          <button
            type="button"
            onClick={() => onNavigateTab('team')}
            className="p-3 rounded-xl border border-slate-300 bg-white text-left hover:border-slate-400 hover:bg-slate-50 transition cursor-pointer flex items-center gap-3 group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 border border-teal-200 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-950 group-hover:text-teal-800 truncate">
                Đội ngũ bác sĩ &amp; Tuyển dụng
              </div>
              <div className="text-[11px] font-semibold text-slate-600 truncate mt-0.5">
                Hồ sơ &amp; chuyên khoa
              </div>
            </div>
          </button>

          {/* Lối tắt 4: Cấu hình liên hệ */}
          <button
            type="button"
            onClick={() => onNavigateTab('config')}
            className="p-3 rounded-xl border border-slate-300 bg-white text-left hover:border-slate-400 hover:bg-slate-50 transition cursor-pointer flex items-center gap-3 group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-950 group-hover:text-slate-800 truncate">
                Cấu hình liên hệ
              </div>
              <div className="text-[11px] font-semibold text-slate-600 truncate mt-0.5">
                Hotline &amp; chi nhánh
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
