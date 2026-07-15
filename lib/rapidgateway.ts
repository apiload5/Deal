export interface RapidGatewayPaymentRequest {
  merchantId: string
  orderId: string
  amount: number
  currency: string
  returnUrl: string
  cancelUrl: string
  customerEmail?: string
  customerName?: string
  customerPhone?: string
}

export interface RapidGatewayPaymentResponse {
  orderId: string
  paymentUrl: string
  status: string
  transactionId?: string
}

export class RapidGateway {
  private merchantId: string
  private apiKey: string
  private secretKey: string
  private baseUrl: string

  constructor() {
    this.merchantId = process.env.RAPID_MERCHANT_ID || ''
    this.apiKey = process.env.RAPID_API_KEY || ''
    this.secretKey = process.env.RAPID_SECRET_KEY || ''
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.rapidgateway.pk/v1'
      : 'https://sandbox.rapidgateway.pk/v1'
  }

  async createPayment(request: RapidGatewayPaymentRequest): Promise<RapidGatewayPaymentResponse> {
    const response = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Merchant-Id': this.merchantId,
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({
        ...request,
        signature: this.generateSignature(request),
      }),
    })

    if (!response.ok) {
      throw new Error(`Payment creation failed: ${response.statusText}`)
    }

    return response.json()
  }

  async verifyPayment(orderId: string): Promise<{ status: string; amount: number }> {
    const response = await fetch(`${this.baseUrl}/payments/${orderId}/verify`, {
      method: 'GET',
      headers: {
        'X-Merchant-Id': this.merchantId,
        'X-API-Key': this.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`Payment verification failed: ${response.statusText}`)
    }

    return response.json()
  }

  private generateSignature(request: RapidGatewayPaymentRequest): string {
    const payload = `${this.merchantId}|${request.orderId}|${request.amount}|${request.currency}`
    // In production, use crypto to generate proper signature
    return Buffer.from(payload + this.secretKey).toString('base64')
  }
}

export const rapidGateway = new RapidGateway()
