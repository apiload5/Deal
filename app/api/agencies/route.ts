import { NextResponse } from 'next/server';
import { INITIAL_AGENCIES } from '@/src/data/mockData';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ success: true, count: INITIAL_AGENCIES.length, data: INITIAL_AGENCIES });
}
