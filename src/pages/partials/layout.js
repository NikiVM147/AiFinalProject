import { getSession } from '@services/auth.js';

export async function renderLayout({ title, active }) {
  document.title = title;

  let session = null;
  try {
    session = await getSession();
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
                <a class="nav-link ${active === 'home' ? 'active' : ''}" href="/">Home</a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${active === 'products' ? 'active' : ''}" href="/src/pages/products.html">Products</a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${active === 'cart' ? 'active' : ''}" href="/src/pages/cart.html">Cart</a>
              </li>
            </ul>
            <ul class="navbar-nav ms-auto gap-1">
              ${isAuthed ? `
              <li class="nav-item">
                <a class="nav-link ${active === 'account' ? 'active' : ''}" href="/src/pages/account.html">Account</a>
              </li>
              ` : `
              <li class="nav-item">
                <a class="nav-link ${active === 'login' ? 'active' : ''}" href="/src/pages/login.html">Login</a>
              </li>
              <li class="nav-item">
                <a class="nav-link btn btn-primary btn-sm px-3 ms-1 ${active === 'register' ? 'active' : ''}" href="/src/pages/register.html">Register</a>
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
