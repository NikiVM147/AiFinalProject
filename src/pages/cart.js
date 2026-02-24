import { renderLayout } from './partials/layout.js';
import { getCart, updateCartItem, clearCart } from '@services/cart.js';
import { formatPrice } from '@utils/helpers.js';
import { showToast } from '@utils/toast.js';

function calcTotal(items) {
  return items.reduce((sum, it) => sum + it.unit_price_cents * it.quantity, 0);
}

export default async function initCart() {
  await renderLayout({ title: 'Cart — Moto Gear Store', active: 'cart' });

  const root = document.getElementById('mg-cart');
  const errorEl = document.getElementById('mg-cart-error');

  async function load() {
    errorEl.classList.add('d-none');

    try {
      const cart = await getCart();
      const items = cart.items ?? [];

      if (!items.length) {
        root.innerHTML = `
          <div class="alert alert-light border">Your cart is empty.</div>
          <a class="btn btn-primary" href="/src/pages/products.html">Browse products</a>
        `;
        return;
      }

      const currency = items[0]?.product?.currency ?? 'EUR';
      const totalCents = calcTotal(items);

      root.innerHTML = `
        <div class="table-responsive">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Item</th>
                <th style="width: 120px">Qty</th>
                <th class="text-end">Price</th>
                <th class="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map((it) => {
                  const name = it.product?.name ?? it.product_id ?? 'Item';
                  const unit = it.unit_price_cents;
                  const subtotal = unit * it.quantity;
                  return `
                    <tr>
                      <td>
                        <div class="fw-semibold">${name}</div>
                        ${
                          it.product?.slug
                            ? `<a class="small text-decoration-none" href="/src/pages/product-detail.html?slug=${encodeURIComponent(it.product.slug)}">View</a>`
                            : ''
                        }
                      </td>
                      <td>
                        <input
                          class="form-control form-control-sm mg-qty"
                          type="number"
                          min="0"
                          value="${it.quantity}"
                          data-id="${it.id ?? it.product_id}"
                          style="max-width: 90px"
                        />
                      </td>
                      <td class="text-end">${formatPrice(unit, currency)}</td>
                      <td class="text-end">${formatPrice(subtotal, currency)}</td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
          </table>
        </div>

        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <button id="mg-clear" class="btn btn-outline-danger">Clear cart</button>
          <div class="d-flex align-items-center gap-3">
            <div class="h5 mb-0">Total: ${formatPrice(totalCents, currency)}</div>
            <a class="btn btn-primary" href="/src/pages/checkout.html">Checkout</a>
          </div>
        </div>
      `;

      root.querySelectorAll('input.mg-qty').forEach((input) => {
        input.addEventListener('change', async () => {
          const cartItemId = input.dataset.id;
          const quantity = Number(input.value);
          try {
            await updateCartItem({ cartItemId, quantity });
            await load();
          } catch (err) {
            showToast(err?.message ?? 'Failed to update cart', 'danger');
          }
        });
      });

      const clearBtn = document.getElementById('mg-clear');
      clearBtn.addEventListener('click', async () => {
        try {
          await clearCart();
          showToast('Cart cleared', 'secondary');
          await load();
        } catch (err) {
          showToast(err?.message ?? 'Failed to clear cart', 'danger');
        }
      });
    } catch (err) {
      errorEl.textContent = err?.message ?? 'Failed to load cart.';
      errorEl.classList.remove('d-none');
    }
  }

  await load();
}
