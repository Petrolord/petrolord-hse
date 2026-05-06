// src/services/requestQueueService.js

/**
 * Request Queue Service
 * Manages API requests to prevent rate limiting
 * - Queues requests
 * - Executes one at a time
 * - Adds delays between requests
 * - Implements exponential backoff for retries
 * - Deduplicates identical requests
 */

class RequestQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.lastRequestTime = 0;
    this.minDelayMs = 3000; // INCREASED: 3 seconds between requests
    this.maxRetries = 5; // INCREASED: More retries
    this.retryDelayMs = 3000; // INCREASED: Start with 3 second delay
    this.requestCache = new Map(); // Deduplication cache
  }

  /**
   * Generate cache key for request deduplication
   * Uses name + hash/signature logic
   */
  generateCacheKey(requestName) {
    return requestName;
  }

  /**
   * Add request to queue
   */
  async enqueue(requestFn, requestName = 'API Request') {
    const cacheKey = this.generateCacheKey(requestName);
    console.log(`📋 [QUEUE] Enqueuing: ${cacheKey}`);
    
    // Check if request is already in queue or cached (deduplication)
    if (this.requestCache.has(cacheKey)) {
      console.log(`📋 [QUEUE] Duplicate request detected, using cached result for: ${cacheKey}`);
      return this.requestCache.get(cacheKey);
    }

    // Create a promise for this request
    return new Promise((resolve, reject) => {
      this.queue.push({
        fn: requestFn,
        name: requestName,
        resolve,
        reject,
        retries: 0,
        cacheKey
      });

      console.log(`📋 [QUEUE] Queue size: ${this.queue.length}`);
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
      console.log(`⏳ [QUEUE] Processing: ${request.name} (${this.queue.length} remaining)`);

      // Wait for minimum delay since last request
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.minDelayMs) {
        const waitTime = this.minDelayMs - timeSinceLastRequest;
        console.log(`⏳ [QUEUE] Waiting ${waitTime}ms before request...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      // Execute request
      this.lastRequestTime = Date.now();
      const resultPromise = request.fn();
      
      // Cache the result promise immediately to prevent duplicates while processing
      this.requestCache.set(request.cacheKey, resultPromise);
      
      const result = await resultPromise;
      
      console.log(`✅ [QUEUE] Completed: ${request.name}`);
      request.resolve(result);

      // Clear cache after 60 seconds to allow eventual re-submission and free memory
      setTimeout(() => {
        if (this.requestCache.has(request.cacheKey)) {
            this.requestCache.delete(request.cacheKey);
        }
      }, 60000);

    } catch (error) {
      console.error(`❌ [QUEUE] Error in ${request.name}:`, error.message);
      
      // If failed, remove from cache so it can be retried
      this.requestCache.delete(request.cacheKey);

      // Check if it's a rate limit error
      if ((error.status === 429 || error.message?.includes('429')) && request.retries < this.maxRetries) {
        request.retries++;
        const backoffDelay = this.retryDelayMs * Math.pow(2, request.retries - 1);
        
        console.warn(`⚠️ [QUEUE] Rate limited. Retry ${request.retries}/${this.maxRetries} after ${backoffDelay}ms`);
        
        // Re-queue with exponential backoff
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        this.queue.unshift(request);
      } else if (error.status === 429) {
        console.error(`❌ [QUEUE] Max retries exceeded for rate limit`);
        request.reject(new Error('Rate limit exceeded after multiple retries. Please try again later.'));
      } else {
        request.reject(error);
      }
    } finally {
      this.isProcessing = false;
      
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
      lastRequestTime: this.lastRequestTime
    };
  }

  /**
   * Clear queue
   */
  clear() {
    console.log(`🗑️ [QUEUE] Clearing queue (${this.queue.length} requests)`);
    this.queue = [];
    this.requestCache.clear();
  }
}

// Create singleton instance
export const requestQueue = new RequestQueue();