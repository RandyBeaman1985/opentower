# ROADMAP: 5% → 50% Complete

**Goal:** Transform OpenTower from "functional prototype" to "actually fun to play"  
**Current State:** Systems work, but zero visual charm  
**Target State:** Players can see their tower come alive  
**Estimated Time:** 6-8 weeks (with AI art generation)  
**Key Insight:** This is 80% asset work, 20% code integration

---

## EXECUTIVE SUMMARY

### The Core Problem
We've been building **SYSTEMS** when SimTower's magic was **VISUALS**.

**What we have:**
- ✅ Elevator pathfinding (works)
- ✅ Population simulation (works)
- ✅ Economic system (works)
- ❌ **Zero soul, zero charm**

**What we need:**
- Real building sprites (interiors showing activity)
- Animated people (walking, working, not dots)
- Elevator visuals (doors, passengers, queues)
- Day/night cycle (lighting, atmosphere)
- Sound effects (ding, cha-ching, construction)

### Why 50% Is Achievable

**We're NOT building from scratch:**
- Architecture is solid ✅
- Core systems work ✅
- Rendering pipeline exists ✅

**We're adding ASSETS:**
- ~200 sprite frames (50% of 400 total needed)
- ~20 sound effects
- Integration code (sprite managers, animation)

**Timeline:** 6-8 weeks with focused sprint on visuals.

---

## PHASE BREAKDOWN

### Phase 0: Pre-Work (Week 0 - Before Starting)
**Goal:** Set up asset pipeline and tools  
**Duration:** 3-5 days

#### Tasks
1. **Set up Aseprite** ($20 one-time purchase)
   - Install on Davey's Mac
   - Learn basic pixel art workflow
   - Create template files (8×16 person, 144×24 office, etc.)

2. **Create Master Prompt Library**
   - ImageFX prompts for buildings
   - DALL-E prompts for people
   - Seed tracking system
   - Style guide (color palette, perspective, lighting)

3. **Build Asset Integration Pipeline**
   - Sprite sheet generator script
   - Asset loader in game code
   - Animation frame manager
   - Testing harness (view sprites in isolation)

4. **Create Reference Board**
   - Screenshots from SimTower original
   - OpenSkyscraper asset dumps
   - Color palette extracted from original
   - Measurement guide (1 tile = 16px, 1 floor = 48px HD)

**Deliverables:**
- ✅ Aseprite installed and configured
- ✅ Prompt library documented
- ✅ Asset pipeline scripts ready
- ✅ Reference materials organized

---

### Phase 1: MVP Visuals (Week 1-2)
**Goal:** Replace colored rectangles with REAL sprites  
**Impact:** Game goes from "prototype" to "oh, this looks like SimTower!"  
**Duration:** 10-14 days

#### Priority 1.1: Building Interiors (HIGH IMPACT)
**Generate:**
1. **Office (4 variants × 3 states = 12 sprites)**
   - States: Empty, Half-full (3 workers), Full (6 workers)
   - Interiors: Desks, computers, filing cabinets, workers at desks
   - Size: 144×24px (9 tiles × 1 floor, HD scale)
   - Tool: ImageFX (better at architecture)
   
2. **Lobby (2 variants × 1 state = 2 sprites)**
   - Normal lobby at 1★ level (simple desk, minimal decor)
   - Size: 64×36px (4 tiles × 1 floor)
   - Tool: ImageFX

3. **Fast Food (2 variants × 2 states = 4 sprites)**
   - States: Open Empty, Open Busy
   - Interiors: Counter, tables, customers standing/sitting
   - Size: 256×24px (16 tiles × 1 floor)
   - Tool: ImageFX

**Total: 18 building sprites**

**Prompts:**
```
[ImageFX - Office]
"Pixel art cross-section view of office interior, SimTower style, 
144×24px, side view cutaway, desks with computers, workers sitting 
at desks typing, filing cabinets, fluorescent lighting, 
corporate blue color scheme, retro 1990s aesthetic, 
clean lines, visible office workers as 8px tall sprites, 
isometric-ish perspective showing depth, 256 color palette"

Variants: "3 workers visible" | "6 workers visible" | "empty office"
```

