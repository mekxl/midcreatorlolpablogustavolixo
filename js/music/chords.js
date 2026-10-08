/**
 * Definições e geração de acordes básicos.
 */

export const CHORDS = {
    major: [0, 4, 7],      // Fundamental, Terça Maior, Quinta Justa
    minor: [0, 3, 7],      // Fundamental, Terça Menor, Quinta Justa
    diminished: [0, 3, 6], // Fundamental, Terça Menor, Quinta Diminuta (Trítono)
    augmented: [0, 4, 8]   // Fundamental, Terça Maior, Quinta Aumentada
};

/**
 * Retorna os intervalos do tipo de acorde especificado.
 */
export function getChordIntervals(chordType) {
    return CHORDS[chordType] || CHORDS.major;
}

/**
 * Constrói um acorde retornando um array com os valores MIDI de cada nota.
 */
export function buildChordMidi(rootMidi, chordType) {
    const intervals = getChordIntervals(chordType);
    return intervals.map(interval => rootMidi + interval);
}
