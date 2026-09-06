import Phaser from 'phaser';
import {
  HORIZONTAL_MOVE_DELAY,
  ROTATE_DELAY,
  START_INPUT_PAUSE_GUARD_DURATION
} from '../../config/settings.js';
import { t } from '../../i18n/index.js';

const UNAVAILABLE_ACTION_MESSAGES = {
  move: () => t('feedback.moveBlocked'),
  rotate: () => t('feedback.rotateBlocked')
};

export default class InputController {
  constructor(scene, actions) {
    this.scene = scene;
    this.actions = actions;
    this.horizontalMoveDelay = HORIZONTAL_MOVE_DELAY;
    this.rotateDelay = ROTATE_DELAY;
  }

  setup() {
    this.cursors = this.scene.input.keyboard.createCursorKeys();

    this.muteKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.M
    );
    this.muteKey.on('down', () => this.actions.toggleMusic());

    this.soundEffectsKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.S
    );
    this.soundEffectsKey.on('down', () => this.actions.toggleSoundEffects());

    this.ghostKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.G
    );
    this.ghostKey.on('down', () => this.actions.toggleGhost?.());

    this.localeKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.L
    );
    this.localeKey.on('down', () => this.actions.toggleLocale?.());

    this.pauseKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.P
    );
    this.spaceKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    this.escKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );
    this.escKey.on('down', () => this.actions.toggleSettings?.());
  }

  update({ isPlaying, isPaused }) {
    if (isPlaying) {
      if (this.isPausePressed() && !this.isPauseGuardActive()) {
        this.actions.pause();
      }

      this.handleGameplayInputs();
      return;
    }

    if (isPaused && this.isPausePressed()) {
      this.actions.resume();
    }
  }

  bindStartInput(onStart) {
    const startTrigger = (evt) => {
      if (this.actions.isSettingsOpen?.()) return;
      if (evt && evt.keyCode === Phaser.Input.Keyboard.KeyCodes.P) return;
      if (evt && evt.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC) return;
      this.scene.input.keyboard.off('keydown', startTrigger);
      this.scene.input.off('pointerdown', startTrigger);
      this.pauseGuardUntil =
        this.scene.time.now + START_INPUT_PAUSE_GUARD_DURATION;
      onStart();
    };

    this.scene.input.keyboard.on('keydown', startTrigger);
    this.scene.input.on('pointerdown', startTrigger);
    this.startTrigger = startTrigger;
    return startTrigger;
  }

  clearStartInput() {
    if (this.startTrigger) {
      this.scene.input.keyboard.off('keydown', this.startTrigger);
      this.scene.input.off('pointerdown', this.startTrigger);
      this.startTrigger = null;
    }
  }

  bindRestartInput(onRestart) {
    this.restartKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.R
    );
    this.restartKey.on('down', onRestart);

    this.restartPointerTrigger = () => {
      onRestart();
    };
    this.scene.input.on('pointerdown', this.restartPointerTrigger);

    return this.restartKey;
  }

  clearRestartInput() {
    if (this.restartKey) {
      this.restartKey.removeAllListeners();
      this.restartKey = null;
    }
    if (this.restartPointerTrigger) {
      this.scene.input.off('pointerdown', this.restartPointerTrigger);
      this.restartPointerTrigger = null;
    }
  }

  handleGameplayInputs() {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left))
      this.moveHorizontally(-1);
    else if (this.cursors.left.isDown && this.canMoveHorizontally())
      this.moveHorizontally(-1);

    if (Phaser.Input.Keyboard.JustDown(this.cursors.right))
      this.moveHorizontally(1);
    else if (this.cursors.right.isDown && this.canMoveHorizontally())
      this.moveHorizontally(1);

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.canRotate()) {
      const rotated = this.actions.rotate();
      if (!rotated) {
        this.actions.showUnavailableAction(
          UNAVAILABLE_ACTION_MESSAGES.rotate()
        );
      }
      if (rotated) this.lastRotateTime = this.scene.time.now;
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.actions.startSoftDrop();
    } else if (Phaser.Input.Keyboard.JustUp(this.cursors.down)) {
      this.actions.stopSoftDrop();
    }
  }

  moveHorizontally(direction) {
    if (this.actions.move(direction)) {
      this.lastMoveTime = this.scene.time.now;
      return;
    }

    this.actions.showUnavailableAction(UNAVAILABLE_ACTION_MESSAGES.move());
  }

  isPausePressed() {
    return (
      Phaser.Input.Keyboard.JustDown(this.pauseKey) ||
      Phaser.Input.Keyboard.JustDown(this.spaceKey)
    );
  }

  isPauseGuardActive() {
    return this.pauseGuardUntil && this.scene.time.now <= this.pauseGuardUntil;
  }

  canMoveHorizontally() {
    if (!this.lastMoveTime) return true;
    return this.scene.time.now - this.lastMoveTime > this.horizontalMoveDelay;
  }

  canRotate() {
    if (!this.lastRotateTime) return true;
    return this.scene.time.now - this.lastRotateTime > this.rotateDelay;
  }
}
