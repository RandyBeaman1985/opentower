# REAL GAME PLAN - OpenTower
**Created:** 2025-01-30  
**Status:** ACTIVE DEVELOPMENT  
**Mission:** Transform OpenTower from a pathetic demo into a PLAYABLE SimTower tribute

---

## 🔥 BRUTAL ASSESSMENT

### What We Have (The "Demo")
- ✅ Basic game loop (60fps render, 100ms sim ticks)
- ✅ Tower manager with floors and buildings
- ✅ Person entities with state machines
- ✅ Elevator system (basic LOOK algorithm)
- ✅ Economic system (quarterly rent collection)
- ✅ Population system (spawning workers)
- ✅ Time of day system (clock ticking)
- ✅ PixiJS rendering pipeline
- ✅ Save/load infrastructure
- ✅ UI components (BuildingMenu, TowerPulse, Tooltips)

### What's MISSING (The "Game")
- ❌ **REAL ECONOMY** - No operating costs, no profit/loss pressure, no bankruptcy
- ❌ **MEANINGFUL TIME** - Day/night exists but no real schedule impact
- ❌ **STRESS CONSEQUENCES** - Stress exists but doesn't affect evaluations or tenant retention
- ❌ **EVALUATION SYSTEM** - No building satisfaction ratings
- ❌ **STAR PROGRESSION** - Basic star rating but no unlock progression
- ❌ **BUILDING VARIETY** - Missing hotels, condos, restaurants, shops
- ❌ **POPULATION NEEDS** - People don't have real needs (food, entertainment, services)
- ❌ **REAL EVENTS** - No VIPs, fires, emergencies
- ❌ **SOUND & MUSIC** - Minimal audio
- ❌ **WIN/LOSE CONDITIONS** - Can't win, can't lose = not a game

---

## 🎯 IMPLEMENTATION PRIORITY

### Phase 1: MAKE IT A GAME (Weeks 1-4)
**Goal:** You can LOSE. You feel PRESSURE. Buildings FAIL.

#### Week 1: Economic Pressure System
**Why First:** Without economic pressure, there's no game. Just a toy.

1. **Operating Costs System** ⚡ CRITICAL
   - [ ] Add `maintenanceCostPerDay` to all buildings
   - [ ] Elevator operating costs (per car, per day)
   - [ ] Implement daily expense deduction
   - [ ] Create cash flow indicator in TowerPulse
   - [ ] Add "Days until bankruptcy" warning when funds < 0

2. **Bankruptcy Mechanics** ⚡ CRITICAL
   - [ ] Allow negative funds (debt state)
   - [ ] If funds < -$500,000 for 7 days → GAME OVER
   - [ ] Display debt warnings in UI
   - [ ] Create "Bankruptcy" game over screen

3. **Building Failure States**
   - [ ] Offices: If evaluation < 30% → tenant leaves, no income
   - [ ] Condos: Tenant move-out forces buyback at purchase price
   - [ ] Hotels: Low evaluation → no guests → no income

**Success Metric:** Player goes bankrupt in first 30 minutes if they build recklessly.

#### Week 2: Evaluation & Satisfaction System
**Why Second:** Buildings need consequences. Good/bad placement must MATTER.

1. **Building Evaluation Logic** ⚡ CRITICAL
   - [ ] Implement evaluation calculation (0-100%)
   - [ ] Factors:
     - Elevator wait times (biggest factor)
     - Walking distance to services
     - Noise from adjacent buildings
     - Rent level (higher rent = lower eval)
   - [ ] Update evaluation every 60 ticks (1 game-minute)

2. **Visual Evaluation Display**
   - [ ] Add evaluation bar to building tooltips (Blue/Yellow/Red)
   - [ ] Evaluation overlay mode (heatmap)
   - [ ] "Why is this building unhappy?" tooltip details

3. **Evaluation Consequences**
   - [ ] Offices: Red evaluation → 50% chance tenant leaves each quarter
   - [ ] Condos: Red evaluation → forced buyback next quarter
   - [ ] Hotels: Evaluation affects occupancy rate

**Success Metric:** Player can SEE why a building is failing and fix it.

#### Week 3: Population Needs & Scheduling
**Why Third:** People need to feel ALIVE. They need NEEDS.

1. **Daily Schedule System** ⚡ CRITICAL
   - [ ] Morning rush (7-9 AM): Workers arrive at offices
   - [ ] Lunch rush (12-1 PM): Workers seek fast food
   - [ ] Evening rush (5-7 PM): Workers leave
   - [ ] Weekend vs Weekday behavior

