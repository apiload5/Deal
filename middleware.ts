// middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin routes protection
    if (path.startsWith('/admin-panel') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Agent routes protection
    if (path.startsWith('/agent') && token?.role !== 'AGENT' && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Dashboard protection
    if (path.startsWith('/dashboard') && !token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin-panel/:path*',
    '/agent/:path*',
    '/add-property',
    '/wishlist',
  ],
}
