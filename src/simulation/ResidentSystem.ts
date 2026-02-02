/**
 * ResidentSystem - Manages permanent condo residents
 * 
 * Condos have permanent residents who:
 * - Live in condos permanently
 * - Go to work at offices during the day (8 AM - 5 PM)
 * - Come home at night
 * - Generate rent income quarterly
 * - Different from hotel guests (permanent vs temporary)
 */

import type { Tower, Building } from '@/interfaces';
import type { Person } from '@/entities/Person';

export interface Resident {
  id: string;
  condoId: string;
  workplaceId: string | null; // Office they work at (can be unemployed)
  rentPerQuarter: number;
}

export class ResidentSystem {
  private residents: Map<string, Resident> = new Map();
  private nextResidentId = 1000;

  // Constants
  private readonly RENT_PER_QUARTER_BASE = 15000; // $15K per quarter per condo resident
  // private readonly WORK_START_HOUR = 8;  // TODO: Uncomment when work commute is implemented
  // private readonly WORK_END_HOUR = 17;   // TODO: Uncomment when work commute is implemented
  
  // Track time for move-in/move-out events
  private lastCheckHour = -1;

  /**
   * Update residents (called every tick)
   */
  update(tower: Tower, _people: Map<string, Person>, currentHour: number): void {
    // Check for move-ins/move-outs hourly
    if (currentHour !== this.lastCheckHour) {
      this.processHourlyEvents(tower, currentHour);
      this.lastCheckHour = currentHour;
    }
  }

  /**
   * Process hourly events (move-ins, move-outs, work commutes)
   */
  private processHourlyEvents(tower: Tower, _hour: number): void {
    // Move-in check: Fill vacant condos (slow rate - 10% chance per hour)
    if (Math.random() < 0.1) {
      this.tryMoveInNewResident(tower);
    }

    // Work commute disabled for now (Person entity doesn't have destination property yet)
    // TODO: Implement work commute when Person entity is updated
    // if (hour === this.WORK_START_HOUR || hour === this.WORK_END_HOUR) {
    //   this.updateWorkCommutes(people, hour);
    // }
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
   * Update work commutes (send residents to work or home)
   * NOTE: Disabled for now - Person entity doesn't have destination property yet
   */
  // private updateWorkCommutes(people: Map<string, Person>, hour: number): void {
  //   const isWorkStart = hour === this.WORK_START_HOUR;
  //   
  //   for (const resident of this.residents.values()) {
  //     // Skip unemployed residents
  //     if (!resident.workplaceId) continue;
  //
  //     // Find person entity (if spawned)
  //     const person = Array.from(people.values()).find(p => p.id === resident.id);
  //     if (!person) continue;
  //
  //     if (isWorkStart) {
  //       // Go to work
  //       // TODO: Set person destination to workplace
  //     } else {
  //       // Go home
  //       // TODO: Set person destination to condo
  //     }
  //   }
  // }

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
