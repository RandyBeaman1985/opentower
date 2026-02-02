# 🧠 Population AI System - Making People ALIVE

> **OpenTower's living, breathing population AI inspired by SimTower (1995)**

## Overview

The Population AI makes every person in your tower feel **ALIVE** with:
- **Needs & Wants:** Hunger, energy, comfort, social interaction
- **Satisfaction Tracking:** People remember experiences and rate your tower
- **Personality:** Each person has unique patience, optimism, and preferences
- **Consequences:** Happy people stay and attract others; unhappy people leave and tank your rating

---

## 🎭 Person Types

### 1. **Office Workers**
- **Schedule:** Arrive 8 AM, lunch 12 PM, return 1 PM, leave 5 PM
- **Needs:** Food at lunch, fast elevators, pleasant workspace
- **Behavior:** Seek nearby restaurants, prefer short commutes
- **Revenue:** None (but need them for population)

### 2. **Residents** (Future)
- **Schedule:** Leave for work 7 AM, return 7 PM
- **Needs:** Privacy, quiet, nice amenities
- **Behavior:** Go to work, come home, use building facilities
- **Revenue:** Monthly rent (affected by satisfaction)

### 3. **Hotel Guests** (Future)
- **Schedule:** Check in evening, check out morning
- **Needs:** Clean room, room service, entertainment
- **Behavior:** Explore tower, use facilities, demand quality
- **Revenue:** Nightly rate (affected by satisfaction)

### 4. **Shoppers**
- **Schedule:** Random arrivals
- **Needs:** Find stores, parking, pleasant environment
- **Behavior:** Browse shops, eat food, leave
- **Revenue:** Shop purchases

### 5. **VIPs** (Special Events)
- **Schedule:** Event-driven
- **Needs:** Luxury, fast elevators, exclusive access
- **Behavior:** Demanding, high expectations, big tips
- **Revenue:** Event tickets, prestige boost

---

## 🧠 AI System Components

### 1. **Needs System** (like The Sims)

Every person tracks these needs (0-100):

```typescript
{
  hunger: 70,    // Decays over time, critical at < 30
  energy: 80,    // Decays with activity, critical at < 20
  comfort: 90,   // Affected by waiting, crowding, facilities
  social: 60,    // Improved by entertainment, events
  bladder: 100   // (Future: for restroom system)
}
```

**Need decay rates:**
- Walking: 1.5x energy drain, 1.0x hunger
- Waiting for elevator: 2.0x comfort drain
- Idle at destination: +0.1 comfort recovery

**Urgent thresholds:**
- Hunger < 30 → Seek food immediately
- Energy < 20 → Go home/rest (residents only)

---

### 2. **Satisfaction System**

People rate your tower on multiple dimensions (0-5 stars each):

```typescript
{
  overall: 85,              // 0-100 composite score
  elevatorWaitRating: 4.5,  // Based on wait times
  facilitiesRating: 4.0,    // Food, shops, entertainment available
  commuteRating: 4.2,       // Ease of getting around
  
  // Tracking
  totalElevatorWaits: 12,
  totalElevatorWaitTime: 1200,  // ticks
  lastComplaint: "slow_elevators",
  complaintCount: 3
}
```

**Rating changes:**
- **Fast elevator** (< 5 sec wait): +0.1 elevator rating, +2 overall
- **Slow elevator** (> 30 sec): -0.5 elevator rating, -5 overall
- **Food available**: +0.2 facilities rating, +5 overall
- **No food when hungry**: -0.2 facilities rating, complaint

**Complaints trigger at:**
- 20% chance when elevator wait > 30 seconds
- 10% chance when no food available during lunch
- Random when path blocked or goal unreachable

---

### 3. **Personality System**

Each person has unique traits (randomly generated):

```typescript
{
  patience: 65,      // 0-100: How long they'll wait before complaining
  sociability: 80,   // 0-100: How much they interact with others
  cleanliness: 55,   // 0-100: How much they care about facilities
  optimism: 70       // 0-100: Affects satisfaction decay rate
}
```

**Personality effects:**
- **Low patience** (< 40): Complains faster, higher stress from waiting
- **High optimism** (> 80): Satisfaction decays slower, forgives mistakes
- **High cleanliness** (> 70): Demands better facilities, rates harshly

---

### 4. **Decision-Making AI**

Every 60 ticks (1 second), idle people make decisions:

**Priority order:**
1. **Urgent needs** (hunger < 30, energy < 20)
2. **Scheduled events** (work, lunch, leave)
3. **Random activities** (1% chance: shopping, entertainment)
4. **Idle** (stay at current location, recover comfort)

**Goal-driven behavior:**
- `work` → Navigate to office building
- `eat` → Find nearest restaurant, remember favorite
- `rest` → Go home (residents only)
- `shopping` → Browse shops randomly
- `entertainment` → Visit party hall / cinema

