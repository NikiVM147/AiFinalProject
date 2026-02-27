-- =====================================================================
-- Moto Gear Store  PRO Vibe Seed (Dainese, Alpinestars, AGV)
-- =====================================================================
BEGIN;

TRUNCATE TABLE public.product_images, public.cart_items, public.order_items
  RESTART IDENTITY CASCADE;
DELETE FROM public.products;
DELETE FROM public.categories;

-- 1. CATEGORIES
INSERT INTO public.categories (id, name, slug) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Helmets',    'helmets'),
  ('00000000-0000-0000-0000-000000000002', 'Jackets',    'jackets'),
  ('00000000-0000-0000-0000-000000000003', 'Gloves',     'gloves'),
  ('00000000-0000-0000-0000-000000000004', 'Protectors', 'protectors'),
  ('00000000-0000-0000-0000-000000000005', 'Pants',      'pants'),
  ('00000000-0000-0000-0000-000000000006', 'Boots',      'boots'),
  ('00000000-0000-0000-0000-000000000007', 'Accessories','accessories'),
  ('00000000-0000-0000-0000-000000000008', 'Parts',      'parts'),
  ('00000000-0000-0000-0000-000000000009', 'Exhaust',    'exhaust')
ON CONFLICT (slug) DO NOTHING;

