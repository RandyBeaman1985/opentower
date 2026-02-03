/**
 * Game Clock - Manages in-game time and simulation ticks
 *
 * Design based on Scalability Architect recommendations:
 * - Decoupled simulation (100ms ticks) from rendering (60fps)
 * - Fixed timestep with accumulator pattern
 * - Deterministic time advancement
 *
 * @module core/Clock
 */

import type { GameClock, GameSpeed } from '@/interfaces';
import { TIMING } from '@/interfaces';
import { getEventBus } from './EventBus';

/**
 * Creates a new game clock with default starting values
 */
export function createGameClock(): GameClock {
  return {
    currentTick: 0,
    gameSecond: 0,
    gameMinute: 0,
    gameHour: 5, // Game starts at 5:00 AM
    gameDay: 1, // Monday
    gameWeek: 1,
    gameQuarter: 1,
    gameYear: 1,
    speed: 1,
    isWeekend: false,
    isRushHour: false,
  };
}

/**
 * Clock manager - handles time advancement and game speed
 */
export class ClockManager {
  private clock: GameClock;
  private accumulator = 0;
  private lastTimestamp = 0;
  private running = false;
  private initialized = false;

  constructor(initialClock?: GameClock) {
    this.clock = initialClock ?? createGameClock();
    // Initialize computed properties
    this.updateComputedProperties();
  }

  /**
   * Get the current clock state (read-only copy)
   */
  getClock(): Readonly<GameClock> {
    return { ...this.clock };
  }

  /** Valid game speed values */
  private static readonly VALID_SPEEDS: readonly GameSpeed[] = [0, 1, 2, 4];

  /**
   * Set game speed (0 = paused, 1 = normal, 2 = fast, 4 = fastest)
   * @throws Error if speed is not a valid GameSpeed value
   */
  setSpeed(speed: GameSpeed): void {
    if (!ClockManager.VALID_SPEEDS.includes(speed)) {
      console.warn(`Invalid game speed: ${speed}. Valid values: ${ClockManager.VALID_SPEEDS.join(', ')}`);
      return;
    }

    const oldSpeed = this.clock.speed;
    if (oldSpeed === speed) return; // No change needed
    
    this.clock.speed = speed;

    getEventBus().emitSync({
      type: 'SPEED_CHANGE',
      oldSpeed,
      newSpeed: speed,
    });
  }

  /**
   * Check if the game is paused
   */
  isPaused(): boolean {
    return this.clock.speed === 0;
  }

  /**
   * Start the clock (call this when game loop starts)
   * @param initialTimestamp - Optional initial timestamp for testing
   */
  start(initialTimestamp?: number): void {
    this.running = true;
    this.lastTimestamp = initialTimestamp ?? performance.now();
    this.accumulator = 0;
    this.initialized = true;
  }

  /**
   * Stop the clock
   */
  stop(): void {
    this.running = false;
  }

  /**
   * Update the clock - call this every frame
   * Returns the number of simulation ticks that should be processed
   *
   * @param currentTime - Current timestamp (from requestAnimationFrame)
   * @returns Number of simulation ticks to process this frame
   */
  update(currentTime: number): number {
    if (!this.running || this.clock.speed === 0) {
      this.lastTimestamp = currentTime;
      return 0;
    }

    // First update after start: initialize lastTimestamp
    if (!this.initialized) {
      this.lastTimestamp = currentTime;
      this.initialized = true;
      return 0;
    }

    const deltaTime = currentTime - this.lastTimestamp;
    this.lastTimestamp = currentTime;

    // Skip negative or zero delta (log for debugging timer issues)
    if (deltaTime <= 0) {
      if (deltaTime < 0) {
        console.warn(`Clock.update: Negative deltaTime detected (${deltaTime}ms). Possible timer issue.`);
      }
      return 0;
    }

    // Apply game speed multiplier
    const scaledDelta = deltaTime * this.clock.speed;
    this.accumulator += scaledDelta;

    // Count how many simulation ticks we need to process
    let tickCount = 0;
    while (this.accumulator >= TIMING.SIMULATION_TICK_MS) {
      this.advanceTick();
      this.accumulator -= TIMING.SIMULATION_TICK_MS;
      tickCount++;

      // Safety: don't process more than 10 ticks per frame
      // This prevents spiral of death if system is lagging
      if (tickCount >= 10) {
        console.warn(`Clock.update: Hit max tick limit (10). System may be lagging. Dropping ${Math.floor(this.accumulator / TIMING.SIMULATION_TICK_MS)} ticks.`);
        this.accumulator = 0;
        break;
      }
    }

    return tickCount;
  }

  /**
   * Get interpolation alpha for smooth rendering
   * Returns 0-1 value representing progress between simulation ticks
   */
  getInterpolationAlpha(): number {
    return this.accumulator / TIMING.SIMULATION_TICK_MS;
  }

  /**
   * Advance one simulation tick
   */
  private advanceTick(): void {
    this.clock.currentTick++;

    // Advance game time
    const gameSecondsToAdd = TIMING.GAME_SECONDS_PER_TICK;
    this.advanceGameTime(gameSecondsToAdd);

    // Emit tick event
    getEventBus().emitSync({
      type: 'TICK',
      gameTime: this.getGameTimeInMinutes(),
      tick: this.clock.currentTick,
    });
  }

