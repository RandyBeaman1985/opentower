/**
 * OpenTower - SimTower HD Remaster
 * Entry point with building placement system
 */

import { Game } from '@core/Game';
import { BuildingPlacer, BuildingMenu } from '@/ui';
import { TowerPulse } from '@/ui/TowerPulse';
import { TutorialOverlay } from '@/ui/TutorialOverlay';
import { StarRatingNotification } from '@/ui/StarRatingNotification';
import { BuildingTooltip } from '@/ui/BuildingTooltip';
import { RandomEventNotification } from '@/ui/RandomEventNotification';
import { GameOverModal } from '@/ui/GameOverModal';
import { FinancialReportModal } from '@/ui/FinancialReportModal';
import { getEventBus } from '@core/EventBus';
import { getSoundManager } from '@/audio/SoundManager';
import { installPerformanceBenchmark } from '@/test/PerformanceBenchmark';
import { installSystemVerification } from '@/utils/SystemVerification';

// Make game globally accessible for debugging
declare global {
  interface Window {
    game: Game;
    placer: BuildingPlacer;
    runPerformanceBenchmark?: () => Promise<void>;
    verifyGameSystems?: () => Promise<void>;
  }
}

async function main() {
  // Create and initialize game
  const game = new Game({
    width: window.innerWidth,
    height: window.innerHeight,
    initialSpeed: 1,
    container: 'game-container',
  });

  await game.init();

  // Make game available for debugging
  window.game = game;

  // Install performance benchmark (Week 12 - Performance Testing)
  installPerformanceBenchmark(game);

  // Install system verification (Week 10 - Visual Polish Verification)
  installSystemVerification(game);

  // Try to load existing save
  const saveLoadManager = game.getSaveLoadManager();
  if (saveLoadManager && saveLoadManager.hasSave()) {
    const metadata = saveLoadManager.getSaveMetadata();
    if (metadata) {
      console.log('📂 Found existing save!');
      console.log(`  Last saved: ${new Date(metadata.timestamp).toLocaleString()}`);
      console.log(`  Population: ${metadata.population}`);
      console.log(`  Funds: $${metadata.funds.toLocaleString()}`);
      console.log('  Loading...');
      
      const loaded = saveLoadManager.load();
      if (loaded) {
        console.log('✅ Save loaded successfully!');
      } else {
        console.warn('⚠️ Failed to load save, starting fresh');
      }
    }
  }

  // Start auto-save
  if (saveLoadManager) {
    saveLoadManager.startAutoSave();
    console.log('💾 Auto-save enabled (every 3 minutes)');
  }

  // Get references
  const towerManager = game.getTowerManager();
  const renderer = game.getTowerRenderer()!;
  const tower = towerManager.getTower();

  // Create building placer
  const placer = new BuildingPlacer(renderer.getWorldContainer());
  placer.setTower(tower);
  placer.setEnabled(true);
  window.placer = placer;

  // Create building menu
  const menu = new BuildingMenu();
  menu.setFunds(tower.funds);
  menu.setupKeyboardShortcuts();

  // Connect menu to placer
  menu.onSelect((type) => {
    placer.selectBuildingType(type);
  });

  // Set initial selection
  placer.selectBuildingType(menu.getSelectedType());

  // Get canvas for mouse events
  const canvas = renderer.getApp().canvas;
  const camera = renderer.getCamera();

  // Track if we're dragging (don't place while dragging)
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let isElevatorDrag = false;

  // Mouse move - update ghost preview AND tooltip
  canvas.addEventListener('mousemove', (e: MouseEvent) => {
    const transform = camera.getTransform();
    
    if (isDragging && !isElevatorDrag) {
      // Hide tooltip while dragging
      buildingTooltip.hide();
      return;
    }
    
    // Update ghost (with drag flag for elevator placement)
    placer.updateGhost(
      e.offsetX,
      e.offsetY,
      transform.x,
      transform.y,
      transform.scale,
      isElevatorDrag
    );

    // Update tooltip - check what's under the mouse
    // Only show tooltip when NOT placing buildings (no ghost preview)
    if (!placer.hasGhost()) {
      const elevatorSystem = game.getElevatorSystem();
      const building = renderer.findBuildingAtPosition(e.offsetX, e.offsetY, tower);
      const elevator = renderer.findElevatorAtPosition(e.offsetX, e.offsetY, elevatorSystem.getShafts());

      if (building) {
        buildingTooltip.show({
          building,
          position: { x: e.clientX, y: e.clientY }
        });
      } else if (elevator) {
        buildingTooltip.show({
          elevator,
          position: { x: e.clientX, y: e.clientY }
        });
      } else {
        buildingTooltip.hide();
      }
    } else {
      buildingTooltip.hide();
    }
  });

  // Mouse down - track potential drag
  canvas.addEventListener('mousedown', (e: MouseEvent) => {
    dragStartX = e.offsetX;
    dragStartY = e.offsetY;
    isDragging = false;
    
    // If elevator is selected, start drag placement
    if (placer.getSelectedType() === 'elevator') {
      const transform = camera.getTransform();
      placer.startElevatorDrag(e.offsetX, e.offsetY, transform.x, transform.y, transform.scale);
      isElevatorDrag = true;
    } else {
      isElevatorDrag = false;
    }
  });

  // Mouse move while down - detect drag
  canvas.addEventListener('mousemove', (e: MouseEvent) => {
    if (e.buttons === 1) {
      const dx = Math.abs(e.offsetX - dragStartX);
      const dy = Math.abs(e.offsetY - dragStartY);
      if (dx > 5 || dy > 5) {
        isDragging = true;
      }
    }
  });

  // Mouse up - place building or elevator
  canvas.addEventListener('mouseup', (e: MouseEvent) => {
    if (e.button === 0) {
      if (isElevatorDrag) {
        // End elevator drag placement
        const placed = placer.endElevatorDrag();
        if (placed) {
          menu.setFunds(tower.funds);
          
          // Play placement sound
          getSoundManager().playBuildingPlaced();
        }
        isElevatorDrag = false;
      } else if (!isDragging) {
        // Place regular building
        const building = placer.placeBuilding();
        if (building) {
          towerManager.addBuilding(building);
          menu.setFunds(tower.funds);
          
          // Play placement sound
          getSoundManager().playBuildingPlaced();
          
          // Workers will spawn naturally during morning rush (7:30-9:00 AM)
          // No instant spawning - makes rush hours more visible!
        }
      }
    }
    isDragging = false;
    isElevatorDrag = false;
  });

  // Connect elevator placement callback
  placer.setElevatorPlacedCallback((tile, minFloor, maxFloor) => {
    const elevatorSystem = game.getElevatorSystem();
    elevatorSystem.createStandardShaft(tile, minFloor, maxFloor);
    console.log(`Created elevator shaft at tile ${tile}, floors ${minFloor}-${maxFloor}`);
  });
  
  // ✅ NEW: Connect elevator overlap checking callback
  placer.setElevatorOverlapCallback((tile, minFloor, maxFloor) => {
    const elevatorSystem = game.getElevatorSystem();
    const shafts = elevatorSystem.getShafts();
    
    // Check if new shaft overlaps with any existing shaft
    for (const shaft of shafts) {
      // Same tile?
      if (shaft.tileX !== tile) continue;
      
      // Check floor range overlap
      const overlapStart = Math.max(minFloor, shaft.minFloor);
      const overlapEnd = Math.min(maxFloor, shaft.maxFloor);
      
      if (overlapStart <= overlapEnd) {
        // Overlapping range found
        return true;
      }
    }
    
    // No overlaps
    return false;
  });
  
  // Connect elevator demolish callback
  placer.setElevatorDemolishedCallback((tile, floor) => {
    const elevatorSystem = game.getElevatorSystem();
    const shaft = elevatorSystem.findShaftAtPosition(tile, floor);
    
    if (!shaft) {
      return { success: false, refund: 0 };
    }
    
    // Calculate refund (50% of original cost)
    const floorCount = shaft.maxFloor - shaft.minFloor + 1;
    const originalCost = 200000 + (floorCount - 1) * 80000; // Base $200K + $80K per extra floor
    const refund = Math.floor(originalCost * 0.5);
    
    // Remove the shaft
    elevatorSystem.removeShaft(shaft.id);
    console.log(`Demolished elevator shaft at tile ${tile} (${floorCount} floors) - Refunded $${refund.toLocaleString()}`);
    
    // Play demolish sound
    getSoundManager().playDemolish();
    
    return { success: true, refund };
  });

  // Start the game
  game.start();

  // Update funds and star rating display periodically
  setInterval(() => {
    menu.setFunds(tower.funds);
    menu.setStarRating(tower.starRating);
  }, 1000);

  // Log success
  console.log('========================================');
  console.log('🏢 OpenTower v0.3.0 - MAJOR UPDATE!');
  console.log('========================================');
  console.log('✅ People Simulation - Workers move and get stressed!');
  console.log('✅ Elevator System - LOOK algorithm working!');
  console.log('✅ Income Generation - Offices earn money!');
  console.log('✅ Tower Pulse - Real-time health dashboard!');
  console.log('');
  console.log('📝 How to play:');
  console.log('  1. Place offices (they cost money)');
  console.log('  2. Workers spawn automatically');
  console.log('  3. Add elevators with the green button');
  console.log('  4. Watch Tower Pulse (top-right) for metrics');
  console.log('  5. Buildings earn income every quarter!');
  console.log('');
  console.log('🎮 Controls:');
  console.log('  - Click to place buildings');
  console.log('  - Drag to pan, scroll to zoom');
  console.log('  - 1-9: Quick-select buildings');
  console.log('  - 0-4: Speed control');
  console.log('  - Ctrl+D: Toggle debug');
  console.log('');
  console.log('Use window.game for debugging');
  console.log('========================================');
  
  // Add control buttons
  // addSpawnButton(game); // Removed - workers now spawn during morning rush (7:30 AM)
  addDemolishButton(placer, menu);
  addSaveLoadButtons(game, menu);
  // Elevator button removed - now available in building menu!
  
  // Add Tower Pulse widget
  const towerPulse = new TowerPulse();
  updateTowerPulse(game, towerPulse);

  // Add Financial Report Modal
  const financialReport = new FinancialReportModal();
  addFinancialReportButton(game, financialReport);

  // Add Building Tooltip
  const buildingTooltip = new BuildingTooltip();
  buildingTooltip.setEvaluationSystem(game.getEvaluationSystem());

  // Add tutorial overlay
  const tutorial = new TutorialOverlay();
  
  // Show tutorial on first launch
  if (!TutorialOverlay.hasCompletedTutorial()) {
    tutorial.show();
  }

  // Add help button to reopen tutorial
  addHelpButton(tutorial);

  // Add star rating notification
  const starNotification = new StarRatingNotification();
  
  // Listen for star rating changes
  getEventBus().on('STAR_CHANGE', (event: any) => {
    starNotification.show(event.oldRating, event.newRating);
  });

  // Add random event notification
  const eventNotification = new RandomEventNotification();
  
  // Listen for random events
  getEventBus().on('RANDOM_EVENT', (event: any) => {
    eventNotification.show(event.data.event);
  });

  // Add Game Over Modal
  const gameOverModal = new GameOverModal();
  
  // Listen for game over (bankruptcy)
  getEventBus().on('GAME_OVER', (event: any) => {
    const tower = game.getTowerManager().getTower();
    const economicSystem = game.getEconomicSystem();
    const allReports = economicSystem.getAllReports();
    
    // Calculate totals
    const totalIncome = allReports.reduce((sum, r) => sum + r.income, 0);
    const totalExpenses = allReports.reduce((sum, r) => sum + r.maintenance, 0);
    
    // Play bankruptcy sound
    getSoundManager().playWarning();
    
    gameOverModal.show({
      reason: 'bankruptcy',
      finalFunds: tower.funds,
      finalPopulation: tower.population,
      finalStarRating: tower.starRating,
      daysPlayed: game.getOperatingCostSystem().serialize().dayNumber || 0,
      buildingsBuilt: Object.keys(tower.buildingsById).length,
      totalIncome,
      totalExpenses,
    });
    
    // Pause game
    game.pause();
  });

  // Listen for TOWER status achievement (victory!)
  getEventBus().on('TOWER_STATUS_ACHIEVED', (_event: any) => {
    const tower = game.getTowerManager().getTower();
    const economicSystem = game.getEconomicSystem();
    const allReports = economicSystem.getAllReports();
    
    const totalIncome = allReports.reduce((sum, r) => sum + r.income, 0);
    const totalExpenses = allReports.reduce((sum, r) => sum + r.maintenance, 0);
    
    // Play victory fanfare
    getSoundManager().playStarRatingUp();
    
    gameOverModal.show({
      reason: 'victory',
      finalFunds: tower.funds,
      finalPopulation: tower.population,
      finalStarRating: tower.starRating,
      daysPlayed: game.getOperatingCostSystem().serialize().dayNumber || 0,
      buildingsBuilt: Object.keys(tower.buildingsById).length,
      totalIncome,
      totalExpenses,
    });
    
    // Don't pause - let player continue
  });

  // Handle restart
  gameOverModal.onRestart(() => {
    // Reload page to start fresh
    window.location.reload();
  });

  // Handle continue (victory only)
  gameOverModal.onContinue(() => {
    // Just close modal and continue playing
    game.resume();
  });

  // Listen for building demolitions
  getEventBus().on('BUILDING_DEMOLISHED', (event: any) => {
    const { buildingId, refund } = event.data;
    towerManager.removeBuilding(buildingId);
    menu.setFunds(tower.funds);
    
    // Play demolish sound
    getSoundManager().playDemolish();
    
    console.log(`Building ${buildingId} removed, refunded $${refund.toLocaleString()}`);
  });

  // Add keyboard controls for speed + debug
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case '0':
        game.setSpeed(0);
        console.log('Game paused');
        break;
      case 'Escape':
        // Could add: cancel placement mode
        break;
      case 'd':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (renderer) {
            const debugEnabled = !renderer['debugMode'];
            renderer.setDebugMode(debugEnabled);
            console.log(`Debug mode: ${debugEnabled ? 'ON' : 'OFF'}`);
          }
        }
        break;
      case '?':
      case '/':
        // Show tutorial
        e.preventDefault();
        tutorial.show();
        break;
      case 'm':
      case 'M':
        // Toggle sound
        e.preventDefault();
        getSoundManager().toggle();
        break;
    }
    
    // Speed keys only when not pressing number for building selection
    if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
      if (e.key === '`') {
        game.setSpeed(1);
        console.log('Speed: Normal (1x)');
      }
    }
  });

  // Add HUD overlay
  addHUD(game);
}

