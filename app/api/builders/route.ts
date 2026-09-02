import { NextResponse } from 'next/server';
import { INITIAL_BUILDERS } from '@/src/data/mockData';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ success: true, count: INITIAL_BUILDERS.length, data: INITIAL_BUILDERS });
}
