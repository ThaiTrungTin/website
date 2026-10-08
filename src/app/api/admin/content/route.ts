import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyToken } from '@/lib/adminAuth';
import { logAuditServer, AuditAction, AuditCategory } from '@/lib/auditLogger';

function revalidateContent(table: string, recordId?: string) {
  try {
    if (table === 'bai_viet') {
      revalidatePath('/kien-thuc');
      if (recordId) revalidatePath(`/kien-thuc/${recordId}`);
      revalidatePath('/');
    } else if (table === 'chi_nhanh') {
      revalidatePath('/chi-nhanh');
      if (recordId) revalidatePath(`/chi-nhanh/${recordId}`);
      revalidatePath('/');
    } else {
      revalidatePath('/');
    }
  } catch (err) {
    console.warn('revalidateContent warning:', err);
  }
}

const ALLOWED_TABLES = new Set([
  'bai_viet',
  'chi_nhanh',
  'dich_vu',
  'doi_ngu_y_te',
  'danh_gia',
  'cau_hoi_thuong_gap',
  'hinh_anh',
]);

const TABLE_CATEGORY_MAP: Record<string, AuditCategory> = {
  chi_nhanh: 'Chi nhánh',
  dich_vu: 'Dịch vụ',
  bai_viet: 'Cẩm nang',
  doi_ngu_y_te: 'Đội ngũ',
  danh_gia: 'Đánh giá',
  cau_hoi_thuong_gap: 'Hỏi đáp',
  hinh_anh: 'Hệ thống',
};

