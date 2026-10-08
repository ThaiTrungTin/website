import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================================
// KHÓA BẢO MẬT NỘI BỘ BỆNH VIỆN THÚ Y PETM&M (SECRET ACCESS KEY)
// Dành riêng cho Quản trị viên và Nhân viên phòng khám truy cập /admin và /taodanhgia
// ============================================================================
export const PETMM_SECRET_KEY = process.env.PETMM_SECRET_KEY || '';
const COOKIE_NAME = 'petmm_staff_access';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 ngày

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 0. Hỗ trợ hủy quyền truy cập thiết bị khi cần (?logout_access=1 hoặc ?revoke=1)
  if (searchParams.get('logout_access') === '1' || searchParams.get('revoke') === '1') {
    const res = NextResponse.redirect(new URL('/', request.url));
    res.cookies.delete(COOKIE_NAME);
    return res;
  }

  // 1. Kiểm tra xem URL có kèm mã khóa bí mật hợp lệ không (?key=... hoặc ?pass=... hoặc ?secret=...)
  const providedKey =
    searchParams.get('key') ||
    searchParams.get('pass') ||
    searchParams.get('secret');

  if (providedKey === PETMM_SECRET_KEY) {
    // Chìa khóa hợp lệ!
    // Chuyển hướng sạch về URL gốc (xóa query key trên thanh địa chỉ để tránh bị dòm ngó)
    const cleanUrl = new URL(pathname, request.url);
    const response = NextResponse.redirect(cleanUrl);

    // Ghi nhận thiết bị hợp lệ bằng Cookie bảo mật có thời hạn 30 ngày
    response.cookies.set({
      name: COOKIE_NAME,
      value: PETMM_SECRET_KEY,
      path: '/',
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return response;
  }

  // 2. Kiểm tra xem trình duyệt này đã từng được mở khóa hợp lệ chưa (qua Cookie)
  const staffCookie = request.cookies.get(COOKIE_NAME);
  if (staffCookie && staffCookie.value === PETMM_SECRET_KEY) {
    // Thiết bị hợp lệ của Bệnh viện -> Cho phép truy cập bình thường
    return NextResponse.next();
  }

  // 3. Khách vãng lai / Bot quét dạo không có quyền:
  // Lập tức đẩy văng về Trang chủ (URL '/'), chặn hoàn toàn không cho thấy form login hay giao diện
  return NextResponse.redirect(new URL('/', request.url));
}

// Cấu hình phạm vi bảo vệ: Áp dụng nghiêm ngặt cho /admin và /taodanhgia (cùng các trang con)
export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/taodanhgia',
    '/taodanhgia/:path*',
  ],
};
