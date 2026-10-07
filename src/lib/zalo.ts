import { supabaseAdmin } from './supabaseAdmin';
import { logNotification } from './notificationLogger';

export interface ZaloOaConfig {
  zalo_oa_id: string;
  zalo_app_id: string;
  zalo_secret_key: string;
  zalo_template_id: string; // Template đặt lịch
  zalo_review_template_id?: string; // Template đánh giá
  zalo_enabled: boolean; // Bật / tắt tất cả Zalo
  zalo_booking_enabled?: boolean; // Bật / tắt xác nhận lịch hẹn Zalo
  zalo_review_enabled?: boolean; // Bật / tắt gửi đánh giá Zalo
  zalo_access_token?: string; // Access Token từ Zalo Developers
  zalo_refresh_token?: string; // Refresh Token từ Zalo Developers
  zalo_test_phone?: string; // Số điện thoại test
}

export interface ZaloBookingParams {
  phone: string;
  bookingCode: string;
  ownerName: string;
  petName: string;
  service: string;
  dateTime: string;
  branchName: string;
}

/**
 * Lấy cấu hình Zalo OA từ cơ sở dữ liệu Supabase hoặc biến môi trường
 */
export async function getZaloConfig(): Promise<ZaloOaConfig> {
  try {
    const { getNotificationSettings } = await import('./notificationSettings');
    const [dbRes, secretRes, notifySettings] = await Promise.all([
      supabaseAdmin
        .from('cau_hinh')
        .select('zalo_oa_id, zalo_app_id, zalo_template_id, zalo_enabled')
        .eq('id', 'system')
        .maybeSingle(),
      supabaseAdmin
        .from('cau_hinh_bi_mat')
        .select('zalo_secret_key')
        .eq('id', 'system')
        .maybeSingle(),
      getNotificationSettings().catch(() => null),
    ]);

    const data = dbRes.data;
    const secretData = secretRes.data;

    return {
      zalo_oa_id: (data?.zalo_oa_id || process.env.ZALO_OA_ID || '').trim(),
      zalo_app_id: (data?.zalo_app_id || process.env.ZALO_APP_ID || '').trim(),
      zalo_secret_key: (secretData?.zalo_secret_key || process.env.ZALO_SECRET_KEY || '').trim(),
      zalo_template_id: (data?.zalo_template_id || process.env.ZALO_TEMPLATE_ID || '').trim(),
      zalo_review_template_id: (notifySettings?.zalo_review_template_id || process.env.ZALO_REVIEW_TEMPLATE_ID || '').trim(),
      zalo_enabled: Boolean(data?.zalo_enabled ?? (process.env.ZALO_ENABLED === 'true')),
      zalo_booking_enabled: notifySettings?.zalo_booking_enabled !== undefined ? Boolean(notifySettings.zalo_booking_enabled) : true,
      zalo_review_enabled: notifySettings?.zalo_review_enabled !== undefined ? Boolean(notifySettings.zalo_review_enabled) : true,
      zalo_access_token: (notifySettings?.zalo_access_token || process.env.ZALO_ACCESS_TOKEN || '').trim(),
      zalo_refresh_token: (notifySettings?.zalo_refresh_token || process.env.ZALO_REFRESH_TOKEN || '').trim(),
      zalo_test_phone: (notifySettings?.zalo_test_phone || '').trim(),
    };
  } catch (err) {
    console.warn('Lỗi lấy cấu hình Zalo từ DB:', err);
    return {
      zalo_oa_id: (process.env.ZALO_OA_ID || '').trim(),
      zalo_app_id: (process.env.ZALO_APP_ID || '').trim(),
      zalo_secret_key: (process.env.ZALO_SECRET_KEY || '').trim(),
      zalo_template_id: (process.env.ZALO_TEMPLATE_ID || '').trim(),
      zalo_review_template_id: (process.env.ZALO_REVIEW_TEMPLATE_ID || '').trim(),
      zalo_enabled: process.env.ZALO_ENABLED === 'true',
      zalo_booking_enabled: true,
      zalo_review_enabled: true,
      zalo_access_token: (process.env.ZALO_ACCESS_TOKEN || '').trim(),
      zalo_refresh_token: (process.env.ZALO_REFRESH_TOKEN || '').trim(),
      zalo_test_phone: '',
    };
  }
}

