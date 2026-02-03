# OpenTower Human Playtest Guide
**Date:** 2026-02-02, 6:00 PM MST  
**Build:** v0.13.1  
**Status:** ⚡ **GAME IS RUNNING - READY FOR HUMAN TESTING**  
**Server:** http://localhost:5173/

---

## 🎯 MISSION: VERIFY ALL SYSTEMS WORK IN REAL GAMEPLAY

**Goal:** Play for 30 minutes and verify that all Phase 1-3 systems work as coded.  
**Why Critical:** Zero human verification - all systems exist in code but untested in browser.

---

## 🚀 Quick Start

### 1. Open the Game (2 minutes)
```bash
# Server is already running!
# Open browser: http://localhost:5173/
```

**Expected:** Game loads, title screen appears, "New Game" button works

---

### 2. First 5 Minutes - Basic Mechanics

**Build Your First Tower:**
1. Click "New Game"
2. Build 1 office (should cost ~$50K)
3. Build 1 elevator shaft (lobby → floor 5)
4. Build 1 stairs (for backup)
5. Build 1 fast food (for lunch rush)

**What to Verify:**
- [ ] Buildings place correctly
- [ ] Funds deduct properly
- [ ] People spawn at lobby
- [ ] Elevators work (people queue, cars move)
- [ ] Tooltips show on hover
- [ ] Time advances (clock in HUD)

**Expected Behavior:**
- Starting funds: $2,000,000
- Office costs $50,000 (deducts immediately)
- Workers spawn around 7:30 AM
- Elevators pick up passengers and deliver them

---

### 3. Minutes 5-15 - Economic Pressure System

**Test Operating Costs & Bankruptcy:**
1. Build 10+ offices rapidly (burn cash)
2. Build 5+ elevator shafts (high daily costs)
3. Watch funds drop
4. Wait for daily expense deduction (happens every game-day)
5. Try to go into debt (funds < $0)

**What to Verify:**
- [ ] Daily expenses show in console (💸 Day X Expenses)
- [ ] Elevator costs: ~$50 per car per day
- [ ] Building maintenance: ~$25 per office per day
- [ ] Debt warnings appear when funds < -$100K
- [ ] Bankruptcy countdown starts at -$500K for 7 days
- [ ] Tower Pulse shows cash flow indicator

**Expected Warnings:**
- "SERIOUS DEBT - Improve cash flow immediately!"
- "BANKRUPTCY WARNING - X days until bankruptcy!"
- "BANKRUPTCY - Tower has declared bankruptcy. Game Over."

**Test in Console:**
```javascript
// Check operating cost state
window.game.operatingCostSystem.getBankruptcyState(window.game.tower)

// Force bankruptcy for testing
window.game.tower.funds = -600000
```

---

### 4. Minutes 15-25 - Evaluation & Scheduling

**Test Building Satisfaction:**
1. Build an office on floor 20 (far from elevator)
2. Build no fast food (force stress)
3. Wait for lunch rush (12:00 PM game time)
4. Watch evaluation drop

**What to Verify:**
- [ ] Workers spawn at 7:00 AM (morning rush)
- [ ] Lunch rush at 12:00 PM (workers seek fast food)
- [ ] Evening rush at 5:00 PM (workers leave)
- [ ] Building tooltips show evaluation (Blue/Yellow/Red)
- [ ] Red buildings lose tenants quarterly
- [ ] "😤 Gave Up" counter increases when elevators jam

**Test in Console:**
```javascript
// Check evaluation system
const building = Object.values(window.game.tower.buildingsById)[0]
window.game.evaluationSystem.getEvaluation(building.id)

// Check rush hour state
window.game.rushHourSystem.getCurrentRushState()

// Verify resident system
window.game.residentSystem.getActiveCommuters()
```

---

### 5. Minutes 25-30 - Star Rating & Sound

**Test Progression System:**
1. Build to 100 population
2. Maintain >60% average evaluation
3. Wait for quarterly check
4. Check for 2★ unlock

**What to Verify:**
- [ ] Star rating updates quarterly (not every tick)
- [ ] "⭐ Tower rating increased to 2 Stars!" notification
- [ ] New buildings unlock (Hotel, Condo, Shop)
- [ ] Building menu shows locked buildings grayed out

**Test Sound System:**
1. Place a building → hear placement sound
2. Collect rent → hear cash register
3. Go into debt → hear warning sound
4. Toggle music button (🎵 in bottom bar)

**What to Verify:**
- [ ] All 9 sounds play correctly
- [ ] Background music plays and loops
- [ ] Mute button works
- [ ] No audio errors in console

---

## 🔍 Advanced Verification

### Run System Health Checks

**Open Browser Console (F12) and run:**

```javascript
// 1. Verify all systems integrated
window.verifyGameSystems()

// Expected output:
// ✅ All 15+ systems verified as integrated

// 2. Check performance
window.runPerformanceBenchmark()

// Expected: 60 FPS at 100 people, >30 FPS at 1000 people

// 3. Check for console errors
// Should see: NO red errors (warnings ok)
```

---

## 📊 What Success Looks Like

### ✅ Game is WORKING if:
1. **Economic pressure exists** - Can go bankrupt, debt warnings work
2. **Evaluations matter** - Red buildings lose tenants
3. **Rush hours happen** - Visible traffic at 7 AM, 12 PM, 5 PM
4. **Star rating progresses** - Unlocks work, quarterly checks pass
5. **Residents commute** - Condos empty during day, active weekends
6. **Sound works** - All actions have audio feedback
7. **Performance is good** - 60 FPS with <500 people
8. **No game-breaking bugs** - Can play 30+ minutes without crash

### ⚠️ Red Flags to Report:
1. **Silent failures** - Systems don't trigger (no rush hour, no expenses)
2. **Console errors** - Red errors during gameplay
3. **Performance issues** - FPS drops below 30 with <200 people
4. **Missing sounds** - Actions don't play audio
5. **UI bugs** - Tooltips broken, menus don't work
6. **Game-breaking** - Can't place buildings, elevators freeze

---

## 📝 Reporting Results

### Create Report: `.planning/PLAYTEST-RESULTS-2026-02-02.md`

**Template:**
```markdown
# Playtest Results
**Date:** 2026-02-02, 6:XX PM  
**Tester:** Davey  
**Duration:** XX minutes  
**Build:** v0.13.1

## ✅ What Worked
- [x] Item 1
- [x] Item 2

## ❌ Bugs Found
1. **BUG-XXX: Title** - Description, repro steps
2. **BUG-XXX: Title** - Description

## 🎮 Playability Score
- Economic Pressure: X/10
- Evaluation System: X/10
- Rush Hours: X/10
- Star Progression: X/10
- Sound & Music: X/10
- Overall Fun: X/10

## 💭 Subjective Feel
"Does it feel like SimTower?" - YES/NO/PARTIAL
Notes: ...

## 🎯 Priority Fixes
1. Fix X (critical)
2. Improve Y (high)
3. Polish Z (medium)
```

---

## 🚨 CRITICAL: This is the LAST MISSING PIECE

**All Phase 1-3 systems are implemented.** The code is complete.  
**What's missing:** HUMAN VERIFICATION that it actually works in the browser.

**Next steps after playtest:**
1. Fix any game-breaking bugs
2. Tune balance if needed
3. Generate sprite assets (visual upgrade)
4. External testing with 5+ testers

---

## 🎮 GOOD LUCK! Go play your game!

The moment of truth: Does 60+ hours of development actually work?

**Start here:** http://localhost:5173/

---

*Created by Luna during OpenTower intensive build session (2026-02-02, 6:00 PM MST)*
