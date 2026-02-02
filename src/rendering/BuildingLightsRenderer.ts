/**
 * Building Lights Renderer - Make buildings feel ALIVE
 * 
 * Shows which buildings are occupied with lit windows.
 * Creates a dramatic day/night cycle effect.
 * 
 * SimTower's magic: seeing lights turn on at night, watching your tower come alive.
 * 
 * @module rendering/BuildingLightsRenderer
 */

import * as PIXI from 'pixi.js';
import type { Building } from '@/interfaces';
import { RENDER_CONSTANTS } from './TowerRenderer';
import { BUILDING_CONFIGS } from '@/interfaces/buildings';

/**
 * Building light state
 */
interface BuildingLights {
  buildingId: string;
  windows: PIXI.Graphics[];
  lastOccupancy: number;
}

/**
 * BuildingLightsRenderer - Show occupancy through lit windows
 */
export class BuildingLightsRenderer {
  private container: PIXI.Container;
  private lights: Map<string, BuildingLights> = new Map();
  private lightsEnabled: boolean = false;
  
  constructor(container: PIXI.Container) {
    this.container = container;
  }
  
  /**
   * Update lights based on time of day and occupancy
   */
  update(buildings: Building[], timeOfDay: { hour: number; showLights: boolean }): void {
    this.lightsEnabled = timeOfDay.showLights;
    
    // Remove lights for buildings that no longer exist
    for (const [buildingId, lights] of this.lights) {
      if (!buildings.find(b => b.id === buildingId)) {
        this.removeLights(buildingId);
      }
    }
    
    // Update each building's lights
    for (const building of buildings) {
      if (this.lightsEnabled) {
        this.renderLights(building);
      } else {
        // Daytime - clear lights
        this.removeLights(building.id);
      }
    }
  }
  
  /**
   * Render lights for a building
   */
  private renderLights(building: Building): void {
    const occupancy = building.occupantIds?.length || 0;
    
    let lights = this.lights.get(building.id);
    const needsRebuild = !lights || lights.lastOccupancy !== occupancy;
    
    // Only rebuild if occupancy changed
    if (needsRebuild) {
      // Remove old lights
      if (lights) {
        this.removeLights(building.id);
      }
      
      // Create new lights
      lights = this.createLights(building);
      this.lights.set(building.id, lights);
    }
    
    // Animate lights (subtle flicker)
    if (lights) {
      this.animateLights(lights);
    }
  }
  
  /**
   * Create lights for a building based on type and occupancy
   */
  private createLights(building: Building): BuildingLights {
    const windows: PIXI.Graphics[] = [];
    const occupancy = building.occupantIds?.length || 0;
    const capacity = BUILDING_CONFIGS[building.type].capacity || 10;
    const occupancyPercent = Math.min(1, occupancy / capacity);
    
    // Determine window layout based on building type
    const windowLayout = this.getWindowLayout(building);
    
    // Calculate how many windows to light up
    const totalWindows = windowLayout.rows * windowLayout.cols;
    const litWindows = Math.floor(totalWindows * occupancyPercent);
    
    // Create window lights
    for (let row = 0; row < windowLayout.rows; row++) {
      for (let col = 0; col < windowLayout.cols; col++) {
        const windowIndex = row * windowLayout.cols + col;
        
        // Decide if this window is lit
        const isLit = windowIndex < litWindows;
        
        if (isLit) {
          const window = this.createWindow(
            building,
            col,
            row,
            windowLayout.cols,
            windowLayout.rows
          );
          windows.push(window);
          this.container.addChild(window);
        }
      }
    }
    
    return {
      buildingId: building.id,
      windows,
      lastOccupancy: occupancy,
    };
  }
  
  /**
   * Get window layout for building type
   */
  private getWindowLayout(building: Building): { rows: number; cols: number } {
    switch (building.type) {
      case 'condo':
        // Residential: 2x2 grid
        return { rows: 2, cols: Math.min(building.width, 3) };
      
      case 'office':
        // Office: 3x3 grid (more windows)
        return { rows: 3, cols: Math.min(building.width, 4) };
      
      case 'hotelSingle':
      case 'hotelTwin':
      case 'hotelSuite':
        // Hotel: 4 rows of windows
        return { rows: 4, cols: Math.min(building.width, 3) };
      
      case 'fastFood':
      case 'restaurant':
        // Food: Single row of bright windows
        return { rows: 1, cols: Math.min(building.width, 3) };
      
      case 'shop':
      case 'partyHall':
      case 'cinema':
        // Entertainment: Big bright windows
        return { rows: 2, cols: Math.min(building.width, 2) };
      
      default:
        return { rows: 1, cols: 1 };
    }
  }
  
  /**
   * Create a single window light
   */
  private createWindow(
    building: Building,
    col: number,
    row: number,
    totalCols: number,
    totalRows: number
  ): PIXI.Graphics {
    const window = new PIXI.Graphics();
    
    // Window dimensions
    const windowWidth = 4;
    const windowHeight = 6;
    
    // Calculate position within building
    const buildingWidth = building.width * RENDER_CONSTANTS.TILE_WIDTH;
    const buildingHeight = RENDER_CONSTANTS.FLOOR_HEIGHT;
    
    const horizontalSpacing = buildingWidth / (totalCols + 1);
    const verticalSpacing = buildingHeight / (totalRows + 1);
    
    const x = building.position.startTile * RENDER_CONSTANTS.TILE_WIDTH + 
              horizontalSpacing * (col + 1);
    const y = building.position.floor * RENDER_CONSTANTS.FLOOR_HEIGHT + 
              verticalSpacing * (row + 1);
    
    // Draw window with glow
    // Outer glow
    window.rect(-windowWidth/2 - 1, -windowHeight/2 - 1, windowWidth + 2, windowHeight + 2);
    window.fill({ color: 0xffff88, alpha: 0.3 });
    
    // Inner bright window
    window.rect(-windowWidth/2, -windowHeight/2, windowWidth, windowHeight);
    window.fill({ color: 0xffffaa, alpha: 0.9 });
    
    window.x = x;
    window.y = y;
    
    return window;
  }
  
  /**
   * Animate lights (subtle flicker)
   */
  private animateLights(lights: BuildingLights): void {
    const time = Date.now() * 0.002;
    
    lights.windows.forEach((window, index) => {
      // Each window flickers slightly at different rates
      const flicker = 0.85 + Math.sin(time + index * 0.5) * 0.15;
      window.alpha = flicker;
    });
  }
  
  /**
   * Remove lights for a building
   */
  private removeLights(buildingId: string): void {
    const lights = this.lights.get(buildingId);
    if (!lights) return;
    
    lights.windows.forEach(window => {
      this.container.removeChild(window);
      window.destroy();
    });
    
    this.lights.delete(buildingId);
  }
  
  /**
   * Clear all lights
   */
  clear(): void {
    for (const buildingId of Array.from(this.lights.keys())) {
      this.removeLights(buildingId);
    }
  }
  
  /**
   * Destroy renderer
   */
  destroy(): void {
    this.clear();
  }
}
