/**
 * Tower Pulse Widget - Real-time tower health dashboard
 * 
 * Enhanced "at-a-glance" dashboard with:
 * - Mini sparkline charts for trends (population, funds over time)
 * - Health indicators (population satisfaction, building efficiency)
 * - Alert system integration (red/yellow/green status dots)
 * - Compact mode vs expanded mode toggle
 * - Key metrics: Population, Funds, Star Rating, Time prominently displayed
 * 
 * Design from UX spec in MASTER-PLAN-REVISED.md
 * Enhanced in Round 4 with OT_TOKENS design system
 * 
 * @module ui/TowerPulse
 */

const OT_TOKENS = {
  // Colors
  primary: '#2C5282',
  accent: '#D69E2E',
  success: '#38A169',
  danger: '#E53E3E',
  warning: '#DD6B20',
  
  // Surfaces
  bgPrimary: '#1A202C',
  bgSecondary: '#2D3748',
  bgElevated: '#4A5568',
  bgCard: '#374151',
  
  // Text
  textPrimary: '#F7FAFC',
  textSecondary: '#A0AEC0',
  textMuted: '#718096',
  
  // Effects
  glowAccent: '0 0 12px rgba(214, 158, 46, 0.5)',
  shadowCard: '0 4px 12px rgba(0, 0, 0, 0.4)',
  shadowHover: '0 8px 24px rgba(0, 0, 0, 0.6)',
  
  // Animation
  easeOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
  easeSnap: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  durationFast: '150ms',
  durationNormal: '250ms',
  
  // Fonts
  fontMono: "'JetBrains Mono', 'Courier New', monospace",
  fontBody: "'Inter', -apple-system, system-ui, sans-serif",
};

export interface TowerPulseData {
  population: number;
  maxPopulation: number;
  moodPercent: number; // 0-100, based on stress levels
  elevatorUtilization: number; // 0-100
  averageWaitTime: number; // In seconds
  giveUpCount: number; // People who gave up waiting for elevators
  cashFlowPerDay: number;
  dailyExpenses: number;
  currentFunds?: number; // OPTIONAL for sparkline (will use 0 if not provided)
  starRating?: number; // OPTIONAL for prominent display (0-5, defaults to 0)
  gameTime?: string; // OPTIONAL for time display (e.g., "Day 5, 09:30")
  evaluationCounts: { blue: number; yellow: number; red: number };
  inDebt: boolean;
  debtAmount: number;
  daysToBankruptcy: number;
  alerts: string[]; // "RUSH HOUR IN 12 MIN", etc.
}

interface HistoryData {
  population: number[];
  funds: number[];
  maxPoints: number;
}

export class TowerPulse {
  private container: HTMLDivElement;
  private expanded: boolean = true;
  private history: HistoryData = {
    population: [],
    funds: [],
    maxPoints: 30 // Store last 30 data points for sparklines
  };
  
  constructor() {
    this.container = this.createWidget();
    document.body.appendChild(this.container);
  }
  
  /**
   * Create the widget HTML
   */
  private createWidget(): HTMLDivElement {
    const widget = document.createElement('div');
    widget.id = 'tower-pulse';
    widget.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 360px;
      background: linear-gradient(135deg, ${OT_TOKENS.bgPrimary} 0%, ${OT_TOKENS.bgSecondary} 100%);
      color: ${OT_TOKENS.textPrimary};
      border: 2px solid ${OT_TOKENS.primary};
      border-radius: 12px;
      font-family: ${OT_TOKENS.fontBody};
      font-size: 13px;
      z-index: 1000;
      box-shadow: ${OT_TOKENS.shadowCard};
      transition: all ${OT_TOKENS.durationNormal} ${OT_TOKENS.easeOut};
    `;
    
    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, ${OT_TOKENS.primary} 0%, #1E3A5F 100%);
      padding: 10px 14px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      border-radius: 10px 10px 0 0;
      transition: all ${OT_TOKENS.durationFast} ${OT_TOKENS.easeOut};
    `;
    header.innerHTML = `
      <span style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">🏢</span>
        <span>TOWER PULSE</span>
      </span>
      <span id="pulse-toggle" style="cursor: pointer; font-size: 12px; transition: transform ${OT_TOKENS.durationFast} ${OT_TOKENS.easeOut};">▼</span>
    `;
    header.addEventListener('click', () => this.toggle());
    header.addEventListener('mouseenter', () => {
      header.style.background = `linear-gradient(135deg, #3A6BA5 0%, #2D4A6F 100%)`;
    });
    header.addEventListener('mouseleave', () => {
      header.style.background = `linear-gradient(135deg, ${OT_TOKENS.primary} 0%, #1E3A5F 100%)`;
    });
    widget.appendChild(header);
    
    // Content
    const content = document.createElement('div');
    content.id = 'pulse-content';
    content.style.cssText = `
      padding: 14px;
    `;
    widget.appendChild(content);
    
    return widget;
  }
  
