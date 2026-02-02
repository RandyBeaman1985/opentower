# OpenTower v0.7.9 - Verification Checklist
**Created:** 2026-02-02, 7:14 AM MST  
**Status:** Ready for Human Testing  
**Build:** ✅ Clean (0 TypeScript errors, 723 modules)

---

## 🎯 Quick Start Test (5 minutes)

**Open:** http://localhost:5173/ (or http://100.85.24.1:5173/)

1. **Does the game load?** ✅ Expected: Tower with lobby visible
2. **Can you place buildings?** Click Building Menu → Office → Click to place
3. **Can you add elevators?** Click Elevator → Drag vertically between floors
4. **Do people appear?** Wait for 7:30 AM game time (or fast-forward with speed buttons)
5. **Do elevators move?** People should board elevators and ride up

**If all 5 work → Core game loop is functional!**

---

## ✅ Phase 1: Economic Pressure (Weeks 1-4) - CLAIMED COMPLETE

### Week 1: Operating Costs & Bankruptcy
**File:** `src/simulation/OperatingCostSystem.ts`, `src/simulation/EconomySystem.ts`

**Test:**
1. Start game with $100,000 initial funds
2. Build 5 offices + 2 elevators (~$75,000 spent)
3. Fast-forward (speed 4) to next quarter
4. **Expected:**
   - Daily elevator costs: $50/car × 2 = $100/day
   - 90 days until next quarter = $9,000 in elevator costs
   - If no tenants yet, should go into debt
5. **Check:** Console for "⚠️ BANKRUPTCY WARNING" messages
6. **Check:** TowerPulse shows negative funds in red

**Bankruptcy Test:**
1. Keep spending without income
2. Go below -$500,000
3. Stay in debt for 7 days
4. **Expected:** "GAME OVER - Bankruptcy" modal appears

**Status:** ⏳ Needs human verification

### Week 2: Evaluation System
**File:** `src/simulation/EvaluationSystem.ts`

**Test:**
1. Place office on floor 10
2. Don't add elevator (force poor evaluation)
3. Workers spawn but can't reach office
4. Wait until first quarter
5. **Check:** Building tooltip shows evaluation score (should be RED <40%)
6. **Check:** Console logs tenant departures
7. **Expected:** Office loses tenant, income drops to $0

**Status:** ⏳ Needs human verification

### Week 3: Population AI & Scheduling
**File:** `src/simulation/RushHourSystem.ts`, `src/simulation/PopulationAI.ts`

**Test:**
1. Place 3 offices on different floors
2. Add elevator connecting them
3. Fast-forward to **7:30 AM** (Morning Rush)
4. **Expected:**
   - Console log: "🌅 MORNING RUSH" 
   - Workers spawn at LOBBY (ground floor, center)
   - Workers walk to elevator
   - Workers board and ride UP to offices
5. Fast-forward to **12:00 PM** (Lunch Rush)
6. Place FastFood building on ground floor
7. **Expected:**
   - Workers leave offices
   - Workers seek FastFood building
   - Stress decreases when eating
8. Fast-forward to **5:00 PM** (Evening Rush)
9. **Expected:**
   - Workers leave offices
   - Workers return to lobby
   - Workers despawn (go home)

**Status:** ⏳ Needs human verification

### Week 4: Star Rating Progression
**File:** `src/simulation/StarRatingSystem.ts`

**Test:**
1. Start at 1★ (default)
2. Build population to 100+ with average evaluation >60%
3. **Expected:** 
   - Notification: "⭐ REACHED 2 STARS!"
   - Star rating fanfare sound plays
   - Building menu unlocks: Hotel, Condo, Shop
4. Continue to 500+ population, >70% eval, add Security Office
5. **Expected:** Reach 3★, unlock Party Hall

**Status:** ⏳ Needs human verification

---

## ✅ Phase 2: Content & Variety (Weeks 5-8) - CLAIMED COMPLETE

