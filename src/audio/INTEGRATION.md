# Audio System Integration Guide

Step-by-step guide to integrate the audio system into OpenTower.

## 1. Initialize Ambient Sounds in Game Loop

**File:** `src/core/Game.ts`

Add ambient sound updates to the game loop:

```typescript
import { getAmbientPlayer } from '@/audio';

class Game {
  private ambientUpdateCounter = 0;
  
  private gameLoop = (): void => {
    // ... existing game loop code ...
    
    // Update ambient sounds every 120 ticks (~2 seconds at 60 FPS)
    this.ambientUpdateCounter++;
    if (this.ambientUpdateCounter >= 120) {
      this.ambientUpdateCounter = 0;
      this.updateAmbientSounds();
    }
  };
  
  /**
   * Update ambient sounds based on current game state
   */
  private updateAmbientSounds(): void {
    const tower = this.towerManager.getTower();
    const timeOfDay = this.timeOfDaySystem.getState();
    
    // Count buildings by type
    const buildings = Object.values(tower.buildingsById);
    const officeCount = buildings.filter(b => b.type === 'office').length;
    const restaurantCount = buildings.filter(b => b.type === 'restaurant').length;
    const hotelCount = buildings.filter(b => b.type === 'hotel').length;
    
    // Map time of day to ambient states
    const timeMapping: Record<string, any> = {
      'Early Morning': 'morning',
      'Morning': 'morning',
      'Late Morning': 'work',
      'Noon': 'lunch',
      'Afternoon': 'work',
      'Evening': 'evening',
      'Night': 'night',
      'Late Night': 'night'
    };
    
    getAmbientPlayer().setState({
      timeOfDay: timeMapping[timeOfDay.label] || 'work',
      officeCount,
      restaurantCount,
      hotelCount,
      population: tower.population
    });
  }
}
```

## 2. Hook Up Elevator Sounds

**File:** `src/simulation/ElevatorSystem.ts`

Add motor sounds and ding sounds to elevator behavior:

```typescript
import { getSoundManager } from '@/audio';

class ElevatorCar {
  private motorSoundPlaying = false;
  
  update(delta: number): void {
    // ... existing update code ...
    
    const isMoving = this.currentFloor !== this.targetFloor;
    
    // Start motor sound when moving
    if (isMoving && !this.motorSoundPlaying) {
      const isExpress = this.type === 'express';
      getSoundManager().playElevatorMotor(this.id, isExpress);
      this.motorSoundPlaying = true;
    }
    
    // Stop motor sound when stopped
    if (!isMoving && this.motorSoundPlaying) {
      getSoundManager().stopElevatorMotor(this.id);
      this.motorSoundPlaying = false;
    }
    
    // Play ding when doors open
    if (this.state === 'loading' && !this.doorsOpened) {
      getSoundManager().playElevatorDing();
      this.doorsOpened = true;
    }
    
    if (this.state !== 'loading') {
      this.doorsOpened = false;
    }
  }
  
  destroy(): void {
    // Stop motor sound when car is destroyed
    if (this.motorSoundPlaying) {
      getSoundManager().stopElevatorMotor(this.id);
    }
  }
}
```

## 3. Wire Up Game Events

**File:** `src/index.ts` (or wherever you initialize the game)

Add event listeners for game events:

