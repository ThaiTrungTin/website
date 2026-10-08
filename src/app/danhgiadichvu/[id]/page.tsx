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
    title: 'PetM&M - Đánh giá dịch vụ',
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

  // Hỗ trợ mã DEMO hoặc placeholder cho kiểm duyệt viên Zalo ZNS
  const isDemoOrPlaceholder = 
    cleanId.toLowerCase() === 'demo' || 
    cleanId.toLowerCase() === 'test' || 
    cleanId === '<demo>' ||
    cleanId === '<review_code>' || 
    cleanId.toLowerCase() === 'review_code' ||
    cleanId.startsWith('demo-');

  if (isDemoOrPlaceholder) {
    const demoRecord: import('@/lib/supabase').YeuCauDanhGiaRecord = {
      id: 'demo-sample-id',
      ma_danh_gia: cleanId,
      ten_khach_hang: 'Khách hàng Trải nghiệm (Bản xem trước Zalo)',
      so_dien_thoai: '0934395168',
      co_so: 'Bệnh viện thú y PetM&M',
      trang_thai: 'cho_danh_gia',
      ngay_tao: new Date().toISOString(),
    };
    return (
      <DanhGiaDichVuClient
        initialRecord={demoRecord}
        branchAddress="19 Đ. Số 1, Phường Phước Long, TP. Thủ Đức, TP. Hồ Chí Minh"
      />
    );
  }

  // Truy vấn kiểm tra mã đánh giá từ cơ sở dữ liệu
  const { data: record, error } = await supabaseAdmin
    .from('yeu_cau_danh_gia')
    .select('*')
    .eq('ma_danh_gia', cleanId)
    .limit(1)
    .maybeSingle();

  // Nếu người dùng cố tình bịa ra mã đánh giá không trùng khớp -> 404
  if (error || !record) {
    notFound();
  }

  // Tra cứu địa chỉ và hình ảnh bìa thực tế của cơ sở tương ứng
  let branchAddress = '19 Đ. Số 1, Phường Phước Long, TP. Thủ Đức, TP. Hồ Chí Minh';
  let branchCoverImage = '';
  if (record.co_so) {
    try {
      const { data: branchData } = await supabaseAdmin
        .from('chi_nhanh')
        .select('dia_chi, ten_chi_nhanh, anh_dai_dien, anh_goc')
        .ilike('ten_chi_nhanh', `%${record.co_so}%`)
        .maybeSingle();
      if (branchData?.dia_chi) {
        branchAddress = branchData.dia_chi;
      }
      if (branchData?.anh_dai_dien || branchData?.anh_goc) {
        branchCoverImage = branchData.anh_dai_dien || branchData.anh_goc || '';
      }
    } catch {}
  }

  // Làm sạch hinh_anh nếu là chuỗi JSON chứa nguoi_tao và img
  let safeHinhAnh = record.hinh_anh;
  if (safeHinhAnh && typeof safeHinhAnh === 'string') {
    const trimmed = safeHinhAnh.trim();
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        safeHinhAnh = parsed.img || null;
      } catch {
        safeHinhAnh = null;
      }
    }
  }

  const safeRecord = {
    ...record,
    hinh_anh: safeHinhAnh,
  };

  return (
    <DanhGiaDichVuClient
      initialRecord={safeRecord}
      branchAddress={branchAddress}
      branchCoverImage={branchCoverImage}
    />
  );
}

