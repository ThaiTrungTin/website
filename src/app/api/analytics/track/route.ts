import { NextRequest, NextResponse } from 'next/server';
import { recordAnalyticsEvent } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      visitorId,
      path,
      device,
      browser,
      os,
      durationIncrementSeconds,
      referrer,
    } = body;

    if (!visitorId || typeof visitorId !== 'string') {
      return NextResponse.json({ success: false, message: 'Missing visitorId' }, { status: 400 });
    }

    // Bỏ qua nếu đường dẫn là trang admin
    if (path && typeof path === 'string' && path.startsWith('/admin')) {
      return NextResponse.json({ success: true, ignored: true });
    }

    await recordAnalyticsEvent({
      visitorId,
      path: path || '/',
      device: device || 'mobile',
      browser: browser || 'Other',
      os: os || 'Other',
      durationIncrementSeconds: Number(durationIncrementSeconds) || 0,
      referrer: referrer || 'direct',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
