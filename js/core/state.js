/**
 * Gerenciador de estado centralizado (State Manager).
 * Utiliza o padrão Observer/Pub-Sub para notificar a UI de mudanças nos dados.
 */
import { DEFAULT_STATE } from './constants.js';

class State {
    constructor(initialState = {}) {
        this.state = { ...DEFAULT_STATE, ...initialState };
        this.listeners = [];
    }

    // Retorna uma cópia do estado atual para evitar mutações diretas
    get() {
        return { ...this.state };
    }

    // Atualiza o estado e notifica os ouvintes
    set(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    // Permite que componentes (UI) se inscrevam para reagir a mudanças de estado
    subscribe(listenerFunc) {
        this.listeners.push(listenerFunc);
        // Retorna uma função de unsubscribe (desinscrição)
        return () => {
            this.listeners = this.listeners.filter(l => l !== listenerFunc);
        };
    }

    // Chama todos os ouvintes inscritos passando o estado atualizado
    notify() {
        const currentState = this.get();
        this.listeners.forEach(listener => listener(currentState));
    }
}

// Exporta uma única instância global para ser usada em toda a aplicação
export const appState = new State();
