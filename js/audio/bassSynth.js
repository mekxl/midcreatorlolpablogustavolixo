/**
 * Sintetizador base: Baixo (Bass).
 * Produz um timbre grave e macio para referência harmônica.
 */

export function playBassNote(context, destination, midiNote, startTime, duration, velocity) {
    const osc = context.createOscillator();
    const gainNode = context.createGain();

    // Uma onda triangular soa mais profunda e macia para baixos simples
    osc.type = 'triangle';
    osc.frequency.value = 440 * Math.pow(2, (midiNote - 69) / 12);

    // Envelope adaptado para o baixo
    const attackTime = 0.05;
    const releaseTime = 0.2;
    
    // Baixo tem um peso natural maior, ajustamos o teto de volume
    const maxVolume = (velocity / 127) * 0.8;

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
