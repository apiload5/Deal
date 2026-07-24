import { supabase } from '../supabase.js';
import { authMiddleware } from '../auth.js';

export default async function handler(req, res) {
    switch(req.method) {
        case 'GET':
            return await getBookings(req, res);
        case 'POST':
            return await createBooking(req, res);
        case 'PUT':
            return await updateBooking(req, res);
        default:
            return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}

async function getBookings(req, res) {
    try {
        await authMiddleware(req, res, async () => {
            const { status, limit = 20, page = 1 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            let query = supabase
                .from('bookings')
                .select(`
                    *,
                    properties!property_id(id, title, city, area, price, images),
                    projects!project_id(id, title, city, area),
                    users!buyer_id(id, name, email, phone),
                    users!seller_id(id, name, email, phone),
                    invoices!booking_id(id, invoice_number, amount, status)
                `)
                .or(`buyer_id.eq.${req.user.id},seller_id.eq.${req.user.id}`)
                .order('created_at', { ascending: false })
                .range(offset, offset + parseInt(limit) - 1);

            if (status) query = query.eq('status', status);

            const { data, error, count } = await query;
            if (error) throw error;

            res.json({ 
                success: true, 
                data: data || [], 
                total: count || 0,
                page: parseInt(page),
                limit: parseInt(limit)
            });
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function createBooking(req, res) {
    try {
        await authMiddleware(req, res, async () => {
            const { 
                property_id, 
                project_id,
                amount, 
                booking_type = 'booking',
                payment_method = 'online',
                notes
            } = req.body;

            if (!property_id && !project_id) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Property ID or Project ID required' 
                });
            }

            // Get property details
            let property = null;
            if (property_id) {
                const { data } = await supabase
                    .from('properties')
                    .select(`
                        *,
                        users!owner_id(id, name, email, phone),
                        agents!agent_id(id, commission_rate, user_id),
                        agencies!agency_id(id, commission_rate, owner_id),
                        builders!builder_id(id, commission_rate, owner_id)
                    `)
                    .eq('id', property_id)
                    .single();
                property = data;
            }

            // Get project details for builder commission
            let project = null;
            if (project_id) {
                const { data } = await supabase
                    .from('projects')
                    .select('*, builders!builder_id(owner_id, commission_rate)')
                    .eq('id', project_id)
                    .single();
                project = data;
            }

            // Calculate commission
            let commission_rate = 0;
            let commission_amount = 0;
            let commission_receiver_type = null;
            let commission_receiver_id = null;

            if (property?.agents) {
                commission_rate = property.agents.commission_rate || 5;
                commission_amount = (amount * commission_rate) / 100;
                commission_receiver_type = 'agent';
                commission_receiver_id = property.agents.user_id;
            } else if (property?.agencies) {
                commission_rate = property.agencies.commission_rate || 5;
                commission_amount = (amount * commission_rate) / 100;
                commission_receiver_type = 'agency';
                commission_receiver_id = property.agencies.owner_id;
            } else if (property?.builders) {
                commission_rate = property.builders.commission_rate || 5;
                commission_amount = (amount * commission_rate) / 100;
                commission_receiver_type = 'builder';
                commission_receiver_id = property.builders.owner_id;
            } else if (project?.builders) {
                commission_rate = project.builders.commission_rate || 5;
                commission_amount = (amount * commission_rate) / 100;
                commission_receiver_type = 'builder';
                commission_receiver_id = project.builders.owner_id;
            }

            // Calculate Deal.pk commission (2%)
            const dealCommission = amount * 0.02;
            const netAmount = amount - dealCommission;

            // Create booking
            const { data: booking, error: bookingError } = await supabase
                .from('bookings')
                .insert([{
                    property_id: property_id || null,
                    project_id: project_id || null,
                    buyer_id: req.user.id,
                    seller_id: property?.owner_id || project?.builders?.owner_id || null,
                    agent_id: property?.agent_id || null,
                    booking_type,
                    amount: netAmount,
                    payment_method,
                    payment_status: 'pending',
                    status: 'pending',
                    commission_amount,
                    commission_status: 'pending',
                    booking_date: new Date().toISOString(),
                    notes: notes || '',
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (bookingError) throw bookingError;

            // Create commission record
            if (commission_amount > 0) {
                await supabase.from('commissions').insert([{
                    booking_id: booking.id,
                    agent_id: property?.agent_id || null,
                    agency_id: property?.agency_id || null,
                    builder_id: property?.builder_id || project?.builder_id || null,
                    amount: commission_amount,
                    rate: commission_rate,
                    status: 'pending',
                    created_at: new Date().toISOString()
                }]);
            }

            // Create invoice
            const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            const { data: invoice, error: invoiceError } = await supabase
                .from('invoices')
                .insert([{
                    booking_id: booking.id,
                    invoice_number: invoiceNumber,
                    buyer_id: req.user.id,
                    seller_id: property?.owner_id || project?.builders?.owner_id || null,
                    agent_id: property?.agent_id || null,
                    amount: amount,
                    tax_amount: dealCommission,
                    total_amount: amount,
                    status: 'pending',
                    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (invoiceError) throw invoiceError;

            // Send notifications
            const notifications = [
                {
                    user_id: property?.owner_id || project?.builders?.owner_id,
                    type: 'new_booking',
                    title: 'New Booking Received',
                    message: `${req.user.user_metadata?.name || 'User'} booked "${property?.title || project?.title || 'Property'}" for PKR ${amount.toLocaleString()}`,
                    data: { booking_id: booking.id },
                    created_at: new Date().toISOString()
                },
                {
                    user_id: req.user.id,
                    type: 'booking_confirmed',
                    title: 'Booking Confirmed',
                    message: `Your booking for "${property?.title || project?.title || 'Property'}" has been confirmed. Invoice #${invoiceNumber}`,
                    data: { booking_id: booking.id, invoice_id: invoice.id },
                    created_at: new Date().toISOString()
                },
                {
                    user_id: process.env.ADMIN_USER_ID || 'admin',
                    type: 'booking_pending',
                    title: 'New Booking Pending Approval',
                    message: `Booking #${booking.id} needs admin approval`,
                    data: { booking_id: booking.id },
                    created_at: new Date().toISOString()
                }
            ];

            // Filter out null user_ids
            const validNotifications = notifications.filter(n => n.user_id);
            if (validNotifications.length > 0) {
                await supabase.from('notifications').insert(validNotifications);
            }

            res.status(201).json({
                success: true,
                data: {
                    booking,
                    invoice,
                    commission: {
                        amount: commission_amount,
                        rate: commission_rate,
                        receiver_type: commission_receiver_type,
                        receiver_id: commission_receiver_id
                    },
                    deal_commission: dealCommission
                },
                message: 'Booking created! Please complete payment to confirm.'
            });
        });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function updateBooking(req, res) {
    try {
        await authMiddleware(req, res, async () => {
            const { id } = req.query;
            const { status, payment_status, notes } = req.body;

            // Check if user owns this booking
            const { data: booking, error: checkError } = await supabase
                .from('bookings')
                .select('buyer_id, seller_id')
                .eq('id', id)
                .single();

            if (checkError) throw checkError;

            const role = await getUserRole(req.user.id);
            if (booking.buyer_id !== req.user.id && 
                booking.seller_id !== req.user.id && 
                role !== 'admin') {
                return res.status(403).json({ 
                    success: false, 
                    error: 'Not authorized to update this booking' 
                });
            }

            const updateData = {
                updated_at: new Date().toISOString()
            };

            if (status) updateData.status = status;
            if (payment_status) updateData.payment_status = payment_status;
            if (notes) updateData.notes = notes;

            const { data, error } = await supabase
                .from('bookings')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // If booking is confirmed/paid, update property status
            if (status === 'confirmed' || status === 'completed') {
                if (data.property_id) {
                    await supabase
                        .from('properties')
                        .update({ 
                            status: status === 'confirmed' ? 'sold' : 'rented',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', data.property_id);
                }
            }

            // Notify user
            await supabase.from('notifications').insert([{
                user_id: data.buyer_id,
                type: 'booking_updated',
                title: `Booking ${status || 'Updated'}`,
                message: `Your booking #${data.id} has been ${status || 'updated'}`,
                data: { booking_id: data.id },
                created_at: new Date().toISOString()
            }]);

            res.json({ success: true, data });
        });
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getUserRole(userId) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single();
        if (error) throw error;
        return data?.role || 'user';
    } catch (error) {
        return 'user';
    }
}
