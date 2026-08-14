import { createClient } from '@supabase/supabase-js';

// Public Supabase configuration for browser client
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fkkqbssxzkyccyvqnhaf.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_dWOBJxM0DwMvTjnNgpNkyg_nCNIF7VK';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};

// Database helper functions for DealFast entities in Supabase
export const supabaseService = {
  // --- PROPERTIES ---
  async getProperties() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.warn('Supabase getProperties notice:', error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.warn('Supabase getProperties exception:', e);
      return null;
    }
  },

  async upsertProperty(property: any) {
    try {
      const payload = {
        ...property,
        images: Array.isArray(property.images) ? property.images : [],
        features: Array.isArray(property.features) ? property.features : [],
        updated_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('properties').upsert(payload).select();
      if (error) {
        console.warn('Supabase upsertProperty error:', error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.warn('Supabase upsertProperty notice:', e);
      return null;
    }
  },

  async deleteProperty(propertyId: string) {
    try {
      const { error } = await supabase.from('properties').delete().eq('id', propertyId);
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('Supabase deleteProperty notice:', e);
      return false;
    }
  },

  // --- USERS PROFILES ---
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) return null;
      return data;
    } catch {
      return null;
    }
  },

  async upsertUserProfile(user: any) {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          role: user.role || 'user',
          avatar: user.avatar || '',
          kyc_status: user.kycStatus || 'none',
          is_overseas_pakistani: Boolean(user.isOverseasPakistani),
          overseas_country: user.overseasCountry || '',
          nicop_number: user.nicopNumber || '',
          has_rda_account: Boolean(user.hasRdaAccount),
          updated_at: new Date().toISOString()
        })
        .select();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn('Supabase upsertUserProfile notice:', e);
      return null;
    }
  },

  // --- BOOKINGS & ESCROW ---
  async getBookings() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return null;
      return data;
    } catch {
      return null;
    }
  },

  async upsertBooking(booking: any) {
    try {
      const { data, error } = await supabase.from('bookings').upsert({
        ...booking,
        updated_at: new Date().toISOString()
      }).select();
      if (error) throw error;
      return data;
    } catch {
      return null;
    }
  },

  // --- CHAT MESSAGES & ROOMS ---
  async getChatMessages(roomId: string) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('timestamp', { ascending: true });
      if (error) return null;
      return data;
    } catch {
      return null;
    }
  },

  async saveChatMessage(message: any) {
    try {
      const { data, error } = await supabase.from('chat_messages').upsert({
        id: message.id,
        room_id: message.roomId || message.room_id,
        sender_id: message.senderId || message.sender_id,
        sender_name: message.senderName || message.sender_name,
        sender_role: message.senderRole || message.sender_role,
        message: message.message || message.text || '',
        timestamp: message.timestamp || new Date().toISOString(),
        is_read: Boolean(message.isRead),
        attachments: message.attachments || []
      }).select();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn('Supabase saveChatMessage notice:', e);
      return null;
    }
  },

  // --- INQUIRIES ---
  async saveInquiry(inquiry: any) {
    try {
      const { data, error } = await supabase.from('inquiries').upsert({
        ...inquiry,
        created_at: inquiry.created_at || new Date().toISOString()
      }).select();
      if (error) throw error;
      return data;
    } catch {
      return null;
    }
  },

  // --- WALLET & ESCROW ---
  async getWallet(userId: string) {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) return null;
      return data;
    } catch {
      return null;
    }
  },

  async saveWallet(wallet: any) {
    try {
      const { data, error } = await supabase.from('wallets').upsert({
        user_id: wallet.userId || wallet.user_id,
        balance: wallet.balance || 0,
        currency: wallet.currency || 'PKR',
        transactions: wallet.transactions || [],
        updated_at: new Date().toISOString()
      }).select();
      if (error) throw error;
      return data;
    } catch {
      return null;
    }
  },

  // Realtime subscription helper
  subscribeToChat(roomId: string, onNewMessage: (msg: any) => void) {
    try {
      return supabase
        .channel(`chat_room_${roomId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `room_id=eq.${roomId}`,
          },
          (payload) => {
            onNewMessage(payload.new);
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Supabase realtime subscription notice:', e);
      return null;
    }
  },

  subscribeToProperties(onUpdate: () => void) {
    try {
      return supabase
        .channel('properties_feed')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'properties' },
          () => {
            onUpdate();
          }
        )
        .subscribe();
    } catch {
      return null;
    }
  }
};
