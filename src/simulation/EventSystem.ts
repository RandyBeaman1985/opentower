/**
 * EventSystem - Classic SimTower Event Management
 * 
 * Implements the iconic events that made SimTower exciting:
 * - VIP Visit (required for TOWER status)
 * - Fire (emergency evacuation and containment)
 * - Bomb Threat (building-wide evacuation)
 * - Santa Event (December holiday surprise)
 * - Treasure Hunt (hidden rewards)
 * - Cockroach Infestation (hotel maintenance failure)
 * 
 * Events add unpredictability, challenge, and fun to the game!
 * 
 * @module simulation/EventSystem
 */

import type { Tower, GameEvent, GameEventType, GameEventState, Building } from '@/interfaces';
import { getEventBus } from '@core/EventBus';
import { generateUUID } from '@core/uuid';

/**
 * VIP visitor data (for TOWER status achievement)
 */
interface VIPVisitor {
  id: string;
  name: string;
  currentFloor: number;
  targetFloor: number;
  satisfied: boolean;
  waitTime: number; // Ticks waiting for elevator
  maxWaitTime: number; // Max acceptable wait time
  visitStartTick: number;
}

/**
 * Fire event data
 */
interface FireEvent {
  floor: number;
  buildingId: string;
  spreadChance: number; // % chance to spread per tick
  damagePerTick: number;
  evacuated: boolean;
}

/**
 * Treasure chest data
 */
interface TreasureChest {
  floor: number;
  tile: number;
  reward: number;
  discovered: boolean;
  spawnedAtTick: number;
}

/**
 * Santa event data (December only)
 */
interface SantaEvent {
  active: boolean;
  currentFloor: number;
  giftsDelivered: number;
  totalReward: number;
  startTick: number;
}

/**
 * Event System - Manages all game events
 */
export class EventSystem {
  private activeEvents: Map<string, GameEvent> = new Map();
  private lastEventTick: number = 0;
  private eventCooldownTicks: number = 7200; // ~2 minutes at 60 TPS
  
  // Event-specific state
  private vipVisitor: VIPVisitor | null = null;
  private fires: Map<string, FireEvent> = new Map();
  private bombThreatActive: boolean = false;
  private bombThreatIsReal: boolean = false;
  private bombThreatStartTick: number = 0;
  private treasureChest: TreasureChest | null = null;
  private santaEvent: SantaEvent | null = null;
  private cockroachInfestations: Set<string> = new Set(); // Building IDs
  
  // VIP status tracking
  private vipVisitsCompleted: number = 0;
  private vipVisitsFailed: number = 0;
  
  /**
   * Update event system (called every tick)
   */
  update(tower: Tower, currentTick: number): void {
    // Update active events
    this.updateActiveEvents(tower, currentTick);
    
    // Update VIP visitor
    if (this.vipVisitor) {
      this.updateVIPVisitor(tower, currentTick);
    }
    
    // Update fires
    if (this.fires.size > 0) {
      this.updateFires(tower, currentTick);
    }
    
    // Update bomb threat
    if (this.bombThreatActive) {
      this.updateBombThreat(tower, currentTick);
    }
    
    // Update Santa event
    if (this.santaEvent?.active) {
      this.updateSantaEvent(tower, currentTick);
    }
    
    // Check for new random events (with cooldown)
    if (currentTick - this.lastEventTick > this.eventCooldownTicks) {
      this.checkForRandomEvent(tower, currentTick);
    }
  }
  
  /**
   * Update all active events
   */
  private updateActiveEvents(tower: Tower, currentTick: number): void {
    for (const [eventId, event] of this.activeEvents) {
      const elapsed = currentTick - event.triggeredAt;
      
      // Check if event should end (3 minutes = 10800 ticks at 60 TPS)
      if (elapsed > 10800 && event.state !== 'resolved') {
        this.resolveEvent(eventId, tower, currentTick);
      }
    }
  }
  
