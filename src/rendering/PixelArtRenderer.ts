/**
 * PixelArtRenderer - Enhanced pixel art rendering utilities
 * 
 * Makes buildings look like authentic pixel art instead of smooth vector graphics
 * by enforcing integer coordinates, pixel-perfect alignment, and retro aesthetics.
 * 
 * @module rendering/PixelArtRenderer
 */

import * as PIXI from 'pixi.js';

/**
 * Pixel art rendering configuration
 */
export const PIXEL_ART_CONFIG = {
  /** Snap all coordinates to pixel boundaries */
  SNAP_TO_PIXEL: true,
  /** Use nearest-neighbor scaling (no anti-aliasing) */
  USE_NEAREST_NEIGHBOR: true,
  /** Pixel grid size (all elements snap to this grid) */
  PIXEL_GRID: 1,
};

/**
 * Create a pixel-perfect graphics object
 * No anti-aliasing, snaps to pixel boundaries
 */
export function createPixelGraphics(): PIXI.Graphics {
  const graphics = new PIXI.Graphics();
  
  // Disable anti-aliasing for sharp pixel edges
  graphics.antialias = false;
  
  return graphics;
}

/**
 * Snap a coordinate to pixel boundary
 */
export function snapToPixel(value: number): number {
  return Math.floor(value);
}

/**
 * Draw a pixel-perfect rectangle with dithering option
 */
export function pixelRect(
  graphics: PIXI.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number,
  dither?: boolean
): void {
  const px = snapToPixel(x);
  const py = snapToPixel(y);
  const pw = snapToPixel(width);
  const ph = snapToPixel(height);
  
  if (dither) {
    // Create checkerboard dither pattern for retro look
    for (let dy = 0; dy < ph; dy++) {
      for (let dx = 0; dx < pw; dx++) {
        if ((dx + dy) % 2 === 0) {
          graphics.rect(px + dx, py + dy, 1, 1);
          graphics.fill(color);
        }
      }
    }
  } else {
    graphics.rect(px, py, pw, ph);
    graphics.fill(color);
  }
}

/**
 * Draw a pixel-perfect window with frame and glass
 */
export function pixelWindow(
  graphics: PIXI.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  isLit: boolean,
  frameColor: number = 0xD3D3D3
): void {
  const px = snapToPixel(x);
  const py = snapToPixel(y);
  const pw = snapToPixel(width);
  const ph = snapToPixel(height);
  
  // Window frame (outer)
  graphics.rect(px, py, pw, ph);
  graphics.fill(frameColor);
  
  // Window glass (inner)
  const glassColor = isLit ? 0xFFE4B5 : 0x6B8CAF;
  graphics.rect(px + 1, py + 1, pw - 2, ph - 2);
  graphics.fill(glassColor);
  
  // Window cross divider (pixel-perfect lines)
  graphics.rect(px + Math.floor(pw / 2), py + 1, 1, ph - 2);
  graphics.fill({ color: 0x696969, alpha: 0.5 });
  graphics.rect(px + 1, py + Math.floor(ph / 2), pw - 2, 1);
  graphics.fill({ color: 0x696969, alpha: 0.5 });
}

/**
 * Draw pixel-perfect text (using bitmap font-style blocks)
 */
export function pixelText(
  graphics: PIXI.Graphics,
  x: number,
  y: number,
  text: string,
  color: number = 0xFFFFFF
): void {
  const px = snapToPixel(x);
  const py = snapToPixel(y);
  const charWidth = 4;
  const charHeight = 6;
  
  // Simple bitmap font rendering (just blocks for now)
  for (let i = 0; i < text.length; i++) {
    const charX = px + i * (charWidth + 1);
    graphics.rect(charX, py, charWidth, charHeight);
    graphics.fill({ color, alpha: 0.8 });
  }
}

/**
 * Create a pixel art gradient (using horizontal stripes)
 */
export function pixelGradient(
  graphics: PIXI.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  colorTop: number,
  colorBottom: number,
  stripes: number = 8
): void {
  const px = snapToPixel(x);
  const py = snapToPixel(y);
  const pw = snapToPixel(width);
  const ph = snapToPixel(height);
  
  const stripeHeight = Math.max(1, Math.floor(ph / stripes));
  
  for (let i = 0; i < stripes; i++) {
    const t = i / (stripes - 1);
    const color = lerpColor(colorTop, colorBottom, t);
    const stripeY = py + i * stripeHeight;
    const actualHeight = Math.min(stripeHeight, ph - i * stripeHeight);
    
    graphics.rect(px, stripeY, pw, actualHeight);
    graphics.fill(color);
  }
}

