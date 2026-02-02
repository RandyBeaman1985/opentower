# OpenTower Product Roadmap
**SimTower HD Recreation**

Version: 1.0  
Last Updated: 2025-01-30  
Status: Phase 1 Complete (Core Engine)

---

## Executive Summary

OpenTower is a high-definition recreation of the classic SimTower (1994) using modern web technologies (TypeScript + PixiJS). The project aims to deliver a faithful recreation of the original gameplay while adding quality-of-life improvements and HD visuals.

**Current Status:** ~20% complete toward playable demo  
**Target Platform:** Web (desktop browsers, potential Electron wrapper)  
**License:** MIT (clone/tribute project)

---

## 1. Current State Assessment

### What's Built (Phase 1 Complete)
✅ **Core Architecture** (~30% complete)
- Game loop with fixed timestep (100ms ticks, 60fps render)
- Event bus with phase-based processing
- Clock system with game time/speed control (0x, 1x, 2x, 4x speeds)
- Type-safe interfaces layer preventing circular dependencies

✅ **Basic Rendering** (~20% complete)
- PixiJS integration with layered rendering
- Camera system (pan, zoom, interpolation)
- Grid and floor visualization
- Building placeholder rendering
- Debug mode with overlays

✅ **Tower State Management** (~25% complete)
- Tower data structure with floors and buildings
- Building placement/removal logic
- Tile occupancy tracking
- Star rating progression (1-6)
- Fund management
- Building config database (verified against SimTower wiki)

✅ **Infrastructure**
- Vite build system
- Vitest test framework (6 test suites)
- TypeScript strict mode
- Path aliases for clean imports
- Project planning structure

### What's Missing (Critical Gaps)

❌ **Simulation Layer** (~5% complete)
- Person entities and AI
- Elevator logic and scheduling
- Pathfinding and navigation
- Stress/satisfaction mechanics
- Daily schedules and time-based behaviors
- Tenant evaluation system

❌ **Game Systems** (~10% complete)
- Economic simulation (quarterly income, evaluations)
- Building-specific behaviors (restaurants, shops, hotels)
- Service facility mechanics (housekeeping, security)
- Random events (fires, bomb threats, VIP visits)
- Star progression requirements
- Building unlock system

❌ **User Interface** (~0% complete)
- Building tool palette
- Construction mode
- Information panels (finances, population, stats)
- Building inspection UI
- Notifications/alerts
- Settings/options menu

❌ **Input System** (~0% complete)
- Mouse-based building placement
- Click-to-inspect
- Keyboard shortcuts
- Touch support (nice-to-have)

❌ **Content & Polish** (~0% complete)
- Building sprites (currently placeholder rectangles)
- Person sprites with stress colors
- Sound effects
- Background music
- UI art and icons
- Animations (elevators, people walking)

❌ **Save/Load System** (~0% complete)
- Tower serialization
- Browser localStorage integration
- Cloud save (future)

---

## 2. Feature Prioritization

### Core Gameplay Loop (Minimum for Fun)

The essence of SimTower in priority order:

1. **Build → Populate → Manage → Grow**
   - Place buildings with mouse
   - Buildings auto-populate with people
   - Watch people use elevators and move around
   - Earn money, build more, reach next star

### Must-Have for Playable Demo (Alpha)

**P0 - Blocks all fun:**
- [ ] Building placement UI (mouse-based drag placement)
- [ ] Person simulation (basic movement, use elevators)
- [ ] Elevator logic (basic SCAN algorithm)
- [ ] Pathfinding (A* with elevator/stairs routing)
- [ ] Stress visualization (black/pink/red person sprites)
- [ ] Time progression with quarterly income
- [ ] Building sprites (simple HD art, not placeholders)

**P1 - Necessary for "feels like SimTower":**
- [ ] Daily schedules (people go to work, lunch, home)
- [ ] Elevator waiting stress (core feedback loop)
- [ ] Office/condo/shop basic behaviors
- [ ] Star progression UI feedback
- [ ] Financial summary panel
- [ ] Sound effects (elevator ding, construction)

### Should-Have for Beta (Feature Complete)

