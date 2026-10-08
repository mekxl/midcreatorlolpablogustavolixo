/**
 * Gerenciador de estado centralizado (State Manager).
 */
import { DEFAULT_STATE } from './constants.js';

class State {
    constructor(initialState = {}) {
        this.state = { ...DEFAULT_STATE, ...initialState };
        this.listeners = [];
        this.MAX_HISTORY = 30;
    }

    get() { return { ...this.state }; }

    set(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    pushHistory(newMelodyData, actionName = "Edição") {
        let currentHistory = [...this.state.history];
        
        if (this.state.historyIndex < currentHistory.length - 1) {
            currentHistory = currentHistory.slice(0, this.state.historyIndex + 1);
        }

        const clonedData = JSON.parse(JSON.stringify(newMelodyData));
        clonedData.timestamp = Date.now();
        clonedData.actionName = actionName;

        currentHistory.push(clonedData);

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
            this.set({ historyIndex: newIndex, melodyData: previousData });
        }
    }

    redo() {
        if (this.state.historyIndex < this.state.history.length - 1) {
            const newIndex = this.state.historyIndex + 1;
            const nextData = JSON.parse(JSON.stringify(this.state.history[newIndex]));
            this.set({ historyIndex: newIndex, melodyData: nextData });
        }
    }

    subscribe(listenerFunc) {
        this.listeners.push(listenerFunc);
        return () => { this.listeners = this.listeners.filter(l => l !== listenerFunc); };
    }

    notify() {
        const currentState = this.get();
        this.listeners.forEach(listener => listener(currentState));
    }
}

export const appState = new State();
