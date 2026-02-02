# OpenTower Bug Tracker

## Format
```
### BUG-XXX: Title
- **Severity:** Critical | High | Medium | Low
- **Found:** Date, by whom
- **Status:** Open | In Progress | Fixed | Won't Fix
- **Description:** What happens
- **Repro:** Steps to reproduce
- **Fix:** What was done (when fixed)
```

---

## Open Bugs

### BUG-011: Elevator Capacity Not Visually Obvious
- **Severity:** Low (UX)
- **Found:** 2026-02-01, Playtest Session #2
- **Status:** Open
- **Description:** Elevators show passenger count (e.g. "3"), but players don't know max capacity is 15. No visual fullness indicator.
- **Repro:** Spawn 20 people, watch elevator. Shows "15" but looks identical to "3"
- **Fix Needed:** Add visual fill bar or show "3/15" format. Color-code when >80% full (yellow/red warning)

### BUG-012: No Feedback When Elevator Drag Is Too Short
- **Severity:** Medium
- **Found:** 2026-02-01, Playtest Session #2
- **Status:** Open
- **Description:** Code enforces 2-floor minimum for elevators, but if player drags just 1 floor, nothing happens with no error message
- **Repro:** Select elevator, drag from floor 1 to floor 2 (1 floor gap), release. Nothing placed.
- **Root Cause:** `BuildingPlacer.ts` validates but doesn't show tooltip
- **Fix Needed:** Show error tooltip: "Elevators need at least 2 floors"

### BUG-013: People Can Get Stuck in Unreachable Destinations ⚠️ CRITICAL
- **Severity:** High (gameplay blocker)
- **Found:** 2026-02-01, Playtest Session #2
- **Status:** Open
- **Description:** Workers spawn on floors without elevators, get stuck in `waitingForElevator` state forever, stress goes critical
- **Repro:**
  1. Place office on floor 5
  2. Don't build elevator
  3. Worker spawns, tries to reach office, gets stuck
- **Root Cause:** `PathfindingSystem.findPath()` returns null, but calling code just adds stress without despawning person
- **Fix Needed:** Add retry counter (5 attempts), then despawn or force idle state after 30 seconds

### BUG-014: Elevator Shaft Not Removed on Demolish ⚠️ CRITICAL
- **Severity:** Critical (memory leak + visual bug)
- **Found:** 2026-02-01, Playtest Session #2
- **Status:** Open
- **Description:** Demolish mode works for buildings, but elevators aren't buildings. Clicking elevator does nothing.
- **Repro:**
  1. Place elevator
  2. Enter demolish mode (D key)
  3. Click on elevator shaft
  4. Nothing happens (shaft persists)
- **Root Cause:** `BuildingPlacer.ts` only checks `tower.buildingsById`, not `elevatorSystem.getShafts()`
- **Fix Needed:** Add elevator detection in demolish mode, call `elevatorSystem.removeShaft(id)`, refund cost

### BUG-015: Stress Doesn't Decay Over Time
- **Severity:** Medium (gameplay balance)
- **Found:** 2026-02-01, Playtest Session #2
- **Status:** Open
- **Description:** Stress only increases, never decreases. People who wait for elevator stay stressed forever even after reaching destination
- **Code:** No decay logic in `Person.update()` or `PopulationSystem.update()`
- **Repro:** Make person wait 60 seconds, then board elevator. Stress stays high.
- **Fix Needed:** Add stress decay (-1 per tick when idle/working, capped at 0). Faster decay when eating (-5/tick)

### BUG-016: Multiple People Can Board Same Elevator Spot
- **Severity:** Low (visual only)
- **Found:** 2026-02-01, Playtest Session #2
- **Status:** Open
- **Description:** Queue visualization shows spacing, but boarding animation doesn't prevent pixel overlap
- **Repro:** Hard to trigger, but with 10+ people boarding at once, some overlap briefly
- **Fix Needed:** Add staggered boarding delay (50ms per person)

### BUG-017: No Maximum Population Limit
- **Severity:** Medium (performance risk)
- **Found:** 2026-02-01, Playtest Session #2
- **Status:** Open
- **Description:** SimTower capped at ~15K population. This game has no cap. Auto-immigration could cause lag.
- **Code:** No check in `PopulationSystem.processImmigration()`
- **Repro:** Run game 1 hour at max speed with many offices
- **Fix Needed:** Add population cap (10,000) based on building capacity

