/**
 * Motor de Exportação MIDI Binária.
 * Gera um arquivo '.mid' válido em Formato 1 nativamente, sem dependências externas.
 */

// Converte um número em array de bytes de tamanho fixo
function toBytes(num, bytesCount) {
    const bytes = [];
    for (let i = bytesCount - 1; i >= 0; i--) {
        bytes.push((num >> (i * 8)) & 0xFF);
    }
    return bytes;
}

// Converte um número para Variable Length Quantity (VLQ) - padrão do MIDI para deltas temporais
function toVlq(val) {
    let buffer = [val & 0x7F];
    while (val >>= 7) {
        buffer.unshift((val & 0x7F) | 0x80);
    }
    return buffer;
}

export function exportToMidi(melodyData) {
    const ticksPerBeat = 480;
    
    // Header Chunk (MThd)
    const headerChunk = [
        ...[0x4D, 0x54, 0x68, 0x64], // 'MThd'
        ...toBytes(6, 4),            // Length
        ...toBytes(1, 2),            // Format 1 (Multi-track)
        ...toBytes(2, 2),            // Tracks count (1 Melody + 1 Bass)
        ...toBytes(ticksPerBeat, 2)  // Ticks per quarter note
    ];

    function createTrackChunk(eventsArr, channel) {
        const events = [];
        
        // Evento de Tempo no início de cada track
        const microsecondsPerBeat = Math.floor(60000000 / melodyData.tempo);
        events.push({ tick: 0, bytes: [0xFF, 0x51, 0x03, ...toBytes(microsecondsPerBeat, 3)] });

        // Compila Notas
        eventsArr.forEach(note => {
            if (note.isRest) return;
            const startTick = Math.floor(note.startTime * ticksPerBeat);
            const endTick = Math.floor((note.startTime + note.duration) * ticksPerBeat);
            
            // Note On
            events.push({ tick: startTick, bytes: [0x90 | channel, note.midi, note.velocity] });
            // Note Off
            events.push({ tick: endTick, bytes: [0x80 | channel, note.midi, 0x00] });
        });

        // Ordena por tick
        events.sort((a, b) => a.tick - b.tick);

        const trackData = [];
        let currentTick = 0;

        events.forEach(ev => {
            const delta = ev.tick - currentTick;
            trackData.push(...toVlq(delta));
            trackData.push(...ev.bytes);
            currentTick = ev.tick;
        });

        // End of Track
        trackData.push(...toVlq(0), 0xFF, 0x2F, 0x00);

        return [
            ...[0x4D, 0x54, 0x72, 0x6B], // 'MTrk'
            ...toBytes(trackData.length, 4),
            ...trackData
        ];
    }

    const melodyTrack = createTrackChunk(melodyData.notes, 0); // Canal 0
    const bassTrack = createTrackChunk(melodyData.bassNotes, 1); // Canal 1

    const finalMidiArray = new Uint8Array([...headerChunk, ...melodyTrack, ...bassTrack]);
    
    // Força o Download
    const blob = new Blob([finalMidiArray], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `melody-lab-${melodyData.key}-${melodyData.scale}-${melodyData.tempo}bpm.mid`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