  /**
   * Update widget with current data
   */
  update(data: TowerPulseData): void {
    const content = document.getElementById('pulse-content');
    if (!content) return;
    
    // Update history for sparklines
    this.history.population.push(data.population);
    this.history.funds.push(data.currentFunds || 0);
    if (this.history.population.length > this.history.maxPoints) {
      this.history.population.shift();
      this.history.funds.shift();
    }
    
    // Calculate health status
    const healthStatus = this.calculateHealthStatus(data);
    
    // Calculate percentages
    const popPercent = data.maxPopulation > 0 
      ? Math.round((data.population / data.maxPopulation) * 100) 
      : 0;
    
    const elevatorPercent = Math.round(data.elevatorUtilization);
    const moodPercent = Math.round(data.moodPercent);
    
    // Format cash flow
    const netCashFlow = data.cashFlowPerDay - data.dailyExpenses;
    const cashFlowText = netCashFlow >= 0 
      ? `+$${Math.abs(netCashFlow).toLocaleString()}`
      : `-$${Math.abs(netCashFlow).toLocaleString()}`;
    
    const cashFlowColor = netCashFlow >= 0 ? OT_TOKENS.success : OT_TOKENS.danger;
    
    // Build HTML
    let html = '';
    
    // Key Metrics Banner (Always visible in compact mode)
    html += `
      <div id="pulse-banner" style="
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        margin-bottom: 14px;
        padding-bottom: 14px;
        border-bottom: 1px solid ${OT_TOKENS.bgElevated};
      ">
        <div style="
          background: ${OT_TOKENS.bgCard};
          padding: 10px;
          border-radius: 8px;
          border-left: 3px solid ${OT_TOKENS.primary};
        ">
          <div style="font-size: 10px; color: ${OT_TOKENS.textMuted}; text-transform: uppercase; margin-bottom: 4px;">Population</div>
          <div style="font-family: ${OT_TOKENS.fontMono}; font-size: 18px; font-weight: 700; color: ${OT_TOKENS.textPrimary};">
            ${data.population.toLocaleString()}
            <span style="font-size: 12px; color: ${OT_TOKENS.textSecondary};">/${data.maxPopulation}</span>
          </div>
          ${this.renderSparkline(this.history.population, OT_TOKENS.primary)}
        </div>
        
        <div style="
          background: ${OT_TOKENS.bgCard};
          padding: 10px;
          border-radius: 8px;
          border-left: 3px solid ${OT_TOKENS.accent};
        ">
          <div style="font-size: 10px; color: ${OT_TOKENS.textMuted}; text-transform: uppercase; margin-bottom: 4px;">Funds</div>
          <div style="font-family: ${OT_TOKENS.fontMono}; font-size: 18px; font-weight: 700; color: ${cashFlowColor};">
            $${(data.currentFunds || 0).toLocaleString()}
          </div>
          ${this.renderSparkline(this.history.funds, cashFlowColor)}
        </div>
        
        <div style="
          background: ${OT_TOKENS.bgCard};
          padding: 10px;
          border-radius: 8px;
          border-left: 3px solid ${OT_TOKENS.warning};
        ">
          <div style="font-size: 10px; color: ${OT_TOKENS.textMuted}; text-transform: uppercase; margin-bottom: 4px;">Rating</div>
          <div style="font-family: ${OT_TOKENS.fontMono}; font-size: 18px; font-weight: 700; color: ${OT_TOKENS.warning};">
            ${this.renderStars(data.starRating || 0)}
          </div>
          <div style="font-size: 11px; color: ${OT_TOKENS.textSecondary}; margin-top: 2px;">${(data.starRating || 0).toFixed(1)} stars</div>
        </div>
        
        <div style="
          background: ${OT_TOKENS.bgCard};
          padding: 10px;
          border-radius: 8px;
          border-left: 3px solid ${OT_TOKENS.success};
        ">
          <div style="font-size: 10px; color: ${OT_TOKENS.textMuted}; text-transform: uppercase; margin-bottom: 4px;">Time</div>
          <div style="font-family: ${OT_TOKENS.fontMono}; font-size: 14px; font-weight: 600; color: ${OT_TOKENS.textPrimary}; line-height: 1.3;">
            ${data.gameTime || 'Day 1, 00:00'}
          </div>
          <div style="font-size: 11px; color: ${OT_TOKENS.textSecondary}; margin-top: 2px;">Net: ${cashFlowText}/day</div>
        </div>
      </div>
    `;
    
    // Expanded details
    html += `<div id="pulse-details">`;
    
    // Health Status Indicators
    html += `
      <div style="margin-bottom: 12px;">
        <div style="
          font-size: 11px;
          color: ${OT_TOKENS.textMuted};
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          font-weight: 600;
        ">System Health</div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${this.renderHealthIndicator('Population', healthStatus.population)}
          ${this.renderHealthIndicator('Satisfaction', healthStatus.satisfaction)}
          ${this.renderHealthIndicator('Transport', healthStatus.transport)}
          ${this.renderHealthIndicator('Buildings', healthStatus.buildings)}
          ${this.renderHealthIndicator('Finances', healthStatus.finances)}
        </div>
      </div>
    `;
    
    // Detailed Metrics with Progress Bars
    html += `
      <div style="margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-size: 12px; color: ${OT_TOKENS.textSecondary};">👥 Population Capacity</span>
          <span style="font-family: ${OT_TOKENS.fontMono}; font-size: 12px; font-weight: 600;">${popPercent}%</span>
        </div>
        ${this.renderProgressBar(popPercent, OT_TOKENS.primary)}
      </div>
      
      <div style="margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-size: 12px; color: ${OT_TOKENS.textSecondary};">😊 Mood</span>
          <span style="font-family: ${OT_TOKENS.fontMono}; font-size: 12px; font-weight: 600;">${moodPercent}%</span>
        </div>
        ${this.renderProgressBar(moodPercent, this.getMoodColor(moodPercent))}
      </div>
      
      <div style="margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-size: 12px; color: ${OT_TOKENS.textSecondary};">🛗 Elevator Load</span>
          <span style="font-family: ${OT_TOKENS.fontMono}; font-size: 12px; font-weight: 600;">${elevatorPercent}%</span>
        </div>
        ${this.renderProgressBar(elevatorPercent, this.getElevatorColor(elevatorPercent))}
      </div>
      
      <div style="
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        margin-bottom: 10px;
        padding: 10px;
        background: ${OT_TOKENS.bgCard};
        border-radius: 8px;
      ">
        <div>
          <div style="font-size: 10px; color: ${OT_TOKENS.textMuted}; margin-bottom: 4px;">⏱️ Avg Wait</div>
          <div style="font-family: ${OT_TOKENS.fontMono}; font-size: 14px; font-weight: 600; color: ${this.getWaitTimeColor(data.averageWaitTime)};">
            ${this.formatWaitTime(data.averageWaitTime)}
          </div>
        </div>
        <div>
          <div style="font-size: 10px; color: ${OT_TOKENS.textMuted}; margin-bottom: 4px;">😤 Gave Up</div>
          <div style="font-family: ${OT_TOKENS.fontMono}; font-size: 14px; font-weight: 600; color: ${this.getGiveUpColor(data.giveUpCount)};">
            ${data.giveUpCount}
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 12px; color: ${OT_TOKENS.textSecondary};">📊 Building Status</span>
          <span style="font-family: ${OT_TOKENS.fontMono}; font-size: 11px;">
            <span style="color: ${OT_TOKENS.primary}; margin-right: 6px;">●${data.evaluationCounts.blue}</span>
            <span style="color: ${OT_TOKENS.warning}; margin-right: 6px;">●${data.evaluationCounts.yellow}</span>
            <span style="color: ${OT_TOKENS.danger};">●${data.evaluationCounts.red}</span>
          </span>
        </div>
      </div>
    `;
    
    // Debt warning if in debt
    if (data.inDebt) {
      html += `
        <div style="
          margin-bottom: 10px;
          padding: 10px;
          background: rgba(229, 62, 62, 0.15);
          border-left: 3px solid ${OT_TOKENS.danger};
          border-radius: 6px;
        ">
          <div style="color: ${OT_TOKENS.danger}; font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 14px;">⚠️</span>
            <span>DEBT ALERT</span>
          </div>
          <div style="font-size: 12px; color: ${OT_TOKENS.textSecondary};">
            <div>Amount: <span style="font-family: ${OT_TOKENS.fontMono}; color: ${OT_TOKENS.danger};">-$${data.debtAmount.toLocaleString()}</span></div>
            ${data.daysToBankruptcy > 0 
              ? `<div>Bankruptcy in: <span style="font-family: ${OT_TOKENS.fontMono}; font-weight: 600;">${data.daysToBankruptcy} days</span></div>` 
              : '<div style="color: ' + OT_TOKENS.danger + '; font-weight: 700;">BANKRUPT!</div>'}
          </div>
        </div>
      `;
    }
    
    // Alerts
    if (data.alerts.length > 0) {
      html += `
        <div style="
          padding: 10px;
          background: rgba(221, 107, 32, 0.15);
          border-left: 3px solid ${OT_TOKENS.warning};
          border-radius: 6px;
        ">
          <div style="color: ${OT_TOKENS.warning}; font-weight: 700; margin-bottom: 6px; font-size: 11px; text-transform: uppercase;">
            Active Alerts
          </div>
      `;
      for (const alert of data.alerts) {
        html += `<div style="margin-bottom: 4px; font-size: 12px; color: ${OT_TOKENS.textSecondary};">⚠️ ${alert}</div>`;
      }
      html += `</div>`;
    }
    
    html += `</div>`; // Close pulse-details
    
    content.innerHTML = html;
  }
  
