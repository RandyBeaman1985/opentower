# SimTower Clones & Spiritual Successors: Comprehensive Competitor Analysis

*Research compiled January 2026 for OpenTower project design reference*

---

## Executive Summary

The tower-building simulation genre has seen several attempts to recapture SimTower's magic since 1994. **Project Highrise (2016)** is the most commercially successful spiritual successor with ~4,700 Steam reviews (Very Positive, 73 Metacritic). **Mad Tower Tycoon** is a smaller indie attempt with mixed reception. Multiple open-source projects (**OpenSkyscraper**, **Towerz**, **ScriptTower.js**) exist in varying states of completion. The official sequels **Yoot Tower** and portable versions (**Tower SP**, **Tower DS**) expanded the formula with mixed results.

**Key insight:** No game has successfully replicated SimTower's *feel*. Project Highrise nailed the systems but lacks personality. Mad Tower Tycoon has personality but clunky execution. Open-source projects all stalled. There's a clear opportunity for a definitive modern recreation.

---

## 1. THE ORIGINAL: SimTower (1994)

### Overview
- **Developer:** OPeNBooK (Yoot Saito)
- **Publisher:** Maxis (branded as Sim series outside Japan)
- **Platforms:** Windows, Mac, Sega Saturn, 3DO
- **Reception:** Won 1995 SIIA "Best Simulation Program" Codie Award

### Core Design Philosophy
SimTower was **built around an elevator simulation program first**, with the building management layered on top. Yoot Saito contacted elevator companies to research scheduling algorithms (they declined to share!). This elevator-first approach is why the game feels so satisfying—the core loop is watching people move efficiently.

### What Made It Special
1. **Stress System** - Visible feedback (red dots on people) showing tenant frustration
2. **Star Rating Progression** - Clear goals (1★ → 5★ → TOWER status)
3. **VIP Visits** - Dramatic evaluation moments testing your whole system
4. **Day/Night Cycle** - Different traffic patterns create varying challenges
5. **Emergent Storytelling** - Watching individual Sims live their lives
6. **Cathedral Endgame** - The satisfying "you won" moment at 100 floors

### Known Criticisms (1994 Reviews)
- **Pacing too slow** - Waiting for money to accumulate was tedious
- **Poor documentation** - Hard to learn, unclear why tenants were unhappy
- **Tenant complaints unclear** - No specific reasons given for dissatisfaction
- **Speed controls inadequate** - Next Generation magazine: "standing around waiting for cash"

### Elevator System Details
- **Standard elevators:** Max 30 floor span
- **Express elevators:** Full building height
- **Key metric:** Tenant stress from wait times
- **Strategy:** Sky lobbies + express/local elevator banks

---

## 2. PROJECT HIGHRISE (2016) ⭐ Primary Competitor

### Overview
- **Developer:** SomaSim (small indie team)
- **Publisher:** Kasedo Games / Kalypso Media
- **Platforms:** PC, Mac, iOS, Android, Switch, PS4, Xbox One
- **Price:** $19.99 (5 DLC packs available)
- **Reception:** 
  - Steam: Very Positive (4,700+ reviews, ~85% positive)
  - Metacritic: 73/100
  - IGN: 7/10

### What It Does WELL ✅

**Welcoming Onboarding**
> "Its inviting simplicity and initially fast pace do a good job setting you up" —IGN

**Deep Utility Systems**
- Electricity, water, phone, cable, gas lines
- Underground infrastructure (switchboards, transformers, manifolds)
- Utility closets required per floor
- Color-coded pipe/cable visualization

**Clear Dependencies**
> "Being able to quickly and easily craft a smooth, self-sufficient system from the ground up marks the most compelling part" —IGN

**Consultant/Upgrade Paths**
- Buzz (business momentum) spent on media campaigns
- Influence (from workers/residents) unlocks consultants
- Prestige points unlock larger tier businesses
- Creates meaningful late-game progression

**Solid Mod Support**
- Built-in modding tools from launch
- Workshop integration
- Community creates room variety

**Multi-Platform Success**
- Mobile ports work well (TouchArcade praised it)
- Nintendo Switch version received positively

### What It Does POORLY ❌

