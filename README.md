# Melody Lab | Electronic Music Generator

Uma ferramenta web imersiva e responsiva (100% Client-Side) para geração procedural e experimentação de melodias focadas em **Música Eletrônica (EDM, Techno, House, Synthwave, Trance)**.

O Melody Lab não é um gerador acadêmico genérico. Ele é uma ferramenta criativa projetada para entregar **Hooks, Leads e Basslines** com *groove*, *loopability* perfeita e estrutura musical coerente para o fluxo de trabalho de produtores eletrônicos.

## Funcionalidades Principais
- **Geração Procedural (Heurística Eletrônica)**: Define notas baseadas em tensão harmônica, saltos e identidades musicais como "Dark Synthwave", "EDM Hook", "Minimal Techno", evitando aleatoriedade caótica.
- **Harmonia e Bassline**: Geração automática de progressões e linhas de baixo contextualizadas (Pad, Offbeat House, Rolling 16ths Techno).
- **Mutações**: Altere apenas o ritmo, a tensão, o final do loop ou a complexidade de uma melodia existente, sem perder a ideia original.
- **Piano Roll Interativo**: Edite notas graficamente em tempo real. O áudio, o estado e o histórico acompanham a edição simultaneamente.
- **Synth Preview (Web Audio API)**: Motores de sintetizador integrados (Pluck Lead, Acid Bass com Lowpass Filters) para pré-visualização instantânea do timbre real da ideia.
- **Exportação MIDI Multitrack**: Baixe um arquivo `.mid` nativo com pistas separadas para Melodia, Baixo e Harmonia.
- **Presets e Biblioteca Local**: Salve suas configurações ou melodias geradas no navegador (LocalStorage).

## Tecnologias e Arquitetura
- **HTML5, CSS3, JavaScript (ES6 Modules)**.
- **Web Audio API** para reprodução e envelopes.
- **Canvas API** para altíssimo desempenho a 60 FPS no Piano Roll.
- **Nenhum Backend**: Roda totalmente no navegador. Sem dependências NPM, sem necessidade de banco de dados.

Toma no cu, Gustavo.

