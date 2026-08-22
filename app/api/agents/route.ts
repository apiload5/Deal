import { NextResponse } from 'next/server';
import { INITIAL_AGENTS } from '@/src/data/mockData';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ success: true, count: INITIAL_AGENTS.length, data: INITIAL_AGENTS });
}
