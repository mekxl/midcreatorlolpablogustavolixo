/**
 * Dicionário centralizado de escalas representadas por intervalos em semitons.
 */

export const SCALES = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor_natural: [0, 2, 3, 5, 7, 8, 10],
    minor_harmonic: [0, 2, 3, 5, 7, 8, 11],
    minor_melodic: [0, 2, 3, 5, 7, 9, 11],
    pentatonic_major: [0, 2, 4, 7, 9],
    pentatonic_minor: [0, 3, 5, 7, 10],
    blues: [0, 3, 5, 6, 7, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    aeolian: [0, 2, 3, 5, 7, 8, 10],
    locrian: [0, 1, 3, 5, 6, 8, 10]
};

/**
 * Retorna os intervalos em semitons para a escala solicitada.
 * Caso a escala não exista, retorna a escala maior por padrão.
 */
export function getScaleIntervals(scaleName) {
    return SCALES[scaleName] || SCALES.major;
}
