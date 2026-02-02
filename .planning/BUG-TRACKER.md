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

### BUG-020: Game Speed Not Saved ✅ FIXED
- **Severity:** High (gameplay disruption)
- **Found:** 2026-02-02, Playtest Cron (Code Review)
- **Status:** **FIXED** in v0.8.2 (2026-02-02, 10 AM MST)
- **Description:** Game speed setting (0/1/2/4) is not serialized by SaveLoadManager. Speed resets to 1 on every load.
- **Repro:**
  1. Set game to speed 4 (fastest)
  2. Save game (Ctrl+S)
  3. Reload page
  4. Speed resets to 1
- **Root Cause:** SaveLoadManager didn't serialize TimeSystem state
- **Fix Applied:**
  - Added `TimeSystem` to SaveLoadManager constructor
  - Added `timeSystemState` field to SaveData interface
  - Serialize: `timeSystemState: this.timeSystem.serialize()`
  - Deserialize: `this.timeSystem.deserialize(saveData.timeSystemState)`
  - Updated Game.ts to pass timeSystem to SaveLoadManager
- **Files Changed:** `SaveLoadManager.ts`, `Game.ts`
- **Testing:** Needs manual verification (set speed → save → reload → check)

### BUG-021: Day 0 Treated as Weekend ✅ FIXED
- **Severity:** Critical (breaks new player experience)
- **Found:** 2026-02-02, Playtest Cron (Code Review)
- **Status:** **FIXED** in v0.8.2 (2026-02-02, 10 AM MST)
- **Description:** New games start at Day 0, but RushHourSystem treats it as weekend → no workers spawn at 7:30 AM → confusing!
- **Repro:**
  1. Start new game (Day 0)
  2. Place office buildings
  3. Wait until 7:30 AM
  4. No workers spawn (because Day 0 < 1, treated as weekend)
- **Root Cause:** `RushHourSystem.ts:68` - `const isWeekday = clock.gameDay >= 1 && clock.gameDay <= 5`
- **Fix Applied:**
  - Changed to modulo-based week cycling: `const dayOfWeek = clock.gameDay % 7`
  - Weekdays: `dayOfWeek >= 0 && dayOfWeek <= 4` (Mon-Fri: 0-4)
  - Weekends: `dayOfWeek === 5 || dayOfWeek === 6` (Sat-Sun: 5-6)
  - Day 0 = 0 % 7 = 0 = Monday → morning rush works!
- **Files Changed:** `RushHourSystem.ts`
- **Testing:** Needs manual verification (new game → wait for 7:30 AM → check workers spawn)

### BUG-022: TypeScript Compilation Errors Ignored
- **Severity:** Medium (technical debt)
- **Found:** 2026-02-02, Playtest Cron (Build Analysis)
- **Status:** Open
- **Description:** Progress log mentions "23 minor pre-existing errors" that were ignored. Vite dev works but type safety compromised.
- **Impact:** 
  - Could miss real bugs at compile time
  - Harder for contributors to understand correct API usage
  - CI/CD might fail on stricter TS configs
- **Root Cause:** Interface definitions don't match implementation in several systems
- **Fix Needed:** Systematic cleanup of type mismatches (see v0.7.2 for examples)

### BUG-023: No Elevator Height Limit Validation
- **Severity:** Medium
- **Found:** 2026-02-02, Playtest Cron (Code Review)
- **Status:** Open (BUG-009 from Jan 31 never verified fixed)
- **Description:** SimTower limited elevators to 30 floors max. Current BuildingPlacer might allow unlimited height.
- **Repro:** Place elevator from floor 1 to floor 50 (needs runtime testing)
- **Expected:** Should reject placement with error "Elevators limited to 30 floors"
- **Root Cause:** No validation in `BuildingPlacer.isValidElevatorPlacement()` or `ElevatorShaft` constructor
- **Fix Needed:** Add check: `if (maxFloor - minFloor > 30) return { valid: false, reason: "Max 30 floors" }`

### BUG-024: Population Cap Not Centralized ✅ FIXED
- **Severity:** Medium
- **Found:** 2026-02-02, Playtest Cron (Code Review)
- **Status:** **FIXED** in v0.8.2 (2026-02-02, 10 AM MST)
- **Description:** v0.7.4 added 10K population cap to `processImmigration()`, but other spawn paths might bypass it.
- **Edge Cases:**
  - Debug button "+ Spawn Workers" (if still exists)
  - Manual `PopulationSystem.addPerson()` calls
  - RushHourSystem spawning workers
- **Root Cause:** Cap check was in one method, not enforced at `addPerson()` level
- **Fix Applied:**
  - Moved `MAX_POPULATION = 10000` to module-level constant
  - Added guard clause to `addPerson()`: returns `false` if cap reached
  - Logs warning: "⚠️ Population cap reached (10000). Cannot add person."
  - Changed return type from `void` to `boolean` for caller feedback
