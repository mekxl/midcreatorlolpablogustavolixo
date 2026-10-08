/**
 * Responsável por gerenciar os botões de ação principal e a 
 * visualização provisória da melodia gerada.
 */
import { appState } from '../core/state.js';
import { generateMelody } from '../melody/melodyGenerator.js';

export function initControls() {
    const btnGenerate = document.getElementById('btn-generate');
    const btnPlay = document.getElementById('btn-play');
    const btnStop = document.getElementById('btn-stop');
    const btnExportMidi = document.getElementById('btn-export-midi');
    const melodyStatus = document.getElementById('melody-status');
    const provisionalView = document.getElementById('provisional-view');

    appState.subscribe((state) => {
        if (state.hasMelody) {
            btnPlay.disabled = state.isPlaying;
            btnStop.disabled = !state.isPlaying;
            btnExportMidi.disabled = false;
        } else {
            btnPlay.disabled = true;
            btnStop.disabled = true;
            btnExportMidi.disabled = true;
        }
        btnGenerate.disabled = state.isGenerating || state.isPlaying;
    });

    btnGenerate.addEventListener('click', () => {
        appState.set({ isGenerating: true });
        btnGenerate.textContent = "Gerando...";
        melodyStatus.textContent = "Processando regras procedurais...";

        setTimeout(() => {
            const currentState = appState.get();
            
            // Invoca o motor de geração de melodias
            const generatedMelody = generateMelody(currentState);
            
            appState.set({ 
                isGenerating: false, 
                hasMelody: true,
                melodyData: generatedMelody 
            });

            btnGenerate.textContent = "Gerar Melodia";
            melodyStatus.textContent = `Melodia gerada com sucesso! (${generatedMelody.notes.length} eventos em ${currentState.key} ${currentState.scale})`;
            
            renderProvisionalMelodyView(generatedMelody.notes, provisionalView);
        }, 300);
    });

    btnPlay.addEventListener('click', () => {
        if (!appState.get().hasMelody) return;
        appState.set({ isPlaying: true });
        melodyStatus.textContent = "Reproduzindo... (Áudio será implementado em breve)";
        
        setTimeout(() => {
            if (appState.get().isPlaying) {
                appState.set({ isPlaying: false });
                melodyStatus.textContent = "Pronto.";
            }
        }, 2000);
    });

    btnStop.addEventListener('click', () => {
        appState.set({ isPlaying: false });
        melodyStatus.textContent = "Reprodução interrompida.";
    });

    btnExportMidi.addEventListener('click', () => {
        alert("Sistema de exportação MIDI será implementado no próximo passo.");
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
    
    // Altera estilos em linha para adaptar o scroll da tabela
    container.style.border = "none";
    container.style.justifyContent = "flex-start";
}
