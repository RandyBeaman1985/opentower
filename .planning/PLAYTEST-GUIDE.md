# OpenTower Playtest Guide
**Created:** 2026-02-03, 12:16 AM MST  
**Version:** v0.15.1  
**Build:** ✅ Clean (739 modules, 550.18 kB, 0 TypeScript errors)  
**Dev Server:** ✅ Running on http://localhost:5173/

---

## 🎯 Mission: Verify OpenTower is a REAL GAME

**Goal:** Play for 30 minutes and verify all Phase 1-3 systems work as designed.

**Success Criteria:**
- ✅ All core systems functional (economy, AI, progression)
- ✅ Gameplay feels like SimTower (economic tension, strategic placement)
- ✅ No game-breaking bugs
- ✅ Session length >20 minutes (fun factor)

---

## 🚀 Quick Start (5 Minutes)

**URL:** http://localhost:5173/ (or http://100.85.24.1:5173/ from Mac)

### Core Loop Test:
1. **Game loads?** → Tower with lobby visible ✅
2. **Place office** → Building Menu → Office → Click to place ✅
3. **Add elevator** → Elevator button → Drag vertically ✅
4. **Fast-forward** → Press number keys 1-4 (or ⏩ buttons) ✅
5. **Workers appear?** → Wait for 7:30 AM, workers spawn at lobby ✅

**If all 5 work → Core game functional! Continue full test.**

---

## ✅ Systematic Testing (20 Tests)

### Phase 1: Economic Pressure (3 tests)

#### Test 1: Operating Costs & Financial Report
**System:** `OperatingCostSystem.ts`, `EconomySystem.ts`, `FinancialReportModal.ts`

**Steps:**
1. Start game (initial funds: $100,000)
2. Build 3 offices + 2 elevator shafts (~$50,000)
3. Press **F key** → Financial Report Modal opens
4. Check breakdown:
   - Income: Office rent (quarterly)
   - Expenses: Elevator operating costs ($50/car/day)
5. Fast-forward to next quarter (speed 4)

**Expected:**
- ✅ Daily expenses deducted (elevator costs)
- ✅ Financial report shows accurate income/expense
- ✅ Strategic tips section appears
- ✅ Bar charts display percentages correctly

---

#### Test 2: Bankruptcy Mechanics
**System:** `OperatingCostSystem.ts`

**Steps:**
1. Keep spending without income (build lots of elevators)
2. Go below -$500,000 in funds
3. Stay in debt for 7 game days

**Expected:**
- ✅ TowerPulse shows negative funds in RED
- ✅ Console: "⚠️ BANKRUPTCY WARNING" messages
- ✅ After 7 days: "GAME OVER - Bankruptcy" modal
- ✅ Modal shows final stats (days survived, population)

---

#### Test 3: Quarterly Rent Collection
**System:** `EconomicSystem.ts`

**Steps:**
1. Place 3 offices with elevators
2. Wait for workers to occupy offices
3. Fast-forward to end of quarter (90 game days)

**Expected:**
- ✅ Console: "💰 RENT COLLECTED" message
- ✅ Funds increase by $1,500-$10,000 per office
- ✅ TowerPulse shows cash flow summary

---

### Phase 2: Evaluation System (2 tests)

#### Test 4: Building Evaluation Display
**System:** `EvaluationSystem.ts`

**Steps:**
1. Place office on floor 10
2. DON'T add elevator (force poor evaluation)
3. Workers spawn but can't reach office
4. Wait 1 game minute (60 ticks)
5. Hover over building

**Expected:**
- ✅ Tooltip shows evaluation score (0-100%)
- ✅ Building border color:
  - Blue: 70-100% (Excellent)
  - Yellow: 40-69% (Fair)
  - Red: 0-39% (Poor)
- ✅ Evaluation updates every game-minute

---

#### Test 5: Tenant Departures
**System:** `EvaluationSystem.ts`, `EconomicSystem.ts`

**Steps:**
1. Create office with terrible conditions (no elevator, far from services)
2. Wait until first quarterly review
3. Check if evaluation is RED (<40%)

**Expected:**
- ✅ 50% chance tenant leaves each quarter (if eval <40%)
- ✅ Console: "Office tenant left due to poor conditions"
- ✅ Building income drops to $0
- ✅ Building marked as vacant

---

### Phase 3: Population AI & Scheduling (5 tests)

#### Test 6: Morning Rush (7:30 AM Weekdays)
**System:** `RushHourSystem.ts`, `PopulationSystem.ts`

**Steps:**
1. Place 3 offices on floors 2-4
2. Add elevator connecting them
3. Fast-forward to **7:30 AM** (weekday)

