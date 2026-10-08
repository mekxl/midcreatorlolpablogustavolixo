/**
 * Gerador Inteligente de Baixo focado em padrões de Música Eletrônica.
 */

export function generateBass(chords, settings, prng) {
    if (settings.bassMode === 'off' || !chords || chords.length === 0) return [];

    const bassEvents = [];
    const minMidi = 24; // C1
    const maxMidi = 43; // G2 (Mantém o sub/mid-bass focado)

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
            // Pad Bass: Segura a nota (Classic Ambient/Trance Pad)
            bassEvents.push({ midi: rootBass, startTime: chord.startTime, duration: chord.duration, velocity: 100, isRest: false });
        } 
        else if (settings.bassMode === 'offbeat') {
            // Offbeat Bass: Toca no contratempo (0.5, 1.5, 2.5). Clássico House.
            for (let beat = 0; beat < chord.duration; beat += 1) {
                bassEvents.push({ 
                    midi: rootBass, 
                    startTime: chord.startTime + beat + 0.5, 
                    duration: 0.25, 
                    velocity: 110, 
                    isRest: false 
                });
            }
        } 
        else if (settings.bassMode === 'rolling') {
            // Rolling 16ths: Clássico Psytrance/Techno. Pula o tempo forte e bate nas outras semicolcheias.
            for (let beat = 0; beat < chord.duration; beat += 0.25) {
                const isDownbeat = (beat % 1 === 0);
                if (!isDownbeat) {
                    // Accent no contratempo exato (0.5)
                    const isOffbeat8th = (beat % 0.5 === 0);
                    bassEvents.push({ 
                        midi: rootBass, 
                        startTime: chord.startTime + beat, 
                        duration: 0.25, 
                        velocity: isOffbeat8th ? 110 : 85, 
                        isRest: false 
                    });
                }
            }
        }
        else if (settings.bassMode === 'bassline') {
            // Groove Síncopado com Oitavas
            let currentTime = chord.startTime;
            const endOfChord = chord.startTime + chord.duration;
            
            while (currentTime < endOfChord) {
                const isDownbeat = (currentTime % 1) === 0;
                const dur = prng.choice([0.25, 0.5, 0.75]); // Ritmos mais quebrados
                
                if (currentTime + dur > endOfChord) break;

                let noteMidi = rootBass;
                if (!isDownbeat) noteMidi = prng.choice([rootBass, rootBass + 12]); // Pulos de oitava (Slap House style)

                const isRest = !isDownbeat && prng.nextFloat() > 0.7;

                bassEvents.push({
                    midi: isRest ? null : noteMidi,
                    startTime: currentTime,
                    duration: dur,
                    velocity: isDownbeat ? 110 : 85,
                    isRest: isRest
                });

                currentTime += dur;
            }
            if (currentTime < endOfChord) {
                bassEvents.push({ midi: rootBass, startTime: currentTime, duration: endOfChord - currentTime, velocity: 80, isRest: false });
            }
        }
    });

    return bassEvents;
}
