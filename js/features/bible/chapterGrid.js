// Tela: grade de capítulos de um livro específico.
import { el } from '../../utils/dom.js';
import { navigateTo } from '../../router.js';
import { getBook } from '../../data-access/bibleRepository.js';
import { setHeaderTitle } from '../../state/header.js';

export const chapterGridPage = {
  async render(container, params) {
    const bookIndex = Number(params.book);
    container.innerHTML = '<div class="state-message">Carregando capítulos...</div>';

    let book;
    try {
      book = await getBook(bookIndex);
    } catch (err) {
      container.innerHTML = `<div class="state-message error">Livro não encontrado.</div>`;
      return;
    }

    setHeaderTitle(book.name);

    const grid = el('div', { className: 'chapter-grid' });
    for (let i = 0; i < book.chapterCount; i++) {
      const chapterIndex = i;
      grid.appendChild(
        el('button', { className: 'chapter-btn', onClick: () => navigateTo(`/biblia/${bookIndex}/${chapterIndex}`) }, String(i + 1))
      );
    }

    container.innerHTML = '';
    container.appendChild(grid);
  },
};
