/**
 * Time System - Central time management for OpenTower
 * 
 * Inspired by SimTower (1995), this system drives the entire gameplay simulation.
 * 
 * Features:
 * - Game ticks (100ms fixed timestep)
 * - 24-hour day/night cycle with visual changes
 * - Weekday vs weekend behavior
 * - Quarterly rent collection
 * - Year tracking
 * - Event scheduling system
 * - Speed controls (Pause, 1x, 3x, 10x)
 * 
 * Architecture:
 * - Wraps ClockManager for time advancement
 * - Integrates TimeOfDaySystem for visuals
 * - Provides scheduling API for gameplay events
 * - Emits time-based events via EventBus
 * 
 * @module simulation/TimeSystem
 */

import type { GameClock, GameSpeed } from '@/interfaces';
import { ClockManager } from '@core/Clock';
import { TimeOfDaySystem, type TimeOfDayState } from './TimeOfDaySystem';
import { getEventBus } from '@core/EventBus';

/**
 * Speed preset enum for easy access
 */
export enum TimeSpeed {
  PAUSED = 0,
  NORMAL = 1,
  FAST = 3,
  ULTRA = 10,
}

/**
 * Day of week enum
 */
export enum DayOfWeek {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7,
}

/**
 * Time period of day for gameplay logic
 */
export enum TimePeriod {
  EARLY_MORNING = 'EARLY_MORNING',   // 12 AM - 6 AM
  MORNING = 'MORNING',                 // 6 AM - 9 AM
  WORK_HOURS = 'WORK_HOURS',          // 9 AM - 5 PM
  EVENING = 'EVENING',                 // 5 PM - 10 PM
  NIGHT = 'NIGHT',                     // 10 PM - 12 AM
}

/**
 * Scheduled event definition
 */
export interface ScheduledEvent {
  id: string;
  name: string;
  description: string;
  hour: number;
  minute?: number;
  recurring: boolean;
  weekdaysOnly?: boolean;
  weekendsOnly?: boolean;
  callback: () => void;
  enabled: boolean;
}

/**
 * Time state snapshot for external systems
 */
export interface TimeState {
  // Raw time values
  tick: number;
  second: number;
  minute: number;
  hour: number;
  day: number;
  week: number;
  quarter: number;
  year: number;
  
  // Speed
  speed: GameSpeed;
  isPaused: boolean;
  
  // Computed states
  isWeekend: boolean;
  isRushHour: boolean;
  dayOfWeek: DayOfWeek;
  timePeriod: TimePeriod;
  
  // Visual state
  timeOfDay: TimeOfDayState;
  
  // Formatted strings
  timeString: string;
  dateString: string;
}

/**
 * Time System - Central coordinator for all time-related functionality
 */
export class TimeSystem {
  private clockManager: ClockManager;
  private timeOfDaySystem: TimeOfDaySystem;
  private scheduledEvents: Map<string, ScheduledEvent>;
  private lastProcessedHour: number = -1;
  
  constructor(clockManager?: ClockManager) {
    this.clockManager = clockManager ?? new ClockManager();
    this.timeOfDaySystem = new TimeOfDaySystem();
    this.scheduledEvents = new Map();
    
    // Register default SimTower-style scheduled events
    this.registerDefaultEvents();
  }
  
  /**
   * Register default scheduled events (SimTower style)
   */
  private registerDefaultEvents(): void {
    // 6 AM: Workers start arriving
    this.scheduleEvent({
      id: 'workers_arrive',
      name: 'Workers Arrive',
      description: 'Office workers begin commuting to work',
      hour: 6,
      minute: 0,
      recurring: true,
      weekdaysOnly: true,
      callback: () => {
        getEventBus().emitSync({
          type: 'TIME_EVENT',
          eventId: 'workers_arrive',
          message: 'Office workers are arriving',
        });
      },
    });
    
    // 9 AM: Offices open
    this.scheduleEvent({
      id: 'offices_open',
      name: 'Offices Open',
      description: 'Office buildings begin full operations',
      hour: 9,
      minute: 0,
      recurring: true,
      weekdaysOnly: true,
      callback: () => {
        getEventBus().emitSync({
          type: 'TIME_EVENT',
          eventId: 'offices_open',
          message: 'Offices are now open',
        });
      },
    });
    
    // 12 PM: Lunch rush
    this.scheduleEvent({
      id: 'lunch_rush',
      name: 'Lunch Rush',
      description: 'Restaurants and fast food get busy',
      hour: 12,
      minute: 0,
      recurring: true,
      callback: () => {
        getEventBus().emitSync({
          type: 'TIME_EVENT',
          eventId: 'lunch_rush',
          message: 'Lunch rush begins!',
        });
      },
    });
    
    // 5 PM: Workers leave
    this.scheduleEvent({
      id: 'workers_leave',
      name: 'Workers Leave',
      description: 'Office workers head home',
      hour: 17,
      minute: 0,
      recurring: true,
      weekdaysOnly: true,
      callback: () => {
        getEventBus().emitSync({
          type: 'TIME_EVENT',
          eventId: 'workers_leave',
          message: 'Office workers are leaving for the day',
        });
      },
    });
    
    // 6 PM: Dinner rush
    this.scheduleEvent({
      id: 'dinner_rush',
      name: 'Dinner Rush',
      description: 'Evening restaurant traffic increases',
      hour: 18,
      minute: 0,
      recurring: true,
      callback: () => {
        getEventBus().emitSync({
          type: 'TIME_EVENT',
          eventId: 'dinner_rush',
          message: 'Dinner rush begins!',
        });
      },
    });
    
    // 10 PM: Hotels fill up
    this.scheduleEvent({
      id: 'hotel_night',
      name: 'Hotel Night Check-in',
      description: 'Hotels reach peak occupancy',
      hour: 22,
      minute: 0,
      recurring: true,
      callback: () => {
        getEventBus().emitSync({
          type: 'TIME_EVENT',
          eventId: 'hotel_night',
          message: 'Hotels are filling up for the night',
        });
      },
    });
    
    // 12 AM: Building quiet
    this.scheduleEvent({
      id: 'midnight_quiet',
      name: 'Midnight',
      description: 'Building activity winds down',
      hour: 0,
      minute: 0,
      recurring: true,
      callback: () => {
        getEventBus().emitSync({
          type: 'TIME_EVENT',
          eventId: 'midnight_quiet',
          message: 'The building is quiet for the night',
        });
      },
    });
  }
  
