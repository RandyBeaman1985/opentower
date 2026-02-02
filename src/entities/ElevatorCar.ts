import { generateUUID } from '@core/uuid';
import { getSoundManager } from '@/audio/SoundManager';

/**
 * Elevator Car - Individual car within an elevator shaft
 * 
 * Uses LOOK algorithm (not SCAN) for movement:
 * - Travel UP collecting all upward-bound passengers
 * - Reach top of current requests, reverse
 * - Travel DOWN collecting all downward-bound passengers
 * - Reach bottom of current requests, reverse or idle
 * - Minimizes direction changes = more efficient
 * 
 * This is the PUZZLE: players must program elevators to minimize wait times.
 * 
 * @module entities/ElevatorCar
 */

export type ElevatorDirection = 'up' | 'down' | 'idle';

export interface ElevatorCarConfig {
  shaftId: string;
  currentFloor: number;
  minFloor: number;
  maxFloor: number;
  capacity?: number; // Default 21 (standard)
  speedMultiplier?: number; // Default 1.0
}

/**
 * Visual state for rendering
 */
export interface ElevatorVisualState {
  currentFloor: number;
  renderPosition: number; // Includes partial floor progress
  direction: ElevatorDirection;
  doorsOpen: boolean;
  passengerCount: number;
  capacity: number;
  isMoving: boolean;
  nextStop: number | null;
}

export class ElevatorCar {
  readonly id: string;
  readonly shaftId: string;
  
  currentFloor: number;
  private targetFloor: number | null = null;
  
  direction: ElevatorDirection = 'idle';
  
  // Movement
  private floorProgress: number = 0; // 0-1 between floors
  private readonly baseSpeed: number = 0.02; // floors per tick at 1x game speed
  private speedMultiplier: number = 1.0; // Type-based speed (express = 1.5x)
  
  // Capacity
  readonly maxCapacity: number;
  passengerIds: string[] = [];
  
  // Service range
  minFloor: number;
  maxFloor: number;
  
  // Doors
  doorsOpen: boolean = false;
  private doorTimer: number = 0;
  private readonly doorOpenDuration: number = 30; // ticks (~0.5s at 60 ticks/sec)
  
  // Call queues (LOOK algorithm core)
  upCalls: Set<number> = new Set(); // Floors with up calls
  downCalls: Set<number> = new Set(); // Floors with down calls
  carCalls: Set<number> = new Set(); // Destination buttons pressed inside car
  
  // Performance tracking
  private totalTrips: number = 0;
  private totalPassengersTransported: number = 0;
  
  constructor(config: ElevatorCarConfig) {
    this.id = generateUUID();
    this.shaftId = config.shaftId;
    this.currentFloor = config.currentFloor;
    this.minFloor = config.minFloor;
    this.maxFloor = config.maxFloor;
    this.maxCapacity = config.capacity ?? 21;
    this.speedMultiplier = config.speedMultiplier ?? 1.0;
  }
  
  /**
   * Update car state (called each simulation tick)
   */
  update(gameSpeed: number): void {
    // Handle door timer
    if (this.doorsOpen) {
      this.doorTimer++;
      if (this.doorTimer >= this.doorOpenDuration) {
        this.closeDoors();
      }
      return; // Don't move while doors are open
    }
    
    // LOOK algorithm - decide next move
    this.updateLOOK();
    
    // Move toward target floor
    if (this.targetFloor !== null) {
      this.move(gameSpeed);
    }
  }
  
  /**
   * LOOK Algorithm - The heart of elevator intelligence
   * 
   * This is what makes elevators feel "smart" or "dumb" to players.
   * Good programming = efficient LOOK execution = happy passengers.
   * 
   * Rules:
   * 1. Continue in current direction until no more requests ahead
   * 2. Service all calls in the current direction (collect passengers going your way)
   * 3. Reverse direction only when there are no more requests ahead
   * 4. Go idle if no requests exist anywhere
   */
  private updateLOOK(): void {
    const currentFloorInt = Math.floor(this.currentFloor);
    
    // If we have a target and haven't reached it, keep going
    if (this.targetFloor !== null && currentFloorInt !== this.targetFloor) {
      return;
    }
    
    // We're at a floor (or idle) - check if we should stop here
    const shouldStop = this.shouldStopAtFloor(currentFloorInt);
    
    if (shouldStop) {
      this.openDoors();
      this.clearCallsAtFloor(currentFloorInt);
      this.targetFloor = null;
      this.totalTrips++;
      return;
    }
    
    // Determine next destination using LOOK logic
    if (this.direction === 'up' || this.direction === 'idle') {
      const nextUp = this.getNextFloorUp(currentFloorInt);
      if (nextUp !== null) {
        this.targetFloor = nextUp;
        this.direction = 'up';
        return;
      }
    }
    
    if (this.direction === 'down' || this.direction === 'idle') {
      const nextDown = this.getNextFloorDown(currentFloorInt);
      if (nextDown !== null) {
        this.targetFloor = nextDown;
        this.direction = 'down';
        return;
      }
    }
    
    // No requests in current direction - try reversing
    if (this.direction === 'up') {
      const nextDown = this.getNextFloorDown(currentFloorInt);
      if (nextDown !== null) {
        this.targetFloor = nextDown;
        this.direction = 'down';
        return;
      }
    } else if (this.direction === 'down') {
      const nextUp = this.getNextFloorUp(currentFloorInt);
      if (nextUp !== null) {
        this.targetFloor = nextUp;
        this.direction = 'up';
        return;
      }
    }
    
    // No requests anywhere - go idle
    this.direction = 'idle';
    this.targetFloor = null;
  }
  
