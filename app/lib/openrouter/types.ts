import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export type Message = ChatCompletionMessageParam;

export type TaskComplexity = 'simple' | 'medium' | 'complex';
export type ResponsePurpose = 'creative' | 'factual' | 'code' | 'medical';

export interface ModelParameters {
  temperature: number;
  top_p: number;
  max_tokens?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface RateLimitConfig {
  tokensPerInterval: number;
  interval: number; // in milliseconds
  maxBurst?: number;
}

export interface QueueConfig {
  maxConcurrent: number;
  maxQueueSize: number;
  queueTimeout: number; // in milliseconds
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // in milliseconds
  maxSize: number; // maximum number of cached responses
}

export interface OpenRouterConfig {
  apiKey: string;
  defaultModel: string;
  defaultParams: ModelParameters;
  timeout: number;
  retryOptions: {
    maxRetries: number;
    initialDelayMs: number;
  };
  rateLimit: RateLimitConfig;
  queue: QueueConfig;
  cache: CacheConfig;
}

export interface StreamCallbacks {
  onMessage: (chunk: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (error: Error) => void;
}

export interface JSONSchema {
  type: 'json_schema';
  json_schema: {
    name: string;
    strict: true;
    schema: Record<string, any>;
  }
}

export interface CacheKey {
  messages: Message[];
  model: string;
  parameters: ModelParameters;
  schema?: JSONSchema;
}

export class OpenRouterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

export class AuthenticationError extends OpenRouterError {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends OpenRouterError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class ModelError extends OpenRouterError {
  constructor(message: string = 'Model error occurred') {
    super(message);
    this.name = 'ModelError';
  }
}

export class NetworkError extends OpenRouterError {
  constructor(message: string = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends OpenRouterError {
  constructor(message: string = 'Validation error occurred') {
    super(message);
    this.name = 'ValidationError';
  }
}

export class QueueTimeoutError extends OpenRouterError {
  constructor(message: string = 'Request queue timeout') {
    super(message);
    this.name = 'QueueTimeoutError';
  }
} 