**Code Integration:**
- `src/rendering/sprites/BuildingSprites.ts` (new file)
- Load sprite based on building type + occupancy state
- Replace `getBuildingColor()` with `getBuildingSprite()`
- Render sprites instead of colored rectangles

**Test:**
- Place office → should see desks and workers inside
- Spawn workers → office should fill up visually
- Workers leave → office should empty

#### Priority 1.2: People Sprites (HIGH IMPACT)
**Generate:**
1. **Generic Person (5 stress colors × 2 directions = 10 sprites)**
   - Colors: Black (normal), Light Pink, Dark Pink, Red, Dark Red
   - Directions: Left-facing, Right-facing
   - Size: 8×16px
   - Animation: Static for now (walking animation in Phase 2)
   - Tool: DALL-E 3 (better at human figures)

**Prompts:**
```
[DALL-E 3 - Person]
"Single pixel art sprite, 8×16 pixels, person in business casual,
side view profile, simple clean design, 1990s SimTower aesthetic,
black body silhouette, standing pose, white background,
retro game sprite style, high contrast"

Variants: Rotate sprite for left/right facing
Colors: Recolor in post (Aseprite) for stress levels
```

**Code Integration:**
- `src/rendering/sprites/PeopleSprites.ts` (new file)
- Load sprite based on stress level + direction
- Replace 4px circle with sprite
- Position at person.currentTile/currentFloor

**Test:**
- Spawn person → should see tiny human sprite
- Person walks → sprite should flip direction
- Person waits → stress color should change sprite

#### Priority 1.3: Elevator Visuals (MEDIUM IMPACT)
**Generate:**
1. **Elevator Shaft (2 variants = 2 sprites)**
   - Narrow shaft (standard/service)
   - Wide shaft (express - future)
   - Size: 32×36px per floor segment
   - Tool: ImageFX

2. **Elevator Car (3 states = 3 sprites)**
   - States: Empty, Half-full, Full
   - Size: 28×30px
   - Visible windows showing passengers inside
   - Tool: ImageFX

3. **Elevator Doors (2 states = 2 sprites)**
   - Open doors
   - Closed doors
   - Size: 32×8px
   - Tool: DALL-E 3 or manual in Aseprite

**Total: 7 elevator sprites**

**Code Integration:**
- Update `src/rendering/ElevatorRenderer.ts`
- Render shaft sprite (tiled vertically)
- Render car sprite at car position
- Add door sprites at each floor the shaft services
- Door state based on car position (open when car present)

**Test:**
- Place elevator → should see shaft with doors
- Car moves → should see car sprite scrolling
- Car stops → doors should open, passengers visible inside

#### Priority 1.4: Basic Sky (LOW IMPACT)
**Generate:**
1. **Day Sky (3 times = 3 sprites)**
   - Morning (light blue gradient)
   - Noon (bright blue)
   - Evening (orange/pink gradient)
   - Size: 6000×1200px (covers full tower width)
   - Tool: ImageFX (great at gradients)

**Code Integration:**
- `src/rendering/SkyRenderer.ts` (new file)
- Track time of day (6 AM = morning, 12 PM = noon, 6 PM = evening)
- Lerp between sky states
- Render as background before buildings

**Test:**
- Game starts → morning sky
- Advance time → sky should transition

**Phase 1 Totals:**
- **Sprites Generated:** 38
- **Code Files Modified:** 4-5
- **Time Estimate:** 10-14 days
- **Impact:** Game looks 10x better immediately

---

### Phase 2: Animation & Life (Week 3-4)
**Goal:** Make the tower FEEL ALIVE  
**Impact:** Game goes from "static" to "living, breathing"  
**Duration:** 10-14 days

#### Priority 2.1: Walking Animations (HIGH IMPACT)
**Generate:**
1. **Person Walking (2-frame cycle × 5 colors × 2 directions = 20 sprites)**
   - Frame 1: Left leg forward
   - Frame 2: Right leg forward
   - Tool: DALL-E 3 + Aseprite tweening

**Code Integration:**
- `src/rendering/AnimationManager.ts` (new file)
- Track animation state per person
- Alternate frames every 200ms when person.state === 'walking'
- Static sprite when standing/waiting

**Test:**
- Person walks → legs should animate
- Person stops → animation should freeze

