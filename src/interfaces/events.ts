/**
 * Game events and event bus interfaces
 * @module interfaces/events
 */

import type { Position, StarRating } from './tower';
import type { BuildingType, BuildingState } from './buildings';
import type { PersonType, PersonState } from './entities';
import type { ElevatorDirection } from './transport';

/**
 * Game event types (fire, bomb threat, etc.)
 */
export type GameEventType =
  | 'fire'
  | 'bomb_threat'
  | 'cockroaches'
  | 'vip_visit'
  | 'treasure_chest'
  | 'santa';

export type GameEventState = 'pending' | 'active' | 'resolving' | 'resolved';

/**
 * Game event instance
 */
export interface GameEvent {
  id: string;
  type: GameEventType;
  state: GameEventState;
  triggeredAt: number; // Game tick
  affectedFloors: number[];
  affectedBuildingIds: string[];
  data?: Record<string, unknown>;
}

/**
 * Event bus event categories
 * Based on Architect review recommendations
 */

// Core simulation events
export type SimulationEvent =
  | { type: 'TICK'; gameTime: number; tick: number }
  | { type: 'QUARTER_START'; quarter: number; year: number }
  | { type: 'QUARTER_END'; quarter: number; year: number; summary: QuarterlySnapshot }
  | { type: 'DAY_CHANGE'; day: 'weekday' | 'weekend'; dayOfWeek: number }
  | { type: 'HOUR_CHANGE'; hour: number }
  | { type: 'SPEED_CHANGE'; oldSpeed: number; newSpeed: number };

// Building lifecycle events
export type BuildingEvent =
  | { type: 'BUILDING_PLACED'; buildingId: string; buildingType: BuildingType; position: Position }
  | { type: 'BUILDING_DEMOLISHED'; buildingId: string; refund: number }
  | { type: 'BUILDING_STATE_CHANGE'; buildingId: string; oldState: BuildingState; newState: BuildingState }
  | { type: 'TENANT_MOVED_IN'; buildingId: string; personIds: string[] }
  | { type: 'TENANT_MOVED_OUT'; buildingId: string; personIds: string[]; reason: string }
  | { type: 'BUILDING_EVALUATION'; buildingId: string; passed: boolean; score: number };

// Person events
export type PersonEvent =
  | { type: 'PERSON_SPAWNED'; personId: string; personType: PersonType; buildingId: string }
  | { type: 'PERSON_DESPAWNED'; personId: string; reason: 'left' | 'moved_out' | 'evacuated' }
  | { type: 'PERSON_STRESS_CHANGE'; personId: string; oldLevel: number; newLevel: number }
  | { type: 'PERSON_STRESS_THRESHOLD'; personId: string; level: 'normal' | 'stressed' | 'critical' }
  | { type: 'PERSON_ARRIVED'; personId: string; destinationId: string }
  | { type: 'PERSON_STATE_CHANGE'; personId: string; oldState: PersonState; newState: PersonState };

// Transport events
export type TransportEvent =
  | { type: 'ELEVATOR_PLACED'; shaftId: string; position: Position }
  | { type: 'ELEVATOR_EXTENDED'; shaftId: string; newTopFloor: number; newBottomFloor: number }
  | { type: 'ELEVATOR_CAR_ADDED'; shaftId: string; carId: string }
  | { type: 'ELEVATOR_CAR_REMOVED'; shaftId: string; carId: string }
  | { type: 'ELEVATOR_QUEUE_CRITICAL'; shaftId: string; floor: number; queueLength: number }
  | { type: 'PERSON_ENTERED_ELEVATOR'; personId: string; carId: string; floor: number }
  | { type: 'PERSON_EXITED_ELEVATOR'; personId: string; carId: string; floor: number }
  | { type: 'ELEVATOR_ARRIVED'; carId: string; floor: number; direction: ElevatorDirection };

// Economic events
export type EconomicEvent =
  | { type: 'FUNDS_CHANGED'; oldAmount: number; newAmount: number; reason: string }
  | { type: 'INCOME_RECEIVED'; amount: number; source: string; buildingId?: string }
  | { type: 'EXPENSE_PAID'; amount: number; reason: string; buildingId?: string }
  | { type: 'BANKRUPTCY_WARNING'; funds: number }
  | { type: 'BANKRUPTCY'; finalFunds: number };

// Progression events
export type ProgressionEvent =
  | { type: 'POPULATION_CHANGED'; oldCount: number; newCount: number }
  | { type: 'STAR_RATING_CHANGED'; oldRating: StarRating; newRating: StarRating }
  | { type: 'BUILDING_UNLOCKED'; buildingType: BuildingType }
  | { type: 'TOWER_STATUS_ACHIEVED' }
  | { type: 'VICTORY'; finalPopulation: number };

