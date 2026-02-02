/**
 * BUILDINGS.ts - Quick reference for all 21 building types
 * Import this for autocomplete and type safety
 */

import { BUILDING_CONFIGS } from '@/interfaces/buildings';
import type { BuildingType } from '@/interfaces/buildings';

/**
 * All 21 building types categorized
 */
export const BUILDINGS = {
  // RESIDENTIAL (1 type)
  RESIDENTIAL: {
    CONDO: 'condo' as const,
  },

  // COMMERCIAL (4 types)
  COMMERCIAL: {
    OFFICE: 'office' as const,
    FAST_FOOD: 'fastFood' as const,
    RESTAURANT: 'restaurant' as const,
    SHOP: 'shop' as const,
  },

  // HOTEL (3 types)
  HOTEL: {
    SINGLE: 'hotelSingle' as const,
    TWIN: 'hotelTwin' as const,
    SUITE: 'hotelSuite' as const,
  },

  // ENTERTAINMENT (2 types)
  ENTERTAINMENT: {
    PARTY_HALL: 'partyHall' as const,
    CINEMA: 'cinema' as const,
  },

  // INFRASTRUCTURE (5 types)
  INFRASTRUCTURE: {
    LOBBY: 'lobby' as const,
    STAIRS: 'stairs' as const,
    ESCALATOR: 'escalator' as const,
    PARKING_RAMP: 'parkingRamp' as const,
    PARKING_SPACE: 'parkingSpace' as const,
  },

  // SERVICES (4 types)
  SERVICES: {
    HOUSEKEEPING: 'housekeeping' as const,
    SECURITY: 'security' as const,
    MEDICAL: 'medical' as const,
    RECYCLING: 'recycling' as const,
  },

  // LANDMARKS (2 types)
  LANDMARKS: {
    METRO: 'metro' as const,
    CATHEDRAL: 'cathedral' as const,
  },
} as const;

/**
 * Flat list of all building types
 */
export const ALL_BUILDING_TYPES: readonly BuildingType[] = [
  // Residential
  'condo',
  // Commercial
  'office',
  'fastFood',
  'restaurant',
  'shop',
  // Hotel
  'hotelSingle',
  'hotelTwin',
  'hotelSuite',
  // Entertainment
  'partyHall',
  'cinema',
  // Infrastructure
  'lobby',
  'stairs',
  'escalator',
  'parkingRamp',
  'parkingSpace',
  // Services
  'housekeeping',
  'security',
  'medical',
  'recycling',
  // Landmarks
  'metro',
  'cathedral',
] as const;

/**
 * Buildings by star rating unlock
 */
export const BUILDINGS_BY_STAR = {
  '1': ['condo', 'office', 'fastFood', 'lobby', 'stairs', 'parkingRamp', 'parkingSpace'] as BuildingType[],
  '2': ['hotelSingle', 'restaurant', 'housekeeping', 'security'] as BuildingType[],
  '3': ['hotelTwin', 'hotelSuite', 'shop', 'escalator', 'partyHall', 'cinema', 'medical', 'recycling'] as BuildingType[],
  '4': [] as BuildingType[],
  '5': ['metro'] as BuildingType[],
  '6': ['cathedral'] as BuildingType[], // TOWER status
} as const;

/**
 * Buildings by category
 */
export const BUILDINGS_BY_CATEGORY = {
  residential: ['condo'] as BuildingType[],
  commercial: ['office', 'fastFood', 'restaurant', 'shop'] as BuildingType[],
  hotel: ['hotelSingle', 'hotelTwin', 'hotelSuite'] as BuildingType[],
  entertainment: ['partyHall', 'cinema'] as BuildingType[],
  infrastructure: ['lobby', 'stairs', 'escalator', 'parkingRamp', 'parkingSpace'] as BuildingType[],
  service: ['housekeeping', 'security', 'medical', 'recycling'] as BuildingType[],
  landmark: ['metro', 'cathedral'] as BuildingType[],
} as const;

/**
 * Buildings that generate income
 */
