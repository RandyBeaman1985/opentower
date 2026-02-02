/**
 * BuildingSprites - Enhanced visual rendering for all building types
 * 
 * Makes buildings look professional and SimTower-like instead of colored rectangles.
 * Each building type has custom rendering with proper visual details.
 * 
 * @module rendering/BuildingSprites
 */

import * as PIXI from 'pixi.js';
import type { Building } from '@/interfaces';
import { RENDER_CONSTANTS } from './TowerRenderer';

export interface BuildingRenderOptions {
  showLights: boolean;
  variant?: number; // For visual variety within same building type
}

/**
 * Enhanced building sprite renderer
 */
export class BuildingSprites {
  /**
   * Create a visual container for any building type
   */
  static createBuildingSprite(
    building: Building,
    options: BuildingRenderOptions = { showLights: false }
  ): PIXI.Container {
    const container = new PIXI.Container();
    const width = (building.position.endTile - building.position.startTile + 1) * RENDER_CONSTANTS.TILE_WIDTH;
    const height = building.height * RENDER_CONSTANTS.FLOOR_HEIGHT;

    // Get variant for visual variety (based on building ID hash)
    const variant = options.variant ?? this.getVariant(building.id);

    // Render based on building type
    switch (building.type) {
      case 'lobby':
        this.renderLobby(container, width, height, options, variant);
        break;
      case 'office':
        this.renderOffice(container, width, height, options, variant);
        break;
      case 'condo':
        this.renderCondo(container, width, height, options, variant);
        break;
      case 'fastFood':
        this.renderFastFood(container, width, height, options, variant);
        break;
      case 'restaurant':
        this.renderRestaurant(container, width, height, options, variant);
        break;
      case 'shop':
        this.renderShop(container, width, height, options, variant);
        break;
      case 'hotelSingle':
      case 'hotelTwin':
      case 'hotelSuite':
        this.renderHotel(container, width, height, options, variant, building.type);
        break;
      case 'partyHall':
        this.renderPartyHall(container, width, height, options, variant);
        break;
      case 'cinema':
        this.renderCinema(container, width, height, options, variant);
        break;
      case 'stairs':
        this.renderStairs(container, width, height, options, variant);
        break;
      case 'escalator':
        this.renderEscalator(container, width, height, options, variant);
        break;
      case 'parkingRamp':
      case 'parkingSpace':
        this.renderParking(container, width, height, options, variant, building.type);
        break;
      case 'housekeeping':
        this.renderHousekeeping(container, width, height, options, variant);
        break;
      case 'security':
        this.renderSecurity(container, width, height, options, variant);
        break;
      case 'medical':
        this.renderMedical(container, width, height, options, variant);
        break;
      case 'recycling':
        this.renderRecycling(container, width, height, options, variant);
        break;
      case 'metro':
        this.renderMetro(container, width, height, options, variant);
        break;
      case 'cathedral':
        this.renderCathedral(container, width, height, options, variant);
        break;
      default:
        this.renderDefault(container, width, height, options);
    }

    return container;
  }

  /**
   * Get a consistent variant number from building ID (0-2)
   */
  private static getVariant(id: string): number {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % 3;
  }

  /**
   * LOBBY - Grand entrance with glass front
   */
  private static renderLobby(g: PIXI.Container, width: number, height: number, options: BuildingRenderOptions, variant: number): void {
    const graphics = new PIXI.Graphics();

    // Marble walls
    const wallColor = variant === 0 ? 0xE8E0D5 : variant === 1 ? 0xF5F5DC : 0xFAF0E6;
    graphics.rect(0, 0, width, height);
    graphics.fill(wallColor);

    // Glass front (bottom 60%)
    const glassHeight = height * 0.6;
    const glassColor = options.showLights ? 0xFFE4B5 : 0x87CEEB;
    graphics.rect(0, height - glassHeight, width, glassHeight);
    graphics.fill({ color: glassColor, alpha: 0.7 });

    // Glass panels (vertical dividers)
    graphics.setStrokeStyle({ width: 2, color: 0x8B8B8B });
    for (let x = width / 4; x < width; x += width / 4) {
      graphics.moveTo(x, height - glassHeight);
      graphics.lineTo(x, height);
    }
    graphics.stroke();

    // Entrance doors (center, double doors)
    const doorWidth = 16;
    const doorHeight = 24;
    const doorX = width / 2 - doorWidth;
    const doorY = height - doorHeight - 4;
    
    // Left door
    graphics.rect(doorX, doorY, doorWidth - 2, doorHeight);
    graphics.fill({ color: 0x8B4513, alpha: 0.8 });
    
    // Right door
    graphics.rect(doorX + doorWidth, doorY, doorWidth - 2, doorHeight);
    graphics.fill({ color: 0x8B4513, alpha: 0.8 });

    // Door handles
    graphics.circle(doorX + 4, doorY + doorHeight / 2, 1.5);
    graphics.circle(doorX + doorWidth + doorWidth - 6, doorY + doorHeight / 2, 1.5);
    graphics.fill(0xFFD700);

    // Ceiling lights
    if (options.showLights) {
      const lightSpacing = width / 5;
      for (let x = lightSpacing / 2; x < width; x += lightSpacing) {
        graphics.circle(x, 8, 3);
        graphics.fill({ color: 0xFFFACD, alpha: 0.9 });
      }
    }

    // Border
    graphics.setStrokeStyle({ width: 2, color: 0x696969 });
    graphics.rect(0, 0, width, height);
    graphics.stroke();

    g.addChild(graphics);
  }

