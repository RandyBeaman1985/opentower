# OpenTower Asset Tooling Research
## AI Art Tools for 1,410+ Pixel Art Game Assets

*Research Date: 2026-01-30*
*Updated: 2026-01-30 — Optimized for existing subscriptions*

---

## 💰 COST OPTIMIZATION: Using Existing Subscriptions

**Davey already pays for:**
- ✅ **Google Gemini AI Ultra** → Includes unlimited **ImageFX (Imagen 4)**
- ✅ **OpenAI Pro** → Includes unlimited **DALL-E 3** and **GPT-4o image generation**
- ✅ **Claude Max** → Coding assistance, prompt iteration, analysis

**This changes everything.** We can do 95% of asset work at $0 additional cost.

---

## Executive Summary (Revised)

| Tool | Best For | Cost to Davey | Consistency | Speed | Recommendation |
|------|----------|---------------|-------------|-------|----------------|
| **ImageFX (Imagen 4)** | Buildings, scenes, backgrounds | **$0** (Gemini Ultra) | ★★★☆☆ | ★★★★★ | **PRIMARY** |
| **DALL-E 3 / GPT-4o** | People, characters, details | **$0** (OpenAI Pro) | ★★★★☆ | ★★★★ | **SECONDARY** |
| **GIMP/Aseprite** | Post-processing, sprite sheets | **$0-20** | N/A | ★★★ | **REQUIRED** |
| **PixelLab.ai** | Pixel art, animations | $29-49/mo | ★★★★★ | ★★★★ | **FALLBACK ONLY** |
| **Scenario.com** | Enterprise, custom models | $50-500/mo | ★★★★★ | ★★★ | **NOT NEEDED** |

**Recommended Strategy:** Use **ImageFX** (buildings/scenes) + **DALL-E 3** (characters) → **GIMP or Aseprite** for pixel conversion → Only add **PixelLab.ai** if results are unsatisfactory after Week 0 testing.

---

## 1. PixelLab.ai — Purpose-Built Pixel Art Generator

### Overview
PixelLab is the **only AI tool specifically designed for pixel art game assets**. Unlike general image generators, it outputs true pixel art with proper dithering, limited palettes, and consistent pixel sizes.

### Key Features

#### Skeleton-Based Animation
- **How it works:** Upload a static sprite, the system detects key points (head, shoulders, hands, feet)
- Define motion keyframes using a visual skeleton editor
- AI generates all in-between frames maintaining pixel consistency
- **Supported animations:** Walk, run, idle, attack, jump, custom poses
- **Output:** Sprite sheet ready for game engine

#### Style Consistency
- Upload **reference images** (your existing sprites) to lock the art style
- AI learns palette, line weight, shading style, and proportions
- All subsequent generations match the reference
- **Perfect for:** Creating 47 unique people types that look like they belong together

#### Rotation Generation
- Generate **4 or 8 directional views** from a single sprite
- Essential for isometric and top-down games
- Maintains pixel-perfect consistency across views

#### Environment Generation
- **Scene generation:** Up to 400×400 pixels
- **Tilesets:** Auto-generate matching tiles
- **Textures:** Seamless patterns for backgrounds

#### True Inpainting
- Edit existing sprites while preserving style
- Change clothing, add accessories, modify poses
- Unlike general AI models, understands pixel grid constraints

### Pricing (as of 2026)
| Plan | Cost | Credits/Month | Best For |
|------|------|---------------|----------|
| Free | $0 | 50 | Testing |
| Starter | $15/mo | 500 | Indie solo dev |
| Pro | $29/mo | 1,500 | Small team |
| Studio | $49/mo | 4,000 | Full production |

**Cost estimate for OpenTower (1,410 frames):**
- ~3-5 credits per complex sprite = ~5,000-7,000 credits needed
- **Studio plan for 2 months = ~$100 total**

### Workflow for Building Sprites
```
1. Create ONE reference sprite manually (e.g., basic office worker)
2. Upload to PixelLab as style reference
3. Generate variations: "male office worker, blue suit, briefcase"
4. Use skeleton animation for walk cycle (8 frames)
5. Generate rotations (left/right facing)
6. Export sprite sheet → Aseprite for final polish
```

### Limitations
- Max scene size: 400×400 (adequate for most OpenTower units)
- Not ideal for very large continuous backgrounds
- Subscription-based (no perpetual license)

