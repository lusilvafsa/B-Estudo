// Toolbar flutuante que aparece ao selecionar um trecho de texto dentro de
// `containerEl` (ex.: o texto do capítulo), com ações de Compartilhar,
// Explicar, Narrar e Ouvir daqui.
import { icons } from '../../components/icons.js';

const MIN_SELECTION_LENGTH = 2;

export function attachSelectionToolbar(containerEl, { onShare, onExplain, onNarrate, onPlayFromSelection }) {
  let toolbarEl = null;

  function removeToolbar() {
    if (toolbarEl) {
      toolbarEl.remove();
      toolbarEl = null;
    }
  }

  function getSelectionInfo() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const text = selection.toString().trim().replace(/^\d+\s*/, '');
    if (text.length < MIN_SELECTION_LENGTH) return null;
    if (!containerEl.contains(selection.anchorNode)) return null;
    return { text, rect: selection.getRangeAt(0).getBoundingClientRect() };
  }

  function showToolbar(rect, text) {
    removeToolbar();
    toolbarEl = document.createElement('div');
    toolbarEl.className = 'selection-toolbar';

    const actions = [
      { icon: icons.share, label: 'Compartilhar', handler: onShare },
      { icon: icons.explain, label: 'Explicar', handler: onExplain },
      { icon: icons.mic, label: 'Narrar', handler: onNarrate },
    ];

    if (typeof onPlayFromSelection === 'function') {
      actions.push({ icon: icons.play, label: 'Ouvir daqui', handler: onPlayFromSelection });
    }

    actions.forEach(({ icon, label, handler }) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = `${icon}<span>${label}</span>`;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        handler(text);
        removeToolbar();
        window.getSelection()?.removeAllRanges();
      });
      toolbarEl.appendChild(btn);
    });

    document.body.appendChild(toolbarEl);

    const toolbarRect = toolbarEl.getBoundingClientRect();
    let left = rect.left + rect.width / 2;
    let top = rect.top - 10;
    left = Math.max(toolbarRect.width / 2 + 8, Math.min(left, window.innerWidth - toolbarRect.width / 2 - 8));
    if (top - toolbarRect.height < 8) {
      top = rect.bottom + toolbarRect.height + 10;
    }
    toolbarEl.style.left = `${left}px`;
    toolbarEl.style.top = `${top}px`;
  }

  function handleSelectionEnd() {
    const info = getSelectionInfo();
    if (info) {
      showToolbar(info.rect, info.text);
    } else {
      removeToolbar();
    }
  }

  function handlePointerDown(e) {
    if (toolbarEl && !toolbarEl.contains(e.target)) {
      removeToolbar();
    }
  }

  containerEl.addEventListener('mouseup', handleSelectionEnd);
  containerEl.addEventListener('touchend', handleSelectionEnd);
  document.addEventListener('mousedown', handlePointerDown);
  document.addEventListener('touchstart', handlePointerDown);

  return function cleanup() {
    removeToolbar();
    containerEl.removeEventListener('mouseup', handleSelectionEnd);
    containerEl.removeEventListener('touchend', handleSelectionEnd);
    document.removeEventListener('mousedown', handlePointerDown);
    document.removeEventListener('touchstart', handlePointerDown);
  };
}
