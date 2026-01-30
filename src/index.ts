/**
 * OpenTower - SimTower HD Remaster
 * Entry point
 */

import { Application } from 'pixi.js';

async function main() {
  // Create PixiJS application
  const app = new Application();

  // Initialize with WebGPU (falls back to WebGL)
  await app.init({
    width: 1280,
    height: 720,
    backgroundColor: 0x87ceeb, // Sky blue
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    antialias: true,
  });

  // Add canvas to DOM
  const container = document.getElementById('game-container');
  if (container) {
    container.appendChild(app.canvas);
  }

  // Verify PixiJS is working
  const { Graphics, Text, TextStyle } = await import('pixi.js');

  // Draw ground
  const ground = new Graphics();
  ground.rect(0, 600, 1280, 120);
  ground.fill(0x228b22); // Forest green
  app.stage.addChild(ground);

  // Draw a simple building placeholder
  const building = new Graphics();
  building.rect(540, 300, 200, 300);
  building.fill(0xd3d3d3); // Light gray
  building.stroke({ width: 2, color: 0x696969 });
  app.stage.addChild(building);

  // Add title text
  const style = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 48,
    fontWeight: 'bold',
    fill: 0xffffff,
    stroke: { color: 0x000000, width: 4 },
    dropShadow: {
      color: 0x000000,
      blur: 4,
      angle: Math.PI / 6,
      distance: 6,
    },
  });

  const title = new Text({ text: 'OpenTower', style });
  title.anchor.set(0.5);
  title.x = 640;
  title.y = 100;
  app.stage.addChild(title);

  // Add subtitle
  const subtitleStyle = new TextStyle({
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xffffff,
    stroke: { color: 0x000000, width: 2 },
  });

  const subtitle = new Text({ text: 'SimTower HD Remaster - Phase 0 Complete', style: subtitleStyle });
  subtitle.anchor.set(0.5);
  subtitle.x = 640;
  subtitle.y = 160;
  app.stage.addChild(subtitle);

  // Add version info
  const versionStyle = new TextStyle({
    fontFamily: 'monospace',
    fontSize: 16,
    fill: 0x333333,
  });

  const version = new Text({ text: 'v0.1.0 - TypeScript + PixiJS 8', style: versionStyle });
  version.x = 10;
  version.y = 700;
  app.stage.addChild(version);

  // Log success
  console.log('OpenTower initialized successfully!');
  console.log('PixiJS version:', app.renderer.type === 1 ? 'WebGL' : 'WebGPU');
}

main().catch(console.error);
