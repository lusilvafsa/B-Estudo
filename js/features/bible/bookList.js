// Tela: lista de livros da Bíblia, com abas Antigo Testamento / Novo Testamento.
import { qs, qsa, el } from '../../utils/dom.js';
import { navigateTo } from '../../router.js';
import { getAllBooks } from '../../data-access/bibleRepository.js';

function template() {
  return `
    <div class="bible-nav-tabs">
      <button class="bible-nav-tab active" data-testament="old">Antigo Test.</button>
      <button class="bible-nav-tab" data-testament="new">Novo Test.</button>
    </div>
    <div id="bookListOld" class="book-list"></div>
    <div id="bookListNew" class="book-list" style="display:none"></div>
  `;
}

function renderBookButtons(listEl, books) {
  listEl.innerHTML = '';
  books.forEach((book) => {
    const item = el(
      'button',
      { className: 'book-item', onClick: () => navigateTo(`/biblia/${book.index}`) },
      [
        document.createTextNode(book.name),
        el('span', {}, `${book.chapterCount} cap.`),
      ]
    );
    listEl.appendChild(item);
  });
}

export const bookListPage = {
  async render(container) {
    container.innerHTML = '<div class="state-message">Carregando livros...</div>';

    let books;
    try {
      books = await getAllBooks();
    } catch (err) {
      container.innerHTML = `<div class="state-message error">Não foi possível carregar a Bíblia. Verifique sua conexão e tente novamente.</div>`;
      return;
    }

    container.innerHTML = template();
    const oldList = qs('#bookListOld', container);
    const newList = qs('#bookListNew', container);
    renderBookButtons(oldList, books.filter((b) => b.testament === 'old'));
    renderBookButtons(newList, books.filter((b) => b.testament === 'new'));

    qsa('.bible-nav-tab', container).forEach((tab) => {
      tab.addEventListener('click', () => {
        qsa('.bible-nav-tab', container).forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const isOld = tab.dataset.testament === 'old';
        oldList.style.display = isOld ? 'flex' : 'none';
        newList.style.display = isOld ? 'none' : 'flex';
      });
    });
  },
};
