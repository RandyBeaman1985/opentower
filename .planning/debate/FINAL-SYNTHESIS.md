# 🎯 OpenTower Final Synthesis: Robust Plan (v2)
**Date:** 2025-01-30 (Updated)  
**Sources:** Product Manager, Project Manager, Engineering Audit, UX Research, Prior Debates  
**Status:** COMPREHENSIVE PLAN — READY FOR EXECUTION

---

## Executive Summary

After comprehensive review by **5 specialists** (Product Manager, Project Manager, Senior Engineer, UX Researcher, and prior debates), OpenTower shows **strong foundations** but requires **significant scope reduction and timeline adjustment** to be achievable.

| Aspect | Current State | Required Action |
|--------|---------------|-----------------|
| **Architecture** | ✅ Excellent | Maintain, add Web Worker pattern |
| **Scope** | ❌ 2-3x too large | Cut 40-50% |
| **Timeline** | ❌ Unrealistic (7-8mo stated) | Revise to 12-14mo |
| **MVP Definition** | ❌ Tech demo, not product | Redefine with UX metrics |
| **Asset Pipeline** | ⚠️ Unvalidated | Test NOW |
| **Differentiation** | ❌ Missing | Define "why play this?" |
| **Elevator UX** | ⚠️ Overly complex | Implement 3-tier system |
| **Accessibility** | ❌ Not addressed | Add colorblind modes, touch support |

---

## 🚨 CRITICAL ISSUES (Must Address Before Proceeding)

### 1. The "99% Fidelity" Trap
**Product Manager:** "This is a product suicide mission."

You're not Maxis in 1994 with a budget and team. Target **70% SimTower + 30% modern improvements**. Capture the *feeling*, not the checklist.

### 2. Timeline is Fantasy
**Project Manager:** "The 7-8 month estimate is aspirational, not achievable."

| Estimate Type | Timeline |
|---------------|----------|
| Stated | 7-8 months |
| **Realistic (solo dev)** | **12-18 months** |
| With aggressive cuts | 10-12 months |

**The math:**
- 20 hrs/week stated → 12 hrs/week actual (motivation, life interrupts)
- Estimation error: 1.5-2x on every task
- **Result:** 73+ weeks, not 31

### 3. Zero Playable Gameplay
**Engineering Audit:** "90% scaffolding, 0% gameplay"

- 4,118 lines of TypeScript = excellent architecture
- 0 lines of actual game mechanics
- A player can't click, place, or watch anything

### 4. Unvalidated Art Pipeline
**All Reviewers:** "Generate 20 test sprites NOW before writing more code."

The entire asset strategy depends on AI generation working. If it fails, you need $500-1000 for an artist or a completely different approach.

### 5. No Differentiation Strategy
**Product Manager:** "Why would anyone play THIS over Project Highrise or just emulating SimTower?"

"Free SimTower clone" is not a product position. It's a feature list.

---

## ✅ WHAT'S ACTUALLY GOOD

1. **Architecture is solid** - Event bus, clock, camera all work well
2. **Interfaces are comprehensive** - All 21 building types properly defined
3. **Design knowledge is deep** - Clear understanding of SimTower mechanics
4. **Render loop is efficient** - Fixed timestep, frustum culling
5. **Test infrastructure exists** - Vitest configured, some tests written
6. **Planning documents are excellent** - Clear roadmap, detailed specifications

---

## 🔧 TECHNICAL RECOMMENDATIONS (From Engineer)

### Architecture Pattern: Worker-Based Simulation