/**
 * Chuẩn hóa số điện thoại Việt Nam sang định dạng 84xxx của Zalo
 */
export function formatPhoneForZalo(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '84' + cleaned.slice(1);
  } else if (!cleaned.startsWith('84') && cleaned.length >= 9) {
    cleaned = '84' + cleaned;
  }
  return cleaned;
}

/**
 * Định dạng thời gian theo chuẩn kiểu dữ liệu 'date' của Zalo ZNS Template (HH:mm dd/MM/yyyy hoặc dd/MM/yyyy)
 * Xử lý chính xác mọi chuỗi đầu vào: "09:00 - 09:30, Ngày 06/10/2026", "09:30 15/10/2026", "2026-10-06", v.v.
 */
export function formatScheduleTimeToZaloDate(raw: string): string {
  if (!raw || !raw.trim()) {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    return `09:00 ${d}/${m}/${y}`;
  }

  const str = raw.trim();

  // 1. Tìm phần ngày tháng dd/MM/yyyy hoặc yyyy-MM-dd
  let datePart = '';
  const dmyMatch = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, '0');
    const m = dmyMatch[2].padStart(2, '0');
    const y = dmyMatch[3];
    datePart = `${d}/${m}/${y}`;
  } else {
    const ymdMatch = str.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (ymdMatch) {
      const y = ymdMatch[1];
      const m = ymdMatch[2].padStart(2, '0');
      const d = ymdMatch[3].padStart(2, '0');
      datePart = `${d}/${m}/${y}`;
    }
  }

  // 2. Tìm phần giờ phút HH:mm (nếu là khoảng 09:00 - 09:30, lấy mốc bắt đầu 09:00)
  let timePart = '';
  const timeMatch = str.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    const h = timeMatch[1].padStart(2, '0');
    const min = timeMatch[2];
    timePart = `${h}:${min}`;
  }

  if (timePart && datePart) {
    return `${timePart} ${datePart}`; // ví dụ: "09:00 06/10/2026" (16 ký tự, đúng chuẩn Zalo date)
  }
  if (datePart) {
    return datePart; // ví dụ: "06/10/2026" (10 ký tự)
  }

  // Fallback loại bỏ các từ dư thừa và cắt tối đa 20 ký tự
  return str.replace(/ngày\s+/gi, '').replace(/date\s+/gi, '').trim().slice(0, 20);
}

/**
 * Danh sách và thông số các Mẫu ZNS Template đăng ký trên Zalo Business Solutions
 */
export const ZALO_TEMPLATES = {
  // Mẫu 1: Xác nhận lịch hẹn khám thú cưng (Zalo Notification Service)
  BOOKING_CONFIRMATION: {
    name: 'Xác nhận lịch hẹn khám PetM&M',
    type: 'CSKH - Xác nhận giao dịch / lịch hẹn',
    parameters: {
      customer_name: 'Tên khách hàng',
      booking_code: 'Mã lịch hẹn (PET-xxxxxx)',
      schedule_time: 'Ngày giờ khám (VD: 09:30 ngày 15/10/2026)',
      address: 'Địa chỉ phòng khám chi nhánh',
    },
    action_button: 'Gọi hotline phòng khám',
  },
  // Mẫu 2: Khảo sát & Đánh giá chất lượng dịch vụ PetM&M (Mẫu 5 sao tương tác)
  SERVICE_REVIEW: {
    name: 'Đánh giá dịch vụ / sản phẩm PetM&M',
    type: 'Mẫu đánh giá dịch vụ (có 5 sao)',
    fixed_shop_name: 'PetM&M',
    parameters: {
      customer_name: 'Tên khách hàng',
      order_id: 'Mã đơn / Mã hồ sơ (VD: PET-241005)',
      review_code: 'Mã đánh giá để chèn vào URL nút bấm',
    },
    action_button: 'Nút: Đánh giá kèm hình ảnh tại đây -> https://petmm.vn/danhgiadichvu/<review_code>',
  },
} as const;

export interface ZaloReviewParams {
  phone: string;
  customerName: string;
  orderId: string;
  reviewCode: string;
  shopName?: string;
  address?: string;
}

