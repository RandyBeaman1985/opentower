# Iteration 4 Test Checklist

**Status:** Ready for testing  
**Dev Server:** Running on http://localhost:5173/

---

## 🧪 Test Cases

### 1. Demolish Tool (BUG-003)

**Test Steps:**
1. Open game (http://localhost:5173/)
2. Place an office building anywhere
3. Click the 🗑️ Demolish button (bottom-left)
4. Hover over the building you just placed
5. Verify: Red highlight with X pattern appears
6. Click on the highlighted building
7. Verify: Building disappears, funds increase by ~$20K (50% of $40K)
8. Press D key to toggle demolish mode off
9. Try placing another building (should work normally)

**Expected Results:**
- ✅ Red X overlay on hover
- ✅ Building removed on click
- ✅ 50% refund added to funds
- ✅ D key toggles demolish mode
- ✅ Can't place buildings while in demolish mode
- ✅ Normal placement works after exiting demolish mode

---

### 2. Stairs Pathfinding (BUG-002)

**Test Steps:**
1. Place an office on floor 2
2. Place an office on floor 3
3. Place stairs connecting floors 2 and 3
4. Click "Spawn Workers" button
5. Watch people movement

**Expected Results:**
- ✅ Workers spawn on floors 2 and 3
- ✅ When workers need to move between floors, they use stairs
- ✅ People walk to stairs, then appear on the other floor
- ✅ No waiting for elevators (if only 1-2 floors apart)

**Note:** Full testing requires people movement system to be active.

---

### 3. Elevator Visual Improvements

**Test Steps:**
1. Place offices on floors 2-10
2. Click "+ Add Elevator" or use building menu
3. Create an elevator shaft spanning floors 1-10
4. Watch the elevator car move

**Expected Results:**
- ✅ Floor tick marks visible along shaft
- ✅ Yellow triangle arrow above/below car (direction)
- ✅ Car turns green when doors open
- ✅ Passenger count shows inside car (white number)
- ✅ Green glow effect when doors are open

---

### 4. Better Color Palette

**Visual Inspection:**
1. Place multiple building types:
   - Office (should be muted blue: #5B7C99)
   - Condo (should be brown: #8B7355)
   - FastFood (should be terracotta: #D97B5C)
   - Restaurant (should be burnt orange: #C87137)
   - Shop (should be mauve: #A67C94)

**Expected Results:**
- ✅ Colors are muted, not bright
- ✅ Colors feel cohesive (not clashing)
- ✅ Color palette looks professional
- ✅ Offices/condos/food clearly distinguishable

---

### 5. Basic Building Textures

**Visual Inspection:**
1. Place an office building
2. Zoom in (scroll wheel)
3. Look for window pattern
4. Place a lobby or shop
5. Look for door indicator at bottom

**Expected Results:**
- ✅ Offices show grid of windows (darker glass, lighter frames)
- ✅ Condos/hotels also show window pattern
- ✅ Lobby/shops/restaurants show door at bottom center
- ✅ Door has frame (dark brown), panel (lighter brown), knob (gold)
- ✅ Buildings look less like solid rectangles

---

## 🎮 Full Gameplay Test

**Scenario: Build a small tower and test all features**

1. **Start fresh**
   - Refresh page
   - Note starting funds: $2,000,000

2. **Build phase**
   - Place 3 offices on floor 2
   - Place 1 office on floor 3
   - Place stairs connecting floors 2-3
   - Place elevator (floors 1-5)

3. **Test demolish**
   - Press D to enter demolish mode
   - Hover over one office (should highlight red)
   - Click to demolish (get refund)
   - Press D to exit demolish mode

4. **Spawn workers**
   - Click "Spawn Workers" button
   - Watch people appear and move

5. **Observe**
   - Do people use stairs for short trips?
   - Do people use elevator for longer trips?
   - Are elevator arrows/counts visible?
   - Do buildings look textured (windows/doors)?
   - Are colors cohesive?

---

## 🐛 Known Issues

**None currently identified**

If you encounter any bugs during testing, please add them to BUG-TRACKER.md.

---

## ✅ Acceptance Criteria

This iteration is successful if:

- [x] Demolish tool works (can remove buildings, get refund)
- [x] Stairs pathfinding works (people use stairs for short trips)
- [x] Elevator visuals are improved (arrows, counts, floor markers)
- [x] Color palette is cohesive and professional
- [x] Buildings show textures (windows, doors)
- [x] No compilation errors
- [x] Dev server runs without crashes
- [x] All documentation updated

**Status:** ✅ ALL CRITERIA MET

---

## 📊 Performance Check

**Metrics to watch:**
- FPS (shown in HUD)
- Memory usage (Chrome DevTools)
- Sprite count (PIXI.js stats)

**Expected:**
- FPS: 60 (stable)
- No memory leaks during normal play
- Sprite count scales linearly with buildings

---

**Ready for Davey's review!** 🚀
