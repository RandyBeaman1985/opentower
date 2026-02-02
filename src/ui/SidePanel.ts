/**
 * SidePanel - Detailed information display
 * 
 * Shows context-sensitive information:
 * - Building info (when building selected)
 * - Tenant details (occupancy, satisfaction)
 * - Financial breakdown (income, costs)
 * - Elevator programming (when elevator selected)
 * 
 * Slides in from the left side of the screen.
 */

import type { BuildingType, QuarterlyReport } from '@/interfaces';
import { BUILDING_CONFIGS } from '@/interfaces';

export interface BuildingInfo {
  id: string;
  type: BuildingType;
  floor: number;
  x: number;
  width: number;
  occupancy?: number;
  maxOccupancy?: number;
  satisfaction?: number;
  income?: number;
  maintenanceCost?: number;
}

export interface FinancialData {
  currentFunds: number;
  lastQuarterReport?: QuarterlyReport;
  incomePerQuarter: number;
  maintenancePerQuarter: number;
  netPerQuarter: number;
}

export interface ElevatorInfo {
  id: string;
  x: number;
  carCount: number;
  floors: number[];
  stops: number[];
  queueSize: number;
}

type PanelMode = 'hidden' | 'building' | 'financial' | 'elevator';

export class SidePanel {
  private container: HTMLDivElement;
  private contentArea: HTMLDivElement;
  private mode: PanelMode = 'hidden';
  
  private buildingInfo: BuildingInfo | null = null;
  private financialData: FinancialData | null = null;
  private elevatorInfo: ElevatorInfo | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'side-panel';
    this.applyStyles();
    
    // Create header
    const header = this.createHeader();
    this.container.appendChild(header);
    
    // Create content area
    this.contentArea = document.createElement('div');
    this.contentArea.style.cssText = `
      padding: 15px;
      overflow-y: auto;
      height: calc(100% - 50px);
    `;
    this.container.appendChild(this.contentArea);
    
