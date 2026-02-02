/**
 * Simulation Effects Renderer - Make the simulation VISIBLE and ALIVE
 * 
 * Adds visual polish to show what's happening:
 * - Mood indicators above people
 * - Rush hour visual effects
 * - Satisfaction particles
 * - Stress clouds
 * - Occupancy indicators on buildings
 * 
 * This makes invisible simulation state DRAMATICALLY VISIBLE.
 * 
 * @module rendering/SimulationEffectsRenderer
 */

import * as PIXI from 'pixi.js';
import type { Person } from '@/entities/Person';
import type { Building } from '@/interfaces';
import type { PersonAIData } from '@/simulation/PopulationAI';
import { RENDER_CONSTANTS } from './TowerRenderer';
import { BUILDING_CONFIGS } from '@/interfaces/buildings';

/**
 * Mood icon above person's head
 */
interface MoodIndicator {
  personId: string;
  icon: string;
  color: number;
  lifetime: number; // ticks remaining
}

/**
 * Building occupancy indicator
 */
interface OccupancyIndicator {
  buildingId: string;
  sprite: PIXI.Container;
}

/**
 * SimulationEffectsRenderer - Visual feedback for simulation state
 */
export class SimulationEffectsRenderer {
  private container: PIXI.Container;
  
  // Mood indicators
  private moodSprites: Map<string, PIXI.Container> = new Map();
  private activeMoods: Map<string, MoodIndicator> = new Map();
  
  // Occupancy indicators
  private occupancySprites: Map<string, PIXI.Container> = new Map();
  
  // Particle effects
  private happyParticles: PIXI.Container;
  private stressParticles: PIXI.Container;
  private rushHourEffects: PIXI.Container;
  
  constructor(container: PIXI.Container) {
    this.container = container;
    
    // Create particle containers
    this.happyParticles = new PIXI.Container();
    this.stressParticles = new PIXI.Container();
    this.rushHourEffects = new PIXI.Container();
    
    this.container.addChild(this.rushHourEffects); // Behind everything
    this.container.addChild(this.stressParticles);
    this.container.addChild(this.happyParticles);
  }
  
  /**
   * Update and render all effects
   */
  update(
    people: Person[],
    buildings: Building[],
    aiData: Map<string, PersonAIData>,
    rushHourState: 'morning' | 'lunch' | 'evening' | 'normal',
    timeOfDay: { hour: number; minute: number }
  ): void {
    // Render mood indicators for people
    this.updateMoodIndicators(people, aiData);
    
    // Render occupancy indicators for buildings
    this.updateOccupancyIndicators(buildings);
    
    // Render rush hour effects
    this.updateRushHourEffects(rushHourState);
    
    // Update particle effects
    this.updateParticles();
  }
  
  /**
   * Update mood indicators above people's heads
   */
  private updateMoodIndicators(people: Person[], aiData: Map<string, PersonAIData>): void {
    // Remove old sprites for people who no longer exist
    for (const [personId, sprite] of this.moodSprites) {
      if (!people.find(p => p.id === personId)) {
        this.container.removeChild(sprite);
        sprite.destroy();
        this.moodSprites.delete(personId);
        this.activeMoods.delete(personId);
      }
    }
    
    // Update each person's mood indicator
    for (const person of people) {
      const data = aiData.get(person.id);
      if (!data) continue;
      
      // Determine mood to show based on needs and satisfaction
      const moodIcon = this.determineMoodIcon(person, data);
      
      if (moodIcon) {
        this.showMood(person, moodIcon.icon, moodIcon.color, moodIcon.duration);
      } else {
        // Clear mood if none to show
        this.clearMood(person.id);
      }
    }
    
    // Update existing mood sprites
    for (const [personId, mood] of this.activeMoods) {
      mood.lifetime--;
      
      if (mood.lifetime <= 0) {
        this.clearMood(personId);
      }
    }
  }
  
  /**
   * Determine what mood icon to show for a person
   */
  private determineMoodIcon(
    person: Person,
    data: PersonAIData
  ): { icon: string; color: number; duration: number } | null {
    const needs = data.needs;
    const satisfaction = data.satisfaction.overall;
    
    // PRIORITY 1: Critical needs (show urgently)
    if (needs.hunger < 20) {
      return { icon: '🍔', color: 0xff4444, duration: 180 };
    }
    
    if (needs.energy < 20) {
      return { icon: '😴', color: 0x8888ff, duration: 180 };
    }
    
    // PRIORITY 2: State-based emotions
    if (person.state === 'waitingForElevator' && person.stress > 50) {
      return { icon: '⏰', color: 0xffaa00, duration: 120 };
    }
    
    // PRIORITY 3: Satisfaction-based moods
    if (satisfaction > 80) {
      // Happy!
      if (Math.random() < 0.05) { // 5% chance to show happiness
        return { icon: '😊', color: 0x44ff44, duration: 120 };
      }
    } else if (satisfaction < 40) {
      // Unhappy
      if (Math.random() < 0.1) { // 10% chance to show frustration
        return { icon: '😤', color: 0xff4444, duration: 180 };
      }
    }
    
    // PRIORITY 4: Goal-based indicators
    if (data.currentGoal === 'eat' && needs.hunger < 50) {
      return { icon: '🍽️', color: 0xffcc44, duration: 120 };
    }
    
    if (data.currentGoal === 'rest') {
      return { icon: '🏠', color: 0x88ccff, duration: 120 };
    }
    
    return null;
  }
  
