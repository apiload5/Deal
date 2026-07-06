// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;

  // Admin routes protection
  if (path.startsWith('/admin-panel')) {
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Agent routes protection
  if (path.startsWith('/agent')) {
    if (!token || (token.role !== 'agent' && token.role !== 'admin')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // User routes protection
  if (path.startsWith('/user')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin-panel/:path*', '/agent/:path*', '/user/:path*'],
};
