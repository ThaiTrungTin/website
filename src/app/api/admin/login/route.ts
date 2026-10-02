import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateToken, AdminUser } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!' },
        { status: 400 }
      );
    }

    const cleanInput = username.trim().toLowerCase();
    // Nếu người dùng nhập 'admin', tự động chuyển thành 'admin@petmm.vn' để khớp với Supabase Auth
    const email = cleanInput.includes('@') ? cleanInput : `${cleanInput}@petmm.vn`;

    let authenticatedUser: AdminUser | null = null;
    let authErrorMessage = '';

    // 1. Xác thực trực tiếp qua mục BẢO MẬT (Authentication -> Users) của Supabase
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!authError && authData.user) {
        const metadata = authData.user.user_metadata || {};
        authenticatedUser = {
          username: authData.user.email?.split('@')[0] || cleanInput,
          ho_ten: metadata.ho_ten || 'Thái Trung Tín (Admin)',
          vai_tro: metadata.vai_tro || 'super_admin',
          email: authData.user.email || email,
        };
      } else if (authError) {
        authErrorMessage = authError.message;
      }
    } catch (err: any) {
      console.warn('Lỗi Supabase Auth:', err);
    }

    // 2. Dự phòng tài khoản quản trị hệ thống
    if (!authenticatedUser) {
      if ((cleanInput === 'admin' || cleanInput === 'admin@petmm.vn') && (password === 'admin123' || password === 'admin')) {
        authenticatedUser = {
          username: 'admin',
          ho_ten: 'Quản Trị Viên PetM&M',
          vai_tro: 'super_admin',
        };
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'Tài khoản hoặc mật khẩu không chính xác! Vui lòng kiểm tra lại thông tin.',
        },
        { status: 401 }
      );
    }

    // 3. Tạo token phiên đăng nhập an toàn
    const token = generateToken(authenticatedUser);

    const res = NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công!',
      user: authenticatedUser,
      token,
    });

    res.cookies.set('petmm_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 ngày
    });

    return res;
  } catch (err: any) {
    console.error('Lỗi API Login:', err);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi máy chủ, vui lòng thử lại sau!' },
      { status: 500 }
    );
  }
}
