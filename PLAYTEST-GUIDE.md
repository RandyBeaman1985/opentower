# OpenTower - ULTIMATE PLAYTEST GUIDE 🎮
**Version:** v0.14.4 (Code Complete)  
**Created:** 2026-02-03, 12:01 AM MST  
**Status:** ⚠️ **NEVER BEEN HUMAN-TESTED - YOU ARE THE FIRST!**

---

## 🚀 QUICK START (5 minutes)

### 1. Launch the Game
**Dev Server:** http://localhost:5173/  
**Alt URL (Tailscale):** http://100.85.24.1:5173/

**Expected:** Tower with lobby visible, building menu on left, HUD on top-right

### 2. Verify Core Loop (2 minutes)
1. Click "Office (Small)" in building menu
2. Click anywhere on the tower to place it
3. Click "Standard Elevator" in menu
4. **Drag vertically** from floor 1 to floor 5 (creates elevator shaft)
5. Press **Space** or click ⏩ to fast-forward to 7:30 AM
6. **Expected:** Workers spawn at LOBBY and use elevator to reach office

**✅ If this works → Core game loop is functional!**

---

## 🎯 COMPREHENSIVE 30-MINUTE PLAYTEST

This guide systematically tests ALL systems (Phases 1-3). Follow in order.

---

## ✅ PHASE 1: ECONOMIC PRESSURE (10 minutes)

### Test 1: Operating Costs & Cash Flow
**System:** `OperatingCostSystem.ts`, `EconomySystem.ts`

**Steps:**
1. Note starting funds: **$100,000** (top-right HUD)
2. Build **5 Office (Small)** buildings ($20K each = $100K total)
3. Build **2 Standard Elevators** ($200K + $80K/floor × 5 floors = $1.4M each)
4. **Expected:** Now in debt (~-$1.4M)
5. Open TowerPulse (bottom-right panel):
   - Should show **negative funds in RED**
   - Shows "Days to Bankruptcy: X" countdown
6. Press **F** key to open **Financial Report Modal**
7. **Expected:**
   - Shows income breakdown by category (Office, Hotel, Food, etc.)
   - Shows expense breakdown (Elevator Operating, Maintenance)
   - Shows strategic tips ("Build more offices", "Elevators cost $X/day")
   - Visual bar charts showing % contribution

**Pass Criteria:**
- ✅ Funds go negative when overspending
- ✅ Daily elevator operating costs deducted ($50/car/day)
- ✅ Bankruptcy warning appears when funds < -$100K
- ✅ Financial report modal accessible with **F** key
- ✅ Report shows detailed income/expense breakdown

### Test 2: Bankruptcy Mechanics
**System:** `OperatingCostSystem.ts` line 280-320

**Steps:**
1. Continue from Test 1 (should be in debt)
2. Let debt exceed **-$500,000**
3. Wait **7 game-days** (fast-forward with Speed 4)
4. **Expected:** "GAME OVER - BANKRUPTCY" modal appears
5. Click "Start Over" → Game resets to Day 0

**Pass Criteria:**
- ✅ Bankruptcy countdown visible in TowerPulse
- ✅ Game Over modal appears after 7 days
- ✅ "Start Over" button restarts game

### Test 3: Tenant Rent Collection
**System:** `EconomicSystem.ts`

**Steps:**
1. Start new game (or restart from bankruptcy)
2. Build **1 Office (Small)** + **1 Standard Elevator** (connecting lobby to office)
3. Fast-forward to **Day 0, 7:30 AM** (morning rush)
4. **Expected:** Worker spawns at lobby, rides elevator, enters office
5. Fast-forward to **Day 90** (end of first quarter)
6. **Expected:**
   - Console log: "Collected quarterly rent"
   - Funds increase by **$1,500** (office rent)
   - Cash register sound plays

**Pass Criteria:**
- ✅ Quarterly rent collected automatically
- ✅ Funds increase when office is occupied
- ✅ Cash register sound plays on income

---

