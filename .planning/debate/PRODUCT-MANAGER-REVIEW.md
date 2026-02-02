# Product Manager Critical Review: OpenTower
**Reviewer:** Senior PM (15yr exp: SimCity, Cities Skylines, Two Point Hospital)  
**Date:** 2025-01-30  
**Verdict:** 🟡 CONDITIONAL PROCEED - Major scope reduction required

---

## Executive Summary

This project has **solid architecture** and **genuine passion**, but it's planning to boil the ocean. The documentation reads like someone who's played SimTower a hundred times but hasn't shipped a product in a competitive market. You're building a museum piece when you should be building a game people want to play *today*.

**The hard truth:** You're 20% "complete" with zero gameplay. That's not 20% complete—that's 0% complete with really nice scaffolding.

---

## 1. 🚨 SCOPE CREEP RISK: CRITICAL

### Current Scope Assessment

| Metric | Planned | Realistic for Indie/Solo | Gap |
|--------|---------|--------------------------|-----|
| Building types | 21 | 8-10 | 11+ over |
| Simulation pop | 15,000 | 2,000-3,000 | 5x over |
| Asset frames | 911+ | 150-200 | 4.5x over |
| Timeline | 7-8 months | 12-18 months (realistic) | 50%+ under |
| Events system | 15+ types | 3-4 | 4x over |

### The "99% SimTower Fidelity" Trap

**This is a product suicide mission.**

You're not Maxis in 1994 with a budget and team. "99% fidelity" means:
- Recreating bugs players remember fondly
- Implementing obscure systems nobody cares about (recycling center? cathedral?)
- Fighting legal/IP gray areas with an explicit clone

**What you should do:** Target **70% SimTower + 30% modern improvements**. Capture the *feeling*, not the checklist.

### What to CUT for MVP (Mandatory)

**REMOVE from v1.0:**
| Feature | Reason |
|---------|--------|
| Recycling Center | Niche, complex, nobody's favorite feature |
| Cathedral | Vanity only, not gameplay |
| Metro Station | Underground adds complexity for minimal payoff |
| Parking Garage | Cars aren't part of the vertical fantasy |
| Party Hall | Edge case income, not core loop |
| Seasonal Events | Nice-to-have, scope bloat |
| Terrorism Events | Legal/PR risk, fire is enough drama |
| 11 Shop Variants | Ship with 3, add rest post-launch |
| 5 Fast Food Variants | Ship with 2 |
| 4 Restaurant Variants | Ship with 2 |
| Service Elevator | Standard + Express is enough |
| Sky/Weather system | Clear sky only for v1.0 |

**Estimated scope reduction:** 40-50% of planned work.

---

## 2. 🎯 FEATURE PRIORITIZATION: The REAL MVP

### Your MVP Is Wrong

The MASTER-PLAN defines MVP as:
> "Place 3 building types, 50+ people use elevators, stress colors change"

**That's a tech demo, not an MVP.** An MVP needs to answer: *"Would someone play this for 30 minutes and want more?"*

### Actual Minimum Viable Product (4-Week Target)

**Core Loop Only:**
1. **Building placement:** Lobby, Office, Fast Food (3 types)
2. **One elevator type:** Standard only
3. **20-50 simulated people:** Not 15,000
4. **Stress visualization:** Simple color change
5. **Day/night cycle:** Visual only, no complexity
6. **Income:** Automatic, simple (rent on timer)
7. **Win state:** Reach 100 people (temporary goal)

**NOT in MVP:**
- Star progression
- Multiple elevator types
- Hotels (complex housekeeping loop)
- Events (fire, VIP)
- Save/load
- Sound
- Weather

### MVP Success Criteria (What to Measure)

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Session length | >15 minutes | Core loop is engaging |
| Restart rate | >30% | Players want to try again |
| "I had to solve a problem" | Yes | Strategic depth exists |
| "I understood what to do" | Yes | UX is clear |

---

## 3. 😤 PLAYER EXPERIENCE GAPS

### What Will Frustrate Players (Not Addressed)

#### 3.1 Onboarding Death

The tutorial plan is literally:
> "Welcome... build office... add elevator... watch tenant... fast-forward... now it's your tower."

**This is terrible.** Players will:
- Build elevators wrong (zone concept not explained)
- Not understand stress until too late
- Place buildings suboptimally and hit death spiral
- Quit before discovering the fun

**Solution:** Guided scenarios with failure-safe guardrails for first 30 minutes. Think *Two Point Hospital* intro.

