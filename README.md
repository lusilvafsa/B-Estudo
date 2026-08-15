# 📖 Bíblia de Estudo

Aplicativo web de estudo bíblico: Bíblia completa (ACF, 66 livros), busca por
palavra, Bíblia em áudio, orações guiadas e quiz bíblico. Interface em
português, tema claro/escuro, 100% client-side (sem backend).

## Funcionalidades

- **Bíblia completa** — 66 livros, navegação por Antigo/Novo Testamento,
  grade de capítulos, leitura com fonte e espaçamento ajustáveis
- **Leitura em voz alta (TTS)** — lê o capítulo inteiro em voz alta,
  destacando o versículo atual
- **Seleção de texto** — selecione qualquer trecho do capítulo para
  Compartilhar, Explicar (abre uma busca sobre o trecho) ou Narrar
- **Busca** — encontra qualquer palavra ou frase em todo o texto bíblico
- **Bíblia em áudio** — player com faixas de exemplo; se o áudio não
  carregar, cai automaticamente para leitura por voz e depois para um tom
  interno (nunca fica "travado")
- **Orações guiadas** — manhã, força e noite, com botão "Orar Amém"
- **Quiz bíblico** — 10 perguntas de múltipla escolha com placar final
- **Perfil** — sequência de leitura, insígnias e estatísticas
- **Configurações de voz** — tom (grave/agudo), velocidade da leitura e
  escolha da voz do sistema, usados em toda leitura por voz do app
- **Tema claro/escuro** — persistido entre sessões
- **Progresso de leitura** — lembra o último capítulo aberto

## Tecnologia

Sem build step: HTML, CSS e JavaScript puro com **ES Modules nativos**
(`<script type="module">`). Isso significa que:

- Não precisa de `npm install`, bundler ou compilação
- Abre direto no navegador ou em qualquer servidor estático
- Publica no GitHub Pages sem nenhuma etapa de build

```
├── index.html                 # shell da aplicação
├── css/                       # variáveis, base, componentes, animações
├── data/                      # versículos, orações, quiz, faixas de áudio,
│                               #   bible-acf.json (texto bíblico completo)
├── assets/media/               # vídeo do topo (H.264 + WebM)
└── js/
    ├── main.js                # ponto de entrada, registra rotas
    ├── router.js               # roteador baseado em hash (#/rota)
    ├── state/                  # tema, voz, player de áudio, título do cabeçalho
    ├── data-access/            # acesso aos dados da Bíblia e ao progresso
    │                            #   (troque por uma API no futuro sem mexer
    │                            #    nas telas — mesma interface)
    ├── utils/                  # storage, toast, fala (TTS), DOM helpers
    ├── components/             # ícones SVG compartilhados
    └── features/                # uma pasta por tela (home, bible, audio,
                                  #   prayer, quiz, profile, settings)
                                  #   bible/selectionToolbar.js: popup de
                                  #   compartilhar/explicar/narrar trecho
```

## Rodando localmente

Como o app carrega dados via `fetch` (o texto da Bíblia em JSON), ele precisa
ser servido por um servidor HTTP — abrir o `index.html` direto como arquivo
(`file://`) não funciona. Qualquer servidor estático simples resolve:

```bash
# Python
python3 -m http.server 8000

# Node (sem instalar nada, usando npx)
npx serve .
```

Depois acesse `http://localhost:8000`.

## Publicando no GitHub Pages

**Opção 1 — GitHub Actions (incluído neste projeto, recomendado)**

1. Crie um repositório no GitHub e suba este projeto:
   ```bash
   git init
   git add .
   git commit -m "Primeira versão do app"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
   git push -u origin main
   ```
2. No GitHub, vá em **Settings → Pages** e em "Build and deployment" escolha
   **Source: GitHub Actions**.
3. Pronto — o workflow em `.github/workflows/deploy.yml` publica
   automaticamente a cada push na branch `main`. Acompanhe em **Actions**.
4. O site fica disponível em
   `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/`.

**Opção 2 — Deploy pela branch, sem Actions**

Em **Settings → Pages**, em "Build and deployment", escolha **Source: Deploy
from a branch**, selecione a branch `main` e a pasta `/ (root)`. Não é
necessário nenhum passo de build.

## Notas sobre o conteúdo

- Texto bíblico: versão **ACF** (Almeida Corrigida Fiel).
- As faixas da tela "Bíblia em Áudio" usam arquivos de demonstração
  (royalty-free, via SoundHelix) como placeholder — troque `data/audioTracks.js`
  pelas suas próprias narrações quando tiver.
- Sequência de leitura, insígnias e estatísticas do Perfil são valores de
  exemplo (não há, ainda, um sistema de métricas real por trás) — quando
  o app passar a registrar isso de verdade, basta alimentar
  `js/features/profile/profile.js` com os dados reais.
- O botão **Explicar** (na seleção de texto) abre uma busca no Google sobre
  o trecho selecionado em uma nova aba — como o app não tem backend nem
  chave de API de IA, essa é a forma de dar uma explicação real sem
  inventar conteúdo teológico por conta própria. Se um dia o app ganhar um
  backend, dá pra trocar por uma chamada de API dentro de
  `js/features/bible/reader.js` (função `handleExplainSelection`), mantendo
  o resto igual.

## O que mudou em relação ao protótipo original

Este projeto partiu de um único arquivo HTML de ~7,4MB. Na reestruturação,
foram corrigidos alguns problemas reais encontrados no arquivo original:

- Dois sistemas de navegação concorrentes foram unificados em um roteador
  único baseado em hash
- Um player de áudio duplicado (com uma variável declarada duas vezes no
  escopo global) quebrava a versão "robusta" do player em tempo de
  execução — os botões de próxima/anterior faixa não funcionavam
- O vídeo do topo estava em H.265/HEVC, codec sem suporte nativo na maioria
  dos navegadores (Chrome, Firefox, Edge) — foi convertido para H.264/WebM
- O mesmo vídeo estava embutido em Base64 três vezes no HTML (~3,3MB
  redundantes); agora é um único arquivo real, carregado uma vez
- O rótulo "(KJV)" nos versículos de destaque foi corrigido para "(ACF)",
  a versão realmente usada em todo o app
- O ícone da Bíblia (nav inferior, atalhos, insígnia, favicon) era um livro
  genérico desenhado em SVG — agora usa a imagem real enviada
  (`assets/icons/bible-icon.png`, livro com cruz e fita vermelha)
- A leitura por voz do versículo do dia continuava falando em segundo
  plano mesmo depois de trocar de tela
- O placar do Quiz podia, em certos casos, sobrescrever outra tela já
  aberta se o usuário saísse no meio da transição entre perguntas
- A busca podia mostrar um resultado desatualizado se o usuário digitasse
  rápido demais (resposta antiga chegando depois da mais recente)
- Clicar num versículo para destacá-lo conflitava com arrastar para
  selecionar um trecho de texto
