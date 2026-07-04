import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Property, PropertyFilters } from '@/types';

export function useProperties(filters?: PropertyFilters) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      let query = supabase
        .from('properties')
        .select(`
          *,
          city:cities(*),
          owner:users(*)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (filters?.city) {
        query = query.eq('city_id', filters.city);
      }

      if (filters?.purpose) {
        query = query.eq('purpose', filters.purpose);
      }

      if (filters?.property_type) {
        query = query.eq('property_type', filters.property_type);
      }

      if (filters?.minPrice) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters?.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters?.beds) {
        query = query.gte('beds', filters.beds);
      }

      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      // Premium listings first
      query = query.order('is_premium', { ascending: false });

      const { data, error } = await query;

      if (error) {
        setError(error.message);
      } else {
        setProperties(data || []);
      }

      setLoading(false);
    };

    fetchProperties();
  }, [filters]);

  return { properties, loading, error };
}

export function useProperty(id: string) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          city:cities(*),
          owner:users(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setProperty(data);
        // Increment view count
        await supabase
          .from('properties')
          .update({ views: (data?.views || 0) + 1 })
          .eq('id', id);
        
        await supabase
          .from('property_views')
          .insert({ property_id: id });
      }

      setLoading(false);
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  return { property, loading, error };
}
