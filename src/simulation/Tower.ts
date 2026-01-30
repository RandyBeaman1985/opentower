/**
 * Tower - Main game state container
 *
 * Manages the tower's floors, buildings, and overall state.
 * Uses Record instead of Map for JSON serialization compatibility.
 *
 * @module simulation/Tower
 */

import type {
  Tower,
  Floor,
  Building,
  StarRating,
  BuildingCounts,
  GameEvent,
} from '@/interfaces';
import { createGameClock } from '@core/Clock';
import { getEventBus } from '@core/EventBus';

/**
 * Default building counts (all zeroed)
 */
function createBuildingCounts(): BuildingCounts {
  return {
    elevatorShafts: 0,
    stairs: 0,
    escalators: 0,
    commercial: 0,
    parkingSpaces: 0,
    medical: 0,
    security: 0,
    entertainment: 0,
    metro: 0,
    cathedral: 0,
  };
}

/**
 * Update building counts based on building type
 */
function getBuildingCountCategory(type: Building['type']): keyof BuildingCounts | null {
  switch (type) {
    case 'stairs':
      return 'stairs';
    case 'escalator':
      return 'escalators';
    case 'fastFood':
    case 'restaurant':
    case 'shop':
      return 'commercial';
    case 'parkingSpace':
      return 'parkingSpaces';
    case 'medical':
      return 'medical';
    case 'security':
      return 'security';
    case 'partyHall':
    case 'cinema':
      return 'entertainment';
    case 'metro':
      return 'metro';
    case 'cathedral':
      return 'cathedral';
    default:
      return null;
  }
}

/**
 * Creates a new empty tower with default values
 */
export function createTower(name: string = 'New Tower'): Tower {
  const tower: Tower = {
    id: crypto.randomUUID(),
    name,
    funds: 2000000, // $2,000,000 starting funds (SimTower default)
    population: 0,
    starRating: 1,
    hasTowerStatus: false,

    floorsById: {},
    buildingsById: {},

    elevators: [],
    stairs: [],
    escalators: [],

    clock: createGameClock(),
    activeEvents: {},

    buildingCounts: createBuildingCounts(),

    createdAt: Date.now(),
    lastSavedAt: Date.now(),
    schemaVersion: 1,
  };

  // Create initial ground floor
  tower.floorsById[1] = createFloor(1);

  return tower;
}

/**
 * Creates a new floor at the specified level
 */
export function createFloor(level: number): Floor {
  return {
    level,
    tileOccupancy: new Array(375).fill(-1), // -1 = empty
    buildingIds: [],
    personIds: [],
    hasLobby: false,
    lobbySegments: 0,
  };
}

/**
 * TowerManager - Handles tower state mutations
 */
export class TowerManager {
  private tower: Tower;

  constructor(tower?: Tower) {
    this.tower = tower ?? createTower();
  }

  /**
   * Get the current tower state (read-only copy)
   */
  getTower(): Readonly<Tower> {
    return this.tower;
  }

  /**
   * Get current funds
   */
  getFunds(): number {
    return this.tower.funds;
  }

  /**
   * Add or subtract funds
   */
  modifyFunds(amount: number): boolean {
    const newFunds = this.tower.funds + amount;

    // Can't go below zero (would need loan system)
    if (newFunds < 0) {
      getEventBus().emitSync({
        type: 'INSUFFICIENT_FUNDS',
        required: Math.abs(amount),
        available: this.tower.funds,
      });
      return false;
    }

    const oldFunds = this.tower.funds;
    this.tower.funds = newFunds;

    getEventBus().emitSync({
      type: 'FUNDS_CHANGE',
      oldFunds,
      newFunds,
      change: amount,
    });

    return true;
  }

  /**
   * Get a floor by level, creating it if it doesn't exist
   */
  getOrCreateFloor(level: number): Floor {
    if (!this.tower.floorsById[level]) {
      this.tower.floorsById[level] = createFloor(level);

      getEventBus().emitSync({
        type: 'FLOOR_CREATED',
        level,
      });
    }
    return this.tower.floorsById[level];
  }

  /**
   * Get a floor by level (returns undefined if doesn't exist)
   */
  getFloor(level: number): Floor | undefined {
    return this.tower.floorsById[level];
  }

  /**
   * Check if a floor exists
   */
  hasFloor(level: number): boolean {
    return level in this.tower.floorsById;
  }

  /**
   * Get all floor levels that exist
   */
  getFloorLevels(): number[] {
    return Object.keys(this.tower.floorsById)
      .map(Number)
      .sort((a, b) => b - a); // Descending (top to bottom)
  }

  /**
   * Get floor range (min and max levels)
   */
  getFloorRange(): { min: number; max: number } {
    const levels = this.getFloorLevels();
    if (levels.length === 0) {
      return { min: 1, max: 1 };
    }
    return {
      min: Math.min(...levels),
      max: Math.max(...levels),
    };
  }

