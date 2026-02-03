/**
 * People Renderer - Visualize people in the tower
 * 
 * Renders simple sprites for each person with stress-based coloring.
 * Black = normal, Pink = stressed, Red = critical.
 * Enhanced with queue visualization and wait indicators.
 * 
 * v0.11.0: Now supports real sprite assets with fallback to procedural rendering
 * 
 * @module rendering/PeopleRenderer
 */

import * as PIXI from 'pixi.js';
import { Person } from '@/entities/Person';
import { RENDER_CONSTANTS } from './TowerRenderer';
import { 
  createPersonSprite, 
  updatePersonSprite 
} from './sprites/PeopleSprites';

export class PeopleRenderer {
  private container: PIXI.Container;
  private sprites: Map<string, PIXI.Container> = new Map(); // Changed to Container for complex sprites
  private waitIndicators: Map<string, PIXI.Container> = new Map();
  private queuePositions: Map<string, { queueIndex: number; queueSize: number }> = new Map();
  private previousStates: Map<string, string> = new Map(); // Track state changes for animations
  private stateChangeTimes: Map<string, number> = new Map(); // Track when state changed
  private spriteLoadAttempts: Set<string> = new Set(); // Track which people we've tried to load sprites for
  
  constructor(container: PIXI.Container) {
    this.container = container;
  }
  
  /**
   * Render all people
   */
  render(people: Person[]): void {
    // Remove sprites for people who no longer exist
    for (const [id, sprite] of this.sprites) {
      if (!people.find(p => p.id === id)) {
        this.container.removeChild(sprite);
        sprite.destroy();
        this.sprites.delete(id);
      }
    }
    
    // Remove wait indicators for people who no longer exist
    for (const [id, indicator] of this.waitIndicators) {
      if (!people.find(p => p.id === id)) {
        this.container.removeChild(indicator);
        indicator.destroy();
        this.waitIndicators.delete(id);
      }
    }
    
    // Calculate queue positions for people waiting at elevators
    this.calculateQueuePositions(people);
    
    // Render each person
    for (const person of people) {
      this.renderPerson(person);
      this.renderWaitIndicator(person);
    }
  }
  
  /**
   * Calculate queue positions for people waiting at the same elevator
   */
  private calculateQueuePositions(people: Person[]): void {
    this.queuePositions.clear();
    
    // Group people by floor + tile (elevator location)
    const queueGroups = new Map<string, Person[]>();
    
    for (const person of people) {
      if (person.state === 'waitingForElevator') {
        const key = `${person.currentFloor}-${person.currentTile}`;
        if (!queueGroups.has(key)) {
          queueGroups.set(key, []);
        }
        queueGroups.get(key)!.push(person);
      }
    }
    
    // Assign queue positions
    for (const [_key, group] of queueGroups) {
      const queueSize = group.length;
      group.forEach((person, index) => {
        this.queuePositions.set(person.id, {
          queueIndex: index,
          queueSize,
        });
      });
    }
  }
  
