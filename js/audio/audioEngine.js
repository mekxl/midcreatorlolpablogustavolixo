/**
 * Motor de Áudio (Audio Engine).
 * Gerencia o AudioContext, agendamento de notas (Lookahead) e controle de Playhead.
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
        this.lookahead = 25.0; 
        this.scheduleAheadTime = 0.1; 
        
        this.nextNoteTime = 0.0;
        this.melodyIndex = 0;
        this.bassIndex = 0;
        
        this.melodyData = null;
        this.activeOscillators = [];

        // Variáveis para controle do Playhead
        this.startContextTime = 0;
        this.pausedAtBeat = 0;

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
        
        const now = this.context.currentTime;
        this.synthGain.gain.setTargetAtTime(synthVol, now, 0.05);
        this.bassGain.gain.setTargetAtTime(bassVol, now, 0.05);
    }

    // Calcula a posição atual em tempos musicais (beats) para o Piano Roll
    getCurrentBeat() {
        if (!this.context || !this.melodyData) return 0;
        if (appState.get().isPaused) return this.pausedAtBeat;
        if (!appState.get().isPlaying) return 0;

        const secondsElapsed = this.context.currentTime - this.startContextTime;
        const beatsElapsed = secondsElapsed * (this.melodyData.tempo / 60.0);
        return Math.max(0, beatsElapsed);
    }

    play(melodyData) {
        this.initContext();
        this.stop(); 
        
        this.melodyData = melodyData;
        
        // Define o tempo de início para os cálculos
        this.startContextTime = this.context.currentTime + 0.1;
        this.nextNoteTime = this.startContextTime; 
        
        this.melodyIndex = 0;
        this.bassIndex = 0;
        this.pausedAtBeat = 0;

        appState.set({ isPlaying: true, isPaused: false });
        this.scheduler();
    }

    pause() {
        if (!this.context || !appState.get().isPlaying) return;
        this.pausedAtBeat = this.getCurrentBeat();
        this.context.suspend();
        appState.set({ isPaused: true });
    }

    resume() {
        if (!this.context || !appState.get().isPaused) return;
        
        // Reajusta a âncora de tempo baseado em onde pausamos
        const secondsElapsed = this.pausedAtBeat / (this.melodyData.tempo / 60.0);
        this.startContextTime = this.context.currentTime - secondsElapsed;
        
        this.context.resume();
        appState.set({ isPaused: false });
    }

    stop() {
        if (this.scheduleTimer) {
            clearTimeout(this.scheduleTimer);
            this.scheduleTimer = null;
        }

        this.activeOscillators.forEach(node => {
            try { node.osc.stop(); } catch (e) {}
            try { node.osc.disconnect(); } catch (e) {}
            try { node.gainNode.disconnect(); } catch (e) {}
        });
        this.activeOscillators = [];

        this.pausedAtBeat = 0;

        if (this.context && this.context.state === 'suspended') {
            this.context.resume(); 
        }

        appState.set({ isPlaying: false, isPaused: false });
    }

    scheduler() {
        if (!appState.get().isPlaying || appState.get().isPaused) {
            if (appState.get().isPaused) {
                this.scheduleTimer = setTimeout(() => this.scheduler(), this.lookahead);
            }
            return;
        }

        const secondsPerBeat = 60.0 / this.melodyData.tempo;
        
        while (this.melodyIndex < this.melodyData.notes.length) {
            const note = this.melodyData.notes[this.melodyIndex];
            const noteAbsoluteTime = this.startContextTime + (note.startTime * secondsPerBeat);
            
            if (noteAbsoluteTime < this.context.currentTime + this.scheduleAheadTime) {
                if (!note.isRest) {
                    const durationInSeconds = note.duration * secondsPerBeat;
                    const nodes = playSawNote(this.context, this.synthGain, note.midi, noteAbsoluteTime, durationInSeconds, note.velocity);
                    this.activeOscillators.push(nodes);
                }
                this.melodyIndex++;
            } else {
                break;
            }
        }

        while (this.bassIndex < this.melodyData.bassNotes.length) {
            const note = this.melodyData.bassNotes[this.bassIndex];
            const noteAbsoluteTime = this.startContextTime + (note.startTime * secondsPerBeat);
            
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

        this.activeOscillators = this.activeOscillators.filter(node => 
            node.osc.context.currentTime < node.osc.context.currentTime + 10 
        );

        if (this.melodyIndex >= this.melodyData.notes.length && this.bassIndex >= this.melodyData.bassNotes.length) {
            const totalDurationSecs = this.melodyData.totalDurationBeats * secondsPerBeat;
            const finishTime = this.startContextTime + totalDurationSecs;
            
            if (this.context.currentTime > finishTime) {
                if (appState.get().loop) {
                    this.play(this.melodyData); 
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
