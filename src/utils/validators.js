export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? ''));
}

export function required(value) {
  return String(value ?? '').trim().length > 0;
}

export function minLength(value, len) {
  return String(value ?? '').trim().length >= len;
}

export function getFormValues(formEl) {
  const formData = new FormData(formEl);
  return Object.fromEntries(formData.entries());
}
