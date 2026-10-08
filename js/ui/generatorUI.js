/**
 * Binds de UI, Sincronização Dinâmica e Presets.
 */
import { appState } from '../core/state.js';
import { PERSONALITIES } from '../melody/personalityProfiles.js';
import { StorageManager } from '../core/storageManager.js';
import { showNotification } from './notifications.js';
import { requestNamePrompt } from './controls.js'; // Helper importado para o modal de nome

export function initGeneratorUI() {
    const uiElements = {
        personality: document.getElementById('personality-select'),
        key: document.getElementById('key-select'),
        scale: document.getElementById('scale-select'),
        bpm: document.getElementById('bpm-input'),
        bpmVal: document.getElementById('bpm-value'),
        register: document.getElementById('register-select'),
        bars: document.getElementById('bars-select'),
        harmonyMode: document.getElementById('harmony-mode'),
        bassMode: document.getElementById('bass-mode'),
        creativity: document.getElementById('creativity-input'),
        creativityVal: document.getElementById('creativity-value'),
        repetition: document.getElementById('repetition-input'),
        repetitionVal: document.getElementById('repetition-value'),
        complexity: document.getElementById('complexity-input'),
        complexityVal: document.getElementById('complexity-value'),
        presetSelect: document.getElementById('preset-select')
    };

    // Sincroniza a UI quando o estado for alterado programaticamente (Ex: Carregou Preset)
    appState.subscribe(state => {
        uiElements.personality.value = state.personality;
        document.getElementById('personality-desc').textContent = PERSONALITIES[state.personality].description;
        uiElements.key.value = state.key;
        uiElements.scale.value = state.scale;
        uiElements.register.value = state.register;
        uiElements.bars.value = state.bars;
        uiElements.harmonyMode.value = state.harmonyMode;
        uiElements.bassMode.value = state.bassMode;

        uiElements.bpm.value = state.bpm;
        uiElements.bpmVal.textContent = state.bpm;
        uiElements.creativity.value = state.creativity;
        uiElements.creativityVal.textContent = state.creativity;
        uiElements.repetition.value = state.repetition;
        uiElements.repetitionVal.textContent = state.repetition;
        uiElements.complexity.value = state.complexity;
        uiElements.complexityVal.textContent = state.complexity;
    });

    // Event Listeners Base
    uiElements.personality.addEventListener('change', e => appState.set({ personality: e.target.value }));
    uiElements.key.addEventListener('change', e => appState.set({ key: e.target.value }));
    uiElements.scale.addEventListener('change', e => appState.set({ scale: e.target.value }));
    uiElements.register.addEventListener('change', e => appState.set({ register: e.target.value }));
    uiElements.bars.addEventListener('change', e => appState.set({ bars: parseInt(e.target.value, 10) }));
    uiElements.harmonyMode.addEventListener('change', e => appState.set({ harmonyMode: e.target.value }));
    uiElements.bassMode.addEventListener('change', e => appState.set({ bassMode: e.target.value }));

    uiElements.bpm.addEventListener('input', e => appState.set({ bpm: parseInt(e.target.value, 10) }));
    uiElements.creativity.addEventListener('input', e => appState.set({ creativity: parseInt(e.target.value, 10) }));
    uiElements.repetition.addEventListener('input', e => appState.set({ repetition: parseInt(e.target.value, 10) }));
    uiElements.complexity.addEventListener('input', e => appState.set({ complexity: parseInt(e.target.value, 10) }));

    const mutationIntensity = document.getElementById('mutation-intensity');
    mutationIntensity.addEventListener('input', e => {
        document.getElementById('mutation-intensity-value').textContent = e.target.value;
        appState.set({ mutationIntensity: parseInt(e.target.value, 10) });
    });

    // Lógica de Presets
    const loadPresetsUI = () => {
        const presets = StorageManager.getPresets();
        uiElements.presetSelect.innerHTML = '<option value="" disabled selected>Carregar preset...</option>';
        presets.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.name;
            uiElements.presetSelect.appendChild(opt);
        });
    };

    uiElements.presetSelect.addEventListener('change', e => {
        const presets = StorageManager.getPresets();
        const selected = presets.find(p => p.id === e.target.value);
        if (selected) {
            appState.set(selected.settings);
            showNotification(`Preset "${selected.name}" carregado.`, 'success');
        }
        uiElements.presetSelect.value = ""; // Reseta seleção para agir como botão
    });

    document.getElementById('btn-save-preset').addEventListener('click', () => {
        requestNamePrompt("Nome do Novo Preset:", (name) => {
            StorageManager.savePreset(name, appState.get());
            loadPresetsUI();
            showNotification("Preset salvo com sucesso.", "success");
        });
    });

    document.getElementById('btn-delete-preset').addEventListener('click', () => {
        // Exclui o último selecionado se existir, requer interface robusta, 
        // Simplificação: prompt native para ID ou construir modal avançado. 
        // Vamos usar um confirm simples baseado no valor atual? Como o select reseta, não há valor atual.
        showNotification("Para manter a fluidez, a edição de presets será feita pela Biblioteca.", "info");
    });

    loadPresetsUI();
}
