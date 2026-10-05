# HƯỚNG DẪN & ĐẶC TẢ CÁC MẪU ZALO ZNS CỦA BỆNH VIỆN PETM&M

Tài liệu này lưu trữ chính xác nội dung, tham số và quy cách cấu hình 2 mẫu tin nhắn ZNS trên hệ thống **Zalo Business Solutions** (ZBS) để đồng bộ với mã nguồn website PetM&M.

---

## 1. MẪU 1: XÁC NHẬN ĐẶT LỊCH HẸN KHÁM BỆNH (BOOKING_CONFIRMATION)

* **Loại mẫu:** Chăm sóc khách hàng - Xác nhận giao dịch / lịch hẹn
* **Trạng thái:** Đã nộp hồ sơ kiểm duyệt trên Zalo Cloud
* **Mục đích:** Khi khách hàng đặt lịch khám trên website PetM&M, hệ thống tự động gửi tin ZNS thông báo giờ khám, địa chỉ và mã đặt lịch.

### Các tham số khai báo:
| Tên tham số (Zalo) | Định dạng kỹ thuật | Ví dụ mẫu | Nguồn dữ liệu từ website |
| :--- | :--- | :--- | :--- |
| `schedule_time` | Thời gian (20 ký tự) | `09:30 ngày 15/10/2026` | Ngày & khung giờ khám khách chọn |
| `address` | Địa chỉ (200 ký tự) | `2D, đường số 22, Phường Hiệp Bình, TP.HCM` | Địa chỉ cơ sở bệnh viện |
| `customer_name` | Tên khách hàng (30 ký tự) | `Nguyễn Văn A` | Tên chủ nuôi / khách đặt lịch |
| `booking_code` | Mã số (30 ký tự) | `PET-241005` | Mã lịch hẹn tự động do web sinh ra |

### Nút thao tác (Action Button):
* **Loại nút:** Gọi hotline phòng khám
* **Số điện thoại:** `0838 112 112`

---

## 2. MẪU 2: ĐÁNH GIÁ DỊCH VỤ / SẢN PHẨM (SERVICE_REVIEW) - MẪU 5 SAO

* **Loại mẫu:** Mẫu đánh giá dịch vụ (có hàng 5 sao tương tác cực đẹp)
* **Chi phí:** 300 VNĐ (mẫu) + 100 VNĐ (nút mở web) = 400 VNĐ/tin gửi qua SĐT
* **Mục đích:** Gửi sau khi khách khám hoặc mua đồ, khách bấm vào nút để mở trang web đánh giá kèm tải ảnh thú cưng.

### Nội dung mẫu hiển thị:
* **Tiêu đề:** `Đánh giá dịch vụ` (hoặc `Đánh giá dịch vụ thú y`)
* **Nội dung văn bản:**
  `Xin chào <customer_name>, đơn hàng/lượt khám <order_id> đã hoàn thành. Bạn có hài lòng về dịch vụ của bên <shop_name> không? Bạn vui lòng để lại đánh giá cho <shop_name> biết nhé!`
* **Hàng 5 sao tương tác** (mặc định có sẵn của Zalo)
* **Nút bấm thao tác:**
  - Tên nút: `Đánh giá kèm hình ảnh tại đây`
  - Loại nút: Mở liên kết (Open Web URL)
  - Đường dẫn Web: `https://petsmm.vercel.app/danhgiadichvu/<review_code>`

### Các tham số khai báo trên Zalo:
| Tên tham số (Zalo) | Định dạng kỹ thuật | Ví dụ mẫu | Nguồn dữ liệu từ website |
| :--- | :--- | :--- | :--- |
| `customer_name` | Tên khách hàng (30 ký tự) | `Nguyễn Văn A` | Tên khách khám |
| `order_id` | Mã số (30 ký tự) | `PET-241005` | Mã hóa đơn / hồ sơ khám |
| `shop_name` | Tên shop / doanh nghiệp | `Bệnh viện Thú y PetM&M` | Tên bệnh viện |
| `review_code` | Mã số (30 ký tự) | `PET-241005` | Mã chèn vào link web để mở đúng trang đánh giá |


---

## 3. FILE CODE QUẢN LÝ TRONG WEBSITE
* [`src/lib/zalo.ts`](file:///c:/Users/Windows%2011/Desktop/testtt/src/lib/zalo.ts): Chứa khai báo hằng số `ZALO_TEMPLATES`, cấu hình kết nối DB Supabase, hàm `sendZaloZnsBookingNotification` và hàm `sendZaloZnsReviewNotification`.
* [`src/app/api/booking/route.ts`](file:///c:/Users/Windows%2011/Desktop/testtt/src/app/api/booking/route.ts): Tự động kích hoạt Mẫu 1 khi có lịch hẹn mới.
* [`src/app/taodanhgia/page.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/app/taodanhgia/page.tsx): Có nút bấm gửi Zalo trực tiếp 1-chạm cho khách hàng kèm mã QR và liên kết đánh giá.
