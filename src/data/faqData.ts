export interface FaqItem {
  id: string;
  category?: string;
  category_en?: string;
  question: string;
  question_en?: string;
  answer: string;
  answer_en?: string;
}

export const faqData: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Cấp cứu & Hotline',
    category_en: 'Emergency & Hotline',
    question: 'PetM&M có nhận khám cấp cứu không?',
    question_en: 'Does PetM&M provide emergency veterinary care?',
    answer: 'Có. Đội ngũ bác sĩ và điều dưỡng PetM&M luôn túc trực Hotline 24/7 (Hotline: 0903 599 339) và sẵn sàng tiếp nhận sơ cứu, hồi sức khẩn cấp, phẫu thuật ban đêm tại cơ sở Quận 1 với trang thiết bị phòng mổ áp lực dương hiện đại.',
    answer_en: "Yes. PetM&M's team of veterinary surgeons and nurses is on duty 24/7 (Hotline: 0903 599 339), ready for emergency first aid, intensive resuscitation, and overnight surgery at our District 1 hospital equipped with state-of-the-art positive-pressure surgical suites."
  },
  {
    id: 'faq-2',
    category: 'Chuẩn bị thăm khám',
    category_en: 'Visit Preparation',
    question: 'Tôi cần chuẩn bị gì khi đưa thú cưng đến khám?',
    question_en: 'What should I prepare before bringing my pet for an examination?',
    answer: 'Ba mẹ vui lòng mang theo sổ tiêm chủng, tiền sử bệnh án gần nhất (nếu có) và cho bé nhịn ăn từ 4 - 6 tiếng nếu có kế hoạch làm xét nghiệm máu hoặc siêu âm ổ bụng. Để an toàn, hãy đặt bé mèo trong túi/lồng vận chuyển và đeo dây dắt cho cún cưng.',
    answer_en: "Please bring your pet's vaccination record, recent medical history (if any), and withhold food for 4 to 6 hours if blood tests or abdominal ultrasound are scheduled. For safety, please keep cats inside a secure carrier and ensure dogs are on a leash."
  },
  {
    id: 'faq-3',
    category: 'Lưu trú & Resort',
    category_en: 'Boarding & Resort',
    question: 'Dịch vụ lưu trú và Resort thú cưng có ở tất cả cơ sở không?',
    question_en: 'Is luxury pet hotel & resort boarding available at all branches?',
    answer: 'Dịch vụ khách sạn & resort thú cưng chuẩn 5 sao có mặt tại tất cả hệ thống cơ sở PetM&M. Mỗi phòng đều có điều hòa lọc khí ion âm, camera Full HD xem trực tiếp 24/24 trên điện thoại của ba mẹ và nhật ký sinh hoạt gửi qua Zalo mỗi ngày.',
    answer_en: 'Our 5-star pet hotel & resort boarding service is available across all PetM&M locations. Every suite features negative-ion air conditioning, 24/7 live-stream Full HD cameras accessible from your smartphone, and daily activity logs shared via Zalo.'
  },
  {
    id: 'faq-4',
    category: 'Vận chuyển Pet Taxi',
    category_en: 'Pet Taxi & Relocation',
    question: 'PetM&M có hỗ trợ luân chuyển thú cưng đi nội địa / quốc tế không?',
    question_en: 'Does PetM&M support domestic and international pet relocation?',
    answer: 'Có. Dịch vụ Pet Taxi chuyên dụng của PetM&M nhận đưa đón các bé tận nơi trong nội ô TP.HCM, chuyển tuyến liên tỉnh an toàn và hỗ trợ trọn gói thủ tục vi mạch ISO, xét nghiệm kháng thể dại, giấy chứng nhận kiểm dịch xuất cảnh quốc tế.',
    answer_en: "Yes. PetM&M's dedicated Pet Taxi provides door-to-door transportation within Ho Chi Minh City, safe inter-provincial transfers, and full-package assistance for ISO microchipping, rabies titer testing, and international export quarantine certificates."
  },
  {
    id: 'faq-5',
    category: 'Tư vấn & Lựa chọn dịch vụ',
    category_en: 'Consultation & Guidance',
    question: 'Tôi chưa biết nên chọn dịch vụ nào — PetM&M có tư vấn không?',
    question_en: 'I am unsure which service to choose — can PetM&M advise me?',
    answer: 'Hoàn toàn có! Đội ngũ bác sĩ và chuyên viên tư vấn PetM&M luôn sẵn sàng hỗ trợ trực tiếp qua Zalo OA hoặc Hotline 0903 599 339 để lắng nghe tình trạng thể trạng của bé, tư vấn giải pháp tối ưu và cung cấp bảng giá chi tiết trước khi quý khách đưa ra quyết định.',
    answer_en: 'Absolutely! Our veterinarians and customer care specialists are always available via Zalo OA or Hotline 0903 599 339 to assess your pet\'s condition, recommend optimal solutions, and provide transparent fee estimates before you make any decision.'
  },
  {
    id: 'faq-6',
    category: 'Kiểm soát nhiễm khuẩn',
    category_en: 'Infection Control',
    question: 'Quy trình vô trùng và phòng chống lây nhiễm chéo như thế nào?',
    question_en: 'What are your sterilization and cross-infection prevention protocols?',
    answer: 'PetM&M áp dụng quy trình kiểm soát nhiễm khuẩn chuẩn quốc tế: 100% dụng cụ khám và phẫu thuật được hấp tiệt trùng Autoclave ở 134°C, khu nội trú và phòng khám được chiếu đèn cực tím UV-C khử khuẩn mỗi ngày, phân luồng tách biệt hoàn toàn giữa khu Chó - Mèo.',
    answer_en: 'PetM&M enforces international-standard infection control protocols: 100% of diagnostic and surgical instruments undergo 134°C Autoclave steam sterilization, inpatient wards and consultation rooms are disinfected daily with UV-C germicidal light, and dog and cat facilities are completely segregated.'
  }
];
