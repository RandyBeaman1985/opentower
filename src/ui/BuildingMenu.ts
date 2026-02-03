/**
 * BuildingMenu - Professional Building Selection Palette
 * 
 * Features:
 * - Icon-based building cards using actual sprite assets
 * - Clean category organization with visual hierarchy
 * - Professional hover states and animations
 * - Cost/income displays with clear affordability indicators
 * - Star-based unlock system with visual feedback
 * 
 * Design: Clean, modern game UI (SimTower meets 2024)
 */

import type { BuildingType } from '@/interfaces';

export type BuildingMenuCallback = (type: PlaceableType) => void;
export type PlaceableType = BuildingType | 'elevator';

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
    color: '#3B82F6',
    buildings: ['office', 'shop'],
  },
  {
    id: 'residential',
    icon: '🏨',
    label: 'Residential',
    color: '#8B5CF6',
    buildings: ['condo', 'hotelSingle', 'hotelTwin', 'hotelSuite'],
  },
  {
    id: 'services',
    icon: '🍔',
    label: 'Services',
    color: '#F59E0B',
    buildings: ['fastFood', 'restaurant', 'medical', 'housekeeping', 'security', 'recycling'],
  },
  {
    id: 'transport',
    icon: '🛗',
    label: 'Transport',
    color: '#10B981',
    buildings: ['elevator', 'stairs', 'escalator', 'parkingRamp', 'parkingSpace'],
  },
  {
    id: 'special',
    icon: '⭐',
    label: 'Special',
    color: '#EC4899',
    buildings: ['lobby', 'partyHall', 'cinema', 'metro', 'cathedral'],
  },
];

interface BuildingInfo {
  name: string;
  icon: string;
  iconFile: string; // Path to PNG icon
  cost: number;
  income?: number;
  starRequired: number;
  description: string;
  width: number;
  height: number;
}

