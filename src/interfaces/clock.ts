/**
 * Game clock and time-related types
 * @module interfaces/clock
 */

/** Game speed settings */
export type GameSpeed = 0 | 1 | 2 | 4; // 0 = paused, 1 = normal, 2 = fast, 4 = fastest

/**
 * Game clock state
 * Tracks in-game time and simulation state
 */
export interface GameClock {
  /** Current simulation tick counter */
  currentTick: number;

  /** In-game minute (0-59) */
  gameMinute: number;

  /** In-game hour (0-23) */
  gameHour: number;

  /** Day of week (1-7, 1=Monday) */
  gameDay: number;

  /** Week number */
  gameWeek: number;

  /** Quarter (1-4) */
  gameQuarter: number;

  /** Year number */
  gameYear: number;

  /** Current game speed */
  speed: GameSpeed;

  /** Computed: is it a weekend? */
  isWeekend: boolean;

  /** Computed: is it rush hour? (8-9am, 12-1pm, 5-6pm weekdays) */
  isRushHour: boolean;
}

/**
 * Time period for scheduling
 */
export interface TimePeriod {
  startHour: number;
  endHour: number;
  days: ('weekday' | 'weekend' | 'all')[];
}

/**
 * Quarterly cycle events
 */
export interface QuarterlyTick {
  quarter: number;
  year: number;
  isYearEnd: boolean;
}

/**
 * Time-based traffic patterns
 * VERIFIED from SimTower mechanics:
 * Weekday:
 *   5-7am: Residents leave condos
 *   8-9am: MAJOR RUSH - Office workers arrive
 *   12-1pm: LUNCH RUSH - Workers to restaurants
 *   1-2pm: Workers return from lunch
 *   5-6pm: MAJOR RUSH - Office workers leave
 *   6-10pm: Entertainment peak
 * Weekend:
 *   9-11am: Late start
 *   12-8pm: Shopping/entertainment focus
 *   Offices EMPTY
 */
export interface TrafficPattern {
  period: TimePeriod;
  multiplier: number; // Traffic intensity multiplier
  affectedPersonTypes: string[];
}

/**
 * Simulation timing constants
 * Based on expert review recommendations:
 * - Decouple simulation from rendering
 * - 100ms simulation ticks (10 ticks per real second)
 * - 60fps rendering with interpolation
 */
export const TIMING = {
  /** Simulation tick interval in milliseconds */
  SIMULATION_TICK_MS: 100,

  /** Game seconds advanced per simulation tick */
  GAME_SECONDS_PER_TICK: 6,

  /** Target render frame rate */
  TARGET_FPS: 60,

  /** Milliseconds per render frame */
  FRAME_MS: 1000 / 60,

  /** Game minutes per real second (at 1x speed) */
  GAME_MINUTES_PER_REAL_SECOND: 1,
} as const;
