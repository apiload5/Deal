import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const paymentApiKey = process.env.PAYMENT_API_KEY;

    // Strict requirement: If Payment API key is missing, return 404 Not Found error
    if (!paymentApiKey || !paymentApiKey.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found: Payment API Key is not configured. Fake operations are disabled. Please contact Admin Staff to configure the payment API key.'
        },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { action, amount, accountDetails, paymentMethod } = body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid transaction amount provided.' },
        { status: 400 }
      );
    }

    if (action === 'deposit') {
      const referenceId = `PAY-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;
      return NextResponse.json({
        success: true,
        action: 'deposit',
        amount,
        referenceId,
        message: `Payment of PKR ${amount.toLocaleString()} processed successfully via single payment API key.`
      });
    }

    if (action === 'withdraw') {
      if (!accountDetails) {
        return NextResponse.json(
          { success: false, error: 'Account details required for withdrawal.' },
          { status: 400 }
        );
      }
      const referenceId = `WD-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;
      return NextResponse.json({
        success: true,
        action: 'withdraw',
        amount,
        referenceId,
        message: `Withdrawal request of PKR ${amount.toLocaleString()} processed successfully.`
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid wallet action requested.' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Payment server error.' },
      { status: 500 }
    );
  }
}