### Building Types Available
**File:** `src/interfaces/index.ts`, `src/simulation/BuildingFactory.ts`

**Count:** 21 building types defined
- ✅ Office (multiple sizes)
- ✅ Hotel (Single, Twin, Suite)
- ✅ Condo
- ✅ Restaurant
- ✅ Shop
- ✅ FastFood
- ✅ Party Hall
- ✅ Security Office
- ✅ Medical Center
- ✅ Parking Ramp
- ✅ Cinema
- ✅ Cathedral
- ✅ Metro Station
- ✅ Lobby
- ✅ Escalator

**Test:**
1. Check Building Menu - should show 16+ buildings
2. Some locked with star icons (2★/3★ required)
3. Try to place each building type
4. **Expected:** All buildings render correctly with distinct colors

**Status:** ⏳ Needs visual verification

### Hotel System
**File:** `src/simulation/HotelSystem.ts`

**Test:**
1. Unlock 2★ (reach 100 population)
2. Place Hotel Single building
3. Wait for guests to check in
4. **Expected:**
   - Console log: "Guest checked into hotel"
   - Daily income from occupied rooms
   - Guests check out after 1-3 days

**Status:** ⏳ Needs human verification

### Events System
**File:** `src/simulation/EventSystem.ts`, `src/simulation/RandomEventSystem.ts`

**Test:**
1. Play for 10+ game quarters
2. **Expected random events:**
   - 🎅 Santa Event (December)
   - 🔥 Fire in building
   - 💣 Bomb threat
   - 💰 Treasure found (+$50,000)
   - 🪳 Cockroach infestation
   - 🌟 VIP guest checks in
3. **Check:** Notification appears for each event
4. **Check:** Event affects game state (fire damages building, VIP pays premium)

**Status:** ⏳ Needs human verification

---

## ✅ Phase 3: Polish & Juice (Weeks 9-12) - CLAIMED MOSTLY COMPLETE

### Week 9: Sound & Music ✅ COMPLETE
**Files:** `src/audio/SoundManager.ts`, `src/audio/MusicPlayer.ts`

**Sound Effects Test:**
1. Place building → **Expected:** Construction sound
2. Demolish building → **Expected:** Demolish sound
3. Collect rent → **Expected:** Cash register sound
4. Elevator arrives → **Expected:** Ding sound
5. Reach 2★ → **Expected:** Fanfare sound
6. Go into debt → **Expected:** Warning sound (escalates with severity)
7. Trigger bankruptcy → **Expected:** Alarm sound

**Music Test:**
1. Click 🎵 button in bottom bar
2. **Expected:** Background music starts
3. Click again → **Expected:** Music stops, button shows 🔇
4. **Check:** Volume control, mute option

**Status:** ⏳ Needs audio verification

### Week 10: Visual Polish ⚠️ EXISTS, NEEDS VERIFICATION
**Files:** `src/simulation/TimeOfDaySystem.ts`, `src/rendering/TowerRenderer.ts`

**Day/Night Cycle Test:**
1. Start game at 5:00 AM (default)
2. Fast-forward (speed 4) through 24 hours
3. **Expected sky color changes:**
   - **6:00-8:00 AM (Dawn):** Blue → Orange/Pink gradient
   - **8:00-12:00 PM (Morning):** Bright sky blue
   - **12:00-5:00 PM (Afternoon):** Sky blue (constant)
   - **5:00-7:00 PM (Dusk):** Blue → Orange/Purple gradient  
   - **7:00 PM-6:00 AM (Night):** Deep blue, dark

**Building Lights Test:**
1. Fast-forward to **6:00 PM** (18:00)
2. **Expected:** 
   - `TimeOfDaySystem.shouldShowLights()` returns true
   - Building windows change from dark to **yellow glow** (0xFFD700)
   - All office/condo/hotel buildings regenerate sprites with lights on
3. Fast-forward to **7:00 AM**
4. **Expected:**
   - Lights turn off
   - Windows return to darker color

