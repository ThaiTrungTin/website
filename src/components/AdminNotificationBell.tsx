'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Bell,
  CalendarDays,
  Briefcase,
  Star,
  Check,
  CheckCheck,
  X,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { LichHenRecord, DanhGiaRecord, HoSoTuyenDungRecord } from '@/lib/supabase';

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

export interface NotificationItem {
  id: string;
  itemId: string;
  type: 'appointment' | 'application' | 'review';
  title: string;
  description: string;
  timestamp: string;
  targetTab: AdminTab;
  isRead: boolean;
  meta?: string;
}

interface AdminNotificationBellProps {
  appointments: LichHenRecord[];
  applications: HoSoTuyenDungRecord[];
  reviews: DanhGiaRecord[];
  onNavigateTab: (tab: AdminTab, itemId?: string) => void;
}

/**
 * Định dạng thời gian theo đúng yêu cầu:
 * - Trong ngày: báo giờ (ví dụ: "09:30" hoặc "14:15")
 * - Qua ngày: báo "Hôm qua, 15:20"
 * - 2-6 ngày: "2 ngày trước", "3 ngày trước"...
 * - Lâu hơn: Ngày/tháng/năm
 */
export function formatFbStyleTime(isoStr?: string | null): string {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '—';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMin / 60);

  const isSameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  const pad = (n: number) => String(n).padStart(2, '0');
  const timeFormatted = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  if (diffMin < 2) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;

  if (isSameDay) {
    return `${timeFormatted} hôm nay`;
  }

  if (isYesterday) {
    return `Hôm qua lúc ${timeFormatted}`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays <= 6) {
    return `${diffDays} ngày trước`;
  }

  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

const STORAGE_KEY = 'petmm_read_notification_ids';

