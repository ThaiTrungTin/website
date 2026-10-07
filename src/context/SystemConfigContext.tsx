'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, CauHinhRecord } from '@/lib/supabase';

const SUPABASE_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

const DEFAULT_CONFIG: CauHinhRecord = {
  id: 'system',
  logo_favicon: SUPABASE_BASE ? `${SUPABASE_BASE}/storage/v1/object/public/hinh_anh/favicons/favicons_1790778595096_y4asw.png` : '',
  tieu_de_trang: 'PetM&M - Trang Chủ',
  tieu_de_trang_en: 'PetM&M - Homepage',
  hotline: '0364605544',
  hotline_hien_thi: '0364605544',
  link_zalo: 'https://zalo.me/090359932222',
  link_facebook: 'https://facebook.com/petmm',
  link_messenger: 'https://m.me/petmm',
  link_tiktok: '',
  email: 'contact@petmm.vn',
  dia_chi_chinh: '19 Đ. Số 1, Phường Phước Long, TP. Thủ Đức, TP. Hồ Chí Minh',
  slogan_dau_trang_tieu_de: 'Nâng niu từng nhịp thở, an yên trọn một đời.',
  slogan_dau_trang_tieu_de_en: 'Cherishing Every Breath, Embracing Life with Peace.',
  slogan_dau_trang_noi_dung: 'Không gian y khoa chuẩn mực hòa cùng liệu pháp phục hồi thiên nhiên. Nơi tình thương thuần khiết hòa quyện cùng công nghệ điều trị tiên tiến nhất thế giới, cho bé cưng hồi phục thể chất và an yên tâm trí.',
  slogan_dau_trang_noi_dung_en: 'Standardized veterinary medicine combined with natural recovery therapies. Where pure love blends with state-of-the-art medical technology to restore physical vitality and soothe peace of mind.',
  slogan_cuoi_trang_tieu_de: '“Thú cưng khỏe mạnh — An yên trọn một đời”',
  slogan_cuoi_trang_tieu_de_en: '“Healthy pets — Peace of mind for a lifetime”',
  slogan_cuoi_trang_noi_dung: 'Hệ thống Bệnh viện Thú Y & Resort Nghỉ dưỡng Thú Cưng Tiêu chuẩn 5 Sao quốc tế tại TP. Hồ Chí Minh. Tiên phong áp dụng chuẩn lâm sàng Fear-Free không stress cho thú cưng.',
  slogan_cuoi_trang_noi_dung_en: 'International 5-Star Standard Veterinary Hospital & Pet Resort System in City. Ho Chi Minh. Pioneer in applying Fear-Free clinical standards without stress for pets.',
  giay_phep: '0316888999/SNN-TY',
  gioi_thieu_huy_hieu: 'SỨ MỆNH & TRIẾT LÝ PETM&M',
  gioi_thieu_huy_hieu_en: 'MISSION & PHILOSOPHY',
  gioi_thieu_tieu_de_1: 'Nâng Tầm Chăm Sóc Y Khoa',
  gioi_thieu_tieu_de_1_en: 'Elevating Veterinary Medicine',
  gioi_thieu_tieu_de_2: 'Bằng Trái Tim & Y Đức',
  gioi_thieu_tieu_de_2_en: 'With Integrity & Compassion',
  gioi_thieu_mo_ta: 'Được thành lập với sứ mệnh kiến tạo chuẩn mực y tế thú cưng mới tại Việt Nam, PetM&M không chỉ là một bệnh viện đa khoa hiện đại, mà còn là một “ngôi nhà thứ hai” nơi mỗi bé cưng được bảo vệ bằng tình thương và sự tận tụy cao nhất.',
  gioi_thieu_mo_ta_en: 'Established with the vision of setting new standards in pet healthcare in Vietnam, PetM&M is not only a state-of-the-art veterinary hospital, but a trusted second home where every companion is cherished with devotion.',
  gioi_thieu_cam_ket_tieu_de: 'Cam Kết Vàng Y Khoa',
  gioi_thieu_cam_ket_tieu_de_en: 'Golden Medical Pledge',
  gioi_thieu_cam_ket_phu: 'Bảo vệ sức khỏe trọn đời cho thú cưng',
  gioi_thieu_cam_ket_phu_en: 'Lifelong health protection for your beloved pets',
  gioi_thieu_trich_dan: '“Chúng tôi coi từng nhịp thở, từng ánh mắt của các bé là trách nhiệm và niềm tự hào lớn nhất trong sự nghiệp y khoa của mình.”',
  gioi_thieu_trich_dan_en: '“We regard every breath and every heartbeat of our patients as our greatest pride and responsibility in our veterinary calling.”',
  gioi_thieu_bac_si_ten: 'BS. CKI Nguyễn Minh Tuấn',
  gioi_thieu_bac_si_ten_en: 'Dr. Nguyen Minh Tuan',
  gioi_thieu_bac_si_chuc_danh: 'Giám Đốc Chuyên Môn Hệ Thống Bệnh Viện PetM&M',
  gioi_thieu_bac_si_chuc_danh_en: 'Chief Medical Director, PetM&M Veterinary Hospital Network',
  thong_ke_nam_thanh_lap: '2018',
  thong_ke_nam_thanh_lap_nhan: 'Năm thành lập',
  thong_ke_nam_thanh_lap_nhan_en: 'Founded',
  thong_ke_khach_hang: '30k+',
  thong_ke_khach_hang_nhan: 'Khách hàng',
  thong_ke_khach_hang_nhan_en: 'Happy Clients',
  hero_nut_1_text: 'Đặt Lịch Thăm Khám',
  hero_nut_1_text_en: 'Book Appointment',
  hero_nut_1_link: '#booking',
  hero_nut_1_hien_thi: true,
  hero_nut_2_text: 'Xem Dịch Vụ',
  hero_nut_2_text_en: 'Our Services',
  hero_nut_2_link: '#services',
  hero_nut_2_hien_thi: true,
  section_chi_nhanh_tieu_de: '',
  section_chi_nhanh_mo_ta: '',
  section_chi_nhanh_tieu_de_en: '',
  section_chi_nhanh_mo_ta_en: '',
  section_gioi_thieu_tieu_de: '',
  section_gioi_thieu_mo_ta: '',
  section_gioi_thieu_tieu_de_en: '',
  section_gioi_thieu_mo_ta_en: '',
  section_dich_vu_tieu_de: '',
  section_dich_vu_mo_ta: '',
  section_dich_vu_tieu_de_en: '',
  section_dich_vu_mo_ta_en: '',
  section_cam_nang_tieu_de: '',
  section_cam_nang_mo_ta: '',
  section_cam_nang_tieu_de_en: '',
  section_cam_nang_mo_ta_en: '',
  section_faq_tieu_de: '',
  section_faq_mo_ta: '',
  section_faq_tieu_de_en: '',
  section_faq_mo_ta_en: '',
  section_danh_gia_tieu_de: '',
  section_danh_gia_mo_ta: '',
  section_danh_gia_tieu_de_en: '',
  section_danh_gia_mo_ta_en: '',
  section_tuyen_dung_tieu_de: '',
  section_tuyen_dung_mo_ta: '',
  section_tuyen_dung_tieu_de_en: '',
  section_tuyen_dung_mo_ta_en: '',
  section_dat_lich_tieu_de: '',
  section_dat_lich_mo_ta: '',
  section_dat_lich_tieu_de_en: '',
  section_dat_lich_mo_ta_en: '',
  hero_slogan_x_desktop: 0,
  hero_slogan_y_desktop: 0,
  hero_slogan_align_desktop: 'center',
  hero_slogan_x_mobile: 0,
  hero_slogan_y_mobile: 0,
  hero_slogan_align_mobile: 'center',
};

