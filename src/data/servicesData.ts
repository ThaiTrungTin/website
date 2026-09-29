export interface ServiceItem {
  id: string;
  category: 'medical' | 'care';
  title: string;
  subtitle: string;
  badge?: string;
  description: string;
  features: string[];
  priceHint: string;
  duration: string;
  iconName: string;
  highlight?: boolean;
}

export const servicesData: ServiceItem[] = [
  // Nhóm 1: Thú Y & Y Tế
  {
    id: 'kham-tu-van',
    category: 'medical',
    title: 'Khám Tổng Quát & Tư Vấn',
    subtitle: 'Đánh giá sức khỏe toàn diện từ bác sĩ chuyên khoa',
    badge: 'Phổ biến nhất',
    description: 'Quy trình thăm khám 12 bước chuyên sâu: tim mạch, hô hấp, mắt, tai mũi họng, răng miệng và hệ cơ xương khớp theo tiêu chuẩn quốc tế.',
    features: [
      'Bác sĩ chuyên khoa hơn 10 năm kinh nghiệm',
      'Hồ sơ bệnh án điện tử trọn đời',
      'Tư vấn chế độ dinh dưỡng cá thể hóa',
      'Khu khám phân luồng Chó - Mèo riêng biệt'
    ],
    priceHint: 'Từ 150.000đ',
    duration: '30 - 45 phút',
    iconName: 'Stethoscope',
    highlight: true,
  },
  {
    id: 'tiem-phong-vaccine',
    category: 'medical',
    title: 'Tiêm Chủng Vaccine Dự Phòng',
    subtitle: 'Bảo vệ thú cưng trước các dịch bệnh nguy hiểm',
    badge: 'Chuẩn quốc tế',
    description: 'Sử dụng 100% vaccine chính hãng (Zoetis, Boehringer Ingelheim) được bảo quản lạnh chuẩn GSP từ 2 - 8°C nghiêm ngặt.',
    features: [
      'Vaccine Chó 5-trong-1, 7-trong-1',
      'Vaccine Mèo 4-trong-1 ngừa Giảm Bạch Cầu',
      'Tiêm phòng dại định kỳ kèm chứng nhận',
      'Miễn phí khám sàng lọc trước khi tiêm'
    ],
    priceHint: 'Từ 220.000đ / mũi',
    duration: '20 phút',
    iconName: 'Syringe',
  },
  {
    id: 'xet-nghiem-chan-doan',
    category: 'medical',
    title: 'Xét Nghiệm & Chẩn Đoán Hình Ảnh',
    subtitle: 'Hệ thống máy móc hiện đại cho kết quả trong 15 phút',
    description: 'Trang bị máy sinh hóa máu tự động, máy X-quang kỹ thuật số cao tần và siêu âm màu Doppler chuyên dụng cho động vật nhỏ.',
    features: [
      'Xét nghiệm máu tổng quát & sinh hóa',
      'Siêu âm thai, ổ bụng, tim mạch Doppler',
      'X-quang kỹ thuật số liều tia tối thiểu',
      'Test nhanh Parvo, Carre, FPV chuẩn xác 99%'
    ],
    priceHint: 'Từ 180.000đ',
    duration: '15 - 30 phút có kết quả',
    iconName: 'Activity',
  },
  {
    id: 'phau-thuat-ngoai-khoa',
    category: 'medical',
    title: 'Phẫu Thuật Ngoại Khoa',
    subtitle: 'Phòng mổ áp lực dương vô trùng tuyệt đối',
    badge: 'An toàn cao',
    description: 'Thực hiện từ các ca triệt sản an toàn đến phẫu thuật chỉnh hình xương, nối gân, nội soi và phẫu thuật mô mềm phức tạp.',
    features: [
      'Gây mê bay hơi Isoflurane an toàn tối đa',
      'Máy theo dõi sinh hiệu Monitor 6 thông số',
      'Dao mổ điện cầm máu vi phẫu',
      'Quy trình hồi sức tích cực hậu phẫu'
    ],
    priceHint: 'Tư vấn theo ca phẫu thuật',
    duration: 'Tùy theo chỉ định',
    iconName: 'ShieldAlert',
  },
  {
    id: 'dieu-tri-noi-tru',
    category: 'medical',
    title: 'Điều Trị Nội Trú 24/7',
    subtitle: 'Chăm sóc y tế liên tục, lồng bệnh sưởi ấm chuyên dụng',
    description: 'Khu nội trú tiệt trùng với hệ thống lọc không khí HEPA, giám sát liên tục bởi đội ngũ y tá và bác sĩ trực ca đêm 24/24.',
    features: [
      'Bác sĩ & điều dưỡng theo dõi 24/7',
      'Buồng oxy cấp cứu tích hợp',
      'Camera livestream cho chủ nuôi quan sát',
      'Chế độ ăn bệnh lý chuyên biệt'
    ],
    priceHint: 'Từ 200.000đ / ngày',
    duration: 'Theo dõi 24/24',
    iconName: 'HeartPulse',
  },

  // Nhóm 2: Chăm Sóc & Lưu Trú
  {
    id: 'spa-grooming',
    category: 'care',
    title: 'Spa Grooming & Cắt Tỉa Tạo Kiểu',
    subtitle: 'Nuông chiều thú cưng với liệu trình dưỡng lông da cao cấp',
    badge: 'Được yêu thích nhất',
    description: 'Liệu trình Spa 10 bước: Tắm sục Ozone khử mùi, massage thư giãn, sấy êm ái, vệ sinh tai kẽ móng và cắt tỉa tạo kiểu theo phong cách Hàn Quốc/Nhật Bản.',
    features: [
      'Sữa tắm thảo mộc hữu cơ cao cấp',
      'Bồn sục Ozone thư giãn, trị viêm da',
      'Thợ Grooming chứng chỉ quốc tế',
      'Phòng sấy tách biệt giảm stress tiếng ồn'
    ],
    priceHint: 'Từ 250.000đ',
    duration: '60 - 90 phút',
    iconName: 'Scissors',
    highlight: true,
  },
  {
    id: 'daycare-ban-tru',
    category: 'care',
    title: 'Trông Giữ Bán Trú Daycare',
    subtitle: 'Vui chơi năng động cùng bạn bè suốt cả ngày',
    description: 'Khu vực sân chơi trong nhà và ngoài trời có thảm cỏ mềm, điều hòa mát lạnh. Thú cưng được giao lưu, vận động và rèn luyện hành vi tích cực.',
    features: [
      'Sân chơi có giám sát viên chuyên nghiệp',
      'Giờ ngủ trưa thư giãn nhạc êm dịu',
      'Bữa phụ bổ sung dinh dưỡng chất lượng',
      'Cập nhật ảnh và video cho chủ nuôi mỗi 2 tiếng'
    ],
    priceHint: 'Từ 180.000đ / ngày',
    duration: '08:00 - 19:30 hằng ngày',
    iconName: 'Smile',
  },
  {
    id: 'pet-hotel-5-star',
    category: 'care',
    title: 'Khách Sạn Thú Cưng Chuẩn 5 Sao',
    subtitle: 'Phòng riêng máy lạnh, camera Full HD xem 24/7',
    badge: 'Đẳng cấp 5 sao',
    description: 'Không gian nghỉ dưỡng sang trọng, khử khuẩn mỗi ngày, điều hòa nhiệt độ ổn định 24-26°C. Thích hợp cho kỳ nghỉ lễ, công tác dài ngày của gia đình.',
    features: [
      'Phòng kính riêng biệt, nệm êm ấm áp',
      'Camera riêng từng phòng xem trực tiếp trên app',
      'Đi dạo công viên 2 lần mỗi ngày',
      'Bác sĩ thú y thăm khám sức khỏe hằng ngày'
    ],
    priceHint: 'Từ 280.000đ / đêm',
    duration: 'Theo yêu cầu',
    iconName: 'Home',
    highlight: true,
  },
  {
    id: 'pet-taxi',
    category: 'care',
    title: 'Đưa Đón Thú Cưng Tận Nhà (Pet Taxi)',
    subtitle: 'Xe chuyên dụng điều hòa, an toàn và đúng hẹn',
    description: 'Dịch vụ xe đưa đón tận cửa cho thú cưng đi khám bệnh, tiêm phòng hoặc đi Spa khi chủ nuôi bận rộn không thể tự đưa đón.',
    features: [
      'Xe chuyên dụng trang bị lồng an toàn',
      'Tài xế & nhân viên có kỹ năng chăm sóc thú cưng',
      'Khử trùng xe sau mỗi lượt đón',
      'Phục vụ toàn khu vực TP.HCM'
    ],
    priceHint: 'Từ 90.000đ / chuyến',
    duration: 'Đặt trước 1 - 2 tiếng',
    iconName: 'Car',
  }
];
