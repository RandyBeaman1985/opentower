# OpenTower Task Queue
**Automated Build System**

Last Updated: 2025-01-30

---

## Current Sprint: Elevator Demo MVP

### 🔴 In Progress
*None yet*

### 🟡 Ready (Prioritized)

#### T001: Building Placement System
**Priority:** P0 (Blocker)  
**Estimate:** 4-6 hours  
**Dependencies:** None

**Acceptance Criteria:**
- [ ] Mouse click on game canvas selects build location
- [ ] Building tool palette shows available buildings
- [ ] Ghost preview shows where building will go
- [ ] Click confirms placement (if valid)
- [ ] Placement validation (funds, tile availability, floor restrictions)
- [ ] Building appears in tower with placeholder sprite
- [ ] Funds deducted, event emitted

**Files to Create/Modify:**
- `src/ui/BuildingPalette.ts` (new)
- `src/ui/GhostPreview.ts` (new)
- `src/input/InputManager.ts` (new)
- `src/simulation/Tower.ts` (modify placeBuilding)
- `src/rendering/TowerRenderer.ts` (add click handling)

---

#### T002: Office Entity Implementation  
**Priority:** P0  
**Estimate:** 3-4 hours  
**Dependencies:** T001

**Acceptance Criteria:**
- [ ] Office building spawns 6 workers at construction
- [ ] Workers have home office assigned
- [ ] Workers visible in office during work hours (9am-5pm)
- [ ] Office tracks occupancy, income, stress

**Files to Create/Modify:**
- `src/simulation/buildings/Office.ts` (new)
- `src/simulation/Building.ts` (base class, new)

---

#### T003: Person Entity Base Class
**Priority:** P0  
**Estimate:** 4-5 hours  
**Dependencies:** T002

**Acceptance Criteria:**
- [ ] Person has position (floor, tile, x/y within tile)
- [ ] Person has state (idle, walking, waiting, riding)
- [ ] Person has destination queue
- [ ] Person has stress level (0-100)
- [ ] Person renders as colored rectangle (stress color)
- [ ] Basic idle animation (optional)

**Files to Create/Modify:**
- `src/simulation/entities/Person.ts` (new)
- `src/simulation/entities/PersonRenderer.ts` (new)
- `src/simulation/PopulationManager.ts` (new)

---

#### T004: Horizontal Pathfinding
**Priority:** P0  
**Estimate:** 3-4 hours  
**Dependencies:** T003

**Acceptance Criteria:**
- [ ] Person can path to any tile on same floor
- [ ] Pathfinding avoids occupied tiles
- [ ] Movement speed is consistent (2 tiles/sec)
- [ ] Person animates while walking

**Files to Create/Modify:**
- `src/simulation/pathfinding/FloorPathfinder.ts` (new)
- `src/simulation/entities/Person.ts` (add movement)

---

#### T005: Elevator Shaft + Car Data Structures
**Priority:** P0  
**Estimate:** 3-4 hours  
**Dependencies:** T001

**Acceptance Criteria:**
- [ ] ElevatorShaft has floors served, car capacity
- [ ] ElevatorCar has position, passengers, destination queue
- [ ] Can create elevator spanning multiple floors
- [ ] Elevator renders as shaft with car

**Files to Create/Modify:**
- `src/simulation/transport/ElevatorShaft.ts` (new)
- `src/simulation/transport/ElevatorCar.ts` (new)
- `src/rendering/ElevatorRenderer.ts` (new)

---

#### T006: Elevator Car Movement
**Priority:** P0  
**Estimate:** 4-5 hours  
**Dependencies:** T005

**Acceptance Criteria:**
- [ ] Call button adds floor to car's destination queue
- [ ] Car moves toward nearest destination
- [ ] Car speed: 1 floor per 500ms (adjustable)
- [ ] Car stops, opens doors (1 second)
- [ ] Door close, continue to next destination

**Files to Create/Modify:**
- `src/simulation/transport/ElevatorScheduler.ts` (new)
- `src/simulation/transport/ElevatorCar.ts` (add movement logic)

---

#### T007: Person Boards/Exits Elevator
**Priority:** P0  
**Estimate:** 4-5 hours  
**Dependencies:** T004, T006

**Acceptance Criteria:**
- [ ] Person walks to elevator when going to different floor
- [ ] Person waits at elevator door
- [ ] When car arrives + opens, person boards
- [ ] Person rides to destination floor
- [ ] Person exits when doors open at destination
- [ ] Wait time tracked from arrival to boarding

**Files to Create/Modify:**
- `src/simulation/entities/Person.ts` (add elevator interactions)
- `src/simulation/transport/ElevatorCar.ts` (add boarding logic)

---

#### T008: Wait Time → Stress Accumulation
**Priority:** P1  
**Estimate:** 2-3 hours  
**Dependencies:** T007

**Acceptance Criteria:**
- [ ] Person tracks cumulative wait time
- [ ] Wait time converts to stress (configurable formula)
- [ ] Stress thresholds: 0-50 black, 51-80 pink, 81-100 red
- [ ] Daily stress decay (morning reset)

**Files to Create/Modify:**
- `src/simulation/entities/Person.ts` (add stress logic)
- `src/simulation/StressManager.ts` (new, optional)

---

#### T009: Stress Visualization
**Priority:** P1  
**Estimate:** 2-3 hours  
**Dependencies:** T008

**Acceptance Criteria:**
- [ ] Person sprite color reflects stress level
- [ ] Black (0-50): Normal, satisfied
- [ ] Pink (51-80): Getting annoyed
- [ ] Red (81-100): About to leave
- [ ] Color transition is smooth (lerp)

**Files to Create/Modify:**
- `src/simulation/entities/PersonRenderer.ts` (add color logic)

---

#### T010: FastFood + Lobby Placement
**Priority:** P1  
**Estimate:** 2-3 hours  
**Dependencies:** T001

**Acceptance Criteria:**
- [ ] FastFood building placeable on floors 1-14
- [ ] Lobby placeable only on floor 1
- [ ] Lobby auto-extends when adjacent lobby placed
- [ ] FastFood attracts visitors (stub for now)

**Files to Create/Modify:**
- `src/simulation/buildings/FastFood.ts` (new)
- `src/simulation/buildings/Lobby.ts` (new)

---

## ✅ Completed
*None yet*

---

## 📋 Backlog (Unprioritized)
- T011: Stairs implementation
- T012: Hotel single room
- T013: Housekeeping loop
- T014: Economic tick (quarterly income)
- T015: Save/load to localStorage
- T016: Basic UI overlay (funds, time, population)
- T017: Elevator programming UI
- T018: Escalator implementation
- T019: Condo with evaluation day
- T020: Star rating progression

---

## 🤖 Automation Notes

Each task should:
1. Create a feature branch: `feature/T00X-description`
2. Implement with tests (min 50% coverage for new code)
3. Run full test suite before PR
4. Update this file when complete
5. Merge to main, delete branch

**Commit message format:**
```
T00X: Brief description

- Detail 1
- Detail 2

Closes #X (if GitHub issue exists)
```
