/**
 * Population System - Manages all people in the tower
 * 
 * Spawns workers, visitors, residents based on building occupancy.
 * Updates person states each tick.
 * Handles scheduling (morning arrivals, lunch, departures).
 * 
 * @module simulation/PopulationSystem
 */

import { Person } from '@/entities/Person';
import type { Tower, Building, GameClock } from '@/interfaces';
import type { PersonType, DailySchedule, ScheduleEvent } from '@/interfaces/entities';
import { PathfindingSystem } from './PathfindingSystem';
import type { ElevatorSystem } from './ElevatorSystem';
import { PopulationAI } from './PopulationAI';

// 🆕 BUG-017 & BUG-024 FIX: Central population cap constant
const MAX_POPULATION = 10000; // SimTower had ~15K limit, we use 10K for performance

/**
 * Default schedules for different person types
 */
const DEFAULT_SCHEDULES: Record<PersonType, DailySchedule> = {
  worker: {
    personType: 'worker',
    events: [
      { hour: 8, minute: 0, action: 'arrive', weekdayOnly: true },
      { hour: 12, minute: 0, action: 'lunch', weekdayOnly: true },
      { hour: 13, minute: 0, action: 'return', weekdayOnly: true },
      { hour: 17, minute: 0, action: 'leave', weekdayOnly: true },
    ],
  },
  resident: {
    personType: 'resident',
    events: [
      { hour: 7, minute: 0, action: 'leave', weekdayOnly: true },
      { hour: 19, minute: 0, action: 'arrive', weekdayOnly: true },
    ],
  },
  visitor: {
    personType: 'visitor',
    events: [
      { hour: 10, minute: 0, action: 'arrive' },
      { hour: 14, minute: 0, action: 'leave' },
    ],
  },
  guest: {
    personType: 'guest',
    events: [
      { hour: 15, minute: 0, action: 'arrive' },
      { hour: 11, minute: 0, action: 'leave' },
    ],
  },
  staff: {
    personType: 'staff',
    events: [
      { hour: 6, minute: 0, action: 'arrive' },
      { hour: 22, minute: 0, action: 'leave' },
    ],
  },
};

export class PopulationSystem {
  private people: Map<string, Person> = new Map();
  private lastScheduleCheck: { day: number; hour: number; minute: number } | null = null;
  private pathfinding: PathfindingSystem = new PathfindingSystem();
  private lastImmigrationTick: number = 0;
  private immigrationCooldownTicks: number = 300; // ~5 seconds between immigration checks
  
  // Elevator wait time tracking
  private waitTimes: number[] = []; // Store recent wait times (in ticks)
  private maxWaitTimeHistory = 100; // Keep last 100 wait times
  
  // 🧠 AI BRAIN - Makes people ALIVE!
  private populationAI: PopulationAI = new PopulationAI();
  
  constructor() {
    // Empty initialization
  }
  
  /**
   * Get all people
   */
  getPeople(): Person[] {
    return Array.from(this.people.values());
  }
  
  /**
   * Get a person by ID
   */
  getPerson(id: string): Person | undefined {
    return this.people.get(id);
  }
  
  /**
   * Get AI data for all people (for rendering)
   */
  getAIData(): Map<string, import('./PopulationAI').PersonAIData> {
    const aiDataMap = new Map();
    for (const person of this.people.values()) {
      const data = this.populationAI.getPersonAIData(person.id);
      if (data) {
        aiDataMap.set(person.id, data);
      }
    }
    return aiDataMap;
  }
  
  /**
   * Get total population count
   */
  getPopulation(): number {
    return this.people.size;
  }
  