  /**
   * OFFICE - Professional office building with window grid
   */
  private static renderOffice(g: PIXI.Container, width: number, height: number, options: BuildingRenderOptions, variant: number): void {
    const graphics = new PIXI.Graphics();

    // Building color (varies by variant - different companies)
    const baseColors = [0x5B7C99, 0x6B8CAF, 0x4A6B82];
    const baseColor = baseColors[variant];
    
    graphics.rect(0, 0, width, height);
    graphics.fill(baseColor);

    // Window grid pattern
    const windowWidth = 8;
    const windowHeight = 10;
    const windowSpacingX = 12;
    const windowSpacingY = 14;
    const marginTop = 6;
    const marginSide = 4;

    const windowLitColor = 0xFFE4B5; // Warm office light
    const windowDarkColor = this.darkenColor(baseColor, 0.4);
    
    for (let y = marginTop; y < height - windowHeight; y += windowSpacingY) {
      for (let x = marginSide; x < width - windowWidth; x += windowSpacingX) {
        // Window frame
        graphics.rect(x, y, windowWidth, windowHeight);
        graphics.fill(0xD3D3D3);
        
        // Window glass (randomly lit or dark)
        const isLit = options.showLights && Math.random() > 0.3; // 70% lit at night
        const windowColor = isLit ? windowLitColor : windowDarkColor;
        
        graphics.rect(x + 1, y + 1, windowWidth - 2, windowHeight - 2);
        graphics.fill({ color: windowColor, alpha: isLit ? 0.95 : 1 });
        
        // Window cross divider
        graphics.setStrokeStyle({ width: 1, color: 0x696969, alpha: 0.5 });
        graphics.moveTo(x + windowWidth / 2, y + 1);
        graphics.lineTo(x + windowWidth / 2, y + windowHeight - 1);
        graphics.moveTo(x + 1, y + windowHeight / 2);
        graphics.lineTo(x + windowWidth - 1, y + windowHeight / 2);
        graphics.stroke();
      }
    }

    // Building outline
    graphics.setStrokeStyle({ width: 2, color: 0x2F4F4F });
    graphics.rect(0, 0, width, height);
    graphics.stroke();

    // Company name plate (top)
    const plateHeight = 5;
    graphics.rect(2, 2, width - 4, plateHeight);
    graphics.fill({ color: 0x2F4F4F, alpha: 0.8 });

    g.addChild(graphics);
  }

  /**
   * CONDO - Residential apartments with balconies
   */
  private static renderCondo(g: PIXI.Container, width: number, height: number, options: BuildingRenderOptions, variant: number): void {
    const graphics = new PIXI.Graphics();

    // Warm residential colors
    const baseColors = [0xD2B48C, 0xC9A87C, 0xDEB887];
    const baseColor = baseColors[variant];
    
    graphics.rect(0, 0, width, height);
    graphics.fill(baseColor);

    // Apartment windows (larger than office windows)
    const windowWidth = 10;
    const windowHeight = 14;
    const windowSpacingX = 16;
    const windowSpacingY = 18;
    const marginTop = 8;
    const marginSide = 8;

    for (let y = marginTop; y < height - windowHeight; y += windowSpacingY) {
      for (let x = marginSide; x < width - windowWidth; x += windowSpacingX) {
        // Window with curtains
        graphics.rect(x, y, windowWidth, windowHeight);
        graphics.fill(0xF5F5DC);
        
        // Interior light or curtains
        const isLit = options.showLights && Math.random() > 0.4; // 60% lit at night
        const interiorColor = isLit ? 0xFFDAB9 : 0x8B7355;
        
        graphics.rect(x + 1, y + 1, windowWidth - 2, windowHeight - 2);
        graphics.fill({ color: interiorColor, alpha: isLit ? 0.9 : 0.7 });
        
        // Window frame
        graphics.setStrokeStyle({ width: 1, color: 0x8B7355 });
        graphics.rect(x, y, windowWidth, windowHeight);
        graphics.stroke();
      }
    }

    // Balcony railings (every other row, offset)
    graphics.setStrokeStyle({ width: 2, color: 0x696969 });
    for (let y = marginTop + windowSpacingY; y < height; y += windowSpacingY * 2) {
      const balconyY = y + windowHeight;
      graphics.moveTo(marginSide, balconyY);
      graphics.lineTo(width - marginSide, balconyY);
    }
    graphics.stroke();

    // Building border
    graphics.setStrokeStyle({ width: 2, color: 0x8B6F47 });
    graphics.rect(0, 0, width, height);
    graphics.stroke();

    g.addChild(graphics);
  }

  /**
   * FAST FOOD - Bright, commercial look
   */
  private static renderFastFood(g: PIXI.Container, width: number, height: number, options: BuildingRenderOptions, variant: number): void {
    const graphics = new PIXI.Graphics();

    // Bright commercial colors
    const brandColors = [0xFF6347, 0xFFD700, 0xFF8C00];
    const accentColor = brandColors[variant];
    const baseColor = 0xFFF8DC;
    
    // Base wall
    graphics.rect(0, 0, width, height);
    graphics.fill(baseColor);

    // Brand stripe (top third)
    graphics.rect(0, 0, width, height / 3);
    graphics.fill(accentColor);

    // Large front windows
    const windowHeight = height * 0.6;
    const windowY = height - windowHeight - 4;
    
    graphics.rect(4, windowY, width - 8, windowHeight);
    graphics.fill({ color: 0x87CEEB, alpha: 0.6 });

    // Window dividers
    graphics.setStrokeStyle({ width: 2, color: 0x4A4A4A });
    const dividers = 3;
    for (let i = 1; i < dividers; i++) {
      const x = (width / dividers) * i;
      graphics.moveTo(x, windowY);
      graphics.lineTo(x, height - 4);
    }
    graphics.stroke();

    // Entry door (center)
    const doorWidth = 14;
    const doorHeight = 20;
    const doorX = width / 2 - doorWidth / 2;
    const doorY = height - doorHeight - 4;
    
    graphics.rect(doorX, doorY, doorWidth, doorHeight);
    graphics.fill(accentColor);
    
    // Door handle
    graphics.circle(doorX + doorWidth - 4, doorY + doorHeight / 2, 2);
    graphics.fill(0xFFFFFF);

    // Interior lighting (if night)
    if (options.showLights) {
      graphics.rect(6, windowY + 2, width - 12, windowHeight - 6);
      graphics.fill({ color: 0xFFFACD, alpha: 0.8 });
    }

    // Border
    graphics.setStrokeStyle({ width: 2, color: 0x8B4513 });
    graphics.rect(0, 0, width, height);
    graphics.stroke();

    g.addChild(graphics);
  }