  /**
   * Add a building to the tower
   */
  addBuilding(building: Building): boolean {
    // Check if building ID already exists
    if (this.tower.buildingsById[building.id]) {
      console.error(`Building ${building.id} already exists`);
      return false;
    }

    // Verify floor exists or create it
    const floor = this.getOrCreateFloor(building.position.floor);

    // Check tile occupancy
    for (let tile = building.position.startTile; tile <= building.position.endTile; tile++) {
      if (floor.tileOccupancy[tile] !== -1) {
        getEventBus().emitSync({
          type: 'PLACEMENT_BLOCKED',
          floor: building.position.floor,
          tile,
          reason: 'occupied',
        });
        return false;
      }
    }

    // Place building
    this.tower.buildingsById[building.id] = building;
    floor.buildingIds.push(building.id);

    // Mark tiles as occupied
    for (let tile = building.position.startTile; tile <= building.position.endTile; tile++) {
      floor.tileOccupancy[tile] = floor.buildingIds.length - 1;
    }

    // Update building counts
    const countCategory = getBuildingCountCategory(building.type);
    if (countCategory) {
      this.tower.buildingCounts[countCategory]++;
    }

    // Emit event
    getEventBus().emitSync({
      type: 'BUILDING_PLACED',
      buildingId: building.id,
      buildingType: building.type,
      position: {
        floor: building.position.floor,
        tile: building.position.startTile,
      },
    });

    return true;
  }

  /**
   * Remove a building from the tower
   */
  removeBuilding(buildingId: string): boolean {
    const building = this.tower.buildingsById[buildingId];
    if (!building) {
      return false;
    }

    const floor = this.tower.floorsById[building.position.floor];
    if (!floor) {
      return false;
    }

    // Clear tile occupancy
    for (let tile = building.position.startTile; tile <= building.position.endTile; tile++) {
      floor.tileOccupancy[tile] = -1;
    }

    // Remove from floor's building list
    const buildingIndex = floor.buildingIds.indexOf(buildingId);
    if (buildingIndex !== -1) {
      floor.buildingIds.splice(buildingIndex, 1);
    }

    // Update building counts
    const countCategory = getBuildingCountCategory(building.type);
    if (countCategory) {
      this.tower.buildingCounts[countCategory]--;
    }

    // Calculate refund (50% of cost)
    const refund = Math.floor(building.incomePerQuarter * 2); // Placeholder calculation

    // Remove building
    delete this.tower.buildingsById[buildingId];

    getEventBus().emitSync({
      type: 'BUILDING_DEMOLISHED',
      buildingId,
      refund,
    });

    return true;
  }

  /**
   * Get a building by ID
   */
  getBuilding(buildingId: string): Building | undefined {
    return this.tower.buildingsById[buildingId];
  }

  /**
   * Get all buildings of a specific type
   */
  getBuildingsByType(type: Building['type']): Building[] {
    return Object.values(this.tower.buildingsById).filter((b): b is Building => b.type === type);
  }

  /**
   * Get buildings on a specific floor
   */
  getBuildingsOnFloor(level: number): Building[] {
    const floor = this.tower.floorsById[level];
    if (!floor) return [];

    return floor.buildingIds
      .map((id: string) => this.tower.buildingsById[id])
      .filter((b): b is Building => b !== undefined);
  }

  /**
   * Update population count
   */
  updatePopulation(count: number): void {
    const oldPopulation = this.tower.population;
    this.tower.population = count;

    // Check for star progression
    this.checkStarProgression();

    if (oldPopulation !== count) {
      getEventBus().emitSync({
        type: 'POPULATION_CHANGE',
        oldPopulation,
        newPopulation: count,
      });
    }
  }

  /**
   * Check and update star rating based on population
   */
  private checkStarProgression(): void {
    const pop = this.tower.population;
    let newRating: StarRating = 1;

    if (pop >= 15000 && this.tower.hasTowerStatus) {
      newRating = 6; // TOWER status
    } else if (pop >= 10000) {
      newRating = 5;
    } else if (pop >= 5000) {
      newRating = 4;
    } else if (pop >= 1000) {
      newRating = 3;
    } else if (pop >= 300) {
      newRating = 2;
    }

    if (newRating !== this.tower.starRating) {
      const oldRating = this.tower.starRating;
      this.tower.starRating = newRating;

      getEventBus().emitSync({
        type: 'STAR_CHANGE',
        oldRating,
        newRating,
      });
    }
  }

  /**
   * Get current star rating
   */
  getStarRating(): StarRating {
    return this.tower.starRating;
  }

  /**
   * Get current population
   */
  getPopulation(): number {
    return this.tower.population;
  }

  /**
   * Add an active event
   */
  addEvent(event: GameEvent): void {
    this.tower.activeEvents[event.id] = event;
  }

  /**
   * Remove an active event
   */
  removeEvent(eventId: string): void {
    delete this.tower.activeEvents[eventId];
  }

  /**
   * Get all active events
   */
  getActiveEvents(): GameEvent[] {
    return Object.values(this.tower.activeEvents);
  }

  /**
   * Serialize tower for saving
   */
  serialize(): Tower {
    return JSON.parse(JSON.stringify(this.tower));
  }

  /**
   * Load tower from saved data
   */
  deserialize(data: Tower): void {
    this.tower = data;
  }
}
