import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendRecruitmentApplicationEmail } from '@/lib/mailer';

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

// In-memory cache hỗ trợ rate limit IP siêu nhanh
const ipApplicationCountMap = new Map<string, number>();

// ========================================================
// 1. GET: KIỂM TRA EMAIL ĐÃ ỨNG TUYỂN VỊ TRÍ NÀY CHƯA (LIVE CHECK)
// ========================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const jobId = searchParams.get('jobId');
    const isEn = searchParams.get('lang') === 'en';

    if (!email || !email.trim() || !jobId || !jobId.trim()) {
      return NextResponse.json({ hasApplied: false });
    }

    const cleanEmail = email.trim().toLowerCase();

    const { data: existingApp, error } = await supabaseAdmin
      .from('ho_so_tuyen_dung')
      .select('id, ngay_tao, tieu_de_vi_tri')
      .ilike('email', cleanEmail)
      .eq('tuyen_dung_id', jobId.trim())
      .maybeSingle();

    if (error) {
      console.warn('Lỗi kiểm tra email ứng tuyển:', error.message);
      return NextResponse.json({ hasApplied: false });
    }

    if (existingApp) {
      return NextResponse.json({
        hasApplied: true,
        code: 'ALREADY_APPLIED',
        message: isEn
          ? 'This email has already applied for this position. Our HR team is reviewing your profile!'
          : 'Email này đã ứng tuyển vị trí này rồi. Ban nhân sự đang xét duyệt hồ sơ của bạn!',
        appliedAt: existingApp.ngay_tao,
      });
    }

    return NextResponse.json({ hasApplied: false });
  } catch (err: any) {
    console.error('Lỗi API kiểm tra ứng tuyển:', err);
    return NextResponse.json({ hasApplied: false });
  }
}

