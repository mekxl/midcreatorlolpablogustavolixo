/**
 * Gerencia ações de geração, regeneração de harmonia e controles gerais.
 */
import { appState } from '../core/state.js';
import { generateMelody } from '../melody/melodyGenerator.js';
import { mutateMelody } from '../melody/melodyMutator.js';
import { generateHarmony } from '../melody/harmonyGenerator.js';
import { generateBass } from '../melody/bassGenerator.js';
import { audioEngine } from '../audio/audioEngine.js';
import { exportToMidi } from '../midi/midiExporter.js';
import { PRNG } from '../core/utils.js';

export function initControls() {
    const btnGenerate = document.getElementById('btn-generate');
    const btnMutate = document.getElementById('btn-mutate');
    const mutationType = document.getElementById('mutation-type');
    const btnRegenHarmony = document.getElementById('btn-regen-harmony');
    
    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');

    const btnPlay = document.getElementById('btn-play');
    const btnPause = document.getElementById('btn-pause');
    const btnStop = document.getElementById('btn-stop');
    const btnExportMidi = document.getElementById('btn-export-midi');
    const melodyStatus = document.getElementById('melody-status');
    const progressionDisplay = document.getElementById('progression-display');

    const checkLoop = document.getElementById('check-loop');
    const checkSynth = document.getElementById('check-synth');
    const volSynth = document.getElementById('vol-synth');
    const checkBass = document.getElementById('check-bass');
    const volBass = document.getElementById('vol-bass');

    appState.subscribe((state) => {
        const hasMel = state.hasMelody && !state.isGenerating;
        btnPlay.disabled = !hasMel || (state.isPlaying && !state.isPaused);
        btnPause.disabled = !hasMel || (!state.isPlaying || state.isPaused);
        btnStop.disabled = !hasMel || !state.isPlaying;
        btnExportMidi.disabled = !hasMel;
        btnMutate.disabled = !hasMel;
        
        btnRegenHarmony.disabled = !hasMel || state.harmonyMode === 'off';
        btnGenerate.disabled = state.isGenerating;

        btnUndo.disabled = state.historyIndex <= 0;
        btnRedo.disabled = state.historyIndex >= state.history.length - 1;

        if (state.isPlaying && !state.isPaused) {
            melodyStatus.textContent = "Reproduzindo...";
        } else if (state.isPaused) {
            melodyStatus.textContent = "Reprodução pausada.";
        } else if (hasMel) {
            melodyStatus.textContent = `Melodia pronta (Passo ${state.historyIndex + 1} de ${state.history.length})`;
        }

        if (hasMel && state.melodyData.chords && state.harmonyMode !== 'off') {
            const progStr = state.melodyData.chords.map(c => c.roman || c.rootNote).join(' - ');
            progressionDisplay.textContent = progStr || '-';
        } else {
            progressionDisplay.textContent = 'Harmonia Desligada';
        }
    });

    checkLoop.addEventListener('change', (e) => appState.set({ loop: e.target.checked }));
    checkSynth.addEventListener('change', (e) => appState.set({ synthEnabled: e.target.checked }));
    volSynth.addEventListener('input', (e) => appState.set({ volumeSynth: parseInt(e.target.value, 10) }));
    checkBass.addEventListener('change', (e) => appState.set({ bassEnabled: e.target.checked }));
    volBass.addEventListener('input', (e) => appState.set({ volumeBass: parseInt(e.target.value, 10) }));

    btnGenerate.addEventListener('click', () => {
        appState.set({ isGenerating: true });
        audioEngine.stop(); 

        setTimeout(() => {
            const currentState = appState.get();
            const generatedMelody = generateMelody(currentState);
            
            appState.pushHistory(generatedMelody);
            appState.set({ isGenerating: false });
        }, 100);
    });

    btnRegenHarmony.addEventListener('click', () => {
        const state = appState.get();
        if (!state.hasMelody) return;
        audioEngine.stop();

        setTimeout(() => {
            const newData = JSON.parse(JSON.stringify(state.melodyData));
            const prng = new PRNG(Date.now());
            
            newData.chords = generateHarmony(state, prng);
            newData.bassNotes = generateBass(newData.chords, state, prng);
            
            appState.pushHistory(newData);
        }, 50);
    });

    btnMutate.addEventListener('click', () => {
        const state = appState.get();
        if (!state.hasMelody) return;
        audioEngine.stop();

        setTimeout(() => {
            const mutatedMelody = mutateMelody(state.melodyData, mutationType.value, state.mutationIntensity);
            appState.pushHistory(mutatedMelody);
        }, 50);
    });

    btnUndo.addEventListener('click', () => { audioEngine.stop(); appState.undo(); });
    btnRedo.addEventListener('click', () => { audioEngine.stop(); appState.redo(); });

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
        }
    });

    document.addEventListener('keydown', (e) => {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
        if (e.code === 'Space') {
            e.preventDefault(); 
            togglePlay();
        }
    });
}