2. **Population Needs**
   - [ ] Workers MUST eat lunch → seek fastFood building
   - [ ] If no food within 4 elevator trips → stress +50
   - [ ] Residents need entertainment → seek shops/restaurants
   - [ ] Hotel guests need services → affect hotel evaluation

3. **Smart AI Behaviors**
   - [ ] Pathfinding prefers stairs for <5 floors
   - [ ] Will abandon trip if wait time > 3 minutes
   - [ ] Remember recent stress (affects future decisions)

**Success Metric:** Lunch rush visibly swarms fast food. Elevators jam at 5 PM.

#### Week 4: Star Rating Progression
**Why Fourth:** Unlocking buildings is the carrot. Make it work.

1. **Star Rating Logic** ⚡ CRITICAL
   - [ ] 1★ → 2★: Population 100 + average eval > 60%
   - [ ] 2★ → 3★: Population 500 + average eval > 70% + 1 security office
   - [ ] Check every quarter (not every tick!)

2. **Building Unlocks**
   - [ ] 1★: Office, FastFood, Stairs, Standard Elevator
   - [ ] 2★: Hotel (Single/Twin), Condo, Shop, Express Elevator
   - [ ] 3★: Restaurant, Party Hall, VIP events

3. **Star Rating UI**
   - [ ] Notification when star rating increases
   - [ ] "Requirements for next star" panel
   - [ ] Visual tower prestige increase (lobby graphics)

**Success Metric:** Reaching 2★ feels like an ACHIEVEMENT.

---

### Phase 2: CONTENT & VARIETY (Weeks 5-8)

#### Week 5: Building Variety
1. **Hotel System** ⚡ HIGH PRIORITY
   - [ ] Hotel Single/Twin/Suite buildings
   - [ ] Guest check-in/check-out mechanics
   - [ ] Daily room income
   - [ ] Housekeeping requirement (or roaches)

2. **Residential Buildings**
   - [ ] Condo buildings (one-time sale)
   - [ ] Buyback penalty if tenant leaves
   - [ ] Noise sensitivity

3. **Commercial Variety**
   - [ ] Restaurant (evening hours, higher income)
   - [ ] Shop (retail, ground floor preferred)
   - [ ] Party Hall (guaranteed income, minimal transport needs)

#### Week 6: Service Buildings
1. **Essential Services**
   - [ ] Security Office (required for 3★)
   - [ ] Medical Center (condo residents want nearby)
   - [ ] Recycling (affects tower-wide evaluation)

2. **Transportation**
   - [ ] Escalators (7-floor range, lobby/food/retail only)
   - [ ] Express Elevators (15-floor intervals)
   - [ ] Sky Lobby system

#### Week 7-8: Events System
1. **VIP System**
   - [ ] VIP guests check into hotel suites
   - [ ] Rate their stay (affects star progression)
   - [ ] Visual VIP sprite (suit)

2. **Random Events**
   - [ ] Fires (temporary facility damage)
   - [ ] Power outages (elevators stop)
   - [ ] Treasure finding (bonus cash)

---

### Phase 3: POLISH & JUICE (Weeks 9-12)

#### Week 9: Sound & Music
1. **Sound Effects**
   - [ ] Elevator ding (on arrival)
   - [ ] Cash register (income collected)
   - [ ] Construction sounds
   - [ ] Alert sounds (events, warnings)

2. **Background Music**
   - [ ] Elevator jazz music loop
   - [ ] Volume control
   - [ ] Mute option

#### Week 10: Visual Polish
1. **Day/Night Cycle**
   - [ ] Sky color changes (blue → orange → black)
   - [ ] Building lights turn on at night
   - [ ] Window glow effects

2. **Animations**
   - [ ] Elevator cars smoothly move
   - [ ] People walk with animation
   - [ ] Building construction animation
   - [ ] Fire/event effects

#### Week 11: Tutorial & Onboarding
1. **First-Time Experience**
   - [ ] 5-minute guided tutorial
   - [ ] "Build your first office"
   - [ ] "Workers need elevators"
   - [ ] "Lunch rush requires fast food"

2. **Tooltips & Help**
   - [ ] Building tooltips explain mechanics
   - [ ] "Why is this building red?" helper
   - [ ] Strategy tips

#### Week 12: Performance & Testing
1. **Optimization**
   - [ ] Profile at 1,000 people
   - [ ] Optimize pathfinding (cache routes)
   - [ ] Optimize rendering (culling, batching)

2. **Bug Fixes**
   - [ ] Playtesting with 5+ external testers
   - [ ] Fix critical bugs
   - [ ] Balance tuning