**LACKS PERSONALITY/SOUL** (Universal Criticism)
> "The one thing it forgets to build is a personality" —IGN
> "Sadly a bit soulless... this style grants no real personality, energy, or spirit to your skyscraper" —IGN
> "Every room of the same type looks the same" —Rock Paper Shotgun
> "It's not life, it's just numbers with graphics on top" —RPS

**Room Size Information Hidden**
- Can't see dimensions of locked room types
- Forces trial-and-error planning
- "One mistake in the early game can ruin your chances for a nice looking building later"
- Must memorize sizes across multiple playthroughs

**Visual Monotony**
- Limited room variety within types
- Muted color palette
- Larger buildings look boring
- "Lacks the wit or existential horror that would give it personality"

**Width/Layout Frustrations**
- Locked room sizes = Tetris puzzle problems
- Can't plan long-term without hidden information
- Demolition is expensive and risky
- Asymmetry forced by mechanical needs

**Idle Game Feel**
> "This is not truly a game of strategy... it's about waiting for cash to accumulate" —RPS

**8-Hour Content Ceiling**
> "I'd been struggling to afford a modest six-floor office block, and now suddenly I had this humongous 40-floor ant's nest... took me around eight hours to achieve, and truth be told I'm not now feeling much pull to go back" —RPS

### Elevator Implementation
- **Minimal:** Elevators exist but aren't the focus
- **No stress visualization** on tenants
- **No complex scheduling** systems
- **Not the core loop** (utilities are)

### Key Lessons for OpenTower
1. Utility systems are satisfying but shouldn't overshadow people movement
2. Show ALL information upfront—hidden room sizes are infuriating
3. Personality > polish. Players crave character, not just systems
4. ~8 hours is the typical engagement ceiling—need replayability hooks
5. Modding support is valuable but won't fix core personality issues

---

## 3. MAD TOWER TYCOON (2019)

### Overview
- **Developer:** Eggcode (indie)
- **Publisher:** Toplitz Productions
- **Platforms:** PC, Mac
- **Price:** $14.99
- **Reception:** Steam: Mostly Positive (438 reviews, ~78% positive)

### Advertised Features
- 100+ floor buildings
- "Realistic elevators" with floor skip settings
- Random events (fires, earthquakes, **UFO abductions**)
- Level/skill system with 50+ unlockable skills
- Daily missions
- Detailed statistics and filters

### What It Does WELL ✅

**Elevator Configuration Options**
- Adjustable wait times
- Floor skip settings
- More control than Project Highrise

**Variety of Events**
- Fire emergencies
- Earthquakes
- UFOs kidnapping tenants (!)
- Keeps gameplay unpredictable

**Skill Progression System**
- Gain XP from missions and statistics
- Unlock 50+ skills
- Provides ongoing goals

**Detailed Statistics**
- Floor-by-floor dirt levels
- Noise visualization
- 24-hour visitor tracking
- 30-day profit trends

### What It Does POORLY ❌

**Lower Polish Level**
- Smaller team, less refinement
- UI feels dated
- Graphics are functional but not inspiring

**Less Depth Than Project Highrise**
- Simpler utility systems
- Fewer room types
- Less strategic complexity

**Mixed Elevator Execution**
- Promises "realistic" but reviews suggest implementation issues
- Better than Project Highrise, but not SimTower-quality

### Key Lessons for OpenTower
1. Events add excitement—earthquakes, VIPs, emergencies
2. Statistics visualization is valuable (dirt, noise, traffic)
3. Skill/progression systems provide replay incentive
4. Polish matters—clunky UI undermines good ideas
5. "Realistic elevators" is a selling point (so people want it)

---

## 4. YOOT TOWER / THE TOWER II (1998)

### Overview
- **Developer:** OPeNBooK9003 (same as SimTower)
- **Designer:** Yoot Saito
- **Platforms:** Mac, Windows 95, later iPad
- **Reception:** Solid sequel, added depth but lost some magic

### New Features Added

**Multiple Tower Locations**
- Hawaii (easy): Mixed-use, condos, hotel, cathedral at floor 45
- Tokyo (advanced): Office-focused, stadium endgame
- Kegon Falls: Mostly underground, tourist attraction focus
- Later expansions: Statue of Liberty, Tokyo Tower, Kyoto Station, Christmas Story

