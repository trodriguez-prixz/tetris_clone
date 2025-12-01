/**
 * Generador de efectos de sonido retro estilo chiptune
 * Usa Web Audio API para generar sonidos programáticamente
 */
export class SoundEffects {
  constructor(scene) {
    this.scene = scene;
    this.audioContext = null;
    this.masterGain = null;
    this.enabled = true;
    this.volume = 0.3; // Volumen de efectos de sonido (30%)
  }

  init() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContextClass();
      
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
      this.masterGain.connect(this.audioContext.destination);
      
      return true;
    } catch (error) {
      console.warn('Web Audio API no disponible para efectos de sonido:', error);
      return false;
    }
  }

  playSound(frequency, duration, type = 'square', envelope = 'short') {
    if (!this.enabled || !this.audioContext || !this.masterGain) return;
    
    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      
      const now = this.audioContext.currentTime;
      
      // Diferentes envelopes según el tipo de sonido
      if (envelope === 'short') {
        // Sonido corto y agudo (movimiento, rotación)
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
      } else if (envelope === 'medium') {
        // Sonido medio (línea eliminada)
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.25, now + 0.02);
        gainNode.gain.linearRampToValueAtTime(0.15, now + duration * 0.5);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
      } else if (envelope === 'long') {
        // Sonido largo (game over)
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gainNode.gain.linearRampToValueAtTime(0.2, now + duration * 0.7);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
      }
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch (error) {
      // Ignorar errores silenciosamente
    }
  }

  playMove() {
    // Sonido corto y agudo para movimiento
    this.playSound(800, 0.05, 'square', 'short');
  }

  playRotate() {
    // Sonido característico para rotación (dos tonos)
    this.playSound(600, 0.08, 'square', 'short');
    setTimeout(() => {
      if (this.enabled) {
        this.playSound(800, 0.08, 'square', 'short');
      }
    }, 50);
  }

  playLineClear(lines) {
    // Sonido diferente según número de líneas
    if (lines === 1) {
      this.playSound(440, 0.15, 'square', 'medium');
    } else if (lines === 2) {
      this.playSound(523.25, 0.2, 'square', 'medium');
      setTimeout(() => {
        if (this.enabled) {
          this.playSound(659.25, 0.2, 'square', 'medium');
        }
      }, 100);
    } else if (lines === 3) {
      this.playSound(523.25, 0.15, 'square', 'medium');
      setTimeout(() => {
        if (this.enabled) {
          this.playSound(659.25, 0.15, 'square', 'medium');
        }
      }, 80);
      setTimeout(() => {
        if (this.enabled) {
          this.playSound(783.99, 0.15, 'square', 'medium');
        }
      }, 160);
    } else if (lines === 4) {
      // Tetris! Sonido especial
      this.playSound(523.25, 0.1, 'square', 'medium');
      setTimeout(() => {
        if (this.enabled) {
          this.playSound(659.25, 0.1, 'square', 'medium');
        }
      }, 60);
      setTimeout(() => {
        if (this.enabled) {
          this.playSound(783.99, 0.1, 'square', 'medium');
        }
      }, 120);
      setTimeout(() => {
        if (this.enabled) {
          this.playSound(987.77, 0.2, 'square', 'medium');
        }
      }, 180);
    }
  }

  playHardDrop() {
    // Sonido de impacto para hard drop
    this.playSound(200, 0.1, 'sawtooth', 'short');
    setTimeout(() => {
      if (this.enabled) {
        this.playSound(150, 0.15, 'sawtooth', 'short');
      }
    }, 50);
  }

  playGameOver() {
    // Sonido triste descendente para game over
    const frequencies = [440, 392, 349.23, 329.63, 293.66];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        if (this.enabled) {
          this.playSound(freq, 0.2, 'sawtooth', 'medium');
        }
      }, index * 100);
    });
  }

  playLevelUp() {
    // Sonido ascendente para subir de nivel
    const frequencies = [261.63, 329.63, 392, 523.25];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        if (this.enabled) {
          this.playSound(freq, 0.15, 'square', 'short');
        }
      }, index * 80);
    });
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

