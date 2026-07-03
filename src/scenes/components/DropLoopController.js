export default class DropLoopController {
  constructor(scene, onFallTick) {
    this.scene = scene;
    this.onFallTick = onFallTick;
    this.timer = null;
  }

  restart(delay) {
    this.stop();
    this.timer = this.scene.time.addEvent({
      delay,
      callback: () => this.onFallTick(),
      loop: true
    });
  }

  stop() {
    if (this.timer) {
      this.timer.remove();
      this.timer = null;
    }
  }

  pause() {
    if (this.timer) this.timer.paused = true;
  }

  resume() {
    if (this.timer) this.timer.paused = false;
  }
}
