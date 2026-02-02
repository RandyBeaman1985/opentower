/**
 * Elevator System - The core puzzle of OpenTower
 * 
 * This is what SimTower was really about. Elevator management is THE game.
 * Players must balance cost, capacity, and efficiency to keep tenants happy.
 * 
 * @module simulation/ElevatorSystem
 */

import { ElevatorShaft, ElevatorType, ElevatorShaftConfig } from '@/entities/ElevatorShaft';
import { ElevatorCar } from '@/entities/ElevatorCar';
import type { Tower } from '@/interfaces';

/**
 * Passenger waiting for elevator
 */
export interface WaitingPassenger {
  personId: string;
  floor: number;
  direction: 'up' | 'down';
  destinationFloor: number;
  waitStartTime: number; // Game time when they started waiting
  stressLevel: number; // 0-100, increases with wait time
}

/**
 * Elevator call button state (visual feedback)
 */
export interface CallButtonState {
  floor: number;
  direction: 'up' | 'down';
  isLit: boolean;
  waitingPassengers: number;
  longestWaitTime: number; // seconds
}

/**
 * Statistics for elevator performance tracking
 */
export interface ElevatorStats {
  totalPassengersTransported: number;
  averageWaitTime: number; // seconds
  stressedPassengers: number; // count of passengers who exceeded threshold
  totalWaitTimeAccumulated: number; // for computing average
  elevatorCount: number;
  totalCapacity: number;
  utilizationRate: number; // 0-1, how full elevators are on average
}

/**
 * Elevator request result
 */
export interface ElevatorRequest {
  shaft: ElevatorShaft;
  car: ElevatorCar;
  estimatedWaitTime: number; // seconds
}

export class ElevatorSystem {
  private shafts: Map<string, ElevatorShaft> = new Map();
  private waitingPassengers: Map<string, WaitingPassenger> = new Map(); // personId -> passenger
  private callButtons: Map<string, CallButtonState> = new Map(); // "floor:direction" -> state
  
  // Statistics tracking
  private stats: ElevatorStats = {
    totalPassengersTransported: 0,
    averageWaitTime: 0,
    stressedPassengers: 0,
    totalWaitTimeAccumulated: 0,
    elevatorCount: 0,
    totalCapacity: 0,
    utilizationRate: 0,
  };
  
  // Configuration constants
  private readonly STRESS_THRESHOLD_SECONDS = 45; // Passengers get stressed after 45s wait
  private readonly MAX_WAIT_TIME_SECONDS = 120; // After 2 minutes, they give up
  private readonly STRESS_INCREASE_RATE = 1.5; // Stress points per second of waiting
  
  constructor() {
    // Empty initialization
  }
  
  /**
   * Get all elevator shafts
   */
  getShafts(): ElevatorShaft[] {
    return Array.from(this.shafts.values());
  }
  
  /**
   * Get a shaft by ID
   */
  getShaft(id: string): ElevatorShaft | undefined {
    return this.shafts.get(id);
  }
  
  /**
   * Add an elevator shaft
   */
  addShaft(shaft: ElevatorShaft): void {
    this.shafts.set(shaft.id, shaft);
    this.updateStats();
  }
  
  /**
   * Remove an elevator shaft
   */
  removeShaft(id: string): void {
    this.shafts.delete(id);
    this.updateStats();
  }
  
  /**
   * Update all elevators and passenger queues
   */
  update(tower: Tower, gameSpeed: number): void {
    const currentTime = tower.clock.getCurrentTime();
    
    // Update all elevator shafts
    for (const shaft of this.shafts.values()) {
      shaft.update(gameSpeed);
    }
    
    // Update waiting passengers (stress accumulation)
    this.updateWaitingPassengers(currentTime, gameSpeed);
    
    // Update call button states
    this.updateCallButtons();
    
    // Update statistics
    this.updateStats();
  }
  
  /**
   * Update waiting passenger stress levels
   */
  private updateWaitingPassengers(currentTime: number, gameSpeed: number): void {
    for (const passenger of this.waitingPassengers.values()) {
      const waitTime = currentTime - passenger.waitStartTime;
      
      // Increase stress over time
      if (waitTime > this.STRESS_THRESHOLD_SECONDS) {
        passenger.stressLevel += this.STRESS_INCREASE_RATE * (gameSpeed / 60);
      }
      
      // Cap stress at 100
      passenger.stressLevel = Math.min(100, passenger.stressLevel);
      
      // Track stressed passengers for stats
      if (passenger.stressLevel >= 75) {
        // Will be counted in stats
      }
      
      // TODO: If wait time exceeds max, passenger gives up and leaves
      if (waitTime > this.MAX_WAIT_TIME_SECONDS) {
        // Remove from queue, trigger negative event
        this.waitingPassengers.delete(passenger.personId);
        this.stats.stressedPassengers++;
      }
    }
  }
  
