/**
 * Ponto de entrada principal da aplicação (Entry Point).
 * Coordena a inicialização de todos os módulos.
 */
import { initGeneratorUI } from './ui/generatorUI.js';
import { initControls } from './ui/controls.js';
import { runMusicTests } from './music/tests.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Iniciando Melody Lab...");

    // Executa testes internos de teoria musical no console
    runMusicTests();

    // Inicializa controladores da UI e binds de estado
    initGeneratorUI();
    initControls();

    console.log("Melody Lab inicializado com sucesso.");
});
