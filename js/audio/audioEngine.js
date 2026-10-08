/**
 * Motor de Áudio (Audio Engine).
 * Gerencia o AudioContext, agendamento de notas (Lookahead) e volumes.
 */
import { appState } from '../core/state.js';
import { playSawNote } from './sawSynth.js';
import { playBassNote } from './bassSynth.js';

class AudioEngine {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.synthGain = null;
        this.bassGain = null;
        
        this.scheduleTimer = null;
        this.lookahead = 25.0; // milissegundos
        this.scheduleAheadTime = 0.1; // segundos
        
        this.nextNoteTime = 0.0;
        this.melodyIndex = 0;
        this.bassIndex = 0;
        
        this.melodyData = null;
        this.activeOscillators = [];

        // Inscreve-se no estado para atualizar os volumes em tempo real
        appState.subscribe(this.onStateChange.bind(this));
    }

    initContext() {
        if (!this.context) {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.synthGain = this.context.createGain();
            this.bassGain = this.context.createGain();

            this.synthGain.connect(this.masterGain);
            this.bassGain.connect(this.masterGain);
            this.masterGain.connect(this.context.destination);

            this.updateVolumes(appState.get());
        }
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    onStateChange(state) {
        if (this.context) {
            this.updateVolumes(state);
        }
    }

    updateVolumes(state) {
        if (!this.synthGain || !this.bassGain) return;
        
        const synthVol = state.synthEnabled ? (state.volumeSynth / 100) : 0;
        const bassVol = state.bassEnabled ? (state.volumeBass / 100) : 0;
        
        // Suaviza a transição de volume para não gerar cliques
        const now = this.context.currentTime;
        this.synthGain.gain.setTargetAtTime(synthVol, now, 0.05);
        this.bassGain.gain.setTargetAtTime(bassVol, now, 0.05);
    }

    play(melodyData) {
        this.initContext();
        this.stop(); // Garante limpeza da execução anterior
        
        this.melodyData = melodyData;
        this.nextNoteTime = this.context.currentTime + 0.1; // Começa em 100ms
        this.melodyIndex = 0;
        this.bassIndex = 0;

        appState.set({ isPlaying: true, isPaused: false });
        this.scheduler();
    }

    pause() {
        if (!this.context || !appState.get().isPlaying) return;
        this.context.suspend();
        appState.set({ isPaused: true });
    }

    resume() {
        if (!this.context || !appState.get().isPaused) return;
        this.context.resume();
        appState.set({ isPaused: false });
    }

    stop() {
        if (this.scheduleTimer) {
            clearTimeout(this.scheduleTimer);
            this.scheduleTimer = null;
        }

        // Para os osciladores em andamento
        this.activeOscillators.forEach(node => {
            try { node.osc.stop(); } catch (e) {}
            try { node.osc.disconnect(); } catch (e) {}
            try { node.gainNode.disconnect(); } catch (e) {}
        });
        this.activeOscillators = [];

        if (this.context && this.context.state === 'suspended') {
            this.context.resume(); // Acorda o contexto para ele processar as paradas
        }

        appState.set({ isPlaying: false, isPaused: false });
    }

    scheduler() {
        if (!appState.get().isPlaying || appState.get().isPaused) {
            if (appState.get().isPaused) {
                // Se pausou, mantém o loop vivo verificando quando voltar
                this.scheduleTimer = setTimeout(() => this.scheduler(), this.lookahead);
            }
            return;
        }

        const secondsPerBeat = 60.0 / this.melodyData.tempo;
        
        // Enquanto as notas estiverem dentro da janela de agendamento, envia para a placa de som
        while (this.melodyIndex < this.melodyData.notes.length) {
            const note = this.melodyData.notes[this.melodyIndex];
            const noteAbsoluteTime = this.nextNoteTime + (note.startTime * secondsPerBeat);
            
            if (noteAbsoluteTime < this.context.currentTime + this.scheduleAheadTime) {
                if (!note.isRest) {
                    const durationInSeconds = note.duration * secondsPerBeat;
                    const nodes = playSawNote(this.context, this.synthGain, note.midi, noteAbsoluteTime, durationInSeconds, note.velocity);
                    this.activeOscillators.push(nodes);
                }
                this.melodyIndex++;
            } else {
                break; // A nota ainda está longe
            }
        }

        while (this.bassIndex < this.melodyData.bassNotes.length) {
            const note = this.melodyData.bassNotes[this.bassIndex];
            const noteAbsoluteTime = this.nextNoteTime + (note.startTime * secondsPerBeat);
            
            if (noteAbsoluteTime < this.context.currentTime + this.scheduleAheadTime) {
                if (!note.isRest) {
                    const durationInSeconds = note.duration * secondsPerBeat;
                    const nodes = playBassNote(this.context, this.bassGain, note.midi, noteAbsoluteTime, durationInSeconds, note.velocity);
                    this.activeOscillators.push(nodes);
                }
                this.bassIndex++;
            } else {
                break;
            }
        }

        // Limpeza de memória de osciladores finalizados
        this.activeOscillators = this.activeOscillators.filter(node => 
            node.osc.context.currentTime < node.osc.context.currentTime + 10 // Mantém na lista por um tempo de sobra
        );

        // Verifica fim da música
        if (this.melodyIndex >= this.melodyData.notes.length && this.bassIndex >= this.melodyData.bassNotes.length) {
            const totalDurationSecs = this.melodyData.totalDurationBeats * secondsPerBeat;
            const finishTime = this.nextNoteTime + totalDurationSecs;
            
            if (this.context.currentTime > finishTime) {
                if (appState.get().loop) {
                    this.play(this.melodyData); // Reinicia
                } else {
                    this.stop();
                }
                return;
            }
        }

        this.scheduleTimer = setTimeout(() => this.scheduler(), this.lookahead);
    }
}

export const audioEngine = new AudioEngine();
