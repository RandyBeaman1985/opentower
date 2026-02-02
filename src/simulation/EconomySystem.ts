/**
 * Economy System - Comprehensive Financial Management for OpenTower
 * 
 * Inspired by SimTower 1995, this system makes money MATTER throughout the game.
 * 
 * INCOME SOURCES:
 * - Office rent (quarterly, with floor-level bonuses)
 * - Hotel nightly fees (checked out daily, not quarterly)
 * - Shop/restaurant revenue (based on actual foot traffic)
 * - Condo sales (one-time large payments when sold)
 * 
 * EXPENSES:
 * - Construction costs (immediate)
 * - Elevator maintenance (per shaft, scales with usage/age)
 * - Staff wages (security, housekeeping, hotel staff)
 * - Utilities (electricity, water - scale with building size & population)
 * 
 * FINANCIAL EVENTS:
 * - Quarterly rent collection
 * - Tenants leaving when unhappy
 * - Bankruptcy warnings and game over
 * 
 * DIFFICULTY BALANCE:
 * - Early game: TIGHT - every dollar matters, can't afford mistakes
 * - Mid game: Comfortable but strategic - growth requires planning
 * - Late game: Wealthy but complex - massive operational costs
 * 
 * @module simulation/EconomySystem
 */

import type { Tower, Building, GameClock } from '@/interfaces';
import { BUILDING_CONFIGS } from '@/interfaces';
import { getSoundManager } from '../audio/SoundManager';
import { getEventBus } from '@core/EventBus';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface QuarterlyReport {
  quarterNumber: number;
  timestamp: number;
  
  // Income breakdown
  officeRent: number;
  hotelRevenue: number;
  shopRevenue: number;
  restaurantRevenue: number;
  condoSales: number;
  totalIncome: number;
  
  // Expense breakdown
  elevatorMaintenance: number;
  staffWages: number;
  utilities: number;
  totalExpenses: number;
  
  // Net result
  netProfit: number;
  
  // Metadata
  totalPopulation: number;
  occupancyRate: number;
}

export interface BankruptcyState {
  isInDebt: boolean;
  debtStartTick: number | null;
  debtAmount: number;
  warningsIssued: number;
  gracePeriodRemaining: number; // In game-days
}

export interface TenantDeparture {
  buildingId: string;
  buildingType: string;
  floor: number;
  reason: 'stress' | 'bankruptcy' | 'random' | 'evaluation';
  lostIncome: number;
}

export interface EconomyStats {
  currentFunds: number;
  dailyIncome: number;
  dailyExpenses: number;
  netDaily: number;
  bankruptcyState: BankruptcyState;
  lastReport: QuarterlyReport | null;
}

// ============================================================================
// CONSTANTS - CAREFULLY BALANCED FOR PROGRESSION
// ============================================================================

// Quarter timing (15 game-minutes = 900 ticks at 60 ticks/min)
const TICKS_PER_QUARTER = 900;
const QUARTERS_PER_DAY = 4; // 4 quarters = 1 hour game time = 1 "day"

// Floor-level rent bonuses (higher floors = higher rent)
// Simulates prestige and view quality
const FLOOR_RENT_BONUS_PER_LEVEL = 0.02; // 2% per floor above ground
const FLOOR_RENT_MAX_BONUS = 0.50; // Cap at 50% bonus (floor 25+)

// Hotel nightly rates (per guest, collected at checkout)
const HOTEL_RATES = {
  hotelSingle: 100,  // $100/night
  hotelTwin: 150,    // $150/night (split between 2 guests = $75 each)
  hotelSuite: 300,   // $300/night (luxury)
};

// Food service revenue (per customer visit)
const FOOD_REVENUE = {
  fastFood: 8,      // $8 per customer (quick, cheap)
  restaurant: 25,   // $25 per customer (sit-down, expensive)
};

// Shop revenue (per customer visit)
const SHOP_REVENUE_PER_CUSTOMER = 15; // $15 average per shopper

// Condo sale prices (one-time, based on floor level and market)
const CONDO_BASE_PRICE = 80000;  // $80K base
const CONDO_FLOOR_BONUS = 5000;  // +$5K per floor
const CONDO_PRICE_VARIANCE = 0.15; // ±15% random variance

