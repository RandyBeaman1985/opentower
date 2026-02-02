# OpenTower Master Plan (REVISED)
**Version 2.1 — With UX & Engineering Additions**  
**Date:** 2025-01-30 (Updated)  
**Status:** APPROVED FOR IMPLEMENTATION

---

## 🎯 Mission (Updated)

Create **SimTower Lite** — a focused, polished tower builder that captures the magic of the original in a modern web package.

**Not:** A 99% SimTower clone.  
**Instead:** 70% SimTower + 30% modern improvements.

### Positioning Statement
> **OpenTower is the SimTower successor that gets elevators right — where elevator management is the core puzzle, not a utility, and every decision creates visible, satisfying results. Play instantly in your browser.**

---

## 🎨 NEW UX FEATURES (From UX Research)

### Tower Pulse Dashboard (Critical)
Real-time health indicator — the "one glance" widget:
```
┌─────────────────────────────────────────┐
│ 🏢 TOWER PULSE                     [?]  │
├─────────────────────────────────────────┤
│ 👥 Pop: 847/1000 ████████▒▒ (85%)      │
│ 😊 Mood: ██████████ 94% Happy          │
│ 🛗 Lifts: ████▒▒▒▒▒▒ 40% Capacity      │
│ 💰 Flow: +$2,400/day ↑                 │
│ ⏰ RUSH HOUR IN 12 MIN ⚠️              │
└─────────────────────────────────────────┘
```

### Tiered Elevator Programming (Critical for Accessibility)
| Tier | Target User | Complexity |
|------|-------------|------------|
| **Simple** (Default) | Casual | Range selector + strategy preset |
| **Zone** | Intermediate | Visual drag-to-select floors |
| **Expert** | Power users | Full checkbox per floor |

### Decision Echo System
Show impact 1 minute after significant changes:
```
📊 IMPACT: Elevator Car Added
Wait times: 2:15 → 1:42 (-33 sec) ✓
Passengers: +24 served this hour
```

### Accessibility Requirements
- Colorblind mode: Symbols + colors (✓⚡⚠✕)
- Font scaling: 75%-150%
- Touch targets: 44×44pt minimum for mobile

---

## 📊 Revised Metrics

| Metric | Original Plan | Revised Plan | Reason |
|--------|---------------|--------------|--------|
| **Timeline** | 7-8 months | **12-14 months** | Reality (solo dev, 12 hrs/week actual) |
| **Building Types** | 21 | **10-12** | Scope cut (40%) |
| **Population Cap** | 15,000 | **3,000-5,000** | Performance reality |
| **Star Levels** | 5★ + TOWER | **3★ max** | Achievable v1.0 |
| **Asset Frames** | 911+ | **150-200** | Focused set + procedural |
| **Events** | 15+ types | **3-4** | Fire, VIP, Power, Treasure |

---

## ✅ What's Actually In v1.0

### Buildings (12 Types)

| Type | Floors | Why Included |
|------|--------|--------------|
| **Lobby** | Ground only | Required for entry |
| **Office** (2 variants) | 2+ | Core revenue |
| **Fast Food** (2 variants) | 1-14 | Worker food source |
| **Restaurant** (1 variant) | 2+ | Diversity |
| **Hotel Single** | 2+ | Night population |
| **Hotel Twin** | 2+ | Higher revenue tier |
| **Shop** (2 variants) | Ground-3 | Commercial variety |
| **Condo** | 2+ | Residential option |
| **Stairs** | Any | Budget vertical transport |
| **Standard Elevator** | 30-floor max | THE core mechanic |
| **Express Elevator** | Unlimited | Sky lobby strategy |

### What's CUT from v1.0

- Recycling Center, Cathedral, Metro, Parking Garage
- Party Hall, Medical Center, Security Office
- Service Elevator
- Housekeeping (and therefore cockroach infestations)
- 11 shop variants → 2
- 5 fast food variants → 2
- 4 restaurant variants → 1
- Weather system
- Terrorism events (legal complexity)
- Seasonal events

---

## ⏱️ Revised Timeline (56 Weeks)

### Phase 1: Foundation (Weeks 1-12)
**Goal:** Playable elevator demo

| Week | Task | Deliverable |
|------|------|-------------|
| 1-2 | T001: Building Placement | Click to place buildings |
| 3 | T002: Office Entity | Workers spawn at offices |
| 4-5 | T003: Person Entity | People with state machines |
| 6-7 | T004: Horizontal Pathfinding | Walking on floors |
| 7-8 | T005: Elevator Shaft | Data structures, basic rendering |
| 8-10 | T006: Elevator Movement | LOOK algorithm, car physics |
| 11-12 | T007: Boarding/Exiting | Integration of all systems |
| +2 | Buffer | Bug fixes, integration |

**Gate 1 (Week 10):** Does the elevator feel good?

### Phase 2: Core Mechanics (Weeks 13-22)
**Goal:** Alpha playtest

