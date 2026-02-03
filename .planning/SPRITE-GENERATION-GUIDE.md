# Sprite Generation Guide

## Status: INFRASTRUCTURE READY, ASSETS NEEDED

**Date:** 2026-02-02, 3:03 PM MST  
**Infrastructure:** ✅ v0.11.0 Complete  
**Assets:** ❌ Not Generated Yet

---

## What's Done

✅ **BuildingSprites.ts** - Complete sprite management system  
✅ **PeopleSprites.ts** - Character sprite system  
✅ **Sprite integration** - Renderers attempt to load sprites with fallback  
✅ **Asset directory structure** - `/public/assets/buildings/` and `/public/assets/people/`

**Current Behavior:**
- Game runs with colored rectangles (fallback rendering)
- Console attempts to load sprites, fails silently
- No visual bugs or errors

---

## What's Needed

### 1. Generate Building Sprites (Priority: HIGH)

**Total Required:** ~150 sprites (21 building types × avg 7 states)

**Start with Office Test Batch:**
- `office-empty.png` (96×48px) - Blue office, no workers
- `office-half.png` (96×48px) - Blue office, some workers
- `office-full.png` (96×48px) - Blue office, packed with workers

**Full Building List:** See `src/rendering/sprites/BuildingSprites.ts` lines 20-200

### 2. Generate Person Sprites (Priority: MEDIUM)

**Total Required:** 30 sprites (5 stress colors × 2 directions × 3 animation frames)

**Specifications:**
- Size: 8×16px (exact)
- Format: PNG with transparency
- Style: Pixel art stick figures
- Colors: Black, Light Pink, Dark Pink, Red, Dark Red
- Animation: 3 frames (standing, left step, right step)

---

## Generation Methods

### Method 1: ImageFX (Recommended - Best Quality)

**URL:** https://labs.google/fx/tools/image-fx  
**Model:** Imagen 4 (Google DeepMind)  
**Advantages:** Best text rendering, consistent style, 2K resolution

**Prompts:**

#### Office Building (Empty State)
```
Pixel art game sprite, SimTower 1994 style, office building interior cross-section view, 
96 pixels wide × 48 pixels tall, blue color scheme (#4A90E2), empty desks, 
no people, windows on both sides, clean professional look, 
16-bit pixel aesthetic, isometric side view, transparent background
```

#### Office Building (Half Full)
```
Pixel art game sprite, SimTower 1994 style, office building interior cross-section view,
96 pixels wide × 48 pixels tall, darker blue (#357ABD), 3-4 workers at desks,
office chairs, computers, windows on both sides, busy atmosphere,
16-bit pixel aesthetic, isometric side view, transparent background
```

#### Office Building (Full)
```
Pixel art game sprite, SimTower 1994 style, office building interior cross-section view,
96 pixels wide × 48 pixels tall, dark blue (#2C5F99), 6-8 workers at desks,
crowded office, all desks occupied, windows on both sides, packed atmosphere,
16-bit pixel aesthetic, isometric side view, transparent background
```

**Post-Processing:**
1. Download 2K image from ImageFX
2. Open in Aseprite (or Photoshop)
3. Scale down to exact dimensions (96×48px)
4. Remove background (make transparent)
5. Ensure pixel-perfect alignment
6. Export as PNG

### Method 2: DALL-E 3 (Alternative)

**Prompt Template:**
```
A pixel art sprite for a retro tower simulation game, 
showing [BUILDING TYPE] interior in [STATE], 
[WIDTH]×[HEIGHT] pixels, [COLOR SCHEME], 
1994 SimTower aesthetic, side cross-section view, 
transparent background, clean pixel art style
```

**Example:**
```
A pixel art sprite for a retro tower simulation game,
showing office interior in empty state,
96×48 pixels, blue and white color scheme,
1994 SimTower aesthetic, side cross-section view,
transparent background, clean pixel art style
```

### Method 3: Manual Pixel Art (Most Time-Consuming)

**Tools:**
- Aseprite (recommended) - $19.99 or free if compiled from source
- Piskel (free web-based) - https://www.piskelapp.com
- GIMP with pixel art grid

**Process:**
1. Create new sprite with exact dimensions
2. Use reference screenshots from SimTower (1994)
3. Draw building interior by hand
4. Use color palette from specs
5. Export as PNG with transparency

---

## Asset Placement

