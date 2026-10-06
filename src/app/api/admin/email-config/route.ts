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

    const { getNotificationSettings, DEFAULT_NOTIFICATION_SETTINGS } = await import('@/lib/notificationSettings');
    const [systemRes, notifySettings] = await Promise.all([
      supabaseAdmin
        .from('cau_hinh')
        .select('smtp_email, smtp_password, smtp_sender_name, smtp_notify_email, smtp_notify_recruitment_email, smtp_notify_contact_email, zalo_oa_id, zalo_app_id, zalo_secret_key, zalo_template_id, zalo_enabled')
        .eq('id', 'system')
        .maybeSingle(),
      getNotificationSettings().catch(() => DEFAULT_NOTIFICATION_SETTINGS),
    ]);

    if (systemRes.error) throw systemRes.error;
    const data = systemRes.data;

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
        email_enabled: notifySettings.email_enabled,
        email_booking_mode: notifySettings.email_booking_mode,
        email_recruitment_enabled: notifySettings.email_recruitment_enabled,
      },
      zalo: {
        zalo_oa_id: data?.zalo_oa_id || '',
        zalo_app_id: data?.zalo_app_id || '',
        zalo_secret_key: data?.zalo_secret_key || '',
        zalo_template_id: data?.zalo_template_id || '',
        zalo_review_template_id: notifySettings.zalo_review_template_id || '',
        zalo_enabled: Boolean(data?.zalo_enabled),
        zalo_booking_enabled: notifySettings.zalo_booking_enabled,
        zalo_review_enabled: notifySettings.zalo_review_enabled,
        zalo_access_token: notifySettings.zalo_access_token || '',
        zalo_refresh_token: notifySettings.zalo_refresh_token || '',
        zalo_test_phone: notifySettings.zalo_test_phone || '',
      },
      antiSpam: {
        spam_limit_enabled: notifySettings.spam_limit_enabled !== undefined ? Boolean(notifySettings.spam_limit_enabled) : true,
        spam_limit_ip: notifySettings.spam_limit_ip !== undefined ? Boolean(notifySettings.spam_limit_ip) : true,
        spam_limit_phone: notifySettings.spam_limit_phone !== undefined ? Boolean(notifySettings.spam_limit_phone) : true,
        spam_limit_email: notifySettings.spam_limit_email !== undefined ? Boolean(notifySettings.spam_limit_email) : true,
        spam_max_bookings_per_day: typeof notifySettings.spam_max_bookings_per_day === 'number' ? notifySettings.spam_max_bookings_per_day : 3,
        spam_cooldown_seconds: typeof notifySettings.spam_cooldown_seconds === 'number' ? notifySettings.spam_cooldown_seconds : 15,
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
      email_enabled,
      email_booking_mode,
      email_recruitment_enabled,
      template,
    } = body;

    const { saveNotificationSettings } = await import('@/lib/notificationSettings');

    // 1. Cập nhật SMTP nếu có trường smtp_email
    if (smtp_email !== undefined) {
      if (!smtp_email || !smtp_email.trim()) {
        return NextResponse.json(
          { success: false, message: 'Vui lòng nhập địa chỉ Gmail gửi thư!' },
          { status: 400 }
        );
      }

      const updatePayload: Record<string, any> = {
        smtp_email: smtp_email.trim(),
        smtp_sender_name: smtp_sender_name?.trim() || 'Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M',
        smtp_notify_email: smtp_notify_email?.trim() || smtp_email.trim(),
        smtp_notify_recruitment_email: smtp_notify_recruitment_email?.trim() || 'tuyendung@petmm.vn',
        smtp_notify_contact_email: smtp_notify_contact_email?.trim() || smtp_notify_email?.trim() || smtp_email.trim(),
      };

      if (typeof smtp_password === 'string' && smtp_password.trim().length > 0) {
        updatePayload.smtp_password = smtp_password.trim();
      }

      const { error: smtpErr } = await supabaseAdmin
        .from('cau_hinh')
        .update(updatePayload)
        .eq('id', 'system');

      if (smtpErr) throw smtpErr;
    }

    // 1.2. Cập nhật cờ email notification settings
    const emailNotifyUpdates: Record<string, any> = {};
    if (email_enabled !== undefined) emailNotifyUpdates.email_enabled = Boolean(email_enabled);
    if (email_booking_mode !== undefined) emailNotifyUpdates.email_booking_mode = email_booking_mode;
    if (email_recruitment_enabled !== undefined) emailNotifyUpdates.email_recruitment_enabled = Boolean(email_recruitment_enabled);

    if (Object.keys(emailNotifyUpdates).length > 0) {
      await saveNotificationSettings(emailNotifyUpdates);
    }

    // 1.5. Cập nhật cấu hình Zalo OA (ZNS) nếu có
    if (body.zalo !== undefined || body.zalo_oa_id !== undefined || body.zalo_enabled !== undefined) {
      const zaloData = body.zalo || body;
      const zaloPayload: Record<string, any> = {};
      if (zaloData.zalo_oa_id !== undefined) zaloPayload.zalo_oa_id = String(zaloData.zalo_oa_id || '').trim();
      if (zaloData.zalo_app_id !== undefined) zaloPayload.zalo_app_id = String(zaloData.zalo_app_id || '').trim();
      if (zaloData.zalo_secret_key !== undefined) zaloPayload.zalo_secret_key = String(zaloData.zalo_secret_key || '').trim();
      if (zaloData.zalo_template_id !== undefined) zaloPayload.zalo_template_id = String(zaloData.zalo_template_id || '').trim();
      if (zaloData.zalo_enabled !== undefined) zaloPayload.zalo_enabled = Boolean(zaloData.zalo_enabled);

      if (Object.keys(zaloPayload).length > 0) {
        const { error: zaloErr } = await supabaseAdmin
          .from('cau_hinh')
          .update(zaloPayload)
          .eq('id', 'system');
        if (zaloErr) throw zaloErr;
      }

      const zaloNotifyUpdates: Record<string, any> = {};
      if (zaloData.zalo_review_template_id !== undefined) zaloNotifyUpdates.zalo_review_template_id = String(zaloData.zalo_review_template_id || '').trim();
      if (zaloData.zalo_booking_enabled !== undefined) zaloNotifyUpdates.zalo_booking_enabled = Boolean(zaloData.zalo_booking_enabled);
      if (zaloData.zalo_review_enabled !== undefined) zaloNotifyUpdates.zalo_review_enabled = Boolean(zaloData.zalo_review_enabled);
      if (zaloData.zalo_access_token !== undefined) zaloNotifyUpdates.zalo_access_token = String(zaloData.zalo_access_token || '').trim();
      if (zaloData.zalo_refresh_token !== undefined) zaloNotifyUpdates.zalo_refresh_token = String(zaloData.zalo_refresh_token || '').trim();
      if (zaloData.zalo_test_phone !== undefined) zaloNotifyUpdates.zalo_test_phone = String(zaloData.zalo_test_phone || '').trim();

      if (Object.keys(zaloNotifyUpdates).length > 0) {
        await saveNotificationSettings(zaloNotifyUpdates);
      }
    }

    // 1.8. Cập nhật cấu hình Chống Spam Đặt Lịch (IP, SĐT, Email) nếu có
    if (body.antiSpam !== undefined || body.spam_limit_enabled !== undefined) {
      const spamData = body.antiSpam || body;
      const spamUpdates: Record<string, any> = {};
      if (spamData.spam_limit_enabled !== undefined) spamUpdates.spam_limit_enabled = Boolean(spamData.spam_limit_enabled);
      if (spamData.spam_limit_ip !== undefined) spamUpdates.spam_limit_ip = Boolean(spamData.spam_limit_ip);
      if (spamData.spam_limit_phone !== undefined) spamUpdates.spam_limit_phone = Boolean(spamData.spam_limit_phone);
      if (spamData.spam_limit_email !== undefined) spamUpdates.spam_limit_email = Boolean(spamData.spam_limit_email);
      if (spamData.spam_max_bookings_per_day !== undefined) {
        const parsed = parseInt(String(spamData.spam_max_bookings_per_day), 10);
        if (!isNaN(parsed) && parsed > 0) spamUpdates.spam_max_bookings_per_day = parsed;
      }
      if (spamData.spam_cooldown_seconds !== undefined) {
        const parsed = parseInt(String(spamData.spam_cooldown_seconds), 10);
        if (!isNaN(parsed) && parsed >= 0) spamUpdates.spam_cooldown_seconds = parsed;
      }

      if (Object.keys(spamUpdates).length > 0) {
        await saveNotificationSettings(spamUpdates);
      }
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