  /**
   * Render a single person
   */
  private renderPerson(person: Person): void {
    let sprite = this.sprites.get(person.id);
    
    if (!sprite) {
      // Create new sprite container
      sprite = new PIXI.Container();
      this.container.addChild(sprite);
      this.sprites.set(person.id, sprite);
      
      // Try to load real sprite asset (v0.11.0)
      if (!this.spriteLoadAttempts.has(person.id)) {
        this.spriteLoadAttempts.add(person.id);
        this.tryLoadPersonSprite(person, sprite).catch(() => {
          // Silently fail - fallback rendering will be used
        });
      }
    }
    
    // Check if we have a sprite asset loaded
    const spriteAsset = sprite.getChildByName('sprite-asset');
    if (spriteAsset) {
      // Update existing sprite asset
      const direction = person.state === 'walking' ? 
        (person.currentTile > (person.destinationBuildingId ? 0 : person.currentTile) ? 'left' : 'right') : 
        'right';
      
      updatePersonSprite(spriteAsset as PIXI.AnimatedSprite, person, direction).catch(() => {
        // If update fails, remove sprite and fall back to procedural
        sprite?.removeChild(spriteAsset);
        spriteAsset.destroy();
      });
      
      // Position sprite (common for both sprite and fallback)
      this.positionPersonSprite(person, sprite);
      return;
    }
    
    // FALLBACK: Procedural rendering (when sprite assets don't exist)
    // Clear and rebuild sprite
    sprite.removeChildren();
    
    // Get color based on stress level
    const color = person.getColor();
    
    // Create person graphics with better sprite design
    const graphics = new PIXI.Graphics();
    graphics.name = 'fallback-rendering';
    
    // Draw person with body and head
    const personSize = 4; // body radius
    const headSize = 2.5; // head radius
    
    // Shadow (for depth)
    graphics.ellipse(0, personSize + 3, personSize * 1.2, personSize * 0.4);
    graphics.fill({ color: 0x000000, alpha: 0.2 });
    
    // Body (oval)
    graphics.ellipse(0, 1, personSize * 0.8, personSize);
    graphics.fill(color);
    graphics.setStrokeStyle({ width: 1, color: 0x000000 });
    graphics.stroke();
    
    // Head
    graphics.circle(0, -personSize - 1, headSize);
    graphics.fill({ color: 0xffdbac }); // Skin tone
    graphics.setStrokeStyle({ width: 0.5, color: 0x000000 });
    graphics.stroke();
    
    // Add directional indicator (small triangle pointing in walking direction)
    if (person.state === 'walking') {
      const triangleSize = 3;
      graphics.moveTo(personSize, 0);
      graphics.lineTo(personSize + triangleSize, -triangleSize);
      graphics.lineTo(personSize + triangleSize, triangleSize);
      graphics.lineTo(personSize, 0);
      graphics.fill({ color: 0xffffff, alpha: 0.8 });
      graphics.setStrokeStyle({ width: 0.5, color: 0x000000 });
      graphics.stroke();
    }
    
    // Riding elevator indicator (different visual)
    if (person.state === 'ridingElevator') {
      // Add a small elevator icon above head
      const elevatorIcon = new PIXI.Graphics();
      elevatorIcon.rect(-3, -personSize - 8, 6, 4);
      elevatorIcon.fill({ color: 0x4169e1, alpha: 0.7 });
      elevatorIcon.setStrokeStyle({ width: 0.5, color: 0x000000 });
      elevatorIcon.stroke();
      graphics.addChild(elevatorIcon);
    }
    
    // Stress indicator for highly stressed people
    const stressLevel = person.getStressLevel();
    if (stressLevel === 'stressed' || stressLevel === 'critical') {
      const stressIcon = new PIXI.Text({
        text: stressLevel === 'critical' ? '😰' : '😟',
        style: {
          fontSize: 10,
        },
      });
      stressIcon.anchor.set(0.5);
      stressIcon.x = personSize + 6;
      stressIcon.y = -headSize - 2;
      sprite.addChild(stressIcon);
    }
    
    sprite.addChild(graphics);
    
    // Track state changes and apply positioning (common for fallback rendering)
    this.positionPersonSprite(person, sprite);
  }
  
  /**
   * Position person sprite (common for both sprite assets and fallback rendering)
   */
  private positionPersonSprite(person: Person, sprite: PIXI.Container): void {
    // Track state changes for animations
    const prevState = this.previousStates.get(person.id);
    if (prevState !== person.state) {
      this.previousStates.set(person.id, person.state);
      this.stateChangeTimes.set(person.id, Date.now());
    }
    
    // Apply fade animation when boarding/exiting elevator
    const stateChangeTime = this.stateChangeTimes.get(person.id) || 0;
    const timeSinceChange = Date.now() - stateChangeTime;
    const fadeDuration = 300; // ms
    
    // Fade out when boarding (waitingForElevator -> ridingElevator)
    if (person.state === 'ridingElevator' && prevState === 'waitingForElevator') {
      const fadeProgress = Math.min(1, timeSinceChange / fadeDuration);
      sprite.alpha = 1 - fadeProgress;
    }
    // Fade in when exiting (ridingElevator -> walking)
    else if (person.state === 'walking' && prevState === 'ridingElevator') {
      const fadeProgress = Math.min(1, timeSinceChange / fadeDuration);
      sprite.alpha = fadeProgress;
    }
    // Normal visibility
    else {
      sprite.alpha = person.state === 'ridingElevator' ? 0 : 1;
    }
    
    // Calculate position with queue offset if waiting
    let x = person.currentTile * RENDER_CONSTANTS.TILE_WIDTH + RENDER_CONSTANTS.TILE_WIDTH / 2;
    let y = person.currentFloor * RENDER_CONSTANTS.FLOOR_HEIGHT + RENDER_CONSTANTS.FLOOR_HEIGHT - 10;
    
    // Apply queue positioning for people waiting at elevators
    const queueInfo = this.queuePositions.get(person.id);
    if (queueInfo && person.state === 'waitingForElevator') {
      // Arrange people in a horizontal line with small spacing
      const spacing = 10; // pixels between people
      const totalWidth = (queueInfo.queueSize - 1) * spacing;
      const offsetX = (queueInfo.queueIndex * spacing) - (totalWidth / 2);
      x += offsetX;
      
      // Slightly lower Y position for queued people
      y += 5;
    }
    
    sprite.x = x;
    sprite.y = y;
    
    // Add subtle bobbing animation for people waiting
    if (person.state === 'waitingForElevator') {
      const bobAmount = 2; // pixels
      const bobSpeed = 0.002; // speed of bobbing
      const bob = Math.sin(Date.now() * bobSpeed + person.id.charCodeAt(0)) * bobAmount;
      sprite.y += bob;
    }
    
    // Face direction for walking people
    if (person.state === 'walking') {
      sprite.scale.x = person.direction === 'left' ? -1 : 1;
    } else {
      sprite.scale.x = 1; // Reset scale when not walking
    }
  }
  
