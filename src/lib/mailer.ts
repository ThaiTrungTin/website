import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { logNotification } from './notificationLogger';

export interface SmtpConfig {
  smtp_email: string;
  smtp_password?: string;
  smtp_sender_name: string;
  smtp_notify_email: string; // Email nhận thông báo đặt lịch khám
  smtp_notify_recruitment_email?: string; // Email nhận hồ sơ tuyển dụng & CV
  smtp_notify_contact_email?: string; // Email nhận góp ý & liên hệ chung
  // Cài đặt bật / tắt chi tiết
  email_enabled?: boolean; // Bật / Tắt tất cả email
  email_booking_mode?: 'always' | 'on_zalo_fail' | 'disabled'; // Luôn luôn / Khi Zalo lỗi / Tắt
  email_recruitment_enabled?: boolean; // Xác nhận ứng viên (Bật / Tắt)
}

export interface EmailTemplateConfig {
  logoUrl?: string;
  // Tiếng Việt
  subjectVi: string;
  bannerTitleVi: string;
  bannerSubtitleVi: string;
  introVi: string;
  checklistVi: string;
  footerVi: string;
  // Tiếng Anh
  subjectEn: string;
  bannerTitleEn: string;
  bannerSubtitleEn: string;
  introEn: string;
  checklistEn: string;
  footerEn: string;
}

export const DEFAULT_EMAIL_TEMPLATE: EmailTemplateConfig = {
  logoUrl: '',
  // TIẾNG VIỆT
  subjectVi: '[PetM&M] Xác Nhận Lịch Hẹn #{booking_code} cho bé {pet_name}',
  bannerTitleVi: 'Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M',
  bannerSubtitleVi: 'Phiếu Tiếp Nhận Lịch Hẹn Khám & Chăm Sóc',
  introVi: 'Cảm ơn bạn đã tin tưởng đặt lịch thăm khám cho bé <strong>{pet_name}</strong> tại Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M. Đội ngũ y bác sĩ đã tiếp nhận thông tin và sẵn sàng hỗ trợ chu đáo nhất.',
  checklistVi: `• Vui lòng đến trước 5 - 10 phút để bé được kiểm tra sinh hiệu ban đầu.
• Ba mẹ nhớ đeo xích hoặc dùng túi/balo vận chuyển cho bé để đảm bảo an toàn.
• Nếu cần xét nghiệm máu hoặc phẫu thuật, vui lòng nhịn ăn cho bé trước 6 - 8 tiếng.`,
  footerVi: 'Nếu cần thay đổi giờ hẹn hoặc cần tư vấn khẩn cấp, vui lòng liên hệ ngay:',

  // TIẾNG ANH
  subjectEn: '[PetM&M] Appointment Confirmed - Code #{booking_code} for {pet_name}',
  bannerTitleEn: 'PetM&M Veterinary Clinic & Animal Hospital',
  bannerSubtitleEn: 'Appointment Booking Receipt',
  introEn: 'Thank you for booking an appointment for <strong>{pet_name}</strong> at PetM&M Pet Hospital Clinic. Our veterinary team has received your request and is ready to provide the best care.',
  checklistEn: `• Please arrive 5-10 minutes prior to your time slot for check-in.
• Please leash dogs or keep cats in carriers for maximum safety.
• If your pet needs fasting for blood tests or surgery, please refrain from feeding 6-8 hours in advance.`,
  footerEn: 'If you need to change your appointment or have an urgent query, please call our 24/7 hotline:',
};

// Lấy cấu hình Template email từ bảng cau_hinh
export async function getEmailTemplateConfig(): Promise<EmailTemplateConfig> {
  try {
    const { data, error } = await supabaseAdmin
      .from('cau_hinh')
      .select('*')
      .eq('id', 'email_template')
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_EMAIL_TEMPLATE;
    }

    if (data.slogan_cuoi_trang_noi_dung) {
      try {
        const parsed = JSON.parse(data.slogan_cuoi_trang_noi_dung);
        return {
          ...DEFAULT_EMAIL_TEMPLATE,
          ...parsed,
        };
      } catch {}
    }

    return {
      logoUrl: data.logo_favicon || DEFAULT_EMAIL_TEMPLATE.logoUrl,
      subjectVi: data.tieu_de_trang || DEFAULT_EMAIL_TEMPLATE.subjectVi,
      bannerTitleVi: data.slogan_dau_trang_tieu_de || DEFAULT_EMAIL_TEMPLATE.bannerTitleVi,
      bannerSubtitleVi: data.slogan_dau_trang_noi_dung || DEFAULT_EMAIL_TEMPLATE.bannerSubtitleVi,
      introVi: data.gioi_thieu_mo_ta || DEFAULT_EMAIL_TEMPLATE.introVi,
      checklistVi: data.gioi_thieu_cam_ket_phu || DEFAULT_EMAIL_TEMPLATE.checklistVi,
      footerVi: data.gioi_thieu_trich_dan || DEFAULT_EMAIL_TEMPLATE.footerVi,

      subjectEn: data.tieu_de_trang_en || DEFAULT_EMAIL_TEMPLATE.subjectEn,
      bannerTitleEn: data.slogan_dau_trang_tieu_de_en || DEFAULT_EMAIL_TEMPLATE.bannerTitleEn,
      bannerSubtitleEn: data.slogan_dau_trang_noi_dung_en || DEFAULT_EMAIL_TEMPLATE.bannerSubtitleEn,
      introEn: data.gioi_thieu_mo_ta_en || DEFAULT_EMAIL_TEMPLATE.introEn,
      checklistEn: data.gioi_thieu_cam_ket_phu_en || DEFAULT_EMAIL_TEMPLATE.checklistEn,
      footerEn: data.gioi_thieu_trich_dan_en || DEFAULT_EMAIL_TEMPLATE.footerEn,
    };
  } catch (err) {
    console.error('Lỗi đọc cấu hình template email:', err);
    return DEFAULT_EMAIL_TEMPLATE;
  }
}

// CẤU HÌNH MẪU THƯ XÁC NHẬN TIẾP NHẬN ỨNG TUYỂN (SONG NGỮ)
export interface RecruitmentEmailTemplateConfig {
  logoUrl?: string;
  subjectVi: string;
  bannerTitleVi: string;
  bannerSubtitleVi: string;
  introVi: string;
  checklistVi: string;
  footerVi: string;
  subjectEn: string;
  bannerTitleEn: string;
  bannerSubtitleEn: string;
  introEn: string;
  checklistEn: string;
  footerEn: string;
}

