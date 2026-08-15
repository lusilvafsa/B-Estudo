// Tela exibida quando o hash da URL não corresponde a nenhuma rota conhecida.
import { el } from '../utils/dom.js';
import { navigateTo } from '../router.js';
import { setHeaderTitle } from '../state/header.js';

export const notFoundPage = {
  render(container) {
    setHeaderTitle('Página não encontrada');
    const backBtn = el('button', { className: 'read-btn', style: 'margin-top:16px;' }, 'Voltar para o Início');
    backBtn.addEventListener('click', () => navigateTo('/'));
    container.appendChild(
      el('div', { className: 'state-message' }, [
        el('p', {}, 'Não encontramos essa tela.'),
        backBtn,
      ])
    );
  },
};
