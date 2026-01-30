/**
 * Test Web Worker - Verifies worker setup works correctly
 * This is a Phase 0 requirement to catch worker configuration issues early
 */

// Verify worker is running in worker context
const isWorker = typeof self !== 'undefined' && typeof window === 'undefined';

/**
 * Message handler
 */
self.onmessage = (event: MessageEvent<{ type: string; payload?: unknown }>) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'PING':
      self.postMessage({
        type: 'PONG',
        payload: {
          isWorker,
          timestamp: Date.now(),
          received: payload,
        },
      });
      break;

    case 'COMPUTE':
      // Test computational work in worker
      const start = performance.now();
      let result = 0;
      for (let i = 0; i < 1000000; i++) {
        result += Math.sqrt(i);
      }
      const elapsed = performance.now() - start;

      self.postMessage({
        type: 'COMPUTE_RESULT',
        payload: {
          result,
          elapsedMs: elapsed,
        },
      });
      break;

    case 'ECHO':
      self.postMessage({
        type: 'ECHO',
        payload,
      });
      break;

    default:
      self.postMessage({
        type: 'ERROR',
        payload: `Unknown message type: ${type}`,
      });
  }
};

// Signal worker is ready
self.postMessage({
  type: 'READY',
  payload: { isWorker },
});
