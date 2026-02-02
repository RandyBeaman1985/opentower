# TimeSystem Quick Reference

## 🚀 Quick Start

```typescript
import { TimeSystem, TimeSpeed } from '@simulation/TimeSystem';

// Create and start
const timeSystem = new TimeSystem();
timeSystem.start();

// Game loop
const tickCount = timeSystem.update(performance.now());
for (let i = 0; i < tickCount; i++) {
  // Your simulation tick
}
```

## ⚡ Speed Control

```typescript
timeSystem.pause();                      // Freeze time
timeSystem.resume();                     // Normal speed
timeSystem.setSpeed(TimeSpeed.NORMAL);   // 1x
timeSystem.setSpeed(TimeSpeed.FAST);     // 3x
timeSystem.setSpeed(TimeSpeed.ULTRA);    // 10x
timeSystem.togglePause();                // Toggle pause/play
```

## ⏰ Time Queries

```typescript
// Single values
timeSystem.getHour();        // 0-23
timeSystem.getMinute();      // 0-59
timeSystem.getQuarter();     // 1-4
timeSystem.getYear();        // 1+
timeSystem.isWeekend();      // boolean
timeSystem.isRushHour();     // boolean

// Formatted strings
timeSystem.getFormattedTime();  // "8:32 AM"
timeSystem.getFormattedDate();  // "Mon Q1 Year 1"

// Complete state
const state = timeSystem.getTimeState();
// Returns: { tick, hour, minute, day, quarter, year, 
//            speed, isPaused, isWeekend, isRushHour,
//            timeString, dateString, timeOfDay, ... }
```

## 📅 Time Periods

```typescript
import { TimePeriod } from '@simulation/TimeSystem';

const period = timeSystem.getTimePeriod();

switch (period) {
  case TimePeriod.EARLY_MORNING:  // 12 AM - 6 AM
  case TimePeriod.MORNING:         // 6 AM - 9 AM
  case TimePeriod.WORK_HOURS:      // 9 AM - 5 PM
  case TimePeriod.EVENING:         // 5 PM - 10 PM
  case TimePeriod.NIGHT:           // 10 PM - 12 AM
}

// Or check directly
if (timeSystem.isTimePeriod(TimePeriod.WORK_HOURS)) {
  // Do office stuff
}
```

## 📢 Schedule Events

```typescript
// Simple event
timeSystem.scheduleEvent({
  id: 'morning_coffee',
  name: 'Coffee Time',
  description: 'Daily coffee break',
  hour: 10,
  minute: 30,
  recurring: true,
  callback: () => {
    console.log('Coffee time!');
  },
});

// Weekday only
timeSystem.scheduleEvent({
  id: 'office_open',
  hour: 9,
  recurring: true,
  weekdaysOnly: true,
  callback: officeOpenCallback,
});

// Weekend only
timeSystem.scheduleEvent({
  id: 'brunch',
  hour: 11,
  recurring: true,
  weekendsOnly: true,
  callback: brunchCallback,
});

// Control events
timeSystem.setEventEnabled('morning_coffee', false);
timeSystem.unscheduleEvent('morning_coffee');
```

## 🎨 Visual State

```typescript
const visual = timeSystem.getTimeOfDayState();

// Use for rendering
skySprite.tint = visual.skyGradient.topColor;

if (visual.buildingsShowLights) {
  // Render window lights
}

console.log(visual.label);  // "Morning", "Evening", etc.
console.log(visual.period); // TimeOfDay.MORNING, etc.
```

## 📡 Listen to Events

```typescript
import { getEventBus } from '@core/EventBus';

// Hour changes
getEventBus().on('HOUR_CHANGE', (event) => {
  console.log(`Hour: ${event.hour}`);
});

// Day changes
getEventBus().on('DAY_CHANGE', (event) => {
  console.log(`Day: ${event.dayOfWeek}`);
});

// Quarter end (rent time!)
getEventBus().on('QUARTER_END', (event) => {
  collectRent();
});

// Scheduled events
getEventBus().on('TIME_EVENT', (event) => {
  console.log(event.message);
});

// Speed changes
getEventBus().on('SPEED_CHANGE', (event) => {
  console.log(`${event.oldSpeed}x → ${event.newSpeed}x`);
});
```

## 💾 Save/Load

```typescript
// Save
const saveData = {
  time: timeSystem.serialize(),
  // ... other game data
};
localStorage.setItem('save', JSON.stringify(saveData));

// Load
const loadData = JSON.parse(localStorage.getItem('save'));
timeSystem.deserialize(loadData.time);
```

## 🎮 Common Patterns

### Adjust NPC behavior by time
```typescript
const period = timeSystem.getTimePeriod();
const npcActivity = {
  [TimePeriod.EARLY_MORNING]: 0.1,
  [TimePeriod.MORNING]: 0.7,
  [TimePeriod.WORK_HOURS]: 1.0,
  [TimePeriod.EVENING]: 0.8,
  [TimePeriod.NIGHT]: 0.2,
}[period];
```

### Elevator demand calculation
```typescript
let demand = 20; // Base
if (timeSystem.isRushHour()) demand += 60;
if (timeSystem.isTimePeriod(TimePeriod.WORK_HOURS)) demand += 30;
if (timeSystem.isWeekend()) demand -= 20;
```

### Restaurant traffic
```typescript
const hour = timeSystem.getHour();
let traffic = 10;
if (hour >= 12 && hour < 13) traffic += 70;  // Lunch
if (hour >= 18 && hour < 20) traffic += 80;  // Dinner
if (timeSystem.isWeekend()) traffic += 20;
```

### Dynamic pricing
```typescript
const multiplier = timeSystem.isRushHour() ? 1.5 : 1.0;
const price = basePrice * multiplier;
```

## 🔍 Direct Access (Advanced)

```typescript
// If you need the underlying systems
const clock = timeSystem.getClock();            // GameClock state
const clockMgr = timeSystem.getClockManager();  // ClockManager
const todSys = timeSystem.getTimeOfDaySystem(); // TimeOfDaySystem
```

## ⚠️ Common Mistakes

❌ **Don't** create your own ClockManager:
```typescript
const clock = new ClockManager(); // NO!
```

✅ **Do** use the TimeSystem:
```typescript
const timeSystem = new TimeSystem();
// or get from game
const timeSystem = game.getTimeSystem();
```

---

❌ **Don't** manually update TimeOfDay:
```typescript
timeOfDay.update(hour, minute); // NO!
```

✅ **Do** let TimeSystem handle it:
```typescript
timeSystem.update(currentTime);
// TimeOfDay updated automatically
```

---

❌ **Don't** hardcode time checks:
```typescript
if (clock.gameHour === 9) { ... } // Fragile!
```

✅ **Do** use scheduled events:
```typescript
timeSystem.scheduleEvent({
  hour: 9,
  callback: () => { ... }
});
```

## 📚 Full Documentation

See `docs/TimeSystem.md` for complete documentation.
