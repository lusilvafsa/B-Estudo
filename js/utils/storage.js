// Camada única de acesso ao localStorage.
// Nenhuma outra parte do app deve chamar localStorage diretamente:
// isso mantém as chaves centralizadas e permite migrar o schema no futuro.

const STORAGE_VERSION = 1;

export const STORAGE_KEYS = {
  theme: 'biblia:theme',
  bibleProgress: 'biblia:bible-progress',
  favorites: 'biblia:favorites',
  settings: 'biblia:settings',
  voice: 'biblia:voice-settings',
};

function readRaw(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (err) {
    console.warn('[storage] localStorage indisponível:', err);
    return null;
  }
}

/**
 * Lê um valor JSON do localStorage.
 * Retorna `fallback` se a chave não existir ou os dados estiverem corrompidos.
 */
export function getItem(key, fallback = null) {
  const raw = readRaw(key);
  if (raw === null) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'v' in parsed && 'data' in parsed) {
      // Formato versionado: { v: STORAGE_VERSION, data: ... }
      return parsed.data;
    }
    return parsed;
  } catch (err) {
    console.warn(`[storage] dado corrompido em "${key}", ignorando.`, err);
    return fallback;
  }
}

/** Grava um valor no localStorage, envelopado com a versão do schema atual. */
export function setItem(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify({ v: STORAGE_VERSION, data: value }));
    return true;
  } catch (err) {
    console.warn(`[storage] falha ao gravar "${key}":`, err);
    return false;
  }
}

export function removeItem(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[storage] falha ao remover "${key}":`, err);
  }
}
