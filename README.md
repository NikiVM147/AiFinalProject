# NVMoto Gear Store

A fully functional **multi-page motorcycle gear e-commerce app** built with Vanilla JavaScript, Bootstrap 5, Vite, and Supabase.

**Live URL:** _https://your-deploy-url.netlify.app_  
**Demo credentials:** `demo@nvmoto.com` / `demo123`

---

## What the App Does

- Browse motorcycle gear filtered by riding style (Cross, Road, Touring)
- View detailed product pages with images
- Add products to a shopping cart (guests included via localStorage)
- Register, log in, manage your profile and shipping addresses
- Place orders through a checkout flow
- **Admin users** can manage products, categories, images, and orders through a dedicated admin panel

---

## Architecture

```
Browser (Vanilla JS + Bootstrap 5)
        │
        │  Supabase REST API / Realtime
        ▼
Supabase (PostgreSQL + Auth + Storage)
```

| Layer | Technology |
|---|---|
| Language | Vanilla JavaScript (ES Modules) |
| UI Framework | Bootstrap 5 |
| Bundler | Vite 6 |
| Backend / Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (JWT) |
| File Storage | Supabase Storage |

The frontend is a **multi-page application (MPA)**. Each page is a separate HTML file with its own JS entry point. Business logic (Supabase queries) lives exclusively in `src/services/` and is never mixed with DOM code.

---

## Database Schema

```
┌─────────────┐       ┌──────────────────┐       ┌────────────────────┐
│  categories │       │     products     │       │   product_images   │
│─────────────│       │──────────────────│       │────────────────────│
│ id (PK)     │◄──────│ category_id (FK) │       │ id (PK)            │
│ name        │       │ id (PK)          │◄──────│ product_id (FK)    │
│ slug        │       │ name             │       │ path               │
│ created_at  │       │ slug             │       │ alt                │
└─────────────┘       │ brand            │       │ sort_order         │
                      │ description      │       └────────────────────┘
                      │ price_cents      │
                      │ currency         │
                      │ stock            │
                      │ style            │
                      │ is_active        │
                      └──────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
         ┌──────────┴──────┐   ┌──────────┴──────────┐
         │   cart_items    │   │    order_items      │
         │─────────────────│   │─────────────────────│
         │ id (PK)         │   │ id (PK)             │
         │ cart_id (FK)    │   │ order_id (FK)       │
         │ product_id (FK) │   │ product_id (FK)     │
         │ quantity        │   │ product_name        │
         │ unit_price_cents│   │ unit_price_cents    │
         └────────┬────────┘   │ quantity            │
                  │            └──────────┬──────────┘
         ┌────────┴────────┐             │
         │      carts      │   ┌──────────┴──────────┐
         │─────────────────│   │       orders        │
         │ id (PK)         │   │─────────────────────│
         │ user_id (FK)    │   │ id (PK)             │
         │ status          │   │ user_id (FK)        │
         └─────────────────┘   │ status              │
                               │ total_cents         │
                               │ shipping_address    │
                               └──────────┬──────────┘
                                          │
              ┌───────────────────────────┤
              │                           │
   ┌──────────┴──────┐        ┌───────────┴──────────┐
   │    profiles     │        │       addresses      │
   │─────────────────│        │──────────────────────│
   │ user_id (PK/FK) │        │ id (PK)              │
   │ full_name       │        │ user_id (FK)         │
   │ phone           │        │ full_name            │
   │ role            │        │ line1, city          │
   └─────────────────┘        │ country              │
                              └──────────────────────┘
```

**Tables:** `categories`, `products`, `product_images`, `profiles`, `addresses`, `carts`, `cart_items`, `orders`, `order_items`

