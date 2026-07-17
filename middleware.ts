import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const path = request.nextUrl.pathname

  // Skip API routes and static files
  if (
    path.startsWith('/api') ||
    path.startsWith('/_next') ||
    path.startsWith('/favicon.ico') ||
    path.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)
  ) {
    return NextResponse.next()
  }

  // Public routes
  const publicRoutes = [
    '/',
    '/properties',
    '/property',
    '/map',
    '/area-guide',
    '/blog',
    '/auth',
    '/setup',
    '/unauthorized'
  ]

  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Protect routes that require authentication
  if (!token) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Role-based routing
  const userRole = token.role as string || 'user'

  if (path.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  if (path.startsWith('/agent') && !['agent', 'admin'].includes(userRole)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
