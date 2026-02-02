# OpenTower Master Plan
**The Road to 99% SimTower Fidelity**

*Synthesized from: SimTower Historian, Engineering Lead, Product Manager, Game Designer*  
*Date: 2025-01-30*

---

## 🎯 Mission

Recreate SimTower (1994) as a modern web game with:
- **99% gameplay fidelity** to the original
- **HD graphics** (2x pixel art, same aesthetic)
- **Original mechanics** (elevator programming, stress system, star progression)
- **Quality-of-life improvements** (autosave, better UI, no game-breaking bugs)

---

## 📊 Current State

| Metric | Value |
|--------|-------|
| **Completion** | ~20% |
| **Lines of Code** | 4,054 TypeScript |
| **Test Coverage** | 15% |
| **Architecture** | ✅ Excellent |
| **Gameplay** | ❌ None (all scaffolding) |

### What Exists
- ✅ Game loop with fixed timestep (100ms ticks, 60fps render)
- ✅ Event bus with phased processing
- ✅ Clock system (day/night, weekday/weekend, quarters)
- ✅ Camera (pan, zoom, interpolation)
- ✅ Tower state management
- ✅ Comprehensive interfaces (verified against original)
- ✅ Building configs (all 21 types, correct sizes/costs)

### What's Missing
- ❌ Building placement UI
- ❌ Person simulation (spawning, movement, needs)
- ❌ Elevator system (THE core mechanic)
- ❌ Pathfinding (multi-floor, transfers)
- ❌ Economic simulation
- ❌ Events (fires, VIPs, terrorism)
- ❌ All sprites, sounds, music
- ❌ Save/load

---

## 🗺️ Roadmap

### Phase 1: Elevator Demo MVP (Weeks 1-5)
**Goal:** Prove the core loop is fun

| Week | Deliverable |
|------|-------------|
| 1 | Building placement (Office, FastFood, Lobby only) |
| 2 | Person spawning + basic horizontal movement |
| 3 | Elevator car + vertical movement |
| 4 | Wait time → stress → visual feedback |
| 5 | Polish, bugs, first playtest |

**Success Criteria:**
- [ ] Place 3 building types with mouse
- [ ] Watch 50+ people use elevators
- [ ] See stress colors change (black → pink → red)
- [ ] "This feels like SimTower" gut check

### Phase 2: Horizontal Expansion (Weeks 6-10)
- Remaining building types
- Hotel + housekeeping loop
- Stairs + escalators
- Economic simulation (income, expenses)

### Phase 3: Vertical Scaling (Weeks 11-16)
- 15,000 person simulation (Web Workers)
- Multi-shaft elevator optimization
- Pathfinding with transfers
- Star progression system

### Phase 4: Content & Polish (Weeks 17-24)
- All sprites (buildings, people, UI)
- Sound effects + music
- Events system (fires, VIPs, terrorism)
- Save/load

### Phase 5: Release Prep (Weeks 25-30)
- Performance optimization
- Playtesting + balance
- Tutorial
- Launch

**Total: ~7-8 months to v1.0**

---

## 🔧 Technical Priorities

### Critical Path (in order)
1. **Elevator Scheduler** - Highest complexity, most gameplay impact
2. **Person AI** - Movement, needs, stress accumulation
3. **Multi-floor Pathfinding** - A*, transfers, sky lobbies
4. **Building Placement UI** - Mouse interaction, validation
5. **Population SoA** - Performance for 15K entities

### Architecture Decisions (Confirmed)
- ✅ Keep current interface layer (excellent)
- ✅ PixiJS for rendering (appropriate choice)
- ✅ Web Workers for simulation (needed for scale)
- ✅ Event-driven architecture (clean)
- ⚠️ Add error handling (currently none)
- ⚠️ Increase test coverage to 50%+

---

## 🎮 Key Mechanics (From Historian)

### The Elevator Truth
- **15-floor zones max** per elevator shaft
- **Express elevators** every 15 floors for tall towers
- **Wait time thresholds:** <2min good, >4min stress, >6min moveout risk
- **4-trip rule:** Sims won't travel if destination requires >4 transfers

### Economic Exploits to Preserve (or Fix?)
- **Party Hall spam:** $20K/day × 16 = $320K/day guaranteed income
- **Condo bankruptcy:** Forced buyback can destroy you
- **Fast Food positioning:** Near lobby = guaranteed traffic

### Bugs to NOT Recreate
- Phantom condo glitch (memory corruption)
- Stress overflow at 256+
- Cathedral placement crash
- Recycling center soft-lock

---

## 🔄 Autonomous Build Loop

### Daily Cycle
1. **Morning:** Pull latest, run tests, identify next task
2. **Day:** Implement feature, write tests, document
3. **Evening:** Push changes, update progress tracker
4. **Night:** Run extended test suite, performance benchmarks

