// Tela: Perfil — sequência de leitura, insígnias de fé e estatísticas.
//
// Nota: no protótipo original esses números (sequência, versículos lidos,
// horas de áudio, orações, favoritos) eram valores fixos de exemplo, sem
// nenhum cálculo por trás. Mantivemos o mesmo conteúdo estático aqui —
// quando o app passar a registrar essas métricas de verdade, é só trocar
// os valores abaixo pela leitura do estado real (progresso, favoritos etc.).
import { icons } from '../../components/icons.js';

const BADGES = [
  { icon: icons.badgeFirst, name: 'Primeira Leitura', unlocked: true },
  { icon: icons.badgeStreak, name: '7 Dias Seguidos', unlocked: true },
  { icon: icons.prayer, name: 'Guerreiro de Oração', unlocked: true },
  { icon: icons.badgeDouble, name: 'Estudioso da Bíblia', unlocked: false },
  { icon: icons.badgeQuiz, name: 'Mestre do Quiz', unlocked: false },
  { icon: icons.badgeFull, name: 'Bíblia Completa', unlocked: false },
];

const STATS = [
  { icon: icons.bible, value: '124', label: 'Versículos lidos' },
  { icon: icons.audio, value: '18h', label: 'Áudio ouvido' },
  { icon: icons.prayer, value: '45', label: 'Orações feitas' },
  { icon: icons.bookmark, value: '32', label: 'Favoritos' },
];

function template() {
  const badgesHtml = BADGES.map(
    (b) => `
      <div class="badge-item ${b.unlocked ? 'unlocked' : ''}">
        <div class="badge-icon">${b.icon}</div>
        <div class="badge-name">${b.name}</div>
      </div>`
  ).join('');

  const statsHtml = STATS.map(
    (s) => `
      <div class="menu-item menu-item--static">
        <div class="menu-icon">${s.icon}</div>
        <div class="menu-title">${s.value}</div>
        <div class="menu-desc">${s.label}</div>
      </div>`
  ).join('');

  return `
    <div class="streak-banner">
      <div class="streak-flame">${icons.flame}</div>
      <div class="streak-info">
        <h4>Sequência de leitura de 7 dias</h4>
        <p>Melhor: 14 dias</p>
      </div>
    </div>
    <div class="section-title">Insígnias de Fé</div>
    <div class="badge-grid">${badgesHtml}</div>
    <div class="section-title">Estatísticas</div>
    <div class="menu-grid">${statsHtml}</div>
  `;
}

export const profilePage = {
  render(container) {
    container.innerHTML = template();
  },
};
