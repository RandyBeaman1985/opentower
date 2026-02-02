/**
 * PopulationAI - Makes people ALIVE in OpenTower
 * 
 * SimTower-style AI with needs, wants, satisfaction, and consequences.
 * People aren't just sprites — they're LIVING beings with desires and opinions.
 * 
 * @module simulation/PopulationAI
 */

import type { Person } from '@/entities/Person';
import type { Tower, Building, GameClock } from '@/interfaces';
import type { ElevatorSystem } from './ElevatorSystem';
import { PathfindingSystem } from './PathfindingSystem';

/**
 * Person needs system (like The Sims)
 */
export interface PersonNeeds {
  hunger: number;      // 0-100 (0 = starving, 100 = full)
  energy: number;      // 0-100 (0 = exhausted, 100 = energized)
  comfort: number;     // 0-100 (0 = miserable, 100 = comfortable)
  social: number;      // 0-100 (0 = lonely, 100 = fulfilled)
  bladder: number;     // 0-100 (0 = urgent, 100 = fine) - for future restroom system
}

/**
 * Person satisfaction tracking
 */
export interface PersonSatisfaction {
  overall: number;           // 0-100 (determines if they stay/leave)
  elevatorWaitRating: number; // 0-5 stars
  facilitiesRating: number;   // 0-5 stars
  commuteRating: number;      // 0-5 stars
  
  // History
  totalElevatorWaits: number;
  totalElevatorWaitTime: number; // in ticks
  lastComplaint: string | null;
  complaintCount: number;
}

/**
 * Person personality (affects behavior)
 */
export interface PersonPersonality {
  patience: number;      // 0-100 (how long they'll wait)
  sociability: number;   // 0-100 (how much they interact)
  cleanliness: number;   // 0-100 (how much they care about facilities)
  optimism: number;      // 0-100 (affects satisfaction decay)
}

/**
 * Extended person data managed by PopulationAI
 */
export interface PersonAIData {
  personId: string;
  needs: PersonNeeds;
  satisfaction: PersonSatisfaction;
  personality: PersonPersonality;
  
  // Decision state
  currentGoal: 'work' | 'eat' | 'rest' | 'home' | 'shopping' | 'entertainment' | null;
  goalStartTick: number | null;
  lastDecisionTick: number;
  
  // Memory
  favoriteRestaurant: string | null;
  knownElevatorShafts: string[]; // Learned elevator locations
  badExperienceBuildings: string[]; // Buildings to avoid
}

/**
 * Consequence system - what happens based on satisfaction
 */
interface PopulationConsequences {
  happyPeopleCount: number;
  satisfiedPeopleCount: number;
  unhappyPeopleCount: number;
  criticallyUnhappyCount: number;
  
  // Effects
  immigrationBonus: number;    // -50% to +100% immigration rate
  rentIncomeMultiplier: number; // 0.5x to 1.5x rent income
  starRatingPenalty: number;    // 0 to -2 stars
  
  // Events
  pendingComplaints: string[];
  pendingLeaves: string[]; // People about to rage-quit
}

/**
 * PopulationAI - The brain behind every person
 */
export class PopulationAI {
  private personData: Map<string, PersonAIData> = new Map();
  private pathfinding: PathfindingSystem = new PathfindingSystem();
  
  // Decision-making config
  private readonly DECISION_INTERVAL = 60; // Make decisions every 60 ticks (1 second)
  private readonly NEED_DECAY_RATE = 0.05; // Needs decay slowly over time
  private readonly SATISFACTION_DECAY_RATE = 0.01; // Satisfaction naturally decays
  
  // Thresholds for behavior
  private readonly HUNGER_URGENT_THRESHOLD = 30;
  private readonly ENERGY_URGENT_THRESHOLD = 20;
  private readonly SATISFACTION_UNHAPPY_THRESHOLD = 40;
  private readonly SATISFACTION_LEAVING_THRESHOLD = 20;
  
