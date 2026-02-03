/**
 * TopBar - Always-visible game status display
 * 
 * Shows critical info at a glance:
 * - Current funds (the lifeblood)
 * - Date/time (game clock)
 * - Population (tower size)
 * - Star rating (progress indicator)
 * - Speed controls (pause/1x/3x)
 * 
 * Inspired by SimTower 1995's top bar design.
 */

import type { GameClock, GameSpeed } from '@/interfaces';

/**
 * OpenTower Design System Tokens
 * Retro-futuristic 90s management sim aesthetic
 */
const OT_TOKENS = {
  // Colors
  primary: '#2C5282',       // Corporate blue
  secondary: '#4A5568',     // Steel gray  
  accent: '#D69E2E',        // Gold
  success: '#38A169',       // Green
  warning: '#DD6B20',       // Orange
  danger: '#E53E3E',        // Red
  info: '#3182CE',          // Blue
  
  // Surfaces
  bgPrimary: '#1A202C',
  bgSecondary: '#2D3748',
  bgElevated: '#4A5568',
  
  // Text
  textPrimary: '#F7FAFC',
  textSecondary: '#A0AEC0',
  textMuted: '#718096',
  
  // Effects
  glowGold: '0 0 12px rgba(214, 158, 46, 0.5)',
  glowGreen: '0 0 12px rgba(56, 161, 105, 0.5)',
  glowRed: '0 0 12px rgba(229, 62, 62, 0.5)',
  
  // Animation
  easeOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
  easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  durationFast: '150ms',
  durationNormal: '300ms',
  
  // Fonts
  fontDisplay: "'VT323', 'Courier New', monospace",
  fontBody: "'Inter', -apple-system, system-ui, sans-serif",
  fontMono: "'JetBrains Mono', 'Courier New', monospace",
};

export interface TopBarData {
  funds: number;
  population: number;
  starRating: number;
  maxStars?: number;
  happyPeople?: number;
  stressedPeople?: number;
  waitingForElevator?: number;
}

export type SpeedChangeCallback = (speed: GameSpeed) => void;

export class TopBar {
  private container: HTMLDivElement;
  private fundsDisplay: HTMLSpanElement;
  private dateDisplay: HTMLSpanElement;
  private populationDisplay: HTMLSpanElement;
  private starDisplay: HTMLSpanElement;
  private satisfactionDisplay: HTMLSpanElement;
  private speedButtons: Map<GameSpeed, HTMLButtonElement> = new Map();
  
  private speedCallback: SpeedChangeCallback | null = null;
  private currentSpeed: GameSpeed = 1;
  
  private data: TopBarData = {
    funds: 0,
    population: 0,
    starRating: 1,
    maxStars: 6,
  };

  constructor() {
    // Inject keyframe animations
    this.injectAnimations();
    
    this.container = document.createElement('div');
    this.container.id = 'top-bar';
    this.applyStyles();
    
    // Create displays
    this.fundsDisplay = this.createFundsDisplay();
    this.dateDisplay = this.createDateDisplay();
    this.populationDisplay = this.createPopulationDisplay();
    this.satisfactionDisplay = this.createSatisfactionDisplay();
    this.starDisplay = this.createStarDisplay();
    const speedControls = this.createSpeedControls();
    
    // Assemble the bar
    this.container.appendChild(this.fundsDisplay);
    this.container.appendChild(this.createSeparator());
    this.container.appendChild(this.dateDisplay);
    this.container.appendChild(this.createSeparator());
    this.container.appendChild(this.populationDisplay);
    this.container.appendChild(this.createSeparator());
    this.container.appendChild(this.satisfactionDisplay);
    this.container.appendChild(this.createSeparator());
    this.container.appendChild(this.starDisplay);
    this.container.appendChild(speedControls);
    
    document.body.appendChild(this.container);
  }

