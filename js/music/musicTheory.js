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

    // Heurística simples: Tonalidades com bemol ou F maior costumam utilizar notação com bemóis.
    const preferFlats = rootName.includes('b') || rootName === 'F';
    const intervals = getScaleIntervals(scaleName);
    
    return intervals.map(interval => {
        return getNoteName(rootNum + interval, preferFlats);
    });
}

/**
 * Identifica o grau (1 a 7) de uma nota dentro de uma escala.
 * Retorna -1 se a nota for cromática (fora da escala).
 */
export function getNoteDegree(noteName, rootName, scaleName) {
    const keyNotes = getKeyNotes(rootName, scaleName);
    const noteNum = getNoteNumber(noteName);
    
    // Compara números cromáticos para evitar problemas de enarmonia (ex: C# vs Db)
    const index = keyNotes.findIndex(n => getNoteNumber(n) === noteNum);
    
    return index !== -1 ? index + 1 : -1;
}

/**
 * Atribui um peso heurístico de estabilidade (0.0 a 1.0) para uma nota.
 * Essencial para o algoritmo procedural decidir saltos ou finalizações de frases.
 */
export function getNoteStability(noteName, rootName, scaleName) {
    const degree = getNoteDegree(noteName, rootName, scaleName);
    
    if (degree === -1) return 0.1; // Nota cromática (Fora da escala, altíssima tensão)
    if (degree === 1) return 1.0;  // Tônica (Máxima estabilidade, repouso)
    if (degree === 5) return 0.9;  // Quinta (Estável, mas aponta para movimento)
    if (degree === 3) return 0.8;  // Terça (Define o modo, estável)
    
    // Graus 2, 4, 6, 7
    return 0.5; // Notas diatônicas de passagem (Tensão moderada)
}
