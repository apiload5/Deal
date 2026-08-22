import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { INITIAL_PROPERTIES } from '@/src/data/mockData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  const response = NextResponse.json({ success: true, count: list.length, data: list });
  response.headers.set('Cache-Control', 'public, s-maxage=1, stale-while-revalidate=59');
  return response;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Purge and revalidate Next.js cache for property data
    revalidatePath('/', 'layout');
    revalidatePath('/api/properties');

    return NextResponse.json({
      success: true,
      message: 'Property listing cache revalidated successfully across data-fetching layers.',
      revalidatedAt: new Date().toISOString(),
      action: body.action || 'property_update'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to revalidate property cache' },
      { status: 500 }
    );
  }
}

