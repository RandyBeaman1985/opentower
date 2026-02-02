# Sprite System - Integration Guide

## Overview

The sprite system replaces colored rectangles with pixel art sprites, bringing visual life to OpenTower. This is the foundation for the **5% → 50% Visual Upgrade** from the roadmap.

## Architecture

### BuildingSprites.ts
Manages all building interior sprites (offices, hotels, restaurants, etc.)

**Features:**
- State-based sprites (empty, half-full, full)
- Day/night variants (building lights)
- Occupancy-aware rendering
- Texture caching for performance
- Preloading system

### PeopleSprites.ts
Manages all person/character sprites (workers, guests, residents)

**Features:**
- Stress-color variants (black → dark red)
- Walking animations (2-frame cycle)
- Directional sprites (left/right facing)
- AnimatedSprite integration
- Automatic state updates

## Integration Steps

### Step 1: Preload Sprites at Game Start

In `src/index.ts` or game initialization:

```typescript
import { preloadAllSprites } from '@/rendering/sprites/BuildingSprites';
import { preloadPersonSprites } from '@/rendering/sprites/PeopleSprites';

async function initGame() {
  // Preload all sprites before game starts
  await Promise.all([
    preloadAllSprites(),
    preloadPersonSprites(),
  ]);
  
  // Start game after sprites loaded
  game.start();
}

initGame();
```

### Step 2: Update BuildingRenderer

Replace colored rectangles with sprites in `src/rendering/BuildingRenderer.ts`:

```typescript
import {
  createBuildingSprite,
  getBuildingState,
  getSpriteDimensions,
} from '@/rendering/sprites/BuildingSprites';
import type { Building } from '@/interfaces';

class BuildingRenderer {
  private spriteCache = new Map<string, PIXISprite>();
  
  async renderBuilding(building: Building, timeOfDay: { hour: number; minute: number }) {
    const cacheKey = `${building.id}`;
    
    // Get current building state (empty/half/full)
    const state = getBuildingState(
      building.type,
      building.occupantIds.length,
      building.capacity,
      timeOfDay
    );
    
    // Check if sprite needs update (state changed)
    const existingSprite = this.spriteCache.get(cacheKey);
    if (existingSprite && existingSprite.texture.label === `${building.type}-${state}`) {
      return; // No change needed
    }
    
    // Create new sprite
    const sprite = await createBuildingSprite(building.type, state);
    if (!sprite) {
      // Fallback to colored rectangle if sprite not loaded
      this.renderColoredRectangle(building);
      return;
    }
    
    // Position sprite at building location
    const x = building.position.startTile * 16; // 16px per tile
    const y = building.position.floor * 48; // 48px per floor
    
    sprite.x = x;
    sprite.y = y;
    
    // Add to scene and cache
    this.container.addChild(sprite);
    
    // Remove old sprite if exists
    if (existingSprite) {
      this.container.removeChild(existingSprite);
    }
    
    this.spriteCache.set(cacheKey, sprite);
  }
}
```

### Step 3: Update PeopleRenderer

Replace circles with animated sprites in `src/rendering/PeopleRenderer.ts`:

```typescript
import {
  createPersonSprite,
  updatePersonSprite,
  getPersonDirection,
} from '@/rendering/sprites/PeopleSprites';
import type { Person } from '@/entities/Person';
import { AnimatedSprite } from 'pixi.js';

class PeopleRenderer {
  private spriteCache = new Map<string, AnimatedSprite>();
  private previousTiles = new Map<string, number>();
  
  async renderPerson(person: Person) {
    const cacheKey = person.id;
    
    // Determine facing direction
    const prevTile = this.previousTiles.get(cacheKey);
    const direction = getPersonDirection(person, prevTile);
    
    // Get or create sprite
    let sprite = this.spriteCache.get(cacheKey);
    
    if (!sprite) {
      // Create new sprite
      sprite = await createPersonSprite(person, direction);
      if (!sprite) {
        // Fallback to circle if sprite not loaded
        this.renderCircle(person);
        return;
      }
      
      this.container.addChild(sprite);
      this.spriteCache.set(cacheKey, sprite);
    }
    
    // Update sprite if state changed (stress, walking, etc.)
    await updatePersonSprite(sprite, person, direction);
    
    // Position sprite
    const x = person.currentTile * 16; // 16px per tile
    const y = person.currentFloor * 48 + 48; // Floor bottom
    
    sprite.x = x;
    sprite.y = y;
    
    // Track tile for direction calculation
    this.previousTiles.set(cacheKey, person.currentTile);
  }
  
  removePerson(personId: string) {
    const sprite = this.spriteCache.get(personId);
    if (sprite) {
      this.container.removeChild(sprite);
      sprite.destroy();
      this.spriteCache.delete(personId);
      this.previousTiles.delete(personId);
    }
  }
}
```

### Step 4: Asset Directory Structure