#### Priority 2.2: Elevator Doors Animating (MEDIUM IMPACT)
**Generate:**
1. **Door Opening/Closing (4-frame sequence = 4 sprites)**
   - Frame 1: Closed
   - Frame 2: 25% open
   - Frame 3: 75% open
   - Frame 4: Fully open
   - Tool: Aseprite manual animation

**Code Integration:**
- Update `ElevatorRenderer.ts`
- When car arrives: play opening sequence (200ms per frame)
- When car departs: play closing sequence
- Track door state per elevator car

**Test:**
- Elevator arrives → doors should slide open
- Elevator departs → doors should slide closed

#### Priority 2.3: Building Activity States (MEDIUM IMPACT)
**Generate:**
1. **Office Lights On/Off (4 variants × 2 states = 8 sprites)**
   - Day version (lights off, natural light)
   - Night version (lights on, glowing windows)
   - Tool: ImageFX with lighting prompt variation

2. **Lobby Day/Night (2 sprites)**
   - Same as above

**Code Integration:**
- Track time of day in game
- After 6 PM: render night versions
- Before 6 PM: render day versions

**Test:**
- Advance time to 6 PM → building lights should turn on
- Advance to 6 AM → lights should turn off

#### Priority 2.4: Elevator Queue Visualization (HIGH IMPACT)
**Generate:**
1. **Waiting Person Sprites (stacked groups)**
   - 1 person waiting
   - 2 people waiting (stacked)
   - 3-5 people waiting (crowd)
   - Tool: Manual composition in Aseprite

**Code Integration:**
- `src/rendering/PeopleRenderer.ts`
- When person.state === 'waitingForElevator'
- Stack sprites at elevator entrance
- Show count indicator (text: "3 waiting")

**Test:**
- Multiple people wait → should see crowd at elevator door
- Elevator arrives → crowd should board, visual should clear

**Phase 2 Totals:**
- **Sprites Generated:** 34
- **Code Files Modified:** 3-4
- **Time Estimate:** 10-14 days
- **Impact:** Tower feels alive, not static

---

### Phase 3: Building Variety (Week 5-6)
**Goal:** Add hotels, restaurants, shops with unique visuals  
**Impact:** Tower diversity, strategic placement visible  
**Duration:** 10-14 days

#### Priority 3.1: Hotel Rooms (MEDIUM IMPACT)
**Generate:**
1. **Hotel Single (2 variants × 4 states = 8 sprites)**
   - Variants: Room A, Room B
   - States: Vacant, Occupied (guest standing), Sleeping (guest in bed), Dirty (messy)
   - Size: 64×24px (4 tiles × 1 floor)
   - Tool: ImageFX

**Code Integration:**
- Add hotel occupancy state tracking
- Render sprite based on time of day + occupancy
- Add check-in/check-out mechanics (simple version)

#### Priority 3.2: Restaurants (MEDIUM IMPACT)
**Generate:**
1. **Restaurant (2 variants × 2 states = 4 sprites)**
   - Variants: Style A, Style B
   - States: Empty, Busy (diners at tables)
   - Size: 384×24px (24 tiles × 1 floor)
   - Tool: ImageFX

**Code Integration:**
- Track customer count
- Render busy sprite when >5 customers present
- Generate income based on customers (BUG-010 fix)

#### Priority 3.3: Shops (LOW IMPACT)
**Generate:**
1. **Shop (3 variants × 2 states = 6 sprites)**
   - Variants: Bookstore, Clothing, Electronics
   - States: Closed, Open
   - Size: 192×24px (12 tiles × 1 floor)
   - Tool: ImageFX

**Code Integration:**
- Similar to restaurants
- Add to building placement menu

#### Priority 3.4: Condos (MEDIUM IMPACT)
**Generate:**
1. **Condo (2 variants × 3 states = 6 sprites)**
   - Variants: Style A, Style B
   - States: For Sale (empty), Occupied (furniture visible), Night (lights on)
   - Size: 256×24px (16 tiles × 1 floor)
   - Tool: ImageFX

**Code Integration:**
- Track sold/unsold state
- Render "For Sale" sign when vacant
- Show furniture when occupied

**Phase 3 Totals:**
- **Sprites Generated:** 24
- **Code Files Modified:** 3-4
- **Time Estimate:** 10-14 days
- **Impact:** Strategic building choices now VISIBLE

