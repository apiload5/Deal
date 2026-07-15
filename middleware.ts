import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const path = request.nextUrl.pathname

  // Setup required check
  const hasRequiredEnv = process.env.NEXTAUTH_SECRET && 
                         process.env.DATABASE_URL &&
                         process.env.RAPID_MERCHANT_ID

  if (!hasRequiredEnv && !path.startsWith('/setup')) {
    return NextResponse.redirect(new URL('/setup', request.url))
  }

  // Public routes
  const publicRoutes = ['/', '/properties', '/property', '/map', '/area-guide', '/blog']
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))
  
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Auth routes
  if (path.startsWith('/auth')) {
    return NextResponse.next()
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Role-based routing
  if (path.startsWith('/admin-panel') && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  if (path.startsWith('/agent') && !['agent', 'admin'].includes(token.role as string)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