- **Files Changed:** `PopulationSystem.ts`
- **Testing:** Needs manual verification (spawn 10K people → verify cap enforcement)

### BUG-025: Evaluation Scores Invisible in UI ✅ FIXED
- **Severity:** Medium (UX blocker)
- **Found:** 2026-02-02, Playtest Cron (Code Review)
- **Status:** **FIXED** in v0.8.8 (2026-02-02, 11:06 AM MST)
- **Description:** EvaluationSystem calculates building satisfaction (0-100%) but no UI displays scores. Players can't see WHY buildings fail.
- **Impact:** 
  - No feedback loop for optimization
  - Can't diagnose bad elevator placement
  - Tenant departures feel random
- **Root Cause:** BuildingTooltip never accessed EvaluationSystem data
- **Fix Applied:**
  - Added `setEvaluationSystem()` method to BuildingTooltip
  - Wired up evaluation system in index.ts
  - Tooltip now displays:
    - Color-coded evaluation bar (Blue 70-100%, Yellow 40-69%, Red 0-39%)
    - Numeric score percentage
    - Visual progress bar
    - "Excellent" / "Fair" / "Poor" label
    - **Detailed factor breakdown** showing penalties:
      - Elevator wait time
      - Walking distance
      - Noise
      - Rent level
      - Missing services
  - Only shows negative factors (problems to fix)
- **Files Changed:** `BuildingTooltip.ts`, `index.ts`
- **Testing:** See `TESTING-v0.8.8.md` for comprehensive test guide
- **Fixed By:** v0.8.8, 2026-02-02 11:06 AM MST (Cron Job)

### BUG-026: No Sound for Weekend Shift
- **Severity:** Low (polish)
- **Found:** 2026-02-02, Playtest Cron (Code Review)
- **Status:** Open
- **Description:** Weekend shift triggers with notification but no unique sound effect (uses same sound as weekday rush)
- **Impact:** Less audio juice on weekends
- **Fix Needed:** Add subtle "lazy morning" sound effect or different notification tone for `triggerWeekendShift()`

### BUG-027: Elevator Give-Up Count Not Visible
- **Severity:** Low (UX)
- **Found:** 2026-02-02, Playtest Cron (Code Review)
- **Status:** Open
- **Description:** v0.8.2 added elevator give-up logic with thought bubbles, but no UI counter shows how many people gave up.
- **Impact:** Players can't quantify elevator capacity problems
- **Fix Needed:** Add stat to elevator info panel or HUD: "X people gave up waiting today"

### BUG-028: No Visual Indicator for Weekend
- **Severity:** Low (UX)
- **Found:** 2026-02-02, Playtest Cron (Code Review)
- **Status:** Open
- **Description:** Weekend schedules work (reduced staff) but HUD doesn't show "WEEKEND" label. Players might not notice.
- **Impact:** Reduced weekend staff might feel like a bug instead of a feature
- **Fix Needed:** Add day-of-week to time display - "Monday 8:32 AM" vs "Saturday 10:15 AM - WEEKEND"

### BUG-019: Elevators Can Overlap ✅ FIXED
- **Severity:** Medium (exploit + visual bug)
- **Found:** 2026-02-02, Cron Build Session (TODO in code)
- **Status:** **FIXED** in v0.8.1
- **Description:** Players can place unlimited elevators at the same tile position. No overlap validation during placement.
- **Root Cause:** BuildingPlacer.ts had TODO comment but no actual overlap checking
- **Repro:**
  1. Place elevator at tile 50, floors 1-10
  2. Place another elevator at tile 50, floors 5-15
  3. Both elevators exist, overlapping visually and functionally
- **Fix Implemented:**
  - Added `setElevatorOverlapCallback()` to BuildingPlacer
  - Implemented overlap detection in index.ts
  - Algorithm checks tile position + floor range overlap
  - Ghost preview shows red when overlap detected
  - Error message: "⚠️ Elevator overlaps with existing shaft"
  - Console warning logs the conflict
- **Fixed By:** v0.8.1, 2026-02-02 8:00 AM MST

### BUG-015: Stress Doesn't Decay Over Time ✅ FIXED
- **Severity:** Medium (gameplay balance)
- **Found:** 2026-02-01, Playtest Session #2
- **Status:** **FIXED** in v0.7.4
- **Description:** Stress only increases, never decreases. People who wait for elevator stay stressed forever even after reaching destination
- **Root Cause:** No decay logic in `Person.update()`
- **Fix Implemented:**
  - Stress decays slowly (-0.1/tick) when idle or at destination
  - Faster decay (-0.2/tick) when riding elevator
  - Existing eating bonus (-10 instant) preserved
