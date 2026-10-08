/**
 * Sintetizador base: Onda Dente de Serra (Synth Lead).
 * Otimizado para Música Eletrônica com um filtro Pluck/Lowpass para soar polido.
 */

export function playSawNote(context, destination, midiNote, startTime, duration, velocity) {
    const osc = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gainNode = context.createGain();

    osc.type = 'sawtooth';
    osc.frequency.value = 440 * Math.pow(2, (midiNote - 69) / 12);

    // Filtro Lowpass Clássico de Sintetizador Eletrônico
    filter.type = 'lowpass';
    filter.Q.value = 2; // Ressonância leve
    
    // Envelope do Filtro (Pluck)
    filter.frequency.setValueAtTime(6000, startTime); // Abre brilhante
    filter.frequency.exponentialRampToValueAtTime(800, startTime + Math.min(0.2, duration));

    // Envelope de Volume (ADSR Pluck/Lead)
    const attackTime = 0.01;
    const releaseTime = 0.15;
    const maxVolume = (velocity / 127) * 0.4; // Teto seguro
    
    gainNode.gain.setValueAtTime(0.001, startTime);
    gainNode.gain.linearRampToValueAtTime(maxVolume, startTime + attackTime);
    gainNode.gain.setValueAtTime(maxVolume, Math.max(startTime + attackTime, startTime + duration - releaseTime));
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    // Conexões: Osc -> Filtro -> Gain -> Destino
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration);

    return { osc, gainNode, filter };
}
