/**
 * Gerador Inteligente de Baixo.
 * Segue a progressão harmônica criando padrões rítmicos seguros em região grave.
 */

export function generateBass(chords, settings, prng) {
    if (settings.bassMode === 'off' || !chords || chords.length === 0) return [];

    const bassEvents = [];
    const minMidi = 28; // E1
    const maxMidi = 48; // C3

    // Ajusta uma nota MIDI para caber no registro do baixo
    const enforceBassRegister = (midi) => {
        let adjusted = midi;
        while (adjusted > maxMidi) adjusted -= 12;
        while (adjusted < minMidi) adjusted += 12;
        return adjusted;
    };

    chords.forEach(chord => {
        const rootBass = enforceBassRegister(chord.rootMidi);
        const fifthBass = enforceBassRegister(chord.rootMidi + 7);

        if (settings.bassMode === 'fundamental') {
            // Segura a fundamental durante todo o acorde
            bassEvents.push({
                midi: rootBass,
                startTime: chord.startTime,
                duration: chord.duration,
                velocity: 90,
                isRest: false
            });
        } 
        else if (settings.bassMode === 'fundamental_fifth') {
            // Alterna Fundamental e Quinta (ex: 2 tempos cada)
            const halfDur = chord.duration / 2;
            bassEvents.push({ midi: rootBass, startTime: chord.startTime, duration: halfDur, velocity: 90, isRest: false });
            bassEvents.push({ midi: fifthBass, startTime: chord.startTime + halfDur, duration: halfDur, velocity: 85, isRest: false });
        } 
        else if (settings.bassMode === 'bassline') {
            // Padrão de oitavas ou arpejo simples rítmico (colcheias e semínimas)
            let currentTime = chord.startTime;
            const endOfChord = chord.startTime + chord.duration;
            
            while (currentTime < endOfChord) {
                const isDownbeat = (currentTime % 1) === 0;
                const dur = prng.choice([0.5, 0.5, 1.0]); // Favorece colcheias e semínimas
                
                if (currentTime + dur > endOfChord) break;

                let noteMidi = rootBass;
                if (!isDownbeat) {
                    noteMidi = prng.choice([rootBass, rootBass + 12, fifthBass]);
                }

                // Chance leve de pausa na subdivisão
                const isRest = !isDownbeat && prng.nextFloat() > 0.8;

                bassEvents.push({
                    midi: isRest ? null : noteMidi,
                    startTime: currentTime,
                    duration: dur,
                    velocity: isDownbeat ? 95 : 80,
                    isRest: isRest
                });

                currentTime += dur;
            }
            
            // Preenche qualquer espaço restante com a fundamental
            if (currentTime < endOfChord) {
                bassEvents.push({
                    midi: rootBass,
                    startTime: currentTime,
                    duration: endOfChord - currentTime,
                    velocity: 80,
                    isRest: false
                });
            }
        }
    });

    return bassEvents;
}
