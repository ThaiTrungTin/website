import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface HeroBannerItem {
  id: string;
  tieu_de: string;
  tieu_de_en?: string | null;
  duong_dan_anh: string;
  alt_text?: string | null;
  alt_text_en?: string | null;
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
  tieu_de_en?: string | null;
  mo_ta: string | null;
  mo_ta_en?: string | null;
  duong_dan_anh: string;
  dinh_dang: string | null;
  kich_thuoc: number | null;
  chuyen_muc: string | null;
  alt_text: string | null;
  alt_text_en?: string | null;
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
  ten_chi_nhanh_en?: string | null;
  ten_ngan?: string | null;
  ten_ngan_en?: string | null;
  khau_hieu?: string | null;
  khau_hieu_en?: string | null;
  khu_vuc?: string | null;
  khu_vuc_en?: string | null;
  dia_chi: string;
  dia_chi_en?: string | null;
  so_dien_thoai?: string | null;
  gio_hoat_dong?: string | null;
  gio_hoat_dong_en?: string | null;
  bac_si_phu_trach?: string | null;
  bac_si_phu_trach_en?: string | null;
  bang_cap_bac_si?: string | null;
  bang_cap_bac_si_en?: string | null;
  thong_tin_do_xe?: string | null;
  thong_tin_do_xe_en?: string | null;
  link_ggmap_embed?: string | null;
  link_ggmap_app?: string | null;
  tien_ich?: string[] | null;
  tien_ich_en?: string[] | null;
  bai_viet_chi_tiet?: string | null;
  bai_viet_chi_tiet_en?: string | null;
  anh_dai_dien?: string | null;
  can_chinh_anh?: string | null;
  thu_tu?: number;
  kich_hoat?: boolean;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
}

export interface CauHinhRecord {
  id: string;
  logo_favicon?: string;
  tieu_de_trang?: string;
  tieu_de_trang_en?: string;
  hotline: string;
  hotline_hien_thi?: string;
  link_zalo?: string;
  link_facebook?: string;
  link_messenger?: string;
  link_tiktok?: string;
  email?: string;
  dia_chi_chinh?: string;
  slogan_dau_trang_tieu_de?: string;
  slogan_dau_trang_tieu_de_en?: string;
  slogan_dau_trang_noi_dung?: string;
  slogan_dau_trang_noi_dung_en?: string;
  slogan_cuoi_trang_tieu_de?: string;
  slogan_cuoi_trang_noi_dung?: string;
  giay_phep?: string;
  gioi_thieu_huy_hieu?: string;
  gioi_thieu_huy_hieu_en?: string;
  gioi_thieu_tieu_de_1?: string;
  gioi_thieu_tieu_de_1_en?: string;
  gioi_thieu_tieu_de_2?: string;
  gioi_thieu_tieu_de_2_en?: string;
  gioi_thieu_mo_ta?: string;
  gioi_thieu_mo_ta_en?: string;
  gioi_thieu_cam_ket_tieu_de?: string;
  gioi_thieu_cam_ket_tieu_de_en?: string;
  gioi_thieu_cam_ket_phu?: string;
  gioi_thieu_cam_ket_phu_en?: string;
  gioi_thieu_trich_dan?: string;
  gioi_thieu_trich_dan_en?: string;
  gioi_thieu_bac_si_ten?: string;
  gioi_thieu_bac_si_ten_en?: string;
  gioi_thieu_bac_si_chuc_danh?: string;
  gioi_thieu_bac_si_chuc_danh_en?: string;
  thong_ke_nam_thanh_lap?: string;
  thong_ke_nam_thanh_lap_nhan?: string;
  thong_ke_nam_thanh_lap_nhan_en?: string;
  thong_ke_khach_hang?: string;
  thong_ke_khach_hang_nhan?: string;
  thong_ke_khach_hang_nhan_en?: string;
  slogan_cuoi_trang_tieu_de_en?: string;
  slogan_cuoi_trang_noi_dung_en?: string;
  ngay_cap_nhat?: string;
}

export interface DichVuRecord {
  id: string;
  ten_dich_vu: string;
  ten_dich_vu_en?: string | null;
  phu_de?: string | null;
  phu_de_en?: string | null;
  nhom_dich_vu: 'medical' | 'care';
  huy_hieu?: string | null;
  huy_hieu_en?: string | null;
  mo_ta?: string | null;
  mo_ta_en?: string | null;
  hinh_anh: string;
  can_chinh_anh?: string | null;
  gia_tham_khao?: string | null;
  gia_tham_khao_en?: string | null;
  thoi_luong?: string | null;
  thoi_luong_en?: string | null;
  tien_ich?: string[] | null;
  tien_ich_en?: string[] | null;
  quy_trinh?: string[] | null;
  quy_trinh_en?: string[] | null;
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
  cau_hoi_en?: string | null;
  cau_tra_loi_en?: string | null;
  chuyen_muc?: string | null;
  chuyen_muc_en?: string | null;
  thu_tu?: number | null;
  kich_hoat?: boolean | null;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
}

export interface SupportPanelConfig {
  tieu_de_vi: string;
  tieu_de_en: string;
  mo_ta_vi: string;
  mo_ta_en: string;
  card1_title_vi: string;
  card1_title_en: string;
  card1_desc_vi: string;
  card1_desc_en: string;
  card2_title_vi: string;
  card2_title_en: string;
  card2_desc_vi: string;
  card2_desc_en: string;
  card3_title_vi: string;
  card3_title_en: string;
  card3_desc_vi: string;
  card3_desc_en: string;
}

