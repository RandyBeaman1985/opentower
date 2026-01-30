/**
 * Tower and Floor interfaces - Core game state container
 * @module interfaces/tower
 */

import type { IBuilding, BuildingRecord, BuildingType, BuildingCounts } from './buildings';
import type { IElevatorShaft, IStairs, IEscalator } from './transport';
import type { GameClock } from './clock';
import type { GameEvent } from './events';

/** Star rating from 1-5, with 6 representing TOWER status */
export type StarRating = 1 | 2 | 3 | 4 | 5 | 6;

/** Position within the tower */
export interface Position {
  floor: number; // -10 to 100
  tile: number; // 0 to 374
}

/** Rectangular bounds for placement and collision */
export interface Bounds {
  floor: number;
  startTile: number;
  endTile: number;
  height: number; // Number of floors this building spans
}

/**
 * Main tower state container
 * Uses Record instead of Map for JSON serialization
 */
export interface ITower {
  readonly id: string;
  name: string;
  funds: number;
  population: number;
  starRating: StarRating;
  hasTowerStatus: boolean;

  /** Floor data indexed by floor number (-10 to 100) */
  floorsById: Record<number, IFloor>;

  /** All buildings indexed by ID - centralized registry */
  buildingsById: Record<string, BuildingRecord>;

  /** Transport systems */
  elevators: IElevatorShaft[];
  stairs: IStairs[];
  escalators: IEscalator[];

  /** Game time */
  clock: GameClock;

  /** Currently active events (fire, bomb threat, etc.) */
  activeEvents: Record<string, GameEvent>;

  /** Building count limits tracking */
  buildingCounts: BuildingCounts;

  /** Save/load metadata */
  createdAt: number;
  lastSavedAt: number;
  schemaVersion: number;
}

/**
 * Floor data structure
 * Each floor contains tile occupancy and entity references
 */
export interface IFloor {
  readonly level: number;

  /** 375 elements - building ID index or -1 for empty */
  tileOccupancy: number[];

  /** Building IDs on this floor (lookup in Tower.buildingsById) */
  buildingIds: string[];

  /** Person IDs currently on this floor */
  personIds: string[];

  /** Whether this floor has a lobby segment */
  hasLobby: boolean;

  /** Number of lobby segments (for maintenance cost calculation) */
  lobbySegments: number;
}

/**
 * Context interface that Tower exposes to Buildings
 * Read-only queries and event-based commands
 */
export interface ITowerContext {
  // Queries (read-only)
  readonly funds: number;
  readonly population: number;
  readonly currentTime: GameClock;
  readonly starRating: StarRating;

  getFloor(level: number): IFloor | null;
  getBuildingsInRange(position: Position, range: number): IBuilding[];
  getBuildingsByType(type: BuildingType): IBuilding[];
  isUnlocked(type: BuildingType): boolean;

  // Commands (through event bus, not direct mutation)
  requestFundsChange(amount: number, reason: string): boolean;
  notifyBuildingStateChange(buildingId: string): void;
  notifyPopulationChange(delta: number, buildingId: string): void;
}

/**
 * Serialized tower for save files
 */
export interface SerializedTower {
  schemaVersion: number;
  savedAt: number;
  tower: ITower;
}
