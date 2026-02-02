# OpenTower Audio System 🔊

A comprehensive audio system that brings OpenTower to life with procedurally generated sounds using the Web Audio API.

## Features

### 🎯 Sound Effects (SFX)
- **Elevator sounds:**
  - Ding when doors open (`playElevatorDing()`)
  - Motor hum while moving (`playElevatorMotor(id, isExpress)`)
  - Different sounds for express vs standard elevators
  
- **Building sounds:**
  - Placement sound (`playBuildingPlaced()`)
  - Demolition sound (`playDemolish()`)
  - Construction hammering (`playConstruction()`)
  
- **Alert sounds:**
  - Fire alarm (`playFireAlarm()`)
  - Star rating fanfare (`playStarRatingUp()`)
  - Warning beeps (`playWarning()`)
  - Cash register cha-ching (`playCashRegister()`)

### 🌆 Ambient Soundscapes
Dynamic ambient sounds that change based on:
- **Time of day** (morning, work, lunch, evening, night)
- **Building types** (offices, restaurants, hotels)
- **Population** (scales with tower activity)

Ambient sounds are subtle and continuous, creating atmosphere without being intrusive.

### 🎵 Background Music
Optional procedural music system:
- **Mood-based** chord progressions (calm, upbeat, tense, triumphant)
- **Dynamic melodies** that adapt to gameplay
- **Toggleable** (off by default)

## Usage

### Basic Setup

```typescript
import { getSoundManager, getAmbientPlayer, getMusicPlayer } from '@/audio';

// Get singleton instances
const soundManager = getSoundManager();
const ambientPlayer = getAmbientPlayer();
const musicPlayer = getMusicPlayer();
```

### Playing Sound Effects

```typescript
// Elevator sounds
soundManager.playElevatorDing(); // When doors open
soundManager.playElevatorMotor('elevator-1', false); // Start motor (standard)
soundManager.stopElevatorMotor('elevator-1'); // Stop motor

// For express elevators
soundManager.playElevatorMotor('elevator-2', true); // Deeper hum

// Building sounds
soundManager.playBuildingPlaced(); // When placing a building
soundManager.playDemolish(); // When removing a building
soundManager.playConstruction(); // During construction

// Alerts and events
soundManager.playWarning(); // For warnings
soundManager.playFireAlarm(); // For emergencies
soundManager.playStarRatingUp(); // When star rating increases
soundManager.playCashRegister(); // When earning money
```

### Ambient Sounds

```typescript
import { getAmbientPlayer } from '@/audio';

const ambientPlayer = getAmbientPlayer();

// Update state periodically (e.g., every game tick or every few seconds)
ambientPlayer.setState({
  timeOfDay: 'work', // 'morning' | 'work' | 'lunch' | 'evening' | 'night'
  officeCount: 15,
  restaurantCount: 3,
  hotelCount: 5,
  population: 120
});

// Ambient sounds will automatically adjust based on the state
```

### Background Music

```typescript
import { getMusicPlayer } from '@/audio';

const musicPlayer = getMusicPlayer();

// Start music (off by default)
musicPlayer.start();

// Change mood based on game state
musicPlayer.setMood('calm');     // Peaceful tower management
musicPlayer.setMood('upbeat');   // Tower is thriving
musicPlayer.setMood('tense');    // Problems or challenges
musicPlayer.setMood('triumphant'); // Star rating increased!

// Toggle music
musicPlayer.toggle(); // Returns new enabled state

// Stop music
musicPlayer.stop();
```

### Volume Control

```typescript
import { getSoundManager } from '@/audio';

const soundManager = getSoundManager();

// Master volume (affects all sounds)
soundManager.setVolume(0.5); // 50% volume

// Category volumes (0-1, multiplied by master)
soundManager.setCategoryVolume('sfx', 1.0);     // 100% SFX
soundManager.setCategoryVolume('ambient', 0.6); // 60% ambient
soundManager.setCategoryVolume('music', 0.4);   // 40% music

// Toggle all sound on/off
soundManager.toggle(); // Returns new enabled state
```

## Integration Examples

### Game Initialization

```typescript
// In your main game initialization
import { getSoundManager, getAmbientPlayer } from '@/audio';

async function initGame() {
  const game = new Game();
  
  // Initialize audio (will create AudioContext on first user interaction)
  const soundManager = getSoundManager();
  const ambientPlayer = getAmbientPlayer();
  
  // Optional: Start background music
  // const musicPlayer = getMusicPlayer();
  // musicPlayer.start();
  
  console.log('🔊 Audio system initialized');
}
```

