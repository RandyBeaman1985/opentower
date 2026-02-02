# Senior Game Engine Engineer Review - OpenTower

**Author:** Senior Game Engine Engineer (15 years: Unity, Unreal, Custom Engines, AAA Titles)  
**Date:** 2025-01-30  
**Scope:** Critical technical review of architecture, algorithms, and scalability  

---

## Executive Summary

OpenTower has **solid architectural bones** but is currently **90% interface scaffolding**. The codebase demonstrates strong TypeScript discipline and clean separation of concerns. However, critical systems remain unimplemented, and several architectural decisions will need revision before the 15K entity target is achievable.

**Verdict:** ✅ Proceed with current foundation, but address identified technical gaps immediately.

---

## 1. Architecture Assessment: Is It Sound for 15K Entities?

### Current State

The architecture follows a reasonable layered approach:

```
┌──────────────────────────────────────────────────────────────┐
│                         Game Loop                             │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │ ClockManager│  │  TowerManager │  │   TowerRenderer    │   │
│  └─────────────┘  └──────────────┘  └────────────────────┘   │
│         │                 │                   │               │
│  ┌──────▼─────────────────▼───────────────────▼──────────┐   │
│  │                     EventBus                           │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Problems

**1. Monolithic Tower State Object**

```typescript
// Current: Single giant object
interface Tower {
  floorsById: Record<string, Floor>;      // O(1) lookup, but...
  buildingsById: Record<string, Building>; // ...all in one memory block
  elevators: IElevatorShaft[];
  // etc.
}
```

At 15K entities, this becomes problematic:
- **Garbage collection pauses** from large object graphs
- **Cache misses** when iterating sparse data
- **Serialization bottlenecks** (JSON.parse of 10MB+ state)

**2. Event Bus as God Object**

The global singleton `getEventBus()` is convenient but dangerous:
- Makes dependency injection impossible
- Testing requires `resetEventBus()` (code smell)
- No backpressure mechanism for event storms

**3. Missing Spatial Index**

There's no spatial acceleration structure. Finding "all people on floor 15" requires O(n) iteration.

### Recommended Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           MAIN THREAD                                │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐ │
│  │   Renderer   │  │ InputManager │  │      StateSnapshot         │ │
│  │  (PixiJS)    │  │  (Events)    │  │  (Read-only view of sim)   │ │
│  └──────────────┘  └──────────────┘  └────────────────────────────┘ │
│         │                 │                        ▲                 │
│         └─────────────────┼────────────────────────│                 │
│                           │                        │                 │
│  ┌────────────────────────▼────────────────────────│────────────────┐│
│  │                  SharedArrayBuffer                                ││
│  │   [positions: Float32Array][states: Uint8Array][floors: Int8]    ││
│  └──────────────────────────────────────────────────────────────────┘│
│                           │                        │                 │
├───────────────────────────│────────────────────────│─────────────────┤
│                       WORKER THREAD                                  │
│  ┌────────────────────────▼────────────────────────│────────────────┐│
│  │                  SimulationCore                                   ││
│  │  ┌──────────────┐ ┌────────────────┐ ┌───────────────────────┐   ││
│  │  │ ElevatorSys  │ │  PopulationSys │ │    EconomicsSys       │   ││
│  │  │  (SCAN alg)  │ │  (SoA + Grid)  │ │   (Quarterly ticks)   │   ││
│  │  └──────────────┘ └────────────────┘ └───────────────────────────┘││
│  └──────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

**Key Changes:**
- Simulation runs in worker, rendering on main thread
- SharedArrayBuffer for zero-copy position data
- Systems update SoA arrays in-place
- Renderer reads snapshot without blocking simulation

---

## 2. Performance Concerns: Will PixiJS + TypeScript Handle 15K Entities?

### The Math

| Metric | Target | Current Capability | Gap |
|--------|--------|-------------------|-----|
| Entities | 15,000 | N/A (0 implemented) | ❌ |
| Visible Sprites | ~1,000 | PixiJS can handle 10K+ | ✅ |
| Simulation Tick | 100ms | Unknown | ❓ |
| Render Frame | 16.67ms (60fps) | ~8ms for buildings | ✅ |

### Per-Tick Budget Analysis (100ms target)

```
Budget: 100ms total

Elevator Cars (192 max):
  - Position update: 0.05ms × 192 = 9.6ms
  - Door state machine: 0.01ms × 192 = 1.92ms
  Subtotal: ~12ms ✅

People (15,000):
  - Position update: 0.002ms × 15,000 = 30ms
  - Pathfinding (10% repath): 0.1ms × 1,500 = 150ms ❌ PROBLEM
  - Stress calculation: 0.001ms × 15,000 = 15ms
  Subtotal: ~195ms ❌ OVER BUDGET

Economics (quarterly):
  - Income aggregation: ~5ms every 5 minutes (negligible)
