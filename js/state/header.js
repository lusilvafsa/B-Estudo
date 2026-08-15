// Módulo minúsculo que desacopla as páginas do DOM do cabeçalho global.
// Páginas assíncronas (ex.: leitor da Bíblia) usam setHeaderTitle() para
// refinar o título depois que os dados carregam (ex.: nome do livro).
let headerEl = null;

export function bindHeaderTitleElement(el) {
  headerEl = el;
}

export function setHeaderTitle(text) {
  if (headerEl) headerEl.textContent = text;
}
