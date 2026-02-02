# SPEEDRUN POSITION: 24-Hour MVP
**Speed Demon's Manifesto**

*"Weeks? WEEKS?! We can have people complaining about elevators in 24 hours."*

---

## 🔥 The Thesis

The current plan calls for **5 weeks** to get an elevator demo. That's 200+ hours of work for something we can prove in **24**.

SimTower's core loop is:
1. Build stuff
2. People appear
3. Elevators suck
4. People get mad

Everything else is cosmetic. Let's build the skeleton, not the skin.

---

## ✂️ Brutal Scope Cuts

### ❌ OUT (For v0.1)
- **Building palette UI** → Hardcode: Left-click = Office, Right-click = Elevator
- **Ghost preview** → Just place it, no validation
- **Multiple building types** → Office, Lobby, Elevator ONLY
- **Pathfinding algorithm** → Hardcoded: Walk to elevator, ride up, walk to office
- **Economic simulation** → Infinite money
- **Stress decay** → Stress only goes up
- **Save/load** → Refresh = new game
- **Events** → No fires, no VIPs
- **Sound/Music** → Silent film
- **Proper sprites** → Colored rectangles
- **Tests** → Manual QA only
- **Documentation** → Code comments IF time permits
- **Git branches** → Commit to main, YOLO
- **Error handling** → Let it crash
- **Building cost/validation** → Place anywhere for free
- **Elevator programming UI** → Elevators are dumb (visit all floors)
- **Population cap logic** → Spawn workers, no despawn
- **Multiple elevator shafts** → ONE elevator shaft, that's it
- **Stairs/Escalators** → Doesn't exist
- **Hotel/Condo/Retail** → Office workers only

### ✅ IN (Absolute Minimum)
- **Click to place Office** → Spawns 6 workers
- **Click to place Elevator** → One shaft, 5 floors max
- **Workers walk horizontally** → 2 tiles/sec
- **Workers call elevator** → If destination is different floor
- **Elevator moves** → 1 floor/500ms
- **Workers board/exit** → When doors open
- **Wait time tracking** → How long until elevator arrives
- **Stress color** → Black → Pink → Red based on wait time
- **Camera** → Already exists, just hook it up
- **Render loop** → Already exists, draw rectangles

---

## ⏱️ 24-Hour Sprint Plan

### Phase 1: Foundation (Hours 0-6)
**Goal:** Click → building appears → workers spawn

| Hour | Task | Agent | Output |
|------|------|-------|--------|
| 0-2 | **Building Placement** | A1 | Click canvas → Office at (x,y) |
| 2-4 | **Office Entity** | A1 | Office spawns 6 workers on placement |
| 4-6 | **Person Rendering** | A2 | Workers render as black rectangles |

**Checkpoint:** Can place offices, see workers standing still

---

### Phase 2: Movement (Hours 6-12)
**Goal:** Workers walk around

| Hour | Task | Agent | Output |
|------|------|-------|--------|
| 6-8 | **Horizontal Movement** | A2 | Workers walk left/right at 2 tiles/sec |
| 8-10 | **Elevator Shaft Placement** | A3 | Click → Elevator shaft (5 floors) |
| 10-12 | **Elevator Car Rendering** | A3 | Car renders as blue rectangle in shaft |

**Checkpoint:** Workers walk, elevator exists

---

### Phase 3: Elevator Logic (Hours 12-18)
**Goal:** Elevator responds to calls

| Hour | Task | Agent | Output |
|------|------|-------|--------|
| 12-14 | **Call Button Logic** | A3 | Worker calls elevator when destination != current floor |
| 14-16 | **Car Movement** | A3 | Car visits called floors in order |
| 16-18 | **Boarding/Exiting** | A2+A3 | Workers enter car → ride → exit at destination |

**Checkpoint:** Workers use elevator to change floors

---

### Phase 4: The Feedback Loop (Hours 18-22)
**Goal:** Wait time → stress → color change

