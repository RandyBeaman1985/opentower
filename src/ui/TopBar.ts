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

export interface TopBarData {
  funds: number;
  population: number;
  starRating: number;
  maxStars?: number;
}

export type SpeedChangeCallback = (speed: GameSpeed) => void;

export class TopBar {
  private container: HTMLDivElement;
  private fundsDisplay: HTMLSpanElement;
  private dateDisplay: HTMLSpanElement;
  private populationDisplay: HTMLSpanElement;
  private starDisplay: HTMLSpanElement;
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
    this.container = document.createElement('div');
    this.container.id = 'top-bar';
    this.applyStyles();
    
    // Create displays
    this.fundsDisplay = this.createFundsDisplay();
    this.dateDisplay = this.createDateDisplay();
    this.populationDisplay = this.createPopulationDisplay();
    this.starDisplay = this.createStarDisplay();
    const speedControls = this.createSpeedControls();
    
    // Assemble the bar
    this.container.appendChild(this.fundsDisplay);
    this.container.appendChild(this.createSeparator());
    this.container.appendChild(this.dateDisplay);
    this.container.appendChild(this.createSeparator());
    this.container.appendChild(this.populationDisplay);
    this.container.appendChild(this.createSeparator());
    this.container.appendChild(this.starDisplay);
    this.container.appendChild(speedControls);
    
    document.body.appendChild(this.container);
  }

  private applyStyles(): void {
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 50px;
      background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      font-family: 'Arial', sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.5);
      z-index: 9999;
      user-select: none;
      border-bottom: 2px solid #444;
    `;
  }

  private createFundsDisplay(): HTMLSpanElement {
    const display = document.createElement('span');
    display.style.cssText = `
      font-size: 18px;
      font-weight: bold;
      color: #4CAF50;
      min-width: 150px;
      transition: all 0.3s ease;
    `;
    display.innerHTML = '💰 <span style="color: #81C784;">$0</span>';
    return display;
  }

  private createDateDisplay(): HTMLSpanElement {
    const display = document.createElement('span');
    display.style.cssText = `
      font-size: 14px;
      color: #ccc;
      min-width: 180px;
    `;
    display.innerHTML = '📅 <span>Day 1, 09:00 AM</span>';
    return display;
  }

  private createPopulationDisplay(): HTMLSpanElement {
    const display = document.createElement('span');
    display.style.cssText = `
      font-size: 14px;
      color: #64B5F6;
      min-width: 120px;
    `;
    display.innerHTML = '👥 <span>0</span> people';
    return display;
  }

  private createStarDisplay(): HTMLSpanElement {
    const display = document.createElement('span');
    display.style.cssText = `
      font-size: 18px;
      min-width: 150px;
      cursor: help;
    `;
    display.title = 'Current star rating';
    display.innerHTML = '⭐☆☆☆☆☆';
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
      { speed: 3, label: '3x', icon: '⏩' },
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
      padding: 8px 16px;
      background: #333;
      color: white;
      border: 2px solid #555;
      border-radius: 5px;
      cursor: pointer;
      font-size: 13px;
      font-weight: bold;
      transition: all 0.2s ease;
      font-family: inherit;
    `;

    // Hover effect
    button.onmouseenter = () => {
      if (this.currentSpeed !== speed) {
        button.style.background = '#444';
        button.style.borderColor = '#666';
        button.style.transform = 'translateY(-1px)';
      }
    };

    button.onmouseleave = () => {
      if (this.currentSpeed !== speed) {
        button.style.background = '#333';
        button.style.borderColor = '#555';
        button.style.transform = 'translateY(0)';
      }
    };

    // Click effect
    button.onmousedown = () => {
      button.style.transform = 'translateY(1px)';
    };

    button.onmouseup = () => {
      button.style.transform = this.currentSpeed === speed ? 'translateY(0)' : 'translateY(-1px)';
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

  private createSeparator(): HTMLDivElement {
    const separator = document.createElement('div');
    separator.style.cssText = `
      width: 1px;
      height: 30px;
      background: #444;
      margin: 0 15px;
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
    
    // Color flash on change
    if (funds > oldFunds) {
      this.fundsDisplay.style.color = '#81C784'; // Green flash
    } else if (funds < oldFunds) {
      this.fundsDisplay.style.color = '#E57373'; // Red flash
    }
    
    this.fundsDisplay.innerHTML = `💰 <span style="color: inherit;">$${funds.toLocaleString()}</span>`;
    
    // Reset color after animation
    setTimeout(() => {
      this.fundsDisplay.style.color = '#4CAF50';
    }, 300);
  }

  /** Update date/time display */
  updateDateTime(clock: GameClock): void {
    const day = clock.getDay();
    const timeString = clock.getTimeString();
    const quarter = clock.getQuarter();
    
    this.dateDisplay.innerHTML = `📅 <span>Day ${day}, ${timeString} (Q${quarter})</span>`;
  }

  /** Update population display */
  updatePopulation(population: number): void {
    this.data.population = population;
    const peopleText = population === 1 ? 'person' : 'people';
    this.populationDisplay.innerHTML = `👥 <span>${population}</span> ${peopleText}`;
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
