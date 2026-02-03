/**
 * SkyRenderer - Beautiful atmospheric sky with city backdrop
 * 
 * Creates a stunning sky background that changes throughout the day,
 * with city silhouette, ground level details, and atmosphere.
 * Inspired by SimTower's iconic visual style.
 * 
 * @module rendering/SkyRenderer
 */

import * as PIXI from 'pixi.js';
import type { TimeOfDayState } from '@/simulation/TimeOfDaySystem';
import { RENDER_CONSTANTS } from './TowerRenderer';

interface CloudParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

/**
 * SkyRenderer - Handles all sky and atmospheric rendering
 */
export class SkyRenderer {
  private container: PIXI.Container;
  private skyGradient: PIXI.Graphics;
  private cityline: PIXI.Graphics;
  private ground: PIXI.Graphics;
  private clouds: PIXI.Graphics;
  private stars: PIXI.Graphics;
  
  private cloudParticles: CloudParticle[] = [];
  private starPositions: Array<{ x: number; y: number; brightness: number }> = [];
  
  private worldWidth: number;
  private worldHeight: number;
  private groundY: number;
  
  constructor(container: PIXI.Container) {
    this.container = container;
    
    // Calculate world dimensions
    this.worldWidth = RENDER_CONSTANTS.TOWER_WIDTH_TILES * RENDER_CONSTANTS.TILE_WIDTH + 40000;
    this.worldHeight = (RENDER_CONSTANTS.MAX_FLOORS_ABOVE + RENDER_CONSTANTS.MAX_FLOORS_BELOW) * RENDER_CONSTANTS.FLOOR_HEIGHT + 4000;
    this.groundY = RENDER_CONSTANTS.FLOOR_HEIGHT; // Ground is at floor 1
    
    // Create layers (back to front)
    this.skyGradient = new PIXI.Graphics();
    this.stars = new PIXI.Graphics();
    this.clouds = new PIXI.Graphics();
    this.cityline = new PIXI.Graphics();
    this.ground = new PIXI.Graphics();
    
    // Add to container in render order
    this.container.addChild(this.skyGradient);
    this.container.addChild(this.stars);
    this.container.addChild(this.clouds);
    this.container.addChild(this.cityline);
    this.container.addChild(this.ground);
    
    // Initialize particles
    this.initializeClouds();
    this.initializeStars();
  }
  
  /**
   * Initialize cloud particles
   */
  private initializeClouds(): void {
    const numClouds = 20;
    for (let i = 0; i < numClouds; i++) {
      this.cloudParticles.push({
        x: Math.random() * this.worldWidth - 20000,
        y: -RENDER_CONSTANTS.MAX_FLOORS_ABOVE * RENDER_CONSTANTS.FLOOR_HEIGHT + Math.random() * 2000,
        size: 100 + Math.random() * 200,
        speed: 0.5 + Math.random() * 1.5,
        opacity: 0.1 + Math.random() * 0.3,
      });
    }
  }
  
  /**
   * Initialize star field
   */
  private initializeStars(): void {
    const numStars = 150;
    for (let i = 0; i < numStars; i++) {
      this.starPositions.push({
        x: Math.random() * this.worldWidth - 20000,
        y: -RENDER_CONSTANTS.MAX_FLOORS_ABOVE * RENDER_CONSTANTS.FLOOR_HEIGHT + Math.random() * 3000,
        brightness: 0.3 + Math.random() * 0.7,
      });
    }
  }
  
  /**
   * Update and render the complete sky scene
   */
  update(timeOfDayState: TimeOfDayState, deltaTime: number = 1): void {
    this.drawSkyGradient(timeOfDayState);
    this.drawStars(timeOfDayState);
    this.drawClouds(timeOfDayState, deltaTime);
    this.drawCitylineSilhouette(timeOfDayState);
    this.drawGroundLevel(timeOfDayState);
  }
  
