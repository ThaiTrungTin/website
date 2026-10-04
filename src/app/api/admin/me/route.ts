import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get('petmm_admin_session')?.value;
  const user = verifyToken(sessionToken);

  if (!user) {
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }

  // Kiểm tra thời gian thực xem tài khoản có bị khóa hay đổi vai trò không
  let currentRole = user.vai_tro;
  let isLocked = false;
  if (user.email) {
    try {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      const authUser = usersData?.users?.find((u) => u.email?.toLowerCase() === user.email?.toLowerCase());
      if (authUser) {
        const meta = authUser.user_metadata || {};
        if (meta.trang_thai === 'locked') {
          isLocked = true;
        }
        if (meta.vai_tro) {
          currentRole = meta.vai_tro;
        }
      }
    } catch {}
  }

  if (isLocked) {
    const res = NextResponse.json({
      authenticated: false,
      locked: true,
      message: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên!',
      user: null,
    });
    res.cookies.set('petmm_admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return res;
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      ...user,
      vai_tro: currentRole,
    },
  });
}
