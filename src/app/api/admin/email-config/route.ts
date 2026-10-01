import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyToken } from '@/lib/adminAuth';

// Lấy cấu hình email hiện tại
export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('petmm_admin_session')?.value;
    const currentUser = verifyToken(sessionToken);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Bạn chưa đăng nhập quản trị!' },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('cau_hinh')
      .select('smtp_email, smtp_password, smtp_sender_name, smtp_notify_email')
      .eq('id', 'system')
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      config: {
        smtp_email: data?.smtp_email || 'thaitrtin@gmail.com',
        smtp_sender_name: data?.smtp_sender_name || 'Bệnh Viện Thú Y Pet M&M',
        smtp_notify_email: data?.smtp_notify_email || 'thaitrtin@gmail.com',
        hasPassword: Boolean(data?.smtp_password && data.smtp_password.trim().length > 0),
      },
    });
  } catch (err: any) {
    console.error('Lỗi GET email-config:', err);
    return NextResponse.json(
      { success: false, message: `Lỗi: ${err.message || 'Không thể tải cấu hình'}` },
      { status: 500 }
    );
  }
}

// Cập nhật cấu hình email
export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('petmm_admin_session')?.value;
    const currentUser = verifyToken(sessionToken);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Bạn chưa đăng nhập quản trị!' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { smtp_email, smtp_password, smtp_sender_name, smtp_notify_email } = body;

    if (!smtp_email || !smtp_email.trim()) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập địa chỉ Gmail gửi thư!' },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, string> = {
      smtp_email: smtp_email.trim(),
      smtp_sender_name: smtp_sender_name?.trim() || 'Bệnh Viện Thú Y Pet M&M',
      smtp_notify_email: smtp_notify_email?.trim() || smtp_email.trim(),
    };

    // Chỉ cập nhật mật khẩu nếu người dùng nhập mới
    if (typeof smtp_password === 'string' && smtp_password.trim().length > 0) {
      updatePayload.smtp_password = smtp_password.trim();
    }

    const { error } = await supabaseAdmin
      .from('cau_hinh')
      .update(updatePayload)
      .eq('id', 'system');

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Đã lưu cấu hình máy chủ gửi thư Gmail thành công!',
    });
  } catch (err: any) {
    console.error('Lỗi POST email-config:', err);
    return NextResponse.json(
      { success: false, message: `Lỗi: ${err.message || 'Không thể lưu cấu hình'}` },
      { status: 500 }
    );
  }
}
