import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendBookingConfirmationEmail, sendMail, getSmtpConfig } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      ownerName,
      phone,
      email,
      petName,
      petType = 'dog',
      branch,
      branchName,
      service,
      date,
      timeSlot,
      note,
      isEn = false,
    } = body;

    // Validate bắt buộc
    if (!ownerName || !ownerName.trim()) {
      return NextResponse.json(
        { success: false, message: isEn ? 'Please enter your full name' : 'Vui lòng nhập họ và tên chủ nuôi' },
        { status: 400 }
      );
    }
    if (!phone || phone.trim().length < 9) {
      return NextResponse.json(
        { success: false, message: isEn ? 'Please enter a valid phone number' : 'Vui lòng nhập số điện thoại hợp lệ (từ 9 số)' },
        { status: 400 }
      );
    }
    if (!petName || !petName.trim()) {
      return NextResponse.json(
        { success: false, message: isEn ? "Please enter your pet's name" : 'Vui lòng nhập tên bé thú cưng' },
        { status: 400 }
      );
    }
    if (!branch) {
      return NextResponse.json(
        { success: false, message: isEn ? 'Please select a clinic branch' : 'Vui lòng chọn cơ sở tiếp đón' },
        { status: 400 }
      );
    }

    const randomCode = 'PMM-' + Math.floor(100000 + Math.random() * 900000);
    const cleanEmail = email ? email.trim() : '';
    const cleanNote = note ? note.trim() : '';

    // Gộp email vào ghi chú để lưu trữ an toàn trong Supabase lich_hen
    const finalGhiChu = cleanEmail
      ? `[Email: ${cleanEmail}] ${cleanNote}`.trim()
      : cleanNote;

    const displayService = service && service.trim()
      ? service.trim()
      : (isEn ? 'General Health Check & Consultation' : 'Khám tổng quát & Tư vấn trực tiếp');

    const formattedDateTime = `${timeSlot}, ${isEn ? 'Date' : 'Ngày'} ${date}`;

    // 1. Lưu vào bảng lich_hen
    const { error: dbError } = await supabaseAdmin.from('lich_hen').insert([
      {
        ma_lich_hen: randomCode,
        ho_ten_chu: ownerName.trim(),
        so_dien_thoai: phone.trim(),
        ten_thu_cung: petName.trim(),
        loai_thu_cung: petType,
        chi_nhanh_id: branch || null,
        ten_chi_nhanh: branchName || 'Hệ Thống Pet M&M',
        dich_vu: displayService,
        ngay_hen: date,
        gio_hen: timeSlot,
        ghi_chu: finalGhiChu || null,
        trang_thai: 'cho_xac_nhan',
      },
    ]);

    if (dbError) {
      console.error('Lỗi Supabase khi lưu lịch hẹn:', dbError);
      return NextResponse.json(
        { success: false, message: `Lỗi cơ sở dữ liệu: ${dbError.message}` },
        { status: 500 }
      );
    }

    // 2. Gửi email xác nhận nếu khách có cung cấp email
    let emailSent = false;
    if (cleanEmail && cleanEmail.includes('@')) {
      try {
        await sendBookingConfirmationEmail({
          toEmail: cleanEmail,
          bookingCode: randomCode,
          ownerName: ownerName.trim(),
          petName: petName.trim(),
          petType,
          branchName: branchName || 'Hệ Thống Pet M&M',
          service: displayService,
          dateTime: formattedDateTime,
          note: cleanNote,
          isEn: Boolean(isEn),
        });
        emailSent = true;
      } catch (mailErr: any) {
        console.warn('Không thể gửi mail xác nhận khách hàng:', mailErr?.message || mailErr);
      }
    }

    // 3. Gửi thông báo đến email Admin phòng khám (chạy ngầm không chặn luồng)
    try {
      const smtpConfig = await getSmtpConfig();
      if (smtpConfig?.smtp_notify_email) {
        const adminSubject = `[LỊCH HẸN MỚI] #${randomCode} - Khách ${ownerName} (${petName})`;
        const adminHtml = `
          <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333;">
            <h2 style="color: #2D5A27;">🎉 Có Khách Hàng Vừa Đặt Lịch Hẹn Mới!</h2>
            <p><strong>Mã tiếp nhận:</strong> ${randomCode}</p>
            <p><strong>Khách hàng:</strong> ${ownerName} - SĐT: <a href="tel:${phone}">${phone}</a></p>
            ${cleanEmail ? `<p><strong>Email khách:</strong> ${cleanEmail}</p>` : ''}
            <p><strong>Bé cưng:</strong> ${petName} (${petType})</p>
            <p><strong>Cơ sở:</strong> ${branchName}</p>
            <p><strong>Dịch vụ:</strong> ${displayService}</p>
            <p><strong>Thời gian hẹn:</strong> ${formattedDateTime}</p>
            ${cleanNote ? `<p><strong>Ghi chú:</strong> ${cleanNote}</p>` : ''}
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #777;">Vui lòng truy cập trang Quản Trị Hệ Thống Pet M&M để tiếp nhận và duyệt lịch hẹn.</p>
          </div>
        `;
        sendMail({
          to: smtpConfig.smtp_notify_email,
          subject: adminSubject,
          html: adminHtml,
        }).catch((e) => console.warn('Lỗi gửi mail notify admin:', e?.message));
      }
    } catch {}

    return NextResponse.json({
      success: true,
      booking: {
        code: randomCode,
        ownerName: ownerName.trim(),
        petName: petName.trim(),
        branchName: branchName || 'Hệ Thống Pet M&M',
        service: displayService,
        dateTime: formattedDateTime,
        emailSent,
      },
    });
  } catch (err: any) {
    console.error('Lỗi API /api/booking:', err);
    return NextResponse.json(
      { success: false, message: `Lỗi xử lý yêu cầu: ${err.message || 'Không xác định'}` },
      { status: 500 }
    );
  }
}
