/**
 * Motor visual e interativo do Piano Roll utilizando HTML5 Canvas.
 * Permite visualização e edição direta dos dados musicais no estado global.
 */
import { appState } from '../core/state.js';
import { audioEngine } from '../audio/audioEngine.js';
import { midiToNote } from '../music/notes.js';

class PianoRoll {
    constructor() {
        this.viewport = document.getElementById('pr-viewport');
        this.sizer = document.getElementById('pr-sizer');
        this.canvas = document.getElementById('pr-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Configurações da UI
        this.keyboardWidth = 60;
        this.zoomX = 100; // pixels por tempo (beat)
        this.zoomY = 20;  // pixels por semitom
        this.snapBeats = 0.25; // Quantização padrão (1/16)
        
        // Estado Interno
        this.melodyData = null;
        this.scrollX = 0;
        this.scrollY = 0;
        this.selectedNoteIndex = -1;
        
        // Controle de Arrastar/Redimensionar
        this.dragState = 'none'; // 'none', 'move', 'resize'
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragOriginalNote = null;

        // Binds
        this.initControls();
        this.initCanvasEvents();
        
        // Observador de Redimensionamento do Viewport
        new ResizeObserver(() => this.resizeCanvas()).observe(this.viewport);
        
        // Observa o scroll do viewport
        this.viewport.addEventListener('scroll', () => {
            this.scrollX = this.viewport.scrollLeft;
            this.scrollY = this.viewport.scrollTop;
        });

        // Inscreve no Estado Global
        appState.subscribe(state => {
            if (state.hasMelody && state.melodyData) {
                const needsRecalculate = this.melodyData !== state.melodyData;
                this.melodyData = state.melodyData;
                if (needsRecalculate) {
                    this.updateSizer();
                    this.centerScrollOnMelody();
                }
            } else {
                this.melodyData = null;
            }
        });

        // Inicia o Loop de Renderização (60fps)
        this.renderLoop = this.renderLoop.bind(this);
        requestAnimationFrame(this.renderLoop);
    }

    initControls() {
        document.getElementById('pr-snap').addEventListener('change', e => {
            this.snapBeats = parseFloat(e.target.value);
        });
        document.getElementById('btn-zoom-x-in').addEventListener('click', () => { this.zoomX = Math.min(200, this.zoomX + 20); this.updateSizer(); });
        document.getElementById('btn-zoom-x-out').addEventListener('click', () => { this.zoomX = Math.max(40, this.zoomX - 20); this.updateSizer(); });
        document.getElementById('btn-zoom-y-in').addEventListener('click', () => { this.zoomY = Math.min(40, this.zoomY + 4); this.updateSizer(); });
        document.getElementById('btn-zoom-y-out').addEventListener('click', () => { this.zoomY = Math.max(12, this.zoomY - 4); this.updateSizer(); });

        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            const tag = e.target.tagName;
            if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

            if (e.code === 'Delete' || e.code === 'Backspace') {
                this.deleteSelectedNote();
            }
        });
    }

    initCanvasEvents() {
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mousemove', this.updateCursor.bind(this));
    }

    resizeCanvas() {
        // Canvas assume exatamente o tamanho visível do viewport (Sticky Canvas Pattern)
        this.canvas.width = this.viewport.clientWidth;
        this.canvas.height = this.viewport.clientHeight;
    }

    updateSizer() {
        if (!this.melodyData) return;
        const totalBeats = this.melodyData.bars * 4;
        const totalWidth = (totalBeats * this.zoomX) + this.keyboardWidth;
        const totalHeight = 128 * this.zoomY;
        
        this.sizer.style.width = `${totalWidth}px`;
        this.sizer.style.height = `${totalHeight}px`;
    }

    centerScrollOnMelody() {
        if (!this.melodyData || this.melodyData.notes.length === 0) return;
        
        let sumMidi = 0;
        this.melodyData.notes.forEach(n => sumMidi += n.midi);
        const avgMidi = sumMidi / this.melodyData.notes.length;
        
        const targetY = ((127 - avgMidi) * this.zoomY) - (this.viewport.clientHeight / 2);
        this.viewport.scrollTop = Math.max(0, targetY);
        this.viewport.scrollLeft = 0;
    }

    // --- INTERAÇÕES ---

    getCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const realX = mouseX + this.scrollX;
        const realY = mouseY + this.scrollY;
        
        const beat = Math.max(0, (realX - this.keyboardWidth) / this.zoomX);
        const midi = 127 - Math.floor(realY / this.zoomY);

        return { mouseX, mouseY, realX, realY, beat, midi };
    }

    getNoteAt(beat, midi) {
        if (!this.melodyData) return -1;
        for (let i = this.melodyData.notes.length - 1; i >= 0; i--) {
            const note = this.melodyData.notes[i];
            if (note.isRest) continue;
            if (midi === note.midi && beat >= note.startTime && beat <= note.startTime + note.duration) {
                return i;
            }
        }
        return -1;
    }

    updateCursor(e) {
        if (this.dragState !== 'none') return;
        
        const { mouseX, beat, midi } = this.getCoords(e);
        if (mouseX < this.keyboardWidth) {
            this.canvas.style.cursor = 'default';
            return;
        }

        const noteIdx = this.getNoteAt(beat, midi);
        if (noteIdx !== -1) {
            const note = this.melodyData.notes[noteIdx];
            const noteEndX = (note.startTime + note.duration) * this.zoomX + this.keyboardWidth;
            // Se estiver nos últimos 8 pixels da nota, cursor de resize
            if (mouseX + this.scrollX > noteEndX - 8) {
                this.canvas.style.cursor = 'ew-resize';
            } else {
                this.canvas.style.cursor = 'pointer';
            }
        } else {
            this.canvas.style.cursor = 'crosshair';
        }
    }

    onMouseDown(e) {
        if (!this.melodyData) return;
        const { mouseX, beat, midi } = this.getCoords(e);
        
        // Ignora clique no teclado
        if (mouseX < this.keyboardWidth) return;

        const noteIdx = this.getNoteAt(beat, midi);
        
        if (noteIdx !== -1) {
            this.selectedNoteIndex = noteIdx;
            const note = this.melodyData.notes[noteIdx];
            const noteEndX = (note.startTime + note.duration) * this.zoomX + this.keyboardWidth;
            
            this.dragOriginalNote = { ...note };
            this.dragStartX = beat;
            this.dragStartY = midi;

            if (mouseX + this.scrollX > noteEndX - 8) {
                this.dragState = 'resize';
            } else {
                this.dragState = 'move';
            }
        } else {
            // Criação de nova nota
            const snappedBeat = Math.floor(beat / this.snapBeats) * this.snapBeats;
            const newNote = {
                midi: midi,
                noteName: midiToNote(midi).fullName,
                octave: midiToNote(midi).octave,
                startTime: snappedBeat,
                duration: this.snapBeats * 4, // 1 tempo por padrão
                velocity: 90,
                isRest: false
            };
            this.melodyData.notes.push(newNote);
            this.selectedNoteIndex = this.melodyData.notes.length - 1;
            this.commitChanges();
        }
    }

    onMouseMove(e) {
        if (this.dragState === 'none' || this.selectedNoteIndex === -1) return;
        
        const { beat, midi } = this.getCoords(e);
        const note = this.melodyData.notes[this.selectedNoteIndex];

        if (this.dragState === 'move') {
            const deltaBeat = beat - this.dragStartX;
            const deltaMidi = midi - this.dragStartY;
            
            let newStart = this.dragOriginalNote.startTime + deltaBeat;
            newStart = Math.floor(newStart / this.snapBeats) * this.snapBeats;
            newStart = Math.max(0, newStart);
            
            let newMidi = this.dragOriginalNote.midi + deltaMidi;
            newMidi = Math.max(0, Math.min(127, newMidi));

            note.startTime = newStart;
            note.midi = newMidi;
            note.noteName = midiToNote(newMidi).fullName;
            note.octave = midiToNote(newMidi).octave;
        } 
        else if (this.dragState === 'resize') {
            let newDuration = beat - note.startTime;
            newDuration = Math.round(newDuration / this.snapBeats) * this.snapBeats;
            note.duration = Math.max(this.snapBeats, newDuration);
        }
    }

    onMouseUp(e) {
        if (this.dragState !== 'none') {
            this.dragState = 'none';
            this.commitChanges();
        }
    }

    deleteSelectedNote() {
        if (this.selectedNoteIndex !== -1 && this.melodyData) {
            this.melodyData.notes.splice(this.selectedNoteIndex, 1);
            this.selectedNoteIndex = -1;
            this.commitChanges();
        }
    }

    commitChanges() {
        // Envia os dados atualizados para o State Central.
        // Isso fará o Audio e o Export trabalharem com a nova versão.
        appState.set({ melodyData: this.melodyData });
    }

    // --- RENDERIZAÇÃO ---

    isBlackKey(midi) {
        const noteClass = midi % 12;
        return [1, 3, 6, 8, 10].includes(noteClass);
    }

    renderLoop() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        this.ctx.clearRect(0, 0, w, h);
        
        // Fundo principal
        this.ctx.fillStyle = '#1e1e1e';
        this.ctx.fillRect(0, 0, w, h);

        if (!this.melodyData) {
            this.ctx.fillStyle = '#9e9e9e';
            this.ctx.font = '14px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Gere uma melodia para visualizar o Piano Roll', w/2, h/2);
            requestAnimationFrame(this.renderLoop);
            return;
        }

        this.ctx.save();
        
        // Move contexto baseado no scroll (para o grid e notas)
        this.ctx.translate(-this.scrollX, -this.scrollY);

        // 1. GRID
        const totalBeats = this.melodyData.bars * 4;
        
        // Linhas Horizontais (Notas)
        this.ctx.beginPath();
        for (let i = 0; i <= 128; i++) {
            const y = i * this.zoomY;
            // Apenas desenha se estiver visível
            if (y >= this.scrollY && y <= this.scrollY + h) {
                const isBlack = this.isBlackKey(127 - i);
                this.ctx.fillStyle = isBlack ? '#151515' : '#1e1e1e';
                this.ctx.fillRect(this.keyboardWidth + this.scrollX, y, w, this.zoomY);
                this.ctx.moveTo(this.keyboardWidth + this.scrollX, y);
                this.ctx.lineTo(this.keyboardWidth + this.scrollX + w, y);
            }
        }
        this.ctx.strokeStyle = '#2a2a2a';
        this.ctx.stroke();

        // Linhas Verticais (Tempo)
        this.ctx.beginPath();
        for (let b = 0; b <= totalBeats; b += this.snapBeats) {
            const x = this.keyboardWidth + (b * this.zoomX);
            if (x >= this.scrollX && x <= this.scrollX + w) {
                this.ctx.moveTo(x, this.scrollY);
                this.ctx.lineTo(x, this.scrollY + h);
            }
        }
        this.ctx.strokeStyle = '#333';
        this.ctx.stroke();
        
        // Linhas de Compasso e Tempos Principais
        this.ctx.beginPath();
        for (let b = 0; b <= totalBeats; b++) {
            const x = this.keyboardWidth + (b * this.zoomX);
            if (x >= this.scrollX && x <= this.scrollX + w) {
                this.ctx.moveTo(x, this.scrollY);
                this.ctx.lineTo(x, this.scrollY + h);
            }
        }
        this.ctx.strokeStyle = '#555';
        this.ctx.stroke();

        // 2. NOTAS
        this.melodyData.notes.forEach((note, index) => {
            if (note.isRest) return;
            
            const x = this.keyboardWidth + (note.startTime * this.zoomX);
            const y = (127 - note.midi) * this.zoomY;
            const width = note.duration * this.zoomX;
            const height = this.zoomY;
            
            // Desenha apenas se estiver na área visível
            if (x + width > this.scrollX && x < this.scrollX + w && y + height > this.scrollY && y < this.scrollY + h) {
                
                // Simulação de velocity na cor
                const alpha = 0.5 + (note.velocity / 127) * 0.5;
                
                if (index === this.selectedNoteIndex) {
                    this.ctx.fillStyle = `rgba(0, 242, 254, ${alpha})`;
                    this.ctx.strokeStyle = '#ffffff';
                    this.ctx.lineWidth = 2;
                } else {
                    this.ctx.fillStyle = `rgba(41, 121, 255, ${alpha})`;
                    this.ctx.strokeStyle = '#1e1e1e';
                    this.ctx.lineWidth = 1;
                }

                this.ctx.fillRect(x, y, width, height);
                this.ctx.strokeRect(x, y, width, height);
            }
        });

        // 3. PLAYHEAD
        const currentBeat = audioEngine.getCurrentBeat();
        const playheadX = this.keyboardWidth + (currentBeat * this.zoomX);
        
        if (playheadX >= this.scrollX && playheadX <= this.scrollX + w) {
            this.ctx.beginPath();
            this.ctx.moveTo(playheadX, this.scrollY);
            this.ctx.lineTo(playheadX, this.scrollY + h);
            this.ctx.strokeStyle = '#00f2fe';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        this.ctx.restore();

        // 4. TECLADO (Fixo na esquerda, rola apenas no Y)
        this.ctx.save();
        this.ctx.translate(0, -this.scrollY);
        
        for (let i = 0; i < 128; i++) {
            const y = i * this.zoomY;
            if (y >= this.scrollY && y <= this.scrollY + h) {
                const midi = 127 - i;
                const isBlack = this.isBlackKey(midi);
                
                this.ctx.fillStyle = isBlack ? '#121212' : '#f0f0f0';
                this.ctx.fillRect(0, y, this.keyboardWidth, this.zoomY);
                this.ctx.strokeStyle = '#333';
                this.ctx.strokeRect(0, y, this.keyboardWidth, this.zoomY);

                // Mostra o nome apenas na nota C, se houver espaço
                if (midi % 12 === 0 && this.zoomY >= 14) {
                    this.ctx.fillStyle = '#121212';
                    this.ctx.font = '10px sans-serif';
                    this.ctx.textAlign = 'right';
                    this.ctx.fillText(`C${Math.floor(midi/12)-1}`, this.keyboardWidth - 4, y + this.zoomY - 4);
                }
            }
        }
        this.ctx.restore();

        requestAnimationFrame(this.renderLoop);
    }
}

export const pianoRollInstance = new PianoRoll();
