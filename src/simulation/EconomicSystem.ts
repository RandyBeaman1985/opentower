/**
 * Economic System - Manages tower finances
 * 
 * Handles quarterly income collection, building maintenance costs,
 * and financial reporting.
 * 
 * SimTower mechanics:
 * - Quarters occur every 15 game-minutes (900 ticks at 60 ticks/min)
 * - Rent collected at quarter start
 * - Maintenance costs deducted
 * - Evaluation day: Last day of each quarter
 * 
 * @module simulation/EconomicSystem
 */

import type { Tower, Building, GameClock } from '@/interfaces';
import { getSoundManager } from '../audio/SoundManager';

export interface QuarterlyReport {
  quarterNumber: number;
  income: number;
  maintenance: number;
  netProfit: number;
  timestamp: number;
}

export interface CashFlowSummary {
  incomePerQuarter: number;
  maintenancePerQuarter: number;
  netPerQuarter: number;
  incomePerDay: number;
}

export class EconomicSystem {
  private lastQuarterTick: number = 0;
  private quarterNumber: number = 0;
  private quarterReports: QuarterlyReport[] = [];
  
  // Quarter interval (15 game-minutes = 900 ticks)
  private readonly TICKS_PER_QUARTER = 900;
  
  // Food building customer tracking
  private foodCustomerCounts: Map<string, number> = new Map(); // buildingId -> customer count this quarter
  
  // Income per customer (based on SimTower)
  private readonly FASTFOOD_INCOME_PER_CUSTOMER = 5; // $5 per customer
  private readonly RESTAURANT_INCOME_PER_CUSTOMER = 15; // $15 per customer
  
  constructor() {
    // Empty initialization
  }
  
  /**
   * Update economic system
   */
  update(tower: Tower, _clock: GameClock, currentTick: number, hotelIncome: number = 0): void {
    // Check if a quarter has passed
    if (currentTick - this.lastQuarterTick >= this.TICKS_PER_QUARTER) {
      this.processQuarter(tower, currentTick, hotelIncome);
      this.lastQuarterTick = currentTick;
    }
  }
  
  /**
   * Process quarterly collection
   */
  private processQuarter(tower: Tower, currentTick: number, hotelIncome: number = 0): void {
    this.quarterNumber++;
    
    let totalIncome = 0;
    let totalMaintenance = 0;
    
    const buildings = Object.values(tower.buildingsById) as Building[];
    
    for (const building of buildings) {
      // Collect income (only if building is active and has occupants)
      if (building.state === 'active') {
        // For offices, income depends on occupancy
        if (building.type === 'office') {
          const occupancyRatio = building.occupantIds.length / 6; // 6 max per office
          const income = building.incomePerQuarter * occupancyRatio;
          totalIncome += income;
        }
        // For food buildings, income depends on customer visits
        else if (building.type === 'fastFood') {
          const customerCount = this.foodCustomerCounts.get(building.id) || 0;
          const income = customerCount * this.FASTFOOD_INCOME_PER_CUSTOMER;
          totalIncome += income;
        }
        else if (building.type === 'restaurant') {
          const customerCount = this.foodCustomerCounts.get(building.id) || 0;
          const income = customerCount * this.RESTAURANT_INCOME_PER_CUSTOMER;
          totalIncome += income;
        }
        // Other buildings use base income
        else {
          totalIncome += building.incomePerQuarter;
        }
      }
      
      // Deduct maintenance
      totalMaintenance += building.maintenanceCostPerQuarter;
    }
    
    // Add hotel income from check-outs
    totalIncome += hotelIncome;
    
    // Reset food customer counts for next quarter
    this.foodCustomerCounts.clear();
    
    const netProfit = totalIncome - totalMaintenance;
    
    // Update tower funds
    tower.funds += netProfit;
    
    // Create report
    const report: QuarterlyReport = {
      quarterNumber: this.quarterNumber,
      income: totalIncome,
      maintenance: totalMaintenance,
      netProfit,
      timestamp: currentTick,
    };
    
    this.quarterReports.push(report);
    
    // Keep only last 20 reports
    if (this.quarterReports.length > 20) {
      this.quarterReports.shift();
    }
    
    // Play cash register sound if profit is positive
    if (netProfit > 0) {
      getSoundManager().playCashRegister();
    }

    // Log to console
    console.log(`📊 Quarter ${this.quarterNumber} Report:`);
    console.log(`  Income: $${totalIncome.toLocaleString()}`);
    console.log(`  Maintenance: -$${totalMaintenance.toLocaleString()}`);
    console.log(`  Net Profit: $${netProfit.toLocaleString()}`);
    console.log(`  New Balance: $${tower.funds.toLocaleString()}`);
  }
  
