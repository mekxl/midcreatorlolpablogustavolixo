/**
 * Responsável por gerenciar os inputs de configuração da melodia 
 * (Sidebar) e manter a sincronia com o state central.
 */
import { appState } from '../core/state.js';

export function initGeneratorUI() {
    // Referências do DOM
    const keySelect = document.getElementById('key-select');
    const scaleSelect = document.getElementById('scale-select');
    const bpmInput = document.getElementById('bpm-input');
    const bpmValueDisplay = document.getElementById('bpm-value');
    const creativityInput = document.getElementById('creativity-input');
    const creativityValueDisplay = document.getElementById('creativity-value');
    const barsSelect = document.getElementById('bars-select');

    // Inicializa valores da UI com base no estado inicial
    const initialState = appState.get();
    keySelect.value = initialState.key;
    scaleSelect.value = initialState.scale;
    bpmInput.value = initialState.bpm;
    bpmValueDisplay.textContent = initialState.bpm;
    creativityInput.value = initialState.creativity;
    creativityValueDisplay.textContent = initialState.creativity + '%';
    barsSelect.value = initialState.bars;

    // Listeners de eventos de UI para atualizar o estado
    keySelect.addEventListener('change', (e) => {
        appState.set({ key: e.target.value });
    });

    scaleSelect.addEventListener('change', (e) => {
        appState.set({ scale: e.target.value });
    });

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

    barsSelect.addEventListener('change', (e) => {
        appState.set({ bars: parseInt(e.target.value, 10) });
    });
}
