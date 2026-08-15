// Sistema centralizado de notificações (toast).
// Uso: toast.success('Salvo!'), toast.error('Algo falhou'), toast.info('Aviso')

let toastEl = null;
let hideTimer = null;

function ensureToastEl() {
  if (toastEl && document.body.contains(toastEl)) return toastEl;
  toastEl = document.getElementById('toast');
  return toastEl;
}

function show(message, variant) {
  const node = ensureToastEl();
  if (!node) {
    console.warn('[toast] elemento #toast não encontrado:', message);
    return;
  }
  node.textContent = message;
  node.classList.remove('success', 'error');
  if (variant) node.classList.add(variant);
  node.classList.add('show');

  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => node.classList.remove('show'), 2500);
}

export const toast = {
  info: (message) => show(message, null),
  success: (message) => show(message, 'success'),
  error: (message) => show(message, 'error'),
};