**Technical Verification:**
```typescript
// In browser console:
// Check if day/night system is updating
window.game.getTimeSystem().getTimeOfDayState()
// Should show:
// { period: 'NIGHT', buildingsShowLights: true, skyGradient: {...} }
```

**Status:** ⚠️ CODE EXISTS, needs runtime verification

### Week 11: Tutorial ✅ COMPLETE
**File:** `src/ui/TutorialOverlay.ts`

**Test:**
1. Start new game
2. **Expected:** Tutorial overlay appears
3. **Steps:**
   - Welcome message
   - "Build your first office"
   - "Add an elevator"
   - "Workers need food"
4. Complete tutorial
5. **Expected:** Tutorial dismissed, normal gameplay begins

**Status:** ⏳ Needs human verification

### Week 12: Performance 🔄 FRAMEWORK READY
**File:** `src/utils/PerformanceBenchmark.ts`

**Benchmark Test:**
1. Open game: http://localhost:5173/
2. Open browser DevTools (F12)
3. Run in console:
   ```javascript
   window.runPerformanceBenchmark()
   ```
4. **Expected output:**
   ```
   📊 PERFORMANCE BENCHMARK STARTING...
   
   Phase 1/4: Baseline (100 people, 10 buildings, 2 elevators)
   Running for 30 seconds...
   ✓ Avg FPS: 60.0 | Min: 58 | Max: 62
   
   Phase 2/4: Medium Load (500 people, 30 buildings, 5 elevators)
   Running for 30 seconds...
   ✓ Avg FPS: 55.2 | Min: 48 | Max: 60
   
   Phase 3/4: High Load (1000 people, 50 buildings, 10 elevators)
   Running for 30 seconds...
   ✓ Avg FPS: 42.1 | Min: 35 | Max: 50
   
   Phase 4/4: Stress Test (2000 people, 80 buildings, 15 elevators)
   Running for 30 seconds...
   ⚠ Avg FPS: 28.4 | Min: 18 | Max: 35
   
   📊 BENCHMARK SUMMARY
   ================================================
   | Phase          | Pop  | FPS (Avg/Min/Max) | Result |
   |----------------|------|-------------------|--------|
   | Baseline       | 100  | 60/58/62          | ✅ PASS |
   | Medium Load    | 500  | 55/48/60          | ✅ PASS |
   | High Load      | 1000 | 42/35/50          | ✅ PASS |
   | Stress Test    | 2000 | 28/18/35          | ❌ FAIL |
   
   ❌ BENCHMARK FAILED - Performance issues detected
   Recommendation: Profile with Chrome DevTools
   ```

5. **Pass criteria:** Sustained 30+ FPS at 1000 people
6. **If failed:** Profile bottlenecks, optimize render/simulation loops

**Status:** ⏳ Benchmark framework ready, needs runtime testing

---

## 🐛 Known Issues (from PROGRESS-LOG.md)

### Fixed Recently:
- ✅ BUG-013: People stuck in unreachable destinations (v0.7.6)
- ✅ BUG-014: Elevator demolish not working (v0.7.5)
- ✅ BUG-015: Stress decay (v0.7.4)
- ✅ BUG-011: Elevator capacity display (v0.7.4)
- ✅ BUG-012: Elevator drag feedback (v0.7.4)
- ✅ BUG-017: Population cap (v0.7.4)
- ✅ BUG-016: Boarding overlap (v0.7.4)
- ✅ BUG-018: Sound when muted (verified fixed, v0.7.4)

### Potential New Issues:
- ⚠️ Day/night lights might regenerate sprites too often (performance concern)
- ⚠️ Rush hour workers might not pathfind correctly to offices
- ⚠️ Evaluation system might not affect tenant departures correctly
- ⚠️ Bankruptcy might trigger too easily (balance issue)

---

## 📊 Success Metrics (from REAL-GAME-PLAN.md)

### Week 1 Success:
- [ ] Player can go bankrupt ✓ (system exists)
- [ ] Cash flow is visible and terrifying (TowerPulse shows funds)
- [ ] Building an office costs more than it makes short-term

