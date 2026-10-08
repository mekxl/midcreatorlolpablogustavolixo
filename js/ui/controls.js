/**
 * Responsável por gerenciar os botões de ação principal, controles 
 * de áudio e visualização provisória da melodia gerada.
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
    const provisionalView = document.getElementById('provisional-view');

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
            melodyStatus.textContent = "Pronto.";
        }
    });

    // Listeners do Mixer e Status
    checkLoop.addEventListener('change', (e) => appState.set({ loop: e.target.checked }));
    checkSynth.addEventListener('change', (e) => appState.set({ synthEnabled: e.target.checked }));
    volSynth.addEventListener('input', (e) => appState.set({ volumeSynth: parseInt(e.target.value, 10) }));
    checkBass.addEventListener('change', (e) => appState.set({ bassEnabled: e.target.checked }));
    volBass.addEventListener('input', (e) => appState.set({ volumeBass: parseInt(e.target.value, 10) }));

    btnGenerate.addEventListener('click', () => {
        appState.set({ isGenerating: true });
        btnGenerate.textContent = "Gerando...";
        melodyStatus.textContent = "Processando regras procedurais...";
        
        audioEngine.stop(); // Interrompe qualquer som rolando

        setTimeout(() => {
            const currentState = appState.get();
            const generatedMelody = generateMelody(currentState);
            
            appState.set({ 
                isGenerating: false, 
                hasMelody: true,
                melodyData: generatedMelody 
            });

            btnGenerate.textContent = "Gerar Melodia";
            renderProvisionalMelodyView(generatedMelody.notes, provisionalView);
        }, 100);
    });

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
}

function renderProvisionalMelodyView(notes, container) {
    if (!notes || notes.length === 0) return;

    let html = `<table class="melody-table">
        <thead>
            <tr>
                <th>Tempo</th>
                <th>Nota</th>
                <th>MIDI</th>
                <th>Duração</th>
                <th>Tipo</th>
            </tr>
        </thead>
        <tbody>`;

    notes.forEach(note => {
        if (note.isRest) {
            html += `<tr class="rest-row">
                <td>${note.startTime.toFixed(2)}</td>
                <td>Pausa</td>
                <td>-</td>
                <td>${note.duration.toFixed(2)}</td>
                <td>Pausa</td>
            </tr>`;
        } else {
            html += `<tr>
                <td>${note.startTime.toFixed(2)}</td>
                <td><strong>${note.noteName}</strong></td>
                <td>${note.midi}</td>
                <td>${note.duration.toFixed(2)}</td>
                <td>Nota</td>
            </tr>`;
        }
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
    container.style.border = "none";
    container.style.justifyContent = "flex-start";
}
