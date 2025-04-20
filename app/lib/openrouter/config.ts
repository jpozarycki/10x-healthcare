import { ModelParameters, OpenRouterConfig, ResponsePurpose, TaskComplexity } from './types';

export const MODEL_MAP: Record<TaskComplexity, string> = {
  simple: "openai/gpt-3.5-turbo",
  medium: "anthropic/claude-3-sonnet",
  complex: "openai/gpt-4"
};

export const PARAMETER_PRESETS: Record<ResponsePurpose, ModelParameters> = {
  creative: {
    temperature: 0.9,
    top_p: 1,
    frequency_penalty: 0.5,
    presence_penalty: 0.7
  },
  factual: {
    temperature: 0.2,
    top_p: 0.9,
    frequency_penalty: 0.1,
    presence_penalty: 0.1
  },
  code: {
    temperature: 0.1,
    top_p: 0.95,
    frequency_penalty: 0,
    presence_penalty: 0
  },
  medical: {
    temperature: 0.3,
    top_p: 0.9,
    frequency_penalty: 0.2,
    presence_penalty: 0.2
  }
};

export const DEFAULT_SYSTEM_MESSAGE = 
  "You are a helpful AI assistant providing accurate information.";

export const DEFAULT_CONFIG: OpenRouterConfig = {
  apiKey: process.env.OPENROUTER_API_KEY || "",
  defaultModel: MODEL_MAP.simple,
  defaultParams: PARAMETER_PRESETS.factual,
  timeout: 30000,
  retryOptions: {
    maxRetries: 3,
    initialDelayMs: 1000
  },
  rateLimit: {
    tokensPerInterval: 90000, // 90k tokens per interval
    interval: 60000, // 1 minute
    maxBurst: 9000 // Allow bursts up to 9k tokens
  },
  queue: {
    maxConcurrent: 5,
    maxQueueSize: 100,
    queueTimeout: 300000 // 5 minutes
  },
  cache: {
    enabled: true,
    ttl: 3600000, // 1 hour
    maxSize: 1000
  }
}; 