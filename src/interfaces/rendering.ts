/**
 * Rendering interfaces
 * @module interfaces/rendering
 */

import type { Position } from './tower';
import type { BuildingType, BuildingState } from './buildings';
import type { PersonType } from './entities';

/**
 * Base renderable interface
 */
export interface IRenderable {
  readonly id: string;
  readonly position: Position;
  readonly zIndex: number;

  getSpriteKey(): string;
  getAnimationState(): AnimationState;
  getTint(): number;
  getOpacity(): number;
}

/**
 * Building renderable interface
 */
export interface IBuildingRenderable extends IRenderable {
  readonly buildingType: BuildingType;
  readonly width: number;
  readonly height: number;
  readonly state: BuildingState;

  getOccupancyIndicator(): OccupancyDisplay | null;
}

/**
 * Person renderable interface
 */
export interface IPersonRenderable extends IRenderable {
  readonly personType: PersonType;
  readonly direction: 'left' | 'right';
  readonly stress: number;

  getWalkFrame(): number;
}

/**
 * Transport renderable interface
 */
export interface ITransportRenderable extends IRenderable {
  readonly transportType: 'elevator' | 'stairs' | 'escalator';
}

/**
 * Animation state
 */
export interface AnimationState {
  name: string;
  frame: number;
  playing: boolean;
  loop: boolean;
}

/**
 * Occupancy display for buildings
 */
export interface OccupancyDisplay {
  current: number;
  max: number;
  showBar: boolean;
}

/**
 * Camera bounds
 */
export interface ViewBounds {
  minFloor: number;
  maxFloor: number;
  minTile: number;
  maxTile: number;
}

/**
 * Camera hint for auto-pan
 */
export interface CameraHint {
  targetPosition: Position;
  zoom?: number;
  duration?: number;
  reason: string;
}

/**
 * Visible entities in viewport
 */
export interface VisibleEntities {
  buildings: IBuildingRenderable[];
  people: IPersonRenderable[];
  transports: ITransportRenderable[];
  effects: IRenderable[];
}

/**
 * Simulation view interface (exposed to renderer)
 */
export interface ISimulationView {
  getVisibleEntities(bounds: ViewBounds): VisibleEntities;
  getEntityById(id: string): IRenderable | null;

  readonly gameTime: { hour: number; minute: number; day: number };
  readonly funds: number;
  readonly population: number;
  readonly starRating: number;
}

/**
 * Renderer interface (exposed to simulation)
 */
export interface IRenderer {
  panTo(position: Position, duration?: number): void;
  zoomTo(level: number, duration?: number): void;
  shake(intensity: number, duration: number): void;

  showTooltip(position: Position, content: string): void;
  hideTooltip(): void;
  showNotification(message: string, type: 'info' | 'warning' | 'error'): void;

  setSelection(entityId: string | null): void;
  setHighlight(entityIds: string[]): void;
}

/**
 * Sprite dimensions for HD remaster (2x original)
 * Original: 8×24 pixels per tile
 * HD: 16×48 pixels per tile
 */
export const SPRITE_DIMENSIONS = {
  /** Tile width in pixels */
  TILE_WIDTH: 16,
  /** Tile height (one floor) in pixels */
  TILE_HEIGHT: 48,
  /** Original tile width */
  ORIGINAL_TILE_WIDTH: 8,
  /** Original tile height */
  ORIGINAL_TILE_HEIGHT: 24,
  /** Scale factor */
  SCALE_FACTOR: 2,
} as const;

/**
 * Tower dimensions
 */
export const TOWER_DIMENSIONS = {
  /** Maximum width in tiles */
  MAX_WIDTH: 375,
  /** Maximum floors above ground */
  MAX_FLOORS_ABOVE: 100,
  /** Maximum basement floors */
  MAX_BASEMENT_FLOORS: 10,
  /** Total floor range */
  FLOOR_MIN: -10,
  FLOOR_MAX: 100,
} as const;

/**
 * Sprite sheet configuration
 */
export interface SpriteSheetConfig {
  path: string;
  frameWidth: number;
  frameHeight: number;
  frames: number;
  animations: Record<string, { start: number; end: number; loop: boolean }>;
}

/**
 * Day/night cycle configuration
 * From UX Expert review
 */
export const DAY_NIGHT_COLORS = {
  DAWN: { start: 5, end: 7, skyColor: 0xffa07a }, // Orange/pink
  DAY: { start: 7, end: 17, skyColor: 0x87ceeb }, // Blue
  DUSK: { start: 17, end: 19, skyColor: 0xda70d6 }, // Orange/purple
  NIGHT: { start: 19, end: 5, skyColor: 0x191970 }, // Dark blue
} as const;

/**
 * Z-index layers
 */
export const Z_LAYERS = {
  BACKGROUND: 0,
  UNDERGROUND: 100,
  GROUND: 200,
  BUILDINGS: 300,
  PEOPLE: 400,
  ELEVATORS: 500,
  EFFECTS: 600,
  UI_OVERLAY: 700,
  TOOLTIPS: 800,
  MODALS: 900,
} as const;
