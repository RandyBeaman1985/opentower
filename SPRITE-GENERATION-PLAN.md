# OpenTower Pixel Art Sprite Generation Plan

## Mission
Replace procedural building graphics with charming pixel art sprites for authentic SimTower aesthetic.

## Current State
- ✅ Sprite loading infrastructure exists (`src/rendering/sprites/BuildingSprites.ts`)
- ✅ Procedural fallback rendering works (detailed but vector-based)
- ❌ No actual PNG sprite assets exist yet
- ❌ Game falls back to procedural rendering for all buildings

## Approach
Generate pixel art sprites using **ImageFX (Google Imagen 4)** → Post-process for pixel-perfect alignment → Save to `public/assets/buildings/`

## Priority Buildings (Phase 1)
Start with most visible/important buildings:

1. **Office** (144×36px) - Most common commercial building
   - States: empty, half, full
   
2. **Condo** (256×36px) - Most common residential
   - States: forsale, occupied-day, occupied-night
   
3. **Lobby** (64×36px) - Always visible, defines tower entrance
   - States: 1star, 2star, 3star, 4star, 5star
   
4. **Fast Food** (256×36px) - Popular commercial
   - States: empty, busy
   
5. **Hotel Single** (64×36px) - Common hotel type
   - States: vacant, occupied, sleeping

## Sprite Specifications
- **Format:** PNG with transparency
- **Style:** Pixel art, SimTower 1994 aesthetic, cross-section cutaway view
- **Scale:** HD (16px per tile)
- **Colors:** Warm, nostalgic 90s palette
- **Details:** Visible interior (desks, beds, tables, people silhouettes)
- **Lighting:** Day/night variants show window lights on/off

## ImageFX Prompt Template
```
Pixel art cross-section interior of [BUILDING TYPE], retro 90s SimTower style,
side-view cutaway showing [INTERIOR DETAILS], [WIDTHpx × 36px exact dimensions],
warm nostalgic colors, visible windows [LIT/DARK], [FURNITURE/PEOPLE],
clean lines, isometric perspective with depth, 256 color palette,
1990s video game aesthetic, high contrast, professional pixel art
```

## Example Prompts

### Office (Empty)
```
Pixel art cross-section interior of office building, retro 90s SimTower style,
side-view cutaway showing empty cubicles and desks, 144px × 36px exact dimensions,
warm blue/gray office colors, visible windows (dark/unlit), empty desk chairs,
office plants, filing cabinets, clean lines, isometric perspective with depth,
256 color palette, 1990s video game aesthetic, professional pixel art
```

### Office (Full)
```
Pixel art cross-section interior of office building, retro 90s SimTower style,
side-view cutaway showing workers at desks, 144px × 36px exact dimensions,
warm blue/gray office colors, visible windows with warm light, people silhouettes
working at computers, office plants, filing cabinets, busy office atmosphere,
isometric perspective with depth, 256 color palette, 1990s video game aesthetic
```

### Condo (Occupied-Night)
```
Pixel art cross-section interior of apartment condo, retro 90s SimTower style,
side-view cutaway showing cozy living space at night, 256px × 36px exact dimensions,
warm beige/tan residential colors, windows with warm interior lights glowing,
furniture visible (couch, bed, table), person silhouette relaxing,
curtains, decorations, homey atmosphere, isometric perspective with depth,
256 color palette, 1990s video game aesthetic, warm and inviting
```

## Post-Processing Steps
1. Generate base image with ImageFX at 2K resolution
2. Import to Aseprite or similar pixel art tool
3. Scale down to exact dimensions (e.g., 144×36px)
4. Clean up artifacts (AI anti-aliasing, noise)
5. Ensure pixel-perfect alignment to 16px tile grid
6. Extract color palette, ensure consistency across sprites
7. Save as PNG with transparency
8. Test in game

## Directory Structure to Create
```
public/
  assets/
    buildings/
      office-empty.png (144×36px)
      office-half.png (144×36px)
      office-full.png (144×36px)
      condo-forsale.png (256×36px)
      condo-occupied-day.png (256×36px)
      condo-occupied-night.png (256×36px)
      lobby-1star.png (64×36px)
      lobby-2star.png (64×36px)
      ... (more as generated)
```

## Testing Plan
1. Create `public/assets/buildings/` directory
2. Generate and save first sprite (office-empty.png)
3. Run dev server: `npm run dev`
4. Verify sprite loads (check console for "✨ Loaded sprite...")
5. Compare to procedural fallback
6. Iterate on prompt if needed
7. Generate remaining sprites

## Success Criteria
- ✅ Sprites load without errors
- ✅ Buildings look like charming pixel art, not procedural graphics
- ✅ Interior details visible (furniture, people, windows)
- ✅ Day/night lighting works
- ✅ Sprites feel cohesive (consistent style/palette)
- ✅ No procedural fallback used (sprites take priority)

## Notes
- Start small: Generate 1-2 sprites, test integration, then batch-generate rest
- Keep prompts consistent for visual cohesion
- May need 2-3 iterations per sprite to get pixel-perfect result
- Fallback rendering remains for buildings without sprites yet

---

**Next Step:** Create public/assets/buildings/ directory and generate first sprite