  /**
   * Initialize AI data for a new person
   */
  initializePerson(person: Person): void {
    const personality = this.generatePersonality();
    
    this.personData.set(person.id, {
      personId: person.id,
      needs: {
        hunger: 70 + Math.random() * 30, // Start somewhat full
        energy: 60 + Math.random() * 40, // Start with decent energy
        comfort: 80 + Math.random() * 20,
        social: 50 + Math.random() * 50,
        bladder: 100, // Start fine
      },
      satisfaction: {
        overall: 70, // Start optimistic
        elevatorWaitRating: 5,
        facilitiesRating: 5,
        commuteRating: 5,
        totalElevatorWaits: 0,
        totalElevatorWaitTime: 0,
        lastComplaint: null,
        complaintCount: 0,
      },
      personality,
      currentGoal: null,
      goalStartTick: null,
      lastDecisionTick: 0,
      favoriteRestaurant: null,
      knownElevatorShafts: [],
      badExperienceBuildings: [],
    });
  }
  
  /**
   * Generate random personality
   */
  private generatePersonality(): PersonPersonality {
    return {
      patience: 30 + Math.random() * 70,
      sociability: 20 + Math.random() * 80,
      cleanliness: 40 + Math.random() * 60,
      optimism: 30 + Math.random() * 70,
    };
  }
  
  /**
   * Update AI for a single person
   */
  updatePerson(
    person: Person,
    currentTick: number,
    tower: Tower,
    clock: GameClock,
    elevatorSystem: ElevatorSystem
  ): void {
    let aiData = this.personData.get(person.id);
    
    // Initialize if needed
    if (!aiData) {
      this.initializePerson(person);
      aiData = this.personData.get(person.id)!;
    }
    
    // Update needs (natural decay)
    this.updateNeeds(aiData, person, currentTick);
    
    // Update satisfaction based on current state
    this.updateSatisfaction(aiData, person, currentTick, tower);
    
    // Make decisions based on needs/wants
    if (currentTick - aiData.lastDecisionTick >= this.DECISION_INTERVAL) {
      this.makeDecision(aiData, person, tower, clock, elevatorSystem, currentTick);
      aiData.lastDecisionTick = currentTick;
    }
    
    // Check for critical unhappiness (leaving)
    this.checkLeavingConditions(aiData, person, tower);
  }
  
  /**
   * Update person's needs over time
   */
  private updateNeeds(aiData: PersonAIData, person: Person, currentTick: number): void {
    const needs = aiData.needs;
    const gameSpeed = 1; // TODO: Get from clock
    
    // Decay needs based on activity
    switch (person.state) {
      case 'walking':
        needs.energy -= this.NEED_DECAY_RATE * 1.5 * gameSpeed; // Walking is tiring
        needs.hunger -= this.NEED_DECAY_RATE * gameSpeed;
        break;
        
      case 'waitingForElevator':
        needs.comfort -= this.NEED_DECAY_RATE * 2 * gameSpeed; // Waiting is uncomfortable
        needs.hunger -= this.NEED_DECAY_RATE * gameSpeed;
        break;
        
      case 'idle':
        // At destination - recover comfort
        needs.comfort += 0.1 * gameSpeed;
        needs.hunger -= this.NEED_DECAY_RATE * 0.5 * gameSpeed;
        break;
        
      case 'ridingElevator':
        // Neutral state
        needs.hunger -= this.NEED_DECAY_RATE * 0.5 * gameSpeed;
        break;
    }
    
    // Clamp needs
    needs.hunger = Math.max(0, Math.min(100, needs.hunger));
    needs.energy = Math.max(0, Math.min(100, needs.energy));
    needs.comfort = Math.max(0, Math.min(100, needs.comfort));
    needs.social = Math.max(0, Math.min(100, needs.social));
    needs.bladder = Math.max(0, Math.min(100, needs.bladder));
  }
  
