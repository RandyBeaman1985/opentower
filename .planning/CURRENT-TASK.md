# Current Task: Sprite Asset Generation & Integration

**Status:** 🟢 Infrastructure Ready - Assets Needed  
**Priority:** HIGH (5% → 50% visual upgrade)  
**ETA:** 4-6 hours (with asset generation)  
**Phase:** Week 10 - Visual Polish

---

## 🎯 The Goal

Transform OpenTower from colored rectangles to pixel art sprites showing actual building interiors and animated people.

### What's Done ✅
- Complete sprite management system (`BuildingSprites.ts`, `PeopleSprites.ts`)
- Comprehensive documentation and integration guide
- TypeScript types for all building and character states
- Texture caching and preloading systems
- Fallback rendering for missing assets
- Asset specifications and prompt templates

### What's Needed ⏳
1. **Generate sprite assets** using ImageFX/DALL-E
2. **Integrate sprites** into BuildingRenderer and PeopleRenderer
3. **Test visual transitions** (empty → half → full states)
4. **Polish animations** (walking cycles, smooth transitions)

---

## 📋 Immediate Next Steps

### Step 1: Generate First Batch of Sprites (2 hours)
**Priority buildings for MVP visual upgrade:**

1. **Office (highest priority - most visible)**
   - office-empty.png (144×36px)
   - office-half.png (3 workers at desks)
   - office-full.png (6 workers at desks)
   
2. **Lobby**
   - lobby-1star.png (64×48px)
   
3. **FastFood**
   - fastfood-empty.png (256×36px)
   - fastfood-busy.png (customers at counter)

**Generation workflow:**
```bash
# 1. Open ImageFX: https://labs.google/fx/tools/image-fx
# 2. Use prompt from sprites/README.md (Building Interior section)
# 3. Generate at 2K resolution
# 4. Download and scale in Aseprite to exact dimensions
# 5. Save to: public/assets/buildings/
```

**Example Prompt (Office Empty):**
```
Pixel art cross-section view of office interior, SimTower style,
144×36px, side view cutaway, empty desks with computers, 
filing cabinets, fluorescent lighting, corporate blue color scheme,
retro 1990s aesthetic, clean lines, isometric-ish perspective showing depth,
256 color palette
```

### Step 2: Generate People Sprites (1 hour)
**Priority: Walking animation basics**

1. **Black (normal stress) - Right-facing**
   - person-black-right-idle.png (8×16px)
   - person-black-right-walk-1.png (left leg forward)
   - person-black-right-walk-2.png (right leg forward)
   
2. **Black (normal stress) - Left-facing**
   - person-black-left-idle.png
   - person-black-left-walk-1.png
   - person-black-left-walk-2.png

**Generation workflow:**
```bash
# 1. Open DALL-E 3 (better for human figures)
# 2. Use prompt from sprites/README.md (Person Sprite section)
# 3. Generate at highest quality
# 4. Scale and clean in Aseprite to 8×16px
# 5. Save to: public/assets/people/
```

**Example Prompt (Person Idle):**
```
Single pixel art sprite, 8×16 pixels, person in business casual,
side view profile, simple clean design, 1990s SimTower aesthetic,
black body silhouette, standing pose, white background,
retro game sprite style, high contrast
```

### Step 3: Integrate Sprites into Renderer (1 hour)

**Modify BuildingRenderer.ts:**
```typescript
import {
  createBuildingSprite,
  getBuildingState,
} from '@/rendering/sprites/BuildingSprites';

// In renderBuilding():
const state = getBuildingState(
  building.type,
  building.occupantIds.length,
  building.capacity,
  this.getCurrentTime()
);

const sprite = await createBuildingSprite(building.type, state);
if (sprite) {
  sprite.x = building.position.startTile * 16;
  sprite.y = building.position.floor * 48;
  this.container.addChild(sprite);
  this.spriteCache.set(building.id, sprite);
} else {
  // Fallback to colored rectangle
  this.renderColoredRectangle(building);
}
```

