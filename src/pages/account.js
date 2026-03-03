import { renderLayout } from './partials/layout.js';
import { getSession, signOut } from '@services/auth.js';
import { getMyProfile, updateMyProfile, getMyDefaultAddress, upsertMyDefaultAddress } from '@services/profiles.js';
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

  // ── Load and render profile + address form ──────────────────
  try {
    const [profile, address] = await Promise.all([getMyProfile(), getMyDefaultAddress()]);

    profileEl.innerHTML = `
      <div class="mb-2 text-muted small">${session.user.email}</div>
      <form id="mg-profile-form" novalidate>
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label">Пълно име</label>
            <input name="full_name" class="form-control" value="${profile?.full_name ?? ''}" placeholder="Иван Иванов" />
          </div>
          <div class="col-12">
            <label class="form-label">Телефон</label>
            <input name="phone" class="form-control" value="${profile?.phone ?? address?.phone ?? ''}" placeholder="+359 88 888 8888" />
          </div>

          <div class="col-12 mt-1">
            <div class="fw-semibold mb-2">Адрес за доставка</div>
          </div>
          <div class="col-12">
            <label class="form-label">Адрес</label>
            <input name="line1" class="form-control" value="${address?.line1 ?? ''}" placeholder="ул. Пример 1" />
          </div>
          <div class="col-12">
            <label class="form-label">Адрес (ред 2)</label>
            <input name="line2" class="form-control" value="${address?.line2 ?? ''}" placeholder="вх. А, ет. 3" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Град</label>
            <input name="city" class="form-control" value="${address?.city ?? ''}" placeholder="София" />
          </div>
          <div class="col-md-6">
            <label class="form-label">Пощенски код</label>
            <input name="postal_code" class="form-control" value="${address?.postal_code ?? ''}" placeholder="1000" />
          </div>

          <div class="col-12">
            <button type="submit" class="btn btn-primary">Запази промените</button>
          </div>
        </div>
        <div id="mg-profile-error" class="alert alert-danger mt-3 d-none"></div>
      </form>
    `;

    const form = document.getElementById('mg-profile-form');
    const profileErr = document.getElementById('mg-profile-error');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      profileErr.classList.add('d-none');

      const data = Object.fromEntries(new FormData(form));
      try {
        await Promise.all([
          updateMyProfile({ full_name: data.full_name, phone: data.phone }),
          upsertMyDefaultAddress({
            full_name: data.full_name,
            phone: data.phone,
            line1: data.line1,
            line2: data.line2,
            city: data.city,
            postal_code: data.postal_code,
          }),
        ]);
        showToast('Профилът е запазен успешно!', 'success');
      } catch (err) {
        profileErr.textContent = err?.message ?? 'Грешка при запазване.';
        profileErr.classList.remove('d-none');
      }
    });
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
