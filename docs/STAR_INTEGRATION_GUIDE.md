# Star Rating System - Integration Guide

## Quick Start

### 1. Import the System

```typescript
import { getStarRatingSystem, StarRating } from '@/simulation/StarRatingSystem';

const ratingSystem = getStarRatingSystem();
```

### 2. Set Up Rating Change Listener (Do This Once on Game Load)

```typescript
// In your main game initialization
function initializeGame() {
  const ratingSystem = getStarRatingSystem();
  
  ratingSystem.onRatingChange((event) => {
    const isPromotion = event.newRating > event.previousRating;
    
    if (isPromotion) {
      // 🎉 PROMOTION!
      showNotification({
        type: 'success',
        title: `Promoted to ${ratingSystem.getRatingName()}!`,
        message: event.reason,
        duration: 5000,
      });
      
      playSound('promotion.mp3');
      showConfetti();
      updateStarDisplay(event.newRating);
      
      // Show what just unlocked
      const unlocks = ratingSystem.getCurrentUnlocks();
      showUnlocksModal(unlocks);
      
    } else {
      // 💔 DEMOTION - make it hurt
      showNotification({
        type: 'error',
        title: `Demoted to ${ratingSystem.getRatingName()}`,
        message: event.reason,
        duration: 10000,
        persistent: true,
      });
      
      playSound('demotion.mp3');
      shakeScreen();
      updateStarDisplay(event.newRating);
      
      // Show what you lost
      showDemotionModal(event);
    }
  });
}
```

### 3. Evaluate Rating Regularly

```typescript
// Call this whenever population or satisfaction changes
function updateTowerStats() {
  const population = calculateTotalPopulation();
  const satisfaction = calculateAverageSatisfaction();
  const activeProblems = countActiveProblems();
  
  // Let the rating system evaluate and auto-promote/demote
  const ratingSystem = getStarRatingSystem();
  ratingSystem.evaluate({
    population,
    satisfaction,
    activeProblems,
  });
}

// Example: after a tenant moves in
function onTenantMoveIn(tenant: Tenant) {
  // ... your tenant logic ...
  
  updateTowerStats(); // Re-evaluate rating
}

// Example: after a problem is resolved
function onFireExtinguished(fire: Fire) {
  // ... your fire logic ...
  
  updateTowerStats(); // Re-evaluate rating
}

// Example: on hourly satisfaction update
function onHourlyTick() {
  updateSatisfaction();
  updateTowerStats(); // Re-evaluate rating
}
```

### 4. Check Unlocks Before Building

```typescript
// In your building placement logic
function canPlaceBuilding(buildingType: string): boolean {
  const ratingSystem = getStarRatingSystem();
  
  if (!ratingSystem.isUnlocked(buildingType)) {
    showError(`${buildingType} unlocks at ${getUnlockLevel(buildingType)}`);
    return false;
  }
  
  return true;
}

function getUnlockLevel(buildingType: string): string {
  // Map building types to their unlock level
  const unlockMap: Record<string, number> = {
    'restaurant': 2,
    'hotel': 2,
    'express_elevator': 3,
    'metro_station': 4,
    'cathedral': 6, // TOWER
    // ... etc
  };
  
  const level = unlockMap[buildingType];
  return level === 6 ? 'TOWER' : `${level} Stars`;
}
```

### 5. Enforce Floor Limits

```typescript
// In your floor construction logic
function canBuildFloor(currentFloors: number): boolean {
  const ratingSystem = getStarRatingSystem();
  const unlocks = ratingSystem.getAllUnlocks();
  
  if (currentFloors >= unlocks.maxFloors) {
    showError(
      `Maximum ${unlocks.maxFloors} floors at ${ratingSystem.getRatingName()}. ` +
      `Upgrade your tower to build higher!`
    );
    return false;
  }
  
  return true;
}
```

### 6. Apply Land Value Multiplier to Rent

```typescript
// In your rent calculation
function calculateRent(room: Room): number {
  const baseRent = room.baseRentValue;
  const ratingSystem = getStarRatingSystem();
  const unlocks = ratingSystem.getAllUnlocks();
  
  // Higher star rating = higher land value = higher rent
  return Math.floor(baseRent * unlocks.landValueMultiplier);
}
```

### 7. Show Progress in UI