**P2 - Rounds out core experience:**
- [ ] All building types functional (hotel, entertainment, services)
- [ ] Random events (fires, VIP, bomb threat)
- [ ] Tenant evaluation and move-out
- [ ] Service facilities (housekeeping reduces stress)
- [ ] Building info panels (click to inspect)
- [ ] Save/load system
- [ ] Tutorial/help overlay

### Nice-to-Have for v1.0 (Polish)

**P3 - Quality of life and polish:**
- [ ] Background music
- [ ] Animated sprites (people walking, elevators moving)
- [ ] Particle effects (construction dust, fire)
- [ ] Statistics graphs (population, income over time)
- [ ] Achievements/milestones
- [ ] Speed-up to 8x or 16x
- [ ] Building rotation/flip (if applicable)

### Cut for v1.0 (Move to v1.1+)

**Post-release content:**
- Advanced stats/analytics dashboard
- Scenario mode (pre-built towers with challenges)
- Multiplayer/leaderboards
- Mod support (custom buildings)
- Mobile/touch optimization
- Cloud saves
- Accessibility features (colorblind mode, screen reader)

---

## 3. Milestone Definition

### 🏗️ Alpha: First Playable ("Proof of Fun")
**Target:** 8-12 weeks from Phase 1 completion  
**Goal:** Can you build a tower and watch it come alive?

**Deliverables:**
- ✅ Phase 1: Core Engine (DONE)
- [ ] Phase 2: Person Simulation & Pathfinding
  - Person entities with daily schedules
  - Basic pathfinding (walk + elevator + stairs)
  - Stress system with visual feedback
- [ ] Phase 3: Elevator Intelligence
  - SCAN elevator algorithm
  - Waiting queue management
  - Call button system
- [ ] Phase 4: Economic Loop
  - Quarterly income processing
  - Cost of construction
  - Tenant evaluation (simplified)
- [ ] Phase 5: Input & UI Basics
  - Building placement tool
  - Basic HUD (funds, population, time)
  - Camera controls (already working)
- [ ] Phase 6: Visual Content
  - Building sprites (HD, simple style)
  - Person sprites (3 stress colors)
  - Elevator car visualization

**Success Criteria:**
- Can place 10+ buildings
- 50+ people moving around
- Elevator wait causes visible stress
- Money goes up each quarter
- Reaches 2-star rating
- Runs at 60fps with 200+ people
- **Feels recognizably like SimTower**

**Risks at Alpha:**
- Pathfinding performance (need efficient A*, consider Web Worker)
- Elevator logic complexity (100+ people waiting)
- Sprite art quality (may need artist hire/contractor)

---

### 🧪 Beta: Feature Complete
**Target:** 4-8 weeks after Alpha  
**Goal:** All SimTower mechanics implemented

**Deliverables:**
- [ ] Phase 7: All Building Types
  - Hotels, restaurants, shops, entertainment
  - Service facilities (housekeeping, security, medical)
  - Landmarks (metro, cathedral)
- [ ] Phase 8: Advanced Systems
  - Tenant evaluation and move-out
  - Noise pollution mechanics
  - Parking and traffic
  - Random events
- [ ] Phase 9: UI/UX Complete
  - Building info panels
  - Financial reports
  - Notifications system
  - Settings menu
- [ ] Phase 10: Save/Load
  - Tower serialization
  - LocalStorage persistence
  - Auto-save every 5 minutes

**Success Criteria:**
- All 26 building types functional
- Reaches 5-star + Tower status
- 10,000+ population without lag
- Random events trigger and resolve
- Can save and reload mid-game
- **Feature parity with SimTower (1994)**

**Risks at Beta:**
- Performance at scale (10K+ people)
- Event system complexity
- Save format future-proofing
- Browser compatibility issues

---

### 🚀 v1.0: Release Quality
**Target:** 4-6 weeks after Beta  
**Goal:** Polished, shippable product

**Deliverables:**
- [ ] Phase 11: Polish & Juice
  - Sound effects for all actions
  - Background music (3-5 tracks)
  - Smooth animations
  - Particle effects
- [ ] Phase 12: Content Complete
  - Tutorial/onboarding
  - Help system
  - Credits/about screen
