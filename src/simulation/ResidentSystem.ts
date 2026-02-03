/**
 * ResidentSystem - Manages permanent condo residents
 * 
 * Condos have permanent residents who:
 * - Live in condos permanently
 * - Go to work at offices during the day (8 AM - 5 PM)
 * - Come home at night
 * - Generate rent income quarterly
 * - Different from hotel guests (permanent vs temporary)
 * 
 * 🆕 v0.12.0: FULL RESIDENT LIFE CYCLE
 * - Morning commute: Leave home at 8 AM, travel to lobby, despawn (go to work)
 * - Evening commute: Spawn at lobby at 6 PM, travel home to condo
 * - Weekend behavior: Stay home or visit shops/restaurants
 * - Stress affects satisfaction and move-out probability
 */

import type { Tower, Building } from '@/interfaces';
import type { Person } from '@/entities/Person';

export interface Resident {
  id: string;
  condoId: string;
  workplaceId: string | null; // Office they work at (can be unemployed)
  rentPerQuarter: number;
  personId: string | null; // Current Person entity ID (when spawned in tower)
  lastCommuteHour: number; // Track last commute to prevent duplicates
}

export class ResidentSystem {
  private residents: Map<string, Resident> = new Map();
  private nextResidentId = 1000;

  // Constants
  private readonly RENT_PER_QUARTER_BASE = 15000; // $15K per quarter per condo resident
  private readonly WORK_START_HOUR = 8;  // Morning commute
  private readonly WORK_END_HOUR = 18;   // 6 PM - Evening commute (changed from 17 for better spacing)
  
  // Track time for move-in/move-out events
  private lastCheckHour = -1;
  
  // Dependencies (injected from Game.ts)
  private spawnResidentCallback: ((resident: Resident, tower: Tower) => Person | null) | null = null;
  private despawnPersonCallback: ((personId: string) => void) | null = null;

  /**
   * Set callbacks for spawning/despawning resident persons
   */
  setCallbacks(
    spawnResident: (resident: Resident, tower: Tower) => Person | null,
    despawnPerson: (personId: string) => void
  ): void {
    this.spawnResidentCallback = spawnResident;
    this.despawnPersonCallback = despawnPerson;
  }

  /**
   * Update residents (called every tick)
   */
  update(tower: Tower, people: Map<string, Person>, currentHour: number, gameDay: number): void {
    // Check for move-ins/move-outs hourly
    if (currentHour !== this.lastCheckHour) {
      this.processHourlyEvents(tower, people, currentHour, gameDay);
      this.lastCheckHour = currentHour;
    }
  }

  /**
   * Process hourly events (move-ins, move-outs, work commutes)
   */
  private processHourlyEvents(tower: Tower, people: Map<string, Person>, hour: number, gameDay: number): void {
    // Move-in check: Fill vacant condos (slow rate - 10% chance per hour)
    if (Math.random() < 0.1) {
      this.tryMoveInNewResident(tower);
    }

    // Work commute system - WEEKDAYS ONLY
    const isWeekday = this.isWeekday(gameDay);
    
    if (isWeekday && hour === this.WORK_START_HOUR) {
      // 8 AM: Residents leave home for work
      this.processMorningCommute(tower, people);
    } else if (isWeekday && hour === this.WORK_END_HOUR) {
      // 6 PM: Residents return home from work
      this.processEveningCommute(tower);
    } else if (!isWeekday && (hour === 10 || hour === 14)) {
      // Weekend leisure: 10 AM or 2 PM - spawn some residents for shopping/dining
      this.processWeekendActivity(tower);
    }
  }

