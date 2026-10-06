import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendCustomerReceiptEmail, sendMail, getSmtpConfig, formatDateDMY } from '@/lib/mailer';

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

    // 2. TÍNH NĂNG CHỐNG SPAM: Kiểm tra số điện thoại hợp lệ (9 - 15 chữ số cho cả Việt Nam và Quốc Tế)
    if (numOnly.length < 9 || numOnly.length > 15) {
      return NextResponse.json(
        { success: false, message: isEn ? 'Please enter a valid phone number (9-15 digits)' : 'Vui lòng nhập số điện thoại hợp lệ (9 - 15 chữ số)' },
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
    // TÍNH NĂNG CHỐNG SPAM: CẤU HÌNH TỰ ĐỘNG TỪ ADMIN (IP, SĐT, EMAIL & SỐ LẦN)
    // ========================================================
    const { getNotificationSettings } = await import('@/lib/notificationSettings');
    const notifySettings = await getNotificationSettings().catch(() => null);

    const spamLimitEnabled = notifySettings?.spam_limit_enabled !== false;
    const checkIp = notifySettings?.spam_limit_ip !== false;
    const checkPhone = notifySettings?.spam_limit_phone !== false;
    const checkEmail = notifySettings?.spam_limit_email !== false;
    const maxBookingsPerDay =
      typeof notifySettings?.spam_max_bookings_per_day === 'number' && notifySettings.spam_max_bookings_per_day > 0
        ? notifySettings.spam_max_bookings_per_day
        : 3;
    const cooldownSeconds =
      typeof notifySettings?.spam_cooldown_seconds === 'number'
        ? notifySettings.spam_cooldown_seconds
        : 15;

    const isLocalhost = clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === 'localhost' || clientIp === 'unknown';
    const startOfDayISO = new Date(`${todayVN}T00:00:00+07:00`).toISOString();

    // 2.1. Kiểm tra giới hạn IP (chỉ áp dụng khi bật spamLimitEnabled và checkIp)
    let ipTodayCount = 0;
    if (spamLimitEnabled && checkIp && !isLocalhost) {
      ipTodayCount = dailyIpCountMap.get(dailyIpKey) || 0;
      if (ipTodayCount < maxBookingsPerDay) {
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
    }

    // 2.2. Kiểm tra giới hạn Số Điện Thoại
    let phoneTodayCount = 0;
    const dailyPhoneKey = `${todayVN}_phone_${numOnly}`;
    if (spamLimitEnabled && checkPhone && !isLocalhost) {
      phoneTodayCount = dailyIpCountMap.get(dailyPhoneKey) || 0;
      if (phoneTodayCount < maxBookingsPerDay) {
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
    }

    // 2.3. Kiểm tra giới hạn Email (nếu khách có điền email)
    let emailTodayCount = 0;
    const dailyEmailKey = cleanEmail && cleanEmail.includes('@') ? `${todayVN}_email_${cleanEmail}` : '';
    if (spamLimitEnabled && checkEmail && !isLocalhost && dailyEmailKey) {
      emailTodayCount = dailyIpCountMap.get(dailyEmailKey) || 0;
      if (emailTodayCount < maxBookingsPerDay) {
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

    if (
      spamLimitEnabled &&
      !isLocalhost &&
      ((checkIp && ipTodayCount >= maxBookingsPerDay) ||
        (checkPhone && phoneTodayCount >= maxBookingsPerDay) ||
        (checkEmail && emailTodayCount >= maxBookingsPerDay))
    ) {
      const waitSeconds = cooldownSeconds > 0 ? cooldownSeconds : 15;
      return NextResponse.json(
        {
          success: false,
          cooldown: waitSeconds,
          message: isEn
            ? `Please try again in ${waitSeconds}s`
            : `Vui lòng gửi lại sau ${waitSeconds}s`,
        },
        { status: 429 }
      );
    }

    // 3. TÍNH NĂNG CHỐNG SPAM: Rate Limiting theo Cooldown giữa 2 lần gửi liên tiếp
    if (spamLimitEnabled && cooldownSeconds > 0 && !isLocalhost) {
      const rateLimitKey = `${numOnly}_${clientIp}`;
      const now = Date.now();
      const lastSubmitTime = rateLimitMap.get(rateLimitKey);
      const cooldownMs = cooldownSeconds * 1000;

      if (lastSubmitTime && now - lastSubmitTime < cooldownMs) {
        const waitSeconds = Math.max(1, Math.ceil((cooldownMs - (now - lastSubmitTime)) / 1000));
        return NextResponse.json(
          {
            success: false,
            cooldown: waitSeconds,
            message: isEn
              ? `Please try again in ${waitSeconds}s`
              : `Vui lòng gửi lại sau ${waitSeconds}s`,
          },
          { status: 429 }
        );
      }
      rateLimitMap.set(rateLimitKey, now);
    }

    const isDummyPet = !petName || ['pet', 'bé cưng', 'be cung', 'beloved pet'].includes(petName.toLowerCase().trim());
    const finalPetName = isDummyPet ? '' : petName.trim();
    const finalPetType = finalPetName && petType && petType.trim() ? petType.trim() : '';
    const finalDate = date || todayVN;
    const finalTimeSlot = timeSlot && timeSlot.trim() ? timeSlot.trim() : (isEn ? 'Flexible' : 'Linh hoạt');

    // Sử dụng mã bookingCode từ client sinh sẵn (để phản hồi tức thì cho khách) hoặc sinh mới
    const finalBookingCode = clientBookingCode && /^PMM-\d{6}$/.test(clientBookingCode)
      ? clientBookingCode
      : 'PMM-' + Math.floor(100000 + Math.random() * 900000);

    const cleanNote = note ? note.trim() : '';
    const ipTag = `[IP: ${clientIp}]`;

    const langTag = `[Lang: ${isEn ? 'en' : 'vi'}]`;
    const finalGhiChu = `${langTag} ${cleanEmail ? `[Email: ${cleanEmail}] ` : ''}${cleanNote ? `${cleanNote} ` : ''}${ipTag}`.trim();

    const displayService = service && service.trim()
      ? service.trim()
      : (isEn ? 'General Health Check & Consultation' : 'Khám tổng quát & Tư vấn trực tiếp');

    const formattedDateDMY = formatDateDMY(finalDate);
    const formattedDateTime = timeSlot && timeSlot.trim()
      ? `${timeSlot}, ${isEn ? 'Date' : 'Ngày'} ${formattedDateDMY}`
      : `${isEn ? 'Date' : 'Ngày'} ${formattedDateDMY} (${isEn ? 'Flexible' : 'Linh hoạt'})`;
    const defaultBranchName = branchName || (isEn ? 'PetM&M Veterinary Clinic' : 'Bệnh Viện Thú Y PetM&M');

    // 1. Lưu vào bảng lich_hen
    const { error: dbError } = await supabaseAdmin.from('lich_hen').insert([
      {
        ma_lich_hen: finalBookingCode,
        ho_ten_chu: ownerName.trim(),
        so_dien_thoai: cleanPhone,
        ten_thu_cung: finalPetName,
        loai_thu_cung: finalPetType,
        chi_nhanh_id: branch || null,
        ten_chi_nhanh: defaultBranchName,
        dich_vu: displayService,
        ngay_hen: finalDate,
        gio_hen: finalTimeSlot,
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
    if (!isLocalhost) {
      dailyIpCountMap.set(dailyIpKey, ipTodayCount + 1);
      dailyIpCountMap.set(dailyPhoneKey, phoneTodayCount + 1);
      if (dailyEmailKey) {
        dailyIpCountMap.set(dailyEmailKey, emailTodayCount + 1);
      }
    }

    // 2. Lấy cấu hình email và zalo để kiểm tra luồng gửi
    let emailSent = false;
    const smtpConfig = await getSmtpConfig().catch(() => null);
    const emailAllEnabled = smtpConfig?.email_enabled !== false;
    const bookingEmailMode = smtpConfig?.email_booking_mode || 'always'; // 'always' | 'on_zalo_fail' | 'disabled'

    // 3. Gửi email tiếp nhận thông tin cho khách hàng (nếu khách có điền email)
    if (emailAllEnabled && cleanEmail && cleanEmail.includes('@')) {
      try {
        await sendCustomerReceiptEmail({
          toEmail: cleanEmail,
          bookingCode: finalBookingCode,
          ownerName: ownerName.trim(),
          phone: cleanPhone,
          service: displayService,
          dateTime: formattedDateTime,
          date: formattedDateDMY,
          timeSlot: timeSlot && timeSlot.trim() ? timeSlot.trim() : (isEn ? 'Flexible' : 'Linh hoạt'),
          isEn: Boolean(isEn),
        });
        emailSent = true;
      } catch (mailErr: any) {
        console.warn('Không thể gửi mail tiếp nhận khách hàng:', mailErr?.message || mailErr);
      }
    }

    // 5. Gửi thông báo đến email Admin phòng khám (nếu email chung bật)
    if (emailAllEnabled && smtpConfig?.smtp_notify_email) {
      try {
        const langBadge = isEn ? '🇬🇧 English' : '🇻🇳 Tiếng Việt';
        const adminSubject = `[LỊCH HẸN MỚI ${isEn ? '- ENG' : ''}] #${finalBookingCode} - Khách ${ownerName}${finalPetName ? ` (${finalPetName})` : ''}`;
        const adminHtml = `
          <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333;">
            <h2 style="color: #2D5A27;">🎉 Có Khách Hàng Vừa Đặt Lịch Hẹn Mới!</h2>
            <p><strong>Mã tiếp nhận:</strong> ${finalBookingCode}</p>
            <p><strong>Ngôn ngữ đặt hẹn:</strong> ${langBadge}</p>
            <p><strong>Khách hàng:</strong> ${ownerName} - SĐT: <a href="tel:${cleanPhone}">${cleanPhone}</a></p>
            ${cleanEmail ? `<p><strong>Email khách:</strong> ${cleanEmail}</p>` : ''}
            ${finalPetName ? `<p><strong>Bé cưng:</strong> ${finalPetName}${finalPetType ? ` (${finalPetType})` : ''}</p>` : ''}
            <p><strong>Cơ sở:</strong> ${defaultBranchName}</p>
            <p><strong>Dịch vụ:</strong> ${displayService}</p>
            <p><strong>Thời gian hẹn:</strong> ${formattedDateTime}</p>
            ${cleanNote ? `<p><strong>Ghi chú:</strong> ${cleanNote}</p>` : ''}
            <p><strong>Trạng thái:</strong> ⏳ Chờ nhân viên gọi chốt lịch &amp; gửi xác nhận sau</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #777;">Phòng Khám Thuộc Bệnh Viện Thú Cưng PetM&M</p>
          </div>
        `;
        await sendMail({
          to: smtpConfig.smtp_notify_email,
          subject: adminSubject,
          html: adminHtml,
        });
      } catch (adminMailErr: any) {
        console.warn('Lỗi gửi mail notify admin:', adminMailErr?.message || adminMailErr);
      }
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