export default function AdminNotificationBell({
  appointments,
  applications,
  reviews,
  onNavigateTab,
}: AdminNotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [filterMode, setFilterMode] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tải danh sách ID đã đọc từ localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setReadIds(new Set(parsed));
        }
      }
    } catch (e) {
      console.error('Error reading notifications localStorage:', e);
    }
  }, []);

  // Lưu danh sách ID đã đọc
  const saveReadIds = (newSet: Set<string>) => {
    setReadIds(newSet);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newSet)));
    } catch (e) {
      console.error('Error saving notifications localStorage:', e);
    }
  };

  // Đóng dropdown khi bấm ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Tổng hợp thông báo từ 3 nguồn: Lịch hẹn, Tuyển dụng, Đánh giá
  const allNotifications = useMemo<NotificationItem[]>(() => {
    const list: NotificationItem[] = [];

    // 1. Lịch hẹn đặt khám
    appointments.forEach((app) => {
      const id = `app_${app.id}`;
      list.push({
        id,
        itemId: app.id,
        type: 'appointment',
        title: `${app.ho_ten_chu} đặt lịch khám`,
        description: `${app.dich_vu} · ${app.ten_chi_nhanh || 'Cơ sở chính'} (${app.ten_thu_cung || 'Thú cưng'})`,
        timestamp: app.ngay_tao || `${app.ngay_hen}T${app.gio_hen || '08:00'}:00Z`,
        targetTab: 'appointments',
        isRead: readIds.has(id),
        meta: app.so_dien_thoai,
      });
    });

    // 2. Hồ sơ ứng viên tuyển dụng
    applications.forEach((job) => {
      const id = `job_${job.id}`;
      list.push({
        id,
        itemId: job.id,
        type: 'application',
        title: `${job.ho_ten} nộp hồ sơ ứng tuyển`,
        description: `Vị trí: ${job.tieu_de_vi_tri || 'Ứng viên'} · SĐT: ${job.so_dien_thoai}`,
        timestamp: job.ngay_tao || new Date().toISOString(),
        targetTab: 'dashboard',
        isRead: readIds.has(id),
        meta: job.ten_file_cv || 'CV đính kèm',
      });
    });

    // 3. Đánh giá từ khách hàng
    reviews.forEach((rev) => {
      const id = `rev_${rev.id}`;
      list.push({
        id,
        itemId: rev.id,
        type: 'review',
        title: `${rev.ten_khach_hang || 'Khách hàng'} gửi đánh giá ${rev.so_sao || 5}★`,
        description: rev.noi_dung ? `"${rev.noi_dung}"` : `Chấm điểm dịch vụ ${rev.dich_vu_su_dung || ''}`,
        timestamp: rev.ngay_tao || rev.ngay_danh_gia || new Date().toISOString(),
        targetTab: 'reviews',
        isRead: readIds.has(id),
        meta: `${rev.so_sao || 5} sao`,
      });
    });

    // Sắp xếp thời gian giảm dần (mới nhất lên đầu)
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return list;
  }, [appointments, applications, reviews, readIds]);

  // Đếm số thông báo chưa đọc
  const unreadCount = useMemo(() => {
    return allNotifications.filter((n) => !n.isRead).length;
  }, [allNotifications]);

  // Danh sách hiển thị theo filter
  const displayedNotifications = useMemo(() => {
    if (filterMode === 'unread') {
      return allNotifications.filter((n) => !n.isRead);
    }
    return allNotifications;
  }, [allNotifications, filterMode]);

  // Đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = () => {
    const newSet = new Set(readIds);
    allNotifications.forEach((n) => newSet.add(n.id));
    saveReadIds(newSet);
  };

  // Đánh dấu 1 thông báo đã đọc & chuyển tab kèm itemId
  const handleNotificationClick = (item: NotificationItem) => {
    const newSet = new Set(readIds);
    newSet.add(item.id);
    saveReadIds(newSet);
    setIsOpen(false);
    onNavigateTab(item.targetTab, item.itemId);
  };

  // Nút tick đánh dấu riêng từng thông báo
  const handleToggleRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSet = new Set(readIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    saveReadIds(newSet);
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'appointment':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#2D5A27] flex items-center justify-center shrink-0">
            <CalendarDays className="w-4 h-4" />
          </div>
        );
      case 'application':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
        );
      case 'review':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── NÚT CHUÔNG THÔNG BÁO ── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer border border-slate-200"
        title="Thông báo hệ thống"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] h-[18px] rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── PANEL DROPDOWN PHONG CÁCH FACEBOOK ── */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[360px] sm:w-[420px] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header Panel */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Thông báo</h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-semibold text-[#2D5A27] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Đánh dấu tất cả đã đọc</span>
                </button>
              )}
            </div>

            {/* Bộ lọc: Tất cả / Chưa đọc */}
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Tất cả ({allNotifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('unread')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                  filterMode === 'unread'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                Chưa đọc ({unreadCount})
              </button>
            </div>
          </div>

          {/* Danh sách thông báo */}
          <div className="max-h-[460px] overflow-y-auto divide-y divide-slate-100">
            {displayedNotifications.length === 0 ? (
              <div className="py-12 text-center text-xs font-medium text-slate-500">
                {filterMode === 'unread'
                  ? 'Bạn đã đọc hết tất cả thông báo!'
                  : 'Hiện chưa có thông báo nào trong hệ thống.'}
              </div>
            ) : (
              displayedNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 flex items-start gap-3 transition cursor-pointer group ${
                    item.isRead
                      ? 'bg-white hover:bg-slate-50'
                      : 'bg-blue-50/40 hover:bg-blue-50/70 border-l-4 border-l-blue-600'
                  }`}
                >
                  {getIcon(item.type)}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs leading-snug truncate ${
                        item.isRead ? 'font-medium text-slate-800' : 'font-bold text-slate-950'
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-[11px] font-medium text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">
                        {formatFbStyleTime(item.timestamp)}
                      </span>
                      {item.meta && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.meta}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Nút tick đã đọc / chưa đọc */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleRead(e, item.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0 opacity-0 group-hover:opacity-100 transition"
                    title={item.isRead ? 'Đánh dấu là chưa đọc' : 'Đánh dấu đã đọc'}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