export const DEFAULT_RECRUITMENT_TEMPLATE: RecruitmentEmailTemplateConfig = {
  logoUrl: '',
  // TIẾNG VIỆT
  subjectVi: '[PetM&M] Xác Nhận Đã Nhận Hồ Sơ Ứng Tuyển: {job_title}',
  bannerTitleVi: 'Hệ Thống Y Tế & Bệnh Viện Thú Y PetM&M',
  bannerSubtitleVi: 'Phiếu Tiếp Nhận Hồ Sơ Ứng Tuyển & CV',
  introVi: 'Cảm ơn bạn <strong>{candidate_name}</strong> đã quan tâm và nộp hồ sơ ứng tuyển vị trí <strong>{job_title}</strong> tại Bệnh Viện Thú Y PetM&M. Ban Nhân Sự đã tiếp nhận đầy đủ thông tin của bạn.',
  checklistVi: `• Ban Nhân Sự sẽ cẩn trọng đánh giá hồ sơ và liên hệ với các ứng viên phù hợp qua điện thoại hoặc Zalo trong vòng 24 – 48 giờ làm việc.
• Vui lòng chú ý điện thoại để không bỏ lỡ lịch hẹn phỏng vấn.
• Mọi thắc mắc về tuyển dụng có thể liên hệ trực tiếp Hotline Tuyển Dụng: 0903 599 339.`,
  footerVi: 'Trân trọng,\nBan Nhân Sự & Tuyển Dụng Bệnh Viện Thú Y PetM&M',

  // TIẾNG ANH
  subjectEn: '[PetM&M] Application Received: {job_title}',
  bannerTitleEn: 'PetM&M Veterinary Hospital System',
  bannerSubtitleEn: 'Application & CV Receipt Confirmation',
  introEn: 'Dear <strong>{candidate_name}</strong>, thank you for your interest and applying for the position of <strong>{job_title}</strong> at PetM&M Veterinary Hospital. Our HR Department has successfully received your application.',
  checklistEn: `• Our HR team will carefully review your credentials and reach out within 24 – 48 business hours via phone or Zalo.
• Please keep your phone available for interview arrangements.
• For urgent recruitment queries, contact Hotline: 0903 599 339.`,
  footerEn: 'Best regards,\nHR & Talent Acquisition Team, PetM&M Veterinary Hospital',
};

// Lấy cấu hình Template thư tuyển dụng từ bảng cau_hinh
export async function getRecruitmentEmailTemplateConfig(): Promise<RecruitmentEmailTemplateConfig> {
  try {
    const { data, error } = await supabaseAdmin
      .from('cau_hinh')
      .select('*')
      .eq('id', 'email_template_recruitment')
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_RECRUITMENT_TEMPLATE;
    }

    if (data.slogan_cuoi_trang_noi_dung) {
      try {
        const parsed = JSON.parse(data.slogan_cuoi_trang_noi_dung);
        return {
          ...DEFAULT_RECRUITMENT_TEMPLATE,
          ...parsed,
        };
      } catch {}
    }

    return DEFAULT_RECRUITMENT_TEMPLATE;
  } catch (err) {
    console.error('Lỗi đọc cấu hình recruitment template:', err);
    return DEFAULT_RECRUITMENT_TEMPLATE;
  }
}

// Lấy cấu hình SMTP từ bảng cau_hinh
export async function getSmtpConfig(): Promise<SmtpConfig> {
  try {
    const { getNotificationSettings } = await import('./notificationSettings');
    const [dbRes, secretRes, notifySettings] = await Promise.all([
      supabaseAdmin
        .from('cau_hinh')
        .select('smtp_email, smtp_sender_name, smtp_notify_email, smtp_notify_recruitment_email, smtp_notify_contact_email')
        .eq('id', 'system')
        .maybeSingle(),
      supabaseAdmin
        .from('cau_hinh_bi_mat')
        .select('smtp_password, smtp_email')
        .eq('id', 'system')
        .maybeSingle(),
      getNotificationSettings().catch(() => null),
    ]);

    const data = dbRes.data;
    const secretData = secretRes.data;

    return {
      smtp_email: secretData?.smtp_email || data?.smtp_email || 'thaitrtin@gmail.com',
      smtp_password: secretData?.smtp_password || '',
      smtp_sender_name: data?.smtp_sender_name || 'Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M',
      smtp_notify_email: data?.smtp_notify_email || 'thaitrtin@gmail.com',
      smtp_notify_recruitment_email: data?.smtp_notify_recruitment_email || 'tuyendung@petmm.vn',
      smtp_notify_contact_email: data?.smtp_notify_contact_email || data?.smtp_notify_email || 'thaitrtin@gmail.com',
      email_enabled: notifySettings?.email_enabled !== undefined ? Boolean(notifySettings.email_enabled) : true,
      email_booking_mode: (notifySettings?.email_booking_mode as any) || 'always',
      email_recruitment_enabled: notifySettings?.email_recruitment_enabled !== undefined ? Boolean(notifySettings.email_recruitment_enabled) : true,
    };
  } catch (err) {
    console.error('Lỗi đọc cấu hình SMTP:', err);
    return {
      smtp_email: 'thaitrtin@gmail.com',
      smtp_password: '',
      smtp_sender_name: 'Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M',
      smtp_notify_email: 'thaitrtin@gmail.com',
      smtp_notify_recruitment_email: 'tuyendung@petmm.vn',
      smtp_notify_contact_email: 'thaitrtin@gmail.com',
      email_enabled: true,
      email_booking_mode: 'always',
      email_recruitment_enabled: true,
    };
  }
}

// Chuyển định dạng ngày YYYY-MM-DD sang dd/mm/yyyy
export function formatDateDMY(dateStr: string): string {
  if (!dateStr) return '';
  return dateStr.replace(/(\d{4})-(\d{2})-(\d{2})/g, '$3/$2/$1');
}

// Tạo transporter gửi mail
export async function createMailerTransport(overrideConfig?: Partial<SmtpConfig>) {
  const baseConfig = await getSmtpConfig();
  const config: SmtpConfig = {
    ...baseConfig,
    ...overrideConfig,
  };

  if (!config.smtp_password || !config.smtp_password.trim()) {
    throw new Error('Chưa cấu hình Mật khẩu ứng dụng Google (App Password). Vui lòng thiết lập trong trang Admin!');
  }

  // Loại bỏ khoảng trắng nếu người dùng copy dạng "abcd efgh ijkl mnop"
  const cleanPassword = config.smtp_password.replace(/\s+/g, '');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.smtp_email.trim(),
      pass: cleanPassword,
    },
  });

  return { transporter, config };
}

// Helper thay thế các biến động {booking_code}, {pet_name}, {owner_name}...
function replacePlaceholders(template: string, data: Record<string, string>): string {
  if (!template) return '';
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'gi'), value || '');
  }
  return result;
}

// Gửi email chung
export async function sendMail({
  to,
  subject,
  html,
  text,
  attachments,
  overrideConfig,
  loaiTin = 'khac',
  tenNguoiNhan,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: any[];
  overrideConfig?: Partial<SmtpConfig>;
  loaiTin?: 'dat_lich' | 'danh_gia' | 'tuyen_dung' | 'xac_thuc' | 'test' | 'khac';
  tenNguoiNhan?: string;
}) {
  try {
    const cleanTo = (to || '').trim().toLowerCase();
    const typoDomains = ['@gma.com', '@gmai.com', '@gamil.com', '@gm.com', '@gmeil.com', '@yaho.com', '@hotmial.com', '@outlok.com'];
    const matchedTypo = typoDomains.find((d) => cleanTo.endsWith(d));
    if (matchedTypo) {
      throw new Error(`Địa chỉ email không hợp lệ (sai tên miền "${matchedTypo.replace('@', '')}", có thể bạn muốn nhập @gmail.com)`);
    }

    const { transporter, config } = await createMailerTransport(overrideConfig);

    const senderString = `"${config.smtp_sender_name}" <${config.smtp_email.trim()}>`;

    const info = await transporter.sendMail({
      from: senderString,
      to,
      subject,
      text: text || subject,
      html,
      attachments,
    });

    console.log(`[SMTP Mailer] Đã gửi thư tới ${to} - MessageID: ${info.messageId} - Phản hồi: ${info.response}`);

    await logNotification({
      kenh: 'email',
      loai_tin: loaiTin,
      nguoi_nhan: to,
      ten_nguoi_nhan: tenNguoiNhan,
      tieu_de: subject,
      trang_thai: 'thanh_cong',
      phan_hoi: { messageId: info.messageId, response: info.response },
    });

    return info;
  } catch (err: any) {
    console.error(`[SMTP Mailer] Lỗi gửi thư tới ${to}:`, err);
    await logNotification({
      kenh: 'email',
      loai_tin: loaiTin,
      nguoi_nhan: to,
      ten_nguoi_nhan: tenNguoiNhan,
      tieu_de: subject,
      trang_thai: 'that_bai',
      ma_loi: err.code || 'SMTP_ERROR',
      chi_tiet_loi: err.message || 'Lỗi gửi email qua máy chủ SMTP',
    });
    throw err;
  }
}