### Verdict: ★★★★★ PRIMARY TOOL
The only tool that truly understands pixel art. Essential for character animations and maintaining style across hundreds of assets.

---

## 2. Scenario.com — Enterprise-Grade Custom Model Training

### Overview
Scenario is used by **InnoGames, Ubisoft, MAG Interactive, and Tripledot Studios** for production game assets. It offers custom model training that can learn your exact art style.

### Key Features

#### Custom Model Training
- **Minimum images:** 5-15 reference images to start
- **Recommended:** 50-100 images for best results
- **Base models:** Flux, SDXL, Kontext, Bria
- **Training time:** Hours (not days)
- **Output:** Dedicated model that captures your exact style

#### Pixelate Feature
- Convert any image into pixel art
- **Adjustable grid sizes:** 16px to 256px
- **Custom color palettes:** Extract from reference or define manually
- **Noise removal:** Clean up artifacts
- **Background removal:** Isolate sprites

**How Pixelate Works:**
```
1. Upload high-res image (concept art, photo, AI generated)
2. Set pixel grid: 32px for characters, 64px for buildings
3. Define palette: 16-color SimTower aesthetic
4. Optional: Remove background
5. Generate → Download pixel art version
```

#### Enterprise Case Studies

**InnoGames (Forge of Empires, Elvenar):**
- Doubled productivity (50% faster time-to-market)
- Used for: Backgrounds, character portraits, icons
- Trained on proprietary art styles
- Minimal artist overpainting required

**Ubisoft (Captain Laserhawk: The G.A.M.E.):**
- Generated **10,000+ unique character variations**
- From 20 original designs → thousands of unique avatars
- Sub-2-second API response times
- Precise 36×36 pixel grid specifications
- **$80K+ secondary market value** for generated assets

### Pricing
| Plan | Cost | What You Get |
|------|------|--------------|
| Individual | $15/mo | Basic access, limited credits |
| Pro | $50/mo | More credits, priority queue |
| Team | $150/mo | Multi-user, shared workspace |
| Enterprise | Custom ($500+/mo) | Dedicated compute, API access |

**For OpenTower:**
- Pro plan sufficient for solo development
- Enterprise only if building automated pipeline

### API Access
```javascript
// Scenario API example (REST)
POST /v1/images/generate
{
  "model": "your-trained-model-id",
  "prompt": "pixel art office building, 4 floors, workers visible, SimTower style",
  "width": 576,
  "height": 256,
  "num_images": 4
}
```

### Workflow for Building Sprites
```
1. Create 15-20 reference building cross-sections manually
2. Train custom "OpenTower Building Style" model (2-4 hours)
3. Generate variations: offices, hotels, shops, restaurants
4. Use Pixelate to convert to exact pixel dimensions
5. Batch export via API for consistency
6. Post-process in Aseprite
```

### Limitations
- Not pixel-art native (requires Pixelate post-processing)
- Learning curve for custom model training
- Higher cost than PixelLab for individual use
- Overkill for small projects

### Verdict: ★★★★☆ BACKUP / ENTERPRISE SCALING
Best-in-class for custom model training and enterprise scale. Use if PixelLab doesn't meet quality needs or for automated bulk generation.

---

## 3. ImageFX (Imagen 4) — High-Resolution Prototyping

### Overview
Google's **Imagen 4** via ImageFX is the best free AI image generator. Excellent for initial concept exploration and high-resolution base images.

### Key Features
- **Resolution:** Up to 2K (2048×2048)
- **Text rendering:** Best-in-class (great for signage)
- **Speed:** 10x faster than competitors
- **Cost:** FREE with Google account

### Best Practices for Pixel Art Prompts

**Effective prompt structure:**
```
"[STYLE] [SUBJECT] [DETAILS] [TECHNICAL SPECS]"

Example:
"16-bit pixel art, cross-section of office building floor, 
3 workers at desks visible through windows, 
fluorescent lighting, beige carpet, 
detailed interior view, game sprite, transparent background"
```

**Style Keywords That Work:**
- `16-bit pixel art` / `8-bit pixel art`
- `game sprite` / `sprite sheet`
- `cross-section view` / `cutaway`
- `retro gaming aesthetic`
- `limited color palette`
- `pixel-perfect`

