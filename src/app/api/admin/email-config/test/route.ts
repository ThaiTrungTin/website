import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/adminAuth';
import {
  sendTestEmail,
  sendTestRecruitmentEmail,
  sendTestContactEmail,
  getSmtpConfig,
} from '@/lib/mailer';

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

    // Xác định phân loại thư thử nghiệm: 'booking' | 'recruitment' | 'contact'
    let type: 'booking' | 'recruitment' | 'contact' = bodyData?.type || bodyData?.category;

    const requestedTarget = bodyData?.target_email?.trim();

    // Tự động nhận diện loại thư nếu client không truyền type rõ ràng
    if (!type) {
      if (
        requestedTarget &&
        (requestedTarget === (bodyData?.smtp_notify_recruitment_email?.trim() || dbConfig.smtp_notify_recruitment_email))
      ) {
        type = 'recruitment';
      } else if (
        requestedTarget &&
        (requestedTarget === (bodyData?.smtp_notify_contact_email?.trim() || dbConfig.smtp_notify_contact_email))
      ) {
        type = 'contact';
      } else if (bodyData?.recruitmentTemplate && !bodyData?.template) {
        type = 'recruitment';
      } else {
        type = 'booking';
      }
    }

    let targetEmail = requestedTarget;
    if (!targetEmail) {
      if (type === 'recruitment') {
        targetEmail =
          bodyData?.smtp_notify_recruitment_email?.trim() ||
          dbConfig.smtp_notify_recruitment_email ||
          'tuyendung@petmm.vn';
      } else if (type === 'contact') {
        targetEmail =
          bodyData?.smtp_notify_contact_email?.trim() ||
          dbConfig.smtp_notify_contact_email ||
          'thaitrtin@gmail.com';
      } else {
        targetEmail =
          bodyData?.smtp_notify_email?.trim() ||
          dbConfig.smtp_notify_email ||
          smtpEmail;
      }
    }

    const isEn = Boolean(bodyData?.isEn);

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
      smtp_notify_recruitment_email: targetEmail,
      smtp_notify_contact_email: targetEmail,
    };

    console.log(`[Test Email API] Đang gửi thư thử nghiệm [${type.toUpperCase()}] (${isEn ? 'English' : 'Tiếng Việt'}) từ ${smtpEmail} tới ${targetEmail}...`);

    if (type === 'recruitment') {
      const customTemplate = bodyData?.recruitmentTemplate || bodyData?.template;
      const info = await sendTestRecruitmentEmail(targetEmail, activeConfig, {
        isEn,
        customTemplate,
      });

      return NextResponse.json({
        success: true,
        message: `Đã gửi mẫu email THỬ NGHIỆM TIẾP NHẬN HỒ SƠ TUYỂN DỤNG & CV (${isEn ? 'English' : 'Tiếng Việt'}) thành công tới "${targetEmail}"! Vui lòng kiểm tra Hộp thư đến (và cả mục Thư rác/Spam nếu chưa thấy).`,
        detail: {
          type: 'recruitment',
          to: targetEmail,
          from: smtpEmail,
          language: isEn ? 'en' : 'vi',
        },
      });
    }

    if (type === 'contact') {
      const info = await sendTestContactEmail(targetEmail, activeConfig, {
        isEn,
      });

      return NextResponse.json({
        success: true,
        message: `Đã gửi email THỬ NGHIỆM HÒM THƯ LIÊN HỆ & CSKH (${isEn ? 'English' : 'Tiếng Việt'}) thành công tới "${targetEmail}"! Vui lòng kiểm tra Hộp thư đến.`,
        detail: {
          type: 'contact',
          to: targetEmail,
          from: smtpEmail,
          language: isEn ? 'en' : 'vi',
        },
      });
    }

    // Default: booking confirmation test
    const customTemplate = bodyData?.template;
    const info = await sendTestEmail(targetEmail, activeConfig, {
      isEn,
      customTemplate,
    });

    return NextResponse.json({
      success: true,
      message: `Đã gửi mẫu email THỬ NGHIỆM TIẾP NHẬN LỊCH HẸN (${isEn ? 'English' : 'Tiếng Việt'}) thành công tới "${targetEmail}"! Vui lòng kiểm tra Hộp thư đến (và cả mục Thư rác/Spam nếu chưa thấy).`,
      detail: {
        type: 'booking',
        to: targetEmail,
        from: smtpEmail,
        messageId: info?.messageId,
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
