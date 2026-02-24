import { supabase } from './supabase.js';

export async function createOrderFromCart({ shippingAddress, cart }) {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) throw new Error('You must be signed in to checkout.');

  const items = cart?.items ?? [];
  const totalCents = items.reduce(
    (sum, it) => sum + it.unit_price_cents * it.quantity,
    0
  );

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total_cents: totalCents,
      currency: 'EUR',
      shipping_address: shippingAddress,
      status: 'pending',
    })
    .select('*')
    .single();

  if (orderError) throw orderError;

  const orderItemsPayload = items.map((it) => ({
    order_id: order.id,
    product_id: it.product?.id ?? it.product_id,
    product_name: it.product?.name ?? 'Item',
    unit_price_cents: it.unit_price_cents,
    quantity: it.quantity,
  }));

  if (orderItemsPayload.length) {
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsPayload);
    if (itemsError) throw itemsError;
  }

  return order;
}

export async function listMyOrders() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return [];

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return orders ?? [];
}

export async function getOrderWithItems(orderId) {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderError) throw orderError;

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (itemsError) throw itemsError;

  return { order, items: items ?? [] };
}
