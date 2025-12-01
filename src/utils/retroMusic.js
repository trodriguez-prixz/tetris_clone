/**
 * Generador de música retro estilo chiptune para Tetris
 * Usa Web Audio API para generar música programáticamente
 * Incluye múltiples canciones con transiciones suaves
 */
export class RetroMusic {
  constructor(scene) {
    this.scene = scene;
    this.audioContext = null;
    this.oscillators = [];
    this.isPlaying = false;
    this.isPaused = false;
    this.currentSongIndex = 0;
    this.currentNoteIndex = 0;
    this.masterGain = null;
    
    // Playlist de canciones
    this.songs = this.createSongs();
    this.currentSong = this.songs[0];
    
    // Duración de cada canción en segundos (calculada)
    this.songDurations = this.calculateSongDurations();
    
    this.transitionTime = 2.5;
  }

  createSongs() {
    const korobeinikiMelody = [
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
    
    const korobeinikiBass = [
      [220, 0.5], [220, 0.5], [196, 0.5], [196, 0.5],
      [174.61, 0.5], [174.61, 0.5], [164.81, 0.5], [164.81, 0.5],
    ];
    
    return [
      {
        name: 'Korobeiniki (Tetris Theme)',
        melody: korobeinikiMelody,
        bassLine: korobeinikiBass,
        loops: 1
      }
    ];
  }

  calculateSongDurations() {
    return this.songs.map(song => {
      const melodyDuration = song.melody.reduce((sum, note) => sum + note[1], 0);
      const bassDuration = song.bassLine.reduce((sum, note) => sum + note[1], 0);
      return Math.max(melodyDuration, bassDuration);
    });
  }

  init() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();
      
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
      this.masterGain.connect(this.audioContext.destination);
      
      return true;
    } catch (error) {
      console.warn('Web Audio API no disponible:', error);
      return false;
    }
  }

  play() {
    if (this.isPlaying) return;
    
    try {
      if (!this.audioContext) {
        if (!this.init()) {
          return;
        }
      }
      
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }
      
      if (!this.audioContext) return;
      
      this.isPlaying = true;
      this.currentNoteIndex = 0;
      this.currentSong = this.songs[this.currentSongIndex];
      
      const now = this.audioContext.currentTime;
      this.masterGain.gain.setValueAtTime(0.15, now);
      
      this.playMelody();
      this.playBass();
      this.scheduleNextSong();
    } catch (error) {
      console.warn('Error al reproducir música:', error);
      this.isPlaying = false;
    }
  }

  scheduleNextSong() {
    if (!this.isPlaying || this.isPaused || !this.scene || !this.scene.time) return;
    
    if (this.songs.length === 1) {
      const currentDuration = this.songDurations[0];
      if (this.scene && this.scene.time) {
        this.scene.time.delayedCall(currentDuration * 1000, () => {
          if (this.isPlaying) {
            this.currentNoteIndex = 0;
            this.scheduleNextSong();
          }
        });
      }
      return;
    }
    
    const currentDuration = this.songDurations[this.currentSongIndex];
    const transitionStart = Math.max(0, currentDuration - this.transitionTime);
    
    if (this.scene && this.scene.time) {
      this.scene.time.delayedCall(transitionStart * 1000, () => {
        if (this.isPlaying) {
          this.fadeOut();
        }
      });
      
      this.scene.time.delayedCall(currentDuration * 1000, () => {
        if (this.isPlaying) {
          this.nextSong();
        }
      });
    }
  }

  fadeOut() {
    if (!this.masterGain || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    const currentGain = this.masterGain.gain.value;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(currentGain, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.01, now + this.transitionTime);
  }

  fadeIn() {
    if (!this.masterGain || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0.01, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.15, now + this.transitionTime);
  }

  nextSong() {
    if (!this.isPlaying) return;
    
    // Si solo hay una canción, simplemente reiniciarla sin fade
    if (this.songs.length === 1) {
      this.currentNoteIndex = 0;
      this.currentSong = this.songs[0];
      return;
    }
    
    // Detener osciladores actuales
    this.oscillators.forEach(osc => {
      try {
        if (osc && typeof osc.stop === 'function') {
          osc.stop();
        }
        if (osc && typeof osc.disconnect === 'function') {
          osc.disconnect();
        }
      } catch (e) {
        // Ignorar errores
      }
    });
    this.oscillators = [];
    
    // Cambiar a la siguiente canción
    this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
    this.currentNoteIndex = 0;
    this.currentSong = this.songs[this.currentSongIndex];
    
    // Fade in de la nueva canción
    this.fadeIn();
    
    // Continuar reproduciendo
    this.playMelody();
    this.playBass();
    this.scheduleNextSong();
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
    if (!this.isPlaying || this.isPaused) return;
    
    // Verificar que la escena esté disponible
    if (!this.scene || !this.scene.time) {
      this.isPlaying = false;
      return;
    }
    
    // Verificar que el contexto de audio esté activo
    if (!this.audioContext || !this.currentSong) {
      this.isPlaying = false;
      return;
    }
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        this.playMelody();
      }).catch(() => {
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
    
    const note = this.currentSong.melody[this.currentNoteIndex % this.currentSong.melody.length];
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
      gainNode.connect(this.masterGain);
      
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
    if (!this.isPlaying || this.isPaused) return;
    
    // Verificar que la escena esté disponible
    if (!this.scene || !this.scene.time) {
      this.isPlaying = false;
      return;
    }
    
    // Verificar que el contexto de audio esté activo
    if (!this.audioContext || !this.currentSong) {
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
    
    const bassIndex = Math.floor(this.currentNoteIndex / 2) % this.currentSong.bassLine.length;
    const [frequency, duration] = this.currentSong.bassLine[bassIndex];
    
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
      gainNode.connect(this.masterGain);
      
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

  pause() {
    if (!this.isPlaying || this.isPaused) return;
    
    this.isPaused = true;
    
    try {
      if (this.audioContext && this.audioContext.state === 'running') {
        this.audioContext.suspend();
      }
    } catch (error) {
      console.warn('Error al pausar la música:', error);
    }
  }

  resume() {
    if (!this.isPlaying || !this.isPaused) return;
    
    this.isPaused = false;
    
    try {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          // Reiniciar la reproducción de música después de reanudar el audioContext
          // Los delayedCall de Phaser se pausaron, así que necesitamos reiniciar la música
          if (this.scene && this.scene.time) {
            // Pequeño delay para asegurar que el audioContext esté listo
            this.scene.time.delayedCall(50, () => {
              if (this.isPlaying && !this.isPaused) {
                this.playMelody();
                this.playBass();
              }
            });
          }
        }).catch(() => {
          // Si falla el resume, intentar reiniciar de todos modos
          if (this.scene && this.scene.time) {
            this.scene.time.delayedCall(50, () => {
              if (this.isPlaying && !this.isPaused) {
                this.playMelody();
                this.playBass();
              }
            });
          }
        });
      } else {
        // Si el audioContext no está suspendido, solo reiniciar la reproducción
        if (this.scene && this.scene.time) {
          this.scene.time.delayedCall(50, () => {
            if (this.isPlaying && !this.isPaused) {
              this.playMelody();
              this.playBass();
            }
          });
        }
      }
    } catch (error) {
      console.warn('Error al reanudar la música:', error);
      // Intentar reiniciar de todos modos
      if (this.scene && this.scene.time) {
        this.scene.time.delayedCall(50, () => {
          if (this.isPlaying && !this.isPaused) {
            this.playMelody();
            this.playBass();
          }
        });
      }
    }
  }
}