  /**
   * Try to move in a new resident to a vacant condo
   */
  private tryMoveInNewResident(tower: Tower): void {
    // Find condos with capacity
    const condos = Object.values(tower.buildingsById).filter(
      b => b.type === 'condo' && b.occupantIds.length < this.getCondoCapacity()
    );

    if (condos.length === 0) return;

    // Pick random condo
    const condo = condos[Math.floor(Math.random() * condos.length)];
    if (!condo) return;

    // Find an office for employment (or null if unemployed)
    const workplace = this.findWorkplace(tower);

    // Create resident
    const resident: Resident = {
      id: `resident-${this.nextResidentId++}`,
      condoId: condo.id,
      workplaceId: workplace?.id ?? null,
      rentPerQuarter: this.RENT_PER_QUARTER_BASE,
      personId: null, // Not spawned yet
      lastCommuteHour: -1, // No commute yet
    };

    this.residents.set(resident.id, resident);

    // Add resident to condo occupancy
    condo.occupantIds.push(resident.id);

    console.log(
      `🏠 Resident ${resident.id} moved into condo ${condo.id}` +
      (workplace ? ` (works at ${workplace.id})` : ' (unemployed)')
    );
  }

  /**
   * Find an office with available jobs
   */
  private findWorkplace(tower: Tower): Building | null | undefined {
    const offices = Object.values(tower.buildingsById).filter(
      b => b && b.type === 'office' && b.occupantIds.length < 6 // Offices hold max 6 workers
    );

    if (offices.length === 0) return null;

    return offices[Math.floor(Math.random() * offices.length)] ?? null;
  }

  /**
   * Check if current game day is a weekday (Mon-Fri)
   */
  private isWeekday(gameDay: number): boolean {
    const dayOfWeek = gameDay % 7;
    return dayOfWeek >= 0 && dayOfWeek <= 4; // Mon-Fri (0-4)
  }

  /**
   * Morning commute: Residents leave condos, go to lobby, despawn (go to work)
   */
  private processMorningCommute(tower: Tower, people: Map<string, Person>): void {
    // Find lobby building
    const lobby = Object.values(tower.buildingsById).find(b => b && b.type === 'lobby');
    if (!lobby) {
      console.warn('⚠️ Cannot process morning commute: No lobby found!');
      return;
    }
    
    let commutersCount = 0;
    
    for (const resident of this.residents.values()) {
      // Skip if already processed this hour
      if (resident.lastCommuteHour === this.WORK_START_HOUR) continue;
      
      // Skip if not currently spawned in tower
      if (!resident.personId) continue;
      
      const person = people.get(resident.personId);
      if (!person) continue;
      
      // Set destination to lobby (person will pathfind there, then despawn)
      person.destinationBuildingId = lobby.id;
      person.state = 'leaving';
      
      // Mark as processed
      resident.lastCommuteHour = this.WORK_START_HOUR;
      
      console.log(`🚶 ${person.name} leaving condo for work (${this.WORK_START_HOUR}:00 AM)`);
      commutersCount++;
    }
    
    if (commutersCount > 0) {
      console.log(`🌅 MORNING COMMUTE: ${commutersCount} residents leaving for work`);
    }
  }

  /**
   * Evening commute: Spawn residents at lobby, send them home to condos
   */
  private processEveningCommute(tower: Tower): void {
    if (!this.spawnResidentCallback) {
      console.warn('⚠️ ResidentSystem.spawnResidentCallback not set!');
      return;
    }
    
    let commutersCount = 0;
    
    for (const resident of this.residents.values()) {
      // Skip if already processed this hour
      if (resident.lastCommuteHour === this.WORK_END_HOUR) continue;
      
      // Skip if already in tower
      if (resident.personId) continue;
      
      // Spawn resident at lobby
      const person = this.spawnResidentCallback(resident, tower);
      if (!person) continue;
      
      // Link person to resident
      resident.personId = person.id;
      resident.lastCommuteHour = this.WORK_END_HOUR;
      
      // Set destination to their condo
      person.destinationBuildingId = resident.condoId;
      person.state = 'idle'; // Will start pathfinding to condo
      
      console.log(`🏠 ${person.name} returning home to condo ${resident.condoId} (${this.WORK_END_HOUR}:00 PM)`);
      commutersCount++;
    }
    
    if (commutersCount > 0) {
      console.log(`🌆 EVENING COMMUTE: ${commutersCount} residents returning home`);
    }
  }

