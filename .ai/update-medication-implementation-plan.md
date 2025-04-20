# API Endpoint Implementation Plan: Update Medication

## 1. Przegląd punktu końcowego
Endpoint umożliwia aktualizację istniejącego leku (medication) w systemie. Pozwala na modyfikację wszystkich atrybutów leku, w tym jego nazwy, kategorii, dawkowania i harmonogramu. Odpowiada za utrzymanie aktualnych informacji o lekach pacjenta w systemie MedMinder Plus.

## 2. Szczegóły żądania
- **Metoda HTTP**: PUT
- **Struktura URL**: `/v1/medications/{id}`
- **Parametry ścieżki**:
  - `id` (wymagany): Unikalny identyfikator leku (UUID)
- **Nagłówki**:
  - `Authorization`: Bearer token (wymagany)
  - `Content-Type`: application/json (wymagany)
- **Request Body**:
  ```typescript
  {
    "name": string,                      // wymagane
    "form": string,                      // wymagane
    "strength"?: string,                 // opcjonalne
    "strength_unit_id"?: string,         // opcjonalne
    "category": medication_category,     // wymagane, enum
    "purpose"?: string,                  // opcjonalne
    "instructions"?: string,             // opcjonalne
    "start_date": date,                // wymagane, format ISO
    "end_date"?: date,                 // opcjonalne, format ISO
    "refill_reminder_days"?: number,     // opcjonalne
    "pills_per_refill"?: number,         // opcjonalne
    "schedule": {                        // wymagane
      "type": string,
      "pattern": Record<string, unknown>,
      "times": string[],
      "with_food": boolean
    }
  }
  ```

## 3. Wykorzystywane typy
- **DTO**:
  - `UpdateMedicationRequest` (identyczny z `CreateMedicationRequest`)
  - `MedicationDetailResponse` (do zwrócenia zaktualizowanych danych)
  - `SchedulePattern` (do definicji harmonogramu przyjmowania leku)
- **Command Models**:
  - `UpdateMedicationCommand` (wewnętrzna reprezentacja żądania aktualizacji)
- **Enums**:
  - `medication_category` z bazy danych

## 4. Szczegóły odpowiedzi
- **Kod sukcesu**: 200 OK
- **Struktura odpowiedzi**:
  ```typescript
  {
    "id": string,
    "name": string,
    "form": string,
    "strength": string | null,
    "category": medication_category,
    "is_active": boolean,
    "start_date": date,
    "end_date": date | null,
    "refill_reminder_days": number | null,
    "purpose": string | null,
    "instructions": string | null,
    "pills_per_refill": number | null,
    "pills_remaining": number | null,
    "schedules": [
      {
        "id": string,
        "schedule_type": string,
        "schedule_pattern": Record<string, unknown>,
        "dose_amount": number,
        "dose_unit_id": string | null,
        "with_food": boolean,
        "start_date": string,
        "end_date": string | null
      }
    ]
  }
  ```

## 5. Przepływ danych
1. **Walidacja wejścia**:
   - Sprawdzenie poprawności formatu danych wejściowych
   - Walidacja zgodności typów danych
   - Walidacja biznesowa (np. end_date > start_date)

2. **Autoryzacja**:
   - Sprawdzenie, czy użytkownik jest zalogowany (middleware autoryzacyjne)
   - Sprawdzenie, czy użytkownik ma uprawnienia do edycji danego leku

3. **Przetwarzanie danych**:
   - Pobranie istniejącego leku z bazy danych
   - Sprawdzenie czy lek istnieje
   - Aktualizacja pól leku nowymi wartościami
   - Aktualizacja powiązanych harmonogramów (medication_schedules)
   - Zapisanie zmian w bazie danych z wykorzystaniem Supabase

4. **Generowanie odpowiedzi**:
   - Pobranie zaktualizowanego leku wraz z harmonogramami
   - Transformacja danych do formatu odpowiedzi
   - Zwrócenie odpowiedzi z kodem 200 OK

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**:
  - Wykorzystanie middleware Supabase do weryfikacji tokenu JWT
  - Sprawdzenie ważności tokenu przed wykonaniem operacji

- **Autoryzacja**:
  - Wykorzystanie Row Level Security (RLS) Supabase do filtrowania rekordów
  - Sprawdzenie, czy medication.user_id odpowiada ID zalogowanego użytkownika