  /**
   * Check if a random event should occur
   */
  private checkForRandomEvent(tower: Tower, currentTick: number): void {
    // Base probability: 8% chance per check
    if (Math.random() > 0.08) return;
    
    // Select random event based on star rating and season
    const eventType = this.selectRandomEventType(tower, currentTick);
    if (!eventType) return;
    
    this.triggerEvent(eventType, tower, currentTick);
    this.lastEventTick = currentTick;
  }
  
  /**
   * Select random event type based on tower state
   */
  private selectRandomEventType(tower: Tower, currentTick: number): GameEventType | null {
    const month = this.getCurrentMonth(currentTick, tower.clock);
    const starRating = tower.starRating;
    
    // December: Santa has high priority
    if (month === 12 && Math.random() < 0.5 && !this.santaEvent) {
      return 'santa';
    }
    
    // VIP visit (star 3+ required, and needed for TOWER status)
    if (starRating >= 3 && !tower.hasTowerStatus && !this.vipVisitor) {
      if (Math.random() < 0.25) return 'vip_visit';
    }
    
    // Weighted probabilities
    const events: { type: GameEventType; weight: number; minStar: number }[] = [
      { type: 'treasure_chest', weight: 30, minStar: 1 },
      { type: 'cockroaches', weight: 25, minStar: 1 },
      { type: 'fire', weight: 20, minStar: 2 },
      { type: 'bomb_threat', weight: 10, minStar: 3 },
    ];
    
    // Filter by star rating
    const validEvents = events.filter(e => starRating >= e.minStar);
    if (validEvents.length === 0) return null;
    
    // Weighted random selection
    const totalWeight = validEvents.reduce((sum, e) => sum + e.weight, 0);
    let roll = Math.random() * totalWeight;
    
    for (const event of validEvents) {
      roll -= event.weight;
      if (roll <= 0) return event.type;
    }
    
    return validEvents[0].type;
  }
  
  /**
   * Get current month from game clock
   */
  private getCurrentMonth(currentTick: number, clock: any): number {
    // Approximate: each quarter = 3 months
    const quarter = Math.floor(currentTick / (60 * 60 * 24 * 90)) % 4; // 90 days per quarter
    return (quarter * 3) + 1; // 1, 4, 7, 10 (simplified)
  }
  
  /**
   * Trigger a specific event
   */
  triggerEvent(type: GameEventType, tower: Tower, currentTick: number): void {
    const eventId = generateUUID();
    
    let event: GameEvent = {
      id: eventId,
      type,
      state: 'active',
      triggeredAt: currentTick,
      affectedFloors: [],
      affectedBuildingIds: [],
      data: {},
    };
    
    switch (type) {
      case 'vip_visit':
        event = this.createVIPVisitEvent(tower, currentTick, eventId);
        break;
      case 'fire':
        event = this.createFireEvent(tower, currentTick, eventId);
        break;
      case 'bomb_threat':
        event = this.createBombThreatEvent(tower, currentTick, eventId);
        break;
      case 'santa':
        event = this.createSantaEvent(tower, currentTick, eventId);
        break;
      case 'treasure_chest':
        event = this.createTreasureEvent(tower, currentTick, eventId);
        break;
      case 'cockroaches':
        event = this.createCockroachEvent(tower, currentTick, eventId);
        break;
    }
    
    this.activeEvents.set(eventId, event);
    
    // Emit event to game
    getEventBus().emitSync({
      type: 'RANDOM_EVENT',
      timestamp: Date.now(),
      data: { event }
    } as any);
    
    console.log(`🎲 EVENT TRIGGERED: ${type.toUpperCase()}`);
  }
  
  // ========================================
  // VIP VISIT EVENT
  // ========================================
  
