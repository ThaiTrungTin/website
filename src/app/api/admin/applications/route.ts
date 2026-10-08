import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyToken } from '@/lib/adminAuth';
import { logAuditServer } from '@/lib/auditLogger';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      .from('ho_so_tuyen_dung')
      .select('*')
      .order('ngay_tao', { ascending: false });

    if (error) {
      console.error('Lỗi lấy danh sách hồ sơ tuyển dụng từ database:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (err: any) {
    console.error('Lỗi API applications GET:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Lỗi máy chủ' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Thiếu ID hồ sơ tuyển dụng!' },
        { status: 400 }
      );
    }

    updates.ngay_cap_nhat = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('ho_so_tuyen_dung')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Lỗi cập nhật hồ sơ tuyển dụng:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // Ghi nhật ký hoạt động
    await logAuditServer({
      nguoi_thuc_hien: currentUser.ho_ten || currentUser.username,
      vai_tro: currentUser.vai_tro,
      hanh_dong: updates.trang_thai ? 'XU_LY' : 'SUA',
      chuyen_muc: 'Tuyển dụng',
      chi_tiet: updates.trang_thai
        ? `Đổi trạng thái hồ sơ ứng viên "${data.ho_ten || 'Ứng viên'}" (${data.vi_tri || '—'}) sang "${updates.trang_thai}"`
        : `Cập nhật hồ sơ ứng viên "${data.ho_ten || 'Ứng viên'}"`,
      du_lieu_thay_doi: { id, updates },
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật hồ sơ thành công!',
      data,
    });
  } catch (err: any) {
    console.error('Lỗi API applications PATCH:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Lỗi máy chủ' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('petmm_admin_session')?.value;
    const currentUser = verifyToken(sessionToken);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Bạn chưa đăng nhập quản trị!' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Thiếu ID hồ sơ tuyển dụng!' },
        { status: 400 }
      );
    }

    // Lấy thông tin ứng viên trước khi xóa để ghi nhật ký
    const { data: existingApp } = await supabaseAdmin
      .from('ho_so_tuyen_dung')
      .select('ho_ten, email, so_dien_thoai, vi_tri')
      .eq('id', id)
      .single();

    const { error } = await supabaseAdmin
      .from('ho_so_tuyen_dung')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Lỗi xóa hồ sơ tuyển dụng:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // Ghi nhật ký hoạt động
    await logAuditServer({
      nguoi_thuc_hien: currentUser.ho_ten || currentUser.username,
      vai_tro: currentUser.vai_tro,
      hanh_dong: 'XOA',
      chuyen_muc: 'Tuyển dụng',
      chi_tiet: `Xóa hồ sơ ứng viên "${existingApp?.ho_ten || 'Ứng viên'}" (${existingApp?.vi_tri || '—'})`,
      du_lieu_thay_doi: { deleted: existingApp },
    });

    return NextResponse.json({
      success: true,
      message: 'Đã xóa hồ sơ tuyển dụng thành công!',
    });
  } catch (err: any) {
    console.error('Lỗi API applications DELETE:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Lỗi máy chủ' },
      { status: 500 }
    );
  }
}