```

### The Pathfinding Problem

Naïve pathfinding at 10 queries/frame × 0.1ms = **1.5ms/frame** for 100 people. At 1,500 people needing paths, this explodes.

**Solutions:**
1. **Path caching** - Reuse paths for common routes
2. **Hierarchical pathfinding** - Abstract to zones
3. **Amortize over frames** - Only compute N paths/tick

### TypeScript Overhead

TypeScript compiles to JavaScript, which has:
- No native SIMD
- No true multithreading (Web Workers are message-passing)
- GC pauses (mitigate with object pooling)

**Verdict:** PixiJS is fine. TypeScript simulation will need heavy optimization.

---

## 3. Elevator Algorithm: What Should Be Used?

### Reference Implementation Analysis

**OpenSkyScraper (C++):**
```cpp
// Elevator.cpp - "Most Urgent Queue" dispatch
void Elevator::respondToCalls() {
    Queue * q;
    while ((q = getMostUrgentQueue())) {
        Car * car = getIdleCar(q->floor);
        if (!car) break;
        q->answered = true;
        car->direction = q->direction;
        car->moveTo(q->floor);
    }
}
```

**Towerz (JavaScript):**
```javascript
// SystemsManager.js - SCAN algorithm
decideNextTarget() {
    if (this.direction === -1) { // Going UP
        const above = requests.filter(r => r < current);
        if (above.length > 0) nextFloor = Math.max(...above);
        else nextFloor = Math.max(...requests); // Reverse
    }
    // ... symmetric for DOWN
}
```

### Recommended: Modified LOOK Algorithm

LOOK is SCAN without traveling to the ends unnecessarily:

```typescript
/**
 * LOOK Algorithm for Elevator Scheduling
 * 
 * Key insight: Serve all requests in current direction,
 * then reverse. Never go past the furthest request.
 */
class ElevatorScheduler {
  private direction: 'up' | 'down' = 'up';
  private currentFloor: number = 1;
  private requests: Set<number> = new Set();
  
  getNextStop(): number | null {
    if (this.requests.size === 0) return null;
    
    const sorted = [...this.requests].sort((a, b) => a - b);
    
    if (this.direction === 'up') {
      // Find closest floor above current
      const above = sorted.filter(f => f > this.currentFloor);
      if (above.length > 0) {
        return above[0]; // Closest above
      }
      // No more above, reverse direction
      this.direction = 'down';
      return this.getNextStop();
    } else {
      // Find closest floor below current
      const below = sorted.filter(f => f < this.currentFloor);
      if (below.length > 0) {
        return below[below.length - 1]; // Closest below
      }
      // No more below, reverse direction
      this.direction = 'up';
      return this.getNextStop();
    }
  }
  
  addRequest(floor: number): void {
    this.requests.add(floor);
  }
  
  arriveAt(floor: number): void {
    this.currentFloor = floor;
    this.requests.delete(floor);
  }
}
```

### Multi-Car Coordination

For multiple cars in one shaft, add **zone assignment**:

```typescript
interface CarZone {
  carId: string;
  primaryFloors: [number, number]; // Preferred range
  canServe: (floor: number) => boolean;
}

function assignRequestToCar(
  request: { floor: number; direction: 'up' | 'down' },
  cars: ElevatorCar[],
  zones: CarZone[]
): string | null {
  // Priority 1: Idle car in zone
  const idleInZone = cars.find(c => 
    c.state === 'idle' && 
    zones.find(z => z.carId === c.id)?.canServe(request.floor)
  );
  if (idleInZone) return idleInZone.id;
  
  // Priority 2: Moving car that will pass this floor
  const passingCar = cars.find(c =>
    c.state === 'moving' &&
    c.direction === request.direction &&
    willPassFloor(c, request.floor)
  );
  if (passingCar) return passingCar.id;
  
  // Priority 3: Any idle car
  const anyIdle = cars.find(c => c.state === 'idle');
  if (anyIdle) return anyIdle.id;
  
  // Priority 4: Queue for least loaded car
  return cars.reduce((a, b) => 
    a.requests.size < b.requests.size ? a : b
  ).id;
}
```

---

## 4. Pathfinding Strategy

### What's Appropriate for SimTower?

SimTower pathfinding is **NOT** classic 2D grid pathfinding. It's **hierarchical transport routing**.

```
People don't navigate tiles.
They navigate BETWEEN facilities via TRANSPORT.

┌─────────────────────────────────────────────────────────────┐
│                         Floor 10                             │
│   [Office A]───walk────[Elevator]───walk────[Restaurant]    │
│                            │                                 │
│                            │ ride                            │
│                            ▼                                 │
│                      ┌──────────┐                           │
│  Floor 1:            │ Lobby    │                           │
│                      └──────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

### Recommended: Transport Graph + A* on Floors

```typescript
/**
 * Two-level pathfinding:
 * 1. Transport Graph - Which elevators/stairs to take
 * 2. Floor Walk - Tile-to-tile within a floor
 */

// Level 1: Transport Graph
interface TransportNode {
  type: 'lobby' | 'elevator' | 'stairs' | 'escalator' | 'building';
  floor: number;
  tile: number;
  connections: TransportEdge[];
}

interface TransportEdge {
  target: TransportNode;
  cost: number; // Time in seconds
  transportId?: string;
}

function findRoute(
  from: { floor: number; tile: number },
  to: { floor: number; tile: number },
  graph: TransportNode[]
): Route {
  // Find nearest transport nodes to start/end
  const startNodes = findNearbyTransport(from, graph);
  const endNodes = findNearbyTransport(to, graph);
  
  // A* through transport graph
  let bestRoute: Route | null = null;
  
  for (const start of startNodes) {
    for (const end of endNodes) {
      const route = astar(start, end, graph);
      if (route && (!bestRoute || route.cost < bestRoute.cost)) {
        // Check transfer limit (max 1 elevator transfer in SimTower)
        if (countElevatorTransfers(route) <= 1) {
          bestRoute = route;
        }
      }
    }
  }
  
  return bestRoute;
}

// Level 2: Floor Walking (simple - just horizontal movement)
function walkOnFloor(
  fromTile: number,
  toTile: number,
  floor: number
): WalkSegment {
  // SimTower floors are linear - just walk left or right
  // No obstacles within a floor (buildings are solid blocks)
  return {
    type: 'walk',
    floor,
    fromTile,
    toTile,
    cost: Math.abs(toTile - fromTile) * WALK_TIME_PER_TILE
  };
}
```

### Route Caching

Most routes are **repeated** (Office → Lobby → Restaurant → Lobby → Office):

