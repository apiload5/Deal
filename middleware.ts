import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Public routes
    if (path === '/' || path.startsWith('/properties') || path.startsWith('/property')) {
      return NextResponse.next()
    }

    // User routes
    if (path.startsWith('/wishlist') || path.startsWith('/alerts') || path.startsWith('/profile')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
    }

    // Agent routes
    if (path.startsWith('/agent')) {
      if (!token || token.role !== 'agent') {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
    }

    // Admin routes
    if (path.startsWith('/admin')) {
      if (!token || token.role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
)

export const config = {
  matcher: [
    '/',
    '/properties/:path*',
    '/property/:path*',
    '/wishlist/:path*',
    '/alerts/:path*',
    '/profile/:path*',
    '/agent/:path*',
    '/admin/:path*',
  ],
}
