/**
 * Simple client-side rate limiter to prevent spamming actions
 */
class RateLimiter {
  constructor() {
    this.timestamps = new Map();
  }

  /**
   * Check if an action is allowed for a specific key
   * @param {string} key - Unique identifier for the action (e.g., 'send_email')
   * @param {number} limit - Minimum time between actions in ms
   * @returns {boolean}
   */
  canProceed(key, limit = 2000) {
    const now = Date.now();
    const lastTime = this.timestamps.get(key) || 0;

    if (now - lastTime < limit) {
      return false;
    }

    return true;
  }

  /**
   * Record an action execution
   * @param {string} key 
   */
  recordAction(key) {
    this.timestamps.set(key, Date.now());
  }

  /**
   * Get remaining cooldown time
   * @param {string} key 
   * @param {number} limit 
   * @returns {number} ms remaining
   */
  getCooldown(key, limit = 2000) {
    const now = Date.now();
    const lastTime = this.timestamps.get(key) || 0;
    const diff = now - lastTime;
    return Math.max(0, limit - diff);
  }
}

export const rateLimiter = new RateLimiter();