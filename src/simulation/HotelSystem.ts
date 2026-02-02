/**
 * Hotel System - Manages hotel guests, check-ins, check-outs, and room income
 *
 * Hotels are a key revenue source in SimTower. Guests check in during evening,
 * stay overnight, and check out in the morning.
 *
 * @module simulation/HotelSystem
 */

import type { Tower, Building, GameClock } from '@/interfaces';

export interface HotelGuest {
  guestId: string;
  buildingId: string;
  roomNumber: number;
  checkInTime: number; // game hour
  checkOutTime: number; // game hour
  nightlyRate: number;
}

export interface HotelRoomState {
  buildingId: string;
  totalRooms: number;
  occupiedRooms: number;
  guests: Map<number, HotelGuest>; // roomNumber -> guest
  incomeThisQuarter: number;
}

/**
 * Hotel System - manages all hotel operations
 */
export class HotelSystem {
  private hotelStates: Map<string, HotelRoomState> = new Map();
  private nextGuestId = 1;
  private lastProcessedHour = -1;

  /**
   * Update hotel system - process check-ins and check-outs
   */
  update(tower: Tower, clock: GameClock, _currentTick: number): void {
    // Process hourly events
    if (clock.gameHour !== this.lastProcessedHour) {
      this.processHourlyEvents(tower, clock);
      this.lastProcessedHour = clock.gameHour;
    }

    // Update hotel states for new buildings
    this.updateHotelStates(tower);
  }

  /**
   * Process hourly check-ins and check-outs
   */
  private processHourlyEvents(tower: Tower, clock: GameClock): void {
    const hour = clock.gameHour;

    for (const [buildingId, state] of this.hotelStates) {
      const building = tower.buildingsById[buildingId];
      if (!building || !this.isHotelBuilding(building.type)) {
        continue;
      }

      // Check-in time: 6 PM - 10 PM (18:00 - 22:00)
      if (hour >= 18 && hour < 22) {
        this.processCheckIns(state, building, hour);
      }

      // Check-out time: 8 AM - 11 AM (8:00 - 11:00)
      if (hour >= 8 && hour < 11) {
        this.processCheckOuts(state, building, hour);
      }
    }
  }

  /**
   * Process guest check-ins
   */
  private processCheckIns(state: HotelRoomState, building: Building, hour: number): void {
    const availableRooms = state.totalRooms - state.occupiedRooms;
    
    if (availableRooms <= 0) return;

    // Random chance for new guests (50% per hour during check-in period)
    const checkInsThisHour = Math.floor(Math.random() * availableRooms * 0.5);

    for (let i = 0; i < checkInsThisHour; i++) {
      // Find an empty room
      const roomNumber = this.findEmptyRoom(state);
      if (roomNumber === -1) break;

      // Create guest
      const guest: HotelGuest = {
        guestId: `guest-${this.nextGuestId++}`,
        buildingId: state.buildingId,
        roomNumber,
        checkInTime: hour,
        checkOutTime: 10, // Check out at 10 AM
        nightlyRate: this.getNightlyRate(building.type),
      };

      state.guests.set(roomNumber, guest);
      state.occupiedRooms++;

      console.log(`🏨 Guest ${guest.guestId} checked into ${building.type} room ${roomNumber}`);
    }
  }

  /**
   * Process guest check-outs (generates income!)
   */
  private processCheckOuts(state: HotelRoomState, building: Building, hour: number): void {
    const checkingOut: number[] = [];

    // Find guests who should check out
    for (const [roomNumber, guest] of state.guests) {
      if (hour >= guest.checkOutTime) {
        checkingOut.push(roomNumber);
      }
    }

    // Process check-outs
    for (const roomNumber of checkingOut) {
      const guest = state.guests.get(roomNumber);
      if (!guest) continue;

      // Generate income!
      state.incomeThisQuarter += guest.nightlyRate;

      // Remove guest
      state.guests.delete(roomNumber);
      state.occupiedRooms--;

      console.log(`🏨 Guest ${guest.guestId} checked out from ${building.type} room ${roomNumber} - Income: $${guest.nightlyRate}`);
    }
  }

