/**
 * Orquestrador central: Combina Harmonia, Baixo e Melodia na mesma estrutura.
 */
import { PRNG } from '../core/utils.js';
import { generateRhythmBar } from './rhythmGenerator.js';
import { generatePhrase } from './phraseGenerator.js';
import { generateHarmony } from './harmonyGenerator.js';
import { generateBass } from './bassGenerator.js';
import { getPersonality } from './personalityProfiles.js';

export function generateMelody(settings) {
    const seed = Date.now();
    const prng = new PRNG(seed);
    const profile = getPersonality(settings.personality);
    
    // 1. Gera Harmonia primeiro
    const chords = generateHarmony(settings, prng);
    
    // 2. Gera o Baixo baseado na harmonia
    const bassNotes = generateBass(chords, settings, prng);

    // 3. Gera a Melodia
    const melodyEvents = [];
    let currentGlobalTime = 0.0;
    let lastMidiIndex = null;
    let motifs = {}; 

    for (let bar = 0; bar < settings.bars; bar++) {
        let barPhrase = [];
        const isResolutionBar = (bar === settings.bars - 1) || (bar > 0 && bar % 4 === 3);
        
        if (bar === 0) {
            let rhythm = generateRhythmBar(settings, prng);
            // Injeta o tempo provisório no ritmo para o PhraseGenerator calcular a harmonia correta
            rhythm.forEach((r, idx) => r._tempStartTime = currentGlobalTime + rhythm.slice(0,idx).reduce((sum,ev)=>sum+ev.duration, 0));
            
            const phraseObj = generatePhrase(rhythm, settings, prng, false, lastMidiIndex, chords);
            barPhrase = phraseObj.phraseData;
            lastMidiIndex = phraseObj.lastIndex;
            motifs['A'] = barPhrase;
        } else {
            const effectiveRepetition = Math.max(0, Math.min(100, settings.repetition * profile.biases.motif));
            const shouldRepeat = prng.nextFloat() * 100 < effectiveRepetition;
            
            if (shouldRepeat && motifs['A']) {
                barPhrase = motifs['A'].map(event => ({ ...event })); 
                if (isResolutionBar && barPhrase.length > 0) barPhrase[barPhrase.length - 1].isRest = false;
            } else {
                let rhythm = generateRhythmBar(settings, prng);
                rhythm.forEach((r, idx) => r._tempStartTime = currentGlobalTime + rhythm.slice(0,idx).reduce((sum,ev)=>sum+ev.duration, 0));
                
                const phraseObj = generatePhrase(rhythm, settings, prng, isResolutionBar, lastMidiIndex, chords);
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

    return {
        personality: settings.personality,
        notes: melodyEvents,
        bassNotes: bassNotes,
        chords: chords,
        tempo: settings.bpm,
        timeSignature: "4/4",
        key: settings.key,
        scale: settings.scale,
        bars: settings.bars,
        totalDurationBeats: settings.bars * 4.0,
        seed: seed
    };
}
