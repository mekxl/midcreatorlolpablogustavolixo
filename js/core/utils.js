/**
 * Utilitários gerais do sistema.
 * Inclui gerador de números pseudoaleatórios (PRNG) com suporte a seed.
 */

export class PRNG {
    constructor(seed) {
        // Gerador Linear Congruente simples
        this.seed = seed % 2147483647;
        if (this.seed <= 0) this.seed += 2147483646;
    }

    next() {
        this.seed = (this.seed * 16807) % 2147483647;
        return this.seed;
    }

    nextFloat() {
        return (this.next() - 1) / 2147483646;
    }

    // Retorna número inteiro entre min e max (inclusivo)
    range(min, max) {
        return Math.floor(this.nextFloat() * (max - min + 1)) + min;
    }

    // Escolhe um elemento aleatório de um array
    choice(array) {
        if (!array || array.length === 0) return null;
        return array[this.range(0, array.length - 1)];
    }

    // Escolhe considerando pesos. array e weights devem ter o mesmo tamanho.
    weightedChoice(array, weights) {
        let total = weights.reduce((sum, weight) => sum + weight, 0);
        let randomValue = this.nextFloat() * total;
        for (let i = 0; i < array.length; i++) {
            randomValue -= weights[i];
            if (randomValue <= 0) {
                return array[i];
            }
        }
        return array[array.length - 1];
    }
}
