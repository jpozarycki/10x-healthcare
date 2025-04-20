import { RateLimitConfig, QueueConfig, CacheConfig, CacheKey, QueueTimeoutError } from './types';

export class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private readonly config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.tokens = config.maxBurst || config.tokensPerInterval;
    this.lastRefill = Date.now();
  }

  async consume(tokens: number): Promise<void> {
    this.refill();

    if (this.tokens < tokens) {
      const timeToWait = this.calculateTimeToWait(tokens);
      await new Promise(resolve => setTimeout(resolve, timeToWait));
      this.refill();
    }

    this.tokens -= tokens;
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = (timePassed / this.config.interval) * this.config.tokensPerInterval;
    
    this.tokens = Math.min(
      this.config.maxBurst || this.config.tokensPerInterval,
      this.tokens + tokensToAdd
    );
    this.lastRefill = now;
  }

  private calculateTimeToWait(tokens: number): number {
    const tokensNeeded = tokens - this.tokens;
    return Math.ceil((tokensNeeded / this.config.tokensPerInterval) * this.config.interval);
  }
}

export class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private running = 0;
  private readonly config: QueueConfig;

  constructor(config: QueueConfig) {
    this.config = config;
  }

  async enqueue<T>(operation: () => Promise<T>): Promise<T> {
    if (this.queue.length >= this.config.maxQueueSize) {
      throw new QueueTimeoutError('Request queue is full');
    }

    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const index = this.queue.findIndex(op => op === wrappedOperation);
        if (index !== -1) {
          this.queue.splice(index, 1);
          reject(new QueueTimeoutError());
        }
      }, this.config.queueTimeout);

      const wrappedOperation = async () => {
        try {
          const result = await operation();
          clearTimeout(timeoutId);
          resolve(result);
        } catch (error) {
          clearTimeout(timeoutId);
          reject(error);
        } finally {
          this.running--;
          this.processQueue();
        }
      };

      this.queue.push(wrappedOperation);
      this.processQueue();
    });
  }

  private processQueue(): void {
    while (this.running < this.config.maxConcurrent && this.queue.length > 0) {
      const operation = this.queue.shift();
      if (operation) {
        this.running++;
        operation();
      }
    }
  }
}

export class ResponseCache {
  private cache = new Map<string, { value: any; timestamp: number }>();
  private readonly config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
    this.startCleanupInterval();
  }

  get<T>(key: CacheKey): T | null {
    if (!this.config.enabled) return null;

    const cacheKey = this.generateKey(key);
    const cached = this.cache.get(cacheKey);

    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.config.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.value as T;
  }

  set(key: CacheKey, value: any): void {
    if (!this.config.enabled) return;

    const cacheKey = this.generateKey(key);
    this.cache.set(cacheKey, {
      value,
      timestamp: Date.now()
    });

    if (this.cache.size > this.config.maxSize) {
      let oldestKey = '';
      let oldestTime = Date.now();

      this.cache.forEach((value, key) => {
        if (value.timestamp < oldestTime) {
          oldestTime = value.timestamp;
          oldestKey = key;
        }
      });

      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  private generateKey(key: CacheKey): string {
    return JSON.stringify({
      messages: key.messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      model: key.model,
      parameters: key.parameters,
      schema: key.schema
    });
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      this.cache.forEach((value, key) => {
        if (now - value.timestamp > this.config.ttl) {
          this.cache.delete(key);
        }
      });
    }, Math.min(this.config.ttl, 3600000)); // Run cleanup at least every hour
  }
} 