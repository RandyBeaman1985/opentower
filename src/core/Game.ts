/**
 * Main Game class - Central game loop and state management
 *
 * Architecture based on expert reviews:
 * - Decoupled simulation (100ms ticks) from rendering (60fps)
 * - Fixed timestep with accumulator pattern
 * - Phase-based event processing
 *
 * @module core/Game
 */

import * as PIXI from 'pixi.js';
import { Application } from 'pixi.js';
import type { GameSpeed } from '@/interfaces';
import { GamePhase } from '@/interfaces';
import { BUILDING_CONFIGS } from '@/interfaces/buildings';
import { getEventBus } from './EventBus';
import { TowerManager } from '@simulation/Tower';
import { TowerRenderer } from '@rendering/TowerRenderer';
import { PopulationSystem } from '@simulation/PopulationSystem';
import { ElevatorSystem } from '@simulation/ElevatorSystem';
import { EconomicSystem } from '@simulation/EconomicSystem';
import { SaveLoadManager } from './SaveLoadManager';
import { TimeSystem } from '@simulation/TimeSystem';
import { HotelSystem } from '@simulation/HotelSystem';
import { ResidentSystem } from '@simulation/ResidentSystem';
import { RandomEventSystem } from '@simulation/RandomEventSystem';
import { EvaluationSystem } from '@simulation/EvaluationSystem';
import { OperatingCostSystem } from '@simulation/OperatingCostSystem';
import { RushHourSystem } from '@simulation/RushHourSystem';
import { ParticleEffect } from '@rendering/ParticleEffect';
import { FloatingTextSystem } from '@rendering/FloatingText';
import { GameFeelManager } from './GameFeelManager';
import { GameHUD } from '@rendering/GameHUD';
import { Person } from '@/entities/Person';

export interface GameConfig {
  /** Width of the game canvas */
  width?: number;
  /** Height of the game canvas */
  height?: number;
  /** Initial game speed */
  initialSpeed?: GameSpeed;
  /** Container element ID or HTMLElement */
  container?: string | HTMLElement;
}

/**
 * Game state enum
 */
export enum GameState {
  INITIALIZING = 'INITIALIZING',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
}

/**
 * Main Game class
 *
 * Usage:
 * ```typescript
 * const game = new Game({ container: 'game-container' });
 * await game.init();
 * game.start();
 * ```
 */
export class Game {
  private config: Required<GameConfig>;
  private app: Application | null = null;
  private timeSystem: TimeSystem;
  private towerManager: TowerManager;
  private populationSystem: PopulationSystem;
  private elevatorSystem: ElevatorSystem;
  private economicSystem: EconomicSystem;
  private hotelSystem: HotelSystem;
  private residentSystem: ResidentSystem;
  private randomEventSystem: RandomEventSystem;
  private evaluationSystem: EvaluationSystem;
  private operatingCostSystem: OperatingCostSystem;
  private rushHourSystem: RushHourSystem;
  private saveLoadManager: SaveLoadManager | null = null;
  private towerRenderer: TowerRenderer | null = null;
  private particleEffect: ParticleEffect | null = null;
  private floatingText: FloatingTextSystem | null = null;
  private gameFeelManager: GameFeelManager | null = null;
  private gameHUD: GameHUD | null = null;
  private state: GameState = GameState.INITIALIZING;
  private frameId: number | null = null;
  private currentTick: number = 0;
  private previousStarRating: number = 1;

  // Performance tracking
  private lastFrameTime = 0;
  private frameCount = 0;
  private fps = 0;

  constructor(config: GameConfig = {}) {
    this.config = {
      width: config.width ?? 1280,
      height: config.height ?? 720,
      initialSpeed: config.initialSpeed ?? 1,
      container: config.container ?? 'game-container',
    };

    this.timeSystem = new TimeSystem();
    this.timeSystem.setCustomSpeed(this.config.initialSpeed);
    this.towerManager = new TowerManager();
    this.populationSystem = new PopulationSystem();
    this.elevatorSystem = new ElevatorSystem();
    this.economicSystem = new EconomicSystem();
    this.hotelSystem = new HotelSystem();
    this.residentSystem = new ResidentSystem();
    this.randomEventSystem = new RandomEventSystem();
    this.evaluationSystem = new EvaluationSystem();
    this.operatingCostSystem = new OperatingCostSystem();
    this.rushHourSystem = new RushHourSystem();
  }