// GỬI EMAIL MÃ OTP ĐẶT LẠI MẬT KHẨU
export async function sendOtpEmail(toEmail: string, otpCode: string) {
  let hotline = '0364 605 566';
  try {
    const { data: config } = await supabaseAdmin
      .from('cau_hinh')
      .select('hotline, hotline_hien_thi')
      .eq('id', 'system')
      .maybeSingle();
    if (config?.hotline_hien_thi || config?.hotline) {
      hotline = (config.hotline_hien_thi || config.hotline).trim();
    }
  } catch {}

  const subject = `[PetM&M] Mã xác thực OTP đặt lại mật khẩu: ${otpCode}`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Mã Xác Thực PetM&M</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 16px 8px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="520px" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
            <!-- Header Banner -->
            <tr>
              <td style="background: #1e3f1b; padding: 24px 20px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 700;">Bệnh Viện Thú Y PetM&amp;M</h1>
                <p style="margin: 6px 0 0 0; color: #cbd5e1; font-size: 13px;">Mã xác thực đổi mật khẩu</p>
              </td>
            </tr>

            <!-- Content Body -->
            <tr>
              <td style="padding: 24px 20px;">
                <p style="margin: 0 0 14px 0; font-size: 14px; color: #334155; line-height: 1.5;">
                  Xin chào <strong>Quản Trị Viên</strong>,
                </p>
                <p style="margin: 0 0 18px 0; font-size: 14px; color: #475569; line-height: 1.5;">
                  Hệ thống nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${toEmail}</strong>. Mã xác thực (OTP) của bạn là:
                </p>

                <!-- OTP Display Box -->
                <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; text-align: center; margin: 18px 0;">
                  <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">MÃ XÁC THỰC</div>
                  <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #2D5A27; font-family: monospace;">
                    ${otpCode}
                  </div>
                  <div style="font-size: 12px; color: #64748b; margin-top: 6px;">
                    Mã có hiệu lực trong 15 phút.
                  </div>
                </div>

                <div style="padding: 10px 14px; background-color: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 18px;">
                  <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.4;">
                    Lưu ý: Không chia sẻ mã này cho bất kỳ ai. Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email.
                  </p>
                </div>

                <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                  Trân trọng,<br>
                  <strong>Bệnh Viện Thú Y PetM&amp;M</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; text-align: center;">
                <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.4;">
                  Bệnh Viện Thú Y PetM&amp;M • Hotline: ${hotline}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  return sendMail({
    to: toEmail,
    subject,
    html,
    text: `Mã OTP xác thực đặt lại mật khẩu PetM&M của bạn là: ${otpCode}. Hiệu lực 15 phút.`,
  });
}

// GỬI EMAIL THỬ NGHIỆM KẾT NỐI
export async function sendTestEmail(
  toEmail: string,
  overrideConfig?: Partial<SmtpConfig>,
  testOptions?: { isEn?: boolean; customTemplate?: Partial<EmailTemplateConfig> }
) {
  const isEn = Boolean(testOptions?.isEn);
  const templateCfg = {
    ...(await getEmailTemplateConfig()),
    ...(testOptions?.customTemplate || {}),
  };

  const sampleBooking = {
    bookingCode: 'PMM-' + Math.floor(100000 + Math.random() * 900000),
    ownerName: isEn ? 'Alex Johnson' : 'Nguyễn Văn An',
    petName: isEn ? 'Milo' : 'Bé Đậu',
    petType: 'dog',
    branchName: isEn ? 'PetM&M District 2 Clinic' : 'Cơ sở Thảo Điền - TP. Thủ Đức',
    service: isEn ? 'General Health Check & Vaccination' : 'Khám sức khỏe tổng quát & Tiêm phòng',
    dateTime: `09:00 - 09:30, ${isEn ? 'Date' : 'Ngày'} ${new Date().toLocaleDateString('vi-VN')}`,
    note: isEn ? 'Pet has slight itching on left ear' : 'Bé hơi ngứa tai trái, cần soi tai',
    isEn,
  };

  return sendBookingConfirmationEmail({
    toEmail,
    ...sampleBooking,
  });
}

// GỬI EMAIL THỬ NGHIỆM TIẾP NHẬN TUYỂN DỤNG & CV CHO HR VÀ ỨNG VIÊN
export async function sendTestRecruitmentEmail(
  toEmail: string,
  overrideConfig?: Partial<SmtpConfig>,
  testOptions?: { isEn?: boolean; customTemplate?: Partial<RecruitmentEmailTemplateConfig> }
) {
  const isEn = Boolean(testOptions?.isEn);
  const sampleCandidate = {
    candidateName: isEn ? 'Dr. John Doe, DVM' : 'Bác Sĩ Thú Y Nguyễn Văn An',
    phone: '0903 599 339',
    email: toEmail,
    jobTitle: isEn ? 'Senior Veterinary Surgeon (Test Role)' : 'Bác Sĩ Thú Y Điều Trị Nội Trú (Vị Trí Thử Nghiệm)',
    cvLink: 'https://petmm.vn',
    cvFileName: 'CV_BacSi_NguyenVanAn.pdf',
    notes: isEn
      ? 'This is a TEST recruitment application email sent from PetM&M Admin to verify your HR inbox configuration.'
      : 'Đây là email THỬ NGHIỆM tiếp nhận hồ sơ ứng tuyển gửi từ trang Quản Trị PetM&M để kiểm tra kết nối hòm thư tuyển dụng của bạn.',
    isEn,
    ip: '127.0.0.1 (Thử nghiệm)',
    notifyEmail: toEmail,
    overrideConfig,
    customTemplate: testOptions?.customTemplate,
  };

  return sendRecruitmentApplicationEmail(sampleCandidate);
}

// GỬI EMAIL THỬ NGHIỆM GÓP Ý & LIÊN HỆ CHUNG
export async function sendTestContactEmail(
  toEmail: string,
  overrideConfig?: Partial<SmtpConfig>,
  testOptions?: { isEn?: boolean }
) {
  const isEn = Boolean(testOptions?.isEn);
  const subject = isEn
    ? '[PetM&M] [Test] Customer Feedback & Contact Notification'
    : '[PetM&M] [Thử Nghiệm] Tiếp Nhận Ý Kiến Đóng Góp & Liên Hệ Mới';

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 24px;">
      <tr>
        <td align="center">
          <table width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
            <tr>
              <td style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 28px; text-align: center; color: #ffffff;">
                <h2 style="margin: 0; font-size: 20px;">✉️ Thư Thử Nghiệm Hòm Thư Liên Hệ & CSKH</h2>
                <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">Hệ thống y tế thú y PetM&M</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 28px; font-size: 14px; color: #334155; line-height: 1.6;">
                <p>Xin chào Ban Quản Lý / CSKH,</p>
                <p>Đây là <strong>email thử nghiệm</strong> nhằm kiểm tra kết nối hòm thư nhận góp ý & liên hệ chung (Contact Email). Hệ thống máy chủ SMTP gửi thư đang hoạt động ổn định và sẵn sàng tiếp nhận thông tin từ khách hàng.</p>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin: 18px 0; font-size: 13px;">
                  <div>• <strong>Hòm thư nhận:</strong> ${toEmail}</div>
                  <div>• <strong>Thời gian gửi:</strong> ${new Date().toLocaleString('vi-VN')}</div>
                  <div>• <strong>Trạng thái:</strong> ✅ Kết nối thành công 100%</div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  return sendMail({
    to: toEmail,
    subject,
    html,
    text: `${subject} - Kết nối hòm thư liên hệ thành công tới ${toEmail}.`,
  });
}

