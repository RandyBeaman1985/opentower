/**
 * StarRatingSystem.ts
 * 
 * The progression system that defines your tower's status.
 * Based on SimTower 1995 - where earning stars unlocks new possibilities,
 * and losing them is devastating.
 */

export enum StarRating {
  ONE_STAR = 1,
  TWO_STAR = 2,
  THREE_STAR = 3,
  FOUR_STAR = 4,
  FIVE_STAR = 5,
  TOWER = 6, // The ultimate achievement
}

export interface RatingRequirements {
  population: number;
  minSatisfaction: number; // 0-100
  maxProblems: number; // Active fires, infestations, etc.
  specialEvents?: string[]; // For TOWER: ["vip_visit", "cathedral_built"]
}

export interface RatingUnlocks {
  buildingTypes: string[]; // What you can build
  maxFloors: number; // How high you can go
  landValueMultiplier: number; // Economic impact
  features?: string[]; // Special features unlocked
}

export interface RatingChangeEvent {
  previousRating: StarRating;
  newRating: StarRating;
  timestamp: number;
  reason: string;
}

// The sacred thresholds - tuned for meaningful progression
const RATING_REQUIREMENTS: Record<StarRating, RatingRequirements> = {
  [StarRating.ONE_STAR]: {
    population: 0,
    minSatisfaction: 0,
    maxProblems: 999, // You're just starting, problems are expected
  },
  [StarRating.TWO_STAR]: {
    population: 100,
    minSatisfaction: 60,
    maxProblems: 5,
  },
  [StarRating.THREE_STAR]: {
    population: 300,
    minSatisfaction: 65,
    maxProblems: 3,
  },
  [StarRating.FOUR_STAR]: {
    population: 500,
    minSatisfaction: 70,
    maxProblems: 2,
  },
  [StarRating.FIVE_STAR]: {
    population: 1000,
    minSatisfaction: 75,
    maxProblems: 1,
  },
  [StarRating.TOWER]: {
    population: 2000,
    minSatisfaction: 80,
    maxProblems: 0, // Tower status demands perfection
    specialEvents: ["vip_visit_success", "cathedral_built"],
  },
};

// What each rating unlocks - this is what makes progression exciting
const RATING_UNLOCKS: Record<StarRating, RatingUnlocks> = {
  [StarRating.ONE_STAR]: {
    buildingTypes: ["office", "apartment", "shop", "elevator", "stairs"],
    maxFloors: 10,
    landValueMultiplier: 1.0,
  },
  [StarRating.TWO_STAR]: {
    buildingTypes: ["restaurant", "hotel", "parking"],
    maxFloors: 20,
    landValueMultiplier: 1.3,
    features: ["restaurant_service", "hotel_rooms"],
  },
  [StarRating.THREE_STAR]: {
    buildingTypes: ["express_elevator", "medical_clinic", "security_office"],
    maxFloors: 35,
    landValueMultiplier: 1.6,
    features: ["express_transport", "better_security"],
  },
  [StarRating.FOUR_STAR]: {
    buildingTypes: ["recycling_center", "metro_station", "fitness_center"],
    maxFloors: 50,
    landValueMultiplier: 2.0,
    features: ["metro_connection", "recycling_income"],
  },
  [StarRating.FIVE_STAR]: {
    buildingTypes: ["theater", "spa", "rooftop_restaurant", "helipad"],
    maxFloors: 100,
    landValueMultiplier: 2.5,
    features: ["luxury_amenities", "helipad_access"],
  },
  [StarRating.TOWER]: {
    buildingTypes: ["cathedral", "observation_deck", "broadcast_tower"],
    maxFloors: 150,
    landValueMultiplier: 3.0,
    features: ["tower_status", "maximum_prestige", "vip_visits"],
  },
};

export class StarRatingSystem {
  private currentRating: StarRating = StarRating.ONE_STAR;
  private completedEvents: Set<string> = new Set();
  private ratingHistory: RatingChangeEvent[] = [];
  private listeners: Array<(event: RatingChangeEvent) => void> = [];