| Hour | Task | Agent | Output |
|------|------|-------|--------|
| 18-20 | **Wait Time Tracking** | A4 | Track time from call to board |
| 20-22 | **Stress Visualization** | A4 | 0-2min=black, 2-4min=pink, 4min+=red |

**Checkpoint:** Overloaded elevator = angry red workers

---

### Phase 5: Integration & Polish (Hours 22-24)
**Goal:** Make it feel like a game

| Hour | Task | Agent | Output |
|------|------|-------|--------|
| 22-23 | **Bug Bash** | ALL | Fix crashes, weird behaviors |
| 23-24 | **Playtest** | ALL | Place 10 offices, 1 elevator, watch chaos |

**Checkpoint:** "Holy shit, this is SimTower"

---

## 🤖 Parallelization Strategy

### Agent Assignments

#### Agent A1: Building System
**Files:**
- `src/ui/SimpleInput.ts` (mouse click detection)
- `src/simulation/buildings/Office.ts` (spawn workers)
- `src/simulation/Tower.ts` (modify placement)

**Dependencies:** None

---

#### Agent A2: Person System
**Files:**
- `src/simulation/entities/Person.ts` (position, state, movement)
- `src/simulation/entities/PersonRenderer.ts` (draw rectangle)
- `src/simulation/PopulationManager.ts` (spawn, update all)

**Dependencies:** A1 (needs Office to spawn workers)

---

#### Agent A3: Elevator System
**Files:**
- `src/simulation/transport/ElevatorShaft.ts` (shaft data)
- `src/simulation/transport/ElevatorCar.ts` (car movement, boarding)
- `src/rendering/ElevatorRenderer.ts` (draw shaft + car)

**Dependencies:** A2 (needs Person to call elevator)

---

#### Agent A4: Stress System
**Files:**
- `src/simulation/StressManager.ts` (wait time → stress)
- `src/simulation/entities/PersonRenderer.ts` (modify color based on stress)

**Dependencies:** A2 + A3 (needs wait time data)

---

### Communication Protocol

**Shared Interfaces (Define First, Hours 0-1):**
```typescript
// src/core/types.ts
interface Person {
  id: string;
  position: { floor: number; x: number; y: number };
  state: 'idle' | 'walking' | 'waiting' | 'riding';
  stress: number; // 0-100
  waitStart: number | null; // timestamp
}

interface ElevatorCar {
  id: string;
  floor: number; // current position
  targetFloors: number[]; // queue
  passengers: Person[];
  doorsOpen: boolean;
}
```

**Handoff Points:**
- A1 → A2: Office placement triggers `PopulationManager.spawnWorkers(office)`
- A2 → A3: Person calls elevator via `ElevatorCar.addCall(floor)`
- A3 → A2: Car arrives via event `'elevator:arrived'`
- A2+A3 → A4: Wait time calculated by A4 from timestamps

---

## 🚫 What We're Skipping (And Why It's OK)

| Feature | Why It's Essential (Usually) | Why We Don't Need It (Now) |
|---------|------------------------------|----------------------------|
| **Building palette UI** | User needs to select buildings | Hardcode Office on click, who cares |
| **Ghost preview** | Prevents placement errors | Let them place wrong, fail fast |
| **Economic simulation** | Core SimTower mechanic | Doesn't prove elevator fun |
| **Multiple building types** | Variety, replayability | Office workers are enough to test |
| **Tests** | Prevent regressions | No regressions if v0.1 is throwaway |
| **Save/load** | Progress persistence | 5-minute demo doesn't need saving |
| **Pathfinding A*** | Multi-floor navigation | Hardcode "walk to elevator" |
| **Error handling** | Stability | Crashes tell us what's broken faster |
| **Proper sprites** | Visual appeal | Rectangles prove the simulation works |

---

## 🎯 Success Criteria (24 Hours)