---

### Phase 4: Sound & Juice (Week 7)
**Goal:** Add audio feedback and satisfaction moments  
**Impact:** Game feels GOOD to play  
**Duration:** 5-7 days

#### Priority 4.1: Core Sound Effects (HIGH IMPACT)
**Source:**
- ElevenLabs Sound Effects (free tier)
- Freesound.org (public domain)
- Self-recorded (Audacity, free)

**Sounds Needed:**
1. **Elevator ding** (when doors open)
2. **Cash register cha-ching** (when income arrives)
3. **Construction hammer** (when placing building)
4. **Error buzz** (invalid placement)
5. **Applause** (star rating increase)
6. **Ambient office murmur** (background, low volume)

**Code Integration:**
- `src/audio/SoundManager.ts` (new file)
- Preload sounds on game start
- Trigger sounds on events (via event bus)
- Volume controls in settings

**Test:**
- Place building → hammer sound
- Elevator arrives → ding
- Income arrives → cash register

#### Priority 4.2: Visual Juice (MEDIUM IMPACT)
**Add:**
1. **Screen shake** (when income arrives, building placed)
2. **Particle effects** (cash particles when income, dust when building)
3. **Button hover states** (scale up slightly on hover)
4. **Smooth transitions** (fade in/out for menus)

**Code Integration:**
- `src/effects/ScreenShake.ts`
- `src/effects/ParticleEmitter.ts`
- CSS transitions for UI

**Test:**
- Hover button → should scale up
- Place building → screen should shake subtly
- Income arrives → cash particles should float up

**Phase 4 Totals:**
- **Sounds Added:** 6-10
- **Code Files Modified:** 2-3
- **Time Estimate:** 5-7 days
- **Impact:** Game feels satisfying to interact with

---

### Phase 5: Day/Night Cycle (Week 8)
**Goal:** Full atmospheric day/night cycle  
**Impact:** Tower feels like a living space  
**Duration:** 5-7 days

#### Priority 5.1: Complete Sky Cycle (MEDIUM IMPACT)
**Generate:**
1. **Sky Gradients (8 more times = 8 sprites)**
   - Dawn, Late Morning, Afternoon, Late Afternoon, Dusk, Early Night, Night, Late Night
   - Tool: ImageFX

**Code Integration:**
- Track in-game time (1 day = ~10 minutes real time)
- Lerp between sky states smoothly
- Sync with building lighting states

#### Priority 5.2: Lighting Effects (HIGH IMPACT)
**Generate:**
1. **Building Light Overlays (glow effect at night)**
   - Tool: Manual in Aseprite (add yellow glow layer)

**Code Integration:**
- Render overlay layer on buildings after 6 PM
- Fade in/out during dusk/dawn

**Test:**
- Watch full day cycle → sky should transition smoothly
- Buildings should light up at dusk, turn off at dawn

**Phase 5 Totals:**
- **Sprites Generated:** 8
- **Code Files Modified:** 2-3
- **Time Estimate:** 5-7 days
- **Impact:** Atmospheric, immersive

---

## WHAT 50% LOOKS LIKE

After completing Phases 1-5 (6-8 weeks), OpenTower will have:

### Visual Quality: 7/10
- ✅ Real building sprites with interiors
- ✅ Animated people walking
- ✅ Elevator doors opening/closing
- ✅ Day/night cycle with lighting
- ✅ Queue visualization at elevators
- ✅ Multiple building types with unique looks
- ❌ Weather effects (50%+ feature)
- ❌ Special events (fires, bombs - 50%+ feature)

### Gameplay Feel: 6/10
- ✅ Can SEE tower activity (interiors, people)
- ✅ Spatial awareness (busy vs empty buildings)
- ✅ Satisfying feedback (sounds, particles)
- ✅ Core loop is fun (build → watch → optimize)
- ❌ Missing advanced buildings (cinema, party hall, metro)
- ❌ Missing events (VIPs, disasters)

### Core Systems: 7/10
- ✅ All current systems working
- ✅ Food income generating
- ✅ Basic hotel mechanics
- ✅ Save/load (add in Phase 4)
- ❌ Stairs pathfinding (fix in Phase 1)
- ❌ Advanced systems (housekeeping, security)

