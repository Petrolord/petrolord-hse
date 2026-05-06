/**
 * Utility functions for retrying operations and rate limiting
 */

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retries an async operation with exponential backoff
 * @param {Function} operation - The async function to retry
 * @param {Object} options - Configuration options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.baseDelay - Base delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 10000)
 * @param {Function} options.shouldRetry - Predicate to check if error allows retry
 */
export async function retryOperation(operation, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 2000,
    maxDelay = 10000,
    shouldRetry = (error) => true
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Check if we should retry based on the error
      if (!shouldRetry(error) || attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const exponentialDelay = baseDelay * Math.pow(2, attempt);
      const delay = Math.min(exponentialDelay, maxDelay);
      const jitter = Math.random() * 200; // Add random jitter to prevent thundering herd

      console.warn(`Attempt ${attempt + 1} failed. Retrying in ${Math.round(delay + jitter)}ms...`, error.message);
      
      await sleep(delay + jitter);
    }
  }

  throw lastError;
}

/**
 * Checks if an error is a rate limit error (429)
 * @param {Error} error 
 * @returns {boolean}
 */
export const isRateLimitError = (error) => {
  return error?.status === 429 || 
         error?.message?.includes('429') || 
         error?.message?.toLowerCase().includes('rate limit') ||
         error?.message?.toLowerCase().includes('too many requests');
};