# OpenTower Autonomous Build Plan
## Debate Synthesis & Today's Execution Strategy

*Synthesized: 2025-01-30 | Synthesizer: Debate Moderator*  
*Sources: Pragmatist, Purist, Speedrun, Quality Guardian*

---

## Executive Summary

After reviewing all 4 debate positions, the Master Plan, and SimTower reference documentation, I've synthesized a plan that captures the best of each perspective while mitigating their weaknesses.

**The Verdict:**

| Debate | Winner | Rationale |
|--------|--------|-----------|
| **Port vs Clean** | **Clean (with reference)** | Use OpenSkyscraper/Towerz as *algorithm reference*, not ported code. We get proven approaches without tech debt. |
| **Speed vs Quality** | **Tiered hybrid** | Fast MVP first (48h), then quality rebuild. Prove concept quick, build it right. |
| **Timeline** | **5 weeks to Phase 1** | 48h proof-of-concept + 4 weeks proper implementation |

---

## Position Synthesis: What Everyone Got Right

### 🔵 Pragmatist Was Right About:
- ✅ Elevator scheduling algorithm is THE hard problem (don't reinvent)
- ✅ Existing implementations show proven patterns
- ✅ Understanding queue management, dispatch, A* saves weeks of design
- ✅ 3 weeks is achievable for working prototype

### 🟢 Purist Was Right About:
- ✅ Our interface-first architecture is superior
- ✅ Porting introduces style mismatches and hidden bugs
- ✅ TypeScript velocity compounds over time
- ✅ We're already 40% scaffolded

### 🔴 Speedrun Was Right About:
- ✅ We can prove core loop in hours, not weeks
- ✅ Scope cuts unlock speed (Office + Elevator only)
- ✅ Colored rectangles work for validation
- ✅ Parallelization across agents multiplies throughput

### 🟡 Quality Guardian Was Right About:
- ✅ Complex systems (elevator, pathfinding) need 50%+ coverage
- ✅ Compound bugs kill projects (SimCity 2013 example)
- ✅ Test-alongside beats test-after
- ✅ Quality gates prevent shipping broken milestones

---

## The Unified Strategy: "Reference, Don't Port"

**Core Principle:** Read existing code to understand *what* to build, then build it our way.

### What This Means:

1. **Algorithm Reference:** Before implementing elevator scheduler, read OpenSkyscraper's `Queue.cpp`, `Car.cpp`, and `Elevator.cpp`. Understand the state machine, dispatch logic, and queue management. Then write our TypeScript implementation.

2. **Architecture Purity:** All code fits our interface-first, event-driven architecture. No C++ patterns, no manual memory management mindset.

3. **Test Coverage:** Core systems (elevator, pathfinding, stress) get 50%+ coverage. Throwaway MVP code gets 0%.

4. **Speed Where Safe:** UI, rendering, MVP validation can move fast with less rigor. Simulation core moves carefully.

---

## Today's Autonomous Build Plan

### Hour-by-Hour Schedule (Starting Now)

**Time:** 6:48 PM MT | **Duration:** Rest of today (~5 hours available)

---

### Phase A: Parallel Setup (Hours 0-1)

**ALL AGENTS:** Define shared interfaces and create file stubs

**Output:** `/src/core/types.ts` with minimal types:
```typescript
interface Position { x: number; y: number; floor: number; }
interface Person { id: string; position: Position; state: PersonState; stress: number; }
interface ElevatorCar { id: string; floor: number; targetFloors: number[]; passengers: string[]; }
type PersonState = 'idle' | 'walking' | 'waiting' | 'riding';
```

**AGENT ASSIGNMENTS:**

| Agent | Role | First Task |
|-------|------|------------|
| **Agent 1** | Building System | Create `/src/simulation/buildings/Office.ts` stub |
| **Agent 2** | Person System | Create `/src/simulation/entities/Person.ts` stub |
| **Agent 3** | Elevator System | Create `/src/simulation/transport/ElevatorCar.ts` stub |
| **Agent 4** | Integration | Create `/src/simulation/SimulationManager.ts` stub |

---

### Phase B: Building Placement (Hours 1-2)

**AGENT 1 FOCUS:** Click → Building Appears

**Files to Create:**
- `/src/ui/BuildingPlacer.ts` - Mouse input handling
- `/src/simulation/buildings/Office.ts` - Office entity

**Acceptance Criteria:**
- [ ] Click canvas → Office building appears at clicked position
- [ ] Office stores position (floor, x) in Tower state
- [ ] Visual: Gray rectangle (16×8 pixels) at placement location

**Code Pattern:**
```typescript
// BuildingPlacer.ts
export function handleClick(x: number, y: number, tower: Tower): void {
  const floor = Math.floor(y / FLOOR_HEIGHT);
  const tile = Math.floor(x / TILE_WIDTH);
  tower.addBuilding({ type: 'office', floor, x: tile, width: 9 });
}
```

---

### Phase C: Person Spawning (Hours 2-3)

**AGENT 2 FOCUS:** Office → Workers Spawn

**Files to Create:**
- `/src/simulation/entities/Person.ts` - Person entity with state machine
- `/src/simulation/PopulationManager.ts` - Spawn and update all people

**Acceptance Criteria:**
- [ ] When Office placed → 6 workers spawn at office position
- [ ] Workers render as black rectangles (4×8 pixels)
- [ ] Workers have state: `idle` initially

**Integration Point:**
```typescript
// Office.ts
onPlace(): void {
  for (let i = 0; i < 6; i++) {
    populationManager.spawn({
      position: { floor: this.floor, x: this.x + i, y: this.y },
      state: 'idle',
      stress: 0
    });
  }
}
```

---

### Phase D: Person Movement (Hours 3-4)

**AGENT 2 FOCUS:** Workers Walk Horizontally

**Modify:**
- `/src/simulation/entities/Person.ts` - Add movement logic

**Acceptance Criteria:**
- [ ] Worker walks toward destination at 2 tiles/second
- [ ] Walking animation: Position interpolates smoothly
- [ ] Worker stops when reaching destination

**State Transitions:**
```
idle → (destination set) → walking → (reached) → idle
```

---

### Phase E: Elevator Shaft (Hours 4-5)

**AGENT 3 FOCUS:** Elevator Exists and Moves

**Files to Create:**
- `/src/simulation/transport/ElevatorShaft.ts` - Shaft data structure
- `/src/simulation/transport/ElevatorCar.ts` - Car movement

**Acceptance Criteria:**
- [ ] Right-click → Elevator shaft appears (5 floors)
- [ ] Shaft renders as tall rectangle
- [ ] Car renders as blue square at current floor
- [ ] Car moves toward target floor at 1 floor/500ms

**Reference (READ FIRST):**
- `/projects/openskyscraper/source/Item/Elevator/` - Understand state machine
- `/projects/towerz/source/js/SystemsManager.js` - Simpler dispatch

---

### Phase F: Elevator Calling (Tonight or Tomorrow AM)

**AGENT 2+3 COORDINATION:** Person Calls → Elevator Arrives

**Acceptance Criteria:**
- [ ] Worker at floor X wants to go to floor Y
- [ ] Worker calls elevator: `elevator.addCall(currentFloor)`
- [ ] Worker state changes to `waiting`
- [ ] Elevator car moves to caller's floor
- [ ] When doors open, worker boards (state → `riding`)

---

### Phase G: Stress Visualization (Tomorrow)

**AGENT 4 FOCUS:** Wait Time → Color

**Files to Create:**
- `/src/simulation/StressManager.ts` - Calculate stress from wait time

**Acceptance Criteria:**
- [ ] Track wait start time when person calls elevator
- [ ] Calculate stress: `stress = (waitTime / 60) * 100` (capped at 100)
- [ ] Render person color:
  - 0-30: Black
  - 30-70: Pink (#FF69B4)
  - 70-100: Red (#FF0000)

---

## Agent Task Assignments

### Agent 1: Building System Lead

**Today's Tasks:**
1. `/src/ui/BuildingPlacer.ts` - Click detection, coordinate conversion
2. `/src/simulation/buildings/Office.ts` - Office entity with spawn hook
3. `/src/simulation/buildings/Lobby.ts` - Ground floor lobby
4. `/src/rendering/BuildingRenderer.ts` - Draw rectangles

**Files to Read (Reference):**
- `/projects/towerz/source/js/GridManager.js` - Grid placement patterns
- `/projects/openskyscraper/source/Item/Office/` - Office behavior (rent, workers)

**Output by EOD:** Can place Office and Lobby, workers spawn

---

### Agent 2: Person System Lead

**Today's Tasks:**
1. `/src/simulation/entities/Person.ts` - Person class with state machine
2. `/src/simulation/PopulationManager.ts` - Spawn, update, query people
3. `/src/rendering/PersonRenderer.ts` - Draw person rectangle with stress color

**Files to Read (Reference):**
- `/projects/towerz/source/js/SimulationManager.js` - Person state machine
- `/projects/openskyscraper/source/Person.h` - Person types, journeys

**Output by EOD:** People spawn, walk, render with colors

---

### Agent 3: Elevator System Lead

**Today's Tasks:**
1. `/src/simulation/transport/ElevatorShaft.ts` - Shaft data structure
2. `/src/simulation/transport/ElevatorCar.ts` - Car movement, call handling
3. `/src/rendering/ElevatorRenderer.ts` - Draw shaft and car

**Files to Read (Reference - CRITICAL):**
- `/projects/openskyscraper/source/Item/Elevator/Queue.cpp` - Queue management
- `/projects/openskyscraper/source/Item/Elevator/Car.cpp` - Car state machine
- `/projects/openskyscraper/source/Item/Elevator/Elevator.cpp` - Dispatch algorithm

**Output by EOD:** Elevator shaft with moving car, responds to calls

---

### Agent 4: Integration & Rendering Lead

**Today's Tasks:**
1. `/src/simulation/SimulationManager.ts` - Coordinates all systems
2. `/src/core/GameLoop.ts` - Wire everything into update cycle
3. `/src/rendering/TowerRenderer.ts` - Master render orchestration
4. `/src/ui/DebugOverlay.ts` - Show FPS, population, stress stats

**Output by EOD:** All systems wired, running at 60fps

---

## File Structure (End of Today)

```
src/
├── core/
│   ├── types.ts              # Shared interfaces ← CREATE
│   └── GameLoop.ts           # Existing, wire new systems
├── simulation/
│   ├── SimulationManager.ts  # Master coordinator ← CREATE
│   ├── PopulationManager.ts  # People lifecycle ← CREATE
│   ├── StressManager.ts      # Stress calculation ← CREATE
│   ├── buildings/
│   │   ├── Office.ts         # Office entity ← CREATE
│   │   └── Lobby.ts          # Lobby entity ← CREATE
│   ├── entities/
│   │   └── Person.ts         # Person entity ← CREATE
│   └── transport/
│       ├── ElevatorShaft.ts  # Shaft structure ← CREATE
│       └── ElevatorCar.ts    # Car mechanics ← CREATE
├── rendering/
│   ├── TowerRenderer.ts      # Master renderer ← CREATE
│   ├── BuildingRenderer.ts   # Building visuals ← CREATE
│   ├── PersonRenderer.ts     # Person visuals ← CREATE
│   └── ElevatorRenderer.ts   # Elevator visuals ← CREATE
└── ui/
    ├── BuildingPlacer.ts     # Click handling ← CREATE
    └── DebugOverlay.ts       # Debug info ← CREATE
```

---

## Success Criteria: End of Day 1

### Minimum Viable Demo Checklist

- [ ] Click to place Office building (gray rectangle)
- [ ] 6 workers spawn in office (black rectangles)
- [ ] Workers walk horizontally when given destination
- [ ] Right-click to place Elevator shaft (5 floors)
- [ ] Elevator car visible (blue rectangle)
- [ ] Car moves to called floor

### Stretch Goals (if time permits)

- [ ] Workers call elevator when destination is different floor
- [ ] Workers board elevator, ride, exit
- [ ] Stress color changes based on wait time
- [ ] Lobby building type
- [ ] Debug overlay showing population/stress

---

## Quality Gates

### For MVP (Today-Tomorrow)

**Coverage:** 0% (throwaway code, speed over quality)
**Documentation:** Comments on tricky bits only
**Testing:** Manual QA only

### For Phase 1 Demo (Week 5)

**Coverage Targets:**
- Elevator scheduler: 70%
- Person state machine: 60%
- Building placement: 50%
- Core loop: 70% (already there)

**Documentation:**
- ADR for elevator scheduler algorithm choice
- Algorithm doc for dispatch logic

**Quality Gate Checklist:**
- [ ] All unit tests pass
- [ ] Integration test: Worker loop end-to-end
- [ ] Performance: 60fps with 50 people, 1 elevator
- [ ] No known P0 bugs

---

## Key Decisions (Debate Verdicts)

### 1. Port vs Clean: **Clean with Reference**

**Rationale:** 
- Pragmatist showed elevator/pathfinding algorithms are valuable
- Purist showed our architecture is better than C++ patterns
- **Compromise:** Read OpenSkyscraper code to understand algorithms, then implement fresh in TypeScript

**Action:** Before writing elevator scheduler, Agent 3 MUST read:
- `Queue.cpp` (145 lines) - understand queue management
- `Car.cpp` (~200 lines) - understand car state machine
- `Elevator.cpp` lines 280-380 - understand dispatch logic

Then implement our version fitting our interfaces.

### 2. Speed vs Quality: **Tiered Approach**

**Rationale:**
- Speedrun showed core loop can be validated fast with minimal code
- Quality Guardian showed complex systems need tests

**Action:**
- Hours 0-12: MVP with no tests (prove concept)
- Days 2-5: Rebuild with tests (proper implementation)
- Week 1-5: Full quality gates

### 3. Scope: **Brutal MVP Cuts**

**IN for MVP:**
- Office building (spawns workers)
- Lobby building (ground floor)
- Elevator shaft (1 shaft, 1 car)
- Person movement (walk, wait, ride)
- Stress colors (black/pink/red)

**OUT for MVP:**
- All other building types (21 types can wait)
- Building cost/economics
- Multiple elevator shafts
- Pathfinding algorithm (hardcode: walk to elevator)
- Save/load
- Sounds
- Proper sprites (rectangles only)
- Tests

### 4. Parallelization: **4 Independent Streams**

**Rationale:** Speedrun showed 4 agents can work in parallel with defined interfaces

**Handoff Protocol:**
- Agent 1 → Agent 2: Office fires `building:placed` event → PopulationManager spawns workers
- Agent 2 → Agent 3: Person calls `elevator.addCall(floor)` → Elevator responds
- Agent 3 → Agent 2: Elevator fires `elevator:arrived` → Person boards
- Agent 4 → ALL: SimulationManager coordinates tick cycle

---

## Reference Material Locations

### OpenSkyscraper (C++ - ALGORITHM REFERENCE)
```
/projects/openskyscraper/source/
├── Item/Elevator/           # ⭐ CRITICAL - Elevator logic
│   ├── Queue.cpp           # Queue management (145 lines)
│   ├── Car.cpp             # Car state machine
│   └── Elevator.cpp        # Dispatch algorithm
├── PathFinder/             # A* pathfinding
│   ├── PathFinder.cpp      # A* implementation
│   └── MapSearchNode.cpp   # Search node heuristics
├── Person.cpp              # Person behavior
└── Item/Office/            # Office mechanics
```

### Towerz (JavaScript - SIMPLER REFERENCE)
```
/projects/towerz/source/js/
├── Engine.js              # Game loop (~350 lines)
├── SimulationManager.js   # Person simulation (~420 lines)
├── SystemsManager.js      # Elevator SCAN algorithm (~270 lines)
├── GridManager.js         # Grid placement (~300 lines)
└── Constants.js           # Game constants
```

### Our Design Docs
```
/projects/opentower/.planning/
├── MASTER-PLAN.md         # Roadmap, milestones
├── SIMTOWER-REFERENCE.md  # Original game mechanics
└── debate/                # Position papers
```

---

## Communication Protocol

### Between Agents

**Shared Interfaces:** All agents work against interfaces in `/src/core/types.ts`

**Event Bus:** Use existing event system for loose coupling
```typescript
eventBus.emit('building:placed', { building, floor, x });
eventBus.emit('person:spawned', { person });
eventBus.emit('elevator:called', { floor, direction });
eventBus.emit('elevator:arrived', { elevator, floor });
```

**Blocking Issues:** If blocked, create file: `/src/.blocked/AGENT-X-REASON.md`

### Progress Tracking

**Update frequency:** Every 2 hours

**Update format:** Edit `/projects/opentower/.planning/PROGRESS.md`
```markdown
## Agent 1 - Building System
- [x] BuildingPlacer.ts (2 hours)
- [ ] Office.ts (in progress)
- [ ] Lobby.ts (not started)
```

---

## Risk Mitigation

### Risk 1: Integration Fails
**Mitigation:** Define interfaces first (Hour 0), integrate at Hour 4 checkpoint

### Risk 2: Elevator Logic Too Complex
**Mitigation:** Start with DUMB elevator (visits all floors) before smart dispatch

### Risk 3: Agent Blocking
**Mitigation:** Stub dependencies with mock implementations

### Risk 4: Scope Creep
**Mitigation:** NO NEW FEATURES after Hour 4. Only bug fixes.

---

## Final Notes

**To all agents:**

This plan synthesizes the best ideas from 4 strong positions. We're not porting, we're not writing blind, we're not rushing carelessly, and we're not gold-plating too early.

**Our approach:** Reference proven code → Implement clean TypeScript → Validate fast → Build quality later

**Today's mantra:** "Make the elevator ding."

When a person clicks to place an office, spawns workers, calls an elevator, rides up, and exits at their floor — that's when we know we're on the right track.

Let's build OpenTower. 🏢

---

*Plan created by Debate Synthesizer*  
*Ready for autonomous execution*
