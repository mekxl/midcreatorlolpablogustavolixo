/**
 * Gerenciador de Persistência Local (LocalStorage).
 * Manipula Presets de configurações e Biblioteca de Ideias (melodias).
 */
import { DEFAULT_STATE } from './constants.js';

export const StorageManager = {
    PRESETS_KEY: 'melody_lab_presets_v1',
    IDEAS_KEY: 'melody_lab_ideas_v1',

    getPresets() {
        try {
            const data = localStorage.getItem(this.PRESETS_KEY);
            if (data) return JSON.parse(data);
        } catch (e) { console.error("Erro ao ler presets", e); }
        return this.getDefaultPresets();
    },

    savePreset(name, currentState) {
        const presets = this.getPresets();
        const settingsToSave = {
            personality: currentState.personality,
            key: currentState.key,
            scale: currentState.scale,
            bpm: currentState.bpm,
            register: currentState.register,
            bars: currentState.bars,
            harmonyMode: currentState.harmonyMode,
            bassMode: currentState.bassMode,
            creativity: currentState.creativity,
            repetition: currentState.repetition,
            complexity: currentState.complexity
        };
        presets.push({ id: Date.now().toString(), name, settings: settingsToSave });
        localStorage.setItem(this.PRESETS_KEY, JSON.stringify(presets));
    },

    deletePreset(id) {
        // Impede deletar presets padrão (IDs pequenos ou numéricos fixos)
        if (id.startsWith('default_')) return false;
        let presets = this.getPresets().filter(p => p.id !== id);
        localStorage.setItem(this.PRESETS_KEY, JSON.stringify(presets));
        return true;
    },

    getDefaultPresets() {
        return [
            { id: 'default_1', name: 'Melodia Catchy', settings: { ...DEFAULT_STATE, personality: 'catchy', key: 'C', scale: 'major', bpm: 128, bars: 8, creativity: 40, repetition: 80, complexity: 50, harmonyMode: 'auto', bassMode: 'bassline' } },
            { id: 'default_2', name: 'Dark Cinemática', settings: { ...DEFAULT_STATE, personality: 'cinematic', key: 'D', scale: 'minor_natural', bpm: 90, register: 'low', bars: 16, creativity: 70, repetition: 40, complexity: 60, harmonyMode: 'auto', bassMode: 'fundamental' } },
            { id: 'default_3', name: 'Minimalista', settings: { ...DEFAULT_STATE, personality: 'minimalist', key: 'A', scale: 'dorian', bpm: 110, bars: 8, creativity: 30, repetition: 90, complexity: 20, harmonyMode: 'off', bassMode: 'off' } },
            { id: 'default_4', name: 'Alta Energia', settings: { ...DEFAULT_STATE, personality: 'energetic', key: 'E', scale: 'minor_natural', bpm: 140, bars: 8, creativity: 60, repetition: 50, complexity: 80, harmonyMode: 'auto', bassMode: 'fundamental_fifth' } }
        ];
    },

    getIdeas() {
        try {
            const data = localStorage.getItem(this.IDEAS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    },

    saveIdea(name, melodyData) {
        const ideas = this.getIdeas();
        ideas.push({
            id: Date.now().toString(),
            name,
            date: new Date().toLocaleString(),
            melodyData: JSON.parse(JSON.stringify(melodyData))
        });
        localStorage.setItem(this.IDEAS_KEY, JSON.stringify(ideas));
    },

    deleteIdea(id) {
        let ideas = this.getIdeas().filter(i => i.id !== id);
        localStorage.setItem(this.IDEAS_KEY, JSON.stringify(ideas));
    }
};
