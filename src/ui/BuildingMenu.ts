/**
 * BuildingMenu - Card-based building selection UI
 * 
 * Features:
 * - Category tabs for organized browsing
 * - Card-based layout with hover effects
 * - Visual feedback for selection and lock states
 * - Design tokens for consistent theming
 * 
 * Design: Retro-futuristic 90s management sim aesthetic
 */

import type { BuildingType } from '@/interfaces';
import { BUILDING_CONSTRAINTS, BUILDING_COLORS } from './BuildingPlacer';

/**
 * Design tokens for consistent styling
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
  
  // Category colors
  catCommercial: '#3B82F6',
  catResidential: '#8B5CF6',
  catServices: '#F59E0B',
  catTransport: '#10B981',
  catSpecial: '#EC4899',
  
  // Effects
  glowAccent: '0 0 12px rgba(214, 158, 46, 0.5)',
  shadowCard: '0 4px 12px rgba(0, 0, 0, 0.4)',
  shadowHover: '0 8px 24px rgba(0, 0, 0, 0.6)',
  
  // Animation
  easeOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
  durationFast: '150ms',
  durationNormal: '250ms',
  
  // Fonts
  fontMono: "'JetBrains Mono', 'Courier New', monospace",
  fontBody: "'Inter', -apple-system, system-ui, sans-serif",
};

export type BuildingMenuCallback = (type: PlaceableType) => void;

/** Placeable type includes buildings and special items like elevators */
export type PlaceableType = BuildingType | 'elevator';

/** Building category definitions */
type BuildingCategory = 'commercial' | 'residential' | 'services' | 'transport' | 'special';

interface CategoryDef {
  id: BuildingCategory;
  icon: string;
  label: string;
  color: string;
  buildings: PlaceableType[];
}

const CATEGORIES: CategoryDef[] = [
  {
    id: 'commercial',
    icon: '🏢',
    label: 'Commercial',
    color: OT_TOKENS.catCommercial,
    buildings: ['office', 'shop'],
  },
  {
    id: 'residential',
    icon: '🏨',
    label: 'Residential',
    color: OT_TOKENS.catResidential,
    buildings: ['condo', 'hotelSingle', 'hotelTwin', 'hotelSuite'],
  },
  {
    id: 'services',
    icon: '🍔',
    label: 'Services',
    color: OT_TOKENS.catServices,
    buildings: ['fastFood', 'restaurant', 'medical', 'housekeeping', 'security', 'recycling'],
  },
  {
    id: 'transport',
    icon: '🛗',
    label: 'Transport',
    color: OT_TOKENS.catTransport,
    buildings: ['elevator', 'stairs', 'escalator', 'parkingRamp', 'parkingSpace'],
  },
  {
    id: 'special',
    icon: '⭐',
    label: 'Special',
    color: OT_TOKENS.catSpecial,
    buildings: ['lobby', 'partyHall', 'cinema', 'metro', 'cathedral'],
  },
];

/** Building metadata for display */
interface BuildingInfo {
  name: string;
  icon: string;
  cost: number;
  income?: number;
  starRequired: number;
  description: string;
}

const BUILDING_INFO: Record<PlaceableType, BuildingInfo> = {
  lobby: { name: 'Lobby', icon: '🚪', cost: 50000, starRequired: 1, description: 'Tower entrance' },
  office: { name: 'Office', icon: '💼', cost: 40000, income: 1000, starRequired: 1, description: 'Steady rental income' },
  fastFood: { name: 'Fast Food', icon: '🍔', cost: 20000, income: 500, starRequired: 1, description: 'Feeds workers' },
  stairs: { name: 'Stairs', icon: '🚶', cost: 5000, starRequired: 1, description: 'Free vertical transport' },
  elevator: { name: 'Elevator', icon: '🛗', cost: 80000, starRequired: 1, description: 'High capacity transport' },
  parkingRamp: { name: 'Parking Ramp', icon: '🅿️', cost: 30000, starRequired: 1, description: 'Underground entry' },
  parkingSpace: { name: 'Parking', icon: '🚗', cost: 10000, income: 200, starRequired: 1, description: 'Parking spots' },
  restaurant: { name: 'Restaurant', icon: '🍽️', cost: 50000, income: 800, starRequired: 2, description: 'Evening dining' },
  condo: { name: 'Condo', icon: '🏠', cost: 80000, income: 1200, starRequired: 2, description: 'Residential units' },
  hotelSingle: { name: 'Hotel Single', icon: '🛏️', cost: 60000, income: 600, starRequired: 2, description: 'Basic rooms' },
  hotelTwin: { name: 'Hotel Twin', icon: '🛏️🛏️', cost: 100000, income: 1000, starRequired: 3, description: 'Double rooms' },
  hotelSuite: { name: 'Hotel Suite', icon: '👑', cost: 200000, income: 2000, starRequired: 4, description: 'Luxury suites' },
  housekeeping: { name: 'Housekeeping', icon: '🧹', cost: 25000, starRequired: 2, description: 'Keeps hotels clean' },
  security: { name: 'Security', icon: '🛡️', cost: 30000, starRequired: 2, description: 'Required for stars' },
  shop: { name: 'Shop', icon: '🛍️', cost: 35000, income: 600, starRequired: 2, description: 'Retail income' },
  partyHall: { name: 'Party Hall', icon: '🎉', cost: 100000, income: 1500, starRequired: 3, description: 'Event venue' },
  cinema: { name: 'Cinema', icon: '🎬', cost: 150000, income: 2000, starRequired: 3, description: 'Entertainment' },
  medical: { name: 'Medical', icon: '🏥', cost: 80000, starRequired: 3, description: 'Health services' },
  recycling: { name: 'Recycling', icon: '♻️', cost: 40000, starRequired: 3, description: 'Environmental bonus' },
  escalator: { name: 'Escalator', icon: '⬆️', cost: 60000, starRequired: 3, description: 'Fast stairs' },
  metro: { name: 'Metro Station', icon: '🚇', cost: 500000, income: 5000, starRequired: 5, description: 'Mass transit hub' },
  cathedral: { name: 'Cathedral', icon: '⛪', cost: 1000000, starRequired: 6, description: 'Ultimate landmark' },
};