**Keywords to AVOID:**
- `realistic` / `photorealistic`
- `3D rendered`
- `high detail` (causes non-pixel noise)

### Seed Management
ImageFX does **not expose seed control** (unlike Stable Diffusion). Workarounds:
1. Save good results immediately
2. Use consistent, detailed prompts
3. Generate batches of 4, pick best
4. Use as base → process through PixelLab or Scenario Pixelate

### Limitations for Game Assets
- **No true pixel control** — outputs are "pixel art styled" not true pixel art
- **Inconsistent style** across generations (no reference image feature)
- **No animation support**
- **No API** — manual generation only
- **Seeds not exposed** — can't reproduce exact results

### Workflow for Prototyping
```
1. Generate concept images: "SimTower style office floor, cross-section"
2. Save ~10 variations you like
3. Use as style reference for PixelLab or Scenario training
4. Never use raw ImageFX output as final game art
```

### Verdict: ★★★☆☆ PROTOTYPING ONLY
Excellent for free, fast concept exploration. **Do not use outputs directly** — always post-process through pixel art tools.

---

## 4. Stable Diffusion + LoRAs — Local Bulk Generation

### Overview
Run your own AI image generation locally with Stable Diffusion + pixel art LoRAs. Best for high-volume batch generation with full control.

### Pixel Art LoRAs on CivitAI

**Top Recommendations:**
| LoRA | Base Model | Specialty |
|------|------------|-----------|
| Pixel Art XL | SDXL | General pixel art |
| 16-bit Game Sprites | SDXL | Retro game style |
| Tiny Pixel Characters | SD 1.5 | Small sprites |
| Pixel Scenery | SDXL | Backgrounds, environments |
| SimTower Style* | Custom | *Would need to train* |

**How to find LoRAs:**
1. Go to civitai.com
2. Filter: LoRA → Tags: "pixel art" → Sort: Most Downloaded
3. Check compatibility with your base model (SDXL recommended)

### ComfyUI Workflow for Batch Generation

**Setup Requirements:**
- **Hardware:** NVIDIA GPU with 8GB+ VRAM (or cloud GPU)
- **Software:** ComfyUI + ComfyUI Manager
- **Models:** SDXL base + pixel art LoRAs
- **Time:** 4-8 hours initial setup

**Basic Workflow Nodes:**
```
[Load Checkpoint] → [Load LoRA] → [CLIP Text Encode] → 
[KSampler] → [VAE Decode] → [Save Image]
```

**Batch Generation Workflow:**
```
[CSV Prompt List] → [Prompt Iterator] → [Generation Loop] →
[Auto-naming] → [Folder Organization] → [Export]
```

**Example prompts.csv:**
```csv
name,prompt
office_worker_m_01,"pixel art sprite, male office worker, suit, briefcase, side view, game asset"
office_worker_f_01,"pixel art sprite, female office worker, blazer, side view, game asset"
...
```

### Local vs API-Based Generation

| Aspect | Local (ComfyUI) | API (Replicate/RunPod) |
|--------|-----------------|------------------------|
| **Setup time** | 4-8 hours | 30 minutes |
| **Ongoing cost** | Electricity only | $0.01-0.05/image |
| **Speed** | ~2-5 sec/image | ~3-10 sec/image |
| **Control** | Full | Limited |
| **Hardware needed** | Yes (GPU) | No |
| **Consistency** | Perfect (same seed) | Good |

**Recommendation for OpenTower:**
- **Use API** unless you have a gaming GPU sitting idle
- RunPod serverless: ~$70 for 1,410 images
- Local: Free after hardware, but requires technical setup

### Automation Opportunities
```python
# Pseudo-code for batch generation
import comfyui_api

prompts = load_csv("asset_prompts.csv")
lora = "pixel_art_xl_v2.safetensors"

for asset in prompts:
    result = comfyui_api.generate(
        prompt=asset.prompt,
        lora=lora,
        seed=hash(asset.name),  # Reproducible
        width=512,
        height=512
    )
    save(result, f"output/{asset.name}.png")
```

### Limitations
- **Setup complexity** — not beginner-friendly
- **No native pixel constraints** — requires post-processing
- **Quality varies** — LoRAs differ significantly
- **Time investment** — optimizing takes days

