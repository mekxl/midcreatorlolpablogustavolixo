/**
 * Gerador procedural de ritmos musicais.
 * Opera preenchendo matematicamente compassos 4/4 sem ultrapassar limites.
 */

// Durações em tempos (1 tempo = semínima).
const DURATIONS = {
    WHOLE: 4.0,
    HALF: 2.0,
    QUARTER: 1.0,
    EIGHTH: 0.5,
    SIXTEENTH: 0.25
};

/**
 * Gera um padrão rítmico de 1 compasso (4 tempos) baseado na complexidade.
 */
export function generateRhythmBar(complexity, prng) {
    let remainingTime = 4.0;
    const rhythm = [];

    // Ajusta a probabilidade das figuras musicais com base na complexidade (0-100)
    // Complexidade baixa = notas longas. Complexidade alta = notas curtas.
    let possibleDurations = [DURATIONS.WHOLE, DURATIONS.HALF, DURATIONS.QUARTER, DURATIONS.EIGHTH];
    if (complexity > 70) possibleDurations.push(DURATIONS.SIXTEENTH);
    
    let weights = possibleDurations.map(d => {
        if (d >= 2.0) return Math.max(10, 100 - complexity);
        if (d === 1.0) return 50;
        if (d <= 0.5) return Math.max(10, complexity);
        return 10;
    });

    while (remainingTime > 0) {
        // Filtra opções que cabem no espaço restante do compasso
        const validIndices = possibleDurations
            .map((d, index) => d <= remainingTime ? index : -1)
            .filter(i => i !== -1);
            
        if (validIndices.length === 0) break; // Segurança anti-loop

        const validDurations = validIndices.map(i => possibleDurations[i]);
        const validWeights = validIndices.map(i => weights[i]);

        const selectedDuration = prng.weightedChoice(validDurations, validWeights);
        
        // Pausas: probabilidade baseada na complexidade
        const isRest = prng.nextFloat() * 100 < (complexity * 0.3);

        rhythm.push({
            duration: selectedDuration,
            isRest: isRest
        });

        remainingTime -= selectedDuration;
    }

    return rhythm;
}
