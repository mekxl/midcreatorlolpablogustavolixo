/**
 * Motor heurístico que gera sequências de notas conscientes dos Acordes (Chord-Aware).
 */
import { getScaleMidiPool, getNoteStability } from '../music/musicTheory.js';
import { midiToNote } from '../music/notes.js';
import { getPersonality } from './personalityProfiles.js';
import { getActiveChord } from './harmonyGenerator.js';

export function generatePhrase(rhythmPattern, settings, prng, isResolution = false, lastMidiIndex = null, generatedChords = []) {
    const profile = getPersonality(settings.personality);
    
    let minOct = 4, maxOct = 5;
    if (settings.register === 'low') { minOct = 2; maxOct = 3; }
    if (settings.register === 'high') { minOct = 5; maxOct = 6; }

    const pool = getScaleMidiPool(settings.key, settings.scale, minOct, maxOct);
    if (pool.length === 0) return [];

    let phrase = [];
    let currentIndex = lastMidiIndex;
    if (currentIndex === null) currentIndex = Math.floor(pool.length / 2);

    const { creativity } = settings;
    let currentGlobalTime = rhythmPattern.length > 0 ? rhythmPattern[0]._tempStartTime : 0; // Marcador temporal seguro

    rhythmPattern.forEach((rhythmicEvent, i) => {
        if (rhythmicEvent.isRest) {
            phrase.push({ ...rhythmicEvent, midi: null, noteName: 'Pausa' });
            currentGlobalTime += rhythmicEvent.duration;
            return;
        }

        const isLastNote = i === rhythmPattern.length - 1;
        const currentChord = getActiveChord(generatedChords, currentGlobalTime);
        
        if (isResolution && isLastNote && currentChord) {
            // Tenta forçar a fundamental do acorde atual se for resolução
            let rootInPool = pool.findIndex(m => m % 12 === currentChord.rootMidi % 12);
            if (rootInPool !== -1) currentIndex = rootInPool;
        } 
        else {
            const candidates = [];
            const maxJump = Math.floor((creativity / 100) * 10) * profile.biases.leap;

            for (let step = -10; step <= 10; step++) {
                const targetIndex = currentIndex + step;
                if (targetIndex >= 0 && targetIndex < pool.length) {
                    const midi = pool[targetIndex];
                    const noteInfo = midiToNote(midi);
                    let stability = getNoteStability(noteInfo.fullName, settings.key, settings.scale);
                    let weight = 100;
                    const absStep = Math.abs(step);

                    // 1. Pesos Intervalares Base
                    if (absStep === 0) weight = Math.max(10, 100 - creativity);
                    else if (absStep <= 2) weight = 60 * profile.biases.step;
                    else {
                        if (absStep > maxJump && creativity < 80) weight = 0; 
                        else weight = (creativity * 0.5) * profile.biases.leap;
                    }

                    if (weight > 0) {
                        // 2. CHORD-AWARENESS (Relação com a Harmonia)
                        if (currentChord && settings.harmonyMode !== 'off') {
                            const noteClass = midi % 12;
                            const isRoot = noteClass === (currentChord.rootMidi % 12);
                            const isChordTone = currentChord.notes.some(n => n % 12 === noteClass);
                            
                            if (isRoot) weight *= 2.5;         // Atração magnética para a fundamental do acorde
                            else if (isChordTone) weight *= 1.8; // Forte atração para terças e quintas do acorde
                            else weight *= 0.5;                // Notas diatônicas fora do acorde funcionam como passagem
                        } else {
                            // Se não há acorde, depende apenas da estabilidade da tonalidade
                            if (profile.biases.tension > 1) weight *= (1.0 + (1.0 - stability) * (profile.biases.tension - 1));
                            else weight *= (1.0 + stability * (1 - profile.biases.tension));
                        }

                        // 3. Direção
                        if (step > 0 && profile.biases.direction > 0) weight *= (1 + profile.biases.direction);
                        if (step < 0 && profile.biases.direction < 0) weight *= (1 + Math.abs(profile.biases.direction));

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
        
        currentGlobalTime += rhythmicEvent.duration;
    });

    return { phraseData: phrase, lastIndex: currentIndex };
}
