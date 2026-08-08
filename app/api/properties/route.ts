import { NextResponse } from 'next/server';
import { INITIAL_PROPERTIES } from '@/src/data/mockData';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const purpose = searchParams.get('purpose');
  const type = searchParams.get('type');
  const isPremium = searchParams.get('isPremium');
  const isFeatured = searchParams.get('isFeatured');
  const search = searchParams.get('search');

  let list = [...INITIAL_PROPERTIES];

  if (city && city !== 'All Cities') {
    list = list.filter(p => p.city.toLowerCase() === city.toLowerCase());
  }
  if (purpose && purpose !== 'all') {
    list = list.filter(p => p.purpose === purpose);
  }
  if (type && type !== 'all') {
    list = list.filter(p => p.type === type);
  }
  if (isPremium === 'true') {
    list = list.filter(p => p.isPremium);
  }
  if (isFeatured === 'true') {
    list = list.filter(p => p.isFeatured);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p => p.title.toLowerCase().includes(q) || p.area.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  return NextResponse.json({ success: true, count: list.length, data: list });
}
