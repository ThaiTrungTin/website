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
    const { data } = await supabaseAdmin
      .from('cau_hinh')
      .select('slogan_cuoi_trang_noi_dung')
      .eq('id', 'notification_settings')
      .maybeSingle();

    if (data?.slogan_cuoi_trang_noi_dung) {
      try {
        const parsed = JSON.parse(data.slogan_cuoi_trang_noi_dung);
        return {
          ...DEFAULT_NOTIFICATION_SETTINGS,
          ...parsed,
        };
      } catch {}
    }
  } catch (err) {
    console.warn('Lỗi lấy notification_settings từ DB:', err);
  }
  return DEFAULT_NOTIFICATION_SETTINGS;
}

export async function saveNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
  const current = await getNotificationSettings();
  const merged = { ...current, ...settings };
  const { error } = await supabaseAdmin
    .from('cau_hinh')
    .upsert({
      id: 'notification_settings',
      slogan_cuoi_trang_noi_dung: JSON.stringify(merged),
      ngay_cap_nhat: new Date().toISOString(),
    });

  if (error) {
    console.error('Lỗi lưu notification_settings:', error);
    throw error;
  }
}
