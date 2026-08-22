import { NextResponse } from 'next/server';
import { INITIAL_PROJECTS } from '@/src/data/mockData';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ success: true, count: INITIAL_PROJECTS.length, data: INITIAL_PROJECTS });
}
