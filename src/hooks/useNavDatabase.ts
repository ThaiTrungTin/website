'use client';

import { useState, useEffect } from 'react';
import { supabase, ChiNhanhRecord, DichVuRecord, BaiVietRecord } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

export interface ServiceTier2Item {
  id: string;
  name: string;
  href: string;
}

export interface ServiceTier1Group {
  id: string;
  name: string;
  href: string;
  children: ServiceTier2Item[];
}

export interface BranchMenuItem {
  id: string;
  name: string;
  href: string;
}

export interface KnowledgeArticleItem {
  id: string;
  title: string;
  href: string;
}

export interface KnowledgeCategoryGroup {
  category: string;
  href: string;
  articles: KnowledgeArticleItem[];
}

export function useNavDatabase() {
  const { isEn } = useLanguage();

  // 1. Initial State with Real Database Records (prevents empty flashes during initial render)
  const [branches, setBranches] = useState<BranchMenuItem[]>([
    {
      id: 'a7186fc4-3f00-46ce-a3d3-5179b46ee0f4',
      name: 'Cơ sở TP. Thủ Đức',
      href: '/chi-nhanh/a7186fc4-3f00-46ce-a3d3-5179b46ee0f4',
    },
    {
      id: 'd8db3ebd-c672-4eef-8985-705c8076b8bf',
      name: 'sá',
      href: '/chi-nhanh/d8db3ebd-c672-4eef-8985-705c8076b8bf',
    },
  ]);

  const [servicesData, setServicesData] = useState<DichVuRecord[]>([
    {
      id: 'kham-tong-quat',
      ten_dich_vu: 'Khám Tổng Quát & Tư Vấn Chuyên Sâu',
      ten_dich_vu_en: 'General Exams & Intensive Counseling',
      nhom_dich_vu: 'medical',
      hinh_anh: '/services_bg.jpg',
      kich_hoat: true,
      thu_tu: 1,
    },
    {
      id: 'tiem-phong-vaccine',
      ten_dich_vu: 'Tiêm Chủng Vaccine Dự Phòng Chuẩn GSP',
      ten_dich_vu_en: 'GSP Standard Preventive Vaccination',
      nhom_dich_vu: 'medical',
      hinh_anh: '/pet_puppy_play.jpg',
      kich_hoat: true,
      thu_tu: 2,
    },
    {
      id: 'xet-nghiem-chan-doan',
      ten_dich_vu: 'Xét Nghiệm & Chẩn Đoán Hình Ảnh Kỹ Thuật Số',
      ten_dich_vu_en: 'Digital Imaging Tests & Diagnostics',
      nhom_dich_vu: 'medical',
      hinh_anh: '/hero_cinematic.jpg',
      kich_hoat: true,
      thu_tu: 3,
    },
    {
      id: 'phau-thuat-triet-san',
      ten_dich_vu: 'Phẫu Thuật Ngoại Khoa & Triệt Sản An Toàn',
      ten_dich_vu_en: 'Safe Surgical & Neutering',
      nhom_dich_vu: 'medical',
      hinh_anh: '/services_bg.jpg',
      kich_hoat: true,
      thu_tu: 4,
    },
    {
      id: 'dieu-tri-cap-cuu',
      ten_dich_vu: 'Điều Trị Nội Trú & Hồi Sức Cấp Cứu 24/7',
      ten_dich_vu_en: 'Inpatient Care & 24/7 Emergency',
      nhom_dich_vu: 'medical',
      hinh_anh: '/about_consultation.jpg',
      kich_hoat: true,
      thu_tu: 5,
    },
    {
      id: 'spa-grooming',
      ten_dich_vu: 'Spa Grooming & Cắt Tỉa Tạo Kiểu 5 Sao',
      ten_dich_vu_en: '5-Star Spa Grooming & Styling',
      nhom_dich_vu: 'care',
      hinh_anh: '/pet_golden_spa.jpg',
      kich_hoat: true,
      thu_tu: 6,
    },
    {
      id: 'trong-giu-daycare',
      ten_dich_vu: 'Trông Giữ Bán Trú Daycare Vui Nhộn',
      ten_dich_vu_en: 'Fun Daycare Care',
      nhom_dich_vu: 'care',
      hinh_anh: '/pet_cat_rest.jpg',
      kich_hoat: true,
      thu_tu: 7,
    },
    {
      id: 'khach-san-thu-cung',
      ten_dich_vu: 'Khách Sạn Thú Cưng Chuẩn Suite 5 Sao',
      ten_dich_vu_en: '5-Star Suite Pet Hotel',
      nhom_dich_vu: 'care',
      hinh_anh: '/about_hospital.jpg',
      kich_hoat: true,
      thu_tu: 8,
    },
    {
      id: 'dua-don-pet-taxi',
      ten_dich_vu: 'Đưa Đón Thú Cưng Tận Nhà (Pet Taxi)',
      ten_dich_vu_en: 'Home Pet Taxi Service',
      nhom_dich_vu: 'care',
      hinh_anh: '/hero_cinematic.jpg',
      kich_hoat: true,
      thu_tu: 9,
    },
  ]);

  const [articlesData, setArticlesData] = useState<BaiVietRecord[]>([
    {
      id: '0dfd2b2e-7dc9-4958-9c06-41841911ea95',
      tieu_de: 'Lịch tiêm phòng chuẩn cho Chó & Mèo từ 2 tháng tuổi',
      chuyen_muc: 'Y Khoa Dự Phòng',
      kich_hoat: true,
      thu_tu: 1,
    },
    {
      id: '8f9df8db-f9c8-44a6-bf65-391697e8b0f8',
      tieu_de: 'Dấu hiệu nhận biết sớm sốc nhiệt ở thú cưng mùa nắng nóng',
      chuyen_muc: 'Sơ Cứu Thú Cưng',
      kich_hoat: true,
      thu_tu: 2,
    },
    {
      id: 'c88f34c9-d46b-4273-ad69-728144b750db',
      tieu_de: 'Bí quyết chăm sóc lông da mềm mượt và trị ve rận triệt để',
      tieu_de_en: 'The secret to taking care of soft and smooth skin and treating ticks thoroughly',
      chuyen_muc: 'Chăm Sóc & Spa',
      kich_hoat: true,
      thu_tu: 3,
    },
  ]);

  // 2. Fetch live data from Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        // Fetch real branches
        const { data: branchRows } = await supabase
          .from('chi_nhanh')
          .select('id, ten_chi_nhanh, ten_chi_nhanh_en, ten_ngan, ten_ngan_en, dia_chi, dia_chi_en, khu_vuc')
          .eq('kich_hoat', true)
          .order('thu_tu', { ascending: true });

        if (isMounted && branchRows && branchRows.length > 0) {
          setBranches(
            branchRows.map((b: ChiNhanhRecord) => {
              // Priority: ten_ngan (matching Image 2: "Cơ sở TP. Thủ Đức", "sá")
              const shortName = isEn && b.ten_ngan_en ? b.ten_ngan_en : b.ten_ngan;
              const fullName = isEn && b.ten_chi_nhanh_en ? b.ten_chi_nhanh_en : b.ten_chi_nhanh;
              return {
                id: b.id,
                name: shortName?.trim() || fullName?.trim() || 'Chi nhánh',
                href: `/chi-nhanh/${b.id}`,
              };
            })
          );
        }

        // Fetch real services
        const { data: serviceRows } = await supabase
          .from('dich_vu')
          .select('*')
          .eq('kich_hoat', true)
          .order('thu_tu', { ascending: true });

        if (isMounted && serviceRows && serviceRows.length > 0) {
          setServicesData(serviceRows);
        }

        // Fetch real articles
        const { data: postRows } = await supabase
          .from('bai_viet')
          .select('id, tieu_de, tieu_de_en, chuyen_muc, chuyen_muc_en')
          .eq('kich_hoat', true)
          .order('thu_tu', { ascending: true });

        if (isMounted && postRows && postRows.length > 0) {
          setArticlesData(postRows);
        }
      } catch (err) {
        console.warn('Error fetching nav data from Supabase:', err);
      }
    }

    loadData();

    const handleFocus = () => { loadData(); };
    window.addEventListener('focus', handleFocus);

    const channel = supabase
      .channel('realtime_nav_database')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chi_nhanh' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dich_vu' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bai_viet' }, loadData)
      .subscribe();

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
      supabase.removeChannel(channel);
    };
  }, [isEn]);

  // 3. Structure 2-tier service menu with EXACTLY the 2 groups from Image 1:
  // Nhóm 1: Thú Y & Y Tế (medical)
  // Nhóm 2: Chăm Sóc & Lưu Trú (care)
  const medicalServices = servicesData.filter((s) => s.nhom_dich_vu === 'medical');
  const careServices = servicesData.filter((s) => s.nhom_dich_vu === 'care');

  const serviceGroups: ServiceTier1Group[] = [
    {
      id: 'medical',
      name: isEn ? 'Veterinary & Medical' : 'Thú Y & Y Tế',
      href: '/#services',
      children: medicalServices.map((s) => ({
        id: s.id,
        name: isEn && s.ten_dich_vu_en ? s.ten_dich_vu_en : s.ten_dich_vu,
        href: `/#services?service=${s.id}`,
      })),
    },
    {
      id: 'care',
      name: isEn ? 'Care & Lodging' : 'Chăm Sóc & Lưu Trú',
      href: '/#services',
      children: careServices.map((s) => ({
        id: s.id,
        name: isEn && s.ten_dich_vu_en ? s.ten_dich_vu_en : s.ten_dich_vu,
        href: `/#services?service=${s.id}`,
      })),
    },
  ];

  // 4. Structure 2-tier knowledge menu:
  // Tier 1: Only categories that have child articles in DB
  // Tier 2: The child article titles, clicking jumps directly to `/kien-thuc/${article.id}`
  const catMap = new Map<string, KnowledgeArticleItem[]>();
  articlesData.forEach((post) => {
    const cat = (isEn && post.chuyen_muc_en ? post.chuyen_muc_en : post.chuyen_muc)?.trim();
    if (!cat) return;

    if (!catMap.has(cat)) {
      catMap.set(cat, []);
    }

    catMap.get(cat)!.push({
      id: post.id,
      title: isEn && post.tieu_de_en ? post.tieu_de_en : post.tieu_de,
      href: `/kien-thuc/${post.id}`,
    });
  });

  const knowledgeGroups: KnowledgeCategoryGroup[] = Array.from(catMap.entries())
    .filter(([_, list]) => list.length > 0)
    .map(([catName, list]) => ({
      category: catName,
      href: list[0]?.href || '/#knowledge',
      articles: list,
    }));

  return {
    branches,
    serviceGroups,
    services: servicesData,
    knowledgeGroups,
  };
}