// Elevator maintenance costs (per shaft, per quarter)
// More elevators = higher operational costs
const ELEVATOR_BASE_MAINTENANCE = 2000;    // $2K per shaft per quarter
const ELEVATOR_USAGE_MULTIPLIER = 0.5;     // +50% per 100 people using it
const ELEVATOR_AGE_MULTIPLIER = 0.01;      // +1% per quarter of age (wear & tear)

// Staff wages (per employee, per quarter)
const STAFF_WAGES = {
  security: 15000,      // $15K per quarter per security office
  housekeeping: 12000,  // $12K per quarter per housekeeping
  hotelDesk: 8000,      // $8K per quarter (1 per 20 hotel rooms)
};

// Utility costs (scale with building size and population)
const UTILITY_COSTS = {
  electricityPerFloor: 500,        // $500 per floor per quarter (lighting, HVAC)
  electricityPerPerson: 50,        // $50 per resident/worker per quarter
  waterPerPerson: 30,              // $30 per person per quarter
  baseUtilities: 5000,             // $5K minimum (lobby, ground floor systems)
};

// Bankruptcy system (early game is TIGHT!)
const BANKRUPTCY_GRACE_PERIOD_TICKS = TICKS_PER_QUARTER * 12; // 3 game-days (12 quarters)
const BANKRUPTCY_WARNING_THRESHOLDS = [-50000, -100000, -200000]; // Increasing severity

// Tenant stress thresholds (when tenants leave)
const TENANT_STRESS_DEPARTURE_THRESHOLD = 80; // 80%+ stress = likely to leave
const TENANT_DEPARTURE_CHECK_CHANCE = 0.05;   // 5% chance per quarter if stressed

// ============================================================================
// ECONOMY SYSTEM CLASS
// ============================================================================

export class EconomySystem {
  // Quarterly tracking
  private lastQuarterTick: number = 0;
  private quarterNumber: number = 0;
  private quarterReports: QuarterlyReport[] = [];
  
  // Bankruptcy state
  private bankruptcyState: BankruptcyState = {
    isInDebt: false,
    debtStartTick: null,
    debtAmount: 0,
    warningsIssued: 0,
    gracePeriodRemaining: 0,
  };
  
  // Temporary income tracking (between quarters)
  private pendingHotelRevenue: number = 0;
  private pendingCondoSales: number = 0;
  private foodCustomerCounts: Map<string, number> = new Map();
  private shopCustomerCounts: Map<string, number> = new Map();
  
  // Elevator tracking (for maintenance calculations)
  private elevatorAges: Map<string, number> = new Map(); // elevatorId -> age in quarters
  private elevatorUsage: Map<string, number> = new Map(); // elevatorId -> trips this quarter
  
  constructor() {
    // Subscribe to building placement events to track elevator construction
    getEventBus().on('BUILDING_PLACED', (event: any) => {
      if (event.buildingType === 'elevatorShaft') {
        this.elevatorAges.set(event.buildingId, 0);
        this.elevatorUsage.set(event.buildingId, 0);
      }
    });
  }
  
  // ==========================================================================
  // MAIN UPDATE LOOP
  // ==========================================================================
  
  /**
   * Update economy system each tick
   */
  update(tower: Tower, clock: GameClock, currentTick: number): void {
    // Check if a quarter has passed
    if (currentTick - this.lastQuarterTick >= TICKS_PER_QUARTER) {
      this.processQuarter(tower, clock, currentTick);
      this.lastQuarterTick = currentTick;
    }
    
    // Check bankruptcy status every tick
    if (tower.funds < 0) {
      this.updateBankruptcyState(tower, currentTick);
    } else if (this.bankruptcyState.isInDebt) {
      // Recovered from debt!
      this.clearBankruptcyState();
    }
  }
  
  // ==========================================================================
  // QUARTERLY PROCESSING
  // ==========================================================================
  