### Verdict: ★★★★☆ ADVANCED AUTOMATION
Best value for bulk generation if you have technical skills. Skip if you want fast results.

---

## 5. Post-Processing Pipeline — Aseprite Automation

### Aseprite: The Gold Standard
Aseprite is the industry-standard pixel art editor. **Essential** for final polish regardless of AI tool used.

### Scripting with Lua
Aseprite supports Lua scripting for batch operations:

**Script Location:** `File > Scripts > Open Script Folder`

### Essential Scripts for OpenTower

#### 1. Batch Palette Application
```lua
-- Apply consistent palette to all images in folder
local palette = Palette{ fromFile="simtower_palette.pal" }

for i, filename in ipairs(app.fs.listFiles("input/")) do
    local sprite = app.open("input/" .. filename)
    sprite:setPalette(palette)
    -- Quantize to palette
    app.command.ChangePixelFormat{ format="indexed" }
    sprite:saveCopyAs("output/" .. filename)
    sprite:close()
end
```

#### 2. Grid Alignment Check
```lua
-- Verify all pixels align to grid
local function checkGridAlignment(sprite, gridSize)
    for _, cel in ipairs(sprite.cels) do
        if cel.position.x % gridSize ~= 0 or 
           cel.position.y % gridSize ~= 0 then
            return false, cel.layer.name
        end
    end
    return true
end
```

#### 3. Sprite Sheet Assembly
```lua
-- Combine individual frames into sprite sheet
local sheetWidth = 8  -- 8 frames per row
local sprites = {}

for i, f in ipairs(app.fs.listFiles("frames/")) do
    sprites[i] = app.open("frames/" .. f)
end

local frameW, frameH = sprites[1].width, sprites[1].height
local sheet = Sprite(frameW * sheetWidth, frameH * math.ceil(#sprites / sheetWidth))

for i, src in ipairs(sprites) do
    local x = ((i-1) % sheetWidth) * frameW
    local y = math.floor((i-1) / sheetWidth) * frameH
    -- Copy pixels to sheet position
    -- ...
end

sheet:saveCopyAs("spritesheet.png")
```

### Palette Extraction & Application

**Step 1: Define Master Palette**
Create `opentower_palette.pal` with ~64 colors:
- 16 skin tones
- 16 building materials (concrete, glass, metal)
- 16 furniture/interior colors
- 16 accent/UI colors

**Step 2: Extract from Reference**
```lua
-- Extract unique colors from reference sprite
local colors = {}
local img = app.sprite.cels[1].image
for pixel in img:pixels() do
    colors[pixel()] = true
end
-- Export as .pal file
```

**Step 3: Apply to All Assets**
```lua
-- Quantize all generated images to master palette
app.command.ChangePixelFormat{
    format="indexed",
    rgbmap="octree",
    dithering="ordered"
}
```

### Sprite Sheet Assembly Automation

**Tool: TexturePacker** (Alternative to manual Aseprite)
- Import folder of sprites
- Auto-detect frames
- Export sheet + JSON metadata
- Godot/Unity native support

**Free Alternative: Free Texture Packer**
- Command-line batch processing
- Cross-platform

### Complete Post-Processing Pipeline
```
1. AI Generation (PixelLab/Scenario)
   ↓
2. Download batch to /raw/
   ↓
3. Aseprite script: Apply palette quantization
   ↓
4. Aseprite script: Verify grid alignment
   ↓
5. Manual QC: Fix any AI artifacts
   ↓
6. TexturePacker: Assemble sprite sheets
   ↓
7. Export: PNG + JSON metadata
   ↓
8. Import to Godot
```

---

## Tool Comparison Matrix

| Criteria | PixelLab | Scenario | ImageFX | SD+LoRA |
|----------|----------|----------|---------|---------|
| **Pixel Art Native** | ✅ Yes | ⚠️ Post-process | ❌ No | ⚠️ With LoRA |
| **Animation Support** | ✅ Skeleton | ❌ No | ❌ No | ❌ No |
| **Style Consistency** | ★★★★★ | ★★★★★ | ★★☆☆☆ | ★★★★☆ |
| **Batch/API** | ✅ API | ✅ API | ❌ Manual | ✅ Local |
| **Custom Training** | ⚠️ Limited | ✅ Full | ❌ No | ✅ Full |
| **Setup Time** | 10 min | 2-4 hrs | 5 min | 8+ hrs |
| **Learning Curve** | Easy | Medium | Easy | Hard |
| **Monthly Cost** | $15-49 | $15-500 | Free | Variable |
| **Best For** | Characters | Buildings | Concepts | Bulk |