  /**
   * Initialize the game
   */
  async init(): Promise<void> {
    // Create PixiJS application
    this.app = new Application();

    await this.app.init({
      width: this.config.width,
      height: this.config.height,
      backgroundColor: 0x87ceeb, // Sky blue
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
    });

    // Add canvas to container
    const container =
      typeof this.config.container === 'string'
        ? document.getElementById(this.config.container)
        : this.config.container;

    if (container) {
      container.appendChild(this.app.canvas);
    }

    // Initialize subsystems
    await this.initializeSubsystems();

    this.state = GameState.PAUSED;
  }

  /**
   * Initialize game subsystems
   */
  private async initializeSubsystems(): Promise<void> {
    if (!this.app) {
      throw new Error('Application not initialized');
    }

    // Initialize tower renderer
    this.towerRenderer = new TowerRenderer(this.app);

    // Enable debug mode in development
    if (import.meta.env.DEV) {
      this.towerRenderer.setDebugMode(true);
    }

    // Initialize game feel systems (juice & polish!)
    const effectsLayer = this.towerRenderer.getWorldContainer();
    const uiLayer = new PIXI.Container();
    this.app.stage.addChild(uiLayer);
    
    this.particleEffect = new ParticleEffect(effectsLayer);
    this.floatingText = new FloatingTextSystem(uiLayer);
    this.gameFeelManager = new GameFeelManager(this.particleEffect, this.floatingText);
    this.gameHUD = new GameHUD(uiLayer);

    // Initialize save/load manager
    this.saveLoadManager = new SaveLoadManager(
      this.towerManager,
      this.populationSystem,
      this.elevatorSystem,
      this.economicSystem,
      this.timeSystem // 🆕 BUG-020 FIX: Pass timeSystem for game speed saving
    );
    
    // 🆕 v0.12.0: Wire up resident system callbacks for spawning/despawning
    this.residentSystem.setCallbacks(
      (resident, tower) => this.spawnResident(resident, tower),
      (personId) => this.despawnPerson(personId)
    );
    
    // Setup event listeners for game feel
    this.setupGameFeelEvents();
  }

  /**
   * 🆕 v0.12.0: Spawn a resident person at lobby
   * Called by ResidentSystem during evening commute
   */
  private spawnResident(resident: import('@simulation/ResidentSystem').Resident, tower: import('@/interfaces').Tower): import('@/entities/Person').Person | null {
    // Find lobby building
    const lobby = Object.values(tower.buildingsById).find(b => b && b.type === 'lobby');
    if (!lobby) {
      console.warn('⚠️ Cannot spawn resident: No lobby found!');
      return null;
    }

    // Spawn at lobby center
    const lobbyTile = lobby.position.startTile + Math.floor(lobby.width / 2);

    // Create person entity
    const person = new Person({
      type: 'resident',
      floor: lobby.position.floor,
      tile: lobbyTile,
      homeBuildingId: resident.condoId,
      schedule: {
        personType: 'resident',
        events: [
          { hour: 8, minute: 0, action: 'leave', weekdayOnly: true }, // Leave for work
          { hour: 18, minute: 0, action: 'arrive', weekdayOnly: true }, // Return home
        ],
      },
      name: `Resident-${resident.id.split('-')[1]}`,
    });

    // Add to population system
    const added = this.populationSystem.addPerson(person);
    
    if (!added) {
      console.warn('⚠️ Failed to add resident to population system');
      return null;
    }

    console.log(`✨ Spawned resident ${person.name} at lobby (going to condo ${resident.condoId})`);
    return person;
  }

  /**
   * 🆕 v0.12.0: Despawn a person from the tower
   * Called when residents leave for work or reach their destination
   */
  private despawnPerson(personId: string): void {
    this.populationSystem.removePerson(personId);
    
    // Notify resident system that person was despawned
    this.residentSystem.onPersonDespawned(personId);
    
    console.log(`👋 Despawned person ${personId}`);
  }

  /**
   * Setup game feel event listeners
   */
  private setupGameFeelEvents(): void {
    const eventBus = getEventBus();
    
    // Listen for building placement
    eventBus.on('BUILDING_PLACED', (event) => {
      if (this.gameFeelManager && event.type === 'BUILDING_PLACED') {
        const tower = this.towerManager.getTower();
        const building = tower.buildingsById[event.buildingId];
        if (building) {
          this.gameFeelManager.onBuildingPlaced(building);
        }
      }
    });
    
    // Listen for building demolition
    eventBus.on('BUILDING_DEMOLISHED', (event) => {
      if (this.gameFeelManager && event.type === 'BUILDING_DEMOLISHED') {
        const tower = this.towerManager.getTower();
        const building = tower.buildingsById[event.buildingId];
        if (building) {
          this.gameFeelManager.onBuildingDemolished(building);
        }
      }
    });
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.state === GameState.RUNNING) return;

