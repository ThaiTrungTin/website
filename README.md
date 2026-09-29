# Pet M&M — Bệnh Viện & Resort Thú Y 5 Sao

Hệ thống Website & Trang Quản Trị (Admin ERP) Bệnh Viện Đa Khoa Thú Y Chuẩn Quốc Tế Pet M&M.

## Công Nghệ Sử Dụng
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Styling**: Tailwind CSS v4 & Vanilla CSS
- **Database & Storage**: [Supabase](https://supabase.com/) (Realtime PostgreSQL)
- **Icons**: Lucide React
- **Rich Text Editor**: Custom React Quills / WYSIWYG

## Các Phân Hệ Chính
1. **Trang Chủ (`/`)**:
   - Hero Banner chuyển động nghệ thuật Ken Burns.
   - Sứ mệnh & Triết lý y khoa với khung trượt ảnh đa phương tiện.
   - 4 Thẻ số liệu tương tác (Năm thành lập, Cơ sở, Khách hàng, Đội ngũ y tế).
   - Danh mục dịch vụ chuẩn 5 sao (Y tế chuyên sâu & Chăm sóc lưu trú).
   - Hệ thống chi nhánh & bản đồ Google Maps vệ tinh tương tác.
   - Đánh giá khách hàng & Cẩm nang kiến thức thú y.
   - Hotline gọi nhanh 24/7 & Cụm liên hệ nổi đa kênh (Zalo, Messenger, TikTok, Fanpage, Gmail).

2. **Trang Đội Ngũ Y Tế (`/doi-ngu`)**:
   - 4 Hạng mục chuyên môn: Lãnh đạo chuyên môn, Chuyên gia tư vấn, Bác sĩ thú y, Điều dưỡng & Chăm sóc.
   - Lướt ngang mượt mà trên điện thoại với điều khiển mũi tên trực tiếp trên ảnh và số đếm tiến trình.
   - Tự động ẩn danh mục khi chưa có nhân sự.

3. **Trang Quản Trị Admin (`/admin`)**:
   - Quản lý Banner ảnh nền Hero.
   - Quản lý Hệ thống chi nhánh bệnh viện.
   - Quản lý Dịch vụ y tế 5 sao.
   - Quản lý Lịch hẹn khám bệnh thời gian thực.
   - Quản lý Câu hỏi thường gặp (FAQ) & Đánh giá khách hàng.
   - Quản lý Đội ngũ bác sĩ và nhân sự y tế.
   - **Cài đặt hệ thống phân nhánh độc lập**: Hotline & Mạng xã hội, Giới thiệu & Triết lý, Slide ảnh, Thông số thống kê, Khẩu hiệu & Slogan.

## Hướng Dẫn Cài Đặt & Chạy Dự Án

```bash
# 1. Cài đặt thư viện dependencies
npm install

# 2. Khởi chạy môi trường phát triển (Development)
npm run dev

# 3. Kiểm tra và biên dịch sản phẩm (Production Build)
npm run build
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000) để trải nghiệm.
