/**
 * BuildingSprites - Sprite asset management for building interiors
 * 
 * Replaces colored rectangles with real pixel art sprites showing:
 * - Office interiors with workers at desks
 * - Restaurant/FastFood with customers
 * - Hotel rooms with guests
 * - Lobby with decor
 * 
 * Sprite states based on occupancy:
 * - Empty (0 occupants)
 * - Half-full (1-50% capacity)
 * - Full (>50% capacity)
 * 
 * @module rendering/sprites/BuildingSprites
 */

import { BuildingType } from '@/interfaces';
import { Texture, Sprite as PIXISprite } from 'pixi.js';

export interface SpriteConfig {
  path: string;
  width: number;
  height: number;
  states?: string[]; // ['empty', 'half', 'full'] etc
}

/**
 * Sprite configuration for each building type
 * 
 * Paths are relative to /public/assets/buildings/
 * Sizes in pixels at HD scale (16px per tile)
 */
const SPRITE_CONFIGS: Record<BuildingType, SpriteConfig> = {
  // === COMMERCIAL ===
  office: {
    path: 'office',
    width: 144, // 9 tiles × 16px
    height: 36, // 1 floor + padding (24px base + 12px for depth)
    states: ['empty', 'half', 'full'],
  },
  
  fastFood: {
    path: 'fastfood',
    width: 256, // 16 tiles × 16px
    height: 36,
    states: ['empty', 'busy'],
  },
  
  restaurant: {
    path: 'restaurant',
    width: 384, // 24 tiles × 16px
    height: 36,
    states: ['empty', 'busy'],
  },
  
  shop: {
    path: 'shop',
    width: 192, // 12 tiles × 16px
    height: 36,
    states: ['closed', 'open'],
  },
  
  // === RESIDENTIAL ===
  hotelSingle: {
    path: 'hotel-single',
    width: 64, // 4 tiles × 16px
    height: 36,
    states: ['vacant', 'occupied', 'sleeping'],
  },
  
  hotelTwin: {
    path: 'hotel-twin',
    width: 96, // 6 tiles × 16px
    height: 36,
    states: ['vacant', 'occupied', 'sleeping'],
  },
  
  hotelSuite: {
    path: 'hotel-suite',
    width: 128, // 8 tiles × 16px
    height: 36,
    states: ['vacant', 'occupied', 'sleeping'],
  },
  
  condo: {
    path: 'condo',
    width: 256, // 16 tiles × 16px
    height: 36,
    states: ['forsale', 'occupied-day', 'occupied-night'],
  },
  
  // === INFRASTRUCTURE ===
  lobby: {
    path: 'lobby',
    width: 64, // 4 tiles × 16px (standard lobby)
    height: 48, // Taller for grand entrance feel
    states: ['1star', '2star', '3star', '4star', '5star'],
  },
  
  stairs: {
    path: 'stairs',
    width: 32, // 2 tiles × 16px
    height: 48, // Spans 2 floors visually
    states: ['default'],
  },
  
  // === ENTERTAINMENT ===
  cinema: {
    path: 'cinema',
    width: 512, // 32 tiles × 16px (large)
    height: 72, // 2 floors tall
    states: ['empty', 'showtime'],
  },
  
  partyHall: {
    path: 'partyhall',
    width: 384, // 24 tiles × 16px
    height: 72, // 2 floors tall
    states: ['empty', 'event'],
  },
  
  // === TRANSPORTATION ===
  metro: {
    path: 'metro',
    width: 192, // 12 tiles × 16px
    height: 48,
    states: ['empty', 'crowded'],
  },
  
  // === LANDMARKS ===
  cathedral: {
    path: 'cathedral',
    width: 192, // 12 tiles × 16px
    height: 144, // 4 floors tall (grand structure)
    states: ['default'],
  },
  
  // Placeholders for buildings without sprites yet
  security: {
    path: 'placeholder',
    width: 64,
    height: 36,
    states: ['default'],
  },
  
  housekeeping: {
    path: 'placeholder',
    width: 64,
    height: 36,
    states: ['default'],
  },
  
  recycling: {
    path: 'placeholder',
    width: 64,
    height: 36,
    states: ['default'],
  },
  
  medical: {
    path: 'placeholder',
    width: 64,
    height: 36,
    states: ['default'],
  },
  
  parkingRamp: {
    path: 'placeholder',
    width: 128,
    height: 36,
    states: ['default'],
  },
  
  parkingSpace: {
    path: 'placeholder',
    width: 64,
    height: 36,
    states: ['default'],
  },
  
  escalator: {
    path: 'placeholder',
    width: 32,
    height: 48,
    states: ['default'],
  },
};

/**
 * Sprite cache to avoid reloading textures
 */
const spriteCache = new Map<string, Texture>();

/**
 * Load a sprite texture from the asset path
 * 
 * @param buildingType - Type of building
 * @param state - State variant (e.g., 'empty', 'half', 'full')
 * @returns Texture object
 */
