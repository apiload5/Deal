import { supabase } from './supabase.js';
import { authMiddleware } from './auth.js';
import crypto from 'crypto';

const RAPIDPAISA_MERCHANT_ID = process.env.RAPIDPAISA_MERCHANT_ID;
const RAPIDPAISA_SECRET_KEY = process.env.RAPIDPAISA_SECRET_KEY;
const RAPIDPAISA_URL = process.env.RAPIDPAISA_URL || 'https://app.rapidpaisa.com/api/payment';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        await authMiddleware(req, res, async () => {
            const { type, id, duration, amount } = req.body;
            
            if (!type || !id || !duration || !amount) {
                return res.status(400).json({
                    success: false,
                    error: 'type, id, duration, and amount are required'
                });
            }

            const order_id = `DEALPK-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

            const payload = {
                merchant_id: RAPIDPAISA_MERCHANT_ID,
                order_id: order_id,
                amount: amount,
                currency: 'PKR',
                customer_email: req.user.email,
                customer_name: req.user.user_metadata?.name || 'Customer',
                return_url: `${process.env.FRONTEND_URL || 'https://deal.pk'}/payment/success`,
                cancel_url: `${process.env.FRONTEND_URL || 'https://deal.pk'}/payment/cancel`,
                webhook_url: `${process.env.BACKEND_URL || 'https://deal.pk'}/api/payment/webhook`
            };

            // Generate signature
            const signature = crypto
                .createHmac('sha256', RAPIDPAISA_SECRET_KEY)
                .update(JSON.stringify(payload))
                .digest('hex');

            // Save pending payment
            await supabase.from('payments').insert([{
                order_id,
                user_id: req.user.id,
                type,
                item_id: id,
                duration,
                amount,
                status: 'pending'
            }]);

            res.json({
                success: true,
                payment_url: RAPIDPAISA_URL,
                payload,
                signature,
                order_id
            });
        });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