```typescript
class RouteCache {
  private cache: Map<string, CachedRoute> = new Map();
  private maxSize = 1000;
  
  private makeKey(from: Location, to: Location): string {
    return `${from.floor},${from.tile}:${to.floor},${to.tile}`;
  }
  
  get(from: Location, to: Location): Route | undefined {
    const key = this.makeKey(from, to);
    const cached = this.cache.get(key);
    
    if (cached && cached.computedAt > Date.now() - 60000) {
      // Valid for 1 minute (elevator availability may change)
      return cached.route;
    }
    return undefined;
  }
  
  set(from: Location, to: Location, route: Route): void {
    if (this.cache.size >= this.maxSize) {
      // LRU eviction
      const oldest = [...this.cache.entries()]
        .sort((a, b) => a[1].computedAt - b[1].computedAt)[0];
      this.cache.delete(oldest[0]);
    }
    
    this.cache.set(this.makeKey(from, to), {
      route,
      computedAt: Date.now()
    });
  }
}
```

---

## 5. Entity Component System: Should We Use ECS for People?

### Analysis

**Pros of ECS:**
- Cache-friendly iteration (SoA layout)
- Easy to add/remove components
- Parallelizable systems
- Clean separation of data and logic

**Cons of ECS:**
- Overkill for SimTower's simple entities
- Adds conceptual overhead
- TypeScript doesn't have native ECS primitives

### Recommendation: **Partial SoA, Not Full ECS**

SimTower people are **homogeneous** - they all have the same components. A full ECS (with component masks, entity archetypes, etc.) is overkill.

Instead, use **Struct of Arrays** directly:

```typescript
/**
 * Population data in SoA format
 * ~75KB total for 15,000 people (hot data)
 */
class PopulationManager {
  // Core position data - accessed every frame
  readonly floors: Int8Array;      // 15,000 × 1 byte
  readonly tiles: Uint16Array;     // 15,000 × 2 bytes
  
  // State data - accessed every tick
  readonly states: Uint8Array;     // 15,000 × 1 byte (PersonState enum)
  readonly stress: Uint8Array;     // 15,000 × 1 byte (0-100)
  
  // Rarely accessed cold data - can be separate objects
  readonly metadata: PersonMetadata[]; // name, type, schedule, etc.
  
  private freeList: number[] = [];
  private count: number = 0;
  private capacity: number;
  
  constructor(initialCapacity: number = 1000) {
    this.capacity = initialCapacity;
    this.floors = new Int8Array(initialCapacity);
    this.tiles = new Uint16Array(initialCapacity);
    this.states = new Uint8Array(initialCapacity);
    this.stress = new Uint8Array(initialCapacity);
    this.metadata = new Array(initialCapacity);
  }
  
  spawn(floor: number, tile: number, type: PersonType): number {
    let index: number;
    
    if (this.freeList.length > 0) {
      index = this.freeList.pop()!;
    } else {
      if (this.count >= this.capacity) {
        this.grow();
      }
      index = this.count++;
    }
    
    this.floors[index] = floor;
    this.tiles[index] = tile;
    this.states[index] = PersonState.IDLE;
    this.stress[index] = 0;
    this.metadata[index] = { type, /* ... */ };
    
    return index;
  }
  
  despawn(index: number): void {
    this.states[index] = PersonState.DESPAWNED;
    this.freeList.push(index);
  }
  
  private grow(): void {
    const newCapacity = this.capacity * 2;
    
    const newFloors = new Int8Array(newCapacity);
    newFloors.set(this.floors);
    (this as any).floors = newFloors;
    
    // ... repeat for other arrays
    
    this.capacity = newCapacity;
  }
  
  // Iteration helper for systems
  *active(): Generator<number> {
    for (let i = 0; i < this.count; i++) {
      if (this.states[i] !== PersonState.DESPAWNED) {
        yield i;
      }
    }
  }
}
```

### System Example: Stress Update

```typescript
function updateStress(
  population: PopulationManager,
  elevatorQueues: Map<number, number>, // floor → wait time
  deltaTime: number
): void {
  for (const i of population.active()) {
    const state = population.states[i];
    const floor = population.floors[i];
    
    if (state === PersonState.WAITING_FOR_ELEVATOR) {
      // Accumulate stress while waiting
      const waitTime = elevatorQueues.get(floor) ?? 0;
      if (waitTime > 120) { // 2 minutes
        population.stress[i] = Math.min(100, 
          population.stress[i] + STRESS_SOURCES.ELEVATOR_WAIT * deltaTime
        );
      }
    } else if (state === PersonState.AT_DESTINATION) {
      // Decay stress at destination
      population.stress[i] = Math.max(0, 
        population.stress[i] - STRESS_DECAY_RATE * deltaTime
      );
    }
  }
}
```

---

## 6. Web Workers: When Exactly Should Simulation Move Off Main Thread?

### Decision Tree

```
Is render framerate dropping below 55fps?
├── No: Keep simulation on main thread (simpler)
└── Yes: Profile to find cause
         ├── GPU bound (draw calls, overdraw): Optimize renderer
         └── CPU bound (simulation): Move to worker
             └── Is simulation taking >12ms/frame?
                 ├── No: Optimize algorithm first
                 └── Yes: MOVE TO WORKER
```

### Concrete Thresholds

| Population | Elevator Cars | Recommended |
|------------|---------------|-------------|
| < 500 | < 16 | Main thread |
| 500-2000 | 16-48 | Main thread with optimization |
| 2000-5000 | 48-96 | Consider worker |
| 5000+ | 96+ | **Worker required** |

### Worker Communication Protocol

