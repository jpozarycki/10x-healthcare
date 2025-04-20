# API Endpoint Implementation Plan: List Medications

## 1. Przegląd punktu końcowego
Endpoint służy do pobierania paginowanej listy leków użytkownika z możliwością filtrowania, sortowania i paginacji wyników. Umożliwia użytkownikom przeglądanie wszystkich swoich leków w aplikacji MedMinder Plus z różnymi opcjami wizualizacji i organizacji danych.

## 2. Szczegóły żądania
- **Metoda HTTP**: GET
- **Struktura URL**: `/v1/medications`
- **Parametry zapytania**:
  - **Opcjonalne**: 
    - `category`: Filtrowanie według kategorii leku (chronic, acute, as_needed)
    - `status`: Filtrowanie według statusu aktywności (active/inactive) 
    - `page`: Numer strony (domyślnie 1)
    - `limit`: Liczba elementów na stronę (domyślnie 10, max 50)
    - `sort`: Pole sortowania (id, name, form, start_date, end_date)
    - `order`: Kierunek sortowania (asc/desc, domyślnie asc)

## 3. Wykorzystywane typy
- **DTOs**:
  - `MedicationListItem` - Reprezentacja pojedynczego leku w liście
  - `ListMedicationsResponse` - Struktura odpowiedzi z paginacją
- **Query Params Interface**:
  ```typescript
  interface GetMedicationsQueryParams {
    category?: Database['public']['Enums']['medication_category'];
    status?: 'active' | 'inactive';
    page?: number;
    limit?: number;
    sort?: 'id' | 'name' | 'form' | 'start_date' | 'end_date';
    order?: 'asc' | 'desc';
  }
  ```