#### 3.2 The "Why Is Everyone Stressed?" Problem

Your spec relies on players understanding *invisible systems*:
- Elevator wait times (not shown by default)
- Stress accumulation (hidden until critical)
- Traffic patterns (require observation)

**Players will blame the game, not their decisions.**

**Solution:** 
- Always-visible wait time indicators
- Stress preview when placing buildings
- "Elevator load" overlay on by default
- "Your elevators are overloaded" alert at 70% capacity

#### 3.3 Death Spiral with No Warning

Your cascade: High stress → moveouts → less income → can't fix → more stress → game over.

**But there's no circuit breaker.** Players will spiral from "fine" to "dead" in 3 game-days.

**Solution:**
- "DANGER: Tower at risk" warning at 40% vacancy
- Emergency loan option (with penalty)
- Slow-mo/pause when critical threshold hit
- "Rebuild advisor" suggests fixes

#### 3.4 Elevator Programming Is Too Complex

The programming interface in your spec requires understanding:
- Zone coverage
- Express vs local
- Overlap strategies
- Floor-by-floor toggles

**Casuals will never touch this.** Hardcore players will, but you need both.

**Solution:**
- "Auto-optimize" button (AI does it decently)
- Presets: "Local zone" / "Express shuttle" / "Balanced"
- Only expose full programming at 3★+

#### 3.5 No Clear Goal Visibility

Your progression is: "Reach score X and population Y for next star."

**Where is my progress?** Players need:
- Progress bar to next star
- "You need 47 more people and 30 less average stress"
- Celebration moments (not just evaluation day)

---

## 4. 💰 MONETIZATION: Sustainability Problem

### Current Model: None

This is a passion project with no revenue model. That's fine for a hobby, **dangerous for a 7-8 month commitment**.

### Realistic Options

| Model | Viability | Risk |
|-------|-----------|------|
| **Free + Donations** | Low | $0-500/month max |
| **Paid ($5-10)** | Medium | Needs marketing, Steam presence |
| **Free + Cosmetic IAP** | Medium-High | Needs store infrastructure |
| **Patreon during dev** | Medium | Requires community building |

### My Recommendation

1. **Phase 1 (MVP):** Free web demo, build audience
2. **Phase 2 (Polish):** Itch.io "pay what you want"
3. **Phase 3 (1.0):** Steam at $9.99

**Budget reality check:** At $0 revenue, this is a hobby. At $10K-50K (realistic indie ceiling), it's barely sustainable. Know what you're signing up for.

---

## 5. 🎮 DIFFERENTIATION: The "Why Not Project Highrise?" Problem

### Current Differentiators (Per Your Docs)

| Feature | OpenTower | Project Highrise |
|---------|-----------|------------------|
| Price | Free | $19.99 |
| Platform | Web | Desktop |
| Elevator focus | High | Medium |
| Graphics | Pixel art | Modern 2D |
| Nostalgia | SimTower clone | Spiritual successor |

### The Problem

**"Free SimTower clone" is not a product position.** It's a feature list.

### What Would Make This Worth Playing

#### Option A: "SimTower for a New Generation"
- Mobile-first (not web)
- Streamlined for 15-minute sessions
- Modern UX, classic mechanics
- **Differentiation:** Accessibility

#### Option B: "SimTower Hardcore"  
- Multiplayer leaderboards
- Challenge scenarios
- Speedrun mode with replays
- **Differentiation:** Competition

#### Option C: "SimTower Evolved"
- New building types (coworking, cloud kitchens, green energy)
- Climate/sustainability mechanics
- Modern tower problems (pandemic protocols?)
- **Differentiation:** Relevance

**Your current plan is Option D: "Exactly SimTower but in a browser."** 

That's a Wikipedia entry, not a product.

---

## 6. 📚 ONBOARDING: Insufficient

### Current Tutorial Plan (From Spec)

1. "Welcome to OpenTower"
2. Place one office floor
3. Add elevator
4. Watch tenant move
5. Add fast food
6. Collect rent
7. "Now it's your tower"

**Time to complete:** ~2 minutes

**Time until first interesting decision:** Unknown (probably 10+ minutes)

### What Good Onboarding Looks Like

**Two Point Hospital model:**
- 3 training scenarios (each teaches 1-2 concepts)
- Each is a mini-tower with pre-placed mistakes to fix
- Explicit: "This elevator is overcrowded. Add a second shaft."
- Rewards for completing tutorials (currency, cosmetic)

**Suggested OpenTower Tutorials:**

