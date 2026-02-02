/**
 * Elevator Renderer - Visualize elevator shafts and cars
 * 
 * Renders elevator shafts as vertical lines and cars as moving boxes.
 * Shows car position, direction, and passenger count.
 * 
 * @module rendering/ElevatorRenderer
 */

import * as PIXI from 'pixi.js';
import type { ElevatorShaft } from '@/entities/ElevatorShaft';
import type { ElevatorCar } from '@/entities/ElevatorCar';
import { RENDER_CONSTANTS } from './TowerRenderer';
import { ParticleEffect } from './ParticleEffect';

export class ElevatorRenderer {
  private container: PIXI.Container;
  private shaftGraphics: Map<string, PIXI.Graphics> = new Map();
  private carSprites: Map<string, PIXI.Container> = new Map();
  private particles: ParticleEffect;
  private previousDoorStates: Map<string, boolean> = new Map();
  
  constructor(container: PIXI.Container) {
    this.container = container;
    this.particles = new ParticleEffect(container);
  }
  
  /**
   * Render all elevator shafts
   */
  render(shafts: ElevatorShaft[]): void {
    // Remove old shafts
    for (const [id, graphics] of this.shaftGraphics) {
      if (!shafts.find(s => s.id === id)) {
        this.container.removeChild(graphics);
        graphics.destroy();
        this.shaftGraphics.delete(id);
      }
    }
    
    // Remove old cars
    for (const [id, sprite] of this.carSprites) {
      const stillExists = shafts.some(shaft => 
        shaft.cars.some(car => car.id === id)
      );
      if (!stillExists) {
        this.container.removeChild(sprite);
        sprite.destroy();
        this.carSprites.delete(id);
        this.previousDoorStates.delete(id);
      }
    }
    
    // Render each shaft
    for (const shaft of shafts) {
      this.renderShaft(shaft);
      
      // Render cars in this shaft
      for (const car of shaft.cars) {
        this.renderCar(car, shaft);
      }
    }
    
    // Update particles
    this.particles.update();
  }
  
  /**
   * Render elevator shaft (vertical structure)
   */
  private renderShaft(shaft: ElevatorShaft): void {
    let graphics = this.shaftGraphics.get(shaft.id);
    
    if (!graphics) {
      graphics = new PIXI.Graphics();
      this.container.addChild(graphics);
      this.shaftGraphics.set(shaft.id, graphics);
    }
    
    graphics.clear();
    
    // Calculate shaft dimensions
    const x = shaft.tileX * RENDER_CONSTANTS.TILE_WIDTH + RENDER_CONSTANTS.TILE_WIDTH / 2;
    const topY = shaft.maxFloor * RENDER_CONSTANTS.FLOOR_HEIGHT;
    const bottomY = shaft.minFloor * RENDER_CONSTANTS.FLOOR_HEIGHT;
    const height = bottomY - topY;
    
    // Draw shaft as a vertical line with background
    graphics.rect(x - 6, topY, 12, height);
    graphics.fill({ color: 0x555555, alpha: 0.3 });
    
    // Draw shaft borders
    graphics.setStrokeStyle({ width: 1, color: 0x333333 });
    graphics.moveTo(x - 6, topY);
    graphics.lineTo(x - 6, bottomY);
    graphics.stroke();
    
    graphics.moveTo(x + 6, topY);
    graphics.lineTo(x + 6, bottomY);
    graphics.stroke();
    
    // Draw floor indicators (small lines at each floor level)
    for (let floor = shaft.minFloor; floor <= shaft.maxFloor; floor++) {
      const floorY = floor * RENDER_CONSTANTS.FLOOR_HEIGHT;
      
      // Draw small tick marks
      graphics.setStrokeStyle({ width: 1, color: 0xaaaaaa, alpha: 0.5 });
      graphics.moveTo(x - 8, floorY);
      graphics.lineTo(x + 8, floorY);
      graphics.stroke();
      
      // Check if there are active calls at this floor
      const hasUpCall = shaft.cars.some(car => car.upCalls.has(floor));
      const hasDownCall = shaft.cars.some(car => car.downCalls.has(floor));
      
      // Draw call indicators
      if (hasUpCall) {
        // Small up arrow indicator
        graphics.moveTo(x + 10, floorY - 2);
        graphics.lineTo(x + 8, floorY - 4);
        graphics.lineTo(x + 12, floorY - 4);
        graphics.lineTo(x + 10, floorY - 2);
        graphics.fill({ color: 0xffff00, alpha: 0.8 });
      }
      
      if (hasDownCall) {
        // Small down arrow indicator
        graphics.moveTo(x + 10, floorY + 2);
        graphics.lineTo(x + 8, floorY + 4);
        graphics.lineTo(x + 12, floorY + 4);
        graphics.lineTo(x + 10, floorY + 2);
        graphics.fill({ color: 0xffff00, alpha: 0.8 });
      }
    }
  }
  
