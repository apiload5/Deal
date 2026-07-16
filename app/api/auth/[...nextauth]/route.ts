import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

// ✅ FIXED: Export as named functions for Next.js 16
export const GET = handler
export const POST = handler
