/**
 * TowerRenderer - Main viewport rendering
 *
 * Handles rendering the tower grid, buildings, and people.
 * Uses frustum culling for performance with large towers.
 *
 * @module rendering/TowerRenderer
 */

import * as PIXI from 'pixi.js';
import type { Tower, Building } from '@/interfaces';
import { Camera } from './Camera';
import { getEventBus } from '@core/EventBus';

/**
 * Rendering constants (HD at 2x original resolution)
 */
export const RENDER_CONSTANTS = {
  /** Width of one tile segment in pixels */
  TILE_WIDTH: 16,
  /** Height of one floor in pixels */
  FLOOR_HEIGHT: 48,
  /** Total tower width in tiles */
  TOWER_WIDTH_TILES: 375,
  /** Maximum floors above ground */
  MAX_FLOORS_ABOVE: 100,
  /** Maximum basement floors */
  MAX_FLOORS_BELOW: 10,
  /** Sky color */
  SKY_COLOR: 0x87ceeb,
  /** Ground color */
  GROUND_COLOR: 0x8b7355,
  /** Grid line color */
  GRID_COLOR: 0xcccccc,
  /** Grid line alpha */
  GRID_ALPHA: 0.3,
} as const;

/**
 * TowerRenderer class - handles all visual rendering
 */
export class TowerRenderer {
  private app: PIXI.Application;
  private camera: Camera;

  // Main containers (layered rendering)
  private worldContainer: PIXI.Container;
  private skyLayer: PIXI.Container;
  private backgroundLayer: PIXI.Container;
  private buildingLayer: PIXI.Container;
  private peopleLayer: PIXI.Container;
  private effectsLayer: PIXI.Container;
  private uiLayer: PIXI.Container;

  // Grid graphics
  private gridGraphics: PIXI.Graphics;
  private groundGraphics: PIXI.Graphics;

  // Building sprite cache
  private buildingSprites: Map<string, PIXI.Container> = new Map();

  // Debug mode
  private debugMode: boolean = false;
  private debugText: PIXI.Text | null = null;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.camera = new Camera();
    this.camera.setViewport(app.screen.width, app.screen.height);

    // Create layer hierarchy
    this.worldContainer = new PIXI.Container();
    this.skyLayer = new PIXI.Container();
    this.backgroundLayer = new PIXI.Container();
    this.buildingLayer = new PIXI.Container();
    this.peopleLayer = new PIXI.Container();
    this.effectsLayer = new PIXI.Container();
    this.uiLayer = new PIXI.Container();

    // Add layers in order
    this.worldContainer.addChild(this.skyLayer);
    this.worldContainer.addChild(this.backgroundLayer);
    this.worldContainer.addChild(this.buildingLayer);
    this.worldContainer.addChild(this.peopleLayer);
    this.worldContainer.addChild(this.effectsLayer);

    // UI layer is separate (not affected by camera)
    this.app.stage.addChild(this.worldContainer);
    this.app.stage.addChild(this.uiLayer);

    // Create grid graphics
    this.gridGraphics = new PIXI.Graphics();
    this.backgroundLayer.addChild(this.gridGraphics);

    // Create ground graphics
    this.groundGraphics = new PIXI.Graphics();
    this.backgroundLayer.addChild(this.groundGraphics);

    // Initialize sky
    this.drawSky();

    // Setup event listeners
    this.setupEventListeners();

