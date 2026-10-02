import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generateToken, AdminUser } from '@/lib/adminAuth';

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

    // 1. Kiểm tra mã OTP trong cơ sở dữ liệu Supabase
    const { data: otpRecords, error: selectErr } = await supabaseAdmin
      .from('admin_otp_codes')
      .select('*')
      .eq('email', cleanEmail)
      .eq('code', cleanOtp)
      .gt('expires_at', new Date().toISOString())
      .limit(1);

    if (selectErr || !otpRecords || otpRecords.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Mã xác thực 6 số không chính xác hoặc đã hết hạn (15 phút)! Vui lòng kiểm tra lại.',
        },
        { status: 400 }
      );
    }

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
      token,
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
