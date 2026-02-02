# SimTower: The Vertical Empire - Complete Reference

*A comprehensive documentation of the 1994 Maxis classic, compiled from the SimTower Fandom Wiki, OpenSkyscraper source, player experience, and community knowledge.*

---

## Table of Contents

1. [Game Overview](#game-overview)
2. [Complete Facility List](#complete-facility-list)
3. [Star Rating System](#star-rating-system)
4. [Elevator System (The Core Mechanic)](#elevator-system-the-core-mechanic)
5. [People Simulation](#people-simulation)
6. [Evaluation System](#evaluation-system)
7. [Time System](#time-system)
8. [Events & Special Occurrences](#events--special-occurrences)
9. [Economy & Income](#economy--income)
10. [Graphics & Visual Style](#graphics--visual-style)
11. [Sound & Music](#sound--music)
12. [Win Conditions](#win-conditions)
13. [Known Bugs & Quirks](#known-bugs--quirks)
14. [Advanced Strategies](#advanced-strategies)

---

## Game Overview

**SimTower: The Vertical Empire** (known as *The Tower* in Japan) was developed by OPeNBooK Co., Ltd. and published by Maxis in November 1994 for Microsoft Windows and Mac OS 7. Designed by Yoot Saito, it's a construction and management simulation focused entirely on building and managing a vertical skyscraper.

**Core Gameplay Loop:**
- Build facilities (offices, condos, hotels, shops, restaurants, entertainment)
- Manage transportation (elevators, stairs, escalators)
- Keep tenants happy by managing stress, noise, access, and services
- Grow population to unlock new facilities and star ratings
- Ultimate goal: Reach "Tower" status with 15,000 population and a Cathedral

---

## Complete Facility List

### Transportation Infrastructure

#### **Lobby** (1 Star - Available at Start)
- **Cost:** $1,250 per segment ($5,000 for 4 segments)
- **Location:** Ground floor (Level 1) - mandatory
- **Optional:** Levels 15, 30, 45, 60, 75, 90 (Skylobbies)
- **Size:** Variable (1-4+ segments)
- **Cannot be deleted**
- **Purpose:** Main entrance/exit, elevator transfer point
- **Visual:** Changes appearance as tower rating increases
- **Special:** Multi-level lobbies possible with Ctrl (2-level) or Shift+Ctrl (3-level) - elevators cannot stop on intermediate floors

#### **Skylobby** (1 Star - Available at Start)
- Same as lobby but on floors 15, 30, 45, 60, 75, or 90
- **Critical for:** Express elevator transfers
- **Strategy:** Required for efficient tower organization beyond 15 floors

#### **Floor** (1 Star - Available at Start)
- **Cost:** $100 per segment
- **Purpose:** Hallways connecting facilities
- Sims walk along floors between rooms and transportation

#### **Stairs** (1 Star - Available at Start)
- **Cost:** $5,000 each
- **Upkeep:** None
- **Capacity:** Infinite
- **Travel Range:** Up or down 5 floors maximum
- **Speed:** Moderate
- **Can overlap:** Most rooms (not elevators)
- **Stackable:** Yes
- **Limit:** Combined stairs + escalators cannot exceed 64 total

#### **Escalators** (3 Stars)
- **Cost:** $20,000 each
- **Upkeep:** $5,000 per quarter
- **Capacity:** Infinite
- **Travel Range:** Up or down 7 floors (practical: 5 floors)
- **Speed:** Faster than stairs
- **Restriction:** Can ONLY connect to lobbies, food, and retail spaces
- **Preferred:** Sims prefer escalators over stairs
- **Limit:** Combined stairs + escalators cannot exceed 64 total

#### **Standard Elevator** (1 Star - Available at Start)
- **Cost:** $50,000 per shaft (not per car)
- **Upkeep:** $100 per car, per quarter
- **Capacity:** 12 people per car
- **Speed:** Moderate (3 floors/second)
- **Max Cars:** 8 per shaft
- **Service Range:** Any floor from B10 to 100
- **Recommended:** Service 15 floors max per shaft (e.g., 1-14, 15-29, 30-44)
- **Programming:** Weekday/Weekend schedules, 6 time periods per day
- **Settings:**
  - "Waiting Car Response" (1-15): Distance a moving car can be before new car dispatches
  - "Standard Floor Departure" (5-30 seconds): Wait time at floor before departing
- **Limit:** Max 24 total elevator shafts (including service elevators)

#### **Express Elevator** (3 Stars)
- **Cost:** $100,000 per shaft
- **Upkeep:** $150 per car, per quarter
- **Capacity:** 21 people per car
- **Speed:** Fastest (6 floors/second)
- **Max Cars:** 8 per shaft
- **Service Range:** Levels 1, 15, 30, 45, 60, 75, 90 + all sub-levels (B1-B10)
- **Restriction:** ONLY stops at 15-floor intervals and basements
- **Purpose:** Long-distance vertical transport to skylobbies
- **Strategy:** Use one express shaft per skylobby zone
- **Settings:** Same as standard elevators
- **Limit:** Counts toward 24 total elevator shaft limit

#### **Service Elevator** (2 Stars)
- **Cost:** $50,000 per shaft
- **Upkeep:** $100 per car, per quarter
- **Capacity:** Similar to standard
- **Speed:** Slow
- **Max Cars:** 8 per shaft
- **Restriction:** ONLY housekeepers can use
- **Service Range:** Any floor from B10 to 100
- **Purpose:** Transport housekeepers to clean hotel rooms
- **Not counted:** Does NOT count as legitimate transit path for tenants
- **Limit:** Counts toward 24 total elevator shaft limit

### Residential Facilities

#### **Condominium** (1 Star - Available at Start)
- **Cost:** $50,000 (9 segments)
- **Sale Price:** $100,000 default (adjustable to $125,000 max)
- **Population:** +3 per condo
- **Income:** One-time sale (profit: $50,000-$75,000)
- **Deletable:** Yes (but tenant buyback forces you to repurchase)
- **Underground:** No
- **Rent:** None (sold, not rented)
- **Special Mechanic:** If sims move out due to poor conditions/high stress, YOU must buy back at full sale price regardless of your cash reserves (bankruptcy risk!)
- **Purchase Hours:** 7 AM - 9 PM only
- **Tips:**
  - Can be built disconnected from transit to delay purchase (price manipulation)
  - Avoid placing above/below noisy facilities (offices, entertainment)
  - If "Conditions are terrible" status: Delete and rebuild OR set to minimum price
  - Most profitable facility in game if managed well
- **Known Bug:** Phantom sims can move into unsold condos during bomb threats, forcing buyback

#### **Hotel Room - Single** (2 Stars)
- **Cost:** $20,000 (8 segments)
- **Rent Options:** $500, $1,500, $2,000, $3,000 (daily)
- **Capacity:** 0-1 guest
- **Population:** 0-1
- **Deletable:** Yes
- **Underground:** No
- **Hours:** Check-in throughout day, check-out in morning
- **Maintenance:** Requires housekeeping or will become infested with roaches
- **Roaches:** Can only be removed by deleting room

#### **Hotel Room - Twin** (3 Stars)
- **Cost:** $50,000 (8 segments)
- **Rent Options:** $800, $2,000, $3,000, $4,500 (daily)
- **Capacity:** 0-2 guests
- **Population:** 0-2
- **Deletable:** Yes
- **Underground:** No
- **Other:** Same as Single Room

#### **Hotel Suite** (3 Stars)
- **Cost:** $100,000 (16 segments)
- **Rent Options:** $1,500, $4,000, $6,000, $9,000 (daily)
- **Capacity:** 0-2 guests (VIPs prefer suites)
- **Population:** 0-2
- **Deletable:** Yes
- **Underground:** No
- **Required:** 2+ hotel suites needed for 4-star rating
- **VIP Requirement:** Must have 1 "favorable" VIP rating for 4-star

### Commercial Facilities

#### **Office** (1 Star - Available at Start)
- **Cost:** $50,000 (9 segments)
- **Rent:** $1,500-$10,000 per quarter (adjustable)
- **Capacity:** ~6-8 workers
- **Population:** +0 (workers arrive from outside)
- **Hours:** 9 AM - 5 PM weekdays, closed weekends
- **Deletable:** Yes
- **Underground:** No
- **Income:** Quarterly rent collection
- **Noise:** Generates moderate noise
- **Stress:** Office work generates stress for sims
- **Parking Required:** After reaching 3 stars
- **Lunch:** Workers seek fast food at noon (12 PM)
- **Tips:**
  - Place 3 floors of offices above lobby, fast food 1 floor below lobby, connect with stairs
  - Keep offices on same floor to consolidate noise
  - Max walking distance: 79 segments (18 offices with stairs on 8th segment of 9th office)
- **Conditions:** "Conditions are terrible" = set to minimum rent to re-rent

### Food & Entertainment

#### **Fast Food Restaurant** (1 Star - Available at Start)
- **Cost:** $100,000
- **Size:** 16 segments
- **Capacity:** 10-50 customers
- **Hours:** 6 AM - 9 PM daily
- **Income:** Daily (not scaled!)
  - Red evaluation: -$3,000 loss
  - Yellow evaluation: +$2,000 profit
  - Blue evaluation: +$5,000 profit
- **Deletable:** Yes
- **Underground:** Yes
- **Traffic:** Heavy during lunch (12 PM) from office workers
- **Evaluation:** Based on PEAK customers during day (not closing time)
- **Tips:**
  - Place near lobbies/skylobbies
  - Connect via stairs/escalators to reduce elevator traffic
  - Essential for office tower sections

#### **Restaurant** (3 Stars)
- **Cost:** $200,000
- **Size:** 24 segments (2/3 size of fast food)
- **Capacity:** 20-100 customers
- **Hours:** 5 PM - 11 PM daily
- **Income:** Daily at 11 PM (not scaled!)
  - Red evaluation: -$6,000 loss
  - Yellow evaluation: +$4,000 profit
  - Blue evaluation: +$10,000 profit
- **Deletable:** Yes
- **Underground:** Yes
- **Traffic:** Evening dining from residents and hotel guests
- **Evaluation:** Based on total customers served throughout evening
- **Notes:** Exactly DOUBLE the profit/loss of fast food

#### **Retail Shop** (3 Stars)
- **Cost:** $100,000
- **Size:** 12 segments
- **Capacity:** Up to 30 customers
- **Rent:** Adjustable (quarterly)
- **Deletable:** Yes
- **Underground:** Yes (recommended)
- **Tips:**
  - Don't build more than 5 at once (spreads customers too thin)
  - Best placement: Underground near metro/lobbies
  - Closer to other destinations = more foot traffic

#### **Cinema** (3 Stars)
- **Cost:** $500,000
- **Size:** 31 segments × 2 floors
- **Capacity:** 120 people (60 per floor)
- **Income:** Daily, based on ticket sales
- **Deletable:** Yes
- **Underground:** Yes
- **Movie Management:**
  - Classic Movies: $150,000 cost
  - New Movies: $300,000 cost
  - Must change movies when sales drop
- **Evaluation Messages:**
  - "It's a Sellout!" = Excellent
  - "New Movie showing!" = Excellent
  - "Ticket Sales are average." = Good
  - "Terrible Sales, change the movie." = Bad
- **Movies (New):** Casual Friends, Dino Wars, The Making of a Star, Love in N.Y., Waikiki Moon, My Man of War, Christmas for Both of Us
- **Movies (Classic):** Big Wave, Farewell to Morocco, Fear of Shark Teeth, Western Sheriff, Revenge of the Big Spider, Northwest Romance, Samurai Cop

#### **Party Hall** (3 Stars)
- **Cost:** $100,000
- **Size:** 24 segments × 2 floors
- **Capacity:** 50 people
- **Population:** +50
- **Income:** $20,000 per day (guaranteed)
- **Hours:** Parties 1 PM - 5 PM
- **Deletable:** Yes
- **Underground:** Yes
- **Special:** Revenue NOT affected by placement or transportation quality!
- **Only requirement:** Lower floor connected to transport
- **Strategy:** Build all 16 immediately at 3 stars (pays for itself in ~5 days, generates $320K/day total)
- **Recommended placement:** Floors 7&8 or B5&B6 with escalators

### Service Facilities

#### **Housekeeping** (2 Stars)
- **Cost:** $25,000
- **Size:** 8 segments
- **Capacity:** 6 housekeepers
- **Cleaning:** Up to 19 rooms each (114 total per housekeeping room)
- **Hours:** Work until 5 PM, won't start new room after 4:30 PM
- **Transportation:** Service elevators or stairs ONLY (not regular elevators or escalators)
- **Deletable:** NO - cannot be deleted once placed!
- **Underground:** No
- **Purpose:** Clean hotel rooms to prevent roach infestation
- **Alternative:** Place housekeeping on each hotel floor instead of relying on service elevators

#### **Security Office** (2 Stars)
- **Cost:** Unknown
- **Required:** 1 Security Office needed for 3-star rating
- **Purpose:** Reduces crime, handles bomb threats, general safety
- **Population:** +0

#### **Medical Center** (3 Stars)
- **Cost:** Unknown
- **Required:** Medical demand must be fulfilled for 4-star rating
- **Purpose:** Health services for residents
- **Evaluation:** Condos want to be near medical centers
- **Population:** +0

#### **Recycling Center** (3 Stars)
- **Cost:** Unknown
- **Required:** Recycling demand must be fulfilled for 4-star rating
- **Purpose:** Handle tower trash
- **Mechanic:** Trash generation increases with tower size
- **Penalty:** Insufficient recycling = ALL evaluations decrease tower-wide
- **Population:** +0

#### **Parking (Space)** (3 Stars)
- **Cost:** Unknown (per space)
- **Required:** Offices and hotels need parking at 3+ stars
- **Location:** Basement levels only
- **Size:** Varies
- **Deletable:** Yes
- **Population:** +0

#### **Parking (Ramp/Gate)** (3 Stars)
- **Cost:** Unknown
- **Purpose:** Entry/exit for parking levels
- **Location:** Basement access
- **Required:** For parking to function

### Ultimate Facilities

#### **Metro Station** (4 Stars)
- **Cost:** Unlocked/built automatically at 4 stars
- **Size:** 3 floors tall, bottom floor spans ENTIRE screen width
- **Location:** Recommended B8-B10 (nothing can be built below metro tunnel)
- **Purpose:** Alternative entrance for visitors, massively boosts underground businesses
- **Population:** +0 (brings in visitors)
- **Restriction:** NOTHING can be built below the metro tunnel floor
- **Strategy:**
  - Build shops/restaurants/fast food on B1-B4
  - Party halls on B5-B6 (too far from lobby otherwise)
  - Retail shops on B7-B9 (benefit from metro, don't need elevators to be close)
- **Transportation:** Needs express elevator to all basement levels + standard elevators

#### **Cathedral** (5 Stars)
- **Cost:** $3,000,000
- **Location:** ONLY on floor 100 (top floor)
- **Size:** Large (exact size varies)
- **Purpose:** Wedding venue - required for Tower status
- **Population:** +0
- **Income:** None
- **Deletable:** No
- **Win Condition:** When a sim gets married in the Cathedral with 15,000 population = TOWER status achieved
- **Most expensive facility in the game**

---

## Star Rating System

Star ratings unlock new facilities and represent tower prestige. Evaluation occurs quarterly.

### **1 Star** (Default - Start of Game)
**Requirements:**
- None (starting rating)

**Available Facilities:**
- Lobby, Floor, Stairs, Standard Elevators
- Office, Fast Food, Condominium

---

### **2 Stars**
**Requirements:**
- **Population:** 300+

**Unlocked Facilities:**
- Service Elevator
- Hotel Room (Single)
- Security Office
- Housekeeping

---

### **3 Stars**
**Requirements:**
- **Population:** 1,000+
- **1 Security Office** built

**Unlocked Facilities:**
- Escalator
- Express Elevator
- Restaurant
- Retail Shop
- Cinema
- Party Hall
- Hotel Room (Twin)
- Hotel Suite
- Medical Center
- Recycling Center
- Parking (Space + Ramp/Gate)

**Note:** This is the biggest unlock - most profitable facilities become available.

---

### **4 Stars**
**Requirements:**
- **Population:** 5,000+
- **2 or more Hotel Suites** built
- **1 favorable VIP rating** (VIP stayed and was happy)
- **Recycling demand fulfilled** (enough recycling centers for tower trash)
- **Medical demand fulfilled** (enough medical centers for residents)

**Unlocked/Granted:**
- Metro Station (automatically built)

---

### **5 Stars**
**Requirements:**
- **Population:** 10,000+
- **1 Metro Station** (granted at 4 stars)

**Unlocked:**
- Cathedral

---

### **TOWER Status** (Ultimate Goal)
**Requirements:**
- **Population:** 15,000+
- **1 Cathedral** built on floor 100
- **Wedding Event:** A sim must get married in the Cathedral

**Reward:**
- Game completion! Tower is recognized as world-class.
- Visual celebration
- You've beaten SimTower!

---

## Elevator System (The Core Mechanic)

The elevator system is **THE** defining gameplay element of SimTower. Master it or fail.

### Elevator Fundamentals

#### **Elevator Shaft Components:**
- **Shaft:** Vertical column spanning multiple floors
- **Cars:** Individual elevators (1-8) within a shaft
- **Home Level:** Each car's default waiting position when idle
- **Service Range:** Which floors the shaft's cars can stop at

#### **How Sims Request Elevators:**
1. Sim arrives at floor, presses call button
2. System checks: Are any cars currently moving in the desired direction?
3. If yes AND within "Waiting Car Response" range → sim waits for that car
4. If no → nearest idle car dispatches from home level
5. Car arrives, sim boards
6. Car waits "Standard Floor Departure" seconds
7. Any sim arriving during wait time also boards
8. Car departs when no new sims arrive within departure time window

#### **Elevator Programming Interface:**
Accessed by clicking elevator shaft with Query tool

**Schedule Toggle:**
- WD (Weekday): Monday-Friday
- WE (Weekend): Saturday-Sunday

**6 Time Periods per Day:**
1. Morning (6 AM - 9 AM)
2. Late Morning (9 AM - 12 PM)
3. Noon (12 PM - 3 PM)
4. Afternoon (3 PM - 6 PM)
5. Evening (6 PM - 9 PM)
6. Night (9 PM - 6 AM)

**Settings (per time period, per schedule):**

1. **"Waiting Car Response"** (Range: 1-15 floors)
   - Distance a moving car can be from waiting sim before new car dispatches
   - Lower = more cars respond = less waiting but more crowded cars
   - Higher = fewer cars respond = longer waits but fuller cars
   - **Recommended for Standard Elevators:** 1 (maximum responsiveness)
   - **Recommended for Express Elevators:** Default (they only stop every 15 floors anyway)

2. **"Standard Floor Departure"** (Range: 5-30 seconds)
   - How long car waits at floor after picking up first sim
   - Lower = faster service but cars leave half-full
   - Higher = cars fill up but each stop takes longer
   - **Recommended:** 30 seconds (balances wait time vs capacity)

**Grid Display:**
- Shows all cars in shaft
- Current action (Idle, Moving Up, Moving Down, Loading)
- Home floor assignment for each car
- All floors serviced by shaft

### Elevator Types Compared

| Feature | Standard | Express | Service |
|---------|----------|---------|---------|
| **Cost** | $50,000 | $100,000 | $50,000 |
| **Upkeep/Car** | $100/qtr | $150/qtr | $100/qtr |
| **Capacity** | 12 people | 21 people | ~12 people |
| **Speed** | 3 floors/sec | 6 floors/sec | 2 floors/sec |
| **Service Range** | Any floor | 15-floor intervals + basements | Any floor |
| **Who Uses** | Everyone | Everyone | Housekeepers ONLY |
| **Best For** | Local (15 floors) | Long distance | Hotel maintenance |
| **Recommended Floors** | 1-14, 15-29, etc. | 1, 15, 30, 45... + B1-B10 | Hotel floor clusters |

### Elevator Strategy & Best Practices

#### **Standard Elevators:**
- **One shaft per 15-floor zone:** 
  - Shaft 1: Floors 1-14
  - Shaft 2: Floors 15-29
  - Shaft 3: Floors 30-44
  - etc.
- **Waiting Car Response:** 1 (immediate response)
- **Standard Floor Departure:** 30 seconds (good balance)
- **Car Count:** Start with 2-3 cars, add more as traffic increases (watch for stress)
- **Never exceed 15 floors per shaft** (stress skyrockets)

#### **Express Elevators:**
- **One shaft per skylobby:**
  - Express 1: Lobby (1) + Skylobby 15 + Basements
  - Express 2: Lobby (1) + Skylobby 30 + Basements
  - Express 3: Lobby (1) + Skylobby 45 + Basements
- **DO NOT overlap skylobbies** (wastes shaft capacity)
- **Settings:** Default usually fine (stops are infrequent anyway)
- **Critical:** Skylobbies MUST have standard elevators for local service
- **Traffic Pattern:** Sims take express to skylobby, transfer to standard for local floors

#### **Service Elevators:**
- **Often not worth it:** Housekeeping per floor is cheaper than service elevators + housekeeping rooms
- **If used:** One shaft for multiple hotel floors, stairs as backup
- **Low priority:** Only housekeepers use them

#### **Reducing Elevator Dependency:**
- **Stairs:** Connect lobby +/- 5 floors with offices/fast food
  - Example: Fast food B1, Lobby 1, Offices 2-4 (all stairs)
  - Eliminates office lunch rush from elevators
- **Escalators:** Same concept but 7-floor range, faster, lobbies/food/retail only
- **Stacking:** Place stairs/escalators directly above each other for multi-floor runs

### Elevator Limits & Restrictions

- **Max Shafts:** 24 total (includes service elevators)
- **Max Cars per Shaft:** 8
- **Max Stairs + Escalators:** 64 combined
- **Elevator-Stair Overlap:** Cannot overlap
- **Elevator-Room Overlap:** Elevators cannot overlap most rooms (they need their own vertical column)

### Stress & Waiting

**Waiting generates STRESS:**
- Sims waiting for elevators display stress color:
  - **Black/None:** 0-15 seconds wait
  - **Pink/Medium:** 15-45 seconds wait
  - **Red/High:** 45+ seconds wait
- **High stress → Lower evaluation → Tenant leaves → Buyback penalty (condos) or lost rent (offices)**

**Critical Insight:** Elevator efficiency is 80% of tower management. Nail this and everything else is easy.

---

## People Simulation

SimTower's sim AI creates emergent behavior from simple rules.

### Sim Types

1. **Office Workers**
   - Arrive: 8-9 AM weekdays
   - Lunch: 12 PM (seek fast food)
   - Leave: 5 PM
   - Weekends: Don't come
   - Parking: Required at 3+ stars
   - Stress: Work itself generates stress

2. **Condo Residents**
   - Live permanently in condos
   - Population: +3 per condo
   - Leave/Return: Various times (work, errands, entertainment)
   - Services: Want medical centers nearby
   - Stress: Accumulates from poor transit, noise, lack of amenities

3. **Hotel Guests**
   - Check in: Throughout day/evening
   - Check out: Morning
   - Activities: Visit restaurants, shops, cinema, party halls
   - VIPs: Prefer suites, critical for 4-star rating
   - Temporary: Don't add to permanent population (0-2 per room)

4. **Shoppers/Visitors**
   - Arrive via: Lobby, Metro, Parking
   - Purpose: Shop, eat, entertainment
   - Don't live in tower
   - Critical: Main customers for commercial facilities

5. **Housekeepers**
   - Employed by: Housekeeping rooms
   - Purpose: Clean hotel rooms
   - Hours: Until 5 PM (no new rooms after 4:30 PM)
   - Transit: Service elevators or stairs ONLY

6. **Special Sims**
   - **VIPs:** Check into hotel suites, rate their stay (required for 4-star)
   - **Santa Claus:** Visits during December (appears in elevators)
   - **Wedding Couple:** When tower reaches 15,000 pop with Cathedral

### Sim Movement & Pathfinding

**Trip Limit Rule:**
Sims make MAX 4 trips total to reach destination and return:
- **Example 1 (Metro):**
  1. Metro → Express Elevator to Skylobby 30
  2. Skylobby 30 → Standard Elevator to Floor 37
  3. Floor 37 → Standard Elevator to Skylobby 30
  4. Skylobby 30 → Express Elevator to Metro
  - (4 trips used exactly)

- **Example 2 (Lobby + Stairs):**
  1. Lobby → Stairs up to Floor 2
  2. Floor 2 → Standard Elevator to Floor 42
  3. Floor 42 → Standard Elevator to Floor 2
  4. Floor 2 → Stairs down to Lobby
  - (4 trips used exactly)

**If destination requires 5+ trips:** Sim won't attempt it → Facility gets "Stairs/Elevators too far away" status → Evaluation drops

**Walking Distance:**
- Sims will walk up to **79 segments** horizontally before complaining
- This equals 18 offices (9 segments each) with stairs at segment 8 of office 9

### Sim Needs & Behaviors

**Office Workers:**
- MUST have fast food within 5-floor stair range OR elevator access
- Generate stress from work itself (pink at 5 PM is normal)
- Require parking at 3+ stars or evaluation drops

**Condo Residents:**
- Avoid noise (offices, entertainment above/below)
- Want medical centers accessible
- Will move out if stressed too much → YOU buy back condo at full price

**Hotel Guests:**
- Want entertainment nearby (cinema, party hall, restaurants)
- VIPs especially picky about suite quality
- Housekeeping critical (roaches = immediate checkout + bad rating)

### Stress System

**Stress Sources:**
1. **Waiting for elevators** (biggest factor)
2. **Working in offices** (inherent)
3. **Noise from adjacent facilities**
4. **Long walks to services**
5. **Missing amenities** (no parking, no medical, no food)

**Stress Display:**
- **Black:** Low/None (acceptable)
- **Pink:** Medium (concerning but manageable)
- **Red:** High (sim will abandon facility soon)

**Stress Consequences:**
- Lower personal evaluation
- Lower facility evaluation
- Tenant moves out:
  - **Offices:** Lost rent, hard to re-rent
  - **Condos:** YOU MUST BUY BACK at sale price (bankruptcy risk!)
  - **Hotels:** Lost daily income, bad VIP rating

**Stress Reduction:**
- Efficient elevators (Waiting Car Response = 1, multiple cars)
- Stairs/escalators for short trips
- Keep services accessible (≤4 trips total)
- Reduce noise exposure
- Provide required amenities (parking, medical, recycling)

---

## Evaluation System

Every facility and sim has an **evaluation** shown as a colored bar (Blue/Yellow/Red).

### Evaluation Colors

- **Blue:** Excellent (90-100% satisfaction)
- **Yellow:** Good (60-89% satisfaction)
- **Red:** Bad (0-59% satisfaction)

**Display:**
- Click facility with Query Tool → status bar appears
- Map view → EVAL tab shows tower-wide evaluation heatmap
- Most facilities have black lines dividing bar into 3 zones
- Exact placement of bar fill determines color

### Factors Affecting Evaluation

#### **1. Rent** (Offices, Shops, Condos)
- **Higher rent → Lower evaluation**
- **Lower rent → Higher evaluation**
- Strategy: Maximize rent while keeping evaluation in Blue
- If evaluation drops to Red, facility won't sell/rent
- Condos: Can adjust price before 7 AM to prevent sale

#### **2. Ease of Access**
- **"Stairs/Elevators too far away"** status = major evaluation drop
- Cause: Facility requires 5+ trips to reach OR >79 segments walk
- Solution: Add elevator shafts or stairs/escalators
- Critical for: All facilities except Party Halls (immune to transit issues)

#### **3. Proximity to Services**
- **Offices:** Need fast food close (5-floor stair range ideal)
- **Offices + Hotels:** Need parking (3+ stars)
- **Condos:** Want medical centers accessible
- **All Commercial:** Want security offices accessible
- **Hotels:** Want restaurants, shops, cinema, party halls nearby
- Farther = lower evaluation

#### **4. Stress** (Sims)
- High stress → Low sim evaluation → Low facility evaluation
- Cause: Mostly elevator wait times
- Solution: More elevator cars, better programming, stairs/escalators

#### **5. Noise**
- **Noise Generators:** Offices (moderate), Entertainment (high)
- **Noise Sensitive:** Condos, Hotels, Offices (to lesser extent)
- **Penalty:** Sharing wall, floor, or ceiling with noisy facility
- **Solutions:**
  - Keep offices on same floor (consolidate noise)
  - Never place condos directly above/below offices or entertainment
  - Use lobbies as noise buffers (lobbies don't care about noise)
  - One floor separation minimum

#### **6. Trash** (3+ Stars)
- Tower generates trash proportional to size
- **Insufficient recycling centers → ALL evaluations decrease tower-wide**
- Build recycling centers as tower grows (required for 4-star anyway)

### Evaluation by Facility Type

#### **Offices:**
- Start Blue → tenants move in fast at high rent
- Noise: Avoid entertainment above/below
- Transit: Fast food within 5-floor stair range ideal
- Parking: Required at 3+ stars
- If Red: Set rent to minimum, evaluation recovers, raise rent again

#### **Condos:**
- Start Blue → sell immediately at max price ($125,000)
- Noise: CRITICAL - don't place near offices or entertainment
- Transit: Medical centers wanted
- If Red ("Conditions terrible"): Delete & rebuild OR set to minimum price
- **DANGER:** If sold with Red evaluation, tenant moves out fast → buyback penalty

#### **Hotels:**
- Evaluation per room based on cleanliness + amenities + rent
- **Housekeeping:** Essential (dirty rooms → roaches → can't delete until room cleared)
- **VIPs:** Rate their stay (need 1 favorable for 4-star)
- Amenities: Restaurants, shops, cinema boost evaluation
- Noise: Less sensitive than condos but still matters

#### **Fast Food:**
- Evaluation = customer count during day
- **Peak matters, not closing count**
- Red: 0-10 customers peak → -$3,000 loss
- Yellow: 10-40 customers peak → +$2,000 profit
- Blue: 40-50 customers peak → +$5,000 profit
- Strategy: Place near offices + lobby, stairs for lunch rush

#### **Restaurants:**
- Same as fast food but evening hours (5 PM - 11 PM)
- Red: -$6,000 | Yellow: +$4,000 | Blue: +$10,000
- Customers: Hotel guests, condo residents, visitors
- Place near lobbies/metro, escalators help

#### **Shops:**
- Evaluation = customer count
- Too many shops (>5 at once) spreads customers thin → all turn Red
- Best: Underground near metro

#### **Cinema:**
- Evaluation = ticket sales (shown as status message)
- "It's a Sellout!" or "New Movie showing!" = Blue
- "Ticket Sales average" = Yellow
- "Terrible Sales, change the movie" = Red
- Cost: $150K (classic) or $300K (new movie)

#### **Party Hall:**
- **NO EVALUATION** tied to placement or transit!
- Guaranteed $20,000/day as long as lower floor connected to transit
- Build all 16 immediately at 3 stars

### Rooms Without Evaluation

These facilities don't have evaluation bars:
- Cathedral
- Cinema (uses text status instead)
- Housekeeping
- Lobby
- Medical Center
- Metro Station
- Parking
- Party Hall (income guaranteed)
- Recycling Center
- Security Office

---

## Time System

SimTower uses a compressed 24-hour day/night cycle with distinct weekday/weekend patterns.

### Time Flow

- **Game Speed:** Adjustable (Pause, Slow, Medium, Fast)
- **1 Game Day:** ~10-15 minutes real-time (speed dependent)
- **Quarters:** Every 3 months (critical for rent collection and star evaluation)
- **Year:** 12 months (365 days, but who's counting)

### Day Cycle (6 Time Periods)

Elevator programming divides day into 6 periods (each ~4 hours game time):

1. **6 AM - 9 AM:** Morning rush (office workers arrive, hotel guests check out)
2. **9 AM - 12 PM:** Late morning (settling in, some shopping)
3. **12 PM - 3 PM:** Noon (LUNCH RUSH - office workers swarm fast food)
4. **3 PM - 6 PM:** Afternoon (party halls active 1-5 PM, offices close at 5 PM)
5. **6 PM - 9 PM:** Evening (restaurant rush, cinema starts, workers go home)
6. **9 PM - 6 AM:** Night (slow period, some hotel activity, fast food closes at 9 PM, restaurants close at 11 PM)

### Weekday vs. Weekend

**Weekday (Monday-Friday):**
- Offices OPEN (9 AM - 5 PM)
- Heavy traffic: Morning arrival, lunch rush, evening departure
- Office workers dominate elevator usage
- Fast food critical (noon rush)

**Weekend (Saturday-Sunday):**
- Offices CLOSED
- Lighter traffic overall
- More leisure activity: shopping, cinema, restaurants, party halls
- Condo residents and hotel guests dominate
- Can use different elevator programming (adjust Waiting Car Response, Standard Floor Departure for lower demand)

### Time-Specific Events

**Daily:**
- **7 AM:** Condos can be purchased (purchase window opens)
- **9 AM:** Offices open
- **12 PM:** Lunch rush (fast food peak)
- **1 PM:** Party halls start
- **4:30 PM:** Housekeepers stop starting new rooms
- **5 PM:** Offices close, party halls end, housekeeping ends, restaurants open
- **9 PM:** Fast food closes, fast food income/loss calculated
- **11 PM:** Restaurants close, restaurant income/loss calculated

**Quarterly (every 3 months):**
- **Rent collection:** Offices, shops, hotels pay quarterly rent
- **Upkeep costs:** Elevators, escalators deducted
- **Star evaluation:** Population + requirements checked for star upgrades

**Special Calendar Events:**
- **December:** Santa Claus appears (rides elevators, delights guests)
- **Specific dates:** VIP visits (random, tied to hotel suite quality)
- **15,000 population + Cathedral:** Wedding event (win condition)

### Building Restrictions by Time

**Condos:**
- **Purchase Hours:** 7 AM - 9 PM only (sims won't buy at night)
- **Strategy:** Build after 9 PM, adjust price overnight, sell in morning

**Offices:**
- Can be built anytime
- Won't rent during business hours if workers already arrived

**Hotels:**
- Can be built anytime
- Check-in happens throughout day

---

## Events & Special Occurrences

SimTower has random and scripted events that affect gameplay.

### Regular Events

#### **VIP Visits**
- **Trigger:** Random after hotel suites built
- **VIP Behavior:**
  - Checks into hotel suite
  - Stays overnight
  - Rates their experience
- **Rating Factors:**
  - Suite quality (rent level)
  - Cleanliness (housekeeping!)
  - Amenities nearby (restaurants, shops, cinema)
  - Elevator wait times (stress)
- **Outcome:**
  - **Favorable:** VIP happy (required for 4-star rating)
  - **Unfavorable:** VIP unhappy (doesn't count toward 4-star)
- **Requirement:** Need 1 favorable VIP rating + 2 hotel suites for 4-star
- **Visual:** VIP appears as distinct sprite (often wearing suit)

#### **Santa Claus (December)**
- **Trigger:** Automatically in December
- **Behavior:** Rides elevators throughout tower
- **Effect:** Aesthetic/fun (no gameplay impact)
- **Visual:** Santa sprite in elevators
- **Players love this:** Iconic SimTower feature

#### **Weddings (Cathedral)**
- **Trigger:** 15,000 population + Cathedral built
- **Behavior:** Sim couple gets married in Cathedral
- **Effect:** Achieves TOWER status (win condition)
- **Visual:** Wedding ceremony animation
- **Only happens once:** Game completion

### Disasters & Negative Events

#### **Fires**
- **Trigger:** Random, rare
- **Location:** Can occur in any facility
- **Behavior:** Fire sprite appears, spreads slowly
- **Duration:** Burns out after ~1 minute game time
- **Damage:** Facility temporarily disabled, evaluation drops
- **Prevention:** None (random event)
- **Response:** Wait it out (no fire department mechanic)

#### **Bomb Threats / Terrorism**
- **Trigger:** Random, more common at higher populations
- **Announcement:** Phone call received (dialog box)
- **Bomb Placed:** Randomly in tower (often in public space)
- **Timer:** Player has limited time to find bomb with Query tool
- **Search Mechanic:** Click facilities with Query tool, system shows "warmer/colder"
- **Outcomes:**
  - **Bomb Found:** Defused, no damage
  - **Bomb Explodes:** Facility destroyed, major evaluation drop, rebuild cost
- **Bug:** If bomb explodes/found, phantom sims can move into unsold condos → forced buyback glitch!
- **Frequency:** Increases with tower size

#### **Power Outages**
- **Trigger:** Random (rare in original game, more common in some versions)
- **Effect:** Elevators stop, lights go out
- **Duration:** Short (~30 seconds game time)
- **Stress:** Massive stress increase for waiting sims
- **Response:** None (automatic restoration)

#### **Roach Infestations (Hotels)**
- **Trigger:** Hotel room left dirty too long
- **Cause:** Insufficient housekeeping
- **Effect:** Room becomes infested, cannot be rented
- **Solution:** DELETE room (only way to remove roaches), rebuild
- **Prevention:** Always have enough housekeeping capacity

### Evaluation Days (Quarterly)

Not exactly an "event," but critical:

**Every Quarter:**
1. **Rent collected** from offices, shops, hotels
2. **Upkeep deducted** for elevators, escalators
3. **Population checked** for star upgrade eligibility
4. **Requirements verified:**
   - 2-star: Just population
   - 3-star: Population + 1 security office
   - 4-star: Population + 2 suites + 1 favorable VIP + recycling/medical demands met
   - 5-star: Population + metro station
   - Tower: Population + Cathedral + wedding

**Consequences:**
- Star upgrade → New facilities unlocked
- Star downgrade → Facilities lost (if you somehow lose population)
- Cash influx/outflow

---

## Economy & Income

SimTower is fundamentally an economic balancing act: income vs. expenses, immediate profit vs. long-term growth.

### Income Sources

#### **One-Time Sales (Condos)**
- **Purchase Cost:** $50,000
- **Sale Price:** $100,000 - $125,000 (adjustable)
- **Profit:** $50,000 - $75,000 per condo
- **Timing:** Instant when sold (7 AM - 9 PM)
- **Risk:** If tenant moves out, YOU buy back at sale price regardless of cash on hand → can force bankruptcy
- **Strategy:** Most profitable short-term, but dangerous if mismanaged

#### **Quarterly Rent (Offices, Shops)**
- **Offices:** $1,500 - $10,000 per quarter (adjustable)
- **Shops:** Similar range (adjustable)
- **Timing:** Collected every 3 months
- **Reliable:** As long as evaluation stays Blue/Yellow
- **Strategy:** Maximize rent while keeping evaluation high

#### **Daily Income (Hotels)**
- **Single Room:** $500 - $3,000/night
- **Twin Room:** $800 - $4,500/night
- **Suite:** $1,500 - $9,000/night
- **Timing:** Daily when rented
- **Variable:** Depends on occupancy
- **Strategy:** Set rent at highest level that keeps evaluation Blue

#### **Daily Income (Food - Fixed Amounts)**
- **Fast Food:**
  - Red: -$3,000 loss
  - Yellow: +$2,000 profit
  - Blue: +$5,000 profit
- **Restaurant:**
  - Red: -$6,000 loss
  - Yellow: +$4,000 profit
  - Blue: +$10,000 profit
- **NOT SCALED:** Always these exact amounts based on evaluation
- **Timing:** 9 PM (fast food), 11 PM (restaurant)
- **Strategy:** Place optimally to ensure Blue evaluation

#### **Daily Income (Party Hall - Guaranteed)**
- **Amount:** $20,000 per hall per day
- **Reliability:** 100% (as long as lower floor connected to transit)
- **Total Potential:** 16 halls × $20,000 = $320,000/day
- **Strategy:** Build all 16 immediately at 3 stars (pays for itself in ~5 days)

#### **Daily Income (Cinema - Variable)**
- Based on ticket sales
- Affected by movie choice (new vs. classic) and freshness
- Range: -$10,000 to +$50,000+ per day (estimated, varies widely)
- **Strategy:** Change movies when sales drop, invest in new movies for bigger returns

### Expenses

#### **One-Time Construction Costs**
- **Lobby:** $1,250/segment ($5,000 for standard 4-segment)
- **Floor:** $100/segment
- **Stairs:** $5,000 each
- **Escalator:** $20,000 each
- **Standard Elevator Shaft:** $50,000
- **Express Elevator Shaft:** $100,000
- **Service Elevator Shaft:** $50,000
- **Office:** $50,000
- **Condo:** $50,000
- **Hotel Single:** $20,000
- **Hotel Twin:** $50,000
- **Hotel Suite:** $100,000
- **Fast Food:** $100,000
- **Restaurant:** $200,000
- **Shop:** $100,000
- **Cinema:** $500,000
- **Party Hall:** $100,000
- **Housekeeping:** $25,000
- **Cathedral:** $3,000,000 (most expensive)

#### **Quarterly Upkeep**
- **Standard Elevator:** $100 per car
- **Express Elevator:** $150 per car
- **Service Elevator:** $100 per car
- **Escalator:** $5,000 each
- **No upkeep:** Stairs, lobbies, facilities (only elevators/escalators)

#### **Movie Costs (Cinema)**
- **Classic Movie:** $150,000
- **New Movie:** $300,000
- Recurring cost every time you change movie

#### **Forced Buybacks (Condos)**
- **Cost:** Full sale price ($100,000-$125,000)
- **Trigger:** Tenant moves out due to poor conditions/stress
- **Danger:** Can happen to multiple condos at once → instant bankruptcy
- **Prevention:** Keep condo evaluations Blue, elevators efficient, no noise

### Economic Strategies

#### **Early Game (1-2 Stars)**
1. Build offices above lobby (3 floors)
2. Fast food 1 floor below lobby
3. Connect with stairs (remove elevator traffic)
4. Build condos on separate floors (away from offices)
5. Sell condos at max price for instant cash influx
6. Use condo profits to fund more offices + elevators

#### **Mid Game (3 Stars)**
1. **IMMEDIATELY build 16 party halls** (B5-B6 or floors 7-8)
   - Cost: $1.6 million
   - Income: $320,000/day
   - ROI: ~5 days
   - This bankrolls everything else
2. Build express elevators to skylobbies (15, 30)
3. Build restaurants, shops, cinema
4. Expand offices + condos vertically
5. Add recycling, medical, parking as needed

#### **Late Game (4-5 Stars)**
1. Metro unlocked → spam underground shops
2. Build upward to floor 100 for Cathedral
3. Focus on population growth (15,000 target)
4. Balance new construction with elevator capacity
5. Save $3 million for Cathedral

#### **Cash Flow Management**
- **Condos = quick cash** (but risky)
- **Offices = steady income** (quarterly, reliable)
- **Party halls = passive income** (daily, guaranteed)
- **Food = break-even to profit** (depends on foot traffic)
- **Hotels = variable income** (depends on occupancy + VIPs)

#### **Bankruptcy Avoidance**
- **Never over-build condos** without sufficient elevator capacity
- **Always keep emergency cash** for condo buybacks ($500K+ reserve recommended)
- **Don't spam facilities** faster than you can connect them to transit
- **Watch stress levels** like a hawk

---

## Graphics & Visual Style

SimTower's pixel art aesthetic is iconic and functional.

### Art Style

**Resolution:** 640×480 (standard for 1994)
**Perspective:** Side-view cross-section (cutaway building)
**Color Palette:** 256 colors (VGA), vibrant but not oversaturated
**Style:** Detailed pixel art, isometric-ish perspective for depth

### Visual Elements

#### **Building Structure**
- **Floors:** Horizontal lines, alternating light/dark for depth
- **Walls:** Vertical segments, simple grey/beige tones
- **Lobby:** Decorative elements (plants, desks, chandeliers) that upgrade with star rating
- **Transparency:** Can see through floors to view multiple levels

#### **Facilities (Interiors)**
Each facility has distinct pixel art:
- **Offices:** Desks, computers, filing cabinets, workers at desks
- **Condos:** Furniture, beds, lamps, residents walking around
- **Hotels:** Beds, dressers, guests sleeping/sitting, roach sprites (if infested)
- **Fast Food:** Counter, tables, customers standing/sitting
- **Restaurant:** Fancier tables, waiter sprites, dim lighting
- **Cinema:** Movie screen, seats, audience silhouettes
- **Party Hall:** Tables, decorations, dancing sims
- **Shops:** Display counters, merchandise, browsers

#### **Sims (People)**
- **Size:** ~8×16 pixels
- **Animation:** Walking, standing, sitting, working
- **Variety:** Different colored clothing (random per sim)
- **Stress Display:** Black/Pink/Red indicator when queuing for elevator
- **Special Sprites:** Santa (red suit), VIPs (suits), wedding couple (formal wear)

#### **Elevators**
- **Shaft:** Vertical grey column with floor markers
- **Car:** Small box sprite (different color per shaft)
- **Animation:** Smooth scrolling up/down shaft
- **Indicator Lights:** Show which floors are active
- **Doors:** Open/close at stops

#### **Stairs & Escalators**
- **Stairs:** Diagonal lines, simple grey
- **Escalators:** Animated moving steps (subtle but visible)
- **Multi-Level:** Stack vertically for tall runs

#### **UI Elements**
- **Toolbar:** Bottom/side of screen, icon-based
- **Icons:** Pixelated but clear (hammer for build, query tool, etc.)
- **Info Bar:** Top of screen shows date, time, population, cash, star rating
- **Map Window:** Minimap view, can toggle views (evaluation, population, etc.)
- **Dialog Boxes:** Simple grey boxes with pixel text

#### **Time of Day**
- **Daytime (6 AM - 6 PM):** Bright, white/yellow lighting
- **Nighttime (6 PM - 6 AM):** Darker blue tones, building silhouette against night sky
- **Gradual Transition:** Smooth color shift at dusk/dawn

#### **Lobby Evolution**
As star rating increases, lobby appearance upgrades:
- **1 Star:** Basic (simple desk, minimal decor)
- **2 Stars:** Slightly fancier (plants added)
- **3 Stars:** Nicer furnishings (better desk, more plants)
- **4 Stars:** Upscale (chandelier, marble accents)
- **5 Stars:** Luxurious (grand chandelier, fancy floor, impressive decor)
- **Tower:** Ultimate prestige look

#### **Background**
- **Sky:** Day/night cycle affects sky color (blue → pink/orange → black)
- **Cityscape:** Silhouettes of other buildings in background (simple, doesn't change)
- **Stars:** Visible at night

### Animation

**Smooth for 1994:**
- Sims walking (fluid 2-4 frame walk cycle)
- Elevators moving (smooth vertical scrolling)
- Escalators (subtle step movement)
- Fires (animated flames)
- Cinema screen (flickering movie playback)
- Party hall (dancing sims)

### Iconic Visual Moments

1. **Elevator Rush Hour:** Dozens of sims queued at elevators, stress colors flashing
2. **Lunch Rush:** Stream of office workers flowing down stairs to fast food
3. **Santa in Elevators:** December event, unmistakable red sprite
4. **Cathedral Construction:** Massive structure appearing at floor 100
5. **Wedding Ceremony:** Couple animation in Cathedral (win condition)
6. **Bomb Threat:** Flashing red alert in facility with bomb
7. **Fire:** Orange/red flames spreading through facility

**Overall Feel:** Clean, readable, charming. Not realistic, but clear enough to manage hundreds of sims across 100+ floors.

---

## Sound & Music

SimTower's audio design is subtle but effective (and iconic to those who played it).

### Music

**Main Theme:**
- **Style:** Upbeat, jazzy elevator music (appropriately)
- **Instrumentation:** MIDI synthesizer (1994 standard)
- **Mood:** Optimistic, corporate, slightly whimsical
- **Loop:** Short (~1-2 minute loop), repeats continuously
- **Volume:** Background level (doesn't overwhelm)

**Variations:**
- Some versions had multiple tracks that rotated
- Mac version vs. PC version had slightly different MIDI interpretations

**Player Response:**
- **Loved or Muted:** Players either found it charming or turned it off after the 100th loop
- **Nostalgic:** Instantly recognizable to SimTower veterans

### Sound Effects

**Elevator Sounds:**
- **Ding:** Elevator arrival at floor (iconic)
- **Whoosh:** Elevator moving (subtle)
- **Doors:** Open/close sound (mechanical)

**Construction:**
- **Hammer/Build:** Placing new facilities
- **Cash Register:** Income received (satisfying "cha-ching")

**Events:**
- **Phone Ring:** Bomb threat or VIP arrival
- **Alarm:** Fire or emergency
- **Explosion:** Bomb detonates (if not found)
- **Celebration:** Star rating upgrade or Tower status achieved

**Ambient:**
- **Crowd Murmur:** Subtle background noise in busy areas
- **Footsteps:** Sims walking (very subtle)

**UI:**
- **Click:** Button/menu selection
- **Error Buzz:** Invalid action (can't place facility there)

### Audio Atmosphere

**Overall:** Minimal but effective
- Not overwhelming or annoying
- Functional (alerts you to events)
- Charming (elevator ding is satisfying)
- **Many players played with music off but SFX on** (elevator ding too useful)

**Technical Limitations:**
- MIDI quality varied by sound card (1994 PC gaming)
- Mac version generally had better sound quality
- CD-ROM version had audio tracks (higher quality than MIDI)

**Memorable Audio Moments:**
1. **Elevator Ding Symphony:** Multiple elevators arriving simultaneously = cascade of dings
2. **Lunch Rush Chaos:** Rapid-fire elevator sounds at noon
3. **Bomb Threat Phone Ring:** Always made your heart skip a beat
4. **Star Upgrade Fanfare:** Celebration sound when reaching new star
5. **Cash Register Chorus:** End-of-day income collection (multiple cha-chings)

---

## Win Conditions

SimTower has a clear ultimate goal, but the journey is open-ended.

### Primary Goal: Achieve "TOWER" Status

**Requirements:**
1. **15,000 Population**
2. **Cathedral built** (floor 100)
3. **Wedding event** (sim couple gets married in Cathedral)

**When achieved:**
- Visual celebration (animation, confetti)
- Audio fanfare
- Congratulations message
- Tower recognized as world-class

**Post-Win:**
- Can continue playing (no forced end)
- Build to 100 floors, max population (~20,000+)
- Perfect your design
- Challenge yourself with constraints

### Path to Victory

**Step-by-Step:**

1. **1 Star → 2 Stars** (Population 300)
   - Build offices + condos
   - Fast food for offices
   - Basic elevator network
   - ~1-2 hours gameplay

2. **2 Stars → 3 Stars** (Population 1,000 + Security Office)
   - Expand offices + condos vertically
   - Add hotel rooms
   - Build 1 security office
   - Improve elevator efficiency
   - ~3-5 hours gameplay

3. **3 Stars → 4 Stars** (Population 5,000 + Hotels + VIP + Services)
   - **BUILD 16 PARTY HALLS IMMEDIATELY** ($320K/day income)
   - Add restaurants, shops, cinema
   - Build 2+ hotel suites
   - Host VIPs, get 1 favorable rating
   - Build recycling + medical centers
   - Expand to skylobby 15, 30
   - ~10-15 hours gameplay

4. **4 Stars → 5 Stars** (Population 10,000 + Metro)
   - Metro unlocked automatically at 4 stars
   - Spam underground shops/restaurants
   - Continue vertical expansion
   - Build toward floor 100
   - ~20-30 hours gameplay

5. **5 Stars → TOWER** (Population 15,000 + Cathedral + Wedding)
   - Save $3 million for Cathedral
   - Build Cathedral at floor 100
   - Reach 15,000 population
   - Wait for wedding event (automatic)
   - **VICTORY!**
   - ~30-50 hours gameplay (first playthrough)

### Alternative/Self-Imposed Challenges

**Since game is sandbox-ish, players create their own goals:**

1. **Speed Run:** Reach Tower status as fast as possible
2. **Profit Maximization:** Highest daily income
3. **Aesthetic Tower:** Beautiful, symmetrical design
4. **Minimal Elevators:** Stairs/escalators only (extremely difficult)
5. **All Offices:** No condos or hotels (office tower only)
6. **Underground Empire:** Maximize basement utilization
7. **No Party Halls:** Hard mode (reject easy money)
8. **Perfect Evaluation:** Every facility Blue at all times

### No Failure State

**Important:** You **cannot** lose SimTower
- Bankruptcy: Game allows negative cash (debt)
- Poor design: Tower becomes inefficient, but doesn't "fail"
- Low population: Can rebuild
- **Only "failure":** Player frustration/boredom

This makes it a chill, low-pressure game (unlike SimCity which can force game-overs).

---

## Known Bugs & Quirks

SimTower is a 30-year-old game with plenty of jank. Some bugs, some quirks, some exploits.

### Major Bugs

#### **1. Condo Phantom Tenant Glitch**
- **Trigger:** Bomb threat placed in tower
- **Bug:** When bomb explodes OR is found, phantom sims can move into UNSOLD condos
- **Effect:** Condos gain "Conditions terrible" status, YOU are forced to buy them back at full sale price
- **Severity:** Can bankrupt player instantly
- **Workaround:** Don't build unsold condos during bomb threats, or disconnect them from transit

#### **2. Elevator Pathfinding Breakdown**
- **Trigger:** Complex elevator networks (20+ shafts, overlapping service ranges)
- **Bug:** Sims get "confused," queue at wrong elevator, never board
- **Effect:** Massive stress, facility abandonment
- **Workaround:** Keep elevator design simple, 15 floors max per shaft

#### **3. Housekeeping Glitch**
- **Trigger:** Service elevator deleted while housekeepers are using it
- **Bug:** Housekeepers disappear, rooms never get cleaned
- **Effect:** Roach infestations spread uncontrollably
- **Workaround:** Never delete service elevators, use stairs for housekeeping instead

#### **4. Stress Overflow**
- **Trigger:** Sim waits for elevator 2+ minutes
- **Bug:** Stress meter "overflows," sim becomes permanently stuck
- **Effect:** Frozen sim sprite, facility evaluation drops, room becomes un-rentable
- **Workaround:** Fix elevators before sims wait that long (rare but game-breaking)

#### **5. Cathedral Placement Glitch**
- **Trigger:** Trying to place Cathedral on floor 100 with obstacles
- **Bug:** Cathedral placement fails silently, $3M deducted anyway
- **Effect:** Lose $3M, no Cathedral built
- **Workaround:** Clear floor 100 completely before building Cathedral

### Exploits & Cheese Strategies

#### **1. Infinite Condo Money**
- **Method:**
  1. Build condos disconnected from transit
  2. Set price to max ($125K)
  3. Build up cash reserves
  4. When needed, connect to transit → instant $75K profit per condo × dozens
- **Effect:** Essentially unlimited money on demand
- **Game-breaking?** Somewhat, but players love it

#### **2. Party Hall Spam**
- **Method:** Build all 16 party halls at 3 stars
- **Effect:** $320K/day guaranteed income, trivializes economy
- **Intended?** Probably not, but also not a "bug" (party halls work as designed)

#### **3. Stair/Escalator Overlap Trick**
- **Method:** Place stairs, then escalator in same spot (works in some versions)
- **Effect:** Double transit capacity in same space
- **Patched?** Fixed in later versions

#### **4. Multi-Level Lobby (Hidden Feature?)**
- **Method:** Hold Ctrl (2-level) or Shift+Ctrl (3-level) when placing lobby
- **Effect:** Taller lobby, changes stair/escalator appearance, elevators can't stop on intermediate floors
- **Intended?** Unclear (Easter egg or debug feature?)

### Quirks (Not Bugs, Just Weird)

#### **1. Party Halls Ignore Transit Quality**
- Party halls earn $20K/day no matter how terrible transit is
- Only requirement: lower floor connected
- **Why?** Probably oversight in evaluation code

#### **2. Escalators Can't Connect to Offices/Condos/Hotels**
- Escalators ONLY work with lobbies, food, retail
- **Why?** Design choice to limit their power (would make stairs obsolete)

#### **3. Metro Tunnel Blocks EVERYTHING**
- Once metro built, cannot build anything below tunnel floor
- **Why?** Game engine limitation (tunnel is full-width sprite)

#### **4. Housekeeping Can't Be Deleted**
- Only facility that's permanent once placed
- **Why?** Probably to prevent exploit or glitch (housekeepers in non-existent room)

#### **5. Office Workers NEVER use Escalators to Offices**
- Offices can't connect to escalators, only stairs/elevators
- Forces elevator dependency for office towers
- **Why?** Intentional design to make vertical office towers harder

#### **6. VIP Rating is Opaque**
- No clear indication of VIP satisfaction until they leave
- Can't see rating requirements
- **Why?** 1994 game design (mystery = engagement?)

#### **7. Roaches Are Permanent**
- Only way to remove: delete room
- **Why?** Punishment for neglecting housekeeping (harsh but effective)

#### **8. Cathedral Wedding is Automatic**
- Player has no control over when wedding happens
- Just triggers when conditions met
- **Why?** Simplifies win condition (no extra clicks needed)

### Version Differences

**Mac vs. PC:**
- Mac version: Better sound quality, slightly different UI
- PC version: More common, MIDI sound varies by sound card

**CD-ROM vs. Floppy:**
- CD version: Better audio (CD tracks instead of MIDI)
- Floppy version: Standard MIDI

**Patches:**
- Some bugs fixed in later patches (1.0 → 1.1)
- Escalator overlap exploit patched

---

## Advanced Strategies

For players who want to master SimTower beyond casual play.

### Optimal Tower Layout

**Vertical Organization (Recommended):**

**Basement:**
- **B10 - B8:** Metro Station (B10 is tunnel)
- **B7 - B5:** Shops, Restaurants (benefit from metro)
- **B4 - B1:** Fast Food, Shops, Restaurants (close to lobby, high traffic)

**Ground & Low Floors:**
- **1:** Lobby (mandatory)
- **2-4:** Offices (connected to lobby + fast food via stairs)
- **5-6:** Condos (noise buffer above offices)
- **7-8:** Party Halls (16 total, escalators to lobby)
- **9-14:** Condos + Hotels (close to lobby, away from noise)

**Mid Floors:**
- **15:** Skylobby (express elevator hub)
- **16-18:** Offices (stairs to skylobby)
- **19-29:** Condos + Hotels (local elevators from skylobby)

**High Floors:**
- **30:** Skylobby
- **31-33:** Offices
- **34-44:** Condos + Hotels

**Repeat pattern every 15 floors up to...**

**Top Floor:**
- **100:** Cathedral

**Key Principles:**
1. **Every 15 floors = Skylobby** (express elevator transfer point)
2. **Offices near skylobbies** (3 floors, stairs to fast food in skylobby floor or below)
3. **Noise isolation:** Offices separate from condos/hotels
4. **Party halls low** (easy access, consolidate noise)
5. **Basements for metro-boosted retail**

### Elevator Network Design

**Express Elevator Strategy:**

**Shaft 1:** Lobby (1) + Skylobby 15 + All Basements
- Serves: Lower tower, underground retail

**Shaft 2:** Lobby (1) + Skylobby 30 + Basements
- Serves: Mid tower

**Shaft 3:** Lobby (1) + Skylobby 45 + Basements
- Serves: Mid-high tower

**Shaft 4:** Lobby (1) + Skylobby 60 + Basements
- Serves: High tower

**Etc.** (one express per skylobby, max efficiency)

**Standard Elevator Strategy:**

**Per 15-floor zone:**
- Shaft A: Floors X-14 (local service)
- Shaft B: Floors X-14 (redundancy)
- **Cars:** 3-5 per shaft (adjust based on traffic)
- **Settings:** Waiting Car Response = 1, Standard Floor Departure = 30

**Stairs/Escalators:**
- **Offices to Fast Food:** Always stairs (5-floor range)
- **Lobbies to Retail:** Escalators (7-floor range, preferred)
- **Party Halls to Lobby:** Escalators (decorative + efficient)

### Income Optimization

**Profit Per Segment (Rough Estimates):**

1. **Party Hall:** ~$417/day per segment (24 segments, $20K/day guaranteed)
2. **Condo (sold):** ~$5,555/segment one-time (9 segments, $50K profit)
3. **Restaurant (Blue):** ~$417/day per segment (24 segments, $10K/day)
4. **Hotel Suite (max rent):** ~$562/day per segment (16 segments, $9K/day)
5. **Office (max rent):** ~$111/quarter per segment (9 segments, $1K/qtr)
6. **Fast Food (Blue):** ~$312/day per segment (16 segments, $5K/day)

**Ranking (Daily Income):**
1. Party Hall (spam immediately at 3 stars)
2. Hotel Suites (if you can keep occupancy high)
3. Restaurants (evening traffic)
4. Fast Food (lunch traffic)
5. Offices (quarterly, so divide by ~90 for daily equivalent)

**Practical Strategy:**
- **Early:** Condos for quick cash → Offices for steady quarterly income
- **Mid:** Party halls for passive daily income
- **Late:** Hotels + Restaurants for high daily income

### Population Growth Speed-Run

**Fastest Population Sources:**

1. **Party Halls:** +50 pop each × 16 = +800 (instant at 3 stars)
2. **Condos:** +3 each (build vertically, sell in batches)
3. **Hotels:** +0-2 each (slower, depends on guests)
4. **Offices:** +0 (workers don't count)

**Speed-Run Route:**
1. Build offices + condos → reach 300 pop (2 stars)
2. Expand vertically → reach 1,000 pop + security (3 stars)
3. **BUILD 16 PARTY HALLS** → instant +800 pop (now at ~1,800)
4. Build condos in mass (disconnected, delay sale)
5. Connect condos when needed → spike to 5,000+ (4 stars, metro unlocked)
6. Basement shops + more condos → 10,000 (5 stars)
7. Spam condos vertically to floor 100 → 15,000
8. Cathedral → Wedding → **TOWER STATUS**

**Record times:** ~10-15 hours for experienced players (real-time, fast speed)

### Stress Management Mastery

**Critical Insight:** Stress = Death in SimTower

**Anti-Stress Checklist:**
- ✅ Waiting Car Response = 1 (all standard elevators)
- ✅ 3-5 cars per shaft minimum
- ✅ Never service more than 15 floors per shaft
- ✅ Stairs for offices + fast food (remove from elevator network)
- ✅ Escalators for retail + restaurants (reduce elevator load)
- ✅ Multiple shafts per zone (redundancy)
- ✅ Watch stress colors during rush hour (pink = add cars, red = emergency)

**If Stress Is High:**
1. **Immediate:** Add elevator cars (up to 8 per shaft)
2. **Short-term:** Build new shaft for same zone
3. **Long-term:** Add stairs/escalators, redesign floor layout

### Aesthetic Tower Design

**For players who care about looks:**

**Symmetry:**
- Mirror left/right sides of tower
- Consistent floor layouts (offices on X, condos on X+1, etc.)
- Centered lobbies/skylobbies

**Theme Floors:**
- "Retail District" (all shops on same floor)
- "Hotel Zone" (all hotel rooms clustered)
- "Office Park" (all offices together)

**Visual Variety:**
- Mix facility types for varied colors
- Stagger heights (step-pyramid effect)
- Use multi-level lobbies for grand entrances

**Elevator Aesthetics:**
- Consistent shaft placement (all on left, or all on right)
- Symmetrical shaft distribution
- Express elevators in center, standards on edges

---

## Conclusion

SimTower is a deceptively deep game wrapped in charming 1994 pixel art. Its core loop — build, optimize elevators, expand, repeat — creates an addictive "just one more floor" experience.

**What Made It Special:**
- **Focused Scope:** Vertical building only (unique constraint)
- **Elevator Mastery:** Transportation as primary challenge (not just decoration)
- **Emergent Complexity:** Simple rules (sims need <5 trips, want low stress) create intricate optimization puzzles
- **Low-Pressure Sandbox:** No fail state, play at your own pace
- **Accessible Depth:** Easy to start, hard to perfect

**Legacy:**
- Inspired Yoot Tower (spiritual sequel)
- Influenced Project Highrise (modern homage)
- Cult classic status (still played via DOSBox/emulators)

**For Modern Developers:**
SimTower proves that constraint breeds creativity. By limiting the player to a single vertical slice, every decision matters: floor placement, elevator programming, noise management. It's a masterclass in focused game design.

---

**This reference compiled from:**
- SimTower Fandom Wiki (simtower.fandom.com)
- Community gameplay experience
- Game mechanics analysis
- Player strategy guides

**Version:** Original 1994 SimTower: The Vertical Empire (PC/Mac)

**Last Updated:** January 2026 (for OpenTower development reference)