  /**
   * Calculate overall health status for different systems
   */
  private calculateHealthStatus(data: TowerPulseData): {
    population: 'good' | 'warning' | 'critical';
    satisfaction: 'good' | 'warning' | 'critical';
    transport: 'good' | 'warning' | 'critical';
    buildings: 'good' | 'warning' | 'critical';
    finances: 'good' | 'warning' | 'critical';
  } {
    // Population health (based on capacity usage)
    const popPercent = data.maxPopulation > 0 ? (data.population / data.maxPopulation) * 100 : 0;
    const population = popPercent < 80 ? 'good' : popPercent < 95 ? 'warning' : 'critical';
    
    // Satisfaction (based on mood)
    const satisfaction = data.moodPercent >= 70 ? 'good' : data.moodPercent >= 40 ? 'warning' : 'critical';
    
    // Transport (based on elevator utilization and wait time)
    const transport = 
      data.elevatorUtilization < 70 && data.averageWaitTime < 30 ? 'good' :
      data.elevatorUtilization < 85 && data.averageWaitTime < 60 ? 'warning' : 'critical';
    
    // Buildings (based on evaluation counts)
    const totalBuildings = data.evaluationCounts.blue + data.evaluationCounts.yellow + data.evaluationCounts.red;
    const redPercent = totalBuildings > 0 ? (data.evaluationCounts.red / totalBuildings) * 100 : 0;
    const buildings = redPercent < 20 ? 'good' : redPercent < 40 ? 'warning' : 'critical';
    
    // Finances (based on cash flow and debt)
    const netCashFlow = data.cashFlowPerDay - data.dailyExpenses;
    const finances = 
      !data.inDebt && netCashFlow > 0 ? 'good' :
      data.inDebt && data.daysToBankruptcy > 5 ? 'warning' : 'critical';
    
    return { population, satisfaction, transport, buildings, finances };
  }
  
