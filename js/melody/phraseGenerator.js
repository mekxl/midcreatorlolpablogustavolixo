/**
 * Converte ritmos gerados em notas MIDI, aplicando regras de teoria musical,
 * limites de criatividade e heurísticas de personalidades (direção, saltos, tensão).
 */
import { getScaleMidiPool, getNoteStability } from '../music/musicTheory.js';
import { midiToNote } from '../music/notes.js';
import { getPersonality } from './personalityProfiles.js';

export function generatePhrase(rhythmPattern, settings, prng, isResolution = false, lastMidiIndex = null) {
    const profile = getPersonality(settings.personality);
    
    let minOct = 4, maxOct = 5;
    if (settings.register === 'low') { minOct = 2; maxOct = 3; }
    if (settings.register === 'high') { minOct = 5; maxOct = 6; }

    const pool = getScaleMidiPool(settings.key, settings.scale, minOct, maxOct);
    if (pool.length === 0) return [];

    let phrase = [];
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

        const isLastNote = i === rhythmPattern.length - 1;
        
        if (isResolution && isLastNote) {
            // Busca a nota mais estável próxima para um repouso forte
            let bestCandidate = currentIndex;
            let maxStab = -1;
            for (let step = -4; step <= 4; step++) {
                const targetIndex = currentIndex + step;
                if (targetIndex >= 0 && targetIndex < pool.length) {
                    const midi = pool[targetIndex];
                    const stab = getNoteStability(midiToNote(midi).fullName, settings.key, settings.scale);
                    if (stab > maxStab) {
                        maxStab = stab;
                        bestCandidate = targetIndex;
                    }
                }
            }
            currentIndex = bestCandidate;
        } else {
            // Lógica Ponderada de Seleção de Notas baseada em Vieses da Personalidade
            const candidates = [];
            const maxJump = Math.floor((creativity / 100) * 10) * profile.biases.leap;

            for (let step = -10; step <= 10; step++) {
                const targetIndex = currentIndex + step;
                if (targetIndex >= 0 && targetIndex < pool.length) {
                    const midi = pool[targetIndex];
                    const noteInfo = midiToNote(midi);
                    const stability = getNoteStability(noteInfo.fullName, settings.key, settings.scale);

                    let weight = 100;
                    const absStep = Math.abs(step);

                    // 1. Pesos Base Intervalares
                    if (absStep === 0) {
                        weight = Math.max(10, 100 - creativity);
                    } else if (absStep <= 2) {
                        weight = 60 * profile.biases.step;
                    } else {
                        if (absStep > maxJump && creativity < 80) weight = 0; // Proteção contra saltos excessivos
                        else weight = (creativity * 0.5) * profile.biases.leap;
                    }

                    if (weight > 0) {
                        // 2. Viés de Direção Melódica (Ex: Dark favorece descer)
                        if (step > 0 && profile.biases.direction > 0) weight *= (1 + profile.biases.direction);
                        if (step < 0 && profile.biases.direction < 0) weight *= (1 + Math.abs(profile.biases.direction));

                        // 3. Viés de Tensão
                        if (profile.biases.tension > 1) {
                            // Favorece instabilidade
                            weight *= (1.0 + (1.0 - stability) * (profile.biases.tension - 1));
                        } else {
                            // Favorece estabilidade
                            weight *= (1.0 + stability * (1 - profile.biases.tension));
                        }

                        candidates.push({ index: targetIndex, weight: Math.max(1, weight) });
                    }
                }
            }

            if (candidates.length > 0) {
                const indices = candidates.map(c => c.index);
                const weights = candidates.map(c => c.weight);
                currentIndex = prng.weightedChoice(indices, weights);
            }
        }

        const midiValue = pool[currentIndex];
        const noteInfo = midiToNote(midiValue);

        phrase.push({
            midi: midiValue,
            noteName: noteInfo.fullName,
            octave: noteInfo.octave,
            duration: rhythmicEvent.duration,
            isRest: false,
            velocity: 80 + prng.range(-10, 20)
        });
    });

    return { phraseData: phrase, lastIndex: currentIndex };
}
