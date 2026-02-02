/**
 * Economy System Tests
 * 
 * Verifies the economy system functions correctly and maintains balance.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EconomySystem } from '../EconomySystem';
import { createTower } from '../Tower';
import type { Tower, Building } from '@/interfaces';

describe('EconomySystem', () => {
  let economySystem: EconomySystem;
  let tower: Tower;

  beforeEach(() => {
    economySystem = new EconomySystem();
    tower = createTower('Test Tower');
  });

  describe('Initialization', () => {
    it('should start with no reports', () => {
      expect(economySystem.getLatestReport()).toBeNull();
      expect(economySystem.getQuarterNumber()).toBe(0);
    });

    it('should have clean bankruptcy state', () => {
      const bankruptcy = economySystem.getBankruptcyState();
      expect(bankruptcy.isInDebt).toBe(false);
      expect(bankruptcy.debtAmount).toBe(0);
    });
  });

  describe('Quarterly Collection', () => {
    it('should collect office rent', () => {
      // Add an office
      const office: Partial<Building> = {
        id: 'office-1',
        type: 'office',
        state: 'active',
        position: { floor: 1, startTile: 0, endTile: 9 },
        incomePerQuarter: 10000,
        maintenanceCostPerQuarter: 0,
        occupantIds: ['worker-1', 'worker-2', 'worker-3'], // 50% occupied (3/6)
      };
      tower.buildingsById['office-1'] = office as Building;

      const startingFunds = tower.funds;

      // Advance 900 ticks (1 quarter)
      economySystem.update(tower, tower.clock, 900);

      // Should have collected ~$5,000 (50% of $10K)
      const report = economySystem.getLatestReport();
      expect(report).not.toBeNull();
      expect(report!.officeRent).toBeGreaterThan(4000);
      expect(report!.officeRent).toBeLessThan(6000);
    });

    it('should apply floor-level rent bonuses', () => {
      // Ground floor office
      const groundOffice: Partial<Building> = {
        id: 'office-ground',
        type: 'office',
        state: 'active',
        position: { floor: 1, startTile: 0, endTile: 9 },
        incomePerQuarter: 10000,
        maintenanceCostPerQuarter: 0,
        occupantIds: ['w1', 'w2', 'w3', 'w4', 'w5', 'w6'], // Fully occupied
      };

      // Floor 10 office
      const highOffice: Partial<Building> = {
        id: 'office-high',
        type: 'office',
        state: 'active',
        position: { floor: 10, startTile: 20, endTile: 29 },
        incomePerQuarter: 10000,
        maintenanceCostPerQuarter: 0,
        occupantIds: ['w7', 'w8', 'w9', 'w10', 'w11', 'w12'], // Fully occupied
      };

      tower.buildingsById['office-ground'] = groundOffice as Building;
      tower.buildingsById['office-high'] = highOffice as Building;

      // Advance 1 quarter
      economySystem.update(tower, tower.clock, 900);

      const report = economySystem.getLatestReport();
      
      // Ground office: $10,000
      // Floor 10 office: $10,000 * (1 + 0.02 * 10) = $12,000
      // Total: $22,000
      expect(report!.officeRent).toBeGreaterThan(21000);
      expect(report!.officeRent).toBeLessThan(23000);
    });

    it('should deduct utilities', () => {
      // Add some floors and population
      tower.floorsById[1] = { level: 1, tileOccupancy: [], buildingIds: [], personIds: [], hasLobby: false, lobbySegments: 0 };
      tower.floorsById[2] = { level: 2, tileOccupancy: [], buildingIds: [], personIds: [], hasLobby: false, lobbySegments: 0 };
      tower.population = 50;

      // Advance 1 quarter
      economySystem.update(tower, tower.clock, 900);

      const report = economySystem.getLatestReport();
      
      // Base $5K + 2 floors * $500 + 50 people * ($50 + $30)
      // = $5,000 + $1,000 + $4,000 = $10,000
      expect(report!.utilities).toBe(10000);
    });
  });

  describe('Hotel Revenue', () => {
    it('should accumulate hotel checkouts', () => {
      // Register 5 single room checkouts (2 nights each)
      for (let i = 0; i < 5; i++) {
        economySystem.registerHotelCheckout('hotelSingle', 2);
      }

      // Check pending income
      const pending = economySystem.getPendingIncome();
      expect(pending.hotel).toBe(1000); // 5 rooms * $100/night * 2 nights

      // Advance 1 quarter to collect
      economySystem.update(tower, tower.clock, 900);

      const report = economySystem.getLatestReport();
      expect(report!.hotelRevenue).toBe(1000);

      // Pending should be cleared
      const pendingAfter = economySystem.getPendingIncome();
      expect(pendingAfter.hotel).toBe(0);
    });

    it('should handle different room types', () => {
      economySystem.registerHotelCheckout('hotelSingle', 1); // $100
      economySystem.registerHotelCheckout('hotelTwin', 1);   // $150
      economySystem.registerHotelCheckout('hotelSuite', 1);  // $300

      const pending = economySystem.getPendingIncome();
      expect(pending.hotel).toBe(550);
    });
  });

  describe('Food & Shop Revenue', () => {
    it('should track food customers', () => {
      const restaurant: Partial<Building> = {
        id: 'restaurant-1',
        type: 'restaurant',
        state: 'active',
        position: { floor: 1, startTile: 0, endTile: 24 },
        incomePerQuarter: 0,
        maintenanceCostPerQuarter: 0,
        occupantIds: [],
      };
      tower.buildingsById['restaurant-1'] = restaurant as Building;

      // Register 20 customers
      for (let i = 0; i < 20; i++) {
        economySystem.registerFoodCustomer('restaurant-1');
      }

      // Advance 1 quarter
      economySystem.update(tower, tower.clock, 900);

      const report = economySystem.getLatestReport();
      
      // 20 customers * $25 = $500
      expect(report!.restaurantRevenue).toBe(500);
    });

    it('should track shop customers', () => {
      const shop: Partial<Building> = {
        id: 'shop-1',
        type: 'shop',
        state: 'active',
        position: { floor: 1, startTile: 0, endTile: 12 },
        incomePerQuarter: 0,
        maintenanceCostPerQuarter: 0,
        occupantIds: [],
      };
      tower.buildingsById['shop-1'] = shop as Building;

      // Register 10 shoppers
      for (let i = 0; i < 10; i++) {
        economySystem.registerShopCustomer('shop-1');
      }

      // Advance 1 quarter
      economySystem.update(tower, tower.clock, 900);

      const report = economySystem.getLatestReport();
      
      // 10 customers * $15 = $150
      expect(report!.shopRevenue).toBe(150);
    });
  });

  describe('Condo Sales', () => {
    it('should register condo sales with floor bonuses', () => {
      const salePrice1 = economySystem.registerCondoSale(1);
      const salePrice10 = economySystem.registerCondoSale(10);

      // Ground floor: ~$80K
      expect(salePrice1).toBeGreaterThan(60000);
      expect(salePrice1).toBeLessThan(100000);

      // Floor 10: ~$130K (base $80K + $5K * 10)
      expect(salePrice10).toBeGreaterThan(110000);
      expect(salePrice10).toBeLessThan(150000);

      // Higher floors should be more expensive
      expect(salePrice10).toBeGreaterThan(salePrice1);
    });

    it('should accumulate pending condo sales', () => {
      economySystem.registerCondoSale(1);
      economySystem.registerCondoSale(5);

      const pending = economySystem.getPendingIncome();
      expect(pending.condos).toBeGreaterThan(150000); // At least $150K total
    });
  });

  describe('Elevator Maintenance', () => {
    it('should calculate basic elevator maintenance', () => {
      // Add 2 elevator shafts
      tower.elevators = [
        { id: 'elev-1', floors: [1, 2, 3] },
        { id: 'elev-2', floors: [1, 2, 3] },
      ] as any;

      // Trigger elevator age initialization
      economySystem['elevatorAges'].set('elev-1', 0);
      economySystem['elevatorAges'].set('elev-2', 0);

      // Advance 1 quarter
      economySystem.update(tower, tower.clock, 900);

      const report = economySystem.getLatestReport();
      
      // 2 elevators * $2,000 base = $4,000
      expect(report!.elevatorMaintenance).toBeGreaterThanOrEqual(4000);
    });

    it('should increase costs with usage', () => {
      tower.elevators = [{ id: 'elev-1', floors: [1, 2, 3] }] as any;
      economySystem['elevatorAges'].set('elev-1', 0);

      // Register heavy usage (200 trips)
      for (let i = 0; i < 200; i++) {
        economySystem.registerElevatorTrip('elev-1');
      }

      // Advance 1 quarter
      economySystem.update(tower, tower.clock, 900);

      const report = economySystem.getLatestReport();
      
      // Should be more than base $2,000 due to usage
      expect(report!.elevatorMaintenance).toBeGreaterThan(2000);
    });
  });

  describe('Staff Wages', () => {
    it('should calculate security office wages', () => {
      const security: Partial<Building> = {
        id: 'security-1',
        type: 'security',
        state: 'active',
        position: { floor: 1, startTile: 0, endTile: 16 },
        incomePerQuarter: 0,
        maintenanceCostPerQuarter: 0,
        occupantIds: [],
      };
      tower.buildingsById['security-1'] = security as Building;

      // Advance 1 quarter
      economySystem.update(tower, tower.clock, 900);

      const report = economySystem.getLatestReport();
      
      // 1 security office = $15,000/quarter
      expect(report!.staffWages).toBe(15000);
    });

    it('should calculate housekeeping wages', () => {
      const housekeeping: Partial<Building> = {
        id: 'housekeeping-1',
        type: 'housekeeping',
        state: 'active',
        position: { floor: 1, startTile: 0, endTile: 15 },
        incomePerQuarter: 0,
        maintenanceCostPerQuarter: 0,
        occupantIds: [],
      };
      tower.buildingsById['housekeeping-1'] = housekeeping as Building;

      // Advance 1 quarter
      economySystem.update(tower, tower.clock, 900);

      const report = economySystem.getLatestReport();
      
      // 1 housekeeping = $12,000/quarter
      expect(report!.staffWages).toBe(12000);
    });

    it('should calculate hotel desk staff wages', () => {
      // Add 25 hotel rooms (should require 2 desk staff)
      for (let i = 0; i < 25; i++) {
        const hotel: Partial<Building> = {
          id: `hotel-${i}`,
          type: 'hotelSingle',
          state: 'active',
          position: { floor: 2, startTile: i * 5, endTile: i * 5 + 4 },
          incomePerQuarter: 0,
          maintenanceCostPerQuarter: 0,
          occupantIds: [],
        };
        tower.buildingsById[`hotel-${i}`] = hotel as Building;
      }

      // Advance 1 quarter
      economySystem.update(tower, tower.clock, 900);

      const report = economySystem.getLatestReport();
      
      // 25 rooms / 20 = 2 desk staff * $8,000 = $16,000
      expect(report!.staffWages).toBe(16000);
    });
  });

  describe('Bankruptcy System', () => {
    it('should detect negative funds', () => {
      tower.funds = -10000;

      // Advance 1 tick
      economySystem.update(tower, tower.clock, 1);

      const bankruptcy = economySystem.getBankruptcyState();
      expect(bankruptcy.isInDebt).toBe(true);
      expect(bankruptcy.debtAmount).toBe(10000);
    });

    it('should clear bankruptcy when funds recover', () => {
      tower.funds = -10000;
      economySystem.update(tower, tower.clock, 1);

      expect(economySystem.getBankruptcyState().isInDebt).toBe(true);

      // Recover funds
      tower.funds = 50000;
      economySystem.update(tower, tower.clock, 2);

      expect(economySystem.getBankruptcyState().isInDebt).toBe(false);
    });

    it('should track grace period', () => {
      tower.funds = -10000;

      // Advance 1 tick
      economySystem.update(tower, tower.clock, 1);

      const bankruptcy = economySystem.getBankruptcyState();
      
      // Grace period should be BANKRUPTCY_GRACE_PERIOD_TICKS - 1
      expect(bankruptcy.gracePeriodRemaining).toBeGreaterThan(0);
    });
  });

  describe('Economy Stats', () => {
    it('should provide comprehensive stats', () => {
      // Set up tower with some income
      const office: Partial<Building> = {
        id: 'office-1',
        type: 'office',
        state: 'active',
        position: { floor: 1, startTile: 0, endTile: 9 },
        incomePerQuarter: 10000,
        maintenanceCostPerQuarter: 0,
        occupantIds: ['w1', 'w2', 'w3', 'w4', 'w5', 'w6'],
      };
      tower.buildingsById['office-1'] = office as Building;

      // Advance 1 quarter
      economySystem.update(tower, tower.clock, 900);

      const stats = economySystem.getEconomyStats(tower);

      expect(stats.currentFunds).toBeDefined();
      expect(stats.dailyIncome).toBeGreaterThan(0);
      expect(stats.dailyExpenses).toBeGreaterThanOrEqual(0);
      expect(stats.lastReport).not.toBeNull();
    });
  });

  describe('Serialization', () => {
    it('should serialize and deserialize state', () => {
      // Set up some state
      tower.funds = 1500000;
      economySystem.registerHotelCheckout('hotelSingle', 2);
      economySystem.registerCondoSale(5);

      // Advance 1 quarter to generate report
      economySystem.update(tower, tower.clock, 900);

      // Serialize
      const serialized = economySystem.serialize();

      // Create new system and deserialize
      const newSystem = new EconomySystem();
      newSystem.deserialize(serialized);

      // Verify state restored
      expect(newSystem.getQuarterNumber()).toBe(1);
      expect(newSystem.getLatestReport()).not.toBeNull();
    });
  });
});
