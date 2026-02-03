/**
 * Rendering module exports
 * @module rendering
 */

export { Camera } from './Camera';
export type { CameraConfig, CameraState } from './Camera';

export { TowerRenderer, RENDER_CONSTANTS } from './TowerRenderer';
export { BuildingSprites } from './BuildingSprites';
export type { BuildingRenderOptions } from './BuildingSprites';

export { 
  createPixelGraphics,
  pixelRect,
  pixelWindow,
  pixelPerson,
  pixelFurniture,
  snapToPixel,
  darkenColor,
  lightenColor,
  PIXEL_ART_CONFIG
} from './PixelArtRenderer';
