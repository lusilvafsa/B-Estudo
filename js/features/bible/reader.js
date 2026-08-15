// Tela: leitura de um capítulo — texto, seleção de versículo, controles de
// fonte e leitura em voz alta (TTS) com destaque do versículo atual.
import { qs, el } from '../../utils/dom.js';
import { icons } from '../../components/icons.js';
import { toast } from '../../utils/toast.js';
import { navigateTo } from '../../router.js';
import { getBook, getChapter } from '../../data-access/bibleRepository.js';
import { progressRepository } from '../../data-access/progressRepository.js';
import { getItem, setItem, STORAGE_KEYS } from '../../utils/storage.js';
import { speak, stopSpeech, isSpeechSupported } from '../../utils/speech.js';
import { setHeaderTitle } from '../../state/header.js';
import { attachSelectionToolbar } from './selectionToolbar.js';

const DEFAULT_SETTINGS = { fontSize: 18, lineHeight: 1.8 };
const MIN_FONT = 12;
const MAX_FONT = 32;
const MIN_LINE = 1.2;
const MAX_LINE = 2.5;

function loadReaderSettings() {
  const saved = getItem(STORAGE_KEYS.settings, {});
  return { ...DEFAULT_SETTINGS, ...saved };
}

function saveReaderSettings(settings) {
  setItem(STORAGE_KEYS.settings, settings);
}

function template() {
  return `
    <div class="read-header">
      <div class="read-subtitle" id="readSubtitle"></div>
      <div class="read-toolbar">
        <button class="tool-btn" id="btnListen" title="Ouvir capítulo">${icons.listen}<span>Ouvir</span></button>
        <button class="tool-btn" id="btnStop" title="Parar leitura">${icons.stop}<span>Parar</span></button>
        <button class="tool-btn" id="btnFontMinus" aria-label="Diminuir fonte">A-</button>
        <button class="tool-btn" id="btnFontPlus" aria-label="Aumentar fonte">A+</button>
        <button class="tool-btn" id="btnLineMinus" aria-label="Diminuir espaçamento">⇕-</button>
        <button class="tool-btn" id="btnLinePlus" aria-label="Aumentar espaçamento">⇕+</button>
      </div>
    </div>
    <div id="resumeBanner" class="resume-banner" style="display:none;"></div>
    <div id="readContent" class="read-content"></div>
    <div class="read-controls">
      <button class="read-btn" id="btnPrevChapter">◀ Anterior</button>
      <button class="read-btn" id="btnChapterList">Capítulos</button>
      <button class="read-btn" id="btnNextChapter">Próximo ▶</button>
    </div>
  `;
}