  /**
   * Show a mood indicator above person
   */
  private showMood(person: Person, icon: string, color: number, duration: number): void {
    let sprite = this.moodSprites.get(person.id);
    
    if (!sprite) {
      sprite = new PIXI.Container();
      this.container.addChild(sprite);
      this.moodSprites.set(person.id, sprite);
    }
    
    // Clear and rebuild
    sprite.removeChildren();
    
    // Background circle
    const bg = new PIXI.Graphics();
    bg.circle(0, 0, 12);
    bg.fill({ color: 0x000000, alpha: 0.6 });
    sprite.addChild(bg);
    
    // Emoji/icon
    const text = new PIXI.Text({
      text: icon,
      style: {
        fontSize: 16,
      },
    });
    text.anchor.set(0.5);
    sprite.addChild(text);
    
    // Position above person
    const x = person.currentTile * RENDER_CONSTANTS.TILE_WIDTH + RENDER_CONSTANTS.TILE_WIDTH / 2;
    const y = person.currentFloor * RENDER_CONSTANTS.FLOOR_HEIGHT + RENDER_CONSTANTS.FLOOR_HEIGHT - 35;
    
    sprite.x = x;
    sprite.y = y;
    
    // Bobbing animation
    const time = Date.now() * 0.003;
    const bob = Math.sin(time + person.id.charCodeAt(0)) * 3;
    sprite.y += bob;
    
    // Store mood
    this.activeMoods.set(person.id, {
      personId: person.id,
      icon,
      color,
      lifetime: duration,
    });
  }
  
  /**
   * Clear mood indicator for person
   */
  private clearMood(personId: string): void {
    const sprite = this.moodSprites.get(personId);
    if (sprite) {
      this.container.removeChild(sprite);
      sprite.destroy();
      this.moodSprites.delete(personId);
    }
    this.activeMoods.delete(personId);
  }
  
  /**
   * Update occupancy indicators on buildings
   */
  private updateOccupancyIndicators(buildings: Building[]): void {
    // Remove old sprites for buildings that no longer exist
    for (const [buildingId, sprite] of this.occupancySprites) {
      if (!buildings.find(b => b.id === buildingId)) {
        this.container.removeChild(sprite);
        sprite.destroy();
        this.occupancySprites.delete(buildingId);
      }
    }
    
    // Update each building
    for (const building of buildings) {
      // Only show occupancy for buildings with people
      if (!building.occupantIds || building.occupantIds.length === 0) {
        // Clear indicator
        const sprite = this.occupancySprites.get(building.id);
        if (sprite) {
          this.container.removeChild(sprite);
          sprite.destroy();
          this.occupancySprites.delete(building.id);
        }
        continue;
      }
      
      this.showOccupancy(building);
    }
  }
  