  /**
   * Try to load real person sprite (v0.11.0)
   * When successful, removes fallback rendering and adds animated sprite
   */
  private async tryLoadPersonSprite(person: Person, container: PIXI.Container): Promise<void> {
    try {
      const direction = person.state === 'walking' ? 
        (person.currentTile > 0 ? 'left' : 'right') : 
        'right';
      
      const sprite = await createPersonSprite(person, direction);
      
      // Success! Remove fallback rendering
      const fallback = container.getChildByName('fallback-rendering');
      if (fallback) {
        container.removeChild(fallback);
        fallback.destroy();
      }
      
      // Add sprite asset
      sprite.name = 'sprite-asset';
      container.addChild(sprite);
      
      console.log(`✨ Loaded sprite for person ${person.id} (stress: ${person.stress})`);
    } catch (error) {
      // Sprite loading failed (assets don't exist) - silently keep fallback
      // This is EXPECTED until sprite assets are generated
    }
  }
  
  /**
   * Render wait indicator for people waiting at elevators
   */
  private renderWaitIndicator(person: Person): void {
    if (person.state !== 'waitingForElevator') {
      // Remove indicator if exists
      const indicator = this.waitIndicators.get(person.id);
      if (indicator) {
        this.container.removeChild(indicator);
        indicator.destroy();
        this.waitIndicators.delete(person.id);
      }
      return;
    }
    
    let indicator = this.waitIndicators.get(person.id);
    
    if (!indicator) {
      // Create new indicator container
      indicator = new PIXI.Container();
      this.container.addChild(indicator);
      this.waitIndicators.set(person.id, indicator);
    }
    
    // Clear and rebuild indicator
    indicator.removeChildren();
    
    // Get queue info
    const queueInfo = this.queuePositions.get(person.id);
    
    // Show indicator only for first person in queue (cleaner visual)
    if (queueInfo && queueInfo.queueIndex === 0) {
      // Show up/down arrow and floor number based on destination
      const destinationFloor = person.getElevatorDestinationFloor();
      let arrow = '⏳';
      let floorLabel = '';
      
      if (destinationFloor !== null) {
        if (destinationFloor > person.currentFloor) {
          arrow = '⬆️';
        } else if (destinationFloor < person.currentFloor) {
          arrow = '⬇️';
        }
        floorLabel = ` ${destinationFloor}`;
      }
      
      const text = new PIXI.Text({
        text: arrow,
        style: {
          fontSize: 14,
          fill: 0xffff00,
        }
      });
      indicator.addChild(text);
      
      // Add floor number label if we have a destination
      if (floorLabel) {
        const floorText = new PIXI.Text({
          text: floorLabel,
          style: {
            fontSize: 10,
            fill: 0xffffff,
            fontWeight: 'bold',
          }
        });
        floorText.x = 16;
        floorText.y = 2;
        indicator.addChild(floorText);
      }
      
      // Show queue size if more than 1
      if (queueInfo.queueSize > 1) {
        const countBg = new PIXI.Graphics();
        countBg.circle(0, 0, 8);
        countBg.fill({ color: 0xff4444, alpha: 0.9 });
        countBg.x = 12;
        countBg.y = 4;
        indicator.addChild(countBg);
        
        const countText = new PIXI.Text({
          text: `${queueInfo.queueSize}`,
          style: {
            fontSize: 10,
            fill: 0xffffff,
            fontWeight: 'bold',
          }
        });
        countText.anchor.set(0.5);
        countText.x = 12;
        countText.y = 4;
        indicator.addChild(countText);
      }
    }
    
    // Position indicator above elevator (at queue center)
    const queueCenterX = person.currentTile * RENDER_CONSTANTS.TILE_WIDTH + RENDER_CONSTANTS.TILE_WIDTH / 2;
    const y = person.currentFloor * RENDER_CONSTANTS.FLOOR_HEIGHT + RENDER_CONSTANTS.FLOOR_HEIGHT - 30;
    
    indicator.x = queueCenterX - 7;
    indicator.y = y;
  }
  
  /**
   * Clear all sprites
   */
  clear(): void {
    for (const sprite of this.sprites.values()) {
      this.container.removeChild(sprite);
      sprite.destroy();
    }
    this.sprites.clear();
    
    for (const indicator of this.waitIndicators.values()) {
      this.container.removeChild(indicator);
      indicator.destroy();
    }
    this.waitIndicators.clear();
  }
  
  /**
   * Destroy renderer
   */
  destroy(): void {
    this.clear();
  }
}
