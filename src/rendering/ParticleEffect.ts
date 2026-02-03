/**
 * Enhanced particle effect system for visual polish
 * 
 * Makes actions feel SATISFYING with juicy visual feedback!
 */

import * as PIXI from 'pixi.js';

export interface Particle {
  sprite: PIXI.Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  rotation?: number;
  rotationSpeed?: number;
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
      sprite.circle(0, 0, 3 + Math.random() * 2);
      sprite.fill({ color, alpha: 0.9 });
      
      this.container.addChild(sprite);
      
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 3;
      
      this.particles.push({
        sprite,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // Upward bias
        life: 30 + Math.random() * 15,
        maxLife: 45,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
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
      
      const offsetX = (Math.random() - 0.5) * 30;
      const offsetY = (Math.random() - 0.5) * 30;
      
      this.particles.push({
        sprite,
        vx: 0,
        vy: -0.8,
        life: 20 + Math.random() * 15,
        maxLife: 35,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
      });
      
      sprite.x = x + offsetX;
      sprite.y = y + offsetY;
    }
  }
  
  /**
   * Create construction dust cloud
   */
  createConstructionDust(x: number, y: number, width: number): void {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const sprite = new PIXI.Graphics();
      const size = 4 + Math.random() * 6;
      sprite.circle(0, 0, size);
      sprite.fill({ color: 0xcccccc, alpha: 0.6 });
      
      this.container.addChild(sprite);
      
      const offsetX = (Math.random() - 0.5) * width;
      const spread = 3 + Math.random() * 2;
      
      this.particles.push({
        sprite,
        vx: (Math.random() - 0.5) * spread,
        vy: -(Math.random() * 2 + 1),
        life: 40 + Math.random() * 20,
        maxLife: 60,
      });
      
      sprite.x = x + offsetX;
      sprite.y = y;
    }
  }
  
  /**
   * Create demolition debris
   */
  createDebris(x: number, y: number, width: number, height: number): void {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const sprite = new PIXI.Graphics();
      const size = 3 + Math.random() * 5;
      
      // Random debris shapes
      if (Math.random() > 0.5) {
        sprite.rect(-size/2, -size/2, size, size);
      } else {
        sprite.poly([
          { x: 0, y: -size },
          { x: size, y: size/2 },
          { x: -size/2, y: size },
        ]);
      }
      
      sprite.fill({ color: 0x8B7355, alpha: 0.8 });
      
      this.container.addChild(sprite);
      
      const offsetX = (Math.random() - 0.5) * width;
      const offsetY = (Math.random() - 0.5) * height;
      const speed = 3 + Math.random() * 4;
      const angle = Math.random() * Math.PI * 2;
      
      this.particles.push({
        sprite,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 40 + Math.random() * 20,
        maxLife: 60,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
      });
      
      sprite.x = x + offsetX;
      sprite.y = y + offsetY;
    }
  }
  
  /**
   * Create money coins burst (visual satisfaction!)
   */
  createMoneyBurst(x: number, y: number, amount: number): void {
    const count = Math.min(10, Math.max(3, Math.floor(amount / 1000)));
    
    for (let i = 0; i < count; i++) {
      const sprite = new PIXI.Graphics();
      
      // Draw coin shape
      sprite.circle(0, 0, 6);
      sprite.fill({ color: 0xffd700 });
      sprite.circle(0, 0, 4);
      sprite.fill({ color: 0xffed4e });
      
      this.container.addChild(sprite);
      
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 2;
      
      this.particles.push({
        sprite,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        life: 50 + Math.random() * 20,
        maxLife: 70,
        rotation: 0,
        rotationSpeed: 0.2,
      });
      
      sprite.x = x;
      sprite.y = y;
    }
  }
  
  /**
   * Create star rating celebration effect
   */
  createStarCelebration(x: number, y: number): void {
    // Large starburst
    for (let i = 0; i < 20; i++) {
      const sprite = new PIXI.Graphics();
      sprite.star(0, 0, 5, 3);
      sprite.fill({ color: 0xffd700, alpha: 0.9 });
      
      this.container.addChild(sprite);
      
      const angle = (Math.PI * 2 * i) / 20;
      const speed = 3 + Math.random() * 3;
      
      this.particles.push({
        sprite,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 60 + Math.random() * 20,
        maxLife: 80,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      });
      
      sprite.x = x;
      sprite.y = y;
    }
  }
  
  /**
   * Create income flash effect (green highlight)
   * Subtle visual feedback when buildings earn money
   */
  createIncomeFlash(x: number, y: number, width: number, height: number): void {
    // Create a rectangular flash overlay
    const sprite = new PIXI.Graphics();
    sprite.rect(-width / 2, -height / 2, width, height);
    sprite.fill({ color: 0x00ff00, alpha: 0.3 });
    
    this.container.addChild(sprite);
    
    this.particles.push({
      sprite,
      vx: 0,
      vy: 0,
      life: 20, // Quick flash
      maxLife: 20,
    });
    
    sprite.x = x;
    sprite.y = y;
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
      
      // Apply gravity
      particle.vy += 0.15;
      
      // Apply friction to horizontal movement
      particle.vx *= 0.98;
      
      // Rotation
      if (particle.rotation !== undefined && particle.rotationSpeed !== undefined) {
        particle.rotation += particle.rotationSpeed;
        particle.sprite.rotation = particle.rotation;
      }
      
      // Fade out
      const lifeRatio = particle.life / particle.maxLife;
      particle.sprite.alpha = Math.pow(lifeRatio, 0.5); // Slower fade initially
      
      // Shrink slightly
      const scale = 0.5 + 0.5 * lifeRatio;
      particle.sprite.scale.set(scale);
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