```typescript
// Main → Worker
interface SimulationCommand {
  type: 'TICK' | 'SPAWN_PERSON' | 'ELEVATOR_REQUEST' | 'SYNC_STATE';
  payload: unknown;
  tick: number;
}

// Worker → Main (using Transferable for zero-copy)
interface SimulationResult {
  type: 'TICK_COMPLETE' | 'EVENT';
  tick: number;
  
  // These are SharedArrayBuffer views - no copying!
  positions?: { buffer: SharedArrayBuffer; length: number };
  states?: { buffer: SharedArrayBuffer; length: number };
  
  // Events are small, copy is fine
  events?: AppEvent[];
}

// Worker implementation
class SimulationWorker {
  private positionBuffer: SharedArrayBuffer;
  private stateBuffer: SharedArrayBuffer;
  
  onMessage(cmd: SimulationCommand): void {
    switch (cmd.type) {
      case 'TICK':
        this.tick(cmd.payload.deltaTime);
        // Write directly to SharedArrayBuffer - main thread sees it
        postMessage({ type: 'TICK_COMPLETE', tick: cmd.tick });
        break;
    }
  }
}
```

### SharedArrayBuffer Setup

```typescript
// Main thread setup
const POPULATION_CAPACITY = 20000;

const positionBuffer = new SharedArrayBuffer(POPULATION_CAPACITY * 4); // 2 bytes floor + 2 bytes tile
const stateBuffer = new SharedArrayBuffer(POPULATION_CAPACITY * 2);    // 1 byte state + 1 byte stress

const worker = new Worker('simulation.worker.ts');
worker.postMessage({ 
  type: 'INIT', 
  positionBuffer, 
  stateBuffer,
  capacity: POPULATION_CAPACITY 
});

// Renderer reads directly from SharedArrayBuffer
const positions = new Int16Array(positionBuffer);
const states = new Uint8Array(stateBuffer);

function renderPeople(): void {
  for (let i = 0; i < populationCount; i++) {
    const floor = positions[i * 2];
    const tile = positions[i * 2 + 1];
    const state = states[i * 2];
    const stress = states[i * 2 + 1];
    
    // Render sprite at position with stress color
    renderPerson(floor, tile, state, stress);
  }
}
```

---

## 7. Memory Management: Object Pooling for 15K People

### What Needs Pooling

| Object | Creation Rate | Pool? |
|--------|--------------|-------|
| Person instances | 10-50/day | ✅ Yes (SoA handles this) |
| Route objects | 100s/minute | ✅ **Critical** |
| Path segments | 1000s/minute | ✅ **Critical** |
| Event objects | 1000s/tick | ✅ Yes |
| Sprites | On camera move | ✅ Yes |

### Route Object Pool

```typescript
class RoutePool {
  private pool: Route[] = [];
  private maxSize = 500;
  
  acquire(): Route {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return {
      segments: [],
      currentIndex: 0,
      totalTime: 0,
      transferCount: 0
    };
  }
  
  release(route: Route): void {
    if (this.pool.length < this.maxSize) {
      // Reset for reuse
      route.segments.length = 0;
      route.currentIndex = 0;
      route.totalTime = 0;
      route.transferCount = 0;
      this.pool.push(route);
    }
    // Else: let GC collect it
  }
}

class RouteSegmentPool {
  private walkPool: WalkSegment[] = [];
  private elevatorPool: ElevatorSegment[] = [];
  
  acquireWalk(): WalkSegment {
    return this.walkPool.pop() ?? { type: 'walk', floor: 0, from: 0, to: 0 };
  }
  
  acquireElevator(): ElevatorSegment {
    return this.elevatorPool.pop() ?? { type: 'elevator', shaftId: '', from: 0, to: 0 };
  }
  
  releaseSegments(segments: RouteSegment[]): void {
    for (const seg of segments) {
      if (seg.type === 'walk') {
        this.walkPool.push(seg);
      } else if (seg.type === 'elevator') {
        this.elevatorPool.push(seg);
      }
    }
  }
}
```

### Sprite Pool for People

```typescript
class PersonSpritePool {
  private pool: PIXI.Sprite[] = [];
  private texture: PIXI.Texture;
  private activeSprites: Map<number, PIXI.Sprite> = new Map();
  
  constructor(texture: PIXI.Texture) {
    this.texture = texture;
  }
  
  getSprite(personIndex: number): PIXI.Sprite {
    let sprite = this.activeSprites.get(personIndex);
    if (!sprite) {
      sprite = this.pool.pop() ?? new PIXI.Sprite(this.texture);
      sprite.visible = true;
      this.activeSprites.set(personIndex, sprite);
    }
    return sprite;
  }
  
  releaseSprite(personIndex: number): void {
    const sprite = this.activeSprites.get(personIndex);
    if (sprite) {
      sprite.visible = false;
      this.pool.push(sprite);
      this.activeSprites.delete(personIndex);
    }
  }
  
  // Called when person leaves visible area
  cullOffscreen(visibleBounds: Rect): void {
    for (const [index, sprite] of this.activeSprites) {
      if (!isInBounds(sprite.position, visibleBounds)) {
        this.releaseSprite(index);
      }
    }
  }
}
```

---

## 8. State Synchronization: Sim State ↔ Render State

### The Problem

Simulation runs at 10 Hz (100ms ticks). Rendering at 60 Hz. How to interpolate?

### Solution: Double-Buffered Snapshots

