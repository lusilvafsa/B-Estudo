// Página Home: versículo do dia, sequência, acesso rápido e planos de leitura.
import { qs, qsa } from '../../utils/dom.js';
import { icons } from '../../components/icons.js';
import { toast } from '../../utils/toast.js';
import { getItem, setItem, STORAGE_KEYS } from '../../utils/storage.js';
import { speak, stopSpeech } from '../../utils/speech.js';
import { navigateTo } from '../../router.js';
import { DAILY_VERSES } from '../../../data/verses.js';

let verseIndex = 0;
let isSpeakingVerse = false;

function isBookmarked(ref) {
  const favorites = getItem(STORAGE_KEYS.favorites, []);
  return favorites.includes(ref);
}

function toggleBookmark(ref) {
  const favorites = getItem(STORAGE_KEYS.favorites, []);
  const idx = favorites.indexOf(ref);
  if (idx >= 0) {
    favorites.splice(idx, 1);
    setItem(STORAGE_KEYS.favorites, favorites);
    toast.info('Favorito removido');
  } else {
    favorites.push(ref);
    setItem(STORAGE_KEYS.favorites, favorites);
    toast.success('Favoritado!');
  }
  return isBookmarked(ref);
}

function template() {
  const verse = DAILY_VERSES[verseIndex];
  return `
    <div class="hero-card">
      <video autoplay loop muted playsinline aria-hidden="true">
        <source src="assets/media/hero-loop.webm" type="video/webm">
        <source src="assets/media/hero-loop.mp4" type="video/mp4">
      </video>
      <div class="hero-overlay"></div>
    </div>

    <div class="streak-banner">
      <div class="streak-flame">${icons.flame}</div>
      <div class="streak-info">
        <h4>Sequência de 7 dias</h4>
        <p>Continue lendo para manter sua sequência</p>
      </div>
    </div>

    <div class="verse-card">
      <div class="verse-label">${icons.bible} Versículo do Dia</div>
      <div class="verse-text" id="verseText">${verse.text}</div>
      <div class="verse-ref" id="verseRef">${verse.ref}</div>
      <button class="audio-btn-top" id="btnVerseTTS" title="Ouvir versículo" aria-label="Ouvir versículo do dia">${icons.listen}</button>
      <div class="verse-actions">
        <button class="icon-btn" id="btnCopyVerse" title="Copiar" aria-label="Copiar versículo">${icons.copy}</button>
        <button class="icon-btn" id="btnBookmarkVerse" title="Favoritar" aria-label="Favoritar versículo">${icons.bookmark}</button>
        <button class="icon-btn" id="btnShareVerse" title="Compartilhar" aria-label="Compartilhar versículo">${icons.share}</button>
        <button class="icon-btn" id="btnNewVerse" title="Novo versículo" aria-label="Carregar novo versículo">${icons.refresh}</button>
      </div>
    </div>

    <div class="section-title">
      Acesso Rápido
      <button class="see-all" id="btnSeeAll">Ver tudo</button>
    </div>
    <div class="menu-grid">
      <button class="menu-item" data-route="/biblia">
        <div class="menu-icon">${icons.bible}</div>
        <div class="menu-title">Ler Bíblia</div>
        <div class="menu-desc">ACF e mais versões</div>
      </button>
      <button class="menu-item" data-route="/audio">
        <div class="menu-icon">${icons.audio}</div>
        <div class="menu-title">Bíblia em Áudio</div>
        <div class="menu-desc">Ouça as Escrituras</div>
      </button>
      <button class="menu-item" data-route="/oracao">
        <div class="menu-icon">${icons.prayer}</div>
        <div class="menu-title">Oração Diária</div>
        <div class="menu-desc">Devoções guiadas</div>
      </button>
      <button class="menu-item" data-route="/quiz">
        <div class="menu-icon">${icons.quiz}</div>
        <div class="menu-title">Quiz Bíblico</div>
        <div class="menu-desc">Teste seus conhecimentos</div>
      </button>
    </div>

    <div class="section-title">Planos de Leitura</div>
    <button class="plan-card" id="plan1">
      <div class="plan-icon-box">${icons.planBook}</div>
      <div class="plan-info"><h4>30 Dias com Jesus</h4><p>Dia 12 de 30</p></div>
      <div class="plan-progress">40%</div>
    </button>
    <button class="plan-card" id="plan2">
      <div class="plan-icon-box">${icons.planBook}</div>
      <div class="plan-info"><h4>Salmos de Conforto</h4><p>Dia 5 de 21</p></div>
      <div class="plan-progress">24%</div>
    </button>
  `;
}

