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

import { Application } from 'pixi.js';
import type { GameSpeed } from '@/interfaces';
import { GamePhase } from '@/interfaces';
import { ClockManager } from './Clock';
import { getEventBus } from './EventBus';
import { TowerManager } from '@simulation/Tower';
import { TowerRenderer } from '@rendering/TowerRenderer';

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
  private clockManager: ClockManager;
  private towerManager: TowerManager;
  private towerRenderer: TowerRenderer | null = null;
  private state: GameState = GameState.INITIALIZING;
  private frameId: number | null = null;

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

    this.clockManager = new ClockManager();
    this.clockManager.setSpeed(this.config.initialSpeed);
    this.towerManager = new TowerManager();
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
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.state === GameState.RUNNING) return;

    this.state = GameState.RUNNING;
    this.clockManager.start();
    this.lastFrameTime = performance.now();
    this.frameCount = 0;

    this.gameLoop(this.lastFrameTime);
  }

  /**
   * Pause the game
   */
  pause(): void {
    if (this.state !== GameState.RUNNING) return;

    this.state = GameState.PAUSED;
    this.clockManager.setSpeed(0);

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
    this.clockManager.setSpeed(this.config.initialSpeed);
    this.lastFrameTime = performance.now();

    this.gameLoop(this.lastFrameTime);
  }

  /**
   * Stop the game completely
   */
  stop(): void {
    this.state = GameState.STOPPED;
    this.clockManager.stop();

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
    const tickCount = this.clockManager.update(currentTime);

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
    const alpha = this.clockManager.getInterpolationAlpha();
    this.render(alpha);
    getEventBus().processPhase(GamePhase.RENDER);

    // Post-render (save, analytics, etc.)
    getEventBus().processPhase(GamePhase.POST_RENDER);
  };

  /**
   * Run one simulation tick
   */
  private simulationTick(): void {
    // TODO: Process simulation
    // - Update elevator positions
    // - Move people
    // - Update building states
    // - Process economic changes
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
    const deltaTime = 1 / 60; // Assuming 60fps for camera updates

    this.towerRenderer.render(tower, deltaTime);
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
   * Get the clock manager
   */
  getClockManager(): ClockManager {
    return this.clockManager;
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
    this.clockManager.setSpeed(speed);
  }

  /**
   * Get current game speed
   */
  getSpeed(): GameSpeed {
    return this.clockManager.getClock().speed;
  }

  /**
   * Get formatted time string
   */
  getFormattedTime(): string {
    return this.clockManager.getFormattedTime();
  }

  /**
   * Get formatted date string
   */
  getFormattedDate(): string {
    return this.clockManager.getFormattedDate();
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
   * Destroy the game and clean up resources
   */
  destroy(): void {
    this.stop();

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
