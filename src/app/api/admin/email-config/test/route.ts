import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/adminAuth';
import { sendTestEmail, getSmtpConfig } from '@/lib/mailer';

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

    const config = await getSmtpConfig();

    if (!config.smtp_password || !config.smtp_password.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Chưa có Mật khẩu ứng dụng Google (16 chữ số). Vui lòng nhập và bấm "Lưu Cấu Hình" trước khi gửi thử nghiệm!',
        },
        { status: 400 }
      );
    }

    const targetEmail = config.smtp_notify_email || config.smtp_email || 'thaitrtin@gmail.com';

    await sendTestEmail(targetEmail);

    return NextResponse.json({
      success: true,
      message: `Đã gửi email thử nghiệm thành công tới "${targetEmail}"! Vui lòng kiểm tra hộp thư của bạn.`,
    });
  } catch (err: any) {
    console.error('Lỗi kiểm tra gửi mail:', err);
    let errorDetail = err.message || 'Không thể gửi email';
    if (errorDetail.includes('Invalid login') || errorDetail.includes('BadCredentials')) {
      errorDetail = 'Thông tin đăng nhập Gmail không chính xác! Vui lòng kiểm tra lại địa chỉ Gmail và Mật khẩu ứng dụng 16 chữ số của bạn.';
    }
    return NextResponse.json(
      { success: false, message: `Lỗi: ${errorDetail}` },
      { status: 500 }
    );
  }
}