**Modify PeopleRenderer.ts:**
```typescript
import {
  createPersonSprite,
  getPersonDirection,
} from '@/rendering/sprites/PeopleSprites';

// In renderPerson():
const direction = getPersonDirection(person, previousTile);
const sprite = await createPersonSprite(person, direction);

if (sprite) {
  sprite.x = person.currentTile * 16;
  sprite.y = person.currentFloor * 48 + 48;
  this.container.addChild(sprite);
} else {
  // Fallback to circle
  this.renderCircle(person);
}
```

### Step 4: Test in Browser (30 minutes)

1. Build and run: `npm run dev`
2. Place office building
3. Verify sprite appears (not rectangle)
4. Spawn workers
5. Watch office transition: empty → half → full
6. Verify people sprites appear (not circles)
7. Verify walking animation plays
8. Check console for sprite loading errors

---

## 🔧 Implementation Details

### Asset Directory Structure
```
public/
  assets/
    buildings/
      office-empty.png
      office-half.png
      office-full.png
      fastfood-empty.png
      fastfood-busy.png
      lobby-1star.png
    people/
      person-black-left-idle.png
      person-black-left-walk-1.png
      person-black-left-walk-2.png
      person-black-right-idle.png
      person-black-right-walk-1.png
      person-black-right-walk-2.png
```

### Critical Files to Modify
1. `src/rendering/BuildingRenderer.ts` - Replace rectangles with sprites
2. `src/rendering/PeopleRenderer.ts` - Replace circles with animated sprites
3. `src/index.ts` - Add sprite preloading at game start

### Testing Checklist
- [ ] Sprites load without console errors
- [ ] Buildings show correct state (empty/half/full)
- [ ] State transitions work (occupancy changes)
- [ ] People sprites animate when walking
- [ ] People sprites face correct direction
- [ ] Stress colors update correctly (future: add other colors)
- [ ] Fallback rendering works (if sprite missing)
- [ ] Performance is 60 FPS with 50+ people

---

## 📊 Expected Impact

### Before (Current State):
- Buildings: Colored rectangles (red, blue, green)
- People: 4px colored circles
- Stress: Only visible in thought bubbles
- State: No visual indication of occupancy
- **Visual Quality:** 2/10

### After (First Sprite Batch):
- Buildings: Pixel art interiors showing desks, workers
- People: 8×16px animated characters walking
- Stress: Color-coded character sprites
- State: Visual difference between empty/half/full offices
- **Visual Quality:** 6/10

### Full Sprite System (Future):
- All 21 building types with interiors
- Day/night lighting variants
- 5 stress colors for people
- Full walking animations
- Smooth state transitions
- **Visual Quality:** 9/10 (SimTower-like)

---

## ⏱️ Time Estimate

- Asset generation (6 building sprites): 1 hour
- Asset generation (6 people sprites): 1 hour
- Post-processing in Aseprite: 1 hour
- Code integration: 1 hour
- Testing and debugging: 30 minutes
- **Total: 4-5 hours**

---

## 🎯 Success Criteria

- [ ] Office building shows interior with desks
- [ ] Office changes state when workers arrive
- [ ] People appear as tiny humans (not circles)
- [ ] Walking animation plays smoothly
- [ ] Build succeeds with 0 TypeScript errors
- [ ] Game runs at 60 FPS
- [ ] Fallback rendering works for missing sprites

---

## 🔗 Resources

- **Sprite System Docs:** `src/rendering/sprites/README.md`
- **ImageFX:** https://labs.google/fx/tools/image-fx
- **Aseprite:** (if installed) or manual pixel editing
- **SimTower Reference:** OpenSkyscraper asset dumps for style

---

## 📝 Notes

- Start with **offices and people** - highest visual impact
- Don't worry about perfection - iterate on quality later
- Fallback rendering ensures game always works
- Sprite generation can happen in parallel (Davey uses AI tools)
- Integration is straightforward once assets exist

---

*Last Updated: 2026-02-02, 2:45 PM MST - v0.10.0*  
*Previous Task: Rush Hour Visibility (✅ Already Fixed)*  
*Status: Infrastructure ready, waiting on assets*