// ========================================================
// HÀM DỊCH DỊCH VỤ SONG PHƯƠNG 2 CHIỀU (VI <-> EN)
// Đảm bảo Tiếng Việt 100% thuần Việt và Tiếng Anh 100% thuần Anh
// ========================================================
export async function getTranslatedServices(servicesStr: string, isEn: boolean): Promise<string> {
  if (!servicesStr || !servicesStr.trim()) {
    return isEn ? 'General Health Check & Consultation' : 'Khám Tổng Quát & Tư Vấn';
  }

  try {
    const { data: dbServices } = await supabaseAdmin
      .from('dich_vu')
      .select('ten_dich_vu, ten_dich_vu_en');

    // Làm sạch chuỗi dịch vụ: bỏ các ký tự ; , thừa ở đầu và cuối
    const cleanRaw = servicesStr.replace(/^[;,\s]+|[;,\s]+$/g, '');
    const serviceList = cleanRaw
      .split(/,\s*|\s*;\s*/)
      .map((s) => s.trim().replace(/^[;,\s]+|[;,\s]+$/g, ''))
      .filter(Boolean);

    if (serviceList.length === 0) {
      return isEn ? 'General Health Check & Consultation' : 'Khám Tổng Quát & Tư Vấn';
    }

    if (isEn) {
      // Dịch tất cả sang TIẾNG ANH 100%
      const translatedList = serviceList.map((srv) => {
        // 1. Khớp trong DB
        const found = dbServices?.find(
          (db) =>
            db.ten_dich_vu &&
            (db.ten_dich_vu.toLowerCase() === srv.toLowerCase() ||
              srv.toLowerCase().includes(db.ten_dich_vu.toLowerCase()))
        );
        if (found && found.ten_dich_vu_en && found.ten_dich_vu_en.trim()) {
          return found.ten_dich_vu_en.trim();
        }

        // 2. Từ điển sang tiếng Anh
        const lower = srv.toLowerCase();
        if (lower.includes('tổng quát') || lower.includes('khám sức khỏe') || lower.includes('tư vấn')) {
          return 'General Health Check & Consultation';
        }
        if (lower.includes('tiêm') || lower.includes('vaccine') || lower.includes('vắc xin')) {
          return 'GSP Standard Preventive Vaccination';
        }
        if (lower.includes('phẫu thuật') || lower.includes('triệt sản') || lower.includes('mổ')) {
          return 'Safe Surgery & Neutering';
        }
        if (lower.includes('xét nghiệm') || lower.includes('hình ảnh') || lower.includes('siêu âm') || lower.includes('x-quang')) {
          return 'Digital Imaging & Diagnostics';
        }
        if (lower.includes('nội trú') || lower.includes('cấp cứu') || lower.includes('24/7')) {
          return 'Inpatient Care & 24/7 Emergency';
        }
        if (lower.includes('nha khoa') || lower.includes('răng')) {
          return 'Pet Dental Care & Scaling';
        }
        if (lower.includes('spa') || lower.includes('tắm') || lower.includes('cắt tỉa') || lower.includes('grooming')) {
          return '5-Star Spa Grooming & Styling';
        }
        if (lower.includes('daycare') || lower.includes('trông giữ')) {
          return 'Fun Daycare Care';
        }
        if (lower.includes('khách sạn') || lower.includes('hotel') || lower.includes('nội trú')) {
          return '5-Star Suite Pet Hotel';
        }
        if (lower.includes('đưa đón') || lower.includes('taxi') || lower.includes('vận chuyển')) {
          return 'Home Pet Taxi Service';
        }
        if (lower.includes('dinh dưỡng') || lower.includes('hành vi')) {
          return 'Dietary & Behavioral Consultation';
        }

        return srv;
      });

      return Array.from(new Set(translatedList)).join(', ');
    } else {
      // Dịch tất cả về TIẾNG VIỆT 100% (Loại bỏ hoàn toàn tiếng Anh lẫn vào)
      const translatedList = serviceList.map((srv) => {
        // 1. Khớp trong DB: nếu srv trùng với ten_dich_vu_en thì lấy ten_dich_vu
        const found = dbServices?.find(
          (db) =>
            db.ten_dich_vu_en &&
            (db.ten_dich_vu_en.toLowerCase() === srv.toLowerCase() ||
              srv.toLowerCase().includes(db.ten_dich_vu_en.toLowerCase()))
        );
        if (found && found.ten_dich_vu && found.ten_dich_vu.trim()) {
          return found.ten_dich_vu.trim();
        }

        // 2. Từ điển chuyển tiếng Anh về tiếng Việt thuần túy
        const lower = srv.toLowerCase();
        if (lower.includes('general health') || lower.includes('check-up') || lower.includes('consultation') || lower.includes('examination')) {
          return 'Khám Tổng Quát & Tư Vấn';
        }
        if (lower.includes('vaccination') || lower.includes('preventive')) {
          return 'Tiêm Chủng Vaccine Dự Phòng Chuẩn GSP';
        }
        if (lower.includes('imaging') || lower.includes('diagnostics') || lower.includes('x-ray') || lower.includes('ultrasound')) {
          return 'Xét Nghiệm & Chẩn Đoán Hình Ảnh Kỹ Thuật Số';
        }
        if (lower.includes('surgery') || lower.includes('surgical') || lower.includes('neutering')) {
          return 'Phẫu Thuật Ngoại Khoa & Triệt Sản An Toàn';
        }
        if (lower.includes('emergency') || lower.includes('inpatient')) {
          return 'Điều Trị Nội Trú & Hồi Sức Cấp Cứu 24/7';
        }
        if (lower.includes('dental') || lower.includes('scaling')) {
          return 'Nha Khoa & Cạo Vôi Răng';
        }
        if (lower.includes('spa') || lower.includes('grooming') || lower.includes('styling')) {
          return 'Spa & Cắt Tỉa Tạo Kiểu Lông Thú Cưng';
        }
        if (lower.includes('daycare')) {
          return 'Trông Giữ Bán Trú Daycare';
        }
        if (lower.includes('hotel') || lower.includes('suite')) {
          return 'Khách Sạn Thú Cưng Chuẩn Suite 5 Sao';
        }
        if (lower.includes('taxi') || lower.includes('transport')) {
          return 'Đưa Đón Thú Cưng Tận Nhà (Pet Taxi)';
        }
        if (lower.includes('dietary') || lower.includes('behavioral')) {
          return 'Tư Vấn Dinh Dưỡng & Hành Vi';
        }

        return srv;
      });

      return Array.from(new Set(translatedList)).join(', ');
    }
  } catch (err) {
    console.warn('Lỗi dịch dịch vụ:', err);
    return servicesStr.replace(/^[;,\s]+|[;,\s]+$/g, '');
  }
}

