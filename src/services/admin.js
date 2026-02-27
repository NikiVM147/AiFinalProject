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

// ── Categories ────────────────────────────────────────────────────────────────

export async function adminGetCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}
