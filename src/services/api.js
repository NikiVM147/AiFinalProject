/**
 * api.js
 * Central place for all HTTP / API calls.
 * Import and call these functions from your page modules.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

/**
 * Thin wrapper around fetch that throws on non-2xx responses.
 * @param {string} endpoint - Path relative to BASE_URL, e.g. '/api/items'
 * @param {RequestInit} [options] - Standard fetch options
 * @returns {Promise<any>} Parsed JSON response
 */
export async function request(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return response.json();
}

export const get = (endpoint, options) =>
  request(endpoint, { method: 'GET', ...options });

export const post = (endpoint, body, options) =>
  request(endpoint, { method: 'POST', body: JSON.stringify(body), ...options });

export const put = (endpoint, body, options) =>
  request(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options });

export const del = (endpoint, options) =>
  request(endpoint, { method: 'DELETE', ...options });
