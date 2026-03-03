import { renderLayout } from './partials/layout.js';
import { getCart, updateCartItem, removeCartItem, clearCart } from '@services/cart.js';
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
                <th></th>
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
                      <td class="text-end">
                        <button
                          class="btn btn-sm btn-outline-danger mg-remove-item"
                          data-id="${it.id ?? it.product_id}"
                          aria-label="Премахни"
                          title="Премахни"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                          </svg>
                        </button>
                      </td>
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

      root.querySelectorAll('button.mg-remove-item').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const cartItemId = btn.dataset.id;
          try {
            await removeCartItem({ cartItemId });
            showToast('Артикулът е премахнат', 'secondary');
            await load();
          } catch (err) {
            showToast(err?.message ?? 'Грешка при премахване на артикула', 'danger');
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
