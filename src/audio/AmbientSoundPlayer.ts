/**
 * AmbientSoundPlayer - Continuous ambient sounds based on time and building types
 * 
 * Creates atmospheric soundscapes that change throughout the day:
 * - Morning: Light office chatter, coffee machines
 * - Work hours: Office bustle, typing, phones
 * - Lunch: Restaurant clinking, conversation
 * - Evening: Quieter office sounds, hotel ambiance
 * - Night: Peaceful hotel sounds, occasional elevator
 * 
 * @module audio/AmbientSoundPlayer
 */

import { getSoundManager } from './SoundManager';

export interface AmbientState {
  timeOfDay: 'morning' | 'work' | 'lunch' | 'evening' | 'night';
  officeCount: number;
  restaurantCount: number;
  hotelCount: number;
  population: number;
}

export class AmbientSoundPlayer {
  private enabled: boolean = true;
  private currentState: AmbientState | null = null;
  
  // Active sound nodes
  private activeNodes: Map<string, { osc: OscillatorNode; gain: GainNode }> = new Map();
  
  // Update interval
  private updateInterval: number | null = null;

  constructor() {
    // Start ambient sound loop
    this.startAmbientLoop();
  }

  /**
   * Start the ambient sound update loop
   */
  private startAmbientLoop(): void {
    this.updateInterval = window.setInterval(() => {
      this.updateAmbientSounds();
    }, 2000); // Update every 2 seconds
  }

  /**
   * Update current state
   */
  setState(state: AmbientState): void {
    this.currentState = state;
  }

  /**
   * Update ambient sounds based on current state
   */
  private updateAmbientSounds(): void {
    if (!this.enabled || !this.currentState) return;
    
    const soundManager = getSoundManager();
    if (!soundManager.isEnabled()) return;
    
    const ctx = soundManager.getContext();
    if (!ctx) return;

    const vol = soundManager.getAmbientVolume();
    const { timeOfDay, officeCount, restaurantCount, hotelCount, population } = this.currentState;

    // Clear old sounds if state changed significantly
    // (Simple approach: keep sounds running and adjust volume)
    
    // Office ambiance (during work hours)
    if (timeOfDay === 'work' || timeOfDay === 'morning') {
      const officeIntensity = Math.min(officeCount / 10, 1.0); // Scale with office count
      const targetVolume = vol * officeIntensity * 0.3;
      
      this.ensureAmbientSound('office', ctx, 120, 'sine', targetVolume);
      this.ensureAmbientSound('office_high', ctx, 240, 'sine', targetVolume * 0.5);
    } else {
      this.stopAmbientSound('office');
      this.stopAmbientSound('office_high');
    }
    
    // Restaurant ambiance (during lunch)
    if (timeOfDay === 'lunch' && restaurantCount > 0) {
      const restaurantIntensity = Math.min(restaurantCount / 5, 1.0);
      const targetVolume = vol * restaurantIntensity * 0.25;
      
      this.ensureAmbientSound('restaurant', ctx, 180, 'triangle', targetVolume);
    } else {
      this.stopAmbientSound('restaurant');
    }
    
    // Hotel ambiance (evening and night - very subtle)
    if ((timeOfDay === 'evening' || timeOfDay === 'night') && hotelCount > 0) {
      const hotelIntensity = Math.min(hotelCount / 8, 1.0);
      const targetVolume = vol * hotelIntensity * 0.15; // Very quiet
      
      this.ensureAmbientSound('hotel', ctx, 80, 'sine', targetVolume);
    } else {
      this.stopAmbientSound('hotel');
    }
    
    // Wind/city ambiance (always present but subtle)
    const cityVolume = vol * 0.08 * Math.min(population / 50, 1.0);
    this.ensureAmbientSound('city', ctx, 60, 'sine', cityVolume);
  }

  /**
   * Ensure an ambient sound is playing at the target volume
   */
  private ensureAmbientSound(
    id: string,
    ctx: AudioContext,
    frequency: number,
    type: OscillatorType,
    targetVolume: number
  ): void {
    const existing = this.activeNodes.get(id);
    
    if (existing) {
      // Update volume smoothly
      existing.gain.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + 0.5);
    } else if (targetVolume > 0.01) {
      // Create new sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.value = frequency;
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + 1.0);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      
      this.activeNodes.set(id, { osc, gain });
    }
  }

  /**
   * Stop an ambient sound
   */
  private stopAmbientSound(id: string): void {
    const node = this.activeNodes.get(id);
    if (node) {
      try {
        const ctx = node.osc.context;
        node.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);
        
        // Stop and clean up after fade out
        setTimeout(() => {
          try {
            node.osc.stop();
          } catch (error) {
            // Already stopped
          }
          this.activeNodes.delete(id);
        }, 1100);
      } catch (error) {
        // Already stopped
        this.activeNodes.delete(id);
      }
    }
  }

  /**
   * Enable/disable ambient sounds
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    
    if (!enabled) {
      // Stop all sounds
      this.activeNodes.forEach((node, id) => {
        this.stopAmbientSound(id);
      });
    }
  }

  /**
   * Destroy and clean up
   */
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.activeNodes.forEach((node) => {
      try {
        node.osc.stop();
      } catch (error) {
        // Already stopped
      }
    });
    this.activeNodes.clear();
  }
}

// Global singleton
let globalAmbientPlayer: AmbientSoundPlayer | null = null;

/**
 * Get the global ambient sound player
 */
export function getAmbientPlayer(): AmbientSoundPlayer {
  if (!globalAmbientPlayer) {
    globalAmbientPlayer = new AmbientSoundPlayer();
  }
  return globalAmbientPlayer;
}
