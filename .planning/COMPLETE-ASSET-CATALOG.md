# OpenTower Complete Asset Catalog
## Every Single Asset Needed for Full SimTower Recreation

*Source: OpenSkyscraper SimTowerLoader.cpp reverse engineering*
*Created: 2026-01-30*

---

## Asset Summary

| Category | Unique Images | With States/Variants | Animation Frames |
|----------|---------------|---------------------|------------------|
| Buildings | 21 types | 89 base images | ~350 frames |
| People | 12 types | 60 variants | ~240 frames |
| Elevators | 3 types + shafts | 45 images | ~180 frames |
| Transportation | 4 types | 25 images | ~60 frames |
| Sky/Weather | 11 times of day | 66 images | ~200 frames |
| UI Elements | 8 categories | 85 images | ~150 frames |
| Effects/Events | 15 types | 45 images | ~120 frames |
| Decorations | 8 types | 30 images | ~80 frames |
| Construction | 3 types | 12 images | ~30 frames |
| **TOTAL** | | **457 base images** | **~1,410 frames** |

---

## 🏢 BUILDINGS (21 Types)

### 1. Lobby (3 variants)
| Variant | Size (original) | Size (4K) | States |
|---------|-----------------|-----------|--------|
| Normal Lobby | 312×36 | 1248×144 | 3 occupancy levels |
| Sky Lobby | 312×36 | 1248×144 | 3 occupancy levels |
| High Lobby | 312×108 | 1248×432 | 3 occupancy levels × 3 floors |

**Total: 27 frames**

### 2. Office (4 variants)
| Variant | Size (original) | Size (4K) | States |
|---------|-----------------|-----------|--------|
| Basic Office | 144×24 | 576×96 | 7 occupancy states |
| Each of 4 style variants | 144×24 | 576×96 | 7 states each |

**States:** Empty, 1-2 workers, 3-4 workers, 5-6 workers, full, overtime, lights off
**Total: 28 frames**

### 3. Condominium (3 types)
| Type | Size (original) | Size (4K) | States |
|------|-----------------|-----------|--------|
| Small Condo | 128×24 | 512×96 | 5 states |
| Medium Condo | 128×24 | 512×96 | 5 states |
| Large Condo | 128×24 | 512×96 | 5 states |

**States:** For Sale, Occupied Day, Occupied Night, Asleep, Vacant
**Total: 15 frames**

### 4. Hotel Single Room (2 variants)
| Variant | Size (original) | Size (4K) | States |
|---------|-----------------|-----------|--------|
| Single Room A | 32×24 | 128×96 | 9 states |
| Single Room B | 32×24 | 128×96 | 9 states |

**States:** Vacant, Occupied, Sleeping, Checkout, Dirty, Cleaning, Clean, Reserved, Do Not Disturb
**Total: 18 frames**

### 5. Hotel Double Room (4 variants)
| Variant | Size (original) | Size (4K) | States |
|---------|-----------------|-----------|--------|
| Double Room A-D | 48×24 each | 192×96 | 9 states each |

**Total: 36 frames**

### 6. Hotel Suite (2 variants)
| Variant | Size (original) | Size (4K) | States |
|---------|-----------------|-----------|--------|
| Suite A | 64×24 | 256×96 | 9 states |
| Suite B | 64×24 | 256×96 | 9 states |

**Total: 18 frames**

### 7. Fast Food Restaurant (5 variants)
| Variant | Size (original) | Size (4K) | States |
|---------|-----------------|-----------|--------|
| Burger Joint | 128×24 | 512×96 | 4 states |
| Pizza Place | 128×24 | 512×96 | 4 states |
| Noodle Shop | 128×24 | 512×96 | 4 states |
| Coffee Shop | 128×24 | 512×96 | 4 states |
| Ice Cream | 128×24 | 512×96 | 4 states |

**States:** Closed, Open Empty, Open Busy, Rush Hour
**Total: 20 frames**

