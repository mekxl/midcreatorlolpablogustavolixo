/**
 * Constantes globais do sistema.
 */
export const DEFAULT_STATE = {
    personality: 'neutral',
    key: 'C',
    scale: 'minor_natural',
    bpm: 128,
    register: 'medium',
    bars: 8,
    
    harmonyMode: 'auto', 
    bassMode: 'rolling', 
    
    creativity: 50,
    repetition: 60,
    complexity: 50,
    mutationIntensity: 50,
    
    volumeSynth: 80,
    volumeBass: 50,
    synthEnabled: true,
    bassEnabled: true,
    loop: true, // Crucial para eletrônica

    isGenerating: false,
    isPlaying: false,
    isPaused: false,
    hasMelody: false,
    
    melodyData: null,
    history: [],
    historyIndex: -1
};
