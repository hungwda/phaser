/**
 * Jest setup file
 * Configure the testing environment and set up mocks
 */

import { jest, beforeEach } from '@jest/globals';

// Mock localStorage
global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  },
  key(index) {
    const keys = Object.keys(this.data);
    return keys[index] || null;
  },
  get length() {
    return Object.keys(this.data).length;
  }
};

// Mock performance.memory
if (!global.performance.memory) {
  global.performance.memory = {
    usedJSHeapSize: 10485760,
    totalJSHeapSize: 20971520,
    jsHeapSizeLimit: 104857600,
  };
}

// Mock document methods
if (!global.document.getElementById) {
  global.document.getElementById = jest.fn(() => ({
    style: {},
    remove: jest.fn(),
  }));
}

// Mock Image
global.Image = class {
  constructor() {
    this.src = '';
    this.onload = null;
  }
  set src(value) {
    this._src = value;
    if (this.onload) {
      setTimeout(() => this.onload(), 0);
    }
  }
  get src() {
    return this._src;
  }
};

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');

// Mock HTMLCanvasElement and its 2D context for Phaser
global.HTMLCanvasElement.prototype.getContext = jest.fn(function (contextType) {
  if (contextType === '2d') {
    return {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      lineCap: 'butt',
      lineJoin: 'miter',
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      font: '10px sans-serif',
      textAlign: 'start',
      textBaseline: 'alphabetic',
      canvas: this,
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      clearRect: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      beginPath: jest.fn(),
      closePath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      arc: jest.fn(),
      arcTo: jest.fn(),
      quadraticCurveTo: jest.fn(),
      bezierCurveTo: jest.fn(),
      rect: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      translate: jest.fn(),
      transform: jest.fn(),
      setTransform: jest.fn(),
      resetTransform: jest.fn(),
      drawImage: jest.fn(),
      createImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })),
      getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })),
      putImageData: jest.fn(),
      fillText: jest.fn(),
      strokeText: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      clip: jest.fn(),
      isPointInPath: jest.fn(),
      isPointInStroke: jest.fn(),
      getLineDash: jest.fn(() => []),
      setLineDash: jest.fn(),
      createLinearGradient: jest.fn(),
      createRadialGradient: jest.fn(),
      createPattern: jest.fn(),
    };
  }
  return null;
});

// Clear mocks between tests
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});
