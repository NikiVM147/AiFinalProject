import { getSession } from '@services/auth.js';
import { getMyProfile } from '@services/profiles.js';

export async function renderLayout({ title, active }) {
  document.title = title;

  let session = null;
  let isAdmin = false;
  try {
    session = await getSession();
    if (session) {
      const profile = await getMyProfile();
      isAdmin = profile?.role === 'admin';
    }
  } catch {
    session = null;
  }
  const isAuthed = !!session;

  const nav = document.getElementById('mg-nav');
  if (nav) {
    nav.innerHTML = `
      <nav class="navbar navbar-expand-lg mg-navbar">
        <div class="container">
          <a class="navbar-brand" href="/">⚡ Moto Gear</a>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto gap-1">
              <li class="nav-item">
                <a class="nav-link ${active === 'home' ? 'active' : ''}" href="/">Начало</a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${active === 'styles' ? 'active' : ''}" href="/src/pages/styles.html">Стил</a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${active === 'products' ? 'active' : ''}" href="/src/pages/products.html">Продукти</a>
              </li>
            </ul>
            <ul class="navbar-nav ms-auto align-items-center gap-1">
              ${isAuthed ? `
              ${isAdmin ? `
              <li class="nav-item">
                <a class="nav-link ${active === 'admin' ? 'active' : ''}" href="/src/pages/admin.html">Администрация</a>
              </li>
              ` : ''}
              <li class="nav-item">
                <a class="nav-link ${active === 'account' ? 'active' : ''}" href="/src/pages/account.html">Профил</a>
              </li>
              ` : `
              <li class="nav-item">
                <a class="nav-link ${active === 'login' ? 'active' : ''}" href="/src/pages/login.html">Вход</a>
              </li>
              <li class="nav-item">
                <a class="nav-link btn btn-primary btn-sm px-3 ms-1 ${active === 'register' ? 'active' : ''}" href="/src/pages/register.html">Регистрация</a>
              </li>
              `}
              <li class="nav-item">
                <a class="mg-cart-btn ${active === 'cart' ? 'active' : ''}" href="/src/pages/cart.html" aria-label="Количка" title="Количка">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  <span class="mg-cart-badge" id="mg-nav-cart-count" style="display:none">0</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    `;
  }

  const footer = document.getElementById('mg-footer');
  if (footer) {
    footer.innerHTML = `
      <div class="container text-center">
        <small>&copy; ${new Date().getFullYear()} Moto Gear Store &mdash; Кари с увереност.</small>
      </div>
    `;
  }

  // ── Update cart badge ────────────────────────────────────────
  try {
    const LS_KEY = 'mg_cart_v1';
    const raw = localStorage.getItem(LS_KEY);
    const cart = raw ? JSON.parse(raw) : { items: [] };
    const total = (cart.items ?? []).reduce((sum, i) => sum + (i.quantity ?? 1), 0);
    const badge = document.getElementById('mg-nav-cart-count');
    if (badge && total > 0) {
      badge.textContent = total > 99 ? '99+' : total;
      badge.style.display = '';
    }
  } catch { /* ignore */ }
}
