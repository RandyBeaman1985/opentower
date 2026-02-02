/**
 * Demo: Create all 21 building types and verify properties
 * Run this to test that all buildings work correctly
 */

import {
  createCondo,
  createOffice,
  createFastFood,
  createRestaurant,
  createShop,
  createHotelSingle,
  createHotelTwin,
  createHotelSuite,
  createPartyHall,
  createCinema,
  createLobby,
  createStairs,
  createEscalator,
  createParkingRamp,
  createParkingSpace,
  createHousekeeping,
  createSecurity,
  createMedical,
  createRecycling,
  createMetro,
  createCathedral,
  BUILDING_CONFIGS,
} from './index';

import { ALL_BUILDING_TYPES, printAllBuildings } from './BUILDINGS';

/**
 * Demo: Create one of each building type
 */
export function demoCreateAllBuildings() {
  console.log('=== Creating all 21 SimTower building types ===\n');

  const buildings = {
    // RESIDENTIAL
    condo: createCondo(5, 10),

    // COMMERCIAL
    office: createOffice(8, 50),
    fastFood: createFastFood(1, 100),
    restaurant: createRestaurant(15, 200),
    shop: createShop(1, 150),

    // HOTEL
    hotelSingle: createHotelSingle(10, 30),
    hotelTwin: createHotelTwin(12, 60),
    hotelSuite: createHotelSuite(20, 90),

    // ENTERTAINMENT
    partyHall: createPartyHall(5, 120),
    cinema: createCinema(8, 180),

    // INFRASTRUCTURE
    lobby: createLobby(1, 0),
    stairs: createStairs(5, 40),
    escalator: createEscalator(1, 80),
    parkingRamp: createParkingRamp(-1, 100),
    parkingSpace: createParkingSpace(-1, 110),

    // SERVICES
    housekeeping: createHousekeeping(3, 140),
    security: createSecurity(2, 160),
    medical: createMedical(4, 200),
    recycling: createRecycling(-2, 50),

    // LANDMARKS
    metro: createMetro(-3, 0),
    cathedral: createCathedral(1, 300),
  };

  // Verify each building has correct properties
  let allValid = true;

  for (const [type, building] of Object.entries(buildings)) {
    const config = BUILDING_CONFIGS[building.type];
    const valid =
      building.type === type &&
      building.width === config.width &&
      building.height === config.height &&
      building.incomePerQuarter === config.incomePerQuarter &&
      building.maintenanceCostPerQuarter === config.maintenancePerQuarter;

    const status = valid ? '✅' : '❌';
    console.log(`${status} ${config.name}: ${building.width}×${building.height}, $${config.cost.toLocaleString()}`);

    if (!valid) {
      console.error(`  ERROR: Invalid properties for ${type}`);
      allValid = false;
    }
  }

  console.log(`\n${allValid ? '✅ All 21 buildings created successfully!' : '❌ Some buildings failed validation'}`);
  console.log(`Total: ${Object.keys(buildings).length} / ${ALL_BUILDING_TYPES.length} building types\n`);

  return buildings;
}

/**
 * Demo: Show building stats
 */
export function demoShowStats() {
  console.log('=== Building Statistics ===\n');

  let totalCost = 0;
  let totalIncome = 0;
  let totalMaintenance = 0;
  
  const stats = {
    byCategory: {} as Record<string, number>,
    byStarRating: {} as Record<number, number>,
    noiseSources: 0,
    noiseSensitive: 0,
    incomeGenerators: 0,
  };

  for (const type of ALL_BUILDING_TYPES) {
    const config = BUILDING_CONFIGS[type];
    
    // Accumulate costs
    totalCost += config.cost;
    totalIncome += config.incomePerQuarter;
    totalMaintenance += config.maintenancePerQuarter;

    // Category count
    stats.byCategory[config.category] = (stats.byCategory[config.category] || 0) + 1;
    
    // Star rating count
    stats.byStarRating[config.unlockStar] = (stats.byStarRating[config.unlockStar] || 0) + 1;

    // Special properties
    if (config.noiseSource) stats.noiseSources++;
    if (config.noiseSensitive) stats.noiseSensitive++;
    if (config.incomePerQuarter > 0) stats.incomeGenerators++;
  }

  console.log('Total Cost (all buildings): $' + totalCost.toLocaleString());
  console.log('Total Income/Quarter: $' + totalIncome.toLocaleString());
  console.log('Total Maintenance/Quarter: $' + totalMaintenance.toLocaleString());
  console.log('Net Income/Quarter: $' + (totalIncome - totalMaintenance).toLocaleString());
  console.log('');

  console.log('By Category:');
  for (const [category, count] of Object.entries(stats.byCategory)) {
    console.log(`  ${category}: ${count}`);
  }
  console.log('');

  console.log('By Star Rating:');
  for (let star = 1; star <= 6; star++) {
    const count = stats.byStarRating[star] || 0;
    if (count > 0) {
      console.log(`  ${star}★: ${count} buildings`);
    }
  }
  console.log('');

  console.log('Special Properties:');
  console.log(`  Noise Sources: ${stats.noiseSources}`);
  console.log(`  Noise Sensitive: ${stats.noiseSensitive}`);
  console.log(`  Income Generators: ${stats.incomeGenerators}`);
  console.log('');
}

/**
 * Run all demos
 */
export function runAllDemos() {
  printAllBuildings();
  demoCreateAllBuildings();
  demoShowStats();
}

// Uncomment to run demos when imported
// runAllDemos();