### Elevator Integration

```typescript
// In ElevatorSystem.ts
import { getSoundManager } from '@/audio';

class ElevatorCar {
  private isMoving: boolean = false;
  
  startMoving(isExpress: boolean) {
    if (!this.isMoving) {
      this.isMoving = true;
      getSoundManager().playElevatorMotor(this.id, isExpress);
    }
  }
  
  stopMoving() {
    if (this.isMoving) {
      this.isMoving = false;
      getSoundManager().stopElevatorMotor(this.id);
    }
  }
  
  openDoors() {
    getSoundManager().playElevatorDing();
  }
}
```

### Time-of-Day Integration

```typescript
// In your game loop or TimeOfDaySystem
import { getAmbientPlayer } from '@/audio';

function updateAmbientSounds() {
  const tower = game.getTowerManager().getTower();
  const timeOfDay = game.getTimeOfDaySystem().getState().period;
  
  // Count buildings
  const buildings = Object.values(tower.buildingsById);
  const officeCount = buildings.filter(b => b.type === 'office').length;
  const restaurantCount = buildings.filter(b => b.type === 'restaurant').length;
  const hotelCount = buildings.filter(b => b.type === 'hotel').length;
  
  getAmbientPlayer().setState({
    timeOfDay, // Will be 'morning' | 'work' | 'lunch' | 'evening' | 'night'
    officeCount,
    restaurantCount,
    hotelCount,
    population: tower.population
  });
}

// Call every few seconds (don't need to call every frame)
setInterval(updateAmbientSounds, 2000);
```

### Event Integration

```typescript
// Listen to game events and play sounds
import { getEventBus } from '@core/EventBus';
import { getSoundManager, getMusicPlayer } from '@/audio';

getEventBus().on('STAR_CHANGE', (event) => {
  if (event.newRating > event.oldRating) {
    getSoundManager().playStarRatingUp();
    getMusicPlayer().setMood('triumphant');
    
    // Return to normal mood after 10 seconds
    setTimeout(() => {
      getMusicPlayer().setMood('upbeat');
    }, 10000);
  }
});

getEventBus().on('INCOME_COLLECTED', () => {
  getSoundManager().playCashRegister();
});

getEventBus().on('FIRE_ALARM', () => {
  getSoundManager().playFireAlarm();
  getMusicPlayer().setMood('tense');
});
```

### Keyboard Controls

```typescript
// Add keyboard shortcuts for audio control
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'm':
    case 'M':
      // Toggle all sound
      getSoundManager().toggle();
      break;
      
    case 'b':
    case 'B':
      // Toggle background music
      getMusicPlayer().toggle();
      break;
  }
});
```

## Performance Notes

- All sounds are **procedurally generated** using Web Audio API oscillators
- **No audio files** needed - keeps bundle size small
- Ambient sounds use **few oscillators** (typically 3-5 total)
- Music uses **chord progressions** with simple melodies
- Motor hums are **tracked per elevator** to prevent duplicates

## Browser Compatibility

- Requires modern browser with Web Audio API support
- AudioContext requires **user interaction** before first sound
- Automatically initializes on first sound effect playback

## Tips for Best Experience

1. **Volume Balance:**
   - SFX: 100% (default)
   - Ambient: 60% (default) - subtle background
   - Music: 40% (default) - non-intrusive

2. **Ambient Updates:**
   - Update state every 2-3 seconds (not every frame)
   - Smooth transitions prevent jarring changes

3. **Music:**
   - Keep music **optional** (off by default)
   - Change mood based on **major events** only
   - Return to neutral mood after special events

4. **Motor Sounds:**
   - Start when elevator begins moving
   - Stop when elevator stops or reaches destination
   - Use unique elevator ID to prevent duplicates

## Future Enhancements

Possible additions:
- Restaurant-specific sounds (clinking, cooking)
- Hotel-specific sounds (doors, guests)
- Office-specific sounds (phones, keyboards)
- Seasonal music variations
- Emergency evacuation sirens
- Tenant satisfaction audio feedback
- Construction progress sounds

---

**Made with ❤️ for OpenTower** - Sound makes the game feel REAL! 🏢🔊
