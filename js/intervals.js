/**
 * Módulo para cálculo e nomenclatura de intervalos musicais.
 */

export const INTERVAL_NAMES = {
    0: 'Uníssono',
    1: 'Segunda menor',
    2: 'Segunda maior',
    3: 'Terça menor',
    4: 'Terça maior',
    5: 'Quarta justa',
    6: 'Trítono',
    7: 'Quinta justa',
    8: 'Sexta menor',
    9: 'Sexta maior',
    10: 'Sétima menor',
    11: 'Sétima maior',
    12: 'Oitava'
};

/**
 * Retorna a distância absoluta em semitons entre duas notas MIDI.
 */
export function getDistance(midi1, midi2) {
    return Math.abs(midi1 - midi2);
}

/**
 * Retorna o nome do intervalo com base na quantidade de semitons.
 */
export function getIntervalName(semitones) {
    const absoluteSemitones = Math.abs(semitones);
    if (absoluteSemitones > 0 && absoluteSemitones % 12 === 0) {
        return 'Oitava';
    }
    const normalized = absoluteSemitones % 12;
    return INTERVAL_NAMES[normalized] || 'Desconhecido';
}
