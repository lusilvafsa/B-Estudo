// Tela: Bíblia em Áudio — player de faixas + atalhos de capítulos recentes.
import { qs, el } from '../../utils/dom.js';
import { icons } from '../../components/icons.js';
import { toast } from '../../utils/toast.js';
import { navigateTo } from '../../router.js';
import { AUDIO_TRACKS, RECENT_CHAPTERS } from '../../../data/audioTracks.js';
import {
  subscribeAudioPlayer,
  togglePlay,
  seekTo,
  nextTrack,
  prevTrack,
  formatPlayerTime,
  teardownAudioPlayer,
} from '../../state/audioPlayer.js';

function template() {
  return `
    <div class="audio-player">
      <div class="audio-track-info">
        <div class="audio-cover">${icons.audio}</div>
        <div class="audio-meta">
          <h4 id="trackTitle"></h4>
          <p id="trackSubtitle"></p>
        </div>
      </div>
      <button class="audio-progress-bar" id="progressBar" aria-label="Progresso da faixa">
        <div class="audio-progress-fill" id="progressFill"></div>
      </button>
      <div class="audio-time">
        <span id="currentTime">0:00</span>
        <span id="totalTime">0:00</span>
      </div>
      <div class="audio-status" id="audioStatus"></div>
      <div class="audio-controls">
        <button class="audio-btn" id="btnPrev" aria-label="Faixa anterior">${icons.prev}</button>
        <button class="audio-btn play-btn" id="btnPlay" aria-label="Reproduzir">${icons.play}</button>
        <button class="audio-btn" id="btnNext" aria-label="Próxima faixa">${icons.next}</button>
      </div>
    </div>
    <div class="section-title">Capítulos Recentes</div>
    <div id="recentChapters"></div>
  `;
}

export const audioPage = {
  render(container) {
    container.innerHTML = template();

    const recentContainer = qs('#recentChapters', container);
    RECENT_CHAPTERS.forEach((ch) => {
      const card = el(
        'button',
        {
          className: 'plan-card',
          onClick: () => navigateTo(`/biblia/${ch.bookIndex}/${ch.chapterIndex}`),
        },
        [
          el('div', { className: 'plan-icon-box', html: icons.audio }),
          el('div', { className: 'plan-info' }, [
            el('h4', {}, ch.title),
            el('p', {}, ch.subtitle),
          ]),
        ]
      );
      recentContainer.appendChild(card);
    });

    const progressBar = qs('#progressBar', container);
    qs('#btnPlay', container).addEventListener('click', togglePlay);
    qs('#btnPrev', container).addEventListener('click', () => {
      prevTrack();
      toast.info('⏮ Anterior');
    });
    qs('#btnNext', container).addEventListener('click', () => {
      nextTrack();
      toast.info('⏭ Próxima');
    });
    progressBar.addEventListener('click', (e) => {
      const rect = progressBar.getBoundingClientRect();
      const ok = seekTo((e.clientX - rect.left) / rect.width);
      if (!ok) toast.info('Não é possível avançar durante leitura por voz ou tom interno');
    });

    const unsubscribe = subscribeAudioPlayer((state) => {
      const track = AUDIO_TRACKS[state.trackIndex];
      qs('#trackTitle', container).textContent = track.title;
      qs('#trackSubtitle', container).textContent = track.subtitle;
      qs('#audioStatus', container).textContent = state.statusText;
      qs('#currentTime', container).textContent = formatPlayerTime(state.currentTime);
      qs('#totalTime', container).textContent = formatPlayerTime(state.duration);
      const pct = state.duration ? (state.currentTime / state.duration) * 100 : 0;
      qs('#progressFill', container).style.width = `${pct}%`;
      qs('#btnPlay', container).innerHTML = state.isPlaying ? icons.pause : icons.play;
    });

    // Cleanup: para o áudio/TTS ao sair da tela.
    return () => {
      unsubscribe();
      teardownAudioPlayer();
    };
  },
};
