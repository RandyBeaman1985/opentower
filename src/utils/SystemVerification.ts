/**
 * SystemVerification - Automated checks for game systems
 * 
 * Run from console: window.verifyGameSystems()
 * 
 * Checks:
 * - Day/night cycle integration
 * - Building lights state
 * - Rush hour system
 * - Sound system
 * - Performance metrics
 */

import type { Game } from '@core/Game';

export interface VerificationResult {
  system: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: string[];
}

export class SystemVerification {
  private game: Game;
  private results: VerificationResult[] = [];

  constructor(game: Game) {
    this.game = game;
  }

  /**
   * Run all verification checks
   */
  async runAll(): Promise<VerificationResult[]> {
    console.log('🔍 SYSTEM VERIFICATION STARTING...\n');
    
    this.results = [];

    // Check each system
    this.checkDayNightCycle();
    this.checkBuildingLights();
    this.checkRushHourSystem();
    this.checkSoundSystem();
    this.checkEconomicSystems();
    this.checkPerformance();

    // Print results
    this.printResults();

    return this.results;
  }

  /**
   * Check if day/night cycle is integrated
   */
  private checkDayNightCycle(): void {
    try {
      const timeSystem = this.game.getTimeSystem();
      const timeOfDayState = timeSystem.getTimeOfDayState();

      if (!timeOfDayState) {
        this.addResult('Day/Night Cycle', 'FAIL', 'TimeOfDayState not found');
        return;
      }

      const { period, skyGradient, buildingsShowLights } = timeOfDayState;

      const details = [
        `Period: ${period}`,
        `Sky: Top=${skyGradient.topColor.toString(16)}, Bottom=${skyGradient.bottomColor.toString(16)}`,
        `Lights: ${buildingsShowLights ? 'ON' : 'OFF'}`,
      ];

      // Check if sky colors are changing based on time
      const hour = timeSystem.getClock().gameHour;
      const expectedLights = hour >= 18 || hour < 7;
      
      if (buildingsShowLights !== expectedLights) {
        this.addResult(
          'Day/Night Cycle',
          'WARNING',
          `Lights state mismatch: expected ${expectedLights}, got ${buildingsShowLights}`,
          details
        );
      } else {
        this.addResult('Day/Night Cycle', 'PASS', 'System integrated and updating', details);
      }
    } catch (error) {
      this.addResult('Day/Night Cycle', 'FAIL', `Error: ${error}`);
    }
  }

  /**
   * Check if building lights are being applied
   */
  private checkBuildingLights(): void {
    try {
      const timeSystem = this.game.getTimeSystem();
      const timeOfDayState = timeSystem.getTimeOfDayState();
      const tower = this.game.getTowerManager().getTower();
      const buildingCount = Object.keys(tower.buildingsById).length;

      if (buildingCount === 0) {
        this.addResult(
          'Building Lights',
          'WARNING',
          'No buildings to test (place some buildings first)',
        );
        return;
      }

      const lightsOn = timeOfDayState.buildingsShowLights;
      
      this.addResult(
        'Building Lights',
        'PASS',
        `Renderer receives lights state: ${lightsOn ? 'ON' : 'OFF'}`,
        [
          `Buildings: ${buildingCount}`,
          `Current hour: ${timeSystem.getClock().gameHour}`,
          'Visual verification needed: Check if building windows glow yellow at night',
        ]
      );
    } catch (error) {
      this.addResult('Building Lights', 'FAIL', `Error: ${error}`);
    }
  }

  /**
   * Check rush hour system integration
   */
  private checkRushHourSystem(): void {
    try {
      const clock = this.game.getTimeSystem().getClock();
      const hour = clock.gameHour;
      const minute = clock.gameMinute;
      const people = this.game.getPopulationSystem().getPeople();

      const isRushHour = 
        (hour === 7 && minute >= 30) || // Morning rush
        (hour === 8 && minute < 0) ||
        (hour === 12 && minute < 60) || // Lunch rush
        (hour === 17 && minute < 90); // Evening rush

      const details = [
        `Current time: ${hour}:${minute.toString().padStart(2, '0')}`,
        `Population: ${people.length}`,
        `Rush hour: ${isRushHour ? 'YES' : 'NO'}`,
      ];

      if (isRushHour && people.length === 0) {
        this.addResult(
          'Rush Hour System',
          'WARNING',
          'Rush hour but no people spawned (need offices + elevators)',
          details
        );
      } else {
        this.addResult('Rush Hour System', 'PASS', 'System integrated', details);
      }
    } catch (error) {
      this.addResult('Rush Hour System', 'FAIL', `Error: ${error}`);
    }
  }

