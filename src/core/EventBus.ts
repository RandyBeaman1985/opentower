/**
 * Event Bus - Central pub/sub system for game events
 * Supports sync, async, and phased event processing
 *
 * @module core/EventBus
 */

import type { AppEvent, IEventBus, Subscription, GamePhase } from '@/interfaces';

type EventCallback<T extends AppEvent = AppEvent> = (event: T) => void;

interface SubscriptionEntry {
  callback: EventCallback;
  id: number;
}

/**
 * Central event bus for game-wide communication
 *
 * Usage:
 * ```typescript
 * const bus = new EventBus();
 *
 * // Subscribe to events
 * const sub = bus.on('BUILDING_PLACED', (event) => {
 *   console.log(`Building ${event.buildingId} placed`);
 * });
 *
 * // Emit events
 * bus.emitSync({ type: 'BUILDING_PLACED', buildingId: '123', ... });
 *
 * // Cleanup
 * sub.unsubscribe();
 * ```
 */
export class EventBus implements IEventBus {
  private nextSubscriptionId = 0;
  private listeners: Map<string, SubscriptionEntry[]> = new Map();
  private anyListeners: { eventTypes: Set<string>; callback: EventCallback; id: number }[] = [];
  private phasedQueues: Map<GamePhase, AppEvent[]> = new Map();

  /**
   * Subscribe to a specific event type
   */
  on<T extends AppEvent>(eventType: T['type'], callback: (event: T) => void): Subscription {
    const id = this.nextSubscriptionId++;

    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    this.listeners.get(eventType)!.push({
      callback: callback as EventCallback,
      id,
    });

    return {
      unsubscribe: () => {
        const entries = this.listeners.get(eventType);
        if (entries) {
          const index = entries.findIndex((e) => e.id === id);
          if (index !== -1) {
            entries.splice(index, 1);
          }
        }
      },
    };
  }

  /**
   * Subscribe to multiple event types
   */
  onAny(eventTypes: AppEvent['type'][], callback: (event: AppEvent) => void): Subscription {
    const id = this.nextSubscriptionId++;

    this.anyListeners.push({
      eventTypes: new Set(eventTypes),
      callback,
      id,
    });

    return {
      unsubscribe: () => {
        const index = this.anyListeners.findIndex((e) => e.id === id);
        if (index !== -1) {
          this.anyListeners.splice(index, 1);
        }
      },
    };
  }

  /**
   * Emit event synchronously - processed immediately
   * Use for events that must complete before next frame
   */
  emitSync<T extends AppEvent>(event: T): void {
    // Notify specific listeners
    const entries = this.listeners.get(event.type);
    if (entries) {
      for (const entry of entries) {
        try {
          entry.callback(event);
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error);
        }
      }
    }

    // Notify any listeners
    for (const listener of this.anyListeners) {
      if (listener.eventTypes.has(event.type)) {
        try {
          listener.callback(event);
        } catch (error) {
          console.error(`Error in any-listener for ${event.type}:`, error);
        }
      }
    }
  }

  /**
   * Emit event asynchronously - processed on next microtask
   * Use for events that can be batched/deferred
   */
  emitAsync<T extends AppEvent>(event: T): void {
    queueMicrotask(() => this.emitSync(event));
  }

  /**
   * Queue event for specific game loop phase
   * Events are processed when processPhase() is called
   */
  queue<T extends AppEvent>(event: T, phase: GamePhase): void {
    if (!this.phasedQueues.has(phase)) {
      this.phasedQueues.set(phase, []);
    }
    this.phasedQueues.get(phase)!.push(event);
  }

  /**
   * Process all queued events for a phase
   * Called by the game loop at appropriate times
   */
  processPhase(phase: GamePhase): void {
    const queue = this.phasedQueues.get(phase);
    if (!queue || queue.length === 0) return;

    // Process all queued events
    for (const event of queue) {
      this.emitSync(event);
    }

    // Clear the queue
    queue.length = 0;
  }

  /**
   * Get count of pending events in a phase queue
   */
  getPendingCount(phase: GamePhase): number {
    return this.phasedQueues.get(phase)?.length ?? 0;
  }

  /**
   * Clear all subscriptions
   */
  clear(): void {
    this.listeners.clear();
    this.anyListeners.length = 0;
    this.phasedQueues.clear();
  }

  /**
   * Get count of listeners for debugging
   */
  getListenerCount(eventType?: string): number {
    if (eventType) {
      return this.listeners.get(eventType)?.length ?? 0;
    }

    let total = 0;
    for (const entries of this.listeners.values()) {
      total += entries.length;
    }
    return total + this.anyListeners.length;
  }
}

// Singleton instance for global access
let globalEventBus: EventBus | null = null;

/**
 * Get the global event bus instance
 */
export function getEventBus(): EventBus {
  if (!globalEventBus) {
    globalEventBus = new EventBus();
  }
  return globalEventBus;
}

/**
 * Reset the global event bus (for testing)
 */
export function resetEventBus(): void {
  if (globalEventBus) {
    globalEventBus.clear();
  }
  globalEventBus = null;
}
