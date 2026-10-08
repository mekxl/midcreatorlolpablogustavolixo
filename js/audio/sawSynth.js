/**
 * Sintetizador base: Onda Dente de Serra (Synth Saw).
 * Produz um timbre claro para referência melódica.
 */

export function playSawNote(context, destination, midiNote, startTime, duration, velocity) {
    const osc = context.createOscillator();
    const gainNode = context.createGain();

    osc.type = 'sawtooth';
    // Fórmula padrão MIDI para Frequência
    osc.frequency.value = 440 * Math.pow(2, (midiNote - 69) / 12);

    // Envelope (ADSR Básico para evitar estalos)
    const attackTime = 0.02;
    const releaseTime = 0.1;
    
    // Converte velocity (0-127) para amplitude (0.0 - 0.5 para não estourar)
    const maxVolume = (velocity / 127) * 0.5;

    // Agenda o envelope no AudioContext
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(maxVolume, startTime + attackTime);
    gainNode.gain.setValueAtTime(maxVolume, Math.max(startTime + attackTime, startTime + duration - releaseTime));
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(gainNode);
    gainNode.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration);

    return { osc, gainNode };
}
