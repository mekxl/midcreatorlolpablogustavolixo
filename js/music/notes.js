/**
 * Módulo para representação e conversão de notas musicais.
 */

const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * Converte o nome de uma nota (ex: 'C#', 'Db') para seu valor cromático (0 a 11).
 */
export function getNoteNumber(noteName) {
    if (!noteName) return -1;
    const cleanName = noteName.trim().charAt(0).toUpperCase() + noteName.slice(1).toLowerCase();
    
    let index = SHARP_NAMES.indexOf(cleanName);
    if (index === -1) {
        index = FLAT_NAMES.indexOf(cleanName);
    }
    return index;
}

/**
 * Converte um valor cromático (0 a 11) para o nome da nota.
 */
export function getNoteName(noteNumber, preferFlats = false) {
    const normalized = ((noteNumber % 12) + 12) % 12; // Garante valor positivo entre 0 e 11
    return preferFlats ? FLAT_NAMES[normalized] : SHARP_NAMES[normalized];
}

/**
 * Converte um nome de nota e sua oitava em um número MIDI (ex: C4 -> 60).
 */
export function noteToMidi(noteName, octave) {
    const num = getNoteNumber(noteName);
    if (num === -1) return -1;
    // O padrão MIDI define C4 como 60. Oitava 0 começa no MIDI 12.
    return num + ((octave + 1) * 12);
}

/**
 * Converte um número MIDI em um objeto contendo o nome da nota e a oitava.
 */
export function midiToNote(midiNumber, preferFlats = false) {
    const noteName = getNoteName(midiNumber, preferFlats);
    const octave = Math.floor(midiNumber / 12) - 1;
    return { 
        note: noteName, 
        octave: octave, 
        fullName: `${noteName}${octave}` 
    };
}
