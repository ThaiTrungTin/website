'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { CalendarDays, X, ChevronRight, Bell, Sparkles } from 'lucide-react';

export interface FloatingAppointmentNotification {
  id: string;
  customerName: string;
  phone: string;
  service: string;
  date: string;
  timeSlot: string;
  branchName?: string | null;
  petName?: string | null;
  code?: string | null;
  rawItem: any;
}

interface AdminFloatingNotificationProps {
  notification: FloatingAppointmentNotification | null;
  onClose: () => void;
  onOpenDetail: (appointment: any) => void;
  playSound?: boolean;
}

/**
 * Phát âm thanh chuông "Ding-Dong" êm ái, chuyên nghiệp chuẩn thông báo hệ thống
 * Sử dụng Web Audio API thuần (không cần file MP3 bên ngoài, 0ms trễ, không lỗi 404)
 */
export function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Hài âm 1 (D5 ~ 587.33 Hz)
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.55);

    // Hài âm 2 (A5 ~ 880 Hz) trễ 0.12s tạo hiệu ứng chuông "Ding-Dong"
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.35, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.85);
  } catch (err) {
    console.warn('Không thể phát âm thanh thông báo:', err);
  }
}

/**
 * Xin quyền thông báo của Trình duyệt (Windows / OS Notification)
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    return await Notification.requestPermission();
  } catch (e) {
    console.warn('Lỗi xin quyền thông báo trình duyệt:', e);
    return 'denied';
  }
}

/**
 * Gửi thông báo nổi của Hệ điều hành / Trình duyệt (Windows notification ở góc dưới phải)
 */
export function sendBrowserNotification(
  notif: FloatingAppointmentNotification,
  onClickCallback?: () => void
) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const title = `Lịch hẹn mới: ${notif.customerName || 'Khách hàng'}`;
    const cleanServices = (notif.service || 'Khám chữa bệnh').replace(/^[;,\s]+|[;,\s]+$/g, '');
    const bodyLines = [
      `Dịch vụ: ${cleanServices}`,
      `Thời gian: ${notif.timeSlot || 'Linh hoạt'} · ${notif.date || 'Hôm nay'}`,
      notif.branchName ? `Cơ sở: ${notif.branchName.split('—')[0].trim()}` : '',
      `SĐT: ${notif.phone || 'Chưa cung cấp'}`,
    ]
      .filter(Boolean)
      .join('\n');

    const nativeNotif = new Notification(title, {
      body: bodyLines,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `petmm-app-${notif.id}`,
      requireInteraction: true, // Giữ thông báo đến khi người dùng ấn vào hoặc tắt
    });

    nativeNotif.onclick = () => {
      try {
        window.focus();
      } catch (_) {}
      if (onClickCallback) {
        onClickCallback();
      }
      nativeNotif.close();
    };
  } catch (err) {
    console.warn('Lỗi hiển thị Native Notification:', err);
  }
}

export default function AdminFloatingNotification({
  notification,
  onClose,
  onOpenDetail,
  playSound = true,
}: AdminFloatingNotificationProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const TOTAL_DURATION_MS = 14000; // 14 giây tự tắt nếu không tương tác
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Khi có thông báo mới nạp vào
  useEffect(() => {
    if (!notification) return;

    // Phát tiếng chuông báo hiệu nếu playSound bật
    if (playSound) {
      playNotificationSound();
    }

    // Reset progress
    setProgress(100);

    const stepMs = 100;
    const decrement = (stepMs / TOTAL_DURATION_MS) * 100;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        // Nếu chuột đang rê vào (isHovered) thì giữ nguyên, không giảm thời gian
        if (isHovered) return prev;
        if (prev <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onClose();
          return 0;
        }
        return Math.max(0, prev - decrement);
      });
    }, stepMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [notification, isHovered, onClose]);

  if (!notification) return null;

  const handleCardClick = () => {
    onOpenDetail(notification.rawItem);
    onClose();
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-5 right-5 z-[9999] w-[calc(100vw-32px)] sm:w-[380px] max-w-[400px] animate-in slide-in-from-bottom-8 fade-in duration-300 select-none"
    >
      <div className="relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.18)] hover:shadow-[0_25px_60px_rgba(45,90,39,0.22)] transition-all duration-200">
        {/* Đường line gradient điểm nhấn ở trên cùng */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-[#2D5A27]" />

        {/* Nội dung chính của Toast */}
        <div className="p-4 cursor-pointer" onClick={handleCardClick}>
          {/* Header của thông báo */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#2D5A27] shrink-0">
                <CalendarDays className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-ping" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Lịch Hẹn Mới
                  </span>
                  {notification.code && (
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                      #{notification.code}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span>Vừa xong</span>
                  <span>•</span>
                  <span>Chờ xác nhận</span>
                </div>
              </div>
            </div>

            {/* Nút đóng */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chi tiết khách hàng */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-extrabold text-[13px] text-slate-900 truncate">
                {notification.customerName || 'Khách vãng lai'}
              </span>
              <span className="font-bold text-emerald-700 font-mono shrink-0">
                {notification.phone}
              </span>
            </div>

            {/* Dịch vụ */}
            <div className="text-slate-700 line-clamp-2 leading-relaxed">
              <span className="text-slate-400 font-medium">Dịch vụ: </span>
              <span className="font-semibold text-slate-800">{notification.service}</span>
            </div>

            {/* Khung giờ & Cơ sở */}
            <div className="pt-1 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-[#2D5A27] font-bold text-[11px] border border-emerald-200">
                {notification.timeSlot} · {notification.date}
              </span>
              {Boolean(
                notification.petName &&
                !['pet', 'bé cưng', 'be cung', 'beloved pet'].includes(notification.petName.toLowerCase().trim())
              ) && (
                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                  Bé: {notification.petName}
                </span>
              )}
            </div>

            {notification.branchName && (
              <div className="text-[11px] text-slate-500 truncate pt-0.5">
                📍 {notification.branchName}
              </div>
            )}
          </div>

          {/* Nút CTA Xem & Xử Lý */}
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#2D5A27] hover:bg-[#23471f] text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm hover:shadow cursor-pointer"
            >
              <span>Xem &amp; Xử lý lịch hẹn ngay</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thanh đếm ngược tiến trình ở đáy thẻ */}
        <div className="h-1 bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
