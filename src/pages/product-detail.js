import { renderLayout } from './partials/layout.js';
import { getProductBySlug, getProductImageUrl } from '@services/products.js';
import { addToCart } from '@services/cart.js';
import { formatPrice } from '@utils/helpers.js';
import { showToast } from '@utils/toast.js';

function getSlugFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug');
}

export default async function initProductDetail() {
  await renderLayout({ title: 'Product — Moto Gear Store', active: 'products' });

  const slug = getSlugFromQuery();
  const root = document.getElementById('mg-product');
  const errorEl = document.getElementById('mg-product-error');

  if (!slug) {
    errorEl.textContent = 'Missing product.';
    errorEl.classList.remove('d-none');
    return;
  }

  try {
    const product = await getProductBySlug(slug);
    const imagePath = product.images?.[0]?.path;
    const imageUrl = imagePath ? getProductImageUrl(imagePath) : null;

    root.innerHTML = `
      <div class="row g-4">
        <div class="col-lg-6">
          <div class="card">
            ${
              imageUrl
                ? `<img src="${imageUrl}" class="card-img-top" alt="${product.images?.[0]?.alt ?? product.name}" style="object-fit: cover; height: 420px" />`
                : `<div class="bg-light" style="height: 420px"></div>`
            }
          </div>
        </div>
        <div class="col-lg-6">
          <h1 class="h3 mb-2">${product.name}</h1>
          <div class="text-muted mb-2">${product.category?.name ?? ''}</div>
          <div class="h4 fw-semibold mb-3">${formatPrice(product.price_cents, product.currency)}</div>

          <p class="text-muted">${product.description ?? ''}</p>

          <div class="d-flex align-items-center gap-2">
            <button id="mg-add" class="btn btn-primary">Add to cart</button>
            <a href="/src/pages/cart.html" class="btn btn-outline-secondary">Go to cart</a>
          </div>

          <div class="mt-3">
            <span class="badge text-bg-${product.stock > 0 ? 'success' : 'secondary'}">
              ${product.stock > 0 ? 'In stock' : 'Out of stock'}
            </span>
          </div>
        </div>
      </div>
    `;

    const btn = document.getElementById('mg-add');
    btn.addEventListener('click', async () => {
      try {
        await addToCart({
          productId: product.id,
          quantity: 1,
          unitPriceCents: product.price_cents,
        });
        showToast('Added to cart', 'success');
      } catch (err) {
        showToast(err?.message ?? 'Failed to add to cart', 'danger');
      }
    });
  } catch (err) {
    errorEl.textContent = err?.message ?? 'Failed to load product.';
    errorEl.classList.remove('d-none');
  }
}
