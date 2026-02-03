/**
 * StarRatingSystem.test.ts
 * 
 * Tests for the star rating system.
 * Run with: npm test StarRatingSystem.test.ts
 */

import {
  StarRatingSystem,
  StarRating,
  RatingChangeEvent,
  resetStarRatingSystem,
} from "./StarRatingSystem";

describe("StarRatingSystem", () => {
  let system: StarRatingSystem;

  beforeEach(() => {
    resetStarRatingSystem();
    system = new StarRatingSystem();
  });

  describe("Initial State", () => {
    it("should start at 1 star", () => {
      expect(system.getRating()).toBe(StarRating.ONE_STAR);
      expect(system.getRatingName()).toBe("1 Star");
    });

    it("should have basic unlocks at 1 star", () => {
      const unlocks = system.getCurrentUnlocks();
      expect(unlocks.buildingTypes).toContain("office");
      expect(unlocks.buildingTypes).toContain("apartment");
      expect(unlocks.maxFloors).toBe(10);
    });
  });

  describe("Promotion", () => {
    it("should promote to 2 stars with 100+ population and 60% satisfaction", () => {
      let eventFired = false;
      system.onRatingChange((event) => {
        eventFired = true;
        expect(event.previousRating).toBe(StarRating.ONE_STAR);
        expect(event.newRating).toBe(StarRating.TWO_STAR);
      });

      system.evaluate({
        population: 100,
        satisfaction: 60,
        activeProblems: 0,
      });

      expect(system.getRating()).toBe(StarRating.TWO_STAR);
      expect(eventFired).toBe(true);
    });

    it("should unlock restaurants and hotels at 2 stars", () => {
      system.evaluate({
        population: 100,
        satisfaction: 60,
        activeProblems: 0,
      });

      expect(system.isUnlocked("restaurant")).toBe(true);
      expect(system.isUnlocked("hotel")).toBe(true);
    });

    it("should promote through all levels with sufficient stats", () => {
      // 2 stars
      system.evaluate({ population: 100, satisfaction: 60, activeProblems: 0 });
      expect(system.getRating()).toBe(StarRating.TWO_STAR);

      // 3 stars
      system.evaluate({ population: 300, satisfaction: 65, activeProblems: 0 });
      expect(system.getRating()).toBe(StarRating.THREE_STAR);

      // 4 stars
      system.evaluate({ population: 500, satisfaction: 70, activeProblems: 0 });
      expect(system.getRating()).toBe(StarRating.FOUR_STAR);

      // 5 stars
      system.evaluate({ population: 1000, satisfaction: 75, activeProblems: 0 });
      expect(system.getRating()).toBe(StarRating.FIVE_STAR);
    });

    it("should not promote to TOWER without special events", () => {
      system.evaluate({
        population: 2000,
        satisfaction: 80,
        activeProblems: 0,
      });

      // Should stop at 5 stars without VIP visit and cathedral
      expect(system.getRating()).toBe(StarRating.FIVE_STAR);
    });

    it("should promote to TOWER with special events completed", () => {
      system.completeEvent("vip_visit_success");
      system.completeEvent("cathedral_built");

      system.evaluate({
        population: 2000,
        satisfaction: 80,
        activeProblems: 0,
      });

      expect(system.getRating()).toBe(StarRating.TOWER);
      expect(system.getRatingName()).toBe("TOWER");
    });
  });

  describe("Demotion", () => {
    beforeEach(() => {
      // Promote to 2★ first
      system.evaluate({ population: 100, satisfaction: 60, activeProblems: 0 });
      // Then to 3★
      system.evaluate({ population: 300, satisfaction: 65, activeProblems: 0 });
    });

    it("should demote if satisfaction drops", () => {
      let demotionEvent: RatingChangeEvent | null = null;
      system.onRatingChange((event) => {
        demotionEvent = event;
      });

      // Satisfaction drops → should demote to 2★ (meets 2★ but not 3★ requirements)
      system.evaluate({
        population: 300,
        satisfaction: 62, // Above 60 for 2★, but below 65 required for 3★
        activeProblems: 0,
      });

      expect(system.getRating()).toBe(StarRating.TWO_STAR);
      expect(demotionEvent?.reason).toContain("DEMOTED");
    });

    it("should demote if population drops", () => {
      system.evaluate({
        population: 150, // Below 300 required for 3 stars
        satisfaction: 70,
        activeProblems: 0,
      });

      expect(system.getRating()).toBe(StarRating.TWO_STAR);
    });

    it("should demote if too many problems", () => {
      system.evaluate({
        population: 300,
        satisfaction: 65,
        activeProblems: 10, // Way over limit
      });

      expect(system.getRating()).toBeLessThan(StarRating.THREE_STAR);
    });

    it("should track demotion in history", () => {
      system.evaluate({
        population: 300,
        satisfaction: 50,
        activeProblems: 0,
      });

      const history = system.getHistory();
      const demotion = history.find((e) => e.newRating < e.previousRating);
      expect(demotion).toBeDefined();
      expect(demotion?.previousRating).toBe(StarRating.THREE_STAR);
    });
  });

  describe("Unlocks", () => {
    it("should accumulate unlocks as rating increases", () => {
      system.evaluate({ population: 100, satisfaction: 60, activeProblems: 0 });
      const unlocks = system.getAllUnlocks();

      // Should have 1-star AND 2-star unlocks
      expect(unlocks.buildingTypes).toContain("office"); // 1-star
      expect(unlocks.buildingTypes).toContain("restaurant"); // 2-star
    });

    it("should increase max floors with rating", () => {
      expect(system.getAllUnlocks().maxFloors).toBe(10); // 1 star

      system.evaluate({ population: 100, satisfaction: 60, activeProblems: 0 });
      expect(system.getAllUnlocks().maxFloors).toBe(20); // 2 stars

      system.evaluate({ population: 300, satisfaction: 65, activeProblems: 0 });
      expect(system.getAllUnlocks().maxFloors).toBe(35); // 3 stars
    });

    it("should increase land value multiplier with rating", () => {
      expect(system.getAllUnlocks().landValueMultiplier).toBe(1.0);

      system.evaluate({ population: 100, satisfaction: 60, activeProblems: 0 });
      expect(system.getAllUnlocks().landValueMultiplier).toBe(1.3);
    });
  });

  describe("Progress Tracking", () => {
    it("should calculate progress to next star", () => {
      // At 1 star, need 100 for 2 stars
      const progress = system.getProgressToNextStar(50);
      expect(progress).toBeCloseTo(0.5, 1);
    });

    it("should return 1.0 progress at TOWER status", () => {
      system.completeEvent("vip_visit_success");
      system.completeEvent("cathedral_built");
      system.evaluate({
        population: 2000,
        satisfaction: 80,
        activeProblems: 0,
      });

      const progress = system.getProgressToNextStar(2000);
      expect(progress).toBe(1.0);
    });
  });

  describe("Special Events", () => {
    it("should track completed events", () => {
      system.completeEvent("vip_visit_success");
      expect(system.hasCompletedEvent("vip_visit_success")).toBe(true);
      expect(system.hasCompletedEvent("cathedral_built")).toBe(false);
    });

    it("should require both events for TOWER status", () => {
      system.completeEvent("vip_visit_success");

      system.evaluate({
        population: 2000,
        satisfaction: 80,
        activeProblems: 0,
      });

      // Should not reach TOWER with only one event
      expect(system.getRating()).toBe(StarRating.FIVE_STAR);

      system.completeEvent("cathedral_built");

      system.evaluate({
        population: 2000,
        satisfaction: 80,
        activeProblems: 0,
      });

      // Now should reach TOWER
      expect(system.getRating()).toBe(StarRating.TOWER);
    });
  });

  describe("Serialization", () => {
    it("should serialize and restore state", () => {
      // Set up state
      system.evaluate({ population: 300, satisfaction: 65, activeProblems: 0 });
      system.completeEvent("test_event");

      // Serialize
      const saveData = system.serialize();

      // Create new system and restore
      resetStarRatingSystem();
      const newSystem = new StarRatingSystem();
      newSystem.deserialize(saveData);

      // Verify state
      expect(newSystem.getRating()).toBe(StarRating.THREE_STAR);
      expect(newSystem.hasCompletedEvent("test_event")).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle exactly meeting thresholds", () => {
      system.evaluate({
        population: 100, // Exactly 100
        satisfaction: 60, // Exactly 60
        activeProblems: 0,
      });

      expect(system.getRating()).toBe(StarRating.TWO_STAR);
    });

    it("should handle being just below thresholds", () => {
      system.evaluate({
        population: 99, // Just below 100
        satisfaction: 60,
        activeProblems: 0,
      });

      expect(system.getRating()).toBe(StarRating.ONE_STAR);
    });

    it("should not demote below 1 star", () => {
      system.evaluate({
        population: 0,
        satisfaction: 0,
        activeProblems: 999,
      });

      expect(system.getRating()).toBe(StarRating.ONE_STAR);
    });

    it("should handle rapid state changes", () => {
      // Rapid evaluations
      for (let i = 0; i < 100; i++) {
        system.evaluate({
          population: 50 + i * 20,
          satisfaction: 60 + i,
          activeProblems: 0,
        });
      }

      // Should end up at high rating
      expect(system.getRating()).toBeGreaterThanOrEqual(StarRating.FIVE_STAR);
    });
  });

  describe("Event Listeners", () => {
    it("should notify all listeners on rating change", () => {
      let count = 0;
      system.onRatingChange(() => count++);
      system.onRatingChange(() => count++);
      system.onRatingChange(() => count++);

      system.evaluate({
        population: 100,
        satisfaction: 60,
        activeProblems: 0,
      });

      expect(count).toBe(3);
    });

    it("should not notify listeners if rating unchanged", () => {
      let count = 0;
      system.onRatingChange(() => count++);

      // Evaluate twice with same result
      system.evaluate({ population: 50, satisfaction: 60, activeProblems: 0 });
      system.evaluate({ population: 51, satisfaction: 60, activeProblems: 0 });

      expect(count).toBe(0); // No change = no events
    });
  });
});