  /**
   * Update call button visual states
   */
  private updateCallButtons(): void {
    // Reset all buttons
    this.callButtons.clear();
    
    // Aggregate waiting passengers by floor/direction
    const queueMap = new Map<string, WaitingPassenger[]>();
    
    for (const passenger of this.waitingPassengers.values()) {
      const key = `${passenger.floor}:${passenger.direction}`;
      if (!queueMap.has(key)) {
        queueMap.set(key, []);
      }
      queueMap.get(key)!.push(passenger);
    }
    
    // Create button states
    for (const [key, passengers] of queueMap) {
      const [floorStr, direction] = key.split(':');
      const floor = parseInt(floorStr!, 10);
      
      // Find longest wait time
      let longestWait = 0;
      for (const p of passengers) {
        const waitTime = Date.now() / 1000 - p.waitStartTime;
        longestWait = Math.max(longestWait, waitTime);
      }
      
      this.callButtons.set(key, {
        floor,
        direction: direction as 'up' | 'down',
        isLit: true,
        waitingPassengers: passengers.length,
        longestWaitTime: longestWait,
      });
    }
  }
  
  /**
   * Request elevator for a passenger
   * Returns the elevator that will service this call
   */
  requestElevator(
    personId: string,
    fromFloor: number,
    toFloor: number,
    currentTime: number
  ): ElevatorRequest | null {
    const direction: 'up' | 'down' = toFloor > fromFloor ? 'up' : 'down';
    
    // Add to waiting queue
    const passenger: WaitingPassenger = {
      personId,
      floor: fromFloor,
      direction,
      destinationFloor: toFloor,
      waitStartTime: currentTime,
      stressLevel: 0,
    };
    this.waitingPassengers.set(personId, passenger);
    
    // Find best elevator to service this call
    const validShafts = Array.from(this.shafts.values()).filter(shaft =>
      shaft.servesFloor(fromFloor) && shaft.servesFloor(toFloor)
    );
    
    if (validShafts.length === 0) return null;
    
    // Smart dispatching: find closest available elevator
    let bestShaft: ElevatorShaft | null = null;
    let bestCar: ElevatorCar | null = null;
    let bestScore = Infinity;
    
    for (const shaft of validShafts) {
      for (const car of shaft.cars) {
        // Skip if car is full
        if (!car.canAcceptPassenger()) continue;
        
        // Calculate score (lower is better)
        const distance = Math.abs(car.currentFloor - fromFloor);
        const load = car.passengerIds.length / car.maxCapacity;
        const directionMatch = 
          car.direction === 'idle' ? 0 :
          car.direction === direction ? -5 : 5; // Bonus if going same direction
        
        const score = distance + (load * 10) + directionMatch;
        
        if (score < bestScore) {
          bestScore = score;
          bestShaft = shaft;
          bestCar = car;
        }
      }
    }
    
    if (!bestShaft || !bestCar) return null;
    
    // Add call to elevator
    bestCar.addHallCall(fromFloor, direction);
    
    // Estimate wait time
    const estimatedWaitTime = this.estimateWaitTime(bestCar, fromFloor);
    
    return {
      shaft: bestShaft,
      car: bestCar,
      estimatedWaitTime,
    };
  }
  
  /**
   * Estimate how long until elevator arrives at floor
   */
  private estimateWaitTime(car: ElevatorCar, targetFloor: number): number {
    const distance = Math.abs(car.currentFloor - targetFloor);
    const secondsPerFloor = 2; // Rough estimate
    return distance * secondsPerFloor;
  }
  