### Task Queue (First 10)
```
[ ] T001: Building placement system (mouse click → building appears)
[ ] T002: Office entity implementation (spawn workers at 6am)
[ ] T003: Person entity base class (position, movement, stress)
[ ] T004: Horizontal pathfinding (A* on single floor)
[ ] T005: Elevator shaft + car data structures
[ ] T006: Elevator car movement (call button → car arrives)
[ ] T007: Person boards/exits elevator
[ ] T008: Wait time tracking → stress accumulation
[ ] T009: Stress visualization (person color changes)
[ ] T010: FastFood + Lobby placement
```

### Success Metrics
- **Weekly:** At least 1 playable feature added
- **Bi-weekly:** Playtest session, adjust priorities
- **Monthly:** Major milestone (e.g., "Elevator Demo complete")

---

## 🎨 4K Asset Pipeline (Parallel Track)

### 💰 Cost: $0-20 (Using Existing Subscriptions)

**Already Paid For:**
| Subscription | Tool Access | Best For |
|--------------|-------------|----------|
| Gemini AI Ultra | **ImageFX (Imagen 4)** - unlimited | Buildings, scenes, backgrounds |
| OpenAI Pro | **DALL-E 3 / GPT-4o** - unlimited | People, characters, details |
| Claude Max | Prompt iteration, code assistance | Workflow optimization |

**Optional:** Aseprite ($20 one-time) or GIMP (free)  
**Fallback only:** PixelLab.ai ($29-49/mo) - if free tools fail  

**Full Catalog:** `COMPLETE-ASSET-CATALOG.md` | **Prompts:** `IMAGEFX-PROMPTS.md`

### Resolution Strategy
- **Original:** 8-16px tiles, 8-bit color (256 colors)
- **OpenTower 4K:** 32-64px tiles (4× scale), retro palette preserved
- **Buildings:** Office = 576×96 at 4K

### Revised Asset Strategy (Based on Feasibility Report)
| Approach | Sprites | Timeline | Cost |
|----------|---------|----------|------|
| ~~Full AI generation (1,410)~~ | ~~1,410~~ | ~~10 weeks~~ | ~~Unrealistic~~ |
| **Recommended: Core + Procedural** | **100-150** | **6-8 weeks** | **$0-20** |
| Variations via palette swaps | +500 | Automated | $0 |

### Complete Asset Count (Reference)
| Category | Base Images | With States | Total Frames |
|----------|-------------|-------------|--------------|
| Buildings (21 types) | 89 | 260 | ~350 |
| People (12 types) | 60 | 240 | ~240 |
| Elevators (3 types) | 45 | 60 | ~180 |
| Sky/Weather | 11 | 82 | ~200 |
| UI Elements | 85 | 150 | ~150 |
| Effects/Events | 45 | 45 | ~120 |
| Transportation | 8 | 8 | ~60 |
| Decorations | 30 | 30 | ~80 |
| Construction | 12 | 12 | ~30 |
| **TOTAL** | **385** | **887** | **~1,410** |

*Note: Generate ~100-150 core sprites, use procedural variations for the rest*

### Revised Timeline (6-8 Weeks)
| Week | Assets | Count | Tools |
|------|--------|-------|-------|
| 0 | **Validation: Test 20 sprites** | 20 | ImageFX + DALL-E |
| 1-2 | MVP Core (Office, Lobby, Person, Elevator) | 30-35 | ImageFX + DALL-E → GIMP |
| 3-4 | Hotels, Food, Commercial | 40-50 | ImageFX → GIMP |
| 5-6 | Remaining buildings + UI | 30-40 | Mixed |
| 7-8 | Polish, palette swaps, sprite sheets | Procedural | Aseprite/GIMP scripts |

### Style Consistency
- ImageFX for buildings/scenes (seed tracking)
- DALL-E 3 for characters/people (better at figures)
- Post-process ALL outputs in GIMP/Aseprite
- Extract palette from first batch, apply to all
- Light from top-left (all assets)
- Color variants generated procedurally for stress states

---

## 📁 Reference Documents

| Document | Size | Contents |
|----------|------|----------|
| `SIMTOWER-REFERENCE.md` | 60KB | Original game mechanics, buildings, events |
| `ENGINEERING-AUDIT.md` | 41KB | Codebase review, architecture, tech debt |
| `PRODUCT-ROADMAP.md` | 22KB | Milestones, priorities, risks |
| `GAME-DESIGN-SPEC.md` | 34KB | Detailed mechanics, elevator system, economy |
| `COMPLETE-ASSET-CATALOG.md` | 15KB | **Every asset** from original (911 frames, 48 sounds) |
| `4K-ASSET-PIPELINE.md` | 13KB | AI art generation workflow, prompts, specs |
| `IMAGEFX-PROMPTS.md` | 15KB | Ready-to-use ImageFX prompts for all assets |

---

## 🚀 Next Action

**Start T001: Building Placement System**

This unblocks everything else. Player needs to click → building appears → people can spawn → elevators can be tested.

---

*"SimTower's genius is making elevator management feel like a satisfying optimization puzzle. Every design decision must serve that core."*
— Game Designer
