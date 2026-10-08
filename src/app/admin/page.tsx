'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Upload,
  Plus,
  Trash2,
  Crop,
  Edit3,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Move,
  Layers,
  AlertCircle,
  ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  X,
  MapPin,
  PhoneCall,
  Settings,
  Clock,
  ExternalLink,
  FileText,
  Search,
  Menu,
  ChevronRight,
  Sparkles,
  Globe,
  Save,
  ShieldCheck,
  Send,
  KeyRound,
  Mail,
  Eye,
  EyeOff,
  Building2,
  SlidersHorizontal,
  Stethoscope,
  Scissors,
  Flame,
  HelpCircle,
  Tag,
  Heart,
  MessageSquareHeart,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  UserCheck,
  CheckCheck,
  Star,
  BarChart3,
  BookOpen,
  LogOut,
  Briefcase,
  Megaphone,
  GripVertical,
  ChevronDown,
  Calendar,
  Bell,
  Smile,
  Users,
  UserPlus,
  ShieldAlert,
  Lock,
  Unlock,
  Shield,
  Activity,
  MonitorX,
} from 'lucide-react';
import { usePresenceHeartbeat } from '@/lib/usePresenceHeartbeat';
import { supabase, HeroBannerItem, ChiNhanhRecord, CauHinhRecord, DichVuRecord, CauHoiThuongGapRecord, LichHenRecord, DanhGiaRecord, DoiNguRecord, BaiVietRecord, SupportPanelConfig, DEFAULT_SUPPORT_CONFIG, HoSoTuyenDungRecord, TuyenDungRecord } from '@/lib/supabase';
import { mutateAdminContent } from '@/lib/adminContentClient';
import { useSystemConfig } from '@/context/SystemConfigContext';
import AdminImageInput from '@/components/AdminImageInput';
import AdminInteractiveCropper from '@/components/AdminInteractiveCropper';
import AdminEmojiPicker from '@/components/AdminEmojiPicker';
import { VietnamFlag, UKFlag } from '@/components/FlagIcons';
import AdminLoginPage from '@/components/AdminLoginPage';
import PetLogo from '@/components/PetLogo';
import AdminCareersManager from '@/components/AdminCareersManager';
import AdminPrivacyPolicyManager from '@/components/AdminPrivacyPolicyManager';
import { PopupAnnouncementConfig, DEFAULT_ANNOUNCEMENT } from '@/app/api/announcement/route';
import { SloganTickerItem, parseSloganList, isSloganActive, renderWithShakingIcons } from '@/lib/slogans';
import { sanitizeHtml } from '@/lib/sanitize';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });
import AdminResizableModal from '@/components/AdminResizableModal';
import SectionTitleModal from '@/components/admin/SectionTitleModal';
import AdminDashboardTab from '@/components/AdminDashboardTab';
import AdminNotificationBell from '@/components/AdminNotificationBell';
import AdminFloatingNotification, {
  FloatingAppointmentNotification,
  sendBrowserNotification,
  requestBrowserNotificationPermission,
  playNotificationSound,
} from '@/components/AdminFloatingNotification';
import AdminNotificationSettingsModal, {
  AdminNotifSettings,
  getLocalAdminNotifSettings,
  DEFAULT_ADMIN_NOTIF_SETTINGS,
} from '@/components/AdminNotificationSettingsModal';
import AdminNotificationFailureToast, {
  NotificationFailureItem,
} from '@/components/AdminNotificationFailureToast';
import AdminNotificationLogsManager from '@/components/AdminNotificationLogsManager';

// ── BẢNG ICON RUNG PHONG CÁCH ZALO ──
export interface VibratingEmojiItem {
  icon: string;
  label: string;
  category: 'promo' | 'medical' | 'schedule' | 'pets';
}

export const ZALO_VIBRATING_EMOJIS: VibratingEmojiItem[] = [
  // Khuyến mãi & Quà tặng
  { icon: '🎁', label: 'Quà tặng', category: 'promo' },
  { icon: '🧧', label: 'Lì xì', category: 'promo' },
  { icon: '🏷️', label: 'Khuyến mãi', category: 'promo' },
  { icon: '🛍️', label: 'Mua sắm', category: 'promo' },
  { icon: '⭐', label: 'Ngôi sao', category: 'promo' },
  { icon: '🔥', label: 'Hot', category: 'promo' },
  { icon: '⚡', label: 'Chớp nhoáng', category: 'promo' },
  { icon: '💯', label: '100 điểm', category: 'promo' },
  { icon: '🎉', label: 'Pháo hoa', category: 'promo' },
  { icon: '✨', label: 'Lấp lánh', category: 'promo' },
  { icon: '🎯', label: 'Mục tiêu', category: 'promo' },
  { icon: '🏆', label: 'Cúp vàng', category: 'promo' },
  { icon: '👑', label: 'Vương miện', category: 'promo' },
  { icon: '💥', label: 'Bùng nổ', category: 'promo' },

  // Y tế & Phòng khám
  { icon: '🏥', label: 'Bệnh viện', category: 'medical' },
  { icon: '💉', label: 'Tiêm vaccine', category: 'medical' },
  { icon: '🩺', label: 'Ống nghe', category: 'medical' },
  { icon: '💊', label: 'Thuốc', category: 'medical' },
  { icon: '🚑', label: 'Cấp cứu', category: 'medical' },
  { icon: '🩹', label: 'Băng dán', category: 'medical' },
  { icon: '🔬', label: 'Kính hiển vi', category: 'medical' },
  { icon: '🧬', label: 'ADN', category: 'medical' },
  { icon: '🩻', label: 'X-Quang', category: 'medical' },
  { icon: '🩸', label: 'Xét nghiệm', category: 'medical' },

  // Lịch hẹn & Thông báo
  { icon: '📅', label: 'Lịch hẹn', category: 'schedule' },
  { icon: '🔔', label: 'Chuông báo', category: 'schedule' },
  { icon: '⏰', label: 'Đồng hồ', category: 'schedule' },
  { icon: '📢', label: 'Loa thông báo', category: 'schedule' },
  { icon: '🚨', label: 'Báo động', category: 'schedule' },
  { icon: '📌', label: 'Ghim', category: 'schedule' },
  { icon: '💡', label: 'Ý tưởng', category: 'schedule' },
  { icon: '💬', label: 'Tư vấn', category: 'schedule' },
  { icon: '📣', label: 'Cổ vũ', category: 'schedule' },
  { icon: '🛎️', label: 'Lễ tân', category: 'schedule' },

  // Thú cưng & Tình cảm
  { icon: '🐶', label: 'Cún cưng', category: 'pets' },
  { icon: '🐱', label: 'Mèo cưng', category: 'pets' },
  { icon: '🐾', label: 'Dấu chân', category: 'pets' },
  { icon: '🐰', label: 'Thỏ', category: 'pets' },
  { icon: '🐹', label: 'Hamster', category: 'pets' },
  { icon: '🦜', label: 'Vẹt', category: 'pets' },
  { icon: '🐟', label: 'Cá cảnh', category: 'pets' },
  { icon: '❤️', label: 'Trái tim', category: 'pets' },
  { icon: '💖', label: 'Yêu thương', category: 'pets' },
  { icon: '🌟', label: 'Sao sáng', category: 'pets' },
];

export function formatTextToShakingHtml(text: string): string {
  if (!text) return '';
  const emojiRegex = /(\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\u2600-\u27BF])/gu;
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped.replace(
    emojiRegex,
    (m) => `<span class="petmm-icon-shake inline-block select-none" contenteditable="false">${m}</span>`
  );
}

// Component ô nhập thông điệp có icon tự rung trực tiếp trong văn bản
function SloganInlineEditor({
  itemId,
  value,
  onChange,
  placeholder,
  onRegisterRef,
}: {
  itemId: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onRegisterRef: (id: string, el: HTMLDivElement | null) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      const currentText = ref.current.innerText.replace(/\r?\n$/, '');
      if (currentText !== (value || '')) {
        ref.current.innerHTML = formatTextToShakingHtml(value || '');
      }
    }
  }, [value]);

  return (
    <div
      ref={(el) => {
        ref.current = el;
        onRegisterRef(itemId, el);
      }}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder || 'Nhập thông điệp...'}
      onInput={(e) => {
        const text = e.currentTarget.innerText.replace(/\r?\n$/, '');
        if (!text) {
          e.currentTarget.innerHTML = '';
        }
        onChange(text);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      }}
      onPaste={(e) => {
        e.preventDefault();
        const pasteText = e.clipboardData.getData('text/plain');
        const formatted = formatTextToShakingHtml(pasteText);
        if (document.queryCommandSupported('insertHTML')) {
          document.execCommand('insertHTML', false, formatted);
        } else {
          document.execCommand('insertText', false, pasteText);
        }
        if (ref.current) {
          onChange(ref.current.innerText.replace(/\r?\n$/, ''));
        }
      }}
      onBlur={(e) => {
        const text = e.currentTarget.innerText.replace(/\r?\n$/, '');
        e.currentTarget.innerHTML = formatTextToShakingHtml(text);
      }}
      className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#2D5A27] focus:outline-none bg-white min-h-[38px] leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none transition cursor-text"
    />
  );
}

type AdminTab = 'dashboard' | 'banners' | 'branches' | 'services' | 'appointments' | 'faqs' | 'reviews' | 'team' | 'articles' | 'config' | 'staff';
export type ConfigSubTab = 'contact' | 'email' | 'zalo' | 'spam' | 'notification-logs' | 'about' | 'slides' | 'stats' | 'slogans' | 'announcement' | 'privacy';

// ── LOGOUT CONFIRMATION MODAL ──────────────────────────────────────────────
function LogoutConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-[fadeInScale_0.2s_ease]"
        style={{ animation: 'fadeInScale 0.18s cubic-bezier(.4,0,.2,1)' }}>
        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 text-center border-b border-red-100">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
            <LogOut className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Xác nhận đăng xuất</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Bạn có chắc chắn muốn đăng xuất khỏi<br />
            <strong className="text-slate-700">Cổng Quản Trị PetM&amp;M</strong>?
          </p>
        </div>
        <div className="p-4 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}

// ── STAFF MANAGEMENT TAB ───────────────────────────────────────────────────
interface StaffUser {
  id: string;
  email: string;
  ho_ten: string;
  vai_tro: 'admin' | 'user';
  trang_thai: 'active' | 'locked';
  created_at: string;
  last_sign_in_at?: string;
  last_login_at?: string | null;
  last_logout_at?: string | null;
  last_active_at?: string | null;
  tab_status?: 'active' | 'away' | 'offline';
  is_current_user?: boolean;
}

function formatDateTimeFull(isoStr?: string | null) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  return `${hours}:${minutes}:${seconds} - ${day}/${month}/${year}`;
}

function getPresenceInfo(user: StaffUser) {
  if (user.trang_thai === 'locked') {
    return {
      dotColor: 'bg-red-500 ring-2 ring-white',
      title: 'Tài khoản đã bị khóa',
    };
  }

  // Nếu người dùng đã đăng xuất hoặc đóng tab/trình duyệt
  if (user.tab_status === 'offline') {
    return {
      dotColor: 'bg-slate-300 ring-2 ring-white',
      title: 'Ngoại tuyến (Offline)',
    };
  }

  const now = Date.now();
  const lastActive = user.last_active_at ? new Date(user.last_active_at).getTime() : 0;
  const diffSec = lastActive ? Math.floor((now - lastActive) / 1000) : 9999999;

  // 1. Chấm xanh: Đang trực tuyến và tab đang active (nhận tín hiệu trong vòng 30s)
  if (user.tab_status === 'active' && diffSec <= 30) {
    return {
      dotColor: 'bg-emerald-500 ring-2 ring-white animate-pulse',
      title: 'Đang hoạt động (Trực tuyến)',
    };
  }

  // 2. Chấm vàng: Đang mở nhưng chuyển sang tab khác (vắng mặt trong vòng tối đa 35s)
  if (user.tab_status === 'away' && diffSec <= 35) {
    return {
      dotColor: 'bg-amber-400 ring-2 ring-white',
      title: 'Đang vắng mặt (Chuyển tab khác)',
    };
  }

  // 3. Chấm xám: Quá 35s không nhận được tín hiệu (đã tắt tab/trình duyệt)
  return {
    dotColor: 'bg-slate-300 ring-2 ring-white',
    title: 'Ngoại tuyến (Offline)',
  };
}

function getActivityStatus(user: StaffUser): { text: string; className: string } {
  if (user.trang_thai === 'locked') {
    return { text: 'Tài khoản đã bị khóa', className: 'text-red-500 font-medium' };
  }

  const now = Date.now();
  const lastActive = user.last_active_at ? new Date(user.last_active_at).getTime() : 0;
  const diffSec = lastActive ? Math.floor((now - lastActive) / 1000) : 9999999;

  // 1. Đang hoạt động (chỉ khi tab đang active và vừa gửi heartbeat trong 30s)
  if (user.tab_status === 'active' && diffSec <= 30) {
    return { text: 'Đang hoạt động', className: 'text-emerald-600 font-bold flex items-center gap-1.5' };
  }

  // 2. Vắng mặt (khi chuyển tab khác, chỉ giữ tối đa 35s nếu tab vẫn mở ở chế độ nền)
  if (user.tab_status === 'away' && diffSec <= 35) {
    return { text: 'Vắng mặt', className: 'text-amber-600 font-semibold flex items-center gap-1.5' };
  }

  // 3. Ngoại tuyến / Tắt tab / Quá 35s: Hoạt động X phút trước / X giờ trước / quá 1 ngày thì hiển thị ngày giờ đầy đủ
  const validTimes = [user.last_active_at, user.last_logout_at, user.last_login_at, user.last_sign_in_at]
    .filter(Boolean)
    .map((t) => new Date(t as string).getTime())
    .filter((t) => !isNaN(t));

  if (validTimes.length === 0) {
    return { text: '—', className: 'text-slate-400' };
  }

  const newestTimestamp = Math.max(...validTimes);
  const diffFromNewest = Math.max(0, Math.floor((now - newestTimestamp) / 1000));

  // Quá 1 ngày (>= 86400 giây): hiển thị đầy đủ ngày giờ dạng 21:25:49 - 04/10/2026
  if (diffFromNewest >= 86400) {
    return {
      text: formatDateTimeFull(new Date(newestTimestamp).toISOString()),
      className: 'text-slate-600 font-mono text-[11px]',
    };
  }

  // Dưới 1 ngày:
  if (diffFromNewest < 60) {
    return { text: 'Hoạt động 1 phút trước', className: 'text-slate-500' };
  }

  const minutes = Math.floor(diffFromNewest / 60);
  if (minutes < 60) {
    return { text: `Hoạt động ${minutes} phút trước`, className: 'text-slate-500' };
  }

  const hours = Math.floor(minutes / 60);
  return { text: `Hoạt động ${hours} giờ trước`, className: 'text-slate-500' };
}

function StaffManagementTab({
  currentUser,
  showNotification,
}: {
  currentUser: { username: string; ho_ten: string; vai_tro: string } | null;
  showNotification: (type: 'success' | 'error', message: string) => void;
}) {
  const [users, setUsers] = React.useState<StaffUser[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Modals nổi
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = React.useState<string | null>(null);
  const [roleUpdatingId, setRoleUpdatingId] = React.useState<string | null>(null);

  // Form thêm nhân sự
  const [addForm, setAddForm] = React.useState<{ ho_ten: string; email: string; vai_tro: 'admin' | 'user' }>({
    ho_ten: '',
    email: '',
    vai_tro: 'user',
  });
  const [adding, setAdding] = React.useState(false);

  // Form đổi mật khẩu cá nhân
  const [pwForm, setPwForm] = React.useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = React.useState({ current: false, new: false, confirm: false });
  const [changingPw, setChangingPw] = React.useState(false);

  // Xóa tài khoản
  const [deleteTarget, setDeleteTarget] = React.useState<StaffUser | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const loadUsers = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch {
      showNotification('error', 'Không thể tải danh sách nhân sự!');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  React.useEffect(() => {
    loadUsers();
    // Cập nhật liên tục trạng thái mỗi 3 giây
    const interval = setInterval(() => {
      loadUsers();
    }, 3000);
    return () => clearInterval(interval);
  }, [loadUsers]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.ho_ten.trim()) { showNotification('error', 'Vui lòng nhập họ và tên!'); return; }
    if (!addForm.email.trim()) { showNotification('error', 'Vui lòng nhập email thật!'); return; }
    const targetEmail = addForm.email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase().trim() === targetEmail)) {
      showNotification('error', `Email "${targetEmail}" đã tồn tại trong hệ thống! Vui lòng dùng email khác.`);
      return;
    }
    setAdding(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', data.message);
        setAddForm({ ho_ten: '', email: '', vai_tro: 'user' });
        setShowAddModal(false);
        loadUsers();
      } else {
        showNotification('error', data.message || 'Thêm nhân sự thất bại!');
      }
    } catch {
      showNotification('error', 'Lỗi kết nối máy chủ!');
    } finally {
      setAdding(false);
    }
  };

  const handleRoleChange = async (targetUser: StaffUser, newRole: 'admin' | 'user') => {
    if (targetUser.vai_tro === newRole) return;
    setRoleUpdatingId(targetUser.id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetUser.id, vai_tro: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(
          'success',
          `Đã chuyển vai trò của ${targetUser.ho_ten} thành: ${newRole === 'admin' ? 'Quản trị viên (Admin - Full quyền)' : 'Nhân viên (User - Chỉ tạo đánh giá)'}`
        );
        loadUsers();
      } else {
        showNotification('error', data.message || 'Cập nhật phân quyền thất bại!');
      }
    } catch {
      showNotification('error', 'Lỗi kết nối máy chủ!');
    } finally {
      setRoleUpdatingId(null);
    }
  };

  // Ấn 1 icon: nếu đang hoạt động -> ấn cái thành khóa; nếu đang khóa -> ấn cái thành hoạt động
  const handleDirectToggleLock = async (targetUser: StaffUser) => {
    if (targetUser.is_current_user) return;
    const newStatus = targetUser.trang_thai === 'locked' ? 'active' : 'locked';
    setStatusUpdatingId(targetUser.id);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetUser.id, trang_thai: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(
          'success',
          newStatus === 'locked'
            ? `Đã khóa tài khoản ${targetUser.ho_ten}!`
            : `Đã kích hoạt hoạt động tài khoản ${targetUser.ho_ten}!`
        );
        loadUsers();
      } else {
        showNotification('error', data.message || 'Thao tác thất bại!');
      }
    } catch {
      showNotification('error', 'Lỗi kết nối máy chủ!');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?id=${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification('success', data.message);
        setDeleteTarget(null);
        loadUsers();
      } else {
        showNotification('error', data.message || 'Xóa thất bại!');
      }
    } catch {
      showNotification('error', 'Lỗi kết nối server!');
    } finally {
      setDeleting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwForm.currentPassword) { showNotification('error', 'Vui lòng nhập mật khẩu hiện tại!'); return; }
    if (pwForm.newPassword.length < 6) { showNotification('error', 'Mật khẩu mới phải có ít nhất 6 ký tự!'); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { showNotification('error', 'Xác nhận mật khẩu không khớp!'); return; }
    setChangingPw(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification('success', 'Đổi mật khẩu thành công!');
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordModal(false);
      } else {
        showNotification('error', data.message || 'Đổi mật khẩu thất bại!');
      }
    } catch {
      showNotification('error', 'Lỗi kết nối máy chủ!');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Quản Lý Nhân Sự */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#2D5A27]" />
            <span>Quản Lý Nhân Sự &amp; Phân Quyền Hệ Thống</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi trạng thái hoạt động trực tuyến, phân quyền Admin/User và quản lý tài khoản nhân viên.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Nhân Sự</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Lock className="w-4 h-4 text-slate-500" />
            <span>Đổi Mật Khẩu</span>
          </button>
        </div>
      </div>

      {/* BẢNG DANH SÁCH NHÂN SỰ CHÍNH */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-700">Tổng cộng {users.length} tài khoản</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Cập nhật liên tục
            </span>
          </div>
          <button
            type="button"
            onClick={loadUsers}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#2D5A27] transition font-medium cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        {loading && users.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="w-5 h-5 border-2 border-[#2D5A27] border-t-transparent rounded-full animate-spin mr-2" />
            <span className="text-xs">Đang tải danh sách nhân sự...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">Chưa có tài khoản nào trong hệ thống</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
                  <th className="text-left px-5 py-3 font-semibold">Tài khoản</th>
                  <th className="text-left px-4 py-3 font-semibold">Phân quyền</th>
                  <th className="text-left px-4 py-3 font-semibold">Trạng thái Account</th>
                  <th className="text-left px-4 py-3 font-semibold">Trạng thái hoạt động</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const presence = getPresenceInfo(u);
                  const isUserLocked = u.trang_thai === 'locked';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      {/* Cột 1: Avatar đại diện + chỉ lấy chấm xanh/vàng/xám cạnh avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-xs">
                              {(u.ho_ten || u.email).substring(0, 2).toUpperCase()}
                            </div>
                            {/* Chấm tròn trạng thái Online (Xanh) / Chuyển tab (Vàng) / Offline (Xám) / Khóa (Đỏ) */}
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${presence.dotColor}`}
                              title={presence.title}
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800 text-[13px]">{u.ho_ten}</span>
                              {u.is_current_user && (
                                <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-100 text-emerald-700 font-bold">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Phân quyền (Admin / User) có thể thay đổi trực tiếp */}
                      <td className="px-4 py-3.5">
                        {u.is_current_user ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            <Shield className="w-3 h-3 text-blue-600" />
                            Admin (Full quyền)
                          </span>
                        ) : (
                          <div className="relative inline-block">
                            <select
                              value={u.vai_tro}
                              disabled={roleUpdatingId === u.id}
                              onChange={(e) => handleRoleChange(u, e.target.value as 'admin' | 'user')}
                              className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer focus:outline-none transition ${
                                u.vai_tro === 'admin'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              <option value="admin">Admin (Full quyền)</option>
                              <option value="user">User (Chỉ tạo đánh giá)</option>
                            </select>
                            {roleUpdatingId === u.id && (
                              <div className="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center">
                                <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Cột 3: Trạng thái Account (1 icon: ấn là hoạt động, ấn cái nữa là khóa) */}
                      <td className="px-4 py-3.5">
                        {u.is_current_user ? (
                          <div
                            className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200"
                            title="Tài khoản của bạn (Đang hoạt động)"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={statusUpdatingId === u.id}
                            onClick={() => handleDirectToggleLock(u)}
                            className={`w-8 h-8 rounded-xl transition cursor-pointer flex items-center justify-center border shadow-2xs ${
                              isUserLocked
                                ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200'
                            }`}
                            title={isUserLocked ? 'Đang Khóa — Ấn để chuyển sang Hoạt Động' : 'Đang Hoạt Động — Ấn để Khóa'}
                          >
                            {statusUpdatingId === u.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : isUserLocked ? (
                              <Lock className="w-4 h-4 text-red-600" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            )}
                          </button>
                        )}
                      </td>

                      {/* Cột 4: Trạng thái hoạt động (Đang hoạt động / Vắng mặt / Hoạt động X phút trước / Quá 1 ngày hiển thị ngày giờ) */}
                      <td className="px-4 py-3.5">
                        {(() => {
                          const act = getActivityStatus(u);
                          return (
                            <span className={act.className}>
                              {act.text}
                            </span>
                          );
                        })()}
                      </td>

                      {/* Cột 5: Nút xóa */}
                      <td className="px-4 py-3.5 text-right">
                        {!u.is_current_user && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(u)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                            title="Xóa tài khoản này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── CỬA SỔ NỔI 1: THÊM NHÂN SỰ MỚI ── */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-[#2D5A27] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Thêm Nhân Sự Mới</h3>
                  <p className="text-[11px] text-emerald-100">Tạo tài khoản và gửi email thông tin đăng nhập tự động</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAdd} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={addForm.ho_ten}
                  onChange={(e) => setAddForm((p) => ({ ...p, ho_ten: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#2D5A27] focus:outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email thật <span className="text-red-500">*</span>
                  <span className="ml-1.5 text-[10px] font-normal text-slate-400">
                    (dùng để gửi link và mật khẩu đăng nhập)
                  </span>
                </label>
                <input
                  type="email"
                  placeholder="nhansu@gmail.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#2D5A27] focus:outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phân quyền tài khoản</label>
                <select
                  value={addForm.vai_tro}
                  onChange={(e) => setAddForm((p) => ({ ...p, vai_tro: e.target.value as 'admin' | 'user' }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#2D5A27] focus:outline-none bg-white font-medium transition cursor-pointer"
                >
                  <option value="user">User — Chỉ đăng nhập được vào link Tạo Đánh Giá (/taodanhgia)</option>
                  <option value="admin">Admin — Toàn quyền quản trị hệ thống (/admin)</option>
                </select>
              </div>

              {/* Thông báo chi tiết loại email sẽ gửi */}
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                  addForm.vai_tro === 'user'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                <Mail className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  {addForm.vai_tro === 'user' ? (
                    <span>
                      Hệ thống sẽ gửi email chứa mật khẩu và link đến <strong>Cổng Tạo Đánh Giá</strong> (
                      <code>/taodanhgia</code>). Tài khoản này sẽ không có quyền vào trang Quản Trị Admin.
                    </span>
                  ) : (
                    <span>
                      Hệ thống sẽ gửi email chứa mật khẩu và link đến <strong>Trang Quản Trị Hệ Thống</strong> (
                      <code>/admin</code>) với toàn quyền truy cập.
                    </span>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 shadow-sm"
                >
                  {adding ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Tạo &amp; Gửi Email</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CỬA SỔ NỔI 2: ĐỔI MẬT KHẨU CÁ NHÂN ── */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-[#2D5A27] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Đổi Mật Khẩu Cá Nhân</h3>
                  <p className="text-[11px] text-emerald-100">
                    Đổi mật khẩu cho: {currentUser?.ho_ten || currentUser?.username}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4 overflow-y-auto">
              {[
                {
                  key: 'currentPassword',
                  label: 'Mật khẩu hiện tại',
                  show: showPw.current,
                  toggle: () => setShowPw((p) => ({ ...p, current: !p.current })),
                },
                {
                  key: 'newPassword',
                  label: 'Mật khẩu mới (tối thiểu 6 ký tự)',
                  show: showPw.new,
                  toggle: () => setShowPw((p) => ({ ...p, new: !p.new })),
                },
                {
                  key: 'confirmPassword',
                  label: 'Xác nhận lại mật khẩu mới',
                  show: showPw.confirm,
                  toggle: () => setShowPw((p) => ({ ...p, confirm: !p.confirm })),
                },
              ].map(({ key, label, show, toggle }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {label} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={(pwForm as any)[key]}
                      onChange={(e) => setPwForm((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-xs focus:border-[#2D5A27] focus:outline-none transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={changingPw}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 shadow-sm"
                >
                  {changingPw ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Lưu Mật Khẩu</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CỬA SỔ NỔI 3: XÁC NHẬN XÓA TÀI KHOẢN ── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100">
            <div className="bg-red-50 p-6 text-center border-b border-red-100">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <ShieldAlert className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Xác nhận xóa tài khoản</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Bạn có chắc muốn xóa tài khoản của<br />
                <strong className="text-slate-800">{deleteTarget.ho_ten}</strong>
                <span className="text-slate-400"> ({deleteTarget.email})</span>?<br />
                <span className="text-red-500 font-medium">Hành động này không thể hoàn tác!</span>
              </p>
            </div>
            <div className="p-4 flex gap-3 bg-white">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {deleting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{deleting ? 'Đang xóa...' : 'Xóa tài khoản'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {

  // XÁC THỰC QUẢN TRỊ VIÊN (ADMIN AUTHENTICATION)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<{ username: string; ho_ten: string; vai_tro: string } | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Gửi heartbeat presence khi Admin đang ở tab
  usePresenceHeartbeat(isAuthenticated === true);

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/me');
        const data = await res.json();
        if (isMounted) {
          if (data.authenticated && data.user) {
            // Nếu là tài khoản User (chỉ tạo đánh giá), tự động chuyển sang trang /taodanhgia
            if (data.user.vai_tro === 'user') {
              if (typeof window !== 'undefined') {
                window.location.href = '/taodanhgia';
              }
              return;
            }
            setIsAuthenticated(true);
            setCurrentUser(data.user);
          } else {
            setIsAuthenticated(false);
            setCurrentUser(null);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('petmm_admin_user');
            }
          }
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      }
    };
    checkAuth();
    return () => { isMounted = false; };
  }, []);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const doLogout = async () => {
    setShowLogoutConfirm(false);
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('petmm_admin_user');
      }
      setCurrentUser(null);
      setIsAuthenticated(false);
      setIsLoggingOut(false);
    }
  };

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [configSubTab, setConfigSubTab] = useState<ConfigSubTab>('contact');
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // -------------------------------------------------------------
  // DỮ LIỆU TUYỂN DỤNG & HỒ SƠ ỨNG VIÊN
  // -------------------------------------------------------------
  const [jobApplications, setJobApplications] = useState<HoSoTuyenDungRecord[]>([]);
  const [jobs, setJobs] = useState<TuyenDungRecord[]>([]);

  // KIỂM TRA MÀN HÌNH QUÁ NHỎ (MOBILE & TABLET < 1024px)
  const [isScreenTooSmall, setIsScreenTooSmall] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsScreenTooSmall(window.innerWidth < 1024);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const loadJobApplications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/applications', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setJobApplications(json.data as HoSoTuyenDungRecord[]);
        return;
      }
    } catch (e) {
      console.warn('Lỗi lấy hồ sơ tuyển dụng qua API, chuyển sang Supabase client:', e);
    }

    try {
      const { data, error } = await supabase
        .from('ho_so_tuyen_dung')
        .select('*')
        .order('ngay_tao', { ascending: false });
      if (!error && data) {
        setJobApplications(data as HoSoTuyenDungRecord[]);
      }
    } catch (e) {
      console.error('Error loading job applications:', e);
    }
  }, []);

  const loadJobsList = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/jobs');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setJobs(json.data as TuyenDungRecord[]);
          return;
        }
      }
      const { data, error } = await supabase
        .from('tuyen_dung')
        .select('*')
        .order('thu_tu', { ascending: true });
      if (!error && data) {
        setJobs(data as TuyenDungRecord[]);
      }
    } catch (e) {
      console.error('Error loading jobs:', e);
    }
  }, []);

  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  // -------------------------------------------------------------
  // TRẠNG THÁI HIGHLIGHT HÀNG KHI CLICK CHUÔNG THÔNG BÁO
  // -------------------------------------------------------------
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const highlightTimerRef = useRef<NodeJS.Timeout | null>(null);
  const openAppointmentByIdRef = useRef<((id: string) => void) | null>(null);

  const handleNavigateWithHighlight = useCallback((tab: AdminTab, itemId?: string) => {
    // Nếu chuyển đến hồ sơ ứng viên tuyển dụng: tự động mở Tab Đội ngũ y tế & Sub-tab Tuyển dụng
    const isJobApp =
      tab === 'team' ||
      (itemId && (itemId.startsWith('job_') || jobApplications.some((a) => a.id === itemId)));

    if (tab === 'config' && itemId === 'notification-logs') {
      setActiveTab('config');
      setConfigSubTab('notification-logs');
    } else if (isJobApp) {
      setActiveTab('team');
      setTeamSubTab('careers');
    } else {
      setActiveTab(tab);
    }

    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
    }
    if (itemId) {
      const cleanItemId = itemId.startsWith('job_') ? itemId.replace('job_', '') : itemId;
      setHighlightedId(cleanItemId);
      // Đợi DOM render sau khi chuyển tab rồi cuộn tới hàng và tô xanh
      setTimeout(() => {
        const el =
          document.getElementById(`appointment-row-${cleanItemId}`) ||
          document.getElementById(`applicant-row-${cleanItemId}`) ||
          document.getElementById(`review-row-${cleanItemId}`) ||
          document.getElementById(cleanItemId);

        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);

      // Nếu là lịch hẹn, tự động mở luôn modal Chi Tiết & Chốt Lịch Hẹn
      if (tab === 'appointments' && openAppointmentByIdRef.current) {
        setTimeout(() => {
          openAppointmentByIdRef.current?.(cleanItemId);
        }, 150);
      }

      // Tự động bỏ tô xanh sau 4 giây (như rê chuột vào xong nhả ra)
      highlightTimerRef.current = setTimeout(() => {
        setHighlightedId(null);
      }, 4000);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [jobApplications]);

  const handleUpdateApplicantStatus = useCallback(async (appId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId, trang_thai: newStatus }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        showNotification('error', `Lỗi khi cập nhật trạng thái: ${json.message || 'Lỗi hệ thống'}`);
        return;
      }

      setJobApplications((prev) =>
        prev.map((item) => (item.id === appId ? { ...item, trang_thai: newStatus } : item))
      );

      const labels: Record<string, string> = {
        bo_qua: 'Đã chuyển hồ sơ sang trạng thái "Bỏ qua"',
        da_lien_he: 'Đã xác nhận "Đã liên hệ" với ứng viên',
        hen_phong_van: 'Đã xác nhận "Lịch hẹn phỏng vấn" với ứng viên',
        moi: 'Đã khôi phục hồ sơ mới',
      };
      showNotification('success', labels[newStatus] || 'Đã cập nhật trạng thái ứng viên thành công!');
    } catch (err: any) {
      showNotification('error', `Không thể cập nhật: ${err?.message || 'Lỗi hệ thống'}`);
    }
  }, []);

  const handleDeleteApplicant = useCallback(async (appId: string) => {
    try {
      const res = await fetch(`/api/admin/applications?id=${encodeURIComponent(appId)}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        showNotification('error', `Lỗi khi xóa hồ sơ: ${json.message || 'Lỗi hệ thống'}`);
        return false;
      }

      setJobApplications((prev) => prev.filter((item) => item.id !== appId));
      showNotification('success', 'Đã xóa hồ sơ ứng viên thành công!');
      return true;
    } catch (err: any) {
      showNotification('error', `Không thể xóa hồ sơ: ${err?.message || 'Lỗi hệ thống'}`);
      return false;
    }
  }, []);

  // -------------------------------------------------------------
  // TAB 1: QUẢN LÝ ẢNH NỀN HERO BANNER
  // -------------------------------------------------------------
  const [banners, setBanners] = useState<HeroBannerItem[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [isBannerSaving, setIsBannerSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<HeroBannerItem> | null>(null);
  const [isCreatingNewBanner, setIsCreatingNewBanner] = useState(false);

  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(50);
  const [zoomLevel, setZoomLevel] = useState(1.05);
  const [isDragging, setIsDragging] = useState(false);
  const [bannerCropPreviewMode, setBannerCropPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const dragStartRef = useRef<{ x: number; y: number; startCropX: number; startCropY: number }>({
    x: 0,
    y: 0,
    startCropX: 50,
    startCropY: 50,
  });
  const cropBoxRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const branchImgFileInputRef = useRef<HTMLInputElement>(null);
  const [isBranchImgUploading, setIsBranchImgUploading] = useState(false);

  const loadBanners = useCallback(async (silent = false) => {
    if (!silent) setBannersLoading(true);
    try {
      const { data, error } = await supabase
        .from('hinh_anh')
        .select('*')
        .eq('chuyen_muc', 'hero_banner')
        .order('thu_tu', { ascending: true });

      if (error) throw error;
      setBanners((data as HeroBannerItem[]) || []);
    } catch (err: any) {
      console.error('Lỗi tải banner:', err);
      if (!silent) showNotification('error', `Không thể tải ảnh: ${err.message || 'Lỗi kết nối'}`);
    } finally {
      if (!silent) setBannersLoading(false);
    }
  }, [showNotification]);

  const handleAddNewBanner = () => {
    const nextOrder = banners.length > 0 ? Math.max(...banners.map((b) => b.thu_tu || 0)) + 1 : 1;
    setEditingBanner({
      duong_dan_anh: '',
      tieu_de: 'Ảnh nền PetM&M',
      alt_text: 'Ảnh nền PetM&M 5 sao',
      chuyen_muc: 'hero_banner',
      can_chinh: '50% 50%',
      ti_le_phong: 1.05,
      hieu_ung: 'ken_burns',
      thu_tu: nextOrder,
      kich_hoat: true,
      thoi_gian_hien_thi: 4000,
    });
    setCropX(50);
    setCropY(50);
    setZoomLevel(1.05);
    setBannerCropPreviewMode('desktop');
    setIsCreatingNewBanner(true);
  };

  const handleEditBanner = (banner: HeroBannerItem) => {
    setEditingBanner({ ...banner });
    setIsCreatingNewBanner(false);
    setBannerCropPreviewMode('desktop');

    const pos = banner.can_chinh || '50% 50%';
    const percentMatch = pos.match(/(\d+)%\s+(\d+)%/);
    if (percentMatch) {
      setCropX(parseInt(percentMatch[1], 10));
      setCropY(parseInt(percentMatch[2], 10));
    } else if (pos.includes('top')) {
      setCropX(50);
      setCropY(20);
    } else if (pos.includes('bottom')) {
      setCropX(50);
      setCropY(80);
    } else {
      setCropX(50);
      setCropY(50);
    }
    setZoomLevel(banner.ti_le_phong || 1.05);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      showNotification('error', 'Dung lượng ảnh vượt quá 25MB!');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanFileName = `hero_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `banners/${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('hinh_anh')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('hinh_anh').getPublicUrl(filePath);

      setEditingBanner((prev) => ({
        ...prev,
        duong_dan_anh: publicUrlData.publicUrl,
        tieu_de: 'Ảnh nền PetM&M',
        alt_text: 'Ảnh nền PetM&M 5 sao',
      }));

      showNotification('success', 'Đã tải ảnh lên Supabase thành công!');
    } catch (err: any) {
      console.error('Upload error:', err);
      showNotification('error', `Lỗi tải ảnh: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBranchImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      showNotification('error', 'Ảnh vượt quá 25MB!');
      return;
    }
    setIsBranchImgUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `branches/cover_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('hinh_anh')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('hinh_anh').getPublicUrl(filePath);
      setEditingBranch((prev) => ({ ...prev, anh_dai_dien: urlData.publicUrl }));
      showNotification('success', 'Đã tải ảnh bìa lên thành công!');
    } catch (err: any) {
      showNotification('error', `Lỗi tải ảnh: ${err.message}`);
    } finally {
      setIsBranchImgUploading(false);
      if (branchImgFileInputRef.current) branchImgFileInputRef.current.value = '';
    }
  };

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startCropX: cropX,
      startCropY: cropY,
    };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !cropBoxRef.current) return;
      const rect = cropBoxRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      const percentDeltaX = (deltaX / rect.width) * 80;
      const percentDeltaY = (deltaY / rect.height) * 80;
      setCropX(Math.max(0, Math.min(100, Math.round(dragStartRef.current.startCropX - percentDeltaX))));
      setCropY(Math.max(0, Math.min(100, Math.round(dragStartRef.current.startCropY - percentDeltaY))));
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      startCropX: cropX,
      startCropY: cropY,
    };
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !cropBoxRef.current || e.touches.length !== 1) return;
      const rect = cropBoxRef.current.getBoundingClientRect();
      const deltaX = e.touches[0].clientX - dragStartRef.current.x;
      const deltaY = e.touches[0].clientY - dragStartRef.current.y;
      const percentDeltaX = (deltaX / rect.width) * 80;
      const percentDeltaY = (deltaY / rect.height) * 80;
      setCropX(Math.max(0, Math.min(100, Math.round(dragStartRef.current.startCropX - percentDeltaX))));
      setCropY(Math.max(0, Math.min(100, Math.round(dragStartRef.current.startCropY - percentDeltaY))));
    },
    [isDragging]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const handleSaveBanner = async () => {
    if (!editingBanner?.duong_dan_anh) {
      showNotification('error', 'Vui lòng chọn hoặc tải ảnh lên trước!');
      return;
    }

    setIsBannerSaving(true);
    try {
      const finalPosition = `${cropX}% ${cropY}%`;
      const payload = {
        tieu_de: editingBanner.tieu_de || 'Ảnh nền PetM&M',
        duong_dan_anh: editingBanner.duong_dan_anh,
        alt_text: editingBanner.alt_text || 'Ảnh nền PetM&M 5 sao',
        chuyen_muc: 'hero_banner',
        can_chinh: finalPosition,
        ti_le_phong: Number(zoomLevel) || 1.05,
        hieu_ung: editingBanner.hieu_ung || 'ken_burns',
        thu_tu: Number(editingBanner.thu_tu) || 1,
        kich_hoat: editingBanner.kich_hoat !== false,
        thoi_gian_hien_thi: Number(editingBanner.thoi_gian_hien_thi) || 4000,
        ngay_cap_nhat: new Date().toISOString(),
      };

      if (isCreatingNewBanner || !editingBanner.id) {
        await mutateAdminContent('hinh_anh', 'insert', undefined, payload);
        showNotification('success', 'Đã thêm ảnh nền mới thành công!');
      } else {
        await mutateAdminContent('hinh_anh', 'update', editingBanner.id, payload);
        showNotification('success', 'Đã lưu vị trí ảnh nền thành công!');
      }

      setEditingBanner(null);
      setIsCreatingNewBanner(false);
      await loadBanners();
    } catch (err: any) {
      console.error('Save error:', err);
      showNotification('error', `Lỗi lưu ảnh: ${err.message}`);
    } finally {
      setIsBannerSaving(false);
    }
  };

  const handleToggleBannerActive = async (banner: HeroBannerItem) => {
    try {
      await mutateAdminContent('hinh_anh', 'update', banner.id, {
        kich_hoat: !banner.kich_hoat,
        ngay_cap_nhat: new Date().toISOString(),
      });
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, kich_hoat: !b.kich_hoat } : b)));
      showNotification('success', `Đã ${!banner.kich_hoat ? 'bật' : 'tắt'} hiển thị ảnh này`);
    } catch (err: any) {
      showNotification('error', `Lỗi cập nhật: ${err.message}`);
    }
  };

  const handleDeleteBanner = async (banner: HeroBannerItem) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh nền này?')) return;
    try {
      await mutateAdminContent('hinh_anh', 'delete', banner.id);
      showNotification('success', 'Đã xóa ảnh thành công!');
      setBanners((prev) => prev.filter((b) => b.id !== banner.id));
      if (editingBanner?.id === banner.id) setEditingBanner(null);
    } catch (err: any) {
      showNotification('error', `Lỗi xóa ảnh: ${err.message}`);
    }
  };

  // -------------------------------------------------------------
  // TAB 2: QUẢN LÝ CHI NHÁNH BỆNH VIỆN
  // -------------------------------------------------------------
  const [branches, setBranches] = useState<ChiNhanhRecord[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [isBranchSaving, setIsBranchSaving] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Partial<ChiNhanhRecord> | null>(null);
  const [isCreatingNewBranch, setIsCreatingNewBranch] = useState(false);
  const [featuresInput, setFeaturesInput] = useState('');
  const [featuresEnInput, setFeaturesEnInput] = useState('');
  const [branchLangTab, setBranchLangTab] = useState<'vi' | 'en'>('vi');
  const [isTranslatingBranch, setIsTranslatingBranch] = useState(false);

  const loadBranches = useCallback(async (silent = false) => {
    if (!silent) setBranchesLoading(true);
    try {
      const { data, error } = await supabase
        .from('chi_nhanh')
        .select('*')
        .order('thu_tu', { ascending: true });

      if (error) throw error;
      setBranches((data as ChiNhanhRecord[]) || []);
    } catch (err: any) {
      console.error('Lỗi tải chi nhánh:', err);
      if (!silent) showNotification('error', `Lỗi tải chi nhánh: ${err.message}`);
    } finally {
      if (!silent) setBranchesLoading(false);
    }
  }, [showNotification]);

  const handleAddNewBranch = () => {
    const nextOrder = branches.length > 0 ? Math.max(...branches.map((b) => b.thu_tu || 0)) + 1 : 1;
    setEditingBranch({
      ten_chi_nhanh: '',
      ten_ngan: '',
      khu_vuc: '',
      khau_hieu: '',
      dia_chi: '',
      so_dien_thoai: '',
      gio_hoat_dong: '',
      bac_si_phu_trach: '',
      bang_cap_bac_si: '',
      thong_tin_do_xe: '',
      link_ggmap_embed: '',
      link_ggmap_app: '',
      tien_ich: [],
      thu_tu: nextOrder,
      kich_hoat: true,
      la_co_so_chinh: false,
    });
    setFeaturesInput('');
    setFeaturesEnInput('');
    setBranchLangTab('vi');
    setIsCreatingNewBranch(true);
  };

  const handleEditBranch = (branch: ChiNhanhRecord) => {
    setEditingBranch({ ...branch, la_co_so_chinh: Boolean(branch.la_co_so_chinh) });
    setIsCreatingNewBranch(false);
    const feats = Array.isArray(branch.tien_ich)
      ? branch.tien_ich
      : typeof branch.tien_ich === 'string'
      ? JSON.parse(branch.tien_ich)
      : [];
    setFeaturesInput(feats.join('\n'));
    const featsEn = Array.isArray((branch as any).tien_ich_en) ? (branch as any).tien_ich_en : [];
    setFeaturesEnInput(featsEn.join('\n'));
    setBranchLangTab('vi');
  };

  const handleAutoTranslateBranch = async () => {
    if (!editingBranch?.ten_chi_nhanh) {
      showNotification('error', 'Vui lòng nhập Tên chi nhánh Tiếng Việt trước khi dịch!');
      return;
    }
    setIsTranslatingBranch(true);
    try {
      const fieldsToTranslate: Record<string, string> = {
        ten_chi_nhanh: editingBranch.ten_chi_nhanh || '',
        ten_ngan: editingBranch.ten_ngan || '',
        khu_vuc: editingBranch.khu_vuc || '',
        khau_hieu: editingBranch.khau_hieu || '',
        dia_chi: editingBranch.dia_chi || '',
        bac_si_phu_trach: editingBranch.bac_si_phu_trach || '',
        bang_cap_bac_si: editingBranch.bang_cap_bac_si || '',
        gio_hoat_dong: editingBranch.gio_hoat_dong || '',
        thong_tin_do_xe: editingBranch.thong_tin_do_xe || '',
        tien_ich: featuresInput || '',
        bai_viet_chi_tiet: editingBranch.bai_viet_chi_tiet || '',
      };
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fieldsToTranslate }),
      });
      const data = await res.json();
      if (data.success && data.translations) {
        setEditingBranch((prev) => (prev ? {
          ...prev,
          ten_chi_nhanh_en: data.translations.ten_chi_nhanh || (prev as any).ten_chi_nhanh_en,
          ten_ngan_en: data.translations.ten_ngan || (prev as any).ten_ngan_en,
          khu_vuc_en: data.translations.khu_vuc || (prev as any).khu_vuc_en,
          khau_hieu_en: data.translations.khau_hieu || (prev as any).khau_hieu_en,
          dia_chi_en: data.translations.dia_chi || (prev as any).dia_chi_en,
          bac_si_phu_trach_en: data.translations.bac_si_phu_trach || (prev as any).bac_si_phu_trach_en,
          bang_cap_bac_si_en: data.translations.bang_cap_bac_si || (prev as any).bang_cap_bac_si_en,
          gio_hoat_dong_en: data.translations.gio_hoat_dong || (prev as any).gio_hoat_dong_en,
          thong_tin_do_xe_en: data.translations.thong_tin_do_xe || (prev as any).thong_tin_do_xe_en,
          bai_viet_chi_tiet_en: data.translations.bai_viet_chi_tiet || (prev as any).bai_viet_chi_tiet_en,
        } as any : null));
        if (data.translations.tien_ich) setFeaturesEnInput(data.translations.tien_ich);
        setBranchLangTab('en');
        showNotification('success', 'Đã chuyển đổi sang Tiếng Anh (kèm toàn bộ bài viết chi tiết) thành công!');
      } else throw new Error(data.error || 'Dịch thất bại');
    } catch (err: any) {
      showNotification('error', `Lỗi dịch: ${err.message}`);
    } finally {
      setIsTranslatingBranch(false);
    }
  };


  const handleSaveBranch = async () => {
    if (!editingBranch?.ten_chi_nhanh || !editingBranch?.dia_chi) {
      showNotification('error', 'Vui lòng nhập Tên chi nhánh và Địa chỉ!');
      return;
    }

    setIsBranchSaving(true);
    try {
      const parsedFeatures = featuresInput
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const payload = {
        ten_chi_nhanh: editingBranch.ten_chi_nhanh,
        ten_ngan: editingBranch.ten_ngan || editingBranch.ten_chi_nhanh,
        khu_vuc: editingBranch.khu_vuc || '',
        khau_hieu: editingBranch.khau_hieu || '',
        dia_chi: editingBranch.dia_chi,
        so_dien_thoai: editingBranch.so_dien_thoai || '',
        gio_hoat_dong: editingBranch.gio_hoat_dong || '',
        bac_si_phu_trach: editingBranch.bac_si_phu_trach || '',
        bang_cap_bac_si: editingBranch.bang_cap_bac_si || '',
        thong_tin_do_xe: editingBranch.thong_tin_do_xe || '',
        link_ggmap_embed: editingBranch.link_ggmap_embed || '',
        link_ggmap_app: editingBranch.link_ggmap_app || '',
        ten_chi_nhanh_en: (editingBranch as any).ten_chi_nhanh_en || '',
        ten_ngan_en: (editingBranch as any).ten_ngan_en || '',
        khu_vuc_en: (editingBranch as any).khu_vuc_en || '',
        khau_hieu_en: (editingBranch as any).khau_hieu_en || '',
        dia_chi_en: (editingBranch as any).dia_chi_en || '',
        bac_si_phu_trach_en: (editingBranch as any).bac_si_phu_trach_en || '',
        bang_cap_bac_si_en: (editingBranch as any).bang_cap_bac_si_en || '',
        gio_hoat_dong_en: (editingBranch as any).gio_hoat_dong_en || '',
        thong_tin_do_xe_en: (editingBranch as any).thong_tin_do_xe_en || '',
        tien_ich_en: featuresEnInput.split('\n').map((f) => f.trim()).filter((f) => f.length > 0),
        bai_viet_chi_tiet_en: (editingBranch as any).bai_viet_chi_tiet_en || '',
        tien_ich: parsedFeatures,
        bai_viet_chi_tiet: editingBranch.bai_viet_chi_tiet || '',
        anh_dai_dien: editingBranch.anh_dai_dien || '',
        anh_goc: editingBranch.anh_goc || editingBranch.anh_dai_dien || null,
        can_chinh_anh: editingBranch.can_chinh_anh || '50% 50%',
        thu_tu: Number(editingBranch.thu_tu) || 1,
        kich_hoat: editingBranch.kich_hoat !== false,
        la_co_so_chinh: Boolean((editingBranch as any).la_co_so_chinh),
        ngay_cap_nhat: new Date().toISOString(),
      };

      if (isCreatingNewBranch || !editingBranch.id) {
        const insertRes = await mutateAdminContent('chi_nhanh', 'insert', undefined, payload);
        const newId = insertRes?.data?.[0]?.id;
        if (payload.la_co_so_chinh && newId) {
          await mutateAdminContent('chi_nhanh', 'set_main_branch', newId);
        }
        showNotification('success', 'Đã thêm chi nhánh mới thành công!');
      } else {
        await mutateAdminContent('chi_nhanh', 'update', editingBranch.id, payload);
        if (payload.la_co_so_chinh) {
          await mutateAdminContent('chi_nhanh', 'set_main_branch', editingBranch.id);
        }
        showNotification('success', 'Đã cập nhật chi nhánh thành công!');
      }

      setEditingBranch(null);
      setIsCreatingNewBranch(false);
      await loadBranches();
    } catch (err: any) {
      console.error('Lỗi lưu chi nhánh:', err);
      showNotification('error', `Lỗi lưu chi nhánh: ${err.message}`);
    } finally {
      setIsBranchSaving(false);
    }
  };

  // Đặt nhanh cơ sở chính 1-chạm từ bảng danh sách
  const handleSetMainBranch = async (branch: ChiNhanhRecord) => {
    try {
      await mutateAdminContent('chi_nhanh', 'set_main_branch', branch.id);
      setBranches((prev) =>
        prev.map((b) => ({
          ...b,
          la_co_so_chinh: b.id === branch.id,
        }))
      );
      showNotification('success', `Đã chọn "${branch.ten_chi_nhanh}" làm Cơ Sở Chính!`);
    } catch (err: any) {
      console.error('Lỗi đặt cơ sở chính:', err);
      showNotification('error', `Lỗi đặt cơ sở chính: ${err.message}`);
    }
  };

  const handleToggleBranchActive = async (branch: ChiNhanhRecord) => {
    try {
      await mutateAdminContent('chi_nhanh', 'update', branch.id, {
        kich_hoat: !branch.kich_hoat,
        ngay_cap_nhat: new Date().toISOString(),
      });
      setBranches((prev) => prev.map((b) => (b.id === branch.id ? { ...b, kich_hoat: !b.kich_hoat } : b)));
      showNotification('success', `Đã ${!branch.kich_hoat ? 'bật' : 'tắt'} chi nhánh này`);
    } catch (err: any) {
      showNotification('error', `Lỗi cập nhật: ${err.message}`);
    }
  };

  const handleDeleteBranch = async (branch: ChiNhanhRecord) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa chi nhánh "${branch.ten_chi_nhanh}"?`)) return;
    try {
      await mutateAdminContent('chi_nhanh', 'delete', branch.id);
      showNotification('success', 'Đã xóa chi nhánh thành công!');
      setBranches((prev) => prev.filter((b) => b.id !== branch.id));
      if (editingBranch?.id === branch.id) setEditingBranch(null);
    } catch (err: any) {
      showNotification('error', `Lỗi xóa chi nhánh: ${err.message}`);
    }
  };

  // Cài đặt Tiêu đề & Chú thích các mục ngoài trang chủ
  const [isBranchTitleModalOpen, setIsBranchTitleModalOpen] = useState(false);
  const [isAboutTitleModalOpen, setIsAboutTitleModalOpen] = useState(false);
  const [isServicesTitleModalOpen, setIsServicesTitleModalOpen] = useState(false);
  const [isArticlesTitleModalOpen, setIsArticlesTitleModalOpen] = useState(false);
  const [isFaqTitleModalOpen, setIsFaqTitleModalOpen] = useState(false);
  const [isSupportTitleModalOpen, setIsSupportTitleModalOpen] = useState(false);
  const [isCareersTitleModalOpen, setIsCareersTitleModalOpen] = useState(false);
  const [isBookingTitleModalOpen, setIsBookingTitleModalOpen] = useState(false);
  const [careersDefaultView, setCareersDefaultView] = useState<'jobs' | 'applicants'>('jobs');

  // Cấu hình Slogan & 2 Nút Đầu Trang (Hero Banner)
  const [isSavingHeroControls, setIsSavingHeroControls] = useState(false);
  const [heroPosDevice, setHeroPosDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [heroCardLang, setHeroCardLang] = useState<'vi' | 'en'>('vi');
  const [heroNudgeStep, setHeroNudgeStep] = useState<number>(20);

  const handleNudgeHeroPosition = (dx: number, dy: number) => {
    if (heroPosDevice === 'desktop') {
      setConfigForm((prev) => ({
        ...prev,
        hero_slogan_x_desktop: (prev.hero_slogan_x_desktop ?? 0) + dx,
        hero_slogan_y_desktop: (prev.hero_slogan_y_desktop ?? 0) + dy,
      }));
    } else {
      setConfigForm((prev) => ({
        ...prev,
        hero_slogan_x_mobile: (prev.hero_slogan_x_mobile ?? 0) + dx,
        hero_slogan_y_mobile: (prev.hero_slogan_y_mobile ?? 0) + dy,
      }));
    }
  };

  const handleSetHeroPreset = (preset: 'left' | 'center' | 'right') => {
    if (heroPosDevice === 'desktop') {
      const xMap = { left: -320, center: 0, right: 320 };
      setConfigForm((prev) => ({
        ...prev,
        hero_slogan_x_desktop: xMap[preset],
        hero_slogan_align_desktop: preset,
      }));
    } else {
      const xMap = { left: -60, center: 0, right: 60 };
      setConfigForm((prev) => ({
        ...prev,
        hero_slogan_x_mobile: xMap[preset],
        hero_slogan_align_mobile: preset,
      }));
    }
  };

  const handleResetHeroPosition = () => {
    if (heroPosDevice === 'desktop') {
      setConfigForm((prev) => ({
        ...prev,
        hero_slogan_x_desktop: 0,
        hero_slogan_y_desktop: 0,
        hero_slogan_align_desktop: 'center',
      }));
    } else {
      setConfigForm((prev) => ({
        ...prev,
        hero_slogan_x_mobile: 0,
        hero_slogan_y_mobile: 0,
        hero_slogan_align_mobile: 'center',
      }));
    }
  };

  // -------------------------------------------------------------
  // TAB 3: CẤU HÌNH LIÊN HỆ & MẠNG XÃ HỘI
  // -------------------------------------------------------------
  const { config: globalConfig, refreshConfig } = useSystemConfig();
  const [configForm, setConfigForm] = useState<CauHinhRecord>(globalConfig);
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [aboutSubLang, setAboutSubLang] = useState<'vi' | 'en'>('vi');
  const [sloganSubLang, setSloganSubLang] = useState<'vi' | 'en'>('vi');
  const [sloganItems, setSloganItems] = useState<SloganTickerItem[]>(() =>
    parseSloganList(globalConfig.slogan_dau_trang_noi_dung, globalConfig.slogan_dau_trang_noi_dung_en)
  );

  useEffect(() => {
    if (globalConfig.slogan_dau_trang_noi_dung) {
      setSloganItems(parseSloganList(globalConfig.slogan_dau_trang_noi_dung, globalConfig.slogan_dau_trang_noi_dung_en));
    }
  }, [globalConfig.slogan_dau_trang_noi_dung, globalConfig.slogan_dau_trang_noi_dung_en]);

  const updateSloganItems = (newItems: SloganTickerItem[]) => {
    setSloganItems(newItems);
    setConfigForm((prev) => ({
      ...prev,
      slogan_dau_trang_noi_dung: JSON.stringify(newItems),
      slogan_dau_trang_noi_dung_en: JSON.stringify(newItems),
    }));
  };

  const handleAddSloganItem = () => {
    const newItem: SloganTickerItem = {
      id: `slogan-${Date.now()}`,
      textVi: '',
      textEn: '',
      startDate: '',
      endDate: '',
      isActive: true,
    };
    updateSloganItems([...sloganItems, newItem]);
  };

  const handleUpdateSloganField = (id: string, field: keyof SloganTickerItem, value: any) => {
    const updated = sloganItems.map((item) => (item.id === id ? { ...item, [field]: value } : item));
    updateSloganItems(updated);
  };

  const handleDeleteSloganItem = (id: string) => {
    if (sloganItems.length <= 1) {
      showNotification('error', 'Cần giữ lại ít nhất 1 thông điệp chạy chân banner!');
      return;
    }
    const updated = sloganItems.filter((item) => item.id !== id);
    updateSloganItems(updated);
  };

  const editorRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeEmojiPickerItemId, setActiveEmojiPickerItemId] = useState<string | null>(null);
  const [emojiCategoryFilter, setEmojiCategoryFilter] = useState<'all' | 'promo' | 'medical' | 'schedule' | 'pets'>('all');
  const [posterEmojiPickerOpen, setPosterEmojiPickerOpen] = useState(false);
  const [posterEmojiTargetField, setPosterEmojiTargetField] = useState<'vi' | 'en'>('vi');
  const posterViInputRef = useRef<HTMLInputElement>(null);
  const posterEnInputRef = useRef<HTMLInputElement>(null);

  const handleInsertPosterEmoji = (emoji: string) => {
    const isEn = posterEmojiTargetField === 'en';
    const field = isEn ? 'badgeTextEn' : 'badgeTextVi';
    const titleField = isEn ? 'titleEn' : 'titleVi';
    const input = isEn ? posterEnInputRef.current : posterViInputRef.current;
    const currentVal = announcementForm[field] || '';

    let newVal = '';
    if (input && typeof input.selectionStart === 'number') {
      const start = input.selectionStart;
      const end = input.selectionEnd || start;
      newVal = currentVal.substring(0, start) + `${emoji} ` + currentVal.substring(end);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emoji.length + 1, start + emoji.length + 1);
      }, 10);
    } else {
      newVal = currentVal ? `${emoji} ${currentVal}` : `${emoji} `;
    }

    setAnnouncementForm((prev) => ({
      ...prev,
      category: 'custom',
      [field]: newVal,
      [titleField]: newVal,
    }));
  };

  const handleInsertEmoji = (itemId: string, emoji: string) => {
    const editor = editorRefs.current[itemId];
    if (!editor) return;

    editor.focus();
    const htmlToInsert = `<span class="petmm-icon-shake inline-block select-none" contenteditable="false">${emoji}</span>&nbsp;`;

    let inserted = false;
    if (document.queryCommandSupported('insertHTML')) {
      try {
        inserted = document.execCommand('insertHTML', false, htmlToInsert);
      } catch {
        inserted = false;
      }
    }

    if (!inserted) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const span = document.createElement('span');
        span.className = 'petmm-icon-shake inline-block select-none';
        span.contentEditable = 'false';
        span.textContent = emoji;
        range.deleteContents();
        range.insertNode(span);
        const space = document.createTextNode('\u00A0');
        range.setStartAfter(span);
        range.insertNode(space);
        range.setStartAfter(space);
        range.setEndAfter(space);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        editor.innerHTML += htmlToInsert;
      }
    }

    const newText = editor.innerText.replace(/\r?\n$/, '');
    handleUpdateSloganField(itemId, sloganSubLang === 'vi' ? 'textVi' : 'textEn', newText);
  };
  const [aboutSlideLang, setAboutSlideLang] = useState<'vi' | 'en'>('vi');
  const [aboutSlidePreview, setAboutSlidePreview] = useState<string>('');
  const [branchPreview, setBranchPreview] = useState<string>('');
  const [servicePreview, setServicePreview] = useState<string>('');
  const [articlePreview, setArticlePreview] = useState<string>('');
  const [memberPreview, setMemberPreview] = useState<string>('');
  const [isTranslatingAbout, setIsTranslatingAbout] = useState(false);
  const [isTranslatingSlogans, setIsTranslatingSlogans] = useState(false);
  const [isTranslatingAboutSlide, setIsTranslatingAboutSlide] = useState(false);

  const handleAutoTranslateAbout = async () => {
    setIsTranslatingAbout(true);
    try {
      const fieldsToTranslate: Record<string, string> = {
        gioi_thieu_huy_hieu: configForm.gioi_thieu_huy_hieu || '',
        gioi_thieu_tieu_de_1: configForm.gioi_thieu_tieu_de_1 || '',
        gioi_thieu_tieu_de_2: configForm.gioi_thieu_tieu_de_2 || '',
        gioi_thieu_mo_ta: configForm.gioi_thieu_mo_ta || '',
        gioi_thieu_cam_ket_tieu_de: configForm.gioi_thieu_cam_ket_tieu_de || '',
        gioi_thieu_cam_ket_phu: configForm.gioi_thieu_cam_ket_phu || '',
        gioi_thieu_trich_dan: configForm.gioi_thieu_trich_dan || '',
        gioi_thieu_bac_si_ten: configForm.gioi_thieu_bac_si_ten || '',
        gioi_thieu_bac_si_chuc_danh: configForm.gioi_thieu_bac_si_chuc_danh || '',
      };
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fieldsToTranslate }),
      });
      const data = await res.json();
      if (data.success && data.translations) {
        setConfigForm((prev) => ({
          ...prev,
          gioi_thieu_huy_hieu_en: data.translations.gioi_thieu_huy_hieu ?? prev.gioi_thieu_huy_hieu_en,
          gioi_thieu_tieu_de_1_en: data.translations.gioi_thieu_tieu_de_1 ?? prev.gioi_thieu_tieu_de_1_en,
          gioi_thieu_tieu_de_2_en: data.translations.gioi_thieu_tieu_de_2 ?? prev.gioi_thieu_tieu_de_2_en,
          gioi_thieu_mo_ta_en: data.translations.gioi_thieu_mo_ta ?? prev.gioi_thieu_mo_ta_en,
          gioi_thieu_cam_ket_tieu_de_en: data.translations.gioi_thieu_cam_ket_tieu_de ?? prev.gioi_thieu_cam_ket_tieu_de_en,
          gioi_thieu_cam_ket_phu_en: data.translations.gioi_thieu_cam_ket_phu ?? prev.gioi_thieu_cam_ket_phu_en,
          gioi_thieu_trich_dan_en: data.translations.gioi_thieu_trich_dan ?? prev.gioi_thieu_trich_dan_en,
          gioi_thieu_bac_si_ten_en: data.translations.gioi_thieu_bac_si_ten ?? prev.gioi_thieu_bac_si_ten_en,
          gioi_thieu_bac_si_chuc_danh_en: data.translations.gioi_thieu_bac_si_chuc_danh ?? prev.gioi_thieu_bac_si_chuc_danh_en,
        }));
        setAboutSubLang('en');
        showNotification('success', 'Đã chuyển đổi Giới thiệu sang Tiếng Anh thành công!');
      } else throw new Error(data.error || 'Dịch thất bại');
    } catch (err: any) {
      showNotification('error', `Lỗi dịch: ${err.message}`);
    } finally {
      setIsTranslatingAbout(false);
    }
  };

  const [isFaviconUploading, setIsFaviconUploading] = useState(false);
  const faviconFileInputRef = useRef<HTMLInputElement>(null);

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'Dung lượng logo không được vượt quá 5MB!');
      return;
    }

    setIsFaviconUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'logos');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Lỗi tải ảnh lên');
      }

      setConfigForm((prev) => ({
        ...prev,
        logo_favicon: resData.url,
      }));

      showNotification('success', 'Đã tải Logo Favicon lên thành công!');
    } catch (err: any) {
      console.error('Upload favicon error:', err);
      showNotification('error', `Lỗi tải logo: ${err.message}`);
    } finally {
      setIsFaviconUploading(false);
      if (faviconFileInputRef.current) faviconFileInputRef.current.value = '';
    }
  };

  const [isWebsiteLogoUploading, setIsWebsiteLogoUploading] = useState(false);
  const websiteLogoFileInputRef = useRef<HTMLInputElement>(null);

  const handleWebsiteLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showNotification('error', 'Dung lượng ảnh logo không được vượt quá 10MB!');
      return;
    }

    setIsWebsiteLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'logos');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Lỗi tải ảnh lên');
      }

      setConfigForm((prev) => ({
        ...prev,
        logo_website: resData.url,
      }));

      showNotification('success', 'Đã tải Logo Website lên thành công! Bấm "Lưu Cài Đặt" để áp dụng cho cả Header, Hero và Footer.');
    } catch (err: any) {
      console.error('Upload website logo error:', err);
      showNotification('error', `Lỗi tải ảnh logo: ${err.message}`);
    } finally {
      setIsWebsiteLogoUploading(false);
      if (websiteLogoFileInputRef.current) websiteLogoFileInputRef.current.value = '';
    }
  };

  const handleAutoTranslateSlogans = async () => {
    setIsTranslatingSlogans(true);
    try {
      const fieldsToTranslate: Record<string, string> = {
        tieu_de_trang: configForm.tieu_de_trang || '',
        slogan_dau_trang_tieu_de: configForm.slogan_dau_trang_tieu_de || '',
        slogan_dau_trang_noi_dung: configForm.slogan_dau_trang_noi_dung || '',
        slogan_cuoi_trang_tieu_de: configForm.slogan_cuoi_trang_tieu_de || '',
        slogan_cuoi_trang_noi_dung: configForm.slogan_cuoi_trang_noi_dung || '',
      };
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fieldsToTranslate }),
      });
      const data = await res.json();
      if (data.success && data.translations) {
        setConfigForm((prev) => ({
          ...prev,
          tieu_de_trang_en: data.translations.tieu_de_trang ?? prev.tieu_de_trang_en,
          slogan_dau_trang_tieu_de_en: data.translations.slogan_dau_trang_tieu_de ?? prev.slogan_dau_trang_tieu_de_en,
          slogan_dau_trang_noi_dung_en: data.translations.slogan_dau_trang_noi_dung ?? prev.slogan_dau_trang_noi_dung_en,
          slogan_cuoi_trang_tieu_de_en: data.translations.slogan_cuoi_trang_tieu_de ?? prev.slogan_cuoi_trang_tieu_de_en,
          slogan_cuoi_trang_noi_dung_en: data.translations.slogan_cuoi_trang_noi_dung ?? prev.slogan_cuoi_trang_noi_dung_en,
        }));
        setSloganSubLang('en');
        showNotification('success', 'Đã chuyển đổi Slogan & Tiêu đề trang sang Tiếng Anh thành công!');
      } else throw new Error(data.error || 'Dịch thất bại');
    } catch (err: any) {
      showNotification('error', `Lỗi dịch: ${err.message}`);
    } finally {
      setIsTranslatingSlogans(false);
    }
  };

  useEffect(() => {
    setConfigForm(globalConfig);
  }, [globalConfig]);

  const handleOpenBranchTitleModal = () => setIsBranchTitleModalOpen(true);
  const handleOpenAboutTitleModal = () => setIsAboutTitleModalOpen(true);
  const handleOpenServicesTitleModal = () => setIsServicesTitleModalOpen(true);
  const handleOpenArticlesTitleModal = () => setIsArticlesTitleModalOpen(true);
  const handleOpenFaqTitleModal = () => setIsFaqTitleModalOpen(true);
  const handleOpenSupportTitleModal = () => setIsSupportTitleModalOpen(true);
  const handleOpenCareersTitleModal = () => setIsCareersTitleModalOpen(true);
  const handleOpenBookingTitleModal = () => setIsBookingTitleModalOpen(true);

  const handleSaveHeroControls = async () => {
    setIsSavingHeroControls(true);
    try {
      const payload = {
        id: 'system',
        slogan_dau_trang_tieu_de: configForm.slogan_dau_trang_tieu_de || '',
        slogan_dau_trang_tieu_de_en: configForm.slogan_dau_trang_tieu_de_en || '',
        hero_nut_1_text: configForm.hero_nut_1_text ?? 'Đặt Lịch Thăm Khám',
        hero_nut_1_text_en: configForm.hero_nut_1_text_en ?? 'Book Appointment',
        hero_nut_1_link: configForm.hero_nut_1_link ?? '#booking',
        hero_nut_1_hien_thi: configForm.hero_nut_1_hien_thi !== false,
        hero_nut_2_text: configForm.hero_nut_2_text ?? 'Xem Dịch Vụ',
        hero_nut_2_text_en: configForm.hero_nut_2_text_en ?? 'Our Services',
        hero_nut_2_link: configForm.hero_nut_2_link ?? '#services',
        hero_nut_2_hien_thi: configForm.hero_nut_2_hien_thi !== false,
        hero_slogan_x_desktop: configForm.hero_slogan_x_desktop ?? 0,
        hero_slogan_y_desktop: configForm.hero_slogan_y_desktop ?? 0,
        hero_slogan_align_desktop: configForm.hero_slogan_align_desktop || 'center',
        hero_slogan_x_mobile: configForm.hero_slogan_x_mobile ?? 0,
        hero_slogan_y_mobile: configForm.hero_slogan_y_mobile ?? 0,
        hero_slogan_align_mobile: configForm.hero_slogan_align_mobile || 'center',
        ngay_cap_nhat: new Date().toISOString(),
      };

      delete (payload as any).id;
      const { error } = await supabase.from('cau_hinh').update(payload).eq('id', 'system');
      if (error) {
        const res = await fetch('/api/admin/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw error;
      }

      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem('petmm_system_config_cache');
          const prevCache = cached ? JSON.parse(cached) : {};
          const newCache = { ...prevCache, ...payload };
          localStorage.setItem('petmm_system_config_cache', JSON.stringify(newCache));
          const r = document.documentElement;
          r.style.setProperty('--hero-x-desktop', `${payload.hero_slogan_x_desktop}px`);
          r.style.setProperty('--hero-y-desktop', `${payload.hero_slogan_y_desktop}px`);
          r.style.setProperty('--hero-x-mobile', `${payload.hero_slogan_x_mobile}px`);
          r.style.setProperty('--hero-y-mobile', `${payload.hero_slogan_y_mobile}px`);
        } catch {}
      }

      await refreshConfig();
      showNotification('success', 'Đã lưu cấu hình Slogan & 2 Nút Đầu Trang thành công!');
    } catch (err: any) {
      console.error('Lỗi lưu cấu hình Hero:', err);
      showNotification('error', `Lỗi lưu cấu hình: ${err.message}`);
    } finally {
      setIsSavingHeroControls(false);
    }
  };

  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsConfigSaving(true);
    try {
      // Whitelist các cột thực tế tồn tại trong bảng cau_hinh trên Supabase
      const VALID_CAU_HINH_COLUMNS = [
        'id',
        'hotline',
        'hotline_hien_thi',
        'link_zalo',
        'link_facebook',
        'link_messenger',
        'email',
        'dia_chi_chinh',
        'ngay_cap_nhat',
        'slogan_dau_trang_tieu_de',
        'slogan_dau_trang_noi_dung',
        'slogan_cuoi_trang_tieu_de',
        'slogan_cuoi_trang_noi_dung',
        'giay_phep',
        'gioi_thieu_huy_hieu',
        'gioi_thieu_tieu_de_1',
        'gioi_thieu_tieu_de_2',
        'gioi_thieu_mo_ta',
        'gioi_thieu_cam_ket_tieu_de',
        'gioi_thieu_cam_ket_phu',
        'gioi_thieu_trich_dan',
        'gioi_thieu_bac_si_ten',
        'gioi_thieu_bac_si_chuc_danh',
        'thong_ke_nam_thanh_lap',
        'thong_ke_nam_thanh_lap_nhan',
        'thong_ke_khach_hang',
        'thong_ke_khach_hang_nhan',
        'link_tiktok',
        'logo_favicon',
        'logo_website',
        'gioi_thieu_huy_hieu_en',
        'gioi_thieu_tieu_de_1_en',
        'gioi_thieu_tieu_de_2_en',
        'gioi_thieu_mo_ta_en',
        'gioi_thieu_cam_ket_tieu_de_en',
        'gioi_thieu_cam_ket_phu_en',
        'gioi_thieu_trich_dan_en',
        'gioi_thieu_bac_si_ten_en',
        'gioi_thieu_bac_si_chuc_danh_en',
        'thong_ke_nam_thanh_lap_nhan_en',
        'thong_ke_khach_hang_nhan_en',
        'slogan_cuoi_trang_tieu_de_en',
        'slogan_cuoi_trang_noi_dung_en',
        'tieu_de_trang',
        'tieu_de_trang_en',
        'slogan_dau_trang_tieu_de_en',
        'slogan_dau_trang_noi_dung_en',
        'hero_nut_1_text',
        'hero_nut_1_text_en',
        'hero_nut_1_link',
        'hero_nut_1_hien_thi',
        'hero_nut_2_text',
        'hero_nut_2_text_en',
        'hero_nut_2_link',
        'hero_nut_2_hien_thi',
        'section_chi_nhanh_tieu_de',
        'section_chi_nhanh_mo_ta',
        'section_chi_nhanh_tieu_de_en',
        'section_chi_nhanh_mo_ta_en',
        'section_gioi_thieu_tieu_de',
        'section_gioi_thieu_mo_ta',
        'section_gioi_thieu_tieu_de_en',
        'section_gioi_thieu_mo_ta_en',
        'section_dich_vu_tieu_de',
        'section_dich_vu_mo_ta',
        'section_dich_vu_tieu_de_en',
        'section_dich_vu_mo_ta_en',
        'section_cam_nang_tieu_de',
        'section_cam_nang_mo_ta',
        'section_cam_nang_tieu_de_en',
        'section_cam_nang_mo_ta_en',
        'section_faq_tieu_de',
        'section_faq_mo_ta',
        'section_faq_tieu_de_en',
        'section_faq_mo_ta_en',
        'section_danh_gia_tieu_de',
        'section_danh_gia_mo_ta',
        'section_danh_gia_tieu_de_en',
        'section_danh_gia_mo_ta_en',
        'section_tuyen_dung_tieu_de',
        'section_tuyen_dung_mo_ta',
        'section_tuyen_dung_tieu_de_en',
        'section_tuyen_dung_mo_ta_en',
        'section_dat_lich_tieu_de',
        'section_dat_lich_mo_ta',
        'section_dat_lich_tieu_de_en',
        'section_dat_lich_mo_ta_en',
        'hero_slogan_x_desktop',
        'hero_slogan_y_desktop',
        'hero_slogan_align_desktop',
        'hero_slogan_x_mobile',
        'hero_slogan_y_mobile',
        'hero_slogan_align_mobile',
      ];

      const payload: Record<string, any> = {
        id: 'system',
        ngay_cap_nhat: new Date().toISOString(),
      };

      for (const col of VALID_CAU_HINH_COLUMNS) {
        if (col in configForm && (configForm as any)[col] !== undefined) {
          payload[col] = (configForm as any)[col];
        }
      }

      delete (payload as any).id;
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Lỗi lưu cấu hình');
      }

      await refreshConfig();
      const tabNames: Record<ConfigSubTab, string> = {
        contact: 'Hotline & Mạng xã hội',
        email: 'Email',
        zalo: 'Zalo OA (ZNS)',
        spam: 'Chống Spam Đặt Lịch',
        'notification-logs': 'Nhật ký gửi tin',
        about: 'Giới thiệu & Triết lý',
        slides: 'Slide ảnh giới thiệu',
        stats: 'Thông số thống kê',
        slogans: 'Khẩu hiệu & Slogan',
        announcement: 'Poster',
        privacy: 'Chính sách quyền riêng tư',
      };
      showNotification('success', `Đã lưu cài đặt ${tabNames[configSubTab] || 'hệ thống'} thành công!`);
    } catch (err: any) {
      console.error('Lỗi lưu cấu hình:', err);
      showNotification('error', `Lỗi lưu cấu hình: ${err.message}`);
    } finally {
      setIsConfigSaving(false);
    }
  };

  // -------------------------------------------------------------
  // CẤU HÌNH EMAIL GỬI THƯ (GMAIL SMTP)
  // -------------------------------------------------------------
  const [smtpForm, setSmtpForm] = useState({
    smtp_email: 'thaitrtin@gmail.com',
    smtp_password: '',
    smtp_sender_name: 'Bệnh Viện Thú Y PetM&M 5★',
    smtp_notify_email: 'thaitrtin@gmail.com',
    smtp_notify_recruitment_email: 'tuyendung@petmm.vn',
    smtp_notify_contact_email: 'thaitrtin@gmail.com',
    hasPassword: false,
    email_enabled: true,
    email_booking_mode: 'always' as 'always' | 'on_zalo_fail' | 'disabled',
    email_recruitment_enabled: true,
  });
  const [isSmtpLoading, setIsSmtpLoading] = useState(false);
  const [isSmtpSaving, setIsSmtpSaving] = useState(false);
  const [isSmtpTesting, setIsSmtpTesting] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  // Cấu hình Zalo Official Account (ZNS)
  const [zaloForm, setZaloForm] = useState({
    zalo_oa_id: '',
    zalo_app_id: '',
    zalo_secret_key: '',
    zalo_template_id: '',
    zalo_review_template_id: '',
    zalo_enabled: false,
    zalo_booking_enabled: true,
    zalo_review_enabled: true,
    zalo_access_token: '',
    zalo_refresh_token: '',
    zalo_test_phone: '',
  });
  const [isZaloSaving, setIsZaloSaving] = useState(false);
  const [isZaloTesting, setIsZaloTesting] = useState(false);
  const [testZaloTemplateType, setTestZaloTemplateType] = useState<'booking' | 'review'>('booking');
  const [showZaloSecret, setShowZaloSecret] = useState(false);
  const [showZaloToken, setShowZaloToken] = useState(false);

  // Cấu hình Chống Spam Đặt Lịch (IP, Số Điện Thoại, Email)
  const [antiSpamForm, setAntiSpamForm] = useState({
    spam_limit_enabled: true,
    spam_limit_ip: true,
    spam_limit_phone: true,
    spam_limit_email: true,
    spam_max_bookings_per_day: 3,
    spam_cooldown_seconds: 15,
  });
  const [isAntiSpamSaving, setIsAntiSpamSaving] = useState(false);

  // Cấu hình Template Email song ngữ gửi cho khách hàng
  const [emailTemplateForm, setEmailTemplateForm] = useState<{
    logoUrl: string;
    subjectVi: string;
    bannerTitleVi: string;
    bannerSubtitleVi: string;
    introVi: string;
    checklistVi: string;
    footerVi: string;
    subjectEn: string;
    bannerTitleEn: string;
    bannerSubtitleEn: string;
    introEn: string;
    checklistEn: string;
    footerEn: string;
  }>({
    logoUrl: '',
    subjectVi: '[PetM&M] Xác Nhận Lịch Hẹn #{booking_code} cho bé {pet_name}',
    bannerTitleVi: 'Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M',
    bannerSubtitleVi: 'Phiếu Tiếp Nhận Lịch Hẹn Khám & Chăm Sóc',
    introVi: 'Cảm ơn bạn đã tin tưởng đặt lịch thăm khám cho bé <strong>{pet_name}</strong> tại Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M. Đội ngũ y bác sĩ đã tiếp nhận thông tin và sẵn sàng hỗ trợ chu đáo nhất.',
    checklistVi: `• Vui lòng đến trước 5 - 10 phút để bé được kiểm tra sinh hiệu ban đầu.\n• Ba mẹ nhớ đeo xích hoặc dùng túi/balo vận chuyển cho bé để đảm bảo an toàn.\n• Nếu cần xét nghiệm máu hoặc phẫu thuật, vui lòng nhịn ăn cho bé trước 6 - 8 tiếng.`,
    footerVi: 'Nếu cần thay đổi giờ hẹn hoặc cần tư vấn khẩn cấp, vui lòng liên hệ ngay:',
    subjectEn: '[PetM&M] Appointment Confirmed - Code #{booking_code} for {pet_name}',
    bannerTitleEn: 'PetM&M Veterinary Clinic & Animal Hospital',
    bannerSubtitleEn: 'Appointment Booking Receipt',
    introEn: 'Thank you for booking an appointment for <strong>{pet_name}</strong> at PetM&M Pet Hospital Clinic. Our veterinary team has received your request and is ready to provide the best care.',
    checklistEn: `• Please arrive 5-10 minutes prior to your time slot for check-in.\n• Please leash dogs or keep cats in carriers for maximum safety.\n• If your pet needs fasting for blood tests or surgery, please refrain from feeding 6-8 hours in advance.`,
    footerEn: 'If you need to change your appointment or have an urgent query, please call our 24/7 hotline:',
  });
  const [templateLangTab, setTemplateLangTab] = useState<'vi' | 'en'>('vi');
  const [isTranslatingTemplate, setIsTranslatingTemplate] = useState(false);
  const [isTemplateSaving, setIsTemplateSaving] = useState(false);

  // Phân loại mẫu email đang chỉnh sửa: 'booking' (Đặt Lịch Khám) hoặc 'recruitment' (Tuyển Dụng & CV)
  const [activeTemplateType, setActiveTemplateType] = useState<'booking' | 'recruitment'>('booking');

  // Cấu hình Template Email Tiếp Nhận Tuyển Dụng & CV (Song ngữ)
  const [recruitmentTemplateForm, setRecruitmentTemplateForm] = useState<{
    logoUrl: string;
    subjectVi: string;
    bannerTitleVi: string;
    bannerSubtitleVi: string;
    introVi: string;
    checklistVi: string;
    footerVi: string;
    subjectEn: string;
    bannerTitleEn: string;
    bannerSubtitleEn: string;
    introEn: string;
    checklistEn: string;
    footerEn: string;
  }>({
    logoUrl: '',
    subjectVi: '[PetM&M] Xác Nhận Đã Nhận Hồ Sơ Ứng Tuyển: {job_title}',
    bannerTitleVi: 'Hệ Thống Y Tế & Bệnh Viện Thú Y PetM&M',
    bannerSubtitleVi: 'Phiếu Tiếp Nhận Hồ Sơ Ứng Tuyển & CV',
    introVi: 'Cảm ơn bạn <strong>{candidate_name}</strong> đã quan tâm và nộp hồ sơ ứng tuyển vị trí <strong>{job_title}</strong> tại Bệnh Viện Thú Y PetM&M. Ban Nhân Sự đã tiếp nhận đầy đủ thông tin của bạn.',
    checklistVi: `• Ban Nhân Sự sẽ cẩn trọng đánh giá hồ sơ và liên hệ với các ứng viên phù hợp qua điện thoại hoặc Zalo trong vòng 24 – 48 giờ làm việc.\n• Vui lòng chú ý điện thoại để không bỏ lỡ lịch hẹn phỏng vấn.\n• Mọi thắc mắc về tuyển dụng có thể liên hệ trực tiếp Hotline Tuyển Dụng: 0903 599 339.`,
    footerVi: 'Trân trọng,\nBan Nhân Sự & Tuyển Dụng Bệnh Viện Thú Y PetM&M',
    subjectEn: '[PetM&M] Application Received: {job_title}',
    bannerTitleEn: 'PetM&M Veterinary Hospital System',
    bannerSubtitleEn: 'Application & CV Receipt Confirmation',
    introEn: 'Dear <strong>{candidate_name}</strong>, thank you for your interest and applying for the position of <strong>{job_title}</strong> at PetM&M Veterinary Hospital. Our HR Department has successfully received your application.',
    checklistEn: `• Our HR team will carefully review your credentials and reach out within 24 – 48 business hours via phone or Zalo.\n• Please keep your phone available for interview arrangements.\n• For urgent recruitment queries, contact Hotline: 0903 599 339.`,
    footerEn: 'Best regards,\nHR & Talent Acquisition Team, PetM&M Veterinary Hospital',
  });

  const loadSmtpConfig = useCallback(async () => {
    setIsSmtpLoading(true);
    try {
      const res = await fetch('/api/admin/email-config');
      const data = await res.json();
      if (data.success && data.config) {
        setSmtpForm((prev) => ({
          ...prev,
          smtp_email: data.config.smtp_email || 'thaitrtin@gmail.com',
          smtp_sender_name: data.config.smtp_sender_name || 'Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M',
          smtp_notify_email: data.config.smtp_notify_email || 'thaitrtin@gmail.com',
          smtp_notify_recruitment_email: data.config.smtp_notify_recruitment_email || 'tuyendung@petmm.vn',
          smtp_notify_contact_email: data.config.smtp_notify_contact_email || data.config.smtp_notify_email || 'thaitrtin@gmail.com',
          hasPassword: Boolean(data.config.hasPassword),
          email_enabled: data.config.email_enabled !== undefined ? Boolean(data.config.email_enabled) : true,
          email_booking_mode: data.config.email_booking_mode || 'always',
          email_recruitment_enabled: data.config.email_recruitment_enabled !== undefined ? Boolean(data.config.email_recruitment_enabled) : true,
        }));
      }
      if (data.success && data.zalo) {
        setZaloForm({
          zalo_oa_id: data.zalo.zalo_oa_id || '',
          zalo_app_id: data.zalo.zalo_app_id || '',
          zalo_secret_key: data.zalo.zalo_secret_key || '',
          zalo_template_id: data.zalo.zalo_template_id || '',
          zalo_review_template_id: data.zalo.zalo_review_template_id || '',
          zalo_enabled: Boolean(data.zalo.zalo_enabled),
          zalo_booking_enabled: data.zalo.zalo_booking_enabled !== undefined ? Boolean(data.zalo.zalo_booking_enabled) : true,
          zalo_review_enabled: data.zalo.zalo_review_enabled !== undefined ? Boolean(data.zalo.zalo_review_enabled) : true,
          zalo_access_token: data.zalo.zalo_access_token || '',
          zalo_refresh_token: data.zalo.zalo_refresh_token || '',
          zalo_test_phone: data.zalo.zalo_test_phone || '',
        });
      }
      if (data.success && data.template) {
        setEmailTemplateForm((prev) => ({
          ...prev,
          ...data.template,
        }));
      }
      if (data.success && data.recruitmentTemplate) {
        setRecruitmentTemplateForm((prev) => ({
          ...prev,
          ...data.recruitmentTemplate,
        }));
      }
      if (data.success && data.antiSpam) {
        setAntiSpamForm({
          spam_limit_enabled: Boolean(data.antiSpam.spam_limit_enabled),
          spam_limit_ip: Boolean(data.antiSpam.spam_limit_ip),
          spam_limit_phone: Boolean(data.antiSpam.spam_limit_phone),
          spam_limit_email: Boolean(data.antiSpam.spam_limit_email),
          spam_max_bookings_per_day: typeof data.antiSpam.spam_max_bookings_per_day === 'number' ? data.antiSpam.spam_max_bookings_per_day : 3,
          spam_cooldown_seconds: typeof data.antiSpam.spam_cooldown_seconds === 'number' ? data.antiSpam.spam_cooldown_seconds : 15,
        });
      }
    } catch (err: any) {
      console.error('Lỗi tải cấu hình SMTP & Template:', err);
    } finally {
      setIsSmtpLoading(false);
    }
  }, []);

  useEffect(() => {
    if (configSubTab === 'email' || configSubTab === 'zalo' || configSubTab === 'spam') {
      loadSmtpConfig();
    }
  }, [configSubTab, loadSmtpConfig]);

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpForm.smtp_email) {
      showNotification('error', 'Vui lòng nhập địa chỉ Gmail gửi thư!');
      return;
    }
    setIsSmtpSaving(true);
    try {
      const res = await fetch('/api/admin/email-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showNotification('error', data.message || 'Không thể lưu cấu hình email!');
        return;
      }
      showNotification('success', 'Đã lưu cấu hình Email thành công!');
      loadSmtpConfig();
    } catch (err: any) {
      showNotification('error', 'Lỗi: ' + (err.message || 'Không thể lưu'));
    } finally {
      setIsSmtpSaving(false);
    }
  };

  const handleSaveZalo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsZaloSaving(true);
    try {
      const res = await fetch('/api/admin/email-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zalo: { ...zaloForm, zalo_enabled: true, zalo_booking_enabled: true, zalo_review_enabled: true } }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showNotification('error', data.message || 'Không thể lưu cấu hình Zalo OA!');
        return;
      }
      showNotification('success', 'Đã lưu cấu hình Zalo OA (ZNS) thành công!');
      loadSmtpConfig();
    } catch (err: any) {
      showNotification('error', 'Lỗi: ' + (err.message || 'Không thể lưu'));
    } finally {
      setIsZaloSaving(false);
    }
  };

  const handleSaveAntiSpam = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAntiSpamSaving(true);
    try {
      const res = await fetch('/api/admin/email-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ antiSpam: antiSpamForm }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showNotification('error', data.message || 'Không thể lưu cài đặt chống spam!');
        return;
      }
      showNotification(
        'success',
        antiSpamForm.spam_limit_enabled
          ? 'Đã bật & lưu cài đặt Chống Spam Đặt Lịch thành công!'
          : 'Đã tắt Chống Spam Đặt Lịch!'
      );
      loadSmtpConfig();
    } catch (err: any) {
      showNotification('error', 'Lỗi: ' + (err.message || 'Không thể lưu'));
    } finally {
      setIsAntiSpamSaving(false);
    }
  };

  const renderAntiSpamCard = () => (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header Thẻ */}
      <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
            antiSpamForm.spam_limit_enabled 
              ? 'bg-emerald-50 text-[#2D5A27] border-emerald-200' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Cài Đặt Chống Spam Đặt Lịch (IP, SĐT, Email & Giới Hạn)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý giới hạn đặt lịch theo IP, số điện thoại và email để bảo vệ hệ thống.
            </p>
          </div>
        </div>

        {/* Master Switch Bật / Tắt Chống Spam Tổng */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl transition shadow-2xs">
            <input
              type="checkbox"
              checked={antiSpamForm.spam_limit_enabled}
              onChange={(e) => setAntiSpamForm((prev) => ({ ...prev, spam_limit_enabled: e.target.checked }))}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
              antiSpamForm.spam_limit_enabled
                ? 'bg-[#2D5A27] border-[#2D5A27] text-white'
                : 'border-slate-300 bg-white text-transparent'
            }`}>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div className="text-xs font-bold">
              {antiSpamForm.spam_limit_enabled ? (
                <span className="text-[#2D5A27] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2D5A27] animate-pulse"></span>
                  Đang Bật Chống Spam (Bảo Vệ)
                </span>
              ) : (
                <span className="text-amber-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Đang Tắt Chống Spam
                </span>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* 3 TIÊU CHÍ CHỐNG SPAM RIÊNG LẺ */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#2D5A27]" />
          <span>Chọn các tiêu chí muốn kích hoạt chống spam:</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Tiêu chí 1: Địa chỉ IP */}
          <label className={`relative p-3.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
            antiSpamForm.spam_limit_ip && antiSpamForm.spam_limit_enabled
              ? 'border-emerald-300 bg-emerald-50/40 shadow-xs'
              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
          }`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={antiSpamForm.spam_limit_ip}
                  disabled={!antiSpamForm.spam_limit_enabled}
                  onChange={(e) => setAntiSpamForm((prev) => ({ ...prev, spam_limit_ip: e.target.checked }))}
                  className="rounded border-slate-300 text-[#2D5A27] focus:ring-[#2D5A27] w-4 h-4 cursor-pointer disabled:opacity-40"
                />
                <span className="text-xs font-bold text-slate-800">1. Chặn theo Địa Chỉ IP</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                antiSpamForm.spam_limit_ip && antiSpamForm.spam_limit_enabled
                  ? 'bg-emerald-100 text-[#2D5A27]'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {antiSpamForm.spam_limit_ip && antiSpamForm.spam_limit_enabled ? 'Bật' : 'Tắt'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              Chặn cùng 1 thiết bị mạng / wifi gửi quá số lần tối đa trong 1 ngày.
            </p>
          </label>

          {/* Tiêu chí 2: Số Điện Thoại */}
          <label className={`relative p-3.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
            antiSpamForm.spam_limit_phone && antiSpamForm.spam_limit_enabled
              ? 'border-emerald-300 bg-emerald-50/40 shadow-xs'
              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
          }`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={antiSpamForm.spam_limit_phone}
                  disabled={!antiSpamForm.spam_limit_enabled}
                  onChange={(e) => setAntiSpamForm((prev) => ({ ...prev, spam_limit_phone: e.target.checked }))}
                  className="rounded border-slate-300 text-[#2D5A27] focus:ring-[#2D5A27] w-4 h-4 cursor-pointer disabled:opacity-40"
                />
                <span className="text-xs font-bold text-slate-800">2. Chặn theo Số Điện Thoại</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                antiSpamForm.spam_limit_phone && antiSpamForm.spam_limit_enabled
                  ? 'bg-emerald-100 text-[#2D5A27]'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {antiSpamForm.spam_limit_phone && antiSpamForm.spam_limit_enabled ? 'Bật' : 'Tắt'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              Chặn nếu cùng 1 số điện thoại thực hiện đặt quá số lần tối đa trong 1 ngày.
            </p>
          </label>

          {/* Tiêu chí 3: Email */}
          <label className={`relative p-3.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
            antiSpamForm.spam_limit_email && antiSpamForm.spam_limit_enabled
              ? 'border-emerald-300 bg-emerald-50/40 shadow-xs'
              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
          }`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={antiSpamForm.spam_limit_email}
                  disabled={!antiSpamForm.spam_limit_enabled}
                  onChange={(e) => setAntiSpamForm((prev) => ({ ...prev, spam_limit_email: e.target.checked }))}
                  className="rounded border-slate-300 text-[#2D5A27] focus:ring-[#2D5A27] w-4 h-4 cursor-pointer disabled:opacity-40"
                />
                <span className="text-xs font-bold text-slate-800">3. Chặn theo Hòm Thư Email</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                antiSpamForm.spam_limit_email && antiSpamForm.spam_limit_enabled
                  ? 'bg-emerald-100 text-[#2D5A27]'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {antiSpamForm.spam_limit_email && antiSpamForm.spam_limit_enabled ? 'Bật' : 'Tắt'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              Chặn nếu cùng 1 địa chỉ email được dùng để đặt lịch vượt quá giới hạn ngày.
            </p>
          </label>
        </div>
      </div>

      {/* THIẾT LẬP THÔNG SỐ GIỚI HẠN (SỐ LẦN & COOLDOWN) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* 1. Số lần đặt tối đa / ngày */}
        <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>Số Lần Đặt Tối Đa Trong 1 Ngày: *</span>
            <span className="text-[11px] font-mono font-bold text-[#2D5A27]">
              {antiSpamForm.spam_max_bookings_per_day} lần/ngày
            </span>
          </label>
          <input
            type="number"
            min={1}
            max={100}
            required
            value={antiSpamForm.spam_max_bookings_per_day}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setAntiSpamForm((prev) => ({
                ...prev,
                spam_max_bookings_per_day: isNaN(val) ? 1 : Math.max(1, val),
              }));
            }}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-bold focus:border-[#2D5A27] focus:outline-none bg-white"
          />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Mặc định là <strong>3 lần</strong>. Nếu khách hoặc IP đặt sang lần thứ {antiSpamForm.spam_max_bookings_per_day + 1}, hệ thống sẽ từ chối và thông báo đạt giới hạn.
          </p>
        </div>

        {/* 2. Cooldown giây giữa 2 lần bấm */}
        <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>Thời Gian Chờ Giữa 2 Lần Đặt (Giây): *</span>
            <span className="text-[11px] font-mono font-bold text-[#2D5A27]">
              {antiSpamForm.spam_cooldown_seconds} giây
            </span>
          </label>
          <input
            type="number"
            min={0}
            max={300}
            required
            value={antiSpamForm.spam_cooldown_seconds}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setAntiSpamForm((prev) => ({
                ...prev,
                spam_cooldown_seconds: isNaN(val) ? 0 : Math.max(0, val),
              }));
            }}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-bold focus:border-[#2D5A27] focus:outline-none bg-white"
          />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Mặc định là <strong>15 giây</strong>. Ngăn chặn bot hoặc click liên tục nhiều lần cùng một thời điểm. Đặt là <strong>0</strong> nếu không muốn chờ.
          </p>
        </div>
      </div>

      {/* Nút Submit Lưu Cài Đặt Chống Spam */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
        <button
          type="button"
          onClick={() => handleSaveAntiSpam()}
          disabled={isAntiSpamSaving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition cursor-pointer"
        >
          {isAntiSpamSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isAntiSpamSaving ? 'Đang lưu...' : 'Lưu Cài Đặt Chống Spam'}</span>
        </button>
      </div>
    </div>
  );

  const handleTestZalo = async (targetPhone?: string, overrideTemplateType?: 'booking' | 'review') => {
    const activeType = overrideTemplateType || testZaloTemplateType;
    const phoneToTest = (typeof targetPhone === 'string' && targetPhone.trim())
      ? targetPhone.trim()
      : (zaloForm.zalo_test_phone || '').trim();
    if (!phoneToTest) {
      showNotification('error', 'Vui lòng nhập số điện thoại nhận tin ZNS thử nghiệm!');
      return;
    }
    const currentTemplateId = (activeType === 'review'
      ? (zaloForm.zalo_review_template_id || '')
      : (zaloForm.zalo_template_id || '')
    ).trim();
    const typeLabel = activeType === 'review' ? 'Đánh Giá Dịch Vụ' : 'Xác Nhận Lịch Hẹn';

    if (!currentTemplateId) {
      showNotification('error', `Vui lòng nhập Template ID cho Mẫu ${typeLabel} trước khi gửi thử!`);
      return;
    }

    setIsZaloTesting(true);
    try {
      const res = await fetch('/api/admin/zalo/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneToTest,
          templateType: activeType,
          zalo_oa_id: zaloForm.zalo_oa_id,
          zalo_app_id: zaloForm.zalo_app_id,
          zalo_secret_key: zaloForm.zalo_secret_key,
          zalo_template_id: zaloForm.zalo_template_id,
          zalo_review_template_id: zaloForm.zalo_review_template_id,
          zalo_access_token: zaloForm.zalo_access_token,
          zalo_refresh_token: zaloForm.zalo_refresh_token,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showNotification('error', data.message || `Gửi ZNS thử nghiệm [${typeLabel}] thất bại!`);
        return;
      }
      showNotification('success', data.message || `Đã gửi tin nhắn ZNS [${typeLabel}] thử nghiệm thành công tới ${phoneToTest}!`);
      if (data.tokensUpdated) {
        loadSmtpConfig();
      }
    } catch (err: any) {
      showNotification('error', 'Lỗi: ' + (err.message || 'Gửi Zalo thử nghiệm thất bại'));
    } finally {
      setIsZaloTesting(false);
    }
  };

  const handleTestSmtp = async (
    targetOverride?: string | React.MouseEvent,
    testType: 'booking' | 'recruitment' | 'contact' = 'booking'
  ) => {
    let actualTarget = smtpForm.smtp_notify_email;
    if (typeof targetOverride === 'string' && targetOverride.trim()) {
      actualTarget = targetOverride.trim();
    } else if (testType === 'recruitment') {
      actualTarget = smtpForm.smtp_notify_recruitment_email || smtpForm.smtp_email;
    } else if (testType === 'contact') {
      actualTarget = smtpForm.smtp_notify_contact_email || smtpForm.smtp_email;
    }

    setIsSmtpTesting(true);
    try {
      const res = await fetch('/api/admin/email-config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...smtpForm,
          type: testType,
          target_email: actualTarget,
          template: emailTemplateForm,
          recruitmentTemplate: recruitmentTemplateForm,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showNotification('error', data.message || 'Gửi thư thử nghiệm thất bại!');
        return;
      }
      showNotification('success', data.message || `Đã gửi thư thử nghiệm (${testType}) thành công tới "${actualTarget}"!`);
    } catch (err: any) {
      showNotification('error', 'Lỗi: ' + (err.message || 'Gửi thử thất bại'));
    } finally {
      setIsSmtpTesting(false);
    }
  };

  // Lưu cấu hình Mẫu Email Template (Cả Đặt Lịch & Tuyển Dụng)
  const handleSaveEmailTemplate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsTemplateSaving(true);
    try {
      const res = await fetch('/api/admin/email-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: emailTemplateForm,
          recruitmentTemplate: recruitmentTemplateForm,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showNotification('error', data.message || 'Không thể lưu mẫu email!');
        return;
      }
      showNotification('success', 'Đã lưu cấu hình Mẫu Thư (Đặt Lịch & Tuyển Dụng) thành công!');
      loadSmtpConfig();
    } catch (err: any) {
      showNotification('error', 'Lỗi: ' + (err.message || 'Không thể lưu'));
    } finally {
      setIsTemplateSaving(false);
    }
  };

  // Dịch mẫu email sang Tiếng Anh bằng AI (theo mẫu đang chọn)
  const handleTranslateEmailTemplate = async () => {
    setIsTranslatingTemplate(true);
    try {
      const isBooking = activeTemplateType === 'booking';
      const currentVi = isBooking ? emailTemplateForm : recruitmentTemplateForm;
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            subject: currentVi.subjectVi,
            bannerTitle: currentVi.bannerTitleVi,
            bannerSubtitle: currentVi.bannerSubtitleVi,
            intro: currentVi.introVi,
            checklist: currentVi.checklistVi,
            footer: currentVi.footerVi,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.translations) {
        if (isBooking) {
          setEmailTemplateForm((prev) => ({
            ...prev,
            subjectEn: data.translations.subject || prev.subjectEn,
            bannerTitleEn: data.translations.bannerTitle || prev.bannerTitleEn,
            bannerSubtitleEn: data.translations.bannerSubtitle || prev.bannerSubtitleEn,
            introEn: data.translations.intro || prev.introEn,
            checklistEn: data.translations.checklist || prev.checklistEn,
            footerEn: data.translations.footer || prev.footerEn,
          }));
        } else {
          setRecruitmentTemplateForm((prev) => ({
            ...prev,
            subjectEn: data.translations.subject || prev.subjectEn,
            bannerTitleEn: data.translations.bannerTitle || prev.bannerTitleEn,
            bannerSubtitleEn: data.translations.bannerSubtitle || prev.bannerSubtitleEn,
            introEn: data.translations.intro || prev.introEn,
            checklistEn: data.translations.checklist || prev.checklistEn,
            footerEn: data.translations.footer || prev.footerEn,
          }));
        }
        setTemplateLangTab('en');
        showNotification('success', 'Đã dịch mẫu email sang Tiếng Anh bằng AI thành công!');
      } else {
        showNotification('error', data.error || 'Không thể dịch bằng AI');
      }
    } catch (err: any) {
      showNotification('error', 'Lỗi dịch AI: ' + (err.message || 'Thất bại'));
    } finally {
      setIsTranslatingTemplate(false);
    }
  };

  // Gửi thử nghiệm mẫu email theo phân loại & ngôn ngữ đang chọn
  const handleTestTemplateEmail = async () => {
    setIsSmtpTesting(true);
    try {
      const isBooking = activeTemplateType === 'booking';
      const targetEmail = isBooking
        ? (smtpForm.smtp_notify_email || smtpForm.smtp_email)
        : (smtpForm.smtp_notify_recruitment_email || smtpForm.smtp_email);

      const res = await fetch('/api/admin/email-config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...smtpForm,
          type: isBooking ? 'booking' : 'recruitment',
          target_email: targetEmail,
          isEn: templateLangTab === 'en',
          template: emailTemplateForm,
          recruitmentTemplate: recruitmentTemplateForm,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showNotification('error', data.message || 'Gửi thư thử nghiệm thất bại!');
        return;
      }
      showNotification('success', data.message || 'Đã gửi thư thử nghiệm thành công! Vui lòng kiểm tra hộp thư.');
    } catch (err: any) {
      showNotification('error', 'Lỗi: ' + (err.message || 'Gửi thử thất bại'));
    } finally {
      setIsSmtpTesting(false);
    }
  };

  // -------------------------------------------------------------
  // TAB CẤU HÌNH THÔNG BÁO NỔI & LỊCH TẾT (POPUP & FLOATING BADGE)
  // -------------------------------------------------------------
  const [announcementForm, setAnnouncementForm] = useState<PopupAnnouncementConfig>(DEFAULT_ANNOUNCEMENT);
  const [isAnnouncementLoading, setIsAnnouncementLoading] = useState(false);
  const [isAnnouncementSaving, setIsAnnouncementSaving] = useState(false);
  const [announcementLangTab, setAnnouncementLangTab] = useState<'vi' | 'en'>('vi');
  const [isTranslatingAnnouncement, setIsTranslatingAnnouncement] = useState(false);

  const loadAnnouncementConfig = useCallback(async () => {
    setIsAnnouncementLoading(true);
    try {
      const res = await fetch('/api/announcement');
      const data = await res.json();
      if (data.success && data.data) {
        setAnnouncementForm(data.data);
      }
    } catch (err: any) {
      console.error('Lỗi tải cấu hình thông báo:', err);
    } finally {
      setIsAnnouncementLoading(false);
    }
  }, []);

  useEffect(() => {
    if (configSubTab === 'announcement') {
      loadAnnouncementConfig();
    }
  }, [configSubTab, loadAnnouncementConfig]);

  const handleSaveAnnouncement = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAnnouncementSaving(true);
    try {
      const res = await fetch('/api/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showNotification('error', data.message || 'Không thể lưu cấu hình thông báo!');
        return;
      }
      showNotification('success', 'Đã lưu cấu hình Poster thành công!');
      if (data.data) {
        setAnnouncementForm(data.data);
      }
    } catch (err: any) {
      showNotification('error', 'Lỗi lưu thông báo: ' + (err.message || 'Thao tác thất bại'));
    } finally {
      setIsAnnouncementSaving(false);
    }
  };

  const handleAutoTranslateAnnouncement = async () => {
    setIsTranslatingAnnouncement(true);
    try {
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            title: announcementForm.titleVi || '',
            badgeText: announcementForm.badgeTextVi || '',
            btnText: announcementForm.btnTextVi || '',
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.translations) {
        setAnnouncementForm((prev) => ({
          ...prev,
          titleEn: data.translations.title || prev.titleEn,
          badgeTextEn: data.translations.badgeText || prev.badgeTextEn,
          btnTextEn: data.translations.btnText || prev.btnTextEn,
        }));
        setAnnouncementLangTab('en');
        showNotification('success', 'Đã tự động dịch tiêu đề và nút bấm sang Tiếng Anh!');
      } else {
        throw new Error(data.error || 'Dịch thất bại');
      }
    } catch (err: any) {
      showNotification('error', 'Lỗi dịch: ' + (err.message || 'Thất bại'));
    } finally {
      setIsTranslatingAnnouncement(false);
    }
  };


  // -------------------------------------------------------------
  // TAB 4: QUẢN LÝ DỊCH VỤ CHUẨN 5 SAO
  // -------------------------------------------------------------
  const [services, setServices] = useState<DichVuRecord[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [editingService, setEditingService] = useState<Partial<DichVuRecord> | null>(null);
  const [isCreatingNewService, setIsCreatingNewService] = useState(false);
  const [isServiceSaving, setIsServiceSaving] = useState(false);
  const [isServiceImgUploading, setIsServiceImgUploading] = useState(false);
  const serviceImgFileInputRef = useRef<HTMLInputElement>(null);
  const [serviceFeaturesInput, setServiceFeaturesInput] = useState('');
  const [serviceWorkflowInput, setServiceWorkflowInput] = useState('');
  const [serviceFeaturesEnInput, setServiceFeaturesEnInput] = useState('');
  const [serviceWorkflowEnInput, setServiceWorkflowEnInput] = useState('');
  const [serviceLangTab, setServiceLangTab] = useState<'vi' | 'en'>('vi');
  const [isTranslatingService, setIsTranslatingService] = useState(false);

  const loadServices = useCallback(async (silent = false) => {
    if (!silent) setServicesLoading(true);
    try {
      const { data, error } = await supabase
        .from('dich_vu')
        .select('*')
        .order('thu_tu', { ascending: true });

      if (error) throw error;
      setServices((data as DichVuRecord[]) || []);
    } catch (err: any) {
      console.error('Lỗi tải dịch vụ:', err);
      if (!silent) showNotification('error', `Lỗi tải dịch vụ: ${err.message}`);
    } finally {
      if (!silent) setServicesLoading(false);
    }
  }, [showNotification]);

  const handleAddNewService = () => {
    const nextOrder = services.length > 0 ? Math.max(...services.map((s) => s.thu_tu || 0)) + 1 : 1;
    setEditingService({
      id: `service-${Date.now()}`,
      ten_dich_vu: '',
      ten_dich_vu_en: '',
      phu_de: '',
      phu_de_en: '',
      nhom_dich_vu: 'medical',
      huy_hieu: '',
      huy_hieu_en: '',
      mo_ta: '',
      mo_ta_en: '',
      hinh_anh: '/services_bg.jpg',
      can_chinh_anh: '50% 50%',
      gia_tham_khao: '',
      gia_tham_khao_en: '',
      thoi_luong: '',
      thoi_luong_en: '',
      tien_ich: [],
      tien_ich_en: [],
      quy_trinh: [],
      quy_trinh_en: [],
      noi_bat: false,
      thu_tu: nextOrder,
      kich_hoat: true,
    } as any);
    setServiceFeaturesInput('');
    setServiceWorkflowInput('');
    setServiceFeaturesEnInput('');
    setServiceWorkflowEnInput('');
    setServiceLangTab('vi');
    setIsCreatingNewService(true);
  };

  const handleEditService = (service: DichVuRecord) => {
    setEditingService({ ...service });
    setIsCreatingNewService(false);
    const feats = Array.isArray(service.tien_ich) ? service.tien_ich : [];
    const workflow = Array.isArray(service.quy_trinh) ? service.quy_trinh : [];
    setServiceFeaturesInput(feats.join('\n'));
    setServiceWorkflowInput(workflow.join('\n'));
    const featsEn = Array.isArray((service as any).tien_ich_en) ? (service as any).tien_ich_en : [];
    const workflowEn = Array.isArray((service as any).quy_trinh_en) ? (service as any).quy_trinh_en : [];
    setServiceFeaturesEnInput(featsEn.join('\n'));
    setServiceWorkflowEnInput(workflowEn.join('\n'));
    setServiceLangTab('vi');
  };

  const handleAutoTranslateService = async () => {
    if (!editingService?.ten_dich_vu) {
      showNotification('error', 'Vui lòng nhập Tên gói dịch vụ Tiếng Việt trước khi dịch!');
      return;
    }
    setIsTranslatingService(true);
    try {
      const featureLines = serviceFeaturesInput
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const workflowLines = serviceWorkflowInput
        .split('\n')
        .map((w) => w.trim())
        .filter(Boolean);

      const fieldsToTranslate: Record<string, string> = {
        ten_dich_vu: editingService.ten_dich_vu || '',
        phu_de: editingService.phu_de || '',
        huy_hieu: editingService.huy_hieu || '',
        gia_tham_khao: editingService.gia_tham_khao || '',
        thoi_luong: editingService.thoi_luong || '',
        mo_ta: editingService.mo_ta || '',
      };

      const [fieldsRes, featsRes, workRes] = await Promise.all([
        fetch('/api/admin/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: fieldsToTranslate }),
        }).then((r) => r.json()),
        featureLines.length > 0
          ? fetch('/api/admin/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ texts: featureLines }),
            }).then((r) => r.json())
          : Promise.resolve({ success: true, translations: [] }),
        workflowLines.length > 0
          ? fetch('/api/admin/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ texts: workflowLines }),
            }).then((r) => r.json())
          : Promise.resolve({ success: true, translations: [] }),
      ]);

      if (fieldsRes.success && fieldsRes.translations) {
        setEditingService((prev) =>
          prev
            ? ({
                ...prev,
                ten_dich_vu_en: fieldsRes.translations.ten_dich_vu || (prev as any).ten_dich_vu_en || '',
                phu_de_en: fieldsRes.translations.phu_de || (prev as any).phu_de_en || '',
                huy_hieu_en: fieldsRes.translations.huy_hieu || (prev as any).huy_hieu_en || '',
                gia_tham_khao_en: fieldsRes.translations.gia_tham_khao || (prev as any).gia_tham_khao_en || '',
                thoi_luong_en: fieldsRes.translations.thoi_luong || (prev as any).thoi_luong_en || '',
                mo_ta_en: fieldsRes.translations.mo_ta || (prev as any).mo_ta_en || '',
              } as any)
            : null
        );
      }

      if (featsRes.success && Array.isArray(featsRes.translations) && featsRes.translations.length > 0) {
        setServiceFeaturesEnInput(featsRes.translations.join('\n'));
      }

      if (workRes.success && Array.isArray(workRes.translations) && workRes.translations.length > 0) {
        setServiceWorkflowEnInput(workRes.translations.join('\n'));
      }

      setServiceLangTab('en');
      showNotification('success', 'Đã chuyển đổi toàn bộ thông tin dịch vụ sang Tiếng Anh thành công!');
    } catch (err: any) {
      console.error('Lỗi dịch dịch vụ:', err);
      showNotification('error', `Lỗi chuyển đổi ngôn ngữ: ${err.message}`);
    } finally {
      setIsTranslatingService(false);
    }
  };

  const handleServiceImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Chỉ chấp nhận tệp định dạng hình ảnh!');
      return;
    }

    setIsServiceImgUploading(true);
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `service_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `services/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('hinh_anh')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('hinh_anh')
        .getPublicUrl(filePath);

      setEditingService((prev) => (prev ? { ...prev, hinh_anh: publicUrlData.publicUrl } : null));
      showNotification('success', 'Đã tải ảnh dịch vụ lên thành công!');
    } catch (err: any) {
      console.error('Lỗi upload ảnh:', err);
      showNotification('error', `Lỗi tải ảnh: ${err.message}`);
    } finally {
      setIsServiceImgUploading(false);
      if (serviceImgFileInputRef.current) serviceImgFileInputRef.current.value = '';
    }
  };

  const handleSaveService = async () => {
    if (!editingService?.ten_dich_vu) {
      showNotification('error', 'Vui lòng nhập Tên dịch vụ!');
      return;
    }

    setIsServiceSaving(true);
    try {
      const parsedFeatures = serviceFeaturesInput
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const parsedWorkflow = serviceWorkflowInput
        .split('\n')
        .map((w) => w.trim())
        .filter(Boolean);

      const parsedFeaturesEn = serviceFeaturesEnInput
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const parsedWorkflowEn = serviceWorkflowEnInput
        .split('\n')
        .map((w) => w.trim())
        .filter(Boolean);

      const payload: Partial<DichVuRecord> = {
        ten_dich_vu: editingService.ten_dich_vu,
        ten_dich_vu_en: (editingService as any).ten_dich_vu_en || null,
        phu_de: editingService.phu_de || null,
        phu_de_en: (editingService as any).phu_de_en || null,
        nhom_dich_vu: editingService.nhom_dich_vu || 'medical',
        huy_hieu: editingService.huy_hieu || null,
        huy_hieu_en: (editingService as any).huy_hieu_en || null,
        mo_ta: editingService.mo_ta || null,
        mo_ta_en: (editingService as any).mo_ta_en || null,
        hinh_anh: editingService.hinh_anh || '/services_bg.jpg',
        anh_goc: editingService.anh_goc || editingService.hinh_anh || null,
        can_chinh_anh: editingService.can_chinh_anh || '50% 50%',
        gia_tham_khao: editingService.gia_tham_khao || null,
        gia_tham_khao_en: (editingService as any).gia_tham_khao_en || null,
        thoi_luong: editingService.thoi_luong || null,
        thoi_luong_en: (editingService as any).thoi_luong_en || null,
        tien_ich: parsedFeatures,
        tien_ich_en: parsedFeaturesEn,
        quy_trinh: parsedWorkflow,
        quy_trinh_en: parsedWorkflowEn,
        noi_bat: !!editingService.noi_bat,
        thu_tu: Number(editingService.thu_tu) || 0,
        kich_hoat: editingService.kich_hoat !== undefined ? editingService.kich_hoat : true,
        ngay_cap_nhat: new Date().toISOString(),
      };

      if (isCreatingNewService) {
        const customId = editingService.id || `service-${Date.now()}`;
        await mutateAdminContent('dich_vu', 'insert', undefined, { ...payload, id: customId });
        showNotification('success', 'Đã thêm dịch vụ mới thành công!');
      } else {
        await mutateAdminContent('dich_vu', 'update', editingService.id, payload);
        showNotification('success', 'Đã cập nhật dịch vụ thành công!');
      }

      setEditingService(null);
      setIsCreatingNewService(false);
      await loadServices();
    } catch (err: any) {
      console.error('Lỗi lưu dịch vụ:', err);
      showNotification('error', `Lỗi lưu dịch vụ: ${err.message}`);
    } finally {
      setIsServiceSaving(false);
    }
  };

  const handleToggleServiceActive = async (service: DichVuRecord) => {
    try {
      await mutateAdminContent('dich_vu', 'update', service.id, {
        kich_hoat: !service.kich_hoat,
        ngay_cap_nhat: new Date().toISOString(),
      });
      setServices((prev) => prev.map((s) => (s.id === service.id ? { ...s, kich_hoat: !s.kich_hoat } : s)));
      showNotification('success', `Đã ${!service.kich_hoat ? 'bật' : 'tắt'} dịch vụ này`);
    } catch (err: any) {
      showNotification('error', `Lỗi cập nhật: ${err.message}`);
    }
  };

  const handleDeleteService = async (service: DichVuRecord) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${service.ten_dich_vu}"?`)) return;
    try {
      await mutateAdminContent('dich_vu', 'delete', service.id);
      showNotification('success', 'Đã xóa dịch vụ thành công!');
      setServices((prev) => prev.filter((s) => s.id !== service.id));
      if (editingService?.id === service.id) setEditingService(null);
    } catch (err: any) {
      showNotification('error', `Lỗi xóa dịch vụ: ${err.message}`);
    }
  };

  // -------------------------------------------------------------
  // TAB 5: QUẢN LÝ CÂU HỎI THƯỜNG GẶP (FAQ)
  // -------------------------------------------------------------
  const [faqs, setFaqs] = useState<CauHoiThuongGapRecord[]>([]);
  const [faqsLoading, setFaqsLoading] = useState(true);
  const [isFaqSaving, setIsFaqSaving] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Partial<CauHoiThuongGapRecord> | null>(null);
  const [isCreatingNewFaq, setIsCreatingNewFaq] = useState(false);
  const [faqModalTab, setFaqModalTab] = useState<'vi' | 'en'>('vi');
  const [isTranslatingFaq, setIsTranslatingFaq] = useState(false);

  // Quản lý Sub-Tab FAQ & Cấu hình mục "Bạn cần PetM&M hỗ trợ?"
  const [faqSubTab, setFaqSubTab] = useState<'list' | 'support_panel'>('list');
  const [supportPanelData, setSupportPanelData] = useState<SupportPanelConfig>(DEFAULT_SUPPORT_CONFIG);
  const [supportPanelLoading, setSupportPanelLoading] = useState(false);
  const [isSavingSupportPanel, setIsSavingSupportPanel] = useState(false);
  const [isTranslatingSupport, setIsTranslatingSupport] = useState(false);
  const [supportPanelTab, setSupportPanelTab] = useState<'vi' | 'en'>('vi');

  const loadSupportPanelConfig = useCallback(async () => {
    try {
      setSupportPanelLoading(true);
      const { data, error } = await supabase
        .from('cau_hinh')
        .select('*')
        .eq('id', 'support_panel')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Lỗi tải cấu hình support_panel:', error);
        return;
      }

      if (data && data.slogan_cuoi_trang_noi_dung) {
        try {
          const parsed = JSON.parse(data.slogan_cuoi_trang_noi_dung);
          setSupportPanelData({ ...DEFAULT_SUPPORT_CONFIG, ...parsed });
        } catch {
          setSupportPanelData(DEFAULT_SUPPORT_CONFIG);
        }
      }
    } catch (err: any) {
      console.error('Lỗi loadSupportPanelConfig:', err);
    } finally {
      setSupportPanelLoading(false);
    }
  }, []);

  const handleAutoTranslateSupport = async () => {
    if (!supportPanelData.tieu_de_vi?.trim() && !supportPanelData.mo_ta_vi?.trim()) {
      showNotification('error', 'Vui lòng nhập ít nhất tiêu đề hoặc mô tả tiếng Việt trước khi dịch!');
      return;
    }
    setIsTranslatingSupport(true);
    try {
      const textsToTranslate: Record<string, string> = {
        tieu_de: supportPanelData.tieu_de_vi || '',
        mo_ta: supportPanelData.mo_ta_vi || '',
        card1_title: supportPanelData.card1_title_vi || '',
        card1_desc: supportPanelData.card1_desc_vi || '',
        card2_title: supportPanelData.card2_title_vi || '',
        card2_desc: supportPanelData.card2_desc_vi || '',
        card3_title: supportPanelData.card3_title_vi || '',
        card3_desc: supportPanelData.card3_desc_vi || '',
      };

      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: textsToTranslate, texts: textsToTranslate }),
      });

      const data = await res.json();
      if (!res.ok || !data.translations) {
        throw new Error(data.error || 'Dịch tự động thất bại');
      }

      setSupportPanelData((prev) => ({
        ...prev,
        tieu_de_en: data.translations.tieu_de || prev.tieu_de_en,
        mo_ta_en: data.translations.mo_ta || prev.mo_ta_en,
        card1_title_en: data.translations.card1_title || prev.card1_title_en,
        card1_desc_en: data.translations.card1_desc || prev.card1_desc_en,
        card2_title_en: data.translations.card2_title || prev.card2_title_en,
        card2_desc_en: data.translations.card2_desc || prev.card2_desc_en,
        card3_title_en: data.translations.card3_title || prev.card3_title_en,
        card3_desc_en: data.translations.card3_desc || prev.card3_desc_en,
      }));

      showNotification('success', 'Đã dùng AI dịch sang tiếng Anh thành công!');
      setSupportPanelTab('en');
    } catch (err: any) {
      console.error('Lỗi dịch support panel:', err);
      showNotification('error', `Lỗi dịch AI: ${err.message}`);
    } finally {
      setIsTranslatingSupport(false);
    }
  };

  const handleSaveSupportPanel = async () => {
    setIsSavingSupportPanel(true);
    try {
      const jsonStr = JSON.stringify(supportPanelData);
      const { error } = await supabase.from('cau_hinh').upsert({
        id: 'support_panel',
        tieu_de_trang: supportPanelData.tieu_de_vi,
        tieu_de_trang_en: supportPanelData.tieu_de_en,
        slogan_cuoi_trang_noi_dung: jsonStr,
        ngay_cap_nhat: new Date().toISOString(),
      });

      if (error) throw error;

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('petmm_support_config_updated', { detail: supportPanelData }));
      }

      showNotification('success', 'Đã lưu cấu hình mục "Bạn cần PetM&M hỗ trợ?" thành công!');
    } catch (err: any) {
      console.error('Lỗi lưu support panel:', err);
      showNotification('error', `Lỗi lưu: ${err.message}`);
    } finally {
      setIsSavingSupportPanel(false);
    }
  };

  const loadFaqs = useCallback(async (silent = false) => {
    try {
      if (!silent) setFaqsLoading(true);
      loadSupportPanelConfig();
      const { data, error } = await supabase
        .from('cau_hoi_thuong_gap')
        .select('*')
        .order('thu_tu', { ascending: true });

      if (error) throw error;
      setFaqs((data as CauHoiThuongGapRecord[]) || []);
    } catch (err: any) {
      console.error('Lỗi tải FAQ:', err);
      if (!silent) showNotification('error', `Lỗi tải câu hỏi thường gặp: ${err.message}`);
    } finally {
      if (!silent) setFaqsLoading(false);
    }
  }, [loadSupportPanelConfig, showNotification]);

  const handleAddNewFaq = () => {
    const nextOrder = faqs.length > 0 ? Math.max(...faqs.map((f) => f.thu_tu || 0)) + 1 : 1;
    setEditingFaq({
      cau_hoi: '',
      cau_hoi_en: '',
      cau_tra_loi: '',
      cau_tra_loi_en: '',
      chuyen_muc: 'Chung',
      chuyen_muc_en: 'General',
      thu_tu: nextOrder,
      kich_hoat: true,
    });
    setFaqModalTab('vi');
    setIsCreatingNewFaq(true);
  };

  const handleEditFaq = (faq: CauHoiThuongGapRecord) => {
    setEditingFaq({ ...faq });
    setFaqModalTab('vi');
    setIsCreatingNewFaq(false);
  };

  const handleAutoTranslateFaq = async () => {
    if (!editingFaq?.cau_hoi?.trim()) {
      showNotification('error', 'Vui lòng nhập Câu hỏi Tiếng Việt trước khi dịch!');
      return;
    }
    setIsTranslatingFaq(true);
    try {
      const fieldsToTranslate: Record<string, string> = {
        cau_hoi: editingFaq.cau_hoi || '',
        cau_tra_loi: editingFaq.cau_tra_loi || '',
        chuyen_muc: editingFaq.chuyen_muc || '',
      };
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fieldsToTranslate }),
      });
      const data = await res.json();
      if (data.success && data.translations) {
        setEditingFaq((prev) => (prev ? {
          ...prev,
          cau_hoi_en: data.translations.cau_hoi || prev.cau_hoi_en,
          cau_tra_loi_en: data.translations.cau_tra_loi || prev.cau_tra_loi_en,
          chuyen_muc_en: data.translations.chuyen_muc || prev.chuyen_muc_en,
        } : null));
        setFaqModalTab('en');
        showNotification('success', 'Đã chuyển đổi sang Tiếng Anh y khoa thành công!');
      } else {
        throw new Error(data.error || 'Dịch tự động thất bại');
      }
    } catch (err: any) {
      console.error('Lỗi dịch FAQ:', err);
      showNotification('error', `Lỗi dịch tự động: ${err.message}`);
    } finally {
      setIsTranslatingFaq(false);
    }
  };

  const handleSaveFaq = async () => {
    if (!editingFaq?.cau_hoi?.trim() || !editingFaq?.cau_tra_loi?.trim()) {
      showNotification('error', 'Vui lòng nhập cả Câu hỏi và Câu trả lời (Tiếng Việt)!');
      return;
    }

    setIsFaqSaving(true);
    try {
      const payload: Partial<CauHoiThuongGapRecord> = {
        cau_hoi: editingFaq.cau_hoi.trim(),
        cau_hoi_en: editingFaq.cau_hoi_en?.trim() || null,
        cau_tra_loi: editingFaq.cau_tra_loi.trim(),
        cau_tra_loi_en: editingFaq.cau_tra_loi_en?.trim() || null,
        chuyen_muc: editingFaq.chuyen_muc?.trim() || 'Chung',
        chuyen_muc_en: editingFaq.chuyen_muc_en?.trim() || null,
        thu_tu: Number(editingFaq.thu_tu) || 0,
        kich_hoat: editingFaq.kich_hoat !== undefined ? editingFaq.kich_hoat : true,
        ngay_cap_nhat: new Date().toISOString(),
      };

      if (isCreatingNewFaq) {
        await mutateAdminContent('cau_hoi_thuong_gap', 'insert', undefined, payload);
        showNotification('success', 'Đã thêm câu hỏi mới thành công!');
      } else {
        await mutateAdminContent('cau_hoi_thuong_gap', 'update', editingFaq.id, payload);
        showNotification('success', 'Đã cập nhật câu hỏi thành công!');
      }

      setEditingFaq(null);
      setIsCreatingNewFaq(false);
      await loadFaqs();
    } catch (err: any) {
      console.error('Lỗi lưu FAQ:', err);
      showNotification('error', `Lỗi lưu câu hỏi: ${err.message}`);
    } finally {
      setIsFaqSaving(false);
    }
  };

  const handleToggleFaqActive = async (faq: CauHoiThuongGapRecord) => {
    try {
      const newStatus = !faq.kich_hoat;
      await mutateAdminContent('cau_hoi_thuong_gap', 'update', faq.id, {
        kich_hoat: newStatus,
        ngay_cap_nhat: new Date().toISOString(),
      });
      setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, kich_hoat: newStatus } : f)));
      showNotification('success', `Đã ${newStatus ? 'bật' : 'tắt'} câu hỏi`);
    } catch (err: any) {
      showNotification('error', `Lỗi cập nhật trạng thái: ${err.message}`);
    }
  };

  const handleDeleteFaq = async (faq: CauHoiThuongGapRecord) => {
    if (!window.confirm(`Bạn có chắc muốn xóa câu hỏi "${faq.cau_hoi}" không?`)) return;

    try {
      await mutateAdminContent('cau_hoi_thuong_gap', 'delete', faq.id);
      showNotification('success', 'Đã xóa câu hỏi thành công!');
      setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
      if (editingFaq?.id === faq.id) setEditingFaq(null);
    } catch (err: any) {
      showNotification('error', `Lỗi xóa câu hỏi: ${err.message}`);
    }
  };

  // -------------------------------------------------------------
  // TAB 5: QUẢN LÝ LỊCH HẸN KHÁCH HÀNG (APPOINTMENTS)
  // -------------------------------------------------------------
  const [appointments, setAppointments] = useState<LichHenRecord[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'cho_xac_nhan' | 'da_xac_nhan' | 'da_kham' | 'da_huy'>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<LichHenRecord | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [bookingCoverImage, setBookingCoverImage] = useState(
    'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=1200'
  );
  const [isSavingBookingCover, setIsSavingBookingCover] = useState(false);
  const [isSendingConfirmEmail, setIsSendingConfirmEmail] = useState(false);

  // Quản lý Cửa sổ (Modal) Thiết kế Cột Phải & Ảnh Bìa Form Đặt Lịch
  const [isBookingDesignModalOpen, setIsBookingDesignModalOpen] = useState(false);
  const [bookingDesignLangTab, setBookingDesignLangTab] = useState<'vi' | 'en'>('vi');
  const [bookingDesignPreviewLang, setBookingDesignPreviewLang] = useState<'vi' | 'en'>('vi');
  const [isTranslatingBookingDesign, setIsTranslatingBookingDesign] = useState(false);
  const [bookingDesignForm, setBookingDesignForm] = useState({
    coverImage: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=1200',
    titleVi: 'Chăm Sóc Y Khoa Tiêu Chuẩn 5 Sao',
    titleEn: 'Fear-Free & High-Standard Medical Care',
    descVi: 'Đội ngũ bác sĩ thú y chính quy, quy trình Fear-Free giảm căng thẳng tuyệt đối cho các bé cưng.',
    descEn: 'Experienced veterinarians dedicated to safeguarding your pet’s health with compassion and cutting-edge equipment.',
    commit1Vi: 'Khám đúng giờ theo lịch hẹn, không bốc số',
    commit1En: 'Zero waiting time with priority booking',
    commit2Vi: 'Gửi phiếu tiếp nhận tự động qua Gmail',
    commit2En: 'Automated email confirmation sent to Gmail',
  });

  const handleAutoTranslateBookingDesign = async () => {
    setIsTranslatingBookingDesign(true);
    try {
      const fieldsToTranslate: Record<string, string> = {
        title: bookingDesignForm.titleVi || '',
        desc: bookingDesignForm.descVi || '',
        commit1: bookingDesignForm.commit1Vi || '',
        commit2: bookingDesignForm.commit2Vi || '',
      };
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fieldsToTranslate }),
      });
      const data = await res.json();
      if (data.success && data.translations) {
        setBookingDesignForm((prev) => ({
          ...prev,
          titleEn: data.translations.title ?? prev.titleEn,
          descEn: data.translations.desc ?? prev.descEn,
          commit1En: data.translations.commit1 ?? prev.commit1En,
          commit2En: data.translations.commit2 ?? prev.commit2En,
        }));
        setBookingDesignLangTab('en');
        setBookingDesignPreviewLang('en');
        showNotification('success', 'Đã chuyển đổi nội dung Cột Phải sang Tiếng Anh thành công!');
      } else {
        throw new Error(data.error || 'Dịch thất bại');
      }
    } catch (err: any) {
      showNotification('error', `Lỗi dịch: ${err.message}`);
    } finally {
      setIsTranslatingBookingDesign(false);
    }
  };

  const loadBookingCover = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('cau_hinh')
        .select('*')
        .eq('id', 'booking_config')
        .maybeSingle();

      if (data) {
        if (data.logo_favicon?.trim()) {
          setBookingCoverImage(data.logo_favicon.trim());
        }
        setBookingDesignForm((prev) => ({
          coverImage: data.logo_favicon?.trim() || prev.coverImage,
          titleVi: data.slogan_cuoi_trang_tieu_de?.trim() || prev.titleVi,
          titleEn: data.slogan_cuoi_trang_tieu_de_en?.trim() || prev.titleEn,
          descVi: data.slogan_cuoi_trang_noi_dung?.trim() || prev.descVi,
          descEn: data.slogan_cuoi_trang_noi_dung_en?.trim() || prev.descEn,
          commit1Vi: data.gioi_thieu_cam_ket_phu?.trim() || prev.commit1Vi,
          commit1En: data.gioi_thieu_cam_ket_phu_en?.trim() || prev.commit1En,
          commit2Vi: data.gioi_thieu_trich_dan?.trim() || prev.commit2Vi,
          commit2En: data.gioi_thieu_trich_dan_en?.trim() || prev.commit2En,
        }));
      }
    } catch (err) {
      console.warn('Lỗi tải cấu hình thiết kế form lịch hẹn:', err);
    }
  }, []);

  const handleSaveBookingDesign = async () => {
    setIsSavingBookingCover(true);
    try {
      const payload = {
        id: 'booking_config',
        logo_favicon: bookingDesignForm.coverImage.trim(),
        slogan_cuoi_trang_tieu_de: bookingDesignForm.titleVi.trim(),
        slogan_cuoi_trang_tieu_de_en: bookingDesignForm.titleEn.trim(),
        slogan_cuoi_trang_noi_dung: bookingDesignForm.descVi.trim(),
        slogan_cuoi_trang_noi_dung_en: bookingDesignForm.descEn.trim(),
        gioi_thieu_cam_ket_phu: bookingDesignForm.commit1Vi.trim(),
        gioi_thieu_cam_ket_phu_en: bookingDesignForm.commit1En.trim(),
        gioi_thieu_trich_dan: bookingDesignForm.commit2Vi.trim(),
        gioi_thieu_trich_dan_en: bookingDesignForm.commit2En.trim(),
        ngay_cap_nhat: new Date().toISOString(),
      };

      const { error } = await supabase.from('cau_hinh').upsert([payload]);
      if (error) throw error;

      setBookingCoverImage(bookingDesignForm.coverImage.trim());
      showNotification('success', 'Đã lưu thiết kế Cột Phải & Ảnh Bìa form đặt lịch thành công!');
      setIsBookingDesignModalOpen(false);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('petmm_booking_cover_updated', {
            detail: {
              url: bookingDesignForm.coverImage.trim(),
              titleVi: bookingDesignForm.titleVi.trim(),
              titleEn: bookingDesignForm.titleEn.trim(),
              descVi: bookingDesignForm.descVi.trim(),
              descEn: bookingDesignForm.descEn.trim(),
              commit1Vi: bookingDesignForm.commit1Vi.trim(),
              commit1En: bookingDesignForm.commit1En.trim(),
              commit2Vi: bookingDesignForm.commit2Vi.trim(),
              commit2En: bookingDesignForm.commit2En.trim(),
            },
          })
        );
      }
    } catch (err: any) {
      showNotification('error', `Lỗi lưu thiết kế: ${err.message}`);
    } finally {
      setIsSavingBookingCover(false);
    }
  };

  const extractEmailAndNote = (ghiChu?: string | null) => {
    if (!ghiChu) return { email: null, cleanNote: '', lang: 'vi' as 'vi' | 'en' };
    const emailMatch = ghiChu.match(/\[Email:\s*([^\]]+)\]/i);
    const email = emailMatch ? emailMatch[1].trim() : null;
    const langMatch = ghiChu.match(/\[Lang:\s*(en|vi)\]/i);
    const lang = (langMatch ? langMatch[1].toLowerCase() : 'vi') as 'vi' | 'en';
    const cleanNote = ghiChu
      .replace(/\[Lang:\s*[^\]]+\]/gi, '')
      .replace(/\[Email:\s*[^\]]+\]/gi, '')
      .replace(/\[IP:\s*[^\]]+\]/gi, '')
      .trim();
    return { email, cleanNote, lang };
  };

  // Hàm chuyển đổi Dịch Vụ sang Tiếng Việt cho danh sách quản trị
  const getAdminServiceVi = (serviceStr?: string | null): string => {
    if (!serviceStr || !serviceStr.trim()) return 'Khám Tổng Quát & Tư Vấn';
    const cleanRaw = serviceStr.replace(/^[;,\s]+|[;,\s]+$/g, '');
    const parts = cleanRaw.split(/,\s*|\s*;\s*/).map((s) => s.trim().replace(/^[;,\s]+|[;,\s]+$/g, '')).filter(Boolean);
    const translated = parts.map((srv) => {
      const found = services.find(
        (s) =>
          s.ten_dich_vu_en?.toLowerCase() === srv.toLowerCase() ||
          s.ten_dich_vu.toLowerCase() === srv.toLowerCase()
      );
      if (found) return found.ten_dich_vu;

      const lower = srv.toLowerCase();
      if (lower === 'try the service' || lower.includes('try the service')) return 'Khám & Trải Nghiệm Dịch Vụ';
      if (lower.includes('general health') || lower.includes('consultation') || lower.includes('tổng quát') || lower.includes('khám')) {
        return 'Khám Sức Khỏe Tổng Quát & Tư Vấn';
      }
      if (lower.includes('preventive vaccination') || lower.includes('vaccin') || lower.includes('tiêm')) {
        return 'Tiêm Chủng Vaccine Dự Phòng Chuẩn GSP';
      }
      if (lower.includes('imaging') || lower.includes('diagnost') || lower.includes('xét nghiệm') || lower.includes('chẩn đoán')) {
        return 'Xét Nghiệm & Chẩn Đoán Hình Ảnh Kỹ Thuật Số';
      }
      if (lower.includes('surger') || lower.includes('neuter') || lower.includes('phẫu thuật') || lower.includes('triệt sản')) {
        return 'Phẫu Thuật Ngoại Khoa & Triệt Sản An Toàn';
      }
      if (lower.includes('emergency') || lower.includes('inpatient') || lower.includes('cấp cứu') || lower.includes('nội trú')) {
        return 'Điều Trị Nội Trú & Hồi Sức Cấp Cứu 24/7';
      }
      if (lower.includes('spa') || lower.includes('groom') || lower.includes('cắt tỉa')) {
        return 'Spa Grooming & Cắt Tỉa Tạo Kiểu 5 Sao';
      }
      if (lower.includes('hotel') || lower.includes('khách sạn') || lower.includes('lưu trú')) {
        return 'Khách Sạn Thú Cưng & Lưu Trú Tiêu Chuẩn';
      }
      return srv;
    });
    return Array.from(new Set(translated)).join(', ');
  };

  // Hàm chuyển đổi Cơ Sở sang Tiếng Việt chuẩn cho danh sách quản trị
  const getAdminBranchVi = (branchStr?: string | null, branchId?: string | null): string => {
    if (!branchStr && !branchId) return 'Hệ Thống Bệnh Viện Thú Y PetM&M';
    const found = branches.find(
      (b) =>
        (branchId && b.id === branchId) ||
        (branchStr &&
          ((b.ten_chi_nhanh && branchStr.includes(b.ten_chi_nhanh)) ||
            (b.ten_ngan && branchStr.includes(b.ten_ngan)) ||
            (b.ten_chi_nhanh_en && branchStr.includes(b.ten_chi_nhanh_en)) ||
            (b.ten_ngan_en && branchStr.includes(b.ten_ngan_en))))
    );
    if (found) {
      const title = found.ten_ngan || found.ten_chi_nhanh;
      const addr = found.dia_chi;
      return addr ? `${title} — ${addr}` : title;
    }

    let str = (branchStr || '').trim();
    str = str.replace(/City facility\.?\s*Thu Duc/gi, 'Cơ sở TP. Thủ Đức — 19 Đ. Số 1, Phường Phước Long, TP. Thủ Đức, TP. Hồ Chí Minh');
    str = str.replace(/Thu Duc City Branch/gi, 'Cơ sở TP. Thủ Đức');
    str = str.replace(/PetM&M Pet Hospital Clinic/gi, 'Hệ Thống Bệnh Viện Thú Y PetM&M');
    str = str.replace(/PetM&M Veterinary Clinic System/gi, 'Hệ Thống Bệnh Viện Thú Y PetM&M');
    str = str.replace(/PetM&M Veterinary Clinic/gi, 'Bệnh Viện Thú Y PetM&M');
    str = str.replace(/Phuoc Long Ward/gi, 'Phường Phước Long');
    str = str.replace(/City\.?\s*Thu Duc/gi, 'TP. Thủ Đức');
    str = str.replace(/Thu Duc City/gi, 'TP. Thủ Đức');
    return str || 'Hệ Thống Bệnh Viện Thú Y PetM&M';
  };

  // State chỉnh sửa chi tiết lịch hẹn từ trang Admin
  const [editAppForm, setEditAppForm] = useState<{
    ownerName: string;
    phone: string;
    email: string;
    petName: string;
    petType: string;
    branchId: string;
    branchName: string;
    services: string[];
    customService: string;
    date: string;
    timeSlot: string;
    note: string;
    status: 'cho_xac_nhan' | 'da_xac_nhan' | 'da_kham' | 'da_huy';
    lang: 'vi' | 'en';
  }>({
    ownerName: '',
    phone: '',
    email: '',
    petName: '',
    petType: 'dog',
    branchId: '',
    branchName: '',
    services: [],
    customService: '',
    date: '',
    timeSlot: '',
    note: '',
    status: 'cho_xac_nhan',
    lang: 'vi',
  });
  const ADMIN_TIME_SLOTS = [
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

  const [isSavingAppointment, setIsSavingAppointment] = useState(false);
  const [isSendingZalo, setIsSendingZalo] = useState(false);
  const [isSendingConfirmEmailDetail, setIsSendingConfirmEmailDetail] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isTimeSlotDropdownOpen, setIsTimeSlotDropdownOpen] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [isTranslatingToEng, setIsTranslatingToEng] = useState(false);
  const [noteCache, setNoteCache] = useState<{ vi: string; en: string }>({ vi: '', en: '' });

  // Trạng thái thông báo nổi góc dưới phải (Toast + Âm thanh + Native Windows)
  const [floatingNotification, setFloatingNotification] = useState<FloatingAppointmentNotification | null>(null);
  const [failureNotification, setFailureNotification] = useState<NotificationFailureItem | null>(null);
  const [browserNotifPermission, setBrowserNotifPermission] = useState<NotificationPermission>('default');
  const [adminNotifSettings, setAdminNotifSettings] = useState<AdminNotifSettings>(DEFAULT_ADMIN_NOTIF_SETTINGS);
  const [isNotifSettingsModalOpen, setIsNotifSettingsModalOpen] = useState(false);
  const knownAppointmentIdsRef = useRef<Set<string>>(new Set());
  const isInitialAppointmentsLoadedRef = useRef<boolean>(false);
  const dismissedAppointmentIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('petmm_dismissed_appointment_notifications');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            dismissedAppointmentIdsRef.current = new Set(parsed);
          }
        }
      } catch {}
      if ('Notification' in window) {
        setBrowserNotifPermission(Notification.permission);
      }
    }
    setAdminNotifSettings(getLocalAdminNotifSettings());
  }, []);

  const handleDismissFloatingNotification = useCallback((appointmentId?: string) => {
    if (appointmentId) {
      dismissedAppointmentIdsRef.current.add(appointmentId);
      try {
        sessionStorage.setItem(
          'petmm_dismissed_appointment_notifications',
          JSON.stringify(Array.from(dismissedAppointmentIdsRef.current))
        );
      } catch {}
    }
    setFloatingNotification(null);
  }, []);

  // Mở modal và nạp toàn bộ thông tin lịch hẹn vào form chỉnh sửa
  const handleOpenAppointmentModal = (app: LichHenRecord) => {
    setSelectedAppointment(app);
    const { email, cleanNote, lang } = extractEmailAndNote(app.ghi_chu);

    // Tách và làm sạch danh sách dịch vụ đã chọn (loại bỏ ký tự ; , thừa)
    const cleanRawStr = (app.dich_vu || '').replace(/^[;,\s]+|[;,\s]+$/g, '');
    const rawServices = cleanRawStr
      .split(/,\s*|\s*;\s*/)
      .map((s) => s.trim().replace(/^[;,\s]+|[;,\s]+$/g, ''))
      .filter(Boolean);

    // Chuẩn hóa dịch vụ theo đúng ngôn ngữ của lịch hẹn (tránh lẫn Tiếng Anh khi ở Tiếng Việt)
    let initialServices: string[] = [];
    if (rawServices.length > 0) {
      if (lang === 'vi') {
        initialServices = rawServices.map((srv) => {
          const found = services.find((s) => s.ten_dich_vu_en && s.ten_dich_vu_en.toLowerCase() === srv.toLowerCase());
          if (found) return found.ten_dich_vu;
          const lower = srv.toLowerCase();
          if (lower.includes('general health') || lower.includes('consultation')) return 'Khám Tổng Quát & Tư Vấn';
          if (lower.includes('vaccination')) return 'Tiêm Chủng Vaccine Dự Phòng Chuẩn GSP';
          if (lower.includes('imaging') || lower.includes('diagnostics')) return 'Xét Nghiệm & Chẩn Đoán Hình Ảnh Kỹ Thuật Số';
          if (lower.includes('surgery') || lower.includes('neutering')) return 'Phẫu Thuật Ngoại Khoa & Triệt Sản An Toàn';
          if (lower.includes('emergency')) return 'Điều Trị Nội Trú & Hồi Sức Cấp Cứu 24/7';
          if (lower.includes('spa') || lower.includes('grooming')) return 'Spa & Cắt Tỉa Tạo Kiểu Lông Thú Cưng';
          return srv;
        });
      } else {
        initialServices = rawServices.map((srv) => {
          const found = services.find((s) => s.ten_dich_vu.toLowerCase() === srv.toLowerCase());
          if (found && found.ten_dich_vu_en) return found.ten_dich_vu_en;
          const lower = srv.toLowerCase();
          if (lower.includes('tổng quát') || lower.includes('khám')) return 'General Health Check & Consultation';
          if (lower.includes('tiêm') || lower.includes('vaccine')) return 'GSP Standard Preventive Vaccination';
          if (lower.includes('xét nghiệm') || lower.includes('hình ảnh')) return 'Digital Imaging & Diagnostics';
          if (lower.includes('phẫu thuật') || lower.includes('triệt sản')) return 'Safe Surgery & Neutering';
          if (lower.includes('cấp cứu') || lower.includes('nội trú')) return 'Inpatient Care & 24/7 Emergency';
          if (lower.includes('spa') || lower.includes('cắt tỉa')) return '5-Star Spa Grooming & Styling';
          return srv;
        });
      }
    } else {
      initialServices = [lang === 'en' ? 'General Health Check & Consultation' : 'Khám Tổng Quát & Tư Vấn'];
    }

    // Xác định tên chi nhánh ban đầu kèm địa chỉ đầy đủ
    let initialBranchName = app.ten_chi_nhanh || '';
    const foundBranch = branches.find((b) => b.id === app.chi_nhanh_id || (b.ten_chi_nhanh && initialBranchName.includes(b.ten_chi_nhanh)));
    if (foundBranch) {
      if (lang === 'en') {
        const title = foundBranch.ten_chi_nhanh_en || foundBranch.ten_ngan_en || foundBranch.ten_chi_nhanh;
        const addr = foundBranch.dia_chi_en || foundBranch.dia_chi;
        initialBranchName = addr ? `${title} — ${addr}` : title;
      } else {
        const title = foundBranch.ten_ngan || foundBranch.ten_chi_nhanh;
        const addr = foundBranch.dia_chi;
        initialBranchName = addr ? `${title} — ${addr}` : title;
      }
    }

    // Tên thú cưng & Loại thú cưng: Mặc định để trống nếu chưa có thông tin thực tế
    const rawPet = (app.ten_thu_cung || '').trim();
    const lowerPet = rawPet.toLowerCase();
    const cleanPetName =
      rawPet &&
      lowerPet !== 'bé cưng' &&
      lowerPet !== 'be cung' &&
      lowerPet !== 'beloved pet' &&
      lowerPet !== 'pet'
        ? rawPet
        : '';

    const cleanPetType = cleanPetName && app.loai_thu_cung && ['dog', 'cat', 'other'].includes(app.loai_thu_cung)
      ? app.loai_thu_cung
      : '';

    setNoteCache({
      vi: lang === 'vi' ? (cleanNote || '') : '',
      en: lang === 'en' ? (cleanNote || '') : '',
    });

    setEditAppForm({
      ownerName: app.ho_ten_chu || '',
      phone: app.so_dien_thoai || '',
      email: email || '',
      petName: cleanPetName,
      petType: cleanPetType,
      branchId: app.chi_nhanh_id || '',
      branchName: initialBranchName,
      services: Array.from(new Set(initialServices)),
      customService: '',
      date: app.ngay_hen || '',
      timeSlot: app.gio_hen || (lang === 'en' ? 'Flexible' : 'Linh hoạt'),
      note: cleanNote || '',
      status: (app.trang_thai as any) || 'cho_xac_nhan',
      lang,
    });
    setIsCancelModalOpen(false);
    setCancelReason('');
    setIsTimeSlotDropdownOpen(false);
    setIsServiceDropdownOpen(false);
  };

  // Đồng bộ ref để mở modal lịch hẹn từ mọi nguồn (chuông thông báo, toast góc dưới, Windows notification)
  useEffect(() => {
    openAppointmentByIdRef.current = (id: string) => {
      const found = appointments.find((a) => a.id === id);
      if (found) {
        handleOpenAppointmentModal(found);
      }
    };
  }, [appointments]);

  // Hàm chuyển tab, highlight hàng và mở luôn modal chi tiết khi click thông báo
  const handleOpenAppointmentFromNotification = useCallback((app: LichHenRecord) => {
    setActiveTab('appointments');
    setHighlightedId(app.id);
    setTimeout(() => {
      const el = document.getElementById(`appointment-row-${app.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 250);
    handleOpenAppointmentModal(app);
  }, []);

  // Hàm kích hoạt trọn bộ thông báo: Toast góc dưới phải + Chuông âm thanh + Windows notification
  const triggerNewAppointmentNotification = useCallback(
    (app: LichHenRecord) => {
      if (!app || !app.id) return;
      // 1. Không hiển thị lại nếu người dùng đã bấm tắt (X) lịch hẹn này trong phiên làm việc
      if (dismissedAppointmentIdsRef.current.has(app.id)) return;

      // 2. Chỉ thông báo nếu lịch hẹn đang ở trạng thái 'cho_xac_nhan'
      if (app.trang_thai && app.trang_thai !== 'cho_xac_nhan') return;

      // 3. Chỉ thông báo nếu lịch hẹn mới được tạo trong vòng 30 phút gần đây (tránh nhắc lại lịch cũ hôm trước)
      if (app.ngay_tao) {
        const createdMs = new Date(app.ngay_tao).getTime();
        if (!isNaN(createdMs) && Date.now() - createdMs > 30 * 60 * 1000) {
          return;
        }
      }

      const notifData: FloatingAppointmentNotification = {
        id: app.id,
        customerName: app.ho_ten_chu,
        phone: app.so_dien_thoai,
        service: app.dich_vu,
        date: app.ngay_hen,
        timeSlot: app.gio_hen,
        branchName: app.ten_chi_nhanh,
        petName: app.ten_thu_cung,
        code: app.ma_lich_hen,
        rawItem: app,
      };

      // Đọc cấu hình cài đặt thông báo tức thời
      const currentConfig = getLocalAdminNotifSettings();

      // 1. Hiện popup nổi ở góc dưới bên phải màn hình (nếu BẬT thông báo Web)
      if (currentConfig.webEnabled) {
        setFloatingNotification(notifData);
      }

      // 2. Gửi thông báo nổi của Windows / Trình duyệt nếu BẬT thông báo Trình duyệt
      if (currentConfig.browserEnabled) {
        sendBrowserNotification(notifData, () => {
          handleOpenAppointmentFromNotification(app);
        });
        if (currentConfig.browserSound) {
          playNotificationSound();
        }
      }
    },
    [handleOpenAppointmentFromNotification]
  );

  // Chuyển đổi ngôn ngữ modal lịch hẹn (🇻🇳 <-> 🇬🇧) tự động map chi nhánh kèm địa chỉ & dịch vụ
  const handleChangeModalLanguage = (newLang: 'vi' | 'en') => {
    setEditAppForm((prev) => {
      // 1. Chuyển đổi tên cơ sở kèm địa chỉ đầy đủ
      let newBranchName = prev.branchName;
      const curBranch = branches.find(
        (b) => b.id === prev.branchId || (b.ten_chi_nhanh && prev.branchName.includes(b.ten_chi_nhanh))
      );
      if (curBranch) {
        if (newLang === 'en') {
          const title = curBranch.ten_chi_nhanh_en || curBranch.ten_ngan_en || curBranch.ten_chi_nhanh;
          const addr = curBranch.dia_chi_en || curBranch.dia_chi;
          newBranchName = addr ? `${title} — ${addr}` : title;
        } else {
          const title = curBranch.ten_ngan || curBranch.ten_chi_nhanh;
          const addr = curBranch.dia_chi;
          newBranchName = addr ? `${title} — ${addr}` : title;
        }
      }

      // 2. Chuyển đổi các dịch vụ đã chọn chuẩn xác 100%
      const newServices = prev.services.map((srv) => {
        if (newLang === 'en') {
          const found = services.find((s) => s.ten_dich_vu.toLowerCase() === srv.toLowerCase());
          if (found && found.ten_dich_vu_en) return found.ten_dich_vu_en;
          const lower = srv.toLowerCase();
          if (lower.includes('tổng quát') || lower.includes('khám')) return 'General Health Check & Consultation';
          if (lower.includes('tiêm') || lower.includes('vaccine')) return 'GSP Standard Preventive Vaccination';
          if (lower.includes('xét nghiệm') || lower.includes('hình ảnh')) return 'Digital Imaging & Diagnostics';
          if (lower.includes('phẫu thuật') || lower.includes('triệt sản')) return 'Safe Surgery & Neutering';
          if (lower.includes('cấp cứu') || lower.includes('nội trú')) return 'Inpatient Care & 24/7 Emergency';
          if (lower.includes('spa') || lower.includes('cắt tỉa')) return '5-Star Spa Grooming & Styling';
          return srv;
        } else {
          const found = services.find((s) => s.ten_dich_vu_en && s.ten_dich_vu_en.toLowerCase() === srv.toLowerCase());
          if (found && found.ten_dich_vu) return found.ten_dich_vu;
          const lower = srv.toLowerCase();
          if (lower.includes('general health') || lower.includes('consultation')) return 'Khám Tổng Quát & Tư Vấn';
          if (lower.includes('vaccination')) return 'Tiêm Chủng Vaccine Dự Phòng Chuẩn GSP';
          if (lower.includes('imaging') || lower.includes('diagnostics')) return 'Xét Nghiệm & Chẩn Đoán Hình Ảnh Kỹ Thuật Số';
          if (lower.includes('surgery') || lower.includes('neutering')) return 'Phẫu Thuật Ngoại Khoa & Triệt Sản An Toàn';
          if (lower.includes('emergency')) return 'Điều Trị Nội Trú & Hồi Sức Cấp Cứu 24/7';
          if (lower.includes('spa') || lower.includes('grooming')) return 'Spa & Cắt Tỉa Tạo Kiểu Lông Thú Cưng';
          return srv;
        }
      });

      // 3. Khung giờ mặc định
      let newTimeSlot = prev.timeSlot;
      if (newLang === 'en' && newTimeSlot === 'Linh hoạt') newTimeSlot = 'Flexible';
      if (newLang === 'vi' && newTimeSlot === 'Flexible') newTimeSlot = 'Linh hoạt';

      // 4. Khôi phục Ghi chú theo ngôn ngữ tương ứng
      let nextNote = prev.note;
      if (newLang === 'vi' && noteCache.vi) {
        nextNote = noteCache.vi;
      } else if (newLang === 'en' && noteCache.en) {
        nextNote = noteCache.en;
      }

      return {
        ...prev,
        lang: newLang,
        branchName: newBranchName,
        services: Array.from(new Set(newServices)),
        petName: prev.petName,
        timeSlot: newTimeSlot,
        note: nextNote,
      };
    });
  };

  // Chuyển đổi sang ENG và tự động dịch Ghi chú / Triệu chứng sang Tiếng Anh
  const handleTranslateAllToEng = async () => {
    const curViNote = editAppForm.note || noteCache.vi || '';
    if (curViNote) {
      setNoteCache((prev) => ({ ...prev, vi: curViNote }));
    }

    handleChangeModalLanguage('en');

    if (curViNote && curViNote.trim()) {
      setIsTranslatingToEng(true);
      try {
        const res = await fetch('/api/admin/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: curViNote.trim() }),
        });
        const data = await res.json();
        if (data.success && data.translation) {
          setNoteCache((prev) => ({ ...prev, vi: curViNote, en: data.translation }));
          setEditAppForm((prev) => ({ ...prev, note: data.translation }));
          showNotification('success', 'Đã chuyển đổi sang Bản English và dịch Ghi chú sang Tiếng Anh!');
        } else {
          showNotification('success', 'Đã chuyển đổi thông tin sang Bản English!');
        }
      } catch (err) {
        console.error('Lỗi dịch sang Tiếng Anh:', err);
        showNotification('success', 'Đã chuyển đổi sang Bản English (Ghi chú giữ nguyên).');
      } finally {
        setIsTranslatingToEng(false);
      }
    } else {
      showNotification('success', 'Đã chuyển đổi thông tin sang Bản English!');
    }
  };

  // Bật/tắt dịch vụ trong form chỉnh sửa
  const toggleServiceInEditForm = (srvName: string) => {
    setEditAppForm((prev) => {
      const exists = prev.services.includes(srvName);
      const newServices = exists
        ? prev.services.filter((s) => s !== srvName)
        : [...prev.services, srvName];
      return { ...prev, services: newServices };
    });
  };

  // Thêm dịch vụ tùy chỉnh
  const addCustomServiceInEditForm = () => {
    if (!editAppForm.customService.trim()) return;
    const name = editAppForm.customService.trim();
    if (!editAppForm.services.includes(name)) {
      setEditAppForm((prev) => ({
        ...prev,
        services: [...prev.services, name],
        customService: '',
      }));
    } else {
      setEditAppForm((prev) => ({ ...prev, customService: '' }));
    }
  };

  // Lưu toàn bộ thông tin lịch hẹn đã sửa & Chuyển sang 'Đã xác nhận'
  const handleSaveAppointmentDetail = async () => {
    if (!selectedAppointment) return;
    setIsSavingAppointment(true);
    try {
      const isEn = editAppForm.lang === 'en';
      const finalServicesStr =
        editAppForm.services.filter(Boolean).join(', ') ||
        (isEn ? 'General Health Check & Consultation' : 'Khám Tổng Quát & Tư Vấn');
      const finalGhiChu = `[Lang: ${editAppForm.lang}] ${editAppForm.email ? `[Email: ${editAppForm.email.trim()}] ` : ''}${editAppForm.note.trim()}`;

      // Chuyển sang 'da_xac_nhan' nếu đang ở 'cho_xac_nhan'
      const nextStatus = editAppForm.status === 'cho_xac_nhan' ? 'da_xac_nhan' : editAppForm.status;

      const updatePayload = {
        ho_ten_chu: editAppForm.ownerName.trim(),
        so_dien_thoai: editAppForm.phone.trim(),
        ten_thu_cung: editAppForm.petName.trim() || '',
        loai_thu_cung: editAppForm.petType || '',
        chi_nhanh_id: editAppForm.branchId || null,
        ten_chi_nhanh: editAppForm.branchName || 'Bệnh Viện Thú Y PetM&M',
        dich_vu: finalServicesStr,
        ngay_hen: editAppForm.date,
        gio_hen: editAppForm.timeSlot || 'Linh hoạt',
        ghi_chu: finalGhiChu,
        trang_thai: nextStatus,
        ngay_cap_nhat: new Date().toISOString(),
      };

      let patchOk = false;
      try {
        const res = await fetch('/api/admin/appointments', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedAppointment.id, ...updatePayload }),
        });
        const resData = await res.json();
        if (res.ok && resData.success) patchOk = true;
      } catch {}

      if (!patchOk) {
        const { error } = await supabase
          .from('lich_hen')
          .update(updatePayload)
          .eq('id', selectedAppointment.id);
        if (error) throw error;
      }

      setEditAppForm((prev) => ({ ...prev, status: nextStatus }));

      // Cập nhật state danh sách
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === selectedAppointment.id
            ? {
                ...a,
                ho_ten_chu: editAppForm.ownerName.trim(),
                so_dien_thoai: editAppForm.phone.trim(),
                ten_thu_cung: editAppForm.petName.trim(),
                loai_thu_cung: editAppForm.petType,
                chi_nhanh_id: editAppForm.branchId || null,
                ten_chi_nhanh: editAppForm.branchName,
                dich_vu: finalServicesStr,
                ngay_hen: editAppForm.date,
                gio_hen: editAppForm.timeSlot,
                ghi_chu: finalGhiChu,
                trang_thai: nextStatus,
              }
            : a
        )
      );

      setSelectedAppointment((prev) =>
        prev
          ? {
              ...prev,
              ho_ten_chu: editAppForm.ownerName.trim(),
              so_dien_thoai: editAppForm.phone.trim(),
              ten_thu_cung: editAppForm.petName.trim(),
              loai_thu_cung: editAppForm.petType,
              chi_nhanh_id: editAppForm.branchId || null,
              ten_chi_nhanh: editAppForm.branchName,
              dich_vu: finalServicesStr,
              ngay_hen: editAppForm.date,
              gio_hen: editAppForm.timeSlot,
              ghi_chu: finalGhiChu,
              trang_thai: nextStatus,
            }
          : null
      );

      if (editAppForm.status === 'cho_xac_nhan') {
        showNotification('success', 'Đã lưu thông tin và chuyển lịch hẹn sang: ĐÃ XÁC NHẬN!');
      } else {
        showNotification('success', 'Đã lưu toàn bộ thông tin lịch hẹn thành công!');
      }
    } catch (err: any) {
      console.error('Lỗi lưu lịch hẹn:', err);
      showNotification('error', `Lỗi lưu lịch hẹn: ${err.message}`);
    } finally {
      setIsSavingAppointment(false);
    }
  };

  // Gửi tin nhắn Zalo ZNS xác nhận lịch hẹn (chỉ gửi khi đã xác nhận & tự động chuyển sang Đã hoàn thành)
  const handleSendZaloFromModal = async () => {
    if (!selectedAppointment) return;
    if (editAppForm.status === 'cho_xac_nhan') {
      showNotification('error', 'Vui lòng bấm Lưu để xác nhận lịch hẹn trước khi gửi tin Zalo!');
      return;
    }
    if (!editAppForm.phone.trim()) {
      showNotification('error', 'Vui lòng nhập số điện thoại để gửi Zalo ZNS!');
      return;
    }
    setIsSendingZalo(true);
    try {
      const isEn = editAppForm.lang === 'en';
      const finalServicesStr =
        editAppForm.services.filter(Boolean).join(', ') ||
        (isEn ? 'General Health Check & Consultation' : 'Khám Tổng Quát & Tư Vấn');
      const formattedDate = editAppForm.date ? editAppForm.date.split('-').reverse().join('/') : '';
      const formattedDateTime = editAppForm.timeSlot ? `${editAppForm.timeSlot}, ${formattedDate}` : formattedDate;

      // Đảm bảo tên chi nhánh kèm địa chỉ đầy đủ và chuẩn ngôn ngữ đã chọn
      let targetBranchName = editAppForm.branchName;
      const bObjZalo = branches.find((b) => b.id === editAppForm.branchId || (b.ten_chi_nhanh && editAppForm.branchName.includes(b.ten_chi_nhanh)));
      if (bObjZalo) {
        if (isEn) {
          const title = bObjZalo.ten_chi_nhanh_en || bObjZalo.ten_ngan_en || bObjZalo.ten_chi_nhanh;
          const addr = bObjZalo.dia_chi_en || bObjZalo.dia_chi;
          targetBranchName = addr ? `${title} — ${addr}` : title;
        } else {
          const title = bObjZalo.ten_ngan || bObjZalo.ten_chi_nhanh;
          const addr = bObjZalo.dia_chi;
          targetBranchName = addr ? `${title} — ${addr}` : title;
        }
      } else if (!targetBranchName || targetBranchName.toLowerCase().includes('thủ đức') || targetBranchName.toLowerCase().includes('thu duc')) {
        targetBranchName = isEn
          ? 'Thu Duc City Branch — 19 Street 1, Phuoc Long Ward, Thu Duc City, Ho Chi Minh City'
          : 'Cơ sở TP. Thủ Đức — 19 Đ. Số 1, Phường Phước Long, TP. Thủ Đức, TP. Hồ Chí Minh';
      }

      const res = await fetch('/api/admin/zalo/send-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedAppointment.id,
          phone: editAppForm.phone.trim(),
          bookingCode: selectedAppointment.ma_lich_hen,
          ownerName: editAppForm.ownerName.trim(),
          petName: editAppForm.petName.trim() || (isEn ? 'Beloved Pet' : 'Bé cưng'),
          service: finalServicesStr,
          dateTime: formattedDateTime,
          branchName: targetBranchName || (isEn ? 'PetM&M Veterinary Hospital' : 'Bệnh Viện Thú Y PetM&M'),
          isEn,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Lỗi gửi tin Zalo');

      // Tự động chuyển sang 'da_kham' và cập nhật số lần gửi Zalo thành công (xóa lỗi)
      const updatedZaloCount = (selectedAppointment.so_lan_gui_zalo || 0) + 1;
      await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAppointment.id,
          trang_thai: 'da_kham',
          so_lan_gui_zalo: updatedZaloCount,
          trang_thai_zalo: 'thanh_cong',
        }),
      });

      setEditAppForm((prev) => ({ ...prev, status: 'da_kham' }));
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === selectedAppointment.id
            ? { ...a, trang_thai: 'da_kham', so_lan_gui_zalo: updatedZaloCount, trang_thai_zalo: 'thanh_cong' }
            : a
        )
      );
      setSelectedAppointment((prev) =>
        prev
          ? { ...prev, trang_thai: 'da_kham', so_lan_gui_zalo: updatedZaloCount, trang_thai_zalo: 'thanh_cong' }
          : null
      );

      showNotification('success', data.message || `Đã gửi tin nhắn Zalo ZNS và chuyển trạng thái sang Đã hoàn thành!`);
    } catch (err: any) {
      if (selectedAppointment) {
        try {
          await fetch('/api/admin/appointments', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: selectedAppointment.id,
              trang_thai_zalo: 'that_bai',
            }),
          });
          setAppointments((prev) =>
            prev.map((a) => (a.id === selectedAppointment.id ? { ...a, trang_thai_zalo: 'that_bai' } : a))
          );
          setSelectedAppointment((prev) => (prev ? { ...prev, trang_thai_zalo: 'that_bai' } : null));
        } catch {}
      }
      showNotification('error', `Lỗi gửi Zalo: ${err.message}`);
    } finally {
      setIsSendingZalo(false);
    }
  };

  // Gửi email xác nhận lịch hẹn (chỉ gửi khi đã xác nhận & tự động chuyển sang Đã hoàn thành)
  const handleSendEmailFromModal = async () => {
    if (!selectedAppointment) return;
    if (editAppForm.status === 'cho_xac_nhan') {
      showNotification('error', 'Vui lòng bấm Lưu để xác nhận lịch hẹn trước khi gửi Email!');
      return;
    }
    if (!editAppForm.email.trim() || !editAppForm.email.includes('@')) {
      showNotification('error', 'Vui lòng nhập địa chỉ email hợp lệ để gửi thư xác nhận!');
      return;
    }
    setIsSendingConfirmEmailDetail(true);
    try {
      const isEn = editAppForm.lang === 'en';
      const finalServicesStr =
        editAppForm.services.filter(Boolean).join(', ') ||
        (isEn ? 'General Health Check & Consultation' : 'Khám Tổng Quát & Tư Vấn');
      const formattedDate = editAppForm.date ? editAppForm.date.split('-').reverse().join('/') : '';
      const formattedDateTime = editAppForm.timeSlot ? `${editAppForm.timeSlot}, ${formattedDate}` : formattedDate;

      // Đảm bảo tên chi nhánh kèm địa chỉ đầy đủ và chuẩn ngôn ngữ đã chọn
      let targetBranchName = editAppForm.branchName;
      const bObjMail = branches.find((b) => b.id === editAppForm.branchId || (b.ten_chi_nhanh && editAppForm.branchName.includes(b.ten_chi_nhanh)));
      if (bObjMail) {
        if (isEn) {
          const title = bObjMail.ten_chi_nhanh_en || bObjMail.ten_ngan_en || bObjMail.ten_chi_nhanh;
          const addr = bObjMail.dia_chi_en || bObjMail.dia_chi;
          targetBranchName = addr ? `${title} — ${addr}` : title;
        } else {
          const title = bObjMail.ten_ngan || bObjMail.ten_chi_nhanh;
          const addr = bObjMail.dia_chi;
          targetBranchName = addr ? `${title} — ${addr}` : title;
        }
      } else if (!targetBranchName || targetBranchName.toLowerCase().includes('thủ đức') || targetBranchName.toLowerCase().includes('thu duc')) {
        targetBranchName = isEn
          ? 'Thu Duc City Branch — 19 Street 1, Phuoc Long Ward, Thu Duc City, Ho Chi Minh City'
          : 'Cơ sở TP. Thủ Đức — 19 Đ. Số 1, Phường Phước Long, TP. Thủ Đức, TP. Hồ Chí Minh';
      }

      const res = await fetch('/api/booking/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedAppointment.id,
          toEmail: editAppForm.email.trim(),
          bookingCode: selectedAppointment.ma_lich_hen,
          ownerName: editAppForm.ownerName.trim(),
          phone: editAppForm.phone.trim(),
          petName: editAppForm.petName.trim() || (isEn ? 'Beloved Pet' : 'Bé cưng'),
          petType: editAppForm.petType,
          branchName: targetBranchName || (isEn ? 'PetM&M Veterinary Hospital' : 'Bệnh Viện Thú Y PetM&M'),
          service: finalServicesStr,
          dateTime: formattedDateTime,
          date: editAppForm.date,
          timeSlot: editAppForm.timeSlot,
          note: editAppForm.note,
          isEn,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Lỗi gửi email');

      // Tự động chuyển sang 'da_kham' và cập nhật số lần gửi Email thành công (xóa lỗi)
      const updatedEmailCount = (selectedAppointment.so_lan_gui_email || 0) + 1;
      await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAppointment.id,
          trang_thai: 'da_kham',
          so_lan_gui_email: updatedEmailCount,
          trang_thai_email: 'thanh_cong',
        }),
      });

      setEditAppForm((prev) => ({ ...prev, status: 'da_kham' }));
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === selectedAppointment.id
            ? { ...a, trang_thai: 'da_kham', so_lan_gui_email: updatedEmailCount, trang_thai_email: 'thanh_cong' }
            : a
        )
      );
      setSelectedAppointment((prev) =>
        prev
          ? { ...prev, trang_thai: 'da_kham', so_lan_gui_email: updatedEmailCount, trang_thai_email: 'thanh_cong' }
          : null
      );

      showNotification(
        'success',
        `Đã gửi thư xác nhận (${isEn ? 'Bản Tiếng Anh' : 'Bản Tiếng Việt'}) và chuyển trạng thái sang Đã hoàn thành!`
      );
    } catch (err: any) {
      if (selectedAppointment) {
        try {
          await fetch('/api/admin/appointments', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: selectedAppointment.id,
              trang_thai_email: 'that_bai',
            }),
          });
          setAppointments((prev) =>
            prev.map((a) => (a.id === selectedAppointment.id ? { ...a, trang_thai_email: 'that_bai' } : a))
          );
          setSelectedAppointment((prev) => (prev ? { ...prev, trang_thai_email: 'that_bai' } : null));
        } catch {}
      }
      showNotification('error', `Lỗi gửi email: ${err.message}`);
    } finally {
      setIsSendingConfirmEmailDetail(false);
    }
  };

  // Xác nhận hủy lịch hẹn với lý do bắt buộc (Form cửa sổ của Web)
  const handleConfirmCancelAppointment = async () => {
    if (!selectedAppointment) return;
    const reason = cancelReason.trim();
    if (!reason) {
      showNotification('error', 'Vui lòng nhập lý do hủy lịch hẹn!');
      return;
    }
    try {
      const cleanPrevNote = editAppForm.note.replace(/\[Đã hủy:[^\]]+\]/gi, '').trim();
      const updatedNote = `[Đã hủy: ${reason}] ${cleanPrevNote}`.trim();
      const finalGhiChu = `[Lang: ${editAppForm.lang}] ${editAppForm.email ? `[Email: ${editAppForm.email.trim()}] ` : ''}${updatedNote}`;

      const res = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAppointment.id,
          trang_thai: 'da_huy',
          ghi_chu: finalGhiChu,
        }),
      });

      if (!res.ok) throw new Error('Không thể hủy lịch qua API');

      setEditAppForm((prev) => ({ ...prev, status: 'da_huy', note: updatedNote }));
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === selectedAppointment.id ? { ...a, trang_thai: 'da_huy', ghi_chu: finalGhiChu } : a
        )
      );
      setSelectedAppointment((prev) =>
        prev ? { ...prev, trang_thai: 'da_huy', ghi_chu: finalGhiChu } : null
      );
      setIsCancelModalOpen(false);
      setCancelReason('');
      showNotification('success', `Đã hủy lịch hẹn #${selectedAppointment.ma_lich_hen} thành công.`);
    } catch (err: any) {
      showNotification('error', `Lỗi hủy lịch: ${err.message}`);
    }
  };

  // Khôi phục lịch hẹn đã hủy trở về trạng thái 'Chờ xác nhận'
  const handleRestoreAppointment = async () => {
    if (!selectedAppointment) return;
    try {
      const cleanNoteWithoutCancel = editAppForm.note.replace(/\[Đã hủy:[^\]]+\]/gi, '').trim();
      const finalGhiChu = `[Lang: ${editAppForm.lang}] ${editAppForm.email ? `[Email: ${editAppForm.email.trim()}] ` : ''}${cleanNoteWithoutCancel}`;

      const res = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAppointment.id,
          trang_thai: 'cho_xac_nhan',
          ghi_chu: finalGhiChu,
        }),
      });

      if (!res.ok) throw new Error('Không thể khôi phục lịch qua API');

      setEditAppForm((prev) => ({ ...prev, status: 'cho_xac_nhan', note: cleanNoteWithoutCancel }));
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === selectedAppointment.id ? { ...a, trang_thai: 'cho_xac_nhan', ghi_chu: finalGhiChu } : a
        )
      );
      setSelectedAppointment((prev) =>
        prev ? { ...prev, trang_thai: 'cho_xac_nhan', ghi_chu: finalGhiChu } : null
      );
      showNotification('success', 'Đã khôi phục lịch hẹn về trạng thái Chờ xác nhận!');
    } catch (err: any) {
      showNotification('error', `Lỗi khôi phục lịch: ${err.message}`);
    }
  };

  const handleResendConfirmEmail = async (app: LichHenRecord) => {
    const { email, cleanNote, lang } = extractEmailAndNote(app.ghi_chu);
    if (!email) {
      showNotification('error', 'Khách hàng này không cung cấp email khi đặt lịch!');
      return;
    }
    setIsSendingConfirmEmail(true);
    try {
      const res = await fetch('/api/booking/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: email,
          bookingCode: app.ma_lich_hen,
          ownerName: app.ho_ten_chu,
          phone: app.so_dien_thoai,
          petName: app.ten_thu_cung,
          petType: app.loai_thu_cung,
          branchName: app.ten_chi_nhanh || 'Hệ Thống PetM&M',
          service: app.dich_vu,
          dateTime: `${app.gio_hen}, ngày ${app.ngay_hen}`,
          date: app.ngay_hen,
          timeSlot: app.gio_hen,
          note: cleanNote,
          isEn: lang === 'en',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Lỗi gửi mail');
      showNotification('success', `Đã gửi lại thư xác nhận thành công tới ${email}!`);
    } catch (err: any) {
      showNotification('error', `Không thể gửi mail: ${err.message}`);
    } finally {
      setIsSendingConfirmEmail(false);
    }
  };

  const loadAppointments = useCallback(async (silent = false) => {
    if (!silent) setAppointmentsLoading(true);
    try {
      let incoming: LichHenRecord[] = [];
      try {
        const res = await fetch('/api/admin/appointments');
        const apiData = await res.json();
        if (res.ok && apiData.success && Array.isArray(apiData.data)) {
          incoming = apiData.data as LichHenRecord[];
        }
      } catch (e) {
        console.warn('Lỗi lấy lịch hẹn qua API, chuyển sang Supabase client:', e);
      }

      if (incoming.length === 0) {
        const { data, error } = await supabase
          .from('lich_hen')
          .select('*')
          .order('ngay_tao', { ascending: false });
        if (!error && data && data.length > 0) {
          incoming = (data as LichHenRecord[]) || [];
        }
      }

      if (!isInitialAppointmentsLoadedRef.current || knownAppointmentIdsRef.current.size === 0) {
        // Lần đầu vào trang Admin: ghi nhớ toàn bộ ID hiện tại, không kích hoạt thông báo cũ
        knownAppointmentIdsRef.current = new Set(incoming.map((a) => a.id));
        isInitialAppointmentsLoadedRef.current = true;
      } else {
        // Các lần cập nhật tiếp theo: kiểm tra nếu có lịch hẹn thực sự mới vừa được đặt
        for (const app of incoming) {
          if (
            !knownAppointmentIdsRef.current.has(app.id) &&
            !dismissedAppointmentIdsRef.current.has(app.id) &&
            app.trang_thai === 'cho_xac_nhan'
          ) {
            const createdMs = app.ngay_tao ? new Date(app.ngay_tao).getTime() : NaN;
            const isFresh = !isNaN(createdMs) && Date.now() - createdMs < 30 * 60 * 1000;
            if (isFresh) {
              triggerNewAppointmentNotification(app);
              break;
            }
          }
        }
        // Luôn cập nhật tất cả ID vào Set để không bị quét lặp lại ở các chu kỳ polling sau
        for (const app of incoming) {
          knownAppointmentIdsRef.current.add(app.id);
        }
      }

      setAppointments(incoming);
    } catch (err: any) {
      console.error('Lỗi tải lịch hẹn:', err);
      if (!silent) showNotification('error', `Lỗi tải lịch hẹn: ${err.message}`);
    } finally {
      if (!silent) setAppointmentsLoading(false);
    }
  }, [showNotification, triggerNewAppointmentNotification]);

  const handleUpdateAppointmentStatus = async (
    id: string,
    newStatus: 'cho_xac_nhan' | 'da_xac_nhan' | 'da_kham' | 'da_huy'
  ) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, trang_thai: newStatus }),
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Lỗi cập nhật trạng thái lịch hẹn qua API');
      }

      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? { ...app, trang_thai: newStatus } : app))
      );
      if (selectedAppointment && selectedAppointment.id === id) {
        setSelectedAppointment((prev) => (prev ? { ...prev, trang_thai: newStatus } : null));
      }
      showNotification('success', 'Đã cập nhật trạng thái lịch hẹn thành công!');
    } catch (err: any) {
      console.error('Lỗi cập nhật trạng thái:', err);
      showNotification('error', `Không thể cập nhật: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteAppointment = async (app: LichHenRecord) => {
    if (!window.confirm(`Bạn có chắc muốn xóa lịch hẹn [${app.ma_lich_hen}] của ${app.ho_ten_chu}?`)) return;

    try {
      const res = await fetch(`/api/admin/appointments?id=${app.id}`, { method: 'DELETE' });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Lỗi xóa lịch hẹn qua API');
      }
      showNotification('success', 'Đã xóa lịch hẹn thành công!');
      setAppointments((prev) => prev.filter((a) => a.id !== app.id));
      if (selectedAppointment?.id === app.id) setSelectedAppointment(null);
    } catch (err: any) {
      showNotification('error', `Lỗi xóa lịch hẹn: ${err.message}`);
    }
  };

  // -------------------------------------------------------------
  // TAB 6: QUẢN LÝ ĐÁNH GIÁ KHÁCH HÀNG (REVIEWS)
  // -------------------------------------------------------------
  const [reviews, setReviews] = useState<DanhGiaRecord[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Partial<DanhGiaRecord> | null>(null);
  const [isCreatingNewReview, setIsCreatingNewReview] = useState(false);
  const [isReviewSaving, setIsReviewSaving] = useState(false);
  const [reviewModalTab, setReviewModalTab] = useState<'vi' | 'en'>('vi');
  const [isTranslatingReview, setIsTranslatingReview] = useState(false);

  const loadReviews = useCallback(async (silent = false) => {
    if (!silent) setReviewsLoading(true);
    try {
      const { data, error } = await supabase
        .from('danh_gia')
        .select('*')
        .order('thu_tu', { ascending: true });

      if (error) throw error;
      setReviews((data as DanhGiaRecord[]) || []);
    } catch (err: any) {
      console.error('Lỗi tải đánh giá:', err);
      if (!silent) showNotification('error', `Lỗi tải đánh giá: ${err.message}`);
    } finally {
      if (!silent) setReviewsLoading(false);
    }
  }, [showNotification]);

function toDateInputValue(val?: string | null): string {
  if (!val) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const parts = val.split('/');
  if (parts.length === 3 && parts[2]?.length === 4) {
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const y = parts[2];
    return `${y}-${m}-${d}`;
  }
  return '';
}

function formatDisplayReviewDate(val?: string | null): string {
  if (!val) return 'Mới đây';
  const isoMatch = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${d}/${m}/${y}`;
  }
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(val)) return val;
  if (val === 'Hôm qua' || val === 'Yesterday') return '01/10/2026';
  if (val.includes('3 ngày') || val.includes('3 days')) return '29/09/2026';
  if (val.includes('5 ngày') || val.includes('5 days')) return '27/09/2026';
  if (val.includes('1 tuần') || val.includes('1 week')) return '25/09/2026';
  if (val.includes('2 tuần') || val.includes('2 weeks')) return '18/09/2026';
  return val;
}

function formatReviewCreatorInfo(rev: DanhGiaRecord): string {
  if (rev.noi_dung_en && (rev.noi_dung_en.includes('User:') || rev.noi_dung_en.includes('Được tạo bởi:'))) {
    return rev.noi_dung_en.replace('Được tạo bởi:', 'User:');
  }
  const d = rev.ngay_tao ? new Date(rev.ngay_tao) : new Date(rev.ngay_danh_gia || Date.now());
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateFormatted = isNaN(d.getTime())
    ? '04/10/2026 12:30:22'
    : `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  const creator = rev.ten_khach_hang_en?.trim() || 'Trần Văn A';
  return `User: ${creator} ; ${dateFormatted}`;
}

  const handleAddNewReview = () => {
    const nextOrder = reviews.length > 0 ? Math.max(...reviews.map((r) => r.thu_tu || 0)) + 1 : 1;
    const todayIso = new Date().toISOString().split('T')[0];
    setEditingReview({
      ten_khach_hang: '',
      ten_khach_hang_en: '',
      so_dien_thoai: '0908 234 ***',
      so_sao: 5,
      noi_dung: '',
      noi_dung_en: '',
      dich_vu_su_dung: '',
      dich_vu_su_dung_en: '',
      chi_nhanh: '',
      hinh_anh_thu_cung: '/pet_golden_spa.jpg',
      ngay_danh_gia: todayIso,
      ngay_danh_gia_en: todayIso,
      da_xac_thuc: true,
      thu_tu: nextOrder,
      kich_hoat: true,
    });
    setReviewModalTab('vi');
    setIsCreatingNewReview(true);
  };

  const handleEditReview = (review: DanhGiaRecord) => {
    setEditingReview({ ...review });
    setReviewModalTab('vi');
    setIsCreatingNewReview(false);
  };

  const handleAutoTranslateReview = async () => {
    if (!editingReview) return;
    if (!editingReview.noi_dung?.trim() && !editingReview.ten_khach_hang?.trim()) {
      showNotification('error', 'Vui lòng nhập nội dung nhận xét hoặc tên khách hàng trước khi dịch!');
      return;
    }

    setIsTranslatingReview(true);
    try {
      const fieldsToTranslate: Record<string, string> = {
        ten_khach_hang: editingReview.ten_khach_hang || '',
        noi_dung: editingReview.noi_dung || '',
        ngay_danh_gia: editingReview.ngay_danh_gia || '',
        dich_vu_su_dung: editingReview.dich_vu_su_dung || '',
      };
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fieldsToTranslate }),
      });
      const data = await res.json();
      if (data.success && data.translations) {
        setEditingReview((prev) => (prev ? {
          ...prev,
          ten_khach_hang_en: data.translations.ten_khach_hang || prev.ten_khach_hang_en,
          noi_dung_en: data.translations.noi_dung || prev.noi_dung_en,
          ngay_danh_gia_en: data.translations.ngay_danh_gia || prev.ngay_danh_gia_en,
          dich_vu_su_dung_en: data.translations.dich_vu_su_dung || prev.dich_vu_su_dung_en,
        } : null));
        setReviewModalTab('en');
        showNotification('success', 'Đã chuyển đổi sang Tiếng Anh y khoa Fear-Free thành công!');
      } else {
        throw new Error(data.error || 'Dịch tự động thất bại');
      }
    } catch (err: any) {
      console.error('Lỗi dịch đánh giá:', err);
      showNotification('error', `Lỗi dịch tự động: ${err.message}`);
    } finally {
      setIsTranslatingReview(false);
    }
  };

  const handleToggleReviewActive = async (review: DanhGiaRecord) => {
    const newStatus = !review.kich_hoat;
    try {
      await mutateAdminContent('danh_gia', 'update', review.id, {
        kich_hoat: newStatus,
        ngay_cap_nhat: new Date().toISOString(),
      });
      setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, kich_hoat: newStatus } : r)));
      showNotification('success', `Đã ${newStatus ? 'hiển thị' : 'ẩn'} đánh giá`);
    } catch (err: any) {
      showNotification('error', `Lỗi cập nhật: ${err.message}`);
    }
  };

  const handleDeleteReview = async (review: DanhGiaRecord) => {
    if (!window.confirm(`Bạn có chắc muốn xóa đánh giá của "${review.ten_khach_hang}" không?`)) return;

    try {
      await mutateAdminContent('danh_gia', 'delete', review.id);
      showNotification('success', 'Đã xóa đánh giá thành công!');
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      if (editingReview?.id === review.id) setEditingReview(null);
    } catch (err: any) {
      showNotification('error', `Lỗi xóa: ${err.message}`);
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    if (!editingReview.ten_khach_hang?.trim()) {
      showNotification('error', 'Vui lòng nhập tên khách hàng');
      return;
    }
    if (!editingReview.noi_dung?.trim()) {
      showNotification('error', 'Vui lòng nhập nội dung đánh giá');
      return;
    }

    setIsReviewSaving(true);
    try {
      const payload = {
        ten_khach_hang: editingReview.ten_khach_hang.trim(),
        ten_khach_hang_en: editingReview.ten_khach_hang_en?.trim() || null,
        so_dien_thoai: editingReview.so_dien_thoai?.trim() || '0908 234 ***',
        so_sao: Number(editingReview.so_sao) || 5,
        noi_dung: editingReview.noi_dung.trim(),
        noi_dung_en: editingReview.noi_dung_en?.trim() || null,
        dich_vu_su_dung: editingReview.dich_vu_su_dung?.trim() || '',
        dich_vu_su_dung_en: editingReview.dich_vu_su_dung_en?.trim() || null,
        chi_nhanh: editingReview.chi_nhanh?.trim() || '',
        hinh_anh_thu_cung: editingReview.hinh_anh_thu_cung?.trim() || '/pet_golden_spa.jpg',
        ngay_danh_gia: editingReview.ngay_danh_gia?.trim() || 'Gần đây',
        ngay_danh_gia_en: editingReview.ngay_danh_gia_en?.trim() || null,
        da_xac_thuc: editingReview.da_xac_thuc ?? true,
        thu_tu: Number(editingReview.thu_tu) || 0,
        kich_hoat: editingReview.kich_hoat !== false,
        ngay_cap_nhat: new Date().toISOString(),
      };

      if (isCreatingNewReview || !editingReview.id) {
        await mutateAdminContent('danh_gia', 'insert', undefined, payload);
        showNotification('success', 'Đã thêm đánh giá mới thành công!');
      } else {
        await mutateAdminContent('danh_gia', 'update', editingReview.id, payload);
        showNotification('success', 'Đã cập nhật đánh giá thành công!');
      }

      setEditingReview(null);
      setIsCreatingNewReview(false);
      await loadReviews();
    } catch (err: any) {
      console.error('Save review error:', err);
      showNotification('error', `Lỗi lưu đánh giá: ${err.message}`);
    } finally {
      setIsReviewSaving(false);
    }
  };

  // -------------------------------------------------------------
  // TAB 7: QUẢN LÝ ĐỘI NGŨ Y TẾ (TEAM MEMBERS)
  // -------------------------------------------------------------
  const [teamMembers, setTeamMembers] = useState<DoiNguRecord[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<Partial<DoiNguRecord> | null>(null);
  const [isCreatingNewMember, setIsCreatingNewMember] = useState(false);
  const [isMemberSaving, setIsMemberSaving] = useState(false);
  const [memberModalTab, setMemberModalTab] = useState<'vi' | 'en'>('vi');
  const [isTranslatingMember, setIsTranslatingMember] = useState(false);
  const [teamCategoryFilter, setTeamCategoryFilter] = useState<'all' | 'lanh_dao' | 'chuyen_gia' | 'bac_si' | 'dieu_duong'>('all');
  const [teamSubTab, setTeamSubTab] = useState<'members' | 'careers'>('members');

  const loadTeamMembers = useCallback(async (silent = false) => {
    if (!silent) setTeamLoading(true);
    try {
      const { data, error } = await supabase
        .from('doi_ngu_y_te')
        .select('*')
        .order('thu_tu', { ascending: true });

      if (error) throw error;
      setTeamMembers((data as DoiNguRecord[]) || []);
    } catch (err: any) {
      console.error('Lỗi tải đội ngũ y tế:', err);
      if (!silent) showNotification('error', `Lỗi tải đội ngũ: ${err.message}`);
    } finally {
      if (!silent) setTeamLoading(false);
    }
  }, [showNotification]);

  const handleAddNewMember = () => {
    const nextOrder = teamMembers.length > 0 ? Math.max(...teamMembers.map((m) => m.thu_tu || 0)) + 1 : 1;
    setMemberModalTab('vi');
    setEditingMember({
      ho_ten: '',
      ho_ten_en: '',
      chuc_danh: teamCategoryFilter === 'dieu_duong' ? 'ĐIỀU DƯỠNG' : teamCategoryFilter === 'chuyen_gia' ? 'CHUYÊN GIA TƯ VẤN' : teamCategoryFilter === 'lanh_dao' ? 'NHÀ SÁNG LẬP · PETM&M' : 'BÁC SĨ THÚ Y',
      chuc_danh_en: '',
      hoc_vi_chuc_vu: '',
      hoc_vi_chuc_vu_en: '',
      phan_loai: teamCategoryFilter !== 'all' ? teamCategoryFilter : 'bac_si',
      hinh_anh: '',
      mo_ta: '',
      mo_ta_en: '',
      thu_tu: nextOrder,
      kich_hoat: true,
    });
    setIsCreatingNewMember(true);
  };

  const handleEditMember = (member: DoiNguRecord) => {
    setMemberModalTab('vi');
    setEditingMember({ ...member });
    setIsCreatingNewMember(false);
  };

  const handleToggleMemberActive = async (member: DoiNguRecord) => {
    const newStatus = !member.kich_hoat;
    try {
      await mutateAdminContent('doi_ngu_y_te', 'update', member.id, {
        kich_hoat: newStatus,
        ngay_cap_nhat: new Date().toISOString(),
      });
      setTeamMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, kich_hoat: newStatus } : m)));
      showNotification('success', `Đã ${newStatus ? 'kích hoạt' : 'tạm ẩn'} nhân sự`);
    } catch (err: any) {
      showNotification('error', `Lỗi cập nhật: ${err.message}`);
    }
  };

  const handleDeleteMember = async (member: DoiNguRecord) => {
    if (!window.confirm(`Bạn có chắc muốn xóa nhân sự "${member.ho_ten}" không?`)) return;

    try {
      await mutateAdminContent('doi_ngu_y_te', 'delete', member.id);
      showNotification('success', 'Đã xóa nhân sự thành công!');
      setTeamMembers((prev) => prev.filter((m) => m.id !== member.id));
      if (editingMember?.id === member.id) setEditingMember(null);
    } catch (err: any) {
      showNotification('error', `Lỗi xóa: ${err.message}`);
    }
  };

  const handleTranslateMember = async () => {
    if (!editingMember) return;
    if (!editingMember.ho_ten && !editingMember.chuc_danh && !editingMember.hoc_vi_chuc_vu && !editingMember.mo_ta) {
      showNotification('error', 'Chưa có nội dung tiếng Việt để dịch');
      return;
    }
    setIsTranslatingMember(true);
    try {
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            ho_ten: editingMember.ho_ten || '',
            chuc_danh: editingMember.chuc_danh || '',
            hoc_vi_chuc_vu: editingMember.hoc_vi_chuc_vu || '',
            mo_ta: editingMember.mo_ta || '',
          },
          context: 'veterinary doctor, medical specialist, clinic team member profile',
        }),
      });
      const data = await res.json();
      if (data.success && data.translations) {
        setEditingMember((prev: any) => ({
          ...prev,
          ho_ten_en: data.translations.ho_ten || prev?.ho_ten_en || prev?.ho_ten,
          chuc_danh_en: data.translations.chuc_danh || prev?.chuc_danh_en || '',
          hoc_vi_chuc_vu_en: data.translations.hoc_vi_chuc_vu || prev?.hoc_vi_chuc_vu_en || '',
          mo_ta_en: data.translations.mo_ta || prev?.mo_ta_en || '',
        }));
        setMemberModalTab('en');
        showNotification('success', 'Đã tự động dịch thông tin nhân sự sang Tiếng Anh!');
      } else {
        throw new Error(data.error || 'Dịch tự động thất bại');
      }
    } catch (err: any) {
      showNotification('error', `Lỗi dịch tự động: ${err.message}`);
    } finally {
      setIsTranslatingMember(false);
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    if (!editingMember.ho_ten?.trim()) {
      showNotification('error', 'Vui lòng nhập họ và tên');
      return;
    }

    setIsMemberSaving(true);
    try {
      const payload = {
        ho_ten: editingMember.ho_ten.trim(),
        ho_ten_en: editingMember.ho_ten_en?.trim() || null,
        chuc_danh: editingMember.chuc_danh?.trim() || 'BÁC SĨ THÚ Y',
        chuc_danh_en: editingMember.chuc_danh_en?.trim() || null,
        hoc_vi_chuc_vu: editingMember.hoc_vi_chuc_vu?.trim() || '',
        hoc_vi_chuc_vu_en: editingMember.hoc_vi_chuc_vu_en?.trim() || null,
        phan_loai: editingMember.phan_loai || 'bac_si',
        hinh_anh: editingMember.hinh_anh?.trim() || '',
        anh_goc: editingMember.anh_goc?.trim() || editingMember.hinh_anh?.trim() || null,
        mo_ta: editingMember.mo_ta?.trim() || '',
        mo_ta_en: editingMember.mo_ta_en?.trim() || null,
        thu_tu: Number(editingMember.thu_tu) || 0,
        kich_hoat: editingMember.kich_hoat !== false,
        ngay_cap_nhat: new Date().toISOString(),
      };

      if (isCreatingNewMember || !editingMember.id) {
        await mutateAdminContent('doi_ngu_y_te', 'insert', undefined, payload);
        showNotification('success', 'Đã thêm nhân sự mới thành công!');
      } else {
        await mutateAdminContent('doi_ngu_y_te', 'update', editingMember.id, payload);
        showNotification('success', 'Đã cập nhật thông tin nhân sự!');
      }

      setEditingMember(null);
      setIsCreatingNewMember(false);
      await loadTeamMembers();
    } catch (err: any) {
      console.error('Save member error:', err);
      showNotification('error', `Lỗi lưu nhân sự: ${err.message}`);
    } finally {
      setIsMemberSaving(false);
    }
  };

  // -------------------------------------------------------------
  // TAB 8: QUẢN LÝ BÀI VIẾT & CẨM NANG KIẾN THỨC (ARTICLES)
  // -------------------------------------------------------------
  const [articles, setArticles] = useState<BaiVietRecord[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState<Partial<BaiVietRecord> | null>(null);
  const [isCreatingNewArticle, setIsCreatingNewArticle] = useState(false);
  const [isArticleSaving, setIsArticleSaving] = useState(false);
  const [articleCategoryFilter, setArticleCategoryFilter] = useState<string>('all');
  const [articleLangTab, setArticleLangTab] = useState<'vi' | 'en'>('vi');
  const [isTranslatingArticle, setIsTranslatingArticle] = useState(false);

  const loadArticles = useCallback(async (silent = false) => {
    if (!silent) setArticlesLoading(true);
    try {
      const { data, error } = await supabase
        .from('bai_viet')
        .select('*')
        .order('thu_tu', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles((data as BaiVietRecord[]) || []);
    } catch (err: any) {
      console.error('Lỗi tải danh sách bài viết:', err);
      if (!silent) showNotification('error', `Lỗi tải bài viết: ${err.message}`);
    } finally {
      if (!silent) setArticlesLoading(false);
    }
  }, [showNotification]);

  const handleAddNewArticle = () => {
    const nextOrder = articles.length > 0 ? Math.max(...articles.map((a) => a.thu_tu || 0)) + 1 : 1;
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateFormatted = `${day}/${month}/${year}`;

    setEditingArticle({
      tieu_de: '',
      slug: '',
      chuyen_muc: articleCategoryFilter !== 'all' ? articleCategoryFilter : 'Y Khoa Dự Phòng',
      mo_ta_ngan: '',
      noi_dung: '',
      hinh_anh: '',
      thoi_gian_doc: '4 phút đọc',
      tac_gia: 'Hội Đồng Y Khoa PetM&M',
      ngay_dang: dateFormatted,
      thu_tu: nextOrder,
      kich_hoat: true,
      luot_xem: 0,
    });
    setIsCreatingNewArticle(true);
  };

  const handleEditArticle = (article: BaiVietRecord) => {
    setEditingArticle({ ...article });
    setIsCreatingNewArticle(false);
    setArticleLangTab('vi');
  };

  const handleAutoTranslateArticle = async () => {
    if (!editingArticle?.tieu_de) {
      showNotification('error', 'Vui lòng nhập Tiêu đề Tiếng Việt trước khi dịch!');
      return;
    }
    setIsTranslatingArticle(true);
    try {
      const fieldsToTranslate: Record<string, string> = {
        tieu_de: editingArticle.tieu_de || '',
        mo_ta_ngan: editingArticle.mo_ta_ngan || '',
        noi_dung: editingArticle.noi_dung || '',
        chuyen_muc: editingArticle.chuyen_muc || '',
        tac_gia: editingArticle.tac_gia || '',
      };
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fieldsToTranslate }),
      });
      const data = await res.json();
      if (data.success && data.translations) {
        setEditingArticle((prev) => (prev ? {
          ...prev,
          tieu_de_en: data.translations.tieu_de || (prev as any).tieu_de_en,
          mo_ta_ngan_en: data.translations.mo_ta_ngan || (prev as any).mo_ta_ngan_en,
          noi_dung_en: data.translations.noi_dung || (prev as any).noi_dung_en,
          chuyen_muc_en: data.translations.chuyen_muc || (prev as any).chuyen_muc_en,
          tac_gia_en: data.translations.tac_gia || (prev as any).tac_gia_en,
        } as any : null));
        setArticleLangTab('en');
        showNotification('success', 'Đã chuyển đổi sang Tiếng Anh thành công!');
      } else throw new Error(data.error || 'Dịch thất bại');
    } catch (err: any) {
      showNotification('error', `Lỗi dịch: ${err.message}`);
    } finally {
      setIsTranslatingArticle(false);
    }
  };

  const handleToggleArticleActive = async (article: BaiVietRecord) => {
    const newStatus = !article.kich_hoat;
    try {
      await mutateAdminContent('bai_viet', 'update', article.id, {
        kich_hoat: newStatus,
        updated_at: new Date().toISOString(),
      });
      setArticles((prev) => prev.map((a) => (a.id === article.id ? { ...a, kich_hoat: newStatus } : a)));
      showNotification('success', `Đã ${newStatus ? 'hiển thị' : 'tạm ẩn'} bài viết`);
    } catch (err: any) {
      showNotification('error', `Lỗi cập nhật: ${err.message}`);
    }
  };

  const handleDeleteArticle = async (article: BaiVietRecord) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bài viết "${article.tieu_de}" không?`)) return;

    try {
      await mutateAdminContent('bai_viet', 'delete', article.id);
      showNotification('success', 'Đã xóa bài viết thành công!');
      setArticles((prev) => prev.filter((a) => a.id !== article.id));
      if (editingArticle?.id === article.id) setEditingArticle(null);
    } catch (err: any) {
      showNotification('error', `Lỗi xóa: ${err.message}`);
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    if (!editingArticle.tieu_de?.trim()) {
      showNotification('error', 'Vui lòng nhập tiêu đề bài viết');
      return;
    }

    setIsArticleSaving(true);
    try {
      const payload = {
        tieu_de: editingArticle.tieu_de.trim(),
        slug:
          editingArticle.slug?.trim() ||
          editingArticle.tieu_de
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, ''),
        chuyen_muc: editingArticle.chuyen_muc?.trim() || 'Y Khoa Dự Phòng',
        tieu_de_en: (editingArticle as any).tieu_de_en?.trim() || '',
        mo_ta_ngan_en: (editingArticle as any).mo_ta_ngan_en?.trim() || '',
        noi_dung_en: (editingArticle as any).noi_dung_en?.trim() || '',
        chuyen_muc_en: (editingArticle as any).chuyen_muc_en?.trim() || '',
        tac_gia_en: (editingArticle as any).tac_gia_en?.trim() || '',
        mo_ta_ngan: editingArticle.mo_ta_ngan?.trim() || '',
        noi_dung: editingArticle.noi_dung?.trim() || '',
        hinh_anh: editingArticle.hinh_anh?.trim() || '',
        anh_goc: editingArticle.anh_goc?.trim() || editingArticle.hinh_anh?.trim() || null,
        thoi_gian_doc: editingArticle.thoi_gian_doc?.trim() || '4 phút đọc',
        tac_gia: editingArticle.tac_gia?.trim() || 'Hội Đồng Y Khoa PetM&M',
        ngay_dang: editingArticle.ngay_dang?.trim() || '',
        thu_tu: Number(editingArticle.thu_tu) || 0,
        kich_hoat: editingArticle.kich_hoat !== false,
        updated_at: new Date().toISOString(),
      };

      if (isCreatingNewArticle || !editingArticle.id) {
        await mutateAdminContent('bai_viet', 'insert', undefined, payload);
        showNotification('success', 'Đã thêm bài viết mới thành công!');
      } else {
        await mutateAdminContent('bai_viet', 'update', editingArticle.id, payload);
        showNotification('success', 'Đã cập nhật bài viết thành công!');
      }

      setEditingArticle(null);
      setIsCreatingNewArticle(false);
      await loadArticles();
    } catch (err: any) {
      console.error('Save article error:', err);
      showNotification('error', `Lỗi lưu bài viết: ${err.message}`);
    } finally {
      setIsArticleSaving(false);
    }
  };

  // -------------------------------------------------------------
  // SLIDES ẢNH GIỚI THIỆU & ĐỘI NGŨ (ABOUT SLIDES)
  // -------------------------------------------------------------
  const [aboutSlides, setAboutSlides] = useState<HeroBannerItem[]>([]);
  const [aboutSlidesLoading, setAboutSlidesLoading] = useState(true);
  const [editingAboutSlide, setEditingAboutSlide] = useState<Partial<HeroBannerItem> | null>(null);
  const [isCreatingNewAboutSlide, setIsCreatingNewAboutSlide] = useState(false);
  const [isAboutSlideSaving, setIsAboutSlideSaving] = useState(false);

  const loadAboutSlides = useCallback(async (silent = false) => {
    if (!silent) setAboutSlidesLoading(true);
    try {
      const { data, error } = await supabase
        .from('hinh_anh')
        .select('*')
        .eq('chuyen_muc', 'gioi_thieu')
        .order('thu_tu', { ascending: true });

      if (error) throw error;
      setAboutSlides((data as HeroBannerItem[]) || []);
    } catch (err: any) {
      console.error('Lỗi tải slide giới thiệu:', err);
    } finally {
      if (!silent) setAboutSlidesLoading(false);
    }
  }, []);

  const handleAutoTranslateAboutSlide = async () => {
    if (!editingAboutSlide?.tieu_de) {
      showNotification('error', 'Vui lòng nhập Tiêu đề Tiếng Việt trước khi dịch!');
      return;
    }
    setIsTranslatingAboutSlide(true);
    try {
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            tieu_de: editingAboutSlide.tieu_de || '',
            alt_text: editingAboutSlide.alt_text || '',
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.translations) {
        setEditingAboutSlide((prev) => (prev ? {
          ...prev,
          tieu_de_en: data.translations.tieu_de || (prev as any).tieu_de_en,
          alt_text_en: data.translations.alt_text || (prev as any).alt_text_en,
        } : null));
        setAboutSlideLang('en');
        showNotification('success', 'Đã chuyển đổi Slide sang Tiếng Anh thành công!');
      } else throw new Error(data.error || 'Dịch thất bại');
    } catch (err: any) {
      showNotification('error', 'Lỗi dịch: ' + err.message);
    } finally {
      setIsTranslatingAboutSlide(false);
    }
  };

  const handleAddNewAboutSlide = () => {
    const nextOrder = aboutSlides.length > 0 ? Math.max(...aboutSlides.map((s) => s.thu_tu || 0)) + 1 : 1;
    setEditingAboutSlide({
      duong_dan_anh: '',
      tieu_de: '',
      alt_text: 'Đội ngũ chuyên môn',
      chuyen_muc: 'gioi_thieu',
      thu_tu: nextOrder,
      kich_hoat: true,
    });
    setIsCreatingNewAboutSlide(true);
  };

  const handleEditAboutSlide = (slide: HeroBannerItem) => {
    setEditingAboutSlide({ ...slide });
    setIsCreatingNewAboutSlide(false);
  };

  const handleToggleAboutSlideActive = async (slide: HeroBannerItem) => {
    const newStatus = !slide.kich_hoat;
    try {
      await mutateAdminContent('hinh_anh', 'update', slide.id, {
        kich_hoat: newStatus,
        ngay_cap_nhat: new Date().toISOString(),
      });
      setAboutSlides((prev) => prev.map((s) => (s.id === slide.id ? { ...s, kich_hoat: newStatus } : s)));
      showNotification('success', `Đã ${newStatus ? 'hiển thị' : 'ẩn'} slide ảnh`);
    } catch (err: any) {
      showNotification('error', `Lỗi cập nhật: ${err.message}`);
    }
  };

  const handleDeleteAboutSlide = async (slide: HeroBannerItem) => {
    if (!window.confirm(`Bạn có chắc muốn xóa ảnh slide "${slide.tieu_de || 'này'}" không?`)) return;

    try {
      await mutateAdminContent('hinh_anh', 'delete', slide.id);
      showNotification('success', 'Đã xóa slide ảnh thành công!');
      setAboutSlides((prev) => prev.filter((s) => s.id !== slide.id));
      if (editingAboutSlide?.id === slide.id) setEditingAboutSlide(null);
    } catch (err: any) {
      showNotification('error', `Lỗi xóa: ${err.message}`);
    }
  };

  const handleSaveAboutSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAboutSlide) return;
    if (!editingAboutSlide.duong_dan_anh?.trim()) {
      showNotification('error', 'Vui lòng tải hoặc dán đường dẫn ảnh');
      return;
    }

    setIsAboutSlideSaving(true);
    try {
      const payload = {
        duong_dan_anh: editingAboutSlide.duong_dan_anh.trim(),
        anh_goc: editingAboutSlide.anh_goc?.trim() || editingAboutSlide.duong_dan_anh.trim() || null,
        tieu_de: editingAboutSlide.tieu_de?.trim() || 'Hình ảnh Bệnh viện PetM&M',
        alt_text: editingAboutSlide.alt_text?.trim() || 'Đội ngũ chuyên môn',
        tieu_de_en: (editingAboutSlide as any).tieu_de_en?.trim() || '',
        alt_text_en: (editingAboutSlide as any).alt_text_en?.trim() || '',
        chuyen_muc: 'gioi_thieu',
        thu_tu: Number(editingAboutSlide.thu_tu) || 0,
        kich_hoat: editingAboutSlide.kich_hoat !== false,
        ngay_cap_nhat: new Date().toISOString(),
      };

      if (isCreatingNewAboutSlide || !editingAboutSlide.id) {
        await mutateAdminContent('hinh_anh', 'insert', undefined, payload);
        showNotification('success', 'Đã thêm slide ảnh giới thiệu mới!');
      } else {
        await mutateAdminContent('hinh_anh', 'update', editingAboutSlide.id, payload);
        showNotification('success', 'Đã cập nhật slide ảnh giới thiệu!');
      }

      setEditingAboutSlide(null);
      setIsCreatingNewAboutSlide(false);
      await loadAboutSlides();
    } catch (err: any) {
      console.error('Save about slide error:', err);
      showNotification('error', `Lỗi lưu ảnh: ${err.message}`);
    } finally {
      setIsAboutSlideSaving(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadBanners();
    loadBranches();
    loadServices();
    loadFaqs();
    loadAppointments();
    loadBookingCover();
    loadReviews();
    loadTeamMembers();
    loadAboutSlides();
    loadArticles();
    loadJobApplications();
    loadJobsList();

    // Lắng nghe Realtime lịch hẹn mới khi khách đặt trên website
    const channel = supabase
      .channel('lich_hen_admin_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lich_hen' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const newApp = payload.new as LichHenRecord;
            if (!knownAppointmentIdsRef.current.has(newApp.id)) {
              knownAppointmentIdsRef.current.add(newApp.id);
              triggerNewAppointmentNotification(newApp);
            }
          }
          loadAppointments(true);
        }
      )
      .subscribe();

    // Lắng nghe Realtime hồ sơ ứng viên nộp CV mới
    const appChannel = supabase
      .channel('ho_so_tuyen_dung_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ho_so_tuyen_dung' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const newApp = payload.new as HoSoTuyenDungRecord;
            showNotification('info', `📄 Hồ sơ ứng tuyển mới: ${newApp.ho_ten || 'Ứng viên'} (${newApp.tieu_de_vi_tri || 'Vị trí mới'})`);
            const currentConfig = getLocalAdminNotifSettings();
            if (currentConfig.browserSound) {
              playNotificationSound();
            }
          }
          loadJobApplications();
        }
      )
      .subscribe();

    // Lắng nghe Realtime toàn bộ nội dung hệ thống: Đánh giá, Chi nhánh, Dịch vụ, FAQ, Bác sĩ, Bài viết, Tuyển dụng, Banner, Cấu hình
    const contentChannel = supabase
      .channel('admin_content_live_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'danh_gia' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            const newRev = payload.new as DanhGiaRecord;
            showNotification('info', `⭐ Khách gửi đánh giá ${newRev.so_sao || 5}★: ${newRev.ten_khach_hang || 'Khách hàng'}`);
            const currentConfig = getLocalAdminNotifSettings();
            if (currentConfig.browserSound) {
              playNotificationSound();
            }
          }
          loadReviews(true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chi_nhanh' },
        () => {
          loadBranches(true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dich_vu' },
        () => {
          loadServices(true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cau_hoi_thuong_gap' },
        () => {
          loadFaqs(true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'doi_ngu_y_te' },
        () => {
          loadTeamMembers(true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bai_viet' },
        () => {
          loadArticles(true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tuyen_dung' },
        () => {
          loadJobsList();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hinh_anh' },
        () => {
          loadBanners(true);
          loadAboutSlides(true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cau_hinh' },
        () => {
          loadBookingCover();
          loadSupportPanelConfig();
        }
      )
      .subscribe();

    // Lắng nghe Realtime khi gửi Email / Zalo thất bại -> bật thông báo nổi cảnh báo ngay
    const failureChannel = supabase
      .channel('nhat_ky_failures')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'nhat_ky_gui_tin' },
        (payload) => {
          if (payload.new && (payload.new as any).trang_thai === 'that_bai') {
            const item = payload.new as any;
            setFailureNotification({
              id: item.id,
              kenh: item.kenh,
              loai_tin: item.loai_tin,
              nguoi_nhan: item.nguoi_nhan,
              ten_nguoi_nhan: item.ten_nguoi_nhan,
              tieu_de: item.tieu_de,
              chi_tiet_loi: item.chi_tiet_loi,
              ma_loi: item.ma_loi,
              thoi_gian: item.ngay_tao,
            });
          }
        }
      )
      .subscribe();

    // Polling định kỳ mỗi 15 giây để đảm bảo 100% không bỏ sót lịch hẹn & hồ sơ CV mới
    const pollTimer = setInterval(() => {
      loadAppointments(true);
      loadJobApplications();
    }, 15000);

    return () => {
      clearInterval(pollTimer);
      supabase.removeChannel(channel);
      supabase.removeChannel(appChannel);
      supabase.removeChannel(contentChannel);
      supabase.removeChannel(failureChannel);
    };
  }, [
    loadAppointments,
    loadJobApplications,
    loadJobsList,
    loadBanners,
    loadBranches,
    loadServices,
    loadFaqs,
    loadBookingCover,
    loadReviews,
    loadTeamMembers,
    loadAboutSlides,
    loadArticles,
    loadSupportPanelConfig,
    showNotification,
    triggerNewAppointmentNotification,
  ]);

  // Filtered data for tables
  const filteredBanners = banners.filter((b) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (b.tieu_de && b.tieu_de.toLowerCase().includes(term)) ||
      (b.duong_dan_anh && b.duong_dan_anh.toLowerCase().includes(term)) ||
      (b.can_chinh && b.can_chinh.toLowerCase().includes(term))
    );
  });

  const filteredBranches = branches.filter((b) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (b.ten_chi_nhanh && b.ten_chi_nhanh.toLowerCase().includes(term)) ||
      (b.dia_chi && b.dia_chi.toLowerCase().includes(term)) ||
      (b.khu_vuc && b.khu_vuc.toLowerCase().includes(term)) ||
      (b.so_dien_thoai && b.so_dien_thoai.toLowerCase().includes(term)) ||
      (b.bac_si_phu_trach && b.bac_si_phu_trach.toLowerCase().includes(term))
    );
  });

  const filteredServices = services.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (s.ten_dich_vu && s.ten_dich_vu.toLowerCase().includes(term)) ||
      (s.phu_de && s.phu_de.toLowerCase().includes(term)) ||
      (s.nhom_dich_vu && s.nhom_dich_vu.toLowerCase().includes(term)) ||
      (s.huy_hieu && s.huy_hieu.toLowerCase().includes(term)) ||
      (s.gia_tham_khao && s.gia_tham_khao.toLowerCase().includes(term))
    );
  });

  const filteredFaqs = faqs.filter((f) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (f.cau_hoi && f.cau_hoi.toLowerCase().includes(term)) ||
      (f.cau_hoi_en && f.cau_hoi_en.toLowerCase().includes(term)) ||
      (f.cau_tra_loi && f.cau_tra_loi.toLowerCase().includes(term)) ||
      (f.cau_tra_loi_en && f.cau_tra_loi_en.toLowerCase().includes(term)) ||
      (f.chuyen_muc && f.chuyen_muc.toLowerCase().includes(term)) ||
      (f.chuyen_muc_en && f.chuyen_muc_en.toLowerCase().includes(term))
    );
  });

  const filteredAppointments = appointments.filter((app) => {
    if (statusFilter !== 'all' && app.trang_thai !== statusFilter) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (app.ma_lich_hen && app.ma_lich_hen.toLowerCase().includes(term)) ||
      (app.ho_ten_chu && app.ho_ten_chu.toLowerCase().includes(term)) ||
      (app.so_dien_thoai && app.so_dien_thoai.toLowerCase().includes(term)) ||
      (app.ten_thu_cung && app.ten_thu_cung.toLowerCase().includes(term)) ||
      (app.ten_chi_nhanh && app.ten_chi_nhanh.toLowerCase().includes(term)) ||
      (app.dich_vu && app.dich_vu.toLowerCase().includes(term))
    );
  });

  const filteredReviews = reviews.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (r.ten_khach_hang && r.ten_khach_hang.toLowerCase().includes(term)) ||
      (r.ten_khach_hang_en && r.ten_khach_hang_en.toLowerCase().includes(term)) ||
      (r.noi_dung && r.noi_dung.toLowerCase().includes(term)) ||
      (r.noi_dung_en && r.noi_dung_en.toLowerCase().includes(term)) ||
      (r.dich_vu_su_dung && r.dich_vu_su_dung.toLowerCase().includes(term)) ||
      (r.chi_nhanh && r.chi_nhanh.toLowerCase().includes(term)) ||
      (r.so_dien_thoai && r.so_dien_thoai.toLowerCase().includes(term))
    );
  });

  const filteredTeamMembers = teamMembers.filter((m) => {
    if (teamCategoryFilter !== 'all' && m.phan_loai !== teamCategoryFilter) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (m.ho_ten && m.ho_ten.toLowerCase().includes(term)) ||
      (m.chuc_danh && m.chuc_danh.toLowerCase().includes(term)) ||
      (m.hoc_vi_chuc_vu && m.hoc_vi_chuc_vu.toLowerCase().includes(term)) ||
      (m.mo_ta && m.mo_ta.toLowerCase().includes(term))
    );
  });

  const filteredArticles = articles.filter((a) => {
    if (articleCategoryFilter !== 'all' && a.chuyen_muc !== articleCategoryFilter) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (a.tieu_de && a.tieu_de.toLowerCase().includes(term)) ||
      (a.mo_ta_ngan && a.mo_ta_ngan.toLowerCase().includes(term)) ||
      (a.chuyen_muc && a.chuyen_muc.toLowerCase().includes(term)) ||
      (a.tac_gia && a.tac_gia.toLowerCase().includes(term)) ||
      (a.noi_dung && a.noi_dung.toLowerCase().includes(term))
    );
  });

  const pendingAppointmentsCount = appointments.filter((a) => a.trang_thai === 'cho_xac_nhan').length;

  // Current tab metadata for Breadcrumbs
  const tabTitles: Record<AdminTab, { title: string; category: string; icon: any }> = {
    dashboard: { title: 'Tổng Quan Hệ Thống', category: 'Điều Hành', icon: BarChart3 },
    banners: { title: 'Quản Lý Ảnh Nền Hero', category: 'Nội Dung Giao Diện', icon: ImageIcon },
    branches: { title: 'Quản Lý Hệ Thống Chi Nhánh', category: 'Cơ Sở Bệnh Viện', icon: MapPin },
    services: { title: 'Quản Lý Dịch Vụ Chuẩn 5 Sao', category: 'Dịch Vụ & Bảng Giá', icon: Stethoscope },
    appointments: { title: 'Quản Lý Lịch Hẹn Khách Hàng', category: 'Khách Hàng & Đặt Lịch', icon: CalendarDays },
    faqs: { title: 'Quản Lý Câu Hỏi Thường Gặp', category: 'Hỗ Trợ & Giải Đáp', icon: HelpCircle },
    reviews: { title: 'Quản Lý Đánh Giá Khách Hàng', category: 'Phản Hồi & Đánh Giá', icon: Star },
    team: { title: 'Quản Lý Đội Ngũ Y Tế', category: 'Chuyên Môn & Nhân Sự', icon: UserCheck },
    articles: { title: 'Quản Lý Cẩm Nang & Bài Viết', category: 'Tin Tức & Kiến Thức', icon: BookOpen },
    config: { title: 'Cài Đặt Hệ Thống', category: 'Cài Đặt', icon: Settings },
    staff: { title: 'Quản Lý Nhân Sự & Tài Khoản', category: 'Quản Trị Hệ Thống', icon: Users },
  };

  const subTabTitles: Record<ConfigSubTab, string> = {
    contact: 'Hotline & Mạng Xã Hội',
    email: 'Email',
    zalo: 'Cấu Hình Zalo Official Account (ZNS)',
    spam: 'Chống Spam Đặt Lịch (IP, SĐT, Email)',
    'notification-logs': 'Nhật Ký & Bộ Đếm Gửi Tin Nhắn',
    about: 'Giới Thiệu',
    slides: 'Giới Thiệu',
    stats: 'Giới Thiệu',
    slogans: 'Khẩu Hiệu & Slogan',
    announcement: 'Poster',
    privacy: 'Chính Sách Quyền Riêng Tư',
  };

  // CHẶN THIẾT BỊ DI ĐỘNG / TABLET NGAY TỪ ĐẦU — TRƯỚC CẢ TRANG ĐĂNG NHẬP
  if (isScreenTooSmall) {
    return (
      <div className="fixed inset-0 z-[99999] bg-[#F5F5F5] flex items-center justify-center p-0 select-none overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/admin-desktop-only.png"
          alt="Công cụ hiện chỉ hỗ trợ trên thiết bị máy vi tính"
          className="w-full h-full max-w-[554px] max-h-screen object-contain pointer-events-none"
        />
      </div>
    );
  }

  // AUTH GATE
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0B150A] flex flex-col items-center justify-center p-4 select-none">
        <PetLogo size="lg" />
        <div className="mt-6 flex items-center gap-2.5 text-slate-300 text-xs font-semibold">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span>Đang kiểm tra quyền truy cập quản trị...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLoginPage
        onLoginSuccess={(user) => {
          if (user.vai_tro === 'user') {
            if (typeof window !== 'undefined') {
              window.location.href = '/taodanhgia';
            }
            return;
          }
          setCurrentUser(user);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  if (currentUser?.vai_tro === 'user') {
    if (typeof window !== 'undefined') {
      window.location.replace('/taodanhgia');
    }
    return null;
  }


  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex antialiased">
      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR MENU (CỐ ĐỊNH PHONG CÁCH ERP / SAAS B2B) */}
      {/* ========================================================= */}

      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand / Logo Top */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2D5A27] to-[#1E4D1A] flex items-center justify-center text-amber-300 shadow-md ring-1 ring-amber-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-wide text-white">PetM&M</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  ERP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-light">Quản Trị Hệ Thống 5★</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Quản Lý Dữ Liệu
            </div>
            <nav className="space-y-1">
              {/* Menu 0: Dashboard */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('dashboard');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'dashboard'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BarChart3
                    className={`w-4 h-4 transition ${
                      activeTab === 'dashboard' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Tổng Quan Hệ Thống</span>
                </div>
              </button>

              {/* Menu 1: Banners */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('banners');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'banners'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ImageIcon
                    className={`w-4 h-4 transition ${
                      activeTab === 'banners' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Ảnh Nền Hero</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'banners' ? 'bg-black/30 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {banners.length}
                </span>
              </button>

              {/* Menu 2: Branches */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('branches');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'branches'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin
                    className={`w-4 h-4 transition ${
                      activeTab === 'branches' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Hệ Thống Chi Nhánh</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'branches' ? 'bg-black/30 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {branches.length}
                </span>
              </button>

              {/* Menu 3: Services */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('services');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'services'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Stethoscope
                    className={`w-4 h-4 transition ${
                      activeTab === 'services' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Dịch Vụ Chuẩn 5★</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'services' ? 'bg-black/30 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {services.length}
                </span>
              </button>

              {/* Menu 4: Appointments */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('appointments');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'appointments'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CalendarDays
                    className={`w-4 h-4 transition ${
                      activeTab === 'appointments' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Lịch Hẹn Khách</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {pendingAppointmentsCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Có lịch hẹn mới chờ xác nhận" />
                  )}
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      activeTab === 'appointments'
                        ? 'bg-black/30 text-amber-300'
                        : pendingAppointmentsCount > 0
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {appointments.length}
                  </span>
                </div>
              </button>

              {/* Menu 5: FAQs */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('faqs');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group cursor-pointer ${
                    activeTab === 'faqs'
                      ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle
                      className={`w-4 h-4 transition ${
                        activeTab === 'faqs' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                      }`}
                    />
                    <span>Câu Hỏi Thường Gặp</span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      activeTab === 'faqs' ? 'bg-black/30 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {faqs.length}
                  </span>
                </button>

                {/* Luôn hiển thị đổ xuống 2 mục con theo yêu cầu */}
                <div className="mt-1 ml-4 pl-3 border-l-2 border-emerald-700/60 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('faqs');
                      setFaqSubTab('list');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'faqs' && faqSubTab === 'list'
                        ? 'bg-emerald-800/80 text-amber-300 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>• Danh sách câu hỏi ({faqs.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('faqs');
                      setFaqSubTab('support_panel');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'faqs' && faqSubTab === 'support_panel'
                        ? 'bg-emerald-800/80 text-amber-300 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <PhoneCall className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Bạn cần hỗ trợ?</span>
                  </button>
                </div>
              </div>

              {/* Menu 6: Reviews */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('reviews');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'reviews'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Star
                    className={`w-4 h-4 transition ${
                      activeTab === 'reviews' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Đánh Giá Khách Hàng</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'reviews' ? 'bg-black/30 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {reviews.length}
                </span>
              </button>

              {/* Menu 7: Team */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('team');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group cursor-pointer ${
                    activeTab === 'team'
                      ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserCheck
                      className={`w-4 h-4 transition ${
                        activeTab === 'team' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                      }`}
                    />
                    <span>Đội Ngũ Y Tế</span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      activeTab === 'team' ? 'bg-black/30 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {teamMembers.length}
                  </span>
                </button>

                {/* Luôn hiển thị đổ xuống các mục con theo yêu cầu */}
                <div className="mt-1 ml-4 pl-3 border-l-2 border-emerald-700/60 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('team');
                      setTeamSubTab('members');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center justify-between ${
                      activeTab === 'team' && teamSubTab === 'members'
                        ? 'bg-emerald-800/80 text-amber-300 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>• Danh sách bác sĩ</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-bold">{teamMembers.length}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('team');
                      setTeamSubTab('careers');
                      setCareersDefaultView('jobs');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center justify-between ${
                      activeTab === 'team' && teamSubTab === 'careers' && careersDefaultView === 'jobs'
                        ? 'bg-emerald-800/80 text-amber-300 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Vị trí tuyển dụng</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-bold">{jobs.length}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('team');
                      setTeamSubTab('careers');
                      setCareersDefaultView('applicants');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center justify-between ${
                      activeTab === 'team' && teamSubTab === 'careers' && careersDefaultView === 'applicants'
                        ? 'bg-emerald-800/80 text-amber-300 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Ứng viên nộp CV</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-bold">{jobApplications.length}</span>
                  </button>
                </div>
              </div>

              {/* Menu 8: Articles / Cẩm Nang */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('articles');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'articles'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen
                    className={`w-4 h-4 transition ${
                      activeTab === 'articles' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Cẩm Nang &amp; Bài Viết</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'articles' ? 'bg-black/30 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {articles.length}
                </span>
              </button>

              {/* Menu 9: Staff / Account Management */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('staff');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group cursor-pointer ${
                  activeTab === 'staff'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users
                    className={`w-4 h-4 transition ${
                      activeTab === 'staff' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Nhân Sự &amp; Tài Khoản</span>
                </div>
              </button>
            </nav>
          </div>

          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Cài Đặt Hệ Thống
            </div>
            <nav className="space-y-1">
              {/* 1. Hotline & Mạng xã hội */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('config');
                  setConfigSubTab('contact');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'config' && configSubTab === 'contact'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <PhoneCall
                    className={`w-3.5 h-3.5 transition ${
                      activeTab === 'config' && configSubTab === 'contact' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Hotline &amp; Mạng Xã Hội</span>
                </div>
              </button>

              {/* Nhóm: Thông Báo Tự Động (Email & Zalo) - Tách nhánh cây giống Đội Ngũ Y Tế */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('config');
                    setConfigSubTab('email');
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition group cursor-pointer ${
                    activeTab === 'config' && (configSubTab === 'email' || configSubTab === 'zalo' || configSubTab === 'spam' || configSubTab === 'notification-logs')
                      ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Send
                      className={`w-3.5 h-3.5 transition ${
                        activeTab === 'config' && (configSubTab === 'email' || configSubTab === 'zalo' || configSubTab === 'spam' || configSubTab === 'notification-logs')
                          ? 'text-amber-300'
                          : 'text-slate-400 group-hover:text-white'
                      }`}
                    />
                    <span>Gửi Thông Báo</span>
                  </div>
                </button>

                {/* 4 nhánh con: Email, Zalo, Chống Spam và Nhật Ký */}
                <div className="mt-1 ml-4 pl-3 border-l-2 border-emerald-700/60 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('config');
                      setConfigSubTab('email');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'config' && configSubTab === 'email'
                        ? 'bg-emerald-800/80 text-amber-300 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('config');
                      setConfigSubTab('zalo');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'config' && configSubTab === 'zalo'
                        ? 'bg-emerald-800/80 text-amber-300 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-xs bg-[#0068FF] text-white text-[9px] font-black flex items-center justify-center shrink-0">
                      Z
                    </span>
                    <span>Zalo OA (ZNS)</span>
                    {zaloForm.zalo_enabled && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse ml-auto" title="Đang Bật gửi ZNS" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('config');
                      setConfigSubTab('spam');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'config' && configSubTab === 'spam'
                        ? 'bg-emerald-800/80 text-amber-300 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Chống Spam</span>
                    {antiSpamForm.spam_limit_enabled ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-auto" title="Đang Bật chống spam" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-auto" title="Đang Tắt" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('config');
                      setConfigSubTab('notification-logs');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'config' && configSubTab === 'notification-logs'
                        ? 'bg-emerald-800/80 text-amber-300 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <BarChart3 className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Nhật Ký &amp; Bộ Đếm</span>
                  </button>
                </div>
              </div>

              {/* 2. Giới thiệu & Triết lý */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('config');
                  setConfigSubTab('about');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'config' && configSubTab === 'about'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Heart
                    className={`w-3.5 h-3.5 transition ${
                      activeTab === 'config' && configSubTab === 'about' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Giới Thiệu</span>
                </div>
              </button>

              {/* 3. Khẩu hiệu & Slogan */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('config');
                  setConfigSubTab('slogans');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'config' && configSubTab === 'slogans'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles
                    className={`w-3.5 h-3.5 transition ${
                      activeTab === 'config' && configSubTab === 'slogans' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Khẩu Hiệu &amp; Slogan</span>
                </div>
              </button>

              {/* 6. Thông Báo Nổi (Popup & Lịch Tết / Ưu Đãi) */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('config');
                  setConfigSubTab('announcement');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'config' && configSubTab === 'announcement'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Megaphone
                    className={`w-3.5 h-3.5 transition ${
                      activeTab === 'config' && configSubTab === 'announcement' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Poster</span>
                </div>
                {announcementForm.isActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Đang Bật trên website" />
                )}
              </button>

              {/* 7. Chính Sách Quyền Riêng Tư */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('config');
                  setConfigSubTab('privacy');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'config' && configSubTab === 'privacy'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck
                    className={`w-3.5 h-3.5 transition ${
                      activeTab === 'config' && configSubTab === 'privacy' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Chính Sách Riêng Tư</span>
                </div>
              </button>
            </nav>
          </div>

          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Liên Kết Ngoài
            </div>
            <nav className="space-y-1">
              <Link
                href="/"
                target="_blank"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition group"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white" />
                  <span>Xem Trang Chủ Web</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </nav>
          </div>
        </div>

        {/* Sidebar Bottom / Profile & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-xs shrink-0">
                {(currentUser?.username || 'AD').substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser?.ho_ten || currentUser?.username || 'Quản Trị Viên'}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="capitalize">{currentUser?.vai_tro || 'super_admin'}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer shrink-0"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN WORKSPACE CONTAINER (BÊN PHẢI SIDEBAR) */}
      {/* ========================================================= */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 min-h-screen">
        {/* TOP BAR / HEADER (BREADCRUMB & THAO TÁC NHANH) */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger button on Mobile */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 hover:text-slate-600 transition">Trang chủ</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-400">{tabTitles[activeTab].category}</span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-slate-900">
                {activeTab === 'config' ? subTabTitles[configSubTab] : tabTitles[activeTab].title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'dashboard') {
                  loadAppointments();
                  loadReviews();
                  loadBranches();
                  loadServices();
                  loadTeamMembers();
                  loadArticles();
                }
                if (activeTab === 'banners') loadBanners();
                if (activeTab === 'branches') loadBranches();
                if (activeTab === 'services') loadServices();
                if (activeTab === 'appointments') {
                  loadAppointments();
                  loadBookingCover();
                }
                if (activeTab === 'faqs') loadFaqs();
                if (activeTab === 'reviews') loadReviews();
                if (activeTab === 'team') loadTeamMembers();
                if (activeTab === 'config') {
                  refreshConfig();
                  loadAboutSlides();
                }
                showNotification('success', 'Đã làm mới dữ liệu');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Làm Mới</span>
            </button>

            {/* NÚT CÀI ĐẶT THÔNG BÁO (CẠNH CHUÔNG THÔNG BÁO) */}
            <button
              type="button"
              onClick={() => setIsNotifSettingsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
              title="Cài đặt thông báo & âm thanh (Web, Trình duyệt)"
            >
              <Settings className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Cài Đặt Chuông</span>
            </button>

            {/* CHUÔNG THÔNG BÁO HỆ THỐNG */}
            <AdminNotificationBell
              appointments={appointments}
              applications={jobApplications}
              reviews={reviews}
              currentUser={currentUser}
              onNavigateTab={handleNavigateWithHighlight}
            />
          </div>
        </header>

        {/* NOTIFICATION TOAST */}
        {notification && (
          <div
            className={`fixed top-16 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl text-xs font-semibold animate-in slide-in-from-top-2 duration-200 ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : notification.type === 'info'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : notification.type === 'info' ? (
              <Bell className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* WORKSPACE BODY */}
        <main className="flex-1 p-4 sm:p-8 max-w-[1720px] w-full mx-auto">
          {/* ===================================================== */}
          {/* TAB 0: TỔNG QUAN HỆ THỐNG (DASHBOARD) */}
          {/* ===================================================== */}
          {activeTab === 'dashboard' && (
            <AdminDashboardTab
              appointments={appointments}
              reviews={reviews}
              services={services}
              branches={branches}
              teamMembers={teamMembers}
              articles={articles}
              applications={jobApplications}
              jobs={jobs}
              highlightedId={highlightedId}
              onUpdateApplicantStatus={handleUpdateApplicantStatus}
              onNavigateTab={handleNavigateWithHighlight}
              onRefresh={() => {
                loadAppointments();
                loadReviews();
                loadBranches();
                loadServices();
                loadTeamMembers();
                loadArticles();
                loadJobApplications();
                loadJobsList();
                showNotification('success', 'Đã cập nhật số liệu mới nhất!');
              }}
            />
          )}

          {/* ===================================================== */}
          {/* TAB 1: BẢNG DỮ LIỆU QUẢN LÝ ẢNH NỀN HERO BANNER */}
          {/* ===================================================== */}
          {activeTab === 'banners' && (
            <div className="space-y-4">
              {/* Header Card với ô tìm kiếm & Nút "+ Thêm ảnh" (Y hệt mẫu ảnh) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#2D5A27]" />
                    <span>Quản Lý Ảnh Nền Hero</span>
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Danh sách các slide điện ảnh tự động chuyển cảnh ngoài trang chủ ({banners.length} ảnh)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Ô tìm kiếm */}
                  <div className="relative min-w-[200px] sm:min-w-[260px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-[#2D5A27] bg-slate-50/50"
                    />
                  </div>

                  {/* Nút "+ Thêm ảnh" (Y hệt nút "+ Thêm sản phẩm" trong ảnh mẫu) */}
                  <button
                    type="button"
                    onClick={handleAddNewBanner}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-sm transition shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Ảnh Nền</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {bannersLoading && banners.length === 0 ? (
                  <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#2D5A27]" />
                    <span className="text-xs font-medium">Đang nạp danh sách ảnh nền từ Supabase...</span>
                  </div>
                ) : filteredBanners.length === 0 ? (
                  <div className="p-16 text-center text-slate-500">
                    <ImageIcon className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-semibold text-slate-700">Chưa có ảnh nền nào</p>
                    <p className="text-xs text-slate-400 mt-1">Bấm nút "Thêm Ảnh Nền" ở góc phải để thêm ảnh mới.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                          <th className="py-3 px-4 w-16 text-center">STT</th>
                          <th className="py-3 px-4 min-w-[140px]">Ảnh Xem Trước</th>
                          <th className="py-3 px-4 min-w-[220px]">Thông Tin &amp; Tọa Độ Căn Chỉnh</th>
                          <th className="py-3 px-4 min-w-[120px]">Thời Gian</th>
                          <th className="py-3 px-4 min-w-[130px] text-center">Trạng Thái</th>
                          <th className="py-3 px-4 min-w-[140px] text-center">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredBanners.map((banner, index) => {
                          return (
                            <tr key={banner.id} className="hover:bg-slate-50/60 transition group">
                              <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                                {index + 1}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="relative w-24 h-15 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                                  <img
                                    src={banner.duong_dan_anh}
                                    alt="Ảnh nền"
                                    className="w-full h-full object-cover"
                                    style={{ objectPosition: banner.can_chinh || 'center' }}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/hero_cinematic.jpg';
                                    }}
                                  />
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-slate-900">
                                  {banner.tieu_de || 'Ảnh Nền Hero PetM&M'}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                    Vị trí: {banner.can_chinh || '50% 50%'}
                                  </span>
                                  <span>•</span>
                                  <span>Thu phóng: {banner.ti_le_phong || 1.05}x</span>
                                </div>
                                <p className="text-[10px] text-slate-400 truncate max-w-xs mt-1 font-mono">
                                  {banner.duong_dan_anh}
                                </p>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{((banner.thoi_gian_hien_thi || 4000) / 1000).toFixed(0)} giây</span>
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleBannerActive(banner)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                                    banner.kich_hoat
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      banner.kich_hoat ? 'bg-emerald-500' : 'bg-slate-400'
                                    }`}
                                  />
                                  <span>{banner.kich_hoat ? 'Hoạt động' : 'Tắt'}</span>
                                </button>
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleEditBanner(banner)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-[#2D5A27] hover:text-white hover:border-[#2D5A27] text-slate-600 transition shadow-2xs cursor-pointer"
                                    title="Căn chỉnh vị trí &amp; sửa ảnh"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBanner(banner)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition shadow-2xs cursor-pointer"
                                    title="Xóa ảnh này"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 2: BẢNG DỮ LIỆU QUẢN LÝ CHI NHÁNH BỆNH VIỆN */}
          {/* ===================================================== */}
          {activeTab === 'branches' && (
            <div className="space-y-4">
              {/* Header Card với ô tìm kiếm & Nút "+ Thêm chi nhánh" (Y hệt mẫu ảnh) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#2D5A27]" />
                    <span>Quản Lý Hệ Thống Chi Nhánh</span>
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hệ thống phòng khám thú y &amp; resort trên toàn thành phố ({branches.length} cơ sở)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Ô tìm kiếm */}
                  <div className="relative min-w-[200px] sm:min-w-[260px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-[#2D5A27] bg-slate-50/50"
                    />
                  </div>

                  {/* Nút Cài đặt tiêu đề mục */}
                  <button
                    type="button"
                    onClick={handleOpenBranchTitleModal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
                    title="Cài đặt Tiêu đề & Chú thích hiển thị trên Trang chủ"
                  >
                    <Settings className="w-4 h-4 text-amber-700" />
                    <span>Cài Đặt Tiêu Đề Mục</span>
                  </button>

                  {/* Nút "+ Thêm chi nhánh" (Y hệt nút "+ Thêm sản phẩm" trong ảnh mẫu) */}
                  <button
                    type="button"
                    onClick={handleAddNewBranch}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-sm transition shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Chi Nhánh</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {branchesLoading && branches.length === 0 ? (
                  <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#2D5A27]" />
                    <span className="text-xs font-medium">Đang tải danh sách cơ sở từ Supabase...</span>
                  </div>
                ) : filteredBranches.length === 0 ? (
                  <div className="p-16 text-center text-slate-500">
                    <MapPin className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-semibold text-slate-700">Chưa có chi nhánh nào</p>
                    <p className="text-xs text-slate-400 mt-1">Bấm nút "Thêm Chi Nhánh" ở góc phải để thêm cơ sở mới.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                          <th className="py-3 px-4 w-16 text-center">STT</th>
                          <th className="py-3 px-4 min-w-[200px]">Chi Nhánh</th>
                          <th className="py-3 px-4 min-w-[260px]">Địa Chỉ &amp; Hotline</th>
                          <th className="py-3 px-4 min-w-[160px]">Bác Sĩ Phụ Trách</th>
                          <th className="py-3 px-4 min-w-[140px] text-center">Cơ Sở Chính</th>
                          <th className="py-3 px-4 min-w-[120px] text-center">Trạng Thái</th>
                          <th className="py-3 px-4 min-w-[130px] text-center">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredBranches.map((branch, index) => {
                          return (
                            <tr key={branch.id} className="hover:bg-slate-50/60 transition group">
                              <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                                {index + 1}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  {branch.anh_dai_dien ? (
                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                                      <img
                                        src={branch.anh_dai_dien}
                                        alt="Cơ sở"
                                        className="w-full h-full object-cover"
                                        style={{ objectPosition: branch.can_chinh_anh || 'center' }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                      <Building2 className="w-6 h-6" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-slate-900">{branch.ten_chi_nhanh}</span>
                                      {branch.la_co_so_chinh && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                          ⭐ Chính
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-slate-100 text-slate-700">
                                        {branch.khu_vuc || 'Khu vực'}
                                      </span>
                                      <span className="text-[11px] text-slate-400">
                                        Thứ tự: {branch.thu_tu || 1}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="text-slate-700 flex items-start gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-[#2D5A27] shrink-0 mt-0.5" />
                                  <span className="line-clamp-2">{branch.dia_chi}</span>
                                </div>
                                <div className="mt-1 text-[11px] text-slate-500 font-medium">
                                  Hotline: <strong className="text-slate-800">{branch.so_dien_thoai}</strong>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-slate-800">
                                  {branch.bac_si_phu_trach || 'Chưa cập nhật'}
                                </div>
                                {branch.bang_cap_bac_si && (
                                  <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">
                                    {branch.bang_cap_bac_si}
                                  </p>
                                )}
                              </td>

                              {/* CỘT CƠ SỞ CHÍNH: Tick chọn trực tiếp 1-chạm */}
                              <td className="py-3.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleSetMainBranch(branch)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer select-none ${
                                    branch.la_co_so_chinh
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs hover:bg-amber-200'
                                      : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200'
                                  }`}
                                  title={
                                    branch.la_co_so_chinh
                                      ? 'Chi nhánh này đang được chọn làm Cơ Sở Chính (hiển thị ở chân trang web)'
                                      : 'Bấm để chọn chi nhánh này làm Cơ Sở Chính'
                                  }
                                >
                                  <span>{branch.la_co_so_chinh ? '⭐' : '○'}</span>
                                  <span>{branch.la_co_so_chinh ? 'Cơ Sở Chính' : 'Đặt làm chính'}</span>
                                </button>
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleBranchActive(branch)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                                    branch.kich_hoat
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      branch.kich_hoat ? 'bg-emerald-500' : 'bg-slate-400'
                                    }`}
                                  />
                                  <span>{branch.kich_hoat ? 'Hoạt động' : 'Tắt'}</span>
                                </button>
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleEditBranch(branch)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-[#2D5A27] hover:text-white hover:border-[#2D5A27] text-slate-600 transition shadow-2xs cursor-pointer"
                                    title="Chỉnh sửa thông tin chi nhánh"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBranch(branch)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition shadow-2xs cursor-pointer"
                                    title="Xóa chi nhánh"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 3: CẤU HÌNH LIÊN HỆ & MẠNG XÃ HỘI */}
          {/* ===================================================== */}
          {/* ===================================================== */}
          {/* TAB 3: CÀI ĐẶT HỆ THỐNG & SLOGAN TRANG WEB */}
          {/* ===================================================== */}
          {activeTab === 'config' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* NHÁNH 1: HOTLINE & MẠNG XÃ HỘI */}
              {configSubTab === 'contact' && (
                <form onSubmit={handleSaveConfig} className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
                    <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                          <PhoneCall className="w-4 h-4 text-[#2D5A27]" />
                          <span>Hotline Cấp Cứu &amp; Kênh Mạng Xã Hội</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Cấu hình số tổng đài 24/7 và các liên kết mạng xã hội chính thức của hệ thống bệnh viện.
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Kênh Liên Lạc
                      </span>
                    </div>


                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Hotline 24/7 (Gọi trực tiếp & Hiển thị trên web): *
                      </label>
                      <input
                        type="text"
                        required
                        value={configForm.hotline_hien_thi || configForm.hotline || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setConfigForm((prev) => ({
                            ...prev,
                            hotline: val,
                            hotline_hien_thi: val,
                          }));
                        }}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Liên kết Chat Zalo:
                        </label>
                        <input
                          type="text"
                          value={configForm.link_zalo || ''}
                          onChange={(e) => setConfigForm((prev) => ({ ...prev, link_zalo: e.target.value }))}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Liên kết Fanpage Facebook (FB):
                        </label>
                        <input
                          type="text"
                          value={configForm.link_facebook || ''}
                          onChange={(e) => setConfigForm((prev) => ({ ...prev, link_facebook: e.target.value }))}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Liên kết Facebook Messenger:
                        </label>
                        <input
                          type="text"
                          value={configForm.link_messenger || ''}
                          onChange={(e) => setConfigForm((prev) => ({ ...prev, link_messenger: e.target.value }))}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Liên kết Kênh TikTok:
                        </label>
                        <input
                          type="text"
                          value={configForm.link_tiktok || ''}
                          onChange={(e) => setConfigForm((prev) => ({ ...prev, link_tiktok: e.target.value }))}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Gmail / Email tiếp nhận liên hệ:
                        </label>
                        <input
                          type="email"
                          value={configForm.email || ''}
                          onChange={(e) => setConfigForm((prev) => ({ ...prev, email: e.target.value }))}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Địa chỉ trụ sở chính (Hiển thị chân trang Footer):
                        </label>
                        <input
                          type="text"
                          value={configForm.dia_chi_chinh || ''}
                          onChange={(e) => setConfigForm((prev) => ({ ...prev, dia_chi_chinh: e.target.value }))}
                          placeholder="123 Nguyễn Văn Cừ, Quận 5, TP.HCM"
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nút Submit lưu nhánh Hotline */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      Các kênh liên hệ và mạng xã hội sẽ được cập nhật ngay lập tức trên toàn hệ thống.
                    </p>
                    <button
                      type="submit"
                      disabled={isConfigSaving}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                    >
                      {isConfigSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>{isConfigSaving ? 'Đang lưu...' : 'Lưu Hotline & Mạng Xã Hội'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* NHÁNH: CẤU HÌNH GMAIL SMTP & EMAIL TIẾP NHẬN */}
              {configSubTab === 'email' && (
                <>
                <form onSubmit={handleSaveSmtp} className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
                    {/* Header Thẻ */}
                    <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#2D5A27] flex items-center justify-center border border-emerald-200 shrink-0">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                            <span>Email (Gmail SMTP)</span>
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Cấu hình tài khoản gửi thư và các hộp thư tiếp nhận thông báo (Đặt lịch, Tuyển dụng CV &amp; Liên hệ).
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          Gmail SSL (Cổng 465)
                        </span>

                        {/* Công tắc Bật/Tắt Gửi Email Tổng */}
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl transition">
                          <input
                            type="checkbox"
                            checked={smtpForm.email_enabled}
                            onChange={(e) => setSmtpForm((prev) => ({ ...prev, email_enabled: e.target.checked }))}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                            smtpForm.email_enabled
                              ? 'bg-[#2D5A27] border-[#2D5A27] text-white'
                              : 'border-slate-300 bg-white text-transparent'
                          }`}>
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span className="text-xs font-bold text-slate-800">
                            {smtpForm.email_enabled ? (
                              <span className="text-[#2D5A27] flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#2D5A27] animate-pulse"></span>
                                Bật Gửi Email (Tất cả)
                              </span>
                            ) : (
                              <span className="text-slate-500">Tắt Toàn Bộ Email</span>
                            )}
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* KHỐI TÙY CHỌN BẬT / TẮT CHI TIẾT TỪNG MỤC EMAIL */}
                    <div className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                          <SlidersHorizontal className="w-4 h-4 text-[#2D5A27]" />
                          <span>Phân Loại Gửi Email &amp; Điều Kiện Kích Hoạt</span>
                        </div>
                        <span className="text-[11px] text-slate-500 hidden sm:inline">
                          Điều chỉnh cơ chế gửi tự động theo từng nghiệp vụ
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* 1. XÁC NHẬN LỊCH HẸN KHÁCH HÀNG (3 CHẾ ĐỘ DẤU TICK) */}
                        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <CalendarCheck className="w-4 h-4 text-[#2D5A27]" />
                                <span>Xác Nhận Lịch Hẹn (Gửi Khách Hàng)</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                Cơ chế gửi thư thông báo xác nhận khi khách đặt lịch khám trên website
                              </p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              !smtpForm.email_enabled || smtpForm.email_booking_mode === 'disabled'
                                ? 'bg-slate-100 text-slate-600'
                                : smtpForm.email_booking_mode === 'on_zalo_fail'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {!smtpForm.email_enabled
                                ? 'Email Tổng Đang Tắt'
                                : smtpForm.email_booking_mode === 'always'
                                ? 'Luôn luôn gửi'
                                : smtpForm.email_booking_mode === 'on_zalo_fail'
                                ? 'Khi Zalo lỗi / hết tiền'
                                : 'Đang tắt'}
                            </span>
                          </div>

                          <div className="space-y-2 pt-1">
                            {/* Tùy chọn 1: Luôn luôn */}
                            <label
                              onClick={() => setSmtpForm((prev) => ({ ...prev, email_booking_mode: 'always' }))}
                              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition select-none ${
                                smtpForm.email_booking_mode === 'always' && smtpForm.email_enabled
                                  ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300/40'
                                  : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/70'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                smtpForm.email_booking_mode === 'always'
                                  ? 'bg-[#2D5A27] border-[#2D5A27] text-white'
                                  : 'border-slate-300 bg-white text-transparent'
                              }`}>
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900">Luôn luôn</div>
                                <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                                  Luôn tự động gửi email xác nhận đặt lịch ngay sau khi khách hoàn tất gửi form trên web.
                                </div>
                              </div>
                            </label>

                            {/* Tùy chọn 2: Khi Zalo bị lỗi */}
                            <label
                              onClick={() => setSmtpForm((prev) => ({ ...prev, email_booking_mode: 'on_zalo_fail' }))}
                              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition select-none ${
                                smtpForm.email_booking_mode === 'on_zalo_fail' && smtpForm.email_enabled
                                  ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300/40'
                                  : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/70'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                smtpForm.email_booking_mode === 'on_zalo_fail'
                                  ? 'bg-amber-600 border-amber-600 text-white'
                                  : 'border-slate-300 bg-white text-transparent'
                              }`}>
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>Khi Zalo bị lỗi / Hết tiền</span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">Tự Động Dự Phòng</span>
                                </div>
                                <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                                  Hệ thống ưu tiên gửi Zalo trước. Nếu Zalo bị lỗi, hết tiền số dư hoặc không gửi được qua Zalo thì hệ thống sẽ tự động kích hoạt gửi Email thay thế.
                                </div>
                              </div>
                            </label>

                            {/* Tùy chọn 3: Tắt */}
                            <label
                              onClick={() => setSmtpForm((prev) => ({ ...prev, email_booking_mode: 'disabled' }))}
                              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition select-none ${
                                smtpForm.email_booking_mode === 'disabled' || !smtpForm.email_enabled
                                  ? 'bg-slate-100 border-slate-300 text-slate-700'
                                  : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/70'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                smtpForm.email_booking_mode === 'disabled'
                                  ? 'bg-slate-700 border-slate-700 text-white'
                                  : 'border-slate-300 bg-white text-transparent'
                              }`}>
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900">Tắt</div>
                                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                  Không gửi email xác nhận lịch hẹn cho khách hàng (chỉ gửi Zalo nếu Zalo bật).
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* 2. XÁC NHẬN ỨNG VIÊN (TUYỂN DỤNG & CV) (BẬT / TẮT DẤU TICK) */}
                        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-2xs flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                  <Briefcase className="w-4 h-4 text-blue-700" />
                                  <span>Xác Nhận Ứng Viên (Tuyển Dụng &amp; CV)</span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                  Tự động gửi email biên nhận tiếp nhận hồ sơ &amp; CV cho ứng viên nộp qua website
                                </p>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                smtpForm.email_recruitment_enabled && smtpForm.email_enabled
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {smtpForm.email_recruitment_enabled && smtpForm.email_enabled ? 'Đang Bật' : 'Đang Tắt'}
                              </span>
                            </div>

                            <div className="space-y-2 pt-1">
                              {/* Tùy chọn Bật */}
                              <label
                                onClick={() => setSmtpForm((prev) => ({ ...prev, email_recruitment_enabled: true }))}
                                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition select-none ${
                                  smtpForm.email_recruitment_enabled && smtpForm.email_enabled
                                    ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-300/40'
                                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/70'
                                }`}
                              >
                                <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                  smtpForm.email_recruitment_enabled
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-slate-300 bg-white text-transparent'
                                }`}>
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                    <span>Bật Gửi Thư Xác Nhận</span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-semibold">Khuyên Dùng</span>
                                  </div>
                                  <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                                    Khi ứng viên nộp đơn ứng tuyển, hệ thống sẽ tự động gửi email thông báo Ban Nhân Sự đã tiếp nhận hồ sơ thành công.
                                  </div>
                                </div>
                              </label>

                              {/* Tùy chọn Tắt */}
                              <label
                                onClick={() => setSmtpForm((prev) => ({ ...prev, email_recruitment_enabled: false }))}
                                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition select-none ${
                                  !smtpForm.email_recruitment_enabled || !smtpForm.email_enabled
                                    ? 'bg-slate-100 border-slate-300 text-slate-700'
                                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/70'
                                }`}
                              >
                                <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                  !smtpForm.email_recruitment_enabled
                                    ? 'bg-slate-700 border-slate-700 text-white'
                                    : 'border-slate-300 bg-white text-transparent'
                                }`}>
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-900">Tắt Gửi Thư Cho Ứng Viên</div>
                                  <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                    Không gửi thư tự động cho ứng viên (hồ sơ vẫn được lưu vào hệ thống và gửi đến hòm thư Ban Nhân Sự bình thường).
                                  </div>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isSmtpLoading ? (
                      <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#2D5A27]" />
                        <span>Đang tải thông tin cấu hình email...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* CỘT TRÁI: HƯỚNG DẪN 3 BƯỚC LẤY KEY (MẬT KHẨU ỨNG DỤNG GOOGLE) */}
                        <div className="lg:col-span-5 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-amber-50/80 border border-amber-200/90 rounded-2xl p-5 space-y-4">
                          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                            <KeyRound className="w-4 h-4 text-amber-600" />
                            <span>HƯỚNG DẪN 3 BƯỚC LẤY KEY (MẬT KHẨU ỨNG DỤNG)</span>
                          </div>

                          <div className="space-y-3.5 text-xs text-slate-700">
                            {/* Bước 1 */}
                            <div className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                1
                              </span>
                              <div className="leading-relaxed">
                                <strong className="text-slate-900">Bật Xác minh 2 bước:</strong> Đăng nhập tài khoản Google tại{' '}
                                <a
                                  href="https://myaccount.google.com/security"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-700 font-semibold underline hover:text-blue-900 inline-flex items-center gap-0.5"
                                >
                                  myaccount.google.com <ExternalLink className="w-3 h-3 inline" />
                                </a>
                                , vào mục <strong>Bảo mật</strong> và kích hoạt <strong>Xác minh 2 bước</strong> (bắt buộc).
                              </div>
                            </div>

                            {/* Bước 2 */}
                            <div className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                2
                              </span>
                              <div className="leading-relaxed">
                                <strong className="text-slate-900">Truy cập Mật khẩu ứng dụng:</strong> Nhấp vào link trực tiếp{' '}
                                <a
                                  href="https://myaccount.google.com/apppasswords"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-700 font-semibold underline hover:text-blue-900 inline-flex items-center gap-0.5"
                                >
                                  myaccount.google.com/apppasswords <ExternalLink className="w-3 h-3 inline" />
                                </a>{' '}
                                (hoặc tìm kiếm từ khóa <em>&ldquo;Mật khẩu ứng dụng&rdquo;</em> trong tài khoản Google).
                              </div>
                            </div>

                            {/* Bước 3 */}
                            <div className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                3
                              </span>
                              <div className="leading-relaxed">
                                <strong className="text-slate-900">Tạo mã Key 16 chữ cái:</strong> Đặt tên ứng dụng là <em>PetMM Website</em> và bấm <strong>Tạo</strong>. Google sẽ cấp cho bạn một chuỗi <strong>16 chữ cái</strong> (Key). Hãy sao chép chuỗi này và dán vào ô <strong>Khóa bí mật / Key</strong> bên cạnh rồi bấm <strong>Lưu</strong>!
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* CỘT PHẢI: GOM CÁC Ô ĐIỀN EMAIL VÀO 1 THẺ GỌN GÀNG */}
                        <div className="lg:col-span-7 space-y-4">
                          {/* 1. Email Nhận Đặt Lịch Khám */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <CalendarCheck className="w-3.5 h-3.5 text-[#2D5A27]" />
                                <span>1. Email Nhận Đặt Lịch Khám (Booking): *</span>
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                Lễ Tân &amp; Bác Sĩ
                              </span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="email"
                                required
                                value={smtpForm.smtp_notify_email}
                                onChange={(e) => setSmtpForm((prev) => ({ ...prev, smtp_notify_email: e.target.value }))}
                                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-medium focus:border-[#2D5A27] focus:outline-none bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => handleTestSmtp(smtpForm.smtp_notify_email, 'booking')}
                                disabled={isSmtpTesting}
                                className="px-3.5 py-2.5 rounded-xl border border-emerald-300 hover:bg-emerald-50 text-emerald-800 text-xs font-semibold transition shrink-0 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title="Gửi thư thử nghiệm tới hòm thư Đặt Lịch này"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Thử</span>
                              </button>
                            </div>
                          </div>

                          {/* 2. Email Nhận Tuyển Dụng & CV */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5 text-blue-700" />
                                <span>2. Email Nhận Hồ Sơ Tuyển Dụng &amp; CV (Recruitment): *</span>
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                Ban Nhân Sự (HR)
                              </span>
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="email"
                                required
                                value={smtpForm.smtp_notify_recruitment_email}
                                onChange={(e) => setSmtpForm((prev) => ({ ...prev, smtp_notify_recruitment_email: e.target.value }))}
                                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-medium focus:border-blue-600 focus:outline-none bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => handleTestSmtp(smtpForm.smtp_notify_recruitment_email, 'recruitment')}
                                disabled={isSmtpTesting}
                                className="px-3.5 py-2.5 rounded-xl border border-blue-300 hover:bg-blue-50 text-blue-800 text-xs font-semibold transition shrink-0 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title="Gửi thư thử nghiệm tới hòm thư Tuyển Dụng này"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Thử</span>
                              </button>
                            </div>
                          </div>

                          {/* 3. Tài khoản Gmail gửi thư & Tên người gửi hiển thị (2 cột gọn gàng) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-800">
                                3. Tài khoản Gmail gửi thư (Sender Email): *
                              </label>
                              <input
                                type="email"
                                required
                                value={smtpForm.smtp_email}
                                onChange={(e) => setSmtpForm((prev) => ({ ...prev, smtp_email: e.target.value }))}
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none bg-white"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-800">
                                4. Tên người gửi hiển thị:
                              </label>
                              <input
                                type="text"
                                value={smtpForm.smtp_sender_name}
                                onChange={(e) => setSmtpForm((prev) => ({ ...prev, smtp_sender_name: e.target.value }))}
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none bg-white"
                              />
                            </div>
                          </div>

                          {/* 5. Mật khẩu ứng dụng Google (Key 16 chữ cái) */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-bold text-slate-800">
                                5. Khóa Bí Mật / Mật Khẩu Ứng Dụng (Key 16 chữ cái): *
                              </label>
                              <div className="flex items-center gap-2.5">
                                {smtpForm.hasPassword && (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>Đã cấu hình</span>
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                                  className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                                >
                                  {showSmtpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  <span>{showSmtpPassword ? 'Ẩn khóa' : 'Hiện khóa'}</span>
                                </button>
                              </div>
                            </div>
                            <input
                              type={showSmtpPassword ? 'text' : 'password'}
                              value={smtpForm.smtp_password}
                              onChange={(e) => setSmtpForm((prev) => ({ ...prev, smtp_password: e.target.value }))}
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-mono tracking-wider focus:border-[#2D5A27] focus:outline-none bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nút Submit Lưu & Nút Gửi Thử Nghiệm */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-end gap-3">
                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleTestSmtp(smtpForm.smtp_notify_email, 'booking')}
                        disabled={isSmtpTesting || isSmtpSaving}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                        title="Gửi 1 email thử nghiệm đến địa chỉ Email nhận thông báo để kiểm tra kết nối"
                      >
                        {isSmtpTesting ? <RefreshCw className="w-4 h-4 animate-spin text-[#2D5A27]" /> : <Send className="w-4 h-4 text-blue-600" />}
                        <span>{isSmtpTesting ? 'Đang gửi thư thử...' : 'Gửi Thư Thử Nghiệm'}</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isSmtpSaving || isSmtpTesting}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                      >
                        {isSmtpSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isSmtpSaving ? 'Đang lưu...' : 'Lưu Cấu Hình Email'}</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* THẺ 2: CÀI ĐẶT MẪU EMAIL XÁC NHẬN GỬI KHÁCH HÀNG & ỨNG VIÊN (SONG NGỮ VIỆT - ANH & LOGO) */}
                <form onSubmit={handleSaveEmailTemplate} className="space-y-6 pt-2">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
                    {/* BỘ CHUYỂN ĐỔI MẪU THƯ: ĐẶT LỊCH vs TUYỂN DỤNG */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200">
                      <div className="flex flex-1 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveTemplateType('booking')}
                          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                            activeTemplateType === 'booking'
                              ? 'bg-[#2D5A27] text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                          }`}
                        >
                          <CalendarCheck className="w-4 h-4" />
                          <span>1. Mẫu Thư Xác Nhận Đặt Lịch Khám</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTemplateType('recruitment')}
                          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                            activeTemplateType === 'recruitment'
                              ? 'bg-blue-700 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                          }`}
                        >
                          <Briefcase className="w-4 h-4" />
                          <span>2. Mẫu Thư Tiếp Nhận Tuyển Dụng & CV</span>
                        </button>
                      </div>

                      {/* Nút chuyển đổi ngôn ngữ & Dịch AI */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => setTemplateLangTab('vi')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              templateLangTab === 'vi'
                                ? 'bg-emerald-50 text-[#2D5A27] font-extrabold border border-emerald-200'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <span>🇻🇳 Tiếng Việt</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setTemplateLangTab('en')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              templateLangTab === 'en'
                                ? 'bg-blue-50 text-blue-800 font-extrabold border border-blue-200'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <span>🇬🇧 English</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={handleTranslateEmailTemplate}
                          disabled={isTranslatingTemplate}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                          title="Tự động dịch các nội dung tiếng Việt của mẫu này sang tiếng Anh bằng AI"
                        >
                          {isTranslatingTemplate ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                          )}
                          <span>{isTranslatingTemplate ? 'Đang dịch...' : 'Dịch sang ENG bằng AI'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Header Thẻ: Tiêu đề chi tiết theo mẫu đang chọn */}
                    <div className="pb-4 border-b border-slate-100 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                        activeTemplateType === 'booking'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {activeTemplateType === 'booking' ? <FileText className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                          <span>
                            {activeTemplateType === 'booking'
                              ? 'Mẫu Email Xác Nhận Đặt Lịch Hẹn (Gửi Khách Hàng)'
                              : 'Mẫu Email Xác Nhận Tiếp Nhận Tuyển Dụng & CV (Gửi Ứng Viên)'}
                          </span>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                            activeTemplateType === 'booking'
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                              : 'text-blue-700 bg-blue-50 border-blue-200'
                          }`}>
                            Song Ngữ VI / EN
                          </span>
                        </h2>
                      </div>
                    </div>

                    {/* KHỐI 1: CẤU HÌNH LOGO HIỂN THỊ TRONG EMAIL */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-full sm:w-2/3">
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          🖼️ Logo Hiển Thị Đầu Thư (Email Header Logo):
                        </label>
                        <input
                          type="text"
                          value={activeTemplateType === 'booking' ? (emailTemplateForm.logoUrl || '') : (recruitmentTemplateForm.logoUrl || '')}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (activeTemplateType === 'booking') {
                              setEmailTemplateForm((prev) => ({ ...prev, logoUrl: val }));
                            } else {
                              setRecruitmentTemplateForm((prev) => ({ ...prev, logoUrl: val }));
                            }
                          }}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none bg-white"
                        />
                      </div>
                      <div className="w-full sm:w-1/3 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-700 min-h-[70px]">
                        <span className="text-[10px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">Xem trước Logo:</span>
                        <img
                          src={(activeTemplateType === 'booking' ? emailTemplateForm.logoUrl : recruitmentTemplateForm.logoUrl) || '/logo_petmm_full.png'}
                          alt="Logo Preview"
                          className="max-h-10 max-w-[160px] object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/logo-favicon.png';
                          }}
                        />
                      </div>
                    </div>

                    {/* KHỐI 2: CÁC TRƯỜNG NỘI DUNG THEO TAB NGÔN NGỮ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tiêu đề Email (Subject) */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Tiêu đề Email (Email Subject) {templateLangTab === 'vi' ? '(🇻🇳 Tiếng Việt)' : '(🇬🇧 English)'}:
                        </label>
                        <input
                          type="text"
                          value={
                            activeTemplateType === 'booking'
                              ? (templateLangTab === 'vi' ? emailTemplateForm.subjectVi : emailTemplateForm.subjectEn)
                              : (templateLangTab === 'vi' ? recruitmentTemplateForm.subjectVi : recruitmentTemplateForm.subjectEn)
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            const key = templateLangTab === 'vi' ? 'subjectVi' : 'subjectEn';
                            if (activeTemplateType === 'booking') {
                              setEmailTemplateForm((prev) => ({ ...prev, [key]: val }));
                            } else {
                              setRecruitmentTemplateForm((prev) => ({ ...prev, [key]: val }));
                            }
                          }}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>

                      {/* Tiêu đề Header Banner */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Tiêu đề Banner Header {templateLangTab === 'vi' ? '(🇻🇳 Tiếng Việt)' : '(🇬🇧 English)'}:
                        </label>
                        <input
                          type="text"
                          value={
                            activeTemplateType === 'booking'
                              ? (templateLangTab === 'vi' ? emailTemplateForm.bannerTitleVi : emailTemplateForm.bannerTitleEn)
                              : (templateLangTab === 'vi' ? recruitmentTemplateForm.bannerTitleVi : recruitmentTemplateForm.bannerTitleEn)
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            const key = templateLangTab === 'vi' ? 'bannerTitleVi' : 'bannerTitleEn';
                            if (activeTemplateType === 'booking') {
                              setEmailTemplateForm((prev) => ({ ...prev, [key]: val }));
                            } else {
                              setRecruitmentTemplateForm((prev) => ({ ...prev, [key]: val }));
                            }
                          }}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>

                      {/* Phụ đề Banner */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Phụ đề Banner {templateLangTab === 'vi' ? '(🇻🇳 Tiếng Việt)' : '(🇬🇧 English)'}:
                        </label>
                        <input
                          type="text"
                          value={
                            activeTemplateType === 'booking'
                              ? (templateLangTab === 'vi' ? emailTemplateForm.bannerSubtitleVi : emailTemplateForm.bannerSubtitleEn)
                              : (templateLangTab === 'vi' ? recruitmentTemplateForm.bannerSubtitleVi : recruitmentTemplateForm.bannerSubtitleEn)
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            const key = templateLangTab === 'vi' ? 'bannerSubtitleVi' : 'bannerSubtitleEn';
                            if (activeTemplateType === 'booking') {
                              setEmailTemplateForm((prev) => ({ ...prev, [key]: val }));
                            } else {
                              setRecruitmentTemplateForm((prev) => ({ ...prev, [key]: val }));
                            }
                          }}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>

                      {/* Lời nhắn mở đầu / Cảm ơn */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {activeTemplateType === 'booking'
                            ? `Lời cảm ơn / Thông điệp mở đầu ${templateLangTab === 'vi' ? '(🇻🇳 Tiếng Việt)' : '(🇬🇧 English)'}:`
                            : `Lời mở đầu gửi ứng viên ${templateLangTab === 'vi' ? '(🇻🇳 Tiếng Việt)' : '(🇬🇧 English)'}:`}
                        </label>
                        <textarea
                          rows={2}
                          value={
                            activeTemplateType === 'booking'
                              ? (templateLangTab === 'vi' ? emailTemplateForm.introVi : emailTemplateForm.introEn)
                              : (templateLangTab === 'vi' ? recruitmentTemplateForm.introVi : recruitmentTemplateForm.introEn)
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            const key = templateLangTab === 'vi' ? 'introVi' : 'introEn';
                            if (activeTemplateType === 'booking') {
                              setEmailTemplateForm((prev) => ({ ...prev, [key]: val }));
                            } else {
                              setRecruitmentTemplateForm((prev) => ({ ...prev, [key]: val }));
                            }
                          }}
                          className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-none"
                        />
                      </div>

                      {/* Lưu ý chuẩn bị trước khi đến / Quy trình xét duyệt (Checklist) */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {activeTemplateType === 'booking'
                            ? `Lưu ý chuẩn bị trước khi đến (Mỗi dòng 1 lưu ý) ${templateLangTab === 'vi' ? '(🇻🇳 Tiếng Việt)' : '(🇬🇧 English)'}:`
                            : `Quy trình xét duyệt & Hướng dẫn phỏng vấn (Mỗi dòng 1 lưu ý) ${templateLangTab === 'vi' ? '(🇻🇳 Tiếng Việt)' : '(🇬🇧 English)'}:`}
                        </label>
                        <textarea
                          rows={3}
                          value={
                            activeTemplateType === 'booking'
                              ? (templateLangTab === 'vi' ? emailTemplateForm.checklistVi : emailTemplateForm.checklistEn)
                              : (templateLangTab === 'vi' ? recruitmentTemplateForm.checklistVi : recruitmentTemplateForm.checklistEn)
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            const key = templateLangTab === 'vi' ? 'checklistVi' : 'checklistEn';
                            if (activeTemplateType === 'booking') {
                              setEmailTemplateForm((prev) => ({ ...prev, [key]: val }));
                            } else {
                              setRecruitmentTemplateForm((prev) => ({ ...prev, [key]: val }));
                            }
                          }}
                          className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none font-sans"
                        />
                      </div>

                      {/* Lời nhắn chân thư */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Lời nhắn chân thư / Chữ ký ban quản lý {templateLangTab === 'vi' ? '(🇻🇳 Tiếng Việt)' : '(🇬🇧 English)'}:
                        </label>
                        <input
                          type="text"
                          value={
                            activeTemplateType === 'booking'
                              ? (templateLangTab === 'vi' ? emailTemplateForm.footerVi : emailTemplateForm.footerEn)
                              : (templateLangTab === 'vi' ? recruitmentTemplateForm.footerVi : recruitmentTemplateForm.footerEn)
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            const key = templateLangTab === 'vi' ? 'footerVi' : 'footerEn';
                            if (activeTemplateType === 'booking') {
                              setEmailTemplateForm((prev) => ({ ...prev, [key]: val }));
                            } else {
                              setRecruitmentTemplateForm((prev) => ({ ...prev, [key]: val }));
                            }
                          }}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* HƯỚNG DẪN THẺ ĐỘNG (TAGS) */}
                    {activeTemplateType === 'booking' ? (
                      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                        <div className="font-bold mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>Các thẻ biến động tự thay thế thông minh (Đặt Lịch Khám):</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] font-mono mt-1.5">
                          <span className="px-2 py-0.5 rounded bg-white border border-amber-300">{"{booking_code}"} : Mã đặt lịch</span>
                          <span className="px-2 py-0.5 rounded bg-white border border-amber-300">{"{pet_name}"} : Tên bé cưng</span>
                          <span className="px-2 py-0.5 rounded bg-white border border-amber-300">{"{owner_name}"} : Tên chủ nuôi</span>
                          <span className="px-2 py-0.5 rounded bg-white border border-amber-300">{"{branch_name}"} : Cơ sở tiếp đón</span>
                          <span className="px-2 py-0.5 rounded bg-white border border-amber-300">{"{service}"} : Tên dịch vụ</span>
                          <span className="px-2 py-0.5 rounded bg-white border border-amber-300">{"{date_time}"} : Ngày & Khung giờ</span>
                          <span className="px-2 py-0.5 rounded bg-white border border-amber-300">{"{hotline}"} : Hotline phòng khám</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                        <div className="font-bold mb-1 flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                          <span>Các thẻ biến động tự thay thế thông minh (Tiếp Nhận Tuyển Dụng & CV):</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] font-mono mt-1.5">
                          <span className="px-2 py-0.5 rounded bg-white border border-blue-300">{"{candidate_name}"} : Tên ứng viên</span>
                          <span className="px-2 py-0.5 rounded bg-white border border-blue-300">{"{job_title}"} : Vị trí ứng tuyển</span>
                          <span className="px-2 py-0.5 rounded bg-white border border-blue-300">{"{phone}"} : Số điện thoại</span>
                          <span className="px-2 py-0.5 rounded bg-white border border-blue-300">{"{email}"} : Email ứng viên</span>
                          <span className="px-2 py-0.5 rounded bg-white border border-blue-300">{"{apply_time}"} : Thời gian nộp</span>
                          <span className="px-2 py-0.5 rounded bg-white border border-blue-300">{"{hotline}"} : Hotline tuyển dụng</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nút lưu mẫu thư & gửi thử */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-end gap-3">
                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleTestTemplateEmail}
                        disabled={isSmtpTesting || isTemplateSaving}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                        title="Gửi 1 email mẫu theo loại và ngôn ngữ đang chọn để kiểm tra"
                      >
                        {isSmtpTesting ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-[#2D5A27]" />
                        ) : (
                          <Send className="w-4 h-4 text-emerald-600" />
                        )}
                        <span>
                          {activeTemplateType === 'booking'
                            ? `Gửi Thử Mẫu Lịch Hẹn (${templateLangTab === 'en' ? 'English' : 'Tiếng Việt'})`
                            : `Gửi Thử Mẫu Tuyển Dụng (${templateLangTab === 'en' ? 'English' : 'Tiếng Việt'})`}
                        </span>
                      </button>

                      <button
                        type="submit"
                        disabled={isTemplateSaving || isSmtpTesting}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                      >
                        {isTemplateSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isTemplateSaving ? 'Đang lưu...' : 'Lưu Tất Cả Mẫu Email'}</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* THẺ 3: CÀI ĐẶT CHỐNG SPAM ĐẶT LỊCH (IP, SĐT, EMAIL & SỐ LẦN) */}
                <div className="pt-2">
                  {renderAntiSpamCard()}
                </div>
                </>
              )}

              {/* NHÁNH: CẤU HÌNH ZALO OFFICIAL ACCOUNT (ZNS) */}
              {configSubTab === 'zalo' && (
                <form onSubmit={handleSaveZalo} className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
                    {/* Header Thẻ */}
                    <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0068FF] flex items-center justify-center border border-blue-200 shrink-0 font-black text-sm">
                          Z
                        </div>
                        <div>
                          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                            <span>Cấu Hình Kết Nối Zalo Official Account (Zalo OA / ZNS)</span>
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Cấu hình thông số kỹ thuật API để nhân viên gửi tin nhắn Zalo ZNS xác nhận lịch hẹn và đánh giá dịch vụ.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Cột trái: Thử nghiệm ZNS & Hướng dẫn */}
                      <div className="lg:col-span-5 space-y-4">
                        {/* Box thử nghiệm Zalo ZNS */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 border-2 border-blue-200/90 shadow-2xs space-y-3.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                              <Send className="w-4 h-4 text-blue-600" />
                              <span>GỬI THỬ NGHIỆM TIN NHẮN ZALO ZNS</span>
                            </div>
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold inline-flex items-center gap-1 w-fit border border-blue-200/80">
                              <CheckCircle2 className="w-3 h-3 text-blue-600" />
                              <span>Mẫu {testZaloTemplateType === 'review' ? (zaloForm.zalo_review_template_id || 'Chưa nhập') : (zaloForm.zalo_template_id || 'Chưa nhập')}</span>
                            </span>
                          </div>

                          {/* Bộ chọn mẫu tin nhắn để test */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                              <span>Chọn mẫu tin nhắn ZNS để kiểm tra:</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setTestZaloTemplateType('booking')}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                  testZaloTemplateType === 'booking'
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/30'
                                    : 'bg-white hover:bg-blue-50/50 text-slate-700 border-blue-200 hover:border-blue-300'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="text-[11px] font-bold flex items-center gap-1.5">
                                    <CalendarCheck className="w-3.5 h-3.5" />
                                    <span>Xác Nhận Lịch Hẹn</span>
                                  </span>
                                  {testZaloTemplateType === 'booking' && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                                  )}
                                </div>
                                <div className={`text-[10px] font-semibold truncate ${testZaloTemplateType === 'booking' ? 'text-blue-100' : 'text-slate-500'}`}>
                                  ID: {zaloForm.zalo_template_id || '(Chưa nhập)'}
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => setTestZaloTemplateType('review')}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                  testZaloTemplateType === 'review'
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-500/30'
                                    : 'bg-white hover:bg-blue-50/50 text-slate-700 border-blue-200 hover:border-blue-300'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="text-[11px] font-bold flex items-center gap-1.5">
                                    <Star className="w-3.5 h-3.5" />
                                    <span>Đánh Giá Dịch Vụ</span>
                                  </span>
                                  {testZaloTemplateType === 'review' && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                                  )}
                                </div>
                                <div className={`text-[10px] font-semibold truncate ${testZaloTemplateType === 'review' ? 'text-blue-100' : 'text-slate-500'}`}>
                                  ID: {zaloForm.zalo_review_template_id || '(Chưa nhập)'}
                                </div>
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                                <span>Số điện thoại nhận tin ZNS thử nghiệm:</span>
                              </span>
                              {zaloForm.zalo_test_phone && (
                                <button
                                  type="button"
                                  onClick={() => setZaloForm((prev) => ({ ...prev, zalo_test_phone: '' }))}
                                  className="text-[10px] text-slate-400 hover:text-red-500 cursor-pointer"
                                >
                                  Xóa SĐT
                                </button>
                              )}
                            </label>
                            <input
                              type="tel"
                              placeholder="Nhập số điện thoại (ví dụ: 0912345678)"
                              value={zaloForm.zalo_test_phone}
                              onChange={(e) => setZaloForm((prev) => ({ ...prev, zalo_test_phone: e.target.value }))}
                              className="w-full text-xs font-bold text-blue-900 px-3.5 py-2.5 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white shadow-2xs placeholder:font-normal placeholder:text-slate-400"
                            />
                            <button
                              type="button"
                              onClick={() => handleTestZalo()}
                              disabled={isZaloTesting}
                              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow transition cursor-pointer"
                            >
                              {isZaloTesting ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  <span>Đang gửi thử mẫu {testZaloTemplateType === 'review' ? 'Đánh Giá Dịch Vụ' : 'Xác Nhận Lịch'}...</span>
                                </>
                              ) : (
                                <>
                                  <Send className="w-4 h-4" />
                                  <span>Gửi Thử {testZaloTemplateType === 'review' ? 'Mẫu Đánh Giá Dịch Vụ' : 'Mẫu Xác Nhận Lịch Hẹn'} Ngay</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Hướng dẫn 5 thông số kỹ thuật */}
                        <div className="bg-gradient-to-br from-blue-50/90 via-sky-50/40 to-blue-50/80 border border-blue-200/90 rounded-2xl p-5 space-y-3.5">
                          <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                            <KeyRound className="w-4 h-4 text-blue-600" />
                            <span>5 THÔNG SỐ KỸ THUẬT ZNS</span>
                          </div>
                          <div className="space-y-3 text-xs text-slate-700">
                            <div className="flex items-start gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">1</span>
                              <div>
                                <strong className="text-slate-900">ZALO_OA_ID:</strong> ID định danh Zalo OA (xem trên góc trang{' '}
                                <a href="https://oa.zalo.me" target="_blank" rel="noreferrer" className="text-blue-700 underline font-semibold">oa.zalo.me</a>).
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">2</span>
                              <div>
                                <strong className="text-slate-900">ZALO_APP_ID:</strong> ID ứng dụng Zalo trên{' '}
                                <a href="https://developers.zalo.me" target="_blank" rel="noreferrer" className="text-blue-700 underline font-semibold">developers.zalo.me</a> liên kết với OA.
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">3</span>
                              <div>
                                <strong className="text-slate-900">ZALO_SECRET_KEY:</strong> Khóa bí mật (Secret Key) của ứng dụng Zalo.
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">4</span>
                              <div>
                                <strong className="text-slate-900">ZALO_TEMPLATE_ID:</strong> Mã ID mẫu tin nhắn ZNS đã được Zalo phê duyệt.
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">5</span>
                              <div>
                                <strong className="text-slate-900">ACCESS & REFRESH TOKEN:</strong> Lấy tại{' '}
                                <a href="https://developers.zalo.me/tools/explorer" target="_blank" rel="noreferrer" className="text-blue-700 underline font-semibold">API Explorer</a> để gọi ZNS và tự động gia hạn token.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cột phải: Các Ô nhập liệu (Đã bỏ toàn bộ chú thích bên dưới ô) */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Trường 1: ZALO_OA_ID */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <span>1. ZALO_OA_ID:</span>
                            </label>
                            <input
                              type="text"
                              value={zaloForm.zalo_oa_id}
                              onChange={(e) => setZaloForm((prev) => ({ ...prev, zalo_oa_id: e.target.value }))}
                              className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                            />
                          </div>

                          {/* Trường 2: ZALO_APP_ID */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <span>2. ZALO_APP_ID:</span>
                            </label>
                            <input
                              type="text"
                              value={zaloForm.zalo_app_id}
                              onChange={(e) => setZaloForm((prev) => ({ ...prev, zalo_app_id: e.target.value }))}
                              className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                            />
                          </div>
                        </div>

                        {/* Trường 3: ZALO_SECRET_KEY */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-800">
                              <span>3. ZALO_SECRET_KEY:</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowZaloSecret((prev) => !prev)}
                              className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                            >
                              {showZaloSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              <span>{showZaloSecret ? 'Ẩn khóa' : 'Hiện khóa'}</span>
                            </button>
                          </div>
                          <input
                            type={showZaloSecret ? 'text' : 'password'}
                            value={zaloForm.zalo_secret_key}
                            onChange={(e) => setZaloForm((prev) => ({ ...prev, zalo_secret_key: e.target.value }))}
                            className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                          />
                        </div>

                        {/* Trường 5: ZALO_ACCESS_TOKEN & REFRESH_TOKEN */}
                        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                              <span>5. Zalo Access Token & Refresh Token:</span>
                            </label>
                            <div className="flex items-center gap-3">
                              <a
                                href="https://developers.zalo.me/tools/explorer"
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-blue-700 hover:underline flex items-center gap-1 font-semibold"
                              >
                                <span>Lấy Token tại API Explorer</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <button
                                type="button"
                                onClick={() => setShowZaloToken((prev) => !prev)}
                                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                              >
                                {showZaloToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                <span>{showZaloToken ? 'Ẩn token' : 'Hiện token'}</span>
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-[11px] font-semibold text-slate-700">Access Token:</span>
                              <input
                                type={showZaloToken ? 'text' : 'password'}
                                value={zaloForm.zalo_access_token}
                                onChange={(e) => setZaloForm((prev) => ({ ...prev, zalo_access_token: e.target.value }))}
                                className="w-full text-xs font-mono px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[11px] font-semibold text-slate-700">Refresh Token:</span>
                              <input
                                type={showZaloToken ? 'text' : 'password'}
                                value={zaloForm.zalo_refresh_token}
                                onChange={(e) => setZaloForm((prev) => ({ ...prev, zalo_refresh_token: e.target.value }))}
                                className="w-full text-xs font-mono px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                              />
                            </div>
                          </div>
                        </div>

                        {/* TÁCH RÕ 2 TEMPLATE ID CHO 2 MỤC ĐÍCH */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Trường 4A: Template ID Xác nhận lịch hẹn */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <span>4. Template ID Xác Nhận Lịch Hẹn:</span>
                            </label>
                            <input
                              type="text"
                              value={zaloForm.zalo_template_id}
                              onChange={(e) => setZaloForm((prev) => ({ ...prev, zalo_template_id: e.target.value }))}
                              className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                            />
                          </div>

                          {/* Trường 4B: Template ID Đánh giá */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <span>Template ID Đánh Giá Dịch Vụ:</span>
                            </label>
                            <input
                              type="text"
                              value={zaloForm.zalo_review_template_id}
                              onChange={(e) => setZaloForm((prev) => ({ ...prev, zalo_review_template_id: e.target.value }))}
                              className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Nút lưu Zalo */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                      <button
                        type="submit"
                        disabled={isZaloSaving}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0068FF] hover:bg-[#0057d9] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                      >
                        {isZaloSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isZaloSaving ? 'Đang lưu...' : 'Lưu Cấu Hình Zalo OA'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* NHÁNH: CẤU HÌNH CHỐNG SPAM ĐẶT LỊCH (KHI CHỌN TRỰC TIẾP TỪ MENU SIDEBAR) */}
              {configSubTab === 'spam' && (
                <div className="space-y-6">
                  {renderAntiSpamCard()}
                </div>
              )}

              {/* NHÁNH: NHẬT KÝ & BỘ ĐẾM GỬI TIN */}
              {configSubTab === 'notification-logs' && (
                <div className="space-y-6">
                  <AdminNotificationLogsManager />
                </div>
              )}

              {/* NHÁNH 2: GIỚI THIỆU & TRIẾT LÝ */}
              {/* NHÁNH 2: GIỚI THIỆU & TRIẾT LÝ (SONG NGỮ VIỆT - ANH & AI DỊCH THUẬT) */}
              {configSubTab === 'about' && (
                <form onSubmit={handleSaveConfig} className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
                    {/* Header Thẻ: Tiêu đề + Chuyển Ngôn Ngữ + Nút Dịch AI nằm chung hàng */}
                    <div className="pb-3 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2D5A27] flex items-center justify-center border border-emerald-200 shrink-0">
                          <Heart className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 leading-tight">
                            Sứ Mệnh &amp; Triết Lý Y Khoa (Giới Thiệu PetM&amp;M)
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Lựa chọn Tiếng Việt hoặc English để chỉnh sửa.
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Tab Ngôn ngữ */}
                        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setAboutSubLang('vi')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              aboutSubLang === 'vi'
                                ? 'bg-[#2D5A27] text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                            <span>Tiếng Việt</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAboutSubLang('en')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              aboutSubLang === 'en'
                                ? 'bg-[#2D5A27] text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <UKFlag className="w-4 h-3 rounded-[2px]" />
                            <span>English</span>
                          </button>
                        </div>

                        {/* Nút Cài đặt tiêu đề mục */}
                        <button
                          type="button"
                          onClick={handleOpenAboutTitleModal}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold shadow-xs hover:shadow transition shrink-0 cursor-pointer"
                          title="Cài đặt Tiêu đề & Chú thích hiển thị trên Trang chủ (Rich Text Editor)"
                        >
                          <Settings className="w-4 h-4 text-amber-700" />
                          <span>Cài Đặt Tiêu Đề Mục</span>
                        </button>

                        {/* Nút Chuyển đổi ENG */}
                        <button
                          type="button"
                          onClick={handleAutoTranslateAbout}
                          disabled={isTranslatingAbout}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs hover:shadow transition disabled:opacity-50 cursor-pointer"
                          title="Tự động dịch toàn bộ nội dung Giới thiệu Tiếng Việt sang Tiếng Anh bằng AI"
                        >
                          {isTranslatingAbout ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          <span>{isTranslatingAbout ? 'Đang chuyển đổi...' : 'Chuyển đổi ENG'}</span>
                        </button>
                      </div>
                    </div>

                    {/* CÁC TRƯỜNG DỮ LIỆU TIẾNG VIỆT */}
                    {aboutSubLang === 'vi' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Huy hiệu trên tiêu đề:
                            </label>
                            <input
                              type="text"
                              value={configForm.gioi_thieu_huy_hieu || ''}
                              onChange={(e) =>
                                setConfigForm((prev) => ({ ...prev, gioi_thieu_huy_hieu: e.target.value }))
                              }
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:border-[#2D5A27] focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">VD: SỨ MỆNH &amp; TRIẾT LÝ PET M&amp;M</p>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Dòng tiêu đề chính 1:
                            </label>
                            <input
                              type="text"
                              value={configForm.gioi_thieu_tieu_de_1 || ''}
                              onChange={(e) =>
                                setConfigForm((prev) => ({ ...prev, gioi_thieu_tieu_de_1: e.target.value }))
                              }
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:border-[#2D5A27] focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">VD: Nâng Tầm Chăm Sóc Y Khoa</p>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Dòng tiêu đề 2 (Màu xanh rêu):
                            </label>
                            <input
                              type="text"
                              value={configForm.gioi_thieu_tieu_de_2 || ''}
                              onChange={(e) =>
                                setConfigForm((prev) => ({ ...prev, gioi_thieu_tieu_de_2: e.target.value }))
                              }
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold text-[#2D5A27] focus:border-[#2D5A27] focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">VD: Bằng Trái Tim &amp; Y Đức</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Nội dung đoạn văn sứ mệnh:
                          </label>
                          <textarea
                            rows={4}
                            value={configForm.gioi_thieu_mo_ta || ''}
                            onChange={(e) =>
                              setConfigForm((prev) => ({ ...prev, gioi_thieu_mo_ta: e.target.value }))
                            }
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-y leading-relaxed"
                          />
                        </div>

                        <div className="pt-3 border-t border-slate-100 space-y-3">
                          <h3 className="text-xs font-bold text-slate-800">
                            Khối &ldquo;Cam Kết Vàng Y Khoa&rdquo; &amp; Bác Sĩ Đại Diện:
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Tiêu đề khối cam kết:
                              </label>
                              <input
                                type="text"
                                value={configForm.gioi_thieu_cam_ket_tieu_de || ''}
                                onChange={(e) =>
                                  setConfigForm((prev) => ({ ...prev, gioi_thieu_cam_ket_tieu_de: e.target.value }))
                                }
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Phụ đề khối cam kết:
                              </label>
                              <input
                                type="text"
                                value={configForm.gioi_thieu_cam_ket_phu || ''}
                                onChange={(e) =>
                                  setConfigForm((prev) => ({ ...prev, gioi_thieu_cam_ket_phu: e.target.value }))
                                }
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Câu trích dẫn tâm niệm y đức:
                            </label>
                            <input
                              type="text"
                              value={configForm.gioi_thieu_trich_dan || ''}
                              onChange={(e) =>
                                setConfigForm((prev) => ({ ...prev, gioi_thieu_trich_dan: e.target.value }))
                              }
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 italic focus:border-[#2D5A27] focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Họ tên bác sĩ đại diện:
                              </label>
                              <input
                                type="text"
                                value={configForm.gioi_thieu_bac_si_ten || ''}
                                onChange={(e) =>
                                  setConfigForm((prev) => ({ ...prev, gioi_thieu_bac_si_ten: e.target.value }))
                                }
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-bold text-[#2D5A27] focus:border-[#2D5A27] focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Chức danh bác sĩ:
                              </label>
                              <input
                                type="text"
                                value={configForm.gioi_thieu_bac_si_chuc_danh || ''}
                                onChange={(e) =>
                                  setConfigForm((prev) => ({ ...prev, gioi_thieu_bac_si_chuc_danh: e.target.value }))
                                }
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CÁC TRƯỜNG DỮ LIỆU TIẾNG ANH (ENGLISH / DATABASE) */}
                    {aboutSubLang === 'en' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                              <span>Badge on title (EN):</span>
                              <span className="text-[10px] text-blue-600 font-normal">gioi_thieu_huy_hieu_en</span>
                            </label>
                            <input
                              type="text"
                              value={configForm.gioi_thieu_huy_hieu_en || ''}
                              onChange={(e) =>
                                setConfigForm((prev) => ({ ...prev, gioi_thieu_huy_hieu_en: e.target.value }))
                              }
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:border-[#2D5A27] focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Ex: MISSION &amp; PHILOSOPHY</p>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                              <span>Main title line 1 (EN):</span>
                              <span className="text-[10px] text-blue-600 font-normal">gioi_thieu_tieu_de_1_en</span>
                            </label>
                            <input
                              type="text"
                              value={configForm.gioi_thieu_tieu_de_1_en || ''}
                              onChange={(e) =>
                                setConfigForm((prev) => ({ ...prev, gioi_thieu_tieu_de_1_en: e.target.value }))
                              }
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:border-[#2D5A27] focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Ex: Elevating Veterinary Medicine</p>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                              <span>Main title line 2 (EN):</span>
                              <span className="text-[10px] text-blue-600 font-normal">gioi_thieu_tieu_de_2_en</span>
                            </label>
                            <input
                              type="text"
                              value={configForm.gioi_thieu_tieu_de_2_en || ''}
                              onChange={(e) =>
                                setConfigForm((prev) => ({ ...prev, gioi_thieu_tieu_de_2_en: e.target.value }))
                              }
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold text-[#2D5A27] focus:border-[#2D5A27] focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Ex: With Integrity &amp; Compassion</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                            <span>Mission description (EN):</span>
                            <span className="text-[10px] text-blue-600 font-normal">gioi_thieu_mo_ta_en</span>
                          </label>
                          <textarea
                            rows={4}
                            value={configForm.gioi_thieu_mo_ta_en || ''}
                            onChange={(e) =>
                              setConfigForm((prev) => ({ ...prev, gioi_thieu_mo_ta_en: e.target.value }))
                            }
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-y leading-relaxed"
                          />
                        </div>

                        <div className="pt-3 border-t border-slate-100 space-y-3">
                          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                            <span>Commitment &amp; Doctor Representative (English):</span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Commitment title (EN):
                              </label>
                              <input
                                type="text"
                                value={configForm.gioi_thieu_cam_ket_tieu_de_en || ''}
                                onChange={(e) =>
                                  setConfigForm((prev) => ({ ...prev, gioi_thieu_cam_ket_tieu_de_en: e.target.value }))
                                }
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Commitment subtitle (EN):
                              </label>
                              <input
                                type="text"
                                value={configForm.gioi_thieu_cam_ket_phu_en || ''}
                                onChange={(e) =>
                                  setConfigForm((prev) => ({ ...prev, gioi_thieu_cam_ket_phu_en: e.target.value }))
                                }
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Veterinary medical quote (EN):
                            </label>
                            <input
                              type="text"
                              value={configForm.gioi_thieu_trich_dan_en || ''}
                              onChange={(e) =>
                                setConfigForm((prev) => ({ ...prev, gioi_thieu_trich_dan_en: e.target.value }))
                              }
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 italic focus:border-[#2D5A27] focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Doctor representative name (EN):
                              </label>
                              <input
                                type="text"
                                value={configForm.gioi_thieu_bac_si_ten_en || ''}
                                onChange={(e) =>
                                  setConfigForm((prev) => ({ ...prev, gioi_thieu_bac_si_ten_en: e.target.value }))
                                }
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-bold text-[#2D5A27] focus:border-[#2D5A27] focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Doctor title / position (EN):
                              </label>
                              <input
                                type="text"
                                value={configForm.gioi_thieu_bac_si_chuc_danh_en || ''}
                                onChange={(e) =>
                                  setConfigForm((prev) => ({ ...prev, gioi_thieu_bac_si_chuc_danh_en: e.target.value }))
                                }
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* KHỐI THỐNG KÊ (NĂM THÀNH LẬP & KHÁCH HÀNG) */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-[#2D5A27]" />
                        <span>Thông Số Thống Kê Giới Thiệu</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Năm thành lập:
                          </label>
                          <input
                            type="text"
                            value={configForm.thong_ke_nam_thanh_lap || ''}
                            onChange={(e) =>
                              setConfigForm((prev) => ({ ...prev, thong_ke_nam_thanh_lap: e.target.value }))
                            }
                            placeholder="2018"
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-bold focus:border-[#2D5A27] focus:outline-none bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Khách hàng:
                          </label>
                          <input
                            type="text"
                            value={configForm.thong_ke_khach_hang || ''}
                            onChange={(e) =>
                              setConfigForm((prev) => ({ ...prev, thong_ke_khach_hang: e.target.value }))
                            }
                            placeholder="30k+"
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-bold focus:border-[#2D5A27] focus:outline-none bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* KHỐI SLIDE ẢNH GIỚI THIỆU */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-[#2D5A27]" />
                            <span>Slide Ảnh Giới Thiệu ({aboutSlides.length} ảnh)</span>
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Hình ảnh trình chiếu trong khung trượt tại trang chủ và trang Đội ngũ y tế.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddNewAboutSlide}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-2xs transition cursor-pointer shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm Ảnh Slide</span>
                        </button>
                      </div>

                      {aboutSlidesLoading && aboutSlides.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-[#2D5A27]" />
                          <span>Đang tải danh sách slide ảnh...</span>
                        </div>
                      ) : aboutSlides.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl space-y-2">
                          <p>Chưa có ảnh slide nào trong danh sách.</p>
                          <button
                            type="button"
                            onClick={handleAddNewAboutSlide}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2D5A27] text-white text-xs font-semibold cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Thêm ảnh slide đầu tiên</span>
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {aboutSlides.map((slide, idx) => (
                            <div
                              key={slide.id || idx}
                              className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-sm transition flex flex-col justify-between"
                            >
                              <div>
                                <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-200 mb-2.5">
                                  <img
                                    src={slide.duong_dan_anh}
                                    alt={slide.tieu_de || 'Ảnh slide'}
                                    className="w-full h-full object-cover"
                                  />
                                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                                    {slide.alt_text || 'Đội ngũ'}
                                  </span>
                                </div>
                                <p className="text-xs font-bold text-slate-800 truncate" title={slide.tieu_de}>
                                  {slide.tieu_de}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => handleToggleAboutSlideActive(slide)}
                                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition ${
                                    slide.kich_hoat !== false
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                  }`}
                                >
                                  {slide.kich_hoat !== false ? 'Hiển thị' : 'Đang ẩn'}
                                </button>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleEditAboutSlide(slide)}
                                    className="p-1.5 rounded-lg text-slate-600 hover:text-[#2D5A27] hover:bg-slate-100 cursor-pointer transition"
                                    title="Chỉnh sửa ảnh"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAboutSlide(slide)}
                                    className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition"
                                    title="Xóa ảnh slide"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nút Submit lưu nhánh Giới thiệu */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      Nội dung giới thiệu và thông số thống kê sẽ được cập nhật đồng bộ lên trang web.
                    </p>
                    <button
                      type="submit"
                      disabled={isConfigSaving}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                    >
                      {isConfigSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>{isConfigSaving ? 'Đang lưu...' : 'Lưu Cài Đặt Giới Thiệu'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* NHÁNH 5: KHẨU HIỆU & SLOGAN */}
              {configSubTab === 'slogans' && (
                <form onSubmit={handleSaveConfig} className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
                    <div className="pb-3 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2D5A27] flex items-center justify-center border border-emerald-200 shrink-0">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 leading-tight">
                            Khẩu Hiệu &amp; Slogan Hệ Thống
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Lựa chọn Tiếng Việt hoặc English để chỉnh sửa.
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Tab Ngôn ngữ */}
                        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setSloganSubLang('vi')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              sloganSubLang === 'vi'
                                ? 'bg-[#2D5A27] text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                            <span>Tiếng Việt</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSloganSubLang('en')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              sloganSubLang === 'en'
                                ? 'bg-[#2D5A27] text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <UKFlag className="w-4 h-3 rounded-[2px]" />
                            <span>English</span>
                          </button>
                        </div>

                        {/* Nút Chuyển đổi ENG */}
                        <button
                          type="button"
                          onClick={handleAutoTranslateSlogans}
                          disabled={isTranslatingSlogans}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs hover:shadow transition disabled:opacity-50 cursor-pointer"
                          title="Tự động dịch toàn bộ khẩu hiệu Tiếng Việt sang Tiếng Anh bằng AI"
                        >
                          {isTranslatingSlogans ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          <span>{isTranslatingSlogans ? 'Đang chuyển đổi...' : 'Chuyển đổi ENG'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* CẤU HÌNH LOGO & TÊN TRÊN THANH ĐỊA CHỈ (TAB TRÌNH DUYỆT) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
                    <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            Logo &amp; Tên Trên Thanh Địa Chỉ (Tab Trình Duyệt / Favicon)
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Tùy chỉnh Logo biểu tượng và tiêu đề trang hiển thị trên tab trình duyệt (hỗ trợ Tiếng Việt &amp; English).
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        Browser Tab
                      </span>
                    </div>

                    {/* MÔ PHỎNG TAB TRÌNH DUYỆT THỰC TẾ (LIVE PREVIEW) */}
                    <div className="p-3.5 bg-slate-100/70 rounded-xl border border-slate-200 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span>Xem trước hiển thị trên thanh địa chỉ tab trình duyệt:</span>
                      </div>
                      <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-t-xl bg-white border border-slate-200 shadow-xs max-w-md">
                        <img
                          src={configForm.logo_favicon || '/logo-favicon.png'}
                          alt="Logo Favicon"
                          className="w-4 h-4 object-contain shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo-favicon.png';
                          }}
                        />
                        <span className="text-xs font-medium text-slate-800 truncate">
                          {sloganSubLang === 'vi'
                            ? configForm.tieu_de_trang || 'PetM&M — Phòng Khám Thuộc Bệnh Viện Thú Cưng'
                            : configForm.tieu_de_trang_en || 'PetM&M - Homepage'}
                        </span>
                        <X className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                      {/* PHẦN 1: LOGO TRÊN THANH ĐỊA CHỈ (FAVICON ICON) */}
                      <div className="md:col-span-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                        <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>Logo Icon (Favicon):</span>
                          <span className="text-[10px] text-slate-500 font-normal">PNG, ICO, SVG, WEBP</span>
                        </label>

                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl border border-slate-200 bg-white p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
                            <img
                              src={configForm.logo_favicon || '/logo-favicon.png'}
                              alt="Favicon"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/logo-favicon.png';
                              }}
                            />
                          </div>

                          <div className="space-y-1.5 flex-1 min-w-0">
                            <input
                              type="file"
                              ref={faviconFileInputRef}
                              onChange={handleFaviconUpload}
                              accept="image/png,image/x-icon,image/svg+xml,image/jpeg,image/webp"
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => faviconFileInputRef.current?.click()}
                              disabled={isFaviconUploading}
                              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                            >
                              {isFaviconUploading ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2D5A27]" />
                              ) : (
                                <Upload className="w-3.5 h-3.5 text-[#2D5A27]" />
                              )}
                              <span>{isFaviconUploading ? 'Đang tải lên...' : 'Tải Logo Mới'}</span>
                            </button>
                            <p className="text-[10px] text-slate-400">
                              Khuyên dùng kích thước vuông (32x32, 64x64 hoặc 128x128 px)
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Hoặc đường dẫn logo trực tiếp:
                          </label>
                          <input
                            type="text"
                            value={configForm.logo_favicon || ''}
                            onChange={(e) => setConfigForm((prev) => ({ ...prev, logo_favicon: e.target.value }))}
                            placeholder="/logo-favicon.png"
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* PHẦN 2: TÊN TRÊN THANH ĐỊA CHỈ (THEO NGÔN NGỮ ĐANG CHỌN) */}
                      <div className="md:col-span-7 space-y-3.5">
                        {sloganSubLang === 'vi' ? (
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                              <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                              <span>Tên website trên thanh địa chỉ (Tiếng Việt):</span>
                            </label>
                            <input
                              type="text"
                              value={configForm.tieu_de_trang || ''}
                              onChange={(e) => setConfigForm((prev) => ({ ...prev, tieu_de_trang: e.target.value }))}
                              placeholder="PetM&M — Phòng Khám Thuộc Bệnh Viện Thú Cưng"
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:border-[#2D5A27] focus:outline-none bg-white shadow-2xs"
                            />
                            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                              Xuất hiện trên tiêu đề tab trình duyệt khi người xem chọn Tiếng Việt. Tiêu chuẩn SEO tốt nhất cho Google và nhận diện thương hiệu.
                            </p>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-xs font-bold text-blue-700 mb-1.5 flex items-center gap-1.5">
                              <UKFlag className="w-4 h-3 rounded-[2px]" />
                              <span>Tên website trên thanh địa chỉ (English):</span>
                            </label>
                            <input
                              type="text"
                              value={configForm.tieu_de_trang_en || ''}
                              onChange={(e) => setConfigForm((prev) => ({ ...prev, tieu_de_trang_en: e.target.value }))}
                              placeholder="PetM&M - Homepage (hoặc PetM&M — Veterinary Hospital & Clinic)"
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:border-[#2D5A27] focus:outline-none bg-white shadow-2xs"
                            />
                            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                              Xuất hiện trên tab trình duyệt khi khách quốc tế chọn 🇬🇧 English trên website. Có thể dùng nút <strong>✨ Chuyển đổi ENG</strong> ở trên để AI tự động dịch.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* PHẦN 3: LOGO HIỂN THỊ TRÊN WEBSITE (3 VỊ TRÍ: HEADER NỀN TRẮNG, HEADER TRONG SUỐT, FOOTER NỀN XANH - DÙNG CHUNG 1 ẢNH) */}
                    <div className="pt-5 border-t border-slate-200/90 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#2D5A27]" />
                            <span>Logo Hiển Thị Trên Website (Header Cuộn, Header Đầu Trang &amp; Chân Trang Footer)</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Cài đặt 1 ảnh Logo chung hiển thị cho cả 3 vị trí trên website: Thanh Menu khi cuộn (nền trắng), Thanh Menu đầu trang (nền trong suốt), và Chân trang (Footer nền xanh).
                          </p>
                        </div>
                        {configForm.logo_website && (
                          <button
                            type="button"
                            onClick={() => setConfigForm((prev) => ({ ...prev, logo_website: '' }))}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Dùng lại logo mặc định</span>
                          </button>
                        )}
                      </div>

                      {/* XEM TRƯỚC 3 VỊ TRÍ THỰC TẾ TRÊN GIAO DIỆN */}
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Eye className="w-3 h-3 text-slate-400" />
                          <span>Xem trước hiển thị thực tế tại 3 vị trí (chung 1 ảnh):</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Vị trí 1: Header khi cuộn (nền trắng) */}
                          <div className="bg-white rounded-xl p-3 border border-slate-200 flex flex-col items-center justify-center gap-2 shadow-2xs min-h-[95px]">
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">1. Menu khi cuộn (Nền trắng)</span>
                            <div className="h-10 flex items-center justify-center">
                              {configForm.logo_website ? (
                                <img
                                  src={configForm.logo_website}
                                  alt="Preview Logo Scrolled"
                                  className="max-h-8 max-w-[150px] object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/logo-favicon.png';
                                  }}
                                />
                              ) : (
                                <PetLogo size="sm" />
                              )}
                            </div>
                          </div>

                          {/* Vị trí 2: Header đầu trang (nền trong suốt/banner) */}
                          <div
                            className="rounded-xl p-3 border border-slate-300 flex flex-col items-center justify-center gap-2 shadow-2xs min-h-[95px] relative overflow-hidden"
                            style={{
                              backgroundImage: 'radial-gradient(#94a3b8 0.75px, transparent 0.75px), radial-gradient(#94a3b8 0.75px, #f1f5f9 0.75px)',
                              backgroundSize: '12px 12px',
                              backgroundPosition: '0 0, 6px 6px',
                            }}
                          >
                            <span className="text-[10px] font-bold text-slate-700 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded uppercase tracking-wider border border-slate-200 shadow-2xs">
                              2. Menu đầu trang (Trong suốt)
                            </span>
                            <div className="h-10 flex items-center justify-center px-2">
                              {configForm.logo_website ? (
                                <img
                                  src={configForm.logo_website}
                                  alt="Preview Logo Transparent"
                                  className="max-h-8 max-w-[150px] object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/logo-favicon.png';
                                  }}
                                />
                              ) : (
                                <PetLogo size="sm" />
                              )}
                            </div>
                          </div>

                          {/* Vị trí 3: Chân trang (Footer nền xanh đậm) */}
                          <div className="bg-[#173314] rounded-xl p-3 border border-[#2D5A27] flex flex-col items-center justify-center gap-2 shadow-2xs min-h-[95px]">
                            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">3. Chân trang (Footer nền xanh)</span>
                            <div className="h-10 flex items-center justify-center">
                              {configForm.logo_website ? (
                                <img
                                  src={configForm.logo_website}
                                  alt="Preview Logo Footer"
                                  className="max-h-8 max-w-[150px] object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/logo-favicon.png';
                                  }}
                                />
                              ) : (
                                <PetLogo size="sm" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* KHU VỰC TẢI LÊN & ĐƯỜNG DẪN ẢNH */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
                        <div className="md:col-span-5">
                          <input
                            type="file"
                            ref={websiteLogoFileInputRef}
                            onChange={handleWebsiteLogoUpload}
                            accept="image/png,image/svg+xml,image/webp,image/jpeg"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => websiteLogoFileInputRef.current?.click()}
                            disabled={isWebsiteLogoUploading}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23471f] text-white text-xs font-bold shadow-xs hover:shadow transition disabled:opacity-50 cursor-pointer"
                          >
                            {isWebsiteLogoUploading ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <span>{isWebsiteLogoUploading ? 'Đang tải ảnh...' : 'Tải Logo Mới Lên'}</span>
                          </button>
                        </div>

                        <div className="md:col-span-7">
                          <input
                            type="text"
                            value={configForm.logo_website || ''}
                            onChange={(e) => setConfigForm((prev) => ({ ...prev, logo_website: e.target.value }))}
                            placeholder="Hoặc dán đường dẫn ảnh logo trực tiếp (PNG / SVG tách nền)..."
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            Khuyên dùng ảnh định dạng PNG trong suốt hoặc SVG để hiển thị đẹp nhất trên cả nền trắng, trong suốt và nền xanh.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Slogan Đầu Trang */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
                    <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#2D5A27]" />
                          <span>Cụm Slogan &amp; 2 Nút</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tùy chỉnh thông điệp slogan, tên 2 nút, bật/tắt và căn chỉnh vị trí hiển thị trên ảnh nền đầu trang.
                        </p>
                      </div>

                      {/* Tab Ngôn ngữ: Tiếng Việt / English */}
                      <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 shrink-0 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setHeroCardLang('vi')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            heroCardLang === 'vi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          <VietnamFlag className="w-3.5 h-2.5 rounded-[2px]" />
                          <span>Tiếng Việt</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setHeroCardLang('en')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            heroCardLang === 'en' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          <UKFlag className="w-3.5 h-2.5 rounded-[2px]" />
                          <span>English</span>
                        </button>
                      </div>
                    </div>

                    {/* Phần 1: Câu Slogan & Tên 2 Nút (Trái) + Phím Điều Hướng 4 Chiều (Phải) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Cột trái: Nhập Câu Slogan & Tên 2 Nút (có switch bật/tắt) */}
                      <div className="lg:col-span-7 space-y-3.5">
                        {/* Câu Slogan */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/90 space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              {heroCardLang === 'vi' ? <VietnamFlag className="w-4 h-3 rounded-[2px]" /> : <UKFlag className="w-4 h-3 rounded-[2px]" />}
                              <span>Câu Slogan ({heroCardLang === 'vi' ? 'Tiếng Việt' : 'English'}):</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              Dùng dấu phẩy &ldquo;,&rdquo; để xuống dòng 2
                            </span>
                          </label>
                          {heroCardLang === 'vi' ? (
                            <input
                              type="text"
                              value={configForm.slogan_dau_trang_tieu_de || ''}
                              placeholder="Nâng niu từng nhịp thở, an yên trọn một đời."
                              onChange={(e) => setConfigForm((prev) => ({ ...prev, slogan_dau_trang_tieu_de: e.target.value }))}
                              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 font-medium focus:border-[#2D5A27] focus:outline-none bg-white"
                            />
                          ) : (
                            <input
                              type="text"
                              value={configForm.slogan_dau_trang_tieu_de_en || ''}
                              placeholder="Cherishing Every Breath, Embracing Life with Peace."
                              onChange={(e) => setConfigForm((prev) => ({ ...prev, slogan_dau_trang_tieu_de_en: e.target.value }))}
                              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 font-medium focus:border-[#2D5A27] focus:outline-none bg-white"
                            />
                          )}
                        </div>

                        {/* 2 Nút Bấm: Chỉ sửa Tên Nút và Bật/Tắt */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Nút 1 */}
                          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/90 space-y-2">
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#2D5A27]" />
                                <span>Nút 1</span>
                              </span>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                              type="checkbox"
                              checked={configForm.hero_nut_1_hien_thi !== false}
                              onChange={(e) => setConfigForm((prev) => ({ ...prev, hero_nut_1_hien_thi: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#2D5A27]"></div>
                            <span className="ml-1.5 text-[11px] font-semibold text-slate-700">
                              {configForm.hero_nut_1_hien_thi !== false ? 'Bật' : 'Tắt'}
                            </span>
                          </label>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Tên nút ({heroCardLang === 'vi' ? 'Tiếng Việt' : 'English'}):
                          </label>
                          {heroCardLang === 'vi' ? (
                            <input
                              type="text"
                              value={configForm.hero_nut_1_text ?? 'Đặt Lịch Thăm Khám'}
                              onChange={(e) => setConfigForm((prev) => ({ ...prev, hero_nut_1_text: e.target.value }))}
                              placeholder="Đặt Lịch Thăm Khám"
                              className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-800 font-medium focus:border-[#2D5A27] focus:outline-none bg-white"
                            />
                          ) : (
                            <input
                              type="text"
                              value={configForm.hero_nut_1_text_en ?? 'Book Appointment'}
                              onChange={(e) => setConfigForm((prev) => ({ ...prev, hero_nut_1_text_en: e.target.value }))}
                              placeholder="Book Appointment"
                              className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-800 font-medium focus:border-[#2D5A27] focus:outline-none bg-white"
                            />
                          )}
                        </div>
                      </div>

                      {/* Nút 2 */}
                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/90 space-y-2">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            <span>Nút 2</span>
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={configForm.hero_nut_2_hien_thi !== false}
                              onChange={(e) => setConfigForm((prev) => ({ ...prev, hero_nut_2_hien_thi: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#2D5A27]"></div>
                            <span className="ml-1.5 text-[11px] font-semibold text-slate-700">
                              {configForm.hero_nut_2_hien_thi !== false ? 'Bật' : 'Tắt'}
                            </span>
                          </label>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Tên nút ({heroCardLang === 'vi' ? 'Tiếng Việt' : 'English'}):
                          </label>
                          {heroCardLang === 'vi' ? (
                            <input
                              type="text"
                              value={configForm.hero_nut_2_text ?? 'Xem Dịch Vụ'}
                              onChange={(e) => setConfigForm((prev) => ({ ...prev, hero_nut_2_text: e.target.value }))}
                              placeholder="Xem Dịch Vụ"
                              className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-800 font-medium focus:border-[#2D5A27] focus:outline-none bg-white"
                            />
                          ) : (
                            <input
                              type="text"
                              value={configForm.hero_nut_2_text_en ?? 'Our Services'}
                              onChange={(e) => setConfigForm((prev) => ({ ...prev, hero_nut_2_text_en: e.target.value }))}
                              placeholder="Our Services"
                              className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-800 font-medium focus:border-[#2D5A27] focus:outline-none bg-white"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cột phải: Phím Điều Hướng 4 Chiều (±10px) */}
                  <div className="lg:col-span-5 bg-slate-50 rounded-xl p-4 border border-slate-200/90 flex flex-col justify-between">
                    {/* Switcher thiết bị: Desktop vs Điện thoại (k cần icon) */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                      <span className="text-xs font-bold text-slate-800">
                        Vị trí thiết bị:
                      </span>
                      <div className="inline-flex p-0.5 rounded-lg bg-slate-200 border border-slate-300">
                        <button
                          type="button"
                          onClick={() => setHeroPosDevice('desktop')}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                            heroPosDevice === 'desktop' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Desktop
                        </button>
                        <button
                          type="button"
                          onClick={() => setHeroPosDevice('mobile')}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                            heroPosDevice === 'mobile' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Điện thoại
                        </button>
                      </div>
                    </div>

                    {/* Phím Điều Hướng 4 Chiều (±heroNudgeStep) + Nút Căn Nhanh */}
                    <div className="py-2 flex flex-col items-center justify-center">
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                          Phím Điều Hướng (±{heroNudgeStep}px)
                        </span>
                        {/* Bước nhảy */}
                        <div className="flex items-center gap-1">
                          {[10, 20, 50].map((step) => (
                            <button
                              key={step}
                              type="button"
                              onClick={() => setHeroNudgeStep(step)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                                heroNudgeStep === step
                                  ? 'bg-[#2D5A27] text-white shadow-2xs'
                                  : 'bg-slate-200/80 text-slate-600 hover:bg-slate-300'
                              }`}
                            >
                              ±{step}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 3 Nút Căn Nhanh: Trái / Giữa / Phải */}
                      <div className="grid grid-cols-3 gap-1.5 w-full mb-3">
                        <button
                          type="button"
                          onClick={() => handleSetHeroPreset('left')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer ${
                            (heroPosDevice === 'desktop' ? configForm.hero_slogan_align_desktop : configForm.hero_slogan_align_mobile) === 'left'
                              ? 'bg-emerald-50 text-[#2D5A27] border-emerald-300'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>◀ Căn Trái</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetHeroPreset('center')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer ${
                            (heroPosDevice === 'desktop' ? configForm.hero_slogan_align_desktop : configForm.hero_slogan_align_mobile) === 'center'
                              ? 'bg-emerald-50 text-[#2D5A27] border-emerald-300'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>⏺ Giữa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetHeroPreset('right')}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer ${
                            (heroPosDevice === 'desktop' ? configForm.hero_slogan_align_desktop : configForm.hero_slogan_align_mobile) === 'right'
                              ? 'bg-emerald-50 text-[#2D5A27] border-emerald-300'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>▶ Căn Phải</span>
                        </button>
                      </div>

                      {/* D-Pad 4 Chiều */}
                      <div className="grid grid-cols-3 gap-1.5 w-36 h-36">
                        <div />
                        <button
                          type="button"
                          onClick={() => handleNudgeHeroPosition(0, -heroNudgeStep)}
                          className="flex flex-col items-center justify-center rounded-xl bg-white hover:bg-[#2D5A27] hover:text-white text-slate-700 font-bold border border-slate-200 transition shadow-xs active:scale-95 cursor-pointer"
                          title={`Dịch lên (-${heroNudgeStep}px)`}
                        >
                          <span className="text-base leading-none">⬆️</span>
                          <span className="text-[9px] uppercase font-bold mt-0.5">Lên</span>
                        </button>
                        <div />

                        <button
                          type="button"
                          onClick={() => handleNudgeHeroPosition(-heroNudgeStep, 0)}
                          className="flex flex-col items-center justify-center rounded-xl bg-white hover:bg-[#2D5A27] hover:text-white text-slate-700 font-bold border border-slate-200 transition shadow-xs active:scale-95 cursor-pointer"
                          title={`Dịch sang trái (-${heroNudgeStep}px)`}
                        >
                          <span className="text-base leading-none">⬅️</span>
                          <span className="text-[9px] uppercase font-bold mt-0.5">Trái</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleResetHeroPosition}
                          className="flex flex-col items-center justify-center rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold transition shadow-xs active:scale-95 cursor-pointer text-center px-1"
                          title="Đặt lại (0, 0)"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mb-0.5 text-emerald-700" />
                          <span className="text-[9px] uppercase font-bold">Gốc (0)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNudgeHeroPosition(heroNudgeStep, 0)}
                          className="flex flex-col items-center justify-center rounded-xl bg-white hover:bg-[#2D5A27] hover:text-white text-slate-700 font-bold border border-slate-200 transition shadow-xs active:scale-95 cursor-pointer"
                          title={`Dịch sang phải (+${heroNudgeStep}px)`}
                        >
                          <span className="text-base leading-none">➡️</span>
                          <span className="text-[9px] uppercase font-bold mt-0.5">Phải</span>
                        </button>

                        <div />
                        <button
                          type="button"
                          onClick={() => handleNudgeHeroPosition(0, heroNudgeStep)}
                          className="flex flex-col items-center justify-center rounded-xl bg-white hover:bg-[#2D5A27] hover:text-white text-slate-700 font-bold border border-slate-200 transition shadow-xs active:scale-95 cursor-pointer"
                          title={`Dịch xuống (+${heroNudgeStep}px)`}
                        >
                          <span className="text-base leading-none">⬇️</span>
                          <span className="text-[9px] uppercase font-bold mt-0.5">Xuống</span>
                        </button>
                        <div />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 text-center">
                      <span className="text-[11px] font-mono font-semibold text-slate-600">
                        Đang dịch ({heroPosDevice === 'desktop' ? 'Desktop' : 'Điện thoại'}): X: <strong className="text-[#2D5A27]">{heroPosDevice === 'desktop' ? (configForm.hero_slogan_x_desktop ?? 0) : (configForm.hero_slogan_x_mobile ?? 0)}px</strong>, Y: <strong className="text-[#2D5A27]">{heroPosDevice === 'desktop' ? (configForm.hero_slogan_y_desktop ?? 0) : (configForm.hero_slogan_y_mobile ?? 0)}px</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Phần 2: Khung Mô Phỏng Trực Quan Thời Gian Thực */}
                <div className="bg-[#121c14] rounded-2xl p-4 sm:p-5 border border-emerald-950/40 relative overflow-hidden shadow-inner">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Mô Phỏng Trực Quan ({heroPosDevice === 'desktop' ? 'Desktop' : 'Điện thoại'} — {heroCardLang === 'vi' ? 'Tiếng Việt' : 'English'})
                      </span>
                    </div>
                    <span className="text-[10px] text-white/50">Di chuyển theo phím điều hướng</span>
                  </div>

                  {/* Canvas mô phỏng */}
                  <div
                    className={`relative mx-auto rounded-xl border border-white/15 bg-black/40 overflow-hidden flex flex-col justify-center items-center p-4 transition-all duration-300 ${
                      heroPosDevice === 'desktop' ? 'w-full h-48 sm:h-56' : 'w-72 h-80'
                    }`}
                  >
                    {/* Background hint */}
                    <div className="absolute inset-0 bg-radial from-emerald-900/10 via-transparent to-black/60 pointer-events-none" />
                    <div className="absolute top-2 right-2 text-[9px] font-mono text-white/30 uppercase">
                      {heroPosDevice === 'desktop' ? 'Desktop View' : 'Mobile View'}
                    </div>

                    {/* Slogan + 2 Buttons Cluster (Scaled position) */}
                    {(() => {
                      const curX = heroPosDevice === 'desktop' ? (configForm.hero_slogan_x_desktop ?? 0) : (configForm.hero_slogan_x_mobile ?? 0);
                      const curY = heroPosDevice === 'desktop' ? (configForm.hero_slogan_y_desktop ?? 0) : (configForm.hero_slogan_y_mobile ?? 0);
                      const curAlign = heroPosDevice === 'desktop' ? (configForm.hero_slogan_align_desktop || 'center') : (configForm.hero_slogan_align_mobile || 'center');

                      const scale = heroPosDevice === 'desktop' ? 0.45 : 0.72;
                      const scaledX = Math.round(curX * scale);
                      const scaledY = Math.round(curY * scale);

                      const alignClass = curAlign === 'left' ? 'items-start text-left' : curAlign === 'right' ? 'items-end text-right' : 'items-center text-center';
                      const btnJustify = curAlign === 'left' ? 'justify-start' : curAlign === 'right' ? 'justify-end' : 'justify-center';

                      const sloganText = heroCardLang === 'vi'
                        ? (configForm.slogan_dau_trang_tieu_de || 'Nâng niu từng nhịp thở, an yên trọn một đời.')
                        : (configForm.slogan_dau_trang_tieu_de_en || 'Cherishing Every Breath, Embracing Life with Peace.');

                      const btn1Text = heroCardLang === 'vi'
                        ? (configForm.hero_nut_1_text || 'Đặt Lịch Thăm Khám')
                        : (configForm.hero_nut_1_text_en || 'Book Appointment');

                      const btn2Text = heroCardLang === 'vi'
                        ? (configForm.hero_nut_2_text || 'Xem Dịch Vụ')
                        : (configForm.hero_nut_2_text_en || 'Our Services');

                      const btn1Show = configForm.hero_nut_1_hien_thi !== false;
                      const btn2Show = configForm.hero_nut_2_hien_thi !== false;

                      const parts = sloganText.includes(',') ? sloganText.split(',') : [sloganText];
                      const line1 = parts[0].trim();
                      const line2 = parts.slice(1).join(',').trim();

                      return (
                        <div
                          style={{
                            transform: `translate(${scaledX}px, ${scaledY}px)`,
                          }}
                          className={`relative z-10 transition-transform duration-150 flex flex-col max-w-sm pointer-events-none w-full ${alignClass}`}
                        >
                          {/* Slogan title in preview */}
                          <div className="font-editorial text-sm sm:text-base text-white font-normal leading-tight drop-shadow-md">
                            <span>{line1}{line2 ? ',' : ''}</span>
                            {line2 && (
                              <span className="block text-emerald-400 italic text-xs sm:text-sm mt-0.5">
                                {line2}
                              </span>
                            )}
                          </div>

                          {/* 2 CTA buttons in preview */}
                          <div className={`flex items-center gap-1.5 mt-2.5 w-full ${btnJustify}`}>
                            {btn1Show && (
                              <div className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#2D5A27] to-emerald-700 text-white text-[10px] font-bold shadow-sm flex items-center gap-1 border border-emerald-500/30">
                                <CalendarCheck className="w-3 h-3 text-[#FFB800]" />
                                <span>{btn1Text}</span>
                              </div>
                            )}
                            {btn2Show && (
                              <div className="px-2 py-1 rounded-lg bg-white/90 text-slate-900 text-[10px] font-semibold shadow-sm flex items-center gap-1 border border-slate-300">
                                <span>{btn2Text}</span>
                                <ArrowRight className="w-2.5 h-2.5 text-[#2D5A27]" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                    {/* ── BỘ QUẢN LÝ THÔNG ĐIỆP CHẠY SLIDE CHÂN BANNER ── */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                          <Sparkles className="w-3.5 h-3.5 text-[#2D5A27]" />
                          <span>Thông điệp chạy slide chân banner:</span>
                        </label>

                        <button
                          type="button"
                          onClick={handleAddSloganItem}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-2xs transition cursor-pointer shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Thêm thông điệp (+)</span>
                        </button>
                      </div>

                      {/* Danh sách các thẻ thông điệp gọn gàng */}
                      <div className="space-y-3">
                        {sloganItems.map((item, idx) => {
                          const now = new Date();
                          const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(now);
                          const isPast = Boolean(item.endDate && today > item.endDate);
                          const isFuture = Boolean(item.startDate && today < item.startDate);
                          const isActiveNow = item.isActive !== false && !isPast && !isFuture;

                          const currentText = (sloganSubLang === 'vi' ? item.textVi : item.textEn) || '';
                          const emojiRegex = /(\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\u2600-\u27BF])/gu;
                          const foundEmojis = currentText.match(emojiRegex);
                          const uniqueEmojis = foundEmojis ? Array.from(new Set(foundEmojis)) : [];

                          return (
                            <div
                              key={item.id || idx}
                              className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                                !item.isActive
                                  ? 'bg-slate-50 border-slate-200 opacity-60'
                                  : isActiveNow
                                  ? 'bg-white border-emerald-300 shadow-2xs'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              {/* HÀNG 1: TỪ NGÀY - ĐẾN NGÀY NẰM CHUNG HÀNG VỚI BẬT/TẮT (NÚT GẠT) VÀ NÚT XÓA */}
                              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-[#2D5A27] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                    {idx + 1}
                                  </span>

                                  {/* Badge trạng thái ngắn gọn */}
                                  {!item.isActive ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                      Tắt
                                    </span>
                                  ) : isFuture ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                      Chưa tới ngày
                                    </span>
                                  ) : isPast ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                      Hết hạn
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                      Hiển thị
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2.5 ml-auto">
                                  {/* Từ ngày */}
                                  <div className="flex items-center gap-1 text-xs">
                                    <span className="text-[11px] text-slate-500 font-medium">Từ:</span>
                                    <input
                                      type="date"
                                      value={item.startDate || ''}
                                      onChange={(e) => handleUpdateSloganField(item.id, 'startDate', e.target.value)}
                                      className="text-xs px-2 py-1 rounded-lg border border-slate-200 text-slate-700 bg-white focus:border-[#2D5A27] focus:outline-none"
                                    />
                                    {item.startDate && (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateSloganField(item.id, 'startDate', '')}
                                        className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                                        title="Xóa ngày"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>

                                  {/* Đến ngày */}
                                  <div className="flex items-center gap-1 text-xs">
                                    <span className="text-[11px] text-slate-500 font-medium">Đến:</span>
                                    <input
                                      type="date"
                                      value={item.endDate || ''}
                                      onChange={(e) => handleUpdateSloganField(item.id, 'endDate', e.target.value)}
                                      className="text-xs px-2 py-1 rounded-lg border border-slate-200 text-slate-700 bg-white focus:border-[#2D5A27] focus:outline-none"
                                    />
                                    {item.endDate && (
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateSloganField(item.id, 'endDate', '')}
                                        className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                                        title="Xóa ngày"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>

                                  {/* Nút gạt Bật / Tắt (Toggle Switch) */}
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSloganField(item.id, 'isActive', item.isActive === false ? true : false)}
                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                      item.isActive !== false ? 'bg-[#2D5A27]' : 'bg-slate-300'
                                    }`}
                                    title={item.isActive !== false ? 'Đang Bật' : 'Đang Tắt'}
                                  >
                                    <span
                                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                        item.isActive !== false ? 'translate-x-4' : 'translate-x-0'
                                      }`}
                                    />
                                  </button>

                                  {/* Nút xóa */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSloganItem(item.id)}
                                    className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                    title="Xóa thông điệp này"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* HÀNG 2: BẢNG ICON RUNG PHONG CÁCH ZALO & Ô NHẬP TỰ RUNG TRỰC TIẾP */}
                              <div className="space-y-1.5 relative">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                                    {sloganSubLang === 'vi' ? <VietnamFlag className="w-3.5 h-2.5 rounded-[2px]" /> : <UKFlag className="w-3.5 h-2.5 rounded-[2px]" />}
                                    <span>{sloganSubLang === 'vi' ? 'Tiếng Việt' : 'English'}:</span>
                                  </span>

                                  {/* Nút biểu tượng mặt cười mở bảng icon phong cách FB / Zalo */}
                                  <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => setActiveEmojiPickerItemId(activeEmojiPickerItemId === item.id ? null : item.id)}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition border cursor-pointer ${
                                      activeEmojiPickerItemId === item.id
                                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 shadow-2xs'
                                    }`}
                                    title="Mở bảng icon cảm xúc phong cách FB/Zalo"
                                  >
                                    <Smile className="w-4 h-4 text-amber-500" />
                                    <span>Icon</span>
                                  </button>
                                </div>

                                {/* BẢNG CHỌN ICON PHONG CÁCH FB / ZALO ĐA DẠNG */}
                                <AdminEmojiPicker
                                  isOpen={activeEmojiPickerItemId === item.id}
                                  onClose={() => setActiveEmojiPickerItemId(null)}
                                  onSelectEmoji={(emoji) => handleInsertEmoji(item.id, emoji)}
                                  title="Biểu tượng cảm xúc & Icon"
                                />

                                {/* Ô nhập thông điệp: icon rung trực tiếp tại vị trí vừa thêm */}
                                <SloganInlineEditor
                                  itemId={item.id}
                                  value={currentText}
                                  onChange={(val) =>
                                    handleUpdateSloganField(
                                      item.id,
                                      sloganSubLang === 'vi' ? 'textVi' : 'textEn',
                                      val
                                    )
                                  }
                                  onRegisterRef={(id, el) => {
                                    editorRefs.current[id] = el;
                                  }}
                                  placeholder={sloganSubLang === 'vi' ? 'Nhập thông điệp...' : 'Enter message...'}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Slogan Cuối Trang & Giấy Phép */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
                    <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#2D5A27]" />
                          <span>2. Khẩu Hiệu Cuối Trang &amp; Giấy Phép (Footer)</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Xuất hiện ở thanh đáy thương hiệu và bản đồ tại trang chủ cũng như các trang chi nhánh.
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        Chân Trang
                      </span>
                    </div>

                    {sloganSubLang === 'vi' ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                            <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                            <span>Tiêu đề khẩu hiệu cuối trang (Tiếng Việt):</span>
                          </label>
                          <input
                            type="text"
                            value={configForm.slogan_cuoi_trang_tieu_de || ''}
                            onChange={(e) =>
                              setConfigForm((prev) => ({ ...prev, slogan_cuoi_trang_tieu_de: e.target.value }))
                            }
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:border-[#2D5A27] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                            <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                            <span>Nội dung mô tả sứ mệnh cuối trang (Tiếng Việt):</span>
                          </label>
                          <textarea
                            rows={3}
                            value={configForm.slogan_cuoi_trang_noi_dung || ''}
                            onChange={(e) =>
                              setConfigForm((prev) => ({ ...prev, slogan_cuoi_trang_noi_dung: e.target.value }))
                            }
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-y"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1.5">
                            <UKFlag className="w-4 h-3 rounded-[2px]" />
                            <span>Tiêu đề khẩu hiệu cuối trang (English):</span>
                          </label>
                          <input
                            type="text"
                            value={configForm.slogan_cuoi_trang_tieu_de_en || ''}
                            onChange={(e) =>
                              setConfigForm((prev) => ({ ...prev, slogan_cuoi_trang_tieu_de_en: e.target.value }))
                            }
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:border-[#2D5A27] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1.5">
                            <UKFlag className="w-4 h-3 rounded-[2px]" />
                            <span>Nội dung mô tả sứ mệnh cuối trang (English):</span>
                          </label>
                          <textarea
                            rows={3}
                            value={configForm.slogan_cuoi_trang_noi_dung_en || ''}
                            onChange={(e) =>
                              setConfigForm((prev) => ({ ...prev, slogan_cuoi_trang_noi_dung_en: e.target.value }))
                            }
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-y"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isConfigSaving}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                    >
                      {isConfigSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>{isConfigSaving ? 'Đang lưu...' : 'Lưu Khẩu Hiệu & Slogan'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* NHÁNH 7: THÔNG BÁO NỔI & LỊCH TẾT (POPUP ĐÓN KHÁCH + HUY HIỆU NỔI) */}
              {configSubTab === 'announcement' && (
                <div className="space-y-6">
                  {/* Grid 2 cột: Cột trái là 1 Ô DUY NHẤT gom toàn bộ cài đặt + Cột phải Live Preview */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Cột trái (lg:col-span-7): ĐÚNG 1 Ô DUY NHẤT "Cài Đặt Thông Báo Nổi (Poster)" */}
                    <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
                      {/* Tiêu đề & Công tắc Bật/Tắt */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
                            <Megaphone className="w-5 h-5" />
                          </div>
                          <h2 className="text-base sm:text-lg font-bold text-slate-900">
                            Poster
                          </h2>
                        </div>

                        {/* Công tắc Bật / Tắt */}
                        <div className="flex items-center gap-3 bg-slate-50 p-2 px-3.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                          <span className="text-xs font-bold text-slate-700">Trạng thái:</span>
                          <button
                            type="button"
                            onClick={() => setAnnouncementForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              announcementForm.isActive ? 'bg-[#2D5A27]' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                announcementForm.isActive ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className={`text-xs font-bold ${announcementForm.isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {announcementForm.isActive ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                          </span>
                        </div>
                      </div>

                      {/* 1. Chủ Đề & Tiêu Đề */}
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/90 p-3.5 rounded-xl border border-slate-200">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>Chủ Đề &amp; Tiêu Đề:</span>
                          </label>

                          <div className="flex items-center gap-2 relative">
                            <select
                              value={announcementForm.category || 'holiday'}
                              onChange={(e) => {
                                const cat = e.target.value as 'holiday' | 'promotion' | 'custom';
                                setAnnouncementForm((prev) => {
                                  if (cat === 'holiday') {
                                    return {
                                      ...prev,
                                      category: 'holiday',
                                      badgeTextVi: '🧧 Lịch Nghỉ Lễ',
                                      badgeTextEn: '🧧 Holiday Schedule',
                                      titleVi: '🧧 Lịch Nghỉ Lễ',
                                      titleEn: '🧧 Holiday Schedule',
                                    };
                                  } else if (cat === 'promotion') {
                                    return {
                                      ...prev,
                                      category: 'promotion',
                                      badgeTextVi: '🎁 Ưu Đãi',
                                      badgeTextEn: '🎁 Special Offers',
                                      titleVi: '🎁 Ưu Đãi',
                                      titleEn: '🎁 Special Offers',
                                    };
                                  } else {
                                    return {
                                      ...prev,
                                      category: 'custom',
                                      badgeTextVi: prev.badgeTextVi || '📢 Thông Báo',
                                      badgeTextEn: prev.badgeTextEn || '📢 Notice',
                                      titleVi: prev.titleVi || '📢 Thông Báo',
                                      titleEn: prev.titleEn || '📢 Notice',
                                    };
                                  }
                                });
                              }}
                              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 shadow-2xs focus:border-[#2D5A27] focus:outline-none cursor-pointer min-w-[180px]"
                            >
                              <option value="holiday">🧧 Lịch Nghỉ Lễ</option>
                              <option value="promotion">🎁 Ưu Đãi</option>
                              <option value="custom">✍️ Tùy Chỉnh Khác</option>
                            </select>

                            {/* Nút mặt cười mở bảng icon phong cách FB / Zalo */}
                            <button
                              type="button"
                              onClick={() => {
                                setPosterEmojiTargetField('vi');
                                setPosterEmojiPickerOpen(!posterEmojiPickerOpen);
                              }}
                              className={`p-2 rounded-full border transition cursor-pointer flex items-center justify-center shadow-2xs ${
                                posterEmojiPickerOpen
                                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300'
                              }`}
                              title="Chèn biểu tượng cảm xúc & icon cho tiêu đề Poster"
                            >
                              <Smile className="w-4 h-4 text-amber-500" />
                            </button>

                            {/* Popup Bảng Icon Đa Dạng */}
                            <AdminEmojiPicker
                              isOpen={posterEmojiPickerOpen}
                              onClose={() => setPosterEmojiPickerOpen(false)}
                              onSelectEmoji={handleInsertPosterEmoji}
                              title="Biểu tượng cảm xúc & Icon cho Poster"
                            />
                          </div>
                        </div>

                        {/* Ô Nhập Tiêu Đề Tiếng Việt & Tiếng Anh Kèm Nút Mặt Cười Tại Mỗi Ô */}
                        <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <VietnamFlag className="w-3.5 h-2.5 rounded-[2px]" />
                                <span>Chữ Hiển Thị Tiếng Việt:</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setPosterEmojiTargetField('vi');
                                  setPosterEmojiPickerOpen(true);
                                }}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition cursor-pointer"
                                title="Chèn icon vào tiêu đề Tiếng Việt"
                              >
                                <Smile className="w-3.5 h-3.5 text-amber-600" />
                                <span>Icon</span>
                              </button>
                            </div>
                            <input
                              ref={posterViInputRef}
                              type="text"
                              value={announcementForm.badgeTextVi || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAnnouncementForm((prev) => ({
                                  ...prev,
                                  category: 'custom',
                                  badgeTextVi: val,
                                  titleVi: val,
                                }));
                              }}
                              placeholder="VD: 🧧 Lịch Nghỉ Lễ hoặc 📢 Thông Báo"
                              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <UKFlag className="w-3.5 h-2.5 rounded-[2px]" />
                                <span>Chữ Hiển Thị Tiếng Anh:</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setPosterEmojiTargetField('en');
                                  setPosterEmojiPickerOpen(true);
                                }}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition cursor-pointer"
                                title="Chèn icon vào tiêu đề Tiếng Anh"
                              >
                                <Smile className="w-3.5 h-3.5 text-amber-600" />
                                <span>Icon</span>
                              </button>
                            </div>
                            <input
                              ref={posterEnInputRef}
                              type="text"
                              value={announcementForm.badgeTextEn || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAnnouncementForm((prev) => ({
                                  ...prev,
                                  category: 'custom',
                                  badgeTextEn: val,
                                  titleEn: val,
                                }));
                              }}
                              placeholder="VD: 🧧 Holiday Schedule hoặc 📢 Notice"
                              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 2. Khoảng Thời Gian Xuất Hiện Poster */}
                      <div className="pt-5 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#2D5A27]" />
                            <span>Khoảng Thời Gian Xuất Hiện Poster:</span>
                          </label>
                          {(announcementForm.startDate || announcementForm.endDate) && (
                            <button
                              type="button"
                              onClick={() => setAnnouncementForm((prev) => ({ ...prev, startDate: '', endDate: '' }))}
                              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                            >
                              ✕ Xóa giới hạn ngày
                            </button>
                          )}
                        </div>

                        {/* 4 cài đặt thời gian */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200">
                            <label className="block text-[11px] font-bold text-slate-700">
                              Từ ngày (Bắt đầu):
                            </label>
                            <input
                              type="date"
                              value={announcementForm.startDate ? announcementForm.startDate.slice(0, 10) : ''}
                              onChange={(e) =>
                                setAnnouncementForm((prev) => ({
                                  ...prev,
                                  startDate: e.target.value,
                                }))
                              }
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-800 font-medium focus:border-[#2D5A27] focus:outline-none bg-white"
                            />
                          </div>

                          <div className="space-y-1.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200">
                            <label className="block text-[11px] font-bold text-slate-700">
                              Đến ngày (Kết thúc):
                            </label>
                            <input
                              type="date"
                              value={announcementForm.endDate ? announcementForm.endDate.slice(0, 10) : ''}
                              onChange={(e) =>
                                setAnnouncementForm((prev) => ({
                                  ...prev,
                                  endDate: e.target.value,
                                }))
                              }
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-800 font-medium focus:border-[#2D5A27] focus:outline-none bg-white"
                            />
                          </div>

                          <div className="space-y-1.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-slate-700">
                                Trễ tự bung:
                              </label>
                              <span className="text-[11px] font-extrabold text-[#2D5A27]">
                                {announcementForm.autoOpenDelaySeconds ?? 1.2}s
                              </span>
                            </div>
                            <input
                              type="number"
                              min="0.5"
                              max="10"
                              step="0.1"
                              value={announcementForm.autoOpenDelaySeconds ?? 1.2}
                              onChange={(e) =>
                                setAnnouncementForm((prev) => ({
                                  ...prev,
                                  autoOpenDelaySeconds: parseFloat(e.target.value) || 1.2,
                                }))
                              }
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-800 font-bold focus:border-[#2D5A27] focus:outline-none bg-white"
                            />
                          </div>

                          <div className="space-y-1.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-slate-700">
                                Tự đóng sau:
                              </label>
                              <span className="text-[11px] font-extrabold text-[#2D5A27]">
                                {announcementForm.autoCloseSeconds ? `${announcementForm.autoCloseSeconds}s` : 'Không đóng'}
                              </span>
                            </div>
                            <input
                              type="number"
                              min="0"
                              max="60"
                              step="1"
                              placeholder="0 = Không đóng"
                              value={announcementForm.autoCloseSeconds ?? ''}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setAnnouncementForm((prev) => ({
                                  ...prev,
                                  autoCloseSeconds: !isNaN(val) && val > 0 ? val : undefined,
                                }));
                              }}
                              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-800 font-medium focus:border-[#2D5A27] focus:outline-none bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 3. Ảnh Poster Thông Báo (Tiếng Việt & Tiếng Anh) */}
                      <div className="pt-5 border-t border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-[#2D5A27]" />
                            <span>Ảnh Poster Thông Báo</span>
                          </label>
                          <span className="text-[10px] text-slate-400 font-medium">JPG, PNG, WEBP</span>
                        </div>

                        {/* 1. Ảnh Poster Tiếng Việt (Bắt buộc / Mặc định) */}
                        <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                              <span>1. Ảnh Poster Tiếng Việt (Bắt buộc): *</span>
                            </label>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Ảnh chính
                            </span>
                          </div>
                          <AdminImageInput
                            label=""
                            folder="banners"
                            value={announcementForm.imageUrl}
                            onChange={(url) => setAnnouncementForm((prev) => ({ ...prev, imageUrl: url }))}
                          />
                        </div>

                        {/* 2. Ảnh Poster Tiếng Anh (Tùy chọn) */}
                        <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <UKFlag className="w-4 h-3 rounded-[2px]" />
                              <span>2. Ảnh Poster Tiếng Anh (Tùy chọn):</span>
                            </label>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                              {announcementForm.imageUrlEn?.trim() ? '✅ Có ảnh tiếng Anh riêng' : 'Tự lấy ảnh Tiếng Việt'}
                            </span>
                          </div>
                          <AdminImageInput
                            label=""
                            folder="banners"
                            value={announcementForm.imageUrlEn || ''}
                            onChange={(url) => setAnnouncementForm((prev) => ({ ...prev, imageUrlEn: url }))}
                          />
                        </div>
                      </div>

                      {/* Nút Lưu Cài Đặt (Nằm ngay trong ô duy nhất) */}
                      <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs text-slate-500">
                          {announcementForm.updatedAt ? (
                            <span>Lần cập nhật: {new Date(announcementForm.updatedAt).toLocaleString('vi-VN')}</span>
                          ) : (
                            <span>Chưa lưu cấu hình</span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSaveAnnouncement()}
                          disabled={isAnnouncementSaving}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                        >
                          {isAnnouncementSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          <span>{isAnnouncementSaving ? 'Đang lưu...' : 'Lưu Cài Đặt Poster'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Cột phải: Live Preview Mô Phỏng Trực Quan */}
                    <div className="lg:col-span-5 space-y-5">
                      {/* Preview 1: Mô phỏng Modal Poster */}
                      <div className="bg-slate-900/95 rounded-2xl p-5 border border-slate-700 text-white shadow-xl space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Mô Phỏng Popup Poster</span>
                          </span>

                          {/* Bộ chuyển đổi xem trước VI / EN */}
                          <div className="inline-flex p-0.5 bg-slate-800 rounded-lg border border-slate-700">
                            <button
                              type="button"
                              onClick={() => setAnnouncementLangTab('vi')}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                                announcementLangTab === 'vi'
                                  ? 'bg-[#2D5A27] text-white shadow-xs'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              🇻🇳 VI
                            </button>
                            <button
                              type="button"
                              onClick={() => setAnnouncementLangTab('en')}
                              className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                                announcementLangTab === 'en'
                                  ? 'bg-[#2D5A27] text-white shadow-xs'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              🇬🇧 EN
                            </button>
                          </div>
                        </div>

                        {/* Modal Mockup Box: Không có dải 5★, không có footer, chỉ 1 dấu ✕ nhỏ gọn trên ảnh */}
                        <div className="relative bg-black/60 border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center p-2 min-h-[220px]">
                          {(() => {
                            const isEnPreview = announcementLangTab === 'en';
                            const previewImg = isEnPreview
                              ? (announcementForm.imageUrlEn?.trim() || announcementForm.imageUrl?.trim())
                              : announcementForm.imageUrl?.trim();
                            const isUsingFallback = isEnPreview && !announcementForm.imageUrlEn?.trim() && Boolean(announcementForm.imageUrl?.trim());

                            if (previewImg) {
                              return (
                                <div className="relative w-full flex items-center justify-center">
                                  <img
                                    src={previewImg}
                                    alt="Poster Preview"
                                    className="w-full h-auto max-h-[340px] object-contain rounded-xl shadow-lg"
                                  />

                                  {/* Dấu ✕ nhỏ gọn nằm trực tiếp trên ảnh */}
                                  <div
                                    className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg text-xs font-bold cursor-pointer"
                                    title="Dấu ✕ nhỏ gọn đóng poster"
                                  >
                                    ✕
                                  </div>

                                  {isUsingFallback && (
                                    <div className="absolute bottom-2 left-2 z-20 text-[10px] bg-amber-950/80 text-amber-200 border border-amber-600/60 px-2 py-0.5 rounded-md backdrop-blur-xs font-medium">
                                      💡 Đang dùng ảnh Tiếng Việt dự phòng
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            return (
                              <div className="p-8 text-center space-y-2">
                                <ImageIcon className="w-10 h-10 text-slate-500 mx-auto" />
                                <p className="text-xs text-slate-400 font-medium">Chưa có ảnh poster</p>
                                <p className="text-[10px] text-slate-500">Tải ảnh hoặc dán link ảnh ở cột bên trái</p>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Preview 2: Mô phỏng Thanh Đóng Mở Ở Góc Trên Bên Phải (Có Thể Kéo) */}
                      <div className="bg-slate-900/95 rounded-2xl p-5 border border-slate-700 text-white shadow-xl space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Mô Phỏng Thanh Nổi Góc Trên</span>
                          </span>
                          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                            Có thể kéo thả • Không tắt
                          </span>
                        </div>

                        {/* Miniature Corner Simulation */}
                        <div className="h-32 bg-slate-800/60 rounded-xl border border-slate-700/60 relative p-4 flex items-start justify-end overflow-hidden">
                          <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none text-xs text-slate-400">
                            Giao diện góc trên bên phải website
                          </div>

                          {/* The Draggable Bar Preview — Nhỏ gọn, 1 icon rung, chữ mảnh mai */}
                          {(() => {
                            const rawText = announcementLangTab === 'vi'
                              ? (announcementForm.badgeTextVi || '🧧 Lịch Nghỉ Lễ')
                              : (announcementForm.badgeTextEn || '🧧 Holiday Schedule');
                            const match = rawText.match(/^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\u2600-\u27BF])\s*/u);
                            const previewEmoji = match ? match[1] : null;
                            const cleanText = match ? rawText.replace(/^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\u2600-\u27BF])\s*/u, '').trim() : rawText;

                            return (
                              <div
                                className={`relative z-10 inline-flex items-center gap-1.5 pl-2.5 pr-2.5 py-1.5 rounded-full text-white shadow-md border ${
                                  announcementForm.category === 'promotion'
                                    ? 'bg-gradient-to-r from-purple-700 via-pink-600 to-amber-500 border-amber-300/40'
                                    : (announcementForm.category === 'custom'
                                      ? 'bg-gradient-to-r from-[#173014] via-[#2D5A27] to-amber-600 border-amber-300/40'
                                      : 'bg-gradient-to-r from-red-700 via-rose-600 to-amber-500 border-amber-300/40')
                                }`}
                              >
                                {/* 1 icon duy nhất và rung */}
                                <span className="relative shrink-0 inline-flex items-center justify-center animate-bounce">
                                  {previewEmoji ? (
                                    <span className="text-xs sm:text-[13px] leading-none select-none">{previewEmoji}</span>
                                  ) : (
                                    <Bell className="w-3.5 h-3.5 text-amber-200 fill-amber-300/30" />
                                  )}
                                </span>

                                {/* Chữ mảnh mai */}
                                <span className="text-[11px] sm:text-xs font-normal tracking-wide whitespace-nowrap text-white/95 leading-none">
                                  {cleanText}
                                </span>

                                <ChevronDown className="w-3 h-3 text-amber-200/80 shrink-0" />
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* NHÁNH: CHÍNH SÁCH BẢO MẬT & QUYỀN RIÊNG TƯ (TÁCH COMPONENT RIÊNG TRÁNH NẶNG CODE) */}
              {configSubTab === 'privacy' && (
                <AdminPrivacyPolicyManager showNotification={showNotification} />
              )}
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 4: BẢNG DỮ LIỆU QUẢN LÝ DỊCH VỤ CHUẨN 5 SAO     */}
          {/* ===================================================== */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              {/* Header Card với ô tìm kiếm & Nút "+ Thêm Dịch Vụ" */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-[#2D5A27]" />
                    <span>Quản Lý Danh Mục Dịch Vụ</span>
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hệ thống các gói dịch vụ Y Tế &amp; Chăm Sóc 5 sao hiển thị dạng Master-Detail trên website ({services.length} dịch vụ)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative min-w-[200px] sm:min-w-[260px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:border-[#2D5A27] focus:outline-none transition shadow-2xs"
                    />
                  </div>

                  {/* Nút Cài đặt tiêu đề mục */}
                  <button
                    type="button"
                    onClick={handleOpenServicesTitleModal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
                    title="Cài đặt Tiêu đề & Chú thích hiển thị trên Trang chủ"
                  >
                    <Settings className="w-4 h-4 text-amber-700" />
                    <span>Cài Đặt Tiêu Đề Mục</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddNewService}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-sm shadow-[#2D5A27]/25 transition cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Dịch Vụ</span>
                  </button>
                </div>
              </div>

              {/* Bảng Dữ Liệu Dịch Vụ */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {servicesLoading && services.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#2D5A27]" />
                    <span>Đang tải danh mục dịch vụ từ Supabase...</span>
                  </div>
                ) : filteredServices.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    {searchTerm ? 'Không tìm thấy dịch vụ nào khớp với từ khóa tìm kiếm.' : 'Chưa có dịch vụ nào trong hệ thống.'}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-3.5 px-4 w-12 text-center">STT</th>
                          <th className="py-3.5 px-4 w-20">Ảnh</th>
                          <th className="py-3.5 px-4 min-w-[220px]">Tên Dịch Vụ &amp; Phụ Đề</th>
                          <th className="py-3.5 px-4 min-w-[130px]">Phân Nhóm</th>
                          <th className="py-3.5 px-4 min-w-[140px]">Giá &amp; Thời Lượng</th>
                          <th className="py-3.5 px-4 min-w-[130px]">Huy Hiệu</th>
                          <th className="py-3.5 px-4 w-28 text-center">Trạng Thái</th>
                          <th className="py-3.5 px-4 w-28 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredServices.map((service, index) => (
                          <tr key={service.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-[11px]">
                              {service.thu_tu || index + 1}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs shrink-0">
                                <img
                                  src={service.hinh_anh}
                                  alt={service.ten_dich_vu}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  style={{ objectPosition: service.can_chinh_anh || '50% 50%' }}
                                />
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900 leading-snug group-hover:text-[#2D5A27] transition-colors">
                                {service.ten_dich_vu}
                              </div>
                              {service.phu_de && (
                                <p className="text-[11px] text-slate-500 font-light mt-0.5 line-clamp-1">
                                  {service.phu_de}
                                </p>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              {service.nhom_dich_vu === 'medical' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-[#2D5A27] border border-emerald-200">
                                  <Stethoscope className="w-3 h-3 text-[#2D5A27]" />
                                  Y Tế Chuyên Sâu
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  <Scissors className="w-3 h-3 text-amber-700" />
                                  Chăm Sóc &amp; Lưu Trú
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-bold font-mono text-slate-800 text-xs">
                                {service.gia_tham_khao || 'Chưa định giá'}
                              </div>
                              {service.thoi_luong && (
                                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  <span>{service.thoi_luong}</span>
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              {service.huy_hieu ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/15 text-amber-800 border border-amber-300">
                                  <Flame className="w-3 h-3 fill-amber-500 text-amber-600" />
                                  {service.huy_hieu}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">—</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleServiceActive(service)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                                  service.kich_hoat
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                              >
                                {service.kich_hoat ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                <span>{service.kich_hoat ? 'Hiển thị' : 'Đang ẩn'}</span>
                              </button>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleEditService(service)}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:border-[#2D5A27] hover:bg-emerald-50 text-slate-600 hover:text-[#2D5A27] transition"
                                  title="Chỉnh sửa dịch vụ"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteService(service)}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition"
                                  title="Xóa dịch vụ"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 4: BẢNG DỮ LIỆU QUẢN LÝ LỊCH HẸN (APPOINTMENTS)  */}
          {/* ===================================================== */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              {/* Header Card với ô tìm kiếm & Nút Bật Cửa Sổ Thiết Kế Trực Quan */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-[#2D5A27]" />
                    <span>Quản Lý Lịch Hẹn Khách Hàng</span>
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hệ thống tiếp nhận và theo dõi khách đặt lịch hẹn khám, spa từ website ({appointments.length} lịch hẹn)
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                  <div className="relative min-w-[200px] sm:min-w-[240px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Tìm mã lịch, tên khách, SĐT..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenBookingTitleModal}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 shadow-xs transition cursor-pointer whitespace-nowrap shrink-0"
                    title="Cài đặt Tiêu đề & Chú thích mục Đặt Lịch Khám hiển thị trên Trang Chủ"
                  >
                    <Settings className="w-4 h-4 text-amber-700" />
                    <span>Cài Đặt Tiêu Đề Mục</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBookingDesignLangTab('vi');
                      setBookingDesignPreviewLang('vi');
                      setIsBookingDesignModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2D5A27] via-emerald-700 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 shadow-md shadow-emerald-950/20 hover:shadow-lg transition cursor-pointer whitespace-nowrap shrink-0"
                    title="Mở cửa sổ thiết kế Ảnh bìa, tiêu đề 5 sao và các cam kết y khoa Fear-Free"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-[#FFB800]" />
                    <span>Thiết Kế Cột Phải</span>
                  </button>
                </div>
              </div>

              {/* Status Quick Filter Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { key: 'all', label: 'Tất Cả Lịch Hẹn', count: appointments.length, color: 'text-slate-700 bg-slate-100 border-slate-200' },
                  { key: 'cho_xac_nhan', label: 'Chờ Tiếp Nhận', count: appointments.filter((a) => a.trang_thai === 'cho_xac_nhan').length, color: 'text-amber-800 bg-amber-50 border-amber-200' },
                  { key: 'da_xac_nhan', label: 'Đã Xác Nhận', count: appointments.filter((a) => a.trang_thai === 'da_xac_nhan').length, color: 'text-blue-800 bg-blue-50 border-blue-200' },
                  { key: 'da_kham', label: 'Đã Hoàn Thành', count: appointments.filter((a) => a.trang_thai === 'da_kham').length, color: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
                  { key: 'da_huy', label: 'Đã Hủy Lịch', count: appointments.filter((a) => a.trang_thai === 'da_huy').length, color: 'text-rose-800 bg-rose-50 border-rose-200' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setStatusFilter(item.key as any)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      statusFilter === item.key
                        ? 'ring-2 ring-[#2D5A27] shadow-sm bg-white border-[#2D5A27]'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="text-[11px] font-medium text-slate-500">{item.label}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-lg font-black text-slate-900">{item.count}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.color}`}>
                        {item.count > 0 && item.key === 'cho_xac_nhan' ? 'Cần xử lý' : 'Mục'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Bảng Dữ Liệu Lịch Hẹn */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {appointmentsLoading && appointments.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#2D5A27]" />
                    <span>Đang tải danh sách lịch hẹn từ Supabase...</span>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">Không tìm thấy lịch hẹn nào</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.'
                        : 'Hiện chưa có khách hàng nào đặt lịch hẹn qua website.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                          <th className="py-3 px-4">Mã &amp; Thời Gian Đặt</th>
                          <th className="py-3 px-4">Khách Hàng &amp; Liên Hệ</th>
                          <th className="py-3 px-4">Ghi Chú</th>
                          <th className="py-3 px-4">Cơ Sở &amp; Dịch Vụ</th>
                          <th className="py-3 px-4">Thời Gian Khám</th>
                          <th className="py-3 px-4 text-center">Trạng Thái</th>
                          <th className="py-3 px-4 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredAppointments.map((app) => {
                          const { email, cleanNote, lang } = extractEmailAndNote(app.ghi_chu);
                          const isEnBooking = lang === 'en' || /consultation|general health|try the service|city facility|clinic/i.test((app.dich_vu || '') + ' ' + (app.ten_chi_nhanh || ''));
                          const serviceVi = getAdminServiceVi(app.dich_vu);
                          const branchVi = getAdminBranchVi(app.ten_chi_nhanh, app.chi_nhanh_id);
                          const timeSlotVi = app.gio_hen === 'Flexible' ? 'Linh hoạt' : app.gio_hen;

                          const rawPet = (app.ten_thu_cung || '').trim();
                          const lowerPet = rawPet.toLowerCase();
                          const hasRealPet = Boolean(
                            rawPet &&
                            lowerPet !== 'bé cưng' &&
                            lowerPet !== 'be cung' &&
                            lowerPet !== 'beloved pet' &&
                            lowerPet !== 'pet'
                          );

                          const statusBadges: Record<string, { label: string; class: string }> = {
                            cho_xac_nhan: { label: 'Chờ xác nhận', class: 'bg-amber-50 text-amber-800 border-amber-200' },
                            da_xac_nhan: { label: 'Đã xác nhận', class: 'bg-blue-50 text-blue-800 border-blue-200' },
                            da_kham: { label: 'Đã hoàn thành', class: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                            da_huy: { label: 'Đã hủy', class: 'bg-slate-100 text-slate-600 border-slate-200 line-through' },
                          };
                          const currentBadge = statusBadges[app.trang_thai] || statusBadges.cho_xac_nhan;

                          return (
                            <tr
                              key={app.id}
                              id={`appointment-row-${app.id}`}
                              className={`transition-all duration-500 group ${
                                highlightedId === app.id
                                  ? 'bg-emerald-100/90 ring-2 ring-emerald-500 shadow-md font-bold'
                                  : 'hover:bg-slate-50/80'
                              }`}
                            >
                              <td className="py-3 px-4 font-mono">
                                <span className="font-bold text-[#2D5A27] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  {app.ma_lich_hen}
                                </span>
                                <div className="text-[10px] text-slate-400 mt-1">
                                  {app.ngay_tao ? new Date(app.ngay_tao).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : ''}
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-900">{app.ho_ten_chu}</span>
                                  {isEnBooking ? (
                                    <span
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold"
                                      title="Khách đặt bằng tiếng Anh (English)"
                                    >
                                      <UKFlag className="w-3.5 h-2.5 rounded-xs" />
                                      <span>ENG</span>
                                    </span>
                                  ) : (
                                    <span
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold"
                                      title="Khách đặt bằng tiếng Việt"
                                    >
                                      <VietnamFlag className="w-3.5 h-2.5 rounded-xs" />
                                      <span>VN</span>
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-col gap-0.5 mt-0.5">
                                  <a
                                    href={`tel:${app.so_dien_thoai}`}
                                    className="text-[11px] text-emerald-700 hover:underline font-mono inline-flex items-center gap-1"
                                    title="Bấm để gọi nhanh"
                                  >
                                    <PhoneCall className="w-3 h-3" />
                                    <span>{app.so_dien_thoai}</span>
                                  </a>
                                  {email && (
                                    <a
                                      href={`mailto:${email}`}
                                      className="text-[10px] text-blue-600 hover:underline font-mono inline-flex items-center gap-1"
                                      title="Bấm để gửi email cho khách"
                                    >
                                      <Mail className="w-2.5 h-2.5 text-blue-500" />
                                      <span className="truncate max-w-[140px]">{email}</span>
                                    </a>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-4 max-w-xs">
                                {cleanNote ? (
                                  <div className="text-xs text-slate-700 leading-relaxed line-clamp-2" title={cleanNote}>
                                    {cleanNote}
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic">—</span>
                                )}
                                {hasRealPet && (
                                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                                    Bé: <strong>{rawPet}</strong>
                                  </div>
                                )}
                              </td>

                              <td className="py-3 px-4 max-w-xs">
                                <div className="font-bold text-slate-900 truncate" title={serviceVi}>
                                  {serviceVi}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate mt-0.5" title={branchVi}>
                                  {branchVi}
                                </div>
                              </td>

                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="font-bold text-[#2D5A27]">{timeSlotVi}</div>
                                <div className="text-[11px] text-slate-600 mt-0.5">
                                  {app.ngay_hen}
                                </div>
                              </td>

                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${currentBadge.class}`}>
                                  {app.trang_thai === 'cho_xac_nhan' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                                  {currentBadge.label}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAppointmentModal(app)}
                                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-[#2D5A27] hover:bg-emerald-50 text-slate-700 hover:text-[#2D5A27] font-semibold text-xs transition cursor-pointer"
                                  >
                                    Xem &amp; Xử Lý
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAppointment(app)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                                    title="Xóa lịch hẹn"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 5: BẢNG DỮ LIỆU QUẢN LÝ CÂU HỎI THƯỜNG GẶP (FAQ)  */}
          {/* ===================================================== */}
          {activeTab === 'faqs' && (
            <div className="space-y-4">
              {/* SUBTAB 1: DANH SÁCH CÂU HỎI FAQ */}
              {faqSubTab === 'list' && (
                <div className="space-y-4">
                  {/* Header Card với ô tìm kiếm & Nút "+ Thêm Câu Hỏi" */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-[#2D5A27]" />
                        <span>Quản Lý Câu Hỏi Thường GẶP (FAQ)</span>
                      </h1>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Hệ thống câu hỏi &amp; giải đáp y khoa hiển thị dạng Accordion ngoài trang chủ ({faqs.length} câu hỏi)
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative min-w-[200px] sm:min-w-[260px]">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Tìm kiếm câu hỏi, nội dung, danh mục..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27]"
                        />
                      </div>

                      {/* Nút Cài đặt tiêu đề mục */}
                      <button
                        type="button"
                        onClick={handleOpenFaqTitleModal}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
                        title="Cài đặt Tiêu đề & Chú thích hiển thị trên Trang chủ"
                      >
                        <Settings className="w-4 h-4 text-amber-700" />
                        <span>Cài Đặt Tiêu Đề Mục</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleAddNewFaq}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-sm transition shrink-0 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Thêm Câu Hỏi</span>
                      </button>
                    </div>
                  </div>

                  {/* Table Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    {faqsLoading && faqs.length === 0 ? (
                      <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-[#2D5A27]" />
                        <span>Đang tải danh sách câu hỏi...</span>
                      </div>
                    ) : filteredFaqs.length === 0 ? (
                      <div className="p-12 text-center text-slate-500 text-xs">
                        <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-700">Không tìm thấy câu hỏi nào</p>
                        <p className="mt-1 text-slate-400">Thử tìm kiếm với từ khóa khác hoặc bấm "+ Thêm Câu Hỏi" ở trên</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                              <th className="py-3 px-4 w-12 text-center">#</th>
                              <th className="py-3 px-4 w-44">Danh Mục</th>
                              <th className="py-3 px-4 min-w-[240px]">Câu Hỏi</th>
                              <th className="py-3 px-4 min-w-[320px]">Câu Trả Lời</th>
                              <th className="py-3 px-4 w-28 text-center">Trạng Thái</th>
                              <th className="py-3 px-4 w-28 text-right">Thao Tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredFaqs.map((faq, index) => (
                              <tr key={faq.id} className="hover:bg-slate-50/60 transition">
                                <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-medium">
                                  {faq.thu_tu || index + 1}
                                </td>

                                <td className="py-3.5 px-4">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                                    <Tag className="w-3 h-3 text-[#2D5A27]" />
                                    <span>{faq.chuyen_muc || 'Chung'}</span>
                                  </span>
                                  {faq.chuyen_muc_en && (
                                    <p className="text-[10px] text-slate-400 italic mt-1">
                                      EN: {faq.chuyen_muc_en}
                                    </p>
                                  )}
                                </td>

                                <td className="py-3.5 px-4">
                                  <p className="font-bold text-slate-900 leading-snug">
                                    {faq.cau_hoi}
                                  </p>
                                  {faq.cau_hoi_en ? (
                                    <p className="text-[11px] text-[#2D5A27] font-medium italic mt-1 line-clamp-1">
                                      EN: {faq.cau_hoi_en}
                                    </p>
                                  ) : (
                                    <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200">
                                      Chưa có tiếng Anh
                                    </span>
                                  )}
                                </td>

                                <td className="py-3.5 px-4">
                                  <p className="text-slate-600 line-clamp-2 leading-relaxed whitespace-pre-line">
                                    {faq.cau_tra_loi}
                                  </p>
                                  {faq.cau_tra_loi_en && (
                                    <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-2">
                                      EN: {faq.cau_tra_loi_en}
                                    </p>
                                  )}
                                </td>

                                <td className="py-3.5 px-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleFaqActive(faq)}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                                      faq.kich_hoat !== false
                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                                    }`}
                                  >
                                    {faq.kich_hoat !== false ? (
                                      <>
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        <span>Hiển thị</span>
                                      </>
                                    ) : (
                                      <>
                                        <X className="w-3 h-3 text-slate-400" />
                                        <span>Đang ẩn</span>
                                      </>
                                    )}
                                  </button>
                                </td>

                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleEditFaq(faq)}
                                      className="p-1.5 rounded-lg border border-slate-200 hover:border-[#2D5A27] hover:bg-emerald-50 text-slate-600 hover:text-[#2D5A27] transition cursor-pointer"
                                      title="Chỉnh sửa câu hỏi"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteFaq(faq)}
                                      className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition cursor-pointer"
                                      title="Xóa câu hỏi"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUBTAB 2: CÀI ĐẶT MỤC "BẠN CẦN PETM&M HỖ TRỢ?" */}
              {faqSubTab === 'support_panel' && (
                <div className="space-y-4">
                  {/* Header Card với nút Lưu Cài Đặt */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                        <PhoneCall className="w-5 h-5 text-emerald-600" />
                        <span>Cài Đặt Mục &ldquo;Bạn Cần PetM&amp;M Hỗ Trợ?&rdquo;</span>
                      </h1>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tùy chỉnh tiêu đề và 3 thẻ liên hệ hiển thị ngoài Trang Chủ &amp; sidebar Chi Nhánh / Cẩm Nang
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleOpenSupportTitleModal}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold shadow-2xs transition shrink-0 cursor-pointer"
                        title="Cài đặt Tiêu đề & Chú thích Rich Text đa ngôn ngữ hiển thị ngoài Trang Chủ"
                      >
                        <Settings className="w-4 h-4 text-amber-700" />
                        <span>Cài Đặt Tiêu Đề Mục</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveSupportPanel}
                        disabled={isSavingSupportPanel}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-sm transition shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {isSavingSupportPanel ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>{isSavingSupportPanel ? 'Đang Lưu...' : 'Lưu Cài Đặt Vào Database'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Form 1 Cửa Sổ duy nhất theo phong cách Modal Tab Tiếng Việt / English */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                    {/* Thanh Chuyển Ngôn Ngữ & Nút Chuyển đổi ENG */}
                    <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => setSupportPanelTab('vi')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              supportPanelTab === 'vi'
                                ? 'bg-[#2D5A27] text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                            <span>Bản Tiếng Việt</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSupportPanelTab('en')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              supportPanelTab === 'en'
                                ? 'bg-[#2D5A27] text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <UKFlag className="w-4 h-3 rounded-[2px]" />
                            <span>Bản English</span>
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAutoTranslateSupport}
                        disabled={isTranslatingSupport}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs hover:shadow transition disabled:opacity-50 cursor-pointer"
                        title="Dịch tự động toàn bộ nội dung từ Tiếng Việt sang Tiếng Anh bằng AI"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${isTranslatingSupport ? 'animate-spin' : ''}`} />
                        <span>{isTranslatingSupport ? 'Đang Dịch AI...' : 'Chuyển đổi ENG'}</span>
                      </button>
                    </div>

                    {/* FORM NỘI DUNG THEO TAB NGÔN NGỮ */}
                    {supportPanelTab === 'vi' ? (
                      /* TAB 1: BẢN TIẾNG VIỆT */
                      <div className="space-y-5">
                        {/* Tiêu đề & Lời dẫn chung */}
                        <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                            <span>Tiêu Đề &amp; Lời Dẫn Chung (Tiếng Việt)</span>
                          </h3>
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                              Tiêu đề mục (Tiếng Việt): <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={supportPanelData.tieu_de_vi || ''}
                              onChange={(e) =>
                                setSupportPanelData((prev) => ({ ...prev, tieu_de_vi: e.target.value }))
                              }
                              placeholder="Ví dụ: Bạn cần PetM&M hỗ trợ?"
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                              Lời dẫn mô tả (Tiếng Việt):
                            </label>
                            <textarea
                              rows={2}
                              value={supportPanelData.mo_ta_vi || ''}
                              onChange={(e) =>
                                setSupportPanelData((prev) => ({ ...prev, mo_ta_vi: e.target.value }))
                              }
                              placeholder="Chọn cách liên hệ phù hợp với nhu cầu của bạn."
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27]"
                            />
                          </div>
                        </div>

                        {/* Thẻ 1: Zalo */}
                        <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-emerald-700" />
                            <span>Thẻ 1: Đặt Lịch Dịch Vụ Qua Zalo</span>
                          </h3>
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                              Tiêu đề thẻ 1 (Tiếng Việt):
                            </label>
                            <input
                              type="text"
                              value={supportPanelData.card1_title_vi || ''}
                              onChange={(e) =>
                                setSupportPanelData((prev) => ({ ...prev, card1_title_vi: e.target.value }))
                              }
                              placeholder="Đặt lịch dịch vụ qua Zalo"
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                              Nội dung hướng dẫn thẻ 1 (Tiếng Việt):
                            </label>
                            <textarea
                              rows={3}
                              value={supportPanelData.card1_desc_vi || ''}
                              onChange={(e) =>
                                setSupportPanelData((prev) => ({ ...prev, card1_desc_vi: e.target.value }))
                              }
                              placeholder="Gửi thông tin thú cưng, dịch vụ cần sử dụng, cơ sở và thời gian mong muốn để PetM&M xác nhận lịch hẹn."
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27]"
                            />
                          </div>
                        </div>

                        {/* Thẻ 2: Hotline Cấp Cứu */}
                        <div className="space-y-4 p-4 rounded-2xl bg-rose-50/40 border border-rose-200/60">
                          <h3 className="text-xs font-bold text-rose-900 flex items-center gap-2">
                            <PhoneCall className="w-4 h-4 text-rose-600" />
                            <span>Thẻ 2: Gọi Trực Tiếp Hotline Cấp Cứu 24/7</span>
                          </h3>
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                              Tiêu đề thẻ 2 (Tiếng Việt):
                            </label>
                            <input
                              type="text"
                              value={supportPanelData.card2_title_vi || ''}
                              onChange={(e) =>
                                setSupportPanelData((prev) => ({ ...prev, card2_title_vi: e.target.value }))
                              }
                              placeholder="Gọi trực tiếp hotline cấp cứu 24/7"
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                              Nội dung hướng dẫn thẻ 2 (Tiếng Việt):
                            </label>
                            <textarea
                              rows={3}
                              value={supportPanelData.card2_desc_vi || ''}
                              onChange={(e) =>
                                setSupportPanelData((prev) => ({ ...prev, card2_desc_vi: e.target.value }))
                              }
                              placeholder="Khi thú cưng khó thở, co giật, đau nhiều, chảy máu, nôn hoặc tiêu chảy nặng, nghi ngộ độc hay cần hỗ trợ khẩn cấp. Không chờ phản hồi qua tin nhắn."
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                            />
                          </div>
                          <p className="text-[11px] text-rose-700 italic">
                            * Số hotline hiển thị được tự động đồng bộ theo cấu hình chung: <strong>{globalConfig.hotline_hien_thi || globalConfig.hotline || '0903 599 339'}</strong>
                          </p>
                        </div>

                        {/* Thẻ 3: Chăm Sóc Đặc Thù */}
                        <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <MessageSquareHeart className="w-4 h-4 text-emerald-700" />
                            <span>Thẻ 3: Trao Đổi Nhu Cầu Chăm Sóc Đặc Thù</span>
                          </h3>
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                              Tiêu đề thẻ 3 (Tiếng Việt):
                            </label>
                            <input
                              type="text"
                              value={supportPanelData.card3_title_vi || ''}
                              onChange={(e) =>
                                setSupportPanelData((prev) => ({ ...prev, card3_title_vi: e.target.value }))
                              }
                              placeholder="Trao đổi nhu cầu chăm sóc đặc thù"
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                              Nội dung hướng dẫn thẻ 3 (Tiếng Việt):
                            </label>
                            <textarea
                              rows={3}
                              value={supportPanelData.card3_desc_vi || ''}
                              onChange={(e) =>
                                setSupportPanelData((prev) => ({ ...prev, card3_desc_vi: e.target.value }))
                              }
                              placeholder="Gửi hồ sơ và thông tin qua Zalo khi thú cưng có bệnh lý nền, chế độ ăn kiêng riêng hoặc cần lưu trú dài hạn."
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27]"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* TAB 2: BẢN ENGLISH */
                      <div className="space-y-5">
                        {/* Tiêu đề & Lời dẫn chung EN */}
                        <div className="space-y-4 p-4 rounded-2xl bg-indigo-50/40 border border-indigo-200/80">
                          <h3 className="text-xs font-bold text-indigo-900 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                            <span>Title &amp; Description (English)</span>
                          </h3>
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                              Section title (English): <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={supportPanelData.tieu_de_en || ''}
                              onChange={(e) =>
                                setSupportPanelData((prev) => ({ ...prev, tieu_de_en: e.target.value }))
                              }
                              placeholder="Need PetM&M support?"
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                              Description (English):
                            </label>
                            <textarea
                              rows={2}
                              value={supportPanelData.mo_ta_en || ''}
                              onChange={(e) =>
                                setSupportPanelData((prev) => ({ ...prev, mo_ta_en: e.target.value }))
                              }
                              placeholder="Choose the contact method that suits your needs."
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>

                        {/* Thẻ 1 EN */}
                        <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-indigo-700" />
                            <span>Card 1: Book via Zalo (English)</span>
                          </h3>
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                              Card 1 title (English):
                            </label>
                            <input
                              type="text"
                              value={supportPanelData.card1_title_en || ''}
                              onChange={(e) =>
                                setSupportPanelData((prev) => ({ ...prev, card1_title_en: e.target.value }))
                              }
                              placeholder="Book via Zalo"
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                              Card 1 description (English):
                            </label>
                            <textarea
                              rows={3}
                              value={supportPanelData.card1_desc_en || ''}
                              onChange={(e) =>
                                setSupportPanelData((prev) => ({ ...prev, card1_desc_en: e.target.value }))
                              }
                              placeholder="Send your pet info, desired service, branch, and preferred time. PetM&M will confirm your appointment."
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>

                        {/* Thẻ 2 EN */}
                        <div className="space-y-4 p-4 rounded-2xl bg-rose-50/40 border border-rose-200/60">
                          <h3 className="text-xs font-bold text-rose-900 flex items-center gap-2">
                            <PhoneCall className="w-4 h-4 text-rose-600" />
                            <span>Card 2: 24/7 Emergency Hotline (English)</span>
                          </h3>
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                              Card 2 title (English):
                            </label>
                            <input
                              type="text"
                              value={supportPanelData.card2_title_en || ''}
                              onChange={(e) =>
                                setSupportPanelData((prev) => ({ ...prev, card2_title_en: e.target.value }))
                              }
                              placeholder="Call 24/7 Emergency Hotline"
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                              Card 2 description (English):
                            </label>
                            <textarea
                              rows={3}
                              value={supportPanelData.card2_desc_en || ''}
                              onChange={(e) =>
                                setSupportPanelData((prev) => ({ ...prev, card2_desc_en: e.target.value }))
                              }
                              placeholder="When your pet has difficulty breathing, seizures, severe pain, bleeding, vomiting, diarrhea, suspected poisoning, or needs emergency assistance."
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                            />
                          </div>
                          <p className="text-[11px] text-rose-700 italic">
                            * Hotline number is automatically loaded from system contact settings: <strong>{globalConfig.hotline_hien_thi || globalConfig.hotline || '0903 599 339'}</strong>
                          </p>
                        </div>

                        {/* Thẻ 3 EN */}
                        <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            <MessageSquareHeart className="w-4 h-4 text-indigo-700" />
                            <span>Card 3: Special Care Consultation (English)</span>
                          </h3>
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                              Card 3 title (English):
                            </label>
                            <input
                              type="text"
                              value={supportPanelData.card3_title_en || ''}
                              onChange={(e) =>
                                setSupportPanelData((prev) => ({ ...prev, card3_title_en: e.target.value }))
                              }
                              placeholder="Special Care Consultation"
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                              Card 3 description (English):
                            </label>
                            <textarea
                              rows={3}
                              value={supportPanelData.card3_desc_en || ''}
                              onChange={(e) =>
                                setSupportPanelData((prev) => ({ ...prev, card3_desc_en: e.target.value }))
                              }
                              placeholder="Send your pet's medical records via Zalo for chronic conditions, special diets, or long-term boarding needs."
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Nút Lưu ở chân trang */}
                    <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleSaveSupportPanel}
                        disabled={isSavingSupportPanel}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
                      >
                        {isSavingSupportPanel ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>{isSavingSupportPanel ? 'Đang Lưu...' : 'Lưu Cài Đặt Vào Database'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 6: QUẢN LÝ ĐÁNH GIÁ KHÁCH HÀNG (REVIEWS)         */}
          {/* ===================================================== */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {/* Header Card với ô tìm kiếm & Nút "+ Thêm đánh giá" */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span>Quản Lý Đánh Giá Khách Hàng</span>
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Đánh giá trải nghiệm 5 sao từ các ba mẹ thú cưng ({reviews.length} đánh giá)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Ô tìm kiếm */}
                  <div className="relative min-w-[200px] sm:min-w-[260px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm tên, SĐT, dịch vụ, nội dung..."
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-[#2D5A27] bg-slate-50/50"
                    />
                  </div>

                  {/* Nút "Mở Form Tạo Đánh Giá Cho Khách" */}
                  <Link
                    href="/taodanhgia"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFB800] hover:bg-[#E09D00] text-slate-950 text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở Form Tạo Đánh Giá</span>
                  </Link>

                  {/* Nút "+ Thêm đánh giá" */}
                  <button
                    type="button"
                    onClick={handleAddNewReview}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-sm transition shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Đánh Giá</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {reviewsLoading && reviews.length === 0 ? (
                  <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#2D5A27]" />
                    <span className="text-xs font-medium">Đang tải danh sách đánh giá từ Supabase...</span>
                  </div>
                ) : filteredReviews.length === 0 ? (
                  <div className="p-16 text-center text-slate-500">
                    <Star className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-semibold text-slate-700">Chưa có đánh giá nào</p>
                    <p className="text-xs text-slate-400 mt-1">Bấm nút "Thêm Đánh Giá" ở góc phải để thêm đánh giá mới.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                          <th className="py-3 px-4 w-12 text-center">STT</th>
                          <th className="py-3 px-4 min-w-[180px]">Khách Hàng (Chủ Nuôi)</th>
                          <th className="py-3 px-4 min-w-[120px]">Số Điện Thoại</th>
                          <th className="py-3 px-4 min-w-[110px] text-center">Đánh Giá</th>
                          <th className="py-3 px-4 min-w-[320px]">Nội Dung Nhận Xét</th>
                          <th className="py-3 px-4 min-w-[100px] text-center">Thời Gian</th>
                          <th className="py-3 px-4 min-w-[100px] text-center">Trạng Thái</th>
                          <th className="py-3 px-4 min-w-[100px] text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredReviews.map((rev, index) => (
                          <tr
                            key={rev.id}
                            id={`review-row-${rev.id}`}
                            className={`transition-all duration-500 group ${
                              highlightedId === rev.id
                                ? 'bg-emerald-100/90 ring-2 ring-emerald-500 shadow-md font-bold'
                                : 'hover:bg-slate-50/60'
                            }`}
                          >
                            <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                              {index + 1}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                  <img
                                    src={rev.hinh_anh_thu_cung || '/pet_golden_spa.jpg'}
                                    alt={rev.ten_khach_hang}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 truncate">
                                    {rev.ten_khach_hang}
                                  </p>
                                  {rev.ten_khach_hang_en && (
                                    <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1">
                                      <UKFlag className="w-3 h-2 rounded-[1px] shrink-0" />
                                      <span>{rev.ten_khach_hang_en}</span>
                                    </p>
                                  )}
                                  {rev.da_xac_thuc && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 mt-0.5">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>Đã xác thực</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                                {rev.so_dien_thoai}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <div className="inline-flex items-center gap-0.5 text-amber-500">
                                {[...Array(rev.so_sao || 5)].map((_, i) => (
                                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="space-y-1.5">
                                <div className="flex items-start gap-1.5">
                                  <VietnamFlag className="w-3.5 h-2.5 rounded-[1px] mt-0.5 shrink-0" />
                                  <p className="text-slate-700 line-clamp-2 leading-relaxed text-[11px] italic">
                                    &ldquo;{rev.noi_dung}&rdquo;
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                                  <span className="text-slate-400">👤</span>
                                  <span>{formatReviewCreatorInfo(rev)}</span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-center text-slate-700 font-mono text-[11px] font-medium">
                              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {formatDisplayReviewDate(rev.ngay_danh_gia)}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleReviewActive(rev)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                                  rev.kich_hoat !== false
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                                }`}
                              >
                                {rev.kich_hoat !== false ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Hiển thị</span>
                                  </>
                                ) : (
                                  <>
                                    <X className="w-3 h-3 text-slate-400" />
                                    <span>Đang ẩn</span>
                                  </>
                                )}
                              </button>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleEditReview(rev)}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:border-[#2D5A27] hover:bg-emerald-50 text-slate-600 hover:text-[#2D5A27] transition cursor-pointer"
                                  title="Chỉnh sửa đánh giá"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReview(rev)}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition cursor-pointer"
                                  title="Xóa đánh giá"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: QUẢN LÝ ĐỘI NGŨ Y TẾ & TUYỂN DỤNG (2 NHÁNH)        */}
          {/* ========================================================= */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              {teamSubTab === 'careers' && (
                <AdminCareersManager
                  showNotification={showNotification}
                  applications={jobApplications}
                  onUpdateApplicantStatus={handleUpdateApplicantStatus}
                  onDeleteApplicant={handleDeleteApplicant}
                  highlightedId={highlightedId}
                  onOpenTitleModal={handleOpenCareersTitleModal}
                />
              )}

              {teamSubTab === 'members' && (
                <div className="space-y-6">
                  {/* Header Card */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[#2D5A27]" />
                    <span>Đội Ngũ Chuyên Gia, Bác Sĩ &amp; Điều Dưỡng</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Cấu trúc 4 nhóm chuẩn mực y khoa: Lãnh đạo chuyên môn, Chuyên gia tư vấn, Bác sĩ thú y, Điều dưỡng &amp; Chăm sóc.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAddNewMember}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-sm transition shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Nhân Sự Mới</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: 'Tất Cả', count: teamMembers.length },
                    { id: 'lanh_dao', label: 'Lãnh Đạo Chuyên Môn', count: teamMembers.filter((m) => m.phan_loai === 'lanh_dao').length },
                    { id: 'chuyen_gia', label: 'Chuyên Gia Tư Vấn', count: teamMembers.filter((m) => m.phan_loai === 'chuyen_gia').length },
                    { id: 'bac_si', label: 'Bác Sĩ Thú Y', count: teamMembers.filter((m) => m.phan_loai === 'bac_si').length },
                    { id: 'dieu_duong', label: 'Điều Dưỡng & Chăm Sóc', count: teamMembers.filter((m) => m.phan_loai === 'dieu_duong').length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setTeamCategoryFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        teamCategoryFilter === tab.id
                          ? 'bg-[#2D5A27] text-white shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          teamCategoryFilter === tab.id
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[200px] sm:min-w-[260px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm tên, chức danh, bằng cấp..."
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-[#2D5A27] bg-white shadow-2xs"
                  />
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {teamLoading && teamMembers.length === 0 ? (
                  <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#2D5A27]" />
                    <span className="text-xs font-medium">Đang tải danh sách đội ngũ từ Supabase...</span>
                  </div>
                ) : filteredTeamMembers.length === 0 ? (
                  <div className="p-16 text-center text-slate-500">
                    <UserCheck className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-semibold text-slate-700">Chưa có nhân sự nào trong mục này</p>
                    <p className="text-xs text-slate-400 mt-1">Bấm nút &ldquo;Thêm Nhân Sự Mới&rdquo; ở góc phải để thêm hồ sơ bác sĩ / điều dưỡng.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                          <th className="py-3 px-4 w-12 text-center">STT</th>
                          <th className="py-3 px-4 min-w-[220px]">Bác Sĩ / Nhân Sự</th>
                          <th className="py-3 px-4 min-w-[170px]">Hạn Mục Phân Loại</th>
                          <th className="py-3 px-4 min-w-[150px]">Học Vị / Chức Vụ</th>
                          <th className="py-3 px-4 min-w-[260px]">Giới Thiệu Tóm Tắt</th>
                          <th className="py-3 px-4 w-16 text-center">Thứ Tự</th>
                          <th className="py-3 px-4 min-w-[100px] text-center">Trạng Thái</th>
                          <th className="py-3 px-4 min-w-[100px] text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredTeamMembers.map((member, index) => {
                          const badgeColor =
                            member.phan_loai === 'lanh_dao'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : member.phan_loai === 'chuyen_gia'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : member.phan_loai === 'bac_si'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200';

                          const categoryName =
                            member.phan_loai === 'lanh_dao'
                              ? 'Lãnh Đạo Chuyên Môn'
                              : member.phan_loai === 'chuyen_gia'
                              ? 'Chuyên Gia Tư Vấn'
                              : member.phan_loai === 'bac_si'
                              ? 'Bác Sĩ Thú Y'
                              : 'Điều Dưỡng & Chăm Sóc';

                          return (
                            <tr key={member.id} className="hover:bg-slate-50/60 transition group">
                              <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                                {index + 1}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 border border-slate-200 shrink-0 relative flex items-center justify-center">
                                    {member.hinh_anh ? (
                                      <img
                                        src={member.hinh_anh}
                                        alt={member.ho_ten}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-[#D6D0C7]">
                                        <div className="w-7 h-7 rounded-full bg-[#E5DFD7] flex items-center justify-center overflow-hidden">
                                          <svg viewBox="0 0 100 100" className="w-full h-full text-[#B8B0A5]" fill="currentColor">
                                            <circle cx="50" cy="38" r="18" />
                                            <path d="M18 90c0-17.67 14.33-32 32-32s32 14.33 32 32v10H18V90z" />
                                          </svg>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-[10px] font-bold text-[#8B1E1E] uppercase tracking-wider">
                                      {member.chuc_danh || 'BÁC SĨ THÚ Y'}
                                    </div>
                                    <p className="font-bold text-slate-900 text-sm truncate">
                                      {member.ho_ten}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badgeColor}`}>
                                  {categoryName}
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="text-slate-700 font-medium text-xs line-clamp-2">
                                  {member.hoc_vi_chuc_vu || '—'}
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <p className="text-slate-600 line-clamp-2 leading-relaxed text-[11px]">
                                  {member.mo_ta || '—'}
                                </p>
                              </td>

                              <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-500">
                                {member.thu_tu ?? 0}
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleMemberActive(member)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                                    member.kich_hoat !== false
                                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                                  }`}
                                >
                                  {member.kich_hoat !== false ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>Hiển thị</span>
                                    </>
                                  ) : (
                                    <>
                                      <X className="w-3 h-3 text-slate-400" />
                                      <span>Đang ẩn</span>
                                    </>
                                  )}
                                </button>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleEditMember(member)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:border-[#2D5A27] hover:bg-emerald-50 text-slate-600 hover:text-[#2D5A27] transition cursor-pointer"
                                    title="Chỉnh sửa hồ sơ"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMember(member)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition cursor-pointer"
                                    title="Xóa nhân sự"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

          {/* ========================================================= */}
          {/* TAB NHÂN SỰ: QUẢN LÝ TÀI KHOẢN & NHÂN SỰ HỆ THỐNG        */}
          {/* ========================================================= */}
          {activeTab === 'staff' && <StaffManagementTab currentUser={currentUser} showNotification={showNotification} />}

          {/* ========================================================= */}
          {/* TAB 8: QUẢN LÝ BÀI VIẾT & CẨM NANG KIẾN THỨC             */}
          {/* ========================================================= */}
          {activeTab === 'articles' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#2D5A27]" />
                    <span>Cẩm Nang Kiến Thức &amp; Kinh Nghiệm Nuôi Thú Cưng</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Quản lý toàn bộ bài viết chia sẻ y khoa, hướng dẫn sơ cứu khẩn cấp, dinh dưỡng và kinh nghiệm chăm sóc thú cưng.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Nút Cài đặt tiêu đề mục */}
                  <button
                    type="button"
                    onClick={handleOpenArticlesTitleModal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
                    title="Cài đặt Tiêu đề & Chú thích hiển thị trên Trang chủ"
                  >
                    <Settings className="w-4 h-4 text-amber-700" />
                    <span>Cài Đặt Tiêu Đề Mục</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddNewArticle}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-sm transition shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Bài Viết Mới</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: 'Tất Cả', count: articles.length },
                    { id: 'Y Khoa Dự Phòng', label: 'Y Khoa Dự Phòng', count: articles.filter((a) => a.chuyen_muc === 'Y Khoa Dự Phòng').length },
                    { id: 'Sơ Cứu Thú Cưng', label: 'Sơ Cứu Thú Cưng', count: articles.filter((a) => a.chuyen_muc === 'Sơ Cứu Thú Cưng').length },
                    { id: 'Chăm Sóc & Spa', label: 'Chăm Sóc & Spa', count: articles.filter((a) => a.chuyen_muc === 'Chăm Sóc & Spa').length },
                    { id: 'Dinh Dưỡng Thú Cưng', label: 'Dinh Dưỡng', count: articles.filter((a) => a.chuyen_muc === 'Dinh Dưỡng Thú Cưng').length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setArticleCategoryFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        articleCategoryFilter === tab.id
                          ? 'bg-[#2D5A27] text-white shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          articleCategoryFilter === tab.id
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[200px] sm:min-w-[260px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Tìm kiếm bài viết"
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-[#2D5A27] bg-white shadow-2xs"
                  />
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {articlesLoading && articles.length === 0 ? (
                  <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#2D5A27]" />
                    <span className="text-xs font-medium">Đang tải danh sách bài viết từ cơ sở dữ liệu...</span>
                  </div>
                ) : filteredArticles.length === 0 ? (
                  <div className="p-16 text-center text-slate-500">
                    <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-semibold text-slate-700">Chưa có bài viết nào</p>
                    <p className="text-xs text-slate-400 mt-1">Bấm nút &ldquo;Thêm Bài Viết Mới&rdquo; ở góc phải để tạo bài viết đầu tiên.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                          <th className="py-3 px-4 w-12 text-center">STT</th>
                          <th className="py-3 px-4 min-w-[280px]">Bài Viết &amp; Ảnh Bìa</th>
                          <th className="py-3 px-4 min-w-[150px]">Chuyên Mục</th>
                          <th className="py-3 px-4 min-w-[160px]">Tác Giả / Ngày Đăng</th>
                          <th className="py-3 px-4 min-w-[120px]">Thời Gian Đọc</th>
                          <th className="py-3 px-4 w-16 text-center">Thứ Tự</th>
                          <th className="py-3 px-4 min-w-[100px] text-center">Trạng Thái</th>
                          <th className="py-3 px-4 min-w-[110px] text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredArticles.map((art, index) => {
                          const badgeColor =
                            art.chuyen_muc === 'Y Khoa Dự Phòng'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : art.chuyen_muc === 'Sơ Cứu Thú Cưng'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : art.chuyen_muc === 'Chăm Sóc & Spa'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200';

                          return (
                            <tr key={art.id} className="hover:bg-slate-50/60 transition group">
                              <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                                {index + 1}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative flex items-center justify-center">
                                    {art.hinh_anh ? (
                                      <img
                                        src={art.hinh_anh}
                                        alt={art.tieu_de}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <ImageIcon className="w-5 h-5 text-slate-300" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <button
                                      type="button"
                                      onClick={() => handleEditArticle(art)}
                                      className="font-bold text-slate-900 text-xs sm:text-sm hover:text-[#2D5A27] transition line-clamp-1 text-left cursor-pointer"
                                      title="Chỉnh sửa bài viết"
                                    >
                                      <span>{art.tieu_de}</span>
                                    </button>
                                    <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">
                                      {art.mo_ta_ngan || 'Chưa có mô tả tóm tắt'}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badgeColor}`}>
                                  {art.chuyen_muc || 'Y Khoa Dự Phòng'}
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="text-slate-800 font-medium text-xs">
                                  {art.tac_gia || 'Hội Đồng Y Khoa'}
                                </div>
                                <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                                  <CalendarDays className="w-3 h-3" />
                                  <span>{art.ngay_dang || 'Mới cập nhật'}</span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="inline-flex items-center gap-1 text-slate-600 font-medium text-xs">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{art.thoi_gian_doc || '4 phút đọc'}</span>
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-500">
                                {art.thu_tu ?? 0}
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleArticleActive(art)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                                    art.kich_hoat !== false
                                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                                  }`}
                                >
                                  {art.kich_hoat !== false ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>Hiển thị</span>
                                    </>
                                  ) : (
                                    <>
                                      <X className="w-3 h-3 text-slate-400" />
                                      <span>Đang ẩn</span>
                                    </>
                                  )}
                                </button>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleEditArticle(art)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:border-[#2D5A27] hover:bg-emerald-50 text-slate-600 hover:text-[#2D5A27] transition cursor-pointer"
                                    title="Chỉnh sửa bài viết"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteArticle(art)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition cursor-pointer"
                                    title="Xóa bài viết"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* 3. MODAL POPUP FORM: THÊM / CĂN CHỈNH ẢNH NỀN HERO       */}
      {/*    (BẬT NỔI Ở GIỮA MÀN HÌNH ĐÚNG NHƯ ẢNH MẪU YÊU CẦU)     */}
      {/* ========================================================= */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <AdminResizableModal className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#2D5A27]/10 flex items-center justify-center text-[#2D5A27]">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-wide uppercase">
                  {isCreatingNewBanner ? 'Thêm Ảnh Nền Hero Mới' : 'Căn Chỉnh Vị Trí Ảnh Nền'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Tải ảnh / dán URL */}
              <div>
                <AdminImageInput
                  value={editingBanner.duong_dan_anh || ''}
                  onChange={(url) =>
                    setEditingBanner((prev) => ({ ...prev, duong_dan_anh: url }))
                  }
                  folder="banners"
                  label="Đường dẫn ảnh nền hoặc tải tệp từ máy tính:"
                  uploadButtonLabel="Tải File"
                  pasteButtonLabel="Dán Ảnh"
                  onNotification={showNotification}
                />
              </div>

              {/* Khung kéo thả căn chỉnh Facebook style */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-[#2D5A27]" />
                    <span>Kéo chuột hoặc ngón tay để căn chỉnh góc hiển thị:</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Chuyển đổi xem trước Desktop / Mobile */}
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setBannerCropPreviewMode('desktop')}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                          bannerCropPreviewMode === 'desktop'
                            ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        🖥️ Máy tính
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerCropPreviewMode('mobile')}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                          bannerCropPreviewMode === 'mobile'
                            ? 'bg-white text-[#2D5A27] font-semibold shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        📱 Điện thoại
                      </button>
                    </div>

                    <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {cropX}% {cropY}%
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCropX(50);
                        setCropY(50);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-[#2D5A27] transition cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Căn giữa</span>
                    </button>
                  </div>
                </div>

                <div
                  ref={cropBoxRef}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  className={`relative overflow-hidden border-2 bg-slate-950 select-none transition-all duration-200 ${
                    bannerCropPreviewMode === 'mobile'
                      ? 'w-full max-w-[240px] aspect-[9/16] mx-auto rounded-3xl shadow-xl'
                      : 'w-full aspect-[21/9] sm:aspect-[2.4/1] rounded-2xl shadow-sm'
                  } ${
                    isDragging
                      ? 'cursor-grabbing border-[#2D5A27] shadow-lg'
                      : 'cursor-grab border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {editingBanner.duong_dan_anh ? (
                    <>
                      <img
                        src={editingBanner.duong_dan_anh}
                        alt="Cắt ảnh"
                        draggable={false}
                        className="w-full h-full object-cover pointer-events-none transition-transform duration-75"
                        style={{
                          objectPosition: `${cropX}% ${cropY}%`,
                          transform: `scale(${zoomLevel})`,
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/hero_cinematic.jpg';
                        }}
                      />

                      {/* Lưới 3x3 */}
                      <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                        <div className="border-r border-b border-white/20" />
                        <div className="border-r border-b border-white/20" />
                        <div className="border-b border-white/20" />
                        <div className="border-r border-b border-white/20" />
                        <div className="border-r border-b border-white/20" />
                        <div className="border-b border-white/20" />
                        <div className="border-r border-b border-white/20" />
                        <div className="border-r border-b border-white/20" />
                        <div />
                      </div>

                      <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5 shadow-sm">
                        <Move className="w-3.5 h-3.5 text-amber-300" />
                        <span>{isDragging ? 'Đang kéo ảnh...' : 'Nhấp giữ và kéo ảnh để căn chỉnh'}</span>
                      </div>

                      <div className="absolute bottom-3 left-4 pointer-events-none max-w-[65%]">
                        <p className="text-[10px] uppercase font-bold text-amber-300">
                          Vị trí hiển thị chữ ngoài web:
                        </p>
                        <p className="text-xs font-semibold text-white line-clamp-1">
                          Nâng niu từng nhịp thở, an yên trọn một đời.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                      <ImageIcon className="w-8 h-8 mb-1.5 opacity-50" />
                      <span>Vui lòng dán liên kết hoặc tải ảnh lên để căn chỉnh</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-medium">Căn nhanh:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCropX(50);
                        setCropY(15);
                      }}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
                    >
                      Đỉnh (Trên)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCropX(50);
                        setCropY(50);
                      }}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
                    >
                      Chính giữa
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCropX(50);
                        setCropY(85);
                      }}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
                    >
                      Đáy (Dưới)
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400">Tỷ lệ xem trước chuẩn Hero ngoài trang chủ</span>
                </div>
              </div>

              {/* Thu phóng & Thời gian */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Thu phóng ảnh (Zoom):</span>
                    <span className="font-mono text-[#2D5A27]">{zoomLevel.toFixed(2)}x</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ZoomOut className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="range"
                      min="1.0"
                      max="1.8"
                      step="0.01"
                      value={zoomLevel}
                      onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                      className="w-full accent-[#2D5A27] cursor-pointer"
                    />
                    <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Thời gian hiển thị ảnh:</span>
                    <span className="font-mono text-[#2D5A27]">
                      {((editingBanner.thoi_gian_hien_thi || 4000) / 1000).toFixed(0)} giây
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="3000"
                      max="12000"
                      step="1000"
                      value={editingBanner.thoi_gian_hien_thi || 4000}
                      onChange={(e) =>
                        setEditingBanner((prev) => ({
                          ...prev,
                          thoi_gian_hien_thi: parseInt(e.target.value, 10),
                        }))
                      }
                      className="w-full accent-[#2D5A27] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Thứ tự & Trạng thái */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thứ tự hiển thị:
                  </label>
                  <input
                    type="number"
                    value={editingBanner.thu_tu || 1}
                    onChange={(e) =>
                      setEditingBanner((prev) => ({ ...prev, thu_tu: parseInt(e.target.value, 10) || 1 }))
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trạng thái phát hành:
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingBanner((prev) => ({ ...prev, kich_hoat: !prev?.kich_hoat }))
                    }
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      editingBanner.kich_hoat !== false
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-slate-100 border-slate-300 text-slate-600'
                    }`}
                  >
                    {editingBanner.kich_hoat !== false ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Đang bật hiển thị trên Website</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-slate-400" />
                        <span>Đang tắt (Tạm ẩn)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                Hủy Bỏ
              </button>

              <button
                type="button"
                disabled={isBannerSaving}
                onClick={handleSaveBanner}
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                {isBannerSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isBannerSaving ? 'Đang lưu vào Supabase...' : 'Lưu Ảnh Nền'}</span>
              </button>
            </div>
          </AdminResizableModal>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MODAL POPUP FORM: THÊM / CHỈNH SỬA CHI NHÁNH BỆNH VIỆN */}
      {/*    (BẬT NỔI Ở GIỮA MÀN HÌNH ĐÚNG NHƯ ẢNH MẪU YÊU CẦU)     */}
      {/* ========================================================= */}
            {editingBranch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <AdminResizableModal className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#2D5A27]/10 flex items-center justify-center text-[#2D5A27]">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-wide uppercase">
                  {isCreatingNewBranch ? 'Thêm Chi Nhánh Mới' : 'Chỉnh Sửa Chi Nhánh Bệnh Viện'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBranch(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Thanh Chuyển Ngôn Ngữ & Nút Dịch AI */}
              <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setBranchLangTab('vi')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        branchLangTab === 'vi'
                          ? 'bg-[#2D5A27] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                      <span>Bản Tiếng Việt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBranchLangTab('en')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        branchLangTab === 'en'
                          ? 'bg-[#2D5A27] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UKFlag className="w-4 h-3 rounded-[2px]" />
                      <span>Bản English</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAutoTranslateBranch}
                  disabled={isTranslatingBranch}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
                  title="Dịch tự động toàn bộ thông tin chi nhánh và bài viết sang Tiếng Anh bằng AI"
                >
                  {isTranslatingBranch ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{isTranslatingBranch ? 'Đang chuyển đổi toàn bộ...' : 'Chuyển đổi ENG'}</span>
                </button>
              </div>

              {branchLangTab === 'vi' ? (
                /* TAB 1: BẢN TIẾNG VIỆT */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tên chi nhánh đầy đủ (Tiếng Việt): <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingBranch.ten_chi_nhanh || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, ten_chi_nhanh: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="Ví dụ: Bệnh Viện Thú Y PetM&M - Chi Nhánh Quận 7"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tên ngắn hiển thị trên thẻ (Tiếng Việt):
                      </label>
                      <input
                        type="text"
                        value={editingBranch.ten_ngan || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, ten_ngan: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="Ví dụ: Cơ Sở Quận 7"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Khu vực / Quận huyện (Tiếng Việt):
                      </label>
                      <input
                        type="text"
                        value={editingBranch.khu_vuc || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, khu_vuc: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="Ví dụ: Quận 7, TP. Hồ Chí Minh"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Khẩu hiệu chi nhánh (Tiếng Việt):
                      </label>
                      <input
                        type="text"
                        value={editingBranch.khau_hieu || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, khau_hieu: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="Ví dụ: Trung tâm Cấp Cứu 24/7 & Hồi Sức Tích Cực"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Địa chỉ chi nhánh (Tiếng Việt): <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingBranch.dia_chi || ''}
                      onChange={(e) => setEditingBranch((prev) => ({ ...prev, dia_chi: e.target.value }))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      placeholder="Số nhà, tên đường, phường, quận..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Bác sĩ phụ trách (Tiếng Việt):
                      </label>
                      <input
                        type="text"
                        value={editingBranch.bac_si_phu_trach || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, bac_si_phu_trach: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="Ví dụ: ThS. BS. Nguyễn Văn A"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Bằng cấp / Chuyên khoa (Tiếng Việt):
                      </label>
                      <input
                        type="text"
                        value={editingBranch.bang_cap_bac_si || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, bang_cap_bac_si: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="Ví dụ: Chuyên gia Phẫu thuật Ngoại khoa"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Giờ hoạt động (Tiếng Việt):
                      </label>
                      <input
                        type="text"
                        value={editingBranch.gio_hoat_dong || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, gio_hoat_dong: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="Ví dụ: 08:00 - 21:00 (Cấp cứu 24/7)"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Thông tin đỗ xe (Tiếng Việt):
                      </label>
                      <input
                        type="text"
                        value={editingBranch.thong_tin_do_xe || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, thong_tin_do_xe: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="Ví dụ: Có bãi đỗ xe ô tô & xe máy rộng rãi"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Danh sách tiện ích / dịch vụ nổi bật (Tiếng Việt, mỗi dòng một ý):
                    </label>
                    <textarea
                      value={featuresInput}
                      onChange={(e) => setFeaturesInput(e.target.value)}
                      rows={3}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none font-mono"
                      placeholder={"Phòng cấp cứu 24/7 trang bị hiện đại\nKhu lưu chuồng riêng cho chó và mèo\nPhòng phẫu thuật vô trùng chuẩn quốc tế"}
                    />
                  </div>

                  {/* Bài viết chi tiết (TipTap RichTextEditor) */}
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#2D5A27]" />
                        <span>Bài viết giới thiệu chi tiết chi nhánh (Tiếng Việt):</span>
                      </label>
                    </div>
                    <RichTextEditor
                      key={`branch-editor-vi-${editingBranch.id || 'new'}`}
                      value={editingBranch.bai_viet_chi_tiet || ''}
                      onChange={(html) => setEditingBranch((prev) => ({ ...prev, bai_viet_chi_tiet: html }))}
                      minHeight={340}
                      onUploadImage={async (file) => {
                        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
                        const filePath = `branches/article_${Date.now()}_${Math.random()
                          .toString(36)
                          .substring(2, 6)}.${fileExt}`;
                        const { error } = await supabase.storage
                          .from('hinh_anh')
                          .upload(filePath, file, { cacheControl: '3600', upsert: true });
                        if (error) throw error;
                        const { data: urlData } = supabase.storage.from('hinh_anh').getPublicUrl(filePath);
                        return urlData.publicUrl;
                      }}
                    />
                  </div>
                </div>
              ) : (
                /* TAB 2: BẢN TIẾNG ANH (ENGLISH) - BỐ CỤC ĐỒNG BỘ Y CHANG TIẾNG VIỆT */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tên chi nhánh đầy đủ (English): <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={(editingBranch as any).ten_chi_nhanh_en || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, ten_chi_nhanh_en: e.target.value } as any))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. PetM&M Veterinary Hospital - District 7 Branch"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tên ngắn hiển thị trên thẻ (English):
                      </label>
                      <input
                        type="text"
                        value={(editingBranch as any).ten_ngan_en || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, ten_ngan_en: e.target.value } as any))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. District 7 Branch"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Khu vực / Quận huyện (English):
                      </label>
                      <input
                        type="text"
                        value={(editingBranch as any).khu_vuc_en || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, khu_vuc_en: e.target.value } as any))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. District 7, Ho Chi Minh City"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Khẩu hiệu chi nhánh (English):
                      </label>
                      <input
                        type="text"
                        value={(editingBranch as any).khau_hieu_en || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, khau_hieu_en: e.target.value } as any))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. 24/7 Emergency & Critical Care Center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Địa chỉ chi nhánh (English): <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={(editingBranch as any).dia_chi_en || ''}
                      onChange={(e) => setEditingBranch((prev) => ({ ...prev, dia_chi_en: e.target.value } as any))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      placeholder="e.g. 123 Nguyen Thi Thap St, District 7..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Bác sĩ phụ trách (English):
                      </label>
                      <input
                        type="text"
                        value={(editingBranch as any).bac_si_phu_trach_en || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, bac_si_phu_trach_en: e.target.value } as any))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. Dr. Nguyen Van A, DVM"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Bằng cấp / Chuyên khoa (English):
                      </label>
                      <input
                        type="text"
                        value={(editingBranch as any).bang_cap_bac_si_en || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, bang_cap_bac_si_en: e.target.value } as any))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. Surgical Specialist"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Giờ hoạt động (English):
                      </label>
                      <input
                        type="text"
                        value={(editingBranch as any).gio_hoat_dong_en || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, gio_hoat_dong_en: e.target.value } as any))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. 08:00 - 21:00 (24/7 Emergency)"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Thông tin đỗ xe (English):
                      </label>
                      <input
                        type="text"
                        value={(editingBranch as any).thong_tin_do_xe_en || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, thong_tin_do_xe_en: e.target.value } as any))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. Spacious car & motorbike parking available"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Danh sách tiện ích / dịch vụ nổi bật (English, mỗi dòng một ý):
                    </label>
                    <textarea
                      value={featuresEnInput}
                      onChange={(e) => setFeaturesEnInput(e.target.value)}
                      rows={3}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none font-mono"
                      placeholder={"24/7 Emergency ICU with advanced monitors\nSeparate dog & cat hospitalization suites\nSterile laminar-flow surgical theater"}
                    />
                  </div>

                  {/* Bài viết chi tiết EN (TipTap RichTextEditor) */}
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#2D5A27]" />
                        <span>Bài viết giới thiệu chi tiết chi nhánh (English):</span>
                      </label>
                    </div>
                    <RichTextEditor
                      key={`branch-editor-en-${editingBranch.id || 'new'}`}
                      value={(editingBranch as any).bai_viet_chi_tiet_en || ''}
                      onChange={(html) => setEditingBranch((prev) => ({ ...prev, bai_viet_chi_tiet_en: html } as any))}
                      minHeight={340}
                      onUploadImage={async (file) => {
                        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
                        const filePath = `branches/article_${Date.now()}_${Math.random()
                          .toString(36)
                          .substring(2, 6)}.${fileExt}`;
                        const { error } = await supabase.storage
                          .from('hinh_anh')
                          .upload(filePath, file, { cacheControl: '3600', upsert: true });
                        if (error) throw error;
                        const { data: urlData } = supabase.storage.from('hinh_anh').getPublicUrl(filePath);
                        return urlData.publicUrl;
                      }}
                    />
                  </div>
                </div>
              )}

              {/* COMMON FIELDS (HOTLINE, MAPS, IMAGE, ETC.) */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số điện thoại hotline chi nhánh:
                    </label>
                    <input
                      type="text"
                      value={editingBranch.so_dien_thoai || ''}
                      onChange={(e) => setEditingBranch((prev) => ({ ...prev, so_dien_thoai: e.target.value }))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      placeholder="Ví dụ: 090 123 4567"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Link Google Maps App (Chỉ đường trực tiếp):
                    </label>
                    <input
                      type="text"
                      value={editingBranch.link_ggmap_app || ''}
                      onChange={(e) => setEditingBranch((prev) => ({ ...prev, link_ggmap_app: e.target.value }))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      placeholder="https://maps.app.goo.gl/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Link Google Maps Embed (iframe bản đồ nhúng):
                  </label>
                  <input
                    type="text"
                    value={editingBranch.link_ggmap_embed || ''}
                    onChange={(e) => setEditingBranch((prev) => ({ ...prev, link_ggmap_embed: e.target.value }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none font-mono text-[11px]"
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                </div>

                {/* KHỐI ẢNH ĐẠI DIỆN & CẮT CHỈNH INTERACTIVE (ẢNH BÊN TRÁI, Ô VUÔNG KÉO CẮT) */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    <div className="lg:col-span-7">
                      <AdminInteractiveCropper
                        value={editingBranch.anh_dai_dien || ''}
                        originalUrl={editingBranch.anh_goc || editingBranch.anh_dai_dien || ''}
                        onChange={(url) => setEditingBranch((prev) => ({ ...prev, anh_dai_dien: url }))}
                        onOriginalChange={(url) => setEditingBranch((prev) => ({ ...prev, anh_goc: url }))}
                        onPreviewChange={(url) => setBranchPreview(url)}
                        folder="branches"
                        aspectRatio={16 / 10}
                        onNotification={showNotification}
                        label="Ảnh Đại Diện Chi Nhánh (Tỉ lệ 16:10)"
                      />
                    </div>
                    <div className="lg:col-span-5 space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#2D5A27]" />
                          <span>Mô phỏng hiển thị trên Thẻ Chi Nhánh</span>
                        </h4>
                        {(branchPreview || editingBranch.anh_dai_dien) && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Ảnh áp dụng</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Cột bên trái là khung cắt trên ảnh gốc. Kéo các ô vuông để chọn góc hiển thị đẹp nhất, ảnh sau khi cắt sẽ tự động cập nhật vào thẻ hiển thị bên dưới.
                      </p>
                      {(branchPreview || editingBranch.anh_dai_dien) && (
                        <div className="pt-2">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mô phỏng hiển thị trên thẻ chi nhánh:</label>
                          <div className="w-full aspect-[16/10] rounded-xl overflow-hidden border border-slate-300 shadow-2xs bg-slate-100">
                            <img
                              src={branchPreview || editingBranch.anh_dai_dien || ''}
                              alt="Branch card preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Thứ tự hiển thị:
                    </label>
                    <input
                      type="number"
                      value={editingBranch.thu_tu || 1}
                      onChange={(e) =>
                        setEditingBranch((prev) => ({
                          ...prev,
                          thu_tu: parseInt(e.target.value, 10) || 1,
                        }))
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div className="pt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingBranch.kich_hoat !== false}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, kich_hoat: e.target.checked }))}
                        className="w-4 h-4 rounded text-[#2D5A27] focus:ring-[#2D5A27]"
                      />
                      <span className="text-xs font-semibold text-slate-700">Kích hoạt chi nhánh ngoài website</span>
                    </label>
                  </div>
                </div>

                {/* Ô tick chọn Cơ Sở Chính */}
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 shadow-2xs">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean((editingBranch as any).la_co_so_chinh)}
                      onChange={(e) => setEditingBranch((prev) => ({ ...prev, la_co_so_chinh: e.target.checked } as any))}
                      className="w-4 h-4 mt-0.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <span>⭐ Đặt làm Cơ Sở Chính</span>
                        <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-900">
                          Chân trang web (Footer)
                        </span>
                      </span>
                      <p className="text-[11px] text-amber-800/80 mt-0.5 leading-relaxed">
                        Khi chọn, cơ sở này sẽ được hiển thị tại mục &ldquo;Cơ Sở Chính&rdquo; kèm theo bản đồ Google Maps và hướng dẫn chỉ đường ở chân trang của toàn bộ website.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setEditingBranch(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveBranch}
                disabled={isBranchSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isBranchSaving ? 'Đang lưu...' : 'Lưu Chi Nhánh'}</span>
              </button>
            </div>
          </AdminResizableModal>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL CÀI ĐẶT TIÊU ĐỀ & CHÚ THÍCH MỤC CHI NHÁNH (TRANG CHỦ) */}
      {/* ========================================================= */}
      <SectionTitleModal
        isOpen={isBranchTitleModalOpen}
        onClose={() => setIsBranchTitleModalOpen(false)}
        modalTitle="Cài Đặt Tiêu Đề & Chú Thích Mục Chi Nhánh"
        sectionLabel="Chi Nhánh"
        titleFieldKey="section_chi_nhanh_tieu_de"
        descFieldKey="section_chi_nhanh_mo_ta"
        titleFieldKeyEn="section_chi_nhanh_tieu_de_en"
        descFieldKeyEn="section_chi_nhanh_mo_ta_en"
        initialTitleVi={configForm.section_chi_nhanh_tieu_de || globalConfig.section_chi_nhanh_tieu_de}
        initialDescVi={configForm.section_chi_nhanh_mo_ta || globalConfig.section_chi_nhanh_mo_ta}
        initialTitleEn={configForm.section_chi_nhanh_tieu_de_en || globalConfig.section_chi_nhanh_tieu_de_en}
        initialDescEn={configForm.section_chi_nhanh_mo_ta_en || globalConfig.section_chi_nhanh_mo_ta_en}
        defaultTitleVi='<h2>Hệ Thống Cơ Sở &amp; <br /><span style="color: #2D5A27; font-style: italic;">Bản Đồ Chỉ Đường Trực Quan</span></h2>'
        defaultDescVi='<p>Hệ thống phòng khám thú y chuẩn y khoa 5 sao với đầy đủ trang thiết bị hiện đại, phục vụ ba mẹ và các bé tận tâm 24/7.</p>'
        defaultTitleEn='<h2>Clinic Network &amp; <br /><span style="color: #2D5A27; font-style: italic;">Interactive Direction Maps</span></h2>'
        defaultDescEn='<p>A 5-star standard veterinary clinic network with fully modern equipment, caring for pet parents and their furry friends wholeheartedly 24/7.</p>'
        previewAlign="center"
        showNotification={showNotification}
        onSaveSuccess={(saved) => {
          setConfigForm((prev) => ({
            ...prev,
            section_chi_nhanh_tieu_de: saved.titleVi,
            section_chi_nhanh_mo_ta: saved.descVi,
            section_chi_nhanh_tieu_de_en: saved.titleEn,
            section_chi_nhanh_mo_ta_en: saved.descEn,
          }));
        }}
      />

      {/* ========================================================= */}
      {/* MODAL CÀI ĐẶT TIÊU ĐỀ & CHÚ THÍCH MỤC SỨ MỆNH & TRIẾT LÝ (TRANG CHỦ) */}
      {/* ========================================================= */}
      <SectionTitleModal
        isOpen={isAboutTitleModalOpen}
        onClose={() => setIsAboutTitleModalOpen(false)}
        modalTitle="Cài Đặt Tiêu Đề & Chú Thích Mục Sứ Mệnh & Triết Lý"
        sectionLabel="Sứ Mệnh & Triết Lý"
        titleFieldKey="section_gioi_thieu_tieu_de"
        descFieldKey="section_gioi_thieu_mo_ta"
        titleFieldKeyEn="section_gioi_thieu_tieu_de_en"
        descFieldKeyEn="section_gioi_thieu_mo_ta_en"
        initialTitleVi={configForm.section_gioi_thieu_tieu_de || globalConfig.section_gioi_thieu_tieu_de}
        initialDescVi={configForm.section_gioi_thieu_mo_ta || globalConfig.section_gioi_thieu_mo_ta || configForm.gioi_thieu_mo_ta || globalConfig.gioi_thieu_mo_ta}
        initialTitleEn={configForm.section_gioi_thieu_tieu_de_en || globalConfig.section_gioi_thieu_tieu_de_en}
        initialDescEn={configForm.section_gioi_thieu_mo_ta_en || globalConfig.section_gioi_thieu_mo_ta_en || configForm.gioi_thieu_mo_ta_en || globalConfig.gioi_thieu_mo_ta_en}
        defaultTitleVi='<h2>Nâng Tầm Chăm Sóc Y Khoa <br /><span style="color: #2D5A27; font-style: italic;">Bằng Trái Tim &amp; Y Đức</span></h2>'
        defaultDescVi='<p>Được thành lập với sứ mệnh kiến tạo chuẩn mực y tế thú cưng mới tại Việt Nam, PetM&M không chỉ là một bệnh viện đa khoa hiện đại, mà còn là một “ngôi nhà thứ hai” nơi mỗi bé cưng được bảo vệ bằng tình thương và sự tận tụy cao nhất.</p>'
        defaultTitleEn='<h2>Elevating Veterinary Medicine <br /><span style="color: #2D5A27; font-style: italic;">With Integrity &amp; Compassion</span></h2>'
        defaultDescEn='<p>Established with the vision of setting new standards in pet healthcare in Vietnam, PetM&M is not only a state-of-the-art veterinary hospital, but a trusted second home where every companion is cherished with devotion.</p>'
        badgeVi=""
        badgeEn=""
        previewAlign="left"
        showNotification={showNotification}
        onSaveSuccess={(saved) => {
          setConfigForm((prev) => ({
            ...prev,
            section_gioi_thieu_tieu_de: saved.titleVi,
            section_gioi_thieu_mo_ta: saved.descVi,
            section_gioi_thieu_tieu_de_en: saved.titleEn,
            section_gioi_thieu_mo_ta_en: saved.descEn,
          }));
        }}
      />

      {/* MODAL CÀI ĐẶT TIÊU ĐỀ & CHÚ THÍCH MỤC DỊCH VỤ */}
      <SectionTitleModal
        isOpen={isServicesTitleModalOpen}
        onClose={() => setIsServicesTitleModalOpen(false)}
        modalTitle="Cài Đặt Tiêu Đề & Chú Thích Mục Dịch Vụ"
        sectionLabel="Dịch Vụ"
        titleFieldKey="section_dich_vu_tieu_de"
        descFieldKey="section_dich_vu_mo_ta"
        titleFieldKeyEn="section_dich_vu_tieu_de_en"
        descFieldKeyEn="section_dich_vu_mo_ta_en"
        initialTitleVi={configForm.section_dich_vu_tieu_de || globalConfig.section_dich_vu_tieu_de}
        initialDescVi={configForm.section_dich_vu_mo_ta || globalConfig.section_dich_vu_mo_ta}
        initialTitleEn={configForm.section_dich_vu_tieu_de_en || globalConfig.section_dich_vu_tieu_de_en}
        initialDescEn={configForm.section_dich_vu_mo_ta_en || globalConfig.section_dich_vu_mo_ta_en}
        defaultTitleVi='<h2>Chăm Sóc Y Khoa Chuyên Sâu <br /><span style="color: #2D5A27; font-style: italic;">&amp; Nuông Chiều Thú Cưng Đẳng Cấp</span></h2>'
        defaultDescVi=""
        defaultTitleEn='<h2>Advanced Veterinary Medicine <br /><span style="color: #2D5A27; font-style: italic;">&amp; Luxury Pet Hospitality &amp; Spa</span></h2>'
        defaultDescEn=""
        badgeVi=""
        badgeEn=""
        previewAlign="center"
        showNotification={showNotification}
        onSaveSuccess={(saved) => {
          setConfigForm((prev) => ({
            ...prev,
            section_dich_vu_tieu_de: saved.titleVi,
            section_dich_vu_mo_ta: saved.descVi,
            section_dich_vu_tieu_de_en: saved.titleEn,
            section_dich_vu_mo_ta_en: saved.descEn,
          }));
        }}
      />

      {/* MODAL CÀI ĐẶT TIÊU ĐỀ & CHÚ THÍCH MỤC CẨM NANG */}
      <SectionTitleModal
        isOpen={isArticlesTitleModalOpen}
        onClose={() => setIsArticlesTitleModalOpen(false)}
        modalTitle="Cài Đặt Tiêu Đề & Chú Thích Mục Cẩm Nang & Kiến Thức"
        sectionLabel="Cẩm Nang"
        titleFieldKey="section_cam_nang_tieu_de"
        descFieldKey="section_cam_nang_mo_ta"
        titleFieldKeyEn="section_cam_nang_tieu_de_en"
        descFieldKeyEn="section_cam_nang_mo_ta_en"
        initialTitleVi={configForm.section_cam_nang_tieu_de || globalConfig.section_cam_nang_tieu_de}
        initialDescVi={configForm.section_cam_nang_mo_ta || globalConfig.section_cam_nang_mo_ta}
        initialTitleEn={configForm.section_cam_nang_tieu_de_en || globalConfig.section_cam_nang_tieu_de_en}
        initialDescEn={configForm.section_cam_nang_mo_ta_en || globalConfig.section_cam_nang_mo_ta_en}
        defaultTitleVi='<h2>Kiến Thức &amp; <br /><span style="color: #2D5A27; font-style: italic;">Kinh Nghiệm Nuôi Thú Cưng</span></h2>'
        defaultDescVi='<p>Các bài viết được biên soạn trực tiếp bởi hội đồng y khoa PetM&M nhằm hỗ trợ ba mẹ chăm sóc bé khoa học mỗi ngày.</p>'
        defaultTitleEn='<h2>Pet Health, Wellness &amp; <br /><span style="color: #2D5A27; font-style: italic;">Practical Care Insights</span></h2>'
        defaultDescEn='<p>Expert articles curated by PetM&M veterinary specialists to empower pet parents with evidence-based care.</p>'
        badgeVi=""
        badgeEn=""
        previewAlign="left"
        showNotification={showNotification}
        onSaveSuccess={(saved) => {
          setConfigForm((prev) => ({
            ...prev,
            section_cam_nang_tieu_de: saved.titleVi,
            section_cam_nang_mo_ta: saved.descVi,
            section_cam_nang_tieu_de_en: saved.titleEn,
            section_cam_nang_mo_ta_en: saved.descEn,
          }));
        }}
      />

      {/* MODAL CÀI ĐẶT TIÊU ĐỀ & CHÚ THÍCH MỤC HỎI ĐÁP FAQ */}
      <SectionTitleModal
        isOpen={isFaqTitleModalOpen}
        onClose={() => setIsFaqTitleModalOpen(false)}
        modalTitle="Cài Đặt Tiêu Đề & Chú Thích Mục Hỏi Đáp (FAQ)"
        sectionLabel="Hỏi Đáp FAQ"
        titleFieldKey="section_faq_tieu_de"
        descFieldKey="section_faq_mo_ta"
        titleFieldKeyEn="section_faq_tieu_de_en"
        descFieldKeyEn="section_faq_mo_ta_en"
        initialTitleVi={configForm.section_faq_tieu_de || globalConfig.section_faq_tieu_de}
        initialDescVi={configForm.section_faq_mo_ta || globalConfig.section_faq_mo_ta}
        initialTitleEn={configForm.section_faq_tieu_de_en || globalConfig.section_faq_tieu_de_en}
        initialDescEn={configForm.section_faq_mo_ta_en || globalConfig.section_faq_mo_ta_en}
        defaultTitleVi='<h2>Câu Hỏi <span style="color: #2D5A27; font-style: italic;">Thường Gặp</span></h2>'
        defaultDescVi='<p>PetM&M tổng hợp những câu hỏi thường gặp để giúp chủ nuôi chuẩn bị tốt hơn trước khi đặt lịch và sử dụng các dịch vụ. Để được tư vấn và xác nhận lịch phù hợp, vui lòng liên hệ qua Zalo chính thức của PetM&M.</p>'
        defaultTitleEn='<h2>Frequently Asked <span style="color: #2D5A27; font-style: italic;">Questions</span></h2>'
        defaultDescEn='<p>Answers to the most common questions from pet parents regarding veterinary examinations, surgery, and luxury hotel boarding at PetM&M.</p>'
        badgeVi=""
        badgeEn=""
        previewAlign="left"
        showNotification={showNotification}
        onSaveSuccess={(saved) => {
          setConfigForm((prev) => ({
            ...prev,
            section_faq_tieu_de: saved.titleVi,
            section_faq_mo_ta: saved.descVi,
            section_faq_tieu_de_en: saved.titleEn,
          }));
        }}
      />

      {/* ========================================================= */}
      {/* MODAL CÀI ĐẶT TIÊU ĐỀ & CHÚ THÍCH MỤC ĐẶT LỊCH HẸN (TRANG CHỦ) */}
      {/* ========================================================= */}
      <SectionTitleModal
        isOpen={isBookingTitleModalOpen}
        onClose={() => setIsBookingTitleModalOpen(false)}
        modalTitle="Cài Đặt Tiêu Đề & Chú Thích Mục Đặt Lịch Hẹn"
        sectionLabel="Đặt Lịch Hẹn"
        titleFieldKey="section_dat_lich_tieu_de"
        descFieldKey="section_dat_lich_mo_ta"
        titleFieldKeyEn="section_dat_lich_tieu_de_en"
        descFieldKeyEn="section_dat_lich_mo_ta_en"
        initialTitleVi={configForm.section_dat_lich_tieu_de || globalConfig.section_dat_lich_tieu_de}
        initialDescVi={configForm.section_dat_lich_mo_ta || globalConfig.section_dat_lich_mo_ta}
        initialTitleEn={configForm.section_dat_lich_tieu_de_en || globalConfig.section_dat_lich_tieu_de_en}
        initialDescEn={configForm.section_dat_lich_mo_ta_en || globalConfig.section_dat_lich_mo_ta_en}
        defaultTitleVi='<h2>Đặt Lịch Hẹn <span style="color: #2D5A27; font-style: italic;">Trực Tuyến</span></h2>'
        defaultDescVi='<p>Đăng ký trước để được tiếp đón theo khung giờ, không cần chờ đợi bốc số.</p>'
        defaultTitleEn='<h2>Book Your <span style="color: #2D5A27; font-style: italic;">Online Appointment</span></h2>'
        defaultDescEn='<p>Register in advance for priority consultation, Fear-Free space and zero waiting time.</p>'
        badgeVi=""
        badgeEn=""
        previewAlign="center"
        showNotification={showNotification}
        onSaveSuccess={(saved) => {
          setConfigForm((prev) => ({
            ...prev,
            section_dat_lich_tieu_de: saved.titleVi,
            section_dat_lich_mo_ta: saved.descVi,
            section_dat_lich_tieu_de_en: saved.titleEn,
            section_dat_lich_mo_ta_en: saved.descEn,
          }));
        }}
      />

      {/* ========================================================= */}
      {/* MODAL CÀI ĐẶT TIÊU ĐỀ & CHÚ THÍCH MỤC HỖ TRỢ (FAQ) */}
      {/* ========================================================= */}
      <SectionTitleModal
        isOpen={isSupportTitleModalOpen}
        onClose={() => setIsSupportTitleModalOpen(false)}
        modalTitle="Cài Đặt Tiêu Đề & Chú Thích Mục Hỗ Trợ"
        sectionLabel="Hỗ Trợ"
        titleFieldKey="section_ho_tro_tieu_de"
        descFieldKey="section_ho_tro_mo_ta"
        titleFieldKeyEn="section_ho_tro_tieu_de_en"
        descFieldKeyEn="section_ho_tro_mo_ta_en"
        initialTitleVi={configForm.section_ho_tro_tieu_de || globalConfig.section_ho_tro_tieu_de}
        initialDescVi={configForm.section_ho_tro_mo_ta || globalConfig.section_ho_tro_mo_ta}
        initialTitleEn={configForm.section_ho_tro_tieu_de_en || globalConfig.section_ho_tro_tieu_de_en}
        initialDescEn={configForm.section_ho_tro_mo_ta_en || globalConfig.section_ho_tro_mo_ta_en}
        defaultTitleVi='<h3>Bạn Cần PetM&amp;M <span style="color: #2D5A27; font-style: italic;">Hỗ Trợ?</span></h3>'
        defaultDescVi='<p>Chọn cách liên hệ phù hợp với nhu cầu của bạn.</p>'
        defaultTitleEn='<h3>Need PetM&amp;M <span style="color: #2D5A27; font-style: italic;">Support?</span></h3>'
        defaultDescEn='<p>Choose the contact method that suits your needs.</p>'
        badgeVi=""
        badgeEn=""
        previewAlign="left"
        showNotification={showNotification}
        onSaveSuccess={(saved) => {
          setConfigForm((prev) => ({
            ...prev,
            section_ho_tro_tieu_de: saved.titleVi,
            section_ho_tro_mo_ta: saved.descVi,
            section_ho_tro_tieu_de_en: saved.titleEn,
            section_ho_tro_mo_ta_en: saved.descEn,
          }));
        }}
      />

      {/* ========================================================= */}
      {/* MODAL CÀI ĐẶT TIÊU ĐỀ & CHÚ THÍCH MỤC TUYỂN DỤNG NHÂN SỰ */}
      {/* ========================================================= */}
      <SectionTitleModal
        isOpen={isCareersTitleModalOpen}
        onClose={() => setIsCareersTitleModalOpen(false)}
        modalTitle="Cài Đặt Tiêu Đề & Chú Thích Mục Tuyển Dụng"
        sectionLabel="Tuyển Dụng"
        titleFieldKey="section_tuyen_dung_tieu_de"
        descFieldKey="section_tuyen_dung_mo_ta"
        titleFieldKeyEn="section_tuyen_dung_tieu_de_en"
        descFieldKeyEn="section_tuyen_dung_mo_ta_en"
        initialTitleVi={configForm.section_tuyen_dung_tieu_de || globalConfig.section_tuyen_dung_tieu_de}
        initialDescVi={configForm.section_tuyen_dung_mo_ta || globalConfig.section_tuyen_dung_mo_ta}
        initialTitleEn={configForm.section_tuyen_dung_tieu_de_en || globalConfig.section_tuyen_dung_tieu_de_en}
        initialDescEn={configForm.section_tuyen_dung_mo_ta_en || globalConfig.section_tuyen_dung_mo_ta_en}
        defaultTitleVi='<h2>Gia Nhập Đại Gia Đình <br /><span style="color: #2D5A27; font-style: italic;">PetM&amp;M</span></h2>'
        defaultDescVi='<p>Môi trường làm việc y khoa chuẩn mực, đãi ngộ tương xứng và cơ hội thăng tiến rộng mở cùng đội ngũ chuyên gia thú y hàng đầu.</p>'
        defaultTitleEn='<h2>Join The <br /><span style="color: #2D5A27; font-style: italic;">PetM&amp;M Family</span></h2>'
        defaultDescEn='<p>A professional Fear-Free veterinary environment with competitive benefits and endless growth opportunities alongside leading specialists.</p>'
        badgeVi=""
        badgeEn=""
        previewAlign="center"
        showNotification={showNotification}
        onSaveSuccess={(saved) => {
          setConfigForm((prev) => ({
            ...prev,
            section_tuyen_dung_tieu_de: saved.titleVi,
            section_tuyen_dung_mo_ta: saved.descVi,
            section_tuyen_dung_tieu_de_en: saved.titleEn,
            section_tuyen_dung_mo_ta_en: saved.descEn,
          }));
        }}
      />

{editingService && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <AdminResizableModal className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#2D5A27]/10 flex items-center justify-center text-[#2D5A27]">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-wide uppercase">
                  {isCreatingNewService ? 'Thêm Gói Dịch Vụ Mới' : 'Chỉnh Sửa Gói Dịch Vụ'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Thanh Chuyển Ngôn Ngữ & Nút Dịch AI */}
              <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <button type="button" onClick={() => setServiceLangTab('vi')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${serviceLangTab === 'vi' ? 'bg-[#2D5A27] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
                      <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                      <span>Bản Tiếng Việt</span>
                    </button>
                    <button type="button" onClick={() => setServiceLangTab('en')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${serviceLangTab === 'en' ? 'bg-[#2D5A27] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
                      <UKFlag className="w-4 h-3 rounded-[2px]" />
                      <span>Bản English</span>
                    </button>
                  </div>
                </div>
                <button type="button" onClick={handleAutoTranslateService} disabled={isTranslatingService}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
                  title="Dịch tự động sang Tiếng Anh y khoa bằng AI">
                  {isTranslatingService ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isTranslatingService ? 'Đang chuyển đổi...' : 'Chuyển đổi ENG'}</span>
                </button>
              </div>

              {serviceLangTab === 'vi' ? (
                /* TAB TIẾNG VIỆT */
                <div className="space-y-4">
                  {/* Hàng 1: Tên gói dịch vụ & Phụ đề */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tên gói dịch vụ (Tiếng Việt): <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingService.ten_dich_vu || ''}
                        onChange={(e) => setEditingService((prev) => (prev ? { ...prev, ten_dich_vu: e.target.value } : null))}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="VD: Phẫu Thuật Ngoại Khoa & Triệt Sản An Toàn..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phụ đề / Thông điệp ngắn (Tiếng Việt):
                      </label>
                      <input
                        type="text"
                        value={editingService.phu_de || ''}
                        onChange={(e) => setEditingService((prev) => (prev ? { ...prev, phu_de: e.target.value } : null))}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="VD: Phòng phẫu thuật áp lực dương vô trùng 100%..."
                      />
                    </div>
                  </div>

                  {/* Hàng 2: Huy hiệu nổi bật & Chi phí tham khảo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Huy hiệu nổi bật (Tiếng Việt):
                      </label>
                      <input
                        type="text"
                        value={editingService.huy_hieu || ''}
                        onChange={(e) => setEditingService((prev) => (prev ? { ...prev, huy_hieu: e.target.value } : null))}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="VD: Vô Trùng Chuẩn Y Khoa..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Chi phí tham khảo (Tiếng Việt):
                      </label>
                      <input
                        type="text"
                        value={editingService.gia_tham_khao || ''}
                        onChange={(e) => setEditingService((prev) => (prev ? { ...prev, gia_tham_khao: e.target.value } : null))}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="VD: Từ 500.000đ hoặc Liên hệ..."
                      />
                    </div>
                  </div>

                  {/* Hàng 3: Thời lượng ước tính */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Thời lượng ước tính (Tiếng Việt):
                    </label>
                    <input
                      type="text"
                      value={editingService.thoi_luong || ''}
                      onChange={(e) => setEditingService((prev) => (prev ? { ...prev, thoi_luong: e.target.value } : null))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      placeholder="VD: 45 - 60 phút hoặc Theo ca phẫu thuật..."
                    />
                  </div>

                  {/* Hàng 4: Mô tả chi tiết nội dung dịch vụ */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mô tả chi tiết nội dung dịch vụ (Tiếng Việt):
                    </label>
                    <textarea
                      rows={3}
                      value={editingService.mo_ta || ''}
                      onChange={(e) => setEditingService((prev) => (prev ? { ...prev, mo_ta: e.target.value } : null))}
                      className="w-full text-xs p-3.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-none"
                      placeholder="Mô tả tóm tắt giải pháp y khoa và giá trị gói dịch vụ mang lại cho thú cưng..."
                    />
                  </div>

                  {/* Hàng 5: Tiện ích & Quy trình (2 cột song song) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tiện ích &amp; Cam kết chuẩn mực y khoa (Tiếng Việt, mỗi dòng một mục):
                      </label>
                      <textarea
                        rows={4}
                        value={serviceFeaturesInput}
                        onChange={(e) => setServiceFeaturesInput(e.target.value)}
                        className="w-full text-xs p-3.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none font-mono resize-none"
                        placeholder="VD:&#10;Hệ thống máy thở gây mê Isoflurane tự động&#10;Giám sát nhịp tim và SpO2 liên tục&#10;Hậu phẫu phòng chăm sóc tích cực 24/7"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Xuống dòng để phân tách các tiện ích.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Quy trình thực hiện (Tiếng Việt, mỗi dòng một bước):
                      </label>
                      <textarea
                        rows={4}
                        value={serviceWorkflowInput}
                        onChange={(e) => setServiceWorkflowInput(e.target.value)}
                        className="w-full text-xs p-3.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none font-mono resize-none"
                        placeholder="VD:&#10;Bước 1: Khám tiền mê & xét nghiệm đông máu&#10;Bước 2: Tiến hành phẫu thuật vô trùng tuyệt đối&#10;Bước 3: Hồi sức và theo dõi tại phòng ICU"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Xuống dòng để phân tách từng bước 1, 2, 3...</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* TAB TIẾNG ANH (BỐ CỤC Y CHANG 100% BẢN TIẾNG VIỆT) */
                <div className="space-y-4">
                  {/* Hàng 1: Tên gói dịch vụ & Phụ đề */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tên gói dịch vụ (English): <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={(editingService as any).ten_dich_vu_en || ''}
                        onChange={(e) => setEditingService((prev) => (prev ? { ...prev, ten_dich_vu_en: e.target.value } as any : null))}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. Surgical Care & Safe Neutering Procedures..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phụ đề / Thông điệp ngắn (English):
                      </label>
                      <input
                        type="text"
                        value={(editingService as any).phu_de_en || ''}
                        onChange={(e) => setEditingService((prev) => (prev ? { ...prev, phu_de_en: e.target.value } as any : null))}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. 100% Sterile positive pressure operating suites..."
                      />
                    </div>
                  </div>

                  {/* Hàng 2: Huy hiệu nổi bật & Chi phí tham khảo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Huy hiệu nổi bật (English):
                      </label>
                      <input
                        type="text"
                        value={(editingService as any).huy_hieu_en || ''}
                        onChange={(e) => setEditingService((prev) => (prev ? { ...prev, huy_hieu_en: e.target.value } as any : null))}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. Hospital Grade Sterile..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Chi phí tham khảo (English):
                      </label>
                      <input
                        type="text"
                        value={(editingService as any).gia_tham_khao_en || ''}
                        onChange={(e) => setEditingService((prev) => (prev ? { ...prev, gia_tham_khao_en: e.target.value } as any : null))}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. From 500,000 VND or Contact us..."
                      />
                    </div>
                  </div>

                  {/* Hàng 3: Thời lượng ước tính */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Thời lượng ước tính (English):
                    </label>
                    <input
                      type="text"
                      value={(editingService as any).thoi_luong_en || ''}
                      onChange={(e) => setEditingService((prev) => (prev ? { ...prev, thoi_luong_en: e.target.value } as any : null))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      placeholder="e.g. 45 - 60 minutes or Upon surgery case..."
                    />
                  </div>

                  {/* Hàng 4: Mô tả chi tiết nội dung dịch vụ */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mô tả chi tiết nội dung dịch vụ (English):
                    </label>
                    <textarea
                      rows={3}
                      value={(editingService as any).mo_ta_en || ''}
                      onChange={(e) => setEditingService((prev) => (prev ? { ...prev, mo_ta_en: e.target.value } as any : null))}
                      className="w-full text-xs p-3.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-none"
                      placeholder="Describe the medical solution and 5-star value delivered to pets..."
                    />
                  </div>

                  {/* Hàng 5: Tiện ích & Quy trình (2 cột song song) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tiện ích &amp; Cam kết chuẩn mực y khoa (English, mỗi dòng một mục):
                      </label>
                      <textarea
                        rows={4}
                        value={serviceFeaturesEnInput}
                        onChange={(e) => setServiceFeaturesEnInput(e.target.value)}
                        className="w-full text-xs p-3.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none font-mono resize-none"
                        placeholder="e.g.&#10;Automated Isoflurane inhalation anesthesia system&#10;Continuous vital sign and SpO2 monitoring&#10;24/7 specialized postoperative ICU recovery"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Xuống dòng để phân tách các tiện ích (One per line).</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Quy trình thực hiện (English, mỗi dòng một bước):
                      </label>
                      <textarea
                        rows={4}
                        value={serviceWorkflowEnInput}
                        onChange={(e) => setServiceWorkflowEnInput(e.target.value)}
                        className="w-full text-xs p-3.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none font-mono resize-none"
                        placeholder="e.g.&#10;Step 1: Pre-anesthetic evaluation & blood coagulation profile&#10;Step 2: Strict aseptic surgical procedure&#10;Step 3: ICU post-operative recovery and monitoring"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Xuống dòng để phân tách từng bước 1, 2, 3... (One per line).</p>
                    </div>
                  </div>
                </div>
              )}

              {/* KHỐI CÀI ĐẶT DÙNG CHUNG (KHÔNG PHỤ THUỘC NGÔN NGỮ) */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Stethoscope className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span>Cài đặt phân loại &amp; Hình ảnh dịch vụ (Dùng chung cho cả 2 ngôn ngữ)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nhóm phân loại dịch vụ: <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={editingService.nhom_dich_vu || 'medical'}
                      onChange={(e) => setEditingService((prev) => (prev ? { ...prev, nhom_dich_vu: e.target.value as any } : null))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                    >
                      <option value="medical">Nhóm 1: Thú Y &amp; Y Tế Chuyên Sâu</option>
                      <option value="care">Nhóm 2: Chăm Sóc &amp; Lưu Trú 5 Sao</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Thứ tự sắp xếp:
                    </label>
                    <input
                      type="number"
                      value={editingService.thu_tu || 0}
                      onChange={(e) => setEditingService((prev) => (prev ? { ...prev, thu_tu: parseInt(e.target.value) || 0 } : null))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Hình ảnh dịch vụ (Dùng chung cho cả list và khung chi tiết) - BỘ CẮT ẢNH INTERACTIVE */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* CỘT TRÁI: CẮT ẢNH VỚI CÁC Ô VUÔNG (7 CỘT) */}
                    <div className="lg:col-span-7">
                      <AdminInteractiveCropper
                        value={editingService.hinh_anh || ''}
                        originalUrl={editingService.anh_goc || editingService.hinh_anh || ''}
                        onChange={(url) => setEditingService((prev) => (prev ? { ...prev, hinh_anh: url } : null))}
                        onOriginalChange={(url) => setEditingService((prev) => (prev ? { ...prev, anh_goc: url } : null))}
                        onPreviewChange={(url) => setServicePreview(url)}
                        folder="services"
                        aspectRatio={16 / 10}
                        onNotification={showNotification}
                        label="Hình Ảnh Gói Dịch Vụ (Tỉ lệ 16:10)"
                      />
                    </div>

                    {/* CỘT PHẢI: XEM TRƯỚC DANH SÁCH & BANNER CHI TIẾT (5 CỘT) */}
                    <div className="lg:col-span-5 space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-[#2D5A27]" />
                          <span>Mô phỏng hiển thị trên Website</span>
                        </h4>
                        {(servicePreview || editingService.hinh_anh) && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Ảnh áp dụng</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Cột bên trái thao tác trên ảnh gốc. Kéo ô vuông để chọn góc hiển thị chuẩn xác nhất cho ảnh dịch vụ ngoài website.
                      </p>

                      {(servicePreview || editingService.hinh_anh) && (
                        <div className="space-y-3 pt-1">
                          <div>
                            <span className="text-[10px] font-semibold text-slate-600 block mb-1">1. Hiển thị ở danh sách dịch vụ:</span>
                            <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-300 bg-slate-100 shadow-2xs">
                              <img
                                src={servicePreview || editingService.hinh_anh || ''}
                                alt="Thumbnail preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-semibold text-slate-600 block mb-1">2. Hiển thị ở banner khung chi tiết lớn:</span>
                            <div className="w-full h-24 rounded-xl overflow-hidden border border-slate-300 bg-slate-100 shadow-2xs relative">
                              <img
                                src={servicePreview || editingService.hinh_anh || ''}
                                alt="Hero preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Checkboxes trạng thái */}
                <div className="flex flex-wrap items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id="service_noi_bat"
                      checked={editingService.noi_bat || false}
                      onChange={(e) => setEditingService((prev) => (prev ? { ...prev, noi_bat: e.target.checked } : null))}
                      className="w-4 h-4 text-[#2D5A27] rounded border-slate-300 focus:ring-[#2D5A27]"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Đánh dấu là gói nổi bật 5★
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id="service_kich_hoat"
                      checked={editingService.kich_hoat !== undefined && editingService.kich_hoat !== null ? Boolean(editingService.kich_hoat) : true}
                      onChange={(e) => setEditingService((prev) => (prev ? { ...prev, kich_hoat: e.target.checked } : null))}
                      className="w-4 h-4 text-[#2D5A27] rounded border-slate-300 focus:ring-[#2D5A27]"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Kích hoạt hiển thị trên web
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                Hủy Bỏ
              </button>

              <button
                type="button"
                disabled={isServiceSaving}
                onClick={handleSaveService}
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                {isServiceSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isServiceSaving ? 'Đang lưu vào Supabase...' : 'Lưu Dịch Vụ'}</span>
              </button>
            </div>
          </AdminResizableModal>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. MODAL POPUP FORM: THÊM / CHỈNH SỬA CÂU HỎI THƯỜNG GẶP  */}
      {/* ========================================================= */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <AdminResizableModal className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#2D5A27]/10 flex items-center justify-center text-[#2D5A27]">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    {isCreatingNewFaq ? 'Thêm Câu Hỏi Thường Gặp Mới' : 'Chỉnh Sửa Câu Hỏi Thường Gặp'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Nội dung sẽ hiển thị ngay lập tức trong mục FAQ ngoài trang chủ
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingFaq(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Thanh Chuyển Ngôn Ngữ & Nút Dịch AI */}
              <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setFaqModalTab('vi')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        faqModalTab === 'vi'
                          ? 'bg-[#2D5A27] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                      <span>Bản Tiếng Việt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFaqModalTab('en')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        faqModalTab === 'en'
                          ? 'bg-[#2D5A27] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UKFlag className="w-4 h-3 rounded-[2px]" />
                      <span>Bản English</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAutoTranslateFaq}
                  disabled={isTranslatingFaq}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs hover:shadow transition disabled:opacity-50 cursor-pointer"
                  title="Dịch tự động toàn bộ nội dung câu hỏi sang Tiếng Anh y khoa bằng AI"
                >
                  {isTranslatingFaq ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{isTranslatingFaq ? 'Đang chuyển đổi...' : 'Chuyển đổi ENG'}</span>
                </button>
              </div>

              {faqModalTab === 'vi' ? (
                <>
                  {/* Câu hỏi VI */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Câu hỏi (Tiếng Việt): <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingFaq.cau_hoi || ''}
                      onChange={(e) => setEditingFaq((prev) => ({ ...prev, cau_hoi: e.target.value }))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  {/* Câu trả lời VI */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Câu trả lời giải đáp (Tiếng Việt): <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={editingFaq.cau_tra_loi || ''}
                      onChange={(e) => setEditingFaq((prev) => ({ ...prev, cau_tra_loi: e.target.value }))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* Danh mục VI */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Danh mục phân loại (Tiếng Việt):
                    </label>
                    <input
                      type="text"
                      list="faq_categories_list_vi"
                      value={editingFaq.chuyen_muc || ''}
                      onChange={(e) => setEditingFaq((prev) => ({ ...prev, chuyen_muc: e.target.value }))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                    <datalist id="faq_categories_list_vi">
                      <option value="Cấp cứu & Hotline" />
                      <option value="Chuẩn bị thăm khám" />
                      <option value="Lưu trú & Resort" />
                      <option value="Vận chuyển Pet Taxi" />
                      <option value="Tư vấn & Lựa chọn dịch vụ" />
                      <option value="Kiểm soát nhiễm khuẩn" />
                      <option value="Chung" />
                    </datalist>
                  </div>
                </>
              ) : (
                <>
                  {/* Câu hỏi EN */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Câu hỏi (Tiếng Anh - English):
                    </label>
                    <input
                      type="text"
                      value={editingFaq.cau_hoi_en || ''}
                      onChange={(e) => setEditingFaq((prev) => ({ ...prev, cau_hoi_en: e.target.value }))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  {/* Câu trả lời EN */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Câu trả lời giải đáp (Tiếng Anh - English):
                    </label>
                    <textarea
                      rows={5}
                      value={editingFaq.cau_tra_loi_en || ''}
                      onChange={(e) => setEditingFaq((prev) => ({ ...prev, cau_tra_loi_en: e.target.value }))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* Danh mục EN */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Danh mục phân loại (Tiếng Anh - English):
                    </label>
                    <input
                      type="text"
                      list="faq_categories_list_en"
                      value={editingFaq.chuyen_muc_en || ''}
                      onChange={(e) => setEditingFaq((prev) => ({ ...prev, chuyen_muc_en: e.target.value }))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                    <datalist id="faq_categories_list_en">
                      <option value="Emergency & Hotline" />
                      <option value="Visit Preparation" />
                      <option value="Boarding & Resort" />
                      <option value="Pet Taxi & Relocation" />
                      <option value="Consultation & Guidance" />
                      <option value="Infection Control" />
                      <option value="General" />
                    </datalist>
                  </div>
                </>
              )}

              {/* Cài đặt chung: Thứ tự & Kích hoạt */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thứ tự sắp xếp:
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingFaq.thu_tu || 1}
                    onChange={(e) => setEditingFaq((prev) => ({ ...prev, thu_tu: parseInt(e.target.value, 10) || 1 }))}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="faq_kich_hoat"
                    checked={editingFaq.kich_hoat !== false}
                    onChange={(e) => setEditingFaq((prev) => ({ ...prev, kich_hoat: e.target.checked }))}
                    className="w-4 h-4 text-[#2D5A27] rounded border-slate-300 focus:ring-[#2D5A27]"
                  />
                  <label htmlFor="faq_kich_hoat" className="text-xs font-semibold text-slate-800 cursor-pointer">
                    Kích hoạt hiển thị ngoài website
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setEditingFaq(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                Hủy Bỏ
              </button>

              <button
                type="button"
                disabled={isFaqSaving}
                onClick={handleSaveFaq}
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                {isFaqSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isFaqSaving ? 'Đang lưu vào Supabase...' : 'Lưu Câu Hỏi'}</span>
              </button>
            </div>
          </AdminResizableModal>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4.5. CỬA SỔ (MODAL) THIẾT KẾ CỘT PHẢI & ẢNH BÌA FORM ĐẶT LỊCH */}
      {/* ========================================================= */}
      {isBookingDesignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <AdminResizableModal className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-50/80 via-white to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2D5A27] to-emerald-800 text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5 text-[#FFB800]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <span>Cửa Sổ Thiết Kế Cột Phải &amp; Ảnh Bìa Form Đặt Lịch</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#2D5A27] font-bold border border-emerald-300">
                      Live Preview
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-light mt-0.5">
                    Thiết kế trực quan ảnh bìa, tiêu đề 5 sao, mô tả Fear-Free và các cam kết tiếp nhận khách hàng (song ngữ VI/EN).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBookingDesignModalOpen(false)}
                className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 2 Cột (Trái: Công cụ cài đặt — Phải: Live Preview trực quan) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/40">
              {/* CỘT TRÁI: FORM CÀI ĐẶT THIẾT KẾ */}
              <div className="lg:col-span-7 space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                {/* Thanh chuyển đổi ngôn ngữ & Nút Chuyển đổi ENG */}
                <div className="p-2.5 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => {
                          setBookingDesignLangTab('vi');
                          setBookingDesignPreviewLang('vi');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          bookingDesignLangTab === 'vi'
                            ? 'bg-[#2D5A27] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                        <span>Bản Tiếng Việt</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBookingDesignLangTab('en');
                          setBookingDesignPreviewLang('en');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          bookingDesignLangTab === 'en'
                            ? 'bg-[#2D5A27] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <UKFlag className="w-4 h-3 rounded-[2px]" />
                        <span>Bản English</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoTranslateBookingDesign}
                    disabled={isTranslatingBookingDesign}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
                    title="Dịch tự động sang Tiếng Anh y khoa bằng AI"
                  >
                    {isTranslatingBookingDesign ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{isTranslatingBookingDesign ? 'Đang chuyển đổi...' : 'Chuyển đổi ENG'}</span>
                  </button>
                </div>

                {/* Ảnh bìa form đặt lịch (dùng chung cho cả 2 ngôn ngữ) */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#2D5A27]" />
                    <span>Ảnh Bìa Form Đặt Lịch</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <AdminImageInput
                    value={bookingDesignForm.coverImage}
                    onChange={(url) =>
                      setBookingDesignForm((prev) => ({ ...prev, coverImage: url }))
                    }
                    folder="banners"
                    label="Đường dẫn ảnh hoặc tải ảnh bìa mới (hỗ trợ JPG, PNG, WEBP, Ctrl+V)"
                    uploadButtonLabel="Tải Ảnh Lên"
                    pasteButtonLabel="Dán Ảnh"
                    onNotification={showNotification}
                  />
                </div>

                {/* Nội dung theo tab ngôn ngữ đang chọn */}
                {bookingDesignLangTab === 'vi' ? (
                  /* TAB TIẾNG VIỆT */
                  <div className="space-y-3.5 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-[#FFB800]" />
                        <span>Tiêu Đề Lớn (Tiếng Việt)</span>
                      </label>
                      <input
                        type="text"
                        value={bookingDesignForm.titleVi}
                        onChange={(e) =>
                          setBookingDesignForm((prev) => ({ ...prev, titleVi: e.target.value }))
                        }
                        placeholder="VD: Chăm Sóc Y Khoa Tiêu Chuẩn 5 Sao"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27] outline-none text-slate-900 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>Mô Tả Quy Trình Fear-Free &amp; Y Khoa (Tiếng Việt)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={bookingDesignForm.descVi}
                        onChange={(e) =>
                          setBookingDesignForm((prev) => ({ ...prev, descVi: e.target.value }))
                        }
                        placeholder="VD: Đội ngũ bác sĩ thú y chính quy, quy trình Fear-Free giảm căng thẳng tuyệt đối cho các bé cưng."
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27] outline-none text-slate-900 bg-slate-50/50 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Cam Kết 1 - Khám Đúng Giờ (Tiếng Việt)</span>
                      </label>
                      <input
                        type="text"
                        value={bookingDesignForm.commit1Vi}
                        onChange={(e) =>
                          setBookingDesignForm((prev) => ({ ...prev, commit1Vi: e.target.value }))
                        }
                        placeholder="VD: Khám đúng giờ theo lịch hẹn, không bốc số"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27] outline-none text-slate-900 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-emerald-600" />
                        <span>Cam Kết 2 - Tiếp Nhận Qua Gmail (Tiếng Việt)</span>
                      </label>
                      <input
                        type="text"
                        value={bookingDesignForm.commit2Vi}
                        onChange={(e) =>
                          setBookingDesignForm((prev) => ({ ...prev, commit2Vi: e.target.value }))
                        }
                        placeholder="VD: Gửi phiếu tiếp nhận tự động qua Gmail"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27] outline-none text-slate-900 bg-slate-50/50"
                      />
                    </div>
                  </div>
                ) : (
                  /* TAB TIẾNG ANH */
                  <div className="space-y-3.5 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-[#FFB800]" />
                        <span>Main Title (English)</span>
                      </label>
                      <input
                        type="text"
                        value={bookingDesignForm.titleEn}
                        onChange={(e) =>
                          setBookingDesignForm((prev) => ({ ...prev, titleEn: e.target.value }))
                        }
                        placeholder="e.g. Fear-Free & High-Standard Medical Care"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27] outline-none text-slate-900 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>Fear-Free & Medical Description (English)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={bookingDesignForm.descEn}
                        onChange={(e) =>
                          setBookingDesignForm((prev) => ({ ...prev, descEn: e.target.value }))
                        }
                        placeholder="e.g. Experienced veterinarians dedicated to safeguarding your pet's health..."
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27] outline-none text-slate-900 bg-slate-50/50 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Commitment 1 - Priority Booking (English)</span>
                      </label>
                      <input
                        type="text"
                        value={bookingDesignForm.commit1En}
                        onChange={(e) =>
                          setBookingDesignForm((prev) => ({ ...prev, commit1En: e.target.value }))
                        }
                        placeholder="e.g. Zero waiting time with priority booking"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27] outline-none text-slate-900 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-emerald-600" />
                        <span>Commitment 2 - Confirmation via Gmail (English)</span>
                      </label>
                      <input
                        type="text"
                        value={bookingDesignForm.commit2En}
                        onChange={(e) =>
                          setBookingDesignForm((prev) => ({ ...prev, commit2En: e.target.value }))
                        }
                        placeholder="e.g. Automated email confirmation sent to Gmail"
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27] outline-none text-slate-900 bg-slate-50/50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CỘT PHẢI: LIVE PREVIEW THỜI GIAN THỰC */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#2D5A27]" />
                    <span>Xem Trước Trực Quan (Live Preview)</span>
                  </span>
                  <div className="flex items-center gap-1 bg-slate-200 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setBookingDesignPreviewLang('vi')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                        bookingDesignPreviewLang === 'vi'
                          ? 'bg-white text-[#2D5A27] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <VietnamFlag className="w-3.5 h-2.5 rounded-xs" />
                      <span>VI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingDesignPreviewLang('en')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1 ${
                        bookingDesignPreviewLang === 'en'
                          ? 'bg-white text-[#2D5A27] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UKFlag className="w-3.5 h-2.5 rounded-xs" />
                      <span>EN</span>
                    </button>
                  </div>
                </div>

                {/* Khung mô phỏng Cột Phải thực tế */}
                <div className="relative flex-1 min-h-[460px] rounded-3xl bg-slate-900 overflow-hidden flex flex-col justify-between p-6 sm:p-7 text-white shadow-2xl border border-slate-700">
                  {/* Ảnh nền */}
                  <img
                    src={bookingDesignForm.coverImage || bookingCoverImage}
                    alt="Cover Preview"
                    className="absolute inset-0 w-full h-full object-cover object-center scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-slate-900/30" />

                  {/* Huy hiệu đỉnh */}
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-[#FFB800] animate-pulse" />
                      <span>PetM&amp;M Medical Center</span>
                    </div>
                  </div>

                  {/* Thông tin hỗ trợ và cam kết dưới đáy ảnh bìa */}
                  <div className="relative z-10 space-y-3.5">
                    <div>
                      <h4 className="font-editorial text-xl sm:text-2xl font-normal text-white leading-tight">
                        {bookingDesignPreviewLang === 'en'
                          ? (bookingDesignForm.titleEn || bookingDesignForm.titleVi)
                          : (bookingDesignForm.titleVi || 'Chăm Sóc Y Khoa Tiêu Chuẩn 5 Sao')}
                      </h4>
                      <p className="text-xs text-slate-300 font-light mt-1.5 leading-relaxed">
                        {bookingDesignPreviewLang === 'en'
                          ? (bookingDesignForm.descEn || bookingDesignForm.descVi)
                          : (bookingDesignForm.descVi || 'Đội ngũ bác sĩ thú y chính quy, quy trình Fear-Free giảm căng thẳng tuyệt đối cho các bé cưng.')}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/15 text-xs text-slate-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>
                          {bookingDesignPreviewLang === 'en'
                            ? (bookingDesignForm.commit1En || bookingDesignForm.commit1Vi)
                            : (bookingDesignForm.commit1Vi || 'Khám đúng giờ theo lịch hẹn, không bốc số')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>
                          {bookingDesignPreviewLang === 'en'
                            ? (bookingDesignForm.commit2En || bookingDesignForm.commit2Vi)
                            : (bookingDesignForm.commit2Vi || 'Gửi phiếu tiếp nhận tự động qua Gmail')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                          <PhoneCall className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-300 font-light uppercase tracking-wider">
                            Hotline Tư Vấn 24/7
                          </div>
                          <div className="text-xs font-bold text-white font-mono">0364 605 544</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400">Gọi Ngay →</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/70">
              <button
                type="button"
                onClick={() => {
                  setBookingDesignForm({
                    coverImage: '/about_consultation.jpg',
                    titleVi: 'Chăm Sóc Y Khoa Tiêu Chuẩn 5 Sao',
                    titleEn: 'Fear-Free & High-Standard Medical Care',
                    descVi: 'Đội ngũ bác sĩ thú y chính quy, quy trình Fear-Free giảm căng thẳng tuyệt đối cho các bé cưng.',
                    descEn: 'Experienced veterinarians dedicated to safeguarding your pet’s health with compassion and cutting-edge equipment.',
                    commit1Vi: 'Khám đúng giờ theo lịch hẹn, không bốc số',
                    commit1En: 'Zero waiting time with priority booking',
                    commit2Vi: 'Gửi phiếu tiếp nhận tự động qua Gmail',
                    commit2En: 'Automated email confirmation sent to Gmail',
                  });
                  showNotification('success', 'Đã khôi phục các câu chữ chuẩn theo tiêu chuẩn y khoa 5 sao!');
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                Khôi Phục Mẫu Chuẩn 5 Sao
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsBookingDesignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={isSavingBookingCover}
                  onClick={handleSaveBookingDesign}
                  className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2D5A27] via-emerald-700 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingBookingCover ? 'Đang lưu vào Database...' : 'Lưu & Áp Dụng Ngay'}</span>
                </button>
              </div>
            </div>
          </AdminResizableModal>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL CHI TIẾT & CHỐT LỊCH HẸN CHO NHÂN VIÊN          */}
      {/* ========================================================= */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <AdminResizableModal className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl lg:max-w-[940px] max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white shrink-0">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-base text-slate-900">
                    Chi Tiết &amp; Chốt Lịch Hẹn
                  </h3>
                  <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    #{selectedAppointment.ma_lich_hen}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Đặt lúc: {selectedAppointment.ngay_tao ? new Date(selectedAppointment.ngay_tao).toLocaleString('vi-VN') : 'Không rõ'}
                </p>
              </div>

              {/* Thanh chọn ngôn ngữ (có cờ 🇻🇳 🇬🇧) & Nút Chuyển đổi ENG */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="flex items-center gap-1 p-1 rounded-xl border border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => handleChangeModalLanguage('vi')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      editAppForm.lang === 'vi'
                        ? 'bg-[#2D5A27] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Chuyển sang Bản Tiếng Việt"
                  >
                    <span>🇻🇳</span>
                    <span>Bản Tiếng Việt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeModalLanguage('en')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      editAppForm.lang === 'en'
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Switch to English"
                  >
                    <span>🇬🇧</span>
                    <span>Bản English</span>
                  </button>
                </div>

                {/* Nút Chuyển đổi ENG tự động dịch Ghi chú */}
                <button
                  type="button"
                  disabled={isTranslatingToEng}
                  onClick={handleTranslateAllToEng}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold shadow-xs hover:shadow transition cursor-pointer disabled:opacity-50"
                  title="Tự động dịch Ghi chú / Triệu chứng và đổi toàn bộ dữ liệu sang Tiếng Anh"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isTranslatingToEng ? 'Đang dịch...' : 'Chuyển đổi ENG'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* THANH TIẾN TRÌNH CỐ ĐỊNH (STICKY/FIXED DƯỚI HEADER KHÔNG BỊ CUỘN MẤT) */}
            <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-200 shrink-0">
              {editAppForm.status === 'da_huy' ? (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-600 text-white">
                        Lịch hẹn đã hủy
                      </span>
                      <span className="text-xs text-rose-800 font-medium">
                        Không thể gửi tin Zalo hoặc Email
                      </span>
                    </div>
                    {(() => {
                      const matchCancel = editAppForm.note.match(/\[Đã hủy:\s*([^\]]+)\]/i);
                      const existingCancelReason = matchCancel ? matchCancel[1].trim() : '';
                      return existingCancelReason ? (
                        <p className="text-xs text-rose-700 mt-1">
                          <span className="font-semibold">Lý do hủy:</span> {existingCancelReason}
                        </p>
                      ) : null;
                    })()}
                  </div>
                  <button
                    type="button"
                    onClick={handleRestoreAppointment}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-rose-300 hover:bg-rose-100 text-rose-900 text-xs font-bold transition cursor-pointer shadow-2xs whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Khôi phục về Chờ xác nhận</span>
                  </button>
                </div>
              ) : (
                <div className="py-0.5">
                  {/* Thanh Timeline 3 bước */}
                  <div className="relative flex items-center justify-between px-6 sm:px-12">
                    {/* Line nền */}
                    <div className="absolute left-12 right-12 top-4 h-0.5 bg-slate-200 z-0" />
                    {/* Line tiến độ thực tế */}
                    <div
                      className={`absolute left-12 top-4 h-0.5 bg-[#2D5A27] transition-all duration-300 z-0 ${
                        editAppForm.status === 'da_kham'
                          ? 'right-12'
                          : editAppForm.status === 'da_xac_nhan'
                          ? 'w-1/2'
                          : 'w-0'
                      }`}
                    />

                    {/* Bước 1: Chờ xác nhận */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          editAppForm.status === 'cho_xac_nhan'
                            ? 'bg-[#2D5A27] text-white ring-4 ring-emerald-100'
                            : 'bg-[#2D5A27] text-white'
                        }`}
                      >
                        {editAppForm.status !== 'cho_xac_nhan' ? <Check className="w-4 h-4" /> : '1'}
                      </div>
                      <span className="text-xs font-bold text-slate-800 mt-1.5">Chờ xác nhận</span>
                      <span className="text-[10px] text-slate-400">Khách vừa đăng ký</span>
                    </div>

                    {/* Bước 2: Đã xác nhận */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          editAppForm.status === 'da_xac_nhan'
                            ? 'bg-[#2D5A27] text-white ring-4 ring-emerald-100'
                            : editAppForm.status === 'da_kham'
                            ? 'bg-[#2D5A27] text-white'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}
                      >
                        {editAppForm.status === 'da_kham' ? <Check className="w-4 h-4" /> : '2'}
                      </div>
                      <span
                        className={`text-xs font-bold mt-1.5 ${
                          editAppForm.status === 'da_xac_nhan' || editAppForm.status === 'da_kham'
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        Đã xác nhận
                      </span>
                      <span className="text-[10px] text-slate-400">Đã chốt thông tin</span>
                    </div>

                    {/* Bước 3: Đã hoàn thành */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          editAppForm.status === 'da_kham'
                            ? 'bg-emerald-700 text-white ring-4 ring-emerald-100'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                        }`}
                      >
                        {editAppForm.status === 'da_kham' ? <Check className="w-4 h-4" /> : '3'}
                      </div>
                      <span
                        className={`text-xs font-bold mt-1.5 ${
                          editAppForm.status === 'da_kham' ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        Đã hoàn thành
                      </span>
                      <span className="text-[10px] text-slate-400">Đã gửi Zalo / Email</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Body: Cuộn nội dung (Không chứa tiêu đề nhóm rườm rà) */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* HÀNG 1: THÔNG TIN KHÁCH HÀNG & LIÊN HỆ */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Họ và tên khách: *</label>
                  <input
                    type="text"
                    value={editAppForm.ownerName}
                    onChange={(e) => setEditAppForm((prev) => ({ ...prev, ownerName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-[#2D5A27] text-xs font-semibold text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Số điện thoại: *</label>
                  {/* Ô SĐT có nút Gọi khách nằm gọn bên trong */}
                  <div className="relative">
                    <input
                      type="tel"
                      value={editAppForm.phone}
                      onChange={(e) => setEditAppForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-3 pr-28 py-2 rounded-lg bg-white border border-slate-300 focus:border-[#2D5A27] text-xs font-mono font-bold text-slate-900 outline-none"
                    />
                    {editAppForm.phone && (
                      <a
                        href={`tel:${editAppForm.phone}`}
                        className="absolute right-1 top-1 bottom-1 px-2.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold flex items-center gap-1 transition shadow-2xs"
                        title={`Gọi ngay ${editAppForm.phone}`}
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Gọi khách</span>
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Gmail / Email:</label>
                  <input
                    type="email"
                    value={editAppForm.email}
                    onChange={(e) => setEditAppForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="khachhang@gmail.com"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-[#2D5A27] text-xs text-blue-700 font-medium outline-none"
                  />
                </div>
              </div>

              {/* HÀNG 2: THÔNG TIN THÚ CƯNG */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Tên thú cưng:</label>
                  <input
                    type="text"
                    value={editAppForm.petName}
                    onChange={(e) => setEditAppForm((prev) => ({ ...prev, petName: e.target.value }))}
                    placeholder="Nhập tên thú cưng (nếu có)..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-[#2D5A27] text-xs font-medium text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Loài thú cưng:</label>
                  <select
                    value={editAppForm.petType}
                    onChange={(e) => setEditAppForm((prev) => ({ ...prev, petType: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-[#2D5A27] text-xs font-medium text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="">-- Chọn loài thú cưng --</option>
                    <option value="dog">Chó (Dog)</option>
                    <option value="cat">Mèo (Cat)</option>
                    <option value="other">Loài khác (Other)</option>
                  </select>
                </div>
              </div>

              {/* HÀNG 3: CƠ SỞ TIẾP ĐÓN & DỊCH VỤ */}
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-slate-600 font-medium mb-1 text-xs">
                    Cơ sở tiếp đón:
                  </label>
                  <select
                    value={editAppForm.branchId}
                    onChange={(e) => {
                      const b = branches.find((item) => item.id === e.target.value);
                      let targetName = editAppForm.branchName;
                      if (b) {
                        if (editAppForm.lang === 'en') {
                          const title = b.ten_chi_nhanh_en || b.ten_ngan_en || b.ten_chi_nhanh;
                          const addr = b.dia_chi_en || b.dia_chi;
                          targetName = addr ? `${title} — ${addr}` : title;
                        } else {
                          const title = b.ten_ngan || b.ten_chi_nhanh;
                          const addr = b.dia_chi;
                          targetName = addr ? `${title} — ${addr}` : title;
                        }
                      }
                      setEditAppForm((prev) => ({
                        ...prev,
                        branchId: e.target.value,
                        branchName: targetName,
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-[#2D5A27] text-xs font-medium text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="">{editAppForm.lang === 'en' ? '-- Select Clinic Branch --' : '-- Chọn cơ sở tiếp đón --'}</option>
                    {branches.map((b) => {
                      const bTitle = editAppForm.lang === 'en' ? (b.ten_chi_nhanh_en || b.ten_chi_nhanh) : b.ten_chi_nhanh;
                      const bAddr = editAppForm.lang === 'en' ? (b.dia_chi_en || b.dia_chi) : b.dia_chi;
                      return (
                        <option key={b.id} value={b.id}>
                          {bTitle} - {bAddr}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-600 font-medium text-xs">
                      Dịch vụ đã chọn ({editAppForm.services.length}):
                    </label>
                    {editAppForm.services.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setEditAppForm((prev) => ({ ...prev, services: [] }))}
                        className="text-[11px] text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      >
                        Xóa tất cả
                      </button>
                    )}
                  </div>

                  {/* Danh sách tags dịch vụ đã chọn */}
                  <div className="flex flex-wrap gap-1.5 mb-2 min-h-[36px] p-2 rounded-lg bg-slate-50 border border-slate-200">
                    {editAppForm.services.length === 0 ? (
                      <span className="text-slate-400 text-xs italic py-0.5">Chưa chọn dịch vụ nào</span>
                    ) : (
                      editAppForm.services.map((srv) => (
                        <span
                          key={srv}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white text-[#2D5A27] border border-emerald-200 text-xs font-semibold shadow-2xs"
                        >
                          <span>{srv}</span>
                          <button
                            type="button"
                            onClick={() => toggleServiceInEditForm(srv)}
                            className="hover:text-rose-600 font-normal ml-0.5 cursor-pointer text-slate-400 hover:font-bold"
                            title="Bỏ chọn"
                          >
                            ✕
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Droplist (của Web) chọn / bỏ chọn nhanh dịch vụ */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 hover:border-slate-400 focus:border-[#2D5A27] text-xs font-medium text-slate-700 flex items-center justify-between transition cursor-pointer text-left"
                    >
                      <span className="text-slate-500">
                        {editAppForm.lang === 'en'
                          ? '-- Click to select / add services --'
                          : '-- Bấm để chọn / bỏ chọn nhanh dịch vụ --'}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isServiceDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isServiceDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsServiceDropdownOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-xs animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto">
                          <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {editAppForm.lang === 'en' ? 'Available Services' : 'Danh sách dịch vụ hệ thống'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {editAppForm.services.length} đã chọn
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            {services.map((s) => {
                              const title =
                                editAppForm.lang === 'en' && s.ten_dich_vu_en ? s.ten_dich_vu_en : s.ten_dich_vu;
                              const isSelected =
                                editAppForm.services.includes(title) || editAppForm.services.includes(s.ten_dich_vu);
                              return (
                                <button
                                  type="button"
                                  key={s.id}
                                  onClick={() => toggleServiceInEditForm(title)}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                                    isSelected
                                      ? 'bg-emerald-50 text-[#2D5A27] font-bold'
                                      : 'hover:bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <span>{title}</span>
                                  {isSelected && <Check className="w-4 h-4 text-[#2D5A27]" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thêm dịch vụ tùy chỉnh */}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={editAppForm.customService}
                      onChange={(e) => setEditAppForm((prev) => ({ ...prev, customService: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomServiceInEditForm();
                        }
                      }}
                      placeholder="Hoặc nhập tên dịch vụ khác rồi bấm Thêm..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs outline-none focus:border-[#2D5A27]"
                    />
                    <button
                      type="button"
                      onClick={addCustomServiceInEditForm}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer transition"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              </div>

              {/* HÀNG 4: THỜI GIAN KHÁM & GHI CHÚ (CÓ THỂ KÉO DÃN RỘNG XUỐNG DƯỚI) */}
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Ngày hẹn: *</label>
                    <input
                      type="date"
                      value={editAppForm.date}
                      onChange={(e) => setEditAppForm((prev) => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-[#2D5A27] text-xs font-semibold text-slate-900 outline-none"
                    />
                  </div>

                  {/* Khung giờ hẹn: Cô đọng đúng 1 ô duy nhất & Droplist của Web */}
                  <div className="relative">
                    <label className="block text-slate-600 font-medium mb-1">Khung giờ hẹn: *</label>
                    <button
                      type="button"
                      onClick={() => setIsTimeSlotDropdownOpen(!isTimeSlotDropdownOpen)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 hover:border-slate-400 focus:border-[#2D5A27] text-xs font-bold text-slate-900 flex items-center justify-between transition cursor-pointer text-left"
                    >
                      <span className={editAppForm.timeSlot ? 'text-[#2D5A27]' : 'text-slate-400 font-normal'}>
                        {editAppForm.timeSlot || (editAppForm.lang === 'en' ? 'Select Time Slot' : 'Chọn khung giờ hẹn')}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isTimeSlotDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Droplist Web Popup */}
                    {isTimeSlotDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsTimeSlotDropdownOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-3 text-xs animate-in fade-in zoom-in-95 duration-150">
                          <div className="mb-2 pb-2 border-b border-slate-100 flex items-center justify-between">
                            <span className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
                              {editAppForm.lang === 'en' ? 'Select Time Slot' : 'Chọn Khung Giờ'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditAppForm((prev) => ({
                                  ...prev,
                                  timeSlot: editAppForm.lang === 'en' ? 'Flexible' : 'Linh hoạt',
                                }));
                                setIsTimeSlotDropdownOpen(false);
                              }}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold transition cursor-pointer ${
                                editAppForm.timeSlot === 'Linh hoạt' || editAppForm.timeSlot === 'Flexible'
                                  ? 'bg-emerald-100 text-[#2D5A27]'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {editAppForm.lang === 'en' ? 'Flexible Time' : 'Giờ linh hoạt'}
                            </button>
                          </div>

                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            <div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                {editAppForm.lang === 'en' ? 'Morning (08:00 - 11:30)' : 'Buổi Sáng (08:00 - 11:30)'}
                              </div>
                              <div className="grid grid-cols-3 gap-1">
                                {ADMIN_TIME_SLOTS.slice(0, 7).map((slot) => (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => {
                                      setEditAppForm((prev) => ({ ...prev, timeSlot: slot }));
                                      setIsTimeSlotDropdownOpen(false);
                                    }}
                                    className={`py-1.5 px-1.5 rounded text-[11px] font-medium text-center transition cursor-pointer ${
                                      editAppForm.timeSlot === slot
                                        ? 'bg-[#2D5A27] text-white font-bold'
                                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {slot}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                {editAppForm.lang === 'en' ? 'Afternoon (13:30 - 17:00)' : 'Buổi Chiều (13:30 - 17:00)'}
                              </div>
                              <div className="grid grid-cols-3 gap-1">
                                {ADMIN_TIME_SLOTS.slice(7, 14).map((slot) => (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => {
                                      setEditAppForm((prev) => ({ ...prev, timeSlot: slot }));
                                      setIsTimeSlotDropdownOpen(false);
                                    }}
                                    className={`py-1.5 px-1.5 rounded text-[11px] font-medium text-center transition cursor-pointer ${
                                      editAppForm.timeSlot === slot
                                        ? 'bg-[#2D5A27] text-white font-bold'
                                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {slot}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                {editAppForm.lang === 'en' ? 'Evening (17:00 - 20:00)' : 'Buổi Tối (17:00 - 20:00)'}
                              </div>
                              <div className="grid grid-cols-3 gap-1">
                                {ADMIN_TIME_SLOTS.slice(14).map((slot) => (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => {
                                      setEditAppForm((prev) => ({ ...prev, timeSlot: slot }));
                                      setIsTimeSlotDropdownOpen(false);
                                    }}
                                    className={`py-1.5 px-1.5 rounded text-[11px] font-medium text-center transition cursor-pointer ${
                                      editAppForm.timeSlot === slot
                                        ? 'bg-[#2D5A27] text-white font-bold'
                                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {slot}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Nhập giờ khác */}
                          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center gap-2">
                            <span className="text-[11px] text-slate-500 whitespace-nowrap">Giờ khác:</span>
                            <input
                              type="text"
                              value={editAppForm.timeSlot}
                              onChange={(e) => setEditAppForm((prev) => ({ ...prev, timeSlot: e.target.value }))}
                              placeholder="VD: 08:15..."
                              className="flex-1 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#2D5A27]"
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  setIsTimeSlotDropdownOpen(false);
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setIsTimeSlotDropdownOpen(false)}
                              className="px-2.5 py-1 rounded bg-slate-800 text-white text-[11px] font-semibold"
                            >
                              Xong
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Ghi chú / Triệu chứng: có thể kéo dãn rộng xuống dưới tự do */}
                <div>
                  <label className="block text-slate-600 font-medium mb-1 text-xs">
                    Ghi chú / Triệu chứng:
                  </label>
                  <textarea
                    rows={3}
                    value={editAppForm.note}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditAppForm((prev) => ({ ...prev, note: val }));
                      setNoteCache((prev) => ({
                        ...prev,
                        [editAppForm.lang]: val,
                      }));
                    }}
                    placeholder="Ghi chú về tình trạng thú cưng hoặc yêu cầu của khách..."
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-[#2D5A27] text-xs text-slate-800 outline-none resize-y min-h-[90px]"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-2">
                {editAppForm.status !== 'da_huy' && (
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(true)}
                    className="px-3 py-2 rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 text-xs font-semibold transition cursor-pointer"
                  >
                    Hủy Lịch Hẹn
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteAppointment(selectedAppointment)}
                  className="px-3 py-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 text-xs font-medium transition cursor-pointer"
                >
                  Xóa vĩnh viễn
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                {/* Nút 1: Lưu thay đổi (Ấn lưu sẽ chuyển sang Đã xác nhận nếu đang Chờ xác nhận) */}
                <button
                  type="button"
                  disabled={isSavingAppointment}
                  onClick={handleSaveAppointmentDetail}
                  className="px-4 py-2 rounded-lg bg-[#2D5A27] hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition cursor-pointer disabled:opacity-50"
                >
                  {isSavingAppointment
                    ? 'Đang lưu...'
                    : editAppForm.status === 'cho_xac_nhan'
                    ? 'Xác Nhận & Lưu Lịch'
                    : 'Lưu Thông Tin'}
                </button>

                {/* Nút 2: Gửi Zalo (Chỉ sáng khi đã xác nhận hoặc đã hoàn thành, không có icon cờ) */}
                <div className="relative inline-block">
                  <button
                    type="button"
                    disabled={editAppForm.status === 'cho_xac_nhan' || editAppForm.status === 'da_huy' || isSendingZalo}
                    onClick={handleSendZaloFromModal}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-2xs ${
                      editAppForm.status === 'cho_xac_nhan' || editAppForm.status === 'da_huy'
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    }`}
                    title={
                      editAppForm.status === 'cho_xac_nhan'
                        ? 'Vui lòng xác nhận và lưu thông tin trước khi gửi Zalo'
                        : `Gửi tin nhắn Zalo ZNS xác nhận lịch hẹn${selectedAppointment.so_lan_gui_zalo ? ` - Đã gửi ${selectedAppointment.so_lan_gui_zalo} lần` : ''}`
                    }
                  >
                    {isSendingZalo
                      ? 'Đang gửi...'
                      : `Gửi Zalo (${editAppForm.lang === 'en' ? 'ENG' : 'VIE'})`}
                  </button>
                  {/* Badge Zalo: Lỗi (!) hoặc số lần gửi màu xanh lá cây */}
                  {selectedAppointment.trang_thai_zalo === 'that_bai' ? (
                    <span
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-xs ring-2 ring-white animate-pulse pointer-events-none"
                      title="Lần gửi Zalo gần nhất bị lỗi"
                    >
                      !
                    </span>
                  ) : (selectedAppointment.so_lan_gui_zalo || 0) > 0 ? (
                    <span
                      className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ring-2 ring-white pointer-events-none"
                      title={`Đã gửi Zalo thành công ${selectedAppointment.so_lan_gui_zalo} lần`}
                    >
                      {selectedAppointment.so_lan_gui_zalo}
                    </span>
                  ) : null}
                </div>

                {/* Nút 3: Gửi Email (Chỉ sáng khi đã xác nhận hoặc đã hoàn thành, không có icon cờ) */}
                <div className="relative inline-block">
                  <button
                    type="button"
                    disabled={editAppForm.status === 'cho_xac_nhan' || editAppForm.status === 'da_huy' || isSendingConfirmEmailDetail}
                    onClick={handleSendEmailFromModal}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition shadow-2xs ${
                      editAppForm.status === 'cho_xac_nhan' || editAppForm.status === 'da_huy'
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                    }`}
                    title={
                      editAppForm.status === 'cho_xac_nhan'
                        ? 'Vui lòng xác nhận và lưu thông tin trước khi gửi Email'
                        : `Gửi email xác nhận đặt lịch${selectedAppointment.so_lan_gui_email ? ` - Đã gửi ${selectedAppointment.so_lan_gui_email} lần` : ''}`
                    }
                  >
                    {isSendingConfirmEmailDetail
                      ? 'Đang gửi...'
                      : `Gửi Email (${editAppForm.lang === 'en' ? 'ENG' : 'VIE'})`}
                  </button>
                  {/* Badge Email: Lỗi (!) hoặc số lần gửi màu xanh lá cây */}
                  {selectedAppointment.trang_thai_email === 'that_bai' ? (
                    <span
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-xs ring-2 ring-white animate-pulse pointer-events-none"
                      title="Lần gửi Email gần nhất bị lỗi"
                    >
                      !
                    </span>
                  ) : (selectedAppointment.so_lan_gui_email || 0) > 0 ? (
                    <span
                      className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ring-2 ring-white pointer-events-none"
                      title={`Đã gửi Email thành công ${selectedAppointment.so_lan_gui_email} lần`}
                    >
                      {selectedAppointment.so_lan_gui_email}
                    </span>
                  ) : null}
                </div>

                {/* Nút 4: Đóng */}
                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </AdminResizableModal>

          {/* CỬA SỔ WEB ĐIỀN LÝ DO HỦY LỊCH (BẮT BUỘC NHẬP MỚI CHO HỦY) */}
          {isCancelModalOpen && (
            <div className="fixed inset-0 z-70 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
              <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 text-slate-900 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-bold text-sm text-slate-900">
                    Xác Nhận Hủy Lịch Hẹn
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="py-4 space-y-3 text-xs">
                  <p className="text-slate-600">
                    Vui lòng nhập <strong className="text-slate-900">lý do hủy lịch</strong> để lưu vào hồ sơ khách hàng #{selectedAppointment.ma_lich_hen}:
                  </p>

                  {/* Gợi ý lý do bấm nhanh */}
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Gợi ý nhanh:</span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        'Khách bận việc đột xuất xin hủy',
                        'Không liên lạc được với khách hàng',
                        'Khách đổi sang khám tại cơ sở khác',
                        'Bé cưng đã khỏe / Không cần khám',
                        'Khách đặt nhầm / Trùng lặp lịch',
                      ].map((quick) => (
                        <button
                          key={quick}
                          type="button"
                          onClick={() => setCancelReason(quick)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] transition cursor-pointer"
                        >
                          {quick}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Lý do cụ thể: *
                    </label>
                    <textarea
                      rows={3}
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Nhập lý do hủy lịch hẹn..."
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-rose-500 text-xs text-slate-900 outline-none resize-none"
                      autoFocus
                    />
                    {!cancelReason.trim() && (
                      <span className="text-[11px] text-rose-500 mt-1 block">
                        * Lý do là bắt buộc để xác nhận hủy lịch hẹn.
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(false)}
                    className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    disabled={!cancelReason.trim()}
                    onClick={handleConfirmCancelAppointment}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Xác Nhận Hủy Lịch
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. MODAL THÊM / CHỈNH SỬA ĐÁNH GIÁ KHÁCH HÀNG             */}
      {/* ========================================================= */}
      {editingReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <AdminResizableModal className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                  <Star className="w-4 h-4 fill-amber-500" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-wide uppercase">
                  {isCreatingNewReview ? 'Thêm Đánh Giá Khách Hàng' : 'Chỉnh Sửa Đánh Giá'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveReview} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Thanh chuyển đổi ngôn ngữ & Nút dịch AI */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setReviewModalTab('vi')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      reviewModalTab === 'vi'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                    <span>Bản Tiếng Việt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewModalTab('en')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      reviewModalTab === 'en'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UKFlag className="w-4 h-3 rounded-[2px]" />
                    <span>Bản English</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAutoTranslateReview}
                  disabled={isTranslatingReview}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs hover:shadow transition disabled:opacity-50 cursor-pointer"
                  title="Dịch tự động nhận xét và tên khách hàng sang Tiếng Anh y khoa Fear-Free bằng AI"
                >
                  {isTranslatingReview ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{isTranslatingReview ? 'Đang chuyển đổi...' : 'Chuyển đổi ENG'}</span>
                </button>
              </div>

              {reviewModalTab === 'vi' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tên chủ nuôi (Tiếng Việt): <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingReview.ten_khach_hang || ''}
                        onChange={(e) => setEditingReview((prev) => ({ ...prev, ten_khach_hang: e.target.value }))}
                        placeholder="VD: Chị Minh Thư"
                        required
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Số điện thoại (ẩn 4 số cuối): <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingReview.so_dien_thoai || ''}
                        onChange={(e) => setEditingReview((prev) => ({ ...prev, so_dien_thoai: e.target.value }))}
                        placeholder="VD: 0908 234 ***"
                        required
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Ngày đánh giá:
                      </label>
                      <input
                        type="date"
                        value={toDateInputValue(editingReview.ngay_danh_gia)}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingReview((prev) => ({
                            ...prev,
                            ngay_danh_gia: val,
                            ngay_danh_gia_en: prev?.ngay_danh_gia_en || val,
                          }));
                        }}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Dịch vụ đã sử dụng (Tiếng Việt):
                      </label>
                      <input
                        type="text"
                        value={editingReview.dich_vu_su_dung || ''}
                        onChange={(e) => setEditingReview((prev) => ({ ...prev, dich_vu_su_dung: e.target.value }))}
                        placeholder="VD: Cấp cứu 24/7, Spa Fear-Free..."
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nội dung nhận xét chi tiết (Tiếng Việt): <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={editingReview.noi_dung || ''}
                      onChange={(e) => setEditingReview((prev) => ({ ...prev, noi_dung: e.target.value }))}
                      placeholder="Nhập cảm nhận của chủ nuôi về dịch vụ, bác sĩ, điều dưỡng..."
                      required
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tên khách hàng (English):
                      </label>
                      <input
                        type="text"
                        value={editingReview.ten_khach_hang_en || ''}
                        onChange={(e) => setEditingReview((prev) => ({ ...prev, ten_khach_hang_en: e.target.value }))}
                        placeholder="VD: Ms. Minh Thu, Mr. David..."
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Ngày đánh giá:
                      </label>
                      <input
                        type="date"
                        value={toDateInputValue(editingReview.ngay_danh_gia_en || editingReview.ngay_danh_gia)}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingReview((prev) => ({
                            ...prev,
                            ngay_danh_gia_en: val,
                          }));
                        }}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Dịch vụ đã sử dụng (English):
                    </label>
                    <input
                      type="text"
                      value={editingReview.dich_vu_su_dung_en || ''}
                      onChange={(e) => setEditingReview((prev) => ({ ...prev, dich_vu_su_dung_en: e.target.value }))}
                      placeholder="VD: 24/7 Emergency Care, Fear-Free Spa..."
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nội dung nhận xét chi tiết (English):
                    </label>
                    <textarea
                      rows={4}
                      value={editingReview.noi_dung_en || ''}
                      onChange={(e) => setEditingReview((prev) => ({ ...prev, noi_dung_en: e.target.value }))}
                      placeholder="Enter client feedback in English (Fear-Free, medical care, doctors, nurses)..."
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                </>
              )}

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số sao đánh giá (1 - 5 sao):
                </label>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditingReview((prev) => ({ ...prev, so_sao: star }))}
                      className="p-1 hover:scale-110 transition cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          (editingReview.so_sao || 5) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-xs text-slate-700 font-mono">
                    {editingReview.so_sao || 5} Sao
                  </span>
                </div>
              </div>

              {/* Ảnh đại diện thú cưng: tự thêm hoặc dán vào */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Ảnh đại diện thú cưng (dán URL hoặc tự thêm):
                </label>
                <AdminImageInput
                  value={editingReview.hinh_anh_thu_cung || ''}
                  onChange={(url) =>
                    setEditingReview((prev) => ({ ...prev, hinh_anh_thu_cung: url }))
                  }
                  folder="general"
                  label=""
                  uploadButtonLabel="Tải File"
                  pasteButtonLabel="Dán Ảnh"
                  onNotification={showNotification}
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400">Chọn mẫu nhanh:</span>
                  {[
                    { label: 'Bé Golden', url: '/pet_golden_spa.jpg' },
                    { label: 'Bé Corgi', url: '/pet_corgi_park.jpg' },
                    { label: 'Bé Mèo Anh', url: '/pet_cat_resort.jpg' },
                    { label: 'Bé Cún con', url: '/pet_puppy_play.jpg' },
                    { label: 'Bé Miu', url: '/pet_kitten_eyes.jpg' },
                  ].map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() =>
                        setEditingReview((prev) => ({ ...prev, hinh_anh_thu_cung: preset.url }))
                      }
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border transition cursor-pointer ${
                        editingReview.hinh_anh_thu_cung === preset.url
                          ? 'bg-[#2D5A27] text-white border-[#2D5A27]'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thứ tự hiển thị:
                </label>
                <input
                  type="number"
                  value={editingReview.thu_tu ?? 0}
                  onChange={(e) =>
                    setEditingReview((prev) => ({
                      ...prev,
                      thu_tu: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingReview.da_xac_thuc ?? true}
                    onChange={(e) => setEditingReview((prev) => ({ ...prev, da_xac_thuc: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#2D5A27] focus:ring-[#2D5A27]"
                  />
                  <span className="text-xs font-semibold text-slate-700">Đã xác thực thăm khám</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingReview.kich_hoat !== false}
                    onChange={(e) => setEditingReview((prev) => ({ ...prev, kich_hoat: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#2D5A27] focus:ring-[#2D5A27]"
                  />
                  <span className="text-xs font-semibold text-slate-700">Kích hoạt hiển thị</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isReviewSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isReviewSaving ? 'Đang lưu...' : 'Lưu Đánh Giá'}</span>
                </button>
              </div>
            </form>
          </AdminResizableModal>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. MODAL THÊM / CHỈNH SỬA HỒ SƠ ĐỘI NGŨ Y TẾ              */}
      {/* ========================================================= */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <AdminResizableModal className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-[#2D5A27]">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-wide uppercase">
                    {isCreatingNewMember ? 'Thêm Nhân Sự Đội Ngũ Mới' : 'Chỉnh Sửa Hồ Sơ Nhân Sự'}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tải/dán ảnh bên trái, kéo các ô vuông để cắt chỉnh chân dung chuẩn tỉ lệ 3:4
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form 2 Cột */}
            <form onSubmit={handleSaveMember} className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* CỘT TRÁI (6 CỘT): BỘ CẮT ẢNH CHÂN DUNG TƯƠNG TÁC */}
                <div className="lg:col-span-6 space-y-4">
                  <AdminInteractiveCropper
                    value={editingMember.hinh_anh || ''}
                    originalUrl={editingMember.anh_goc || editingMember.hinh_anh || ''}
                    onChange={(url) => setEditingMember((prev) => ({ ...prev, hinh_anh: url }))}
                    onOriginalChange={(url) => setEditingMember((prev) => ({ ...prev, anh_goc: url }))}
                    onPreviewChange={(url) => setMemberPreview(url)}
                    folder="general"
                    aspectRatio={3 / 4}
                    onNotification={showNotification}
                    label="Ảnh Chân Dung Nhân Sự (Tỉ lệ 3:4)"
                  />
                </div>

                {/* CỘT PHẢI (6 CỘT): XEM TRƯỚC THẺ BÁC SĨ & THÔNG TIN HỒ SƠ */}
                <div className="lg:col-span-6 space-y-4 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/80">
                  {/* MÔ PHỎNG HIỂN THỊ THẺ NHÂN SỰ THỜI GIAN THỰC */}
                  {(memberPreview || editingMember.hinh_anh) && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-[#2D5A27]" />
                          <span>Mô phỏng hiển thị trên Thẻ Đội Ngũ (Ảnh sau cắt)</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Ảnh áp dụng</span>
                        </span>
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="w-20 aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                          <img
                            src={memberPreview || editingMember.hinh_anh || ''}
                            alt="Doctor preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D5A27] bg-[#2D5A27]/10 px-2 py-0.5 rounded-full inline-block">
                            {editingMember.chuc_danh || 'BÁC SĨ THÚ Y'}
                          </span>
                          <h4 className="text-xs font-bold text-slate-800 truncate">
                            {editingMember.ho_ten || 'Họ và tên Bác sĩ / Nhân sự'}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-2">
                            {editingMember.hoc_vi_chuc_vu || 'Học vị, chức danh chuyên môn'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Phân loại hạn mục */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hạn mục phân loại: *
                    </label>
                    <select
                      value={editingMember.phan_loai || 'bac_si'}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setEditingMember((prev) => ({
                          ...prev,
                          phan_loai: val,
                          chuc_danh:
                            prev?.chuc_danh && prev.chuc_danh !== 'BÁC SĨ THÚ Y' && prev.chuc_danh !== 'ĐIỀU DƯỠNG' && prev.chuc_danh !== 'CHUYÊN GIA TƯ VẤN'
                              ? prev.chuc_danh
                              : val === 'lanh_dao'
                              ? 'NHÀ SÁNG LẬP · PETM&M'
                              : val === 'chuyen_gia'
                              ? 'CHUYÊN GIA TƯ VẤN'
                              : val === 'dieu_duong'
                              ? 'ĐIỀU DƯỠNG'
                              : 'BÁC SĨ THÚ Y',
                        }));
                      }}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                    >
                      <option value="lanh_dao">1. Đội ngũ Lãnh đạo chuyên môn</option>
                      <option value="chuyen_gia">2. Đội ngũ Chuyên gia Tư vấn</option>
                      <option value="bac_si">3. Đội ngũ Bác sĩ Thú y</option>
                      <option value="dieu_duong">4. Đội ngũ Điều dưỡng &amp; Chăm sóc</option>
                    </select>
                  </div>

                  {/* Language Switch Tabs & AI Translate Button */}
                  <div className="flex items-center justify-between gap-2 p-1.5 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1">
                      <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200/80">
                        <button
                          type="button"
                          onClick={() => setMemberModalTab('vi')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            memberModalTab === 'vi'
                              ? 'bg-[#2D5A27] text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                          <span>Tiếng Việt</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMemberModalTab('en')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            memberModalTab === 'en'
                              ? 'bg-[#2D5A27] text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <UKFlag className="w-4 h-3 rounded-[2px]" />
                          <span>English</span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleTranslateMember}
                      disabled={isTranslatingMember}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-2xs hover:shadow transition disabled:opacity-50 cursor-pointer"
                      title="Dịch tự động toàn bộ thông tin nhân sự sang Tiếng Anh y khoa bằng AI"
                    >
                      {isTranslatingMember ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>{isTranslatingMember ? 'Đang dịch...' : 'Dịch ENG AI'}</span>
                    </button>
                  </div>

                  {memberModalTab === 'vi' ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Họ và tên (Tiếng Việt): <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={editingMember.ho_ten || ''}
                            onChange={(e) => setEditingMember((prev) => ({ ...prev, ho_ten: e.target.value }))}
                            placeholder="Nhập họ và tên"
                            required
                            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Thẻ chức danh (Tiếng Việt):
                          </label>
                          <input
                            type="text"
                            value={editingMember.chuc_danh || ''}
                            onChange={(e) => setEditingMember((prev) => ({ ...prev, chuc_danh: e.target.value }))}
                            placeholder="BÁC SĨ THÚ Y"
                            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none uppercase"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Học vị / Chức vụ (Tiếng Việt):
                        </label>
                        <input
                          type="text"
                          value={editingMember.hoc_vi_chuc_vu || ''}
                          onChange={(e) => setEditingMember((prev) => ({ ...prev, hoc_vi_chuc_vu: e.target.value }))}
                          placeholder="Học vị, chức danh công tác"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Giới thiệu tóm tắt (Tiếng Việt):
                        </label>
                        <textarea
                          rows={3}
                          value={editingMember.mo_ta || ''}
                          onChange={(e) => setEditingMember((prev) => ({ ...prev, mo_ta: e.target.value }))}
                          placeholder="Nội dung giới thiệu năng lực chuyên môn"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Full Name (English):
                          </label>
                          <input
                            type="text"
                            value={editingMember.ho_ten_en || ''}
                            onChange={(e) => setEditingMember((prev) => ({ ...prev, ho_ten_en: e.target.value }))}
                            placeholder="e.g. Dr. John Doe, DVM"
                            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Title Badge (English):
                          </label>
                          <input
                            type="text"
                            value={editingMember.chuc_danh_en || ''}
                            onChange={(e) => setEditingMember((prev) => ({ ...prev, chuc_danh_en: e.target.value }))}
                            placeholder="e.g. VETERINARY DOCTOR"
                            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none uppercase"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Degree / Position (English):
                        </label>
                        <input
                          type="text"
                          value={editingMember.hoc_vi_chuc_vu_en || ''}
                          onChange={(e) => setEditingMember((prev) => ({ ...prev, hoc_vi_chuc_vu_en: e.target.value }))}
                          placeholder="e.g. Specialist Level I · Surgery & Orthopedics"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Summary Bio (English):
                        </label>
                        <textarea
                          rows={3}
                          value={editingMember.mo_ta_en || ''}
                          onChange={(e) => setEditingMember((prev) => ({ ...prev, mo_ta_en: e.target.value }))}
                          placeholder="Professional experience and clinical competence summary in English..."
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1 border-t border-slate-200">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Thứ tự sắp xếp:
                      </label>
                      <input
                        type="number"
                        value={editingMember.thu_tu ?? 0}
                        onChange={(e) =>
                          setEditingMember((prev) => ({
                            ...prev,
                            thu_tu: parseInt(e.target.value, 10) || 0,
                          }))
                        }
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>

                    <div className="pt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingMember.kich_hoat !== false}
                          onChange={(e) => setEditingMember((prev) => ({ ...prev, kich_hoat: e.target.checked }))}
                          className="w-4 h-4 rounded text-[#2D5A27] focus:ring-[#2D5A27]"
                        />
                        <span className="text-xs font-semibold text-slate-700">Kích hoạt hiển thị</span>
                      </label>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setEditingMember(null)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={isMemberSaving}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isMemberSaving ? 'Đang lưu...' : 'Lưu Nhân Sự'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </AdminResizableModal>
        </div>
      )}

      {/* ========================================================= */}
      {/* 10. MODAL THÊM / CHỈNH SỬA SLIDE ẢNH KHUNG GIỚI THIỆU     */}
      {/* ========================================================= */}
            {editingAboutSlide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <AdminResizableModal className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* TIÊU ĐỀ MODAL */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-wide uppercase">
                  {isCreatingNewAboutSlide ? 'Thêm Ảnh Khung Giới Thiệu' : 'Chỉnh Sửa Ảnh Khung Giới Thiệu'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tải/dán ảnh bên trái, kéo các ô vuông để cắt chỉnh khung hình hiển thị chuẩn tỉ lệ 16:10
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingAboutSlide(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORM 2 CỘT: BÊN TRÁI LÀ CẮT ẢNH, BÊN PHẢI LÀ NỘI DUNG & THÔNG SỐ */}
            <form onSubmit={handleSaveAboutSlide} className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* CỘT TRÁI: BỘ CẮT & CĂN CHỈNH ẢNH INTERACTIVE (7 CỘT) */}
                <div className="lg:col-span-7">
                  <AdminInteractiveCropper
                    value={editingAboutSlide.duong_dan_anh || ''}
                    originalUrl={editingAboutSlide.anh_goc || editingAboutSlide.duong_dan_anh || ''}
                    onChange={(url) => setEditingAboutSlide((prev) => ({ ...prev, duong_dan_anh: url }))}
                    onOriginalChange={(url) => setEditingAboutSlide((prev) => ({ ...prev, anh_goc: url }))}
                    onPreviewChange={(url) => setAboutSlidePreview(url)}
                    folder="banners"
                    aspectRatio={16 / 10}
                    onNotification={showNotification}
                    label="Ảnh Khung Giới Thiệu (Tỉ lệ 16:10)"
                  />
                </div>

                {/* CỘT PHẢI: NGÔN NGỮ, TIÊU ĐỀ & CÀI ĐẶT (5 CỘT) */}
                <div className="lg:col-span-5 space-y-4 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/80">
                  {/* MÔ PHỎNG HIỂN THỊ THỜI GIAN THỰC KHI CẮT */}
                  {(aboutSlidePreview || editingAboutSlide.duong_dan_anh) && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                          <Crop className="w-3 h-3 text-[#2D5A27]" />
                          <span>Ảnh sau cắt (Mô phỏng hiển thị)</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Ảnh áp dụng</span>
                        </span>
                      </div>
                      <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden border border-slate-200 bg-slate-950">
                        <img
                          src={aboutSlidePreview || editingAboutSlide.duong_dan_anh}
                          alt="Live slide crop preview"
                          className="w-full h-full object-cover"
                        />
                        {(editingAboutSlide.alt_text || editingAboutSlide.alt_text_en) && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-[#2D5A27]/90 text-white text-[10px] font-bold shadow">
                            {aboutSlideLang === 'vi' ? editingAboutSlide.alt_text : (editingAboutSlide.alt_text_en || editingAboutSlide.alt_text)}
                          </div>
                        )}
                        {(editingAboutSlide.tieu_de || editingAboutSlide.tieu_de_en) && (
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white">
                            <p className="text-[11px] font-semibold line-clamp-1">
                              {aboutSlideLang === 'vi' ? editingAboutSlide.tieu_de : (editingAboutSlide.tieu_de_en || editingAboutSlide.tieu_de)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* THANH CHUYỂN ĐỔI NGÔN NGỮ (TIẾNG VIỆT & ENGLISH) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-white border border-slate-200 rounded-xl shadow-2xs">
                    {/* Tab Ngôn ngữ */}
                    <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setAboutSlideLang('vi')}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          aboutSlideLang === 'vi'
                            ? 'bg-[#2D5A27] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <VietnamFlag className="w-3.5 h-2.5 rounded-[2px]" />
                        <span>Tiếng Việt</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAboutSlideLang('en')}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          aboutSlideLang === 'en'
                            ? 'bg-[#2D5A27] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <UKFlag className="w-3.5 h-2.5 rounded-[2px]" />
                        <span>English</span>
                      </button>
                    </div>

                    {/* Nút Chuyển đổi ENG */}
                    <button
                      type="button"
                      onClick={handleAutoTranslateAboutSlide}
                      disabled={isTranslatingAboutSlide}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-[11px] font-bold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                      title="Tự động dịch Tiêu đề chú thích & Huy hiệu sang Tiếng Anh chuyên ngành Thú y bằng AI"
                    >
                      {isTranslatingAboutSlide ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      <span>{isTranslatingAboutSlide ? 'Đang dịch...' : 'Dịch ENG AI'}</span>
                    </button>
                  </div>

                  {/* NỘI DUNG TIẾNG VIỆT */}
                  {aboutSlideLang === 'vi' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Tiêu đề chú thích ảnh: *
                        </label>
                        <input
                          type="text"
                          value={editingAboutSlide.tieu_de || ''}
                          onChange={(e) => setEditingAboutSlide((prev) => ({ ...prev, tieu_de: e.target.value }))}
                          placeholder="Ví dụ: Đội ngũ y bác sĩ tận tâm..."
                          required
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Huy hiệu góc ảnh:
                        </label>
                        <input
                          type="text"
                          value={editingAboutSlide.alt_text || ''}
                          onChange={(e) => setEditingAboutSlide((prev) => ({ ...prev, alt_text: e.target.value }))}
                          placeholder="Ví dụ: 100% Chuyên Môn Cao..."
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* NỘI DUNG ENGLISH */}
                  {aboutSlideLang === 'en' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Tiêu đề chú thích ảnh (English):
                        </label>
                        <input
                          type="text"
                          value={editingAboutSlide.tieu_de_en || ''}
                          onChange={(e) => setEditingAboutSlide((prev) => ({ ...prev, tieu_de_en: e.target.value }))}
                          placeholder="e.g. Dedicated Medical Team..."
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Huy hiệu góc ảnh (English):
                        </label>
                        <input
                          type="text"
                          value={editingAboutSlide.alt_text_en || ''}
                          onChange={(e) => setEditingAboutSlide((prev) => ({ ...prev, alt_text_en: e.target.value }))}
                          placeholder="e.g. 100% Highly Qualified..."
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* THỨ TỰ & KÍCH HOẠT */}
                  <div className="grid grid-cols-2 gap-3 items-center pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Thứ tự hiển thị:
                      </label>
                      <input
                        type="number"
                        value={editingAboutSlide.thu_tu ?? 0}
                        onChange={(e) =>
                          setEditingAboutSlide((prev) => ({ ...prev, thu_tu: parseInt(e.target.value, 10) || 0 }))
                        }
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>

                    <div className="pt-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingAboutSlide.kich_hoat !== false}
                          onChange={(e) => setEditingAboutSlide((prev) => ({ ...prev, kich_hoat: e.target.checked }))}
                          className="w-4 h-4 rounded text-[#2D5A27] focus:ring-[#2D5A27]"
                        />
                        <span className="text-xs font-semibold text-slate-700">Kích hoạt hiển thị</span>
                      </label>
                    </div>
                  </div>

                  {/* NÚT THAO TÁC */}
                  <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setEditingAboutSlide(null)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={isAboutSlideSaving}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isAboutSlideSaving ? 'Đang lưu...' : 'Lưu Slide'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </AdminResizableModal>
        </div>
      )}

      {/* ========================================================= */}
      {/* 11. MODAL THÊM / CHỈNH SỬA BÀI VIẾT CẨM NANG             */}
      {/* ========================================================= */}
            {editingArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <AdminResizableModal className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#2D5A27]/10 flex items-center justify-center text-[#2D5A27]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-wide uppercase">
                  {isCreatingNewArticle ? 'Thêm Bài Viết Cẩm Nang Mới' : 'Chỉnh Sửa Bài Viết Cẩm Nang'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingArticle(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveArticle} className="p-6 overflow-y-auto space-y-5">
              {/* Thanh Chuyển Ngôn Ngữ & Nút Dịch AI */}
              <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setArticleLangTab('vi')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        articleLangTab === 'vi'
                          ? 'bg-[#2D5A27] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                      <span>Bản Tiếng Việt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setArticleLangTab('en')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        articleLangTab === 'en'
                          ? 'bg-[#2D5A27] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UKFlag className="w-4 h-3 rounded-[2px]" />
                      <span>Bản English</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAutoTranslateArticle}
                  disabled={isTranslatingArticle}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
                  title="Dịch tự động sang Tiếng Anh bằng AI"
                >
                  {isTranslatingArticle ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{isTranslatingArticle ? 'Đang chuyển đổi...' : 'Chuyển đổi ENG'}</span>
                </button>
              </div>

              {articleLangTab === 'vi' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tiêu đề bài viết: *
                    </label>
                    <input
                      type="text"
                      value={editingArticle.tieu_de || ''}
                      onChange={(e) => setEditingArticle((prev) => ({ ...prev, tieu_de: e.target.value }))}
                      required
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      placeholder="Ví dụ: Lịch tiêm phòng đầy đủ cho chó mèo năm 2026..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Chuyên mục bài viết:
                      </label>
                      <select
                        value={editingArticle.chuyen_muc || 'Y Khoa Dự Phòng'}
                        onChange={(e) => setEditingArticle((prev) => ({ ...prev, chuyen_muc: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none bg-white"
                      >
                        <option value="Y Khoa Dự Phòng">Y Khoa Dự Phòng</option>
                        <option value="Sơ Cứu Thú Cưng">Sơ Cứu Thú Cưng</option>
                        <option value="Chăm Sóc & Spa">Chăm Sóc &amp; Spa</option>
                        <option value="Dinh Dưỡng Thú Cưng">Dinh Dưỡng Thú Cưng</option>
                        <option value="Hành Vi & Huấn Luyện">Hành Vi &amp; Huấn Luyện</option>
                        <option value="Cẩm Nang Tổng Hợp">Cẩm Nang Tổng Hợp</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tác giả / Bác sĩ phụ trách:
                      </label>
                      <input
                        type="text"
                        value={editingArticle.tac_gia || ''}
                        onChange={(e) => setEditingArticle((prev) => ({ ...prev, tac_gia: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="Ví dụ: Hội Đồng Y Khoa PetM&M"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tóm tắt ngắn (hiển thị ngoài danh sách thẻ card):
                    </label>
                    <textarea
                      rows={2}
                      value={editingArticle.mo_ta_ngan || ''}
                      onChange={(e) => setEditingArticle((prev) => ({ ...prev, mo_ta_ngan: e.target.value }))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-none leading-relaxed"
                      placeholder="Tóm tắt ngắn gọn 1-2 câu về nội dung bài viết..."
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#2D5A27]" />
                        <span>Nội dung chi tiết bài viết (Tiếng Việt):</span>
                      </label>
                    </div>
                    <RichTextEditor
                      key={`article-editor-vi-${editingArticle.id || 'new'}`}
                      value={editingArticle.noi_dung || ''}
                      onChange={(html) => setEditingArticle((prev) => ({ ...prev, noi_dung: html }))}
                      minHeight={340}
                      onUploadImage={async (file) => {
                        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
                        const filePath = `articles/content_${Date.now()}_${Math.random()
                          .toString(36)
                          .substring(2, 6)}.${fileExt}`;
                        const { error } = await supabase.storage
                          .from('hinh_anh')
                          .upload(filePath, file, { cacheControl: '3600', upsert: true });
                        if (error) throw error;
                        const { data: urlData } = supabase.storage.from('hinh_anh').getPublicUrl(filePath);
                        return urlData.publicUrl;
                      }}
                    />
                  </div>
                </div>
              ) : (
                /* TAB TIẾNG ANH */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Article Title (English): <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={(editingArticle as any).tieu_de_en || ''}
                      onChange={(e) => setEditingArticle((prev) => ({ ...prev, tieu_de_en: e.target.value } as any))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      placeholder="e.g. Comprehensive Vaccination Schedule for Dogs and Cats 2026..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Category (English):
                      </label>
                      <input
                        type="text"
                        value={(editingArticle as any).chuyen_muc_en || ''}
                        onChange={(e) => setEditingArticle((prev) => ({ ...prev, chuyen_muc_en: e.target.value } as any))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. Preventive Medicine"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Author / Medical Team (English):
                      </label>
                      <input
                        type="text"
                        value={(editingArticle as any).tac_gia_en || ''}
                        onChange={(e) => setEditingArticle((prev) => ({ ...prev, tac_gia_en: e.target.value } as any))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. PetM&M Medical Board"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Short Excerpt (English):
                    </label>
                    <textarea
                      rows={2}
                      value={(editingArticle as any).mo_ta_ngan_en || ''}
                      onChange={(e) => setEditingArticle((prev) => ({ ...prev, mo_ta_ngan_en: e.target.value } as any))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-none leading-relaxed"
                      placeholder="Brief 1-2 sentence overview in English..."
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#2D5A27]" />
                        <span>Detailed Article Content (English):</span>
                      </label>
                    </div>
                    <RichTextEditor
                      key={`article-editor-en-${editingArticle.id || 'new'}`}
                      value={(editingArticle as any).noi_dung_en || ''}
                      onChange={(html) => setEditingArticle((prev) => ({ ...prev, noi_dung_en: html } as any))}
                      minHeight={340}
                      onUploadImage={async (file) => {
                        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
                        const filePath = `articles/content_${Date.now()}_${Math.random()
                          .toString(36)
                          .substring(2, 6)}.${fileExt}`;
                        const { error } = await supabase.storage
                          .from('hinh_anh')
                          .upload(filePath, file, { cacheControl: '3600', upsert: true });
                        if (error) throw error;
                        const { data: urlData } = supabase.storage.from('hinh_anh').getPublicUrl(filePath);
                        return urlData.publicUrl;
                      }}
                    />
                  </div>
                </div>
              )}

              {/* COMMON FIELDS */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                {/* KHỐI ẢNH BÌA BÀI VIẾT & CẮT CHỈNH INTERACTIVE (ẢNH BÊN TRÁI, Ô VUÔNG KÉO CẮT) */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* CỘT TRÁI: BỘ CẮT ẢNH VỚI CÁC Ô VUÔNG (7 CỘT) */}
                    <div className="lg:col-span-7">
                      <AdminInteractiveCropper
                        value={editingArticle.hinh_anh || ''}
                        originalUrl={editingArticle.anh_goc || editingArticle.hinh_anh || ''}
                        onChange={(url) => setEditingArticle((prev) => ({ ...prev, hinh_anh: url }))}
                        onOriginalChange={(url) => setEditingArticle((prev) => ({ ...prev, anh_goc: url }))}
                        onPreviewChange={(url) => setArticlePreview(url)}
                        folder="articles"
                        aspectRatio={16 / 9}
                        onNotification={showNotification}
                        label="Ảnh Bìa Bài Viết Cẩm Nang (Tỉ lệ 16:9)"
                      />
                    </div>

                    {/* CỘT PHẢI: MÔ PHỎNG THẺ BÀI VIẾT (5 CỘT) */}
                    <div className="lg:col-span-5 space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#2D5A27]" />
                          <span>Mô phỏng hiển thị trên Blog / Cẩm nang</span>
                        </h4>
                        {(articlePreview || editingArticle.hinh_anh) && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Ảnh áp dụng</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Cột bên trái thao tác trên ảnh gốc. Kéo các ô vuông để cắt góc tiêu điểm chuẩn tỉ lệ 16:9 cho thẻ bài viết, ảnh gốc vẫn luôn được giữ nguyên.
                      </p>

                      {(articlePreview || editingArticle.hinh_anh) && (
                        <div className="pt-2">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mô phỏng thẻ bài viết:</label>
                          <div className="w-full rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs">
                            <div className="w-full aspect-[16/9] overflow-hidden bg-slate-100">
                              <img
                                src={articlePreview || editingArticle.hinh_anh || ''}
                                alt="Article thumbnail"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-2.5">
                              <span className="text-[10px] font-bold text-[#2D5A27] bg-[#2D5A27]/10 px-2 py-0.5 rounded-full inline-block mb-1">
                                {editingArticle.chuyen_muc || 'Y Khoa Dự Phòng'}
                              </span>
                              <h5 className="text-xs font-bold text-slate-800 line-clamp-1">
                                {editingArticle.tieu_de || 'Tiêu đề bài viết cẩm nang'}
                              </h5>
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                                {editingArticle.mo_ta_ngan || 'Mô tả ngắn gọn về bài viết y khoa chia sẻ tới khách hàng...'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Thời gian đọc dự kiến:
                    </label>
                    <input
                      type="text"
                      value={editingArticle.thoi_gian_doc || ''}
                      onChange={(e) => setEditingArticle((prev) => ({ ...prev, thoi_gian_doc: e.target.value }))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ngày đăng bài:
                    </label>
                    <input
                      type="text"
                      value={editingArticle.ngay_dang || ''}
                      onChange={(e) => setEditingArticle((prev) => ({ ...prev, ngay_dang: e.target.value }))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Thứ tự hiển thị:
                    </label>
                    <input
                      type="number"
                      value={editingArticle.thu_tu ?? 0}
                      onChange={(e) =>
                        setEditingArticle((prev) => ({
                          ...prev,
                          thu_tu: parseInt(e.target.value, 10) || 0,
                        }))
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div className="pt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingArticle.kich_hoat !== false}
                        onChange={(e) => setEditingArticle((prev) => ({ ...prev, kich_hoat: e.target.checked }))}
                        className="w-4 h-4 rounded text-[#2D5A27] focus:ring-[#2D5A27]"
                      />
                      <span className="text-xs font-semibold text-slate-700">Kích hoạt hiển thị ngoài website</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isArticleSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isArticleSaving ? 'Đang lưu...' : 'Lưu Bài Viết'}</span>
                </button>
              </div>
            </form>
          </AdminResizableModal>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <LogoutConfirmModal
          onConfirm={doLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}

      {/* THÔNG BÁO NỔI LỊCH HẸN MỚI (TOAST GÓC DƯỚI PHẢI + CHUÔNG ÂM THANH) */}
      <AdminFloatingNotification
        notification={floatingNotification}
        playSound={adminNotifSettings.webSound}
        onClose={() => {
          if (floatingNotification) {
            handleDismissFloatingNotification(floatingNotification.id);
          } else {
            setFloatingNotification(null);
          }
        }}
        onOpenDetail={(app) => {
          if (floatingNotification) {
            handleDismissFloatingNotification(floatingNotification.id);
          }
          handleOpenAppointmentFromNotification(app);
        }}
      />

      {/* THÔNG BÁO NỔI CẢNH BÁO GỬI EMAIL / ZALO THẤT BẠI */}
      <AdminNotificationFailureToast
        failure={failureNotification}
        playSound={adminNotifSettings.webSound}
        onClose={() => setFailureNotification(null)}
      />

      {/* MODAL CÀI ĐẶT THÔNG BÁO (BẬT/TẮT WEB & TRÌNH DUYỆT + ÂM THANH) */}
      <AdminNotificationSettingsModal
        isOpen={isNotifSettingsModalOpen}
        onClose={() => setIsNotifSettingsModalOpen(false)}
        settings={adminNotifSettings}
        onChangeSettings={(newSettings) => {
          setAdminNotifSettings(newSettings);
          showNotification('success', 'Đã lưu cài đặt thông báo!');
        }}
        onPermissionChange={(perm) => setBrowserNotifPermission(perm)}
      />
    </div>
  );
}
