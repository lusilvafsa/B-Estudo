// Estado do tema (claro/escuro), centralizado e persistido.
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage.js';

const listeners = new Set();
let theme = getItem(STORAGE_KEYS.theme, 'dark');

function apply() {
  document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : '');
}

export function getTheme() {
  return theme;
}

export function setTheme(next) {
  theme = next === 'light' ? 'light' : 'dark';
  setItem(STORAGE_KEYS.theme, theme);
  apply();
  listeners.forEach((fn) => fn(theme));
}

export function toggleTheme() {
  setTheme(theme === 'dark' ? 'light' : 'dark');
  return theme;
}

export function onThemeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Aplica o tema salvo assim que o módulo é carregado, antes de qualquer render.
apply();
