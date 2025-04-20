import OpenAI from 'openai';
import type { ChatCompletionSystemMessageParam } from 'openai/resources/chat/completions';
import { 
  Message, 
  OpenRouterConfig, 
  TaskComplexity, 
  ResponsePurpose, 
  ModelParameters,
  JSONSchema,
  AuthenticationError,
  RateLimitError,
  NetworkError,
  ModelError,
  ValidationError,
  StreamCallbacks,
  CacheKey
} from './types';
import { createOpenRouterClient } from './client';
import { DEFAULT_CONFIG, MODEL_MAP, PARAMETER_PRESETS, DEFAULT_SYSTEM_MESSAGE } from './config';
import { TokenBucket, RequestQueue, ResponseCache } from './utils';

export class OpenRouterService {
  private readonly client: OpenAI;
  private readonly logger: Console;
  private readonly config: OpenRouterConfig;
  private readonly rateLimiter: TokenBucket;
  private readonly requestQueue: RequestQueue;
  private readonly responseCache: ResponseCache;

  constructor(
    config: Partial<OpenRouterConfig> = {},
    logger: Console = console
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.client = createOpenRouterClient(this.config.apiKey);
    this.logger = logger;
    this.rateLimiter = new TokenBucket(this.config.rateLimit);
    this.requestQueue = new RequestQueue(this.config.queue);
    this.responseCache = new ResponseCache(this.config.cache);
  }