### BUG-018: Sound Plays When Muted
- **Severity:** Low
- **Found:** 2026-02-01, Playtest Session #2 (code review)
- **Status:** Open - Needs Runtime Verification
- **Description:** `SoundManager.toggle()` exists, but all `play*()` methods might not check `this.enabled`
- **Fix Needed:** Verify early return in all sound methods

---

## Fixed Bugs

### BUG-001: Elevator Placement is Hardcoded ✅ FIXED
- **Severity:** High
- **Found:** 2026-01-31, Playtest Session
- **Status:** **FIXED** in v0.5.0
- **Description:** The "+ Add Elevator" button spawns elevator at hardcoded position (tile 50, floors 1-10) instead of allowing player to choose location
- **Repro:** 
  1. Click green "+ Add Elevator" button
  2. Elevator always spawns at tile 50
- **Root Cause:** `src/index.ts` line 150 - hardcoded `createStandardShaft(50, 1, 10)`
- **Fix Implemented:**
  - Added "Standard Elevator" to BuildingMenu as placeable item
  - Implemented drag-to-select-height mechanics in BuildingPlacer
  - Dynamic cost calculation (base $200K + $80K per floor)
  - Visual preview during placement (blue shaft with floor indicators)
  - Validation: 2-30 floor limit, cost checking
  - Removed hardcoded "+ Add Elevator" button
- **Fixed By:** v0.5.0 Build Sprint, 2025-01-31

### BUG-002: No Stairs Pathfinding ✅ FIXED
- **Severity:** Medium
- **Found:** 2026-01-31, Playtest Session
- **Status:** **FIXED** in Iteration 4
- **Description:** PathfindingSystem only considers elevators for multi-floor navigation. Stairs exist as building type but people won't use them.
- **Repro:**
  1. Place stairs connecting two floors
  2. Spawn person needing to go between floors
  3. Person ignores stairs, only looks for elevator
- **Root Cause:** `src/simulation/PathfindingSystem.ts` - `findBestElevator()` doesn't check for stairs
- **Fix Implemented:**
  - Added `findStairsPath()` method to PathfindingSystem
  - People now prefer stairs for 1-2 floor trips
  - Falls back to stairs for longer trips if no elevator available
  - Respects 4-floor comfort limit for stairs
  - Finds nearest stairs to current position
- **Fixed By:** Iteration 4, 2025-01-31

### BUG-003: No Building Demolition Tool ✅ FIXED
- **Severity:** Medium
- **Found:** 2026-01-31, Playtest Session
- **Status:** **FIXED** in Iteration 4
- **Description:** Once a building is placed, there's no way to remove it if it was a mistake
- **Repro:**
  1. Place any building
  2. Look for delete/demolish option
  3. None exists
- **Root Cause:** Feature not implemented
- **Fix Implemented:**
  - Added demolish mode toggle button (🗑️ button in bottom-left)
  - Keyboard shortcut: D key
  - Red highlight with X pattern on hover
  - 50% refund of original building cost
  - Visual feedback shows which building will be demolished
  - Proper cleanup: removes building, updates funds, emits events
- **Fixed By:** Iteration 4, 2025-01-31

### BUG-004: Stress Doesn't Affect Star Rating ✅ FIXED
- **Severity:** Low
- **Found:** 2026-01-31, Playtest Session
- **Status:** **FIXED** in v0.5.0
- **Description:** People can be critically stressed but star rating stays at 1⭐. In SimTower, happiness affected rating.
- **Repro:**
  1. Spawn workers with no elevator
  2. Watch stress go critical
  3. Star rating never changes
- **Root Cause:** Star rating calculation only based on population
- **Fix Implemented:**
  - Balanced star rating formula: population (50%) + happiness (30%) + profit (20%)
  - Happiness = % of people with normal stress level
  - Star thresholds: 2★ at 100 pop/50% happy/$10K day, 3★ at 500 pop/60% happy/$50K day
  - Updated every second (60 ticks)
  - Console logging when rating changes
  - Visual notification popup with animations
- **Fixed By:** v0.5.0 Build Sprint, 2025-01-31

### BUG-005: No Save/Load System ✅ FIXED
- **Severity:** High (feature gap)
- **Found:** 2026-01-31, Playtest Session
- **Status:** **FIXED** in Iteration 5
- **Description:** Refreshing the page loses all tower progress. No way to save/load game state.
- **Repro:**
  1. Build a tower for 10 minutes
  2. Refresh page
  3. Everything is gone
- **Root Cause:** Not implemented
- **Fix Implemented:**
  - Complete save/load system using localStorage
  - Saves: tower state, buildings, funds, population, time, star rating
  - Auto-save every 3 minutes
  - Manual save/load buttons (💾 Save, 📂 Load)
  - Keyboard shortcuts: Ctrl+S (save), Ctrl+L (load)
  - Auto-load on page refresh if save exists
  - Playtime tracking
  - Full serialization of all game systems
