# Plan Wdrożenia Usługi OpenRouter

## 1. Opis usługi

Usługa OpenRouter stanowi warstwę abstrakcji nad API OpenRouter, umożliwiającą integrację z różnymi modelami LLM. Głównym celem jest dostarczenie jednolitego interfejsu do komunikacji z modelami AI, obsługi formatów odpowiedzi oraz zarządzania kontekstem rozmowy.

## 2. Opis konstruktora

```typescript
export class OpenRouterService {
  constructor(
    private readonly config: OpenRouterConfig = DEFAULT_CONFIG,
    private readonly logger = createLogger('OpenRouterService')
  ) {
    this.client = createOpenRouterClient(config.apiKey);
  }
}
```

### OpenRouterConfig

```typescript
export interface OpenRouterConfig {
  apiKey: string;
  defaultModel: string;
  defaultParams: {
    temperature: number;
    top_p: number;
    max_tokens?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
  };
  timeout: number;
  retryOptions: {
    maxRetries: number;
    initialDelayMs: number;
  };
}
```

## 3. Publiczne metody i pola

### Client

```typescript
private client: OpenRouterClient;
```

### generateCompletion

```typescript
async generateCompletion(
  prompt: string,
  options?: Partial<CompletionOptions>
): Promise<string>
```

### generateChat

```typescript
async generateChat(
  messages: Message[],
  options?: Partial<ChatOptions>
): Promise<Message>
```

### generateStructuredResponse

```typescript
async generateStructuredResponse<T>(
  messages: Message[],
  schema: JSONSchema,
  options?: Partial<ChatOptions>
): Promise<T>
```

### streamChat

```typescript
async streamChat(
  messages: Message[],
  callbacks: StreamCallbacks,
  options?: Partial<ChatOptions>
): Promise<void>
```

## 4. Prywatne metody i pola

### createOpenRouterClient

```typescript
private createOpenRouterClient(apiKey: string): OpenRouterClient
```

### buildMessages

```typescript
private buildMessages(
  systemMessage: string | null,
  userMessages: Message[]
): Message[]
```

### handleApiError

```typescript
private handleApiError(error: unknown): never
```

### selectModel

```typescript
private selectModel(complexity: TaskComplexity): string
```

### getModelParameters

```typescript
private getModelParameters(
  purpose: ResponsePurpose,
  userOptions?: Partial<ModelParameters>
): ModelParameters
```

## 5. Obsługa błędów

Usługa implementuje następujące mechanizmy obsługi błędów:

1. **Hierarchia błędów**
   - `OpenRouterError` - klasa bazowa
   - `AuthenticationError` - problemy z autoryzacją
   - `RateLimitError` - przekroczenie limitów
   - `ModelError` - problemy z modelem
   - `NetworkError` - problemy sieciowe 
   - `ValidationError` - nieprawidłowe dane

2. **Strategia retry**
   - Exponential backoff dla tymczasowych problemów
   - Automatyczne przełączanie na alternatywne modele

3. **Graceful degradation**
   - Fallback na prostsze modele
   - Odpowiedzi awaryjne

## 6. Kwestie bezpieczeństwa

1. **Zarządzanie kluczami API**
   - Przechowywanie tylko po stronie serwera
   - Wykorzystanie zmiennych środowiskowych
   - Rotacja kluczy

2. **Sanityzacja danych**
   - Walidacja danych wejściowych
   - Filtrowanie wrażliwych informacji

3. **Monitoring i audyt**
   - Logowanie użycia (bez danych użytkowników)
   - Kontrola dostępu

## 7. Plan wdrożenia krok po kroku

### Krok 1: Konfiguracja podstawowej struktury

1. Utwórz folder `app/lib/openrouter` dla usługi
2. Stwórz plik konfiguracyjny `config.ts` definiujący parametry API
3. Zdefiniuj typy i interfejsy w `types.ts`

```typescript
// app/lib/openrouter/types.ts
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type TaskComplexity = 'simple' | 'medium' | 'complex';
export type ResponsePurpose = 'creative' | 'factual' | 'code' | 'medical';

export interface ModelParameters {
  temperature: number;
  top_p: number;
  max_tokens?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface JSONSchema {
  type: 'json_schema';
  json_schema: {
    name: string;
    strict: true;
    schema: Record<string, any>;
  }
}
```

### Krok 2: Implementacja klienta

1. Utwórz plik `client.ts` z funkcją do tworzenia klienta

```typescript
// app/lib/openrouter/client.ts
import { createClient } from "@openrouter/client";

export function createOpenRouterClient(apiKey: string) {
  return createClient({
    apiKey,
    baseURL: process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "10x MedMinder Plus"
    }
  });
}
```

### Krok 3: Implementacja usługi OpenRouter

