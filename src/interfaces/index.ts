/**
 * OpenTower Interfaces - Contracts Layer
 *
 * All shared interfaces are defined here to prevent circular dependencies.
 * Agents import from this central location, not from individual modules.
 *
 * @module interfaces
 */

// Tower and floor structures
export type {
  ITower,
  IFloor,
  ITowerContext,
  Position,
  Bounds,
  StarRating,
  SerializedTower,
} from './tower';

// Type aliases for convenience (match common naming patterns)
export type { ITower as Tower, IFloor as Floor } from './tower';

// Building types and configurations
export type {
  IBuilding,
  BuildingType,
  BuildingState,
  BuildingConfig,
  BuildingCounts,
  BuildingData,
  BuildingRecord,
  QuarterlyReport,
} from './buildings';
export { BUILDING_CONFIGS } from './buildings';

// Type alias for convenience (use BuildingRecord for plain data objects)
export type { BuildingRecord as Building } from './buildings';

// Clock and time
export type {
  GameClock,
  GameSpeed,
  TimePeriod,
  QuarterlyTick,
  TrafficPattern,
} from './clock';
export { TIMING } from './clock';

// Entities (people)
export type {
  IPerson,
  ITransportable,
  PersonType,
  PersonState,
  StressLevel,
  PathNode,
  Route,
  RouteSegment,
  DailySchedule,
  ScheduleEvent,
  PopulationSoA,
  PersonData,
} from './entities';
export { STRESS_THRESHOLDS, STRESS_COLORS, STRESS_SOURCES, STRESS_DECAY_RATE } from './entities';

// Transport (elevators, stairs, escalators)
export type {
  ITransport,
  IElevatorShaft,
  IElevatorCar,
  IStairs,
  IEscalator,
  ElevatorType,
  ElevatorDirection,
  DoorState,
  ElevatorCarState,
  AccessPoint,
  QueueTicket,
  ToElevatorWorker,
  FromElevatorWorker,
  CarStateUpdate,
  ElevatorShaftData,
  ElevatorCarData,
} from './transport';
export { ELEVATOR_CONFIGS, ELEVATOR_LIMITS } from './transport';

// Type aliases for convenience
export type {
  IElevatorShaft as ElevatorShaft,
  IStairs as Stairs,
  IEscalator as Escalator,
} from './transport';

// Events
export type {
  GameEvent,
  GameEventType,
  GameEventState,
  SimulationEvent,
  BuildingEvent,
  PersonEvent,
  TransportEvent,
  EconomicEvent,
  ProgressionEvent,
  GameEventEvent,
  UIEvent,
  AppEvent,
  Subscription,
  IEventBus,
  QuarterlySnapshot,
  RandomEventConfig,
} from './events';
export { GamePhase, RANDOM_EVENT_CONFIGS } from './events';

// Rendering
export type {
  IRenderable,
  IBuildingRenderable,
  IPersonRenderable,
  ITransportRenderable,
  AnimationState,
  OccupancyDisplay,
  ViewBounds,
  CameraHint,
  VisibleEntities,
  ISimulationView,
  IRenderer,
  SpriteSheetConfig,
} from './rendering';
export {
  SPRITE_DIMENSIONS,
  TOWER_DIMENSIONS,
  DAY_NIGHT_COLORS,
  Z_LAYERS,
} from './rendering';
