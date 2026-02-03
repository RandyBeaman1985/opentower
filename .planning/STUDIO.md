# OpenTower Game Studio - Complete Production Architecture

**Mission:** Recreate SimTower with the precision and quality of the 1994 original  
**Philosophy:** Quality over speed. Every pixel, every sound, every interaction must feel right.  
**Target:** A game indistinguishable from loading the original CD-ROM, but running in a modern browser.

---

## Part 1: Studio Departments

### 🎮 1. GAME DESIGN DEPARTMENT

**Purpose:** Define exactly what SimTower IS - every mechanic, every rule, every feeling.

#### Roles & Sub-Agents

| Role | Responsibility | Sub-Agent Model | Output |
|------|----------------|-----------------|--------|
| **Lead Designer** | Overall vision, final decisions | Claude Opus | GAME_DESIGN_DOC.md |
| **Mechanics Researcher** | Document original game rules | Claude Sonnet | MECHANICS/ folder |
| **Balance Analyst** | Economic tuning, difficulty curves | Claude Sonnet | BALANCE.md |
| **UX Designer** | Player flow, onboarding, feedback | Claude Sonnet | UX_FLOWS.md |

#### Deliverables

1. **MECHANICS/BUILDINGS.md** - Every building type with:
   - Cost to build
   - Dimensions (tiles wide × floors tall)
   - Income generation rules
   - Tenant behavior patterns
   - Stress factors
   - Upgrade paths

2. **MECHANICS/ELEVATORS.md** - The core system:
   - Elevator types and capacities
   - Wait time calculations
   - Stress accumulation
   - Rush hour behavior
   - Express vs local logic

3. **MECHANICS/TENANTS.md** - People simulation:
   - Tenant types (office workers, hotel guests, residents, shoppers)
   - Daily schedules
   - Satisfaction factors
   - Move-in/move-out triggers
   - Pathfinding behavior

4. **MECHANICS/PROGRESSION.md** - Star ratings:
   - Population thresholds
   - Requirements for each star
   - Unlocks at each tier
   - Metro/cathedral/tower requirements

5. **MECHANICS/EVENTS.md** - Random events:
   - Fire mechanics
   - VIP visits
   - Terrorist scenarios
   - Santa Claus
   - Weekend behavior changes

6. **BALANCE.md** - Economic model:
   - Starting funds
   - Income rates by building type
   - Operating costs
   - Optimal strategies
   - Difficulty progression

#### KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Mechanic Coverage | 100% | All original mechanics documented |
| Accuracy | 95%+ | Cross-referenced with wikis, gameplay videos, community knowledge |
| Completeness | No gaps | Every number, every rule, every edge case |

---

### 🎨 2. ART DEPARTMENT

**Purpose:** Every visual element must evoke the original's charm while being pixel-perfect in HD.

#### Roles & Sub-Agents

| Role | Responsibility | Tools | Output |
|------|----------------|-------|--------|
| **Art Director** | Visual style bible, approval | Claude Opus | STYLE_GUIDE.md |
| **Building Artist** | All building sprites | ImageFX + Manual | sprites/buildings/ |
| **UI Artist** | Menus, HUD, icons | ImageFX + Figma | sprites/ui/ |
| **Character Artist** | People, animations | ImageFX + Aseprite | sprites/people/ |
| **Effects Artist** | Particles, weather | Procedural code | effects/ |

#### Asset Pipeline

```
1. REFERENCE
   └── Capture original sprites from gameplay videos/screenshots
   └── Catalog every visual element

2. DESIGN
   └── Create style guide with color palettes, proportions
   └── Define HD upscale approach (2x? 4x? hand-drawn?)

3. PRODUCTION
   └── Generate base sprites with ImageFX (Imagen 4)
   └── Hand-correct in Aseprite for pixel-perfect alignment
   └── Export at multiple resolutions

4. INTEGRATION
   └── Import to PIXI.js sprite sheets
   └── Test in-game rendering
   └── Iterate until perfect
```

#### Deliverables

