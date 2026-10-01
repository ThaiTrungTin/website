import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get('petmm_admin_session')?.value;
  const user = verifyToken(sessionToken);

  if (!user) {
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }

  return NextResponse.json({
    authenticated: true,
    user,
  });
}
