import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendBookingConfirmationEmail, sendMail, getSmtpConfig, formatDateDMY } from '@/lib/mailer';

// In-memory rate limiting map chống spam: key = sđt_ip, value = timestamp
const rateLimitMap = new Map<string, number>();

// In-memory map theo dõi số lượng đặt lịch theo IP trong ngày: key = `${todayVN}_${ip}`, value = count
const dailyIpCountMap = new Map<string, number>();

function normalizeIp(ip: string): string {
  if (ip === '::1' || ip === '::ffff:127.0.0.1') return '127.0.0.1';
  return ip.replace(/^::ffff:/, '');
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return normalizeIp(first);
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return normalizeIp(realIp.trim());
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return normalizeIp(cfConnectingIp.trim());
  return '127.0.0.1';
}

function getTodayVN(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bookingCode: clientBookingCode,
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
      hp_website, // Honeypot field bẫy bot
    } = body;

    // 1. TÍNH NĂNG CHỐNG SPAM 1: Bẫy Honeypot
    // Nếu bot tự động điền trường ẩn này, im lặng trả về thành công giả lập mà không ghi vào DB/mail
    if (hp_website && hp_website.trim().length > 0) {
      console.warn('[Anti-Spam] Phát hiện Bot tự điền Honeypot field:', hp_website);
      return NextResponse.json({
        success: true,
        booking: {
          code: clientBookingCode || 'PMM-' + Math.floor(100000 + Math.random() * 900000),
          ownerName: (ownerName || '').trim(),
          petName: (petName || '').trim(),
          branchName: branchName || 'Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M',
          service: service || 'Khám tổng quát',
          dateTime: `${timeSlot || ''}, Ngày ${formatDateDMY(date || '')}`,
          emailSent: false,
        },
      });
    }

    // Xác định IP và ngày theo giờ Việt Nam
    const clientIp = getClientIp(req);
    const todayVN = getTodayVN();
    const dailyIpKey = `${todayVN}_${clientIp}`;

    // Validate bắt buộc
    if (!ownerName || !ownerName.trim()) {
      return NextResponse.json(
        { success: false, message: isEn ? 'Please enter your full name' : 'Vui lòng nhập họ và tên chủ nuôi' },
        { status: 400 }
      );
    }

    const cleanPhone = (phone || '').replace(/\s+/g, '');
    const numOnly = cleanPhone.replace(/\D/g, '');

    // 2. TÍNH NĂNG CHỐNG SPAM: Kiểm tra số điện thoại hợp lệ, loại trừ số rác / lặp
    if (numOnly.length < 9 || numOnly.length > 11) {
      return NextResponse.json(
        { success: false, message: isEn ? 'Please enter a valid phone number (9-11 digits)' : 'Vui lòng nhập số điện thoại hợp lệ (9 - 11 chữ số)' },
        { status: 400 }
      );
    }
    // Chặn chuỗi lặp số như 000000000, 111111111, hoặc 123456789
    if (/^(.)\1+$/.test(numOnly) || numOnly === '123456789' || numOnly === '0123456789') {
      return NextResponse.json(
        { success: false, message: isEn ? 'Invalid phone number pattern' : 'Số điện thoại không hợp lệ, vui lòng kiểm tra lại' },
        { status: 400 }
      );
    }

    const cleanEmail = (email || '').trim().toLowerCase();

    // ========================================================
    // TÍNH NĂNG CHỐNG SPAM: GIỚI HẠN TỐI ĐA 3 LỊCH HẸN / NGÀY
    // THEO IP, SỐ ĐIỆN THOẠI VÀ EMAIL
    // Nếu bắt đầu gửi tới tin thứ 4 mới chặn và báo lỗi song ngữ:
    // - VI: "Chỉ đặt tối đa 3 lịch hẹn trong 1 ngày"
    // - EN: "Maximum of 3 appointments allowed per day"
    // ========================================================
    const startOfDayISO = new Date(`${todayVN}T00:00:00+07:00`).toISOString();

    // 2.1. Kiểm tra giới hạn IP
    let ipTodayCount = dailyIpCountMap.get(dailyIpKey) || 0;
    if (ipTodayCount < 3 && clientIp !== '127.0.0.1' && clientIp !== 'unknown') {
      try {
        const { count, error } = await supabaseAdmin
          .from('lich_hen')
          .select('id', { count: 'exact', head: true })
          .gte('ngay_tao', startOfDayISO)
          .ilike('ghi_chu', `%[IP: ${clientIp}]%`);

        if (!error && typeof count === 'number') {
          ipTodayCount = Math.max(ipTodayCount, count);
          dailyIpCountMap.set(dailyIpKey, ipTodayCount);
        }
      } catch (dbErr) {
        console.warn('Lỗi kiểm tra số lượt IP từ Supabase:', dbErr);
      }
    }

    // 2.2. Kiểm tra giới hạn Số Điện Thoại
    const dailyPhoneKey = `${todayVN}_phone_${numOnly}`;
    let phoneTodayCount = dailyIpCountMap.get(dailyPhoneKey) || 0;
    if (phoneTodayCount < 3) {
      try {
        const { count, error } = await supabaseAdmin
          .from('lich_hen')
          .select('id', { count: 'exact', head: true })
          .gte('ngay_tao', startOfDayISO)
          .ilike('so_dien_thoai', `%${numOnly.slice(-9)}`);

        if (!error && typeof count === 'number') {
          phoneTodayCount = Math.max(phoneTodayCount, count);
          dailyIpCountMap.set(dailyPhoneKey, phoneTodayCount);
        }
      } catch (dbErr) {
        console.warn('Lỗi kiểm tra số lượt SĐT từ Supabase:', dbErr);
      }
    }

    // 2.3. Kiểm tra giới hạn Email (nếu khách có điền email)
    let emailTodayCount = 0;
    const dailyEmailKey = cleanEmail && cleanEmail.includes('@') ? `${todayVN}_email_${cleanEmail}` : '';
    if (dailyEmailKey) {
      emailTodayCount = dailyIpCountMap.get(dailyEmailKey) || 0;
      if (emailTodayCount < 3) {
        try {
          const { count, error } = await supabaseAdmin
            .from('lich_hen')
            .select('id', { count: 'exact', head: true })
            .gte('ngay_tao', startOfDayISO)
            .ilike('ghi_chu', `%[Email: ${cleanEmail}]%`);

          if (!error && typeof count === 'number') {
            emailTodayCount = Math.max(emailTodayCount, count);
            dailyIpCountMap.set(dailyEmailKey, emailTodayCount);
          }
        } catch (dbErr) {
          console.warn('Lỗi kiểm tra số lượt Email từ Supabase:', dbErr);
        }
      }
    }

    if (ipTodayCount >= 3 || phoneTodayCount >= 3 || emailTodayCount >= 3) {
      return NextResponse.json(
        {
          success: false,
          message: isEn
            ? 'Maximum of 3 appointments allowed per day'
            : 'Chỉ đặt tối đa 3 lịch hẹn trong 1 ngày',
        },
        { status: 429 }
      );
    }

    // 3. TÍNH NĂNG CHỐNG SPAM: Rate Limiting theo SĐT & IP (Cooldown 15 giây)
    const rateLimitKey = `${numOnly}_${clientIp}`;
    const now = Date.now();
    const lastSubmitTime = rateLimitMap.get(rateLimitKey);

    if (lastSubmitTime && now - lastSubmitTime < 15000) {
      const waitSeconds = Math.ceil((15000 - (now - lastSubmitTime)) / 1000);
      return NextResponse.json(
        {
          success: false,
          message: isEn
            ? `Please wait ${waitSeconds}s before submitting again to prevent spam.`
            : `Hệ thống chống spam: Vui lòng đợi ${waitSeconds} giây trước khi gửi tiếp.`,
        },
        { status: 429 }
      );
    }
    rateLimitMap.set(rateLimitKey, now);

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

    // Sử dụng mã bookingCode từ client sinh sẵn (để phản hồi tức thì cho khách) hoặc sinh mới
    const finalBookingCode = clientBookingCode && /^PMM-\d{6}$/.test(clientBookingCode)
      ? clientBookingCode
      : 'PMM-' + Math.floor(100000 + Math.random() * 900000);

    const cleanNote = note ? note.trim() : '';
    const ipTag = `[IP: ${clientIp}]`;

    // Gộp email và IP vào ghi chú để lưu trữ an toàn trong Supabase lich_hen
    const finalGhiChu = `${cleanEmail ? `[Email: ${cleanEmail}] ` : ''}${cleanNote ? `${cleanNote} ` : ''}${ipTag}`.trim();

    const displayService = service && service.trim()
      ? service.trim()
      : (isEn ? 'General Health Check & Consultation' : 'Khám tổng quát & Tư vấn trực tiếp');

    const formattedDateDMY = formatDateDMY(date);
    const formattedDateTime = `${timeSlot}, ${isEn ? 'Date' : 'Ngày'} ${formattedDateDMY}`;
    const defaultBranchName = branchName || 'Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M';

    // 1. Lưu vào bảng lich_hen
    const { error: dbError } = await supabaseAdmin.from('lich_hen').insert([
      {
        ma_lich_hen: finalBookingCode,
        ho_ten_chu: ownerName.trim(),
        so_dien_thoai: cleanPhone,
        ten_thu_cung: petName.trim(),
        loai_thu_cung: petType,
        chi_nhanh_id: branch || null,
        ten_chi_nhanh: defaultBranchName,
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

    // Cập nhật số lần gửi thành công của IP, SĐT và Email trong ngày
    dailyIpCountMap.set(dailyIpKey, ipTodayCount + 1);
    dailyIpCountMap.set(dailyPhoneKey, phoneTodayCount + 1);
    if (dailyEmailKey) {
      dailyIpCountMap.set(dailyEmailKey, emailTodayCount + 1);
    }

    // 2. Lấy cấu hình email và zalo để kiểm tra luồng gửi
    let emailSent = false;
    const smtpConfig = await getSmtpConfig().catch(() => null);
    const emailAllEnabled = smtpConfig?.email_enabled !== false;
    const bookingEmailMode = smtpConfig?.email_booking_mode || 'always'; // 'always' | 'on_zalo_fail' | 'disabled'

    // 3. Thử gửi tin nhắn Zalo OA (ZNS) trước
    let zaloSuccess = false;
    try {
      const { sendZaloZnsBookingNotification } = await import('@/lib/zalo');
      const zaloRes = await sendZaloZnsBookingNotification({
        phone: cleanPhone,
        bookingCode: finalBookingCode,
        ownerName: ownerName.trim(),
        petName: petName.trim(),
        service: displayService,
        dateTime: formattedDateTime,
        branchName: defaultBranchName,
      });
      if (zaloRes && zaloRes.success && !zaloRes.mock) {
        zaloSuccess = true;
      }
    } catch (zErr: any) {
      console.warn('[Zalo ZNS Failed]:', zErr?.message || zErr);
      zaloSuccess = false;
    }

    // 4. Quyết định có gửi email xác nhận cho khách hàng không:
    // - Khi email_enabled = true VÀ
    // - (bookingEmailMode === 'always' HOẶC (bookingEmailMode === 'on_zalo_fail' VÀ Zalo thất bại))
    const shouldSendCustomerEmail =
      emailAllEnabled &&
      bookingEmailMode !== 'disabled' &&
      (bookingEmailMode === 'always' || (bookingEmailMode === 'on_zalo_fail' && !zaloSuccess));

    if (shouldSendCustomerEmail && cleanEmail && cleanEmail.includes('@')) {
      try {
        await sendBookingConfirmationEmail({
          toEmail: cleanEmail,
          bookingCode: finalBookingCode,
          ownerName: ownerName.trim(),
          petName: petName.trim(),
          petType,
          branchName: defaultBranchName,
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

    // 5. Gửi thông báo đến email Admin phòng khám (nếu email chung bật)
    if (emailAllEnabled && smtpConfig?.smtp_notify_email) {
      try {
        const adminSubject = `[LỊCH HẸN MỚI] #${finalBookingCode} - Khách ${ownerName} (${petName})`;
        const adminHtml = `
          <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333;">
            <h2 style="color: #2D5A27;">🎉 Có Khách Hàng Vừa Đặt Lịch Hẹn Mới!</h2>
            <p><strong>Mã tiếp nhận:</strong> ${finalBookingCode}</p>
            <p><strong>Khách hàng:</strong> ${ownerName} - SĐT: <a href="tel:${cleanPhone}">${cleanPhone}</a></p>
            ${cleanEmail ? `<p><strong>Email khách:</strong> ${cleanEmail}</p>` : ''}
            <p><strong>Bé cưng:</strong> ${petName} (${petType})</p>
            <p><strong>Cơ sở:</strong> ${defaultBranchName}</p>
            <p><strong>Dịch vụ:</strong> ${displayService}</p>
            <p><strong>Thời gian hẹn:</strong> ${formattedDateTime}</p>
            ${cleanNote ? `<p><strong>Ghi chú:</strong> ${cleanNote}</p>` : ''}
            <p><strong>Trạng thái gửi Zalo ZNS:</strong> ${zaloSuccess ? '✅ Đã gửi' : '⚠️ Thất bại/Chưa kích hoạt'}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #777;">Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M</p>
          </div>
        `;
        sendMail({
          to: smtpConfig.smtp_notify_email,
          subject: adminSubject,
          html: adminHtml,
        }).catch((e) => console.warn('Lỗi gửi mail notify admin:', e?.message));
      } catch {}
    }

    return NextResponse.json({
      success: true,
      booking: {
        code: finalBookingCode,
        ownerName: ownerName.trim(),
        petName: petName.trim(),
        branchName: defaultBranchName,
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