**Expected:**
- ✅ Console: "🌅 MORNING RUSH: X workers arriving"
- ✅ Workers spawn at LOBBY (ground floor, center)
- ✅ Workers pathfind to elevators
- ✅ Workers board elevators and ride UP
- ✅ Workers arrive at offices and start working
- ✅ Elevator call buttons appear

---

#### Test 7: Lunch Rush (12:00 PM Weekdays)
**System:** `PopulationAI.ts`

**Steps:**
1. Place FastFood building on ground floor
2. Fast-forward to **12:00 PM** (noon, weekday)

**Expected:**
- ✅ Console: "🍔 LUNCH RUSH STARTING"
- ✅ Workers leave offices
- ✅ Workers pathfind to FastFood building
- ✅ Workers eat lunch (stress decreases)
- ✅ $5 per customer income (check financial report)
- ✅ Workers return to offices at 1:00 PM

**Test Without Food:**
- Remove FastFood building
- Watch lunch rush
- **Expected:** Workers get frustrated (+10 stress), complain in console

---

#### Test 8: Evening Rush (5:00 PM Weekdays)
**System:** `RushHourSystem.ts`, `PopulationSystem.ts`

**Steps:**
1. Fast-forward to **5:00 PM** (weekday)

**Expected:**
- ✅ Console: "🌆 EVENING RUSH: X workers leaving"
- ✅ Workers leave offices
- ✅ Workers pathfind to lobby
- ✅ Workers board elevators DOWN
- ✅ Workers despawn at lobby (go home)

---

#### Test 9: Weekend Behavior
**System:** `RushHourSystem.ts`, `ResidentSystem.ts`

**Steps:**
1. Fast-forward to **Saturday** (gameDay % 7 === 5)
2. Check HUD: Should show "Saturday XX:XX AM 🌴 WEEKEND"
3. Verify no morning/lunch/evening rush

**Expected:**
- ✅ No workers spawning on weekends
- ✅ Console: "🌴 WEEKEND - No morning rush"
- ✅ Weekend indicator visible in HUD
- ✅ Residents active (leisure activities)

---

#### Test 10: Resident Commutes (v0.12.0)
**System:** `ResidentSystem.ts`

**Steps:**
1. Place 2 Condo buildings on floors 5-7
2. Sell condos (wait for residents to move in)
3. Fast-forward to **8:00 AM Monday**

**Expected:**
- ✅ Console: "🌅 MORNING COMMUTE: X residents leaving for work"
- ✅ Residents pathfind from condos to lobby
- ✅ Residents despawn (go to work in city)
- ✅ Fast-forward to **6:00 PM**
- ✅ Console: "🌆 EVENING COMMUTE: X residents returning home"
- ✅ Residents spawn at lobby, return to condos

**Weekend Leisure:**
- Fast-forward to **Saturday 10:00 AM**
- **Expected:**
  - ✅ Console: "🌴 WEEKEND ACTIVITY: X residents out for leisure"
  - ✅ 30% of residents visit shops/restaurants
  - ✅ Residents return after 2-3 hours

---

### Phase 4: Star Rating Progression (2 tests)

#### Test 11: Unlock 2★ (Second Star)
**System:** `StarRatingSystem.ts`

**Steps:**
1. Build tower to 100 population
2. Maintain average evaluation >60%
3. Wait for quarterly star rating check

**Expected:**
- ✅ Console: "⭐ STAR RATING INCREASED: 2★"
- ✅ Notification appears with fanfare sound
- ✅ Building menu unlocks: Hotels, Condos, Shops, Express Elevators
- ✅ HUD shows "2★ Tower" indicator

---

#### Test 12: Unlock 3★ (Third Star)
**System:** `StarRatingSystem.ts`

**Steps:**
1. Build tower to 500 population
2. Maintain average evaluation >70%
3. Build at least 1 Security Office
4. Wait for quarterly check

**Expected:**
- ✅ Console: "⭐ STAR RATING INCREASED: 3★"
- ✅ Notification with fanfare
- ✅ Building menu unlocks: Restaurants, Party Halls, VIP events
- ✅ HUD shows "3★ Tower"

---

### Phase 5: Polish (3 tests)

#### Test 13: Day/Night Cycle
**System:** `TimeOfDaySystem.ts`, `TowerRenderer.ts`

**Steps:**
1. Start at 8:00 AM (daytime)
2. Fast-forward through the day
3. Watch sky and building lighting

