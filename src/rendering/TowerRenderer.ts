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
import { PeopleRenderer } from './PeopleRenderer';
import { ElevatorRenderer } from './ElevatorRenderer';
import type { Person } from '@/entities/Person';
import type { ElevatorShaft } from '@/entities/ElevatorShaft';
import type { TimeOfDayState } from '@simulation/TimeOfDaySystem';

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
  
  // Track if lights are currently on (to regenerate sprites when state changes)
  private lightsAreOn: boolean = false;
  
  // Renderers
  private peopleRenderer: PeopleRenderer;
  private elevatorRenderer: ElevatorRenderer;

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
    
    // Create renderers
    this.peopleRenderer = new PeopleRenderer(this.peopleLayer);
    this.elevatorRenderer = new ElevatorRenderer(this.buildingLayer); // Elevators on building layer

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
   * Get the world container for adding overlays
   */
  getWorldContainer(): PIXI.Container {
    return this.worldContainer;
  }

  /**
   * Get the PIXI application
   */
  getApp(): PIXI.Application {
    return this.app;
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
  private drawSky(timeOfDayState?: TimeOfDayState): void {
    // Remove existing sky
    this.skyLayer.removeChildren();

    // Create sky gradient
    const sky = new PIXI.Graphics();

    const skyWidth = RENDER_CONSTANTS.TOWER_WIDTH_TILES * RENDER_CONSTANTS.TILE_WIDTH + 20000;
    const skyHeight = (RENDER_CONSTANTS.MAX_FLOORS_ABOVE + RENDER_CONSTANTS.MAX_FLOORS_BELOW) * RENDER_CONSTANTS.FLOOR_HEIGHT + 2000;
    const skyX = -10000;
    const skyY = -RENDER_CONSTANTS.MAX_FLOORS_ABOVE * RENDER_CONSTANTS.FLOOR_HEIGHT - 1000;

    if (timeOfDayState) {
      // Draw gradient sky
      const gradient = timeOfDayState.skyGradient;
      
      // Create vertical gradient from top to bottom
      const topColor = gradient.topColor;
      const bottomColor = gradient.bottomColor;
      
      // PixiJS doesn't have built-in gradients for Graphics, so we'll use multiple rectangles
      const strips = 20;
      const stripHeight = skyHeight / strips;
      
      for (let i = 0; i < strips; i++) {
        const t = i / (strips - 1);
        const color = this.lerpColor(topColor, bottomColor, t);
        sky.rect(skyX, skyY + i * stripHeight, skyWidth, stripHeight);
        sky.fill(color);
      }
    } else {
      // Default sky (day)
      sky.rect(skyX, skyY, skyWidth, skyHeight);
      sky.fill(RENDER_CONSTANTS.SKY_COLOR);
    }

    this.skyLayer.addChild(sky);
  }

  /**
   * Linear interpolation between two colors
   */
  private lerpColor(color1: number, color2: number, t: number): number {
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;

    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;

    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);

    return (r << 16) | (g << 8) | b;
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
  renderBuilding(building: Building, showLights: boolean = false): PIXI.Container {
    // Check if we already have a sprite for this building
    let container = this.buildingSprites.get(building.id);

    if (!container) {
      container = new PIXI.Container();

      // Calculate position
      const x = building.position.startTile * RENDER_CONSTANTS.TILE_WIDTH;
      const y = building.position.floor * RENDER_CONSTANTS.FLOOR_HEIGHT;

      container.x = x;
      container.y = y;

      // Draw building with textures
      const graphics = new PIXI.Graphics();
      const width = (building.position.endTile - building.position.startTile + 1) * RENDER_CONSTANTS.TILE_WIDTH;
      const height = building.height * RENDER_CONSTANTS.FLOOR_HEIGHT;

      // Building color based on type
      const color = this.getBuildingColor(building.type);
      
      // Main building body
      graphics.rect(0, 0, width, height);
      graphics.fill(color);
      
      // Add building-specific details (windows, doors, etc.)
      this.addBuildingDetails(graphics, building, width, height, color, showLights);
      
      // Border
      graphics.setStrokeStyle({ width: 1, color: 0x333333 });
      graphics.rect(0, 0, width, height);
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
   * Add visual details to buildings (windows, doors, etc.)
   */
  private addBuildingDetails(
    graphics: PIXI.Graphics,
    building: Building,
    width: number,
    height: number,
    baseColor: number,
    showLights: boolean = false
  ): void {
    // Add windows for office buildings
    if (building.type === 'office') {
      this.addWindowPattern(graphics, width, height, baseColor, showLights);
    }
    
    // Add door for lobby/shops
    if (building.type === 'lobby' || building.type === 'shop' || 
        building.type === 'fastFood' || building.type === 'restaurant') {
      this.addDoorIndicator(graphics, width, height);
    }
    
    // Add window pattern for condos/hotels
    if (building.type === 'condo' || building.type.includes('hotel')) {
      this.addWindowPattern(graphics, width, height, baseColor, showLights);
    }
  }

  /**
   * Draw window pattern for buildings
   */
  private addWindowPattern(
    graphics: PIXI.Graphics,
    width: number,
    height: number,
    baseColor: number,
    showLights: boolean = false
  ): void {
    // Window colors - dark at day, lit at night
    const windowColor = showLights ? 0xFFD700 : this.darkenColor(baseColor, 0.3); // Yellow glow at night
    const lightColor = this.lightenColor(baseColor, 0.2);
    
    // Window size and spacing
    const windowWidth = 6;
    const windowHeight = 8;
    const windowSpacing = 10;
    const topMargin = 8;
    
    // Draw windows in a grid
    for (let x = windowSpacing / 2; x < width - windowWidth; x += windowSpacing) {
      for (let y = topMargin; y < height - windowHeight; y += windowHeight + 4) {
        // Window frame (light)
        graphics.rect(x, y, windowWidth, windowHeight);
        graphics.fill(lightColor);
        
        // Window glass (dark or lit)
        graphics.rect(x + 1, y + 1, windowWidth - 2, windowHeight - 2);
        if (showLights) {
          // Lit windows at night with glow
          graphics.fill({ color: windowColor, alpha: 0.9 });
        } else {
          // Dark windows during day
          graphics.fill(windowColor);
        }
      }
    }
  }

  /**
   * Add door indicator at bottom of building
   */
  private addDoorIndicator(graphics: PIXI.Graphics, width: number, height: number): void {
    const doorWidth = 12;
    const doorHeight = 16;
    const doorX = width / 2 - doorWidth / 2;
    const doorY = height - doorHeight - 2;
    
    // Door frame (darker)
    graphics.rect(doorX, doorY, doorWidth, doorHeight);
    graphics.fill({ color: 0x4A3020, alpha: 0.8 });
    
    // Door panel (lighter brown)
    graphics.rect(doorX + 2, doorY + 2, doorWidth - 4, doorHeight - 4);
    graphics.fill({ color: 0x8B6F47, alpha: 0.9 });
    
    // Door knob
    graphics.circle(doorX + doorWidth - 4, doorY + doorHeight / 2, 1.5);
    graphics.fill({ color: 0xFFD700, alpha: 1 });
  }

  /**
   * Darken a color by a factor (0-1)
   */
  private darkenColor(color: number, factor: number): number {
    const r = Math.floor(((color >> 16) & 0xFF) * (1 - factor));
    const g = Math.floor(((color >> 8) & 0xFF) * (1 - factor));
    const b = Math.floor((color & 0xFF) * (1 - factor));
    return (r << 16) | (g << 8) | b;
  }

  /**
   * Lighten a color by a factor (0-1)
   */
  private lightenColor(color: number, factor: number): number {
    const r = Math.min(255, Math.floor(((color >> 16) & 0xFF) * (1 + factor)));
    const g = Math.min(255, Math.floor(((color >> 8) & 0xFF) * (1 + factor)));
    const b = Math.min(255, Math.floor((color & 0xFF) * (1 + factor)));
    return (r << 16) | (g << 8) | b;
  }

  /**
   * Get color for building type (placeholder until sprites)
   */
  private getBuildingColor(type: Building['type']): number {
    const colors: Record<string, number> = {
      // Residential (warm earth tones)
      lobby: 0xE8DCC8,      // Beige
      condo: 0x8B7355,      // Brown
      
      // Commercial (cool blues)
      office: 0x5B7C99,     // Muted blue
      
      // Food (warm inviting)
      fastFood: 0xD97B5C,   // Terracotta
      restaurant: 0xC87137, // Burnt orange
      
      // Retail (purple/pink)
      shop: 0xA67C94,       // Mauve
      
      // Hotels (royal purples)
      hotelSingle: 0x7B68A6, // Muted purple
      hotelTwin: 0x6B4E8C,   // Deep purple
      hotelSuite: 0x4A3766,  // Rich purple
      
      // Entertainment (golden)
      partyHall: 0xD4AF37,  // Gold
      cinema: 0x8B4513,     // Saddle brown
      
      // Infrastructure (greys)
      stairs: 0x707070,     // Grey
      escalator: 0x909090,  // Light grey
      parkingRamp: 0x696969,
      parkingSpace: 0x778899,
      
      // Services (teals/greens)
      housekeeping: 0x5F9EA0, // Cadet blue
      security: 0x2F4F4F,     // Dark slate
      medical: 0xB22222,      // Firebrick
      recycling: 0x556B2F,    // Dark olive
      
      // Special
      metro: 0x36454F,        // Charcoal
      cathedral: 0xB8860B,    // Dark goldenrod
    };

    return colors[type] ?? 0x999999;
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
  renderAllBuildings(tower: Tower, timeOfDayState?: TimeOfDayState): void {
    // Check if lights state changed - if so, regenerate all sprites
    const showLights = timeOfDayState?.buildingsShowLights ?? false;
    if (showLights !== this.lightsAreOn) {
      // Lights state changed - clear all sprites to regenerate with new lighting
      for (const [id] of this.buildingSprites) {
        this.removeBuilding(id);
      }
      this.lightsAreOn = showLights;
    }

    // Clear existing sprites for removed buildings
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
        this.renderBuilding(building, showLights);
      } else {
        // Remove if not visible (save memory)
        this.removeBuilding(building.id);
      }
    }
  }

  /**
   * Main render function - call each frame
   */
  render(tower: Tower, _deltaTime: number, people?: Person[], elevatorShafts?: ElevatorShaft[], timeOfDayState?: TimeOfDayState): void {
    // Update sky gradient based on time of day
    if (timeOfDayState) {
      this.drawSky(timeOfDayState);
    }

    // Update camera
    this.updateCameraTransform();

    // Draw grid
    this.drawGrid(tower);

    // Render buildings (with lights if night)
    this.renderAllBuildings(tower, timeOfDayState);
    
    // Render elevators
    if (elevatorShafts) {
      this.elevatorRenderer.render(elevatorShafts);
    }
    
    // Render people (on top of elevators)
    if (people) {
      this.peopleRenderer.render(people);
    }

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
   * Find building at screen position
   */
  findBuildingAtPosition(screenX: number, screenY: number, tower: Tower): Building | null {
    const { floor, tile } = this.screenToTile(screenX, screenY);

    // Check if floor exists
    const floorData = tower.floorsById[floor];
    if (!floorData) return null;

    // Check tile occupancy
    if (tile < 0 || tile >= floorData.tileOccupancy.length) return null;
    
    // Find building at this tile
    for (const buildingId of floorData.buildingIds) {
      const building = tower.buildingsById[buildingId];
      if (!building) continue;

      // Check if position is within building bounds
      if (
        building.position.floor === floor &&
        tile >= building.position.startTile &&
        tile <= building.position.endTile
      ) {
        return building;
      }
    }

    return null;
  }

  /**
   * Find elevator at screen position
   */
  findElevatorAtPosition(screenX: number, screenY: number, elevatorShafts: ElevatorShaft[]): ElevatorShaft | null {
    const { floor, tile } = this.screenToTile(screenX, screenY);

    for (const shaft of elevatorShafts) {
      if (
        tile === shaft.tileX &&
        floor >= shaft.minFloor &&
        floor <= shaft.maxFloor
      ) {
        return shaft;
      }
    }

    return null;
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
    
    // Destroy renderers
    this.peopleRenderer.destroy();
    this.elevatorRenderer.destroy();

    // Destroy graphics
    this.gridGraphics.destroy();
    this.groundGraphics.destroy();

    // Destroy containers
    this.worldContainer.destroy();
    this.uiLayer.destroy();
  }
}
