/**
 * Building Health System - Building damage and repair mechanics
 *
 * Buildings can be damaged by fires, bombs, or neglect.
 * Damaged buildings have reduced income and may lose tenants.
 * Buildings can be repaired (costs money).
 *
 * @module simulation/BuildingHealthSystem
 */

import type { Tower, Building } from '@/interfaces';
import { getEventBus } from '@core/EventBus';

/**
 * Building health state
 */
export interface BuildingHealth {
  buildingId: string;
  health: number; // 0-100 (100 = perfect, 0 = destroyed)
  lastDamageSource: 'fire' | 'bomb' | 'neglect' | null;
  lastDamageTime: number; // tick
  repairCost: number; // Cost to fully repair
}

/**
 * Health status categories
 */
export enum HealthStatus {
  PERFECT = 'PERFECT',     // 100%
  EXCELLENT = 'EXCELLENT', // 80-99%
  GOOD = 'GOOD',           // 60-79%
  FAIR = 'FAIR',           // 40-59%
  POOR = 'POOR',           // 20-39%
  CRITICAL = 'CRITICAL',   // 1-19%
  DESTROYED = 'DESTROYED', // 0%
}

/**
 * BuildingHealthSystem - Manages building damage and repair
 */
export class BuildingHealthSystem {
  private health: Map<string, BuildingHealth> = new Map();
  private lastNaturalDecayTick = 0;
  private NATURAL_DECAY_INTERVAL = 86400; // Once per game day (24 hours × 60 ticks)

  /**
   * Initialize health for a new building
   */
  initializeBuilding(buildingId: string): void {
    if (this.health.has(buildingId)) return;

    this.health.set(buildingId, {
      buildingId,
      health: 100,
      lastDamageSource: null,
      lastDamageTime: 0,
      repairCost: 0,
    });
  }

  /**
   * Remove building from tracking
   */
  removeBuilding(buildingId: string): void {
    this.health.delete(buildingId);
  }

  /**
   * Update health system (called every tick)
   */
  update(tower: Tower, currentTick: number): void {
    // Natural decay (very slow - 0.1% per day if not maintained)
    if (currentTick - this.lastNaturalDecayTick > this.NATURAL_DECAY_INTERVAL) {
      this.applyNaturalDecay(tower);
      this.lastNaturalDecayTick = currentTick;
    }

    // Apply health effects to buildings
    this.applyHealthEffects(tower);
  }

  /**
   * Apply damage to a building
   */
  damageBuilding(
    buildingId: string,
    damageAmount: number,
    source: 'fire' | 'bomb' | 'neglect',
    currentTick: number
  ): void {
    let healthData = this.health.get(buildingId);
    if (!healthData) {
      this.initializeBuilding(buildingId);
      healthData = this.health.get(buildingId)!;
    }

    const oldHealth = healthData.health;
    healthData.health = Math.max(0, healthData.health - damageAmount);
    healthData.lastDamageSource = source;
    healthData.lastDamageTime = currentTick;

    // Calculate repair cost (proportional to damage)
    const damagePercent = (100 - healthData.health) / 100;
    healthData.repairCost = Math.floor(damagePercent * 10000); // Max $10K repair for destroyed building

    // Emit damage event
    const status = this.getHealthStatus(healthData.health);
    if (status !== this.getHealthStatus(oldHealth)) {
      getEventBus().emitSync({
        type: 'BUILDING_HEALTH_CHANGED',
        timestamp: Date.now(),
        data: {
          buildingId,
          health: healthData.health,
          status,
          source,
        },
      } as any);

      // Console feedback
      const emoji = this.getHealthEmoji(status);
      console.log(
        `${emoji} Building ${buildingId} health: ${oldHealth.toFixed(0)}% → ${healthData.health.toFixed(0)}% (${status})`
      );
    }

    // Destroyed warning
    if (healthData.health === 0 && oldHealth > 0) {
      console.warn(`💀 BUILDING DESTROYED: ${buildingId} (${source})`);
      getEventBus().emitSync({
        type: 'NOTIFICATION',
        timestamp: Date.now(),
        data: {
          message: `Building destroyed by ${source}!`,
          severity: 'error',
        },
      } as any);
    }
  }

