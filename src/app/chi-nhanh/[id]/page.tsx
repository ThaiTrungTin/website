import { cache } from 'react';
import { supabase, ChiNhanhRecord } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import type { Metadata } from 'next';
import ConsultationSidebar from '@/components/ConsultationSidebar';
import BranchFaqSidebar from '@/components/BranchFaqSidebar';
import Footer from '@/components/Footer';
import FloatingContactWidgets from '@/components/FloatingContactWidgets';
import ScrollNavigationButtons from '@/components/ScrollNavigationButtons';
import { getAssetUrl } from '@/lib/assets';

// ISR Cache: Revalidate every 60 seconds (Instant 0ms responses for cached pages)
export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

// React cache to deduplicate Supabase call between generateMetadata and Page component
const getBranch = cache(async (id: string): Promise<ChiNhanhRecord | null> => {
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
});

// Pre-render static paths for fast instant navigation
export async function generateStaticParams() {
  try {
    const { data: branches } = await supabase
      .from('chi_nhanh')
      .select('id')
      .eq('kich_hoat', true);
    return (branches || []).map((b) => ({ id: b.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getBranch(id);

  if (!data) return { title: 'Chi nhánh | Pet M&M' };
  return {
    title: `${data.ten_chi_nhanh} | Pet M&M`,
    description: `Thông tin chi tiết về ${data.ten_chi_nhanh} - ${data.dia_chi}`,
    openGraph: data.anh_dai_dien ? { images: [data.anh_dai_dien] } : undefined,
  };
}

export default async function ChiNhanhDetailPage({ params }: Props) {
  const { id } = await params;
  const branch = await getBranch(id);

  if (!branch) notFound();

  const heroImg = branch.anh_dai_dien;
  const heroPos = branch.can_chinh_anh || '50% 50%';

  return (
    <div className="min-h-screen bg-[#f8faf7]">

      {/* ── 1. HERO IMAGE (full-width) ── */}
      {heroImg ? (
        <div className="relative w-full h-56 sm:h-72 md:h-96 lg:h-[460px] overflow-hidden">
          <img
            src={getAssetUrl(heroImg)}
            alt={branch.ten_chi_nhanh}
            className="w-full h-full object-cover"
            style={{ objectPosition: heroPos }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {branch.khu_vuc && (
                <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30 mb-3">
                  {branch.khu_vuc}
                </span>
              )}
              <h1 className="text-2xl sm:text-4xl font-bold text-white drop-shadow-lg leading-snug">
                {branch.ten_chi_nhanh}
              </h1>
              {branch.dia_chi && (
                <p className="flex items-center gap-1.5 text-white/80 text-sm mt-2">
                  <MapPin className="w-4 h-4 shrink-0" />
                  {branch.dia_chi}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-[#2D5A27] to-emerald-700 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {branch.khu_vuc && (
              <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white border border-white/30 mb-3">
                {branch.khu_vuc}
              </span>
            )}
            <h1 className="text-2xl sm:text-4xl font-bold text-white leading-snug">{branch.ten_chi_nhanh}</h1>
            {branch.dia_chi && (
              <p className="flex items-center gap-1.5 text-white/80 text-sm mt-2">
                <MapPin className="w-4 h-4 shrink-0" />
                {branch.dia_chi}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── 2. BREADCRUMB (sticky) ── */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center gap-1.5 text-xs sm:text-sm flex-wrap">
            <li>
              <Link href="/" className="text-slate-500 hover:text-[#2D5A27] transition font-medium">
                Trang chủ
              </Link>
            </li>
            <li className="text-slate-300 select-none">›</li>
            <li>
              <Link href="/#branches" className="text-slate-500 hover:text-[#2D5A27] transition font-medium">
                Hệ thống cơ sở
              </Link>
            </li>
            {branch.khu_vuc && (
              <>
                <li className="text-slate-300 select-none">›</li>
                <li><span className="text-slate-500 font-medium">{branch.khu_vuc}</span></li>
              </>
            )}
            <li className="text-slate-300 select-none">›</li>
            <li><span className="text-[#2D5A27] font-bold">{branch.ten_chi_nhanh}</span></li>
          </ol>
        </div>
      </nav>

      {/* ── 3. MAIN CONTENT: Cân đối hoàn hảo giữa bài viết & sidebar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT: Quick info + Article (chiếm 8/12 cột, cân đối chuẩn mực) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Quick info strip (Cố định 1 hàng duy nhất & Sticky khi cuộn) */}
            <div className="sticky top-[46px] sm:top-[50px] z-20 bg-white/95 backdrop-blur-md rounded-2xl shadow-xs border border-slate-200/90 px-3.5 sm:px-5 py-3 flex items-center justify-between gap-2.5 sm:gap-4 transition-all">
              <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1 overflow-x-auto no-scrollbar">
                {branch.so_dien_thoai && (
                  <a
                    href={`tel:${branch.so_dien_thoai}`}
                    className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800 hover:text-[#2D5A27] transition shrink-0"
                    title={`Gọi điện: ${branch.so_dien_thoai}`}
                  >
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      <Phone className="w-3.5 h-3.5 text-[#2D5A27]" />
                    </span>
                    <span className="font-mono tracking-tight">{branch.so_dien_thoai}</span>
                  </a>
                )}

                {branch.gio_hoat_dong && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600 shrink-0">
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5 text-[#2D5A27]" />
                    </span>
                    <span>{branch.gio_hoat_dong}</span>
                  </div>
                )}
              </div>

              {branch.link_ggmap_app && (
                <a
                  href={branch.link_ggmap_app}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold transition shadow-xs shrink-0 cursor-pointer whitespace-nowrap"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Chỉ đường</span>
                </a>
              )}
            </div>

            {/* Rich-text article */}
            {branch.bai_viet_chi_tiet && branch.bai_viet_chi_tiet.trim() !== '' ? (
              <article className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 sm:p-8 md:p-10">
                <div
                  className="prose prose-slate prose-base sm:prose-lg max-w-none
                    prose-headings:text-[#2D5A27] prose-headings:font-bold prose-headings:tracking-tight
                    prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-emerald-100/60 prose-h2:pb-2.5
                    prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                    prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
                    prose-ul:my-4 prose-ol:my-4 prose-li:my-1.5 prose-li:text-slate-700
                    prose-a:text-[#2D5A27] prose-a:font-semibold prose-a:underline hover:prose-a:text-emerald-700
                    prose-strong:text-slate-900 prose-strong:font-bold
                    prose-img:rounded-2xl prose-img:shadow-md prose-img:my-6
                    prose-blockquote:border-l-4 prose-blockquote:border-l-[#2D5A27] prose-blockquote:bg-emerald-50/50 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-xl prose-blockquote:text-slate-700 prose-blockquote:not-italic"
                  dangerouslySetInnerHTML={{ __html: branch.bai_viet_chi_tiet }}
                />
              </article>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
                <p className="text-sm">Chưa có bài viết chi tiết cho cơ sở này.</p>
                <p className="text-xs mt-1">Quản trị viên có thể thêm nội dung trong trang Admin.</p>
              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR: form + FAQ + support (chiếm 4/12 cột ôm khít tự nhiên, không bị khoảng trống hở) */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 space-y-4 w-full">
              {/* Consultation form */}
              <ConsultationSidebar branchName={branch.ten_chi_nhanh} />

              {/* FAQ + Support panel */}
              <BranchFaqSidebar />
            </div>
          </div>

        </div>
      </div>

      {/* ── 4. FOOTER ĐÁY TRANG: BẢN ĐỒ GẮN TRỰC TIẾP TRONG THANH ĐÁY (ĐỔI THEO CHI NHÁNH) ── */}
      <Footer branch={branch} />

      {/* ── 5. WIDGET LIÊN HỆ & NÚT CUỘN ĐẦU TRANG / CUỐI TRANG NẰM BÊN PHẢI ── */}
      <FloatingContactWidgets />
      <ScrollNavigationButtons />

    </div>
  );
}
