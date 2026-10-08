/**
 * Gerenciador de Persistência Local (LocalStorage).
 * Contém presets focados em música eletrônica.
 */
import { DEFAULT_STATE } from './constants.js';

export const StorageManager = {
    PRESETS_KEY: 'melody_lab_presets_v2',
    IDEAS_KEY: 'melody_lab_ideas_v2',

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
        if (id.startsWith('default_')) return false;
        let presets = this.getPresets().filter(p => p.id !== id);
        localStorage.setItem(this.PRESETS_KEY, JSON.stringify(presets));
        return true;
    },

    getDefaultPresets() {
        return [
            { id: 'default_1', name: 'EDM Hook (Catchy)', settings: { ...DEFAULT_STATE, personality: 'catchy', key: 'F', scale: 'major', bpm: 128, bars: 4, creativity: 30, repetition: 85, complexity: 40, harmonyMode: 'auto', bassMode: 'offbeat' } },
            { id: 'default_2', name: 'Dark Synthwave', settings: { ...DEFAULT_STATE, personality: 'dark', key: 'E', scale: 'minor_natural', bpm: 105, register: 'low', bars: 8, creativity: 50, repetition: 60, complexity: 50, harmonyMode: 'auto', bassMode: 'rolling' } },
            { id: 'default_3', name: 'Melodic Techno', settings: { ...DEFAULT_STATE, personality: 'cinematic', key: 'D', scale: 'dorian', bpm: 124, bars: 16, creativity: 40, repetition: 70, complexity: 60, harmonyMode: 'auto', bassMode: 'rolling' } },
            { id: 'default_4', name: 'Progressive Trance', settings: { ...DEFAULT_STATE, personality: 'energetic', key: 'A', scale: 'minor_natural', bpm: 138, bars: 8, creativity: 60, repetition: 50, complexity: 80, harmonyMode: 'auto', bassMode: 'rolling' } },
            { id: 'default_5', name: 'Deep House / Minimal', settings: { ...DEFAULT_STATE, personality: 'minimalist', key: 'G', scale: 'minor_natural', bpm: 122, bars: 4, creativity: 30, repetition: 90, complexity: 30, harmonyMode: 'off', bassMode: 'bassline' } }
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
