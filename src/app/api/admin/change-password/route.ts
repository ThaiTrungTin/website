import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyToken } from '@/lib/adminAuth';
import { logAuditServer } from '@/lib/auditLogger';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('petmm_admin_session')?.value;
    const currentUser = verifyToken(sessionToken);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Bạn chưa đăng nhập hoặc phiên đã hết hạn!' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới!' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự theo tiêu chuẩn bảo mật Supabase!' },
        { status: 400 }
      );
    }

    const email = currentUser.email || (currentUser.username.includes('@') ? currentUser.username : `${currentUser.username}@petmm.vn`);

    // 1. Kiểm tra mật khẩu hiện tại qua Supabase Auth
    const { error: signInErr } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInErr) {
      return NextResponse.json(
        { success: false, message: 'Mật khẩu hiện tại không chính xác!' },
        { status: 400 }
      );
    }

    // 2. Tìm ID người dùng trong Supabase Auth
    const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) throw listErr;

    const authUser = usersData.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (authUser) {
      // 3. Cập nhật trực tiếp mật khẩu mới vào mục Authentication của Supabase
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        password: newPassword,
      });

      if (updateErr) throw updateErr;
    } else {
      // Tạo mới nếu chưa có
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: newPassword,
        email_confirm: true,
        user_metadata: {
          ho_ten: currentUser.ho_ten || 'Quản Trị Viên PetM&M',
          vai_tro: currentUser.vai_tro || 'super_admin',
        },
      });
    }

    // Ghi nhật ký đổi mật khẩu
    await logAuditServer({
      nguoi_thuc_hien: currentUser.ho_ten || currentUser.username,
      vai_tro: currentUser.vai_tro,
      hanh_dong: 'SUA',
      chuyen_muc: 'Tài khoản',
      chi_tiet: `Đổi mật khẩu tài khoản (${currentUser.username})`,
    });

    return NextResponse.json({
      success: true,
      message: 'Đổi mật khẩu trong mục Bảo mật Supabase thành công!',
    });
  } catch (err: any) {
    console.error('Lỗi đổi mật khẩu:', err);
    return NextResponse.json(
      { success: false, message: `Lỗi: ${err.message || 'Không thể đổi mật khẩu'}` },
      { status: 500 }
    );
  }
}
