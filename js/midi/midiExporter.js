/**
 * Exportador Binário MIDI Nativo.
 * Agora suporta Multitrack: Track 1 (Melodia), Track 2 (Baixo), Track 3 (Harmonia).
 */

function toBytes(num, bytesCount) {
    const bytes = [];
    for (let i = bytesCount - 1; i >= 0; i--) {
        bytes.push((num >> (i * 8)) & 0xFF);
    }
    return bytes;
}

function toVlq(val) {
    let buffer = [val & 0x7F];
    while (val >>= 7) {
        buffer.unshift((val & 0x7F) | 0x80);
    }
    return buffer;
}

export function exportToMidi(melodyData, state) {
    const ticksPerBeat = 480;
    
    let tracksCount = 1;
    if (state.bassMode !== 'off' && melodyData.bassNotes && melodyData.bassNotes.length > 0) tracksCount++;
    if (state.harmonyMode !== 'off' && melodyData.chords && melodyData.chords.length > 0) tracksCount++;

    const headerChunk = [
        ...[0x4D, 0x54, 0x68, 0x64], 
        ...toBytes(6, 4),            
        ...toBytes(1, 2),            
        ...toBytes(tracksCount, 2),  
        ...toBytes(ticksPerBeat, 2)  
    ];

    function createTrackChunk(eventsArr, channel, isChordStructure = false) {
        const events = [];
        const microsecondsPerBeat = Math.floor(60000000 / melodyData.tempo);
        events.push({ tick: 0, bytes: [0xFF, 0x51, 0x03, ...toBytes(microsecondsPerBeat, 3)] });

        if (isChordStructure) {
            eventsArr.forEach(chord => {
                const startTick = Math.floor(chord.startTime * ticksPerBeat);
                const endTick = Math.floor((chord.startTime + chord.duration) * ticksPerBeat);
                chord.notes.forEach(noteMidi => {
                    events.push({ tick: startTick, bytes: [0x90 | channel, noteMidi, 70] });
                    events.push({ tick: endTick, bytes: [0x80 | channel, noteMidi, 0x00] });
                });
            });
        } else {
            eventsArr.forEach(note => {
                if (note.isRest) return;
                const startTick = Math.floor(note.startTime * ticksPerBeat);
                const endTick = Math.floor((note.startTime + note.duration) * ticksPerBeat);
                events.push({ tick: startTick, bytes: [0x90 | channel, note.midi, note.velocity] });
                events.push({ tick: endTick, bytes: [0x80 | channel, note.midi, 0x00] });
            });
        }

        events.sort((a, b) => a.tick - b.tick);

        const trackData = [];
        let currentTick = 0;

        events.forEach(ev => {
            const delta = ev.tick - currentTick;
            trackData.push(...toVlq(delta));
            trackData.push(...ev.bytes);
            currentTick = ev.tick;
        });

        trackData.push(...toVlq(0), 0xFF, 0x2F, 0x00);

        return [
            ...[0x4D, 0x54, 0x72, 0x6B], 
            ...toBytes(trackData.length, 4),
            ...trackData
        ];
    }

    let finalMidiArray = [...headerChunk];
    
    // Adiciona Track Melodia
    finalMidiArray.push(...createTrackChunk(melodyData.notes, 0));
    
    // Adiciona Track Baixo se ativo
    if (state.bassMode !== 'off' && melodyData.bassNotes && melodyData.bassNotes.length > 0) {
        finalMidiArray.push(...createTrackChunk(melodyData.bassNotes, 1));
    }
    
    // Adiciona Track Acordes se ativo
    if (state.harmonyMode !== 'off' && melodyData.chords && melodyData.chords.length > 0) {
        finalMidiArray.push(...createTrackChunk(melodyData.chords, 2, true));
    }
    
    const blob = new Blob([new Uint8Array(finalMidiArray)], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `melody-lab-${melodyData.key}-${melodyData.scale}-${melodyData.tempo}bpm.mid`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
