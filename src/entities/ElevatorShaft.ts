import { generateUUID } from '@core/uuid';
import { ElevatorCar } from './ElevatorCar';

/**
 * Elevator Shaft - Contains elevator cars
 * 
 * A shaft defines the vertical structure that contains one or more cars.
 * Each type has different characteristics and costs.
 * 
 * @module entities/ElevatorShaft
 */

export type ElevatorType = 'standard' | 'express' | 'service';

/**
 * Operating hours configuration
 */
export interface OperatingHours {
  enabled: boolean;
  startHour: number; // 0-23
  endHour: number; // 0-23
}

/**
 * Zone configuration for express elevators
 */
export interface ElevatorZone {
  name: string;
  floors: number[];
  priority: number; // Higher priority = more responsive
}

/**
 * Elevator programming configuration (the UI puzzle!)
 */
export interface ElevatorProgramming {
  // Floor range (can be adjusted by player)
  minFloor: number;
  maxFloor: number;
  
  // Operating hours
  operatingHours: OperatingHours;
  
  // Zone assignment (for complex buildings)
  zones: ElevatorZone[];
  
  // Priority settings
  priorityFloors: number[]; // These floors get preferential service
  
  // Skip floors (elevator won't stop here)
  skipFloors: Set<number>;
  
  // Advanced settings
  maxWaitTime: number; // seconds - how long before elevator is considered "slow"
  doorHoldTime: number; // seconds - how long doors stay open
}

export interface ElevatorShaftConfig {
  tileX: number; // Horizontal position
  minFloor: number;
  maxFloor: number;
  type?: ElevatorType; // Default 'standard'
  carCount?: number; // Default 1
}

/**
 * Type-specific characteristics
 */
const TYPE_CHARACTERISTICS = {
  standard: {
    maxFloorRange: 30,
    maxCapacityPerCar: 21,
    speed: 1.0, // Base speed multiplier
    cost: 10000,
    maintenanceCost: 50,
  },
  express: {
    maxFloorRange: Infinity, // Unlimited
    maxCapacityPerCar: 28,
    speed: 1.5, // 50% faster
    cost: 50000,
    maintenanceCost: 200,
  },
  service: {
    maxFloorRange: Infinity,
    maxCapacityPerCar: 15, // Smaller capacity
    speed: 0.8, // Slightly slower
    cost: 8000,
    maintenanceCost: 40,
  },
};

export class ElevatorShaft {
  readonly id: string;
  readonly tileX: number;
  readonly type: ElevatorType;
  
  minFloor: number;
  maxFloor: number;
  
  cars: ElevatorCar[] = [];
  
  // Programming configuration (player-adjustable)
  programming: ElevatorProgramming;
  
  constructor(config: ElevatorShaftConfig) {
    this.id = generateUUID();
    this.tileX = config.tileX;
    this.type = config.type ?? 'standard';
    this.minFloor = config.minFloor;
    this.maxFloor = config.maxFloor;
    
    // Validate floor range for type
    const characteristics = TYPE_CHARACTERISTICS[this.type];
    const floorRange = config.maxFloor - config.minFloor + 1;
    if (floorRange > characteristics.maxFloorRange) {
      throw new Error(
        `${this.type} elevator limited to ${characteristics.maxFloorRange} floors`
      );
    }
    
    // Initialize programming with defaults
    this.programming = {
      minFloor: config.minFloor,
      maxFloor: config.maxFloor,
      operatingHours: {
        enabled: false, // 24/7 by default
        startHour: 6,
        endHour: 22,
      },
      zones: [],
      priorityFloors: [],
      skipFloors: new Set(),
      maxWaitTime: 60,
      doorHoldTime: 3,
    };
    
    // Create cars
    const carCount = config.carCount ?? 1;
    for (let i = 0; i < carCount; i++) {
      const car = new ElevatorCar({
        shaftId: this.id,
        currentFloor: config.minFloor,
        minFloor: config.minFloor,
        maxFloor: config.maxFloor,
        capacity: characteristics.maxCapacityPerCar,
        speedMultiplier: characteristics.speed,
      });
      this.cars.push(car);
    }
  }
  
  /**
   * Update all cars in shaft
   */
  update(gameSpeed: number): void {
    // Check if elevator should be operating (based on hours)
    const isOperating = this.isCurrentlyOperating();
    
    for (const car of this.cars) {
      if (isOperating) {
        car.update(gameSpeed);
      } else {
        // If not operating, return to ground floor and idle
        if (car.currentFloor !== this.minFloor && car.direction === 'idle') {
          car.addCarCall(this.minFloor);
        }
        car.update(gameSpeed);
      }
    }
  }
  
  /**
   * Check if elevator is currently operating (based on time)
   */
  isCurrentlyOperating(): boolean {
    if (!this.programming.operatingHours.enabled) {
      return true; // 24/7 operation
    }
    
    // TODO: Get actual game time from tower
    // For now, assume always operating
    return true;
  }
  
