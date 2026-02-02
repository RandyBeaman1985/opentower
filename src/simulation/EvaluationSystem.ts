/**
 * Evaluation System - Building satisfaction ratings
 * 
 * Calculates and tracks building evaluations based on SimTower mechanics:
 * - Elevator wait times (biggest factor)
 * - Walking distances to services
 * - Noise from adjacent buildings
 * - Rent levels
 * - Service availability
 * 
 * Evaluation scale: 0-100%
 * - Blue (Excellent): 70-100%
 * - Yellow (Fair): 40-69%
 * - Red (Poor): 0-39%
 * 
 * @module simulation/EvaluationSystem
 */

import type { Tower, Building } from '@/interfaces';
import type { Person } from '@/entities/Person';

export type EvaluationColor = 'blue' | 'yellow' | 'red';

export interface BuildingEvaluation {
  score: number; // 0-100
  color: EvaluationColor;
  factors: {
    waitTime: number; // -40 to 0
    walkDistance: number; // -25 to 0
    noise: number; // -15 to 0
    rent: number; // -20 to 0
    services: number; // -25 to 0
  };
  lastUpdate: number;
}

/**
 * Evaluation System
 * 
 * Updates building evaluations every game-minute based on tenant satisfaction.
 * Evaluations affect tenant retention, income, and star rating progression.
 */
export class EvaluationSystem {
  private evaluations: Map<string, BuildingEvaluation> = new Map();
  private lastUpdateTick: number = 0;
  private readonly UPDATE_INTERVAL = 60; // Update every 60 ticks (1 game-minute)
  
  // Wait time thresholds (in ticks at 100ms/tick)
  private readonly WAIT_THRESHOLD_LOW = 300; // 30 seconds
  private readonly WAIT_THRESHOLD_MED = 600; // 60 seconds
  private readonly WAIT_THRESHOLD_HIGH = 1200; // 120 seconds
  
  // Walking distance thresholds (in tiles)
  private readonly WALK_THRESHOLD_LOW = 50;
  private readonly WALK_THRESHOLD_HIGH = 100;
  
  constructor() {
    // Empty initialization
  }
  
  /**
   * Update all building evaluations
   */
  update(tower: Tower, people: Person[], currentTick: number): void {
    if (currentTick - this.lastUpdateTick < this.UPDATE_INTERVAL) return;
    
    const buildings = Object.values(tower.buildingsById) as Building[];
    
    for (const building of buildings) {
      const evaluation = this.calculateEvaluation(building, tower, people);
      this.evaluations.set(building.id, evaluation);
    }
    
    this.lastUpdateTick = currentTick;
  }
  
  /**
   * Calculate evaluation for a single building
   */
  private calculateEvaluation(
    building: Building,
    tower: Tower,
    people: Person[]
  ): BuildingEvaluation {
    let score = 100;
    const factors = {
      waitTime: 0,
      walkDistance: 0,
      noise: 0,
      rent: 0,
      services: 0,
    };
    
    // 1. ELEVATOR WAIT TIME (biggest impact: -40 max)
    const waitPenalty = this.calculateWaitTimePenalty(building, people);
    factors.waitTime = -waitPenalty;
    score -= waitPenalty;
    
    // 2. WALKING DISTANCE (moderate impact: -25 max)
    const walkPenalty = this.calculateWalkDistancePenalty(building);
    factors.walkDistance = -walkPenalty;
    score -= walkPenalty;
    
    // 3. NOISE (moderate impact: -15 max)
    const noisePenalty = this.calculateNoisePenalty(building, tower);
    factors.noise = -noisePenalty;
    score -= noisePenalty;
    
    // 4. RENT LEVEL (moderate impact: -20 max, only for rentable buildings)
    if (building.type === 'office' || building.type === 'shop') {
      const rentPenalty = this.calculateRentPenalty(building);
      factors.rent = -rentPenalty;
      score -= rentPenalty;
    }
    
    // 5. MISSING SERVICES (high impact: -25 max)
    const servicePenalty = this.calculateServicePenalty(building, tower);
    factors.services = -servicePenalty;
    score -= servicePenalty;
    
    // Clamp to 0-100
    score = Math.max(0, Math.min(100, score));
    
    return {
      score,
      color: this.getColorFromScore(score),
      factors,
      lastUpdate: Date.now(),
    };
  }
  
  /**
   * Calculate wait time penalty based on occupant stress
   */
  private calculateWaitTimePenalty(building: Building, people: Person[]): number {
    if (building.occupantIds.length === 0) return 0;
    
    // Get average wait time for building occupants
    const occupants = people.filter(p => building.occupantIds.includes(p.id));
    if (occupants.length === 0) return 0;
    
    const avgStress = occupants.reduce((sum, p) => sum + p.stress, 0) / occupants.length;
    
    // Convert stress to wait time penalty
    // Stress thresholds: 30 (stressed), 60 (critical)
    if (avgStress < 30) return 0;
    if (avgStress < 60) return 10;
    if (avgStress < 90) return 20;
    return 40;
  }
  
  /**
   * Calculate walking distance penalty
   * 
   * Measures horizontal distance from lobby/elevators
   */
  private calculateWalkDistancePenalty(building: Building): number {
    const walkDistance = building.position.startTile; // Simplified: distance from left edge
    
    if (walkDistance < this.WALK_THRESHOLD_LOW) return 0;
    if (walkDistance < this.WALK_THRESHOLD_HIGH) return 10;
    return 25;
  }
  