-- 2. PRODUCTS
INSERT INTO public.products (id, category_id, name, slug, brand, description, price_cents, currency, stock, is_active) VALUES
  ('00000000-0000-0000-0000-000000001000', '00000000-0000-0000-0000-000000000001', 'AGV Pista GP RR Mono Carbon',             'agv-pista-gp-rr-mono-carbon',                 'AGV',          'The highest level of protection on the track. Full carbon fiber construction and MotoGP technology.',                                145000, 'EUR', 10, true),
  ('00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000001', 'AGV K6 S Mono Matt Black',                'agv-k6-s-mono-matt-black',                    'AGV',          'Lightest road helmet in the world. Versatile, safe, and incredibly aerodynamic.',                                                       44900, 'EUR', 10, true),
  ('00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000000001', 'AGV K3 Solid Matte Black',                'agv-k3-solid-matte-black',                    'AGV',          'Excellent road helmet with sun visor. Safe and comfortable for every rider.',                                                           22900, 'EUR', 10, true),
  ('00000000-0000-0000-0000-000000001003', '00000000-0000-0000-0000-000000000001', 'AGV K1 S Mono Black',                     'agv-k1-s-mono-black',                         'AGV',          'Inspired by racing, built for the street. Entry level helmet with high-performance features.',                                          19900, 'EUR', 10, true),
  ('00000000-0000-0000-0000-000000001004', '00000000-0000-0000-0000-000000000002', 'Alpinestars Missile V2 Ignition Jacket',  'alpinestars-missile-v2-ignition-jacket',      'Alpinestars',  'Premium leather racing jacket with Tech-Air 5 ready protection and superior abrasion resistance.',                                      59995, 'EUR', 10, true),
  ('00000000-0000-0000-0000-000000001005', '00000000-0000-0000-0000-000000000002', 'Alpinestars T-GP R V3 Drystar Jacket',    'alpinestars-tgp-r-v3-drystar-jacket',         'Alpinestars',  'Waterproof textile jacket with sport styling and Alpinestars Drystar membrane.',                                                        36995, 'EUR', 10, true),
  ('00000000-0000-0000-0000-000000001006', '00000000-0000-0000-0000-000000000002', 'Dainese Racing 5 Leather Jacket',         'dainese-racing-5-leather-jacket',             'Dainese',      'Iconic Dainese sport leather jacket with aluminum shoulder plates and S1 fabric.',                                                       56900, 'EUR', 10, true),
  ('00000000-0000-0000-0000-000000001007', '00000000-0000-0000-0000-000000000002', 'Dainese Avro 5 Leather Jacket',           'dainese-avro-5-leather-jacket',               'Dainese',      'High-performance racing jacket with Microelastic 2.0 and Tutu cowhide leather.',                                                       59995, 'EUR', 10, true),
  ('00000000-0000-0000-0000-000000001008', '00000000-0000-0000-0000-000000000003', 'Alpinestars GP Pro R4 Gloves',            'alpinestars-gp-pro-r4-gloves',                'Alpinestars',  'Pure racing gloves with kangaroo leather, carbon knuckles, and DFS protection.',                                                       24999, 'EUR', 10, true),
  ('00000000-0000-0000-0000-000000001009', '00000000-0000-0000-0000-000000000003', 'Alpinestars SP-8 V3 Leather Gloves',      'alpinestars-sp8-v3-leather-gloves',           'Alpinestars',  'Highly versatile sports riding glove with goatskin leather and EVA padding.',                                                          11499, 'EUR', 10, true),
  ('00000000-0000-0000-0000-000000001010', '00000000-0000-0000-0000-000000000003', 'Dainese Reacto Carbon Long Gloves',       'dainese-reacto-carbon-long-gloves',           'Dainese',      'Sport gloves with carbon fiber knuckles and reinforced palms for street and track.',                                                    15900, 'EUR', 10, true),
  ('00000000-0000-0000-0000-000000001011', '00000000-0000-0000-0000-000000000003', 'Dainese Impeto D-Dry Gloves',             'dainese-impeto-ddry-gloves',                  'Dainese',      'Waterproof and breathable sport gloves with goatskin construction.',                                                                    13994, 'EUR', 10, true),
  ('00000000-0000-0000-0000-000000001012', '00000000-0000-0000-0000-000000000005', 'Alpinestars Missile V3 Leather Trousers', 'alpinestars-missile-v3-leather-trousers',     'Alpinestars',  'Premium leather pants with accordion stretch and Alpinestars GP-R protectors.',                                                        46995, 'EUR', 10, true),
  ('00000000-0000-0000-0000-000000001013', '00000000-0000-0000-0000-000000000005', 'Alpinestars Andes v4 Drystar Trousers',   'alpinestars-andes-v4-drystar-trousers',       'Alpinestars',  'Touring pants with waterproof Drystar membrane and removable thermal liner.',                                                          29995, 'EUR', 10, true),
  ('00000000-0000-0000-0000-000000001014', '00000000-0000-0000-0000-000000000005', 'Dainese Delta 4 Leather Pants',           'dainese-delta-4-leather-pants',               'Dainese',      'The classic sport leather trousers with Tutu leather and S1 elasticated inserts.',                                                     47900, 'EUR', 10, true),
  ('00000000-0000-0000-0000-000000001015', '00000000-0000-0000-0000-000000000005', 'Dainese Pony 3 Leather Pants',            'dainese-pony-3-leather-pants',                'Dainese',      'Comfortable and protective everyday leather pants for road use.',                                                                       40449, 'EUR', 10, true),
  ('00000000-0000-0000-0000-000000001016', '00000000-0000-0000-0000-000000000006', 'Alpinestars Supertech R Vented Boots',    'alpinestars-supertech-r-vented-boots',        'Alpinestars',  'Legendary racing boots used by champions. Maximum protection and ventilation.',                                                         57995, 'EUR', 10, true),
  ('00000000-0000-0000-0000-000000001017', '00000000-0000-0000-0000-000000000006', 'Alpinestars SMX-6 v2 Drystar Boots',      'alpinestars-smx6-v2-drystar-boots',           'Alpinestars',  'Performance street and track boot with waterproof Drystar membrane.',                                                                  31995, 'EUR', 10, true),
  ('00000000-0000-0000-0000-000000001018', '00000000-0000-0000-0000-000000000006', 'Dainese Torque 4 Out Boots',              'dainese-torque-4-out-boots',                  'Dainese',      'Racing boots with axial distortion control system and high-grip TPU inserts.',                                                         38900, 'EUR', 10, true),
  ('00000000-0000-0000-0000-000000001019', '00000000-0000-0000-0000-000000000006', 'Dainese Axial 2 Air Boots',               'dainese-axial-2-air-boots',                   'Dainese',      'The most advanced motorcycle racing boot with Kevlar carbon D-Axial system.',                                                          69900, 'EUR', 10, true),
  ('00000000-0000-0000-0000-000000001020', '00000000-0000-0000-0000-000000000004', 'Alpinestars Nucleon KR-R Back Protector', 'alpinestars-nucleon-krr-back-protector',       'Alpinestars',  'Race-spec back protector with high-performance cooling and flexibility.',                                                               12994, 'EUR', 10, true),
  ('00000000-0000-0000-0000-000000001021', '00000000-0000-0000-0000-000000000004', 'Dainese Pro-Armor Back Protector',        'dainese-proarmor-back-protector',             'Dainese',      'Extremely light and flexible Level 2 back protector with honeycomb structure.',                                                        10995, 'EUR', 10, true);