- **Fixed By:** Iteration 5, 2025-01-31

### BUG-006: Elevator Doors Don't Animate ✅ FIXED
- **Severity:** Low (polish)
- **Found:** 2026-01-31, Playtest Session
- **Status:** **FIXED** in Iteration 5
- **Description:** Elevator state changes (doors opening/closing) have no visual feedback
- **Repro:**
  1. Watch elevator arrive at floor
  2. Doors should open/close
  3. No visual change
- **Root Cause:** ElevatorRenderer doesn't render door states
- **Fix Implemented:**
  - Sliding door animation in ElevatorRenderer
  - Doors slide open/closed horizontally
  - Animation based on door timer progress
  - Grey door panels that reveal car interior
  - Smooth visual feedback for door state
- **Fixed By:** Iteration 5, 2025-01-31

### BUG-007: Population Count May Desync
- **Severity:** Medium
- **Found:** 2026-01-31, Playtest Session (code review)
- **Status:** Open - Needs Runtime Verification
- **Description:** When people leave the tower, PopulationSystem removes them but tower.population might not update correctly
- **Repro:**
  1. Spawn workers
  2. Wait for 5 PM (departure time)
  3. Check HUD population vs Tower Pulse population
- **Root Cause:** `cleanupLeavingPeople()` calls `people.delete()` but might not call `towerManager.updatePopulation()`
- **Fix Needed:** Verify sync, ensure tower count updates when people leave

### BUG-008: No Tutorial or Onboarding ✅ FIXED
- **Severity:** High (UX blocker)
- **Found:** 2026-01-31, Playtest Session
- **Status:** **FIXED** in v0.5.0
- **Description:** New players have no idea what to do. No instructions, tooltips, or tutorial.
- **Repro:**
  1. Open game for first time
  2. Stare at colored rectangles
  3. No guidance provided
- **Root Cause:** Not implemented
- **Fix Implemented:**
  - 4-step interactive tutorial overlay
  - Step 1: Welcome + goal (1★ → 3★ rating)
  - Step 2: Core loop (build offices → workers → income)
  - Step 3: Elevator challenge (why they matter + how to place)
  - Step 4: Controls + first tower checklist
  - First-launch detection (localStorage)
  - Skip option at every step
  - Floating ? help button to reopen
  - Keyboard shortcut: ? or / key
  - Beautiful gradient UI with animations
- **Fixed By:** v0.5.0 Build Sprint, 2025-01-31

### BUG-009: No Validation on Elevator Shaft Height
- **Severity:** Medium
- **Found:** 2026-01-31, Playtest Session (code review)
- **Status:** Open - Needs Runtime Verification
- **Description:** In SimTower, elevators could only serve 30 floors max. Current code has no height limit validation.
- **Repro:**
  1. Try creating elevator shaft with 100 floor range
  2. Might succeed (needs testing)
- **Root Cause:** `ElevatorShaft` constructor doesn't validate `maxFloor - minFloor <= 30`
- **Fix Needed:** Add validation, enforce 30-floor limit per SimTower rules

### BUG-010: Food Buildings Don't Generate Income ✅ FIXED
- **Severity:** Medium
- **Found:** 2026-01-31, Playtest Session
- **Status:** **FIXED** in Iteration 5
- **Description:** FastFood and Restaurant buildings exist but don't earn money when people visit
- **Repro:**
  1. Place restaurant
  2. Workers go to lunch
  3. No income generated
- **Root Cause:** EconomicSystem only tracks office income
- **Fix Implemented:**
  - Customer visit tracking in EconomicSystem
  - Income per customer: FastFood ($5), Restaurant ($15)
  - People visit food buildings during lunch hours
  - Customer count tracked per quarter
  - Automatic registration when person reaches food building
  - Stress reduction when eating (bonus mechanic!)
  - Console logging for customer visits
- **Fixed By:** Iteration 5, 2025-01-31

---

## Enhancements Implemented

### Sound System ✅ ADDED
- **Priority:** Medium (quick win)
- **Status:** **IMPLEMENTED** in Iteration 5
- **Features:**
  - Elevator ding sound (two-tone bell when doors open)
  - Building placement sound (satisfying thud)
  - Demolish sound (crumbling effect)
  - Web Audio API synthesis (no external files needed!)
  - Volume control and enable/disable toggle
  - Keyboard shortcut: M to mute/unmute
  - Minimal, non-intrusive sound design