  /**
   * Weekend activity: Spawn some residents for shopping/dining
   */
  private processWeekendActivity(tower: Tower): void {
    if (!this.spawnResidentCallback) return;
    
    // Only 30% of residents go out on weekends
    const activeResidents = Array.from(this.residents.values()).filter(
      r => !r.personId && Math.random() < 0.3
    );
    
    if (activeResidents.length === 0) return;
    
    // Find leisure destinations (shops, restaurants, etc.)
    const leisureBuildings = Object.values(tower.buildingsById).filter(
      b => b && (b.type === 'shop' || b.type === 'restaurant' || b.type === 'cinema')
    );
    
    if (leisureBuildings.length === 0) return;
    
    let spawnedCount = 0;
    
    for (const resident of activeResidents) {
      // Spawn at lobby
      const person = this.spawnResidentCallback(resident, tower);
      if (!person) continue;
      
      resident.personId = person.id;
      
      // Pick random leisure destination
      const destination = leisureBuildings[Math.floor(Math.random() * leisureBuildings.length)];
      if (!destination) continue;
      
      person.destinationBuildingId = destination.id;
      person.state = 'idle';
      
      console.log(`🛍️ ${person.name} going to ${destination.type} for weekend leisure`);
      spawnedCount++;
    }
    
    if (spawnedCount > 0) {
      console.log(`🌴 WEEKEND ACTIVITY: ${spawnedCount} residents out for leisure`);
    }
  }

  /**
   * Get condo capacity (3 residents per condo)
   */
  private getCondoCapacity(): number {
    return 3;
  }

  /**
   * Calculate total quarterly rent income
   */
  getQuarterlyRentIncome(): number {
    let total = 0;
    for (const resident of this.residents.values()) {
      total += resident.rentPerQuarter;
    }
    return total;
  }

  /**
   * Reset quarterly income (called after quarter report)
   */
  resetQuarterlyIncome(): void {
    // Rent is automatic, no reset needed
  }

  /**
   * Get total resident count
   */
  getResidentCount(): number {
    return this.residents.size;
  }

  /**
   * Get residents in a specific condo
   */
  getCondoResidents(condoId: string): Resident[] {
    return Array.from(this.residents.values()).filter(r => r.condoId === condoId);
  }

  /**
   * Remove resident (when they move out or condo is demolished)
   */
  removeResident(residentId: string, tower: Tower): void {
    const resident = this.residents.get(residentId);
    if (!resident) return;

    // Remove from condo occupancy
    const condo = tower.buildingsById[resident.condoId];
    if (condo) {
      const index = condo.occupantIds.indexOf(residentId);
      if (index !== -1) {
        condo.occupantIds.splice(index, 1);
      }
    }

    // Remove from system
    this.residents.delete(residentId);
    console.log(`🏠 Resident ${residentId} moved out`);
  }

  /**
   * Handle condo demolition - evict all residents
   */
  evictResidentsFromCondo(condoId: string, tower: Tower): void {
    const condoResidents = this.getCondoResidents(condoId);
    for (const resident of condoResidents) {
      this.removeResident(resident.id, tower);
    }
  }

  /**
   * Notify system that a resident person has left the tower (despawned)
   * This allows them to be respawned during the next commute cycle
   */
  onPersonDespawned(personId: string): void {
    // Find resident with this person ID
    for (const resident of this.residents.values()) {
      if (resident.personId === personId) {
        resident.personId = null;
        console.log(`🚪 Resident ${resident.id} despawned (will return home later)`);
        return;
      }
    }
  }

  /**
   * Check if a person is a resident
   */
  isResident(personId: string): boolean {
    for (const resident of this.residents.values()) {
      if (resident.personId === personId) return true;
    }
    return false;
  }

  /**
   * Serialize for save/load
   */
  serialize(): { residents: Resident[] } {
    return {
      residents: Array.from(this.residents.values()),
    };
  }

  /**
   * Deserialize from save data
   */
  deserialize(data: { residents: Resident[] }): void {
    this.residents.clear();
    for (const resident of data.residents) {
      this.residents.set(resident.id, resident);
    }
  }
}
