import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok', name: 'DealFast.pk API', version: '2.0.0' });
}
