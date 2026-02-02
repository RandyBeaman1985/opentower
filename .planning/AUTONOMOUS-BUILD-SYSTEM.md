# OpenTower Autonomous Build System
**Created:** 2026-01-30  
**Status:** ACTIVE  
**Owner:** Luna (autonomous execution)

---

## 🎯 Mission

Build OpenTower autonomously with:
- Daily playable demos by each morning
- Human-perspective agent testing
- Token-efficient execution
- Clear progress tracking

---

## 🔄 Daily Build Cycle

### Schedule (America/Denver)

| Time | Task | Model | Token Budget |
|------|------|-------|--------------|
| **6:00 AM** | Morning Build Session (2hr) | Sonnet | ~50K |
| **8:00 AM** | Demo Build + Deploy | Sonnet | ~10K |
| **8:30 AM** | Agent Playtest Squad | Sonnet | ~30K |
| **9:00 AM** | Progress Report to Davey | Sonnet | ~5K |
| **2:00 PM** | Afternoon Build Session (if needed) | Sonnet | ~50K |
| **10:00 PM** | Evening Review + Planning | Sonnet | ~20K |

**Daily Budget:** ~165K tokens max  
**Weekly Budget:** ~1.15M tokens  
**Monthly Budget:** ~5M tokens (well within Max plan)

### Token Efficiency Rules

1. **Use Sonnet by default** - Opus only for complex architecture decisions
2. **Batch operations** - Multiple file edits in one turn
3. **Minimal narration** - Just do the work
4. **Cache context** - Reference files by path, don't re-read unnecessarily
5. **Compress history** - Let compaction work naturally

---

## 📁 File Structure

```
/home/ubuntu/clawd/projects/opentower/
├── .planning/
│   ├── AUTONOMOUS-BUILD-SYSTEM.md  (this file)
│   ├── PROGRESS-LOG.md             (daily updates)
│   ├── CURRENT-TASK.md             (what I'm working on)
│   ├── DEMO-BUILDS.md              (version history)
│   └── BUG-TRACKER.md              (from playtesters)
├── demos/
│   └── v0.X.X/                     (daily builds)
│       └── index.html              (playable demo)
├── src/                            (source code)
└── dist/                           (production build)
```

---

## 🧪 Agent Playtest Squad

After each demo build, spawn 3 test agents:

### 1. Casual Gamer Agent
- **Persona:** Never played SimTower, casual mobile gamer
- **Focus:** Is it intuitive? Can I figure out what to do?
- **Reports:** Confusion points, unclear UI, first impressions

### 2. SimTower Veteran Agent  
- **Persona:** Played original 100+ hours
- **Focus:** Does this feel right? What's missing?
- **Reports:** Authenticity issues, missing features, balance

### 3. QA Bug Hunter Agent
- **Persona:** Professional QA tester
- **Focus:** Break everything, find edge cases
- **Reports:** Crashes, glitches, performance issues

### Playtest Protocol
```
1. Load demo URL
2. Play for simulated 15 minutes
3. Write structured bug report
4. Rate: Fun (1-10), Clarity (1-10), Bugs (count)
5. Top 3 issues to fix next
```

---

## 📊 Progress Tracking

### PROGRESS-LOG.md Format
```markdown
## 2026-01-31 (Day 1)

### Completed
- [x] Task description

### Demo Build
- Version: v0.1.0
- URL: file://demos/v0.1.0/index.html
- Features: List what's playable

### Playtest Results
- Casual: Fun 5/10, Clarity 6/10, Bugs 3
- Veteran: Fun 4/10, Clarity 7/10, Bugs 2  
- QA: Found 5 bugs (2 critical)

### Tomorrow's Focus
- Priority 1: Fix critical bugs
- Priority 2: Next feature

### Token Usage
- Today: ~120K
- Week: ~120K
- Month: ~120K
```

---

## 🚀 Phase 1 Sprint Plan (Weeks 1-2)

### Goal: Playable Building Placement Demo

| Day | Target | Success Criteria |
|-----|--------|------------------|
| 1 | Project setup, canvas rendering | See empty tower grid |
| 2 | Click-to-place buildings (Office only) | Place office with mouse |
| 3 | Building sprites (AI-generated) | Office has real sprite |
| 4 | Multiple building types | Place Lobby, Office, FastFood |
| 5 | Building validation rules | Can't overlap, floors work |
| 6 | Polish + bug fixes | Smooth experience |
| 7 | **DEMO v0.1.0** | Davey can place buildings |

### Day 1 Tasks (Starting NOW)
1. [ ] Verify existing codebase compiles
2. [ ] Get basic PixiJS canvas rendering
3. [ ] Create empty tower grid (100 floors × 20 tiles)
4. [ ] Add mouse interaction (click detection)
5. [ ] Create demo/v0.0.1/index.html
6. [ ] Run first playtest (even if empty)

---

## 🛠️ Build Commands

```bash
# Development
cd /home/ubuntu/clawd/projects/opentower
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests

# Demo creation
cp -r dist demos/v0.X.X
```

---

## 📋 Current Task Handoff

When a session ends, update CURRENT-TASK.md:

```markdown
# Current Task

## Status: IN_PROGRESS | BLOCKED | COMPLETE

## What I Was Doing
[Description]

## Files Modified
- path/to/file.ts

## Next Steps
1. Step 1
2. Step 2

## Blockers
- None | [Description]
```

This lets the next session (or cron job) pick up exactly where I left off.

---

## 🔔 Alerts to Davey

Only message Davey for:
- 🎉 **Demo ready** - Morning build complete
- 🚨 **Critical blocker** - Need decision or access
- 📊 **Weekly summary** - Progress report

Do NOT message for:
- Routine progress
- Minor bugs
- Normal development

---

## ✅ Activation Checklist

- [ ] Create PROGRESS-LOG.md
- [ ] Create CURRENT-TASK.md  
- [ ] Create BUG-TRACKER.md
- [ ] Create demos/ directory
- [ ] Set up cron job for morning builds
- [ ] Verify project compiles
- [ ] Start Day 1 tasks

---

*"Ship something playable every day. Perfect is the enemy of done."*