## 4. Szczegóły odpowiedzi
- **Kod statusu sukcesu**: 200 OK
- **Format odpowiedzi**:
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "name": "string",
        "form": "string",
        "strength": "string",
        "category": "string",
        "is_active": "boolean",
        "start_date": "date",
        "end_date": "date",
        "refill_reminder_days": "number"
      }
    ],
    "total": "number",
    "page": "number",
    "limit": "number"
  }
  ```
- **Nagłówki odpowiedzi**:
  - `Content-Type: application/json`

## 5. Przepływ danych
1. Przyjęcie żądania GET z parametrami zapytania
2. Walidacja parametrów zapytania
3. Pobieranie ID użytkownika z kontekstu uwierzytelnienia 
4. Przygotowanie zapytania do bazy danych:
   - Konstrukcja klauzuli WHERE na podstawie parametrów filtrowania
   - Dodanie filtra user_id dla bezpieczeństwa danych
   - Konfiguracja sortowania i paginacji
5. Wykonanie zapytania przez klienta Supabase
6. Mapowanie wyników do typu `MedicationListItem[]`
7. Pobranie całkowitej liczby rekordów dla paginacji
8. Zwrócenie poprawnie sformatowanej odpowiedzi `ListMedicationsResponse`

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Wymagane uwierzytelnienie poprzez middleware Supabase Auth
- **Autoryzacja**: 
  - Użytkownik może pobierać tylko własne leki
  - Wykorzystanie Row Level Security (RLS) w Supabase jako dodatkowej warstwy bezpieczeństwa
- **Walidacja danych**:
  - Sanityzacja parametrów zapytania przed użyciem w zapytaniach SQL
  - Walidacja typów i zakresów parametrów paginacji i sortowania
- **Rate Limiting**:
  - Implementacja limitów zapytań na endpoint dla zapobiegania atakom DoS
- **Wrażliwe dane**:
  - Upewnij się, że zwracane są tylko niezbędne pola zgodnie ze specyfikacją API

## 7. Obsługa błędów
- **400 Bad Request**:
  - Nieprawidłowe parametry zapytania (np. ujemny numer strony)
  - Nieprawidłowe wartości enumeracji (np. nieistniejąca kategoria)
  - Próba sortowania według nieprawidłowego pola
- **401 Unauthorized**:
  - Brak tokenu uwierzytelniającego
  - Wygaśnięty token uwierzytelniający
- **403 Forbidden**:
  - Próba dostępu do zasobów innego użytkownika
- **500 Internal Server Error**:
  - Błędy połączenia z bazą danych
  - Nieoczekiwane wyjątki podczas przetwarzania zapytania

## 8. Rozważania dotyczące wydajności
- Indeksy bazy danych:
  - Upewnij się, że istnieją odpowiednie indeksy na polach stosowanych do filtrowania i sortowania
  - Niezbędne indeksy: 
    - `idx_medications_user_id` (już zdefiniowany)
    - `idx_medications_category` (do rozważenia)
    - `idx_medications_is_active` (do rozważenia)
- Paginacja:
  - Użyj parametrów `limit` i `offset` w zapytaniu SQL dla wydajnej paginacji
  - Ustaw rozsądny limit maksymalnej liczby elementów na stronę (np. 50)
- Cachowanie:
  - Rozważ implementację cachowania na poziomie Edge (wykorzystując Vercel Edge)
  - Ustaw odpowiednie nagłówki cache-control w zależności od częstotliwości zmian danych

## 9. Etapy wdrożenia

1. **Konfiguracja endpointu w Next.js**:
   ```typescript
   // app/api/v1/medications/route.ts
   import { NextRequest, NextResponse } from 'next/server';
   import { createClient } from '@/utils/supabase/server';
   import { MedicationService } from '@/services/medication.service';
   import { validateQueryParams } from '@/utils/validators';

   export async function GET(req: NextRequest) {
     try {
       // Ekstrakcja parametrów zapytania
       const searchParams = req.nextUrl.searchParams;
       const queryParams = {
         category: searchParams.get('category'),
         status: searchParams.get('status'),
         page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
         limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
         sort: searchParams.get('sort') || 'name',
         order: searchParams.get('order') || 'asc'
       };

       // Walidacja parametrów zapytania
       const validationResult = validateQueryParams(queryParams);
       if (!validationResult.success) {
         return NextResponse.json(
           { error: validationResult.error },
           { status: 400 }
         );
       }

       // Pobranie danych
       const supabase = await createClient();
       const medicationService = new MedicationService(supabase);
       const response = await medicationService.listMedications(queryParams);

       return NextResponse.json(response);
     } catch (error) {
       console.error('Error fetching medications:', error);
       return NextResponse.json(
         { error: 'Wystąpił błąd podczas pobierania leków' },
         { status: 500 }
       );
     }
   }
   ```

2. **Implementacja serwisu do obsługi zapytań**:
   ```typescript
   // services/medication.service.ts
   import { SupabaseClient } from '@supabase/supabase-js';
   import { ListMedicationsResponse, MedicationListItem } from '@/app/types';
   import { Database } from '@/app/db/database.types';

   export class MedicationService {
     constructor(private supabase: SupabaseClient<Database>) {}

     async listMedications(params: {
       category?: string;
       status?: string;
       page?: number;
       limit?: number;
       sort?: string;
       order?: 'asc' | 'desc';
     }): Promise<ListMedicationsResponse> {
       const {
         category,
         status,
         page = 1,
         limit = 10,
         sort = 'name',
         order = 'asc'
       } = params;

       // Ograniczenie limitów paginacji
       const safeLimit = Math.min(Math.max(1, limit), 50);
       const offset = (page - 1) * safeLimit;

       // Budowanie zapytania
       let query = this.supabase
         .from('medications')
         .select(
           'id, name, form, strength, category, is_active, start_date, end_date, refill_reminder_days',
           { count: 'exact' }
         );

       // Dodanie filtrów
       if (category) {
         query = query.eq('category', category);
       }
       
       if (status) {
         query = query.eq('is_active', status === 'active');
       }

       // Sortowanie i paginacja
       query = query
         .order(sort as any, { ascending: order === 'asc' })
         .range(offset, offset + safeLimit - 1);

       // Wykonanie zapytania
       const { data, count, error } = await query;

       if (error) {
         console.error('Error in medication service:', error);
         throw new Error('Nie udało się pobrać leków');
       }

       // Formatowanie odpowiedzi
       return {
         items: data as MedicationListItem[],
         total: count || 0,
         page,
         limit: safeLimit
       };
     }
   }
   ```

3. **Implementacja walidacji parametrów**:
   ```typescript
   // utils/validators.ts
   import { z } from 'zod';
   import { Database } from '@/app/db/database.types';

   type MedicationCategory = Database['public']['Enums']['medication_category'];

   const medicationQuerySchema = z.object({
     category: z.enum(['chronic', 'acute', 'as_needed'] as [MedicationCategory, ...MedicationCategory[]]).optional(),
     status: z.enum(['active', 'inactive']).optional(),
     page: z.number().int().positive().optional().default(1),
     limit: z.number().int().positive().max(50).optional().default(10),
     sort: z.enum(['id', 'name', 'form', 'start_date', 'end_date']).optional().default('name'),
     order: z.enum(['asc', 'desc']).optional().default('asc')
   });

   export function validateQueryParams(params: unknown) {
     return medicationQuerySchema.safeParse(params);
   }
   ```

4. **Konfiguracja Row Level Security i indeksów w Supabase**:
   ```sql

   -- Dodaj indeks do kolumny category jeśli często używana do filtrowania
   CREATE INDEX IF NOT EXISTS idx_medications_category ON medications(category);
   
   -- Dodaj indeks do kolumny is_active jeśli często używana do filtrowania
   CREATE INDEX IF NOT EXISTS idx_medications_is_active ON medications(is_active);
   ```

5. **Dokumentacja endpointu w Swagger/OpenAPI**:
   ```yaml
   # openapi.yaml
   paths:
     /v1/medications:
       get:
         summary: Lista leków użytkownika
         parameters:
           - name: category
             in: query
             schema:
               type: string
               enum: [chronic, acute, as_needed]
           # pozostałe parametry...
         responses:
           '200':
             description: Sukces
             content:
               application/json:
                 schema:
                   $ref: '#/components/schemas/ListMedicationsResponse'
           # pozostałe kody odpowiedzi...
   ```

6. **Konfiguracja Rate Limitingu w middleware**:
   ```typescript
   // middleware.ts
   import { NextResponse } from 'next/server';
   import type { NextRequest } from 'next/server';
   import { Ratelimit } from '@upstash/ratelimit';
   import { Redis } from '@upstash/redis';

   // Konfiguracja rate limitera (np. 60 requestów na minutę)
   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(60, '1 m'),
   });

   export async function middleware(request: NextRequest) {
     // Zastosuj rate limiting tylko dla endpointów API
     if (request.nextUrl.pathname.startsWith('/api/')) {
       const ip = request.ip ?? '127.0.0.1';
       const { success, limit, reset, remaining } = await ratelimit.limit(ip);
       
       if (!success) {
         return NextResponse.json(
           { error: 'Przekroczono limit zapytań' },
           { 
             status: 429,
             headers: {
               'X-RateLimit-Limit': limit.toString(),
               'X-RateLimit-Remaining': remaining.toString(),
               'X-RateLimit-Reset': reset.toString(),
             }
           }
         );
       }
     }
     
     return NextResponse.next();
   }
   ```

7. **Wdrożenie do środowiska testowego i walidacja**:
   - Potwierdzenie zgodności zwracanych danych ze specyfikacją API 