function updateVerseDisplay(container) {
  const verse = DAILY_VERSES[verseIndex];
  qs('#verseText', container).textContent = verse.text;
  qs('#verseRef', container).textContent = verse.ref;
  const bookmarkBtn = qs('#btnBookmarkVerse', container);
  bookmarkBtn.style.color = isBookmarked(verse.ref) ? 'var(--gold)' : '';
}

function copyVerse(container) {
  const verse = DAILY_VERSES[verseIndex];
  const text = `${verse.text} — ${verse.ref}`;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(
      () => toast.success('Versículo copiado!'),
      () => fallbackCopy(text)
    );
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    const ok = document.execCommand('copy');
    toast[ok ? 'success' : 'error'](ok ? 'Versículo copiado!' : 'Não foi possível copiar');
  } catch (_e) {
    toast.error('Não foi possível copiar');
  }
  document.body.removeChild(ta);
}

async function shareVerse() {
  const verse = DAILY_VERSES[verseIndex];
  const shareData = { title: 'Bíblia de Estudo', text: `${verse.text} — ${verse.ref}` };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (_e) {
      /* usuário cancelou o compartilhamento — sem erro */
    }
  } else {
    toast.info('Compartilhamento não suportado neste navegador');
  }
}

function toggleVerseAudio(container) {
  const btn = qs('#btnVerseTTS', container);
  if (isSpeakingVerse) {
    stopSpeech();
    isSpeakingVerse = false;
    btn.classList.remove('playing');
    toast.info('Leitura parada');
    return;
  }
  const verse = DAILY_VERSES[verseIndex];
  const fullText = `${verse.text}. Referência: ${verse.ref}.`;
  isSpeakingVerse = true;
  btn.classList.add('playing');
  toast.info('Lendo versículo do dia...');
  speak(fullText, {
    onEnd: () => {
      isSpeakingVerse = false;
      btn.classList.remove('playing');
    },
    onError: () => {
      isSpeakingVerse = false;
      btn.classList.remove('playing');
      toast.error('Não foi possível ler em voz alta');
    },
  });
}

export const homePage = {
  render(container) {
    container.innerHTML = template();

    qs('#btnCopyVerse', container).addEventListener('click', () => copyVerse(container));
    qs('#btnBookmarkVerse', container).addEventListener('click', () => {
      toggleBookmark(DAILY_VERSES[verseIndex].ref);
      updateVerseDisplay(container);
    });
    qs('#btnShareVerse', container).addEventListener('click', shareVerse);
    qs('#btnNewVerse', container).addEventListener('click', () => {
      verseIndex = (verseIndex + 1) % DAILY_VERSES.length;
      updateVerseDisplay(container);
      toast.info('Novo versículo carregado');
    });
    qs('#btnVerseTTS', container).addEventListener('click', () => toggleVerseAudio(container));
    qs('#btnSeeAll', container).addEventListener('click', () => toast.info('Mais recursos em breve'));
    qs('#plan1', container).addEventListener('click', () => toast.info('Plano aberto: 30 Dias com Jesus'));
    qs('#plan2', container).addEventListener('click', () => toast.info('Plano aberto: Salmos de Conforto'));

    qsa('[data-route]', container).forEach((btn) => {
      btn.addEventListener('click', () => navigateTo(btn.dataset.route));
    });

    updateVerseDisplay(container);

    // Cleanup: para a leitura do versículo do dia ao sair da Home.
    return () => {
      if (isSpeakingVerse) {
        stopSpeech();
        isSpeakingVerse = false;
      }
    };
  },
};