### 8. Restaurant (4 variants)
| Variant | Size (original) | Size (4K) | States |
|---------|-----------------|-----------|--------|
| French Restaurant | 192×24 | 768×96 | 4 states |
| Chinese Restaurant | 192×24 | 768×96 | 4 states |
| Italian Restaurant | 192×24 | 768×96 | 4 states |
| Japanese Restaurant | 192×24 | 768×96 | 4 states |

**Total: 16 frames**

### 9. Shop (11 variants)
| Variant | Size (original) | Size (4K) |
|---------|-----------------|-----------|
| Bookstore | 64×24 | 256×96 |
| Clothing Store | 64×24 | 256×96 |
| Electronics | 64×24 | 256×96 |
| Pharmacy | 64×24 | 256×96 |
| Flower Shop | 64×24 | 256×96 |
| Jewelry Store | 64×24 | 256×96 |
| Toy Store | 64×24 | 256×96 |
| Sports Store | 64×24 | 256×96 |
| Music Store | 64×24 | 256×96 |
| Gift Shop | 64×24 | 256×96 |
| General Store | 64×24 | 256×96 |

**States:** Closed, Open (2 frames each = 22 total)
**Plus: 2 additional shop layouts**
**Total: 24 frames**

### 10. Cinema (1 type, multi-floor)
| Component | Size (original) | Size (4K) | Frames |
|-----------|-----------------|-----------|--------|
| Screen Room (upper) | 192×24 | 768×96 | 3 animated |
| Lobby (lower) | 192×24 | 768×96 | 1 |
| Movie Screens | varies | varies | 2 variants |

**Total: 6 frames**

### 11. Party Hall
| Component | Size (original) | Size (4K) | States |
|-----------|-----------------|-----------|--------|
| Party Hall | 192×24 | 768×96 | 2 (empty, event) |

**Total: 2 frames**

### 12. Medical Center
| Component | Size (original) | Size (4K) | Frames |
|-----------|-----------------|-----------|--------|
| Medical Center | 80×24 (3 parts) | 320×96 | 3 |

**Total: 3 frames**

### 13. Security Office
| Component | Size (original) | Size (4K) | Frames |
|-----------|-----------------|-----------|--------|
| Security Office | 48×24 | 192×96 | 3 animated |

**Total: 3 frames**

### 14. Housekeeping
| Component | Size (original) | Size (4K) | Frames |
|-----------|-----------------|-----------|--------|
| Housekeeping Station | 48×24 | 192×96 | 1 |

**Total: 1 frame**

### 15. Recycling Center
| Component | Size (original) | Size (4K) | Frames |
|-----------|-----------------|-----------|--------|
| Empty | varies | varies | 1 |
| Loading (5 stages × 2 rows) | varies | varies | 10 |
| Emptying | varies | varies | 1 |
| Truck | varies | varies | 1 |

**Total: 13 frames**

### 16. Parking Garage
| Component | Size (original) | Size (4K) | Frames |
|-----------|-----------------|-----------|--------|
| Ramp (3 parts) | varies | varies | 3 |
| Parking Space (2 parts) | varies | varies | 2 |

**States:** Empty, Occupied (varies by car count)
**Total: 5+ frames**

### 17. Metro Station
| Component | Size (original) | Size (4K) | Frames |
|-----------|-----------------|-----------|--------|
| Station (3 variants × 2 orientations) | varies | varies | 6 |
| Tracks | varies | varies | 1 |

**Total: 7 frames**

### 18. Cathedral
| Component | Size (original) | Size (4K) | Frames |
|-----------|-----------------|-----------|--------|
| Cathedral (2 floors) | 704×252 | 2816×1008 | 1 |

**Total: 1 frame**

---

## 👥 PEOPLE (60+ variants)

### Base People Sprites
| Type | Size (original) | Size (4K) | Directions |
|------|-----------------|-----------|------------|
| Generic Person | 8×16 | 32×64 | L, R |