**Expected Time Periods:**
- ✅ Dawn (5-7 AM): Orange sky
- ✅ Day (7 AM-5 PM): Blue sky
- ✅ Dusk (5-7 PM): Orange/red sky
- ✅ Evening (7-10 PM): Dark blue
- ✅ Night (10 PM-5 AM): Black sky
- ✅ Building lights turn ON at 6 PM
- ✅ Lights turn OFF at 7 AM

---

#### Test 14: Sound Effects
**System:** `SoundManager.ts`, `NotificationSystem.ts`

**Test Each Sound:**
1. Place building → **DING** sound ✅
2. Demolish building → **CRASH** sound ✅
3. Elevator arrives at floor → **DING** sound ✅
4. Quarter ends (rent collected) → **CASH REGISTER** ✅
5. Go into debt → **WARNING** beep ✅
6. Bankruptcy warning → **ALERT** klaxon ✅
7. Star rating increases → **FANFARE** ✅

**Mute Test:**
- Click 🔇 button → All sounds stop ✅
- Click 🔊 button → Sounds resume ✅

---

#### Test 15: Background Music
**System:** `MusicPlayer.ts`

**Steps:**
1. Check for 🎵 button (bottom bar, left side)
2. Click to toggle music on/off
3. Verify elevator jazz loop plays

**Expected:**
- ✅ Music starts automatically (or on first interaction)
- ✅ Button shows 🎵 (playing) or 🎵̸ (muted)
- ✅ Music loops seamlessly
- ✅ Volume control works (if implemented)

---

### Phase 6: Advanced Systems (2 tests)

#### Test 16: Hotel System
**System:** `HotelSystem.ts`

**Steps:**
1. Unlock 2★ (100 population)
2. Build Hotel (Single/Twin/Suite)
3. Wait for guests to check in

**Expected:**
- ✅ Guests spawn at lobby
- ✅ Guests pathfind to hotel room
- ✅ Guests check in (occupy room)
- ✅ Daily income: $500-$9,000/night (varies by room type)
- ✅ Guests check out after 1-3 nights
- ✅ Hotel evaluation affects occupancy rate

---

#### Test 17: Random Events
**System:** `EventSystem.ts`, `RandomEventSystem.ts`

**Steps:**
1. Play for 10+ game days
2. Watch for random events

**Possible Events:**
- ✅ VIP Guest (hotel suite, rates stay)
- ✅ Fire (temporary facility damage)
- ✅ Treasure (bonus cash)
- ✅ Santa (Christmas Day bonus)
- ✅ Cockroaches (low-eval restaurant)
- ✅ Power Outage (elevators stop briefly)

**Expected:**
- Events trigger randomly
- Notifications appear with sound
- Events have gameplay consequences

---

### Technical Verification (3 tests)

#### Test 18: Save/Load Persistence
**System:** `SaveLoadSystem.ts`

**Steps:**
1. Build a small tower (3 floors, 2 buildings, 1 elevator)
2. Note current funds and population
3. Click "💾 Save" button
4. Refresh browser
5. Click "📂 Load" button

**Expected:**
- ✅ Save modal appears with timestamp
- ✅ Load modal shows saved games list
- ✅ Tower state restored EXACTLY:
  - Same funds
  - Same buildings (positions, types)
  - Same elevators (shafts, cars)
  - Same population
- ✅ Time continues from saved point

---

#### Test 19: Performance Benchmark
**System:** Performance test framework (v0.7.9+)

**Steps:**
1. Open browser console (F12)
2. Run: `window.runPerformanceBenchmark()`
3. Wait 5-10 minutes (automated test)

**Expected Output:**
```
🚀 PERFORMANCE BENCHMARK START
Phase 1: 100 people (target: 60 FPS)
  Average FPS: 60.0
  Frame drops: 0
Phase 2: 500 people (target: 45 FPS)
  Average FPS: 52.3
  Frame drops: 2
Phase 3: 1000 people (target: 30 FPS)
  Average FPS: 38.7
  Frame drops: 15
Phase 4: 2000 people (stress test)
  Average FPS: 22.1
  Frame drops: 120
✅ BENCHMARK COMPLETE
```

**Acceptable Performance:**
- ✅ 100 people: >55 FPS (smooth)
- ✅ 500 people: >40 FPS (playable)
- ✅ 1000 people: >25 FPS (acceptable)
- ⚠️ 2000 people: May drop below 20 FPS (stress test)

---

#### Test 20: System Verification
**System:** Automated health checks

**Steps:**
1. Open browser console
2. Run: `window.verifyGameSystems()`

