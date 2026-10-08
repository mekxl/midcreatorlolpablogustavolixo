/**
 * Constantes globais do sistema.
 * Serve como referência unificada para valores padrão e limites do gerador.
 */

export const DEFAULT_STATE = {
    key: 'C',
    scale: 'major',
    bpm: 120,
    register: 'medium',
    creativity: 50,
    repetition: 50,
    complexity: 50,
    bars: 8,
    
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
    melodyData: null
};
