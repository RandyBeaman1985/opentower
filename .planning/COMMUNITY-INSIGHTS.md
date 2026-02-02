# SimTower Community Insights
**Source:** Wikipedia, StrategyWiki, Project Highrise Steam Forums, Competitor Analysis  
**Date:** 2025-01-30

---

## Key Historical Facts (From Wikipedia)

### The Origin Story
> "SimTower was built around an **elevator simulation program**."  
> — Wikipedia

**Critical insight:** The game literally started as an elevator algorithm test. This isn't just a feature — it's THE CORE. OpenTower must get elevators right or fail.

### Yoot Saito's Research Problem
> "To research the gameplay, Saito contacted an elevator company to learn about elevator scheduling and management. However, **the company declined to provide the information**."

He had to figure out elevator algorithms from scratch. We have OpenSkyscraper and Towerz to learn from — a huge advantage.

---

## Core Mechanics (Verified from Multiple Sources)

### Elevator Constraints (MUST IMPLEMENT)

| Constraint | Value | Source |
|------------|-------|--------|
| Standard elevator max span | **30 floors** | Wikipedia, StrategyWiki |
| Express elevator span | Entire building | Wikipedia |
| Lobby transfer interval | Every 15 floors | Wikipedia |
| Elevator modes | Express, Up, Down (time-based) | StrategyWiki |

**Design implication:** 30-floor limit FORCES strategic thinking. Without this, the game loses its puzzle.

### Stress System (VERIFIED)

| Stress Level | Color | Status |
|--------------|-------|--------|
| Low | **Black** | Normal/satisfied |
| Medium | **Pink** | Getting frustrated |
| High | **Red** | About to leave |

**Critical:** Original docs say "pink" — NOT orange, NOT yellow. This is the authentic color progression.

### Building Limits

| Metric | Value |
|--------|-------|
| Max floors above ground | **100** |
| Max basement floors | **9** |
| TOWER status | Cathedral at top of 5★ with all levels developed |

---

## Random Events (Must Implement Core Set)

### Verified Events

| Event | Trigger | Resolution |
|-------|---------|------------|
| **Fire** | Random, increased by no sprinklers | Security (free, unreliable) or Fire Dept (costly, guaranteed) |
| **Bomb Threat** | Terrorism | Pay ransom OR security finds bomb before detonation |
| **VIP Visit** | Random (more frequent at higher stars) | Good experience → star advancement |
| **Cockroach Infestation** | Uncleaned hotel rooms | Housekeeping |
| **Gold Treasure** | Digging underground | Bonus funds |
| **Santa Claus** | End of Q4 yearly | Cosmetic (flies across tower) |

### Events to SKIP for v1.0
- Terrorism/bomb threats (legal/PR complexity)
- Cockroach infestations (requires housekeeping loop)
- Santa Claus (nice-to-have, not core)

### Events to KEEP for v1.0
- Fire (dramatic, teaches player)
- VIP visits (progression mechanic)
- Gold treasure (reward for underground building)

---

## Original Criticisms (Learn From History)

### From 1995 Reviews (Wikipedia Sources)

| Criticism | Source | Our Solution |
|-----------|--------|--------------|
| "Lack of documentation made it harder to learn" | South China Morning Post | Comprehensive tutorial (30 min guided) |
| "Game speed too slow" | Multiple reviewers | Speed controls (1x, 2x, 4x, 10x) |
| "Long wait before earning income" | San Diego Union-Tribune | Earlier income feedback, smaller initial investments |
| "Complaints from tenants — specific reasons never given" | South China Morning Post | Clear feedback UI ("Wait time too long: 2:15") |
| "Lacks the bustling interactivity of previous Sim games" | Next Generation | More visual activity, animations |
| "Lack of pre-built towers and scenarios" | The Age | Challenge scenarios, starter templates |

### Modern Project Highrise Complaints (Steam Forums 2024-2026)

