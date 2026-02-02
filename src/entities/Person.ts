import { generateUUID } from '@core/uuid';
/**
 * Person Entity - Worker, Resident, Visitor, etc.
 * 
 * State machine-driven person that moves through the tower,
 * uses elevators, goes to work, eats lunch, and experiences stress.
 * 
 * @module entities/Person
 */

import type {
  IPerson,
  PersonType,
  PersonState,
  StressLevel,
  PathNode,
  DailySchedule,
} from '@/interfaces/entities';
import { STRESS_THRESHOLDS, STRESS_COLORS } from '@/interfaces/entities';
import type { PathSegment } from '@/simulation/PathfindingSystem';

export class Person implements IPerson {
  readonly id: string;
  readonly type: PersonType;
  
  stress: number = 0;
  
  homeBuildingId: string | null = null;
  destinationBuildingId: string | null = null;
  
  currentFloor: number;
  currentTile: number;
  
  state: PersonState = 'idle';
  
  waitStartTick: number | null = null;
  hasTransferred: boolean = false;
  currentElevatorId: string | null = null;
  
  currentPath: PathNode[] = [];
  pathIndex: number = 0;
  
  schedule: DailySchedule;
  direction: 'left' | 'right' = 'right';
  
  // Multi-segment pathfinding
  pathSegments: PathSegment[] = [];
  currentSegmentIndex: number = 0;
  
  // Movement state
  private targetTile: number;
  private moveProgress: number = 0;
  private moveSpeed: number = 0.5; // tiles per tick at 1x speed
  
  // ========================================
  // 🎭 PERSONALITY & LIFE
  // ========================================
  
  /** Person's name (for personality and debugging) */
  name: string;
  
  /** Patience level (0-100) - affects how long they'll wait */
  patience: number = 50;
  
  /** Mood multiplier (affects satisfaction gain/loss) */
  mood: number = 1.0;
  
  /** Thoughts/complaints - for UI feedback */
  currentThought: string | null = null;
  thoughtExpiresTick: number | null = null;
  
  /** Memory of bad experiences */
  badMemories: string[] = [];
  
  constructor(config: {
    type: PersonType;
    floor: number;
    tile: number;
    homeBuildingId?: string;
    schedule: DailySchedule;
    name?: string;
    patience?: number;
  }) {
    this.id = generateUUID();
    this.type = config.type;
    this.currentFloor = config.floor;
    this.currentTile = config.tile;
    this.targetTile = config.tile;
    this.homeBuildingId = config.homeBuildingId ?? null;
    this.schedule = config.schedule;
    
    // Personality
    this.name = config.name ?? Person.generateName();
    this.patience = config.patience ?? (30 + Math.random() * 70);
  }
  
  /**
   * Get current stress level category
   */
  getStressLevel(): StressLevel {
    if (this.stress <= STRESS_THRESHOLDS.NORMAL_MAX) return 'normal';
    if (this.stress <= STRESS_THRESHOLDS.STRESSED_MAX) return 'stressed';
    return 'critical';
  }
  
  /**
   * Get display color based on stress
   */
  getColor(): number {
    const level = this.getStressLevel();
    switch (level) {
      case 'normal': return STRESS_COLORS.NORMAL;
      case 'stressed': return STRESS_COLORS.STRESSED;
      case 'critical': return STRESS_COLORS.CRITICAL;
    }
  }
  
  /**
   * Update person state (called each simulation tick)
   */
  update(currentTick: number, gameSpeed: number): void {
    switch (this.state) {
      case 'walking':
        this.updateWalking(gameSpeed);
        break;
      case 'waitingForElevator':
        this.updateWaiting(currentTick);
        break;
      case 'ridingElevator':
        // Movement handled by elevator system
        break;
      case 'idle':
        // Check schedule, decide next action
        break;
    }
    
    // 🆕 BUG-015 FIX: Stress decay over time
    // Stress naturally decreases when not waiting/stressed
    if (this.state === 'idle' || this.state === 'atDestination') {
      // Slow decay when idle/at destination
      this.stress = Math.max(0, this.stress - 0.1);
    } else if (this.state === 'ridingElevator') {
      // Slight relief when moving
      this.stress = Math.max(0, this.stress - 0.2);
    }
  }
  
