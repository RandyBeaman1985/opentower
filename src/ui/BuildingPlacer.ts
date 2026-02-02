/**
 * BuildingPlacer - Handles building placement via mouse interaction
 * 
 * Shows ghost preview, validates placement, and places buildings on click.
 */

import * as PIXI from 'pixi.js';
import type { BuildingType, Building, Tower } from '@/interfaces';
import { RENDER_CONSTANTS } from '@/rendering/TowerRenderer';
import { getEventBus } from '@core/EventBus';
import type { PlaceableType } from './BuildingMenu';

/** Building placement constraints from SimTower */
const BUILDING_CONSTRAINTS: Record<BuildingType, {
  minFloor: number;
  maxFloor: number;
  width: number;
  height: number;
  cost: number;
}> = {
  lobby: { minFloor: 1, maxFloor: 1, width: 51, height: 1, cost: 400000 },
  office: { minFloor: 2, maxFloor: 100, width: 9, height: 1, cost: 40000 },
  condo: { minFloor: 2, maxFloor: 100, width: 16, height: 1, cost: 80000 },
  fastFood: { minFloor: 1, maxFloor: 14, width: 16, height: 1, cost: 100000 },
  restaurant: { minFloor: 2, maxFloor: 100, width: 24, height: 1, cost: 200000 },
  shop: { minFloor: 1, maxFloor: 3, width: 12, height: 1, cost: 150000 },
  hotelSingle: { minFloor: 2, maxFloor: 100, width: 10, height: 1, cost: 50000 },
  hotelTwin: { minFloor: 2, maxFloor: 100, width: 14, height: 1, cost: 90000 },
  hotelSuite: { minFloor: 2, maxFloor: 100, width: 20, height: 1, cost: 200000 },
  stairs: { minFloor: -10, maxFloor: 100, width: 4, height: 1, cost: 5000 },
  escalator: { minFloor: 1, maxFloor: 14, width: 4, height: 1, cost: 20000 },
  // Others - not implemented for MVP
  partyHall: { minFloor: 2, maxFloor: 100, width: 48, height: 1, cost: 500000 },
  cinema: { minFloor: 2, maxFloor: 100, width: 72, height: 3, cost: 500000 },
  parkingRamp: { minFloor: -10, maxFloor: 0, width: 57, height: 1, cost: 300000 },
  parkingSpace: { minFloor: -10, maxFloor: 0, width: 19, height: 1, cost: 100000 },
  housekeeping: { minFloor: 2, maxFloor: 100, width: 4, height: 1, cost: 50000 },
  security: { minFloor: 1, maxFloor: 100, width: 8, height: 1, cost: 100000 },
  medical: { minFloor: 1, maxFloor: 100, width: 16, height: 1, cost: 500000 },
  recycling: { minFloor: -10, maxFloor: 0, width: 24, height: 1, cost: 500000 },
  metro: { minFloor: -10, maxFloor: -1, width: 72, height: 1, cost: 1000000 },
  cathedral: { minFloor: 1, maxFloor: 1, width: 72, height: 3, cost: 2000000 },
};

