import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import DanhGiaDichVuClient from './DanhGiaDichVuClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'Đánh Giá Dịch Vụ — Bệnh Viện Thú Y 5 Sao PetM&M',
    description: 'Khảo sát và đánh giá chất lượng dịch vụ Bệnh Viện Đa Khoa Thú Y PetM&M.',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function DanhGiaDichVuDetailPage({ params }: Props) {
  const { id } = await params;
  const cleanId = decodeURIComponent(id || '').trim();

  if (!cleanId) {
    notFound();
  }

  // Truy vấn kiểm tra mã đánh giá từ cơ sở dữ liệu
  const { data: record, error } = await supabaseAdmin
    .from('yeu_cau_danh_gia')
    .select('*')
    .eq('ma_danh_gia', cleanId)
    .limit(1)
    .maybeSingle();

  // "nếu người dùng cố tình bịa ra mã đánh giá sau địa chỉ , nhưng không trùng khớp sẽ báo lỗi 404"
  if (error || !record) {
    notFound();
  }

  return <DanhGiaDichVuClient initialRecord={record} />;
}
