/**
 * Módulo de testes simples para desenvolvimento.
 * Garante que a lógica musical esteja funcionando corretamente sem poluir a interface.
 */
import { noteToMidi } from './notes.js';
import { getDistance, getIntervalName } from './intervals.js';
import { getKeyNotes, getNoteStability } from './musicTheory.js';

export function runMusicTests() {
    console.log("=== INICIANDO TESTES DO MOTOR MUSICAL ===");

    // Teste 1: Validação de MIDI
    const c4 = noteToMidi('C', 4);
    const a4 = noteToMidi('A', 4);
    console.log(`C4 é MIDI 60? ${c4 === 60 ? 'Sim' : 'Não (Falhou: ' + c4 + ')'}`);
    console.log(`A4 é MIDI 69? ${a4 === 69 ? 'Sim' : 'Não (Falhou: ' + a4 + ')'}`);

    // Teste 2: Estrutura da Escala Maior
    const cMajor = getKeyNotes('C', 'major').join(' ');
    console.log(`C maior contém C D E F G A B? ${cMajor === 'C D E F G A B' ? 'Sim' : 'Não (Falhou: ' + cMajor + ')'}`);

    // Teste 3: Estrutura da Escala Menor Natural
    const aMinor = getKeyNotes('A', 'minor_natural').join(' ');
    console.log(`A menor natural contém A B C D E F G? ${aMinor === 'A B C D E F G' ? 'Sim' : 'Não (Falhou: ' + aMinor + ')'}`);

    // Teste 4: Intervalos
    const distCG = getDistance(noteToMidi('C', 4), noteToMidi('G', 4));
    const intCG = getIntervalName(distCG);
    console.log(`Intervalo C -> G é Quinta justa? ${intCG === 'Quinta justa' ? 'Sim' : 'Não (Falhou: ' + intCG + ')'}`);

    const distCFs = getDistance(noteToMidi('C', 4), noteToMidi('F#', 4));
    const intCFs = getIntervalName(distCFs);
    console.log(`Intervalo C -> F# é Trítono? ${intCFs === 'Trítono' ? 'Sim' : 'Não (Falhou: ' + intCFs + ')'}`);

    // Teste 5: Estabilidade Heurística
    const stabC = getNoteStability('C', 'C', 'major');
    console.log(`Estabilidade de C em C maior é 1.0 (Tônica)? ${stabC === 1.0 ? 'Sim' : 'Não (Falhou: ' + stabC + ')'}`);

    const stabG = getNoteStability('G', 'C', 'major');
    console.log(`Estabilidade de G em C maior é 0.9 (Quinta)? ${stabG === 0.9 ? 'Sim' : 'Não (Falhou: ' + stabG + ')'}`);

    console.log("=== TESTES CONCLUÍDOS ===");
}
