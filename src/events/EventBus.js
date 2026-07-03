import Phaser from 'phaser';
import { EVENTS } from './GameEvents.js';

// Singleton Event Bus for global game events
const EventBus = new Phaser.Events.EventEmitter();

export { EVENTS };

export default EventBus;
