/**
 * Debug Clock test to identify the issue
 */

import { describe, it, expect } from 'vitest';

describe('Clock Debug', () => {
  it('should do basic math correctly', () => {
    // Initial time: 5:00 = 18000 seconds
    const initialSeconds = 5 * 3600 + 0 * 60;
    expect(initialSeconds).toBe(18000);

    // After adding 60 seconds
    const newSeconds = initialSeconds + 60;
    expect(newSeconds).toBe(18060);

    // Calculate hour
    const newHour = Math.floor(newSeconds / 3600) % 24;
    expect(newHour).toBe(5);

    // Calculate minute
    const remainder = newSeconds % 3600;
    expect(remainder).toBe(60);

    const newMinute = Math.floor(remainder / 60);
    expect(newMinute).toBe(1);
  });

  it('should verify TIMING import works', async () => {
    const { TIMING } = await import('@/interfaces');
    expect(TIMING.SIMULATION_TICK_MS).toBe(100);
    expect(TIMING.GAME_SECONDS_PER_TICK).toBe(6);
  });

  it('should verify ClockManager advances time', async () => {
    const { ClockManager } = await import('@core/Clock');
    const { resetEventBus, getEventBus } = await import('@core/EventBus');
    const { TIMING } = await import('@/interfaces');

    resetEventBus();

    const clock = new ClockManager();

    // Track TICK events to see what time values are being reported
    const tickTimes: number[] = [];
    getEventBus().on('TICK', (e) => {
      tickTimes.push(e.gameTime);
    });

    // Initial state
    expect(clock.getClock().gameHour).toBe(5);
    expect(clock.getClock().gameMinute).toBe(0);
    expect(clock.getClock().currentTick).toBe(0);

    // Start clock
    clock.start(0);

    // Run 10 ticks
    let currentTime = 0;
    for (let i = 0; i < 10; i++) {
      currentTime += TIMING.SIMULATION_TICK_MS;
      clock.update(currentTime);
    }

    expect(clock.getClock().currentTick).toBe(10);

    // Print debug info
    console.log('Tick times:', tickTimes);
    console.log('Final state:', clock.getClock());
    console.log('Game seconds per tick:', TIMING.GAME_SECONDS_PER_TICK);
    console.log('Expected: 10 ticks * 6 seconds = 60 seconds = 1 minute');

    // After 10 ticks (60 seconds = 1 minute), minute should be 1
    expect(clock.getClock().gameMinute).toBe(1);
  });
});