### Minimum Viable Demo
- [ ] Can click to place 3+ Office buildings
- [ ] Can click to place 1 Elevator shaft (5 floors)
- [ ] 18+ workers spawn across offices
- [ ] Workers walk to elevator when destination is different floor
- [ ] Elevator car visits called floors
- [ ] Workers board elevator, ride to destination, exit
- [ ] Workers turn pink/red when waiting too long
- [ ] Game runs at 60fps with 20+ people

### "Feels Like SimTower" Moment
> Place 4 offices on floor 5, 1 office on floor 1, 1 elevator.
> Watch workers on floor 5 ALL call elevator at 9am.
> Watch elevator struggle to serve everyone.
> Watch workers turn pink, then red.
> Think: "I need another elevator."

**If you feel that, we win.**

---

## 🔄 Hour-by-Hour Breakdown (Detailed)

### Hour 0-1: Setup & Interfaces
- **ALL AGENTS:** Review existing codebase
- **ALL AGENTS:** Define shared interfaces in `src/core/types.ts`
- **ALL AGENTS:** Create file stubs with function signatures

### Hour 1-2: Building Placement (A1)
```typescript
// src/ui/SimpleInput.ts
onClick(x, y) {
  const floor = Math.floor(y / FLOOR_HEIGHT);
  const tile = Math.floor(x / TILE_WIDTH);
  tower.placeOffice(floor, tile);
}
```

### Hour 2-3: Office Entity (A1)
```typescript
// src/simulation/buildings/Office.ts
class Office {
  onPlace() {
    for (let i = 0; i < 6; i++) {
      populationManager.spawn({
        floor: this.floor,
        x: this.x + i,
        type: 'worker'
      });
    }
  }
}
```

### Hour 3-4: Office → Worker Integration (A1)
- Hook Office placement into Tower
- Emit `'building:placed'` event
- Verify workers spawn on placement

### Hour 4-5: Person Data Structure (A2)
```typescript
// src/simulation/entities/Person.ts
class Person {
  position: { floor, x, y };
  state: 'idle' | 'walking' | 'waiting' | 'riding';
  destination: { floor, x } | null;
  
  update(dt: number) {
    if (this.state === 'walking') {
      this.x += WALK_SPEED * dt;
    }
  }
}
```

### Hour 5-6: Person Rendering (A2)
```typescript
// src/simulation/entities/PersonRenderer.ts
render(person: Person, graphics: Graphics) {
  graphics.fillStyle = 0x000000; // black
  graphics.fillRect(person.x, person.y, 4, 8);
}
```

### Hour 6-7: Horizontal Movement (A2)
- Implement walk toward destination.x
- Stop when reached
- Set state to idle

### Hour 7-8: Movement Polish (A2)
- Add basic idle animation (bob up/down)
- Ensure workers don't overlap

### Hour 8-9: Elevator Shaft Placement (A3)
```typescript
// Right-click to place elevator
onRightClick(x, y) {
  const floor = Math.floor(y / FLOOR_HEIGHT);
  tower.placeElevator(floor, floors: 5);
}
```

### Hour 9-10: Elevator Car Structure (A3)
```typescript
// src/simulation/transport/ElevatorCar.ts
class ElevatorCar {
  floor: number = 1;
  targetFloors: number[] = [];
  
  addCall(floor: number) {
    if (!this.targetFloors.includes(floor)) {
      this.targetFloors.push(floor);
    }
  }
}
```

### Hour 10-11: Car Movement (A3)
```typescript
update(dt: number) {
  if (this.targetFloors.length > 0) {
    const target = this.targetFloors[0];
    if (this.floor < target) this.floor += dt * ELEVATOR_SPEED;
    else if (this.floor > target) this.floor -= dt * ELEVATOR_SPEED;
    
    if (Math.abs(this.floor - target) < 0.1) {
      this.floor = target;
      this.targetFloors.shift();
      this.openDoors();
    }
  }
}
```

### Hour 11-12: Elevator Rendering (A3)
- Draw shaft as tall rectangle
- Draw car as blue rectangle at current floor

