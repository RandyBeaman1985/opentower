/**
 * GameFeelManager - Orchestrates all juice and polish
 * 
 * This is what makes OpenTower FEEL GOOD to play!
 * Coordinates particles, sounds, floating text, and animations.
 * 
 * @module core/GameFeelManager
 */

import { getSoundManager } from '../audio/SoundManager';
import { ParticleEffect } from '../rendering/ParticleEffect';
import { FloatingTextSystem } from '../rendering/FloatingText';
import type { Building } from '@/interfaces';
import { RENDER_CONSTANTS } from '../rendering/TowerRenderer';
import { BUILDING_CONFIGS } from '@/interfaces/buildings';
import type { Camera } from '../rendering/Camera';

export class GameFeelManager {
  private particleEffect: ParticleEffect;
  private floatingText: FloatingTextSystem;
  private camera: Camera | null = null;
  
  constructor(particleEffect: ParticleEffect, floatingText: FloatingTextSystem, camera?: Camera) {
    this.particleEffect = particleEffect;
    this.floatingText = floatingText;
    this.camera = camera || null;
  }

  /**
   * Set camera for screen settle effects
   */
  setCamera(camera: Camera): void {
    this.camera = camera;
  }
  
  /**
   * Building placed feedback
   */
  onBuildingPlaced(building: Building): void {
    // Calculate world position
    const x = (building.position.startTile + (building.position.endTile - building.position.startTile) / 2) * RENDER_CONSTANTS.TILE_WIDTH;
    const y = building.position.floor * RENDER_CONSTANTS.FLOOR_HEIGHT + RENDER_CONSTANTS.FLOOR_HEIGHT / 2;
    
    // Sound
    getSoundManager().playBuildingPlaced();
    
    // Particle effects
    const width = (building.position.endTile - building.position.startTile + 1) * RENDER_CONSTANTS.TILE_WIDTH;
    this.particleEffect.createConstructionDust(x, y, width);
    this.particleEffect.createSparkles(x, y, 5);
    
    // Screen settle effect (subtle drop/settle)
    if (this.camera) {
      const intensity = Math.min(1.5, building.height * 0.3); // Bigger buildings = bigger settle
      this.camera.applySettle(intensity);
    }
    
    // Floating text showing cost
    const cost = BUILDING_CONFIGS[building.type].cost;
    if (cost > 0) {
      this.floatingText.create({
        text: `-$${cost.toLocaleString()}`,
        x,
        y: y - 20,
        color: 0xff8800,
        fontSize: 16,
        duration: 1500,
        velocityY: -0.6,
      });
    }
  }
  
  /**
   * Building demolished feedback
   */
  onBuildingDemolished(building: Building): void {
    const x = (building.position.startTile + (building.position.endTile - building.position.startTile) / 2) * RENDER_CONSTANTS.TILE_WIDTH;
    const y = building.position.floor * RENDER_CONSTANTS.FLOOR_HEIGHT + RENDER_CONSTANTS.FLOOR_HEIGHT / 2;
    const width = (building.position.endTile - building.position.startTile + 1) * RENDER_CONSTANTS.TILE_WIDTH;
    const height = building.height * RENDER_CONSTANTS.FLOOR_HEIGHT;
    
    // Sound
    getSoundManager().playDemolish();
    
    // Heavy debris effect
    this.particleEffect.createDebris(x, y, width, height);
  }
  
  /**
   * Money earned feedback
   */
  onMoneyEarned(amount: number, x: number, y: number): void {
    // Sound
    if (amount >= 1000) {
      getSoundManager().playCashRegister();
    }
    
    // Particle burst with coins
    if (amount >= 5000) {
      this.particleEffect.createMoneyBurst(x, y, amount);
    }
    
    // Floating text
    this.floatingText.createMoneyPopup(amount, x, y);
  }
  
