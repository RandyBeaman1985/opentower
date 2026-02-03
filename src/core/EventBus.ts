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
  private listeners: Map<string, Map<number, SubscriptionEntry>> = new Map();
  private anyListeners: Map<number, { eventTypes: Set<string>; callback: EventCallback }> = new Map();
  private phasedQueues: Map<GamePhase, AppEvent[]> = new Map();
  
  /** Track if we're currently emitting to prevent concurrent modification issues */
  private isEmitting = false;
  private pendingUnsubscribes: Set<{ type: 'specific' | 'any'; eventType?: string; id: number }> = new Set();

  /**
   * Subscribe to a specific event type
   * @param eventType - The event type to subscribe to
   * @param callback - Function to call when event is emitted
   * @returns Subscription object with unsubscribe method
   */
  on<T extends AppEvent>(eventType: T['type'], callback: (event: T) => void): Subscription {
    const id = this.nextSubscriptionId++;

    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Map());
    }

    const typeListeners = this.listeners.get(eventType)!;
    typeListeners.set(id, {
      callback: callback as EventCallback,
      id,
    });

    return {
      unsubscribe: () => {
        if (this.isEmitting) {
          // Defer unsubscribe to avoid concurrent modification
          this.pendingUnsubscribes.add({ type: 'specific', eventType, id });
          return;
        }
        this.removeListener(eventType, id);
      },
    };
  }

  /**
   * Remove a specific listener (internal helper)
   */
  private removeListener(eventType: string, id: number): void {
    const typeListeners = this.listeners.get(eventType);
    if (typeListeners) {
      typeListeners.delete(id);
      // Clean up empty maps
      if (typeListeners.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  /**
   * Subscribe to multiple event types
   * @param eventTypes - Array of event types to subscribe to
   * @param callback - Function to call when any matching event is emitted
   * @returns Subscription object with unsubscribe method
   */
  onAny(eventTypes: AppEvent['type'][], callback: (event: AppEvent) => void): Subscription {
    const id = this.nextSubscriptionId++;

    this.anyListeners.set(id, {
      eventTypes: new Set(eventTypes),
      callback,
    });

    return {
      unsubscribe: () => {
        if (this.isEmitting) {
          // Defer unsubscribe to avoid concurrent modification
          this.pendingUnsubscribes.add({ type: 'any', id });
          return;
        }
        this.anyListeners.delete(id);
      },
    };
  }

  /**
   * Emit event synchronously - processed immediately
   * Use for events that must complete before next frame
   * @param event - The event to emit
   */
  emitSync<T extends AppEvent>(event: T): void {
    this.isEmitting = true;
    
    try {
      // Notify specific listeners
      const typeListeners = this.listeners.get(event.type);
      if (typeListeners) {
        for (const entry of typeListeners.values()) {
          try {
            entry.callback(event);
          } catch (error) {
            console.error(`Error in event handler for ${event.type}:`, error);
          }
        }
      }

      // Notify any listeners
      for (const listener of this.anyListeners.values()) {
        if (listener.eventTypes.has(event.type)) {
          try {
            listener.callback(event);
          } catch (error) {
            console.error(`Error in any-listener for ${event.type}:`, error);
          }
        }
      }
    } finally {
      this.isEmitting = false;
      
      // Process any deferred unsubscribes
      if (this.pendingUnsubscribes.size > 0) {
        for (const pending of this.pendingUnsubscribes) {
          if (pending.type === 'specific' && pending.eventType) {
            this.removeListener(pending.eventType, pending.id);
          } else if (pending.type === 'any') {
            this.anyListeners.delete(pending.id);
          }
        }
        this.pendingUnsubscribes.clear();
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
   * Clear all subscriptions and queued events
   */
  clear(): void {
    this.listeners.clear();
    this.anyListeners.clear();
    this.phasedQueues.clear();
    this.pendingUnsubscribes.clear();
    this.isEmitting = false;
  }

  /**
   * Remove all listeners for a specific event type
   * @param eventType - The event type to clear listeners for
   */
  clearEventType(eventType: string): void {
    this.listeners.delete(eventType);
  }

  /**
   * Get count of listeners for debugging
   * @param eventType - Optional event type to count listeners for
   * @returns Number of listeners
   */
  getListenerCount(eventType?: string): number {
    if (eventType) {
      return this.listeners.get(eventType)?.size ?? 0;
    }

    let total = 0;
    for (const typeListeners of this.listeners.values()) {
      total += typeListeners.size;
    }
    return total + this.anyListeners.size;
  }

  /**
   * Check if there are any listeners for an event type
   * @param eventType - The event type to check
   * @returns True if there are listeners for this event type
   */
  hasListeners(eventType: string): boolean {
    const typeListeners = this.listeners.get(eventType);
    return (typeListeners?.size ?? 0) > 0;
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