export async function loadBuildingSprite(
  buildingType: BuildingType,
  state?: string
): Promise<Texture | null> {
  const config = SPRITE_CONFIGS[buildingType];
  if (!config) {
    console.warn(`⚠️ No sprite config for building type: ${buildingType}`);
    return null;
  }
  
  // Determine actual state to load
  const actualState = state || config.states?.[0] || 'default';
  const cacheKey = `${buildingType}-${actualState}`;
  
  // Return cached texture if available
  if (spriteCache.has(cacheKey)) {
    return spriteCache.get(cacheKey)!;
  }
  
  // Build asset path
  const assetPath = `/assets/buildings/${config.path}-${actualState}.png`;
  
  try {
    const texture = await Texture.from(assetPath);
    spriteCache.set(cacheKey, texture);
    return texture;
  } catch (error) {
    console.error(`❌ Failed to load sprite: ${assetPath}`, error);
    return null;
  }
}

/**
 * Get sprite state based on building occupancy
 * 
 * @param buildingType - Type of building
 * @param occupantCount - Number of current occupants
 * @param capacity - Maximum capacity
 * @param timeOfDay - Current game time (for day/night variants)
 * @returns State string (e.g., 'empty', 'half', 'full')
 */
export function getBuildingState(
  buildingType: BuildingType,
  occupantCount: number,
  capacity: number,
  timeOfDay?: { hour: number; minute: number }
): string {
  const config = SPRITE_CONFIGS[buildingType];
  if (!config || !config.states || config.states.length === 0) {
    return 'default';
  }
  
  // === SPECIAL CASES ===
  
  // Lobby state based on star rating (would need to be passed in)
  if (buildingType === 'lobby') {
    return config.states[0]; // Default to 1star for now
  }
  
  // Condo day/night
  if (buildingType === 'condo') {
    if (occupantCount === 0) return 'forsale';
    const isNight = timeOfDay && (timeOfDay.hour >= 18 || timeOfDay.hour < 6);
    return isNight ? 'occupied-night' : 'occupied-day';
  }
  
  // Hotel sleeping state at night
  if (buildingType.startsWith('hotel')) {
    if (occupantCount === 0) return 'vacant';
    const isNight = timeOfDay && (timeOfDay.hour >= 22 || timeOfDay.hour < 8);
    return isNight ? 'sleeping' : 'occupied';
  }
  
  // Shop open/closed based on time
  if (buildingType === 'shop') {
    const isOpen = timeOfDay && timeOfDay.hour >= 10 && timeOfDay.hour < 22;
    return isOpen ? 'open' : 'closed';
  }
  
  // === GENERIC OCCUPANCY STATES ===
  
  const occupancyPercent = capacity > 0 ? occupantCount / capacity : 0;
  
  // Buildings with 'empty', 'half', 'full' states
  if (config.states.includes('empty') && config.states.includes('full')) {
    if (occupancyPercent === 0) return 'empty';
    if (occupancyPercent > 0.5) return 'full';
    return config.states.includes('half') ? 'half' : 'empty';
  }
  
  // Buildings with 'empty', 'busy' states (restaurants, etc)
  if (config.states.includes('empty') && config.states.includes('busy')) {
    return occupancyPercent > 0.3 ? 'busy' : 'empty';
  }
  
  // Cinema/PartyHall with event states
  if (config.states.includes('showtime') || config.states.includes('event')) {
    return occupancyPercent > 0.5 ? (config.states[1] || 'default') : 'empty';
  }
  
  // Default to first state
  return config.states[0];
}

/**
 * Create a PIXI sprite for a building
 * 
 * @param buildingType - Type of building
 * @param state - State variant
 * @returns PIXI Sprite or null if texture not loaded
 */
export async function createBuildingSprite(
  buildingType: BuildingType,
  state?: string
): Promise<PIXISprite | null> {
  const texture = await loadBuildingSprite(buildingType, state);
  if (!texture) {
    return null;
  }
  
  const sprite = new PIXISprite(texture);
  
  // Apply any default transformations
  sprite.anchor.set(0, 0); // Top-left anchor for easy positioning
  
  return sprite;
}

/**
 * Get sprite dimensions for a building type
 */
export function getSpriteDimensions(buildingType: BuildingType): { width: number; height: number } {
  const config = SPRITE_CONFIGS[buildingType];
  if (!config) {
    return { width: 64, height: 36 }; // Default placeholder size
  }
  return { width: config.width, height: config.height };
}

/**
 * Preload all sprites for a building type
 * Useful for avoiding pop-in during gameplay
 */
export async function preloadBuildingSprites(buildingType: BuildingType): Promise<void> {
  const config = SPRITE_CONFIGS[buildingType];
  if (!config || !config.states) {
    return;
  }
  
  const promises = config.states.map(state => loadBuildingSprite(buildingType, state));
  await Promise.all(promises);
  
  console.log(`✅ Preloaded ${config.states.length} sprites for ${buildingType}`);
}

/**
 * Preload all building sprites
 * Call this during game initialization
 */
export async function preloadAllSprites(): Promise<void> {
  console.log('🎨 Preloading building sprites...');
  
  const buildingTypes = Object.keys(SPRITE_CONFIGS) as BuildingType[];
  const promises = buildingTypes.map(type => preloadBuildingSprites(type));
  
  await Promise.all(promises);
  
  console.log(`✅ Preloaded sprites for ${buildingTypes.length} building types`);
}

/**
 * Clear sprite cache (useful for hot-reloading during development)
 */
export function clearSpriteCache(): void {
  spriteCache.clear();
  console.log('🗑️ Sprite cache cleared');
}
