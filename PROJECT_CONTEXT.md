# PET M&M — SỔ TAY NGỮ CẢNH DỰ ÁN (PROJECT CONTEXT)

> 🆔 **MÃ CUỘC TRÒ CHUYỆN (CONVERSATION ID)**:
> - **Phiên hiện tại (Latest)**: `94636bed-0ada-4ce6-a927-5858feaf34b7`
> - **Phiên trước**: `43991119-8237-4895-a7ff-c47117034f65`
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

## 2. NGUYÊN TẮC THẨM MỸ & QUY TẮC THIẾT KẾ CỐT LÕI (CRITICAL RULES)
1. **Phong cách nghệ thuật Điện ảnh Siêu Thực (Photorealistic & Cinematic)**:
   - **Tuyệt đối KHÔNG dùng hình ảnh 3D hoạt hình / chibi / cartoon / phèn**.
   - Hình ảnh phải mang vẻ đẹp siêu thực, giống như phim điện ảnh nghệ thuật (người thật, thú cưng lông mượt như thật, ánh sáng sương mù suối khoáng tự nhiên).
2. **Quy tắc trải nghiệm người dùng & Kiểm thử**:
   - Khung cảnh cún Golden & mèo Anh lông ngắn bên bờ suối nước nóng phải **thông thoáng, sạch sẽ 100%, không bị đè bất kỳ nút chấm đen/nhãn hotspot nào**.
   - **Tuyệt đối không tự ý mở trình duyệt `browser_subagent` / `http://localhost:3000/`** khi chưa có sự cho phép cụ thể từ người dùng. Mọi kiểm thử phải chạy qua `npx tsc --noEmit` hoặc terminal.
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
6. **Quy tắc Hiển thị Chú thích Nút nổi (Floating Tooltip Scoping)**:
   - Khi rê chuột vào icon nào chỉ được phép bung duy nhất chú thích của icon đó (`group/item` và `group-hover/item:...`).
   - Tuyệt đối không để class `group` ở thẻ cha bao bọc toàn cụm, vì sẽ làm bung đồng loạt toàn bộ chú thích của tất cả các nút khi hover vào vùng chứa.
7. **Quy tắc Ẩn khi Cuộn Trang (Scroll Hiding State)**:
   - Khi người dùng đang cuộn trang (`isScrolling`), cụm liên hệ nổi và nút điều hướng cuộn trang phải **ẩn hoàn toàn 100%** (`translate-x-32 opacity-0 pointer-events-none`), không chừa thụt dở dang và vô hiệu hóa tương tác chuột.
   - Khi dừng cuộn (sau 650ms), cụm nút sẽ lướt êm dịu trở lại vị trí hiển thị (`translate-x-0 opacity-100 pointer-events-auto`).
8. **Quy tắc Menu Điều hướng Phân Cấp (Database-driven Dropdown Navigation)**:
   - Toàn bộ nội dung đổ xuống của menu (Chi nhánh, Dịch vụ, Cẩm nang) **phải lấy 100% dữ liệu thực tế từ Database**, tuyệt đối không bịa dữ liệu giả lập.
   - **Dịch vụ**: Phân loại theo đúng 2 nhóm thực tế: `Thú Y & Y Tế` và `Chăm Sóc & Lưu Trú`. Tuyệt đối bỏ tiền tố "Nhóm 1", "Nhóm 2" ở mọi nơi liên quan đến dịch vụ. Khi chọn dịch vụ con từ menu, hệ thống phải tự động cuộn đến phân mục Dịch vụ và mở chi tiết dịch vụ đó ngay lập tức.
   - **Chi nhánh**: Đổ xuống danh sách chi nhánh thực tế từ DB, click chuyển thẳng vào view chi tiết cơ sở (`/chi-nhanh/:id`).
   - **Cẩm nang**: Đổ xuống 2 tầng (Tầng 1 là chuyên mục đang có bài viết thực tế, bỏ mục "Tất cả bài viết"; Tầng 2 là tiêu đề bài viết con thực tế từ DB, click chuyển thẳng vào view chi tiết bài viết (`/kien-thuc/:id`)).
9. **Quy tắc Chuyển Đổi Song Ngữ (Bilingual Architecture VI / EN)**:
   - Đồng bộ song ngữ thời gian thực trên toàn bộ ứng dụng qua `LanguageContext`: Header, Menu đa tầng, Tiêu đề tab trình duyệt (`document.title`), Slogan 3D Aura, Hero Banner, Marquee Ticker, Chân trang và Modal.
   - Dữ liệu cấu hình (`tieu_de_trang_en`, `slogan_dau_trang_tieu_de_en`, `slogan_dau_trang_noi_dung_en`) được lưu trữ tại DB bảng `cau_hinh` và tự động lưu cache tại `localStorage` để hiển thị tức thì không bị chớp giật hay nhảy sai ngôn ngữ lúc mới tải trang.

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

---