  /**
   * Create VIP visit event (required for TOWER status!)
   */
  private createVIPVisitEvent(tower: Tower, currentTick: number, eventId: string): GameEvent {
    const floorLevels = Object.keys(tower.floorsById).map(Number);
    const maxFloor = Math.max(...floorLevels);
    const minFloor = Math.min(...floorLevels);
    
    const vipNames = [
      'The President',
      'Famous Actor',
      'Tech Billionaire',
      'Pop Star',
      'Royal Family Member',
      'World Leader',
    ];
    
    this.vipVisitor = {
      id: generateUUID(),
      name: vipNames[Math.floor(Math.random() * vipNames.length)],
      currentFloor: 1, // Always starts at ground floor
      targetFloor: Math.floor(minFloor + Math.random() * (maxFloor - minFloor)),
      satisfied: true,
      waitTime: 0,
      maxWaitTime: 300, // 5 seconds at 60 TPS (VIPs are VERY impatient!)
      visitStartTick: currentTick,
    };
    
    getEventBus().emitSync({
      type: 'VIP_ARRIVED',
      vipId: this.vipVisitor.id,
    });
    
    console.log(`👑 VIP ARRIVED: ${this.vipVisitor.name}`);
    console.log(`   Going to floor ${this.vipVisitor.targetFloor}`);
    console.log(`   ⚠️ MUST have fast elevator service or TOWER status will be denied!`);
    
    return {
      id: eventId,
      type: 'vip_visit',
      state: 'active',
      triggeredAt: currentTick,
      affectedFloors: [1, this.vipVisitor.targetFloor],
      affectedBuildingIds: [],
      data: {
        vipName: this.vipVisitor.name,
        targetFloor: this.vipVisitor.targetFloor,
      },
    };
  }
  
  /**
   * Update VIP visitor behavior
   */
  private updateVIPVisitor(tower: Tower, currentTick: number): void {
    if (!this.vipVisitor) return;
    
    this.vipVisitor.waitTime++;
    
    // Check if VIP is waiting too long
    if (this.vipVisitor.waitTime > this.vipVisitor.maxWaitTime) {
      this.vipVisitor.satisfied = false;
      this.endVIPVisit(tower, currentTick, false);
      return;
    }
    
    // Simulate elevator ride (simplified - actual implementation needs ElevatorSystem integration)
    const elapsed = currentTick - this.vipVisitor.visitStartTick;
    if (elapsed > 600) { // 10 seconds = successful visit
      this.endVIPVisit(tower, currentTick, true);
    }
  }
  
  /**
   * End VIP visit (success or failure)
   */
  private endVIPVisit(tower: Tower, currentTick: number, satisfied: boolean): void {
    if (!this.vipVisitor) return;
    
    const event = Array.from(this.activeEvents.values()).find(e => e.type === 'vip_visit');
    
    if (satisfied) {
      console.log(`✅ VIP SATISFIED! ${this.vipVisitor.name} enjoyed the visit.`);
      console.log(`   🏆 TOWER STATUS UNLOCKED!`);
      tower.hasTowerStatus = true;
      this.vipVisitsCompleted++;
      
      // Bonus reward
      tower.funds += 100000;
      console.log(`   💰 Bonus: +$100,000`);
    } else {
      console.log(`❌ VIP UNHAPPY! ${this.vipVisitor.name} waited too long for elevator.`);
      console.log(`   TOWER status denied. Try again later.`);
      this.vipVisitsFailed++;
    }
    
    getEventBus().emitSync({
      type: 'VIP_DEPARTED',
      vipId: this.vipVisitor.id,
      satisfied,
    });
    
    if (event) {
      this.resolveEvent(event.id, tower, currentTick);
    }
    
    this.vipVisitor = null;
  }
  
  // ========================================
  // FIRE EVENT
  // ========================================
  
  /**
   * Create fire event (emergency!)
   */
  private createFireEvent(tower: Tower, currentTick: number, eventId: string): GameEvent {
    const buildings = Object.values(tower.buildingsById);
    if (buildings.length === 0) return this.createDummyEvent(eventId, 'fire', currentTick);
    
    // Pick random building
    const building = buildings[Math.floor(Math.random() * buildings.length)] as Building;
    const floor = building.position.floor;
    
    const fireData: FireEvent = {
      floor,
      buildingId: building.id,
      spreadChance: 0.05, // 5% chance to spread per tick
      damagePerTick: 100,
      evacuated: false,
    };
    
    this.fires.set(building.id, fireData);
    
    getEventBus().emitSync({
      type: 'FIRE_STARTED',
      floor,
      buildingId: building.id,
    });
    
    console.log(`🔥 FIRE STARTED on floor ${floor}!`);
    console.log(`   Building: ${building.type}`);
    console.log(`   ⚠️ Evacuate people and contain the fire!`);
    
    return {
      id: eventId,
      type: 'fire',
      state: 'active',
      triggeredAt: currentTick,
      affectedFloors: [floor],
      affectedBuildingIds: [building.id],
      data: fireData as unknown as Record<string, unknown>,
    };
  }
  
