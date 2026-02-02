/**
 * Operating Cost System - Daily expenses and bankruptcy mechanics
 * 
 * Deducts daily operating costs from tower funds:
 * - Elevator operating costs ($50-150 per car per day)
 * - Building maintenance ($0-500 per building per day)
 * - Staff wages (security, medical, etc.)
 * 
 * Bankruptcy mechanics:
 * - Allows negative funds (debt state)
 * - If funds < -$500,000 for 7 consecutive days → GAME OVER
 * 
 * This is what makes OpenTower a GAME instead of a toy.
 * You can LOSE. There is PRESSURE. Choices have CONSEQUENCES.
 * 
 * @module simulation/OperatingCostSystem
 */

import type { Tower, Building } from '@/interfaces';
import { getEventBus } from '@core/EventBus';

export interface DailyExpenseReport {
  day: number;
  elevatorCosts: number;
  maintenanceCosts: number;
  staffCosts: number;
  totalCosts: number;
  fundsAfter: number;
  timestamp: number;
}

export interface BankruptcyState {
  inDebt: boolean;
  debtAmount: number;
  daysInDebt: number;
  daysToBankruptcy: number;
  isBankrupt: boolean;
}

/**
 * Operating Cost System
 * 
 * Manages daily operating expenses and bankruptcy mechanics.
 */
export class OperatingCostSystem {
  private lastDeductionTick: number = 0;
  private readonly TICKS_PER_DAY = 1440; // 24 hours × 60 ticks/hour
  
  private dayNumber: number = 0;
  private expenseReports: DailyExpenseReport[] = [];
  
  // Bankruptcy tracking
  private daysInDebt: number = 0;
  private readonly BANKRUPTCY_THRESHOLD = -500000; // -$500,000
  private readonly BANKRUPTCY_DAYS = 7; // 7 consecutive days in deep debt
  private isBankrupt: boolean = false;
  
  // Operating cost rates (per day)
  private readonly ELEVATOR_COST_STANDARD = 50; // $50 per car per day
  private readonly ELEVATOR_COST_EXPRESS = 75; // $75 per car per day
  private readonly ELEVATOR_COST_SERVICE = 40; // $40 per car per day
  
  constructor() {
    // Empty initialization
  }
  
  /**
   * Update operating costs (called every tick)
   */
  update(tower: Tower, currentTick: number): void {
    // Check if a game-day has passed
    if (currentTick - this.lastDeductionTick < this.TICKS_PER_DAY) return;
    
    this.dayNumber++;
    
    // Calculate and deduct daily expenses
    const report = this.deductDailyExpenses(tower, currentTick);
    this.expenseReports.push(report);
    
    // Keep only last 30 days
    if (this.expenseReports.length > 30) {
      this.expenseReports.shift();
    }
    
    // Check bankruptcy status
    this.updateBankruptcyState(tower);
    
    this.lastDeductionTick = currentTick;
    
    // Emit events
    const eventBus = getEventBus();
    eventBus.emitSync({
      type: 'DAILY_EXPENSES',
      report,
    });
    
    if (this.isBankrupt) {
      eventBus.emitSync({
        type: 'GAME_OVER',
        reason: 'bankruptcy',
      });
    }
  }
  
  /**
   * Calculate and deduct daily expenses
   */
  private deductDailyExpenses(tower: Tower, currentTick: number): DailyExpenseReport {
    let elevatorCosts = 0;
    let maintenanceCosts = 0;
    let staffCosts = 0;
    
    // 1. ELEVATOR OPERATING COSTS
    for (const shaft of tower.elevators) {
      const costPerCar = shaft.elevatorType === 'express' 
        ? this.ELEVATOR_COST_EXPRESS
        : shaft.elevatorType === 'service'
        ? this.ELEVATOR_COST_SERVICE
        : this.ELEVATOR_COST_STANDARD;
      
      elevatorCosts += shaft.carIds.length * costPerCar;
    }
    
    // 2. BUILDING MAINTENANCE COSTS
    const buildings = Object.values(tower.buildingsById) as Building[];
    for (const building of buildings) {
      maintenanceCosts += this.getBuildingMaintenanceCost(building);
    }
    
    // 3. STAFF WAGES
    for (const building of buildings) {
      if (building.type === 'security') staffCosts += 100; // $100/day
      if (building.type === 'medical') staffCosts += 150; // $150/day
      if (building.type === 'housekeeping') staffCosts += 75; // $75/day
    }
    
    const totalCosts = elevatorCosts + maintenanceCosts + staffCosts;
    
    // Deduct from tower funds
    tower.funds -= totalCosts;
    
    // Create report
    const report: DailyExpenseReport = {
      day: this.dayNumber,
      elevatorCosts,
      maintenanceCosts,
      staffCosts,
      totalCosts,
      fundsAfter: tower.funds,
      timestamp: currentTick,
    };
    
    // Log to console
    if (totalCosts > 0) {
      console.log(`💸 Day ${this.dayNumber} Expenses:`);
      console.log(`  Elevators: -$${elevatorCosts.toLocaleString()}`);
      console.log(`  Maintenance: -$${maintenanceCosts.toLocaleString()}`);
      console.log(`  Staff: -$${staffCosts.toLocaleString()}`);
      console.log(`  Total: -$${totalCosts.toLocaleString()}`);
      console.log(`  Balance: $${tower.funds.toLocaleString()}`);
    }
    
    return report;
  }
  