```
┌─────────────────────────────────────────────────────────────────────┐
│                           MAIN THREAD                                │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐ │
│  │   Renderer   │  │ InputManager │  │      StateSnapshot         │ │
│  │  (PixiJS)    │  │  (Events)    │  │  (Read-only view of sim)   │ │
│  └──────────────┘  └──────────────┘  └────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                  SharedArrayBuffer (positions, states, floors)      │
├─────────────────────────────────────────────────────────────────────┤
│                       WORKER THREAD                                  │
│  ┌──────────────┐ ┌────────────────┐ ┌───────────────────────────┐  │
│  │ ElevatorSys  │ │  PopulationSys │ │    EconomicsSys           │  │
│  │  (LOOK alg)  │ │  (SoA + Grid)  │ │   (Quarterly ticks)       │  │
│  └──────────────┘ └────────────────┘ └───────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Per-Tick Budget Analysis (100ms target)

| System | Budget | Notes |
|--------|--------|-------|
| Elevator Cars (192) | ~12ms | ✅ OK |
| People Position (15K) | ~30ms | ⚠️ Tight |
| Pathfinding (10% repath) | **150ms** | ❌ **OVER BUDGET** |
| Stress Calculation | ~15ms | ✅ OK |

**Solution:** Two-level pathfinding (Transport Graph + A* on floors), path caching, amortize over frames.

### Elevator Algorithm: LOOK + Zone Assignment

```typescript
// LOOK Algorithm: Serve all requests in direction, then reverse
// Never go past furthest request (more efficient than SCAN)

// Multi-car coordination via zones:
// Priority 1: Idle car in zone
// Priority 2: Moving car that will pass floor  
// Priority 3: Any idle car
// Priority 4: Least loaded car
```

**Port from OpenSkyscraper's proven implementation** — don't reinvent.

### Code Reuse Opportunities

| Source | What to Use |
|--------|-------------|
| **towerz (JS)** | Person state machine, elevator boarding logic |
| **OpenSkyscraper (C++)** | Elevator scheduling algorithm, pathfinding |
| **Neither** | Build from scratch using your superior interfaces |

---

## 🎨 UX RECOMMENDATIONS (From UX Research)

### 1. Tower Pulse Dashboard (Critical Addition)

**Problem:** Players can't assess tower health at a glance.

**Solution:** Add "Tower Pulse" mini-panel:

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

### 2. Decision Echo System (Feedback Loops)

**Problem:** Players don't see cause-effect of their decisions.

**Solution:** Show impact report 1 minute after significant changes:

```
┌─────────────────────────────────────────┐
│ 📊 IMPACT REPORT: Elevator Car Added    │
├─────────────────────────────────────────┤
│ Wait times:  2:15 → 1:42 (-33 sec) ✓   │
│ Passengers:  +24 served this hour       │
│ Bottleneck:  Still floor 7-8 lobby      │
│              [Dismiss] [Details]        │
└─────────────────────────────────────────┘
```

### 3. Tiered Elevator Programming (Critical!)

**Problem:** 60 floors × 6 cars = 360 checkbox decisions = cognitive overload.

**Solution:** Three-tier system:

| Tier | Target User | UI |
|------|-------------|-----|
| **Simple** (Default) | Casual players | Range selector + strategy preset |
| **Zone** | Intermediate | Visual drag-to-select floors |
| **Expert** | Power users | Full checkbox per floor |

**Simple Mode:**
```
Coverage: [Ground] to [Floor 15]
Strategy: ⦿ Even Spread (recommended)
          ○ Bottom-Heavy
          ○ Express (few stops)