  /**
   * Show occupancy indicator on building
   */
  private showOccupancy(building: Building): void {
    let sprite = this.occupancySprites.get(building.id);
    
    if (!sprite) {
      sprite = new PIXI.Container();
      this.container.addChild(sprite);
      this.occupancySprites.set(building.id, sprite);
    }
    
    // Clear and rebuild
    sprite.removeChildren();
    
    const occupancy = building.occupantIds.length;
    const maxOccupancy = BUILDING_CONFIGS[building.type].capacity || 10;
    const occupancyPercent = Math.min(1, occupancy / maxOccupancy);
    
    // Background bar
    const barWidth = 40;
    const barHeight = 6;
    
    const bg = new PIXI.Graphics();
    bg.rect(0, 0, barWidth, barHeight);
    bg.fill({ color: 0x000000, alpha: 0.5 });
    sprite.addChild(bg);
    
    // Fill bar (color-coded by occupancy)
    let fillColor = 0x44ff44; // Green
    if (occupancyPercent > 0.8) {
      fillColor = 0xff4444; // Red (crowded)
    } else if (occupancyPercent > 0.6) {
      fillColor = 0xffaa00; // Orange (getting full)
    }
    
    const fill = new PIXI.Graphics();
    fill.rect(0, 0, barWidth * occupancyPercent, barHeight);
    fill.fill({ color: fillColor, alpha: 0.8 });
    sprite.addChild(fill);
    
    // Count text
    const text = new PIXI.Text({
      text: `${occupancy}`,
      style: {
        fontSize: 8,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    text.anchor.set(0.5);
    text.x = barWidth / 2;
    text.y = barHeight / 2;
    sprite.addChild(text);
    
    // Position at top-right of building
    const x = (building.position.startTile + building.width - 3) * RENDER_CONSTANTS.TILE_WIDTH;
    const y = building.position.floor * RENDER_CONSTANTS.FLOOR_HEIGHT + 5;
    
    sprite.x = x;
    sprite.y = y;
  }
  
  /**
   * Update rush hour effects (visual indicators)
   */
  private updateRushHourEffects(state: 'morning' | 'lunch' | 'evening' | 'normal'): void {
    this.rushHourEffects.removeChildren();
    
    if (state === 'normal') return;
    
    // Show dramatic rush hour indicator
    const text = new PIXI.Text({
      text: this.getRushHourLabel(state),
      style: {
        fontSize: 24,
        fill: 0xffaa00,
        fontWeight: 'bold',
        dropShadow: {
          alpha: 0.8,
          blur: 4,
          color: 0x000000,
          distance: 2,
        },
      },
    });
    text.anchor.set(0.5);
    text.x = 100;
    text.y = 50;
    
    // Pulsing animation
    const time = Date.now() * 0.003;
    const pulse = 1 + Math.sin(time) * 0.1;
    text.scale.set(pulse);
    
    this.rushHourEffects.addChild(text);
  }
  
  /**
   * Get rush hour label
   */
  private getRushHourLabel(state: 'morning' | 'lunch' | 'evening' | 'normal'): string {
    switch (state) {
      case 'morning':
        return '🌅 MORNING RUSH';
      case 'lunch':
        return '🍔 LUNCH RUSH';
      case 'evening':
        return '🌆 EVENING RUSH';
      default:
        return '';
    }
  }
  
  /**
   * Update particle effects
   */
  private updateParticles(): void {
    // Fade out and remove old particles
    for (const child of this.happyParticles.children) {
      child.alpha -= 0.02;
      if (child.alpha <= 0) {
        this.happyParticles.removeChild(child);
        child.destroy();
      }
    }
    
    for (const child of this.stressParticles.children) {
      child.alpha -= 0.02;
      if (child.alpha <= 0) {
        this.stressParticles.removeChild(child);
        child.destroy();
      }
    }
  }
  
  /**
   * Create happy particles at location (when people are satisfied)
   */
  createHappyParticles(x: number, y: number, count: number = 3): void {
    for (let i = 0; i < count; i++) {
      const particle = new PIXI.Graphics();
      particle.circle(0, 0, 2 + Math.random() * 2);
      particle.fill({ color: 0x44ff44, alpha: 0.8 });
      
      particle.x = x + (Math.random() - 0.5) * 20;
      particle.y = y + (Math.random() - 0.5) * 20;
      
      this.happyParticles.addChild(particle);
    }
  }
  
  /**
   * Create stress particles at location (when people are stressed)
   */
  createStressParticles(x: number, y: number, count: number = 5): void {
    for (let i = 0; i < count; i++) {
      const particle = new PIXI.Graphics();
      particle.rect(-2, -2, 4, 4);
      particle.fill({ color: 0xff4444, alpha: 0.6 });
      
      particle.x = x + (Math.random() - 0.5) * 15;
      particle.y = y + (Math.random() - 0.5) * 15;
      particle.rotation = Math.random() * Math.PI * 2;
      
      this.stressParticles.addChild(particle);
    }
  }
  
  /**
   * Clear all effects
   */
  clear(): void {
    for (const sprite of this.moodSprites.values()) {
      this.container.removeChild(sprite);
      sprite.destroy();
    }
    this.moodSprites.clear();
    this.activeMoods.clear();
    
    for (const sprite of this.occupancySprites.values()) {
      this.container.removeChild(sprite);
      sprite.destroy();
    }
    this.occupancySprites.clear();
    
    this.happyParticles.removeChildren();
    this.stressParticles.removeChildren();
    this.rushHourEffects.removeChildren();
  }
  
  /**
   * Destroy renderer
   */
  destroy(): void {
    this.clear();
    this.container.removeChild(this.happyParticles);
    this.container.removeChild(this.stressParticles);
    this.container.removeChild(this.rushHourEffects);
    this.happyParticles.destroy();
    this.stressParticles.destroy();
    this.rushHourEffects.destroy();
  }
}
