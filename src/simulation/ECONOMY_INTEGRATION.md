# Economy System Integration Guide

## Quick Start

```typescript
import { EconomySystem } from './simulation/EconomySystem';

// Initialize
const economySystem = new EconomySystem();

// Main game loop
function gameLoop(tower: Tower, clock: GameClock, currentTick: number) {
  // Update economy every tick
  economySystem.update(tower, clock, currentTick);
  
  // Query current stats for UI
  const stats = economySystem.getEconomyStats(tower);
  updateUI(stats);
}
```

---

## Integration Points

### 1. HotelSystem.ts

When a guest checks out of a hotel room, register the revenue:

```typescript
// In HotelSystem.ts
export class HotelSystem {
  private economySystem: EconomySystem;
  
  constructor(economySystem: EconomySystem) {
    this.economySystem = economySystem;
  }
  
  checkoutGuest(guest: Person, room: Building): void {
    const nightsStayed = this.calculateNightsStayed(guest);
    const roomType = room.type as 'hotelSingle' | 'hotelTwin' | 'hotelSuite';
    
    // Register revenue (will be paid out at next quarter)
    this.economySystem.registerHotelCheckout(roomType, nightsStayed);
    
    console.log(`Guest checked out of ${roomType}, stayed ${nightsStayed} nights`);
  }
}
```

---

### 2. PopulationSystem.ts / ResidentSystem.ts

When people visit food or retail buildings, register the customer:

```typescript
// In PopulationSystem.ts or ResidentSystem.ts
export class PopulationSystem {
  private economySystem: EconomySystem;
  
  constructor(economySystem: EconomySystem) {
    this.economySystem = economySystem;
  }
  
  visitBuilding(person: Person, building: Building): void {
    // Register customer based on building type
    switch (building.type) {
      case 'fastFood':
      case 'restaurant':
        this.economySystem.registerFoodCustomer(building.id);
        console.log(`${person.id} ate at ${building.type}`);
        break;
      
      case 'shop':
        this.economySystem.registerShopCustomer(building.id);
        console.log(`${person.id} shopped at shop`);
        break;
    }
  }
}
```

---

### 3. ElevatorSystem.ts

When an elevator completes a trip, register it for maintenance tracking:

```typescript
// In ElevatorSystem.ts
export class ElevatorSystem {
  private economySystem: EconomySystem;
  
  constructor(economySystem: EconomySystem) {
    this.economySystem = economySystem;
  }
  
  completeTripToFloor(elevator: ElevatorShaft, targetFloor: number): void {
    // ... existing elevator movement logic ...
    
    // Register trip for maintenance cost calculation
    this.economySystem.registerElevatorTrip(elevator.id);
  }
}
```

---

### 4. BuildingPlacer.ts (Condo Sales)

When a player places a condo, they're "selling" it (not renting):

```typescript
// In BuildingPlacer.ts or TowerManager.ts
export class BuildingPlacer {
  private economySystem: EconomySystem;
  
  constructor(economySystem: EconomySystem) {
    this.economySystem = economySystem;
  }
  
  placeBuilding(tower: Tower, building: Building): void {
    // Deduct construction cost
    if (!tower.modifyFunds(-building.cost)) {
      console.log('Insufficient funds!');
      return;
    }
    
    // Special handling for condos (one-time sale)
    if (building.type === 'condo') {
      const salePrice = this.economySystem.registerCondoSale(building.position.floor);
      tower.funds += salePrice; // Immediate payment
      
      console.log(`Condo sold for $${salePrice.toLocaleString()}`);
      // Note: Condo has no ongoing income/expenses
    }
    
    // Place building
    tower.addBuilding(building);
  }
}
```

---

### 5. Game.ts (Main Game Loop)

Wire everything together in the main game loop:

