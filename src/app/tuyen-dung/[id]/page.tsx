import { cache } from 'react';
import { supabase, TuyenDungRecord } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import TuyenDungDetailClient from '@/components/TuyenDungDetailClient';

export const revalidate = 60; // ISR cache 60s

interface Props {
  params: Promise<{ id: string }>;
}

const getJob = cache(async (id: string): Promise<TuyenDungRecord | null> => {
  try {
    const { data, error } = await supabase
      .from('tuyen_dung')
      .select('*')
      .eq('id', id)
      .eq('kich_hoat', true)
      .single<TuyenDungRecord>();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
});

const getOtherJobs = cache(async (currentId: string): Promise<TuyenDungRecord[]> => {
  try {
    const { data } = await supabase
      .from('tuyen_dung')
      .select('*')
      .eq('kich_hoat', true)
      .neq('id', currentId)
      .order('thu_tu', { ascending: true })
      .limit(4);

    return (data as TuyenDungRecord[]) || [];
  } catch {
    return [];
  }
});

export async function generateStaticParams() {
  try {
    const { data: jobs } = await supabase
      .from('tuyen_dung')
      .select('id')
      .eq('kich_hoat', true);
    return (jobs || []).map((j) => ({ id: j.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) {
    return { title: 'Vị Trí Tuyển Dụng | PetM&M' };
  }

  const title = `${job.tieu_de} | Tuyển Dụng PetM&M`;
  const desc = job.mo_ta
    ? job.mo_ta.replace(/<[^>]*>?/gm, '').slice(0, 160)
    : `Tuyển dụng ${job.tieu_de} tại Bệnh Viện Thú Y PetM&M với mức đãi ngộ hấp dẫn.`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: job.hinh_anh ? [job.hinh_anh] : ['/about_hospital.jpg'],
    },
  };
}

export default async function TuyenDungDetailPage({ params }: Props) {
  const { id } = await params;
  const [job, otherJobs] = await Promise.all([getJob(id), getOtherJobs(id)]);

  if (!job) notFound();

  return <TuyenDungDetailClient job={job} otherJobs={otherJobs} />;
}