  /**
   * Find an empty room number
   */
  private findEmptyRoom(state: HotelRoomState): number {
    for (let i = 1; i <= state.totalRooms; i++) {
      if (!state.guests.has(i)) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Get nightly rate for hotel type
   */
  private getNightlyRate(hotelType: string): number {
    switch (hotelType) {
      case 'hotelSingle':
        return 100; // $100 per night
      case 'hotelTwin':
        return 150; // $150 per night
      case 'hotelSuite':
        return 300; // $300 per night
      default:
        return 100;
    }
  }

  /**
   * Update hotel states for new buildings
   */
  private updateHotelStates(tower: Tower): void {
    const hotelBuildings = Object.values(tower.buildingsById).filter(b =>
      this.isHotelBuilding(b.type)
    );

    // Add new hotels
    for (const building of hotelBuildings) {
      if (!this.hotelStates.has(building.id)) {
        this.hotelStates.set(building.id, {
          buildingId: building.id,
          totalRooms: this.getRoomCount(building.type),
          occupiedRooms: 0,
          guests: new Map(),
          incomeThisQuarter: 0,
        });
      }
    }

    // Remove demolished hotels
    const hotelIds = new Set(hotelBuildings.map(b => b.id));
    for (const [id] of this.hotelStates) {
      if (!hotelIds.has(id)) {
        this.hotelStates.delete(id);
      }
    }
  }

  /**
   * Check if building type is a hotel
   */
  private isHotelBuilding(type: string): boolean {
    return type === 'hotelSingle' || type === 'hotelTwin' || type === 'hotelSuite';
  }

  /**
   * Get room count for hotel type
   */
  private getRoomCount(hotelType: string): number {
    switch (hotelType) {
      case 'hotelSingle':
        return 8; // 8 single rooms
      case 'hotelTwin':
        return 6; // 6 twin rooms
      case 'hotelSuite':
        return 4; // 4 suites
      default:
        return 4;
    }
  }

  /**
   * Get total hotel income for this quarter
   */
  getQuarterlyIncome(): number {
    let total = 0;
    for (const state of this.hotelStates.values()) {
      total += state.incomeThisQuarter;
    }
    return total;
  }

  /**
   * Reset quarterly income (called at quarter end)
   */
  resetQuarterlyIncome(): void {
    for (const state of this.hotelStates.values()) {
      state.incomeThisQuarter = 0;
    }
  }

  /**
   * Get occupancy rate across all hotels
   */
  getOccupancyRate(): number {
    let totalRooms = 0;
    let occupiedRooms = 0;

    for (const state of this.hotelStates.values()) {
      totalRooms += state.totalRooms;
      occupiedRooms += state.occupiedRooms;
    }

    return totalRooms > 0 ? occupiedRooms / totalRooms : 0;
  }

  /**
   * Get hotel state for a building
   */
  getHotelState(buildingId: string): HotelRoomState | undefined {
    return this.hotelStates.get(buildingId);
  }

  /**
   * Serialize state for saving
   */
  serialize(): any {
    const hotels: any[] = [];

    for (const [id, state] of this.hotelStates) {
      const guestsArray = Array.from(state.guests.entries()).map(([roomNumber, guest]) => ({
        roomNumber,
        guest,
      }));

      hotels.push({
        buildingId: id,
        totalRooms: state.totalRooms,
        occupiedRooms: state.occupiedRooms,
        guests: guestsArray,
        incomeThisQuarter: state.incomeThisQuarter,
      });
    }

    return {
      hotels,
      nextGuestId: this.nextGuestId,
      lastProcessedHour: this.lastProcessedHour,
    };
  }

  /**
   * Deserialize state from save
   */
  deserialize(data: any): void {
    this.hotelStates.clear();

    if (data.hotels) {
      for (const hotelData of data.hotels) {
        const guests = new Map<number, HotelGuest>();
        
        if (hotelData.guests) {
          for (const { roomNumber, guest } of hotelData.guests) {
            guests.set(roomNumber, guest);
          }
        }

        this.hotelStates.set(hotelData.buildingId, {
          buildingId: hotelData.buildingId,
          totalRooms: hotelData.totalRooms,
          occupiedRooms: hotelData.occupiedRooms,
          guests,
          incomeThisQuarter: hotelData.incomeThisQuarter,
        });
      }
    }

    this.nextGuestId = data.nextGuestId ?? 1;
    this.lastProcessedHour = data.lastProcessedHour ?? -1;
  }
}
