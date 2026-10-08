import { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { DEFAULT_PRIVACY_POLICY, PrivacyPolicyConfig } from '@/types/privacyPolicy';
import PrivacyPolicyClient from '@/components/PrivacyPolicyClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Chính Sách Bảo Mật & Bảo Vệ Quyền Riêng Tư | Bệnh Viện Thú Cưng PetM&M',
  description:
    'Chính sách bảo mật và bảo vệ quyền riêng tư người dùng, khách hàng đặt lịch khám và ứng viên nộp hồ sơ tuyển dụng tại Hệ Thống Bệnh Viện Thú Cưng PetM&M theo Nghị định 13/2023/NĐ-CP.',
  openGraph: {
    title: 'Chính Sách Bảo Mật & Quyền Riêng Tư | PetM&M',
    description:
      'Cam kết bảo vệ dữ liệu cá nhân, thông tin đặt lịch và hồ sơ ứng tuyển tại Bệnh Viện Thú Cưng PetM&M.',
    type: 'website',
  },
};

async function getPrivacyPolicy(): Promise<PrivacyPolicyConfig> {
  try {
    const { data, error } = await supabaseAdmin
      .from('chinh_sach_bao_mat')
      .select('*')
      .eq('id', 'main')
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_PRIVACY_POLICY;
    }

    return {
      titleVi: data.tieu_de_vi || DEFAULT_PRIVACY_POLICY.titleVi,
      titleEn: data.tieu_de_en || DEFAULT_PRIVACY_POLICY.titleEn,
      contentVi: data.noi_dung_vi || DEFAULT_PRIVACY_POLICY.contentVi,
      contentEn: data.noi_dung_en || DEFAULT_PRIVACY_POLICY.contentEn,
      lastUpdated: data.ngay_cap_nhat || DEFAULT_PRIVACY_POLICY.lastUpdated,
      isActive: data.kich_hoat !== false,
    };
  } catch (err) {
    console.warn('Lỗi đọc chính sách bảo mật trang server:', err);
    return DEFAULT_PRIVACY_POLICY;
  }
}

export default async function PrivacyPolicyPage() {
  const policyData = await getPrivacyPolicy();
  return <PrivacyPolicyClient initialData={policyData} />;
}
