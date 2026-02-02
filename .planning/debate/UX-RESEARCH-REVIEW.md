# UX Research Review: OpenTower
**Reviewer:** UX Research Manager (Simulation Games Specialist)  
**Background:** Planet Zoo, Factorio, Dwarf Fortress Steam Release  
**Date:** 2025-01-30

---

## Executive Summary

OpenTower has strong foundational design rooted in SimTower's proven mechanics. However, several UX patterns that worked in 1994 need modernization. This review identifies 10 critical areas where UX investment will determine whether OpenTower reaches mainstream players or remains a nostalgia piece for SimTower veterans.

**Key Finding:** The elevator programming UI is the game's soul AND its biggest accessibility risk. Get this right, and everything else follows.

---

## 1. Information Hierarchy Analysis

### What Players Need MOST (Priority Order)

| Priority | Information | Current Accessibility | Recommendation |
|----------|-------------|----------------------|----------------|
| 🔴 **P0** | Elevator wait times | Per-tenant tooltip | Needs aggregate view |
| 🔴 **P0** | Cash on hand | Top bar | ✅ Correct |
| 🟠 **P1** | Tenant stress (aggregate) | No clear mention | Add stress thermometer |
| 🟠 **P1** | Time of day / rush hour | Top bar | Add rush hour indicator |
| 🟡 **P2** | Current vs. capacity | Per-elevator | Needs summary panel |
| 🟡 **P2** | Income flow | Bottom ticker | Add trend indicator |
| 🟢 **P3** | Star progress | On evaluation only | Add progress bar |

### Critical Gap: The "Tower Health" Dashboard

**Problem:** Spec describes many metrics but no unified "at-a-glance" health indicator.

**Factorio Lesson:** The pollution/biter evolution bar tells you everything about threat level in one glance. Players check it constantly.

**Planet Zoo Lesson:** Animal welfare icons (green/yellow/red dots) let players scan 50 habitats in seconds.

**Recommendation:** Add a "Tower Pulse" mini-panel:

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

This collapses 5+ scattered metrics into one scannable widget.

---

## 2. Feedback Loops

### Current Feedback (from spec)

| Action | Feedback | Delay | Quality |
|--------|----------|-------|---------|
| Build elevator | Wait times improve | ~5-30 seconds | Indirect |
| Add car to shaft | Queues shrink | ~10 seconds | Indirect |
| Reprogram elevator | Changed behavior | Immediate | Direct |
| Build food court | Office stress decreases | ~1 day | Very delayed |
| Fire dispatch | Fire extinguishes | 1-3 minutes | Direct |

### Problem: Delayed/Invisible Feedback

**Scenario:** Player adds 2nd elevator car to busy shaft.

**Current feedback:** "Eventually wait times go down... somewhere."

**Better feedback:**
1. **Immediate:** Toast notification "Shaft A capacity +8 passengers"
2. **5 seconds:** Waiting passengers board new car (visible)
3. **30 seconds:** Wait time indicator updates from red → yellow
4. **1 minute:** Trend arrow shows improvement

**Dwarf Fortress Steam Lesson:** Added "job completion" popups and satisfaction indicators that the ASCII version lacked. Made cause-effect visible. Player retention doubled.

### Recommendation: "Decision Echo" System

When player makes a significant change, show a small summary card 1 minute later:

```
┌─────────────────────────────────────────┐
│ 📊 IMPACT REPORT: Elevator Car Added    │
├─────────────────────────────────────────┤
│ Shaft A, Car 3                          │
│                                         │
│ Wait times:  2:15 → 1:42 (-33 sec) ✓   │
│ Passengers:  +24 served this hour       │
│ Bottleneck:  Still floor 7-8 lobby      │
│                                         │
│              [Dismiss] [Details]        │
└─────────────────────────────────────────┘
```

---

## 3. Cognitive Load: Elevator Programming UI

### Current Design (from spec)

```
[Car ID] [Shaft A, Car 2]
┌─────────────────────────────────────────┐
│ Floors Served:                          │
│ [x] Ground (Lobby)                      │
│ [ ] 1                                   │
│ [ ] 2                                   │
│ [x] 3                                   │
│ [x] 4                                   │
│ ...                                     │
│ Mode: ⦿ Auto  ○ Manual                 │
│ Priority: ⦿ Balanced ○ Pickup ○ Delivery│
└─────────────────────────────────────────┘
```

