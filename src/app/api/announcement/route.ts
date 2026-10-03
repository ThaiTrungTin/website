import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyToken } from '@/lib/adminAuth';

export interface PopupAnnouncementConfig {
  isActive: boolean;
  titleVi: string;
  titleEn: string;
  badgeTextVi: string;
  badgeTextEn: string;
  imageUrl: string;
  imageUrlEn?: string;
  linkUrl?: string;
  btnTextVi?: string;
  btnTextEn?: string;
  autoOpenDelaySeconds?: number;
  updatedAt?: string;
}

export const DEFAULT_ANNOUNCEMENT: PopupAnnouncementConfig = {
  isActive: false,
  titleVi: 'Thông Báo Lịch Trực Tết & Ưu Đãi',
  titleEn: 'Tet Holiday Schedule & Special Offers',
  badgeTextVi: '🧧 Lịch Trực Tết & Ưu Đãi',
  badgeTextEn: '🧧 Tet Schedule & Offers',
  imageUrl: '',
  imageUrlEn: '',
  linkUrl: '#booking',
  btnTextVi: 'Đặt Lịch Khám Ngay',
  btnTextEn: 'Book Appointment Now',
  autoOpenDelaySeconds: 1.2,
};

// 1. GET: Lấy cấu hình thông báo popup cho cả khách xem và trang admin
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('cau_hinh')
      .select('*')
      .eq('id', 'popup_announcement')
      .maybeSingle();

    if (error) {
      console.warn('Lỗi đọc popup_announcement:', error.message);
      return NextResponse.json({ success: true, data: DEFAULT_ANNOUNCEMENT });
    }

    if (!data || !data.slogan_cuoi_trang_noi_dung) {
      return NextResponse.json({ success: true, data: DEFAULT_ANNOUNCEMENT });
    }

    try {
      const parsed = JSON.parse(data.slogan_cuoi_trang_noi_dung);
      return NextResponse.json({
        success: true,
        data: {
          ...DEFAULT_ANNOUNCEMENT,
          ...parsed,
          updatedAt: data.ngay_cap_nhat || parsed.updatedAt,
        },
      });
    } catch {
      return NextResponse.json({ success: true, data: DEFAULT_ANNOUNCEMENT });
    }
  } catch (err: any) {
    console.error('Lỗi GET announcement API:', err);
    return NextResponse.json({ success: true, data: DEFAULT_ANNOUNCEMENT });
  }
}

// 2. POST: Cập nhật cấu hình thông báo (chỉ dành cho Quản trị viên đã đăng nhập)
export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('petmm_admin_session')?.value;
    const currentUser = verifyToken(sessionToken);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Bạn chưa đăng nhập quản trị!' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const configToSave: PopupAnnouncementConfig = {
      isActive: Boolean(body.isActive),
      titleVi: (body.titleVi || '').trim() || DEFAULT_ANNOUNCEMENT.titleVi,
      titleEn: (body.titleEn || '').trim() || DEFAULT_ANNOUNCEMENT.titleEn,
      badgeTextVi: (body.badgeTextVi || '').trim() || DEFAULT_ANNOUNCEMENT.badgeTextVi,
      badgeTextEn: (body.badgeTextEn || '').trim() || DEFAULT_ANNOUNCEMENT.badgeTextEn,
      imageUrl: (body.imageUrl || '').trim(),
      imageUrlEn: (body.imageUrlEn || '').trim(),
      linkUrl: (body.linkUrl || '').trim() || '#booking',
      btnTextVi: (body.btnTextVi || '').trim() || DEFAULT_ANNOUNCEMENT.btnTextVi,
      btnTextEn: (body.btnTextEn || '').trim() || DEFAULT_ANNOUNCEMENT.btnTextEn,
      autoOpenDelaySeconds: typeof body.autoOpenDelaySeconds === 'number' ? body.autoOpenDelaySeconds : 1.2,
      updatedAt: new Date().toISOString(),
    };

    const payload = {
      id: 'popup_announcement',
      tieu_de_trang: configToSave.titleVi,
      tieu_de_trang_en: configToSave.titleEn,
      logo_favicon: configToSave.imageUrl || null,
      slogan_cuoi_trang_noi_dung: JSON.stringify(configToSave),
      ngay_cap_nhat: new Date().toISOString(),
    };

    const { error: upsertErr } = await supabaseAdmin
      .from('cau_hinh')
      .upsert(payload);

    if (upsertErr) throw upsertErr;

    return NextResponse.json({
      success: true,
      message: 'Đã lưu cấu hình thông báo popup & huy hiệu thành công!',
      data: configToSave,
    });
  } catch (err: any) {
    console.error('Lỗi POST announcement API:', err);
    return NextResponse.json(
      { success: false, message: `Lỗi lưu thông báo: ${err.message || 'Thao tác thất bại'}` },
      { status: 500 }
    );
  }
}