  /**
   * Determine if car should stop at this floor
   * 
   * Stop conditions:
   * - Car call (passenger inside wants to exit)
   * - Hall call in our direction (passenger outside wants to board)
   */
  private shouldStopAtFloor(floor: number): boolean {
    // Always stop for car calls (passengers exiting)
    if (this.carCalls.has(floor)) return true;
    
    // Stop for hall calls matching our direction
    if (this.direction === 'up' && this.upCalls.has(floor)) return true;
    if (this.direction === 'down' && this.downCalls.has(floor)) return true;
    
    // If idle, stop for any hall call
    if (this.direction === 'idle') {
      if (this.upCalls.has(floor) || this.downCalls.has(floor)) return true;
    }
    
    return false;
  }
  
  /**
   * Get next floor with a call in the UP direction
   * 
   * Considers:
   * - Up hall calls ahead of us
   * - Car calls ahead of us
   */
  private getNextFloorUp(currentFloor: number): number | null {
    const relevantCalls = [
      ...Array.from(this.upCalls),
      ...Array.from(this.carCalls),
    ].filter(f => f > currentFloor && f <= this.maxFloor);
    
    return relevantCalls.length > 0 ? Math.min(...relevantCalls) : null;
  }
  
  /**
   * Get next floor with a call in the DOWN direction
   * 
   * Considers:
   * - Down hall calls below us
   * - Car calls below us
   */
  private getNextFloorDown(currentFloor: number): number | null {
    const relevantCalls = [
      ...Array.from(this.downCalls),
      ...Array.from(this.carCalls),
    ].filter(f => f < currentFloor && f >= this.minFloor);
    
    return relevantCalls.length > 0 ? Math.max(...relevantCalls) : null;
  }
  
  /**
   * Clear all calls at this floor (we've serviced them)
   */
  private clearCallsAtFloor(floor: number): void {
    this.upCalls.delete(floor);
    this.downCalls.delete(floor);
    this.carCalls.delete(floor);
  }
  
  /**
   * Move toward target floor
   */
  private move(gameSpeed: number): void {
    if (this.targetFloor === null) return;
    
    const currentFloorInt = Math.floor(this.currentFloor);
    
    // Arrived at target
    if (currentFloorInt === this.targetFloor && this.floorProgress === 0) {
      this.currentFloor = this.targetFloor;
      return;
    }
    
    // Determine movement direction
    const moveDirection = this.targetFloor > currentFloorInt ? 1 : -1;
    
    // Apply speed (base speed * type multiplier * game speed)
    const effectiveSpeed = this.baseSpeed * this.speedMultiplier * gameSpeed;
    this.floorProgress += effectiveSpeed;
    
    // Cross floor boundary
    if (this.floorProgress >= 1.0) {
      this.currentFloor += moveDirection;
      this.floorProgress = 0;
      
      // Normalize floor to integer
      this.currentFloor = Math.round(this.currentFloor);
    }
  }
  
  /**
   * Add a hall call (person pressing button outside elevator)
   */
  addHallCall(floor: number, direction: 'up' | 'down'): void {
    if (direction === 'up') {
      this.upCalls.add(floor);
    } else {
      this.downCalls.add(floor);
    }
  }
  
  /**
   * Add a car call (person pressing button inside elevator)
   */
  addCarCall(floor: number): void {
    if (floor >= this.minFloor && floor <= this.maxFloor) {
      this.carCalls.add(floor);
    }
  }
  
  /**
   * Open doors
   */
  openDoors(): void {
    if (!this.doorsOpen) {
      // Play sound only on transition
      getSoundManager().playElevatorDing();
    }
    this.doorsOpen = true;
    this.doorTimer = 0;
  }
  
  /**
   * Close doors
   */
  closeDoors(): void {
    this.doorsOpen = false;
    this.doorTimer = 0;
  }
  
