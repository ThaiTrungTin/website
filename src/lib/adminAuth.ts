import crypto from 'crypto';

function getAuthSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (secret && secret.trim().length > 0) {
    return secret.trim();
  }
  // Fallback an toàn: Dùng Supabase Service Role Key (đã cấu hình sẵn trên server Vercel)
  // để không bị sập 500 khi chưa thêm biến ADMIN_JWT_SECRET trên Vercel Dashboard
  const fallbackKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (fallbackKey && fallbackKey.trim().length > 0) {
    return crypto.createHash('sha256').update(fallbackKey + ':petmm_admin_auth_fallback_salt').digest('hex');
  }
  return crypto.createHash('sha256').update('petmm_clinic_secure_jwt_fallback_key_2026').digest('hex');
}

export interface AdminUser {
  username: string;
  ho_ten: string;
  vai_tro: string;
  email?: string;
}

export function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

export function generateToken(user: AdminUser): string {
  const authSecret = getAuthSecret();
  const payload = JSON.stringify({
    ...user,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 ngày
  });
  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', authSecret).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token?: string | null): AdminUser | null {
  if (!token) return null;
  const authSecret = getAuthSecret();
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', authSecret).update(encodedPayload).digest('base64url');

  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return {
      username: payload.username,
      ho_ten: payload.ho_ten,
      vai_tro: payload.vai_tro,
      email: payload.email,
    };
  } catch {
    return null;
  }
}
