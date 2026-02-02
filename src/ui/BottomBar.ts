/**
 * BottomBar - Notifications, alerts, and quick actions
 * 
 * Features:
 * - Scrolling notification feed (events, alerts, achievements)
 * - Quick action buttons (save, load, financials, settings)
 * - Tool selection (build, demolish, inspect)
 * - Visual feedback and animations
 * 
 * Positioned at the bottom of the screen like SimTower.
 */

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'event';
  timestamp: number;
  icon?: string;
}

export type ToolType = 'build' | 'demolish' | 'inspect' | 'elevatorProgram';
export type QuickAction = 'save' | 'load' | 'financial' | 'settings' | 'help';

export type ToolChangeCallback = (tool: ToolType) => void;
export type QuickActionCallback = (action: QuickAction) => void;

export class BottomBar {
  private container: HTMLDivElement;
  private notificationArea: HTMLDivElement;
  private notificationList: HTMLDivElement;
  private toolArea: HTMLDivElement;
  private quickActionArea: HTMLDivElement;
  
  private notifications: Notification[] = [];
  private maxNotifications = 50;
  
  private currentTool: ToolType = 'build';
  private toolButtons: Map<ToolType, HTMLButtonElement> = new Map();
  
  private toolCallback: ToolChangeCallback | null = null;
  private actionCallback: QuickActionCallback | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'bottom-bar';
    this.applyStyles();
    
    // Create areas
    this.notificationArea = this.createNotificationArea();
    this.toolArea = this.createToolArea();
    this.quickActionArea = this.createQuickActionArea();
    
    // Assemble the bar
    this.container.appendChild(this.notificationArea);
    this.container.appendChild(this.toolArea);
    this.container.appendChild(this.quickActionArea);
    