```

**Zone Mode:**
```
Drag zones on visual tower cross-section
Each car gets color-coded floor range
Auto-suggests based on traffic patterns
```

### 4. Accessibility Requirements

| Issue | Solution | Priority |
|-------|----------|----------|
| Colorblind modes | Symbols + colors (✓⚡⚠✕) | HIGH |
| Font scaling | UI scale option 75%-150% | HIGH |
| Touch targets | Min 44×44pt for mobile | MEDIUM |
| Key rebinding | Settings panel | MEDIUM |
| Screen reader | ARIA labels | LOW (v1.1) |

### 5. Mobile Adaptations

- **Radial build menu** (long-press anywhere)
- **Bottom sheet** for details (swipe up)
- **Pinch-zoom** for navigation
- **Larger tap targets** (people sprites need 44pt minimum)

---

## 📋 REVISED SCOPE: "SimTower Lite"

### What to KEEP for v1.0

| Feature | Why |
|---------|-----|
| **10-12 building types** (not 21) | Core gameplay, manageable scope |
| Lobby, Office, FastFood, Restaurant (2), Hotel Single, Hotel Twin, Shop (3), Stairs, Condo | Sufficient variety |
| **Standard + Express elevators** (not Service) | Core mechanic without complexity |
| **3-star max** (not 5★ + TOWER) | Achievable progression |
| **3,000-5,000 people** (not 15K) | Realistic performance |
| **3-4 random events** (fire, VIP, power outage, treasure) | Drama without overwhelming |
| **Basic save/load** (LocalStorage) | Playability |
| **Web-first** | Fastest to market |
| **Tower Pulse widget** | Critical UX addition |
| **Tiered elevator UI** | Accessibility |

### What to CUT for v1.0

| Feature | Reason |
|---------|--------|
| Recycling Center | Niche, complex, nobody's favorite |
| Cathedral | Vanity only, not gameplay |
| Metro Station | Underground adds complexity for minimal payoff |
| Parking Garage | Cars aren't part of the vertical fantasy |
| Party Hall | Edge case income |
| Service Elevator | Standard + Express is enough |
| Sky/Weather system | Clear sky only for v1.0 |
| Terrorism events | Legal/PR risk, fire is enough drama |
| Seasonal events | Nice-to-have, scope bloat |
| 5-star + TOWER status | 3-star is sufficient for v1.0 |
| 15,000 people | Cap at 3,000-5,000 |
| Complex housekeeping | v1.1 |

**Estimated scope reduction: 40-50%**

---

## ⏱️ REVISED TIMELINE: 56 Weeks (14 Months)

### Phase Breakdown

```
PHASE 1: MVP FOUNDATION (Weeks 1-14)
├─ T001: Building Placement    Weeks 1-2
├─ T002: Office Entity         Week 3
├─ T003: Person Entity         Weeks 4-5
├─ T004: Horizontal Pathfind   Weeks 6-7
├─ T005: Elevator Shaft        Weeks 7-8
├─ T006: Elevator Movement     Weeks 8-10 **HIGH RISK**
├─ T007: Boarding/Exiting      Weeks 11-12 **HIGH RISK**
├─ T008-T010: Stress + Food    Weeks 13-14
└─ Buffer                      +2 weeks

◆ GATE 1 (Week 10): Does the elevator feel good?

PHASE 2: ALPHA POLISH (Weeks 15-22)
├─ Bug Fixing                  Weeks 15-16
├─ Tower Pulse Widget          Week 17
├─ Art Sprint (30 core sprites)Weeks 18-20
├─ Tiered Elevator UI          Week 21
├─ Integration                 Week 22
└─ ALPHA PLAYTEST ◆ (Week 22)

◆ GATE 2 (Week 22): Is this fun? 3/5 testers play >15 min?

PHASE 3: EXPANSION (Weeks 23-40)
├─ 5 more building types       Weeks 23-28
├─ Hotel + Basic housekeeping  Weeks 29-32
├─ Economic simulation         Weeks 33-36
├─ Star progression (1-3★)     Weeks 37-38
├─ 3-4 Random events           Weeks 39-40
└─ Performance checkpoint ◆ (Week 35)

◆ GATE 3 (Week 35): Can we hit 2K+ people at 45 FPS?

PHASE 4: BETA (Weeks 41-50)
├─ UI/UX Polish + Accessibility Weeks 41-44
├─ Save/Load                   Weeks 45-46
├─ Sound Effects               Weeks 47-49
├─ Tutorial                    Week 50
└─ BETA PLAYTEST ◆ (Week 46)

◆ GATE 4 (Week 46): ≥10 external testers, NPS >30?

