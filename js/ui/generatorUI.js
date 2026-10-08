/**
 * Responsável por gerenciar os inputs de configuração base e mutação
 * e manter a sincronia com o state central.
 */
import { appState } from '../core/state.js';

export function initGeneratorUI() {
    // Configurações Base
    const keySelect = document.getElementById('key-select');
    const scaleSelect = document.getElementById('scale-select');
    const bpmInput = document.getElementById('bpm-input');
    const bpmValueDisplay = document.getElementById('bpm-value');
    const registerSelect = document.getElementById('register-select');
    const barsSelect = document.getElementById('bars-select');

    // Configurações de Mutação
    const mutationIntensity = document.getElementById('mutation-intensity');
    const mutationIntensityValue = document.getElementById('mutation-intensity-value');

    const initialState = appState.get();
    
    keySelect.value = initialState.key;
    scaleSelect.value = initialState.scale;
    bpmInput.value = initialState.bpm;
    bpmValueDisplay.textContent = initialState.bpm;
    registerSelect.value = initialState.register;
    barsSelect.value = initialState.bars;
    mutationIntensity.value = initialState.mutationIntensity;
    mutationIntensityValue.textContent = initialState.mutationIntensity + '%';

    // Listeners Base
    keySelect.addEventListener('change', (e) => appState.set({ key: e.target.value }));
    scaleSelect.addEventListener('change', (e) => appState.set({ scale: e.target.value }));
    registerSelect.addEventListener('change', (e) => appState.set({ register: e.target.value }));
    barsSelect.addEventListener('change', (e) => appState.set({ bars: parseInt(e.target.value, 10) }));

    bpmInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        bpmValueDisplay.textContent = val;
        appState.set({ bpm: val });
    });

    // Listeners de Mutação
    mutationIntensity.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        mutationIntensityValue.textContent = val + '%';
        appState.set({ mutationIntensity: val });
    });
}