  /**
   * Render health indicator badge
   */
  private renderHealthIndicator(label: string, status: 'good' | 'warning' | 'critical'): string {
    const colors = {
      good: OT_TOKENS.success,
      warning: OT_TOKENS.warning,
      critical: OT_TOKENS.danger
    };
    
    const dotColors = {
      good: '#38A169',
      warning: '#DD6B20',
      critical: '#E53E3E'
    };
    
    return `
      <div style="
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        background: ${OT_TOKENS.bgCard};
        border-radius: 6px;
        border: 1px solid ${colors[status]}30;
      ">
        <span style="
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${dotColors[status]};
          box-shadow: 0 0 8px ${dotColors[status]};
          animation: pulse-dot 2s ease-in-out infinite;
        "></span>
        <span style="font-size: 11px; color: ${OT_TOKENS.textSecondary}; white-space: nowrap;">${label}</span>
      </div>
    `;
  }
  
  /**
   * Render a mini sparkline chart
   */
  private renderSparkline(data: number[], color: string): string {
    if (data.length < 2) {
      return `<div style="height: 20px;"></div>`;
    }
    
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    
    const width = 100;
    const height = 20;
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
    
    return `
      <svg width="100%" height="20" style="margin-top: 4px;">
        <polyline
          points="${points}"
          fill="none"
          stroke="${color}"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          opacity="0.8"
        />
      </svg>
    `;
  }
  