export const readerPage = {
  async render(container, params) {
    const bookIndex = Number(params.book);
    const chapterIndex = Number(params.chapter);
    let settings = loadReaderSettings();

    container.innerHTML = '<div class="state-message">Carregando capítulo...</div>';

    let book, verses;
    try {
      [book, verses] = await Promise.all([getBook(bookIndex), getChapter(bookIndex, chapterIndex)]);
    } catch (err) {
      container.innerHTML = `<div class="state-message error">Capítulo não encontrado.</div>`;
      return;
    }

    container.innerHTML = template();
    setHeaderTitle(book.name);
    qs('#readSubtitle', container).textContent = `${book.name} — Capítulo ${chapterIndex + 1}`;

    const readContent = qs('#readContent', container);
    const resumeBanner = qs('#resumeBanner', container);
    const verseEls = [];
    verses.forEach((text, idx) => {
      const p = el('p', { className: 'verse-line' }, [
        el('sup', { className: 'verse-num' }, String(idx + 1)),
        document.createTextNode(' ' + text),
      ]);
      p.style.fontSize = settings.fontSize + 'px';
      p.style.lineHeight = String(settings.lineHeight);
      p.addEventListener('click', () => {
        if (window.getSelection().toString().length > 0) return;
        verseEls.forEach((v, i) => v.classList.toggle('selected', i === idx));
      });
      readContent.appendChild(p);
      verseEls.push(p);
    });

    progressRepository.saveProgress({ book: bookIndex, chapter: chapterIndex });

    const prevBtn = qs('#btnPrevChapter', container);
    const nextBtn = qs('#btnNextChapter', container);
    prevBtn.disabled = chapterIndex <= 0;
    nextBtn.disabled = chapterIndex >= book.chapterCount - 1;
    prevBtn.addEventListener('click', () => {
      if (chapterIndex > 0) navigateTo(`/biblia/${bookIndex}/${chapterIndex - 1}`);
    });
    nextBtn.addEventListener('click', () => {
      if (chapterIndex < book.chapterCount - 1) navigateTo(`/biblia/${bookIndex}/${chapterIndex + 1}`);
    });
    qs('#btnChapterList', container).addEventListener('click', () => navigateTo(`/biblia/${bookIndex}`));

    function applySettings() {
      verseEls.forEach((v) => {
        v.style.fontSize = settings.fontSize + 'px';
        v.style.lineHeight = String(settings.lineHeight);
      });
      saveReaderSettings(settings);
    }
    qs('#btnFontMinus', container).addEventListener('click', () => {
      settings.fontSize = Math.max(MIN_FONT, settings.fontSize - 1);
      applySettings();
    });
    qs('#btnFontPlus', container).addEventListener('click', () => {
      settings.fontSize = Math.min(MAX_FONT, settings.fontSize + 1);
      applySettings();
    });
    qs('#btnLineMinus', container).addEventListener('click', () => {
      settings.lineHeight = Math.max(MIN_LINE, +(settings.lineHeight - 0.1).toFixed(2));
      applySettings();
    });
    qs('#btnLinePlus', container).addEventListener('click', () => {
      settings.lineHeight = Math.min(MAX_LINE, +(settings.lineHeight + 0.1).toFixed(2));
      applySettings();
    });

    // Leitura em voz alta do capítulo inteiro, com destaque do versículo atual
    const listenBtn = qs('#btnListen', container);
    const stopBtn = qs('#btnStop', container);
    let readingIndex = 0;
    let isReading = false;

    if (!isSpeechSupported()) {
      listenBtn.disabled = true;
      stopBtn.disabled = true;
    }

    function highlight(idx) {
      verseEls.forEach((v, i) => v.classList.toggle('reading', i === idx));
      if (verseEls[idx]) verseEls[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function clearHighlight() {
      verseEls.forEach((v) => v.classList.remove('reading'));
    }

    function saveReadingProgress() {
      if (isReading && readingIndex > 0 && readingIndex < verses.length) {
        setItem('readingProgress', { book: bookIndex, chapter: chapterIndex, verse: readingIndex });
      }
    }

    function clearReadingProgress() {
      const saved = getItem('readingProgress', null);
      if (saved && saved.book === bookIndex && saved.chapter === chapterIndex) {
        setItem('readingProgress', null);
      }
    }

    function readNext() {
      if (!isReading) return;
      if (readingIndex >= verses.length) {
        stopReading();
        clearReadingProgress();
        toast.info('Leitura concluída');
        return;
      }
      highlight(readingIndex);
      const text = `Versículo ${readingIndex + 1}. ${verses[readingIndex]}`;
      speak(text, {
        onEnd: () => {
          readingIndex++;
          setTimeout(readNext, 300);
        },
        onError: () => stopReading(),
      });
    }

    function startReading(fromVerse = 0) {
      isReading = true;
      readingIndex = fromVerse;
      listenBtn.classList.add('active-audio');
      toast.info('Iniciando leitura...');
      readNext();
    }

    function stopReading() {
      isReading = false;
      saveReadingProgress();
      stopSpeech();
      listenBtn.classList.remove('active-audio');
      clearHighlight();
    }

    listenBtn.addEventListener('click', () => {
      if (isReading) {
        stopReading();
      } else {
        startReading(0);
      }
    });
    stopBtn.addEventListener('click', () => {
      stopReading();
      toast.info('Leitura parada');
    });

    // Continuar de onde parou
    const savedProgress = getItem('readingProgress', null);
    if (savedProgress && savedProgress.book === bookIndex && savedProgress.chapter === chapterIndex && savedProgress.verse > 0) {
      resumeBanner.style.display = 'block';
      resumeBanner.innerHTML = `
        <span>Parou no versículo <strong>${savedProgress.verse + 1}</strong></span>
        <button class="tool-btn" id="btnResume">Continuar</button>
      `;
      qs('#btnResume', resumeBanner).addEventListener('click', () => {
        resumeBanner.style.display = 'none';
        startReading(savedProgress.verse);
      });
    }

    // Seleção de texto: compartilhar / explicar / narrar / ouvir daqui
    async function handleShareSelection(text) {
      const shareData = { title: `${book.name} ${chapterIndex + 1}`, text };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (_e) {
          /* usuário cancelou — sem erro */
        }
      } else if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(
          () => toast.success('Trecho copiado!'),
          () => toast.error('Não foi possível copiar')
        );
      } else {
        toast.info('Compartilhamento não suportado neste navegador');
      }
    }

    function handleExplainSelection(text) {
      const query = encodeURIComponent(`"${text}" significado bíblico explicação`);
      window.open(`https://www.google.com/search?q=${query}`, '_blank', 'noopener,noreferrer');
      toast.info('Abrindo explicação em uma nova aba...');
    }

    function handleNarrateSelection(text) {
      stopReading();
      toast.info('Lendo trecho selecionado...');
      speak(text, { onError: () => toast.error('Não foi possível ler o trecho') });
    }

    function getVerseIndexFromNode(node) {
      let el = node;
      while (el && !el.classList?.contains('verse-line')) {
        el = el.parentElement;
      }
      if (!el) return -1;
      return verseEls.indexOf(el);
    }

    function handlePlayFromSelection() {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const idx = getVerseIndexFromNode(selection.anchorNode);
      if (idx >= 0) {
        window.getSelection()?.removeAllRanges();
        stopReading();
        startReading(idx);
      }
    }

    const detachSelectionToolbar = attachSelectionToolbar(readContent, {
      onShare: handleShareSelection,
      onExplain: handleExplainSelection,
      onNarrate: handleNarrateSelection,
      onPlayFromSelection: handlePlayFromSelection,
    });

    return () => {
      stopReading();
      detachSelectionToolbar();
    };
  },
};
