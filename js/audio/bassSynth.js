/**
 * Sintetizador base: Baixo (Synth Bass).
 * Otimizado com onda Saw + Filtro ressonante para um timbre Acid/Techno Bass.
 */

export function playBassNote(context, destination, midiNote, startTime, duration, velocity) {
    const osc = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gainNode = context.createGain();

    osc.type = 'sawtooth'; // Sawtooth soa muito melhor em filtros para baixos eletrônicos
    osc.frequency.value = 440 * Math.pow(2, (midiNote - 69) / 12);

    // Filtro Acid (Roland TB-303 Style)
    filter.type = 'lowpass';
    filter.Q.value = 6; // Alta ressonância para o squelch
    
    // Envelope do Filtro ríspido (Snappy)
    filter.frequency.setValueAtTime(3000, startTime);
    filter.frequency.exponentialRampToValueAtTime(150, startTime + Math.min(0.15, duration));

    // Envelope de Volume adaptado para graves curtos/potentes
    const attackTime = 0.01;
    const releaseTime = 0.1;
    const maxVolume = (velocity / 127) * 0.7;

    gainNode.gain.setValueAtTime(0.001, startTime);
    gainNode.gain.linearRampToValueAtTime(maxVolume, startTime + attackTime);
    gainNode.gain.setValueAtTime(maxVolume, Math.max(startTime + attackTime, startTime + duration - releaseTime));
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration);

    return { osc, gainNode, filter };
}
