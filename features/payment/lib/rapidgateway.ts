import crypto from 'crypto'

const MERCHANT_ID = process.env.RAPID_MERCHANT_ID || ''
const API_KEY = process.env.RAPID_API_KEY || ''
const RETURN_URL = process.env.RAPID_RETURN_URL || 'http://localhost:3000/payment/success'

export interface RapidPaymentResponse {
  orderId: string
  paymentUrl: string
}

export async function createRapidPayment(
  amount: number,
  type: string,
  agentId: string,
  propertyId?: string
): Promise<RapidPaymentResponse> {
  // If no merchant ID, return mock for development
  if (!MERCHANT_ID || !API_KEY) {
    console.warn('RapidGateway: Missing credentials, using mock mode')
    const mockOrderId = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return {
      orderId: mockOrderId,
      paymentUrl: `${RETURN_URL}?orderId=${mockOrderId}&amount=${amount}&type=${type}`,
    }
  }

  const orderId = `DEAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // In production, you would make an actual API call to RapidGateway
  // For now, we'll simulate the response
  const paymentData = {
    merchant_id: MERCHANT_ID,
    order_id: orderId,
    amount: amount,
    currency: 'PKR',
    return_url: RETURN_URL,
    cancel_url: RETURN_URL,
    signature: generateSignature(orderId, amount),
  }

  // In production, this would be a POST request to RapidGateway API
  // const response = await fetch('https://api.rapidgateway.pk/v1/payment', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${API_KEY}`,
  //   },
  //   body: JSON.stringify(paymentData),
  // })
  // const data = await response.json()

  // Mock response for development
  return {
    orderId,
    paymentUrl: `https://sandbox.rapidgateway.pk/pay/${orderId}`,
  }
}

export function generateSignature(orderId: string, amount: number): string {
  const secret = process.env.RAPID_SECRET_KEY || 'test_secret'
  const data = `${MERCHANT_ID}|${orderId}|${amount}|PKR|${RETURN_URL}`
  return crypto.createHash('sha256').update(data + secret).digest('hex')
}

export function verifyRapidHash(params: Record<string, string>): boolean {
  const { order_id, amount, status, signature } = params
  
  if (!MERCHANT_ID) {
    // In development, accept all signatures
    return true
  }

  const secret = process.env.RAPID_SECRET_KEY || 'test_secret'
  const data = `${MERCHANT_ID}|${order_id}|${amount}|PKR|${status}`
  const calculatedSignature = crypto
    .createHash('sha256')
    .update(data + secret)
    .digest('hex')

  return calculatedSignature === signature
}

export function validatePaymentStatus(status: string): boolean {
  return ['PAID', 'COMPLETED', 'SUCCESS'].includes(status.toUpperCase())
}
