import { Booking, BookingStatus, PaymentStatus } from '../types';
import { INITIAL_BOOKINGS } from '../data/mockData';
import { supabaseService } from '../lib/supabase';

export class BookingService {
  private static instance: BookingService;
  private bookings: Booking[] = [...INITIAL_BOOKINGS];
  private listeners: ((bookings: Booking[]) => void)[] = [];

  private constructor() {
    this.initBookings();
  }

  public static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService();
    }
    return BookingService.instance;
  }

  private async initBookings() {
    if (typeof window === 'undefined') return;
    try {
      const cloudBookings = await supabaseService.getBookings();
      if (cloudBookings && cloudBookings.length > 0) {
        const map = new Map<string, Booking>();
        this.bookings.forEach(b => map.set(b.id, b));
        cloudBookings.forEach((b: any) => {
          map.set(b.id, {
            id: b.id,
            propertyId: b.property_id || b.propertyId,
            propertyTitle: b.property_title || b.propertyTitle,
            propertyPrice: Number(b.property_price || b.propertyPrice) || 0,
            propertyImage: b.property_image || b.propertyImage,
            buyerId: b.buyer_id || b.buyerId,
            buyerName: b.buyer_name || b.buyerName,
            buyerEmail: b.buyer_email || b.buyerEmail || '',
            buyerPhone: b.buyer_phone || b.buyerPhone || '',
            sellerId: b.seller_id || b.sellerId,
            sellerName: b.seller_name || b.sellerName,
            sellerRole: b.seller_role || b.sellerRole || 'user',
            bookingType: b.booking_type || b.bookingType || 'token',
            amountPaid: Number(b.amount_paid || b.amountPaid) || 0,
            totalAmount: Number(b.total_amount || b.totalAmount) || 0,
            platformFee: Number(b.platform_fee || b.platformFee) || 0,
            agentCommission: Number(b.agent_commission || b.agentCommission) || 0,
            paymentMethod: b.payment_method || b.paymentMethod || 'raast',
            paymentStatus: (b.payment_status as PaymentStatus) || 'pending',
            bookingStatus: (b.booking_status as BookingStatus) || 'pending',
            transactionId: b.transaction_id || b.transactionId || `tx-${Date.now()}`,
            escrowHoldDate: b.escrow_hold_date || b.escrowHoldDate || new Date().toISOString(),
            notes: b.notes,
            createdAt: b.created_at || b.createdAt || new Date().toISOString()
          });
        });
        this.bookings = Array.from(map.values());
        this.notify();
      }
    } catch (e) {
      console.warn('Booking init sync notice:', e);
    }
  }

  public subscribe(listener: (bookings: Booking[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.bookings);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.bookings));
  }

  public getAllBookings(): Booking[] {
    return this.bookings;
  }

  public getUserBookings(userId: string): Booking[] {
    return this.bookings.filter(b => b.buyerId === userId || b.sellerId === userId);
  }

  public getAgentBookings(agentId: string): Booking[] {
    return this.bookings.filter(b => b.sellerId === agentId);
  }

  public async createBooking(data: Omit<Booking, 'id' | 'createdAt' | 'bookingStatus' | 'paymentStatus' | 'transactionId' | 'escrowHoldDate'>): Promise<Booking> {
    const newBooking: Booking = {
      ...data,
      id: `book-${Date.now()}`,
      bookingStatus: 'pending',
      paymentStatus: 'pending',
      transactionId: `TXN-${Date.now()}`,
      escrowHoldDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    this.bookings = [newBooking, ...this.bookings];
    this.notify();

    await supabaseService.upsertBooking(newBooking).catch(() => {});
    return newBooking;
  }

  public async updateBookingStatus(id: string, bookingStatus: BookingStatus, notes?: string): Promise<Booking | null> {
    const index = this.bookings.findIndex(b => b.id === id);
    if (index === -1) return null;

    const updated = {
      ...this.bookings[index],
      bookingStatus,
      notes: notes !== undefined ? notes : this.bookings[index].notes
    };
    this.bookings[index] = updated;
    this.notify();

    await supabaseService.upsertBooking(updated).catch(() => {});
    return updated;
  }

  public async cancelBooking(id: string): Promise<boolean> {
    return (await this.updateBookingStatus(id, 'cancelled')) !== null;
  }
}

export const bookingService = BookingService.getInstance();