### Week 2 Success:
- [ ] Buildings show evaluation bars (tooltip)
- [ ] Red buildings visibly lose tenants (quarterly check)
- [ ] Player can diagnose WHY a building is failing

### Week 3 Success:
- [ ] Lunch rush is VISIBLE (stream of people to fast food)
- [ ] Office tower without fast food = massive stress
- [ ] Elevators JAM during rush hour (morning 7:30 AM)

### Week 4 Success:
- [ ] Reaching 2★ feels earned
- [ ] New buildings unlock and feel powerful
- [ ] Player understands star requirements

### Week 12 Success (v1.0):
- [ ] 10+ external testers play >30 minutes
- [ ] "This feels like SimTower" from 7/10 testers
- [ ] At least 2 testers reach 3★
- [ ] Average session length >20 minutes

---

## 🎮 Internal Playtest Instructions (30 minutes)

**Recommended by:** REAL-GAME-PLAN.md (Immediate Next Steps #5)

### Setup:
1. Fresh browser session (clear cache)
2. Open http://localhost:5173/
3. Enable sound/music
4. Start timer (30 minutes)

### Playtest Goals:
1. **Build a profitable tower** (reach 2★ or 3★)
2. **Experience rush hours** (7:30 AM, 12 PM, 5 PM)
3. **Test bankruptcy path** (overspend, go into debt, recover)
4. **Test evaluation system** (place building without elevator, see it fail)
5. **Verify day/night cycle** (watch sky change, lights turn on/off)
6. **Listen for all sounds** (construction, ding, cash, warnings, fanfare)
7. **Run performance benchmark** (console: `window.runPerformanceBenchmark()`)

### Take Notes:
- **What feels good?** (satisfying moments)
- **What's confusing?** (unclear UI, missing feedback)
- **What's broken?** (bugs, crashes, wrong behavior)
- **What's missing?** (features you expected but didn't see)
- **Balance issues?** (too easy/hard, costs wrong, income too low/high)

### Specific Tests:
- [ ] Place 5+ offices on different floors
- [ ] Add 2-3 elevators
- [ ] Place FastFood + Restaurant
- [ ] Wait for morning rush (7:30 AM) - do workers spawn at lobby?
- [ ] Wait for lunch rush (12 PM) - do workers seek food?
- [ ] Let quarter end - do you collect rent?
- [ ] Check evaluation of a building without elevator access
- [ ] Go into debt intentionally - do warnings play?
- [ ] Reach 2★ - does fanfare play? Do new buildings unlock?
- [ ] Fast-forward through 24 hours - does sky change colors?
- [ ] Watch for building lights at 6 PM - do windows glow yellow?

---

## 🚀 Next Steps After Verification

1. **If all systems work:** 
   - Update PROGRESS-LOG.md with test results
   - Mark Phase 1-3 as "VERIFIED COMPLETE"
   - Create v0.8.0 release: "First Playable Build"
   - Begin external testing (5+ testers)

2. **If issues found:**
   - Log specific bugs in new file: `BUGS-v0.7.9.md`
   - Prioritize by severity (blocker/high/medium/low)
   - Fix blockers first
   - Re-test after fixes

3. **Performance optimization (if FPS < 30):**
   - Profile with Chrome DevTools Performance tab
   - Identify bottlenecks (render loop vs simulation loop)
   - Common fixes:
     - Spatial partitioning for collision detection
     - Dirty flags for only re-rendering changed buildings
     - Object pooling for Person entities
     - WebGL batching for sprites
     - Offload pathfinding to Web Workers

4. **Balance tuning:**
   - Adjust costs/income if bankruptcy too easy/hard
   - Tune evaluation thresholds if tenants leave too quickly
   - Adjust star rating requirements if progression too slow

---

**This checklist is ready for human testing. Run through it systematically to verify all claims in REAL-GAME-PLAN.md!**
