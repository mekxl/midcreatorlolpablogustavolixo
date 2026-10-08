/**
 * Gerencia ações de geração, atalhos, modais e histórico.
 */
import { appState } from '../core/state.js';
import { generateMelody } from '../melody/melodyGenerator.js';
import { mutateMelody } from '../melody/melodyMutator.js';
import { generateHarmony } from '../melody/harmonyGenerator.js';
import { generateBass } from '../melody/bassGenerator.js';
import { audioEngine } from '../audio/audioEngine.js';
import { exportToMidi } from '../midi/midiExporter.js';
import { PRNG } from '../core/utils.js';
import { StorageManager } from '../core/storageManager.js';
import { showNotification } from './notifications.js';
import { PERSONALITIES } from '../melody/personalityProfiles.js';

// Helper Global para Input de Nome
export function requestNamePrompt(title, callback) {
    const modal = document.getElementById('modal-name-input');
    const inputField = document.getElementById('name-input-field');
    document.getElementById('name-input-title').textContent = title;
    inputField.value = '';
    modal.showModal();

    const cleanup = () => { modal.close(); };
    
    document.getElementById('btn-name-cancel').onclick = cleanup;
    document.getElementById('btn-name-confirm').onclick = () => {
        const val = inputField.value.trim();
        if (val) callback(val);
        cleanup();
    };
}

