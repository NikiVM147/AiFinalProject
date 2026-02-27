import { renderLayout } from './partials/layout.js';
import { getCart, updateCartItem, clearCart } from '@services/cart.js';
import { formatPrice } from '@utils/helpers.js';
import { showToast } from '@utils/toast.js';

function calcTotal(items) {
  return items.reduce((sum, it) => sum + it.unit_price_cents * it.quantity, 0);
}

export default async function initCart() {
  await renderLayout({ title: 'Количка — Moto Gear Store', active: 'cart' });

  const root = document.getElementById('mg-cart');
  const errorEl = document.getElementById('mg-cart-error');

  async function load() {
    errorEl.classList.add('d-none');

    try {
      const cart = await getCart();
      const items = cart.items ?? [];

      if (!items.length) {
        root.innerHTML = `
          <div class="alert alert-secondary">Количката ти е празна.</div>
          <a class="btn btn-primary" href="/src/pages/products.html">Разгледай продукти</a>
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
                <th>Продукт</th>
                <th style="width: 120px">Бр.</th>
                <th class="text-end">Цена</th>
                <th class="text-end">Сума</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map((it) => {
                  const name = it.product?.name ?? it.product_id ?? 'Продукт';
                  const unit = it.unit_price_cents;
                  const subtotal = unit * it.quantity;
                  return `
                    <tr>
                      <td>
                        <div class="fw-semibold">${name}</div>
                        ${
                          it.product?.slug
                            ? `<a class="small text-decoration-none" href="/src/pages/product-detail.html?slug=${encodeURIComponent(it.product.slug)}">Преглед</a>`
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
          <button id="mg-clear" class="btn btn-outline-danger">Изчисти количката</button>
          <div class="d-flex align-items-center gap-3">
            <div class="h5 mb-0">Общо: ${formatPrice(totalCents, currency)}</div>
            <a class="btn btn-primary" href="/src/pages/checkout.html">Поръчай</a>
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
            showToast(err?.message ?? 'Грешка при обновяване на количката', 'danger');
          }
        });
      });

      const clearBtn = document.getElementById('mg-clear');
      clearBtn.addEventListener('click', async () => {
        try {
          await clearCart();
          showToast('Количката е изчистена', 'secondary');
          await load();
        } catch (err) {
          showToast(err?.message ?? 'Грешка при изчистване на количката', 'danger');
        }
      });
    } catch (err) {
      errorEl.textContent = err?.message ?? 'Грешка при зареждане на количката.';
      errorEl.classList.remove('d-none');
    }
  }

  await load();
}
