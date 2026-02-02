/**
 * NotificationSystem - Toast notifications for important game events
 * 
 * Shows big, exciting notifications for:
 * - Star rating increases
 * - Building unlocks
 * - Financial milestones
 * - Critical warnings
 * 
 * @module ui/NotificationSystem
 */

import { getSoundManager } from '@/audio/SoundManager';

export type NotificationType = 'success' | 'info' | 'warning' | 'critical' | 'star';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration: number; // milliseconds, 0 = persistent
  timestamp: number;
}

export class NotificationSystem {
  private container: HTMLDivElement;
  private notifications: Map<string, Notification> = new Map();
  private nextId = 1;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: center;
    `;
    document.body.appendChild(this.container);
  }

  /**
   * Show a notification
   */
  show(type: NotificationType, title: string, message: string, duration: number = 5000): string {
    const id = `notification-${this.nextId++}`;
    
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration,
      timestamp: Date.now(),
    };

    this.notifications.set(id, notification);
    this.render(notification);

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  /**
   * Show a star rating increase notification (BIG and EXCITING)
   */
  showStarIncrease(oldRating: number, newRating: number, unlockedBuildings: string[]): void {
    const stars = '⭐'.repeat(newRating);
    const title = `${stars} ${newRating} STAR TOWER! ${stars}`;
    
    let message = `Congratulations! Your tower has been upgraded to ${newRating} stars!`;
    
    if (unlockedBuildings.length > 0) {
      message += `\n\n🔓 NEW BUILDINGS UNLOCKED:\n`;
      message += unlockedBuildings.map(b => `• ${this.formatBuildingName(b)}`).join('\n');
    }

    this.show('star', title, message, 8000); // Show for 8 seconds

    // Play sound effect (if sound system exists)
    this.playStarSound();
  }

  /**
   * Show a bankruptcy warning
   */
  showBankruptcyWarning(daysLeft: number): void {
    this.show(
      'critical',
      '💀 BANKRUPTCY WARNING',
      `Your tower is $500,000+ in debt!\n${daysLeft} days until GAME OVER.\nGenerate income NOW!`,
      10000
    );
  }

  /**
   * Show a tenant departure notification
   */
  showTenantDeparture(buildingType: string, reason: string): void {
    this.show(
      'warning',
      '😞 Tenant Left',
      `A ${buildingType} tenant moved out.\nReason: ${reason}`,
      4000
    );
  }

  /**
   * Show a financial milestone
   */
  showMilestone(title: string, message: string): void {
    this.show('success', title, message, 6000);
  }

  /**
   * Dismiss a notification
   */
  dismiss(id: string): void {
    const notification = this.notifications.get(id);
    if (!notification) return;

    const element = document.getElementById(id);
    if (element) {
      element.style.animation = 'notificationSlideOut 0.3s ease-out forwards';
      
      setTimeout(() => {
        element.remove();
        this.notifications.delete(id);
      }, 300);
    }
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    for (const id of this.notifications.keys()) {
      this.dismiss(id);
    }
  }

  /**
   * Render a notification element
   */
  private render(notification: Notification): void {
    const element = document.createElement('div');
    element.id = notification.id;
    element.style.cssText = `
      background: ${this.getBackgroundColor(notification.type)};
      color: white;
      padding: 20px 30px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      font-family: 'Arial', sans-serif;
      max-width: 500px;
      pointer-events: all;
      animation: notificationSlideIn 0.3s ease-out;
      text-align: center;
      border: 3px solid ${this.getBorderColor(notification.type)};
    `;

    // Title
    const title = document.createElement('div');
    title.style.cssText = `
      font-size: ${notification.type === 'star' ? '24px' : '18px'};
      font-weight: bold;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      ${notification.type === 'star' ? 'animation: starPulse 1s ease-in-out infinite;' : ''}
    `;
    title.textContent = notification.title;

    // Message
    const message = document.createElement('div');
    message.style.cssText = `
      font-size: 14px;
      line-height: 1.6;
      white-space: pre-line;
      opacity: 0.95;
    `;
    message.textContent = notification.message;

    element.appendChild(title);
    element.appendChild(message);

    // Close button
    if (notification.type !== 'star') { // Star notifications auto-close
      const closeButton = document.createElement('button');
      closeButton.textContent = '✕';
      closeButton.style.cssText = `
        position: absolute;
        top: 8px;
        right: 12px;
        background: transparent;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.2s;
      `;
      closeButton.onmouseover = () => closeButton.style.opacity = '1';
      closeButton.onmouseout = () => closeButton.style.opacity = '0.7';
      closeButton.onclick = () => this.dismiss(notification.id);
      element.style.position = 'relative';
      element.appendChild(closeButton);
    }

    this.container.appendChild(element);

    // Add CSS animations if not already added
    this.ensureAnimationsExist();
  }

  /**
   * Get background color based on notification type
   */
  private getBackgroundColor(type: NotificationType): string {
    switch (type) {
      case 'success': return 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
      case 'info': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'warning': return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      case 'critical': return 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)';
      case 'star': return 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF4500 100%)';
      default: return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  }

  /**
   * Get border color based on notification type
   */
  private getBorderColor(type: NotificationType): string {
    switch (type) {
      case 'success': return '#38ef7d';
      case 'info': return '#764ba2';
      case 'warning': return '#f5576c';
      case 'critical': return '#eb3349';
      case 'star': return '#FFD700';
      default: return '#764ba2';
    }
  }

  /**
   * Format building name for display
   */
  private formatBuildingName(type: string): string {
    const names: Record<string, string> = {
      hotelSingle: 'Hotel (Single Room)',
      hotelTwin: 'Hotel (Twin Room)',
      hotelSuite: 'Hotel (Suite)',
      fastFood: 'Fast Food',
      restaurant: 'Restaurant',
      partyHall: 'Party Hall',
      cinema: 'Cinema',
      security: 'Security Office',
      medical: 'Medical Clinic',
      recycling: 'Recycling Center',
      escalator: 'Escalator',
      parkingRamp: 'Parking Ramp',
      parkingSpace: 'Parking Space',
    };
    
    return names[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
  }

  /**
   * Play star rating sound effect
   */
  private playStarSound(): void {
    // Play the proper star rating fanfare from SoundManager
    getSoundManager().playStarRatingUp();
  }

  /**
   * Ensure CSS animations are injected
   */
  private ensureAnimationsExist(): void {
    if (document.getElementById('notification-animations')) return;

    const style = document.createElement('style');
    style.id = 'notification-animations';
    style.textContent = `
      @keyframes notificationSlideIn {
        from {
          transform: translateY(-100px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes notificationSlideOut {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(-100px);
          opacity: 0;
        }
      }

      @keyframes starPulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.container.remove();
    const animations = document.getElementById('notification-animations');
    if (animations) animations.remove();
  }
}
