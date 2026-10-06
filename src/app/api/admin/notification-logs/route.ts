import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyToken } from '@/lib/adminAuth';

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

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '30')));
    const kenh = searchParams.get('kenh') || 'all'; // 'all' | 'email' | 'zalo'
    const trangThai = searchParams.get('trang_thai') || 'all'; // 'all' | 'thanh_cong' | 'that_bai'
    const search = (searchParams.get('search') || '').trim().toLowerCase();

    // 1. Thống kê bộ đếm tổng quan
    const [
      { count: emailThanhCong },
      { count: emailThatBai },
      { count: zaloThanhCong },
      { count: zaloThatBai },
    ] = await Promise.all([
      supabaseAdmin
        .from('nhat_ky_gui_tin')
        .select('*', { count: 'exact', head: true })
        .eq('kenh', 'email')
        .eq('trang_thai', 'thanh_cong'),
      supabaseAdmin
        .from('nhat_ky_gui_tin')
        .select('*', { count: 'exact', head: true })
        .eq('kenh', 'email')
        .eq('trang_thai', 'that_bai'),
      supabaseAdmin
        .from('nhat_ky_gui_tin')
        .select('*', { count: 'exact', head: true })
        .eq('kenh', 'zalo')
        .eq('trang_thai', 'thanh_cong'),
      supabaseAdmin
        .from('nhat_ky_gui_tin')
        .select('*', { count: 'exact', head: true })
        .eq('kenh', 'zalo')
        .eq('trang_thai', 'that_bai'),
    ]);

    // 2. Truy vấn danh sách nhật ký có phân trang & lọc
    let query = supabaseAdmin
      .from('nhat_ky_gui_tin')
      .select('*', { count: 'exact' });

    if (kenh !== 'all') {
      query = query.eq('kenh', kenh);
    }

    if (trangThai !== 'all') {
      query = query.eq('trang_thai', trangThai);
    }

    if (search) {
      query = query.or(
        `nguoi_nhan.ilike.%${search}%,ten_nguoi_nhan.ilike.%${search}%,tieu_de.ilike.%${search}%,chi_tiet_loi.ilike.%${search}%`
      );
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: logs, count: total, error } = await query
      .order('ngay_tao', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('[API Notification Logs GET Error]:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      stats: {
        email_thanh_cong: emailThanhCong || 0,
        email_that_bai: emailThatBai || 0,
        zalo_thanh_cong: zaloThanhCong || 0,
        zalo_that_bai: zaloThatBai || 0,
        tong_so: (emailThanhCong || 0) + (emailThatBai || 0) + (zaloThanhCong || 0) + (zaloThatBai || 0),
      },
      logs: logs || [],
      pagination: {
        page,
        limit,
        total: total || 0,
        totalPages: Math.ceil((total || 0) / limit),
      },
    });
  } catch (err: any) {
    console.error('[API Notification Logs Exception]:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// Xóa 1 log hoặc reset bộ đếm
export async function DELETE(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('petmm_admin_session')?.value;
    const currentUser = verifyToken(sessionToken);

    if (!currentUser || currentUser.vai_tro !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Chỉ Quản trị viên cấp cao mới có quyền xóa nhật ký!' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const clearAll = searchParams.get('clearAll') === 'true';

    if (clearAll) {
      const { error } = await supabaseAdmin
        .from('nhat_ky_gui_tin')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Đã xóa toàn bộ nhật ký & reset bộ đếm!' });
    }

    if (!id) {
      return NextResponse.json({ success: false, message: 'Thiếu ID nhật ký cần xóa!' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('nhat_ky_gui_tin')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Đã xóa bản ghi nhật ký thành công!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
