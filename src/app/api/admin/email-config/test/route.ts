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

    let bodyData: any = null;
    try {
      bodyData = await req.json();
    } catch {
      // no body or invalid json
    }

    const dbConfig = await getSmtpConfig();
    const smtpEmail = bodyData?.smtp_email?.trim() || dbConfig.smtp_email || 'thaitrtin@gmail.com';
    const smtpPassword = bodyData?.smtp_password?.trim() || dbConfig.smtp_password || '';
    const smtpSenderName = bodyData?.smtp_sender_name?.trim() || dbConfig.smtp_sender_name || 'Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M';
    const targetEmail = bodyData?.smtp_notify_email?.trim() || dbConfig.smtp_notify_email || smtpEmail;
    const isEn = Boolean(bodyData?.isEn);
    const customTemplate = bodyData?.template;

    if (!smtpPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Chưa có Mật khẩu ứng dụng Google (16 chữ số). Vui lòng nhập Mật khẩu ứng dụng trước khi gửi thử nghiệm!',
        },
        { status: 400 }
      );
    }

    const activeConfig = {
      smtp_email: smtpEmail,
      smtp_password: smtpPassword,
      smtp_sender_name: smtpSenderName,
      smtp_notify_email: targetEmail,
    };

    console.log(`[Test Email API] Đang gửi thư thử nghiệm (${isEn ? 'English' : 'Tiếng Việt'}) từ ${smtpEmail} tới ${targetEmail}...`);
    const info = await sendTestEmail(targetEmail, activeConfig, {
      isEn,
      customTemplate,
    });

    return NextResponse.json({
      success: true,
      message: `Đã gửi mẫu email (${isEn ? 'English' : 'Tiếng Việt'}) thử nghiệm thành công tới "${targetEmail}"! Vui lòng kiểm tra Hộp thư đến (và cả mục Thư rác/Spam nếu chưa thấy).`,
      detail: {
        to: targetEmail,
        from: smtpEmail,
        messageId: info.messageId,
        language: isEn ? 'en' : 'vi',
      },
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
