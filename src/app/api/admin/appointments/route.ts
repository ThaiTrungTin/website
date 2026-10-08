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
      .from('lich_hen')
      .select('*')
      .order('ngay_tao', { ascending: false });

    if (error) {
      console.error('Lỗi lấy danh sách lịch hẹn từ database:', error);
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
    console.error('Lỗi API appointments GET:', err);
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
        { success: false, message: 'Thiếu ID lịch hẹn!' },
        { status: 400 }
      );
    }

    updates.ngay_cap_nhat = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('lich_hen')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Lỗi cập nhật lịch hẹn qua admin API:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // Ghi nhật ký hoạt động
    const statusLabels: Record<string, string> = {
      cho_xac_nhan: 'Chờ xác nhận',
      da_xac_nhan: 'Đã xác nhận',
      da_kham: 'Đã hoàn thành khám',
      da_huy: 'Đã hủy',
    };
    const actionDesc = updates.trang_thai
      ? `Đổi trạng thái lịch hẹn khách "${data?.ten_khach_hang || 'Ẩn danh'}" (SĐT: ${data?.so_dien_thoai || '—'}) sang "${statusLabels[updates.trang_thai] || updates.trang_thai}"`
      : `Cập nhật thông tin lịch hẹn khách "${data?.ten_khach_hang || 'Ẩn danh'}"`;

    await logAuditServer({
      nguoi_thuc_hien: currentUser.ho_ten || currentUser.username,
      vai_tro: currentUser.vai_tro,
      hanh_dong: updates.trang_thai ? 'XU_LY' : 'SUA',
      chuyen_muc: 'Lịch hẹn',
      chi_tiet: actionDesc,
      du_lieu_thay_doi: { id, updates },
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error('Lỗi API appointments PATCH:', err);
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
        { success: false, message: 'Thiếu ID lịch hẹn!' },
        { status: 400 }
      );
    }

    // Lấy thông tin lịch hẹn trước khi xóa để ghi nhật ký
    const { data: existingApp } = await supabaseAdmin
      .from('lich_hen')
      .select('ten_khach_hang, so_dien_thoai, ngay_hen, gio_hen, dich_vu')
      .eq('id', id)
      .single();

    const { error } = await supabaseAdmin.from('lich_hen').delete().eq('id', id);

    if (error) {
      console.error('Lỗi xóa lịch hẹn qua admin API:', error);
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
      chuyen_muc: 'Lịch hẹn',
      chi_tiet: `Xóa lịch hẹn của khách "${existingApp?.ten_khach_hang || 'Ẩn danh'}" (SĐT: ${existingApp?.so_dien_thoai || '—'}, Ngày: ${existingApp?.ngay_hen || '—'} ${existingApp?.gio_hen || ''})`,
      du_lieu_thay_doi: { id, deleted: existingApp },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Lỗi API appointments DELETE:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Lỗi máy chủ' },
      { status: 500 }
    );
  }
}