```typescript
interface RenderSnapshot {
  tick: number;
  timestamp: number;
  
  // Position data for interpolation
  personPositions: Float32Array;  // [x0, y0, x1, y1, ...]
  personStates: Uint8Array;
  
  // Building states
  elevatorFloors: Float32Array;   // [floor0, progress0, floor1, progress1, ...]
  elevatorDoors: Uint8Array;      // Door state enum
}

class StateSynchronizer {
  private current: RenderSnapshot;
  private previous: RenderSnapshot;
  private interpolationAlpha: number = 0;
  
  // Called by simulation (10 Hz)
  pushSnapshot(snapshot: RenderSnapshot): void {
    this.previous = this.current;
    this.current = snapshot;
  }
  
  // Called by renderer (60 Hz)
  getInterpolated(renderTime: number): InterpolatedState {
    const tickDuration = 100; // ms
    const timeSinceSnapshot = renderTime - this.current.timestamp;
    this.interpolationAlpha = Math.min(1, timeSinceSnapshot / tickDuration);
    
    return {
      personPositions: this.interpolatePositions(),
      elevatorFloors: this.interpolateElevators(),
      alpha: this.interpolationAlpha
    };
  }
  
  private interpolatePositions(): Float32Array {
    const result = new Float32Array(this.current.personPositions.length);
    const alpha = this.interpolationAlpha;
    
    for (let i = 0; i < result.length; i++) {
      const prev = this.previous?.personPositions[i] ?? this.current.personPositions[i];
      const curr = this.current.personPositions[i];
      result[i] = prev + (curr - prev) * alpha;
    }
    
    return result;
  }
  
  private interpolateElevators(): Float32Array {
    // Same interpolation for elevator positions
    // ...
  }
}
```

### Visual State Machine Blending

For discrete states (walking → waiting), use animation blending:

```typescript
function getPersonSprite(
  state: PersonState,
  previousState: PersonState,
  transitionProgress: number, // 0-1 since state change
  stress: number
): PIXI.Texture {
  const BLEND_DURATION = 0.2; // seconds
  
  if (transitionProgress < BLEND_DURATION) {
    // Cross-fade between states
    const blendAlpha = transitionProgress / BLEND_DURATION;
    // Return texture with alpha blend indicator
  }
  
  // Normal state texture
  return getTextureForState(state, stress);
}
```

---

## 9. Code Reuse: Lessons from towerz and OpenSkyScraper

### From towerz (JavaScript SimTower Clone)

**✅ What to Copy:**
1. **SCAN algorithm implementation** (SystemsManager.js) - Clean, working elevator dispatch
2. **Person state machine** (SimulationManager.js) - Simple but effective
3. **Stress visualization** - Color thresholds verified correct

**❌ What to Avoid:**
1. Global mutable state everywhere
2. No separation of concerns
3. `setTimeout` for game timing (use requestAnimationFrame)

### From OpenSkyScraper (C++ SimTower Clone)

**✅ What to Copy:**
1. **Elevator physics** (Car.cpp) - Beautiful kinematic equations:
   ```cpp
   // Smooth acceleration/deceleration profile
   double q = 1.0 / 3;  // Accel in first third, cruise, decel in last third
   double v = std::min(vmax, sqrt(2 * q * a * s));
   ```
2. **Queue urgency system** (Elevator.cpp) - `getMostUrgentQueue()` prioritizes long waits
3. **Door state machine** - Clear states: closed → opening → open → closing
4. **Mount/unmount timing** - `kMountPeriod = 0.05s` per person

**✅ Port This Algorithm:**

```typescript
/**
 * Smooth elevator movement with proper physics
 * Ported from OpenSkyScraper Car.cpp
 */
function calculateElevatorPosition(
  startFloor: number,
  destFloor: number,
  journeyTime: number,  // seconds since start
  maxAccel: number = 7.5,
  maxSpeed: number = 10.0
): { floor: number; phase: 'accel' | 'cruise' | 'decel' } {
  const distance = Math.abs(destFloor - startFloor);
  const direction = Math.sign(destFloor - startFloor);
  
  // q = fraction of distance for acceleration (1/3 each for accel/cruise/decel)
  const q = 1 / 3;
  
  // Maximum achievable speed for this distance
  const achievableSpeed = Math.min(maxSpeed, Math.sqrt(2 * q * maxAccel * distance));
  
  // Time constants
  const t0 = achievableSpeed / (2 * maxAccel);
  const t1 = (distance / achievableSpeed) + 2 * t0;
  const tAccel = achievableSpeed / maxAccel;
  const tDecel = t1 - tAccel;
  
  // Determine phase and position
  let phase: 'accel' | 'cruise' | 'decel';
  let d: number;
  
  if (journeyTime <= tAccel) {
    phase = 'accel';
    d = 0.5 * maxAccel * journeyTime * journeyTime;
  } else if (journeyTime <= tDecel) {
    phase = 'cruise';
    d = achievableSpeed * (journeyTime - t0);
  } else if (journeyTime < t1) {
    phase = 'decel';
    const remaining = t1 - journeyTime;
    d = distance - 0.5 * maxAccel * remaining * remaining;
  } else {
    phase = 'decel';
    d = distance; // Arrived
  }
  
  return {
    floor: startFloor + d * direction,
    phase
  };
}
```

---

## 10. Technical Debt: What's Missing That Will Bite Later?

### Critical Missing Pieces

| Issue | Impact | Fix Effort |
|-------|--------|------------|
| **No error boundaries** | Game crashes on any exception | 1 day |
| **No input validation** | Corrupt state, exploits | 2 days |
| **Building refund bug** | Wrong refund amounts | 30 min |
| **No spatial indexing** | O(n) queries kill perf | 2 days |
| **Singleton EventBus** | Testing nightmare | 1 day |
| **No state rollback** | Can't undo/debug | 3 days |

### The Refund Bug (Fix Now)

```typescript
// Tower.ts line 174 - WRONG
const refund = Math.floor(building.incomePerQuarter * 2);

// CORRECT
import { BUILDING_CONFIGS } from '@/interfaces';
const config = BUILDING_CONFIGS[building.type];
const refund = Math.floor(config.cost * 0.5);
```

### Input Validation Layer (Add This)

