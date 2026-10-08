/**
 * Ponto central da lógica musical. Fornece análise de estabilidade,
 * relação de graus e processamento heurístico para o gerador.
 */
import { getNoteNumber, getNoteName } from './notes.js';
import { getScaleIntervals } from './scales.js';

/**
 * Retorna um array com os nomes das notas pertencentes à tonalidade e escala informadas.
 */
export function getKeyNotes(rootName, scaleName) {
    const rootNum = getNoteNumber(rootName);
    if (rootNum === -1) return [];

    const preferFlats = rootName.includes('b') || rootName === 'F';
    const intervals = getScaleIntervals(scaleName);
    
    return intervals.map(interval => {
        return getNoteName(rootNum + interval, preferFlats);
    });
}

/**
 * Retorna uma "piscina" de todos os números MIDI válidos para a escala 
 * dentro de um intervalo de oitavas. Usado para navegação melódica segura.
 */
export function getScaleMidiPool(rootName, scaleName, minOctave = 3, maxOctave = 5) {
    const intervals = getScaleIntervals(scaleName);
    const rootNum = getNoteNumber(rootName);
    let pool = [];
    
    for (let oct = minOctave; oct <= maxOctave; oct++) {
        // C4 = 60. rootNum(0=C) + ((4+1)*12) = 60
        const rootMidi = rootNum + ((oct + 1) * 12);
        intervals.forEach(interval => {
            const noteMidi = rootMidi + interval;
            if (noteMidi >= 0 && noteMidi <= 127) {
                pool.push(noteMidi);
            }
        });
    }
    // Remove duplicatas e ordena
    return [...new Set(pool)].sort((a, b) => a - b);
}

/**
 * Identifica o grau (1 a 7) de uma nota dentro de uma escala.
 * Retorna -1 se a nota for cromática (fora da escala).
 */
export function getNoteDegree(noteName, rootName, scaleName) {
    const keyNotes = getKeyNotes(rootName, scaleName);
    const noteNum = getNoteNumber(noteName);
    
    const index = keyNotes.findIndex(n => getNoteNumber(n) === noteNum);
    return index !== -1 ? index + 1 : -1;
}

/**
 * Atribui um peso heurístico de estabilidade (0.0 a 1.0) para uma nota.
 * Essencial para o algoritmo procedural decidir saltos ou finalizações de frases.
 */
export function getNoteStability(noteName, rootName, scaleName) {
    const degree = getNoteDegree(noteName, rootName, scaleName);
    
    if (degree === -1) return 0.1;
    if (degree === 1) return 1.0;
    if (degree === 5) return 0.9;
    if (degree === 3) return 0.8;
    return 0.5;
}
