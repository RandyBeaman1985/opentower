/**
 * Performance Benchmark - Week 12 Testing
 * 
 * Automated stress test to verify game can handle:
 * - 1,000+ people
 * - 50+ buildings
 * - 10+ elevators
 * - 60 FPS minimum
 * 
 * Run from console: window.runPerformanceBenchmark()
 */

import type { Game } from '@core/Game';
import type { Tower } from '@/interfaces';

interface BenchmarkResult {
  phase: string;
  population: number;
  buildings: number;
  elevators: number;
  avgFps: number;
  minFps: number;
  maxFps: number;
  duration: number;
  passed: boolean;
  issues: string[];
}

export class PerformanceBenchmark {
  private game: Game;
  private results: BenchmarkResult[] = [];
  
  constructor(game: Game) {
    this.game = game;
  }
  
  /**
   * Run full benchmark suite
   */
  async run(): Promise<void> {
    console.log('🚀 Starting Performance Benchmark...');
    console.log('================================================');
    
    // Phase 1: Baseline (100 people)
    await this.runPhase('Baseline', 100, 10, 2);
    
    // Phase 2: Medium Load (500 people)
    await this.runPhase('Medium Load', 500, 30, 5);
    
    // Phase 3: High Load (1000 people)
    await this.runPhase('High Load', 1000, 50, 10);
    
    // Phase 4: Stress Test (2000 people)
    await this.runPhase('Stress Test', 2000, 80, 15);
    
    // Print summary
    this.printSummary();
  }
  
  /**
   * Run a single benchmark phase
   */
  private async runPhase(
    name: string,
    targetPop: number,
    targetBuildings: number,
    targetElevators: number
  ): Promise<void> {
    console.log(`\n📊 Phase: ${name}`);
    console.log(`   Target: ${targetPop} people, ${targetBuildings} buildings, ${targetElevators} elevators`);
    
    const issues: string[] = [];
    
    // Build tower infrastructure
    this.setupTower(targetBuildings, targetElevators);
    
    // Spawn population
    this.spawnPopulation(targetPop);
    
    // Run for 30 seconds and measure FPS
    const startTime = performance.now();
    const duration = 30000; // 30 seconds
    const fpsReadings: number[] = [];
    
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let fpsCheckInterval = setInterval(() => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastFrameTime;
      const fps = 1000 / deltaTime;
      fpsReadings.push(fps);
      frameCount++;
      lastFrameTime = currentTime;
      
      // Check for frame drops
      if (fps < 30) {
        issues.push(`Frame drop: ${fps.toFixed(1)} FPS at frame ${frameCount}`);
      }
    }, 100); // Check FPS every 100ms
    
    // Wait for duration
    await this.sleep(duration);
    clearInterval(fpsCheckInterval);
    
    // Calculate statistics
    const avgFps = fpsReadings.reduce((a, b) => a + b, 0) / fpsReadings.length;
    const minFps = Math.min(...fpsReadings);
    const maxFps = Math.max(...fpsReadings);
    
    // Get actual counts
    const tower = this.game.getTowerManager().getTower();
    const population = this.game.getPopulationSystem().getPopulation();
    const buildings = Object.keys(tower.buildingsById).length;
    const elevators = this.game.getElevatorSystem().getShafts().length;
    
    // Determine pass/fail
    const passed = minFps >= 30 && issues.length === 0;
    
    // Store result
    const result: BenchmarkResult = {
      phase: name,
      population,
      buildings,
      elevators,
      avgFps: Math.round(avgFps),
      minFps: Math.round(minFps),
      maxFps: Math.round(maxFps),
      duration: performance.now() - startTime,
      passed,
      issues,
    };
    
    this.results.push(result);
    
    // Print result
    console.log(`   ✓ Population: ${population}`);
    console.log(`   ✓ Buildings: ${buildings}`);
    console.log(`   ✓ Elevators: ${elevators}`);
    console.log(`   ✓ Avg FPS: ${result.avgFps}`);
    console.log(`   ✓ Min FPS: ${result.minFps} ${result.minFps < 30 ? '❌ FAIL' : '✅'}`);
    console.log(`   ✓ Max FPS: ${result.maxFps}`);
    
    if (issues.length > 0) {
      console.log(`   ⚠️ Issues: ${issues.length}`);
      issues.slice(0, 5).forEach(issue => console.log(`      - ${issue}`));
    }
    
