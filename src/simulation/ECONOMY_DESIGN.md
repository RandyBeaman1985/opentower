# Economy System Design - OpenTower

## Overview
The economy system is the **backbone** of OpenTower's gameplay loop. Money isn't just a number — it's a constant pressure that shapes every decision you make.

Inspired by SimTower (1995), this system creates three distinct phases of gameplay:
- **Early Game:** TIGHT - Every dollar counts, construction is risky
- **Mid Game:** Strategic - Comfortable income, but growth requires planning
- **Late Game:** Complex - High income but massive operational costs

---

## Core Philosophy

### Money Must MATTER
- **Early game mistakes are painful** - Build the wrong thing? You'll feel it for quarters.
- **Growth requires risk** - Expanding means taking on more expenses before income arrives.
- **Success breeds complexity** - More buildings = more maintenance, staff, utilities.

### Quarterly Rhythm
Following SimTower's design:
- **Quarters = 15 game-minutes** (900 ticks at 60 ticks/min)
- **4 quarters = 1 game-day** (1 hour of game time)
- Rent collected at the **start** of each quarter
- Expenses deducted immediately after collection

---

## Income Sources

### 1. Office Rent (Quarterly)
**Base:** Varies by office config (~$10,000/quarter)  
**Floor Bonus:** +2% per floor above ground (capped at +50%)  
**Occupancy:** Only occupied desks pay rent (6 workers per office)

**Example:**
- Ground floor office, fully occupied: $10,000/quarter
- Floor 10 office, fully occupied: $12,000/quarter (+20%)
- Floor 25+ office, fully occupied: $15,000/quarter (+50% cap)

**Why it matters:** Higher floors are worth the construction cost!

---

### 2. Hotel Revenue (Daily Check-outs)
**Rates per night:**
- Single Room: $100/night
- Twin Room: $150/night (2 guests)
- Suite: $300/night (luxury)

**Mechanics:**
- Revenue collected at **checkout** (not quarterly)
- Accumulated and paid out at next quarter
- Longer stays = more revenue

**Example:**
- 10 single rooms, 2-night average stay: $2,000 revenue
- 5 suites, 3-night stays: $4,500 revenue

**Why it matters:** Hotels provide **daily cash flow** between quarterly collections.

---

### 3. Shop Revenue (Foot Traffic)
**Revenue:** $15 per customer visit  
**Tracked:** Each person who enters during business hours

**Example:**
- Busy shop (100 customers/quarter): $1,500 revenue
- Slow shop (20 customers/quarter): $300 revenue

**Why it matters:** Location is EVERYTHING. Ground floor near elevators > top floor corner.

---

### 4. Restaurant Revenue (Foot Traffic)
**Revenue:**
- Fast Food: $8 per customer
- Restaurant: $25 per customer

**Tracked:** Lunch rush (11am-2pm) and dinner (6pm-9pm) visits

**Example:**
- Fast food during lunch (50 customers): $400 revenue
- Restaurant during dinner (30 customers): $750 revenue

**Why it matters:** Food buildings need **population density** to thrive.

---

### 5. Condo Sales (One-Time)
**Base Price:** $80,000  
**Floor Bonus:** +$5,000 per floor  
**Market Variance:** ±15% random

**Example:**
- Ground floor condo: ~$80,000
- Floor 10 condo: ~$130,000
- Floor 30 condo: ~$230,000

**Why it matters:** **Instant cash injection** but no recurring income. Strategic trade-off vs. offices.

---

## Expenses

### 1. Elevator Maintenance (Per Shaft, Quarterly)
**Base Cost:** $2,000/quarter per shaft  
**Usage Multiplier:** +50% per 100 trips  
**Age Multiplier:** +1% per quarter of operation

**Example:**
- New elevator, low usage: $2,000/quarter
- 1-year-old elevator, heavy use (500 trips/quarter): $7,000/quarter
- 3-year-old elevator, very heavy use: $12,000/quarter

**Why it matters:** Elevators are the **largest operational cost** in late game. Too many = bankruptcy.

---

### 2. Staff Wages (Quarterly)
**Wages per quarter:**
- Security Office: $15,000
- Housekeeping: $12,000
- Hotel Desk Staff: $8,000 (1 per 20 hotel rooms)

**Example:**
- 2 security offices: $30,000/quarter
- 3 housekeeping rooms: $36,000/quarter
- 40 hotel rooms (2 desk staff): $16,000/quarter
- **Total:** $82,000/quarter

