import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyToken } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('petmm_admin_session')?.value;
    const currentUser = verifyToken(sessionToken);

    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const status = body?.status === 'away' ? 'away' : body?.status === 'offline' ? 'offline' : 'active';
    const nowIso = new Date().toISOString();

    const email = currentUser.email?.toLowerCase();
    if (!email) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    // Lấy thông tin user trong Supabase Auth
    const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr || !usersData) {
      return NextResponse.json({ success: false }, { status: 500 });
    }

    const authUser = usersData.users.find((u) => u.email?.toLowerCase() === email);
    if (authUser) {
      const currentMeta = authUser.user_metadata || {};
      await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        user_metadata: {
          ...currentMeta,
          tab_status: status,
          last_active_at: nowIso,
        },
      });
    }

    return NextResponse.json({ success: true, status, time: nowIso });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
