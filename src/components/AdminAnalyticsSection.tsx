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
  Compass,
  Activity,
  Layers,
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

// Map thân thiện tên trang từ path - LOẠI BỎ TOÀN BỘ CHÚ THÍCH DẠNG /#booking
function getPageFriendlyName(path: string): string {
  if (!path || path === '/' || path === '') return 'Trang chủ';
  if (path.includes('booking')) return 'Đặt lịch khám & Spa';
  if (path.includes('chi-nhanh')) return 'Hệ thống Chi nhánh';
  if (path.includes('doi-ngu')) return 'Đội ngũ Bác sĩ';
  if (path.includes('kien-thuc') || path.includes('bai-viet')) return 'Cẩm nang & Kiến thức';
  if (path.includes('tuyen-dung')) return 'Tuyển dụng nhân sự';
  if (path.includes('gioi-thieu')) return 'Về PetM&M';
  if (path.includes('danhgiadichvu') || path.includes('danh-gia')) return 'Đánh giá dịch vụ';
  if (path.includes('taodanhgia')) return 'Gửi phản hồi đánh giá';
  return 'Trang chuyên mục';
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
  const [hoveredPoint, setHoveredPoint] = useState<DayAnalytics | null>(null);

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
    const interval = setInterval(() => {
      fetchAnalytics(true);
    }, 45000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  // Lọc danh sách ngày theo filter timeRange (luôn tạo dải ngày thực tế liên tục kết thúc ở hôm nay)
  const filteredDays = useMemo(() => {
    const count = timeRange === 'today' ? 1 : timeRange === '7days' ? 7 : timeRange === '14days' ? 14 : 30;
    const result: DayAnalytics[] = [];
    const now = new Date();

    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400 * 1000);
      const vnTime = new Date(d.getTime() + 7 * 3600 * 1000);
      const dateStr = vnTime.toISOString().slice(0, 10);

      if (data?.days && data.days[dateStr]) {
        result.push(data.days[dateStr]);
      } else {
        result.push({
          date: dateStr,
          pageviews: 0,
          visitors: 0,
          totalDurationSeconds: 0,
          sessions: 0,
          devices: { mobile: 0, desktop: 0, tablet: 0 },
          browsers: {},
          os: {},
          pages: {},
        });
      }
    }
    return result;
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

      // Pages (gộp theo tên trang thân thiện để không còn hiện /#booking)
      if (day.pages) {
        Object.entries(day.pages).forEach(([p, count]) => {
          const friendly = getPageFriendlyName(p);
          pageMap[friendly] = (pageMap[friendly] || 0) + count;
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

    const totalDeviceCount = deviceMap.mobile + deviceMap.desktop + deviceMap.tablet || 1;
    const mobilePercent = Math.round((deviceMap.mobile / totalDeviceCount) * 100);
    const desktopPercent = Math.round((deviceMap.desktop / totalDeviceCount) * 100);
    const tabletPercent = 100 - mobilePercent - desktopPercent;

    // Top pages sorted
    const topPages = Object.entries(pageMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const topBrowsers = Object.entries(browserMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const topOS = Object.entries(osMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalViews,
      totalVisitors,
      totalDurationSeconds,
      totalSessions,
      avgDurationPerVisitor,
      deviceMap,
      mobilePercent,
      desktopPercent,
      tabletPercent,
      topPages,
      topBrowsers,
      topOS,
    };
  }, [filteredDays]);

  // Max views & max duration for SVG line chart scaling
  const chartScales = useMemo(() => {
    if (filteredDays.length === 0) return { maxViews: 100, maxDuration: 300 };
    const maxViews = Math.max(...filteredDays.map((d) => d.pageviews || 0), 10);
    const maxDuration = Math.max(
      ...filteredDays.map((d) =>
        d.visitors > 0 ? Math.round(d.totalDurationSeconds / d.visitors) : 0
      ),
      60
    );
    return { maxViews, maxDuration };
  }, [filteredDays]);

  // Tính tọa độ đường cong SVG
  const linePoints = useMemo(() => {
    const W = 800;
    const H = 150;
    const padX = 35;
    const padY = 20;

    const n = filteredDays.length;
    if (n === 0) return { viewsPath: '', durationPath: '', areaPath: '', points: [] };

    const points = filteredDays.map((day, idx) => {
      const x = n === 1 ? W / 2 : padX + (idx / (n - 1)) * (W - padX * 2);
      const yViews = H - padY - ((day.pageviews || 0) / chartScales.maxViews) * (H - padY * 2);
      const avgDur = day.visitors > 0 ? Math.round(day.totalDurationSeconds / day.visitors) : 0;
      const yDuration = H - padY - (avgDur / chartScales.maxDuration) * (H - padY * 2);
      return { x, yViews, yDuration, day, avgDur };
    });

    const viewsPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yViews.toFixed(1)}`).join(' ');
    const durationPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yDuration.toFixed(1)}`).join(' ');
    const areaPath = `${viewsPath} L ${points[points.length - 1].x.toFixed(1)} ${H} L ${points[0].x.toFixed(1)} ${H} Z`;

    return { viewsPath, durationPath, areaPath, points };
  }, [filteredDays, chartScales]);

  return (
    <div className={`bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden ${className}`}>
      {/* ── HEADER CÔNG CỤ: GỌN GÀNG, BỎ CHÚ THÍCH DÀI, CHỈ ĐỂ CHẤM XANH NHÁY ── */}
      <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#2D5A27] flex items-center justify-center text-white shadow-xs">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Lưu Lượng &amp; Khách Truy Cập Website
            </h3>
            {/* CHỈ ĐỂ DẤU CHẤM XANH NHÁY */}
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* BỘ LỌC THỜI GIAN */}
        <div className="flex items-center gap-2">
          <div className="inline-flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
            {(
              [
                { key: 'today', label: 'Hôm nay' },
                { key: '7days', label: '7 ngày' },
                { key: '14days', label: '14 ngày' },
                { key: '30days', label: '30 ngày' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setTimeRange(filter.key)}
                className={`px-2.5 py-1 rounded-md transition text-xs font-bold ${
                  timeRange === filter.key
                    ? 'bg-white text-[#2D5A27] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
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
            title="Làm mới"
            className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#2D5A27]' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-14 text-center text-xs font-medium text-slate-500">
          <div className="w-6 h-6 mx-auto mb-2 border-2 border-[#2D5A27] border-t-transparent rounded-full animate-spin" />
          Đang tải số liệu...
        </div>
      ) : (
        <div className="p-4 sm:p-5 space-y-4">
          {/* ── 4 THẺ CHỈ SỐ GỌN GÀNG ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* THẺ 1: NGƯỜI TRUY CẬP */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#2D5A27]" />
                  Khách truy cập
                </span>
              </div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-xl font-black text-slate-900">
                  {aggregateMetrics.totalVisitors.toLocaleString('vi-VN')}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">khách</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                {aggregateMetrics.totalSessions.toLocaleString('vi-VN')} phiên xem
              </div>
            </div>

            {/* THẺ 2: LƯỢT XEM TRANG */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  Lượt xem trang
                </span>
              </div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-xl font-black text-slate-900">
                  {aggregateMetrics.totalViews.toLocaleString('vi-VN')}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">lượt</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                TB{' '}
                {aggregateMetrics.totalVisitors > 0
                  ? (aggregateMetrics.totalViews / aggregateMetrics.totalVisitors).toFixed(1)
                  : 0}{' '}
                trang/khách
              </div>
            </div>

            {/* THẺ 3: THỜI LƯỢNG TRUNG BÌNH */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Thời lượng xem web
                </span>
              </div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-xl font-black text-slate-900">
                  {formatDuration(aggregateMetrics.avgDurationPerVisitor)}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">/ khách</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Tổng: {formatDuration(aggregateMetrics.totalDurationSeconds)}
              </div>
            </div>

            {/* THẺ 4: TỶ LỆ THIẾT BỊ */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                  Thiết bị chính
                </span>
              </div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-xl font-black text-slate-900">
                  {aggregateMetrics.mobilePercent}%
                </span>
                <span className="text-[11px] font-semibold text-slate-500">Điện thoại</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500 flex gap-2">
                <span>Laptop: {aggregateMetrics.desktopPercent}%</span>
                <span>Tablet: {aggregateMetrics.tabletPercent}%</span>
              </div>
            </div>
          </div>

          {/* ── HÀNG 1: LƯU LƯỢNG & THỜI LƯỢNG + PHÂN BỔ THIẾT BỊ & MÔI TRƯỜNG NẰM TRÊN 1 HÀNG ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* CỘT TRÁI (7/12): BIỂU ĐỒ ĐƯỜNG LƯU LƯỢNG & THỜI LƯỢNG */}
            <div className="lg:col-span-7 p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#2D5A27]" />
                    Lưu lượng &amp; Thời lượng xem web theo từng ngày
                  </div>

                  {/* Chú giải đường */}
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-[#2D5A27] rounded-full" />
                      <span className="text-[11px]">Lượt xem trang</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-amber-500 rounded-full border-t border-dashed border-amber-500" />
                      <span className="text-[11px]">Thời lượng xem TB</span>
                    </div>
                  </div>
                </div>

                {/* SVG LINE CHART */}
                <div className="relative w-full h-[155px] select-none pt-2">
                  <svg
                    viewBox="0 0 800 150"
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="viewsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2D5A27" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#2D5A27" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Vùng mờ bên dưới đường lượt xem */}
                    {linePoints.areaPath && (
                      <path d={linePoints.areaPath} fill="url(#viewsAreaGrad)" />
                    )}

                    {/* Đường Lượt xem trang (Xanh lá) */}
                    {linePoints.viewsPath && (
                      <path
                        d={linePoints.viewsPath}
                        fill="none"
                        stroke="#2D5A27"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Đường Thời lượng xem (Cam hổ phách) */}
                    {linePoints.durationPath && (
                      <path
                        d={linePoints.durationPath}
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Các điểm tròn dữ liệu trên đường */}
                    {linePoints.points.map((p, idx) => (
                      <g key={idx} className="cursor-pointer">
                        <circle
                          cx={p.x}
                          cy={p.yViews}
                          r="4"
                          className="fill-white stroke-[#2D5A27] stroke-2 hover:r-5 transition-all"
                          onMouseEnter={() => setHoveredPoint(p.day)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        <circle
                          cx={p.x}
                          cy={p.yDuration}
                          r="3"
                          className="fill-white stroke-amber-500 stroke-2 hover:r-4 transition-all"
                          onMouseEnter={() => setHoveredPoint(p.day)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      </g>
                    ))}
                  </svg>

                  {/* Tooltip khi hover điểm */}
                  {hoveredPoint && (
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] px-3 py-1 rounded-lg shadow-md pointer-events-none flex items-center gap-3 z-10">
                      <span className="font-bold text-emerald-400">
                        {formatDateShort(hoveredPoint.date)}:
                      </span>
                      <span>{hoveredPoint.pageviews} xem</span>
                      <span>•</span>
                      <span>{hoveredPoint.visitors} khách</span>
                      <span>•</span>
                      <span className="text-amber-300">
                        TB:{' '}
                        {formatDuration(
                          hoveredPoint.visitors > 0
                            ? Math.round(hoveredPoint.totalDurationSeconds / hoveredPoint.visitors)
                            : 0
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Nhãn ngày bên dưới biểu đồ */}
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 px-2 mt-2 border-t border-slate-200/80 pt-1.5">
                {filteredDays.map((d) => (
                  <div key={d.date} className="text-center">
                    <div>{formatDateShort(d.date)}</div>
                    <div className="text-[9px] font-mono text-slate-400">
                      {formatDuration(
                        d.visitors > 0 ? Math.round(d.totalDurationSeconds / d.visitors) : 0
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CỘT PHẢI (5/12): PHÂN BỔ THIẾT BỊ & MÔI TRƯỜNG TRUY CẬP (3 BẢNG: THIẾT BỊ, TRÌNH DUYỆT, HỆ ĐIỀU HÀNH) */}
            <div className="lg:col-span-5 p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  Phân bổ thiết bị &amp; Môi trường truy cập
                </span>
              </div>

              {/* 1. BẢNG/KHỐI THIẾT BỊ */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Thiết bị
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="p-1.5 rounded-lg border border-purple-100 bg-purple-50/40">
                    <Smartphone className="w-3.5 h-3.5 mx-auto text-purple-600 mb-0.5" />
                    <div className="text-xs font-black text-slate-900">{aggregateMetrics.mobilePercent}%</div>
                    <div className="text-[9px] text-slate-500 font-semibold">ĐTDĐ ({aggregateMetrics.deviceMap.mobile})</div>
                  </div>
                  <div className="p-1.5 rounded-lg border border-blue-100 bg-blue-50/40">
                    <Monitor className="w-3.5 h-3.5 mx-auto text-blue-600 mb-0.5" />
                    <div className="text-xs font-black text-slate-900">{aggregateMetrics.desktopPercent}%</div>
                    <div className="text-[9px] text-slate-500 font-semibold">Laptop ({aggregateMetrics.deviceMap.desktop})</div>
                  </div>
                  <div className="p-1.5 rounded-lg border border-amber-100 bg-amber-50/40">
                    <Tablet className="w-3.5 h-3.5 mx-auto text-amber-600 mb-0.5" />
                    <div className="text-xs font-black text-slate-900">{aggregateMetrics.tabletPercent}%</div>
                    <div className="text-[9px] text-slate-500 font-semibold">Tablet ({aggregateMetrics.deviceMap.tablet})</div>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex mt-1">
                  <div style={{ width: `${aggregateMetrics.mobilePercent}%` }} className="bg-purple-600 h-full" />
                  <div style={{ width: `${aggregateMetrics.desktopPercent}%` }} className="bg-blue-600 h-full" />
                  <div style={{ width: `${aggregateMetrics.tabletPercent}%` }} className="bg-amber-500 h-full" />
                </div>
              </div>

              {/* 2 & 3. BẢNG TRÌNH DUYỆT & BẢNG HỆ ĐIỀU HÀNH */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                {/* 2. BẢNG TRÌNH DUYỆT */}
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Trình duyệt
                  </div>
                  <div className="space-y-1 text-xs">
                    {aggregateMetrics.topBrowsers.slice(0, 4).map((b) => {
                      const pct = aggregateMetrics.totalViews > 0
                        ? Math.round((b.count / aggregateMetrics.totalViews) * 100)
                        : 0;
                      return (
                        <div key={b.name} className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-700 font-medium truncate">{b.name}</span>
                          <span className="font-bold text-slate-900 font-mono text-[10px]">
                            {b.count} <span className="text-slate-400 font-normal">({pct}%)</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. BẢNG HỆ ĐIỀU HÀNH */}
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Hệ điều hành
                  </div>
                  <div className="space-y-1 text-xs">
                    {aggregateMetrics.topOS.slice(0, 4).map((o) => {
                      const pct = aggregateMetrics.totalViews > 0
                        ? Math.round((o.count / aggregateMetrics.totalViews) * 100)
                        : 0;
                      return (
                        <div key={o.name} className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-700 font-medium truncate">{o.name}</span>
                          <span className="font-bold text-slate-900 font-mono text-[10px]">
                            {o.count} <span className="text-slate-400 font-normal">({pct}%)</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── HÀNG 2: TOP TRANG & NHẬT KÝ PHIÊN GẦN ĐÂY ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* CỘT TRÁI: TRANG ĐƯỢC XEM NHIỀU NHẤT */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#2D5A27]" />
                  Trang được xem nhiều nhất
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {aggregateMetrics.topPages.length} trang
                </span>
              </div>

              <div className="space-y-2.5">
                {aggregateMetrics.topPages.slice(0, 6).map((item, idx) => {
                  const percentage =
                    aggregateMetrics.totalViews > 0
                      ? Math.round((item.count / aggregateMetrics.totalViews) * 100)
                      : 0;

                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="w-3.5 text-[11px] font-bold text-slate-400 font-mono">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-slate-800 truncate">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-slate-900 font-mono text-[11px]">
                            {item.count.toLocaleString('vi-VN')}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 w-7 text-right font-mono">
                            {percentage}%
                          </span>
                        </div>
                      </div>

                      {/* Đường thanh tiến trình thanh thoát */}
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
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

            {/* CỘT PHẢI: NHẬT KÝ PHIÊN TRUY CẬP GẦN ĐÂY */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    Nhật ký phiên gần đây
                  </div>
                  {/* CHỈ ĐỂ DẤU CHẤM XANH NHÁY */}
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                        <th className="pb-1.5 px-2">Thời gian</th>
                        <th className="pb-1.5 px-2">Trang đang xem</th>
                        <th className="pb-1.5 px-2">Thiết bị</th>
                        <th className="pb-1.5 px-2 text-right">Thời lượng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {(!data?.recentSessions || data.recentSessions.length === 0) ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                            Chưa có phiên truy cập nào gần đây.
                          </td>
                        </tr>
                      ) : (
                        data.recentSessions.slice(0, 6).map((sess, idx) => {
                          const friendly = getPageFriendlyName(sess.path);
                          return (
                            <tr key={sess.id || idx} className="hover:bg-slate-50/80 transition">
                              <td className="py-2 px-2 text-slate-500 text-[10px] whitespace-nowrap">
                                {formatRelativeTime(sess.time)}
                              </td>
                              <td className="py-2 px-2">
                                <div className="font-bold text-slate-800 text-xs">
                                  {friendly}
                                </div>
                              </td>
                              <td className="py-2 px-2 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    sess.device === 'mobile'
                                      ? 'bg-purple-50 text-purple-700'
                                      : sess.device === 'tablet'
                                      ? 'bg-amber-50 text-amber-700'
                                      : 'bg-blue-50 text-blue-700'
                                  }`}
                                >
                                  {sess.device === 'mobile' ? (
                                    <Smartphone className="w-2.5 h-2.5" />
                                  ) : sess.device === 'tablet' ? (
                                    <Tablet className="w-2.5 h-2.5" />
                                  ) : (
                                    <Monitor className="w-2.5 h-2.5" />
                                  )}
                                  {sess.device === 'mobile'
                                    ? 'ĐTDĐ'
                                    : sess.device === 'tablet'
                                    ? 'Tablet'
                                    : 'Laptop'}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-right whitespace-nowrap">
                                <span className="font-bold text-emerald-800 font-mono text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
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
          </div>
        </div>
      )}
    </div>
  );
}
