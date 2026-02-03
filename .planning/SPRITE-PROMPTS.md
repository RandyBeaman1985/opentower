# SPRITE GENERATION PROMPTS
**Version:** 1.0  
**Last Updated:** 2026-02-03  
**Purpose:** Master prompt library for generating OpenTower sprites with AI art tools

---

## MASTER STYLE PROMPT (Prepend to ALL)

```
Pixel art, SimTower 1994 aesthetic, side view cross-section cutaway, 
retro game style, 256 color palette, clean lines, isometric-ish depth, 
1990s Maxis game visual style, HD 4x scale (original was 160×120 base resolution),
no anti-aliasing, crisp pixel edges, transparent background where needed
```

---

## BUILDING INTERIORS

### Office Sprites

**Office - Empty**
```
[ImageFX]
Pixel art cross-section view of office interior, SimTower style,
144×36px, side view cutaway, empty office space with desks and computers,
filing cabinets, office chairs, fluorescent lighting visible on ceiling,
corporate blue/gray color scheme, retro 1990s aesthetic, clean lines,
isometric-ish perspective showing depth, 256 color palette,
NO PEOPLE, vacant workspace, professional business environment
```

**Office - Half Full (3 workers)**
```
[ImageFX]
Pixel art cross-section view of office interior, SimTower style,
144×36px, side view cutaway, office with desks and computers,
3 workers sitting at desks typing, some empty desks visible,
filing cabinets, office chairs, fluorescent lighting,
corporate blue/gray color scheme, retro 1990s aesthetic,
workers as simple 8px tall silhouettes, busy but not crowded
```

**Office - Full (6 workers)**
```
[ImageFX]
Pixel art cross-section view of office interior, SimTower style,
144×36px, side view cutaway, busy office with all desks occupied,
6 workers sitting at computers, full workspace utilization,
filing cabinets, office chairs, fluorescent lighting,
corporate blue/gray color scheme, retro 1990s aesthetic,
workers as simple 8px tall silhouettes, productive bustling office
```

**Office - Night (lights on)**
```
[Same as above variants + ", glowing windows with warm yellow light, 
dark exterior visible, nighttime atmosphere, interior lighting prominent"]
```

---

### Lobby Sprites

**Lobby - 1 Star (Simple)**
```
[ImageFX]
Pixel art cross-section view of basic lobby interior, SimTower style,
64×36px, side view cutaway, simple reception desk with single attendant,
minimal decoration, basic seating area, fluorescent overhead lighting,
beige/tan color scheme, retro 1990s aesthetic, clean professional look,
entry/exit doors visible on left/right, functional but not fancy
```

**Lobby - 2 Star (Improved)**
```
[ImageFX]
Pixel art cross-section view of improved lobby interior, SimTower style,
64×36px, side view cutaway, nicer reception desk with decorative front,
potted plants, better seating area with cushioned chairs,
improved lighting fixtures, blue/gray professional color scheme,
retro 1990s aesthetic, more polished and welcoming than 1-star
```

**Lobby - 3 Star (Upscale)**
```
[ImageFX]
Pixel art cross-section view of upscale lobby interior, SimTower style,
64×36px, side view cutaway, elegant reception desk with marble accents,
multiple potted plants, plush seating area, chandelier lighting,
upscale color scheme with gold/cream accents, retro 1990s aesthetic,
premium feel, well-decorated professional space
```

---

### Fast Food Restaurant

**Fast Food - Empty**
```
[ImageFX]
Pixel art cross-section view of fast food restaurant interior, SimTower style,
256×36px, side view cutaway, service counter with menu boards above,
empty tables and chairs for customers, kitchen equipment visible behind counter,
red/yellow color scheme (McDonald's inspired), retro 1990s aesthetic,
clean but casual dining space, NO CUSTOMERS, ready for business
```

**Fast Food - Busy**
```
[ImageFX]
Pixel art cross-section view of busy fast food restaurant interior, SimTower style,
256×36px, side view cutaway, service counter with customers ordering,
multiple people sitting at tables eating, some standing in line,
kitchen staff visible behind counter working, red/yellow color scheme,
retro 1990s aesthetic, lunch rush atmosphere, crowded but organized,
customers as simple 8px tall silhouettes
```

---

### Restaurant (Upscale)

**Restaurant - Empty**
```
[ImageFX]
Pixel art cross-section view of upscale restaurant interior, SimTower style,
384×36px, side view cutaway, elegant dining tables with white tablecloths,
formal place settings, ambient lighting with wall sconces,
kitchen area visible in background, burgundy/gold color scheme,
retro 1990s aesthetic, fine dining atmosphere, NO CUSTOMERS,
waiting for dinner service
```

**Restaurant - Busy**
```
[ImageFX]
Pixel art cross-section view of busy upscale restaurant interior, SimTower style,
384×36px, side view cutaway, elegant dining tables with diners seated,
waitstaff visible serving customers, kitchen staff working in background,
ambient lighting creating warm atmosphere, burgundy/gold color scheme,
retro 1990s aesthetic, sophisticated dinner service in progress,
diners and staff as simple 8px tall silhouettes
```

