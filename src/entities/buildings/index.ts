/**
 * Buildings Module - All 21 SimTower building types
 * @module entities/buildings
 */

// Factory functions
export {
  createBuilding,
  createCondo,
  createOffice,
  createFastFood,
  createRestaurant,
  createShop,
  createHotelSingle,
  createHotelTwin,
  createHotelSuite,
  createPartyHall,
  createCinema,
  createLobby,
  createStairs,
  createEscalator,
  createParkingRamp,
  createParkingSpace,
  createHousekeeping,
  createSecurity,
  createMedical,
  createRecycling,
  createMetro,
  createCathedral,
  calculateDemolishRefund,
  getBuildingCost,
  isBuildingUnlocked,
  validatePlacement,
} from './BuildingFactory';

// Behavior functions
export {
  calculateQuarterlyIncome,
  calculateQuarterlyMaintenance,
  processQuarterlyTick,
  canAcceptPerson,
  getBuildingCapacity,
  getBuildingRequirements,
  updateBuildingState,
  getStairsComfortLimit,
  getStandardElevatorLimit,
  calculateParkingRequirement,
  getMetroTrafficBonus,
  getSecurityCrimeReduction,
  getMedicalHealthBonus,
  getRecyclingMaintenanceReduction,
  canAchieveTowerStatus,
} from './BuildingBehaviors';

// System
export { BuildingSystem, buildingSystem } from './BuildingSystem';

// Re-export types from interfaces
export type {
  BuildingType,
  BuildingState,
  BuildingConfig,
  BuildingRecord,
  IBuilding,
  QuarterlyReport,
  BuildingData,
  BuildingCounts,
} from '@/interfaces/buildings';

export { BUILDING_CONFIGS } from '@/interfaces/buildings';
