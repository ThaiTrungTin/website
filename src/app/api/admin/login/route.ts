import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generateToken, AdminUser } from '@/lib/adminAuth';

// In-memory rate limiting chống dò mật khẩu brute-force
const loginAttemptsMap = new Map<string, { count: number; lockedUntil: number }>();

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
    const email = cleanInput.includes('@') ? cleanInput : `${cleanInput}@petmm.vn`;

    // Kiểm tra giới hạn số lần thử đăng nhập (Rate limiting)
    const rateKey = cleanInput;
    const attemptInfo = loginAttemptsMap.get(rateKey);
    const now = Date.now();

    if (attemptInfo && attemptInfo.lockedUntil > now) {
      const remainingMinutes = Math.ceil((attemptInfo.lockedUntil - now) / 60000);
      return NextResponse.json(
        {
          success: false,
          message: `Tài khoản tạm thời bị khóa do nhập sai nhiều lần. Vui lòng thử lại sau ${remainingMinutes} phút!`,
        },
        { status: 429 }
      );
    }

    let authenticatedUser: AdminUser | null = null;
    let authErrorMessage = '';
    let isLocked = false;
    let rawUserId = '';
    let userMeta: any = {};
    let supabaseSession: any = null;

    // 1. Xác thực độc quyền qua Supabase Auth
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!authError && authData.user) {
        supabaseSession = authData.session;
        rawUserId = authData.user.id;
        userMeta = authData.user.user_metadata || {};

        if (userMeta.trang_thai === 'locked') {
          isLocked = true;
        } else {
          authenticatedUser = {
            username: authData.user.email?.split('@')[0] || cleanInput,
            ho_ten: userMeta.ho_ten || 'Thái Trung Tín (Admin)',
            vai_tro: userMeta.vai_tro === 'user' ? 'user' : (userMeta.vai_tro || 'admin'),
            email: authData.user.email || email,
          };
        }
      } else if (authError) {
        authErrorMessage = authError.message;
      }
    } catch (err: any) {
      console.warn('Lỗi Supabase Auth:', err);
    }

    if (isLocked) {
      return NextResponse.json(
        {
          success: false,
          message: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên. Vui lòng liên hệ Admin để được hỗ trợ!',
        },
        { status: 403 }
      );
    }

    // Nếu đăng nhập thất bại, tăng bộ đếm và khóa nếu quá 5 lần
    if (!authenticatedUser) {
      const current = loginAttemptsMap.get(rateKey) || { count: 0, lockedUntil: 0 };
      const newCount = current.count + 1;
      const lockedUntil = newCount >= 5 ? now + 15 * 60 * 1000 : 0;
      loginAttemptsMap.set(rateKey, { count: newCount, lockedUntil });

      if (newCount >= 5) {
        return NextResponse.json(
          {
            success: false,
            message: 'Đã nhập sai mật khẩu 5 lần liên tiếp. Vì lý do bảo mật, tài khoản bị tạm khóa 15 phút!',
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: `Tài khoản hoặc mật khẩu không chính xác! (Còn ${5 - newCount} lần thử)`,
        },
        { status: 401 }
      );
    }

    // Đăng nhập thành công -> xóa bỏ lịch sử thử sai
    loginAttemptsMap.delete(rateKey);

    // Cập nhật lần cuối đăng nhập & trạng thái presence
    if (rawUserId) {
      try {
        const nowIso = new Date().toISOString();
        await supabaseAdmin.auth.admin.updateUserById(rawUserId, {
          user_metadata: {
            ...userMeta,
            last_login_at: nowIso,
            last_active_at: nowIso,
            tab_status: 'active',
          },
        });
      } catch (updErr) {
        console.error('Lỗi cập nhật thời gian đăng nhập:', updErr);
      }
    }

    // 3. Tạo token phiên đăng nhập an toàn
    const token = generateToken(authenticatedUser);
    const redirectUrl = authenticatedUser.vai_tro === 'user' ? '/taodanhgia' : '/admin';

    const res = NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công!',
      user: authenticatedUser,
      redirectUrl,
      supabaseSession,
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