  private injectAnimations(): void {
    if (document.getElementById('ot-topbar-animations')) return;
    
    const style = document.createElement('style');
    style.id = 'ot-topbar-animations';
    style.textContent = `
      @keyframes pulse-danger {
        0%, 100% { 
          opacity: 1; 
          transform: scale(1);
        }
        50% { 
          opacity: 0.7; 
          transform: scale(1.05);
        }
      }
      
      @keyframes funds-up {
        0% { transform: scale(1); }
        50% { transform: scale(1.15); }
        100% { transform: scale(1); }
      }
      
      @keyframes funds-down {
        0% { transform: scale(1); }
        25% { transform: scale(0.9) translateX(-2px); }
        50% { transform: scale(0.9) translateX(2px); }
        75% { transform: scale(0.9) translateX(-2px); }
        100% { transform: scale(1); }
      }
      
      @keyframes star-earned {
        0% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.3) rotate(-10deg); }
        50% { transform: scale(1.3) rotate(10deg); }
        75% { transform: scale(1.3) rotate(-5deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
    `;
    document.head.appendChild(style);
  }

  private applyStyles(): void {
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 56px;
      background: linear-gradient(180deg, #2c2c2c 0%, #1e1e1e 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      font-family: 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.6);
      z-index: 9999;
      user-select: none;
      border-bottom: 3px solid #3a3a3a;
      backdrop-filter: blur(10px);
    `;
  }

  private createFundsDisplay(): HTMLSpanElement {
    const display = document.createElement('span');
    display.style.cssText = `
      font-size: 20px;
      font-weight: 700;
      color: #FFD700;
      min-width: 180px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 8px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.4));
    `;
    display.innerHTML = '<span style="font-size: 24px;">💰</span><span style="color: #FFD700; font-family: \'Courier New\', monospace;">$0</span>';
    return display;
  }

  private createDateDisplay(): HTMLSpanElement {
    const display = document.createElement('span');
    display.style.cssText = `
      font-size: 15px;
      color: #e0e0e0;
      min-width: 200px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.05);
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.1);
    `;
    display.innerHTML = '<span style="font-size: 18px;">📅</span><span style="font-family: \'Courier New\', monospace;">Day 1, 09:00 AM</span>';
    return display;
  }

  private createPopulationDisplay(): HTMLSpanElement {
    const display = document.createElement('span');
    display.style.cssText = `
      font-size: 15px;
      color: #90CAF9;
      min-width: 130px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    `;
    display.innerHTML = '<span style="font-size: 18px;">👥</span><span style="font-family: \'Courier New\', monospace;">0</span> people';
    return display;
  }

  private createSatisfactionDisplay(): HTMLSpanElement {
    const display = document.createElement('span');
    display.style.cssText = `
      font-size: 15px;
      color: #81C784;
      min-width: 130px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    display.innerHTML = '😊 <span style="color: #81C784; font-family: \'Courier New\', monospace;">0</span> 😰 <span style="color: #FF8A80; font-family: \'Courier New\', monospace;">0</span>';
    display.title = 'Happy people / Stressed people';
    return display;
  }

  private createStarDisplay(): HTMLSpanElement {
    const display = document.createElement('span');
    display.style.cssText = `
      font-size: 24px;
      min-width: 180px;
      cursor: help;
      padding: 4px 12px;
      background: linear-gradient(135deg, rgba(255,167,38,0.15) 0%, rgba(255,193,7,0.1) 100%);
      border-radius: 8px;
      border: 2px solid rgba(255,167,38,0.3);
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.3s ease;
      filter: drop-shadow(0 2px 6px rgba(255,167,38,0.3));
    `;
    display.title = 'Current star rating';
    display.innerHTML = '⭐☆☆☆☆☆';
    
    // Add hover effect
    display.onmouseenter = () => {
      display.style.transform = 'scale(1.05)';
      display.style.borderColor = 'rgba(255,167,38,0.5)';
    };
    display.onmouseleave = () => {
      display.style.transform = 'scale(1)';
      display.style.borderColor = 'rgba(255,167,38,0.3)';
    };
    
    return display;
  }

  private createSpeedControls(): HTMLDivElement {
    const container = document.createElement('div');
    container.style.cssText = `
      display: flex;
      gap: 5px;
      margin-left: auto;
    `;

    const speeds: Array<{ speed: GameSpeed; label: string; icon: string }> = [
      { speed: 0, label: 'Pause', icon: '⏸️' },
      { speed: 1, label: '1x', icon: '▶️' },
      { speed: 2, label: '2x', icon: '⏩' },
    ];

    speeds.forEach(({ speed, label, icon }) => {
      const button = this.createSpeedButton(speed, label, icon);
      this.speedButtons.set(speed, button);
      container.appendChild(button);
    });

    // Set initial active state
    this.updateSpeedButtons();

    return container;
  }

  private createSpeedButton(speed: GameSpeed, label: string, icon: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = `${icon} ${label}`;
    button.style.cssText = `
      padding: 10px 18px;
      background: linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%);
      color: white;
      border: 2px solid #4a4a4a;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: inherit;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      min-width: 80px;
    `;

    // Hover effect
    button.onmouseenter = () => {
      if (this.currentSpeed !== speed) {
        button.style.background = 'linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 100%)';
        button.style.borderColor = '#5a5a5a';
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
      }
    };

    button.onmouseleave = () => {
      if (this.currentSpeed !== speed) {
        button.style.background = 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)';
        button.style.borderColor = '#4a4a4a';
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      }
    };

    // Click effect
    button.onmousedown = () => {
      button.style.transform = 'translateY(0px) scale(0.95)';
    };

    button.onmouseup = () => {
      button.style.transform = this.currentSpeed === speed ? 'translateY(0)' : 'translateY(-2px)';
    };

    button.onclick = () => {
      this.setSpeed(speed);
      if (this.speedCallback) {
        this.speedCallback(speed);
      }
    };

    return button;
  }

  private updateSpeedButtons(): void {
    this.speedButtons.forEach((button, speed) => {
      if (speed === this.currentSpeed) {
        button.style.background = 'linear-gradient(180deg, #66BB6A 0%, #4CAF50 100%)';
        button.style.borderColor = '#81C784';
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 2px 12px rgba(76,175,80,0.5)';
      } else {
        button.style.background = 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)';
        button.style.borderColor = '#4a4a4a';
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      }
    });
  }

  private createSeparator(): HTMLDivElement {
    const separator = document.createElement('div');
    separator.style.cssText = `
      width: 2px;
      height: 32px;
      background: linear-gradient(180deg, transparent 0%, #4a4a4a 50%, transparent 100%);
      margin: 0 18px;
    `;
    return separator;
  }

  /** Update all displays */
  update(data: Partial<TopBarData>): void {
    this.data = { ...this.data, ...data };
    this.render();
  }

  /** Update funds display with animation */
  updateFunds(funds: number): void {
    const oldFunds = this.data.funds;
    this.data.funds = funds;
    
    // Determine base state based on funds level
    const isLowFunds = funds < 50000;
    const isNegative = funds < 0;
    const isCritical = funds < -100000;
    
    // Base colors based on financial health
    let baseColor = OT_TOKENS.accent; // Gold for healthy
    let baseGlow = OT_TOKENS.glowGold;
    let icon = '💰';
    
    if (isCritical) {
      baseColor = OT_TOKENS.danger;
      baseGlow = OT_TOKENS.glowRed;
      icon = '🚨';
    } else if (isNegative) {
      baseColor = OT_TOKENS.warning;
      baseGlow = '0 0 12px rgba(221, 107, 32, 0.5)';
      icon = '⚠️';
    } else if (isLowFunds) {
      baseColor = OT_TOKENS.warning;
      icon = '💸';
    }
    
    // Color flash on change with better visuals
    if (funds > oldFunds) {
      this.fundsDisplay.style.color = OT_TOKENS.success;
      this.fundsDisplay.style.transform = 'scale(1.1)';
      this.fundsDisplay.style.filter = `drop-shadow(${OT_TOKENS.glowGreen})`;
    } else if (funds < oldFunds) {
      this.fundsDisplay.style.color = OT_TOKENS.danger;
      this.fundsDisplay.style.transform = 'scale(0.95)';
      this.fundsDisplay.style.filter = `drop-shadow(${OT_TOKENS.glowRed})`;
    }
    
    // Format with negative handling
    const formattedFunds = funds < 0 
      ? `-$${Math.abs(funds).toLocaleString()}`
      : `$${funds.toLocaleString()}`;
    
    this.fundsDisplay.innerHTML = `<span style="font-size: 24px;">${icon}</span><span style="color: inherit; font-family: ${OT_TOKENS.fontMono};">${formattedFunds}</span>`;
    
    // Add pulsing animation for critical funds
    if (isCritical) {
      this.fundsDisplay.style.animation = 'pulse-danger 1s ease-in-out infinite';
    } else {
      this.fundsDisplay.style.animation = 'none';
    }
    
    // Reset color after animation
    setTimeout(() => {
      this.fundsDisplay.style.color = baseColor;
      this.fundsDisplay.style.transform = 'scale(1)';
      this.fundsDisplay.style.filter = `drop-shadow(${baseGlow})`;
    }, 400);
  }

  /** Update date/time display */
  updateDateTime(clock: GameClock): void {
    const day = clock.gameDay;
    const hour = String(clock.gameHour).padStart(2, '0');
    const minute = String(clock.gameMinute).padStart(2, '0');
    const timeString = `${hour}:${minute}`;
    const quarter = clock.gameQuarter;
    
    this.dateDisplay.innerHTML = `<span style="font-size: 18px;">📅</span><span style="font-family: 'Courier New', monospace;">Day ${day}, ${timeString} <span style="opacity: 0.6;">(Q${quarter})</span></span>`;
  }

  /** Update population display */
  updatePopulation(population: number): void {
    this.data.population = population;
    const peopleText = population === 1 ? 'person' : 'people';
    this.populationDisplay.innerHTML = `<span style="font-size: 18px;">👥</span><span style="font-family: 'Courier New', monospace;">${population}</span> ${peopleText}`;
  }

  /** Update satisfaction display */
  updateSatisfaction(happyPeople: number, stressedPeople: number): void {
    this.data.happyPeople = happyPeople;
    this.data.stressedPeople = stressedPeople;
    
    // Color code based on ratio
    const total = happyPeople + stressedPeople;
    const happyPercent = total > 0 ? (happyPeople / total) * 100 : 100;
    
    let happyColor = '#81C784';
    let stressedColor = '#FF8A80';
    
    if (happyPercent > 70) {
      happyColor = '#66BB6A'; // Darker green when very happy
    } else if (happyPercent < 30) {
      stressedColor = '#F44336'; // Brighter red when mostly stressed
    }
    
    this.satisfactionDisplay.innerHTML = `😊 <span style="color: ${happyColor}; font-family: 'Courier New', monospace;">${happyPeople}</span> 😰 <span style="color: ${stressedColor}; font-family: 'Courier New', monospace;">${stressedPeople}</span>`;
  }

  /** Update star rating display */
  updateStarRating(rating: number, maxStars: number = 6): void {
    this.data.starRating = rating;
    this.data.maxStars = maxStars;
    
    const filled = '⭐'.repeat(rating);
    const empty = '☆'.repeat(maxStars - rating);
    this.starDisplay.innerHTML = filled + empty;
    
    // Update tooltip
    const ratingNames = ['—', 'One Star', 'Two Star', 'Three Star', 'Four Star', 'Five Star', 'Tower'];
    this.starDisplay.title = `${ratingNames[rating] || 'Unknown'} (${rating}/${maxStars})`;
  }

  /** Set current game speed */
  setSpeed(speed: GameSpeed): void {
    this.currentSpeed = speed;
    this.updateSpeedButtons();
  }

  /** Register callback for speed changes */
  onSpeedChange(callback: SpeedChangeCallback): void {
    this.speedCallback = callback;
  }

  /** Full render (used internally) */
  private render(): void {
    this.updateFunds(this.data.funds);
    this.updatePopulation(this.data.population);
    this.updateStarRating(this.data.starRating, this.data.maxStars);
  }

  /** Remove from DOM */
  destroy(): void {
    this.container.remove();
  }
}
