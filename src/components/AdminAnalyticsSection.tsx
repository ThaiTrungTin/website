'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Eye,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  RefreshCw,
  Globe,
  Compass,
  Activity,
  Layers,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { DayAnalytics, WebAnalyticsSummary, RecentVisitorSession } from '@/lib/analytics';

interface AdminAnalyticsSectionProps {
  className?: string;
}

type TimeRange = 'today' | '7days' | '14days' | '30days';

// Helper format số giây thành dạng mm:ss hoặc "X phút Y giây"
function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '0 giây';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}p`;
  return `${m}p ${s}s`;
}

// Map thân thiện tên trang từ path
function getPageFriendlyName(path: string): { title: string; category: string } {
  if (path === '/' || path === '') return { title: 'Trang chủ (Home)', category: 'Tổng quan' };
  if (path.includes('booking')) return { title: 'Form đặt lịch khám & Spa', category: 'Chuyển đổi' };
  if (path.includes('chi-nhanh')) return { title: 'Hệ thống Chi nhánh', category: 'Cơ sở' };
  if (path.includes('doi-ngu')) return { title: 'Đội ngũ Bác sĩ', category: 'Giới thiệu' };
  if (path.includes('kien-thuc') || path.includes('bai-viet')) return { title: 'Cẩm nang & Kiến thức', category: 'Nội dung' };
  if (path.includes('tuyen-dung')) return { title: 'Tuyển dụng nhân sự', category: 'Tuyển dụng' };
  if (path.includes('gioi-thieu')) return { title: 'Về PetM&M', category: 'Giới thiệu' };
  return { title: path, category: 'Khác' };
}

// Format ngày YYYY-MM-DD -> DD/MM
function formatDateShort(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  return dateStr;
}

// Format ngày giờ tương đối (VD: 5 phút trước)
function formatRelativeTime(isoStr: string): string {
  try {
    const diffSeconds = Math.round((Date.now() - new Date(isoStr).getTime()) / 1000);
    if (diffSeconds < 60) return `${Math.max(1, diffSeconds)} giây trước`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${Math.floor(diffHours / 24)} ngày trước`;
  } catch {
    return 'Gần đây';
  }
}