    this.state = GameState.RUNNING;
    this.timeSystem.start();
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    
    // Initialize previous star rating
    this.previousStarRating = this.towerManager.getTower().starRating;

    this.gameLoop(this.lastFrameTime);
  }

  /**
   * Pause the game
   */
  pause(): void {
    if (this.state !== GameState.RUNNING) return;

    this.state = GameState.PAUSED;
    this.timeSystem.pause();

    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  /**
   * Resume the game
   */
  resume(): void {
    if (this.state !== GameState.PAUSED) return;

    this.state = GameState.RUNNING;
    this.timeSystem.resume();
    this.lastFrameTime = performance.now();

    this.gameLoop(this.lastFrameTime);
  }

  /**
   * Stop the game completely
   */
  stop(): void {
    this.state = GameState.STOPPED;
    this.timeSystem.stop();

    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  /**
   * Main game loop
   */
  private gameLoop = (currentTime: number): void => {
    if (this.state !== GameState.RUNNING) return;

    // Schedule next frame
    this.frameId = requestAnimationFrame(this.gameLoop);

    // Update FPS counter
    this.updateFPS(currentTime);

    // Process pre-update events
    getEventBus().processPhase(GamePhase.PRE_UPDATE);

    // Get number of simulation ticks to process
    const tickCount = this.timeSystem.update(currentTime);

    // Run simulation ticks
    for (let i = 0; i < tickCount; i++) {
      this.simulationTick();
    }

    // Process simulation events
    getEventBus().processPhase(GamePhase.SIMULATION);

    // Post-update processing
    this.postUpdate();
    getEventBus().processPhase(GamePhase.POST_UPDATE);

    // Render
    const alpha = this.timeSystem.getInterpolationAlpha();
    this.render(alpha);
    getEventBus().processPhase(GamePhase.RENDER);

    // Post-render (save, analytics, etc.)
    getEventBus().processPhase(GamePhase.POST_RENDER);
  };

  /**
   * Run one simulation tick
   */
  private simulationTick(): void {
    this.currentTick++;

    const tower = this.towerManager.getTower();
    const clock = this.timeSystem.getClock();
    const gameSpeed = clock.speed;

    // Get people map for cross-system communication
    const people = this.populationSystem.getPeople();
    const peopleMap = new Map(people.map(p => [p.id, p]));

    // Update elevators (pass peopleMap for give-up logic)
    this.elevatorSystem.update(tower, gameSpeed, peopleMap);

    // Update rush hour system (spawn workers at lobby during morning rush, send them home at evening)
    const newWorkers = this.rushHourSystem.update(tower, clock, peopleMap, this.elevatorSystem);
    
    // Add newly spawned workers to PopulationSystem
    for (const worker of newWorkers) {
      this.populationSystem.addPerson(worker);
    }

    // Check for workers exiting at lobby during evening rush
    const exitingWorkerIds = this.rushHourSystem.checkForExitingWorkers(peopleMap);
    for (const workerId of exitingWorkerIds) {
      this.rushHourSystem.removeWorkerAtExit(workerId, peopleMap);
    }

    // Update population (now with elevator integration and food building tracking)
    this.populationSystem.update(tower, clock, this.currentTick, this.elevatorSystem, this.economicSystem);

    // Update tower population count
    this.towerManager.updatePopulation(this.populationSystem.getPopulation());

    // Update hotel system (check-ins, check-outs, room income)
    this.hotelSystem.update(tower, clock, this.currentTick);

    // Update resident system (condo residents, work commutes, rent)
    // 🆕 v0.12.0: Now includes gameDay for weekday/weekend detection
    this.residentSystem.update(tower, peopleMap, clock.gameHour, clock.gameDay);

    // Update random events (VIP visitors, maintenance, etc.)
    this.randomEventSystem.update(tower, this.currentTick);

    // Update building evaluations (satisfaction ratings based on wait times, services, etc.)
    this.evaluationSystem.update(tower, people, this.currentTick);

    // Update operating costs (daily expenses, bankruptcy check)
    this.operatingCostSystem.update(tower, this.currentTick);

    // Update economics (quarterly collection, now includes hotel income and rent)
    const hotelIncome = this.hotelSystem.getQuarterlyIncome();
    const rentIncome = this.residentSystem.getQuarterlyRentIncome();
    this.economicSystem.update(tower, clock, this.currentTick, hotelIncome + rentIncome);

    // Quarterly updates (every 900 ticks = 90 game seconds = 1 game quarter-hour)
    if (this.currentTick % 900 === 0) {
      // Update star rating (quarterly checks like SimTower)
      this.updateStarRating();
      
      // Process evaluation consequences (tenant departures, buybacks)
      this.processEvaluationConsequences();
    }
  }

  /**
   * Process evaluation consequences (quarterly)
   * - Offices: Low evaluation → tenant leaves
   * - Condos: Low evaluation → forced buyback
   * - Hotels: Evaluation affects occupancy
   */
  private processEvaluationConsequences(): void {
    const tower = this.towerManager.getTower();
    
    // Use the comprehensive tenant departure logic from EconomySystem
    this.economicSystem.checkTenantDepartures(tower, this.evaluationSystem);
    
    // CONDOS: Also check for forced buyback (severe cases)
    const buildings = Object.values(tower.buildingsById);
    for (const building of buildings) {
      const evaluation = this.evaluationSystem.getScore(building.id);
      
      // CONDOS: Red evaluation (<30%) → forced buyback
      if (building.type === 'condo' && evaluation < 30 && building.state === 'active') {
        // Force buyback at purchase price (use actual config cost)
        const buybackCost = BUILDING_CONFIGS[building.type].cost;
        this.towerManager.modifyFunds(-buybackCost);
        building.state = 'vacant';
        building.occupantIds = [];
        
        getEventBus().emitSync({
          type: 'NOTIFICATION',
          title: 'Condo Buyback Required',
          message: `Resident moved out due to terrible conditions. Buyback: -$${buybackCost.toLocaleString()}`,
          severity: 'critical',
        });
        
        console.log(`💸 Forced condo buyback: -$${buybackCost.toLocaleString()} (evaluation: ${Math.round(evaluation)}%)`);
      }

      // HOTELS: Evaluation affects occupancy (handled by HotelSystem)
      // No action needed here
    }
  }

  /**
   * Update star rating based on population, happiness, and profit
   * Called quarterly (every 900 ticks) for performance + realistic progression
   */
  private updateStarRating(): void {
    // Calculate happiness (% of people with normal stress)
    const people = this.populationSystem.getPeople();
    let happyPeople = 0;

    for (const person of people) {
      if (person.getStressLevel() === 'normal') {
        happyPeople++;
      }
    }

    const happinessPercent = people.length > 0 ? (happyPeople / people.length) * 100 : 100;

    // Get daily income from economics
    const cashFlow = this.economicSystem.getCashFlowSummary();
    const dailyIncome = cashFlow.incomePerDay;

    // Update tower star rating
    this.towerManager.updateStarRatingFactors(happinessPercent, dailyIncome);
    
    // Check for star rating increase (CELEBRATION!)
    const currentStars = this.towerManager.getTower().starRating;
    if (currentStars > this.previousStarRating && this.gameFeelManager && this.app) {
      const screenCenterX = this.app.screen.width / 2;
      const screenCenterY = this.app.screen.height / 2;
      this.gameFeelManager.onStarRatingUp(currentStars, screenCenterX, screenCenterY);
      this.previousStarRating = currentStars;
    }
  }

  /**
   * Post-update processing
   */
  private postUpdate(): void {
    // TODO: Post-simulation processing
    // - Collision resolution
    // - State cleanup
    // - Event aggregation
  }

  /**
   * Render the game
   *
   * @param alpha - Interpolation factor (0-1) for smooth rendering
   */
  private render(_alpha: number): void {
    if (!this.towerRenderer) return;

    const tower = this.towerManager.getTower();
    const people = this.populationSystem.getPeople();
    const elevatorShafts = this.elevatorSystem.getShafts();
    const timeOfDayState = this.timeSystem.getTimeOfDayState();
    const aiData = this.populationSystem.getAIData();
    const rushHourState = this.rushHourSystem.getRushHourState(tower.clock);
    const deltaTime = 1 / 60; // Assuming 60fps for camera updates

    this.towerRenderer.render(tower, deltaTime, people, elevatorShafts, timeOfDayState, aiData, rushHourState);
    
    // Update game feel effects (particles, floating text)
    if (this.gameFeelManager) {
      this.gameFeelManager.update();
    }
    
    // Update HUD
    if (this.gameHUD) {
      const clock = this.timeSystem.getClock();
      
      // Calculate day of week (same logic as RushHourSystem)
      const dayOfWeek = clock.gameDay % 7;
      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const dayName = dayNames[dayOfWeek];
      const isWeekend = dayOfWeek >= 5;
      
      // Format time with day name and weekend indicator
      const timeStr = `${clock.gameHour}:${clock.gameMinute.toString().padStart(2, '0')}`;
      const dateStr = isWeekend 
        ? `${dayName} ${timeStr} 🌴 WEEKEND`
        : `${dayName} ${timeStr}`;
      
      // Calculate next star requirement
      const nextStarReq = this.getNextStarRequirement(tower.starRating, tower.population);
      
      this.gameHUD.update(tower, dateStr, tower.starRating, nextStarReq);
    }
  }
  
  /**
   * Get requirements for next star rating
   */
  private getNextStarRequirement(currentStars: number, currentPopulation: number): { current: number; required: number; label: string } | undefined {
    const requirements = [
      { stars: 1, population: 0, label: '1★ Tower' },
      { stars: 2, population: 300, label: '2★ Tower' },
      { stars: 3, population: 1000, label: '3★ Tower' },
      { stars: 4, population: 5000, label: '4★ Tower' },
      { stars: 5, population: 10000, label: '5★ Tower' },
    ];
    
    const nextReq = requirements.find(r => r.stars > currentStars);
    if (nextReq) {
      return {
        current: currentPopulation,
        required: nextReq.population,
        label: `Next: ${nextReq.label}`,
      };
    }
    
    return undefined; // Max stars reached
  }

  /**
   * Update FPS counter
   */
  private updateFPS(currentTime: number): void {
    this.frameCount++;

    if (currentTime - this.lastFrameTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFrameTime = currentTime;
    }
  }

  // --- Public API ---

  /**
   * Get the PixiJS application
   */
  getApp(): Application | null {
    return this.app;
  }

  /**
   * Get the time system
   */
  getTimeSystem(): TimeSystem {
    return this.timeSystem;
  }

  /**
   * Get the clock manager (legacy support)
   * @deprecated Use getTimeSystem() instead
   */
  getClockManager() {
    return this.timeSystem.getClockManager();
  }

  /**
   * Get current game state
   */
  getState(): GameState {
    return this.state;
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.fps;
  }

  /**
   * Set game speed
   */
  setSpeed(speed: GameSpeed): void {
    this.timeSystem.setCustomSpeed(speed);
  }

  /**
   * Get current game speed
   */
  getSpeed(): GameSpeed {
    return this.timeSystem.getSpeed();
  }

  /**
   * Get formatted time string
   */
  getFormattedTime(): string {
    return this.timeSystem.getFormattedTime();
  }

  /**
   * Get formatted date string
   */
  getFormattedDate(): string {
    return this.timeSystem.getFormattedDate();
  }

  /**
   * Get the tower manager
   */
  getTowerManager(): TowerManager {
    return this.towerManager;
  }

  /**
   * Get the tower renderer
   */
  getTowerRenderer(): TowerRenderer | null {
    return this.towerRenderer;
  }

  /**
   * Get the population system
   */
  getPopulationSystem(): PopulationSystem {
    return this.populationSystem;
  }

  /**
   * Get the elevator system
   */
  getElevatorSystem(): ElevatorSystem {
    return this.elevatorSystem;
  }

  /**
   * Get the economic system
   */
  getEconomicSystem(): EconomicSystem {
    return this.economicSystem;
  }

  /**
   * Get the evaluation system
   */
  getEvaluationSystem(): EvaluationSystem {
    return this.evaluationSystem;
  }

  /**
   * Get the operating cost system
   */
  getOperatingCostSystem(): OperatingCostSystem {
    return this.operatingCostSystem;
  }

  /**
   * Get the time of day system (legacy support)
   * @deprecated Use getTimeSystem().getTimeOfDaySystem() instead
   */
  getTimeOfDaySystem() {
    return this.timeSystem.getTimeOfDaySystem();
  }

  /**
   * Get the hotel system
   */
  getHotelSystem(): HotelSystem {
    return this.hotelSystem;
  }

  /**
   * Get the resident system
   */
  getResidentSystem(): ResidentSystem {
    return this.residentSystem;
  }

  /**
   * Get the random event system
   */
  getRandomEventSystem(): RandomEventSystem {
    return this.randomEventSystem;
  }

  /**
   * Get the save/load manager
   */
  getSaveLoadManager(): SaveLoadManager | null {
    return this.saveLoadManager;
  }

  /**
   * Destroy the game and clean up resources
   */
  destroy(): void {
    this.stop();

    // Stop auto-save
    if (this.saveLoadManager) {
      this.saveLoadManager.stopAutoSave();
    }

    if (this.towerRenderer) {
      this.towerRenderer.destroy();
      this.towerRenderer = null;
    }

    if (this.app) {
      this.app.destroy(true);
      this.app = null;
    }

    getEventBus().clear();
  }
}
