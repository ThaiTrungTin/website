'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, CauHinhRecord } from '@/lib/supabase';

const DEFAULT_CONFIG: CauHinhRecord = {
  id: 'system',
  hotline: '0903 599 339',
  hotline_hien_thi: '0903 599 339',
  link_zalo: 'https://zalo.me/0903599339',
  link_facebook: 'https://facebook.com/petmm',
  link_messenger: 'https://m.me/petmm',
  link_tiktok: 'https://tiktok.com/@petmm',
  email: 'contact@petmm.vn',
  dia_chi_chinh: '19 Đ. Số 1, Phường Phước Long, TP. Thủ Đức, TP. Hồ Chí Minh',
  slogan_dau_trang_tieu_de: 'Nâng niu từng nhịp thở, an yên trọn một đời.',
  slogan_dau_trang_noi_dung: 'Không gian y khoa chuẩn mực hòa cùng liệu pháp phục hồi thiên nhiên. Nơi tình thương thuần khiết hòa quyện cùng công nghệ điều trị tiên tiến nhất thế giới, cho bé cưng hồi phục thể chất và an yên tâm trí.',
  slogan_cuoi_trang_tieu_de: '“Thú cưng khỏe mạnh — An yên trọn một đời”',
  slogan_cuoi_trang_noi_dung: 'Hệ thống Bệnh viện Thú Y & Resort Nghỉ dưỡng Thú Cưng Tiêu chuẩn 5 Sao quốc tế tại TP. Hồ Chí Minh. Tiên phong áp dụng chuẩn lâm sàng Fear-Free không stress cho thú cưng.',
  giay_phep: '0316888999/SNN-TY',
  gioi_thieu_huy_hieu: 'SỨ MỆNH & TRIẾT LÝ PET M&M',
  gioi_thieu_tieu_de_1: 'Nâng Tầm Chăm Sóc Y Khoa',
  gioi_thieu_tieu_de_2: 'Bằng Trái Tim & Y Đức',
  gioi_thieu_mo_ta: 'Được thành lập với sứ mệnh kiến tạo chuẩn mực y tế thú cưng mới tại Việt Nam, Pet M&M không chỉ là một bệnh viện đa khoa hiện đại, mà còn là một “ngôi nhà thứ hai” nơi mỗi bé cưng được bảo vệ bằng tình thương và sự tận tụy cao nhất.',
  gioi_thieu_cam_ket_tieu_de: 'Cam Kết Vàng Y Khoa',
  gioi_thieu_cam_ket_phu: 'Bảo vệ sức khỏe trọn đời cho thú cưng',
  gioi_thieu_trich_dan: '“Chúng tôi coi từng nhịp thở, từng ánh mắt của các bé là trách nhiệm và niềm tự hào lớn nhất trong sự nghiệp y khoa của mình.”',
  gioi_thieu_bac_si_ten: 'BS. CKI Nguyễn Minh Tuấn',
  gioi_thieu_bac_si_chuc_danh: 'Giám Đốc Chuyên Môn Hệ Thống Bệnh Viện Pet M&M',
  thong_ke_nam_thanh_lap: '2018',
  thong_ke_nam_thanh_lap_nhan: 'Năm thành lập',
  thong_ke_khach_hang: '30k+',
  thong_ke_khach_hang_nhan: 'Khách hàng',
};

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
  const [config, setConfig] = useState<CauHinhRecord>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cau_hinh')
        .select('*')
        .eq('id', 'system')
        .single();

      if (error) {
        console.warn('Lỗi lấy cấu hình hệ thống từ Supabase, dùng mặc định:', error.message);
        return;
      }

      if (data) {
        setConfig((prev) => ({
          ...prev,
          ...data,
        }));
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