  constructor() {
    // Start at 1 star - everyone starts somewhere
  }

  /**
   * Evaluate and update the tower's star rating.
   * This is called frequently - after population changes, satisfaction updates, etc.
   */
  public evaluate(state: {
    population: number;
    satisfaction: number;
    activeProblems: number;
  }): void {
    const newRating = this.calculateRating(state);

    if (newRating !== this.currentRating) {
      this.changeRating(newRating, state);
    }
  }

  /**
   * Calculate what rating the tower deserves right now.
   * Works from highest to lowest - you deserve the highest rating you qualify for.
   */
  private calculateRating(state: {
    population: number;
    satisfaction: number;
    activeProblems: number;
  }): StarRating {
    // Check from TOWER down to ONE_STAR
    const ratings = [
      StarRating.TOWER,
      StarRating.FIVE_STAR,
      StarRating.FOUR_STAR,
      StarRating.THREE_STAR,
      StarRating.TWO_STAR,
      StarRating.ONE_STAR,
    ];

    for (const rating of ratings) {
      if (this.meetsRequirements(rating, state)) {
        return rating;
      }
    }

    return StarRating.ONE_STAR; // Fallback - you always have at least 1 star
  }

  /**
   * Check if current state meets requirements for a specific rating.
   */
  private meetsRequirements(
    rating: StarRating,
    state: { population: number; satisfaction: number; activeProblems: number }
  ): boolean {
    const requirements = RATING_REQUIREMENTS[rating];

    // Population check
    if (state.population < requirements.population) {
      return false;
    }

    // Satisfaction check
    if (state.satisfaction < requirements.minSatisfaction) {
      return false;
    }

    // Problems check (fires, infestations, etc.)
    if (state.activeProblems > requirements.maxProblems) {
      return false;
    }

    // Special events check (only for TOWER)
    if (requirements.specialEvents) {
      for (const event of requirements.specialEvents) {
        if (!this.completedEvents.has(event)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Change the rating and notify all listeners.
   * This is a BIG DEAL - ratings define what you can do.
   */
  private changeRating(
    newRating: StarRating,
    state: { population: number; satisfaction: number; activeProblems: number }
  ): void {
    const previousRating = this.currentRating;
    const isPromotion = newRating > previousRating;
    const isDemotion = newRating < previousRating;

    this.currentRating = newRating;

    // Build a meaningful reason string
    let reason = "";
    if (isPromotion) {
      reason = `Promoted to ${this.getRatingName(newRating)}! `;
      reason += `Population: ${state.population}, Satisfaction: ${state.satisfaction}%`;
    } else if (isDemotion) {
      reason = `DEMOTED to ${this.getRatingName(newRating)}. `;
      if (state.satisfaction < RATING_REQUIREMENTS[previousRating].minSatisfaction) {
        reason += "Satisfaction too low. ";
      }
      if (state.activeProblems > RATING_REQUIREMENTS[previousRating].maxProblems) {
        reason += "Too many problems. ";
      }
      if (state.population < RATING_REQUIREMENTS[previousRating].population) {
        reason += "Population dropped. ";
      }
    }

    const event: RatingChangeEvent = {
      previousRating,
      newRating,
      timestamp: Date.now(),
      reason,
    };

    this.ratingHistory.push(event);

    // Notify all listeners - UI, achievements, unlocks, etc.
    this.listeners.forEach((listener) => listener(event));

    // Log it - this is important!
    console.log(`⭐ RATING CHANGE: ${reason}`);
  }

  /**
   * Mark a special event as completed (e.g., VIP visit, cathedral built).
   * These are required for TOWER status.
   */
  public completeEvent(eventName: string): void {
    this.completedEvents.add(eventName);
    console.log(`✓ Special event completed: ${eventName}`);
  }

  /**
   * Check if an event has been completed.
   */
  public hasCompletedEvent(eventName: string): boolean {
    return this.completedEvents.has(eventName);
  }

  /**
   * Get current rating.
   */
  public getRating(): StarRating {
    return this.currentRating;
  }

  /**
   * Get human-readable rating name.
   */
  public getRatingName(rating?: StarRating): string {
    const r = rating ?? this.currentRating;
    if (r === StarRating.TOWER) return "TOWER";
    return `${r} Star${r > 1 ? "s" : ""}`;
  }

  /**
   * Get unlocks for current rating.
   */
  public getCurrentUnlocks(): RatingUnlocks {
    return RATING_UNLOCKS[this.currentRating];
  }

  /**
   * Get ALL unlocks up to and including current rating.
   * (You keep previous unlocks when you advance)
   */
  public getAllUnlocks(): RatingUnlocks {
    const unlocks: RatingUnlocks = {
      buildingTypes: [],
      maxFloors: 0,
      landValueMultiplier: 1.0,
      features: [],
    };

    // Accumulate all unlocks from 1-star to current rating
    for (let r = StarRating.ONE_STAR; r <= this.currentRating; r++) {
      const ratingUnlocks = RATING_UNLOCKS[r as StarRating];
      unlocks.buildingTypes.push(...ratingUnlocks.buildingTypes);
      unlocks.maxFloors = Math.max(unlocks.maxFloors, ratingUnlocks.maxFloors);
      unlocks.landValueMultiplier = ratingUnlocks.landValueMultiplier;
      if (ratingUnlocks.features) {
        unlocks.features!.push(...ratingUnlocks.features);
      }
    }

    return unlocks;
  }

  /**
   * Check if a building type is unlocked.
   */
  public isUnlocked(buildingType: string): boolean {
    const unlocks = this.getAllUnlocks();
    return unlocks.buildingTypes.includes(buildingType);
  }

  /**
   * Get requirements for next rating level.
   */
  public getNextRatingRequirements(): RatingRequirements | null {
    if (this.currentRating === StarRating.TOWER) {
      return null; // You're at the top!
    }
    return RATING_REQUIREMENTS[(this.currentRating + 1) as StarRating];
  }

  /**
   * Get requirements for current rating (what you need to maintain).
   */
  public getCurrentRequirements(): RatingRequirements {
    return RATING_REQUIREMENTS[this.currentRating];
  }

  /**
   * Subscribe to rating changes.
   */
  public onRatingChange(listener: (event: RatingChangeEvent) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Get rating history (for statistics, achievements, etc.)
   */
  public getHistory(): RatingChangeEvent[] {
    return [...this.ratingHistory];
  }

  /**
   * Calculate progress to next star (0-1).
   */
  public getProgressToNextStar(currentPopulation: number): number {
    const nextReqs = this.getNextRatingRequirements();
    if (!nextReqs) return 1.0; // Already at TOWER

    const currentReqs = this.getCurrentRequirements();
    const populationGap = nextReqs.population - currentReqs.population;
    const currentProgress = currentPopulation - currentReqs.population;

    return Math.max(0, Math.min(1, currentProgress / populationGap));
  }

  /**
   * Serialize state for saving.
   */
  public serialize(): {
    rating: number;
    completedEvents: string[];
    history: RatingChangeEvent[];
  } {
    return {
      rating: this.currentRating,
      completedEvents: Array.from(this.completedEvents),
      history: this.ratingHistory,
    };
  }

  /**
   * Restore state from save.
   */
  public deserialize(data: {
    rating: number;
    completedEvents: string[];
    history: RatingChangeEvent[];
  }): void {
    this.currentRating = data.rating as StarRating;
    this.completedEvents = new Set(data.completedEvents);
    this.ratingHistory = data.history;
  }
}

// Singleton instance - there's only one tower rating
let instance: StarRatingSystem | null = null;

export function getStarRatingSystem(): StarRatingSystem {
  if (!instance) {
    instance = new StarRatingSystem();
  }
  return instance;
}

export function resetStarRatingSystem(): void {
  instance = null;
}