-- 3. IMAGES
-- NOTE: schema uses (path, alt)  not (url, alt_text)
INSERT INTO public.product_images (id, product_id, path, alt, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000001000', '00000000-0000-0000-0000-000000001000', 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=800', 'AGV Pista GP RR Mono Carbon', 0),
  ('a0000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000001001', 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=800', 'AGV K6 S Mono Matt Black', 0),
  ('a0000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000001002', 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=800', 'AGV K3 Solid Matte Black', 0),
  ('a0000000-0000-0000-0000-000000001003', '00000000-0000-0000-0000-000000001003', 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=800', 'AGV K1 S Mono Black', 0),
  ('a0000000-0000-0000-0000-000000001004', '00000000-0000-0000-0000-000000001004', 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800', 'Alpinestars Missile V2 Ignition Jacket', 0),
  ('a0000000-0000-0000-0000-000000001005', '00000000-0000-0000-0000-000000001005', 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800', 'Alpinestars T-GP R V3 Drystar Jacket', 0),
  ('a0000000-0000-0000-0000-000000001006', '00000000-0000-0000-0000-000000001006', 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800', 'Dainese Racing 5 Leather Jacket', 0),
  ('a0000000-0000-0000-0000-000000001007', '00000000-0000-0000-0000-000000001007', 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800', 'Dainese Avro 5 Leather Jacket', 0),
  ('a0000000-0000-0000-0000-000000001008', '00000000-0000-0000-0000-000000001008', 'https://images.unsplash.com/photo-1614165933026-0750fcd503e8?auto=format&fit=crop&q=80&w=800', 'Alpinestars GP Pro R4 Gloves', 0),
  ('a0000000-0000-0000-0000-000000001009', '00000000-0000-0000-0000-000000001009', 'https://images.unsplash.com/photo-1614165933026-0750fcd503e8?auto=format&fit=crop&q=80&w=800', 'Alpinestars SP-8 V3 Leather Gloves', 0),
  ('a0000000-0000-0000-0000-000000001010', '00000000-0000-0000-0000-000000001010', 'https://images.unsplash.com/photo-1614165933026-0750fcd503e8?auto=format&fit=crop&q=80&w=800', 'Dainese Reacto Carbon Long Gloves', 0),
  ('a0000000-0000-0000-0000-000000001011', '00000000-0000-0000-0000-000000001011', 'https://images.unsplash.com/photo-1614165933026-0750fcd503e8?auto=format&fit=crop&q=80&w=800', 'Dainese Impeto D-Dry Gloves', 0),
  ('a0000000-0000-0000-0000-000000001012', '00000000-0000-0000-0000-000000001012', 'https://images.unsplash.com/photo-1558389186-438424b00a32?auto=format&fit=crop&q=80&w=800', 'Alpinestars Missile V3 Leather Trousers', 0),
  ('a0000000-0000-0000-0000-000000001013', '00000000-0000-0000-0000-000000001013', 'https://images.unsplash.com/photo-1558389186-438424b00a32?auto=format&fit=crop&q=80&w=800', 'Alpinestars Andes v4 Drystar Trousers', 0),
  ('a0000000-0000-0000-0000-000000001014', '00000000-0000-0000-0000-000000001014', 'https://images.unsplash.com/photo-1558389186-438424b00a32?auto=format&fit=crop&q=80&w=800', 'Dainese Delta 4 Leather Pants', 0),
  ('a0000000-0000-0000-0000-000000001015', '00000000-0000-0000-0000-000000001015', 'https://images.unsplash.com/photo-1558389186-438424b00a32?auto=format&fit=crop&q=80&w=800', 'Dainese Pony 3 Leather Pants', 0),
  ('a0000000-0000-0000-0000-000000001016', '00000000-0000-0000-0000-000000001016', 'https://images.unsplash.com/photo-1605152276897-4f618f831968?auto=format&fit=crop&q=80&w=800', 'Alpinestars Supertech R Vented Boots', 0),
  ('a0000000-0000-0000-0000-000000001017', '00000000-0000-0000-0000-000000001017', 'https://images.unsplash.com/photo-1605152276897-4f618f831968?auto=format&fit=crop&q=80&w=800', 'Alpinestars SMX-6 v2 Drystar Boots', 0),
  ('a0000000-0000-0000-0000-000000001018', '00000000-0000-0000-0000-000000001018', 'https://images.unsplash.com/photo-1605152276897-4f618f831968?auto=format&fit=crop&q=80&w=800', 'Dainese Torque 4 Out Boots', 0),
  ('a0000000-0000-0000-0000-000000001019', '00000000-0000-0000-0000-000000001019', 'https://images.unsplash.com/photo-1605152276897-4f618f831968?auto=format&fit=crop&q=80&w=800', 'Dainese Axial 2 Air Boots', 0),
  ('a0000000-0000-0000-0000-000000001020', '00000000-0000-0000-0000-000000001020', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800', 'Alpinestars Nucleon KR-R Back Protector', 0),
  ('a0000000-0000-0000-0000-000000001021', '00000000-0000-0000-0000-000000001021', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800', 'Dainese Pro-Armor Back Protector', 0);

COMMIT;