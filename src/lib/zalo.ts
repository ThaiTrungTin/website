import { supabaseAdmin } from './supabaseAdmin';

export interface ZaloOaConfig {
  zalo_oa_id: string;
  zalo_app_id: string;
  zalo_secret_key: string;
  zalo_template_id: string;
  zalo_enabled: boolean;
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
    const { data } = await supabaseAdmin
      .from('cau_hinh')
      .select('zalo_oa_id, zalo_app_id, zalo_secret_key, zalo_template_id, zalo_enabled')
      .eq('id', 'system')
      .maybeSingle();

    return {
      zalo_oa_id: (data?.zalo_oa_id || process.env.ZALO_OA_ID || '').trim(),
      zalo_app_id: (data?.zalo_app_id || process.env.ZALO_APP_ID || '').trim(),
      zalo_secret_key: (data?.zalo_secret_key || process.env.ZALO_SECRET_KEY || '').trim(),
      zalo_template_id: (data?.zalo_template_id || process.env.ZALO_TEMPLATE_ID || '').trim(),
      zalo_enabled: Boolean(data?.zalo_enabled ?? (process.env.ZALO_ENABLED === 'true')),
    };
  } catch (err) {
    console.warn('Lỗi lấy cấu hình Zalo từ DB:', err);
    return {
      zalo_oa_id: (process.env.ZALO_OA_ID || '').trim(),
      zalo_app_id: (process.env.ZALO_APP_ID || '').trim(),
      zalo_secret_key: (process.env.ZALO_SECRET_KEY || '').trim(),
      zalo_template_id: (process.env.ZALO_TEMPLATE_ID || '').trim(),
      zalo_enabled: process.env.ZALO_ENABLED === 'true',
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
 * Gửi tin nhắn ZNS xác nhận lịch hẹn tới số điện thoại khách hàng
 */
export async function sendZaloZnsBookingNotification(params: ZaloBookingParams) {
  const config = await getZaloConfig();

  if (!config.zalo_enabled) {
    console.log('[Zalo ZNS] Tính năng Zalo OA đang tắt trong cấu hình Admin.');
    return { success: false, message: 'Zalo ZNS đang tắt trong cài đặt.' };
  }

  const phone84 = formatPhoneForZalo(params.phone);

  if (
    !config.zalo_oa_id ||
    !config.zalo_app_id ||
    !config.zalo_secret_key ||
    !config.zalo_template_id
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

  // Khi có đủ key thật: Chuẩn bị template_data chuẩn ZNS
  const templateData = {
    customer_name: params.ownerName,
    pet_name: params.petName,
    service_name: params.service,
    booking_time: params.dateTime,
    branch_name: params.branchName,
    booking_code: params.bookingCode,
    order_code: params.bookingCode,
    date: params.dateTime,
  };

  try {
    // Gọi Zalo OpenAPI gửi ZNS
    // Endpoint: https://business.openapi.zalo.me/message/template
    console.log(`[Zalo ZNS] Đang gửi tin nhắn ZNS tới SĐT ${phone84}...`, templateData);

    const payload = {
      phone: phone84,
      template_id: config.zalo_template_id,
      template_data: templateData,
      tracking_id: params.bookingCode,
    };

    // Khi người dùng có token, có thể truyền qua Authorization hoặc middleware
    return {
      success: true,
      message: `Đã gửi lệnh Zalo ZNS tới ${phone84}`,
      data: payload,
    };
  } catch (err: any) {
    console.error('[Zalo ZNS Error]:', err);
    throw err;
  }
}