  /**
   * Draw beautiful sky gradient
   */
  private drawSkyGradient(timeOfDayState: TimeOfDayState): void {
    this.skyGradient.clear();
    
    const gradient = timeOfDayState.skyGradient;
    const skyX = -20000;
    const skyY = -RENDER_CONSTANTS.MAX_FLOORS_ABOVE * RENDER_CONSTANTS.FLOOR_HEIGHT - 2000;
    
    // Create smooth vertical gradient using multiple strips
    const strips = 40;
    const stripHeight = this.worldHeight / strips;
    
    for (let i = 0; i < strips; i++) {
      const t = i / (strips - 1);
      const color = this.lerpColor(gradient.topColor, gradient.bottomColor, t);
      this.skyGradient.rect(skyX, skyY + i * stripHeight, this.worldWidth, stripHeight);
      this.skyGradient.fill({ color, alpha: gradient.alpha });
    }
  }
  
  /**
   * Draw stars (visible at night)
   */
  private drawStars(timeOfDayState: TimeOfDayState): void {
    this.stars.clear();
    
    // Stars only visible at night/evening
    const isNight = timeOfDayState.period === 'NIGHT' || 
                    timeOfDayState.period === 'EVENING' ||
                    timeOfDayState.period === 'DAWN';
    
    if (!isNight) return;
    
    // Calculate star opacity based on time
    let starAlpha = 0;
    if (timeOfDayState.period === 'NIGHT') {
      starAlpha = 0.8;
    } else if (timeOfDayState.period === 'EVENING') {
      starAlpha = 0.3 + 0.5 * timeOfDayState.transitionProgress;
    } else if (timeOfDayState.period === 'DAWN') {
      starAlpha = 0.8 * (1 - timeOfDayState.transitionProgress);
    }
    
    // Draw each star
    for (const star of this.starPositions) {
      const alpha = starAlpha * star.brightness;
      const size = 1 + star.brightness;
      
      this.stars.circle(star.x, star.y, size);
      this.stars.fill({ color: 0xffffff, alpha });
    }
  }
  
  /**
   * Draw animated clouds
   */
  private drawClouds(timeOfDayState: TimeOfDayState, deltaTime: number): void {
    this.clouds.clear();
    
    // Clouds more visible during day
    const isDay = timeOfDayState.period === 'MORNING' || 
                  timeOfDayState.period === 'AFTERNOON';
    
    if (!isDay) return;
    
    // Update cloud positions
    for (const cloud of this.cloudParticles) {
      cloud.x += cloud.speed * deltaTime;
      
      // Wrap around
      if (cloud.x > this.worldWidth / 2) {
        cloud.x = -20000;
      }
    }
    
    // Draw clouds as soft ellipses
    for (const cloud of this.cloudParticles) {
      this.clouds.ellipse(cloud.x, cloud.y, cloud.size, cloud.size * 0.6);
      this.clouds.fill({ color: 0xffffff, alpha: cloud.opacity });
    }
  }
  
  /**
   * Draw city skyline silhouette in the distance
   */
  private drawCitylineSilhouette(timeOfDayState: TimeOfDayState): void {
    this.cityline.clear();
    
    // City silhouette sits behind the tower at horizon
    const horizonY = this.groundY - 100;
    const startX = -15000;
    const endX = RENDER_CONSTANTS.TOWER_WIDTH_TILES * RENDER_CONSTANTS.TILE_WIDTH + 15000;
    
    // Calculate silhouette color based on time of day
    let silhouetteColor: number;
    let silhouetteAlpha: number;
    
    switch (timeOfDayState.period) {
      case 'NIGHT':
        silhouetteColor = 0x0a0a2e;
        silhouetteAlpha = 0.9;
        break;
      case 'DAWN':
        silhouetteColor = 0x1a1a4e;
        silhouetteAlpha = 0.7;
        break;
      case 'MORNING':
      case 'AFTERNOON':
        silhouetteColor = 0x2a2a4e;
        silhouetteAlpha = 0.4;
        break;
      case 'DUSK':
        silhouetteColor = 0x3a2a4e;
        silhouetteAlpha = 0.6;
        break;
      case 'EVENING':
        silhouetteColor = 0x1a1a3e;
        silhouetteAlpha = 0.8;
        break;
      default:
        silhouetteColor = 0x333333;
        silhouetteAlpha = 0.5;
    }
    
    // Draw distant buildings (left side)
    this.drawCityBuildings(startX, horizonY, -8000, silhouetteColor, silhouetteAlpha, timeOfDayState);
    
    // Draw distant buildings (right side)
    this.drawCityBuildings(
      RENDER_CONSTANTS.TOWER_WIDTH_TILES * RENDER_CONSTANTS.TILE_WIDTH + 2000,
      horizonY,
      endX,
      silhouetteColor,
      silhouetteAlpha,
      timeOfDayState
    );
  }
  
