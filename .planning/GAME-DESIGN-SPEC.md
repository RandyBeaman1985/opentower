# OpenTower - Game Design Specification

**Version:** 1.0  
**Target:** Faithful SimTower recreation with modern refinements  
**Genre:** Real-time simulation / Management  
**Platform:** Cross-platform (Web/Desktop)

---

## 1. Core Loop Definition

### 1.1 Moment-to-Moment Gameplay

The player operates in **real-time** with controllable speed (1x, 2x, 5x, pause):

**Primary Activities:**
1. **Observe** - Watch tenant movement, identify bottlenecks
2. **Diagnose** - Find problem areas (long wait times, stressed tenants)
3. **Plan** - Determine where to build, what to upgrade
4. **Build** - Place facilities, add elevators, expand lobbies
5. **Optimize** - Reprogram elevators, rearrange facilities
6. **React** - Handle emergencies (fires, security threats)

**Time Flow:**
- 24-hour day/night cycle (1 real minute = 15-30 game minutes, configurable)
- Weekday vs. weekend patterns (offices closed weekends, hotels busier)
- Quarterly evaluation days (every 3 game months)
- Real-time stress: player must keep up with growth

### 1.2 Decisions That Matter

**Strategic Decisions:**
- **Vertical vs. Horizontal Growth** - Tall narrow tower or wide spread?
- **Facility Mix** - Offices generate steady income; hotels are high-maintenance but lucrative
- **Elevator Strategy** - Local vs. express, how many cars, which floors
- **Population Gates** - When to push for next star rating vs. optimize current state

**Tactical Decisions:**
- **Elevator Programming** - Which floors does each car serve?
- **Emergency Response** - Which fire to fight first? Deploy security where?
- **Tenant Placement** - Group similar tenants? Spread out demand?
- **Cash Management** - Build now or save for better facilities?

**What Makes Decisions Satisfying:**
- **Visible Impact** - See wait times drop after adding elevator
- **Problem-Solving** - "Why is this area struggling?" → "Ah, needs express elevator!"
- **Optimization Puzzle** - "Can I serve 20 floors with 3 elevator shafts?"
- **Emergent Complexity** - Simple rules create deep strategic space

### 1.3 Time Pressure Dynamics

**Organic Pressure Sources:**
- **Rush Hours** - Morning (7-9 AM), lunch (12-1 PM), evening (5-7 PM)
- **Weekend Spikes** - Hotel checkout surge Sunday mornings
- **Growth Cascades** - More tenants → more elevator demand → more stress → moveouts
- **Evaluation Days** - Quarterly performance review affects star rating

**Pressure Release Valves:**
- **Pause Button** - Player can always pause to think
- **Speed Control** - Slow down during crisis, speed up during stable periods
- **Save/Load** - Not permadeath; can retry after disaster