  async generateChat(
    messages: Message[],
    options: {
      systemMessage?: string;
      model?: string;
      purpose?: ResponsePurpose;
      parameters?: Partial<ModelParameters>;
      complexity?: TaskComplexity;
    } = {}
  ): Promise<Message> {
    try {
      const model = options.model || 
        (options.complexity ? this.selectModel(options.complexity) : this.config.defaultModel);
      
      const purpose = options.purpose || 'factual';
      const params = this.getModelParameters(purpose, options.parameters);

      // Check cache first
      const cacheKey: CacheKey = {
        messages,
        model,
        parameters: params
      };
      
      const cachedResponse = this.responseCache.get<Message>(cacheKey);
      if (cachedResponse) {
        this.logger.debug('Returning cached response', { 
          model,
          messageCount: messages.length
        });
        return cachedResponse;
      }

      return await this.requestQueue.enqueue(async () => {
        return await this.withTimeout(async () => {
          const systemMessage: ChatCompletionSystemMessageParam = {
            role: 'system',
            content: options.systemMessage || DEFAULT_SYSTEM_MESSAGE
          };
          const fullMessages = [systemMessage, ...messages];
          
          this.logger.debug('Generating chat response', { 
            model, 
            messageCount: messages.length,
            purpose
          });

          // Estimate token count (rough estimate)
          const estimatedTokens = fullMessages.reduce((sum, msg) => 
            sum + (msg.content?.length || 0) / 4, 0);
          
          await this.rateLimiter.consume(estimatedTokens);
          
          return await this.withRetry(async () => {
            const response = await this.client.chat.completions.create({
              messages: fullMessages,
              model,
              ...params
            });
            
            const result = response.choices[0].message;
            this.responseCache.set(cacheKey, result);
            return result;
          });
        });
      });
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async generateStructuredResponse<T>(
    messages: Message[],
    schema: JSONSchema,
    options: {
      systemMessage?: string;
      model?: string;
      purpose?: ResponsePurpose;
      parameters?: Partial<ModelParameters>;
      complexity?: TaskComplexity;
    } = {}
  ): Promise<T> {
    try {
      const model = options.model || 
        (options.complexity ? this.selectModel(options.complexity) : this.config.defaultModel);
      
      const purpose = options.purpose || 'factual';
      const params = this.getModelParameters(purpose, options.parameters);

      // Check cache first
      const cacheKey: CacheKey = {
        messages,
        model,
        parameters: params,
        schema
      };
      
      const cachedResponse = this.responseCache.get<T>(cacheKey);
      if (cachedResponse) {
        this.logger.debug('Returning cached structured response', { 
          model,
          messageCount: messages.length,
          schemaName: schema.json_schema.name
        });
        return cachedResponse;
      }

      return await this.requestQueue.enqueue(async () => {
        return await this.withTimeout(async () => {
          const schemaInstructions = `You must respond with a valid JSON object that matches the following schema:
${JSON.stringify(schema.json_schema.schema, null, 2)}

Your response must be a single, valid JSON object. Do not include any explanatory text.`;

          const systemMessage: ChatCompletionSystemMessageParam = {
            role: 'system',
            content: `${options.systemMessage || DEFAULT_SYSTEM_MESSAGE}\n\n${schemaInstructions}`
          };
          const fullMessages = [systemMessage, ...messages];
          
          this.logger.debug('Generating structured response', { 
            model, 
            messageCount: messages.length,
            schemaName: schema.json_schema.name,
            purpose
          });

          // Estimate token count (rough estimate)
          const estimatedTokens = fullMessages.reduce((sum, msg) => 
            sum + (msg.content?.length || 0) / 4, 0);
          
          await this.rateLimiter.consume(estimatedTokens);
          
          return await this.withRetry(async () => {
            const response = await this.client.chat.completions.create({
              messages: fullMessages,
              model,
              response_format: { type: "json_object" },
              ...params
            });
            
            const content = response.choices[0].message.content;
            
            if (!content) {
              throw new ValidationError('Received empty response from OpenRouter API');
            }

            try {
              const result = JSON.parse(content) as T;
              this.responseCache.set(cacheKey, result);
              return result;
            } catch (parseError) {
              this.logger.error('Failed to parse structured response', { 
                error: parseError,
                content
              });
              throw new ValidationError('Failed to parse AI response as structured data');
            }
          });
        });
      });
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async streamChat(
    messages: Message[],
    callbacks: StreamCallbacks,
    options: {
      systemMessage?: string;
      model?: string;
      purpose?: ResponsePurpose;
      parameters?: Partial<ModelParameters>;
      complexity?: TaskComplexity;
    } = {}
  ): Promise<void> {
    try {
      const model = options.model || 
        (options.complexity ? this.selectModel(options.complexity) : this.config.defaultModel);
      
      const purpose = options.purpose || 'factual';
      const params = this.getModelParameters(purpose, options.parameters);
      
      const systemMessage: ChatCompletionSystemMessageParam = {
        role: 'system',
        content: options.systemMessage || DEFAULT_SYSTEM_MESSAGE
      };
      const fullMessages = [systemMessage, ...messages];

      // Estimate token count (rough estimate)
      const estimatedTokens = fullMessages.reduce((sum, msg) => 
        sum + (msg.content?.length || 0) / 4, 0);

      await this.requestQueue.enqueue(async () => {
        await this.rateLimiter.consume(estimatedTokens);
        
        this.logger.debug('Starting chat stream', { 
          model, 
          messageCount: messages.length,
          purpose
        });
        
        let fullResponse = '';
        let retryCount = 0;
        
        const makeStreamRequest = async (): Promise<void> => {
          try {
            const stream = await this.client.chat.completions.create({
              messages: fullMessages,
              model,
              stream: true,
              ...params
            });
            
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                fullResponse += content;
                callbacks.onMessage(content);
              }
            }
            
            callbacks.onComplete(fullResponse);
          } catch (error: any) {
            // Handle retryable errors
            if (
              (error?.status === 429 || error?.response?.status === 429) && 
              retryCount < this.config.retryOptions.maxRetries
            ) {
              retryCount++;
              const delay = this.config.retryOptions.initialDelayMs * Math.pow(2, retryCount - 1);
              
              this.logger.warn(`Rate limit exceeded, retrying in ${delay}ms (attempt ${retryCount}/${this.config.retryOptions.maxRetries})`);
              
              await new Promise(resolve => setTimeout(resolve, delay));
              return makeStreamRequest();
            }
            
            throw error;
          }
        };
        
        await makeStreamRequest();
      });
    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error(String(error)));
      this.logger.error('Stream error', { error });
    }
  }

  private selectModel(complexity: TaskComplexity): string {
    return MODEL_MAP[complexity] || this.config.defaultModel;
  }

  private getModelParameters(
    purpose: ResponsePurpose, 
    userOptions?: Partial<ModelParameters>
  ): ModelParameters {
    const presetParams = PARAMETER_PRESETS[purpose] || this.config.defaultParams;
    return { ...presetParams, ...userOptions };
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    options: {
      retryCount?: number;
      isRetryable?: (error: any) => boolean;
    } = {}
  ): Promise<T> {
    const retryCount = options.retryCount ?? 0;
    const isRetryable = options.isRetryable ?? ((error: any) => 
      error?.status === 429 || 
      error?.response?.status === 429 ||
      error?.status === 500 ||
      error?.response?.status === 500
    );

    try {
      return await operation();
    } catch (error: any) {
      if (isRetryable(error) && retryCount < this.config.retryOptions.maxRetries) {
        const delay = this.config.retryOptions.initialDelayMs * Math.pow(2, retryCount);
        
        this.logger.warn(`Operation failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.config.retryOptions.maxRetries})`, {
          error: error.message,
          retryCount,
          delay
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(operation, { 
          retryCount: retryCount + 1,
          isRetryable 
        });
      }
      
      throw error;
    }
  }

  private async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number = this.config.timeout
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new NetworkError(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    return Promise.race([operation(), timeoutPromise]);
  }

  private async handleApiError(error: unknown): Promise<never> {
    this.logger.error('OpenRouter API error:', error);

    const err = error as any;
    if (err?.status === 401 || err?.response?.status === 401) {
      throw new AuthenticationError('OpenRouter authentication failed. Check your API key.');
    }
    
    if (err?.status === 429 || err?.response?.status === 429) {
      throw new RateLimitError('OpenRouter rate limit exceeded. Please try again later.');
    }

    if (err?.status === 500 || err?.response?.status === 500) {
      throw new NetworkError('OpenRouter server error. Please try again later.');
    }

    if (err?.status === 400 || err?.response?.status === 400) {
      throw new ModelError(err?.message || 'Invalid request to OpenRouter API.');
    }

    throw new NetworkError(err?.message || 'Unknown error occurred while calling OpenRouter API.');
  }
} 