### Cognitive Load Assessment

**Floor selection for a 60-floor tower = 60 checkboxes per car × 6 cars = 360 decisions**

This is **cognitive overload**. Most players will:
- Check every box (defeats purpose)
- Check nothing (confused)
- Abandon elevator programming entirely

### Comparison: How Other Games Handle Complex Assignment

**Factorio (Train Scheduling):**
- Visual route builder with drag-drop
- Templates you can copy/paste
- Auto-suggestions based on demand

**Planet Zoo (Staff Assignment):**
- Workzone painting (select area, not items)
- Smart defaults (auto-assign nearest)
- Override only when needed

**Dwarf Fortress (Labor Assignment):**
- Preset templates (miner, farmer, soldier)
- Bulk assignment tools
- Let simulation handle details

### Recommended: Tiered Elevator Programming

**Tier 1: "Simple" Mode (Default)**
```
┌─────────────────────────────────────────┐
│ 🛗 SHAFT A - QUICK SETUP               │
├─────────────────────────────────────────┤
│                                         │
│  Coverage: [Ground] to [Floor 15]       │
│                                         │
│  Strategy: ⦿ Even Spread (recommended)  │
│            ○ Bottom-Heavy               │
│            ○ Top-Heavy                  │
│            ○ Express (few stops)        │
│                                         │
│  Cars: [3 ▼] (2-6 available)           │
│                                         │
│  💡 Auto-configured for best coverage   │
│                                         │
│          [Apply] [Advanced ▸]           │
└─────────────────────────────────────────┘
```

**Tier 2: "Zone" Mode (Intermediate)**
```
┌─────────────────────────────────────────────────────────┐
│ 🛗 SHAFT A - ZONE ASSIGNMENT                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Floor 15 ┃░░░░░░░░░░░░░░░░░░░░░░░░░░░░┃ Sky Lobby    │
│  Floor 14 ┃████████░░░░░░░░░░░░░░░░░░░░┃              │
│  Floor 13 ┃████████░░░░░░░░░░░░░░░░░░░░┃              │
│  Floor 12 ┃████████░░░░░░░░░░░░░░░░░░░░┃ CAR 3       │
│  Floor 11 ┃████████████████░░░░░░░░░░░░┃              │
│  Floor 10 ┃████████████████░░░░░░░░░░░░┃              │
│  Floor 9  ┃████████████████░░░░░░░░░░░░┃ CAR 2       │
│  Floor 8  ┃████████████████████████░░░░┃              │
│  Floor 7  ┃████████████████████████░░░░┃              │
│  Floor 6  ┃████████████████████████████┃ CAR 1       │
│  Floor 5  ┃████████████████████████████┃              │
│  ...                                                    │
│  Ground   ┃████████████████████████████┃ ALL CARS    │
│                                                         │
│  [Drag zones to adjust] [Templates ▼] [Per-car ▸]     │
└─────────────────────────────────────────────────────────┘
```

**Tier 3: "Expert" Mode (Current checkbox design)**
- Available via [Advanced] button
- For players who want per-car, per-floor control
- Shows performance prediction

### Visual Programming Alternative: The "Schedule Board"

Inspired by Factorio's circuit network and train scheduler:

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🛗 ELEVATOR SCHEDULE BOARD                                [?] [×]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│     6AM   7AM   8AM   9AM  10AM  11AM  12PM   1PM   2PM   3PM      │
│  ═══╪═════╪═════╪═════╪═════╪═════╪═════╪═════╪═════╪═════╪═══▶    │
│                                                                     │
│  A1 ───●═══●●●●●●●═════════════════●●●●●═════════════●●●●●●●───    │
│  A2 ───●═══●●●●●●●═════════════════●●●●●═════════════●●●●●●●───    │
│  A3 ───●════════════●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●════════───    │
│                                                                     │
│  ●●● = High demand   ═══ = Normal   ─── = Low/Idle                 │
│                                                                     │
│  [Rush Hour Preset] [Add Rule] [Simulate Day]                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Accessibility

### Current Gaps Identified

