#!/usr/bin/env node
/**
 * Placeholder Sprite Generator
 * 
 * Generates simple geometric sprites to test sprite loading system.
 * Replace with real pixel art from ImageFX/DALL-E later.
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Asset directories
const BUILDINGS_DIR = path.join(__dirname, '../public/assets/buildings');
const PEOPLE_DIR = path.join(__dirname, '../public/assets/people');

// Building sprite configs (from BuildingSprites.ts)
const BUILDING_SPRITES = {
  // Offices
  'office-empty': { width: 96, height: 48, color: '#4A90E2' },
  'office-half': { width: 96, height: 48, color: '#357ABD' },
  'office-full': { width: 96, height: 48, color: '#2C5F99' },
  
  // Fast Food
  'fastFood-empty': { width: 128, height: 48, color: '#E74C3C' },
  'fastFood-busy': { width: 128, height: 48, color: '#C0392B' },
  
  // Hotels
  'hotelSingle-vacant': { width: 64, height: 48, color: '#9B59B6' },
  'hotelSingle-occupied-day': { width: 64, height: 48, color: '#8E44AD' },
  'hotelSingle-sleeping': { width: 64, height: 48, color: '#6C3483' },
  
  'hotelTwin-vacant': { width: 96, height: 48, color: '#9B59B6' },
  'hotelTwin-occupied-day': { width: 96, height: 48, color: '#8E44AD' },
  'hotelTwin-sleeping': { width: 96, height: 48, color: '#6C3483' },
  
  'hotelSuite-vacant': { width: 128, height: 48, color: '#9B59B6' },
  'hotelSuite-occupied-day': { width: 128, height: 48, color: '#8E44AD' },
  'hotelSuite-sleeping': { width: 128, height: 48, color: '#6C3483' },
  
  // Lobby (star ratings)
  'lobby-1star': { width: 256, height: 48, color: '#95A5A6' },
  'lobby-2star': { width: 256, height: 48, color: '#BDC3C7' },
  'lobby-3star': { width: 256, height: 48, color: '#D4AF37' },
  'lobby-4star': { width: 256, height: 48, color: '#FFD700' },
  'lobby-5star': { width: 256, height: 48, color: '#FFA500' },
  
  // Condos
  'condo-forsale': { width: 96, height: 48, color: '#E67E22' },
  'condo-occupied-day': { width: 96, height: 48, color: '#D35400' },
  'condo-occupied-night': { width: 96, height: 48, color: '#A04000' },
  
  // Restaurants
  'restaurant-empty': { width: 128, height: 48, color: '#1ABC9C' },
  'restaurant-busy': { width: 128, height: 48, color: '#16A085' },
  
  // Shops
  'shop-closed': { width: 96, height: 48, color: '#F39C12' },
  'shop-open': { width: 96, height: 48, color: '#E67E22' },
  
  // Service Buildings
  'security-empty': { width: 96, height: 48, color: '#34495E' },
  'medical-empty': { width: 96, height: 48, color: '#E74C3C' },
  'recycling-empty': { width: 96, height: 48, color: '#27AE60' },
  
  // Entertainment
  'partyHall-empty': { width: 192, height: 48, color: '#9B59B6' },
  'cinema-empty': { width: 128, height: 48, color: '#2C3E50' },
  'housekeeping-empty': { width: 64, height: 48, color: '#95A5A6' },
  
  // Parking
  'parkingRamp-empty': { width: 192, height: 96, color: '#7F8C8D' },
  'parkingSpace-empty': { width: 96, height: 48, color: '#95A5A6' },
  
  // Metro
  'metro-empty': { width: 256, height: 48, color: '#3498DB' },
  
  // Cathedral
  'cathedral-empty': { width: 256, height: 96, color: '#8E44AD' },
  
  // Stairs
  'stairs-empty': { width: 64, height: 48, color: '#BDC3C7' },
};

// Person sprite colors (stress levels)
const PERSON_COLORS = {
  'normal': '#2C3E50',      // Black (0-20 stress)
  'slight': '#FFB6C1',      // Light pink (21-40)
  'moderate': '#FF69B4',    // Dark pink (41-60)
  'high': '#FF0000',        // Red (61-80)
  'critical': '#8B0000',    // Dark red (81-100)
};

/**
 * Generate a simple placeholder building sprite
 */
function generateBuildingSprite(name, config) {
  const { width, height, color } = config;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background fill
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  // Add border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);
  
  // Add window grid pattern (simple placeholder)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  
  // Vertical windows
  const cols = Math.floor(width / 16);
  for (let i = 1; i < cols; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 16, 0);
    ctx.lineTo(i * 16, height);
    ctx.stroke();
  }
  
  // Horizontal floor line (middle)
  if (height > 48) {
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  }
  
  // Add state indicator text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const state = name.split('-')[1] || 'empty';
  ctx.fillText(state.toUpperCase(), width / 2, height / 2);
  
  return canvas;
}

/**
 * Generate a simple person sprite (8x16px)
 */
function generatePersonSprite(color, direction, frame) {
  const width = 8;
  const height = 16;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Head (circle at top)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(4, 3, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Body (rectangle)
  ctx.fillRect(2, 5, 4, 6);
  
  // Legs (walking animation)
  const legOffset = frame === 1 ? 1 : -1;
  ctx.fillRect(2 + legOffset, 11, 2, 5); // Left leg
  ctx.fillRect(4 - legOffset, 11, 2, 5); // Right leg
  
  // Arms (tiny)
  ctx.fillRect(1, 6, 1, 3); // Left arm
  ctx.fillRect(6, 6, 1, 3); // Right arm
  
  return canvas;
}

/**
 * Save canvas as PNG
 */
function saveCanvas(canvas, filepath) {
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filepath, buffer);
  console.log(`✅ Generated: ${path.basename(filepath)}`);
}

/**
 * Main generation function
 */
function generateAll() {
  console.log('🎨 Generating Placeholder Sprites...\n');
  
  // Create directories
  fs.mkdirSync(BUILDINGS_DIR, { recursive: true });
  fs.mkdirSync(PEOPLE_DIR, { recursive: true });
  
  // Generate building sprites
  console.log('🏢 Buildings:');
  for (const [name, config] of Object.entries(BUILDING_SPRITES)) {
    const canvas = generateBuildingSprite(name, config);
    const filepath = path.join(BUILDINGS_DIR, `${name}.png`);
    saveCanvas(canvas, filepath);
  }
  
  console.log('\n👤 People:');
  // Generate person sprites (5 colors × 2 directions × 3 frames = 30 sprites)
  for (const [stressLevel, color] of Object.entries(PERSON_COLORS)) {
    for (const direction of ['left', 'right']) {
      for (const frame of [0, 1, 2]) {
        const canvas = generatePersonSprite(color, direction, frame);
        const name = `person-${stressLevel}-${direction}-${frame}`;
        const filepath = path.join(PEOPLE_DIR, `${name}.png`);
        saveCanvas(canvas, filepath);
      }
    }
  }
  
  console.log('\n✨ Complete!');
  console.log(`📁 Buildings: ${BUILDINGS_DIR}`);
  console.log(`📁 People: ${PEOPLE_DIR}`);
  console.log('\n🚀 Start the dev server and sprites should auto-load!');
}

// Run generator
try {
  generateAll();
} catch (error) {
  console.error('❌ Error:', error.message);
  
  if (error.message.includes('canvas')) {
    console.log('\n📦 Install canvas package:');
    console.log('   npm install canvas');
  }
  
  process.exit(1);
}