  /**
   * Call elevator to a floor
   * Returns the car that will respond (closest available)
   */
  callElevator(floor: number, direction: 'up' | 'down'): ElevatorCar | null {
    // Check if this floor is serviced
    if (!this.servesFloor(floor)) return null;
    
    // No cars available
    if (this.cars.length === 0) return null;
    
    // Find best car to respond using smart dispatching
    let bestCar: ElevatorCar | null = null;
    let bestScore = Infinity;
    
    for (const car of this.cars) {
      // Skip full cars
      if (!car.canAcceptPassenger()) continue;
      
      // Calculate score (lower is better)
      const distance = Math.abs(car.currentFloor - floor);
      const load = car.passengerIds.length / car.maxCapacity;
      const directionMatch = 
        car.direction === 'idle' ? 0 :
        car.direction === direction ? -5 : 5; // Bonus if going same direction
      
      const score = distance + (load * 10) + directionMatch;
      
      if (score < bestScore) {
        bestScore = score;
        bestCar = car;
      }
    }
    
    if (!bestCar) return null;
    
    // Add call to best car
    bestCar.addHallCall(floor, direction);
    
    return bestCar;
  }
  
  /**
   * Get car by ID
   */
  getCar(carId: string): ElevatorCar | undefined {
    return this.cars.find(c => c.id === carId);
  }
  
  /**
   * Check if elevator serves a floor (respects programming)
   */
  servesFloor(floor: number): boolean {
    // Check if floor is in range
    if (floor < this.programming.minFloor || floor > this.programming.maxFloor) {
      return false;
    }
    
    // Check if floor is explicitly skipped
    if (this.programming.skipFloors.has(floor)) {
      return false;
    }
    
    // Service elevator only serves staff-accessible floors
    if (this.type === 'service') {
      // TODO: Check if floor has staff-only facilities
      return true; // For now, serve all floors
    }
    
    return true;
  }
  
  /**
   * Get total passenger count across all cars
   */
  getTotalPassengers(): number {
    return this.cars.reduce((sum, car) => sum + car.passengerIds.length, 0);
  }
  
  /**
   * Get total capacity across all cars
   */
  getTotalCapacity(): number {
    return this.cars.reduce((sum, car) => sum + car.maxCapacity, 0);
  }
  
  /**
   * Get type characteristics
   */
  getCharacteristics() {
    return TYPE_CHARACTERISTICS[this.type];
  }
  
  /**
   * Update programming configuration (player action)
   */
  updateProgramming(updates: Partial<ElevatorProgramming>): void {
    this.programming = {
      ...this.programming,
      ...updates,
    };
    
    // Update car floor ranges if changed
    if (updates.minFloor !== undefined || updates.maxFloor !== undefined) {
      const newMin = updates.minFloor ?? this.programming.minFloor;
      const newMax = updates.maxFloor ?? this.programming.maxFloor;
      
      for (const car of this.cars) {
        car.updateFloorRange(newMin, newMax);
      }
    }
  }
  
  /**
   * Set priority floors (these get preferential service)
   */
  setPriorityFloors(floors: number[]): void {
    this.programming.priorityFloors = floors;
  }
  
  /**
   * Add a floor to skip list
   */
  addSkipFloor(floor: number): void {
    this.programming.skipFloors.add(floor);
  }
  
  /**
   * Remove a floor from skip list
   */
  removeSkipFloor(floor: number): void {
    this.programming.skipFloors.delete(floor);
  }
  
  /**
   * Set operating hours
   */
  setOperatingHours(hours: OperatingHours): void {
    this.programming.operatingHours = hours;
  }
  
  /**
   * Add a zone configuration
   */
  addZone(zone: ElevatorZone): void {
    this.programming.zones.push(zone);
  }
  
  /**
   * Remove a zone
   */
  removeZone(zoneName: string): void {
    this.programming.zones = this.programming.zones.filter(z => z.name !== zoneName);
  }
  
  /**
   * Get construction cost for this elevator
   */
  getConstructionCost(): number {
    const characteristics = TYPE_CHARACTERISTICS[this.type];
    const floorRange = this.maxFloor - this.minFloor + 1;
    return characteristics.cost + (floorRange * 500);
  }
  
  /**
   * Get daily maintenance cost
   */
  getMaintenanceCost(): number {
    return TYPE_CHARACTERISTICS[this.type].maintenanceCost * this.cars.length;
  }
  
  /**
   * Serialize for saving
   */
  serialize(): any {
    return {
      id: this.id,
      tileX: this.tileX,
      type: this.type,
      minFloor: this.minFloor,
      maxFloor: this.maxFloor,
      programming: {
        ...this.programming,
        skipFloors: Array.from(this.programming.skipFloors),
      },
      cars: this.cars.map(car => car.serialize()),
    };
  }
  
  /**
   * Deserialize from saved data
   */
  static deserialize(data: any): ElevatorShaft {
    const shaft = new ElevatorShaft({
      tileX: data.tileX,
      minFloor: data.minFloor,
      maxFloor: data.maxFloor,
      type: data.type,
      carCount: 0, // We'll restore cars manually
    });
    
    // Restore ID
    (shaft as any).id = data.id;
    
    // Restore programming
    if (data.programming) {
      shaft.programming = {
        ...data.programming,
        skipFloors: new Set(data.programming.skipFloors || []),
      };
    }
    
    // Restore cars
    shaft.cars = [];
    if (data.cars) {
      for (const carData of data.cars) {
        const car = ElevatorCar.deserialize(carData);
        shaft.cars.push(car);
      }
    }
    
    return shaft;
  }
}
