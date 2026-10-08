/**
 * Constantes globais do sistema.
 */
export const DEFAULT_STATE = {
    personality: 'neutral',
    key: 'C',
    scale: 'major',
    bpm: 120,
    register: 'medium',
    bars: 8,
    
    harmonyMode: 'off', 
    bassMode: 'off', 
    
    creativity: 50,
    repetition: 50,
    complexity: 50,
    mutationIntensity: 50,
    
    volumeSynth: 80,
    volumeBass: 40,
    synthEnabled: true,
    bassEnabled: true,
    loop: false,

    isGenerating: false,
    isPlaying: false,
    isPaused: false,
    hasMelody: false,
    
    melodyData: null,
    history: [],
    historyIndex: -1
};