  /**
   * Update the time system - call this every simulation tick
   * Returns number of ticks processed (for game loop coordination)
   */
  update(currentTime: number): number {
    const tickCount = this.clockManager.update(currentTime);
    
    if (tickCount > 0) {
      const clock = this.clockManager.getClock();
      
      // Update time of day visuals
      this.timeOfDaySystem.update(clock.gameHour, clock.gameMinute);
      
      // Process scheduled events
      this.processScheduledEvents(clock);
    }
    
    return tickCount;
  }
  
  /**
   * Process scheduled events for the current hour
   */
  private processScheduledEvents(clock: GameClock): void {
    const currentHour = clock.gameHour;
    const currentMinute = clock.gameMinute;
    
    // Only process once per hour (when hour changes)
    if (currentHour === this.lastProcessedHour) {
      return;
    }
    
    this.lastProcessedHour = currentHour;
    
    // Check all scheduled events
    for (const event of this.scheduledEvents.values()) {
      if (!event.enabled) continue;
      
      // Check if hour matches
      if (event.hour !== currentHour) continue;
      
      // Check if minute matches (if specified)
      if (event.minute !== undefined && event.minute !== currentMinute) continue;
      
      // Check day of week restrictions
      if (event.weekdaysOnly && clock.isWeekend) continue;
      if (event.weekendsOnly && !clock.isWeekend) continue;
      
      // Execute the event callback
      try {
        event.callback();
      } catch (error) {
        console.error(`Error executing scheduled event ${event.id}:`, error);
      }
    }
  }
  
  /**
   * Schedule a new event
   */
  scheduleEvent(event: Omit<ScheduledEvent, 'enabled'>): void {
    this.scheduledEvents.set(event.id, {
      ...event,
      enabled: true,
    });
  }
  
  /**
   * Remove a scheduled event
   */
  unscheduleEvent(eventId: string): boolean {
    return this.scheduledEvents.delete(eventId);
  }
  
  /**
   * Enable/disable a scheduled event
   */
  setEventEnabled(eventId: string, enabled: boolean): void {
    const event = this.scheduledEvents.get(eventId);
    if (event) {
      event.enabled = enabled;
    }
  }
  
  /**
   * Get all scheduled events
   */
  getScheduledEvents(): ScheduledEvent[] {
    return Array.from(this.scheduledEvents.values());
  }
  
  /**
   * Start the time system
   */
  start(initialTimestamp?: number): void {
    this.clockManager.start(initialTimestamp);
  }
  
  /**
   * Stop the time system
   */
  stop(): void {
    this.clockManager.stop();
  }
  
  // --- Speed Controls ---
  
  /**
   * Set game speed using preset
   */
  setSpeed(speed: TimeSpeed): void {
    this.clockManager.setSpeed(speed as GameSpeed);
  }
  
  /**
   * Set custom game speed
   */
  setCustomSpeed(speed: GameSpeed): void {
    this.clockManager.setSpeed(speed);
  }
  
  /**
   * Pause the game
   */
  pause(): void {
    this.setSpeed(TimeSpeed.PAUSED);
  }
  
  /**
   * Resume at normal speed
   */
  resume(): void {
    this.setSpeed(TimeSpeed.NORMAL);
  }
  
  /**
   * Toggle pause
   */
  togglePause(): void {
    const isPaused = this.isPaused();
    this.setSpeed(isPaused ? TimeSpeed.NORMAL : TimeSpeed.PAUSED);
  }
  
  /**
   * Check if paused
   */
  isPaused(): boolean {
    return this.clockManager.isPaused();
  }
  
  /**
   * Get current speed
   */
  getSpeed(): GameSpeed {
    return this.clockManager.getClock().speed;
  }
  
  // --- Time Queries ---
  
