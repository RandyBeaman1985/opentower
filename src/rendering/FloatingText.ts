/**
 * FloatingText - Satisfying floating text effects
 * 
 * Shows money gained, notifications, and other feedback as floating text
 * that animates upward and fades out.
 * 
 * Makes money feel GOOD to earn!
 */

import * as PIXI from 'pixi.js';

export interface FloatingTextOptions {
  text: string;
  x: number;
  y: number;
  color?: number;
  fontSize?: number;
  duration?: number; // milliseconds
  velocityY?: number;
  bold?: boolean;
}

interface ActiveText {
  container: PIXI.Container;
  text: PIXI.Text;
  startTime: number;
  duration: number;
  startY: number;
  velocityY: number;
}

export class FloatingTextSystem {
  private container: PIXI.Container;
  private activeTexts: ActiveText[] = [];
  
  constructor(container: PIXI.Container) {
    this.container = container;
  }
  
  /**
   * Create floating text effect
   */
  create(options: FloatingTextOptions): void {
    const {
      text,
      x,
      y,
      color = 0x00ff00,
      fontSize = 24,
      duration = 2000,
      velocityY = -0.5,
      bold = true,
    } = options;
    
    // Create container for this text
    const textContainer = new PIXI.Container();
    
    // Create text with outline for visibility
    const textSprite = new PIXI.Text({
      text,
      style: {
        fontSize,
        fill: color,
        fontWeight: bold ? 'bold' : 'normal',
        stroke: { color: 0x000000, width: 3 },
        dropShadow: {
          alpha: 0.5,
          angle: 45,
          blur: 2,
          distance: 2,
        },
      },
    });
    
    textSprite.anchor.set(0.5, 0.5);
    textContainer.addChild(textSprite);
    
    // Add to scene
    this.container.addChild(textContainer);
    textContainer.x = x;
    textContainer.y = y;
    
    // Track active text
    this.activeTexts.push({
      container: textContainer,
      text: textSprite,
      startTime: Date.now(),
      duration,
      startY: y,
      velocityY,
    });
    
    // Initial scale animation (pop in)
    textContainer.scale.set(0.5);
  }
  
  /**
   * Create money popup (+$1000 style)
   */
  createMoneyPopup(amount: number, x: number, y: number): void {
    const prefix = amount >= 0 ? '+' : '';
    this.create({
      text: `${prefix}$${Math.abs(amount).toLocaleString()}`,
      x,
      y,
      color: amount >= 0 ? 0x00ff00 : 0xff0000,
      fontSize: 20,
      duration: 2000,
      velocityY: -0.8,
      bold: true,
    });
  }
  
  /**
   * Create notification popup
   */
  createNotification(text: string, x: number, y: number, type: 'info' | 'warning' | 'success' | 'error' = 'info'): void {
    const colors = {
      info: 0x4488ff,
      warning: 0xffaa00,
      success: 0x00ff00,
      error: 0xff0000,
    };
    
    this.create({
      text,
      x,
      y,
      color: colors[type],
      fontSize: 16,
      duration: 3000,
      velocityY: -0.3,
      bold: false,
    });
  }
  
  /**
   * Create star rating up notification
   */
  createStarRatingUp(stars: number, x: number, y: number): void {
    const starText = '★'.repeat(stars);
    this.create({
      text: `${starText} ${stars} STAR TOWER!`,
      x,
      y,
      color: 0xffd700,
      fontSize: 32,
      duration: 3000,
      velocityY: -0.4,
      bold: true,
    });
  }
  
  /**
   * Update all floating texts
   */
  update(): void {
    const now = Date.now();
    
    for (let i = this.activeTexts.length - 1; i >= 0; i--) {
      const item = this.activeTexts[i];
      if (!item) continue;
      
      const elapsed = now - item.startTime;
      const progress = elapsed / item.duration;
      
      // Remove expired texts
      if (progress >= 1) {
        this.container.removeChild(item.container);
        item.container.destroy();
        this.activeTexts.splice(i, 1);
        continue;
      }
      
      // Animate
      
      // Scale: Pop in during first 10%, then stay
      if (progress < 0.1) {
        const scaleProgress = progress / 0.1;
        const scale = 0.5 + 0.5 * this.easeOutBack(scaleProgress);
        item.container.scale.set(scale);
      } else {
        item.container.scale.set(1);
      }
      
      // Move upward
      item.container.y = item.startY + item.velocityY * elapsed;
      
      // Fade out in last 30%
      if (progress > 0.7) {
        const fadeProgress = (progress - 0.7) / 0.3;
        item.container.alpha = 1 - fadeProgress;
      }
    }
  }
  
  /**
   * Easing function for pop-in effect
   */
  private easeOutBack(x: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }
  
  /**
   * Clear all floating texts
   */
  clear(): void {
    for (const item of this.activeTexts) {
      this.container.removeChild(item.container);
      item.container.destroy();
    }
    this.activeTexts = [];
  }
  
  /**
   * Destroy system
   */
  destroy(): void {
    this.clear();
  }
}
