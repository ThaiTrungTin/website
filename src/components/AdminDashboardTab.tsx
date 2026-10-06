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
  Copy,
  Plus,
  MessageSquare,
  QrCode,
  RefreshCw,
  AlertTriangle,
  X,
} from 'lucide-react';
import QRCode from 'qrcode';
import ZaloIcon from '@/components/ZaloIcon';
import {
  supabase,
  YeuCauDanhGiaRecord,
  LichHenRecord,
  DanhGiaRecord,
  DichVuRecord,
  ChiNhanhRecord,
  DoiNguRecord,
  BaiVietRecord,
  HoSoTuyenDungRecord,
  TuyenDungRecord,
} from '@/lib/supabase';
import AdminAnalyticsSection from '@/components/AdminAnalyticsSection';

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
  // Thống kê tin nhắn tự động (Zalo OA & Email)
  const [notifStats, setNotifStats] = useState({
    email_thanh_cong: 0,
    email_that_bai: 0,
    zalo_thanh_cong: 0,
    zalo_that_bai: 0,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchNotifStats = async () => {
      try {
        const res = await fetch('/api/admin/notification-logs?limit=1');
        const data = await res.json();
        if (isMounted && data.success && data.stats) {
          setNotifStats(data.stats);
        }
      } catch {}
    };
    fetchNotifStats();
    return () => {
      isMounted = false;
    };
  }, []);

  // ── Danh sách yêu cầu đánh giá NV đã tạo nhưng khách chưa vào đánh giá ──
  const [pendingReviewRequests, setPendingReviewRequests] = useState<YeuCauDanhGiaRecord[]>([]);
  const [copiedReviewCode, setCopiedReviewCode] = useState<string | null>(null);

  const fetchPendingReviewRequests = React.useCallback(async () => {
    try {
      const res = await fetch('/api/review-requests?limit=50');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        // Chỉ lấy những yêu cầu đang ở trạng thái 'cho_danh_gia'
        const list = json.data.filter(
          (item: YeuCauDanhGiaRecord) => item.trang_thai === 'cho_danh_gia'
        );
        setPendingReviewRequests(list);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchPendingReviewRequests();

    const channel = supabase
      .channel('dashboard_yeu_cau_danh_gia')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'yeu_cau_danh_gia' },
        () => {
          fetchPendingReviewRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPendingReviewRequests]);

  const handleCopyReviewLink = async (code: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://petmm.vn';
    const link = `${origin}/danhgiadichvu/${encodeURIComponent(code)}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedReviewCode(code);
      setTimeout(() => setCopiedReviewCode(null), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedReviewCode(code);
      setTimeout(() => setCopiedReviewCode(null), 2000);
    }
  };

  const [qrModalData, setQrModalData] = useState<{
    item: YeuCauDanhGiaRecord;
    link: string;
    qrDataUrl: string;
  } | null>(null);
  const [zaloSendingId, setZaloSendingId] = useState<string | null>(null);
  const [zaloToast, setZaloToast] = useState<{ message: string; success: boolean } | null>(null);

  const handleOpenQrModal = async (item: YeuCauDanhGiaRecord) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://petmm.vn';
    const link = `${origin}/danhgiadichvu/${encodeURIComponent(item.ma_danh_gia)}`;
    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(link, {
        width: 320,
        margin: 2,
        color: { dark: '#111827', light: '#ffffff' },
      });
    } catch {}
    setQrModalData({ item, link, qrDataUrl });
  };

  const handleSendZalo = async (item: YeuCauDanhGiaRecord) => {
    if (!item.so_dien_thoai) {
      alert('Hồ sơ này không có số điện thoại của khách hàng!');
      return;
    }
    setZaloSendingId(item.id);
    setZaloToast(null);
    try {
      const res = await fetch('/api/admin/zalo/send-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: item.so_dien_thoai,
          customerName: item.ten_khach_hang,
          orderId: item.ma_hoa_don || item.ma_danh_gia,
          reviewCode: item.ma_danh_gia,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setZaloToast({ success: true, message: 'Đã gửi qua Zalo OA thành công!' });
      } else {
        setZaloToast({ success: false, message: data.message || 'Không thể gửi qua Zalo OA.' });
      }
      fetchPendingReviewRequests();
    } catch (err: any) {
      setZaloToast({ success: false, message: err.message || 'Lỗi kết nối khi gửi Zalo OA.' });
      fetchPendingReviewRequests();
    } finally {
      setZaloSendingId(null);
      setTimeout(() => setZaloToast(null), 4000);
    }
  };

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
      totalApplications: applications.filter((a) => a.trang_thai !== 'bo_qua').length,
      appsGroupedByJob,
    };
  }, [appointments, reviews, applications]);

  // Lọc chỉ các lịch có trạng thái 'cho_xac_nhan' (Chờ tiếp nhận) hoặc 'da_xac_nhan' (Đã tiếp nhận/cập nhật)
  const actionableAppointments = useMemo(() => {
    return appointments.filter(
      (a) => a.trang_thai === 'cho_xac_nhan' || a.trang_thai === 'da_xac_nhan'
    );
  }, [appointments]);

  // Đánh giá mới nhất
  const recentReviews = useMemo(() => {
    return reviews.slice(0, 6);
  }, [reviews]);

  const renderStatusBadge = (status: LichHenRecord['trang_thai']) => {
    switch (status) {
      case 'cho_xac_nhan':
        return (
          <span className="inline-flex items-center text-xs font-bold text-amber-700">
            Chờ tiếp nhận
          </span>
        );
      case 'da_xac_nhan':
        return (
          <span className="inline-flex items-center text-xs font-bold text-emerald-700">
            Đã tiếp nhận
          </span>
        );
      case 'da_kham':
        return (
          <span className="inline-flex items-center text-xs font-bold text-slate-700">
            Đã hoàn thành
          </span>
        );
      case 'da_huy':
        return (
          <span className="inline-flex items-center text-xs font-bold text-rose-700">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-xs font-bold text-slate-600">
            {status}
          </span>
        );
    }
  };

  // Tính tỷ lệ phân bổ lịch hẹn theo từng chi nhánh (Tổng 100%)
  const branchStats = useMemo(() => {
    const total = appointments.length;
    const counts: Record<string, number> = {};

    branches.forEach((b) => {
      counts[b.ten_chi_nhanh] = 0;
    });

    appointments.forEach((a) => {
      const name = a.ten_chi_nhanh || 'Chưa phân loại';
      counts[name] = (counts[name] || 0) + 1;
    });

    const colors = [
      'bg-emerald-600 hover:bg-emerald-700',
      'bg-blue-600 hover:bg-blue-700',
      'bg-purple-600 hover:bg-purple-700',
      'bg-amber-500 hover:bg-amber-600',
      'bg-rose-500 hover:bg-rose-600',
      'bg-teal-600 hover:bg-teal-700',
      'bg-indigo-600 hover:bg-indigo-700',
    ];

    const list = Object.entries(counts)
      .filter(([_, count]) => count > 0 || total === 0)
      .map(([name, count], index) => {
        const percent = total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;
        return {
          name,
          count,
          percent,
          color: colors[index % colors.length],
        };
      });

    return { list, total };
  }, [appointments, branches]);

  const formatDateTime = (dateStr?: string, timeStr?: string) => {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
    return timeStr ? `${timeStr} - ${formattedDate}` : formattedDate;
  };

  return (
    <div className="space-y-6 pb-10">
      {/* ── 1. THANH 6 KHỐI CHỈ SỐ CỐ ĐỊNH ĐẦU TRANG (4 KHỐI VẬN HÀNH · 2 KHỐI THÔNG BÁO TỔNG HỢP) ── */}
      <div className="sticky top-[57px] z-20 bg-[#F8FAFC]/95 backdrop-blur-md py-2 -mx-4 px-4 sm:-mx-8 sm:px-8 border-b border-slate-300/80 shadow-xs transition">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* 1: Chờ tiếp nhận */}
          <div
            onClick={() => onNavigateTab('appointments')}
            className="bg-white rounded-xl border border-slate-300 p-3.5 transition hover:border-slate-400 hover:shadow-xs cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider truncate">Chờ tiếp nhận</span>
              {stats.pendingCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" title="Có lịch mới chưa xử lý" />
              )}
            </div>
            <div className="my-1.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-950 tracking-tight">{stats.pendingCount}</span>
              <span className="text-xs font-semibold text-slate-500 truncate">/{stats.totalAppointments} lịch</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-[#2D5A27] transition">
              <span className="truncate">Xem lịch hẹn</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-[#2D5A27] transition shrink-0" />
            </div>
          </div>

          {/* 2: Hôm nay */}
          <div
            onClick={() => onNavigateTab('appointments')}
            className="bg-white rounded-xl border border-slate-300 p-3.5 transition hover:border-slate-400 hover:shadow-xs cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider truncate">Hôm nay</span>
              <span className="text-[11px] font-bold text-slate-500 font-mono">
                {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
              </span>
            </div>
            <div className="my-1.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-950 tracking-tight">{stats.todayCount}</span>
              <span className="text-xs font-semibold text-slate-500 truncate">trong ngày</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-[#2D5A27] transition">
              <span className="truncate">Kiểm tra ca khám</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-[#2D5A27] transition shrink-0" />
            </div>
          </div>

          {/* 3: Hài lòng */}
          <div
            onClick={() => onNavigateTab('reviews')}
            className="bg-white rounded-xl border border-slate-300 p-3.5 transition hover:border-slate-400 hover:shadow-xs cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider truncate">Hài lòng</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded shrink-0">
                {stats.fiveStars} lượt 5★
              </span>
            </div>
            <div className="my-1.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-950 tracking-tight">{stats.avgScore.toFixed(1)}</span>
              <span className="text-xs font-semibold text-slate-500 truncate">★ ({stats.totalReviews})</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-[#2D5A27] transition">
              <span className="truncate">Xem đánh giá</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-[#2D5A27] transition shrink-0" />
            </div>
          </div>

          {/* 4: Ứng viên nộp CV */}
          <div
            onClick={() => onNavigateTab('team')}
            className="bg-white rounded-xl border border-slate-300 p-3.5 transition hover:border-slate-400 hover:shadow-xs cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider truncate">Ứng viên CV</span>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-1.5 py-0.2 rounded shrink-0">
                {jobs.filter((j) => j.kich_hoat).length} vị trí
              </span>
            </div>
            <div className="my-1.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-950 tracking-tight">{stats.totalApplications}</span>
              <span className="text-xs font-semibold text-slate-500 truncate">hồ sơ nộp</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-[#2D5A27] transition">
              <span className="truncate">Xem tuyển dụng</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-[#2D5A27] transition shrink-0" />
            </div>
          </div>

          {/* 5: Zalo OA (Gộp thành công & lỗi chung) */}
          <div
            onClick={() => onNavigateTab('config', 'notification-logs')}
            className="bg-white rounded-xl border border-slate-300 p-3.5 transition hover:border-blue-400 hover:shadow-xs cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider truncate">Zalo OA (ZNS)</span>
              {notifStats.zalo_that_bai > 0 ? (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded-full shrink-0 flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {notifStats.zalo_that_bai} lỗi
                </span>
              ) : (
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 shrink-0">
                  Hoạt động
                </span>
              )}
            </div>
            <div className="my-1.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-950 font-mono tracking-tight">
                {notifStats.zalo_thanh_cong.toLocaleString('vi-VN')}
              </span>
              <span className="text-xs font-semibold text-slate-500 truncate">tin đã gửi</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-[#0068FF] transition">
              <span className="truncate">Nhật ký tin nhắn</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-[#0068FF] transition shrink-0" />
            </div>
          </div>

          {/* 6: Email (Gộp thành công & lỗi chung) */}
          <div
            onClick={() => onNavigateTab('config', 'notification-logs')}
            className="bg-white rounded-xl border border-slate-300 p-3.5 transition hover:border-emerald-400 hover:shadow-xs cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider truncate">Email Hệ Thống</span>
              {notifStats.email_that_bai > 0 ? (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-300 px-1.5 py-0.2 rounded-full shrink-0 flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  {notifStats.email_that_bai} lỗi
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                  Hoạt động
                </span>
              )}
            </div>
            <div className="my-1.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-950 font-mono tracking-tight">
                {notifStats.email_thanh_cong.toLocaleString('vi-VN')}
              </span>
              <span className="text-xs font-semibold text-slate-500 truncate">thư đã gửi</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-emerald-700 transition">
              <span className="truncate">Nhật ký email</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-emerald-700 transition shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. PHÂN TÍCH LƯU LƯỢNG TRUY CẬP WEBSITE (WEB ANALYTICS) ── */}
      <AdminAnalyticsSection />

      {/* ── 3. BẢNG DỮ LIỆU CHÍNH (LỊCH HẸN & PHÂN BỔ) ── */}
      {/* ── 3. BẢNG DỮ LIỆU CHÍNH (CÁC LỊCH CẦN XỬ LÝ & ĐÁNH GIÁ) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI (2/3): CÁC LỊCH CẦN XỬ LÝ (CHỜ TIẾP NHẬN & ĐÃ TIẾP NHẬN) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-300 overflow-hidden shadow-xs flex flex-col">
          {/* Header với Tiêu đề, Phụ đề, Thanh tiến độ % tiếp nhận */}
          <div className="px-5 py-3.5 border-b border-slate-300 bg-slate-50/70 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-950">
                    Lịch hẹn đặt khám gần nhất
                  </h2>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                    {actionableAppointments.length} lịch cần xử lý
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-600 mt-0.5">
                  Các lịch cần xử lý (Trạng thái chờ tiếp nhận &amp; Đã cập nhật)
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Thanh đếm % tiếp nhận / hoàn thành */}
                <div className="flex flex-col items-start sm:items-end gap-1">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500 font-medium">Tiến độ tiếp nhận:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {stats.totalAppointments > 0
                        ? Math.round(((stats.confirmedCount + stats.completedCount) / stats.totalAppointments) * 100)
                        : 0}%
                    </span>
                    <span className="text-slate-400 font-medium text-[11px]">
                      ({stats.confirmedCount + stats.completedCount}/{stats.totalAppointments})
                    </span>
                  </div>
                  <div className="w-36 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2D5A27] rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          stats.totalAppointments > 0
                            ? Math.round(((stats.confirmedCount + stats.completedCount) / stats.totalAppointments) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateTab('appointments')}
                  className="text-xs font-bold text-[#2D5A27] hover:text-[#1e3d1a] inline-flex items-center gap-1 transition cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <span>Xem tất cả ({appointments.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bảng dữ liệu có thể cuộn và cố định tiêu đề (Sticky thead) */}
          {actionableAppointments.length === 0 ? (
            <div className="p-8 text-center text-xs font-medium text-slate-500">
              Hiện không có lịch hẹn nào đang ở trạng thái chờ tiếp nhận hoặc đã cập nhật.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-100 shadow-2xs border-b border-slate-300">
                  <tr className="text-slate-800 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 bg-slate-100">Khách hàng</th>
                    <th className="py-3 px-3 bg-slate-100">Dịch vụ &amp; Cơ sở</th>
                    <th className="py-3 px-3 bg-slate-100">Thời gian hẹn</th>
                    <th className="py-3 px-4 text-right bg-slate-100">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {actionableAppointments.map((app) => {
                    const isHighlighted = highlightedId === app.id;
                    return (
                      <tr
                        key={app.id}
                        id={`appointment-row-${app.id}`}
                        onClick={() => onNavigateTab('appointments', app.id)}
                        className={`transition-all duration-300 cursor-pointer ${
                          isHighlighted
                            ? 'bg-emerald-100 ring-2 ring-emerald-500 shadow-md font-bold'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* 1. Khách hàng */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-950 text-[13px]">{app.ho_ten_chu}</div>
                          <div className="text-xs font-bold text-slate-700 font-mono mt-0.5">
                            {app.so_dien_thoai}
                          </div>
                        </td>

                        {/* 2. Dịch vụ & Cơ sở */}
                        <td className="py-3.5 px-3">
                          <div className="text-slate-950 font-bold line-clamp-1">{app.dich_vu}</div>
                          <div className="text-xs font-semibold text-slate-600 line-clamp-1">
                            {app.ten_chi_nhanh || 'Cơ sở chính'}
                          </div>
                        </td>

                        {/* 3. Thời gian hẹn */}
                        <td className="py-3.5 px-3 whitespace-nowrap text-slate-900 font-semibold text-xs font-mono">
                          {formatDateTime(app.ngay_hen, app.gio_hen)}
                        </td>

                        {/* 4. Trạng thái */}
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

          {/* ĐÁY KHỐI LỊCH HẸN: THANH TỶ LỆ % ĐẶT LỊCH THEO CHI NHÁNH (TỔNG 100%) */}
          <div className="p-3.5 bg-slate-50/80 border-t border-slate-200 mt-auto">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="font-bold text-slate-800">
                  Phân bổ lịch hẹn theo chi nhánh (100%)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 italic hidden sm:inline">
                Rê chuột vào thanh màu để xem tên chi nhánh
              </span>
            </div>

            {/* Thanh dài phân đoạn 100% */}
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex relative shadow-inner">
              {branchStats.list.map((b) => (
                <div
                  key={b.name}
                  style={{ width: `${b.percent}%` }}
                  className={`${b.color} h-full transition-all duration-300 relative group cursor-pointer`}
                  title={`${b.name}: ${b.count} lịch (${b.percent}%)`}
                >
                  {/* Tooltip nổi khi rê chuột */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none whitespace-nowrap">
                    <div className="bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg shadow-xl border border-slate-700 flex items-center gap-1.5">
                      <span>{b.name}:</span>
                      <span className="font-mono text-amber-300 font-bold">{b.count} lịch</span>
                      <span className="text-slate-300">({b.percent}%)</span>
                    </div>
                    <div className="w-2 h-1 bg-slate-900 clip-triangle -mt-0.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (1/3): YÊU CẦU ĐÁNH GIÁ CHỜ KHÁCH GỬI (NV ĐÃ TẠO NHƯNG KHÁCH CHƯA ĐÁNH GIÁ) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-950">
                    Đánh giá chờ phản hồi
                  </h2>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                    {pendingReviewRequests.length} chờ
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Nhân viên đã tạo nhưng khách chưa vào đánh giá
                </p>
              </div>
              <a
                href="/taodanhgia"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#2D5A27] hover:underline inline-flex items-center gap-1 cursor-pointer"
                title="Mở trang tạo mã đánh giá mới"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo mới</span>
              </a>
            </div>

            {pendingReviewRequests.length === 0 ? (
              <div className="text-xs font-medium text-slate-500 py-8 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Không có yêu cầu đánh giá nào đang chờ khách.</p>
                <a
                  href="/taodanhgia"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#2D5A27] hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Tạo yêu cầu đánh giá cho khách
                </a>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {pendingReviewRequests.map((item) => {
                  const isCopied = copiedReviewCode === item.ma_danh_gia;
                  const displayCode = item.ma_hoa_don || item.ma_danh_gia;
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-slate-200/90 hover:border-slate-300 hover:shadow-xs transition bg-white space-y-2"
                    >
                      {/* Dòng 1: Tên KH + Mã phiếu + Trạng thái */}
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="min-w-0 flex items-center gap-1.5 truncate">
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {item.ten_khach_hang || 'Khách hàng'}
                          </span>
                          <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0">
                            #{displayCode}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.2 rounded-full shrink-0">
                          Chờ khách gửi
                        </span>
                      </div>

                      {/* Dòng 2: SĐT • Cơ sở • Người tạo */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 gap-2">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-mono text-slate-700 font-medium">
                            {item.so_dien_thoai || 'Chưa có SĐT'}
                          </span>
                          {item.co_so && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="truncate max-w-[130px]">{item.co_so}</span>
                            </>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          NV: {item.nguoi_tao || 'Nhân viên'}
                        </span>
                      </div>

                      {/* Dòng 3: Cụm 4 nút thao tác cùng kích thước (Chép link, Zalo OA, QR, Mở) */}
                      <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-slate-100">
                        {/* 1. Nút Chép link (Icon vuông nhỏ gọn đồng kích thước) */}
                        <button
                          type="button"
                          onClick={() => handleCopyReviewLink(item.ma_danh_gia)}
                          className={`w-7.5 h-7.5 rounded-lg border flex items-center justify-center transition shadow-2xs hover:scale-105 active:scale-95 cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                          title={isCopied ? 'Đã chép link' : 'Chép link đánh giá'}
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-600" />
                          )}
                        </button>

                        {/* 2. Nút gửi Zalo OA kèm badge số lần / dấu ! lỗi */}
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() => handleSendZalo(item)}
                            disabled={zaloSendingId === item.id || !item.so_dien_thoai}
                            className="w-7.5 h-7.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0068FF] border border-blue-200 flex items-center justify-center transition shadow-2xs hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                            title={
                              item.so_dien_thoai
                                ? `Gửi qua Zalo OA (ZNS)${item.so_lan_gui_zalo ? ` - Đã gửi ${item.so_lan_gui_zalo} lần` : ''}`
                                : 'Chưa có SĐT khách hàng'
                            }
                          >
                            {zaloSendingId === item.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ZaloIcon className="w-4 h-4 rounded-xs" />
                            )}
                          </button>
                          {/* Badge Zalo: Lỗi (!) hoặc số lần gửi (1, 2...) */}
                          {item.trang_thai_zalo === 'that_bai' ? (
                            <span
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-xs ring-2 ring-white animate-pulse pointer-events-none"
                              title="Gửi Zalo thất bại"
                            >
                              !
                            </span>
                          ) : (item.so_lan_gui_zalo || 0) > 0 ? (
                            <span
                              className="absolute -top-1.5 -right-1.5 min-w-[15px] h-3.5 px-0.5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold shadow-xs ring-2 ring-white pointer-events-none"
                              title={`Đã gửi Zalo ${item.so_lan_gui_zalo} lần`}
                            >
                              {item.so_lan_gui_zalo}
                            </span>
                          ) : null}
                        </div>

                        {/* 3. Nút xem Mã QR */}
                        <button
                          type="button"
                          onClick={() => handleOpenQrModal(item)}
                          className="w-7.5 h-7.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                          title="Xem mã QR &amp; Quét mã"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        {/* 4. Nút Mở trang đánh giá */}
                        <a
                          href={`/danhgiadichvu/${encodeURIComponent(item.ma_danh_gia)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-7.5 h-7.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center transition shadow-2xs hover:scale-105 active:scale-95"
                          title="Mở trang đánh giá"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TOAST THÔNG BÁO KẾT QUẢ GỬI ZALO */}
      {zaloToast && (
        <div className="fixed bottom-24 right-6 z-[9999] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border ${
              zaloToast.success
                ? 'bg-emerald-900 text-white border-emerald-700'
                : 'bg-red-900 text-white border-red-700'
            }`}
          >
            {zaloToast.success ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{zaloToast.message}</span>
            <button
              type="button"
              onClick={() => setZaloToast(null)}
              className="ml-2 text-white/70 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL XEM MÃ QR CODE TỪ THẺ DASHBOARD */}
      {qrModalData && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setQrModalData(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng */}
            <button
              type="button"
              onClick={() => setQrModalData(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Modal */}
            <div className="text-center mb-4 pr-6">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                <QrCode className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Mã QR Đánh Giá</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Khách hàng: <span className="font-bold text-slate-800">{qrModalData.item.ten_khach_hang}</span>
              </p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold border border-slate-200">
                  #{qrModalData.item.ma_hoa_don || qrModalData.item.ma_danh_gia}
                </span>
                {qrModalData.item.co_so && (
                  <span className="text-[11px] text-emerald-700 font-semibold truncate max-w-[160px]">
                    • {qrModalData.item.co_so}
                  </span>
                )}
              </div>
            </div>

            {/* Khung ảnh QR Code */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center mb-4">
              {qrModalData.qrDataUrl ? (
                <img
                  src={qrModalData.qrDataUrl}
                  alt="Mã QR đánh giá"
                  className="w-56 h-56 rounded-xl shadow-xs bg-white p-2.5"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <p className="text-[11px] text-slate-500 text-center mt-2.5 font-medium">
                Dùng camera điện thoại hoặc Zalo quét mã để mở đánh giá
              </p>
            </div>

            {/* Link & Nút hành động */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={qrModalData.link}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition text-center"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>Đi tới link</span>
              </a>
              <a
                href={qrModalData.qrDataUrl}
                download={`QR_${qrModalData.item.ma_hoa_don || qrModalData.item.ma_danh_gia}.png`}
                className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition text-center"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải ảnh QR</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
