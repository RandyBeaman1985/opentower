/**
 * Tower Pulse Widget - Real-time tower health dashboard
 * 
 * The "one glance" widget showing:
 * - Population and capacity
 * - Mood (stress levels)
 * - Elevator capacity utilization
 * - Cash flow (income per day)
 * 
 * Design from UX spec in MASTER-PLAN-REVISED.md
 * 
 * @module ui/TowerPulse
 */

export interface TowerPulseData {
  population: number;
  maxPopulation: number;
  moodPercent: number; // 0-100, based on stress levels
  elevatorUtilization: number; // 0-100
  averageWaitTime: number; // In seconds
  giveUpCount: number; // People who gave up waiting for elevators (NEW v0.9.1)
  cashFlowPerDay: number;
  dailyExpenses: number; // NEW
  evaluationCounts: { blue: number; yellow: number; red: number }; // NEW
  inDebt: boolean; // NEW
  debtAmount: number; // NEW
  daysToBankruptcy: number; // NEW
  alerts: string[]; // "RUSH HOUR IN 12 MIN", etc.
}

export class TowerPulse {
  private container: HTMLDivElement;
  private expanded: boolean = true;
  
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
      width: 320px;
      background: rgba(0, 0, 0, 0.85);
      color: white;
      border: 2px solid #4169e1;
      border-radius: 8px;
      font-family: monospace;
      font-size: 13px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    `;
    
    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      background: #4169e1;
      padding: 8px 12px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    `;
    header.innerHTML = `
      <span>🏢 TOWER PULSE</span>
      <span id="pulse-toggle" style="cursor: pointer;">▼</span>
    `;
    header.addEventListener('click', () => this.toggle());
    widget.appendChild(header);
    
    // Content
    const content = document.createElement('div');
    content.id = 'pulse-content';
    content.style.cssText = `
      padding: 12px;
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
    
    // Calculate percentages
    const popPercent = data.maxPopulation > 0 
      ? Math.round((data.population / data.maxPopulation) * 100) 
      : 0;
    
    const elevatorPercent = Math.round(data.elevatorUtilization);
    const moodPercent = Math.round(data.moodPercent);
    
    // Format cash flow
    const netCashFlow = data.cashFlowPerDay - data.dailyExpenses;
    const cashFlowText = netCashFlow >= 0 
      ? `+$${Math.abs(netCashFlow).toLocaleString()}/day ↑`
      : `-$${Math.abs(netCashFlow).toLocaleString()}/day ↓`;
    
    const cashFlowColor = netCashFlow >= 0 ? '#32cd32' : '#ff6347';
    
    // Build HTML
    let html = `
      <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>👥 Population</span>
          <span>${data.population}/${data.maxPopulation} (${popPercent}%)</span>
        </div>
        ${this.renderBar(popPercent, '#4169e1')}
      </div>
      
      <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>😊 Mood</span>
          <span>${moodPercent}% Happy</span>
        </div>
        ${this.renderBar(moodPercent, this.getMoodColor(moodPercent))}
      </div>
      
      <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>🛗 Elevators</span>
          <span>${elevatorPercent}% Capacity</span>
        </div>
        ${this.renderBar(elevatorPercent, this.getElevatorColor(elevatorPercent))}
      </div>
      
      <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>⏱️ Wait Time</span>
          <span style="color: ${this.getWaitTimeColor(data.averageWaitTime)}; font-weight: bold;">${this.formatWaitTime(data.averageWaitTime)}</span>
        </div>
      </div>
      
      <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>😤 Gave Up</span>
          <span style="color: ${this.getGiveUpColor(data.giveUpCount)}; font-weight: bold;">${data.giveUpCount} people</span>
        </div>
      </div>
      
      <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>💰 Net Flow</span>
          <span style="color: ${cashFlowColor}; font-weight: bold;">${cashFlowText}</span>
        </div>
      </div>
      
      <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>📊 Buildings</span>
          <span>
            <span style="color: #4169e1;">●${data.evaluationCounts.blue}</span>
            <span style="color: #ffa500;">●${data.evaluationCounts.yellow}</span>
            <span style="color: #ff6347;">●${data.evaluationCounts.red}</span>
          </span>
        </div>
      </div>
    `;
    
    // Add debt warning if in debt
    if (data.inDebt) {
      html += `
        <div style="margin-bottom: 8px; padding: 8px; background: rgba(255, 0, 0, 0.2); border-left: 3px solid #ff0000; border-radius: 4px;">
          <div style="color: #ff6347; font-weight: bold; margin-bottom: 4px;">⚠️ IN DEBT</div>
          <div>Amount: -$${data.debtAmount.toLocaleString()}</div>
          ${data.daysToBankruptcy > 0 ? `<div>Days to bankruptcy: ${data.daysToBankruptcy}</div>` : '<div style="color: #ff0000; font-weight: bold;">BANKRUPT!</div>'}
        </div>
      `;
    }
    
    // Add alerts
    if (data.alerts.length > 0) {
      html += `<div style="margin-top: 12px; padding: 8px; background: rgba(255, 165, 0, 0.2); border-left: 3px solid #ffa500; border-radius: 4px;">`;
      for (const alert of data.alerts) {
        html += `<div style="margin-bottom: 4px;">⚠️ ${alert}</div>`;
      }
      html += `</div>`;
    }
    
    content.innerHTML = html;
  }
  
  /**
   * Render a progress bar
   */
  private renderBar(percent: number, color: string): string {
    const filled = Math.round(percent / 10);
    const empty = 10 - filled;
    
    return `
      <div style="display: flex; gap: 2px; margin-bottom: 4px;">
        ${Array(filled).fill(`<div style="flex: 1; height: 12px; background: ${color}; border-radius: 2px;"></div>`).join('')}
        ${Array(empty).fill(`<div style="flex: 1; height: 12px; background: rgba(255,255,255,0.1); border-radius: 2px;"></div>`).join('')}
      </div>
    `;
  }
  
  /**
   * Get mood color based on percentage
   */
  private getMoodColor(percent: number): string {
    if (percent >= 70) return '#32cd32'; // Green
    if (percent >= 40) return '#ffa500'; // Orange
    return '#ff6347'; // Red
  }
  
  /**
   * Get elevator color based on utilization
   */
  private getElevatorColor(percent: number): string {
    if (percent < 50) return '#32cd32'; // Green - good
    if (percent < 80) return '#ffa500'; // Orange - getting busy
    return '#ff6347'; // Red - overloaded
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
    if (seconds === 0) return '#888'; // Grey - no data
    if (seconds < 30) return '#32cd32'; // Green - fast
    if (seconds < 60) return '#ffa500'; // Orange - moderate
    return '#ff6347'; // Red - slow
  }
  
  /**
   * Get give-up count color based on severity
   */
  private getGiveUpColor(count: number): string {
    if (count === 0) return '#32cd32'; // Green - no issues
    if (count < 5) return '#ffa500'; // Orange - minor problem
    return '#ff6347'; // Red - major problem
  }
  
  /**
   * Toggle widget expansion
   */
  toggle(): void {
    this.expanded = !this.expanded;
    const content = document.getElementById('pulse-content');
    const toggle = document.getElementById('pulse-toggle');
    
    if (content) {
      content.style.display = this.expanded ? 'block' : 'none';
    }
    
    if (toggle) {
      toggle.textContent = this.expanded ? '▼' : '▶';
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
