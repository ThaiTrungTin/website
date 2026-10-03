import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export interface SmtpConfig {
  smtp_email: string;
  smtp_password?: string;
  smtp_sender_name: string;
  smtp_notify_email: string; // Email nhận thông báo đặt lịch khám
  smtp_notify_recruitment_email?: string; // Email nhận hồ sơ tuyển dụng & CV
  smtp_notify_contact_email?: string; // Email nhận góp ý & liên hệ chung
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
    const { data, error } = await supabaseAdmin
      .from('cau_hinh')
      .select('smtp_email, smtp_password, smtp_sender_name, smtp_notify_email, smtp_notify_recruitment_email, smtp_notify_contact_email')
      .eq('id', 'system')
      .maybeSingle();

    if (error || !data) {
      return {
        smtp_email: 'thaitrtin@gmail.com',
        smtp_password: '',
        smtp_sender_name: 'Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M',
        smtp_notify_email: 'thaitrtin@gmail.com',
        smtp_notify_recruitment_email: 'tuyendung@petmm.vn',
        smtp_notify_contact_email: 'thaitrtin@gmail.com',
      };
    }

    return {
      smtp_email: data.smtp_email || 'thaitrtin@gmail.com',
      smtp_password: data.smtp_password || '',
      smtp_sender_name: data.smtp_sender_name || 'Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M',
      smtp_notify_email: data.smtp_notify_email || 'thaitrtin@gmail.com',
      smtp_notify_recruitment_email: data.smtp_notify_recruitment_email || 'tuyendung@petmm.vn',
      smtp_notify_contact_email: data.smtp_notify_contact_email || data.smtp_notify_email || 'thaitrtin@gmail.com',
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
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: any[];
  overrideConfig?: Partial<SmtpConfig>;
}) {
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

  return info;
}