Create the following directory structure in `public/assets/`:

```
public/
  assets/
    buildings/
      office-empty.png
      office-half.png
      office-full.png
      fastfood-empty.png
      fastfood-busy.png
      restaurant-empty.png
      restaurant-busy.png
      hotel-single-vacant.png
      hotel-single-occupied.png
      hotel-single-sleeping.png
      lobby-1star.png
      lobby-2star.png
      ...
    people/
      person-black-left-idle.png
      person-black-left-walk-1.png
      person-black-left-walk-2.png
      person-black-right-idle.png
      person-black-right-walk-1.png
      person-black-right-walk-2.png
      person-light-pink-left-idle.png
      person-light-pink-left-walk-1.png
      ...
```

## Sprite Specifications

### Building Sprites
- **Format:** PNG with transparency
- **Scale:** HD (4x original SimTower)
- **Tile Size:** 16×16px per tile
- **Floor Height:** 48px (includes 24px building + 24px spacing/depth)
- **Perspective:** Side-view cutaway (cross-section)
- **Style:** Pixel art, SimTower 1994 aesthetic
- **Color Palette:** 256 colors, consistent across all sprites

**Example Sizes:**
- Office (9 tiles): 144×36px
- FastFood (16 tiles): 256×36px
- Restaurant (24 tiles): 384×36px
- Hotel Single (4 tiles): 64×36px

### People Sprites
- **Format:** PNG with transparency
- **Size:** 8×16px (exact, 1 tile width × 1 tile height)
- **Animation:** 2 frames for walking (200ms per frame)
- **Colors:** 5 stress variants (black, light-pink, dark-pink, red, dark-red)
- **Directions:** 2 (left-facing, right-facing)
- **Anchor:** Bottom-center (for floor alignment)

**Total People Sprites:**
- 5 colors × 2 directions × (1 idle + 2 walk frames) = 30 sprites

## Performance Considerations

### Texture Caching
- All sprites are cached in memory after first load
- Cache key format: `{buildingType}-{state}` or `{color}-{direction}-{animation}`
- Prevents redundant texture loading
- Use `clearSpriteCache()` during development for hot-reloading

### Preloading Strategy
- Preload all sprites during game initialization (5-10 second load time)
- Prevents pop-in during gameplay
- Total sprite count: ~200 sprites (150 buildings + 50 people)
- Estimated memory: ~10-15 MB

### Fallback Rendering
- Always implement fallback to colored rectangles/circles
- Gracefully handle missing sprite files
- Log warnings for missing assets (not errors)

## Asset Generation Pipeline

### Tools Needed
1. **ImageFX** (Google Imagen 4) - Building interiors
2. **DALL-E 3** (OpenAI) - People sprites
3. **Aseprite** - Post-processing, animation, pixel alignment

### Workflow
1. Generate base images with AI (ImageFX/DALL-E)
2. Import to Aseprite
3. Scale to exact pixel dimensions
4. Extract color palette, ensure consistency
5. Clean up artifacts (AI noise, anti-aliasing)
6. Export as PNG sprite sheets
7. Load into game

### Prompt Templates

**Building Interior (ImageFX):**
```
Pixel art cross-section view of [BUILDING TYPE] interior, SimTower style,
[WIDTH]×36px, side view cutaway, [INTERIOR DETAILS], [COLOR SCHEME],
retro 1990s aesthetic, clean lines, isometric-ish perspective showing depth,
256 color palette, [OCCUPANCY STATE]
```

**Person Sprite (DALL-E):**
```
Single pixel art sprite, 8×16 pixels, person in business casual,
side view profile, simple clean design, 1990s SimTower aesthetic,
[COLOR] body silhouette, [POSE], white background,
retro game sprite style, high contrast
```

## Testing Checklist

After sprite integration:

- [ ] All building types have at least 1 sprite (even placeholder)
- [ ] Sprites appear correctly positioned
- [ ] Day/night lighting works (building lights toggle)
- [ ] People sprites animate when walking
- [ ] Stress colors update correctly
- [ ] No pop-in (all sprites preloaded)
- [ ] Fallback rendering works when sprite missing
- [ ] Performance is 60 FPS with 500+ people
- [ ] Memory usage < 500 MB
- [ ] Sprite cache clears on hot-reload

## Next Steps

1. Generate first batch of sprites (offices, people)
2. Integrate into BuildingRenderer
3. Test with existing game systems
4. Iterate on visual quality
5. Generate remaining sprites
6. Polish animations and transitions

## Resources

- **SimTower Original:** Reference for visual style
- **OpenSkyscraper:** Asset dumps for color palettes
- **ImageFX:** https://labs.google/fx/tools/image-fx
- **Aseprite:** https://www.aseprite.org/

---

*This system is the foundation for Phase 1 (Building Sprites) of the 5% → 50% roadmap. Once integrated, OpenTower will visually resemble SimTower.*
