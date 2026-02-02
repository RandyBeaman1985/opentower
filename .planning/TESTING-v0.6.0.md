# Testing v0.6.0 - Food System

## Access
**Dev Server:** http://100.85.24.1:5173/ (via Tailscale)  
**Prod Demo:** http://100.85.24.1/files/clawd/projects/opentower/demos/v0.6.0/index.html  

## What to Test

### 🍔 Food System Verification

**Setup (2 minutes):**
1. Open dev server in browser
2. Click "Office" in building menu (should be selected by default)
3. Place office on floor 2 by clicking
4. Click "Fast Food" in menu (1★ - should be unlocked)
5. Place FastFood on floor 1
6. Click "Standard Elevator" in Transport section
7. Drag from floor 1 to floor 2 (should show height preview)
8. Release to place

**Watch for Auto-Spawn (30 seconds):**
- Workers should automatically spawn in office (6 per office)
- They'll start walking around
- Check console (F12) for "New worker immigrated" messages

**Fast-Forward to Lunch Hour:**
- Look at top bar for current time
- If before 12:00 PM, use speed controls (1x, 2x, etc.)
- Wait until time reaches **12:00 PM**

**Expected Behavior at 12:00 PM:**
1. Console should show: `🍔 ${name} is HUNGRY (XX%) - seeking food`
2. Worker(s) will change destination
3. Walk to elevator on floor 2
4. Board elevator (fade animation)
5. Ride down to floor 1
6. Exit elevator (fade animation)
7. Walk to FastFood building
8. Console: `🍔 [name] visited fastFood at floor 1`
9. Stress indicator should improve (😟 → normal color)

**Verify Income (wait for quarter report):**
- Every ~15 game-minutes = 1 quarter
- Check console for "📊 Quarter X Report:"
- Should see "Income: $X" with FastFood contribution
- Formula: $5 per customer visit

**Test Restaurant (2★ unlock):**
1. Check star rating in building menu (top-right)
2. If 1★, need to grow population to reach 2★
3. Once 2★, Restaurant unlocks
4. Place Restaurant on any floor
5. Same lunch behavior, but earns $15/customer

**Test Stress Penalty (no food scenario):**
1. Start new game (refresh page)
2. Place office but NO food buildings
3. Wait for 12:00 PM lunch
4. Workers should get stressed (stress +5)
5. Console: "😤 worker complains: There's nowhere to eat!"
6. Satisfaction drops

### 📊 Console Monitoring

**Open browser console (F12) to see:**
```
🚶 New worker immigrated to office (Population: X)
🍔 John Doe is HUNGRY (35%) - seeking food
🍔 John Doe visited fastFood at floor 1
📊 Quarter X Report:
  Income: $5
  Maintenance: -$50
  Net Profit: -$45
```

### 🐛 Known Issues to Watch For

**If workers DON'T go to food:**
- Check if elevator connects both floors
- Verify FastFood placement (should be inside floor bounds)
- Look for pathfinding errors in console

**If income doesn't generate:**
- Wait for full quarter cycle (15 game-minutes)
- Check quarterly report in console
- Customer count resets each quarter

**If workers get stuck:**
- This is BUG-013 (known issue)
- They might spawn on unreachable floor
- Will see high stress, critical emoji

## Success Criteria

✅ Workers spawn in offices  
✅ Lunch triggers at 12:00 PM  
✅ Workers navigate to food using elevators  
✅ Console shows food visit messages  
✅ Stress decreases after eating  
✅ Quarterly income includes food earnings  
✅ No food = stress penalty  

## Screenshots to Capture

1. Building menu with FastFood/Restaurant visible
2. Worker walking to elevator at lunch time
3. Worker inside FastFood building
4. Console logs showing food visits
5. Quarterly report with food income

## Next Steps After Testing

**If working perfectly:**
- Mark v0.6.0 as stable
- Move to v0.7.0 (building sprites recommended)

**If bugs found:**
- Document in BUG-TRACKER.md
- Note exact repro steps
- Check browser console for errors

---

**Testing Time Estimate:** 10-15 minutes  
**Built:** 2026-02-02 12:30 AM MST  
**Tester:** Davey  
**Status:** Ready for verification
