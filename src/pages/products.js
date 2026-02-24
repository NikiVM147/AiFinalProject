import { renderLayout } from './partials/layout.js';
import { getCategories, getProducts, getProductImageUrl } from '@services/products.js';
import { addToCart } from '@services/cart.js';
import { formatPrice } from '@utils/helpers.js';
import { showToast } from '@utils/toast.js';

function renderProductCard(product) {
  const imagePath = product.images?.[0]?.path;
  const imageUrl = imagePath ? getProductImageUrl(imagePath) : null;

  return `
    <div class="col-12 col-sm-6 col-lg-4">
      <div class="card h-100">
        ${
          imageUrl
            ? `<img src="${imageUrl}" class="card-img-top" alt="${product.images?.[0]?.alt ?? product.name}" style="object-fit: cover; height: 220px" />`
            : `<div class="bg-light border-bottom" style="height: 220px"></div>`
        }
        <div class="card-body d-flex flex-column">
          <h3 class="h6 card-title mb-1">${product.name}</h3>
          <div class="text-muted small mb-2">${product.category?.name ?? ''}</div>
          <div class="fw-semibold mb-3">${formatPrice(product.price_cents, product.currency)}</div>

          <div class="mt-auto d-flex gap-2">
            <a class="btn btn-outline-secondary btn-sm" href="/src/pages/product-detail.html?slug=${encodeURIComponent(product.slug)}">Details</a>
            <button class="btn btn-primary btn-sm mg-add" data-id="${product.id}" data-price="${product.price_cents}">
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export default async function initProducts() {
  await renderLayout({ title: 'Products — Moto Gear Store', active: 'products' });

  const select = document.getElementById('category');
  const grid = document.getElementById('mg-products');
  const empty = document.getElementById('mg-products-empty');
  const errorEl = document.getElementById('mg-products-error');

  async function load() {
    errorEl.classList.add('d-none');
    empty.classList.add('d-none');

    try {
      const categorySlug = select.value || undefined;
      const products = await getProducts({ categorySlug });

      grid.innerHTML = (products ?? []).map(renderProductCard).join('');

      if (!products?.length) {
        empty.classList.remove('d-none');
      }

      grid.querySelectorAll('button.mg-add').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const productId = btn.dataset.id;
          const unitPriceCents = Number(btn.dataset.price);

          try {
            await addToCart({ productId, quantity: 1, unitPriceCents });
            showToast('Added to cart', 'success');
          } catch (err) {
            showToast(err?.message ?? 'Failed to add to cart', 'danger');
          }
        });
      });
    } catch (err) {
      errorEl.textContent = err?.message ?? 'Failed to load products.';
      errorEl.classList.remove('d-none');
    }
  }

  try {
    const categories = await getCategories();
    select.innerHTML = `<option value="">All</option>${(categories ?? [])
      .map((c) => `<option value="${c.slug}">${c.name}</option>`)
      .join('')}`;
  } catch {
    // ignore categories failure; still load products
  }

  select.addEventListener('change', load);
  await load();
}
