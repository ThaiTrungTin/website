import { cache } from 'react';
import { supabase, ChiNhanhRecord } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ChiNhanhDetailClient from '@/components/ChiNhanhDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

// Hàm lấy chi nhánh trực tiếp từ Supabase
const getBranch = async (id: string): Promise<ChiNhanhRecord | null> => {
  try {
    const { data, error } = await supabase
      .from('chi_nhanh')
      .select('*')
      .eq('id', id)
      .eq('kich_hoat', true)
      .single<ChiNhanhRecord>();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
};

// Lấy bài viết cẩm nang mới nhất để hiển thị sidebar
const getRecentArticles = async (): Promise<{ id: string; tieu_de: string; tieu_de_en?: string | null; hinh_anh: string | null; chuyen_muc: string | null; chuyen_muc_en?: string | null; ngay_dang: string | null }[]> => {
  try {
    const { data } = await supabase
      .from('bai_viet')
      .select('id, tieu_de, tieu_de_en, hinh_anh, chuyen_muc, chuyen_muc_en, ngay_dang')
      .eq('kich_hoat', true)
      .order('thu_tu', { ascending: true })
      .limit(3);
    return data || [];
  } catch {
    return [];
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getBranch(id);

  if (!data) return { title: 'Chi nhánh | PetM&M' };
  return {
    title: `${data.ten_chi_nhanh} | PetM&M`,
    description: `Thông tin chi tiết về ${data.ten_chi_nhanh} - ${data.dia_chi}`,
    openGraph: data.anh_dai_dien ? { images: [data.anh_dai_dien] } : undefined,
  };
}

export default async function ChiNhanhDetailPage({ params }: Props) {
  const { id } = await params;
  const [branch, recentArticles] = await Promise.all([
    getBranch(id),
    getRecentArticles(),
  ]);

  if (!branch) notFound();

  return <ChiNhanhDetailClient branch={branch} recentArticles={recentArticles} />;
}

