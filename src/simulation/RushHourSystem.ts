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
   * Called every tick from PopulationSystem
   */
  update(
    tower: Tower,
    clock: GameClock,
    people: Map<string, Person>,
    elevatorSystem: ElevatorSystem
  ): void {
    const isWeekday = clock.gameDay >= 1 && clock.gameDay <= 5;
    if (!isWeekday) return; // No rush hours on weekends (TODO: implement weekend schedule)

    const currentTime = { hour: clock.gameHour, minute: clock.gameMinute };

    // MORNING RUSH: Spawn workers at lobby
    if (this.isTimeFor(currentTime, this.config.morningStart) && this.lastMorningRush !== clock.gameDay) {
      this.triggerMorningRush(tower, people, elevatorSystem);
      this.lastMorningRush = clock.gameDay;
    }

    // EVENING RUSH: Send workers home
    if (this.isTimeFor(currentTime, this.config.eveningStart) && this.lastEveningRush !== clock.gameDay) {
      this.triggerEveningRush(tower, people, elevatorSystem);
      this.lastEveningRush = clock.gameDay;
    }

    // LUNCH RUSH: Trigger in PopulationAI (already handled)
  }

  /**
   * Trigger morning rush - spawn workers at lobby
   */
  private triggerMorningRush(
    tower: Tower,
    people: Map<string, Person>,
    elevatorSystem: ElevatorSystem
  ): void {
    const offices = this.getOfficeBuildings(tower);
    if (offices.length === 0) return;

    let spawnedCount = 0;
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
        
        // Set navigation goal
        worker.goal = {
          floor: targetFloor,
          tile: targetTile,
          type: 'building',
        };

        people.set(worker.id, worker);
        workerIds.push(worker.id);
        this.activeWorkers.add(worker.id);
        spawnedCount++;
      }

      this.officeAssignments.set(office.id, workerIds);
      office.occupantIds = workerIds;
    }

    // Notification
    getEventBus().emitSync({
      type: 'NOTIFICATION',
      title: '🌅 Morning Rush Hour',
      message: `${spawnedCount} workers arriving at the tower`,
    });

    console.log(`🌅 MORNING RUSH: ${spawnedCount} workers spawned at lobby`);
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

      // Navigate to lobby
      person.goal = {
        floor: 0,
        tile: 5, // Lobby center
        type: 'exit',
      };
      person.state = 'walking';

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

      // If worker is on ground floor and idle/walking after 5 PM, they're leaving
      if (person.floor === 0 && person.goal?.type === 'exit') {
        // Check if they reached the exit tile
        if (Math.abs(person.tile - 5) < 1 && person.state === 'idle') {
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
    const { hour, minute } = clock;

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
