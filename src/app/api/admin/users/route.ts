import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyToken } from '@/lib/adminAuth';
import { sendMail } from '@/lib/mailer';

// GET: Lấy danh sách tất cả nhân sự / tài khoản quản trị
export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('petmm_admin_session')?.value;
    const currentUser = verifyToken(sessionToken);

    if (!currentUser || currentUser.vai_tro === 'user') {
      return NextResponse.json(
        { success: false, message: 'Bạn không có quyền truy cập trang quản trị nhân sự này!' },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) {
      console.error('Lỗi lấy danh sách user từ Supabase Auth:', error);
      return NextResponse.json(
        { success: false, message: 'Không thể lấy danh sách nhân sự từ Supabase: ' + error.message },
        { status: 500 }
      );
    }

    const users = (data.users || []).map((u) => {
      const meta = u.user_metadata || {};
      const isCurrent =
        u.email?.toLowerCase() === currentUser.email?.toLowerCase() ||
        u.email?.toLowerCase().startsWith(currentUser.username.toLowerCase() + '@');

      return {
        id: u.id,
        email: u.email || '',
        ho_ten: meta.ho_ten || u.email?.split('@')[0] || 'Chưa đặt tên',
        vai_tro: meta.vai_tro === 'user' ? 'user' : 'admin',
        trang_thai: meta.trang_thai || 'active', // 'active' | 'locked'
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        last_login_at: meta.last_login_at || u.last_sign_in_at || null,
        last_logout_at: meta.last_logout_at || null,
        last_active_at: meta.last_active_at || null,
        tab_status: meta.tab_status || 'offline',
        is_current_user: isCurrent,
      };
    });

    return NextResponse.json({
      success: true,
      users,
      total: users.length,
    });
  } catch (err: any) {
    console.error('Lỗi API GET /api/admin/users:', err);
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ khi lấy danh sách nhân sự!' },
      { status: 500 }
    );
  }
}