// ========================================================
// HÀM DỊCH CƠ SỞ / CHI NHÁNH KÈM ĐỊA CHỈ ĐẦY ĐỦ (TRA CỨU DB CHI_NHANH)
// Luôn trả về [Tên Cơ Sở] — [Địa Chỉ Đầy Đủ]
// ========================================================
export async function getTranslatedBranch(branchNameOrId: string, isEn: boolean): Promise<string> {
  const fallbackVi = 'Cơ sở TP. Thủ Đức — 19 Đ. Số 1, Phường Phước Long, TP. Thủ Đức, TP. Hồ Chí Minh';
  const fallbackEn = 'Thu Duc City Branch — 19 Street 1, Phuoc Long Ward, Thu Duc City, Ho Chi Minh City';

  if (!branchNameOrId || !branchNameOrId.trim()) {
    return isEn ? fallbackEn : fallbackVi;
  }

  try {
    const { data: dbBranches } = await supabaseAdmin
      .from('chi_nhanh')
      .select('id, ten_chi_nhanh, ten_chi_nhanh_en, ten_ngan, ten_ngan_en, dia_chi, dia_chi_en');

    const cleanInput = branchNameOrId.trim();

    // Tìm chi nhánh khớp theo id, tên chi nhánh, tên ngắn hoặc địa chỉ
    const found = dbBranches?.find(
      (b) =>
        b.id === cleanInput ||
        (b.ten_chi_nhanh && cleanInput.toLowerCase().includes(b.ten_chi_nhanh.toLowerCase())) ||
        (b.ten_ngan && cleanInput.toLowerCase().includes(b.ten_ngan.toLowerCase())) ||
        (b.ten_chi_nhanh && b.ten_chi_nhanh.toLowerCase().includes(cleanInput.toLowerCase())) ||
        (b.ten_ngan && b.ten_ngan.toLowerCase().includes(cleanInput.toLowerCase())) ||
        (b.dia_chi && cleanInput.toLowerCase().includes(b.dia_chi.toLowerCase()))
    );

    if (found) {
      if (isEn) {
        const branchTitle = found.ten_chi_nhanh_en || found.ten_ngan_en || found.ten_chi_nhanh;
        const branchAddr = found.dia_chi_en || found.dia_chi;
        return branchAddr ? `${branchTitle} — ${branchAddr}` : branchTitle;
      } else {
        const branchTitle = found.ten_ngan || found.ten_chi_nhanh;
        const branchAddr = found.dia_chi;
        return branchAddr ? `${branchTitle} — ${branchAddr}` : branchTitle;
      }
    }

    // Nếu không khớp hoàn toàn với DB, kiểm tra nếu là "Cơ sở TP. Thủ Đức"
    if (cleanInput.toLowerCase().includes('thủ đức') || cleanInput.toLowerCase().includes('thu duc')) {
      return isEn ? fallbackEn : fallbackVi;
    }

    if (isEn) {
      return cleanInput
        .replace(/Cơ sở\s*1/gi, 'Branch 1')
        .replace(/Cơ sở\s*2/gi, 'Branch 2')
        .replace(/Cơ sở\s*3/gi, 'Branch 3')
        .replace(/Cơ sở/gi, 'Branch')
        .replace(/Phường/gi, 'Ward')
        .replace(/Quận/gi, 'District')
        .replace(/Đ\.\s*Số/gi, 'Street')
        .replace(/Đường/gi, 'Street')
        .replace(/TP\.\s*Thủ Đức/gi, 'Thu Duc City')
        .replace(/TP\.\s*Hồ Chí Minh/gi, 'Ho Chi Minh City')
        .replace(/TP\.HCM/gi, 'HCMC');
    }

    return cleanInput;
  } catch (err) {
    console.warn('Lỗi dịch chi nhánh:', err);
    return isEn ? fallbackEn : fallbackVi;
  }
}

// ========================================================
// 1. GỬI EMAIL TIẾP NHẬN THÔNG TIN ĐẶT HẸN & TƯ VẤN (GỬI KHI KHÁCH SUBMIT FORM TRÊN WEB)
// Form đơn giản, logo trắng, không viền, tối ưu mobile
// ========================================================
export async function sendCustomerReceiptEmail({
  toEmail,
  bookingCode,
  ownerName,
  phone,
  dateTime,
  date,
  timeSlot,
  service,
  isEn = false,
}: {
  toEmail: string;
  bookingCode?: string;
  ownerName: string;
  phone?: string;
  dateTime?: string;
  date?: string;
  timeSlot?: string;
  service?: string;
  isEn?: boolean;
}) {
  let hotlineDisplay = '0364 605 544';
  try {
    const { data: sysCfg } = await supabaseAdmin
      .from('cau_hinh')
      .select('hotline, hotline_hien_thi')
      .eq('id', 'system')
      .maybeSingle();
    if (sysCfg) {
      hotlineDisplay = sysCfg.hotline_hien_thi || sysCfg.hotline || hotlineDisplay;
    }
  } catch {}

  const attachments: any[] = [];
  let logoImgHtml = '';
  const customerLogoPath = path.join(process.cwd(), 'public', 'logo_email_customer.png');
  if (fs.existsSync(customerLogoPath)) {
    attachments.push({
      filename: 'logo_petmm.png',
      path: customerLogoPath,
      cid: 'petmm_customer_logo',
    });
    logoImgHtml = `<img src="cid:petmm_customer_logo" alt="PetM&M" style="max-height: 48px; max-width: 220px; display: block; border: 0;" />`;
  } else {
    const fallbackPath = path.join(process.cwd(), 'public', 'logo_petmm_full.png');
    if (fs.existsSync(fallbackPath)) {
      attachments.push({
        filename: 'logo_petmm.png',
        path: fallbackPath,
        cid: 'petmm_customer_logo',
      });
      logoImgHtml = `<img src="cid:petmm_customer_logo" alt="PetM&M" style="max-height: 48px; max-width: 220px; display: block; border: 0;" />`;
    }
  }

  const formattedDate = date ? formatDateDMY(date) : (dateTime ? formatDateDMY(dateTime) : '');
  const formattedTimeSlot = timeSlot && timeSlot.trim() ? timeSlot.trim() : (isEn ? 'Flexible' : 'Linh hoạt');

  // Tự động dịch dịch vụ nếu gửi bản tiếng Anh
  const displayService = service ? await getTranslatedServices(service, Boolean(isEn)) : '';

  const subject = isEn
    ? `[PetM&M] Information Received - Booking & Consultation`
    : `[PetM&M] Tiếp Nhận Thông Tin Đặt Hẹn & Tư Vấn`;

  const html = `
<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'vi'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isEn ? 'Information Reception' : 'Tiếp Nhận Thông Tin'}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.6; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 540px; margin: 0 auto; padding: 24px 16px; background-color: #ffffff;">
    <div style="background-color: #ffffff; padding: 0 0 20px 0;">
      ${logoImgHtml}
    </div>

    <h2 style="margin: 0 0 18px 0; font-size: 18px; font-weight: 700; color: #1e3f1b;">
      ${isEn ? 'Information Received - Booking & Consultation' : 'Tiếp Nhận Thông Tin Đặt Hẹn & Tư Vấn'}
    </h2>

    <div style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.7;">
      <div style="margin-bottom: 6px;">
        <span style="color: #4b5563;">${isEn ? 'Full Name:' : 'Họ Tên:'}</span> 
        <strong style="color: #111827;">${ownerName}</strong>
      </div>
      ${phone ? `
      <div style="margin-bottom: 6px;">
        <span style="color: #4b5563;">${isEn ? 'Phone Number:' : 'SDT:'}</span> 
        <strong style="color: #111827;">${phone}</strong>
      </div>` : ''}
      <div style="margin-bottom: 6px;">
        <span style="color: #4b5563;">${isEn ? 'Date:' : 'Thời Gian:'}</span> 
        <strong style="color: #111827;">${formattedDate}</strong>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span style="color: #4b5563;">${isEn ? 'Time Slot:' : 'Khung Giờ:'}</span> 
        <strong style="color: #111827;">${formattedTimeSlot}</strong>
      </div>
      ${displayService ? `
      <div style="margin-bottom: 6px;">
        <span style="color: #4b5563;">${isEn ? 'Service:' : 'Dịch Vụ:'}</span> 
        <strong style="color: #111827;">${displayService}</strong>
      </div>` : ''}
    </div>

    <p style="margin: 0 0 16px 0; font-size: 15px; color: #1f2937; line-height: 1.6;">
      ${isEn
        ? 'PetM&M Customer Care Department has received your information and will contact you as soon as possible. Thank you for your trust and choosing PetM&M.'
        : 'Bộ Phận CSKH của PetM&M đã tiếp nhận thông tin và sẽ liên hệ lại sớm nhất. Cảm ơn quý khách hàng đã tin tưởng lựa chọn.'}
    </p>

    <p style="margin: 0 0 24px 0; font-size: 14px; color: #374151; line-height: 1.6;">
      ${isEn ? 'For any inquiries, please contact Hotline: ' : 'Mọi thắc mắc xin liên hệ Hotline: '}
      <strong style="color: #1e3f1b;">${hotlineDisplay}</strong>
    </p>

    <div style="border-top: 1px solid #e5e7eb; padding-top: 14px; font-size: 12px; color: #9ca3af;">
      ${isEn ? 'PetM&amp;M - Touch • Trust • Love' : 'PetM&amp;M - Chạm • Tin • Yêu'}
    </div>
  </div>
</body>
</html>
  `;

  return sendMail({
    to: toEmail,
    subject,
    html,
    text: `${subject} - ${ownerName} (${phone || ''}) - ${formattedDate} ${formattedTimeSlot}. Hotline: ${hotlineDisplay}.`,
    attachments,
  });
}

