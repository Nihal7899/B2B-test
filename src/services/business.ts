import { supabase } from '@/lib/supabase';
import type { Business, BusinessOutlet, DeliveryAddress } from '@/types';

export async function fetchBusinesses(): Promise<Business[]> {
  const { data, error } = await supabase.from('businesses').select('*').order('created_at', { ascending: true });
  if (error) throw error;
  return (data as Business[]) ?? [];
}

export async function createBusiness(input: {
  business_name: string;
  business_type?: string;
  gst_registered: boolean;
  gstin?: string;
}): Promise<Business | null> {
  const { data, error } = await supabase.from('businesses').insert({
    business_name: input.business_name,
    business_type: input.business_type ?? 'restaurant',
    gst_registered: input.gst_registered,
    gstin: input.gst_registered ? (input.gstin ?? null) : null,
    gst_verification_status: input.gst_registered && input.gstin ? 'pending' : 'pending',
  }).select().single();
  if (error) throw error;
  return data as Business;
}

export async function updateBusiness(id: string, updates: Partial<Business>): Promise<void> {
  const { error } = await supabase.from('businesses').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteBusiness(id: string): Promise<void> {
  await supabase.from('businesses').delete().eq('id', id);
}

export async function fetchOutlets(businessId: string): Promise<BusinessOutlet[]> {
  const { data, error } = await supabase.from('business_outlets').select('*').eq('business_id', businessId).order('is_default', { ascending: false }).order('created_at', { ascending: false });
  if (error) throw error;
  return (data as BusinessOutlet[]) ?? [];
}

export async function createOutlet(input: {
  business_id: string;
  outlet_name: string;
  outlet_type?: string;
  phone?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  latitude?: number | null;
  longitude?: number | null;
  is_default?: boolean;
}): Promise<BusinessOutlet | null> {
  if (input.is_default) {
    await supabase.from('business_outlets').update({ is_default: false }).eq('business_id', input.business_id).eq('is_default', true);
  }
  const { data, error } = await supabase.from('business_outlets').insert({
    business_id: input.business_id,
    outlet_name: input.outlet_name,
    outlet_type: input.outlet_type ?? 'shop',
    phone: input.phone ?? null,
    address_line_1: input.address_line_1,
    address_line_2: input.address_line_2 ?? null,
    city: input.city,
    state: input.state,
    pincode: input.pincode,
    landmark: input.landmark ?? null,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    is_default: input.is_default ?? false,
    is_active: true,
  }).select().single();
  if (error) throw error;
  return data as BusinessOutlet;
}

export async function deleteOutlet(id: string): Promise<void> {
  await supabase.from('business_outlets').delete().eq('id', id);
}

export async function fetchDeliveryAddresses(businessId?: string): Promise<DeliveryAddress[]> {
  let query = supabase.from('addresses').select('*').order('is_default', { ascending: false }).order('created_at', { ascending: false });
  if (businessId) query = query.eq('business_id', businessId);
  const { data, error } = await query;
  if (error) return [];
  return (data as DeliveryAddress[]) ?? [];
}

export async function saveDeliveryAddress(addr: Partial<DeliveryAddress> & { recipient_name: string; phone: string; line1: string; city: string; state: string; postal_code: string }): Promise<DeliveryAddress | null> {
  if (addr.is_default) {
    await supabase.from('addresses').update({ is_default: false }).eq('is_default', true).eq('user_id', addr.user_id ?? '');
  }
  const insertData: Record<string, unknown> = {
    label: addr.label ?? 'Business',
    recipient_name: addr.recipient_name,
    phone: addr.phone,
    line1: addr.line1,
    line2: addr.line2 ?? '',
    city: addr.city,
    state: addr.state,
    postal_code: addr.postal_code,
    latitude: addr.latitude,
    longitude: addr.longitude,
    place_id: addr.place_id,
    is_default: addr.is_default ?? false,
  };
  if (addr.business_id !== undefined) insertData.business_id = addr.business_id;

  const { data, error } = await supabase.from('addresses').insert(insertData).select().single();
  if (error) throw error;
  return data as DeliveryAddress;
}

export async function deleteDeliveryAddress(id: string): Promise<void> {
  await supabase.from('addresses').delete().eq('id', id);
}

export async function updateProfileRegistration(personalName: string, businessName?: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({
    personal_name: personalName,
    registration_status: 'registered',
    full_name: personalName,
    business_name: businessName ?? '',
  }).eq('id', (await supabase.auth.getUser()).data.user?.id ?? '');
  if (error) throw error;
}