  /**
   * Update active fires
   */
  private updateFires(tower: Tower, currentTick: number): void {
    for (const [buildingId, fireData] of this.fires) {
      // Apply damage
      const building = tower.buildingsById[buildingId];
      if (building) {
        // Apply building health damage (via healthSystem if available)
        if ((tower as any).healthSystem) {
          (tower as any).healthSystem.damageBuilding(
            buildingId,
            fireData.damagePerTick,
            'fire',
            currentTick
          );
        } else {
          // Fallback: damage funds directly (old behavior)
          tower.funds -= fireData.damagePerTick * 100;
        }
      }
      
      // Check for spread
      if (Math.random() < fireData.spreadChance) {
        // Fire spreads to adjacent building (simplified)
        console.log(`🔥 Fire spreading on floor ${fireData.floor}!`);
      }
      
      // Auto-extinguish after 30 seconds (simplified - needs fire containment system)
      const event = Array.from(this.activeEvents.values()).find(
        e => e.type === 'fire' && e.affectedBuildingIds.includes(buildingId)
      );
      
      if (event && currentTick - event.triggeredAt > 1800) { // 30 seconds
        this.extinguishFire(buildingId, tower, currentTick);
      }
    }
  }
  
  /**
   * Extinguish a fire
   */
  private extinguishFire(buildingId: string, tower: Tower, currentTick: number): void {
    const fireData = this.fires.get(buildingId);
    if (!fireData) return;
    
    const extinguishCost = 5000;
    tower.funds -= extinguishCost;
    
    this.fires.delete(buildingId);
    
    getEventBus().emitSync({
      type: 'FIRE_EXTINGUISHED',
      floor: fireData.floor,
      cost: extinguishCost,
    });
    
    console.log(`🧯 Fire extinguished on floor ${fireData.floor}`);
    console.log(`   Cost: $${extinguishCost.toLocaleString()}`);
    
    // Resolve event
    const event = Array.from(this.activeEvents.values()).find(
      e => e.type === 'fire' && e.affectedBuildingIds.includes(buildingId)
    );
    if (event) {
      this.resolveEvent(event.id, tower, currentTick);
    }
  }
  
  // ========================================
  // BOMB THREAT EVENT
  // ========================================
  
  /**
   * Create bomb threat event (major evacuation!)
   */
  private createBombThreatEvent(tower: Tower, currentTick: number, eventId: string): GameEvent {
    this.bombThreatActive = true;
    this.bombThreatIsReal = Math.random() < 0.3; // 30% chance it's real
    this.bombThreatStartTick = currentTick;
    
    const allFloors = Object.keys(tower.floorsById).map(Number);
    
    getEventBus().emitSync({
      type: 'BOMB_THREAT_STARTED',
      evacuationStarted: true,
    });
    
    console.log(`💣 BOMB THREAT! Anonymous call received.`);
    console.log(`   ⚠️ EVACUATE ENTIRE BUILDING IMMEDIATELY!`);
    console.log(`   Could be real or a hoax...`);
    
    return {
      id: eventId,
      type: 'bomb_threat',
      state: 'active',
      triggeredAt: currentTick,
      affectedFloors: allFloors,
      affectedBuildingIds: Object.keys(tower.buildingsById),
      data: {
        isReal: this.bombThreatIsReal,
        evacuationStarted: true,
      },
    };
  }
  
  /**
   * Update bomb threat
   */
  private updateBombThreat(tower: Tower, currentTick: number): void {
    const elapsed = currentTick - this.bombThreatStartTick;
    
    // Resolve after 1 minute
    if (elapsed > 3600) {
      this.resolveBombThreat(tower, currentTick);
    }
  }
  