## 🎨 PHASE 2: EVALUATION SYSTEM (7 minutes)

### Test 4: Building Evaluation Display
**System:** `EvaluationSystem.ts`, `BuildingTooltip.ts`

**Steps:**
1. Build **1 Office (Large)** on **Floor 10**
2. **Do NOT add elevator** (force poor evaluation)
3. Hover mouse over the office building
4. **Expected:** Tooltip appears showing:
   - Building name: "Office (Large)"
   - **Evaluation bar** (color-coded: Blue 70-100%, Yellow 40-69%, Red 0-39%)
   - **Numeric score** (e.g., "Evaluation: 28%")
   - **Factor breakdown** showing penalties:
     - "❌ Elevator wait: -40%" (or similar)
     - "❌ Walking distance: -25%"
     - Other negative factors
5. **Expected evaluation:** RED (0-39%) because no elevator access

**Pass Criteria:**
- ✅ Tooltip shows evaluation bar
- ✅ Color-coded: Blue/Yellow/Red
- ✅ Shows specific penalty factors
- ✅ Building with no elevator = RED evaluation

### Test 5: Tenant Departures Due to Low Evaluation
**System:** `EvaluationSystem.ts` line 200-250

**Steps:**
1. Continue from Test 4 (office with RED evaluation)
2. Fast-forward to **Day 90** (end of quarter)
3. **Check console logs** for: "Office tenant left due to poor conditions"
4. **Expected:** ~50% chance tenant leaves each quarter if eval < 40%
5. **If tenant left:** Building tooltip shows "Income: $0" (no tenant)

**Pass Criteria:**
- ✅ Low evaluation causes tenant departures
- ✅ Console logs explain why tenant left
- ✅ Income drops to $0 when tenant leaves

---

## 👥 PHASE 3: POPULATION AI & SCHEDULING (8 minutes)

### Test 6: Morning Rush Hour
**System:** `RushHourSystem.ts`, `PopulationAI.ts`

**Steps:**
1. Start new game
2. Build **3 Office (Small)** on floors 3, 5, 7
3. Build **1 Standard Elevator** connecting floor 1-10
4. Fast-forward to **Day 0, 7:30 AM**
5. **Watch carefully:**
   - Console log: "🌅 MORNING RUSH - Workers arriving"
   - **3-5 workers spawn at LOBBY** (ground floor, center tile)
   - Workers walk to elevator
   - Workers board elevator (doors open/close)
   - Elevator moves UP to their assigned office
   - Workers enter office and start working

**Pass Criteria:**
- ✅ Morning rush triggers at 7:30 AM (weekdays only)
- ✅ Workers spawn at LOBBY, not randomly
- ✅ Workers use pathfinding to reach elevator
- ✅ Elevator ding sound plays when doors open
- ✅ Workers successfully reach their offices

### Test 7: Lunch Rush & Food Buildings
**System:** `PopulationAI.ts` line 180-250

**Steps:**
1. Continue from Test 6 (workers should be in offices)
2. Build **1 FastFood** building on **ground floor** (near lobby)
3. Fast-forward to **Day 0, 12:00 PM** (noon)
4. **Expected:**
   - Console log: "🍔 LUNCH RUSH"
   - Workers leave offices
   - Workers pathfind to FastFood building
   - Workers enter FastFood, eat, **stress decreases**
   - Workers return to offices after eating

**Pass Criteria:**
- ✅ Lunch rush triggers at 12 PM
- ✅ Workers seek food buildings
- ✅ Eating reduces stress (check Person tooltip stress level)
- ✅ Workers return to offices after lunch

### Test 8: Evening Rush & Departure
**System:** `RushHourSystem.ts`, `PopulationAI.ts`

**Steps:**
1. Continue from Test 7 (workers back in offices)
2. Fast-forward to **Day 0, 5:00 PM**
3. **Expected:**
   - Console log: "🌆 EVENING RUSH - Workers leaving"
   - Workers leave offices
   - Workers pathfind to lobby
   - Workers despawn (go home for the day)
   - Population count decreases

