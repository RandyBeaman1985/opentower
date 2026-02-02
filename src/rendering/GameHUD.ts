/**
 * GameHUD - In-game heads-up display
 * 
 * Shows:
 * - Money counter (animated!)
 * - Star rating (clear and satisfying)
 * - Population
 * - Date/Time
 * - Quick stats
 * 
 * Makes progression FEEL good!
 */

import * as PIXI from 'pixi.js';
import type { Tower } from '@/interfaces';

export class GameHUD {
  private container: PIXI.Container;
  private moneyText: PIXI.Text;
  private populationText: PIXI.Text;
  private dateText: PIXI.Text;
  private starContainer: PIXI.Container;
  private progressBar: PIXI.Graphics;
  private progressBarBg: PIXI.Graphics;
  private progressText: PIXI.Text;
  
  // Animated money display
  private displayedMoney: number = 0;
  private targetMoney: number = 0;
  
  // Star rating
  private currentStars: number = 1;
  private starSprites: PIXI.Text[] = [];
  
  constructor(container: PIXI.Container) {
    this.container = container;
    
    // Create HUD background panel
    const panelBg = new PIXI.Graphics();
    panelBg.rect(10, 10, 400, 120);
    panelBg.fill({ color: 0x000000, alpha: 0.7 });
    panelBg.setStrokeStyle({ width: 2, color: 0x444444 });
    panelBg.stroke();
    this.container.addChild(panelBg);
    
    // Money display (BIG and prominent)
    this.moneyText = new PIXI.Text({
      text: '$0',
      style: {
        fontSize: 32,
        fill: 0x00ff00,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 2 },
      },
    });
    this.moneyText.x = 20;
    this.moneyText.y = 20;
    this.container.addChild(this.moneyText);
    
    // Population display
    this.populationText = new PIXI.Text({
      text: 'Pop: 0',
      style: {
        fontSize: 18,
        fill: 0xffffff,
        fontWeight: 'bold',
      },
    });
    this.populationText.x = 20;
    this.populationText.y = 60;
    this.container.addChild(this.populationText);
    
    // Date display
    this.dateText = new PIXI.Text({
      text: 'Day 1',
      style: {
        fontSize: 18,
        fill: 0xcccccc,
      },
    });
    this.dateText.x = 20;
    this.dateText.y = 90;
    this.container.addChild(this.dateText);
    
    // Star rating display (right side of panel)
    this.starContainer = new PIXI.Container();
    this.starContainer.x = 250;
    this.starContainer.y = 30;
    this.container.addChild(this.starContainer);
    
    this.initStarDisplay();
    
    // Progress bar (shows progress to next star)
    this.progressBarBg = new PIXI.Graphics();
    this.progressBarBg.rect(20, 118, 360, 8);
    this.progressBarBg.fill({ color: 0x333333 });
    this.container.addChild(this.progressBarBg);
    
    this.progressBar = new PIXI.Graphics();
    this.container.addChild(this.progressBar);
    