/**
 * Linear interpolation between two colors
 */
function lerpColor(color1: number, color2: number, t: number): number {
  const r1 = (color1 >> 16) & 0xff;
  const g1 = (color1 >> 8) & 0xff;
  const b1 = color1 & 0xff;

  const r2 = (color2 >> 16) & 0xff;
  const g2 = (color2 >> 8) & 0xff;
  const b2 = color2 & 0xff;

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return (r << 16) | (g << 8) | b;
}

/**
 * Draw pixel-art person silhouette (for building interiors)
 */
export function pixelPerson(
  graphics: PIXI.Graphics,
  x: number,
  y: number,
  color: number = 0x000000,
  facing: 'left' | 'right' = 'right'
): void {
  const px = snapToPixel(x);
  const py = snapToPixel(y);
  
  // Head (2×2 pixels)
  graphics.rect(px + (facing === 'right' ? 1 : 3), py, 2, 2);
  graphics.fill(color);
  
  // Body (3×4 pixels)
  graphics.rect(px + 1, py + 2, 3, 4);
  graphics.fill(color);
  
  // Legs (2 pixels each, 2 pixels tall)
  graphics.rect(px + 1, py + 6, 1, 2);
  graphics.fill(color);
  graphics.rect(px + 3, py + 6, 1, 2);
  graphics.fill(color);
}

/**
 * Draw pixel-art furniture (desk, chair, bed, etc.)
 */
export function pixelFurniture(
  graphics: PIXI.Graphics,
  x: number,
  y: number,
  type: 'desk' | 'chair' | 'bed' | 'table' | 'plant',
  color: number = 0x8B4513
): void {
  const px = snapToPixel(x);
  const py = snapToPixel(y);
  
  switch (type) {
    case 'desk':
      // Desk top (8×2 pixels)
      graphics.rect(px, py, 8, 2);
      graphics.fill(color);
      // Desk legs
      graphics.rect(px, py + 2, 1, 4);
      graphics.fill(color);
      graphics.rect(px + 7, py + 2, 1, 4);
      graphics.fill(color);
      break;
      
    case 'chair':
      // Chair seat (4×2 pixels)
      graphics.rect(px, py + 2, 4, 2);
      graphics.fill(color);
      // Chair back
      graphics.rect(px + 3, py, 1, 4);
      graphics.fill(color);
      break;
      
    case 'bed':
      // Bed frame (12×6 pixels)
      graphics.rect(px, py + 2, 12, 4);
      graphics.fill(color);
      // Pillow
      graphics.rect(px + 1, py + 1, 3, 2);
      graphics.fill(0xFFFFFF);
      break;
      
    case 'table':
      // Table top (6×2 pixels)
      graphics.rect(px, py, 6, 2);
      graphics.fill(color);
      // Table legs
      graphics.rect(px, py + 2, 1, 3);
      graphics.fill(color);
      graphics.rect(px + 5, py + 2, 1, 3);
      graphics.fill(color);
      break;
      
    case 'plant':
      // Pot (3×2 pixels)
      graphics.rect(px, py + 3, 3, 2);
      graphics.fill(0x8B4513);
      // Plant (3×3 pixels)
      graphics.rect(px, py, 3, 3);
      graphics.fill(0x228B22);
      break;
  }
}

/**
 * Darken a color (for shadows, night mode)
 */
export function darkenColor(color: number, factor: number): number {
  const r = Math.floor(((color >> 16) & 0xFF) * (1 - factor));
  const g = Math.floor(((color >> 8) & 0xFF) * (1 - factor));
  const b = Math.floor((color & 0xFF) * (1 - factor));
  return (r << 16) | (g << 8) | b;
}

/**
 * Lighten a color
 */
export function lightenColor(color: number, factor: number): number {
  const r = Math.min(255, Math.floor(((color >> 16) & 0xFF) * (1 + factor)));
  const g = Math.min(255, Math.floor(((color >> 8) & 0xFF) * (1 + factor)));
  const b = Math.min(255, Math.floor((color & 0xFF) * (1 + factor)));
  return (r << 16) | (g << 8) | b;
}