---

## 🎮 CRITICAL SYSTEMS DEEP DIVE

### Economic Pressure (The Core of the Game)

#### Income Sources
| Source | Timing | Amount | Notes |
|--------|--------|--------|-------|
| **Office Rent** | Quarterly | $1,500-$10,000 | Depends on evaluation |
| **Condo Sale** | One-time | $50,000-$75,000 profit | High risk (buyback) |
| **Hotel Rooms** | Daily | $500-$9,000/night | Variable occupancy |
| **Fast Food** | Daily | $2,000-$5,000 | Customer count based |
| **Restaurant** | Daily | $4,000-$10,000 | Evening traffic |
| **Party Hall** | Daily | $20,000 guaranteed | OP but balanced by unlock |

#### Expenses (NEW - CRITICAL)
| Expense | Timing | Amount | Notes |
|---------|--------|--------|-------|
| **Elevator Operating** | Daily | $50-$150 per car | Scales with fleet |
| **Building Maintenance** | Daily | Varies by type | Small but constant |
| **Escalator Upkeep** | Quarterly | $5,000 each | Luxury transport |
| **Staff Wages** | Daily | $100-$500 | Security, medical, etc. |

#### Cash Flow Formula
```
Daily Net = (Daily Income) - (Daily Expenses)
Quarterly Net = (Quarterly Income) - (Quarterly Expenses) + (Daily Net × 90)
```

#### Bankruptcy Threshold
```
IF funds < -$500,000 for 7 consecutive days:
  → GAME OVER (Bankruptcy)
  
Visual Warnings:
  funds < $0: "IN DEBT - Improve cash flow!"
  funds < -$100,000: "SERIOUS DEBT - 7 days until bankruptcy"
  funds < -$500,000: "BANKRUPTCY WARNING - X days remaining"
```

### Evaluation System (The Feedback Loop)

#### Evaluation Formula
```typescript
evaluation = 100 // Start at 100%

// 1. Elevator wait time (biggest factor)
averageWait = getAverageWaitTime(building.occupants)
if (averageWait > 30s) evaluation -= 10
if (averageWait > 60s) evaluation -= 20
if (averageWait > 120s) evaluation -= 40

// 2. Walking distance
walkDistance = getWalkingDistance(building)
if (walkDistance > 50 tiles) evaluation -= 10
if (walkDistance > 100 tiles) evaluation -= 25

// 3. Noise
if (hasNoisyNeighbor(building)) evaluation -= 15

// 4. Rent (offices/shops only)
rentRatio = building.rent / building.maxRent
evaluation -= rentRatio * 20 // Max -20% for maximum rent

// 5. Missing services
if (type === 'condo' && !hasMedicalNearby()) evaluation -= 10
if (type === 'office' && !hasFastFoodNearby()) evaluation -= 15

// Clamp to 0-100
evaluation = Math.max(0, Math.min(100, evaluation))
```

#### Evaluation Colors
```typescript
if (evaluation >= 70) return 'blue'   // Excellent
if (evaluation >= 40) return 'yellow' // Fair
return 'red' // Poor
```

#### Evaluation Consequences
```typescript
// Quarterly check
if (building.type === 'office') {
  if (evaluation < 40 && Math.random() < 0.5) {
    removeTenant(building)
    building.income = 0
    notify("Office tenant left due to poor conditions")
  }
}

if (building.type === 'condo') {
  if (evaluation < 30) {
    forceBuyback(building) // Player must pay purchase price
    notify("Condo resident moved out - Buyback: $" + building.salePrice)
  }
}

if (building.type === 'hotel') {
  occupancyRate = evaluation / 100 // 70% eval = 70% occupancy
}
```

### Schedule System (The Rhythm)

#### Time Scale
```
1 game hour = 60 ticks (at 100ms/tick = 6 real seconds)
1 game day = 24 hours = 1,440 ticks = 144 real seconds (~2.4 minutes)
1 quarter = 90 days = ~6 real hours
```

#### Daily Events
```typescript
TIME_EVENTS = {
  '07:00': { event: 'workersArrive', target: 'offices', weekdayOnly: true },
  '08:00': { event: 'rushHourPeak' },
  '12:00': { event: 'lunchRush', target: 'fastFood', weekdayOnly: true },
  '13:00': { event: 'lunchEnd' },
  '17:00': { event: 'workersLeave', target: 'offices', weekdayOnly: true },
  '18:00': { event: 'dinnerRush', target: 'restaurants' },
  '22:00': { event: 'nightMode' },
}
```

