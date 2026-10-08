import { cache } from 'react';
import { supabase, BaiVietRecord } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAssetUrl } from '@/lib/assets';
import KienThucDetailClient from '@/components/KienThucDetailClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

const getArticle = async (id: string): Promise<BaiVietRecord | null> => {
  try {
    const { data, error } = await supabase
      .from('bai_viet')
      .select('*')
      .eq('id', id)
      .eq('kich_hoat', true)
      .single<BaiVietRecord>();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
};

const getRelatedArticles = async (currentId: string): Promise<BaiVietRecord[]> => {
  try {
    const { data } = await supabase
      .from('bai_viet')
      .select('id, tieu_de, tieu_de_en, chuyen_muc, chuyen_muc_en, hinh_anh, ngay_dang')
      .eq('kich_hoat', true)
      .neq('id', currentId)
      .order('thu_tu', { ascending: true })
      .limit(3);

    return (data as BaiVietRecord[]) || [];
  } catch {
    return [];
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getArticle(id);

  if (!data) return { title: 'Cẩm nang kiến thức | PetM&M' };
  return {
    title: `${data.tieu_de} | PetM&M`,
    description: data.mo_ta_ngan || `Cẩm nang y khoa thú cưng: ${data.tieu_de}`,
    openGraph: data.hinh_anh ? { images: [getAssetUrl(data.hinh_anh)] } : undefined,
  };
}

export default async function BaiVietDetailPage({ params }: Props) {
  const { id } = await params;

  // Tối ưu hóa: Chạy song song cả 2 truy vấn qua Promise.all giống hệt trang chi nhánh
  const [article, relatedArticles] = await Promise.all([
    getArticle(id),
    getRelatedArticles(id),
  ]);

  if (!article) notFound();

  return <KienThucDetailClient article={article} relatedArticles={relatedArticles} />;
}
