// Repositório do progresso de leitura do usuário.
//
// Hoje persiste em localStorage. A forma abaixo (getProgress/saveProgress)
// foi escolhida de propósito: no futuro, uma `ApiProgressRepository` com a
// mesma forma poderia buscar/gravar o progresso em um backend, sem exigir
// mudanças nas telas que o consomem.
//
//   getProgress(): Promise<{ book: number, chapter: number }>
//   saveProgress(progress): Promise<void>

import { getItem, setItem, STORAGE_KEYS } from '../utils/storage.js';

const DEFAULT_PROGRESS = { book: 0, chapter: 0 };

export const LocalStorageProgressRepository = {
  async getProgress() {
    const saved = getItem(STORAGE_KEYS.bibleProgress, null);
    if (!saved || typeof saved.book !== 'number' || typeof saved.chapter !== 'number') {
      return { ...DEFAULT_PROGRESS };
    }
    return saved;
  },

  async saveProgress(progress) {
    setItem(STORAGE_KEYS.bibleProgress, {
      book: progress.book,
      chapter: progress.chapter,
    });
  },
};

// Implementação ativa hoje. Trocar por uma ApiProgressRepository no futuro
// não deve exigir mudanças em quem importa `progressRepository`.
export const progressRepository = LocalStorageProgressRepository;
