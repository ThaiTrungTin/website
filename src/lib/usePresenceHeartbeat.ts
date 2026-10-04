'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook tự động gửi nhịp tim (Heartbeat) theo dõi trạng thái hoạt động:
 * - Chấm xanh (active): Tab đang mở và người dùng đang focus
 * - Chấm vàng (away): Người dùng chuyển tab khác / ẩn trình duyệt
 * - Chấm xám (offline): Đã tắt trình duyệt hoặc đăng xuất
 */
export function usePresenceHeartbeat(enabled: boolean = true) {
  const lastStatusRef = useRef<'active' | 'away' | 'offline'>('active');

  useEffect(() => {
    if (!enabled) return;

    const sendHeartbeat = async (status: 'active' | 'away' | 'offline') => {
      lastStatusRef.current = status;
      try {
        await fetch('/api/admin/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
          keepalive: true,
        });
      } catch {}
    };

    // Gửi ngay khi mount
    sendHeartbeat(document.visibilityState === 'visible' ? 'active' : 'away');

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      sendHeartbeat(isVisible ? 'active' : 'away');
    };

    const handleFocus = () => sendHeartbeat('active');
    const handleBlur = () => {
      // Khi blur khỏi cửa sổ trình duyệt
      sendHeartbeat('away');
    };

    const handleClose = () => {
      try {
        fetch('/api/admin/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'offline' }),
          keepalive: true,
        });
      } catch {}
      try {
        const blob = new Blob([JSON.stringify({ status: 'offline' })], { type: 'application/json' });
        navigator.sendBeacon('/api/admin/heartbeat', blob);
      } catch {}
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleClose);
    window.addEventListener('pagehide', handleClose);

    // Chu kỳ gửi đều đặn mỗi 10 giây để trạng thái luôn tức thời
    const interval = setInterval(() => {
      const isVisible = document.visibilityState === 'visible' && document.hasFocus();
      sendHeartbeat(isVisible ? 'active' : 'away');
    }, 10000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleClose);
      window.removeEventListener('pagehide', handleClose);
      clearInterval(interval);
    };
  }, [enabled]);
}