  /**
   * RESTAURANT - Elegant dining establishment
   */
  private static renderRestaurant(g: PIXI.Container, width: number, height: number, options: BuildingRenderOptions, variant: number): void {
    const graphics = new PIXI.Graphics();

    // Elegant colors
    const baseColors = [0xC87137, 0xB8860B, 0xCD853F];
    const baseColor = baseColors[variant];
    
    graphics.rect(0, 0, width, height);
    graphics.fill(baseColor);

    // Awning at top
    const awningHeight = 10;
    const awningColor = variant === 0 ? 0x8B0000 : variant === 1 ? 0x006400 : 0x00008B;
    graphics.rect(0, 0, width, awningHeight);
    graphics.fill(awningColor);
    
    // Awning stripes
    graphics.setStrokeStyle({ width: 1, color: 0xFFFFFF, alpha: 0.5 });
    for (let x = 0; x < width; x += 8) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, awningHeight);
    }
    graphics.stroke();

    // Large windows with table silhouettes
    const windowTop = awningHeight + 8;
    const windowHeight = height - windowTop - 8;
    
    graphics.rect(4, windowTop, width - 8, windowHeight);
    graphics.fill({ color: 0x2F4F4F, alpha: 0.3 });

    // Interior warm lighting
    if (options.showLights) {
      graphics.rect(6, windowTop + 2, width - 12, windowHeight - 4);
      graphics.fill({ color: 0xFF8C00, alpha: 0.7 });
      
      // Chandelier/light fixtures (simple circles)
      const numLights = Math.floor(width / 20);
      for (let i = 0; i < numLights; i++) {
        const x = (width / (numLights + 1)) * (i + 1);
        const y = windowTop + 10;
        graphics.circle(x, y, 3);
        graphics.fill({ color: 0xFFD700, alpha: 0.95 });
      }
    }

    // Entrance (elegant double doors)
    const doorWidth = 12;
    const doorHeight = 22;
    const doorX = width / 2 - doorWidth;
    const doorY = height - doorHeight - 4;
    
    graphics.rect(doorX, doorY, doorWidth - 1, doorHeight);
    graphics.fill(0x4A2511);
    graphics.rect(doorX + doorWidth + 1, doorY, doorWidth - 1, doorHeight);
    graphics.fill(0x4A2511);

    // Gold trim
    graphics.setStrokeStyle({ width: 2, color: 0xDAA520 });
    graphics.rect(0, 0, width, height);
    graphics.stroke();

    g.addChild(graphics);
  }

  /**
   * SHOP - Retail storefront
   */
  private static renderShop(g: PIXI.Container, width: number, height: number, options: BuildingRenderOptions, variant: number): void {
    const graphics = new PIXI.Graphics();

    // Retail colors
    const baseColors = [0xE6B8E6, 0xD8BFD8, 0xDDA0DD];
    const baseColor = baseColors[variant];
    
    graphics.rect(0, 0, width, height);
    graphics.fill(baseColor);

    // Display windows (large, lower half)
    const displayTop = height / 2;
    const displayHeight = height / 2 - 8;
    
    graphics.rect(4, displayTop, width - 8, displayHeight);
    graphics.fill({ color: 0xE0FFFF, alpha: 0.7 });

    // Window display mannequins/products (simple shapes)
    if (options.showLights) {
      // Bright display lighting
      graphics.rect(6, displayTop + 2, width - 12, displayHeight - 4);
      graphics.fill({ color: 0xFFFAFA, alpha: 0.85 });
      
      // Product silhouettes
      const numProducts = Math.floor(width / 16);
      for (let i = 0; i < numProducts; i++) {
        const x = (width / (numProducts + 1)) * (i + 1);
        const y = displayTop + displayHeight / 2;
        
        // Simple product boxes
        graphics.rect(x - 4, y - 6, 8, 12);
        graphics.fill({ color: 0x9370DB, alpha: 0.6 });
      }
    }

    // Store sign area (top)
    const signHeight = 12;
    graphics.rect(0, 0, width, signHeight);
    graphics.fill({ color: 0x8B008B, alpha: 0.9 });

    // Entry door
    const doorWidth = 14;
    const doorHeight = displayHeight - 4;
    const doorX = width / 2 - doorWidth / 2;
    const doorY = displayTop + 2;
    
    graphics.rect(doorX, doorY, doorWidth, doorHeight);
    graphics.fill({ color: 0x696969, alpha: 0.3 });

    // Door handle
    graphics.circle(doorX + doorWidth - 3, doorY + doorHeight / 2, 2);
    graphics.fill(0xC0C0C0);

    // Border
    graphics.setStrokeStyle({ width: 2, color: 0x8B008B });
    graphics.rect(0, 0, width, height);
    graphics.stroke();

    g.addChild(graphics);
  }

  /**
   * HOTEL - Luxury accommodations
   */
  private static renderHotel(g: PIXI.Container, width: number, height: number, options: BuildingRenderOptions, variant: number, type: string): void {
    const graphics = new PIXI.Graphics();

    // Hotel luxury colors (darker = more expensive)
    const baseColor = type === 'hotelSuite' ? 0x4A3766 : 
                     type === 'hotelTwin' ? 0x6B4E8C : 
                     0x7B68A6;
    
    graphics.rect(0, 0, width, height);
    graphics.fill(baseColor);

    // Hotel windows (elegant, with curtains)
    const windowWidth = 12;
    const windowHeight = 14;
    const windowSpacingX = 18;
    const windowSpacingY = 18;
    const margin = 8;

    for (let y = margin; y < height - windowHeight; y += windowSpacingY) {
      for (let x = margin; x < width - windowWidth; x += windowSpacingX) {
        // Window frame (gold for suite, silver for others)
        const frameColor = type === 'hotelSuite' ? 0xFFD700 : 0xC0C0C0;
        graphics.rect(x, y, windowWidth, windowHeight);
        graphics.fill(frameColor);
        
        // Window interior
        const isOccupied = options.showLights && Math.random() > 0.5; // 50% occupancy
        const interiorColor = isOccupied ? 0xFFF8DC : this.darkenColor(baseColor, 0.3);
        
        graphics.rect(x + 1, y + 1, windowWidth - 2, windowHeight - 2);
        graphics.fill({ color: interiorColor, alpha: isOccupied ? 0.95 : 1 });
        
        // Curtains visible from outside
        if (Math.random() > 0.6) {
          graphics.rect(x + 2, y + 2, 3, windowHeight - 4);
          graphics.fill({ color: 0x8B0000, alpha: 0.6 });
          graphics.rect(x + windowWidth - 5, y + 2, 3, windowHeight - 4);
          graphics.fill({ color: 0x8B0000, alpha: 0.6 });
        }
      }
    }

    // Hotel sign area (top) - gold trim
    graphics.setStrokeStyle({ width: 3, color: 0xDAA520 });
    graphics.rect(2, 2, width - 4, 12);
    graphics.stroke();

    // Border
    graphics.setStrokeStyle({ width: 2, color: 0x2F2F4F });
    graphics.rect(0, 0, width, height);
    graphics.stroke();

    g.addChild(graphics);
  }

  /**
   * PARTY HALL - Festive entertainment venue
   */
  private static renderPartyHall(g: PIXI.Container, width: number, height: number, options: BuildingRenderOptions, variant: number): void {
    const graphics = new PIXI.Graphics();

    // Festive gold color
    graphics.rect(0, 0, width, height);
    graphics.fill(0xD4AF37);

    // Decorative top border (marquee style)
    const marqueeHeight = 8;
    graphics.rect(0, 0, width, marqueeHeight);
    graphics.fill(0xFF1493);

    // Marquee lights (alternating)
    if (options.showLights) {
      for (let x = 4; x < width; x += 8) {
        graphics.circle(x, marqueeHeight / 2, 2);
        graphics.fill((x / 8) % 2 === 0 ? 0xFFFF00 : 0xFFFFFF);
      }
    }

    // Large windows with party lights inside
    const windowTop = marqueeHeight + 6;
    const windowHeight = height - windowTop - 10;
    
    graphics.rect(6, windowTop, width - 12, windowHeight);
    graphics.fill({ color: 0x191970, alpha: 0.4 });

    if (options.showLights) {
      // Disco ball effect (colored lights)
      const colors = [0xFF00FF, 0x00FFFF, 0xFF0000, 0x00FF00, 0xFFFF00];
      for (let i = 0; i < 12; i++) {
        const x = 10 + Math.random() * (width - 20);
        const y = windowTop + 10 + Math.random() * (windowHeight - 20);
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        graphics.circle(x, y, 4);
        graphics.fill({ color, alpha: 0.8 });
      }
    }

    // Entry with red carpet indicator
    const doorWidth = 16;
    const doorX = width / 2 - doorWidth / 2;
    const doorY = height - 18;
    
    graphics.rect(doorX, doorY, doorWidth, 16);
    graphics.fill(0x8B0000);

    // Border
    graphics.setStrokeStyle({ width: 2, color: 0xFFD700 });
    graphics.rect(0, 0, width, height);
    graphics.stroke();

    g.addChild(graphics);
  }

  /**
   * CINEMA - Movie theater
   */
  private static renderCinema(g: PIXI.Container, width: number, height: number, options: BuildingRenderOptions, variant: number): void {
    const graphics = new PIXI.Graphics();

    // Dark theater colors
    graphics.rect(0, 0, width, height);
    graphics.fill(0x2F1810);

    // Marquee sign at top
    const marqueeHeight = 14;
    graphics.rect(0, 0, width, marqueeHeight);
    graphics.fill(0xFF4500);

    // Movie title lights (simple rectangles)
    if (options.showLights) {
      for (let x = 8; x < width - 8; x += 6) {
        graphics.rect(x, 3, 4, 8);
        graphics.fill({ color: 0xFFFFFF, alpha: 0.9 });
      }
    }

    // Box office window
    const boxOfficeWidth = width * 0.6;
    const boxOfficeHeight = 14;
    const boxOfficeX = (width - boxOfficeWidth) / 2;
    const boxOfficeY = marqueeHeight + 8;
    
    graphics.rect(boxOfficeX, boxOfficeY, boxOfficeWidth, boxOfficeHeight);
    graphics.fill({ color: 0xFFD700, alpha: 0.3 });

    if (options.showLights) {
      graphics.rect(boxOfficeX + 2, boxOfficeY + 2, boxOfficeWidth - 4, boxOfficeHeight - 4);
      graphics.fill({ color: 0xFFF8DC, alpha: 0.8 });
    }

    // Theater doors (double)
    const doorWidth = 10;
    const doorHeight = 18;
    const doorY = height - doorHeight - 6;
    const doorSpacing = width / 3;
    
    for (let i = 0; i < 2; i++) {
      const doorX = doorSpacing * (i + 1) - doorWidth / 2;
      graphics.rect(doorX, doorY, doorWidth, doorHeight);
      graphics.fill(0x8B0000);
      
      // Push bar
      graphics.rect(doorX + 2, doorY + doorHeight / 2 - 1, doorWidth - 4, 2);
      graphics.fill(0xC0C0C0);
    }

    // Movie poster frames (decorative)
    const posterWidth = 12;
    const posterHeight = 16;
    const numPosters = Math.floor(width / 24);
    const posterY = boxOfficeY + boxOfficeHeight + 8;
    
    for (let i = 0; i < numPosters; i++) {
      const posterX = ((width - posterWidth * numPosters) / (numPosters + 1)) * (i + 1) + posterWidth * i;
      
      graphics.rect(posterX, posterY, posterWidth, posterHeight);
      graphics.fill(0x4A4A4A);
      
      graphics.rect(posterX + 1, posterY + 1, posterWidth - 2, posterHeight - 2);
      graphics.fill([0xFF6347, 0x4169E1, 0x32CD32, 0xFF1493][i % 4]);
    }

    // Border
    graphics.setStrokeStyle({ width: 2, color: 0x8B0000 });
    graphics.rect(0, 0, width, height);
    graphics.stroke();

    g.addChild(graphics);
  }

  /**
   * STAIRS - Stairwell with steps visible
   */
  private static renderStairs(g: PIXI.Container, width: number, height: number, options: BuildingRenderOptions, variant: number): void {
    const graphics = new PIXI.Graphics();

    // Concrete stairwell
    graphics.rect(0, 0, width, height);
    graphics.fill(0x808080);

    // Stair steps (alternating direction)
    const stepHeight = 4;
    const numSteps = Math.floor(height / stepHeight);
    const stepDepth = width * 0.6;
    
    graphics.setStrokeStyle({ width: 2, color: 0x696969 });
    
    for (let i = 0; i < numSteps; i++) {
      const y = i * stepHeight;
      const ascending = Math.floor(i / 10) % 2 === 0; // Switch direction every 10 steps
      
      // Step tread
      const stepX = ascending ? (i % 10) * (stepDepth / 10) : stepDepth - (i % 10) * (stepDepth / 10);
      
      graphics.moveTo(stepX, y);
      graphics.lineTo(stepX + stepDepth / 10, y);
      graphics.stroke();
      
      // Step riser
      graphics.moveTo(stepX + stepDepth / 10, y);
      graphics.lineTo(stepX + stepDepth / 10, y + stepHeight);
      graphics.stroke();
    }

    // Handrail
    graphics.setStrokeStyle({ width: 2, color: 0xA52A2A });
    graphics.moveTo(width - 4, 0);
    graphics.lineTo(width - 4, height);
    graphics.stroke();

    // Border
    graphics.setStrokeStyle({ width: 2, color: 0x505050 });
    graphics.rect(0, 0, width, height);
    graphics.stroke();

    g.addChild(graphics);
  }

  /**
   * ESCALATOR - Moving stairs
   */
  private static renderEscalator(g: PIXI.Container, width: number, height: number, options: BuildingRenderOptions, variant: number): void {
    const graphics = new PIXI.Graphics();

    // Modern escalator housing
    graphics.rect(0, 0, width, height);
    graphics.fill(0xC0C0C0);

    // Escalator steps (diagonal)
    const stepWidth = 14;
    const stepHeight = 3;
    const numSteps = Math.ceil(height / stepHeight);
    
    graphics.setStrokeStyle({ width: 1, color: 0x808080 });
    
    for (let i = 0; i < numSteps; i++) {
      const y = i * stepHeight;
      const x = (i * 2) % width; // Diagonal movement
      
      graphics.rect(x, y, stepWidth, stepHeight);
      graphics.fill(0xFFD700);
      graphics.rect(x, y, stepWidth, stepHeight);
      graphics.stroke();
    }

    // Side panels (black)
    graphics.rect(0, 0, 4, height);
    graphics.fill(0x2F2F2F);
    graphics.rect(width - 4, 0, 4, height);
    graphics.fill(0x2F2F2F);

    // Handrails (moving)
    graphics.setStrokeStyle({ width: 3, color: 0x000000 });
    graphics.moveTo(2, 0);
    graphics.lineTo(2, height);
    graphics.moveTo(width - 2, 0);
    graphics.lineTo(width - 2, height);
    graphics.stroke();

    // Border
    graphics.setStrokeStyle({ width: 2, color: 0x696969 });
    graphics.rect(0, 0, width, height);
    graphics.stroke();

    g.addChild(graphics);
  }

  /**
   * PARKING - Garage with car silhouettes
   */
  private static renderParking(g: PIXI.Container, width: number, height: number, options: BuildingRenderOptions, variant: number, type: string): void {
    const graphics = new PIXI.Graphics();

    // Dark concrete garage
    const baseColor = 0x4A4A4A;
    graphics.rect(0, 0, width, height);
    graphics.fill(baseColor);

    // Parking lines (horizontal)
    graphics.setStrokeStyle({ width: 2, color: 0xFFFFFF, alpha: 0.6 });
    
    if (type === 'parkingSpace') {
      // Individual spaces
      const numSpaces = Math.floor(width / 16);
      for (let i = 0; i <= numSpaces; i++) {
        const x = (width / numSpaces) * i;
        graphics.moveTo(x, 0);
        graphics.lineTo(x, height);
      }
      graphics.stroke();
      
      // Cars parked (simple rectangles)
      for (let i = 0; i < numSpaces; i++) {
        if (Math.random() > 0.3) { // 70% occupied
          const x = (width / numSpaces) * i + 2;
          const carWidth = width / numSpaces - 4;
          const carHeight = height * 0.6;
          const carY = (height - carHeight) / 2;
          
          const carColor = [0xFF0000, 0x0000FF, 0xFFFFFF, 0x000000, 0xC0C0C0][Math.floor(Math.random() * 5)];
          
          graphics.rect(x, carY, carWidth, carHeight);
          graphics.fill({ color: carColor, alpha: 0.9 });
          
          // Windshield
          graphics.rect(x + 2, carY + 2, carWidth - 4, carHeight * 0.4);
          graphics.fill({ color: 0x87CEEB, alpha: 0.5 });
        }
      }
    } else {
      // Parking ramp - diagonal lines
      const numLines = 8;
      for (let i = 0; i <= numLines; i++) {
        const y = (height / numLines) * i;
        graphics.moveTo(0, y);
        graphics.lineTo(width, y);
      }
      graphics.stroke();
      
      // Ramp arrows (going up)
      for (let y = height - 12; y > 12; y -= 16) {
        const centerX = width / 2;
        graphics.moveTo(centerX, y);
        graphics.lineTo(centerX - 4, y + 6);
        graphics.moveTo(centerX, y);
        graphics.lineTo(centerX + 4, y + 6);
      }
      graphics.stroke();
    }

    // Ceiling lights
    if (options.showLights) {
      const lightSpacing = width / 4;
      for (let x = lightSpacing / 2; x < width; x += lightSpacing) {
        graphics.circle(x, 6, 3);
        graphics.fill({ color: 0xFFFACD, alpha: 0.8 });
      }
    }

    // Border
    graphics.setStrokeStyle({ width: 2, color: 0x2F2F2F });
    graphics.rect(0, 0, width, height);
    graphics.stroke();

    g.addChild(graphics);
  }

  /**
   * HOUSEKEEPING - Service area with cleaning equipment
   */
  private static renderHousekeeping(g: PIXI.Container, width: number, height: number, options: BuildingRenderOptions, variant: number): void {
    const graphics = new PIXI.Graphics();

    // Clean white/blue service area
    graphics.rect(0, 0, width, height);
    graphics.fill(0xE0F2F7);

    // Storage shelves (horizontal lines)
    const shelfSpacing = height / 5;
    graphics.setStrokeStyle({ width: 2, color: 0x708090 });
    
    for (let y = shelfSpacing; y < height; y += shelfSpacing) {
      graphics.moveTo(4, y);
      graphics.lineTo(width - 4, y);
    }
    graphics.stroke();

    // Cleaning supplies (simple shapes on shelves)
    for (let shelf = 1; shelf < 5; shelf++) {
      const y = shelfSpacing * shelf;
      for (let x = 8; x < width - 8; x += 12) {
        // Bottles/containers
        const itemHeight = 8;
        const itemWidth = 4;
        
        graphics.rect(x, y - itemHeight, itemWidth, itemHeight);
        graphics.fill([0x4169E1, 0x32CD32, 0xFF6347, 0xFFD700][shelf % 4]);
      }
    }

    // Mop/broom leaning in corner
    graphics.setStrokeStyle({ width: 2, color: 0x8B4513 });
    graphics.moveTo(width - 6, height);
    graphics.lineTo(width - 10, height / 4);
    graphics.stroke();
    
    graphics.circle(width - 10, height / 4, 3);
    graphics.fill(0xDCDCDC);

    // Border
    graphics.setStrokeStyle({ width: 2, color: 0x5F9EA0 });
    graphics.rect(0, 0, width, height);
    graphics.stroke();

    g.addChild(graphics);
  }

  /**
   * SECURITY - Monitoring station
   */
  private static renderSecurity(g: PIXI.Container, width: number, height: number, options: BuildingRenderOptions, variant: number): void {
    const graphics = new PIXI.Graphics();

    // Dark security room
    graphics.rect(0, 0, width, height);
    graphics.fill(0x2F2F2F);

    // Monitor wall (multiple screens)
    const monitorWidth = 14;
    const monitorHeight = 10;
    const numMonitors = Math.floor(width / (monitorWidth + 4));
    const monitorY = 8;
    
    for (let i = 0; i < numMonitors; i++) {
      const x = ((width - (monitorWidth * numMonitors + 2 * numMonitors)) / 2) + i * (monitorWidth + 2);
      
      // Monitor frame
      graphics.rect(x, monitorY, monitorWidth, monitorHeight);
      graphics.fill(0x1C1C1C);
      
      // Monitor screen (glowing)
      const screenColor = options.showLights ? 0x00FF00 : 0x004400;
      graphics.rect(x + 1, monitorY + 1, monitorWidth - 2, monitorHeight - 2);
      graphics.fill({ color: screenColor, alpha: options.showLights ? 0.9 : 0.5 });
      
      // Scanlines
      if (options.showLights) {
        graphics.setStrokeStyle({ width: 1, color: 0x00DD00, alpha: 0.3 });
        for (let sy = monitorY + 2; sy < monitorY + monitorHeight - 2; sy += 2) {
          graphics.moveTo(x + 2, sy);
          graphics.lineTo(x + monitorWidth - 2, sy);
        }
        graphics.stroke();
      }
    }

    // Security desk
    const deskHeight = 12;
    const deskY = height - deskHeight - 4;
    graphics.rect(4, deskY, width - 8, deskHeight);
    graphics.fill(0x696969);

    // Desk lamp
    if (options.showLights) {
      graphics.circle(width / 2, deskY + 4, 4);
      graphics.fill({ color: 0xFFD700, alpha: 0.8 });
    }

    // Warning sign
    const signSize = 8;
    const signX = 4;
    const signY = height - deskHeight - signSize - 8;
    
    graphics.rect(signX, signY, signSize, signSize);
    graphics.fill(0xFFFF00);
    
    graphics.setStrokeStyle({ width: 2, color: 0xFF0000 });
    graphics.moveTo(signX + 2, signY + 2);
    graphics.lineTo(signX + signSize - 2, signY + signSize - 2);
    graphics.moveTo(signX + signSize - 2, signY + 2);
    graphics.lineTo(signX + 2, signY + signSize - 2);
    graphics.stroke();

    // Border
    graphics.setStrokeStyle({ width: 2, color: 0xFF0000 });
    graphics.rect(0, 0, width, height);
    graphics.stroke();

    g.addChild(graphics);
  }

  /**
   * MEDICAL - Healthcare facility
   */
  private static renderMedical(g: PIXI.Container, width: number, height: number, options: BuildingRenderOptions, variant: number): void {
    const graphics = new PIXI.Graphics();

    // Clean white medical facility
    graphics.rect(0, 0, width, height);
    graphics.fill(0xF8F8FF);

    // Red cross (medical symbol)
    const crossSize = 16;
    const crossX = width / 2 - crossSize / 2;
    const crossY = height / 2 - crossSize / 2;
    const crossThickness = 6;
    
    // Vertical bar
    graphics.rect(crossX + (crossSize - crossThickness) / 2, crossY, crossThickness, crossSize);
    graphics.fill(0xFF0000);
    
    // Horizontal bar
    graphics.rect(crossX, crossY + (crossSize - crossThickness) / 2, crossSize, crossThickness);
    graphics.fill(0xFF0000);

    // Medical equipment (simple shapes)
    // IV Stand
    graphics.setStrokeStyle({ width: 2, color: 0xC0C0C0 });
    graphics.moveTo(width - 12, height - 4);
    graphics.lineTo(width - 12, height / 3);
    graphics.stroke();
    
    graphics.circle(width - 12, height / 3, 3);
    graphics.fill(0xADD8E6);

    // Examination light
    if (options.showLights) {
      graphics.circle(width / 4, 8, 5);
      graphics.fill({ color: 0xFFFFFF, alpha: 0.95 });
    }

    // Medical charts on wall
    for (let i = 0; i < 3; i++) {
      const chartX = 8 + i * 12;
      const chartY = 8;
      
      graphics.rect(chartX, chartY, 10, 14);
      graphics.fill(0xFFFFFF);
      
      graphics.setStrokeStyle({ width: 1, color: 0x0000FF });
      graphics.rect(chartX, chartY, 10, 14);
      graphics.stroke();
      
      // Chart lines
      for (let line = 0; line < 8; line++) {
        graphics.moveTo(chartX + 2, chartY + 3 + line * 1.5);
        graphics.lineTo(chartX + 8, chartY + 3 + line * 1.5);
      }
      graphics.stroke();
    }

    // Border (red medical border)
    graphics.setStrokeStyle({ width: 3, color: 0xFF0000 });
    graphics.rect(0, 0, width, height);
    graphics.stroke();

    g.addChild(graphics);
  }

  /**
   * RECYCLING - Waste management
   */
  private static renderRecycling(g: PIXI.Container, width: number, height: number, options: BuildingRenderOptions, variant: number): void {
    const graphics = new PIXI.Graphics();

    // Industrial green
    graphics.rect(0, 0, width, height);
    graphics.fill(0x6B8E23);

    // Recycling bins (different colors)
    const binWidth = 12;
    const binHeight = 16;
    const numBins = Math.min(4, Math.floor(width / (binWidth + 4)));
    const binY = height - binHeight - 6;
    const binColors = [0x0000FF, 0x008000, 0xFFFF00, 0x8B4513]; // Blue, green, yellow, brown
    const binSpacing = (width - numBins * binWidth) / (numBins + 1);
    
    for (let i = 0; i < numBins; i++) {
      const x = binSpacing * (i + 1) + binWidth * i;
      
      // Bin body
      graphics.rect(x, binY, binWidth, binHeight);
      graphics.fill(binColors[i]);
      
      // Bin lid
      graphics.rect(x - 1, binY - 2, binWidth + 2, 3);
      graphics.fill(0x2F2F2F);
      
      // Recycling symbol on bin
      const symbolSize = 6;
      const symbolX = x + binWidth / 2;
      const symbolY = binY + binHeight / 2;
      
      graphics.setStrokeStyle({ width: 2, color: 0xFFFFFF });
      // Simple triangle arrows
      for (let angle = 0; angle < 360; angle += 120) {
        const rad = (angle * Math.PI) / 180;
        const x1 = symbolX + Math.cos(rad) * symbolSize;
        const y1 = symbolY + Math.sin(rad) * symbolSize;
        const x2 = symbolX + Math.cos(rad + 0.5) * (symbolSize - 2);
        const y2 = symbolY + Math.sin(rad + 0.5) * (symbolSize - 2);
        
        graphics.moveTo(x1, y1);
        graphics.lineTo(x2, y2);
      }
      graphics.stroke();
    }

    // Recycling arrows (large, on wall)
    const arrowSize = 12;
    const arrowX = width / 2;
    const arrowY = 14;
    
    graphics.setStrokeStyle({ width: 3, color: 0xFFFFFF });
    // Circular arrows
    for (let angle = 0; angle < 360; angle += 120) {
      const rad = (angle * Math.PI) / 180;
      const x1 = arrowX + Math.cos(rad) * arrowSize;
      const y1 = arrowY + Math.sin(rad) * arrowSize;
      const x2 = arrowX + Math.cos(rad + 1) * arrowSize;
      const y2 = arrowY + Math.sin(rad + 1) * arrowSize;
      
      graphics.moveTo(x1, y1);
      graphics.lineTo(x2, y2);
      
      // Arrowhead
      graphics.lineTo(x2 - 3, y2 - 3);
      graphics.moveTo(x2, y2);
      graphics.lineTo(x2 + 3, y2 - 3);
    }
    graphics.stroke();

    // Border
    graphics.setStrokeStyle({ width: 2, color: 0x556B2F });
    graphics.rect(0, 0, width, height);
    graphics.stroke();

    g.addChild(graphics);
  }

  /**
   * METRO - Underground subway station
   */
  private static renderMetro(g: PIXI.Container, width: number, height: number, options: BuildingRenderOptions, variant: number): void {
    const graphics = new PIXI.Graphics();

    // Dark underground station
    graphics.rect(0, 0, width, height);
    graphics.fill(0x36454F);

    // Platform edge (yellow safety line)
    const platformY = height * 0.6;
    graphics.setStrokeStyle({ width: 3, color: 0xFFFF00 });
    graphics.moveTo(0, platformY);
    graphics.lineTo(width, platformY);
    graphics.stroke();

    // Tracks below platform
    graphics.setStrokeStyle({ width: 2, color: 0x696969 });
    const rail1Y = platformY + 8;
    const rail2Y = platformY + 14;
    
    graphics.moveTo(0, rail1Y);
    graphics.lineTo(width, rail1Y);
    graphics.moveTo(0, rail2Y);
    graphics.lineTo(width, rail2Y);
    graphics.stroke();
    
    // Rail ties
    for (let x = 0; x < width; x += 8) {
      graphics.setStrokeStyle({ width: 1, color: 0x8B4513 });
      graphics.moveTo(x, rail1Y - 2);
      graphics.lineTo(x, rail2Y + 2);
    }
    graphics.stroke();

    // Metro sign (illuminated)
    const signWidth = width * 0.6;
    const signHeight = 10;
    const signX = (width - signWidth) / 2;
    const signY = 8;
    
    graphics.rect(signX, signY, signWidth, signHeight);
    graphics.fill(0x0000FF);
    
    if (options.showLights) {
      graphics.rect(signX + 2, signY + 2, signWidth - 4, signHeight - 4);
      graphics.fill({ color: 0xFFFFFF, alpha: 0.9 });
    }

    // Station lights (ceiling)
    if (options.showLights) {
      const lightSpacing = width / 6;
      for (let x = lightSpacing / 2; x < width; x += lightSpacing) {
        graphics.rect(x - 6, 2, 12, 4);
        graphics.fill({ color: 0xFFFACD, alpha: 0.9 });
      }
    }

    // Pillars (support columns)
    const pillarWidth = 8;
    const numPillars = 3;
    const pillarSpacing = width / (numPillars + 1);
    
    for (let i = 1; i <= numPillars; i++) {
      const pillarX = pillarSpacing * i - pillarWidth / 2;
      graphics.rect(pillarX, signY + signHeight + 4, pillarWidth, platformY - signY - signHeight - 4);
      graphics.fill(0x708090);
    }

    // Border
    graphics.setStrokeStyle({ width: 2, color: 0x1C1C1C });
    graphics.rect(0, 0, width, height);
    graphics.stroke();

    g.addChild(graphics);
  }

  /**
   * CATHEDRAL - Majestic tower achievement
   */
  private static renderCathedral(g: PIXI.Container, width: number, height: number, options: BuildingRenderOptions, variant: number): void {
    const graphics = new PIXI.Graphics();

    // Grand golden cathedral
    graphics.rect(0, 0, width, height);
    graphics.fill(0xB8860B);

    // Gothic arched windows
    const windowWidth = 10;
    const windowHeight = 20;
    const numWindows = Math.floor(width / (windowWidth + 8));
    const windowY = height / 3;
    const windowSpacing = (width - numWindows * windowWidth) / (numWindows + 1);
    
    for (let i = 0; i < numWindows; i++) {
      const x = windowSpacing * (i + 1) + windowWidth * i;
      
      // Window frame (gold)
      graphics.rect(x, windowY, windowWidth, windowHeight);
      graphics.fill(0xDAA520);
      
      // Stained glass (colorful)
      const glassColors = [0xFF0000, 0x0000FF, 0x00FF00, 0xFF00FF, 0xFFFF00];
      const glassColor = glassColors[i % glassColors.length];
      
      graphics.rect(x + 2, windowY + 2, windowWidth - 4, windowHeight - 4);
      graphics.fill({ color: glassColor, alpha: options.showLights ? 0.9 : 0.6 });
      
      // Gothic arch top
      graphics.moveTo(x + 2, windowY + 6);
      graphics.lineTo(x + windowWidth / 2, windowY);
      graphics.lineTo(x + windowWidth - 2, windowY + 6);
      graphics.fill({ color: 0xDAA520, alpha: 0.9 });
    }

    // Rose window (large circular window at top)
    const roseSize = Math.min(width * 0.4, 24);
    const roseX = width / 2;
    const roseY = 16;
    
    graphics.circle(roseX, roseY, roseSize / 2);
    graphics.fill(0xDAA520);
    
    // Rose window glass segments
    const numSegments = 8;
    for (let i = 0; i < numSegments; i++) {
      const angle = (i * Math.PI * 2) / numSegments;
      const segmentColor = [0xFF0000, 0x0000FF, 0xFF00FF, 0xFFFF00][i % 4];
      
      graphics.moveTo(roseX, roseY);
      graphics.lineTo(
        roseX + Math.cos(angle) * (roseSize / 2 - 2),
        roseY + Math.sin(angle) * (roseSize / 2 - 2)
      );
      graphics.lineTo(
        roseX + Math.cos(angle + Math.PI / numSegments) * (roseSize / 2 - 2),
        roseY + Math.sin(angle + Math.PI / numSegments) * (roseSize / 2 - 2)
      );
      graphics.lineTo(roseX, roseY);
      graphics.fill({ color: segmentColor, alpha: options.showLights ? 0.95 : 0.7 });
    }

    // Grand entrance (bottom center)
    const doorWidth = 20;
    const doorHeight = 30;
    const doorX = width / 2 - doorWidth / 2;
    const doorY = height - doorHeight - 4;
    
    // Door frame (ornate)
    graphics.rect(doorX - 2, doorY - 2, doorWidth + 4, doorHeight + 4);
    graphics.fill(0xDAA520);
    
    // Door (rich wood)
    graphics.rect(doorX, doorY, doorWidth, doorHeight);
    graphics.fill(0x4A2511);
    
    // Door arch
    graphics.moveTo(doorX, doorY + 6);
    graphics.lineTo(doorX + doorWidth / 2, doorY - 4);
    graphics.lineTo(doorX + doorWidth, doorY + 6);
    graphics.fill(0xDAA520);

    // Spires/towers (decorative top corners)
    const spireWidth = 8;
    const spireHeight = 12;
    
    // Left spire
    graphics.moveTo(4, spireHeight);
    graphics.lineTo(4 + spireWidth / 2, 0);
    graphics.lineTo(4 + spireWidth, spireHeight);
    graphics.fill(0x8B6914);
    
    // Right spire
    graphics.moveTo(width - 4 - spireWidth, spireHeight);
    graphics.lineTo(width - 4 - spireWidth / 2, 0);
    graphics.lineTo(width - 4, spireHeight);
    graphics.fill(0x8B6914);

    // Border (golden)
    graphics.setStrokeStyle({ width: 3, color: 0xFFD700 });
    graphics.rect(0, 0, width, height);
    graphics.stroke();

    g.addChild(graphics);
  }

  /**
   * Default fallback renderer
   */
  private static renderDefault(g: PIXI.Container, width: number, height: number, options: BuildingRenderOptions): void {
    const graphics = new PIXI.Graphics();
    
    graphics.rect(0, 0, width, height);
    graphics.fill(0x999999);
    
    graphics.setStrokeStyle({ width: 2, color: 0x666666 });
    graphics.rect(0, 0, width, height);
    graphics.stroke();
    
    g.addChild(graphics);
  }

  /**
   * Darken a color
   */
  private static darkenColor(color: number, factor: number): number {
    const r = Math.floor(((color >> 16) & 0xFF) * (1 - factor));
    const g = Math.floor(((color >> 8) & 0xFF) * (1 - factor));
    const b = Math.floor((color & 0xFF) * (1 - factor));
    return (r << 16) | (g << 8) | b;
  }

  /**
   * Lighten a color
   */
  private static lightenColor(color: number, factor: number): number {
    const r = Math.min(255, Math.floor(((color >> 16) & 0xFF) * (1 + factor)));
    const g = Math.min(255, Math.floor(((color >> 8) & 0xFF) * (1 + factor)));
    const b = Math.min(255, Math.floor((color & 0xFF) * (1 + factor)));
    return (r << 16) | (g << 8) | b;
  }
}