  /**
   * Spawn workers for all offices in the tower
   */
  spawnWorkersForBuildings(tower: Tower): void {
    const buildings = Object.values(tower.buildingsById) as Building[];
    
    for (const building of buildings) {
      if (building.type === 'office') {
        // Each office can hold 6 workers
        const workersNeeded = 6 - building.occupantIds.length;
        
        for (let i = 0; i < workersNeeded; i++) {
          const person = new Person({
            type: 'worker',
            floor: building.position.floor,
            tile: building.position.startTile + 1, // Spawn inside building
            // homeBuildingId omitted - workers come from outside
            schedule: DEFAULT_SCHEDULES.worker,
          });
          
          person.destinationBuildingId = building.id;
          this.people.set(person.id, person);
          building.occupantIds.push(person.id);
        }
      }
    }
  }

  /**
   * Process immigration - auto-spawn new workers based on star rating and capacity
   */
  private processImmigration(tower: Tower, currentTick: number): void {
    // Check cooldown
    if (currentTick - this.lastImmigrationTick < this.immigrationCooldownTicks) {
      return;
    }

    this.lastImmigrationTick = currentTick;

    // 🆕 BUG-017 FIX: Population cap check (now uses central constant)
    if (this.people.size >= MAX_POPULATION) {
      return; // Population cap reached
    }

    // Immigration rate based on star rating
    // 1 star: 10% chance, 2 stars: 25% chance, 3 stars: 50% chance, etc.
    const immigrationChance = Math.min(0.9, tower.starRating * 0.2);
    
    if (Math.random() > immigrationChance) {
      return; // No immigration this time
    }

    // Find empty office spaces
    const buildings = Object.values(tower.buildingsById) as Building[];
    const officesWithSpace: Building[] = [];

    for (const building of buildings) {
      if (building.type === 'office' && building.occupantIds.length < 6) {
        officesWithSpace.push(building);
      }
    }

    if (officesWithSpace.length === 0) {
      return; // No available offices
    }

    // Spawn 1-3 new workers (based on star rating)
    const spawnCount = Math.min(
      Math.ceil(tower.starRating / 2), // More workers at higher ratings
      officesWithSpace.length
    );

    for (let i = 0; i < spawnCount; i++) {
      const building = officesWithSpace[Math.floor(Math.random() * officesWithSpace.length)];
      
      if (!building || building.occupantIds.length >= 6) {
        continue; // Office full now or undefined
      }

      // Spawn new worker
      const person = new Person({
        type: 'worker',
        floor: building.position.floor,
        tile: building.position.startTile + 1,
        schedule: DEFAULT_SCHEDULES.worker,
      });

      person.destinationBuildingId = building.id;
      this.people.set(person.id, person);
      building.occupantIds.push(person.id);

      console.log(`🚶 New worker immigrated to ${building.type} (Population: ${this.people.size})`);
    }
  }
  
  /**
   * Update all people (called each simulation tick)
   */
  update(tower: Tower, clock: GameClock, currentTick: number, elevatorSystem: ElevatorSystem, economicSystem?: any): void {
    const gameSpeed = clock.speed;
    
    // Check for immigration / population growth
    this.processImmigration(tower, currentTick);
    
    // Check for scheduled events
    this.checkScheduledEvents(tower, clock, elevatorSystem);
    
    // Update each person
    for (const person of this.people.values()) {
      person.update(currentTick, gameSpeed);
      
      // 🧠 AI UPDATE - Makes people think and decide!
      this.populationAI.updatePerson(person, currentTick, tower, clock, elevatorSystem);
      
      // Check if person reached a food building destination
      if (person.state === 'idle' && economicSystem) {
        this.checkFoodBuildingArrival(person, tower, economicSystem);
      }
      
      // Decay stress when at destination (idle)
      if (person.state === 'idle' && person.stress > 0) {
        person.decayStress(0.1); // Slow decay
      }
    }
    
    // Handle elevator boarding (track wait times)
    this.handleElevatorBoarding(elevatorSystem, currentTick);
    
    // Handle elevator exiting
    this.handleElevatorExiting(elevatorSystem);
    
    // Remove people who have left
    this.cleanupLeavingPeople(tower);
  }
  
