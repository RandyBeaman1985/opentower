/**
 * BuildingMenu - Simple HTML UI for building selection
 * 
 * Displays available buildings with costs, allows selection.
 */

import type { BuildingType } from '@/interfaces';
import { BUILDING_CONSTRAINTS, BUILDING_COLORS } from './BuildingPlacer';

export type BuildingMenuCallback = (type: PlaceableType) => void;

/** Placeable type includes buildings and special items like elevators */
export type PlaceableType = BuildingType | 'elevator';

/** MVP Building types to show in menu (expanded for full gameplay) */
const MVP_BUILDINGS: BuildingType[] = [
  // 1★ - Starting buildings
  'lobby',
  'office',
  'fastFood',
  'stairs',
  
  // 2★ - Growth phase
  'restaurant',
  'condo',
  'hotelSingle',
  
  // 3★ - Expansion phase
  'hotelTwin',
  'hotelSuite',
  'shop',
  'partyHall',
  'security',
  'medical',
  'escalator',
];

/** Special placeable items (not buildings) */
const SPECIAL_PLACEABLES: PlaceableType[] = ['elevator'];

export class BuildingMenu {
  private container: HTMLDivElement;
  private callback: BuildingMenuCallback | null = null;
  private selectedType: PlaceableType = 'office';
  private funds: number = 0;
  private starRating: number = 1;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'building-menu';
    this.container.style.cssText = `
      position: fixed;
      right: 10px;
      top: 10px;
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 10px;
      font-family: monospace;
      font-size: 12px;
      border-radius: 8px;
      z-index: 1000;
      min-width: 180px;
      user-select: none;
    `;