---

### Hotel Rooms

**Hotel Single - Vacant**
```
[ImageFX]
Pixel art cross-section view of hotel single room interior, SimTower style,
64×36px, side view cutaway, single bed with nightstand, small desk,
TV on wall, bathroom visible in corner, neutral beige/tan color scheme,
retro 1990s aesthetic, clean and ready for guest, bed made perfectly,
NO PEOPLE, vacant professional hotel room
```

**Hotel Single - Occupied (Guest Standing)**
```
[ImageFX]
Pixel art cross-section view of occupied hotel single room, SimTower style,
64×36px, side view cutaway, single bed with luggage on it,
guest standing near desk, small desk, TV on wall, bathroom visible,
neutral beige/tan color scheme, retro 1990s aesthetic,
guest as simple 8px tall silhouette, room in use
```

**Hotel Single - Sleeping**
```
[ImageFX]
Pixel art cross-section view of hotel single room at night, SimTower style,
64×36px, side view cutaway, guest sleeping in bed under covers,
nightstand lamp turned off, TV off, bathroom door closed,
darkened room atmosphere, minimal lighting through window,
retro 1990s aesthetic, peaceful nighttime scene,
guest visible as sleeping silhouette in bed
```

---

## PEOPLE SPRITES

### Person - Generic Worker

**Base Prompt (DALL-E 3):**
```
Single pixel art sprite, 8×16 pixels, person in business casual clothing,
side view profile facing LEFT, simple clean design, 1990s SimTower aesthetic,
BLACK body silhouette, standing pose with slight lean forward,
white background, retro game sprite style, high contrast,
no facial details, just clean silhouette shape
```

**Variants:**
1. **Idle Pose:** "standing straight, arms at sides"
2. **Walk Frame 1:** "left leg forward, right arm forward, walking motion"
3. **Walk Frame 2:** "right leg forward, left arm forward, walking motion"