```typescript
// Create validation.ts
export class ValidationError extends Error {
  constructor(
    public readonly field: string,
    public readonly value: unknown,
    public readonly constraint: string
  ) {
    super(`Invalid ${field}: ${JSON.stringify(value)} - ${constraint}`);
  }
}

export function validateFloorLevel(level: number): void {
  if (!Number.isInteger(level)) {
    throw new ValidationError('floor', level, 'must be integer');
  }
  if (level < -10 || level > 100) {
    throw new ValidationError('floor', level, 'must be between -10 and 100');
  }
}

export function validateTile(tile: number): void {
  if (!Number.isInteger(tile)) {
    throw new ValidationError('tile', tile, 'must be integer');
  }
  if (tile < 0 || tile >= 375) {
    throw new ValidationError('tile', tile, 'must be between 0 and 374');
  }
}

export function validateBuilding(building: Building): void {
  validateFloorLevel(building.position.floor);
  validateTile(building.position.startTile);
  validateTile(building.position.endTile);
  
  if (building.position.startTile > building.position.endTile) {
    throw new ValidationError('position', building.position, 'startTile must be <= endTile');
  }
  
  const config = BUILDING_CONFIGS[building.type];
  if (!config) {
    throw new ValidationError('type', building.type, 'unknown building type');
  }
}
```

### Spatial Index for People

```typescript
/**
 * Spatial hash for O(1) floor-based queries
 */
class FloorIndex {
  private byFloor: Map<number, Set<number>> = new Map();
  
  add(personIndex: number, floor: number): void {
    if (!this.byFloor.has(floor)) {
      this.byFloor.set(floor, new Set());
    }
    this.byFloor.get(floor)!.add(personIndex);
  }
  
  remove(personIndex: number, floor: number): void {
    this.byFloor.get(floor)?.delete(personIndex);
  }
  
  move(personIndex: number, fromFloor: number, toFloor: number): void {
    this.remove(personIndex, fromFloor);
    this.add(personIndex, toFloor);
  }
  
  getPeopleOnFloor(floor: number): ReadonlySet<number> {
    return this.byFloor.get(floor) ?? new Set();
  }
  
  getCountOnFloor(floor: number): number {
    return this.byFloor.get(floor)?.size ?? 0;
  }
}
```

---

## 11. Testing Strategy: Deterministic Elevator Scheduling Tests

### The Challenge

Elevator scheduling is **time-dependent** and involves:
- Multiple cars with independent state
- Queue dynamics
- Stochastic people arrivals

How to test deterministically?

### Solution: Seeded Simulation + Recorded Scenarios

```typescript
// test/elevator.test.ts
import { describe, it, expect, beforeEach } from 'vitest';

describe('Elevator Scheduler', () => {
  let scheduler: ElevatorScheduler;
  let clock: MockClock;
  
  beforeEach(() => {
    clock = new MockClock();
    scheduler = new ElevatorScheduler({ clock });
  });
  
  describe('LOOK Algorithm', () => {
    it('serves floors in current direction before reversing', () => {
      const car = scheduler.addCar({ startFloor: 5 });
      
      // Add requests in this order: 3, 7, 2, 8
      scheduler.addRequest(3, 'down');
      scheduler.addRequest(7, 'up');
      scheduler.addRequest(2, 'down');
      scheduler.addRequest(8, 'up');
      
      // Car should go: 5 → 7 → 8 → 3 → 2 (up first, then down)
      car.direction = 'up';
      
      expect(scheduler.getNextStop(car)).toBe(7);
      car.currentFloor = 7;
      
      expect(scheduler.getNextStop(car)).toBe(8);
      car.currentFloor = 8;
      
      // Now reverse
      expect(scheduler.getNextStop(car)).toBe(3);
      car.currentFloor = 3;
      
      expect(scheduler.getNextStop(car)).toBe(2);
    });
    
    it('prioritizes passengers over new requests in same direction', () => {
      const car = scheduler.addCar({ startFloor: 1 });
      car.addPassenger({ destination: 10 });
      car.direction = 'up';
      
      // New request at floor 5
      scheduler.addRequest(5, 'up');
      
      // Should stop at 5 on the way to 10
      expect(scheduler.getNextStop(car)).toBe(5);
    });
  });
  
  describe('Wait Time Stress', () => {
    it('accumulates stress after 2 minutes of waiting', () => {
      const person = population.spawn(5, 100, 'worker');
      
      // Start waiting for elevator
      population.states[person] = PersonState.WAITING_FOR_ELEVATOR;
      const startTick = clock.tick;
      
      // Advance 1 minute - no stress yet
      clock.advance(60_000);
      updateStress(population, new Map([[5, 60]]), 1);
      expect(population.stress[person]).toBe(0);
      
      // Advance another minute - now stress accumulates
      clock.advance(60_000);
      updateStress(population, new Map([[5, 120]]), 1);
      expect(population.stress[person]).toBeGreaterThan(0);
    });
  });
  
  describe('Multi-Car Coordination', () => {
    it('assigns nearest idle car to request', () => {
      const car1 = scheduler.addCar({ startFloor: 1 });
      const car2 = scheduler.addCar({ startFloor: 10 });
      
      // Request at floor 8
      const assigned = scheduler.assignRequest({ floor: 8, direction: 'up' });
      
      // Car 2 is closer
      expect(assigned).toBe(car2.id);
    });
    
    it('assigns moving car if it will pass the floor', () => {
      const car1 = scheduler.addCar({ startFloor: 1 });
      car1.state = 'moving';
      car1.direction = 'up';
      car1.destination = 10;
      
      const car2 = scheduler.addCar({ startFloor: 8 });
      car2.state = 'idle';
      
      // Request at floor 5 going up
      const assigned = scheduler.assignRequest({ floor: 5, direction: 'up' });
      
      // Car 1 will pass floor 5 on the way to 10
      expect(assigned).toBe(car1.id);
    });
  });
});

// Scenario recording for regression tests
describe('Recorded Scenarios', () => {
  it('replays morning rush hour scenario', async () => {
    const scenario = await loadScenario('morning_rush_10_floors_100_workers');
    
    const simulation = new Simulation({
      seed: scenario.seed,
      clock: new MockClock()
    });
    
    // Replay inputs
    for (const event of scenario.inputs) {
      simulation.processInput(event);
      simulation.tick();
    }
    
    // Assert final state matches recording
    expect(simulation.getAverageWaitTime()).toBeCloseTo(scenario.expectedWaitTime, 0.1);
    expect(simulation.getMoveoutCount()).toBe(scenario.expectedMoveouts);
  });
});

// Mock clock for deterministic time
class MockClock {
  private _tick: number = 0;
  private _time: number = 0;
  
  get tick(): number { return this._tick; }
  get time(): number { return this._time; }
  
  advance(ms: number): void {
    this._time += ms;
    this._tick += Math.floor(ms / 100); // 100ms per tick
  }
  
  advanceTicks(ticks: number): void {
    this._tick += ticks;
    this._time += ticks * 100;
  }
}
```

