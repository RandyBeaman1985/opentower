/**
 * Core module exports
 * @module core
 */

export { Game, GameState } from './Game';
export type { GameConfig } from './Game';

export { ClockManager, createGameClock } from './Clock';

export { EventBus, getEventBus, resetEventBus } from './EventBus';

export { SaveLoadManager } from './SaveLoadManager';
export type { SaveData } from './SaveLoadManager';
