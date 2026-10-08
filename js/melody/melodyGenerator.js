/**
 * Motor principal de geração procedural de melodias.
 * Orquestra ritmos e frases em uma estrutura musical coesa.
 */
import { PRNG } from '../core/utils.js';
import { generateRhythmBar } from './rhythmGenerator.js';
import { generatePhrase } from './phraseGenerator.js';

export function generateMelody(settings) {
    // Inicializa o PRNG. Futuramente a seed poderá vir da UI.
    const seed = Date.now();
    const prng = new PRNG(seed);
    
    const melodyEvents = [];
    let currentGlobalTime = 0.0;
    let lastMidiIndex = null;
    
    // Armazena motivos para repetição estrutural
    let motifs = {}; 

    for (let bar = 0; bar < settings.bars; bar++) {
        let barPhrase = [];
        const isResolutionBar = (bar === settings.bars - 1) || (bar > 0 && bar % 4 === 3);
        
        // Estrutura Lógica A - B usando o parâmetro de Repetição
        if (bar === 0) {
            // Compasso 1: Cria Motivo A
            const rhythm = generateRhythmBar(settings.complexity, prng);
            const phraseObj = generatePhrase(rhythm, settings, prng, false, lastMidiIndex);
            barPhrase = phraseObj.phraseData;
            lastMidiIndex = phraseObj.lastIndex;
            motifs['A'] = barPhrase;
        } else {
            // Decide se repete um motivo existente ou cria algo novo
            const shouldRepeat = prng.nextFloat() * 100 < settings.repetition;
            
            if (shouldRepeat && motifs['A']) {
                // Variação leve ao invés de cópia exata
                barPhrase = motifs['A'].map(event => ({ ...event })); 
                if (isResolutionBar && barPhrase.length > 0) {
                    // Força a última nota a ser mais longa e repousar
                    barPhrase[barPhrase.length - 1].isRest = false;
                }
            } else {
                // Novo material
                const rhythm = generateRhythmBar(settings.complexity, prng);
                const phraseObj = generatePhrase(rhythm, settings, prng, isResolutionBar, lastMidiIndex);
                barPhrase = phraseObj.phraseData;
                lastMidiIndex = phraseObj.lastIndex;
                if (!motifs['B']) motifs['B'] = barPhrase;
            }
        }

        // Associa os tempos globais a cada evento gerado
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
        tempo: settings.bpm,
        timeSignature: "4/4",
        key: settings.key,
        scale: settings.scale,
        bars: settings.bars,
        seed: seed
    };
}
