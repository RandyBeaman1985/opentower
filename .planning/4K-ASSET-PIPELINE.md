# OpenTower 4K Asset Pipeline
## Using Existing Subscriptions (Gemini Ultra + OpenAI Pro)

*Created: 2026-01-30*
*Updated: 2026-01-30 — Optimized for Davey's existing subscriptions*

---

## 💰 Cost Structure: $0-20 Total

**Already Paid For:**
- ✅ **Google Gemini AI Ultra** → Unlimited ImageFX (Imagen 4)
- ✅ **OpenAI Pro** → Unlimited DALL-E 3 + GPT-4o images
- ✅ **Claude Max** → Prompt iteration, code assistance

**Optional One-Time:**
- ⚪ **Aseprite** → $20 (or use GIMP for free)

**Fallback Only (if needed):**
- ⚪ **PixelLab.ai** → $29-49/mo (only if free tools fail)

---

## Overview

### Primary Tools (FREE via existing subscriptions):

**1. ImageFX (Imagen 4)** - via Gemini Ultra
- **Best for:** Buildings, interiors, backgrounds, scenes
- **Resolution:** Up to 2K native
- **Access:** [labs.google/fx/tools/image-fx](https://labs.google/fx/tools/image-fx)

**2. DALL-E 3 / GPT-4o** - via OpenAI Pro  
- **Best for:** Characters, people, detailed objects
- **Resolution:** Up to 1024×1024 (DALL-E 3) or 2K (GPT-4o)
- **Access:** chat.openai.com or API

### Why This Combination Works:

1. **ImageFX excels at:** Architecture, interiors, cross-sections, environments
2. **DALL-E 3 excels at:** Human figures, consistent characters, details
3. **Combined:** Full coverage of SimTower asset types
4. **Cost:** $0 additional (already paying for both)

---

## SimTower Asset Inventory

### Resolution Strategy

**Original SimTower:**
- Tile size: ~16×16 pixels
- Building unit: Varies (Office = 9 tiles wide = 144×16)
- 8-bit color palette (256 colors)

**OpenTower 4K Target:**
- Tile size: 64×64 pixels (4× scale)
- Building unit: Office = 576×64 pixels
- 32-bit color with retro palette constraint

**Workflow:**
1. Generate at 2048×2048 (ImageFX max)
2. Extract/crop relevant sections
3. Scale to exact tile dimensions (64×64 base)
4. Apply consistent palette filter
5. Export as PNG sprite sheets

---

## Complete Asset Catalog

### 1. Buildings - Commercial (8 types)

| Asset | Original Size | 4K Size | States | Notes |
|-------|---------------|---------|--------|-------|
| **Lobby** | 144×16 (9 tiles) | 576×64 | Empty, Busy | Ground floor, required |
| **Office** | 144×16 (9 tiles) | 576×64 | Empty, Occupied, Crowded | Workers visible through windows |
| **Fast Food** | 80×16 (5 tiles) | 320×64 | Closed, Open, Busy | Counter, customers |
| **Restaurant** | 144×16 (9 tiles) | 576×64 | Closed, Open, Busy | Tables, waitstaff |
| **Shop** | 80×16 (5 tiles) | 320×64 | Closed, Open | Storefront with display |
| **Cinema** | 240×32 (15×2 tiles) | 960×128 | Closed, Showing | 2 floors, big marquee |
| **Party Hall** | 144×16 (9 tiles) | 576×64 | Empty, Event | Large open space |
| **Cathedral** | 144×32 (9×2 tiles) | 576×128 | Normal | Tower crowning achievement |

### 2. Buildings - Residential (3 types)

| Asset | Original Size | 4K Size | States | Notes |
|-------|---------------|---------|--------|-------|
| **Condo (Single)** | 64×16 (4 tiles) | 256×64 | Empty, Occupied | Window variants |
| **Condo (Double)** | 128×16 (8 tiles) | 512×64 | Empty, Occupied | Larger unit |
| **Hotel Room** | 64×16 (4 tiles) | 256×64 | Vacant, Occupied, Dirty | Maid cart outside when dirty |

### 3. Buildings - Services (6 types)

| Asset | Original Size | 4K Size | States | Notes |
|-------|---------------|---------|--------|-------|
| **Medical Center** | 80×16 (5 tiles) | 320×64 | Normal | Red cross, hospital beds visible |
| **Security Office** | 48×16 (3 tiles) | 192×64 | Normal, Alert | Guards, monitors |
| **Housekeeping** | 48×16 (3 tiles) | 192×64 | Normal | Carts, supplies |
| **Recycling** | 48×16 (3 tiles) | 192×64 | Normal | Bins, processing |
| **Parking (per floor)** | 400×16 (25 tiles) | 1600×64 | Empty, Full | Underground, cars visible |
| **Metro Station** | 144×32 (9×2 tiles) | 576×128 | Empty, Train | Underground, platform |

### 4. Transport Systems (4 types)

| Asset | Original Size | 4K Size | States | Notes |
|-------|---------------|---------|--------|-------|
| **Elevator Shaft** | 32×varies | 128×varies | - | Per-floor segment |
| **Elevator Car** | 32×24 | 128×96 | Empty, 1-8 people, Full | Doors open/closed |
| **Stairs** | 32×32 (2×2 tiles) | 128×128 | Normal | Connects 2 floors |
| **Escalator** | 48×32 (3×2 tiles) | 192×128 | Normal | Animated (up/down variants) |

### 5. People (12 types)

| Asset | Base Size | 4K Size | Directions | Notes |
|-------|-----------|---------|------------|-------|
| **Office Worker (M)** | 8×16 | 32×64 | L, R | Briefcase, suit |
| **Office Worker (F)** | 8×16 | 32×64 | L, R | Skirt/pants variants |
| **Hotel Guest** | 8×16 | 32×64 | L, R | Luggage |
| **Shopper** | 8×16 | 32×64 | L, R | Shopping bags |
| **Restaurant Patron** | 8×16 | 32×64 | Seated | At table |
| **Maid** | 8×16 | 32×64 | L, R | Cart nearby |
| **Security Guard** | 8×16 | 32×64 | L, R | Uniform |
| **Maintenance** | 8×16 | 32×64 | L, R | Coveralls |
| **VIP** | 8×16 | 32×64 | L, R | Fancy clothes |
| **Child** | 8×12 | 32×48 | L, R | Smaller |
| **Santa Claus** | 16×24 | 64×96 | Flying | End of year event |
| **Terrorist** | 8×16 | 32×64 | L, R | Suspicious character |

### 6. UI Elements

| Asset | Size | Notes |
|-------|------|-------|
| **Tool icons** | 64×64 | Build menu buttons |
| **Star ratings** | 32×32 each | 1-5 stars + TOWER |
| **Info panels** | Various | Building details |
| **Cursor icons** | 32×32 | Place, delete, inspect |
| **Status icons** | 24×24 | Stress, satisfaction |

### 7. Effects & Overlays

| Asset | Size | Notes |
|-------|------|-------|
| **Fire** | 32×64 | Animated flames |
| **Smoke** | 32×32 | Fire smoke |
| **Bomb** | 16×16 | Terrorist event |
| **Explosion** | 128×128 | Bomb detonation |
| **Gold treasure** | 32×32 | Underground discovery |
| **Construction** | Tile size | Building in progress |

---

## Total Asset Count

| Category | Count | Estimated Images |
|----------|-------|------------------|
| Commercial Buildings | 8 types × 3 states avg | ~24 |
| Residential Buildings | 3 types × 3 states avg | ~9 |
| Service Buildings | 6 types × 2 states avg | ~12 |
| Transport Systems | 4 types × variants | ~20 |
| People | 12 types × 2 directions | ~24 |
| UI Elements | Various | ~30 |
| Effects | Various | ~15 |
| **TOTAL** | | **~134 images** |

---

## ImageFX Prompt Templates

### Master Style Prompt (prefix all prompts)

```
Pixel art style, isometric side-view cross-section, clean lines, 
limited color palette (16 colors), game asset on transparent 
background, inspired by 1990s Japanese simulation games like 
SimTower and Yoot Tower, warm indoor lighting, detailed but 
readable at small sizes
```

### Building Prompts

**Lobby:**
```
[MASTER STYLE] modern building lobby interior cross-section, marble 
floors, reception desk, potted plants, people walking, glass entrance 
doors visible, warm lighting from ceiling, 576 pixels wide
```

**Office:**
```
[MASTER STYLE] office floor interior cross-section, cubicles with 
workers at computers, fluorescent lighting, water cooler, meeting 
room visible, busy workday atmosphere
```

**Hotel Room:**
```
[MASTER STYLE] hotel room interior cross-section, single bed, 
nightstand with lamp, small bathroom visible, luggage, window 
with curtains, cozy warm lighting
```

**Fast Food:**
```
[MASTER STYLE] fast food restaurant interior cross-section, counter 
with registers, menu boards above, customers in line, kitchen 
visible behind counter, bright fluorescent lighting
```

**Restaurant:**
```
[MASTER STYLE] upscale restaurant interior cross-section, tables 
with white tablecloths, diners seated, waiter serving, wine glasses, 
elegant chandelier lighting
```

**Cinema:**
```
[MASTER STYLE] movie theater interior cross-section, two floors, 
lobby with popcorn stand on lower floor, theater seats facing 
screen on upper floor, marquee with movie title
```

### People Prompts

**Office Worker:**
```
[MASTER STYLE] single businessman character sprite, wearing suit 
and tie, carrying briefcase, walking pose facing right, professional 
appearance, isolated on transparent background, 32×64 pixels
```

**Hotel Guest:**
```
[MASTER STYLE] single hotel guest character sprite, casual tourist 
clothes, rolling suitcase, walking pose facing right, isolated on 
transparent background, 32×64 pixels
```

### Elevator Prompts

**Elevator Car (Empty):**
```
[MASTER STYLE] elevator car interior cross-section, doors open, 
empty interior, floor buttons panel visible, handrail, overhead 
lighting, 128×96 pixels
```

**Elevator Car (Full):**
```
[MASTER STYLE] elevator car interior cross-section, doors open, 
crowded with 6 small people sprites, floor buttons panel visible, 
128×96 pixels
```

---

## Workflow: ImageFX to Game Asset

### Step 1: Generate Base Images
1. Open [labs.google/fx/tools/image-fx](https://labs.google/fx/tools/image-fx)
2. Use Master Style prefix + specific prompt
3. Generate 4 variants
4. Select best result
5. Note the seed for consistency

### Step 2: Post-Processing (Photoshop/GIMP/Aseprite)
1. Import 2K image
2. Isolate building/character
3. Scale to exact dimensions (e.g., 576×64 for office)
4. Apply color palette reduction (16-32 colors)
5. Clean up edges for pixel-perfect alignment
6. Add transparency

### Step 3: Sprite Sheet Assembly
1. Organize frames in grid layout
2. Name convention: `{type}_{state}_{frame}.png`
3. Generate sprite sheet JSON manifest
4. Test in game renderer

### Step 4: Quality Check
- [ ] Tiles align to 64×64 grid
- [ ] Consistent lighting direction (top-left)
- [ ] Color palette matches other assets
- [ ] Transparent background correct
- [ ] No artifacts at edges

---

## Batch Generation Plan

### Day 1: Core Buildings (Priority)
- [ ] Lobby (3 states)
- [ ] Office (3 states)
- [ ] Elevator shaft segments
- [ ] Elevator car (3 states)

### Day 2: People
- [ ] Office workers M/F (walk L/R)
- [ ] Generic person templates
- [ ] Worker stress color variants (black/pink/red)

### Day 3: Additional Buildings
- [ ] Hotel room (3 states)
- [ ] Fast food (3 states)
- [ ] Restaurant (3 states)

### Day 4: Transport & Services
- [ ] Stairs, escalators
- [ ] Service buildings
- [ ] Parking structure

### Day 5: Polish & Effects
- [ ] UI elements
- [ ] Fire/smoke effects
- [ ] Special events (VIP, Santa, bomb)

---

## Integration with Build Plan

### Phase 1 (MVP - Today)
**Use placeholder rectangles** - Colors indicate building type
- Office: Gray (#808080)
- Lobby: Tan (#D2B48C)
- Person: Black → Pink → Red (by stress)
- Elevator: Blue (#4169E1)

### Phase 2 (Week 2)
**First real assets** - Core buildings only
- Lobby sprite (replaces tan rectangle)
- Office sprite (replaces gray rectangle)
- Elevator car sprite (replaces blue rectangle)
- Person sprites (replaces colored dots)

### Phase 3 (Week 3-4)
**Full asset library** - All buildings and people
- All 8 commercial buildings
- All 3 residential buildings
- All 6 service buildings
- All 12 people types
- Transport animations

### Phase 4 (Week 5 - Demo)
**Polish pass**
- Animation frames
- Lighting effects
- Particle effects
- UI polish

---

## Technical Specs

### Sprite Format
- **File type:** PNG-32 (transparency)
- **Color depth:** 32-bit RGBA
- **Grid alignment:** 64×64 base tile
- **Naming:** `building_office_occupied.png`

### Sprite Sheets
```json
{
  "office": {
    "file": "buildings/office.png",
    "frameWidth": 576,
    "frameHeight": 64,
    "states": {
      "empty": { "row": 0 },
      "occupied": { "row": 1 },
      "crowded": { "row": 2 }
    }
  }
}
```

### Renderer Support
```typescript
// src/rendering/SpriteManager.ts
interface Sprite {
  texture: HTMLImageElement;
  frames: Map<string, SpriteFrame>;
}

interface SpriteFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

---

## Style Consistency Tips

### Color Palette (Reference)
Keep these colors across all assets:

**Building Interiors:**
- Floor: #C9A87C (warm wood)
- Wall: #E8DCC8 (cream)
- Window: #87CEEB (sky blue)
- Lighting: #FFF8DC (cornsilk)

**People:**
- Skin: #FFD8B0
- Suit (dark): #2F2F2F
- Suit (light): #4A4A4A
- Dress: #8B4513, #800020, #2E8B57

**Elevator:**
- Car: #C0C0C0 (silver)
- Interior: #F5F5DC (beige)
- Doors: #A9A9A9 (dark gray)

### Lighting Direction
- **All sprites:** Light from top-left
- **Shadows:** Cast toward bottom-right
- **Consistent across all assets**

### Pixel Art Rules
1. No anti-aliasing on edges
2. Limited color palette (16-32 per sprite)
3. 1-pixel outlines where needed
4. Readable at 1:1 and 2:1 scale

---

## Tools Required

### Generation
- **ImageFX:** labs.google/fx/tools/image-fx (free, Imagen 4)
- **Alternative:** Midjourney v6 (backup, paid)

### Post-Processing
- **Aseprite:** Pixel art editing, sprite sheets ($20)
- **GIMP:** Free alternative, batch processing
- **ImageMagick:** CLI batch processing

### Asset Management
- **TexturePacker:** Sprite sheet generation
- **Tiled:** Level editor with sprite support

---

## Next Steps

1. **Today:** Continue with rectangles (MVP)
2. **Tomorrow:** Generate first real assets (Lobby, Office, Person)
3. **This week:** Core building set complete
4. **Next week:** Full asset library

**Assigned to:** Art Agent (to be spawned)

---

*This plan integrates with AUTONOMOUS-BUILD-PLAN.md*
*Assets replace placeholder rectangles progressively*
