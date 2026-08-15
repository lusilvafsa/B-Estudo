// Tela: busca por palavra/frase em todo o texto bíblico.
import { qs, el, escapeHtml } from '../../utils/dom.js';
import { navigateTo } from '../../router.js';
import { search } from '../../data-access/bibleRepository.js';

function highlightMatch(text, query) {
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeQuery})`, 'gi');
  return escapeHtml(text).replace(regex, '<mark>$1</mark>');
}

function template() {
  return `
    <div class="search-box">
      <label class="visually-hidden" for="searchInput">Buscar na Bíblia</label>
      <input type="text" class="search-input" id="searchInput" placeholder="Digite uma palavra ou frase..." autocomplete="off">
    </div>
    <div id="searchResults" class="search-results">
      <p class="search-hint">Digite pelo menos 2 caracteres para buscar</p>
    </div>
  `;
}

export const searchPage = {
  render(container) {
    container.innerHTML = template();
    const input = qs('#searchInput', container);
    const results = qs('#searchResults', container);
    let debounceTimer = null;
    let requestId = 0;

    async function runSearch() {
      const query = input.value.trim();
      const thisRequest = ++requestId;

      if (query.length < 2) {
        results.innerHTML = '<p class="search-hint">Digite pelo menos 2 caracteres</p>';
        return;
      }
      results.innerHTML = '<p class="search-hint">Buscando...</p>';
      let matches;
      try {
        matches = await search(query, 50);
      } catch (err) {
        if (thisRequest !== requestId) return; // uma busca mais nova já está em andamento
        results.innerHTML = '<p class="search-hint">Não foi possível buscar agora. Tente novamente.</p>';
        return;
      }
      // Evita que uma busca antiga (mais lenta) sobrescreva o resultado de
      // uma busca mais recente que já respondeu.
      if (thisRequest !== requestId) return;

      if (matches.length === 0) {
        results.innerHTML = '<p class="search-hint">Nenhum resultado encontrado</p>';
        return;
      }
      results.innerHTML = `<p class="search-hint">${matches.length} resultado(s)</p>`;
      matches.forEach((r) => {
        const item = el('button', {
          className: 'search-result-item',
          html: `<strong>${escapeHtml(r.bookName)} ${r.chapter + 1}:${r.verse + 1}</strong>${highlightMatch(r.text, query)}`,
          onClick: () => navigateTo(`/biblia/${r.bookIndex}/${r.chapter}`),
        });
        results.appendChild(item);
      });
    }

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(runSearch, 300);
    });
    input.focus();

    // Cleanup: cancela uma busca agendada (debounce) pendente ao sair da tela.
    return () => clearTimeout(debounceTimer);
  },
};
