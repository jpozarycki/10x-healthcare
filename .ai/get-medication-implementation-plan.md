# API Endpoint Implementation Plan: GET /v1/medications/{id}

## 1. Przegląd punktu końcowego
Endpoint służy do pobierania szczegółowych informacji o konkretnym leku, łącznie z przypisanymi harmonogramami przyjmowania. Zwraca kompletne dane leku potrzebne do wyświetlenia na stronie szczegółów leku, zarządzania harmonogramami oraz monitorowania stanu zapasów.

## 2. Szczegóły żądania
- **Metoda HTTP**: GET
- **Struktura URL**: `/v1/medications/{id}`
- **Parametry**:
  - **Wymagane**: `id` (UUID) - identyfikator leku w ścieżce URL
  - **Opcjonalne**: brak

## 3. Wykorzystywane typy
- **Request**: brak specjalnego typu (tylko parametr w ścieżce)
- **Response**: 
  ```typescript
  MedicationDetailResponse = MedicationListItem & {
    purpose?: string
    instructions?: string
    pills_per_refill?: number
    pills_remaining?: number
    schedules: DBTables['medication_schedules']['Row'][]
  }
  ```
- **Powiązane typy**:
  ```typescript
  MedicationListItem = Pick<
    DBTables['medications']['Row'],
    | 'id'
    | 'name'
    | 'form'
    | 'strength'
    | 'category'
    | 'is_active'
    | 'start_date'
    | 'end_date'
    | 'refill_reminder_days'
  >
  ```

## 4. Szczegóły odpowiedzi
- **Sukces (200 OK)**:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "form": "string",
    "strength": "string",
    "category": "chronic|acute|as_needed",
    "is_active": boolean,
    "start_date": "YYYY-MM-DD",
    "end_date": "YYYY-MM-DD",
    "refill_reminder_days": number,
    "purpose": "string",
    "instructions": "string",
    "pills_per_refill": number,
    "pills_remaining": number,
    "schedules": [
      {
        "id": "uuid",
        "medication_id": "uuid",
        "schedule_type": "string",
        "schedule_pattern": {},
        "dose_amount": number,
        "dose_unit_id": "uuid",
        "with_food": boolean,
        "special_instructions": "string",
        "start_date": "YYYY-MM-DD",
        "end_date": "YYYY-MM-DD",
        "is_active": boolean
      }
    ]
  }
  ```
- **Błąd (4xx/5xx)**:
  ```json
  {
    "message": "string",
    "error": "string",
    "statusCode": number
  }
  ```

## 5. Przepływ danych
1. **Odbiór żądania**:
   - Walidacja parametru `id` (poprawny format UUID)
   - Sprawdzenie uwierzytelnienia użytkownika
2. **Pobranie danych**:
   - Pobranie podstawowych informacji o leku z tabeli `medications`
   - Weryfikacja czy lek należy do zalogowanego użytkownika
   - Pobranie harmonogramów leku z tabeli `medication_schedules`
3. **Przetwarzanie danych**:
   - Mapowanie danych z bazy do formatu odpowiedzi API
4. **Odpowiedź**:
   - Zwrócenie połączonych danych w formacie JSON

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: 
  - Wykorzystanie middleware Supabase do weryfikacji tokenu użytkownika
  - Sprawdzenie czy żądanie zawiera prawidłowy token JWT
- **Autoryzacja**:
  - Weryfikacja czy zalogowany użytkownik jest właścicielem leku
  - Wykorzystanie Row Level Security (RLS) Supabase dla dodatkowej warstwy zabezpieczeń
- **Walidacja danych**:
  - Sprawdzenie poprawności formatu UUID parametru `id`
  - Sanityzacja danych przed zwróceniem odpowiedzi

## 7. Obsługa błędów
- **400 Bad Request**:
  - Niepoprawny format parametru `id` (nie jest poprawnym UUID)
- **401 Unauthorized**:
  - Brak tokenu uwierzytelniającego
  - Wygasły token uwierzytelniający
- **403 Forbidden**:
  - Użytkownik nie ma uprawnień do wyświetlania danego leku (lek należy do innego użytkownika)
- **404 Not Found**:
  - Lek o podanym `id` nie istnieje
- **500 Internal Server Error**:
  - Błąd podczas pobierania danych z bazy
  - Nieoczekiwany błąd serwera

## 8. Rozważania dotyczące wydajności
- **Optymalizacja zapytań**:
  - Wykorzystanie SQL JOIN do pobrania leku i jego harmonogramów jednym zapytaniem
  - Indeksy na kolumnach `id` i `user_id` w tabeli `medications`
  - Indeks na kolumnie `medication_id` w tabeli `medication_schedules`
- **Caching**:
  - Implementacja cache dla często pobieranych leków
  - Wykorzystanie mechanizmów Supabase do optymalizacji zapytań

## 9. Etapy wdrożenia
1. **Utworzenie funkcji route handlera**:
   - Utworzenie nowego pliku `app/api/v1/medications/[id]/route.ts`
   - Zdefiniowanie funkcji obsługującej metodę GET

2. **Implementacja walidacji parametrów**:
   - Walidacja poprawności formatu UUID parametru `id` (przy użyciu biblioteki zod)

3. **Implementacja serwisu do pobierania danych**:
   - Funkcja pobierająca lek i jego harmonogramy z bazy Supabase
   - Wykorzystanie RLS do zapewnienia autoryzacji na poziomie bazy danych

4. **Obsługa błędów**:
   - Implementacja funkcji do obsługi różnych przypadków błędów
   - Zwracanie odpowiednich kodów HTTP i komunikatów błędów

5. **Mapowanie danych**:
   - Funkcje mapujące dane z bazy do formatu odpowiedzi API

6. **Dokumentacja**:
   - Aktualizacja dokumentacji API

7. **Monitorowanie**:
   - Dodanie logów dla celów debugowania
   - Implementacja metryk wydajności 