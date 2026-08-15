// Faixas exibidas na tela "Bíblia em Áudio".
// As fontes de MP3 são as mesmas faixas de demonstração (royalty-free) já
// usadas no protótipo original — o app tenta tocá-las e, se o arquivo não
// carregar, cai automaticamente para leitura por voz (TTS) do texto do
// versículo, e por fim para um tom interno, exatamente como no original.
export const AUDIO_TRACKS = [
  {
    title: 'Salmo 23',
    subtitle: 'O Senhor é o meu pastor',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    text: 'O Senhor é o meu pastor, nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas. Refrigera a minha alma.',
  },
  {
    title: 'João 3:16',
    subtitle: 'Deus amou o mundo',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
  },
  {
    title: 'Filipenses 4:13',
    subtitle: 'Tudo posso',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    text: 'Tudo posso naquele que me fortalece.',
  },
];

// Capítulos de atalho exibidos em "Capítulos Recentes" (mesmos do protótipo
// original). bookIndex/chapterIndex apontam para data/bible-acf.json.
export const RECENT_CHAPTERS = [
  { title: 'Gênesis 1', subtitle: 'No princípio Deus criou...', bookIndex: 0, chapterIndex: 0 },
  { title: 'João 3', subtitle: 'Nicodemos e o novo nascimento', bookIndex: 42, chapterIndex: 2 },
  { title: 'Romanos 8', subtitle: 'Vida no Espírito', bookIndex: 44, chapterIndex: 7 },
];
