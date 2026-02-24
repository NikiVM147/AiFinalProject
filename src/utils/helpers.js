/**
 * helpers.js
 * General-purpose utility functions shared across the app.
 */

/**
 * Formats a Date object (or ISO string) into a readable locale string.
 * @param {Date|string} date
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatDate(date, options = { dateStyle: 'medium' }) {
  return new Intl.DateTimeFormat(navigator.language, options).format(
    new Date(date)
  );
}

/**
 * Formats cents into a currency string (default: EUR).
 * @param {number} cents
 * @param {string} [currency]
 * @returns {string}
 */
export function formatPrice(cents, currency = 'EUR') {
  const value = (Number(cents) || 0) / 100;
  return new Intl.NumberFormat(navigator.language, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Capitalises the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Debounces a function so it only runs after `delay` ms of inactivity.
 * @param {Function} fn
 * @param {number} delay - milliseconds
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Simple localStorage helpers with JSON serialisation.
 */
export const storage = {
  get: (key) => JSON.parse(localStorage.getItem(key) ?? 'null'),
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  remove: (key) => localStorage.removeItem(key),
};