  /**
   * Check for scheduled events (arrivals, departures, lunch)
   */
  private checkScheduledEvents(tower: Tower, clock: GameClock, elevatorSystem: ElevatorSystem): void {
    const currentTime = {
      day: clock.gameDay,
      hour: clock.gameHour,
      minute: clock.gameMinute,
    };
    
    // Only check once per game-minute
    if (
      this.lastScheduleCheck &&
      this.lastScheduleCheck.day === currentTime.day &&
      this.lastScheduleCheck.hour === currentTime.hour &&
      this.lastScheduleCheck.minute === currentTime.minute
    ) {
      return;
    }
    
    this.lastScheduleCheck = currentTime;
    
    // Check each person's schedule
    for (const person of this.people.values()) {
      for (const event of person.schedule.events) {
        if (event.hour === clock.gameHour && event.minute === clock.gameMinute) {
          // Check weekday/weekend restrictions
          const isWeekday = clock.gameDay >= 1 && clock.gameDay <= 5;
          if (event.weekdayOnly && !isWeekday) continue;
          if (event.weekendOnly && isWeekday) continue;
          
          this.handleScheduledEvent(person, event, tower, elevatorSystem);
        }
      }
    }
  }
  
  /**
   * Handle a scheduled event for a person
   */
  private handleScheduledEvent(
    person: Person,
    event: ScheduleEvent,
    tower: Tower,
    elevatorSystem: ElevatorSystem
  ): void {
    switch (event.action) {
      case 'arrive':
        // Person arrives at tower - find their destination
        if (person.destinationBuildingId) {
          const building = tower.buildingsById[person.destinationBuildingId];
          if (building) {
            this.navigateTo(person, building.position.floor, building.position.startTile + 1, tower, elevatorSystem);
          }
        }
        break;
        
      case 'leave':
        // Person leaves the tower
        person.state = 'leaving';
        break;
        
      case 'lunch':
        // Worker goes to find food
        this.findNearbyFood(person, tower, elevatorSystem);
        break;
        
      case 'return':
        // Worker returns to office after lunch
        if (person.destinationBuildingId) {
          const building = tower.buildingsById[person.destinationBuildingId];
          if (building) {
            this.navigateTo(person, building.position.floor, building.position.startTile + 1, tower, elevatorSystem);
          }
        }
        break;
    }
  }
  
  /**
   * Check if person has arrived at a food building and register customer visit
   */
  private checkFoodBuildingArrival(person: Person, tower: Tower, economicSystem: any): void {
    // Only process workers during lunch time
    if (person.type !== 'worker') return;
    
    // Find if person is at a food building
    const buildings = Object.values(tower.buildingsById) as Building[];
    for (const building of buildings) {
      if ((building.type === 'fastFood' || building.type === 'restaurant') &&
          building.position.floor === person.currentFloor &&
          person.currentTile >= building.position.startTile &&
          person.currentTile <= building.position.endTile) {
        
        // Check if we haven't already registered this visit
        // Use a simple flag on the person to track if they've eaten this lunch
        if (!(person as any)._hasEatenLunch) {
          economicSystem.registerFoodCustomer(building.id);
          (person as any)._hasEatenLunch = true;
          
          // Reduce stress from eating
          person.decayStress(10);
          
          // 🧠 AI REACTION - Person ate food!
          const quality = building.type === 'restaurant' ? 'fine' : 'fast';
          this.populationAI.onPersonAteFood(person.id, building.id, quality);
          person.reactPositive('ate_food');
          
          console.log(`🍔 ${person.name} visited ${building.type} at floor ${building.position.floor}`);
        }
        break;
      }
    }
  }

