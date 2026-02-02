/**
 * BuildingBehaviors - Handles building-specific behaviors and income calculations
 * @module entities/buildings/BuildingBehaviors
 */

import type { BuildingRecord, BuildingType, QuarterlyReport } from '@/interfaces/buildings';
import type { ITowerContext } from '@/interfaces/tower';
import { BUILDING_CONFIGS } from '@/interfaces/buildings';

/**
 * Calculate quarterly income for a building
 * Handles special cases like view bonuses, occupancy, etc.
 */
export function calculateQuarterlyIncome(
  building: BuildingRecord,
  context: ITowerContext
): number {
  const config = BUILDING_CONFIGS[building.type];
  let income = 0;

  switch (building.type) {
    case 'condo':
      // Condos are one-time purchase, no quarterly income
      // Income comes from initial sale only ($50K-$200K based on stress/quality)
      income = 0;
      break;

    case 'office':
      // Office income based on occupancy (quarterly rent)
      if (building.state === 'active' && building.occupantIds.length > 0) {
        income = config.incomePerQuarter;
      }
      break;

    case 'fastFood':
    case 'shop':
      // Revenue from foot traffic (population-based)
      const trafficMultiplier = Math.min(context.population / 100, 5); // Max 5x at 500 population
      income = config.incomePerQuarter * (0.5 + trafficMultiplier * 0.1);
      break;

    case 'restaurant':
      // Restaurant income with view bonus
      const viewBonus = calculateViewBonus(building.position.floor);
      income = config.incomePerQuarter * (1 + viewBonus);
      break;

    case 'hotelSingle':
    case 'hotelTwin':
    case 'hotelSuite':
      // Hotel income based on occupancy and cleanliness
      if (building.state === 'active' && building.occupantIds.length > 0) {
        // Check if room is clean (housekeeping required)
        const housekeepingAvailable = checkHousekeepingAvailable(context);
        const cleanlinessMultiplier = housekeepingAvailable ? 1.0 : 0.5;
        income = config.incomePerQuarter * cleanlinessMultiplier;
      }
      break;

    case 'partyHall':
    case 'cinema':
      // Entertainment venues - based on population and accessibility
      const entertainmentMultiplier = Math.min(context.population / 200, 2); // Max 2x at 400 population
      income = config.incomePerQuarter * entertainmentMultiplier;
      break;

    case 'lobby':
    case 'stairs':
    case 'escalator':
    case 'parkingRamp':
    case 'parkingSpace':
    case 'housekeeping':
    case 'security':
    case 'medical':
    case 'recycling':
    case 'metro':
    case 'cathedral':
      // Infrastructure and services don't generate direct income
      income = 0;
      break;
  }

  return Math.floor(income);
}

/**
 * Calculate quarterly maintenance cost
 * Some buildings have variable costs based on star rating
 */
export function calculateQuarterlyMaintenance(
  building: BuildingRecord,
  context: ITowerContext
): number {
  const config = BUILDING_CONFIGS[building.type];
  let maintenance = config.maintenancePerQuarter;

  // Lobby maintenance increases with star rating
  if (building.type === 'lobby') {
    if (context.starRating >= 4) {
      maintenance = 1000; // Per segment
    } else if (context.starRating >= 3) {
      maintenance = 300; // Per segment
    } else {
      maintenance = 0;
    }
  }

  return maintenance;
}

/**
 * Calculate view bonus for restaurants (higher floors = better views)
 */
function calculateViewBonus(floor: number): number {
  if (floor <= 5) return 0;
  if (floor <= 10) return 0.1; // +10%
  if (floor <= 20) return 0.2; // +20%
  if (floor <= 40) return 0.3; // +30%
  return 0.5; // +50% for 40+ floors
}

/**
 * Check if housekeeping is available in the tower
 */
function checkHousekeepingAvailable(context: ITowerContext): boolean {
  const housekeepingBuildings = context.getBuildingsByType('housekeeping');
  return housekeepingBuildings.length > 0;
}