PHASE 5: RELEASE (Weeks 51-56)
├─ QA Sprint                   Weeks 51-54
├─ Final fixes                 Week 55
└─ V1.0 RELEASE ★ (Week 56)
```

### Go/No-Go Decision Gates

| Gate | Week | Question | Fail Action |
|------|------|----------|-------------|
| **Art Validation** | 2 | Can AI produce usable sprites? | Hire artist or pivot |
| **Elevator Viability** | 10 | Does the elevator feel good? | Copy OpenSkyscraper impl |
| **Alpha** | 22 | Is this fun? | Major scope cut or pivot |
| **Performance** | 35 | Can we hit 2K+ people? | Cap at 1K, call it "design" |
| **Beta** | 46 | External positive feedback? | Early access or slip |

---

## 🎮 REAL MVP DEFINITION (Week 22 Alpha)

**Current MVP is wrong.** "50+ people use elevators" is a tech demo, not a product.

### Actual MVP Criteria

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| **Session length** | >15 minutes unprompted | Core loop is engaging |
| **Restart rate** | >30% players restart | Players want to try again |
| **Problem-solving** | Player articulates "I solved X" | Strategic depth exists |
| **No confusion** | Player understands without hints | UX is clear |

### MVP Features (Week 22 Alpha)

- ✅ 5 building types placeable (Lobby, Office, FastFood, Stairs, Elevator)
- ✅ 100+ people simulated
- ✅ Elevator functional (call, board, ride, exit)
- ✅ Stress visualization (color changes)
- ✅ Basic income (rent on timer)
- ✅ 30 FPS at 200 people
- ✅ **Tower Pulse widget** (NEW)
- ✅ **Simple elevator programming mode** (NEW)
- ❌ NOT: Multiple elevator types, hotels, events, star progression, save/load

---

## 🚀 TOP 10 RISKS (Ranked)

| # | Risk | Severity | Probability | Mitigation |
|---|------|----------|-------------|------------|
| **1** | Elevator algorithm complexity | 🔴 High | 75% | Copy OpenSkyscraper LOOK algorithm |
| **2** | Solo dev burnout (month 4-5) | 🔴 High | 60% | Public accountability, small wins, monthly breaks |
| **3** | AI art inconsistency | 🟡 Medium | 70% | Validate 20 sprites NOW |
| **4** | Browser performance ceiling | 🟡 Medium | 50% | Profile early, Web Workers at 500 people |
| **5** | Pathfinding at scale | 🟡 Medium | 60% | Transport Graph approach, path caching |
| **6** | Feature creep | 🟡 Medium | 80% | Strict scope freeze after Alpha |
| **7** | Tech debt by month 6 | 🟡 Medium | 70% | Refactor sprint every 6 weeks |
| **8** | Elevator UI too complex | 🟡 Medium | 65% | Tiered system (Simple default) |
| **9** | No early playtesting | 🟡 Medium | 40% | Weekly builds, 2-3 trusted testers |
| **10** | Legal notice | 🟢 Low | 5% | Clear disclaimer |

---

## 🎯 DIFFERENTIATION: Pick One

The project needs to answer: **"Why play THIS over Project Highrise or just emulating SimTower?"**

### Option A: "SimTower for a New Generation" (RECOMMENDED)
- Web-first (instant play, no install)
- Modern UX (Tower Pulse, tiered elevator UI)
- Accessible (colorblind, mobile-friendly)
- Streamlined for 15-30 minute sessions
- **Differentiation:** Accessibility + Modern UX

### Option B: "SimTower Hardcore"
- Multiplayer leaderboards
- Challenge scenarios with rankings
- Speedrun mode with replays
- **Differentiation:** Competition

### Option C: "SimTower Evolved"
- New building types (coworking, cloud kitchens)
- Climate/sustainability mechanics
- Modern tower problems
- **Differentiation:** Relevance

### Recommended Positioning Statement

> **OpenTower is the SimTower successor that gets elevators right — where elevator management is the core puzzle, not a utility, and every decision creates visible, satisfying results. Play instantly in your browser.**

---

## 📦 IMMEDIATE ACTION ITEMS

### This Week (Before Writing More Code)

- [ ] **Validate art pipeline** - Generate 20 test sprites (Office, Person, Elevator, Lobby, Sky)
- [ ] **Accept revised timeline** - 12-14 months, not 7-8
- [ ] **Define "SimTower Lite" scope** - What ships if we run out of time?
- [ ] **Set up public accountability** - Devlog, numbered builds, community
- [ ] **Research OpenSkyscraper elevator algorithm** - Don't reinvent

### Week 2-3

- [ ] **START T001: Building Placement** - Nothing else matters until players can click
- [ ] **Copy LOOK algorithm** - From OpenSkyscraper
- [ ] **Write one-sentence differentiation** - "OpenTower is..."

### Month 1

- [ ] **Get external feedback** - Even on placeholder graphics
- [ ] **Define success metrics** - How do we KNOW each phase is done?
- [ ] **Schedule monthly breaks** - Burnout prevention is mandatory
- [ ] **Design Tower Pulse widget** - Mockup before Week 17

---

## 💰 SUSTAINABILITY

### Revenue Model (Phased)

| Phase | Model | Expected |
|-------|-------|----------|
| Alpha | Free web demo | $0 (audience building) |
| v1.0 | itch.io "pay what you want" | $100-500/mo |
| Post-launch | Steam at $9.99 | $1K-10K total (indie ceiling) |

**Reality check:** This is a passion project. At $0-10K revenue over 14 months, it's a hobby with benefits, not a business.

---

## ✅ FINAL VERDICT

### Proceed with:
1. **Major scope reduction** (40-50% cut)
2. **Revised 14-month timeline**
3. **Art pipeline validation THIS WEEK**
4. **Clear differentiation choice** (Option A: Modern Accessibility)
5. **Public accountability setup**
6. **Tower Pulse widget** (UX critical)
7. **Tiered elevator UI** (accessibility critical)
8. **LOOK algorithm from OpenSkyscraper** (don't reinvent)

### Stop doing:
1. Planning for "99% fidelity"
2. Designing for 15,000 people
3. Adding more interfaces without implementations
4. Assuming 20 hours/week productivity
5. Building complex elevator UI without tiers

### Success probability:

| Outcome | Probability |
|---------|-------------|
| Ships v1.0 in 7-8 months | **10%** |
| Ships v1.0 in 12-14 months | **50%** |
| Ships "SimTower Lite" in 10-12 months | **70%** |
| Ships Alpha but stalls | 20% |
| Project abandoned | 15% |

---

## One-Sentence Summary

**OpenTower has excellent architecture and deep SimTower knowledge, but will fail unless scope is cut by 40%, timeline extended to 14 months, and the team embraces building "SimTower Lite" with modern UX (Tower Pulse, tiered elevator programming) instead of a museum piece.**

---

*"The projects that ship are the ones that know when to stop."*  
— Project Manager

*"You're building a museum piece when you should be building a game people want to play today."*  
— Product Manager

*"90% scaffolding, 0% gameplay."*  
— Engineering Audit

*"The elevator programming UI is the game's soul AND its biggest accessibility risk."*  
— UX Research

---

**Next Step:** Start T001 (Building Placement System) and generate 20 test sprites in parallel. Everything else is blocked.

---

## Appendix: New Concepts Added (v2)

### From Engineer Review:
- SharedArrayBuffer + Web Worker architecture pattern
- LOOK algorithm for elevators (vs SCAN)
- Two-level pathfinding (Transport Graph + A*)
- Per-tick budget analysis
- Zone assignment for multi-car coordination

### From UX Research:
- Tower Pulse dashboard widget
- Decision Echo feedback system
- Tiered Elevator Programming (Simple/Zone/Expert)
- Accessibility requirements (colorblind, font scaling)
- Mobile/touch adaptations
- Visual Schedule Board concept
