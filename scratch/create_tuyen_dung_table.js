const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const token = env.match(/SUPABASE_ACCESS_TOKEN=(.*)/)[1].trim();

const sql = `
-- Tạo bảng tuyển dụng nếu chưa có
CREATE TABLE IF NOT EXISTS public.tuyen_dung (
  id TEXT PRIMARY KEY,
  tieu_de TEXT NOT NULL,
  tieu_de_en TEXT,
  phong_ban TEXT NOT NULL DEFAULT 'Y Khoa & Điều Trị',
  phong_ban_en TEXT DEFAULT 'Medical & Clinical Care',
  dia_diem TEXT DEFAULT '19 Đ. Số 1, Phường Phước Long, TP. Thủ Đức, TP.HCM',
  dia_diem_en TEXT DEFAULT '19, Street 1, Phuoc Long Ward, Thu Duc City, HCMC',
  hinh_thuc TEXT DEFAULT 'Toàn thời gian',
  hinh_thuc_en TEXT DEFAULT 'Full-time',
  muc_luong TEXT DEFAULT 'Thỏa thuận theo năng lực',
  muc_luong_en TEXT DEFAULT 'Negotiable based on experience',
  kinh_nghiem TEXT DEFAULT '1 - 2 năm kinh nghiệm',
  kinh_nghiem_en TEXT DEFAULT '1 - 2 years experience',
  so_luong INTEGER DEFAULT 1,
  han_nop TEXT DEFAULT '30/11/2026',
  mo_ta TEXT,
  mo_ta_en TEXT,
  yeu_cau TEXT,
  yeu_cau_en TEXT,
  quyen_loi TEXT,
  quyen_loi_en TEXT,
  hinh_anh TEXT DEFAULT '/about_hospital.jpg',
  thu_tu INTEGER DEFAULT 1,
  kich_hoat BOOLEAN DEFAULT TRUE,
  ngay_tao TIMESTAMPTZ DEFAULT NOW()
);

-- Kích hoạt RLS
ALTER TABLE public.tuyen_dung ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc công khai các tin tuyển dụng đang kích hoạt
DROP POLICY IF EXISTS "Public can view active jobs" ON public.tuyen_dung;
CREATE POLICY "Public can view active jobs" ON public.tuyen_dung
  FOR SELECT USING (true);

-- Cho phép service_role và authenticated toàn quyền
DROP POLICY IF EXISTS "Admins full control tuyen_dung" ON public.tuyen_dung;
CREATE POLICY "Admins full control tuyen_dung" ON public.tuyen_dung
  FOR ALL USING (true) WITH CHECK (true);

-- Thêm dữ liệu mẫu chuẩn thực tế nếu bảng trống
INSERT INTO public.tuyen_dung (
  id, tieu_de, tieu_de_en, phong_ban, phong_ban_en, dia_diem, dia_diem_en,
  hinh_thuc, hinh_thuc_en, muc_luong, muc_luong_en, kinh_nghiem, kinh_nghiem_en,
  so_luong, han_nop, mo_ta, mo_ta_en, yeu_cau, yeu_cau_en, quyen_loi, quyen_loi_en,
  hinh_anh, thu_tu, kich_hoat
) VALUES 
(
  'bac-si-thu-y-dieu-tri',
  'Bác Sĩ Thú Y Khám Lâm Sàng & Phẫu Thuật',
  'Veterinary Clinical Care & Surgical Specialist',
  'Y Khoa & Điều Trị',
  'Medical & Clinical Care',
  'Trụ sở TP. Thủ Đức, TP. Hồ Chí Minh',
  'Thu Duc City Headquarters, Ho Chi Minh City',
  'Toàn thời gian',
  'Full-time',
  '20 – 35 Triệu / Tháng (Thỏa thuận)',
  '20 – 35 Million VND / Month (Negotiable)',
  'Tối thiểu 2 năm kinh nghiệm lâm sàng',
  'At least 2 years clinical experience',
  2,
  '30/11/2026',
  '<p>Trực tiếp thăm khám, chẩn đoán và điều trị bệnh nội trú / ngoại trú cho thú cưng (chó, mèo) theo tiêu chuẩn lâm sàng Fear-Free không gây căng thẳng.</p><p>Thực hiện các ca phẫu thuật ngoại khoa từ cơ bản đến nâng cao (triệt sản, xử lý chấn thương, phẫu thuật mô mềm, kết hợp xương).</p><p>Phân tích kết quả xét nghiệm huyết học, sinh hóa, chẩn đoán hình ảnh (X-quang kỹ thuật số, siêu âm Doppler màu) để hội chẩn và đưa ra phác đồ y khoa chính xác.</p><p>Tư vấn chế độ dinh dưỡng, tiêm phòng và chăm sóc phòng ngừa dài hạn cho chủ nuôi.</p>',
  '<p>Directly examine, diagnose, and treat inpatient and outpatient cases for pets under Fear-Free clinical standards.</p><p>Perform surgical procedures ranging from routine neutering to complex soft tissue and orthopedic surgeries.</p><p>Analyze hematology, biochemistry, digital X-rays, and Doppler ultrasound imaging for accurate diagnostic protocols.</p><p>Consult pet parents on preventive medicine, vaccinations, and tailored clinical nutrition.</p>',
  '<ul><li>Tốt nghiệp Đại học chuyên ngành Bác Sĩ Thú Y (ĐH Nông Lâm, ĐH Cần Thơ hoặc tương đương).</li><li>Có chứng chỉ hành nghề thú y hợp lệ theo quy định pháp luật.</li><li>Tối thiểu 2 năm kinh nghiệm làm việc tại các phòng khám, bệnh viện thú y uy tín.</li><li>Yêu thương động vật sâu sắc, kiên nhẫn, giao tiếp ân cần và có tinh thần trách nhiệm y đức cao.</li><li>Có khả năng đọc hiểu tài liệu chuyên môn tiếng Anh là một lợi thế lớn.</li></ul>',
  '<ul><li>Bachelor or Master of Veterinary Medicine.</li><li>Valid veterinary practice license.</li><li>Minimum 2 years of professional experience in reputable veterinary hospitals.</li><li>Deep passion for pets, patient demeanour, and strong medical ethics.</li><li>Ability to read medical English documentation is a major advantage.</li></ul>',
  '<ul><li>Mức lương cạnh tranh từ 20 – 35 triệu/tháng + thưởng doanh số ca mổ + phụ cấp chuyên môn.</li><li>Được tài trợ tham gia các khóa đào tạo y khoa liên tục và chứng chỉ Fear-Free quốc tế.</li><li>Làm việc trong môi trường phòng khám và phòng mổ áp lực dương vô trùng 100%.</li><li>Đầy đủ chế độ bảo hiểm (BHXH, BHYT, BHTN) và bảo hiểm sức khỏe VIP hàng năm.</li><li>Chế độ ưu đãi chăm sóc thú cưng riêng của nhân viên miễn phí hoặc giảm 50 - 70%.</li></ul>',
  '<ul><li>Competitive salary 20 - 35 Million VND/month + surgery bonuses + specialized allowances.</li><li>Sponsored continuous medical training and international Fear-Free certification.</li><li>State-of-the-art positive pressure sterile surgical environment.</li><li>Full statutory insurance plus premium healthcare insurance packages.</li><li>Special staff discounts for personal pet care and treatments.</li></ul>',
  '/about_consultation.jpg',
  1,
  true
),
(
  'ky-thuat-vien-spa-grooming',
  'Kỹ Thuật Viên Spa Grooming & Cắt Tỉa Tạo Kiểu 5 Sao',
  '5-Star Pet Spa Stylist & Groomer',
  'Chăm Sóc & Spa',
  'Grooming & Pet Resort',
  'Trụ sở TP. Thủ Đức, TP. Hồ Chí Minh',
  'Thu Duc City Headquarters, Ho Chi Minh City',
  'Toàn thời gian',
  'Full-time',
  '12 – 22 Triệu / Tháng (+ Thưởng dịch vụ)',
  '12 – 22 Million VND / Month (+ Commission)',
  'Từ 1 năm kinh nghiệm cắt tỉa tạo kiểu',
  '1+ years styling & grooming experience',
  3,
  '30/11/2026',
  '<p>Thực hiện các quy trình spa chăm sóc chuyên sâu: tắm thảo mộc, ngâm bồn sục ozone micro-bubble, vệ sinh tai móng, vắt tuyến hôi chuẩn kỹ thuật Fear-Free.</p><p>Cắt tỉa, cạo lông nghệ thuật, tạo kiểu thẩm mỹ theo chuẩn giống hoặc theo yêu cầu đặc thù của khách hàng (Poodle, Pomeranian, Bichon, mèo Anh lông ngắn,...).</p><p>Quan sát phát hiện sớm các dấu hiệu bất thường về da, lông, ký sinh trùng để thông báo cho bác sĩ thú y kịp thời.</p><p>Vệ sinh, khử trùng toàn bộ dụng cụ kéo, tông đơ và khu vực làm việc đảm bảo vô trùng tuyệt đối sau mỗi lượt bé.</p>',
  '<p>Perform intensive spa grooming: herbal bath, ozone micro-bubble hydrotherapy, ear and paw hygiene under Fear-Free standards.</p><p>Artistic coat clipping, scissor styling for popular dog and cat breeds according to breed standards and customer requests.</p><p>Screen early signs of dermatological conditions or parasites to consult veterinarians promptly.</p><p>Maintain and sterilize grooming scissors, clippers, and workstations strictly after each session.</p>',
  '<ul><li>Có chứng chỉ nghề Grooming hoặc tối thiểu 1 năm kinh nghiệm làm việc tại Pet Spa chuyên nghiệp.</li><li>Thành thạo kỹ năng sử dụng kéo, máy sấy và xử lý lông rối không làm đau thú cưng.</li><li>Biết cách dỗ dành, giao tiếp êm dịu giúp thú cưng nhút nhát hoặc kích động bình tĩnh lại.</li><li>Tính tình tỉ mỉ, kiên nhẫn, chịu khó và có gu thẩm mỹ tạo kiểu tốt.</li></ul>',
  '<ul><li>Certified pet grooming diploma or at least 1 year hands-on experience in high-end pet spas.</li><li>Skilled in scissoring, dematting, and handling without causing stress or pain.</li><li>Calm, patient demeanour with timid or nervous pets.</li><li>High attention to aesthetic detail and hygiene.</li></ul>',
  '<ul><li>Thu nhập hấp dẫn từ 12 – 22 triệu/tháng (Lương cứng + Hoa hồng % dịch vụ + Tip khách hàng).</li><li>Môi trường làm việc máy lạnh 100%, trang bị bồn tắm sục massage và hệ thống bàn nâng thủy lực cao cấp.</li><li>Cung cấp đầy đủ đồ bảo hộ, phụ cấp ăn trưa và chế độ thưởng các dịp Lễ, Tết.</li><li>Lộ trình thăng tiến rõ ràng lên vị trí Master Groomer hoặc Quản lý Bộ phận Spa.</li></ul>',
  '<ul><li>Attractive compensation 12 - 22 Million VND/month (Base salary + commission + tips).</li><li>100% air-conditioned workspace equipped with hydraulic tables and luxury ozone hydrotherapy tubs.</li><li>Full safety gear, lunch allowance, and holiday bonuses.</li><li>Clear promotion pathway to Master Groomer or Spa Manager.</li></ul>',
  '/pet_golden_spa.jpg',
  2,
  true
),
(
  'dieu-duong-thu-y-noi-tru',
  'Điều Dưỡng Thú Y & Chăm Sóc Hồi Sức Nội Trú',
  'Veterinary Nurse & Inpatient ICU Care',
  'Y Khoa & Điều Trị',
  'Medical & Clinical Care',
  'Trụ sở TP. Thủ Đức, TP. Hồ Chí Minh',
  'Thu Duc City Headquarters, Ho Chi Minh City',
  'Toàn thời gian (Theo ca)',
  'Full-time (Shift rotation)',
  '10 – 16 Triệu / Tháng',
  '10 – 16 Million VND / Month',
  'Ưu tiên có kinh nghiệm (Chấp nhận thực tập sinh tiềm năng)',
  'Experience preferred (Fresh graduates welcome)',
  2,
  '30/11/2026',
  '<p>Hỗ trợ bác sĩ trong quá trình khám bệnh, cố định thú cưng nhẹ nhàng theo tiêu chuẩn Fear-Free không gây hoảng loạn.</p><p>Thực hiện các y lệnh: tiêm thuốc, truyền dịch, thay băng vết thương, theo dõi dấu hiệu sinh tồn (nhiệt độ, nhịp tim, hô hấp).</p><p>Chăm sóc, cho ăn uống và theo dõi tình trạng sức khỏe của các bé thú cưng nằm viện nội trú và hậu phẫu.</p><p>Chụp ảnh, quay video cập nhật nhật ký phục hồi của các bé hàng ngày để gửi báo cáo cho chủ nuôi qua Zalo.</p>',
  '<p>Assist veterinarians during consultations, gently restrain pets under Fear-Free protocols.</p><p>Execute medical orders: injections, fluid therapy, wound dressing, vital signs monitoring.</p><p>Nurse, feed, and observe recovery progression for hospitalized and post-op pets.</p><p>Capture daily photos/videos of recovering pets to update pet parents via Zalo.</p>',
  '<ul><li>Tốt nghiệp Trung cấp, Cao đẳng hoặc Đại học chuyên ngành Chăn nuôi thú y, Thú y.</li><li>Ưu tiên ứng viên đã từng thực tập hoặc làm việc tại các phòng khám thú y.</li><li>Yêu thích động vật, không ngại việc chăm sóc và dọn dẹp vệ sinh cho các bé cưng.</li><li>Nhanh nhẹn, trung thực, tinh thần học hỏi cao và hòa đồng với đồng nghiệp.</li></ul>',
  '<ul><li>Degree or Diploma in Animal Science / Veterinary Nursing.</li><li>Internship or clinical experience is a plus.</li><li>Deep love for animals, hardworking, and attentive to hygiene details.</li><li>Honest, proactive, and collaborative team player.</li></ul>',
  '<ul><li>Lương từ 10 – 16 triệu/tháng + phụ cấp ca trực + thưởng chuyên cần.</li><li>Được trực tiếp bác sĩ trưởng khoa hướng dẫn tay nghề, đào tạo nâng cao chuyên môn y khoa.</li><li>Môi trường làm việc văn minh, trang thiết bị hiện đại hàng đầu.</li><li>Được tham gia đầy đủ bảo hiểm và các hoạt động team building, du lịch hàng năm.</li></ul>',
  '<ul><li>Salary 10 - 16 Million VND/month + shift allowances + diligence bonus.</li><li>Mentored directly by senior veterinary specialists.</li><li>Modern, supportive, and compassionate workplace culture.</li><li>Full statutory social insurance and annual company retreats.</li></ul>',
  '/about_team_entrance.jpg',
  3,
  true
)
ON CONFLICT (id) DO NOTHING;
`;

fetch('https://api.supabase.com/v1/projects/ntkpdadakcyugvivvsjw/database/query', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query: sql })
})
.then(r => r.json())
.then(res => {
  console.log('Result:', res);
})
.catch(err => {
  console.error('Error:', err);
});