    document.body.appendChild(this.container);
    this.render();
  }

  /** Set callback for when building is selected */
  onSelect(callback: BuildingMenuCallback): void {
    this.callback = callback;
  }

  /** Update current funds (for affordability check) */
  setFunds(funds: number): void {
    this.funds = funds;
    this.render();
  }

  /** Update current star rating (for unlock system) */
  setStarRating(rating: number): void {
    this.starRating = rating;
    this.render();
  }

  /** Get currently selected building type */
  getSelectedType(): PlaceableType {
    return this.selectedType;
  }

  /** Clear selection (useful when entering demolish mode) */
  clearSelection(): void {
    this.selectedType = 'office'; // Default fallback
    this.render();
  }

  /** Render the menu */
  private render(): void {
    // Star rating display
    const starDisplay = '⭐'.repeat(this.starRating) + '☆'.repeat(3 - this.starRating);
    
    let html = `
      <div style="margin-bottom: 8px; font-weight: bold; font-size: 14px; display: flex; justify-content: space-between; align-items: center;">
        <span>🏗️ BUILD</span>
        <span style="font-size: 16px;" title="Current star rating">${starDisplay}</span>
      </div>
      <div style="font-size: 10px; margin-bottom: 8px; opacity: 0.7;">
        Click on tower to place
      </div>
    `;

    // Render regular buildings
    for (const type of MVP_BUILDINGS) {
      html += this.renderMenuItem(type);
    }

    // Render special placeables (elevator)
    html += `
      <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #333; font-size: 11px; font-weight: bold; opacity: 0.7;">
        TRANSPORT
      </div>
    `;
    for (const type of SPECIAL_PLACEABLES) {
      html += this.renderMenuItem(type);
    }

    html += `
      <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #333; font-size: 10px;">
        <div><strong>Controls:</strong></div>
        <div>• Click to place</div>
        <div>• 1-9 to quick-select</div>
        <div>• ESC to cancel</div>
        <div>• Drag to pan</div>
        <div>• Scroll to zoom</div>
      </div>
    `;

    this.container.innerHTML = html;

    // Add click handlers
    this.container.querySelectorAll('.building-option').forEach((el) => {
      el.addEventListener('click', (e) => {
        const type = (e.currentTarget as HTMLElement).dataset.type as PlaceableType;
        if (type) {
          // Check affordability AND unlock status
          if (type === 'elevator') {
            // Elevator base cost (will show dynamic cost during placement)
            if (this.funds >= 200000) {
              this.selectType(type);
            }
          } else {
            const unlockReq = this.getUnlockStarRequirement(type as BuildingType);
            const unlocked = this.starRating >= unlockReq;
            const affordable = this.funds >= BUILDING_CONSTRAINTS[type as BuildingType].cost;
            
            if (unlocked && affordable) {
              this.selectType(type);
            } else if (!unlocked) {
              console.log(`${type} requires ${unlockReq}★ rating to unlock`);
            }
          }
        }
      });
    });
  }

  /** Get unlock star requirement for a building type */
  private getUnlockStarRequirement(type: BuildingType): number {
    // Unlock thresholds matching REAL-GAME-PLAN.md
    const unlocks: Partial<Record<BuildingType, number>> = {
      // 1★ - Start (basic infrastructure)
      lobby: 1,
      office: 1,
      fastFood: 1,
      stairs: 1,
      
      // 2★ - Growth (residential + hospitality)
      hotelSingle: 2,
      restaurant: 2,
      condo: 2,
      
      // 3★ - Expansion (luxury + services)
      hotelTwin: 3,
      hotelSuite: 3,
      shop: 3,
      partyHall: 3,
      security: 3,
      medical: 3,
      escalator: 3,
    };
    return unlocks[type] ?? 1;
  }

  /** Render a menu item for a building or placeable */
  private renderMenuItem(type: PlaceableType): string {
    const selected = this.selectedType === type;
    const bgColor = selected ? '#4a4a4a' : 'transparent';
    const border = selected ? '2px solid #00ff00' : '2px solid transparent';
    
    if (type === 'elevator') {
      // Elevator special handling (always unlocked)
      const baseCost = 200000;
      const affordable = this.funds >= baseCost;
      const unlocked = true;
      const opacity = (affordable && unlocked) ? '1' : '0.4';
      const cursor = (affordable && unlocked) ? 'pointer' : 'not-allowed';
      
      return `
        <div 
          class="building-option"
          data-type="elevator"
          style="
            display: flex;
            align-items: center;
            padding: 6px 8px;
            margin: 4px 0;
            background: ${bgColor};
            border: ${border};
            border-radius: 4px;
            opacity: ${opacity};
            cursor: ${cursor};
          "
        >
          <div style="
            width: 16px;
            height: 16px;
            background: linear-gradient(135deg, #4a9eff 0%, #1e3a8a 100%);
            border: 1px solid #333;
            margin-right: 8px;
            border-radius: 2px;
          "></div>
          <div style="flex: 1;">
            <div>Standard Elevator</div>
            <div style="font-size: 10px; opacity: 0.7;">
              From $${baseCost.toLocaleString()} (drag to size)
            </div>
          </div>
        </div>
      `;
    } else {
      // Regular building
      const constraints = BUILDING_CONSTRAINTS[type];
      const color = BUILDING_COLORS[type];
      const affordable = this.funds >= constraints.cost;
      const unlockReq = this.getUnlockStarRequirement(type);
      const unlocked = this.starRating >= unlockReq;
      const opacity = (affordable && unlocked) ? '1' : '0.4';
      const cursor = (affordable && unlocked) ? 'pointer' : 'not-allowed';
      const colorHex = '#' + color.toString(16).padStart(6, '0');
      
      // Show lock icon if not unlocked
      const lockIndicator = !unlocked ? `
        <div style="
          position: absolute;
          top: 2px;
          right: 2px;
          background: rgba(0,0,0,0.7);
          color: #fbbf24;
          padding: 2px 4px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: bold;
        ">🔒 ${unlockReq}★</div>
      ` : '';
      
      return `
        <div 
          class="building-option"
          data-type="${type}"
          style="
            position: relative;
            display: flex;
            align-items: center;
            padding: 6px 8px;
            margin: 4px 0;
            background: ${bgColor};
            border: ${border};
            border-radius: 4px;
            opacity: ${opacity};
            cursor: ${cursor};
          "
          title="${!unlocked ? `Unlock at ${unlockReq}★ rating` : ''}"
        >
          ${lockIndicator}
          <div style="
            width: 16px;
            height: 16px;
            background: ${colorHex};
            border: 1px solid #333;
            margin-right: 8px;
            border-radius: 2px;
          "></div>
          <div style="flex: 1;">
            <div style="text-transform: capitalize;">${this.formatName(type)}</div>
            <div style="font-size: 10px; opacity: 0.7;">
              $${constraints.cost.toLocaleString()}
              ${!unlocked ? ` • ${unlockReq}★` : ''}
            </div>
          </div>
        </div>
      `;
    }
  }

  /** Format building name for display */
  private formatName(type: BuildingType): string {
    return type
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  /** Select a building type */
  selectType(type: PlaceableType): void {
    this.selectedType = type;
    this.render();
    if (this.callback) {
      this.callback(type);
    }
  }

  /** Setup keyboard shortcuts */
  setupKeyboardShortcuts(): void {
    const allPlaceables = [...MVP_BUILDINGS, ...SPECIAL_PLACEABLES];
    document.addEventListener('keydown', (e) => {
      const key = parseInt(e.key);
      if (key >= 1 && key <= allPlaceables.length) {
        const type = allPlaceables[key - 1]!;
        if (type === 'elevator') {
          if (this.funds >= 200000) {
            this.selectType(type);
          }
        } else {
          const unlockReq = this.getUnlockStarRequirement(type as BuildingType);
          const unlocked = this.starRating >= unlockReq;
          const affordable = this.funds >= BUILDING_CONSTRAINTS[type as BuildingType].cost;
          
          if (unlocked && affordable) {
            this.selectType(type);
          }
        }
      }
    });
  }
}

// Add star rating display to menu header


// Export the special placeables for use by BuildingPlacer
export { SPECIAL_PLACEABLES };