  /**
   * Render star rating
   */
  private renderStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    
    return '★'.repeat(fullStars) + (hasHalf ? '☆' : '') + '☆'.repeat(emptyStars);
  }
  
  /**
   * Render a modern progress bar
   */
  private renderProgressBar(percent: number, color: string): string {
    return `
      <div style="
        width: 100%;
        height: 8px;
        background: ${OT_TOKENS.bgElevated};
        border-radius: 4px;
        overflow: hidden;
        position: relative;
      ">
        <div style="
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: ${Math.min(percent, 100)}%;
          background: linear-gradient(90deg, ${color} 0%, ${color}CC 100%);
          border-radius: 4px;
          transition: width ${OT_TOKENS.durationNormal} ${OT_TOKENS.easeOut};
          box-shadow: 0 0 8px ${color}50;
        "></div>
      </div>
    `;
  }
  
  /**
   * Get mood color based on percentage
   */
  private getMoodColor(percent: number): string {
    if (percent >= 70) return OT_TOKENS.success;
    if (percent >= 40) return OT_TOKENS.warning;
    return OT_TOKENS.danger;
  }
  
  /**
   * Get elevator color based on utilization
   */
  private getElevatorColor(percent: number): string {
    if (percent < 70) return OT_TOKENS.success;
    if (percent < 85) return OT_TOKENS.warning;
    return OT_TOKENS.danger;
  }

  /**
   * Format wait time for display
   */
  private formatWaitTime(seconds: number): string {
    if (seconds === 0) return 'No data';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  }

  /**
   * Get wait time color based on duration
   */
  private getWaitTimeColor(seconds: number): string {
    if (seconds === 0) return OT_TOKENS.textMuted;
    if (seconds < 30) return OT_TOKENS.success;
    if (seconds < 60) return OT_TOKENS.warning;
    return OT_TOKENS.danger;
  }
  
  /**
   * Get give-up count color based on severity
   */
  private getGiveUpColor(count: number): string {
    if (count === 0) return OT_TOKENS.success;
    if (count < 5) return OT_TOKENS.warning;
    return OT_TOKENS.danger;
  }
  
  /**
   * Toggle widget expansion
   */
  toggle(): void {
    this.expanded = !this.expanded;
    const details = document.getElementById('pulse-details');
    const toggle = document.getElementById('pulse-toggle');
    
    if (details) {
      details.style.display = this.expanded ? 'block' : 'none';
    }
    
    if (toggle) {
      toggle.textContent = this.expanded ? '▼' : '▶';
      toggle.style.transform = this.expanded ? 'rotate(0deg)' : 'rotate(-90deg)';
    }
    
    // Adjust container width for compact mode
    if (this.container) {
      this.container.style.width = this.expanded ? '360px' : '360px'; // Keep same width, just hide details
    }
  }
  
  /**
   * Remove widget from DOM
   */
  destroy(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

// Add pulsing animation for status dots
if (!document.getElementById('tower-pulse-styles')) {
  const style = document.createElement('style');
  style.id = 'tower-pulse-styles';
  style.textContent = `
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `;
  document.head.appendChild(style);
}