  /**
   * Get daily maintenance cost for a building
   */
  private getBuildingMaintenanceCost(building: Building): number {
    // Base costs by building type
    switch (building.type) {
      case 'office': return 25;
      case 'condo': return 30;
      case 'hotelSingle': return 20;
      case 'hotelTwin': return 35;
      case 'hotelSuite': return 60;
      case 'fastFood': return 40;
      case 'restaurant': return 75;
      case 'shop': return 15;
      case 'cinema': return 100;
      case 'partyHall': return 50;
      case 'security': return 10;
      case 'medical': return 20;
      case 'recycling': return 15;
      case 'stairs': return 5;
      case 'escalator': return 25; // High maintenance
      default: return 0;
    }
  }
  
  /**
   * Update bankruptcy state
   */
  private updateBankruptcyState(tower: Tower): void {
    // Check if in deep debt
    if (tower.funds < this.BANKRUPTCY_THRESHOLD) {
      this.daysInDebt++;
      
      // Warning notifications
      const eventBus = getEventBus();
      
      if (this.daysInDebt === 1) {
        eventBus.emitSync({
          type: 'NOTIFICATION',
          title: 'SERIOUS DEBT',
          message: `Tower is $${Math.abs(tower.funds).toLocaleString()} in debt. Improve cash flow immediately!`,
        });
      }
      
      if (this.daysInDebt >= 3 && this.daysInDebt < this.BANKRUPTCY_DAYS) {
        const daysLeft = this.BANKRUPTCY_DAYS - this.daysInDebt;
        eventBus.emitSync({
          type: 'NOTIFICATION',
          title: 'BANKRUPTCY WARNING',
          message: `${daysLeft} days until bankruptcy! Generate income NOW!`,
        });
      }
      
      // Bankruptcy triggered
      if (this.daysInDebt >= this.BANKRUPTCY_DAYS) {
        this.isBankrupt = true;
        eventBus.emitSync({
          type: 'NOTIFICATION',
          title: 'BANKRUPTCY',
          message: 'Tower has declared bankruptcy. Game Over.',
        });
      }
    } else {
      // Reset debt counter if funds recover
      if (this.daysInDebt > 0) {
        const eventBus = getEventBus();
        eventBus.emitSync({
          type: 'NOTIFICATION',
          title: 'Debt Recovered',
          message: 'Tower is back in the black!',
        });
      }
      this.daysInDebt = 0;
    }
  }
  
  /**
   * Get current bankruptcy state
   */
  getBankruptcyState(tower: Tower): BankruptcyState {
    return {
      inDebt: tower.funds < 0,
      debtAmount: tower.funds < 0 ? Math.abs(tower.funds) : 0,
      daysInDebt: this.daysInDebt,
      daysToBankruptcy: Math.max(0, this.BANKRUPTCY_DAYS - this.daysInDebt),
      isBankrupt: this.isBankrupt,
    };
  }
  
  /**
   * Get latest expense report
   */
  getLatestReport(): DailyExpenseReport | null {
    return this.expenseReports[this.expenseReports.length - 1] ?? null;
  }
  
  /**
   * Get all expense reports
   */
  getAllReports(): DailyExpenseReport[] {
    return [...this.expenseReports];
  }
  
  /**
   * Get average daily expenses (last 7 days)
   */
  getAverageDailyExpenses(): number {
    const recentReports = this.expenseReports.slice(-7);
    if (recentReports.length === 0) return 0;
    
    const total = recentReports.reduce((sum, r) => sum + r.totalCosts, 0);
    return total / recentReports.length;
  }
  
  /**
   * Get estimated monthly expenses
   */
  getEstimatedMonthlyExpenses(): number {
    return this.getAverageDailyExpenses() * 30;
  }
  
  /**
   * Check if tower is at risk of bankruptcy
   */
  isAtRisk(tower: Tower): boolean {
    const avgExpenses = this.getAverageDailyExpenses();
    const daysOfRunway = tower.funds / avgExpenses;
    
    // At risk if less than 30 days of runway
    return daysOfRunway < 30;
  }
  
  /**
   * Get days of financial runway
   */
  getDaysOfRunway(tower: Tower): number {
    const avgExpenses = this.getAverageDailyExpenses();
    if (avgExpenses <= 0) return Infinity;
    
    return Math.floor(tower.funds / avgExpenses);
  }
  
  /**
   * Serialize operating cost state for saving
   */
  serialize(): {
    lastDeductionTick: number;
    dayNumber: number;
    daysInDebt: number;
    isBankrupt: boolean;
  } {
    return {
      lastDeductionTick: this.lastDeductionTick,
      dayNumber: this.dayNumber,
      daysInDebt: this.daysInDebt,
      isBankrupt: this.isBankrupt,
    };
  }
  
  /**
   * Deserialize operating cost state from saved data
   */
  deserialize(data: {
    lastDeductionTick: number;
    dayNumber: number;
    daysInDebt: number;
    isBankrupt: boolean;
  }): void {
    this.lastDeductionTick = data.lastDeductionTick;
    this.dayNumber = data.dayNumber;
    this.daysInDebt = data.daysInDebt;
    this.isBankrupt = data.isBankrupt;
  }
  
  /**
   * Force reset bankruptcy state (for testing/debugging)
   */
  resetBankruptcy(): void {
    this.daysInDebt = 0;
    this.isBankrupt = false;
  }
}
