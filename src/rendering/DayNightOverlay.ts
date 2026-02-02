/**
 * Day/Night Overlay - Make the time of day OBVIOUS
 * 
 * Creates a dramatic overlay that shows day/night cycle clearly.
 * Players should INSTANTLY know what time it is by looking at the screen.
 * 
 * @module rendering/DayNightOverlay
 */

import * as PIXI from 'pixi.js';
import type { TimeOfDayState } from '@/simulation/TimeOfDaySystem';

/**
 * DayNightOverlay - Visual overlay for time of day
 */
export class DayNightOverlay {
  private overlay: PIXI.Graphics;
  private timeLabel: PIXI.Text;
  private currentState: TimeOfDayState | null = null;
  
  constructor(container: PIXI.Container, width: number, height: number) {
    // Create overlay graphics
    this.overlay = new PIXI.Graphics();
    this.overlay.rect(0, 0, width, height);
    
    // Create time label
    this.timeLabel = new PIXI.Text({
      text: '',
      style: {
        fontSize: 18,
        fill: 0xffffff,
        fontWeight: 'bold',
        dropShadow: {
          alpha: 0.8,
          blur: 4,
          color: 0x000000,
          distance: 2,
        },
      },
    });
    this.timeLabel.anchor.set(1, 0);
    this.timeLabel.x = width - 20;
    this.timeLabel.y = 20;
    
    container.addChild(this.overlay);
    container.addChild(this.timeLabel);
  }
  
  /**
   * Update overlay based on time of day
   */
  update(state: TimeOfDayState): void {
    this.currentState = state;
    
    // Update overlay color and alpha
    this.overlay.clear();
    
    const alpha = this.getOverlayAlpha(state);
    const color = this.getOverlayColor(state);
    
    if (alpha > 0) {
      this.overlay.rect(0, 0, 10000, 10000); // Large enough to cover everything
      this.overlay.fill({ color, alpha });
    }
    
    // Update time label
    this.updateTimeLabel(state);
  }
  
  /**
   * Get overlay alpha based on time period
   */
  private getOverlayAlpha(state: TimeOfDayState): number {
    switch (state.period) {
      case 'NIGHT':
        return 0.4; // Dark overlay
      case 'DAWN':
        return 0.15 * (1 - state.transitionProgress); // Fading out
      case 'MORNING':
        return 0; // No overlay during day
      case 'AFTERNOON':
        return 0;
      case 'DUSK':
        return 0.15 * state.transitionProgress; // Fading in
      case 'EVENING':
        return 0.3; // Moderate overlay
      default:
        return 0;
    }
  }
  
  /**
   * Get overlay color based on time period
   */
  private getOverlayColor(state: TimeOfDayState): number {
    switch (state.period) {
      case 'NIGHT':
        return 0x000033; // Deep blue
      case 'DAWN':
        return 0xff6b6b; // Orange/pink
      case 'DUSK':
        return 0xff6b35; // Orange
      case 'EVENING':
        return 0x1a1a4e; // Purple-blue
      default:
        return 0x000000;
    }
  }
  
  /**
   * Update time label
   */
  private updateTimeLabel(state: TimeOfDayState): void {
    // Show period label with emoji
    const emoji = this.getPeriodEmoji(state.period);
    this.timeLabel.text = `${emoji} ${state.label}`;
    
    // Adjust label color based on time
    const labelColor = this.getLabelColor(state);
    this.timeLabel.style.fill = labelColor;
  }
  
  /**
   * Get emoji for time period
   */
  private getPeriodEmoji(period: string): string {
    switch (period) {
      case 'NIGHT':
        return '🌙';
      case 'DAWN':
        return '🌅';
      case 'MORNING':
        return '☀️';
      case 'AFTERNOON':
        return '🌤️';
      case 'DUSK':
        return '🌆';
      case 'EVENING':
        return '🌃';
      default:
        return '⏰';
    }
  }
  
  /**
   * Get label color for time period
   */
  private getLabelColor(state: TimeOfDayState): number {
    switch (state.period) {
      case 'NIGHT':
        return 0xaaaaff;
      case 'DAWN':
        return 0xffaa88;
      case 'MORNING':
        return 0xffffaa;
      case 'AFTERNOON':
        return 0xffff88;
      case 'DUSK':
        return 0xffaa44;
      case 'EVENING':
        return 0xaaaaff;
      default:
        return 0xffffff;
    }
  }
  
  /**
   * Resize overlay
   */
  resize(width: number, height: number): void {
    this.timeLabel.x = width - 20;
  }
  
  /**
   * Destroy overlay
   */
  destroy(): void {
    this.overlay.destroy();
    this.timeLabel.destroy();
  }
}
