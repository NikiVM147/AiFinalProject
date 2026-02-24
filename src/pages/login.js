import { renderLayout } from './partials/layout.js';
import { signIn, signUp, getSession } from '@services/auth.js';
import { getFormValues, isEmail, minLength } from '@utils/validators.js';
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
  const signUpForm = document.getElementById('mg-signup');
  const signInError = document.getElementById('mg-signin-error');
  const signUpError = document.getElementById('mg-signup-error');

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
