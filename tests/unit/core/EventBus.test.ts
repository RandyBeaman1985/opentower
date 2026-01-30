/**
 * EventBus unit tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus, resetEventBus } from '@core/EventBus';
import { GamePhase } from '@/interfaces';
import type { BuildingEvent, SimulationEvent } from '@/interfaces';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    resetEventBus();
    bus = new EventBus();
  });

  describe('Basic subscription', () => {
    it('should subscribe to events and receive them', () => {
      const callback = vi.fn();
      bus.on('BUILDING_PLACED', callback);

      const event: BuildingEvent = {
        type: 'BUILDING_PLACED',
        buildingId: '123',
        buildingType: 'office',
        position: { floor: 1, tile: 10 },
      };

      bus.emitSync(event);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(event);
    });

    it('should unsubscribe correctly', () => {
      const callback = vi.fn();
      const subscription = bus.on('BUILDING_PLACED', callback);

      subscription.unsubscribe();

      bus.emitSync({
        type: 'BUILDING_PLACED',
        buildingId: '123',
        buildingType: 'office',
        position: { floor: 1, tile: 10 },
      });

      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle multiple subscribers', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      bus.on('BUILDING_PLACED', callback1);
      bus.on('BUILDING_PLACED', callback2);

      bus.emitSync({
        type: 'BUILDING_PLACED',
        buildingId: '123',
        buildingType: 'office',
        position: { floor: 1, tile: 10 },
      });

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should not call unsubscribed handler', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const sub1 = bus.on('BUILDING_PLACED', callback1);
      bus.on('BUILDING_PLACED', callback2);

      sub1.unsubscribe();

      bus.emitSync({
        type: 'BUILDING_PLACED',
        buildingId: '123',
        buildingType: 'office',
        position: { floor: 1, tile: 10 },
      });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });

  describe('onAny subscription', () => {
    it('should receive multiple event types', () => {
      const callback = vi.fn();
      bus.onAny(['BUILDING_PLACED', 'BUILDING_DEMOLISHED'], callback);

      bus.emitSync({
        type: 'BUILDING_PLACED',
        buildingId: '123',
        buildingType: 'office',
        position: { floor: 1, tile: 10 },
      });

      bus.emitSync({
        type: 'BUILDING_DEMOLISHED',
        buildingId: '123',
        refund: 20000,
      });

      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should not receive unsubscribed event types', () => {
      const callback = vi.fn();
      bus.onAny(['BUILDING_PLACED'], callback);

      bus.emitSync({
        type: 'BUILDING_DEMOLISHED',
        buildingId: '123',
        refund: 20000,
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Async events', () => {
    it('should process async events on next microtask', async () => {
      const callback = vi.fn();
      bus.on('TICK', callback);

      const event: SimulationEvent = {
        type: 'TICK',
        gameTime: 360,
        tick: 1,
      };

      bus.emitAsync(event);

      // Should not be called immediately
      expect(callback).not.toHaveBeenCalled();

      // Wait for microtask
      await Promise.resolve();

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Phased events', () => {
    it('should queue events for specific phase', () => {
      const callback = vi.fn();
      bus.on('TICK', callback);

      bus.queue({ type: 'TICK', gameTime: 360, tick: 1 }, GamePhase.SIMULATION);

      // Should not be called until phase is processed
      expect(callback).not.toHaveBeenCalled();

      bus.processPhase(GamePhase.SIMULATION);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should clear queue after processing', () => {
      const callback = vi.fn();
      bus.on('TICK', callback);

      bus.queue({ type: 'TICK', gameTime: 360, tick: 1 }, GamePhase.SIMULATION);
      bus.processPhase(GamePhase.SIMULATION);
      bus.processPhase(GamePhase.SIMULATION); // Process again

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should report pending count', () => {
      bus.queue({ type: 'TICK', gameTime: 360, tick: 1 }, GamePhase.SIMULATION);
      bus.queue({ type: 'TICK', gameTime: 366, tick: 2 }, GamePhase.SIMULATION);

      expect(bus.getPendingCount(GamePhase.SIMULATION)).toBe(2);
      expect(bus.getPendingCount(GamePhase.RENDER)).toBe(0);

      bus.processPhase(GamePhase.SIMULATION);

      expect(bus.getPendingCount(GamePhase.SIMULATION)).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('should continue processing if handler throws', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      const successCallback = vi.fn();

      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      bus.on('TICK', errorCallback);
      bus.on('TICK', successCallback);

      bus.emitSync({ type: 'TICK', gameTime: 360, tick: 1 });

      expect(errorCallback).toHaveBeenCalled();
      expect(successCallback).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('clear()', () => {
    it('should remove all listeners', () => {
      const callback = vi.fn();
      bus.on('TICK', callback);
      bus.onAny(['BUILDING_PLACED'], callback);

      bus.clear();

      bus.emitSync({ type: 'TICK', gameTime: 360, tick: 1 });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('getListenerCount()', () => {
    it('should return correct count', () => {
      expect(bus.getListenerCount()).toBe(0);

      bus.on('TICK', vi.fn());
      expect(bus.getListenerCount('TICK')).toBe(1);

      bus.on('TICK', vi.fn());
      expect(bus.getListenerCount('TICK')).toBe(2);

      bus.onAny(['BUILDING_PLACED'], vi.fn());
      expect(bus.getListenerCount()).toBe(3);
    });
  });
});
