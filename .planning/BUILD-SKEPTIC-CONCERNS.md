# OpenTower Build Skeptic's Concerns
## Devil's Advocate Analysis - Why We Should NOT Start Yet

*Date: 2025-01-30*  
*Role: Build Skeptic (Devil's Advocate)*  
*Purpose: Challenge every assumption before committing to a multi-week autonomous build*

---

## Executive Summary: RED FLAGS 🚩

| Severity | Count | Risk |
|----------|-------|------|
| **Critical** | 3 | Project failure likely |
| **High** | 5 | Major delays/rework |
| **Medium** | 6 | Scope creep, friction |
| **Low** | 4 | Minor annoyances |

**Honest Assessment:** The plan is ambitious and well-documented, but contains **optimistic assumptions disguised as facts**. Starting the full build now risks:
- Wasted effort on code that won't integrate
- Motivation collapse when MVP looks terrible
- 5-week timeline becoming 5 months

---

## 🔴 CRITICAL CONCERNS (Severity: Project-Ending)

### C1: Elevator Scheduler Complexity is Severely Underestimated

**The Claim:** "Reference OpenSkyscraper, implement clean TypeScript"

**The Reality:**
- OpenSkyscraper's elevator system is **865 lines of battle-tested C++** across 3 files
- `Car.cpp` alone has 350 lines handling: acceleration curves, passenger loading, door timing, state transitions
- `Elevator.cpp` has complex dispatch logic spanning 377 lines
- This code took **years** to debug in OpenSkyscraper (project started ~2011)

**Evidence:**
```cpp
// From OpenSkyscraper Car.cpp - just ONE method
void Car::advance(double dt) {
  // 50+ lines of acceleration/deceleration physics
  // State machine with 6+ states
  // Edge cases: direction changes, queue priorities, capacity limits
}
```

**What We're Actually Facing:**
- SCAN/LOOK elevator algorithms require careful tuning
- Wait time calculations need tick-perfect accuracy (stress system depends on it)
- Multi-car dispatch in one shaft is a classic computer science problem
- Edge cases: car passing a floor where someone is waiting, express elevator skip logic, etc.

**Resolution Required:**
- [ ] Implement a DUMB elevator first (visits all floors sequentially) - validates integration
- [ ] Build elevator scheduler as separate, heavily-tested module with 80%+ coverage
- [ ] Budget 2-3 weeks for elevator alone, not 1 day
- [ ] Have a working reference (play SimTower, record exact behaviors)

**Severity: CRITICAL** - The elevator IS the game. Getting this wrong means no game.

---

### C2: "4 Parallel Agents" Has No Proven Integration Strategy

**The Claim:** "4 agents can work in parallel with defined interfaces"

**The Reality:**
- The interfaces exist, but **implementations don't**
- Interfaces are just TypeScript types - they don't enforce behavior
- No working integration test exists

**The Fatal Question:** What happens when:
- Agent 1's `Office.onPlace()` fires `building:placed` event
- Agent 2's `PopulationManager` listens but expects different payload
- Agent 3's `ElevatorShaft` needs person position data that Agent 2 formats differently
- Agent 4 tries to render everything but timing is off

**Evidence of Risk:**
```typescript
// Current interface defines:
export interface IElevatorCar {
  passengerIds: string[];
  // ...
}

// But nothing enforces:
// - When passengers are added (before or after door opens?)
// - How capacity is checked
// - Who updates passengerIds (elevator or person system?)
```

**What Actually Happens in Parallel Development:**
1. Agent 1 finishes buildings, assumes events fire synchronously
2. Agent 2 builds person system with async patterns
3. Day 3: Integration fails, both agents must rewrite
4. Timeline slips by 1-2 weeks

**Resolution Required:**
- [ ] Build ONE end-to-end vertical slice BEFORE splitting work
- [ ] Create integration tests that all agents must pass
- [ ] Define explicit contracts with test fixtures, not just types
- [ ] Assign one agent as "integration lead" who resolves conflicts in real-time

**Severity: CRITICAL** - Parallel work without integration testing is collaborative suicide.

---

### C3: Zero Gameplay Velocity Is Being Extrapolated to "5 Weeks Demo"

**The Claim:** "5 weeks to Phase 1 demo with playable elevator loop"

**The Reality:**
- Current progress: **4,054 lines of scaffolding, 0 lines of gameplay**
- We don't know our actual velocity for *game features*
- Writing interfaces is 10x faster than implementing them

**The Math:**
| What We Did | Time | Lines | Complexity |
|-------------|------|-------|------------|
| Interfaces + scaffolding | ~1-2 days | 4,054 | Low |
| Elevator scheduler | ??? | ~1,500+ | Very High |
| Person AI + pathfinding | ??? | ~1,000+ | High |
| Building placement UI | ??? | ~500+ | Medium |

**OpenSkyscraper Reference:**
- Total codebase: ~30,000 lines
- Development time: **5+ years** (intermittent)
- They had one huge advantage: direct binary reverse engineering

**What "5 Weeks" Actually Requires:**
- Week 1: Building placement (achievable)
- Week 2: Person spawning + movement (achievable with shortcuts)
- Week 3: **Elevator car + scheduling** (this is where projects die)
- Week 4: Person-elevator integration (depends entirely on week 3)
- Week 5: Polish + stress visualization (only if weeks 3-4 went perfectly)

**Resolution Required:**
- [ ] Complete Week 1 tasks, then RE-ESTIMATE
- [ ] Build simplest possible elevator first (1 car, visits all floors, no optimization)
- [ ] If Week 1 takes >10 days, reassess entire timeline
- [ ] Add 100% buffer to every estimate

**Severity: CRITICAL** - We're planning a marathon based on our sprint pace.

---

## 🟠 HIGH CONCERNS (Severity: Major Delays)

### H1: AI Art Generation is Unproven for This Specific Use Case

**The Claim:** "ImageFX can generate 1,410 pixel art frames in 8-10 weeks"

**The Reality:**
- We have **zero** test generations of SimTower-style building interiors
- SimTower's style is extremely specific: isometric-ish 2D, exactly 24px floor height, recognizable furniture silhouettes
- AI image generators struggle with:
  - Pixel-perfect alignment
  - Consistent style across 1,410 images
  - Readable small details at 8x16px base resolution
  - The specific "Japanese business sim" aesthetic of 1994

**What Could Go Wrong:**
1. AI generates great images that don't tile correctly
2. Art looks generically "pixel art" but not "SimTower"
3. 70% failure rate means regenerating 1,000+ images
4. Post-processing in Aseprite takes longer than generation
5. Style drift across batches makes buildings look mismatched

**Evidence:**
The plan says:
> "Post-process with Aseprite for pixel-perfect alignment"

This implies AI output WON'T be pixel-perfect. If every image needs manual touch-up, multiply time estimates by 3-5x.

**✅ UPDATE (2026-01-30): Validation is FREE**

Using existing subscriptions (Gemini Ultra → ImageFX, OpenAI Pro → DALL-E 3), we can validate at **$0 cost**:
- ImageFX: Unlimited via Gemini Ultra subscription
- DALL-E 3: Unlimited via OpenAI Pro subscription
- **No reason NOT to test before building**

**Resolution Required:**
- [ ] Generate 20 test images NOW (before build starts) — **$0 cost**
- [ ] Test: Office building in 7 occupancy states
- [ ] Test: Person sprites in 5 stress colors (use DALL-E 3 for people)
- [ ] Evaluate: Do these read as "SimTower" or "generic pixel art"?
- [ ] If success rate <80%, consider PixelLab.ai ($29-49/mo) as fallback

**Severity: HIGH → MEDIUM** (validation is now risk-free)

---

### H2: "Placeholder Rectangles Work for MVP" is Psychologically Dangerous

**The Claim:** "Colored rectangles work for validation"

**The Reality:**
- SimTower's appeal is watching your tower come alive
- A tower of gray and blue rectangles is **depressing**
- Motivation is fuel for long projects - rectangles drain it

**The Psychology:**
| What You See | How You Feel |
|--------------|--------------|
| Tiny pixel people entering offices | "This is cool!" |
| Black rectangles sliding into gray rectangles | "Why am I doing this?" |

**What "Evaluable" Really Means:**
- Can you tell if the game "feels like SimTower"? **No** - you can't feel SimTower without the visual charm
- Can you test elevator timing? **Yes** - but you could do that with console logs
- Can you playtest? **Barely** - nobody enjoys playing rectangles

**The Danger:**
If Phase 1 demo is rectangles, we might:
1. Declare success (timing works!)
2. Never prioritize art (always "next phase")
3. End up with a tech demo, not a game

**Resolution Required:**
- [ ] Commit to placeholder sprites, not rectangles (simple 2-color pixel art)
- [ ] Create "programmer art" versions: stick figures, simple shapes with character
- [ ] Or: Generate 10 real sprites during Week 1 to keep motivation high
- [ ] Never show rectangles to external playtesters

**Severity: HIGH** - Projects die from motivation loss, not technical failure.

---

### H3: We Don't Know How SimTower Actually Works

**The Claim:** "We have enough reference material (60KB SIMTOWER-REFERENCE.md)"

**The Reality:**
- The reference doc is comprehensive for *what* exists
- It's weak on *exact mechanics* and *timing*

**Critical Unknowns:**
1. **Elevator dispatch algorithm** - Does SimTower use SCAN, LOOK, or something custom?
2. **Stress calculation** - Linear? Exponential? Thresholds?
3. **Person decision-making** - How do they choose between elevator shafts?
4. **Wait time measurement** - From button press? From arriving at queue? From spawning?
5. **Traffic patterns** - When do office workers leave? All at once or staggered?

**Evidence Gap:**
The plan says to read OpenSkyscraper's code. But OpenSkyscraper is an **incomplete recreation**, not the original game. They made guesses too.

**Resolution Required:**
- [ ] **Play SimTower for 2+ hours** (any team member)
- [ ] Document specific behaviors with timestamps
- [ ] Use DOSBox slow-motion to observe person decision-making
- [ ] Find/extract the original game's stress calculation
- [ ] Consider running SimTower alongside OpenTower for comparison

**Severity: HIGH** - Building a clone of a guess of a game isn't fidelity.

---

### H4: Test Coverage is Planned But Not Prioritized

**The Claim:** "Core systems get 50%+ coverage"

**The Reality:**
- Current coverage: **15%**
- The plan says MVP gets **0%** coverage
- "Test later" means "test never"

**The Pattern:**
1. MVP code is thrown together fast
2. MVP code "works" (for demo scenarios)
3. We build on top of MVP code
4. Now MVP code is load-bearing
5. "We'll add tests during refactor"
6. Refactor never happens because features are due

**Why This Matters for SimTower:**
- Stress system has edge cases (overflow at 256 in original!)
- Elevator timing bugs create cascading failures
- Economic calculations need precision

**Resolution Required:**
- [ ] Elevator scheduler: Write tests FIRST (TDD)
- [ ] Person state machine: Write tests alongside
- [ ] Define "MVP complete" as "core features + core tests"
- [ ] No "throwaway code" myth - all code sticks around

**Severity: HIGH** - Technical debt compounds. This is a multi-month project.

---

### H5: Web Worker Architecture is Unproven for This Game

**The Claim:** "Web Workers for 15,000 person simulation"

**The Reality:**
- Current architecture has NO Web Worker implementation
- Worker communication adds latency and complexity
- The "15,000 people" target may be unnecessary

**SimTower Facts:**
- Original supported ~1,500 people (limited by 1994 hardware)
- Most fun towers have 200-500 active people
- 15,000 is an arbitrary "modern" target

**Web Worker Challenges:**
1. State synchronization between main thread and worker
2. Serialization overhead for every tick
3. Debugging across thread boundaries
4. PixiJS renders on main thread - how do workers communicate position updates?

**Resolution Required:**
- [ ] Build MVP WITHOUT Web Workers
- [ ] Profile: At what population does performance actually degrade?
- [ ] If needed, add workers for SPECIFIC subsystems (elevator scheduling)
- [ ] Don't pre-architect for "scale" we don't need

**Severity: HIGH** - Premature optimization is the root of all evil.

---

## 🟡 MEDIUM CONCERNS (Severity: Friction/Delays)

### M1: No Progress Tracking System Exists

**The Issue:** Plan mentions updating `PROGRESS.md` but the file doesn't exist. No task tracker. No burndown. 

**Resolution:** Create actual tracking before starting.

---

### M2: "Hour-by-Hour Schedule" is Fantasy Planning

**The Issue:** Autonomous build plan has Hour 0-1, Hour 1-2, etc. This level of precision never survives contact with reality.

**Resolution:** Plan in half-day chunks maximum.

---

### M3: Reference Projects May Have Bugs We'll Inherit

**The Issue:** OpenSkyscraper is incomplete. Towerz is simple. Reading their code as "reference" might lead us to replicate their mistakes.

**Resolution:** Treat reference code as "one implementation" not "the answer."

---

### M4: Sound/Music is Listed as "TBD"

**The Issue:** SimTower's charm partly comes from ambient sounds (elevator dings, crowd murmur). No plan for audio.

**Resolution:** At minimum, plan placeholder sounds. No audio = hollow experience.

---

### M5: Save/Load is Pushed to Phase 4

**The Issue:** If testers can't save, they can't test multi-hour scenarios. Many bugs only appear in mature towers.

**Resolution:** Simple JSON serialization should happen earlier.

---

### M6: No Rollback Plan if Build Fails

**The Issue:** What if Week 3 elevator implementation fails? Do we restart? Pivot? Abandon?

**Resolution:** Define failure criteria and contingency plans.

---

## 🟢 LOW CONCERNS (Severity: Annoyances)

### L1: TypeScript Strict Mode Not Enforced
**Issue:** Interfaces are defined but runtime type safety isn't guaranteed.

### L2: No Linter/Formatter Config
**Issue:** 4 agents will write differently styled code.

### L3: File Structure Naming Inconsistency
**Issue:** Some files are PascalCase, plan suggests different structure.

### L4: No Git Branch Strategy
**Issue:** 4 parallel agents need merge strategy.

---

## 📋 Resolution Checklist: Before Starting Full Build

### Mandatory (Do These First)
- [ ] **C1:** Implement dumb elevator (1 day) - proves integration
- [ ] **C2:** Build ONE vertical slice: Place office → spawn worker → worker rides elevator → exits
- [ ] **C3:** Complete Week 1, then re-estimate entire timeline
- [ ] **H1:** Generate 20 test art assets using ImageFX
- [ ] **H3:** Someone plays SimTower for 2 hours, documents observations

### Strongly Recommended
- [ ] **H2:** Create simple placeholder sprites (not rectangles)
- [ ] **H4:** Write elevator scheduler with TDD
- [ ] **H5:** Defer Web Workers until profiling shows need
- [ ] **M1:** Create PROGRESS.md with actual tasks

### Nice to Have
- [ ] **M4:** Plan audio pipeline
- [ ] **M5:** Simple save/load in Phase 2
- [ ] **L2:** Configure ESLint + Prettier

---

## Final Verdict

**Should we start the full autonomous build?**

### 🔴 NOT YET

**Recommended Path:**
1. **Week 0 (NOW):** Proof-of-concept week
   - Build simplest possible vertical slice
   - Test 20 AI-generated art assets
   - Play SimTower, document mechanics
   - Re-estimate timeline based on actual velocity

2. **Week 1:** Adjusted start
   - Begin with validated assumptions
   - Parallel work ONLY after integration proven
   - Art generation starts with known-good prompts

**The Risk of Starting Now:**
We write 4 parallel codebases that don't integrate, with art that doesn't match, based on mechanics we don't fully understand, hitting a timeline we invented before knowing our velocity.

**The Cost of One More Week:**
7 days of validation that could save months of rework.

---

*"Plans are worthless, but planning is everything."*  
— Dwight D. Eisenhower

*"No plan survives contact with the enemy."*  
— Helmuth von Moltke

*"Let's see the elevator actually ding before we plan 30 weeks of work."*  
— Build Skeptic

---

## Appendix: Evidence

### Current Codebase Reality
```
Total Lines: 4,054
Implementation Lines: ~500 (Game.ts, Clock.ts, Camera.ts)
Interface Lines: ~2,500
Test Coverage: 15%
Working Features: Camera pan/zoom, day/night cycle
Missing: Everything that makes it a game
```

### OpenSkyscraper Elevator Complexity
```
Car.cpp: 350 lines (state machine, physics, loading)
Elevator.cpp: 377 lines (dispatch, shaft management)  
Queue.cpp: 138 lines (waiting passengers)
Total: 865 lines of C++ for elevators alone
Development Time: 5+ years (project-wide)
```

### Timeline Reality Check
| Claim | Challenge |
|-------|-----------|
| Week 1: Building placement | Probably achievable |
| Week 2: Person movement | Achievable with shortcuts |
| Week 3: Elevator system | **Here be dragons** |
| Week 4: Integration | Depends on Week 3 |
| Week 5: Polish | Only if everything went perfectly |

**Probability of hitting 5-week target:** ~20%  
**Probability with proof-of-concept week first:** ~50%