/**
 * Process quarterly tick for a building
 * Returns report with income, maintenance, and events
 */
export function processQuarterlyTick(
  building: BuildingRecord,
  context: ITowerContext
): QuarterlyReport {
  const income = calculateQuarterlyIncome(building, context);
  const maintenance = calculateQuarterlyMaintenance(building, context);
  const events: string[] = [];
  let satisfaction = 100;

  // Calculate building-specific satisfaction/stress
  switch (building.type) {
    case 'condo':
    case 'office':
      // Check for noise exposure
      if (hasNoiseExposure(building, context)) {
        satisfaction -= 20;
        events.push('NOISE_COMPLAINT');
      }
      // Check for long elevator wait times
      if (building.stress > 50) {
        satisfaction -= 10;
        events.push('ELEVATOR_COMPLAINTS');
      }
      break;

    case 'hotelSingle':
    case 'hotelTwin':
    case 'hotelSuite':
      // Hotels need housekeeping
      if (!checkHousekeepingAvailable(context)) {
        satisfaction -= 30;
        events.push('DIRTY_ROOMS');
        building.state = 'closed';
      }
      // Check for noise
      if (hasNoiseExposure(building, context)) {
        satisfaction -= 15;
        events.push('NOISE_COMPLAINT');
      }
      break;

    case 'restaurant':
      // Restaurants on low floors get complaints
      if (building.position.floor < 5) {
        satisfaction -= 10;
        events.push('POOR_VIEW');
      }
      break;
  }

  // Evaluation day logic for tenants
  if (building.type === 'office' || building.type === 'condo') {
    const dayOfQuarter = Math.floor((context.currentTime.day - 1) % 90);
    
    // Evaluation day is every 90 days
    if (dayOfQuarter === 0) {
      building.lastEvaluationDate = context.currentTime.day;
      
      if (satisfaction < 60) {
        building.consecutiveBadEvals = (building.consecutiveBadEvals || 0) + 1;
        events.push('BAD_EVALUATION');
        
        // Three consecutive bad evals = tenant leaves
        if (building.consecutiveBadEvals >= 3) {
          building.state = 'vacant';
          building.vacantSince = Date.now();
          building.occupantIds = [];
          events.push('TENANT_LEFT');
        }
      } else {
        building.consecutiveBadEvals = 0;
      }
    }
  }

  return {
    income,
    maintenance,
    satisfaction,
    events,
  };
}

/**
 * Check if building has noise exposure from nearby noise sources
 */
function hasNoiseExposure(building: BuildingRecord, context: ITowerContext): boolean {
  const config = BUILDING_CONFIGS[building.type];
  
  // Only noise-sensitive buildings care
  if (!config.noiseSensitive) {
    return false;
  }

  // Get nearby buildings in range
  const nearbyBuildings = context.getBuildingsInRange(
    { floor: building.position.floor, tile: building.position.startTile },
    config.noiseBufferRequired
  );

  // Check if any nearby building is a noise source
  return nearbyBuildings.some((nearby) => {
    const nearbyConfig = BUILDING_CONFIGS[nearby.type];
    return nearbyConfig.noiseSource;
  });
}

/**
 * Check if a building can accept a new person
 */
export function canAcceptPerson(building: BuildingRecord): boolean {
  const config = BUILDING_CONFIGS[building.type];
  
  // Can't accept if not active
  if (building.state !== 'active' && building.state !== 'vacant') {
    return false;
  }

  // Check capacity
  if (building.occupantIds.length >= config.capacity) {
    return false;
  }

  return true;
}

/**
 * Get building capacity
 */
export function getBuildingCapacity(type: BuildingType): number {
  return BUILDING_CONFIGS[type].capacity;
}

/**
 * Get building requirements (what it needs to function)
 */