/**
 * Gửi tin nhắn ZNS xác nhận lịch hẹn tới số điện thoại khách hàng
 */
export async function sendZaloZnsBookingNotification(params: ZaloBookingParams, customTemplateId?: string) {
  const config = await getZaloConfig();

  if (!config.zalo_enabled) {
    console.log('[Zalo ZNS] Tính năng Zalo OA đang tắt trong cấu hình Admin.');
    return { success: false, message: 'Zalo ZNS đang tắt trong cài đặt.' };
  }

  if (config.zalo_booking_enabled === false) {
    console.log('[Zalo ZNS] Gửi xác nhận lịch hẹn qua Zalo đang tắt trong cấu hình.');
    return { success: false, message: 'Gửi xác nhận lịch hẹn qua Zalo đang tắt.' };
  }

  const phone84 = formatPhoneForZalo(params.phone);
  const activeTemplateId = (customTemplateId || config.zalo_template_id || '').trim();

  if (
    !config.zalo_oa_id ||
    !config.zalo_app_id ||
    !config.zalo_secret_key ||
    !activeTemplateId
  ) {
    console.log(
      `[Zalo ZNS Mock] Chưa đủ 4 thông số (ZALO_OA_ID, ZALO_APP_ID, ZALO_SECRET_KEY, ZALO_TEMPLATE_ID). ` +
      `Mô phỏng tin ZNS gửi thành công tới: ${phone84} (#${params.bookingCode})`
    );
    return {
      success: true,
      mock: true,
      message: 'Đang chạy chế độ mô phỏng (chưa nhập đủ 4 key Zalo OA).',
    };
  }

  // Chuẩn hóa và giới hạn độ dài ký tự theo đúng quy định kỹ thuật của Zalo ZNS Template 645197:
  // 1. booking_code: tối đa 30 ký tự
  // 2. customer_name: tối đa 30 ký tự
  // 3. schedule_time: tối đa 20 ký tự (Ví dụ: "09:30 15/10/2026" là 16 ký tự, "09:30, 15/10/2026" là 17 ký tự)
  // 4. address: tối đa 200 ký tự

  const safeScheduleTime = formatScheduleTimeToZaloDate(params.dateTime);
  const safeBookingCode = (params.bookingCode || '').trim().slice(0, 30);
  const safeCustomerName = (params.ownerName || 'Khách hàng').trim().slice(0, 30);
  const safeAddress = (params.branchName || '19 Đ. Số 1, Phường Phước Long, TP. Thủ Đức, TP. Hồ Chí Minh').trim().slice(0, 200);

  const templateData = {
    booking_code: safeBookingCode,
    address: safeAddress,
    schedule_time: safeScheduleTime,
    customer_name: safeCustomerName,
  };

  try {
    console.log(`[Zalo ZNS] Đang gửi tin nhắn ZNS Đặt lịch tới SĐT ${phone84}...`, templateData);

    const payload = {
      phone: phone84,
      template_id: activeTemplateId,
      template_data: templateData,
      tracking_id: params.bookingCode,
    };

    // Ưu tiên access_token, nếu chưa có thì thử với secret_key
    let token = config.zalo_access_token || config.zalo_secret_key;

    // Lần gọi 1
    let res = await fetch('https://business.openapi.zalo.me/message/template', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': token,
      },
      body: JSON.stringify(payload),
    });

    let resData = await res.json().catch(() => null);
    console.log('[Zalo ZNS Response]:', resData);

    // Nếu lỗi token (-124) và có Refresh Token, tự động cấp lại token mới và gửi lại ngay
    if (resData?.error === -124 && config.zalo_refresh_token && config.zalo_app_id && config.zalo_secret_key) {
      console.log('[Zalo ZNS] Token hết hạn/chưa hợp lệ, đang tự động gọi Refresh Token...');
      const { saveNotificationSettings } = await import('./notificationSettings');
      try {
        const refreshRes = await fetch('https://oauth.zaloapp.com/v4/oa/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'secret_key': config.zalo_secret_key.trim(),
          },
          body: new URLSearchParams({
            app_id: config.zalo_app_id.trim(),
            grant_type: 'refresh_token',
            refresh_token: config.zalo_refresh_token.trim(),
          }),
        });
        const refreshData = await refreshRes.json();
        if (refreshData?.access_token) {
          token = refreshData.access_token;
          await saveNotificationSettings({
            zalo_access_token: refreshData.access_token,
            zalo_refresh_token: refreshData.refresh_token || config.zalo_refresh_token,
          });

          // Gửi lại ngay lập tức với token mới cấp
          res = await fetch('https://business.openapi.zalo.me/message/template', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'access_token': token,
            },
            body: JSON.stringify(payload),
          });
          resData = await res.json().catch(() => null);
          console.log('[Zalo ZNS Retry Response]:', resData);
        }
      } catch (rErr) {
        console.error('[Zalo Refresh Token Error]:', rErr);
      }
    }

    if (resData && resData.error === 0) {
      await logNotification({
        kenh: 'zalo',
        loai_tin: 'dat_lich',
        nguoi_nhan: phone84,
        ten_nguoi_nhan: params.ownerName,
        tieu_de: 'Xác nhận lịch hẹn khám',
        trang_thai: 'thanh_cong',
        du_lieu_gui: templateData,
        phan_hoi: resData,
      });

      return {
        success: true,
        message: `Đã gửi Zalo ZNS thành công tới ${phone84}`,
        data: resData,
      };
    } else {
      console.warn(`[Zalo ZNS Thất bại]: Mã lỗi ${resData?.error} - ${resData?.message || 'Không gửi được'}`);
      await logNotification({
        kenh: 'zalo',
        loai_tin: 'dat_lich',
        nguoi_nhan: phone84,
        ten_nguoi_nhan: params.ownerName,
        tieu_de: 'Xác nhận lịch hẹn khám',
        trang_thai: 'that_bai',
        ma_loi: resData?.error,
        chi_tiet_loi: resData?.message || 'Zalo ZNS từ chối gửi tin nhắn.',
        du_lieu_gui: templateData,
        phan_hoi: resData,
      });

      return {
        success: false,
        error: resData?.error,
        message: resData?.message || 'Zalo ZNS từ chối gửi tin nhắn.',
        data: resData,
      };
    }
  } catch (err: any) {
    console.error('[Zalo ZNS Booking Network Error]:', err);
    await logNotification({
      kenh: 'zalo',
      loai_tin: 'dat_lich',
      nguoi_nhan: phone84,
      ten_nguoi_nhan: params.ownerName,
      tieu_de: 'Xác nhận lịch hẹn khám',
      trang_thai: 'that_bai',
      ma_loi: 'NETWORK_ERROR',
      chi_tiet_loi: err.message || 'Lỗi mạng khi kết nối Zalo OpenAPI',
      du_lieu_gui: templateData,
    });

    return {
      success: false,
      message: err.message || 'Lỗi mạng khi kết nối Zalo OpenAPI',
    };
  }
}