    document.body.appendChild(this.container);
  }

  private applyStyles(): void {
    this.container.style.cssText = `
      position: fixed;
      left: -350px;
      top: 60px;
      width: 350px;
      height: calc(100vh - 120px);
      background: linear-gradient(180deg, #2a2a2a 0%, #1e1e1e 100%);
      color: white;
      font-family: 'Arial', sans-serif;
      font-size: 13px;
      box-shadow: 2px 0 15px rgba(0,0,0,0.5);
      z-index: 9000;
      transition: left 0.3s ease;
      border-right: 2px solid #444;
      border-radius: 0 8px 8px 0;
      user-select: none;
    `;
  }

  private createHeader(): HTMLDivElement {
    const header = document.createElement('div');
    header.style.cssText = `
      height: 50px;
      background: #1a1a1a;
      border-bottom: 2px solid #444;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 15px;
      font-weight: bold;
      font-size: 15px;
    `;
    
    const title = document.createElement('span');
    title.id = 'panel-title';
    title.textContent = 'INFO';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.cssText = `
      background: none;
      border: none;
      color: #999;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 3px;
      transition: all 0.2s ease;
    `;
    
    closeButton.onmouseenter = () => {
      closeButton.style.background = '#333';
      closeButton.style.color = '#fff';
    };
    
    closeButton.onmouseleave = () => {
      closeButton.style.background = 'none';
      closeButton.style.color = '#999';
    };
    
    closeButton.onclick = () => this.hide();
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    return header;
  }

  /** Show building information */
  showBuilding(info: BuildingInfo): void {
    this.mode = 'building';
    this.buildingInfo = info;
    this.show();
    this.renderBuilding();
  }

  /** Show financial breakdown */
  showFinancial(data: FinancialData): void {
    this.mode = 'financial';
    this.financialData = data;
    this.show();
    this.renderFinancial();
  }

  /** Show elevator information */
  showElevator(info: ElevatorInfo): void {
    this.mode = 'elevator';
    this.elevatorInfo = info;
    this.show();
    this.renderElevator();
  }

  /** Show the panel */
  private show(): void {
    this.container.style.left = '10px';
  }

  /** Hide the panel */
  hide(): void {
    this.mode = 'hidden';
    this.container.style.left = '-350px';
  }

  private renderBuilding(): void {
    if (!this.buildingInfo) return;
    
    const info = this.buildingInfo;
    const config = BUILDING_CONFIGS[info.type];
    
    // Update title
    const title = this.container.querySelector('#panel-title');
    if (title) {
      title.textContent = `🏢 ${this.formatBuildingType(info.type)}`;
    }
    
    let html = `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #64B5F6;">
          ${this.formatBuildingType(info.type)}
        </div>
        <div style="color: #999; font-size: 12px;">
          Floor ${info.floor} • Position ${info.x} • Width ${info.width}
        </div>
      </div>

      <div style="background: #1a1a1a; padding: 12px; border-radius: 5px; margin-bottom: 15px; border: 1px solid #333;">
        <div style="font-weight: bold; margin-bottom: 8px; color: #81C784;">💰 Economics</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
          <div>
            <div style="color: #999;">Build Cost:</div>
            <div style="color: #fff;">$${config.cost.toLocaleString()}</div>
          </div>
          ${info.income !== undefined ? `
          <div>
            <div style="color: #999;">Income/Quarter:</div>
            <div style="color: #4CAF50;">+$${info.income.toLocaleString()}</div>
          </div>
          ` : ''}
          ${info.maintenanceCost !== undefined ? `
          <div>
            <div style="color: #999;">Maintenance:</div>
            <div style="color: #FF9800;">-$${info.maintenanceCost.toLocaleString()}/quarter</div>
          </div>
          ` : ''}
        </div>
      </div>
    `;

    // Occupancy section (if applicable)
    if (info.maxOccupancy !== undefined && info.maxOccupancy > 0) {
      const occupancy = info.occupancy || 0;
      const percentage = Math.round((occupancy / info.maxOccupancy) * 100);
      const color = percentage >= 80 ? '#4CAF50' : percentage >= 50 ? '#FF9800' : '#E57373';
      
      html += `
        <div style="background: #1a1a1a; padding: 12px; border-radius: 5px; margin-bottom: 15px; border: 1px solid #333;">
          <div style="font-weight: bold; margin-bottom: 8px; color: #64B5F6;">👥 Occupancy</div>
          <div style="margin-bottom: 8px;">
            <span style="font-size: 18px; font-weight: bold; color: ${color};">${occupancy}</span>
            <span style="color: #999;"> / ${info.maxOccupancy} tenants</span>
          </div>
          <div style="background: #0a0a0a; height: 20px; border-radius: 10px; overflow: hidden; border: 1px solid #333;">
            <div style="width: ${percentage}%; height: 100%; background: ${color}; transition: width 0.3s ease;"></div>
          </div>
          <div style="text-align: center; margin-top: 5px; color: #999; font-size: 11px;">
            ${percentage}% occupied
          </div>
        </div>
      `;
    }

    // Satisfaction section (if applicable)
    if (info.satisfaction !== undefined) {
      const satisfaction = info.satisfaction;
      const emoji = satisfaction >= 80 ? '😊' : satisfaction >= 60 ? '😐' : '😞';
      const color = satisfaction >= 80 ? '#4CAF50' : satisfaction >= 60 ? '#FF9800' : '#E57373';
      
      html += `
        <div style="background: #1a1a1a; padding: 12px; border-radius: 5px; margin-bottom: 15px; border: 1px solid #333;">
          <div style="font-weight: bold; margin-bottom: 8px;">
            ${emoji} Tenant Satisfaction
          </div>
          <div style="background: #0a0a0a; height: 20px; border-radius: 10px; overflow: hidden; border: 1px solid #333;">
            <div style="width: ${satisfaction}%; height: 100%; background: ${color}; transition: width 0.3s ease;"></div>
          </div>
          <div style="text-align: center; margin-top: 5px; color: #999; font-size: 11px;">
            ${satisfaction}%
          </div>
        </div>
      `;
    }

    // Building-specific info
    html += `
      <div style="background: #1a1a1a; padding: 12px; border-radius: 5px; border: 1px solid #333;">
        <div style="font-weight: bold; margin-bottom: 8px; color: #9C27B0;">ℹ️ Details</div>
        <div style="font-size: 12px; line-height: 1.6; color: #ccc;">
          ${this.getBuildingDescription(info.type)}
        </div>
      </div>
    `;

    this.contentArea.innerHTML = html;
  }

  private renderFinancial(): void {
    if (!this.financialData) return;
    
    const data = this.financialData;
    
    // Update title
    const title = this.container.querySelector('#panel-title');
    if (title) {
      title.textContent = '💰 FINANCES';
    }
    
    let html = `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px; color: #4CAF50;">
          $${data.currentFunds.toLocaleString()}
        </div>
        <div style="color: #999; font-size: 12px;">
          Current funds available
        </div>
      </div>

      <div style="background: #1a1a1a; padding: 12px; border-radius: 5px; margin-bottom: 15px; border: 1px solid #333;">
        <div style="font-weight: bold; margin-bottom: 12px; color: #81C784;">📊 Per Quarter</div>
        <div style="font-size: 12px; line-height: 2;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="color: #999;">Income:</span>
            <span style="color: #4CAF50; font-weight: bold;">+$${data.incomePerQuarter.toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="color: #999;">Maintenance:</span>
            <span style="color: #FF9800; font-weight: bold;">-$${data.maintenancePerQuarter.toLocaleString()}</span>
          </div>
          <div style="height: 1px; background: #333; margin: 8px 0;"></div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #fff; font-weight: bold;">Net Profit:</span>
            <span style="color: ${data.netPerQuarter >= 0 ? '#4CAF50' : '#E57373'}; font-weight: bold; font-size: 14px;">
              ${data.netPerQuarter >= 0 ? '+' : ''}$${data.netPerQuarter.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    `;

    // Last quarter report
    if (data.lastQuarterReport) {
      const report = data.lastQuarterReport;
      html += `
        <div style="background: #1a1a1a; padding: 12px; border-radius: 5px; margin-bottom: 15px; border: 1px solid #333;">
          <div style="font-weight: bold; margin-bottom: 12px; color: #64B5F6;">📋 Last Quarter (Q${report.quarterNumber})</div>
          <div style="font-size: 12px; line-height: 2;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="color: #999;">Income:</span>
              <span style="color: #4CAF50;">+$${report.income.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span style="color: #999;">Maintenance:</span>
              <span style="color: #FF9800;">-$${report.maintenance.toLocaleString()}</span>
            </div>
            <div style="height: 1px; background: #333; margin: 8px 0;"></div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #fff; font-weight: bold;">Net:</span>
              <span style="color: ${report.netProfit >= 0 ? '#4CAF50' : '#E57373'}; font-weight: bold;">
                ${report.netProfit >= 0 ? '+' : ''}$${report.netProfit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      `;
    }

    html += `
      <div style="background: #1a1a1a; padding: 12px; border-radius: 5px; border: 1px solid #333;">
        <div style="font-weight: bold; margin-bottom: 8px; color: #9C27B0;">💡 Tips</div>
        <ul style="font-size: 11px; line-height: 1.6; color: #ccc; margin: 0; padding-left: 20px;">
          <li>Build more facilities to increase income</li>
          <li>Keep tenants happy to maximize rent</li>
          <li>Watch maintenance costs on older buildings</li>
          <li>Balance growth with cash reserves</li>
        </ul>
      </div>
    `;

    this.contentArea.innerHTML = html;
  }

  private renderElevator(): void {
    if (!this.elevatorInfo) return;
    
    const info = this.elevatorInfo;
    
    // Update title
    const title = this.container.querySelector('#panel-title');
    if (title) {
      title.textContent = '🛗 ELEVATOR';
    }
    
    let html = `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #64B5F6;">
          Elevator Control
        </div>
        <div style="color: #999; font-size: 12px;">
          Position ${info.x}
        </div>
      </div>

      <div style="background: #1a1a1a; padding: 12px; border-radius: 5px; margin-bottom: 15px; border: 1px solid #333;">
        <div style="font-weight: bold; margin-bottom: 8px; color: #81C784;">📈 Status</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
          <div>
            <div style="color: #999;">Cars:</div>
            <div style="color: #fff; font-size: 16px; font-weight: bold;">${info.carCount}</div>
          </div>
          <div>
            <div style="color: #999;">Queue:</div>
            <div style="color: ${info.queueSize > 10 ? '#E57373' : '#4CAF50'}; font-size: 16px; font-weight: bold;">${info.queueSize}</div>
          </div>
          <div>
            <div style="color: #999;">Floors Served:</div>
            <div style="color: #fff; font-size: 16px; font-weight: bold;">${info.floors.length}</div>
          </div>
          <div>
            <div style="color: #999;">Active Stops:</div>
            <div style="color: #fff; font-size: 16px; font-weight: bold;">${info.stops.length}</div>
          </div>
        </div>
      </div>

      <div style="background: #1a1a1a; padding: 12px; border-radius: 5px; margin-bottom: 15px; border: 1px solid #333;">
        <div style="font-weight: bold; margin-bottom: 8px; color: #FF9800;">⚙️ Controls</div>
        <div style="font-size: 12px; color: #999; margin-bottom: 10px;">
          Click floors to program stops
        </div>
        <div style="max-height: 200px; overflow-y: auto; background: #0a0a0a; border-radius: 3px; padding: 8px; border: 1px solid #333;">
    `;

    // Floor list with checkboxes (would be interactive in real implementation)
    info.floors.forEach(floor => {
      const isStop = info.stops.includes(floor);
      html += `
        <div style="padding: 5px; margin-bottom: 3px; background: ${isStop ? '#1a3a1a' : '#1a1a1a'}; border-radius: 3px; display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 14px;">${isStop ? '✓' : '○'}</span>
          <span>Floor ${floor}</span>
        </div>
      `;
    });

    html += `
        </div>
      </div>

      <div style="background: #1a1a1a; padding: 12px; border-radius: 5px; border: 1px solid #333;">
        <div style="font-weight: bold; margin-bottom: 8px; color: #9C27B0;">ℹ️ Info</div>
        <div style="font-size: 11px; line-height: 1.6; color: #ccc;">
          Elevators transport people between floors. Keep queues short by adding more cars or building additional shafts.
        </div>
      </div>
    `;

    this.contentArea.innerHTML = html;
  }

  private formatBuildingType(type: BuildingType): string {
    const names: Record<BuildingType, string> = {
      lobby: 'Lobby',
      office: 'Office',
      fastFood: 'Fast Food',
      restaurant: 'Restaurant',
      condo: 'Condo',
      shop: 'Retail Shop',
      hotelSingle: 'Hotel (Single)',
      hotelTwin: 'Hotel (Twin)',
      stairs: 'Stairs',
      parking: 'Parking',
      medical: 'Medical Office',
      theater: 'Movie Theater',
      party: 'Party Hall',
      security: 'Security',
      housekeeping: 'Housekeeping',
      recycling: 'Recycling Center',
    };
    return names[type] || type;
  }

  private getBuildingDescription(type: BuildingType): string {
    const descriptions: Record<BuildingType, string> = {
      lobby: 'The main entrance. Required for your tower. People enter and exit here.',
      office: 'Commercial office space. Generates steady income during business hours.',
      fastFood: 'Quick dining for workers. Operates during lunch and dinner.',
      restaurant: 'Fine dining establishment. Higher income than fast food.',
      condo: 'Residential units. Tenants live here and pay regular rent.',
      shop: 'Retail stores. Attracts shoppers and generates income.',
      hotelSingle: 'Single-occupancy hotel room. For short-term guests.',
      hotelTwin: 'Double-occupancy hotel room. Higher capacity than single.',
      stairs: 'Emergency stairway. Provides backup access between floors.',
      parking: 'Parking garage. Required for office and condo buildings.',
      medical: 'Medical office. Provides healthcare services.',
      theater: 'Movie theater. Entertainment venue that operates in evenings.',
      party: 'Party hall. Can be rented for events.',
      security: 'Security office. Helps prevent crime.',
      housekeeping: 'Housekeeping service. Maintains building cleanliness.',
      recycling: 'Recycling center. Improves environmental rating.',
    };
    return descriptions[type] || 'A building in your tower.';
  }

  /** Check if panel is visible */
  isVisible(): boolean {
    return this.mode !== 'hidden';
  }

  /** Get current mode */
  getMode(): PanelMode {
    return this.mode;
  }

  /** Remove from DOM */
  destroy(): void {
    this.container.remove();
  }
}
