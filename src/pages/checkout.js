import { renderLayout } from './partials/layout.js';
import { getSession } from '@services/auth.js';
import { getCart, clearCart } from '@services/cart.js';
import { createOrderFromCart } from '@services/orders.js';
import { formatPrice } from '@utils/helpers.js';
import { getFormValues } from '@utils/validators.js';
import { showToast } from '@utils/toast.js';

function total(items) {
  return (items ?? []).reduce((sum, it) => sum + it.unit_price_cents * it.quantity, 0);
}

export default async function initCheckout() {
  await renderLayout({ title: 'Checkout — Moto Gear Store', active: 'cart' });

  const session = await getSession();
  if (!session) {
    window.location.href = '/src/pages/login.html';
    return;
  }

  const summaryEl = document.getElementById('mg-checkout-summary');
  const form = document.getElementById('mg-checkout-form');
  const errorEl = document.getElementById('mg-checkout-error');

  const cart = await getCart();
  const items = cart.items ?? [];

  if (!items.length) {
    summaryEl.innerHTML = `<div class="alert alert-secondary">Your cart is empty.</div>`;
    form.classList.add('d-none');
    return;
  }

  const currency = items[0]?.product?.currency ?? 'EUR';
  const totalCents = total(items);

  summaryEl.innerHTML = `
    <ul class="list-group mb-3">
      ${items
        .map((it) => {
          const name = it.product?.name ?? it.product_id ?? 'Item';
          const subtotal = it.unit_price_cents * it.quantity;
          return `
            <li class="list-group-item d-flex justify-content-between">
              <div>
                <div class="fw-semibold">${name}</div>
                <div class="small text-muted">Qty: ${it.quantity}</div>
              </div>
              <div class="fw-semibold">${formatPrice(subtotal, currency)}</div>
            </li>
          `;
        })
        .join('')}
      <li class="list-group-item d-flex justify-content-between">
        <div class="fw-semibold">Total</div>
        <div class="fw-semibold">${formatPrice(totalCents, currency)}</div>
      </li>
    </ul>
  `;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.add('d-none');

    const values = getFormValues(form);

    try {
      const order = await createOrderFromCart({
        shippingAddress: {
          full_name: values.full_name,
          phone: values.phone,
          line1: values.line1,
          line2: values.line2,
          city: values.city,
          postal_code: values.postal_code,
          country: 'BG',
        },
        cart,
      });

      await clearCart();
      showToast('Order placed', 'success');
      window.location.href = '/src/pages/account.html';
      return order;
    } catch (err) {
      const msg = err?.message ?? 'Checkout failed.';
      errorEl.textContent = msg;
      errorEl.classList.remove('d-none');
    }
  });
}