// ========================================================
// 2. GỬI EMAIL XÁC NHẬN ĐẶT LỊCH HẸN CHÍNH THỨC (GỬI TỪ ADMIN KHI NHÂN VIÊN ĐÃ CHỐT LỊCH)
// Thư xác nhận trang trọng, hiển thị đầy đủ Thú cưng, Cơ sở, Dịch vụ đã dịch sang EN nếu là tiếng Anh
// ========================================================
export async function sendBookingConfirmationEmail({
  toEmail,
  bookingCode,
  ownerName,
  phone,
  petName,
  petType = 'dog',
  branchName,
  service,
  dateTime,
  date,
  timeSlot,
  note,
  isEn = false,
}: {
  toEmail: string;
  bookingCode: string;
  ownerName: string;
  phone?: string;
  petName?: string;
  petType?: string;
  branchName?: string;
  service?: string;
  dateTime: string;
  date?: string;
  timeSlot?: string;
  note?: string;
  isEn?: boolean;
}) {
  let hotlineDisplay = '0364 605 544';
  try {
    const { data: sysCfg } = await supabaseAdmin
      .from('cau_hinh')
      .select('hotline, hotline_hien_thi')
      .eq('id', 'system')
      .maybeSingle();
    if (sysCfg) {
      hotlineDisplay = sysCfg.hotline_hien_thi || sysCfg.hotline || hotlineDisplay;
    }
  } catch {}

  const attachments: any[] = [];
  let logoImgHtml = '';
  const customerLogoPath = path.join(process.cwd(), 'public', 'logo_email_customer.png');
  if (fs.existsSync(customerLogoPath)) {
    attachments.push({
      filename: 'logo_petmm.png',
      path: customerLogoPath,
      cid: 'petmm_customer_logo',
    });
    logoImgHtml = `<img src="cid:petmm_customer_logo" alt="PetM&M" style="max-height: 52px; max-width: 240px; display: block; border: 0;" />`;
  } else {
    const fallbackPath = path.join(process.cwd(), 'public', 'logo_petmm_full.png');
    if (fs.existsSync(fallbackPath)) {
      attachments.push({
        filename: 'logo_petmm.png',
        path: fallbackPath,
        cid: 'petmm_customer_logo',
      });
      logoImgHtml = `<img src="cid:petmm_customer_logo" alt="PetM&M" style="max-height: 52px; max-width: 240px; display: block; border: 0;" />`;
    }
  }

  // Tự động dịch Cơ sở và Dịch vụ sang tiếng Anh nếu gửi bản tiếng Anh
  const finalServicesStr = await getTranslatedServices(service || '', Boolean(isEn));
  const finalBranchStr = await getTranslatedBranch(branchName || '', Boolean(isEn));

  const formattedDate = date ? formatDateDMY(date) : formatDateDMY(dateTime);
  const formattedTimeSlot = timeSlot && timeSlot.trim() ? timeSlot.trim() : (isEn ? 'Flexible' : 'Linh hoạt');

  // Kiểm tra nếu có tên thú cưng thực tế (nếu trống hoặc là từ mặc định thì ẩn luôn trên mail)
  const cleanPetName = (petName || '').trim();
  const lowerPet = cleanPetName.toLowerCase();
  const hasRealPetName =
    Boolean(cleanPetName &&
    lowerPet !== 'bé cưng' &&
    lowerPet !== 'be cung' &&
    lowerPet !== 'beloved pet' &&
    lowerPet !== 'pet');

  const petTypeDisplay =
    petType === 'cat'
      ? (isEn ? 'Cat' : 'Mèo')
      : petType === 'other'
      ? (isEn ? 'Other' : 'Loài khác')
      : (isEn ? 'Dog' : 'Chó');

  const subject = isEn
    ? `[PetM&M] Appointment Confirmation - #${bookingCode}`
    : `[PetM&M] Xác Nhận Lịch Hẹn - #${bookingCode}`;

  const html = `
<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'vi'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isEn ? 'Appointment Confirmation' : 'Xác Nhận Lịch Hẹn'}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.6; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 520px; margin: 0 auto; padding: 24px 16px; background-color: #ffffff;">
    
    <!-- Logo trên nền trắng -->
    <div style="padding-bottom: 20px;">
      ${logoImgHtml}
    </div>

    <!-- Tiêu đề & Mã lịch hẹn -->
    <h2 style="margin: 0 0 4px 0; font-size: 18px; font-weight: 700; color: #1e3f1b;">
      ${isEn ? 'Appointment Confirmation' : 'Xác Nhận Lịch Hẹn'}
    </h2>
    <div style="font-size: 13px; color: #6b7280; margin-bottom: 18px;">
      ${isEn ? 'Booking ID:' : 'Mã lịch hẹn:'} <strong style="color: #111827;">#${bookingCode}</strong>
    </div>

    <!-- Lời chào mở đầu -->
    <p style="margin: 0 0 18px 0; font-size: 14px; color: #374151; line-height: 1.6;">
      ${isEn
        ? `Dear <strong>${ownerName}</strong>,<br/>PetM&M would like to confirm that your appointment has been successfully scheduled. Below are your visit details:`
        : `Kính chào Quý khách <strong>${ownerName}</strong>,<br/>PetM&M xin trân trọng thông báo lịch hẹn khám &amp; chăm sóc của bạn đã được xếp lịch thành công:`}
    </p>

    <!-- Danh sách thông tin tối giản (Không khung, không icon, tối ưu mobile) -->
    <div style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.7;">
      <div style="margin-bottom: 6px;">
        <span style="color: #6b7280;">${isEn ? 'Customer Name:' : 'Khách hàng:'}</span> 
        <strong style="color: #111827;">${ownerName}</strong>
      </div>

      ${phone && phone.trim() ? `
      <div style="margin-bottom: 6px;">
        <span style="color: #6b7280;">${isEn ? 'Phone Number:' : 'Số điện thoại:'}</span> 
        <strong style="color: #111827;">${phone.trim()}</strong>
      </div>` : ''}

      ${hasRealPetName ? `
      <div style="margin-bottom: 6px;">
        <span style="color: #6b7280;">${isEn ? 'Pet:' : 'Thú cưng:'}</span> 
        <strong style="color: #111827;">${cleanPetName}</strong>
        <span style="color: #6b7280;"> (${petTypeDisplay})</span>
      </div>` : ''}

      <div style="margin-bottom: 6px;">
        <span style="color: #6b7280;">${isEn ? 'Date:' : 'Ngày hẹn:'}</span> 
        <strong style="color: #111827;">${formattedDate}</strong>
      </div>

      <div style="margin-bottom: 6px;">
        <span style="color: #6b7280;">${isEn ? 'Time Slot:' : 'Khung giờ:'}</span> 
        <strong style="color: #111827;">${formattedTimeSlot}</strong>
      </div>

      ${finalServicesStr && finalServicesStr.trim() ? `
      <div style="margin-bottom: 6px;">
        <span style="color: #6b7280;">${isEn ? 'Services:' : 'Dịch vụ:'}</span> 
        <strong style="color: #111827;">${finalServicesStr}</strong>
      </div>` : ''}

      ${finalBranchStr && finalBranchStr.trim() ? `
      <div style="margin-bottom: 6px;">
        <span style="color: #6b7280;">${isEn ? 'Location:' : 'Cơ sở tiếp đón:'}</span> 
        <strong style="color: #111827;">${finalBranchStr}</strong>
      </div>` : ''}

      ${note && note.trim() ? `
      <div style="margin-bottom: 6px;">
        <span style="color: #6b7280;">${isEn ? 'Notes / Symptoms:' : 'Ghi chú / Triệu chứng:'}</span> 
        <span style="color: #111827;">${note.trim()}</span>
      </div>` : ''}
    </div>

    <!-- Lời dặn trước khi đến -->
    <p style="margin: 0 0 14px 0; font-size: 13px; color: #4b5563; line-height: 1.6;">
      ${isEn
        ? 'Please arrive 5–10 minutes prior to your scheduled time so our veterinary team can best receive your pet.'
        : 'Quý khách vui lòng đưa bé đến trước giờ hẹn 5–10 phút để đội ngũ bác sĩ tiếp đón và kiểm tra chu đáo nhất.'}
    </p>

    <!-- Hotline hỗ trợ -->
    <p style="margin: 0 0 20px 0; font-size: 13px; color: #4b5563; line-height: 1.6;">
      ${isEn ? 'For any inquiries or rescheduling, please contact Hotline: ' : 'Mọi thắc mắc hoặc cần hỗ trợ thay đổi giờ hẹn, xin liên hệ Hotline: '}
      <strong style="color: #1e3f1b;">${hotlineDisplay}</strong>
    </p>

    <!-- Lời cảm ơn & Chữ ký -->
    <p style="margin: 0 0 22px 0; font-size: 13px; color: #4b5563; line-height: 1.6;">
      ${isEn ? 'Best regards,' : 'Trân trọng cảm ơn,'}<br/>
      <strong style="color: #1e3f1b;">${isEn ? 'PetM&amp;M Veterinary Hospital' : 'Bệnh Viện Thú Y PetM&amp;M'}</strong>
    </p>

    <!-- Chân trang tối giản -->
    <div style="border-top: 1px solid #e5e7eb; padding-top: 14px; font-size: 12px; color: #9ca3af;">
      ${isEn ? 'PetM&amp;M - Touch • Trust • Love' : 'PetM&amp;M - Chạm • Tin • Yêu'}
    </div>

  </div>
</body>
</html>
  `;

  return sendMail({
    to: toEmail,
    subject,
    html,
    text: `${subject}\n${ownerName}${hasRealPetName ? ` - ${cleanPetName}` : ''}\n${formattedTimeSlot} • ${formattedDate}\n${isEn ? 'Location:' : 'Cơ sở tiếp đón:'} ${finalBranchStr}\n${isEn ? 'Services:' : 'Dịch vụ:'} ${finalServicesStr}\nHotline: ${hotlineDisplay}`,
    attachments,
  });
}

