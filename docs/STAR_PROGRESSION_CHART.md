# Star Rating Progression Chart

## Visual Progression Path

```
┌─────────────────────────────────────────────────────────────────┐
│                    STAR RATING PROGRESSION                       │
└─────────────────────────────────────────────────────────────────┘

     1★                    2★                    3★
  ┌──────┐             ┌──────┐             ┌──────┐
  │START │────────────▶│  +   │────────────▶│  ++  │
  │HERE  │   100 pop   │FOOD  │   300 pop   │SPEED │
  └──────┘    60% sat  └──────┘    65% sat  └──────┘
  Max: 10              Max: 20              Max: 35
  floors               floors               floors
     │                    │                    │
  Basics            Restaurants         Express
  Office            Hotels               Elevators
  Apartment         Parking              Medical
  Shop                                   Security
     │                    │                    │
     └────────────────────┴────────────────────┘
                         │
                         ▼

     4★                    5★                  TOWER
  ┌──────┐             ┌──────┐             ┌──────┐
  │ +++  │────────────▶│ ++++ │────────────▶│ 👑   │
  │METRO │   1000 pop  │LUXURY│  2000 pop   │LEGEND│
  └──────┘    70% sat  └──────┘  80% sat    └──────┘
  Max: 50              Max: 100  + VIP visit Max: 150
  floors               floors    + Cathedral floors
     │                    │                    │
  Recycling           Theater            Cathedral
  Metro               Spa                Observatory
  Fitness             Rooftop            Broadcast
                      Helipad
     │                    │                    │
     └────────────────────┴────────────────────┘
```

## Unlock Timeline

```
Timeline (hours of gameplay):

0h ─┬─ 1★ START
    │  • Build basic rooms
    │  • Attract first tenants
    │  • Learn the game
    │
2h ─┼─ 2★ UNLOCK
    │  • Add restaurants (feed workers)
    │  • Build hotel rooms (transient income)
    │  • Manage parking
    │
5h ─┼─ 3★ UNLOCK
    │  • Go vertical with express elevators
    │  • Add medical + security
    │  • Handle more complex problems
    │
10h ┼─ 4★ UNLOCK
    │  • Connect metro (external traffic)
    │  • Start recycling (passive income)
    │  • Optimize tower layout
    │
20h ┼─ 5★ UNLOCK
    │  • Add luxury amenities
    │  • Maximize satisfaction
    │  • Prepare for TOWER
    │
30h ┼─ TOWER UNLOCK
    │  • Complete VIP visit
    │  • Build cathedral
    │  • Achieve legend status
    └─
```

## Requirements Matrix

```
┌─────────┬──────────┬─────────┬─────────┬──────────────────┐
│ Rating  │ Pop.     │ Sat.    │ Max     │ Key Unlocks      │
│         │ Required │ Required│ Problems│                  │
├─────────┼──────────┼─────────┼─────────┼──────────────────┤
│ 1★      │ 0        │ 0%      │ ∞       │ Basic buildings  │
│ 2★      │ 100      │ 60%     │ 5       │ Restaurant/Hotel │
│ 3★      │ 300      │ 65%     │ 3       │ Express/Medical  │
│ 4★      │ 500      │ 70%     │ 2       │ Metro/Recycling  │
│ 5★      │ 1,000    │ 75%     │ 1       │ Luxury amenities │
│ TOWER   │ 2,000    │ 80%     │ 0       │ Cathedral        │
└─────────┴──────────┴─────────┴─────────┴──────────────────┘

Note: "Max Problems" = fires + infestations + other active issues
```

## Economic Impact

```
Land Value Multiplier by Rating:

1★  ▓░░░░░░░░░  1.0x  (baseline)
2★  ▓▓▓░░░░░░░  1.3x  (+30%)
3★  ▓▓▓▓▓░░░░░  1.6x  (+60%)
4★  ▓▓▓▓▓▓▓░░░  2.0x  (+100%)
5★  ▓▓▓▓▓▓▓▓░░  2.5x  (+150%)
TOWER ▓▓▓▓▓▓▓▓▓▓  3.0x  (+200%)

Higher rating = higher rent = more income
```

## Floor Limits

```
Vertical Expansion by Rating:

1★   [10 floors]   ▓▓▓▓▓▓▓▓▓▓
2★   [20 floors]   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
3★   [35 floors]   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
4★   [50 floors]   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
5★   [100 floors]  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓... (x2)
TOWER [150 floors] ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓... (x3)

Can't build higher until you earn the rating!
```

