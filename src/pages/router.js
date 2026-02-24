/**
 * router.js
 * Simple client-side router that maps the current path to a page initialiser.
 * Add a new entry to `routes` for each page you create under /src/pages/.
 */

const routes = {
  '/': () => import('./home.js'),
  // '/about':   () => import('./about.js'),
  // '/contact': () => import('./contact.js'),
};

export async function initPage() {
  const path = window.location.pathname.replace(/\.html$/, '') || '/';
  const loader = routes[path] ?? routes['/'];

  try {
    const module = await loader();
    if (typeof module.default === 'function') {
      module.default();
    }
  } catch (err) {
    console.error(`[router] Failed to load page module for "${path}":`, err);
  }
}
