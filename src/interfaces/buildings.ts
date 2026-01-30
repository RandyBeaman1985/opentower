/**
 * Building interfaces and types
 * @module interfaces/buildings
 */

import type { Position, ITowerContext } from './tower';

/**
 * All building types in the game
 * VERIFIED against SimTower Fandom Wiki and OpenSkyscraper source
 */
export type BuildingType =
  // Residential
  | 'condo'
  // Commercial - Office
  | 'office'
  // Commercial - Food
  | 'fastFood'
  | 'restaurant'
  // Commercial - Retail
  | 'shop'
  // Hotel
  | 'hotelSingle'
  | 'hotelTwin'
  | 'hotelSuite'
  // Entertainment
  | 'partyHall'
  | 'cinema'
  // Infrastructure
  | 'lobby'
  | 'stairs'
  | 'escalator'
  | 'parkingRamp'
  | 'parkingSpace'
  // Services
  | 'housekeeping'
  | 'security'
  | 'medical'
  | 'recycling'
  // Landmarks
  | 'metro'
  | 'cathedral';

/**
 * Building operational states
 */
export type BuildingState =
  | 'constructing'
  | 'active'
  | 'closed'
  | 'vacant'
  | 'damaged'
  | 'evacuated'
  | 'infested'
  | 'demolishing';

/**
 * Building configuration - static data for each building type
 * VERIFIED values from SimTower Fandom Wiki, OpenSkyscraper source, and GameFAQs
 */
export interface BuildingConfig {
  type: BuildingType;
  name: string;
  cost: number;
  width: number; // In tiles (1 tile = 16 HD pixels)
  height: number; // In floors
  capacity: number; // Max occupants
  incomePerQuarter: number;
  maintenancePerQuarter: number;
  unlockStar: 1 | 2 | 3 | 4 | 5;
  category: 'residential' | 'commercial' | 'hotel' | 'entertainment' | 'infrastructure' | 'service' | 'landmark';
  noiseSensitive: boolean;
  noiseSource: boolean;
  noiseBufferRequired: number; // Tiles of buffer needed from noise sources
}

/**
 * VERIFIED building configurations
 * Corrections from Round 2 expert review:
 * - Office: 9 tiles (not 8)
 * - Twin Room: 6 tiles (not 8)
 * - Restaurant: 24 tiles (not 32)
 * - Shop: 12 tiles (not 16)
 * - Single Room unlock: 2★
 * - Twin Room unlock: 3★
 * - Shop unlock: 3★
 * - Escalator unlock: 3★
 * - Security unlock: 2★
 * - Housekeeping: 15 tiles
 * - Security: 16 tiles
 * - Medical: 26 tiles
 * - Stairs: 8 tiles
 */