**Smart pathfinding:**
- Prefer known elevator shafts (learning)
- Avoid buildings with bad experiences
- Choose favorite restaurant if known

---

## 📊 Consequences System

### Population Happiness Breakdown

```typescript
{
  happyPeopleCount: 45,         // Satisfaction >= 80
  satisfiedPeopleCount: 30,     // Satisfaction 60-79
  unhappyPeopleCount: 15,       // Satisfaction 40-59
  criticallyUnhappyCount: 10,   // Satisfaction < 40
  
  // Effects on tower
  immigrationBonus: +25%,       // -50% to +100% based on happiness %
  rentIncomeMultiplier: 1.25x,  // 0.5x to 1.5x based on happiness
  starRatingPenalty: 0,         // -2 stars if >50% unhappy
  
  pendingLeaves: ["person-123"] // People about to rage-quit
}
```

### Immigration System (Auto-spawn new workers)

**Rate calculation:**
```
baseChance = starRating * 0.2  // 1★ = 10%, 5★ = 100%
finalChance = baseChance * (1 + immigrationBonus)
spawnCount = ceil(starRating / 2)  // 1-2 workers per check
```

**Cooldown:** 300 ticks (~5 seconds) between checks

**Requirements:**
- Empty office spaces available
- Tower star rating > 1

### Star Rating Impact

The tower's star rating now considers **population happiness**:

```typescript
calculateStarRating(happinessPercent, dailyIncome) {
  // 3★: 500+ pop, 60%+ happiness, $50K+ daily income
  // 2★: 100+ pop, 50%+ happiness, $10K+ daily income
  // 1★: Default
}
```

**Critical unhappiness penalty:**
- \>30% unhappy: -1 star
- \>50% unhappy: -2 stars

### Leaving System

People will **rage-quit** when:
- Satisfaction < 20 (5% chance per decision cycle)
- Critical complaints accumulate (>5 total)
- Bad experiences in memory (>5 negative events)

**On leaving:**
- Removed from building occupancy
- AI data cleaned up
- Console log: `"😡 [Name] is FED UP and LEAVING!"`

---

## 🎨 Visual Feedback

### Person States (Emoji Indicators)

People show their current state with emojis:

```
😊 Happy       (stress < 30, mood > 0.9)
😰 Stressed    (stress 30-70)
😡 Angry       (stress > 70 OR mood < 0.6)
🚶 Walking
⏰ Waiting for elevator
🛗 Riding elevator
🧍 Idle
🚪 Leaving
```

### Thought Bubbles

People express thoughts that appear as UI bubbles:

**Positive reactions:**
- `"😊"` - General happiness
- `"👍"` - Good experience
- `"Nice!"` / `"Perfect!"` - Fast elevator, good food

**Negative reactions:**
- `"😕"` `"Hmm..."` - Minor issue (slow walk)
- `"😤"` `"Come on!"` `"Seriously?!"` - Major issue (long wait)
- `"😡"` `"This is ridiculous!"` `"Fed up!"` - Critical (leaving soon)

---

## 🔧 Integration Guide

### 1. Spawning People

```typescript
// Old way
const person = new Person({ type: 'worker', floor: 1, tile: 50, schedule });
populationSystem.addPerson(person);

// New way with AI
const person = populationSystem.spawnPersonWithAI({
  type: 'worker',
  floor: 1,
  tile: 50,
  schedule: DEFAULT_SCHEDULES.worker
});
// AI data automatically initialized!
```

### 2. Getting Population Insights

```typescript
// Get consequences for economy/star rating
const consequences = populationSystem.getPopulationConsequences();

console.log(`Happy: ${consequences.happyPeopleCount}`);
console.log(`Immigration bonus: ${consequences.immigrationBonus}%`);
console.log(`Rent multiplier: ${consequences.rentIncomeMultiplier}x`);

// Integrate with star rating
towerManager.updateStarRatingFactors(
  populationSystem.getHappinessPercent(),
  economicSystem.getDailyIncome()
);

// Apply rent income bonus
const rentIncome = baseRent * consequences.rentIncomeMultiplier;
```

### 3. Debug View (Future UI)

```typescript
// Get AI data for a person
const aiData = populationSystem.getPersonAI(personId);

console.log(`Name: ${person.name}`);
console.log(`Hunger: ${aiData.needs.hunger}/100`);
console.log(`Satisfaction: ${aiData.satisfaction.overall}/100`);
console.log(`Current goal: ${aiData.currentGoal}`);
console.log(`Complaints: ${aiData.satisfaction.complaintCount}`);
console.log(`Last thought: "${person.currentThought}"`);
```

---

## 📈 Tuning Parameters

### Need Decay Rates
```typescript
// In PopulationAI.ts
NEED_DECAY_RATE = 0.05        // Base hunger/energy decay
SATISFACTION_DECAY_RATE = 0.01 // Natural satisfaction decay
```