  /**
   * Resolve bomb threat (real or hoax)
   */
  private resolveBombThreat(tower: Tower, currentTick: number): void {
    if (this.bombThreatIsReal) {
      // Real bomb - massive damage to random buildings
      const damage = 250000; // Reduced funds damage since we now damage buildings too
      tower.funds -= damage;
      
      // Damage 3-5 random buildings (30-50% health loss each)
      const buildings = Object.values(tower.buildingsById).filter(b => b && b.type !== 'lobby');
      const buildingsToDamage = Math.min(buildings.length, 3 + Math.floor(Math.random() * 3));
      
      for (let i = 0; i < buildingsToDamage; i++) {
        const building = buildings[Math.floor(Math.random() * buildings.length)];
        if (building && (tower as any).healthSystem) {
          const healthDamage = 30 + Math.random() * 20; // 30-50% damage
          (tower as any).healthSystem.damageBuilding(
            building.id,
            healthDamage,
            'bomb',
            currentTick
          );
        }
      }
      
      console.log(`💥 BOMB WAS REAL! ${buildingsToDamage} buildings damaged!`);
      console.log(`   Damage cost: $${damage.toLocaleString()}`);
    } else {
      // Hoax - just wasted time and minor cost
      const cost = 10000;
      tower.funds -= cost;
      console.log(`✅ Bomb threat was a HOAX. Building is safe.`);
      console.log(`   Security cost: $${cost.toLocaleString()}`);
    }
    
    getEventBus().emitSync({
      type: 'BOMB_THREAT_RESOLVED',
      wasReal: this.bombThreatIsReal,
    });
    
    this.bombThreatActive = false;
    
    const event = Array.from(this.activeEvents.values()).find(e => e.type === 'bomb_threat');
    if (event) {
      this.resolveEvent(event.id, tower, currentTick);
    }
  }
  
  // ========================================
  // SANTA EVENT
  // ========================================
  
  /**
   * Create Santa event (December surprise!)
   */
  private createSantaEvent(tower: Tower, currentTick: number, eventId: string): GameEvent {
    const floorLevels = Object.keys(tower.floorsById).map(Number);
    const maxFloor = Math.max(...floorLevels);
    
    this.santaEvent = {
      active: true,
      currentFloor: maxFloor,
      giftsDelivered: 0,
      totalReward: 0,
      startTick: currentTick,
    };
    
    getEventBus().emitSync({
      type: 'SANTA_APPEARED',
    });
    
    console.log(`🎅 SANTA ARRIVED! Ho ho ho!`);
    console.log(`   Santa is delivering gifts to all floors!`);
    
    return {
      id: eventId,
      type: 'santa',
      state: 'active',
      triggeredAt: currentTick,
      affectedFloors: floorLevels,
      affectedBuildingIds: [],
      data: {
        giftsDelivered: 0,
        currentFloor: maxFloor,
      },
    };
  }
  
  /**
   * Update Santa event
   */
  private updateSantaEvent(tower: Tower, currentTick: number): void {
    if (!this.santaEvent) return;
    
    const elapsed = currentTick - this.santaEvent.startTick;
    
    // Deliver gifts every 5 seconds
    if (elapsed % 300 === 0) {
      const reward = Math.floor(1000 + Math.random() * 5000);
      this.santaEvent.giftsDelivered++;
      this.santaEvent.totalReward += reward;
      tower.funds += reward;
      
      console.log(`🎁 Santa delivered gift! +$${reward.toLocaleString()}`);
    }
    
    // Santa leaves after 30 seconds
    if (elapsed > 1800) {
      this.endSantaEvent(tower, currentTick);
    }
  }
  
  /**
   * End Santa event
   */
  private endSantaEvent(tower: Tower, currentTick: number): void {
    if (!this.santaEvent) return;
    
    console.log(`🎅 Santa departed! Merry Christmas!`);
    console.log(`   Total gifts: ${this.santaEvent.giftsDelivered}`);
    console.log(`   Total reward: $${this.santaEvent.totalReward.toLocaleString()}`);
    
    getEventBus().emitSync({
      type: 'SANTA_DEPARTED',
    });
    
    const event = Array.from(this.activeEvents.values()).find(e => e.type === 'santa');
    if (event) {
      this.resolveEvent(event.id, tower, currentTick);
    }
    
    this.santaEvent = null;
  }
  
