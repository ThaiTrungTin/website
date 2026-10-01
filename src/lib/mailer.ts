import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ntkpdadakcyugvivvsjw.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

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
export async function createMailerTransport() {
  const config = await getSmtpConfig();

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
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const { transporter, config } = await createMailerTransport();

  const senderString = `"${config.smtp_sender_name}" <${config.smtp_email}>`;

  const info = await transporter.sendMail({
    from: senderString,
    to,
    subject,
    text: text || subject,
    html,
  });

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
export async function sendTestEmail(toEmail: string) {
  const subject = `[Pet M&M] Thử nghiệm cấu hình Gmail SMTP thành công!`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: sans-serif;">
    <div style="max-width: 520px; margin: 30px auto; background: #ffffff; border-radius: 20px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="display: inline-block; padding: 4px 12px; background: #dcfce7; color: #15803d; border-radius: 9999px; font-size: 11px; font-weight: bold;">KẾT NỐI THÀNH CÔNG</span>
        <h2 style="color: #0f172a; margin: 12px 0 6px 0;">Xin Chúc Mừng!</h2>
        <p style="color: #64748b; font-size: 13px; margin: 0;">Máy chủ gửi thư Gmail SMTP của bạn đã hoạt động hoàn hảo.</p>
      </div>
      <div style="background: #f8fafc; border-radius: 12px; padding: 16px; font-size: 13px; color: #334155; line-height: 1.6; margin-bottom: 20px;">
        <div>✓ Đã kích hoạt gửi mã OTP bảo mật không giới hạn.</div>
        <div>✓ Sẵn sàng gửi thư xác nhận lịch hẹn vé khám cho khách hàng.</div>
        <div>✓ Thời gian kiểm tra: ${new Date().toLocaleString('vi-VN')}</div>
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
    text: 'Thử nghiệm cấu hình Gmail SMTP cho Pet M&M thành công!',
  });
}