| Week | Task | Deliverable |
|------|------|-------------|
| 13-14 | T008: Stress System | Wait time → stress |
| 15 | T009: Stress Visualization | Black → Pink → Red |
| 15-16 | T010: FastFood + Lobby | Additional buildings |
| 17 | **Tower Pulse Widget** | Health dashboard |
| 18 | **Simple Elevator UI** | Range + presets mode |
| 19-20 | Art Sprint | 30 core sprites validated |
| 21 | Bug Fixing | Stability |
| 22 | Integration | Alpha build |

**Gate 2 (Week 22): ALPHA PLAYTEST**
- 3/5 testers play >15 minutes?
- Can explain stress→elevator→solution?
- "This feels like SimTower" gut check?
- Tower Pulse is helpful?
- Simple elevator mode is clear?

### Phase 3: Expansion (Weeks 23-40)
**Goal:** Feature complete

| Week | Deliverable |
|------|-------------|
| 23-28 | 5 more building types (Hotel, Restaurant, Shop, Condo) |
| 29-32 | Economic simulation (income, expenses, quarterly) |
| 33-36 | Star progression (1★ → 2★ → 3★) |
| 37-38 | VIP visits + Fire events |
| 39-40 | Express elevator + Sky lobby strategy |

**Gate 3 (Week 35):** Performance check at 1,000 people

### Phase 4: Polish (Weeks 41-50)
**Goal:** Beta release

| Week | Deliverable |
|------|-------------|
| 41-44 | UI/UX (Tower Pulse widget, overlays) |
| 45-46 | Save/Load (LocalStorage) |
| 47-49 | Sound Effects (10+ sounds) |
| 50 | Tutorial (5-minute guided) |

**Gate 4 (Week 46): BETA PLAYTEST**
- ≥10 external testers
- NPS >30?
- Tutorial completion >70%?

### Phase 5: Release (Weeks 51-56)
**Goal:** Ship v1.0

| Week | Deliverable |
|------|-------------|
| 51-54 | QA Sprint, bug fixes |
| 55 | Final polish |
| 56 | **V1.0 RELEASE** |

---

## 🔧 Technical Architecture (From Engineer)

### Worker-Based Simulation Pattern
```
MAIN THREAD: Renderer (PixiJS) + Input + StateSnapshot
     ↕ SharedArrayBuffer (positions, states, floors)
WORKER THREAD: ElevatorSys + PopulationSys + EconomicsSys
```

### LOOK Algorithm (Not SCAN)
- Serve all requests in current direction, then reverse
- **Never go past furthest request** (more efficient)
- Port from OpenSkyscraper's proven implementation

### Two-Level Pathfinding
1. **Transport Graph** — Which elevators/stairs to take
2. **Floor A*** — Tile-to-tile within a floor

### Performance Budget (100ms tick)
- Elevator cars: ~12ms ✅
- People position: ~30ms ⚠️ (tight)
- Pathfinding: Cache routes, amortize over frames

---

## 🎮 Core Mechanics (Non-Negotiable)

### 1. Elevator System (THE GAME)

**30-Floor Rule:**
> Standard elevators max 30 floors. This FORCES strategic thinking. Without it, there's no puzzle.

**LOOK Algorithm:**
- Elevator travels in one direction until no more requests
- Then reverses direction
- Port from OpenSkyscraper's proven implementation

**Elevator Programming (3 Tiers):**
| Mode | Target User | Complexity |
|------|-------------|------------|
| **Simple** | Casual | "This elevator serves floors 1-15" |
| **Zone** | Intermediate | Visual drag-to-select floors |
| **Expert** | Power users | Full checkbox per floor |

### 2. Stress System (Visible Feedback)

| Wait Time | Stress | Color | Action |
|-----------|--------|-------|--------|
| <30 seconds | Low | **Black** | Happy |
| 30-60 seconds | Medium | **Pink** | Frustrated |
| >60 seconds | High | **Red** | Will leave |

**Critical:** Use authentic colors (Black/Pink/Red). NOT black/orange/red.

### 3. Traffic Patterns (Day/Night)

| Time | Pattern |
|------|---------|
| 7-9 AM | Morning rush (offices fill) |
| 12-1 PM | Lunch rush (restaurants) |
| 5-7 PM | Evening rush (offices empty) |
| Night | Hotels active, offices dark |

### 4. Star Progression (Simplified)

| Star | Population | Unlock |
|------|------------|--------|
| 1★ | Start | Office, FastFood, Stairs |
| 2★ | 100 | Hotel, Condo, Shop, Express Elevator |
| 3★ | 500 | Restaurant, VIP visits, More variants |

---

## 🛡️ Risk Mitigations

### Top 6 Risks + Actions

