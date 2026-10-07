import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generateToken, AdminUser } from '@/lib/adminAuth';

// In-memory tracking số lần nhập sai OTP
const otpAttemptsMap = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otpCode, newPassword } = body;

    if (!email || !otpCode || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập đầy đủ email, mã OTP 6 số và mật khẩu mới!' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otpCode.trim();

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự theo tiêu chuẩn Supabase!' },
        { status: 400 }
      );
    }

    // 1. Kiểm tra mã OTP trong cơ sở dữ liệu Supabase (so khớp mã hash SHA-256 hoặc mã thô cũ)
    const hashedOtp = crypto.createHash('sha256').update(cleanOtp).digest('hex');
    const { data: otpRecords, error: selectErr } = await supabaseAdmin
      .from('admin_otp_codes')
      .select('*')
      .eq('email', cleanEmail)
      .in('code', [hashedOtp, cleanOtp])
      .gt('expires_at', new Date().toISOString())
      .limit(1);

    if (selectErr || !otpRecords || otpRecords.length === 0) {
      const currentFailed = (otpAttemptsMap.get(cleanEmail) || 0) + 1;
      otpAttemptsMap.set(cleanEmail, currentFailed);

      if (currentFailed >= 5) {
        // Hủy bỏ mã OTP trong database lập tức để chống dò mã
        await supabaseAdmin.from('admin_otp_codes').delete().eq('email', cleanEmail);
        otpAttemptsMap.delete(cleanEmail);
        return NextResponse.json(
          {
            success: false,
            message: 'Mã xác thực OTP đã bị vô hiệu hóa do nhập sai quá 5 lần. Vui lòng yêu cầu cấp lại mã OTP mới!',
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: `Mã xác thực 6 số không chính xác! (Còn ${5 - currentFailed} lần thử).`,
        },
        { status: 400 }
      );
    }

    // Nhập đúng -> xóa lịch sử thử sai
    otpAttemptsMap.delete(cleanEmail);

    const matchedRecord = otpRecords[0];

    // 2. Tìm tài khoản trong Supabase Auth
    const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) throw listErr;

    let targetUser = usersData.users.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    // Nếu là admin mặc định nhưng chưa có trong Supabase Auth thì tự động tạo
    if (!targetUser && cleanEmail === 'admin@petmm.vn') {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: newPassword,
        email_confirm: true,
        user_metadata: {
          ho_ten: 'Quản Trị Viên PetM&M',
          vai_tro: 'super_admin',
        },
      });
      if (createErr) throw createErr;
      targetUser = created.user;
    }

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy tài khoản quản trị để đổi mật khẩu!' },
        { status: 404 }
      );
    }

    // 3. Cập nhật trực tiếp mật khẩu mới vào mục Authentication của Supabase
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
      password: newPassword,
    });

    if (updateErr) throw updateErr;

    // 4. Xóa mã OTP đã sử dụng để chống dùng lại
    await supabaseAdmin.from('admin_otp_codes').delete().eq('id', matchedRecord.id);

    // 5. Tạo phiên đăng nhập tự động
    const metadata = targetUser.user_metadata || {};
    const adminUser: AdminUser = {
      username: targetUser.email?.split('@')[0] || 'admin',
      ho_ten: metadata.ho_ten || 'Thái Trung Tín (Admin)',
      vai_tro: metadata.vai_tro || 'super_admin',
      email: targetUser.email || cleanEmail,
    };

    const token = generateToken(adminUser);

    const res = NextResponse.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Đang tự động đăng nhập vào bảng quản trị...',
      user: adminUser,
    });

    res.cookies.set('petmm_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (err: any) {
    console.error('Lỗi verify-otp-reset:', err);
    return NextResponse.json(
      { success: false, message: `Lỗi: ${err.message || 'Không thể xác thực OTP'}` },
      { status: 500 }
    );
  }
}
