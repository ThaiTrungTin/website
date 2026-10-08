export interface PrivacyPolicyConfig {
  titleVi: string;
  titleEn: string;
  contentVi: string;
  contentEn: string;
  lastUpdated: string;
  isActive: boolean;
}

export const DEFAULT_PRIVACY_POLICY: PrivacyPolicyConfig = {
  titleVi: 'Chính Sách Bảo Mật & Bảo Vệ Quyền Riêng Tư',
  titleEn: 'Privacy Policy & Data Protection',
  lastUpdated: '08/10/2026',
  isActive: true,
  contentVi: `
<h2>1. Cam Kết Chung Về Quyền Riêng Tư</h2>
<p>Hệ thống Phòng Khám & Bệnh Viện Thú Cưng <strong>PetM&M</strong> luôn tôn trọng và cam kết bảo vệ tuyệt đối quyền riêng tư cùng thông tin cá nhân của Quý khách hàng, thân chủ thú cưng và Quý ứng viên nộp hồ sơ tuyển dụng. Chính sách này tuân thủ nghiêm ngặt theo quy định của pháp luật Việt Nam (bao gồm <strong>Nghị định 13/2023/NĐ-CP</strong> về bảo vệ dữ liệu cá nhân) và các tiêu chuẩn bảo mật quốc tế.</p>

<h2>2. Các Dữ Liệu Chúng Tôi Thu Thập</h2>
<p>Chúng tôi chỉ thu thập các dữ liệu thực sự cần thiết phục vụ cho việc cung cấp dịch vụ y tế thú y và quy trình tuyển dụng nhân sự, bao gồm:</p>
<ul>
  <li><strong>Thông tin đặt lịch khám & chăm sóc thú cưng:</strong> Họ tên thân chủ, số điện thoại, tên và giống loài thú cưng, lịch sử sức khỏe, chi nhánh mong muốn và các ghi chú y khoa.</li>
  <li><strong>Thông tin ứng viên nộp hồ sơ (Tuyển dụng):</strong> Họ và tên, số điện thoại liên hệ, địa chỉ email, hồ sơ năng lực (CV đính kèm hoặc đường dẫn hồ sơ), kinh nghiệm làm việc và vị trí ứng tuyển.</li>
  <li><strong>Dữ liệu kỹ thuật & phân tích truy cập:</strong> Địa chỉ IP, loại trình duyệt, thời gian truy cập và nhật ký tương tác trên website nhằm tối ưu hóa trải nghiệm người dùng và ngăn chặn các hành vi gian lận (spam).</li>
</ul>

<h2>3. Mục Đích Sử Dụng Thông Tin</h2>
<p>Mọi thông tin thu thập được chỉ được sử dụng cho các mục đích chính đáng sau:</p>
<ul>
  <li>Liên hệ xác nhận lịch hẹn khám, nhắc lịch tiêm phòng, theo dõi sau phẫu thuật và chăm sóc sức khỏe định kỳ cho thú cưng.</li>
  <li>Tiếp nhận, thẩm định hồ sơ ứng viên và gửi thông báo lịch phỏng vấn tuyển dụng.</li>
  <li>Nâng cao chất lượng dịch vụ chuyên môn, cải thiện tiện ích đặt lịch và tính năng trên website.</li>
  <li>Bảo đảm an toàn an ninh mạng và phát hiện các nỗ lực gửi biểu mẫu trùng lặp hoặc phá hoại hệ thống.</li>
</ul>

<h2>4. Cam Kết Không Chia Sẻ Dữ Liệu Cho Bên Thứ Ba</h2>
<p>PetM&M cam kết <strong>tuyệt đối không bán, không cho thuê, không trao đổi hoặc tiết lộ thông tin cá nhân</strong> của Quý khách và Quý ứng viên cho bất kỳ đơn vị quảng cáo, môi giới dữ liệu hoặc bên thứ ba nào vì mục đích thương mại.</p>
<p>Dữ liệu chỉ được cung cấp trong các trường hợp ngoại lệ sau:</p>
<ul>
  <li>Có sự đồng ý rõ ràng trước bằng văn bản từ chính Quý khách hàng hoặc ứng viên.</li>
  <li>Cung cấp theo yêu cầu bằng văn bản của cơ quan quản lý nhà nước có thẩm quyền theo quy định của pháp luật Việt Nam.</li>
</ul>

<h2>5. Thời Gian Lưu Trữ & Biện Pháp An Toàn</h2>
<p>Dữ liệu của Quý khách được lưu trữ trên hệ thống cơ sở dữ liệu bảo mật cao cấp có mã hóa đường truyền SSL/HTTPS và phân quyền nghiêm ngặt. Thông tin sẽ được lưu giữ cho đến khi hoàn thành mục đích phục vụ hoặc cho đến khi Quý khách có yêu cầu xóa bỏ khỏi hệ thống.</p>

<h2>6. Quyền Của Khách Hàng & Ứng Viên Đối Với Dữ Liệu</h2>
<p>Theo Nghị định 13/2023/NĐ-CP, Quý khách và Quý ứng viên có toàn quyền:</p>
<ul>
  <li>Kiểm tra, yêu cầu chỉnh sửa hoặc cập nhật thông tin cá nhân của mình.</li>
  <li>Yêu cầu xóa bỏ vĩnh viễn thông tin liên hệ hoặc hồ sơ ứng tuyển khỏi cơ sở dữ liệu của PetM&M.</li>
  <li>Rút lại sự đồng ý tiếp nhận các tin nhắn chăm sóc khách hàng hoặc thông báo tuyển dụng bất kỳ lúc nào.</li>
</ul>

<h2>7. Thông Tin Đơn Vị Quản Lý Dữ Liệu & Tiếp Nhận Khiếu Nại</h2>
<p>Nếu Quý khách có bất kỳ câu hỏi, thắc mắc hoặc yêu cầu nào liên quan đến chính sách quyền riêng tư và dữ liệu cá nhân, xin vui lòng liên hệ trực tiếp với chúng tôi qua:</p>
<ul>
  <li><strong>Đơn vị chủ quản:</strong> Bệnh Viện & Phòng Khám Thú Cưng PetM&M</li>
  <li><strong>Địa chỉ trụ sở chính:</strong> 19 Đường Số 1, Phường Phước Long, TP. Thủ Đức, TP. Hồ Chí Minh</li>
  <li><strong>Hotline hỗ trợ:</strong> 0903 599 339</li>
  <li><strong>Email bảo mật & tiếp nhận:</strong> contact@petmm.vn / tuyendung@petmm.vn</li>
</ul>
`,
  contentEn: `
<h2>1. General Commitment to Privacy</h2>
<p><strong>PetM&M</strong> Veterinary Hospital & Pet Care Clinic is fully committed to safeguarding the privacy and personal data of our clients, pet guardians, and job applicants. This policy complies strictly with Vietnamese regulations (including <strong>Decree No. 13/2023/ND-CP</strong> on Personal Data Protection) as well as global data privacy standards.</p>

<h2>2. Types of Data We Collect</h2>
<p>We only collect information strictly necessary to provide superior veterinary care and administer our recruitment process, including:</p>
<ul>
  <li><strong>Appointment & Veterinary Services:</strong> Guardian's full name, phone number, pet's name/breed/medical notes, chosen clinic branch, and appointment timing.</li>
  <li><strong>Job Applicants & Recruitment:</strong> Candidate's full name, contact phone number, email address, attached resume (CV file or link), employment background, and desired position.</li>
  <li><strong>Technical & Website Analytics:</strong> IP address, device/browser specifications, access timestamps, and session interactions to optimize user experience and prevent automated spam abuse.</li>
</ul>

<h2>3. Purpose of Data Processing</h2>
<p>Collected information is exclusively utilized for the following legitimate purposes:</p>
<ul>
  <li>Confirming medical consultations, vaccination reminders, surgical follow-ups, and routine pet healthcare advisory.</li>
  <li>Processing employment submissions, evaluating candidate profiles, and conducting interview invitations.</li>
  <li>Enhancing digital service quality, booking workflows, and responsive website functionality.</li>
  <li>Maintaining security integrity, preventing denial-of-service, and suppressing duplicate form submissions.</li>
</ul>

<h2>4. Non-Disclosure & Third-Party Protection</h2>
<p>PetM&M guarantees that we <strong>do not sell, rent, trade, or distribute</strong> your personal information to any external marketing firms, data brokers, or commercial third parties.</p>
<p>Information may only be disclosed under exceptional circumstances:</p>
<ul>
  <li>With prior explicit consent provided by the client or applicant.</li>
  <li>When legally required by official written order from authorized state regulatory agencies under Vietnamese law.</li>
</ul>

<h2>5. Storage Retention & Security Measures</h2>
<p>All records are safely encrypted via industry-standard SSL/HTTPS protocols and stored in compartmentalized databases. Your information is retained only as long as necessary to fulfill healthcare/recruitment commitments or until you request its complete erasure.</p>

<h2>6. Your Data Rights</h2>
<p>In accordance with applicable personal data protection laws, clients and applicants hold the full right to:</p>
<ul>
  <li>Access, verify, or request rectification of your stored personal details.</li>
  <li>Request the complete deletion of your contact records or submitted candidate application.</li>
  <li>Withdraw consent to receive reminder notifications or recruitment updates at any time.</li>
</ul>

<h2>7. Data Controller Contact & Inquiries</h2>
<p>For any inquiries, requests, or privacy compliance matters, please reach out directly to our administration team:</p>
<ul>
  <li><strong>Entity:</strong> PetM&M Veterinary Hospital & Pet Care Clinic</li>
  <li><strong>Headquarters:</strong> 19, Street 1, Phuoc Long Ward, Thu Duc City, Ho Chi Minh City, Vietnam</li>
  <li><strong>Hotline:</strong> (+84) 903 599 339</li>
  <li><strong>Contact Email:</strong> contact@petmm.vn / tuyendung@petmm.vn</li>
</ul>
`,
};
