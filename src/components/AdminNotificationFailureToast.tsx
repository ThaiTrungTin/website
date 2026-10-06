'use client';

import React, { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

export interface NotificationFailureItem {
  id: string;
  kenh: 'email' | 'zalo';
  loai_tin?: string;
  nguoi_nhan: string;
  ten_nguoi_nhan?: string | null;
  tieu_de?: string | null;
  chi_tiet_loi?: string | null;
  ma_loi?: string | null;
  thoi_gian?: string;
}

interface AdminNotificationFailureToastProps {
  failure: NotificationFailureItem | null;
  onClose: () => void;
  playSound?: boolean;
}

/**
 * Diễn giải lỗi kỹ thuật của Zalo/SMTP sang tiếng Việt thân thiện, dễ hiểu
 */
export function formatFriendlyErrorMessage(raw?: string | null): string {
  if (!raw) return 'Không thể chuyển tiếp tin nhắn tới người nhận.';
  const lower = raw.toLowerCase();
  if (lower.includes('phone number invalid')) return 'Số điện thoại không hợp lệ hoặc chưa đăng ký Zalo.';
  if (lower.includes('schedule_time')) return 'Mẫu tin Zalo đang thiếu thông tin thời gian hẹn.';
  if (lower.includes('missing a parameter')) return 'Mẫu tin Zalo đang thiếu dữ liệu bắt buộc.';
  if (lower.includes('access token invalid') || lower.includes('-124')) return 'Khóa kết nối Zalo đã hết hạn, cần cấp lại token.';
  if (lower.includes('template not found') || lower.includes('template id')) return 'Mẫu ZNS chưa được duyệt hoặc sai Template ID.';
  if (lower.includes('user not opt-in') || lower.includes('opt-in')) return 'Khách hàng chưa cho phép nhận tin thông báo Zalo OA.';
  if (lower.includes('account balance')) return 'Số dư tài khoản Zalo Cloud không đủ để gửi ZNS.';
  if (lower.includes('app password') || lower.includes('smtp_password')) return 'Chưa cấu hình Mật khẩu ứng dụng Gmail.';
  if (lower.includes('econnrefused') || lower.includes('timeout')) return 'Lỗi kết nối tới máy chủ gửi email.';
  return raw;
}

/**
 * Phát âm thanh cảnh báo ngắn, êm ái
 */
export function playFailureWarningSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.25);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  } catch {}
}

/**
 * Gửi thông báo Windows gọn gàng
 */
export function sendFailureBrowserNotification(item: NotificationFailureItem) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const channelName = item.kenh === 'zalo' ? 'Zalo OA' : 'Email';
    new Notification(`Lỗi gửi ${channelName}`, {
      body: `Tới ${item.nguoi_nhan}: ${formatFriendlyErrorMessage(item.chi_tiet_loi || item.ma_loi)}`,
      icon: '/icon.png',
      tag: `failure_${item.id || Date.now()}`,
    });
  } catch {}
}

export default function AdminNotificationFailureToast({
  failure,
  onClose,
  playSound = true,
}: AdminNotificationFailureToastProps) {
  useEffect(() => {
    if (failure) {
      if (playSound) playFailureWarningSound();
      sendFailureBrowserNotification(failure);

      // Tự động đóng sau 8 giây cho gọn gàng
      const timer = setTimeout(() => {
        onClose();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [failure, playSound, onClose]);

  if (!failure) return null;

  const isZalo = failure.kenh === 'zalo';
  const friendlyMsg = formatFriendlyErrorMessage(failure.chi_tiet_loi || failure.ma_loi);

  return (
    <div
      role="alert"
      className="fixed bottom-5 right-5 z-50 w-84 max-w-[calc(100vw-32px)] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-rose-200 p-3.5 flex items-start gap-3 animate-slide-up duration-200 transition-all select-none"
      style={{
        boxShadow: '0 12px 28px -6px rgba(225, 29, 72, 0.18), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 border border-rose-100">
        <AlertCircle className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-900">
            {isZalo ? 'Không gửi được Zalo OA' : 'Không gửi được Email'}
          </span>
          <span className="text-[10px] text-slate-400 font-medium shrink-0">vừa xong</span>
        </div>

        <p className="text-[11px] text-slate-500 truncate mt-0.5">
          Tới <span className="font-mono text-slate-700 font-semibold">{failure.nguoi_nhan}</span>
          {failure.ten_nguoi_nhan ? ` · ${failure.ten_nguoi_nhan}` : ''}
        </p>

        <p className="text-[11px] text-rose-600 font-medium mt-1 leading-snug line-clamp-2">
          {friendlyMsg}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition shrink-0 cursor-pointer"
        title="Đóng"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