**Pass Criteria:**
- ✅ Evening rush triggers at 5 PM
- ✅ Workers leave buildings and return to lobby
- ✅ Workers despawn correctly (no stuck entities)

### Test 9: Weekend vs Weekday Behavior
**System:** `RushHourSystem.ts` modulo-based week cycling

**Steps:**
1. Fast-forward to **Day 5** (Saturday)
2. **Check HUD time display:** Should show "Saturday 8:00 AM 🌴 WEEKEND"
3. Wait for 7:30 AM
4. **Expected:** NO morning rush (weekends have no worker arrivals)
5. Fast-forward to **Day 7** (Monday)
6. **Check HUD:** "Monday 8:00 AM" (no weekend emoji)
7. Wait for 7:30 AM
8. **Expected:** Morning rush resumes (workers spawn)

**Pass Criteria:**
- ✅ HUD shows day name and weekend indicator
- ✅ No morning rush on Saturday/Sunday
- ✅ Rush hours resume on Monday

### Test 10: Resident Daily Commutes (v0.12.0 Feature)
**System:** `ResidentSystem.ts`

**Steps:**
1. Unlock **2★** (reach 100 population, >60% avg evaluation)
2. Build **1 Condo** building
3. Wait for a resident to move in (console log: "Resident moved into condo")
4. Fast-forward to **8:00 AM (weekday)**
5. **Expected:**
   - Resident LEAVES condo
   - Resident goes to lobby/elevator
   - Resident DESPAWNS (goes to work outside tower)
6. Fast-forward to **6:00 PM (weekday)**
7. **Expected:**
   - Resident RESPAWNS at lobby
   - Resident takes elevator back to condo
   - Resident enters condo (now home for evening)
8. Fast-forward to **Saturday 11:00 AM**
9. **Expected:**
   - Resident STAYS in tower (weekend)
   - Resident visits Shop or Restaurant (leisure activity)

**Pass Criteria:**
- ✅ Residents leave for work at 8 AM (weekdays)
- ✅ Residents return home at 6 PM (weekdays)
- ✅ Residents do leisure activities on weekends
- ✅ Slow elevators frustrate commuting residents (stress increases)

---

## ⭐ PHASE 4: STAR RATING PROGRESSION (3 minutes)

### Test 11: Unlock 2★ Rating
**System:** `StarRatingSystem.ts`

**Steps:**
1. Build population to **100+ people**
2. Ensure average evaluation **>60%** (good elevator coverage)
3. Wait for **quarterly evaluation** (every 90 days)
4. **Expected:**
   - Notification: "⭐ REACHED 2 STARS!"
   - **Fanfare sound** plays
   - Building menu updates: Hotel, Condo, Shop now UNLOCKED
   - Star icon in HUD changes from 1★ → 2★

**Pass Criteria:**
- ✅ 2★ unlocks at 100 pop + 60% eval
- ✅ Visual notification appears
- ✅ Fanfare sound plays
- ✅ New buildings unlock in menu

### Test 12: Unlock 3★ Rating
**System:** `StarRatingSystem.ts`

**Steps:**
1. Build population to **500+ people**
2. Ensure average evaluation **>70%**
3. Build **1 Security Office**
4. Wait for quarterly evaluation
5. **Expected:**
   - Notification: "🎉 REACHED 3 STARS!"
   - Party Hall, Cathedral, Metro unlocked
   - Tower prestige increases

**Pass Criteria:**
- ✅ 3★ unlocks at 500 pop + 70% eval + Security Office
- ✅ High-tier buildings unlock

---

## 🎨 PHASE 5: VISUAL & AUDIO POLISH (2 minutes)

### Test 13: Day/Night Cycle
**System:** `TimeOfDaySystem.ts`, `TowerRenderer.ts`

