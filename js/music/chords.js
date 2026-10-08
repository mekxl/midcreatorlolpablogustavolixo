/**
 * Definições e geração de acordes e lógica de Campo Harmônico Diatônico.
 */
import { getNoteNumber, noteToMidi, getNoteName } from './notes.js';
import { getScaleIntervals } from './scales.js';

export const CHORDS = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    diminished: [0, 3, 6],
    augmented: [0, 4, 8]
};

// Qualidades diatônicas para graus (Maior e Menor Natural)
const DIATONIC_QUALITIES = {
    major: ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'],
    minor_natural: ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major']
};

const ROMAN_NUMERALS = {
    major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
    minor_natural: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']
};

export function getChordIntervals(chordType) {
    return CHORDS[chordType] || CHORDS.major;
}

export function buildChordMidi(rootMidi, chordType) {
    const intervals = getChordIntervals(chordType);
    return intervals.map(interval => rootMidi + interval);
}

/**
 * Retorna os 7 graus diatônicos de uma escala como estruturas de acorde.
 */
export function getDiatonicChords(rootName, scaleName) {
    const scaleIntervals = getScaleIntervals(scaleName);
    const rootMidi = noteToMidi(rootName, 3); // Oitava base para cálculo
    
    // Fallback: Se for pentatônica ou modo grego, mapeamos aproximadamente ou tratamos como maior/menor relativas.
    // Para simplificar, assumimos o mapeamento de major/minor como base se não mapeado explicitamente.
    let baseQualities = DIATONIC_QUALITIES[scaleName];
    let baseRomans = ROMAN_NUMERALS[scaleName];
    
    if (!baseQualities) {
        const isMinorish = scaleIntervals.includes(3);
        baseQualities = isMinorish ? DIATONIC_QUALITIES.minor_natural : DIATONIC_QUALITIES.major;
        baseRomans = isMinorish ? ROMAN_NUMERALS.minor_natural : ROMAN_NUMERALS.major;
    }

    const chords = [];
    for (let i = 0; i < 7; i++) {
        // Algumas escalas possuem < 7 notas. Paramos se exceder.
        if (i >= scaleIntervals.length) break; 
        
        const noteMidi = rootMidi + scaleIntervals[i];
        const quality = baseQualities[i];
        const notes = buildChordMidi(noteMidi, quality);
        
        chords.push({
            degree: i + 1,
            roman: baseRomans[i],
            rootMidi: noteMidi,
            rootNote: getNoteName(noteMidi),
            quality: quality,
            notes: notes
        });
    }
    return chords;
}