/**
 * Gửi tin nhắn ZNS Khảo sát / Đánh giá dịch vụ có Nút mở Web
 */
export async function sendZaloZnsReviewNotification(params: ZaloReviewParams, customTemplateId?: string) {
  const config = await getZaloConfig();

  if (!config.zalo_enabled) {
    return { success: false, message: 'Tính năng Zalo ZNS đang tắt trong cài đặt hệ thống.' };
  }

  if (config.zalo_review_enabled === false) {
    return { success: false, message: 'Gửi khảo sát/đánh giá qua Zalo đang tắt trong cài đặt.' };
  }

  const templateId = (customTemplateId || config.zalo_review_template_id || '').trim();
  if (!templateId) {
    return { success: false, message: 'Chưa cấu hình ID Mẫu ZNS Đánh giá dịch vụ trong Cài đặt Quản trị.' };
  }

  const phone84 = formatPhoneForZalo(params.phone);
  if (!phone84) {
    return { success: false, message: 'Số điện thoại không hợp lệ để gửi tin Zalo ZNS.' };
  }

  const safeCustomerName = (params.customerName || 'Quý khách').trim().slice(0, 30);
  const safeOrderId = (params.orderId || params.reviewCode || 'PET-000000').trim().slice(0, 30);
  const safeReviewCode = (params.reviewCode || '').trim().slice(0, 100);
  const safeAddress = (params.address || '19 Đ. Số 1, Phường Phước Long, TP. Thủ Đức').trim().slice(0, 80);
  const safeShopName = (params.shopName || safeAddress).trim().slice(0, 80);

  const templateData = {
    customer_name: safeCustomerName,
    order_id: safeOrderId,
    review_code: safeReviewCode,
    shop_name: safeShopName,
    shop_address: safeAddress,
    address: safeAddress,
  };

  const payload = {
    phone: phone84,
    template_id: templateId,
    template_data: templateData,
    tracking_id: `review_${safeReviewCode}_${Date.now()}`,
  };

  try {
    let token = config.zalo_access_token || config.zalo_secret_key;

    let res = await fetch('https://business.openapi.zalo.me/message/template', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': token,
      },
      body: JSON.stringify(payload),
    });

    let resData = await res.json().catch(() => null);
    console.log('[Zalo ZNS Review Response]:', resData);

    // Tự động làm mới access token nếu token hết hạn (-124)
    if (resData?.error === -124 && config.zalo_refresh_token && config.zalo_app_id && config.zalo_secret_key) {
      console.log('[Zalo ZNS Review] Token hết hạn, đang gọi refresh token...');
      const { saveNotificationSettings } = await import('./notificationSettings');
      try {
        const refreshRes = await fetch('https://oauth.zaloapp.com/v4/oa/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'secret_key': config.zalo_secret_key.trim(),
          },
          body: new URLSearchParams({
            app_id: config.zalo_app_id.trim(),
            grant_type: 'refresh_token',
            refresh_token: config.zalo_refresh_token.trim(),
          }),
        });
        const refreshData = await refreshRes.json();
        if (refreshData?.access_token) {
          token = refreshData.access_token;
          await saveNotificationSettings({
            zalo_access_token: refreshData.access_token,
            zalo_refresh_token: refreshData.refresh_token || config.zalo_refresh_token,
          });

          res = await fetch('https://business.openapi.zalo.me/message/template', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'access_token': token,
            },
            body: JSON.stringify(payload),
          });
          resData = await res.json().catch(() => null);
          console.log('[Zalo ZNS Review Retry Response]:', resData);
        }
      } catch (rErr) {
        console.error('[Zalo Review Refresh Token Error]:', rErr);
      }
    }

    if (resData && resData.error === 0) {
      await logNotification({
        kenh: 'zalo',
        loai_tin: 'danh_gia',
        nguoi_nhan: phone84,
        ten_nguoi_nhan: params.customerName,
        tieu_de: 'Khảo sát & Đánh giá chất lượng',
        trang_thai: 'thanh_cong',
        du_lieu_gui: templateData,
        phan_hoi: resData,
      });

      return {
        success: true,
        message: `Đã gửi tin nhắn ZNS Đánh giá thành công tới ${phone84}`,
        data: resData,
      };
    } else {
      console.warn(`[Zalo ZNS Review Failed]: Mã ${resData?.error} - ${resData?.message}`);
      await logNotification({
        kenh: 'zalo',
        loai_tin: 'danh_gia',
        nguoi_nhan: phone84,
        ten_nguoi_nhan: params.customerName,
        tieu_de: 'Khảo sát & Đánh giá chất lượng',
        trang_thai: 'that_bai',
        ma_loi: resData?.error,
        chi_tiet_loi: resData?.message || 'Zalo ZNS từ chối gửi tin nhắn.',
        du_lieu_gui: templateData,
        phan_hoi: resData,
      });

      return {
        success: false,
        error: resData?.error,
        message: resData?.message || 'Zalo ZNS từ chối gửi tin nhắn.',
        data: resData,
      };
    }
  } catch (err: any) {
    console.error('[Zalo ZNS Review Network Error]:', err);
    await logNotification({
      kenh: 'zalo',
      loai_tin: 'danh_gia',
      nguoi_nhan: phone84,
      ten_nguoi_nhan: params.customerName,
      tieu_de: 'Khảo sát & Đánh giá chất lượng',
      trang_thai: 'that_bai',
      ma_loi: 'NETWORK_ERROR',
      chi_tiet_loi: err.message || 'Lỗi mạng khi kết nối Zalo OpenAPI',
      du_lieu_gui: templateData,
    });

    return {
      success: false,
      message: err.message || 'Lỗi mạng khi kết nối Zalo OpenAPI',
    };
  }
}


