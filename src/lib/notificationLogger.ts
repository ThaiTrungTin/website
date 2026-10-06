import { supabaseAdmin } from './supabaseAdmin';

export interface LogNotificationParams {
  kenh: 'email' | 'zalo';
  loai_tin: 'dat_lich' | 'danh_gia' | 'tuyen_dung' | 'xac_thuc' | 'test' | 'khac';
  nguoi_nhan: string;
  ten_nguoi_nhan?: string | null;
  tieu_de?: string | null;
  trang_thai: 'thanh_cong' | 'that_bai';
  ma_loi?: string | number | null;
  chi_tiet_loi?: string | null;
  du_lieu_gui?: any;
  phan_hoi?: any;
  nguoi_thuc_hien?: string | null;
}

export interface NhatKyGuiTinRecord {
  id: string;
  kenh: 'email' | 'zalo';
  loai_tin: string;
  nguoi_nhan: string;
  ten_nguoi_nhan?: string | null;
  tieu_de?: string | null;
  trang_thai: 'thanh_cong' | 'that_bai';
  ma_loi?: string | null;
  chi_tiet_loi?: string | null;
  du_lieu_gui?: any;
  phan_hoi?: any;
  nguoi_thuc_hien?: string | null;
  ngay_tao: string;
}

/**
 * Ghi log kết quả gửi Email hoặc Zalo vào cơ sở dữ liệu Supabase
 */
export async function logNotification(params: LogNotificationParams) {
  try {
    const { error } = await supabaseAdmin.from('nhat_ky_gui_tin').insert([
      {
        kenh: params.kenh,
        loai_tin: params.loai_tin,
        nguoi_nhan: params.nguoi_nhan,
        ten_nguoi_nhan: params.ten_nguoi_nhan || null,
        tieu_de: params.tieu_de || null,
        trang_thai: params.trang_thai,
        ma_loi: params.ma_loi ? String(params.ma_loi) : null,
        chi_tiet_loi: params.chi_tiet_loi || null,
        du_lieu_gui: params.du_lieu_gui || null,
        phan_hoi: params.phan_hoi || null,
        nguoi_thuc_hien: params.nguoi_thuc_hien || 'Hệ thống',
      },
    ]);

    if (error) {
      console.warn('[NotificationLogger] Insert error:', error.message);
    }
  } catch (err: any) {
    console.warn('[NotificationLogger] Exception:', err.message);
  }
}
