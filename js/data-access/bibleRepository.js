// Camada de acesso aos dados bíblicos.
//
// Hoje os dados vêm de um JSON estático (data/bible-acf.json), carregado sob
// demanda (só quando o usuário entra na Bíblia) para manter a carga inicial
// leve. A interface abaixo foi desenhada para que, no futuro, uma
// implementação equivalente possa buscar os mesmos dados de uma API/backend
// sem exigir mudanças nas telas que a consomem:
//
//   getAllBooks()              -> [{ index, name, abbrev, chapterCount }]
//   getChapter(bookIndex, ch)  -> string[] (versículos do capítulo)
//   search(query, limit)       -> resultados encontrados no texto
//
// Basta criar, por exemplo, um `ApiBibleRepository` com a mesma forma e
// trocar a importação nas features que usam este módulo.

const DATA_URL = new URL('../../data/bible-acf.json', import.meta.url);

let cache = null;
let loadPromise = null;

function load() {
  if (cache) return Promise.resolve(cache);
  if (loadPromise) return loadPromise;

  loadPromise = fetch(DATA_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`Falha ao carregar dados da Bíblia (HTTP ${res.status})`);
      return res.json();
    })
    .then((data) => {
      cache = data;
      return cache;
    })
    .catch((err) => {
      loadPromise = null; // permite tentar novamente
      throw err;
    });

  return loadPromise;
}

export async function getAllBooks() {
  const data = await load();
  return data.map((book, index) => ({
    index,
    name: book.name,
    abbrev: book.abbrev,
    chapterCount: book.chapters.length,
    testament: index < 39 ? 'old' : 'new',
  }));
}

export async function getBook(bookIndex) {
  const data = await load();
  const book = data[bookIndex];
  if (!book) throw new Error(`Livro inválido: ${bookIndex}`);
  return { index: bookIndex, name: book.name, abbrev: book.abbrev, chapterCount: book.chapters.length };
}

export async function getChapter(bookIndex, chapterIndex) {
  const data = await load();
  const book = data[bookIndex];
  if (!book) throw new Error(`Livro inválido: ${bookIndex}`);
  const verses = book.chapters[chapterIndex];
  if (!verses) throw new Error(`Capítulo inválido: ${bookIndex}/${chapterIndex}`);
  return verses;
}

/** Busca um termo em todo o texto bíblico. Retorna no máximo `limit` resultados. */
export async function search(query, limit = 50) {
  const data = await load();
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];

  const results = [];
  for (let bIdx = 0; bIdx < data.length; bIdx++) {
    const book = data[bIdx];
    for (let cIdx = 0; cIdx < book.chapters.length; cIdx++) {
      const chapter = book.chapters[cIdx];
      for (let vIdx = 0; vIdx < chapter.length; vIdx++) {
        if (chapter[vIdx].toLowerCase().includes(needle)) {
          results.push({
            bookName: book.name,
            bookIndex: bIdx,
            chapter: cIdx,
            verse: vIdx,
            text: chapter[vIdx],
          });
          if (results.length >= limit) return results;
        }
      }
    }
  }
  return results;
}
