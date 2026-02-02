/**
 * StarRatingSystem.example.ts
 * 
 * Examples of how to integrate the star rating system into OpenTower.
 * This is THE progression system - everything connects to it.
 */

import {
  getStarRatingSystem,
  StarRating,
  RatingChangeEvent,
} from "./StarRatingSystem";

/**
 * EXAMPLE 1: Basic integration with game loop
 */
export function integrateWithGameLoop() {
  const ratingSystem = getStarRatingSystem();

  // Call this every time population or satisfaction changes
  function updateGameState(state: {
    population: number;
    satisfaction: number;
    fires: number;
    infestations: number;
  }) {
    const activeProblems = state.fires + state.infestations;

    // Evaluate rating - will automatically promote/demote
    ratingSystem.evaluate({
      population: state.population,
      satisfaction: state.satisfaction,
      activeProblems,
    });
  }

  // Example: after adding tenants
  updateGameState({
    population: 105,
    satisfaction: 65,
    fires: 0,
    infestations: 0,
  });
  // → Should promote to 2 stars! 🎉
}

/**
 * EXAMPLE 2: Listening to rating changes for UI updates
 */
export function setupRatingChangeHandlers() {
  const ratingSystem = getStarRatingSystem();

  ratingSystem.onRatingChange((event: RatingChangeEvent) => {
    const isPromotion = event.newRating > event.previousRating;
    const isDemotion = event.newRating < event.previousRating;

    if (isPromotion) {
      // 🎉 CELEBRATION TIME!
      showPromotionAnimation(event.newRating);
      playFanfare();
      showUnlocksPopup(event.newRating);

      // Update UI
      document.querySelector(".star-rating")?.classList.add("promotion-glow");

      console.log(`🎊 PROMOTED TO ${ratingSystem.getRatingName()}!`);
      console.log(`Reason: ${event.reason}`);
    } else if (isDemotion) {
      // 💔 DEVASTATING!
      showDemotionAnimation(event.newRating);
      playSadMusic();
      showWarningDialog(event.reason);

      console.log(`💔 DEMOTED TO ${ratingSystem.getRatingName()}`);
      console.log(`Reason: ${event.reason}`);
    }

    // Always update the star display
    updateStarDisplay(event.newRating);
  });
}

/**
 * EXAMPLE 3: Building placement checks
 */
export function canPlaceBuilding(buildingType: string): {
  allowed: boolean;
  reason?: string;
} {
  const ratingSystem = getStarRatingSystem();

  // Check if building type is unlocked
  if (!ratingSystem.isUnlocked(buildingType)) {
    const nextReqs = ratingSystem.getNextRatingRequirements();
    return {
      allowed: false,
      reason: `${buildingType} unlocks at ${ratingSystem.getRatingName(
        (ratingSystem.getRating() + 1) as StarRating
      )}. Need ${nextReqs?.population} population.`,
    };
  }

  return { allowed: true };
}

/**
 * EXAMPLE 4: Floor limit enforcement
 */
export function canBuildFloor(currentFloors: number): {
  allowed: boolean;
  maxFloors: number;
  reason?: string;
} {
  const ratingSystem = getStarRatingSystem();
  const unlocks = ratingSystem.getAllUnlocks();

  if (currentFloors >= unlocks.maxFloors) {
    return {
      allowed: false,
      maxFloors: unlocks.maxFloors,
      reason: `Maximum ${unlocks.maxFloors} floors at ${ratingSystem.getRatingName()}. Upgrade your tower to build higher!`,
    };
  }

  return {
    allowed: true,
    maxFloors: unlocks.maxFloors,
  };
}

/**
 * EXAMPLE 5: Progress indicator for UI
 */
export function getProgressData(currentPopulation: number): {
  currentRating: string;
  progress: number;
  nextRating: string | null;
  populationNeeded: number | null;
  satisfactionNeeded: number | null;
} {
  const ratingSystem = getStarRatingSystem();
  const nextReqs = ratingSystem.getNextRatingRequirements();

  return {
    currentRating: ratingSystem.getRatingName(),
    progress: ratingSystem.getProgressToNextStar(currentPopulation),
    nextRating: nextReqs
      ? ratingSystem.getRatingName((ratingSystem.getRating() + 1) as StarRating)
      : null,
    populationNeeded: nextReqs ? nextReqs.population - currentPopulation : null,
    satisfactionNeeded: nextReqs?.minSatisfaction ?? null,
  };
}

