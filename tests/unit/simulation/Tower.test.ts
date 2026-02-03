/**
 * Tower unit tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TowerManager, createTower, createFloor } from '@simulation/Tower';
import { resetEventBus, getEventBus } from '@core/EventBus';
import type { Building, BuildingType } from '@/interfaces';

describe('TowerManager', () => {
  let manager: TowerManager;

  beforeEach(() => {
    resetEventBus();
    manager = new TowerManager();
  });

  describe('Initial state', () => {
    it('should create a tower with default values', () => {
      const tower = manager.getTower();

      expect(tower.name).toBe('New Tower');
      expect(tower.funds).toBe(2000000);
      expect(tower.population).toBe(0);
      expect(tower.starRating).toBe(1);
      expect(tower.hasTowerStatus).toBe(false);
    });

    it('should have ground floor by default', () => {
      expect(manager.hasFloor(1)).toBe(true);
      expect(manager.getFloor(1)).toBeDefined();
    });

    it('should have correct floor range', () => {
      const range = manager.getFloorRange();
      expect(range.min).toBe(1);
      expect(range.max).toBe(1);
    });
  });

  describe('Funds management', () => {
    it('should add funds correctly', () => {
      const callback = vi.fn();
      getEventBus().on('FUNDS_CHANGE', callback);

      manager.modifyFunds(100000);

      expect(manager.getFunds()).toBe(2100000);
      expect(callback).toHaveBeenCalledWith({
        type: 'FUNDS_CHANGE',
        oldFunds: 2000000,
        newFunds: 2100000,
        change: 100000,
      });
    });

    it('should subtract funds correctly', () => {
      manager.modifyFunds(-500000);
      expect(manager.getFunds()).toBe(1500000);
    });

    it('should prevent going below zero', () => {
      const callback = vi.fn();
      getEventBus().on('INSUFFICIENT_FUNDS', callback);

      const result = manager.modifyFunds(-3000000);

      expect(result).toBe(false);
      expect(manager.getFunds()).toBe(2000000); // Unchanged
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('Floor management', () => {
    it('should create floors on demand', () => {
      const callback = vi.fn();
      getEventBus().on('FLOOR_CREATED', callback);

      const floor = manager.getOrCreateFloor(5);

      expect(floor.level).toBe(5);
      expect(manager.hasFloor(5)).toBe(true);
      expect(callback).toHaveBeenCalledWith({
        type: 'FLOOR_CREATED',
        level: 5,
      });
    });

    it('should return existing floor without creating', () => {
      manager.getOrCreateFloor(5);

      const callback = vi.fn();
      getEventBus().on('FLOOR_CREATED', callback);

      manager.getOrCreateFloor(5);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should list floor levels in descending order', () => {
      manager.getOrCreateFloor(5);
      manager.getOrCreateFloor(3);
      manager.getOrCreateFloor(-2);

      const levels = manager.getFloorLevels();

      expect(levels).toEqual([5, 3, 1, -2]);
    });
  });

  describe('Building management', () => {
    const createTestBuilding = (
      type: BuildingType = 'office',
      floor: number = 1,
      startTile: number = 10,
      endTile: number = 18
    ): Building => ({
      id: crypto.randomUUID(),
      type,
      position: { floor, startTile, endTile },
      width: endTile - startTile + 1,
      height: 1,
      floors: [floor],
      state: 'active',
      stress: 0,
      occupantIds: [],
      incomePerQuarter: 10000,
      maintenanceCostPerQuarter: 0,
      lastEvaluationDate: null,
      consecutiveBadEvals: 0,
      vacantSince: null,
    });

    it('should add a building successfully', () => {
      const building = createTestBuilding();
      const callback = vi.fn();
      getEventBus().on('BUILDING_PLACED', callback);

      const result = manager.addBuilding(building);

      expect(result).toBe(true);
      expect(manager.getBuilding(building.id)).toBeDefined();
      expect(callback).toHaveBeenCalledWith({
        type: 'BUILDING_PLACED',
        buildingId: building.id,
        buildingType: 'office',
        position: { floor: 1, tile: 10 },
      });
    });

    it('should prevent overlapping buildings', () => {
      const building1 = createTestBuilding('office', 1, 10, 18);
      const building2 = createTestBuilding('office', 1, 15, 23); // Overlaps

      manager.addBuilding(building1);

      const callback = vi.fn();
      getEventBus().on('PLACEMENT_BLOCKED', callback);

      const result = manager.addBuilding(building2);

      expect(result).toBe(false);
      expect(callback).toHaveBeenCalled();
    });

    it('should remove a building', () => {
      const building = createTestBuilding();
      manager.addBuilding(building);

      const callback = vi.fn();
      getEventBus().on('BUILDING_DEMOLISHED', callback);

      const result = manager.removeBuilding(building.id);

      expect(result).toBe(true);
      expect(manager.getBuilding(building.id)).toBeUndefined();
      expect(callback).toHaveBeenCalled();
    });

    it('should get buildings by type', () => {
      const office1 = createTestBuilding('office', 1, 10, 18);
      const office2 = createTestBuilding('office', 1, 50, 58);
      const condo = createTestBuilding('condo', 2, 10, 25);

      manager.addBuilding(office1);
      manager.addBuilding(office2);
      manager.addBuilding(condo);

      const offices = manager.getBuildingsByType('office');
      expect(offices.length).toBe(2);

      const condos = manager.getBuildingsByType('condo');
      expect(condos.length).toBe(1);
    });

    it('should get buildings on a floor', () => {
      const building1 = createTestBuilding('office', 1, 10, 18);
      const building2 = createTestBuilding('office', 1, 50, 58);
      const building3 = createTestBuilding('condo', 2, 10, 25);

      manager.addBuilding(building1);
      manager.addBuilding(building2);
      manager.addBuilding(building3);

      const floor1Buildings = manager.getBuildingsOnFloor(1);
      expect(floor1Buildings.length).toBe(2);

      const floor2Buildings = manager.getBuildingsOnFloor(2);
      expect(floor2Buildings.length).toBe(1);
    });
  });

  describe('Population and star rating', () => {
    it('should update population and emit event', () => {
      const callback = vi.fn();
      getEventBus().on('POPULATION_CHANGE', callback);

      manager.updatePopulation(500);

      expect(manager.getPopulation()).toBe(500);
      expect(callback).toHaveBeenCalled();
    });

    it('should progress star rating with population', () => {
      const callback = vi.fn();
      getEventBus().on('STAR_CHANGE', callback);

      // Note: TowerManager's simplified star rating (for backward compatibility)
      // Full star rating progression (2★→5★) is handled by StarRatingSystem in Game.ts
      // This test verifies the legacy system still works (1★→3★ max)

      // 100+ population + 50% happiness + $10K income = 2 stars
      manager.updateStarRatingFactors(50, 10000);  // Check with current pop (0)
      manager.updatePopulation(100);
      manager.updateStarRatingFactors(50, 10000);  // Recheck with new pop
      expect(manager.getStarRating()).toBe(2);

      // 500+ population + 60% happiness + $50K income = 3 stars
      manager.updatePopulation(500);
      manager.updateStarRatingFactors(60, 50000);
      expect(manager.getStarRating()).toBe(3);

      // Events triggered by both updatePopulation (checkStarProgression) 
      // and updateStarRatingFactors (when rating actually changes)
      expect(callback).toHaveBeenCalled();
      expect(manager.getStarRating()).toBe(3); // Verify final state
    });
  });

  describe('Serialization', () => {
    it('should serialize and deserialize correctly', () => {
      const building = {
        id: 'test-building',
        type: 'office' as BuildingType,
        position: { floor: 1, startTile: 10, endTile: 18 },
        width: 9,
        height: 1,
        floors: [1],
        state: 'active' as const,
        stress: 0,
        occupantIds: [],
        incomePerQuarter: 10000,
        maintenanceCostPerQuarter: 0,
        lastEvaluationDate: null,
        consecutiveBadEvals: 0,
        vacantSince: null,
      };

      manager.addBuilding(building);
      manager.updatePopulation(500);

      const serialized = manager.serialize();

      const newManager = new TowerManager();
      newManager.deserialize(serialized);

      expect(newManager.getPopulation()).toBe(500);
      expect(newManager.getBuilding('test-building')).toBeDefined();
    });
  });
});

describe('createFloor', () => {
  it('should create a floor with correct structure', () => {
    const floor = createFloor(5);

    expect(floor.level).toBe(5);
    expect(floor.tileOccupancy.length).toBe(375);
    expect(floor.tileOccupancy.every((t) => t === -1)).toBe(true);
    expect(floor.buildingIds).toEqual([]);
    expect(floor.personIds).toEqual([]);
    expect(floor.hasLobby).toBe(false);
  });
});

describe('createTower', () => {
  it('should create a tower with custom name', () => {
    const tower = createTower('My Tower');

    expect(tower.name).toBe('My Tower');
    expect(tower.id).toBeDefined();
    expect(tower.schemaVersion).toBe(1);
  });
});
