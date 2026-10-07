import { supabaseAdmin } from './supabaseAdmin';

export interface NotificationSettings {
  email_enabled: boolean;
  email_booking_mode: 'always' | 'on_zalo_fail' | 'disabled';
  email_recruitment_enabled: boolean;
  zalo_booking_enabled: boolean;
  zalo_review_enabled: boolean;
  zalo_review_template_id: string;
  zalo_access_token?: string;
  zalo_refresh_token?: string;
  zalo_test_phone?: string;
  // Cài đặt chống spam đặt lịch (IP, SĐT, Email)
  spam_limit_enabled?: boolean;
  spam_limit_ip?: boolean;
  spam_limit_phone?: boolean;
  spam_limit_email?: boolean;
  spam_max_bookings_per_day?: number;
  spam_cooldown_seconds?: number;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  email_enabled: true,
  email_booking_mode: 'always',
  email_recruitment_enabled: true,
  zalo_booking_enabled: true,
  zalo_review_enabled: true,
  zalo_review_template_id: '',
  zalo_access_token: '',
  zalo_refresh_token: '',
  zalo_test_phone: '',
  spam_limit_enabled: true,
  spam_limit_ip: true,
  spam_limit_phone: true,
  spam_limit_email: true,
  spam_max_bookings_per_day: 3,
  spam_cooldown_seconds: 15,
};

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const [configRes, secretRes] = await Promise.all([
      supabaseAdmin
        .from('cau_hinh')
        .select('slogan_cuoi_trang_noi_dung')
        .eq('id', 'notification_settings')
        .maybeSingle(),
      supabaseAdmin
        .from('cau_hinh_bi_mat')
        .select('zalo_access_token, zalo_refresh_token')
        .eq('id', 'system')
        .maybeSingle(),
    ]);

    let parsed: any = {};
    if (configRes.data?.slogan_cuoi_trang_noi_dung) {
      try {
        parsed = JSON.parse(configRes.data.slogan_cuoi_trang_noi_dung);
      } catch {}
    }

    return {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...parsed,
      zalo_access_token: secretRes.data?.zalo_access_token || parsed?.zalo_access_token || '',
      zalo_refresh_token: secretRes.data?.zalo_refresh_token || parsed?.zalo_refresh_token || '',
    };
  } catch (err) {
    console.warn('Lỗi lấy notification_settings từ DB:', err);
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

export async function saveNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
  const current = await getNotificationSettings();
  const merged = { ...current, ...settings };

  // Lưu token bảo mật vào bảng cau_hinh_bi_mat (chỉ server truy cập)
  if (settings.zalo_access_token !== undefined || settings.zalo_refresh_token !== undefined) {
    const secretUpdates: Record<string, any> = { id: 'system', ngay_cap_nhat: new Date().toISOString() };
    if (settings.zalo_access_token !== undefined) secretUpdates.zalo_access_token = settings.zalo_access_token;
    if (settings.zalo_refresh_token !== undefined) secretUpdates.zalo_refresh_token = settings.zalo_refresh_token;
    await supabaseAdmin.from('cau_hinh_bi_mat').upsert(secretUpdates);
  }

  // Loại bỏ token khỏi JSON public trong cau_hinh
  const safeMerged = { ...merged };
  delete safeMerged.zalo_access_token;
  delete safeMerged.zalo_refresh_token;

  const { error } = await supabaseAdmin
    .from('cau_hinh')
    .upsert({
      id: 'notification_settings',
      slogan_cuoi_trang_noi_dung: JSON.stringify(safeMerged),
      ngay_cap_nhat: new Date().toISOString(),
    });

  if (error) {
    console.error('Lỗi lưu notification_settings:', error);
    throw error;
  }
}
