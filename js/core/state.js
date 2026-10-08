/**
 * Gerenciador de estado centralizado (State Manager).
 * Inclui sistema de Histórico (Desfazer/Refazer) para suportar mutações.
 */
import { DEFAULT_STATE } from './constants.js';

class State {
    constructor(initialState = {}) {
        this.state = { ...DEFAULT_STATE, ...initialState };
        this.listeners = [];
        this.MAX_HISTORY = 20;
    }

    get() {
        return { ...this.state };
    }

    set(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    // Empurra uma nova versão da melodia para o histórico, deletando futuros se estiver no meio
    pushHistory(newMelodyData) {
        let currentHistory = [...this.state.history];
        
        // Se o usuário desfez e depois fez uma alteração nova, descarta o futuro
        if (this.state.historyIndex < currentHistory.length - 1) {
            currentHistory = currentHistory.slice(0, this.state.historyIndex + 1);
        }

        // Deep copy para evitar mutações indesejadas por referência
        const clonedData = JSON.parse(JSON.stringify(newMelodyData));
        currentHistory.push(clonedData);

        // Limita o tamanho do histórico
        if (currentHistory.length > this.MAX_HISTORY) {
            currentHistory.shift();
        }

        this.set({
            history: currentHistory,
            historyIndex: currentHistory.length - 1,
            melodyData: JSON.parse(JSON.stringify(clonedData)),
            hasMelody: true
        });
    }

    undo() {
        if (this.state.historyIndex > 0) {
            const newIndex = this.state.historyIndex - 1;
            const previousData = JSON.parse(JSON.stringify(this.state.history[newIndex]));
            this.set({
                historyIndex: newIndex,
                melodyData: previousData
            });
        }
    }

    redo() {
        if (this.state.historyIndex < this.state.history.length - 1) {
            const newIndex = this.state.historyIndex + 1;
            const nextData = JSON.parse(JSON.stringify(this.state.history[newIndex]));
            this.set({
                historyIndex: newIndex,
                melodyData: nextData
            });
        }
    }

    subscribe(listenerFunc) {
        this.listeners.push(listenerFunc);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listenerFunc);
        };
    }

    notify() {
        const currentState = this.get();
        this.listeners.forEach(listener => listener(currentState));
    }
}

export const appState = new State();
