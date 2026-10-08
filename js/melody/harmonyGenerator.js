/**
 * Gerador Automático de Progressões Harmônicas baseadas na Personalidade.
 */
import { getDiatonicChords } from '../music/chords.js';
import { getPersonality } from './personalityProfiles.js';

export function generateHarmony(settings, prng) {
    if (settings.harmonyMode === 'off') return [];

    const diatonicChords = getDiatonicChords(settings.key, settings.scale);
    if (diatonicChords.length === 0) return [];

    const profile = getPersonality(settings.personality);
    const progression = [];
    let currentGlobalTime = 0.0;
    const chordsPerBar = 1; 
    const beatsPerChord = 4.0 / chordsPerBar;
    const totalChords = settings.bars * chordsPerBar;

    // Padrões de Progressão (Índices dos graus, 0 a 6)
    const patterns = {
        catchy: [[0, 4, 5, 3], [0, 5, 3, 4], [0, 3, 0, 4]], // I-V-vi-IV, etc
        dark: [[0, 5, 3, 4], [0, 2, 5, 4], [0, 3, 1, 4]],   // Minorish
        emotional: [[0, 3, 5, 4], [3, 0, 4, 5], [5, 3, 0, 4]],
        neutral: [[0, 3, 4, 0], [0, 5, 1, 4], [0, 4, 5, 3]]
    };

    let selectedPattern = patterns[settings.personality] || patterns.neutral;
    let sequence = prng.choice(selectedPattern);

    for (let i = 0; i < totalChords; i++) {
        // Experimental pode escapar do padrão aleatoriamente
        let degreeIndex;
        if (settings.personality === 'experimental' && prng.nextFloat() > 0.6) {
            degreeIndex = prng.range(0, diatonicChords.length - 1);
        } else {
            degreeIndex = sequence[i % sequence.length];
        }

        const chordData = diatonicChords[degreeIndex % diatonicChords.length];
        
        progression.push({
            ...chordData,
            startTime: currentGlobalTime,
            duration: beatsPerChord
        });
        
        currentGlobalTime += beatsPerChord;
    }

    return progression;
}

export function getActiveChord(chords, time) {
    if (!chords || chords.length === 0) return null;
    return chords.find(c => time >= c.startTime && time < c.startTime + c.duration) || null;
}