- [ ] Phase 13: QA & Bug Fixing
  - 100+ hours playtesting
  - Performance optimization
  - Edge case handling
  - Cross-browser testing
- [ ] Phase 14: Release Prep
  - Landing page
  - Trailer/screenshots
  - Press kit
  - Distribution (itch.io, GitHub Pages)

**Success Criteria:**
- No critical bugs
- 60fps at 15K population (max game size)
- Runs on Chrome, Firefox, Safari, Edge
- Positive playtest feedback (5+ testers)
- Complete tutorial for new players
- **Ready for public release**

**Risks at v1.0:**
- Audio licensing (music, SFX)
- Performance on low-end devices
- Infinite edge cases in simulation
- Scope creep ("just one more feature")

---

### 📦 Post-Release: DLC & Expansion
**Target:** Ongoing after v1.0  
**Goal:** Keep community engaged, add value

**Potential Content:**
- **v1.1: Quality of Life**
  - Advanced stats/graphs
  - Building templates (save/load configurations)
  - Speed controls up to 16x
  - Colorblind mode
- **v1.2: Scenarios**
  - Pre-built challenge towers
  - Time-limited objectives
  - Historical building themes
- **v1.3: Mod Support**
  - Custom building definitions (JSON)
  - Community workshop integration
  - Building sprite import
- **v2.0: SimTower++**
  - New building types not in original
  - Expanded tower height (200 floors?)
  - Natural disasters
  - Seasons/weather

---

## 4. Risk Assessment

### 🔴 Technical Risks

**High Severity:**

1. **Pathfinding Performance at Scale**
   - **Risk:** A* pathfinding for 10K+ people every tick could tank performance
   - **Mitigation:** 
     - Move pathfinding to Web Worker
     - Cache routes for common paths
     - Use nav mesh instead of tile-by-tile A*
     - Lazy pathfinding (only recompute when needed)
   - **Fallback:** Limit population to 5K

2. **Elevator Scheduling Complexity**
   - **Risk:** Real elevator algorithms are PhD-level complex; poor implementation = frustrating gameplay
   - **Mitigation:**
     - Start with simple SCAN algorithm
     - Copy OpenSkyscraper logic (verified to work)
     - Heavy playtesting of elevator feel
   - **Fallback:** Use hardcoded elevator rules from SimTower

3. **Browser Memory Limits**
   - **Risk:** 15K person objects + sprites could exhaust memory
   - **Mitigation:**
     - Struct-of-Arrays for hot data (planned in architecture)
     - Object pooling for sprites
     - Frustum culling (only render visible area)
     - Offscreen canvas for static layers
   - **Fallback:** Reduce max population to 10K

**Medium Severity:**

4. **PixiJS Version Compatibility**
   - **Risk:** PixiJS v8 is relatively new, may have breaking changes
   - **Mitigation:** Pin to specific version, monitor changelog
   - **Fallback:** Downgrade to PixiJS v7 if needed

5. **Save Format Migration**
   - **Risk:** Early save files break when adding features
   - **Mitigation:** Version save format, write migration code
   - **Fallback:** Clear saves on major updates (acceptable pre-v1.0)

6. **Cross-Browser Audio/Canvas Issues**
   - **Risk:** Safari and Firefox have quirks
   - **Mitigation:** Test early and often on all browsers
   - **Fallback:** Degrade gracefully (disable audio if needed)

**Low Severity:**

7. **TypeScript Build Time**
   - **Risk:** Large codebase could slow iteration
   - **Mitigation:** Vite is fast, incremental builds
   - **Fallback:** Use `tsc --watch` in separate process

---

### ⚠️ Scope Creep Dangers

**Warning Signs:**
- "Let's add weather!"
- "Multiplayer would be cool..."
- "What if buildings could be destroyed by..."
- "Let's do a mobile version!"

**Defense Strategy:**
1. **Strict scope document** (this roadmap)
2. **"v1.1 parking lot"** for good ideas that don't fit v1.0
3. **Playable > Perfect** — ship Alpha even if art is ugly
4. **Defer multiplayer/mobile until post-v1.0**
5. **Regular scope reviews** — cut features that block release