const TABLE_LABEL_MAP: Record<string, string> = {
  chi_nhanh: 'chi nhánh',
  dich_vu: 'dịch vụ',
  bai_viet: 'bài viết cẩm nang',
  doi_ngu_y_te: 'bác sĩ / nhân sự y tế',
  danh_gia: 'đánh giá khách hàng',
  cau_hoi_thuong_gap: 'câu hỏi thường gặp FAQ',
  hinh_anh: 'hình ảnh / slide giới thiệu',
};

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

    const category = TABLE_CATEGORY_MAP[table] || 'Hệ thống';
    const label = TABLE_LABEL_MAP[table] || table;
    const userName = currentUser.ho_ten || currentUser.username;

    if (action === 'insert') {
      const dataToInsert = Array.isArray(payload) ? payload : [payload];
      const { data, error } = await supabaseAdmin.from(table).insert(dataToInsert).select();
      if (error) throw error;

      const firstItem = dataToInsert[0] || {};
      const itemName = firstItem.ten || firstItem.tieu_de || firstItem.cau_hoi || firstItem.ho_ten || '';
      await logAuditServer({
        nguoi_thuc_hien: userName,
        vai_tro: currentUser.vai_tro,
        hanh_dong: 'THEM',
        chuyen_muc: category,
        chi_tiet: `Thêm mới ${label}${itemName ? `: "${itemName}"` : ''}`,
        du_lieu_thay_doi: { inserted: data },
      });

      revalidateContent(table, data?.[0]?.id);

      return NextResponse.json({ success: true, data });
    }

    if (action === 'update') {
      if (!id) throw new Error('Thiếu ID bản ghi để cập nhật');

      // 1. Lấy dữ liệu cũ trước khi cập nhật để so sánh Diff thực sự
      const { data: existingItem } = await supabaseAdmin
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      const { data, error } = await supabaseAdmin.from(table).update(payload).eq('id', id).select();
      if (error) throw error;

      // Helper chuẩn hóa giá trị để so sánh chính xác tuyệt đối
      const normalizeVal = (val: any): string => {
        if (val === null || val === undefined) return '';
        if (typeof val === 'string') return val.trim();
        if (typeof val === 'number' || typeof val === 'boolean') return String(val);
        return JSON.stringify(val);
      };

      // 2. So sánh và CHỈ giữ lại các trường có giá trị THỰC SỰ THAY ĐỔI
      const diffs: Record<string, { cu: any; moi: any }> = {};
      const changedKeys: string[] = [];

      for (const [k, v] of Object.entries(payload)) {
        if (k === 'id' || k === 'ngay_tao' || k === 'ngay_cap_nhat') continue;
        const oldVal = existingItem ? (existingItem as any)[k] : undefined;

        if (normalizeVal(oldVal) !== normalizeVal(v)) {
          diffs[k] = { cu: oldVal ?? null, moi: v ?? null };
          changedKeys.push(k);
        }
      }

      const itemName = payload.ten || payload.tieu_de || payload.cau_hoi || payload.ho_ten || (existingItem as any)?.ten || (existingItem as any)?.tieu_de || '';
      
      // Tạo diễn giải hành động rõ ràng theo thực tế người dùng sửa
      let smartActionDesc = `Cập nhật ${label}${itemName ? `: "${itemName}"` : ''}`;
      if (changedKeys.length === 1) {
        const field = changedKeys[0];
        if (field === 'hinh_anh' || field === 'anh_goc' || field === 'anh_bia') {
          smartActionDesc = `Đổi ảnh ${label}${itemName ? `: "${itemName}"` : ''}`;
        } else if (field === 'dia_chi' || field === 'dia_chi_en') {
          const fromAddr = diffs[field].cu || 'trống';
          const toAddr = diffs[field].moi || 'trống';
          smartActionDesc = `Sửa địa chỉ ${label} từ "${fromAddr}" sang "${toAddr}"`;
        } else if (field === 'gia' || field === 'gia_uudai') {
          smartActionDesc = `Đổi giá ${label} từ ${diffs[field].cu} sang ${diffs[field].moi}`;
        } else if (field === 'kich_hoat') {
          smartActionDesc = `${diffs[field].moi ? 'Bật hiển thị' : 'Tạm ẩn'} ${label}${itemName ? `: "${itemName}"` : ''}`;
        } else {
          smartActionDesc = `Chỉnh sửa ${field} của ${label}`;
        }
      } else if (changedKeys.length > 1) {
        if (changedKeys.includes('dia_chi')) {
          smartActionDesc = `Sửa địa chỉ ${label} từ "${diffs['dia_chi'].cu || 'trống'}" sang "${diffs['dia_chi'].moi}" (+${changedKeys.length - 1} mục khác)`;
        } else if (changedKeys.includes('anh_goc') || changedKeys.includes('hinh_anh')) {
          smartActionDesc = `Đổi ảnh và cập nhật ${label}${itemName ? `: "${itemName}"` : ''} (${changedKeys.length} trường thay đổi)`;
        } else {
          smartActionDesc = `Cập nhật ${label}${itemName ? `: "${itemName}"` : ''} (${changedKeys.length} trường thay đổi)`;
        }
      } else {
        smartActionDesc = `Lưu lại ${label}${itemName ? `: "${itemName}"` : ''} (không thay đổi nội dung)`;
      }

      await logAuditServer({
        nguoi_thuc_hien: userName,
        vai_tro: currentUser.vai_tro,
        hanh_dong: 'SUA',
        chuyen_muc: category,
        chi_tiet: smartActionDesc,
        du_lieu_thay_doi: {
          id,
          loai_thao_tac: 'chinh_sua',
          ten_muc: itemName,
          diffs, // CHỈ CÓ NHỮNG TRƯỜNG THỰC SỰ THAY ĐỔI
        },
      });

      revalidateContent(table, id);

      return NextResponse.json({ success: true, data });
    }

    if (action === 'delete') {
      if (!id) throw new Error('Thiếu ID bản ghi để xóa');
      
      // Lấy thông tin bản ghi trước khi xóa để ghi tên cụ thể
      const { data: existingItem } = await supabaseAdmin
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabaseAdmin.from(table).delete().eq('id', id);
      if (error) throw error;

      const itemName = existingItem?.ten || existingItem?.tieu_de || existingItem?.cau_hoi || existingItem?.ho_ten || '';
      await logAuditServer({
        nguoi_thuc_hien: userName,
        vai_tro: currentUser.vai_tro,
        hanh_dong: 'XOA',
        chuyen_muc: category,
        chi_tiet: `Xóa ${label}${itemName ? `: "${itemName}"` : ` (Mã #${id.slice(0, 8)})`}`,
        du_lieu_thay_doi: { id, deleted: existingItem },
      });

      revalidateContent(table, id);

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
      const { data: updatedBranch, error } = await supabaseAdmin
        .from('chi_nhanh')
        .update({ la_co_so_chinh: true, ngay_cap_nhat: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;

      await logAuditServer({
        nguoi_thuc_hien: userName,
        vai_tro: currentUser.vai_tro,
        hanh_dong: 'CAU_HINH',
        chuyen_muc: 'Chi nhánh',
        chi_tiet: `Thiết lập "${updatedBranch?.ten || 'Chi nhánh'}" làm Cơ sở chính (Trụ sở trung tâm)`,
        du_lieu_thay_doi: { branchId: id },
      });

      revalidateContent('chi_nhanh', id);

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
