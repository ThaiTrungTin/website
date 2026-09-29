export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export const faqData: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Cấp cứu & Hotline',
    question: 'Pet M&M có nhận khám cấp cứu không?',
    answer: 'Có. Đội ngũ bác sĩ và điều dưỡng Pet M&M luôn túc trực Hotline 24/7 (Hotline: 0903 599 339) và sẵn sàng tiếp nhận sơ cứu, hồi sức khẩn cấp, phẫu thuật ban đêm tại cơ sở Quận 1 với trang thiết bị phòng mổ áp lực dương hiện đại.'
  },
  {
    id: 'faq-2',
    category: 'Chuẩn bị thăm khám',
    question: 'Tôi cần chuẩn bị gì khi đưa thú cưng đến khám?',
    answer: 'Ba mẹ vui lòng mang theo sổ tiêm chủng, tiền sử bệnh án gần nhất (nếu có) và cho bé nhịn ăn từ 4 - 6 tiếng nếu có kế hoạch làm xét nghiệm máu hoặc siêu âm ổ bụng. Để an toàn, hãy đặt bé mèo trong túi/lồng vận chuyển và đeo dây dắt cho cún cưng.'
  },
  {
    id: 'faq-3',
    category: 'Lưu trú & Resort',
    question: 'Dịch vụ lưu trú và Resort thú cưng có ở tất cả cơ sở không?',
    answer: 'Dịch vụ khách sạn & resort thú cưng chuẩn 5 sao có mặt tại tất cả hệ thống cơ sở Pet M&M. Mỗi phòng đều có điều hòa lọc khí ion âm, camera Full HD xem trực tiếp 24/24 trên điện thoại của ba mẹ và nhật ký sinh hoạt gửi qua Zalo mỗi ngày.'
  },
  {
    id: 'faq-4',
    category: 'Vận chuyển Pet Taxi',
    question: 'Pet M&M có hỗ trợ luân chuyển thú cưng đi nội địa / quốc tế không?',
    answer: 'Có. Dịch vụ Pet Taxi chuyên dụng của Pet M&M nhận đưa đón các bé tận nơi trong nội ô TP.HCM, chuyển tuyến liên tỉnh an toàn và hỗ trợ trọn gói thủ tục vi mạch ISO, xét nghiệm kháng thể dại, giấy chứng nhận kiểm dịch xuất cảnh quốc tế.'
  },
  {
    id: 'faq-5',
    category: 'Tư vấn & Lựa chọn dịch vụ',
    question: 'Tôi chưa biết nên chọn dịch vụ nào — Pet M&M có tư vấn không?',
    answer: 'Hoàn toàn có! Đội ngũ bác sĩ và chuyên viên tư vấn Pet M&M luôn sẵn sàng hỗ trợ trực tiếp qua Zalo OA hoặc Hotline 0903 599 339 để lắng nghe tình trạng thể trạng của bé, tư vấn giải pháp tối ưu và cung cấp bảng giá chi tiết trước khi quý khách đưa ra quyết định.'
  },
  {
    id: 'faq-6',
    category: 'Kiểm soát nhiễm khuẩn',
    question: 'Quy trình vô trùng và phòng chống lây nhiễm chéo như thế nào?',
    answer: 'Pet M&M áp dụng quy trình kiểm soát nhiễm khuẩn chuẩn quốc tế: 100% dụng cụ khám và phẫu thuật được hấp tiệt trùng Autoclave ở 134°C, khu nội trú và phòng khám được chiếu đèn cực tím UV-C khử khuẩn mỗi ngày, phân luồng tách biệt hoàn toàn giữa khu Chó - Mèo.'
  }
];
