import { renderLayout } from './partials/layout.js';

export default async function initHome() {
  await renderLayout({ title: 'Moto Gear Store', active: 'home' });
}
