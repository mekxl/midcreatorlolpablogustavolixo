/**
 * Converte ritmos gerados em notas MIDI, aplicando as regras de teoria musical
 * (movimento, registro, saltos e estabilidade).
 */
import { getScaleMidiPool } from '../music/musicTheory.js';
import { midiToNote } from '../music/notes.js';

/**
 * Gera uma frase musical (sequência de notas) para um ritmo dado.
 */
export function generatePhrase(rhythmPattern, settings, prng, isResolution = false, lastMidiIndex = null) {
    // Define os limites de oitava com base no registro
    let minOct = 4, maxOct = 5;
    if (settings.register === 'low') { minOct = 2; maxOct = 3; }
    if (settings.register === 'high') { minOct = 5; maxOct = 6; }

    const pool = getScaleMidiPool(settings.key, settings.scale, minOct, maxOct);
    if (pool.length === 0) return [];

    let phrase = [];
    
    // Escolhe nota inicial (idealmente tônica ou dominante no meio do registro)
    let currentIndex = lastMidiIndex;
    if (currentIndex === null) {
        currentIndex = Math.floor(pool.length / 2);
    }

    const { creativity } = settings;

    rhythmPattern.forEach((rhythmicEvent, i) => {
        if (rhythmicEvent.isRest) {
            phrase.push({ ...rhythmicEvent, midi: null, noteName: 'Pausa' });
            return;
        }

        // Se for a última nota de uma frase de resolução, força repouso na tônica mais próxima
        const isLastNote = i === rhythmPattern.length - 1;
        if (isResolution && isLastNote) {
            // Simplificação: força o retorno para um ponto central estável
            currentIndex = Math.floor(pool.length / 2);
        } else {
            // Lógica de direção melódica baseada na criatividade
            // Saltos (leaps) vs Movimentos Conjuntos (steps)
            const stepWeights = [
                Math.max(10, 100 - creativity), // Repetir nota
                60,                             // +1 grau
                60,                             // -1 grau
                creativity * 0.5,               // +2 graus (Salto de terça)
                creativity * 0.5,               // -2 graus
                creativity * 0.2                // Salto maior
            ];
            const stepOptions = [0, 1, -1, 2, -2, prng.choice([3, -3, 4, -4])];

            const step = prng.weightedChoice(stepOptions, stepWeights);
            currentIndex += step;

            // Mantém dentro dos limites do pool do registro
            if (currentIndex < 0) currentIndex = 0;
            if (currentIndex >= pool.length) currentIndex = pool.length - 1;
        }

        const midiValue = pool[currentIndex];
        const noteInfo = midiToNote(midiValue);

        phrase.push({
            midi: midiValue,
            noteName: noteInfo.fullName,
            octave: noteInfo.octave,
            duration: rhythmicEvent.duration,
            isRest: false,
            velocity: 80 + prng.range(-10, 20) // Dinâmica levemente humana
        });
    });

    return { phraseData: phrase, lastIndex: currentIndex };
}