  /**
   * Update walking movement
   */
  private updateWalking(gameSpeed: number): void {
    if (this.currentTile === this.targetTile) {
      // Arrived at destination
      if (this.pathSegments.length > 0) {
        // Part of multi-segment path
        this.onSegmentComplete();
      } else {
        // Simple walk complete
        this.state = 'idle';
      }
      return;
    }
    
    // Move toward target
    const direction = this.targetTile > this.currentTile ? 1 : -1;
    this.direction = direction > 0 ? 'right' : 'left';
    
    this.moveProgress += this.moveSpeed * gameSpeed;
    
    if (this.moveProgress >= 1.0) {
      this.currentTile += direction;
      this.moveProgress = 0;
      
      if (this.currentTile === this.targetTile) {
        if (this.pathSegments.length > 0) {
          this.onSegmentComplete();
        } else {
          this.state = 'idle';
        }
      }
    }
  }
  
  /**
   * Update waiting for elevator (accumulate stress)
   */
  private updateWaiting(currentTick: number): void {
    if (this.waitStartTick === null) {
      this.waitStartTick = currentTick;
    }
    
    const waitTime = currentTick - this.waitStartTick;
    
    // Add stress every 120 ticks (2 game-minutes) after initial wait
    const STRESS_THRESHOLD = 120; // 2 minutes
    if (waitTime > STRESS_THRESHOLD && waitTime % 60 === 0) {
      this.stress = Math.min(100, this.stress + 5);
    }
  }
  
  /**
   * Set walking destination (simple, same-floor)
   */
  walkTo(tile: number): void {
    this.targetTile = tile;
    this.state = 'walking';
    this.moveProgress = 0;
  }
  
  /**
   * Start following a multi-segment path
   */
  followPath(segments: PathSegment[]): void {
    if (segments.length === 0) return;
    
    this.pathSegments = segments;
    this.currentSegmentIndex = 0;
    
    // Start first segment
    this.startNextSegment();
  }
  
  /**
   * Start executing the next segment in the path
   */
  private startNextSegment(): void {
    if (this.currentSegmentIndex >= this.pathSegments.length) {
      // Path complete!
      this.pathSegments = [];
      this.currentSegmentIndex = 0;
      this.state = 'idle';
      return;
    }
    
    const segment = this.pathSegments[this.currentSegmentIndex];
    if (!segment) {
      this.state = 'idle';
      return;
    }
    
    switch (segment.type) {
      case 'walk':
        this.targetTile = segment.endTile;
        this.state = 'walking';
        this.moveProgress = 0;
        break;
        
      case 'elevator':
        // Walk to elevator, then wait
        this.targetTile = segment.startTile;
        this.state = 'walking';
        this.moveProgress = 0;
        break;
        
      case 'stairs':
        // TODO: Stairs implementation
        this.currentSegmentIndex++;
        this.startNextSegment();
        break;
    }
  }
  
  /**
   * Called when arriving at end of current path segment
   */
  private onSegmentComplete(): void {
    const segment = this.pathSegments[this.currentSegmentIndex];
    if (!segment) return;
    
    if (segment.type === 'elevator') {
      // Arrived at elevator - start waiting
      this.state = 'waitingForElevator';
      this.waitStartTick = null;
      // Don't advance segment yet - will advance when boarding
    } else {
      // Move to next segment
      this.currentSegmentIndex++;
      this.startNextSegment();
    }
  }
  
  /**
   * Start waiting for elevator
   */
  waitForElevator(_elevatorShaftId: string): void {
    this.state = 'waitingForElevator';
    this.waitStartTick = null; // Will be set on first update
  }
  
  /**
   * Board an elevator
   */
  boardElevator(elevatorId: string): void {
    this.state = 'ridingElevator';
    this.currentElevatorId = elevatorId;
    this.waitStartTick = null;
    
    // Advance past elevator segment (we're now in the elevator)
    if (this.pathSegments.length > 0) {
      this.currentSegmentIndex++;
    }
  }
  
  /**
   * Exit elevator at floor
   */
  exitElevator(floor: number): void {
    this.currentFloor = floor;
    this.currentElevatorId = null;
    
    // Update position to elevator tile
    if (this.currentSegmentIndex > 0) {
      const segment = this.pathSegments[this.currentSegmentIndex - 1]; // Previous segment was elevator
      if (segment && segment.type === 'elevator') {
        this.currentTile = segment.endTile;
      }
    }
    
    // Continue to next segment (walk to final destination)
    if (this.currentSegmentIndex < this.pathSegments.length) {
      this.startNextSegment();
    } else {
      this.state = 'idle';
    }
  }
  