  /**
   * Repair a building (costs money)
   */
  repairBuilding(buildingId: string, tower: Tower): boolean {
    const healthData = this.health.get(buildingId);
    if (!healthData) return false;

    const repairCost = healthData.repairCost;

    // Check if player can afford
    if (tower.funds < repairCost) {
      console.warn(`⚠️ Cannot repair ${buildingId}: Need $${repairCost}, have $${tower.funds}`);
      return false;
    }

    // Deduct cost
    tower.funds -= repairCost;

    // Restore health
    const oldHealth = healthData.health;
    healthData.health = 100;
    healthData.repairCost = 0;
    healthData.lastDamageSource = null;

    console.log(`🔧 Repaired ${buildingId}: ${oldHealth.toFixed(0)}% → 100% (Cost: $${repairCost})`);

    getEventBus().emitSync({
      type: 'BUILDING_HEALTH_CHANGED',
      timestamp: Date.now(),
      data: {
        buildingId,
        health: 100,
        status: HealthStatus.PERFECT,
        source: null,
      },
    } as any);

    return true;
  }

  /**
   * Get health for a building
   */
  getHealth(buildingId: string): number {
    return this.health.get(buildingId)?.health ?? 100;
  }

  /**
   * Get health data for a building
   */
  getHealthData(buildingId: string): BuildingHealth | null {
    return this.health.get(buildingId) || null;
  }

  /**
   * Get health status category
   */
  getHealthStatus(health: number): HealthStatus {
    if (health === 100) return HealthStatus.PERFECT;
    if (health >= 80) return HealthStatus.EXCELLENT;
    if (health >= 60) return HealthStatus.GOOD;
    if (health >= 40) return HealthStatus.FAIR;
    if (health >= 20) return HealthStatus.POOR;
    if (health > 0) return HealthStatus.CRITICAL;
    return HealthStatus.DESTROYED;
  }

  /**
   * Get emoji for health status
   */
  private getHealthEmoji(status: HealthStatus): string {
    switch (status) {
      case HealthStatus.PERFECT:
        return '✨';
      case HealthStatus.EXCELLENT:
        return '💚';
      case HealthStatus.GOOD:
        return '💛';
      case HealthStatus.FAIR:
        return '🧡';
      case HealthStatus.POOR:
        return '❤️';
      case HealthStatus.CRITICAL:
        return '💔';
      case HealthStatus.DESTROYED:
        return '💀';
    }
  }

  /**
   * Apply natural decay to all buildings
   */
  private applyNaturalDecay(tower: Tower): void {
    for (const building of Object.values(tower.buildingsById)) {
      if (!building) continue;

      // Skip lobby (never decays)
      if (building.type === 'lobby') continue;

      // 0.1% decay per day (very slow - 1000 days to reach 0 without maintenance)
      // Use 0 as currentTick since we don't have access to it here
      this.damageBuilding(building.id, 0.1, 'neglect', 0);
    }
  }

  /**
   * Apply health effects to buildings (income reduction, tenant loss)
   */
  private applyHealthEffects(tower: Tower): void {
    for (const building of Object.values(tower.buildingsById)) {
      if (!building) continue;

      const health = this.getHealth(building.id);

      // Destroyed buildings generate no income
      if (health === 0) {
        (building as any).income = 0;
        continue;
      }

      // Health affects income (linear reduction)
      // 100% health = 100% income
      // 50% health = 50% income
      // This is applied by the economic system reading building.healthMultiplier
      (building as any).healthMultiplier = health / 100;
    }
  }

  /**
   * Get income multiplier for a building based on health
   */
  getIncomeMultiplier(buildingId: string): number {
    const health = this.getHealth(buildingId);
    if (health === 0) return 0;
    return health / 100;
  }

  /**
   * Get all buildings needing repair
   */
  getBuildingsNeedingRepair(): BuildingHealth[] {
    return Array.from(this.health.values()).filter((h) => h.health < 100);
  }

  /**
   * Serialize health data
   */
  serialize(): Record<string, BuildingHealth> {
    const data: Record<string, BuildingHealth> = {};
    for (const [id, health] of this.health) {
      data[id] = { ...health };
    }
    return data;
  }

  /**
   * Deserialize health data
   */
  deserialize(data: Record<string, BuildingHealth>): void {
    this.health.clear();
    for (const [id, health] of Object.entries(data)) {
      this.health.set(id, health);
    }
  }

  /**
   * Clear all health data
   */
  clear(): void {
    this.health.clear();
  }
}