---

## Recommended Workflow for OpenTower

### Phase 1: Prototyping (Week 1)
**Tool:** ImageFX (free)
- Generate 50+ concept images
- Establish visual direction
- Save best results as references

### Phase 2: Core Assets (Weeks 2-4)
**Tool:** PixelLab.ai ($49/mo Studio)
1. Upload ImageFX results as style references
2. Generate all character types (47 unique people)
3. Create walk animations with skeleton tool
4. Generate building cross-sections

### Phase 3: Variations & Polish (Weeks 5-6)
**Tool:** PixelLab.ai + Aseprite
1. Generate state variations (empty/busy/crowded)
2. Batch apply palette in Aseprite
3. Manual cleanup of AI artifacts
4. Assemble sprite sheets

### Phase 4: Bulk Generation (If Needed)
**Tool:** Scenario.com API or ComfyUI
- Only if >2,000 assets needed
- Train custom model on completed assets
- Generate remaining variations programmatically

---

## Cost Estimates for 1,410 Frames

### Budget Option (~$150)
- ImageFX: Free (prototyping)
- PixelLab Starter: $15/mo × 3 months = $45
- Aseprite: $20 (one-time, or compile from source for free)
- TexturePacker: Free tier
- **Total: ~$65-150**

### Recommended Option (~$250)
- ImageFX: Free (prototyping)
- PixelLab Studio: $49/mo × 2 months = $98
- Scenario Pro: $50/mo × 1 month = $50 (backup)
- Aseprite: $20
- **Total: ~$170-250**

### Enterprise Option (~$600+)
- Scenario Team: $150/mo × 3 months = $450
- Custom model training
- API automation
- Full pipeline automation
- **Total: ~$500-800**

---

## Automation Opportunities

### 1. Prompt Template System
Create a CSV of all 1,410 assets with standardized prompts:
```csv
id,category,name,prompt_template,states
bld_001,commercial,lobby,"pixel art lobby floor, cross-section, {state}",empty|busy|crowded
bld_002,commercial,office,"pixel art office, workers at desks, {state}",empty|occupied|crowded
...
```

### 2. CI/CD for Assets
```yaml
# GitHub Action for asset pipeline
name: Generate Assets
on:
  push:
    paths: ['assets/prompts.csv']
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Generate via PixelLab API
        run: python scripts/generate_assets.py
      - name: Post-process
        run: aseprite -b -script scripts/batch_palette.lua
      - name: Assemble sheets
        run: texturepacker --data output/sprites.json ...
```

### 3. Aseprite Batch Runner
```bash
#!/bin/bash
# Process all raw AI outputs
for file in raw/*.png; do
    aseprite -b "$file" \
        -script palette_apply.lua \
        -script grid_check.lua \
        --save-as "processed/$(basename $file)"
done
```

---

## Final Recommendations

### Primary Tool: **PixelLab.ai**
- Only tool designed specifically for pixel art games
- Skeleton animation solves character movement
- Style consistency across batches
- Reasonable cost ($29-49/mo)

### Backup Tool: **Scenario.com**
- If PixelLab quality insufficient
- For training custom "SimTower style" model
- Enterprise-proven (Ubisoft, InnoGames)

### Prototyping Tool: **ImageFX**
- Free and fast
- Excellent for exploration
- Never use raw output as final art

### Post-Processing: **Aseprite**
- Non-negotiable for final polish
- Lua scripting for automation
- Industry standard

### Skip Unless Expert: **Stable Diffusion + LoRAs**
- High setup cost (time)
- Best for >5,000 assets
- Requires GPU and technical skills

---

## Next Steps

1. [ ] Sign up for PixelLab.ai free trial
2. [ ] Create 3 manual reference sprites in Aseprite
3. [ ] Test PixelLab with reference style upload
4. [ ] Generate first 10 character variants
5. [ ] Evaluate quality, adjust prompts
6. [ ] Begin systematic asset generation

---

*Document maintained by: Asset Pipeline Researcher*
*Last updated: 2026-01-30*
