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

// Building types and configurations
export type {
  IBuilding,
  BuildingType,
  BuildingState,
  BuildingConfig,
  BuildingCounts,
  BuildingData,
  QuarterlyReport,
} from './buildings';
export { BUILDING_CONFIGS } from './buildings';

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
