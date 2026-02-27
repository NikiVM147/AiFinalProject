import { renderLayout } from './partials/layout.js';
import { getSession, signOut } from '@services/auth.js';
import { getMyProfile } from '@services/profiles.js';
import { listMyOrders } from '@services/orders.js';
import { formatDate, formatPrice } from '@utils/helpers.js';
import { showToast } from '@utils/toast.js';

export default async function initAccount() {
  await renderLayout({ title: 'Профил — Moto Gear Store', active: 'account' });

  const session = await getSession();
  if (!session) {
    window.location.href = '/src/pages/login.html';
    return;
  }

  const profileEl = document.getElementById('mg-profile');
  const ordersEl = document.getElementById('mg-orders');
  const ordersError = document.getElementById('mg-orders-error');

  try {
    const profile = await getMyProfile();
    profileEl.innerHTML = `
      <div class="mb-1"><span class="text-muted">Имейл:</span> ${session.user.email}</div>
      <div class="mb-1"><span class="text-muted">Име:</span> ${profile?.full_name ?? '-'}</div>
      <div class="mb-1"><span class="text-muted">Телефон:</span> ${profile?.phone ?? '-'}</div>
    `;
  } catch (err) {
    profileEl.innerHTML = `<div class="text-danger">Грешка при зареждане на профила.</div>`;
  }

  try {
    const orders = await listMyOrders();
    if (!orders.length) {
      ordersEl.innerHTML = `<div class="text-muted">Все още нямаш поръчки.</div>`;
    } else {
      ordersEl.innerHTML = `
        <div class="table-responsive">
          <table class="table table-sm align-middle">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Статус</th>
                <th class="text-end">Сума</th>
              </tr>
            </thead>
            <tbody>
              ${orders
                .map(
                  (o) => `
                    <tr>
                      <td>${formatDate(o.created_at)}</td>
                      <td><span class="badge text-bg-secondary">${o.status}</span></td>
                      <td class="text-end">${formatPrice(o.total_cents, o.currency)}</td>
                    </tr>
                  `
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  } catch (err) {
    ordersError.textContent = err?.message ?? 'Грешка при зареждане на поръчките.';
    ordersError.classList.remove('d-none');
  }

  const signOutBtn = document.getElementById('mg-signout');
  signOutBtn.addEventListener('click', async () => {
    try {
      await signOut();
      showToast('Излязохте от акаунта.', 'secondary');
      window.location.href = '/';
    } catch (err) {
      showToast(err?.message ?? 'Грешка при изход.', 'danger');
    }
  });
}