| Issue | Spec Status | Impact | Priority |
|-------|-------------|--------|----------|
| Colorblind modes | Not mentioned | ~8% of male players | HIGH |
| Pause for thinking | ✅ Mentioned | Good | - |
| Speed controls | ✅ 1x/2x/5x/pause | Good | - |
| Screen reader support | Not mentioned | Small % but important | MEDIUM |
| Font scaling | Not mentioned | Aging gamer population | HIGH |
| Key rebinding | Not mentioned | Standard expectation | MEDIUM |

### Color Dependency Analysis

From the spec, these systems rely on color:

1. **Stress indicators:** Green → Yellow → Orange → Red
2. **Wait time feedback:** Green (<30s) → Yellow → Orange → Red
3. **Overlays:** Heat maps, traffic flow
4. **Tenant mood:** Color-coded people sprites

### Colorblind Solutions

**Option 1: Symbol + Color (Recommended)**
```
Instead of:  🟢 Normal  🟡 Warning  🟠 Problem  🔴 Critical

Use:         ✓ Normal   ⚡ Warning   ⚠ Problem   ✕ Critical
             (green)    (yellow)    (orange)    (red)
```

**Option 2: Pattern Overlay**
- Diagonal stripes for warning
- Cross-hatch for problem
- Solid fill for critical

**Option 3: Shape Coding**
- Circle = good
- Triangle = warning
- Square = problem
- Octagon = critical

### Pause-and-Plan Accessibility

**Current:** Pause button exists

**Enhancement:** "Planning Mode" that:
- Pauses time automatically when opening build menu
- Shows projected outcomes of placements
- Resumes when player confirms
- Can be disabled by experienced players

### Recommended Accessibility Settings Panel

```
┌─────────────────────────────────────────┐
│ ⚙️ ACCESSIBILITY                        │
├─────────────────────────────────────────┤
│                                         │
│ Vision                                  │
│ ├─ Colorblind Mode: [Deuteranopia ▼]   │
│ ├─ High Contrast:   [■□□□] Off         │
│ ├─ UI Scale:        [100% ▼]           │
│ └─ Icon Labels:     [On/Off]           │
│                                         │
│ Gameplay                                │
│ ├─ Auto-Pause Build: [On/Off]          │
│ ├─ Slower Emergencies: [On/Off]        │
│ └─ Extended Timers:  [On/Off]          │
│                                         │
│ Audio                                   │
│ ├─ Visual Alerts:   [On/Off]           │
│ └─ Subtitles:       [On/Off]           │
│                                         │
└─────────────────────────────────────────┘
```

---

## 5. Mobile/Touch Considerations

### Current UI Elements vs. Touch Feasibility

| Element | Current Design | Touch-Friendly? | Adaptation Needed |
|---------|----------------|-----------------|-------------------|
| Build placement | Click & drag | ⚠️ Needs work | Pinch-zoom + tap |
| Floor checkboxes | Small toggles | ❌ Too small | Larger tap targets |
| Elevator car selection | Tiny icons | ❌ Too small | Bottom sheet |
| Speed controls | Top bar buttons | ⚠️ Marginal | Swipe gesture |
| Zoom/pan | Scroll/keyboard | ❌ Missing | Pinch-zoom |
| Context menus | Right-click | ❌ No equivalent | Long-press |

### Critical Touch Targets

**Minimum touch target: 44×44 points (Apple HIG) / 48×48dp (Material)**

Current spec implies 8×16 pixel people sprites scaled to 32×64 at 4K.  
At standard DPI, this is **borderline unselectable on touch**.

### Mobile UI Recommendations

**1. Radial Build Menu (replaces sidebar)**
```
              [Hotel]
                 │
    [Office] ────●──── [Food]
                 │
             [Elevator]
             
    Long-press anywhere → radial menu appears
    Drag to selection → release to place
```

**2. Bottom Sheet for Details**
```
┌─────────────────────────────────────────┐
│  ─────────────────────────────────────  │  ← Drag handle
│                                         │
│  🛗 Elevator Shaft A                    │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│  [Program] [Add Car] [Demolish]         │
│                                         │
│  Cars: 3/6  |  Load: 67%  |  Wait: 45s  │
│                                         │
└─────────────────────────────────────────┘
```

**3. Two-Finger Rotation for Sky Lobbies**
- View tower from different angles
- Essential for understanding 3D elevator routing

