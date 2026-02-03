/**
 * BuildingMenu - Card-based building selection UI
 * 
 * Features:
 * - Category tabs with glow effects and count badges
 * - Card-based layout with ASCII art previews
 * - Visual feedback for selection, lock, and affordability states
 * - Micro-interactions: press effect, selection pulse, smooth transitions
 * - Mobile-friendly 44px+ touch targets
 * - Design tokens for consistent theming
 * 
 * Design: Retro-futuristic 90s management sim aesthetic
 * Enhanced: 2026-02-03 (Round 2 - Opus)
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
  easeSnap: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
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
  width: number;
  height: number;
  preview: string; // ASCII art preview
}

// ASCII art building previews (3 lines, monospace)
const BUILDING_PREVIEWS: Record<PlaceableType, string> = {
  lobby:       '┌═══════╗\n│ LOBBY │\n╚═══════╝',
  office:      '┌─┬─┬─┬─┐\n│█│█│█│█│\n└─┴─┴─┴─┘',
  fastFood:    '┌─────┐\n│🍔 🍟│\n└─────┘',
  stairs:      '┌──┐\n│▓▒│\n│░▓│',
  elevator:    '┌──┐\n│▽▽│\n│△△│',
  parkingRamp: '╔═══╗\n║↗ P║\n╚═══╝',
  parkingSpace:'┌───┐\n│ 🚗│\n└───┘',
  restaurant:  '┌─────┐\n│🍽️ 🍷│\n└─────┘',
  condo:       '┌──┬──┐\n│🛋️│🛋️│\n└──┴──┘',
  hotelSingle: '┌───┐\n│🛏️ │\n└───┘',
  hotelTwin:   '┌────┐\n│🛏️🛏️│\n└────┘',
  hotelSuite:  '┌══════┐\n│👑 🛏️ │\n╚══════╝',
  housekeeping:'┌───┐\n│🧹🧺│\n└───┘',
  security:    '┌───┐\n│🛡️ │\n└───┘',
  shop:        '┌─────┐\n│🛍️ $ │\n└─────┘',
  partyHall:   '┌═════════┐\n│ 🎉 🎊 🎉│\n╚═════════╝',
  cinema:      '┌═══════┐\n│🎬 ▓▓▓▓│\n╚═══════╝',
  medical:     '┌───┐\n│➕🏥│\n└───┘',
  recycling:   '┌───┐\n│♻️ │\n└───┘',
  escalator:   '┌──┐\n│⬆️│\n│▒░│',
  metro:       '┌═════════════╗\n│ 🚇 METRO 🚇 │\n╚═════════════╝',
  cathedral:   '    ⛪    \n┌══════════┐\n│ ✝️ ✝️ ✝️ │',
};

const BUILDING_INFO: Record<PlaceableType, BuildingInfo> = {
  lobby:        { name: 'Lobby', icon: '🚪', cost: 50000, starRequired: 1, description: 'Tower entrance', width: 4, height: 1, preview: BUILDING_PREVIEWS.lobby },
  office:       { name: 'Office', icon: '💼', cost: 40000, income: 1000, starRequired: 1, description: 'Steady rental income', width: 4, height: 1, preview: BUILDING_PREVIEWS.office },
  fastFood:     { name: 'Fast Food', icon: '🍔', cost: 20000, income: 500, starRequired: 1, description: 'Feeds workers', width: 2, height: 1, preview: BUILDING_PREVIEWS.fastFood },
  stairs:       { name: 'Stairs', icon: '🚶', cost: 5000, starRequired: 1, description: 'Free vertical transport', width: 1, height: 1, preview: BUILDING_PREVIEWS.stairs },
  elevator:     { name: 'Elevator', icon: '🛗', cost: 80000, starRequired: 1, description: 'High capacity transport', width: 1, height: 1, preview: BUILDING_PREVIEWS.elevator },
  parkingRamp:  { name: 'Parking Ramp', icon: '🅿️', cost: 30000, starRequired: 1, description: 'Underground entry', width: 2, height: 1, preview: BUILDING_PREVIEWS.parkingRamp },
  parkingSpace: { name: 'Parking', icon: '🚗', cost: 10000, income: 200, starRequired: 1, description: 'Parking spots', width: 2, height: 1, preview: BUILDING_PREVIEWS.parkingSpace },
  restaurant:   { name: 'Restaurant', icon: '🍽️', cost: 50000, income: 800, starRequired: 2, description: 'Evening dining', width: 2, height: 1, preview: BUILDING_PREVIEWS.restaurant },
  condo:        { name: 'Condo', icon: '🏠', cost: 80000, income: 1200, starRequired: 2, description: 'Residential units', width: 2, height: 1, preview: BUILDING_PREVIEWS.condo },
  hotelSingle:  { name: 'Hotel Single', icon: '🛏️', cost: 60000, income: 600, starRequired: 2, description: 'Basic rooms', width: 1, height: 1, preview: BUILDING_PREVIEWS.hotelSingle },
  hotelTwin:    { name: 'Hotel Twin', icon: '🛏️🛏️', cost: 100000, income: 1000, starRequired: 3, description: 'Double rooms', width: 2, height: 1, preview: BUILDING_PREVIEWS.hotelTwin },
  hotelSuite:   { name: 'Hotel Suite', icon: '👑', cost: 200000, income: 2000, starRequired: 4, description: 'Luxury suites', width: 3, height: 1, preview: BUILDING_PREVIEWS.hotelSuite },
  housekeeping: { name: 'Housekeeping', icon: '🧹', cost: 25000, starRequired: 2, description: 'Keeps hotels clean', width: 1, height: 1, preview: BUILDING_PREVIEWS.housekeeping },
  security:     { name: 'Security', icon: '🛡️', cost: 30000, starRequired: 2, description: 'Required for stars', width: 1, height: 1, preview: BUILDING_PREVIEWS.security },
  shop:         { name: 'Shop', icon: '🛍️', cost: 35000, income: 600, starRequired: 2, description: 'Retail income', width: 2, height: 1, preview: BUILDING_PREVIEWS.shop },
  partyHall:    { name: 'Party Hall', icon: '🎉', cost: 100000, income: 1500, starRequired: 3, description: 'Event venue', width: 4, height: 1, preview: BUILDING_PREVIEWS.partyHall },
  cinema:       { name: 'Cinema', icon: '🎬', cost: 150000, income: 2000, starRequired: 3, description: 'Entertainment', width: 3, height: 1, preview: BUILDING_PREVIEWS.cinema },
  medical:      { name: 'Medical', icon: '🏥', cost: 80000, starRequired: 3, description: 'Health services', width: 1, height: 1, preview: BUILDING_PREVIEWS.medical },
  recycling:    { name: 'Recycling', icon: '♻️', cost: 40000, starRequired: 3, description: 'Environmental bonus', width: 1, height: 1, preview: BUILDING_PREVIEWS.recycling },
  escalator:    { name: 'Escalator', icon: '⬆️', cost: 60000, starRequired: 3, description: 'Fast stairs', width: 1, height: 1, preview: BUILDING_PREVIEWS.escalator },
  metro:        { name: 'Metro Station', icon: '🚇', cost: 500000, income: 5000, starRequired: 5, description: 'Mass transit hub', width: 6, height: 1, preview: BUILDING_PREVIEWS.metro },
  cathedral:    { name: 'Cathedral', icon: '⛪', cost: 1000000, starRequired: 6, description: 'Ultimate landmark', width: 5, height: 3, preview: BUILDING_PREVIEWS.cathedral },
};

export class BuildingMenu {
  private container: HTMLDivElement;
  private callback: BuildingMenuCallback | null = null;
  private selectedType: PlaceableType = 'office';
  private funds: number = 0;
  private starRating: number = 1;
  private activeCategory: BuildingCategory = 'commercial';
  private isExpanded: boolean = true;

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
      /* ===== ANIMATIONS ===== */
      @keyframes ot-pulse {
        0%, 100% { box-shadow: ${OT_TOKENS.glowAccent}; }
        50% { box-shadow: 0 0 20px rgba(214, 158, 46, 0.8); }
      }
      
      @keyframes ot-select-pop {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      @keyframes ot-tab-glow {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.2); }
      }
      
      @keyframes ot-card-enter {
        from { opacity: 0; transform: translateY(8px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      /* ===== CONTAINER ===== */
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
        width: 300px;
        user-select: none;
        box-shadow: ${OT_TOKENS.shadowCard}, 0 0 0 1px rgba(255,255,255,0.1);
        border: 2px solid rgba(255,255,255,0.1);
        overflow: hidden;
        max-height: calc(100vh - 100px);
        display: flex;
        flex-direction: column;
        transition: width ${OT_TOKENS.durationNormal} ${OT_TOKENS.easeOut};
      }
      
      /* ===== HEADER ===== */
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
      
      .ot-header-funds {
        margin-left: auto;
        font-family: ${OT_TOKENS.fontMono};
        color: ${OT_TOKENS.accent};
        font-size: 13px;
      }
      
      .ot-header-star {
        font-size: 12px;
        color: ${OT_TOKENS.accent};
        background: rgba(214, 158, 46, 0.2);
        padding: 2px 6px;
        border-radius: 4px;
      }
      
      /* ===== CATEGORY TABS ===== */
      .ot-category-tabs {
        display: flex;
        gap: 4px;
        padding: 10px 8px;
        background: rgba(0,0,0,0.3);
        overflow-x: auto;
        scrollbar-width: none;
      }
      
      .ot-category-tabs::-webkit-scrollbar {
        display: none;
      }
      
      .ot-category-tab {
        flex: 1;
        min-width: 52px;
        min-height: 52px;
        padding: 8px 6px;
        background: transparent;
        border: none;
        color: ${OT_TOKENS.textMuted};
        cursor: pointer;
        border-radius: 8px;
        font-size: 20px;
        transition: all ${OT_TOKENS.durationFast} ${OT_TOKENS.easeOut};
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        position: relative;
      }
      
      .ot-category-tab:hover {
        background: rgba(255,255,255,0.1);
        color: ${OT_TOKENS.textPrimary};
        transform: translateY(-2px);
      }
      
      .ot-category-tab:active {
        transform: translateY(0) scale(0.95);
      }
      
      .ot-category-tab.active {
        background: var(--cat-color);
        color: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 20px var(--cat-color-glow);
        animation: ot-tab-glow 2s ease-in-out infinite;
      }
      
      .ot-tab-label {
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 600;
      }
      
      .ot-tab-badge {
        position: absolute;
        top: 2px;
        right: 2px;
        background: rgba(0,0,0,0.5);
        color: ${OT_TOKENS.textSecondary};
        font-size: 9px;
        min-width: 16px;
        height: 16px;
        line-height: 16px;
        text-align: center;
        border-radius: 8px;
        font-family: ${OT_TOKENS.fontMono};
      }
      
      .ot-category-tab.active .ot-tab-badge {
        background: rgba(255,255,255,0.3);
        color: white;
      }
      
      /* ===== BUILDING GRID ===== */
      .ot-building-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        padding: 14px;
        overflow-y: auto;
        flex: 1;
      }
      
      .ot-building-grid::-webkit-scrollbar {
        width: 6px;
      }
      
      .ot-building-grid::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.2);
        border-radius: 3px;
      }
      
      /* ===== BUILDING CARDS ===== */
      .ot-building-card {
        background: linear-gradient(145deg, ${OT_TOKENS.bgCard} 0%, rgba(26, 32, 44, 0.9) 100%);
        border-radius: 10px;
        padding: 12px;
        cursor: pointer;
        transition: all ${OT_TOKENS.durationNormal} ${OT_TOKENS.easeOut};
        border: 2px solid transparent;
        position: relative;
        overflow: hidden;
        min-height: 130px;
        display: flex;
        flex-direction: column;
        animation: ot-card-enter 0.3s ${OT_TOKENS.easeOut} backwards;
      }
      
      .ot-building-card:nth-child(1) { animation-delay: 0ms; }
      .ot-building-card:nth-child(2) { animation-delay: 50ms; }
      .ot-building-card:nth-child(3) { animation-delay: 100ms; }
      .ot-building-card:nth-child(4) { animation-delay: 150ms; }
      .ot-building-card:nth-child(5) { animation-delay: 200ms; }
      .ot-building-card:nth-child(6) { animation-delay: 250ms; }
      
      .ot-building-card:hover:not(.locked) {
        transform: translateY(-4px);
        box-shadow: ${OT_TOKENS.shadowHover}, 0 0 20px var(--cat-color-glow);
        border-color: rgba(255,255,255,0.2);
      }
      
      .ot-building-card:active:not(.locked) {
        transform: translateY(-2px) scale(0.98);
        transition-duration: 50ms;
      }
      
      .ot-building-card.selected {
        border-color: ${OT_TOKENS.accent};
        box-shadow: ${OT_TOKENS.glowAccent};
        animation: ot-select-pop 0.3s ${OT_TOKENS.easeSnap}, ot-pulse 2s ease-in-out infinite;
      }
      
      .ot-building-card.locked {
        opacity: 0.5;
        cursor: not-allowed;
        filter: grayscale(0.6);
      }
      
      .ot-building-card.unaffordable:not(.locked) {
        border-color: rgba(229, 62, 62, 0.5);
      }
      
      .ot-building-card.unaffordable:not(.locked) .ot-card-cost {
        color: ${OT_TOKENS.danger};
      }
      
      /* ===== CARD CONTENT ===== */
      .ot-card-preview {
        font-family: ${OT_TOKENS.fontMono};
        font-size: 8px;
        line-height: 1.1;
        color: ${OT_TOKENS.textMuted};
        background: rgba(0,0,0,0.3);
        padding: 6px;
        border-radius: 4px;
        margin-bottom: 8px;
        white-space: pre;
        text-align: center;
        min-height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      
      .ot-card-header {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 6px;
      }
      
      .ot-card-icon {
        font-size: 20px;
        flex-shrink: 0;
      }
      
      .ot-card-name {
        font-weight: 600;
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
      }
      
      .ot-card-stats {
        display: flex;
        flex-direction: column;
        gap: 3px;
        margin-top: auto;
      }
      
      .ot-card-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 10px;
      }
      
      .ot-card-cost {
        font-family: ${OT_TOKENS.fontMono};
        font-size: 11px;
        color: ${OT_TOKENS.accent};
        font-weight: 600;
      }
      
      .ot-card-income {
        font-family: ${OT_TOKENS.fontMono};
        font-size: 10px;
        color: ${OT_TOKENS.success};
        background: rgba(56, 161, 105, 0.2);
        padding: 1px 4px;
        border-radius: 3px;
      }
      
      .ot-card-size {
        font-family: ${OT_TOKENS.fontMono};
        font-size: 9px;
        color: ${OT_TOKENS.textMuted};
      }
      
      .ot-card-lock-badge {
        position: absolute;
        top: 6px;
        right: 6px;
        background: linear-gradient(135deg, ${OT_TOKENS.bgPrimary} 0%, ${OT_TOKENS.bgElevated} 100%);
        color: ${OT_TOKENS.accent};
        font-size: 10px;
        padding: 3px 8px;
        border-radius: 6px;
        font-weight: 700;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 3px;
      }
      
      .ot-card-lock-badge::before {
        content: '🔒';
        font-size: 8px;
      }
      
      .ot-card-category-stripe {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--cat-color), transparent);
      }
      
      /* ===== KEYBOARD HINT ===== */
      .ot-keyboard-hint {
        padding: 8px 14px;
        background: rgba(0,0,0,0.2);
        border-top: 1px solid rgba(255,255,255,0.05);
        font-size: 10px;
        color: ${OT_TOKENS.textMuted};
        display: flex;
        justify-content: center;
        gap: 12px;
      }
      
      .ot-key {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      
      .ot-key kbd {
        background: ${OT_TOKENS.bgElevated};
        padding: 2px 6px;
        border-radius: 3px;
        font-family: ${OT_TOKENS.fontMono};
        font-size: 9px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.3);
      }
      
      /* ===== MOBILE RESPONSIVE ===== */
      @media (max-width: 640px) {
        .ot-building-menu {
          right: 8px;
          top: 64px;
          width: calc(100vw - 16px);
          max-width: 340px;
        }
        
        .ot-category-tab {
          min-width: 48px;
          min-height: 48px;
        }
        
        .ot-building-card {
          min-height: 120px;
          padding: 10px;
        }
        
        .ot-keyboard-hint {
          display: none;
        }
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

  /** Count available (unlocked) buildings per category */
  private getAvailableCount(category: CategoryDef): number {
    return category.buildings.filter(type => {
      const info = BUILDING_INFO[type];
      return info && info.starRequired <= this.starRating;
    }).length;
  }

  private render(): void {
    const category = CATEGORIES.find(c => c.id === this.activeCategory)!;
    
    this.container.innerHTML = `
      <!-- Header -->
      <div class="ot-menu-header">
        <span>🏗️</span>
        <span>Build</span>
        <span class="ot-header-star">${this.starRating}★</span>
        <span class="ot-header-funds">$${this.funds.toLocaleString()}</span>
      </div>
      
      <!-- Category Tabs -->
      <div class="ot-category-tabs">
        ${CATEGORIES.map(cat => {
          const available = this.getAvailableCount(cat);
          const total = cat.buildings.length;
          return `
            <button 
              class="ot-category-tab ${cat.id === this.activeCategory ? 'active' : ''}"
              data-category="${cat.id}"
              style="--cat-color: ${cat.color}; --cat-color-glow: ${cat.color}40;"
              title="${cat.label} (${available}/${total} available)"
            >
              <span>${cat.icon}</span>
              <span class="ot-tab-label">${cat.label.slice(0, 4)}</span>
              <span class="ot-tab-badge">${available}</span>
            </button>
          `;
        }).join('')}
      </div>
      
      <!-- Building Grid -->
      <div class="ot-building-grid">
        ${category.buildings.map(type => this.renderBuildingCard(type, category.color)).join('')}
      </div>
      
      <!-- Keyboard Hints -->
      <div class="ot-keyboard-hint">
        <span class="ot-key"><kbd>1</kbd>-<kbd>5</kbd> Categories</span>
        <span class="ot-key"><kbd>ESC</kbd> Clear</span>
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
    
    // Format cost nicely
    const formattedCost = info.cost >= 1000000 
      ? `$${(info.cost / 1000000).toFixed(1)}M`
      : info.cost >= 1000
        ? `$${(info.cost / 1000).toFixed(0)}K`
        : `$${info.cost}`;
    
    return `
      <div 
        class="${classes}" 
        data-type="${type}"
        style="--cat-color: ${categoryColor}; --cat-color-glow: ${categoryColor}40;"
        title="${info.description}${isLocked ? ` (Requires ${info.starRequired}★)` : ''}"
      >
        ${isLocked ? `<div class="ot-card-lock-badge">${info.starRequired}★</div>` : ''}
        
        <!-- ASCII Preview -->
        <div class="ot-card-preview">${info.preview}</div>
        
        <!-- Header -->
        <div class="ot-card-header">
          <span class="ot-card-icon">${info.icon}</span>
          <span class="ot-card-name">${info.name}</span>
        </div>
        
        <!-- Stats -->
        <div class="ot-card-stats">
          <div class="ot-card-row">
            <span class="ot-card-cost">${formattedCost}</span>
            ${info.income ? `<span class="ot-card-income">+$${info.income}/q</span>` : ''}
          </div>
          <div class="ot-card-row">
            <span class="ot-card-size">${info.width}×${info.height} tiles</span>
          </div>
        </div>
        
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
      if (e.key >= '1' && e.key <= '5' && !e.ctrlKey && !e.altKey && !e.metaKey) {
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
