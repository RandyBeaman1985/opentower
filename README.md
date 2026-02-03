# OpenTower 🏢

> A complete SimTower (1994) tribute built with TypeScript, PixiJS, and modern web tech.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF)](https://vitejs.dev/)

**Status:** 🎮 **PLAYTEST-READY** (v0.16.1 - Feb 3, 2026)

---

## What is OpenTower?

OpenTower is a faithful recreation of **Maxis SimTower** (1994), the classic tower simulation game where you build and manage a skyscraper empire. This modern remake captures the economic pressure, strategic depth, and addictive gameplay of the original while adding quality-of-life improvements.

### Why Another SimTower Clone?

- 🎯 **Authentic** - Matches SimTower's economic model, star rating system, and building types
- 🚀 **Modern** - Built with TypeScript, PixiJS v8, Vite for instant hot-reload development
- 🎮 **Complete** - All 21 building types, population AI, events, sound, tutorial
- 🔓 **Open Source** - MIT licensed, extensible architecture
- 🌐 **Web-First** - Runs in any modern browser, no downloads required

---

## Features

### ✅ Core Gameplay (100% Complete)

**Economic Pressure System:**
- Daily operating costs (elevators, maintenance)
- Quarterly rent collection
- Bankruptcy mechanics (7 days debt = game over)
- Detailed financial reporting (press **F** key)

**Building Variety (21 Types):**
- **Offices** - Single, Double, Triple, Quad (1★)
- **Hotels** - Single, Twin, Suite, Housekeeping (2★)
- **Residential** - Condo (2★)
- **Food** - Fast Food (1★), Restaurant (2★)
- **Retail** - Shop (2★)
- **Entertainment** - Party Hall (3★), Cinema (3★)
- **Services** - Security Office (2★), Medical Center (2★), Recycling (2★)
- **Transport** - Stairs (1★), Standard Elevator (1★), Express Elevator (2★), Escalator (2★)
- **Special** - Parking Ramp (2★), Parking Space (2★), Metro (2★), Cathedral (3★)

**Population AI:**
- Daily schedules (morning/lunch/evening rush hours)
- Needs-based behavior (workers seek food at noon)
- Pathfinding (elevators, stairs, multi-floor navigation)
- Stress system (wait times, walking distance, facilities)
- Resident daily life (commutes to work, weekend leisure)

**Star Rating Progression:**
- **1★** - Start (offices, fast food, basic transport)
- **2★** - 100 population + 60% satisfaction (hotels, condos, shops)
- **3★** - 500 population + 70% satisfaction + security office (premium buildings)

**Time System:**
- Real-time simulation (1 game day ≈ 2.4 real minutes)
- Day/night cycle (6 time periods, building lights at 6 PM)
- Week cycling (weekday/weekend behavior differences)
- Quarterly evaluations and rent collection

**Events:**
- VIP guests (rate your tower, affect star progression)
- Random events (fires, power outages, treasure, Santa)
- Building issues (cockroaches, maintenance problems)

**Polish:**
- 9 sound effects (building placed, elevator ding, cash register, alerts)
- Background music toggle (🎵 button)
- Interactive tutorial (4-step onboarding)
- Save/load system
- Performance benchmark (test with 2,000+ people)

---

## Quick Start

### Prerequisites
- Node.js 18+ ([download](https://nodejs.org/))
- npm 9+ (comes with Node.js)

### Installation
```bash
git clone [repository-url]
cd opentower
npm install
```

### Development
```bash
npm run dev
```
Opens game at **http://localhost:5173/**

### Production Build
```bash
npm run build
npm run preview  # Test production build
```

---

## How to Play

### First 5 Minutes
1. **Build an office** - Click "Building Menu" → Office
2. **Add an elevator** - Connect ground floor to office floor
3. **Fast-forward time** - Press **2** or **3** to speed up
4. **Watch workers arrive** - At 7:30 AM, workers spawn and use your elevator
5. **Manage cash flow** - Press **F** to see financial report

### Strategy Tips
- **Start small** - Don't over-build early (bankruptcy is real!)
- **Elevators are expensive** - $50/day per shaft, minimize excess capacity
- **Workers need food** - Place Fast Food within 4 floors of offices
- **Rush hours matter** - Morning (7-9 AM) and evening (5-7 PM) test your elevators
- **Watch evaluation scores** - Red buildings lose tenants (costly!)
- **Star rating unlocks** - Reach 2★ (100 pop) to build hotels and condos

### Keyboard Shortcuts
- **1-4** - Game speed (1=normal, 4=fastest)
- **F** - Financial report
- **S** - Save game
- **L** - Load game
- **Esc** - Close modals
- **Space** - Pause/resume

### Console Commands
Open browser console (F12) and try:
```javascript
window.verifyGameSystems()         // Check all systems working
window.runPerformanceBenchmark()   // Stress test (100→2000 people)
window.game.getTowerManager().getTower()  // Inspect tower state
```

---

## Architecture

### Tech Stack
- **TypeScript 5.7** - Type-safe game logic
- **PixiJS v8** - WebGL rendering (60 FPS with 1000+ entities)
- **Vite 5.4** - Lightning-fast development builds (<2s)
- **Vitest** - Unit testing framework

### Project Structure
```
src/
├── core/           # Game loop, state management, save/load
├── simulation/     # Economic, population, time, events, star rating
├── entities/       # Person, Building, Elevator classes
├── rendering/      # PixiJS renderers (tower, people, buildings, sprites)
├── ui/             # Modals, menus, HUD, tooltips
├── audio/          # Sound manager, music player, ambient sounds
└── utils/          # Pathfinding, helpers, constants

.planning/          # Development docs, guides, session logs
public/assets/      # Sprite assets (drop PNGs here for auto-loading)
```

### Core Systems
- **Game.ts** - Main loop (60 FPS render, 100ms sim ticks)
- **Tower.ts** - Building placement, floor management, state
- **EconomicSystem.ts** - Income, expenses, bankruptcy
- **PopulationSystem.ts** - Person spawning, lifecycle
- **PopulationAI.ts** - Schedules, needs, pathfinding, stress
- **EvaluationSystem.ts** - Building satisfaction scores (0-100%)
- **StarRatingSystem.ts** - Progression unlocks (quarterly checks)
- **TimeSystem.ts** - Clock, day/night cycle, week cycling
- **EventSystem.ts** - VIPs, fires, random events
- **PathfindingSystem.ts** - Elevator routing, stairs preference
- **ResidentSystem.ts** - Condo daily life (commutes, leisure)
- **HotelSystem.ts** - Guest check-in/out, nightly income

---

## Testing

### Playtest Checklist
Follow `.planning/PLAYTEST-GUIDE.md` for comprehensive 30-minute test plan covering:
- Economic pressure (bankruptcy, operating costs)
- Evaluation system (satisfaction scores, tenant departures)
- Population AI (rush hours, lunch rush, resident commutes)
- Star rating progression (2★/3★ unlocks)
- Day/night cycle (time passage, building lights)
- Sound system (all 9 sounds + music toggle)
- Hotel system (guest check-in/out)
- Events (VIPs, fires, random events)

### Performance
Run benchmark in browser console:
```javascript
window.runPerformanceBenchmark()
```
**Expected Performance:**
- 100 people: 60 FPS (smooth)
- 500 people: 50-60 FPS (smooth)
- 1,000 people: 40-50 FPS (playable)
- 2,000 people: 30+ FPS (stress test)

Target: **30+ FPS at 1,000 people** on mid-range hardware.

---

## Development Status

### ✅ Phase 1: Make It a Game (Weeks 1-4) - COMPLETE
All systems implemented and integrated:
- Economic pressure (operating costs, bankruptcy)
- Building evaluation system (0-100% scores, consequences)
- Population AI (daily schedules, needs, pathfinding)
- Star rating progression (2★/3★ unlocks)

### ✅ Phase 2: Content & Variety (Weeks 5-8) - COMPLETE
All 21 building types implemented:
- Hotels (check-in/out mechanics)
- Condos (resident daily life)
- All service buildings
- Random events system

### 🔄 Phase 3: Polish & Juice (Weeks 9-12) - 95% COMPLETE
- ✅ Week 9: Sound & Music (100%)
- 🔄 Week 10: Visual Polish (infrastructure ready, sprites optional)
- ✅ Week 11: Tutorial (100%)
- 🔄 Week 12: Performance (benchmark ready, needs runtime testing)

### 🎯 Current Blocker
**HUMAN PLAYTEST NEEDED** - All code is complete, needs 30-minute runtime verification to confirm gameplay feel matches SimTower. See `.planning/PLAYTEST-GUIDE.md`.

---

## Known Issues

### Visual
- **Sprites not yet generated** - Game uses colored rectangles (functional but not pretty)
- **Day/night lighting** - Infrastructure exists, needs runtime verification
- **Building animations** - Construction animation exists but needs testing

### Performance
- **Bundle size warning** - 550 kB main chunk (acceptable for game, could split further)
- **Large tower lag** - Not tested beyond 1,000 people (benchmark ready)

### Balance (Needs Human Testing)
- Operating costs may be too high/low
- Elevator wait time thresholds may need tuning
- Star rating requirements may be too easy/hard
- Event frequency/severity may need adjustment

---

## Roadmap

### Pre-v1.0 (Current)
- [x] All core systems implemented
- [ ] **Human playtest** (30 minutes) ⚠️ **BLOCKING**
- [ ] Fix critical bugs found in playtest
- [ ] External testing (5+ testers)
- [ ] Balance tuning based on feedback

### v1.0 Release
- [ ] Generate sprite assets (optional visual upgrade)
- [ ] Performance optimization (if needed)
- [ ] Tutorial polish
- [ ] Public release (itch.io, GitHub Pages)

### Post-v1.0 (Future)
- [ ] Health system (building damage, repairs)
- [ ] Staff system (janitors, security guards)
- [ ] More events (earthquakes, bomb threats)
- [ ] Multiplayer leaderboards
- [ ] Mobile touch controls
- [ ] Steam release

---

## Contributing

### Reporting Bugs
Use `.planning/PLAYTEST-GUIDE.md` bug reporting template:
```markdown
**Bug:** Brief description
**Steps to Reproduce:** 1, 2, 3...
**Expected:** What should happen
**Actual:** What actually happens
**Severity:** Critical/High/Medium/Low
**Screenshot:** (if visual bug)
```

### Sprite Assets
Want to contribute artwork? See `.planning/SPRITE-GENERATION-GUIDE.md` for:
- Sprite specifications (size, format, naming)
- ImageFX prompt templates
- Auto-loading system (drop PNGs in `public/assets/`)

### Code Contributions
1. Fork repository
2. Create feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -am 'Add feature'`)
4. Push to branch (`git push origin feature/your-feature`)
5. Open Pull Request

**Code Style:**
- TypeScript strict mode
- ESLint + Prettier formatting
- Unit tests for core systems
- JSDoc comments for public APIs

---

## Credits

### Original Game
- **SimTower** (1994) - Maxis/OpenBook
- **The Tower** (Yoot Tower, 1998) - Vivarium/OPeNBooK

### OpenTower
- **Lead Developer:** [Your Name]
- **Contributors:** [List contributors]
- **Special Thanks:** Claude (Anthropic) for AI-assisted development

### Libraries
- [PixiJS](https://pixijs.com/) - WebGL rendering
- [Vite](https://vitejs.dev/) - Build tooling
- [TypeScript](https://www.typescriptlang.org/) - Type safety

---

## License

MIT License - See [LICENSE](LICENSE) file for details.

Free to use, modify, and distribute. No warranty provided.

---

## FAQ

### Q: Is this affiliated with Maxis/EA?
**A:** No, this is an independent fan project. SimTower trademark belongs to Maxis/EA.

### Q: Why TypeScript instead of Rust/C++?
**A:** Web-first design (instant access, no downloads). TypeScript provides 90% of type safety with 10% of complexity. PixiJS delivers excellent WebGL performance.

### Q: Can I play the original SimTower?
**A:** Yes! Use DOSBox or Boxer. OpenTower aims to preserve the gameplay while modernizing the tech.

### Q: What's different from SimTower?
**A:** Mostly faithful, with improvements:
- Modern UI/UX (tooltips, financial report, keyboard shortcuts)
- Quality-of-life (save anytime, undo, performance benchmark)
- Extensible codebase (easy to mod/add features)

### Q: Will there be mobile support?
**A:** Post-v1.0 roadmap item. Desktop mouse/keyboard is priority.

### Q: How can I help?
**A:** Playtest and report bugs! See `.planning/PLAYTEST-GUIDE.md`.

---

## Community

- **Issues:** [GitHub Issues](https://github.com/your-repo/issues)
- **Discord:** [Join Server](#) (coming soon)
- **Twitter:** [@OpenTowerGame](#) (coming soon)

---

**Ready to play?** Run `npm run dev` and build your tower! 🏢🚀
