// Mock Phaser for Jest tests
export default {
  Game: class Game {
    constructor(config) {
      this.config = config;
    }
  },
  Scene: class Scene {
    constructor(config) {
      this.scene = config;
    }
  },
  GameObjects: {
    Rectangle: class Rectangle {
      constructor(scene, x, y, width, height, color) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.alpha = 1;
        this.visible = true;
        this.setOrigin = jest.fn().mockReturnThis();
        this.setFillStyle = jest.fn().mockReturnThis();
        this.setStrokeStyle = jest.fn().mockReturnThis();
        this.setAlpha = jest.fn().mockReturnThis();
        this.setVisible = jest.fn().mockReturnThis();
        this.destroy = jest.fn();
      }
    },
    Text: class Text {
      constructor(scene, x, y, text, style) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.text = text;
        this.style = style;
        this.setOrigin = jest.fn().mockReturnThis();
        this.setFill = jest.fn().mockReturnThis();
        this.setText = jest.fn().mockReturnThis();
        this.destroy = jest.fn();
      }
    },
    Graphics: class Graphics {
      constructor(scene) {
        this.scene = scene;
        this.lineStyle = jest.fn().mockReturnThis();
        this.fillStyle = jest.fn().mockReturnThis();
        this.strokeRect = jest.fn().mockReturnThis();
        this.fillRect = jest.fn().mockReturnThis();
        this.moveTo = jest.fn().mockReturnThis();
        this.lineTo = jest.fn().mockReturnThis();
        this.strokePath = jest.fn().mockReturnThis();
        this.destroy = jest.fn();
      }
    }
  },
  Math: {
    Vector2: class Vector2 {
      constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
      }
      set(x, y) {
        this.x = x;
        this.y = y;
        return this;
      }
      clone() {
        return new Vector2(this.x, this.y);
      }
    }
  },
  Input: {
    Keyboard: {
      KeyCodes: {
        LEFT: 37,
        RIGHT: 39,
        UP: 38,
        DOWN: 40,
        M: 77,
        S: 83,
        P: 80,
        R: 82,
        SPACE: 32
      },
      JustDown: jest.fn(() => false),
      JustUp: jest.fn(() => false)
    }
  },
  Events: {
    EventEmitter: class EventEmitter {
      constructor() {
        this.listeners = new Map();
      }

      on(event, callback, context) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.push({ callback, context, once: false });
        this.listeners.set(event, callbacks);
        return this;
      }

      once(event, callback, context) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.push({ callback, context, once: true });
        this.listeners.set(event, callbacks);
        return this;
      }

      off(event, callback, context) {
        if (!this.listeners.has(event)) return this;
        if (!callback) {
          this.listeners.delete(event);
          return this;
        }
        const callbacks = this.listeners.get(event).filter(listener => (
          listener.callback !== callback || (context && listener.context !== context)
        ));
        this.listeners.set(event, callbacks);
        return this;
      }

      emit(event, ...args) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(listener => listener.callback.apply(listener.context, args));
        this.listeners.set(event, callbacks.filter(listener => !listener.once));
        return this;
      }

      removeAllListeners(event) {
        if (event) {
          this.listeners.delete(event);
        } else {
          this.listeners.clear();
        }
        return this;
      }
    }
  }
};
