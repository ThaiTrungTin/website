import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyToken } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('petmm_admin_session')?.value;
    const currentUser = verifyToken(sessionToken);

    if (currentUser?.email) {
      try {
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        const authUser = usersData?.users?.find(
          (u) => u.email?.toLowerCase() === currentUser.email?.toLowerCase()
        );
        if (authUser) {
          const nowIso = new Date().toISOString();
          await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
            user_metadata: {
              ...authUser.user_metadata,
              last_logout_at: nowIso,
              last_active_at: nowIso,
              tab_status: 'offline',
            },
          });
        }
      } catch (e) {
        console.error('Lỗi cập nhật thời gian đăng xuất:', e);
      }
    }
  } catch {}

  const res = NextResponse.json({
    success: true,
    message: 'Đăng xuất thành công!',
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