export const DEFAULT_SUPPORT_CONFIG: SupportPanelConfig = {
  tieu_de_vi: 'Bạn cần PetM&M hỗ trợ?',
  tieu_de_en: 'Need PetM&M support?',
  mo_ta_vi: 'Chọn cách liên hệ phù hợp với nhu cầu của bạn.',
  mo_ta_en: 'Choose the contact method that suits your needs.',
  card1_title_vi: 'Đặt lịch dịch vụ qua Zalo',
  card1_title_en: 'Book via Zalo',
  card1_desc_vi: 'Gửi thông tin thú cưng, dịch vụ cần sử dụng, cơ sở và thời gian mong muốn để PetM&M xác nhận lịch hẹn.',
  card1_desc_en: 'Send your pet info, desired service, branch, and preferred time. PetM&M will confirm your appointment.',
  card2_title_vi: 'Gọi trực tiếp hotline cấp cứu 24/7',
  card2_title_en: 'Call 24/7 Emergency Hotline',
  card2_desc_vi: 'Khi thú cưng khó thở, co giật, đau nhiều, chảy máu, nôn hoặc tiêu chảy nặng, nghi ngộ độc hay cần hỗ trợ khẩn cấp. Không chờ phản hồi qua tin nhắn.',
  card2_desc_en: 'When your pet has difficulty breathing, seizures, severe pain, bleeding, vomiting, diarrhea, suspected poisoning, or needs emergency assistance.',
  card3_title_vi: 'Trao đổi nhu cầu chăm sóc đặc thù',
  card3_title_en: 'Special Care Consultation',
  card3_desc_vi: 'Gửi hồ sơ và thông tin qua Zalo khi thú cưng có bệnh lý nền, chế độ ăn kiêng riêng hoặc cần lưu trú dài hạn.',
  card3_desc_en: "Send your pet's medical records via Zalo for chronic conditions, special diets, or long-term boarding needs.",
};

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
  ten_khach_hang_en?: string | null;
  so_dien_thoai: string;
  so_sao: number;
  noi_dung: string;
  noi_dung_en?: string | null;
  dich_vu_su_dung?: string | null;
  dich_vu_su_dung_en?: string | null;
  chi_nhanh?: string | null;
  hinh_anh_thu_cung?: string | null;
  ngay_danh_gia?: string | null;
  ngay_danh_gia_en?: string | null;
  da_xac_thuc?: boolean | null;
  thu_tu?: number | null;
  kich_hoat?: boolean | null;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
}

export interface YeuCauDanhGiaRecord {
  id: string;
  ma_danh_gia: string;
  ma_hoa_don?: string | null;
  ten_khach_hang: string;
  so_dien_thoai?: string | null;
  email?: string | null;
  co_so?: string | null;
  so_sao?: number | null;
  noi_dung_danh_gia?: string | null;
  hinh_anh?: string | null;
  trang_thai: 'cho_danh_gia' | 'da_danh_gia';
  ngay_danh_gia?: string | null;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
}

export type DoiNguPhanLoai = 'lanh_dao' | 'chuyen_gia' | 'bac_si' | 'dieu_duong';

export interface DoiNguRecord {
  id: string;
  ho_ten: string;
  ho_ten_en?: string | null;
  chuc_danh?: string | null;
  chuc_danh_en?: string | null;
  hoc_vi_chuc_vu?: string | null;
  hoc_vi_chuc_vu_en?: string | null;
  phan_loai: DoiNguPhanLoai;
  hinh_anh?: string | null;
  mo_ta?: string | null;
  mo_ta_en?: string | null;
  thu_tu?: number | null;
  kich_hoat?: boolean | null;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
}

export interface BaiVietRecord {
  id: string;
  tieu_de: string;
  tieu_de_en?: string | null;
  slug?: string | null;
  chuyen_muc?: string | null;
  chuyen_muc_en?: string | null;
  mo_ta_ngan?: string | null;
  mo_ta_ngan_en?: string | null;
  noi_dung?: string | null;
  noi_dung_en?: string | null;
  hinh_anh?: string | null;
  thoi_gian_doc?: string | null;
  thoi_gian_doc_en?: string | null;
  tac_gia?: string | null;
  tac_gia_en?: string | null;
  ngay_dang?: string | null;
  thu_tu?: number | null;
  kich_hoat?: boolean | null;
  luot_xem?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface TuyenDungRecord {
  id: string;
  tieu_de: string;
  tieu_de_en?: string | null;
  phong_ban?: string | null;
  phong_ban_en?: string | null;
  dia_diem?: string | null;
  dia_diem_en?: string | null;
  hinh_thuc?: string | null;
  hinh_thuc_en?: string | null;
  muc_luong?: string | null;
  muc_luong_en?: string | null;
  kinh_nghiem?: string | null;
  kinh_nghiem_en?: string | null;
  so_luong?: number | null;
  han_nop?: string | null;
  mo_ta?: string | null;
  mo_ta_en?: string | null;
  yeu_cau?: string | null;
  yeu_cau_en?: string | null;
  quyen_loi?: string | null;
  quyen_loi_en?: string | null;
  hinh_anh?: string | null;
  thu_tu?: number | null;
  kich_hoat?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

