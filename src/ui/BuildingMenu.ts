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

/** ALL Building types organized by star rating unlock */
const MVP_BUILDINGS: BuildingType[] = [
  // 1★ - Starting buildings
  'lobby',
  'office',
  'fastFood',
  'stairs',
  'parkingRamp',      // NEW: Underground parking entry
  'parkingSpace',     // NEW: Parking spots
  
  // 2★ - Growth phase
  'restaurant',
  'condo',
  'hotelSingle',
  'housekeeping',     // NEW: CRITICAL for hotels!
  'security',
  
  // 3★ - Expansion phase
  'hotelTwin',
  'hotelSuite',
  'shop',
  'partyHall',
  'cinema',           // NEW: Movie theater
  'medical',
  'recycling',        // NEW: Environmental service
  'escalator',
  
  // 5★ - Landmarks
  'metro',            // NEW: Metro station
  
  // TOWER - Ultimate landmarks
  'cathedral',        // NEW: Cathedral (requires TOWER status)
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
      right: 16px;
      top: 72px;
      background: linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(20,20,20,0.95) 100%);
      color: white;
      padding: 14px;
      font-family: 'Segoe UI', 'Roboto', sans-serif;
      font-size: 13px;
      border-radius: 12px;
      z-index: 1000;
      min-width: 220px;
      max-width: 260px;
      user-select: none;
      box-shadow: 0 8px 24px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1);
      border: 2px solid rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      max-height: calc(100vh - 150px);
      overflow-y: auto;
    `;
    
    // Add custom scrollbar styles
    const style = document.createElement('style');
    style.textContent = `
      #building-menu::-webkit-scrollbar {
        width: 8px;
      }
      #building-menu::-webkit-scrollbar-track {
        background: rgba(0,0,0,0.2);
        border-radius: 4px;
      }
      #building-menu::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.2);
        border-radius: 4px;
      }
      #building-menu::-webkit-scrollbar-thumb:hover {
        background: rgba(255,255,255,0.3);
      }
    `;
    document.head.appendChild(style);

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
      <div style="
        margin-bottom: 12px;
        padding-bottom: 12px;
        border-bottom: 2px solid rgba(255,255,255,0.1);
        display: flex;
        flex-direction: column;
        gap: 8px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; font-size: 16px; color: #FFA726;">🏗️ BUILD MENU</span>
        </div>
        <div style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px;
          background: rgba(255,167,38,0.1);
          border-radius: 6px;
          border: 1px solid rgba(255,167,38,0.3);
        ">
          <span style="font-size: 11px; opacity: 0.8; font-weight: 500;">Tower Rating:</span>
          <span style="font-size: 18px;" title="Current star rating">${starDisplay}</span>
        </div>
        <div style="font-size: 11px; opacity: 0.6; text-align: center; font-style: italic;">
          Click tower to place • 1-9 for hotkeys
        </div>
      </div>
    `;

    // Render regular buildings
    for (const type of MVP_BUILDINGS) {
      html += this.renderMenuItem(type);
    }

    // Render special placeables (elevator)
    html += `
      <div style="
        margin-top: 14px;
        padding-top: 12px;
        border-top: 2px solid rgba(255,255,255,0.1);
        font-size: 11px;
        font-weight: 700;
        opacity: 0.7;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
      ">
        🚇 Transport
      </div>
    `;
    for (const type of SPECIAL_PLACEABLES) {
      html += this.renderMenuItem(type);
    }

    html += `
      <div style="
        margin-top: 14px;
        padding-top: 12px;
        border-top: 2px solid rgba(255,255,255,0.1);
        font-size: 10px;
        opacity: 0.5;
        line-height: 1.6;
      ">
        <div style="font-weight: 600; margin-bottom: 4px; opacity: 0.8;">⌨️ Controls:</div>
        <div>• <kbd>Click</kbd> to place building</div>
        <div>• <kbd>1-9</kbd> quick-select</div>
        <div>• <kbd>ESC</kbd> cancel</div>
        <div>• <kbd>Drag</kbd> to pan view</div>
        <div>• <kbd>Scroll</kbd> to zoom</div>
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
      const opacity = (affordable && unlocked) ? '1' : '0.5';
      const cursor = (affordable && unlocked) ? 'pointer' : 'not-allowed';
      const hoverTransform = (affordable && unlocked) ? 'translateX(4px)' : 'none';
      
      return `
        <div 
          class="building-option"
          data-type="elevator"
          style="
            display: flex;
            align-items: center;
            padding: 10px 12px;
            margin: 6px 0;
            background: ${selected ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.05)'};
            border: ${selected ? '2px solid #66BB6A' : '2px solid transparent'};
            border-radius: 8px;
            opacity: ${opacity};
            cursor: ${cursor};
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          "
          onmouseenter="this.style.background = '${affordable ? 'rgba(76,175,80,0.15)' : 'rgba(255,255,255,0.05)'}'; this.style.transform = '${hoverTransform}'"
          onmouseleave="this.style.background = '${selected ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.05)'}'; this.style.transform = 'none'"
        >
          <div style="
            width: 20px;
            height: 20px;
            background: linear-gradient(135deg, #4a9eff 0%, #1e3a8a 100%);
            border: 2px solid rgba(255,255,255,0.2);
            margin-right: 10px;
            border-radius: 4px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">Standard Elevator</div>
            <div style="font-size: 10px; opacity: 0.7; font-family: 'Courier New', monospace;">
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
      const opacity = (affordable && unlocked) ? '1' : '0.5';
      const cursor = (affordable && unlocked) ? 'pointer' : 'not-allowed';
      const colorHex = '#' + color.toString(16).padStart(6, '0');
      const hoverTransform = (affordable && unlocked) ? 'translateX(4px)' : 'none';
      
      // Show lock icon if not unlocked
      const lockIndicator = !unlocked ? `
        <div style="
          position: absolute;
          top: 6px;
          right: 6px;
          background: linear-gradient(135deg, rgba(255,167,38,0.9) 0%, rgba(251,191,36,0.9) 100%);
          color: #1a1a1a;
          padding: 3px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          gap: 2px;
        ">🔒 ${unlockReq}★</div>
      ` : '';
      
      // Affordability indicator
      const affordIndicator = unlocked && !affordable ? `
        <div style="
          position: absolute;
          top: 6px;
          right: 6px;
          background: linear-gradient(135deg, rgba(239,83,80,0.9) 0%, rgba(198,40,40,0.9) 100%);
          color: white;
          padding: 3px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        ">💰</div>
      ` : '';
      
      return `
        <div 
          class="building-option"
          data-type="${type}"
          style="
            position: relative;
            display: flex;
            align-items: center;
            padding: 10px 12px;
            margin: 6px 0;
            background: ${selected ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.05)'};
            border: ${selected ? '2px solid #66BB6A' : '2px solid transparent'};
            border-radius: 8px;
            opacity: ${opacity};
            cursor: ${cursor};
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          "
          title="${!unlocked ? `Unlock at ${unlockReq}★ rating` : !affordable ? 'Not enough funds' : ''}"
          onmouseenter="this.style.background = '${(affordable && unlocked) ? 'rgba(76,175,80,0.15)' : 'rgba(255,255,255,0.05)'}'; this.style.transform = '${hoverTransform}'"
          onmouseleave="this.style.background = '${selected ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.05)'}'; this.style.transform = 'none'"
        >
          ${lockIndicator}
          ${affordIndicator}
          <div style="
            width: 20px;
            height: 20px;
            background: ${colorHex};
            border: 2px solid rgba(255,255,255,0.2);
            margin-right: 10px;
            border-radius: 4px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>
          <div style="flex: 1; padding-right: ${(!unlocked || (unlocked && !affordable)) ? '30px' : '0'};">
            <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">${this.formatName(type)}</div>
            <div style="font-size: 10px; opacity: 0.7; font-family: 'Courier New', monospace;">
              $${constraints.cost.toLocaleString()}
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
