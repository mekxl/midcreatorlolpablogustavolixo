/**
 * Gerador procedural de ritmos musicais focado em Groove Eletrônico.
 */
import { getPersonality } from './personalityProfiles.js';

const DURATIONS = {
    WHOLE: 4.0,
    HALF: 2.0,
    QUARTER: 1.0,
    EIGHTH: 0.5,
    SIXTEENTH: 0.25
};

export function generateRhythmBar(settings, prng) {
    const profile = getPersonality(settings.personality);
    const effectiveComplexity = Math.max(0, Math.min(100, settings.complexity * profile.biases.density));
    
    let remainingTime = 4.0;
    const rhythm = [];

    let possibleDurations = [DURATIONS.WHOLE, DURATIONS.HALF, DURATIONS.QUARTER, DURATIONS.EIGHTH];
    if (effectiveComplexity > 60) possibleDurations.push(DURATIONS.SIXTEENTH);
    
    let weights = possibleDurations.map(d => {
        if (d >= 2.0) return Math.max(5, 100 - effectiveComplexity);
        if (d === 1.0) return 40;
        if (d <= 0.5) return Math.max(20, effectiveComplexity);
        return 10;
    });

    let currentBeatPosition = 0; // Para calcular síncope no groove eletrônico

    while (remainingTime > 0) {
        const validIndices = possibleDurations
            .map((d, index) => d <= remainingTime ? index : -1)
            .filter(i => i !== -1);
            
        if (validIndices.length === 0) break; 

        let validDurations = validIndices.map(i => possibleDurations[i]);
        let validWeights = validIndices.map(i => weights[i]);

        // Heurística de Síncope/Groove: Se for contratempo, aumenta chance de notas curtas
        const isOffbeat = (currentBeatPosition % 1) !== 0;
        if (isOffbeat && validDurations.includes(DURATIONS.SIXTEENTH)) {
            const idx16 = validDurations.indexOf(DURATIONS.SIXTEENTH);
            validWeights[idx16] *= 1.5; 
        }

        const selectedDuration = prng.weightedChoice(validDurations, validWeights);
        
        // Pausas formam o groove da música eletrônica
        const restProb = (Math.max(10, 100 - effectiveComplexity) * 0.4) * profile.biases.rest;
        // Evita pausar no primeiro beat do compasso na maioria das vezes, a não ser em estilos experimentais
        let isRest = false;
        if (currentBeatPosition === 0 && profile.name !== "IDM / Experimental") {
            isRest = prng.nextFloat() * 100 < (restProb * 0.2); 
        } else {
            isRest = prng.nextFloat() * 100 < restProb;
        }

        rhythm.push({
            duration: selectedDuration,
            isRest: isRest,
            _beatPos: currentBeatPosition
        });

        remainingTime -= selectedDuration;
        currentBeatPosition += selectedDuration;
    }

    return rhythm;
}
