/**
 * NotificationSystem - Toast notifications for important game events
 * 
 * Shows big, exciting notifications for:
 * - Star rating increases
 * - Building unlocks
 * - Financial milestones
 * - Critical warnings
 * 
 * Design: Slide-in from right with color-coded types
 * 
 * @module ui/NotificationSystem
 */

import { getSoundManager } from '@/audio/SoundManager';

/**
 * Design tokens for notifications
 */
const NT_TOKENS = {
  // Type colors
  success: { bg: '#059669', border: '#34D399', icon: '✓' },
  info: { bg: '#2563EB', border: '#60A5FA', icon: 'ℹ' },
  warning: { bg: '#D97706', border: '#FBBF24', icon: '⚠' },
  critical: { bg: '#DC2626', border: '#F87171', icon: '🚨' },
  star: { bg: 'linear-gradient(135deg, #F59E0B, #EF4444)', border: '#FCD34D', icon: '⭐' },
  
  // Layout
  containerRight: '20px',
  containerTop: '80px',
  maxWidth: '420px',
  gap: '12px',
  
  // Animation
  duration: '300ms',
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  
  // Fonts
  fontBody: "'Inter', -apple-system, system-ui, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

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
    this.ensureAnimationsExist(); // Inject styles early
    
    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.style.cssText = `
      position: fixed;
      top: ${NT_TOKENS.containerTop};
      right: ${NT_TOKENS.containerRight};
      z-index: 10000;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      gap: ${NT_TOKENS.gap};
      align-items: flex-end;
      max-width: ${NT_TOKENS.maxWidth};
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
    const typeStyle = NT_TOKENS[notification.type];
    const isGradient = typeStyle.bg.includes('gradient');
    
    const element = document.createElement('div');
    element.id = notification.id;
    element.className = 'ot-notification';
    element.style.cssText = `
      ${isGradient ? `background: ${typeStyle.bg};` : `background: ${typeStyle.bg};`}
      color: white;
      padding: 16px 20px;
      padding-right: 40px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.1);
      font-family: ${NT_TOKENS.fontBody};
      max-width: 100%;
      pointer-events: all;
      animation: notificationSlideIn ${NT_TOKENS.duration} ${NT_TOKENS.easing};
      text-align: left;
      border-left: 4px solid ${typeStyle.border};
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      position: relative;
    `;
    
    // Hover effect
    element.onmouseenter = () => {
      element.style.transform = 'translateX(-4px)';
      element.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.15)';
    };
    element.onmouseleave = () => {
      element.style.transform = 'translateX(0)';
      element.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.1)';
    };
    
    // Click to dismiss
    element.onclick = () => this.dismiss(notification.id);

    // Header with icon
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    `;
    
    // Type icon
    const icon = document.createElement('span');
    icon.style.cssText = `
      font-size: 16px;
      ${notification.type === 'star' ? 'animation: starPulse 1s ease-in-out infinite;' : ''}
    `;
    icon.textContent = typeStyle.icon;
    
    // Title
    const title = document.createElement('span');
    title.style.cssText = `
      font-size: ${notification.type === 'star' ? '18px' : '15px'};
      font-weight: 600;
      ${notification.type === 'star' ? 'animation: starPulse 1s ease-in-out infinite;' : ''}
    `;
    title.textContent = notification.title;
    
    header.appendChild(icon);
    header.appendChild(title);

    // Message
    const message = document.createElement('div');
    message.style.cssText = `
      font-size: 13px;
      line-height: 1.5;
      white-space: pre-line;
      opacity: 0.9;
    `;
    message.textContent = notification.message;

    element.appendChild(header);
    element.appendChild(message);

    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = 'ot-close-btn';
    closeButton.textContent = '✕';
    closeButton.style.cssText = `
      position: absolute;
      top: 50%;
      right: 12px;
      transform: translateY(-50%);
      background: rgba(0,0,0,0.2);
      border: none;
      color: white;
      font-size: 14px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s, background 0.2s;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeButton.onmouseenter = () => {
      closeButton.style.opacity = '1';
      closeButton.style.background = 'rgba(0,0,0,0.4)';
    };
    closeButton.onmouseleave = () => {
      closeButton.style.background = 'rgba(0,0,0,0.2)';
    };
    closeButton.onclick = (e) => {
      e.stopPropagation();
      this.dismiss(notification.id);
    };
    element.appendChild(closeButton);

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
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes notificationSlideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      @keyframes starPulse {
        0%, 100% {
          transform: scale(1);
          filter: brightness(1);
        }
        50% {
          transform: scale(1.02);
          filter: brightness(1.1);
        }
      }
      
      .ot-notification:hover .ot-close-btn {
        opacity: 1;
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