  /**
   * Get current time state snapshot
   */
  getTimeState(): TimeState {
    const clock = this.clockManager.getClock();
    const timeOfDay = this.timeOfDaySystem.getState();
    
    return {
      // Raw values
      tick: clock.currentTick,
      second: clock.gameSecond,
      minute: clock.gameMinute,
      hour: clock.gameHour,
      day: clock.gameDay,
      week: clock.gameWeek,
      quarter: clock.gameQuarter,
      year: clock.gameYear,
      
      // Speed
      speed: clock.speed,
      isPaused: clock.speed === 0,
      
      // Computed
      isWeekend: clock.isWeekend,
      isRushHour: clock.isRushHour,
      dayOfWeek: clock.gameDay as DayOfWeek,
      timePeriod: this.getTimePeriod(clock.gameHour),
      
      // Visual
      timeOfDay,
      
      // Formatted
      timeString: this.clockManager.getFormattedTime(),
      dateString: this.clockManager.getFormattedDate(),
    };
  }
  
  /**
   * Get current hour (0-23)
   */
  getHour(): number {
    return this.clockManager.getClock().gameHour;
  }
  
  /**
   * Get current minute (0-59)
   */
  getMinute(): number {
    return this.clockManager.getClock().gameMinute;
  }
  
  /**
   * Get current day of week
   */
  getDayOfWeek(): DayOfWeek {
    return this.clockManager.getClock().gameDay as DayOfWeek;
  }
  
  /**
   * Check if it's currently a weekend
   */
  isWeekend(): boolean {
    return this.clockManager.getClock().isWeekend;
  }
  
  /**
   * Check if it's currently rush hour
   */
  isRushHour(): boolean {
    return this.clockManager.getClock().isRushHour;
  }
  
  /**
   * Get current quarter (1-4)
   */
  getQuarter(): number {
    return this.clockManager.getClock().gameQuarter;
  }
  
  /**
   * Get current year
   */
  getYear(): number {
    return this.clockManager.getClock().gameYear;
  }
  
  /**
   * Get time period for gameplay logic
   */
  getTimePeriod(hour?: number): TimePeriod {
    const h = hour ?? this.getHour();
    
    if (h >= 0 && h < 6) return TimePeriod.EARLY_MORNING;
    if (h >= 6 && h < 9) return TimePeriod.MORNING;
    if (h >= 9 && h < 17) return TimePeriod.WORK_HOURS;
    if (h >= 17 && h < 22) return TimePeriod.EVENING;
    return TimePeriod.NIGHT;
  }
  
  /**
   * Check if a specific time period is active
   */
  isTimePeriod(period: TimePeriod): boolean {
    return this.getTimePeriod() === period;
  }
  
  /**
   * Get time of day visual state
   */
  getTimeOfDayState(): TimeOfDayState {
    return this.timeOfDaySystem.getState();
  }
  
  /**
   * Get formatted time string (e.g., "8:32 AM")
   */
  getFormattedTime(): string {
    return this.clockManager.getFormattedTime();
  }
  
  /**
   * Get formatted date string (e.g., "Mon Q1 Year 1")
   */
  getFormattedDate(): string {
    return this.clockManager.getFormattedDate();
  }
  
  /**
   * Get total game time in minutes since start
   */
  getGameTimeInMinutes(): number {
    return this.clockManager.getGameTimeInMinutes();
  }
  
  /**
   * Get interpolation alpha for smooth rendering
   */
  getInterpolationAlpha(): number {
    return this.clockManager.getInterpolationAlpha();
  }
  
  // --- Direct Access (for migration) ---
  
  /**
   * Get the underlying ClockManager (for systems that need direct access)
   */
  getClockManager(): ClockManager {
    return this.clockManager;
  }
  
  /**
   * Get the underlying TimeOfDaySystem
   */
  getTimeOfDaySystem(): TimeOfDaySystem {
    return this.timeOfDaySystem;
  }
  
  /**
   * Get the raw clock state (read-only)
   */
  getClock(): Readonly<GameClock> {
    return this.clockManager.getClock();
  }
  
  // --- Serialization ---
  
  /**
   * Serialize time system state for saving
   */
  serialize(): {
    clock: GameClock;
    timeOfDay: TimeOfDayState;
    scheduledEvents: ScheduledEvent[];
  } {
    return {
      clock: this.clockManager.serialize(),
      timeOfDay: this.timeOfDaySystem.serialize(),
      scheduledEvents: Array.from(this.scheduledEvents.values()),
    };
  }
  
  /**
   * Deserialize time system state from save
   */
  deserialize(data: {
    clock: GameClock;
    timeOfDay: TimeOfDayState;
    scheduledEvents?: ScheduledEvent[];
  }): void {
    this.clockManager.deserialize(data.clock);
    this.timeOfDaySystem.deserialize(data.timeOfDay);
    
    // Restore scheduled events (merge with defaults)
    if (data.scheduledEvents) {
      this.scheduledEvents.clear();
      for (const event of data.scheduledEvents) {
        this.scheduledEvents.set(event.id, event);
      }
    }
    
    // Reset hour tracking
    this.lastProcessedHour = -1;
  }
}