  /**
   * Find nearby food for a person
   */
  private findNearbyFood(person: Person, tower: Tower, elevatorSystem: ElevatorSystem): void {
    // Reset lunch flag when starting lunch
    (person as any)._hasEatenLunch = false;
    const buildings = Object.values(tower.buildingsById) as Building[];
    const foodBuildings = buildings.filter(
      b => b.type === 'fastFood' || b.type === 'restaurant'
    );
    
    if (foodBuildings.length === 0) {
      // No food available - add stress!
      person.stress = Math.min(100, person.stress + 5);
      return;
    }
    
    // Find closest reachable food
    let closestFood: Building | null = null;
    let closestDistance = Infinity;
    
    for (const food of foodBuildings) {
      const path = this.pathfinding.findPath(
        person.currentFloor,
        person.currentTile,
        food.position.floor,
        food.position.startTile + 1,
        tower,
        elevatorSystem
      );
      
      if (path.length > 0) {
        // Calculate path distance
        const distance = Math.abs(food.position.floor - person.currentFloor) * 10 +
                        Math.abs(food.position.startTile - person.currentTile);
        
        if (distance < closestDistance) {
          closestFood = food;
          closestDistance = distance;
        }
      }
    }
    
    if (closestFood) {
      this.navigateTo(person, closestFood.position.floor, closestFood.position.startTile + 1, tower, elevatorSystem);
    } else {
      // No reachable food - add stress
      person.stress = Math.min(100, person.stress + 10);
    }
  }
  
  /**
   * Navigate a person to a destination using pathfinding
   */
  private navigateTo(
    person: Person,
    targetFloor: number,
    targetTile: number,
    tower: Tower,
    elevatorSystem: ElevatorSystem
  ): void {
    const path = this.pathfinding.findPath(
      person.currentFloor,
      person.currentTile,
      targetFloor,
      targetTile,
      tower,
      elevatorSystem
    );
    
    if (path.length > 0) {
      person.followPath(path);
      
      // If path uses elevator, request it now
      for (const segment of path) {
        if (segment.type === 'elevator' && segment.elevatorShaftId) {
          // Note: requestElevator now handles direction automatically based on floors
          elevatorSystem.requestElevator(person.id, segment.startFloor, segment.endFloor, 0);
        }
      }
    } else {
      // No path found - add stress
      person.stress = Math.min(100, person.stress + 10);
    }
  }
  
  /**
   * Handle people boarding elevators when they arrive
   */
  private handleElevatorBoarding(elevatorSystem: ElevatorSystem, currentTick: number): void {
    const waitingPeople = Array.from(this.people.values()).filter(
      p => p.state === 'waitingForElevator'
    );
    
    // 🆕 BUG-016 FIX: Track which cars have boarded someone this tick
    const carsBoarded = new Set<string>();
    
    for (const person of waitingPeople) {
      const shaftId = person.getWaitingElevatorShaftId();
      if (shaftId === null) continue;
      
      const shaft = elevatorSystem.getShaft(shaftId);
      if (!shaft) continue;
      
      // Check each car in shaft
      for (const car of shaft.cars) {
        // Skip if this car already boarded someone this tick (prevents overlap)
        if (carsBoarded.has(car.id)) continue;
        
        const currentFloorInt = Math.floor(car.currentFloor);
        
        // Is car at person's floor with doors open?
        if (currentFloorInt === person.currentFloor && car.doorsOpen && car.canAcceptPassenger()) {
          const destinationFloor = person.getElevatorDestinationFloor();
          if (destinationFloor !== null) {
            // Board the car!
            if (car.boardPassenger(person.id, destinationFloor)) {
              carsBoarded.add(car.id); // Mark this car as boarded
              // Calculate wait time
              const waitTime = person.waitStartTick !== null ? currentTick - person.waitStartTick : 0;
              
              // Record wait time before boarding
              this.recordWaitTime(person, currentTick);
              
              // 🧠 AI REACTION - Person boarded elevator!
              this.populationAI.onPersonBoardedElevator(person.id, waitTime);
              
              // Visual feedback based on wait time
              const waitSeconds = waitTime / 60;
              if (waitSeconds < 5) {
                person.reactPositive('fast_elevator');
              } else if (waitSeconds > 20) {
                person.reactNegative('slow_elevator', waitSeconds > 60 ? 'critical' : 'major');
              }
              
              person.boardElevator(car.id);
            }
          }
        }
      }
    }
  }
  
