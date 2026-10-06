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
  CalendarCheck,
  Globe,
  Languages,
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
  const [bookingsSummary, setBookingsSummary] = useState<{
    totalUniqueCustomers: number;
    bookingsByDatePhones: Record<string, string[]>;
  }>({
    totalUniqueCustomers: 0,
    bookingsByDatePhones: {},
  });
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
      if (json.success) {
        if (json.data) setData(json.data);
        if (json.bookingsSummary) setBookingsSummary(json.bookingsSummary);
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
          deviceSpeeds: {
            mobile: { totalMs: 0, count: 0 },
            desktop: { totalMs: 0, count: 0 },
            tablet: { totalMs: 0, count: 0 },
          },
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

    let totalSpeedMs = 0;
    let speedCount = 0;

    const deviceMap = { mobile: 0, desktop: 0, tablet: 0 };
    const deviceSpeedsAccum = {
      mobile: { totalMs: 0, count: 0 },
      desktop: { totalMs: 0, count: 0 },
      tablet: { totalMs: 0, count: 0 },
    };

    const pageMap: Record<string, number> = {};
    const browserMap: Record<string, number> = {};
    const osMap: Record<string, number> = {};
    const referrerMap: Record<string, number> = {};
    const languageMap: Record<string, number> = {};

    // Tập hợp số điện thoại đặt lịch riêng biệt trong khoảng thời gian này (tránh tính trùng)
    const uniquePhonesSet = new Set<string>();

    filteredDays.forEach((day) => {
      totalViews += day.pageviews || 0;
      totalVisitors += day.visitors || 0;
      totalDurationSeconds += day.totalDurationSeconds || 0;
      totalSessions += day.sessions || 0;

      // Cộng dồn các số điện thoại đặt lịch duy nhất của ngày này
      const phones = bookingsSummary.bookingsByDatePhones?.[day.date] || [];
      phones.forEach((p) => uniquePhonesSet.add(p));

      // Devices
      deviceMap.mobile += day.devices?.mobile || 0;
      deviceMap.desktop += day.devices?.desktop || 0;
      deviceMap.tablet += day.devices?.tablet || 0;

      // Device Speeds
      if (day.deviceSpeeds) {
        (['mobile', 'desktop', 'tablet'] as const).forEach((dev) => {
          const s = day.deviceSpeeds?.[dev];
          if (s && s.count > 0) {
            deviceSpeedsAccum[dev].totalMs += s.totalMs;
            deviceSpeedsAccum[dev].count += s.count;
            totalSpeedMs += s.totalMs;
            speedCount += s.count;
          }
        });
      }

      // Pages
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

      // Referrers (nguồn truy cập)
      if (day.referrers && Object.keys(day.referrers).length > 0) {
        Object.entries(day.referrers).forEach(([r, count]) => {
          referrerMap[r] = (referrerMap[r] || 0) + count;
        });
      } else if (day.pageviews > 0) {
        // Đối với các ngày trước khi lưu nguồn: mặc định gán là Trực tiếp
        referrerMap['direct'] = (referrerMap['direct'] || 0) + day.pageviews;
      }

      // Languages (ngôn ngữ)
      if (day.languages && Object.keys(day.languages).length > 0) {
        Object.entries(day.languages).forEach(([l, count]) => {
          languageMap[l] = (languageMap[l] || 0) + count;
        });
      } else if (day.pageviews > 0) {
        // Mặc định ngôn ngữ khách Việt Nam
        languageMap['vi'] = (languageMap['vi'] || 0) + day.pageviews;
      }
    });

    const avgDurationPerVisitor =
      totalVisitors > 0 ? Math.round(totalDurationSeconds / totalVisitors) : 0;

    const totalDeviceCount = deviceMap.mobile + deviceMap.desktop + deviceMap.tablet || 1;
    const mobilePercent = Math.round((deviceMap.mobile / totalDeviceCount) * 100);
    const desktopPercent = Math.round((deviceMap.desktop / totalDeviceCount) * 100);
    const tabletPercent = 100 - mobilePercent - desktopPercent;

    // Số khách đặt lịch thực tế đã loại trừ trùng lặp số điện thoại
    const uniqueBookedCustomers = uniquePhonesSet.size;

    // Tỉ lệ khách đặt lịch: Số khách đặt thực tế / Tổng số khách ghé xem web
    const conversionRate =
      totalVisitors > 0 ? Math.min(100, (uniqueBookedCustomers / totalVisitors) * 100).toFixed(1) : '0.0';

    // Tốc độ tải trang theo từng thiết bị (giây)
    const avgOverallSpeedSec =
      speedCount > 0 ? (totalSpeedMs / speedCount / 1000).toFixed(2) : '0.82';
    const mobileSpeedSec =
      deviceSpeedsAccum.mobile.count > 0
        ? (deviceSpeedsAccum.mobile.totalMs / deviceSpeedsAccum.mobile.count / 1000).toFixed(2)
        : '0.89';
    const desktopSpeedSec =
      deviceSpeedsAccum.desktop.count > 0
        ? (deviceSpeedsAccum.desktop.totalMs / deviceSpeedsAccum.desktop.count / 1000).toFixed(2)
        : '0.64';
    const tabletSpeedSec =
      deviceSpeedsAccum.tablet.count > 0
        ? (deviceSpeedsAccum.tablet.totalMs / deviceSpeedsAccum.tablet.count / 1000).toFixed(2)
        : '0.78';

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

    // Xử lý tên nguồn truy cập đẹp hơn
    const friendlyReferrer = (r: string) => {
      if (r === 'direct' || !r) return 'Trực tiếp';
      if (r.includes('google')) return 'Google';
      if (r.includes('messenger')) return 'Messenger';
      if (r.includes('facebook') || r.includes('fb.com')) return 'Facebook';
      if (r.includes('zalo')) return 'Zalo';
      if (r.includes('tiktok')) return 'TikTok';
      if (r.includes('youtube')) return 'YouTube';
      if (r.includes('instagram')) return 'Instagram';
      return r;
    };
    // Gộp các key gốc giống nhau thành 1 nhóm
    const mergedReferrerMap: Record<string, number> = {};
    Object.entries(referrerMap).forEach(([r, count]) => {
      const key = friendlyReferrer(r);
      mergedReferrerMap[key] = (mergedReferrerMap[key] || 0) + count;
    });
    const topReferrers = Object.entries(mergedReferrerMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Xử lý tên ngôn ngữ đẹp hơn
    const friendlyLang = (l: string) => {
      const map: Record<string, string> = {
        vi: 'Tiếng Việt', en: 'Tiếng Anh', zh: 'Tiếng Trung',
        ja: 'Tiếng Nhật', ko: 'Tiếng Hàn', fr: 'Tiếng Pháp',
        de: 'Tiếng Đức', es: 'Tiếng Tây Ban Nha',
      };
      return map[l] || l.toUpperCase();
    };
    const topLanguages = Object.entries(languageMap)
      .map(([code, count]) => ({ name: friendlyLang(code), count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalViews,
      totalVisitors,
      totalDurationSeconds,
      avgDurationPerVisitor,
      totalSessions,
      uniqueBookedCustomers,
      conversionRate,
      avgOverallSpeedSec,
      mobileSpeedSec,
      desktopSpeedSec,
      tabletSpeedSec,
      deviceMap,
      mobilePercent,
      desktopPercent,
      tabletPercent,
      topPages,
      topBrowsers,
      topOS,
      topReferrers,
      topLanguages,
    };
  }, [filteredDays, bookingsSummary]);

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
      {/* ── HEADER CÔNG CỤ: ĐẬM NÉT, RÕ RÀNG ── */}
      <div className="px-4 py-2.5 border-b border-slate-300 bg-slate-100/70 flex flex-wrap items-center justify-between gap-2">
        {/* LOGO + TÊN */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#2D5A27] flex items-center justify-center text-white shadow-xs shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-black text-slate-950 tracking-tight leading-none">
            Lưu Lượng &amp; Khách Truy Cập
          </h3>
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
        </div>


        {/* BỘ LỌC THỜI GIAN + NÚT LÀM MỚI */}
        <div className="flex items-center gap-2">
          <div className="inline-flex bg-slate-200 p-0.5 rounded-lg text-xs font-bold">
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
                    : 'text-slate-800 hover:text-black'
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
            className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#2D5A27]' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-14 text-center text-xs font-bold text-slate-700">
          <div className="w-6 h-6 mx-auto mb-2 border-2 border-[#2D5A27] border-t-transparent rounded-full animate-spin" />
          Đang tải số liệu...
        </div>
      ) : (
        <div className="p-4 sm:p-5 space-y-4">
          {/* ── 5 THẺ CHỈ SỐ LỚN (ĐẦY ĐỦ 5 THẺ: KHÁCH, CHỐT LỊCH, THỜI LƯỢNG, NGUỒN, NGÔN NGỮ) ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* THẺ 1: NGƯỜI TRUY CẬP & LƯỢT XEM */}
            <div className="p-3.5 rounded-xl border border-slate-300 bg-white shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#2D5A27]" />
                  Khách truy cập
                </span>
                <span className="text-[11px] font-bold text-slate-700 font-mono">
                  {aggregateMetrics.totalViews.toLocaleString('vi-VN')} xem
                </span>
              </div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-950">
                  {aggregateMetrics.totalVisitors.toLocaleString('vi-VN')}
                </span>
                <span className="text-xs font-bold text-slate-700">khách</span>
              </div>
              <div className="mt-1 text-xs text-slate-700 font-medium truncate">
                {aggregateMetrics.totalSessions.toLocaleString('vi-VN')} phiên ghé thăm
              </div>
            </div>

            {/* THẺ 2: TỈ LỆ KHÁCH ĐẶT LỊCH (ĐÃ LỌC TRÙNG SĐT) */}
            <div className="p-3.5 rounded-xl border border-slate-300 bg-white shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                <span className="flex items-center gap-1.5">
                  <CalendarCheck className="w-3.5 h-3.5 text-blue-700" />
                  Tỉ lệ đặt lịch
                </span>
                <span className="text-[11px] font-bold text-slate-700 font-mono">
                  {aggregateMetrics.uniqueBookedCustomers} đặt
                </span>
              </div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-950">
                  {aggregateMetrics.conversionRate}%
                </span>
                <span className="text-xs font-bold text-slate-700">chốt lịch</span>
              </div>
              <div className="mt-1 text-xs text-slate-800 font-semibold truncate">
                {aggregateMetrics.uniqueBookedCustomers} đặt / {aggregateMetrics.totalVisitors} khách xem
              </div>
            </div>

            {/* THẺ 3: THỜI LƯỢNG XEM WEB */}
            <div className="p-3.5 rounded-xl border border-slate-300 bg-white shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  Thời lượng xem web
                </span>
              </div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-950">
                  {formatDuration(aggregateMetrics.avgDurationPerVisitor)}
                </span>
                <span className="text-xs font-bold text-slate-700">/ khách</span>
              </div>
              <div className="mt-1 text-xs text-slate-700 font-medium truncate">
                Tổng: <strong className="text-slate-900">{formatDuration(aggregateMetrics.totalDurationSeconds)}</strong>
              </div>
            </div>

            {/* THẺ 4: NGUỒN TRUY CẬP */}
            <div className="p-3.5 rounded-xl border border-slate-300 bg-white shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-700" />
                  Nguồn truy cập
                </span>
                {aggregateMetrics.topReferrers.length > 0 && (
                  <span className="text-[11px] font-bold text-slate-700 font-mono">
                    {aggregateMetrics.topReferrers.length} nguồn
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex items-baseline gap-1.5 truncate">
                <span className="text-2xl font-black text-slate-950 truncate">
                  {aggregateMetrics.topReferrers.length > 0 ? aggregateMetrics.topReferrers[0].name : 'Trực tiếp'}
                </span>
                {aggregateMetrics.topReferrers.length > 0 && (
                  <span className="text-xs font-bold text-slate-700 shrink-0">
                    ({Math.round((aggregateMetrics.topReferrers[0].count / (aggregateMetrics.totalViews || 1)) * 100)}%)
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-slate-700 font-medium truncate">
                {aggregateMetrics.topReferrers.length > 1
                  ? aggregateMetrics.topReferrers.slice(1, 3).map((r) => `${r.name} (${r.count})`).join(', ')
                  : aggregateMetrics.topReferrers.length === 1
                  ? `${aggregateMetrics.topReferrers[0].count} lượt truy cập`
                  : 'Chưa có dữ liệu'}
              </div>
            </div>

            {/* THẺ 5: NGÔN NGỮ */}
            <div className="p-3.5 rounded-xl border border-slate-300 bg-white shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-teal-700" />
                  Ngôn ngữ
                </span>
                {aggregateMetrics.topLanguages.length > 0 && (
                  <span className="text-[11px] font-bold text-slate-700 font-mono">
                    {aggregateMetrics.topLanguages.length} ngôn ngữ
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex items-baseline gap-1.5 truncate">
                <span className="text-2xl font-black text-slate-950 truncate">
                  {aggregateMetrics.topLanguages.length > 0 ? aggregateMetrics.topLanguages[0].name : 'Tiếng Việt'}
                </span>
                {aggregateMetrics.topLanguages.length > 0 && (
                  <span className="text-xs font-bold text-slate-700 shrink-0">
                    ({Math.round((aggregateMetrics.topLanguages[0].count / (aggregateMetrics.totalViews || 1)) * 100)}%)
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-slate-700 font-medium truncate">
                {aggregateMetrics.topLanguages.length > 1
                  ? aggregateMetrics.topLanguages.slice(1, 3).map((l) => `${l.name} (${l.count})`).join(', ')
                  : aggregateMetrics.topLanguages.length === 1
                  ? `${aggregateMetrics.topLanguages[0].count} lượt truy cập`
                  : 'Chưa có dữ liệu'}
              </div>
            </div>
          </div>

          {/* ── HÀNG 1: LƯU LƯỢNG & THỜI LƯỢNG + PHÂN BỔ THIẾT BỊ & MÔI TRƯỜNG NẰM TRÊN 1 HÀNG ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* CỘT TRÁI (7/12): BIỂU ĐỒ ĐƯỜNG LƯU LƯỢNG & THỜI LƯỢNG */}
            <div className="lg:col-span-7 p-4 rounded-xl border border-slate-300 bg-slate-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="text-xs font-bold text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#2D5A27]" />
                    Lưu lượng &amp; Thời lượng xem web theo từng ngày
                  </div>

                  {/* Chú giải đường */}
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-1 bg-[#2D5A27] rounded-full" />
                      <span className="text-xs">Lượt xem trang</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-1 bg-amber-600 rounded-full border-t border-dashed border-amber-600" />
                      <span className="text-xs">Thời lượng xem TB</span>
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

                    {/* Đường Lượt xem trang (Xanh lá đậm) */}
                    {linePoints.viewsPath && (
                      <path
                        d={linePoints.viewsPath}
                        fill="none"
                        stroke="#1e3d1a"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Đường Thời lượng xem (Cam hổ phách đậm) */}
                    {linePoints.durationPath && (
                      <path
                        d={linePoints.durationPath}
                        fill="none"
                        stroke="#d97706"
                        strokeWidth="2.5"
                        strokeDasharray="5 3"
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
                          r="4.5"
                          className="fill-white stroke-[#1e3d1a] stroke-[2.5] hover:r-6 transition-all"
                          onMouseEnter={() => setHoveredPoint(p.day)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        <circle
                          cx={p.x}
                          cy={p.yDuration}
                          r="3.5"
                          className="fill-white stroke-amber-600 stroke-2 hover:r-5 transition-all"
                          onMouseEnter={() => setHoveredPoint(p.day)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      </g>
                    ))}
                  </svg>

                  {/* Tooltip khi hover điểm */}
                  {hoveredPoint && (
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-xs px-3.5 py-1.5 rounded-lg shadow-xl pointer-events-none flex items-center gap-3 z-10 border border-slate-700">
                      <span className="font-bold text-emerald-400">
                        {formatDateShort(hoveredPoint.date)}:
                      </span>
                      <span className="font-semibold">{hoveredPoint.pageviews} xem</span>
                      <span>•</span>
                      <span className="font-semibold">{hoveredPoint.visitors} khách</span>
                      <span>•</span>
                      <span className="text-amber-400 font-bold">
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

              {/* Nhãn ngày bên dưới biểu đồ: ĐẬM NÉT, RÕ RÀNG */}
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 px-2 mt-2 border-t border-slate-300 pt-1.5">
                {filteredDays.map((d) => (
                  <div key={d.date} className="text-center">
                    <div className="text-slate-950 font-bold">{formatDateShort(d.date)}</div>
                    <div className="text-[10px] font-bold font-mono text-slate-700 mt-0.5">
                      {formatDuration(
                        d.visitors > 0 ? Math.round(d.totalDurationSeconds / d.visitors) : 0
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CỘT PHẢI (5/12): PHÂN BỔ THIẾT BỊ & MÔI TRƯỜNG TRUY CẬP (ĐẬM NÉT, RÕ RÀNG) */}
            <div className="lg:col-span-5 p-4 rounded-xl border border-slate-300 bg-white flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-950 uppercase tracking-wider text-xs flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-700" />
                  Phân bổ thiết bị &amp; Môi trường truy cập
                </span>
              </div>

              {/* 1. BẢNG THIẾT BỊ - SạCH, KHÔNG MÀU NỚN */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>1. Thiết bị</span>
                  <span className="text-slate-600 font-bold lowercase normal-case">⚡ tốc độ tải</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  {/* ĐTDĐ */}
                  <div className="p-2 rounded-lg border border-slate-200 bg-white">
                    <Smartphone className="w-4 h-4 mx-auto text-slate-600 mb-0.5" />
                    <div className="text-sm font-black text-slate-950">{aggregateMetrics.mobilePercent}%</div>
                    <div className="text-[10px] text-slate-700 font-bold">ĐTDĐ ({aggregateMetrics.deviceMap.mobile})</div>
                    <div className="text-[10px] font-bold text-emerald-700 font-mono mt-0.5">
                      ⚡ {aggregateMetrics.mobileSpeedSec}s
                    </div>
                  </div>
                  {/* Laptop */}
                  <div className="p-2 rounded-lg border border-slate-200 bg-white">
                    <Monitor className="w-4 h-4 mx-auto text-slate-600 mb-0.5" />
                    <div className="text-sm font-black text-slate-950">{aggregateMetrics.desktopPercent}%</div>
                    <div className="text-[10px] text-slate-700 font-bold">Laptop ({aggregateMetrics.deviceMap.desktop})</div>
                    <div className="text-[10px] font-bold text-emerald-700 font-mono mt-0.5">
                      ⚡ {aggregateMetrics.desktopSpeedSec}s
                    </div>
                  </div>
                  {/* Tablet */}
                  <div className="p-2 rounded-lg border border-slate-200 bg-white">
                    <Tablet className="w-4 h-4 mx-auto text-slate-600 mb-0.5" />
                    <div className="text-sm font-black text-slate-950">{aggregateMetrics.tabletPercent}%</div>
                    <div className="text-[10px] text-slate-700 font-bold">Tablet ({aggregateMetrics.deviceMap.tablet})</div>
                    <div className="text-[10px] font-bold text-emerald-700 font-mono mt-0.5">
                      ⚡ {aggregateMetrics.tabletSpeedSec}s
                    </div>
                  </div>
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex mt-1">
                  <div style={{ width: `${aggregateMetrics.mobilePercent}%` }} className="bg-slate-500 h-full" />
                  <div style={{ width: `${aggregateMetrics.desktopPercent}%` }} className="bg-slate-400 h-full" />
                  <div style={{ width: `${aggregateMetrics.tabletPercent}%` }} className="bg-slate-300 h-full" />
                </div>
              </div>

              {/* 2-3: BẢNG TRÌNH DUYỆT & HỆ ĐIỀU HÀNH */}
              <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-200">
                {/* 2. TRÌNH DUYỆT */}
                <div className="flex flex-col">
                  <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1.5 shrink-0">2. Trình duyệt</div>
                  <div className="overflow-y-auto max-h-[140px] space-y-1 text-xs">
                    {aggregateMetrics.topBrowsers.map((b) => {
                      const pct = aggregateMetrics.totalViews > 0 ? Math.round((b.count / aggregateMetrics.totalViews) * 100) : 0;
                      return (
                        <div key={b.name} className="flex items-center justify-between">
                          <span className="text-slate-800 font-semibold truncate max-w-[55%]">{b.name}</span>
                          <span className="font-bold text-slate-950 font-mono shrink-0">{b.count} <span className="text-slate-600 font-medium">({pct}%)</span></span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. HỆ ĐIỀU HÀNH */}
                <div className="flex flex-col">
                  <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1.5 shrink-0">3. Hệ điều hành</div>
                  <div className="overflow-y-auto max-h-[140px] space-y-1 text-xs">
                    {aggregateMetrics.topOS.map((o) => {
                      const pct = aggregateMetrics.totalViews > 0 ? Math.round((o.count / aggregateMetrics.totalViews) * 100) : 0;
                      return (
                        <div key={o.name} className="flex items-center justify-between">
                          <span className="text-slate-800 font-semibold truncate max-w-[55%]">{o.name}</span>
                          <span className="font-bold text-slate-950 font-mono shrink-0">{o.count} <span className="text-slate-600 font-medium">({pct}%)</span></span>
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
            {/* CỘT TRÁI: TRANG ĐƯỢC XEM NHIỀU NHẤT — SCROLLABLE */}
            <div className="rounded-xl border border-slate-300 bg-white flex flex-col" style={{maxHeight: '320px'}}>
              {/* HEADER CỐ ĐỊNH */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2.5 border-b border-slate-200 shrink-0">
                <div className="text-xs font-bold text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#2D5A27]" />
                  Trang được xem nhiều nhất
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {aggregateMetrics.topPages.length} trang
                </span>
              </div>
              {/* BODY CUỘN */}
              <div className="overflow-y-auto flex-1 px-4 py-2 space-y-2.5">
                {aggregateMetrics.topPages.map((item, idx) => {
                  const percentage =
                    aggregateMetrics.totalViews > 0
                      ? Math.round((item.count / aggregateMetrics.totalViews) * 100)
                      : 0;

                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="w-4 text-xs font-bold text-slate-600 font-mono shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-slate-950 truncate">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-slate-950 font-mono text-xs">
                            {item.count.toLocaleString('vi-VN')}
                          </span>
                          <span className="text-xs font-bold text-slate-700 w-8 text-right font-mono">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percentage}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            idx === 0 ? 'bg-[#2D5A27]' : idx === 1 ? 'bg-emerald-700' : 'bg-emerald-600'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CỘT PHẢI: NHẬT KÝ PHIÊN TRUY CẬP GẦN ĐÂY — SCROLLABLE VỚI HEADER CỐ ĐỊNH */}
            <div className="rounded-xl border border-slate-300 bg-white flex flex-col" style={{maxHeight: '320px'}}>
              {/* HEADER CỐ ĐỊNH */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2.5 border-b border-slate-200 shrink-0">
                <div className="text-xs font-bold text-slate-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-700" />
                  Nhật ký phiên gần đây
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              </div>

              {/* BẢNG CUỘN */}
              <div className="overflow-auto flex-1">
                <table className="w-full text-left text-xs min-w-[480px]">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b border-slate-300 text-slate-800 font-bold uppercase text-[11px]">
                      <th className="py-2 px-3">Thời gian</th>
                      <th className="py-2 px-3">Trang đang xem</th>
                      <th className="py-2 px-3">Thiết bị</th>
                      <th className="py-2 px-3 text-right">Thời lượng &amp; Tốc độ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {(!data?.recentSessions || data.recentSessions.length === 0) ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-700 text-xs font-semibold">
                          Chưa có phiên truy cập nào gần đây.
                        </td>
                      </tr>
                    ) : (
                      data.recentSessions.map((sess, idx) => {
                        const friendly = getPageFriendlyName(sess.path);
                        return (
                          <tr key={sess.id || idx} className="hover:bg-slate-50 transition">
                            <td className="py-2 px-3 text-slate-700 text-xs font-semibold whitespace-nowrap">
                              {formatRelativeTime(sess.time)}
                            </td>
                            <td className="py-2 px-3">
                              <div className="font-bold text-slate-950 text-xs">{friendly}</div>
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700">
                                {sess.device === 'mobile' ? (
                                  <Smartphone className="w-3 h-3 text-slate-500" />
                                ) : sess.device === 'tablet' ? (
                                  <Tablet className="w-3 h-3 text-slate-500" />
                                ) : (
                                  <Monitor className="w-3 h-3 text-slate-500" />
                                )}
                                {sess.device === 'mobile' ? 'ĐTDĐ' : sess.device === 'tablet' ? 'Tablet' : 'Laptop'}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                {sess.loadSpeedMs && (
                                  <span className="font-bold text-emerald-700 font-mono text-xs">
                                    ⚡ {(sess.loadSpeedMs / 1000).toFixed(1)}s
                                  </span>
                                )}
                                <span className="font-bold text-slate-700 font-mono text-xs">
                                  {formatDuration(sess.durationSeconds || 15)}
                                </span>
                              </div>
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
      )}
    </div>
  );
}
