# OpenTower AI Studio Rotation System
**Created:** 2026-02-03 04:20 MST
**Status:** ACTIVE

---

## 🎯 The Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI STUDIO ROTATION                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CODEX ──build──► OPUS ──review──► TEST ──feedback──► CODEX    │
│    │                │                │                   │      │
│    └── rate limit? ─┘                │                   │      │
│                                      │                   │      │
│  GEMINI ◄──────────────────── if needed ─────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Rotation Rules

1. **Codex** builds/implements (--full-auto mode)
2. **Opus** reviews, questions, suggests improvements
3. **UX Tester** (Luna) does human-grade experience testing
4. **Code Reviewer** checks for bugs, patterns, performance
5. Feedback loops back → next model takes action
6. **Gemini** jumps in if others are rate-limited

## ⏱️ Rate Limit Awareness

| Model | Limit | Strategy |
|-------|-------|----------|
| Codex | ~10 req/min | Batch work, hand off when limited |
| Opus | 200k context | Full reviews, no token concerns |
| Gemini | Generous | Backup, fresh perspective |

## 📋 Current Sprint: UI Polish

### Queue (Priority Order)
1. [x] TopBar - design tokens, animations ✅
2. [x] FinancialReportModal - corporate print aesthetic ✅
3. [ ] BuildingMenu - category tabs, building cards, previews
4. [ ] NotificationSystem - toast polish, stacking
5. [ ] TowerPulse dashboard - at-a-glance indicators
6. [ ] Game feel - placement preview, feedback

### Active Task
**BuildingMenu Overhaul**
- Category tabs with icons
- Building cards with preview images (generated or placeholder)
- Cost/income at-a-glance
- Hover states with personality
- Mobile-friendly touch targets

---

## 📊 Round Log

### Round 1 (Pre-Rotation)
- **Agent:** Luna (Opus)
- **Task:** TopBar + FinancialReportModal
- **Result:** ✅ Complete
- **Build:** 734 modules, 511kB, 0 errors

### Round 2 ✅
- **Agent:** Opus (Codex sandbox issues)
- **Task:** BuildingMenu overhaul
- **Result:** ✅ Complete
- **Changes:**
  - ASCII art building previews (22 buildings)
  - Tab count badges showing available buildings
  - Active tab glow animation
  - Card entrance animations (staggered)
  - Press effect (scale down on click)
  - Selection pulse animation
  - Cost formatting ($40K, $1.0M)
  - Size indicator (width×height tiles)
  - Keyboard hints footer
  - Mobile responsive (48px+ touch targets)
- **Lines:** 790 (was ~350)
- **Code Review:** ✅ Pass (no console spam, proper animations)

### Round 3 (Queued)
- **Agent:** Sub-agent (Gemini or Sonnet)
- **Task:** NotificationSystem polish
- **Status:** ⏳ QUEUED

---

## 🧪 Test Protocol (Each Round)

### Human-Grade UX Testing
- [ ] First impression test (10 sec rule)
- [ ] Can I figure out what to do without instructions?
- [ ] Does it FEEL good to interact with?
- [ ] Any confusion, hesitation, or frustration?
- [ ] Would I be proud to show this to someone?

### Code Review Checklist
- [ ] TypeScript clean (0 errors)
- [ ] No console.log spam
- [ ] No memory leaks (event listeners cleaned up)
- [ ] Consistent with existing patterns
- [ ] Mobile/responsive considered
- [ ] Performance acceptable (no jank)

### Regression Check
- [ ] Build still passes
- [ ] Existing features still work
- [ ] No new console errors
- [ ] Bundle size reasonable

---

## 🎮 Live URL
http://100.85.24.1:5173/

---
