import nodemailer from 'nodemailer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export interface SmtpConfig {
  smtp_email: string;
  smtp_password?: string;
  smtp_sender_name: string;
  smtp_notify_email: string;
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
        smtp_sender_name: 'Bệnh Viện Thú Y Pet M&M',
        smtp_notify_email: 'thaitrtin@gmail.com',
      };
    }

    return {
      smtp_email: data.smtp_email || 'thaitrtin@gmail.com',
      smtp_password: data.smtp_password || '',
      smtp_sender_name: data.smtp_sender_name || 'Bệnh Viện Thú Y Pet M&M',
      smtp_notify_email: data.smtp_notify_email || 'thaitrtin@gmail.com',
    };
  } catch (err) {
    console.error('Lỗi đọc cấu hình SMTP:', err);
    return {
      smtp_email: 'thaitrtin@gmail.com',
      smtp_password: '',
      smtp_sender_name: 'Bệnh Viện Thú Y Pet M&M',
      smtp_notify_email: 'thaitrtin@gmail.com',
    };
  }
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

// Gửi email chung
export async function sendMail({
  to,
  subject,
  html,
  text,
  overrideConfig,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
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
                <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">Bệnh Viện Thú Y Pet M&M</h1>
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
                  <strong>Đội ngũ Kỹ thuật & Bảo mật Pet M&M</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
                <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                  Bệnh Viện Thú Y & Resort Nghỉ Dưỡng Thú Cưng Pet M&M<br>
                  Hotline Cấp Cứu 24/7: 0903 599 339 • TP. Thủ Đức, TP. Hồ Chí Minh
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
export async function sendTestEmail(toEmail: string, overrideConfig?: Partial<SmtpConfig>) {
  const subject = `[Pet M&M] Thử nghiệm cấu hình Gmail SMTP thành công!`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <div style="max-width: 520px; margin: 30px auto; background: #ffffff; border-radius: 20px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 12px; background: #dcfce7; color: #15803d; border-radius: 9999px; font-size: 11px; font-weight: bold;">KẾT NỐI THÀNH CÔNG</span>
        <h2 style="color: #0f172a; margin: 12px 0 6px 0;">Xin Chúc Mừng!</h2>
        <p style="color: #64748b; font-size: 13px; margin: 0;">Máy chủ gửi thư Gmail SMTP của bạn đã hoạt động hoàn hảo.</p>
      </div>
      <div style="background: #f8fafc; border-radius: 12px; padding: 16px; font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 16px;">
        <div style="margin-bottom: 6px;">✓ <strong>Email gửi:</strong> ${overrideConfig?.smtp_email || 'thaitrtin@gmail.com'}</div>
        <div style="margin-bottom: 6px;">✓ <strong>Email nhận:</strong> ${toEmail}</div>
        <div style="margin-bottom: 6px;">✓ Đã kích hoạt tính năng gửi mã OTP bảo mật và thông báo đặt lịch hẹn khám.</div>
        <div>✓ Thời gian kiểm tra: ${new Date().toLocaleString('vi-VN')}</div>
      </div>
      <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 12px 16px; font-size: 12px; color: #92400e; line-height: 1.5; margin-bottom: 20px;">
        💡 <strong>Mẹo quan trọng:</strong> Nếu bạn tìm thấy email này trong mục <strong>Thư rác (Spam)</strong> hoặc tab <strong>Quảng cáo / Cập nhật</strong>, vui lòng bấm nút <em>"Báo cáo không phải thư rác" (Not Spam)</em> để các email sau luôn vào Hộp thư chính.
      </div>
      <p style="text-align: center; font-size: 11px; color: #94a3b8; margin: 0;">
        Hệ Thống Quản Trị Y Tế & Resort Thú Cưng Pet M&M
      </p>
    </div>
  </body>
  </html>
  `;

  return sendMail({
    to: toEmail,
    subject,
    html,
    text: `Thử nghiệm cấu hình Gmail SMTP cho Pet M&M thành công! Đã gửi tới ${toEmail} lúc ${new Date().toLocaleString('vi-VN')}`,
    overrideConfig,
  });
}

// GỬI EMAIL XÁC NHẬN ĐẶT LỊCH HẸN CHO KHÁCH HÀNG
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
  const petTypeDisplay = isEn
    ? (petType === 'cat' ? 'Cat' : petType === 'dog' ? 'Dog' : 'Other Pet')
    : (petType === 'cat' ? 'Mèo' : petType === 'dog' ? 'Chó' : 'Loài khác');

  const subject = isEn
    ? `[Pet M&M] Appointment Confirmed - Code #${bookingCode} for ${petName}`
    : `[Pet M&M] Xác Nhận Lịch Hẹn #${bookingCode} cho bé ${petName}`;

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
                <div style="display: inline-block; padding: 6px 16px; background-color: rgba(255, 184, 0, 0.15); border: 1px solid rgba(255, 184, 0, 0.3); border-radius: 9999px; margin-bottom: 12px;">
                  <span style="color: #FFB800; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
                    ${isEn ? 'VETERINARY APPOINTMENT' : 'LỊCH HẸN TRỰC TUYẾN'}
                  </span>
                </div>
                <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">Bệnh Viện Thú Y Pet M&M</h1>
                <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">
                  ${isEn ? 'Appointment Booking Receipt' : 'Phiếu Tiếp Nhận Lịch Hẹn Khám & Chăm Sóc'}
                </p>
              </td>
            </tr>

            <!-- Content Body -->
            <tr>
              <td style="padding: 32px;">
                <p style="margin: 0 0 12px 0; font-size: 15px; color: #1e293b; line-height: 1.6;">
                  ${isEn ? 'Dear' : 'Kính gửi ba mẹ'} <strong>${ownerName}</strong>,
                </p>
                <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                  ${isEn
                    ? `Thank you for booking an appointment for <strong>${petName}</strong> at Pet M&M. We look forward to providing the best care for your furry family member.`
                    : `Cảm ơn bạn đã tin tưởng đặt lịch thăm khám cho bé <strong>${petName}</strong> tại Hệ thống Bệnh Viện Thú Y Pet M&M. Đội ngũ y bác sĩ đã tiếp nhận thông tin và sẵn sàng hỗ trợ chu đáo nhất.`}
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
                            <td><strong style="color: #2D5A27;">${dateTime}</strong></td>
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

                <!-- Helpful Tips -->
                <div style="background-color: #ecfdf5; border-radius: 12px; border: 1px solid #a7f3d0; padding: 14px 18px; margin-bottom: 24px;">
                  <p style="margin: 0; font-size: 12px; color: #065f46; line-height: 1.6;">
                    📌 <strong>${isEn ? 'Preparation Advice:' : 'Lưu ý chuẩn bị trước khi đến:'}</strong><br>
                    ${isEn
                      ? '• Please arrive 5-10 minutes prior to your time slot for check-in.<br>• Please leash dogs or keep cats in carriers for maximum safety.<br>• If your pet needs fasting for blood tests or surgery, please refrain from feeding 6-8 hours in advance.'
                      : '• Vui lòng đến trước 5 - 10 phút để bé được kiểm tra sinh hiệu ban đầu.<br>• Ba mẹ nhớ đeo xích hoặc dùng túi/balo vận chuyển cho bé để đảm bảo an toàn.<br>• Nếu cần xét nghiệm máu hoặc phẫu thuật, vui lòng nhịn ăn cho bé trước 6 - 8 tiếng.'}
                  </p>
                </div>

                <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.6;">
                  ${isEn
                    ? 'If you need to change your appointment or have an urgent query, please call our 24/7 hotline:'
                    : 'Nếu cần thay đổi giờ hẹn hoặc cần tư vấn khẩn cấp, vui lòng liên hệ ngay:'}
                  <br>
                  <strong style="color: #2D5A27; font-size: 16px;">📞 0364 605 544</strong> (${isEn ? 'Emergency 24/7' : 'Hotline 24/7'})
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; text-align: center;">
                <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.6;">
                  Hệ Thống Bệnh Viện Thú Y & Resort Nghỉ Dưỡng Chuẩn Quốc Tế Pet M&M<br>
                  TP. Thủ Đức, TP. Hồ Chí Minh • Website: <a href="https://petmm.vn" style="color: #2D5A27; text-decoration: none;">petmm.vn</a>
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
    text: `Lịch hẹn #${bookingCode} cho bé ${petName} tại ${branchName} lúc ${dateTime} đã được tiếp nhận. Hotline hỗ trợ: 0364 605 544.`,
  });
}
