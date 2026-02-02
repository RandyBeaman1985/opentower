/**
 * RushHourSystem - Makes rush hours VISIBLE and DRAMATIC
 * 
 * The problem: Workers were spawning inside buildings, so no one used elevators.
 * The solution: Morning rush (8 AM) spawns workers at LOBBY → they ride UP
 *               Evening rush (5 PM) sends workers DOWN → they despawn
 * 
 * This creates VISIBLE elevator congestion and makes the game feel ALIVE.
 * 
 * @module simulation/RushHourSystem
 */

import { Person } from '@/entities/Person';
import type { Tower, Building, GameClock } from '@/interfaces';
import type { ElevatorSystem } from './ElevatorSystem';
import { getEventBus } from '@core/EventBus';
import { getSoundManager } from '@/audio/SoundManager';

export interface RushHourConfig {
  morningStart: { hour: number; minute: number };
  morningEnd: { hour: number; minute: number };
  eveningStart: { hour: number; minute: number };
  eveningEnd: { hour: number; minute: number };
  lunchStart: { hour: number; minute: number };
  lunchEnd: { hour: number; minute: number };
}

const DEFAULT_CONFIG: RushHourConfig = {
  morningStart: { hour: 7, minute: 30 },
  morningEnd: { hour: 9, minute: 0 },
  eveningStart: { hour: 17, minute: 0 },
  eveningEnd: { hour: 18, minute: 30 },
  lunchStart: { hour: 12, minute: 0 },
  lunchEnd: { hour: 13, minute: 0 },
};

export class RushHourSystem {
  private config: RushHourConfig;
  private lastMorningRush: number = -1; // Game day
  private lastEveningRush: number = -1;
  private activeWorkers: Set<string> = new Set(); // Worker IDs currently in tower
  
  // Worker spawn tracking (1 worker per office)
  private officeAssignments: Map<string, string[]> = new Map(); // officeId -> workerIds

