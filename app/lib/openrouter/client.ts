import OpenAI from 'openai';

export function createOpenRouterClient(apiKey: string) {
  if (!apiKey) {
    throw new Error('OpenRouter API key is required');
  }

  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "10x MedMinder Plus"
    },
    defaultQuery: {
      "transform_to_openai": "true"
    }
  });
} 