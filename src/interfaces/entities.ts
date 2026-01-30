/**
 * Person and entity interfaces
 * @module interfaces/entities
 */

/**
 * Person types in the tower
 */
export type PersonType = 'resident' | 'worker' | 'guest' | 'visitor' | 'staff';

/**
 * Person activity states
 */
export type PersonState =
  | 'idle'
  | 'walking'
  | 'waitingForElevator'
  | 'ridingElevator'
  | 'ridingEscalator'
  | 'usingStairs'
  | 'atDestination'
  | 'leaving'
  | 'evacuating';

/**
 * Stress levels and their visual representations
 * VERIFIED from original SimTower:
 * - Original uses STRESS (not satisfaction) with 3 colors
 * - Black (normal): stress 0-50
 * - Pink (stressed): stress 51-80
 * - Red (leaving): stress 81-100
 */
export type StressLevel = 'normal' | 'stressed' | 'critical';

export const STRESS_THRESHOLDS = {
  NORMAL_MAX: 50,
  STRESSED_MAX: 80,
  CRITICAL_MAX: 100,
} as const;

export const STRESS_COLORS = {
  NORMAL: 0x1c1c1c, // Black (normal)
  STRESSED: 0xff69b4, // Pink
  CRITICAL: 0xdc143c, // Red (leaving)
} as const;

/**
 * ALL stress sources from original SimTower
 * VERIFIED from expert review
 */
export const STRESS_SOURCES = {
  /** Per minute of waiting > 2 minutes */
  ELEVATOR_WAIT: 5,
  /** Per trip with long commute */
  LONG_COMMUTE: 2,
  /** Per exposure to noise source */
  NOISE_EXPOSURE: 3,
  /** Immediate when hotel room is dirty */
  DIRTY_HOTEL_ROOM: 10,
  /** Per quarter in overcrowded office */
  OFFICE_OVERCROWDING: 2,
  /** When office worker cannot reach restaurant in time */
  FAILED_LUNCH: 5,
  /** When path is completely blocked */
  BLOCKED_PATH: 8,
  /** When visitor cannot find parking (visitor leaves) */
  NO_PARKING: 10,
  /** Tower-wide during fire/bomb events */
  EVENT_DISRUPTION: 15,
  /** Walking up 4+ floors via stairs */
  STAIR_FATIGUE: 3,
  /** Per 50 tiles of horizontal walking */
  LONG_WALK: 1,
  /** Guest arrives but room not cleaned */
  HOTEL_ROOM_NOT_READY: 8,
} as const;

/**
 * Stress decay: +1 satisfaction per game-minute when AT destination
 * NO decay while traveling or waiting
 */
export const STRESS_DECAY_RATE = 1; // Per game minute at destination

/**
 * Person interface
 */
export interface IPerson {
  readonly id: string;
  readonly type: PersonType;

  /** Current stress level 0-100 */
  stress: number;

  /** Building ID of home (condo, hotel room, etc.) */
  homeBuildingId: string | null;

  /** Current destination building ID */
  destinationBuildingId: string | null;

  /** Current position */
  currentFloor: number;
  currentTile: number;

  /** Current activity state */
  state: PersonState;

  /** When person started waiting for elevator (for stress calculation) */
  waitStartTick: number | null;

  /** Has this person already transferred elevators? (max 1 transfer rule) */
  hasTransferred: boolean;

  /** Current elevator car ID if riding */
  currentElevatorId: string | null;

  /** Current path to destination */
  currentPath: PathNode[];
  pathIndex: number;

  /** Daily schedule */
  schedule: DailySchedule;

  /** Visual direction */
  direction: 'left' | 'right';
}

/**
 * Path node for navigation
 */
export interface PathNode {
  floor: number;
  tile: number;
  action: 'walk' | 'elevator' | 'stairs' | 'escalator' | 'enter' | 'exit';
  targetId?: string; // Transport or building ID
}

/**
 * Route structure with transfer tracking
 * From Architect review: needed for transfer-once rule
 */
export interface Route {
  segments: RouteSegment[];
  currentSegmentIndex: number;
  totalEstimatedTime: number;
  transferCount: number; // Must be <= 1
}

export type RouteSegment =
  | { type: 'walk'; fromTile: number; toTile: number; floor: number }
  | { type: 'stairs'; fromFloor: number; toFloor: number; tileX: number }
  | { type: 'escalator'; fromFloor: number; toFloor: number; tileX: number }
  | { type: 'elevator'; shaftId: string; fromFloor: number; toFloor: number }
  | { type: 'transfer'; lobbyFloor: number }; // Sky lobby wait

/**
 * Daily schedule for a person
 */
export interface DailySchedule {
  personType: PersonType;
  events: ScheduleEvent[];
}

export interface ScheduleEvent {
  hour: number;
  minute: number;
  action: 'leave' | 'arrive' | 'lunch' | 'return' | 'entertainment';
  targetBuildingId?: string;
  weekdayOnly?: boolean;
  weekendOnly?: boolean;
}

/**
 * Struct of Arrays for performance-critical population simulation
 * Based on Scalability Architect review
 * ~75KB for 15,000 people (hot data)
 */
export interface PopulationSoA {
  /** Current floor for each person */
  floors: Int8Array; // 15,000 × 1 byte = 15KB

  /** Current tile for each person */
  tiles: Uint16Array; // 15,000 × 2 bytes = 30KB

  /** Stress level for each person */
  stress: Uint8Array; // 15,000 × 1 byte = 15KB

  /** State enum for each person */
  state: Uint8Array; // 15,000 × 1 byte = 15KB
}

/**
 * Person data for serialization
 */
export interface PersonData {
  id: string;
  type: PersonType;
  stress: number;
  homeBuildingId: string | null;
  destinationBuildingId: string | null;
  currentFloor: number;
  currentTile: number;
  state: PersonState;
  hasTransferred: boolean;
  schedule: DailySchedule;
}

/**
 * Interface for transportable entities (people using elevators)
 * From Architect review
 */
export interface ITransportable {
  readonly id: string;
  readonly currentFloor: number;
  readonly destinationFloor: number;
  readonly stressLevel: number;

  onTransportArrived(transportId: string): void;
  onBoardingComplete(transportId: string): void;
  onArrived(floor: number): void;
  onTransportCancelled(reason: string): void;
}
