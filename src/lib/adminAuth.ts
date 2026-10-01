import crypto from 'crypto';

const AUTH_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'petmm_luxury_admin_secret_key_2026';

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
  const payload = JSON.stringify({
    ...user,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 ngày
  });
  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token?: string | null): AdminUser | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(encodedPayload).digest('base64url');

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
