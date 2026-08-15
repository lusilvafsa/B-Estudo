// Roteador central da aplicação, baseado em hash (#/rota).
// GitHub Pages serve arquivos estáticos sem reescrita de URL no servidor,
// então rotas via hash funcionam em produção sem configuração extra.
//
// Cada rota aponta para um módulo de "página" com a forma:
//   { render(container, params): void | Promise<void> }

const routes = [];
let notFoundHandler = null;
let container = null;
let onNavigate = null; // callback(routeMeta, params) — usado p/ header e bottom-nav
let currentCleanup = null; // função opcional retornada pela página anterior

export function registerRoute(pattern, page, meta = {}) {
  // pattern: '/biblia/:book/:chapter' -> regex com grupos nomeados
  const paramNames = [];
  const regexStr = pattern
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        paramNames.push(segment.slice(1));
        return '([^/]+)';
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  const regex = new RegExp(`^${regexStr}$`);
  routes.push({ regex, paramNames, page, meta });
}

export function setNotFound(page) {
  notFoundHandler = page;
}

export function onRouteChange(callback) {
  onNavigate = callback;
}

export function initRouter(rootEl) {
  container = rootEl;
  window.addEventListener('hashchange', handleRouteChange);
  handleRouteChange();
}

export function navigateTo(path) {
  if (window.location.hash === `#${path}`) {
    handleRouteChange();
  } else {
    window.location.hash = path;
  }
}

function currentPath() {
  const hash = window.location.hash.slice(1); // remove '#'
  return hash || '/';
}

async function handleRouteChange() {
  const path = currentPath();

  for (const route of routes) {
    const match = path.match(route.regex);
    if (!match) continue;

    const params = {};
    route.paramNames.forEach((name, i) => {
      params[name] = decodeURIComponent(match[i + 1]);
    });

    if (typeof currentCleanup === 'function') {
      try { currentCleanup(); } catch (_e) { /* ignora */ }
    }
    currentCleanup = null;

    if (onNavigate) onNavigate(route.meta, params);
    container.innerHTML = '';
    window.scrollTo(0, 0);

    try {
      const cleanup = await route.page.render(container, params);
      if (typeof cleanup === 'function') currentCleanup = cleanup;
    } catch (err) {
      console.error('[router] erro ao renderizar rota', path, err);
      renderErrorState(container, err);
    }
    return;
  }

  if (notFoundHandler) {
    container.innerHTML = '';
    await notFoundHandler.render(container, {});
  }
}

function renderErrorState(target, err) {
  target.innerHTML = `
    <div class="state-message error">
      <p>Não foi possível carregar esta tela.</p>
      <p style="margin-top:6px;font-size:12px;">${err && err.message ? err.message : ''}</p>
    </div>
  `;
}
