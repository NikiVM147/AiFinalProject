import { supabase } from './supabase.js';

const LS_KEY = 'mg_cart_v1';

function readLocalCart() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '{"items":[]}');
  } catch {
    return { items: [] };
  }
}

function writeLocalCart(cart) {
  localStorage.setItem(LS_KEY, JSON.stringify(cart));
}

export async function getCart() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    const cart = readLocalCart();
    const ids = (cart.items ?? []).map((i) => i.productId).filter(Boolean);

    if (!ids.length) {
      return { id: null, items: [] };
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('id,name,slug,currency,stock,is_active')
      .in('id', ids);
    if (error) throw error;

    const byId = new Map((products ?? []).map((p) => [p.id, p]));

    return {
      id: null,
      items: (cart.items ?? []).map((i) => ({
        id: i.productId,
        product_id: i.productId,
        product: byId.get(i.productId) ?? null,
        quantity: i.quantity,
        unit_price_cents: i.unitPriceCents,
      })),
    };
  }

  // Ensure cart exists
  const { data: cart, error: cartError } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (cartError) throw cartError;

  let cartId = cart?.id;
  if (!cartId) {
    const { data: inserted, error: insertError } = await supabase
      .from('carts')
      .insert({ user_id: user.id })
      .select('*')
      .single();

    if (insertError) throw insertError;
    cartId = inserted.id;
  }

  const { data: items, error: itemsError } = await supabase
    .from('cart_items')
    .select(
      `
      id,
      quantity,
      unit_price_cents,
      product:products ( id, name, slug, currency, stock, is_active )
    `
    )
    .eq('cart_id', cartId);

  if (itemsError) throw itemsError;

  return {
    id: cartId,
    items: (items ?? []).map((it) => ({
      id: it.id,
      product_id: it.product?.id,
      product: it.product,
      quantity: it.quantity,
      unit_price_cents: it.unit_price_cents,
    })),
  };
}

export async function addToCart({ productId, quantity = 1, unitPriceCents }) {
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    const cart = readLocalCart();
    const existing = cart.items.find((i) => i.productId === productId);
    if (existing) existing.quantity += quantity;
    else cart.items.push({ productId, quantity, unitPriceCents });
    writeLocalCart(cart);
    return;
  }

  // Ensure cart exists
  const { data: cart, error: cartError } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  if (cartError) throw cartError;

  let cartId = cart?.id;
  if (!cartId) {
    const { data: inserted, error: insertError } = await supabase
      .from('carts')
      .insert({ user_id: user.id })
      .select('*')
      .single();
    if (insertError) throw insertError;
    cartId = inserted.id;
  }

  const { data: existing, error: existingError } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cartId)
    .eq('product_id', productId)
    .maybeSingle();
  if (existingError) throw existingError;

  if (existing) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('cart_items').insert({
      cart_id: cartId,
      product_id: productId,
      quantity,
      unit_price_cents: unitPriceCents,
    });
    if (error) throw error;
  }
}

export async function updateCartItem({ cartItemId, quantity }) {
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    const cart = readLocalCart();
    const item = cart.items.find((i) => i.productId === cartItemId);
    if (item) {
      item.quantity = quantity;
    }
    cart.items = cart.items.filter((i) => i.quantity > 0);
    writeLocalCart(cart);
    return;
  }

  if (quantity <= 0) {
    const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId);

  if (error) throw error;
}

export async function clearCart() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    writeLocalCart({ items: [] });
    return;
  }

  const { data: cart, error: cartError } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (cartError) throw cartError;
  if (!cart?.id) return;

  const { error } = await supabase.from('cart_items').delete().eq('cart_id', cart.id);
  if (error) throw error;
}