### Integration Test: Full Day Cycle

```typescript
describe('Full Day Integration', () => {
  it('simulates 24-hour cycle without errors', () => {
    const sim = createTestSimulation({
      offices: 10,
      condos: 5,
      elevatorCars: 4,
      population: 100
    });
    
    // Simulate 24 game hours (1440 game minutes = 14,400 ticks at 100ms)
    for (let tick = 0; tick < 14_400; tick++) {
      expect(() => sim.tick()).not.toThrow();
    }
    
    // Verify state consistency
    expect(sim.getPopulation()).toBeGreaterThan(0);
    expect(sim.getPopulation()).toBeLessThanOrEqual(100);
    expect(sim.getFunds()).toBeGreaterThan(0); // Didn't go bankrupt
  });
  
  it('handles rush hour without cascade failures', () => {
    const sim = createTestSimulation({
      offices: 20,
      elevatorCars: 4,
      population: 200
    });
    
    // Skip to morning rush (8 AM)
    sim.setTime(8, 0);
    
    // Simulate rush hour (8-9 AM)
    for (let minute = 0; minute < 60; minute++) {
      for (let tick = 0; tick < 10; tick++) {
        sim.tick();
      }
    }
    
    // Average wait should be under 3 minutes (180 seconds)
    expect(sim.getAverageWaitTime()).toBeLessThan(180);
    
    // No mass moveouts
    expect(sim.getMoveoutCount()).toBeLessThan(5);
  });
});
```

### Property-Based Testing

```typescript
import { fc } from 'fast-check';

describe('Property-Based Elevator Tests', () => {
  it('never leaves a passenger stranded', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        floor: fc.integer({ min: 1, max: 30 }),
        destination: fc.integer({ min: 1, max: 30 })
      }), { minLength: 1, maxLength: 50 }),
      (requests) => {
        const sim = createTestSimulation({ elevatorCars: 2, floors: 30 });
        
        // Add all requests
        for (const req of requests) {
          if (req.floor !== req.destination) {
            sim.addElevatorRequest(req.floor, req.destination);
          }
        }
        
        // Simulate for 10 minutes
        for (let i = 0; i < 6000; i++) {
          sim.tick();
        }
        
        // All requests should be served
        return sim.getPendingRequests() === 0;
      }
    ));
  });
  
  it('stress never exceeds 100', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 1000 }),
      fc.integer({ min: 1, max: 100 }),
      (population, elevatorCars) => {
        const sim = createTestSimulation({ population, elevatorCars });
        
        // Simulate full day
        for (let i = 0; i < 14_400; i++) {
          sim.tick();
          
          // Check all stress levels
          for (const person of sim.getPeople()) {
            if (person.stress > 100) {
              return false;
            }
          }
        }
        
        return true;
      }
    ));
  });
});
```

---

## Appendix: Critical Pseudocode Summary

### A. Complete Elevator Car State Machine

