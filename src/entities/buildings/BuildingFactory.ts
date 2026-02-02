/**
 * BuildingFactory - Creates building instances for all 21 SimTower building types
 * @module entities/buildings/BuildingFactory
 */

import { generateUUID } from '@core/uuid';
import type { BuildingRecord, BuildingType, BuildingState } from '@/interfaces/buildings';
import { BUILDING_CONFIGS } from '@/interfaces/buildings';
import type { Position } from '@/interfaces/tower';

/**
 * Factory function to create a building record
 * All 21 building types use this unified factory
 */
export function createBuilding(
  type: BuildingType,
  floor: number,
  startTile: number,
  state: BuildingState = 'active'
): BuildingRecord {
  const config = BUILDING_CONFIGS[type];
  
  if (!config) {
    throw new Error(`Unknown building type: ${type}`);
  }

  const endTile = startTile + config.width - 1;
  const floors: number[] = [];
  
  // Generate floor array for multi-floor buildings
  for (let i = 0; i < config.height; i++) {
    floors.push(floor + i);
  }

  return {
    id: generateUUID(),
    type,
    position: {
      floor,
      startTile,
      endTile,
    },
    width: config.width,
    height: config.height,
    floors,
    state,
    stress: 0,
    occupantIds: [],
    incomePerQuarter: config.incomePerQuarter,
    maintenanceCostPerQuarter: config.maintenancePerQuarter,
    lastEvaluationDate: null,
    consecutiveBadEvals: 0,
    vacantSince: state === 'vacant' ? Date.now() : null,
  };
}

/**
 * Specific factory methods for each building category
 */

// RESIDENTIAL
export function createCondo(floor: number, startTile: number): BuildingRecord {
  return createBuilding('condo', floor, startTile, 'vacant');
}

// COMMERCIAL - Office
export function createOffice(floor: number, startTile: number): BuildingRecord {
  return createBuilding('office', floor, startTile, 'vacant');
}

// COMMERCIAL - Food
export function createFastFood(floor: number, startTile: number): BuildingRecord {
  return createBuilding('fastFood', floor, startTile);
}

export function createRestaurant(floor: number, startTile: number): BuildingRecord {
  return createBuilding('restaurant', floor, startTile);
}

// COMMERCIAL - Retail
export function createShop(floor: number, startTile: number): BuildingRecord {
  return createBuilding('shop', floor, startTile);
}

// HOTEL
export function createHotelSingle(floor: number, startTile: number): BuildingRecord {
  return createBuilding('hotelSingle', floor, startTile, 'vacant');
}

export function createHotelTwin(floor: number, startTile: number): BuildingRecord {
  return createBuilding('hotelTwin', floor, startTile, 'vacant');
}

export function createHotelSuite(floor: number, startTile: number): BuildingRecord {
  return createBuilding('hotelSuite', floor, startTile, 'vacant');
}

// ENTERTAINMENT
export function createPartyHall(floor: number, startTile: number): BuildingRecord {
  return createBuilding('partyHall', floor, startTile);
}

export function createCinema(floor: number, startTile: number): BuildingRecord {
  return createBuilding('cinema', floor, startTile);
}

// INFRASTRUCTURE
export function createLobby(floor: number, startTile: number): BuildingRecord {
  return createBuilding('lobby', floor, startTile);
}

export function createStairs(floor: number, startTile: number): BuildingRecord {
  return createBuilding('stairs', floor, startTile);
}

export function createEscalator(floor: number, startTile: number): BuildingRecord {
  return createBuilding('escalator', floor, startTile);
}

export function createParkingRamp(floor: number, startTile: number): BuildingRecord {
  return createBuilding('parkingRamp', floor, startTile);
}

export function createParkingSpace(floor: number, startTile: number): BuildingRecord {
  return createBuilding('parkingSpace', floor, startTile, 'vacant');
}

// SERVICES
export function createHousekeeping(floor: number, startTile: number): BuildingRecord {
  return createBuilding('housekeeping', floor, startTile);
}

export function createSecurity(floor: number, startTile: number): BuildingRecord {
  return createBuilding('security', floor, startTile);
}

export function createMedical(floor: number, startTile: number): BuildingRecord {
  return createBuilding('medical', floor, startTile);
}

export function createRecycling(floor: number, startTile: number): BuildingRecord {
  return createBuilding('recycling', floor, startTile);
}

// LANDMARKS
export function createMetro(floor: number, startTile: number): BuildingRecord {
  return createBuilding('metro', floor, startTile);
}

export function createCathedral(floor: number, startTile: number): BuildingRecord {
  return createBuilding('cathedral', floor, startTile);
}

/**
 * Calculate refund amount when demolishing a building (50% of cost)
 */
export function calculateDemolishRefund(type: BuildingType): number {
  const config = BUILDING_CONFIGS[type];
  return Math.floor(config.cost * 0.5);
}

/**
 * Get building cost
 */
export function getBuildingCost(type: BuildingType): number {
  return BUILDING_CONFIGS[type].cost;
}

/**
 * Check if building type is unlocked at current star rating
 */
export function isBuildingUnlocked(type: BuildingType, currentStarRating: number): boolean {
  const config = BUILDING_CONFIGS[type];
  
  // Cathedral requires TOWER status (star 6)
  if (type === 'cathedral') {
    return currentStarRating >= 6;
  }
  
  return currentStarRating >= config.unlockStar;
}

/**
 * Validate building placement
 */
export interface PlacementValidation {
  valid: boolean;
  reason?: string;
}

export function validatePlacement(
  type: BuildingType,
  floor: number,
  hasTowerStatus: boolean = false
): PlacementValidation {
  const config = BUILDING_CONFIGS[type];

  // Special rules for specific buildings
  switch (type) {
    case 'lobby':
      if (floor !== 1) {
        return { valid: false, reason: 'Lobby must be on ground floor (floor 1)' };
      }
      break;

    case 'shop':
    case 'fastFood':
      if (floor < 1 || floor > 15) {
        return { valid: false, reason: 'Shops and fast food must be on floors 1-15' };
      }
      break;

    case 'restaurant':
      if (floor < 2) {
        return { valid: false, reason: 'Restaurant must be on floor 2 or higher (needs view)' };
      }
      break;

    case 'parkingRamp':
    case 'parkingSpace':
      if (floor >= 1) {
        return { valid: false, reason: 'Parking must be underground (floor 0 or below)' };
      }
      break;

    case 'metro':
      if (floor >= 0) {
        return { valid: false, reason: 'Metro station must be underground' };
      }
      break;

    case 'cathedral':
      if (!hasTowerStatus) {
        return { valid: false, reason: 'Cathedral requires TOWER status (6★)' };
      }
      if (floor !== 1) {
        return { valid: false, reason: 'Cathedral must be on ground floor' };
      }
      break;

    case 'condo':
    case 'office':
    case 'hotelSingle':
    case 'hotelTwin':
    case 'hotelSuite':
      if (floor < 2) {
        return { valid: false, reason: `${config.name} must be on floor 2 or higher` };
      }
      break;
  }

  return { valid: true };
}
