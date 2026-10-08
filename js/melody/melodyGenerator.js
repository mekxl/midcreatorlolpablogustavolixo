/**
 * Motor principal de geração procedural de melodias.
 * Orquestra ritmos e frases em uma estrutura musical coesa.
 */
import { PRNG } from '../core/utils.js';
import { generateRhythmBar } from './rhythmGenerator.js';
import { generatePhrase } from './phraseGenerator.js';
import { getNoteNumber, noteToMidi } from '../music/notes.js';

export function generateMelody(settings) {
    const seed = Date.now();
    const prng = new PRNG(seed);
    
    const melodyEvents = [];
    const bassEvents = [];
    
    let currentGlobalTime = 0.0;
    let lastMidiIndex = null;
    let motifs = {}; 

    // Define a nota fundamental para o baixo (Oitava 2 ou 3)
    const rootBaseMidi = noteToMidi(settings.key, 2);

    for (let bar = 0; bar < settings.bars; bar++) {
        let barPhrase = [];
        const isResolutionBar = (bar === settings.bars - 1) || (bar > 0 && bar % 4 === 3);
        
        // Gerador do Baixo: Toca a fundamental no primeiro tempo do compasso
        bassEvents.push({
            midi: rootBaseMidi,
            noteName: settings.key,
            octave: 2,
            startTime: currentGlobalTime,
            duration: 4.0, // Nota de compasso inteiro
            isRest: false,
            velocity: 90
        });

        // Estrutura Lógica da Melodia
        if (bar === 0) {
            const rhythm = generateRhythmBar(settings.complexity, prng);
            const phraseObj = generatePhrase(rhythm, settings, prng, false, lastMidiIndex);
            barPhrase = phraseObj.phraseData;
            lastMidiIndex = phraseObj.lastIndex;
            motifs['A'] = barPhrase;
        } else {
            const shouldRepeat = prng.nextFloat() * 100 < settings.repetition;
            
            if (shouldRepeat && motifs['A']) {
                barPhrase = motifs['A'].map(event => ({ ...event })); 
                if (isResolutionBar && barPhrase.length > 0) {
                    barPhrase[barPhrase.length - 1].isRest = false;
                }
            } else {
                const rhythm = generateRhythmBar(settings.complexity, prng);
                const phraseObj = generatePhrase(rhythm, settings, prng, isResolutionBar, lastMidiIndex);
                barPhrase = phraseObj.phraseData;
                lastMidiIndex = phraseObj.lastIndex;
                if (!motifs['B']) motifs['B'] = barPhrase;
            }
        }

        // Associa os tempos globais a cada evento gerado na melodia
        barPhrase.forEach(event => {
            melodyEvents.push({
                ...event,
                startTime: currentGlobalTime
            });
            currentGlobalTime += event.duration;
        });
    }

    return {
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
