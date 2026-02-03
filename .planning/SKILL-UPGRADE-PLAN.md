# OpenTower Skill-Powered Upgrade Plan
**Created:** 2026-02-03 03:55 MST
**Status:** EXECUTING
**Skills Used:** frontend-design, ui-ux-master, apple-hig, coding-agent, self-improvement

---

## 🎯 Goal
Take OpenTower from "code complete" to "visually stunning, UX-polished, production-ready"

## 📊 Current State
- ✅ All 21 building types work
- ✅ Economy system complete (bankruptcy, rent, costs)
- ✅ Population AI with needs, stress, pathfinding
- ✅ Star rating progression
- ✅ Events (VIPs, fires, treasure)
- ✅ Sound (9 sounds + music)
- ✅ Save/Load
- ⚠️ **Visual Polish: 5%** (rectangles, no sprites)
- ⚠️ **UI/UX: Functional but not polished**

---

## 🔧 Skill Application Strategy

### 1. frontend-design Skill
**Purpose:** Avoid "AI slop" aesthetics, create distinctive visual identity

**Apply to:**
- [ ] Main menu / start screen redesign
- [ ] Building menu with personality
- [ ] Financial report modal polish
- [ ] Game over screen (make it MEMORABLE)
- [ ] Loading/splash screen

**Design Direction:** Retro-futuristic 90s management sim aesthetic
- Muted corporate blues and grays
- Pixel-adjacent UI elements
- Skeuomorphic touches (paper textures, embossed buttons)
- CRT scan-line effects on overlays

### 2. ui-ux-master Skill  
**Purpose:** Apply professional UX patterns

**Apply to:**
- [ ] Information hierarchy in TowerPulse dashboard
- [ ] Building tooltip clarity
- [ ] Notification system timing and positioning
- [ ] Tutorial flow improvements
- [ ] Keyboard shortcuts discoverability

**Key Principles:**
- Clarity over cleverness
- Consistent visual language
- Immediate feedback
- Progressive disclosure

### 3. apple-hig Skill
**Purpose:** Design principles that translate to any platform

**Apply to:**
- [ ] Typography system (SF Pro alternatives for web)
- [ ] Spacing and layout grid
- [ ] Animation timing curves
- [ ] Color semantics (success, warning, error states)

### 4. coding-agent Skill
**Purpose:** Parallel execution of improvements

**Strategy:**
- Spawn focused sub-agents for specific tasks
- Each works in isolated scope
- Report back with results

### 5. self-improvement Skill
**Purpose:** Track learnings during development

**Actions:**
- Create `.learnings/` directory
- Log errors and fixes
- Capture UX discoveries

---

## 🚀 Execution Plan

### Phase A: UI Polish Sprint (Priority 1)
**Estimated Time:** 30-45 minutes via sub-agents

1. **TopBar Redesign**
   - Better visual hierarchy for money/population/time
   - Add micro-animations for value changes
   - Distinctive typography

2. **BottomBar/BuildingMenu Overhaul**
   - Category tabs with icons
   - Building cards with preview images
   - Cost/income at-a-glance
   - Hover states with personality

3. **FinancialReportModal Enhancement**
   - Better data visualization
   - Bar charts with animation
   - Color-coded profit/loss
   - Print-style aesthetic

4. **TowerPulse Dashboard**
   - At-a-glance health indicators
   - Mini-charts for trends
   - Alert system integration

### Phase B: Game Feel Improvements (Priority 2)
1. **Notification Polish**
   - Toast animations
   - Sound feedback
   - Stacking behavior

2. **Building Placement Feel**
   - Preview ghosting
   - Snap feedback
   - Invalid placement effects

3. **Time Control**
   - Speed indicator clarity
   - Pause state overlay
   - Day/night transition effects

### Phase C: Visual Identity (Priority 3)
1. **Color System**
   - Define semantic colors
   - Create CSS variables
   - Dark mode consideration

2. **Typography System**
   - Display font for headers
   - Body font for data
   - Mono font for numbers

3. **Animation Library**
   - Consistent easing curves
   - Entrance/exit patterns
   - Micro-interactions

---

## 📋 Immediate Actions

1. ✅ Plan created
2. [ ] Start dev server
3. [ ] Spawn UI polish sub-agent for TopBar
4. [ ] Spawn UI polish sub-agent for BuildingMenu
5. [ ] Spawn UI polish sub-agent for FinancialReportModal
6. [ ] Review and integrate results
7. [ ] Test in browser
8. [ ] Iterate based on feedback

---

## 🎨 Design Tokens (Reference)

```css
/* OpenTower Design System */
:root {
  /* Primary palette - 90s corporate */
  --ot-primary: #2C5282;      /* Corporate blue */
  --ot-secondary: #4A5568;    /* Steel gray */
  --ot-accent: #D69E2E;       /* Gold/warning */
  
  /* Semantic */
  --ot-success: #38A169;
  --ot-warning: #D69E2E;
  --ot-danger: #E53E3E;
  --ot-info: #3182CE;
  
  /* Surfaces */
  --ot-bg-primary: #1A202C;
  --ot-bg-secondary: #2D3748;
  --ot-bg-elevated: #4A5568;
  
  /* Typography */
  --ot-font-display: 'Chicago', 'VT323', monospace;
  --ot-font-body: 'Inter', system-ui, sans-serif;
  --ot-font-mono: 'JetBrains Mono', monospace;
  
  /* Spacing scale */
  --ot-space-xs: 4px;
  --ot-space-sm: 8px;
  --ot-space-md: 16px;
  --ot-space-lg: 24px;
  --ot-space-xl: 32px;
  
  /* Animation */
  --ot-ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ot-ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ot-duration-fast: 150ms;
  --ot-duration-normal: 300ms;
}
```

---

**Next:** Execute Phase A via sub-agents
