import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export interface SmtpConfig {
  smtp_email: string;
  smtp_password?: string;
  smtp_sender_name: string;
  smtp_notify_email: string;
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
  subjectVi: '[Pet M&M] Xác Nhận Lịch Hẹn #{booking_code} cho bé {pet_name}',
  bannerTitleVi: 'Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M',
  bannerSubtitleVi: 'Phiếu Tiếp Nhận Lịch Hẹn Khám & Chăm Sóc',
  introVi: 'Cảm ơn bạn đã tin tưởng đặt lịch thăm khám cho bé <strong>{pet_name}</strong> tại Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M. Đội ngũ y bác sĩ đã tiếp nhận thông tin và sẵn sàng hỗ trợ chu đáo nhất.',
  checklistVi: `• Vui lòng đến trước 5 - 10 phút để bé được kiểm tra sinh hiệu ban đầu.
• Ba mẹ nhớ đeo xích hoặc dùng túi/balo vận chuyển cho bé để đảm bảo an toàn.
• Nếu cần xét nghiệm máu hoặc phẫu thuật, vui lòng nhịn ăn cho bé trước 6 - 8 tiếng.`,
  footerVi: 'Nếu cần thay đổi giờ hẹn hoặc cần tư vấn khẩn cấp, vui lòng liên hệ ngay:',

  // TIẾNG ANH
  subjectEn: '[Pet M&M] Appointment Confirmed - Code #{booking_code} for {pet_name}',
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

// Lấy cấu hình SMTP từ bảng cau_hinh
export async function getSmtpConfig(): Promise<SmtpConfig> {
  try {
    const { data, error } = await supabaseAdmin
      .from('cau_hinh')
      .select('smtp_email, smtp_password, smtp_sender_name, smtp_notify_email')
      .eq('id', 'system')
      .maybeSingle();

    if (error || !data) {
      return {
        smtp_email: 'thaitrtin@gmail.com',
        smtp_password: '',
        smtp_sender_name: 'Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M',
        smtp_notify_email: 'thaitrtin@gmail.com',
      };
    }

    return {
      smtp_email: data.smtp_email || 'thaitrtin@gmail.com',
      smtp_password: data.smtp_password || '',
      smtp_sender_name: data.smtp_sender_name || 'Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M',
      smtp_notify_email: data.smtp_notify_email || 'thaitrtin@gmail.com',
    };
  } catch (err) {
    console.error('Lỗi đọc cấu hình SMTP:', err);
    return {
      smtp_email: 'thaitrtin@gmail.com',
      smtp_password: '',
      smtp_sender_name: 'Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M',
      smtp_notify_email: 'thaitrtin@gmail.com',
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
  const subject = `[Pet M&M] Mã xác thực OTP đặt lại mật khẩu: ${otpCode}`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Mã Xác Thực Pet M&M</title>
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
    text: `Mã OTP xác thực đặt lại mật khẩu Pet M&M của bạn là: ${otpCode}. Hiệu lực 15 phút.`,
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
    branchName: isEn ? 'Pet M&M District 2 Clinic' : 'Cơ sở Thảo Điền - TP. Thủ Đức',
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
        <img src="${templateCfg.logoUrl}" alt="Pet M&M Logo" style="max-height: 48px; max-width: 190px; object-fit: contain;" />
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
          <img src="cid:petmm_logo_img" alt="Pet M&M Logo" style="max-height: 48px; max-width: 190px; object-fit: contain;" />
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
