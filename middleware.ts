import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  // For now, allow all other routes
  // Add authentication later when needed
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