// POST: Thêm nhân sự mới (yêu cầu email thật) + tạo tài khoản + gửi email thông tin đăng nhập
export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('petmm_admin_session')?.value;
    const currentUser = verifyToken(sessionToken);

    if (!currentUser || currentUser.vai_tro === 'user') {
      return NextResponse.json(
        { success: false, message: 'Chỉ Quản trị viên (Admin) mới có quyền thêm nhân sự!' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { ho_ten, email, vai_tro, password: inputPassword } = body;

    if (!ho_ten || !ho_ten.trim()) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập Họ và tên nhân sự!' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập địa chỉ Email thật của nhân sự!' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: 'Email không đúng định dạng! Vui lòng nhập email thật (ví dụ: nhansu@gmail.com).' },
        { status: 400 }
      );
    }

    // Tự sinh mật khẩu ngẫu nhiên nếu không nhập
    const randomPassword =
      inputPassword && inputPassword.trim().length >= 6
        ? inputPassword.trim()
        : `PetMM@${Math.floor(100000 + Math.random() * 900000)}`;

    const cleanName = ho_ten.trim();
    const cleanRole = vai_tro === 'user' ? 'user' : 'admin';
    // Kiểm tra trùng lặp email trong hệ thống
    const { data: existingUsersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (!listErr && existingUsersData?.users) {
      const isDuplicate = existingUsersData.users.some(
        (u) => u.email?.toLowerCase().trim() === cleanEmail
      );
      if (isDuplicate) {
        return NextResponse.json(
          {
            success: false,
            message: `Email "${cleanEmail}" đã được sử dụng cho một tài khoản khác trong hệ thống! Vui lòng dùng email khác.`,
          },
          { status: 400 }
        );
      }
    }

    // 1. Tạo user trong Supabase Auth
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: randomPassword,
      email_confirm: true,
      user_metadata: {
        ho_ten: cleanName,
        vai_tro: cleanRole,
        trang_thai: 'active',
      },
    });

    if (createError) {
      console.error('Lỗi tạo user Supabase Auth:', createError);
      let errorMsg = createError.message;
      if (createError.message.includes('already been registered') || createError.message.includes('already exists')) {
        errorMsg = `Email "${cleanEmail}" đã được đăng ký tài khoản trước đó!`;
      }
      return NextResponse.json({ success: false, message: errorMsg }, { status: 400 });
    }

    // 2. Xác định link đăng nhập dựa theo vai trò
    const origin = req.nextUrl.origin || 'https://petsmm.vercel.app';
    const isUserRole = cleanRole === 'user';
    const loginUrl = isUserRole ? `${origin}/taodanhgia` : `${origin}/admin`;
    const portalName = isUserRole ? 'Cổng Tạo Đánh Giá Dịch Vụ Khách Hàng' : 'Cổng Quản Trị Hệ Thống Toàn Quyền';
    const roleDisplayName = isUserRole ? 'Nhân viên (User - Chỉ tạo đánh giá)' : 'Quản trị viên (Admin - Full quyền)';

    // 3. Gửi email chứa thông tin tài khoản và link đăng nhập
    let emailSent = false;
    let emailError = '';
    try {
      const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #2D5A27 0%, #1E3F1B 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">PETM&amp;M PET HOSPITAL</h1>
            <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">${portalName}</p>
          </div>

          <!-- Body -->
          <div style="padding: 32px 24px;">
            <p style="font-size: 16px; color: #1e293b; margin-top: 0;">Xin chào <strong>${cleanName}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">
              Tài khoản làm việc của bạn tại <strong>Bệnh Viện Thú Y PetM&amp;M</strong> đã được khởi tạo thành công bởi <strong>${currentUser.ho_ten || currentUser.username}</strong>. Dưới đây là thông tin đăng nhập chính thức của bạn:
            </p>

            <!-- Khung thông tin đăng nhập -->
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; width: 140px;">🌐 <strong>Cổng đăng nhập:</strong></td>
                  <td style="padding: 8px 0;"><a href="${loginUrl}" style="color: #2D5A27; font-weight: 700; text-decoration: underline;">${loginUrl}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">📧 <strong>Tên đăng nhập / Email:</strong></td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${cleanEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">🔑 <strong>Mật khẩu khởi tạo:</strong></td>
                  <td style="padding: 8px 0;">
                    <span style="display: inline-block; background: #e2e8f0; color: #0f172a; font-family: monospace; font-size: 16px; font-weight: 700; padding: 4px 10px; border-radius: 6px; letter-spacing: 1px;">${randomPassword}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">🛡️ <strong>Phân quyền:</strong></td>
                  <td style="padding: 8px 0; color: #2D5A27; font-weight: 600;">${roleDisplayName}</td>
                </tr>
              </table>
            </div>

            <!-- Nút bấm Đăng nhập -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${loginUrl}" style="display: inline-block; background: #2D5A27; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 12px rgba(45,90,39,0.3);">
                ${isUserRole ? 'Đăng Nhập Cổng Tạo Đánh Giá Ngay →' : 'Đăng Nhập Trang Quản Trị Ngay →'}
              </a>
            </div>

            <!-- Lời nhắc an toàn -->
            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-top: 24px;">
              <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
                🔒 <strong>Lưu ý bảo mật:</strong> Để đảm bảo an toàn, vui lòng đổi mật khẩu cá nhân ngay sau lần đăng nhập đầu tiên tại mục hồ sơ tài khoản.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0;">© 2026 PetM&amp;M Pet Hospital. Email này được gửi tự động từ hệ thống quản trị.</p>
          </div>
        </div>
      `;

      await sendMail({
        to: cleanEmail,
        subject: `[PetM&M] Thông tin tài khoản ${isUserRole ? 'Tạo Đánh Giá' : 'Quản Trị'} - ${cleanName}`,
        html: emailHtml,
        text: `Xin chào ${cleanName},\n\nTài khoản PetM&M của bạn đã được khởi tạo.\n- Link đăng nhập: ${loginUrl}\n- Email: ${cleanEmail}\n- Mật khẩu: ${randomPassword}\n- Vai trò: ${roleDisplayName}\n\nVui lòng đăng nhập và đổi mật khẩu sớm nhất!`,
      });
      emailSent = true;
    } catch (mailErr: any) {
      console.error('Lỗi gửi email cho nhân sự mới:', mailErr);
      emailError = mailErr?.message || 'Không thể kết nối máy chủ gửi mail SMTP';
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? `Đã tạo tài khoản và gửi email thông tin đăng nhập đến ${cleanEmail} thành công!`
        : `Đã tạo tài khoản thành công! (Lưu ý gửi mail: ${emailError}. Mật khẩu khởi tạo: ${randomPassword})`,
    });
  } catch (err: any) {
    console.error('Lỗi API POST /api/admin/users:', err);
    return NextResponse.json(
      { success: false, message: 'Đã xảy ra lỗi máy chủ khi thêm nhân sự: ' + (err.message || '') },
      { status: 500 }
    );
  }
}

// PATCH: Cập nhật phân quyền (vai_tro: 'admin' | 'user') hoặc trạng thái tài khoản (trang_thai: 'active' | 'locked')
export async function PATCH(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('petmm_admin_session')?.value;
    const currentUser = verifyToken(sessionToken);

    if (!currentUser || currentUser.vai_tro === 'user') {
      return NextResponse.json(
        { success: false, message: 'Chỉ Quản trị viên (Admin) mới có quyền thay đổi thông tin nhân sự!' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, vai_tro, trang_thai } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Thiếu ID người dùng!' }, { status: 400 });
    }

    const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr || !usersData) {
      return NextResponse.json({ success: false, message: 'Không thể tìm người dùng' }, { status: 500 });
    }

    const targetUser = usersData.users.find((u) => u.id === id);
    if (!targetUser) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy tài khoản!' }, { status: 404 });
    }

    const isCurrent =
      targetUser.email?.toLowerCase() === currentUser.email?.toLowerCase() ||
      targetUser.email?.toLowerCase().startsWith(currentUser.username.toLowerCase() + '@');

    // Không cho phép tự khóa tài khoản của chính mình
    if (isCurrent && trang_thai === 'locked') {
      return NextResponse.json(
        { success: false, message: 'Bạn không thể tự khóa tài khoản đang đăng nhập của chính mình!' },
        { status: 400 }
      );
    }

    // Không cho phép tự hạ quyền của chính mình thành User
    if (isCurrent && vai_tro === 'user') {
      return NextResponse.json(
        { success: false, message: 'Bạn không thể tự hạ quyền Admin của chính mình!' },
        { status: 400 }
      );
    }

    const meta = { ...targetUser.user_metadata };
    if (vai_tro !== undefined) {
      meta.vai_tro = vai_tro === 'user' ? 'user' : 'admin';
    }
    if (trang_thai !== undefined) {
      meta.trang_thai = trang_thai === 'locked' ? 'locked' : 'active';
    }

    const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(id, {
      user_metadata: meta,
    });

    if (updErr) {
      return NextResponse.json(
        { success: false, message: 'Lỗi cập nhật: ' + updErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật tài khoản thành công!',
      user: {
        id: targetUser.id,
        email: targetUser.email,
        vai_tro: meta.vai_tro,
        trang_thai: meta.trang_thai,
      },
    });
  } catch (err: any) {
    console.error('Lỗi API PATCH /api/admin/users:', err);
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ khi cập nhật tài khoản: ' + err.message },
      { status: 500 }
    );
  }
}

// DELETE: Xóa tài khoản nhân sự
export async function DELETE(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('petmm_admin_session')?.value;
    const currentUser = verifyToken(sessionToken);

    if (!currentUser || currentUser.vai_tro === 'user') {
      return NextResponse.json(
        { success: false, message: 'Chỉ Quản trị viên (Admin) mới có quyền xóa tài khoản nhân sự!' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Thiếu ID người dùng cần xóa!' },
        { status: 400 }
      );
    }

    // Không cho phép tự xóa tài khoản của chính mình
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const targetUser = usersData?.users?.find((u) => u.id === userId);
    if (
      targetUser &&
      (targetUser.email?.toLowerCase() === currentUser.email?.toLowerCase() ||
        targetUser.email?.toLowerCase().startsWith(currentUser.username.toLowerCase() + '@'))
    ) {
      return NextResponse.json(
        { success: false, message: 'Bạn không thể tự xóa tài khoản đang đăng nhập của chính mình!' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      console.error('Lỗi xóa user Supabase:', error);
      return NextResponse.json(
        { success: false, message: 'Không thể xóa tài khoản: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xóa tài khoản nhân sự thành công!',
    });
  } catch (err: any) {
    console.error('Lỗi API DELETE /api/admin/users:', err);
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ khi xóa nhân sự!' },
      { status: 500 }
    );
  }
}
