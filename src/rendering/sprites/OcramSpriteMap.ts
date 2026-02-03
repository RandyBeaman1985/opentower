/**
 * OcramSpriteMap - Maps building types to OcramTower sprite assets
 * 
 * The OcramTower project (CC licensed) provides authentic SimTower-style sprites.
 * This module maps our building types to the available assets.
 * 
 * Asset location: /sprites/ocram/
 * 
 * @module rendering/sprites/OcramSpriteMap
 */

import { BuildingType } from '@/interfaces';

export interface OcramSprite {
  path: string;
  width: number;
  height: number;
  variants?: string[]; // Multiple variants for visual variety
}

/**
 * Mapping of building types to Ocram sprite paths
 * 
 * Paths are relative to /sprites/ocram/
 */
export const OCRAM_SPRITES: Partial<Record<BuildingType, OcramSprite>> = {
  // === OFFICES ===
  office: {
    path: 'Rooms/Default/office',
    width: 144, // 9 tiles
    height: 24,
    variants: [
      'office-0-day-0',      // Empty
      'office-1-dayoccupied-0',
      'office-2-dayoccupied-0',
      'office-3-dayoccupied-0',
      'office-4-dayoccupied-0',
      'office-5-dayoccupied-0',
      'office-6-dayoccupied-0',
      'office-7-dayoccupied-0',
    ],
  },
  
  // === FAST FOOD ===
  fastFood: {
    path: 'Rooms/Default/MM_FastFood',
    width: 256,
    height: 24,
    variants: [
      'MM_FastFood-burgers-night',
      'MM_FastFood-chinese-night',
      'MM_FastFood-coffee_shop-night',
      'MM_FastFood-icecream-night',
      'MM_FastFood-pizza-night',
      'MM_FastFood-sushi-night',
      'MM_FastFood-tacos-night',
      'MM_FastFood-yogurt-night',
    ],
  },
  
  // === RESTAURANT ===
  restaurant: {
    path: 'Rooms/Default/MM_Restaurant',
    width: 384,
    height: 24,
    variants: [
      'MM_Restaurant-French-night',
      'MM_Restaurant-Hibachi-night',
      'MM_Restaurant-Indian-night',
      'MM_Restaurant-pub-night',
      'MM_Restaurant-steak-night',
    ],
  },
  
  // === HOTELS ===
  hotelSingle: {
    path: 'Rooms/Default/MM_Hotel-single',
    width: 64,
    height: 24,
    variants: [
      'MM_Hotel-single-day-1',
      'MM_Hotel-single-day-2',
      'MM_Hotel-single-night-1',
      'MM_Hotel-single-night-2',
    ],
  },
  
  hotelTwin: {
    path: 'Rooms/Default/MM_Hotel-double',
    width: 96,
    height: 24,
    variants: [
      'MM_Hotel-double-day',
      'MM_Hotel-double-day-1',
      'MM_Hotel-double-day-2',
      'MM_Hotel-double-night',
      'MM_Hotel-double-night-1',
      'MM_Hotel-double-night-2',
    ],
  },
  
  hotelSuite: {
    path: 'Rooms/Default/MM_Hotel-Suite',
    width: 128,
    height: 24,
    variants: [
      'Hotel-Suite-day-0',
      'MM_Hotel-Suite-night-1',
      'MM_Hotel-Suite-night-2',
      'MM_Hotel-Suite-night-3',
    ],
  },
  
  // === CONDO ===
  condo: {
    path: 'Rooms/Default/condo',
    width: 256,
    height: 24,
    variants: [
      'condo-empty1-day-0',
      'condo-empty2-day-0',
      'condo-empty3-day-0',
      'condo-occupied1a-day-0',
      'condo-occupied1b-day-0',
      'condo-occupied2a-day-0',
      'condo-occupied2b-day-0',
      'condo-occupied3a-day-0',
    ],
  },
  
  // === LOBBY ===
  lobby: {
    path: 'Lobbies/MM_lobbyandMezz',
    width: 0, // Full width
    height: 48,
    variants: [
      'MM_lobbyandMezz-3star',
      'MM_lobbyandMezz-4star',
      'MM_lobbyandMezz-5star',
      'MM_lobbyandMezz-tower',
    ],
  },
  
  // === GRAND LOBBY ===
  // (Use for star rating display)
  
  // === TRANSPORT ===
  stairs: {
    path: 'Transport/MM_stairs',
    width: 32,
    height: 48,
    variants: ['MM_stairs_1story'],
  },
  
  escalator: {
    path: 'Transport/MM_Escalator',
    width: 32,
    height: 48,
    variants: ['MM_Escalator'],
  },
  
  // === HOUSEKEEPING ===
  housekeeping: {
    path: 'Rooms/Default/MM_housekeeping',
    width: 64,
    height: 24,
    variants: [
      'MM_housekeeping_day_0',
      'MM_housekeeping_day_1',
      'MM_housekeeping_night_0',
    ],
  },
  
  // === PARTY HALL ===
  partyHall: {
    path: 'Rooms/ArtDeco/partyhall',
    width: 384,
    height: 48,
    variants: [
      'partyhall-0-day-0',
      'partyhall-0-night-0',
    ],
  },
  
  // === SECURITY ===
  security: {
    path: 'Rooms/HighriseDev/security',
    width: 64,
    height: 24,
    variants: ['security_u'],
  },
  
  // === MEDICAL ===
  medical: {
    path: 'Rooms/HighriseDev/MedicalClinic',
    width: 128,
    height: 24,
    variants: ['MedicalClinic_u'],
  },
};

/**
 * UI icon sprites for building menu
 */
export const OCRAM_UI_ICONS: Record<string, string> = {
  office: 'UI/Icon-Office.png',
  fastFood: 'UI/Icon-FastFood.png',
  restaurant: 'UI/Icon-Restaurant.png',
  hotelSingle: 'UI/Icon-Hotel-Single.png',
  hotelTwin: 'UI/Icon-Hotel-Double.png',
  hotelSuite: 'UI/Icon-Hotel-Suite.png',
  condo: 'UI/Icon-Condo.png',
  lobby: 'UI/Icon-Lobby.png',
  stairs: 'UI/Stairs.png',
  escalator: 'UI/Icon-Escalator.png',
  elevator: 'UI/Icon-Elevator.png',
  security: 'UI/Icon-Security.png',
  housekeeping: 'UI/Icon-Housekeeping.png',
  medical: 'UI/Icon-MedicalOffice.png',
  partyHall: 'UI/Icon-PartyHall.png',
  parking: 'UI/Icon-Parking.png',
  recycling: 'UI/Icon-Recycle.png',
  cinema: 'UI/Icon_Cinema.png',
};

/**
 * Get the full path to an Ocram sprite
 */
export function getOcramSpritePath(buildingType: BuildingType, variant?: number): string | null {
  const config = OCRAM_SPRITES[buildingType];
  if (!config) return null;
  
  const variantIndex = variant ?? 0;
  const variantName = config.variants?.[variantIndex % (config.variants?.length || 1)] || config.variants?.[0];
  
  if (!variantName) return null;
  
  return `/sprites/ocram/Rooms/Default/${variantName}.png`;
}

/**
 * Get UI icon path for a building type
 */
export function getOcramIconPath(buildingType: BuildingType): string | null {
  const iconPath = OCRAM_UI_ICONS[buildingType];
  if (!iconPath) return null;
  return `/sprites/ocram/${iconPath}`;
}
