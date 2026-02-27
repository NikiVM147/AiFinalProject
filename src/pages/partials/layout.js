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
              <li class="nav-item">
                <a class="nav-link ${active === 'cart' ? 'active' : ''}" href="/src/pages/cart.html">Количка</a>
              </li>
            </ul>
            <ul class="navbar-nav ms-auto gap-1">
              ${isAuthed ? `
              ${isAdmin ? `
              <li class="nav-item">
                <a class="nav-link ${active === 'admin' ? 'active' : ''}" href="/src/pages/admin.html">Admin</a>
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
        <small>&copy; ${new Date().getFullYear()} Moto Gear Store &mdash; Ride with confidence.</small>
      </div>
    `;
  }
}
