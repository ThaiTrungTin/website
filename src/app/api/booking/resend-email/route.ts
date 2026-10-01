import { NextRequest, NextResponse } from 'next/server';
import { sendBookingConfirmationEmail } from '@/lib/mailer';
import { verifyToken } from '@/lib/adminAuth';

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
      toEmail,
      bookingCode,
      ownerName,
      petName,
      petType = 'dog',
      branchName,
      service,
      dateTime,
      note,
    } = body;

    if (!toEmail || !toEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Địa chỉ email không hợp lệ!' },
        { status: 400 }
      );
    }

    await sendBookingConfirmationEmail({
      toEmail: toEmail.trim(),
      bookingCode,
      ownerName,
      petName,
      petType,
      branchName,
      service,
      dateTime,
      note,
      isEn: false,
    });

    return NextResponse.json({
      success: true,
      message: `Đã gửi thư xác nhận thành công tới ${toEmail}!`,
    });
  } catch (err: any) {
    console.error('Lỗi gửi lại thư xác nhận:', err);
    return NextResponse.json(
      { success: false, message: `Lỗi gửi thư: ${err.message || 'Không xác định'}` },
      { status: 500 }
    );
  }
}