```typescript
// In Game.ts
import { EconomySystem } from './simulation/EconomySystem';
import { HotelSystem } from './simulation/HotelSystem';
import { PopulationSystem } from './simulation/PopulationSystem';
import { ElevatorSystem } from './simulation/ElevatorSystem';

export class Game {
  private tower: Tower;
  private economySystem: EconomySystem;
  private hotelSystem: HotelSystem;
  private populationSystem: PopulationSystem;
  private elevatorSystem: ElevatorSystem;
  
  constructor() {
    this.tower = createTower();
    this.economySystem = new EconomySystem();
    
    // Pass economy system to other systems
    this.hotelSystem = new HotelSystem(this.economySystem);
    this.populationSystem = new PopulationSystem(this.economySystem);
    this.elevatorSystem = new ElevatorSystem(this.economySystem);
  }
  
  update(deltaTime: number): void {
    const currentTick = this.tower.clock.currentTick;
    
    // Update all systems
    this.elevatorSystem.update(this.tower, deltaTime);
    this.populationSystem.update(this.tower, deltaTime);
    this.hotelSystem.update(this.tower, deltaTime);
    
    // Update economy (handles quarterly collection)
    this.economySystem.update(this.tower, this.tower.clock, currentTick);
    
    // Update UI with latest stats
    this.updateFinancialUI();
  }
  
  updateFinancialUI(): void {
    const stats = this.economySystem.getEconomyStats(this.tower);
    const pending = this.economySystem.getPendingIncome();
    const timeUntilQuarter = this.economySystem.getTicksUntilNextQuarter(this.tower.clock.currentTick);
    
    // Update HUD
    this.ui.updateFunds(stats.currentFunds);
    this.ui.updateDailyIncome(stats.netDaily);
    this.ui.updateQuarterTimer(timeUntilQuarter);
    
    // Update financial panel
    this.ui.updateFinancialPanel(stats.lastReport);
    
    // Show bankruptcy warning if in debt
    if (stats.bankruptcyState.isInDebt) {
      this.ui.showBankruptcyWarning(stats.bankruptcyState);
    }
  }
}
```

---

## Event Bus Integration

The economy system emits events you can listen to:

```typescript
import { getEventBus } from '@core/EventBus';

// Listen for quarterly collection
getEventBus().on('QUARTERLY_COLLECTION', (event: any) => {
  const report = event.report;
  console.log(`Quarter ${report.quarterNumber}: $${report.netProfit.toLocaleString()}`);
  
  // Show notification
  showNotification(`Quarterly Report: ${report.netProfit >= 0 ? '+' : ''}$${report.netProfit.toLocaleString()}`);
});

// Listen for bankruptcy warnings
getEventBus().on('BANKRUPTCY_WARNING', (event: any) => {
  const { severity, debtAmount, gracePeriodRemaining } = event;
  
  showAlert(`⚠️ WARNING: Debt at $${debtAmount.toLocaleString()}! ${gracePeriodRemaining} ticks remaining!`);
});

// Listen for tenant departures
getEventBus().on('TENANT_DEPARTURES', (event: any) => {
  const { departures, totalLostIncome } = event;
  
  showAlert(`${departures.length} tenants left! Lost $${totalLostIncome.toLocaleString()}/quarter`);
});

// Listen for game over
getEventBus().on('GAME_OVER', (event: any) => {
  if (event.reason === 'bankruptcy') {
    showGameOverScreen(`Bankruptcy! Final debt: $${event.finalDebt.toLocaleString()}`);
  }
});
```

---

## Saving & Loading

The economy system supports serialization:

```typescript
// Saving
function saveGame(tower: Tower, economySystem: EconomySystem): SaveData {
  return {
    tower: tower.serialize(),
    economy: economySystem.serialize(),
    // ... other systems ...
  };
}

// Loading
function loadGame(saveData: SaveData): void {
  const tower = createTowerFromSave(saveData.tower);
  const economySystem = new EconomySystem();
  
  economySystem.deserialize(saveData.economy);
  
  // Now continue game with restored state
}
```

---

## Testing the Economy

### Test Scenario 1: Early Game Survival
```typescript
// Start with $2M, build 3 offices
tower.funds = 2000000;
placeBuilding(tower, createOffice(1, 0));  // -$40K
placeBuilding(tower, createOffice(1, 20)); // -$40K
placeBuilding(tower, createOffice(1, 40)); // -$40K
placeBuilding(tower, createElevator(0));   // -$100K

// Current funds: $1,780,000
// Expected Q1 income: ~$15K (50% occupied)
// Expected Q1 expenses: ~$7K (utilities + elevator)
// Expected Q1 net: +$8K

// Run 4 quarters (1 day)
for (let i = 0; i < 4; i++) {
  advanceToNextQuarter(tower, economySystem);
}

// Funds should be: ~$1,810,000
assert(tower.funds > 1800000, 'Should profit in early game');
```

