/**
 * Generador de música retro estilo chiptune para Tetris
 * Usa Web Audio API para generar música programáticamente
 */
export class RetroMusic {
  constructor(scene) {
    this.scene = scene;
    this.audioContext = null;
    this.oscillators = [];
    this.isPlaying = false;
    this.currentNoteIndex = 0;
    this.notes = [];
    this.tempo = 120; // BPM
    this.noteDuration = 0.5; // segundos
    
    // Melodía tipo Tetris (Korobeiniki)
    // Notas en formato: [frecuencia, duración]
    this.melody = [
      // Frase 1
      [440, 0.25], [493.88, 0.25], [523.25, 0.25], [493.88, 0.25],
      [440, 0.25], [493.88, 0.25], [523.25, 0.5],
      [493.88, 0.25], [440, 0.25], [493.88, 0.25], [523.25, 0.5],
      [493.88, 0.25], [440, 0.25], [493.88, 0.25], [523.25, 0.5],
      
      // Frase 2
      [392, 0.25], [440, 0.25], [493.88, 0.25], [440, 0.25],
      [392, 0.25], [440, 0.25], [493.88, 0.5],
      [440, 0.25], [392, 0.25], [440, 0.25], [493.88, 0.5],
      [440, 0.25], [392, 0.25], [440, 0.25], [493.88, 0.5],
      
      // Frase 3
      [349.23, 0.25], [392, 0.25], [440, 0.25], [392, 0.25],
      [349.23, 0.25], [392, 0.25], [440, 0.5],
      [392, 0.25], [349.23, 0.25], [392, 0.25], [440, 0.5],
      [392, 0.25], [349.23, 0.25], [392, 0.25], [440, 0.5],
      
      // Frase 4
      [329.63, 0.25], [349.23, 0.25], [392, 0.25], [349.23, 0.25],
      [329.63, 0.25], [349.23, 0.25], [392, 0.5],
      [349.23, 0.25], [329.63, 0.25], [349.23, 0.25], [392, 0.5],
      [349.23, 0.25], [329.63, 0.25], [349.23, 0.25], [392, 1.0],
    ];
    
    this.bassLine = [
      [220, 0.5], [220, 0.5], [196, 0.5], [196, 0.5],
      [174.61, 0.5], [174.61, 0.5], [164.81, 0.5], [164.81, 0.5],
    ];
  }

  init() {
    try {
      // Crear AudioContext (compatible con navegadores modernos)
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();
    } catch (error) {
      console.warn('Web Audio API no disponible:', error);
      return false;
    }
    return true;
  }

  play() {
    if (this.isPlaying) return;
    
    try {
      if (!this.audioContext) {
        if (!this.init()) {
          return;
        }
      }
      
      // Si el contexto está suspendido (requiere interacción del usuario), intentar reanudarlo
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {
          // Si falla al reanudar, no reproducir música
          return;
        });
      }
      
      if (!this.audioContext) {
        return;
      }
      
      this.isPlaying = true;
      this.currentNoteIndex = 0;
      this.playMelody();
      this.playBass();
    } catch (error) {
      console.warn('Error al reproducir música:', error);
      this.isPlaying = false;
    }
  }

  stop() {
    try {
      this.isPlaying = false;
      this.oscillators.forEach(osc => {
        try {
          if (osc && typeof osc.stop === 'function') {
            osc.stop();
          }
          if (osc && typeof osc.disconnect === 'function') {
            osc.disconnect();
          }
        } catch (e) {
          // Ignorar errores al detener osciladores individuales
        }
      });
      this.oscillators = [];
    } catch (error) {
      // Ignorar errores al detener música
      this.isPlaying = false;
      this.oscillators = [];
    }
  }

  playMelody() {
    if (!this.isPlaying) return;
    
    // Verificar que la escena esté disponible
    if (!this.scene || !this.scene.time) {
      this.isPlaying = false;
      return;
    }
    
    // Verificar que el contexto de audio esté activo
    if (!this.audioContext) {
      this.isPlaying = false;
      return;
    }
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        this.playMelody();
      }).catch(() => {
        // Si falla, intentar de nuevo más tarde
        if (this.scene && this.scene.time) {
          this.scene.time.delayedCall(100, () => {
            if (this.isPlaying) {
              this.playMelody();
            }
          });
        }
      });
      return;
    }
    
    const note = this.melody[this.currentNoteIndex % this.melody.length];
    const [frequency, duration] = note;
    
    try {
      // Crear oscilador para la melodía (onda cuadrada para sonido retro)
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      
      // Envelope ADSR simple para sonido más suave
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.25, now + 0.01);
      gainNode.gain.linearRampToValueAtTime(0.15, now + duration * 0.7);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start(now);
      oscillator.stop(now + duration);
      
      this.oscillators.push(oscillator);
      
      // Programar siguiente nota
      this.currentNoteIndex++;
      const nextNoteTime = duration * 1000; // convertir a ms
      
      if (this.scene && this.scene.time) {
        this.scene.time.delayedCall(nextNoteTime, () => {
          if (this.isPlaying) {
            this.playMelody();
          }
        });
      }
    } catch (error) {
      console.warn('Error al reproducir melodía:', error);
      // Intentar continuar con la siguiente nota solo si la escena está disponible
      this.currentNoteIndex++;
      if (this.scene && this.scene.time) {
        this.scene.time.delayedCall(duration * 1000, () => {
          if (this.isPlaying) {
            this.playMelody();
          }
        });
      } else {
        this.isPlaying = false;
      }
    }
  }

  playBass() {
    if (!this.isPlaying) return;
    
    // Verificar que la escena esté disponible
    if (!this.scene || !this.scene.time) {
      this.isPlaying = false;
      return;
    }
    
    // Verificar que el contexto de audio esté activo
    if (!this.audioContext) {
      this.isPlaying = false;
      return;
    }
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        this.playBass();
      }).catch(() => {
        if (this.scene && this.scene.time) {
          this.scene.time.delayedCall(100, () => {
            if (this.isPlaying) {
              this.playBass();
            }
          });
        }
      });
      return;
    }
    
    const bassIndex = Math.floor(this.currentNoteIndex / 2) % this.bassLine.length;
    const [frequency, duration] = this.bassLine[bassIndex];
    
    try {
      // Crear oscilador para el bajo (onda triangular)
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      
      // Envelope para el bajo
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.01);
      gainNode.gain.linearRampToValueAtTime(0.1, now + duration * 0.8);
      gainNode.gain.linearRampToValueAtTime(0, now + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start(now);
      oscillator.stop(now + duration);
      
      this.oscillators.push(oscillator);
      
      // Programar siguiente nota de bajo
      if (this.scene && this.scene.time) {
        this.scene.time.delayedCall(duration * 1000, () => {
          if (this.isPlaying) {
            this.playBass();
          }
        });
      }
    } catch (error) {
      console.warn('Error al reproducir bajo:', error);
      // Intentar continuar solo si la escena está disponible
      if (this.scene && this.scene.time) {
        this.scene.time.delayedCall(duration * 1000, () => {
          if (this.isPlaying) {
            this.playBass();
          }
        });
      } else {
        this.isPlaying = false;
      }
    }
  }
}