  /**
   * Update satisfaction based on experiences
   */
  private updateSatisfaction(
    aiData: PersonAIData,
    person: Person,
    currentTick: number,
    tower: Tower
  ): void {
    const sat = aiData.satisfaction;
    
    // Track elevator wait times
    if (person.state === 'waitingForElevator' && person.waitStartTick !== null) {
      const waitTime = currentTick - person.waitStartTick;
      
      // Update elevator rating based on wait
      if (waitTime > 600) { // > 10 seconds
        sat.elevatorWaitRating = Math.max(1, sat.elevatorWaitRating - 0.1);
      } else if (waitTime > 300) { // > 5 seconds
        sat.elevatorWaitRating = Math.max(2, sat.elevatorWaitRating - 0.05);
      }
    }
    
    // Rate facilities based on needs fulfillment
    if (aiData.needs.hunger < 30 && aiData.currentGoal === 'eat') {
      // Hungry but trying to eat - check if food is available
      const hasFood = this.findNearbyFood(person, tower).length > 0;
      if (!hasFood) {
        sat.facilitiesRating = Math.max(1, sat.facilitiesRating - 0.2);
        if (sat.lastComplaint !== 'no_food' && Math.random() < 0.1) {
          sat.lastComplaint = 'no_food';
          sat.complaintCount++;
          console.log(`😤 ${person.type} complains: "There's nowhere to eat!"`);
        }
      }
    }
    
    // Calculate overall satisfaction (weighted average)
    sat.overall = (
      sat.elevatorWaitRating * 20 +
      sat.facilitiesRating * 20 +
      sat.commuteRating * 15 +
      (aiData.needs.hunger * 0.15) +
      (aiData.needs.comfort * 0.15) +
      (aiData.needs.energy * 0.15)
    );
    
    // Personality affects satisfaction decay
    const pessimismDecay = (100 - aiData.personality.optimism) * 0.0001;
    sat.overall = Math.max(0, sat.overall - pessimismDecay);
  }
  
  /**
   * Make decisions based on needs and goals
   */
  private makeDecision(
    aiData: PersonAIData,
    person: Person,
    tower: Tower,
    clock: GameClock,
    elevatorSystem: ElevatorSystem,
    currentTick: number
  ): void {
    // Only make decisions when idle or completing goals
    if (person.state !== 'idle') return;
    
    // Prioritize urgent needs
    const needs = aiData.needs;
    
    // URGENT: Hunger
    if (needs.hunger < this.HUNGER_URGENT_THRESHOLD) {
      if (aiData.currentGoal !== 'eat') {
        console.log(`🍔 ${person.type} is HUNGRY (${needs.hunger.toFixed(0)}%) - seeking food`);
        aiData.currentGoal = 'eat';
        aiData.goalStartTick = currentTick;
        this.seekFood(person, tower, elevatorSystem, aiData);
        return;
      }
    }
    
    // URGENT: Energy (go home/rest)
    if (needs.energy < this.ENERGY_URGENT_THRESHOLD && person.type === 'resident') {
      if (aiData.currentGoal !== 'rest') {
        console.log(`😴 ${person.type} is EXHAUSTED (${needs.energy.toFixed(0)}%) - going home`);
        aiData.currentGoal = 'rest';
        aiData.goalStartTick = currentTick;
        this.goHome(person, tower, elevatorSystem);
        return;
      }
    }
    
    // Check scheduled activities (work, lunch, etc.)
    const scheduledAction = this.checkSchedule(person, clock);
    if (scheduledAction) {
      this.executeScheduledAction(person, scheduledAction, tower, elevatorSystem, aiData);
      return;
    }
    
    // Random activities when satisfied
    if (person.state === 'idle' && Math.random() < 0.01) {
      // 1% chance per decision to do something random
      this.doRandomActivity(person, tower, elevatorSystem, aiData);
    }
  }
  
  /**
   * Check if person's schedule has an event now
   */
  private checkSchedule(person: Person, clock: GameClock): string | null {
    for (const event of person.schedule.events) {
      if (event.hour === clock.gameHour && event.minute === clock.gameMinute) {
        const isWeekday = clock.gameDay >= 1 && clock.gameDay <= 5;
        if (event.weekdayOnly && !isWeekday) continue;
        if (event.weekendOnly && isWeekday) continue;
        
        return event.action;
      }
    }
    return null;
  }
  
