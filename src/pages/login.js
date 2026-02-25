import { renderLayout } from './partials/layout.js';
import { signIn, getSession } from '@services/auth.js';
import { getFormValues, isEmail } from '@utils/validators.js';
import { showToast } from '@utils/toast.js';

function showError(el, message) {
  el.textContent = message;
  el.classList.remove('d-none');
}

export default async function initLogin() {
  await renderLayout({ title: 'Login — Moto Gear Store', active: 'login' });

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
      showError(signInError, 'Invalid email.');
      return;
    }

    try {
      await signIn(values.email, values.password);
      showToast('Signed in', 'success');
      window.location.href = '/src/pages/account.html';
    } catch (err) {
      showError(signInError, err?.message ?? 'Sign in failed.');
    }
  });
}
