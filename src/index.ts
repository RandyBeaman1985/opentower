/**
 * OpenTower - SimTower HD Remaster
 * Entry point
 */

import { Game } from '@core/Game';
import type { Building, BuildingType } from '@/interfaces';

// Make game globally accessible for debugging
declare global {
  interface Window {
    game: Game;
  }
}

async function main() {
  // Create and initialize game
  const game = new Game({
    width: 1280,
    height: 720,
    initialSpeed: 1,
    container: 'game-container',
  });

  await game.init();

  // Make game available for debugging
  window.game = game;

  // Add some test buildings to demonstrate rendering
  const towerManager = game.getTowerManager();

  // Place a lobby on ground floor
  const lobby: Building = {
    id: 'lobby-1',
    type: 'lobby',
    position: { floor: 1, startTile: 150, endTile: 200 },
    width: 51,
    height: 1,
    floors: [1],
    state: 'active',
    stress: 0,
    occupantIds: [],
    incomePerQuarter: 0,
    maintenanceCostPerQuarter: 0,
    lastEvaluationDate: null,
    consecutiveBadEvals: 0,
    vacantSince: null,
  };
  towerManager.addBuilding(lobby);

  // Add some offices on floor 2
  const buildings: Array<{ type: BuildingType; floor: number; start: number; end: number }> = [
    { type: 'office', floor: 2, start: 155, end: 163 },
    { type: 'office', floor: 2, start: 165, end: 173 },
    { type: 'office', floor: 2, start: 175, end: 183 },
    { type: 'office', floor: 2, start: 185, end: 193 },
    // Floor 3
    { type: 'fastFood', floor: 3, start: 155, end: 170 },
    { type: 'restaurant', floor: 3, start: 172, end: 195 },
    // Floor 4
    { type: 'condo', floor: 4, start: 155, end: 170 },
    { type: 'condo', floor: 4, start: 172, end: 187 },
  ];

  buildings.forEach((b, i) => {
    const building: Building = {
      id: `building-${i}`,
      type: b.type,
      position: { floor: b.floor, startTile: b.start, endTile: b.end },
      width: b.end - b.start + 1,
      height: 1,
      floors: [b.floor],
      state: 'active',
      stress: 0,
      occupantIds: [],
      incomePerQuarter: 10000,
      maintenanceCostPerQuarter: 0,
      lastEvaluationDate: null,
      consecutiveBadEvals: 0,
      vacantSince: null,
    };
    towerManager.addBuilding(building);
  });

  // Start the game
  game.start();

  // Log success
  console.log('OpenTower Phase 1 initialized successfully!');
  console.log('Use window.game to access the game instance');
  console.log('Controls: Mouse drag to pan, scroll to zoom');

  // Add keyboard controls for speed
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case '0':
        game.setSpeed(0);
        console.log('Game paused');
        break;
      case '1':
        game.setSpeed(1);
        console.log('Speed: Normal (1x)');
        break;
      case '2':
        game.setSpeed(2);
        console.log('Speed: Fast (2x)');
        break;
      case '4':
        game.setSpeed(4);
        console.log('Speed: Fastest (4x)');
        break;
      case 'd':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const renderer = game.getTowerRenderer();
          if (renderer) {
            // Toggle debug mode
            const debugEnabled = !renderer['debugMode'];
            renderer.setDebugMode(debugEnabled);
            console.log(`Debug mode: ${debugEnabled ? 'ON' : 'OFF'}`);
          }
        }
        break;
    }
  });

  // Add HUD overlay
  addHUD(game);
}

/**
 * Add a simple HUD overlay
 */
function addHUD(game: Game) {
  // Create HUD container
  const hud = document.createElement('div');
  hud.id = 'hud';
  hud.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px;
    font-family: monospace;
    font-size: 14px;
    border-radius: 5px;
    z-index: 1000;
    pointer-events: none;
  `;
  document.body.appendChild(hud);

  // Update HUD every 100ms
  setInterval(() => {
    const tower = game.getTowerManager().getTower();
    const speed = game.getSpeed();
    const speedText = speed === 0 ? 'Paused' : `${speed}x`;

    hud.innerHTML = `
      <div><strong>OpenTower</strong> - Phase 1</div>
      <div>Time: ${game.getFormattedTime()}</div>
      <div>Date: ${game.getFormattedDate()}</div>
      <div>Speed: ${speedText} (0-4 to change)</div>
      <div>Funds: $${tower.funds.toLocaleString()}</div>
      <div>Population: ${tower.population}</div>
      <div>Star Rating: ${'⭐'.repeat(tower.starRating)}</div>
      <div>FPS: ${game.getFPS()}</div>
      <div style="margin-top: 5px; font-size: 11px; opacity: 0.7;">
        Drag to pan | Scroll to zoom | Ctrl+D debug
      </div>
    `;
  }, 100);
}

main().catch(console.error);
