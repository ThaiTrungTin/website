import { supabaseAdmin } from '@/lib/supabaseAdmin';

export type AuditAction = 'THEM' | 'SUA' | 'XOA' | 'XU_LY' | 'CAU_HINH' | 'DANG_NHAP';

export type AuditCategory =
  | 'Lịch hẹn'
  | 'Chi nhánh'
  | 'Dịch vụ'
  | 'Cấu hình'
  | 'Đánh giá'
  | 'Tuyển dụng'
  | 'Cẩm nang'
  | 'Hỏi đáp'
  | 'Đội ngũ'
  | 'Tài khoản'
  | 'Hệ thống';

export interface AuditLogRecord {
  id: string;
  nguoi_thuc_hien: string;
  vai_tro?: string;
  hanh_dong: AuditAction;
  chuyen_muc: string;
  chi_tiet: string;
  du_lieu_thay_doi?: any;
  ip_address?: string;
  user_agent?: string;
  ngay_tao: string;
}

export interface CreateAuditLogParams {
  nguoi_thuc_hien?: string;
  vai_tro?: string;
  hanh_dong: AuditAction;
  chuyen_muc: AuditCategory | string;
  chi_tiet: string;
  du_lieu_thay_doi?: any;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Ghi nhật ký hoạt động từ phía Server (API Route)
 * Hàm này an toàn, không làm gián đoạn luồng chính nếu xảy ra lỗi ghi log.
 */
export async function logAuditServer(params: CreateAuditLogParams) {
  try {
    const payload = {
      nguoi_thuc_hien: params.nguoi_thuc_hien || 'Quản trị viên',
      vai_tro: params.vai_tro || 'admin',
      hanh_dong: params.hanh_dong,
      chuyen_muc: params.chuyen_muc,
      chi_tiet: params.chi_tiet,
      du_lieu_thay_doi: params.du_lieu_thay_doi || null,
      ip_address: params.ip_address || null,
      user_agent: params.user_agent || null,
      ngay_tao: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin.from('nhat_ky_hoat_dong').insert([payload]);
    if (error) {
      console.warn('⚠️ Lỗi ghi nhật ký hoạt động Server:', error.message);
    }

    // Tự động xóa nhật ký cũ hơn 30 ngày
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    (async () => {
      try {
        await supabaseAdmin.from('nhat_ky_hoat_dong').delete().lt('ngay_tao', thirtyDaysAgo);
      } catch (err) {
        console.error('Lỗi tự động xóa nhật ký 30 ngày:', err);
      }
    })();
  } catch (err: any) {
    console.warn('⚠️ Ngoại lệ ghi nhật ký hoạt động Server:', err?.message || err);
  }
}

/**
 * Ghi nhật ký hoạt động từ Client Component
 */
export async function logAuditClient(params: CreateAuditLogParams) {
  try {
    await fetch('/api/admin/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  } catch (err) {
    console.warn('⚠️ Ngoại lệ ghi nhật ký hoạt động Client:', err);
  }
}
