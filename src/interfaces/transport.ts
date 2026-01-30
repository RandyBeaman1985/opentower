/**
 * Transport interfaces - Elevators, Stairs, Escalators
 * @module interfaces/transport
 */

/**
 * Elevator types
 */
export type ElevatorType = 'standard' | 'express' | 'service';

/**
 * Elevator car direction
 */
export type ElevatorDirection = 'up' | 'down' | 'idle';

/**
 * Elevator door states
 */
export type DoorState = 'closed' | 'opening' | 'open' | 'closing';

/**
 * Elevator car states
 */
export type ElevatorCarState = 'idle' | 'moving' | 'stopped' | 'loading';

/**
 * Base transport interface
 */
export interface ITransport {
  readonly id: string;
  readonly type: 'elevator' | 'stairs' | 'escalator';

  getAccessPoints(): AccessPoint[];
  getEstimatedWaitTime(fromFloor: number, toFloor: number): number;
  canAccept(personId: string): boolean;
}

export interface AccessPoint {
  floor: number;
  tileStart: number;
  tileEnd: number;
}

/**
 * Elevator shaft interface
 * Each shaft can have up to 8 cars
 */
export interface IElevatorShaft extends ITransport {
  readonly type: 'elevator';
  readonly elevatorType: ElevatorType;

  position: { tile: number; topFloor: number; bottomFloor: number };

  /** Car IDs in this shaft */
  carIds: string[];

  /** Maximum 8 cars per shaft */
  maxCars: 8;

  /**
   * For express elevators: which sky lobby they serve (ONE only)
   * Express elevators serve: ground lobby + ONE specific sky lobby
   * VERIFIED: Express elevators don't stop at every sky lobby
   */
  targetSkyLobby: number | null;

  /** Queues by floor - stores person IDs */
  queuesByFloor: Record<number, { up: string[]; down: string[] }>;

  maintenanceCostPerQuarter: number;

  // Methods
  addCar(): string | null; // Returns new car ID or null if at max
  removeCar(carId: string): boolean;
  getQueueLength(floor: number): number;
}

/**
 * Elevator car interface
 */
export interface IElevatorCar {
  readonly id: string;
  shaftId: string;

  currentFloor: number;
  /** 0-1 for animation interpolation between floors */
  floorProgress: number;
  direction: ElevatorDirection;

  /** Person IDs of passengers */
  passengerIds: string[];

  /** Maximum passengers (21 for standard) */
  capacity: number;

  /** Floors this car needs to stop at */
  destinationFloors: number[];

  doorState: DoorState;
  state: ElevatorCarState;
}

/**
 * Elevator configurations
 * VERIFIED from plan
 */
export const ELEVATOR_CONFIGS = {
  standard: {
    type: 'standard' as ElevatorType,
    baseCost: 200000,
    extensionCostPerFloor: 80000,
    maxFloors: 30,
    maxCars: 8,
    maintenancePerQuarter: 10000,
    capacity: 21,
    speedFloorsPerSecond: 1, // ~1 floor per second
  },
  express: {
    type: 'express' as ElevatorType,
    baseCost: 400000,
    extensionCostPerFloor: 150000,
    maxFloors: Infinity, // Unlimited
    maxCars: 8,
    maintenancePerQuarter: 20000,
    capacity: 21,
    speedFloorsPerSecond: 2, // ~2 floors per second
  },
  service: {
    type: 'service' as ElevatorType,
    baseCost: 100000,
    extensionCostPerFloor: 50000,
    maxFloors: 30,
    maxCars: 8,
    maintenancePerQuarter: 10000,
    capacity: 21,
    speedFloorsPerSecond: 1,
  },
} as const;

/**
 * Elevator system limits
 */
export const ELEVATOR_LIMITS = {
  /** Maximum total elevator shafts (all types combined) */
  MAX_SHAFTS: 24,
  /** Maximum cars per shaft */
  MAX_CARS_PER_SHAFT: 8,
  /** Maximum passengers per car */
  MAX_PASSENGERS_PER_CAR: 21,
  /** Sky lobbies at every 15 floors */
  SKY_LOBBY_INTERVAL: 15,
} as const;

/**
 * Stairs interface
 */
export interface IStairs extends ITransport {
  readonly type: 'stairs';
  position: { tile: number; floor: number };

  /** Connects to floor above */
  connectsUp: boolean;
  /** Connects to floor below */
  connectsDown: boolean;

  /** Maximum floors people will walk via stairs: 4 */
  readonly maxFlightComfort: 4;
}

/**
 * Escalator interface
 */
export interface IEscalator extends ITransport {
  readonly type: 'escalator';
  position: { tile: number; floor: number };

  /** Direction of escalator */
  direction: 'up' | 'down';

  /** Maximum floors people will ride escalator: 7 */
  readonly maxFlightComfort: 7;
}

/**
 * Queue ticket for elevator waiting
 * From Architect review
 */
export interface QueueTicket {
  readonly id: string;
  readonly personId: string;
  readonly shaftId: string;
  readonly floor: number;
  readonly direction: 'up' | 'down';
  readonly position: number;
  readonly estimatedWait: number;
  readonly startTick: number;
}

/**
 * Elevator scheduler message protocol
 * For Web Worker communication
 */
export type ToElevatorWorker =
  | { type: 'TICK'; tick: number; deltaTime: number }
  | { type: 'PERSON_REQUEST'; personId: string; floor: number; dest: number; direction: 'up' | 'down' }
  | { type: 'SHAFT_UPDATE'; shaftId: string; action: 'ADD_CAR' | 'REMOVE_CAR' | 'EXTEND' }
  | { type: 'STATE_SYNC'; shafts: IElevatorShaft[]; cars: IElevatorCar[] };

export type FromElevatorWorker =
  | { type: 'TICK_RESULT'; carStates: CarStateUpdate[] }
  | { type: 'ASSIGNMENT'; personId: string; carId: string; waitTicks: number }
  | { type: 'BOARDING'; carId: string; personIds: string[] }
  | { type: 'ARRIVAL'; carId: string; floor: number; exitingIds: string[] }
  | { type: 'ERROR'; message: string };

export interface CarStateUpdate {
  carId: string;
  currentFloor: number;
  floorProgress: number;
  direction: ElevatorDirection;
  state: ElevatorCarState;
  doorState: DoorState;
  passengerIds: string[];
  destinationFloors: number[];
}

/**
 * Transport data for serialization
 */
export interface ElevatorShaftData {
  id: string;
  elevatorType: ElevatorType;
  position: { tile: number; topFloor: number; bottomFloor: number };
  carIds: string[];
  targetSkyLobby: number | null;
  queuesByFloor: Record<number, { up: string[]; down: string[] }>;
}

export interface ElevatorCarData {
  id: string;
  shaftId: string;
  currentFloor: number;
  direction: ElevatorDirection;
  passengerIds: string[];
  destinationFloors: number[];
  state: ElevatorCarState;
  doorState: DoorState;
}