/**
 * Add a simple HUD overlay
 */
function addHUD(game: Game) {
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
    const buildingCount = Object.keys(tower.buildingsById).length;
    const popSystem = game.getPopulationSystem();
    const people = popSystem.getPeople();
    
    // Count people by stress level
    const stressCounts = {
      normal: people.filter(p => p.getStressLevel() === 'normal').length,
      stressed: people.filter(p => p.getStressLevel() === 'stressed').length,
      critical: people.filter(p => p.getStressLevel() === 'critical').length,
    };

    const economicSystem = game.getEconomicSystem();
    const cashFlow = economicSystem.getCashFlowSummary();
    const nextQuarterTicks = economicSystem.getTicksUntilNextQuarter(game['currentTick'] || 0);
    const nextQuarterSec = Math.floor(nextQuarterTicks / 60);
    
    // Get time of day info
    const timeOfDaySystem = game.getTimeOfDaySystem();
    const timeOfDayState = timeOfDaySystem.getState();
    
    // Format money with K/M suffixes for readability
    const formatMoney = (amount: number): string => {
      if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(2)}M`;
      } else if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(1)}K`;
      }
      return `$${amount.toLocaleString()}`;
    };
    
    hud.innerHTML = `
      <div><strong>OpenTower</strong> v0.3.0</div>
      <div style="font-size: 14px; font-weight: bold; margin-top: 4px;">${game.getFormattedTime()} - ${timeOfDayState.label}</div>
      <div style="font-size: 11px;">${game.getFormattedDate()}</div>
      <div style="margin-top: 4px;">Speed: ${speedText}</div>
      <div style="font-size: 16px; font-weight: bold; margin-top: 6px; color: #FFD700;">Rating: ${'⭐'.repeat(tower.starRating)}</div>
      <div style="margin-top: 4px;">Funds: ${formatMoney(tower.funds)}</div>
      <div>Buildings: ${buildingCount}</div>
      <div>Population: ${tower.population}</div>
      <div style="color: #1c1c1c; background: white; display: inline-block; padding: 0 4px; margin-right: 4px;">⬤ ${stressCounts.normal}</div>
      <div style="color: #ff69b4; display: inline-block; margin-right: 4px;">⬤ ${stressCounts.stressed}</div>
      <div style="color: #dc143c; display: inline-block;">⬤ ${stressCounts.critical}</div>
      <div style="margin-top: 5px; font-size: 11px; opacity: 0.7;">
        Quarter: ${economicSystem.getQuarterNumber()} (Next in ${nextQuarterSec}s)<br>
        Cash Flow: ${formatMoney(cashFlow.incomePerDay)}/day<br>
        FPS: ${game.getFPS()}
      </div>
    `;
  }, 100);
}

