/**
 * TimeSystem Demo - Shows how to use the time system in OpenTower
 * 
 * Run this example to see:
 * - Time progression through a full day
 * - Scheduled events firing
 * - Day/night visual changes
 * - Speed control
 */

import { TimeSystem, TimeSpeed, TimePeriod } from '../src/simulation/TimeSystem';
import { getEventBus } from '../src/core/EventBus';

class TimeSystemDemo {
  private timeSystem: TimeSystem;
  private isRunning = false;
  private lastTime = 0;
  
  constructor() {
    this.timeSystem = new TimeSystem();
    this.setupEventListeners();
  }
  
  /**
   * Setup event listeners to see time events
   */
  private setupEventListeners(): void {
    const eventBus = getEventBus();
    
    // Hour changes
    eventBus.on('HOUR_CHANGE', (event) => {
      console.log(`⏰ Hour changed to ${event.hour}:00`);
    });
    
    // Day changes
    eventBus.on('DAY_CHANGE', (event) => {
      const dayName = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][event.dayOfWeek];
      console.log(`📅 New day: ${dayName} (${event.day})`);
    });
    
    // Quarter end (rent collection)
    eventBus.on('QUARTER_END', (event) => {
      console.log(`💰 Quarter ${event.quarter} Year ${event.year} ended! Time to collect rent.`);
    });
    
    // Quarter start
    eventBus.on('QUARTER_START', (event) => {
      console.log(`🎯 Starting Q${event.quarter} Year ${event.year}`);
    });
    
    // Scheduled time events
    eventBus.on('TIME_EVENT', (event) => {
      console.log(`📢 ${event.message}`);
    });
    