const BUILDING_INFO: Record<PlaceableType, BuildingInfo> = {
  lobby:        { name: 'Lobby', icon: '🚪', iconFile: 'Icon-Lobby.png', cost: 50000, starRequired: 1, description: 'Tower entrance', width: 4, height: 1 },
  office:       { name: 'Office', icon: '💼', iconFile: 'Icon-Office.png', cost: 40000, income: 1000, starRequired: 1, description: 'Steady rental income', width: 4, height: 1 },
  fastFood:     { name: 'Fast Food', icon: '🍔', iconFile: 'Icon-FastFood.png', cost: 20000, income: 500, starRequired: 1, description: 'Feeds workers', width: 2, height: 1 },
  stairs:       { name: 'Stairs', icon: '🚶', iconFile: 'Icon-Stairwell.png', cost: 5000, starRequired: 1, description: 'Free vertical transport', width: 1, height: 1 },
  elevator:     { name: 'Elevator', icon: '🛗', iconFile: 'Icon-Elevator.png', cost: 80000, starRequired: 1, description: 'High capacity transport', width: 1, height: 1 },
  parkingRamp:  { name: 'Parking Ramp', icon: '🅿️', iconFile: 'Icon-Parking.png', cost: 30000, starRequired: 1, description: 'Underground entry', width: 2, height: 1 },
  parkingSpace: { name: 'Parking', icon: '🚗', iconFile: 'Icon-Parking.png', cost: 10000, income: 200, starRequired: 1, description: 'Parking spots', width: 2, height: 1 },
  restaurant:   { name: 'Restaurant', icon: '🍽️', iconFile: 'Icon-Restaurant.png', cost: 50000, income: 800, starRequired: 2, description: 'Evening dining', width: 2, height: 1 },
  condo:        { name: 'Condo', icon: '🏠', iconFile: 'Icon-Condo.png', cost: 80000, income: 1200, starRequired: 2, description: 'Residential units', width: 2, height: 1 },
  hotelSingle:  { name: 'Hotel Single', icon: '🛏️', iconFile: 'Icon-Hotel-Single.png', cost: 60000, income: 600, starRequired: 2, description: 'Basic rooms', width: 1, height: 1 },
  hotelTwin:    { name: 'Hotel Twin', icon: '🛏️', iconFile: 'Icon-Hotel-Double.png', cost: 100000, income: 1000, starRequired: 3, description: 'Double rooms', width: 2, height: 1 },
  hotelSuite:   { name: 'Hotel Suite', icon: '👑', iconFile: 'Icon-Hotel-Suite.png', cost: 200000, income: 2000, starRequired: 4, description: 'Luxury suites', width: 3, height: 1 },
  housekeeping: { name: 'Housekeeping', icon: '🧹', iconFile: 'Icon-Housekeeping.png', cost: 25000, starRequired: 2, description: 'Keeps hotels clean', width: 1, height: 1 },
  security:     { name: 'Security', icon: '🛡️', iconFile: 'Icon-Security.png', cost: 30000, starRequired: 2, description: 'Required for stars', width: 1, height: 1 },
  shop:         { name: 'Shop', icon: '🛍️', iconFile: 'Stores.png', cost: 35000, income: 600, starRequired: 2, description: 'Retail income', width: 2, height: 1 },
  partyHall:    { name: 'Party Hall', icon: '🎉', iconFile: 'Icon-PartyHall.png', cost: 100000, income: 1500, starRequired: 3, description: 'Event venue', width: 4, height: 1 },
  cinema:       { name: 'Cinema', icon: '🎬', iconFile: 'Icon_Cinema.png', cost: 150000, income: 2000, starRequired: 3, description: 'Entertainment', width: 3, height: 1 },
  medical:      { name: 'Medical', icon: '🏥', iconFile: 'Icon-MedicalOffice.png', cost: 80000, starRequired: 3, description: 'Health services', width: 1, height: 1 },
  recycling:    { name: 'Recycling', icon: '♻️', iconFile: 'Icon-Recycle.png', cost: 40000, starRequired: 3, description: 'Environmental bonus', width: 1, height: 1 },
  escalator:    { name: 'Escalator', icon: '⬆️', iconFile: 'Icon-Escalator.png', cost: 60000, starRequired: 3, description: 'Fast stairs', width: 1, height: 1 },
  metro:        { name: 'Metro Station', icon: '🚇', iconFile: 'Icon-Subway.png', cost: 500000, income: 5000, starRequired: 5, description: 'Mass transit hub', width: 6, height: 1 },
  cathedral:    { name: 'Cathedral', icon: '⛪', iconFile: 'Icon-PartyHall.png', cost: 1000000, starRequired: 6, description: 'Ultimate landmark', width: 5, height: 3 },
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
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes cardPop {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(214, 158, 46, 0.4); }
        50% { box-shadow: 0 0 30px rgba(214, 158, 46, 0.8); }
      }
      
      .ot-building-menu {
        position: fixed;
        right: 16px;
        top: 72px;
        width: 320px;
        background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%);
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1);
        z-index: 1000;
        user-select: none;
        overflow: hidden;
        max-height: calc(100vh - 88px);
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        animation: slideInRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      
      /* HEADER */
      .ot-menu-header {
        padding: 16px 20px;
        background: linear-gradient(135deg, #2d3748 0%, #1a1f2e 100%);
        border-bottom: 1px solid rgba(255,255,255,0.1);
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .ot-header-title {
        font-size: 18px;
        font-weight: 700;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .ot-header-funds {
        margin-left: auto;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        font-weight: 700;
        color: #fbbf24;
        background: rgba(251, 191, 36, 0.1);
        padding: 4px 10px;
        border-radius: 6px;
      }
      
      .ot-header-star {
        font-size: 14px;
        color: #fbbf24;
        background: rgba(251, 191, 36, 0.15);
        padding: 4px 8px;
        border-radius: 6px;
        font-weight: 600;
      }
      
      /* CATEGORY TABS */
      .ot-category-tabs {
        display: flex;
        gap: 4px;
        padding: 12px;
        background: rgba(0,0,0,0.2);
        overflow-x: auto;
        scrollbar-width: none;
      }
      
      .ot-category-tabs::-webkit-scrollbar { display: none; }
      
      .ot-category-tab {
        flex: 1;
        min-width: 56px;
        padding: 10px 8px;
        background: rgba(255,255,255,0.05);
        border: 2px solid transparent;
        color: rgba(255,255,255,0.5);
        cursor: pointer;
        border-radius: 10px;
        font-size: 20px;
        transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        position: relative;
      }
      
      .ot-category-tab:hover {
        background: rgba(255,255,255,0.1);
        transform: translateY(-2px);
        color: rgba(255,255,255,0.8);
      }
      
      .ot-category-tab.active {
        background: var(--cat-color);
        border-color: rgba(255,255,255,0.3);
        color: white;
        transform: scale(1.05);
        box-shadow: 0 4px 16px var(--cat-glow);
      }
      
      .ot-tab-label {
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 700;
        opacity: 0.9;
      }
      
      .ot-tab-badge {
        position: absolute;
        top: 4px;
        right: 4px;
        background: rgba(0,0,0,0.6);
        color: white;
        font-size: 9px;
        min-width: 16px;
        height: 16px;
        line-height: 16px;
        text-align: center;
        border-radius: 8px;
        font-family: 'Courier New', monospace;
        font-weight: 600;
      }
      
      /* BUILDING GRID */
      .ot-building-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        padding: 16px;
        overflow-y: auto;
        flex: 1;
      }
      
      .ot-building-grid::-webkit-scrollbar {
        width: 8px;
      }
      
      .ot-building-grid::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.2);
        border-radius: 4px;
      }
      
      /* BUILDING CARDS */
      .ot-building-card {
        background: linear-gradient(135deg, rgba(45, 55, 72, 0.9) 0%, rgba(26, 32, 44, 0.9) 100%);
        border-radius: 12px;
        padding: 14px;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        border: 2px solid transparent;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .ot-building-card::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--cat-color), transparent);
        opacity: 0.5;
      }
      
      .ot-building-card:hover:not(.locked) {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        border-color: rgba(255,255,255,0.2);
      }
      
      .ot-building-card:active:not(.locked) {
        transform: translateY(-2px) scale(0.98);
      }
      
      .ot-building-card.selected {
        border-color: #fbbf24;
        box-shadow: 0 8px 24px rgba(251, 191, 36, 0.4);
        animation: glow 2s ease-in-out infinite;
      }
      
      .ot-building-card.locked {
        opacity: 0.4;
        cursor: not-allowed;
        filter: grayscale(0.8);
      }
      
      .ot-building-card.unaffordable:not(.locked) {
        border-color: rgba(239, 68, 68, 0.4);
      }
      
      /* CARD ICON */
      .ot-card-icon-wrapper {
        width: 100%;
        height: 80px;
        background: rgba(0,0,0,0.3);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
      }
      
      .ot-card-icon-wrapper::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 70%);
      }
      
      .ot-card-icon {
        width: 64px;
        height: 64px;
        object-fit: contain;
        image-rendering: pixelated;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      }
      
      /* CARD CONTENT */
      .ot-card-name {
        font-size: 14px;
        font-weight: 700;
        color: #fff;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .ot-card-stats {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      
      .ot-card-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
      }
      
      .ot-card-cost {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        font-weight: 700;
        color: #fbbf24;
      }
      
      .ot-building-card.unaffordable:not(.locked) .ot-card-cost {
        color: #ef4444;
      }
      
      .ot-card-income {
        font-family: 'Courier New', monospace;
        font-size: 11px;
        color: #10b981;
        background: rgba(16, 185, 129, 0.15);
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
      }
      
      .ot-card-size {
        font-family: 'Courier New', monospace;
        font-size: 10px;
        color: rgba(255,255,255,0.5);
      }
      
      .ot-card-lock-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%);
        color: #fbbf24;
        font-size: 11px;
        padding: 4px 10px;
        border-radius: 6px;
        font-weight: 700;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        gap: 4px;
        z-index: 10;
      }
      
      .ot-card-lock-badge::before {
        content: '🔒';
        font-size: 10px;
      }
      
      /* FOOTER */
      .ot-menu-footer {
        padding: 10px 16px;
        background: rgba(0,0,0,0.2);
        border-top: 1px solid rgba(255,255,255,0.05);
        font-size: 10px;
        color: rgba(255,255,255,0.5);
        text-align: center;
        display: flex;
        justify-content: center;
        gap: 16px;
      }
      
      .ot-menu-footer kbd {
        background: rgba(255,255,255,0.1);
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        font-size: 9px;
      }
      
      @media (max-width: 768px) {
        .ot-building-menu {
          right: 8px;
          width: calc(100vw - 16px);
          max-width: 340px;
        }
        
        .ot-menu-footer {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  onSelect(callback: BuildingMenuCallback): void {
    this.callback = callback;
  }

  setFunds(funds: number): void {
    this.funds = funds;
    this.render();
  }

  setStarRating(rating: number): void {
    this.starRating = rating;
    this.render();
  }

  getSelectedType(): PlaceableType {
    return this.selectedType;
  }

  setSelectedType(type: PlaceableType): void {
    this.selectedType = type;
    this.render();
  }

  private getAvailableCount(category: CategoryDef): number {
    return category.buildings.filter(type => {
      const info = BUILDING_INFO[type];
      return info && info.starRequired <= this.starRating;
    }).length;
  }

  private render(): void {
    const category = CATEGORIES.find(c => c.id === this.activeCategory)!;
    
    this.container.innerHTML = `
      <div class="ot-menu-header">
        <div class="ot-header-title">
          <span>🏗️</span>
          <span>Build</span>
        </div>
        <span class="ot-header-star">${this.starRating}★</span>
        <span class="ot-header-funds">$${this.funds.toLocaleString()}</span>
      </div>
      
      <div class="ot-category-tabs">
        ${CATEGORIES.map(cat => {
          const available = this.getAvailableCount(cat);
          return `
            <button 
              class="ot-category-tab ${cat.id === this.activeCategory ? 'active' : ''}"
              data-category="${cat.id}"
              style="--cat-color: ${cat.color}; --cat-glow: ${cat.color}66;"
              title="${cat.label}"
            >
              <span>${cat.icon}</span>
              <span class="ot-tab-label">${cat.label.substring(0, 4)}</span>
              <span class="ot-tab-badge">${available}</span>
            </button>
          `;
        }).join('')}
      </div>
      
      <div class="ot-building-grid">
        ${category.buildings.map(type => this.renderBuildingCard(type, category.color)).join('')}
      </div>
      
      <div class="ot-menu-footer">
        <span><kbd>1</kbd>-<kbd>5</kbd> Categories</span>
        <span><kbd>ESC</kbd> Clear</span>
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
    
    const formattedCost = info.cost >= 1000000 
      ? `$${(info.cost / 1000000).toFixed(1)}M`
      : info.cost >= 1000
        ? `$${(info.cost / 1000).toFixed(0)}K`
        : `$${info.cost}`;
    
    const iconPath = `/sprites/ocram/UI/${info.iconFile}`;
    
    return `
      <div 
        class="${classes}" 
        data-type="${type}"
        style="--cat-color: ${categoryColor};"
        title="${info.description}${isLocked ? ` (Requires ${info.starRequired}★)` : ''}"
      >
        ${isLocked ? `<div class="ot-card-lock-badge">${info.starRequired}★</div>` : ''}
        
        <div class="ot-card-icon-wrapper">
          <img src="${iconPath}" alt="${info.name}" class="ot-card-icon" />
        </div>
        
        <div class="ot-card-name">${info.name}</div>
        
        <div class="ot-card-stats">
          <div class="ot-card-row">
            <span class="ot-card-cost">${formattedCost}</span>
            ${info.income ? `<span class="ot-card-income">+$${info.income}/q</span>` : ''}
          </div>
          <div class="ot-card-row">
            <span class="ot-card-size">${info.width}×${info.height} tiles</span>
          </div>
        </div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    this.container.querySelectorAll('.ot-category-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const category = (e.currentTarget as HTMLElement).dataset.category as BuildingCategory;
        this.activeCategory = category;
        this.render();
      });
    });
    
    this.container.querySelectorAll('.ot-building-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const type = (e.currentTarget as HTMLElement).dataset.type as PlaceableType;
        const info = BUILDING_INFO[type];
        
        if (info && info.starRequired > this.starRating) {
          return;
        }
        
        this.selectedType = type;
        this.render();
        
        if (this.callback) {
          this.callback(type);
        }
      });
    });
  }

  setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key >= '1' && e.key <= '5' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const categoryIndex = parseInt(e.key) - 1;
        if (CATEGORIES[categoryIndex]) {
          this.activeCategory = CATEGORIES[categoryIndex].id;
          this.render();
        }
      }
      
      if (e.key === 'Escape') {
        this.clearSelection();
      }
    });
  }

  clearSelection(): void {
    this.selectedType = 'office';
    this.render();
  }

  destroy(): void {
    this.container.remove();
  }
}
