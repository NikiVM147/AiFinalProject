import { renderLayout } from './partials/layout.js';
import { STYLES, setSelectedStyle } from '@utils/gear-style.js';

function renderStyleCard(style) {
  return `
    <div class="mg-style-item">
      <div class="card h-100 mg-product-card mg-style-card" data-style="${style.id}">
        <div class="mg-card-img-wrap">
          <img src="${style.imagePath}" alt="${style.imageAlt}" loading="lazy" />
        </div>
        <div class="card-body d-flex flex-column">
          <h2 class="h5 mb-2">${style.label}</h2>
          <p class="text-muted small mb-3">${style.description}</p>
          <div class="mt-auto">
            <button class="btn btn-primary w-100" tabindex="-1">Избери</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export default async function initStyles() {
  await renderLayout({ title: 'Избор на стил — Moto Gear Store', active: 'styles' });

  const grid = document.getElementById('mg-style-grid');
  grid.innerHTML = STYLES.map(renderStyleCard).join('');

  grid.querySelectorAll('.mg-style-card[data-style]').forEach((card) => {
    card.addEventListener('click', () => {
      const styleId = card.dataset.style;
      setSelectedStyle(styleId);
      window.location.href = '/src/pages/products.html';
    });
  });
}