**Stress Colors (Recolor in Aseprite):**
- Normal: Black (#000000)
- Mild Stress: Light Pink (#FFB3D9)
- Moderate Stress: Dark Pink (#FF66B3)
- High Stress: Red (#FF0000)
- Critical Stress: Dark Red (#8B0000)

**Directions:**
- Left-facing: Use base prompt
- Right-facing: Flip horizontal in Aseprite

**Total People Sprites:** 5 colors × 2 directions × 3 poses = 30 sprites

---

## ELEVATOR SPRITES

### Elevator Shaft

**Standard Shaft**
```
[ImageFX]
Pixel art of elevator shaft vertical segment, SimTower style,
32×36px, side view cross-section, metal framework visible,
gray/steel color scheme, retro 1990s aesthetic, industrial look,
vertical rails for elevator car, structural beams visible,
this will tile vertically to create full shaft height
```

### Elevator Car

**Car - Empty**
```
[ImageFX]
Pixel art of elevator car interior, SimTower style,
28×30px, side view through glass/window, empty elevator cab,
metal frame visible, control panel on side, gray/chrome color scheme,
retro 1990s aesthetic, waiting for passengers
```

**Car - Half Full**
```
[ImageFX]
Pixel art of elevator car interior, SimTower style,
28×30px, side view through glass/window, 2-3 passengers visible inside,
metal frame, passengers as simple 8px silhouettes standing,
gray/chrome color scheme, retro 1990s aesthetic, partially loaded
```

**Car - Full**
```
[ImageFX]
Pixel art of elevator car interior, SimTower style,
28×30px, side view through glass/window, 5-6 passengers packed inside,
crowded but orderly, passengers as simple 8px silhouettes,
gray/chrome color scheme, retro 1990s aesthetic, capacity near max
```

### Elevator Doors

**Doors - Closed**
```
[Manual in Aseprite]
32×8px, two sliding doors meeting in center,
gray metal finish, simple recessed panel design,
horizontal seam visible in center where doors meet
```

**Doors - Opening Sequence (4 frames):**
- Frame 1: Doors closed (0% open)
- Frame 2: Doors 25% open (slight gap in center)
- Frame 3: Doors 75% open (wide gap)
- Frame 4: Doors 100% open (fully retracted to sides)

---

## SKY BACKGROUNDS

### Day Sky Cycle

**Morning (6 AM - 9 AM)**
```
[ImageFX]
Pixel art sky gradient background for tower game, 6000×1200px,
horizontal gradient, soft light blue at top transitioning to pale peach/pink at bottom,
early morning color palette, SimTower 1994 aesthetic, clean gradient,
sunrise glow, gentle atmospheric colors, retro game background style
```

**Noon (9 AM - 3 PM)**
```
[ImageFX]
Pixel art sky gradient background for tower game, 6000×1200px,
horizontal gradient, bright vibrant blue at top transitioning to lighter blue at bottom,
midday color palette, SimTower 1994 aesthetic, clear sunny day,
high contrast blue sky, retro game background style
```

**Evening (3 PM - 6 PM)**
```
[ImageFX]
Pixel art sky gradient background for tower game, 6000×1200px,
horizontal gradient, orange/amber at top transitioning to pink/purple at bottom,
sunset color palette, SimTower 1994 aesthetic, warm evening glow,
golden hour lighting, retro game background style
```

**Dusk (6 PM - 8 PM)**
```
[ImageFX]
Pixel art sky gradient background for tower game, 6000×1200px,
horizontal gradient, deep purple at top transitioning to dark orange at bottom,
twilight color palette, SimTower 1994 aesthetic, last light of day,
dramatic dusk colors, retro game background style
```

**Night (8 PM - 6 AM)**
```
[ImageFX]
Pixel art sky gradient background for tower game, 6000×1200px,
horizontal gradient, deep navy blue at top transitioning to dark purple at bottom,
with tiny white pixel stars scattered throughout top half,
nighttime color palette, SimTower 1994 aesthetic, starry night,
peaceful dark sky, retro game background style
```

---

## GENERATION WORKFLOW

### Step-by-Step Process

1. **Select Prompt:** Choose appropriate prompt from library above
2. **Generate with AI:**
   - Buildings → Use ImageFX (better at architecture/interiors)
   - People → Use DALL-E 3 (better at human figures)
   - Sky → Use ImageFX (great at gradients)
3. **Save Seed:** Record seed number for consistency across variants
4. **Download Image:** Save to working directory
5. **Import to Aseprite:**
   - Open in Aseprite
   - Scale to exact pixel dimensions (crop or resize as needed)
   - Extract color palette (Image → Mode → Indexed)
   - Lock palette for consistency
6. **Clean Up:**
   - Remove AI artifacts (noise, anti-aliasing)
   - Ensure crisp pixel edges (no blur)
   - Check transparency (if needed)
   - Align to pixel grid
7. **Export:**
   - Format: PNG
   - Transparency: Yes (for buildings/people)
   - Naming: `{type}-{state}.png` (e.g., `office-empty.png`)
   - Save to `public/assets/buildings/` or `public/assets/people/`
8. **Test in Game:**
   - Run dev server
   - Check sprite loads correctly
   - Verify positioning and scale
   - Iterate if needed

---

## ASSET NAMING CONVENTIONS

### Buildings
- `{buildingType}-{state}.png`
- Examples:
  - `office-empty.png`
  - `office-half.png`
  - `office-full.png`
  - `office-night-empty.png`
  - `office-night-full.png`
  - `lobby-1star.png`
  - `fastfood-empty.png`
  - `hotel-single-vacant.png`

### People
- `person-{color}-{direction}-{animation}.png`
- Examples:
  - `person-black-left-idle.png`
  - `person-black-left-walk-1.png`
  - `person-black-left-walk-2.png`
  - `person-black-right-idle.png`
  - `person-lightpink-left-walk-1.png`

### Elevators
- `elevator-{component}-{state}.png`
- Examples:
  - `elevator-shaft-standard.png`
  - `elevator-car-empty.png`
  - `elevator-car-half.png`
  - `elevator-car-full.png`
  - `elevator-door-closed.png`
  - `elevator-door-open-1.png` (25% open)
  - `elevator-door-open-2.png` (75% open)
  - `elevator-door-open-3.png` (100% open)

### Sky
- `sky-{timeOfDay}.png`
- Examples:
  - `sky-morning.png`
  - `sky-noon.png`
  - `sky-evening.png`
  - `sky-dusk.png`
  - `sky-night.png`

---

## QUALITY CHECKLIST

Before finalizing any sprite:

- [ ] Matches pixel dimensions exactly (no scaling blur)
- [ ] Color palette extracted and consistent
- [ ] No anti-aliasing (crisp pixel edges)
- [ ] Transparent background where needed
- [ ] Aligned to pixel grid (no sub-pixel positioning)
- [ ] SimTower aesthetic maintained (1990s retro style)
- [ ] Cross-section view (for buildings)
- [ ] Seed number recorded (for consistency)
- [ ] File named according to convention
- [ ] Tested in game (loads and renders correctly)

---

## SEED TRACKING

**Purpose:** Use same seed for all related sprites to maintain visual consistency

**Template:**
```
[Building Type]: office
ImageFX Seed: [RECORD HERE]
Variants Generated:
- office-empty.png (Seed: [SAME])
- office-half.png (Seed: [SAME])
- office-full.png (Seed: [SAME])
```

**Seed Log:**
- Office: [Pending]
- Lobby: [Pending]
- Fast Food: [Pending]
- Restaurant: [Pending]
- Hotel: [Pending]
- People: [Pending]

---

## NEXT STEPS

1. Test prompts with 5-10 samples
2. Iterate until style is consistent
3. Record successful seeds
4. Generate full batch of sprites (Phase 1)
5. Import to Aseprite for cleanup
6. Export to game assets directory
7. Test integration in dev build

---

*Prompt library ready. Time to generate assets.* 🎨