export const BUILDING_CONFIGS: Record<BuildingType, BuildingConfig> = {
  // Residential
  condo: {
    type: 'condo',
    name: 'Condo',
    cost: 80000,
    width: 16,
    height: 1,
    capacity: 3,
    incomePerQuarter: 0, // One-time sale: $50K-$200K
    maintenancePerQuarter: 0,
    unlockStar: 1,
    category: 'residential',
    noiseSensitive: true,
    noiseSource: false,
    noiseBufferRequired: 15, // 240 pixels / 16 = 15 tiles from commercial
  },

  // Commercial - Office
  office: {
    type: 'office',
    name: 'Office',
    cost: 40000,
    width: 9, // VERIFIED: 9 tiles
    height: 1,
    capacity: 6,
    incomePerQuarter: 10000,
    maintenancePerQuarter: 0,
    unlockStar: 1,
    category: 'commercial',
    noiseSensitive: true,
    noiseSource: false,
    noiseBufferRequired: 3,
  },

  // Commercial - Food
  fastFood: {
    type: 'fastFood',
    name: 'Fast Food',
    cost: 100000,
    width: 16,
    height: 1,
    capacity: 35, // weekday, 48 weekend
    incomePerQuarter: 9000,
    maintenancePerQuarter: 0,
    unlockStar: 1,
    category: 'commercial',
    noiseSensitive: false,
    noiseSource: true,
    noiseBufferRequired: 0,
  },
  restaurant: {
    type: 'restaurant',
    name: 'Restaurant',
    cost: 200000,
    width: 24, // VERIFIED: 24 tiles
    height: 1,
    capacity: 35,
    incomePerQuarter: 18000,
    maintenancePerQuarter: 0,
    unlockStar: 2,
    category: 'commercial',
    noiseSensitive: false,
    noiseSource: true,
    noiseBufferRequired: 0,
  },

  // Commercial - Retail
  shop: {
    type: 'shop',
    name: 'Shop',
    cost: 100000,
    width: 12, // VERIFIED: 12 tiles
    height: 1,
    capacity: 25, // weekday, 30 weekend
    incomePerQuarter: 15000,
    maintenancePerQuarter: 0,
    unlockStar: 3, // VERIFIED: 3★
    category: 'commercial',
    noiseSensitive: false,
    noiseSource: false,
    noiseBufferRequired: 0,
  },

  // Hotel
  hotelSingle: {
    type: 'hotelSingle',
    name: 'Single Room',
    cost: 20000,
    width: 4,
    height: 1,
    capacity: 1,
    incomePerQuarter: 6000,
    maintenancePerQuarter: 0,
    unlockStar: 2, // VERIFIED: 2★
    category: 'hotel',
    noiseSensitive: true,
    noiseSource: false,
    noiseBufferRequired: 5,
  },
  hotelTwin: {
    type: 'hotelTwin',
    name: 'Twin Room',
    cost: 50000,
    width: 6, // VERIFIED: 6 tiles
    height: 1,
    capacity: 2,
    incomePerQuarter: 9000,
    maintenancePerQuarter: 0,
    unlockStar: 3, // VERIFIED: 3★
    category: 'hotel',
    noiseSensitive: true,
    noiseSource: false,
    noiseBufferRequired: 5,
  },
  hotelSuite: {
    type: 'hotelSuite',
    name: 'Suite',
    cost: 100000,
    width: 10,
    height: 1,
    capacity: 2,
    incomePerQuarter: 18000,
    maintenancePerQuarter: 0,
    unlockStar: 3,
    category: 'hotel',
    noiseSensitive: true,
    noiseSource: false,
    noiseBufferRequired: 5,
  },

  // Entertainment
  partyHall: {
    type: 'partyHall',
    name: 'Party Hall',
    cost: 100000,
    width: 24,
    height: 2,
    capacity: 50,
    incomePerQuarter: 60000,
    maintenancePerQuarter: 0,
    unlockStar: 3,
    category: 'entertainment',
    noiseSensitive: false,
    noiseSource: true,
    noiseBufferRequired: 0,
  },
  cinema: {
    type: 'cinema',
    name: 'Cinema',
    cost: 500000,
    width: 31,
    height: 2,
    capacity: 120,
    incomePerQuarter: 30000,
    maintenancePerQuarter: 0,
    unlockStar: 3,
    category: 'entertainment',
    noiseSensitive: false,
    noiseSource: true,
    noiseBufferRequired: 0,
  },

  // Infrastructure
  lobby: {
    type: 'lobby',
    name: 'Lobby',
    cost: 5000, // Per segment
    width: 4,
    height: 1,
    capacity: 0,
    incomePerQuarter: 0,
    maintenancePerQuarter: 0, // $0 at 1-2★, $300/seg at 3★, $1000/seg at 4+★
    unlockStar: 1,
    category: 'infrastructure',
    noiseSensitive: false,
    noiseSource: false,
    noiseBufferRequired: 0,
  },
  stairs: {
    type: 'stairs',
    name: 'Stairs',
    cost: 5000,
    width: 8, // VERIFIED: 8 tiles
    height: 1, // Connects floors
    capacity: 0,
    incomePerQuarter: 0,
    maintenancePerQuarter: 0,
    unlockStar: 1,
    category: 'infrastructure',
    noiseSensitive: false,
    noiseSource: false,
    noiseBufferRequired: 0,
  },
  escalator: {
    type: 'escalator',
    name: 'Escalator',
    cost: 20000,
    width: 8, // VERIFIED: 8 tiles
    height: 1,
    capacity: 0,
    incomePerQuarter: 0,
    maintenancePerQuarter: 5000,
    unlockStar: 3, // VERIFIED: 3★
    category: 'infrastructure',
    noiseSensitive: false,
    noiseSource: false,
    noiseBufferRequired: 0,
  },
  parkingRamp: {
    type: 'parkingRamp',
    name: 'Parking Ramp',
    cost: 50000,
    width: 1,
    height: 1,
    capacity: 0,
    incomePerQuarter: 0,
    maintenancePerQuarter: 0,
    unlockStar: 1,
    category: 'infrastructure',
    noiseSensitive: false,
    noiseSource: false,
    noiseBufferRequired: 0,
  },
  parkingSpace: {
    type: 'parkingSpace',
    name: 'Parking Space',
    cost: 3000,
    width: 4,
    height: 1,
    capacity: 1,
    incomePerQuarter: 0,
    maintenancePerQuarter: 0,
    unlockStar: 1,
    category: 'infrastructure',
    noiseSensitive: false,
    noiseSource: false,
    noiseBufferRequired: 0,
  },

  // Services
  housekeeping: {
    type: 'housekeeping',
    name: 'Housekeeping',
    cost: 50000,
    width: 15, // VERIFIED: 15 tiles
    height: 1,
    capacity: 0,
    incomePerQuarter: 0,
    maintenancePerQuarter: 10000,
    unlockStar: 2, // VERIFIED: 2★
    category: 'service',
    noiseSensitive: false,
    noiseSource: false,
    noiseBufferRequired: 0,
  },
  security: {
    type: 'security',
    name: 'Security Office',
    cost: 100000,
    width: 16, // VERIFIED: 16 tiles
    height: 1,
    capacity: 0,
    incomePerQuarter: 0,
    maintenancePerQuarter: 20000,
    unlockStar: 2, // VERIFIED: 2★
    category: 'service',
    noiseSensitive: false,
    noiseSource: false,
    noiseBufferRequired: 0,
  },
  medical: {
    type: 'medical',
    name: 'Medical Center',
    cost: 500000,
    width: 26, // VERIFIED: 26 tiles
    height: 1,
    capacity: 0,
    incomePerQuarter: 0,
    maintenancePerQuarter: 0,
    unlockStar: 3,
    category: 'service',
    noiseSensitive: false,
    noiseSource: false,
    noiseBufferRequired: 0,
  },
  recycling: {
    type: 'recycling',
    name: 'Recycling Center',
    cost: 500000,
    width: 25,
    height: 2,
    capacity: 0,
    incomePerQuarter: 0,
    maintenancePerQuarter: 50000,
    unlockStar: 3,
    category: 'service',
    noiseSensitive: false,
    noiseSource: false,
    noiseBufferRequired: 0,
  },

  // Landmarks
  metro: {
    type: 'metro',
    name: 'Metro Station',
    cost: 1000000,
    width: 32,
    height: 2,
    capacity: 0,
    incomePerQuarter: 0,
    maintenancePerQuarter: 0,
    unlockStar: 5,
    category: 'landmark',
    noiseSensitive: false,
    noiseSource: false,
    noiseBufferRequired: 0,
  },
  cathedral: {
    type: 'cathedral',
    name: 'Cathedral',
    cost: 3000000,
    width: 32,
    height: 3,
    capacity: 0,
    incomePerQuarter: 0,
    maintenancePerQuarter: 0,
    unlockStar: 5, // Requires TOWER status
    category: 'landmark',
    noiseSensitive: false,
    noiseSource: false,
    noiseBufferRequired: 0,
  },
};

