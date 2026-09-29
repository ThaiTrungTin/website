import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ntkpdadakcyugvivvsjw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50a3BkYWRha2N5dWd2aXZ2c2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwODA3OTMsImV4cCI6MjEwNTY1Njc5M30.NGTqZizyGv8j7iLbi4cuEPcgMmydux5mV6jOG7qBhjo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface HeroBannerItem {
  id: string;
  tieu_de: string;
  duong_dan_anh: string;
  alt_text?: string | null;
  chuyen_muc?: string;
  can_chinh?: string;
  ti_le_phong?: number;
  hieu_ung?: string;
  thu_tu?: number;
  kich_hoat?: boolean;
  thoi_gian_hien_thi?: number;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
}

export interface HinhAnhRecord {
  id: string;
  tieu_de: string | null;
  mo_ta: string | null;
  duong_dan_anh: string;
  dinh_dang: string | null;
  kich_thuoc: number | null;
  chuyen_muc: string | null;
  alt_text: string | null;
  can_chinh?: string | null;
  ti_le_phong?: number | null;
  hieu_ung?: string | null;
  thu_tu?: number | null;
  kich_hoat?: boolean | null;
  thoi_gian_hien_thi?: number | null;
  ngay_tao: string;
  ngay_cap_nhat: string;
}

export interface ChiNhanhRecord {
  id: string;
  ten_chi_nhanh: string;
  ten_ngan?: string | null;
  khau_hieu?: string | null;
  khu_vuc?: string | null;
  dia_chi: string;
  so_dien_thoai?: string | null;
  gio_hoat_dong?: string | null;
  bac_si_phu_trach?: string | null;
  bang_cap_bac_si?: string | null;
  thong_tin_do_xe?: string | null;
  link_ggmap_embed?: string | null;
  link_ggmap_app?: string | null;
  tien_ich?: string[] | null;
  bai_viet_chi_tiet?: string | null;
  anh_dai_dien?: string | null;
  can_chinh_anh?: string | null;
  thu_tu?: number;
  kich_hoat?: boolean;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
}

export interface CauHinhRecord {
  id: string;
  hotline: string;
  hotline_hien_thi?: string;
  link_zalo?: string;
  link_facebook?: string;
  link_messenger?: string;
  link_tiktok?: string;
  email?: string;
  dia_chi_chinh?: string;
  slogan_dau_trang_tieu_de?: string;
  slogan_dau_trang_noi_dung?: string;
  slogan_cuoi_trang_tieu_de?: string;
  slogan_cuoi_trang_noi_dung?: string;
  giay_phep?: string;
  gioi_thieu_huy_hieu?: string;
  gioi_thieu_tieu_de_1?: string;
  gioi_thieu_tieu_de_2?: string;
  gioi_thieu_mo_ta?: string;
  gioi_thieu_cam_ket_tieu_de?: string;
  gioi_thieu_cam_ket_phu?: string;
  gioi_thieu_trich_dan?: string;
  gioi_thieu_bac_si_ten?: string;
  gioi_thieu_bac_si_chuc_danh?: string;
  thong_ke_nam_thanh_lap?: string;
  thong_ke_nam_thanh_lap_nhan?: string;
  thong_ke_khach_hang?: string;
  thong_ke_khach_hang_nhan?: string;
  ngay_cap_nhat?: string;
}

export interface DichVuRecord {
  id: string;
  ten_dich_vu: string;
  phu_de?: string | null;
  nhom_dich_vu: 'medical' | 'care';
  huy_hieu?: string | null;
  mo_ta?: string | null;
  hinh_anh: string;
  can_chinh_anh?: string | null;
  gia_tham_khao?: string | null;
  thoi_luong?: string | null;
  tien_ich?: string[] | null;
  quy_trinh?: string[] | null;
  noi_bat?: boolean | null;
  thu_tu?: number | null;
  kich_hoat?: boolean | null;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
}

export interface CauHoiThuongGapRecord {
  id: string;
  cau_hoi: string;
  cau_tra_loi: string;
  chuyen_muc?: string | null;
  thu_tu?: number | null;
  kich_hoat?: boolean | null;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
}

export interface LichHenRecord {
  id: string;
  ma_lich_hen: string;
  ho_ten_chu: string;
  so_dien_thoai: string;
  ten_thu_cung: string;
  loai_thu_cung?: 'dog' | 'cat' | 'other' | string;
  chi_nhanh_id?: string | null;
  ten_chi_nhanh?: string | null;
  dich_vu: string;
  ngay_hen: string;
  gio_hen: string;
  ghi_chu?: string | null;
  trang_thai: 'cho_xac_nhan' | 'da_xac_nhan' | 'da_kham' | 'da_huy';
  ngay_tao?: string;
  ngay_cap_nhat?: string;
}

export interface DanhGiaRecord {
  id: string;
  ten_khach_hang: string;
  so_dien_thoai: string;
  so_sao: number;
  noi_dung: string;
  dich_vu_su_dung?: string | null;
  chi_nhanh?: string | null;
  hinh_anh_thu_cung?: string | null;
  ngay_danh_gia?: string | null;
  da_xac_thuc?: boolean | null;
  thu_tu?: number | null;
  kich_hoat?: boolean | null;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
}

export type DoiNguPhanLoai = 'lanh_dao' | 'chuyen_gia' | 'bac_si' | 'dieu_duong';

export interface DoiNguRecord {
  id: string;
  ho_ten: string;
  chuc_danh?: string | null;
  hoc_vi_chuc_vu?: string | null;
  phan_loai: DoiNguPhanLoai;
  hinh_anh?: string | null;
  mo_ta?: string | null;
  thu_tu?: number | null;
  kich_hoat?: boolean | null;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
}

export interface BaiVietRecord {
  id: string;
  tieu_de: string;
  slug?: string | null;
  chuyen_muc?: string | null;
  mo_ta_ngan?: string | null;
  noi_dung?: string | null;
  hinh_anh?: string | null;
  thoi_gian_doc?: string | null;
  tac_gia?: string | null;
  ngay_dang?: string | null;
  thu_tu?: number | null;
  kich_hoat?: boolean | null;
  luot_xem?: number | null;
  created_at?: string;
  updated_at?: string;
}

