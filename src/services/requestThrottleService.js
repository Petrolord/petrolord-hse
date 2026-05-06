// src/services/requestThrottleService.js

/**
 * Request Throttle Service
 * Prevents simultaneous API calls
 * Ensures requests are sent one at a time with delays
 */

class RequestThrottle {
  constructor() {
    this.isProcessing = false;
    this.queue = [];
    this.minDelayMs = 3000; // 3 second delay between requests
    this.abortController = null;
  }

  /**
   * Execute request with throttling
   */
  async execute(requestFn, requestName = 'Request') {
    console.log(`⏳ [THROTTLE] Queuing: ${requestName}`);

    return new Promise((resolve, reject) => {
      this.queue.push({
        fn: requestFn,
        name: requestName,
        resolve,
        reject,
      });

      console.log(`⏳ [THROTTLE] Queue size: ${this.queue.length}`);
      this.processQueue();
    });
  }

  /**
   * Process queue
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const request = this.queue.shift();

    try {
      console.log(`⏳ [THROTTLE] Processing: ${request.name} (${this.queue.length} remaining)`);

      // Create abort controller for this request
      this.abortController = new AbortController();

      // Execute request
      const result = await request.fn();
      console.log(`✅ [THROTTLE] Completed: ${request.name}`);
      request.resolve(result);

      // Wait before processing next request
      if (this.queue.length > 0) {
        console.log(`⏳ [THROTTLE] Waiting ${this.minDelayMs}ms before next request...`);
        await new Promise(resolve => setTimeout(resolve, this.minDelayMs));
      }
    } catch (error) {
      // Ignore abort errors
      if (error.name === 'AbortError') {
        console.log(`🛑 [THROTTLE] Request aborted: ${request.name}`);
      } else {
        console.error(`❌ [THROTTLE] Error in ${request.name}:`, error.message);
      }
      request.reject(error);
    } finally {
      this.isProcessing = false;
      this.abortController = null;

      // Process next request
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueSize: this.queue.length,
      isProcessing: this.isProcessing,
    };
  }

  /**
   * Clear queue and abort current request
   */
  clear() {
    console.log(`🗑️ [THROTTLE] Clearing queue (${this.queue.length} requests)`);
    
    // Abort current request if any
    if (this.abortController) {
      this.abortController.abort();
    }
    
    this.queue = [];
    this.isProcessing = false;
  }
}

// Create singleton instance
export const requestThrottle = new RequestThrottle();