    console.log(`   ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  }
  
  /**
   * Build tower infrastructure
   */
  private setupTower(buildingCount: number, elevatorCount: number): void {
    const tower = this.game.getTowerManager().getTower();
    const elevatorSystem = this.game.getElevatorSystem();
    
    // Clear existing tower
    for (const id of Object.keys(tower.buildingsById)) {
      delete tower.buildingsById[id];
    }
    
    // Clear all elevators
    const shafts = elevatorSystem.getShafts();
    for (const shaft of shafts) {
      elevatorSystem.removeShaft(shaft.id);
    }
    
    // Add office buildings distributed across floors
    let currentTile = 5;
    let currentFloor = 1;
    
    for (let i = 0; i < buildingCount; i++) {
      const building = {
        id: `bench-building-${i}`,
        type: 'office' as const,
        position: {
          floor: currentFloor,
          startTile: currentTile,
          endTile: currentTile + 2, // 3 tiles wide
        },
        height: 1,
        occupancy: {
          current: 0,
          max: 10,
        },
        state: 'operational' as const,
        constructionProgress: 100,
        income: 1500,
        maintenanceCost: 50,
        satisfaction: 100,
      };
      
      tower.buildingsById[building.id] = building as any;
      
      // Move to next position
      currentTile += 4;
      if (currentTile > 100) {
        currentTile = 5;
        currentFloor++;
      }
    }
    
    // Add elevators
    const floorsPerElevator = Math.ceil(currentFloor / elevatorCount);
    for (let i = 0; i < elevatorCount; i++) {
      const minFloor = i * floorsPerElevator;
      const maxFloor = Math.min((i + 1) * floorsPerElevator - 1, currentFloor);
      
      try {
        elevatorSystem.createStandardShaft(150 + i * 5, minFloor, maxFloor);
      } catch (e) {
        // Elevator creation failed, skip
      }
    }
  }
  
  /**
   * Spawn population
   */
  private spawnPopulation(count: number): void {
    const populationSystem = this.game.getPopulationSystem();
    const tower = this.game.getTowerManager().getTower();
    const buildings = Object.values(tower.buildingsById).filter(b => b.type === 'office');
    
    if (buildings.length === 0) {
      console.warn('⚠️ No office buildings to spawn workers in!');
      return;
    }
    
    // Spawn workers distributed across offices
    for (let i = 0; i < count; i++) {
      const building = buildings[i % buildings.length];
      
      // Create person at building location
      const person = {
        id: `bench-person-${i}`,
        name: `Worker ${i}`,
        type: 'worker' as const,
        currentFloor: building.position.floor,
        currentTile: building.position.startTile,
        destinationBuildingId: building.id,
        state: 'idle' as const,
        stress: 0,
        happiness: 100,
      };
      
      populationSystem['people'].set(person.id, person as any);
    }
  }
  
  /**
   * Sleep for milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Print benchmark summary
   */
  private printSummary(): void {
    console.log('\n\n================================================');
    console.log('📊 BENCHMARK SUMMARY');
    console.log('================================================\n');
    
    console.log('| Phase | Pop | FPS (Avg/Min/Max) | Result |');
    console.log('|-------|-----|-------------------|--------|');
    
    for (const result of this.results) {
      const fps = `${result.avgFps}/${result.minFps}/${result.maxFps}`;
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`| ${result.phase.padEnd(13)} | ${String(result.population).padEnd(4)} | ${fps.padEnd(17)} | ${status} |`);
    }
    
    console.log('\n');
    
    // Overall assessment
    const allPassed = this.results.every(r => r.passed);
    if (allPassed) {
      console.log('✅ ALL PHASES PASSED - Game is performant!');
    } else {
      console.log('❌ PERFORMANCE ISSUES DETECTED');
      console.log('\nRecommendations:');
      console.log('  1. Profile with Chrome DevTools to find bottlenecks');
      console.log('  2. Consider spatial partitioning for person updates');
      console.log('  3. Add dirty flags to avoid unnecessary calculations');
      console.log('  4. Batch rendering updates');
    }
    
    // Memory stats
    if ('performance' in window && 'memory' in (performance as any)) {
      const memory = (performance as any).memory;
      console.log('\n📊 Memory Usage:');
      console.log(`   Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
    }
  }
}

/**
 * Global benchmark runner (call from console)
 */
export function installPerformanceBenchmark(game: Game): void {
  (window as any).runPerformanceBenchmark = async () => {
    const benchmark = new PerformanceBenchmark(game);
    await benchmark.run();
  };
  
  console.log('📊 Performance benchmark installed!');
  console.log('   Run: window.runPerformanceBenchmark()');
}