### Directory Structure
```
public/
  assets/
    buildings/
      office-empty.png
      office-half.png
      office-full.png
      fastFood-empty.png
      fastFood-busy.png
      ... (150+ total)
    people/
      person-normal-left-0.png
      person-normal-left-1.png
      person-normal-left-2.png
      person-normal-right-0.png
      ... (30 total)
```

### Naming Convention (EXACT)

**Buildings:** `{type}-{state}.png`
- Examples: `office-empty.png`, `hotelSingle-occupied-day.png`
- See `BuildingSprites.ts` for complete list

**People:** `person-{stressLevel}-{direction}-{frame}.png`
- Stress levels: `normal`, `slight`, `moderate`, `high`, `critical`
- Directions: `left`, `right`
- Frames: `0`, `1`, `2`

---

## Testing the Sprite System

### Step 1: Generate Test Batch
Create these 3 files first:
- `public/assets/buildings/office-empty.png`
- `public/assets/buildings/office-half.png`
- `public/assets/buildings/office-full.png`

### Step 2: Start Dev Server
```bash
npm run dev
```

### Step 3: Check Console
Open browser DevTools → Console  
Look for:
```
✨ Loaded sprite for office (empty)
✨ Loaded sprite for office (half)
✨ Loaded sprite for office (full)
```

### Step 4: Verify Visual Upgrade
- Place office buildings
- Spawn workers
- Watch office sprite change from "empty" → "half" → "full" as workers arrive

### Step 5: Full Sprite Set
Once test batch works, generate all 150+ sprites

---

## Sprite Specifications (Reference)

### Building Sizes
| Building | Width | Height | Notes |
|----------|-------|--------|-------|
| Office | 96px | 48px | Standard 2-wide |
| FastFood | 128px | 48px | 2.67-wide |
| Hotel Single | 64px | 48px | 1.33-wide |
| Hotel Twin | 96px | 48px | 2-wide |
| Hotel Suite | 128px | 48px | 2.67-wide |
| Lobby | 256px | 48px | 5.33-wide |
| Condo | 96px | 48px | 2-wide |
| Restaurant | 128px | 48px | 2.67-wide |
| Shop | 96px | 48px | 2-wide |
| Security | 96px | 48px | 2-wide |
| Medical | 96px | 48px | 2-wide |
| Recycling | 96px | 48px | 2-wide |
| Party Hall | 192px | 48px | 4-wide |
| Cinema | 128px | 48px | 2.67-wide |
| Housekeeping | 64px | 48px | 1.33-wide |
| Parking Ramp | 192px | 96px | 2 floors tall! |
| Parking Space | 96px | 48px | 2-wide |
| Metro | 256px | 48px | 5.33-wide |
| Cathedral | 256px | 96px | 2 floors tall! |
| Stairs | 64px | 48px | 1.33-wide |

**Note:** Floor height = 48px = 24px building + 24px floor depth

### Person Specs
- **Size:** 8×16px (exact, no variations)
- **Format:** PNG with alpha transparency
- **Style:** Simple stick figure, recognizable at tiny size
- **Colors:**
  - Normal (0-20 stress): `#2C3E50` (Black)
  - Slight (21-40): `#FFB6C1` (Light Pink)
  - Moderate (41-60): `#FF69B4` (Dark Pink)
  - High (61-80): `#FF0000` (Red)
  - Critical (81-100): `#8B0000` (Dark Red)

---

## Expected Impact

### Before Sprites (Current)
- Colored rectangles for buildings
- Simple circles for people
- Functional but visually boring
- "5% complete" feeling

### After Sprites (Target)
- Detailed pixel art buildings
- Animated walking characters
- Day/night window lights
- "50% complete" feeling
- Visual upgrade comparable to original SimTower

**Estimated Time:**
- Test batch (3 sprites): 30 minutes
- Full building set (150 sprites): 6-8 hours
- Person sprites (30 sprites): 2 hours
- **Total:** 8-10 hours for complete visual upgrade

---

## Notes

- **Fallback rendering** is production-ready - missing sprites won't break the game
- **No code changes** needed - sprites auto-load when files exist
- **Incremental upgrades** work - add sprites one at a time, game upgrades gradually
- **Easy to replace** - just swap PNG files, no code edits

**Status:** Infrastructure complete, waiting for assets!

---

*Created: 2026-02-02, 3:03 PM MST (Cron Session)*
