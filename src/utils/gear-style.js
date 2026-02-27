export const STYLE_STORAGE_KEY = 'mg_gear_style';

export const STYLES = [
  {
    id: 'cross',
    label: 'Кросова',
    description: 'Екипировка за офроуд и мотокрос – защита и свобода на движение.',
    imagePath: '/images/styles/cross.jpg',
    imageAlt: 'Кросов стил екипировка',
    allowedCategorySlugs: ['helmets', 'gloves', 'boots', 'pants', 'protectors'],
  },
  {
    id: 'road',
    label: 'Шосейна',
    description: 'За спортно и шосейно каране – аеродинамика и комфорт.',
    imagePath: '/images/styles/road.jpg',
    imageAlt: 'Шосеен стил екипировка',
    allowedCategorySlugs: ['helmets', 'jackets', 'gloves', 'boots', 'pants', 'protectors', 'accessories'],
  },
  {
    id: 'touring',
    label: 'Туринг',
    description: 'За дълги пътувания – удобство и практичност.',
    imagePath: '/images/styles/touring.jpg',
    imageAlt: 'Туринг стил екипировка',
    allowedCategorySlugs: ['helmets', 'jackets', 'gloves', 'boots', 'pants', 'protectors', 'accessories'],
  },
];

export function getSelectedStyle() {
  try {
    return localStorage.getItem(STYLE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setSelectedStyle(styleId) {
  try {
    localStorage.setItem(STYLE_STORAGE_KEY, styleId);
  } catch {
    // ignore storage failures
  }
}

export function getStyleById(styleId) {
  return STYLES.find((s) => s.id === styleId) ?? null;
}

export function filterCategoriesByStyle(categories, styleId) {
  const style = getStyleById(styleId);
  if (!style) return categories ?? [];
  const allow = new Set(style.allowedCategorySlugs);
  return (categories ?? []).filter((c) => allow.has(c.slug));
}

export function filterProductsByStyle(products, styleId) {
  const style = getStyleById(styleId);
  if (!style) return products ?? [];
  // Products with an explicit style: only show in the matching style.
  // Products with no style set (null/undefined): show in all styles.
  return (products ?? []).filter((p) => !p.style || p.style === styleId);
}