// GỬI EMAIL MÃ OTP ĐẶT LẠI MẬT KHẨU
export async function sendOtpEmail(toEmail: string, otpCode: string) {
  const subject = `[PetM&M] Mã xác thực OTP đặt lại mật khẩu: ${otpCode}`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Mã Xác Thực PetM&M</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="560px" style="max-width: 560px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
            <!-- Header Banner -->
            <tr>
              <td style="background: linear-gradient(135deg, #0B150A 0%, #173812 100%); padding: 36px 32px; text-align: center;">
                <div style="display: inline-block; padding: 6px 16px; background-color: rgba(255, 184, 0, 0.15); border: 1px solid rgba(255, 184, 0, 0.3); border-radius: 9999px; margin-bottom: 12px;">
                  <span style="color: #FFB800; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">BẢO MẬT HỆ THỐNG</span>
                </div>
                <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M</h1>
                <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">Yêu cầu khôi phục mật khẩu tài khoản quản trị</p>
              </td>
            </tr>

            <!-- Content Body -->
            <tr>
              <td style="padding: 36px 32px;">
                <p style="margin: 0 0 16px 0; font-size: 14px; color: #334155; line-height: 1.6;">
                  Xin chào <strong>Quản Trị Viên</strong>,
                </p>
                <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                  Hệ thống vừa nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${toEmail}</strong>. Vui lòng sử dụng mã xác thực OTP 6 số dưới đây để hoàn tất:
                </p>

                <!-- OTP Display Box -->
                <div style="background-color: #f8fafc; border: 2px dashed #2D5A27; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;">
                  <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">MÃ XÁC THỰC CỦA BẠN</div>
                  <div style="font-size: 40px; font-weight: 800; letter-spacing: 8px; color: #2D5A27; font-family: monospace;">
                    ${otpCode}
                  </div>
                  <div style="font-size: 12px; color: #94a3b8; margin-top: 8px;">
                    Hiệu lực trong <strong>15 phút</strong> kể từ thời điểm gửi.
                  </div>
                </div>

                <div style="padding: 14px 18px; background-color: #fffbeb; border-radius: 12px; border: 1px solid #fef3c7; margin-bottom: 24px;">
                  <p style="margin: 0; font-size: 12px; color: #92400e; line-height: 1.5;">
                    ⚠️ <strong>Lưu ý bảo mật:</strong> Tuyệt đối không chia sẻ mã này cho bất kỳ ai. Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.
                  </p>
                </div>

                <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.6;">
                  Trân trọng,<br>
                  <strong>Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
                <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                  Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M<br>
                  Hotline Cấp Cứu 24/7: 0364 605 544 • TP. Thủ Đức, TP. Hồ Chí Minh
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
    cvLink: 'https://petsmm.vercel.app',
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

// GỬI EMAIL XÁC NHẬN ĐẶT LỊCH HẸN CHO KHÁCH HÀNG (HỖ TRỢ SONG NGỮ VIỆT / ANH & LOGO)
export async function sendBookingConfirmationEmail({
  toEmail,
  bookingCode,
  ownerName,
  petName,
  petType = 'dog',
  branchName,
  service,
  dateTime,
  note,
  isEn = false,
}: {
  toEmail: string;
  bookingCode: string;
  ownerName: string;
  petName: string;
  petType?: string;
  branchName: string;
  service?: string;
  dateTime: string;
  note?: string;
  isEn?: boolean;
}) {
  const templateCfg = await getEmailTemplateConfig();

  const petTypeDisplay = isEn
    ? (petType === 'cat' ? 'Cat' : petType === 'dog' ? 'Dog' : 'Other Pet')
    : (petType === 'cat' ? 'Mèo' : petType === 'dog' ? 'Chó' : 'Loài khác');

  const formattedDate = formatDateDMY(dateTime);

  const vars: Record<string, string> = {
    booking_code: bookingCode,
    code: bookingCode,
    owner_name: ownerName,
    pet_name: petName,
    pet_type: petTypeDisplay,
    branch_name: branchName,
    service: service || (isEn ? 'General Health Consultation' : 'Khám tổng quát'),
    date_time: formattedDate,
    hotline: '0364 605 544',
  };

  // Chọn nội dung song ngữ theo ngôn ngữ khách đang dùng trên web
  const subject = replacePlaceholders(
    isEn ? templateCfg.subjectEn : templateCfg.subjectVi,
    vars
  );
  const bannerTitle = replacePlaceholders(
    isEn ? templateCfg.bannerTitleEn : templateCfg.bannerTitleVi,
    vars
  );
  const bannerSubtitle = replacePlaceholders(
    isEn ? templateCfg.bannerSubtitleEn : templateCfg.bannerSubtitleVi,
    vars
  );
  const introText = replacePlaceholders(
    isEn ? templateCfg.introEn : templateCfg.introVi,
    vars
  );
  const checklistRaw = isEn ? templateCfg.checklistEn : templateCfg.checklistVi;
  const footerNote = replacePlaceholders(
    isEn ? templateCfg.footerEn : templateCfg.footerVi,
    vars
  );

  // Xử lý danh sách checklist thành các dòng HTML
  const checklistHtml = checklistRaw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<div style="margin-bottom: 6px; line-height: 1.5;">${line}</div>`)
    .join('');

  // Xử lý Logo trong email:
  // Nếu có logoUrl dạng online (http/https) thì dùng trực tiếp
  // Nếu không có hoặc link local, nhúng logo_petmm_full.png dưới dạng inline CID
  let logoHtml = '';
  const attachments: any[] = [];

  if (templateCfg.logoUrl && templateCfg.logoUrl.startsWith('http')) {
    logoHtml = `
      <div style="text-align: center; margin-bottom: 14px;">
        <img src="${templateCfg.logoUrl}" alt="PetM&M Logo" style="max-height: 48px; max-width: 190px; object-fit: contain;" />
      </div>
    `;
  } else {
    // Thử tìm logo cục bộ trong thư mục public
    const localLogoPath = path.join(process.cwd(), 'public', 'logo_petmm_full.png');
    if (fs.existsSync(localLogoPath)) {
      attachments.push({
        filename: 'logo_petmm.png',
        path: localLogoPath,
        cid: 'petmm_logo_img',
      });
      logoHtml = `
        <div style="text-align: center; margin-bottom: 14px;">
          <img src="cid:petmm_logo_img" alt="PetM&M Logo" style="max-height: 48px; max-width: 190px; object-fit: contain;" />
        </div>
      `;
    }
  }

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
            <!-- Header Banner -->
            <tr>
              <td style="background: linear-gradient(135deg, #0B150A 0%, #173812 100%); padding: 36px 32px; text-align: center;">
                ${logoHtml}
                <div style="display: inline-block; padding: 6px 16px; background-color: rgba(255, 184, 0, 0.15); border: 1px solid rgba(255, 184, 0, 0.3); border-radius: 9999px; margin-bottom: 12px;">
                  <span style="color: #FFB800; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                    ${isEn ? 'VETERINARY APPOINTMENT' : 'LỊCH HẸN TRỰC TUYẾN'}
                  </span>
                </div>
                <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">${bannerTitle}</h1>
                <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">
                  ${bannerSubtitle}
                </p>
              </td>
            </tr>

            <!-- Content Body -->
            <tr>
              <td style="padding: 32px;">
                <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                  ${introText}
                </p>

                <!-- Boarding Pass Box -->
                <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 16px; padding: 20px 24px; margin-bottom: 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding-bottom: 14px; border-bottom: 1px dashed #cbd5e1;">
                        <span style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">
                          ${isEn ? 'BOOKING CODE' : 'MÃ TIẾP NHẬN'}
                        </span>
                        <div style="font-size: 24px; font-weight: 800; color: #2D5A27; font-family: monospace; margin-top: 4px;">
                          ${bookingCode}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top: 14px;">
                        <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px; color: #334155;">
                          <tr>
                            <td width="35%" style="color: #64748b;">${isEn ? 'Pet Name:' : 'Bé thú cưng:'}</td>
                            <td><strong>${petName}</strong> (${petTypeDisplay})</td>
                          </tr>
                          <tr>
                            <td style="color: #64748b;">${isEn ? 'Schedule:' : 'Thời gian hẹn:'}</td>
                            <td><strong style="color: #2D5A27;">${formattedDate}</strong></td>
                          </tr>
                          <tr>
                            <td style="color: #64748b;">${isEn ? 'Branch:' : 'Cơ sở tiếp đón:'}</td>
                            <td><strong>${branchName}</strong></td>
                          </tr>
                          ${service ? `
                          <tr>
                            <td style="color: #64748b;">${isEn ? 'Service:' : 'Dịch vụ yêu cầu:'}</td>
                            <td>${service}</td>
                          </tr>` : ''}
                          ${note ? `
                          <tr>
                            <td style="color: #64748b;">${isEn ? 'Notes:' : 'Ghi chú thêm:'}</td>
                            <td style="font-style: italic; color: #475569;">&ldquo;${note}&rdquo;</td>
                          </tr>` : ''}
                        </table>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Helpful Tips (Checklist) -->
                ${checklistHtml ? `
                <div style="background-color: #ecfdf5; border-radius: 12px; border: 1px solid #a7f3d0; padding: 14px 18px; margin-bottom: 24px;">
                  <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #065f46;">
                    📌 ${isEn ? 'Preparation Advice:' : 'Lưu ý chuẩn bị trước khi đến:'}
                  </p>
                  <div style="font-size: 12px; color: #065f46;">
                    ${checklistHtml}
                  </div>
                </div>` : ''}

                <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.6;">
                  ${footerNote}
                  <br>
                  <strong style="color: #2D5A27; font-size: 16px;">📞 0364 605 544</strong> (${isEn ? 'Emergency 24/7' : 'Hotline 24/7'})
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
                <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.6;">
                  Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M<br>
                  Hotline: 0364 605 544
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
    text: `${subject} - Lịch hẹn cho bé ${petName} tại ${branchName} lúc ${formattedDate}. Hotline: 0364 605 544.`,
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
  const hrSubject = `[Hồ Sơ Ứng Tuyển Mới] ${jobTitle} - ${candidateName} (${phone})`;
  const hrHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Hồ Sơ Ứng Tuyển Mới PetM&M</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <!-- Header Banner -->
            <tr>
              <td style="background: linear-gradient(135deg, #183B16 0%, #2D5A27 100%); padding: 32px 30px; text-align: center;">
                <div style="font-size: 13px; font-weight: 700; color: #FFB800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">
                  HỆ THỐNG Y TẾ THÚ Y PETM&M
                </div>
                <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
                  📩 Có Hồ Sơ Ứng Tuyển Mới
                </h1>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #e2e8f0;">
                  Vị trí: <strong style="color: #ffffff;">${jobTitle}</strong>
                </p>
              </td>
            </tr>

            <!-- Body Content -->
            <tr>
              <td style="padding: 28px 30px;">
                <div style="margin-bottom: 22px; border-bottom: 2px dashed #e2e8f0; padding-bottom: 18px;">
                  <h3 style="margin: 0 0 14px 0; font-size: 15px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                    👤 Thông Tin Ứng Viên:
                  </h3>
                  <table width="100%" style="font-size: 14px; line-height: 1.8; color: #334155;">
                    <tr>
                      <td width="140" style="color: #64748b; font-weight: 600;">Họ và tên:</td>
                      <td><strong style="color: #0f172a; font-size: 15px;">${candidateName}</strong></td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; font-weight: 600;">Số điện thoại:</td>
                      <td>
                        <a href="tel:${phone}" style="color: #2D5A27; font-weight: 700; text-decoration: none;">
                          📞 ${phone}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; font-weight: 600;">Email liên hệ:</td>
                      <td>
                        <a href="mailto:${email}" style="color: #0284c7; text-decoration: none;">
                          ✉️ ${email}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style="color: #64748b; font-weight: 600;">Thời gian nộp:</td>
                      <td style="color: #475569;">${applyTimeVN}</td>
                    </tr>
                    ${ip ? `
                    <tr>
                      <td style="color: #64748b; font-weight: 600;">Địa chỉ IP:</td>
                      <td style="color: #94a3b8; font-family: monospace; font-size: 12px;">${ip}</td>
                    </tr>` : ''}
                  </table>
                </div>

                <!-- CV File link -->
                <div style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #cbd5e1; padding: 18px; margin-bottom: 22px;">
                  <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #0f172a;">
                    📎 Hồ Sơ Đính Kèm (CV):
                  </h4>
                  ${cvLink ? `
                    <div style="margin-bottom: 12px; font-size: 13px; color: #334155;">
                      Tên file: <strong>${cvFileName || 'CV_Ung_Tuyen.pdf'}</strong>
                    </div>
                    <a href="${cvLink}" target="_blank" style="display: inline-block; background-color: #2D5A27; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 13px;">
                      👉 Xem & Tải File CV Ngay
                    </a>
                  ` : `
                    <p style="margin: 0; font-size: 13px; color: #64748b; font-style: italic;">
                      Ứng viên không đính kèm file link trực tiếp. Vui lòng liên hệ qua SĐT/Email.
                    </p>
                  `}
                </div>

                <!-- Candidate notes -->
                ${notes ? `
                <div style="background-color: #ecfdf5; border-radius: 12px; border: 1px solid #a7f3d0; padding: 16px; margin-bottom: 22px;">
                  <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #065f46; text-transform: uppercase;">
                    📝 Lời Giới Thiệu / Ghi Chú Của Ứng Viên:
                  </h4>
                  <p style="margin: 0; font-size: 13px; color: #065f46; line-height: 1.6; white-space: pre-wrap;">
                    ${notes}
                  </p>
                </div>` : ''}

                <!-- Quick actions -->
                <div style="text-align: center; padding-top: 10px;">
                  <a href="tel:${phone}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 13px; margin-right: 8px;">
                    📞 Gọi Cho Ứng Viên
                  </a>
                  <a href="mailto:${email}?subject=Phản hồi hồ sơ ứng tuyển vị trí ${encodeURIComponent(jobTitle)} - PetM&M" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 13px;">
                    ✉️ Phản Hồi Qua Email
                  </a>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 30px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                  Hệ Thống Y Tế & Resort Thú Y PetM&M • Email Thông Báo Tự Động
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
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            <!-- Header Banner -->
            <tr>
              <td style="background: linear-gradient(135deg, #183B16 0%, #2D5A27 100%); padding: 32px 30px; text-align: center;">
                <div style="font-size: 13px; font-weight: 700; color: #FFB800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">
                  ${bannerTitle}
                </div>
                <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">
                  ${bannerSubtitle}
                </h1>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #e2e8f0;">
                  ${isEn ? 'Position:' : 'Vị trí:'} <strong style="color: #ffffff;">${jobTitle}</strong>
                </p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 28px 30px;">
                <p style="margin: 0 0 16px 0; font-size: 15px; color: #0f172a; line-height: 1.6;">
                  ${introText}
                </p>

                <div style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 18px; margin-bottom: 22px;">
                  <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #0f172a; text-transform: uppercase;">
                    📋 ${isEn ? 'Application Details:' : 'Thông Tin Đã Gửi:'}
                  </h4>
                  <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #334155; line-height: 1.8;">
                    <li>${isEn ? 'Full name:' : 'Họ và tên:'} <strong>${candidateName}</strong></li>
                    <li>${isEn ? 'Phone number:' : 'Số điện thoại:'} <strong>${phone}</strong></li>
                    <li>${isEn ? 'Applied position:' : 'Vị trí ứng tuyển:'} <strong>${jobTitle}</strong></li>
                    <li>${isEn ? 'Submitted at:' : 'Thời gian nộp:'} <strong>${applyTimeVN}</strong></li>
                  </ul>
                </div>

                ${checklistHtml ? `
                <div style="background-color: #ecfdf5; border-radius: 12px; border: 1px solid #a7f3d0; padding: 16px; margin-bottom: 22px;">
                  <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #065f46;">
                    💡 ${isEn ? 'Next Steps & Interview Process:' : 'Quy trình xét duyệt & Phỏng vấn:'}
                  </p>
                  <div style="font-size: 13px; color: #065f46; line-height: 1.6;">
                    ${checklistHtml}
                  </div>
                </div>` : ''}

                <div style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.6; white-space: pre-wrap;">
                  ${footerNote}
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 30px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                  Bệnh Viện Thú Y PetM&M • Hotline Tuyển Dụng: 0903 599 339
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