```typescript
// For your UI's progress bar
function getRatingProgress(): {
  current: string;
  next: string | null;
  progress: number;
  popNeeded: number | null;
} {
  const ratingSystem = getStarRatingSystem();
  const population = calculateTotalPopulation();
  const nextReqs = ratingSystem.getNextRatingRequirements();
  
  return {
    current: ratingSystem.getRatingName(),
    next: nextReqs 
      ? ratingSystem.getRatingName((ratingSystem.getRating() + 1) as StarRating)
      : null,
    progress: ratingSystem.getProgressToNextStar(population),
    popNeeded: nextReqs 
      ? nextReqs.population - population
      : null,
  };
}

// Use in your UI:
// <ProgressBar value={getRatingProgress().progress} />
// <span>Next: {getRatingProgress().next}</span>
// <span>Need {getRatingProgress().popNeeded} more residents</span>
```

### 8. Handle Special Events (TOWER Requirements)

```typescript
// When player builds a cathedral
function onCathedralBuilt() {
  const ratingSystem = getStarRatingSystem();
  
  if (ratingSystem.getRating() >= StarRating.FIVE_STAR) {
    ratingSystem.completeEvent('cathedral_built');
    
    showNotification({
      type: 'success',
      title: '⛪ Cathedral Complete!',
      message: 'One step closer to TOWER status.',
    });
    
    updateTowerStats(); // Re-evaluate (might trigger TOWER if VIP also done)
  }
}

// VIP visit logic
function triggerVIPVisit() {
  const ratingSystem = getStarRatingSystem();
  
  if (ratingSystem.getRating() < StarRating.FIVE_STAR) {
    return; // VIP visits only happen at 5★ or higher
  }
  
  showNotification({
    type: 'info',
    title: '🎩 VIP Has Arrived!',
    message: 'Maintain high satisfaction for the next 60 seconds.',
    duration: 60000,
  });
  
  const startSatisfaction = calculateAverageSatisfaction();
  
  // Check satisfaction after VIP tour
  setTimeout(() => {
    const endSatisfaction = calculateAverageSatisfaction();
    
    if (endSatisfaction >= 75) {
      // Success!
      ratingSystem.completeEvent('vip_visit_success');
      
      showNotification({
        type: 'success',
        title: '✅ VIP Visit Successful!',
        message: 'The VIP was impressed. TOWER status within reach!',
      });
      
      updateTowerStats(); // Re-evaluate (might trigger TOWER if cathedral also done)
      
    } else {
      // Failure
      showNotification({
        type: 'error',
        title: '❌ VIP Visit Failed',
        message: 'The VIP was not impressed. Fix your tower and try again.',
      });
    }
  }, 60000); // 1 minute
}

// Trigger VIP visits randomly when conditions are met
function checkForVIPVisit() {
  const ratingSystem = getStarRatingSystem();
  
  if (ratingSystem.getRating() >= StarRating.FIVE_STAR &&
      !ratingSystem.hasCompletedEvent('vip_visit_success') &&
      Math.random() < 0.1) { // 10% chance per check
    
    triggerVIPVisit();
  }
}
```

### 9. Save/Load Integration

```typescript
// When saving game
function saveGame(): GameSaveData {
  const ratingSystem = getStarRatingSystem();
  
  return {
    // ... other save data ...
    starRating: ratingSystem.serialize(),
  };
}

// When loading game
function loadGame(saveData: GameSaveData) {
  const ratingSystem = getStarRatingSystem();
  
  // ... load other data ...
  
  if (saveData.starRating) {
    ratingSystem.deserialize(saveData.starRating);
  }
}
```

## UI Components

### Star Display Component

```typescript
// React component for star display
function StarDisplay() {
  const ratingSystem = getStarRatingSystem();
  const rating = ratingSystem.getRating();
  const name = ratingSystem.getRatingName();
  
  return (
    <div className="star-display">
      <div className="stars">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} filled={i < Math.min(rating, 5)} />
        ))}
      </div>
      {rating === StarRating.TOWER && (
        <div className="tower-badge">👑 TOWER</div>
      )}
      <div className="rating-name">{name}</div>
    </div>
  );
}
```

### Progress Bar Component

```typescript
function RatingProgressBar() {
  const population = useGameState(state => state.population);
  const ratingSystem = getStarRatingSystem();
  const progress = ratingSystem.getProgressToNextStar(population);
  const nextReqs = ratingSystem.getNextRatingRequirements();
  
  if (!nextReqs) {
    return <div className="max-rating">🏆 TOWER STATUS ACHIEVED!</div>;
  }
  
  return (
    <div className="progress-container">
      <div className="progress-bar" style={{ width: `${progress * 100}%` }} />
      <div className="progress-label">
        Next: {ratingSystem.getRatingName((ratingSystem.getRating() + 1) as StarRating)}
        <br />
        {nextReqs.population - population} more residents needed
      </div>
    </div>
  );
}
```

