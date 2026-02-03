/**
 * NotificationSystem - Toast notifications for important game events
 * 
 * Shows big, exciting notifications for:
 * - Star rating increases
 * - Building unlocks
 * - Financial milestones
 * - Critical warnings
 * 
 * Design: Slide-in from right with color-coded types, smart stacking, and sound hints
 * Enhanced: 2026-02-03 (Round 3)
 * 
 * @module ui/NotificationSystem
 */

import { getSoundManager } from '@/audio/SoundManager';

/**
 * Design tokens for notifications (matching OT_TOKENS from BuildingMenu)
 */
const NT_TOKENS = {
  // Priority colors (aligned with OT_TOKENS)
  info: { 
    bg: '#2C5282', // primary
    border: '#4299E1', 
    icon: 'ℹ',
    duration: 5000,
    sound: false 
  },
  success: { 
    bg: '#38A169', // success
    border: '#68D391', 
    icon: '✓',
    duration: 5000,
    sound: false 
  },
  warning: { 
    bg: '#DD6B20', // warning
    border: '#F6AD55', 
    icon: '⚠',
    duration: 10000,
    sound: true 
  },
  urgent: { 
    bg: '#E53E3E', // danger
    border: '#FC8181', 
    icon: '🚨',
    duration: 0, // manual dismiss
    sound: true 
  },
  star: { 
    bg: 'linear-gradient(135deg, #D69E2E, #F6AD55)', // accent gradient
    border: '#FBD38D', 
    icon: '⭐',
    duration: 8000,
    sound: true 
  },
  
  // Layout
  containerRight: '20px',
  containerTop: '80px',
  containerBottom: '20px',
  maxWidth: '420px',
  gap: '12px',
  maxVisible: 5, // Cap visible notifications
  stackOffset: '4px', // Spacing between stacked notifications
  
  // Animation
  duration: '250ms',
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  
  // Fonts
  fontBody: "'Inter', -apple-system, system-ui, sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

export type NotificationType = 'info' | 'success' | 'warning' | 'urgent' | 'star';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration: number; // milliseconds, 0 = persistent (manual dismiss)
  timestamp: number;
  dismissTimer?: number;
}

export class NotificationSystem {
  private container: HTMLDivElement;
  private notifications: Map<string, Notification> = new Map();
  private queue: Notification[] = []; // Queue for overflow notifications
  private nextId = 1;

