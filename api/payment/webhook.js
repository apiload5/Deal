import { supabase } from '../_lib/supabase.js';
import crypto from 'crypto';

const RAPIDPAISA_SECRET_KEY = process.env.RAPIDPAISA_SECRET_KEY;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        // Verify webhook signature
        const signature = req.headers['x-rapidpaisa-signature'];
        const payload = JSON.stringify(req.body);
        const expectedSignature = crypto
            .createHmac('sha256', RAPIDPAISA_SECRET_KEY)
            .update(payload)
            .digest('hex');

        if (signature !== expectedSignature) {
            return res.status(401).json({ success: false, error: 'Invalid signature' });
        }

        const { order_id, status, transaction_id } = req.body;

        if (!order_id) {
            return res.status(400).json({ success: false, error: 'order_id is required' });
        }

        // Get payment record
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .select('*')
            .eq('order_id', order_id)
            .single();

        if (paymentError || !payment) {
            console.error('Payment not found:', order_id);
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }

        if (status === 'success') {
            // Update the item to premium
            const table = payment.type + 's';
            const expires = new Date(Date.now() + payment.duration * 24 * 60 * 60 * 1000);

            await supabase
                .from(table)
                .update({
                    is_premium: true,
                    premium_expires_at: expires.toISOString()
                })
                .eq('id', payment.item_id);

            // Update payment status
            await supabase
                .from('payments')
                .update({
                    status: 'completed',
                    transaction_id,
                    completed_at: new Date().toISOString()
                })
                .eq('order_id', order_id);

            console.log(`Payment completed: ${order_id}`);
        } else {
            await supabase
                .from('payments')
                .update({
                    status: 'failed',
                    transaction_id,
                    completed_at: new Date().toISOString()
                })
                .eq('order_id', order_id);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
