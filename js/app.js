/**
 * Ponto de entrada principal da aplicação (Entry Point).
 */
import { initGeneratorUI } from './ui/generatorUI.js';
import { initControls } from './ui/controls.js';
import { runMusicTests } from './music/tests.js';
import './ui/pianoRoll.js'; 

document.addEventListener('DOMContentLoaded', () => {
    console.log("Iniciando Melody Lab...");

    // Validações teóricas seguras no console
    runMusicTests();

    // Inicializa Controladores de UI, Presets e Atalhos
    initGeneratorUI();
    initControls();

    console.log("Melody Lab inicializado com sucesso.");
});