  // ========================================
  // TREASURE HUNT EVENT
  // ========================================
  
  /**
   * Create treasure hunt event
   */
  private createTreasureEvent(tower: Tower, currentTick: number, eventId: string): GameEvent {
    const floorLevels = Object.keys(tower.floorsById).map(Number);
    if (floorLevels.length === 0) return this.createDummyEvent(eventId, 'treasure_chest', currentTick);
    
    const floor = floorLevels[Math.floor(Math.random() * floorLevels.length)];
    const tile = Math.floor(Math.random() * 375);
    const reward = Math.floor(10000 + Math.random() * 40000); // $10K-$50K
    
    this.treasureChest = {
      floor,
      tile,
      reward,
      discovered: false,
      spawnedAtTick: currentTick,
    };
    
    getEventBus().emitSync({
      type: 'TREASURE_CHEST_SPAWNED',
      floor,
      tile,
    });
    
    console.log(`💎 TREASURE CHEST hidden on floor ${floor}!`);
    console.log(`   Find it for a reward worth $${reward.toLocaleString()}`);
    
    return {
      id: eventId,
      type: 'treasure_chest',
      state: 'active',
      triggeredAt: currentTick,
      affectedFloors: [floor],
      affectedBuildingIds: [],
      data: {
        floor,
        tile,
        reward,
      },
    };
  }
  
  /**
   * Collect treasure chest (called externally when player finds it)
   */
  collectTreasure(tower: Tower, currentTick: number): boolean {
    if (!this.treasureChest || this.treasureChest.discovered) return false;
    
    this.treasureChest.discovered = true;
    tower.funds += this.treasureChest.reward;
    
    getEventBus().emitSync({
      type: 'TREASURE_CHEST_COLLECTED',
      amount: this.treasureChest.reward,
    });
    
    console.log(`💰 TREASURE FOUND! +$${this.treasureChest.reward.toLocaleString()}`);
    
    const event = Array.from(this.activeEvents.values()).find(e => e.type === 'treasure_chest');
    if (event) {
      this.resolveEvent(event.id, tower, currentTick);
    }
    
    this.treasureChest = null;
    return true;
  }
  
  // ========================================
  // COCKROACH INFESTATION EVENT
  // ========================================
  
  /**
   * Create cockroach infestation event (hotel nightmare!)
   */
  private createCockroachEvent(tower: Tower, currentTick: number, eventId: string): GameEvent {
    // Find hotels
    const hotels = Object.values(tower.buildingsById).filter(
      (b: Building) => b.type === 'hotelSingle' || b.type === 'hotelTwin' || b.type === 'hotelSuite'
    );
    
    if (hotels.length === 0) return this.createDummyEvent(eventId, 'cockroaches', currentTick);
    
    const hotel = hotels[Math.floor(Math.random() * hotels.length)] as Building;
    this.cockroachInfestations.add(hotel.id);
    
    getEventBus().emitSync({
      type: 'COCKROACHES_APPEARED',
      buildingId: hotel.id,
    });
    
    console.log(`🪳 COCKROACH INFESTATION in ${hotel.type} on floor ${hotel.position.floor}!`);
    console.log(`   Guests are leaving! Clean it up fast!`);
    
    // Immediate reputation damage
    tower.funds -= 5000;
    
    return {
      id: eventId,
      type: 'cockroaches',
      state: 'active',
      triggeredAt: currentTick,
      affectedFloors: [hotel.position.floor],
      affectedBuildingIds: [hotel.id],
      data: {
        buildingId: hotel.id,
      },
    };
  }
  