---

## 📊 SUCCESS METRICS

### Week 1 Success
- [ ] Player can go bankrupt
- [ ] Cash flow is visible and terrifying
- [ ] Building an office costs more than it makes (short-term)

### Week 2 Success
- [ ] Buildings show evaluation bars
- [ ] Red buildings visibly lose tenants
- [ ] Player can diagnose WHY a building is failing

### Week 3 Success
- [ ] Lunch rush is VISIBLE (stream of people to fast food)
- [ ] Office tower without fast food = massive stress
- [ ] Elevators JAM during rush hour

### Week 4 Success
- [ ] Reaching 2★ feels earned
- [ ] New buildings unlock and feel powerful
- [ ] Player understands star requirements

### Week 12 Success (v1.0)
- [ ] 10+ external testers play >30 minutes
- [ ] "This feels like SimTower" from 7/10 testers
- [ ] At least 2 testers reach 3★
- [ ] Average session length >20 minutes

---

## ✅ CURRENT STATUS (Updated: Feb 2, 2026 - 4:30 AM MST)

### 🎉 MAJOR MILESTONE: PHASE 1 COMPLETE!

**Weeks 1-4 are FULLY IMPLEMENTED and WORKING:**

| Week | System | Status | Notes |
|------|--------|--------|-------|
| Week 1 | Economic Pressure | ✅ COMPLETE | Bankruptcy at 7 days debt, daily expenses working |
| Week 2 | Evaluation System | ✅ COMPLETE | Buildings rated 0-100%, quarterly departures working |
| Week 3 | Population AI & Scheduling | ✅ COMPLETE | Lunch rush at 12 PM, morning/evening rush working |
| Week 4 | Star Rating Progression | ✅ COMPLETE | Unlock system gates 2★/3★ buildings |

**CRITICAL ADDITION (This Session):**
- ✅ **GameOverModal** - Bankruptcy and victory screens now working!
- ✅ **Win/Lose Conditions** - Game ends properly on bankruptcy or TOWER status

**Build Status**: ✅ Clean, 722 modules, no TypeScript errors

### Phase 2 Status (Weeks 5-8): LARGELY COMPLETE

- ✅ Building Variety: 15+ building types (offices, hotels, condos, restaurants, shops, security, medical)
- ✅ HotelSystem: Check-in, check-out, daily income
- ✅ ResidentSystem: Condo residents, rent collection
- ✅ EventSystem: VIPs, fires, bombs, Santa event, treasure, cockroaches
- ✅ RandomEventSystem: Maintenance issues, power outages, fire drills

### Phase 3 Status (Weeks 9-12): MOSTLY COMPLETE

**Sound & Music (Week 9) - ✅ COMPLETE:**
- ✅ Building placed, demolish, cash register sounds
- ✅ Elevator ding (plays when doors open)
- ✅ Alert sounds (bankruptcy warnings, fire alarm, victory fanfare)
- ✅ Star rating up fanfare
- ✅ Warning sounds (escalating with debt severity)
- ✅ Background music toggle button (🎵 button in BottomBar) - ADDED 2026-02-02 6:01 AM

**Visual Polish (Week 10) - EXISTS, NEEDS VERIFICATION:**
- ⚠️ Day/night cycle (TimeOfDaySystem exists)
- ⚠️ Building lights (needs testing)
- ⚠️ Animations (needs testing)

**Tutorial (Week 11) - EXISTS:**
- ✅ TutorialOverlay implemented
- ✅ First-time player onboarding

**Performance (Week 12) - 🔄 IN PROGRESS (ADDED 2026-02-02 6:20 AM):**
- ✅ Performance benchmark framework created (v0.7.9)
- ✅ Automated 4-phase stress test (100/500/1000/2000 people)
- ✅ FPS monitoring, frame drop detection
- ✅ Console API: `window.runPerformanceBenchmark()`
- ⏳ Run actual benchmark on real hardware
- ⏳ Profile bottlenecks if FPS < 30
- ⏳ Optimize as needed (spatial partitioning, dirty flags, batching)

## 🎯 IMMEDIATE NEXT STEPS

1. ✅ **Add Elevator Ding Sound** - DONE! (Already implemented, verified working)

2. ✅ **Add Alert Sounds** - DONE! (Bankruptcy warnings, victory fanfare)

3. ✅ **Add Background Music** - DONE! (2026-02-02 6:01 AM)
   - ✅ MusicPlayer class exists and functional
   - ✅ Added 🎵 toggle button to BottomBar
   - ✅ Button changes to 🔇 when music is off
   - ✅ Visual feedback (green when on, gray when off)
   - ✅ Notification when toggled
   - ✅ Keyboard shortcut support ready (M key)

