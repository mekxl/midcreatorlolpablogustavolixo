/**
 * Ponto de entrada principal da aplicação (Entry Point).
 * Coordena a inicialização de todos os módulos.
 */
import { initGeneratorUI } from './ui/generatorUI.js';
import { initControls } from './ui/controls.js';
// Futuros imports: AudioEngine, MelodyGenerator, PianoRoll, etc.

document.addEventListener('DOMContentLoaded', () => {
    console.log("Iniciando Melody Lab...");

    // 1. Inicializa controladores da UI e binds de estado
    initGeneratorUI();
    initControls();

    // 2. Futuramente, inicialização do sistema de Áudio (Web Audio API)
    // 3. Futuramente, inicialização da renderização do Piano Roll

    console.log("Melody Lab inicializado com sucesso.");
});