| Complaint | Frequency | Our Solution |
|-----------|-----------|--------------|
| "Building sizes not clear" | Common | Ghost preview with dimensions |
| "Can't build multiple maintenance rooms" | Multiple threads | Clear service coverage UI |
| "Lost prestige from evictions unexpectedly" | Recent | Warning before irreversible actions |
| "Tile cap frustration (3500 tiles)" | Active discussion | Clear limit display, no hidden caps |
| "No sustainable income besides rent" | Oct 2025 | Varied income sources, clear economics |
| "Autosave overwrote my progress" | Jan 2025 | Manual save slots + autosave |

---

## What Made SimTower Special (Community Consensus)

### The "Magic Sauce" Identified

1. **Elevator as THE Game**
   - Not an afterthought like Project Highrise
   - The core puzzle, not a utility

2. **Visible Stress**
   - Red dots on people = immediate feedback
   - You SEE the problem, not read about it

3. **VIP Evaluations**
   - Dramatic moments
   - External validation of your work

4. **Cathedral Endgame**
   - Clear ultimate goal
   - Wedding ceremony reward

5. **The "Zen" Factor**
   - Mesmerizing to watch
   - Players describe watching without acting
   - The "ant farm" effect

### What Project Highrise Got Wrong (Community Consensus)

> "Numbers with graphics on top"  
> "Soulless"  
> "Elevators are just utilities"  
> "~8 hours of content before repetition"

**Our positioning:** "The SimTower successor that gets elevators right."

---

## Community-Requested Features (From Various Sources)

### High Priority (Multiple Requests)

| Feature | Why Players Want It |
|---------|---------------------|
| **Multiple save slots** | Experimentation without losing progress |
| **Clear building dimensions** | Planning before placement |
| **Undo button** | Mistake recovery |
| **Statistics/graphs** | Understanding performance over time |
| **Speed controls with 10x** | Getting through slow periods |
| **Challenge scenarios** | Replayability, skill testing |

### Medium Priority

| Feature | Why Players Want It |
|---------|---------------------|
| **Heat maps** | Visualizing stress/traffic |
| **Elevator efficiency stats** | Optimization feedback |
| **Income breakdown** | Understanding economics |
| **Tower sharing/screenshots** | Social/community aspect |

### Low Priority (Nice-to-Have)

| Feature | Notes |
|---------|-------|
| Weather effects | Cosmetic |
| Seasonal decorations | Cosmetic |
| Custom building skins | Post-launch content |

---

## Community Platform Observations

### r/SimTower Subreddit
- Small but dedicated community (couldn't access directly due to rate limiting)
- Nostalgic player base looking for modern experience
- Active discussions about clones and successors

### Project Highrise Community (Steam)
- 1,588 threads, 6 sub-forums
- Active modding community
- Players still engaged 8 years after release (2024-2026)
- Seeking "the next SimTower" — opportunity for OpenTower

### Key Insight
> The SimTower community is **underserved**. Project Highrise captured market share but not hearts. There's room for a game that captures the original's magic.

---

## Additions to OpenTower Plan

Based on community research, add these to the plan:

### Must-Have (v1.0)

1. **30-floor elevator limit** — Non-negotiable, this IS the game
2. **Black → Pink → Red stress** — Use authentic colors
3. **VIP visits** — Critical progression mechanic
4. **Fire events** — Drama without complexity
5. **Multiple save slots** — Community expectation
6. **Undo (50 steps)** — Mistake recovery
7. **Clear building dimensions** — Ghost preview with sizes
8. **Speed controls (1x, 2x, 4x, 10x)** — Address slow game complaint
9. **Income breakdown UI** — Address "why am I poor?" confusion

### Should-Have (v1.1)

10. **Challenge scenarios** — Replayability
11. **Heat maps** — Traffic/stress visualization
12. **Tower sharing** — Screenshots, layouts
13. **Cathedral endgame** — Ultimate goal
14. **Gold treasure** — Underground reward

### Could-Have (v1.2+)

15. Bomb threats (with legal review)
16. Cockroach infestations
17. Santa Claus
18. Seasonal events
19. Custom skins

---

## Updated Differentiation Statement

Based on community research:

> **OpenTower is the SimTower successor that gets elevators right — where elevator management is the core puzzle, not a utility, and every decision creates visible, satisfying results.**

---

*"SimTower was built around an elevator simulation program."*  
*— Wikipedia*

*Everything else is secondary.*