  /**
   * Process end-of-quarter collection and expenses
   */
  private processQuarter(tower: Tower, clock: GameClock, currentTick: number): void {
    this.quarterNumber++;
    
    console.log(`\n💰 ========== QUARTER ${this.quarterNumber} COLLECTION ==========`);
    
    const report: QuarterlyReport = {
      quarterNumber: this.quarterNumber,
      timestamp: currentTick,
      
      // Income (will be calculated)
      officeRent: 0,
      hotelRevenue: this.pendingHotelRevenue,
      shopRevenue: 0,
      restaurantRevenue: 0,
      condoSales: this.pendingCondoSales,
      totalIncome: 0,
      
      // Expenses (will be calculated)
      elevatorMaintenance: 0,
      staffWages: 0,
      utilities: 0,
      totalExpenses: 0,
      
      // Net result
      netProfit: 0,
      
      // Metadata
      totalPopulation: tower.population,
      occupancyRate: 0,
    };
    
    // Calculate all income sources
    report.officeRent = this.calculateOfficeRent(tower);
    report.shopRevenue = this.calculateShopRevenue(tower);
    report.restaurantRevenue = this.calculateRestaurantRevenue(tower);
    
    // Calculate all expenses
    report.elevatorMaintenance = this.calculateElevatorMaintenance(tower);
    report.staffWages = this.calculateStaffWages(tower);
    report.utilities = this.calculateUtilities(tower);
    
    // Calculate totals
    report.totalIncome = 
      report.officeRent +
      report.hotelRevenue +
      report.shopRevenue +
      report.restaurantRevenue +
      report.condoSales;
    
    report.totalExpenses =
      report.elevatorMaintenance +
      report.staffWages +
      report.utilities;
    
    report.netProfit = report.totalIncome - report.totalExpenses;
    
    // Calculate occupancy rate
    report.occupancyRate = this.calculateOccupancyRate(tower);
    
    // Apply profit/loss to tower funds
    tower.funds += report.netProfit;
    
    // Log detailed report
    this.logQuarterlyReport(report, tower);
    
    // Store report
    this.quarterReports.push(report);
    if (this.quarterReports.length > 20) {
      this.quarterReports.shift(); // Keep last 20 quarters
    }
    
    // Play sound effect
    if (report.netProfit > 0) {
      getSoundManager().playCashRegister();
    }
    
    // Emit event for UI
    getEventBus().emitSync({
      type: 'QUARTERLY_COLLECTION',
      report,
      newBalance: tower.funds,
    });
    
    // Check for tenant departures due to stress
    this.checkTenantDepartures(tower);
    
    // Reset temporary counters
    this.pendingHotelRevenue = 0;
    this.pendingCondoSales = 0;
    this.foodCustomerCounts.clear();
    this.shopCustomerCounts.clear();
    
    // Age elevators
    this.ageElevators();
  }
  
  // ==========================================================================
  // INCOME CALCULATIONS
  // ==========================================================================
  
  /**
   * Calculate office rent income (quarterly)
   * Higher floors = higher rent due to prestige and views
   */
  private calculateOfficeRent(tower: Tower): number {
    let totalRent = 0;
    
    const offices = Object.values(tower.buildingsById).filter(
      (b: any) => b.type === 'office' && b.state === 'active'
    );
    
    for (const office of offices) {
      const config = BUILDING_CONFIGS.office;
      const baseRent = config.incomePerQuarter;
      
      // Floor bonus (higher floors = more prestigious)
      const floorLevel = office.position.floor;
      const floorBonus = Math.min(
        floorLevel * FLOOR_RENT_BONUS_PER_LEVEL,
        FLOOR_RENT_MAX_BONUS
      );
      
      // Occupancy multiplier (empty offices don't pay rent)
      const occupancyRate = office.occupantIds.length / config.capacity;
      
      // Calculate final rent
      const rent = baseRent * (1 + floorBonus) * occupancyRate;
      totalRent += rent;
    }
    
    return Math.floor(totalRent);
  }
  
  /**
   * Calculate shop revenue (quarterly, based on customer visits)
   */
  private calculateShopRevenue(tower: Tower): number {
    let totalRevenue = 0;
    
    const shops = Object.values(tower.buildingsById).filter(
      (b: any) => b.type === 'shop' && b.state === 'active'
    );
    
    for (const shop of shops) {
      const customerCount = this.shopCustomerCounts.get(shop.id) || 0;
      const revenue = customerCount * SHOP_REVENUE_PER_CUSTOMER;
      totalRevenue += revenue;
    }
    
    return Math.floor(totalRevenue);
  }
  
