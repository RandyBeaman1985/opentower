/**
 * Basic setup verification tests
 */

import { describe, it, expect } from 'vitest';
import {
  BUILDING_CONFIGS,
  ELEVATOR_CONFIGS,
  STRESS_THRESHOLDS,
  TIMING,
  SPRITE_DIMENSIONS,
  TOWER_DIMENSIONS,
} from '@/interfaces';

describe('Project Setup', () => {
  it('should have correct TypeScript configuration', () => {
    // If this test runs, TypeScript is configured correctly
    expect(true).toBe(true);
  });

  it('should export building configurations', () => {
    expect(BUILDING_CONFIGS).toBeDefined();
    expect(BUILDING_CONFIGS.office).toBeDefined();
    expect(BUILDING_CONFIGS.office.width).toBe(9); // Verified value
  });

  it('should export elevator configurations', () => {
    expect(ELEVATOR_CONFIGS).toBeDefined();
    expect(ELEVATOR_CONFIGS.standard.maxFloors).toBe(30);
    expect(ELEVATOR_CONFIGS.express.maxFloors).toBe(Infinity);
  });
});

describe('Verified Game Constants', () => {
  describe('Building Sizes (Round 2 Verified)', () => {
    it('should have correct office size (9 tiles)', () => {
      expect(BUILDING_CONFIGS.office.width).toBe(9);
    });

    it('should have correct twin room size (6 tiles)', () => {
      expect(BUILDING_CONFIGS.hotelTwin.width).toBe(6);
    });

    it('should have correct restaurant size (24 tiles)', () => {
      expect(BUILDING_CONFIGS.restaurant.width).toBe(24);
    });

    it('should have correct shop size (12 tiles)', () => {
      expect(BUILDING_CONFIGS.shop.width).toBe(12);
    });

    it('should have correct stairs size (8 tiles)', () => {
      expect(BUILDING_CONFIGS.stairs.width).toBe(8);
    });

    it('should have correct housekeeping size (15 tiles)', () => {
      expect(BUILDING_CONFIGS.housekeeping.width).toBe(15);
    });

    it('should have correct security size (16 tiles)', () => {
      expect(BUILDING_CONFIGS.security.width).toBe(16);
    });

    it('should have correct medical size (26 tiles)', () => {
      expect(BUILDING_CONFIGS.medical.width).toBe(26);
    });
  });

  describe('Unlock Requirements (Round 2 Verified)', () => {
    it('should unlock single room at 2★', () => {
      expect(BUILDING_CONFIGS.hotelSingle.unlockStar).toBe(2);
    });

    it('should unlock twin room at 3★', () => {
      expect(BUILDING_CONFIGS.hotelTwin.unlockStar).toBe(3);
    });

    it('should unlock shop at 3★', () => {
      expect(BUILDING_CONFIGS.shop.unlockStar).toBe(3);
    });

    it('should unlock escalator at 3★', () => {
      expect(BUILDING_CONFIGS.escalator.unlockStar).toBe(3);
    });

    it('should unlock security at 2★', () => {
      expect(BUILDING_CONFIGS.security.unlockStar).toBe(2);
    });
  });

  describe('Stress System (Round 2 Verified)', () => {
    it('should have correct stress thresholds (Black/Pink/Red)', () => {
      expect(STRESS_THRESHOLDS.NORMAL_MAX).toBe(50);
      expect(STRESS_THRESHOLDS.STRESSED_MAX).toBe(80);
      expect(STRESS_THRESHOLDS.CRITICAL_MAX).toBe(100);
    });
  });

  describe('Timing Configuration', () => {
    it('should have simulation tick interval of 100ms', () => {
      expect(TIMING.SIMULATION_TICK_MS).toBe(100);
    });

    it('should advance 6 game seconds per tick', () => {
      expect(TIMING.GAME_SECONDS_PER_TICK).toBe(6);
    });

    it('should target 60fps', () => {
      expect(TIMING.TARGET_FPS).toBe(60);
    });
  });

  describe('Sprite Dimensions', () => {
    it('should use 2x scaling for HD remaster', () => {
      expect(SPRITE_DIMENSIONS.SCALE_FACTOR).toBe(2);
      expect(SPRITE_DIMENSIONS.TILE_WIDTH).toBe(16);
      expect(SPRITE_DIMENSIONS.TILE_HEIGHT).toBe(48);
    });
  });

  describe('Tower Dimensions', () => {
    it('should have correct tower limits', () => {
      expect(TOWER_DIMENSIONS.MAX_WIDTH).toBe(375);
      expect(TOWER_DIMENSIONS.MAX_FLOORS_ABOVE).toBe(100);
      expect(TOWER_DIMENSIONS.MAX_BASEMENT_FLOORS).toBe(10);
    });
  });
});
