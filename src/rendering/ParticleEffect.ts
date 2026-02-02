/**
 * Simple particle effect system for visual polish
 */

import * as PIXI from 'pixi.js';

export interface Particle {
  sprite: PIXI.Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export class ParticleEffect {
  private container: PIXI.Container;
  private particles: Particle[] = [];
  
  constructor(container: PIXI.Container) {
    this.container = container;
  }
  
  /**
   * Create a burst of particles at a position
   */
  createBurst(x: number, y: number, count: number = 5, color: number = 0xffff00): void {
    for (let i = 0; i < count; i++) {
      const sprite = new PIXI.Graphics();
      sprite.circle(0, 0, 2);
      sprite.fill({ color, alpha: 0.8 });
      
      this.container.addChild(sprite);
      
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 2;
      
      this.particles.push({
        sprite,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30,
        maxLife: 30,
      });
      
      sprite.x = x;
      sprite.y = y;
    }
  }
  
  /**
   * Create sparkles around a point
   */
  createSparkles(x: number, y: number, count: number = 3): void {
    for (let i = 0; i < count; i++) {
      const sprite = new PIXI.Graphics();
      sprite.star(0, 0, 4, 2);
      sprite.fill({ color: 0xffff00, alpha: 0.9 });
      
      this.container.addChild(sprite);
      
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetY = (Math.random() - 0.5) * 20;
      
      this.particles.push({
        sprite,
        vx: 0,
        vy: -0.5,
        life: 20 + Math.random() * 10,
        maxLife: 30,
      });
      
      sprite.x = x + offsetX;
      sprite.y = y + offsetY;
    }
  }
  
  /**
   * Update all particles
   */
  update(): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      if (!particle) continue;
      
      particle.life--;
      
      if (particle.life <= 0) {
        this.container.removeChild(particle.sprite);
        particle.sprite.destroy();
        this.particles.splice(i, 1);
        continue;
      }
      
      // Update position
      particle.sprite.x += particle.vx;
      particle.sprite.y += particle.vy;
      
      // Apply gravity for burst particles
      if (particle.vx !== 0) {
        particle.vy += 0.1;
      }
      
      // Fade out
      const lifeRatio = particle.life / particle.maxLife;
      particle.sprite.alpha = lifeRatio;
      
      // Shrink
      particle.sprite.scale.set(lifeRatio);
    }
  }
  
  /**
   * Clear all particles
   */
  clear(): void {
    for (const particle of this.particles) {
      this.container.removeChild(particle.sprite);
      particle.sprite.destroy();
    }
    this.particles = [];
  }
  
  /**
   * Destroy effect system
   */
  destroy(): void {
    this.clear();
  }
}