export function initControls() {
    const btnGenerate = document.getElementById('btn-generate');
    const btnRegenerate = document.getElementById('btn-regenerate');
    const btnMutate = document.getElementById('btn-mutate');
    const mutationType = document.getElementById('mutation-type');
    const btnRegenHarmony = document.getElementById('btn-regen-harmony');
    
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    const btnOpenHistory = document.getElementById('btn-open-history');
    
    const btnPlay = document.getElementById('btn-play');
    const btnPause = document.getElementById('btn-pause');
    const btnStop = document.getElementById('btn-stop');
    const btnExportMidi = document.getElementById('btn-export-midi');
    
    const melodyStats = document.getElementById('melody-stats');
    const progressionDisplay = document.getElementById('progression-display');

    // UI Updates
    appState.subscribe((state) => {
        const hasMel = state.hasMelody && !state.isGenerating;
        const btnState = !hasMel;
        
        btnPlay.disabled = btnState || (state.isPlaying && !state.isPaused);
        btnPause.disabled = btnState || (!state.isPlaying || state.isPaused);
        btnStop.disabled = btnState || !state.isPlaying;
        btnExportMidi.disabled = btnState;
        btnMutate.disabled = btnState;
        btnRegenHarmony.disabled = btnState || state.harmonyMode === 'off';
        document.getElementById('btn-save-idea').disabled = btnState;
        
        btnGenerate.disabled = state.isGenerating;
        btnRegenerate.disabled = state.isGenerating;

        btnUndo.disabled = state.historyIndex <= 0;
        btnRedo.disabled = state.historyIndex >= state.history.length - 1;

        if (hasMel && state.melodyData) {
            const m = state.melodyData;
            const pName = PERSONALITIES[m.personality]?.name || m.personality;
            melodyStats.textContent = `${m.key} ${m.scale.replace('_', ' ')} | ${m.bars} Comp. | ${m.tempo} BPM | ${pName}`;
            
            if (state.harmonyMode !== 'off' && m.chords) {
                progressionDisplay.textContent = m.chords.map(c => c.roman || c.rootNote).join(' - ');
            } else {
                progressionDisplay.textContent = 'Harmonia Desligada';
            }
        }
    });

    // Ações de Geração
    const triggerGenerate = () => {
        appState.set({ isGenerating: true });
        audioEngine.stop(); 
        setTimeout(() => {
            try {
                const currentState = appState.get();
                const generatedMelody = generateMelody(currentState);
                appState.pushHistory(generatedMelody, "Geração Base");
                showNotification("Nova melodia gerada com sucesso!", "success");
            } catch (e) {
                console.error(e);
                showNotification("Erro ao gerar. Verifique as configurações.", "error");
            }
            appState.set({ isGenerating: false });
        }, 50);
    };

    btnGenerate.addEventListener('click', triggerGenerate);
    btnRegenerate.addEventListener('click', triggerGenerate);

    btnMutate.addEventListener('click', () => {
        const state = appState.get();
        if (!state.hasMelody) return;
        audioEngine.stop();
        setTimeout(() => {
            try {
                const mutatedMelody = mutateMelody(state.melodyData, mutationType.value, state.mutationIntensity);
                appState.pushHistory(mutatedMelody, `Mutação: ${mutationType.options[mutationType.selectedIndex].text}`);
                showNotification("Melodia modificada.", "info");
            } catch (e) { showNotification("Erro na mutação.", "error"); }
        }, 50);
    });

    btnRegenHarmony.addEventListener('click', () => {
        const state = appState.get();
        if (!state.hasMelody) return;
        audioEngine.stop();
        setTimeout(() => {
            const newData = JSON.parse(JSON.stringify(state.melodyData));
            newData.chords = generateHarmony(state, new PRNG(Date.now()));
            newData.bassNotes = generateBass(newData.chords, state, new PRNG(Date.now()));
            appState.pushHistory(newData, "Regenerar Harmonia");
            showNotification("Harmonia atualizada.", "info");
        }, 50);
    });

    // Histórico e Desfazer
    btnUndo.addEventListener('click', () => { audioEngine.stop(); appState.undo(); });
    btnRedo.addEventListener('click', () => { audioEngine.stop(); appState.redo(); });

    // Modais - Histórico de Sessão
    const modalHistory = document.getElementById('modal-history');
    btnOpenHistory.addEventListener('click', () => {
        const list = document.getElementById('history-list');
        list.innerHTML = '';
        const history = appState.get().history;
        history.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = `
                <div class="list-item-info">
                    <strong>Passo ${index + 1}: ${item.actionName || 'Edição'}</strong>
                    <span>${new Date(item.timestamp).toLocaleTimeString()} | ${item.notes.length} notas</span>
                </div>
                <button class="btn-control">Restaurar</button>
            `;
            div.querySelector('button').onclick = () => {
                appState.set({ melodyData: JSON.parse(JSON.stringify(item)), historyIndex: index });
                showNotification("Versão restaurada.", "success");
                modalHistory.close();
            };
            list.appendChild(div);
        });
        modalHistory.showModal();
    });
    document.getElementById('btn-close-history').onclick = () => modalHistory.close();

    // Modais - Biblioteca Local
    const modalLibrary = document.getElementById('modal-library');
    document.getElementById('btn-open-library').addEventListener('click', () => {
        const list = document.getElementById('library-list');
        list.innerHTML = '';
        const ideas = StorageManager.getIdeas();
        if (ideas.length === 0) list.innerHTML = '<p>Sua biblioteca está vazia.</p>';
        
        ideas.forEach(idea => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = `
                <div class="list-item-info">
                    <strong>${idea.name}</strong>
                    <span>Salvo em ${idea.date} | ${idea.melodyData.key} ${idea.melodyData.scale}</span>
                </div>
                <div class="list-item-actions">
                    <button class="btn-control btn-load">Carregar</button>
                    <button class="btn-control btn-delete">Excluir</button>
                </div>
            `;
            div.querySelector('.btn-load').onclick = () => {
                appState.pushHistory(idea.melodyData, `Carregou: ${idea.name}`);
                showNotification(`Ideia "${idea.name}" carregada.`, "success");
                modalLibrary.close();
            };
            div.querySelector('.btn-delete').onclick = () => {
                if(confirm("Excluir esta ideia?")) {
                    StorageManager.deleteIdea(idea.id);
                    div.remove();
                }
            };
            list.appendChild(div);
        });
        modalLibrary.showModal();
    });
    document.getElementById('btn-close-library').onclick = () => modalLibrary.close();

    document.getElementById('btn-save-idea').addEventListener('click', () => {
        requestNamePrompt("Salvar Ideia Atual:", (name) => {
            StorageManager.saveIdea(name, appState.get().melodyData);
            showNotification("Ideia salva na biblioteca.", "success");
        });
    });

    // Reprodução e Exportação
    const togglePlay = () => {
        const state = appState.get();
        if (!state.hasMelody) return;
        if (state.isPlaying && !state.isPaused) audioEngine.pause();
        else if (state.isPaused) audioEngine.resume();
        else audioEngine.play(state.melodyData);
    };

    btnPlay.addEventListener('click', togglePlay);
    btnPause.addEventListener('click', () => audioEngine.pause());
    btnStop.addEventListener('click', () => audioEngine.stop());

    btnExportMidi.addEventListener('click', () => {
        const state = appState.get();
        if (state.hasMelody && state.melodyData) {
            exportToMidi(state.melodyData, state);
            showNotification("MIDI Exportado com sucesso.", "success");
        }
    });

    // Atalhos de Teclado Globais Seguros
    document.addEventListener('keydown', (e) => {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

        if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
        
        if (e.ctrlKey) {
            if (e.code === 'KeyZ') {
                e.preventDefault();
                if (e.shiftKey) btnRedo.click();
                else btnUndo.click();
            }
            if (e.code === 'KeyY') { e.preventDefault(); btnRedo.click(); }
            if (e.code === 'Enter') { e.preventDefault(); triggerGenerate(); }
            if (e.code === 'KeyS') { 
                e.preventDefault(); 
                document.getElementById('btn-save-idea').click(); 
            }
        }
    });
}
