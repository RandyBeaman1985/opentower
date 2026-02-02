/**
 * RandomEventSystem - Manages random tower events
 * 
 * Adds variety and unpredictability:
 * - VIP visitor (bonus income)
 * - Maintenance issue (costs money)
 * - Fire drill (everyone evacuates)
 * - Power outage (elevators stop temporarily)
 * 
 * Events occur randomly based on probability and cooldown timers.
 */

import type { Tower } from '@/interfaces';
import { getEventBus } from '@core/EventBus';

export type RandomEventType = 'vip_visitor' | 'maintenance' | 'fire_drill' | 'power_outage';

export interface RandomEvent {
  id: string;
  type: RandomEventType;
  title: string;
  description: string;
  startTick: number;
  durationTicks: number; // 0 for instant events
  effect: {
    type: 'income' | 'cost' | 'status';
    value: number;
  };
  active: boolean;
}

export class RandomEventSystem {
  private activeEvents: Map<string, RandomEvent> = new Map();
  private lastEventTick: number = 0;
  private eventCooldownTicks: number = 3600; // ~1 minute between events (60 ticks/sec * 60 sec)
  private nextEventId: number = 1;

  // Event probabilities (per check, when off cooldown)
  private readonly EVENT_PROBABILITIES: Record<RandomEventType, number> = {
    vip_visitor: 0.3,      // 30% chance
    maintenance: 0.4,      // 40% chance
    fire_drill: 0.2,       // 20% chance (rare, disruptive)
    power_outage: 0.1,     // 10% chance (very rare)
  };

  /**
   * Update random events (called every tick)
   */
  update(tower: Tower, currentTick: number): void {
    // Update active events
    this.updateActiveEvents(currentTick);

    // Check for new events (only if off cooldown)
    if (currentTick - this.lastEventTick > this.eventCooldownTicks) {
      this.checkForRandomEvent(tower, currentTick);
    }
  }

  /**
   * Update active events and end expired ones
   */
  private updateActiveEvents(currentTick: number): void {
    for (const [_id, event] of this.activeEvents) {
      const elapsed = currentTick - event.startTick;
      
      if (event.durationTicks > 0 && elapsed >= event.durationTicks) {
        // Event finished
        this.endEvent(event);
      }
    }
  }

  /**
   * Check if a random event should occur
   */
  private checkForRandomEvent(tower: Tower, currentTick: number): void {
    // Base probability: 5% chance per check (every ~1 minute)
    if (Math.random() > 0.05) return;

    // Pick a random event type
    const eventType = this.selectRandomEventType();
    if (!eventType) return;

    // Create and trigger event
    this.triggerEvent(eventType, tower, currentTick);
    this.lastEventTick = currentTick;
  }

  /**
   * Select a random event type based on probabilities
   */
  private selectRandomEventType(): RandomEventType | null {
    const roll = Math.random();
    let cumulative = 0;

    for (const [type, probability] of Object.entries(this.EVENT_PROBABILITIES)) {
      cumulative += probability;
      if (roll <= cumulative) {
        return type as RandomEventType;
      }
    }

    return null;
  }

  /**
   * Trigger a specific event
   */
  private triggerEvent(type: RandomEventType, tower: Tower, currentTick: number): void {
    let event: RandomEvent;

    switch (type) {
      case 'vip_visitor':
        event = this.createVIPVisitorEvent(tower, currentTick);
        break;
      case 'maintenance':
        event = this.createMaintenanceEvent(tower, currentTick);
        break;
      case 'fire_drill':
        event = this.createFireDrillEvent(currentTick);
        break;
      case 'power_outage':
        event = this.createPowerOutageEvent(currentTick);
        break;
    }

    this.activeEvents.set(event.id, event);

    // Emit event to game
    getEventBus().emitSync({
      type: 'RANDOM_EVENT',
      timestamp: Date.now(),
      data: { event }
    } as any);

    console.log(`🎲 Random Event: ${event.title} - ${event.description}`);

    // Apply immediate effects
    if (event.effect.type === 'income') {
      tower.funds += event.effect.value;
      console.log(`  💰 Income: +$${event.effect.value.toLocaleString()}`);
    } else if (event.effect.type === 'cost') {
      tower.funds -= event.effect.value;
      console.log(`  💸 Cost: -$${event.effect.value.toLocaleString()}`);
    }
  }