### Stress Color Variants (5 colors)
1. **Black** - Normal stress (0-30%)
2. **Pink (Light)** - Moderate stress (30-50%)
3. **Pink (Dark)** - High stress (50-70%)
4. **Red** - Critical stress (70-90%)
5. **Dark Red** - Maximum stress (90-100%)

### People Types (12 types × 5 stress colors × 2 directions)
1. Office Worker (Male)
2. Office Worker (Female)
3. Hotel Guest
4. Tourist with Luggage
5. Shopper
6. Restaurant Patron
7. Cinema Visitor
8. Condo Resident
9. Child
10. VIP
11. Security Guard
12. Maintenance Worker

### Special People
| Type | Size | Frames |
|------|------|--------|
| Maid with Cart | 48×24 | 2 (L, R) |
| Construction Worker | 16×24 | 2 (L, R) |
| Firefighter | 16×24 | 2 (L, R) |
| Santa Claus + Sleigh | 128×64 | 1 |

### Elevator Queue Sprites
| Configuration | Size | Frames |
|---------------|------|--------|
| 1-8 people waiting | 32×24 each | 8 × 3 rows = 24 |

**Total People: ~240 frames**

---

## 🚀 ELEVATORS (3 types)

### Elevator Cars
| Type | Car Size | Shaft Width | States |
|------|----------|-------------|--------|
| Standard | 28×30 | 32px | 5 (empty, 1/4, 1/2, 3/4, full) |
| Express | 44×30 | 48px | 5 |
| Service | 28×30 | 32px | 5 |

### Elevator Components
| Component | Size | Variants |
|-----------|------|----------|
| Shaft (narrow) | 32×36 | 7 frames (empty + engine states) |
| Shaft (wide) | 48×36 | 7 frames |
| Floor Digits | 11×17 | 11 digits × 2 styles = 22 |
| Doors Open/Closed | varies | 2 per type |

**Total Elevator: ~60 frames**

---

## 🚶 TRANSPORTATION

### Stairs
| Component | Size (original) | Size (4K) | Frames |
|-----------|-----------------|-----------|--------|
| Stairs (2 floors) | 32×48 | 128×192 | 2 variants × 2 |

### Escalator
| Component | Size (original) | Size (4K) | Frames |
|-----------|-----------------|-----------|--------|
| Escalator (2 floors) | 48×48 | 192×192 | 2 (up/down variants) |

**Total Transportation: ~8 frames**

---

## 🌤️ SKY & WEATHER (66 images)

### Time of Day (11 variants)
1. Dawn
2. Early Morning
3. Morning
4. Late Morning
5. Noon
6. Afternoon
7. Late Afternoon
8. Evening
9. Dusk
10. Night
11. Late Night

### Weather States (6 per time)
1. Clear
2. Twilight palette
3. Night palette
4. Overcast palette
5. Rain frame A
6. Rain frame B

**Sky: 11 × 6 = 66 frames**

### Clouds (4 types × 4 weather)
| Type | Size | Frames |
|------|------|--------|
| Small Cloud | varies | 4 weather variants |
| Medium Cloud | varies | 4 weather variants |
| Large Cloud | varies | 4 weather variants |
| Storm Cloud | varies | 4 weather variants |

**Clouds: 16 frames**

---

## 🖥️ UI ELEMENTS (85+ images)

### Toolbox
| Component | Size | Frames |
|-----------|------|--------|
| Tool Icons | 32×32 | 26 tools × 3 states = 78 |
| Speed Buttons | 32×32 | 4 speeds × 2 states = 8 |
| Category Tabs | varies | ~10 |

### Map Window
| Component | Size | Frames |
|-----------|------|--------|
| Map Sky (4 weather) | 200×264 | 4 |
| Map Ground | 200×24 | 1 |
| Map Buttons | varies | 3 |
| Map Overlays | varies | 3 |

