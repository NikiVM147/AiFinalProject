import { Modal } from 'bootstrap';
import { renderLayout } from './partials/layout.js';
import { getSession } from '@services/auth.js';
import { getMyProfile } from '@services/profiles.js';
import { getProductImageUrl } from '@services/products.js';
import {
  adminGetProducts,
  adminGetCategories,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminUploadProductImage,
  adminDeleteProductImage,
} from '@services/admin.js';
import { formatPrice } from '@utils/helpers.js';
import { showToast } from '@utils/toast.js';

// ── State ─────────────────────────────────────────────────────────────────────
let categories = [];
let products = [];
let editingProductId = null; // null = create mode, string = edit mode

// ── DOM refs ──────────────────────────────────────────────────────────────────
const loadingEl = () => document.getElementById('admin-loading');
const tableWrapEl = () => document.getElementById('admin-table-wrap');
const productListEl = () => document.getElementById('admin-product-list');
const emptyEl = () => document.getElementById('admin-empty');
const errorEl = () => document.getElementById('admin-error');
const formErrorEl = () => document.getElementById('form-error');

// ── Slug helper ───────────────────────────────────────────────────────────────
function toSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

// ── Table rendering ───────────────────────────────────────────────────────────
function renderTable() {
  const list = productListEl();
  if (!list) return;

  if (!products.length) {
    tableWrapEl().classList.add('d-none');
    emptyEl().classList.remove('d-none');
    return;
  }

  emptyEl().classList.add('d-none');
  tableWrapEl().classList.remove('d-none');

  list.innerHTML = products.map((p) => {
    const thumb = p.images?.[0]?.path
      ? `<img src="${getProductImageUrl(p.images[0].path)}" alt="${p.images[0].alt ?? p.name}"
             class="rounded" style="width:56px;height:42px;object-fit:cover;">`
      : `<div class="bg-secondary rounded d-flex align-items-center justify-content-center"
              style="width:56px;height:42px;font-size:10px;color:#aaa;">No img</div>`;

    const styleLabels = { cross: 'Кросова', road: 'Шосейна', touring: 'Туринг' };
    const styleBadge = p.style
      ? `<span class="badge text-bg-info text-dark">${styleLabels[p.style] ?? p.style}</span>`
      : `<span class="text-muted small">—</span>`;

    return `
      <tr>
        <td>${thumb}</td>
        <td>
          <div class="fw-semibold">${p.name}</div>
          <div class="small text-muted">${p.slug}</div>
        </td>
        <td class="text-muted small">${p.brand ?? '—'}</td>
        <td class="small">${p.category?.name ?? '—'}</td>
        <td class="small">${styleBadge}</td>
        <td class="text-end">${formatPrice(p.price_cents, p.currency)}</td>
        <td class="text-center">${p.stock}</td>
        <td class="text-center">
          ${p.is_active
            ? '<span class="badge text-bg-success">Active</span>'
            : '<span class="badge text-bg-secondary">Hidden</span>'}
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary me-1 btn-edit" data-id="${p.id}" title="Edit">
            Edit
          </button>
          <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${p.id}" data-name="${p.name}" title="Delete">
            Delete
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ── Category options ──────────────────────────────────────────────────────────
function populateCategorySelect(selectedId = '') {
  const sel = document.getElementById('f-category');
  sel.innerHTML = '<option value="">Select category…</option>';
  categories.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    if (c.id === selectedId) opt.selected = true;
    sel.appendChild(opt);
  });
}

// ── Modal: open for CREATE ────────────────────────────────────────────────────
function openCreateModal() {
  editingProductId = null;
  document.getElementById('productModalLabel').textContent = 'Add Product';
  document.getElementById('product-form').reset();
  document.getElementById('f-active').checked = true;
  document.getElementById('f-style').value = '';
  populateCategorySelect();
  document.getElementById('existing-images-wrap').classList.add('d-none');
  document.getElementById('existing-images').innerHTML = '';
  formErrorEl().classList.add('d-none');

  Modal.getOrCreateInstance(document.getElementById('productModal')).show();
}

// ── Modal: open for EDIT ──────────────────────────────────────────────────────
function openEditModal(productId) {
  const p = products.find((x) => x.id === productId);
  if (!p) return;

  editingProductId = productId;
  document.getElementById('productModalLabel').textContent = 'Edit Product';
  formErrorEl().classList.add('d-none');

  document.getElementById('f-name').value = p.name;
  document.getElementById('f-slug').value = p.slug;
  document.getElementById('f-brand').value = p.brand ?? '';
  document.getElementById('f-description').value = p.description ?? '';
  document.getElementById('f-price').value = ((p.price_cents ?? 0) / 100).toFixed(2);
  document.getElementById('f-currency').value = p.currency ?? 'EUR';
  document.getElementById('f-stock').value = p.stock ?? 0;
  document.getElementById('f-active').checked = !!p.is_active;
  document.getElementById('f-style').value = p.style ?? '';
  document.getElementById('f-images').value = '';

  populateCategorySelect(p.category?.id ?? '');

  // Existing images
  const wrap = document.getElementById('existing-images-wrap');
  const imgContainer = document.getElementById('existing-images');

  if (p.images?.length) {
    wrap.classList.remove('d-none');
    imgContainer.innerHTML = p.images.map((img) => `
      <div class="position-relative" data-img-id="${img.id}">
        <img src="${getProductImageUrl(img.path)}" alt="${img.alt ?? ''}"
             class="rounded border" style="width:72px;height:56px;object-fit:cover;">
        <button
          type="button"
          class="btn btn-danger btn-sm position-absolute top-0 end-0 btn-del-img p-0"
          data-img-id="${img.id}"
          data-img-path="${img.path}"
          style="width:20px;height:20px;font-size:10px;line-height:1;"
          title="Delete image"
        >&times;</button>
      </div>
    `).join('');
  } else {
    wrap.classList.add('d-none');
    imgContainer.innerHTML = '';
  }

  Modal.getOrCreateInstance(document.getElementById('productModal')).show();
}

// ── Form submit ───────────────────────────────────────────────────────────────
async function handleFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('f-name').value.trim();
  const slug = document.getElementById('f-slug').value.trim();
  const brand = document.getElementById('f-brand').value.trim();
  const categoryId = document.getElementById('f-category').value;
  const description = document.getElementById('f-description').value.trim();
  const priceEur = parseFloat(document.getElementById('f-price').value);
  const currency = document.getElementById('f-currency').value;
  const stock = parseInt(document.getElementById('f-stock').value, 10);
  const isActive = document.getElementById('f-active').checked;
  const style = document.getElementById('f-style').value || null;
  const files = document.getElementById('f-images').files;

  const formErr = formErrorEl();

  if (!name || !slug || !categoryId || isNaN(priceEur) || isNaN(stock)) {
    formErr.textContent = 'Please fill in all required fields.';
    formErr.classList.remove('d-none');
    return;
  }

  const saveBtn = document.getElementById('btn-save');
  const saveText = document.getElementById('btn-save-text');
  const saveSpinner = document.getElementById('btn-save-spinner');
  saveBtn.disabled = true;
  saveSpinner.classList.remove('d-none');
  formErr.classList.add('d-none');

  const fields = {
    name,
    slug,
    brand: brand || null,
    category_id: categoryId,
    description: description || null,
    price_cents: Math.round(priceEur * 100),
    currency,
    stock,
    is_active: isActive,
    style,
  };

  try {
    let productId = editingProductId;

    if (editingProductId) {
      await adminUpdateProduct(editingProductId, fields);
      showToast('Product updated.', 'success');
    } else {
      const created = await adminCreateProduct(fields);
      productId = created.id;
      showToast('Product created.', 'success');
    }

    // Upload new images
    if (files.length) {
      for (let i = 0; i < files.length; i++) {
        try {
          await adminUploadProductImage(productId, files[i], i);
        } catch (imgErr) {
          showToast(`Image "${files[i].name}" failed to upload: ${imgErr.message}`, 'warning');
        }
      }
    }

    Modal.getOrCreateInstance(document.getElementById('productModal')).hide();
    await refreshProducts();
  } catch (err) {
    formErr.textContent = err.message ?? 'Something went wrong.';
    formErr.classList.remove('d-none');
  } finally {
    saveBtn.disabled = false;
    saveSpinner.classList.add('d-none');
  }
}

// ── Delete flow ───────────────────────────────────────────────────────────────
let pendingDeleteId = null;

function openDeleteModal(productId, productName) {
  pendingDeleteId = productId;
  document.getElementById('delete-product-name').textContent = productName;
  Modal.getOrCreateInstance(document.getElementById('deleteModal')).show();
}

async function handleConfirmDelete() {
  if (!pendingDeleteId) return;

  const btn = document.getElementById('btn-confirm-delete');
  btn.disabled = true;
  btn.textContent = 'Deleting…';

  try {
    await adminDeleteProduct(pendingDeleteId);
    Modal.getOrCreateInstance(document.getElementById('deleteModal')).hide();
    showToast('Product deleted.', 'success');
    await refreshProducts();
  } catch (err) {
    showToast(err.message ?? 'Delete failed.', 'danger');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Delete';
    pendingDeleteId = null;
  }
}

// ── Image delete (within edit modal) ─────────────────────────────────────────
async function handleDeleteExistingImage(imageId, imagePath) {
  try {
    await adminDeleteProductImage(imageId, imagePath);

    const thumb = document.querySelector(`[data-img-id="${imageId}"]`);
    if (thumb) thumb.remove();

    // Update local state
    if (editingProductId) {
      const p = products.find((x) => x.id === editingProductId);
      if (p) p.images = (p.images ?? []).filter((i) => i.id !== imageId);
    }

    showToast('Image deleted.', 'success');
  } catch (err) {
    showToast(err.message ?? 'Failed to delete image.', 'danger');
  }
}

// ── Load / refresh products ───────────────────────────────────────────────────
async function refreshProducts() {
  try {
    products = await adminGetProducts();
    renderTable();
  } catch (err) {
    const errEl = errorEl();
    errEl.textContent = `Failed to load products: ${err.message}`;
    errEl.classList.remove('d-none');
  }
}

// ── Main init ─────────────────────────────────────────────────────────────────
export default async function initAdmin() {
  await renderLayout({ title: 'Admin — Moto Gear Store', active: 'admin' });

  // Guard: must be authenticated
  const session = await getSession();
  if (!session) {
    window.location.href = '/src/pages/login.html';
    return;
  }

  // Guard: must be admin
  try {
    const profile = await getMyProfile();
    if (profile?.role !== 'admin') {
      document.querySelector('main').innerHTML = `
        <div class="alert alert-danger mt-4">
          Access denied. You must be an admin to view this page.
        </div>`;
      return;
    }
  } catch {
    document.querySelector('main').innerHTML = `
      <div class="alert alert-danger mt-4">Failed to verify admin access.</div>`;
    return;
  }

  // Load categories for the form select
  try {
    categories = await adminGetCategories();
  } catch (err) {
    showToast('Failed to load categories.', 'warning');
  }

  // Load products
  try {
    products = await adminGetProducts();
  } catch (err) {
    const errEl = errorEl();
    errEl.textContent = `Failed to load products: ${err.message}`;
    errEl.classList.remove('d-none');
  } finally {
    loadingEl().classList.add('d-none');
  }

  renderTable();

  // ── Event delegation ──────────────────────────────────────────────────────

  // "Add Product" button
  document.getElementById('btn-add-product').addEventListener('click', openCreateModal);

  // Table: edit / delete buttons
  document.getElementById('admin-product-list').addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-edit');
    const deleteBtn = e.target.closest('.btn-delete');

    if (editBtn) {
      openEditModal(editBtn.dataset.id);
    } else if (deleteBtn) {
      openDeleteModal(deleteBtn.dataset.id, deleteBtn.dataset.name);
    }
  });

  // Form submit
  document.getElementById('product-form').addEventListener('submit', handleFormSubmit);

  // Confirm delete
  document.getElementById('btn-confirm-delete').addEventListener('click', handleConfirmDelete);

  // Delete existing image thumbnails (event delegation inside modal)
  document.getElementById('existing-images').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-del-img');
    if (btn) handleDeleteExistingImage(btn.dataset.imgId, btn.dataset.imgPath);
  });

  // Auto-generate slug from name (only when slug is empty or unchanged from last auto)
  const nameInput = document.getElementById('f-name');
  const slugInput = document.getElementById('f-slug');
  nameInput.addEventListener('input', () => {
    // Only auto-fill when user hasn't manually edited the slug
    if (!slugInput.dataset.edited) {
      slugInput.value = toSlug(nameInput.value);
    }
  });
  slugInput.addEventListener('input', () => {
    slugInput.dataset.edited = '1';
  });
  // Reset edited flag when modal opens
  document.getElementById('productModal').addEventListener('show.bs.modal', () => {
    delete slugInput.dataset.edited;
  });
}
