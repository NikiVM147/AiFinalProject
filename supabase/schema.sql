-- Moto Gear Store (Supabase/Postgres)
-- Schema + RLS policies + Storage bucket policies

-- Extensions
create extension if not exists "pgcrypto";

-- Helper: updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================
-- Core catalog tables
-- =========================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'EUR',
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_is_active_idx on public.products(is_active);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  path text not null, -- storage object path, e.g. "<productId>/image-1.jpg"
  alt text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_id_idx on public.product_images(product_id);

-- =========================
-- Users / profiles
-- =========================

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

-- Helper: is_admin check (based on profiles.role)
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', null))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  line1 text not null,
  line2 text,
  city text not null,
  postal_code text,
  country text not null default 'BG',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists addresses_user_id_idx on public.addresses(user_id);

-- =========================
-- Cart
-- =========================

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active','converted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists carts_set_updated_at on public.carts;
create trigger carts_set_updated_at
before update on public.carts
for each row execute function public.set_updated_at();

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  created_at timestamptz not null default now(),
  unique (cart_id, product_id)
);

create index if not exists cart_items_cart_id_idx on public.cart_items(cart_id);
create index if not exists cart_items_product_id_idx on public.cart_items(product_id);

-- =========================
-- Orders
-- =========================

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','paid','shipped','cancelled')),
  total_cents integer not null check (total_cents >= 0),
  currency text not null default 'EUR',
  shipping_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);

-- =========================
-- Row Level Security (RLS)
-- =========================

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Categories
drop policy if exists "categories_select_all" on public.categories;
create policy "categories_select_all"
on public.categories
for select
to anon, authenticated
using (true);

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write"
on public.categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Products
drop policy if exists "products_select_active" on public.products;
create policy "products_select_active"
on public.products
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write"
on public.products
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Product images
drop policy if exists "product_images_select_all" on public.product_images;
create policy "product_images_select_all"
on public.product_images
for select
to anon, authenticated
using (true);

drop policy if exists "product_images_admin_write" on public.product_images;
create policy "product_images_admin_write"
on public.product_images
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Addresses
drop policy if exists "addresses_crud_own" on public.addresses;
create policy "addresses_crud_own"
on public.addresses
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Carts
drop policy if exists "carts_crud_own" on public.carts;
create policy "carts_crud_own"
on public.carts
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Cart items
drop policy if exists "cart_items_crud_own" on public.cart_items;
create policy "cart_items_crud_own"
on public.cart_items
for all
to authenticated
using (
  exists (
    select 1 from public.carts c
    where c.id = cart_id
      and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.carts c
    where c.id = cart_id
      and c.user_id = auth.uid()
  )
);

-- Orders
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
on public.orders
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
on public.orders
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin"
on public.orders
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Order items
drop policy if exists "order_items_select_own" on public.order_items;
create policy "order_items_select_own"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = order_id
      and (o.user_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "order_items_insert_own" on public.order_items;
create policy "order_items_insert_own"
on public.order_items
for insert
to authenticated
with check (
  exists (
    select 1 from public.orders o
    where o.id = order_id
      and o.user_id = auth.uid()
  )
);

drop policy if exists "order_items_update_admin" on public.order_items;
create policy "order_items_update_admin"
on public.order_items
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================
-- Storage: product images bucket + policies
-- =========================

-- Create a public bucket for product images (safe because writes are admin-only)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Public read access to product-images bucket
drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'product-images');

-- Admin-only write access to product-images bucket
drop policy if exists "Admin write product images" on storage.objects;
create policy "Admin write product images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admin update product images" on storage.objects;
create policy "Admin update product images"
on storage.objects
for update
to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admin delete product images" on storage.objects;
create policy "Admin delete product images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'product-images' and public.is_admin());