### Time Window
| Component | Size | Frames |
|-----------|------|--------|
| Background | varies | 1 |
| Star Ratings | 108×22 | 5 (1-5 stars) |
| TOWER Badge | 108×22 | 1 |
| Star Icons | 21×21 | 2 (filled, empty) |

### Info Panels
| Component | Frames |
|-----------|--------|
| Building Info | ~10 layouts |
| Person Info | ~5 layouts |
| Elevator Info | ~5 layouts |
| Financial Reports | ~10 layouts |

### Cursors
| Cursor | Frames |
|--------|--------|
| Default | 1 |
| Build | 1 |
| Demolish | 1 |
| Inspect | 1 |
| Drag | 1 |
| Invalid | 1 |

---

## 🔥 EFFECTS & EVENTS (45 images)

### Fire
| Component | Size | Frames |
|-----------|------|--------|
| Large Fire | varies | 4 animated |
| Small Fire | varies | 4 animated |
| Fire Destroyed | varies | 1 |
| Fire Chopper | varies | 1 |
| Fire Ladder | varies | 1 |

### Alerts
| Alert Type | Size | Frames |
|------------|------|--------|
| Terrorist Alert | varies | 1 |
| Chopper Alert | varies | 1 |
| VIP Alert | varies | 1 |
| Treasure Alert | varies | 1 |
| Fire Alert | varies | 1 |
| Star Up Alert | varies | 1 |

### Special Events
| Event | Frames |
|-------|--------|
| Bomb (hidden) | 1 |
| Explosion | 4-6 animated |
| Gold Treasure | 1 |
| VIP Arrival | 2-3 |
| Santa Flyover | 1 |

---

## 🏗️ CONSTRUCTION (12 images)

| Component | Size | Frames |
|-----------|------|--------|
| Construction Grid | 64×36 | 1 |
| Construction Solid | 64×36 | 1 |
| Construction Worker | 16×24 | 2-4 animated |
| Crane | varies | 1 |
| Scaffolding | varies | 2-3 |

---

## 🎨 DECORATIONS (30 images)

| Decoration | Size | Variants |
|------------|------|----------|
| Santa + Reindeer | 128×64 | 1 |
| City Skyline | varies | 1 |
| Building Entrances | varies | multiple |
| Roof Decorations | varies | several |
| Ground Level Details | varies | several |

---

## 🔊 SOUNDS (48 total)

### Construction (4)
- construction/normal
- construction/flexible
- construction/impossible
- bulldozer

### Buildings (10)
- restaurant
- office
- metro
- partyhall
- fastfood/0, /1, /2

### Vehicles (2)
- car/departing
- car/arriving

### Ambient (7)
- doorbell
- hover
- toilet
- elevator/arriving
- elevator/departing

### Nature (8)
- birds/morning
- birds/evening
- birds/day
- cock (rooster)
- rain
- bells
- thunder
- crickets

### Events (6)
- rating/increased
- rating/tower
- applause
- santa
- cash
- wind

### Cinema Movies (15)
- cinema/movie0 through cinema/movie14

### System (1)
- splashscreen

---

## 📊 COMPLETE TOTALS

### Images
| Category | Count |
|----------|-------|
| Building Base Images | 89 |
| Building State Variants | ~260 |
| People Types + Colors | ~240 |
| Elevator Components | ~60 |
| Transportation | ~8 |
| Sky/Weather | ~82 |
| UI Elements | ~85 |
| Effects/Events | ~45 |
| Decorations | ~30 |
| Construction | ~12 |
| **TOTAL UNIQUE FRAMES** | **~911** |

### At 4K Resolution
| Metric | Value |
|--------|-------|
| Average image size | ~500KB |
| Total estimated storage | ~450MB |
| Sprite sheets needed | ~50-75 |