  /**
   * Draw a section of city buildings
   */
  private drawCityBuildings(
    startX: number,
    baseY: number,
    endX: number,
    color: number,
    alpha: number,
    timeOfDayState: TimeOfDayState
  ): void {
    // Use seeded random for consistent cityline
    let x = startX;
    let seed = Math.floor(startX / 100);
    
    while (x < endX) {
      const width = 80 + this.seededRandom(seed++) * 200;
      const height = 200 + this.seededRandom(seed++) * 600;
      
      // Draw building silhouette
      this.cityline.rect(x, baseY - height, width, height);
      this.cityline.fill({ color, alpha });
      
      // Add window lights at night
      if (timeOfDayState.buildingsShowLights) {
        this.drawCityBuildingLights(x, baseY - height, width, height, seed);
      }
      
      x += width + 20 + this.seededRandom(seed++) * 50;
    }
  }
  
  /**
   * Draw lights on distant city buildings
   */
  private drawCityBuildingLights(x: number, y: number, width: number, height: number, seed: number): void {
    const windowSize = 3;
    const windowSpacing = 12;
    
    for (let wy = y + 20; wy < y + height - 20; wy += windowSpacing) {
      for (let wx = x + 10; wx < x + width - 10; wx += windowSpacing) {
        // Random chance for light to be on
        if (this.seededRandom(seed++) > 0.3) {
          this.cityline.rect(wx, wy, windowSize, windowSize);
          this.cityline.fill({ color: 0xffeb99, alpha: 0.6 });
        }
      }
    }
  }
  
  /**
   * Draw ground level with street details
   */
  private drawGroundLevel(timeOfDayState: TimeOfDayState): void {
    this.ground.clear();
    
    const groundTop = this.groundY;
    const groundBottom = groundTop + RENDER_CONSTANTS.MAX_FLOORS_BELOW * RENDER_CONSTANTS.FLOOR_HEIGHT + 1000;
    const startX = -20000;
    const endX = RENDER_CONSTANTS.TOWER_WIDTH_TILES * RENDER_CONSTANTS.TILE_WIDTH + 20000;
    
    // Calculate ground colors based on time of day
    let streetColor: number;
    let grassColor: number;
    let sidewalkColor: number;
    
    switch (timeOfDayState.period) {
      case 'NIGHT':
      case 'EVENING':
        streetColor = 0x2a2a2a;
        grassColor = 0x1a3a1a;
        sidewalkColor = 0x4a4a4a;
        break;
      case 'DAWN':
      case 'DUSK':
        streetColor = 0x4a4a4a;
        grassColor = 0x3a5a3a;
        sidewalkColor = 0x6a6a6a;
        break;
      default: // Day
        streetColor = 0x555555;
        grassColor = 0x4a7a4a;
        sidewalkColor = 0x888888;
    }
    
    // Draw grass/dirt below ground level
    this.ground.rect(startX, groundTop, endX - startX, groundBottom - groundTop);
    this.ground.fill(grassColor);
    
    // Draw sidewalk on both sides of tower
    const sidewalkHeight = 8;
    const sidewalkWidth = 200;
    
    // Left sidewalk
    this.ground.rect(startX, groundTop - sidewalkHeight, sidewalkWidth, sidewalkHeight);
    this.ground.fill(sidewalkColor);
    
    // Right sidewalk
    const towerWidth = RENDER_CONSTANTS.TOWER_WIDTH_TILES * RENDER_CONSTANTS.TILE_WIDTH;
    this.ground.rect(towerWidth, groundTop - sidewalkHeight, sidewalkWidth, sidewalkHeight);
    this.ground.fill(sidewalkColor);
    
    // Draw street/road in front of tower (extends to edges)
    const roadHeight = 6;
    this.ground.rect(startX, groundTop - sidewalkHeight - roadHeight, endX - startX, roadHeight);
    this.ground.fill(streetColor);
    
    // Draw road markings (dashed line)
    const dashLength = 40;
    const dashGap = 30;
    let dashX = startX;
    
    while (dashX < endX) {
      this.ground.rect(dashX, groundTop - sidewalkHeight - roadHeight / 2 - 1, dashLength, 2);
      this.ground.fill({ color: 0xffeb99, alpha: 0.5 });
      dashX += dashLength + dashGap;
    }
    
    // Add trees and decorations
    this.drawStreetDetails(startX, groundTop - sidewalkHeight, endX, timeOfDayState);
    
    // Street lamps at night
    if (timeOfDayState.buildingsShowLights) {
      this.drawStreetLamps(startX, groundTop - sidewalkHeight, endX);
    }
  }
  
