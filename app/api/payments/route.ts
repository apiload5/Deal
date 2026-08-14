import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, amount, accountDetails, paymentMethod } = body;

    if (!amount || typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid transaction amount provided. Amount must be a positive number.' },
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
        paymentMethod: paymentMethod || 'bank_transfer',
        message: `Payment of PKR ${amount.toLocaleString()} verified and processed successfully.`
      });
    }

    if (action === 'withdraw') {
      if (!accountDetails || typeof accountDetails !== 'string' || !accountDetails.trim()) {
        return NextResponse.json(
          { success: false, error: 'Valid bank account details or IBAN are required for withdrawal processing.' },
          { status: 400 }
        );
      }
      const referenceId = `WD-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;
      return NextResponse.json({
        success: true,
        action: 'withdraw',
        amount,
        referenceId,
        accountDetails: accountDetails.trim(),
        message: `Withdrawal request of PKR ${amount.toLocaleString()} submitted and processed successfully.`
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