- **Fixed By:** v0.7.4 Polish Sprint, 2026-02-02

### BUG-016: Multiple People Can Board Same Elevator Spot ✅ FIXED
- **Severity:** Low (visual only)
- **Found:** 2026-02-01, Playtest Session #2
- **Status:** **FIXED** in v0.7.4
- **Description:** Queue visualization shows spacing, but boarding animation doesn't prevent pixel overlap
- **Root Cause:** All waiting people board same car in same tick
- **Fix Implemented:** Only one person can board per car per tick, prevents visual overlaps
- **Fixed By:** v0.7.4 Polish Sprint, 2026-02-02

### BUG-017: No Maximum Population Limit ✅ FIXED
- **Severity:** Medium (performance risk)
- **Found:** 2026-02-01, Playtest Session #2
- **Status:** **FIXED** in v0.7.4
- **Description:** SimTower capped at ~15K population. This game has no cap. Auto-immigration could cause lag.
- **Root Cause:** No check in `PopulationSystem.processImmigration()`
- **Fix Implemented:** Added 10,000 population cap (prevents performance issues)
- **Fixed By:** v0.7.4 Polish Sprint, 2026-02-02

### BUG-018: Sound Plays When Muted ✅ VERIFIED FIXED
- **Severity:** Low
- **Found:** 2026-02-01, Playtest Session #2 (code review)
- **Status:** **ALREADY FIXED** - All sound methods have early returns
- **Description:** Concern that `SoundManager` might play sounds when muted
- **Verification:** All 9 `play*()` methods correctly check `if (!this.enabled) return`
- **Result:** NO BUG - code is correct

### BUG-011: Elevator Capacity Not Visually Obvious ✅ FIXED
- **Severity:** Low (UX)
- **Found:** 2026-02-01, Playtest Session #2
- **Status:** **FIXED** in v0.7.4
- **Description:** Elevators show passenger count (e.g. "3"), but players don't know max capacity is 15
- **Fix Implemented:**
  - Shows "X/15" format instead of just "X"
  - Background color-codes for fullness: green (<50%), orange (50-80%), red (>80%)
  - Larger background circle to fit longer text
- **Fixed By:** v0.7.4 Polish Sprint, 2026-02-02

### BUG-012: No Feedback When Elevator Drag Is Too Short ✅ FIXED
- **Severity:** Medium
- **Found:** 2026-02-01, Playtest Session #2
- **Status:** **FIXED** in v0.7.4
- **Description:** Code enforces 2-floor minimum for elevators, but if player drags just 1 floor, nothing happens with no error message
- **Root Cause:** `BuildingPlacer.ts` validates but doesn't show feedback
- **Fix Implemented:**
  - Console warning: "⚠️ Elevator too short: needs at least 2 floors"
  - Error message timeout (3 seconds)
  - Also shows funding error when insufficient funds
- **Fixed By:** v0.7.4 Polish Sprint, 2026-02-02

### BUG-013: People Can Get Stuck in Unreachable Destinations ✅ FIXED
- **Severity:** High (gameplay blocker)
- **Found:** 2026-02-01, Playtest Session #2
- **Status:** **FIXED** in v0.7.6
- **Description:** Workers spawn on floors without elevators, get stuck in `waitingForElevator` state forever, stress goes critical
- **Root Cause:** `PathfindingSystem.findPath()` returns null, but calling code just adds stress without despawning person
- **Fix Implemented:**
  - Added retry tracking: `pathfindingFailures`, `lastPathfindingAttemptTick`, `stuckSince` fields
  - After 5 failed pathfinding attempts OR 30 seconds stuck, person gives up
  - Stuck people enter 'leaving' state and despawn gracefully
  - Thought bubble shows "Can't get there!" for player feedback
  - Problematic buildings marked in `badExperienceBuildings` memory
  - Console warnings log which person got stuck and why
- **Fixed By:** v0.7.6, 2026-02-02 3:20 AM MST

### BUG-014: Elevator Shaft Not Removed on Demolish ✅ FIXED
- **Severity:** Critical (memory leak + visual bug)
- **Found:** 2026-02-01, Playtest Session #2
- **Status:** **FIXED** in v0.7.5
- **Description:** Demolish mode works for buildings, but elevators aren't buildings. Clicking elevator does nothing.
- **Root Cause:** `BuildingPlacer.ts` only checks `tower.buildingsById`, not `elevatorSystem.getShafts()`
- **Fix Implemented:**
  - BuildingPlacer now detects elevator clicks in demolish mode
  - Added `findShaftAtPosition(tile, floor)` to ElevatorSystem
  - Callback wiring in index.ts handles removal and 50% refund
  - Visual feedback: red X appears on hovered elevator
  - Works exactly like building demolish
- **Fixed By:** v0.7.5, 2026-02-02 3:20 AM MST

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
