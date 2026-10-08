/**
 * Responsável por gerenciar os botões de ação principal, controles 
 * de áudio e atalhos globais de teclado.
 */
import { appState } from '../core/state.js';
import { generateMelody } from '../melody/melodyGenerator.js';
import { audioEngine } from '../audio/audioEngine.js';
import { exportToMidi } from '../midi/midiExporter.js';

export function initControls() {
    const btnGenerate = document.getElementById('btn-generate');
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
        if (state.hasMelody) {
            btnPlay.disabled = state.isPlaying && !state.isPaused;
            btnPause.disabled = !state.isPlaying || state.isPaused;
            btnStop.disabled = !state.isPlaying;
            btnExportMidi.disabled = false;
        } else {
            btnPlay.disabled = true;
            btnPause.disabled = true;
            btnStop.disabled = true;
            btnExportMidi.disabled = true;
        }
        btnGenerate.disabled = state.isGenerating;

        // Feedback de UI sobre a reprodução
        if (state.isPlaying && !state.isPaused) {
            melodyStatus.textContent = "Reproduzindo...";
        } else if (state.isPaused) {
            melodyStatus.textContent = "Reprodução pausada.";
        } else if (state.hasMelody && !state.isGenerating) {
            melodyStatus.textContent = "Pronto para edição.";
        }
    });

    checkLoop.addEventListener('change', (e) => appState.set({ loop: e.target.checked }));
    checkSynth.addEventListener('change', (e) => appState.set({ synthEnabled: e.target.checked }));
    volSynth.addEventListener('input', (e) => appState.set({ volumeSynth: parseInt(e.target.value, 10) }));
    checkBass.addEventListener('change', (e) => appState.set({ bassEnabled: e.target.checked }));
    volBass.addEventListener('input', (e) => appState.set({ volumeBass: parseInt(e.target.value, 10) }));

    btnGenerate.addEventListener('click', () => {
        appState.set({ isGenerating: true });
        btnGenerate.textContent = "Gerando...";
        melodyStatus.textContent = "Processando regras procedurais...";
        
        audioEngine.stop(); 

        setTimeout(() => {
            const currentState = appState.get();
            const generatedMelody = generateMelody(currentState);
            
            appState.set({ 
                isGenerating: false, 
                hasMelody: true,
                melodyData: generatedMelody 
            });

            btnGenerate.textContent = "Gerar Melodia";
        }, 100);
    });

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

    btnPause.addEventListener('click', () => {
        audioEngine.pause();
    });

    btnStop.addEventListener('click', () => {
        audioEngine.stop();
    });

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
            e.preventDefault(); // Evita scroll da página
            togglePlay();
        }
    });
}