  /**
   * Get latest quarterly report
   */
  getLatestReport(): QuarterlyReport | null {
    return this.quarterReports[this.quarterReports.length - 1] ?? null;
  }
  
  /**
   * Get cash flow summary
   */
  getCashFlowSummary(): CashFlowSummary {
    const report = this.getLatestReport();
    
    if (!report) {
      return {
        incomePerQuarter: 0,
        maintenancePerQuarter: 0,
        netPerQuarter: 0,
        incomePerDay: 0,
      };
    }
    
    // 4 quarters per game-day (15 min each = 60 min = 1 hour, 24 hours = 96 quarters)
    // Actually: SimTower has 4 quarters per REAL day, so roughly 15-minute intervals
    // For simplicity: 4 quarters per in-game day
    const incomePerDay = report.netProfit * 4;
    
    return {
      incomePerQuarter: report.income,
      maintenancePerQuarter: report.maintenance,
      netPerQuarter: report.netProfit,
      incomePerDay,
    };
  }
  
  /**
   * Get all reports
   */
  getAllReports(): QuarterlyReport[] {
    return [...this.quarterReports];
  }
  
  /**
   * Get current quarter number
   */
  getQuarterNumber(): number {
    return this.quarterNumber;
  }
  
  /**
   * Get ticks until next quarter
   */
  getTicksUntilNextQuarter(currentTick: number): number {
    return this.TICKS_PER_QUARTER - (currentTick - this.lastQuarterTick);
  }

  /**
   * Register a customer visit to a food building
   * Called when a person visits a food building during lunch
   */
  registerFoodCustomer(buildingId: string): void {
    const currentCount = this.foodCustomerCounts.get(buildingId) || 0;
    this.foodCustomerCounts.set(buildingId, currentCount + 1);
  }

  /**
   * Get customer count for a food building this quarter
   */
  getFoodCustomerCount(buildingId: string): number {
    return this.foodCustomerCounts.get(buildingId) || 0;
  }

  /**
   * Serialize economic state for saving
   */
  serialize(): { lastQuarterlyCollection: number; quarterlyIncome: number; quarterlyExpenses: number } {
    const report = this.getLatestReport();
    return {
      lastQuarterlyCollection: this.lastQuarterTick,
      quarterlyIncome: report?.income ?? 0,
      quarterlyExpenses: report?.maintenance ?? 0,
    };
  }

  /**
   * Deserialize economic state from saved data
   */
  deserialize(data: { lastQuarterlyCollection: number; quarterlyIncome: number; quarterlyExpenses: number }): void {
    this.lastQuarterTick = data.lastQuarterlyCollection;
    // Note: We don't restore the full quarterReports array, it will rebuild over time
    // Income/expenses are recalculated each quarter based on current buildings
  }

  /**
   * Check for tenant departures due to poor evaluation
   * Buildings with red evaluation (<40%) will lose tenants quarterly
   * 
   * This is what makes placement MATTER. Bad elevators = lost income.
   * 
   * @param tower Tower instance
   * @param evaluationSystem Evaluation system to get building scores
   */
  checkTenantDepartures(tower: Tower, evaluationSystem?: any): void {
    const buildings = Object.values(tower.buildingsById) as Building[];
    
    for (const building of buildings) {
      // Only check buildings with occupants that pay rent
      if (building.type !== 'office' && building.type !== 'condo') continue;
      if (building.state !== 'active') continue;
      if (building.occupantIds.length === 0) continue;
      
      // Get evaluation score (0-100)
      const evaluation = evaluationSystem?.getScore(building.id) ?? 100;
      
      // RED EVALUATION (<40%) = HIGH RISK OF DEPARTURE
      if (evaluation < 40) {
        // 50% chance per quarter for offices, 30% for condos
        const departureChance = building.type === 'office' ? 0.5 : 0.3;
        
        if (Math.random() < departureChance) {
          // Tenant is leaving!
          
          // Mark building as vacant
          building.state = 'vacant';
          building.occupantIds = [];
          building.incomePerQuarter = 0;
          
          console.log(`⚠️  Tenant left ${building.type} on floor ${building.position.floor} due to poor conditions! (eval: ${evaluation}%)`);
        }
      }
      
      // YELLOW EVALUATION (40-69%) = MILD RISK
      else if (evaluation < 70) {
        // 10% chance for offices, 5% for condos
        const departureChance = building.type === 'office' ? 0.10 : 0.05;
        
        if (Math.random() < departureChance) {
          building.state = 'vacant';
          building.occupantIds = [];
          building.incomePerQuarter = 0;
          
          console.log(`⚠️  Tenant left ${building.type} on floor ${building.position.floor} (eval: ${evaluation}%)`);
        }
      }
    }
  }
}
