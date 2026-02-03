/**
 * Simulation module exports
 * @module simulation
 */

export { TowerManager, createTower, createFloor } from './Tower';
export { TimeOfDaySystem, TimeOfDay } from './TimeOfDaySystem';
export type { TimeOfDayState, SkyGradient } from './TimeOfDaySystem';
export { TimeSystem, TimeSpeed, DayOfWeek, TimePeriod } from './TimeSystem';
export type { ScheduledEvent, TimeState } from './TimeSystem';
export { BuildingHealthSystem, HealthStatus } from './BuildingHealthSystem';
export type { BuildingHealth } from './BuildingHealthSystem';
