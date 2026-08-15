// Perguntas do Quiz Bíblico.
// O arquivo original tinha DOIS conjuntos de perguntas duplicados e
// desconectados (um com 3 perguntas fixas no HTML, outro com 10 perguntas
// dirigido por dados). Este arquivo mantém apenas o conjunto mais completo
// (10 perguntas, com placar e tela de resultado final), sem perda de
// funcionalidade em relação ao original.
export const QUIZ_QUESTIONS = [
  { question: 'Quem foi o primeiro homem criado por Deus?', options: ['Adão', 'Noé', 'Moisés', 'Abraão'], correct: 0 },
  { question: 'Quantos dias Deus levou para criar o mundo?', options: ['6 dias', '7 dias', '40 dias', '3 dias'], correct: 0 },
  { question: 'Quem construiu a arca?', options: ['Moisés', 'Noé', 'Abraão', 'Davi'], correct: 1 },
  { question: 'Qual o primeiro livro da Bíblia?', options: ['Êxodo', 'Gênesis', 'Levítico', 'Números'], correct: 1 },
  { question: 'Quem liderou os israelitas para fora do Egito?', options: ['Josué', 'Davi', 'Moisés', 'Samuel'], correct: 2 },
  { question: 'Quantos apóstolos Jesus escolheu?', options: ['10', '12', '7', '70'], correct: 1 },
  { question: 'Quem foi lançado na cova dos leões?', options: ['Davi', 'Daniel', 'José', 'Paulo'], correct: 1 },
  { question: 'Qual o último livro da Bíblia?', options: ['Atos', 'Romanos', 'Apocalipse', 'Hebreus'], correct: 2 },
  { question: 'Quem foi o rei mais sábio de Israel?', options: ['Davi', 'Salomão', 'Josias', 'Ezequias'], correct: 1 },
  { question: 'Onde Jesus nasceu?', options: ['Nazaré', 'Jerusalém', 'Belém', 'Capernaum'], correct: 2 },
];
