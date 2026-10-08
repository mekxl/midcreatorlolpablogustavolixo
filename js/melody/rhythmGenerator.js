/**
 * Gerador procedural de ritmos musicais.
 * Agora utiliza os vieses da Personalidade para guiar a densidade e o silêncio.
 */
import { getPersonality } from './personalityProfiles.js';

const DURATIONS = {
    WHOLE: 4.0,
    HALF: 2.0,
    QUARTER: 1.0,
    EIGHTH: 0.5,
    SIXTEENTH: 0.25
};

/**
 * Gera um padrão rítmico de 1 compasso (4 tempos) baseado na complexidade e personalidade.
 */
export function generateRhythmBar(settings, prng) {
    const profile = getPersonality(settings.personality);
    
    // Aplica o viés de densidade da personalidade na complexidade base
    const effectiveComplexity = Math.max(0, Math.min(100, settings.complexity * profile.biases.density));
    
    let remainingTime = 4.0;
    const rhythm = [];

    let possibleDurations = [DURATIONS.WHOLE, DURATIONS.HALF, DURATIONS.QUARTER, DURATIONS.EIGHTH];
    if (effectiveComplexity > 70) possibleDurations.push(DURATIONS.SIXTEENTH);
    
    let weights = possibleDurations.map(d => {
        if (d >= 2.0) return Math.max(10, 100 - effectiveComplexity);
        if (d === 1.0) return 50;
        if (d <= 0.5) return Math.max(10, effectiveComplexity);
        return 10;
    });

    while (remainingTime > 0) {
        const validIndices = possibleDurations
            .map((d, index) => d <= remainingTime ? index : -1)
            .filter(i => i !== -1);
            
        if (validIndices.length === 0) break; 

        const validDurations = validIndices.map(i => possibleDurations[i]);
        const validWeights = validIndices.map(i => weights[i]);

        const selectedDuration = prng.weightedChoice(validDurations, validWeights);
        
        // Pausas sofrem influência dupla: complexidade (do usuário) e viés (da personalidade)
        const restProb = (effectiveComplexity * 0.3) * profile.biases.rest;
        const isRest = prng.nextFloat() * 100 < restProb;

        rhythm.push({
            duration: selectedDuration,
            isRest: isRest
        });

        remainingTime -= selectedDuration;
    }

    return rhythm;
}
