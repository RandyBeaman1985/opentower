/**
 * Time of Day System - Manages day/night cycle and visual time periods
 *
 * Divides the 24-hour game day into visual periods with smooth transitions.
 *
 * @module simulation/TimeOfDaySystem
 */

export enum TimeOfDay {
  NIGHT = 'NIGHT',       // 0:00 - 5:59 (midnight to dawn)
  DAWN = 'DAWN',         // 6:00 - 7:59 (sunrise)
  MORNING = 'MORNING',   // 8:00 - 11:59
  AFTERNOON = 'AFTERNOON', // 12:00 - 16:59
  DUSK = 'DUSK',         // 17:00 - 18:59 (sunset)
  EVENING = 'EVENING',   // 19:00 - 23:59
}

export interface SkyGradient {
  topColor: number;
  bottomColor: number;
  alpha: number;
}

export interface TimeOfDayState {
  period: TimeOfDay;
  label: string;
  skyGradient: SkyGradient;
  buildingsShowLights: boolean;
  transitionProgress: number; // 0-1 for smooth transitions
}

/**
 * Time of Day System - visual time tracking
 */
export class TimeOfDaySystem {
  private currentState: TimeOfDayState;

  constructor() {
    this.currentState = this.createState(5); // Start at 5:00 AM
  }

  /**
   * Update based on current game hour
   */
  update(gameHour: number, gameMinute: number): TimeOfDayState {
    this.currentState = this.createState(gameHour, gameMinute);
    return this.currentState;
  }

  /**
   * Get current time of day state
   */
  getState(): TimeOfDayState {
    return { ...this.currentState };
  }

  /**
   * Create time of day state based on hour
   */
  private createState(gameHour: number, gameMinute: number = 0): TimeOfDayState {
    const period = this.getPeriod(gameHour);
    const label = this.getLabel(period, gameHour);
    const skyGradient = this.getSkyGradient(gameHour, gameMinute);
    const buildingsShowLights = this.shouldShowLights(gameHour);
    const transitionProgress = this.getTransitionProgress(gameHour, gameMinute);

    return {
      period,
      label,
      skyGradient,
      buildingsShowLights,
      transitionProgress,
    };
  }

  /**
   * Get time period based on hour
   */
  private getPeriod(hour: number): TimeOfDay {
    if (hour >= 0 && hour < 6) return TimeOfDay.NIGHT;
    if (hour >= 6 && hour < 8) return TimeOfDay.DAWN;
    if (hour >= 8 && hour < 12) return TimeOfDay.MORNING;
    if (hour >= 12 && hour < 17) return TimeOfDay.AFTERNOON;
    if (hour >= 17 && hour < 19) return TimeOfDay.DUSK;
    return TimeOfDay.EVENING;
  }

  /**
   * Get human-readable label
   */
  private getLabel(period: TimeOfDay, _hour: number): string {
    switch (period) {
      case TimeOfDay.NIGHT:
        return 'Night';
      case TimeOfDay.DAWN:
        return 'Dawn';
      case TimeOfDay.MORNING:
        return 'Morning';
      case TimeOfDay.AFTERNOON:
        return 'Afternoon';
      case TimeOfDay.DUSK:
        return 'Dusk';
      case TimeOfDay.EVENING:
        return 'Evening';
    }
  }

  /**
   * Calculate sky gradient colors based on time
   */
  private getSkyGradient(hour: number, minute: number): SkyGradient {
    const time = hour + minute / 60;

    // Night (0-6): Deep blue to lighter blue
    if (time >= 0 && time < 6) {
      const progress = time / 6;
      return {
        topColor: this.lerpColor(0x0a0a2e, 0x1a1a4e, progress),
        bottomColor: this.lerpColor(0x16213e, 0x2a3a5e, progress),
        alpha: 1,
      };
    }

    // Dawn (6-8): Blue to orange/pink
    if (time >= 6 && time < 8) {
      const progress = (time - 6) / 2;
      return {
        topColor: this.lerpColor(0x1a1a4e, 0xff6b6b, progress),
        bottomColor: this.lerpColor(0x2a3a5e, 0xffa07a, progress),
        alpha: 1,
      };
    }

    // Morning (8-12): Bright sky blue
    if (time >= 8 && time < 12) {
      const progress = (time - 8) / 4;
      return {
        topColor: this.lerpColor(0xff6b6b, 0x87ceeb, progress),
        bottomColor: this.lerpColor(0xffa07a, 0xb0d4f1, progress),
        alpha: 1,
      };
    }

    // Afternoon (12-17): Sky blue
    if (time >= 12 && time < 17) {
      return {
        topColor: 0x87ceeb,
        bottomColor: 0xb0d4f1,
        alpha: 1,
      };
    }

    // Dusk (17-19): Blue to orange/purple
    if (time >= 17 && time < 19) {
      const progress = (time - 17) / 2;
      return {
        topColor: this.lerpColor(0x87ceeb, 0xff6b35, progress),
        bottomColor: this.lerpColor(0xb0d4f1, 0xffa07a, progress),
        alpha: 1,
      };
    }

    // Evening (19-24): Orange to deep blue
    if (time >= 19) {
      const progress = (time - 19) / 5;
      return {
        topColor: this.lerpColor(0xff6b35, 0x0a0a2e, progress),
        bottomColor: this.lerpColor(0xffa07a, 0x16213e, progress),
        alpha: 1,
      };
    }

    // Default: day sky
    return {
      topColor: 0x87ceeb,
      bottomColor: 0xb0d4f1,
      alpha: 1,
    };
  }

  /**
   * Determine if buildings should show lights
   */
  private shouldShowLights(hour: number): boolean {
    // Lights on from 6 PM (18:00) to 7 AM (7:00)
    return hour >= 18 || hour < 7;
  }

  /**
   * Get transition progress for smooth animations
   */
  private getTransitionProgress(hour: number, minute: number): number {
    const time = hour + minute / 60;
    const period = this.getPeriod(hour);

    // Calculate progress within current period
    switch (period) {
      case TimeOfDay.NIGHT:
        return time / 6; // 0-6
      case TimeOfDay.DAWN:
        return (time - 6) / 2; // 6-8
      case TimeOfDay.MORNING:
        return (time - 8) / 4; // 8-12
      case TimeOfDay.AFTERNOON:
        return (time - 12) / 5; // 12-17
      case TimeOfDay.DUSK:
        return (time - 17) / 2; // 17-19
      case TimeOfDay.EVENING:
        return (time - 19) / 5; // 19-24
      default:
        return 0;
    }
  }

  /**
   * Linear interpolation between two colors
   */
  private lerpColor(color1: number, color2: number, t: number): number {
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;

    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;

    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);

    return (r << 16) | (g << 8) | b;
  }

  /**
   * Serialize state
   */
  serialize(): TimeOfDayState {
    return { ...this.currentState };
  }

  /**
   * Deserialize state
   */
  deserialize(state: TimeOfDayState): void {
    this.currentState = state;
  }
}
