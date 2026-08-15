// Wrapper único sobre a Web Speech API (speechSynthesis).
// Centraliza a seleção de voz em português e os contornos de bugs conhecidos
// de iOS/Chrome (cancelar antes de falar, pequeno atraso antes de speak(),
// e nova tentativa se a fala não iniciar). Tanto o player de áudio quanto a
// leitura de capítulos da Bíblia usam este módulo, então nunca há duas
// falas simultâneas concorrendo pela mesma voz. O tom, a velocidade e a
// voz escolhida vêm de state/voiceSettings.js (editável em Configurações).

import { getVoiceSettings } from '../state/voiceSettings.js';

const synth = window.speechSynthesis || null;

let ptVoice = null;
let allVoices = [];
let currentUtterance = null;
let watchdogTimer = null;
const voicesListeners = new Set();

const MALE_VOICE_HINTS = ['antonio', 'felipe', 'francisco', 'daniel', 'thomas', 'lucas', 'male', 'masculino', 'masculine'];
const FEMALE_VOICE_HINTS = ['female', 'feminino', 'feminine', 'helena', 'maria', 'joana'];

function isMaleVoice(v) {
  return MALE_VOICE_HINTS.some(h => v.name.toLowerCase().includes(h));
}

function isFemaleVoice(v) {
  return FEMALE_VOICE_HINTS.some(h => v.name.toLowerCase().includes(h));
}

function pickVoice() {
  if (!synth) return;
  const voices = synth.getVoices();
  if (voices.length === 0) return;
  allVoices = voices;
  ptVoice =
    voices.find((v) => v.lang === 'pt-BR') ||
    voices.find((v) => v.lang && v.lang.toLowerCase() === 'pt-br') ||
    voices.find((v) => v.lang && v.lang.startsWith('pt')) ||
    voices.find((v) => v.name && v.name.toLowerCase().includes('portugu')) ||
    voices[0];
  voicesListeners.forEach((fn) => fn(getAvailableVoices()));
}

if (synth) {
  pickVoice();
  if ('onvoiceschanged' in synth) synth.onvoiceschanged = pickVoice;
  setTimeout(pickVoice, 1000);
  setTimeout(pickVoice, 3000);
}

export function isSpeechSupported() {
  return !!synth;
}

/**
 * Lista de vozes disponíveis no navegador, priorizando português.
 * Usado pela tela de Configurações para montar o seletor de voz.
 */
export function getAvailableVoices() {
  const pt = allVoices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('pt'));
  const others = allVoices.filter((v) => !v.lang || !v.lang.toLowerCase().startsWith('pt'));
  return [...pt, ...others];
}

/** Retorna vozes masculinas em PT-BR, se houver. */
export function getMalePtVoices() {
  const pt = allVoices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('pt'));
  return pt.filter(isMaleVoice);
}

/** Chama `fn` sempre que a lista de vozes do navegador for (re)carregada. */
export function onVoicesChanged(fn) {
  voicesListeners.add(fn);
  return () => voicesListeners.delete(fn);
}

function resolveVoice(voiceURI, genderPreference) {
  if (voiceURI) {
    return allVoices.find((v) => v.voiceURI === voiceURI) || ptVoice;
  }

  const ptVoices = allVoices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('pt'));

  if (genderPreference === 'male') {
    const male = ptVoices.find(isMaleVoice);
    if (male) return male;
  }
  if (genderPreference === 'female') {
    const female = ptVoices.find(isFemaleVoice);
    if (female) return female;
  }

  return ptVoice;
}

/**
 * Fala um texto em voz alta, usando o tom/velocidade/voz configurados em
 * Configurações (ou os valores padrão, se o usuário não alterou nada).
 * @param {string} text
 * @param {{ onStart?: () => void, onEnd?: () => void, onError?: (e: any) => void }} handlers
 * @returns {boolean} false se TTS não é suportado ou o texto está vazio
 */
export function speak(text, { onStart, onEnd, onError } = {}) {
  if (!synth) {
    if (onError) onError(new Error('TTS não suportado neste navegador'));
    return false;
  }
  if (!text || !text.trim()) {
    if (onEnd) onEnd();
    return false;
  }

  try {
    synth.cancel();
  } catch (_e) {
    /* ignora */
  }

  const { pitch, rate, voiceURI, gender } = getVoiceSettings();
  const voice = resolveVoice(voiceURI, gender);

  const utterance = new SpeechSynthesisUtterance(text.trim());
  if (voice) utterance.voice = voice;
  utterance.lang = (voice && voice.lang) || 'pt-BR';
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = 1;

  let hasStarted = false;

  utterance.onstart = () => {
    hasStarted = true;
    if (onStart) onStart();
  };
  utterance.onend = () => {
    if (onEnd) onEnd();
  };
  utterance.onerror = (e) => {
    if (e.error === 'canceled' || e.error === 'interrupted') return;
    if (onError) onError(e);
    if (onEnd) onEnd();
  };

  currentUtterance = utterance;

  setTimeout(() => {
    try {
      synth.speak(utterance);
    } catch (err) {
      if (onError) onError(err);
      if (onEnd) onEnd();
      return;
    }

    clearTimeout(watchdogTimer);
    watchdogTimer = setTimeout(() => {
      if (!hasStarted && synth && !synth.speaking) {
        try {
          synth.cancel();
          synth.speak(utterance);
        } catch (_e) {
          /* ignora */
        }
      }
    }, 500);
  }, 50);

  return true;
}

export function stopSpeech() {
  clearTimeout(watchdogTimer);
  if (!synth) return;
  try {
    synth.cancel();
  } catch (_e) {
    /* ignora */
  }
  currentUtterance = null;
}

export function pauseSpeech() {
  if (synth) synth.pause();
}

export function resumeSpeech() {
  if (synth) synth.resume();
}

export function isSpeaking() {
  return !!synth && synth.speaking;
}