/**
 * Add spawn button for testing
 */
function addSpawnButton(game: Game) {
  const button = document.createElement('button');
  button.textContent = '+ Spawn Workers';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    padding: 10px 15px;
    background: #4169e1;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-family: monospace;
    font-size: 14px;
    z-index: 1000;
  `;
  
  button.addEventListener('click', () => {
    const tower = game.getTowerManager().getTower();
    const popSystem = game.getPopulationSystem();
    popSystem.spawnWorkersForBuildings(tower);
    console.log('Spawned workers for all offices!');
  });
  
  button.addEventListener('mouseover', () => {
    button.style.background = '#5179f1';
  });
  
  button.addEventListener('mouseout', () => {
    button.style.background = '#4169e1';
  });
  
  document.body.appendChild(button);
}

/**
 * Add demolish button for removing buildings
 */
function addDemolishButton(placer: BuildingPlacer, menu: BuildingMenu) {
  const button = document.createElement('button');
  button.textContent = '🗑️ Demolish';
  button.style.cssText = `
    position: fixed;
    bottom: 70px;
    left: 20px;
    padding: 10px 15px;
    background: #dc2626;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-family: monospace;
    font-size: 14px;
    z-index: 1000;
  `;
  
  let demolishActive = false;
  
  button.addEventListener('click', () => {
    demolishActive = !demolishActive;
    placer.setDemolishMode(demolishActive);
    
    if (demolishActive) {
      button.style.background = '#991b1b';
      button.textContent = '🗑️ Cancel Demolish';
      // Clear building selection from menu
      menu.clearSelection();
    } else {
      button.style.background = '#dc2626';
      button.textContent = '🗑️ Demolish';
    }
    
    console.log(`Demolish mode: ${demolishActive ? 'ON' : 'OFF'}`);
  });
  
  button.addEventListener('mouseover', () => {
    if (!demolishActive) {
      button.style.background = '#b91c1c';
    }
  });
  
  button.addEventListener('mouseout', () => {
    if (!demolishActive) {
      button.style.background = '#dc2626';
    }
  });
  
  // Add keyboard shortcut (D key)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'd' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      button.click();
    }
  });
  
  document.body.appendChild(button);
}

// Elevator button removed - elevator is now a placeable item in the building menu!

/**
 * Add save/load buttons
 */
function addSaveLoadButtons(game: Game, menu: BuildingMenu) {
  const saveLoadManager = game.getSaveLoadManager();
  if (!saveLoadManager) {
    console.warn('Save/Load manager not initialized');
    return;
  }

  // Save button
  const saveButton = document.createElement('button');
  saveButton.textContent = '💾 Save';
  saveButton.style.cssText = `
    position: fixed;
    bottom: 120px;
    left: 20px;
    padding: 10px 15px;
    background: #16a34a;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-family: monospace;
    font-size: 14px;
    z-index: 1000;
  `;
  
  saveButton.addEventListener('click', () => {
    const success = saveLoadManager.save();
    if (success) {
      saveButton.textContent = '💾 Saved!';
      setTimeout(() => {
        saveButton.textContent = '💾 Save';
      }, 2000);
    } else {
      saveButton.textContent = '💾 Error!';
      setTimeout(() => {
        saveButton.textContent = '💾 Save';
      }, 2000);
    }
  });
  
  saveButton.addEventListener('mouseover', () => {
    saveButton.style.background = '#15803d';
  });
  
  saveButton.addEventListener('mouseout', () => {
    saveButton.style.background = '#16a34a';
  });
  
  document.body.appendChild(saveButton);

  // Load button
  const loadButton = document.createElement('button');
  loadButton.textContent = '📂 Load';
  loadButton.style.cssText = `
    position: fixed;
    bottom: 170px;
    left: 20px;
    padding: 10px 15px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-family: monospace;
    font-size: 14px;
    z-index: 1000;
  `;
  
  loadButton.addEventListener('click', () => {
    if (!saveLoadManager.hasSave()) {
      loadButton.textContent = '📂 No Save!';
      setTimeout(() => {
        loadButton.textContent = '📂 Load';
      }, 2000);
      return;
    }

    const success = saveLoadManager.load();
    if (success) {
      loadButton.textContent = '📂 Loaded!';
      
      // Refresh UI
      const tower = game.getTowerManager().getTower();
      menu.setFunds(tower.funds);
      menu.setStarRating(tower.starRating);
      
      // Force a full re-render after load
      // The game loop will handle ongoing rendering
      
      setTimeout(() => {
        loadButton.textContent = '📂 Load';
      }, 2000);
    } else {
      loadButton.textContent = '📂 Error!';
      setTimeout(() => {
        loadButton.textContent = '📂 Load';
      }, 2000);
    }
  });
  
  loadButton.addEventListener('mouseover', () => {
    loadButton.style.background = '#1d4ed8';
  });
  
  loadButton.addEventListener('mouseout', () => {
    loadButton.style.background = '#2563eb';
  });
  
  document.body.appendChild(loadButton);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl+S to save
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      saveButton.click();
    }
    // Ctrl+L to load
    if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      loadButton.click();
    }
  });
}

/**
 * Add financial report button and wire up updates
 */
function addFinancialReportButton(game: Game, financialReport: FinancialReportModal) {
  const button = document.createElement('button');
  button.textContent = '💰 Finances';
  button.title = 'View Financial Report (F)';
  button.style.cssText = `
    position: fixed;
    bottom: 220px;
    left: 20px;
    padding: 10px 15px;
    background: #fbbf24;
    color: #1a1a1a;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-family: monospace;
    font-size: 14px;
    font-weight: bold;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
  `;
  
  button.addEventListener('click', () => {
    financialReport.toggle();
    
    // Update with current data when opened
    if (financialReport) {
      const tower = game.getTowerManager().getTower();
      financialReport.update(
        tower,
        game.getEconomicSystem(),
        game.getHotelSystem(),
        game.getResidentSystem(),
        game.getOperatingCostSystem()
      );
    }
  });
  
  button.addEventListener('mouseover', () => {
    button.style.background = '#f59e0b';
    button.style.transform = 'scale(1.05)';
    button.style.transition = 'all 0.2s';
  });
  
  button.addEventListener('mouseout', () => {
    button.style.background = '#fbbf24';
    button.style.transform = 'scale(1)';
  });
  
  // Keyboard shortcut (F key)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      button.click();
    }
  });
  
  document.body.appendChild(button);
}

/**
 * Add help button to reopen tutorial
 */
function addHelpButton(tutorial: TutorialOverlay) {
  const button = document.createElement('button');
  button.textContent = '?';
  button.title = 'Show Tutorial';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    padding: 0;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-family: monospace;
    font-size: 24px;
    font-weight: bold;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  button.addEventListener('click', () => {
    tutorial.show();
  });
  
  button.addEventListener('mouseover', () => {
    button.style.background = '#2563eb';
    button.style.transform = 'scale(1.1)';
    button.style.transition = 'all 0.2s';
  });
  
  button.addEventListener('mouseout', () => {
    button.style.background = '#3b82f6';
    button.style.transform = 'scale(1)';
  });
  
  document.body.appendChild(button);
}

/**
 * Update Tower Pulse widget
 */
function updateTowerPulse(game: Game, towerPulse: TowerPulse) {
  setInterval(() => {
    const tower = game.getTowerManager().getTower();
    const popSystem = game.getPopulationSystem();
    const elevatorSystem = game.getElevatorSystem();
    const economicSystem = game.getEconomicSystem();
    const evaluationSystem = game.getEvaluationSystem();
    const operatingCostSystem = game.getOperatingCostSystem();
    
    const people = popSystem.getPeople();
    
    // Calculate mood (% of people who are NOT stressed/critical)
    const normalPeople = people.filter(p => p.getStressLevel() === 'normal').length;
    const moodPercent = people.length > 0 ? (normalPeople / people.length) * 100 : 100;
    
    // Calculate elevator utilization
    const elevators = elevatorSystem.getAllCars();
    let totalPassengers = 0;
    let totalCapacity = 0;
    for (const car of elevators) {
      totalPassengers += car.passengerIds.length;
      totalCapacity += car.maxCapacity;
    }
    const elevatorUtilization = totalCapacity > 0 ? (totalPassengers / totalCapacity) * 100 : 0;
    
    // Get cash flow
    const cashFlow = economicSystem.getCashFlowSummary();
    
    // Get daily expenses
    const expenseReport = operatingCostSystem.getLatestReport();
    const dailyExpenses = expenseReport?.totalCosts ?? 0;
    
    // Get evaluation counts (blue/yellow/red buildings)
    const evaluationCounts = evaluationSystem.getEvaluationCounts(tower);
    
    // Get bankruptcy state
    const bankruptcyState = operatingCostSystem.getBankruptcyState(tower);
    
    // Calculate max population (6 per office for now)
    const buildings = Object.values(tower.buildingsById);
    const offices = buildings.filter(b => b.type === 'office');
    const maxPopulation = offices.length * 6;
    
    // Get average wait time
    const averageWaitTime = popSystem.getAverageWaitTime();
    
    // Get elevator stats (give-up count)
    const elevatorStats = elevatorSystem.getStats();
    const giveUpCount = elevatorStats.stressedPassengers;
    
    // Add alerts (rush hour, wait times, etc.)
    const alerts: string[] = [];
    if (moodPercent < 50) {
      alerts.push('LOW MORALE - Add elevators!');
    }
    if (elevatorUtilization > 80) {
      alerts.push('ELEVATORS OVERLOADED');
    }
    if (averageWaitTime > 60) {
      alerts.push('LONG WAIT TIMES - Add more elevators!');
    }
    if (giveUpCount >= 10) {
      alerts.push(`${giveUpCount} PEOPLE GAVE UP WAITING!`);
    }
    if (evaluationCounts.red > 3) {
      alerts.push(`${evaluationCounts.red} BUILDINGS FAILING`);
    }
    if (bankruptcyState.inDebt && !bankruptcyState.isBankrupt) {
      alerts.push(`DEBT: ${bankruptcyState.daysToBankruptcy} days left`);
    }
    
    towerPulse.update({
      population: tower.population,
      maxPopulation: maxPopulation,
      moodPercent,
      elevatorUtilization,
      averageWaitTime,
      giveUpCount,
      cashFlowPerDay: cashFlow.incomePerDay,
      dailyExpenses,
      evaluationCounts,
      inDebt: bankruptcyState.inDebt,
      debtAmount: bankruptcyState.debtAmount,
      daysToBankruptcy: bankruptcyState.daysToBankruptcy,
      alerts,
    });
  }, 500); // Update twice per second
}

main().catch(console.error);
