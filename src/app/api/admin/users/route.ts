import { NextRequest, NextResponse, after } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyToken } from '@/lib/adminAuth';
import { sendMail } from '@/lib/mailer';
import { logAuditServer } from '@/lib/auditLogger';

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
    const origin = req.nextUrl.origin || 'https://petmm.vn';
    const isUserRole = cleanRole === 'user';
    const loginUrl = isUserRole ? `${origin}/taodanhgia` : `${origin}/admin`;
    const roleDisplayName = isUserRole ? 'Nhân viên (Chỉ tạo đánh giá)' : 'Quản trị viên (Toàn quyền)';
    const cleanCreator = (currentUser.ho_ten || currentUser.username || 'Quản trị viên')
      .replace(/\s*\((Admin|User|Quản trị viên|Nhân viên)\)/gi, '')
      .trim();
    const autoFillUrl = `${loginUrl}?email=${encodeURIComponent(cleanEmail)}&pwd=${encodeURIComponent(randomPassword)}`;

    // 3. Gửi email chứa thông tin tài khoản và link đăng nhập
    let emailSent = false;
    let emailError = '';
    try {
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px 20px; color: #1e293b;">
          <p style="font-size: 15px; margin: 0 0 10px 0;">
            Xin chào <strong>${cleanName}</strong>,
          </p>
          <p style="font-size: 14px; color: #475569; line-height: 1.5; margin: 0 0 16px 0;">
            Tài khoản làm việc tại <strong>Bệnh Viện Thú Y PetM&amp;M</strong> của bạn đã được khởi tạo bởi <strong>${cleanCreator}</strong>. Dưới đây là thông tin đăng nhập:
          </p>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; margin: 0 0 18px 0;">
            <div style="padding-bottom: 10px; border-bottom: 1px solid #eef2f6;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Cổng đăng nhập</div>
              <div>
                <a href="${autoFillUrl}" style="color: #2D5A27; font-weight: 600; font-size: 13px; text-decoration: underline; word-break: break-all;">${loginUrl}</a>
              </div>
            </div>

            <div style="padding: 10px 0; border-bottom: 1px solid #eef2f6;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Tên đăng nhập / Email</div>
              <div style="font-size: 14px; font-weight: 600; color: #0f172a; word-break: break-all;">${cleanEmail}</div>
            </div>

            <div style="padding: 10px 0; border-bottom: 1px solid #eef2f6;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Mật khẩu</div>
              <table style="width: 100%; border-collapse: collapse; margin: 0; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px;">
                <tr>
                  <td style="padding: 8px 12px; vertical-align: middle;">
                    <span style="font-family: Consolas, Monaco, monospace; font-size: 16px; font-weight: 700; color: #1e3f1b; letter-spacing: 1px; user-select: all; -webkit-user-select: all;">${randomPassword}</span>
                  </td>
                  <td style="padding: 8px 10px; text-align: right; vertical-align: middle; width: 80px;">
                    <a href="${autoFillUrl}" style="background: #2D5A27; color: #ffffff; font-size: 11px; font-weight: 600; text-decoration: none; padding: 6px 10px; border-radius: 4px; display: inline-block; white-space: nowrap;">Tự điền</a>
                  </td>
                </tr>
              </table>
            </div>

            <div style="padding-top: 10px;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Vai trò</div>
              <div style="font-size: 13px; font-weight: 600; color: #2D5A27;">${roleDisplayName}</div>
            </div>
          </div>

          <div style="text-align: center; margin: 18px 0 16px;">
            <a href="${autoFillUrl}" style="display: block; background: #2D5A27; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-weight: 700; font-size: 14px; text-align: center;">
              ${isUserRole ? 'Đăng Nhập Cổng Tạo Đánh Giá' : 'Đăng Nhập Vào Hệ Thống'}
            </a>
          </div>

          <div style="margin-top: 22px; padding-top: 14px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #64748b; line-height: 1.5;">
            Trân trọng,<br>
            <strong>Bệnh Viện Thú Y PetM&amp;M</strong>
          </div>
        </div>
      `;

      // 3. Gửi email ngầm (background) không chặn phản hồi API để giao diện phản hồi tức thì
      const sendEmailTask = async () => {
        try {
          await sendMail({
            to: cleanEmail,
            subject: `[PetM&M] Thông tin tài khoản ${isUserRole ? 'Tạo Đánh Giá' : 'Quản Trị'} - ${cleanName}`,
            html: emailHtml,
            text: `Xin chào ${cleanName},\n\nTài khoản PetM&M của bạn đã được khởi tạo bởi ${cleanCreator}.\n- Link đăng nhập tự động: ${autoFillUrl}\n- Email: ${cleanEmail}\n- Mật khẩu: ${randomPassword}\n- Vai trò: ${roleDisplayName}\n\nVui lòng đăng nhập và đổi mật khẩu sớm nhất!`,
          });
          console.log(`[Users Background] Đã gửi email thông tin đăng nhập thành công đến: ${cleanEmail}`);
        } catch (mailErr: any) {
          console.error('[Users Background] Lỗi gửi email cho nhân sự mới:', mailErr?.message || mailErr);
        }
      };

      if (typeof after === 'function') {
        after(sendEmailTask);
      } else {
        sendEmailTask().catch((err) => console.error('[Users Background] Lỗi:', err));
      }
    } catch (err: any) {
      console.warn('Lỗi chuẩn bị email khởi tạo tài khoản:', err?.message || err);
    }

    // Ghi nhật ký hoạt động
    await logAuditServer({
      nguoi_thuc_hien: currentUser.ho_ten || currentUser.username,
      vai_tro: currentUser.vai_tro,
      hanh_dong: 'THEM',
      chuyen_muc: 'Tài khoản',
      chi_tiet: `Khởi tạo tài khoản nhân sự mới: "${cleanName}" (${cleanEmail}) với vai trò ${roleDisplayName}`,
      du_lieu_thay_doi: { email: cleanEmail, ho_ten: cleanName, vai_tro: roleDisplayName },
    });

    return NextResponse.json({
      success: true,
      message: `Đã tạo tài khoản thành công! Thông tin đăng nhập đang được gửi ngầm đến ${cleanEmail}.`,
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

    // Ghi nhật ký hoạt động
    const actionDetails = [];
    if (vai_tro !== undefined) actionDetails.push(`vai trò = ${meta.vai_tro}`);
    if (trang_thai !== undefined) actionDetails.push(`trạng thái = ${meta.trang_thai === 'locked' ? 'Đã khóa' : 'Đang hoạt động'}`);
    await logAuditServer({
      nguoi_thuc_hien: currentUser.ho_ten || currentUser.username,
      vai_tro: currentUser.vai_tro,
      hanh_dong: 'SUA',
      chuyen_muc: 'Tài khoản',
      chi_tiet: `Cập nhật tài khoản "${targetUser.user_metadata?.ho_ten || targetUser.email}" (${actionDetails.join(', ')})`,
      du_lieu_thay_doi: { id, updates: meta },
    });

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

    // Ghi nhật ký hoạt động
    await logAuditServer({
      nguoi_thuc_hien: currentUser.ho_ten || currentUser.username,
      vai_tro: currentUser.vai_tro,
      hanh_dong: 'XOA',
      chuyen_muc: 'Tài khoản',
      chi_tiet: `Xóa vĩnh viễn tài khoản nhân sự: "${targetUser?.user_metadata?.ho_ten || targetUser?.email}" (${targetUser?.email})`,
      du_lieu_thay_doi: { deletedUserId: userId, email: targetUser?.email },
    });

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
