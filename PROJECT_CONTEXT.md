# PET M&M — SỔ TAY NGỮ CẢNH DỰ ÁN (PROJECT CONTEXT)

> 🆔 **MÃ CUỘC TRÒ CHUYỆN (CONVERSATION ID)**:
> - **Phiên hiện tại (Latest)**: `32d76e44-7eef-4ed7-8eb1-25e266118dec`
> - **Phiên khởi tạo (Origin)**: `dcd00ee0-4028-4c4b-8357-a1ca0d04d25d`
> 
> *Dành cho AI Agent*: Đọc file này khi bắt đầu một phiên làm việc mới để nắm toàn bộ bối cảnh, thẩm mỹ, các linh kiện đã hoàn thành và kế hoạch phát triển backend tiếp theo mà không cần người dùng phải giải thích lại.

---

## 1. THÔNG TIN THƯƠNG HIỆU & ĐỊNH VỊ
- **Tên thương hiệu**: **Pet M&M**
- **Định vị**: Hệ thống Y tế Thú y & Resort Nghỉ dưỡng Thú cưng Tiêu chuẩn 5 Sao (TP.HCM).
- **Trụ sở chính (Google Maps)**:
  - Địa chỉ: **19 Đường Số 1, Phường Phước Long B, TP. Thủ Đức, TP. Hồ Chí Minh**
  - Hotline Cấp Cứu 24/7 & Zalo: **0903 599 339**
  - Giờ làm việc: **08:00 - 21:00 (Cấp cứu 24/24)**
- **Bảng màu chủ đạo**:
  - **Màu chính**: Xanh lá cây đậm y tế / rừng sâu (`#2D5A27` - Forest Green) - biểu trưng cho thiên nhiên, y khoa chuẩn mực và an tâm.
  - **Màu điểm nhấn (Accent/CTA)**: Vàng hổ phách (`#FFB800` - Amber Gold) - dành cho nút bấm, ánh sáng đom đóm, icon nổi bật.
  - **Màu nền**: Trắng tinh (`#FFFFFF`), kem xám nhạt (`#F8F9FA`), kết hợp dark vignette nền đêm điện ảnh.
  - **Typography**: Phông chữ có chân nghệ thuật cao cấp `Playfair Display` (`font-editorial`) kết hợp cùng hệ sans-serif hiện đại.

---

## 2. NGUYÊN TẮC THẨM MỸ CỐT LÕI (CRITICAL RULES)
1. **Phong cách nghệ thuật Điện ảnh Siêu Thực (Photorealistic & Cinematic)**:
   - **Tuyệt đối KHÔNG dùng hình ảnh 3D hoạt hình / chibi / cartoon / phèn**.
   - Hình ảnh phải mang vẻ đẹp siêu thực, giống như phim điện ảnh nghệ thuật (người thật, thú cưng lông mượt như thật, ánh sáng sương mù suối khoáng tự nhiên).
2. **Quy tắc trải nghiệm người dùng**:
   - Khung cảnh cún Golden & mèo Anh lông ngắn bên bờ suối nước nóng phải **thông thoáng, sạch sẽ 100%, không bị đè bất kỳ nút chấm đen/nhãn hotspot nào**.
   - **Tuyệt đối không tự ý mở trình duyệt `http://localhost:3000/`** khi chưa có yêu cầu (tuân thủ chỉ dẫn của người dùng).
3. **Quy tắc Ô nhập liệu Trang Quản Trị (Admin Inputs - BẮT BUỘC & VĨNH VIỄN)**:
   - **Tuyệt đối KHÔNG ĐƯỢC thêm bất kỳ chú thích (placeholder) bên trong các ô nhập liệu (`<input>`, `<textarea>`)** hay các dòng chữ gợi ý thừa thãi bên dưới. Giữ các ô nhập liệu hoàn toàn sạch sẽ, chỉ có nhãn tiêu đề (label).
   - Từ nay về sau, bất kỳ form nhập liệu nào trong Admin đều không được phép để thuộc tính `placeholder="..."`.
4. **Quy tắc Hiển thị Dữ liệu Ngoài Website (Conditional Rendering - BẮT BUỘC)**:
   - **Nếu bất kỳ hạng mục nào không có trong Database (hoặc để trống), ngoài Website TUYỆT ĐỐI KHÔNG ĐƯỢC xuất hiện hạng mục đó, bao gồm cả TIÊU ĐỀ / NHÃN của nó** (Ví dụ: "Thông tin bãi đỗ xe & hỗ trợ:" nếu để trống thì toàn bộ tiêu đề lẫn nội dung bãi đỗ xe biến mất hoàn toàn).
   - Không được phép dùng hardcoded fallback text để tự động điền các trường rỗng khi render ra giao diện.
5. **Quy tắc Nhập & Dán Hình Ảnh Trong Admin (Image Upload & Paste - BẮT BUỘC & VĨNH VIỄN)**:
   - **Tất cả các khu vực chèn ảnh trong Admin (Ảnh Hero Banners, Ảnh bìa Chi Nhánh, Ảnh Dịch Vụ, Bài viết chi tiết...) đều BẮT BUỘC phải có cả 2 chức năng song song: CHÈN (Tải file từ máy / nhập URL) VÀ DÁN TRỰC TIẾP (Ctrl+V từ clipboard / ảnh chụp màn hình / ảnh copy từ web)**.
   - Khi người dùng nhấn `Ctrl+V` vào ô đường dẫn ảnh hoặc khung ảnh, hoặc bấm nút `Dán Ảnh`, hệ thống phải tự động nhận diện dữ liệu hình ảnh trong Clipboard, upload ngay lên Supabase Storage và điền link hoàn tất mà không bắt người dùng phải lưu file về máy rồi tải lên thủ công.
   - Tuyệt đối tuân thủ Quy tắc 3: KHÔNG dùng `placeholder` trong các ô nhập URL ảnh.

