import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyToken } from '@/lib/adminAuth';
import { DEFAULT_PRIVACY_POLICY, PrivacyPolicyConfig } from '@/types/privacyPolicy';

// 1. GET: Lấy nội dung chính sách quyền riêng tư từ bảng độc lập chinh_sach_bao_mat
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('chinh_sach_bao_mat')
      .select('*')
      .eq('id', 'main')
      .maybeSingle();

    if (error) {
      console.warn('Lỗi đọc chinh_sach_bao_mat từ Supabase:', error.message);
      return NextResponse.json({ success: true, data: DEFAULT_PRIVACY_POLICY });
    }

    if (!data) {
      return NextResponse.json({ success: true, data: DEFAULT_PRIVACY_POLICY });
    }

    return NextResponse.json({
      success: true,
      data: {
        titleVi: data.tieu_de_vi || DEFAULT_PRIVACY_POLICY.titleVi,
        titleEn: data.tieu_de_en || DEFAULT_PRIVACY_POLICY.titleEn,
        contentVi: data.noi_dung_vi || DEFAULT_PRIVACY_POLICY.contentVi,
        contentEn: data.noi_dung_en || DEFAULT_PRIVACY_POLICY.contentEn,
        lastUpdated: data.ngay_cap_nhat || DEFAULT_PRIVACY_POLICY.lastUpdated,
        isActive: data.kich_hoat !== false,
      },
    });
  } catch (err: any) {
    console.error('Lỗi GET privacy-policy API:', err);
    return NextResponse.json({ success: true, data: DEFAULT_PRIVACY_POLICY });
  }
}

// 2. POST: Cập nhật nội dung chính sách vào bảng độc lập chinh_sach_bao_mat
export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('petmm_admin_session')?.value;
    const currentUser = verifyToken(sessionToken);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Bạn chưa đăng nhập quản trị hệ thống!' },
        { status: 401 }
      );
    }

    const body = await req.json();

    const recordToSave = {
      id: 'main',
      tieu_de_vi: (body.titleVi || '').trim() || DEFAULT_PRIVACY_POLICY.titleVi,
      tieu_de_en: (body.titleEn || '').trim() || DEFAULT_PRIVACY_POLICY.titleEn,
      noi_dung_vi: (body.contentVi || '').trim() || DEFAULT_PRIVACY_POLICY.contentVi,
      noi_dung_en: (body.contentEn || '').trim() || DEFAULT_PRIVACY_POLICY.contentEn,
      ngay_cap_nhat: (body.lastUpdated || '').trim() || new Date().toLocaleDateString('vi-VN'),
      kich_hoat: body.isActive !== false,
    };

    const { error: upsertErr } = await supabaseAdmin
      .from('chinh_sach_bao_mat')
      .upsert(recordToSave);

    if (upsertErr) throw upsertErr;

    return NextResponse.json({
      success: true,
      message: 'Đã lưu chính sách quyền riêng tư thành công!',
      data: {
        titleVi: recordToSave.tieu_de_vi,
        titleEn: recordToSave.tieu_de_en,
        contentVi: recordToSave.noi_dung_vi,
        contentEn: recordToSave.noi_dung_en,
        lastUpdated: recordToSave.ngay_cap_nhat,
        isActive: recordToSave.kich_hoat,
      },
    });
  } catch (err: any) {
    console.error('Lỗi POST privacy-policy API:', err);
    return NextResponse.json(
      { success: false, message: `Lỗi lưu chính sách: ${err.message || 'Thao tác thất bại'}` },
      { status: 500 }
    );
  }
}