    // Initial camera position (center on ground floor)
    this.camera.centerOnFloor(1, RENDER_CONSTANTS.TILE_WIDTH, RENDER_CONSTANTS.FLOOR_HEIGHT);
  }

  /**
   * Get the camera instance
   */
  getCamera(): Camera {
    return this.camera;
  }

  /**
   * Setup input event listeners
   */
  private setupEventListeners(): void {
    const canvas = this.app.canvas;

    // Mouse wheel for zoom
    canvas.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -1 : 1;
      this.camera.zoomBy(delta, e.offsetX, e.offsetY);
    });

    // Mouse drag for panning
    canvas.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button === 0 || e.button === 1) {
        // Left or middle click
        this.camera.startDrag(e.offsetX, e.offsetY);
      }
    });

    canvas.addEventListener('mousemove', (e: MouseEvent) => {
      if (this.camera.isDragging()) {
        this.camera.updateDrag(e.offsetX, e.offsetY);
      }
    });

    canvas.addEventListener('mouseup', () => {
      this.camera.endDrag();
    });

    canvas.addEventListener('mouseleave', () => {
      this.camera.endDrag();
    });

    // Handle resize
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // Listen for camera changes
    getEventBus().on('CAMERA_CHANGE', () => {
      this.updateCameraTransform();
    });
  }

  /**
   * Handle window resize
   */
  private handleResize(): void {
    this.camera.setViewport(this.app.screen.width, this.app.screen.height);
    this.drawSky();
  }

  /**
   * Update world container transform based on camera
   */
  private updateCameraTransform(): void {
    const transform = this.camera.getTransform();
    this.worldContainer.x = transform.x;
    this.worldContainer.y = transform.y;
    this.worldContainer.scale.set(transform.scale);
  }

  /**
   * Draw sky background
   */
  private drawSky(): void {
    // Remove existing sky
    this.skyLayer.removeChildren();

    // Create sky gradient (or solid color for now)
    const sky = new PIXI.Graphics();

    // Draw a large sky rectangle
    sky.rect(
      -10000,
      -RENDER_CONSTANTS.MAX_FLOORS_ABOVE * RENDER_CONSTANTS.FLOOR_HEIGHT - 1000,
      RENDER_CONSTANTS.TOWER_WIDTH_TILES * RENDER_CONSTANTS.TILE_WIDTH + 20000,
      (RENDER_CONSTANTS.MAX_FLOORS_ABOVE + RENDER_CONSTANTS.MAX_FLOORS_BELOW) * RENDER_CONSTANTS.FLOOR_HEIGHT + 2000
    );
    sky.fill(RENDER_CONSTANTS.SKY_COLOR);

    this.skyLayer.addChild(sky);
  }

  /**
   * Draw the tower grid
   */
  drawGrid(tower: Tower): void {
    this.gridGraphics.clear();

    const bounds = this.camera.getVisibleBounds();

    // Calculate visible floor range
    const minFloor = Math.floor(bounds.minY / RENDER_CONSTANTS.FLOOR_HEIGHT) - 1;
    const maxFloor = Math.ceil(bounds.maxY / RENDER_CONSTANTS.FLOOR_HEIGHT) + 1;

    // Calculate visible tile range
    const minTile = Math.floor(bounds.minX / RENDER_CONSTANTS.TILE_WIDTH) - 1;
    const maxTile = Math.ceil(bounds.maxX / RENDER_CONSTANTS.TILE_WIDTH) + 1;

    // Clamp to valid ranges
    const startFloor = Math.max(-RENDER_CONSTANTS.MAX_FLOORS_BELOW, minFloor);
    const endFloor = Math.min(RENDER_CONSTANTS.MAX_FLOORS_ABOVE, maxFloor);
    const startTile = Math.max(0, minTile);
    const endTile = Math.min(RENDER_CONSTANTS.TOWER_WIDTH_TILES - 1, maxTile);

    // Draw horizontal floor lines
    this.gridGraphics.setStrokeStyle({
      width: 1,
      color: RENDER_CONSTANTS.GRID_COLOR,
      alpha: RENDER_CONSTANTS.GRID_ALPHA,
    });

    for (let floor = startFloor; floor <= endFloor; floor++) {
      const y = floor * RENDER_CONSTANTS.FLOOR_HEIGHT;
      this.gridGraphics.moveTo(startTile * RENDER_CONSTANTS.TILE_WIDTH, y);
      this.gridGraphics.lineTo((endTile + 1) * RENDER_CONSTANTS.TILE_WIDTH, y);
    }

    // Draw vertical tile lines (only for occupied floors)
    const floorRange = Object.keys(tower.floorsById).map(Number);
    for (const level of floorRange) {
      if (level < startFloor || level > endFloor) continue;

      const y = level * RENDER_CONSTANTS.FLOOR_HEIGHT;
      for (let tile = startTile; tile <= endTile; tile++) {
        const x = tile * RENDER_CONSTANTS.TILE_WIDTH;
        this.gridGraphics.moveTo(x, y);
        this.gridGraphics.lineTo(x, y + RENDER_CONSTANTS.FLOOR_HEIGHT);
      }
    }

    this.gridGraphics.stroke();

    // Draw ground level
    this.drawGround();
  }

  /**
   * Draw ground level
   */
  private drawGround(): void {
    this.groundGraphics.clear();

    // Ground is at y = 0 (floor 1 starts at y = FLOOR_HEIGHT)
    this.groundGraphics.rect(
      -1000,
      0,
      RENDER_CONSTANTS.TOWER_WIDTH_TILES * RENDER_CONSTANTS.TILE_WIDTH + 2000,
      RENDER_CONSTANTS.MAX_FLOORS_BELOW * RENDER_CONSTANTS.FLOOR_HEIGHT + 1000
    );
    this.groundGraphics.fill(RENDER_CONSTANTS.GROUND_COLOR);
  }

  /**
   * Render a single building
   */
  renderBuilding(building: Building): PIXI.Container {
    // Check if we already have a sprite for this building
    let container = this.buildingSprites.get(building.id);

    if (!container) {
      container = new PIXI.Container();

      // Calculate position
      const x = building.position.startTile * RENDER_CONSTANTS.TILE_WIDTH;
      const y = building.position.floor * RENDER_CONSTANTS.FLOOR_HEIGHT;

      container.x = x;
      container.y = y;

      // For now, draw a colored rectangle (placeholder until sprites are loaded)
      const graphics = new PIXI.Graphics();
      const width = (building.position.endTile - building.position.startTile + 1) * RENDER_CONSTANTS.TILE_WIDTH;
      const height = building.height * RENDER_CONSTANTS.FLOOR_HEIGHT;

      // Building color based on type
      const color = this.getBuildingColor(building.type);
      graphics.rect(0, 0, width, height);
      graphics.fill(color);
      graphics.setStrokeStyle({ width: 1, color: 0x333333 });
      graphics.stroke();

      container.addChild(graphics);

      // Add label
      const label = new PIXI.Text({
        text: building.type.substring(0, 3).toUpperCase(),
        style: {
          fontSize: 10,
          fill: 0xffffff,
        },
      });
      label.x = 2;
      label.y = 2;
      container.addChild(label);

      // Store in cache
      this.buildingSprites.set(building.id, container);
      this.buildingLayer.addChild(container);
    }

    return container;
  }

  /**
   * Get color for building type (placeholder until sprites)
   */
  private getBuildingColor(type: Building['type']): number {
    const colors: Record<string, number> = {
      lobby: 0xf5f5dc,
      office: 0x4169e1,
      condo: 0x228b22,
      fastFood: 0xff6347,
      restaurant: 0xffa500,
      shop: 0xff69b4,
      hotelSingle: 0x9370db,
      hotelTwin: 0x8a2be2,
      hotelSuite: 0x4b0082,
      partyHall: 0xffd700,
      cinema: 0x8b0000,
      stairs: 0x808080,
      escalator: 0xa0a0a0,
      parkingRamp: 0x696969,
      parkingSpace: 0x778899,
      housekeeping: 0x20b2aa,
      security: 0x000080,
      medical: 0xff0000,
      recycling: 0x006400,
      metro: 0x2f4f4f,
      cathedral: 0xdaa520,
    };

    return colors[type] ?? 0xcccccc;
  }

  /**
   * Remove a building sprite
   */
  removeBuilding(buildingId: string): void {
    const container = this.buildingSprites.get(buildingId);
    if (container) {
      this.buildingLayer.removeChild(container);
      container.destroy();
      this.buildingSprites.delete(buildingId);
    }
  }

  /**
   * Render all buildings in the tower
   */
  renderAllBuildings(tower: Tower): void {
    // Clear existing sprites
    for (const [id] of this.buildingSprites) {
      if (!tower.buildingsById[id]) {
        this.removeBuilding(id);
      }
    }

    // Frustum culling - only render visible buildings
    const buildings = Object.values(tower.buildingsById) as Building[];

    for (const building of buildings) {
      const x = building.position.startTile * RENDER_CONSTANTS.TILE_WIDTH;
      const y = building.position.floor * RENDER_CONSTANTS.FLOOR_HEIGHT;
      const width = (building.position.endTile - building.position.startTile + 1) * RENDER_CONSTANTS.TILE_WIDTH;
      const height = building.height * RENDER_CONSTANTS.FLOOR_HEIGHT;

      if (this.camera.isVisible(x, y, width, height)) {
        this.renderBuilding(building);
      } else {
        // Remove if not visible (save memory)
        this.removeBuilding(building.id);
      }
    }
  }

  /**
   * Main render function - call each frame
   */
  render(tower: Tower, _deltaTime: number): void {
    // Update camera
    this.updateCameraTransform();

    // Draw grid
    this.drawGrid(tower);

    // Render buildings
    this.renderAllBuildings(tower);

    // Update debug info if enabled
    if (this.debugMode) {
      this.updateDebugInfo(tower);
    }
  }

  /**
   * Toggle debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;

    if (enabled && !this.debugText) {
      this.debugText = new PIXI.Text({
        text: '',
        style: {
          fontSize: 12,
          fill: 0x000000,
        },
      });
      this.debugText.x = 10;
      this.debugText.y = 10;
      this.uiLayer.addChild(this.debugText);
    } else if (!enabled && this.debugText) {
      this.uiLayer.removeChild(this.debugText);
      this.debugText.destroy();
      this.debugText = null;
    }
  }

  /**
   * Update debug info display
   */
  private updateDebugInfo(tower: Tower): void {
    if (!this.debugText) return;

    const camera = this.camera.getState();
    const bounds = this.camera.getVisibleBounds();

    this.debugText.text = [
      `Camera: (${camera.x.toFixed(0)}, ${camera.y.toFixed(0)}) zoom: ${camera.zoom.toFixed(2)}`,
      `Visible: (${bounds.minX.toFixed(0)}, ${bounds.minY.toFixed(0)}) to (${bounds.maxX.toFixed(0)}, ${bounds.maxY.toFixed(0)})`,
      `Buildings: ${Object.keys(tower.buildingsById).length}`,
      `Rendered: ${this.buildingSprites.size}`,
      `Population: ${tower.population}`,
      `Funds: $${tower.funds.toLocaleString()}`,
    ].join('\n');
  }

  /**
   * Convert screen position to tile coordinates
   */
  screenToTile(screenX: number, screenY: number): { floor: number; tile: number } {
    const world = this.camera.screenToWorld(screenX, screenY);
    return {
      floor: Math.floor(world.y / RENDER_CONSTANTS.FLOOR_HEIGHT),
      tile: Math.floor(world.x / RENDER_CONSTANTS.TILE_WIDTH),
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    // Clear all sprites
    for (const container of this.buildingSprites.values()) {
      container.destroy();
    }
    this.buildingSprites.clear();

    // Destroy graphics
    this.gridGraphics.destroy();
    this.groundGraphics.destroy();

    // Destroy containers
    this.worldContainer.destroy();
    this.uiLayer.destroy();
  }
}