**Steps:**
1. Fast-forward through 24 hours (use Speed 4)
2. **Watch sky gradient change:**
   - **6:00-8:00 AM (Dawn):** Blue → Orange/Pink
   - **8:00-12:00 PM (Morning):** Bright sky blue
   - **12:00-5:00 PM (Afternoon):** Sky blue
   - **5:00-7:00 PM (Dusk):** Blue → Orange/Purple
   - **7:00 PM-6:00 AM (Night):** Deep blue/black
3. **Watch building lights:**
   - **6:00 PM:** Building windows turn **YELLOW** (lights on)
   - **7:00 AM:** Lights turn off

**Pass Criteria:**
- ✅ Sky color smoothly transitions throughout day
- ✅ Building lights turn on at 6 PM
- ✅ Building lights turn off at 7 AM

### Test 14: Sound Effects
**System:** `SoundManager.ts`

**Steps:**
1. **Enable sound** (check bottom-bar 🎵 button is active)
2. Trigger each sound:
   - **Place building** → Construction sound (thud)
   - **Demolish building** (D key + click) → Demolish sound (crumble)
   - **Collect rent** (end of quarter) → Cash register ("ka-ching")
   - **Elevator arrives** → Ding sound (two-tone bell)
   - **Reach 2★** → Fanfare (victory)
   - **Go into debt** → Warning sound (escalates with severity)
   - **Trigger bankruptcy** → Alarm sound

**Pass Criteria:**
- ✅ All sounds play at correct moments
- ✅ Sounds respect mute/volume settings
- ✅ No audio distortion or overlap issues

### Test 15: Background Music
**System:** `MusicPlayer.ts`

**Steps:**
1. Click **🎵 button** in bottom-right bar
2. **Expected:** Elevator jazz music loop starts
3. Click again → Music stops, button shows **🔇**
4. **Test volume control** (if implemented)

**Pass Criteria:**
- ✅ Music toggles on/off with button
- ✅ Music loops seamlessly
- ✅ Volume control works

---

## 🏗️ PHASE 6: ADVANCED FEATURES (Optional)

### Test 16: Hotel System
**System:** `HotelSystem.ts`

**Steps:**
1. Unlock 2★, build **Hotel Single**
2. Fast-forward to **6:00 PM** (evening check-in time)
3. **Check console:** "Guest checked into hotel"
4. Fast-forward 1-3 days
5. **Check console:** "Guest checked out, paid $X"
6. **Verify:** Funds increased by room rate

**Pass Criteria:**
- ✅ Guests check in during evening
- ✅ Guests check out and pay
- ✅ Hotel income tracked in Financial Report

### Test 17: Random Events
**System:** `EventSystem.ts`, `RandomEventSystem.ts`

**Steps:**
1. Play for **10+ game quarters** (fast-forward)
2. **Watch for random events:**
   - 🎅 Santa Event (December only)
   - 🔥 Fire in building
   - 💣 Bomb threat
   - 💰 Treasure found (+$50K)
   - 🪳 Cockroach infestation
   - 🌟 VIP guest
3. **Expected:** Notification appears for each event
4. **Verify:** Event affects game (fire damages, treasure adds funds)

**Pass Criteria:**
- ✅ Random events trigger periodically
- ✅ Notifications explain event
- ✅ Events have gameplay consequences

---

## 🔬 TECHNICAL VERIFICATION

### Test 18: Save/Load System
**System:** `SaveLoadManager.ts`

**Steps:**
1. Build a tower with 5+ buildings
2. Press **Ctrl+S** or click 💾 Save button
3. **Refresh browser page** (Ctrl+R)
4. **Expected:** Game auto-loads last save
5. **Verify:**
   - All buildings preserved
   - Funds correct
   - Population restored
   - Game time correct
   - Star rating preserved
   - **Game speed preserved** (BUG-020 fix)

**Pass Criteria:**
- ✅ Save serializes all game state
- ✅ Auto-load on page refresh
- ✅ No data loss

### Test 19: Performance Benchmark
**System:** `PerformanceBenchmark.ts`

