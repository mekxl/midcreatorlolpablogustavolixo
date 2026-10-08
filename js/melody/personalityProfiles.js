/**
 * Dicionário modular de Personalidades Musicais.
 * Cada perfil aplica vieses (multiplicadores) sobre os controles padrão do usuário
 * para direcionar a heurística procedural.
 */

export const PERSONALITIES = {
    neutral: {
        name: "Neutra",
        description: "Comportamento equilibrado. Balanceia repetição, variação e tensão de forma neutra.",
        biases: { tension: 1.0, leap: 1.0, step: 1.0, density: 1.0, rest: 1.0, direction: 0.0, motif: 1.0 }
    },
    dark: {
        name: "Dark",
        description: "Mais tensão, suspense e movimentos descendentes.",
        biases: { tension: 1.5, leap: 0.8, step: 1.2, density: 0.9, rest: 1.2, direction: -0.3, motif: 1.0 }
    },
    emotional: {
        name: "Emocional",
        description: "Frases cantáveis, desenvolvimento gradual e resoluções claras.",
        biases: { tension: 0.7, leap: 0.9, step: 1.3, density: 0.8, rest: 1.2, direction: 0.1, motif: 1.1 }
    },
    catchy: {
        name: "Catchy",
        description: "Motivos fortes, repetição e frases fáceis de memorizar.",
        biases: { tension: 0.6, leap: 1.1, step: 1.1, density: 1.0, rest: 0.7, direction: 0.0, motif: 1.5 }
    },
    energetic: {
        name: "Energética",
        description: "Ritmos ativos, maior densidade e mudanças rápidas.",
        biases: { tension: 1.1, leap: 1.2, step: 0.9, density: 1.4, rest: 0.4, direction: 0.0, motif: 0.9 }
    },
    experimental: {
        name: "Experimental",
        description: "Intervalos maiores, mudanças inesperadas e ritmos não convencionais.",
        biases: { tension: 1.4, leap: 1.6, step: 0.6, density: 1.1, rest: 1.3, direction: 0.0, motif: 0.5 }
    },
    cinematic: {
        name: "Cinemática",
        description: "Frases longas, registro amplo e construção de suspense.",
        biases: { tension: 1.2, leap: 1.3, step: 1.0, density: 0.7, rest: 1.1, direction: 0.2, motif: 0.8 }
    },
    minimalist: {
        name: "Minimalista",
        description: "Poucas notas, repetição alta, valorizando o silêncio e as pausas.",
        biases: { tension: 0.8, leap: 0.5, step: 1.0, density: 0.4, rest: 2.0, direction: 0.0, motif: 1.4 }
    }
};

/**
 * Retorna o perfil de personalidade seguro, caindo para 'neutral' se não existir.
 */
export function getPersonality(name) {
    return PERSONALITIES[name] || PERSONALITIES.neutral;
}
