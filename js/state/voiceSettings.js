// Estado das configurações de leitura por voz (TTS), centralizado e
// persistido. Usado pela tela de Configurações e por tudo que fala em voz
// alta no app (versículo do dia, capítulos, trechos selecionados e o player
// de "Bíblia em Áudio").
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage.js';

export const DEFAULT_VOICE_SETTINGS = {
  pitch: 1, // 0.5 (grave) a 2 (agudo)
  rate: 0.85, // 0.5 (lenta) a 1.5 (rápida)
  voiceURI: null, // null = escolha automática (melhor voz em pt-BR disponível)
  gender: 'auto', // 'auto' | 'male' | 'female'
};

const listeners = new Set();
let settings = { ...DEFAULT_VOICE_SETTINGS, ...getItem(STORAGE_KEYS.voice, {}) };

export function getVoiceSettings() {
  return { ...settings };
}

export function setVoiceSettings(partial) {
  settings = { ...settings, ...partial };
  setItem(STORAGE_KEYS.voice, settings);
  listeners.forEach((fn) => fn({ ...settings }));
}

export function resetVoiceSettings() {
  setVoiceSettings({ ...DEFAULT_VOICE_SETTINGS });
}

export function onVoiceSettingsChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
