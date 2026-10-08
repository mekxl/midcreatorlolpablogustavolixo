/**
 * Motor de Mutações Musicais.
 * Modifica iterativamente melodias preservando a Identidade da Personalidade atual.
 */
import { PRNG } from '../core/utils.js';
import { getScaleMidiPool } from '../music/musicTheory.js';
import { midiToNote, noteToMidi } from '../music/notes.js';
import { getPersonality } from './personalityProfiles.js';

export function mutateMelody(melodyData, type, intensity, region = null) {
    const newData = JSON.parse(JSON.stringify(melodyData));
    const prng = new PRNG(Date.now());
    
    // Resgata o perfil original para influenciar a severidade das mutações
    const profile = getPersonality(newData.personality || 'neutral');
    const intensityFactor = intensity / 100.0; 

    const pool = getScaleMidiPool(newData.key, newData.scale, 3, 5);

    switch (type) {
        case 'alter_notes':
            newData.notes.forEach(note => {
                if (!note.isRest && prng.nextFloat() < intensityFactor) {
                    const currentIndex = pool.indexOf(note.midi);
                    if (currentIndex !== -1) {
                        const maxJump = Math.max(1, Math.floor(intensityFactor * 7 * profile.biases.leap));
                        const step = prng.range(-maxJump, maxJump);
                        let newIndex = Math.max(0, Math.min(pool.length - 1, currentIndex + step));
                        note.midi = pool[newIndex];
                    }
                }
            });
            break;

        case 'alter_rhythm':
            newData.notes.forEach(note => {
                if (prng.nextFloat() < (intensityFactor * profile.biases.density)) {
                    const changes = [-0.25, 0.25, 0.5];
                    const change = prng.choice(changes);
                    
                    if (prng.nextFloat() > 0.5) {
                        note.startTime = Math.max(0, note.startTime + change);
                    } else {
                        note.duration = Math.max(0.25, note.duration + change);
                    }
                }
            });
            break;

        case 'alter_end':
            const endThreshold = newData.totalDurationBeats - 4;
            newData.notes.forEach(note => {
                if (!note.isRest && note.startTime >= endThreshold && prng.nextFloat() < intensityFactor + 0.3) {
                    const currentIndex = pool.indexOf(note.midi);
                    if (currentIndex !== -1) {
                        note.midi = pool[Math.max(0, Math.min(pool.length - 1, currentIndex + prng.range(-3, 3)))];
                    }
                }
            });
            break;

        case 'alter_start':
            newData.notes.forEach(note => {
                if (!note.isRest && note.startTime < 4 && prng.nextFloat() < intensityFactor + 0.3) {
                    const currentIndex = pool.indexOf(note.midi);
                    if (currentIndex !== -1) {
                        note.midi = pool[Math.max(0, Math.min(pool.length - 1, currentIndex + prng.range(-3, 3)))];
                    }
                }
            });
            break;

        case 'increase_tension':
            newData.notes.forEach(note => {
                // Personalidades mais tensas sofrem menos restrição aqui
                if (!note.isRest && prng.nextFloat() < (intensityFactor * profile.biases.tension)) {
                    note.midi += prng.choice([1, 2, -1]); 
                    note.velocity = Math.min(127, note.velocity + 10);
                }
            });
            break;

        case 'simplify':
            newData.notes = newData.notes.filter(note => {
                if (note.duration < 0.5 && prng.nextFloat() < intensityFactor) {
                    return false; 
                }
                return true;
            });
            break;

        case 'increase_complexity':
            const complexNotes = [];
            newData.notes.forEach(note => {
                if (!note.isRest && note.duration >= 1.0 && prng.nextFloat() < intensityFactor) {
                    const half = note.duration / 2;
                    complexNotes.push({ ...note, duration: half });
                    const nextMidi = pool[Math.max(0, Math.min(pool.length - 1, pool.indexOf(note.midi) + prng.choice([-1, 1])))];
                    complexNotes.push({ ...note, startTime: note.startTime + half, duration: half, midi: nextMidi });
                } else {
                    complexNotes.push(note);
                }
            });
            newData.notes = complexNotes;
            break;

        case 'make_catchy':
            const motif = newData.notes.filter(n => n.startTime >= 0 && n.startTime < 4);
            if (motif.length > 0 && intensityFactor > 0.3) {
                newData.notes = newData.notes.filter(n => n.startTime < 8 || n.startTime >= 12);
                motif.forEach(n => {
                    newData.notes.push({ ...n, startTime: n.startTime + 8 });
                });
            }
            newData.notes.sort((a, b) => a.startTime - b.startTime);
            break;

        case 'make_experimental':
            newData.notes.forEach(note => {
                if (!note.isRest && prng.nextFloat() < (intensityFactor * 0.7)) {
                    note.midi += prng.choice([-7, 7, -12, 12]);
                    note.startTime += prng.choice([-0.25, 0.25]);
                }
            });
            break;

        case 'transpose':
            const transpositionIntervals = [5, 7, 2, -2, -5, -7];
            const shift = prng.choice(transpositionIntervals);
            
            newData.notes.forEach(note => {
                if (!note.isRest) {
                    note.midi += shift;
                    if (note.midi > 100) note.midi -= 12;
                    if (note.midi < 30) note.midi += 12;
                }
            });

            newData.bassNotes.forEach(note => {
                if (!note.isRest) {
                    note.midi += shift;
                    if (note.midi > 60) note.midi -= 12;
                    if (note.midi < 24) note.midi += 12;
                }
            });

            newData.key = midiToNote(noteToMidi(newData.key, 4) + shift, false).note;
            break;
    }

    // Normalização Segura
    newData.notes.forEach(note => {
        if (!note.isRest && note.midi) {
            note.midi = Math.max(0, Math.min(127, note.midi));
            const info = midiToNote(note.midi);
            note.noteName = info.fullName;
            note.octave = info.octave;
        }
    });

    return newData;
}