**4. Gesture Reference**
| Gesture | Action |
|---------|--------|
| Tap | Select |
| Long-press | Context menu |
| Pinch | Zoom |
| Two-finger drag | Pan |
| Swipe left/right | Change floor view |
| Swipe down on top bar | Quick stats |

### Mobile-First vs. Mobile-Port Decision

**Recommendation: Design for desktop, adapt for mobile**

Simulation games of this complexity rarely succeed as mobile-first. However, a well-adapted port can find audience (see: Prison Architect Mobile, Civilization VI Mobile).

**Minimum Viable Mobile:**
- Tablet only (no phone)
- Simplified build menu
- Auto-elevator programming (can't do per-floor on touch)
- Longer time scales (less rush-hour stress)

---

## 6. Competitor Comparison

### Project Highrise

| Feature | Project Highrise | OpenTower (Proposed) | Winner |
|---------|------------------|----------------------|--------|
| Elevator complexity | Simplified (auto-zones) | Full programming | Draw (different audiences) |
| Visual clarity | Clean, modern | Pixel art (nostalgic) | Highrise |
| Tenant satisfaction UI | Star ratings per tenant | Stress number + color | Needs work |
| Build feedback | Ghost preview | Not specified | Highrise |
| Overlay system | Multiple data views | Heat maps mentioned | Draw |
| Tutorial | Extensive, guided | "Progressive tooltips" | Highrise |
| Time controls | Similar | Similar | Draw |

**Highrise's UX Wins:**
1. **Ghost building preview** - See exactly what you're placing before committing
2. **Tenant need icons** - Clear symbols for what each tenant type wants
3. **Service connection lines** - Visual showing which elevators serve which floors
4. **Prestige meter** - Single number summarizing building quality

**OpenTower Should Steal:**
- Ghost preview system
- Service connection visualization
- Clearer tenant need icons

### Theme Hospital / Two Point Hospital

| Feature | Two Point Hospital | Relevance to OpenTower |
|---------|-------------------|------------------------|
| Queue visualization | Patients line up visibly | Elevator queues should be equally clear |
| Staff assignment | Drag staff to rooms | Could inspire elevator car assignment |
| Room templates | Pre-built layouts | Elevator "zone templates" |
| Thought bubbles | Show patient needs | Already in spec ✓ |
| Training UI | Clear skill trees | N/A for OpenTower |

**Lesson:** Two Point made healthcare management accessible by making invisible systems visible. OpenTower needs same treatment for elevator mechanics.

### Cities: Skylines

| Feature | Cities: Skylines | Application to OpenTower |
|---------|------------------|--------------------------|
| Traffic overlay | Heat map of congestion | Elevator congestion heat map |
| Info views | Toggle different data layers | Toggle stress/income/traffic |
| Chirper (social feed) | Building feedback as social posts | Tenant "reviews" of your tower |
| District painting | Zone areas with brush | Elevator zone painting |

### Dwarf Fortress (Steam)

| Feature | DF Steam Release | OpenTower Parallel |
|---------|------------------|-------------------|
| Complexity | Extremely high | High |
| Onboarding | Extensive tutorial | Needs similar investment |
| Info density | Very high, layered | Needs layering |
| Pause-and-plan | Essential | Already included ✓ |
| Hotkey everything | 200+ shortcuts | Needs hotkey system |

**DF's Hard-Won Lesson:** The game was always great, but inaccessible. Steam release added:
- Visual clarity
- Mouse-driven UI (not just keyboard)
- Contextual help
- Consistent visual language

OpenTower can learn from this transformation.

---

## 7. First 5 Minutes (New Player Experience)

### Current Onboarding (from spec)

```
1. "Welcome to OpenTower..."
2. Guided build: Place one office floor
3. "Tenants need elevators. Let's add one."
4. Watch first tenant move in
5. "Now add fast food..."
6. Fast-forward to end of quarter
7. "You're profitable! Now it's your tower."
```

### Problems with This Approach

1. **Too fast** - 7 steps to "now you're on your own"
2. **Doesn't teach elevator programming** - The core mechanic!
3. **No failure state** - Player doesn't learn consequences
4. **No "aha moment"** - When does player feel clever?

### Recommended First 5 Minutes

**Minute 0-1: The Hook**
```
[Cinematic: Camera rises from ground level past a bustling 50-floor tower]
[Zooms into a stressed office worker waiting for elevator, checking watch]
[Wait time counter: 3:42... 3:43... 3:44...]
[Worker throws hands up, storms to stairs]

Text: "Every empire rises... and falls."

[Cut to empty lot]

Text: "This one's yours."
```

**Minute 1-2: First Build (Guided)**
- Place lobby (auto-placed, player just confirms)
- Place first office (1 click)
- Place first elevator (1 click)
- **Immediate:** First tenant walks in

**Minute 2-3: First Success**
- Tenant takes elevator (player watches)
- Arrives at office (celebration sound)
- Cash register ching!
- "Your first rent! Every tenant counts."

**Minute 3-4: First Problem**
- 3 more tenants spawn
- All wait for elevator
- Wait timer appears over their heads
- One turns yellow (stress)
- **Prompt:** "Your elevator is overwhelmed. Add another car?"

**Minute 4-5: First Solution**
- Player adds car
- Wait times drop
- Tenants turn green
- **Celebration:** "You solved your first traffic problem!"
- **Unlock:** Build menu fully opens

### The "Aha Moment"

**Target feeling:** "Oh! More tenants = more elevator demand = need smarter systems!"

This should happen in first 5 minutes. Current spec delays it to mid-game.

### Alternative: Scenario-Based Tutorial

Instead of one linear tutorial, offer 3 "scenarios":

1. **"The Basics"** (required) - Current tutorial, simplified
2. **"The Rush Hour"** - Pre-built tower, player must solve elevator crisis
3. **"The Expansion"** - Working tower, player must add new floors

Scenarios can be replayed, serve as practice sandbox.

---

## 8. Expert Mode: What Power Users Need

### Novice vs. Expert Needs

| Feature | Novice Needs | Expert Needs |
|---------|--------------|--------------|
| Elevator setup | "Just work, please" | Per-car floor programming |
| Statistics | "Am I doing okay?" | Exact wait time distributions |
| Build speed | Slow, learn as you go | Instant placement |
| Tooltips | Everywhere | Hideable |
| Warnings | Frequent alerts | Aggregated notifications |
| Time speed | 1x-2x comfortable | 10x+ for optimization |
| Save management | Auto-save | Named saves, quicksave |
| Undo | "Oops, wrong building" | Precise undo stack |

### Expert Features to Add

**1. Statistics Dashboard**
```
┌─────────────────────────────────────────────────────────────────────┐
│ 📊 TOWER ANALYTICS                                            [×]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ELEVATOR PERFORMANCE          │ TENANT DISTRIBUTION                 │
│ ┌──────────────────────────┐ │ ┌──────────────────────────────┐   │
│ │     Wait Time Today      │ │ │ Stress Levels                │   │
│ │                          │ │ │                              │   │
│ │  3min ┤          ●      │ │ │  0-20  ████████████████ 67%  │   │
│ │  2min ┤      ●●●●       │ │ │  21-40 ████████░░░░░░░░ 22%  │   │
│ │  1min ┤  ●●●●●●●●●●●    │ │ │  41-70 ████░░░░░░░░░░░░  8%  │   │
│ │    0  ┼────────────────│ │ │  71+   ██░░░░░░░░░░░░░░  3%  │   │
│ │       6AM    12PM   6PM │ │ │                              │   │
│ └──────────────────────────┘ │ └──────────────────────────────┘   │
│                               │                                     │
│ [Export CSV] [Compare Days] [Set Alerts]                           │
└─────────────────────────────────────────────────────────────────────┘
```

**2. Hotkey System**
```
Building:         [B] → Opens build menu
  └─ Office:      [B][O]
  └─ Hotel:       [B][H]
  └─ Elevator:    [B][E]
  
Speed:            [1][2][3][4] = Pause/1x/2x/5x
                  [Space] = Toggle pause

Selection:        [Tab] = Cycle through alerts
                  [Esc] = Deselect

Overlays:         [F1] = Stress map
                  [F2] = Traffic flow
                  [F3] = Income view
                  [F4] = Elevator load

Quick Actions:    [D] = Demolish mode
                  [C] = Clone tool
                  [Z] = Undo
```

**3. Clone/Template System**
- Select a building → [C] → Place copies
- Save elevator configurations as templates
- "Paste floor layout" for repetitive designs

**4. Notification Filtering**
```
┌─────────────────────────────────────────┐
│ 🔔 NOTIFICATION SETTINGS               │
├─────────────────────────────────────────┤
│                                         │
│ Show alerts for:                        │
│ [✓] Fire/Emergency                      │
│ [✓] Elevator wait > 2 min               │
│ [ ] Tenant move-in                      │
│ [ ] Tenant move-out                     │
│ [✓] VIP arrival                         │
│ [✓] Star rating change                  │
│ [ ] Income received                     │
│                                         │
│ Alert style:                            │
│ ⦿ Popup + sound                         │
│ ○ Ticker only                           │
│ ○ Log only                              │
└─────────────────────────────────────────┘
```

**5. Advanced Time Control**
- 10x speed for experts (dangerous but requested)
- Scheduled pause: "Pause at next rush hour"
- Event preview: "Show me tomorrow's schedule"

---

## 9. Error Prevention

### Common Player Mistakes (Predicted)

| Mistake | Consequence | Prevention |
|---------|-------------|------------|
| Building without elevator access | Tenants can't reach floor | Connection warning |
| Single elevator for tall tower | Death spiral | Capacity warning |
| No food for office workers | Stress accumulation | "Missing amenity" icon |
| Spending all money before payday | Can't afford fixes | Projected balance warning |
| Ignoring small fires | Fire spread | Escalating alerts |
| Demolishing occupied building | Angry tenants | Confirmation dialog |

### Prevention Mechanisms

**1. Pre-Build Validation**
```
Placing: Office Floor 23

⚠️ WARNING: No elevator reaches floor 23
   Tenants will not be able to access this floor.
   
   [Place Anyway] [Cancel] [Show Elevator Coverage]
```

**2. The "Advisor" System**
```
┌─────────────────────────────────────────┐
│ 💡 ADVISOR TIP                          │
├─────────────────────────────────────────┤
│                                         │
│ "Your elevator shaft A is at 95%        │
│  capacity during rush hour.             │
│                                         │
│  Consider:                              │
│  • Adding another car (+$10,000)        │
│  • Building a second shaft (+$50,000)   │
│  • Creating a sky lobby (advanced)"     │
│                                         │
│  [Show Me] [Dismiss] [Don't Show Again] │
└─────────────────────────────────────────┘
```

**3. Undo System**

**Must support:**
- Single action undo (Ctrl+Z)
- Multi-step undo (up to 50 actions)
- Session-persistent (survives save/load)

**Undo should NOT work for:**
- Time passage (can't undo a day)
- Tenant arrivals/departures
- Random events

**4. Soft vs. Hard Failures**

| Failure Type | Current | Recommendation |
|--------------|---------|----------------|
| Bankruptcy | Game over? | Grace period + loan offer |
| Mass moveout | Silent | "Crisis mode" warning |
| Building collapse | Not in spec | N/A |
| Fire disaster | Unit destruction | Insurance option |

**Recommendation:** No "hard fail" states. Players should always have recovery options (even if painful).

**5. Confirmation Dialogs**

Require confirmation for:
- Demolish anything costing >$50,000
- Demolish occupied buildings
- Demolish elevators with passengers
- Taking loans
- Resetting elevator programming

**Anti-pattern to avoid:** Confirmation for routine actions. Don't ask "Are you sure?" for placing a $40,000 fast food shop.

---

## 10. Data Visualization

### Required Overlays (from analysis)

**1. Stress Heat Map**
```
┌──────────────────────────────────────────────────────┐
│ Floor 10 │░░░░░░░░▒▒▒▒▒▒▒▒████████░░░░░░░░│ Offices │
│ Floor 9  │░░░░░░░░▒▒▒▒▒▒▒▒████████░░░░░░░░│ Offices │
│ Floor 8  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ Condos  │
│ Floor 7  │████████████████░░░░░░░░░░░░░░░░│ Hotels  │
│ Floor 6  │████████████████████████░░░░░░░░│ Hotels  │
│ ...                                                  │
└──────────────────────────────────────────────────────┘
░░░ = Low stress   ▒▒▒ = Medium   ███ = High
```

**2. Elevator Traffic Flow**
```
                    ▲▲▲ (heavy upward flow)
                    ││
Floor 10 ══════════╪╪╪═══════════ 
                    ││
Floor 9  ══════════╪╪╪═══════════
                    │▼
Floor 8  ═══════════╪════════════
                    │
Floor 7  ═══════════╪════════════
                    ▲▲▲▲▲ (very heavy)
Ground   ══════════╪╪╪╪╪═════════
```

**3. Income/Expense by Floor**
```
Floor 10: +$2,000 ████████▒▒ Office
Floor 9:  +$1,500 ██████▒▒▒▒ Office  
Floor 8:  +$3,000 ████████████ Condo (high value)
Floor 7:  +$800   ███▒▒▒▒▒▒▒ Hotel (low occupancy)
Floor 6:  -$200   ██████████ Hotel (costs > income)
...
```

**4. Wait Time Distribution Graph**

Small inline sparkline showing last 24 hours:
```
Shaft A wait time: [▁▂▃▅▇▅▃▂▁▁▁▂▃▆▇▅▃▂▁] avg: 47s
                    6AM      12PM     6PM
```

**5. Population Density**
```
                    │ PEOPLE PER FLOOR (current)
Floor 10            │ ████████████████████████ 120
Floor 9             │ ██████████████████ 90
Floor 8             │ ██████ 30 (condos - some away)
Floor 7             │ ████████████ 60
Lobby               │ █████████████████████████████████████ 185
```

### Graph Types Needed

| Data | Graph Type | Update Frequency |
|------|------------|------------------|
| Wait times | Line graph (24h) | Real-time |
| Stress distribution | Histogram | Every game-hour |
| Income/expenses | Stacked bar | Daily |
| Population | Line graph (weekly) | Daily |
| Star progress | Progress bar | On evaluation |
| Elevator load | Gauge (per shaft) | Real-time |

### Dashboard Mockup

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📊 TOWER DASHBOARD                                                    [×]  │
├───────────────────────────────────┬─────────────────────────────────────────┤
│                                   │                                         │
│  POPULATION         ELEVATOR      │  STRESS DISTRIBUTION                    │
│  ┌────────────────┐ ┌──────────┐  │  ┌─────────────────────────────────┐   │
│  │    /\          │ │  ████    │  │  │ Happy ███████████████████ 72%   │   │
│  │   /  \    /\   │ │  ████    │  │  │ OK    █████████ 18%             │   │
│  │  /    \  /  \  │ │  ████    │  │  │ Stressed ████ 7%                │   │
│  │ /      \/    \ │ │  ▒▒▒▒    │  │  │ Critical █ 3%                   │   │
│  │/                │ │  ░░░░    │  │  └─────────────────────────────────┘   │
│  └────────────────┘ └──────────┘  │                                         │
│  847 (+12 today)    67% capacity  │  INCOME TODAY        ALERTS             │
│                                   │  ┌───────────────┐  ┌─────────────────┐ │
│  STAR PROGRESS                    │  │ Hotels  $4.2K │  │ ⚠ Floor 12 wait │ │
│  ████████████░░░░░░ 67%           │  │ Offices  $0   │  │   time > 2min   │ │
│  2★ → 3★ (need 300 pop)           │  │ Food    $1.8K │  │                 │ │
│                                   │  │ Shops   $2.1K │  │ ⚠ Hotel 4B low  │ │
│                                   │  │ ──────────── │  │   occupancy     │ │
│                                   │  │ Total   $8.1K │  └─────────────────┘ │
│                                   │  └───────────────┘                      │
├───────────────────────────────────┴─────────────────────────────────────────┤
│  [Overlays ▼]  [Time Range: 24h ▼]  [Export]  [Fullscreen]                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Summary: Top 10 Recommendations

| Priority | Recommendation | Effort | Impact |
|----------|----------------|--------|--------|
| 1 | **Tiered elevator programming UI** | High | Critical |
| 2 | **Tower Pulse health widget** | Medium | High |
| 3 | **Decision Echo feedback system** | Medium | High |
| 4 | **Colorblind mode + symbol coding** | Low | Medium |
| 5 | **Enhanced first 5 minutes** | Medium | Critical |
| 6 | **Pre-build validation warnings** | Low | High |
| 7 | **Expert statistics dashboard** | High | Medium |
| 8 | **Ghost preview for building** | Low | High |
| 9 | **Advisor system for beginners** | Medium | High |
| 10 | **Robust undo system** | Medium | High |

---

## Appendix: Wireframe Sketches

### A. Main Game HUD (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ ⏸ 1x 2x 5x │ 📅 Mon 9:47 AM │ 💰 $127,450 │ 👥 847 │ ⭐⭐☆☆☆ │ ⚠ 2 │ [Tower Pulse] │
├─────────────┬───────────────────────────────────────────────────────────────┬───────┤
│             │                                                               │       │
│  BUILD      │                                                               │ INFO  │
│  ─────      │                                                               │ ───── │
│  [Office]   │                                                               │       │
│  [Hotel]    │              M A I N   G A M E   V I E W                      │ (ctx) │
│  [Food]     │                                                               │       │
│  [Shop]     │                   (tower cross-section)                       │ panel │
│  [Service]  │                                                               │       │
│  ─────      │                                                               │ shows │
│  [Elevator] │                                                               │       │
│  [Stairs]   │                                                               │ sel.  │
│  ─────      │                                                               │       │
│  [Demolish] │                                                               │ item  │
│             │                                                               │       │
├─────────────┴───────────────────────────────────────────────────────────────┴───────┤
│ 📰 Office tenant moved in (Floor 5) │ Hotel guest checked out │ +$200 income        │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### B. Mobile/Tablet Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ⏸  1x  2x  5x  │  💰 $127K  │  👥 847  │  ⭐⭐  │  [≡]        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                                                                 │
│                                                                 │
│                   M A I N   G A M E   V I E W                   │
│                                                                 │
│                     (pinch to zoom, drag to pan)                │
│                                                                 │
│                                                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│    [🏢]      [🛗]      [📊]      [⚙️]      [💰]               │
│   Build   Elevators  Stats   Settings  Finance                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Bottom tab bar replaces side panels. Build via radial menu (long-press).
```

### C. Elevator Zone Editor (Intermediate Mode)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 🛗 ELEVATOR ZONE EDITOR - Shaft A                                         [?] [×]  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│     Car 1        Car 2        Car 3        Car 4        │  PERFORMANCE             │
│    [Standard]   [Standard]   [Standard]   [Express]     │  ──────────              │
│                                                          │                          │
│  F15 ┃          ┃            ┃████████████┃████████████┃│  Wait: 42s avg           │
│  F14 ┃          ┃            ┃████████████┃            ┃│  Load: 67%               │
│  F13 ┃          ┃            ┃████████████┃            ┃│  Bottleneck: F7-F8       │
│  F12 ┃          ┃████████████┃████████████┃            ┃│                          │
│  F11 ┃          ┃████████████┃████████████┃            ┃│  DEMAND PREVIEW          │
│  F10 ┃          ┃████████████┃            ┃            ┃│  ──────────              │
│  F9  ┃████████████████████████┃            ┃            ┃│  F7: ████████ HIGH      │
│  F8  ┃████████████████████████┃            ┃            ┃│  F8: ████████ HIGH      │
│  F7  ┃████████████████████████┃            ┃            ┃│  F15: ██████ MED        │
│  F6  ┃██████████┃            ┃            ┃            ┃│  F10: ████ LOW          │
│  ...                                                     │                          │
│  F1  ┃██████████┃████████████┃████████████┃████████████┃│  [Simulate Rush Hour]   │
│  GF  ┃████████████████████████████████████████████████┃│                          │
│                                                          │                          │
│  ████ = Car stops here    Click + drag to paint zones   │                          │
│                                                                                     │
│  [Templates ▼]  [Auto-Optimize]  [Reset]      [Apply Changes]  [Cancel]            │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Final Notes

OpenTower has the mechanical foundation of a great simulation game. The challenge is **surfacing complexity gradually** without overwhelming new players or boring experts.

**The "Factorio Principle":** Simple to start, infinitely deep to master. Every system should have an easy default and an expert override.

**The "Planet Zoo Lesson":** Beautiful feedback makes management fun. Players need to *see* their tower thriving or struggling, not just read numbers.

**The "Dwarf Fortress Warning":** Complexity without clarity is cruelty. Every visible system needs explanation. Every invisible system needs surfacing.

If OpenTower nails the elevator programming UI and feedback loops, everything else is polish. If it fails there, nothing else will save it.

---

*Review complete. Available for follow-up questions or detailed wireframes on specific systems.*