  /**
   * Handle people exiting elevators when they reach destination
   */
  private handleElevatorExiting(elevatorSystem: ElevatorSystem): void {
    const ridingPeople = Array.from(this.people.values()).filter(
      p => p.state === 'ridingElevator' && p.currentElevatorId
    );
    
    for (const person of ridingPeople) {
      // Find their elevator car
      let foundCar = null;
      
      for (const shaft of elevatorSystem.getShafts()) {
        for (const car of shaft.cars) {
          if (car.id === person.currentElevatorId) {
            foundCar = car;
            break;
          }
        }
        if (foundCar) break;
      }
      
      if (!foundCar) continue;
      
      const destinationFloor = person.getElevatorDestinationFloor();
      if (destinationFloor === null) continue;
      
      const currentFloorInt = Math.floor(foundCar.currentFloor);
      
      // Has car reached destination with doors open?
      if (currentFloorInt === destinationFloor && foundCar.doorsOpen) {
        // Exit the car!
        foundCar.removePassenger(person.id);
        person.exitElevator(destinationFloor);
      }
    }
  }
  
  /**
   * Remove people who are leaving
   */
  private cleanupLeavingPeople(tower: Tower): void {
    for (const [id, person] of this.people) {
      if (person.state === 'leaving') {
        // Remove from building occupancy
        if (person.destinationBuildingId) {
          const building = tower.buildingsById[person.destinationBuildingId];
          if (building) {
            // Remove person ID from building's occupant list (prevents memory leak)
            building.occupantIds = building.occupantIds.filter(occupantId => occupantId !== id);
          }
        }
        
        // 🧠 Remove AI data
        this.populationAI.removePerson(id);
        
        this.people.delete(id);
        console.log(`👋 ${person.name} left the tower (final satisfaction: ${this.populationAI.getPersonAIData(id)?.satisfaction.overall ?? 'unknown'})`);
      }
    }
  }
  
  /**
   * Add a person to the simulation
   * 🆕 BUG-024 FIX: Enforce population cap at entry point
   */
  addPerson(person: Person): boolean {
    // Population cap guard (prevents exploits and performance issues)
    if (this.people.size >= MAX_POPULATION) {
      console.warn(`⚠️ Population cap reached (${MAX_POPULATION}). Cannot add person.`);
      return false;
    }
    
    this.people.set(person.id, person);
    return true;
  }
  
  /**
   * Remove a person from the simulation
   */
  removePerson(id: string): void {
    this.people.delete(id);
  }
  
  /**
   * Get people on a specific floor
   */
  getPeopleOnFloor(floor: number): Person[] {
    return this.getPeople().filter(p => p.currentFloor === floor);
  }
  
  /**
   * Get people in a specific building
   */
  getPeopleInBuilding(buildingId: string): Person[] {
    return this.getPeople().filter(p => p.destinationBuildingId === buildingId);
  }

  /**
   * Serialize population state for saving
   */
  serialize(): { people: any[]; nextPersonId: number; aiData: any } {
    const peopleArray = Array.from(this.people.values()).map(person => person.serialize());

    return {
      people: peopleArray,
      nextPersonId: 0, // Not tracked in Person class
      aiData: this.populationAI.serialize(), // 🧠 Save AI state
    };
  }

