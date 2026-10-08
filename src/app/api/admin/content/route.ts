import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyToken } from '@/lib/adminAuth';

const ALLOWED_TABLES = new Set([
  'bai_viet',
  'chi_nhanh',
  'dich_vu',
  'doi_ngu_y_te',
  'danh_gia',
  'cau_hoi_thuong_gap',
  'hinh_anh',
]);

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('petmm_admin_session')?.value;
    const currentUser = verifyToken(sessionToken);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Bạn chưa đăng nhập quản trị hệ thống!' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { table, action, id, payload } = body;

    if (!table || !ALLOWED_TABLES.has(table)) {
      return NextResponse.json(
        { success: false, message: 'Bảng dữ liệu không hợp lệ!' },
        { status: 400 }
      );
    }

    if (action === 'insert') {
      const dataToInsert = Array.isArray(payload) ? payload : [payload];
      const { data, error } = await supabaseAdmin.from(table).insert(dataToInsert).select();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (action === 'update') {
      if (!id) throw new Error('Thiếu ID bản ghi để cập nhật');
      const { data, error } = await supabaseAdmin.from(table).update(payload).eq('id', id).select();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (action === 'delete') {
      if (!id) throw new Error('Thiếu ID bản ghi để xóa');
      const { error } = await supabaseAdmin.from(table).delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'set_main_branch' && table === 'chi_nhanh') {
      if (!id) throw new Error('Thiếu ID chi nhánh');
      // 1. Tắt cơ sở chính ở các chi nhánh khác
      await supabaseAdmin
        .from('chi_nhanh')
        .update({ la_co_so_chinh: false, ngay_cap_nhat: new Date().toISOString() })
        .neq('id', id);

      // 2. Bật cơ sở chính ở chi nhánh được chọn
      const { error } = await supabaseAdmin
        .from('chi_nhanh')
        .update({ la_co_so_chinh: true, ngay_cap_nhat: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, message: 'Thao tác không được hỗ trợ' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('Lỗi Content API:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Lỗi thao tác cơ sở dữ liệu' },
      { status: 500 }
    );
  }
}