// Game event events (disasters, VIP, easter eggs)
export type GameEventEvent =
  | { type: 'FIRE_STARTED'; floor: number; buildingId: string }
  | { type: 'FIRE_EXTINGUISHED'; floor: number; cost: number }
  | { type: 'BOMB_THREAT_STARTED'; evacuationStarted: boolean }
  | { type: 'BOMB_THREAT_RESOLVED'; wasReal: boolean }
  | { type: 'COCKROACHES_APPEARED'; buildingId: string }
  | { type: 'COCKROACHES_ELIMINATED'; buildingId: string }
  | { type: 'VIP_ARRIVED'; vipId: string }
  | { type: 'VIP_DEPARTED'; vipId: string; satisfied: boolean }
  | { type: 'TREASURE_CHEST_SPAWNED'; floor: number; tile: number }
  | { type: 'TREASURE_CHEST_COLLECTED'; amount: number }
  | { type: 'SANTA_APPEARED' }
  | { type: 'SANTA_DEPARTED' };

// UI events
export type UIEvent =
  | { type: 'BUILDING_SELECTED'; buildingId: string | null }
  | { type: 'TOOL_SELECTED'; tool: string }
  | { type: 'CAMERA_MOVED'; position: Position; zoom: number }
  | { type: 'NOTIFICATION_SHOWN'; message: string; severity: 'info' | 'warning' | 'error' }
  | { type: 'MENU_OPENED'; menu: string }
  | { type: 'MENU_CLOSED'; menu: string };

// All event types
export type AppEvent =
  | SimulationEvent
  | BuildingEvent
  | PersonEvent
  | TransportEvent
  | EconomicEvent
  | ProgressionEvent
  | GameEventEvent
  | UIEvent;

/**
 * Event subscription handle
 */
export interface Subscription {
  unsubscribe(): void;
}

/**
 * Event bus interface
 * Supports sync (immediate), async (microtask), and phased (game loop) events
 */
export interface IEventBus {
  /** Subscribe to an event type */
  on<T extends AppEvent>(eventType: T['type'], callback: (event: T) => void): Subscription;

  /** Subscribe to multiple event types */
  onAny(eventTypes: AppEvent['type'][], callback: (event: AppEvent) => void): Subscription;

  /** Emit event synchronously (processed immediately) */
  emitSync<T extends AppEvent>(event: T): void;

  /** Emit event asynchronously (processed on next microtask) */
  emitAsync<T extends AppEvent>(event: T): void;

  /** Queue event for specific game loop phase */
  queue<T extends AppEvent>(event: T, phase: GamePhase): void;

  /** Process all queued events for a phase */
  processPhase(phase: GamePhase): void;

  /** Clear all subscriptions */
  clear(): void;
}

/**
 * Game loop phases for event processing
 */
export enum GamePhase {
  PRE_UPDATE = 'PRE_UPDATE',
  SIMULATION = 'SIMULATION',
  POST_UPDATE = 'POST_UPDATE',
  RENDER = 'RENDER',
  POST_RENDER = 'POST_RENDER',
}

/**
 * Quarterly snapshot for history tracking
 */
export interface QuarterlySnapshot {
  quarter: number;
  year: number;
  income: number;
  maintenance: number;
  netProfit: number;
  population: number;
  starRating: StarRating;
  buildingsByType: Record<BuildingType, number>;
  avgElevatorWait: number;
  avgSatisfaction: number;
  moveOuts: number;
  moveIns: number;
}

/**
 * Event configuration for random events
 */
export interface RandomEventConfig {
  type: GameEventType;
  minStarRating: StarRating;
  probability: number; // Per quarter
  cooldownQuarters: number; // Minimum quarters between occurrences
}

export const RANDOM_EVENT_CONFIGS: RandomEventConfig[] = [
  { type: 'fire', minStarRating: 1, probability: 0.05, cooldownQuarters: 4 },
  { type: 'bomb_threat', minStarRating: 3, probability: 0.03, cooldownQuarters: 8 },
  { type: 'cockroaches', minStarRating: 1, probability: 0.1, cooldownQuarters: 2 },
  { type: 'vip_visit', minStarRating: 4, probability: 0.15, cooldownQuarters: 4 },
  { type: 'treasure_chest', minStarRating: 1, probability: 0.2, cooldownQuarters: 1 },
];
