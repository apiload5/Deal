import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ServerLockoutRecord {
  attempts: number;
  lockUntil: number | null;
  lastAttempt: number;
}

// In-memory server-side lockout tracking map
const serverLockoutMap = new Map<string, ServerLockoutRecord>();
const MAX_ATTEMPTS = 10;
const LOCKOUT_DURATION_MS = 60 * 60 * 1000; // 1 hour

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const identifier = searchParams.get('identifier') || 'global_admin';
  const now = Date.now();

  const record = serverLockoutMap.get(identifier);
  if (!record) {
    return NextResponse.json({
      isLocked: false,
      attemptsCount: 0,
      remainingMinutes: 0,
      remainingSeconds: 0
    });
  }

  if (record.lockUntil && now < record.lockUntil) {
    const diffMs = record.lockUntil - now;
    return NextResponse.json({
      isLocked: true,
      attemptsCount: record.attempts,
      remainingMinutes: Math.floor(diffMs / 60000),
      remainingSeconds: Math.floor((diffMs % 60000) / 1000)
    });
  }

  if (record.lockUntil && now >= record.lockUntil) {
    serverLockoutMap.delete(identifier);
    return NextResponse.json({
      isLocked: false,
      attemptsCount: 0,
      remainingMinutes: 0,
      remainingSeconds: 0
    });
  }

  return NextResponse.json({
    isLocked: false,
    attemptsCount: record.attempts,
    remainingMinutes: 0,
    remainingSeconds: 0
  });
}

export async function POST(req: NextRequest) {
  try {
    const { identifier = 'global_admin', action } = await req.json();
    const now = Date.now();

    if (action === 'reset') {
      serverLockoutMap.delete(identifier);
      return NextResponse.json({ success: true, isLocked: false, attemptsCount: 0 });
    }

    let record = serverLockoutMap.get(identifier) || { attempts: 0, lockUntil: null, lastAttempt: now };
    
    // Check if currently locked
    if (record.lockUntil && now < record.lockUntil) {
      const diffMs = record.lockUntil - now;
      return NextResponse.json({
        isLocked: true,
        attemptsCount: record.attempts,
        remainingMinutes: Math.floor(diffMs / 60000),
        remainingSeconds: Math.floor((diffMs % 60000) / 1000)
      });
    }

    // Reset attempts if previous lockout expired
    if (record.lockUntil && now >= record.lockUntil) {
      record = { attempts: 0, lockUntil: null, lastAttempt: now };
    }

    const newAttempts = record.attempts + 1;
    let lockUntil = null;
    if (newAttempts >= MAX_ATTEMPTS) {
      lockUntil = now + LOCKOUT_DURATION_MS;
    }

    const updatedRecord: ServerLockoutRecord = {
      attempts: newAttempts,
      lockUntil,
      lastAttempt: now
    };

    serverLockoutMap.set(identifier, updatedRecord);

    const isLocked = lockUntil !== null && now < lockUntil;
    const diffMs = lockUntil ? lockUntil - now : 0;

    return NextResponse.json({
      success: true,
      isLocked,
      attemptsCount: newAttempts,
      remainingMinutes: isLocked ? Math.floor(diffMs / 60000) : 0,
      remainingSeconds: isLocked ? Math.floor((diffMs % 60000) / 1000) : 0
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Lockout error' }, { status: 500 });
  }
}
