/**
 * MusicPlayer - Dynamic background music system
 * 
 * Generates procedural background music that changes based on:
 * - Time of day (morning, work, lunch, evening, night)
 * - Tower mood (happy vs stressed)
 * - Game events (star rating up, emergency, etc.)
 * 
 * Uses simple chord progressions and melodies synthesized with Web Audio API
 * 
 * @module audio/MusicPlayer
 */

import { getSoundManager } from './SoundManager';

export type MusicMood = 'calm' | 'upbeat' | 'tense' | 'triumphant';

export class MusicPlayer {
  private enabled: boolean = false; // Music off by default
  private currentMood: MusicMood = 'calm';
  
  // Active music nodes
  private chordOscillators: OscillatorNode[] = [];
  private melodyOscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  
  // Music loop interval
  private musicInterval: number | null = null;
  private melodyInterval: number | null = null;
  
  // Chord progressions for different moods
  private chordProgressions = {
    calm: [
      [261.63, 329.63, 392.00], // C major (C-E-G)
      [293.66, 369.99, 440.00], // D minor (D-F-A)
      [329.63, 392.00, 493.88], // E minor (E-G-B)
      [261.63, 329.63, 392.00], // C major
    ],
    upbeat: [
      [261.63, 329.63, 392.00], // C major
      [392.00, 493.88, 587.33], // G major (G-B-D)
      [349.23, 440.00, 523.25], // F major (F-A-C)
      [261.63, 329.63, 392.00], // C major
    ],
    tense: [
      [261.63, 311.13, 392.00], // C minor (C-Eb-G)
      [293.66, 349.23, 440.00], // D minor
      [246.94, 293.66, 369.99], // B diminished
      [261.63, 311.13, 392.00], // C minor
    ],
    triumphant: [
      [261.63, 329.63, 392.00], // C major
      [392.00, 493.88, 587.33], // G major
      [349.23, 440.00, 523.25], // F major
      [523.25, 659.25, 783.99], // C major (octave up)
    ],
  };

  constructor() {
    // Music is opt-in
  }

  /**
   * Start playing background music
   */
  start(): void {
    if (this.enabled) return;
    
    this.enabled = true;
    this.startMusicLoop();
    console.log('🎵 Background music started');
  }

  /**
   * Stop playing background music
   */
  stop(): void {
    if (!this.enabled) return;
    
    this.enabled = false;
    this.stopMusicLoop();
    console.log('🎵 Background music stopped');
  }

  /**
   * Toggle music on/off
   */
  toggle(): boolean {
    if (this.enabled) {
      this.stop();
    } else {
      this.start();
    }
    return this.enabled;
  }

  /**
   * Set the current music mood
   */
  setMood(mood: MusicMood): void {
    if (this.currentMood !== mood) {
      this.currentMood = mood;
      
      // Restart music if playing
      if (this.enabled) {
        this.stopMusicLoop();
        this.startMusicLoop();
      }
    }
  }

  /**
   * Start the music loop
   */
  private startMusicLoop(): void {
    const soundManager = getSoundManager();
    const ctx = soundManager.getContext();
    if (!ctx) return;

    const vol = soundManager.getMusicVolume();
    
    // Create master gain node for music
    this.gainNode = ctx.createGain();
    this.gainNode.gain.setValueAtTime(vol, ctx.currentTime);
    this.gainNode.connect(ctx.destination);

    // Play chord progression
    this.playChordProgression(0);
    
    // Start melody after 2 seconds
    setTimeout(() => {
      if (this.enabled) {
        this.playMelody();
      }
    }, 2000);
  }

  /**
   * Play a chord progression
   */
  private playChordProgression(chordIndex: number): void {
    if (!this.enabled) return;
    
    const soundManager = getSoundManager();
    const ctx = soundManager.getContext();
    if (!ctx || !this.gainNode) return;

    // Stop previous chord
    this.chordOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (error) {
        // Already stopped
      }
    });
    this.chordOscillators = [];

    // Get chord frequencies
    const progression = this.chordProgressions[this.currentMood];
    const chord = progression[chordIndex % progression.length];

    // Play each note in the chord
    chord.forEach((frequency) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = frequency * 0.5; // Play octave lower for bass
      
      osc.connect(this.gainNode!);
      osc.start();
      
      this.chordOscillators.push(osc);
    });

    // Schedule next chord (4 seconds per chord)
    this.musicInterval = window.setTimeout(() => {
      this.playChordProgression(chordIndex + 1);
    }, 4000);
  }

  /**
   * Play a simple melody over the chords
   */
  private playMelody(): void {
    if (!this.enabled) return;
    
    const soundManager = getSoundManager();
    const ctx = soundManager.getContext();
    if (!ctx || !this.gainNode) return;

    // Simple pentatonic scale (C-D-E-G-A)
    const scale = [523.25, 587.33, 659.25, 783.99, 880.00];
    
    // Random melody note
    const note = scale[Math.floor(Math.random() * scale.length)];
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = note;
    
    gain.gain.setValueAtTime(soundManager.getMusicVolume() * 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);

    // Random interval for next note (1-3 seconds)
    const nextInterval = 1000 + Math.random() * 2000;
    this.melodyInterval = window.setTimeout(() => {
      this.playMelody();
    }, nextInterval);
  }

  /**
   * Stop the music loop
   */
  private stopMusicLoop(): void {
    // Clear intervals
    if (this.musicInterval) {
      clearTimeout(this.musicInterval);
      this.musicInterval = null;
    }
    
    if (this.melodyInterval) {
      clearTimeout(this.melodyInterval);
      this.melodyInterval = null;
    }

    // Stop all oscillators
    this.chordOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (error) {
        // Already stopped
      }
    });
    this.chordOscillators = [];
    
    if (this.melodyOscillator) {
      try {
        this.melodyOscillator.stop();
      } catch (error) {
        // Already stopped
      }
      this.melodyOscillator = null;
    }
    
    // Disconnect gain node
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }

  /**
   * Check if music is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Destroy and clean up
   */
  destroy(): void {
    this.stop();
  }
}

// Global singleton
let globalMusicPlayer: MusicPlayer | null = null;

/**
 * Get the global music player
 */
export function getMusicPlayer(): MusicPlayer {
  if (!globalMusicPlayer) {
    globalMusicPlayer = new MusicPlayer();
  }
  return globalMusicPlayer;
}