export class BuildingMenu {
  private container: HTMLDivElement;
  private callback: BuildingMenuCallback | null = null;
  private selectedType: PlaceableType = 'office';
  private funds: number = 0;
  private starRating: number = 1;
  private activeCategory: BuildingCategory = 'commercial';

  constructor() {
    this.injectStyles();
    
    this.container = document.createElement('div');
    this.container.id = 'building-menu';
    this.container.className = 'ot-building-menu';
    
    document.body.appendChild(this.container);
    this.render();
  }

  private injectStyles(): void {
    if (document.getElementById('ot-building-menu-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'ot-building-menu-styles';
    style.textContent = `
      .ot-building-menu {
        position: fixed;
        right: 16px;
        top: 72px;
        background: linear-gradient(135deg, ${OT_TOKENS.bgPrimary} 0%, ${OT_TOKENS.bgSecondary} 100%);
        color: ${OT_TOKENS.textPrimary};
        padding: 0;
        font-family: ${OT_TOKENS.fontBody};
        font-size: 13px;
        border-radius: 12px;
        z-index: 1000;
        width: 280px;
        user-select: none;
        box-shadow: ${OT_TOKENS.shadowCard}, 0 0 0 1px rgba(255,255,255,0.1);
        border: 2px solid rgba(255,255,255,0.1);
        overflow: hidden;
        max-height: calc(100vh - 100px);
        display: flex;
        flex-direction: column;
      }
      
      .ot-menu-header {
        padding: 14px 16px;
        background: ${OT_TOKENS.bgElevated};
        border-bottom: 1px solid rgba(255,255,255,0.1);
        font-weight: 600;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .ot-category-tabs {
        display: flex;
        gap: 2px;
        padding: 8px;
        background: rgba(0,0,0,0.2);
        overflow-x: auto;
      }
      
      .ot-category-tab {
        flex: 1;
        padding: 8px 4px;
        background: transparent;
        border: none;
        color: ${OT_TOKENS.textMuted};
        cursor: pointer;
        border-radius: 6px;
        font-size: 18px;
        transition: all ${OT_TOKENS.durationFast} ${OT_TOKENS.easeOut};
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        min-width: 48px;
      }
      
      .ot-category-tab:hover {
        background: rgba(255,255,255,0.1);
        color: ${OT_TOKENS.textPrimary};
      }
      
      .ot-category-tab.active {
        background: var(--cat-color);
        color: white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      }
      
      .ot-category-tab span.label {
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .ot-building-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding: 12px;
        overflow-y: auto;
        flex: 1;
      }
      
      .ot-building-card {
        background: linear-gradient(135deg, ${OT_TOKENS.bgCard} 0%, ${OT_TOKENS.bgSecondary} 100%);
        border-radius: 8px;
        padding: 12px;
        cursor: pointer;
        transition: all ${OT_TOKENS.durationNormal} ${OT_TOKENS.easeOut};
        border: 2px solid transparent;
        position: relative;
        overflow: hidden;
      }
      
      .ot-building-card:hover:not(.locked) {
        transform: translateY(-4px);
        box-shadow: ${OT_TOKENS.shadowHover};
        border-color: rgba(255,255,255,0.2);
      }
      
      .ot-building-card.selected {
        border-color: ${OT_TOKENS.accent};
        box-shadow: ${OT_TOKENS.glowAccent};
      }
      
      .ot-building-card.locked {
        opacity: 0.5;
        cursor: not-allowed;
        filter: grayscale(0.5);
      }
      
      .ot-building-card.unaffordable:not(.locked) {
        border-color: ${OT_TOKENS.danger};
      }
      
      .ot-card-icon {
        font-size: 28px;
        margin-bottom: 6px;
        display: block;
      }
      
      .ot-card-name {
        font-weight: 600;
        font-size: 12px;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .ot-card-cost {
        font-family: ${OT_TOKENS.fontMono};
        font-size: 11px;
        color: ${OT_TOKENS.accent};
      }
      
      .ot-card-income {
        font-family: ${OT_TOKENS.fontMono};
        font-size: 10px;
        color: ${OT_TOKENS.success};
        margin-top: 2px;
      }
      
      .ot-card-lock-badge {
        position: absolute;
        top: 4px;
        right: 4px;
        background: ${OT_TOKENS.bgPrimary};
        color: ${OT_TOKENS.accent};
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
      }
      
      .ot-card-category-stripe {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--cat-color);
      }
      
      .ot-building-menu::-webkit-scrollbar {
        width: 6px;
      }
      
      .ot-building-menu::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .ot-building-menu::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.2);
        border-radius: 3px;
      }
      
      .ot-building-grid::-webkit-scrollbar {
        width: 6px;
      }
      
      .ot-building-grid::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.2);
        border-radius: 3px;
      }
    `;
    document.head.appendChild(style);
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

  /** Get currently selected type */
  getSelectedType(): PlaceableType {
    return this.selectedType;
  }

  /** Set selection programmatically */
  setSelectedType(type: PlaceableType): void {
    this.selectedType = type;
    this.render();
  }

  private render(): void {
    const category = CATEGORIES.find(c => c.id === this.activeCategory)!;
    
    this.container.innerHTML = `
      <!-- Header -->
      <div class="ot-menu-header">
        <span>🏗️</span>
        <span>Build</span>
        <span style="margin-left: auto; font-family: ${OT_TOKENS.fontMono}; color: ${OT_TOKENS.accent};">
          $${this.funds.toLocaleString()}
        </span>
      </div>
      
      <!-- Category Tabs -->
      <div class="ot-category-tabs">
        ${CATEGORIES.map(cat => `
          <button 
            class="ot-category-tab ${cat.id === this.activeCategory ? 'active' : ''}"
            data-category="${cat.id}"
            style="--cat-color: ${cat.color};"
            title="${cat.label}"
          >
            <span>${cat.icon}</span>
            <span class="label">${cat.label.slice(0, 4)}</span>
          </button>
        `).join('')}
      </div>
      
      <!-- Building Grid -->
      <div class="ot-building-grid">
        ${category.buildings.map(type => this.renderBuildingCard(type, category.color)).join('')}
      </div>
    `;
    
    this.attachEventListeners();
  }

  private renderBuildingCard(type: PlaceableType, categoryColor: string): string {
    const info = BUILDING_INFO[type];
    if (!info) return '';
    
    const isLocked = info.starRequired > this.starRating;
    const isAffordable = this.funds >= info.cost;
    const isSelected = this.selectedType === type;
    
    const classes = [
      'ot-building-card',
      isLocked ? 'locked' : '',
      !isAffordable && !isLocked ? 'unaffordable' : '',
      isSelected ? 'selected' : '',
    ].filter(Boolean).join(' ');
    
    return `
      <div 
        class="${classes}" 
        data-type="${type}"
        style="--cat-color: ${categoryColor};"
        title="${info.description}${isLocked ? ` (Requires ${info.starRequired}★)` : ''}"
      >
        ${isLocked ? `<div class="ot-card-lock-badge">${info.starRequired}★</div>` : ''}
        <span class="ot-card-icon">${info.icon}</span>
        <div class="ot-card-name">${info.name}</div>
        <div class="ot-card-cost">$${info.cost.toLocaleString()}</div>
        ${info.income ? `<div class="ot-card-income">+$${info.income}/q</div>` : ''}
        <div class="ot-card-category-stripe"></div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    // Category tab clicks
    this.container.querySelectorAll('.ot-category-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const category = (e.currentTarget as HTMLElement).dataset.category as BuildingCategory;
        this.activeCategory = category;
        this.render();
      });
    });
    
    // Building card clicks
    this.container.querySelectorAll('.ot-building-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const type = (e.currentTarget as HTMLElement).dataset.type as PlaceableType;
        const info = BUILDING_INFO[type];
        
        // Check if locked
        if (info && info.starRequired > this.starRating) {
          return; // Can't select locked buildings
        }
        
        this.selectedType = type;
        this.render();
        
        if (this.callback) {
          this.callback(type);
        }
      });
    });
  }

  /** Set up keyboard shortcuts for building selection */
  setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Number keys 1-5 for category switching
      if (e.key >= '1' && e.key <= '5') {
        const categoryIndex = parseInt(e.key) - 1;
        if (CATEGORIES[categoryIndex]) {
          this.activeCategory = CATEGORIES[categoryIndex].id;
          this.render();
        }
      }
      
      // Escape to clear selection
      if (e.key === 'Escape') {
        this.clearSelection();
      }
    });
  }

  /** Clear current selection */
  clearSelection(): void {
    this.selectedType = 'office'; // Default
    this.render();
  }

  /** Remove from DOM */
  destroy(): void {
    this.container.remove();
  }
}
