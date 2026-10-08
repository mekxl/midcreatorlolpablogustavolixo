/**
 * Responsável por gerenciar os inputs de configuração da melodia 
 * (Sidebar) e manter a sincronia com o state central.
 */
import { appState } from '../core/state.js';

export function initGeneratorUI() {
    const keySelect = document.getElementById('key-select');
    const scaleSelect = document.getElementById('scale-select');
    const bpmInput = document.getElementById('bpm-input');
    const bpmValueDisplay = document.getElementById('bpm-value');
    
    // Novos Controles
    const registerSelect = document.getElementById('register-select');
    const creativityInput = document.getElementById('creativity-input');
    const creativityValueDisplay = document.getElementById('creativity-value');
    const repetitionInput = document.getElementById('repetition-input');
    const repetitionValueDisplay = document.getElementById('repetition-value');
    const complexityInput = document.getElementById('complexity-input');
    const complexityValueDisplay = document.getElementById('complexity-value');
    const barsSelect = document.getElementById('bars-select');

    const initialState = appState.get();
    
    keySelect.value = initialState.key;
    scaleSelect.value = initialState.scale;
    bpmInput.value = initialState.bpm;
    bpmValueDisplay.textContent = initialState.bpm;
    
    registerSelect.value = initialState.register;
    creativityInput.value = initialState.creativity;
    creativityValueDisplay.textContent = initialState.creativity + '%';
    repetitionInput.value = initialState.repetition;
    repetitionValueDisplay.textContent = initialState.repetition + '%';
    complexityInput.value = initialState.complexity;
    complexityValueDisplay.textContent = initialState.complexity + '%';
    
    barsSelect.value = initialState.bars;

    // Listeners
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
        creativityValueDisplay.textContent = val + '%';
        appState.set({ creativity: val });
    });

    repetitionInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        repetitionValueDisplay.textContent = val + '%';
        appState.set({ repetition: val });
    });

    complexityInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        complexityValueDisplay.textContent = val + '%';
        appState.set({ complexity: val });
    });
}
