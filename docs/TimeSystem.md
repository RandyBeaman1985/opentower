# TimeSystem Documentation

## Overview

The `TimeSystem` is the central time management system for OpenTower, inspired by SimTower (1995). It drives the entire gameplay simulation through a sophisticated time progression system.

## Features

### 1. Time Units

The TimeSystem tracks multiple time units that drive different aspects of gameplay:

- **Ticks** - Simulation steps (100ms fixed timestep)
- **Seconds/Minutes/Hours** - 24-hour day cycle
- **Days** - 7-day week (weekday vs weekend behavior)
- **Weeks** - Used for quarterly tracking
- **Quarters** - Rent collection periods (13 weeks each)
- **Years** - Long-term progression

### 2. Day/Night Cycle

Visual and gameplay changes based on time of day:

**Visual Changes:**
- Sky color gradients (deep blue night → orange dawn → bright day → purple dusk)
- Window lights (on from 6 PM to 7 AM)
- Smooth transitions between periods

**Behavioral Changes:**
- **Early Morning (12 AM - 6 AM)**: Building quiet, minimal activity
- **Morning (6 AM - 9 AM)**: Workers arrive, offices prepare
- **Work Hours (9 AM - 5 PM)**: Offices busy, lunch rush at noon
- **Evening (5 PM - 10 PM)**: Workers leave, dinner rush, restaurants busy
- **Night (10 PM - 12 AM)**: Hotels fill up, building winds down

### 3. Scheduled Events

Built-in SimTower-style events:

| Time | Event | Description |
|------|-------|-------------|
| 6:00 AM | Workers Arrive | Office workers begin commuting (weekdays only) |
| 9:00 AM | Offices Open | Office buildings begin full operations (weekdays only) |
| 12:00 PM | Lunch Rush | Restaurants and fast food get busy |
| 5:00 PM | Workers Leave | Office workers head home (weekdays only) |
| 6:00 PM | Dinner Rush | Evening restaurant traffic increases |
| 10:00 PM | Hotel Night | Hotels reach peak occupancy |
| 12:00 AM | Midnight Quiet | Building activity winds down |

### 4. Speed Controls

Four speed presets for gameplay control:

- **Paused (0x)** - Freeze time, plan your tower
- **Normal (1x)** - Standard gameplay speed
- **Fast (3x)** - Speed up routine periods
- **Ultra (10x)** - Time-lapse mode for testing

## Usage Examples

### Basic Setup

```typescript
import { TimeSystem, TimeSpeed } from '@simulation/TimeSystem';

// Create time system
const timeSystem = new TimeSystem();

// Start the time system
timeSystem.start();

// In game loop
const tickCount = timeSystem.update(performance.now());
for (let i = 0; i < tickCount; i++) {
  // Run your simulation tick
}
```

### Speed Control

```typescript
// Pause the game
timeSystem.pause();

// Resume at normal speed
timeSystem.resume();

// Set specific speed
timeSystem.setSpeed(TimeSpeed.FAST);     // 3x speed
timeSystem.setSpeed(TimeSpeed.ULTRA);    // 10x speed

// Toggle pause
timeSystem.togglePause();

// Check if paused
if (timeSystem.isPaused()) {
  // Show pause menu
}
```

### Time Queries

```typescript
// Get comprehensive time state
const state = timeSystem.getTimeState();
console.log(state.timeString);  // "8:32 AM"
console.log(state.dateString);  // "Mon Q1 Year 1"
console.log(state.isWeekend);   // false
console.log(state.isRushHour);  // true

// Quick queries
const hour = timeSystem.getHour();              // 0-23
const minute = timeSystem.getMinute();          // 0-59
const isWeekend = timeSystem.isWeekend();       // true/false
const quarter = timeSystem.getQuarter();        // 1-4
const year = timeSystem.getYear();              // 1+

// Time period for gameplay logic
const period = timeSystem.getTimePeriod();
// Returns: EARLY_MORNING, MORNING, WORK_HOURS, EVENING, or NIGHT

if (timeSystem.isTimePeriod(TimePeriod.WORK_HOURS)) {
  // Offices should be busy
}
```

### Custom Scheduled Events

```typescript
// Schedule a custom event
timeSystem.scheduleEvent({
  id: 'morning_meeting',
  name: 'Morning Meeting',
  description: 'Daily 10 AM standup',
  hour: 10,
  minute: 0,
  recurring: true,
  weekdaysOnly: true,
  callback: () => {
    console.log('Time for the daily meeting!');
    // Trigger your custom event
  },
});

// Disable an event
timeSystem.setEventEnabled('morning_meeting', false);

// Remove an event
timeSystem.unscheduleEvent('morning_meeting');

// Get all scheduled events
const events = timeSystem.getScheduledEvents();
```

### Rendering Integration

```typescript
// Get visual state for rendering
const timeOfDay = timeSystem.getTimeOfDayState();

// Apply sky gradient
renderer.background.tint = timeOfDay.skyGradient.topColor;

// Toggle building lights
if (timeOfDay.buildingsShowLights) {
  // Render lit windows
}

// Get smooth interpolation for animations
const alpha = timeSystem.getInterpolationAlpha();
// Use alpha for smooth movement between ticks
```

