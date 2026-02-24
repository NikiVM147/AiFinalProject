import { Toast } from 'bootstrap';

const CONTAINER_ID = 'mg-toast-container';

function ensureContainer() {
  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = CONTAINER_ID;
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '1080';
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message, variant = 'primary', options = {}) {
  const container = ensureContainer();

  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center text-bg-${variant} border-0`;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  container.appendChild(toastEl);

  const toast = new Toast(toastEl, {
    delay: options.delay ?? 2500,
    autohide: options.autohide ?? true,
  });

  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  toast.show();
}
