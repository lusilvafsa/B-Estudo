// Estado e lógica do player de áudio da tela "Bíblia em Áudio".
//
// O protótipo original tinha DOIS scripts de player concorrentes no mesmo
// arquivo, ambos declarando `let isPlaying` no escopo global — isso quebra
// a análise (parse) do segundo bloco no navegador (SyntaxError: identifier
// already declared) e fazia o player "robusto" (com fallback para TTS e
// tom interno) nunca rodar de verdade. Este módulo consolida os dois em
// uma única implementação, com toda a resiliência do original preservada:
// MP3 -> fala por voz (TTS) -> tom interno, nessa ordem.

import { AUDIO_TRACKS } from '../../data/audioTracks.js';
import { formatTime } from '../utils/format.js';
import { speak, stopSpeech } from '../utils/speech.js';

const listeners = new Set();

const state = {
  trackIndex: 0,
  isPlaying: false,
  mode: null, // 'mp3' | 'tts' | 'tone' | null
  currentTime: 0,
  duration: 0,
  statusText: 'Toque em ▶ para iniciar',
};

let audioEl = null;
let audioCtx = null;
let oscillator = null;
let toneProgressTimer = null;

function emit() {
  listeners.forEach((fn) => fn({ ...state }));
}

export function subscribeAudioPlayer(fn) {
  listeners.add(fn);
  fn({ ...state });
  return () => listeners.delete(fn);
}

function currentTrack() {
  return AUDIO_TRACKS[state.trackIndex];
}

function setStatus(text) {
  state.statusText = text;
  emit();
}

function ensureAudioEl() {
  if (audioEl) return audioEl;
  audioEl = new Audio();
  audioEl.crossOrigin = 'anonymous';
  audioEl.addEventListener('timeupdate', () => {
    state.currentTime = audioEl.currentTime;
    state.duration = audioEl.duration || 0;
    emit();
  });
  audioEl.addEventListener('loadedmetadata', () => {
    state.duration = audioEl.duration || 0;
    emit();
  });
  audioEl.addEventListener('ended', () => {
    state.isPlaying = false;
    setStatus('▶ Toque para ouvir novamente');
  });
  audioEl.addEventListener('error', () => {
    setStatus('MP3 indisponível, tentando leitura por voz...');
    playTts();
  });
  return audioEl;
}

function stopTone() {
  if (oscillator) {
    try { oscillator.stop(); } catch (_e) { /* ignore */ }
    oscillator = null;
  }
  clearInterval(toneProgressTimer);
}

function playTone() {
  stopTone();
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) {
      setStatus('Áudio indisponível neste navegador');
      return;
    }
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const gain = audioCtx.createGain();
  oscillator = audioCtx.createOscillator();
  oscillator.connect(gain);
  gain.connect(audioCtx.destination);
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 2);
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 3);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 3);

  state.mode = 'tone';
  state.isPlaying = true;
  setStatus('Tocando tom interno (faixa de exemplo indisponível)');

  let pct = 0;
  state.duration = 3;
  toneProgressTimer = setInterval(() => {
    pct += 0.1;
    state.currentTime = Math.min(pct, 3);
    emit();
    if (pct >= 3) {
      clearInterval(toneProgressTimer);
      state.isPlaying = false;
      setStatus('▶ Toque para ouvir novamente');
      emit();
    }
  }, 100);
}

function playTts() {
  stopTone();
  state.mode = 'tts';
  const ok = speak(currentTrack().text, {
    onStart: () => {
      state.isPlaying = true;
      setStatus('🗣️ Lendo em voz alta...');
    },
    onEnd: () => {
      state.isPlaying = false;
      setStatus('✅ Leitura concluída');
    },
    onError: () => {
      setStatus('Leitura por voz falhou, tentando tom interno...');
      playTone();
    },
  });
  if (!ok) playTone();
}

export function playCurrentTrack() {
  const el = ensureAudioEl();
  el.src = currentTrack().src;
  setStatus('⏳ Iniciando...');
  const playPromise = el.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        state.mode = 'mp3';
        state.isPlaying = true;
        setStatus(`▶ ${currentTrack().title}`);
        emit();
      })
      .catch(() => playTts());
  }
}

export function togglePlay() {
  if (state.isPlaying) {
    if (audioEl) audioEl.pause();
    stopTone();
    stopSpeech();
    state.isPlaying = false;
    setStatus('⏸ Pausado');
    return;
  }
  playCurrentTrack();
}

export function seekTo(fraction) {
  if (state.mode !== 'mp3' || !audioEl || !audioEl.duration) return false;
  audioEl.currentTime = Math.max(0, Math.min(1, fraction)) * audioEl.duration;
  return true;
}

function loadTrack(index) {
  stopTone();
  stopSpeech();
  if (audioEl) audioEl.pause();
  state.trackIndex = (index + AUDIO_TRACKS.length) % AUDIO_TRACKS.length;
  state.isPlaying = false;
  state.mode = null;
  state.currentTime = 0;
  state.duration = 0;
  setStatus('Toque em ▶ para iniciar');
}

export function nextTrack() {
  loadTrack(state.trackIndex + 1);
}

export function prevTrack() {
  loadTrack(state.trackIndex - 1);
}

export function getCurrentTrackMeta() {
  return currentTrack();
}

export function formatPlayerTime(seconds) {
  return formatTime(seconds);
}

/** Para tudo — chamado ao sair da tela de áudio. */
export function teardownAudioPlayer() {
  if (audioEl) audioEl.pause();
  stopTone();
  stopSpeech();
  state.isPlaying = false;
  emit();
}