### Test Scenario 2: Hotel Revenue
```typescript
// Place 10 hotel rooms
for (let i = 0; i < 10; i++) {
  placeBuilding(tower, createHotelSingle(2, i * 5));
}

// Simulate 10 checkouts (2 nights each)
for (let i = 0; i < 10; i++) {
  economySystem.registerHotelCheckout('hotelSingle', 2);
}

// Expected pending: $2,000 (10 rooms * $100/night * 2 nights)
const pending = economySystem.getPendingIncome();
assert(pending.hotel === 2000, 'Hotel revenue should accumulate');

// After next quarter, should be paid out
advanceToNextQuarter(tower, economySystem);
const report = economySystem.getLatestReport();
assert(report.hotelRevenue === 2000, 'Hotel revenue should be collected');
```

### Test Scenario 3: Bankruptcy Warning
```typescript
// Drain funds
tower.funds = -60000;

// Advance 1 tick to trigger bankruptcy check
economySystem.update(tower, tower.clock, 1);

const bankruptcy = economySystem.getBankruptcyState();
assert(bankruptcy.isInDebt === true, 'Should be in debt');
assert(bankruptcy.warningsIssued === 1, 'Should have 1 warning');
```

---

## Performance Considerations

The economy system is designed for efficiency:

1. **Quarterly processing:** Heavy calculations only run every 900 ticks
2. **Map-based tracking:** O(1) lookups for customer counts and elevator usage
3. **Lazy evaluation:** Stats are calculated on-demand, not cached

**Expected performance:**
- Tick update: <0.1ms (just bankruptcy check)
- Quarterly processing: <5ms (even with 1000+ buildings)
- Query methods: <0.1ms

---

## Common Pitfalls

### ❌ Forgetting to pass EconomySystem to other systems
```typescript
// BAD: Systems can't register revenue
const hotelSystem = new HotelSystem();

// GOOD: Systems can call economySystem methods
const hotelSystem = new HotelSystem(economySystem);
```

### ❌ Double-registering customers
```typescript
// BAD: Registering customer multiple times per visit
onPersonEnterBuilding(person, building) {
  economySystem.registerFoodCustomer(building.id); // Called every tick!
}

// GOOD: Register once per visit
onPersonCompleteVisit(person, building) {
  economySystem.registerFoodCustomer(building.id); // Called once
}
```

### ❌ Not handling bankruptcy events
```typescript
// BAD: Game continues after bankruptcy
// (Economy system emits GAME_OVER but nothing listens)

// GOOD: Listen for game over and halt game
getEventBus().on('GAME_OVER', (event) => {
  if (event.reason === 'bankruptcy') {
    this.pauseGame();
    this.showGameOverScreen();
  }
});
```

---

## Debugging Tips

### Enable verbose logging:
```typescript
// In EconomySystem.ts, set debug flag
const DEBUG = true;

if (DEBUG) {
  console.log(`[Economy] Registered food customer at ${buildingId}`);
  console.log(`[Economy] Current customer count: ${this.foodCustomerCounts.get(buildingId)}`);
}
```

### Inspect economy state in console:
```javascript
// In browser console
window.debugEconomy = () => {
  const stats = game.economySystem.getEconomyStats(game.tower);
  console.table(stats.lastReport);
  console.log('Bankruptcy:', stats.bankruptcyState);
  console.log('Pending:', game.economySystem.getPendingIncome());
};

// Then call:
debugEconomy();
```

### Force a quarterly collection:
```typescript
// For testing, manually trigger quarter
economySystem['processQuarter'](tower, tower.clock, tower.clock.currentTick);
```

---

## Next Steps

1. ✅ Replace old `EconomicSystem.ts` with new `EconomySystem.ts`
2. ✅ Update `Game.ts` to use new system
3. ✅ Connect `HotelSystem`, `PopulationSystem`, `ElevatorSystem`
4. ✅ Add financial UI panel
5. ✅ Add bankruptcy warning UI
6. ✅ Test with real gameplay
7. ✅ Balance tuning based on playtesting

---

**Questions? Check ECONOMY_DESIGN.md for design rationale and balance details.**
