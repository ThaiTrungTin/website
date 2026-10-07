import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/adminAuth';
import { sendZaloZnsBookingNotification, sendZaloZnsReviewNotification } from '@/lib/zalo';
import { saveNotificationSettings } from '@/lib/notificationSettings';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('petmm_admin_session')?.value;
    const currentUser = verifyToken(sessionToken);

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Bạn chưa đăng nhập quản trị!' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const phone = (body.phone || body.target_phone || '').trim();

    if (!phone) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập số điện thoại nhận tin Zalo thử nghiệm!' },
        { status: 400 }
      );
    }

    // Nếu người dùng truyền token mới trong form test, lưu tạm vào cấu hình
    if (body.zalo_access_token !== undefined || body.zalo_refresh_token !== undefined) {
      const updates: any = {};
      if (body.zalo_access_token !== undefined) updates.zalo_access_token = String(body.zalo_access_token).trim();
      if (body.zalo_refresh_token !== undefined) updates.zalo_refresh_token = String(body.zalo_refresh_token).trim();
      await saveNotificationSettings(updates);
    }

    const templateType = body.templateType || body.template_type || 'booking';
    const customTemplateId = (templateType === 'review'
      ? (body.zalo_review_template_id || '')
      : (body.zalo_template_id || '')
    ).trim();

    let res: any;
    if (templateType === 'review') {
      const sampleReview = {
        phone,
        customerName: 'Nguyễn Văn An (Khách Thử Nghiệm)',
        orderId: 'HD-' + Math.floor(100000 + Math.random() * 900000),
        reviewCode: 'REV-' + Math.floor(100000 + Math.random() * 900000),
        shopName: '19 Đường Số 1, TP. Thủ Đức',
        address: '19 Đ. Số 1, Phường Phước Long, TP. Thủ Đức',
      };
      console.log(`[Zalo Test API] Gửi thử mẫu Đánh giá ZNS (Template ID: ${customTemplateId || 'mặc định'}) tới SĐT ${phone}...`);
      res = await sendZaloZnsReviewNotification(sampleReview, customTemplateId);
    } else {
      const sampleBooking = {
        phone,
        bookingCode: 'PET-' + Math.floor(100000 + Math.random() * 900000),
        ownerName: 'Nguyễn Văn An (Khách Thử Nghiệm)',
        petName: 'Bé Đậu',
        service: 'Khám tổng quát & Chăm sóc',
        dateTime: '09:30 15/10/2026',
        branchName: '19 Đ. Số 1, Phường Phước Long, TP. Thủ Đức, TP. Hồ Chí Minh',
      };
      console.log(`[Zalo Test API] Gửi thử mẫu Đặt lịch ZNS (Template ID: ${customTemplateId || 'mặc định'}) tới SĐT ${phone}...`);
      res = await sendZaloZnsBookingNotification(sampleBooking, customTemplateId);
    }

    if (res.success && !res.mock) {
      const typeLabel = templateType === 'review' ? 'Đánh Giá Dịch Vụ' : 'Xác Nhận Lịch Hẹn';
      return NextResponse.json({
        success: true,
        message: `Đã gửi tin nhắn Zalo ZNS [${typeLabel}] thành công tới SĐT ${phone}! Vui lòng kiểm tra ứng dụng Zalo trên điện thoại.`,
        data: res.data,
      });
    }

    if (res.mock) {
      return NextResponse.json({
        success: false,
        message: 'Đang ở chế độ mô phỏng do chưa nhập đủ thông số Zalo OA hoặc Zalo đang tắt.',
      });
    }

    // Xử lý mã lỗi cụ thể từ Zalo OpenAPI
    let friendlyMessage = res.message || 'Zalo từ chối gửi tin nhắn ZNS.';
    if (res.error === -124) {
      friendlyMessage = 'Lỗi (-124): Access Token Zalo không hợp lệ hoặc đã hết hạn. Vui lòng lấy Token mới từ Zalo Developers hoặc dán Refresh Token để tự động gia hạn.';
    } else if (res.error === -120) {
      friendlyMessage = 'Lỗi (-120): OA chưa được cấp quyền sử dụng tính năng này (cần kích hoạt gói trả phí trên Zalo Cloud và nạp tiền số dư ZNS).';
    } else if (res.error === -108) {
      friendlyMessage = 'Lỗi (-108): Số điện thoại nhận tin không hợp lệ hoặc người dùng không sử dụng Zalo.';
    } else if (res.error === -140) {
      friendlyMessage = 'Lỗi (-140): Số dư tài khoản Zalo Cloud không đủ tiền để gửi tin ZNS.';
    }

    return NextResponse.json({
      success: false,
      error: res.error,
      message: friendlyMessage,
      raw: res.data,
    });
  } catch (err: any) {
    console.error('Lỗi API test Zalo:', err);
    return NextResponse.json(
      { success: false, message: `Lỗi hệ thống: ${err.message || 'Không thể gửi tin thử'}` },
      { status: 500 }
    );
  }
}
