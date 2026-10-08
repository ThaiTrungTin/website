import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyToken } from '@/lib/adminAuth';
import { logAuditServer, AuditAction } from '@/lib/auditLogger';

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

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '20', 10)));
    const search = (searchParams.get('search') || '').trim();
    const userFilter = (searchParams.get('user') || '').trim();
    const categoryFilter = (searchParams.get('category') || '').trim();
    const actionFilter = (searchParams.get('action') || '').trim();
    const dateRange = (searchParams.get('date_range') || 'all').trim();

    // 1. Khởi tạo truy vấn phân trang
    let query = supabaseAdmin
      .from('nhat_ky_hoat_dong')
      .select('*', { count: 'exact' });

    // Lọc theo từ khóa tìm kiếm
    if (search) {
      query = query.or(`chi_tiet.ilike.%${search}%,nguoi_thuc_hien.ilike.%${search}%`);
    }

    // Lọc theo người thực hiện
    if (userFilter && userFilter !== 'all') {
      query = query.eq('nguoi_thuc_hien', userFilter);
    }

    // Lọc theo chuyên mục
    if (categoryFilter && categoryFilter !== 'all') {
      query = query.eq('chuyen_muc', categoryFilter);
    }

    // Lọc theo hành động
    if (actionFilter && actionFilter !== 'all') {
      query = query.eq('hanh_dong', actionFilter);
    }

    // Lọc theo thời gian
    const now = new Date();
    if (dateRange === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      query = query.gte('ngay_tao', startOfDay);
    } else if (dateRange === '7d') {
      const past7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('ngay_tao', past7d);
    } else if (dateRange === '30d') {
      const past30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('ngay_tao', past30d);
    }

    // Sắp xếp giảm dần theo thời gian (mới nhất lên đầu)
    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    const { data: logs, count, error } = await query
      .order('ngay_tao', { ascending: false })
      .range(fromIndex, toIndex);

    if (error) {
      console.error('Lỗi truy vấn nhat_ky_hoat_dong:', error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // 2. Thống kê nhanh tổng quan
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    
    // Đếm hoạt động hôm nay
    const { count: todayCount } = await supabaseAdmin
      .from('nhat_ky_hoat_dong')
      .select('id', { count: 'exact', head: true })
      .gte('ngay_tao', startOfToday);

    // Lấy danh sách nhân viên duy nhất trong 100 dòng gần nhất để làm bộ lọc
    const { data: recentUsers } = await supabaseAdmin
      .from('nhat_ky_hoat_dong')
      .select('nguoi_thuc_hien')
      .order('ngay_tao', { ascending: false })
      .limit(200);

    const uniqueUsers = Array.from(
      new Set((recentUsers || []).map((r) => r.nguoi_thuc_hien).filter(Boolean))
    );

    return NextResponse.json({
      success: true,
      logs: logs || [],
      totalCount: count || 0,
      totalPages: Math.ceil((count || 0) / limit) || 1,
      currentPage: page,
      stats: {
        total: count || 0,
        today: todayCount || 0,
      },
      distinctUsers: uniqueUsers,
    });
  } catch (err: any) {
    console.error('Lỗi API audit-logs GET:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Lỗi máy chủ' },
      { status: 500 }
    );
  }
}

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
    const { hanh_dong, chuyen_muc, chi_tiet, du_lieu_thay_doi } = body;

    if (!hanh_dong || !chuyen_muc || !chi_tiet) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin bắt buộc để ghi nhật ký!' },
        { status: 400 }
      );
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const userAgent = req.headers.get('user-agent') || '';

    await logAuditServer({
      nguoi_thuc_hien: currentUser.ho_ten || currentUser.username,
      vai_tro: currentUser.vai_tro,
      hanh_dong: hanh_dong as AuditAction,
      chuyen_muc,
      chi_tiet,
      du_lieu_thay_doi,
      ip_address: ip.split(',')[0].trim(),
      user_agent: userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Lỗi API audit-logs POST:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Lỗi ghi nhật ký' },
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

    // Chỉ cho phép superadmin hoặc admin xóa log
    if (currentUser.vai_tro !== 'superadmin' && currentUser.vai_tro !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Chỉ Super Admin mới có quyền xóa nhật ký hoạt động!' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const { error } = await supabaseAdmin.from('nhat_ky_hoat_dong').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Đã xóa bản ghi nhật ký' });
    }

    // Nếu không truyền id, từ chối xóa hàng loạt để tránh rủi ro
    return NextResponse.json(
      { success: false, message: 'Vui lòng chỉ định ID bản ghi cần xóa' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('Lỗi API audit-logs DELETE:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Lỗi xóa nhật ký' },
      { status: 500 }
    );
  }
}
