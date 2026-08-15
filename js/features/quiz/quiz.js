// Tela: Quiz Bíblico — perguntas de múltipla escolha com placar final.
import { el } from '../../utils/dom.js';
import { QUIZ_QUESTIONS } from '../../../data/quiz.js';

function renderFinalScore(container, score, restart) {
  container.innerHTML = '';
  const card = el('div', { className: 'quiz-card quiz-final' }, [
    el('h3', {}, 'Quiz Finalizado!'),
    el('p', {}, [
      'Você acertou ',
      el('strong', {}, String(score)),
      ' de ',
      el('strong', {}, String(QUIZ_QUESTIONS.length)),
    ]),
    el('button', { className: 'read-btn', style: 'margin-top:16px;', onClick: restart }, 'Refazer Quiz'),
  ]);
  container.appendChild(card);
}

export const quizPage = {
  render(container) {
    let questionIndex = 0;
    let score = 0;
    let advanceTimer = null;

    function renderQuestion() {
      if (questionIndex >= QUIZ_QUESTIONS.length) {
        renderFinalScore(container, score, () => {
          questionIndex = 0;
          score = 0;
          renderQuestion();
        });
        return;
      }

      const q = QUIZ_QUESTIONS[questionIndex];
      container.innerHTML = '';

      const optionButtons = [];
      const resultEl = el('div', { className: 'quiz-result' });

      const optionsEl = el(
        'div',
        { className: 'quiz-options' },
        q.options.map((opt, i) => {
          const btn = el('button', { className: 'quiz-option' }, opt);
          btn.addEventListener('click', () => answer(i));
          optionButtons.push(btn);
          return btn;
        })
      );

      const card = el('div', { className: 'quiz-card' }, [
        el('p', { className: 'quiz-progress' }, `Pergunta ${questionIndex + 1} de ${QUIZ_QUESTIONS.length}`),
        el('div', { className: 'quiz-question' }, q.question),
        optionsEl,
        resultEl,
      ]);
      container.appendChild(card);

      function answer(selectedIndex) {
        optionButtons.forEach((btn, i) => {
          btn.disabled = true;
          if (i === q.correct) btn.classList.add('correct');
          else if (i === selectedIndex) btn.classList.add('wrong');
        });

        if (selectedIndex === q.correct) {
          score++;
          resultEl.textContent = '✓ Correto!';
          resultEl.style.color = 'var(--success)';
        } else {
          resultEl.textContent = `✗ Resposta: ${q.options[q.correct]}`;
          resultEl.style.color = 'var(--danger)';
        }
        resultEl.classList.add('show');

        clearTimeout(advanceTimer);
        advanceTimer = setTimeout(() => {
          questionIndex++;
          renderQuestion();
        }, 1500);
      }
    }

    renderQuestion();

    // Cleanup: cancela a troca de pergunta agendada se o usuário sair do
    // quiz no meio da transição (senão o setTimeout dispararia mais tarde
    // e sobrescreveria o conteúdo de outra tela já aberta).
    return () => clearTimeout(advanceTimer);
  },
};