```typescript
import { getEventBus } from '@core/EventBus';
import { getSoundManager, getMusicPlayer } from '@/audio';

function setupAudioEvents() {
  const eventBus = getEventBus();
  
  // Star rating changes
  eventBus.on('STAR_CHANGE', (event: any) => {
    if (event.newRating > event.oldRating) {
      getSoundManager().playStarRatingUp();
      
      // Optional: Change music mood
      const musicPlayer = getMusicPlayer();
      if (musicPlayer.isEnabled()) {
        musicPlayer.setMood('triumphant');
        
        // Return to upbeat after 10 seconds
        setTimeout(() => {
          musicPlayer.setMood('upbeat');
        }, 10000);
      }
    }
  });
  
  // Income/rent collected (if you have this event)
  eventBus.on('INCOME_COLLECTED', () => {
    getSoundManager().playCashRegister();
  });
  
  // Random events
  eventBus.on('RANDOM_EVENT', (event: any) => {
    const eventType = event.data.event.type;
    
    switch (eventType) {
      case 'FIRE':
        getSoundManager().playFireAlarm();
        getMusicPlayer().setMood('tense');
        break;
        
      case 'VIP_VISIT':
        getSoundManager().playStarRatingUp();
        break;
        
      // Add more event types as needed
    }
  });
  
  // Building demolitions already trigger playDemolish() in index.ts
  
  console.log('🔊 Audio events wired up');
}

// Call in main()
async function main() {
  // ... existing game initialization ...
  
  setupAudioEvents();
}
```

## 4. Add Keyboard Shortcuts

**File:** `src/index.ts`

Add to existing keyboard event listener:

```typescript
import { getSoundManager, getMusicPlayer } from '@/audio';

document.addEventListener('keydown', (e) => {
  // ... existing shortcuts ...
  
  switch (e.key) {
    case 'm':
    case 'M':
      // Toggle all sound (already exists)
      e.preventDefault();
      getSoundManager().toggle();
      break;
      
    case 'b':
    case 'B':
      // Toggle background music
      e.preventDefault();
      const musicPlayer = getMusicPlayer();
      const enabled = musicPlayer.toggle();
      console.log(`🎵 Music: ${enabled ? 'ON' : 'OFF'}`);
      break;
  }
});
```

## 5. Add Construction Sounds (Optional)

**File:** `src/ui/BuildingPlacer.ts` or wherever buildings are placed

```typescript
import { getSoundManager } from '@/audio';

// When a building is placed
placeBuilding(): Building | null {
  const building = /* ... create building ... */;
  
  if (building) {
    // Play construction sound for new buildings
    if (building.constructionTime > 0) {
      getSoundManager().playConstruction();
    } else {
      getSoundManager().playBuildingPlaced();
    }
  }
  
  return building;
}
```

## 6. Add Audio Settings UI (Optional)

**File:** New file `src/ui/AudioSettings.ts`

