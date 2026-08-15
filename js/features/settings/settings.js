// Tela: Configurações — tom de voz, velocidade de leitura e escolha da voz
// usados em toda leitura por voz do app (versículo do dia, capítulos,
// trechos selecionados e o player de "Bíblia em Áudio").
import { qs } from '../../utils/dom.js';
import { toast } from '../../utils/toast.js';
import { speak, stopSpeech, getAvailableVoices, onVoicesChanged, isSpeechSupported } from '../../utils/speech.js';
import { getVoiceSettings, setVoiceSettings, resetVoiceSettings, DEFAULT_VOICE_SETTINGS } from '../../state/voiceSettings.js';

const SAMPLE_TEXT = 'O Senhor é o meu pastor; nada me faltará.';

function pitchLabel(v) {
  if (v <= 0.8) return 'Grave';
  if (v >= 1.5) return 'Agudo';
  return 'Normal';
}

function rateLabel(v) {
  if (v <= 0.7) return 'Lenta';
  if (v >= 1.15) return 'Rápida';
  return 'Normal';
}

function genderLabel(v) {
  if (v === 'male') return 'Masculina';
  if (v === 'female') return 'Feminina';
  return 'Automático';
}

function voiceOptionsHtml(voices, selectedURI) {
  const autoSelected = !selectedURI ? 'selected' : '';
  let html = `<option value="" ${autoSelected}>Automática (recomendada)</option>`;
  voices.forEach((v) => {
    const sel = v.voiceURI === selectedURI ? 'selected' : '';
    html += `<option value="${v.voiceURI}" ${sel}>${v.name} (${v.lang})</option>`;
  });
  return html;
}

function template(settings) {
  return `
    <div class="settings-section">
      <div class="settings-section-title">Voz e Leitura</div>
      <div class="settings-card">

        <div class="setting-row">
          <div class="setting-row-header">
            <span class="setting-label">Tom de voz</span>
            <span class="setting-value" id="pitchValue">${pitchLabel(settings.pitch)}</span>
          </div>
          <input type="range" class="range-slider" id="pitchSlider" min="0.5" max="2" step="0.1" value="${settings.pitch}">
          <div class="setting-scale"><span>Grave</span><span>Agudo</span></div>
        </div>

        <div class="setting-row">
          <div class="setting-row-header">
            <span class="setting-label">Velocidade da leitura</span>
            <span class="setting-value" id="rateValue">${rateLabel(settings.rate)}</span>
          </div>
          <input type="range" class="range-slider" id="rateSlider" min="0.5" max="1.5" step="0.1" value="${settings.rate}">
          <div class="setting-scale"><span>Lenta</span><span>Rápida</span></div>
        </div>

        <div class="setting-row">
          <div class="setting-row-header">
            <span class="setting-label">Gênero da voz</span>
            <span class="setting-value" id="genderValue">${genderLabel(settings.gender)}</span>
          </div>
          <select class="select-input" id="genderSelect">
            <option value="auto" ${settings.gender === 'auto' ? 'selected' : ''}>Automático</option>
            <option value="male" ${settings.gender === 'male' ? 'selected' : ''}>Masculina</option>
            <option value="female" ${settings.gender === 'female' ? 'selected' : ''}>Feminina</option>
          </select>
        </div>

        <div class="setting-row">
          <div class="setting-row-header"><span class="setting-label">Voz</span></div>
          <select class="select-input" id="voiceSelect">${voiceOptionsHtml(getAvailableVoices(), settings.voiceURI)}</select>
        </div>

      </div>

      <div class="settings-actions">
        <button class="tool-btn" id="btnTestVoice">Testar voz</button>
        <button class="tool-btn" id="btnResetVoice">Restaurar padrão</button>
      </div>
    </div>

    <div class="app-info">
      Bíblia de Estudo<br>
      Texto: versão ACF (Almeida Corrigida Fiel)
    </div>
  `;
}

export const settingsPage = {
  render(container) {
    let settings = getVoiceSettings();
    container.innerHTML = template(settings);

    if (!isSpeechSupported()) {
      qs('#btnTestVoice', container).disabled = true;
      toast.info('Leitura por voz não é suportada neste navegador');
    }

    const pitchSlider = qs('#pitchSlider', container);
    const rateSlider = qs('#rateSlider', container);
    const voiceSelect = qs('#voiceSelect', container);
    const genderSelect = qs('#genderSelect', container);
    const pitchValue = qs('#pitchValue', container);
    const rateValue = qs('#rateValue', container);
    const genderValue = qs('#genderValue', container);

    pitchSlider.addEventListener('input', () => {
      const pitch = Number(pitchSlider.value);
      pitchValue.textContent = pitchLabel(pitch);
      setVoiceSettings({ pitch });
    });

    rateSlider.addEventListener('input', () => {
      const rate = Number(rateSlider.value);
      rateValue.textContent = rateLabel(rate);
      setVoiceSettings({ rate });
    });

    genderSelect.addEventListener('change', () => {
      const gender = genderSelect.value;
      genderValue.textContent = genderLabel(gender);
      setVoiceSettings({ gender });
    });

    voiceSelect.addEventListener('change', () => {
      setVoiceSettings({ voiceURI: voiceSelect.value || null });
    });

    const unsubscribeVoices = onVoicesChanged((voices) => {
      const current = getVoiceSettings().voiceURI;
      voiceSelect.innerHTML = voiceOptionsHtml(voices, current);
    });

    qs('#btnTestVoice', container).addEventListener('click', () => {
      stopSpeech();
      speak(SAMPLE_TEXT, {
        onError: () => toast.error('Não foi possível testar a voz'),
      });
    });

    qs('#btnResetVoice', container).addEventListener('click', () => {
      resetVoiceSettings();
      settings = { ...DEFAULT_VOICE_SETTINGS };
      pitchSlider.value = settings.pitch;
      rateSlider.value = settings.rate;
      genderSelect.value = settings.gender;
      pitchValue.textContent = pitchLabel(settings.pitch);
      rateValue.textContent = rateLabel(settings.rate);
      genderValue.textContent = genderLabel(settings.gender);
      voiceSelect.innerHTML = voiceOptionsHtml(getAvailableVoices(), null);
      toast.success('Configurações de voz restauradas');
    });

    return () => {
      unsubscribeVoices();
      stopSpeech();
    };
  },
};