  /**
   * Execute a scheduled action
   */
  private executeScheduledAction(
    person: Person,
    action: string,
    tower: Tower,
    elevatorSystem: ElevatorSystem,
    aiData: PersonAIData
  ): void {
    switch (action) {
      case 'arrive':
        aiData.currentGoal = 'work';
        // Navigate to work building
        if (person.destinationBuildingId) {
          const building = tower.buildingsById[person.destinationBuildingId];
          if (building) {
            this.navigateTo(person, building, tower, elevatorSystem);
          }
        }
        break;
        
      case 'lunch':
        aiData.currentGoal = 'eat';
        aiData.needs.hunger = Math.min(50, aiData.needs.hunger); // Make hungry
        this.seekFood(person, tower, elevatorSystem, aiData);
        break;
        
      case 'return':
        aiData.currentGoal = 'work';
        if (person.destinationBuildingId) {
          const building = tower.buildingsById[person.destinationBuildingId];
          if (building) {
            this.navigateTo(person, building, tower, elevatorSystem);
          }
        }
        break;
        
      case 'leave':
        aiData.currentGoal = 'home';
        person.state = 'leaving';
        break;
    }
  }
  
  /**
   * Seek food - find and navigate to nearest restaurant
   */
  private seekFood(
    person: Person,
    tower: Tower,
    elevatorSystem: ElevatorSystem,
    aiData: PersonAIData
  ): void {
    const foodBuildings = this.findNearbyFood(person, tower);
    
    if (foodBuildings.length === 0) {
      // No food available - increase stress!
      person.stress = Math.min(100, person.stress + 10);
      aiData.satisfaction.facilitiesRating = Math.max(1, aiData.satisfaction.facilitiesRating - 0.5);
      return;
    }
    
    // Prefer favorite restaurant if known
    let targetFood = foodBuildings[0];
    if (aiData.favoriteRestaurant) {
      const favorite = foodBuildings.find(b => b.id === aiData.favoriteRestaurant);
      if (favorite) targetFood = favorite;
    } else {
      // Pick a random one to try (becomes favorite if good experience)
      targetFood = foodBuildings[Math.floor(Math.random() * foodBuildings.length)];
    }
    
    this.navigateTo(person, targetFood, tower, elevatorSystem);
  }
  
  /**
   * Find nearby food buildings
   */
  private findNearbyFood(person: Person, tower: Tower): Building[] {
    const buildings = Object.values(tower.buildingsById) as Building[];
    return buildings.filter(b => b.type === 'fastFood' || b.type === 'restaurant')
      .sort((a, b) => {
        // Sort by distance
        const distA = Math.abs(a.position.floor - person.currentFloor) * 10 +
                     Math.abs(a.position.startTile - person.currentTile);
        const distB = Math.abs(b.position.floor - person.currentFloor) * 10 +
                     Math.abs(b.position.startTile - person.currentTile);
        return distA - distB;
      });
  }
  
  /**
   * Go home (for residents)
   */
  private goHome(person: Person, tower: Tower, elevatorSystem: ElevatorSystem): void {
    if (!person.homeBuildingId) return;
    
    const home = tower.buildingsById[person.homeBuildingId];
    if (home) {
      this.navigateTo(person, home, tower, elevatorSystem);
    }
  }
  
  /**
   * Do a random activity (shopping, entertainment, etc.)
   */
  private doRandomActivity(
    person: Person,
    tower: Tower,
    elevatorSystem: ElevatorSystem,
    aiData: PersonAIData
  ): void {
    const activities = ['shopping', 'entertainment'];
    const activity = activities[Math.floor(Math.random() * activities.length)];
    
    const buildings = Object.values(tower.buildingsById) as Building[];
    let targets: Building[] = [];
    
    if (activity === 'shopping') {
      targets = buildings.filter(b => b.type === 'shop');
    } else if (activity === 'entertainment') {
      targets = buildings.filter(b => b.type === 'partyHall' || b.type === 'cinema');
    }
    
    if (targets.length > 0) {
      const target = targets[Math.floor(Math.random() * targets.length)];
      aiData.currentGoal = activity as any;
      this.navigateTo(person, target, tower, elevatorSystem);
    }
  }
  
