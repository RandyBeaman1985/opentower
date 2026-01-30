/**
 * Clock unit tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClockManager, createGameClock } from '@core/Clock';
import { resetEventBus, getEventBus } from '@core/EventBus';
import { TIMING } from '@/interfaces';

describe('ClockManager', () => {
  let clock: ClockManager;

  beforeEach(() => {
    resetEventBus();
    clock = new ClockManager();
  });

  describe('Initial state', () => {
    it('should start at 5:00 AM Monday Q1 Year 1', () => {
      const state = clock.getClock();

      expect(state.gameHour).toBe(5);
      expect(state.gameMinute).toBe(0);
      expect(state.gameDay).toBe(1); // Monday
      expect(state.gameQuarter).toBe(1);
      expect(state.gameYear).toBe(1);
      expect(state.currentTick).toBe(0);
    });

    it('should not be weekend on Monday', () => {
      expect(clock.getClock().isWeekend).toBe(false);
    });

    it('should not be rush hour at 5 AM', () => {
      expect(clock.getClock().isRushHour).toBe(false);
    });
  });

  describe('Speed control', () => {
    it('should set speed correctly', () => {
      clock.setSpeed(2);
      expect(clock.getClock().speed).toBe(2);

      clock.setSpeed(0);
      expect(clock.getClock().speed).toBe(0);
      expect(clock.isPaused()).toBe(true);
    });

    it('should emit SPEED_CHANGE event', () => {
      const callback = vi.fn();
      getEventBus().on('SPEED_CHANGE', callback);

      clock.setSpeed(4);

      expect(callback).toHaveBeenCalledWith({
        type: 'SPEED_CHANGE',
        oldSpeed: 1,
        newSpeed: 4,
      });
    });
  });

  describe('Time advancement', () => {
    it('should advance time on update', () => {
      clock.start(0); // Start at timestamp 0

      // Simulate 100ms passing (1 tick at 1x speed)
      const tickCount = clock.update(TIMING.SIMULATION_TICK_MS);

      expect(tickCount).toBe(1);
      expect(clock.getClock().currentTick).toBe(1);
    });

    it('should emit TICK events', () => {
      const callback = vi.fn();
      getEventBus().on('TICK', callback);

      clock.start(0);
      clock.update(TIMING.SIMULATION_TICK_MS);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should process multiple ticks if time accumulates', () => {
      const callback = vi.fn();
      getEventBus().on('TICK', callback);

      clock.start(0);
      // Simulate 300ms passing (3 ticks)
      clock.update(TIMING.SIMULATION_TICK_MS * 3);

      expect(callback).toHaveBeenCalledTimes(3);
      expect(clock.getClock().currentTick).toBe(3);
    });

    it('should limit ticks per frame to prevent spiral of death', () => {
      const callback = vi.fn();
      getEventBus().on('TICK', callback);

      clock.start(0);
      // Simulate 2 seconds passing (should be capped at 10 ticks)
      clock.update(2000);

      expect(callback).toHaveBeenCalledTimes(10);
    });

    it('should not advance when paused', () => {
      clock.setSpeed(0);
      clock.start(0);

      const tickCount = clock.update(TIMING.SIMULATION_TICK_MS * 10);

      expect(tickCount).toBe(0);
      expect(clock.getClock().currentTick).toBe(0);
    });

    it('should apply speed multiplier', () => {
      clock.setSpeed(4);
      clock.start(0);

      // 100ms at 4x speed = 400ms worth of game time = 4 ticks
      const tickCount = clock.update(TIMING.SIMULATION_TICK_MS);

      expect(tickCount).toBe(4);
    });
  });

  describe('Hour changes', () => {
    it('should emit HOUR_CHANGE event after advancing enough time', () => {
      // Start clock close to an hour boundary for faster test
      const customClock = createGameClock();
      customClock.gameHour = 5;
      customClock.gameMinute = 59;
      customClock.gameSecond = 0; // Explicitly set starting second

      const manager = new ClockManager(customClock);

      const callback = vi.fn();
      getEventBus().on('HOUR_CHANGE', callback);

      manager.start(0);

      // Check initial state
      expect(manager.getClock().gameHour).toBe(5);
      expect(manager.getClock().gameMinute).toBe(59);

      // 1 minute = 60 game seconds
      // At 6 game seconds per tick: 60 / 6 = 10 ticks needed to advance 1 minute
      // Starting at 5:59:00, after 10 ticks we'll be at 6:00:00
      let currentTime = 0;
      let totalTicks = 0;
      for (let i = 0; i < 10; i++) {
        currentTime += TIMING.SIMULATION_TICK_MS;
        const ticks = manager.update(currentTime);
        totalTicks += ticks;
      }

      // Should have processed 10 ticks
      expect(totalTicks).toBe(10);

      // After 10 ticks at 6 seconds each = 60 seconds = 1 minute
      // Starting at 5:59:00, should now be at 6:00:00
      const finalState = manager.getClock();
      expect(finalState.gameMinute).toBe(0); // Should wrap to 0
      expect(finalState.gameHour).toBe(6);

      // Should have emitted HOUR_CHANGE
      expect(callback).toHaveBeenCalled();
    });

    it('should verify ticks advance game time', () => {
      clock.start(0);

      // Verify TIMING constants
      expect(TIMING.SIMULATION_TICK_MS).toBe(100);
      expect(TIMING.GAME_SECONDS_PER_TICK).toBe(6);

      // Run one tick (100ms after start)
      const ticks = clock.update(TIMING.SIMULATION_TICK_MS);

      // Verify one tick was processed
      expect(ticks).toBe(1);

      // Check the tick count
      const state = clock.getClock();
      expect(state.currentTick).toBe(1);

      // After 1 tick: 5:00 + 6 seconds = 5:00:06
      // gameMinute should still be 0
      expect(state.gameMinute).toBe(0);
      expect(state.gameHour).toBe(5);
    });

    it('should track minutes correctly', () => {
      clock.start(0);

      // 1 minute = 60 game seconds
      // At 6 game seconds per tick: 60 / 6 = 10 ticks
      // At 100ms per tick: 10 ticks = 1000ms
      let currentTime = 0;
      for (let i = 0; i < 10; i++) {
        currentTime += TIMING.SIMULATION_TICK_MS;
        clock.update(currentTime);
      }

      const state = clock.getClock();
      // Started at 5:00, after 10 ticks (60 game seconds), should be 5:01
      expect(state.currentTick).toBe(10);
      expect(state.gameMinute).toBe(1);
      expect(state.gameHour).toBe(5);
    });
  });

  describe('Rush hour detection', () => {
    it('should detect rush hour at 8 AM on weekday', () => {
      // Create clock starting at 8 AM
      const customClock = createGameClock();
      customClock.gameHour = 8;
      customClock.gameDay = 1; // Monday

      const manager = new ClockManager(customClock);

      // Computed properties are set in constructor
      expect(manager.getClock().isRushHour).toBe(true);
    });

    it('should not detect rush hour on weekend', () => {
      const customClock = createGameClock();
      customClock.gameHour = 8;
      customClock.gameDay = 6; // Saturday

      const manager = new ClockManager(customClock);

      expect(manager.getClock().isRushHour).toBe(false);
    });
  });

  describe('Weekend detection', () => {
    it('should detect weekend on Saturday', () => {
      const customClock = createGameClock();
      customClock.gameDay = 6;

      const manager = new ClockManager(customClock);

      expect(manager.getClock().isWeekend).toBe(true);
    });

    it('should detect weekend on Sunday', () => {
      const customClock = createGameClock();
      customClock.gameDay = 7;

      const manager = new ClockManager(customClock);

      expect(manager.getClock().isWeekend).toBe(true);
    });

    it('should not detect weekend on Friday', () => {
      const customClock = createGameClock();
      customClock.gameDay = 5;

      const manager = new ClockManager(customClock);

      expect(manager.getClock().isWeekend).toBe(false);
    });
  });

  describe('Interpolation', () => {
    it('should return alpha between 0 and 1', () => {
      clock.start(0);

      // Advance halfway through a tick
      clock.update(TIMING.SIMULATION_TICK_MS / 2);

      const alpha = clock.getInterpolationAlpha();
      expect(alpha).toBeGreaterThanOrEqual(0);
      expect(alpha).toBeLessThanOrEqual(1);
    });
  });

  describe('Formatting', () => {
    it('should format time correctly', () => {
      const customClock = createGameClock();
      customClock.gameHour = 8;
      customClock.gameMinute = 32;

      const manager = new ClockManager(customClock);

      expect(manager.getFormattedTime()).toBe('8:32 AM');
    });

    it('should handle PM times', () => {
      const customClock = createGameClock();
      customClock.gameHour = 14;
      customClock.gameMinute = 5;

      const manager = new ClockManager(customClock);

      expect(manager.getFormattedTime()).toBe('2:05 PM');
    });

    it('should handle midnight', () => {
      const customClock = createGameClock();
      customClock.gameHour = 0;
      customClock.gameMinute = 0;

      const manager = new ClockManager(customClock);

      expect(manager.getFormattedTime()).toBe('12:00 AM');
    });

    it('should format date correctly', () => {
      const customClock = createGameClock();
      customClock.gameDay = 3; // Wednesday
      customClock.gameQuarter = 2;
      customClock.gameYear = 3;

      const manager = new ClockManager(customClock);

      expect(manager.getFormattedDate()).toBe('Wed Q2 Year 3');
    });
  });

  describe('Serialization', () => {
    it('should serialize and deserialize correctly', () => {
      const customClock = createGameClock();
      customClock.gameHour = 14;
      customClock.gameDay = 3;
      customClock.gameQuarter = 2;
      customClock.currentTick = 500;

      const manager = new ClockManager(customClock);
      const serialized = manager.serialize();

      const newManager = new ClockManager();
      newManager.deserialize(serialized);

      expect(newManager.getClock().gameHour).toBe(14);
      expect(newManager.getClock().gameDay).toBe(3);
      expect(newManager.getClock().gameQuarter).toBe(2);
      expect(newManager.getClock().currentTick).toBe(500);
    });
  });
});