  /**
   * Reduce stress when at destination
   */
  decayStress(amount: number): void {
    this.stress = Math.max(0, this.stress - amount);
  }
  
  /**
   * Get the elevator shaft ID this person is waiting for (if any)
   */
  getWaitingElevatorShaftId(): string | null {
    if (this.state !== 'waitingForElevator') return null;
    
    const segment = this.pathSegments[this.currentSegmentIndex];
    if (segment && segment.type === 'elevator') {
      return segment.elevatorShaftId ?? null;
    }
    
    return null;
  }
  
  /**
   * Get destination floor for elevator ride
   */
  getElevatorDestinationFloor(): number | null {
    const segment = this.pathSegments[this.currentSegmentIndex];
    if (segment && segment.type === 'elevator') {
      return segment.endFloor;
    }
    return null;
  }
  
  // ========================================
  // 🎭 PERSONALITY & REACTIONS
  // ========================================
  
  /**
   * Express a thought (shows in UI as a speech bubble)
   */
  think(thought: string, durationTicks: number = 180): void {
    this.currentThought = thought;
    this.thoughtExpiresTick = performance.now() + durationTicks;
  }
  
  /**
   * React to a good experience
   */
  reactPositive(experience: string): void {
    this.mood = Math.min(1.5, this.mood + 0.1);
    this.stress = Math.max(0, this.stress - 5);
    
    const reactions = [
      '😊',
      '👍',
      'Nice!',
      'Perfect!',
      'Great!',
    ];
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    this.think(reaction, 120);
  }
  
  /**
   * React to a bad experience
   */
  reactNegative(experience: string, severity: 'minor' | 'major' | 'critical'): void {
    this.badMemories.push(experience);
    if (this.badMemories.length > 5) {
      this.badMemories.shift(); // Keep last 5
    }
    
    const stressIncrease = severity === 'critical' ? 15 : severity === 'major' ? 10 : 5;
    this.stress = Math.min(100, this.stress + stressIncrease);
    this.mood = Math.max(0.5, this.mood - 0.15);
    
    const reactions: Record<string, string[]> = {
      minor: ['😕', 'Hmm...', 'Not great...'],
      major: ['😤', 'Come on!', 'Seriously?!', 'Ugh!'],
      critical: ['😡', 'This is ridiculous!', 'I\'m done!', 'Fed up!'],
    };
    
    const reaction = reactions[severity][Math.floor(Math.random() * reactions[severity].length)];
    this.think(reaction, 240);
  }
  
  /**
   * Check if person is happy (for UI color coding)
   */
  isHappy(): boolean {
    return this.stress < 30 && this.mood > 0.9;
  }
  
  /**
   * Check if person is angry (critical stress)
   */
  isAngry(): boolean {
    return this.stress > 70 || this.mood < 0.6;
  }
  
  /**
   * Get visual representation of current state (for debugging)
   */
  getStatusEmoji(): string {
    if (this.state === 'leaving' || this.state === 'evacuating') return '🚪';
    if (this.isAngry()) return '😡';
    if (this.stress > 50) return '😰';
    if (this.isHappy()) return '😊';
    
    switch (this.state) {
      case 'walking': return '🚶';
      case 'waitingForElevator': return '⏰';
      case 'ridingElevator': return '🛗';
      case 'idle': return '🧍';
      default: return '❓';
    }
  }
  
  /**
   * Generate a random name for personality
   */
  private static generateName(): string {
    const firstNames = [
      'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley',
      'Sam', 'Charlie', 'Jamie', 'Robin', 'Pat', 'Dana',
      'Chris', 'Jessie', 'Blake', 'Quinn', 'Skyler', 'Reese',
    ];
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia',
      'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez',
      'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore',
    ];
    
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${first} ${last}`;
  }
  
  /**
   * Serialize for save/network
   */
  serialize() {
    return {
      id: this.id,
      type: this.type,
      stress: this.stress,
      homeBuildingId: this.homeBuildingId,
      destinationBuildingId: this.destinationBuildingId,
      currentFloor: this.currentFloor,
      currentTile: this.currentTile,
      state: this.state,
      hasTransferred: this.hasTransferred,
      schedule: this.schedule,
      
      // Personality
      name: this.name,
      patience: this.patience,
      mood: this.mood,
      currentThought: this.currentThought,
      badMemories: this.badMemories,
    };
  }
}