  /**
   * Navigate to a building
   */
  private navigateTo(
    person: Person,
    building: Building,
    tower: Tower,
    elevatorSystem: ElevatorSystem
  ): void {
    const path = this.pathfinding.findPath(
      person.currentFloor,
      person.currentTile,
      building.position.floor,
      building.position.startTile + 1,
      tower,
      elevatorSystem
    );
    
    if (path.length > 0) {
      person.followPath(path);
      
      // Request elevator if needed
      for (const segment of path) {
        if (segment.type === 'elevator' && segment.elevatorShaftId) {
          // Note: requestElevator now handles direction automatically based on floors
          elevatorSystem.requestElevator(person.id, segment.startFloor, segment.endFloor, 0);
        }
      }
    } else {
      // No path found - very frustrating!
      person.stress = Math.min(100, person.stress + 15);
      const aiData = this.personData.get(person.id);
      if (aiData) {
        aiData.satisfaction.overall = Math.max(0, aiData.satisfaction.overall - 10);
        aiData.satisfaction.commuteRating = Math.max(1, aiData.satisfaction.commuteRating - 1);
      }
    }
  }
  
  /**
   * Check if person is unhappy enough to leave
   */
  private checkLeavingConditions(aiData: PersonAIData, person: Person, tower: Tower): void {
    const sat = aiData.satisfaction;
    
    // Critical unhappiness - RAGE QUIT
    if (sat.overall < this.SATISFACTION_LEAVING_THRESHOLD) {
      if (Math.random() < 0.05) { // 5% chance per check
        console.log(`😡 ${person.type} is FED UP (satisfaction: ${sat.overall.toFixed(0)}%) and LEAVING!`);
        console.log(`   Complaints: ${sat.complaintCount}, Last: "${sat.lastComplaint}"`);
        person.state = 'leaving';
        
        // Remove from building occupancy
        if (person.destinationBuildingId) {
          const building = tower.buildingsById[person.destinationBuildingId];
          if (building) {
            building.occupantIds = building.occupantIds.filter(id => id !== person.id);
          }
        }
      }
    }
  }
  
  /**
   * Get population consequences - affects tower economy and rating
   */
  getConsequences(people: Person[]): PopulationConsequences {
    let happyCount = 0;
    let satisfiedCount = 0;
    let unhappyCount = 0;
    let criticalCount = 0;
    
    const complaints: string[] = [];
    const pendingLeaves: string[] = [];
    
    for (const person of people) {
      const aiData = this.personData.get(person.id);
      if (!aiData) continue;
      
      const sat = aiData.satisfaction.overall;
      
      if (sat >= 80) happyCount++;
      else if (sat >= 60) satisfiedCount++;
      else if (sat >= 40) unhappyCount++;
      else {
        criticalCount++;
        if (sat < this.SATISFACTION_LEAVING_THRESHOLD) {
          pendingLeaves.push(person.id);
        }
      }
      
      // Collect recent complaints
      if (aiData.satisfaction.lastComplaint) {
        complaints.push(aiData.satisfaction.lastComplaint);
      }
    }
    
    const total = people.length || 1;
    const happyPercent = (happyCount / total) * 100;
    const unhappyPercent = ((unhappyCount + criticalCount) / total) * 100;
    
    // Calculate bonuses/penalties
    const immigrationBonus = (happyPercent - 50) * 2; // -100% to +100%
    const rentMultiplier = 0.5 + (happyPercent / 100); // 0.5x to 1.5x
    const starPenalty = unhappyPercent > 50 ? -2 : unhappyPercent > 30 ? -1 : 0;
    
    return {
      happyPeopleCount: happyCount,
      satisfiedPeopleCount: satisfiedCount,
      unhappyPeopleCount: unhappyCount,
      criticallyUnhappyCount: criticalCount,
      immigrationBonus,
      rentIncomeMultiplier: rentMultiplier,
      starRatingPenalty: starPenalty,
      pendingComplaints: Array.from(new Set(complaints)),
      pendingLeaves,
    };
  }
  