/**
 * EXAMPLE 6: TOWER status special events
 */
export function handleVIPVisit() {
  const ratingSystem = getStarRatingSystem();

  // VIP arrives
  console.log("🎩 VIP has arrived!");

  // Simulate VIP tour (player must maintain high satisfaction during visit)
  setTimeout(() => {
    // If visit was successful (satisfaction stayed high)
    const visitSuccess = checkVIPSatisfaction();

    if (visitSuccess) {
      ratingSystem.completeEvent("vip_visit_success");
      console.log("✅ VIP visit successful! One step closer to TOWER status.");
    } else {
      console.log("❌ VIP visit failed. Fix your tower and try again.");
    }
  }, 60000); // 1 minute VIP visit
}

export function handleCathedralBuilt() {
  const ratingSystem = getStarRatingSystem();

  // Player builds cathedral (only available at 5 stars)
  if (ratingSystem.getRating() >= StarRating.FIVE_STAR) {
    ratingSystem.completeEvent("cathedral_built");
    console.log("⛪ Cathedral built! TOWER status within reach!");
  }
}

/**
 * EXAMPLE 7: Save/Load integration
 */
export function saveRatingState(): string {
  const ratingSystem = getStarRatingSystem();
  return JSON.stringify(ratingSystem.serialize());
}

export function loadRatingState(saveData: string): void {
  const ratingSystem = getStarRatingSystem();
  const data = JSON.parse(saveData);
  ratingSystem.deserialize(data);
}

/**
 * EXAMPLE 8: Statistics and achievements
 */
export function getRatingStatistics() {
  const ratingSystem = getStarRatingSystem();
  const history = ratingSystem.getHistory();

  return {
    currentRating: ratingSystem.getRating(),
    totalPromotions: history.filter(
      (e) => e.newRating > e.previousRating
    ).length,
    totalDemotions: history.filter((e) => e.newRating < e.previousRating)
      .length,
    timeToTower: history.find((e) => e.newRating === StarRating.TOWER)
      ?.timestamp,
    everLostStar: history.some((e) => e.newRating < e.previousRating),
  };
}

/**
 * EXAMPLE 9: Dynamic pricing based on rating
 */
export function calculateRent(baseRent: number): number {
  const ratingSystem = getStarRatingSystem();
  const unlocks = ratingSystem.getAllUnlocks();

  // Higher star rating = higher land value = higher rent
  return Math.floor(baseRent * unlocks.landValueMultiplier);
}

/**
 * EXAMPLE 10: Tutorial/onboarding messages
 */
export function showRatingTutorial() {
  const ratingSystem = getStarRatingSystem();
  const nextReqs = ratingSystem.getNextRatingRequirements();

  if (ratingSystem.getRating() === StarRating.ONE_STAR && nextReqs) {
    console.log(`
      🌟 Welcome to your tower!
      
      You're currently at 1 STAR.
      
      To reach 2 STARS, you need:
      - ${nextReqs.population} population
      - ${nextReqs.minSatisfaction}% satisfaction
      - Keep problems under control
      
      At 2 STARS, you'll unlock:
      - Restaurants 🍽️
      - Hotels 🏨
      - Parking 🚗
      
      Build your tower and make it thrive! ⭐
    `);
  }
}

// Placeholder functions (implement these in your UI layer)
function showPromotionAnimation(rating: StarRating) {
  /* Show celebration animation */
}
function playFanfare() {
  /* Play success sound */
}
function showUnlocksPopup(rating: StarRating) {
  /* Show what just unlocked */
}
function showDemotionAnimation(rating: StarRating) {
  /* Show sad animation */
}
function playSadMusic() {
  /* Play failure sound */
}
function showWarningDialog(reason: string) {
  /* Show warning popup */
}
function updateStarDisplay(rating: StarRating) {
  /* Update star graphics */
}
function checkVIPSatisfaction(): boolean {
  /* Check if VIP was happy */
  return true;
}
