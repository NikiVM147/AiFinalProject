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
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
          <a class="navbar-brand" href="/">Moto Gear Store</a>
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
            <ul class="navbar-nav me-auto">
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
            <ul class="navbar-nav ms-auto">
              <li class="nav-item">
                <a class="nav-link ${active === 'account' ? 'active' : ''}" href="/src/pages/account.html">Account</a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${active === 'login' ? 'active' : ''}" href="/src/pages/login.html">
                  ${isAuthed ? 'Switch account' : 'Login'}
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
      <div class="container text-center text-muted">
        <small>&copy; ${new Date().getFullYear()} Moto Gear Store</small>
      </div>
    `;
  }
}
