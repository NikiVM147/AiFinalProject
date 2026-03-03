import { renderLayout } from './partials/layout.js';
import { signIn, getSession } from '@services/auth.js';
import { mergeLocalCart } from '@services/cart.js';
import { getFormValues, isEmail } from '@utils/validators.js';
import { showToast } from '@utils/toast.js';

function showError(el, message) {
  el.textContent = message;
  el.classList.remove('d-none');
}

export default async function initLogin() {
  await renderLayout({ title: 'Вход — Moto Gear Store', active: 'login' });

  const session = await getSession();
  if (session) {
    window.location.href = '/src/pages/account.html';
    return;
  }

  const signInForm = document.getElementById('mg-signin');
  const signInError = document.getElementById('mg-signin-error');

  signInForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    signInError.classList.add('d-none');

    const values = getFormValues(signInForm);

    if (!isEmail(values.email)) {
      showError(signInError, 'Невалиден имейл.');
      return;
    }

    try {
      await signIn(values.email, values.password);
      await mergeLocalCart();
      showToast('Влязохте успешно.', 'success');
      // Return to previous page if came from checkout/cart, otherwise account
      const returnTo = sessionStorage.getItem('mg_login_return');
      sessionStorage.removeItem('mg_login_return');
      window.location.href = returnTo ?? '/src/pages/account.html';
    } catch (err) {
      showError(signInError, err?.message ?? 'Грешка при вход.');
    }
  });
}