  /**
   * Clean up cockroach infestation (called externally)
   */
  cleanupCockroaches(buildingId: string, tower: Tower, currentTick: number): boolean {
    if (!this.cockroachInfestations.has(buildingId)) return false;
    
    this.cockroachInfestations.delete(buildingId);
    
    const cleanupCost = 3000;
    tower.funds -= cleanupCost;
    
    getEventBus().emitSync({
      type: 'COCKROACHES_ELIMINATED',
      buildingId,
    });
    
    console.log(`🧹 Cockroaches eliminated! Cost: $${cleanupCost.toLocaleString()}`);
    
    const event = Array.from(this.activeEvents.values()).find(
      e => e.type === 'cockroaches' && e.affectedBuildingIds.includes(buildingId)
    );
    if (event) {
      this.resolveEvent(event.id, tower, currentTick);
    }
    
    return true;
  }
  
  // ========================================
  // EVENT MANAGEMENT
  // ========================================
  
  /**
   * Resolve an event
   */
  private resolveEvent(eventId: string, tower: Tower, currentTick: number): void {
    const event = this.activeEvents.get(eventId);
    if (!event) return;
    
    event.state = 'resolved';
    this.activeEvents.delete(eventId);
    
    console.log(`✅ Event resolved: ${event.type}`);
  }
  
  /**
   * Create dummy event (when no valid target exists)
   */
  private createDummyEvent(eventId: string, type: GameEventType, currentTick: number): GameEvent {
    console.log(`⚠️ Could not create ${type} event - no valid targets`);
    return {
      id: eventId,
      type,
      state: 'resolved',
      triggeredAt: currentTick,
      affectedFloors: [],
      affectedBuildingIds: [],
      data: {},
    };
  }
  
  /**
   * Get all active events
   */
  getActiveEvents(): GameEvent[] {
    return Array.from(this.activeEvents.values());
  }
  
  /**
   * Check if specific event type is active
   */
  isEventActive(type: GameEventType): boolean {
    return Array.from(this.activeEvents.values()).some(e => e.type === type && e.state === 'active');
  }
  
  /**
   * Get VIP visit statistics
   */
  getVIPStats(): { completed: number; failed: number; hasTowerStatus: boolean } {
    return {
      completed: this.vipVisitsCompleted,
      failed: this.vipVisitsFailed,
      hasTowerStatus: this.vipVisitsCompleted > 0,
    };
  }
  
  /**
   * Manually trigger event (for testing)
   */
  triggerSpecificEvent(type: GameEventType, tower: Tower, currentTick: number): void {
    this.triggerEvent(type, tower, currentTick);
  }
  
  /**
   * Serialize for save/load
   */
  serialize(): {
    activeEvents: GameEvent[];
    lastEventTick: number;
    vipVisitor: VIPVisitor | null;
    fires: Array<[string, FireEvent]>;
    bombThreatActive: boolean;
    treasureChest: TreasureChest | null;
    santaEvent: SantaEvent | null;
    cockroachInfestations: string[];
    vipVisitsCompleted: number;
    vipVisitsFailed: number;
  } {
    return {
      activeEvents: Array.from(this.activeEvents.values()),
      lastEventTick: this.lastEventTick,
      vipVisitor: this.vipVisitor,
      fires: Array.from(this.fires.entries()),
      bombThreatActive: this.bombThreatActive,
      treasureChest: this.treasureChest,
      santaEvent: this.santaEvent,
      cockroachInfestations: Array.from(this.cockroachInfestations),
      vipVisitsCompleted: this.vipVisitsCompleted,
      vipVisitsFailed: this.vipVisitsFailed,
    };
  }
  
  /**
   * Deserialize from save data
   */
  deserialize(data: ReturnType<EventSystem['serialize']>): void {
    this.activeEvents.clear();
    for (const event of data.activeEvents) {
      this.activeEvents.set(event.id, event);
    }
    
    this.lastEventTick = data.lastEventTick;
    this.vipVisitor = data.vipVisitor;
    this.fires = new Map(data.fires);
    this.bombThreatActive = data.bombThreatActive;
    this.treasureChest = data.treasureChest;
    this.santaEvent = data.santaEvent;
    this.cockroachInfestations = new Set(data.cockroachInfestations);
    this.vipVisitsCompleted = data.vipVisitsCompleted;
    this.vipVisitsFailed = data.vipVisitsFailed;
  }
}
