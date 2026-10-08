import { cache } from 'react';
import { supabase, TuyenDungRecord } from '@/lib/supabase';
import type { Metadata } from 'next';
import TuyenDungListClient from '@/components/TuyenDungListClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getJobs = cache(async (): Promise<TuyenDungRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('tuyen_dung')
      .select('*')
      .eq('kich_hoat', true)
      .order('thu_tu', { ascending: true });

    if (error || !data) return [];
    return data as TuyenDungRecord[];
  } catch (err) {
    console.warn('Lỗi tải danh sách tuyển dụng từ Supabase:', err);
    return [];
  }
});

export const metadata: Metadata = {
  title: 'Cơ Hội Nghề Nghiệp & Tuyển Dụng | PetM&M',
  description:
    'Gia nhập đội ngũ y bác sĩ, kỹ thuật viên spa và điều dưỡng chuẩn Fear-Free 5 sao quốc tế tại Bệnh viện Thú Y PetM&M. Mức thu nhập hấp dẫn, môi trường y khoa vô trùng, đào tạo chuyên sâu.',
  openGraph: {
    title: 'Tuyển Dụng Nhân Tài Thú Y Chuẩn Fear-Free | PetM&M',
    description:
      'Gia nhập đội ngũ y bác sĩ, kỹ thuật viên spa và điều dưỡng chuẩn Fear-Free 5 sao quốc tế tại PetM&M. Chế độ đãi ngộ hàng đầu ngành thú y.',
    images: ['/about_hospital.jpg'],
  },
};

export default async function TuyenDungPage() {
  const jobs = await getJobs();
  return <TuyenDungListClient initialJobs={jobs} />;
}
