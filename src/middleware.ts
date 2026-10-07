import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  // Strict CSP using cryptographic nonce & strict-dynamic (RFC compliant)
  // Eliminates 'unsafe-inline' from script-src to pass security scanners with 100/A+ score
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net;
    img-src 'self' blob: data: https://*.supabase.co https://*.supabase.in https://images.unsplash.com https://*.google.com https://*.googleapis.com;
    font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.supabase.com https://*.vercel.app https://*.google.com https://*.googleapis.com;
    frame-src 'self' https://www.google.com https://maps.google.com https://*.google.com;
    frame-ancestors 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy", cspHeader);

  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
