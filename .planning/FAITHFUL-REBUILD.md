# OpenTower Faithful Rebuild Plan
**Goal:** Make it feel EXACTLY like playing SimTower from a 1994 CD-ROM
**Timeline:** Multi-day effort. No shortcuts.
**Status:** ACTIVE

---

## Assets Acquired

### Audio (28 files) ✅
Location: `public/sounds/simtower-original/`
- Build sounds
- Elevator sounds
- Ambient sounds (birds, crickets, rain, crowds)
- Event sounds (fire, explosion, terrorist)
- Building-specific sounds (office, restaurant, theater)
- Star rating fanfare

### Sprites (287 PNG files) ✅
Location: `public/sprites/ocram/`
Source: OcramTower by AzemOcram (CC licensed)
- Rooms (5 styles: Default, Modern, ArtDeco, HighriseDev, Vector)
  - Hotels (single, double, suite, love suite)
  - Condos
  - Fast food (8 variants)
  - Offices
- Lobbies (grand lobby, sky lobby, awnings)
- Transport (elevators, escalators, stairs)
- UI elements

---

## Phase 1: Make It Playable (CRITICAL)

### 1.1 Camera System
- [ ] WASD/Arrow keys for panning
- [ ] Mouse wheel zoom (0.25x to 4x)
- [ ] Middle mouse drag to pan
- [ ] Edge-of-screen pan (optional)
- [ ] Camera starts centered on lobby level (floor 0-1)
- [ ] Smooth interpolation on all camera moves

### 1.2 Building Placement
- [ ] Click building in menu = select it
- [ ] Cursor changes to show selected building
- [ ] Click on grid = place building (if valid)
- [ ] Ghost preview shows where building will go
- [ ] Red ghost if placement invalid
- [ ] Green ghost if placement valid
- [ ] Sound effect on place (Build_1.mp3)
- [ ] Sound effect on invalid (No_Plop.mp3)

### 1.3 Basic UI
- [ ] Clear funds display (top bar)
- [ ] Current date/time display
- [ ] Speed controls (pause, 1x, 2x, 3x)
- [ ] Star rating display
- [ ] Building menu with clear categories

---

## Phase 2: Make It Look Right

### 2.1 Sprite Integration
- [ ] Load Ocram sprites into BuildingSprites.ts
- [ ] Map each building type to correct sprite
- [ ] Day/night sprite variants
- [ ] Animated states (occupied, empty, etc.)

### 2.2 People Rendering
- [ ] Tiny 4-8px people sprites
- [ ] Walk animation
- [ ] Different colors for variety
- [ ] Visible inside buildings

### 2.3 Day/Night Cycle
- [ ] Sky color changes
- [ ] Building lights turn on at dusk
- [ ] Ambient lighting overlay
- [ ] Gradual transitions

### 2.4 Elevator Visual
- [ ] Visible elevator cars
- [ ] People getting in/out
- [ ] Door animation
- [ ] Cable/shaft visibility

---

## Phase 3: Make It Sound Right

### 3.1 Sound Integration
- [ ] Replace current sounds with originals
- [ ] Map each sound to correct event
- [ ] Ambient sound layers:
  - Morning: Birds
  - Day: Office noise, crowds
  - Evening: Restaurant clatter
  - Night: Crickets, quiet
- [ ] Building-specific sounds when zoomed in

### 3.2 Music (Research needed)
- [ ] Find or create elevator music
- [ ] Lobby background music
- [ ] Event stingers

---

## Phase 4: Core Gameplay Feel

### 4.1 Time Progression
- [ ] Days pass visibly
- [ ] Rush hours (8-9am, 5-6pm) with visible elevator stress
- [ ] Weekday vs weekend different behaviors
- [ ] Year progression for reviews/star ratings

### 4.2 Tenant Feedback
- [ ] Visible satisfaction indicators
- [ ] Complaints appear as speech bubbles
- [ ] Move-out animations when unhappy
- [ ] Move-in animations when new tenants arrive

### 4.3 Elevator Management
- [ ] Elevator control panel (original style)
- [ ] Set floor ranges
- [ ] Express vs local
- [ ] Visible stress meter
- [ ] Waiting time indicators

---

## Phase 5: Polish & Feel

### 5.1 First-Run Experience
- [ ] Welcome modal
- [ ] Guided first building (lobby)
- [ ] Contextual hints
- [ ] Demo/sandbox mode

### 5.2 Juice
- [ ] Screen settle on big events
- [ ] Particle effects (construction dust)
- [ ] Floating money text
- [ ] Achievement popups for stars

### 5.3 Save/Load
- [ ] Auto-save every game day
- [ ] Multiple save slots
- [ ] Screenshot preview in load screen

---

## Technical Notes

### Building Type Mapping
```typescript
// Map our types to Ocram sprites
const SPRITE_MAP = {
  office: 'Rooms/Default/MM_Office-*',
  fastFood: 'Rooms/Default/MM_FastFood-*',
  restaurant: 'Rooms/Default/MM_Restaurant-*',
  condo: 'Rooms/Default/HrD_condo-*',
  hotelSingle: 'Rooms/Default/MM_Hotel-single-*',
  hotelDouble: 'Rooms/Default/MM_Hotel-double-*',
  hotelSuite: 'Rooms/Default/MM_Hotel-Suite-*',
  lobby: 'Lobbies/MM_GrandLobby-*',
  skyLobby: 'Lobbies/MM_SkyLobby-*',
  elevator: 'Transport/MM_Elevator-*',
  stairs: 'Transport/MM_stairs_*',
  escalator: 'Transport/MM_Escalator*',
};
```

### Sound Mapping
```typescript
const SOUND_MAP = {
  build: 'simtower-original/Build_1.mp3',
  demolish: 'simtower-original/Demolish.mp3',
  buy: 'simtower-original/Buy.mp3',
  starGet: 'simtower-original/StarGet.mp3',
  elevatorMove: 'simtower-original/Elevator_Move.mp3',
  elevatorOpen: 'simtower-original/Elevator_Open_1.mp3',
  fire: 'simtower-original/Fire.mp3',
  // etc.
};
```

---

## Daily Progress Log

### Day 1 (2026-02-03)
- [x] Researched original SimTower mechanics
- [x] Downloaded 28 original audio files
- [x] Acquired 287 sprite PNG files from OcramTower
- [x] Created this rebuild plan
- [ ] Started Phase 1.1 (Camera)
- [ ] Started Phase 1.2 (Building placement)

---

## Success Criteria

The game is "done" when:
1. A new player can figure out how to play in <60 seconds
2. Building feels satisfying (visual + audio feedback)
3. Day/night cycle is visible and atmospheric
4. Elevator management is the core challenge
5. Star progression feels rewarding
6. Can play for 30+ minutes without frustration
7. Looks like a lovingly crafted pixel art game
8. Sounds like the original
9. Someone who played SimTower says "this feels right"

---

*Created: 2026-02-03*
*Last Updated: 2026-02-03*