| Risk | Mitigation | Trigger |
|------|------------|---------|
| **Elevator algorithm** | Use OpenSkyscraper's LOOK algorithm | Before Week 8 |
| **Elevator UI complexity** | Tiered system (Simple default) | Week 18 |
| **Burnout** | Monthly breaks, public devlog, celebrate wins | Ongoing |
| **Art pipeline fails** | Validate 20 sprites by Week 2 | Week 2 |
| **Performance ceiling** | Profile at 500 people, Web Workers at 2K | Week 12, Week 35 |
| **Feature creep** | Scope freeze after Alpha, written commitment | Week 22 |

---

## 🎨 Asset Strategy (Revised)

### Core Sprites (Generate First)

| Asset | Count | Priority |
|-------|-------|----------|
| Office (day/night states) | 8 | P0 |
| Person (3 stress colors × 2 directions) | 6 | P0 |
| Elevator car + shaft | 10 | P0 |
| Lobby | 3 | P0 |
| Sky (day/night) | 4 | P0 |
| **Phase 1 Total** | **31** | Week 2 validation |

### Tools
- **ImageFX** (Imagen 4) — Buildings, scenes
- **DALL-E 3** — Characters, people
- **GIMP/Aseprite** — Post-processing, consistency

### Palette Lock
After first 20 sprites validated:
1. Extract color palette
2. Apply to ALL subsequent sprites
3. Ensure visual consistency

---

## 📦 MVP Success Criteria

### Week 22 Alpha Checklist

| Criteria | Target | Pass/Fail |
|----------|--------|-----------|
| Buildings placeable | ≥5 types via mouse | ✅/❌ |
| People simulated | ≥100 visible | ✅/❌ |
| Elevator works | Call → board → ride → exit | ✅/❌ |
| Stress visible | Colors change with wait time | ✅/❌ |
| Performance | ≥30 FPS at 200 people | ✅/❌ |
| Engagement | 3/5 testers play >15 min | ✅/❌ |
| **Tower Pulse** | Widget shows key metrics | ✅/❌ |
| **Simple Elevator UI** | Range + preset mode works | ✅/❌ |

### What Alpha is NOT
- Multiple elevator types
- Hotels or housekeeping
- Events (fire, VIP)
- Save/load
- Sound
- Star progression
- Zone/Expert elevator programming (added in Beta)

---

## 💰 Revenue Model

| Phase | Model | Target |
|-------|-------|--------|
| Alpha | Free web demo | Audience building |
| v1.0 | itch.io "pay what you want" | $100-500/mo |
| Post-launch | Steam at $9.99 | $1K-10K total |

**Reality:** This is a passion project. Revenue is a bonus, not the goal.

---

## 📋 Immediate Next Actions

### This Week
- [ ] **START T001:** Building Placement System
- [ ] **Validate Art:** Generate 20 test sprites (Office, Person, Elevator, Lobby, Sky)
- [ ] **Set Up Accountability:** Create devlog, numbered builds
- [ ] **Research LOOK Algorithm:** Review OpenSkyscraper implementation

### Week 2
- [ ] **T001 Complete:** Buildings placeable via mouse click
- [ ] **Art Validation Gate:** 20/20 sprites usable? → Continue DIY
- [ ] **Copy LOOK Algorithm:** Start elevator scheduler implementation

### Week 3-4
- [ ] **Design Tower Pulse Widget:** Mockup before implementation
- [ ] **Design Simple Elevator UI:** Range selector + presets

### Month 1
- [ ] **T001-T005 Complete:** Building placement + elevator data structures
- [ ] **External Feedback:** Share prototype with 2-3 trusted testers
- [ ] **First Break:** Schedule 2-3 days off
- [ ] **Write Differentiation:** One sentence: "OpenTower is..."

---

## 📁 Reference Documents

| Document | Purpose |
|----------|---------|
| `debate/FINAL-SYNTHESIS.md` | All expert reviews consolidated (v2) |
| `debate/PRODUCT-MANAGER-REVIEW.md` | Scope, MVP, differentiation |
| `debate/PROJECT-MANAGER-REVIEW.md` | Timeline, risks, milestones (56-week breakdown) |
| `debate/ENGINEER-REVIEW.md` | Architecture, LOOK algorithm, pathfinding |
| `debate/UX-RESEARCH-REVIEW.md` | Tower Pulse, tiered elevator UI, accessibility |
| `COMPETITOR-ANALYSIS.md` | Market research |
| `COMMUNITY-INSIGHTS.md` | Player expectations |
| `ENGINEERING-AUDIT.md` | Code review |
| `GAME-DESIGN-SPEC.md` | Detailed mechanics |
| `TASK-QUEUE.md` | Sprint backlog |

---

## One-Sentence Summary

**Build SimTower Lite in 14 months: 12 buildings, 3,000 people, 3 stars, with the best damn elevator simulation ever made for the web — featuring modern UX (Tower Pulse dashboard, tiered elevator programming) that makes the original's depth accessible to everyone.**

---

*"SimTower was built around an elevator simulation program."*  
*— Wikipedia*

*That's our north star.*