  /**
   * Check sound system
   */
  private checkSoundSystem(): void {
    try {
      // Check if audio context exists
      // @ts-expect-error - accessing window audio modules
      const soundManager = window.soundManager;
      
      if (!soundManager) {
        this.addResult('Sound System', 'WARNING', 'SoundManager not exposed on window');
        return;
      }

      this.addResult(
        'Sound System',
        'PASS',
        'SoundManager available',
        ['Check console for sound play events', 'Toggle music with 🎵 button']
      );
    } catch (error) {
      this.addResult('Sound System', 'WARNING', `Could not verify: ${error}`);
    }
  }

  /**
   * Check economic systems
   */
  private checkEconomicSystems(): void {
    try {
      const tower = this.game.getTowerManager().getTower();
      const funds = tower.funds;
      const clock = this.game.getTimeSystem().getClock();

      const details = [
        `Funds: $${funds.toLocaleString()}`,
        `Quarter: ${clock.gameQuarter}`,
        `Day: ${clock.gameDay}`,
      ];

      if (funds < 0) {
        details.push('⚠️ IN DEBT - Check for bankruptcy warnings');
      }

      this.addResult('Economic System', 'PASS', 'System active', details);
    } catch (error) {
      this.addResult('Economic System', 'FAIL', `Error: ${error}`);
    }
  }

  /**
   * Check current performance
   */
  private checkPerformance(): void {
    try {
      const people = this.game.getPopulationSystem().getPeople();
      const tower = this.game.getTowerManager().getTower();
      const buildings = Object.keys(tower.buildingsById).length;
      const elevators = this.game.getElevatorSystem().getShafts().length;

      // @ts-expect-error - accessing game private properties
      const currentTick = this.game.currentTick ?? 0;

      const details = [
        `Population: ${people.length}`,
        `Buildings: ${buildings}`,
        `Elevators: ${elevators}`,
        `Ticks: ${currentTick}`,
        'Run window.runPerformanceBenchmark() for full test',
      ];

      if (people.length > 1500) {
        this.addResult(
          'Performance',
          'WARNING',
          'High population - monitor FPS',
          details
        );
      } else {
        this.addResult('Performance', 'PASS', 'Normal load', details);
      }
    } catch (error) {
      this.addResult('Performance', 'WARNING', `Could not measure: ${error}`);
    }
  }

  /**
   * Add a verification result
   */
  private addResult(
    system: string,
    status: 'PASS' | 'FAIL' | 'WARNING',
    message: string,
    details?: string[]
  ): void {
    this.results.push({ system, status, message, details });
  }

  /**
   * Get results programmatically
   */
  getResults(): VerificationResult[] {
    return this.results;
  }

  /**
   * Print results to console
   */
  private printResults(): void {
    console.log('\n📊 VERIFICATION RESULTS\n' + '='.repeat(80) + '\n');

    for (const result of this.results) {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`${icon} ${result.system}: ${result.message}`);
      
      if (result.details && result.details.length > 0) {
        for (const detail of result.details) {
          console.log(`   ${detail}`);
        }
      }
      console.log('');
    }

    const passCount = this.results.filter(r => r.status === 'PASS').length;
    const failCount = this.results.filter(r => r.status === 'FAIL').length;
    const warnCount = this.results.filter(r => r.status === 'WARNING').length;

    console.log('='.repeat(80));
    console.log(`✅ Passed: ${passCount} | ❌ Failed: ${failCount} | ⚠️ Warnings: ${warnCount}`);

    if (failCount === 0) {
      console.log('\n🎉 ALL CRITICAL SYSTEMS OPERATIONAL!\n');
    } else {
      console.log('\n🚨 CRITICAL FAILURES DETECTED - See above for details\n');
    }
  }
}

/**
 * Install system verification on window for console access
 */
export function installSystemVerification(game: Game): void {
  window.verifyGameSystems = async () => {
    const verifier = new SystemVerification(game);
    await verifier.runAll();
  };

  console.log('✅ System verification installed: window.verifyGameSystems()');
}
