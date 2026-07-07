import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role } = await req.json()
    
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email exists' }, { status: 400 })
    
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, password: hashed, name, role: role || 'user' }
    })
    
    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } })
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
