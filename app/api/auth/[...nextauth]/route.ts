import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// ✅ Simplest working version
const handler = NextAuth(authOptions)

export const GET = handler
export const POST = handler