  /**
   * Passenger boards an elevator
   */
  boardPassenger(personId: string, car: ElevatorCar, currentTime: number): boolean {
    const passenger = this.waitingPassengers.get(personId);
    if (!passenger) return false;
    
    // Try to board
    const success = car.boardPassenger(personId, passenger.destinationFloor);
    
    if (success) {
      // Remove from waiting queue
      this.waitingPassengers.delete(personId);
      
      // Update statistics
      const waitTime = currentTime - passenger.waitStartTime;
      this.stats.totalWaitTimeAccumulated += waitTime;
      this.stats.totalPassengersTransported++;
      this.stats.averageWaitTime = 
        this.stats.totalWaitTimeAccumulated / this.stats.totalPassengersTransported;
      
      // Track if passenger was stressed
      if (passenger.stressLevel >= 75) {
        this.stats.stressedPassengers++;
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Get call button state for UI rendering
   */
  getCallButton(floor: number, direction: 'up' | 'down'): CallButtonState | null {
    const key = `${floor}:${direction}`;
    return this.callButtons.get(key) || null;
  }
  
  /**
   * Get all call buttons (for rendering)
   */
  getAllCallButtons(): CallButtonState[] {
    return Array.from(this.callButtons.values());
  }
  
  /**
   * Get waiting passengers at a specific floor
   */
  getWaitingPassengersAtFloor(floor: number): WaitingPassenger[] {
    return Array.from(this.waitingPassengers.values()).filter(
      p => p.floor === floor
    );
  }
  
  /**
   * Get all waiting passengers
   */
  getAllWaitingPassengers(): WaitingPassenger[] {
    return Array.from(this.waitingPassengers.values());
  }
  
  /**
   * Update elevator statistics
   */
  private updateStats(): void {
    this.stats.elevatorCount = this.shafts.size;
    
    let totalCapacity = 0;
    let totalPassengers = 0;
    
    for (const shaft of this.shafts.values()) {
      for (const car of shaft.cars) {
        totalCapacity += car.maxCapacity;
        totalPassengers += car.passengerIds.length;
      }
    }
    
    this.stats.totalCapacity = totalCapacity;
    this.stats.utilizationRate = totalCapacity > 0 ? totalPassengers / totalCapacity : 0;
  }
  
  /**
   * Get current statistics
   */
  getStats(): ElevatorStats {
    return { ...this.stats };
  }
  
  /**
   * Get all cars across all shafts
   */
  getAllCars(): ElevatorCar[] {
    const cars: ElevatorCar[] = [];
    for (const shaft of this.shafts.values()) {
      cars.push(...shaft.cars);
    }
    return cars;
  }
  
  /**
   * Create a standard elevator shaft (30 floor max, 21 passengers)
   */
  createStandardShaft(tileX: number, minFloor: number, maxFloor: number): ElevatorShaft {
    const floorRange = maxFloor - minFloor + 1;
    if (floorRange > 30) {
      throw new Error('Standard elevator limited to 30 floors');
    }
    
    const shaft = new ElevatorShaft({
      tileX,
      minFloor,
      maxFloor,
      type: 'standard',
      carCount: 1,
    });
    
    this.addShaft(shaft);
    return shaft;
  }
  
  /**
   * Create an express elevator shaft (unlimited floors, 28 passengers, expensive)
   */
  createExpressShaft(tileX: number, minFloor: number, maxFloor: number): ElevatorShaft {
    const shaft = new ElevatorShaft({
      tileX,
      minFloor,
      maxFloor,
      type: 'express',
      carCount: 1,
    });
    
    this.addShaft(shaft);
    return shaft;
  }
  
  /**
   * Create a service elevator shaft (staff only, behind scenes)
   */
  createServiceShaft(tileX: number, minFloor: number, maxFloor: number): ElevatorShaft {
    const shaft = new ElevatorShaft({
      tileX,
      minFloor,
      maxFloor,
      type: 'service',
      carCount: 1,
    });
    
    this.addShaft(shaft);
    return shaft;
  }
  
  /**
   * Get elevator construction cost
   */
  static getConstructionCost(type: ElevatorType, floorRange: number): number {
    const baseCost = {
      standard: 10000,
      express: 50000,
      service: 8000,
    }[type];
    
    return baseCost + (floorRange * 500);
  }
  
  /**
   * Get elevator maintenance cost (per day)
   */
  static getMaintenanceCost(type: ElevatorType): number {
    return {
      standard: 50,
      express: 200,
      service: 40,
    }[type];
  }

  /**
   * Serialize elevator state for saving
   */
  serialize(): any {
    const shaftsArray = Array.from(this.shafts.values()).map(shaft => shaft.serialize());
    
    const waitingPassengersArray = Array.from(this.waitingPassengers.values());
    
    return {
      shafts: shaftsArray,
      waitingPassengers: waitingPassengersArray,
      stats: this.stats,
    };
  }

  /**
   * Deserialize elevator state from saved data
   */
  deserialize(data: any): void {
    this.shafts.clear();
    this.waitingPassengers.clear();

    // Restore shafts
    if (data.shafts) {
      for (const shaftData of data.shafts) {
        const shaft = ElevatorShaft.deserialize(shaftData);
        this.shafts.set(shaft.id, shaft);
      }
    }
    
    // Restore waiting passengers
    if (data.waitingPassengers) {
      for (const passengerData of data.waitingPassengers) {
        this.waitingPassengers.set(passengerData.personId, passengerData);
      }
    }
    
    // Restore stats
    if (data.stats) {
      this.stats = { ...data.stats };
    }
    
    this.updateCallButtons();
    this.updateStats();
  }
}