// ========================================================
// 2. POST: TIẾP NHẬN HỒ SƠ ỨNG TUYỂN & TỰ ĐỘNG GỬI EMAIL
// ========================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      jobId,
      jobTitle,
      fullName,
      phoneNumber,
      email,
      pdfUrl,
      pdfFileName,
      cvLink,
      notes,
      isEn = false,
      hp_website, // Honeypot field bẫy bot
    } = body;

    const clientIp = getClientIp(req);

    // Bẫy bot: honeypot field
    if (hp_website && String(hp_website).trim().length > 0) {
      return NextResponse.json({
        success: true,
        message: isEn ? 'Application submitted successfully!' : 'Nộp hồ sơ ứng tuyển thành công!',
      });
    }

    // Rate limit IP (tối đa 5 lần nộp hồ sơ / IP / ngày)
    const ipCount = ipApplicationCountMap.get(clientIp) || 0;
    if (ipCount >= 5) {
      return NextResponse.json(
        {
          success: false,
          message: isEn
            ? 'You have submitted too many applications today. Please try again tomorrow!'
            : 'Bạn đã gửi hồ sơ quá nhiều lần hôm nay. Vui lòng quay lại vào ngày mai!',
        },
        { status: 429 }
      );
    }

    // ========================================================
    // VALIDATE THÔNG TIN ĐẦU VÀO
    // ========================================================
    if (!jobId || !jobTitle) {
      return NextResponse.json(
        { success: false, message: isEn ? 'Invalid job position.' : 'Vị trí tuyển dụng không hợp lệ.' },
        { status: 400 }
      );
    }

    if (!fullName || !fullName.trim()) {
      return NextResponse.json(
        { success: false, message: isEn ? 'Please enter your full name.' : 'Vui lòng nhập họ và tên của bạn.' },
        { status: 400 }
      );
    }

    const cleanPhone = (phoneNumber || '').replace(/\s+/g, '');
    const numOnly = cleanPhone.replace(/\D/g, '');

    if (numOnly.length < 8 || numOnly.length > 15) {
      return NextResponse.json(
        { success: false, message: isEn ? 'Please enter a valid phone number (8-15 digits).' : 'Vui lòng nhập số điện thoại hợp lệ (8 - 15 chữ số).' },
        { status: 400 }
      );
    }

    if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: isEn ? 'Please enter a valid email address.' : 'Vui lòng nhập địa chỉ email hợp lệ.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // ========================================================
    // TỐI ƯU 2: 1 EMAIL KHÔNG ĐƯỢC ỨNG TUYỂN NHIỀU HƠN 1 LẦN Ở 1 VỊ TRÍ
    // NẾU ĐIỀN VÀO SẼ BÁO ĐÃ ỨNG TUYỂN VỊ TRÍ NÀY
    // ========================================================
    const { data: existingApp, error: checkError } = await supabaseAdmin
      .from('ho_so_tuyen_dung')
      .select('id, ngay_tao')
      .ilike('email', cleanEmail)
      .eq('tuyen_dung_id', jobId)
      .maybeSingle();

    if (!checkError && existingApp) {
      return NextResponse.json(
        {
          success: false,
          code: 'ALREADY_APPLIED',
          message: isEn
            ? 'This email has already applied for this position. Our HR team is reviewing your profile!'
            : 'Email này đã ứng tuyển vị trí này rồi. Ban nhân sự đang xét duyệt hồ sơ của bạn!',
        },
        { status: 400 }
      );
    }

    // Xác định link CV
    const finalCvLink = pdfUrl || cvLink || '';

    // ========================================================
    // 3. LƯU HỒ SƠ VÀO BẢNG ho_so_tuyen_dung
    // ========================================================
    const { data: insertedApp, error: insertError } = await supabaseAdmin
      .from('ho_so_tuyen_dung')
      .insert([
        {
          tuyen_dung_id: jobId,
          tieu_de_vi_tri: jobTitle,
          ho_ten: fullName.trim(),
          so_dien_thoai: numOnly,
          email: cleanEmail,
          link_cv: finalCvLink || null,
          ten_file_cv: pdfFileName || (pdfUrl ? 'CV_Ung_Tuyen.pdf' : null),
          gioi_thieu: (notes || '').trim() || null,
          ip_address: clientIp,
          trang_thai: 'moi',
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Lỗi lưu hồ sơ tuyển dụng:', insertError);
      return NextResponse.json(
        {
          success: false,
          message: isEn
            ? 'Failed to save application. Please try again.'
            : 'Không thể lưu hồ sơ ứng tuyển. Vui lòng thử lại sau giây lát!',
        },
        { status: 500 }
      );
    }

    // Ghi nhận lượt nộp thành công
    ipApplicationCountMap.set(clientIp, ipCount + 1);

    // ========================================================
    // 4. TỰ ĐỘNG GỬI EMAIL VỀ NHÀ TUYỂN DỤNG & XÁC NHẬN CHO ỨNG VIÊN
    // ========================================================
    let emailSent = false;
    try {
      const { getSmtpConfig } = await import('@/lib/mailer');
      const smtpConfig = await getSmtpConfig().catch(() => null);
      const emailAllEnabled = smtpConfig?.email_enabled !== false;
      const recruitmentEmailEnabled = smtpConfig?.email_recruitment_enabled !== false;

      if (emailAllEnabled && recruitmentEmailEnabled) {
        await sendRecruitmentApplicationEmail({
          candidateName: fullName.trim(),
          phone: numOnly,
          email: cleanEmail,
          jobTitle,
          cvLink: finalCvLink,
          cvFileName: pdfFileName || (pdfUrl ? 'CV_Ung_Tuyen.pdf' : undefined),
          notes: (notes || '').trim(),
          isEn,
          ip: clientIp,
        });
        emailSent = true;
      }
    } catch (mailErr: any) {
      console.error('Lỗi gửi email tuyển dụng tự động:', mailErr);
    }

    return NextResponse.json({
      success: true,
      message: isEn
        ? 'Your application has been submitted successfully to PetM&M HR!'
        : 'Hồ sơ ứng tuyển của bạn đã được gửi thành công đến Ban Nhân Sự PetM&M!',
      application: {
        id: insertedApp.id,
        fullName: fullName.trim(),
        jobTitle,
        email: cleanEmail,
        phone: numOnly,
        emailSent,
      },
    });
  } catch (err: any) {
    console.error('Lỗi xử lý API ứng tuyển:', err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Đã xảy ra lỗi không mong muốn khi gửi hồ sơ.',
      },
      { status: 500 }
    );
  }
}
