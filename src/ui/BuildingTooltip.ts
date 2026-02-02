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

export interface TooltipData {
  building?: Building;
  elevator?: ElevatorShaft;
  position: { x: number; y: number };
}

export class BuildingTooltip {
  private container: HTMLDivElement;
  private visible: boolean = false;
  private currentData: TooltipData | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'building-tooltip';
    this.container.style.cssText = `
      position: fixed;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 10px 12px;
      font-family: monospace;
      font-size: 11px;
      border-radius: 6px;
      pointer-events: none;
      z-index: 2000;
      display: none;
      min-width: 200px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.2);
    `;

    document.body.appendChild(this.container);
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
      <div style="font-weight: bold; font-size: 13px; margin-bottom: 6px; color: #fbbf24;">
        ${config.name}
      </div>
    `;

    // Type and category
    html += `
      <div style="opacity: 0.7; font-size: 10px; margin-bottom: 4px;">
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
      const occupancyColor = occupancyPercent > 80 ? '#ef4444' : occupancyPercent > 50 ? '#fbbf24' : '#10b981';
      html += `
        <div style="margin-bottom: 4px;">
          <span style="opacity: 0.8;">Occupancy:</span> 
          <span style="color: ${occupancyColor}; font-weight: bold;">
            ${occupancy}/${capacity}
          </span>
          <span style="opacity: 0.7;"> (${occupancyPercent}%)</span>
        </div>
      `;
    }

    // Hotel-specific info
    if (building.type.startsWith('hotel')) {
      html += this.renderHotelInfo(building);
    }

    // Income/day
    if (dailyIncome > 0 || dailyMaintenance > 0) {
      const netColor = netDaily > 0 ? '#10b981' : netDaily < 0 ? '#ef4444' : '#888';
      html += `
        <div style="margin-bottom: 4px;">
          <span style="opacity: 0.8;">Income/day:</span> 
          <span style="color: ${netColor}; font-weight: bold;">
            $${netDaily.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      `;
      
      if (dailyMaintenance > 0) {
        html += `
          <div style="font-size: 10px; opacity: 0.6; margin-left: 10px;">
            Revenue: $${dailyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })} 
            | Costs: $${dailyMaintenance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        `;
      }
    }

    // Stress level
    if (building.stress > 0) {
      const stressColor = building.stress > 80 ? '#ef4444' : building.stress > 50 ? '#fbbf24' : '#10b981';
      html += `
        <div style="margin-bottom: 4px;">
          <span style="opacity: 0.8;">Stress:</span> 
          <span style="color: ${stressColor}; font-weight: bold;">
            ${building.stress}%
          </span>
        </div>
      `;
    }

    // Size info
    html += `
      <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 10px; opacity: 0.6;">
        ${building.width} tiles × ${building.height} floor${building.height > 1 ? 's' : ''}
        • $${config.cost.toLocaleString()} cost
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