  /**
   * Can car accept more passengers?
   */
  canAcceptPassenger(): boolean {
    return this.passengerIds.length < this.maxCapacity;
  }
  
  /**
   * Board a passenger
   */
  boardPassenger(personId: string, destinationFloor: number): boolean {
    if (!this.canAcceptPassenger()) return false;
    
    this.passengerIds.push(personId);
    this.addCarCall(destinationFloor);
    this.totalPassengersTransported++;
    return true;
  }
  
  /**
   * Remove passenger from car (they've exited)
   */
  removePassenger(personId: string): void {
    const index = this.passengerIds.indexOf(personId);
    if (index !== -1) {
      this.passengerIds.splice(index, 1);
    }
  }
  
  /**
   * Update floor range (when programming changes)
   */
  updateFloorRange(minFloor: number, maxFloor: number): void {
    this.minFloor = minFloor;
    this.maxFloor = maxFloor;
    
    // Remove calls outside new range
    this.upCalls = new Set([...this.upCalls].filter(f => f >= minFloor && f <= maxFloor));
    this.downCalls = new Set([...this.downCalls].filter(f => f >= minFloor && f <= maxFloor));
    this.carCalls = new Set([...this.carCalls].filter(f => f >= minFloor && f <= maxFloor));
  }
  
  /**
   * Get current position for rendering (includes partial floor progress)
   */
  getRenderPosition(): number {
    return this.currentFloor + this.floorProgress;
  }
  
  /**
   * Get visual state for rendering
   */
  getVisualState(): ElevatorVisualState {
    return {
      currentFloor: Math.floor(this.currentFloor),
      renderPosition: this.getRenderPosition(),
      direction: this.direction,
      doorsOpen: this.doorsOpen,
      passengerCount: this.passengerIds.length,
      capacity: this.maxCapacity,
      isMoving: this.targetFloor !== null && !this.doorsOpen,
      nextStop: this.targetFloor,
    };
  }
  
  /**
   * Get door timer (for rendering/animations)
   */
  getDoorTimer(): number {
    return this.doorTimer;
  }
  
  /**
   * Get door open duration
   */
  getDoorOpenDuration(): number {
    return this.doorOpenDuration;
  }
  
  /**
   * Get all pending calls (for debugging/UI)
   */
  getPendingCalls(): { up: number[]; down: number[]; car: number[] } {
    return {
      up: Array.from(this.upCalls).sort((a, b) => a - b),
      down: Array.from(this.downCalls).sort((a, b) => b - a),
      car: Array.from(this.carCalls).sort((a, b) => a - b),
    };
  }
  
  /**
   * Get performance statistics
   */
  getStats() {
    return {
      totalTrips: this.totalTrips,
      totalPassengersTransported: this.totalPassengersTransported,
      currentLoad: this.passengerIds.length,
      loadPercentage: (this.passengerIds.length / this.maxCapacity) * 100,
    };
  }
  
  /**
   * Serialize for saving
   */
  serialize(): any {
    return {
      id: this.id,
      shaftId: this.shaftId,
      currentFloor: this.currentFloor,
      direction: this.direction,
      doorsOpen: this.doorsOpen,
      doorTimer: this.doorTimer,
      passengerIds: [...this.passengerIds],
      minFloor: this.minFloor,
      maxFloor: this.maxFloor,
      maxCapacity: this.maxCapacity,
      speedMultiplier: this.speedMultiplier,
      floorProgress: this.floorProgress,
      targetFloor: this.targetFloor,
      upCalls: Array.from(this.upCalls),
      downCalls: Array.from(this.downCalls),
      carCalls: Array.from(this.carCalls),
      totalTrips: this.totalTrips,
      totalPassengersTransported: this.totalPassengersTransported,
    };
  }
  
  /**
   * Deserialize from saved data
   */
  static deserialize(data: any): ElevatorCar {
    const car = new ElevatorCar({
      shaftId: data.shaftId,
      currentFloor: data.currentFloor,
      minFloor: data.minFloor,
      maxFloor: data.maxFloor,
      capacity: data.maxCapacity,
      speedMultiplier: data.speedMultiplier,
    });
    
    // Restore ID
    (car as any).id = data.id;
    
    // Restore state
    car.direction = data.direction;
    car.doorsOpen = data.doorsOpen;
    car.doorTimer = data.doorTimer || 0;
    car.passengerIds = data.passengerIds || [];
    car['floorProgress'] = data.floorProgress || 0;
    car['targetFloor'] = data.targetFloor || null;
    car.upCalls = new Set(data.upCalls || []);
    car.downCalls = new Set(data.downCalls || []);
    car.carCalls = new Set(data.carCalls || []);
    car['totalTrips'] = data.totalTrips || 0;
    car['totalPassengersTransported'] = data.totalPassengersTransported || 0;
    
    return car;
  }
}