4. ✅ **Add Performance Benchmark** - DONE! (2026-02-02 6:20 AM)
   - ✅ Created PerformanceBenchmark.ts
   - ✅ 4-phase stress test suite (100/500/1000/2000 people)
   - ✅ FPS monitoring and frame drop detection
   - ✅ `window.runPerformanceBenchmark()` console API
   - ⏳ Ready for runtime testing on real hardware

5. **Internal Playtest** (30 minutes) - ⚠️ NEEDS HUMAN TESTER
   - Play for 15-20 real minutes
   - Verify all systems work
   - Test bankruptcy path
   - Test victory path
   - Run performance benchmark
   - Note any bugs or balance issues

6. **External Testing** (Once 4-5 complete) - ⏳ PENDING
   - 5+ testers play >30 minutes
   - Collect feedback on "Does it feel like SimTower?"
   - Run performance benchmark on different hardware

## 🚀 ORIGINAL STARTING POINT (ARCHIVED)

**File:** `src/simulation/EvaluationSystem.ts` (NEW)

```typescript
/**
 * Evaluation System - Building satisfaction ratings
 * 
 * Calculates and tracks building evaluations based on:
 * - Elevator wait times
 * - Walking distances
 * - Noise
 * - Rent levels
 * - Service availability
 */

export class EvaluationSystem {
  private evaluations: Map<string, number> = new Map() // buildingId -> 0-100
  private lastUpdate: number = 0
  private UPDATE_INTERVAL = 60 // Update every 60 ticks (1 game-minute)
  
  update(tower: Tower, currentTick: number): void {
    if (currentTick - this.lastUpdate < this.UPDATE_INTERVAL) return
    
    for (const building of Object.values(tower.buildingsById)) {
      const eval = this.calculateEvaluation(building, tower)
      this.evaluations.set(building.id, eval)
    }
    
    this.lastUpdate = currentTick
  }
  
  private calculateEvaluation(building: Building, tower: Tower): number {
    let score = 100
    
    // TODO: Implement formula from above
    
    return Math.max(0, Math.min(100, score))
  }
  
  getEvaluation(buildingId: string): number {
    return this.evaluations.get(buildingId) ?? 100
  }
  
  getEvaluationColor(buildingId: string): 'blue' | 'yellow' | 'red' {
    const eval = this.getEvaluation(buildingId)
    if (eval >= 70) return 'blue'
    if (eval >= 40) return 'yellow'
    return 'red'
  }
}
```

**File:** `src/simulation/OperatingCostSystem.ts` (NEW)

```typescript
/**
 * Operating Cost System - Daily expenses
 * 
 * Deducts daily operating costs:
 * - Elevator operating costs
 * - Building maintenance
 * - Staff wages
 */

export class OperatingCostSystem {
  private lastDeductionTick: number = 0
  private TICKS_PER_DAY = 1440 // 24 hours × 60 ticks/hour
  
  update(tower: Tower, currentTick: number): void {
    if (currentTick - this.lastDeductionTick < this.TICKS_PER_DAY) return
    
    let totalCost = 0
    
    // Elevator operating costs
    for (const shaft of tower.elevators) {
      totalCost += shaft.cars.length * 50 // $50 per car per day
    }
    
    // Building maintenance
    for (const building of Object.values(tower.buildingsById)) {
      totalCost += building.maintenanceCostPerDay ?? 0
    }
    
    tower.funds -= totalCost
    
    // Check for bankruptcy
    this.checkBankruptcy(tower)
    
    this.lastDeductionTick = currentTick
  }
  
  private checkBankruptcy(tower: Tower): void {
    // TODO: Implement bankruptcy counter and game over
  }
}
```

### Action Items (RIGHT NOW)
1. ✅ Create REAL-GAME-PLAN.md (this file)
2. ⚡ Create EvaluationSystem.ts
3. ⚡ Create OperatingCostSystem.ts
4. ⚡ Integrate both systems into Game.ts update loop
5. ⚡ Add evaluation display to building tooltips
6. ⚡ Test bankruptcy mechanics

---

## 💪 COMMITMENT

**This is not a planning exercise. This is WAR.**

- No more "pathetic demo" bullshit
- Build the GAME, not the toy
- Ship working features every week
- Playtest with real people every 2 weeks
- If it's not FUN by Week 4, PIVOT

**Let's fucking build.**