---

## 3. TÌNH TRẠNG HIỆN TẠI CỦA CÁC THÀNH PHẦN (FRONTEND COMPLETED)

### A. Hero Section & Đàn Đom Đóm Tự Nhiên
- **File**: [`src/components/HeroSection.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/HeroSection.tsx) & [`src/components/InteractiveWaterShader.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/InteractiveWaterShader.tsx)
- **Ảnh nền động đa khoảnh khắc & Tự động chuyển cảnh (Cinematic Dual-Layer Dissolve)**:
  - Toàn bộ nền Hero Section là một **slider ảnh nền toàn màn hình** gồm 8 cảnh điện ảnh siêu thực về chó & mèo.
  - **Tự động chuyển ảnh mặc định sau mỗi 4 giây (4000ms)**.
  - **Chuyển cảnh siêu mượt (Dual-layer Cross-Dissolve)**: Sử dụng kỹ thuật hòa tan 2 lớp chồng lên nhau (`1600ms ease-in-out`), ảnh mới tan chảy mượt mà lên trên ảnh cũ, triệt tiêu hoàn toàn hiện tượng nhấp nháy nền đen, đem lại cảm giác điện ảnh êm ru 100%.
  - **Thiết kế tối giản, sạch sẽ tuyệt đối (Clean Minimalist)**: Đã lược bỏ hoàn toàn các thanh chú thích, nhãn hướng dẫn, nút bấm rườm rà ở đáy màn hình theo yêu cầu, trả lại không gian thoáng đãng cho hình ảnh và đàn đom đóm.
  - Hỗ trợ **lướt tay sang trái / kéo chuột sang trái** để đổi ảnh nền kế tiếp bất cứ lúc nào.
- **Hiệu ứng đom đóm (Zero-Delay SSR)**:
  - 35 chú đom đóm CSS được nạp ngay vào DOM HTML ban đầu với `animationDelay` âm, **xuất hiện tức thì 0.000 giây khi mở trang web / F5**, không có độ trễ.
  - **Hướng bay**: 100% bay thẳng đứng từ dưới lên trên theo làn hơi sương ấm, tốc độ cực kỳ chậm rãi, thư thái.
- **Tương tác khi Click / Touch**:
  - Khi người dùng click chuột hoặc chạm tay vào bất kỳ đâu trên nền ảnh: Sinh ra **3 – 5 chú đom đóm thanh nhã**, tản đều tự nhiên quanh con trỏ chuột, bay bổng lên trời cao suốt **18 giây** rồi mới mờ dần.
  - Tuyệt đối không bị vón cục lóa sáng, không có vòng đồ họa giả tạo trên mặt nước.

### B. Các Phân Đoạn Giao Diện Khác
- **Services Section** ([`ServicesSection.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/ServicesSection.tsx)): Ảnh nền phòng khám 8K (`/services_bg.jpg`), 2 tab chuyển đổi (Y Khoa & Chăm Sóc), thẻ kính mờ cao cấp.
- **Branches / Locations** ([`LocationsSection.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/LocationsSection.tsx)): Ảnh hoàng hôn resort biệt thự (`/branches_bg.jpg`), 3 chi nhánh (Q.1, Q.7, Thảo Điền), bản đồ Google Maps tương tác.
- **About, Knowledge, FAQ, Footer**: Đồng bộ phong cách dark luxury frosted glass, thông tin chuẩn WSAVA & Fear-Free, hotline cấp cứu 24/7.
- **Header & 8K Animated Logo & Navbar** ([`Header.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/Header.tsx) & [`PetLogo.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/PetLogo.tsx)):
  - **Thanh Header 8K Đa Sắc & Chuyển Động (Emerald & Gold Living Glass)**: Nền kính ngọc lục bảo rừng sâu đa tầng (`#081806` -> `#112B0E`), viền đáy mạ vàng hổ phách tích hợp **tia sáng vàng kim chạy lướt liên tục (Animated Border Laser Beam)**, đốm sáng lấp lánh li ti bay lượn bên trong thanh kính.
  - **Nút bấm Hotline**: Hiển thị *"Hotline: 0903 599 339"* với icon điện thoại rung lắc liên tục (`animate-phone-ring`) kèm chấm sóng nhịp tim cấp cứu; nút *"Đặt Lịch Khám"* mạ vàng hoàng gia có luồng sáng bóng loáng (specular gleam sweep) trôi qua nút liên tục.
  - **Logo 8K Animated**: Phông chữ có chân cao cấp (Editorial Haute-Couture Serif), hiệu ứng luồng sáng vàng lỏng chảy ánh kim liên tục (`animate-gold-shimmer`), kết hợp hiệu ứng kim cương trắng phát sáng (`animate-diamond-shimmer`). Đã lược bỏ dòng chữ phụ *"Resort & Hospital 5★"* để logo gọn gàng, tinh tế tối đa.
  - **Huy hiệu hoàng gia (Jewel Medallion)**: Chữ thập y khoa đa tầng mạ vàng, đính kim cương phát quang, viền hào quang xoay chậm 360 độ và vầng sáng thở (aura pulse).