- **Implemented By:** Iteration 5, 2025-01-31

### Day/Night Cycle ✅ ADDED
- **Priority:** High (visual wow factor)
- **Status:** **IMPLEMENTED** in Iteration 6
- **Features:**
  - Dynamic sky gradients (6 time periods: Night, Dawn, Morning, Afternoon, Dusk, Evening)
  - Smooth color transitions using linear interpolation
  - Building lights at night (yellow windows 6 PM - 7 AM)
  - Time-of-day labels in HUD ("8:32 AM - Morning")
  - 20-strip gradient rendering for smooth visuals
  - Period-specific color palettes
  - Automatic sprite regeneration on light state change
- **Implemented By:** Iteration 6, 2025-01-31

### Hotel Guest System ✅ ADDED
- **Priority:** Medium (gameplay depth)
- **Status:** **IMPLEMENTED** in Iteration 6
- **Features:**
  - Guest check-in during evening (6 PM - 10 PM)
  - Guest check-out during morning (8 AM - 11 AM)
  - Room occupancy tracking per hotel
  - Nightly rates: Single $100, Twin $150, Suite $300
  - Income generated on check-out
  - Quarterly income accumulation
  - Console logging for guest events
  - Full save/load support
- **Implemented By:** Iteration 6, 2025-01-31

### Population Growth System ✅ ADDED
- **Priority:** Medium (organic gameplay)
- **Status:** **IMPLEMENTED** in Iteration 6
- **Features:**
  - Auto-immigration every ~5 seconds
  - Star-rating-based probability (10% at 1★ → 90% at 5★)
  - Spawns 1-3 workers per event
  - Office capacity checking
  - Random office assignment
  - Console logging for new arrivals
  - Creates organic tower growth
- **Implemented By:** Iteration 6, 2025-01-31

### Cash Register Sound ✅ ADDED
- **Priority:** Low (audio polish)
- **Status:** **IMPLEMENTED** in Iteration 6
- **Features:**
  - "Ka-ching" sound on quarterly profits
  - Two-tone bell (1200 Hz + 1600 Hz)
  - Only plays if profit > 0
  - Respects sound settings
  - Satisfying income feedback
- **Implemented By:** Iteration 6, 2025-01-31

---

## Future Enhancements (Not Bugs)

### Feature: Stairs Not in Building Menu
- **Priority:** Medium
- **Description:** Stairs exist in code (`BuildingType = 'stairs'`) but aren't visible in building menu for placement
- **Reason:** Elevator placement needs to be fixed first (same issue)
- **Tracked in:** BUG-001 (elevator placement overhaul will include stairs)

### Feature: Star Rating Unlock System
- **Priority:** High
- **Description:** Need to implement SimTower's star progression: reaching 2★ unlocks condos, 3★ unlocks hotels, etc.
- **Dependencies:** BUG-004 (star rating calculation)
- **Design Needed:** Define unlock thresholds

### Feature: VIP Visitors
- **Priority:** Low (polish)
- **Description:** SimTower had Santa Claus and VIP visitors that gave bonuses
- **Cool Factor:** High nostalgia value

### Feature: Elevator Waiting Queue Visualization
- **Priority:** Medium
- **Description:** Can't see people waiting at elevator doors
- **Current:** People just stand at tile position
- **Desired:** Visual queue/crowd at elevator entrance

### Feature: Building Tooltips on Hover
- **Priority:** Medium (UX improvement)
- **Description:** No info shown when hovering over buildings
- **Desired:** Show building type, occupancy, income, state
- **Benefits:** Helps players understand tower at a glance
- **Tracked:** Iteration 6 identified need

---

## Fixed Bugs

### v0.5.0 - Polish & Progression Sprint (2025-01-31)
- ✅ **BUG-001**: Elevator Placement - Now placeable with drag-to-select-height UI
- ✅ **BUG-004**: Star Rating - Now factors in happiness & profit, not just population
- ✅ **BUG-008**: Tutorial/Onboarding - 4-step interactive guide for new players

---

## Performance Notes

From code review:
- `PopulationSystem.update()` - O(n) iteration over all people every 100ms tick
- `ElevatorSystem.update()` - O(n) iteration over all shafts/cars every 100ms tick
- **Concern:** With 1000+ people/elevators, could cause lag
- **Recommendation:** Add spatial partitioning or dirty flags for optimization
- **Test Case:** Spawn 1000 workers, measure FPS drop

---

*Last Updated: 2025-01-31 2:30 PM MST - Iteration 6 Complete*