  /**
   * Draw street details (trees, bushes)
   */
  private drawStreetDetails(startX: number, baseY: number, endX: number, timeOfDayState: TimeOfDayState): void {
    // Calculate foliage color based on time
    let foliageColor: number;
    
    switch (timeOfDayState.period) {
      case 'NIGHT':
      case 'EVENING':
        foliageColor = 0x1a4a1a;
        break;
      case 'DAWN':
      case 'DUSK':
        foliageColor = 0x2a6a2a;
        break;
      default:
        foliageColor = 0x3a8a3a;
    }
    
    const trunkColor = 0x4a3a2a;
    
    // Draw trees on left side
    let x = startX + 50;
    let seed = 1000;
    
    while (x < -2000) {
      if (this.seededRandom(seed++) > 0.6) {
        this.drawTree(x, baseY, trunkColor, foliageColor);
      }
      x += 100 + this.seededRandom(seed++) * 100;
    }
    
    // Draw trees on right side
    const towerWidth = RENDER_CONSTANTS.TOWER_WIDTH_TILES * RENDER_CONSTANTS.TILE_WIDTH;
    x = towerWidth + 300;
    
    while (x < endX - 100) {
      if (this.seededRandom(seed++) > 0.6) {
        this.drawTree(x, baseY, trunkColor, foliageColor);
      }
      x += 100 + this.seededRandom(seed++) * 100;
    }
  }
  
  /**
   * Draw a simple tree
   */
  private drawTree(x: number, baseY: number, trunkColor: number, foliageColor: number): void {
    // Trunk
    this.ground.rect(x - 3, baseY - 30, 6, 30);
    this.ground.fill(trunkColor);
    
    // Foliage (simple circle)
    this.ground.circle(x, baseY - 35, 15);
    this.ground.fill(foliageColor);
    
    this.ground.circle(x - 10, baseY - 30, 12);
    this.ground.fill(foliageColor);
    
    this.ground.circle(x + 10, baseY - 30, 12);
    this.ground.fill(foliageColor);
  }
  
  /**
   * Draw street lamps
   */
  private drawStreetLamps(startX: number, baseY: number, endX: number): void {
    let x = startX + 200;
    let seed = 5000;
    
    while (x < endX - 200) {
      // Skip tower area
      const towerStart = 0;
      const towerEnd = RENDER_CONSTANTS.TOWER_WIDTH_TILES * RENDER_CONSTANTS.TILE_WIDTH;
      
      if (x < towerStart - 100 || x > towerEnd + 100) {
        // Lamp post
        this.ground.rect(x - 2, baseY - 40, 4, 40);
        this.ground.fill(0x2a2a2a);
        
        // Lamp light
        this.ground.circle(x, baseY - 40, 6);
        this.ground.fill({ color: 0xffeb99, alpha: 0.8 });
        
        // Glow effect
        this.ground.circle(x, baseY - 40, 12);
        this.ground.fill({ color: 0xffeb99, alpha: 0.2 });
      }
      
      x += 200 + this.seededRandom(seed++) * 100;
    }
  }
  
  /**
   * Seeded random for consistent procedural generation
   */
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
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
   * Resize sky renderer
   */
  resize(width: number, height: number): void {
    // Recalculate dimensions if needed
    // Most elements are positioned relative to world coordinates
  }
  
  /**
   * Clean up resources
   */
  destroy(): void {
    this.skyGradient.destroy();
    this.cityline.destroy();
    this.ground.destroy();
    this.clouds.destroy();
    this.stars.destroy();
  }
}
