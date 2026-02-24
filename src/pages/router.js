/**
 * router.js
 * MPA-friendly router: loads page module based on <body data-page="...">.
 * Fallbacks to pathname mapping for the root index.
 */

const byPage = {
  home: () => import('./home.js'),
  products: () => import('./products.js'),
  'product-detail': () => import('./product-detail.js'),
  cart: () => import('./cart.js'),
  checkout: () => import('./checkout.js'),
  login: () => import('./login.js'),
  account: () => import('./account.js'),
};

const byPath = {
  '/': () => import('./home.js'),
};

export async function initPage() {
  const page = document.body?.dataset?.page;
  const path = window.location.pathname || '/';

  const loader = (page && byPage[page]) || byPath[path] || byPage.home;

  try {
    const module = await loader();
    if (typeof module.default === 'function') {
      await module.default();
    }
  } catch (err) {
    console.error('[router] Failed to load page module:', err);
  }
}
