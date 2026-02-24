# GitHub Copilot Instructions — Moto Gear Store

## Project Overview
This is a **Moto Gear Store** web application built with **Vanilla JavaScript**, **Bootstrap 5**, and **Supabase**. It is a multi-page app (MPA) bundled with **Vite**. Users can browse motorcycle gear, manage a cart, and complete purchases. Authentication and all data persistence are handled exclusively through **Supabase**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Vanilla JavaScript (ES Modules, no TypeScript) |
| UI Framework | Bootstrap 5 |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage) |
| Bundler | Vite |
| Routing | Custom client-side path router (`src/pages/router.js`) |

---

## Absolute Rules — Never Violate

- ❌ **No React, Vue, Angular, Svelte, or any frontend framework.**
- ❌ **No jQuery.**
- ❌ **Do not mix UI rendering and business logic in the same file.**
- ❌ **Do not inline Supabase queries inside HTML event handlers or page templates.**
- ❌ **Do not use `var`. Use `const` and `let` only.**
- ❌ **Do not store secrets or Supabase keys in source files.** Always read from `import.meta.env`.
- ✅ **Always use ES Modules** (`import` / `export`). No CommonJS (`require`).
- ✅ **Always `await` async operations** and wrap them in `try/catch`.

---

## Project Structure

```
AiFinalProject/
├── index.html                    ← Home / shell page
├── vite.config.js
├── package.json
├── .env                          ← VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── assets/                       ← Images, icons, fonts
├── public/                       ← Static files served as-is
└── src/
    ├── main.js                   ← Bootstrap import + router init
    ├── styles/
    │   └── main.css              ← Global styles, Bootstrap overrides
    ├── pages/
    │   ├── router.js             ← Maps URL paths to page modules
    │   ├── home.js
    │   ├── products.js
    │   ├── product-detail.js
    │   ├── cart.js
    │   ├── checkout.js
    │   ├── login.js
    │   └── account.js
    ├── services/
    │   ├── supabase.js           ← Supabase client (single instance)
    │   ├── auth.js               ← All authentication logic
    │   ├── products.js           ← Product CRUD & queries
    │   ├── orders.js             ← Order management
    │   └── cart.js               ← Cart persistence (localStorage + Supabase)
    └── utils/
        ├── helpers.js            ← formatPrice, formatDate, capitalize, debounce
        ├── toast.js              ← Bootstrap Toast wrapper
        └── validators.js         ← Form validation helpers
```

---

## Architecture: Separation of Concerns

Every feature is split into **two layers**:

### 1 — Service Layer (`src/services/`)
- Contains **all Supabase queries and business logic**.
- Functions must be `async`, return data or throw errors — they must never touch the DOM.
- Export named functions only. No default exports in service files.

```js
// ✅ Good — src/services/products.js
import { supabase } from './supabase.js';

export async function getProducts(filters = {}) {
  const query = supabase.from('products').select('*');
  if (filters.category) query.eq('category', filters.category);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
```

### 2 — Page / UI Layer (`src/pages/`)
- Handles **DOM manipulation, event listeners, and rendering only**.
- Calls service functions and renders the result — never queries Supabase directly.
- Each page module exports a single `default` initialiser function.

```js
// ✅ Good — src/pages/products.js
import { getProducts } from '@services/products.js';
import { renderProductCard } from '@/components/productCard.js';

export default async function initProducts() {
  const grid = document.getElementById('product-grid');
  try {
    const products = await getProducts();
    grid.innerHTML = products.map(renderProductCard).join('');
  } catch (err) {
    grid.innerHTML = `<p class="text-danger">Failed to load products.</p>`;
  }
}
```

---

## Supabase Usage

### Client — single shared instance

```js
// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

- **Always import `supabase` from `src/services/supabase.js`**. Never call `createClient` more than once.

### Authentication (`src/services/auth.js`)

All auth calls go through `src/services/auth.js`. The page layer never calls `supabase.auth.*` directly.

```js
export async function signIn(email, password) { ... }
export async function signUp(email, password, metadata) { ... }
export async function signOut() { ... }
export async function getSession() { ... }
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}
```

### Guarding Protected Pages

```js
// At the top of any protected page init function
import { getSession } from '@services/auth.js';

export default async function initAccount() {
  const session = await getSession();
  if (!session) {
    window.location.href = '/src/pages/login.html';
    return;
  }
  // ... rest of page logic
}
```

---

## UI & Bootstrap Conventions

- Use **Bootstrap utility classes** for layout, spacing, and typography. Avoid writing custom CSS for things Bootstrap already covers.
- Custom CSS goes in `src/styles/main.css`. Scope custom classes with a `mg-` prefix (e.g., `.mg-product-card`).
- **Bootstrap components that require JS** (Modals, Toasts, Dropdowns) must be initialised via the Bootstrap JS API, not data attributes alone, when opened programmatically.

```js
// ✅ Correct — programmatic Bootstrap Toast
import { showToast } from '@utils/toast.js';
showToast('Item added to cart!', 'success');
```

- **Never use `document.write`**. Build HTML strings with template literals or `createElement`.

---

## Coding Conventions

### Naming
| Item | Convention | Example |
|---|---|---|
| Files | kebab-case | `product-detail.js` |
| Functions | camelCase | `getProducts()` |
| CSS classes | BEM / Bootstrap + `mg-` prefix | `.mg-hero-banner` |
| Supabase table names | snake_case | `order_items` |
| Env variables | `VITE_` prefix, SCREAMING_SNAKE | `VITE_SUPABASE_URL` |

### Functions
- Keep functions **small and single-purpose** (< 40 lines where possible).
- Prefer `async/await` over `.then()` chains.
- Always destructure Supabase responses: `const { data, error } = await ...`

### Error Handling
- Service functions **throw** on error.
- Page functions **catch and render** user-friendly messages.
- Use `src/utils/toast.js` for transient feedback; inline messages for persistent errors.

---

## Adding a New Page — Checklist

1. Create `src/pages/<page-name>.html` and register it in `vite.config.js` under `build.rollupOptions.input`.
2. Create `src/pages/<page-name>.js` with a default-exported `init<PageName>()` function.
3. Add the route in `src/pages/router.js`.
4. If the page needs data, add a corresponding service function in `src/services/`.
5. Protect the page with a session check if authentication is required.

---

## Environment Variables (`.env`)

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- `.env` is **git-ignored**. Never commit it.
- Access values only via `import.meta.env.VITE_*`.

---

## What Copilot Should Always Suggest

- Modular, single-responsibility functions.
- Imports from the correct layer (`@services/`, `@utils/`).
- `try/catch` around every `await` that touches the network.
- Bootstrap classes for all UI components.
- Destructured Supabase responses (`{ data, error }`).
- Auth checks at the top of protected page initialisers.