- **Walidacja danych**:
  - Sanityzacja danych wejściowych dla zapobiegania atakom iniekcji
  - Używanie zod do walidacji struktury danych wejściowych
  - Walidacja wartości pól zgodnie z regułami biznesowymi

- **Audyt**:
  - Logowanie operacji aktualizacji leku
  - Przechowywanie historii zmian

## 7. Obsługa błędów
- **400 Bad Request**:
  - Brak wymaganych pól
  - Nieprawidłowy format danych
  - Nieprawidłowa wartość dla pola enum (np. category)
  - Nieprawidłowy format daty
  - End_date wcześniejsza niż start_date

- **401 Unauthorized**:
  - Brak lub nieprawidłowy token uwierzytelniający

- **403 Forbidden**:
  - Użytkownik próbuje edytować lek, który do niego nie należy

- **404 Not Found**:
  - Lek o podanym ID nie istnieje

- **409 Conflict**:
  - Konflikt podczas aktualizacji (np. równoczesna modyfikacja)

- **422 Unprocessable Entity**:
  - Dane są poprawne, ale nie mogą być przetworzone z powodów biznesowych

- **500 Internal Server Error**:
  - Nieoczekiwany błąd serwera
  - Problem z połączeniem do bazy danych

## 8. Rozważania dotyczące wydajności
- **Indeksy bazy danych**:
  - Upewnienie się, że kolumna id w tabeli medications jest zindeksowana
  - Wykorzystanie istniejących indeksów z planu bazodanowego

- **Transakcje**:
  - Wykorzystanie transakcji SQL dla atomowych operacji aktualizacji leku i jego harmonogramów

- **Optymalizacja zapytań**:
  - Ograniczenie liczby zapytań do bazy danych
  - Łączenie operacji aktualizacji gdzie to możliwe

- **Caching**:
  - Rozważenie cachowania często używanych leków
  - Wykorzystanie mechanizmów cachingu Next.js dla statycznych danych

## 9. Etapy wdrożenia
1. **Utworzenie typów**:
   - Zdefiniowanie typów dla żądania aktualizacji (w oparciu o istniejący CreateMedicationRequest)
   - Dostosowanie typów odpowiedzi

2. **Implementacja logiki biznesowej**:
   - Utworzenie/aktualizacja serwisu MedicationService z metodą updateMedication
   - Implementacja walidacji danych wejściowych za pomocą zod
   - Implementacja logiki aktualizacji leku i jego harmonogramów

3. **Implementacja handlera endpoint'u**:
   - Utworzenie pliku `/app/api/v1/medications/[id]/route.ts`
   - Implementacja metody PUT w handlerze
   - Integracja z serwisem aktualizacji leku

4. **Dodanie warstwy bezpieczeństwa**:
   - Implementacja middleware uwierzytelniania
   - Zastosowanie zasad RLS w bazie danych
   - Dodanie logiki autoryzacji

5. **Implementacja obsługi błędów**:
   - Dodanie obsługi wyjątków
   - Implementacja formatowania komunikatów błędów
   - Dodanie logowania błędów

6. **Dokumentacja**:
   - Aktualizacja dokumentacji API
   - Dodanie przykładów użycia endpointu
   - Dokumentacja kodów błędów i możliwych odpowiedzi

## 10. Przykładowy kod

### Przykład implementacji route handlera (Next.js App Router)

```typescript
// app/api/v1/medications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { medicationService } from '@/services/medication-service';
import { StatusModal } from '@/components/ui/status-modal';

// Schemat walidacji za pomocą zod
const updateMedicationSchema = z.object({
  name: z.string().min(1),
  form: z.string().min(1),
  strength: z.string().optional(),
  strength_unit_id: z.string().uuid().optional(),
  category: z.enum(['chronic', 'acute', 'as_needed']),
  purpose: z.string().optional(),
  instructions: z.string().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  refill_reminder_days: z.number().min(0).optional(),
  pills_per_refill: z.number().min(0).optional(),
  schedule: z.object({
    type: z.string(),
    pattern: z.record(z.unknown()),
    times: z.array(z.string()),
    with_food: z.boolean()
  })
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Utworzenie klienta Supabase
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Obsługa przypadku wywołania z komponentu serwerowego
            }
          },
        },
      }
    );

    // Sprawdzenie uwierzytelnienia
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized', error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Pobranie i walidacja danych
    const requestData = await request.json();

    // Walidacja za pomocą zod
    const validationResult = updateMedicationSchema.safeParse(requestData);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validationResult.error.format() },
        { status: 400 }
      );
    }

    // Aktualizacja leku
    const updateResult = await medicationService.updateMedication(
      params.id,
      user.id,
      validationResult.data
    );

    if (updateResult.error) {
      return NextResponse.json(
        { message: updateResult.error.message },
        { status: updateResult.error.statusCode || 500 }
      );
    }

    // Zwrócenie zaktualizowanego leku
    return NextResponse.json(updateResult.data, { status: 200 });

  } catch (error: any) {
    console.error('Error updating medication:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
```

