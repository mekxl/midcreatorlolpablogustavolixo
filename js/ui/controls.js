/**
 * Responsável por gerenciar as ações de geração, mutação, 
 * controles de áudio e histórico (Desfazer/Refazer).
 */
import { appState } from '../core/state.js';
import { generateMelody } from '../melody/melodyGenerator.js';
import { mutateMelody } from '../melody/melodyMutator.js';
import { audioEngine } from '../audio/audioEngine.js';
import { exportToMidi } from '../midi/midiExporter.js';

export function initControls() {
    // Botões Principais
    const btnGenerate = document.getElementById('btn-generate');
    const btnMutate = document.getElementById('btn-mutate');
    const mutationType = document.getElementById('mutation-type');
    
    // Controles de Histórico
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');

    // Controles de Reprodução e Exportação
    const btnPlay = document.getElementById('btn-play');
    const btnPause = document.getElementById('btn-pause');
    const btnStop = document.getElementById('btn-stop');
    const btnExportMidi = document.getElementById('btn-export-midi');
    const melodyStatus = document.getElementById('melody-status');

    // Mixer e Loop
    const checkLoop = document.getElementById('check-loop');
    const checkSynth = document.getElementById('check-synth');
    const volSynth = document.getElementById('vol-synth');
    const checkBass = document.getElementById('check-bass');
    const volBass = document.getElementById('vol-bass');

    appState.subscribe((state) => {
        // Habilita botões se a melodia existir
        const hasMel = state.hasMelody && !state.isGenerating;
        btnPlay.disabled = !hasMel || (state.isPlaying && !state.isPaused);
        btnPause.disabled = !hasMel || (!state.isPlaying || state.isPaused);
        btnStop.disabled = !hasMel || !state.isPlaying;
        btnExportMidi.disabled = !hasMel;
        btnMutate.disabled = !hasMel;
        
        btnGenerate.disabled = state.isGenerating;

        // Histórico visual
        btnUndo.disabled = state.historyIndex <= 0;
        btnRedo.disabled = state.historyIndex >= state.history.length - 1;

        // Feedback
        if (state.isPlaying && !state.isPaused) {
            melodyStatus.textContent = "Reproduzindo...";
        } else if (state.isPaused) {
            melodyStatus.textContent = "Reprodução pausada.";
        } else if (hasMel) {
            melodyStatus.textContent = `Melodia pronta (Passo ${state.historyIndex + 1} de ${state.history.length})`;
        }
    });

    // Mixer Binds
    checkLoop.addEventListener('change', (e) => appState.set({ loop: e.target.checked }));
    checkSynth.addEventListener('change', (e) => appState.set({ synthEnabled: e.target.checked }));
    volSynth.addEventListener('input', (e) => appState.set({ volumeSynth: parseInt(e.target.value, 10) }));
    checkBass.addEventListener('change', (e) => appState.set({ bassEnabled: e.target.checked }));
    volBass.addEventListener('input', (e) => appState.set({ volumeBass: parseInt(e.target.value, 10) }));

    // Ação: Gerar Melodia Base
    btnGenerate.addEventListener('click', () => {
        appState.set({ isGenerating: true });
        btnGenerate.textContent = "Gerando...";
        melodyStatus.textContent = "Criando estrutura inicial...";
        
        audioEngine.stop(); 

        setTimeout(() => {
            const currentState = appState.get();
            const generatedMelody = generateMelody(currentState);
            
            appState.pushHistory(generatedMelody);
            appState.set({ isGenerating: false });
            btnGenerate.textContent = "Gerar Melodia Base";
        }, 100);
    });

    // Ação: Aplicar Mutação
    btnMutate.addEventListener('click', () => {
        const state = appState.get();
        if (!state.hasMelody) return;

        audioEngine.stop();
        melodyStatus.textContent = "Aplicando mutação...";

        setTimeout(() => {
            const mutatedMelody = mutateMelody(
                state.melodyData, 
                mutationType.value, 
                state.mutationIntensity
            );
            
            appState.pushHistory(mutatedMelody);
        }, 50);
    });

    // Ações de Histórico
    btnUndo.addEventListener('click', () => {
        audioEngine.stop();
        appState.undo();
    });

    btnRedo.addEventListener('click', () => {
        audioEngine.stop();
        appState.redo();
    });

    // Ações de Reprodução
    const togglePlay = () => {
        const state = appState.get();
        if (!state.hasMelody) return;
        
        if (state.isPlaying && !state.isPaused) {
            audioEngine.pause();
        } else if (state.isPaused) {
            audioEngine.resume();
        } else {
            audioEngine.play(state.melodyData);
        }
    };

    btnPlay.addEventListener('click', () => {
        const state = appState.get();
        if (!state.hasMelody) return;
        if (state.isPaused) {
            audioEngine.resume();
        } else {
            audioEngine.play(state.melodyData);
        }
    });

    btnPause.addEventListener('click', () => audioEngine.pause());
    btnStop.addEventListener('click', () => audioEngine.stop());

    btnExportMidi.addEventListener('click', () => {
        const state = appState.get();
        if (state.hasMelody && state.melodyData) {
            exportToMidi(state.melodyData);
        }
    });

    // Atalho Global: Espaço = Play/Pause
    document.addEventListener('keydown', (e) => {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

        if (e.code === 'Space') {
            e.preventDefault(); 
            togglePlay();
        }
    });
}