```typescript
// app/lib/openrouter/service.ts
import { createOpenRouterClient } from "./client";
import { 
  Message, 
  TaskComplexity, 
  ResponsePurpose, 
  ModelParameters,
  JSONSchema
} from "./types";
import { logger } from "../../utils/logger";

const MODEL_MAP = {
  simple: "openai/gpt-3.5-turbo",
  medium: "anthropic/claude-3-sonnet",
  complex: "openai/gpt-4o"
};

const PARAMETER_PRESETS: Record<ResponsePurpose, ModelParameters> = {
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

const DEFAULT_SYSTEM_MESSAGE = 
  "You are a helpful AI assistant providing accurate information.";

const DEFAULT_CONFIG = {
  apiKey: process.env.OPENROUTER_API_KEY || "",
  defaultModel: "openai/gpt-3.5-turbo",
  defaultParams: PARAMETER_PRESETS.factual,
  timeout: 30000,
  retryOptions: {
    maxRetries: 3,
    initialDelayMs: 1000
  }
};

export class OpenRouterService {
  private client;
  private logger;

  constructor(
    private readonly config = DEFAULT_CONFIG,
    loggerInstance = logger
  ) {
    this.client = createOpenRouterClient(config.apiKey);
    this.logger = loggerInstance.withContext({ service: 'OpenRouterService' });
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
  ) {
    const model = options.model || 
      (options.complexity ? this.selectModel(options.complexity) : this.config.defaultModel);
    
    const purpose = options.purpose || 'factual';
    const params = this.getModelParameters(purpose, options.parameters);
    
    // Build full message array with system message
    const fullMessages = options.systemMessage 
      ? [{ role: 'system', content: options.systemMessage }, ...messages]
      : messages;
    
    try {
      this.logger.debug('Generating chat response', { model, messageCount: messages.length });
      
      const response = await this.client.chat.completions.create({
        messages: fullMessages,
        model,
        ...params
      });
      
      return response.choices[0].message;
    } catch (error) {
      this.handleApiError(error);
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
    const model = options.model || 
      (options.complexity ? this.selectModel(options.complexity) : this.config.defaultModel);
    
    const purpose = options.purpose || 'factual';
    const params = this.getModelParameters(purpose, options.parameters);
    
    // Build full message array with system message
    const fullMessages = options.systemMessage 
      ? [{ role: 'system', content: options.systemMessage }, ...messages]
      : messages;
    
    try {
      this.logger.debug('Generating structured response', { 
        model, 
        messageCount: messages.length,
        schemaName: schema.json_schema.name
      });
      
      const response = await this.client.chat.completions.create({
        messages: fullMessages,
        model,
        response_format: schema,
        ...params
      });
      
      const content = response.choices[0].message.content;
      
      try {
        return JSON.parse(content) as T;
      } catch (parseError) {
        this.logger.error('Failed to parse structured response', { 
          error: parseError,
          content
        });
        throw new Error('Failed to parse AI response as structured data');
      }
    } catch (error) {
      this.handleApiError(error);
    }
  }

  async streamChat(
    messages: Message[],
    callbacks: {
      onMessage: (chunk: string) => void;
      onComplete: (fullResponse: string) => void;
      onError: (error: Error) => void;
    },
    options: {
      systemMessage?: string;
      model?: string;
      purpose?: ResponsePurpose;
      parameters?: Partial<ModelParameters>;
      complexity?: TaskComplexity;
    } = {}
  ) {
    const model = options.model || 
      (options.complexity ? this.selectModel(options.complexity) : this.config.defaultModel);
    
    const purpose = options.purpose || 'factual';
    const params = this.getModelParameters(purpose, options.parameters);
    
    // Build full message array with system message
    const fullMessages = options.systemMessage 
      ? [{ role: 'system', content: options.systemMessage }, ...messages]
      : messages;
    
    try {
      this.logger.debug('Starting chat stream', { model, messageCount: messages.length });
      
      let fullResponse = '';
      
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

  private handleApiError(error: unknown): never {
    const err = error as any;
    
    if (err?.response?.status === 401) {
      this.logger.error('Authentication error', { error: err });
      throw new Error('OpenRouter authentication failed. Check your API key.');
    }
    
    if (err?.response?.status === 429) {
      this.logger.error('Rate limit exceeded', { error: err });
      throw new Error('OpenRouter rate limit exceeded. Please try again later.');
    }
    
    if (err?.response?.status === 500) {
      this.logger.error('OpenRouter server error', { error: err });
      throw new Error('OpenRouter server error. Please try again later.');
    }
    
    this.logger.error('OpenRouter API error', { error: err });
    throw new Error(`OpenRouter error: ${err?.message || 'Unknown error'}`);
  }
}
```

