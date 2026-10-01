import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendOtpEmail, getSmtpConfig } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập địa chỉ email quản trị!' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Kiểm tra tài khoản có tồn tại trong Supabase Auth không
    const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) {
      console.error('Lỗi lấy danh sách user Supabase:', listErr);
    }

    const existingUser = usersData?.users?.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    if (!existingUser && cleanEmail !== 'admin@petmm.vn') {
      return NextResponse.json(
        {
          success: false,
          message: `Không tìm thấy tài khoản quản trị nào gắn với email "${cleanEmail}"!`,
        },
        { status: 404 }
      );
    }

    // 2. Tạo mã OTP ngẫu nhiên 6 chữ số an toàn
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 phút

    // Xóa mã OTP cũ nếu có
    await supabaseAdmin.from('admin_otp_codes').delete().eq('email', cleanEmail);

    // Lưu mã OTP mới vào cơ sở dữ liệu Supabase
    const { error: insertErr } = await supabaseAdmin.from('admin_otp_codes').insert({
      email: cleanEmail,
      code: otpCode,
      expires_at: expiresAt,
    });

    if (insertErr) {
      console.error('Lỗi lưu mã OTP vào Supabase:', insertErr);
    }

    // 3. Ưu tiên gửi mã OTP qua Gmail SMTP riêng
    const smtpConfig = await getSmtpConfig();
    let emailSentViaSmtp = false;

    if (smtpConfig.smtp_password && smtpConfig.smtp_password.trim().length > 0) {
      try {
        await sendOtpEmail(cleanEmail, otpCode);
        emailSentViaSmtp = true;
      } catch (smtpErr: any) {
        console.error('Lỗi gửi mail qua Gmail SMTP:', smtpErr.message);
      }
    }

    // 4. Nếu chưa có SMTP hoặc gửi SMTP thất bại, thử gửi qua Supabase mailer
    if (!emailSentViaSmtp) {
      let rateLimited = false;
      try {
        const origin = req.nextUrl.origin || 'http://localhost:3000';
        const redirectTo = `${origin}/admin?reset=true`;

        const { error: resetErr } = await supabaseAdmin.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo,
        });

        if (resetErr) {
          if (resetErr.message?.toLowerCase().includes('rate limit')) {
            rateLimited = true;
          }
        } else {
          emailSentViaSmtp = true;
        }
      } catch (e: any) {
        console.warn('Lỗi Supabase mailer:', e.message);
      }

      if (rateLimited && !emailSentViaSmtp) {
        return NextResponse.json(
          {
            success: false,
            message: 'Máy chủ gửi mail mặc định của Supabase đang bị giới hạn tần suất (2 mail/giờ). Vui lòng thiết lập Mật khẩu ứng dụng Gmail (SMTP) trong trang Admin để gửi mã ngay lập tức!',
          },
          { status: 429 }
        );
      }
    }

    // Trả về thông báo thành công (TUYỆT ĐỐI KHÔNG để lộ otpCode)
    return NextResponse.json({
      success: true,
      message: `Mã xác thực OTP 6 số đã được gửi tới hộp thư ${cleanEmail}. Vui lòng mở Gmail để kiểm tra và nhập mã!`,
    });
  } catch (err: any) {
    console.error('Lỗi API Forgot Password:', err);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi máy chủ, vui lòng thử lại sau!' },
      { status: 500 }
    );
  }
}