**Pre-approved scope additions:**
- Bug fixes (always)
- Performance improvements (always)
- Accessibility (case-by-case)
- Community requests (only if <1 week work)

**Auto-rejected additions:**
- Multiplayer/online
- Mobile touch redesign
- New game modes (before v1.0)
- Complete art overhauls

---

### ⚖️ Legal Considerations

**Clone/Tribute Status:**

OpenTower is a **clean-room recreation** inspired by SimTower (1994). Legal considerations:

1. **Copyright:**
   - ✅ **Safe:** Game mechanics cannot be copyrighted (Tetris Holding v. Xio)
   - ✅ **Safe:** Writing new code from scratch
   - ❌ **Danger:** Using original assets (sprites, sounds, music)
   - ❌ **Danger:** Decompiling/copying original code

2. **Trademark:**
   - ❌ **Don't use:** "SimTower" in product name
   - ✅ **OK:** "Inspired by SimTower" in description
   - ✅ **Current name:** "OpenTower" — no trademark conflict

3. **Recommended Actions:**
   - ✅ Use MIT license (established)
   - ✅ Credit original game: "Inspired by SimTower (Maxis, 1994)"
   - ✅ Create all original art/sound
   - ✅ Include disclaimer: "Not affiliated with Maxis or EA"
   - ⚠️ Monitor for cease & desist (unlikely but possible)

4. **Art Asset Strategy:**
   - **Phase 1-2:** Use colored rectangles (zero legal risk)
   - **Phase 3 (Alpha):** Commission original pixel art OR use public domain art
   - **Never:** Rip sprites from original game

5. **Reference Material:**
   - ✅ **Safe to reference:** OpenSkyscraper (open-source clone), SimTower wikis, gameplay videos
   - ✅ **Safe to use:** Public domain architectural sprites, CC0 sound effects
   - ❌ **Don't use:** Decompiled code, extracted assets

**Worst-Case Scenario:**
- EA/Maxis sends C&D → Rename project, continue development
- Legal threat escalates → Take offline, publish code, let forks continue
- **Probability:** <5% (many clones exist, SimTower is 30+ years old)

---

## 5. Success Metrics

### "Feels Like SimTower" Checklist

**Core Feel:**
- [ ] Watching people flow through the tower is mesmerizing
- [ ] Elevator wait frustration is visible (red people)
- [ ] Building placement is satisfying (snap-to-grid, visual feedback)
- [ ] Quarterly income "cha-ching" moment feels rewarding
- [ ] Star level-up triggers excitement
- [ ] Time speeds up smoothly (1x → 2x → 4x)
- [ ] Zooming in/out reveals different detail levels

**Behavioral Targets:**
- [ ] Player spends 10+ minutes on first session without tutorial
- [ ] Player naturally discovers elevator stress mechanic
- [ ] Player builds at least 20 buildings before quitting
- [ ] Player returns for second session within 48 hours
- [ ] Player reaches 3-star without looking up guide

**Quotes from Playtesters:**
- "Oh no, they're turning red! I need more elevators!"
- "Just one more floor..."
- "This is exactly how I remember SimTower!"
- "I've been playing for 2 hours?!"

---

### Playtest Criteria

**Alpha Playtest (Internal, 3-5 testers):**
- [ ] Can complete tutorial/onboarding in <5 minutes
- [ ] Reaches 2-star within 30 minutes
- [ ] No game-breaking bugs in 1 hour session
- [ ] Identify top 3 confusing UI elements
- [ ] Identify top 3 most fun moments

**Beta Playtest (Public, 20+ testers):**
- [ ] 80% reach 3-star within 2 hours
- [ ] Average session length >45 minutes
- [ ] <5 critical bugs reported per tester
- [ ] 70%+ would recommend to friend
- [ ] Collect 50+ pieces of feedback

**v1.0 Playtest (Soft launch, 100+ players):**
- [ ] 60% return for 2nd session
- [ ] 30% return after 1 week
- [ ] Average playtime per player >3 hours
- [ ] 4+ star average rating (if rated)
- [ ] Top 3 requested features inform v1.1 roadmap

---