## Demotion Risk Zones

```
Safe Zone vs. Danger Zone:

Rating: 3★ (requires 300 pop, 65% sat, <3 problems)

Population:
  450+ ██████████ SAFE
  350  ████████░░ OK
  310  ██████░░░░ RISKY
  300  ████░░░░░░ DANGER - one crisis away from demotion
  299  ░░░░░░░░░░ DEMOTED to 2★

Satisfaction:
  75%+ ██████████ SAFE
  70%  ████████░░ OK
  67%  ██████░░░░ RISKY
  65%  ████░░░░░░ DANGER - fix problems NOW
  64%  ░░░░░░░░░░ DEMOTED to 2★

Problems:
  0-1  ██████████ SAFE
  2    ████████░░ OK
  3    ████░░░░░░ DANGER - at limit
  4+   ░░░░░░░░░░ DEMOTED to 2★

Strategy: Build ABOVE minimum thresholds for safety margin
```

## Special: Path to TOWER

```
┌───────────────────────────────────────────────────┐
│         THE ROAD TO TOWER STATUS                  │
├───────────────────────────────────────────────────┤
│                                                   │
│  Step 1: Reach 5★                                │
│  ├─ 1,000 population                             │
│  ├─ 75% satisfaction                              │
│  └─ Keep problems < 1                             │
│                                                   │
│  Step 2: Build Cathedral (5★ unlock)             │
│  ├─ Requires significant space                    │
│  ├─ Expensive to build                            │
│  └─ Marks: completeEvent("cathedral_built") ✓    │
│                                                   │
│  Step 3: Grow to 2,000 population                │
│  ├─ Double your tower size                        │
│  ├─ Maintain 80% satisfaction                     │
│  └─ ZERO problems allowed                         │
│                                                   │
│  Step 4: VIP Visit Event                          │
│  ├─ Triggered randomly when conditions met        │
│  ├─ VIP tours your tower for ~60 seconds          │
│  ├─ Must maintain high satisfaction during visit  │
│  └─ Marks: completeEvent("vip_visit_success") ✓  │
│                                                   │
│  Step 5: TOWER STATUS ACHIEVED! 👑               │
│  ├─ Unlock cathedral, observatory, broadcast      │
│  ├─ Maximum prestige                              │
│  └─ You've built a legend                         │
│                                                   │
└───────────────────────────────────────────────────┘
```

## Example Game Flow

```
Player Session Example:

00:00 │ Start game - 1★
00:15 │ Built first offices & apartments
00:30 │ Population: 50 (50% to 2★)
01:00 │ Population: 100 🎉 PROMOTED TO 2★
      │ Unlocked: Restaurants, Hotels
01:15 │ Built first restaurant
01:45 │ Satisfaction increased to 70%
02:30 │ Population: 300 🎉 PROMOTED TO 3★
      │ Unlocked: Express elevators
03:00 │ Built express elevator - going vertical!
04:00 │ Population: 500 🎉 PROMOTED TO 4★
      │ Fire breaks out!
04:05 │ ⚠️ Too many problems - DEMOTED TO 3★
      │ Lost access to metro station 💔
04:10 │ Fire extinguished
04:15 │ Population back up, satisfaction restored
04:20 │ 🎉 RE-PROMOTED TO 4★
      │ Lesson learned: maintain your tower!
      
[... several hours later ...]

10:00 │ Population: 2,000, Cathedral built
      │ Waiting for VIP visit...
10:30 │ 🎩 VIP has arrived!
      │ Maintaining satisfaction at 85%...
11:30 │ ✓ VIP visit successful!
      │ 👑 PROMOTED TO TOWER STATUS
      │ 🏆 ACHIEVEMENT UNLOCKED
      │ You've built a legend!
```

## Quick Reference

**To Promote:**
- Hit population threshold ✓
- Maintain satisfaction ✓
- Solve problems quickly ✓
- (TOWER only) Complete special events ✓

**To Avoid Demotion:**
- Keep population above threshold
- Fix problems IMMEDIATELY
- Monitor satisfaction constantly
- Don't rest on your laurels

**Pro Tips:**
1. Build 20-30% above minimum population for safety
2. Maintain satisfaction 5-10% above requirement
3. Always have firefighters/security ready
4. Plan for next tier before you need it
5. Demotion hurts - prevention is everything

---

Remember: Stars aren't just a score. They're your **identity**.