  /**
   * Calculate restaurant revenue (quarterly, based on customer visits)
   */
  private calculateRestaurantRevenue(tower: Tower): number {
    let totalRevenue = 0;
    
    const restaurants = Object.values(tower.buildingsById).filter(
      (b: any) => (b.type === 'restaurant' || b.type === 'fastFood') && b.state === 'active'
    );
    
    for (const restaurant of restaurants) {
      const customerCount = this.foodCustomerCounts.get(restaurant.id) || 0;
      const revenuePerCustomer = restaurant.type === 'restaurant' 
        ? FOOD_REVENUE.restaurant 
        : FOOD_REVENUE.fastFood;
      const revenue = customerCount * revenuePerCustomer;
      totalRevenue += revenue;
    }
    
    return Math.floor(totalRevenue);
  }
  
  // ==========================================================================
  // EXPENSE CALCULATIONS
  // ==========================================================================
  
  /**
   * Calculate elevator maintenance costs
   * Costs scale with number of shafts, usage, and age
   */
  private calculateElevatorMaintenance(tower: Tower): number {
    let totalMaintenance = 0;
    
    // Count elevator shafts
    const elevatorShafts = tower.elevators || [];
    
    for (const shaft of elevatorShafts) {
      const shaftId = shaft.id || 'unknown';
      const age = this.elevatorAges.get(shaftId) || 0;
      const usage = this.elevatorUsage.get(shaftId) || 0;
      
      // Base maintenance
      let maintenance = ELEVATOR_BASE_MAINTENANCE;
      
      // Usage multiplier (more trips = more wear)
      const usageFactor = (usage / 100) * ELEVATOR_USAGE_MULTIPLIER;
      maintenance *= (1 + usageFactor);
      
      // Age multiplier (older elevators cost more to maintain)
      const ageFactor = age * ELEVATOR_AGE_MULTIPLIER;
      maintenance *= (1 + ageFactor);
      
      totalMaintenance += maintenance;
      
      // Reset usage counter for next quarter
      this.elevatorUsage.set(shaftId, 0);
    }
    
    return Math.floor(totalMaintenance);
  }
  
  /**
   * Calculate staff wages
   * Security, housekeeping, and hotel desk staff
   */
  private calculateStaffWages(tower: Tower): number {
    let totalWages = 0;
    
    const buildings = Object.values(tower.buildingsById);
    
    // Count staff buildings
    const securityOffices = buildings.filter((b: any) => b.type === 'security').length;
    const housekeepingRooms = buildings.filter((b: any) => b.type === 'housekeeping').length;
    
    // Count hotel rooms (need desk staff)
    const hotelRooms = buildings.filter((b: any) => 
      b.type === 'hotelSingle' || b.type === 'hotelTwin' || b.type === 'hotelSuite'
    ).length;
    const hotelDeskStaff = Math.ceil(hotelRooms / 20); // 1 desk staff per 20 rooms
    
    // Calculate total wages
    totalWages += securityOffices * STAFF_WAGES.security;
    totalWages += housekeepingRooms * STAFF_WAGES.housekeeping;
    totalWages += hotelDeskStaff * STAFF_WAGES.hotelDesk;
    
    return Math.floor(totalWages);
  }
  
  /**
   * Calculate utility costs
   * Electricity and water scale with building size and population
   */
  private calculateUtilities(tower: Tower): number {
    let totalUtilities = UTILITY_COSTS.baseUtilities;
    
    // Count floors
    const floorCount = Object.keys(tower.floorsById).length;
    totalUtilities += floorCount * UTILITY_COSTS.electricityPerFloor;
    
    // Per-person costs (electricity + water)
    const population = tower.population || 0;
    totalUtilities += population * (UTILITY_COSTS.electricityPerPerson + UTILITY_COSTS.waterPerPerson);
    
    return Math.floor(totalUtilities);
  }
  
  // ==========================================================================
  // SPECIAL INCOME EVENTS
  // ==========================================================================
  