**The "Plate-Spinning" Feel:**
- Multiple systems need attention
- Problems cascade if ignored (stressed tenant → vacant unit → lost income → can't afford fixes)
- But not overwhelming: one major issue at a time, usually
- Reward is achieving stable equilibrium, then pushing to next level

---

## 2. Elevator System Design

**This is the soul of SimTower.** Elevators must be:
- Realistically limited (capacity, speed)
- Player-programmable
- The main challenge and optimization puzzle

### 2.1 Elevator Types

#### Standard Elevator
- **Speed:** 1 floor/second
- **Capacity:** 8 people
- **Range:** Serves up to 30 floors in one shaft
- **Cost:** $50,000 per shaft + $10,000 per car
- **Max Cars per Shaft:** 6
- **Use Case:** Local service, low-to-mid floors

#### Express Elevator
- **Speed:** 2 floors/second
- **Capacity:** 15 people
- **Range:** Entire building (unlimited floors)
- **Cost:** $200,000 per shaft + $50,000 per car
- **Max Cars per Shaft:** 8
- **Use Case:** Sky lobbies, high-rise service
- **Special:** Can skip floors (only stops at programmed floors)

#### Service Elevator
- **Speed:** 0.5 floors/second
- **Capacity:** 4 people (but can transport goods/staff)
- **Range:** Up to 20 floors
- **Cost:** $30,000 per shaft + $5,000 per car
- **Max Cars per Shaft:** 3
- **Use Case:** Hotel service, maintenance staff, food delivery
- **Special:** Tenants won't use for daily commute

### 2.2 Elevator Programming Interface

**Per-Car Configuration:**
```
[Car ID] [Shaft A, Car 2]
┌─────────────────────────┐
│ Floors Served:          │
│ [x] Ground (Lobby)      │
│ [ ] 1                   │
│ [ ] 2                   │
│ [x] 3                   │
│ [x] 4                   │
│ [x] 5                   │
│ [ ] 6-8                 │
│ [x] 9 (Sky Lobby)       │
│                         │
│ Mode: ⦿ Auto  ○ Manual  │
│                         │
│ Priority:               │
│ ⦿ Balanced              │
│ ○ Pickup Priority       │
│ ○ Delivery Priority     │
└─────────────────────────┘
```

**Auto Mode (Recommended):**
- Car responds to call buttons dynamically
- Serves all enabled floors
- Uses simple algorithm: "Scan" direction (up then down)

**Manual Mode (Advanced):**
- Player directly clicks floors to send car
- For fine control during emergencies

**Programming Strategies:**
- **Zone Coverage:** Car 1 serves 1-5, Car 2 serves 6-10, etc.
- **Express + Local:** Express to sky lobby, locals within zone
- **Overlap:** Cars share middle floors for redundancy
- **Morning Rush Special:** All cars start at ground during 7-9 AM

### 2.3 Wait Time Mechanics

**Wait Time Calculation:**
```
Wait Time = Time from call button press to passenger boarding elevator
```

**Stress Thresholds:**
- **< 30 seconds:** No stress (green)
- **30-60 seconds:** Minor stress (yellow) - 1 stress point per occurrence
- **60-120 seconds:** Moderate stress (orange) - 3 stress points
- **> 120 seconds:** Severe stress (red) - 5 stress points + possible immediate moveout

**Wait Time Factors:**
- Number of cars in shaft
- Floors each car serves (more floors = longer between visits)
- Current passenger load (full cars can't pick up more)
- Distance to waiting passenger
- Competing demand (other people calling from other floors)

**Visual Feedback:**
- Waiting tenants tap foot, check watch
- Thought bubble shows growing frustration
- Wait time counter above head (appears after 20 seconds)
- Stressed tenants turn red

### 2.4 Capacity & Loading

**Boarding Behavior:**
- **Ideal Load Time:** 2 seconds per person (smooth)
- **Overcrowding:** If elevator is full, remaining people wait for next car
- **Destination Clustering:** Elevator stops at each destination floor (costs time)

**Capacity Crunch:**
```
Example: 50 office workers need to reach floors 10-15 by 9 AM.
- 1 standard elevator (cap 8): Needs 7 trips (~15 minutes) → Many late arrivals
- 2 standard elevators: 4 trips each (~8 minutes) → Most arrive on time
- 1 express elevator (cap 15): 4 trips (~6 minutes) → All arrive comfortably
```

**The Puzzle:**
"How do I move 200 people in 30 game-minutes without anyone waiting 2 minutes?"

### 2.5 The Art of Elevator Placement

**Core Principles:**

**1. Lobby Connectivity**
- Ground floor lobby is the source/sink for all traffic
- Wide lobby = more elevator shafts can connect
- Lobby must be continuous (no gaps)

**2. Sky Lobby Strategy**
- Build lobby on floor 15, 30, 45, etc.
- Express elevators serve only: Ground → Sky Lobby
- Local elevators serve: Sky Lobby → surrounding floors
- Reduces express elevator stops, improves flow

**3. Redundancy**
- Never rely on single elevator for critical path
- 2-3 cars per high-traffic shaft minimum
- Backup shaft for tall towers

**4. Proximity**
- Place elevators near tenant entrances
- Walk time counts toward total commute frustration

**5. Load Balancing**
- Separate shafts for separate zones
- Don't make everyone share one mega-shaft

**Example: Good Elevator Design for 30-Floor Tower**
```
Shaft A: Ground + Floors 1-10 (4 standard cars)
Shaft B: Ground + Floors 11-20 (4 standard cars)
Shaft C: Ground + Floor 15 (Sky Lobby) + 21-30 (2 express + 3 standard)
Shaft D: Ground → Sky Lobby only (3 express cars, fast shuttle)
```

**Example: Bad Design**
```
Shaft A: Ground + Floors 1-30 (2 standard cars)
→ Wait times exceed 3 minutes during rush hour
→ Mass moveouts
→ Tower fails
```

**Player Learning Curve:**
- Early game: Simple single-shaft works fine (floors 1-8)
- Mid game: Need multiple shafts, learn zone separation
- Late game: Master sky lobbies and express strategies

---

## 3. Tenant Simulation

Tenants are the lifeblood of the tower. They follow daily schedules, accumulate stress, and evaluate their satisfaction.

### 3.1 Tenant Types & Schedules

#### Office Workers
**Daily Routine (Weekdays):**
- 8:00 AM - Arrive at ground lobby
- 8:00-8:30 AM - Take elevator to office
- 12:00 PM - Leave for lunch (lobby or food court)
- 1:00 PM - Return to office
- 5:00 PM - Leave office for ground lobby
- 5:00-5:30 PM - Depart building

**Weekends:** Offices closed, no traffic

**Income:** $10,000/quarter per office unit (automatic)

**Stress Sources:**
- Long elevator waits (especially morning arrival)
- No nearby food options (must leave building for lunch)
- Frequent fire alarms

#### Hotel Guests
**Daily Routine:**
- Check-in: Random times (weighted 3-6 PM)
- Check-out: Morning (weighted 8-11 AM)
- Avg Stay: 1-3 nights
- Activity: Leave/return 1-3 times per day (shopping, dining)

**Income:** 
- $200-500 per night depending on hotel tier
- Payment on check-in (full stay)

**Stress Sources:**
- Slow check-in elevator service
- Noise from nearby facilities
- Poor maintenance (broken units)
- Security incidents

**Occupancy Rate:**
- Displayed per hotel unit (0-100%)
- Affected by tower rating, stress events, room quality
- Low occupancy = warning sign

#### Food Court Customers
**Daily Routine:**
- Peak hours: 12-1 PM, 6-8 PM
- Source: 70% from tower tenants, 30% from outside visitors
- Avg visit: 30 minutes

**Income:** $50-150 per day per food court unit (based on traffic)

**Dependency:**
- Needs nearby population (offices, condos, hotel)
- Needs elevator access
- Benefits from multiple cuisine types nearby

#### Condo Residents
**Daily Routine:**
- Flexible hours (varied schedules)
- Some leave for work (9 AM-6 PM)
- Some stay home
- Weekend activity

**Income:** $30,000/quarter per condo unit (automatic)

**Stress Sources:**
- Elevator wait during peak hours
- Noise from commercial floors
- Lack of parking

#### Retail Shop Customers
**Daily Routine:**
- Peak: Evenings and weekends
- Driven by foot traffic (hotel guests, condo residents)

**Income:** $100-400/day per shop (traffic-dependent)

**Special:**
- Shops on ground floor attract outside visitors (small boost)

### 3.2 Stress Accumulation System

**Stress Points (per Tenant):**
- Range: 0-100
- Starts at 0 for new tenant
- Accumulates from negative events
- Decays slowly over time (-1 point per day if no new stress)

**Stress Thresholds:**
- **0-20:** Happy (green) - Normal behavior
- **21-40:** Slightly Stressed (yellow) - Occasional complaints
- **41-70:** Stressed (orange) - Frequent complaints, lower productivity
- **71-99:** Highly Stressed (red) - Moveout warning, very upset
- **100:** Immediate Moveout

**Stress Sources & Points:**

| Event | Stress Points | Frequency |
|-------|---------------|-----------|
| Elevator wait 30-60s | +1 | Per occurrence |
| Elevator wait 60-120s | +3 | Per occurrence |
| Elevator wait >120s | +5 | Per occurrence |
| Stuck in elevator (fire/emergency) | +10 | Per occurrence |
| No food nearby (office) | +2 | Per day |
| Noise from adjacent unit | +3 | Per day |
| Fire in same building section | +8 | Per occurrence |
| Security incident nearby | +5 | Per occurrence |
| Poor maintenance (broken facilities) | +3 | Per day |
| Missing amenities (parking, gym) | +1 | Per week |

**Stress Relief (only if stress > 0):**
- Fast elevator service (<15s wait) during week: -2 points
- Amenities nearby (gym, shops, food): -1 per week
- No incidents for 7 days: -5 points
- Tower rating increases: -10 points

### 3.3 Moveout Triggers

**Guaranteed Moveout:**
- Stress reaches 100
- Building condemned (too many safety violations)
- Player demolishes their unit

**Probabilistic Moveout (weekly check):**
- Stress 71-90: 20% chance per week
- Stress 91-99: 50% chance per week

**Moveout Consequences:**
- Vacant unit (no income)
- Must wait for new tenant (1-7 days depending on tower rating)
- New tenant sees "recent moveout" and starts with +10 stress
- Multiple moveouts damage tower reputation (harder to attract tenants)

**Vacancy Cascade:**
- High stress → moveouts → vacant units → less income → can't fix problems → more stress
- This is the "death spiral" players must avoid

### 3.4 Evaluation Day Mechanics

**Occurs:** Every 3 game months (quarterly)

**Evaluation Factors:**
1. **Population:** Total number of tenants
2. **Average Stress:** Mean stress across all tenants
3. **Facility Diversity:** Variety of tenant types
4. **Income Stability:** Consistent revenue stream
5. **Safety Record:** Number of incidents (fires, security)
6. **Elevator Performance:** Average wait times

**Scoring:**
```
Base Score = Population / 10
Stress Penalty = (Average Stress / 10) × -1
Diversity Bonus = (Number of different facility types) × 2
Incident Penalty = (Fires + Security Incidents) × -5
Elevator Bonus = (100 - Average Wait Time in seconds) / 2

Total Score = Sum of above
```

**Star Rating:**
- 1★: Tutorial (automatic)
- 2★: Score ≥ 50, Population ≥ 100
- 3★: Score ≥ 150, Population ≥ 300
- 4★: Score ≥ 300, Population ≥ 600
- 5★: Score ≥ 500, Population ≥ 1000
- TOWER: Score ≥ 1000, Population ≥ 2000, all facility types present

**Evaluation Day Drama:**
- Game pauses
- Report card screen with grades for each category
- Celebratory fanfare if star rating increases
- Somber music if rating drops
- Unlocks new facilities if rating increased

**Player Strategy:**
- Push population before evaluation
- Fix problems (reduce stress) in week before
- Evaluation day is "report card" - validates player success

---

## 4. Economic Balance

Money is the constraint that forces difficult decisions.

### 4.1 Income Timing

**Daily Income (Cash Flow):**
- **Hotel Rooms:** Payment on check-in (stochastic, varies daily)
- **Food Courts:** End of day (based on customer count)
- **Retail Shops:** End of day (traffic-dependent)

**Quarterly Income (Stable):**
- **Offices:** $10,000 per unit (paid on evaluation day)
- **Condos:** $30,000 per unit (paid on evaluation day)
- **Parking:** $5,000 per unit (paid on evaluation day)

**Income Display:**
- Running daily revenue ticker (top of screen)
- Projected quarterly income (based on current occupancy)
- Cash on hand (player's spendable money)

### 4.2 Costs

**Construction Costs:**

| Facility | Cost | Income Type |
|----------|------|-------------|
| Office (1 floor) | $80,000 | Quarterly rent |
| Hotel Room | $100,000 | Nightly rate |
| Condo | $150,000 | Quarterly rent |
| Fast Food | $40,000 | Daily (low margin) |
| Restaurant | $80,000 | Daily (high margin) |
| Retail Shop | $60,000 | Daily (traffic-based) |
| Parking (per space) | $20,000 | Quarterly rent |
| Movie Theater | $200,000 | Daily (weekend spikes) |
| Gym | $120,000 | Quarterly memberships |
| Standard Elevator Shaft | $50,000 | None (infrastructure) |
| Express Elevator Shaft | $200,000 | None (infrastructure) |
| Elevator Car (standard) | $10,000 | None |
| Elevator Car (express) | $50,000 | None |

**Maintenance Costs:**
- **Base:** 1% of total building value per quarter
- **Per Tenant:** $50/quarter (utilities, janitorial)
- **Emergency Repairs:** $5,000-50,000 depending on damage

**The Balancing Act:**
- Early game: Barely breaking even, every decision matters
- Mid game: Profitable but need big investments (express elevators)
- Late game: Rich but dealing with complexity at scale

### 4.3 Star Rating Unlock Requirements

**1★ (Starting Rating):**
- **Available:** Office, Fast Food, Hotel (1-star), Stairwell
- **Max Height:** 10 floors
- **Focus:** Learn basics, stay profitable

**2★ (Score ≥ 50, Pop ≥ 100):**
- **Unlocks:** Hotel (2-star), Condo, Retail Shop, Standard Elevator (2nd shaft), Parking
- **Max Height:** 20 floors
- **Focus:** Diversify revenue, introduce elevator management

**3★ (Score ≥ 150, Pop ≥ 300):**
- **Unlocks:** Restaurant (fine dining), Hotel (3-star), Office (large), Express Elevator, Sky Lobby
- **Max Height:** 40 floors
- **Focus:** Vertical growth, sky lobby strategy

**4★ (Score ≥ 300, Pop ≥ 600):**
- **Unlocks:** Hotel (4-star), Luxury Condo, Movie Theater, Gym, Security Office
- **Max Height:** 60 floors
- **Focus:** Luxury amenities, security becomes important

**5★ (Score ≥ 500, Pop ≥ 1000):**
- **Unlocks:** Hotel (5-star), Penthouse Suite, Medical Office, Cathedral (top floor vanity)
- **Max Height:** 100 floors
- **Focus:** Prestige, end-game content

**TOWER (Score ≥ 1000, Pop ≥ 2000, all types present):**
- **Unlocks:** Victory condition, monument/statue cosmetic, unlimited height (if you dare)
- **Focus:** You've mastered SimTower. Go bigger or optimize to perfection.

### 4.4 Optimal Build Orders

**Example Early Game (1★):**
```
Day 1: 
  - Build 2 office floors
  - Build 1 fast food
  - Build 1 hotel (1-star) 
  - Add 2nd car to starting elevator
  Money: ~$200,000 → $0

Day 7 (first week income):
  - Hotel income: ~$1,500
  - Food: ~$500
  Total: ~$2,000
  
Quarter 1 Evaluation:
  - Office rent: $20,000
  - Build 2 more offices, 2 more hotels
  - Add 2nd elevator shaft

Quarter 2: Hit 2★, unlock condos
```

**Example Mid Game (3★):**
```
Quarter 8:
  - 15 office floors
  - 10 hotel units (mix of 2★ and 3★)
  - 3 restaurants, 2 retail shops
  - 2 condo floors
  - Population: ~400
  
Strategy:
  - Build express elevator (unlock just obtained)
  - Create sky lobby at floor 15
  - Expand upward (floors 16-25)
  - Push to 600 population for 4★
```

**Economic Rhythm:**
- Quarterly rent windfalls let you build in bursts
- Daily income (hotels/food) keeps you liquid between quarters
- Big purchases (express elevators) require saving multiple quarters

---

## 5. Event System

Random events add unpredictability and drama. Player must respond to crises.

### 5.1 Fire Mechanics

**Fire Start Conditions:**
- **Base Chance:** 0.1% per facility per day
- **Increased Risk:**
  - High-density floors: +0.1%
  - Poor maintenance: +0.2%
  - No sprinklers: +0.3%
  - Kitchen facilities (restaurants, hotels): +0.15%

**Fire Spread:**
- Fire starts in one unit
- Spreads to adjacent units (horizontally) every 30 seconds
- Spreads vertically (up) if no fire break (lobby floors block spread)
- Tenants in fire zone: Stress +10, attempt to evacuate via stairs/elevators
- Trapped tenants (elevator or blocked exit): Stress +50, possible death

**Player Response:**
1. **Alert:** Red flashing unit, alarm sound
2. **Dispatch:** Click fire to send fire crew (costs $1,000 per dispatch)
3. **Containment:** Fire crew takes 1-3 minutes to arrive and extinguish
4. **Damage:** Burnt unit must be repaired ($5,000-20,000) or demolished

**Fire Prevention:**
- **Sprinklers:** Unlocked at 3★, $10,000 per floor, auto-extinguish 80% of fires
- **Fire Stairs:** Required every 15 floors, provide evacuation route
- **Fire Lobby:** Lobby floors act as fire breaks (stop vertical spread)

**Consequences:**
- Tenants in affected area: High stress
- Death (rare but possible): Tower rating penalty, bad press
- Uncontrolled fire can destroy multiple floors (financial disaster)

### 5.2 Security / Terrorism Events

**Triggers:**
- **Population > 500:** Security events become possible
- **Base Chance:** 0.05% per day
- **Increased Risk:**
  - No security office: +0.1%
  - High-value targets (5★ hotel, VIP): +0.05%
  - Poor reputation: +0.05%

**Event Types:**

**1. Bomb Threat**
- Warning received (30 seconds to respond)
- Player must evacuate affected floor (click "Evacuate" button)
- If evacuated: No damage, stress +10 for affected tenants
- If not evacuated: Explosion (unit destroyed, casualties, stress +50)

**2. Terrorist Intrusion**
- Armed individual enters tower
- Player must dispatch security
- Security response time: 1-2 minutes
- If successful: Threat neutralized, stress +5
- If failed: Hostage situation, major stress, possible casualties

**3. Theft**
- Retail shop or hotel robberies
- Automatic if no security
- Loss: $5,000-20,000
- Stress to nearby tenants: +3

**Security Office:**
- Unlocked at 4★
- Cost: $150,000
- Benefit: Reduces security event chance by 90%, faster response
- Must be placed (takes up space like any facility)

**Player Strategy:**
- Ignore security early game (rare events, can't afford)
- Must invest by 4-5★ (frequent events will cripple tower)

### 5.3 VIP Visits

**Triggers:**
- **Star Rating:** Higher rating = more frequent VIPs
- **Frequency:** 
  - 2★: 1 per year
  - 3★: 1 per quarter
  - 4★: 1 per month
  - 5★: 2 per month

**VIP Expectations:**
- Fast elevator service (<15 seconds)
- No incidents during visit (fire, security)
- Quality facilities (visit hotel, restaurant, shops)

**Visit Flow:**
1. Announcement: "VIP arriving in 2 minutes"
2. VIP enters ground lobby with entourage (5-8 people)
3. Takes elevator to various floors (random itinerary)
4. Stays 10-20 game minutes
5. Departs

**Success Rewards:**
- Cash bonus: $10,000-50,000 (based on rating)
- Temporary boost: +10% hotel occupancy for next week
- Reputation boost: Easier to attract tenants

**Failure Consequences:**
- VIP waits >60s for elevator: "Disappointed" (no reward)
- Incident during visit: "Outraged" (-$20,000, reputation hit)

**Player Strategy:**
- Watch for VIP alerts
- Pre-position elevator at ground floor
- Ensure no emergencies are active
- VIPs are high-stakes but lucrative

### 5.4 Seasonal Events

**Christmas (December):**
- Hotel demand +30%
- Retail shop income +50%
- Decorations appear (cosmetic)
- Special event: "Santa Visit" (VIP variant, bonus for children's facilities)

**New Year (January):**
- Increased move-ins (fresh starts)
- Tenant stress reset by -20% (optimism)
- Good time to push for new star rating

**Summer (June-August):**
- Lower hotel demand (-10%, vacation season)
- Movie theater demand +40%
- Cooling costs +$5,000/quarter

**Halloween (October):**
- Random "ghost" events (cosmetic, tenants see spooky things)
- Movie theater boost
- Possible "haunted elevator" prank (elevator randomly stops, no damage)

**Seasonal Strategy:**
- Anticipate demand shifts
- Build extra hotels before Christmas
- Use slow seasons to optimize infrastructure

---

## 6. Progression System

### 6.1 The Journey: 1★ to TOWER

**Star Rating as Gating Mechanic:**
- Stars unlock facilities, not just cosmetic achievement
- Each star is a significant milestone (takes hours of gameplay)
- TOWER rating is prestige victory condition

**Typical Playthrough Timeline:**
- **1★:** Tutorial phase (30 minutes - 1 hour)
- **1★ → 2★:** Learning elevator basics (1-2 hours)
- **2★ → 3★:** First major challenge (2-4 hours)
- **3★ → 4★:** Mastery of vertical growth (4-6 hours)
- **4★ → 5★:** Endgame push (6-10 hours)
- **5★ → TOWER:** Optimization/perfection (10-20+ hours)

**Total:** 10-30 hours for TOWER (depending on skill/optimization)

### 6.2 Population Milestones

| Population | Milestone | Reward |
|------------|-----------|--------|
| 100 | First Community | $10,000 bonus |
| 250 | Growing Tower | Express elevator discount (20% off) |
| 500 | Bustling Hub | Security unlocked (if 4★) |
| 750 | Major Attraction | VIP frequency doubled |
| 1000 | Metropolis | Luxury facilities unlocked |
| 1500 | City Icon | Construction costs -10% |
| 2000 | TOWER Eligible | Victory possible if all conditions met |
| 3000+ | Mega Tower | Bragging rights, leaderboard fame |

**Population Pressure:**
- More people = more elevator demand
- More people = more income
- Balancing growth with infrastructure is the core challenge

### 6.3 Building Unlocks (by Star Rating)

See Section 4.3 for detailed unlock table.

**Design Philosophy:**
- Early unlocks: Basic revenue generators
- Mid unlocks: Specialization and optimization tools
- Late unlocks: Luxury and prestige (not strictly necessary)
- Unlocks create sense of discovery and fresh mechanics

### 6.4 End-Game Content

**After Achieving TOWER:**

**1. Sandbox Mode Unlocked:**
- Infinite money toggle
- Instant build toggle
- Event frequency controls
- "Creative mode" for designing dream towers

**2. Challenge Scenarios:**
- **Speed Run:** Reach TOWER in minimal game time
- **Budget Challenge:** TOWER with $X starting money
- **Disaster Tower:** Frequent fires/security events
- **Super Tower:** 200+ floor achievement

**3. Prestige Cosmetics:**
- Cathedral/monument on top floor
- Custom exterior styles (Art Deco, Modern, Futuristic)
- Custom lobby themes
- Vanity items (fountain, statues)

**4. Leaderboards (if online):**
- Fastest TOWER
- Highest population
- Highest profit
- Most efficient (population per floor)

**5. Procedural Continuous Play:**
- Tower can continue growing past TOWER
- No cap on floors (engine permitting)
- See how tall/populated you can build before collapse
- "Death spiral" challenge: How long can you maintain 5000+ population?

**Keep Playing Because:**
- Optimization itch ("Can I do it better?")
- Sandbox freedom
- Challenge modes add replayability
- Watching a perfect tower hum along is satisfying

---

## 7. Core Metrics & Balancing Guidelines

### 7.1 Key Performance Indicators (KPIs)

**Player-Facing:**
- **Population:** Primary growth metric
- **Star Rating:** Progression marker
- **Cash:** Survival/investment capacity
- **Average Tenant Stress:** Health of tower
- **Average Elevator Wait:** Efficiency metric

**Developer Balancing Targets:**
- Elevator wait time should be #1 player challenge mid-game
- Reaching next star should feel earned (not grind)
- Economic death spiral should be rare but possible
- VIP visits should feel exciting, not stressful (unless player is failing)
- Fires should be occasional drama, not constant nuisance

### 7.2 Difficulty Curve

**1★ (Easy):**
- Forgiving
- Hard to fail
- Tutorial messages guide player

**2★ (Moderate):**
- First real challenge
- Player must learn elevator programming
- Possible to struggle

**3★-4★ (Challenging):**
- Must optimize
- Events become frequent
- Sky lobby strategy required for efficiency

**5★ (Hard):**
- Juggling multiple complex systems
- Large scale means emergencies are common
- Mastery required

**TOWER (Expert):**
- Maintaining 2000+ population is hard
- All systems must be optimized
- Endgame achievement

### 7.3 Playstyle Variety

**"Wide Tower" Strategy:**
- Horizontal growth (expand each floor fully)
- More elevators, simpler layout
- Lower risk, slower growth

**"Tall Tower" Strategy:**
- Vertical growth (push height quickly)
- Sky lobbies and express elevators critical
- Higher risk, faster progression if successful

**"Balanced" Strategy:**
- Mix of horizontal and vertical
- Most forgiving for new players

**"Min-Max" Strategy:**
- Optimal facility placement
- Perfect elevator programming
- Speedrun-oriented

**All Should Be Viable:** Player choice matters, no "wrong" approach.

---

## 8. User Interface & Feedback

### 8.1 Essential HUD Elements

**Top Bar:**
- Current date/time
- Speed controls (⏸ 1x 2x 5x)
- Cash on hand
- Population count
- Star rating

**Left Sidebar:**
- Build menu (categorized by facility type)
- Elevator programming button
- Emergency response (fire/security dispatch)

**Right Sidebar (Context Panel):**
- Selected tenant info (schedule, stress level)
- Selected facility info (income, occupancy)
- Selected elevator info (current location, passengers)

**Bottom Ticker:**
- Recent events log ("Office tenant moved in," "Fire on floor 12!")
- Income notifications

### 8.2 Visual Feedback Systems

**Color Coding:**
- **Green:** Happy tenants, efficient systems
- **Yellow:** Caution, minor issues
- **Orange:** Problems developing
- **Red:** Critical issues, immediate attention needed

**Overlays (Toggle):**
- **Stress Map:** Heat map showing tenant stress levels
- **Traffic Flow:** Lines showing tenant movement
- **Elevator Load:** Shows which elevators are overworked
- **Income View:** Highlight profitable vs. struggling facilities

**Animations:**
- Tenants walk at realistic pace (not instant teleport)
- Elevators visibly move between floors
- Fires animate and spread
- Construction happens over time (not instant)

**Audio Cues:**
- Elevator bell ding
- Fire alarm klaxon
- Cash register on income
- Stressed tenant grumbles
- VIP arrival fanfare
- Ambient tower sounds (crowd murmur, distant traffic)

### 8.3 Onboarding & Tutorials

**Intro Sequence:**
1. "Welcome to OpenTower. You've inherited an empty lot. Let's build your first tower."
2. Guided build: Place one office floor
3. "Tenants need elevators. Let's add one."
4. Watch first tenant move in and use elevator
5. "Now add a fast food place so they can eat."
6. Fast-forward to end of first quarter, collect rent
7. "You're profitable! Now it's your tower. Build your way."

**Progressive Tooltips:**
- Appear first time player encounters mechanic
- Can be disabled after first playthrough
- Non-intrusive (small popup, dismiss with click)

**Help System:**
- In-game wiki (accessed via ? button)
- Searchable articles on each facility, mechanic
- Video tutorials for complex topics (elevator programming)

---

## 9. Technical Considerations

### 9.1 Performance Targets

**Simulation Scale:**
- Support 5,000+ individual tenant agents
- 100+ elevator cars with real physics
- Real-time pathfinding for all tenants
- 60 FPS on modest hardware

**Optimization Strategies:**
- Tenant AI can be simplified when off-screen
- Elevator physics can use discrete simulation (not continuous)
- Spatial partitioning for collision/proximity checks
- LOD for distant floors (less detail when zoomed out)

### 9.2 Save/Load System

**Auto-save:**
- Every 5 game minutes (real-time configurable)
- On quit
- Before evaluation days

**Save File Contains:**
- Tower layout (all facilities, placements)
- Tenant data (type, stress, schedule position)
- Elevator programming
- Economic state (cash, income history)
- Event history
- Date/time

**Load Time:**
- < 2 seconds for typical tower
- Reconstruct simulation state exactly

### 9.3 Modding Support (Future)

**Expose:**
- Facility definitions (JSON)
- Event triggers and probabilities
- Economic balance values
- Cosmetic assets

**Allow Community:**
- Custom facility types
- Custom scenarios
- Visual themes
- Balance mods

---

## 10. Success Criteria

**This recreation is successful if:**

1. **Elevator Management is Compelling** - Players spend time thinking about elevator strategy, feel smart when they optimize it
2. **Progression Feels Rewarding** - Each star rating feels earned, unlocks are exciting
3. **Emergent Complexity** - Simple rules create deep strategic space
4. **"One More Turn" Factor** - Hard to stop playing, always another goal
5. **Nostalgia + Modern Polish** - Captures SimTower's magic, improves UX/clarity
6. **Accessible but Deep** - Easy to learn, hard to master
7. **Emotional Connection** - Player cares about their tower, stressed when it struggles, proud when it thrives

**Core Loop Test:**
"Does the player constantly face interesting decisions about where to build and how to optimize?"

If yes → Design succeeds.  
If no → Iterate.

---

## Appendix A: Facility Reference Table

| Facility | Size | Cost | Income | Unlocked |
|----------|------|------|--------|----------|
| Office (Small) | 1 floor | $80,000 | $10,000/qtr | 1★ |
| Office (Large) | 2 floors | $150,000 | $20,000/qtr | 3★ |
| Hotel 1★ Room | 1 unit | $100,000 | $200/night | 1★ |
| Hotel 2★ Room | 1 unit | $120,000 | $300/night | 2★ |
| Hotel 3★ Room | 1 unit | $150,000 | $400/night | 3★ |
| Hotel 4★ Room | 1 unit | $200,000 | $500/night | 4★ |
| Hotel 5★ Suite | 2 units | $300,000 | $800/night | 5★ |
| Condo | 1 unit | $150,000 | $30,000/qtr | 2★ |
| Luxury Condo | 2 units | $250,000 | $60,000/qtr | 4★ |
| Fast Food | 1 unit | $40,000 | $50-150/day | 1★ |
| Restaurant | 2 units | $80,000 | $200-500/day | 3★ |
| Retail Shop | 1 unit | $60,000 | $100-400/day | 2★ |
| Movie Theater | 3 units | $200,000 | $300-1000/day | 4★ |
| Gym | 2 units | $120,000 | $15,000/qtr | 4★ |
| Parking Space | 1 unit | $20,000 | $5,000/qtr | 2★ |
| Security Office | 2 units | $150,000 | $0 (service) | 4★ |
| Medical Office | 2 units | $100,000 | $15,000/qtr | 5★ |
| Cathedral | Top floor | $500,000 | $0 (vanity) | 5★ |

---

## Appendix B: Glossary

- **Sky Lobby:** An intermediate lobby floor that acts as a transfer point for express elevators
- **Express Elevator:** Fast, high-capacity elevator that serves long distances
- **Stress:** Numerical value (0-100) representing tenant dissatisfaction
- **Evaluation Day:** Quarterly review that determines star rating
- **Moveout:** When a tenant leaves due to high stress
- **Vacancy Cascade:** Downward spiral where moveouts lead to more problems
- **Rush Hour:** Peak elevator demand periods (morning, lunch, evening)
- **Fire Break:** A lobby floor that stops vertical fire spread
- **TOWER Rating:** The ultimate 5-star+ achievement (100 stars internally)

---

**End of Specification**

*This document is a living design guide. As implementation progresses, update this spec with lessons learned, balance changes, and new ideas.*
