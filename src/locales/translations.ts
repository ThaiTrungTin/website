export type Language = 'vi' | 'en';

export interface TranslationDict {
  [key: string]: {
    vi: string;
    en: string;
  };
}

export const translations: TranslationDict = {
  // Navigation
  nav_about: {
    vi: 'Về Pet M&M',
    en: 'About Us',
  },
  nav_services: {
    vi: 'Dịch Vụ',
    en: 'Services',
  },
  nav_branches: {
    vi: 'Hệ Thống Cơ Sở',
    en: 'Locations',
  },
  nav_knowledge: {
    vi: 'Cẩm Nang',
    en: 'Pet Care Tips',
  },
  nav_faq: {
    vi: 'FAQ',
    en: 'FAQ',
  },
  nav_reviews: {
    vi: 'Đánh Giá',
    en: 'Reviews',
  },
  nav_contact: {
    vi: 'Liên Hệ',
    en: 'Contact',
  },

  // Slogan & Hero
  hero_slogan_title: {
    vi: 'Nâng niu từng nhịp thở, an yên trọn một đời.',
    en: 'Cherishing Every Breath, Embracing Life with Peace.',
  },
  hero_slogan_desc: {
    vi: 'Không gian y khoa chuẩn mực hòa cùng liệu pháp phục hồi thiên nhiên. Nơi tình thương thuần khiết hòa quyện cùng công nghệ điều trị tiên tiến nhất thế giới, cho bé cưng hồi phục thể chất và an yên tâm trí.',
    en: 'Standardized veterinary medicine combined with natural recovery therapies. Where pure love blends with state-of-the-art medical technology to restore physical vitality and soothe peace of mind.',
  },

  // Actions & Buttons
  btn_book_appointment: {
    vi: 'Đặt Lịch',
    en: 'Book Appointment',
  },
  btn_book_short: {
    vi: 'Đặt Lịch',
    en: 'Book Now',
  },
  btn_emergency_call: {
    vi: 'Cấp Cứu 24/7',
    en: '24/7 Emergency',
  },
  btn_view_services: {
    vi: 'Xem Dịch Vụ',
    en: 'Explore Services',
  },
  btn_view_details: {
    vi: 'Xem Chi Tiết',
    en: 'View Details',
  },
  btn_view_all: {
    vi: 'Xem Tất Cả',
    en: 'View All',
  },
  btn_close: {
    vi: 'Đóng',
    en: 'Close',
  },
  btn_submit_booking: {
    vi: 'Xác Nhận Đặt Lịch Hẹn',
    en: 'Confirm Appointment',
  },
  btn_submitting: {
    vi: 'Đang Gửi Lịch Hẹn...',
    en: 'Submitting...',
  },

  // Header & Badges
  badge_international_standard: {
    vi: 'Chuẩn Y Khoa Quốc Tế',
    en: 'International Veterinary Standards',
  },
  badge_fear_free: {
    vi: 'Phòng Khám Fear-Free Không Căng Thẳng',
    en: 'Fear-Free Certified Clinic',
  },
  hotline_label: {
    vi: 'Hotline Cấp Cứu 24/7:',
    en: '24/7 Emergency Hotline:',
  },
  open_hours_label: {
    vi: 'Giờ mở cửa:',
    en: 'Opening Hours:',
  },
  all_week: {
    vi: '8:00 - 21:00 (Tất cả các ngày)',
    en: '8:00 AM - 9:00 PM (Daily)',
  },

  // Hero Section
  hero_title_1: {
    vi: 'Bệnh Viện Thú Y & Resort',
    en: 'Veterinary Hospital & Resort',
  },
  hero_title_2: {
    vi: 'Chăm Sóc Thú Cưng',
    en: 'Premium Pet Healthcare',
  },
  hero_title_highlight: {
    vi: 'Đẳng Cấp Quốc Tế',
    en: 'International Excellence',
  },
  hero_subtitle: {
    vi: 'Hệ thống y tế thú y kỹ thuật cao, phòng mổ vô trùng áp lực dương và khách sạn thú cưng tiêu chuẩn nghỉ dưỡng hàng đầu tại TP. Hồ Chí Minh.',
    en: 'State-of-the-art veterinary care, sterile positive-pressure surgical suites, and premier luxury pet boarding resort in Ho Chi Minh City.',
  },
  hero_stat_patients: {
    vi: 'Thú Cưng Được Chăm Sóc',
    en: 'Pets Treated',
  },
  hero_stat_doctors: {
    vi: 'Bác Sĩ & Chuyên Gia Thú Y',
    en: 'Veterinarians & Specialists',
  },
  hero_stat_satisfaction: {
    vi: 'Ba Mẹ Thú Cưng Hài Lòng',
    en: 'Satisfied Pet Parents',
  },
  hero_stat_emergency: {
    vi: 'Cấp Cứu & Trực Đêm 24/7',
    en: '24/7 Emergency Care',
  },

  // About Section
  about_tag: {
    vi: 'VỀ HỆ THỐNG PET M&M',
    en: 'ABOUT PET M&M',
  },
  about_heading: {
    vi: 'Y Đức Hàng Đầu — Nâng Niu Từng Nhịp Thở Thú Cưng',
    en: 'Medical Integrity — Cherishing Every Breath of Your Pet',
  },
  about_desc_1: {
    vi: 'Pet M&M được xây dựng với sứ mệnh trở thành điểm tựa y tế và nghỉ dưỡng đáng tin cậy nhất cho thú cưng và gia đình bạn tại TP.HCM.',
    en: 'Pet M&M was founded with the mission of providing the most trusted medical and resort haven for pets and their families in Ho Chi Minh City.',
  },
  about_desc_2: {
    vi: 'Tiên phong ứng dụng tiêu chuẩn Fear-Free giúp giảm tối đa sự sợ hãi, lo âu cho các bé chó mèo khi đến khám chữa bệnh.',
    en: 'Pioneering Fear-Free practices to minimize anxiety and stress for dogs and cats during clinical visits and boarding.',
  },
  about_feature_1_title: {
    vi: 'Hệ Thống Thiết Bị Chẩn Đoán Hiện Đại',
    en: 'Advanced Diagnostic Equipment',
  },
  about_feature_1_desc: {
    vi: 'Máy chụp X-Quang kỹ thuật số, siêu âm Doppler màu và hệ thống xét nghiệm huyết học sinh hóa tự động cho kết quả trong 15 phút.',
    en: 'Digital X-Ray, Color Doppler Ultrasound, and automated biochemistry analyzers providing precise results within 15 minutes.',
  },
  about_feature_2_title: {
    vi: 'Đội Ngũ Bác Sĩ Chuyên Môn Cao',
    en: 'Expert Veterinary Specialists',
  },
  about_feature_2_desc: {
    vi: 'Các bác sĩ giàu kinh nghiệm, tu nghiệp chuyên sâu về phẫu thuật ngoại khoa, nội khoa và nhãn khoa thú nhỏ.',
    en: 'Highly trained veterinarians specializing in small animal surgery, internal medicine, and ophthalmology.',
  },
  about_feature_3_title: {
    vi: 'Resort & Khách Sạn Thú Cưng Tiện Nghi',
    en: 'Luxury Pet Hotel & Resort',
  },
  about_feature_3_desc: {
    vi: 'Phòng Suite riêng biệt có điều hòa lọc khí ion âm, camera Full HD xem trực tiếp 24/24 và quy trình chăm sóc cá thể hóa.',
    en: 'Private climate-controlled suites with negative ion air filtration, 24/7 live camera access, and individualized care.',
  },

  // Services Section
  services_tag: {
    vi: 'DỊCH VỤ Y TẾ & CHĂM SÓC',
    en: 'MEDICAL & CARE SERVICES',
  },
  services_heading: {
    vi: 'Dịch Vụ Chăm Sóc Toàn Diện Cho Thú Cưng',
    en: 'Comprehensive Pet Care & Veterinary Solutions',
  },
  services_subtitle: {
    vi: 'Từ khám sức khỏe định kỳ, phẫu thuật ngoại khoa đến spa làm đẹp và khách sạn nghỉ dưỡng cao cấp.',
    en: 'From wellness exams and complex surgeries to luxury grooming and resort boarding suites.',
  },
  services_tab_all: {
    vi: 'Tất Cả Dịch Vụ',
    en: 'All Services',
  },
  services_tab_medical: {
    vi: 'Y Tế & Điều Trị',
    en: 'Veterinary Medicine',
  },
  services_tab_care: {
    vi: 'Spa & Khách Sạn',
    en: 'Spa & Pet Hotel',
  },
  services_price_from: {
    vi: 'Giá từ:',
    en: 'From:',
  },
  services_featured_badge: {
    vi: 'Nổi Bật',
    en: 'Featured',
  },
  services_book_btn: {
    vi: 'Đặt Dịch Vụ Này',
    en: 'Book This Service',
  },

  // Branches / Locations Section
  branches_tag: {
    vi: 'HỆ THỐNG CƠ SỞ',
    en: 'OUR BRANCH NETWORK',
  },
  branches_heading: {
    vi: 'Hệ Thống Chi Nhánh Pet M&M Tại TP.HCM',
    en: 'Pet M&M Clinics & Hospital Locations',
  },
  branches_subtitle: {
    vi: 'Mạng lưới bệnh viện và phòng khám hiện đại phủ sóng khắp TP. Thủ Đức và các quận trung tâm.',
    en: 'Modern veterinary hospitals conveniently located across Thu Duc City and central Ho Chi Minh City.',
  },
  branches_btn_directions: {
    vi: 'Chỉ Đường Google Maps',
    en: 'Google Maps Directions',
  },
  branches_btn_call: {
    vi: 'Gọi Chi Nhánh',
    en: 'Call Branch',
  },
  branches_parking: {
    vi: 'Bãi đỗ xe ô tô & xe máy rộng rãi, bảo vệ 24/24',
    en: 'Spacious car & motorcycle parking with 24/7 security',
  },

  // Knowledge / Blog Section
  knowledge_tag: {
    vi: 'CẨM NANG BÁC SĨ',
    en: 'VETERINARY KNOWLEDGE',
  },
  knowledge_heading: {
    vi: 'Kiến Thức Nuôi Dưỡng & Chăm Sóc Thú Cưng',
    en: 'Pet Health, Nutrition & Wellness Guide',
  },
  knowledge_subtitle: {
    vi: 'Chia sẻ kiến thức chuyên môn từ đội ngũ Bác sĩ Thú y Pet M&M giúp ba mẹ chăm sóc các bé tốt nhất.',
    en: 'Expert medical guidance and practical care tips curated by Pet M&M veterinary specialists.',
  },
  knowledge_read_more: {
    vi: 'Đọc Bài Viết',
    en: 'Read Article',
  },
  knowledge_min_read: {
    vi: 'phút đọc',
    en: 'min read',
  },

  // FAQ Section
  faq_tag: {
    vi: 'GIẢI ĐÁP THẮC MẮC',
    en: 'FREQUENTLY ASKED QUESTIONS',
  },
  faq_heading: {
    vi: 'Những Câu Hỏi Ba Mẹ Thường Quan Tâm',
    en: 'Common Questions from Pet Parents',
  },
  faq_subtitle: {
    vi: 'Tổng hợp các câu hỏi phổ biến về dịch vụ khám chữa bệnh, đặt lịch và chăm sóc lưu trú.',
    en: 'Answers to the most frequently asked questions regarding consultations, vaccinations, and boarding.',
  },

  // Reviews Section
  reviews_tag: {
    vi: 'TRẢI NGHIỆM KHÁCH HÀNG',
    en: 'CLIENT TESTIMONIALS',
  },
  reviews_heading: {
    vi: 'Tình Cảm & Sự Tin Tưởng Của Ba Mẹ Thú Cưng',
    en: 'Love & Trust from Our Pet Parents',
  },
  reviews_subtitle: {
    vi: 'Hàng ngàn lời nhận xét chân thực từ các ba mẹ đã gửi gắm thú cưng tại Pet M&M.',
    en: 'Thousands of heartfelt reviews from families who trust Pet M&M with their furry companions.',
  },
  reviews_verified: {
    vi: 'Đã xác thực dịch vụ',
    en: 'Verified Visit',
  },

  // Booking Form & Modal
  booking_modal_title: {
    vi: 'Đặt Lịch Hẹn Thăm Khám & Spa',
    en: 'Book a Consultation or Spa Session',
  },
  booking_modal_desc: {
    vi: 'Điền thông tin bên dưới để được ưu tiên thăm khám và nhận thông báo xác nhận lịch hẹn tức thì.',
    en: 'Fill in your details below for priority check-in and immediate confirmation.',
  },
  form_owner_name: {
    vi: 'Họ và tên chủ thú cưng *',
    en: 'Pet Parent Full Name *',
  },
  form_phone: {
    vi: 'Số điện thoại liên hệ *',
    en: 'Phone Number *',
  },
  form_pet_type: {
    vi: 'Loại thú cưng *',
    en: 'Pet Type *',
  },
  form_pet_type_dog: {
    vi: 'Chó cưng',
    en: 'Dog',
  },
  form_pet_type_cat: {
    vi: 'Mèo cưng',
    en: 'Cat',
  },
  form_pet_type_other: {
    vi: 'Thú cưng khác',
    en: 'Other',
  },
  form_pet_name: {
    vi: 'Tên thú cưng (nếu có)',
    en: 'Pet Name (optional)',
  },
  form_service: {
    vi: 'Dịch vụ cần đặt *',
    en: 'Service Required *',
  },
  form_service_select: {
    vi: '-- Chọn dịch vụ --',
    en: '-- Select Service --',
  },
  form_branch: {
    vi: 'Chọn chi nhánh thuận tiện *',
    en: 'Select Preferred Branch *',
  },
  form_branch_select: {
    vi: '-- Chọn cơ sở --',
    en: '-- Select Branch --',
  },
  form_date: {
    vi: 'Ngày mong muốn *',
    en: 'Preferred Date *',
  },
  form_time: {
    vi: 'Khung giờ mong muốn *',
    en: 'Preferred Time Slot *',
  },
  form_notes: {
    vi: 'Ghi chú tình trạng của bé (nếu có)',
    en: 'Pet Symptoms or Special Notes',
  },
  form_success_title: {
    vi: 'Đặt Lịch Thành Công!',
    en: 'Appointment Successfully Booked!',
  },
  form_success_desc: {
    vi: 'Cảm ơn bạn đã tin tưởng Pet M&M. Đội ngũ y tế sẽ liên hệ xác nhận lịch hẹn trong ít phút.',
    en: 'Thank you for choosing Pet M&M. Our care team will contact you shortly to confirm your booking.',
  },

  // Footer
  footer_about_title: {
    vi: 'Hệ Thống Bệnh Viện Thú Y Pet M&M',
    en: 'Pet M&M Veterinary Hospital Network',
  },
  footer_quick_links: {
    vi: 'Liên Kết Nhanh',
    en: 'Quick Links',
  },
  footer_services_title: {
    vi: 'Dịch Vụ Y Tế',
    en: 'Medical Services',
  },
  footer_contact_title: {
    vi: 'Hệ Thống Cơ Sở & Trực Cấp Cứu',
    en: 'Branches & Emergency Care',
  },
  footer_emergency_banner: {
    vi: 'TRỰC CẤP CỨU & NỘI TRÚ 24/7 TẠI TẤT CẢ CÁC CHI NHÁNH',
    en: '24/7 EMERGENCY & INPATIENT CARE AT ALL LOCATIONS',
  },
  footer_copyright: {
    vi: 'Bản quyền thuộc về Hệ Thống Bệnh Viện Thú Y Pet M&M.',
    en: 'All rights reserved. Pet M&M Veterinary Hospital Network.',
  },
  footer_license: {
    vi: 'Giấy phép hoạt động khám chữa bệnh thú y do Chi cục Chăn nuôi & Thú y cấp.',
    en: 'Veterinary medical operating license issued by the Department of Animal Health.',
  },

  // Language Switcher
  lang_vietnamese: {
    vi: 'Tiếng Việt',
    en: 'Vietnamese',
  },
  lang_english: {
    vi: 'Tiếng Anh',
    en: 'English',
  },

  // Header Social Buttons
  footer_chat_zalo: {
    vi: 'Chat Zalo Bác Sĩ',
    en: 'Chat with Vet',
  },
  footer_chat_messenger: {
    vi: 'Nhắn Messenger',
    en: 'Messenger',
  },

  // Booking Section
  booking_tag: {
    vi: 'ĐẶT LỊCH TRỰC TUYẾN',
    en: 'BOOK ONLINE',
  },
  booking_heading: {
    vi: 'Đặt Lịch Hẹn Thăm Khám',
    en: 'Schedule Your Appointment',
  },
  booking_subtitle: {
    vi: 'Điền thông tin để đặt lịch nhanh và nhận xác nhận tức thì từ đội ngũ y tế.',
    en: 'Fill in your details for instant booking confirmation from our medical team.',
  },
  booking_section_info: {
    vi: 'Thông Tin Liên Hệ',
    en: 'Contact Information',
  },
  booking_section_pet: {
    vi: 'Thông Tin Thú Cưng',
    en: 'Pet Information',
  },
  booking_section_service: {
    vi: 'Chọn Dịch Vụ & Cơ Sở',
    en: 'Select Service & Branch',
  },
  booking_section_time: {
    vi: 'Thời Gian Mong Muốn',
    en: 'Preferred Schedule',
  },

  // StatsSection
  stats_clients: {
    vi: 'Khách hàng hài lòng',
    en: 'Happy Clients',
  },
  stats_clients_desc: {
    vi: 'Chó mèo được phục hồi sức khỏe & chăm sóc sắc đẹp trọn vẹn',
    en: 'Pets restored to health & groomed to perfection',
  },
  stats_doctors: {
    vi: 'Bác sĩ chuyên khoa',
    en: 'Specialist Veterinarians',
  },
  stats_doctors_desc: {
    vi: 'Tốt nghiệp ĐH Nông Lâm, chứng chỉ hành nghề & tu nghiệp quốc tế',
    en: 'University graduates with international training certifications',
  },
  stats_branches: {
    vi: 'Cơ sở chuẩn 5 sao',
    en: '5-Star Facilities',
  },
  stats_branches_desc: {
    vi: 'Tọa lạc tại Quận 1, Quận 7 và Biệt thự sinh thái Thảo Điền',
    en: 'Located in District 1, District 7, and Thao Dien eco-villa',
  },
  stats_hotline: {
    vi: 'Hotline & Lưu trú',
    en: 'Hotline & Boarding',
  },
  stats_hotline_desc: {
    vi: 'Hotline 24/7, đội ngũ trực đêm 365 ngày sẵn sàng tiếp nhận',
    en: '24/7 Hotline, night team on duty 365 days ready to assist',
  },

  // Team Page (Đội ngũ y tế - view con nhân sự)
  team_hero_badge: {
    vi: 'HỘI ĐỒNG Y KHOA CHUYÊN MÔN CAO',
    en: 'HIGH-LEVEL MEDICAL ADVISORY BOARD',
  },
  team_hero_title: {
    vi: 'Đội Ngũ Bác Sĩ & Y Tế Pet M&M',
    en: 'Pet M&M Medical & Veterinary Team',
  },
  team_hero_desc_prefix: {
    vi: 'Quy tụ hơn',
    en: 'Bringing together over',
  },
  team_hero_desc_suffix: {
    vi: '+ chuyên gia, bác sĩ thú y và điều dưỡng tốt nghiệp chính quy, luôn bảo vệ sinh mệnh các bé cưng bằng trái tim và y đức cao nhất.',
    en: '+ certified specialists, veterinarians, and nurses dedicated to protecting pet lives with utmost devotion and medical ethics.',
  },
  team_breadcrumb_home: {
    vi: 'Trang chủ',
    en: 'Home',
  },
  team_breadcrumb_about: {
    vi: 'Về Pet M&M',
    en: 'About Pet M&M',
  },
  team_breadcrumb_team: {
    vi: 'Đội ngũ y tế',
    en: 'Medical Team',
  },
  team_category_lanh_dao: {
    vi: 'Đội ngũ Lãnh đạo chuyên môn',
    en: 'Executive Medical Leadership',
  },
  team_category_lanh_dao_short: {
    vi: 'Lãnh đạo chuyên môn',
    en: 'Medical Leadership',
  },
  team_category_chuyen_gia: {
    vi: 'Đội ngũ Chuyên gia Tư vấn',
    en: 'Advisory Specialists Board',
  },
  team_category_chuyen_gia_short: {
    vi: 'Chuyên gia tư vấn',
    en: 'Advisory Specialists',
  },
  team_category_bac_si: {
    vi: 'Đội ngũ Bác sĩ Thú y',
    en: 'Veterinary Doctors Team',
  },
  team_category_bac_si_short: {
    vi: 'Bác sĩ thú y',
    en: 'Veterinary Doctors',
  },
  team_category_dieu_duong: {
    vi: 'Đội ngũ Điều dưỡng & Chăm sóc',
    en: 'Nursing & Care Team',
  },
  team_category_dieu_duong_short: {
    vi: 'Điều dưỡng & Chăm sóc',
    en: 'Nursing & Care',
  },
  team_prev_doctor: {
    vi: 'Xem bác sĩ trước',
    en: 'Previous doctor',
  },
  team_next_doctor: {
    vi: 'Xem tiếp bác sĩ sau',
    en: 'Next doctor',
  },
  team_goto_doctor: {
    vi: 'Chuyển đến bác sĩ',
    en: 'Go to doctor',
  },

  // Consultation Sidebar
  consult_board_default: {
    vi: 'Hội Đồng Y Khoa Pet M&M',
    en: 'Pet M&M Medical Board',
  },
  consult_title_free: {
    vi: 'Nhận tư vấn miễn phí',
    en: 'Get Free Consultation',
  },
  consult_title_free_part1: {
    vi: 'Nhận tư vấn',
    en: 'Get',
  },
  consult_title_free_part2: {
    vi: 'miễn phí',
    en: 'free consultation',
  },
  consult_desc: {
    vi: 'Điền thông tin để đội ngũ Pet M&M liên hệ tư vấn cho bạn',
    en: 'Leave your details and the Pet M&M team will contact you shortly',
  },
  consult_fullname: {
    vi: 'Họ và tên',
    en: 'Full name',
  },
  consult_fullname_placeholder: {
    vi: 'Nhập họ và tên',
    en: 'Enter your full name',
  },
  consult_phone: {
    vi: 'Số điện thoại',
    en: 'Phone number',
  },
  consult_phone_placeholder: {
    vi: 'Nhập số điện thoại',
    en: 'Enter phone number',
  },
  consult_submit: {
    vi: 'Gửi yêu cầu tư vấn',
    en: 'Request Consultation',
  },
  consult_sending: {
    vi: 'Đang gửi...',
    en: 'Sending...',
  },
  consult_or_call: {
    vi: 'Hoặc gọi hotline:',
    en: 'Or call hotline:',
  },
  consult_success_title: {
    vi: 'Đã gửi thành công!',
    en: 'Submitted Successfully!',
  },
  consult_success_desc: {
    vi: 'Tin nhắn Zalo đã được mở. Đội ngũ Pet M&M sẽ liên hệ lại với bạn sớm nhất.',
    en: 'Zalo message has been opened. Pet M&M team will contact you as soon as possible.',
  },
  consult_retry: {
    vi: 'Gửi lại',
    en: 'Submit another request',
  },
};