### Polish: 5/10
- ✅ Sound effects
- ✅ Visual juice (particles, shake)
- ✅ Smooth animations
- ❌ Full UI polish (tooltips, keyboard shortcuts)
- ❌ Advanced effects (weather, seasonal)

### OVERALL: 50%
**Translation:** Players can have FUN for 2-3 hours instead of 10 minutes.

---

## ASSET GENERATION STRATEGY

### Tools & Costs
- **ImageFX (Imagen 4):** Free via Gemini Ultra (Davey has subscription)
- **DALL-E 3:** $20/month OpenAI Pro (Davey has subscription)
- **Aseprite:** $20 one-time purchase
- **ElevenLabs Sound:** Free tier or $11/month Pro
- **Total New Costs:** $20-50

### Generation Workflow

#### Week-by-Week
**Week 1:**
- Monday: Set up tools, create templates
- Tuesday-Thursday: Generate all Phase 1 building sprites (ImageFX batch)
- Friday: Generate people sprites (DALL-E)
- Weekend: Post-process in Aseprite, integrate into code

**Week 2:**
- Monday-Wednesday: Generate elevator sprites
- Thursday: Generate sky sprites
- Friday: Integration testing, bug fixes
- **Milestone:** Game looks like SimTower!

**Week 3:**
- Monday-Tuesday: Generate walking animation frames
- Wednesday: Generate door animation frames
- Thursday-Friday: Code integration, animation system
- **Milestone:** Tower feels alive!

**Week 4:**
- Monday-Wednesday: Generate day/night variants
- Thursday-Friday: Queue visualization + testing
- **Milestone:** Animation complete!

**Week 5-6:**
- Generate hotel, restaurant, shop, condo sprites
- Integrate and test each building type
- **Milestone:** Building variety!

**Week 7:**
- Add sound effects
- Add visual juice
- **Milestone:** Game feels good!

**Week 8:**
- Complete sky cycle
- Lighting effects
- Final polish and bug fixes
- **Milestone:** 50% ACHIEVED!

### Prompt Strategy

#### Master Style Prompt (Prepend to ALL)
```
"Pixel art, SimTower 1994 aesthetic, side view cross-section cutaway, 
retro game style, 256 color palette, clean lines, isometric-ish depth, 
1990s Maxis game visual style, HD 4x scale (original was 160×120 base resolution)"
```

#### Seed Consistency
- Generate first batch, save seed
- Use same seed for all related assets (all offices, all people, etc.)
- Ensures visual coherence

#### Post-Processing Pipeline
1. Generate with AI (ImageFX or DALL-E)
2. Import to Aseprite
3. Scale to exact pixel dimensions
4. Extract and lock color palette
5. Clean up artifacts (AI often generates noise)
6. Export as PNG sprite sheets
7. Load into game

### Quality Control
- ✅ All sprites match color palette
- ✅ All sprites match perspective (side view)
- ✅ All sprites at correct scale (16px per tile)
- ✅ No anti-aliasing (crisp pixel edges)
- ✅ Transparent backgrounds where needed

---

## RISKS & MITIGATION

### Risk 1: AI Generation Quality
**Problem:** AI might not generate pixel art well  
**Likelihood:** Medium  
**Mitigation:**
- Test prompts on 5-10 samples before batch generation
- Iterate prompt until style is consistent
- Manual cleanup in Aseprite as fallback
- Use references from SimTower original

### Risk 2: Animation Integration Complexity
**Problem:** Animation system might be harder than expected  
**Likelihood:** Medium  
**Mitigation:**
- Start with simplest animations (walking 2-frame)
- Build animation manager incrementally
- Use PIXI.js AnimatedSprite (built-in support)
- Lots of tutorials available

### Risk 3: Scope Creep
**Problem:** "Just one more feature..." syndrome  
**Likelihood:** HIGH  
**Mitigation:**
- **STICK TO THE PHASES**
- Resist adding new systems (no weather in Phase 1!)
- Focus on REPLACING rectangles with sprites
- Save advanced features for 50% → 100%

