/**
 * BuildingSystem - Central system for managing all 21 building types
 * @module entities/buildings/BuildingSystem
 */

import type { BuildingRecord, BuildingType, QuarterlyReport } from '@/interfaces/buildings';
import type { ITowerContext } from '@/interfaces/tower';
import { BUILDING_CONFIGS } from '@/interfaces/buildings';
import { createBuilding, validatePlacement, calculateDemolishRefund } from './BuildingFactory';
import {
  processQuarterlyTick,
  canAcceptPerson,
  updateBuildingState,
  getBuildingRequirements,
} from './BuildingBehaviors';

/**
 * BuildingSystem - Manages building lifecycle and interactions
 */
export class BuildingSystem {
  /**
   * Create a new building at the specified position
   */
  createBuilding(
    type: BuildingType,
    floor: number,
    startTile: number,
    context: ITowerContext
  ): BuildingRecord | null {
    // Validate unlock status
    if (!context.isUnlocked(type)) {
      console.warn(`Building type ${type} is not unlocked at current star rating`);
      return null;
    }

    // Validate placement
    const validation = validatePlacement(type, floor, context.starRating >= 6);
    if (!validation.valid) {
      console.warn(`Invalid placement: ${validation.reason}`);
      return null;
    }

    // Check funds
    const cost = BUILDING_CONFIGS[type].cost;
    if (!context.requestFundsChange(-cost, `Build ${type}`)) {
      console.warn(`Insufficient funds to build ${type}`);
      return null;
    }

    // Create building
    const building = createBuilding(type, floor, startTile);
    
    console.log(`Created ${type} at floor ${floor}, tile ${startTile}`);
    return building;
  }

  /**
   * Demolish a building and refund 50% of cost
   */
  demolishBuilding(building: BuildingRecord, context: ITowerContext): number {
    const refund = calculateDemolishRefund(building.type);
    
    // Refund funds
    context.requestFundsChange(refund, `Demolish ${building.type}`);
    
    console.log(`Demolished ${building.type}, refunded $${refund.toLocaleString()}`);
    return refund;
  }

  /**
   * Process quarterly tick for all buildings
   * Returns total income and maintenance
   */
  processQuarterlyTicks(
    buildings: BuildingRecord[],
    context: ITowerContext
  ): { totalIncome: number; totalMaintenance: number; reports: Map<string, QuarterlyReport> } {
    let totalIncome = 0;
    let totalMaintenance = 0;
    const reports = new Map<string, QuarterlyReport>();

    for (const building of buildings) {
      // Update building state first
      updateBuildingState(building, context);

      // Process quarterly tick
      const report = processQuarterlyTick(building, context);
      
      totalIncome += report.income;
      totalMaintenance += report.maintenance;
      
      reports.set(building.id, report);

      // Log significant events
      if (report.events.length > 0) {
        console.log(`Building ${building.id} (${building.type}): ${report.events.join(', ')}`);
      }
    }

    return { totalIncome, totalMaintenance, reports };
  }

  /**
   * Check if a building can accept a new occupant
   */
  canAcceptPerson(building: BuildingRecord): boolean {
    return canAcceptPerson(building);
  }

  /**
   * Add a person to a building
   */
  addPerson(building: BuildingRecord, personId: string, context: ITowerContext): boolean {
    if (!canAcceptPerson(building)) {
      return false;
    }

    building.occupantIds.push(personId);
    
    // If building was vacant, mark as active
    if (building.state === 'vacant') {
      building.state = 'active';
      building.vacantSince = null;
      context.notifyBuildingStateChange(building.id);
    }

    return true;
  }

  /**
   * Remove a person from a building
   */
  removePerson(building: BuildingRecord, personId: string, context: ITowerContext): boolean {
    const index = building.occupantIds.indexOf(personId);
    if (index === -1) {
      return false;
    }

    building.occupantIds.splice(index, 1);

    // If building is now empty, mark as vacant
    if (building.occupantIds.length === 0) {
      building.state = 'vacant';
      building.vacantSince = Date.now();
      context.notifyBuildingStateChange(building.id);
    }

    return true;
  }

  /**
   * Get building requirements
   */
  getRequirements(type: BuildingType) {
    return getBuildingRequirements(type);
  }

  /**
   * Check if all building requirements are met in the tower
   */
  checkRequirements(type: BuildingType, context: ITowerContext): { met: boolean; missing: string[] } {
    const requirements = getBuildingRequirements(type);
    const missing: string[] = [];

    if (requirements.needsStarRating && context.starRating < requirements.needsStarRating) {
      missing.push(`Requires ${requirements.needsStarRating}★ rating`);
    }

    if (requirements.needsTowerStatus && context.starRating < 6) {
      missing.push('Requires TOWER status');
    }

    if (requirements.needsHousekeeping) {
      const housekeeping = context.getBuildingsByType('housekeeping');
      if (housekeeping.length === 0) {
        missing.push('Requires housekeeping service');
      }
    }

    return {
      met: missing.length === 0,
      missing,
    };
  }

  /**
   * Get all buildings of a specific category
   */
  getBuildingsByCategory(
    buildings: BuildingRecord[],
    category: 'residential' | 'commercial' | 'hotel' | 'entertainment' | 'infrastructure' | 'service' | 'landmark'
  ): BuildingRecord[] {
    return buildings.filter((b) => BUILDING_CONFIGS[b.type].category === category);
  }

  /**
   * Calculate tower statistics
   */
  getTowerStats(buildings: BuildingRecord[]): {
    totalBuildings: number;
    byCategory: Record<string, number>;
    totalCapacity: number;
    totalOccupancy: number;
    occupancyRate: number;
  } {
    const byCategory: Record<string, number> = {
      residential: 0,
      commercial: 0,
      hotel: 0,
      entertainment: 0,
      infrastructure: 0,
      service: 0,
      landmark: 0,
    };

    let totalCapacity = 0;
    let totalOccupancy = 0;

    for (const building of buildings) {
      const config = BUILDING_CONFIGS[building.type];
      byCategory[config.category]++;
      totalCapacity += config.capacity;
      totalOccupancy += building.occupantIds.length;
    }

    return {
      totalBuildings: buildings.length,
      byCategory,
      totalCapacity,
      totalOccupancy,
      occupancyRate: totalCapacity > 0 ? (totalOccupancy / totalCapacity) * 100 : 0,
    };
  }
}

/**
 * Singleton instance
 */
export const buildingSystem = new BuildingSystem();