  /**
   * Register a hotel checkout (called by HotelSystem)
   * Revenue is accumulated and paid out at next quarter
   */
  registerHotelCheckout(hotelType: 'hotelSingle' | 'hotelTwin' | 'hotelSuite', nightsStayed: number = 1): void {
    const rate = HOTEL_RATES[hotelType];
    const revenue = rate * nightsStayed;
    this.pendingHotelRevenue += revenue;
  }
  
  /**
   * Register a condo sale (one-time payment)
   * Price varies by floor level and random market conditions
   */
  registerCondoSale(floor: number): number {
    const basePrice = CONDO_BASE_PRICE;
    const floorBonus = floor * CONDO_FLOOR_BONUS;
    
    // Random market variance (±15%)
    const variance = 1 + (Math.random() * 2 - 1) * CONDO_PRICE_VARIANCE;
    
    const salePrice = Math.floor((basePrice + floorBonus) * variance);
    this.pendingCondoSales += salePrice;
    
    console.log(`🏠 Condo sold on floor ${floor} for $${salePrice.toLocaleString()}`);
    
    return salePrice;
  }
  
  /**
   * Register a customer visit to a food establishment
   */
  registerFoodCustomer(buildingId: string): void {
    const currentCount = this.foodCustomerCounts.get(buildingId) || 0;
    this.foodCustomerCounts.set(buildingId, currentCount + 1);
  }
  
  /**
   * Register a customer visit to a shop
   */
  registerShopCustomer(buildingId: string): void {
    const currentCount = this.shopCustomerCounts.get(buildingId) || 0;
    this.shopCustomerCounts.set(buildingId, currentCount + 1);
  }
  
  /**
   * Register an elevator trip (for maintenance calculations)
   */
  registerElevatorTrip(elevatorId: string): void {
    const currentUsage = this.elevatorUsage.get(elevatorId) || 0;
    this.elevatorUsage.set(elevatorId, currentUsage + 1);
  }
  
  // ==========================================================================
  // FINANCIAL EVENTS
  // ==========================================================================
  