### Behavior Thresholds
```typescript
HUNGER_URGENT_THRESHOLD = 30   // When people MUST eat
ENERGY_URGENT_THRESHOLD = 20   // When residents must rest
SATISFACTION_UNHAPPY_THRESHOLD = 40   // Unhappy state
SATISFACTION_LEAVING_THRESHOLD = 20   // Will leave soon
```

### Decision Timing
```typescript
DECISION_INTERVAL = 60  // Ticks between AI decisions (1 second)
```

### Immigration
```typescript
// In PopulationSystem.ts
immigrationCooldownTicks = 300  // 5 seconds between checks
```

---

## 🎯 Example Scenarios

### Scenario 1: Happy Worker

```
8:00 AM - Alex arrives at tower
  ↓ Fast elevator (3 sec wait)
  ✅ +2 satisfaction, thinks "👍"
  
12:00 PM - Lunch time, seeks food
  ↓ Finds restaurant 2 floors down
  ↓ Fast elevator again
  ✅ Eats at restaurant, +60 hunger, +5 satisfaction
  ✅ Restaurant becomes favorite
  
5:00 PM - Leaves work
  ↓ Elevator wait 4 seconds
  ✅ +0.1 elevator rating
  
Overall: 87 satisfaction (HAPPY)
Effect: Immigration bonus +15%
```

### Scenario 2: Frustrated Worker

```
8:00 AM - Jamie arrives at tower
  ↓ Elevator wait 45 seconds
  ❌ -5 satisfaction, thinks "😤 Come on!"
  ❌ Complaint: "slow_elevators"
  
12:00 PM - Lunch time, seeks food
  ↓ No restaurants available
  ❌ -10 satisfaction, thinks "😤 There's nowhere to eat!"
  ❌ Complaint: "no_food"
  ❌ +5 stress from hunger
  
5:00 PM - Leaves work
  ↓ Elevator wait 60 seconds
  ❌ -10 satisfaction, thinks "😡 This is ridiculous!"
  
Overall: 18 satisfaction (CRITICAL)
Next decision: 5% chance to LEAVE
```

---

## 🚀 Future Enhancements

### Phase 2: Social Dynamics
- **Crowding:** Stress increases with too many people in small space
- **Social interactions:** People chat, form relationships
- **Viral complaints:** Unhappy people spread negativity to others

### Phase 3: Advanced Personality
- **Preferences:** Some prefer fast food, others fine dining
- **Routines:** Learn patterns, form habits
- **Loyalty:** Long-term residents are more forgiving

### Phase 4: Events System
- **VIP visits:** Special guests with high demands
- **Parties:** Social events boost mood
- **Emergencies:** Fire/bomb test stress resilience

---

## 📝 Architecture Notes

### Performance

- **AI updates:** Every 60 ticks (not every tick)
- **Decision-making:** Only for idle people
- **Pathfinding:** Cached and reused
- **Memory:** ~500 bytes per person (AI data)

### Scalability

Tested with:
- 100 people: Smooth (60 FPS)
- 500 people: Good (45+ FPS)
- 1000+ people: Consider batching AI updates

### Data Flow

```
Person.update() (every tick)
  ↓
PopulationAI.updatePerson() (every 60 ticks)
  ↓ Needs decay
  ↓ Satisfaction calculation
  ↓ Decision-making
  ↓
PopulationSystem.getConsequences()
  ↓
Game.update() → TowerManager.updateStarRating()
```

---

## 🐛 Debugging

### Enable AI Logging

```typescript
// In PopulationAI.ts
console.log(`🍔 ${person.name} is HUNGRY - seeking food`);
console.log(`😤 Person complains: "slow_elevators"`);
console.log(`😡 ${person.name} is FED UP and LEAVING!`);
```

### Check Person State

```typescript
const person = populationSystem.getPerson(personId);
const aiData = populationSystem.getPersonAI(personId);

console.log(person.getStatusEmoji(), person.state);
console.log(`Stress: ${person.stress}/100`);
console.log(`Satisfaction: ${aiData.satisfaction.overall}/100`);
console.log(`Current thought: "${person.currentThought}"`);
```

---

## 🎮 How to Make People Happy

**DO:**
- ✅ Build multiple elevator shafts (< 5 second wait)
- ✅ Place restaurants near offices (short commute)
- ✅ Provide variety (fast food + fine dining)
- ✅ Keep facilities clean and accessible
- ✅ Grow population steadily (not too fast)

**DON'T:**
- ❌ Single elevator shaft (20+ second waits)
- ❌ No food on office floors (hungry workers)
- ❌ Overcrowded buildings (stress)
- ❌ Long horizontal walks (fatigue)
- ❌ Ignore complaints (they accumulate!)

---

**Built with ❤️ for OpenTower**  
*Making tower management games great again, one AI person at a time.*
