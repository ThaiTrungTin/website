'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Bell,
  CalendarDays,
  Briefcase,
  Star,
  Check,
  CheckCheck,
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
  statusBadge?: {
    label: string;
    color: string;
  };
  meta?: string;
}

interface AdminNotificationBellProps {
  appointments: LichHenRecord[];
  applications: HoSoTuyenDungRecord[];
  reviews: DanhGiaRecord[];
  currentUser?: {
    id?: string;
    username?: string;
    ho_ten?: string;
    email?: string;
    vai_tro?: string;
  } | null;
  onNavigateTab: (tab: AdminTab, itemId?: string) => void;
}

/**
 * Định dạng thời gian theo phong cách mạng xã hội:
 * - Trong ngày: giờ phút (ví dụ "09:30" hoặc "14:15")
 * - Qua ngày: "Hôm qua lúc 15:20"
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

const BASE_STORAGE_KEY = 'petmm_read_notification_ids';

export default function AdminNotificationBell({
  appointments,
  applications,
  reviews,
  currentUser,
  onNavigateTab,
}: AdminNotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [filterMode, setFilterMode] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Khóa lưu trữ theo từng tài khoản (nếu đổi tài khoản hoặc chuyển trình duyệt)
  const userStorageKey = useMemo(() => {
    const acc = currentUser?.username || currentUser?.email || currentUser?.id || 'shared';
    return `${BASE_STORAGE_KEY}_${acc}`;
  }, [currentUser]);

  // Tải danh sách ID đã đọc theo tài khoản hiện tại
  useEffect(() => {
    try {
      const stored = localStorage.getItem(userStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setReadIds(new Set(parsed));
          return;
        }
      }
      // Fallback về key chung cũ nếu tài khoản chưa có dữ liệu riêng
      const fallback = localStorage.getItem(BASE_STORAGE_KEY);
      if (fallback) {
        const parsed = JSON.parse(fallback);
        if (Array.isArray(parsed)) {
          setReadIds(new Set(parsed));
          return;
        }
      }
      setReadIds(new Set());
    } catch (e) {
      console.error('Error reading notifications localStorage:', e);
      setReadIds(new Set());
    }
  }, [userStorageKey]);

  // Lưu danh sách ID đã đọc theo tài khoản
  const saveReadIds = (newSet: Set<string>) => {
    setReadIds(newSet);
    try {
      localStorage.setItem(userStorageKey, JSON.stringify(Array.from(newSet)));
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

    // 1. LỊCH HẸN ĐẶT KHÁM
    // QUY TẮC ĐỒNG BỘ ĐÃ XỬ LÝ TOÀN HỆ THỐNG:
    // - Nếu app.trang_thai !== 'cho_xac_nhan' (nghĩa là đã xác nhận, đã khám/hoàn thành, hoặc đã hủy):
    //   -> Lịch hẹn này ĐÃ ĐƯỢC XỬ LÝ trong CSDL!
    //   -> Trên MỌI TRÌNH DUYỆT và MỌI TÀI KHOẢN, mục này TỰ ĐỘNG ĐƯỢC COI LÀ ĐÃ XỬ LÝ (isRead = true).
    //   -> Tuyệt đối không tính vào số badge chưa đọc nữa!
    appointments.forEach((app) => {
      const id = `app_${app.id}`;
      const cleanPet = (app.ten_thu_cung || '').trim();
      const hasRealPet = Boolean(
        cleanPet &&
        !['pet', 'bé cưng', 'be cung', 'beloved pet'].includes(cleanPet.toLowerCase())
      );
      const petInfo = hasRealPet ? ` (Bé ${cleanPet})` : '';

      // Kiểm tra trạng thái xử lý thực tế trong CSDL
      const isHandledInDatabase = app.trang_thai !== 'cho_xac_nhan';
      const isMarkedReadByAccount = readIds.has(id);
      const isRead = isHandledInDatabase || isMarkedReadByAccount;

      let statusBadge = {
        label: 'Chờ xác nhận',
        color: 'bg-amber-100 text-amber-800 border-amber-200',
      };
      if (app.trang_thai === 'da_xac_nhan') {
        statusBadge = {
          label: 'Đã xác nhận',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      } else if (app.trang_thai === 'da_kham') {
        statusBadge = {
          label: 'Đã hoàn thành',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      } else if (app.trang_thai === 'da_huy') {
        statusBadge = {
          label: 'Đã hủy',
          color: 'bg-slate-100 text-slate-600 border-slate-200',
        };
      }

      list.push({
        id,
        itemId: app.id,
        type: 'appointment',
        title: `${app.ho_ten_chu} đặt lịch khám`,
        description: `${app.dich_vu} · ${app.ten_chi_nhanh || 'Cơ sở chính'}${petInfo}`,
        timestamp: app.ngay_tao || `${app.ngay_hen}T${app.gio_hen || '08:00'}:00Z`,
        targetTab: 'appointments',
        isRead,
        statusBadge,
        meta: app.so_dien_thoai,
      });
    });

    // 2. HỒ SƠ ỨNG VIÊN TUYỂN DỤNG
    applications.forEach((job) => {
      const id = `job_${job.id}`;
      // Đã xử lý nếu: Đã hẹn PV, Đã liên hệ, Từ chối / Bỏ qua, Đã trúng tuyển, Đã xem
      const isHandled = Boolean(
        job.trang_thai &&
        ['hen_phong_van', 'da_lien_he', 'bo_qua', 'tu_choi', 'da_tuyen'].includes(job.trang_thai)
      );
      const isRead = isHandled || readIds.has(id);

      let statusBadge = {
        label: 'Mới nộp',
        color: 'bg-amber-100 text-amber-800 border-amber-200',
      };
      if (job.trang_thai === 'hen_phong_van') {
        statusBadge = {
          label: 'Đã hẹn PV',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      } else if (job.trang_thai === 'da_lien_he') {
        statusBadge = {
          label: 'Đã liên hệ',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      } else if (job.trang_thai === 'bo_qua' || job.trang_thai === 'tu_choi') {
        statusBadge = {
          label: 'Từ chối',
          color: 'bg-slate-100 text-slate-600 border-slate-200',
        };
      } else if (job.trang_thai === 'da_tuyen') {
        statusBadge = {
          label: 'Đã trúng tuyển',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      }

      list.push({
        id,
        itemId: job.id,
        type: 'application',
        title: `${job.ho_ten} nộp hồ sơ ứng tuyển`,
        description: `Vị trí: ${job.tieu_de_vi_tri || 'Ứng viên'} · SĐT: ${job.so_dien_thoai}`,
        timestamp: job.ngay_tao || new Date().toISOString(),
        targetTab: 'team',
        isRead,
        statusBadge,
        meta: job.ten_file_cv || 'CV đính kèm',
      });
    });

    // 3. ĐÁNH GIÁ TỪ KHÁCH HÀNG
    // Những đánh giá đã kích hoạt/xác thực lâu ngày không tính là chưa đọc
    const nowMs = Date.now();
    reviews.forEach((rev) => {
      const id = `rev_${rev.id}`;
      const revTime = rev.ngay_tao || rev.ngay_danh_gia || '';
      const revTimeMs = revTime ? new Date(revTime).getTime() : 0;
      const isOlderThan3Days = revTimeMs ? nowMs - revTimeMs > 3 * 24 * 60 * 60 * 1000 : true;

      // Nếu đã kích hoạt hiển thị và quá 3 ngày -> Tự động coi là đã xử lý
      const isHandled = rev.kich_hoat !== false && isOlderThan3Days;
      const isRead = isHandled || readIds.has(id);

      list.push({
        id,
        itemId: rev.id,
        type: 'review',
        title: `${rev.ten_khach_hang || 'Khách hàng'} gửi đánh giá ${rev.so_sao || 5}★`,
        description: rev.noi_dung ? `"${rev.noi_dung}"` : `Chấm điểm dịch vụ ${rev.dich_vu_su_dung || ''}`,
        timestamp: rev.ngay_tao || rev.ngay_danh_gia || new Date().toISOString(),
        targetTab: 'reviews',
        isRead,
        meta: `${rev.so_sao || 5} sao`,
      });
    });

    // Sắp xếp thời gian giảm dần (mới nhất lên đầu)
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return list;
  }, [appointments, applications, reviews, readIds]);

  // Đếm số thông báo CHƯA ĐỌC / CHƯA XỬ LÝ THỰC TẾ
  const unreadCount = useMemo(() => {
    return allNotifications.filter((n) => !n.isRead).length;
  }, [allNotifications]);

  // Danh sách hiển thị theo filter (Tất cả / Chưa đọc)
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

      {/* ── PANEL DROPDOWN THÔNG BÁO ── */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[360px] sm:w-[420px] max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header Panel */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Thông báo</h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                    {unreadCount} cần xử lý
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
                Chưa xử lý ({unreadCount})
              </button>
            </div>
          </div>

          {/* Danh sách thông báo */}
          <div className="max-h-[460px] overflow-y-auto divide-y divide-slate-100">
            {displayedNotifications.length === 0 ? (
              <div className="py-12 text-center text-xs font-medium text-slate-500">
                {filterMode === 'unread'
                  ? 'Tuyệt vời! Không còn lịch hẹn hoặc việc nào đang chờ xử lý.'
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
                    <div className="flex items-center justify-between gap-1.5">
                      <p
                        className={`text-xs leading-snug truncate ${
                          item.isRead ? 'font-medium text-slate-800' : 'font-bold text-slate-950'
                        }`}
                      >
                        {item.title}
                      </p>
                      {item.statusBadge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${item.statusBadge.color}`}
                        >
                          {item.statusBadge.label}
                        </span>
                      )}
                    </div>
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
                    title={item.isRead ? 'Đánh dấu là chưa xử lý' : 'Đánh dấu đã xử lý / đã đọc'}
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
