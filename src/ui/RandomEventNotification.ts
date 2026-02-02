/**
 * RandomEventNotification - Shows popup for random tower events
 * 
 * Displays event notifications with icons and descriptions.
 */

import type { RandomEvent } from '@simulation/RandomEventSystem';

export class RandomEventNotification {
  private container: HTMLDivElement | null = null;

  /**
   * Show random event notification
   */
  show(event: RandomEvent): void {
    // Remove any existing notification
    this.hide();

    // Create notification
    this.container = document.createElement('div');
    
    const eventIcons: Record<string, string> = {
      vip_visitor: '⭐',
      maintenance: '🔧',
      fire_drill: '🚨',
      power_outage: '⚡',
    };
    
    const eventColors: Record<string, string> = {
      vip_visitor: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', // Gold
      maintenance: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)', // Red
      fire_drill: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)', // Orange
      power_outage: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', // Blue
    };

    const icon = eventIcons[event.type] || '❗';
    const background = eventColors[event.type] || 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';

    this.container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.8);
      background: ${background};
      padding: 30px 50px;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      z-index: 10000;
      text-align: center;
      color: white;
      font-family: monospace;
      animation: eventPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
      max-width: 500px;
    `;

    this.container.innerHTML = `
      <style>
        @keyframes eventPop {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.05);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
      </style>
      <div style="font-size: 48px; margin-bottom: 15px;">
        ${icon}
      </div>
      <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">
        ${event.title}
      </div>
      <div style="font-size: 14px; opacity: 0.9; line-height: 1.4;">
        ${event.description}
      </div>
      ${event.durationTicks > 0 ? `
        <div style="margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 6px; font-size: 12px;">
          Duration: ${Math.round(event.durationTicks / 3600)} minute(s)
        </div>
      ` : ''}
    `;

    document.body.appendChild(this.container);

    // Auto-hide after 4 seconds
    setTimeout(() => {
      this.fadeOut();
    }, 4000);
  }

  /**
   * Fade out and remove notification
   */
  private fadeOut(): void {
    if (!this.container) return;

    this.container.style.transition = 'opacity 0.5s, transform 0.5s';
    this.container.style.opacity = '0';
    this.container.style.transform = 'translate(-50%, -50%) scale(0.9)';

    setTimeout(() => {
      this.hide();
    }, 500);
  }

  /**
   * Immediately hide notification
   */
  hide(): void {
    if (this.container && this.container.parentElement) {
      this.container.parentElement.removeChild(this.container);
      this.container = null;
    }
  }
}