/**
 * Building count limits
 */
export interface BuildingCounts {
  elevatorShafts: number; // Max 24
  stairs: number; // Max 64 combined with escalators
  escalators: number; // Max 64 combined with stairs
  commercial: number; // Max 512 (fastFood + restaurant + shop)
  parkingSpaces: number; // Max 512
  medical: number; // Max 10
  security: number; // Max 10
  entertainment: number; // Max 16 (partyHall + cinema)
  metro: number; // Max 1
  cathedral: number; // Max 1
}

/**
 * Building instance interface
 */
export interface IBuilding {
  readonly id: string;
  readonly type: BuildingType;
  position: Position;
  width: number;
  height: number;
  floors: number[]; // For multi-floor buildings

  state: BuildingState;
  stress: number; // 0-100 (stress, not satisfaction)

  occupantIds: string[]; // Person IDs
  incomePerQuarter: number;
  maintenanceCostPerQuarter: number;

  // Tenant lifecycle (Evaluation Day mechanic)
  lastEvaluationDate: number | null;
  consecutiveBadEvals: number;
  vacantSince: number | null;

  // Lifecycle methods
  onPlaced(context: ITowerContext): void;
  onDemolished(): { refund: number };
  onQuarterTick(context: ITowerContext): QuarterlyReport;

  // Queries
  canAcceptPerson(personId: string): boolean;
  getCapacity(): number;
  getCurrentOccupancy(): number;

  // Serialization
  serialize(): BuildingData;
}

export interface QuarterlyReport {
  income: number;
  maintenance: number;
  satisfaction: number;
  events: string[];
}

export interface BuildingData {
  id: string;
  type: BuildingType;
  position: Position;
  state: BuildingState;
  stress: number;
  occupantIds: string[];
  lastEvaluationDate: number | null;
  consecutiveBadEvals: number;
  vacantSince: number | null;
}