  /**
   * Handle person eating at restaurant (satisfaction boost)
   */
  onPersonAteFood(personId: string, buildingId: string, quality: 'fast' | 'fine'): void {
    const aiData = this.personData.get(personId);
    if (!aiData) return;
    
    // Restore hunger
    aiData.needs.hunger = Math.min(100, aiData.needs.hunger + (quality === 'fine' ? 60 : 40));
    
    // Boost satisfaction
    aiData.satisfaction.overall += 5;
    aiData.satisfaction.facilitiesRating = Math.min(5, aiData.satisfaction.facilitiesRating + 0.2);
    
    // Remember favorite
    if (quality === 'fine' && Math.random() < 0.3) {
      aiData.favoriteRestaurant = buildingId;
    }
    
    // Clear complaint
    if (aiData.satisfaction.lastComplaint === 'no_food') {
      aiData.satisfaction.lastComplaint = null;
    }
  }
  
  /**
   * Handle person boarding elevator (track wait time)
   */
  onPersonBoardedElevator(personId: string, waitTimeTicks: number): void {
    const aiData = this.personData.get(personId);
    if (!aiData) return;
    
    aiData.satisfaction.totalElevatorWaits++;
    aiData.satisfaction.totalElevatorWaitTime += waitTimeTicks;
    
    const waitSeconds = waitTimeTicks / 60;
    
    // Rate the experience
    if (waitSeconds < 5) {
      // Fast! Happy!
      aiData.satisfaction.elevatorWaitRating = Math.min(5, aiData.satisfaction.elevatorWaitRating + 0.1);
      aiData.satisfaction.overall += 2;
    } else if (waitSeconds > 30) {
      // Too long! Angry!
      aiData.satisfaction.elevatorWaitRating = Math.max(1, aiData.satisfaction.elevatorWaitRating - 0.5);
      aiData.satisfaction.overall = Math.max(0, aiData.satisfaction.overall - 5);
      
      if (Math.random() < 0.2) {
        aiData.satisfaction.lastComplaint = 'slow_elevators';
        aiData.satisfaction.complaintCount++;
        console.log(`😤 Person complains: "These elevators are SO SLOW!" (waited ${waitSeconds.toFixed(1)}s)`);
      }
    }
  }
  
  /**
   * Get AI data for a person (for debugging/UI)
   */
  getPersonAIData(personId: string): PersonAIData | undefined {
    return this.personData.get(personId);
  }
  
  /**
   * Remove AI data when person leaves
   */
  removePerson(personId: string): void {
    this.personData.delete(personId);
  }
  
  /**
   * Get average satisfaction across all people
   */
  getAverageSatisfaction(): number {
    if (this.personData.size === 0) return 100;
    
    let total = 0;
    for (const data of this.personData.values()) {
      total += data.satisfaction.overall;
    }
    
    return total / this.personData.size;
  }
  
  /**
   * Serialize AI state
   */
  serialize(): any {
    const data: any[] = [];
    for (const [id, aiData] of this.personData) {
      data.push({
        personId: id,
        needs: aiData.needs,
        satisfaction: aiData.satisfaction,
        personality: aiData.personality,
        currentGoal: aiData.currentGoal,
        goalStartTick: aiData.goalStartTick,
        lastDecisionTick: aiData.lastDecisionTick,
        favoriteRestaurant: aiData.favoriteRestaurant,
        knownElevatorShafts: aiData.knownElevatorShafts,
        badExperienceBuildings: aiData.badExperienceBuildings,
      });
    }
    return { personData: data };
  }
  
  /**
   * Deserialize AI state
   */
  deserialize(data: any): void {
    this.personData.clear();
    
    if (data.personData) {
      for (const item of data.personData) {
        this.personData.set(item.personId, item as PersonAIData);
      }
    }
  }
}
