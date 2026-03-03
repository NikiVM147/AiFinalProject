/**
 * admin.js — Service layer for admin CRUD operations.
 * All functions require the caller to be authenticated as admin.
 */
import { supabase } from './supabase.js';

// ── Products ─────────────────────────────────────────────────────────────────

export async function adminGetProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(
      `id, name, slug, brand, description, price_cents, currency, stock, is_active, style,
       category:categories ( id, name, slug ),
       images:product_images ( id, path, alt, sort_order )`
    )
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((p) => ({
    ...p,
    images: (p.images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order),
  }));
}

export async function adminCreateProduct(fields) {
  const { data, error } = await supabase
    .from('products')
    .insert([fields])
    .select('id')
    .single();

  if (error) throw error;
  return data;
}

export async function adminUpdateProduct(id, fields) {
  const { error } = await supabase
    .from('products')
    .update(fields)
    .eq('id', id);

  if (error) throw error;
}

export async function adminDeleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ── Product images ────────────────────────────────────────────────────────────

/**
 * Uploads a file to Supabase Storage and inserts a product_images record.
 * @param {string} productId
 * @param {File} file
 * @param {number} sortOrder
 * @returns {Promise<{id: string, path: string}>}
 */
export async function adminUploadProductImage(productId, file, sortOrder = 0) {
  const ext = file.name.split('.').pop();
  const storagePath = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(storagePath, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data, error: dbError } = await supabase
    .from('product_images')
    .insert([{ product_id: productId, path: storagePath, alt: file.name, sort_order: sortOrder }])
    .select('id, path')
    .single();

  if (dbError) throw dbError;
  return data;
}

/**
 * Deletes a product image from Storage and removes the DB record.
 */
export async function adminDeleteProductImage(imageId, storagePath) {
  // Only remove from storage if it's a storage path (not an external URL)
  if (storagePath && !storagePath.startsWith('http')) {
    await supabase.storage.from('product-images').remove([storagePath]);
  }

  const { error } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId);

  if (error) throw error;
}

/**
 * Updates the sort_order of multiple product images at once.
 * @param {{id: string, sort_order: number}[]} imageOrders
 */
export async function adminUpdateImageSortOrders(imageOrders) {
  await Promise.all(
    imageOrders.map(({ id, sort_order }) =>
      supabase.from('product_images').update({ sort_order }).eq('id', id)
    )
  );
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function adminGetCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function adminCreateCategory(name, slug) {
  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, slug }])
    .select('id, name, slug')
    .single();

  if (error) throw error;
  return data;
}

export async function adminDeleteCategory(id) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function adminGetAllOrders() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id, user_id, status, total_cents, currency, shipping_address, created_at, updated_at,
      items:order_items(id, product_name, unit_price_cents, quantity)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const userIds = [...new Set((orders ?? []).map((o) => o.user_id))];
  let profileMap = {};
  if (userIds.length) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name, phone')
      .in('user_id', userIds);
    (profiles ?? []).forEach((p) => { profileMap[p.user_id] = p; });
  }

  return (orders ?? []).map((o) => ({ ...o, profile: profileMap[o.user_id] ?? null }));
}

export async function adminUpdateOrderStatus(orderId, status) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  if (error) throw error;
}