### Hour 12-13: Call Button Logic (A2+A3)
```typescript
// Person decides to call elevator
if (this.destination.floor !== this.position.floor) {
  elevator.addCall(this.position.floor);
  this.state = 'waiting';
  this.waitStart = Date.now();
}
```

### Hour 13-14: Door Open/Close (A3)
```typescript
openDoors() {
  this.doorsOpen = true;
  setTimeout(() => this.doorsOpen = false, 1000);
}
```

### Hour 14-15: Boarding Logic (A2)
```typescript
// When doors open at person's floor
if (elevator.doorsOpen && elevator.floor === this.position.floor) {
  elevator.board(this);
  this.state = 'riding';
}
```

### Hour 15-16: Riding Logic (A2)
```typescript
// Person tracks which elevator they're in
if (this.state === 'riding' && elevator.floor === this.destination.floor) {
  elevator.exit(this);
  this.state = 'walking';
}
```

### Hour 16-17: Exit Logic (A2+A3)
```typescript
// ElevatorCar
exit(person: Person) {
  this.passengers = this.passengers.filter(p => p !== person);
  person.position.floor = this.floor;
}
```

### Hour 17-18: Integration Testing (A2+A3)
- Workers spawn on floor 5
- Workers call elevator
- Workers ride to floor 1
- Workers exit and walk

### Hour 18-19: Wait Time Tracking (A4)
```typescript
// Person tracks wait time
if (this.state === 'waiting') {
  const waitTime = (Date.now() - this.waitStart) / 1000; // seconds
  this.stress = Math.min(100, waitTime * 10); // 10 stress per second
}
```

### Hour 19-20: Stress Color Mapping (A4)
```typescript
// PersonRenderer
getColor(person: Person): number {
  if (person.stress < 50) return 0x000000; // black
  if (person.stress < 80) return 0xFF69B4; // pink
  return 0xFF0000; // red
}
```

### Hour 20-21: Stress Visualization (A4)
- Apply color to person rectangles
- Test with overloaded elevator

### Hour 21-22: Stress Polish (A4)
- Smooth color transitions
- Stress tooltip on hover (if time)

### Hour 22-23: Bug Bash (ALL)
- Workers stuck in walls?
- Elevator skips floors?
- Rendering glitches?
- Performance issues?

### Hour 23-24: Final Playtest (ALL)
- Place 10 offices, 1 elevator
- Watch morning rush (9am)
- Record demo video
- Screenshot red workers

---

## 💀 Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Agents block each other** | High | Critical | Define interfaces in Hour 0, work independently |
| **Integration fails** | Medium | High | Test handoffs at Hour 12, 16 |
| **Scope creep** | High | Medium | NO new features after Hour 18 |
| **Rendering performance** | Low | Medium | Use PixiJS efficiently, limit to 50 people |
| **Can't finish in 24h** | Medium | High | Cut stress system if needed (Hour 18+) |

---

## 🏁 Definition of Done

**Playable Demo exists where:**
1. You can place buildings with mouse clicks
2. Workers spawn and move
3. Elevator responds to calls
4. Workers use elevator to change floors
5. Wait time causes visible stress (color change)
6. Game runs smoothly (60fps)

**Bonus (If Time):**
- Simple UI overlay (population count, time)
- Pause/speed controls
- Camera zoom works

**Not Required:**
- Balance tuning
- Edge case handling
- Code quality
- Reusability

---

## 🎤 Closing Argument

The "proper" plan calls for **5 weeks** to get here. That's because it includes:
- Comprehensive testing
- Multiple building types
- Polished UI
- Error handling
- Documentation

**We don't need any of that to prove the core loop is fun.**

Give me 4 agents and 24 hours. If the demo sucks, we learned something fast. If it's fun, we learned we're on the right track.

Either way, we're **5 weeks ahead** of the alternative.

---

*"Perfect is the enemy of shipped. Shipped is the enemy of 'still coding 3 months from now.'"*  
— Speed Demon

---

**Next Step:** Get approval from Product Manager, then unleash the agents.
