/**
 * Constantes globais do sistema.
 * Serve como referência unificada para valores padrão e limites do gerador.
 */

export const DEFAULT_STATE = {
    key: 'C',
    scale: 'major',
    bpm: 120,
    register: 'medium',
    bars: 8,
    
    // Parâmetros de Mutação
    mutationIntensity: 50,
    
    // Controles de Áudio
    volumeSynth: 80,
    volumeBass: 40,
    synthEnabled: true,
    bassEnabled: true,
    loop: false,

    // Status de Execução
    isGenerating: false,
    isPlaying: false,
    isPaused: false,
    hasMelody: false,
    
    // Dados Musicais e Histórico
    melodyData: null,
    history: [],
    historyIndex: -1
};
