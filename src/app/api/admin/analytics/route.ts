import { NextRequest, NextResponse } from 'next/server';
import { getWebAnalyticsData, createEmptyAnalyticsData, saveWebAnalyticsData } from '@/lib/analytics';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(_req: NextRequest) {
  try {
    const [analyticsData, bookingsRes] = await Promise.all([
      getWebAnalyticsData(),
      supabaseAdmin.from('lich_hen').select('id, so_dien_thoai, ngay_tao, trang_thai'),
    ]);

    const bookings = bookingsRes.data || [];
    const dateToPhones: Record<string, string[]> = {};
    const allPhonesSet = new Set<string>();

    bookings.forEach((b: any) => {
      // Chuẩn hóa số điện thoại để loại bỏ khoảng trắng hoặc ký tự đặc biệt
      const rawPhone = String(b.so_dien_thoai || '').trim().replace(/\D/g, '');
      const phoneKey = rawPhone.length >= 8 ? rawPhone : (b.id || Math.random().toString());
      allPhonesSet.add(phoneKey);

      if (b.ngay_tao) {
        const vnDate = new Date(new Date(b.ngay_tao).getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10);
        if (!dateToPhones[vnDate]) dateToPhones[vnDate] = [];
        if (!dateToPhones[vnDate].includes(phoneKey)) {
          dateToPhones[vnDate].push(phoneKey);
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: analyticsData,
      bookingsSummary: {
        totalUniqueCustomers: allPhonesSet.size,
        bookingsByDatePhones: dateToPhones,
      },
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    if (action === 'reset_clean') {
      const clean = createEmptyAnalyticsData();
      await saveWebAnalyticsData(clean);
      return NextResponse.json({ success: true, message: 'Đã reset dữ liệu phân tích về 0!', data: clean });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
