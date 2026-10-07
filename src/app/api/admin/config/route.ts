import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyToken } from '@/lib/adminAuth';

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

    // Whitelist các trường được phép cập nhật trong cau_hinh
    const ALLOWED_FIELDS = new Set([
      'hotline', 'hotline_hien_thi', 'link_zalo', 'link_facebook', 'link_messenger',
      'email', 'dia_chi_chinh', 'slogan_dau_trang_tieu_de', 'slogan_dau_trang_noi_dung',
      'slogan_cuoi_trang_tieu_de', 'slogan_cuoi_trang_noi_dung', 'giay_phep',
      'gioi_thieu_huy_hieu', 'gioi_thieu_tieu_de_1', 'gioi_thieu_tieu_de_2', 'gioi_thieu_mo_ta',
      'gioi_thieu_cam_ket_tieu_de', 'gioi_thieu_cam_ket_phu', 'gioi_thieu_trich_dan',
      'gioi_thieu_bac_si_ten', 'gioi_thieu_bac_si_chuc_danh',
      'thong_ke_nam_thanh_lap', 'thong_ke_nam_thanh_lap_nhan', 'thong_ke_khach_hang', 'thong_ke_khach_hang_nhan',
      'link_tiktok', 'logo_favicon',
      'gioi_thieu_huy_hieu_en', 'gioi_thieu_tieu_de_1_en', 'gioi_thieu_tieu_de_2_en', 'gioi_thieu_mo_ta_en',
      'gioi_thieu_cam_ket_tieu_de_en', 'gioi_thieu_cam_ket_phu_en', 'gioi_thieu_trich_dan_en',
      'gioi_thieu_bac_si_ten_en', 'gioi_thieu_bac_si_chuc_danh_en',
      'thong_ke_nam_thanh_lap_nhan_en', 'thong_ke_khach_hang_nhan_en',
      'slogan_cuoi_trang_tieu_de_en', 'slogan_cuoi_trang_noi_dung_en',
      'tieu_de_trang', 'tieu_de_trang_en',
      'slogan_dau_trang_tieu_de_en', 'slogan_dau_trang_noi_dung_en',
      'hero_nut_1_text', 'hero_nut_1_text_en', 'hero_nut_1_link', 'hero_nut_1_hien_thi',
      'hero_nut_2_text', 'hero_nut_2_text_en', 'hero_nut_2_link', 'hero_nut_2_hien_thi',
      'section_chi_nhanh_tieu_de', 'section_chi_nhanh_mo_ta',
      'section_chi_nhanh_tieu_de_en', 'section_chi_nhanh_mo_ta_en',
      'section_gioi_thieu_tieu_de', 'section_gioi_thieu_mo_ta',
      'section_gioi_thieu_tieu_de_en', 'section_gioi_thieu_mo_ta_en',
      'section_dich_vu_tieu_de', 'section_dich_vu_mo_ta',
      'section_dich_vu_tieu_de_en', 'section_dich_vu_mo_ta_en',
      'section_cam_nang_tieu_de', 'section_cam_nang_mo_ta',
      'section_cam_nang_tieu_de_en', 'section_cam_nang_mo_ta_en',
      'section_faq_tieu_de', 'section_faq_mo_ta',
      'section_faq_tieu_de_en', 'section_faq_mo_ta_en',
      'section_ho_tro_tieu_de', 'section_ho_tro_mo_ta',
      'section_ho_tro_tieu_de_en', 'section_ho_tro_mo_ta_en',
      'section_danh_gia_tieu_de', 'section_danh_gia_mo_ta',
      'section_danh_gia_tieu_de_en', 'section_danh_gia_mo_ta_en',
      'section_tuyen_dung_tieu_de', 'section_tuyen_dung_mo_ta',
      'section_tuyen_dung_tieu_de_en', 'section_tuyen_dung_mo_ta_en',
      'section_dat_lich_tieu_de', 'section_dat_lich_mo_ta',
      'section_dat_lich_tieu_de_en', 'section_dat_lich_mo_ta_en',
      'hero_slogan_x_desktop', 'hero_slogan_y_desktop', 'hero_slogan_align_desktop',
      'hero_slogan_x_mobile', 'hero_slogan_y_mobile', 'hero_slogan_align_mobile',
      'smtp_email', 'smtp_sender_name', 'smtp_notify_email', 'smtp_notify_recruitment_email',
      'smtp_notify_contact_email', 'zalo_oa_id', 'zalo_app_id', 'zalo_template_id', 'zalo_enabled'
    ]);

    const payload: Record<string, any> = {
      ngay_cap_nhat: new Date().toISOString(),
    };

    for (const key of Object.keys(body)) {
      if (ALLOWED_FIELDS.has(key)) {
        payload[key] = body[key];
      }
    }

    const { data, error } = await supabaseAdmin
      .from('cau_hinh')
      .update(payload)
      .eq('id', 'system')
      .select();

    if (error) {
      console.error('Lỗi cập nhật cấu hình qua admin API:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Lỗi API cập nhật cấu hình:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Lỗi máy chủ' },
      { status: 500 }
    );
  }
}