  /**
   * Quarterly income collected feedback
   */
  onQuarterlyIncome(totalIncome: number, towerCenterX: number, towerCenterY: number): void {
    // Big money burst at tower center
    if (totalIncome > 0) {
      // Extra burst for large incomes
      const burstCount = totalIncome > 50000 ? 3 : totalIncome > 10000 ? 2 : 1;
      
      for (let i = 0; i < burstCount; i++) {
        setTimeout(() => {
          this.particleEffect.createMoneyBurst(towerCenterX, towerCenterY, totalIncome);
          
          // Sparkles around the money
          const offsetX = (Math.random() - 0.5) * 100;
          const offsetY = (Math.random() - 0.5) * 60;
          this.particleEffect.createSparkles(
            towerCenterX + offsetX,
            towerCenterY + offsetY,
            6
          );
        }, i * 150);
      }
      
      // Show total quarterly income
      this.floatingText.create({
        text: `+$${totalIncome.toLocaleString()}`,
        x: towerCenterX,
        y: towerCenterY - 30,
        color: 0x00ff00,
        fontSize: 28,
        duration: 2500,
        velocityY: -0.5,
        bold: true,
      });
      
      // Subtle screen settle for big paydays
      if (this.camera && totalIncome > 10000) {
        this.camera.applySettle(0.8);
      }
    }
  }
  
  /**
   * Star rating increased feedback
   */
  onStarRatingUp(newStars: number, screenCenterX: number, screenCenterY: number): void {
    // Sound
    getSoundManager().playStarRatingUp();
    
    // Massive celebration effect
    this.particleEffect.createStarCelebration(screenCenterX, screenCenterY);
    
    // Floating text
    this.floatingText.createStarRatingUp(newStars, screenCenterX, screenCenterY - 50);
    
    // Additional bursts around the screen
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const offsetX = (Math.random() - 0.5) * 200;
        const offsetY = (Math.random() - 0.5) * 150;
        this.particleEffect.createSparkles(
          screenCenterX + offsetX,
          screenCenterY + offsetY,
          8
        );
      }, i * 200);
    }
  }
  
  /**
   * Elevator ding feedback
   */
  onElevatorArrival(x: number, y: number): void {
    // Sound (played in ElevatorSystem)
    
    // Small sparkle effect
    this.particleEffect.createSparkles(x, y, 2);
  }
  
  /**
   * Person stress warning
   */
  onPersonStressed(x: number, y: number, stressLevel: 'medium' | 'high' | 'critical'): void {
    const colors = {
      medium: 0xffaa00,
      high: 0xff4400,
      critical: 0xff0000,
    };
    
    // Small burst to show frustration
    this.particleEffect.createBurst(x, y, 3, colors[stressLevel]);
  }
  
  /**
   * Building income notification (for offices/shops)
   */
  onBuildingIncome(building: Building, income: number): void {
    const x = (building.position.startTile + (building.position.endTile - building.position.startTile) / 2) * RENDER_CONSTANTS.TILE_WIDTH;
    const y = building.position.floor * RENDER_CONSTANTS.FLOOR_HEIGHT + RENDER_CONSTANTS.FLOOR_HEIGHT / 2;
    
    if (income > 0) {
      // Floating money text
      this.floatingText.createMoneyPopup(income, x, y);
      
      // Green flash on building
      const width = (building.position.endTile - building.position.startTile + 1) * RENDER_CONSTANTS.TILE_WIDTH;
      const height = building.height * RENDER_CONSTANTS.FLOOR_HEIGHT;
      this.particleEffect.createIncomeFlash(x, y, width, height);
    }
  }
  
  /**
   * Tenant departed warning
   */
  onTenantDeparted(building: Building): void {
    const x = (building.position.startTile + (building.position.endTile - building.position.startTile) / 2) * RENDER_CONSTANTS.TILE_WIDTH;
    const y = building.position.floor * RENDER_CONSTANTS.FLOOR_HEIGHT;
    
    // Sound
    getSoundManager().playWarning();
    
    // Warning effect
    this.floatingText.createNotification('Tenant Left!', x, y, 'error');
    this.particleEffect.createBurst(x, y, 5, 0xff0000);
  }
  
  /**
   * Generic notification
   */
  notify(message: string, x: number, y: number, type: 'info' | 'warning' | 'success' | 'error' = 'info'): void {
    this.floatingText.createNotification(message, x, y, type);
    
    if (type === 'success') {
      this.particleEffect.createSparkles(x, y, 3);
    } else if (type === 'error' || type === 'warning') {
      getSoundManager().playWarning();
    }
  }
  
  /**
   * Update all effects
   */
  update(): void {
    this.particleEffect.update();
    this.floatingText.update();
  }
  
  /**
   * Clear all effects
   */
  clear(): void {
    this.particleEffect.clear();
    this.floatingText.clear();
  }
  
  /**
   * Destroy manager
   */
  destroy(): void {
    this.particleEffect.destroy();
    this.floatingText.destroy();
  }
}
