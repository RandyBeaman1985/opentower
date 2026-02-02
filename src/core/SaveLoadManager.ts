/**
 * SaveLoadManager - Handles game save/load functionality
 * 
 * Features:
 * - Save to localStorage
 * - Load from localStorage
 * - Auto-save every N minutes
 * - Manual save/load triggers
 * - Save metadata (timestamp, version, playtime)
 * 
 * @module core/SaveLoadManager
 */

import type { Tower } from '@/interfaces';
import { TowerManager } from '@simulation/Tower';
import { PopulationSystem } from '@simulation/PopulationSystem';
import { ElevatorSystem } from '@simulation/ElevatorSystem';
import { EconomicSystem } from '@simulation/EconomicSystem';
import { TimeSystem } from '@simulation/TimeSystem';

const SAVE_KEY = 'opentower_save_v1';
const AUTOSAVE_INTERVAL = 3 * 60 * 1000; // 3 minutes in milliseconds

export interface SaveData {
  version: number;
  timestamp: number;
  playtime: number; // Total playtime in milliseconds
  tower: Tower;
  // System-specific state
  populationState: {
    people: any[]; // Serialized people
    nextPersonId: number;
  };
  elevatorState: {
    shafts: any[]; // Serialized elevator shafts
  };
  economicState: {
    lastQuarterlyCollection: number;
    quarterlyIncome: number;
    quarterlyExpenses: number;
  };
  // 🆕 BUG-020 FIX: Save game speed and time state
  timeSystemState: {
    clock: any;
    timeOfDay: any;
  };
}

export class SaveLoadManager {
  private towerManager: TowerManager;
  private populationSystem: PopulationSystem;
  private elevatorSystem: ElevatorSystem;
  private economicSystem: EconomicSystem;
  private timeSystem: TimeSystem;
  private autoSaveTimer: number | null = null;
  private playtimeStart: number;
  private totalPlaytime: number = 0;

  constructor(
    towerManager: TowerManager,
    populationSystem: PopulationSystem,
    elevatorSystem: ElevatorSystem,
    economicSystem: EconomicSystem,
    timeSystem: TimeSystem
  ) {
    this.towerManager = towerManager;
    this.populationSystem = populationSystem;
    this.elevatorSystem = elevatorSystem;
    this.economicSystem = economicSystem;
    this.timeSystem = timeSystem;
    this.playtimeStart = Date.now();
  }

  /**
   * Save game state to localStorage
   */
  save(): boolean {
    try {
      const saveData: SaveData = {
        version: 1,
        timestamp: Date.now(),
        playtime: this.getTotalPlaytime(),
        tower: this.towerManager.serialize(),
        populationState: this.populationSystem.serialize(),
        elevatorState: this.elevatorSystem.serialize(),
        economicState: this.economicSystem.serialize(),
        timeSystemState: this.timeSystem.serialize(), // 🆕 BUG-020 FIX
      };

      const json = JSON.stringify(saveData);
      localStorage.setItem(SAVE_KEY, json);

      console.log('💾 Game saved successfully!');
      console.log(`  Tower: ${saveData.tower.name}`);
      console.log(`  Population: ${saveData.tower.population}`);
      console.log(`  Funds: $${saveData.tower.funds.toLocaleString()}`);
      console.log(`  Playtime: ${Math.floor(saveData.playtime / 60000)} minutes`);

      return true;
    } catch (error) {
      console.error('❌ Failed to save game:', error);
      return false;
    }
  }

  /**
   * Load game state from localStorage
   */
  load(): boolean {
    try {
      const json = localStorage.getItem(SAVE_KEY);
      if (!json) {
        console.log('ℹ️ No save data found');
        return false;
      }

      const saveData: SaveData = JSON.parse(json);

      // Validate save version
      if (saveData.version !== 1) {
        console.warn('⚠️ Save version mismatch, loading may fail');
      }

      // Restore tower state
      this.towerManager.deserialize(saveData.tower);

      // Restore system states
      this.populationSystem.deserialize(saveData.populationState);
      this.elevatorSystem.deserialize(saveData.elevatorState);
      this.economicSystem.deserialize(saveData.economicState);
      
      // 🆕 BUG-020 FIX: Restore game speed and time state
      if (saveData.timeSystemState) {
        this.timeSystem.deserialize(saveData.timeSystemState);
      }

      // Restore playtime
      this.totalPlaytime = saveData.playtime;
      this.playtimeStart = Date.now();

      console.log('📂 Game loaded successfully!');
      console.log(`  Tower: ${saveData.tower.name}`);
      console.log(`  Population: ${saveData.tower.population}`);
      console.log(`  Funds: $${saveData.tower.funds.toLocaleString()}`);
      console.log(`  Star Rating: ${saveData.tower.starRating}★`);
      console.log(`  Last Saved: ${new Date(saveData.timestamp).toLocaleString()}`);

      return true;
    } catch (error) {
      console.error('❌ Failed to load game:', error);
      return false;
    }
  }

  /**
   * Check if a save exists
   */
  hasSave(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  /**
   * Delete current save
   */
  deleteSave(): boolean {
    try {
      localStorage.removeItem(SAVE_KEY);
      console.log('🗑️ Save deleted');
      return true;
    } catch (error) {
      console.error('❌ Failed to delete save:', error);
      return false;
    }
  }

  /**
   * Get save metadata without loading
   */
  getSaveMetadata(): { timestamp: number; playtime: number; population: number; funds: number } | null {
    try {
      const json = localStorage.getItem(SAVE_KEY);
      if (!json) return null;

      const saveData: SaveData = JSON.parse(json);
      return {
        timestamp: saveData.timestamp,
        playtime: saveData.playtime,
        population: saveData.tower.population,
        funds: saveData.tower.funds,
      };
    } catch (error) {
      console.error('Failed to read save metadata:', error);
      return null;
    }
  }

  /**
   * Start auto-save timer
   */
  startAutoSave(): void {
    if (this.autoSaveTimer !== null) {
      return; // Already running
    }

    this.autoSaveTimer = window.setInterval(() => {
      console.log('🔄 Auto-saving...');
      this.save();
    }, AUTOSAVE_INTERVAL);

    console.log(`✅ Auto-save enabled (every ${AUTOSAVE_INTERVAL / 60000} minutes)`);
  }

  /**
   * Stop auto-save timer
   */
  stopAutoSave(): void {
    if (this.autoSaveTimer !== null) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
      console.log('⏸️ Auto-save disabled');
    }
  }

  /**
   * Get total playtime in milliseconds
   */
  getTotalPlaytime(): number {
    const currentSession = Date.now() - this.playtimeStart;
    return this.totalPlaytime + currentSession;
  }

  /**
   * Get formatted playtime string
   */
  getFormattedPlaytime(): string {
    const totalMs = this.getTotalPlaytime();
    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}