    this.progressText = new PIXI.Text({
      text: '',
      style: {
        fontSize: 12,
        fill: 0xffffff,
      },
    });
    this.progressText.x = 25;
    this.progressText.y = 108;
    this.container.addChild(this.progressText);
  }
  
  /**
   * Initialize star display
   */
  private initStarDisplay(): void {
    const maxStars = 5;
    
    for (let i = 0; i < maxStars; i++) {
      const star = new PIXI.Text({
        text: '★',
        style: {
          fontSize: 28,
          fill: 0x444444, // Dark/empty initially
        },
      });
      star.x = i * 30;
      star.y = 0;
      this.starContainer.addChild(star);
      this.starSprites.push(star);
    }
  }
  
  /**
   * Update HUD display
   */
  update(tower: Tower, date: string, stars: number, nextStarRequirement?: { current: number; required: number; label: string }): void {
    // Animate money counter
    this.targetMoney = tower.funds;
    if (Math.abs(this.displayedMoney - this.targetMoney) > 1) {
      const diff = this.targetMoney - this.displayedMoney;
      this.displayedMoney += diff * 0.1; // Smooth interpolation
      
      // Wiggle effect when money changes significantly
      if (Math.abs(diff) > 1000) {
        const wiggle = Math.sin(Date.now() * 0.02) * 2;
        this.moneyText.rotation = wiggle * 0.02;
        this.moneyText.scale.set(1 + Math.abs(wiggle) * 0.01);
      } else {
        this.moneyText.rotation = 0;
        this.moneyText.scale.set(1);
      }
    } else {
      this.displayedMoney = this.targetMoney;
      this.moneyText.rotation = 0;
      this.moneyText.scale.set(1);
    }
    
    // Update money text with color based on amount
    const moneyColor = this.displayedMoney >= 0 ? 0x00ff00 : 0xff4444;
    this.moneyText.style.fill = moneyColor;
    this.moneyText.text = `$${Math.floor(this.displayedMoney).toLocaleString()}`;
    
    // Update population
    this.populationText.text = `Pop: ${tower.population.toLocaleString()}`;
    
    // Update date
    this.dateText.text = date;
    
    // Update stars (with animation if changed)
    if (stars !== this.currentStars) {
      this.animateStarChange(stars);
      this.currentStars = stars;
    }
    
    // Update progress bar
    if (nextStarRequirement) {
      const progress = Math.min(1, nextStarRequirement.current / nextStarRequirement.required);
      
      this.progressBar.clear();
      this.progressBar.rect(20, 118, 360 * progress, 8);
      this.progressBar.fill({ color: 0xffd700, alpha: 0.8 });
      
      this.progressText.text = `${nextStarRequirement.label}: ${nextStarRequirement.current.toLocaleString()} / ${nextStarRequirement.required.toLocaleString()}`;
    } else {
      // Max stars reached
      this.progressBar.clear();
      this.progressText.text = '🏆 MAXIMUM RATING ACHIEVED!';
    }
  }
  
  /**
   * Animate star rating change
   */
  private animateStarChange(newStars: number): void {
    // Update star visuals
    for (let i = 0; i < this.starSprites.length; i++) {
      const star = this.starSprites[i];
      if (!star) continue;
      
      if (i < newStars) {
        // Filled star
        star.style.fill = 0xffd700; // Gold
        
        // Pop animation for newly earned stars
        if (i >= this.currentStars) {
          star.scale.set(0);
          this.animateStarPop(star);
        }
      } else {
        // Empty star
        star.style.fill = 0x444444;
      }
    }
  }
  
  /**
   * Animate single star pop-in
   */
  private animateStarPop(star: PIXI.Text): void {
    const duration = 500; // ms
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      
      if (progress < 1) {
        // Bounce scale from 0 to 1 with overshoot
        const scale = this.easeOutElastic(progress);
        star.scale.set(scale);
        
        // Rotate slightly
        star.rotation = (1 - progress) * Math.PI * 0.5;
        
        requestAnimationFrame(animate);
      } else {
        // Final state
        star.scale.set(1);
        star.rotation = 0;
      }
    };
    
    animate();
  }
  
  /**
   * Elastic easing for bouncy star animation
   */
  private easeOutElastic(x: number): number {
    const c4 = (2 * Math.PI) / 3;
    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  }
  
  /**
   * Flash money display (for income events)
   */
  flashMoney(): void {
    // Green flash effect
    const originalColor = this.moneyText.style.fill;
    this.moneyText.style.fill = 0xffff00; // Yellow flash
    
    setTimeout(() => {
      this.moneyText.style.fill = originalColor;
    }, 200);
  }
  
  /**
   * Show temporary message on HUD
   */
  showMessage(message: string, duration: number = 3000): void {
    const msgText = new PIXI.Text({
      text: message,
      style: {
        fontSize: 20,
        fill: 0xffffff,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 3 },
        align: 'center',
      },
    });
    
    msgText.anchor.set(0.5);
    msgText.x = 210;
    msgText.y = -30; // Above HUD panel
    this.container.addChild(msgText);
    
    // Fade out and remove
    setTimeout(() => {
      const fadeOut = () => {
        msgText.alpha -= 0.05;
        if (msgText.alpha > 0) {
          requestAnimationFrame(fadeOut);
        } else {
          this.container.removeChild(msgText);
          msgText.destroy();
        }
      };
      fadeOut();
    }, duration);
  }
  
  /**
   * Get current star count
   */
  getCurrentStars(): number {
    return this.currentStars;
  }
  
  /**
   * Destroy HUD
   */
  destroy(): void {
    this.container.destroy();
  }
}