  /**
   * Calculate noise penalty from adjacent buildings
   * 
   * SimTower noise sources:
   * - Offices: Moderate noise
   * - Entertainment (cinema, party hall): High noise
   * - Hotels/Condos: Noise-sensitive (affected but don't generate)
   */
  private calculateNoisePenalty(building: Building, tower: Tower): number {
    // Only noise-sensitive buildings care
    const noiseSensitive = ['condo', 'hotelSingle', 'hotelTwin', 'hotelSuite'];
    if (!noiseSensitive.includes(building.type)) return 0;
    
    const noiseGenerators = ['office', 'cinema', 'partyHall'];
    const buildings = Object.values(tower.buildingsById) as Building[];
    
    // Check buildings on adjacent floors
    const adjacentFloors = [building.position.floor - 1, building.position.floor, building.position.floor + 1];
    
    for (const other of buildings) {
      if (other.id === building.id) continue;
      if (!adjacentFloors.includes(other.position.floor)) continue;
      if (!noiseGenerators.includes(other.type)) continue;
      
      // Check horizontal overlap
      const overlap = this.checkHorizontalOverlap(building, other);
      if (overlap) {
        return other.type === 'office' ? 10 : 15; // Entertainment is noisier
      }
    }
    
    return 0;
  }
  
  /**
   * Check if two buildings overlap horizontally
   */
  private checkHorizontalOverlap(b1: Building, b2: Building): boolean {
    const b1End = b1.position.startTile + b1.width;
    const b2End = b2.position.startTile + b2.width;
    
    return (
      (b1.position.startTile >= b2.position.startTile && b1.position.startTile < b2End) ||
      (b2.position.startTile >= b1.position.startTile && b2.position.startTile < b1End)
    );
  }
  
  /**
   * Calculate rent penalty for offices/shops
   * 
   * Higher rent = lower evaluation (diminishing returns)
   */
  private calculateRentPenalty(building: Building): number {
    const maxRent = 10000; // SimTower max office rent
    const rentRatio = (building.incomePerQuarter ?? 0) / maxRent;
    
    // Linear penalty: max rent = -20 points
    return Math.min(20, rentRatio * 20);
  }
  
  /**
   * Calculate service penalty (missing required amenities)
   * 
   * SimTower service requirements:
   * - Offices: Need fast food within reasonable distance
   * - Condos: Want medical centers accessible
   * - Offices (3★+): Need parking
   * - Hotels: Want restaurants/entertainment nearby
   */
  private calculateServicePenalty(building: Building, tower: Tower): number {
    let penalty = 0;
    const buildings = Object.values(tower.buildingsById) as Building[];
    
    // Offices need fast food
    if (building.type === 'office') {
      const hasFastFood = buildings.some(b => 
        b.type === 'fastFood' && 
        Math.abs(b.position.floor - building.position.floor) <= 5
      );
      if (!hasFastFood) penalty += 15;
    }
    
    // Condos want medical centers
    if (building.type === 'condo') {
      const hasMedical = buildings.some(b => 
        b.type === 'medical' && 
        Math.abs(b.position.floor - building.position.floor) <= 10
      );
      if (!hasMedical) penalty += 10;
    }
    
    // Hotels want entertainment
    if (building.type === 'hotelSingle' || building.type === 'hotelTwin' || building.type === 'hotelSuite') {
      const hasEntertainment = buildings.some(b => 
        (b.type === 'restaurant' || b.type === 'cinema' || b.type === 'shop') &&
        Math.abs(b.position.floor - building.position.floor) <= 15
      );
      if (!hasEntertainment) penalty += 10;
    }
    
    return Math.min(25, penalty);
  }
  
  /**
   * Get evaluation color from score
   */
  private getColorFromScore(score: number): EvaluationColor {
    if (score >= 70) return 'blue';
    if (score >= 40) return 'yellow';
    return 'red';
  }
  
  /**
   * Get evaluation for a building
   */
  getEvaluation(buildingId: string): BuildingEvaluation | null {
    return this.evaluations.get(buildingId) ?? null;
  }
  
  /**
   * Get evaluation score (0-100)
   */
  getScore(buildingId: string): number {
    return this.evaluations.get(buildingId)?.score ?? 100;
  }
  
  /**
   * Get evaluation color
   */
  getColor(buildingId: string): EvaluationColor {
    return this.evaluations.get(buildingId)?.color ?? 'blue';
  }
  
  /**
   * Get tower-wide average evaluation
   */
  getAverageEvaluation(tower: Tower): number {
    const buildings = Object.values(tower.buildingsById) as Building[];
    if (buildings.length === 0) return 100;
    
    const scores = buildings.map(b => this.getScore(b.id));
    return scores.reduce((sum, s) => sum + s, 0) / scores.length;
  }
  
  /**
   * Get count of buildings by evaluation color
   */
  getEvaluationCounts(tower: Tower): { blue: number; yellow: number; red: number } {
    const buildings = Object.values(tower.buildingsById) as Building[];
    const counts = { blue: 0, yellow: 0, red: 0 };
    
    for (const building of buildings) {
      const color = this.getColor(building.id);
      counts[color]++;
    }
    
    return counts;
  }
  
  /**
   * Check if building evaluation is critical (red)
   */
  isCritical(buildingId: string): boolean {
    return this.getColor(buildingId) === 'red';
  }
  
  /**
   * Serialize evaluation state for saving
   */
  serialize(): Record<string, BuildingEvaluation> {
    return Object.fromEntries(this.evaluations);
  }
  
  /**
   * Deserialize evaluation state from saved data
   */
  deserialize(data: Record<string, BuildingEvaluation>): void {
    this.evaluations = new Map(Object.entries(data));
  }
}
