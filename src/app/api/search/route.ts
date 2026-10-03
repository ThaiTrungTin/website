import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export interface SearchItem {
  id: string;
  type: 'service' | 'article' | 'doctor' | 'branch' | 'faq' | 'job';
  title: string;
  subtitle?: string;
  category?: string;
  url: string;
  image?: string;
  badge?: string;
}

export interface SearchResponse {
  query: string;
  total: number;
  results: {
    services: SearchItem[];
    articles: SearchItem[];
    doctors: SearchItem[];
    branches: SearchItem[];
    faqs: SearchItem[];
    jobs: SearchItem[];
  };
}

function removeVietnameseTones(str: string): string {
  if (!str) return '';
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  str = str.replace(/Đ/g, 'D');
  return str.toLowerCase().trim();
}

function matches(text: string | null | undefined, query: string, normalizedQuery: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  if (lower.includes(query)) return true;
  const norm = removeVietnameseTones(text);
  return norm.includes(normalizedQuery);
}

// Memory cache
let cacheTimestamp = 0;
let cachedData: {
  services: any[];
  articles: any[];
  doctors: any[];
  branches: any[];
  faqs: any[];
  jobs: any[];
} | null = null;

async function getCachedDataset() {
  const now = Date.now();
  if (cachedData && now - cacheTimestamp < 30000) {
    return cachedData;
  }

  const [sRes, aRes, dRes, bRes, fRes, tRes] = await Promise.all([
    supabase.from('dich_vu').select('*').eq('kich_hoat', true),
    supabase.from('bai_viet').select('*').eq('kich_hoat', true),
    supabase.from('doi_ngu_y_te').select('*').eq('kich_hoat', true),
    supabase.from('chi_nhanh').select('*').eq('kich_hoat', true),
    supabase.from('cau_hoi_thuong_gap').select('*').eq('kich_hoat', true),
    supabase.from('tuyen_dung').select('*').eq('kich_hoat', true),
  ]);

  cachedData = {
    services: sRes.data || [],
    articles: aRes.data || [],
    doctors: dRes.data || [],
    branches: bRes.data || [],
    faqs: fRes.data || [],
    jobs: tRes.data || [],
  };
  cacheTimestamp = now;
  return cachedData;
}


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = (searchParams.get('q') || '').trim();
    const lang = searchParams.get('lang') === 'en' ? 'en' : 'vi';
    const isEn = lang === 'en';

    if (!rawQuery) {
      return NextResponse.json({
        query: '',
        total: 0,
        results: {
          services: [],
          articles: [],
          doctors: [],
          branches: [],
          faqs: [],
          jobs: [],
        },
      });
    }

    const data = await getCachedDataset();

    const query = rawQuery.toLowerCase();
    const normalizedQuery = removeVietnameseTones(rawQuery);

    // Category intent keywords detection
    const isRecruitmentIntent =
      normalizedQuery.includes('tuyen dung') ||
      normalizedQuery.includes('tuyendung') ||
      normalizedQuery.includes('tuyen') ||
      normalizedQuery.includes('viec lam') ||
      normalizedQuery.includes('vieclam') ||
      normalizedQuery.includes('ung tuyen') ||
      normalizedQuery.includes('ungtuyen') ||
      normalizedQuery.includes('career') ||
      normalizedQuery.includes('recruit') ||
      normalizedQuery.includes('job') ||
      normalizedQuery.includes('nhan su') ||
      normalizedQuery.includes('co hoi nghe nghiep');

    const isDoctorIntent =
      normalizedQuery.includes('bac si') ||
      normalizedQuery.includes('bac sy') ||
      normalizedQuery.includes('doi ngu') ||
      normalizedQuery.includes('chuyen gia') ||
      normalizedQuery.includes('doctor') ||
      normalizedQuery.includes('team');

    const isServiceIntent =
      normalizedQuery.includes('dich vu') ||
      normalizedQuery.includes('bang gia') ||
      normalizedQuery.includes('chi phi') ||
      normalizedQuery.includes('gia ca') ||
      normalizedQuery.includes('service') ||
      normalizedQuery.includes('price');

    const isBranchIntent =
      normalizedQuery.includes('chi nhanh') ||
      normalizedQuery.includes('co so') ||
      normalizedQuery.includes('dia chi') ||
      normalizedQuery.includes('phong kham') ||
      normalizedQuery.includes('o dau') ||
      normalizedQuery.includes('ban do') ||
      normalizedQuery.includes('branch') ||
      normalizedQuery.includes('location') ||
      normalizedQuery.includes('address');

    const isArticleIntent =
      normalizedQuery.includes('cam nang') ||
      normalizedQuery.includes('kien thuc') ||
      normalizedQuery.includes('bai viet') ||
      normalizedQuery.includes('kinh nghiem') ||
      normalizedQuery.includes('huong dan') ||
      normalizedQuery.includes('tin tuc') ||
      normalizedQuery.includes('blog') ||
      normalizedQuery.includes('article') ||
      normalizedQuery.includes('guide');

    const isFaqIntent =
      normalizedQuery.includes('hoi dap') ||
      normalizedQuery.includes('thac mac') ||
      normalizedQuery.includes('cau hoi') ||
      normalizedQuery.includes('faq') ||
      normalizedQuery.includes('question');

    // 1. Services
    const services: SearchItem[] = data.services
      .filter((s) => {
        if (isServiceIntent) return true;
        return (
          matches(s.ten_dich_vu, query, normalizedQuery) ||
          matches(s.ten_dich_vu_en, query, normalizedQuery) ||
          matches(s.phu_de, query, normalizedQuery) ||
          matches(s.phu_de_en, query, normalizedQuery) ||
          matches(s.mo_ta, query, normalizedQuery) ||
          matches(s.mo_ta_en, query, normalizedQuery) ||
          matches(s.gia_tham_khao, query, normalizedQuery)
        );
      })
      .map((s) => ({
        id: s.id,
        type: 'service',
        title: isEn && s.ten_dich_vu_en ? s.ten_dich_vu_en : s.ten_dich_vu,
        subtitle: isEn && s.phu_de_en ? s.phu_de_en : s.phu_de || s.gia_tham_khao,
        url: `/#services?service=${s.id}`,
        image: s.hinh_anh,
        badge: isEn ? 'Service' : 'Dịch vụ',
      }));

    // 2. Articles
    const articles: SearchItem[] = data.articles
      .filter((a) => {
        if (isArticleIntent) return true;
        return (
          matches(a.tieu_de, query, normalizedQuery) ||
          matches(a.tieu_de_en, query, normalizedQuery) ||
          matches(a.mo_ta_ngan, query, normalizedQuery) ||
          matches(a.mo_ta_ngan_en, query, normalizedQuery) ||
          matches(a.chuyen_muc, query, normalizedQuery) ||
          matches(a.chuyen_muc_en, query, normalizedQuery)
        );
      })
      .map((a) => ({
        id: a.id,
        type: 'article',
        title: isEn && a.tieu_de_en ? a.tieu_de_en : a.tieu_de,
        subtitle: isEn && a.mo_ta_ngan_en ? a.mo_ta_ngan_en : a.mo_ta_ngan,
        category: isEn && a.chuyen_muc_en ? a.chuyen_muc_en : a.chuyen_muc,
        url: `/kien-thuc/${a.id}`,
        image: a.hinh_anh,
        badge: isEn ? 'Article' : 'Cẩm nang',
      }));

    // 3. Doctors
    const doctors: SearchItem[] = data.doctors
      .filter((d) => {
        if (isDoctorIntent) return true;
        return (
          matches(d.ho_ten, query, normalizedQuery) ||
          matches(d.ho_ten_en, query, normalizedQuery) ||
          matches(d.chuc_danh, query, normalizedQuery) ||
          matches(d.chuc_danh_en, query, normalizedQuery) ||
          matches(d.hoc_vi_chuc_vu, query, normalizedQuery) ||
          matches(d.hoc_vi_chuc_vu_en, query, normalizedQuery) ||
          matches(d.mo_ta, query, normalizedQuery) ||
          matches(d.mo_ta_en, query, normalizedQuery)
        );
      })
      .map((d) => ({
        id: d.id,
        type: 'doctor',
        title: isEn && d.ho_ten_en ? d.ho_ten_en : d.ho_ten,
        subtitle: isEn && d.hoc_vi_chuc_vu_en ? d.hoc_vi_chuc_vu_en : d.hoc_vi_chuc_vu || d.chuc_danh,
        url: `/doi-ngu`,
        image: d.hinh_anh,
        badge: isEn ? 'Doctor' : 'Bác sĩ',
      }));

    // If searching for doctors in general, also add link to doctor page
    if (isDoctorIntent && doctors.length > 0) {
      doctors.unshift({
        id: 'all-doctors-page',
        type: 'doctor',
        title: isEn ? 'View All Doctors & Specialists' : 'Xem Toàn Bộ Đội Ngũ Bác Sĩ & Chuyên Gia',
        subtitle: isEn ? 'Comprehensive specialist council at PetM&M' : 'Hội đồng chuyên môn y khoa Bệnh Viện Thú Y PetM&M',
        url: '/doi-ngu',
        badge: isEn ? 'Medical Team' : 'Đội ngũ y tế',
      });
    }

    // 4. Branches
    const branches: SearchItem[] = data.branches
      .filter((b) => {
        if (isBranchIntent) return true;
        return (
          matches(b.ten_chi_nhanh, query, normalizedQuery) ||
          matches(b.ten_chi_nhanh_en, query, normalizedQuery) ||
          matches(b.ten_ngan, query, normalizedQuery) ||
          matches(b.ten_ngan_en, query, normalizedQuery) ||
          matches(b.dia_chi, query, normalizedQuery) ||
          matches(b.dia_chi_en, query, normalizedQuery) ||
          matches(b.so_dien_thoai, query, normalizedQuery)
        );
      })
      .map((b) => ({
        id: b.id,
        type: 'branch',
        title: isEn && b.ten_ngan_en ? b.ten_ngan_en : b.ten_ngan || (isEn && b.ten_chi_nhanh_en ? b.ten_chi_nhanh_en : b.ten_chi_nhanh),
        subtitle: isEn && b.dia_chi_en ? b.dia_chi_en : b.dia_chi,
        url: `/chi-nhanh/${b.id}`,
        image: b.anh_dai_dien,
        badge: isEn ? 'Branch' : 'Chi nhánh',
      }));

    // 5. FAQs
    const faqs: SearchItem[] = data.faqs
      .filter((f) => {
        if (isFaqIntent) return true;
        return (
          matches(f.cau_hoi, query, normalizedQuery) ||
          matches(f.cau_hoi_en, query, normalizedQuery) ||
          matches(f.cau_tra_loi, query, normalizedQuery) ||
          matches(f.cau_tra_loi_en, query, normalizedQuery)
        );
      })
      .map((f) => ({
        id: f.id,
        type: 'faq',
        title: isEn && f.cau_hoi_en ? f.cau_hoi_en : f.cau_hoi,
        subtitle: isEn && f.cau_tra_loi_en ? f.cau_tra_loi_en : f.cau_tra_loi,
        url: `/#faq`,
        badge: isEn ? 'FAQ' : 'Hỏi đáp',
      }));

    // 6. Careers (Tuyển dụng) - Matches title, department, location, description, or any recruitment query
    const jobs: SearchItem[] = data.jobs
      .filter((j) => {
        if (isRecruitmentIntent) return true;
        return (
          matches(j.tieu_de, query, normalizedQuery) ||
          matches(j.tieu_de_en, query, normalizedQuery) ||
          matches(j.phong_ban, query, normalizedQuery) ||
          matches(j.phong_ban_en, query, normalizedQuery) ||
          matches(j.dia_diem, query, normalizedQuery) ||
          matches(j.dia_diem_en, query, normalizedQuery) ||
          matches(j.hinh_thuc, query, normalizedQuery) ||
          matches(j.muc_luong, query, normalizedQuery) ||
          matches(j.mo_ta, query, normalizedQuery) ||
          matches(j.yeu_cau, query, normalizedQuery) ||
          matches(j.quyen_loi, query, normalizedQuery)
        );
      })
      .map((j) => ({
        id: j.id,
        type: 'job',
        title: isEn && j.tieu_de_en ? j.tieu_de_en : j.tieu_de,
        subtitle: `${isEn && j.phong_ban_en ? j.phong_ban_en : j.phong_ban} • ${isEn && j.dia_diem_en ? j.dia_diem_en : j.dia_diem}${j.muc_luong ? ` • ${j.muc_luong}` : ''}`,
        url: `/tuyen-dung/${j.id}`,
        image: j.hinh_anh,
        badge: isEn ? 'Career' : 'Tuyển dụng',
      }));

    // If searching for "tuyển dụng", also put a header card leading to `/tuyen-dung`
    if (isRecruitmentIntent && jobs.length > 0) {
      jobs.unshift({
        id: 'all-careers-page',
        type: 'job',
        title: isEn ? 'Careers at PetM&M (Open Positions)' : 'Cơ Hội Nghề Nghiệp & Tuyển Dụng PetM&M',
        subtitle: isEn ? 'View all open vacancies, benefits and apply online' : 'Xem toàn bộ vị trí việc làm mở, chế độ đãi ngộ và nộp hồ sơ online',
        url: '/tuyen-dung',
        badge: isEn ? 'Careers Page' : 'Trang tuyển dụng',
      });
    }

    const total =
      services.length +
      articles.length +
      doctors.length +
      branches.length +
      faqs.length +
      jobs.length;

    const response: SearchResponse = {
      query: rawQuery,
      total,
      results: {
        services,
        articles,
        doctors,
        branches,
        faqs,
        jobs,
      },
    };

    return NextResponse.json(response);
  } catch (err: any) {
    console.error('Search API error:', err);
    return NextResponse.json(
      {
        query: '',
        total: 0,
        results: {
          services: [],
          articles: [],
          doctors: [],
          branches: [],
          faqs: [],
          jobs: [],
        },
        error: err.message,
      },
      { status: 500 }
    );
  }
}