    document.body.appendChild(this.container);
  }

  private applyStyles(): void {
    this.container.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: linear-gradient(0deg, #2a2a2a 0%, #1a1a1a 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
      font-family: 'Arial', sans-serif;
      font-size: 13px;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.5);
      z-index: 9999;
      user-select: none;
      border-top: 2px solid #444;
    `;
  }

  private createNotificationArea(): HTMLDivElement {
    const area = document.createElement('div');
    area.style.cssText = `
      flex: 1;
      height: 100%;
      display: flex;
      align-items: center;
      overflow: hidden;
      padding: 0 10px;
    `;
    
    this.notificationList = document.createElement('div');
    this.notificationList.style.cssText = `
      display: flex;
      gap: 10px;
      animation: scroll-left 30s linear infinite;
      white-space: nowrap;
    `;
    
    area.appendChild(this.notificationList);
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes scroll-left {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      
      @keyframes slide-in-up {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 5px rgba(76, 175, 80, 0.5); }
        50% { box-shadow: 0 0 15px rgba(76, 175, 80, 0.8); }
      }
    `;
    document.head.appendChild(style);
    
    return area;
  }

  private createToolArea(): HTMLDivElement {
    const area = document.createElement('div');
    area.style.cssText = `
      display: flex;
      gap: 5px;
      padding: 0 15px;
      border-left: 2px solid #444;
      border-right: 2px solid #444;
    `;
    
    const tools: Array<{ type: ToolType; label: string; icon: string; tooltip: string }> = [
      { type: 'build', label: 'Build', icon: '🏗️', tooltip: 'Build mode (B)' },
      { type: 'demolish', label: 'Demolish', icon: '💣', tooltip: 'Demolish mode (D)' },
      { type: 'inspect', label: 'Inspect', icon: '🔍', tooltip: 'Inspect mode (I)' },
      { type: 'elevatorProgram', label: 'Elevator', icon: '🛗', tooltip: 'Program elevator (E)' },
    ];
    
    tools.forEach(({ type, label, icon, tooltip }) => {
      const button = this.createToolButton(type, label, icon, tooltip);
      this.toolButtons.set(type, button);
      area.appendChild(button);
    });
    
    // Set initial active state
    this.updateToolButtons();
    
    return area;
  }

  private createToolButton(type: ToolType, label: string, icon: string, tooltip: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.innerHTML = `<div style="font-size: 18px;">${icon}</div><div style="font-size: 10px; margin-top: 2px;">${label}</div>`;
    button.title = tooltip;
    button.style.cssText = `
      width: 70px;
      height: 50px;
      background: #333;
      color: white;
      border: 2px solid #555;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0;
    `;
    
    button.onmouseenter = () => {
      if (this.currentTool !== type) {
        button.style.background = '#444';
        button.style.borderColor = '#666';
        button.style.transform = 'translateY(-2px)';
      }
    };
    
    button.onmouseleave = () => {
      if (this.currentTool !== type) {
        button.style.background = '#333';
        button.style.borderColor = '#555';
        button.style.transform = 'translateY(0)';
      }
    };
    
    button.onmousedown = () => {
      button.style.transform = 'translateY(1px)';
    };
    
    button.onmouseup = () => {
      button.style.transform = this.currentTool === type ? 'translateY(0)' : 'translateY(-2px)';
    };
    
    button.onclick = () => {
      this.setTool(type);
      if (this.toolCallback) {
        this.toolCallback(type);
      }
    };
    
    return button;
  }

  private createQuickActionArea(): HTMLDivElement {
    const area = document.createElement('div');
    area.style.cssText = `
      display: flex;
      gap: 5px;
      padding: 0 10px;
    `;
    
    const actions: Array<{ action: QuickAction; label: string; icon: string; tooltip: string }> = [
      { action: 'financial', label: '💰', icon: '', tooltip: 'View financials (F)' },
      { action: 'save', label: '💾', icon: '', tooltip: 'Save game (Ctrl+S)' },
      { action: 'load', label: '📂', icon: '', tooltip: 'Load game (Ctrl+L)' },
      { action: 'settings', label: '⚙️', icon: '', tooltip: 'Settings' },
      { action: 'help', label: '❓', icon: '', tooltip: 'Help (F1)' },
    ];
    
    actions.forEach(({ action, label, tooltip }) => {
      const button = this.createActionButton(action, label, tooltip);
      area.appendChild(button);
    });
    
    return area;
  }

  private createActionButton(action: QuickAction, label: string, tooltip: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = label;
    button.title = tooltip;
    button.style.cssText = `
      width: 40px;
      height: 40px;
      background: #333;
      color: white;
      border: 2px solid #555;
      border-radius: 5px;
      cursor: pointer;
      font-size: 18px;
      transition: all 0.2s ease;
      font-family: inherit;
    `;
    
    button.onmouseenter = () => {
      button.style.background = '#444';
      button.style.borderColor = '#666';
      button.style.transform = 'translateY(-2px)';
    };
    
    button.onmouseleave = () => {
      button.style.background = '#333';
      button.style.borderColor = '#555';
      button.style.transform = 'translateY(0)';
    };
    
    button.onmousedown = () => {
      button.style.transform = 'translateY(1px)';
    };
    
    button.onmouseup = () => {
      button.style.transform = 'translateY(-2px)';
    };
    
    button.onclick = () => {
      // Visual feedback
      button.style.animation = 'pulse-glow 0.3s ease';
      setTimeout(() => {
        button.style.animation = '';
      }, 300);
      
      if (this.actionCallback) {
        this.actionCallback(action);
      }
    };
    
    return button;
  }

  /** Add a notification to the feed */
  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): void {
    const fullNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    
    this.notifications.push(fullNotification);
    
    // Limit notification count
    if (this.notifications.length > this.maxNotifications) {
      this.notifications.shift();
    }
    
    this.renderNotifications();
  }

  /** Add a quick notification (convenience method) */
  notify(message: string, type: Notification['type'] = 'info'): void {
    const icons = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      success: '✅',
      event: '🎉',
    };
    
    this.addNotification({
      message,
      type,
      icon: icons[type],
    });
  }

  private renderNotifications(): void {
    // Clear existing
    this.notificationList.innerHTML = '';
    
    // Add all notifications
    this.notifications.forEach(notif => {
      const element = this.createNotificationElement(notif);
      this.notificationList.appendChild(element);
    });
    
    // Duplicate for seamless scroll (if we have notifications)
    if (this.notifications.length > 0) {
      this.notifications.forEach(notif => {
        const element = this.createNotificationElement(notif);
        this.notificationList.appendChild(element);
      });
    }
  }

  private createNotificationElement(notification: Notification): HTMLDivElement {
    const element = document.createElement('div');
    
    const colors = {
      info: '#64B5F6',
      warning: '#FF9800',
      error: '#E57373',
      success: '#4CAF50',
      event: '#9C27B0',
    };
    
    const bgColors = {
      info: 'rgba(100, 181, 246, 0.1)',
      warning: 'rgba(255, 152, 0, 0.1)',
      error: 'rgba(229, 115, 115, 0.1)',
      success: 'rgba(76, 175, 80, 0.1)',
      event: 'rgba(156, 39, 176, 0.1)',
    };
    
    element.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: ${bgColors[notification.type]};
      border-left: 3px solid ${colors[notification.type]};
      border-radius: 3px;
      color: ${colors[notification.type]};
      font-size: 12px;
      animation: slide-in-up 0.3s ease;
    `;
    
    const icon = notification.icon || '';
    const time = new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    element.innerHTML = `
      <span style="font-size: 14px;">${icon}</span>
      <span style="color: white;">${notification.message}</span>
      <span style="color: #666; font-size: 10px; margin-left: 5px;">${time}</span>
    `;
    
    return element;
  }

  /** Set current tool */
  setTool(tool: ToolType): void {
    this.currentTool = tool;
    this.updateToolButtons();
  }

  private updateToolButtons(): void {
    this.toolButtons.forEach((button, tool) => {
      if (tool === this.currentTool) {
        button.style.background = '#4CAF50';
        button.style.borderColor = '#66BB6A';
        button.style.transform = 'translateY(0)';
      } else {
        button.style.background = '#333';
        button.style.borderColor = '#555';
        button.style.transform = 'translateY(0)';
      }
    });
  }

  /** Register callback for tool changes */
  onToolChange(callback: ToolChangeCallback): void {
    this.toolCallback = callback;
  }

  /** Register callback for quick actions */
  onQuickAction(callback: QuickActionCallback): void {
    this.actionCallback = callback;
  }

  /** Get current tool */
  getCurrentTool(): ToolType {
    return this.currentTool;
  }

  /** Clear all notifications */
  clearNotifications(): void {
    this.notifications = [];
    this.renderNotifications();
  }

  /** Remove from DOM */
  destroy(): void {
    this.container.remove();
  }
}