// ========================================================
// GỬI EMAIL THÔNG BÁO HỒ SƠ ỨNG TUYỂN MỚI CHO NHÀ TUYỂN DỤNG & ỨNG VIÊN
// ========================================================
export async function sendRecruitmentApplicationEmail(params: {
  candidateName: string;
  phone: string;
  email: string;
  jobTitle: string;
  cvLink?: string;
  cvFileName?: string;
  notes?: string;
  isEn?: boolean;
  ip?: string;
  notifyEmail?: string;
  overrideConfig?: Partial<SmtpConfig>;
  customTemplate?: Partial<RecruitmentEmailTemplateConfig>;
}) {
  const {
    candidateName,
    phone,
    email,
    jobTitle,
    cvLink,
    cvFileName,
    notes,
    isEn = false,
    ip,
    notifyEmail,
    overrideConfig,
    customTemplate,
  } = params;

  const baseConfig = await getSmtpConfig();
  const smtpConfig: SmtpConfig = {
    ...baseConfig,
    ...(overrideConfig || {}),
  };
  const hrRecipient = (
    notifyEmail ||
    smtpConfig.smtp_notify_recruitment_email ||
    smtpConfig.smtp_notify_email ||
    smtpConfig.smtp_email ||
    'tuyendung@petmm.vn'
  ).trim();
  const applyTimeVN = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  // 1. EMAIL GỬI VỀ NHÀ TUYỂN DỤNG (HR)
  const hrSubject = `[Ứng Tuyển] ${jobTitle} - ${candidateName} (${phone})`;
  const hrHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Hồ Sơ Ứng Tuyển Mới PetM&amp;M</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 16px 8px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="520" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
            <!-- Header Banner -->
            <tr>
              <td style="background: #1e3f1b; padding: 24px 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #ffffff;">
                  Hồ Sơ Ứng Tuyển Mới
                </h1>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #cbd5e1;">
                  Vị trí: <strong style="color: #ffffff;">${jobTitle}</strong>
                </p>
              </td>
            </tr>

            <!-- Body Content -->
            <tr>
              <td style="padding: 24px 20px;">
                <div style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; padding: 14px 16px; margin-bottom: 18px;">
                  <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 10px;">
                    Thông Tin Ứng Viên
                  </div>

                  <div style="padding-bottom: 8px; border-bottom: 1px solid #eef2f6;">
                    <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">Họ và tên</div>
                    <div style="font-size: 14px; font-weight: 700; color: #0f172a;">${candidateName}</div>
                  </div>

                  <div style="padding: 8px 0; border-bottom: 1px solid #eef2f6;">
                    <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">Số điện thoại</div>
                    <div>
                      <a href="tel:${phone}" style="color: #2D5A27; font-weight: 700; font-size: 14px; text-decoration: none;">
                        ${phone}
                      </a>
                    </div>
                  </div>

                  <div style="padding: 8px 0; border-bottom: 1px solid #eef2f6;">
                    <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">Email</div>
                    <div>
                      <a href="mailto:${email}" style="color: #0284c7; font-size: 13px; text-decoration: none; word-break: break-all;">
                        ${email}
                      </a>
                    </div>
                  </div>

                  <div style="padding-top: 8px;">
                    <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">Thời gian nộp</div>
                    <div style="font-size: 13px; color: #475569;">${applyTimeVN}</div>
                  </div>
                </div>

                <!-- CV File link -->
                <div style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; padding: 14px 16px; margin-bottom: 18px;">
                  <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">
                    Hồ Sơ Đính Kèm (CV)
                  </div>
                  ${cvLink ? `
                    <div style="margin-bottom: 10px; font-size: 13px; color: #334155;">
                      Tên file: <strong>${cvFileName || 'CV_Ung_Tuyen.pdf'}</strong>
                    </div>
                    <a href="${cvLink}" target="_blank" style="display: inline-block; background-color: #2D5A27; color: #ffffff; text-decoration: none; padding: 9px 18px; border-radius: 6px; font-weight: 600; font-size: 13px;">
                      Xem và Tải File CV
                    </a>
                  ` : `
                    <p style="margin: 0; font-size: 13px; color: #64748b;">
                      Ứng viên không đính kèm liên kết trực tiếp. Vui lòng liên hệ qua SĐT hoặc Email.
                    </p>
                  `}
                </div>

                <!-- Candidate notes -->
                ${notes ? `
                <div style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; padding: 14px 16px; margin-bottom: 18px;">
                  <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">
                    Ghi Chú Của Ứng Viên
                  </div>
                  <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.5; white-space: pre-wrap;">
                    ${notes}
                  </p>
                </div>` : ''}

                <!-- Quick actions -->
                <div style="text-align: center; padding-top: 6px;">
                  <a href="tel:${phone}" style="display: inline-block; background-color: #2D5A27; color: #ffffff; text-decoration: none; padding: 9px 16px; border-radius: 6px; font-weight: 600; font-size: 12px; margin-right: 6px;">
                    Gọi điện
                  </a>
                  <a href="mailto:${email}?subject=Phản hồi hồ sơ ứng tuyển vị trí ${encodeURIComponent(jobTitle)} - PetM&M" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 9px 16px; border-radius: 6px; font-weight: 600; font-size: 12px;">
                    Gửi email
                  </a>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; text-align: center;">
                <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                  Bệnh Viện Thú Y PetM&amp;M • Ban Tuyển Dụng
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  // 2. EMAIL XÁC NHẬN GỬI CHO ỨNG VIÊN (SỬ DỤNG MẪU TUYỂN DỤNG SONG NGỮ TÙY BIẾN)
  const baseTpl = await getRecruitmentEmailTemplateConfig();
  const tpl: RecruitmentEmailTemplateConfig = {
    ...baseTpl,
    ...(customTemplate || {}),
  };
  const vars: Record<string, string> = {
    candidate_name: candidateName,
    job_title: jobTitle,
    phone: phone,
    email: email,
    apply_time: applyTimeVN,
    hotline: '0903 599 339',
  };

  const candidateSubject = replacePlaceholders(
    isEn ? tpl.subjectEn : tpl.subjectVi,
    vars
  );
  const bannerTitle = replacePlaceholders(
    isEn ? tpl.bannerTitleEn : tpl.bannerTitleVi,
    vars
  );
  const bannerSubtitle = replacePlaceholders(
    isEn ? tpl.bannerSubtitleEn : tpl.bannerSubtitleVi,
    vars
  );
  const introText = replacePlaceholders(
    isEn ? tpl.introEn : tpl.introVi,
    vars
  );
  const checklistRaw = isEn ? tpl.checklistEn : tpl.checklistVi;
  const footerNote = replacePlaceholders(
    isEn ? tpl.footerEn : tpl.footerVi,
    vars
  );

  const checklistHtml = checklistRaw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<div style="margin-bottom: 6px; line-height: 1.5;">${line}</div>`)
    .join('');

  const candidateHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${candidateSubject}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 16px 8px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="520" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
            <!-- Header Banner -->
            <tr>
              <td style="background: #1e3f1b; padding: 24px 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #ffffff;">
                  ${bannerTitle}
                </h1>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #cbd5e1;">
                  ${isEn ? 'Position:' : 'Vị trí:'} <strong style="color: #ffffff;">${jobTitle}</strong>
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 24px 20px;">
                <p style="margin: 0 0 16px 0; font-size: 14px; color: #0f172a; line-height: 1.5;">
                  ${introText}
                </p>

                <div style="background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; padding: 14px 16px; margin-bottom: 18px;">
                  <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 10px;">
                    ${isEn ? 'Application Details:' : 'Thông Tin Ứng Tuyển:'}
                  </div>

                  <div style="padding-bottom: 8px; border-bottom: 1px solid #eef2f6;">
                    <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">${isEn ? 'Full name' : 'Họ và tên'}</div>
                    <div style="font-size: 14px; font-weight: 700; color: #0f172a;">${candidateName}</div>
                  </div>

                  <div style="padding: 8px 0; border-bottom: 1px solid #eef2f6;">
                    <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">${isEn ? 'Phone number' : 'Số điện thoại'}</div>
                    <div style="font-size: 14px; font-weight: 600; color: #0f172a;">${phone}</div>
                  </div>

                  <div style="padding: 8px 0; border-bottom: 1px solid #eef2f6;">
                    <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">${isEn ? 'Applied position' : 'Vị trí'}</div>
                    <div style="font-size: 13px; font-weight: 600; color: #2D5A27;">${jobTitle}</div>
                  </div>

                  <div style="padding-top: 8px;">
                    <div style="font-size: 11px; color: #64748b; margin-bottom: 2px;">${isEn ? 'Submitted at' : 'Thời gian nộp'}</div>
                    <div style="font-size: 13px; color: #475569;">${applyTimeVN}</div>
                  </div>
                </div>

                ${checklistHtml ? `
                <div style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 12px 14px; margin-bottom: 18px;">
                  <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                    ${isEn ? 'Next Steps:' : 'Quy trình xét duyệt:'}
                  </div>
                  <div style="font-size: 12px; color: #475569; line-height: 1.5;">
                    ${checklistHtml}
                  </div>
                </div>` : ''}

                <div style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5; white-space: pre-wrap;">
                  ${footerNote}
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; text-align: center;">
                <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                  Bệnh Viện Thú Y PetM&amp;M • Hotline Tuyển Dụng: 0903 599 339
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  // Gửi song song: Thư cho HR và Thư xác nhận cho ứng viên
  const promises: Promise<any>[] = [];

  // Gửi cho HR
  if (hrRecipient) {
    promises.push(
      sendMail({
        to: hrRecipient,
        subject: hrSubject,
        html: hrHtml,
        text: `Hồ sơ ứng tuyển mới: ${jobTitle} - ${candidateName} (${phone}) - Email: ${email}. CV: ${cvLink || 'Không có link'}`,
        overrideConfig,
      }).catch((err) => {
        console.warn('[Recruitment Mailer] Lỗi gửi email đến HR:', err.message);
      })
    );
  }

  // Gửi cho ứng viên nếu email hợp lệ
  if (email && email.includes('@')) {
    promises.push(
      sendMail({
        to: email.trim(),
        subject: candidateSubject,
        html: candidateHtml,
        text: `${candidateSubject}. Cảm ơn bạn ${candidateName} đã ứng tuyển vị trí ${jobTitle} tại PetM&M.`,
        overrideConfig,
      }).catch((err) => {
        console.warn('[Recruitment Mailer] Lỗi gửi email xác nhận cho ứng viên:', err.message);
      })
    );
  }

  await Promise.allSettled(promises);
  return { success: true };
}

