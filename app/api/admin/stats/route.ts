import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    stats: {
      totalUsers: 2840,
      totalProperties: 1420,
      pendingApprovals: 8,
      activeAgencies: 45,
      activeBuilders: 18,
      totalBookings: 194,
      totalEscrowRevenue: 'PKR 48.2 Crore',
      pendingKYC: 12,
      pendingCommissions: 'PKR 1.2 Crore'
    }
  });
}