export default function AdminAnalyticsSection({ className = '' }: AdminAnalyticsSectionProps) {
  const [data, setData] = useState<WebAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');
  const [activeTab, setActiveTab] = useState<'overview' | 'pages' | 'devices' | 'live'>('overview');

  const fetchAnalytics = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await fetch('/api/admin/analytics', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Lỗi tải analytics:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    // Tự động làm mới mỗi 45 giây để admin theo dõi theo thời gian thực
    const interval = setInterval(() => {
      fetchAnalytics(true);
    }, 45000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  // Lọc danh sách ngày theo filter timeRange
  const filteredDays = useMemo(() => {
    if (!data || !data.days) return [];

    const allDates = Object.keys(data.days).sort();
    if (allDates.length === 0) return [];

    if (timeRange === 'today') {
      const todayDate = allDates[allDates.length - 1];
      return todayDate && data.days[todayDate] ? [data.days[todayDate]] : [];
    }

    const count = timeRange === '7days' ? 7 : timeRange === '14days' ? 14 : 30;
    const selectedDates = allDates.slice(-count);
    return selectedDates.map((d) => data.days[d]).filter(Boolean);
  }, [data, timeRange]);

  // Tính toán số liệu tổng hợp trong khoảng thời gian đã chọn
  const aggregateMetrics = useMemo(() => {
    let totalViews = 0;
    let totalVisitors = 0;
    let totalDurationSeconds = 0;
    let totalSessions = 0;

    const deviceMap = { mobile: 0, desktop: 0, tablet: 0 };
    const pageMap: Record<string, number> = {};
    const browserMap: Record<string, number> = {};
    const osMap: Record<string, number> = {};

    filteredDays.forEach((day) => {
      totalViews += day.pageviews || 0;
      totalVisitors += day.visitors || 0;
      totalDurationSeconds += day.totalDurationSeconds || 0;
      totalSessions += day.sessions || 0;

      // Devices
      deviceMap.mobile += day.devices?.mobile || 0;
      deviceMap.desktop += day.devices?.desktop || 0;
      deviceMap.tablet += day.devices?.tablet || 0;

      // Pages
      if (day.pages) {
        Object.entries(day.pages).forEach(([p, count]) => {
          pageMap[p] = (pageMap[p] || 0) + count;
        });
      }

      // Browsers
      if (day.browsers) {
        Object.entries(day.browsers).forEach(([b, count]) => {
          browserMap[b] = (browserMap[b] || 0) + count;
        });
      }

      // OS
      if (day.os) {
        Object.entries(day.os).forEach(([o, count]) => {
          osMap[o] = (osMap[o] || 0) + count;
        });
      }
    });

    const avgDurationPerVisitor =
      totalVisitors > 0 ? Math.round(totalDurationSeconds / totalVisitors) : 0;
    const avgDurationPerView =
      totalViews > 0 ? Math.round(totalDurationSeconds / totalViews) : 0;

    const totalDeviceCount = deviceMap.mobile + deviceMap.desktop + deviceMap.tablet || 1;
    const mobilePercent = Math.round((deviceMap.mobile / totalDeviceCount) * 100);
    const desktopPercent = Math.round((deviceMap.desktop / totalDeviceCount) * 100);
    const tabletPercent = 100 - mobilePercent - desktopPercent;

    // Top pages sorted
    const topPages = Object.entries(pageMap)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count);

    // Top browsers
    const topBrowsers = Object.entries(browserMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Top OS
    const topOS = Object.entries(osMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalViews,
      totalVisitors,
      totalDurationSeconds,
      totalSessions,
      avgDurationPerVisitor,
      avgDurationPerView,
      deviceMap,
      mobilePercent,
      desktopPercent,
      tabletPercent,
      topPages,
      topBrowsers,
      topOS,
    };
  }, [filteredDays]);

  // Max views in daily array for bar chart scaling
  const maxDayViews = useMemo(() => {
    if (filteredDays.length === 0) return 100;
    return Math.max(...filteredDays.map((d) => d.pageviews || 0), 10);
  }, [filteredDays]);

  return (
    <div className={`bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden ${className}`}>
      {/* ── HEADER THANH CÔNG CỤ ── */}
      <div className="p-5 border-b border-slate-200 bg-linear-to-r from-emerald-50/40 via-white to-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2D5A27] flex items-center justify-center text-white shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Lưu Lượng &amp; Khách Truy Cập Website (Web Analytics)
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Realtime
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Theo dõi lượng khách, thiết bị (ĐTDĐ, Laptop, Tablet), trang xem nhiều và thời lượng xem web
              </p>
            </div>
          </div>
        </div>

        {/* BỘ LỌC THỜI GIAN & LÀM MỚI */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {(
              [
                { key: 'today', label: 'Hôm nay' },
                { key: '7days', label: '7 ngày qua' },
                { key: '14days', label: '14 ngày' },
                { key: '30days', label: '30 ngày' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setTimeRange(filter.key)}
                className={`px-3 py-1.5 rounded-lg transition text-xs font-bold ${
                  timeRange === filter.key
                    ? 'bg-white text-[#2D5A27] shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => fetchAnalytics(true)}
            disabled={isRefreshing || loading}
            title="Làm mới số liệu"
            className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#2D5A27]' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs font-medium text-slate-500">
          <div className="w-8 h-8 mx-auto mb-2 border-2 border-[#2D5A27] border-t-transparent rounded-full animate-spin" />
          Đang tổng hợp dữ liệu phân tích web...
        </div>
      ) : (
        <div className="p-5 space-y-6">
          {/* ── 4 THẺ CHỈ SỐ LỚN (METRIC CARDS) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* THẺ 1: NGƯỜI TRUY CẬP (VISITORS) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-linear-to-br from-white to-emerald-50/20 hover:border-emerald-300 transition shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <Users className="w-3.5 h-3.5 text-[#2D5A27]" />
                  Khách truy cập
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                  Người dùng thật
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {aggregateMetrics.totalVisitors.toLocaleString('vi-VN')}
                </span>
                <span className="text-xs font-semibold text-slate-500">khách</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Số phiên: {aggregateMetrics.totalSessions.toLocaleString('vi-VN')}</span>
                <span className="text-emerald-700 font-bold">100% người dùng thực</span>
              </div>
            </div>

            {/* THẺ 2: LƯỢT XEM TRANG (PAGEVIEWS) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-linear-to-br from-white to-blue-50/20 hover:border-blue-300 transition shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  Lượt xem trang
                </span>
                <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
                  Pageviews
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {aggregateMetrics.totalViews.toLocaleString('vi-VN')}
                </span>
                <span className="text-xs font-semibold text-slate-500">lượt</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Trung bình / khách</span>
                <span className="font-bold text-slate-800">
                  {aggregateMetrics.totalVisitors > 0
                    ? (aggregateMetrics.totalViews / aggregateMetrics.totalVisitors).toFixed(1)
                    : 0}{' '}
                  trang
                </span>
              </div>
            </div>

            {/* THẺ 3: THỜI LƯỢNG TRUNG BÌNH (AVG DURATION) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-linear-to-br from-white to-amber-50/20 hover:border-amber-300 transition shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Thời lượng xem web
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                  Mỗi khách
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {formatDuration(aggregateMetrics.avgDurationPerVisitor)}
                </span>
                <span className="text-xs font-semibold text-slate-500">/ lượt ghé</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Tổng thời gian đọc</span>
                <span className="font-bold text-slate-800">
                  {formatDuration(aggregateMetrics.totalDurationSeconds)}
                </span>
              </div>
            </div>

            {/* THẺ 4: TỶ LỆ THIẾT BỊ PHỔ BIẾN (DEVICE BREAKDOWN) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-linear-to-br from-white to-purple-50/20 hover:border-purple-300 transition shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                  Thiết bị truy cập
                </span>
                <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded">
                  {aggregateMetrics.mobilePercent}% ĐTDĐ
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {aggregateMetrics.mobilePercent}%
                </span>
                <span className="text-xs font-semibold text-slate-500">Điện thoại di động</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Laptop/PC: {aggregateMetrics.desktopPercent}%</span>
                <span>Tablet: {aggregateMetrics.tabletPercent}%</span>
              </div>
            </div>
          </div>

          {/* ── BIỂU ĐỒ LƯỢT XEM VÀ THỜI LƯỢNG THEO TỪNG NGÀY ── */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#2D5A27]" />
                  Lưu lượng &amp; Thời lượng xem web theo từng ngày
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Cột thể hiện số lượt xem (Pageviews), nhãn hiển thị thời lượng xem trung bình trong ngày
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#2D5A27]" />
                  <span>Lượt xem trang</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-emerald-300" />
                  <span>Khách truy cập</span>
                </div>
              </div>
            </div>

            {/* BAR CHART TỰ DỰNG BẰNG CSS/HTML ĐẢM BẢO HOẠT ĐỘNG 100% KHÔNG CẦN LIB BÊN NGOÀI */}
            <div className="h-44 flex items-end gap-2 sm:gap-3 pt-6 pb-2 border-b border-slate-200">
              {filteredDays.map((day) => {
                const heightPercent = Math.max(12, Math.round((day.pageviews / maxDayViews) * 100));
                const avgDuration =
                  day.visitors > 0 ? Math.round(day.totalDurationSeconds / day.visitors) : 0;

                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  >
                    {/* Tooltip hover */}
                    <div className="absolute -top-12 z-10 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
                      <div className="font-bold text-emerald-400">{formatDateShort(day.date)}</div>
                      <div>
                        {day.pageviews} xem • {day.visitors} khách • TB: {formatDuration(avgDuration)}
                      </div>
                    </div>

                    {/* Giá trị trên cột */}
                    <span className="text-[10px] font-bold text-slate-700 mb-1 opacity-70 group-hover:opacity-100 transition">
                      {day.pageviews}
                    </span>

                    {/* Thanh cột phân tầng */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[42px] rounded-t-lg bg-linear-to-t from-[#1b3817] via-[#2D5A27] to-emerald-500 group-hover:brightness-110 transition-all flex flex-col justify-end overflow-hidden shadow-2xs"
                    >
                      <div
                        style={{
                          height: `${Math.min(100, Math.round((day.visitors / (day.pageviews || 1)) * 100))}%`,
                        }}
                        className="bg-emerald-300/40 w-full"
                      />
                    </div>

                    {/* Nhãn ngày bên dưới */}
                    <span className="text-[11px] font-bold text-slate-600 mt-2">
                      {formatDateShort(day.date)}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-600 font-mono">
                      {formatDuration(avgDuration)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 2 CỘT: CỘT 1 (TRANG XEM NHIỀU NHẤT) & CỘT 2 (PHÂN BỔ THIẾT BỊ / NỀN TẢNG) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CỘT TRÁI: TOP TRANG ĐƯỢC XEM NHIỀU NHẤT */}
            <div className="p-5 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#2D5A27]" />
                    Trang được xem nhiều nhất (Top Pages)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Xác định nội dung thu hút khách hàng quan tâm nhất
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {aggregateMetrics.topPages.length} trang
                </span>
              </div>

              <div className="space-y-3">
                {aggregateMetrics.topPages.slice(0, 7).map((item, idx) => {
                  const percentage =
                    aggregateMetrics.totalViews > 0
                      ? Math.round((item.count / aggregateMetrics.totalViews) * 100)
                      : 0;
                  const friendly = getPageFriendlyName(item.path);

                  return (
                    <div key={item.path} className="group">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="w-4 text-[11px] font-bold text-slate-400 font-mono">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-slate-900 truncate">
                            {friendly.title}
                          </span>
                          <code className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-mono hidden sm:inline">
                            {item.path}
                          </code>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-slate-900 font-mono">
                            {item.count.toLocaleString('vi-VN')}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 w-8 text-right font-mono">
                            {percentage}%
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percentage}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            idx === 0
                              ? 'bg-[#2D5A27]'
                              : idx === 1
                              ? 'bg-emerald-600'
                              : 'bg-emerald-400'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CỘT PHẢI: PHÂN BỔ THIẾT BỊ, TRÌNH DUYỆT & HỆ ĐIỀU HÀNH */}
            <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-5">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  Phân bổ thiết bị &amp; Môi trường truy cập
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tỷ lệ thiết bị (Điện thoại, Laptop, Máy tính bảng), Trình duyệt và Hệ điều hành
                </p>
              </div>

              {/* 1. THIẾT BỊ */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  1. Loại Thiết Bị
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {/* Phone */}
                  <div className="p-2.5 rounded-lg border border-purple-200 bg-purple-50/50">
                    <Smartphone className="w-4 h-4 mx-auto text-purple-700 mb-1" />
                    <div className="text-xs font-bold text-slate-900">
                      {aggregateMetrics.mobilePercent}%
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Điện thoại</div>
                    <div className="text-[10px] font-semibold text-purple-700 font-mono mt-0.5">
                      {aggregateMetrics.deviceMap.mobile} lượt
                    </div>
                  </div>

                  {/* Laptop / Desktop */}
                  <div className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/50">
                    <Monitor className="w-4 h-4 mx-auto text-blue-700 mb-1" />
                    <div className="text-xs font-bold text-slate-900">
                      {aggregateMetrics.desktopPercent}%
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Laptop / PC</div>
                    <div className="text-[10px] font-semibold text-blue-700 font-mono mt-0.5">
                      {aggregateMetrics.deviceMap.desktop} lượt
                    </div>
                  </div>

                  {/* Tablet */}
                  <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/50">
                    <Tablet className="w-4 h-4 mx-auto text-amber-700 mb-1" />
                    <div className="text-xs font-bold text-slate-900">
                      {aggregateMetrics.tabletPercent}%
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Máy tính bảng</div>
                    <div className="text-[10px] font-semibold text-amber-700 font-mono mt-0.5">
                      {aggregateMetrics.deviceMap.tablet} lượt
                    </div>
                  </div>
                </div>

                {/* Progress bar kết hợp */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${aggregateMetrics.mobilePercent}%` }}
                    className="bg-purple-600 h-full"
                    title={`Điện thoại: ${aggregateMetrics.mobilePercent}%`}
                  />
                  <div
                    style={{ width: `${aggregateMetrics.desktopPercent}%` }}
                    className="bg-blue-600 h-full"
                    title={`Laptop/PC: ${aggregateMetrics.desktopPercent}%`}
                  />
                  <div
                    style={{ width: `${aggregateMetrics.tabletPercent}%` }}
                    className="bg-amber-500 h-full"
                    title={`Tablet: ${aggregateMetrics.tabletPercent}%`}
                  />
                </div>
              </div>

              {/* 2. TRÌNH DUYỆT & HỆ ĐIỀU HÀNH */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                {/* Trình duyệt */}
                <div>
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    2. Trình duyệt
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {aggregateMetrics.topBrowsers.slice(0, 4).map((b) => (
                      <div key={b.name} className="flex items-center justify-between">
                        <span className="text-slate-700 font-medium">{b.name}</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {b.count}{' '}
                          <span className="text-[10px] text-slate-400 font-normal">
                            (
                            {aggregateMetrics.totalViews > 0
                              ? Math.round((b.count / aggregateMetrics.totalViews) * 100)
                              : 0}
                            %)
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hệ điều hành */}
                <div>
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                    3. Hệ điều hành
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {aggregateMetrics.topOS.slice(0, 4).map((o) => (
                      <div key={o.name} className="flex items-center justify-between">
                        <span className="text-slate-700 font-medium">{o.name}</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {o.count}{' '}
                          <span className="text-[10px] text-slate-400 font-normal">
                            (
                            {aggregateMetrics.totalViews > 0
                              ? Math.round((o.count / aggregateMetrics.totalViews) * 100)
                              : 0}
                            %)
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── BẢNG CÁC PHIÊN TRUY CẬP GẦN ĐÂY (REAL-TIME ACTIVITY FEED) ── */}
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  Nhật Ký Phiên Truy Cập Gần Đây (Live Visitor Stream)
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Danh sách khách hàng đang ghé thăm website theo thời gian thực
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Đang trực tuyến
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/60 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                    <th className="py-2.5 px-4">Thời gian</th>
                    <th className="py-2.5 px-3">Trang đang xem</th>
                    <th className="py-2.5 px-3">Thiết bị</th>
                    <th className="py-2.5 px-3">Trình duyệt &amp; HĐH</th>
                    <th className="py-2.5 px-3 text-right">Thời lượng xem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {(!data?.recentSessions || data.recentSessions.length === 0) ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                        Chưa có phiên truy cập nào gần đây.
                      </td>
                    </tr>
                  ) : (
                    data.recentSessions.slice(0, 10).map((sess, idx) => {
                      const friendly = getPageFriendlyName(sess.path);
                      return (
                        <tr key={sess.id || idx} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                            {formatRelativeTime(sess.time)}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900 text-xs">
                              {friendly.title}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {sess.path}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                sess.device === 'mobile'
                                  ? 'bg-purple-100 text-purple-800'
                                  : sess.device === 'tablet'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {sess.device === 'mobile' ? (
                                <Smartphone className="w-3 h-3" />
                              ) : sess.device === 'tablet' ? (
                                <Tablet className="w-3 h-3" />
                              ) : (
                                <Monitor className="w-3 h-3" />
                              )}
                              {sess.device === 'mobile'
                                ? 'Điện thoại'
                                : sess.device === 'tablet'
                                ? 'Máy tính bảng'
                                : 'Laptop/PC'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 text-xs">
                            <span className="font-semibold text-slate-800">{sess.browser}</span>
                            <span className="text-slate-400 mx-1">•</span>
                            <span className="text-slate-500">{sess.os}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono text-[11px]">
                              {formatDuration(sess.durationSeconds || 15)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