```typescript
import { getSoundManager, getMusicPlayer } from '@/audio';

export class AudioSettings {
  private container: HTMLDivElement;
  
  constructor() {
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      bottom: 220px;
      left: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 1000;
    `;
    
    this.container.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 10px;">🔊 Audio Settings</div>
      
      <div style="margin-bottom: 8px;">
        <label>
          Master Volume:
          <input type="range" id="volume-master" min="0" max="100" value="30">
          <span id="volume-master-value">30%</span>
        </label>
      </div>
      
      <div style="margin-bottom: 8px;">
        <label>
          SFX:
          <input type="range" id="volume-sfx" min="0" max="100" value="100">
          <span id="volume-sfx-value">100%</span>
        </label>
      </div>
      
      <div style="margin-bottom: 8px;">
        <label>
          Ambient:
          <input type="range" id="volume-ambient" min="0" max="100" value="60">
          <span id="volume-ambient-value">60%</span>
        </label>
      </div>
      
      <div style="margin-bottom: 8px;">
        <label>
          Music:
          <input type="range" id="volume-music" min="0" max="100" value="40">
          <span id="volume-music-value">40%</span>
        </label>
      </div>
      
      <div style="margin-top: 10px;">
        <button id="toggle-music" style="padding: 5px 10px; cursor: pointer;">
          Toggle Music
        </button>
      </div>
    `;
    
    document.body.appendChild(this.container);
    
    this.setupControls();
  }
  
  private setupControls(): void {
    const soundManager = getSoundManager();
    const musicPlayer = getMusicPlayer();
    
    // Master volume
    const masterSlider = document.getElementById('volume-master') as HTMLInputElement;
    const masterValue = document.getElementById('volume-master-value')!;
    
    masterSlider.addEventListener('input', () => {
      const value = parseInt(masterSlider.value) / 100;
      soundManager.setVolume(value);
      masterValue.textContent = `${masterSlider.value}%`;
    });
    
    // SFX volume
    const sfxSlider = document.getElementById('volume-sfx') as HTMLInputElement;
    const sfxValue = document.getElementById('volume-sfx-value')!;
    
    sfxSlider.addEventListener('input', () => {
      const value = parseInt(sfxSlider.value) / 100;
      soundManager.setCategoryVolume('sfx', value);
      sfxValue.textContent = `${sfxSlider.value}%`;
    });
    
    // Ambient volume
    const ambientSlider = document.getElementById('volume-ambient') as HTMLInputElement;
    const ambientValue = document.getElementById('volume-ambient-value')!;
    
    ambientSlider.addEventListener('input', () => {
      const value = parseInt(ambientSlider.value) / 100;
      soundManager.setCategoryVolume('ambient', value);
      ambientValue.textContent = `${ambientSlider.value}%`;
    });
    
    // Music volume
    const musicSlider = document.getElementById('volume-music') as HTMLInputElement;
    const musicValue = document.getElementById('volume-music-value')!;
    
    musicSlider.addEventListener('input', () => {
      const value = parseInt(musicSlider.value) / 100;
      soundManager.setCategoryVolume('music', value);
      musicValue.textContent = `${musicSlider.value}%`;
    });
    
    // Toggle music button
    const musicButton = document.getElementById('toggle-music')!;
    musicButton.addEventListener('click', () => {
      const enabled = musicPlayer.toggle();
      musicButton.textContent = enabled ? '⏸️ Stop Music' : '▶️ Start Music';
    });
  }
  
  destroy(): void {
    this.container.remove();
  }
}
```

Then add to your main file:

```typescript
import { AudioSettings } from '@/ui/AudioSettings';

async function main() {
  // ... existing code ...
  
  // Add audio settings panel
  const audioSettings = new AudioSettings();
}
```

## 7. Update Tutorial/Help

**File:** `src/ui/TutorialOverlay.ts`

Add audio controls to the tutorial:

```typescript
// Add a section about audio
const audioSection = `
  <div class="tutorial-section">
    <h3>🔊 Audio Controls</h3>
    <ul>
      <li><strong>M</strong> - Toggle all sound on/off</li>
      <li><strong>B</strong> - Toggle background music</li>
      <li>Adjust volumes in the audio settings (bottom-left)</li>
    </ul>
  </div>
`;
```

## Testing Checklist

After integration, test the following:

- [ ] Elevator dings when doors open
- [ ] Elevator motor hums while moving
- [ ] Different motor sounds for express vs standard elevators
- [ ] Motor stops when elevator stops
- [ ] Building placement sound
- [ ] Demolish sound
- [ ] Star rating fanfare
- [ ] Cash register sound (if applicable)
- [ ] Ambient office sounds during work hours
- [ ] Ambient restaurant sounds during lunch
- [ ] Ambient hotel sounds at night
- [ ] Background music (when enabled)
- [ ] Music mood changes on events
- [ ] Keyboard shortcuts (M and B)
- [ ] Volume controls work
- [ ] Sound persists across save/load

## Troubleshooting

**No sound at all?**
- Check browser console for errors
- Ensure user has interacted with page (AudioContext requires user gesture)
- Check if sound is muted (M key)

**Sounds too loud/quiet?**
- Adjust master volume and category volumes
- Default: master 30%, SFX 100%, ambient 60%, music 40%

**Elevator motor keeps playing?**
- Ensure `stopElevatorMotor()` is called when elevator stops
- Check that elevator IDs are unique and consistent

**Ambient sounds not changing?**
- Verify `updateAmbientSounds()` is being called regularly
- Check that time-of-day mapping is correct
- Confirm building counts are accurate

---

That's it! Your game now has a complete audio system that brings OpenTower to life! 🎉🔊
