'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Volume2,
  Globe,
  Monitor,
  X,
  RefreshCw,
  Info,
} from 'lucide-react';
import { playNotificationSound } from './AdminFloatingNotification';

export interface AdminNotifSettings {
  webEnabled: boolean;      // Bật/tắt thông báo Web
  webSound: boolean;        // Bật/tắt âm thanh Web
  browserEnabled: boolean;  // Bật/tắt thông báo Trình duyệt
  browserSound: boolean;    // Bật/tắt âm thanh Trình duyệt
}

export const DEFAULT_ADMIN_NOTIF_SETTINGS: AdminNotifSettings = {
  webEnabled: true,
  webSound: true,
  browserEnabled: true,
  browserSound: true,
};

const STORAGE_KEY = 'petmm_admin_notif_config';

export function getLocalAdminNotifSettings(): AdminNotifSettings {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_NOTIF_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_ADMIN_NOTIF_SETTINGS,
        ...parsed,
      };
    }
  } catch (_) {}
  return DEFAULT_ADMIN_NOTIF_SETTINGS;
}

export function saveLocalAdminNotifSettings(settings: AdminNotifSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (_) {}
}

interface AdminNotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AdminNotifSettings;
  onChangeSettings: (newSettings: AdminNotifSettings) => void;
  onPermissionChange?: (permission: NotificationPermission) => void;
}

export default function AdminNotificationSettingsModal({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
  onPermissionChange,
}: AdminNotificationSettingsModalProps) {
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');
  const [isTestingSound, setIsTestingSound] = useState(false);
  const [showDeniedGuide, setShowDeniedGuide] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const checkCurrentPermission = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const current = Notification.permission;
      setBrowserPermission(current);
      if (onPermissionChange) onPermissionChange(current);
      return current;
    }
    return 'default';
  };

  useEffect(() => {
    if (isOpen) {
      checkCurrentPermission();
    }
  }, [isOpen]);

  // Đóng modal khi bấm phím ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUpdate = (partial: Partial<AdminNotifSettings>) => {
    const updated = { ...settings, ...partial };
    onChangeSettings(updated);
    saveLocalAdminNotifSettings(updated);
  };

  const handleRequestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    try {
      const perm = await Notification.requestPermission();
      setBrowserPermission(perm);
      if (onPermissionChange) onPermissionChange(perm);
      if (perm === 'granted') {
        handleUpdate({ browserEnabled: true });
        setShowDeniedGuide(false);
        playNotificationSound();
      } else if (perm === 'denied') {
        setShowDeniedGuide(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRecheckPermission = () => {
    const perm = checkCurrentPermission();
    if (perm === 'granted') {
      handleUpdate({ browserEnabled: true });
      setShowDeniedGuide(false);
      playNotificationSound();
    }
  };

  const handleTestSound = () => {
    setIsTestingSound(true);
    playNotificationSound();
    setTimeout(() => setIsTestingSound(false), 800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header gọn gàng */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-emerald-800" />
            <h3 className="font-bold text-sm text-slate-900">Cài Đặt Thông Báo</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nội dung cài đặt: Gọn gàng, không text chú thích rườm rà */}
        <div className="p-4 space-y-3.5 text-xs text-slate-700">
          {/* MỤC 1: THÔNG BÁO WEB */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-slate-900 text-xs">Thông báo Web</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.webEnabled}
                  onChange={(e) => handleUpdate({ webEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2D5A27]" />
                <span className="ml-2 font-semibold text-[11px] text-slate-600">
                  {settings.webEnabled ? 'Bật' : 'Tắt'}
                </span>
              </label>
            </div>

            {/* Âm thanh web */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <label className={`flex items-center gap-2 select-none cursor-pointer ${!settings.webEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <input
                  type="checkbox"
                  checked={settings.webSound}
                  disabled={!settings.webEnabled}
                  onChange={(e) => handleUpdate({ webSound: e.target.checked })}
                  className="w-4 h-4 rounded text-[#2D5A27] focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
                <span className="font-medium text-slate-800 text-[11px] flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                  Âm thanh
                </span>
              </label>

              <button
                type="button"
                onClick={handleTestSound}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-semibold text-slate-700 transition cursor-pointer"
                title="Nghe thử âm thanh"
              >
                <span>{isTestingSound ? 'Đang phát...' : 'Nghe thử'}</span>
                <Volume2 className="w-3 h-3 text-[#2D5A27]" />
              </button>
            </div>
          </div>

          {/* MỤC 2: THÔNG BÁO TRÌNH DUYỆT */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-900 text-xs">Thông báo Trình duyệt</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.browserEnabled}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    handleUpdate({ browserEnabled: checked });
                    if (checked && browserPermission !== 'granted') {
                      handleRequestPermission();
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                <span className="ml-2 font-semibold text-[11px] text-slate-600">
                  {settings.browserEnabled ? 'Bật' : 'Tắt'}
                </span>
              </label>
            </div>

            {/* Trạng thái và nút cấp quyền */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-[11px]">
                {browserPermission === 'granted' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-emerald-700 font-semibold">Đã cấp quyền</span>
                  </>
                ) : browserPermission === 'denied' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span className="text-rose-700 font-semibold">Đang chặn quyền</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-amber-700 font-semibold">Chưa cấp quyền</span>
                  </>
                )}
              </div>

              {/* Nút cấp quyền / cấp quyền lại */}
              {browserPermission !== 'granted' ? (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] transition cursor-pointer"
                >
                  Cấp quyền lại
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRecheckPermission}
                  className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-800 cursor-pointer"
                  title="Kiểm tra lại quyền"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Kiểm tra</span>
                </button>
              )}
            </div>

            {/* Hướng dẫn khi bị từ chối/chặn (lỡ tay chặn trước đó) */}
            {(browserPermission === 'denied' || showDeniedGuide) && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1.5 leading-relaxed">
                <div className="flex items-start gap-1.5 font-semibold text-amber-800">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Cách bật lại khi lỡ tay chặn:</span>
                </div>
                <p className="pl-5 text-amber-700 text-[10px]">
                  1. Nhấp biểu tượng <strong>Ổ khóa 🔒</strong> hoặc <strong>Cài đặt</strong> ở đầu thanh địa chỉ URL.
                  <br />
                  2. Chọn <strong>Thông báo (Notifications) ➔ Cho phép (Allow)</strong>.
                </p>
                <div className="pl-5 pt-1">
                  <button
                    type="button"
                    onClick={handleRecheckPermission}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-200 hover:bg-amber-300 text-amber-900 font-semibold text-[10px] transition cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Đã bật, kiểm tra lại</span>
                  </button>
                </div>
              </div>
            )}

            {/* Âm thanh trình duyệt */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <label className={`flex items-center gap-2 select-none cursor-pointer ${!settings.browserEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <input
                  type="checkbox"
                  checked={settings.browserSound}
                  disabled={!settings.browserEnabled}
                  onChange={(e) => handleUpdate({ browserSound: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <span className="font-medium text-slate-800 text-[11px] flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                  Âm thanh
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              handleUpdate(DEFAULT_ADMIN_NOTIF_SETTINGS);
            }}
            className="text-[11px] text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
          >
            Mặc định
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#2D5A27] hover:bg-[#23471f] text-white font-semibold text-xs transition cursor-pointer"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
}