  /**
   * Create VIP visitor event (bonus income)
   */
  private createVIPVisitorEvent(_tower: Tower, currentTick: number): RandomEvent {
    const bonusIncome = Math.floor(5000 + Math.random() * 15000); // $5K-$20K

    return {
      id: `event-${this.nextEventId++}`,
      type: 'vip_visitor',
      title: 'VIP Visitor!',
      description: `A celebrity checked into your hotel! Bonus income: $${bonusIncome.toLocaleString()}`,
      startTick: currentTick,
      durationTicks: 0, // Instant
      effect: {
        type: 'income',
        value: bonusIncome,
      },
      active: true,
    };
  }

  /**
   * Create maintenance issue event (cost money)
   */
  private createMaintenanceEvent(_tower: Tower, currentTick: number): RandomEvent {
    const cost = Math.floor(2000 + Math.random() * 8000); // $2K-$10K
    
    const issues = [
      'Elevator motor malfunction',
      'Plumbing leak on floor 12',
      'HVAC system failure',
      'Electrical circuit overload',
      'Window seal replacement needed',
    ];
    const issue = issues[Math.floor(Math.random() * issues.length)];

    return {
      id: `event-${this.nextEventId++}`,
      type: 'maintenance',
      title: 'Maintenance Issue',
      description: `${issue}. Repair cost: $${cost.toLocaleString()}`,
      startTick: currentTick,
      durationTicks: 0, // Instant cost
      effect: {
        type: 'cost',
        value: cost,
      },
      active: true,
    };
  }

  /**
   * Create fire drill event (everyone evacuates temporarily)
   */
  private createFireDrillEvent(currentTick: number): RandomEvent {
    const durationMinutes = 2; // 2 minute drill
    const durationTicks = durationMinutes * 60 * 60; // Convert to ticks

    return {
      id: `event-${this.nextEventId++}`,
      type: 'fire_drill',
      title: 'Fire Drill',
      description: 'Fire drill in progress! All tenants evacuating to ground floor.',
      startTick: currentTick,
      durationTicks: durationTicks,
      effect: {
        type: 'status',
        value: 0,
      },
      active: true,
    };
  }

  /**
   * Create power outage event (elevators stop)
   */
  private createPowerOutageEvent(currentTick: number): RandomEvent {
    const durationMinutes = 1; // 1 minute outage
    const durationTicks = durationMinutes * 60 * 60;

    return {
      id: `event-${this.nextEventId++}`,
      type: 'power_outage',
      title: 'Power Outage!',
      description: 'Building power lost! Elevators temporarily offline.',
      startTick: currentTick,
      durationTicks: durationTicks,
      effect: {
        type: 'status',
        value: 0,
      },
      active: true,
    };
  }

  /**
   * End an event
   */
  private endEvent(event: RandomEvent): void {
    event.active = false;
    this.activeEvents.delete(event.id);

    console.log(`✅ Event ended: ${event.title}`);

    // Emit event end
    getEventBus().emitSync({
      type: 'RANDOM_EVENT_END',
      timestamp: Date.now(),
      data: { event }
    } as any);
  }

  /**
   * Get all active events
   */
  getActiveEvents(): RandomEvent[] {
    return Array.from(this.activeEvents.values());
  }

  /**
   * Check if a specific event type is currently active
   */
  isEventActive(type: RandomEventType): boolean {
    for (const event of this.activeEvents.values()) {
      if (event.type === type && event.active) {
        return true;
      }
    }
    return false;
  }

  /**
   * Manually trigger an event (for testing/special occasions)
   */
  triggerSpecificEvent(type: RandomEventType, tower: Tower, currentTick: number): void {
    this.triggerEvent(type, tower, currentTick);
  }

  /**
   * Serialize for save/load
   */
  serialize(): { activeEvents: RandomEvent[]; lastEventTick: number } {
    return {
      activeEvents: Array.from(this.activeEvents.values()),
      lastEventTick: this.lastEventTick,
    };
  }

  /**
   * Deserialize from save data
   */
  deserialize(data: { activeEvents: RandomEvent[]; lastEventTick: number }): void {
    this.activeEvents.clear();
    for (const event of data.activeEvents) {
      this.activeEvents.set(event.id, event);
    }
    this.lastEventTick = data.lastEventTick;
  }
}
