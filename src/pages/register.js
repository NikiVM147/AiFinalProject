import { renderLayout } from './partials/layout.js';
import { signUp, getSession } from '@services/auth.js';
import { getFormValues, isEmail, minLength } from '@utils/validators.js';
import { showToast } from '@utils/toast.js';

function showError(el, message) {
  el.textContent = message;
  el.classList.remove('d-none');
}

export default async function initRegister() {
  await renderLayout({ title: 'Register — Moto Gear Store', active: 'login' });

  const session = await getSession();
  if (session) {
    window.location.href = '/src/pages/account.html';
    return;
  }

  const signUpForm = document.getElementById('mg-signup');
  const signUpError = document.getElementById('mg-signup-error');

  signUpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    signUpError.classList.add('d-none');

    const values = getFormValues(signUpForm);

    if (!isEmail(values.email)) {
      showError(signUpError, 'Invalid email.');
      return;
    }

    if (!minLength(values.password, 6)) {
      showError(signUpError, 'Password must be at least 6 characters.');
      return;
    }

    try {
      await signUp(values.email, values.password, { full_name: values.full_name });
      showToast('Account created. Check your email if confirmation is enabled.', 'success');
    } catch (err) {
      showError(signUpError, err?.message ?? 'Sign up failed.');
    }
  });
}