### Performance Benchmarks

**Target Hardware:** Mid-range laptop (2020+), 8GB RAM, integrated graphics

**Alpha Benchmarks:**
- [ ] 60fps with 500 people at 1x speed
- [ ] 30fps with 1,000 people at 4x speed
- [ ] Load time <3 seconds
- [ ] Memory usage <500MB

**Beta Benchmarks:**
- [ ] 60fps with 5,000 people at 1x speed
- [ ] 30fps with 10,000 people at 4x speed
- [ ] Save/load <2 seconds for 1MB save file
- [ ] Memory usage <1GB

**v1.0 Benchmarks:**
- [ ] 60fps with 15,000 people at 1x speed (max population)
- [ ] 45fps with 15,000 people at 4x speed
- [ ] Zero memory leaks over 4 hour session
- [ ] Works on 5-year-old hardware (2020 laptop)

**Performance Testing:**
- Use Chrome DevTools Performance profiler
- Test on Mac, Windows, Linux
- Test on low-end and high-end devices
- Automated performance regression tests

---

## 6. Development Estimates

### Velocity Assumptions
- **Developer availability:** 20 hours/week (half-time)
- **Phase 1 completion:** 2 weeks elapsed (baseline velocity)
- **Code complexity:** Increases 2x from Alpha → Beta → v1.0

### Phase Estimates

| Phase | Description | Effort (hours) | Duration (weeks) |
|-------|-------------|----------------|------------------|
| ✅ Phase 0 | Bootstrap | 8 | 0.5 |
| ✅ Phase 1 | Core Engine | 32 | 2 |
| Phase 2 | Person Simulation | 60 | 3 |
| Phase 3 | Elevator Logic | 40 | 2 |
| Phase 4 | Economic Loop | 30 | 1.5 |
| Phase 5 | Input & UI Basics | 40 | 2 |
| Phase 6 | Visual Content | 50 | 2.5 |
| **Alpha** | **First Playable** | **260** | **13 weeks** |
| Phase 7 | All Buildings | 80 | 4 |
| Phase 8 | Advanced Systems | 60 | 3 |
| Phase 9 | UI/UX Complete | 50 | 2.5 |
| Phase 10 | Save/Load | 20 | 1 |
| **Beta** | **Feature Complete** | **470** | **23.5 weeks** |
| Phase 11 | Polish & Juice | 40 | 2 |
| Phase 12 | Content Complete | 30 | 1.5 |
| Phase 13 | QA & Bug Fixing | 60 | 3 |
| Phase 14 | Release Prep | 20 | 1 |
| **v1.0** | **Release** | **620** | **31 weeks** |

**Total time to v1.0:** ~7-8 months from Phase 1 completion

**Confidence Intervals:**
- Alpha: 10-16 weeks (80% confidence)
- Beta: 20-30 weeks (70% confidence)
- v1.0: 30-40 weeks (60% confidence)

**Risk Buffer:** Add 20% time for unknowns = **9-10 months total**

---

## 7. Execution Strategy

### Development Principles

1. **Playable at Every Step**
   - Every phase should produce something you can run and interact with
   - Ugly and functional > beautiful and broken

2. **Vertical Slices Over Horizontal Layers**
   - Complete one building type end-to-end before starting another
   - Example: Fully implement Condo (placement, people, income, stress) before Office

3. **Performance First**
   - Profile early, profile often
   - Never optimize prematurely, but always measure

4. **Test Core Mechanics Only**
   - Unit test: Game loop, pathfinding, elevator logic
   - Manual test: Feel, juice, fun factor
   - Don't test UI layout or rendering details

5. **Defer Polish**
   - Placeholder art until Beta
   - No sound until after Alpha
   - Focus on gameplay feel

### Weekly Cadence

**During Active Development:**
- Monday: Plan week's tasks (GitHub issues)
- Wed: Mid-week check-in (async)
- Friday: Commit and push progress
- Sunday: Playtest build (if available)

**Every 2 Weeks:**
- Tag release build (`alpha-0.1`, `alpha-0.2`, etc.)
- Write devlog/changelog
- Share progress with community (if public)

