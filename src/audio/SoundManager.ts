/**
 * SoundManager - Comprehensive game audio using Web Audio API
 * 
 * Features:
 * - Synthesized sounds (no external files needed)
 * - Volume control (master + categories)
 * - Enable/disable toggle
 * - Elevator sounds (ding, motor hum, express vs standard)
 * - Alert sounds (fire alarm, warnings, fanfares)
 * - Ambient sounds integration
 * 
 * @module audio/SoundManager
 */

export class SoundManager {
  private context: AudioContext | null = null;
  private enabled: boolean = true;
  private masterVolume: number = 0.3; // 30% volume by default
  
  // Volume categories
  private sfxVolume: number = 1.0;
  private ambientVolume: number = 0.6;
  private musicVolume: number = 0.4;
  
  // Track active motor hums
  private activeMotorHums: Map<string, OscillatorNode> = new Map();

  constructor() {
    // Initialize AudioContext on first user interaction
    // (browsers require user gesture to enable audio)
  }

  /**
   * Initialize audio context (call after user interaction)
   */
  private ensureContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
    }
    return this.context;
  }
  
  /**
   * Get effective volume for a category
   */
  private getVolume(category: 'sfx' | 'ambient' | 'music'): number {
    const categoryVolume = {
      sfx: this.sfxVolume,
      ambient: this.ambientVolume,
      music: this.musicVolume,
    }[category];
    
    return this.masterVolume * categoryVolume;
  }

  /**
   * Play elevator ding sound
   * Simple two-tone bell sound (ding-dong)
   */
  playElevatorDing(): void {
    if (!this.enabled) return;

    try {
      const ctx = this.ensureContext();
      const now = ctx.currentTime;
      const vol = this.getVolume('sfx');

      // Create oscillator for first tone (higher)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.value = 800; // E5
      
      gain1.gain.setValueAtTime(vol, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.3);

      // Create oscillator for second tone (lower)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc2.type = 'sine';
      osc2.frequency.value = 600; // D5
      
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(vol, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.15);
      osc2.stop(now + 0.5);
    } catch (error) {
      console.warn('Failed to play elevator ding:', error);
    }
  }

  /**
   * Play building placement sound
   * Simple click/thud sound
   */
  playBuildingPlaced(): void {
    if (!this.enabled) return;

    try {
      const ctx = this.ensureContext();
      const now = ctx.currentTime;
      const vol = this.getVolume('sfx');

      // Create noise burst (white noise for thud)
      const bufferSize = ctx.sampleRate * 0.1; // 0.1 second
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 10);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 200;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(vol * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.1);
    } catch (error) {
      console.warn('Failed to play building placed sound:', error);
    }
  }

  /**
   * Play demolish sound
   * Breaking/crumbling sound
   */
  playDemolish(): void {
    if (!this.enabled) return;

    try {
      const ctx = this.ensureContext();
      const now = ctx.currentTime;
      const vol = this.getVolume('sfx');

      // Create noise burst (longer, lower pitch)
      const bufferSize = ctx.sampleRate * 0.3; // 0.3 second
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 5);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 150;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(vol * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.3);
    } catch (error) {
      console.warn('Failed to play demolish sound:', error);
    }
  }

  /**
   * Play cash register sound
   * Cheerful "ka-ching" for income collection
   */
  playCashRegister(): void {
    if (!this.enabled) return;

    try {
      const ctx = this.ensureContext();
      const now = ctx.currentTime;
      const vol = this.getVolume('sfx');

      // Bell sound (high pitch)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.value = 1200; // High C
      
      gain1.gain.setValueAtTime(vol * 0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.2);

      // Second harmonic (octave up)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      
      osc2.type = 'sine';
      osc2.frequency.value = 1600;
      
      gain2.gain.setValueAtTime(vol * 0.2, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc2.start(now + 0.05);
      osc2.stop(now + 0.3);
    } catch (error) {
      console.warn('Failed to play cash register sound:', error);
    }
  }
  
  /**
   * Play elevator motor hum (continuous while moving)
   * @param elevatorId Unique identifier for the elevator
   * @param isExpress Whether this is an express elevator (deeper hum)
   */
  playElevatorMotor(elevatorId: string, isExpress: boolean = false): void {
    if (!this.enabled) return;
    if (this.activeMotorHums.has(elevatorId)) return; // Already playing

    try {
      const ctx = this.ensureContext();
      const vol = this.getVolume('sfx');

      // Create low-frequency oscillator for motor hum
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.value = isExpress ? 60 : 80; // Express = deeper
      
      gain.gain.setValueAtTime(vol * 0.15, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      
      this.activeMotorHums.set(elevatorId, osc);
    } catch (error) {
      console.warn('Failed to play elevator motor:', error);
    }
  }
  
  /**
   * Stop elevator motor hum
   */
  stopElevatorMotor(elevatorId: string): void {
    const osc = this.activeMotorHums.get(elevatorId);
    if (osc) {
      try {
        osc.stop();
        this.activeMotorHums.delete(elevatorId);
      } catch (error) {
        // Already stopped
      }
    }
  }
  
  /**
   * Play fire alarm sound
   * Urgent, pulsing warning tone
   */
  playFireAlarm(): void {
    if (!this.enabled) return;

    try {
      const ctx = this.ensureContext();
      const now = ctx.currentTime;
      const vol = this.getVolume('sfx');

      // Create pulsing siren sound
      for (let i = 0; i < 4; i++) {
        const startTime = now + i * 0.5;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, startTime);
        osc.frequency.linearRampToValueAtTime(400, startTime + 0.25);
        osc.frequency.setValueAtTime(800, startTime + 0.25);
        
        gain.gain.setValueAtTime(vol * 0.4, startTime);
        gain.gain.setValueAtTime(0, startTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.4);
      }
    } catch (error) {
      console.warn('Failed to play fire alarm:', error);
    }
  }
  
  /**
   * Play star rating fanfare
   * Triumphant ascending scale
   */
  playStarRatingUp(): void {
    if (!this.enabled) return;

    try {
      const ctx = this.ensureContext();
      const now = ctx.currentTime;
      const vol = this.getVolume('sfx');

      // Ascending major scale (C-D-E-G-C)
      const notes = [523, 587, 659, 784, 1047]; // C5-D5-E5-G5-C6
      
      notes.forEach((freq, i) => {
        const startTime = now + i * 0.12;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(vol * 0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch (error) {
      console.warn('Failed to play star rating fanfare:', error);
    }
  }
  
  /**
   * Play warning sound
   * Attention-getting alert tone
   */
  playWarning(): void {
    if (!this.enabled) return;

    try {
      const ctx = this.ensureContext();
      const now = ctx.currentTime;
      const vol = this.getVolume('sfx');

      // Two-tone warning (beep-beep)
      for (let i = 0; i < 2; i++) {
        const startTime = now + i * 0.25;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.value = 440; // A4
        
        gain.gain.setValueAtTime(vol * 0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.15);
      }
    } catch (error) {
      console.warn('Failed to play warning sound:', error);
    }
  }
  
  /**
   * Play weekend shift sound
   * Soft, relaxed chime - less urgent than weekday rush
   * BUG-026 FIX: Unique audio feedback for weekend arrivals
   */
  playWeekendShift(): void {
    if (!this.enabled) return;

    try {
      const ctx = this.ensureContext();
      const now = ctx.currentTime;
      const vol = this.getVolume('sfx');

      // Gentle descending chime (F5-D5-A4) - relaxed weekend vibe
      const notes = [698, 587, 440]; // F5, D5, A4
      
      notes.forEach((freq, i) => {
        const startTime = now + i * 0.15;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        // Soft, gentle envelope
        gain.gain.setValueAtTime(vol * 0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch (error) {
      console.warn('Failed to play weekend shift sound:', error);
    }
  }
  
  /**
   * Play construction sound
   * Hammering/drilling noise
   */
  playConstruction(): void {
    if (!this.enabled) return;

    try {
      const ctx = this.ensureContext();
      const now = ctx.currentTime;
      const vol = this.getVolume('sfx');

      // Create percussive hammering sound
      for (let i = 0; i < 3; i++) {
        const startTime = now + i * 0.1;
        
        // White noise burst
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);

        for (let j = 0; j < bufferSize; j++) {
          output[j] = (Math.random() * 2 - 1) * Math.exp(-j / bufferSize * 20);
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 300 + Math.random() * 200;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(vol * 0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start(startTime);
        noise.stop(startTime + 0.05);
      }
    } catch (error) {
      console.warn('Failed to play construction sound:', error);
    }
  }

  /**
   * Enable/disable sound
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    
    // Stop all active motor hums when disabling
    if (!enabled) {
      this.activeMotorHums.forEach((osc) => {
        try {
          osc.stop();
        } catch (error) {
          // Already stopped
        }
      });
      this.activeMotorHums.clear();
    }
    
    console.log(`🔊 Sound: ${enabled ? 'ON' : 'OFF'}`);
  }

  /**
   * Toggle sound on/off
   */
  toggle(): boolean {
    this.enabled = !this.enabled;
    this.setEnabled(this.enabled);
    return this.enabled;
  }

  /**
   * Set master volume (0-1)
   */
  setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    console.log(`🔊 Master Volume: ${Math.round(this.masterVolume * 100)}%`);
  }
  
  /**
   * Set category volume (0-1)
   */
  setCategoryVolume(category: 'sfx' | 'ambient' | 'music', volume: number): void {
    volume = Math.max(0, Math.min(1, volume));
    
    switch (category) {
      case 'sfx':
        this.sfxVolume = volume;
        break;
      case 'ambient':
        this.ambientVolume = volume;
        break;
      case 'music':
        this.musicVolume = volume;
        break;
    }
    
    console.log(`🔊 ${category.toUpperCase()} Volume: ${Math.round(volume * 100)}%`);
  }

  /**
   * Check if sound is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
  
  /**
   * Get audio context (for ambient/music systems)
   */
  getContext(): AudioContext | null {
    return this.context;
  }
  
  /**
   * Get current ambient volume
   */
  getAmbientVolume(): number {
    return this.getVolume('ambient');
  }
  
  /**
   * Get current music volume
   */
  getMusicVolume(): number {
    return this.getVolume('music');
  }

  /**
   * Destroy audio context
   */
  destroy(): void {
    // Stop all active sounds
    this.activeMotorHums.forEach((osc) => {
      try {
        osc.stop();
      } catch (error) {
        // Already stopped
      }
    });
    this.activeMotorHums.clear();
    
    if (this.context) {
      this.context.close();
      this.context = null;
    }
  }
}

// Global singleton instance
let globalSoundManager: SoundManager | null = null;

/**
 * Get the global sound manager instance
 */
export function getSoundManager(): SoundManager {
  if (!globalSoundManager) {
    globalSoundManager = new SoundManager();
  }
  return globalSoundManager;
}