### Risk 4: Asset Generation Time
**Problem:** 200 sprites might take longer than estimated  
**Likelihood:** Medium  
**Mitigation:**
- Generate in parallel (ImageFX + DALL-E simultaneously)
- Accept "good enough" instead of "perfect"
- Prioritize high-impact sprites (buildings > decorations)
- Reuse sprites where possible (mirror, recolor)

### Risk 5: Performance Issues
**Problem:** Rendering 200 sprites might tank FPS  
**Likelihood:** Low  
**Mitigation:**
- PIXI.js is built for sprite rendering (handles thousands)
- Use sprite sheets (batch rendering)
- Frustum culling already implemented
- Test at 1000+ people early

---

## SUCCESS CRITERIA

### How We Know We've Hit 50%

#### Playtest Metrics
1. **First Impression:** "Whoa, this looks like SimTower!" (not "What are these rectangles?")
2. **Engagement Time:** Players play for 30+ minutes (vs current 5-10 minutes)
3. **Repeat Plays:** Players come back the next day
4. **Visual Scan:** Can understand tower state at a glance (busy vs empty)
5. **Emotional Response:** Players CARE about their tower (attachment formed)

#### Technical Metrics
1. **Sprite Coverage:** 80%+ of buildings have real sprites (not placeholders)
2. **Animation Coverage:** People walk, elevator doors open
3. **Sound Coverage:** 6+ sound effects implemented
4. **Day/Night:** Full cycle implemented
5. **Performance:** 60 FPS with 500+ people, 50+ buildings

#### Comparison Test
**Show OpenTower (50%) and SimTower (original) side-by-side:**
- Observers should say "they look similar" (not "one is rectangles")
- Animations should feel comparable
- Visual quality gap should be <30% (not 95% like now)

---

## WHAT COMES AFTER 50%?

Once we hit 50%, remaining work is:

### 50% → 75% (Depth)
- Advanced buildings (cinema, party hall, metro, cathedral)
- Events (fires, bombs, VIPs, Santa)
- Full hotel system (housekeeping, check-in/out)
- Weather effects (rain, snow)
- More animations (working, eating, sleeping)

### 75% → 100% (Polish)
- All 21 building types
- All 900 sprite frames
- Full sound library (48 sounds)
- Music tracks
- Advanced AI (better pathfinding, preferences)
- Save/load with multiple slots
- Statistics and graphs
- Achievements/challenges

---

## TIMELINE SUMMARY

| Week | Phase | Focus | Deliverables |
|------|-------|-------|--------------|
| 0 | Pre-Work | Tools + Pipeline | Aseprite, prompts, scripts |
| 1 | Phase 1A | Building Sprites | 18 building sprites |
| 2 | Phase 1B | People + Elevators | 17 sprites, basic visuals |
| 3 | Phase 2A | Walking Animations | 20 animated sprites |
| 4 | Phase 2B | Elevator Doors + Activity | 12 sprites, door animations |
| 5 | Phase 3A | Hotels + Restaurants | 12 sprites |
| 6 | Phase 3B | Shops + Condos | 12 sprites |
| 7 | Phase 4 | Sound + Juice | 6-10 sounds, effects |
| 8 | Phase 5 | Day/Night Cycle | 8 sky sprites, lighting |

**Total Duration:** 6-8 weeks  
**Total Sprites:** ~200  
**Total Sounds:** ~10  
**Total Code Files:** ~15-20 modified/created

---

## CONCLUSION

**The path from 5% → 50% is clear:**
1. ✅ Stop building systems (architecture is done)
2. ✅ Start generating sprites (visuals are everything)
3. ✅ Use AI art tools (fast, cheap, good enough)
4. ✅ Integrate incrementally (1 phase at a time)
5. ✅ Test relentlessly (does it FEEL like SimTower?)

**This is achievable in 6-8 weeks because:**
- We're not rewriting code (foundation is solid)
- We're not designing systems (they already work)
- We're adding ART (AI can generate fast)
- We have the tools (ImageFX, DALL-E, Aseprite)

**The result:**
- OpenTower that looks like SimTower ✅
- Players who ENJOY playing (not just testing) ✅
- A game worth showing people ✅
- 50% done (actually playable and fun) ✅

**Let's do this.** 🚀

---

*Roadmap delivered. Path is clear.*  
*— Subagent Reality-Check, 2025-01-31*
