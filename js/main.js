// Ponto de entrada da aplicação.
// Monta a casca do app (splash, relógio, tema, navegação) e registra as
// rotas que o roteador (router.js) usa para decidir o que renderizar
// dentro de #appContent.
import { qs, qsa, el } from './utils/dom.js';
import { icons } from './components/icons.js';
import { registerRoute, setNotFound, onRouteChange, initRouter, navigateTo } from './router.js';
import { bindHeaderTitleElement, setHeaderTitle } from './state/header.js';
import { getTheme, toggleTheme, onThemeChange } from './state/theme.js';

import { homePage } from './features/home/home.js';
import { bookListPage } from './features/bible/bookList.js';
import { chapterGridPage } from './features/bible/chapterGrid.js';
import { readerPage } from './features/bible/reader.js';
import { searchPage } from './features/bible/search.js';
import { audioPage } from './features/audio/audio.js';
import { prayerPage } from './features/prayer/prayer.js';
import { quizPage } from './features/quiz/quiz.js';
import { profilePage } from './features/profile/profile.js';
import { settingsPage } from './features/settings/settings.js';
import { notFoundPage } from './features/notFound.js';

const NAV_ICONS = { home: icons.home, bible: icons.bible, audio: icons.audio, prayer: icons.prayer, profile: icons.profile };



function initSplashScreen() {
  setTimeout(() => {
    qs('#splashScreen').classList.add('hidden');
  }, 2500);
}

function initBottomNavIcons() {
  qsa('.nav-item').forEach((btn) => {
    const key = btn.dataset.navKey;
    const iconHost = qs('.nav-icon', btn);
    iconHost.innerHTML = NAV_ICONS[key] || '';
    btn.addEventListener('click', () => navigateTo(btn.dataset.route));
  });
}

function updateBottomNav(navKey) {
  qsa('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.navKey === navKey);
  });
}

function renderHeaderActions(meta) {
  const host = qs('#headerActions');
  host.innerHTML = '';

  if (meta.showBack) {
    const backBtn = el('button', { className: 'icon-btn', html: icons.back, title: 'Voltar', 'aria-label': 'Voltar' });
    backBtn.addEventListener('click', () => history.back());
    host.appendChild(backBtn);
  }

  if (meta.showSearch) {
    const searchBtn = el('button', { className: 'icon-btn', html: icons.search, title: 'Buscar', 'aria-label': 'Buscar na Bíblia' });
    searchBtn.addEventListener('click', () => navigateTo('/biblia/busca'));
    host.appendChild(searchBtn);
  }

  if (meta.showSettings) {
    const settingsBtn = el('button', { className: 'icon-btn', html: icons.settings, title: 'Configurações', 'aria-label': 'Configurações' });
    settingsBtn.addEventListener('click', () => navigateTo('/configuracoes'));
    host.appendChild(settingsBtn);
  }

  const themeBtn = el('button', {
    className: 'theme-toggle',
    html: getTheme() === 'light' ? icons.moon : icons.sun,
    title: 'Alternar tema',
    'aria-label': 'Alternar tema claro/escuro',
  });
  themeBtn.addEventListener('click', () => toggleTheme());
  host.appendChild(themeBtn);
}

function initRoutes() {
  registerRoute('/', homePage, { title: 'Versículo do Dia', navKey: 'home', showSettings: true });
  registerRoute('/biblia', bookListPage, { title: 'Bíblia Sagrada', navKey: 'bible', showSearch: true, showSettings: true });
  registerRoute('/biblia/busca', searchPage, { title: 'Buscar na Bíblia', navKey: 'bible', showBack: true });
  registerRoute('/biblia/:book', chapterGridPage, { title: 'Bíblia Sagrada', navKey: 'bible', showBack: true, showSearch: true });
  registerRoute('/biblia/:book/:chapter', readerPage, { title: 'Bíblia Sagrada', navKey: 'bible', showBack: true, showSearch: true });
  registerRoute('/audio', audioPage, { title: 'Bíblia em Áudio', navKey: 'audio', showSettings: true });
  registerRoute('/oracao', prayerPage, { title: 'Oração Diária', navKey: 'prayer', showSettings: true });
  registerRoute('/quiz', quizPage, { title: 'Quiz Bíblico', navKey: null, showBack: true });
  registerRoute('/perfil', profilePage, { title: 'Meu Perfil', navKey: 'profile', showSettings: true });
  registerRoute('/configuracoes', settingsPage, { title: 'Configurações', navKey: null, showBack: true });
  setNotFound(notFoundPage);

  onRouteChange((meta) => {
    setHeaderTitle(meta.title || 'Bíblia de Estudo');
    renderHeaderActions(meta);
    updateBottomNav(meta.navKey);
  });
}

function init() {
  bindHeaderTitleElement(qs('#headerTitle'));
  initSplashScreen();
  initBottomNavIcons();
  initRoutes();
  initRouter(qs('#appContent'));

  onThemeChange(() => {
    // Reaplica os ícones do cabeçalho (sol/lua) quando o tema muda.
    const host = qs('#headerActions');
    const themeBtn = qs('.theme-toggle', host);
    if (themeBtn) themeBtn.innerHTML = getTheme() === 'light' ? icons.moon : icons.sun;
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
