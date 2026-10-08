/**
 * Motor principal de geração procedural de melodias.
 * Coordena ritmo e frases aplicando as regras de estrutura e identidade musical.
 */
import { PRNG } from '../core/utils.js';
import { generateRhythmBar } from './rhythmGenerator.js';
import { generatePhrase } from './phraseGenerator.js';
import { getPersonality } from './personalityProfiles.js';
import { noteToMidi } from '../music/notes.js';

export function generateMelody(settings) {
    const seed = Date.now();
    const prng = new PRNG(seed);
    const profile = getPersonality(settings.personality);
    
    const melodyEvents = [];
    const bassEvents = [];
    
    let currentGlobalTime = 0.0;
    let lastMidiIndex = null;
    let motifs = {}; 

    const rootBaseMidi = noteToMidi(settings.key, 2);

    for (let bar = 0; bar < settings.bars; bar++) {
        let barPhrase = [];
        const isResolutionBar = (bar === settings.bars - 1) || (bar > 0 && bar % 4 === 3);
        
        bassEvents.push({
            midi: rootBaseMidi,
            noteName: settings.key,
            octave: 2,
            startTime: currentGlobalTime,
            duration: 4.0, 
            isRest: false,
            velocity: 90
        });

        if (bar === 0) {
            const rhythm = generateRhythmBar(settings, prng);
            const phraseObj = generatePhrase(rhythm, settings, prng, false, lastMidiIndex);
            barPhrase = phraseObj.phraseData;
            lastMidiIndex = phraseObj.lastIndex;
            motifs['A'] = barPhrase;
        } else {
            // Repetição estrutural é modulada pela personalidade (Ex: Catchy > Neutro > Experimental)
            const effectiveRepetition = Math.max(0, Math.min(100, settings.repetition * profile.biases.motif));
            const shouldRepeat = prng.nextFloat() * 100 < effectiveRepetition;
            
            if (shouldRepeat && motifs['A']) {
                barPhrase = motifs['A'].map(event => ({ ...event })); 
                if (isResolutionBar && barPhrase.length > 0) {
                    barPhrase[barPhrase.length - 1].isRest = false;
                }
            } else {
                const rhythm = generateRhythmBar(settings, prng);
                const phraseObj = generatePhrase(rhythm, settings, prng, isResolutionBar, lastMidiIndex);
                barPhrase = phraseObj.phraseData;
                lastMidiIndex = phraseObj.lastIndex;
                if (!motifs['B']) motifs['B'] = barPhrase;
            }
        }

        barPhrase.forEach(event => {
            melodyEvents.push({
                ...event,
                startTime: currentGlobalTime
            });
            currentGlobalTime += event.duration;
        });
    }

    // Salva a personalidade gerada dentro dos metadados para as mutações futuras
    return {
        personality: settings.personality,
        notes: melodyEvents,
        bassNotes: bassEvents,
        tempo: settings.bpm,
        timeSignature: "4/4",
        key: settings.key,
        scale: settings.scale,
        bars: settings.bars,
        totalDurationBeats: settings.bars * 4.0,
        seed: seed
    };
}