**Expected Output:**
```
🔍 VERIFYING GAME SYSTEMS...

✅ Tower Manager
✅ Economic System (funds: $98,450)
✅ Evaluation System (3 buildings evaluated)
✅ Population System (24 people, 3 workers)
✅ Star Rating (current: 1★)
✅ Time System (Day 5, 14:32 PM)
✅ Elevator System (2 shafts, 4 cars)
✅ Hotel System (1 hotel, 2 guests)
✅ Resident System (3 residents)
✅ Event System (0 active events)
✅ Pathfinding System
✅ Sound System (7 sounds loaded)

✅ ALL SYSTEMS OPERATIONAL
```

**If Any System FAILS:**
- Document error message
- Note what action triggered failure
- Include console errors

---

## 📊 Success Metrics

**Does OpenTower Feel Like SimTower?**

### Economic Tension ✅
- [ ] Money matters (not infinite funds)
- [ ] Building too fast = bankruptcy risk
- [ ] Strategic placement required
- [ ] Quarterly reviews feel meaningful

### Visual Rush Hours ✅
- [ ] Morning rush (workers flood in)
- [ ] Lunch rush (stampede to fast food)
- [ ] Evening rush (mass exodus)
- [ ] Elevators visibly jam during peaks

### Strategic Depth ✅
- [ ] Elevator placement matters
- [ ] Service buildings affect happiness
- [ ] Star progression feels earned
- [ ] Mixed-use towers outperform single-use

### Fun Factor ✅
- [ ] Session length >20 minutes
- [ ] Want to keep playing
- [ ] "Just one more building" feeling
- [ ] Satisfying to optimize

---

## 🐛 Bug Reporting Template

**If You Find a Bug:**

```markdown
### BUG-XXX: [Short Description]
**Severity:** CRITICAL / HIGH / MEDIUM / LOW
**Found:** 2026-02-XX, XX:XX AM/PM MST

**Steps to Reproduce:**
1. Action 1
2. Action 2
3. Action 3

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happened

**Console Errors:**
(Paste any error messages)

**Impact:**
How does this break gameplay?

**Workaround:**
(If any temporary fix exists)
```

---

## 📝 Playtest Report Template

**After 30-Minute Session:**

```markdown
# OpenTower Playtest Results
**Date:** 2026-02-XX
**Duration:** XX minutes
**Build:** v0.15.1

## Systems Tested
- [ ] Economic Pressure (Tests 1-3)
- [ ] Evaluation System (Tests 4-5)
- [ ] Population AI (Tests 6-10)
- [ ] Star Rating (Tests 11-12)
- [ ] Polish (Tests 13-15)
- [ ] Advanced (Tests 16-17)
- [ ] Technical (Tests 18-20)

## Bugs Found
1. BUG-XXX: [Description] - Severity: XXX
2. BUG-XXX: [Description] - Severity: XXX

## Success Metrics
- Economic tension: ✅/❌
- Visual rush hours: ✅/❌
- Strategic depth: ✅/❌
- Fun factor (>20 min): ✅/❌

## Overall Assessment
Does it feel like SimTower? YES / NO / CLOSE

## Feedback
- What worked well:
- What needs improvement:
- Most broken system:
- Most fun moment:

## Next Steps
1. [Priority fix]
2. [Priority fix]
3. [Balance tuning]
```

---

## 🎮 Quick Reference

**Keyboard Shortcuts:**
- `1` - Normal speed (1x)
- `2` - Fast (2x)
- `3` - Faster (4x)
- `4` - Fastest (8x)
- `F` - Financial Report Modal
- `ESC` - Close modals

**Console Commands:**
- `window.game` - Access game instance
- `window.verifyGameSystems()` - Health check
- `window.runPerformanceBenchmark()` - Stress test
- `window.game.getTowerManager().getTower()` - Inspect tower state

**Dev Server:**
- Local: http://localhost:5173/
- Tailscale: http://100.85.24.1:5173/

---

## ✅ Completion Checklist

**Before Reporting Results:**
- [ ] Completed Quick Start (5 min)
- [ ] Completed 20 systematic tests
- [ ] Ran performance benchmark
- [ ] Ran system verification
- [ ] Documented any bugs found
- [ ] Filled out playtest report
- [ ] Session length >20 minutes
- [ ] Answered: "Does it feel like SimTower?"

**Where to Report:**
- Create: `.planning/PLAYTEST-RESULTS-2026-02-XX.md`
- Use template above
- Include screenshots if bugs found
- Tag bugs with severity

---

**READY? START PLAYING! 🎮**

**Remember:** This isn't just bug hunting. Play it like a real game. Have fun. Break things. See if it captures the magic of SimTower 1995.

**Your mission:** Make towers. Feel tension. Watch rush hours. Go bankrupt. Unlock stars. And answer the ultimate question:

**"Is this a REAL GAME?"** 🏢✨
