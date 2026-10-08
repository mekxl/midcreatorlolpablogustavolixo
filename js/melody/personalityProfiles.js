/**
 * Dicionário modular de Personalidades Musicais orientadas à Música Eletrônica.
 * Define vieses probabilísticos que orientam o gerador procedural.
 */

export const PERSONALITIES = {
    neutral: {
        name: "Neutra",
        description: "Equilíbrio padrão para hooks eletrônicos. Balanço entre repetição e movimento.",
        biases: { tension: 1.0, leap: 1.0, step: 1.0, density: 1.0, rest: 1.0, direction: 0.0, motif: 1.0 }
    },
    dark: {
        name: "Dark Synthwave",
        description: "Sombrio e tenso. Ideal para Dark Techno, Cyberpunk e Synthwave. Movimentos descendentes.",
        biases: { tension: 1.5, leap: 0.7, step: 1.3, density: 0.9, rest: 1.3, direction: -0.3, motif: 1.1 }
    },
    emotional: {
        name: "Melodic Trance",
        description: "Melodias expressivas, cantáveis e arpejos emocionais com resoluções claras.",
        biases: { tension: 0.7, leap: 0.9, step: 1.3, density: 0.8, rest: 1.2, direction: 0.1, motif: 1.1 }
    },
    catchy: {
        name: "EDM Hook",
        description: "Motivos curtos e alta repetição para Pop Eletrônico e EDM (Memorabilidade).",
        biases: { tension: 0.6, leap: 1.1, step: 1.1, density: 1.0, rest: 0.8, direction: 0.0, motif: 1.6 }
    },
    energetic: {
        name: "Alta Energia",
        description: "Alta densidade rítmica e saltos ágeis. Perfeito para Psytrance e Hardstyle.",
        biases: { tension: 1.1, leap: 1.3, step: 0.9, density: 1.5, rest: 0.3, direction: 0.0, motif: 0.9 }
    },
    experimental: {
        name: "IDM / Experimental",
        description: "Grooves síncopados, saltos imprevisíveis e tensão controlada.",
        biases: { tension: 1.4, leap: 1.6, step: 0.6, density: 1.1, rest: 1.4, direction: 0.0, motif: 0.5 }
    },
    cinematic: {
        name: "Ambient / Cinematic",
        description: "Desenvolvimento progressivo, notas sustentadas e tensão contínua.",
        biases: { tension: 1.2, leap: 1.3, step: 1.0, density: 0.6, rest: 1.2, direction: 0.2, motif: 0.8 }
    },
    minimalist: {
        name: "Minimal Techno",
        description: "Poucos elementos, forte repetição e extrema importância no silêncio (Groove espacial).",
        biases: { tension: 0.8, leap: 0.5, step: 1.0, density: 0.3, rest: 2.5, direction: 0.0, motif: 1.5 }
    }
};

export function getPersonality(name) {
    return PERSONALITIES[name] || PERSONALITIES.neutral;
}