**Why it matters:** Service buildings are **money sinks**. Build them only when necessary.

---

### 3. Utilities (Scale with Size)
**Costs per quarter:**
- Base (lobby/ground systems): $5,000
- Electricity per floor: $500
- Electricity per person: $50
- Water per person: $30

**Example:**
- 10-floor tower, 100 people: $5,000 + $5,000 + $5,000 + $3,000 = **$18,000/quarter**
- 50-floor tower, 500 people: $5,000 + $25,000 + $25,000 + $15,000 = **$70,000/quarter**

**Why it matters:** **Growth isn't free**. Bigger towers = higher baseline costs.

---

## Financial Events

### 1. Tenant Departures
**Trigger:** Building stress ≥ 80%  
**Chance:** 5% per quarter while stressed  
**Effect:** Building becomes vacant, income lost

**Causes of stress:**
- Slow elevators (long wait times)
- Noise complaints (condos near restaurants)
- Poor maintenance (lack of housekeeping)

**Why it matters:** **Happiness = money**. Ignore tenants, lose income.

---

### 2. Bankruptcy Mechanics
**Grace Period:** 3 game-days (12 quarters) of negative funds  
**Warnings:**
- 1st warning: Funds < -$50,000
- 2nd warning: Funds < -$100,000
- 3rd warning: Funds < -$200,000

**Game Over:** If still negative after grace period

**Why it matters:** Early game is **TIGHT**. One bad quarter can spiral into bankruptcy.

---

## Progression Design

### Phase 1: Early Game (Quarters 1-20)
**Starting Funds:** $2,000,000  
**Goal:** Break even, then profit

**Challenges:**
- Construction is expensive relative to cash on hand
- Few tenants = low income
- Can't afford mistakes

**Strategy:**
- Start with **2-3 offices** ($40K each = $120K investment)
- Build **1 elevator shaft** early ($100K+ but mandatory)
- Add **lobby segments** to connect everything
- **Wait** for tenants to move in and start paying rent

**Expected Income Q1:**
- 3 offices, 50% occupied: ~$15,000/quarter
- **Net profit:** ~$5,000/quarter (after utilities)

**Feeling:** **Anxious**. Every construction decision is risky. Cash is TIGHT.

---

### Phase 2: Mid Game (Quarters 20-80)
**Typical Funds:** $500K - $2M  
**Goal:** Expand strategically, unlock new buildings

**Challenges:**
- Elevator capacity becomes a bottleneck
- Need to balance income buildings vs. service buildings
- More floors = higher utilities

**Strategy:**
- Add **2-3 more elevator shafts** to handle traffic
- Build **hotels** for steady daily income
- Add **restaurants/shops** near high-traffic areas
- Build **security/housekeeping** to keep tenants happy

**Expected Income Q40:**
- 20 offices: ~$200,000/quarter
- 10 hotel rooms: ~$20,000/quarter
- 3 restaurants: ~$15,000/quarter
- **Total income:** ~$235,000/quarter
- **Expenses:** ~$50,000/quarter (elevators + staff + utilities)
- **Net profit:** ~$185,000/quarter

**Feeling:** **Strategic**. Income is comfortable, but growth requires planning. Can't just spam buildings.

---

### Phase 3: Late Game (Quarters 80+)
**Typical Funds:** $5M+  
**Goal:** Maximize efficiency, reach 5-star rating

**Challenges:**
- **Massive operational costs** (10+ elevators, tons of staff)
- Utilities are astronomical (500+ people)
- Complexity management (too many buildings to track)

**Strategy:**
- Optimize elevator placement to reduce maintenance
- Build **cathedral** for prestige
- Balance high-income buildings (suites, party halls) with costs
- Focus on **occupancy rate** over raw quantity

**Expected Income Q100:**
- 100 offices: ~$1,500,000/quarter
- 50 hotel rooms: ~$150,000/quarter
- 10 restaurants: ~$80,000/quarter
- 20 condos sold: ~$3,000,000 (one-time spike)
- **Total income:** ~$1,730,000/quarter
- **Expenses:** ~$400,000/quarter (20 elevators + staff + utilities)
- **Net profit:** ~$1,330,000/quarter

**Feeling:** **Wealthy but complex**. Money flows in, but so do expenses. Need to manage carefully.

---

## Balance Checkpoints

### Checkpoint 1: "Can I afford a 2nd office?"
**When:** Quarter 2-3  
**Test:** Do you have $40K to spare?  
**Expected:** No, need to wait 1-2 quarters to save up  
**Result:** ✅ Money feels tight