### Sounds
| Category | Count |
|----------|-------|
| Sound Effects | 48 |
| Music Tracks | TBD (original had none) |

---

## Generation Priority

### Phase 1: MVP Core (Week 1-2)
1. ☐ Office (4 variants × 7 states = 28)
2. ☐ Lobby (3 variants × 3 states = 9)
3. ☐ People base (5 colors × 2 directions = 10)
4. ☐ Elevator standard (car + shaft = 12)
5. ☐ Sky (11 times, clear only = 11)
**Subtotal: 70 images**

### Phase 2: Hotels & Food (Week 3)
1. ☐ Hotel Single (2 × 9 = 18)
2. ☐ Hotel Double (4 × 9 = 36)
3. ☐ Fast Food (5 × 4 = 20)
4. ☐ Restaurant (4 × 4 = 16)
5. ☐ Housekeeping (1)
**Subtotal: 91 images**

### Phase 3: Commercial (Week 4)
1. ☐ Shops (11 types × 2 = 22)
2. ☐ Cinema (6)
3. ☐ Party Hall (2)
4. ☐ Medical (3)
5. ☐ Security (3)
**Subtotal: 36 images**

### Phase 4: Infrastructure (Week 5)
1. ☐ Condo (3 × 5 = 15)
2. ☐ Elevator Express + Service (24)
3. ☐ Stairs (4)
4. ☐ Escalator (2)
5. ☐ Parking (5)
6. ☐ Metro (7)
**Subtotal: 57 images**

### Phase 5: Weather & Effects (Week 6)
1. ☐ Sky weather variants (55 more)
2. ☐ Clouds (16)
3. ☐ Fire effects (11)
4. ☐ Alerts (6)
**Subtotal: 88 images**

### Phase 6: Polish (Week 7-8)
1. ☐ All UI elements (~85)
2. ☐ Construction sprites (~12)
3. ☐ Decorations (~30)
4. ☐ Elevator queue sprites (24)
5. ☐ Suite hotels (18)
6. ☐ Cathedral (1)
7. ☐ Recycling (13)
**Subtotal: 183 images**

### Phase 7: Animation & Polish (Week 9-10)
- Add animation frames to all animated sprites
- Create sprite sheets
- Audio implementation

---

## Asset Generation Strategy (Using Existing Subscriptions)

### 💰 Cost: $0-20 Total

**Tools Available (already paid for):**
- **ImageFX (Imagen 4)** - via Gemini Ultra - Best for buildings, scenes
- **DALL-E 3 / GPT-4o** - via OpenAI Pro - Best for characters, people
- **Claude Max** - Prompt iteration, workflow

**Post-Processing:**
- **GIMP** (free) or **Aseprite** ($20 one-time)

### Tool Assignment by Asset Type

| Asset Category | Primary Tool | Why |
|----------------|--------------|-----|
| Buildings (interiors) | **ImageFX** | Better at architecture/cross-sections |
| Sky/Weather | **ImageFX** | Excellent at gradients/atmospherics |
| People/Characters | **DALL-E 3** | Better at human figures |
| UI Elements | **DALL-E 3** or manual | Clean lines |
| Effects (fire, etc.) | **ImageFX** | Good at particles/chaos |

### Batch Processing
Generate in batches of related assets for style consistency:
1. All offices together (same lighting, same desk style)
2. All hotels together (same bed style, same fixtures)
3. All people together (same body proportions)

### Seed Management (ImageFX)
```json
{
  "masterSeed": 12345,
  "categories": {
    "buildings": 12345,
    "people": 12346,
    "elevators": 12347,
    "sky": 12348,
    "ui": 12349
  }
}
```

### Color Palette Lock
After first batch, extract and lock palette:
- Export palette from first successful generation
- Apply as filter to all subsequent images
- Ensures visual coherence

---

*This catalog represents a complete reconstruction of SimTower's visual assets.*
*Total effort estimate: 8-10 weeks with AI generation + post-processing*
