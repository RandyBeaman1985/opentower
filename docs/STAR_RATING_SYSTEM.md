# Star Rating System - The Heart of OpenTower

## Philosophy

The star rating system is **THE** progression system in OpenTower. Everything else flows from it.

In SimTower (1995), the star rating wasn't just a score - it was your **identity**. Your tower's rating determined what you could build, how high you could go, and how much money you could make. Earning a new star felt **amazing**. Losing a star felt **devastating**.

We're recreating that feeling.

## Why This Matters

Most games have shallow progression - numbers go up, you unlock things, whatever. SimTower's star system was different because:

1. **It's gated by multiple factors** - You can't just grind one thing. You need population AND satisfaction AND stability.

2. **You can lose progress** - If your tower falls apart, you lose stars. This creates tension and makes success meaningful.

3. **Unlocks are dramatic** - Going from 1★ to 2★ doesn't just give you +5% income. It unlocks entire building types (restaurants, hotels) that fundamentally change your strategy.

4. **TOWER status is legendary** - Getting to TOWER isn't just about hitting 2000 population. You need to build a cathedral AND successfully host a VIP visit. It's an achievement worth celebrating.

## The Six Levels

### 1★ - Starting Out
- **Requirements:** None (you start here)
- **Unlocks:** Basic buildings (offices, apartments, shops, elevators, stairs)
- **Max Floors:** 10
- **Strategy:** Just get started. Build a basic tower and attract tenants.

### 2★ - Getting Serious
- **Requirements:** 100 population, 60% satisfaction, <5 problems
- **Unlocks:** Restaurants, hotels, parking
- **Max Floors:** 20
- **Impact:** +30% land value
- **Strategy:** Your tower needs amenities now. Restaurants feed workers, hotels bring transient income, parking helps with traffic.

### 3★ - Going Vertical
- **Requirements:** 300 population, 65% satisfaction, <3 problems
- **Unlocks:** Express elevators, medical clinic, security office
- **Max Floors:** 35
- **Impact:** +60% land value
- **Strategy:** Height is now your friend. Express elevators make tall towers viable. Medical and security keep people happy.

### 4★ - Modern Tower
- **Requirements:** 500 population, 70% satisfaction, <2 problems
- **Unlocks:** Recycling center, metro station, fitness center
- **Max Floors:** 50
- **Impact:** +100% land value
- **Strategy:** Infrastructure matters. Metro brings people in, recycling adds income, fitness keeps satisfaction high.

### 5★ - Prestige Building
- **Requirements:** 1000 population, 75% satisfaction, <1 problem
- **Unlocks:** Theater, spa, rooftop restaurant, helipad
- **Max Floors:** 100
- **Impact:** +150% land value
- **Strategy:** You're building a landmark. Luxury amenities attract high-paying tenants. Keep everything perfect.

### TOWER - Legendary Status
- **Requirements:** 2000 population, 80% satisfaction, 0 problems, VIP visit success, cathedral built
- **Unlocks:** Cathedral, observation deck, broadcast tower
- **Max Floors:** 150
- **Impact:** +200% land value, maximum prestige
- **Strategy:** You've made it. This is the dream. Your tower is a destination, not just a building.

## How Demotion Works

Demotion is **harsh but fair**.

If your tower's conditions drop below the requirements for your current rating, you **immediately lose that star**. The system checks:

1. **Population** - Did people move out?
2. **Satisfaction** - Are tenants unhappy?
3. **Problems** - Are there active fires, infestations, or other disasters?

If you fail any check, you drop to the highest rating you still qualify for.

### Why Demotion Matters

Demotion creates **tension**. When you're at 3★ with 305 population, you're one crisis away from dropping to 2★. That forces you to:

- Fix problems immediately
- Keep satisfaction high
- Maintain population stability

Without demotion risk, there's no challenge in maintaining your tower.

## Implementation Notes

### Evaluation Frequency

Call `evaluate()` frequently:
- After population changes (tenants move in/out)
- After satisfaction updates (hourly or when events affect happiness)
- After problem events (fire starts, infestation detected)
- On manual checks (when player clicks refresh)

The system is designed to be called often - it only fires events when ratings actually change.

### Event Listeners

The system uses event listeners for loose coupling:

```typescript
ratingSystem.onRatingChange((event) => {
  // UI updates
  // Achievement checks
  // Analytics
  // Sound effects
  // Whatever you need
});
```

This means the rating system doesn't need to know about UI, sound, achievements, etc. It just reports changes and lets other systems react.

### Serialization

The system supports save/load:

```typescript
// Save
const saveData = ratingSystem.serialize();
localStorage.setItem('rating', JSON.stringify(saveData));

// Load
const saveData = JSON.parse(localStorage.getItem('rating'));
ratingSystem.deserialize(saveData);
```

### Singleton Pattern

The system uses a singleton because there's only one tower per game:

```typescript
import { getStarRatingSystem } from './StarRatingSystem';

const ratingSystem = getStarRatingSystem();
// Always returns the same instance
```

## Balancing Notes

The current thresholds are based on SimTower's original values but can be tuned:

- **Population thresholds** - If progression feels too slow/fast, adjust these
- **Satisfaction requirements** - If it's too hard to maintain stars, lower these
- **Problem tolerance** - Currently strict (TOWER allows 0 problems). Could be loosened.
- **Special events** - TOWER requires VIP visit + cathedral. Could add more requirements.

### Population Pacing

Assuming ~10 tenants per apartment and ~20 workers per office:
- 1★→2★: ~5-10 rooms
- 2★→3★: ~15-30 rooms
- 3★→4★: ~25-50 rooms
- 4★→5★: ~50-100 rooms
- 5★→TOWER: ~100-200 rooms

This should take several hours of gameplay to fully complete.

## Future Enhancements

Ideas for expansion:

1. **Micro-ratings** - Half-stars or percentage progress within a level
2. **Rating decay** - Slow satisfaction drain over time to create maintenance pressure
3. **Rating bonuses** - Temporary boosts from special events
4. **Multiple paths** - Alternative requirements (e.g., high satisfaction but lower population)
5. **Prestige mode** - Harder thresholds for experienced players

## Testing

Run the test suite:

```bash
npm test StarRatingSystem.test.ts
```

Tests cover:
- Promotion logic
- Demotion logic
- Unlock accumulation
- Special events
- Serialization
- Edge cases

## Integration Checklist

When integrating the star rating system:

- [ ] Call `evaluate()` on population changes
- [ ] Call `evaluate()` on satisfaction updates
- [ ] Call `evaluate()` on problem events
- [ ] Set up rating change listeners for UI
- [ ] Check `isUnlocked()` before allowing building placement
- [ ] Check `maxFloors` before allowing vertical expansion
- [ ] Use `landValueMultiplier` in rent calculations
- [ ] Show progress UI with `getProgressToNextStar()`
- [ ] Handle VIP visit event (trigger `completeEvent("vip_visit_success")`)
- [ ] Handle cathedral built (trigger `completeEvent("cathedral_built")`)
- [ ] Add save/load support with `serialize()`/`deserialize()`

## Conclusion

The star rating system is what makes OpenTower feel like a real progression game instead of just a sandbox. Every building you place, every tenant you attract, every problem you solve - it all feeds into this system.

Make it **visible**. Make it **celebrated**. Make players **care** about their star rating.

That's how you create a game that people remember.

---

*"A five-star tower is impressive. But a TOWER? That's legendary."*
