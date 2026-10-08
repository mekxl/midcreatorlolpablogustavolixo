/**
 * Responsável por gerenciar os inputs de configuração base, personalidades
 * e manter a sincronia com o state central.
 */
import { appState } from '../core/state.js';
import { PERSONALITIES } from '../melody/personalityProfiles.js';

export function initGeneratorUI() {
    // Configurações Base
    const personalitySelect = document.getElementById('personality-select');
    const personalityDesc = document.getElementById('personality-desc');
    const keySelect = document.getElementById('key-select');
    const scaleSelect = document.getElementById('scale-select');
    const bpmInput = document.getElementById('bpm-input');
    const bpmValueDisplay = document.getElementById('bpm-value');
    const registerSelect = document.getElementById('register-select');
    const barsSelect = document.getElementById('bars-select');
    
    // Configurações Deslizantes
    const creativityInput = document.getElementById('creativity-input');
    const creativityValue = document.getElementById('creativity-value');
    const repetitionInput = document.getElementById('repetition-input');
    const repetitionValue = document.getElementById('repetition-value');
    const complexityInput = document.getElementById('complexity-input');
    const complexityValue = document.getElementById('complexity-value');
    
    // Configurações de Mutação
    const mutationIntensity = document.getElementById('mutation-intensity');
    const mutationIntensityValue = document.getElementById('mutation-intensity-value');

    const initialState = appState.get();
    
    // Inicialização Visual
    personalitySelect.value = initialState.personality;
    personalityDesc.textContent = PERSONALITIES[initialState.personality].description;
    keySelect.value = initialState.key;
    scaleSelect.value = initialState.scale;
    bpmInput.value = initialState.bpm;
    bpmValueDisplay.textContent = initialState.bpm;
    registerSelect.value = initialState.register;
    barsSelect.value = initialState.bars;
    
    creativityInput.value = initialState.creativity;
    creativityValue.textContent = initialState.creativity + '%';
    repetitionInput.value = initialState.repetition;
    repetitionValue.textContent = initialState.repetition + '%';
    complexityInput.value = initialState.complexity;
    complexityValue.textContent = initialState.complexity + '%';
    
    mutationIntensity.value = initialState.mutationIntensity;
    mutationIntensityValue.textContent = initialState.mutationIntensity + '%';

    // Listeners Base
    personalitySelect.addEventListener('change', (e) => {
        const val = e.target.value;
        appState.set({ personality: val });
        personalityDesc.textContent = PERSONALITIES[val].description;
    });
    keySelect.addEventListener('change', (e) => appState.set({ key: e.target.value }));
    scaleSelect.addEventListener('change', (e) => appState.set({ scale: e.target.value }));
    registerSelect.addEventListener('change', (e) => appState.set({ register: e.target.value }));
    barsSelect.addEventListener('change', (e) => appState.set({ bars: parseInt(e.target.value, 10) }));

    bpmInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        bpmValueDisplay.textContent = val;
        appState.set({ bpm: val });
    });

    creativityInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        creativityValue.textContent = val + '%';
        appState.set({ creativity: val });
    });

    repetitionInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        repetitionValue.textContent = val + '%';
        appState.set({ repetition: val });
    });

    complexityInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        complexityValue.textContent = val + '%';
        appState.set({ complexity: val });
    });

    mutationIntensity.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        mutationIntensityValue.textContent = val + '%';
        appState.set({ mutationIntensity: val });
    });
}
