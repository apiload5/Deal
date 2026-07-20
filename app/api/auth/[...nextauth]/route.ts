import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// ✅ Next.js 15 compatible
const handler = NextAuth(authOptions)

export const GET = handler
export const POST = handler
