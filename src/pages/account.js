import { renderLayout } from './partials/layout.js';
import { getSession, signOut } from '@services/auth.js';
import { getMyProfile } from '@services/profiles.js';
import { listMyOrders } from '@services/orders.js';
import { formatDate, formatPrice } from '@utils/helpers.js';
import { showToast } from '@utils/toast.js';

export default async function initAccount() {
  await renderLayout({ title: 'Account — Moto Gear Store', active: 'account' });

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
      <div class="mb-1"><span class="text-muted">Email:</span> ${session.user.email}</div>
      <div class="mb-1"><span class="text-muted">Name:</span> ${profile?.full_name ?? '-'}</div>
      <div class="mb-1"><span class="text-muted">Phone:</span> ${profile?.phone ?? '-'}</div>
    `;
  } catch (err) {
    profileEl.innerHTML = `<div class="text-danger">Failed to load profile.</div>`;
  }

  try {
    const orders = await listMyOrders();
    if (!orders.length) {
      ordersEl.innerHTML = `<div class="text-muted">No orders yet.</div>`;
    } else {
      ordersEl.innerHTML = `
        <div class="table-responsive">
          <table class="table table-sm align-middle">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th class="text-end">Total</th>
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
    ordersError.textContent = err?.message ?? 'Failed to load orders.';
    ordersError.classList.remove('d-none');
  }

  const signOutBtn = document.getElementById('mg-signout');
  signOutBtn.addEventListener('click', async () => {
    try {
      await signOut();
      showToast('Signed out', 'secondary');
      window.location.href = '/';
    } catch (err) {
      showToast(err?.message ?? 'Failed to sign out', 'danger');
    }
  });
}
