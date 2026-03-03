import { supabase } from './supabase.js';

export async function getMyProfile() {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateMyProfile(patch) {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function getMyDefaultAddress() {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertMyDefaultAddress({ full_name, phone, line1, line2 = '', city, postal_code, country = 'BG' }) {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('Not authenticated');

  // Check if a default address already exists
  const { data: existing } = await supabase
    .from('addresses')
    .select('id')
    .eq('user_id', userId)
    .eq('is_default', true)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from('addresses')
      .update({ full_name, phone, line1, line2, city, postal_code, country })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('addresses')
      .insert({ user_id: userId, full_name, phone, line1, line2, city, postal_code, country, is_default: true });
    if (error) throw error;
  }
}
