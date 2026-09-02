import { NextResponse } from 'next/server';
import { INITIAL_BLOGS } from '@/src/data/mockData';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ success: true, count: INITIAL_BLOGS.length, data: INITIAL_BLOGS });
}