**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Run: `window.runPerformanceBenchmark()`
4. **Wait 2 minutes** (automated 4-phase stress test)
5. **Check results:**
   - Phase 1 (100 people): FPS should be **60**
   - Phase 2 (500 people): FPS should be **50+**
   - Phase 3 (1000 people): FPS should be **30+**
   - Phase 4 (2000 people): FPS varies (stress test)

**Pass Criteria:**
- ✅ Sustained 30+ FPS at 1000 people
- ❌ **FAIL if FPS < 30** at 1000 people → Needs optimization

### Test 20: System Verification Script
**System:** Multiple

**Steps:**
1. Open browser DevTools Console
2. Run: `window.verifyGameSystems()`
3. **Expected output:**
   ```
   ✅ TimeSystem: Running
   ✅ PopulationSystem: X people active
   ✅ ElevatorSystem: X shafts, X cars
   ✅ EconomicSystem: Funds tracking
   ✅ EvaluationSystem: X buildings rated
   ✅ OperatingCostSystem: Daily costs active
   ✅ RushHourSystem: Schedule configured
   ✅ ResidentSystem: X residents active
   ✅ HotelSystem: X hotels, X guests
   ⚠️ ALL SYSTEMS OPERATIONAL
   ```

**Pass Criteria:**
- ✅ All systems report healthy status
- ✅ No critical errors in console

---

## 📊 FINAL EVALUATION

### Checklist Summary
After completing all 20 tests, mark each:

**Phase 1: Economic Pressure**
- [ ] Test 1: Operating Costs & Cash Flow
- [ ] Test 2: Bankruptcy Mechanics
- [ ] Test 3: Tenant Rent Collection

**Phase 2: Evaluation System**
- [ ] Test 4: Building Evaluation Display
- [ ] Test 5: Tenant Departures

**Phase 3: Population AI**
- [ ] Test 6: Morning Rush Hour
- [ ] Test 7: Lunch Rush
- [ ] Test 8: Evening Rush
- [ ] Test 9: Weekend vs Weekday
- [ ] Test 10: Resident Commutes

**Phase 4: Star Rating**
- [ ] Test 11: Unlock 2★
- [ ] Test 12: Unlock 3★

**Phase 5: Polish**
- [ ] Test 13: Day/Night Cycle
- [ ] Test 14: Sound Effects
- [ ] Test 15: Background Music

**Phase 6: Advanced**
- [ ] Test 16: Hotel System
- [ ] Test 17: Random Events

**Technical**
- [ ] Test 18: Save/Load
- [ ] Test 19: Performance Benchmark
- [ ] Test 20: System Verification

---

## 🐛 BUG REPORTING

**If you find issues, document them:**

### Bug Template
```
### BUG-XXX: [Title]
- **Severity:** Critical | High | Medium | Low
- **Found:** 2026-02-03, Human Playtest
- **Repro:**
  1. Step 1
  2. Step 2
  3. Expected vs Actual
- **Notes:** Any additional context
```

**Report bugs in:** `/home/ubuntu/clawd/projects/opentower/.planning/PLAYTEST-RESULTS.md`

---

## ✅ SUCCESS METRICS (from REAL-GAME-PLAN.md)

### Does this feel like SimTower?
- [ ] Economic pressure feels real (risk of bankruptcy)
- [ ] Elevator placement is strategic (bad placement = failures)
- [ ] Rush hours create visible traffic patterns
- [ ] Star progression feels earned
- [ ] Day/night cycle adds atmosphere
- [ ] Sound effects provide feedback
- [ ] Playing for 30+ minutes feels engaging

### Would you play this for DAYS?
**Rate 1-10:** ___

**What would make it better?**
- 
- 
- 

---

## 🚀 AFTER PLAYTEST

1. **Create:** `PLAYTEST-RESULTS.md` with findings
2. **Update:** `PROGRESS-LOG.md` with test date + results
3. **Prioritize:** Critical bugs first, then high/medium
4. **Decide:** Ready for external testing? Or needs fixes first?

---

**YOU ARE THE FIRST HUMAN TO TEST THIS GAME. YOUR FEEDBACK WILL SHAPE v1.0!**
