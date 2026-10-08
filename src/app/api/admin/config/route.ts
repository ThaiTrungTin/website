import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyToken } from '@/lib/adminAuth';
import { logAuditServer } from '@/lib/auditLogger';

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
      'smtp_notify_contact_email', 'zalo_oa_id', 'zalo_app_id', 'zalo_template_id', 'zalo_enabled',
      'logo_website'
    ]);

    // Các trường tiêu đề động không nằm trong các cột gốc của bảng cau_hinh row 'system'
    const EXTRA_SECTION_FIELDS = new Set([
      'logo_website',
      'section_tuyen_dung_tieu_de', 'section_tuyen_dung_mo_ta',
      'section_tuyen_dung_tieu_de_en', 'section_tuyen_dung_mo_ta_en',
      'section_dat_lich_tieu_de', 'section_dat_lich_mo_ta',
      'section_dat_lich_tieu_de_en', 'section_dat_lich_mo_ta_en',
      'section_ho_tro_tieu_de', 'section_ho_tro_mo_ta',
      'section_ho_tro_tieu_de_en', 'section_ho_tro_mo_ta_en',
      'section_danh_gia_tieu_de', 'section_danh_gia_mo_ta',
      'section_danh_gia_tieu_de_en', 'section_danh_gia_mo_ta_en',
    ]);

    const systemPayload: Record<string, any> = {
      ngay_cap_nhat: new Date().toISOString(),
    };
    const extraPayload: Record<string, any> = {};

    for (const key of Object.keys(body)) {
      if (EXTRA_SECTION_FIELDS.has(key)) {
        extraPayload[key] = body[key];
      } else if (ALLOWED_FIELDS.has(key)) {
        systemPayload[key] = body[key];
      }
    }

    let extraMergedData: Record<string, any> = {};

    // 1. Nếu có các trường tiêu đề mở rộng, lưu an toàn vào hàng extra_section_titles
    if (Object.keys(extraPayload).length > 0) {
      try {
        const { data: existingExtra } = await supabaseAdmin
          .from('cau_hinh')
          .select('slogan_cuoi_trang_noi_dung')
          .eq('id', 'extra_section_titles')
          .maybeSingle();

        if (existingExtra?.slogan_cuoi_trang_noi_dung) {
          try {
            extraMergedData = JSON.parse(existingExtra.slogan_cuoi_trang_noi_dung) || {};
          } catch {}
        }
        Object.assign(extraMergedData, extraPayload);

        await supabaseAdmin
          .from('cau_hinh')
          .upsert({
            id: 'extra_section_titles',
            slogan_cuoi_trang_noi_dung: JSON.stringify(extraMergedData),
            ngay_cap_nhat: new Date().toISOString(),
          });
      } catch (errExtra) {
        console.error('Lỗi lưu extra_section_titles:', errExtra);
      }
    }

    // 2. Nếu có các trường thuộc về hàng 'system', cập nhật hàng 'system'
    let systemData = null;
    const systemKeys = Object.keys(systemPayload).filter((k) => k !== 'ngay_cap_nhat');

    if (systemKeys.length > 0) {
      const { data, error } = await supabaseAdmin
        .from('cau_hinh')
        .update(systemPayload)
        .eq('id', 'system')
        .select();

      if (error) {
        console.error('Lỗi cập nhật cấu hình qua admin API:', error);
        // Nếu đã lưu được extraPayload thì vẫn trả về thành công kèm cảnh báo
        if (Object.keys(extraPayload).length > 0) {
          return NextResponse.json({ success: true, data: extraMergedData });
        }
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        );
      }
      systemData = data;
    }

    // Ghi nhật ký hoạt động
    const changedFields = [
      ...Object.keys(systemPayload).filter((k) => k !== 'ngay_cap_nhat'),
      ...Object.keys(extraPayload),
    ];
    if (changedFields.length > 0) {
      const fieldLabels: Record<string, string> = {
        hotline: 'Hotline',
        hotline_hien_thi: 'Hotline hiển thị',
        link_zalo: 'Link Zalo',
        link_facebook: 'Facebook',
        link_messenger: 'Messenger',
        email: 'Email liên hệ',
        dia_chi_chinh: 'Địa chỉ chính',
        slogan_dau_trang_noi_dung: 'Slogan đầu trang',
        slogan_cuoi_trang_noi_dung: 'Slogan cuối trang',
        smtp_email: 'SMTP Email',
        zalo_oa_id: 'Zalo OA',
      };
      const summaryLabels =
        changedFields
          .slice(0, 3)
          .map((k) => fieldLabels[k] || k)
          .join(', ') + (changedFields.length > 3 ? ` và ${changedFields.length - 3} mục khác` : '');

      await logAuditServer({
        nguoi_thuc_hien: currentUser.ho_ten || currentUser.username,
        vai_tro: currentUser.vai_tro,
        hanh_dong: 'CAU_HINH',
        chuyen_muc: 'Cấu hình',
        chi_tiet: `Cập nhật cài đặt hệ thống (${summaryLabels})`,
        du_lieu_thay_doi: { fields: changedFields },
      });
    }

    try {
      revalidatePath('/');
    } catch {}

    return NextResponse.json({
      success: true,
      data: systemData || extraMergedData,
    });
  } catch (err: any) {
    console.error('Lỗi API cập nhật cấu hình:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Lỗi máy chủ' },
      { status: 500 }
    );
  }
}
