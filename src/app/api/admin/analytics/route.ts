import { NextRequest, NextResponse } from 'next/server';
import { getWebAnalyticsData, generateInitialSeedData, saveWebAnalyticsData } from '@/lib/analytics';

export async function GET(_req: NextRequest) {
  try {
    const data = await getWebAnalyticsData();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    if (action === 'reset_seed') {
      const seed = generateInitialSeedData();
      await saveWebAnalyticsData(seed);
      return NextResponse.json({ success: true, message: 'Đã tạo lại dữ liệu mẫu phân tích!', data: seed });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