**Every Phase:**
- Architecture review before starting
- Code review for critical systems
- Performance profiling at phase end

### Team Roles (Current: Solo Dev)

**Now:**
- Dev: All coding, architecture, testing
- Art: Placeholder rectangles
- Sound: None
- Design: Guided by original SimTower

**At Alpha (Consider Hiring):**
- Pixel Artist (contract, 20-40 hours)
  - Building sprites
  - Person sprites (3 stress states)
  - UI icons
- Sound Designer (contract, 10 hours)
  - Elevator ding
  - Construction sounds
  - Button clicks

**At Beta (Nice to Have):**
- Composer (contract, 20 hours)
  - 3-5 background music tracks
  - Adaptive music system
- QA Tester (volunteer/community)
  - 40+ hours playtesting
  - Bug reporting

---

## 8. Community & Marketing

### Pre-Alpha (Now)
- [ ] Create GitHub README with vision
- [ ] Post to /r/gamedev "Building SimTower clone" thread
- [ ] Share architecture decisions (dev blog?)

### Alpha Launch
- [ ] Playable web demo
- [ ] Post to /r/SimTower (small community)
- [ ] Share on Twitter/X with #gamedev
- [ ] Record 2-minute gameplay video

### Beta Launch
- [ ] Itch.io page with demo
- [ ] Submit to /r/WebGames
- [ ] Email to OpenSkyscraper community
- [ ] Update demo regularly with patches

### v1.0 Launch
- [ ] Full release on Itch.io (pay-what-you-want)
- [ ] GitHub Pages hosted version (free)
- [ ] Press kit for indie game sites
- [ ] Submit to IndieDB, GameJolt
- [ ] Consider Steam (Web build via Electron?)

**Target Audience:**
- SimTower nostalgia players (30-45 years old)
- Tower defense/management sim fans
- Retro gaming enthusiasts
- Browser game players

**Marketing Budget:** $0 (organic only)

---

## 9. Open Questions

**To Research:**
- [ ] Best A* pathfinding library for TS/JS?
- [ ] Elevator algorithm: SCAN vs LOOK vs modern AI?
- [ ] Web Worker threading model for simulation?
- [ ] Open-source pixel art resources for buildings?
- [ ] CC0 music/SFX libraries?

**To Decide:**
- [ ] Art style: Faithful pixel art vs HD modern?
- [ ] Monetization: Free vs Pay-What-You-Want vs $5?
- [ ] Electron wrapper for desktop or web-only?
- [ ] GitHub vs Itch.io vs both for distribution?

**To Validate:**
- [ ] Do people still care about SimTower in 2025?
- [ ] Is web canvas fast enough for 15K entities?
- [ ] Will EA/Maxis care about this clone?

---

## 10. Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-30 | 1.0 | Initial roadmap after Phase 1 completion |

---

## Appendix: MVP Definition (Playable Demo)

**What is the ABSOLUTE MINIMUM for a "playable demo"?**

If we had to ship something in 4 weeks, what would it be?

### Micro-MVP: "The Elevator Demo"

**Scope:**
- 10 floors, ground floor lobby
- 3 building types: Condo, Office, Lobby
- 1 elevator shaft
- 50 people with simple AI
- Mouse placement (drag to build)
- Time controls (pause, 1x, 2x)
- Stress visualization (colored sprites)

**Gameplay Loop:**
1. Place condos and offices
2. People spawn automatically
3. Watch them use elevator to go to work/home
4. People turn red if elevator wait is too long
5. Add more elevators to reduce stress
6. Count funds and population

**Success = "This is fun to watch for 10 minutes"**

**Estimate:** 80-100 hours (~4-5 weeks half-time)

**Why this scope?**
- Proves core loop works
- Tests elevator feel
- Validates art style
- No random events, no economy, no save/load
- Just the hypnotic "ant farm" of people moving

**Ship this as "OpenTower Pre-Alpha Tech Demo"**
- Set expectations low
- Get early feedback
- Build momentum

---

**End of Roadmap**

*Next Steps:*
1. Review and approve this roadmap
2. Break Phase 2 into weekly tasks
3. Begin Person Simulation implementation
4. Schedule first Alpha playtest date