## 14. HỆ THỐNG MENU ĐIỀU HƯỚNG ĐA TẦNG ĐỘNG (DATABASE-DRIVEN MULTI-TIER NAVIGATION)
- **Tập tin liên quan**: [`src/components/NavDesktopMenu.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/NavDesktopMenu.tsx), [`src/components/Header.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/Header.tsx), [`src/hooks/useNavDatabase.ts`](file:///c:/Users/Windows%2011/Desktop/testtt/src/hooks/useNavDatabase.ts).
- **Lấy dữ liệu 100% từ Database Supabase**: Không bịa dữ liệu giả lập, có state dự phòng tức thì ban đầu để menu không bị chớp giật hay trống trơn khi mới tải trang.
- **Cấu trúc chi tiết của 3 phân mục dropdown**:
  1. 🩺 **Dịch Vụ (Đổ xuống 2 tầng)**:
     - **Tầng 1**: Phân thành 2 nhóm thực tế: `Thú Y & Y Tế` (`medical`) và `Chăm Sóc & Lưu Trú` (`care`).
     - **Quy tắc bỏ chữ**: Đã loại bỏ hoàn toàn chữ "Nhóm 1", "Nhóm 2" trên toàn bộ website và cả trong form quản trị Admin.
     - **Tầng 2**: Danh sách các dịch vụ con thực tế từ bảng `dich_vu` bay ra bên phải theo nhóm tương ứng.
     - **Hành vi tương tác**: Khi người dùng bấm vào một dịch vụ con bất kỳ, website tự động cuộn mượt mà đến phân mục `#services` và phát sự kiện `select-service` mở trực tiếp chi tiết của dịch vụ đó.
  2. 🏥 **Hệ Thống Cơ Sở (Đổ xuống 1 tầng)**:
     - Hiển thị danh sách tên ngắn của các chi nhánh đang hoạt động từ bảng `chi_nhanh` (Ví dụ: "Cơ sở TP. Thủ Đức", "sá").
     - Khi bấm vào cơ sở, website chuyển thẳng đến trang view chi tiết con `/chi-nhanh/:id`.
  3. 📚 **Cẩm Nang (Đổ xuống 2 tầng)**:
     - **Tầng 1**: Hiển thị danh sách các chuyên mục thực tế đang có bài viết con từ bảng `bai_viet` (đã loại bỏ mục "Tất cả bài viết" theo yêu cầu).
     - **Tầng 2**: Danh sách tiêu đề bài viết con thực tế bay ra bên phải, khi bấm vào sẽ chuyển thẳng đến trang view chi tiết bài viết `/kien-thuc/:id`.
- **Hỗ trợ đa dạng biến thể (Variants)**: Dùng chung một linh kiện `NavDesktopMenu` cho cả thanh Menu nổi dạng viên thuốc (`variant="pill"`) và thanh Sticky Header khi cuộn trang (`variant="header"`).

---

## 15. KIẾN TRÚC CHUYỂN ĐỔI SONG NGỮ VI / EN THỜI GIAN THỰC (REAL-TIME BILINGUAL ARCHITECTURE)
- **Tập tin liên quan**: [`src/context/LanguageContext.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/context/LanguageContext.tsx), [`src/components/LanguageSwitcher.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/LanguageSwitcher.tsx), [`src/components/DynamicFavicon.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/DynamicFavicon.tsx), [`src/locales/translations.ts`](file:///c:/Users/Windows%2011/Desktop/testtt/src/locales/translations.ts).
- **Cơ chế lưu trữ & Trạng thái**:
  - Lưu trữ trạng thái ngôn ngữ đồng thời vào `localStorage` (`petmm_language`) và Cookie (`petmm_lang`) với thời hạn 1 năm.
  - Cập nhật tức thì thuộc tính `<html lang="vi">` hoặc `<html lang="en">` phục vụ SEO và trợ năng.
- **Phạm vi chuyển ngữ toàn diện**:
  - **Tiêu đề Tab trình duyệt (`document.title`)**: Đổi động theo ngôn ngữ: Tiếng Việt hiển thị `tieu_de_trang` / Tiếng Anh hiển thị `tieu_de_trang_en` từ Database (có nạp cache tránh gián đoạn).
  - **Menu Điều Hướng & Thanh Header**: `Về Pet M&M` $\leftrightarrow$ `About Pet M&M`, `Dịch Vụ` $\leftrightarrow$ `Services`, `Hệ Thống Cơ Sở` $\leftrightarrow$ `Our Branches`, `Cẩm Nang` $\leftrightarrow$ `Handbook`, `Đặt Lịch Khám` $\leftrightarrow$ `Book Appointment`.
  - **Các nhóm dịch vụ con & Chi nhánh & Cẩm nang**: Tự động chuyển đổi tên song ngữ theo các trường `ten_dich_vu_en`, `ten_ngan_en`, `ten_chi_nhanh_en`, `chuyen_muc_en`, `tieu_de_en`.
  - **Khu vực Mở đầu Hero Section**:
    - Tiêu đề H1: Tự động đổi giữa `slogan_dau_trang_tieu_de` và `slogan_dau_trang_tieu_de_en`.
    - Dải Marquee Ticker: Tự động chạy nội dung khẩu hiệu giữa `slogan_dau_trang_noi_dung` và `slogan_dau_trang_noi_dung_en`.
    - Nút CTA: `Đặt Lịch Thăm Khám` $\leftrightarrow$ `Book Appointment`, `Xem Dịch Vụ` $\leftrightarrow$ `View Services`.

---

## 16. TỐI ƯU CỤM WIDGET LIÊN HỆ NỔI & ĐIỀU HƯỚNG CUỘN TRANG
- **Tập tin liên quan**: [`src/components/FloatingContactWidgets.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/FloatingContactWidgets.tsx), [`src/components/ScrollNavigationButtons.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/ScrollNavigationButtons.tsx).
- **Hover Chú Thích Từng Nút Riêng Biệt (Scoped Tooltip)**:
  - Loại bỏ hoàn toàn class `group` ở thẻ cha bao bọc để không kích hoạt đồng loạt tất cả các tooltip cùng lúc.
  - Gắn nhãn định danh nhóm riêng `group/item` cho từng nút bấm liên hệ (Hotline, Zalo, Messenger, Fanpage Facebook, TikTok, Gmail).
  - Khi rê chuột vào icon nào, duy nhất chú thích của icon đó được hiển thị mượt mà (`group-hover/item:opacity-100 group-hover/item:translate-x-0`).
- **Hiệu Ứng Ẩn Hoàn Toàn Khi Cuộn Trang (Complete Scroll Hiding)**:
  - Lắng nghe sự kiện `scroll` cửa sổ và quản lý trạng thái `isScrolling` kèm `setTimeout` (650ms).
  - Khi người dùng bắt đầu cuộn trang: Toàn bộ cụm nút nổi liên hệ và cụm nút mũi tên cuộn trang sẽ trượt ẩn hoàn toàn 100% khỏi mép màn hình (`translate-x-32 opacity-0 pointer-events-none`).
  - Khi người dùng dừng cuộn: Toàn bộ cụm nút sẽ êm ái trượt trở lại vị trí ban đầu (`translate-x-0 opacity-100 pointer-events-auto`).
- **Mũi tên Đầu Trang & Cuối Trang thông minh**:
  - Tự động ẩn nút mũi tên Lên khi đang ở vị trí đầu trang (< 120px).
  - Tự động ẩn nút mũi tên Xuống khi đã cuộn tới sát chân trang (< 120px từ đáy).

---

## 17. HỆ THỐNG SONG NGỮ CHO KHUNG GIỚI THIỆU & QUẢN LÝ SLIDE ẢNH ADMIN
- **Tập tin liên quan**: [`src/components/AboutSection.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/AboutSection.tsx), [`src/app/admin/page.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/app/admin/page.tsx), [`src/lib/supabase.ts`](file:///c:/Users/Windows%2011/Desktop/testtt/src/lib/supabase.ts).
- **Cơ sở dữ liệu Supabase (`public.hinh_anh`)**:
  - Bổ sung 3 trường song ngữ: `tieu_de_en`, `alt_text_en`, `mo_ta_en`.
  - Khởi tạo sẵn bản dịch chuẩn y khoa quốc tế cho toàn bộ các slide ảnh mẫu hiện có.
- **Trang chủ Khung Giới Thiệu (`AboutSection.tsx`)**:
  - Toàn bộ nội dung chuyển đổi tức thì theo ngôn ngữ (`isEn`):
    - Huy hiệu sứ mệnh (`gioi_thieu_huy_hieu_en`), tiêu đề 2 dòng (`gioi_thieu_tieu_de_1_en`, `gioi_thieu_tieu_de_2_en`), đoạn văn giới thiệu (`gioi_thieu_mo_ta_en`).
    - 4 khối cam kết y đức chuẩn Fear-Free Hoa Kỳ, Vô trùng áp lực dương, Bác sĩ chuyên môn sâu, Hồ sơ bệnh án minh bạch.
    - Tiêu đề chú thích ảnh slide (`tieu_de_en`) & huy hiệu góc ảnh (`alt_text_en`).
    - Bảng 4 thông số: Năm thành lập, Cơ sở TP.HCM, Khách hàng, Đội ngũ y tế.
    - Khối trích dẫn tâm niệm y đức và chức danh bác sĩ trưởng.
    - Nhãn trợ năng (aria-label) cho các nút mũi tên chuyển slide, nút chấm tròn dots, tooltip liên kết.
- **Khu vực Quản trị Admin (`/admin` - Slide Ảnh Khung Giới Thiệu & Đội Ngũ)**:
  - Thẻ danh sách slide hiển thị huy hiệu `EN` và tiêu đề tiếng Anh tương ứng.
  - Modal "Chỉnh Sửa Ảnh Khung Giới Thiệu" / "Thêm Ảnh Khung Giới Thiệu":
    - **Thanh tab chuyển đổi ngôn ngữ**: Tiếng Việt (cờ Việt Nam) $\leftrightarrow$ English (cờ Vương Quốc Anh).
    - **Nút "Chuyển đổi ENG" tích hợp AI**: Tự động dịch tiêu đề chú thích ảnh và huy hiệu góc ảnh sang tiếng Anh chuyên ngành thú y chuẩn mực bằng 1 chạm.
    - **Tuân thủ tuyệt đối Quy tắc 3 (Rule 3)**: Hoàn toàn không sử dụng thuộc tính `placeholder` trong bất kỳ ô nhập liệu nào.

---

## 18. TỰ ĐỘNG CHUYỂN NGỮ TOÀN DIỆN CƠ SỞ DỮ LIỆU DỊCH VỤ (`public.dich_vu`)
- **Tập tin liên quan**: [`src/components/ServicesSection.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/ServicesSection.tsx), [`src/components/BookingSection.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/BookingSection.tsx), [`src/lib/supabase.ts`](file:///c:/Users/Windows%2011/Desktop/testtt/src/lib/supabase.ts).
- **Thực thi SQL Batch tự động lưu thẳng vào Database**:
  - Đã chạy tập lệnh tự động hóa biên dịch và cập nhật 100% dữ liệu song ngữ chuẩn y khoa & resort thú cưng quốc tế cho toàn bộ 9 gói dịch vụ trong `public.dich_vu`:
    1. `kham-tong-quat` (Medical): Comprehensive Clinical Exam & Consultation | Most Popular | From 150,000 VND.
    2. `tiem-phong-vaccine` (Medical): GSP-Standard Preventive Vaccination | International Standard | From 220,000 VND / dose.
    3. `xet-nghiem-chan-doan` (Medical): Laboratory Testing & Digital Diagnostic Imaging | High-Tech Diagnostics | From 180,000 VND.
    4. `phau-thuat-ngoai-khoa` (Medical): Surgical Care & Safe Neutering Procedures | 5-Star Safety | Consultation per Case.
    5. `dieu-tri-noi-tru` (Medical): Inpatient Hospitalization & 24/7 ICU Recovery | 24/7 Dedicated Shift | From 200,000 VND / day.
    6. `spa-grooming-cat-tia` (Care): 5-Star Luxury Spa, Grooming & Styling | Most Loved | From 250,000 VND.
    7. `daycare-ban-tru` (Care): Joyful Pet Daycare & Socialization | Active & Healthy | From 180,000 VND / day.
    8. `pet-hotel-resort` (Care): 5-Star Luxury Pet Resort & Suite Hotel | 5-Star Luxury | From 280,000 VND / night.
    9. `pet-taxi-dua-don` (Care): Door-to-Door Dedicated Pet Taxi Service | Door-to-Door Convenience | From 90,000 VND / trip.
  - Toàn bộ các trường dữ liệu con bao gồm: `ten_dich_vu_en`, `phu_de_en`, `huy_hieu_en`, `gia_tham_khao_en`, `thoi_luong_en`, `mo_ta_en`, mảng tiện ích y khoa `tien_ich_en`, mảng quy trình lâm sàng `quy_trinh_en` đều đã được lưu trữ vĩnh viễn trong cơ sở dữ liệu Supabase.
- **Hiển thị giao diện người dùng**:
  - Khi chuyển sang **English**: Cả 2 nhóm dịch vụ (`Veterinary & Medical` và `Care & Lodging`) hiển thị 100% tiếng Anh trên danh sách thẻ, bảng chi tiết bên phải (Desktop), giao diện Accordion đổ xuống (Mobile), cũng như bộ chọn dịch vụ trong form đặt lịch hẹn [`BookingSection.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/BookingSection.tsx).

---

## 19. HỆ THỐNG CƠ SỞ & BẢN ĐỒ CHỈ ĐƯỜNG TRỰC QUAN SONG NGỮ TOÀN DIỆN (CLINIC NETWORK & ADMIN MIRRORING)
- **Tập tin liên quan**: 
  - Giao diện Trang chủ: [`src/components/LocationsSection.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/LocationsSection.tsx)
  - Trang chi tiết con: [`src/app/chi-nhanh/[id]/page.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/app/chi-nhanh/[id]/page.tsx), [`src/components/ChiNhanhDetailClient.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/ChiNhanhDetailClient.tsx), [`src/components/ArticleContent.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/ArticleContent.tsx)
  - Quản trị Admin: [`src/app/admin/page.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/app/admin/page.tsx)
  - Bộ máy dịch thuật: [`src/app/api/admin/translate/route.ts`](file:///c:/Users/Windows%2011/Desktop/testtt/src/app/api/admin/translate/route.ts)
  - CSDL & Types: [`src/lib/supabase.ts`](file:///c:/Users/Windows%2011/Desktop/testtt/src/lib/supabase.ts), bảng `public.chi_nhanh`.

### 1. Nâng Cấp Bộ Máy Dịch Thuật Đa Tầng (Hybrid Translation Engine)
- **Giải quyết triệt để lỗi không dịch được bài viết dài (> 500 ký tự)**:
  - Chuyển đổi phương thức gọi Google GTX từ HTTP GET sang HTTP POST với `application/x-www-form-urlencoded`.
  - Phân tách đoạn văn bản thông minh theo thẻ HTML (`</p>`, `</h2>`, `</li>`, `\n\n`) đối với văn bản trên 2000 ký tự và dịch song song.
  - **Bảo toàn thẻ ảnh `<img>` tuyệt đối**: Nhận diện và mã hóa các thẻ `<img ...>` thành token `[[IMG_TAG_x]]` trước khi dịch, sau đó giải mã phục hồi nguyên vẹn URL và thuộc tính ảnh mà không bị AI/Google dịch làm sai lệch đường dẫn.

### 2. Giao Diện Trang Chủ (`LocationsSection.tsx`)
- Tự động chuyển đổi mượt mà toàn bộ trường thông tin sang English:
  - Nút chọn cơ sở: `ten_ngan_en` $\rightarrow$ `ten_ngan`.
  - Huy hiệu khu vực / quận: `khu_vuc_en` $\rightarrow$ `khu_vuc`.
  - Địa chỉ: `dia_chi_en` $\rightarrow$ `dia_chi`.
  - Giờ hoạt động: `gio_hoat_dong_en` $\rightarrow$ `gio_hoat_dong`.
  - Danh sách trang thiết bị & tiện ích 5 sao: Sử dụng mảng `tien_ich_en` khi ở chế độ English.
  - Thông tin bác sĩ trưởng cơ sở: `bac_si_phu_trach_en` & học vị `bang_cap_bac_si_en`.
  - Thông tin bãi đỗ xe: `thong_tin_do_xe_en`.
  - Các nút hành động: *"View Clinic Details"* (`/chi-nhanh/[id]`), *"Directions"*, *"Open in Google Maps"*, *"Reviews on Google"*.

### 3. Trang Con Chi Tiết Chi Nhánh (`/chi-nhanh/[id]`)
- Sử dụng Client Component [`ChiNhanhDetailClient.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/ChiNhanhDetailClient.tsx) kết nối trực tiếp với `useLanguage()`:
  - Breadcrumb định hướng: *"Trang Chủ"* $\leftrightarrow$ *"Home"*, *"Hệ Thống Cơ Sở"* $\leftrightarrow$ *"Clinic Network"*.
  - Tiêu đề Hero Banner, địa chỉ, giờ hoạt động, hotline, nút chỉ đường và nút quay lại danh sách cơ sở đều chuyển đổi tức thì.
  - Cột bên phải (Sidebar): Form tư vấn hỗ trợ, đường dây nóng cấp cứu 24/7, câu hỏi thường gặp về cơ sở.
  - **Nội dung bài viết chi tiết**: Truyền `htmlEn={branch.bai_viet_chi_tiet_en}` vào [`ArticleContent.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/ArticleContent.tsx), tự động render bài viết tiếng Anh đầy đủ hình ảnh minh họa khi người dùng đổi ngôn ngữ.

### 4. Quản Trị Admin (`/admin` - Chỉnh Sửa Chi Nhánh Bệnh Viện)
- **Đồng bộ bố cục giao diện 1:1 giữa Bản Tiếng Việt và Bản English**:
  - Khi chuyển sang tab `Bản English`, toàn bộ form có **giao diện và cấu trúc hoàn toàn y hệt tiếng Việt** (không còn tình trạng hiện ô nhỏ bên trên):
    - Dòng 1: Tên chi nhánh đầy đủ (English) | Tên ngắn hiển thị thẻ (English) | Khu vực / Quận (English).
    - Dòng 2: Địa chỉ chi nhánh (English) | Hotline dùng chung | Giờ hoạt động (English).
    - Dòng 3: Bác sĩ phụ trách (English) | Học vị / Bằng cấp bác sĩ (English) | Thứ tự sắp xếp | Trạng thái hoạt động.
    - Dòng 4: Link Google Maps Embed | Link Google Maps App.
    - Dòng 5: Thông tin bãi đỗ xe & hỗ trợ (English) | Tiện ích & Trang thiết bị (English - Mỗi mục trên 1 dòng).
    - Dòng 6: Ảnh bìa chi nhánh & Căn chỉnh tâm điểm ảnh.
    - Dòng 7: Trình soạn thảo văn bản phong phú `RichTextEditor` cho bài viết chi tiết (English) có đầy đủ tính năng tải ảnh lên Supabase Storage `branches/` và nút xem trước ngoài web.
  - **Nút "Chuyển đổi ENG" 1 chạm**: Tự động dịch toàn bộ 10 trường dữ liệu + danh sách tiện ích + **toàn bộ bài viết chi tiết HTML dài** sang tiếng Anh và tự động điền vào tab English.
  - **Công cụ sao chép & dịch chuyên biệt cho bài viết chi tiết**:
    - Nút *"Bê bài viết & ảnh Tiếng Việt qua"*: Sao chép nguyên vẹn bài viết và 100% hình ảnh từ bản Tiếng Việt sang English trong tích tắc.
    - Nút *"Dịch bài viết (giữ nguyên ảnh)"*: Dịch nhanh toàn bộ nội dung sang tiếng Anh, tự động tách thẻ và bảo toàn nguyên vẹn tất cả thẻ `<img ...>` (kể cả ảnh base64 và ảnh lưu trữ Supabase).
  - **Tuân thủ tuyệt đối Quy tắc 3 (Rule 3)**: Không sử dụng bất kỳ thuộc tính `placeholder` nào trong form.

---

## 20. THANH ĐIỀU HƯỚNG HEADER CỐ ĐỊNH & THANH ĐIỀU HƯỚNG NHANH GỘP CHUNG (COMBINED STICKY SUB-BAR)
- **Tập tin liên quan**:
  - Component Header: [`src/components/Header.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/Header.tsx)
  - Trang con Chi Nhánh: [`src/components/ChiNhanhDetailClient.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/ChiNhanhDetailClient.tsx)
  - Trang con Đội Ngũ Y Tế: [`src/app/doi-ngu/page.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/app/doi-ngu/page.tsx)
  - Trang con Bài Viết Cẩm Nang: [`src/app/kien-thuc/[id]/page.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/app/kien-thuc/[id]/page.tsx)
- **Cơ chế hoạt động**:
  - Hỗ trợ cờ thuộc tính `alwaysVisible?: boolean` trên component [`Header.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/Header.tsx). Khi bật `alwaysVisible`, thanh Header (kính mờ sang trọng, viền laser ngọc lục bảo chuyển động, Logo Pet M&M vàng kim/xanh ngọc, menu dropdown đa tầng, nút đổi ngôn ngữ EN/VI, hotline gọi nhanh và nút Đặt Lịch Hẹn) luôn ghim cố định ở đỉnh màn hình (`fixed top-0 inset-x-0 z-50 shadow-md`) ngay từ khi tải trang và duy trì cố định mượt mà khi người dùng cuộn chuột xuống nội dung bên dưới.
  - **Gộp 2 thanh (Breadcrumbs + Thanh thông tin nhanh) thành 1 thanh duy nhất (`ChiNhanhDetailClient.tsx`)**:
    - Thay vì hiển thị 2 thanh rời rạc (thanh Breadcrumbs phía trên và thẻ card hotline/giờ mở cửa/chỉ đường phía dưới chiếm nhiều diện tích), toàn bộ đã được **gom chung vào 1 thanh điều hướng hợp nhất**.
    - **Cố định ngay bên dưới thanh Header khi cuộn trang (`sticky top-[60px] sm:top-[68px] z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs`)**: Khi người dùng cuộn chuột đọc bài viết bên dưới, thanh này trượt lên và khóa chặt ngay sát mép dưới của thanh Header chính, giúp người dùng luôn theo dõi được lộ trình breadcrumb, số hotline gọi nhanh, giờ mở cửa và nút Chỉ đường Google Maps mà không cần cuộn ngược lên đầu trang.
    - **Bố cục Desktop (`lg:flex`)**: 1 dòng ngang cân xứng hoàn hảo — Cột trái là thanh Breadcrumb định hướng, Cột phải là Pill hotline, Pill giờ mở cửa và Nút chỉ đường màu xanh ngọc bích chuẩn y khoa.
    - **Bố cục Mobile (`lg:hidden`)**: 2 dòng tinh tế — Dòng 1 là Breadcrumb cuộn ngang, Dòng 2 là Hotline + Giờ + Nút chỉ đường có phân tách viền mờ tinh gọn.
  - Tích hợp cửa sổ Đặt Lịch Hẹn (`BookingModal`) đồng bộ trực tiếp khi người dùng bấm nút "Đặt Lịch" trên Header tại các trang con.

---

## 21. HỆ THỐNG SONG NGỮ TOÀN DIỆN CHO CẨM NANG & KIẾN THỨC Y KHOA (PET HEALTH, WELLNESS & PRACTICAL CARE INSIGHTS)
- **Tập tin liên quan**:
  - Trang chủ: [`src/components/KnowledgeSection.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/KnowledgeSection.tsx)
  - Trang con chi tiết bài viết: [`src/app/kien-thuc/[id]/page.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/app/kien-thuc/[id]/page.tsx)
  - Client component trang con: [`src/components/KienThucDetailClient.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/KienThucDetailClient.tsx)
  - Trình hiển thị nội dung & cuộn bảng: [`src/components/ArticleContent.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/ArticleContent.tsx)
  - Trang Quản trị: [`src/app/admin/page.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/app/admin/page.tsx)
  - Định nghĩa Type: [`src/lib/supabase.ts`](file:///c:/Users/Windows%2011/Desktop/testtt/src/lib/supabase.ts)

### 1. Cơ Sở Dữ Liệu (`public.bai_viet`)
- Mở rộng đầy đủ các trường song ngữ:
  - `tieu_de_en`: Tiêu đề bài viết tiếng Anh.
  - `chuyen_muc_en`: Tên chuyên mục cẩm nang tiếng Anh (vd: *Preventive Medicine, Pet First Aid, Pet Care & Spa*).
  - `mo_ta_ngan_en`: Tóm tắt ngắn hiển thị trên thẻ card ngoài trang chủ.
  - `noi_dung_en`: Nội dung chi tiết bài viết tiếng Anh (hỗ trợ cả WYSIWYG HTML và Markdown, bảo toàn toàn bộ ảnh).
  - `thoi_gian_doc_en`: Thời gian đọc dự kiến tiếng Anh (vd: *4 min read, 5 min read*).
  - `tac_gia_en`: Tên và học vị tác giả tiếng Anh (vd: *Dr. Nguyen Minh Tuan, Specialist I, MSc. DVM Tran Hoang Oanh*).
- Đã hoàn tất dịch thuật và nạp dữ liệu tiếng Anh chuẩn y khoa cho toàn bộ các bài viết hiện hữu.

### 2. Trang Chủ (`KnowledgeSection.tsx`)
- Kết nối tự động với `useLanguage()`:
  - Huy hiệu chuyên mục: *"CẨM NANG BÁC SĨ PET M&M"* $\leftrightarrow$ *"VETERINARY MEDICAL GUIDE"*.
  - Tiêu đề chính: *"Kiến Thức & Kinh Nghiệm Nuôi Thú Cưng"* $\leftrightarrow$ *"Pet Health, Wellness & Practical Care Insights"*.
  - Đoạn giới thiệu y khoa tự động dịch theo ngôn ngữ.
  - Mỗi thẻ bài viết hiển thị song ngữ: Chuyên mục, thời gian đọc, tiêu đề, tóm tắt nội dung, nút *"Đọc tiếp"* $\leftrightarrow$ *"Read article"*.
  - Bộ dữ liệu mặc định fallback (`DEFAULT_ARTICLES`) được trang bị sẵn phiên bản tiếng Anh hoàn chỉnh.

### 3. Trang Con Chi Tiết Bài Viết (`/kien-thuc/[id]`)
- Tái cấu trúc theo kiến trúc tối ưu: Server Page (`page.tsx`) kết hợp Client Component (`KienThucDetailClient.tsx`):
  - **Chuyển đổi ngôn ngữ tức thì 0ms** khi bấm nút EN/VI trên Header mà không cần tải lại trang.
  - Thanh Breadcrumbs định hướng ghim cố định ngay dưới Header khi cuộn (`sticky top-[60px] sm:top-[68px] z-30`): *"Trang chủ"* $\leftrightarrow$ *"Home"*, *"Cẩm nang kiến thức"* $\leftrightarrow$ *"Veterinary Guide"*, tiêu đề bài viết.
  - Hero Banner y khoa: Hiển thị chuyên mục, thời gian đọc, tiêu đề, tác giả, ngày đăng chuẩn song ngữ.
  - Khung tóm tắt bài viết mở đầu và ảnh bìa phóng lớn chuẩn phong cách tạp chí y khoa.
  - **Nội dung bài viết chi tiết**: Render mượt mà qua component [`ArticleContent.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/ArticleContent.tsx), tự động wrap bảng biểu vào container cuộn ngang và chuyển đổi tức thì sang `noi_dung_en`.
  - Khối tác giả & bảo chứng y khoa: Biểu tượng khiên bảo vệ y khoa, tên bác sĩ, chức danh kiểm định y khoa, nút *"Đặt Lịch Thăm Khám"* $\leftrightarrow$ *"Book an Appointment"*.
  - Hộp khuyến cáo y khoa & danh sách bài viết liên quan (Related Insights) hoàn toàn song ngữ.
  - Cột bên phải (Sidebar): Form tư vấn nhanh, FAQ cẩm nang, Hộp hỗ trợ trực tuyến.

### 4. Quản Trị Admin (`/admin` - Quản Lý Bài Viết Cẩm Nang)
- **Đồng bộ bố cục giao diện 1:1 chuẩn xác giữa Bản Tiếng Việt và Bản English**:
  - Giao diện tab `Bản English` có cấu trúc giống hệt tiếng Việt:
    - Dòng 1: Tiêu đề bài viết (English) | Chuyên mục bài viết (English) | Tác giả / Bác sĩ phụ trách (English).
    - Dòng 2: Thời gian đọc dự kiến (English) | Ngày đăng bài | Thứ tự sắp xếp | Trạng thái hiển thị (Xuất bản / Bản nháp).
    - Dòng 3: Ảnh bìa bài viết (Dùng chung) | Tóm tắt ngắn (English).
    - Dòng 4: Trình soạn thảo văn bản phong phú `RichTextEditor` cho bài viết chi tiết (English) có đầy đủ tính năng tải ảnh lên Supabase Storage `articles/`.
  - **Nút "Chuyển đổi ENG" AI 1 chạm**: Dịch tự động toàn bộ 6 trường (Tiêu đề, Chuyên mục, Tóm tắt, Nội dung HTML dài, Tác giả, Thời gian đọc) sang tiếng Anh chuẩn xác.
  - **Bộ công cụ bài viết tiếng Anh chuyên biệt**:
    - Nút *"Bê bài viết & ảnh Tiếng Việt qua"*: Sao chép nguyên vẹn nội dung và 100% hình ảnh sang English để dễ dàng chỉnh sửa đối chiếu.
    - Nút *"Dịch bài viết (giữ nguyên ảnh)"*: Dịch nội dung bài viết sang tiếng Anh, tự động bảo toàn nguyên vẹn tất cả các thẻ hình ảnh `<img ...>`.
    - Nút *"Xem trang ngoài web"*: Mở trực tiếp bài viết ngoài trang web thực tế.
  - **Tuân thủ tuyệt đối Quy tắc 3 (Rule 3)**: Không sử dụng bất kỳ thuộc tính `placeholder` nào trong form.

### 5. Tối Ưu Tốc Độ Chuyển Trang View Con (`/kien-thuc/[id]`) Cực Nhanh
- **Triệt tiêu gánh nặng dung lượng 160KB**:
  - Bài viết 1 trước đây chứa chuỗi ảnh base64 trực tiếp trong mã HTML dài hơn 160.000 ký tự. Đã trích xuất và tải ảnh lên Supabase Storage CDN (`articles/vaccine_guide_1790858785846.png`), giảm dung lượng bài viết từ **160,053 ký tự xuống còn 894 ký tự** (~giảm hơn 180 lần).
- **Chạy song song qua `Promise.all`**:
  - `page.tsx` chuyển từ chạy tuần tự (waterfall) sang thực thi đồng thời cả 2 truy vấn `getArticle(id)` và `getRelatedArticles(id)` qua `Promise.all`, rút ngắn 50% độ trễ mạng.
- **Tinh gọn danh sách bài viết liên quan**:
  - Chỉ truy vấn đúng 7 trường hiển thị thẻ card (`id, tieu_de, tieu_de_en, chuyen_muc, chuyen_muc_en, hinh_anh, ngay_dang`), loại bỏ hoàn toàn việc tải nội dung bài viết dài của các bài khác vào bộ nhớ.
- **Kích hoạt `prefetch={true}` & Soft Navigation**:
  - Bổ sung `prefetch={true}` trên toàn bộ các thẻ `<Link>` tại trang chủ ([`KnowledgeSection.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/KnowledgeSection.tsx)), menu đa tầng ([`NavDesktopMenu.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/NavDesktopMenu.tsx)), ngăn kéo menu mobile ([`Header.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/Header.tsx)) và sidebar chi nhánh ([`ChiNhanhDetailClient.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/ChiNhanhDetailClient.tsx)).
  - Next.js tự động tải trước gói dữ liệu trong nền ngay khi link xuất hiện trên màn hình, giúp việc nhấp chuột chuyển trang đạt phản hồi tức thì.

---

## 22. ĐỒNG BỘ GIAO DIỆN SONG NGỮ & DỊCH THUẬT TRIỆT ĐỂ CHO QUẢN LÝ DANH MỤC DỊCH VỤ (SERVICES MANAGEMENT)
- **Tập tin liên quan**:
  - Trang Quản trị: [`src/app/admin/page.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/app/admin/page.tsx)
  - API Dịch tự động: [`src/app/api/admin/translate/route.ts`](file:///c:/Users/Windows%2011/Desktop/testtt/src/app/api/admin/translate/route.ts)
  - Cấu trúc dữ liệu & Types: [`src/lib/supabase.ts`](file:///c:/Users/Windows%2011/Desktop/testtt/src/lib/supabase.ts)
  - Hiển thị dịch vụ Frontend: [`src/components/ServicesSection.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/ServicesSection.tsx)

### 1. Đồng Bộ 100% Bố Cục Giao Diện Giữa Tab Tiếng Việt và Tab English Trong Modal Dịch Vụ
- **Cấu trúc song sinh (Twin Layout)**: Cả 2 tab `Bản Tiếng Việt` và `Bản English` có cấu trúc lưới đối xứng hoàn toàn:
  - **Hàng 1 (2 cột)**: Tên gói dịch vụ (Tiếng Việt / English) * | Phụ đề & Thông điệp ngắn (Tiếng Việt / English).
  - **Hàng 2 (2 cột)**: Huy hiệu nổi bật góc ảnh (Tiếng Việt / English) | Chi phí tham khảo (Tiếng Việt / English).
  - **Hàng 3 (1 cột)**: Thời lượng ước tính (Tiếng Việt / English).
  - **Hàng 4 (1 cột)**: Mô tả chi tiết nội dung dịch vụ (Tiếng Việt / English - textarea 3 dòng).
  - **Hàng 5 (2 cột song song)**: Tiện ích & Cam kết chuẩn mực y khoa (Tiếng Việt / English, mỗi dòng một mục, font-mono) | Quy trình thực hiện (Tiếng Việt / English, mỗi dòng một bước, font-mono).
- **Tách riêng khối cài đặt dùng chung**: Các trường dữ liệu phi ngôn ngữ được chuyển xuống dưới đường kẻ phân cách:
  - Nhóm phân loại dịch vụ: * (`Thú Y & Y Tế Chuyên Sâu` / `Chăm Sóc & Lưu Trú 5 Sao`).
  - Thứ tự sắp xếp.
  - Hình ảnh dịch vụ (`AdminImageInput`) tích hợp upload + dán ảnh trực tiếp từ clipboard, kèm 2 khung preview (ảnh nhỏ ở danh sách 16x16 và ảnh lớn ở khung chi tiết).
  - Hai checkbox trạng thái: `Đánh dấu là gói nổi bật 5★` và `Kích hoạt hiển thị trên web`.
- Không bị tình trạng mất trường hoặc bố cục xô lệch khi chuyển đổi giữa tab Tiếng Việt và English.

### 2. Dịch Tự Động AI Triệt Để & Bảo Toàn Định Dạng Xuống Dòng
- **Bảo toàn 100% ngắt dòng từng mục**:
  - Danh sách Tiện ích (`serviceFeaturesInput`) và Quy trình thực hiện (`serviceWorkflowInput`) được tách mảng theo từng dòng riêng rẽ (`split('\n')`), dịch song song qua endpoint API `{ texts: [...] }`.
  - Kết quả trả về được ghép lại bằng ký tự xuống dòng `\n`, triệt tiêu hoàn toàn lỗi dính chữ hoặc dồn tất cả các gạch đầu dòng thành một câu dài.
- **Tự động điền & chuyển tab**:
  - Điền trọn vẹn toàn bộ các trường `_en` (`ten_dich_vu_en`, `phu_de_en`, `huy_hieu_en`, `gia_tham_khao_en`, `thoi_luong_en`, `mo_ta_en`, `serviceFeaturesEnInput`, `serviceWorkflowEnInput`).
  - Tự động kích hoạt chuyển sang tab `Bản English` ngay khi hoàn tất để quản trị viên dễ dàng duyệt lại.

### 3. Đồng Bộ Toàn Diện Lưu Trữ Supabase
- Hàm `handleSaveService` đã bổ sung lưu trữ đầy đủ các trường `_en` vào bảng `dich_vu`:
  - `ten_dich_vu_en`, `phu_de_en`, `huy_hieu_en`, `gia_tham_khao_en`, `thoi_luong_en`, `mo_ta_en`.
  - `tien_ich_en`: mảng `string[]` phân tách theo từng dòng.
  - `quy_trinh_en`: mảng `string[]` phân tách theo từng dòng.
- Sửa lỗi trước đây khiến bản dịch tiếng Anh bị mất sạch khi bấm Lưu Dịch Vụ.

### 4. Khắc Phục Lỗi Build Vercel (Error: supabaseKey is required)
- Tạo module `src/lib/supabaseAdmin.ts` với cơ chế lazy-init qua Proxy và fallback an toàn sang Anon Key, ngăn chặn lỗi crash biên dịch tại bước `Collecting page data` trên Vercel khi chưa cấu hình `SUPABASE_SERVICE_ROLE_KEY`.

---

## 23. TỔNG HỢP NÂNG CẤP HỆ THỐNG TUYỂN DỤNG & TỐI ƯU ĐIỀU HƯỚNG QUẢN TRỊ ADMIN
- **Tập tin liên quan**:
  - Trang Quản trị: [`src/app/admin/page.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/app/admin/page.tsx)
  - Quản lý Tuyển dụng: [`src/components/AdminCareersManager.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/AdminCareersManager.tsx)
  - Giao diện Tuyển dụng ngoài Frontend: [`src/components/TuyenDungListClient.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/TuyenDungListClient.tsx)

### 1. Đồng Bộ Bố Cục Sidebar Menu Quản Trị & Lược Bỏ Thanh Tab Con Trong Nội Dung
- **Sidebar Menu Đa Tầng Cho Đội Ngũ Y Tế**:
  - Tái cấu trúc mục **Đội Ngũ Y Tế** trên Sidebar của Admin tương tự như **Câu Hỏi Thường Gặp**:
    - Mục cha: `👤 Đội Ngũ Y Tế` (hiển thị số lượng nhân sự).
    - Phân nhánh con 1: `• Danh sách bác sĩ ({teamMembers.length})` ➔ Quản lý bác sĩ, điều dưỡng & lãnh đạo chuyên môn.
    - Phân nhánh con 2: `💼 Tuyển dụng & Vị trí mở` ➔ Quản lý tin tuyển dụng và vị trí mở.
  - Chuyển hướng tab mượt mà ngay trên menu điều hướng bên trái, loại bỏ các bước thao tác trung gian.
- **Lược Bỏ Hoàn Toàn 2 Thanh Sub-Tab Bar Ngang Trong Vùng Nội Dung**:
  - Gỡ bỏ thanh chọn sub-tab của **Câu Hỏi Thường Gặp** (`[ Danh Sách Câu Hỏi FAQ ] [ Mục "Bạn Cần PetM&M Hỗ Trợ?" ]`).
  - Gỡ bỏ thanh chọn sub-tab của **Đội Ngũ Y Tế** (`[ Đội Ngũ Bác Sĩ & Chuyên Gia ] [ Tuyển Dụng & Vị Trí Mở ]`).
  - Toàn bộ điều hướng giờ đây tập trung 100% tại thanh Sidebar bên trái, giúp giao diện nội dung sạch sẽ, thoáng đãng và chuẩn UX hiện đại.

### 2. Tinh Gọn & Tự Động Hóa Form Tuyển Dụng (Admin Careers Manager)
- **Tự động sinh Slug & Ẩn hoàn toàn khỏi Form**:
  - Hệ thống tự động chuyển đổi từ `Tiêu đề vị trí` sang slug đường dẫn chuẩn SEO (hỗ trợ chuyển đổi toàn bộ ký tự tiếng Việt có dấu sang không dấu, loại bỏ ký tự đặc biệt).
  - Ẩn hoàn toàn ô nhập `Mã định danh (Slug đường dẫn)` khỏi cả giao diện thêm mới và chỉnh sửa vị trí tuyển dụng.
- **Tái bố trí trường Ảnh bìa**:
  - Đưa trường **Ảnh bìa vị trí tuyển dụng** lên đầu form để tạo ấn tượng thị giác ngay khi mở modal.
  - Tích hợp công nghệ tải ảnh từ thiết bị và dán trực tiếp (`Ctrl+V`) từ clipboard.
- **Xóa sạch toàn bộ placeholder và chú thích rườm rà**:
  - Triệt để tuân thủ **Quy tắc 3 (Rule 3)**: Xóa 100% thuộc tính `placeholder` trong tất cả các ô nhập (`input`, `textarea`).
  - Lược bỏ mọi dòng chú thích trong ngoặc đơn rườm rà bên cạnh nhãn trường, giữ giao diện nhập liệu tối giản và thanh lịch.
- **Chuẩn hóa thanh tab ngôn ngữ**:
  - Chuyển đổi thanh tab ngôn ngữ dạng pill hiện đại `[ 🇻🇳 Bản Tiếng Việt ] [ 🇬🇧 Bản English ]` bên trái và nút `✨ Chuyển đổi ENG` bên phải.
  - Tính năng AI dịch song ngữ 1 chạm cho toàn bộ thông tin tuyển dụng sang tiếng Anh.

### 3. Tối Giản Hóa Trang Danh Sách Tuyển Dụng Ngoài Frontend (`/tuyen-dung`)
- Gỡ bỏ khối Hero Banner xanh rườm rà ở đầu trang danh sách tuyển dụng.
- Giữ bố cục trang tập trung vào tiêu đề nghệ thuật `Gia Nhập Đại Gia Đình PetM&M` đồng bộ hiệu ứng chuyển động và danh sách các vị trí mở.

---

## 24. TỐI ƯU TRẢI NGHIỆM DI ĐỘNG & TINH GIẢN GIAO DIỆN CÁC PHÂN MỤC TRANG CHỦ

- **Tập tin liên quan**:
  - Giới thiệu & Triết lý y khoa: [`src/components/AboutSection.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/AboutSection.tsx)
  - Cẩm nang bác sĩ: [`src/components/KnowledgeSection.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/KnowledgeSection.tsx)
  - Đánh giá từ khách hàng: [`src/components/ReviewsSection.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/ReviewsSection.tsx)
  - Tuyển dụng & Vị trí mở: [`src/components/CareersSection.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/CareersSection.tsx)

### 1. Hiệu Ứng Lật Trang 3D (Paper Page Flip) & Khắc Phục Lỗi Chồng Đè Ảnh Trong Phần Giới Thiệu
- **Ẩn 2 nút điều hướng `<>` trên điện thoại**:
  - Chuyển class 2 nút lùi/tiến thành `hidden sm:flex`, ẩn hoàn toàn trên màn hình di động (<640px) và chỉ hiển thị trên máy tính bảng / laptop.
- **Hiệu ứng lật trang giấy 3D (Paper Page Flip)**:
  - Tích hợp chuyển động 3D xoay trục gáy trang (`origin-left [transform:rotateY(-115deg)_scale(0.95)]`) mô phỏng cảm giác lật mở trang sách chân thực.
  - Hỗ trợ đầy đủ cử chỉ vuốt tay trên điện thoại (`onTouchStart`, `onTouchMove`, `onTouchEnd`) và kéo chuột trên máy tính (`onMouseDown`, `onMouseUp`, `onMouseLeave`).
- **Khắc phục triệt để lỗi chồng đè ảnh PNG trong suốt & phụ đề**:
  - **Nguyên nhân**: Ảnh logo chữ "PET M&M" trong bảng `hinh_anh` (`chuyen_muc = 'gioi_thieu'`) là định dạng PNG nền trong suốt. Trước đây, slide tiếp theo vẫn giữ `opacity-100` khi ở trạng thái nghỉ, đồng thời khung slide thiếu màu nền đặc, khiến ảnh 3 bác sĩ và dòng phụ đề của slide sau bị lọt và chồng đè lên nhau.
  - **Giải pháp**:
    1. Bổ sung nền tối sang trọng `bg-slate-950` cho từng thẻ slide con.
    2. Khi ở trạng thái nghỉ (`!isFlipping`), **chỉ duy nhất `currentSlide` có `opacity-100 z-10`**, tất cả các slide khác đều được ẩn triệt để bằng `hidden opacity-0 pointer-events-none`.
    3. Quản lý trạng thái chuyển đổi với `animatingFrom`, `flipDirection` và `isFlipping` trong 700ms, đảm bảo chuyển động mượt mà và không bao giờ xảy ra hiện tượng xuyên nền hay đè chữ.

### 2. Ẩn 2 Nút Điều Hướng `<>` Trên Điện Thoại Cho Cẩm Nang & Đánh Giá
- **Cẩm nang y khoa (`KnowledgeSection.tsx`)**:
  - Nút lùi ◁ và tiến ▷ được cấu hình `hidden sm:flex`, không còn xuất hiện che mất thẻ bài viết trên điện thoại.
  - Người dùng di động lướt chạm ngang (Touch Swipe) tự nhiên với hiệu ứng cuộn mượt (`snap-x snap-mandatory`).
- **Đánh giá khách hàng (`ReviewsSection.tsx`)**:
  - Nút lùi ◁ và tiến ▷ được cấu hình `hidden sm:flex`.
  - Trên điện thoại người dùng vuốt trượt ngang xem đánh giá gọn gàng, nút `<>` chỉ xuất hiện trên tablet và laptop khi danh sách có thể cuộn tiếp.

### 3. Tinh Gọn & Chuyển Đổi Kanban Tuyển Dụng Thành Hàng Ngang Trượt Chạm (`CareersSection.tsx`)
- **Dàn hàng ngang trượt chạm mượt mà (Horizontal Slider)**:
  - Thay thế bố cục lưới tĩnh (`grid-cols-1 md:grid-cols-3`) bằng danh sách hàng ngang cuộn mượt (`flex overflow-x-auto snap-x snap-mandatory`).
  - **Trên điện thoại**: Thẻ tuyển dụng hiển thị theo hàng ngang (`w-[84vw]`), vuốt chạm trượt qua lại dễ dàng, ẩn hoàn toàn 2 nút `<>`.
  - **Trên laptop / máy tính**: Khi danh sách vị trí việc làm nhiều vượt quá chiều ngang màn hình, tự động kích hoạt tính năng trượt ngang và hiển thị **2 nút điều hướng `<>`** ở hai bên mép.
- **Lược bỏ thông tin rườm rà**:
  - Gỡ bỏ đoạn văn mô tả dài: *"Kiến tạo sự nghiệp vững chắc trong môi trường bệnh viện thú y chuẩn Fear-Free 5 sao quốc tế..."*.
  - Gỡ bỏ hoàn toàn 3 khối giá trị cốt lõi: *"Chuẩn Lâm Sàng Fear-Free"*, *"Đào Tạo & Thăng Tiến"*, *"Đãi Ngộ & Phúc Lợi VIP"*.
  - Bố cục khu vực Tuyển Dụng hiện tại đi thẳng từ tiêu đề nghệ thuật `Gia Nhập Đại Gia Đình PetM&M` vào thanh trượt danh sách các vị trí ứng tuyển, tạo cảm giác thông thoáng, hiện đại và tập trung.

### 4. Quy Trình & Lệnh Triển Khai Trực Tiếp Lên Vercel Production
- **Tài khoản Vercel CLI**: `thaitrtingemini-5036` (đã xác thực và liên kết với project `thai-trung-tins-projects/petsmm`).
- **Tên miền sản phẩm (Production URL)**: `https://petsmm.vercel.app` (Aliased tự động).
- **Lệnh triển khai trực tiếp từ terminal (không cần đi qua trung gian)**:
  ```bash
  # Cách 1 (qua npm script trong package.json)
  npm run deploy

  # Cách 2 (lệnh trực tiếp Vercel CLI)
  npx vercel --prod --yes
  ```
- **Lưu ý quy trình khi cập nhật code mới**:
  1. Chạy `npx tsc --noEmit` để đảm bảo 0 lỗi biên dịch.
  2. Commit và push lên GitHub: `git add . ; git commit -m "..." ; git push origin main`.
  3. Deploy ngay lên Vercel: `npx vercel --prod --yes`.

---

## 25. KẾ HOẠCH & NHIỆM VỤ PHÁT TRIỂN TIẾP THEO (ROADMAP / NEXT STEPS)

Khi AI Agent hoặc lập trình viên mở phiên làm việc mới, hãy đọc các mục dưới đây để nắm ngay các hạng mục cần triển khai tiếp theo:

### 1. Quản Trị Đơn Ứng Tuyển & Hồ Sơ Ứng Viên (Job Applications Management)
- **Mục tiêu**: Xây dựng phân hệ tiếp nhận hồ sơ ứng tuyển của ứng viên tại trang Quản trị (`/admin`).
- **Chi tiết**:
  - Tạo bảng `ho_so_tuyen_dung` trên Supabase: Lưu họ tên ứng viên, số điện thoại, email, vị trí ứng tuyển (`tuyen_dung_id`), link CV file đính kèm (upload lên Storage bucket), thư giới thiệu/lời nhắn, trạng thái duyệt (`moi_ung_tuyen`, `da_lien_he`, `hen_phong_van`, `trung_tuyen`, `tu_choi`).
  - Form nộp hồ sơ tại trang chi tiết tuyển dụng Frontend ([`TuyenDungDetailClient.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/TuyenDungDetailClient.tsx)): Kết nối form gửi CV trực tiếp vào bảng trên.
  - Tab "Hồ sơ ứng viên" trong mục Tuyển Dụng tại Admin: Cho phép quản trị viên xem danh sách, lọc theo vị trí, tải file CV và cập nhật trạng thái liên hệ.

### 2. Tự Động Hóa Thông Báo Email & Zalo Cho Khách Đặt Lịch & Ứng Tuyển
- Tích hợp gửi email tự động (qua Nodemailer / Resend / SendGrid) khi:
  - Khách hàng hoàn tất đặt lịch khám thành công (gửi kèm vé khám điện tử).
  - Ứng viên nộp hồ sơ tuyển dụng thành công.
  - Thông báo email khẩn về hòm thư lễ tân / HR khi có lịch hẹn hoặc ứng viên mới.

### 3. Tối Ưu Hóa Hiệu Năng & Trải Nghiệm Responsive
- Kiểm tra toàn diện hiển thị trên các kích thước màn hình phổ biến: iPhone (375px - 430px), iPad / Tablet (768px - 1024px), Laptop (1366px - 1920px).
- Đảm bảo tất cả các hình ảnh tải lên từ Supabase Storage được nạp nhanh và tối ưu SEO (alt tag đầy đủ).

---

## 26. HỆ THỐNG TỰ ĐỘNG TIẾP NHẬN HỒ SƠ ỨNG TUYỂN & GỬI EMAIL TUYỂN DỤNG TRỰC TIẾP (RECRUITMENT APPLICATION ENGINE & RATE LIMITING)
- **Tập tin liên quan**:
  - API Tuyển dụng: [`src/app/api/recruitment/apply/route.ts`](file:///c:/Users/Windows%2011/Desktop/testtt/src/app/api/recruitment/apply/route.ts)
  - Hệ thống gửi email tự động: [`src/lib/mailer.ts`](file:///c:/Users/Windows%2011/Desktop/testtt/src/lib/mailer.ts) (`sendRecruitmentApplicationEmail`)
  - Giao diện chi tiết tuyển dụng: [`src/components/TuyenDungDetailClient.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/components/TuyenDungDetailClient.tsx)
  - Bảng dữ liệu Supabase: `public.ho_so_tuyen_dung` (kết nối Supabase Storage bucket `cv_files`)

### 1. Bối Cảnh & Nâng Cấp Chức Năng (Direct Email & Instant Application)
- **Trước đây**: Ứng viên bấm ứng tuyển thì mở liên kết `mailto:` hoặc phải sao chép nội dung email thủ công để tự gửi, trải nghiệm rời rạc và dễ thất lạc hồ sơ.
- **Sau nâng cấp (Tương tự hệ thống Đặt Lịch Khám)**:
  - Ứng viên nhập thông tin (Họ tên, SĐT, Email, Tải file CV trực tiếp lên Storage bucket `cv_files` hoặc dán link Google Drive/LinkedIn, lời tự giới thiệu).
  - Bấm **"Gửi Hồ Sơ Ứng Tuyển Ngay"** $\rightarrow$ Hệ thống tự động ghi nhận vào database `ho_so_tuyen_dung` với trạng thái `moi`.
  - **Tự động gửi email tức thì về Nhà tuyển dụng (HR)**: Tiêu đề dạng `[Hồ Sơ Ứng Tuyển Mới] <Vị trí> - <Họ tên> (<SĐT>)` kèm link xem CV trực tiếp 1 chạm và nút phản hồi nhanh qua điện thoại/email.
  - **Tự động gửi email xác nhận cho Ứng viên**: Xác nhận đã tiếp nhận hồ sơ thành công, thời gian xét duyệt 24 - 48 giờ.
  - **Phiếu tiếp nhận điện tử (Application Receipt Card)**: Hiển thị ngay trên giao diện web với dấu tích xanh tiếp nhận thành công, tóm tắt thông tin nộp và các liên kết điều hướng.

### 2. Tối Ưu Bảo Mật & Quy Tắc Giới Hạn Nghiêm Ngặt (Anti-Spam & Rate Limiting)
- **Quy tắc 1: 1 IP không quá 3 lần ứng tuyển**:
  - API [`/api/recruitment/apply`](file:///c:/Users/Windows%2011/Desktop/testtt/src/app/api/recruitment/apply/route.ts) lấy IP thực tế của client qua các header chuẩn (`x-forwarded-for`, `x-real-ip`, `cf-connecting-ip`).
  - Kiểm tra số lượng hồ sơ đã gửi từ IP này: kết hợp bộ nhớ đệm in-memory cache siêu nhanh và truy vấn đếm trực tiếp trên Supabase `ho_so_tuyen_dung.ip_address`.
  - Nếu số lượt ứng tuyển $\ge 3$, trả về mã HTTP 429 kèm thông báo: *"Bạn đã gửi tối đa 3 lần ứng tuyển từ thiết bị/mạng này. Vui lòng liên hệ trực tiếp phòng Nhân sự qua Hotline hoặc Zalo nếu cần hỗ trợ thêm!"*.
- **Quy tắc 2: 1 Email không ứng tuyển nhiều hơn 1 lần ở 1 vị trí**:
  - **Kiểm tra trực tiếp (Live Check on Blur)**: Khi ứng viên nhập xong email và click ra ngoài (hoặc chuyển ô), component tự động gọi `GET /api/recruitment/apply?email=...&jobId=...`.
  - Nếu email đã nộp vị trí này: Hiển thị ngay cảnh báo viền đỏ nổi bật dưới ô nhập: *"⚠️ Email này đã ứng tuyển vị trí này rồi. Ban nhân sự đang xét duyệt hồ sơ của bạn!"*, đồng thời khóa nút nộp hồ sơ.
  - **Bảo vệ tầng Server (Server-side validation)**: Khi submit qua method POST, server thực hiện truy vấn `ilike('email', cleanEmail).eq('tuyen_dung_id', jobId)` để chặn đứng race-condition hoặc các công cụ gửi request tự động.
- **Quy tắc 3: Bẫy Honeypot ẩn chống Bot Spam**:
  - Form trang bị trường ẩn `hp_website` vô hình với người dùng. Bất kỳ bot tự động nào cố tình điền vào trường này sẽ bị API âm thầm hấp thụ mà không tốn tài nguyên gửi email hay làm rác database.

---

## 27. PHÂN CHIA HẠNG MỤC EMAIL TIẾP NHẬN THÔNG BÁO TỰ ĐỘNG (CATEGORIZED NOTIFICATION EMAILS)
- **Tập tin liên quan**:
  - Giao diện Quản trị Email: [`src/app/admin/page.tsx`](file:///c:/Users/Windows%2011/Desktop/testtt/src/app/admin/page.tsx)
  - API Cấu hình Email: [`src/app/api/admin/email-config/route.ts`](file:///c:/Users/Windows%2011/Desktop/testtt/src/app/api/admin/email-config/route.ts)
  - API Gửi thử nghiệm: [`src/app/api/admin/email-config/test/route.ts`](file:///c:/Users/Windows%2011/Desktop/testtt/src/app/api/admin/email-config/test/route.ts)
  - Bộ máy gửi Email: [`src/lib/mailer.ts`](file:///c:/Users/Windows%2011/Desktop/testtt/src/lib/mailer.ts)
  - Bảng Supabase: `public.cau_hinh` (bổ sung cột `smtp_notify_recruitment_email` và `smtp_notify_contact_email`)

### 1. Phân Chia Hạng Mục Hòm Thư Đến (Recipient Segmentation)
Thay vì dùng chung một hòm thư tiếp nhận (`smtp_notify_email`) cho tất cả các sự kiện, hệ thống đã được chia tách thành 3 phân hệ chuyên trách:
1. **Email Nhận Đặt Lịch Khám (Booking)**: `smtp_notify_email`
   - **Đối tượng**: Lễ tân & Bác sĩ phòng khám tiếp nhận ca khám mới.
   - **Chức năng**: Nhận email tự động chứa mã tiếp nhận, thông tin bé thú cưng, thời gian hẹn, chi nhánh và ghi chú lâm sàng.
   - **Nút gửi thử nghiệm độc lập**: Bấm nút **"Thử"** bên cạnh ô nhập để kiểm tra đường truyền gửi thư đặt lịch ngay lập tức.
2. **Email Nhận Hồ Sơ Tuyển Dụng & CV (Recruitment)**: `smtp_notify_recruitment_email`
   - **Đối tượng**: Ban Nhân Sự (HR).
   - **Chức năng**: Nhận email hồ sơ ứng tuyển mới, số điện thoại, vị trí và link xem/tải CV trực tiếp 1 chạm.
   - **Nút gửi thử nghiệm độc lập**: Bấm nút **"Thử"** để gửi thư test riêng đến hòm thư HR.
3. **Email Nhận Góp Ý & Liên Hệ Chung (Contact)**: `smtp_notify_contact_email`
   - **Đối tượng**: Ban Quản Lý / CSKH.
   - **Chức năng**: Tiếp nhận các câu hỏi chung, thắc mắc dịch vụ hoặc góp ý từ khách hàng.
   - **Nút gửi thử nghiệm độc lập**: Bấm nút **"Thử"** để kiểm tra hòm thư liên hệ.

### 2. Tự Động Điều Hướng & Cơ Chế Dự Phòng (Fallback Mechanism)
- Tại [`src/lib/mailer.ts`](file:///c:/Users/Windows%2011/Desktop/testtt/src/lib/mailer.ts):
  - Tuyển dụng: Hệ thống ưu tiên chọn `smtp_notify_recruitment_email` $\rightarrow$ nếu chưa cài sẽ fallback về `smtp_notify_email` $\rightarrow$ rồi đến `smtp_email` $\rightarrow$ mặc định `tuyendung@petmm.vn`.
  - Đặt lịch khám: Tiếp tục sử dụng `smtp_notify_email` đảm bảo tính nhất quán 100%.
  - API Test [`/api/admin/email-config/test`](file:///c:/Users/Windows%2011/Desktop/testtt/src/app/api/admin/email-config/test/route.ts): Nhận diện linh hoạt trường `target_email` để gửi mẫu kiểm tra tới đúng hòm thư mà quản trị viên muốn thử nghiệm.