    // Speed changes
    eventBus.on('SPEED_CHANGE', (event) => {
      console.log(`⚡ Speed changed: ${event.oldSpeed}x → ${event.newSpeed}x`);
    });
  }
  
  /**
   * Start the demo
   */
  start(): void {
    console.log('=== OpenTower TimeSystem Demo ===\n');
    console.log('Starting time system...\n');
    
    this.timeSystem.start();
    this.isRunning = true;
    this.lastTime = performance.now();
    
    // Print initial state
    this.printTimeState();
    
    // Start the update loop
    this.update();
  }
  
  /**
   * Update loop (simulates game loop)
   */
  private update = (): void => {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    
    // Update time system
    const tickCount = this.timeSystem.update(currentTime);
    
    // Print state every 60 ticks (every in-game minute at 1x speed)
    if (tickCount > 0 && this.timeSystem.getClock().currentTick % 60 === 0) {
      this.printTimeState();
    }
    
    // Continue loop
    requestAnimationFrame(this.update);
  };
  
  /**
   * Print current time state
   */
  private printTimeState(): void {
    const state = this.timeSystem.getTimeState();
    const tod = state.timeOfDay;
    
    console.log('─────────────────────────────────');
    console.log(`🕐 Time: ${state.timeString}`);
    console.log(`📅 Date: ${state.dateString}`);
    console.log(`🌅 Period: ${tod.label}`);
    console.log(`⚡ Speed: ${state.speed}x ${state.isPaused ? '(PAUSED)' : ''}`);
    console.log(`🏢 Lights: ${tod.buildingsShowLights ? 'ON' : 'OFF'}`);
    console.log(`🚶 Rush Hour: ${state.isRushHour ? 'YES' : 'NO'}`);
    console.log(`📊 Weekend: ${state.isWeekend ? 'YES' : 'NO'}`);
    console.log(`🎮 Gameplay Period: ${state.timePeriod}`);
    console.log('─────────────────────────────────\n');
  }
  
  /**
   * Demo different speed controls
   */
  async demoSpeedControls(): Promise<void> {
    console.log('\n=== Speed Control Demo ===\n');
    
    // Normal speed
    console.log('▶️  Normal speed (1x)');
    this.timeSystem.setSpeed(TimeSpeed.NORMAL);
    await this.wait(3000);
    
    // Fast speed
    console.log('⏩ Fast speed (3x)');
    this.timeSystem.setSpeed(TimeSpeed.FAST);
    await this.wait(3000);
    
    // Ultra speed
    console.log('⏭️  Ultra speed (10x)');
    this.timeSystem.setSpeed(TimeSpeed.ULTRA);
    await this.wait(3000);
    
    // Pause
    console.log('⏸️  Paused');
    this.timeSystem.pause();
    await this.wait(2000);
    
    // Resume
    console.log('▶️  Resumed');
    this.timeSystem.resume();
    await this.wait(2000);
    
    console.log('\n=== Speed Demo Complete ===\n');
  }
  
  /**
   * Demo custom scheduled events
   */
  demoCustomEvents(): void {
    console.log('\n=== Custom Event Demo ===\n');
    
    // Add a custom morning announcement
    this.timeSystem.scheduleEvent({
      id: 'morning_coffee',
      name: 'Coffee Time',
      description: 'Coffee shop opens',
      hour: 7,
      minute: 30,
      recurring: true,
      weekdaysOnly: true,
      callback: () => {
        console.log('☕ Coffee shop is now open!');
      },
    });
    
    // Add a weekend brunch event
    this.timeSystem.scheduleEvent({
      id: 'weekend_brunch',
      name: 'Weekend Brunch',
      description: 'Brunch service begins',
      hour: 11,
      minute: 0,
      recurring: true,
      weekendsOnly: true,
      callback: () => {
        console.log('🥞 Weekend brunch is being served!');
      },
    });
    
    console.log('✅ Custom events registered');
    console.log('   - Coffee Time: 7:30 AM (weekdays)');
    console.log('   - Weekend Brunch: 11:00 AM (weekends)');
    console.log('\n');
  }
  
  /**
   * Demo time-based gameplay logic
   */
  demoGameplayLogic(): void {
    console.log('\n=== Gameplay Logic Demo ===\n');
    
    const period = this.timeSystem.getTimePeriod();
    const state = this.timeSystem.getTimeState();
    
    // Example: Adjust NPC behavior based on time
    switch (period) {
      case TimePeriod.EARLY_MORNING:
        console.log('🌙 Early morning: Most NPCs sleeping, janitors working');
        break;
      case TimePeriod.MORNING:
        console.log('🌅 Morning: NPCs commuting to work, elevators busy');
        break;
      case TimePeriod.WORK_HOURS:
        console.log('💼 Work hours: Offices full, shops open');
        break;
      case TimePeriod.EVENING:
        console.log('🌆 Evening: NPCs heading home, restaurants busy');
        break;
      case TimePeriod.NIGHT:
        console.log('🌃 Night: Hotels active, most services closed');
        break;
    }
    
    // Example: Elevator demand calculation
    const elevatorDemand = this.calculateElevatorDemand(state);
    console.log(`🛗 Elevator demand: ${elevatorDemand.toFixed(1)}%`);
    
    // Example: Restaurant traffic
    const restaurantTraffic = this.calculateRestaurantTraffic(state);
    console.log(`🍽️  Restaurant traffic: ${restaurantTraffic.toFixed(1)}%`);
    
    console.log('\n');
  }
  
  /**
   * Calculate elevator demand based on time
   */
  private calculateElevatorDemand(state: any): number {
    let demand = 20; // Base demand
    
    if (state.isRushHour) demand += 60;
    if (state.timePeriod === TimePeriod.WORK_HOURS) demand += 30;
    if (state.isWeekend) demand -= 20;
    
    return Math.min(100, Math.max(0, demand));
  }
  
  /**
   * Calculate restaurant traffic based on time
   */
  private calculateRestaurantTraffic(state: any): number {
    const hour = state.hour;
    let traffic = 10; // Base traffic
    
    // Lunch rush (12-1 PM)
    if (hour >= 12 && hour < 13) traffic += 70;
    
    // Dinner rush (6-8 PM)
    if (hour >= 18 && hour < 20) traffic += 80;
    
    // Weekend bonus
    if (state.isWeekend) traffic += 20;
    
    return Math.min(100, Math.max(0, traffic));
  }
  
  /**
   * Stop the demo
   */
  stop(): void {
    this.isRunning = false;
    this.timeSystem.stop();
    console.log('\n=== Demo stopped ===\n');
  }
  
  /**
   * Helper to wait
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the demo
async function runDemo() {
  const demo = new TimeSystemDemo();
  
  // Start the time system
  demo.start();
  
  // Wait a bit to see initial time progression
  await demo['wait'](2000);
  
  // Demo custom events
  demo.demoCustomEvents();
  
  // Wait to see events fire
  await demo['wait'](3000);
  
  // Demo speed controls
  await demo.demoSpeedControls();
  
  // Demo gameplay logic
  setInterval(() => {
    demo.demoGameplayLogic();
  }, 5000);
  
  // Let it run for a while
  console.log('Demo running... Press Ctrl+C to stop\n');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo().catch(console.error);
}

export { TimeSystemDemo };
