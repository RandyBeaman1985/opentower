/**
 * BuildingTooltip - Shows info when hovering over buildings
 * 
 * Displays:
 * - Building type and name
 * - Occupancy (current/max)
 * - Income per day
 * - Stress level (if applicable)
 * - For hotels: room count, current guests
 * - For elevators: floors served, passenger count
 */

import type { Building } from '@/interfaces';
import type { ElevatorShaft } from '@/entities/ElevatorShaft';
import { BUILDING_CONFIGS } from '@/interfaces/buildings';
import type { EvaluationSystem } from '@/simulation/EvaluationSystem';

export interface TooltipData {
  building?: Building;
  elevator?: ElevatorShaft;
  position: { x: number; y: number };
}

export class BuildingTooltip {
  private container: HTMLDivElement;
  private visible: boolean = false;
  private currentData: TooltipData | null = null;
  private evaluationSystem: EvaluationSystem | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'building-tooltip';
    this.container.style.cssText = `
      position: fixed;
      background: linear-gradient(135deg, rgba(30,30,30,0.98) 0%, rgba(20,20,20,0.98) 100%);
      color: white;
      padding: 14px 16px;
      font-family: 'Segoe UI', 'Roboto', sans-serif;
      font-size: 13px;
      border-radius: 10px;
      pointer-events: none;
      z-index: 2000;
      display: none;
      min-width: 240px;
      max-width: 320px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.1);
      border: 2px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      animation: tooltipFadeIn 0.2s ease;
    `;

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes tooltipFadeIn {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(-5px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(this.container);
  }

  /**
   * Set the evaluation system for displaying building evaluations
   */
  setEvaluationSystem(evaluationSystem: EvaluationSystem): void {
    this.evaluationSystem = evaluationSystem;
  }

  /**
   * Show tooltip with building data
   */
  show(data: TooltipData): void {
    this.currentData = data;
    this.visible = true;
    this.render();
    this.updatePosition(data.position.x, data.position.y);
    this.container.style.display = 'block';
  }

  /**
   * Hide tooltip
   */
  hide(): void {
    this.visible = false;
    this.currentData = null;
    this.container.style.display = 'none';
  }

  /**
   * Update tooltip position
   */
  updatePosition(x: number, y: number): void {
    // Offset to bottom-right of cursor
    const offsetX = 15;
    const offsetY = 15;
    
    // Keep tooltip on screen
    const maxX = window.innerWidth - this.container.offsetWidth - 10;
    const maxY = window.innerHeight - this.container.offsetHeight - 10;
    
    const finalX = Math.min(x + offsetX, maxX);
    const finalY = Math.min(y + offsetY, maxY);
    
    this.container.style.left = `${finalX}px`;
    this.container.style.top = `${finalY}px`;
  }

  /**
   * Render tooltip content
   */
  private render(): void {
    if (!this.currentData) return;

    const { building, elevator } = this.currentData;

    if (building) {
      this.container.innerHTML = this.renderBuildingTooltip(building);
    } else if (elevator) {
      this.container.innerHTML = this.renderElevatorTooltip(elevator);
    }
  }

  /**
   * Render building tooltip content
   */
  private renderBuildingTooltip(building: Building): string {
    const config = BUILDING_CONFIGS[building.type];
    const occupancy = building.occupantIds.length;
    const capacity = config.capacity;
    const occupancyPercent = capacity > 0 ? Math.round((occupancy / capacity) * 100) : 0;

    // Calculate daily income (quarterly income / 90 days)
    const dailyIncome = building.incomePerQuarter / 90;
    const dailyMaintenance = building.maintenanceCostPerQuarter / 90;
    const netDaily = dailyIncome - dailyMaintenance;

    let html = `
      <div style="
        font-weight: 700;
        font-size: 16px;
        margin-bottom: 8px;
        color: #FFA726;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        padding-bottom: 8px;
        border-bottom: 2px solid rgba(255,167,38,0.3);
      ">
        ${config.name}
      </div>
    `;

    // Type and category
    html += `
      <div style="
        opacity: 0.7;
        font-size: 11px;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 500;
      ">
        ${this.formatCategory(config.category)}
      </div>
    `;

    // State
    html += `
      <div style="margin-bottom: 6px;">
        <span style="opacity: 0.8;">Status:</span> ${this.formatState(building.state)}
      </div>
    `;

    // Occupancy (if building has capacity)
    if (capacity > 0) {
      const occupancyColor = occupancyPercent > 80 ? '#EF5350' : occupancyPercent > 50 ? '#FFA726' : '#66BB6A';
      html += `
        <div style="
          margin: 8px 0;
          padding: 8px;
          background: rgba(255,255,255,0.05);
          border-radius: 6px;
          border-left: 3px solid ${occupancyColor};
        ">
          <div style="opacity: 0.8; font-size: 11px; margin-bottom: 4px; font-weight: 600;">Occupancy</div>
          <div style="display: flex; align-items: baseline; gap: 6px;">
            <span style="color: ${occupancyColor}; font-weight: 700; font-size: 18px; font-family: 'Courier New', monospace;">
              ${occupancy}
            </span>
            <span style="opacity: 0.6; font-size: 14px;">/ ${capacity}</span>
            <span style="opacity: 0.5; font-size: 11px; margin-left: auto;">(${occupancyPercent}%)</span>
          </div>
        </div>
      `;
    }

    // Hotel-specific info
    if (building.type.startsWith('hotel')) {
      html += this.renderHotelInfo(building);
    }

    // Income/day
    if (dailyIncome > 0 || dailyMaintenance > 0) {
      const netColor = netDaily > 0 ? '#66BB6A' : netDaily < 0 ? '#EF5350' : '#888';
      html += `
        <div style="
          margin: 8px 0;
          padding: 8px;
          background: rgba(255,255,255,0.05);
          border-radius: 6px;
          border-left: 3px solid ${netColor};
        ">
          <div style="opacity: 0.8; font-size: 11px; margin-bottom: 4px; font-weight: 600;">Daily Income</div>
          <div style="display: flex; align-items: baseline; gap: 6px;">
            <span style="color: ${netColor}; font-weight: 700; font-size: 18px; font-family: 'Courier New', monospace;">
              ${netDaily >= 0 ? '+' : ''}$${netDaily.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
      `;
      
      if (dailyMaintenance > 0) {
        html += `
          <div style="font-size: 10px; opacity: 0.5; margin-top: 4px; font-family: 'Courier New', monospace;">
            <span style="color: #66BB6A;">+$${dailyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span style="opacity: 0.7;"> • </span>
            <span style="color: #EF5350;">-$${dailyMaintenance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        `;
      }
      
      html += `</div>`;
    }

    // Stress level
    if (building.stress > 0) {
      const stressColor = building.stress > 80 ? '#EF5350' : building.stress > 50 ? '#FFA726' : '#66BB6A';
      html += `
        <div style="
          margin: 8px 0;
          padding: 6px 8px;
          background: rgba(255,255,255,0.05);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <span style="opacity: 0.8; font-size: 11px; font-weight: 600;">Stress Level</span>
          <span style="color: ${stressColor}; font-weight: 700; font-size: 14px; font-family: 'Courier New', monospace;">
            ${building.stress}%
          </span>
        </div>
      `;
    }

    // Evaluation score (BUG-025 FIX)
    if (this.evaluationSystem) {
      const evaluation = this.evaluationSystem.getEvaluation(building.id);
      const score = Math.round(evaluation.score);
      const color = evaluation.color;
      const colorHex = color === 'blue' ? '#42A5F5' : color === 'yellow' ? '#FFA726' : '#EF5350';
      const label = color === 'blue' ? 'Excellent' : color === 'yellow' ? 'Fair' : 'Poor';

      html += `
        <div style="
          margin: 8px 0;
          padding: 8px;
          background: rgba(255,255,255,0.05);
          border-radius: 6px;
          border-left: 3px solid ${colorHex};
        ">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="opacity: 0.8; font-size: 11px; font-weight: 600;">Evaluation</span>
            <span style="color: ${colorHex}; font-weight: 700; font-size: 14px; font-family: 'Courier New', monospace;">
              ${score}%
            </span>
          </div>
          <div style="
            height: 8px;
            background: rgba(0,0,0,0.3);
            border-radius: 4px;
            overflow: hidden;
            position: relative;
          ">
            <div style="
              position: absolute;
              left: 0;
              top: 0;
              height: 100%;
              width: ${score}%;
              background: ${colorHex};
              border-radius: 4px;
              transition: width 0.3s ease;
            "></div>
          </div>
          <div style="
            margin-top: 4px;
            font-size: 10px;
            opacity: 0.6;
            text-align: right;
          ">${label}</div>
        </div>
      `;

      // Show breakdown of factors affecting evaluation
      if (evaluation.factors) {
        const factors = evaluation.factors;
        const hasNegativeFactors = Object.values(factors).some(v => v < 0);
        
        if (hasNegativeFactors) {
          html += `
            <div style="
              margin: 8px 0;
              padding: 6px 8px;
              background: rgba(255,255,255,0.03);
              border-radius: 6px;
              font-size: 10px;
              opacity: 0.7;
            ">
              <div style="font-weight: 600; margin-bottom: 4px;">Issues:</div>
          `;

          if (factors.waitTime < 0) {
            html += `<div style="margin: 2px 0;">• Elevator wait time: ${factors.waitTime}%</div>`;
          }
          if (factors.walkDistance < 0) {
            html += `<div style="margin: 2px 0;">• Walking distance: ${factors.walkDistance}%</div>`;
          }
          if (factors.noise < 0) {
            html += `<div style="margin: 2px 0;">• Noise: ${factors.noise}%</div>`;
          }
          if (factors.rent < 0) {
            html += `<div style="margin: 2px 0;">• Rent too high: ${factors.rent}%</div>`;
          }
          if (factors.services < 0) {
            html += `<div style="margin: 2px 0;">• Missing services: ${factors.services}%</div>`;
          }

          html += `</div>`;
        }
      }
    }

    // Size info
    html += `
      <div style="
        margin-top: 10px;
        padding-top: 10px;
        border-top: 2px solid rgba(255,255,255,0.1);
        font-size: 11px;
        opacity: 0.5;
        font-family: 'Courier New', monospace;
        display: flex;
        justify-content: space-between;
      ">
        <span>${building.width}×${building.height} tiles</span>
        <span>$${config.cost.toLocaleString()}</span>
      </div>
    `;

    return html;
  }

  /**
   * Render hotel-specific information
   */
  private renderHotelInfo(building: Building): string {
    // Calculate room count based on building type
    let roomCount = 0;
    let roomRate = 0;

    switch (building.type) {
      case 'hotelSingle':
        roomCount = Math.floor(building.width / 4); // 4 tiles per single room
        roomRate = 100;
        break;
      case 'hotelTwin':
        roomCount = Math.floor(building.width / 6); // 6 tiles per twin room
        roomRate = 150;
        break;
      case 'hotelSuite':
        roomCount = Math.floor(building.width / 10); // 10 tiles per suite
        roomRate = 300;
        break;
    }

    const guests = building.occupantIds.length;
    const vacantRooms = roomCount - guests;

    return `
      <div style="margin: 6px 0; padding: 6px; background: rgba(255,255,255,0.05); border-radius: 4px;">
        <div style="font-size: 10px; opacity: 0.7; margin-bottom: 3px;">Hotel Info:</div>
        <div style="font-size: 11px;">
          <span style="opacity: 0.8;">Rooms:</span> ${roomCount}
          <span style="opacity: 0.6;"> (${vacantRooms} vacant)</span>
        </div>
        <div style="font-size: 11px;">
          <span style="opacity: 0.8;">Current guests:</span> ${guests}
        </div>
        <div style="font-size: 11px;">
          <span style="opacity: 0.8;">Rate:</span> $${roomRate}/night
        </div>
      </div>
    `;
  }

  /**
   * Render elevator tooltip content
   */
  private renderElevatorTooltip(elevator: ElevatorShaft): string {
    const floorCount = elevator.maxFloor - elevator.minFloor + 1;
    const carCount = elevator.cars.length;
    
    // Count total passengers across all cars
    let totalPassengers = 0;
    elevator.cars.forEach(car => {
      totalPassengers += car.passengerIds.length;
    });

    // Calculate cost (base $200K + $80K per floor)
    const cost = 200000 + (floorCount * 80000);

    let html = `
      <div style="font-weight: bold; font-size: 13px; margin-bottom: 6px; color: #4a9eff;">
        Standard Elevator
      </div>
    `;

    html += `
      <div style="margin-bottom: 4px;">
        <span style="opacity: 0.8;">Floors served:</span> 
        <span style="font-weight: bold;">
          ${elevator.minFloor} to ${elevator.maxFloor}
        </span>
        <span style="opacity: 0.7;"> (${floorCount} floors)</span>
      </div>
    `;

    html += `
      <div style="margin-bottom: 4px;">
        <span style="opacity: 0.8;">Cars:</span> 
        <span style="font-weight: bold;">
          ${carCount}
        </span>
      </div>
    `;

    html += `
      <div style="margin-bottom: 4px;">
        <span style="opacity: 0.8;">Passengers:</span> 
        <span style="font-weight: bold; color: ${totalPassengers > 0 ? '#fbbf24' : '#888'};">
          ${totalPassengers}
        </span>
      </div>
    `;

    // Show car status
    if (carCount > 0) {
      html += `
        <div style="margin: 6px 0; padding: 6px; background: rgba(255,255,255,0.05); border-radius: 4px;">
          <div style="font-size: 10px; opacity: 0.7; margin-bottom: 3px;">Cars:</div>
      `;
      
      elevator.cars.forEach((car, index) => {
        const state = car.direction === 'idle' ? '🟢' : 
                     car.direction === 'up' ? '🔵⬆' : 
                     car.direction === 'down' ? '🔵⬇' : '⚪';
        const floorDisplay = Math.floor(car.currentFloor);
        html += `
          <div style="font-size: 10px;">
            ${state} Car ${index + 1}: Floor ${floorDisplay} 
            <span style="opacity: 0.6;">(${car.passengerIds.length} pax)</span>
          </div>
        `;
      });
      
      html += `</div>`;
    }

    html += `
      <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 10px; opacity: 0.6;">
        Cost: $${cost.toLocaleString()}
      </div>
    `;

    return html;
  }

  /**
   * Format building category for display
   */
  private formatCategory(category: string): string {
    return category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  /**
   * Format building state for display
   */
  private formatState(state: string): string {
    const stateColors: Record<string, string> = {
      active: '#10b981',
      constructing: '#fbbf24',
      closed: '#ef4444',
      vacant: '#6b7280',
      damaged: '#ef4444',
      evacuated: '#ef4444',
      infested: '#dc2626',
      demolishing: '#ef4444',
    };

    const color = stateColors[state] || '#888';
    const label = state.charAt(0).toUpperCase() + state.slice(1);

    return `<span style="color: ${color}; font-weight: bold;">${label}</span>`;
  }

  /**
   * Check if tooltip is currently visible
   */
  isVisible(): boolean {
    return this.visible;
  }
}