  constructor() {
    this.ensureAnimationsExist(); // Inject styles early
    
    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.style.cssText = `
      position: fixed;
      top: ${NT_TOKENS.containerTop};
      right: ${NT_TOKENS.containerRight};
      bottom: ${NT_TOKENS.containerBottom};
      z-index: 10000;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      gap: ${NT_TOKENS.gap};
      align-items: flex-end;
      max-width: ${NT_TOKENS.maxWidth};
      overflow: visible;
    `;
    document.body.appendChild(this.container);
    
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  /**
   * Show a notification (with intelligent queuing)
   */
  show(type: NotificationType, title: string, message: string, durationOverride?: number): string {
    const id = `notification-${this.nextId++}`;
    const typeConfig = NT_TOKENS[type];
    const duration = durationOverride !== undefined ? durationOverride : typeConfig.duration;
    
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration,
      timestamp: Date.now(),
    };

    // Check if we're at capacity
    if (this.notifications.size >= NT_TOKENS.maxVisible) {
      // Queue for later
      this.queue.push(notification);
      console.log(`[NotificationSystem] Queue full, queued notification: ${title}`);
      return id;
    }

    // Add to active notifications
    this.notifications.set(id, notification);
    this.render(notification);
    
    // Play sound hint if configured
    if (typeConfig.sound) {
      this.playNotificationSound(type);
    }

    // Auto-dismiss after duration (if not persistent)
    if (duration > 0) {
      const timer = window.setTimeout(() => {
        this.dismiss(id);
      }, duration);
      notification.dismissTimer = timer;
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

    this.show('star', title, message);
  }

  /**
   * Show a bankruptcy warning (URGENT)
   */
  showBankruptcyWarning(daysLeft: number): void {
    this.show(
      'urgent',
      '💀 BANKRUPTCY WARNING',
      `Your tower is $500,000+ in debt!\n${daysLeft} days until GAME OVER.\nGenerate income NOW!`
    );
  }

  /**
   * Show a tenant departure notification
   */
  showTenantDeparture(buildingType: string, reason: string): void {
    this.show(
      'warning',
      '😞 Tenant Left',
      `A ${buildingType} tenant moved out.\nReason: ${reason}`
    );
  }

  /**
   * Show a financial milestone
   */
  showMilestone(title: string, message: string): void {
    this.show('success', title, message);
  }

  /**
   * Dismiss a notification and process queue
   */
  dismiss(id: string): void {
    const notification = this.notifications.get(id);
    if (!notification) return;

    // Clear timer if exists
    if (notification.dismissTimer) {
      clearTimeout(notification.dismissTimer);
    }

    const element = document.getElementById(id);
    if (element) {
      element.style.animation = `notificationSlideOut ${NT_TOKENS.duration} ${NT_TOKENS.easing} forwards`;
      
      setTimeout(() => {
        element.remove();
        this.notifications.delete(id);
        
        // Process queue (show next notification if available)
        this.processQueue();
      }, 250); // Match animation duration
    }
  }

  /**
   * Clear all notifications (triggered by Ctrl+D)
   */
  clearAll(): void {
    console.log('[NotificationSystem] Dismissing all notifications');
    
    // Clear all timers
    for (const notification of this.notifications.values()) {
      if (notification.dismissTimer) {
        clearTimeout(notification.dismissTimer);
      }
    }
    
    // Animate all out
    for (const id of this.notifications.keys()) {
      const element = document.getElementById(id);
      if (element) {
        element.style.animation = `notificationSlideOut ${NT_TOKENS.duration} ${NT_TOKENS.easing} forwards`;
      }
    }
    
    // Clear after animation
    setTimeout(() => {
      this.container.innerHTML = '';
      this.notifications.clear();
      this.queue = []; // Also clear queue
    }, 250);
  }

  /**
   * Process queue - show next notification if space available
   */
  private processQueue(): void {
    if (this.queue.length === 0) return;
    if (this.notifications.size >= NT_TOKENS.maxVisible) return;
    
    const next = this.queue.shift();
    if (!next) return;
    
    console.log(`[NotificationSystem] Processing queued notification: ${next.title}`);
    
    // Add to active notifications
    this.notifications.set(next.id, next);
    this.render(next);
    
    // Play sound if configured
    const typeConfig = NT_TOKENS[next.type];
    if (typeConfig.sound) {
      this.playNotificationSound(next.type);
    }
    
    // Auto-dismiss timer
    if (next.duration > 0) {
      const timer = window.setTimeout(() => {
        this.dismiss(next.id);
      }, next.duration);
      next.dismissTimer = timer;
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
    element.setAttribute('data-type', notification.type);
    element.style.cssText = `
      ${isGradient ? `background: ${typeStyle.bg};` : `background: ${typeStyle.bg};`}
      color: white;
      padding: 16px 20px;
      padding-right: 40px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.1);
      font-family: ${NT_TOKENS.fontBody};
      max-width: 100%;
      width: ${NT_TOKENS.maxWidth};
      pointer-events: all;
      animation: notificationSlideIn ${NT_TOKENS.duration} ${NT_TOKENS.easing};
      text-align: left;
      border-left: 4px solid ${typeStyle.border};
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      position: relative;
      margin-bottom: ${NT_TOKENS.stackOffset};
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
      flex: 1;
    `;
    title.textContent = notification.title;
    
    // Priority badge for urgent notifications
    if (notification.type === 'urgent') {
      const urgentBadge = document.createElement('span');
      urgentBadge.style.cssText = `
        background: rgba(0,0,0,0.3);
        color: white;
        font-size: 9px;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      `;
      urgentBadge.textContent = 'URGENT';
      header.appendChild(icon);
      header.appendChild(title);
      header.appendChild(urgentBadge);
    } else {
      header.appendChild(icon);
      header.appendChild(title);
    }

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

    // Close button (always visible for manual dismiss)
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
      opacity: ${notification.type === 'urgent' ? '1' : '0'};
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
      closeButton.style.opacity = notification.type === 'urgent' ? '1' : '0.6';
      closeButton.style.background = 'rgba(0,0,0,0.2)';
    };
    closeButton.onclick = (e) => {
      e.stopPropagation();
      this.dismiss(notification.id);
    };
    element.appendChild(closeButton);

    // Progress bar for auto-dismiss notifications
    if (notification.duration > 0) {
      const progressBar = document.createElement('div');
      progressBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: rgba(255,255,255,0.3);
        border-radius: 0 0 10px 10px;
        overflow: hidden;
      `;
      
      const progressFill = document.createElement('div');
      progressFill.style.cssText = `
        height: 100%;
        background: rgba(255,255,255,0.7);
        width: 100%;
        animation: progressDrain ${notification.duration}ms linear;
      `;
      
      progressBar.appendChild(progressFill);
      element.appendChild(progressBar);
    }

    this.container.appendChild(element);

    // Add CSS animations if not already added
    this.ensureAnimationsExist();
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
   * Play notification sound effect
   * 
   * Sound strategy:
   * - info/success: Subtle pop
   * - warning: Warning beep
   * - urgent: Urgent beep
   * - star: Fanfare/celebration sound
   */
  private playNotificationSound(type: NotificationType): void {
    const soundManager = getSoundManager();
    
    switch (type) {
      case 'star':
        // Star rating fanfare
        soundManager.playStarRatingUp();
        break;
      
      case 'urgent':
        soundManager.playNotificationBeep('urgent');
        break;
      
      case 'warning':
        soundManager.playNotificationBeep('warning');
        break;
      
      case 'success':
        soundManager.playNotificationPop();
        break;
      
      case 'info':
        // Very subtle pop for info
        soundManager.playNotificationPop();
        break;
    }
  }

  /**
   * Setup keyboard shortcuts
   * 
   * Ctrl+D or Cmd+D: Dismiss all notifications
   */
  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Ctrl+D or Cmd+D (dismiss all)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        this.clearAll();
      }
    });
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
      
      @keyframes progressDrain {
        from {
          width: 100%;
        }
        to {
          width: 0%;
        }
      }
      
      .ot-notification:hover .ot-close-btn {
        opacity: 1 !important;
      }
      
      /* Stacking effect for multiple notifications */
      .ot-notification {
        position: relative;
      }
      
      /* Mobile responsive */
      @media (max-width: 640px) {
        #notification-container {
          right: 8px;
          top: 64px;
          max-width: calc(100vw - 16px);
        }
        
        .ot-notification {
          width: 100% !important;
          max-width: 100% !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Get queue status (for debugging)
   */
  getStatus(): { active: number; queued: number; maxVisible: number } {
    return {
      active: this.notifications.size,
      queued: this.queue.length,
      maxVisible: NT_TOKENS.maxVisible,
    };
  }

  /**
   * Clean up
   */
  destroy(): void {
    // Clear all timers
    for (const notification of this.notifications.values()) {
      if (notification.dismissTimer) {
        clearTimeout(notification.dismissTimer);
      }
    }
    
    this.container.remove();
    const animations = document.getElementById('notification-animations');
    if (animations) animations.remove();
  }
}