### Save/Load

```typescript
// Save time state
const saveData = timeSystem.serialize();
localStorage.setItem('timeState', JSON.stringify(saveData));

// Load time state
const loadData = JSON.parse(localStorage.getItem('timeState'));
timeSystem.deserialize(loadData);
```

## Integration with Game.ts

The TimeSystem is integrated into the main Game class:

```typescript
// In Game.ts
private timeSystem: TimeSystem;

constructor() {
  this.timeSystem = new TimeSystem();
}

// Game loop
private gameLoop(currentTime: number) {
  // Update time and get tick count
  const tickCount = this.timeSystem.update(currentTime);
  
  // Process simulation ticks
  for (let i = 0; i < tickCount; i++) {
    this.simulationTick();
  }
  
  // Render with time state
  this.render();
}

// Public API
getTimeSystem(): TimeSystem {
  return this.timeSystem;
}
```

## Event System Integration

The TimeSystem emits events through the EventBus:

```typescript
import { getEventBus } from '@core/EventBus';

// Listen for time events
getEventBus().on('HOUR_CHANGE', (event) => {
  console.log(`Hour changed to ${event.hour}`);
});

getEventBus().on('DAY_CHANGE', (event) => {
  console.log(`New day: ${event.day} (day ${event.dayOfWeek})`);
});

getEventBus().on('QUARTER_END', (event) => {
  console.log(`Quarter ${event.quarter} ended. Collect rent!`);
});

getEventBus().on('QUARTER_START', (event) => {
  console.log(`Starting Q${event.quarter} Year ${event.year}`);
});

getEventBus().on('TIME_EVENT', (event) => {
  console.log(`Scheduled event: ${event.message}`);
});

getEventBus().on('SPEED_CHANGE', (event) => {
  console.log(`Speed changed from ${event.oldSpeed}x to ${event.newSpeed}x`);
});
```

## Architecture

### Component Hierarchy

```
TimeSystem (Facade/Coordinator)
├── ClockManager (Time progression)
│   ├── Fixed timestep accumulator
│   ├── Speed multiplier
│   └── Tick advancement
├── TimeOfDaySystem (Visual state)
│   ├── Sky gradient calculation
│   ├── Light state
│   └── Smooth transitions
└── Event Scheduler
    ├── Recurring events
    ├── One-time events
    └── Condition filtering
```

### Design Patterns

1. **Facade Pattern** - TimeSystem provides unified interface
2. **Observer Pattern** - Events emitted via EventBus
3. **Fixed Timestep** - Deterministic simulation (100ms ticks)
4. **Accumulator Pattern** - Smooth rendering at any FPS

## Performance Considerations

- **Fixed timestep**: 100ms ticks ensure deterministic simulation
- **Maximum 10 ticks per frame**: Prevents spiral of death on slow systems
- **Event deduplication**: Hour events only fire once per hour
- **Lazy updates**: Time of day only updates when ticks occur

## Testing

```typescript
import { TimeSystem, TimeSpeed } from '@simulation/TimeSystem';

describe('TimeSystem', () => {
  let timeSystem: TimeSystem;
  
  beforeEach(() => {
    timeSystem = new TimeSystem();
  });
  
  test('starts at 5:00 AM', () => {
    expect(timeSystem.getHour()).toBe(5);
    expect(timeSystem.getMinute()).toBe(0);
  });
  
  test('speed controls', () => {
    timeSystem.setSpeed(TimeSpeed.FAST);
    expect(timeSystem.getSpeed()).toBe(3);
    
    timeSystem.pause();
    expect(timeSystem.isPaused()).toBe(true);
  });
  
  test('scheduled events fire', () => {
    let fired = false;
    timeSystem.scheduleEvent({
      id: 'test',
      name: 'Test Event',
      description: 'Test',
      hour: 10,
      recurring: false,
      callback: () => { fired = true; }
    });
    
    // Advance to 10:00
    // ... (simulate time progression)
    
    expect(fired).toBe(true);
  });
});
```

## Migration Guide

If you have existing code using `ClockManager` or `TimeOfDaySystem` directly:

### Before:
```typescript
const clockManager = new ClockManager();
const timeOfDaySystem = new TimeOfDaySystem();

clockManager.setSpeed(3);
const clock = clockManager.getClock();
timeOfDaySystem.update(clock.gameHour, clock.gameMinute);
```

### After:
```typescript
const timeSystem = new TimeSystem();

timeSystem.setSpeed(TimeSpeed.FAST);
const state = timeSystem.getTimeState();
// Visual state already updated automatically
```

### Legacy Support

The Game class provides backward compatibility:

```typescript
// Still works (deprecated but functional)
game.getClockManager();
game.getTimeOfDaySystem();

// Preferred
game.getTimeSystem();
```

## Future Enhancements

Potential additions for future versions:

- [ ] Seasonal changes (Spring, Summer, Fall, Winter)
- [ ] Weather system integration
- [ ] Holiday events (Christmas, New Year, etc.)
- [ ] Time-based achievements
- [ ] Variable speed based on population
- [ ] Historical time tracking/replay

## License

Part of OpenTower - MIT License
