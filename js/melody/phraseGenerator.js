/**
 * Motor heurístico que gera sequências de notas. 
 * Adiciona Loopability e Voice-Leading para Música Eletrônica.
 */
import { getScaleMidiPool, getNoteStability } from '../music/musicTheory.js';
import { midiToNote } from '../music/notes.js';
import { getPersonality } from './personalityProfiles.js';
import { getActiveChord } from './harmonyGenerator.js';

export function generatePhrase(rhythmPattern, settings, prng, isResolution = false, lastMidiIndex = null, chords = [], firstMidiOfLoop = null) {
    const profile = getPersonality(settings.personality);
    
    let minOct = 4, maxOct = 5;
    if (settings.register === 'low') { minOct = 3; maxOct = 4; }
    if (settings.register === 'high') { minOct = 5; maxOct = 6; }

    const pool = getScaleMidiPool(settings.key, settings.scale, minOct, maxOct);
    if (pool.length === 0) return { phraseData: [], lastIndex: 0, firstIndex: 0 };

    let phrase = [];
    let currentIndex = lastMidiIndex !== null ? lastMidiIndex : Math.floor(pool.length / 2);
    let capturedFirstIndex = null;

    const { creativity } = settings;
    let currentGlobalTime = rhythmPattern.length > 0 ? rhythmPattern[0]._tempStartTime : 0;

    rhythmPattern.forEach((rhythmicEvent, i) => {
        if (rhythmicEvent.isRest) {
            phrase.push({ ...rhythmicEvent, midi: null, noteName: 'Pausa' });
            currentGlobalTime += rhythmicEvent.duration;
            return;
        }

        const isLastNote = i === rhythmPattern.length - 1;
        const currentChord = getActiveChord(chords, currentGlobalTime);
        
        // Loopability: Se for a última nota do loop inteiro, direcione para a primeira nota gerada (ou para a fundamental)
        if (isResolution && isLastNote) {
            if (firstMidiOfLoop !== null) {
                let targetInPool = pool.findIndex(m => m === firstMidiOfLoop);
                if (targetInPool !== -1) currentIndex = targetInPool;
            } else if (currentChord) {
                let rootInPool = pool.findIndex(m => m % 12 === currentChord.rootMidi % 12);
                if (rootInPool !== -1) currentIndex = rootInPool;
            }
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

                    if (absStep === 0) weight = Math.max(20, 100 - creativity); // Repeats are very common in EDM
                    else if (absStep <= 2) weight = 70 * profile.biases.step;
                    else {
                        if (absStep > maxJump && creativity < 80) weight = 0; 
                        else weight = (creativity * 0.5) * profile.biases.leap;
                    }

                    if (weight > 0) {
                        // CHORD-AWARENESS
                        if (currentChord && settings.harmonyMode !== 'off') {
                            const noteClass = midi % 12;
                            if (noteClass === (currentChord.rootMidi % 12)) weight *= 2.5;         
                            else if (currentChord.notes.some(n => n % 12 === noteClass)) weight *= 1.8; 
                            else weight *= 0.5;                
                        } else {
                            if (profile.biases.tension > 1) weight *= (1.0 + (1.0 - stability) * (profile.biases.tension - 1));
                            else weight *= (1.0 + stability * (1 - profile.biases.tension));
                        }

                        // DIRECTION
                        if (step > 0 && profile.biases.direction > 0) weight *= (1 + profile.biases.direction);
                        if (step < 0 && profile.biases.direction < 0) weight *= (1 + Math.abs(profile.biases.direction));

                        candidates.push({ index: targetIndex, weight: Math.max(1, weight) });
                    }
                }
            }

            if (candidates.length > 0) {
                currentIndex = prng.weightedChoice(candidates.map(c => c.index), candidates.map(c => c.weight));
            }
        }

        if (capturedFirstIndex === null) capturedFirstIndex = currentIndex;

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

    return { phraseData: phrase, lastIndex: currentIndex, firstIndex: capturedFirstIndex };
}
