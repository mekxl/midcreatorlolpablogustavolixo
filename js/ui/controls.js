/**
 * Responsável por gerenciar os botões de ação principal:
 * Geração, Play, Stop e Exportação.
 */
import { appState } from '../core/state.js';

export function initControls() {
    const btnGenerate = document.getElementById('btn-generate');
    const btnPlay = document.getElementById('btn-play');
    const btnStop = document.getElementById('btn-stop');
    const btnExportMidi = document.getElementById('btn-export-midi');
    const melodyStatus = document.getElementById('melody-status');

    // Inscreve a UI nos eventos de mudança de estado para ativar/desativar botões
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

    // Ação do Botão Gerar (Placeholder para o fluxo futuro)
    btnGenerate.addEventListener('click', () => {
        appState.set({ isGenerating: true });
        
        btnGenerate.textContent = "Gerando...";
        melodyStatus.textContent = "Processando parâmetros musicais...";

        // Simula o tempo de geração de uma melodia
        setTimeout(() => {
            const currentState = appState.get();
            
            // Aqui futuramente chamaremos o melodyGenerator.js
            
            appState.set({ 
                isGenerating: false, 
                hasMelody: true,
                // Simulando payload de dados da melodia gerada
                melodyData: { notas: [], compassos: currentState.bars } 
            });

            btnGenerate.textContent = "Gerar Melodia";
            melodyStatus.textContent = `Melodia gerada com sucesso! (${currentState.bars} compassos em ${currentState.key} ${currentState.scale})`;
        }, 800);
    });

    // Ação de Play
    btnPlay.addEventListener('click', () => {
        if (!appState.get().hasMelody) return;
        
        appState.set({ isPlaying: true });
        melodyStatus.textContent = "Reproduzindo...";
        
        // Simulação: Pára automaticamente após 3 segundos
        // Futuramente isso será controlado pelo audioEngine.js
        setTimeout(() => {
            if (appState.get().isPlaying) {
                appState.set({ isPlaying: false });
                melodyStatus.textContent = "Reprodução finalizada.";
            }
        }, 3000);
    });

    // Ação de Stop
    btnStop.addEventListener('click', () => {
        appState.set({ isPlaying: false });
        melodyStatus.textContent = "Reprodução interrompida.";
    });

    // Ação de Exportar
    btnExportMidi.addEventListener('click', () => {
        alert("Sistema de exportação MIDI será implementado em breve.");
    });
}