### Przykład implementacji serwisu aktualizacji leku

```typescript
// services/medication-service.ts
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/app/db/database.types';
import { MedicationDetailResponse, UpdateMedicationRequest } from '@/app/types';

class MedicationService {
  
  async updateMedication(
    medicationId: string,
    userId: string,
    updateData: UpdateMedicationRequest
  ): Promise<{ data: MedicationDetailResponse | null; error: { message: string; statusCode: number } | null }> {
    try {
      // Utworzenie klienta Supabase (bardziej realistycznie byłoby przekazać instancję)
      const supabase = createServerClient<Database>(/* ... */);
      
      // Sprawdzenie, czy lek istnieje i należy do użytkownika
      const { data: existingMedication, error: fetchError } = await supabase
        .from('medications')
        .select('*')
        .eq('id', medicationId)
        .eq('user_id', userId)
        .single();
      
      if (fetchError || !existingMedication) {
        return {
          data: null,
          error: {
            message: fetchError?.message || 'Medication not found',
            statusCode: fetchError ? 500 : 404
          }
        };
      }
      
      // Przygotowanie danych do aktualizacji
      const medicationUpdate = {
        name: updateData.name,
        form: updateData.form,
        strength: updateData.strength,
        strength_unit_id: updateData.strength_unit_id,
        category: updateData.category,
        purpose: updateData.purpose,
        instructions: updateData.instructions,
        start_date: updateData.start_date,
        end_date: updateData.end_date,
        refill_reminder_days: updateData.refill_reminder_days,
        pills_per_refill: updateData.pills_per_refill,
        updated_at: new Date().toISOString()
      };
      
      // Rozpoczęcie transakcji
      const { error: updateError } = await supabase
        .from('medications')
        .update(medicationUpdate)
        .eq('id', medicationId)
        .eq('user_id', userId);
      
      if (updateError) {
        return {
          data: null,
          error: {
            message: updateError.message,
            statusCode: 500
          }
        };
      }
      
      // Aktualizacja lub utworzenie harmonogramu
      // Najpierw pobieramy istniejące harmonogramy
      const { data: existingSchedules } = await supabase
        .from('medication_schedules')
        .select('*')
        .eq('medication_id', medicationId);
      
      // W prawdziwej implementacji byłaby tu bardziej złożona logika
      // do aktualizacji istniejących harmonogramów lub tworzenia nowych,
      // w zależności od danych wejściowych i stanu istniejącego
      
      // Tutaj uproszczenie - aktualizacja pierwszego harmonogramu lub utworzenie nowego
      const scheduleData = {
        medication_id: medicationId,
        schedule_type: updateData.schedule.type,
        schedule_pattern: updateData.schedule.pattern,
        with_food: updateData.schedule.with_food,
        start_date: updateData.start_date,
        end_date: updateData.end_date,
        updated_at: new Date().toISOString()
      };
      
      if (existingSchedules && existingSchedules.length > 0) {
        await supabase
          .from('medication_schedules')
          .update(scheduleData)
          .eq('id', existingSchedules[0].id);
      } else {
        await supabase
          .from('medication_schedules')
          .insert(scheduleData);
      }
      
      // Pobranie zaktualizowanego leku z harmonogramami
      const { data: updatedMedication, error: fetchUpdatedError } = await supabase
        .from('medications')
        .select(`
          *,
          schedules:medication_schedules(*)
        `)
        .eq('id', medicationId)
        .eq('user_id', userId)
        .single();
      
      if (fetchUpdatedError) {
        return {
          data: null,
          error: {
            message: fetchUpdatedError.message,
            statusCode: 500
          }
        };
      }
      
      return {
        data: updatedMedication as unknown as MedicationDetailResponse,
        error: null
      };
      
    } catch (error: any) {
      console.error('Error in updateMedication service:', error);
      return {
        data: null,
        error: {
          message: error.message || 'Internal server error',
          statusCode: 500
        }
      };
    }
  }
}

export const medicationService = new MedicationService();
```