  constructor(config?: Partial<RushHourConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Update rush hour mechanics
   * Called every tick from Game
   * Returns newly spawned workers to be added to PopulationSystem
   */
  update(
    tower: Tower,
    clock: GameClock,
    people: Map<string, Person>,
    elevatorSystem: ElevatorSystem
  ): Person[] {
    // 🆕 BUG-021 FIX: Use modulo-based week cycling
    // Day 0-4 = weekday (Mon-Fri), Day 5-6 = weekend (Sat-Sun)
    // This ensures Day 0 (new game start) is treated as Monday
    const dayOfWeek = clock.gameDay % 7;
    const isWeekday = dayOfWeek >= 0 && dayOfWeek <= 4;
    const isWeekend = !isWeekday;
    
    const currentTime = { hour: clock.gameHour, minute: clock.gameMinute };
    let newWorkers: Person[] = [];

    // WEEKDAY SCHEDULE: Regular 7:30 AM - 5:00 PM
    if (isWeekday) {
      // MORNING RUSH: Spawn workers at lobby
      if (this.isTimeFor(currentTime, this.config.morningStart) && this.lastMorningRush !== clock.gameDay) {
        newWorkers = this.triggerMorningRush(tower, people, elevatorSystem);
        this.lastMorningRush = clock.gameDay;
      }

      // EVENING RUSH: Send workers home
      if (this.isTimeFor(currentTime, this.config.eveningStart) && this.lastEveningRush !== clock.gameDay) {
        this.triggerEveningRush(tower, people, elevatorSystem);
        this.lastEveningRush = clock.gameDay;
      }
    }
    
    // WEEKEND SCHEDULE: Reduced staff (30%), 10:00 AM - 3:00 PM
    else if (isWeekend) {
      const weekendMorning = { hour: 10, minute: 0 };
      const weekendEvening = { hour: 15, minute: 0 };
      
      // Weekend morning arrival (fewer workers)
      if (this.isTimeFor(currentTime, weekendMorning) && this.lastMorningRush !== clock.gameDay) {
        newWorkers = this.triggerWeekendShift(tower, people, elevatorSystem);
        this.lastMorningRush = clock.gameDay;
      }
      
      // Weekend early departure
      if (this.isTimeFor(currentTime, weekendEvening) && this.lastEveningRush !== clock.gameDay) {
        this.triggerEveningRush(tower, people, elevatorSystem);
        this.lastEveningRush = clock.gameDay;
      }
    }

    // LUNCH RUSH: Trigger in PopulationAI (already handled)
    return newWorkers;
  }

  /**
   * Trigger morning rush - spawn workers at lobby
   * Returns new workers to be added to PopulationSystem
   */
  private triggerMorningRush(
    tower: Tower,
    people: Map<string, Person>,
    elevatorSystem: ElevatorSystem
  ): Person[] {
    const offices = this.getOfficeBuildings(tower);
    if (offices.length === 0) return [];

    const newWorkers: Person[] = [];
    const lobby = tower.floorsById[0]; // Ground floor

    for (const office of offices) {
      // Each office gets 1-6 workers (based on building capacity)
      const workersPerOffice = 3; // Start with 3, can be configurable

      const workerIds: string[] = [];

      for (let i = 0; i < workersPerOffice; i++) {
        // Spawn worker at lobby entrance
        const lobbyTile = 5; // Center of lobby
        const worker = new Person({
          type: 'worker',
          floor: 0,
          tile: lobbyTile,
          schedule: {
            personType: 'worker',
            events: [
              { hour: 12, minute: 0, action: 'lunch', weekdayOnly: true },
              { hour: 17, minute: 0, action: 'leave', weekdayOnly: true },
            ],
          },
        });

        worker.destinationBuildingId = office.id;
        worker.state = 'walking'; // Start navigating immediately
        
        // Create path to office (will use elevators)
        const targetFloor = office.position.floor;
        const targetTile = office.position.startTile + 1;
        
        // Navigation will be handled by pathfinding system using destinationBuildingId
        // No manual goal setting needed

        newWorkers.push(worker);
        workerIds.push(worker.id);
        this.activeWorkers.add(worker.id);
      }

      this.officeAssignments.set(office.id, workerIds);
      office.occupantIds = workerIds;
    }

    // Notification
    getEventBus().emitSync({
      type: 'NOTIFICATION',
      title: '🌅 Morning Rush Hour',
      message: `${newWorkers.length} workers arriving at the tower`,
    });

    console.log(`🌅 MORNING RUSH: ${newWorkers.length} workers spawned at lobby`);
    return newWorkers;
  }

  /**
   * Trigger weekend shift - spawn reduced staff (30% of offices)
   * Returns new workers to be added to PopulationSystem
   */
  private triggerWeekendShift(
    tower: Tower,
    people: Map<string, Person>,
    elevatorSystem: ElevatorSystem
  ): Person[] {
    const offices = this.getOfficeBuildings(tower);
    if (offices.length === 0) return [];

    // Only 30% of offices have staff on weekends
    const staffedOfficeCount = Math.max(1, Math.floor(offices.length * 0.3));
    const staffedOffices = offices.slice(0, staffedOfficeCount);

    const newWorkers: Person[] = [];
    const lobby = tower.floorsById[0]; // Ground floor

    for (const office of staffedOffices) {
      // Fewer workers per office on weekends (1-2 instead of 3)
      const workersPerOffice = 1;
      const workerIds: string[] = [];

      for (let i = 0; i < workersPerOffice; i++) {
        const lobbyTile = 5; // Center of lobby
        const worker = new Person({
          type: 'worker',
          floor: 0,
          tile: lobbyTile,
          schedule: {
            personType: 'worker',
            events: [
              { hour: 15, minute: 0, action: 'leave', weekdayOnly: false }, // Leave at 3 PM
            ],
          },
        });

        worker.destinationBuildingId = office.id;
        worker.state = 'walking';

        newWorkers.push(worker);
        workerIds.push(worker.id);
        this.activeWorkers.add(worker.id);
      }

      this.officeAssignments.set(office.id, workerIds);
      office.occupantIds = workerIds;
    }

    // Notification
    getEventBus().emitSync({
      type: 'NOTIFICATION',
      title: '☀️ Weekend Shift',
      message: `${newWorkers.length} workers (reduced staff) arriving`,
    });

    // BUG-026 FIX: Play weekend shift sound (relaxed chime, different from weekday rush)
    getSoundManager().playWeekendShift();

    console.log(`☀️ WEEKEND SHIFT: ${newWorkers.length} workers spawned (${staffedOfficeCount}/${offices.length} offices staffed)`);
    return newWorkers;
  }

  /**
   * Trigger evening rush - send workers to lobby and despawn
   */
  private triggerEveningRush(
    tower: Tower,
    people: Map<string, Person>,
    elevatorSystem: ElevatorSystem
  ): void {
    let leavingCount = 0;

    // Send all active workers to lobby
    for (const personId of this.activeWorkers) {
      const person = people.get(personId);
      if (!person) continue;

      // Navigate to lobby (set destination to null to signal leaving)
      person.destinationBuildingId = null;
      person.state = 'leaving';

      leavingCount++;
    }

    // Notification
    if (leavingCount > 0) {
      getEventBus().emitSync({
        type: 'NOTIFICATION',
        title: '🌆 Evening Rush Hour',
        message: `${leavingCount} workers heading home`,
      });

      console.log(`🌆 EVENING RUSH: ${leavingCount} workers leaving`);
    }
  }

  /**
   * Remove a worker who reached the lobby exit
   */
  removeWorkerAtExit(workerId: string, people: Map<string, Person>): void {
    const person = people.get(workerId);
    if (!person) return;

    // Remove from tower
    people.delete(workerId);
    this.activeWorkers.delete(workerId);

    // Remove from office assignments
    for (const [officeId, workerIds] of this.officeAssignments.entries()) {
      const index = workerIds.indexOf(workerId);
      if (index !== -1) {
        workerIds.splice(index, 1);
        break;
      }
    }

    console.log(`👋 Worker ${workerId} left the tower`);
  }

  /**
   * Check if worker reached lobby (floor 0) during evening rush
   */
  checkForExitingWorkers(people: Map<string, Person>): string[] {
    const exitingIds: string[] = [];

    for (const personId of this.activeWorkers) {
      const person = people.get(personId);
      if (!person) continue;

      // If worker is on ground floor and in leaving state
      if (person.currentFloor === 0 && person.state === 'leaving') {
        // Check if they reached the lobby area (near center)
        if (Math.abs(person.currentTile - 5) < 2) {
          exitingIds.push(personId);
        }
      }
    }

    return exitingIds;
  }

  /**
   * Get all office buildings
   */
  private getOfficeBuildings(tower: Tower): Building[] {
    return Object.values(tower.buildingsById).filter(
      (b) => b.type === 'office'
    );
  }

  /**
   * Check if current time matches a schedule time
   */
  private isTimeFor(current: { hour: number; minute: number }, target: { hour: number; minute: number }): boolean {
    return current.hour === target.hour && current.minute === target.minute;
  }

  /**
   * Get current rush hour state
   */
  getRushHourState(clock: GameClock): 'morning' | 'lunch' | 'evening' | 'normal' {
    const { gameHour: hour, gameMinute: minute } = clock;

    if (this.isInRange({ hour, minute }, this.config.morningStart, this.config.morningEnd)) {
      return 'morning';
    }
    
    if (this.isInRange({ hour, minute }, this.config.lunchStart, this.config.lunchEnd)) {
      return 'lunch';
    }
    
    if (this.isInRange({ hour, minute }, this.config.eveningStart, this.config.eveningEnd)) {
      return 'evening';
    }

    return 'normal';
  }

  /**
   * Check if time is in a range
   */
  private isInRange(
    current: { hour: number; minute: number },
    start: { hour: number; minute: number },
    end: { hour: number; minute: number }
  ): boolean {
    const currentMinutes = current.hour * 60 + current.minute;
    const startMinutes = start.hour * 60 + start.minute;
    const endMinutes = end.hour * 60 + end.minute;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  /**
   * Get active worker count
   */
  getActiveWorkerCount(): number {
    return this.activeWorkers.size;
  }

  /**
   * Serialize for save/load
   */
  serialize(): {
    lastMorningRush: number;
    lastEveningRush: number;
    activeWorkers: string[];
    officeAssignments: Record<string, string[]>;
  } {
    return {
      lastMorningRush: this.lastMorningRush,
      lastEveningRush: this.lastEveningRush,
      activeWorkers: Array.from(this.activeWorkers),
      officeAssignments: Object.fromEntries(this.officeAssignments),
    };
  }

  /**
   * Deserialize from save data
   */
  deserialize(data: {
    lastMorningRush: number;
    lastEveningRush: number;
    activeWorkers: string[];
    officeAssignments: Record<string, string[]>;
  }): void {
    this.lastMorningRush = data.lastMorningRush;
    this.lastEveningRush = data.lastEveningRush;
    this.activeWorkers = new Set(data.activeWorkers);
    this.officeAssignments = new Map(Object.entries(data.officeAssignments));
  }
}
