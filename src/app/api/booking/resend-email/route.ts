import { NextRequest, NextResponse } from 'next/server';
import { sendBookingConfirmationEmail } from '@/lib/mailer';
import { verifyToken } from '@/lib/adminAuth';
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
      bookingId,
      toEmail,
      bookingCode,
      ownerName,
      phone,
      petName,
      petType = 'dog',
      branchName,
      service,
      dateTime,
      date,
      timeSlot,
      note,
      isEn = false,
    } = body;

    if (!toEmail || !toEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Địa chỉ email không hợp lệ!' },
        { status: 400 }
      );
    }

    const targetQuery = bookingId
      ? supabaseAdmin.from('lich_hen').select('id, so_lan_gui_email').eq('id', bookingId).single()
      : bookingCode
      ? supabaseAdmin.from('lich_hen').select('id, so_lan_gui_email').eq('ma_lich_hen', bookingCode).single()
      : null;

    let targetBooking: any = null;
    if (targetQuery) {
      const { data } = await targetQuery;
      targetBooking = data;
    }

    try {
      await sendBookingConfirmationEmail({
        toEmail: toEmail.trim(),
        bookingCode,
        ownerName,
        phone,
        petName,
        petType,
        branchName,
        service,
        dateTime,
        date,
        timeSlot,
        note,
        isEn: Boolean(isEn),
      });

      let newCount = 1;
      if (targetBooking?.id) {
        newCount = (targetBooking.so_lan_gui_email || 0) + 1;
        await supabaseAdmin
          .from('lich_hen')
          .update({
            so_lan_gui_email: newCount,
            trang_thai_email: 'thanh_cong',
            ngay_cap_nhat: new Date().toISOString(),
          })
          .eq('id', targetBooking.id);
      }

      return NextResponse.json({
        success: true,
        so_lan_gui_email: newCount,
        trang_thai_email: 'thanh_cong',
        message: `Đã gửi thư xác nhận thành công tới ${toEmail}!`,
      });
    } catch (sendErr: any) {
      if (targetBooking?.id) {
        await supabaseAdmin
          .from('lich_hen')
          .update({
            trang_thai_email: 'that_bai',
            ngay_cap_nhat: new Date().toISOString(),
          })
          .eq('id', targetBooking.id);
      }
      throw sendErr;
    }
  } catch (err: any) {
    console.error('Lỗi gửi lại thư xác nhận:', err);
    return NextResponse.json(
      { success: false, message: `Lỗi gửi thư: ${err.message || 'Không xác định'}` },
      { status: 500 }
    );
  }
}