export const INCOME_BUILDINGS: readonly BuildingType[] = [
  'office',
  'fastFood',
  'restaurant',
  'shop',
  'hotelSingle',
  'hotelTwin',
  'hotelSuite',
  'partyHall',
  'cinema',
] as const;

/**
 * Buildings that require maintenance
 */
export const MAINTENANCE_BUILDINGS: readonly BuildingType[] = [
  'escalator',
  'housekeeping',
  'security',
  'recycling',
  'lobby', // variable by star rating
] as const;

/**
 * Noise sources
 */
export const NOISE_SOURCES: readonly BuildingType[] = [
  'fastFood',
  'restaurant',
  'partyHall',
  'cinema',
] as const;

/**
 * Noise-sensitive buildings
 */
export const NOISE_SENSITIVE: readonly BuildingType[] = [
  'condo',
  'office',
  'hotelSingle',
  'hotelTwin',
  'hotelSuite',
] as const;

/**
 * Buildings with special requirements
 */
export const SPECIAL_REQUIREMENTS = {
  needsHousekeeping: ['hotelSingle', 'hotelTwin', 'hotelSuite'] as BuildingType[],
  groundFloorOnly: ['lobby', 'cathedral'] as BuildingType[],
  undergroundOnly: ['parkingRamp', 'parkingSpace', 'metro'] as BuildingType[],
  needsTowerStatus: ['cathedral'] as BuildingType[],
} as const;

/**
 * Quick stats for all buildings
 */
export const BUILDING_STATS = {
  totalTypes: ALL_BUILDING_TYPES.length, // 21
  incomeGenerators: INCOME_BUILDINGS.length, // 9
  maintenanceCost: MAINTENANCE_BUILDINGS.length, // 5
  noiseSources: NOISE_SOURCES.length, // 4
  noiseSensitive: NOISE_SENSITIVE.length, // 5
  landmarks: BUILDINGS_BY_CATEGORY.landmark.length, // 2
} as const;

/**
 * Get building config by type (typed wrapper)
 */
export function getBuildingConfig(type: BuildingType) {
  return BUILDING_CONFIGS[type];
}

/**
 * Check if building generates income
 */
export function isIncomeBuilding(type: BuildingType): boolean {
  return INCOME_BUILDINGS.includes(type);
}

/**
 * Check if building requires maintenance
 */
export function requiresMaintenance(type: BuildingType): boolean {
  return MAINTENANCE_BUILDINGS.includes(type);
}

/**
 * Check if building is a noise source
 */
export function isNoiseSource(type: BuildingType): boolean {
  return NOISE_SOURCES.includes(type);
}

/**
 * Check if building is noise-sensitive
 */
export function isNoiseSensitive(type: BuildingType): boolean {
  return NOISE_SENSITIVE.includes(type);
}

/**
 * Get all buildings available at a star rating
 */
export function getAvailableBuildings(starRating: 1 | 2 | 3 | 4 | 5 | 6): BuildingType[] {
  const available: BuildingType[] = [];
  
  for (let star = 1; star <= starRating; star++) {
    const key = star.toString() as keyof typeof BUILDINGS_BY_STAR;
    available.push(...BUILDINGS_BY_STAR[key]);
  }
  
  return available;
}

/**
 * Pretty print all building types
 */
export function printAllBuildings(): void {
  console.log('=== OpenTower: All 21 Building Types ===\n');
  
  for (const category of Object.keys(BUILDINGS_BY_CATEGORY)) {
    const buildings = BUILDINGS_BY_CATEGORY[category as keyof typeof BUILDINGS_BY_CATEGORY];
    console.log(`${category.toUpperCase()} (${buildings.length}):`);
    
    for (const type of buildings) {
      const config = BUILDING_CONFIGS[type];
      console.log(`  - ${config.name}: $${config.cost.toLocaleString()} | ${config.width}×${config.height} | ${config.unlockStar}★`);
    }
    console.log('');
  }
  
  console.log(`Total: ${ALL_BUILDING_TYPES.length} building types`);
}