/** Building colors for placeholder rendering (SimTower-inspired palette) */
const BUILDING_COLORS: Record<BuildingType, number> = {
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

export class BuildingPlacer {
  private enabled: boolean = false;
  private selectedType: PlaceableType = 'office';
  private ghostContainer: PIXI.Container;
  private ghostGraphics: PIXI.Graphics;
  private ghostValid: boolean = false;
  private ghostFloor: number = 0;
  private ghostTile: number = 0;
  private tower: Tower | null = null;
  private nextBuildingId: number = 100;
  private parentContainer: PIXI.Container;

  // Elevator placement state
  private elevatorDragStart: { tile: number; floor: number } | null = null;
  private elevatorDragEnd: { tile: number; floor: number } | null = null;
  
  // Callback for elevator placement (so index.ts can create the shaft)
  private onElevatorPlaced: ((tile: number, minFloor: number, maxFloor: number) => void) | null = null;

  // Demolish mode state
  private demolishMode: boolean = false;
  private hoveredBuilding: Building | null = null;

  constructor(worldContainer: PIXI.Container) {
    this.parentContainer = worldContainer;
    // Create ghost preview container
    this.ghostContainer = new PIXI.Container();
    this.ghostContainer.visible = false;
    this.ghostGraphics = new PIXI.Graphics();
    this.ghostContainer.addChild(this.ghostGraphics);
    
    // Add ghost to world
    this.parentContainer.addChild(this.ghostContainer);
  }

  /** Enable/disable placement mode */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.ghostContainer.visible = enabled;
    if (!enabled) {
      this.ghostGraphics.clear();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /** Select building type to place */
  selectBuildingType(type: PlaceableType): void {
    this.selectedType = type;
    // Reset elevator drag state when changing type
    this.elevatorDragStart = null;
    this.elevatorDragEnd = null;
    // Exit demolish mode when selecting a building type
    this.demolishMode = false;
    console.log(`Selected placeable type: ${type}`);
  }

  getSelectedType(): PlaceableType {
    return this.selectedType;
  }

  /** Enable/disable demolish mode */
  setDemolishMode(enabled: boolean): void {
    this.demolishMode = enabled;
    if (enabled) {
      this.enabled = true;
      console.log('Demolish mode enabled');
    } else {
      this.hoveredBuilding = null;
      console.log('Demolish mode disabled');
    }
  }

  isDemolishMode(): boolean {
    return this.demolishMode;
  }

  /** Set callback for elevator placement */
  setElevatorPlacedCallback(callback: (tile: number, minFloor: number, maxFloor: number) => void): void {
    this.onElevatorPlaced = callback;
  }

  /** Set tower reference for validation */
  setTower(tower: Tower): void {
    this.tower = tower;
  }

  /** Convert screen coordinates to world tile position */
  screenToTile(screenX: number, screenY: number, cameraX: number, cameraY: number, scale: number): { floor: number; tile: number } {
    // Convert screen to world coordinates
    const worldX = (screenX - cameraX) / scale;
    const worldY = (screenY - cameraY) / scale;

    // Convert to tile coordinates
    const tile = Math.floor(worldX / RENDER_CONSTANTS.TILE_WIDTH);
    const floor = Math.floor(worldY / RENDER_CONSTANTS.FLOOR_HEIGHT);

    return { floor, tile };
  }

  /** Find building at given tile/floor */
  private findBuildingAt(floor: number, tile: number): Building | null {
    if (!this.tower) return null;

    for (const building of Object.values(this.tower.buildingsById) as Building[]) {
      if (building.position.floor === floor &&
          tile >= building.position.startTile &&
          tile <= building.position.endTile) {
        return building;
      }
    }
    return null;
  }

  /** Update ghost preview position */
  updateGhost(screenX: number, screenY: number, cameraX: number, cameraY: number, scale: number, isDragging: boolean = false): void {
    if (!this.enabled) return;

    const { floor, tile } = this.screenToTile(screenX, screenY, cameraX, cameraY, scale);

    // Demolish mode - highlight building under cursor
    if (this.demolishMode) {
      this.hoveredBuilding = this.findBuildingAt(floor, tile);
      if (this.hoveredBuilding) {
        this.drawDemolishHighlight(this.hoveredBuilding);
      } else {
        this.ghostGraphics.clear();
        this.ghostContainer.visible = false;
      }
      return;
    }

    // Special handling for elevator placement
    if (this.selectedType === 'elevator') {
      if (isDragging && this.elevatorDragStart) {
        // Update drag end point
        this.elevatorDragEnd = { tile: this.elevatorDragStart.tile, floor };
        this.ghostValid = this.isValidElevatorPlacement(
          this.elevatorDragStart.tile,
          Math.min(this.elevatorDragStart.floor, floor),
          Math.max(this.elevatorDragStart.floor, floor)
        );
        this.drawElevatorGhost(
          this.elevatorDragStart.tile,
          Math.min(this.elevatorDragStart.floor, floor),
          Math.max(this.elevatorDragStart.floor, floor),
          this.ghostValid
        );
      } else {
        // Show single-tile preview at cursor position
        this.ghostFloor = floor;
        this.ghostTile = tile;
        this.ghostValid = true; // Always valid for initial placement
        this.drawGhost(tile, floor, 1, 1, true); // 1 tile wide
      }
      return;
    }

    // Regular building placement
    const constraints = BUILDING_CONSTRAINTS[this.selectedType as BuildingType];

    // Center the building on cursor
    const startTile = tile - Math.floor(constraints.width / 2);
    
    this.ghostFloor = floor;
    this.ghostTile = startTile;

    // Check validity
    this.ghostValid = this.isValidPlacement(this.selectedType as BuildingType, floor, startTile);

    // Draw ghost
    this.drawGhost(startTile, floor, constraints.width, constraints.height, this.ghostValid);
  }

  /** Start elevator drag placement */
  startElevatorDrag(screenX: number, screenY: number, cameraX: number, cameraY: number, scale: number): void {
    if (this.selectedType !== 'elevator') return;
    
    const { floor, tile } = this.screenToTile(screenX, screenY, cameraX, cameraY, scale);
    this.elevatorDragStart = { tile, floor };
    this.elevatorDragEnd = { tile, floor };
  }

  /** End elevator drag placement */
  endElevatorDrag(): boolean {
    if (this.selectedType !== 'elevator' || !this.elevatorDragStart || !this.elevatorDragEnd) {
      return false;
    }

    const minFloor = Math.min(this.elevatorDragStart.floor, this.elevatorDragEnd.floor);
    const maxFloor = Math.max(this.elevatorDragStart.floor, this.elevatorDragEnd.floor);
    const tile = this.elevatorDragStart.tile;

    // Validate placement
    if (!this.isValidElevatorPlacement(tile, minFloor, maxFloor)) {
      this.elevatorDragStart = null;
      this.elevatorDragEnd = null;
      return false;
    }

    // Calculate cost
    const cost = this.getElevatorCost(minFloor, maxFloor);
    if (!this.tower || this.tower.funds < cost) {
      this.elevatorDragStart = null;
      this.elevatorDragEnd = null;
      return false;
    }

    // Deduct cost
    this.tower.funds -= cost;

    // Call callback to create the elevator shaft
    if (this.onElevatorPlaced) {
      this.onElevatorPlaced(tile, minFloor, maxFloor);
    }

    // Reset state
    this.elevatorDragStart = null;
    this.elevatorDragEnd = null;

    console.log(`Placed elevator at tile ${tile}, floors ${minFloor}-${maxFloor} (cost: $${cost.toLocaleString()})`);
    return true;
  }

  /** Cancel elevator drag */
  cancelElevatorDrag(): void {
    this.elevatorDragStart = null;
    this.elevatorDragEnd = null;
  }

  /** Draw ghost preview */
  private drawGhost(startTile: number, floor: number, width: number, height: number, valid: boolean): void {
    this.ghostGraphics.clear();

    const x = startTile * RENDER_CONSTANTS.TILE_WIDTH;
    const y = floor * RENDER_CONSTANTS.FLOOR_HEIGHT;
    const pixelWidth = width * RENDER_CONSTANTS.TILE_WIDTH;
    const pixelHeight = height * RENDER_CONSTANTS.FLOOR_HEIGHT;

    // Draw ghost rectangle
    const color = valid ? (this.selectedType === 'elevator' ? 0x4a9eff : BUILDING_COLORS[this.selectedType as BuildingType]) : 0xff0000;
    const alpha = valid ? 0.5 : 0.3;

    this.ghostGraphics.rect(x, y, pixelWidth, pixelHeight);
    this.ghostGraphics.fill({ color, alpha });
    
    // Draw border
    this.ghostGraphics.setStrokeStyle({ 
      width: 2, 
      color: valid ? 0x00ff00 : 0xff0000,
      alpha: 0.8 
    });
    this.ghostGraphics.stroke();

    // Add label
    this.ghostContainer.visible = true;
  }

  /** Draw demolish highlight over building */
  private drawDemolishHighlight(building: Building): void {
    this.ghostGraphics.clear();

    const x = building.position.startTile * RENDER_CONSTANTS.TILE_WIDTH;
    const y = building.position.floor * RENDER_CONSTANTS.FLOOR_HEIGHT;
    const pixelWidth = building.width * RENDER_CONSTANTS.TILE_WIDTH;
    const pixelHeight = building.height * RENDER_CONSTANTS.FLOOR_HEIGHT;

    // Red overlay with pulsing effect
    this.ghostGraphics.rect(x, y, pixelWidth, pixelHeight);
    this.ghostGraphics.fill({ color: 0xff0000, alpha: 0.4 });
    
    // Bold red border
    this.ghostGraphics.setStrokeStyle({ 
      width: 3, 
      color: 0xff0000,
      alpha: 0.9 
    });
    this.ghostGraphics.stroke();

    // Draw X pattern for demolish
    this.ghostGraphics.setStrokeStyle({ 
      width: 2, 
      color: 0xff0000,
      alpha: 0.7 
    });
    this.ghostGraphics.moveTo(x, y);
    this.ghostGraphics.lineTo(x + pixelWidth, y + pixelHeight);
    this.ghostGraphics.moveTo(x + pixelWidth, y);
    this.ghostGraphics.lineTo(x, y + pixelHeight);
    this.ghostGraphics.stroke();

    this.ghostContainer.visible = true;
  }

  /** Draw elevator shaft ghost during drag */
  private drawElevatorGhost(tile: number, minFloor: number, maxFloor: number, valid: boolean): void {
    this.ghostGraphics.clear();

    const x = tile * RENDER_CONSTANTS.TILE_WIDTH;
    const yTop = minFloor * RENDER_CONSTANTS.FLOOR_HEIGHT;
    const pixelWidth = RENDER_CONSTANTS.TILE_WIDTH; // 1 tile wide
    const pixelHeight = (maxFloor - minFloor + 1) * RENDER_CONSTANTS.FLOOR_HEIGHT;

    // Draw shaft
    const color = valid ? 0x4a9eff : 0xff0000;
    const alpha = valid ? 0.6 : 0.3;

    this.ghostGraphics.rect(x, yTop, pixelWidth, pixelHeight);
    this.ghostGraphics.fill({ color, alpha });
    
    // Draw border
    this.ghostGraphics.setStrokeStyle({ 
      width: 3, 
      color: valid ? 0x00ff00 : 0xff0000,
      alpha: 0.9 
    });
    this.ghostGraphics.stroke();

    // Draw floor indicators
    for (let floor = minFloor; floor <= maxFloor; floor++) {
      const y = floor * RENDER_CONSTANTS.FLOOR_HEIGHT;
      this.ghostGraphics.setStrokeStyle({ width: 1, color: 0xffffff, alpha: 0.3 });
      this.ghostGraphics.moveTo(x, y);
      this.ghostGraphics.lineTo(x + pixelWidth, y);
      this.ghostGraphics.stroke();
    }

    // Calculate and show cost
    const cost = this.getElevatorCost(minFloor, maxFloor);
    const floorCount = maxFloor - minFloor + 1;
    
    // Add cost label (would need PIXI.Text, for now just visual)
    console.log(`Elevator preview: ${floorCount} floors, $${cost.toLocaleString()}`);

    this.ghostContainer.visible = true;
  }

  /** Check if placement is valid */
  isValidPlacement(type: BuildingType, floor: number, startTile: number): boolean {
    if (!this.tower) return false;

    const constraints = BUILDING_CONSTRAINTS[type];
    const endTile = startTile + constraints.width - 1;

    // Check floor constraints
    if (floor < constraints.minFloor || floor > constraints.maxFloor) {
      return false;
    }

    // Check tile bounds
    if (startTile < 0 || endTile >= RENDER_CONSTANTS.TOWER_WIDTH_TILES) {
      return false;
    }

    // Check cost
    if (this.tower.funds < constraints.cost) {
      return false;
    }

    // Check overlap with existing buildings
    for (const building of Object.values(this.tower.buildingsById) as Building[]) {
      if (building.position.floor !== floor) continue;
      
      // Check tile overlap
      if (!(endTile < building.position.startTile || startTile > building.position.endTile)) {
        return false;
      }
    }

    return true;
  }

  /** Check if elevator placement is valid */
  private isValidElevatorPlacement(tile: number, minFloor: number, maxFloor: number): boolean {
    if (!this.tower) return false;

    // Check tile bounds
    if (tile < 0 || tile >= RENDER_CONSTANTS.TOWER_WIDTH_TILES) {
      return false;
    }

    // Check minimum shaft height (at least 2 floors)
    if (maxFloor - minFloor < 1) {
      return false;
    }

    // Check maximum shaft height (30 floors for standard)
    if (maxFloor - minFloor > 29) {
      return false;
    }

    // Check cost
    const cost = this.getElevatorCost(minFloor, maxFloor);
    if (this.tower.funds < cost) {
      return false;
    }

    // TODO: Check overlap with existing elevators
    // (This would require access to ElevatorSystem, which we'll handle in index.ts)

    return true;
  }

  /** Calculate elevator cost based on shaft height */
  private getElevatorCost(minFloor: number, maxFloor: number): number {
    const baseCost = 200000; // $200K base
    const costPerFloor = 80000; // $80K per floor
    const floorCount = maxFloor - minFloor + 1;
    
    // Base cost covers first floor, then add per-floor cost
    return baseCost + (floorCount - 1) * costPerFloor;
  }

  /** Attempt to place building at current ghost position */
  placeBuilding(): Building | null {
    if (!this.enabled || !this.tower) return null;

    // Demolish mode - demolish hovered building
    if (this.demolishMode && this.hoveredBuilding) {
      return this.demolishBuilding(this.hoveredBuilding);
    }

    // Regular placement mode
    if (!this.ghostValid) return null;

    // Elevator placement is handled separately via drag
    if (this.selectedType === 'elevator') {
      return null;
    }

    const constraints = BUILDING_CONSTRAINTS[this.selectedType as BuildingType];
    const endTile = this.ghostTile + constraints.width - 1;

    // Create building
    const building: Building = {
      id: `building-${this.nextBuildingId++}`,
      type: this.selectedType,
      position: {
        floor: this.ghostFloor,
        startTile: this.ghostTile,
        endTile: endTile,
      },
      width: constraints.width,
      height: constraints.height,
      floors: [this.ghostFloor],
      state: 'active',
      stress: 0,
      occupantIds: [],
      incomePerQuarter: this.getIncomeForType(this.selectedType),
      maintenanceCostPerQuarter: 0,
      lastEvaluationDate: null,
      consecutiveBadEvals: 0,
      vacantSince: null,
    };

    // Deduct cost
    this.tower.funds -= constraints.cost;

    // Emit event
    getEventBus().emitSync({
      type: 'BUILDING_PLACED',
      timestamp: Date.now(),
      data: { building }
    } as any);

    console.log(`Placed ${this.selectedType} at floor ${this.ghostFloor}, tiles ${this.ghostTile}-${endTile}`);

    return building;
  }

  /** Demolish a building and refund partial cost */
  demolishBuilding(building: Building): Building | null {
    if (!this.tower) return null;

    // Calculate refund (50% of original cost)
    const originalCost = BUILDING_CONSTRAINTS[building.type]?.cost ?? 0;
    const refund = Math.floor(originalCost * 0.5);

    // Add refund to tower funds
    this.tower.funds += refund;

    // Emit demolish event
    getEventBus().emitSync({
      type: 'BUILDING_DEMOLISHED',
      timestamp: Date.now(),
      data: { buildingId: building.id, refund }
    } as any);

    console.log(`Demolished ${building.type} (ID: ${building.id}) - Refunded $${refund.toLocaleString()}`);

    // The tower manager will actually remove the building from the tower
    return building;
  }

  /** Get income for building type */
  private getIncomeForType(type: BuildingType): number {
    const incomes: Partial<Record<BuildingType, number>> = {
      office: 10000,
      condo: 5000,
      fastFood: 15000,
      restaurant: 25000,
      shop: 20000,
      hotelSingle: 8000,
      hotelTwin: 15000,
      hotelSuite: 30000,
    };
    return incomes[type] ?? 0;
  }

  /** Get building cost */
  getCost(type: BuildingType): number {
    return BUILDING_CONSTRAINTS[type]?.cost ?? 0;
  }

  /** Get available building types for current funds */
  getAffordableTypes(): BuildingType[] {
    if (!this.tower) return [];
    
    return (Object.keys(BUILDING_CONSTRAINTS) as BuildingType[])
      .filter(type => BUILDING_CONSTRAINTS[type].cost <= this.tower!.funds);
  }

  /** Check if ghost preview is currently active */
  hasGhost(): boolean {
    return this.ghostContainer.visible && !this.demolishMode;
  }
}

export { BUILDING_CONSTRAINTS, BUILDING_COLORS };