  /**
   * Check for tenant departures due to poor evaluation (NEW!)
   * Buildings with red evaluation (<40%) will lose tenants quarterly
   * 
   * This is what makes placement MATTER. Bad elevators = lost income.
   * 
   * @param tower Tower instance
   * @param evaluationSystem Evaluation system to get building scores
   */
  checkTenantDepartures(tower: Tower, evaluationSystem?: any): void {
    const departures: TenantDeparture[] = [];
    
    const buildings = Object.values(tower.buildingsById);
    
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
          const departure: TenantDeparture = {
            buildingId: building.id,
            buildingType: building.type,
            floor: building.position.floor,
            reason: 'evaluation',
            lostIncome: building.incomePerQuarter || 0,
          };
          
          departures.push(departure);
          
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
          const departure: TenantDeparture = {
            buildingId: building.id,
            buildingType: building.type,
            floor: building.position.floor,
            reason: 'evaluation',
            lostIncome: building.incomePerQuarter || 0,
          };
          
          departures.push(departure);
          
          building.state = 'vacant';
          building.occupantIds = [];
          building.incomePerQuarter = 0;
          
          console.log(`⚠️  Tenant left ${building.type} on floor ${building.position.floor} (eval: ${evaluation}%)`);
        }
      }
    }
    
    // Emit events for UI
    if (departures.length > 0) {
      getEventBus().emitSync({
        type: 'TENANT_DEPARTURES',
        departures,
        totalLostIncome: departures.reduce((sum, d) => sum + d.lostIncome, 0),
      });
    }
  }
  
  /**
   * Update bankruptcy state
   * If funds stay negative too long, game over!
   */
  private updateBankruptcyState(tower: Tower, currentTick: number): void {
    if (!this.bankruptcyState.isInDebt) {
      // Just went into debt
      this.bankruptcyState.isInDebt = true;
      this.bankruptcyState.debtStartTick = currentTick;
      this.bankruptcyState.debtAmount = Math.abs(tower.funds);
      this.bankruptcyState.warningsIssued = 0;
      this.bankruptcyState.gracePeriodRemaining = BANKRUPTCY_GRACE_PERIOD_TICKS;
      
      console.log(`⚠️  WARNING: Funds are negative! You have 3 game-days to recover.`);
      
      // Play warning sound
      getSoundManager().playWarning();
      
      getEventBus().emitSync({
        type: 'BANKRUPTCY_WARNING',
        funds: tower.funds,
        severity: 1,
        debtAmount: this.bankruptcyState.debtAmount,
        gracePeriodRemaining: this.bankruptcyState.gracePeriodRemaining,
      });
    } else {
      // Still in debt
      const ticksInDebt = currentTick - (this.bankruptcyState.debtStartTick || 0);
      this.bankruptcyState.gracePeriodRemaining = BANKRUPTCY_GRACE_PERIOD_TICKS - ticksInDebt;
      this.bankruptcyState.debtAmount = Math.abs(tower.funds);
      
      // Check warning thresholds
      for (let i = 0; i < BANKRUPTCY_WARNING_THRESHOLDS.length; i++) {
        if (tower.funds <= BANKRUPTCY_WARNING_THRESHOLDS[i] && this.bankruptcyState.warningsIssued <= i) {
          this.bankruptcyState.warningsIssued = i + 1;
          
          console.log(`🚨 BANKRUPTCY WARNING ${i + 1}: Debt at $${Math.abs(tower.funds).toLocaleString()}`);
          
          // Play escalating warning sounds
          if (i === 0) getSoundManager().playWarning();
          if (i === 1) getSoundManager().playFireAlarm();
          
          getEventBus().emitSync({
            type: 'BANKRUPTCY_WARNING',
            funds: tower.funds,
            severity: i + 2,
            debtAmount: this.bankruptcyState.debtAmount,
            gracePeriodRemaining: this.bankruptcyState.gracePeriodRemaining,
          });
        }
      }
      
      // Check if grace period expired
      if (this.bankruptcyState.gracePeriodRemaining <= 0) {
        console.log(`💀 GAME OVER: Bankruptcy! You ran out of money.`);
        
        getEventBus().emitSync({
          type: 'GAME_OVER',
          reason: 'bankruptcy',
          finalDebt: this.bankruptcyState.debtAmount,
        });
      }
    }
  }
  
  /**
   * Clear bankruptcy state when funds recover
   */
  private clearBankruptcyState(): void {
    console.log(`✅ Debt cleared! Back in the black.`);
    
    this.bankruptcyState = {
      isInDebt: false,
      debtStartTick: null,
      debtAmount: 0,
      warningsIssued: 0,
      gracePeriodRemaining: 0,
    };
    
    getEventBus().emitSync({
      type: 'BANKRUPTCY_CLEARED',
    });
  }
  
  // ==========================================================================
  // UTILITIES & HELPERS
  // ==========================================================================
  
  /**
   * Calculate overall building occupancy rate
   */
  private calculateOccupancyRate(tower: Tower): number {
    let totalCapacity = 0;
    let totalOccupied = 0;
    
    const buildings = Object.values(tower.buildingsById);
    
    for (const building of buildings) {
      if (building.type === 'office' || building.type === 'condo') {
        const config = BUILDING_CONFIGS[building.type];
        totalCapacity += config.capacity;
        totalOccupied += building.occupantIds.length;
      }
    }
    
    return totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0;
  }
  
  /**
   * Age all elevators by one quarter
   */
  private ageElevators(): void {
    for (const [elevatorId, age] of this.elevatorAges.entries()) {
      this.elevatorAges.set(elevatorId, age + 1);
    }
  }
  
  /**
   * Log detailed quarterly report to console
   */
  private logQuarterlyReport(report: QuarterlyReport, tower: Tower): void {
    console.log(`\n📊 Quarter ${report.quarterNumber} Financial Report`);
    console.log(`================================================`);
    console.log(`\n💵 INCOME:`);
    console.log(`  Office Rent:        $${report.officeRent.toLocaleString()}`);
    console.log(`  Hotel Revenue:      $${report.hotelRevenue.toLocaleString()}`);
    console.log(`  Shop Sales:         $${report.shopRevenue.toLocaleString()}`);
    console.log(`  Restaurant Sales:   $${report.restaurantRevenue.toLocaleString()}`);
    console.log(`  Condo Sales:        $${report.condoSales.toLocaleString()}`);
    console.log(`  ────────────────────────────────`);
    console.log(`  TOTAL INCOME:       $${report.totalIncome.toLocaleString()}`);
    
    console.log(`\n💸 EXPENSES:`);
    console.log(`  Elevator Maint:     -$${report.elevatorMaintenance.toLocaleString()}`);
    console.log(`  Staff Wages:        -$${report.staffWages.toLocaleString()}`);
    console.log(`  Utilities:          -$${report.utilities.toLocaleString()}`);
    console.log(`  ────────────────────────────────`);
    console.log(`  TOTAL EXPENSES:     -$${report.totalExpenses.toLocaleString()}`);
    
    console.log(`\n📈 NET RESULT:`);
    const profitColor = report.netProfit >= 0 ? '✅' : '❌';
    console.log(`  ${profitColor} Net Profit:        ${report.netProfit >= 0 ? '+' : ''}$${report.netProfit.toLocaleString()}`);
    console.log(`  💰 New Balance:       $${tower.funds.toLocaleString()}`);
    console.log(`  👥 Population:        ${report.totalPopulation}`);
    console.log(`  🏢 Occupancy Rate:    ${report.occupancyRate.toFixed(1)}%`);
    console.log(`================================================\n`);
  }
  
  // ==========================================================================
  // PUBLIC QUERY METHODS
  // ==========================================================================
  
  /**
   * Get latest quarterly report
   */
  getLatestReport(): QuarterlyReport | null {
    return this.quarterReports[this.quarterReports.length - 1] || null;
  }
  
  /**
   * Get all quarterly reports
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
    return TICKS_PER_QUARTER - (currentTick - this.lastQuarterTick);
  }
  
  /**
   * Get comprehensive economy statistics
   */
  getEconomyStats(tower: Tower): EconomyStats {
    const report = this.getLatestReport();
    
    const dailyIncome = report ? report.totalIncome * QUARTERS_PER_DAY : 0;
    const dailyExpenses = report ? report.totalExpenses * QUARTERS_PER_DAY : 0;
    
    return {
      currentFunds: tower.funds,
      dailyIncome,
      dailyExpenses,
      netDaily: dailyIncome - dailyExpenses,
      bankruptcyState: { ...this.bankruptcyState },
      lastReport: report,
    };
  }
  
  /**
   * Get pending income (not yet collected)
   */
  getPendingIncome(): { hotel: number; condos: number; total: number } {
    return {
      hotel: this.pendingHotelRevenue,
      condos: this.pendingCondoSales,
      total: this.pendingHotelRevenue + this.pendingCondoSales,
    };
  }
  
  /**
   * Get bankruptcy state
   */
  getBankruptcyState(): BankruptcyState {
    return { ...this.bankruptcyState };
  }
  
  // ==========================================================================
  // SERIALIZATION
  // ==========================================================================
  
  /**
   * Serialize economy state for saving
   */
  serialize(): any {
    return {
      lastQuarterTick: this.lastQuarterTick,
      quarterNumber: this.quarterNumber,
      quarterReports: this.quarterReports,
      bankruptcyState: this.bankruptcyState,
      pendingHotelRevenue: this.pendingHotelRevenue,
      pendingCondoSales: this.pendingCondoSales,
      elevatorAges: Array.from(this.elevatorAges.entries()),
    };
  }
  
  /**
   * Deserialize economy state from saved data
   */
  deserialize(data: any): void {
    this.lastQuarterTick = data.lastQuarterTick || 0;
    this.quarterNumber = data.quarterNumber || 0;
    this.quarterReports = data.quarterReports || [];
    this.bankruptcyState = data.bankruptcyState || {
      isInDebt: false,
      debtStartTick: null,
      debtAmount: 0,
      warningsIssued: 0,
      gracePeriodRemaining: 0,
    };
    this.pendingHotelRevenue = data.pendingHotelRevenue || 0;
    this.pendingCondoSales = data.pendingCondoSales || 0;
    
    if (data.elevatorAges) {
      this.elevatorAges = new Map(data.elevatorAges);
    }
  }
}