| Tutorial | Teaches | Duration |
|----------|---------|----------|
| 1. First Floor | Placement, income basics | 5 min |
| 2. Growing Pains | Stress, elevator capacity | 10 min |
| 3. Zoning Strategy | Multi-shaft, floor zones | 10 min |
| 4. Tower Under Fire | Emergency response | 5 min |
| 5. Freeplay Unlocked | - | - |

---

## 7. 🔄 RETENTION HOOKS: Weak

### What Keeps Players Coming Back?

Your spec mentions:
- Star progression (yes, but only 5 levels = ~10-30 hours then done)
- Sandbox mode (post-game, not retention)
- Leaderboards (marked "if online" = probably never)

### Missing Retention Mechanics

| Hook | Industry Standard | OpenTower |
|------|-------------------|-----------|
| Daily challenges | ✅ Common | ❌ Missing |
| Unlockable cosmetics | ✅ Common | ❌ Missing |
| Achievement system | ✅ Common | ❌ Missing |
| Procedural scenarios | ✅ Growing | ❌ Missing |
| Social sharing | ✅ Growing | ❌ Missing |

### Cheap Retention Adds

1. **Daily Challenge:** "Build the tallest tower with only $100K starting cash"
2. **Achievements:** "First moveout", "No deaths in 1 year", "100-floor tower"
3. **Screenshot mode:** Let players share towers (free marketing)
4. **Tower templates:** Save/load/share layouts
5. **Speed records:** "Fastest to 3★" leaderboard

---

## 8. 🌐 PLATFORM STRATEGY: Unclear

### Current Plan

> "Cross-platform (Web/Desktop)"

**This is not a strategy.** This is "we'll figure it out."

### Platform Reality Check

| Platform | Pros | Cons |
|----------|------|------|
| **Web** | Instant play, shareable | Performance ceiling, no Steam visibility |
| **Desktop (Electron)** | Better performance | Extra work, distribution headaches |
| **Steam** | Discovery, payments | $100 fee, review requirements |
| **Mobile** | Huge audience | Touch UI redesign, app store rules |

### My Recommendation

**Phase 1 (MVP):** Web only via itch.io  
**Phase 2 (1.0):** Web + Steam (Electron wrapper)  
**Phase 3 (Post-launch):** Mobile if retention proves strong

**DO NOT** try to ship mobile day one. The UI assumptions in your spec (right-click menus, hover states, detailed panels) are desktop-native.

---

## 9. 📋 ACTION ITEMS (Prioritized)

### Immediate (This Week)

1. ✏️ **Redefine MVP** - 4-week target, not 5-week
2. ✂️ **Cut 40% of scope** - Use my list above
3. 📊 **Define success metrics** - Before building more

### Short-term (Month 1)

4. 📖 **Design real tutorial** - 30 minutes of guided play
5. ⚠️ **Add warning systems** - Death spiral prevention
6. 🎯 **Pick a differentiation** - "Why OpenTower?"

### Medium-term (Month 2-3)

7. 📱 **Commit to platform** - Web-first, stop hedging
8. 🔄 **Design retention** - Daily challenges, achievements
9. 💰 **Revenue model** - Even if it's "donations"

### Long-term (Month 4+)

10. 🎨 **Reduce asset scope** - 150 images max for 1.0
11. 🧪 **Playtesting pipeline** - Weekly external feedback
12. 📣 **Marketing plan** - Devlogs, itch.io presence

---

## 10. Final Verdict

### The Good
- Architecture is solid
- Design spec shows deep understanding of source material
- Passion is evident
- Free AI asset pipeline is clever

### The Bad
- Scope is 2-3x too large
- No differentiation strategy
- Retention mechanics absent
- Revenue model undefined
- Timeline is fantasy

### The Ugly
- "99% fidelity" mindset will kill this project
- 20% completion with 0% gameplay is a warning sign
- Tech-first thinking instead of player-first

### Recommendation

**Proceed with MAJOR scope reduction.** 

Cut to a 6-week MVP. Get real players testing by Week 8. Kill your darlings (recycling center, metro, terrorism). Find your "why should I care?" answer.

If you can't answer "What makes this worth playing over Project Highrise or just emulating SimTower?" in one sentence, you don't have a product. You have a hobby.

That might be fine. But be honest about it.

---

*"A delayed game is eventually good, but a game designed by committee is forever bloated."*  
— Me, after shipping three management sims

**Review complete. Now go make something people want to play, not something that impresses other SimTower nerds.**
