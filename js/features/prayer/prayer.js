// Tela: Oração Diária — orações guiadas com botão "Orar Amém".
import { el } from '../../utils/dom.js';
import { icons } from '../../components/icons.js';
import { toast } from '../../utils/toast.js';
import { PRAYERS } from '../../../data/prayers.js';

export const prayerPage = {
  render(container) {
    container.innerHTML = '';
    PRAYERS.forEach((prayer) => {
      const amenBtn = el('button', {
        className: 'prayer-amen',
        html: `${icons.check} Orar Amém`,
      });
      amenBtn.addEventListener('click', () => {
        amenBtn.classList.add('prayed');
        amenBtn.innerHTML = `${icons.check} Amém orado`;
        amenBtn.disabled = true;
        toast.success('Oração registrada');
      });

      const card = el('div', { className: 'prayer-card' }, [
        el('h4', { html: `${icons.prayer} ${prayer.title}` }),
        el('p', {}, prayer.text),
        amenBtn,
      ]);
      container.appendChild(card);
    });
  },
};