1. **sprites/buildings/** - Every building type:
   - Day variant
   - Night variant (lights on)
   - Empty state
   - Occupied states (multiple)
   - Construction animation frames
   - Demolition animation frames

2. **sprites/people/** - Tenant sprites:
   - Office worker (walking, standing, sitting)
   - Hotel guest (walking, with luggage)
   - Resident (casual clothing)
   - Service worker (uniform)
   - Security guard
   - VIP
   - Santa

3. **sprites/transport/** - Movement systems:
   - Elevator car (multiple sizes)
   - Elevator shaft
   - Escalator (animated)
   - Stairs
   - Lobby floor tiles

4. **sprites/ui/** - Interface elements:
   - Building menu icons
   - Star rating display
   - Clock/calendar
   - Fund display
   - Speed controls
   - Tool buttons

5. **sprites/effects/** - Visual feedback:
   - Construction dust
   - Money particles
   - Stress indicators
   - Fire/smoke
   - Weather (rain, snow)

#### KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Sprite Count | 200+ unique | Asset manifest |
| Style Consistency | 100% | Art Director review |
| Animation Smoothness | 12+ FPS | Frame count per animation |
| HD Quality | Crisp at 1080p | Visual inspection |

---

### 🔊 3. AUDIO DEPARTMENT

**Purpose:** Sound is 50% of the experience. Every click, every elevator, every ambient moment.

#### Roles & Sub-Agents

| Role | Responsibility | Tools | Output |
|------|----------------|-------|--------|
| **Audio Director** | Sound vision, mixing | Claude + DAW | AUDIO_DESIGN.md |
| **SFX Designer** | All sound effects | Original files + generation | sounds/sfx/ |
| **Ambient Designer** | Background atmosphere | Layering system | sounds/ambient/ |
| **Music Composer** | Background music | AI generation or licensing | sounds/music/ |

#### Sound Categories

1. **UI Sounds**
   - Menu click
   - Building select
   - Invalid placement (buzz)
   - Valid placement (satisfying thunk)
   - Notification pop

2. **Building Sounds**
   - Construction (multiple variants)
   - Demolition
   - Office ambience (phones, typing)
   - Restaurant ambience (chatter, dishes)
   - Hotel ambience (quiet, occasional door)

3. **Transport Sounds**
   - Elevator motor (continuous)
   - Elevator arriving (ding)
   - Doors opening/closing
   - Escalator hum
   - Footsteps on stairs

4. **Ambient Layers**
   - Morning birds
   - Daytime city hum
   - Evening transition
   - Night crickets
   - Rain (occasional event)

5. **Event Sounds**
   - Fire alarm
   - Fire truck siren
   - Star achievement fanfare
   - VIP arrival
   - Quarterly income "ka-ching"

#### Audio Integration

```typescript
// Layered ambient system
class AmbientManager {
  layers: {
    timeOfDay: AudioLayer,    // Birds → City → Crickets
    weather: AudioLayer,       // Clear → Rain
    population: AudioLayer,    // Quiet → Busy
    zoneSpecific: AudioLayer,  // Office sounds when zoomed on offices
  }
  
  update(gameState: GameState) {
    // Crossfade between layers based on time, weather, zoom level
  }
}
```

#### KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Sound Coverage | 100% actions have audio | Action audit |
| Mix Quality | No clipping, balanced levels | Audio analysis |
| Ambient Seamlessness | No jarring transitions | Playtest feedback |
| Original Authenticity | Recognizable to fans | Community feedback |

---

### 💻 4. ENGINEERING DEPARTMENT

**Purpose:** Rock-solid code that performs perfectly and enables all other departments.

#### Roles & Sub-Agents

| Role | Responsibility | Model | Focus Area |
|------|----------------|-------|------------|
| **Tech Lead** | Architecture decisions | Claude Opus | System design |
| **Core Engineer** | Game loop, ECS, performance | Claude Sonnet | src/core/ |
| **Rendering Engineer** | PIXI.js, sprites, effects | Claude Sonnet | src/rendering/ |
| **Gameplay Engineer** | Mechanics implementation | Claude Sonnet | src/gameplay/ |
| **UI Engineer** | Menus, HUD, overlays | Claude Sonnet | src/ui/ |
| **Audio Engineer** | Sound system, mixing | Claude Sonnet | src/audio/ |
| **Tools Engineer** | Dev tools, debug modes | Claude Sonnet | src/tools/ |

#### Code Architecture

```
src/
├── core/
│   ├── Game.ts              # Main game loop
│   ├── EventBus.ts          # Event system
│   ├── SaveLoad.ts          # Persistence
│   ├── InputHandler.ts      # Controls
│   └── TimeManager.ts       # Game clock
│
├── simulation/
│   ├── Tower.ts             # Building grid
│   ├── Building.ts          # Base building class
│   ├── buildings/           # Each building type
│   ├── Tenant.ts            # People simulation
│   ├── Transport.ts         # Elevator/stairs system
│   └── Economy.ts           # Money flow
│
├── rendering/
│   ├── TowerRenderer.ts     # Main renderer
│   ├── Camera.ts            # Pan/zoom
│   ├── SpriteManager.ts     # Asset loading
│   ├── DayNightCycle.ts     # Lighting
│   └── ParticleSystem.ts    # Effects
│
├── audio/
│   ├── SoundManager.ts      # Playback
│   ├── AmbientManager.ts    # Layered ambient
│   └── MusicManager.ts      # Background music
│
├── ui/
│   ├── BuildingMenu.ts      # Construction panel
│   ├── InfoPanel.ts         # Building details
│   ├── HUD.ts               # Top bar
│   ├── Tutorial.ts          # Onboarding
│   └── Modal.ts             # Popups
│
└── tools/
    ├── DebugOverlay.ts      # Dev tools
    ├── Profiler.ts          # Performance
    └── CheatConsole.ts      # Testing
```

#### Technical Standards

- TypeScript strict mode
- No `any` types
- Full JSDoc documentation
- Unit tests for core systems
- Integration tests for gameplay
- 60 FPS minimum performance
- <3 second initial load

#### KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Type Safety | 100% | No TypeScript errors |
| Test Coverage | 80%+ core systems | Jest coverage report |
| Performance | 60 FPS, 1000+ buildings | Profiler benchmarks |
| Load Time | <3 seconds | Lighthouse audit |
| Bundle Size | <2 MB | Build output |

---

### 🧪 5. QA DEPARTMENT

**Purpose:** Nothing ships broken. Every build is verified before deploy.

#### Roles & Sub-Agents

| Role | Responsibility | Tools | Output |
|------|----------------|-------|--------|
| **QA Lead** | Test strategy, bug triage | Manual + Claude | TEST_PLAN.md |
| **Automation Engineer** | CI/CD, automated tests | Playwright, Jest | tests/ |
| **Gameplay Tester** | Manual verification | Gameplay sessions | BUG_REPORTS.md |
| **Regression Tester** | Visual comparison | Percy/Chromatic | Visual diffs |

#### Test Suites

1. **Unit Tests** (`tests/unit/`)
   - Building placement validation
   - Economic calculations
   - Tenant pathfinding
   - Time progression

2. **Integration Tests** (`tests/integration/`)
   - Full game loop
   - Save/load cycle
   - Star progression
   - Event triggers

3. **Visual Regression** (`tests/visual/`)
   - Screenshot comparison
   - Animation verification
   - UI layout checks

4. **Gameplay Bots** (`tests/bots/`)
   - Automated playthrough
   - Economy stress test
   - Elevator stress test
   - Long-session stability

5. **Performance Tests** (`tests/perf/`)
   - FPS benchmarks
   - Memory usage
   - Load time
   - Large tower handling

#### CI/CD Pipeline

```yaml
on: push
jobs:
  verify:
    - npm run lint
    - npm run typecheck
    - npm run test:unit
    - npm run build
    
  integration:
    - npm run test:integration
    - npm run test:visual
    
  deploy:
    - vercel deploy --prod
    - npm run test:smoke (against production)
```

#### KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Test Pass Rate | 100% | CI dashboard |
| Bug Escape Rate | <1/week | Production bug count |
| Regression Rate | 0% | Visual diff failures |
| Build Success Rate | 99%+ | CI history |

---

### 📋 6. PRODUCTION DEPARTMENT

**Purpose:** Coordinate all departments, track progress, ship on schedule.

#### Roles & Sub-Agents

| Role | Responsibility | Tools | Output |
|------|----------------|-------|--------|
| **Producer** | Overall coordination | Notion + Claude | ROADMAP.md |
| **Sprint Manager** | Daily task tracking | GitHub Issues | Sprint boards |
| **Release Manager** | Deploy coordination | Vercel + GitHub | CHANGELOG.md |

#### Project Phases

```
PHASE 1: FOUNDATION (Week 1)
├── Complete game design documentation
├── Set up full test infrastructure
├── Implement core simulation
└── Basic rendering working

PHASE 2: CONTENT (Week 2)
├── All building types implemented
├── All sprites integrated
├── All sounds integrated
└── Full day/night cycle

PHASE 3: POLISH (Week 3)
├── Tutorial and onboarding
├── Visual effects and particles
├── Performance optimization
└── Bug fixing

PHASE 4: RELEASE (Week 4)
├── Final QA pass
├── Community beta testing
├── Bug fixes from feedback
└── Production launch
```

#### Daily Standup Format

```markdown
## Daily Status - YYYY-MM-DD

### Yesterday
- [x] Completed tasks

### Today
- [ ] Planned tasks

### Blockers
- Any issues needing resolution

### Metrics
- Build: PASS/FAIL
- Tests: XX% passing
- Open bugs: N
```

#### KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| On-Schedule Tasks | 90%+ | Sprint tracking |
| Blocker Resolution | <24 hours | Issue age |
| Daily Build Success | 100% | CI dashboard |
| Sprint Velocity | Consistent | Story points |

---

## Part 2: Detailed Task Breakdown

### Week 1: Foundation

#### Day 1-2: Documentation Sprint
- [ ] **MECH-001**: Document all building types with exact stats
- [ ] **MECH-002**: Document elevator mechanics completely
- [ ] **MECH-003**: Document tenant behavior patterns
- [ ] **MECH-004**: Document star rating requirements
- [ ] **MECH-005**: Document all random events
- [ ] **MECH-006**: Create economic balance sheet

#### Day 3-4: Infrastructure Sprint
- [ ] **INFRA-001**: Set up Jest test framework
- [ ] **INFRA-002**: Set up Playwright for integration tests
- [ ] **INFRA-003**: Set up visual regression testing
- [ ] **INFRA-004**: Create CI/CD pipeline
- [ ] **INFRA-005**: Set up automated deployment

#### Day 5-7: Core Simulation Sprint
- [ ] **CORE-001**: Implement Tower grid system
- [ ] **CORE-002**: Implement Building base class
- [ ] **CORE-003**: Implement Tenant system
- [ ] **CORE-004**: Implement Transport (elevators)
- [ ] **CORE-005**: Implement Economy system
- [ ] **CORE-006**: Implement Time progression
- [ ] **CORE-007**: Implement Save/Load

### Week 2: Content

#### Day 8-10: Buildings Sprint
- [ ] **BUILD-001**: Office (small, medium, large)
- [ ] **BUILD-002**: Fast Food (all variants)
- [ ] **BUILD-003**: Restaurant
- [ ] **BUILD-004**: Hotel (single, double, suite)
- [ ] **BUILD-005**: Condo
- [ ] **BUILD-006**: Retail shops
- [ ] **BUILD-007**: Movie theater
- [ ] **BUILD-008**: Party hall
- [ ] **BUILD-009**: Parking
- [ ] **BUILD-010**: Medical clinic
- [ ] **BUILD-011**: Recycling center
- [ ] **BUILD-012**: Metro station
- [ ] **BUILD-013**: Cathedral
- [ ] **BUILD-014**: Lobby types

#### Day 11-12: Transport Sprint
- [ ] **TRANS-001**: Standard elevator
- [ ] **TRANS-002**: Express elevator
- [ ] **TRANS-003**: Service elevator
- [ ] **TRANS-004**: Stairs
- [ ] **TRANS-005**: Escalator
- [ ] **TRANS-006**: Elevator scheduling AI

#### Day 13-14: Art Integration Sprint
- [ ] **ART-001**: Integrate all building sprites
- [ ] **ART-002**: Integrate people sprites
- [ ] **ART-003**: Integrate UI elements
- [ ] **ART-004**: Implement animations
- [ ] **ART-005**: Implement day/night lighting

### Week 3: Polish

#### Day 15-17: Audio Sprint
- [ ] **AUDIO-001**: Integrate all SFX
- [ ] **AUDIO-002**: Implement ambient system
- [ ] **AUDIO-003**: Add music layer
- [ ] **AUDIO-004**: Balance audio mix
- [ ] **AUDIO-005**: Add positional audio

#### Day 18-19: UX Sprint
- [ ] **UX-001**: Tutorial system
- [ ] **UX-002**: Help documentation
- [ ] **UX-003**: Keyboard shortcuts
- [ ] **UX-004**: Accessibility features
- [ ] **UX-005**: Settings menu

#### Day 20-21: Effects Sprint
- [ ] **FX-001**: Construction particles
- [ ] **FX-002**: Money particles
- [ ] **FX-003**: Fire effects
- [ ] **FX-004**: Weather effects
- [ ] **FX-005**: Screen shake/settle

### Week 4: Release

#### Day 22-24: QA Sprint
- [ ] **QA-001**: Full regression test
- [ ] **QA-002**: Performance profiling
- [ ] **QA-003**: Memory leak check
- [ ] **QA-004**: Browser compatibility
- [ ] **QA-005**: Mobile responsiveness

#### Day 25-26: Beta Sprint
- [ ] **BETA-001**: Deploy to beta URL
- [ ] **BETA-002**: Gather community feedback
- [ ] **BETA-003**: Triage reported bugs
- [ ] **BETA-004**: Priority fixes

#### Day 27-28: Launch Sprint
- [ ] **LAUNCH-001**: Final bug fixes
- [ ] **LAUNCH-002**: Production deploy
- [ ] **LAUNCH-003**: Announcement
- [ ] **LAUNCH-004**: Monitor for issues

---

## Part 3: Resource Requirements

### Tools Currently Available
- ✅ Claude Opus/Sonnet (orchestration, coding)
- ✅ GitHub (version control)
- ✅ Vercel (deployment)
- ✅ TypeScript/PIXI.js (engine)
- ✅ Original SimTower sounds (audio)
- ✅ OcramTower sprites (base art)

### Tools Needed
- 🔲 **ImageFX/Imagen 4** - Custom sprite generation
- 🔲 **Aseprite** - Pixel art editing (or web equivalent)
- 🔲 **Playwright** - Browser automation testing
- 🔲 **Percy/Chromatic** - Visual regression
- 🔲 **Notion** - Project tracking (optional, can use GitHub)

### Parallel Processing
- Run up to 4 sub-agents simultaneously per department
- Use specialized models for specialized tasks
- Batch similar work for efficiency

---

## Part 4: Timeline

### Realistic Estimate: 4 Weeks

| Phase | Duration | Focus |
|-------|----------|-------|
| Foundation | Days 1-7 | Documentation + Infrastructure + Core |
| Content | Days 8-14 | All buildings + Transport + Art |
| Polish | Days 15-21 | Audio + UX + Effects |
| Release | Days 22-28 | QA + Beta + Launch |

### Why This Timeline

1. **Documentation First** - Can't build what we don't understand
2. **Infrastructure Early** - Tests catch bugs before they compound
3. **Content in Parallel** - Multiple buildings can be built simultaneously
4. **Polish Matters** - The "feel" takes time to get right
5. **Beta Feedback** - Real players find issues we miss

### Acceleration Options

- More parallel sub-agents (needs higher rate limits)
- Pre-built asset packs (if licensing allows)
- Reduced scope (fewer building types initially)

---

## Part 5: Success Criteria

### The Ultimate Test

> "A player who loved SimTower in 1994 should feel like they're playing the same game, just prettier."

### Specific Criteria

1. **Visual Fidelity**
   - Buildings look like SimTower (cross-section style)
   - Day/night cycle matches original rhythm
   - People are visible and animated

2. **Audio Fidelity**
   - Sounds trigger at correct moments
   - Ambient atmosphere matches time of day
   - Nothing feels silent or dead

3. **Gameplay Fidelity**
   - Elevator stress is the core challenge
   - Star progression feels earned
   - Economic balance matches original

4. **Feel**
   - Placing buildings is satisfying
   - Time passes at the right pace
   - Crises feel urgent
   - Victories feel rewarding

---

## Appendix: Sub-Agent Specifications

### Spawning a Department Agent

```typescript
// Example: Spawn a Mechanics Researcher
sessions_spawn({
  task: `Research and document SimTower elevator mechanics.
  
  Output: /home/ubuntu/clawd/projects/opentower/.planning/MECHANICS/ELEVATORS.md
  
  Requirements:
  - Exact capacity numbers for each elevator type
  - Wait time calculation formula
  - Stress accumulation rules
  - Rush hour behavior
  - Express vs local scheduling logic
  
  Sources: SimTower Wiki, gameplay videos, community forums, reverse engineering docs`,
  
  label: 'opentower-mech-elevators',
  model: 'sonnet',
  runTimeoutSeconds: 600,
});
```

### Agent Communication

Sub-agents write to designated files. Main agent checks status via:
- `sessions_list` - See active agents
- `sessions_history` - Check progress
- File system - Read outputs

### Error Handling

If a sub-agent fails:
1. Check transcript for error
2. Retry with refined instructions
3. Escalate to main agent if persistent

---

*Document Version: 1.0*  
*Created: 2026-02-03*  
*Owner: Luna (Main Orchestration Agent)*
