import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/adminAuth';
import { sendMail } from '@/lib/mailer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

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
      applicantId,
      applicantEmail,
      applicantName,
      jobTitle,
      subject,
      interviewDate,
      interviewLocation,
      contactPerson,
      contactPhone,
      emailContent,
    } = body;

    if (!applicantEmail || !applicantEmail.trim()) {
      return NextResponse.json(
        { success: false, message: 'Ứng viên không có địa chỉ email!' },
        { status: 400 }
      );
    }

    if (!emailContent || !emailContent.trim()) {
      return NextResponse.json(
        { success: false, message: 'Nội dung thư mời phỏng vấn không được để trống!' },
        { status: 400 }
      );
    }

    const emailSubject = subject?.trim() || `[PetM&M] Thư Mời Phỏng Vấn Vị Trí ${jobTitle || 'Tuyển Dụng'}`;

    const isHtml = /<\/?[a-z][\s\S]*>/i.test(emailContent || '');
    const formattedContent = isHtml
      ? emailContent
      : (emailContent || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br/>');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          font-size: 15px;
          line-height: 1.65;
          color: #111827;
          background-color: #ffffff;
          margin: 0;
          padding: 16px 12px;
          -webkit-text-size-adjust: 100%;
        }
        .mail-content {
          max-width: 100%;
          word-break: break-word;
        }
        p {
          margin: 0 0 14px 0;
        }
        strong, b {
          font-weight: 700;
          color: #0f172a;
        }
        ul, ol {
          margin: 0 0 14px 0;
          padding-left: 22px;
        }
        li {
          margin-bottom: 6px;
        }
        a {
          color: #2563eb;
          text-decoration: underline;
        }
        .signature {
          margin-top: 24px;
          padding-top: 14px;
          border-top: 1px solid #e2e8f0;
          font-size: 13.5px;
          color: #475569;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="mail-content">
        ${formattedContent}
        <div class="signature">
          <p style="margin: 0; font-weight: bold; color: #1e293b;">Ban Tuyển Dụng — Bệnh Viện Thú Y PetM&amp;M</p>
          <p style="margin: 4px 0 0 0; color: #64748b;">Hotline: ${contactPhone || '0987 654 321'} · Địa chỉ: TP. Thủ Đức, TP. Hồ Chí Minh</p>
        </div>
      </div>
    </body>
    </html>
    `;

    // 1. Gửi Email qua SMTP transporter
    await sendMail({
      to: applicantEmail.trim(),
      subject: emailSubject,
      html,
    });

    // 2. Cập nhật số lần gửi và trạng thái ứng viên thành 'hen_phong_van'
    let newSendCount = 1;
    if (applicantId) {
      const { data: currentApp } = await supabaseAdmin
        .from('ho_so_tuyen_dung')
        .select('so_lan_gui_email')
        .eq('id', applicantId)
        .single();

      newSendCount = (currentApp?.so_lan_gui_email || 0) + 1;

      await supabaseAdmin
        .from('ho_so_tuyen_dung')
        .update({
          trang_thai: 'hen_phong_van',
          so_lan_gui_email: newSendCount,
          trang_thai_email: 'thanh_cong',
          ngay_cap_nhat: new Date().toISOString(),
        })
        .eq('id', applicantId);
    }

    return NextResponse.json({
      success: true,
      so_lan_gui_email: newSendCount,
      trang_thai_email: 'thanh_cong',
      message: `Đã gửi thư mời phỏng vấn tới email ${applicantEmail} và chuyển trạng thái thành "Đã hẹn PV"!`,
    });
  } catch (err: any) {
    console.error('Error sending interview email:', err);
    try {
      // Đánh dấu trạng thái lỗi gửi email nếu có applicantId
      const reqClone = req.clone ? await req.clone().json().catch(() => ({})) : {};
      const failAppId = reqClone.applicantId;
      if (failAppId) {
        await supabaseAdmin
          .from('ho_so_tuyen_dung')
          .update({
            trang_thai_email: 'that_bai',
            ngay_cap_nhat: new Date().toISOString(),
          })
          .eq('id', failAppId);
      }
    } catch {}
    return NextResponse.json(
      { success: false, message: `Không thể gửi thư mời: ${err.message || 'Lỗi hệ thống'}` },
      { status: 500 }
    );
  }
}
