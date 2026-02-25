import { Modal } from 'bootstrap';
import { renderLayout } from './partials/layout.js';
import { getCategories, getProducts, getProductImageUrl } from '@services/products.js';
import { addToCart } from '@services/cart.js';
import { formatPrice } from '@utils/helpers.js';
import { showToast } from '@utils/toast.js';
import {
  filterCategoriesByStyle,
  filterProductsByStyle,
  getSelectedStyle,
  getStyleById,
} from '@utils/gear-style.js';

/** Map of slug → product, filled after each load() */
const productMap = new Map();

function buildCarousel(images, productName) {
  if (!images.length) {
    return `<div class="mg-img-placeholder mg-modal-img"></div>`;
  }
  if (images.length === 1) {
    return `<img
      src="${getProductImageUrl(images[0].path)}"
      alt="${images[0].alt ?? productName}"
      class="w-100 mg-modal-img"
    />`;
  }
  const items = images
    .map(
      (img, i) => `
      <div class="carousel-item ${i === 0 ? 'active' : ''}">
        <img
          src="${getProductImageUrl(img.path)}"
          alt="${img.alt ?? productName}"
          class="d-block w-100 mg-modal-img"
        />
      </div>`
    )
    .join('');

  return `
    <div id="mg-modal-carousel" class="carousel slide" data-bs-ride="false">
      <div class="carousel-indicators">
        ${images.map((_, i) => `<button type="button" data-bs-target="#mg-modal-carousel" data-bs-slide-to="${i}" ${i === 0 ? 'class="active" aria-current="true"' : ''}></button>`).join('')}
      </div>
      <div class="carousel-inner rounded-top-3 overflow-hidden">
        ${items}
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#mg-modal-carousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon"></span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#mg-modal-carousel" data-bs-slide="next">
        <span class="carousel-control-next-icon"></span>
      </button>
    </div>`;
}

function openProductModal(product) {
  const title = document.getElementById('mg-modal-title');
  const body = document.getElementById('mg-modal-body');
  const footer = document.getElementById('mg-modal-footer');

  title.textContent = product.name;

  const images = product.images ?? [];
  const imageHtml = buildCarousel(images, product.name);

  const stockBadge =
    product.stock > 0
      ? `<span class="badge text-bg-success">In stock</span>`
      : `<span class="badge text-bg-secondary">Out of stock</span>`;

  body.innerHTML = `
    <div class="row g-0">
      <div class="col-md-6 mg-modal-img-col">
        ${imageHtml}
      </div>
      <div class="col-md-6 d-flex flex-column p-4">
        <div class="mg-category mb-1">${product.category?.name ?? ''}</div>
        <div class="mg-price h5 mb-3">${formatPrice(product.price_cents, product.currency)}</div>
        <p class="text-muted small flex-grow-1 mb-3">${product.description ?? 'No description available.'}</p>
        <div class="mb-3">${stockBadge}</div>
        <button
          id="mg-modal-add"
          class="btn btn-primary"
          data-id="${product.id}"
          data-price="${product.price_cents}"
          ${product.stock <= 0 ? 'disabled' : ''}
        >
          Add to cart
        </button>
      </div>
    </div>`;

  footer.innerHTML = `
    <a
      href="/src/pages/product-detail.html?slug=${encodeURIComponent(product.slug)}"
      class="btn btn-outline-secondary btn-sm"
    >
      View full details &rarr;
    </a>`;

  const addBtn = document.getElementById('mg-modal-add');
  addBtn.addEventListener('click', async () => {
    try {
      await addToCart({ productId: product.id, quantity: 1, unitPriceCents: product.price_cents });
      showToast('Added to cart', 'success');
    } catch (err) {
      showToast(err?.message ?? 'Failed to add to cart', 'danger');
    }
  });

  const modalEl = document.getElementById('mg-product-modal');
  Modal.getOrCreateInstance(modalEl).show();
}

function renderProductCard(product) {
  const imagePath = product.images?.[0]?.path;
  const imageUrl = imagePath ? getProductImageUrl(imagePath) : null;

  return `
    <div class="col-12 col-sm-6 col-lg-4">
      <div class="card h-100 mg-product-card" data-slug="${product.slug}">
        <div class="mg-card-img-wrap mg-card-clickable" data-slug="${product.slug}" role="button" tabindex="0" aria-label="Quick view ${product.name}">
          ${
            imageUrl
              ? `<img src="${imageUrl}" alt="${product.images?.[0]?.alt ?? product.name}" />`
              : `<div class="mg-img-placeholder"></div>`
          }
          <div class="mg-card-img-overlay">
            <span class="mg-quickview-hint">Quick view</span>
          </div>
        </div>
        <div class="card-body d-flex flex-column">
          <h3 class="card-title">${product.name}</h3>
          <div class="mg-category">${product.category?.name ?? ''}</div>
          <div class="mg-price">${formatPrice(product.price_cents, product.currency)}</div>

          <div class="mt-auto d-flex gap-2">
            <button class="btn btn-outline-secondary btn-sm mg-quickview" data-slug="${product.slug}">Quick view</button>
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
  const selectedStyleId = getSelectedStyle();
  if (!selectedStyleId) {
    window.location.href = '/src/pages/styles.html';
    return;
  }

  const selectedStyle = getStyleById(selectedStyleId);
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
      const productsRaw = await getProducts({ categorySlug });
      const products = filterProductsByStyle(productsRaw, selectedStyleId);

      productMap.clear();
      (products ?? []).forEach((p) => productMap.set(p.slug, p));

      grid.innerHTML = (products ?? []).map(renderProductCard).join('');

      if (!products?.length) {
        empty.classList.remove('d-none');
      }

      // Quick view — image overlay click
      grid.querySelectorAll('.mg-card-clickable').forEach((el) => {
        const open = () => {
          const p = productMap.get(el.dataset.slug);
          if (p) openProductModal(p);
        };
        el.addEventListener('click', open);
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') open(); });
      });

      // Quick view — button
      grid.querySelectorAll('button.mg-quickview').forEach((btn) => {
        btn.addEventListener('click', () => {
          const p = productMap.get(btn.dataset.slug);
          if (p) openProductModal(p);
        });
      });

      // Add to cart — card button
      grid.querySelectorAll('button.mg-add').forEach((btn) => {
        btn.addEventListener('click', async () => {
          try {
            await addToCart({ productId: btn.dataset.id, quantity: 1, unitPriceCents: Number(btn.dataset.price) });
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
    const categoriesRaw = await getCategories();
    const categories = filterCategoriesByStyle(categoriesRaw, selectedStyleId);
    const styleSuffix = selectedStyle?.label ? ` — ${selectedStyle.label}` : '';
    select.innerHTML = `<option value="">All${styleSuffix}</option>${(categories ?? [])
      .map((c) => `<option value="${c.slug}">${c.name}</option>`)
      .join('')}`;
  } catch {
    // ignore categories failure; still load products
  }

  select.addEventListener('change', load);
  await load();
}