### Requirements Tooltip

```typescript
function RatingRequirementsTooltip() {
  const ratingSystem = getStarRatingSystem();
  const currentReqs = ratingSystem.getCurrentRequirements();
  const nextReqs = ratingSystem.getNextRatingRequirements();
  
  return (
    <div className="tooltip">
      <h3>Current Rating: {ratingSystem.getRatingName()}</h3>
      <ul>
        <li>Min Population: {currentReqs.population}</li>
        <li>Min Satisfaction: {currentReqs.minSatisfaction}%</li>
        <li>Max Problems: {currentReqs.maxProblems}</li>
      </ul>
      
      {nextReqs && (
        <>
          <h3>Next Rating Requirements:</h3>
          <ul>
            <li>Population: {nextReqs.population}</li>
            <li>Satisfaction: {nextReqs.minSatisfaction}%</li>
            <li>Max Problems: {nextReqs.maxProblems}</li>
          </ul>
        </>
      )}
    </div>
  );
}
```

## Testing in Development

```typescript
// Dev tools for testing the rating system
if (import.meta.env.DEV) {
  window.devTools = {
    // Force set rating
    setRating(rating: number) {
      const system = getStarRatingSystem();
      system.evaluate({
        population: [0, 100, 300, 500, 1000, 2000][rating] || 2000,
        satisfaction: [0, 60, 65, 70, 75, 80][rating] || 80,
        activeProblems: 0,
      });
    },
    
    // Complete TOWER events
    unlockTower() {
      const system = getStarRatingSystem();
      system.completeEvent('vip_visit_success');
      system.completeEvent('cathedral_built');
      system.evaluate({
        population: 2000,
        satisfaction: 80,
        activeProblems: 0,
      });
    },
    
    // Test demotion
    causeDemotion() {
      const system = getStarRatingSystem();
      system.evaluate({
        population: 50,
        satisfaction: 40,
        activeProblems: 10,
      });
    },
  };
}
```

## Common Integration Patterns

### Pattern 1: Debounced Evaluation

```typescript
// Don't evaluate on every single change - debounce it
import { debounce } from 'lodash';

const debouncedEvaluate = debounce(() => {
  updateTowerStats();
}, 500); // Evaluate at most every 500ms

// Use everywhere:
onTenantMoveIn(() => debouncedEvaluate());
onSatisfactionChange(() => debouncedEvaluate());
onProblemResolved(() => debouncedEvaluate());
```

### Pattern 2: Achievement Integration

```typescript
ratingSystem.onRatingChange((event) => {
  // Check for achievements
  if (event.newRating === StarRating.TOWER) {
    unlockAchievement('TOWER_MASTER');
  }
  
  if (event.newRating > event.previousRating) {
    unlockAchievement(`RATING_${event.newRating}_STAR`);
  }
  
  // Track first demotion
  if (event.newRating < event.previousRating) {
    unlockAchievement('FIRST_DEMOTION'); // Badge of shame 😅
  }
});
```

### Pattern 3: Analytics

```typescript
ratingSystem.onRatingChange((event) => {
  analytics.track('rating_changed', {
    previous: event.previousRating,
    new: event.newRating,
    type: event.newRating > event.previousRating ? 'promotion' : 'demotion',
    reason: event.reason,
    timestamp: event.timestamp,
  });
});
```

## Troubleshooting

**Rating not updating?**
- Make sure you're calling `evaluate()` after state changes
- Check that population/satisfaction values are correct
- Verify activeProblems count is accurate

**Promoted but UI not updating?**
- Ensure rating change listener is set up
- Check that listener isn't being removed accidentally
- Verify UI is re-rendering on rating change

**Can't reach TOWER?**
- Check that both special events are completed
- Verify population >= 2000, satisfaction >= 80, problems = 0
- Use `hasCompletedEvent()` to debug

**Unexpected demotion?**
- Check satisfaction hasn't dropped below threshold
- Verify no fires/infestations are active
- Ensure population didn't drop (e.g., mass move-out)

---

**Remember:** The star rating system should feel **present** in the game. Show it prominently in the UI, celebrate promotions loudly, and make demotions hurt. That's what makes it meaningful.