export function applyHeroCssVariables(data: Partial<CauHinhRecord>) {
  if (typeof window === 'undefined') return;
  try {
    const r = document.documentElement;
    if (data.hero_slogan_x_desktop !== undefined) r.style.setProperty('--hero-x-desktop', `${data.hero_slogan_x_desktop}px`);
    if (data.hero_slogan_y_desktop !== undefined) r.style.setProperty('--hero-y-desktop', `${data.hero_slogan_y_desktop}px`);
    if (data.hero_slogan_x_mobile !== undefined) r.style.setProperty('--hero-x-mobile', `${data.hero_slogan_x_mobile}px`);
    if (data.hero_slogan_y_mobile !== undefined) r.style.setProperty('--hero-y-mobile', `${data.hero_slogan_y_mobile}px`);
  } catch {}
}

interface SystemConfigContextType {
  config: CauHinhRecord;
  refreshConfig: () => Promise<void>;
  loading: boolean;
}

const SystemConfigContext = createContext<SystemConfigContextType>({
  config: DEFAULT_CONFIG,
  refreshConfig: async () => {},
  loading: false,
});

export function SystemConfigProvider({ children }: { children: React.ReactNode }) {
  // Khởi tạo đồng nhất giữa SSR và client hydration, loại bỏ hoàn toàn hydration mismatch
  const [config, setConfig] = useState<CauHinhRecord>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Đọc cache từ localStorage sau khi client mount
    try {
      const cached = localStorage.getItem('petmm_system_config_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          delete parsed.smtp_password;
          applyHeroCssVariables(parsed);
          setConfig((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {}
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      // BẢO MẬT: Chỉ select các trường công khai cần thiết cho giao diện, TUYỆT ĐỐI không lấy smtp_password
      const publicFields = [
        'id', 'logo_favicon', 'tieu_de_trang', 'tieu_de_trang_en',
        'hotline', 'hotline_hien_thi', 'link_zalo', 'link_facebook', 'link_messenger', 'link_tiktok',
        'email', 'dia_chi_chinh',
        'slogan_dau_trang_tieu_de', 'slogan_dau_trang_tieu_de_en',
        'slogan_dau_trang_noi_dung', 'slogan_dau_trang_noi_dung_en',
        'slogan_cuoi_trang_tieu_de', 'slogan_cuoi_trang_tieu_de_en',
        'slogan_cuoi_trang_noi_dung', 'slogan_cuoi_trang_noi_dung_en',
        'giay_phep',
        'gioi_thieu_huy_hieu', 'gioi_thieu_huy_hieu_en',
        'gioi_thieu_tieu_de_1', 'gioi_thieu_tieu_de_1_en',
        'gioi_thieu_tieu_de_2', 'gioi_thieu_tieu_de_2_en',
        'gioi_thieu_mo_ta', 'gioi_thieu_mo_ta_en',
        'gioi_thieu_cam_ket_tieu_de', 'gioi_thieu_cam_ket_tieu_de_en',
        'gioi_thieu_cam_ket_phu', 'gioi_thieu_cam_ket_phu_en',
        'gioi_thieu_trich_dan', 'gioi_thieu_trich_dan_en',
        'gioi_thieu_bac_si_ten', 'gioi_thieu_bac_si_ten_en',
        'gioi_thieu_bac_si_chuc_danh', 'gioi_thieu_bac_si_chuc_danh_en',
        'thong_ke_nam_thanh_lap', 'thong_ke_nam_thanh_lap_nhan', 'thong_ke_nam_thanh_lap_nhan_en',
        'thong_ke_khach_hang', 'thong_ke_khach_hang_nhan', 'thong_ke_khach_hang_nhan_en',
        'hero_nut_1_text', 'hero_nut_1_text_en', 'hero_nut_1_link', 'hero_nut_1_hien_thi',
        'hero_nut_2_text', 'hero_nut_2_text_en', 'hero_nut_2_link', 'hero_nut_2_hien_thi',
        'section_chi_nhanh_tieu_de', 'section_chi_nhanh_mo_ta',
        'section_chi_nhanh_tieu_de_en', 'section_chi_nhanh_mo_ta_en',
        'section_gioi_thieu_tieu_de', 'section_gioi_thieu_mo_ta',
        'section_gioi_thieu_tieu_de_en', 'section_gioi_thieu_mo_ta_en',
        'section_dich_vu_tieu_de', 'section_dich_vu_mo_ta',
        'section_dich_vu_tieu_de_en', 'section_dich_vu_mo_ta_en',
        'section_cam_nang_tieu_de', 'section_cam_nang_mo_ta',
        'section_cam_nang_tieu_de_en', 'section_cam_nang_mo_ta_en',
        'section_faq_tieu_de', 'section_faq_mo_ta',
        'section_faq_tieu_de_en', 'section_faq_mo_ta_en',
        'section_danh_gia_tieu_de', 'section_danh_gia_mo_ta',
        'section_danh_gia_tieu_de_en', 'section_danh_gia_mo_ta_en',
        'section_tuyen_dung_tieu_de', 'section_tuyen_dung_mo_ta',
        'section_tuyen_dung_tieu_de_en', 'section_tuyen_dung_mo_ta_en',
        'section_dat_lich_tieu_de', 'section_dat_lich_mo_ta',
        'section_dat_lich_tieu_de_en', 'section_dat_lich_mo_ta_en',
        'hero_slogan_x_desktop', 'hero_slogan_y_desktop', 'hero_slogan_align_desktop',
        'hero_slogan_x_mobile', 'hero_slogan_y_mobile', 'hero_slogan_align_mobile',
      ].join(', ');

      const { data, error } = await supabase
        .from('cau_hinh')
        .select(publicFields)
        .eq('id', 'system')
        .single();

      if (error) {
        console.warn('Lỗi lấy cấu hình hệ thống từ Supabase, dùng mặc định:', error.message);
        return;
      }

      if (data) {
        const configData = data as unknown as Partial<CauHinhRecord>;
        setConfig((prev) => {
          const merged = { ...prev, ...configData };
          try {
            // Không bao giờ lưu trữ mật khẩu hay thông tin nhạy cảm vào localStorage
            const safeData = { ...merged };
            delete (safeData as any).smtp_password;
            localStorage.setItem('petmm_system_config_cache', JSON.stringify(safeData));
            applyHeroCssVariables(safeData);
          } catch {}
          return merged;
        });

        // Cập nhật document.title trực tiếp ngay tức thì từ dữ liệu DB (chỉ áp dụng cho trang chủ)
        if (typeof window !== 'undefined') {
          try {
            const currentPath = window.location.pathname;
            const isSubRoute =
              currentPath.startsWith('/chi-nhanh') ||
              currentPath.startsWith('/kien-thuc') ||
              currentPath.startsWith('/danhgiadichvu') ||
              currentPath.startsWith('/taodanhgia') ||
              currentPath.startsWith('/admin') ||
              currentPath.startsWith('/doi-ngu') ||
              currentPath.startsWith('/tuyen-dung');

            if (!isSubRoute) {
              const lang = (localStorage.getItem('petmm_language') as string) || 'vi';
              const pageTitle = lang === 'en'
                ? (configData.tieu_de_trang_en?.trim() || 'PetM&M - Homepage')
                : (configData.tieu_de_trang?.trim() || 'PetM&M - Trang Chủ');
              if (pageTitle) {
                document.title = pageTitle;
              }
            }
          } catch {}
        }
      }
    } catch (err) {
      console.warn('Không thể tải cấu hình:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();

    const handleFocus = () => {
      fetchConfig();
    };
    window.addEventListener('focus', handleFocus);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'petmm_system_config_cache' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && typeof parsed === 'object') {
            setConfig((prev) => ({ ...prev, ...parsed }));
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // Lắng nghe thay đổi thời gian thực khi Admin cập nhật hotline / link
    const channel = supabase
      .channel('cau_hinh_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cau_hinh' },
        () => {
          fetchConfig();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
      supabase.removeChannel(channel);
    };
  }, [fetchConfig]);

  return (
    <SystemConfigContext.Provider value={{ config, refreshConfig: fetchConfig, loading }}>
      {children}
    </SystemConfigContext.Provider>
  );
}

export function useSystemConfig() {
  return useContext(SystemConfigContext);
}
