// Jest setup file to mock Phaser and browser APIs
// This must run before Phaser is imported

// Mock canvas context
const mockContext = {
  fillStyle: null,
  strokeStyle: null,
  lineWidth: null,
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  rotate: jest.fn(),
  scale: jest.fn(),
  setTransform: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })),
  measureText: jest.fn(() => ({ width: 0 })),
  fillText: jest.fn(),
  strokeText: jest.fn(),
  drawImage: jest.fn(),
  createPattern: jest.fn(),
  createLinearGradient: jest.fn(),
  createRadialGradient: jest.fn(),
  arc: jest.fn(),
  arcTo: jest.fn(),
  bezierCurveTo: jest.fn(),
  quadraticCurveTo: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
  isPointInPath: jest.fn(),
  transform: jest.fn(),
  resetTransform: jest.fn(),
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'low',
  shadowBlur: 0,
  shadowColor: 'rgba(0, 0, 0, 0)',
  shadowOffsetX: 0,
  shadowOffsetY: 0
};

// Mock HTMLCanvasElement
class MockHTMLCanvasElement {
  getContext(type) {
    if (type === '2d' || type === 'webgl' || type === 'webgl2') {
      return mockContext;
    }
    return null;
  }
}

MockHTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext);

// Setup global objects before Phaser loads
if (typeof global !== 'undefined') {
  global.HTMLCanvasElement = MockHTMLCanvasElement;
  
  global.window = global.window || {};
  global.window.HTMLCanvasElement = MockHTMLCanvasElement;
  global.window.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
  global.window.cancelAnimationFrame = jest.fn();
  global.window.AudioContext = jest.fn(() => ({
    createOscillator: jest.fn(() => ({
      type: 'sine',
      frequency: { setValueAtTime: jest.fn() },
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      disconnect: jest.fn()
    })),
    createGain: jest.fn(() => ({
      gain: {
        value: 0.5,
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
        cancelScheduledValues: jest.fn()
      },
      connect: jest.fn(),
      disconnect: jest.fn()
    })),
    createAnalyser: jest.fn(),
    destination: {},
    currentTime: 0,
    state: 'running',
    resume: jest.fn().mockResolvedValue(),
    suspend: jest.fn(),
    close: jest.fn()
  }));
  global.window.webkitAudioContext = global.window.AudioContext;
  
  global.document = global.document || {};
  global.document.createElement = jest.fn((tag) => {
    if (tag === 'canvas') {
      const canvas = new MockHTMLCanvasElement();
      canvas.width = 800;
      canvas.height = 600;
      canvas.style = {};
      return canvas;
    }
    return {};
  });
  global.document.body = global.document.body || {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  };
  
  // Make Phaser available globally
  global.Phaser = require('./__mocks__/phaser.js').default;
}