  /**
   * Render elevator car
   */
  private renderCar(car: ElevatorCar, shaft: ElevatorShaft): void {
    let sprite = this.carSprites.get(car.id);
    
    if (!sprite) {
      sprite = new PIXI.Container();
      this.container.addChild(sprite);
      this.carSprites.set(car.id, sprite);
    }
    
    // Clear and redraw
    sprite.removeChildren();
    
    const graphics = new PIXI.Graphics();
    
    // Draw car body
    const carWidth = 10;
    const carHeight = 20;
    
    // Enhanced glow effect when doors are open
    if (car.doorsOpen) {
      // Larger glow
      graphics.circle(0, 0, carWidth + 4);
      graphics.fill({ color: 0x32cd32, alpha: 0.2 });
      graphics.circle(0, 0, carWidth);
      graphics.fill({ color: 0x32cd32, alpha: 0.3 });
    }
    
    graphics.rect(-carWidth / 2, -carHeight / 2, carWidth, carHeight);
    
    // Color based on state with smoother transitions
    let carColor = 0x4169e1; // Blue (moving)
    if (car.doorsOpen) {
      carColor = 0x32cd32; // Green when doors open
    } else if (car.passengerIds.length >= car.maxCapacity) {
      carColor = 0xff6347; // Red when full
    } else if (car.passengerIds.length > 0) {
      carColor = 0x6495ed; // Lighter blue when carrying passengers
    }
    
    graphics.fill(carColor);
    graphics.setStrokeStyle({ width: 1, color: 0x000000 });
    graphics.stroke();
    
    // Enhanced door animation
    const doorProgress = car.doorsOpen ? Math.min(1, car.getDoorTimer() / 10) : Math.max(0, 1 - car.getDoorTimer() / 5);
    const doorOffset = doorProgress * (carWidth / 2);
    
    // Left door panel (slides left)
    const leftDoorWidth = carWidth / 2 - doorOffset;
    if (leftDoorWidth > 0) {
      graphics.rect(-carWidth / 2, -carHeight / 2, leftDoorWidth, carHeight);
      graphics.fill({ color: 0x888888, alpha: 0.9 });
      graphics.setStrokeStyle({ width: 0.5, color: 0x000000 });
      graphics.stroke();
      
      // Door handle/detail
      graphics.rect(-carWidth / 2 + leftDoorWidth - 2, 0, 2, 8);
      graphics.fill({ color: 0x666666 });
    }
    
    // Right door panel (slides right)
    const rightDoorWidth = carWidth / 2 - doorOffset;
    if (rightDoorWidth > 0) {
      graphics.rect(doorOffset, -carHeight / 2, rightDoorWidth, carHeight);
      graphics.fill({ color: 0x888888, alpha: 0.9 });
      graphics.setStrokeStyle({ width: 0.5, color: 0x000000 });
      graphics.stroke();
      
      // Door handle/detail
      graphics.rect(doorOffset, 0, 2, 8);
      graphics.fill({ color: 0x666666 });
    }
    
    // Door state indicator (opening/closing animation)
    if (car.doorsOpen && car.getDoorTimer() > 0) {
      // "Boarding" or "Exiting" indicator with animation
      const pulseSpeed = 0.005;
      const pulseAlpha = 0.5 + Math.sin(Date.now() * pulseSpeed) * 0.3;
      
      const stateText = new PIXI.Text({
        text: '⇄',
        style: {
          fontSize: 8,
          fill: 0x00ff00,
          fontWeight: 'bold',
        },
      });
      stateText.anchor.set(0.5);
      stateText.x = 0;
      stateText.y = -carHeight / 2 - 10;
      stateText.alpha = pulseAlpha;
      sprite.addChild(stateText);
    } else if (!car.doorsOpen && car.getDoorTimer() > 0 && car.getDoorTimer() < 5) {
      // Closing indicator
      const stateText = new PIXI.Text({
        text: '▶ ◀',
        style: {
          fontSize: 6,
          fill: 0xffa500,
          fontWeight: 'bold',
        },
      });
      stateText.anchor.set(0.5);
      stateText.x = 0;
      stateText.y = -carHeight / 2 - 8;
      sprite.addChild(stateText);
    }
    
    // Enhanced direction arrow
    if (car.direction === 'up') {
      // Up arrow (triangle)
      graphics.moveTo(0, -carHeight / 2 - 8);
      graphics.lineTo(-4, -carHeight / 2 - 2);
      graphics.lineTo(4, -carHeight / 2 - 2);
      graphics.lineTo(0, -carHeight / 2 - 8);
      graphics.fill({ color: 0xffff00, alpha: 0.95 });
      graphics.setStrokeStyle({ width: 1, color: 0x000000 });
      graphics.stroke();
    } else if (car.direction === 'down') {
      // Down arrow (triangle)
      graphics.moveTo(0, carHeight / 2 + 8);
      graphics.lineTo(-4, carHeight / 2 + 2);
      graphics.lineTo(4, carHeight / 2 + 2);
      graphics.lineTo(0, carHeight / 2 + 8);
      graphics.fill({ color: 0xffff00, alpha: 0.95 });
      graphics.setStrokeStyle({ width: 1, color: 0x000000 });
      graphics.stroke();
    }
    
    // 🆕 BUG-011 FIX: Enhanced passenger count display with capacity
    if (car.passengerIds.length > 0) {
      const capacity = car.maxCapacity;
      const occupancy = car.passengerIds.length / capacity;
      
      // Background with color coding for fullness
      const countBg = new PIXI.Graphics();
      countBg.circle(0, 0, 10);
      let bgColor = 0x000000;
      if (occupancy >= 0.8) {
        bgColor = 0xff4444; // Red when >80% full
      } else if (occupancy >= 0.5) {
        bgColor = 0xff8800; // Orange when >50% full
      }
      countBg.fill({ color: bgColor, alpha: 0.7 });
      sprite.addChild(countBg);
      
      const passengerText = new PIXI.Text({
        text: `${car.passengerIds.length}/${capacity}`,
        style: {
          fontSize: 7,
          fill: 0xffffff,
          fontFamily: 'monospace',
          fontWeight: 'bold',
        },
      });
      passengerText.anchor.set(0.5);
      passengerText.x = 0;
      passengerText.y = 0;
      sprite.addChild(passengerText);
    }
    
    // Show current floor number when moving or doors closed
    if (!car.doorsOpen || car.direction !== 'idle') {
      const floorText = new PIXI.Text({
        text: `${Math.floor(car.currentFloor)}`,
        style: {
          fontSize: 6,
          fill: 0xffffff,
          fontFamily: 'monospace',
          fontWeight: 'bold',
        },
      });
      floorText.anchor.set(0.5);
      floorText.x = carWidth / 2 + 8;
      floorText.y = -carHeight / 2 - 4;
      sprite.addChild(floorText);
    }
    
    sprite.addChild(graphics);
    
    // Position car
    const x = shaft.tileX * RENDER_CONSTANTS.TILE_WIDTH + RENDER_CONSTANTS.TILE_WIDTH / 2;
    const y = car.getRenderPosition() * RENDER_CONSTANTS.FLOOR_HEIGHT + RENDER_CONSTANTS.FLOOR_HEIGHT / 2;
    
    sprite.x = x;
    sprite.y = y;
    
    // Create sparkle effect when doors just opened
    const wasDoorOpen = this.previousDoorStates.get(car.id) ?? false;
    if (car.doorsOpen && !wasDoorOpen) {
      // Doors just opened! Create sparkle effect
      this.particles.createSparkles(x, y - carHeight / 2, 4);
    }
    this.previousDoorStates.set(car.id, car.doorsOpen);
  }
  
  /**
   * Clear all graphics
   */
  clear(): void {
    for (const graphics of this.shaftGraphics.values()) {
      this.container.removeChild(graphics);
      graphics.destroy();
    }
    this.shaftGraphics.clear();
    
    for (const sprite of this.carSprites.values()) {
      this.container.removeChild(sprite);
      sprite.destroy();
    }
    this.carSprites.clear();
  }
  
  /**
   * Destroy renderer
   */
  destroy(): void {
    this.clear();
    this.particles.destroy();
  }
}