### Krok 4: Schematy JSON dla strukturyzowanych odpowiedzi

```typescript
// app/lib/openrouter/schemas.ts
import { JSONSchema } from "./types";

export const MEDICATION_INTERACTION_SCHEMA: JSONSchema = {
  type: 'json_schema',
  json_schema: {
    name: 'MedicationInteractionResponse',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        has_interactions: { type: 'boolean' },
        severity_level: { 
          type: 'string', 
          enum: ['low', 'moderate', 'high'] 
        },
        interactions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              medication_pair: { 
                type: 'array', 
                items: { type: 'string' },
                minItems: 2,
                maxItems: 2
              },
              description: { type: 'string' },
              severity: { 
                type: 'string', 
                enum: ['low', 'moderate', 'high'] 
              },
              recommendations: { type: 'string' },
              confidence_score: { 
                type: 'number', 
                minimum: 0,
                maximum: 1
              }
            },
            required: ['medication_pair', 'description', 'severity', 'recommendations']
          }
        },
        disclaimer: { type: 'string' },
        model_version: { type: 'string' }
      },
      required: ['has_interactions', 'severity_level', 'interactions', 'disclaimer']
    }
  }
};
```

### Krok 5: Implementacja MedicationService z OpenRouter

Zmodyfikuj istniejący `medication.service.ts`, aby wykorzystać nową usługę OpenRouter:

```typescript
// app/services/medication/medication.service.ts
import { OpenRouterService } from '../../lib/openrouter/service';
import { MEDICATION_INTERACTION_SCHEMA } from '../../lib/openrouter/schemas';
import { ValidateMedicationInteractionsResponse } from '../../types';

export class MedicationService {
  private openRouterService = new OpenRouterService();
  
  // ...istniejący kod...

  async validateMedicationInteractions(
    userId: string, 
    newMedicationData: CreateMedicationRequest
  ): Promise<ValidateMedicationInteractionsResponse> {
    this.logger.info('Validating medication interactions', { userId });
    const supabase = await createClient();

    // Pobierz istniejące leki i profil użytkownika
    // ...istniejący kod...

    // Przygotuj żądanie walidacji 
    const validationRequest = {
      // ...istniejący kod...
    };

    // Jeśli brak istniejących leków, brak interakcji do sprawdzenia
    if (existingMedications.length === 0) {
      return {
        // ...istniejący kod...
      };
    }

    try {
      // Zbuduj prompt
      const prompt = this.buildInteractionCheckPrompt(validationRequest);
      
      // Użyj OpenRouterService zamiast bezpośrednich wywołań OpenAI
      const interactionResult = await this.openRouterService.generateStructuredResponse<ValidateMedicationInteractionsResponse>(
        [{ role: 'user', content: prompt }],
        MEDICATION_INTERACTION_SCHEMA,
        {
          systemMessage: `You are a medical interaction analysis system. Your task is to identify potential interactions between medications.
          Consider drug-drug interactions, contraindications related to user health conditions, and potential allergic reactions.
          Rank interactions by severity (low, moderate, high) and provide specific recommendations.
          Be precise, comprehensive, and return results in the exact JSON format requested.
          Remember that patient safety is paramount, but avoid raising unnecessary alarms for minimal risks.
          Always include a medical disclaimer.`,
          purpose: 'medical',
          complexity: 'complex'
        }
      );
      
      this.logger.debug('AI interaction check completed', { 
        userId, 
        hasInteractions: interactionResult.has_interactions,
        severity: interactionResult.severity_level
      });

      // Dopełnij odpowiedź
      return {
        ...interactionResult,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error checking medication interactions with AI', {
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Odpowiedź awaryjna
      return {
        // ...istniejący kod fallback...
      };
    }
  }

  // ...istniejący kod...
}
```

### Krok 6: Konfiguracja zmiennych środowiskowych

Dodaj następujące zmienne do pliku `.env`:

```
OPENROUTER_API_URL=https://openrouter.ai/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Krok 7: Implementacja testów

1. Utwórz bazowe testy dla usługi OpenRouter
2. Zaimplementuj testy integracyjne z rzeczywistym API
3. Dodaj testy mock dla scenariuszy błędów

### Krok 8: Dokumentacja i przykłady użycia

Utwórz dokumentację z przykładami użycia usługi w różnych kontekstach:

1. Generowanie prostych odpowiedzi czatu
2. Strukturyzowane odpowiedzi z użyciem schematów JSON
3. Strumieniowanie odpowiedzi
4. Obsługa błędów i retry

### Krok 9: Monitoring i logowanie

1. Implementacja logowania użycia API
2. Konfiguracja alertów dla błędów
3. Monitorowanie kosztów i wydajności 