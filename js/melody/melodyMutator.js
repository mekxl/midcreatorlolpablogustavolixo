/**
 * Motor de Mutações Musicais.
 * Modifica iterativamente melodias existentes preservando estrutura sempre que possível.
 */
import { PRNG } from '../core/utils.js';
import { getScaleMidiPool, getKeyNotes } from '../music/musicTheory.js';
import { midiToNote, noteToMidi } from '../music/notes.js';

export function mutateMelody(melodyData, type, intensity, region = null) {
    // 1. Clona profundamente os dados para garantir imutabilidade do original
    const newData = JSON.parse(JSON.stringify(melodyData));
    const prng = new PRNG(Date.now());
    const intensityFactor = intensity / 100.0; // 0.0 a 1.0

    // Limites padrão e pool da escala
    const pool = getScaleMidiPool(newData.key, newData.scale, 3, 5);
    
    // Função auxiliar para restringir qual parte da melodia será mutada
    const isInRegion = (note, startBeat, endBeat) => {
        return note.startTime >= startBeat && note.startTime < endBeat;
    };

    switch (type) {
        case 'alter_notes':
            newData.notes.forEach(note => {
                if (!note.isRest && prng.nextFloat() < intensityFactor) {
                    const currentIndex = pool.indexOf(note.midi);
                    if (currentIndex !== -1) {
                        // Intensidade alta = saltos maiores permitidos
                        const maxJump = Math.max(1, Math.floor(intensityFactor * 7));
                        const step = prng.range(-maxJump, maxJump);
                        let newIndex = Math.max(0, Math.min(pool.length - 1, currentIndex + step));
                        note.midi = pool[newIndex];
                    }
                }
            });
            break;

        case 'alter_rhythm':
            // Simplificação para manter a identidade: Desloca o início ou altera a duração sutilmente
            newData.notes.forEach(note => {
                if (prng.nextFloat() < intensityFactor) {
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
            // Altera apenas os últimos 4 tempos (último compasso)
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
            // Altera apenas os primeiros 4 tempos (primeiro compasso)
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
            // Empurra as notas para graus mais tensos ou as eleva
            newData.notes.forEach(note => {
                if (!note.isRest && prng.nextFloat() < intensityFactor) {
                    note.midi += prng.choice([1, 2, -1]); // Cromatismo sutil ou salto tenso
                    note.velocity = Math.min(127, note.velocity + 10);
                }
            });
            break;

        case 'simplify':
            // Remove notas muito curtas ou fora do tempo forte se a intensidade for alta
            newData.notes = newData.notes.filter(note => {
                if (note.duration < 0.5 && prng.nextFloat() < intensityFactor) {
                    return false; // Apaga a nota
                }
                return true;
            });
            break;

        case 'increase_complexity':
            // Divide notas longas em duas
            const complexNotes = [];
            newData.notes.forEach(note => {
                if (!note.isRest && note.duration >= 1.0 && prng.nextFloat() < intensityFactor) {
                    const half = note.duration / 2;
                    complexNotes.push({ ...note, duration: half });
                    // Adiciona nota de passagem
                    const nextMidi = pool[Math.max(0, Math.min(pool.length - 1, pool.indexOf(note.midi) + prng.choice([-1, 1])))];
                    complexNotes.push({ ...note, startTime: note.startTime + half, duration: half, midi: nextMidi });
                } else {
                    complexNotes.push(note);
                }
            });
            newData.notes = complexNotes;
            break;

        case 'make_catchy':
            // Clona o motivo do compasso 1 para o compasso 3
            const motif = newData.notes.filter(n => n.startTime >= 0 && n.startTime < 4);
            if (motif.length > 0 && intensityFactor > 0.3) {
                // Remove antigas notas do compasso 3
                newData.notes = newData.notes.filter(n => n.startTime < 8 || n.startTime >= 12);
                // Insere clone
                motif.forEach(n => {
                    newData.notes.push({ ...n, startTime: n.startTime + 8 });
                });
            }
            // Ordena o array de volta pelo tempo
            newData.notes.sort((a, b) => a.startTime - b.startTime);
            break;

        case 'make_experimental':
            // Saltos enormes e fora do tempo
            newData.notes.forEach(note => {
                if (!note.isRest && prng.nextFloat() < (intensityFactor * 0.7)) {
                    note.midi += prng.choice([-7, 7, -12, 12]);
                    note.startTime += prng.choice([-0.25, 0.25]);
                }
            });
            break;

        case 'transpose':
            // Escolhe uma nova tônica musicalmente coesa (ex: quarta ou quinta justa acima, ou grau diatônico)
            const transpositionIntervals = [5, 7, 2, -2, -5, -7];
            const shift = prng.choice(transpositionIntervals);
            
            newData.notes.forEach(note => {
                if (!note.isRest) {
                    note.midi += shift;
                    // Proteção de limites
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

            // Atualiza fisicamente a "key" com base no shift (Simplificação para manter coerência do nome MIDI)
            // Apenas para não deixar o sistema quebrar se o usuário transpor de novo.
            newData.key = midiToNote(noteToMidi(newData.key, 4) + shift, false).note;
            break;
    }

    // 2. Normaliza e limpa os dados pós-mutação
    newData.notes.forEach(note => {
        if (!note.isRest && note.midi) {
            // Garante que o MIDI está nos limites seguros globais
            note.midi = Math.max(0, Math.min(127, note.midi));
            // Atualiza os metadados textuais da nota
            const info = midiToNote(note.midi);
            note.noteName = info.fullName;
            note.octave = info.octave;
        }
    });

    return newData;
}
