'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { supabase, DichVuRecord } from '@/lib/supabase';
import { useSystemConfig } from '@/context/SystemConfigContext';
import { useScrollReveal } from '@/components/ScrollRevealTitle';
import { getAssetUrl } from '@/lib/assets';
import {
  Stethoscope,
  Scissors,
  CheckCircle2,
  CalendarCheck,
  Clock,
  Sparkles,
  ArrowRight,
  PhoneCall,
  ShieldCheck,
  Flame,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

interface ServicesSectionProps {
  onSelectService: (serviceTitle: string) => void;
}

const FALLBACK_SERVICES: DichVuRecord[] = [
  {
    id: 'kham-tong-quat',
    ten_dich_vu: 'Khám Tổng Quát & Tư Vấn Chuyên Sâu',
    phu_de: 'Đánh giá sức khỏe toàn diện từ bác sĩ chuyên khoa',
    nhom_dich_vu: 'medical',
    huy_hieu: 'Phổ biến nhất',
    mo_ta: 'Quy trình thăm khám 12 bước chuyên sâu: tim mạch, hô hấp, mắt, tai mũi họng, răng miệng và hệ cơ xương khớp theo tiêu chuẩn quốc tế.',
    hinh_anh: '/services_bg.jpg',
    gia_tham_khao: 'Từ 150.000đ',
    thoi_luong: '30 - 45 phút',
    tien_ich: [
      'Bác sĩ chuyên khoa hơn 10 năm kinh nghiệm trực tiếp thăm khám',
      'Hồ sơ bệnh án điện tử trọn đời tra cứu trên hệ thống',
      'Tư vấn phác đồ dinh dưỡng & sinh hoạt cá thể hóa cho từng bé',
      'Khu khám phân luồng Chó - Mèo riêng biệt không gây stress (Fear-Free)'
    ],
    quy_trinh: [
      'Tiếp nhận & kiểm tra sinh hiệu cơ bản (nhiệt độ, nhịp tim, hô hấp)',
      'Thăm khám lâm sàng toàn diện 12 hệ cơ quan',
      'Tư vấn kết quả & hướng dẫn chăm sóc phòng ngừa'
    ],
    noi_bat: true,
    thu_tu: 1,
    kich_hoat: true
  },
  {
    id: 'tiem-phong-vaccine',
    ten_dich_vu: 'Tiêm Chủng Vaccine Dự Phòng Chuẩn GSP',
    phu_de: 'Bảo vệ thú cưng trước các dịch bệnh nguy hiểm',
    nhom_dich_vu: 'medical',
    huy_hieu: 'Chuẩn quốc tế',
    mo_ta: 'Sử dụng 100% vaccine chính hãng (Zoetis, Boehringer Ingelheim) được bảo quản lạnh chuẩn GSP từ 2 - 8°C nghiêm ngặt kèm sổ tiêm điện tử.',
    hinh_anh: '/pet_puppy_play.jpg',
    gia_tham_khao: 'Từ 220.000đ / mũi',
    thoi_luong: '20 phút',
    tien_ich: [
      'Vaccine Chó 5-trong-1, 7-trong-1 chính hãng Mỹ/Pháp',
      'Vaccine Mèo 4-trong-1 phòng Giảm Bạch Cầu & Hô hấp',
      'Tiêm phòng dại định kỳ cấp chứng nhận thú y nhà nước',
      'Miễn phí 100% kiểm tra sức khỏe sàng lọc trước tiêm'
    ],
    quy_trinh: [
      'Khám sàng lọc đo nhiệt độ và kiểm tra lâm sàng',
      'Tiêm vaccine vô trùng và ghi nhận nhật ký tiêm chủng',
      'Theo dõi phản ứng sau tiêm 15 phút tại phòng chờ tiện nghi'
    ],
    noi_bat: false,
    thu_tu: 2,
    kich_hoat: true
  },
  {
    id: 'xet-nghiem-chan-doan',
    ten_dich_vu: 'Xét Nghiệm & Chẩn Đoán Hình Ảnh Kỹ Thuật Số',
    phu_de: 'Hệ thống máy móc hiện đại cho kết quả trong 15 phút',
    nhom_dich_vu: 'medical',
    huy_hieu: 'Công nghệ cao',
    mo_ta: 'Trang bị máy sinh hóa máu tự động, máy X-quang kỹ thuật số cao tần và siêu âm màu Doppler chuyên dụng cho động vật nhỏ.',
    hinh_anh: '/hero_cinematic.jpg',
    gia_tham_khao: 'Từ 180.000đ',
    thoi_luong: '15 - 30 phút có kết quả',
    tien_ich: [
      'Xét nghiệm công thức máu & sinh hóa chức năng gan, thận',
      'Siêu âm màu Doppler ổ bụng, siêu âm tim mạch chuyên sâu',
      'Chụp X-quang kỹ thuật số liều tia tối thiểu an toàn',
      'Test nhanh Parvo, Care, FPV độ nhạy và chính xác 99.8%'
    ],
    quy_trinh: [
      'Lấy mẫu máu/nước tiểu nhẹ nhàng bằng kim siêu nhỏ',
      'Chạy máy tự động phân tích chỉ số trong phòng lab vô trùng',
      'Bác sĩ đọc kết quả và giải thích chi tiết cho chủ nuôi'
    ],
    noi_bat: false,
    thu_tu: 3,
    kich_hoat: true
  },
  {
    id: 'phau-thuat-ngoai-khoa',
    ten_dich_vu: 'Phẫu Thuật Ngoại Khoa & Triệt Sản An Toàn',
    phu_de: 'Phòng mổ áp lực dương vô trùng tuyệt đối',
    nhom_dich_vu: 'medical',
    huy_hieu: 'An toàn 5 sao',
    mo_ta: 'Thực hiện từ các ca triệt sản an toàn đến phẫu thuật chỉnh hình xương, nối gân, nội soi và phẫu thuật mô mềm phức tạp.',
    hinh_anh: '/services_bg.jpg',
    gia_tham_khao: 'Tư vấn theo ca bệnh',
    thoi_luong: 'Tùy theo chỉ định',
    tien_ich: [
      'Gây mê bay hơi Isoflurane tiêu chuẩn bệnh viện quốc tế',
      'Máy theo dõi sinh hiệu Monitor 6 thông số liên tục',
      'Dao mổ điện cầm máu vi phẫu giảm đau vết mổ',
      'Phòng hồi sức sưởi ấm chuyên biệt sau phẫu thuật'
    ],
    quy_trinh: [
      'Xét nghiệm tiền phẫu đánh giá chức năng gan thận',
      'Gây mê hồi sức và phẫu thuật trong phòng vô trùng tuyệt đối',
      'Chăm sóc hậu phẫu và kiểm tra vết mổ định kỳ miễn phí'
    ],
    noi_bat: true,
    thu_tu: 4,
    kich_hoat: true
  },
  {
    id: 'dieu-tri-noi-tru',
    ten_dich_vu: 'Điều Trị Nội Trú & Hồi Sức Cấp Cứu 24/7',
    phu_de: 'Chăm sóc y tế liên tục, lồng bệnh sưởi ấm chuyên dụng',
    nhom_dich_vu: 'medical',
    huy_hieu: 'Trực ca 24/24',
    mo_ta: 'Khu nội trú tiệt trùng với hệ thống lọc không khí HEPA, giám sát liên tục bởi đội ngũ y tá và bác sĩ trực ca đêm 24/24.',
    hinh_anh: '/pet_kitten_eyes.jpg',
    gia_tham_khao: 'Từ 200.000đ / ngày',
    thoi_luong: 'Theo dõi 24/24',
    tien_ich: [
      'Bác sĩ & điều dưỡng theo dõi liên tục ngày đêm',
      'Buồng oxy cấp cứu tích hợp cho ca bệnh nặng',
      'Camera livestream cho chủ nuôi quan sát từ xa',
      'Chế độ dinh dưỡng bệnh lý chuyên biệt từng ca'
    ],
    quy_trinh: [
      'Tiếp nhận ca bệnh & lập hồ sơ theo dõi sinh hiệu từng giờ',
      'Cho uống thuốc, truyền dịch và dinh dưỡng theo chỉ định',
      'Cập nhật tình trạng qua Zalo cho ba mẹ 2 lần/ngày'
    ],
    noi_bat: false,
    thu_tu: 5,
    kich_hoat: true
  },
  {
    id: 'spa-grooming-cat-tia',
    ten_dich_vu: 'Spa Grooming & Cắt Tỉa Tạo Kiểu 5 Sao',
    phu_de: 'Nuông chiều thú cưng với liệu trình dưỡng lông da cao cấp',
    nhom_dich_vu: 'care',
    huy_hieu: 'Được yêu thích nhất',
    mo_ta: 'Liệu trình Spa 10 bước: Tắm sục Ozone khử mùi, massage thư giãn, sấy êm ái, vệ sinh tai kẽ móng và cắt tỉa tạo kiểu theo phong cách Hàn Quốc/Nhật Bản.',
    hinh_anh: '/pet_golden_spa.jpg',
    gia_tham_khao: 'Từ 250.000đ',
    thoi_luong: '60 - 90 phút',
    tien_ich: [
      'Sữa tắm thảo mộc hữu cơ cao cấp nhập khẩu an toàn cho da',
      'Bồn sục Ozone thư giãn sâu, hỗ trợ điều trị viêm da',
      'Chuyên viên Grooming tay nghề cao có chứng chỉ quốc tế',
      'Phòng sấy tách biệt cách âm giảm stress tiếng ồn cho bé'
    ],
    quy_trinh: [
      'Kiểm tra tình trạng da lông & tư vấn kiểu cắt phù hợp',
      'Tắm sục Ozone, xả dưỡng, vắt tuyến hôi & massage',
      'Sấy tơi lông, chải nếp, cắt mài móng & tỉa kiểu nghệ thuật'
    ],
    noi_bat: true,
    thu_tu: 6,
    kich_hoat: true
  },
  {
    id: 'daycare-ban-tru',
    ten_dich_vu: 'Trông Giữ Bán Trú Daycare Vui Nhộn',
    phu_de: 'Vui chơi năng động cùng bạn bè suốt cả ngày',
    nhom_dich_vu: 'care',
    huy_hieu: 'Năng động vui khỏe',
    mo_ta: 'Khu vực sân chơi trong nhà và ngoài trời có thảm cỏ mềm, điều hòa mát lạnh. Thú cưng được giao lưu, vận động và rèn luyện hành vi tích cực.',
    hinh_anh: '/pet_corgi_park.jpg',
    gia_tham_khao: 'Từ 180.000đ / ngày',
    thoi_luong: '08:00 - 19:30 hằng ngày',
    tien_ich: [
      'Sân chơi có giám sát viên chuyên nghiệp túc trực',
      'Giờ ngủ trưa thư giãn trong phòng máy lạnh nhạc êm dịu',
      'Bữa phụ dinh dưỡng bổ sung năng lượng chất lượng cao',
      'Cập nhật hình ảnh & video vui chơi qua Zalo mỗi 2 tiếng'
    ],
    quy_trinh: [
      'Đón bé & kiểm tra sức khỏe ban đầu trước khi vào sân',
      'Giao lưu vận động theo các trò chơi rèn luyện phản xạ',
      'Ăn nhẹ, nghỉ trưa mát mẻ và chải chuốt trước khi về'
    ],
    noi_bat: false,
    thu_tu: 7,
    kich_hoat: true
  },
  {
    id: 'pet-hotel-resort',
    ten_dich_vu: 'Khách Sạn Thú Cưng Chuẩn Suite 5 Sao',
    phu_de: 'Phòng riêng máy lạnh, camera Full HD xem 24/7',
    nhom_dich_vu: 'care',
    huy_hieu: 'Đẳng cấp 5 sao',
    mo_ta: 'Không gian nghỉ dưỡng sang trọng, khử khuẩn mỗi ngày, điều hòa nhiệt độ ổn định 24-26°C. Thích hợp cho kỳ nghỉ lễ, công tác dài ngày của gia đình.',
    hinh_anh: '/pet_cat_resort.jpg',
    gia_tham_khao: 'Từ 280.000đ / đêm',
    thoi_luong: 'Theo yêu cầu',
    tien_ich: [
      'Phòng kính riêng biệt view thoáng, nệm êm ấm áp',
      'Camera riêng từng phòng xem trực tiếp 24/24 trên điện thoại',
      'Đi dạo công viên sinh thái 2 lần mỗi ngày hít thở khí trời',
      'Bác sĩ thú y thăm khám sàng lọc sức khỏe hằng ngày'
    ],
    quy_trinh: [
      'Nhận phòng, bố trí nệm êm và thức ăn quen thuộc theo thói quen',
      'Lịch sinh hoạt chuẩn resort: dạo bộ, ăn hạt cao cấp, chơi đùa',
      'Gửi nhật ký sinh hoạt và video báo cáo cho ba mẹ mỗi tối'
    ],
    noi_bat: true,
    thu_tu: 8,
    kich_hoat: true
  },
  {
    id: 'pet-taxi-dua-don',
    ten_dich_vu: 'Đưa Đón Thú Cưng Tận Nhà (Pet Taxi)',
    phu_de: 'Xe chuyên dụng điều hòa, an toàn và đúng hẹn',
    nhom_dich_vu: 'care',
    huy_hieu: 'Tiện lợi tận nơi',
    mo_ta: 'Dịch vụ xe đưa đón tận cửa cho thú cưng đi khám bệnh, tiêm phòng hoặc đi Spa khi chủ nuôi bận rộn không thể tự đưa đón.',
    hinh_anh: '/branches_bg.jpg',
    gia_tham_khao: 'Từ 90.000đ / chuyến',
    thoi_luong: 'Đặt trước 1 - 2 tiếng',
    tien_ich: [
      'Xe chuyên dụng trang bị lồng an toàn chống say xe',
      'Tài xế & nhân viên có kỹ năng dỗ dành và bế ẵm thú cưng',
      'Khử trùng xe bằng tia cực tím sau mỗi lượt đón trả',
      'Phục vụ nhanh chóng toàn bộ các quận huyện tại TP.HCM'
    ],
    quy_trinh: [
      'Tiếp nhận địa chỉ & điều phối xe đúng giờ hẹn',
      'Đón thú cưng an toàn và đưa đến phòng khám/spa',
      'Bàn giao tận tay gia đình sau khi hoàn tất dịch vụ'
    ],
    noi_bat: false,
    thu_tu: 9,
    kich_hoat: true
  }
];

export default function ServicesSection({ onSelectService }: ServicesSectionProps) {
  const { config } = useSystemConfig();
  const [services, setServices] = useState<DichVuRecord[]>(FALLBACK_SERVICES);
  const [activeTab, setActiveTab] = useState<'medical' | 'care'>('medical');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('kham-tong-quat');
  const [isChanging, setIsChanging] = useState(false);

  // Scroll reveal hiệu ứng xuất hiện chỉ dành cho tiêu đề (cả khi lướt xuống và lướt lên)
  const { ref: titleRef, isVisible: isTitleVisible } = useScrollReveal();

  // 1. Tải danh sách dịch vụ từ Supabase (bảng dich_vu)
  const fetchServicesFromDb = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('dich_vu')
        .select('*')
        .eq('kich_hoat', true)
        .order('thu_tu', { ascending: true });

      if (!error && data && data.length > 0) {
        setServices(data as DichVuRecord[]);
        const firstOfGroup = data.find((s) => s.nhom_dich_vu === activeTab);
        if (firstOfGroup) {
          setSelectedServiceId(firstOfGroup.id);
        }
      }
    } catch (e) {
      console.warn('Dùng dữ liệu dịch vụ mặc định:', e);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchServicesFromDb();
  }, [fetchServicesFromDb]);

  // Lọc dịch vụ theo nhóm tab hiện tại
  const currentTabServices = services.filter((s) => s.nhom_dich_vu === activeTab);

  // Dịch vụ đang được chọn để hiển thị ở khung chi tiết lớn bên phải (Desktop)
  const selectedService =
    currentTabServices.find((s) => s.id === selectedServiceId) ||
    currentTabServices[0] ||
    services[0];

  // Chuyển Tab
  const handleTabChange = (tab: 'medical' | 'care') => {
    setActiveTab(tab);
    const firstItem = services.find((s) => s.nhom_dich_vu === tab);
    if (firstItem) {
      triggerSelectService(firstItem.id);
    }
  };

  // Chuyển dịch vụ với hiệu ứng chuyển cảnh mượt
  const triggerSelectService = (id: string) => {
    if (id === selectedServiceId) return;
    setIsChanging(true);
    setTimeout(() => {
      setSelectedServiceId(id);
      setIsChanging(false);
    }, 120);
  };

  // Toggle dịch vụ trên Mobile (Accordion)
  const handleMobileToggle = (id: string) => {
    if (selectedServiceId === id) {
      // nếu bấm lại dịch vụ đang mở thì thu gọn lại
      setSelectedServiceId('');
    } else {
      setSelectedServiceId(id);
    }
  };

  const medicalCount = services.filter((s) => s.nhom_dich_vu === 'medical').length;
  const careCount = services.filter((s) => s.nhom_dich_vu === 'care').length;

  return (
    <section id="services" className="relative py-16 sm:py-24 text-slate-900 overflow-hidden bg-white">
      {/* 1. ARCHITECTURAL BACKGROUND WITH SOFT LIGHT & GENTLE TOP BLEND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src={getAssetUrl('/services_bg.jpg')}
          alt="Kiến trúc resort bệnh viện thú y Pet M&M"
          fill
          quality={90}
          className="object-cover object-center scale-105 opacity-20"
        />
        {/* Lớp chuyển vùng mờ dần êm ái kết nối tự nhiên từ Hero sang */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/85 to-white/95 backdrop-blur-[2px]" />
        {/* Soft feather gradient at the top edge */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header */}
        <div
          ref={titleRef}
          className="text-center max-w-4xl mx-auto mb-8 sm:mb-12"
        >
          {/* Tiêu đề CHUẨN 3 DÒNG: Hiệu ứng xuất hiện mượt mà khi cuộn tới cả 2 chiều */}
          <h2 className="font-editorial text-2xl sm:text-4xl md:text-5xl lg:text-[3.25rem] tracking-tight text-slate-900 leading-tight sm:leading-snug">
            <span
              className={`block font-normal whitespace-nowrap transition-all duration-700 ${
                isTitleVisible ? 'animate-service-title-1' : 'opacity-0 translate-y-8 blur-[4px]'
              }`}
            >
              Chăm Sóc Y Khoa Chuyên Sâu
            </span>
            <span
              className={`block my-0.5 sm:my-1 text-xl sm:text-3xl md:text-4xl font-light italic text-[#2D5A27] transition-all duration-700 ${
                isTitleVisible ? 'animate-service-title-2' : 'opacity-0 translate-y-8 blur-[4px]'
              }`}
            >
              &amp;
            </span>
            <span
              className={`block font-light italic text-[#2D5A27] whitespace-nowrap transition-all duration-700 ${
                isTitleVisible ? 'animate-service-title-3' : 'opacity-0 translate-y-8 blur-[4px]'
              }`}
            >
              Nuông Chiều Thú Cưng Đẳng Cấp
            </span>
          </h2>

          {/* ── TIÊU ĐỀ 2 NHÓM DỊCH VỤ TĨNH, LUÔN HIỂN THỊ 100% KHÔNG BỊ ẨN KHI CUỘN ── */}
          <div className="w-full max-w-xl mx-auto grid grid-cols-2 p-1 sm:p-1.5 rounded-full bg-slate-100 border border-slate-200 mt-6 sm:mt-8 shadow-inner">
            <button
              onClick={() => handleTabChange('medical')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-6 py-2.5 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
                activeTab === 'medical'
                  ? 'bg-gradient-to-r from-[#2D5A27] to-emerald-700 text-white shadow-md shadow-emerald-950/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Stethoscope className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === 'medical' ? 'text-[#FFB800]' : 'text-[#2D5A27]'}`} />
              <span className="truncate">
                <span className="sm:hidden">Y Tế &amp; Thú Y</span>
                <span className="hidden sm:inline">Nhóm 1: Thú Y &amp; Y Tế</span>
              </span>
              <span className={`text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold shrink-0 ${activeTab === 'medical' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {medicalCount}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('care')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-6 py-2.5 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 cursor-pointer ${
                activeTab === 'care'
                  ? 'bg-gradient-to-r from-[#2D5A27] to-emerald-700 text-white shadow-md shadow-emerald-950/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Scissors className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${activeTab === 'care' ? 'text-[#FFB800]' : 'text-[#2D5A27]'}`} />
              <span className="truncate">
                <span className="sm:hidden">Chăm Sóc &amp; Resort</span>
                <span className="hidden sm:inline">Nhóm 2: Chăm Sóc &amp; Lưu Trú</span>
              </span>
              <span className={`text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-full font-bold shrink-0 ${activeTab === 'care' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {careCount}
              </span>
            </button>
          </div>
        </div>

        {/* ── 2. BỐ CỤC DỊCH VỤ: ACCORDION TRÊN ĐT & MASTER-DETAIL TRÊN LAPTOP (LUÔN HIỂN THỊ ĐẦY ĐỦ, KHÔNG BAO GIỜ BỊ MẤT TRẮNG) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* ── CỘT DANH SÁCH (Trên mobile: Click đổ chi tiết xuống dưới, không cần ảnh to) ── */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between pb-1 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Danh sách gói ({currentTabServices.length})
              </span>
              <span className="text-[11px] text-[#2D5A27] font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#FFB800]" />
                Nhấp để xem chi tiết
              </span>
            </div>

            {/* List các dịch vụ (LUÔN HIỂN THỊ RÕ NÉT 100%, TUYỆT ĐỐI KHÔNG DÙNG OPACITY-0) */}
            <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1 no-scrollbar">
              {currentTabServices.map((service, idx) => {
                const isSelected = selectedServiceId === service.id;

                return (
                  <div
                    key={service.id}
                    className={`rounded-2xl transition-all duration-200 overflow-hidden ${
                      isSelected
                        ? 'bg-white border-2 border-[#2D5A27] shadow-md shadow-emerald-950/10'
                        : 'bg-white/80 hover:bg-white border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-sm'
                    }`}
                  >
                    {/* Hàng Header dịch vụ (Click chọn trên laptop, click mở/đóng trên mobile) */}
                    <div
                      onClick={() => {
                        // Desktop: chọn dịch vụ để hiển thị bên phải
                        triggerSelectService(service.id);
                        // Mobile: toggle accordion
                        handleMobileToggle(service.id);
                      }}
                      className="p-3 sm:p-3.5 flex items-center gap-3 sm:gap-3.5 cursor-pointer relative select-none"
                    >
                      {/* Ảnh thumbnail nhỏ (Chung 1 ảnh với chi tiết, nhỏ gọn ở list) */}
                      <div className="relative w-15 h-15 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200 shadow-2xs">
                        <img
                          src={getAssetUrl(service.hinh_anh)}
                          alt={service.ten_dich_vu}
                          className={`w-full h-full object-cover transition-transform duration-300 ${
                            isSelected ? 'scale-110' : 'group-hover:scale-105'
                          }`}
                          style={{ objectPosition: service.can_chinh_anh || '50% 50%' }}
                        />
                        {service.noi_bat && (
                          <div className="absolute top-1 left-1 w-2.5 h-2.5 rounded-full bg-[#FFB800] ring-2 ring-white" />
                        )}
                      </div>

                      {/* Thông tin vắn tắt */}
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          {service.huy_hieu && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isSelected
                                  ? 'bg-[#2D5A27] text-white'
                                  : 'bg-emerald-50 text-[#2D5A27] border border-emerald-100'
                              }`}
                            >
                              {service.huy_hieu}
                            </span>
                          )}
                          {service.gia_tham_khao && (
                            <span className="text-[11px] font-bold text-amber-700 ml-auto shrink-0 font-mono">
                              {service.gia_tham_khao}
                            </span>
                          )}
                        </div>

                        <h3
                          className={`text-xs sm:text-sm font-bold truncate leading-snug transition-colors ${
                            isSelected ? 'text-[#2D5A27]' : 'text-slate-900'
                          }`}
                        >
                          {service.ten_dich_vu}
                        </h3>

                        {service.phu_de && (
                          <p className="text-[11px] text-slate-500 truncate font-light mt-0.5">
                            {service.phu_de}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                          {service.thoi_luong && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{service.thoi_luong}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Mũi tên chỉ báo (Trên mobile đổi thành ChevronDown/Up, trên desktop ChevronRight) */}
                      <div className="shrink-0 text-slate-300">
                        <span className="hidden lg:inline-block">
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${
                              isSelected ? 'text-[#2D5A27] translate-x-1' : ''
                            }`}
                          />
                        </span>
                        <span className="lg:hidden inline-block">
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isSelected ? 'text-[#2D5A27] rotate-180' : ''
                            }`}
                          />
                        </span>
                      </div>
                    </div>

                    {/* ── CHI TIẾT ĐỔ XUỐNG DƯỚI NGAY TRÊN ĐIỆN THOẠI (KHÔNG CẦN ẢNH TO) ── */}
                    {isSelected && (
                      <div className="lg:hidden px-3.5 pb-4 pt-1 border-t border-slate-100 space-y-3 bg-slate-50/50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {service.mo_ta && (
                          <p className="text-xs text-slate-600 leading-relaxed font-light">
                            {service.mo_ta}
                          </p>
                        )}

                        {service.tien_ich && service.tien_ich.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wide block">
                              Tiện ích &amp; Tiêu chuẩn chuyên môn:
                            </span>
                            <div className="space-y-1">
                              {service.tien_ich.map((feat, fIdx) => (
                                <div key={fIdx} className="flex items-start gap-1.5 text-xs text-slate-700">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A27] shrink-0 mt-0.5" />
                                  <span className="leading-snug">{feat}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {service.quy_trinh && service.quy_trinh.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wide block">
                              Quy trình thực hiện:
                            </span>
                            <div className="space-y-1">
                              {service.quy_trinh.map((step, sIdx) => (
                                <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-600">
                                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-[#2D5A27] font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                                    {sIdx + 1}
                                  </span>
                                  <span className="leading-snug">{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Các nút hành động ngay trên điện thoại */}
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectService(service.ten_dich_vu);
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white font-bold text-xs shadow-xs cursor-pointer"
                          >
                            <CalendarCheck className="w-3.5 h-3.5 text-[#FFB800]" />
                            <span>Đặt Lịch Ngay</span>
                          </button>

                          {config.hotline && (
                            <a
                              href={`tel:${config.hotline.replace(/\s+/g, '')}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-emerald-50 text-[#2D5A27] border border-emerald-200 font-bold text-xs cursor-pointer"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>Gọi Tư Vấn</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── CỘT PHẢI (Detail Showcase - CHỈ HIỂN THỊ TRÊN LAPTOP / DESKTOP) ── */}
          <div className="hidden lg:block lg:col-span-7 lg:sticky lg:top-24">
            <div
              className={`bg-white rounded-3xl border-2 border-[#2D5A27] shadow-xl p-5 relative overflow-hidden transition-all duration-300 ${
                isChanging ? 'opacity-40 scale-[0.99]' : 'opacity-100 scale-100'
              }`}
            >
              {/* Vệt trang trí góc */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2D5A27]/5 rounded-bl-full pointer-events-none" />

              {/* 1. ẢNH LỚN NỔI BẬT: NÚT ĐẶT LỊCH VÀ SĐT NẰM TRỰC TIẾP TRÊN NỀN ẢNH */}
              <div className="relative w-full h-64 md:h-72 rounded-2xl overflow-hidden bg-slate-900 shadow-md mb-4 group">
                <img
                  src={getAssetUrl(selectedService.hinh_anh)}
                  alt={selectedService.ten_dich_vu}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ objectPosition: selectedService.can_chinh_anh || '50% 50%' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20" />

                {/* Huy hiệu trên ảnh */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                  {selectedService.huy_hieu && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFB800] text-slate-950 shadow-md">
                      <Flame className="w-3.5 h-3.5 fill-slate-950" />
                      {selectedService.huy_hieu}
                    </span>
                  )}
                  {selectedService.noi_bat && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md border border-white/30">
                      <Sparkles className="w-3 h-3 text-[#FFB800]" />
                      Nổi bật 5 sao
                    </span>
                  )}
                </div>

                {/* THÔNG TIN GIÁ + NÚT ĐẶT LỊCH & SĐT NẰM TRỰC TIẾP TRÊN NỀN ẢNH */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <span className="text-[10px] text-white/70 block uppercase tracking-wider font-semibold">
                        Chi phí trọn gói
                      </span>
                      <span className="text-lg font-bold font-mono text-[#FFB800]">
                        {selectedService.gia_tham_khao || 'Liên hệ tư vấn'}
                      </span>
                    </div>

                    {selectedService.thoi_luong && (
                      <div className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/20 flex items-center gap-1.5 text-xs text-white/90">
                        <Clock className="w-3 h-3 text-[#FFB800]" />
                        <span>{selectedService.thoi_luong}</span>
                      </div>
                    )}
                  </div>

                  {/* CỤM NÚT ĐẶT LỊCH & HOTLINE TRÊN NỀN ẢNH */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => onSelectService(selectedService.ten_dich_vu)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2D5A27] to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer border border-emerald-500/30"
                    >
                      <CalendarCheck className="w-4 h-4 text-[#FFB800]" />
                      <span>Đặt Lịch Gói Này</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {config.hotline && (
                      <a
                        href={`tel:${config.hotline.replace(/\s+/g, '')}`}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs transition border border-white/30 cursor-pointer shadow-md shrink-0"
                        title="Gọi hotline tư vấn"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-[#FFB800]" />
                        <span>{config.hotline_hien_thi || config.hotline}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. THÔNG TIN CHI TIẾT GỌN GÀNG PHÍA DƯỚI ẢNH */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-editorial text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                    {selectedService.ten_dich_vu}
                  </h3>
                  {selectedService.phu_de && (
                    <p className="text-xs font-medium text-[#2D5A27] mt-0.5">
                      {selectedService.phu_de}
                    </p>
                  )}
                </div>

                {selectedService.mo_ta && (
                  <p className="text-xs text-slate-600 leading-relaxed font-light line-clamp-3">
                    {selectedService.mo_ta}
                  </p>
                )}

                {/* Tiện ích & Cam kết */}
                {selectedService.tien_ich && selectedService.tien_ich.length > 0 && (
                  <div className="pt-2.5 border-t border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 block mb-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A27]" />
                      Tiện ích &amp; Tiêu chuẩn chuyên môn:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                      {selectedService.tien_ich.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A27] shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Các bước quy trình */}
                {selectedService.quy_trinh && selectedService.quy_trinh.length > 0 && (
                  <div className="pt-2.5 border-t border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 block mb-1.5">
                      Quy trình điều trị / thực hiện:
                    </span>
                    <div className="space-y-1">
                      {selectedService.quy_trinh.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                          <span className="w-4 h-4 rounded-full bg-emerald-100 text-[#2D5A27] font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-snug">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
