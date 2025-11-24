// Utility functions for custom timers
// Phaser's TimerEvent will be used directly in GameScene

export class CustomTimer {
  constructor(scene, duration, callback, repeat = false) {
    this.scene = scene;
    this.duration = duration;
    this.callback = callback;
    this.repeat = repeat;
    this.timerEvent = null;
    this.startTime = null;
  }

  start() {
    this.startTime = this.scene.time.now;
    this.timerEvent = this.scene.time.addEvent({
      delay: this.duration,
      callback: this.callback,
      repeat: this.repeat ? -1 : 0
    });
  }

  stop() {
    if (this.timerEvent) {
      this.timerEvent.remove();
      this.timerEvent = null;
    }
  }

  reset() {
    this.stop();
    this.start();
  }

  setDuration(newDuration) {
    this.duration = newDuration;
    if (this.timerEvent) {
      this.timerEvent.delay = newDuration;
    }
  }

  isActive() {
    return this.timerEvent && this.timerEvent.getProgress() < 1;
  }
}

