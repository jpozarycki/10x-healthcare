interface RequestWindow {
  count: number;
  startTime: number;
}

/**
 * A simple in-memory rate limiter that tracks requests per user within a time window
 */
export class RateLimiter {
  private requests: Map<string, RequestWindow>;

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {
    this.requests = new Map();
  }

  /**
   * Try to make a request for a given user
   * @param userId The user's ID
   * @returns true if the request is allowed, false if rate limit is exceeded
   */
  tryRequest(userId: string): boolean {
    const now = Date.now();
    const userWindow = this.requests.get(userId);

    // If no previous requests or window has expired, create new window
    if (!userWindow || now - userWindow.startTime >= this.windowMs) {
      this.requests.set(userId, {
        count: 1,
        startTime: now
      });
      return true;
    }

    // If within window, check count
    if (userWindow.count >= this.maxRequests) {
      return false;
    }

    // Increment count
    userWindow.count++;
    return true;
  }

  /**
   * Get the number of remaining requests for a user
   * @param userId The user's ID
   * @returns The number of remaining requests in the current window
   */
  getRemainingRequests(userId: string): number {
    const now = Date.now();
    const userWindow = this.requests.get(userId);

    if (!userWindow || now - userWindow.startTime >= this.windowMs) {
      return this.maxRequests;
    }

    return Math.max(0, this.maxRequests - userWindow.count);
  }

  /**
   * Get the time remaining in the current window for a user
   * @param userId The user's ID
   * @returns The number of milliseconds remaining in the current window
   */
  getTimeRemaining(userId: string): number {
    const now = Date.now();
    const userWindow = this.requests.get(userId);

    if (!userWindow) {
      return 0;
    }

    return Math.max(0, this.windowMs - (now - userWindow.startTime));
  }

  /**
   * Clear all rate limiting data
   */
  clear(): void {
    this.requests.clear();
  }
} 