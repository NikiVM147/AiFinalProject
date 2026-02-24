import { supabase } from './supabase.js';

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getProducts({ categorySlug } = {}) {
  let categoryId;
  if (categorySlug) {
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (categoryError) throw categoryError;
    categoryId = category.id;
  }

  let query = supabase
    .from('products')
    .select(
      `
      id,
      name,
      slug,
      description,
      price_cents,
      currency,
      stock,
      is_active,
      category:categories ( id, name, slug ),
      images:product_images ( path, alt, sort_order )
    `
    )
    .order('created_at', { ascending: false });

  if (categoryId) query = query.eq('category_id', categoryId);

  const { data, error } = await query;
  if (error) throw error;

  // Ensure images are sorted in JS (Supabase nested ordering can be tricky)
  return (data ?? []).map((p) => ({
    ...p,
    images: (p.images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order),
  }));
}

export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select(
      `
      id,
      name,
      slug,
      description,
      price_cents,
      currency,
      stock,
      is_active,
      category:categories ( id, name, slug ),
      images:product_images ( path, alt, sort_order )
    `
    )
    .eq('slug', slug)
    .single();

  if (error) throw error;

  return {
    ...data,
    images: (data.images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order),
  };
}

export function getProductImageUrl(path) {
  if (!path) return null;
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data?.publicUrl ?? null;
}