All tables have **Row-Level Security (RLS)** enabled. Admins are identified via `profiles.role = 'admin'` and a Postgres helper function `is_admin()`.

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- A [Supabase](https://supabase.com) project

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/AiFinalProject.git
cd AiFinalProject

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env and fill in your Supabase credentials

# 4. Apply the database schema
# Go to Supabase → SQL Editor → paste and run supabase/schema.sql
# Then run supabase/seed.sql to populate sample data

# 5. Start the dev server
npm run dev
# App runs at http://localhost:3000
```

### Environment Variables (`.env`)

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Key Folders and Files

```
AiFinalProject/
├── index.html                        ← Home page entry
├── vite.config.js                    ← Vite config, MPA entry points, path aliases
├── package.json
├── .env                              ← Supabase credentials (git-ignored)
├── .github/
│   └── copilot-instructions.md       ← AI agent architectural instructions
├── assets/                           ← Static images and icons
├── public/
│   └── images/gear/                  ← Public gear photos
├── supabase/
│   ├── schema.sql                    ← Full DB schema + RLS policies + Storage rules
│   └── seed.sql                      ← Sample categories and products
└── src/
    ├── main.js                        ← Bootstrap CSS import + global init
    ├── styles/
    │   └── main.css                   ← Global styles, Bootstrap overrides (mg- prefix)
    ├── pages/                         ← One .html + .js per page
    │   ├── router.js                  ← Client-side path router
    │   ├── home.js                    ← Home page
    │   ├── styles.js / styles.html    ← Gear style picker (Cross/Road/Touring)
    │   ├── products.js / .html        ← Product listing with filters
    │   ├── product-detail.js / .html  ← Single product view
    │   ├── cart.js / .html            ← Shopping cart
    │   ├── checkout.js / .html        ← Checkout flow
    │   ├── login.js / .html           ← Login
    │   ├── register.js / .html        ← Registration
    │   ├── account.js / .html         ← User profile & orders
    │   ├── admin.js / .html           ← Admin panel (products, orders)
    │   └── partials/
    │       └── layout.js              ← Shared navbar + footer renderer
    ├── services/                      ← All Supabase queries (no DOM code here)
    │   ├── supabase.js                ← Single Supabase client instance
    │   ├── auth.js                    ← signIn, signUp, signOut, getSession
    │   ├── products.js                ← getProducts, getProductBySlug, getImageUrl
    │   ├── cart.js                    ← getCart, addToCart, updateCartItem, removeCartItem, clearCart
    │   ├── orders.js                  ← createOrder, getMyOrders
    │   ├── profiles.js                ← getMyProfile, updateMyProfile
    │   └── admin.js                   ← Admin CRUD for products, categories, orders; image upload
    └── utils/
        ├── helpers.js                 ← formatPrice, formatDate, debounce, localStorage helpers
        ├── toast.js                   ← Bootstrap Toast wrapper (showToast)
        ├── validators.js              ← Form validation helpers
        └── gear-style.js             ← Gear style selection persistence
```

---

## App Screens

| Screen | Path | Auth Required |
|---|---|---|
| Home | `/` | No |
| Gear Style Picker | `/src/pages/styles.html` | No |
| Products Listing | `/src/pages/products.html` | No |
| Product Detail | `/src/pages/product-detail.html` | No |
| Shopping Cart | `/src/pages/cart.html` | No (guest cart) |
| Checkout | `/src/pages/checkout.html` | Yes |
| Login | `/src/pages/login.html` | No |
| Register | `/src/pages/register.html` | No |
| My Account | `/src/pages/account.html` | Yes |
| Admin Panel | `/src/pages/admin.html` | Yes (admin only) |

---

## Security

- All protected pages check session at initialisation and redirect to `/src/pages/login.html` if unauthenticated.
- Admin routes additionally verify `profiles.role = 'admin'` both client-side and via Postgres RLS.
- Row-Level Security is enabled on every table — users can only read/write their own data.
- Supabase anon key is read-only; write operations are gated by RLS policies.
- Secrets are stored only in `.env` and accessed via `import.meta.env.VITE_*`.
