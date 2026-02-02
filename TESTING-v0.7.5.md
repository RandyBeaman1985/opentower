# Testing Guide: v0.7.5 - Elevator Demolish

## Feature: Elevator Demolish Mode

### Test Case 1: Basic Elevator Demolish
**Goal:** Verify elevators can be removed in demolish mode

1. Open http://100.85.24.1:5173/
2. Place an office on floor 2
3. Select "Standard Elevator" from building menu
4. Drag from floor 0 to floor 5 at tile 10
5. Release to place elevator
6. Note your funds (should be reduced by elevator cost)
7. Press `D` key to enter demolish mode
8. Hover over the elevator shaft
9. **Expected:** Red overlay with X pattern appears
10. Click on the elevator
11. **Expected:** 
    - Elevator disappears
    - Demolish sound plays
    - Funds increase by 50% of original cost
    - Console logs demolish message

### Test Case 2: Multi-Floor Detection
**Goal:** Verify clicking any part of the shaft demolishes the whole thing

1. Place an elevator from floor -2 to floor 10 (12 floors total)
2. Enter demolish mode
3. Click on floor 5 (middle of shaft)
4. **Expected:** Entire shaft removed (all 12 floors)

### Test Case 3: Demolish Mode Toggle
**Goal:** Verify demolish mode affects both buildings and elevators

1. Place an elevator and an office
2. Enter demolish mode
3. Hover over office - should show red X
4. Hover over elevator - should show red X
5. Exit demolish mode (press `D` again)
6. Hover over office - should show normal ghost
7. Hover over elevator - should show nothing

### Test Case 4: Refund Calculation
**Goal:** Verify correct refund amounts

**Elevator Costs:**
- Base: $200,000
- Per extra floor: $80,000
- Example: 5-floor elevator = $200K + (4 × $80K) = $520,000
- Refund: 50% = $260,000

**Test:**
1. Note starting funds: $_______________
2. Place 5-floor elevator (cost: $520K)
3. After placement funds: $_______________
4. Demolish elevator
5. After demolish funds: $_______________
6. **Expected:** Gained $260K back (50% of $520K)

### Test Case 5: Visual Feedback
**Goal:** Verify red highlight appearance

1. Enter demolish mode
2. Slowly move mouse over elevator shaft
3. **Expected:**
   - Red rectangle appears instantly on hover
   - Red X pattern drawn diagonally
   - Border is bold red
   - Highlight follows mouse to different floors of same shaft

### Test Case 6: Console Logging
**Goal:** Verify debug logging

1. Open browser console (F12)
2. Place an 8-floor elevator
3. Demolish it
4. **Expected console output:**
   ```
   Demolished elevator shaft at tile X (8 floors) - Refunded $760,000
   ```

### Test Case 7: Sound Playback
**Goal:** Verify demolish sound plays

1. Ensure sound is enabled (not muted)
2. Demolish an elevator
3. **Expected:** Crumbling/demolish sound effect plays

---

## Known Limitations (Not Bugs)

1. **No undo** - Once demolished, elevator is gone (like buildings)
2. **No confirmation dialog** - Instant demolish on click (matches building behavior)
3. **Hover detection per floor** - Must click on a floor the shaft serves (not empty space)

---

## Quick Smoke Test

**Goal:** 5-minute verification that feature works

1. `npm run dev` in /home/ubuntu/clawd/projects/opentower
2. Open http://100.85.24.1:5173/
3. Place elevator
4. Press `D`
5. Click elevator
6. If elevator disappears and funds increase → ✅ PASS

---

## Regression Tests

**Verify existing features still work:**

- [ ] Building demolish still works
- [ ] Elevator placement still works
- [ ] Demolish mode visual (🗑️ button) still works
- [ ] Keyboard shortcut `D` still works
- [ ] Other building types still work

---

*Created: 2026-02-02 3:40 AM MST*
*Version: v0.7.5*
