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
  await renderLayout({ title: 'Продукт — Moto Gear Store', active: 'products' });

  const slug = getSlugFromQuery();
  const root = document.getElementById('mg-product');
  const errorEl = document.getElementById('mg-product-error');

  if (!slug) {
    errorEl.textContent = 'Липсващ продукт.';
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
          <div class="card p-0 overflow-hidden">
            ${imageUrl
                ? `<img src="${imageUrl}" class="w-100" alt="${product.images?.[0]?.alt ?? product.name}" style="object-fit: cover; height: 420px; display:block;" />`
                : `<div class="mg-img-placeholder" style="height: 420px"></div>`
            }
          </div>
        </div>
        <div class="col-lg-6">
          <p class="text-muted small mb-1">${product.category?.name ?? ''}</p>
          <h1 class="h3 fw-bold mb-2">${product.name}</h1>
          <div class="mg-price h4 mb-3">${formatPrice(product.price_cents, product.currency)}</div>

          <p class="text-muted mb-4">${product.description ?? ''}</p>

          <div class="d-flex align-items-center gap-2 mb-3">
            <button id="mg-add" class="btn btn-primary px-4">Добави в количката</button>
            <a href="/src/pages/cart.html" class="btn btn-outline-secondary">Към количката</a>
          </div>

          <span class="badge text-bg-${product.stock > 0 ? 'success' : 'secondary'}">
            ${product.stock > 0 ? 'В наличност' : 'Изчерпан'}
          </span>
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
        showToast('Добавено в количката', 'success');
      } catch (err) {
        showToast(err?.message ?? 'Грешка при добавяне в количката', 'danger');
      }
    });
  } catch (err) {
    errorEl.textContent = err?.message ?? 'Грешка при зареждане на продукта.';
    errorEl.classList.remove('d-none');
  }
}
