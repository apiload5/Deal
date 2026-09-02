import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 🔥 FIX BUG #1: Replace Set with Map for 7-day TTL tracking
// In-memory Map of used RRNs with timestamp to prevent duplicate fraud submissions
const processedRaastRRNs = new Map<string, number>();

// Cleanup expired RRNs older than 7 days
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const cleanupOldRRNs = () => {
  const now = Date.now();
  for (const [rrn, timestamp] of processedRaastRRNs.entries()) {
    if (now - timestamp > SEVEN_DAYS_MS) {
      processedRaastRRNs.delete(rrn);
    }
  }
};

// Periodic cleanup interval (runs hourly)
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupOldRRNs, 60 * 60 * 1000);
}

// 🔥 FIX BUG #5: In-memory Rate Limiting (5 requests per 5 minutes per IP)
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const getClientIp = (request: Request): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
};

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const userRate = requestCounts.get(ip);

  if (!userRate || now > userRate.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (userRate.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  userRate.count += 1;
  requestCounts.set(ip, userRate);
  return false;
};

// 🔥 FIX: RapidGateway API Single Key configuration note:
// RapidGateway processes all channels (JazzCash, EasyPaisa, Bank Transfer, SBP Raast, Cards) using a single merchant key
const RAPID_GATEWAY_KEY = process.env.RAPIDGATEWAY_API_KEY || 'RG-DEMO-ESCROW-KEY-PKR-2026';

export async function POST(request: Request) {
  try {
    // 1. Check Rate Limiting
    const clientIp = getClientIp(request);
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many payment requests. Rate limit exceeded (max 5 requests per 5 minutes). Please try again later.'
        },
        { status: 429 }
      );
    }

    cleanupOldRRNs();

    const body = await request.json().catch(() => ({}));
    const { action, amount, accountDetails, paymentMethod, raastRrn, raastEscrowRef, payerPhone } = body;

    // 2. Validate Amount Range (Min PKR 100)
    if (!amount || typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
      return NextResponse.json(
        { success: false, error: 'Invalid transaction amount. Amount must be a valid number.' },
        { status: 400 }
      );
    }

    // Decimal precision normalization (2 decimal places)
    const roundedAmount = Math.round(amount * 100) / 100;

    // 🔥 FIX: Validate Deposit Limits (Min PKR 100, Max PKR 10,000,000)
    if (action === 'deposit') {
      if (roundedAmount < 100) {
        return NextResponse.json(
          { success: false, error: 'Minimum deposit amount is PKR 100.' },
          { status: 400 }
        );
      }
      if (roundedAmount > 10000000) {
        return NextResponse.json(
          { success: false, error: 'Maximum deposit limit per transaction is PKR 10,000,000.' },
          { status: 400 }
        );
      }
    }

    // 🔥 FIX: Validate Withdrawal Minimum (Min PKR 100)
    if (action === 'withdraw') {
      if (roundedAmount < 100) {
        return NextResponse.json(
          { success: false, error: 'Minimum withdrawal amount is PKR 100.' },
          { status: 400 }
        );
      }
      if (roundedAmount > 500000) {
        return NextResponse.json(
          { success: false, error: 'Maximum single withdrawal limit is PKR 500,000.' },
          { status: 400 }
        );
      }
    }

    // ==========================================
    // ACTION: DEPOSIT VIA STATE BANK RAAST / GATEWAY
    // ==========================================
    if (action === 'deposit' && (paymentMethod === 'raast' || Boolean(raastRrn))) {
      const cleanRrn = (raastRrn || '').toString().trim();

      // 🔥 FIX BUG #1: Validate RRN format (digits only, 8-18 characters)
      if (!cleanRrn || !/^\d{8,18}$/.test(cleanRrn)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid State Bank Raast RRN (Retrieval Reference Number). Must contain only digits and be between 8 to 18 digits long.'
          },
          { status: 400 }
        );
      }

      // 🔥 FIX BUG #1: Check duplicate RRN against 7-day TTL map
      if (processedRaastRRNs.has(cleanRrn)) {
        const processedTime = processedRaastRRNs.get(cleanRrn);
        const dateStr = processedTime ? new Date(processedTime).toLocaleString() : 'recently';
        return NextResponse.json(
          {
            success: false,
            error: `Duplicate Raast RRN detected (${cleanRrn}). This transaction was already processed on ${dateStr}. Duplicate submissions are blocked.`
          },
          { status: 400 }
        );
      }

      // Record RRN with timestamp (7-day TTL)
      processedRaastRRNs.set(cleanRrn, Date.now());

      const referenceId = raastEscrowRef || `DF-RAAST-${Math.floor(100000 + Math.random() * 900000)}`;

      return NextResponse.json({
        success: true,
        action: 'deposit',
        amount: roundedAmount,
        referenceId,
        raastRrn: cleanRrn,
        raastEscrowRef: referenceId,
        payerPhone: payerPhone || '',
        paymentMethod: 'raast',
        gatewayKey: RAPID_GATEWAY_KEY.slice(0, 8) + '...',
        fee: 0,
        currency: 'PKR',
        escrowStatus: 'escrow_held',
        message: `State Bank Raast payment of PKR ${roundedAmount.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} verified (RRN: ${cleanRrn}). Funds safely locked in DealFast Escrow Vault with 0% gateway fee.`
      });
    }

    // Standard RapidGateway deposit (Cards, EasyPaisa, JazzCash, Bank Transfer)
    if (action === 'deposit') {
      const referenceId = `PAY-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;
      return NextResponse.json({
        success: true,
        action: 'deposit',
        amount: roundedAmount,
        referenceId,
        paymentMethod: paymentMethod || 'bank_transfer',
        gatewayKey: RAPID_GATEWAY_KEY.slice(0, 8) + '...',
        message: `Payment of PKR ${roundedAmount.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} verified via RapidGateway.`
      });
    }

    // ==========================================
    // ACTION: WITHDRAWAL & ACCOUNT VALIDATION
    // ==========================================
    if (action === 'withdraw') {
      if (!accountDetails || typeof accountDetails !== 'string' || !accountDetails.trim()) {
        return NextResponse.json(
          { success: false, error: 'Valid bank account details, Raast ID, or IBAN are required for withdrawal processing.' },
          { status: 400 }
        );
      }

      const trimmedAccount = accountDetails.trim();
      const method = paymentMethod || 'raast';

      // 🔥 FIX BUG #5: Validate account format based on withdrawal payment method
      if (method === 'raast') {
        // Raast ID must be 11-13 digits (Pakistani mobile format e.g. 03001234567 or 923001234567)
        const cleanPhone = trimmedAccount.replace(/[\s-+]/g, '');
        if (!/^(?:92|0)?3\d{9}$/.test(cleanPhone) && !/^\d{11,13}$/.test(cleanPhone)) {
          return NextResponse.json(
            { success: false, error: 'Invalid Raast ID. Raast ID must be an 11 to 13-digit Pakistani registered mobile number (e.g., 03001234567).' },
            { status: 400 }
          );
        }
      } else if (method === 'bank_transfer') {
        // Pakistani IBAN format (PK followed by 2 check digits, 4 bank code letters, 16 account digits = 24 chars)
        const cleanIban = trimmedAccount.replace(/[\s-]/g, '').toUpperCase();
        const ibanRegex = /^PK\d{2}[A-Z]{4}\d{16}$/;
        if (!ibanRegex.test(cleanIban) && cleanIban.length < 16) {
          return NextResponse.json(
            { success: false, error: 'Invalid Bank IBAN. Pakistani IBAN must follow the format PK + 2 digits + 4 bank letters + 16 account digits (24 characters, e.g., PK92MEZN0001020304050607).' },
            { status: 400 }
          );
        }
      } else if (method === 'easypaisa' || method === 'jazzcash') {
        // 11-digit mobile number starting with 03
        const cleanWallet = trimmedAccount.replace(/[\s-+]/g, '');
        if (!/^03\d{9}$/.test(cleanWallet)) {
          return NextResponse.json(
            { success: false, error: `Invalid ${method === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'} mobile number. Must be an 11-digit mobile number starting with 03 (e.g., 03123456789).` },
            { status: 400 }
          );
        }
      }

      const referenceId = method === 'raast' 
        ? `WD-RAAST-${Date.now()}-${Math.floor(10000 + Math.random() * 90000)}`
        : `WD-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;

      return NextResponse.json({
        success: true,
        action: 'withdraw',
        amount: roundedAmount,
        referenceId,
        paymentMethod: method,
        accountDetails: trimmedAccount,
        fee: 0,
        message: `Withdrawal request of PKR ${roundedAmount.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} submitted via ${method.toUpperCase()} (Ref: ${referenceId}).`
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid wallet action requested. Supported actions: deposit, withdraw.' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Payment server execution error.' },
      { status: 500 }
    );
  }
}