  /**
   * Deserialize population state from saved data
   */
  deserialize(data: { people: any[]; nextPersonId: number; aiData?: any }): void {
    this.people.clear();

    for (const personData of data.people) {
      const person = new Person({
        type: personData.type,
        floor: personData.currentFloor,
        tile: personData.currentTile,
        homeBuildingId: personData.homeBuildingId,
        schedule: personData.schedule || DEFAULT_SCHEDULES[personData.type as PersonType],
        name: personData.name,
        patience: personData.patience,
      });

      // Restore state
      person.state = personData.state;
      person.stress = personData.stress;
      person.destinationBuildingId = personData.destinationBuildingId;
      person.currentElevatorId = personData.currentElevatorId;
      person.currentPath = personData.currentPath || [];
      person.pathIndex = personData.pathIndex || 0;
      person.pathSegments = personData.pathSegments || [];
      person.currentSegmentIndex = personData.currentSegmentIndex || 0;
      person.waitStartTick = personData.waitStartTick || null;
      person.hasTransferred = personData.hasTransferred || false;
      
      // Restore personality
      person.mood = personData.mood || 1.0;
      person.currentThought = personData.currentThought || null;
      person.badMemories = personData.badMemories || [];

      this.people.set(person.id, person);
    }
    
    // 🧠 Restore AI state
    if (data.aiData) {
      this.populationAI.deserialize(data.aiData);
    }
  }

  /**
   * Record elevator wait time when someone boards
   */
  recordWaitTime(person: Person, currentTick: number): void {
    if (person.waitStartTick !== null) {
      const waitTime = currentTick - person.waitStartTick;
      this.waitTimes.push(waitTime);
      
      // Keep only recent wait times
      if (this.waitTimes.length > this.maxWaitTimeHistory) {
        this.waitTimes.shift();
      }
    }
  }

  /**
   * Get average wait time in seconds
   */
  getAverageWaitTime(): number {
    if (this.waitTimes.length === 0) return 0;
    
    const totalTicks = this.waitTimes.reduce((sum, t) => sum + t, 0);
    const averageTicks = totalTicks / this.waitTimes.length;
    
    // Convert ticks to seconds (60 ticks = 1 second)
    return averageTicks / 60;
  }

  /**
   * Get wait time status (normal, warning, critical)
   */
  getWaitTimeStatus(): 'normal' | 'warning' | 'critical' {
    const avgWait = this.getAverageWaitTime();
    
    if (avgWait > 60) return 'critical'; // > 1 minute
    if (avgWait > 30) return 'warning';  // > 30 seconds
    return 'normal';
  }

  /**
   * Get count of people currently waiting for elevators
   */
  getWaitingCount(): number {
    return this.getPeople().filter(p => p.state === 'waitingForElevator').length;
  }
  
  // ========================================
  // 🧠 AI INTEGRATION - POPULATION INSIGHTS
  // ========================================
  
  /**
   * Get population consequences (happiness, immigration, star rating effects)
   */
  getPopulationConsequences() {
    return this.populationAI.getConsequences(this.getPeople());
  }
  
  /**
   * Get average satisfaction across all people (0-100)
   */
  getAverageSatisfaction(): number {
    return this.populationAI.getAverageSatisfaction();
  }
  
  /**
   * Get happiness percentage (for star rating calculation)
   */
  getHappinessPercent(): number {
    const consequences = this.getPopulationConsequences();
    const total = this.people.size || 1;
    return ((consequences.happyPeopleCount + consequences.satisfiedPeopleCount) / total) * 100;
  }
  
  /**
   * Get AI data for a specific person (for debugging/UI)
   */
  getPersonAI(personId: string) {
    return this.populationAI.getPersonAIData(personId);
  }
  
  /**
   * Spawn a new person with AI initialization
   */
  spawnPersonWithAI(config: {
    type: PersonType;
    floor: number;
    tile: number;
    homeBuildingId?: string;
    schedule: DailySchedule;
  }): Person {
    const person = new Person(config);
    this.populationAI.initializePerson(person);
    this.people.set(person.id, person);
    return person;
  }
}