```typescript
enum CarState {
  IDLE,
  MOVING,
  OPENING_DOORS,
  LOADING,
  CLOSING_DOORS
}

class ElevatorCar {
  state: CarState = CarState.IDLE;
  currentFloor: number = 1;
  floorProgress: number = 0; // 0-1 between floors
  direction: 'up' | 'down' | 'none' = 'none';
  
  passengers: Set<number> = new Set(); // Person indices
  destinations: Set<number> = new Set(); // Floors to visit
  
  doorProgress: number = 0; // 0-1 for animation
  loadTimer: number = 0;
  
  tick(deltaTime: number, scheduler: ElevatorScheduler): void {
    switch (this.state) {
      case CarState.IDLE:
        const nextFloor = scheduler.getNextStop(this);
        if (nextFloor !== null) {
          this.destinations.add(nextFloor);
          this.direction = nextFloor > this.currentFloor ? 'up' : 'down';
          this.state = CarState.MOVING;
        }
        break;
        
      case CarState.MOVING:
        this.moveTowardsDestination(deltaTime);
        
        // Check if we should stop here
        if (Math.abs(this.floorProgress) < 0.01) {
          const floor = Math.round(this.currentFloor + this.floorProgress);
          if (this.destinations.has(floor) || scheduler.hasQueueAt(floor, this.direction)) {
            this.currentFloor = floor;
            this.floorProgress = 0;
            this.state = CarState.OPENING_DOORS;
          }
        }
        break;
        
      case CarState.OPENING_DOORS:
        this.doorProgress += deltaTime / DOOR_OPEN_TIME;
        if (this.doorProgress >= 1) {
          this.doorProgress = 1;
          this.state = CarState.LOADING;
          this.loadTimer = 0;
        }
        break;
        
      case CarState.LOADING:
        // Unload passengers
        for (const personIdx of this.passengers) {
          if (getPersonDestination(personIdx) === this.currentFloor) {
            this.passengers.delete(personIdx);
            notifyArrived(personIdx);
            this.loadTimer = PERSON_EXIT_TIME; // Reset timer
          }
        }
        
        // Load waiting passengers
        const queue = scheduler.getQueue(this.currentFloor, this.direction);
        while (!this.isFull() && queue.length > 0) {
          const personIdx = queue.shift()!;
          this.passengers.add(personIdx);
          this.destinations.add(getPersonDestination(personIdx));
          this.loadTimer = PERSON_ENTER_TIME;
        }
        
        this.loadTimer -= deltaTime;
        if (this.loadTimer <= 0) {
          this.destinations.delete(this.currentFloor);
          this.state = CarState.CLOSING_DOORS;
        }
        break;
        
      case CarState.CLOSING_DOORS:
        this.doorProgress -= deltaTime / DOOR_CLOSE_TIME;
        if (this.doorProgress <= 0) {
          this.doorProgress = 0;
          
          if (this.destinations.size > 0 || this.passengers.size > 0) {
            this.state = CarState.MOVING;
          } else {
            this.direction = 'none';
            this.state = CarState.IDLE;
          }
        }
        break;
    }
  }
  
  private moveTowardsDestination(deltaTime: number): void {
    const nextDest = this.getNextDestination();
    if (nextDest === null) return;
    
    const physics = calculateElevatorPosition(
      this.currentFloor,
      nextDest,
      this.journeyTime,
      MAX_ACCEL,
      MAX_SPEED
    );
    
    this.currentFloor = Math.floor(physics.floor);
    this.floorProgress = physics.floor - this.currentFloor;
    this.journeyTime += deltaTime;
  }
  
  isFull(): boolean {
    return this.passengers.size >= MAX_CAPACITY;
  }
}
```

### B. Route Finding with Transfer Limit

```typescript
function findRoute(
  from: { floor: number; tile: number },
  to: { floor: number; tile: number },
  tower: Tower
): Route | null {
  // Same floor - just walk
  if (from.floor === to.floor) {
    return {
      segments: [{
        type: 'walk',
        floor: from.floor,
        fromTile: from.tile,
        toTile: to.tile
      }],
      totalTime: Math.abs(to.tile - from.tile) * WALK_TIME_PER_TILE,
      transferCount: 0
    };
  }
  
  // Different floors - need transport
  const transports = findTransportOptions(from.floor, to.floor, tower);
  
  let bestRoute: Route | null = null;
  
  for (const option of transports) {
    const route = buildRoute(from, to, option);
    
    // Enforce transfer limit
    if (route.transferCount > 1) continue;
    
    if (!bestRoute || route.totalTime < bestRoute.totalTime) {
      bestRoute = route;
    }
  }
  
  return bestRoute;
}

function findTransportOptions(
  fromFloor: number,
  toFloor: number,
  tower: Tower
): TransportOption[] {
  const options: TransportOption[] = [];
  
  // Direct elevator
  for (const shaft of tower.elevators) {
    if (shaft.servesFloor(fromFloor) && shaft.servesFloor(toFloor)) {
      options.push({
        type: 'direct',
        shafts: [shaft],
        estimatedTime: estimateElevatorTime(shaft, fromFloor, toFloor)
      });
    }
  }
  
  // Express + Local via Sky Lobby
  const skyLobbies = tower.getSkyLobbies();
  for (const skyLobby of skyLobbies) {
    const expressDown = findExpressToLobby(tower, fromFloor, skyLobby);
    const localUp = findLocalFromLobby(tower, skyLobby, toFloor);
    
    if (expressDown && localUp) {
      options.push({
        type: 'transfer',
        shafts: [expressDown, localUp],
        transferFloor: skyLobby,
        estimatedTime: 
          estimateElevatorTime(expressDown, fromFloor, skyLobby) +
          TRANSFER_WAIT_TIME +
          estimateElevatorTime(localUp, skyLobby, toFloor)
      });
    }
  }
  
  // Stairs (only for short distances)
  if (Math.abs(toFloor - fromFloor) <= 4) {
    const stairs = findStairs(tower, fromFloor, toFloor);
    if (stairs) {
      options.push({
        type: 'stairs',
        stairs,
        estimatedTime: Math.abs(toFloor - fromFloor) * STAIR_TIME_PER_FLOOR
      });
    }
  }
  
  return options;
}
```

---

## Conclusion

OpenTower's foundation is **architecturally sound** for a SimTower clone. The interface-first design prevents circular dependencies, the fixed-timestep game loop is correct, and PixiJS is an appropriate renderer.

**Critical path to 15K entities:**

1. **Implement SoA population manager** (Week 1)
2. **Add spatial indexing** (Week 1)
3. **Port elevator physics from OpenSkyScraper** (Week 2)
4. **Implement LOOK scheduler** (Week 2)
5. **Build transport graph pathfinding** (Week 3)
6. **Add route caching** (Week 3)
7. **Move simulation to worker at 2K+ population** (Week 4)
8. **Profile and optimize** (Ongoing)

The code from towerz and OpenSkyScraper provides battle-tested algorithms. **Don't reinvent** - port and adapt.

**Final recommendation:** ✅ **Proceed**, but prioritize the items above before expanding building types. The foundation will hold, but it needs these reinforcements first.

---

*"A game engine is not an architecture diagram. It's 10,000 edge cases you didn't anticipate."*