**Sky Bridges**
- Connect multiple towers side-by-side
- Creates mega-structure gameplay

**New Facility Types**
- Rented apartments (vs condos that are sold)
- Vending machines
- Public restrooms
- Swimming pools (via expansion)

**Changed Systems**
- Shops now player-controlled (choose what they sell)
- Billboards for advertising revenue
- In-game advertising (Apple, Sega, GameWorks, etc.)

**Technical Improvements**
- 32-bit (vs SimTower's 16-bit)
- Resizable window up to 3200×2160
- Runs on modern Windows

**Plugin/Expansion System**
- Downloadable content packs (Towerkit)
- New facilities, events, movies, locations
- Japanese version got many more updates than US

### What Worked
1. Location variety added replayability
2. Sky bridges enabled new strategies
3. More facility options
4. Better resolution support

### What Didn't Work
1. US version abandoned (no updates/expansions)
2. Plugin system never reached potential in West
3. Complexity increased without proportional fun increase
4. Lost some of original's simplicity

### Key Lessons for OpenTower
1. Multiple scenarios/locations = replayability
2. Modular expansion systems are good (if supported!)
3. Don't abandon non-Japanese markets
4. Complexity for complexity's sake isn't valuable

---

## 5. THE TOWER SP (Game Boy Advance, 2005)

### Overview
- **Developer:** Vivarium (OPeNBooK successor)
- **Publisher:** Nintendo (JP), Sega (NA)
- **Reception:** Mixed (IGN positive, GameSpot negative)

### Notable Changes from SimTower

**Reduced Scale**
- Max 50 floors (vs 100)
- "Tower" status at 2,000 population
- Narrower building width (expands via deregulation events)

**Added from Yoot Tower**
- Multiple shop/store types
- Required restrooms
- Security night checks
- Weekly housekeeping for offices

**New Mechanics**
- Cockroach infestation phases:
  1. Bug bomb fixes it
  2. Expensive exterminator needed
  3. Facility condemned
- Hot spring spa (Commercial Building mode)
- Hotel suites unlocked by star rating

**Two Building Modes**
- Office Building (standard SimTower)
- Commercial Building (mall-hotel hybrid, unlocked after beating Office)

### Reception Analysis
- **GameSpot (negative):** Criticized lack of gameplay depth, poor visuals/audio
- **IGN (positive):** Praised simple, well-balanced gameplay

### Key Lessons for OpenTower
1. Mobile/portable requires scope reduction
2. Cockroach infestation phases = interesting progressive failure state
3. Multiple building "modes" adds variety
4. Wedding requirement for victory adds narrative goal

---

## 6. THE TOWER DS (Nintendo DS, 2008)

### Overview
- **Developer:** DigiToys
- **Publisher:** DigiToys (Japan only)
- **Platform:** Nintendo DS
- **Release:** June 26, 2008

### Notes
- Japan-exclusive release
- Limited information available in English
- Presumed to be similar to Tower SP with touch controls

### Key Lessons for OpenTower
1. Touch interface works for this genre (proven by iOS ports)
2. Japanese market still has appetite for tower sims

---

## 7. OPEN SOURCE PROJECTS

### OpenSkyscraper (C++/SFML)
**Repository:** github.com/fabianschuiki/OpenSkyscraper

**Status:** Experimental/stalled (last major activity 2014)

**Technical Approach:**
- SFML as platform API (instead of SDL)
- Modern C++ interface
- Loads bitmaps, fonts, sounds from memory
- **Requires original SIMTOWER.EXE** for assets

**What They Implemented:**
- Basic window/rendering framework
- Asset extraction from original game
- Building grid system (partial)

**Why It Stalled:**
- Dependency on original game assets (legal/accessibility issue)
- Scope too large for small team
- 12 open issues, no activity since 2021

**Lessons Learned:**
1. Don't depend on original assets—create new ones
2. Need critical mass of contributors
3. Clear roadmap essential for open source projects

---

### Towerz (JavaScript/HTML5 Canvas) ⭐ Most Active Clone
**Repository:** github.com/SNAPesg/Towerz

**Status:** Early playable prototype (active as of January 2026!)

**Technical Approach:**
- Vanilla JavaScript (ES6 modules)
- HTML5 Canvas 2D
- CSS for Windows 95-style UI
- **No external dependencies**

**Currently Implemented:**
- 40×50 floor grid construction
- Room types: Offices, Condos, Hotels, Food Courts, Retail, Cinemas, Parking, Stairs, Elevators, Lobbies, Sky Lobbies
- $2,000,000 starting budget
- Day/night cycle with time controls
- Basic population simulation:
  - Office workers with daily schedules
  - Walking, waiting, riding elevators
  - **Stress system with red dots!**
- Elevator system:
  - Realistic door animations
  - Multi-car shafts
  - Floor request queue with directional logic
  - Visual car movement
- Income from all facility types
- Retro Windows 95 UI
- Sound effects (beeps)

**Their Planned Features (Roadmap):**
- Full resident simulation (daily routines, happiness, moving)
- Star rating → Tower progression
- Stress/complaints (overcrowding, noise, security, cleanliness)
- Security offices, housekeeping
- Express elevators & sky lobbies
- Service elevators
- Metro station & underground
- Disaster events
- Fire/terrorism
- Save/Load
- Zoom/pan

**Why This Matters:**
This is the closest anyone has gotten to a playable SimTower recreation. Their roadmap is basically our feature list. We should study their implementation carefully.

**Lessons Learned:**
1. Vanilla JS + Canvas is viable approach
2. Windows 95 aesthetic resonates with nostalgia
3. Stress visualization (red dots) is essential
4. Elevator door animations matter for feel
5. Active development possible in 2025-2026

---

### ScriptTower.js (JavaScript/Pixi.js)
**Repository:** github.com/tedwards947/ScriptTower.js

**Status:** Abandoned (2014)

**Technical Approach:**
- HTML5/JavaScript
- Pixi.js rendering engine
- Node.js server (never implemented)

**Notes:**
- Only 2 stars
- Developer acknowledged art skills lacking
- Never got beyond framework stage

**Lessons Learned:**
1. Art is a real barrier (need assets!)
2. Pixi.js is an option for rendering
3. Don't start without art plan

---

### Other Attempts (GitHub)
- **gm-stack/ztower-ng** (C): "More recent SimTower clone attempt" - stalled 2013
- **gm-stack/tower4.0** (C++): "Another attempt" - stalled 2013

---

## 8. MOBILE TOWER GAMES

### Tiny Tower (2011) - Different Genre
- Idle/casual clicker mechanics
- Not a simulation
- Shows mobile appetite for tower concept

### Project Highrise Mobile (2018)
- Full port of PC game
- Works well on iPad
- TouchArcade positive review
- Proves complex tower sim works on touch

### Yoot Tower (iPad)
- Official port to iOS
- Shows Yoot Saito interested in mobile market

### Key Mobile Lessons
1. Touch interface works for tower games
2. Session length matters on mobile
3. Portrait orientation may be natural fit (vertical tower)

---

## 9. RELATED GAMES (Not Direct Clones)

### Tiny Tower (NimbleBit, 2011)
- Idle/casual take on tower concept
- Bitizen management
- Not a simulation—more like clicker

### Fallout Shelter (Bethesda, 2015)
- Underground vault instead of tower
- Similar 2D cross-section view
- Resource management focus
- Dweller happiness/stats system

### The Sims (Maxis, 2000+)
- Individual people simulation depth
- AI routines and needs
- Not about buildings, but shows sim depth possible

---

## 10. KEY INSIGHTS FOR OPENTOWER

### What EVERY Successful Tower Game Has
1. ✅ Clear visual cross-section view
2. ✅ Day/night cycle
3. ✅ Income/expense management
4. ✅ Multiple room/facility types
5. ✅ Some form of progression (stars, unlocks)

### What SimTower Had That Others Lost
1. ❌ Elevator as CORE mechanic (not afterthought)
2. ❌ Visible stress/happiness on individuals
3. ❌ VIP evaluation moments
4. ❌ Emergent individual stories
5. ❌ Cathedral endgame goal

### What Project Highrise Added Worth Keeping
1. ✅ Deep utility infrastructure
2. ✅ Consultant progression system
3. ✅ Buzz/Influence currencies
4. ✅ Mod support

### What To Avoid
1. ❌ Hidden room dimensions
2. ❌ Soulless aesthetic
3. ❌ Idle game pacing
4. ❌ Elevators as afterthought
5. ❌ Unclear tenant complaints

---

## 11. ELEVATOR SIMULATION ANALYSIS

### What SimTower Got RIGHT
- **Central to gameplay** - The game was built around elevator code
- **Visible wait stress** - Red dots on frustrated tenants
- **Strategic depth** - Express/local, sky lobby patterns
- **30-floor limit** - Forces multi-bank solutions
- **VIP tests the whole system** - Dramatic evaluation moments

### What Project Highrise Got WRONG
- Elevators are just another utility
- No stress visualization
- No scheduling complexity
- Doesn't force creative solutions

### What Mad Tower Tycoon Attempted
- Floor skip settings
- Wait time adjustments
- More config than Project Highrise
- Still not core to experience

### What Towerz Is Doing
- Door opening/closing animations
- Multi-car shafts
- Directional queue logic
- Stress red dots
- Best modern attempt!

### Ideal Elevator System
1. **Physics-based simulation** - Real travel times, acceleration
2. **Visual feedback** - See cars move, doors open, people enter
3. **Stress indicators** - Red dots or equivalent on waiting tenants
4. **Configuration options** - Express/local, floor stops, capacity
5. **Strategic constraints** - 30-floor span limit, shaft space costs
6. **Rush hour challenge** - Morning/evening traffic spikes
7. **VIP gauntlet** - Must get VIP to destination without stress

---

## 12. DESIGN RECOMMENDATIONS

### Priority 1: Core Loop
The elevator must be THE GAME. Not a utility. Not an afterthought.
- Implement elevator simulation FIRST
- Build tower management around it
- Every design decision asks: "Does this make elevators more interesting?"

### Priority 2: Visible Humanity
People aren't just numbers. Show them.
- Individual sprites with states (happy, walking, waiting, stressed)
- Trackable individuals (names? stories?)
- Red stress indicators are ESSENTIAL
- Celebrate successes (weddings, parties, VIP praise)

### Priority 3: Clear Information
Never hide critical data.
- All room sizes visible from start
- Clear stress/happiness causes
- Utility coverage obvious at glance
- Financial projections available

### Priority 4: Pacing Variety
Don't become an idle game.
- Events interrupt waiting (fires, VIPs, complaints)
- Rush hours create challenge spikes
- Day/night changes traffic patterns
- Goals at every time scale (minute, hour, day, week)

### Priority 5: Personality
Give the tower character.
- Varied room appearances within types
- Seasonal decorations
- Sound design that tells stories
- Moments of humor/charm
- Santa at Christmas (SimTower did this!)

---

## 13. COMPETITIVE POSITIONING

### Our Niche
**"The SimTower successor that gets elevators right"**

### Differentiation from Project Highrise
| Aspect | Project Highrise | OpenTower |
|--------|-----------------|-----------|
| Core mechanic | Utilities | Elevators |
| People feel | Numbers | Individuals |
| Aesthetic | Sterile/modern | Warm/nostalgic |
| Complexity | Deep systems | Emergent depth |
| Information | Hidden | Transparent |

### Why We'll Succeed Where Open Source Failed
1. **Original assets** - Not dependent on SIMTOWER.EXE
2. **Clear vision** - This document defines success
3. **Active development** - Learn from Towerz's activity
4. **Modern tooling** - Fast iteration possible

---

## 14. SOURCES

- Steam Store pages (Project Highrise, Mad Tower Tycoon)
- Wikipedia (SimTower, Yoot Tower, Project Highrise, The Tower SP)
- Rock Paper Shotgun review (Project Highrise, 2016)
- IGN review (Project Highrise, 2016)
- GitHub (OpenSkyscraper, Towerz, ScriptTower.js)
- MobyGames, GameSpot, various archived reviews

---

*This analysis should inform every design decision for OpenTower. When in doubt, ask: "What would make the elevator experience more satisfying?"*