  /**
   * Advance game time by the specified seconds
   */
  private advanceGameTime(seconds: number): void {
    const oldHour = this.clock.gameHour;

    // Convert current time to total seconds and add
    const currentTotalSeconds =
      this.clock.gameHour * 3600 + this.clock.gameMinute * 60 + this.clock.gameSecond;
    const newTotalSeconds = currentTotalSeconds + seconds;

    // Calculate new hour, minute, and second
    const newHour = Math.floor(newTotalSeconds / 3600) % 24;
    const newMinute = Math.floor((newTotalSeconds % 3600) / 60);
    const newSecond = newTotalSeconds % 60;

    this.clock.gameSecond = newSecond;
    this.clock.gameMinute = newMinute;
    this.clock.gameHour = newHour;

    // Check for hour change
    if (newHour !== oldHour) {
      getEventBus().emitSync({
        type: 'HOUR_CHANGE',
        hour: newHour,
      });

      // Check for day change (hour wrapped from 23 to 0)
      if (newHour < oldHour) {
        this.advanceDay();
      }
    }

    // Update computed properties
    this.updateComputedProperties();
  }

  /**
   * Advance to the next day
   */
  private advanceDay(): void {
    this.clock.gameDay = (this.clock.gameDay % 7) + 1;

    const isWeekend = this.clock.gameDay >= 6;

    // Emit day change event
    getEventBus().emitSync({
      type: 'DAY_CHANGE',
      day: isWeekend ? 'weekend' : 'weekday',
      dayOfWeek: this.clock.gameDay,
    });

    // Check for week change (Monday)
    if (this.clock.gameDay === 1) {
      this.clock.gameWeek++;

      // Check for quarter change (every 13 weeks)
      if (this.clock.gameWeek > 13) {
        this.advanceQuarter();
      }
    }
  }

  /**
   * Advance to the next quarter
   */
  private advanceQuarter(): void {
    const oldQuarter = this.clock.gameQuarter;

    // Emit quarter end event first
    getEventBus().emitSync({
      type: 'QUARTER_END',
      quarter: oldQuarter,
      year: this.clock.gameYear,
      summary: {
        quarter: oldQuarter,
        year: this.clock.gameYear,
        income: 0, // Will be populated by Economics system
        maintenance: 0,
        netProfit: 0,
        population: 0,
        starRating: 1,
        buildingsByType: {
          condo: 0,
          office: 0,
          fastFood: 0,
          restaurant: 0,
          shop: 0,
          hotelSingle: 0,
          hotelTwin: 0,
          hotelSuite: 0,
          partyHall: 0,
          cinema: 0,
          lobby: 0,
          stairs: 0,
          escalator: 0,
          parkingRamp: 0,
          parkingSpace: 0,
          housekeeping: 0,
          security: 0,
          medical: 0,
          recycling: 0,
          metro: 0,
          cathedral: 0,
        },
        avgElevatorWait: 0,
        avgSatisfaction: 0,
        moveOuts: 0,
        moveIns: 0,
      },
    });

    this.clock.gameWeek = 1;
    this.clock.gameQuarter++;

    // Check for year change
    if (this.clock.gameQuarter > 4) {
      this.clock.gameQuarter = 1;
      this.clock.gameYear++;
    }

    // Emit quarter start event
    getEventBus().emitSync({
      type: 'QUARTER_START',
      quarter: this.clock.gameQuarter,
      year: this.clock.gameYear,
    });
  }

  /**
   * Update computed properties (isWeekend, isRushHour)
   */
  private updateComputedProperties(): void {
    // Weekend is Saturday (6) and Sunday (7)
    this.clock.isWeekend = this.clock.gameDay >= 6;

    // Rush hours on weekdays: 8-9am, 12-1pm, 5-6pm
    if (!this.clock.isWeekend) {
      const hour = this.clock.gameHour;
      this.clock.isRushHour =
        (hour >= 8 && hour < 9) || (hour >= 12 && hour < 13) || (hour >= 17 && hour < 18);
    } else {
      this.clock.isRushHour = false;
    }
  }

  /**
   * Get current game time in total minutes since midnight
   */
  getGameTimeInMinutes(): number {
    return this.clock.gameHour * 60 + this.clock.gameMinute;
  }

  /**
   * Get formatted time string (e.g., "8:32 AM")
   */
  getFormattedTime(): string {
    const hour = this.clock.gameHour;
    const minute = this.clock.gameMinute;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  }

  /**
   * Get formatted date string (e.g., "Mon Q1 Year 1")
   */
  getFormattedDate(): string {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayName = days[this.clock.gameDay - 1] ?? 'Mon';
    return `${dayName} Q${this.clock.gameQuarter} Year ${this.clock.gameYear}`;
  }

  /**
   * Serialize clock state for saving
   */
  serialize(): GameClock {
    return { ...this.clock };
  }

  /**
   * Load clock state from save
   */
  deserialize(data: GameClock): void {
    this.clock = { ...data };
    this.updateComputedProperties();
  }
}