export interface BuildingRequirements {
  needsHousekeeping?: boolean;
  needsGroundFloor?: boolean;
  needsUnderground?: boolean;
  needsMinFloor?: number;
  needsTowerStatus?: boolean;
  needsStarRating?: number;
}

export function getBuildingRequirements(type: BuildingType): BuildingRequirements {
  const config = BUILDING_CONFIGS[type];
  const requirements: BuildingRequirements = {
    needsStarRating: config.unlockStar,
  };

  switch (type) {
    case 'lobby':
      requirements.needsGroundFloor = true;
      break;

    case 'hotelSingle':
    case 'hotelTwin':
    case 'hotelSuite':
      requirements.needsHousekeeping = true;
      break;

    case 'parkingRamp':
    case 'parkingSpace':
    case 'metro':
      requirements.needsUnderground = true;
      break;

    case 'restaurant':
      requirements.needsMinFloor = 2;
      break;

    case 'cathedral':
      requirements.needsTowerStatus = true;
      requirements.needsGroundFloor = true;
      break;
  }

  return requirements;
}

/**
 * Handle building state changes
 */
export function updateBuildingState(
  building: BuildingRecord,
  context: ITowerContext
): void {
  // Hotel rooms need housekeeping to be active
  if (
    building.type === 'hotelSingle' ||
    building.type === 'hotelTwin' ||
    building.type === 'hotelSuite'
  ) {
    const hasHousekeeping = checkHousekeepingAvailable(context);
    if (!hasHousekeeping && building.state === 'active') {
      building.state = 'closed';
    } else if (hasHousekeeping && building.state === 'closed') {
      building.state = 'active';
    }
  }

  // Buildings under construction eventually become active
  if (building.state === 'constructing') {
    // Could add construction time logic here
    building.state = 'active';
  }

  // Vacant buildings might attract new tenants
  if (building.state === 'vacant') {
    const vacantTime = building.vacantSince ? Date.now() - building.vacantSince : 0;
    const daysVacant = vacantTime / (1000 * 60 * 60 * 24);
    
    // After 30 days vacant with good conditions, might attract tenant
    if (daysVacant > 30 && building.stress < 30) {
      // Random chance to fill (would be handled by population system)
      // building.state = 'active';
    }
  }
}

/**
 * Special behavior: Stairs have 4-floor comfort limit
 */
export function getStairsComfortLimit(): number {
  return 4;
}

/**
 * Special behavior: Standard elevator has 30-floor limit
 */
export function getStandardElevatorLimit(): number {
  return 30;
}

/**
 * Special behavior: Calculate parking requirements
 * Large buildings (100+ population) require parking
 */
export function calculateParkingRequirement(population: number): number {
  if (population < 100) return 0;
  return Math.ceil(population / 10); // 1 space per 10 people
}

/**
 * Special behavior: Metro station traffic bonus
 * Increases foot traffic to commercial areas
 */
export function getMetroTrafficBonus(hasMetro: boolean): number {
  return hasMetro ? 0.5 : 0; // +50% traffic if metro exists
}

/**
 * Special behavior: Security office reduces crime events
 */
export function getSecurityCrimeReduction(securityCount: number): number {
  return Math.min(securityCount * 0.2, 0.8); // Max 80% reduction with 4+ security
}

/**
 * Special behavior: Medical center reduces health events
 */
export function getMedicalHealthBonus(medicalCount: number): number {
  return Math.min(medicalCount * 0.3, 0.9); // Max 90% reduction with 3+ medical
}

/**
 * Special behavior: Recycling center reduces maintenance costs
 */
export function getRecyclingMaintenanceReduction(hasRecycling: boolean): number {
  return hasRecycling ? 0.1 : 0; // -10% maintenance if recycling exists
}

/**
 * Special behavior: Cathedral is required for TOWER status (6★)
 */
export function canAchieveTowerStatus(hasCathedral: boolean): boolean {
  return hasCathedral;
}