- **Floating Contact Widgets** ([`FloatingContactWidgets.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/FloatingContactWidgets.tsx)): Icon nổi Hotline 24/7 (nút đỏ đập nhịp), Zalo (xanh dương), Messenger luôn hiện góc phải dưới.
- **Mobile Sticky Bar** ([`MobileStickyBar.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/MobileStickyBar.tsx)): Thanh gọi khẩn cấp & đặt lịch nhanh dính đáy trên mobile.
- **Booking Modal & Pass Ticket** ([`BookingModal.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/BookingModal.tsx)): Modal đặt lịch 4 bước, xuất thẻ lên tàu / vé khám điện tử mã `PMM-XXXXXX`.

---

## 4. KẾ HOẠCH PHÁT TRIỂN TIẾP THEO: BACKEND & ADMIN PORTAL

### Mục tiêu tiếp theo:
Tích hợp cơ sở dữ liệu đám mây **Supabase (PostgreSQL)** và xây dựng trang quản trị **Admin Dashboard** (`/admin`).

### Chi tiết kiến trúc:
1. **Cơ sở dữ liệu Supabase**:
   - Bảng `bookings`: Lưu mã vé (`booking_code`), họ tên chủ, số điện thoại, tên thú cưng, loài, dịch vụ, ngày hẹn, giờ hẹn, chi nhánh, ghi chú, trạng thái (`pending`, `confirmed`, `completed`, `cancelled`).
   - Bảng `services`: Quản lý danh mục dịch vụ, thời lượng, giá niêm yết, trạng thái hoạt động.
   - Bảng `knowledge_posts`: Quản lý các bài viết cẩm nang y khoa thú cưng.
2. **Kiến trúc bảo mật an toàn 100%**:
   - Bật **Row Level Security (RLS)** trên Supabase.
   - Form trên web chỉ gọi qua Server API trung gian (`src/app/api/bookings/route.ts`), không bao giờ để lộ Database Key hay Service Role Key ra trình duyệt.
   - Bật Rate Limit và chống spam bot.
3. **Trang Quản Trị `/admin`**:
   - Trang đăng nhập `/admin/login` bảo mật.
   - Giao diện lễ tân / bác sĩ:
     - Danh sách lịch hẹn thời gian thực.
     - Nút gọi nhanh cho khách, nút duyệt lịch, chuyển trạng thái.
     - Bộ lọc theo ngày, theo chi nhánh (Q.1, Q.7, Thảo Điền).
     - Báo cáo thống kê số lượt khám.

---

## 5. THÔNG TIN KỸ THUẬT NỀN TẢNG
- **Framework**: Next.js 16.3.5 (App Router, Turbopack).
- **Styling**: Tailwind CSS v4, Vanilla CSS utilities (`src/app/globals.css`).
- **Icons**: `lucide-react`.
- **Assets Core**:
  - `public/hero_cinematic.jpg`: 8K Golden Retriever & British Shorthair bên suối khoáng.
  - `public/services_bg.jpg`: 8K nội thất phòng khám thú y cao cấp nhìn ra vườn.
  - `public/branches_bg.jpg`: 8K biệt thự resort thú y hoàng hôn.
- **Lệnh chạy dự án**: `npm run dev` (cổng 3000) | `npm run build` (kiểm tra toàn vẹn code).
- **Cập nhật UI mới nhất**:
  - Đã loại bỏ hoàn toàn dải cam kết "Chuẩn 5 Sao • Fear-Free Stressless • Cấp Cứu 24/7" ở đáy Hero Section theo yêu cầu.
  - Đã đổi toàn bộ các cụm từ "Cấp Cứu 24/7" / "Cấp cứu" trên toàn bộ trang web (Mobile Sticky Bar, Floating Contact Widgets, Footer, FAQ, Chi nhánh, Booking Form, Meta tags) thành "Hotline: 0903 599 339" hoặc "Hotline 24/7".
  - Bố cục Hero trên Mobile ôm sát nội dung tự nhiên, hoàn toàn không còn bất kỳ khoảng trống thừa nào ở phía trên lẫn phía dưới.
  - Phần 4 thẻ thông số chất lượng (StatsSection): Các ô đã được căn chỉnh nằm trọn vẹn 100% trong khung hình (`w-full` trên Mobile), khắc phục triệt để hiện tượng tràn mép ngang lộ nền trắng. Mũi tên Trái/Phải được tinh gọn tối đa (chỉ còn icon mũi tên tinh tế phát sáng, bỏ viền đen tròn), tự động ẩn mũi tên Trái khi ở đầu bên trái và ẩn mũi tên Phải khi đã lướt hết sang phải.
  - Cụm mũi tên Đầu trang & Cuối trang ([ScrollNavigationButtons.tsx](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/ScrollNavigationButtons.tsx)): Được tinh gọn thành biểu tượng mũi tên thanh lịch (không viền đen tròn), tự động ẩn mũi tên Lên khi đang ở đầu trang và tự động ẩn mũi tên Xuống khi đã cuộn tới cuối trang.
  - Phần Danh mục Dịch vụ ([ServicesSection.tsx](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/ServicesSection.tsx)): Cả "Nhóm 1: Thú Y & Y Tế Chuyên Sâu" và "Nhóm 2: Chăm Sóc & Lưu Trú 5 Sao" đều được trang bị dải lướt ngang linh hoạt với cặp mũi tên Trái/Phải tinh gọn (không viền đen tròn, tự ẩn khi chạm mép danh sách), thẻ dịch vụ hiển thị vừa vặn khung hình kèm chỉ báo chấm tròn tiến trình.
  - Mạng Lưới Chi Nhánh Bệnh Viện & Resort ([LocationsSection.tsx](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/LocationsSection.tsx)):
    - **Bố cục 2 cột song song trên Laptop**: Chi nhánh nằm ở CỘT BÊN TRÁI (`lg:col-span-5`), Bản đồ Google Maps tương tác nằm ở CỘT BÊN PHẢI (`lg:col-span-7`), kéo giãn chiều cao cân xứng hoàn hảo.
    - Đã loại bỏ hoàn toàn dòng chữ khẩu hiệu "Phòng khám thú y đa khoa & Hotline 24/7" (tagline).
    - Hỗ trợ thanh chọn chi nhánh tinh tế ở đầu cột trái khi có từ 2 chi nhánh trở lên; nếu chỉ có 1 chi nhánh sẽ hiển thị ngay thẻ thông tin tinh gọn.
  - **Tối ưu Hero Section: Nền Trong Suốt 100% & Sửa lỗi hiển thị trên Mobile**:
    - **Nền trong suốt theo yêu cầu**: Đã xóa bỏ hoàn toàn khung bo tròn màu trắng/be (`bg-white/80`, viền, đổ bóng hộp) quanh khối chữ "Nâng niu từng nhịp thở, an yên trọn một đời.". Toàn bộ khối tiêu đề và nút CTA hiện giờ có nền hoàn toàn trong suốt (`bg-transparent`), chữ hiển thị thanh thoát và tự nhiên trên nền ảnh.
    - **Sửa lỗi hiển thị trên điện thoại (Mobile)**:
      - Sửa thanh menu floating logo từ `relative sm:absolute` thành `absolute top-4 sm:top-6 inset-x-0` trên toàn bộ các breakpoint. Trước đó, thuộc tính `relative` trên mobile đã khiến logo và khối chữ bị flexbox xếp nằm ngang thành 2 cột song song, khiến khối chữ bị bóp nghẹt 50% màn hình bên phải và các nút bấm bị nén thành từng từ dọc.
  - **Màu sắc Logo Brand chuẩn hóa (PetLogo.tsx)**:
    - **Chữ "Pet"**: Màu **Vàng Hoàng Gia** (`.animate-gold-shimmer`), kết hợp chuyển động ánh kim lấp lánh dòng chảy (#B45309 - #FFB800 - #F59E0B), tương phản nổi bật rõ nét trên nền trắng header cũng như nền tối.
    - **Chữ "M&M"**: Màu **Xanh Ngọc Lục Bảo Y Tế** (`.animate-emerald-shimmer`), dòng ánh sáng xanh sang trọng (#2D5A27 - #1E4D1A - #3D7835), hòa quyện hoàn hảo với bộ nhận diện y tế 5 sao và không bao giờ bị chìm/trùng màu nền.
    - Dòng chữ phụ "Resort & Hospital 5★" đổi sang màu xanh đậm `#2D5A27` tạo độ tương phản cao, sắc sảo.
      - **Thu gọn tối đa khoảng cách & chiều cao trên điện thoại**: Giảm chiều cao Hero xuống `min-h-[48vh]`, rút ngắn khoảng đệm trên/dưới sát mép (`pt-4 pb-2`), thu nhỏ tiêu đề (`text-xl`) và dàn 2 nút bấm nằm ngang gọn gàng một hàng, triệt tiêu hoàn toàn vùng trống trên đỉnh và dưới đáy màn hình điện thoại theo đúng ảnh phản hồi.
      - **Tính năng lướt ảnh nhanh (Quick Slide Controls)**:
        - Giảm thời gian chuyển ảnh xuống 0.5 giây (`duration-[500ms]`) và tăng độ nhạy vuốt ngón tay (`diffX > 20px`), giúp thao tác lướt qua lại giữa các ảnh cực kỳ mượt và tức thì.
        - Bổ sung thanh điều khiển chuyển ảnh ở đáy Hero: Cặp nút mũi tên Trái/Phải (`ChevronLeft`, `ChevronRight`) để bấm lướt nhanh từng ảnh, kèm dải chấm tròn tiến trình hiển thị vị trí ảnh hiện tại (1/8, 2/8...) cho phép người dùng chạm trực tiếp để nhảy ngay tới ảnh mong muốn.
      - Tinh chỉnh màu nút hamburger menu trên mobile sang màu than đậm `text-slate-800` và đồng bộ Mobile Drawer sang phong cách kính mờ sáng sang trọng.

---

## 6. CẤU HÌNH SUPABASE & CƠ SỞ DỮ LIỆU
- **Project Name**: `website`
- **Project ID / Ref**: `ntkpdadakcyugvivvsjw`
- **Region**: `ap-southeast-2`
- **URL**: `https://ntkpdadakcyugvivvsjw.supabase.co`
- **Thư viện kết nối**: `@supabase/supabase-js` ([src/lib/supabase.ts](file:///c:/Users/Windows%2011/Desktop/testtt/src/lib/supabase.ts)).
- **Biến môi trường**: Đã lưu trữ trong `.env.local`.
- **Bảng `public.hinh_anh`**:
  - `id`: UUID Primary Key (`gen_random_uuid()`)
  - `tieu_de`: TEXT (Tiêu đề hình ảnh)
  - `mo_ta`: TEXT (Mô tả chi tiết)
  - `duong_dan_anh`: TEXT NOT NULL (Đường dẫn URL ảnh / CDN)
  - `dinh_dang`: TEXT (image/jpeg, png, webp...)
  - `kich_thuoc`: BIGINT (Dung lượng bytes)
  - `chuyen_muc`: TEXT (Phân loại: banner, dich_vu, chi_nhanh, bai_viet...)
  - `alt_text`: TEXT (Mô tả cho SEO)
  - `ngay_tao`, `ngay_cap_nhat`: TIMESTAMPTZ (Tự động ghi nhận ngày giờ)
  - **RLS & Security**: Đã bật Row Level Security và cấu hình Policy cho phép đọc/ghi dữ liệu.
- **Storage Bucket `hinh_anh`**: Đã tạo public bucket `hinh_anh` trên Supabase Storage kèm quyền upload và xem công khai.

---

## 7. QUẢN LÝ ẢNH NỀN HERO BANNER & TRANG ADMIN
- **Tích hợp Database cho Hero ([HeroSection.tsx](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/HeroSection.tsx))**:
  - Toàn bộ 8 ảnh nền chuyển động được lưu trữ và tải trực tiếp từ bảng `public.hinh_anh` (chuyên mục: `hero_banner`).
  - Mỗi ảnh hỗ trợ các tham số động:
    - `can_chinh`: Vị trí trọng tâm ảnh khi hiển thị (`object-position` CSS: center, top, bottom, hoặc tọa độ phần trăm `X% Y%`).
    - `ti_le_phong`: Mức độ phóng to khi chuyển động (Zoom scale: 1.0x - 1.15x).
    - `thoi_gian_hien_thi`: Thời lượng hiển thị từng slide (ms).
    - `kich_hoat`: Bật / Tắt hiển thị ảnh mà không cần xóa.
- **Trang Quản Trị Admin ([src/app/admin/page.tsx](file:///c:/Users/Windows%2011/Desktop/testtt/src/app/admin/page.tsx))**:
  - Địa chỉ URL: `/admin` (có liên kết trực tiếp ở chân trang web).
  - Danh sách trực quan toàn bộ ảnh nền banner trên Supabase.
  - Tính năng Tải file ảnh trực tiếp từ máy tính lên Supabase Storage bucket `hinh_anh`.
  - **Đã khắc phục lỗi `Invalid src prop`**: Đã cấu hình `remotePatterns` cho `**.supabase.co` trong `next.config.ts`, hỗ trợ `unoptimized` và thẻ `img` trực tiếp trong Admin giúp hiển thị trơn tru mọi ảnh tải lên.
  - **Giao diện Quản trị tinh giản, tông sáng chuẩn SaaS & Rộng Full Màn Hình Laptop**:
    - Chuyển toàn bộ trang Admin sang nền sáng sạch sẽ (`bg-slate-50`, card trắng), loại bỏ hoàn toàn các thuật ngữ rườm rà hay phong cách sci-fi/AI quá đà.
    - Mở rộng bố cục toàn màn hình laptop (`w-full max-w-[1720px]`), tận dụng trọn vẹn bề ngang không gian hiển thị, loại bỏ khoảng trống thừa 2 bên mép.
  - **Bộ công cụ Căn chỉnh Kéo Thả Trực Quan (Giống Đặt Lại Vị Trí Ảnh Bìa Facebook)**:
    - Người dùng có thể nhấp chuột và kéo rê trực tiếp trên ảnh (`cursor-grab` / `cursor-grabbing` và cử chỉ chạm cảm ứng) để điều chỉnh vị trí hiển thị theo ý muốn cực kỳ tự nhiên.
    - Thanh trượt thu phóng mượt mà (Zoom In / Zoom Out từ 1.0x đến 1.3x).
    - Nút "Căn giữa" và các nút căn nhanh (Đỉnh / Giữa / Đáy).
    - Tọa độ `X% Y%` tự động tính toán tức thì theo thao tác kéo thả và lưu chuẩn xác vào Supabase.
  - **Tối ưu nút chuyển ảnh trên Trang Chủ HeroSection**:
    - Đã bỏ hoàn toàn thanh đếm chấm và số trang `[... 7/9]` ở đáy ảnh theo yêu cầu.
    - Chuyển 2 nút chuyển ảnh Trái/Phải lên chính giữa chiều cao của ảnh (`top-1/2 -translate-y-1/2`), nằm sát 2 rìa ảnh, kích thước tròn nổi bật, dễ bấm và không bị che khuất trên cả Desktop lẫn Mobile.
  - **Khắc phục triệt để lỗi ảnh mới tải lên bị chớp nháy hoặc chuyển slide sớm**:
    - **Cơ chế Preload toàn bộ ảnh trước**: Tất cả ảnh từ Supabase (kể cả ảnh mới tải lên như ảnh thứ 10) được tự động nạp ngầm vào bộ nhớ đệm trình duyệt ngay khi vào trang (`new window.Image()`), loại bỏ hoàn toàn độ trễ tải mạng (trước đó ảnh mất 3s để tải từ internet về dẫn tới chỉ kịp hiện 0.5s rồi bị timer chuyển tiếp).
    - **Cơ chế Timer độc lập (`setTimeout`) & State nguyên tử**: Mỗi khi chuyển sang một bức ảnh mới, bộ đếm giờ sẽ được làm mới hoàn toàn (reset), đảm bảo ảnh luôn xuất hiện đủ 100% thời lượng đã cài đặt (4.000ms / 4 giây).
    - **Tự động đồng bộ thời gian thực**: Lắng nghe sự kiện `focus` và Supabase Realtime Channel, khi người dùng thêm ảnh ở Admin và quay lại trang chủ, danh sách ảnh mới sẽ tự động cập nhật ngay mà không cần F5.

---

## 8. CƠ SỞ DỮ LIỆU CẤU HÌNH LIÊN HỆ & QUẢN LÝ CHI NHÁNH
- **Bảng `public.cau_hinh` (Hotline & Mạng xã hội)**:
  - `id`: 'system'
  - `hotline`: '0903 599 339'
  - `hotline_hien_thi`: '0903 599 339'
  - `link_zalo`: 'https://zalo.me/0903599339'
  - `link_facebook`: 'https://facebook.com/petmm'
  - `link_messenger`: 'https://m.me/petmm'
  - `email`: 'contact@petmm.vn'
  - `dia_chi_chinh`: '19 Đ. Số 1, Phường Phước Long, TP. Thủ Đức, TP. Hồ Chí Minh'
  - Tích hợp `SystemConfigProvider` và hook `useSystemConfig()`, đồng bộ Realtime ra Header, Footer, Nút nổi chat, v.v.
- **Bảng `public.chi_nhanh` (Quản lý Cơ sở Bệnh viện & Phòng khám)**:
  - Đã xóa toàn bộ data giả lập cũ (Quận 7, Thảo Điền).
  - Khởi tạo chuẩn xác duy nhất: **Chi nhánh TP. Thủ Đức (Trụ sở chính)**:
    - Địa chỉ: 19 Đ. Số 1, Phường Phước Long, TP. Thủ Đức, TP. Hồ Chí Minh.
    - Hotline: 0903 599 339.
    - Giờ mở cửa: 08:00 - 20:00 (Hotline trực 24/24).
    - Bác sĩ phụ trách: BS. CKI Nguyễn Minh Tuấn.
    - Tiện ích: Phòng mổ vô trùng áp lực dương, X-quang kỹ thuật số & Siêu âm Doppler, nội trú cách ly, Pet Ambulance.
    - Bản đồ Google Maps nhúng iframe và link chỉ đường Google Maps App.
- **Trang Quản Trị Admin Đa Năng ([src/app/admin/page.tsx](file:///c:/Users/Windows%2011/Desktop/testtt/src/app/admin/page.tsx))**:
  - **Tab 1: Ảnh Nền Hero**: Kéo thả căn chỉnh vị trí như ảnh bìa Facebook, thanh trượt zoom, chọn thời gian chiếu.
  - **Tab 2: Chi Nhánh**: Quản lý danh sách chi nhánh, thêm chi nhánh mới, sửa địa chỉ, link Google Maps, bác sĩ, tiện ích, bật/tắt hoạt động.
  - **Tab 3: Đội Ngũ Y Tế**: Quản lý bác sĩ & điều dưỡng theo 4 hạng mục chuyên môn, tải ảnh lên Supabase Storage, bật/tắt hiển thị.
  - **Tab 4: Cấu Hình & Giới Thiệu**: Cập nhật Hotline, mạng xã hội, trích dẫn triết lý y đức, tên/chức danh bác sĩ giám đốc chuyên môn, và quản lý các slide ảnh của Khung Giới Thiệu.

---

## 9. TÁI CẤU TRÚC BỐ CỤC TRANG CHỦ & MENU ĐIỀU HƯỚNG
- **Thứ tự các phân khúc trên Trang Chủ ([page.tsx](file:///c:/Users/Windows%2011/Desktop/testtt/src/app/page.tsx))**:
  1. **Về Pet M&M** ([AboutSection.tsx](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/AboutSection.tsx)): Đưa lên vị trí đầu tiên ngay sau Hero, thể hiện sứ mệnh, triết lý y khoa, số liệu và khung trượt ảnh cơ sở/đội ngũ.
  2. **Dịch Vụ** ([ServicesSection.tsx](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/ServicesSection.tsx)): Danh mục dịch vụ khám chữa bệnh và lưu trú.
  3. **Hệ Thống Cơ Sở** ([LocationsSection.tsx](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/LocationsSection.tsx)): Mạng lưới chi nhánh bệnh viện và bản đồ Google Maps.
  4. **Cẩm Nang** ([KnowledgeSection.tsx](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/KnowledgeSection.tsx)): Kiến thức y khoa thú cưng chọn lọc.
  5. **Hỏi Đáp (FAQ)** ([FaqSection.tsx](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/FaqSection.tsx)): Giải đáp các thắc mắc thường gặp.
  6. **Đánh Giá** ([CustomerReviewsSection.tsx](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/CustomerReviewsSection.tsx)): Phản hồi chân thực từ các ba mẹ thú cưng.
  7. **Liên Hệ / Footer** ([Footer.tsx](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/Footer.tsx)): Hotline, địa chỉ và thông tin pháp lý.
- **Đồng bộ Menu điều hướng (Header & Mobile Drawer)**:
  - Menu thanh điều hướng trên máy tính và thanh menu mở rộng trên điện thoại được sắp xếp chuẩn theo đúng thứ tự 7 phân mục trên.

---

## 10. KHUNG GIỚI THIỆU & SỨ MỆNH TRIẾT LÝ Y KHOA (ABOUT SECTION)
- **Tích hợp Database cho Khung Giới Thiệu**:
  - **Trích dẫn y đức & Giám đốc chuyên môn**: Lưu trữ trực tiếp trong bảng `public.cau_hinh`:
    - `gioi_thieu_trich_dan`: *"Chúng tôi coi từng nhịp thở, từng ánh mắt của các bé là trách nhiệm và niềm tự hào lớn nhất trong sự nghiệp y khoa của mình."*
    - `gioi_thieu_bac_si_ten`: *"BS. CKI Nguyễn Minh Tuấn"*
    - `gioi_thieu_bac_si_chuc_danh`: *"Giám Đốc Chuyên Môn Hệ Thống Bệnh Viện Pet M&M"*
  - **Bộ sưu tập slide ảnh giới thiệu**: Lưu trữ trong bảng `public.hinh_anh` với `chuyen_muc = 'gioi_thieu'`.
    - Hỗ trợ không giới hạn số lượng ảnh, hiển thị badge chuyên môn, tiêu đề từng ảnh, nút chuyển ảnh `<` và `>` tinh tế cùng dải chấm tròn tiến trình.
    - Cho phép quản lý thêm, sửa, xóa, tải ảnh mới, đổi thứ tự hiển thị và bật/tắt trực tiếp trong trang Quản trị Admin.
- **4 Thẻ số liệu tương tác (Stats Grid)**:
  - **Năm thành lập (2018)**: Lưu trữ trong database (`thong_ke_nam_thanh_lap`, `thong_ke_nam_thanh_lap_nhan` bảng `public.cau_hinh`), thay đổi được trong Admin.
  - **Cơ sở TPHCM**: Tự động đếm số lượng chi nhánh thực tế từ bảng `chi_nhanh` trong database; khi nhấp vào sẽ cuộn mượt mà ngay đến phân mục Hệ Thống Cơ Sở (`#co-so`).
  - **Khách hàng (30k+)**: Lưu trữ trong database (`thong_ke_khach_hang`, `thong_ke_khach_hang_nhan` bảng `public.cau_hinh`), thay đổi được trong Admin.
  - **Đội ngũ y tế**: Tự động đếm tổng số bác sĩ & điều dưỡng đang hoạt động từ bảng `doi_ngu_y_te`; khi nhấp vào sẽ chuyển view sang trang xem danh sách toàn bộ đội ngũ y tế (`/doi-ngu`).

---

## 11. ĐỘI NGŨ Y TẾ & TRANG VIEW CHUYÊN SÂU (`/doi-ngu`)
- **Bảng `public.doi_ngu_y_te`**:
  - `id`: UUID Primary Key (`gen_random_uuid()`)
  - `ho_ten`: TEXT NOT NULL (Họ và tên bác sĩ / điều dưỡng)
  - `chuc_danh`: TEXT (Bác sĩ Chuyên khoa I, Bác sĩ Ngoại khoa, Trưởng ca...)
  - `chuyen_muc`: TEXT NOT NULL, chia theo 4 hạng mục chuẩn:
    1. `lanh_dao`: **Đội ngũ Lãnh đạo chuyên môn**
    2. `chuyen_gia`: **Đội ngũ Chuyên gia Tư vấn**
    3. `bac_si`: **Đội ngũ Bác sĩ Thú y**
    4. `dieu_duong`: **Đội ngũ Điều dưỡng & Chăm sóc**
  - `anh_dai_dien`: TEXT (Link ảnh chân dung hoặc tải lên Supabase Storage)
  - `kinh_nghiem`: TEXT (Số năm kinh nghiệm, ví dụ: "12 năm kinh nghiệm")
  - `hoc_vi`: TEXT (CKI, Thạc sĩ, Bác sĩ Thú y chính quy...)
  - `chuyen_khoa`: TEXT (Ngoại khoa phẫu thuật, Chẩn đoán hình ảnh, v.v.)
  - `gioi_thieu`: TEXT (Tiểu sử y đức, quá trình công tác)
  - `thu_tu`: INTEGER (Thứ tự ưu tiên hiển thị)
  - `kich_hoat`: BOOLEAN (Bật / Tắt hiển thị)
- **Thiết kế Giao diện Trang `/doi-ngu`**:
  - **Vạch trang trí tiêu đề màu xanh**: Vạch đứng trước mỗi tiêu đề hạng mục sử dụng màu xanh ngọc lục bảo y tế thương hiệu (`bg-[#2D5A27]`), chữ chức danh hiển thị sắc sảo màu xanh `#2D5A27`.
  - **Số đếm thành viên tự động**: Hiển thị số lượng nhân sự sau mỗi tiêu đề: e.g. `Đội ngũ Lãnh đạo chuyên môn (3)`, `Đội ngũ Bác sĩ Thú y (4)`... và câu giới thiệu đầu trang tự động đếm tổng số nhân sự thực tế từ database (`${team.length}+`).
  - **Trải nghiệm Mobile lướt ngang (Horizontal Swipe) & Điều khiển số đếm**:
    - Trên điện thoại di động: Danh sách bác sĩ trong từng chuyên mục hiển thị dạng dải trượt ngang mượt mà (`overflow-x-auto snap-x scrollbar-none`).
    - **Thanh số đếm & Nút xem tiếp trên điện thoại**: Có badge số đếm trực tiếp `[1 / N]`, `[2 / N]` tự cập nhật khi vuốt ngón tay, cặp nút mũi tên `<` `>` tiện dụng để chạm xem tiếp ngay lập tức, và dải chấm tròn tiến trình ở đáy mỗi danh mục.
    - Trên mỗi thẻ nhân sự mobile có badge góc `01/N`, `02/N`.
    - Trên máy tính (Desktop/Laptop): Hiển thị lưới 3 cột trực quan, sắc sảo.
  - **Avatar mặc định chuẩn phong cách Facebook**:
    - Khi nhân sự chưa có ảnh hoặc ảnh trống, tự động hiển thị biểu tượng hình bóng người chuẩn phong cách đại diện Facebook (`DefaultFacebookAvatar`), đảm bảo tính đồng nhất, sạch sẽ và thẩm mỹ cao.

---

## 12. ĐÁNH GIÁ KHÁCH HÀNG & FORM NHẬP LIỆU TINH GỌN
- **Bảng `public.danh_gia` (Customer Reviews)**:
  - Lưu trữ đánh giá khách hàng với số sao (5 sao), họ tên chủ thú cưng, số điện thoại bảo mật che 4 số cuối dạng `0903 *** ***`, nhận xét thực tế và ảnh đại diện thú cưng.
  - Phân mục Đánh giá trên trang chủ hiển thị dạng trượt thẻ ngang tinh tế, gọn gàng, tạo sự an tâm tuyệt đối cho khách hàng mới.
- **Chuẩn hóa Form nhập liệu**:
  - Loại bỏ 100% các dòng chú thích, gợi ý thừa, placeholder giải thích rườm rà dưới các ô nhập liệu trong tất cả các modal form (Modal đặt lịch khám, Modal thêm/sửa nhân sự, Modal quản lý slide ảnh).
  - Giữ các trường dữ liệu gọn gàng, trực quan và chuẩn mực SaaS.

---

## 13. CẢI TIẾN TRANG CÀI ĐẶT ADMIN & TỐI ƯU TRẢI NGHIỆM ĐỘI NGŨ / MẠNG XÃ HỘI
- **Cấu Trúc Trang Cài Đặt Hệ Thống (`/admin`) Chia Nhỏ Thành 5 Phân Nhánh Riêng Biệt**:
  1. 📞 **Hotline & Mạng Xã Hội (`contact`)**:
     - Quản lý Hotline gọi nhanh 24/7 (`hotline`), Hotline hiển thị định dạng số đẹp (`hotline_hien_thi`), Chat Zalo OA (`link_zalo`), Fanpage Facebook (`link_facebook`), Facebook Messenger (`link_messenger`), Kênh TikTok (`link_tiktok`), Gmail / Email tiếp nhận liên hệ (`email`), và Trụ sở chính (`dia_chi_chinh`).
     - **Quy tắc ẩn icon thông minh**: Kênh nào để trống sẽ **tự động ẩn hoàn toàn** biểu tượng liên hệ của kênh đó trên toàn bộ trang web (thanh nổi liên hệ `FloatingContactWidgets`, chân trang `Footer`, Header, v.v.).
     - **Gmail liên hệ**: Biểu tượng chuẩn SVG Google Gmail; khi khách hàng chạm vào icon sẽ tự động mở ứng dụng gửi thư (`mailto:`) để liên hệ ngay.
  2. 🏛️ **Giới Thiệu & Triết Lý (`about`)**:
     - Quản lý huy hiệu tiêu đề, 2 dòng tiêu đề chính (tiêu đề 1 & tiêu đề 2 màu xanh rêu), nội dung đoạn văn sứ mệnh, khối Cam Kết Vàng Y Khoa, trích dẫn tâm niệm y đức và tên/chức danh bác sĩ đại diện.
  3. 🖼️ **Slide Ảnh Giới Thiệu (`slides`)**:
     - Quản lý danh sách slide ảnh trình chiếu khung giới thiệu và trang Đội ngũ y tế: thêm mới, tải ảnh, chỉnh sửa tiêu đề/alt text, bật/tắt hiển thị, xóa ảnh.
  4. 📊 **Thông Số Thống Kê (`stats`)**:
     - Quản lý 2 thông số cố định: Năm thành lập (`2018`, nhãn "Năm thành lập") và Khách hàng phục vụ (`30k+`, nhãn "Khách hàng"). Hai chỉ số Cơ sở và Đội ngũ y tế được đếm tự động theo thời gian thực từ cơ sở dữ liệu.
  5. ✨ **Khẩu Hiệu & Slogan (`slogans`)**:
     - Quản lý Khẩu hiệu đầu trang Hero Banner, Khẩu hiệu chân trang Footer và Số giấy phép hoạt động thú y.
  - **Menu con & Thanh chuyển tab**: Sidebar hiển thị 5 mục con riêng biệt với icon trực quan, trang quản trị có thanh điều hướng sub-tab dạng pill mượt mà, mỗi nhánh có nút lưu riêng, hiển thị thông báo lưu thành công theo đúng tên nhánh.
- **Tối Ưu Giao Diện Đội Ngũ Y Tế Trên Điện Thoại (`/doi-ngu`)**:
  - **Mũi tên lướt qua lại nằm trực tiếp đè trên ảnh**: Cặp nút `<` và `>` trên điện thoại được đặt trực tiếp đè lên 2 bên mép ảnh nhân sự (`absolute left-1.5/right-1.5 top-24`), nền trắng bo tròn có viền và bóng đổ nổi bật, tự động ẩn khi chạm mép danh sách, tách biệt hoàn toàn khỏi dòng tiêu đề.
  - **Ẩn hoàn toàn tiêu đề nếu hạng mục không có nhân sự**: Bất kỳ hạng mục nào (Lãnh đạo chuyên môn, Chuyên gia tư vấn, Bác sĩ thú y, Điều dưỡng & Chăm sóc) chưa có nhân sự (`items.length === 0`) thì hệ thống sẽ ẩn 100% cả dòng tiêu đề, vạch màu xanh thương hiệu, khung danh sách và nút điều hướng nhảy nhanh (pill) trên thanh breadcrumbs đầu trang.


