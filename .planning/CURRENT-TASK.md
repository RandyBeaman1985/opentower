# Current Task: Rush Hour Visibility Fix

**Status:** 🔴 CRITICAL - #1 Immersion Killer  
**Priority:** IMMEDIATE  
**ETA:** 2 hours  
**Blocking:** Week 3 Population AI work

---

## 🎯 The Problem

**Workers spawn INSIDE offices** instead of at the lobby, making rush hours invisible.

### What's Broken:
```typescript
// RushHourSystem.spawnWorkersForOffices()
const worker = {
  currentFloor: office.position.floor,  // ❌ Already at office!
  currentTile: office.position.startTile,
  destinationBuildingId: office.id,
};
```

### Expected (SimTower):
1. 8-9 AM: Workers spawn at LOBBY (floor 0)
2. Workers walk to elevators
3. Queues form (visible congestion)
4. Elevators fill up
5. Workers ride UP to offices
6. **Rush hour is VISIBLE and creates PRESSURE**

### Current Reality:
1. 8 AM: Workers teleport into offices
2. No lobby crowds
3. No elevator usage during rush
4. Game feels empty even with 50+ workers
5. **Core mechanic (elevators) feels dead**

---

## 🔧 The Fix

### File: `src/simulation/RushHourSystem.ts`

**Change spawn location from office to lobby:**

```typescript
// BEFORE (broken)
const worker = this.populationSystem.spawnWorker({
  currentFloor: office.position.floor,    // ❌ At destination
  currentTile: office.position.startTile,
  destinationBuildingId: office.id,
  state: 'idle',  // ❌ No reason to move
});

// AFTER (fixed)
const worker = this.populationSystem.spawnWorker({
  currentFloor: 0,                        // ✅ Spawn at lobby
  currentTile: 5,                         // ✅ Center of lobby
  destinationBuildingId: office.id,
  state: 'walking',                       // ✅ Start pathfinding
});
// PathfindingSystem will create route: lobby → elevator → office
```

### Why It Works:
1. Worker spawns at floor 0 (lobby)
2. PathfindingSystem detects: `currentFloor ≠ destinationFloor`
3. Creates multi-segment path: walk to elevator, ride up, walk to office
4. PopulationSystem executes path step-by-step
5. **Result:** Visible elevator usage, queues form, rush hour is real

---

## ✅ Test Checklist

After implementing:

1. **Morning Rush (8-9 AM):**
   - [ ] Workers appear at lobby (floor 0)
   - [ ] Workers walk toward elevators
   - [ ] Elevator queues form (3-5 people waiting)
   - [ ] Elevators fill up and go UP
   - [ ] Workers arrive at office floors
   - [ ] Console shows: "🌅 MORNING RUSH: X workers arriving"

2. **Evening Rush (5-6 PM):**
   - [ ] Workers leave offices
   - [ ] Workers walk to elevators on their floor
   - [ ] Elevators pick up workers going DOWN
   - [ ] Workers arrive at lobby
   - [ ] Workers exit/despawn
   - [ ] Console shows: "🌆 EVENING RUSH: X workers leaving"

3. **Lunch Rush (12-1 PM):**
   - [ ] Workers seek food buildings
   - [ ] Elevators used to reach restaurants
   - [ ] Food buildings show customer visits
   - [ ] Workers return to offices after eating

---

## 🎮 Expected Impact

### Before:
- Tower feels empty
- Elevators rarely used
- No visible congestion
- Rush hours invisible
- "Where is everyone?"

### After:
- Lobby bustling at 8 AM
- Elevator queues visible
- Congestion creates pressure
- Rush hours feel REAL
- "This is SimTower!"

### Gameplay Loop Emerges:
1. Morning rush → Elevator queues grow
2. Player sees stress indicators (😰)
3. Player adds more elevator cars
4. Queues shrink, stress reduces
5. **Core mechanic is working!**

---

## 📊 Related Systems

This fix enables:
- **Elevator optimization** - Players can see wait times
- **Stress feedback** - Visible when elevators overwhelm
- **Rush hour mechanics** - Morning/evening/lunch patterns
- **Population AI** - Pathfinding actually used
- **Economic pressure** - Bad elevators = visible consequences

---

## 🚀 Implementation Steps

### 1. Update RushHourSystem.spawnWorkersForOffices()
```typescript
// Line ~125 in RushHourSystem.ts
currentFloor: 0,           // Lobby spawn
currentTile: 5,            // Center tile
state: 'walking',          // Start moving
```

### 2. Update RushHourSystem.sendWorkersHome()
```typescript
// Workers already at office floor
// Just set state to 'leaving' and destinationBuildingId = null
// PathfindingSystem will route them to lobby
```

### 3. Verify PathfindingSystem Integration
- Check that PathfindingSystem detects floor difference
- Verify elevator route creation
- Test multi-segment path execution

### 4. Test in Browser
```bash
npm run dev
# Visit http://100.85.24.1:5173/
# Build offices on floors 2-5
# Wait for 8:00 AM (or fast-forward)
# Watch lobby for worker spawns
```

---

## 🎯 Success Criteria

- [ ] Build compiles without errors
- [ ] Morning rush: Workers spawn at lobby
- [ ] Morning rush: Elevators fill up and go UP
- [ ] Lunch rush: Workers use elevators to reach food
- [ ] Evening rush: Workers descend to lobby
- [ ] Console logs show: "🌅 MORNING RUSH: X workers"
- [ ] Visual: Queues form at elevators (3-5+ people)
- [ ] Stress: Workers show stress if wait > 2 minutes
- [ ] Game feel: "This is SimTower!"

---

## ⏱️ Time Estimate

- Code changes: 15 minutes
- Testing: 30 minutes
- Debugging pathfinding: 30 minutes
- Polish/logging: 15 minutes
- **Total: 1.5 hours**

---

## 🔗 Follow-Up Tasks

After rush hours work:

1. **Cash Flow UI** (Week 1 completion)
2. **Evaluation Overlay** (Week 2 start)
3. **Population Needs** (Week 3)

---

*Last Updated: 2026-02-02, 2:00 AM MST*  
*Status: Ready to implement*
