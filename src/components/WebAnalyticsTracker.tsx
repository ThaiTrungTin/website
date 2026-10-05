'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function WebAnalyticsTracker() {
  const pathname = usePathname();
  const sessionStartTimeRef = useRef<number>(Date.now());
  const lastHeartbeatTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Không ghi nhận lượt truy cập của ban quản trị khi đang trong trang admin
    if (typeof window === 'undefined' || pathname.startsWith('/admin')) {
      return;
    }

    // 1. Định danh khách truy cập (Visitor ID) bền vững qua localStorage
    let visitorId = '';
    try {
      visitorId = localStorage.getItem('petmm_vid') || '';
      if (!visitorId) {
        visitorId = 'vis_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
        localStorage.setItem('petmm_vid', visitorId);
      }
    } catch {
      visitorId = 'vis_' + Math.random().toString(36).slice(2, 9);
    }

    // 2. Nhận diện loại thiết bị
    const ua = navigator.userAgent || '';
    const width = window.innerWidth;
    let device: 'mobile' | 'desktop' | 'tablet' = 'desktop';

    if (
      /iPad|Tablet|PlayBook/i.test(ua) ||
      (navigator.maxTouchPoints > 1 && width >= 768 && width <= 1024)
    ) {
      device = 'tablet';
    } else if (
      /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
      width < 768
    ) {
      device = 'mobile';
    }

    // 3. Nhận diện trình duyệt
    let browser = 'Chrome';
    if (/Zalo/i.test(ua)) browser = 'Zalo';
    else if (/CocCoc/i.test(ua)) browser = 'Cốc Cốc';
    else if (/Edg/i.test(ua)) browser = 'Edge';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';

    // 4. Nhận diện hệ điều hành
    let os = 'Windows';
    if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
    else if (/Linux/i.test(ua)) os = 'Linux';

    const currentPath = pathname + (window.location.hash || '');
    const referrer = document.referrer ? new URL(document.referrer, window.location.href).hostname : 'direct';
    // Ngôn ngữ trình duyệt (rút gọn: "vi-VN" -> "vi", "en-US" -> "en")
    const language = (navigator.language || 'vi').split('-')[0].toLowerCase();

    // 5. Gửi sự kiện Pageview kèm đo Tốc độ tải trang thực tế
    sessionStartTimeRef.current = Date.now();
    lastHeartbeatTimeRef.current = Date.now();

    const getLoadSpeed = (): number => {
      try {
        const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navEntries && navEntries.length > 0) {
          const nav = navEntries[0];
          const dur = nav.duration || (nav.loadEventEnd ? nav.loadEventEnd - nav.startTime : 0);
          if (dur > 30) return Math.round(dur);
        }
        if (window.performance && window.performance.timing) {
          const t = window.performance.timing;
          const dur = (t.loadEventEnd || t.responseEnd || Date.now()) - t.navigationStart;
          if (dur > 30 && dur < 30000) return Math.round(dur);
        }
      } catch {}
      return 0;
    };

    let hasTracked = false;
    const trackPageview = async (speedMs: number = 0) => {
      if (hasTracked) return;
      hasTracked = true;
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitorId,
            path: currentPath,
            device,
            browser,
            os,
            referrer,
            loadSpeedMs: speedMs,
            language,
          }),
        });
      } catch {}
    };

    if (document.readyState === 'complete') {
      trackPageview(getLoadSpeed());
    } else {
      const onWindowLoad = () => {
        setTimeout(() => {
          trackPageview(getLoadSpeed());
        }, 100);
      };
      window.addEventListener('load', onWindowLoad, { once: true });
      setTimeout(() => {
        trackPageview(getLoadSpeed());
      }, 1500);
    }

    // 6. Gửi cập nhật thời lượng xem trang (Session Duration Heartbeat)
    const sendDurationUpdate = (isFinal = false) => {
      const now = Date.now();
      const elapsedSeconds = Math.round((now - lastHeartbeatTimeRef.current) / 1000);
      lastHeartbeatTimeRef.current = now;

      if (elapsedSeconds < 2) return;

      const payload = JSON.stringify({
        visitorId,
        path: currentPath,
        durationIncrementSeconds: elapsedSeconds,
      });

      if (isFinal && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/analytics/track', blob);
      } else {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    };

    // Heartbeat định kỳ mỗi 30 giây khi tab đang active
    const heartbeatInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        sendDurationUpdate(false);
      }
    }, 30000);

    // Bắt sự kiện khi khách chuyển tab hoặc đóng trình duyệt
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendDurationUpdate(true);
      } else {
        lastHeartbeatTimeRef.current = Date.now();
      }
    };

    const handleBeforeUnload = () => {
      sendDurationUpdate(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      clearInterval(heartbeatInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      sendDurationUpdate(true);
    };
  }, [pathname]);

  return null;
}