### Checkpoint 2: "Should I add a 2nd elevator?"
**When:** Quarter 10-15  
**Test:** Is first elevator getting crowded?  
**Expected:** Yes, but it costs $100K+ and adds $2K/quarter maintenance  
**Result:** ✅ Growth requires risk

### Checkpoint 3: "Am I turning a profit?"
**When:** Quarter 20  
**Test:** Is net profit positive every quarter?  
**Expected:** Yes, $50K-$100K/quarter profit  
**Result:** ✅ Progression feels rewarding

### Checkpoint 4: "Can I survive a bad quarter?"
**When:** Quarter 30  
**Test:** Lose 3 major tenants (stress departures), can you recover?  
**Expected:** Yes, but funds drop significantly  
**Result:** ✅ Mistakes have consequences but aren't instant game-over

### Checkpoint 5: "Are operational costs meaningful?"
**When:** Quarter 60  
**Test:** Are expenses 20-30% of income?  
**Expected:** Yes, $200K-$400K expenses on $1M income  
**Result:** ✅ Late game isn't "infinite money mode"

---

## Integration Points

### HotelSystem.ts
```typescript
// When guest checks out:
economySystem.registerHotelCheckout('hotelSingle', nightsStayed);
```

### PopulationSystem.ts
```typescript
// When person visits food building:
economySystem.registerFoodCustomer(buildingId);

// When person visits shop:
economySystem.registerShopCustomer(buildingId);

// When condo is purchased:
const salePrice = economySystem.registerCondoSale(floorLevel);
tower.funds += salePrice; // Immediate payment
```

### ElevatorSystem.ts
```typescript
// When elevator completes a trip:
economySystem.registerElevatorTrip(elevatorId);
```

### Game.ts (Main Loop)
```typescript
// Every tick:
economySystem.update(tower, clock, currentTick);

// Query for UI:
const stats = economySystem.getEconomyStats(tower);
const pendingIncome = economySystem.getPendingIncome();
const bankruptcyState = economySystem.getBankruptcyState();
```

---

## UI Display Recommendations

### HUD - Always Visible
```
💰 $2,450,000  |  📈 +$185K/day  |  ⏰ Q47 (2:15 until collection)
```

### Financial Panel (Expandable)
```
INCOME (Last Quarter):
  Office Rent:        $200,000
  Hotel Revenue:      $ 20,000
  Shop Sales:         $  8,000
  Restaurant Sales:   $  7,000
  ────────────────────────────
  TOTAL:              $235,000

EXPENSES (Last Quarter):
  Elevators:          -$ 35,000
  Staff:              -$ 10,000
  Utilities:          -$  5,000
  ────────────────────────────
  TOTAL:              -$ 50,000

NET PROFIT:           $185,000
```

### Bankruptcy Warning (Popup)
```
⚠️  WARNING: NEGATIVE FUNDS!
Current Debt: $75,000
Grace Period: 8 quarters remaining

You must return to positive funds within
2 game-days or face bankruptcy!
```

---

## Tuning Knobs

If playtesting reveals balance issues, adjust these constants:

**Too Easy / Infinite Money:**
- Reduce `FLOOR_RENT_BONUS_PER_LEVEL` (currently 2%)
- Increase `ELEVATOR_BASE_MAINTENANCE` (currently $2K)
- Increase `UTILITY_COSTS.electricityPerFloor` (currently $500)

**Too Hard / Bankruptcy Too Fast:**
- Increase starting funds (currently $2M)
- Increase `BANKRUPTCY_GRACE_PERIOD_TICKS` (currently 12 quarters)
- Reduce `STAFF_WAGES` costs

**Late Game Too Easy:**
- Increase `ELEVATOR_USAGE_MULTIPLIER` (currently 0.5)
- Add per-floor maintenance costs
- Add "tax brackets" that increase with tower size

---

## Success Metrics

The economy system succeeds if:
1. ✅ Players feel **financial pressure** in early game
2. ✅ Players must **strategize** about construction timing
3. ✅ Late game wealth doesn't eliminate **operational costs**
4. ✅ Bankruptcy is a **real threat** but not unfair
5. ✅ Money feels **earned**, not given

---

## Credits

Design inspired by SimTower (1995) by Yoot Saito.  
Implemented for OpenTower by Claude (Anthropic) in 2025.

**"Money is the game. Everything else is just details."**
