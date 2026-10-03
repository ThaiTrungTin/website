import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyToken } from '@/lib/adminAuth';
import { getEmailTemplateConfig } from '@/lib/mailer';

// Lấy cấu hình email hiện tại & Template song ngữ
export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('petmm_admin_session')?.value;
    const currentUser = verifyToken(sessionToken);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Bạn chưa đăng nhập quản trị!' },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('cau_hinh')
      .select('smtp_email, smtp_password, smtp_sender_name, smtp_notify_email, smtp_notify_recruitment_email, smtp_notify_contact_email')
      .eq('id', 'system')
      .maybeSingle();

    if (error) throw error;

    const templateConfig = await getEmailTemplateConfig();
    const { getRecruitmentEmailTemplateConfig } = await import('@/lib/mailer');
    const recruitmentTemplateConfig = await getRecruitmentEmailTemplateConfig();

    return NextResponse.json({
      success: true,
      config: {
        smtp_email: data?.smtp_email || 'thaitrtin@gmail.com',
        smtp_sender_name: data?.smtp_sender_name || 'Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M',
        smtp_notify_email: data?.smtp_notify_email || 'thaitrtin@gmail.com',
        smtp_notify_recruitment_email: data?.smtp_notify_recruitment_email || 'tuyendung@petmm.vn',
        smtp_notify_contact_email: data?.smtp_notify_contact_email || data?.smtp_notify_email || 'thaitrtin@gmail.com',
        hasPassword: Boolean(data?.smtp_password && data.smtp_password.trim().length > 0),
      },
      template: templateConfig,
      recruitmentTemplate: recruitmentTemplateConfig,
    });
  } catch (err: any) {
    console.error('Lỗi GET email-config:', err);
    return NextResponse.json(
      { success: false, message: `Lỗi: ${err.message || 'Không thể tải cấu hình'}` },
      { status: 500 }
    );
  }
}

// Cập nhật cấu hình email SMTP và / hoặc Mẫu Email Template
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
    const {
      smtp_email,
      smtp_password,
      smtp_sender_name,
      smtp_notify_email,
      smtp_notify_recruitment_email,
      smtp_notify_contact_email,
      template,
    } = body;

    // 1. Cập nhật SMTP nếu có trường smtp_email
    if (smtp_email !== undefined) {
      if (!smtp_email || !smtp_email.trim()) {
        return NextResponse.json(
          { success: false, message: 'Vui lòng nhập địa chỉ Gmail gửi thư!' },
          { status: 400 }
        );
      }

      const updatePayload: Record<string, string> = {
        smtp_email: smtp_email.trim(),
        smtp_sender_name: smtp_sender_name?.trim() || 'Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M',
        smtp_notify_email: smtp_notify_email?.trim() || smtp_email.trim(),
        smtp_notify_recruitment_email: smtp_notify_recruitment_email?.trim() || 'tuyendung@petmm.vn',
        smtp_notify_contact_email: smtp_notify_contact_email?.trim() || smtp_notify_email?.trim() || smtp_email.trim(),
      };

      // Chỉ cập nhật mật khẩu nếu người dùng nhập mới
      if (typeof smtp_password === 'string' && smtp_password.trim().length > 0) {
        updatePayload.smtp_password = smtp_password.trim();
      }

      const { error: smtpErr } = await supabaseAdmin
        .from('cau_hinh')
        .update(updatePayload)
        .eq('id', 'system');

      if (smtpErr) throw smtpErr;
    }

    // 2. Cập nhật Template song ngữ nếu có
    if (template) {
      const templatePayload = {
        id: 'email_template',
        hotline: '0364605544',
        logo_favicon: template.logoUrl || null,
        tieu_de_trang: template.subjectVi,
        tieu_de_trang_en: template.subjectEn,
        slogan_dau_trang_tieu_de: template.bannerTitleVi,
        slogan_dau_trang_tieu_de_en: template.bannerTitleEn,
        slogan_dau_trang_noi_dung: template.bannerSubtitleVi,
        slogan_dau_trang_noi_dung_en: template.bannerSubtitleEn,
        gioi_thieu_mo_ta: template.introVi,
        gioi_thieu_mo_ta_en: template.introEn,
        gioi_thieu_cam_ket_phu: template.checklistVi,
        gioi_thieu_cam_ket_phu_en: template.checklistEn,
        gioi_thieu_trich_dan: template.footerVi,
        gioi_thieu_trich_dan_en: template.footerEn,
        slogan_cuoi_trang_noi_dung: JSON.stringify(template),
        ngay_cap_nhat: new Date().toISOString(),
      };

      const { error: tplErr } = await supabaseAdmin
        .from('cau_hinh')
        .upsert(templatePayload);

      if (tplErr) throw tplErr;
    }

    // 3. Cập nhật Recruitment Template song ngữ nếu có
    if (body.recruitmentTemplate) {
      const rec = body.recruitmentTemplate;
      const recPayload = {
        id: 'email_template_recruitment',
        hotline: '0903599339',
        logo_favicon: rec.logoUrl || null,
        tieu_de_trang: rec.subjectVi,
        tieu_de_trang_en: rec.subjectEn,
        slogan_dau_trang_tieu_de: rec.bannerTitleVi,
        slogan_dau_trang_tieu_de_en: rec.bannerTitleEn,
        slogan_dau_trang_noi_dung: rec.bannerSubtitleVi,
        slogan_dau_trang_noi_dung_en: rec.bannerSubtitleEn,
        gioi_thieu_mo_ta: rec.introVi,
        gioi_thieu_mo_ta_en: rec.introEn,
        gioi_thieu_cam_ket_phu: rec.checklistVi,
        gioi_thieu_cam_ket_phu_en: rec.checklistEn,
        gioi_thieu_trich_dan: rec.footerVi,
        gioi_thieu_trich_dan_en: rec.footerEn,
        slogan_cuoi_trang_noi_dung: JSON.stringify(rec),
        ngay_cap_nhat: new Date().toISOString(),
      };

      const { error: recErr } = await supabaseAdmin
        .from('cau_hinh')
        .upsert(recPayload);

      if (recErr) throw recErr;
    }

    return NextResponse.json({
      success: true,
      message: 'Đã lưu cấu hình email và template gửi khách thành công!',
    });
  } catch (err: any) {
    console.error('Lỗi POST email-config:', err);
    return NextResponse.json(
      { success: false, message: `Lỗi: ${err.message || 'Không thể lưu cấu hình'}` },
      { status: 500 }
    );
  }
}
