# Testing Guide: v0.7.3 - Rush Hour System

## 🎯 What's New
Workers now spawn at the LOBBY during morning rush and take elevators UP to their offices! This makes rush hours VISIBLE and creates the dramatic elevator congestion that SimTower is famous for.

## 🧪 How to Test

### Test 1: Morning Rush (CRITICAL)
1. **Start fresh** - Clear any saved games or start new tower
2. **Build infrastructure:**
   - Place 2-3 office buildings on different floors (floors 2-5 work well)
   - Add at least 1 elevator shaft connecting ground floor to your offices
   - Add stairs if you want (workers will prefer elevators for >5 floors)

3. **Fast-forward to 7:30 AM:**
   - Use speed controls (keys 0-4) to speed up time
   - Watch the clock in the top bar
   - At exactly **7:30 AM**, workers should spawn at lobby (floor 0, center)

4. **Observe the magic:**
   - ✅ Workers appear at ground floor lobby area
   - ✅ They walk to elevator shafts
   - ✅ They wait in queues at elevator doors
   - ✅ Elevators arrive and doors open
   - ✅ Workers board and ride UP to their offices
   - ✅ They arrive at office floor and walk inside
   - ✅ Check console logs for "🌅 MORNING RUSH: X workers spawned at lobby"

5. **What should happen:**
   - If you have 3 offices, expect 9 workers (3 per office)
   - Workers should create visible elevator queues
   - Poor elevator placement = long wait times = stressed workers

### Test 2: Evening Rush
1. **Continue from morning test**
2. **Fast-forward to 5:00 PM (17:00):**
   - Workers should start heading back to lobby
   - They'll walk to elevators and ride DOWN
   - At ground floor, they despawn (leave the tower)
   - Check console logs for "🌆 EVENING RUSH: X workers leaving"

### Test 3: Lunch Rush (Existing Feature)
1. **Build a Fast Food restaurant** on any floor
2. **Fast-forward to 12:00 PM (noon):**
   - Workers should seek food
   - They'll navigate to fast food building
   - Check console logs for "🍔 [Worker] visited fastFood at floor X"

### Test 4: Stress Test
1. **Build 5+ offices on different floors**
2. **Add ONLY 1 elevator shaft** (create intentional bottleneck)
3. **Watch morning rush at 7:30 AM:**
   - 15+ workers spawn at lobby
   - HUGE queue forms at elevator
   - Workers get stressed waiting
   - Elevator system should handle the load (LOOK algorithm)

## 🐛 What to Look For

### Expected Behaviors
- ✅ Workers spawn at lobby (not inside offices)
- ✅ Workers use pathfinding to navigate
- ✅ Elevators respond to floor requests
- ✅ Workers board when doors open
- ✅ Multiple workers can share an elevator car
- ✅ Workers exit at destination floor
- ✅ Console logs show spawn events

### Potential Issues
- ❌ Workers spawn inside offices (OLD BEHAVIOR - this is FIXED)
- ❌ Workers don't move after spawning
- ❌ Elevators don't respond to requests
- ❌ Workers clip through walls
- ❌ Crash/error during spawn
- ❌ No notification at 7:30 AM

## 🔍 Debug Info

### Console Commands
Open browser console (F12) and try:
```javascript
// Check RushHourSystem state
window.game.getRushHourSystem?.()

// Check population
window.game.getPopulationSystem().getPopulation()

// Check active workers
window.game.getPopulationSystem().getPeople().filter(p => p.type === 'worker')

// Force morning rush (if implemented)
// window.game.getRushHourSystem().triggerMorningRush(...)
```

### What to Screenshot
- Morning rush spawning at lobby (capture the crowd!)
- Elevator queue during rush hour
- Workers arriving at their offices
- Evening rush returning to lobby
- Any errors/bugs in console

## 📊 Success Criteria

This feature is working correctly if:
1. ✅ Workers spawn at lobby at 7:30 AM (not inside offices)
2. ✅ Workers visibly queue at elevators
3. ✅ Elevator congestion is OBVIOUS during rush hours
4. ✅ Workers successfully reach their destination offices
5. ✅ Evening rush shows workers leaving tower
6. ✅ No crashes or major bugs

## 🚀 What's Next
Once this is verified working:
- Week 3 goals mostly complete!
- Next: Make evaluation scores more VISIBLE (heatmap overlay)
- Then: Add more visual feedback for stress/happiness
- Eventually: Weekend schedules (different behavior Sat/Sun)

---

**Game URL:** http://100.85.24.1:5173/  
**Dev Server:** Running on port 5173  
**Build:** v0.7.3 (February 2, 2026, 2:15 AM MST)
